// commands/install/uninstall.ts — Single owner of all uninstall logic. (P2.T5-P2.T8)
//
// runUninstall(modules, ctx) orchestrates:
//   1. For each installed file — single dispatch on entry.format:
//      - "json"            : stripTier2JsonScope (strip bkit-owned JSON scope)
//      - "markered-text"   : stripManagedBlock, remove file if empty remainder
//      - "byte-equal-text" : delete only if unchanged since bkit wrote it (canonicalHashes)
//   2. package.json: the `bkit` install-state block (full/core uninstall). Scripts and
//      devDeps are the consumer's — the bkit:gate:* names included — and are left alone.
//   2b. docs/ (full/core uninstall): bkit's managed block stripped from every installed
//      `docs/*.md`, the owned `docs/templates/bkit-*.md` deleted.
//   3. .agents/ mirror files (bkit-prefix .md files in .claude/ .cursor/)
//
// Flags:
//   --dry-run       print decision table (FILE / DECISION / REASON) without writes
//   --force         override the byte-equal-text hash guard (delete even if consumer modified)
//   --nuke          confirm prompt then wipe ALL bkit-managed files regardless of format
//   --yes           skip interactive confirm for --nuke
//
// Observability: console.error("[bkit-uninstall] …") for all error paths.
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { stripManagedBlock, detectMarkerStyle } from "../../install/managed-block.js";
import { readTemplate } from "../../render/parts.js";
import { getInstallManifest, } from "../../install/manifest.js";
import { isConsumerModified, mergeCanonicalHashes, readBkitVersion, writeBkitVersion, } from "../../install/version-file.js";
import { getPkgRoot, getSharedRoot, findTemplateSource, TEMPLATE_COPIES_DIR, } from "../../shared/package-roots.js";
import { PAYLOAD_LINKS } from "../../install/payload-links.js";
import { removeOpencodeProviderBlock, renderOpencodeJson } from "../../install/modules/opencode.js";
import { CLAUDE_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH, resolveClaudeDerivedAllows, } from "../../install/cloud-env.js";
import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
// ---------------------------------------------------------------------------
// stripTier2JsonScope — remove bkit-owned JSON scope from consumer doc (BAR-167 Phase 1)
//
// Pure function — no file I/O.
//
// Algorithm:
//   1. Deep-clone consumer to `out`.
//   2. Walk template; for each leaf path `p`:
//      - If `out[p]` deep-equals template[p] → delete it from `out`.
//      - Else leave it (consumer has customised it — preserve).
//   3. Prune empty intermediate objects ONLY where template populated them
//      (NOT arrays; NOT consumer-only siblings).
//   4. Return `out`.
//
// Consumer-only keys at any level are preserved byte-identical.
// ---------------------------------------------------------------------------
/**
 * Detect the tracker bkit seeded into opencode.json from its mcp keys. The template ships an
 * `@@OPENCODE_TRACKER_MCP@@` sentinel KEY that renders to `github` / `linear` at install, so a
 * strip-scope keyed on the raw template never matches — these detectors let uninstall render the
 * template the same way the install did before stripping. Keyed on bkit's known tracker names so
 * a consumer-added mcp server is never mistaken for bkit's.
 */
function detectOpencodeTracker(doc) {
    const mcp = doc.mcp;
    if (mcp !== null && typeof mcp === "object" && !Array.isArray(mcp)) {
        if ("github" in mcp)
            return "github";
        if ("linear" in mcp)
            return "linear";
    }
    return "none";
}
/** Detect the opencode provider key bkit seeded (the first `provider` block key). */
function detectOpencodeProvider(doc) {
    const provider = doc.provider;
    if (provider !== null && typeof provider === "object" && !Array.isArray(provider)) {
        const keys = Object.keys(provider);
        if (keys.length > 0) {
            const first = keys[0];
            // Zen block is keyed `opencode` (built-in id); map back to the bkit CLI key.
            return first === "opencode" ? "opencode-zen" : first;
        }
    }
    return "opencode-zen";
}
export function stripTier2JsonScope(consumerDoc, templateDoc) {
    const out = JSON.parse(JSON.stringify(consumerDoc));
    _stripScope(out, templateDoc);
    return out;
}
function _stripScope(consumer, template) {
    for (const key of Object.keys(template)) {
        const tVal = template[key];
        const cVal = consumer[key];
        if (cVal === undefined)
            continue; // consumer doesn't have it — nothing to strip
        if (tVal !== null &&
            typeof tVal === "object" &&
            !Array.isArray(tVal) &&
            cVal !== null &&
            typeof cVal === "object" &&
            !Array.isArray(cVal)) {
            // Both plain objects — recurse into them
            const tObj = tVal;
            const cObj = cVal;
            _stripScope(cObj, tObj);
            // Prune empty intermediate only if template populated this key
            if (Object.keys(cObj).length === 0) {
                delete consumer[key];
            }
        }
        else if (Array.isArray(tVal) && Array.isArray(cVal)) {
            // Both arrays — strip ELEMENT-WISE, not whole-array: install enriches some lists
            // after rendering the template (apex-domain `WebFetch` entries in
            // `.claude/settings.json` `permissions.allow`).
            const tSerialised = new Set(tVal.map((el) => JSON.stringify(el)));
            const kept = cVal.filter((el) => !tSerialised.has(JSON.stringify(el)));
            if (kept.length === 0) {
                delete consumer[key];
            }
            else {
                consumer[key] = kept;
            }
        }
        else {
            // Leaf (primitive, null) — remove if deep-equal to template
            if (JSON.stringify(cVal) === JSON.stringify(tVal)) {
                delete consumer[key];
            }
            // else: consumer has a different value — preserve it
        }
    }
}
// `.mcp.json` / `.cursor/mcp.json`: bkit owns only its tracker entry under `mcpServers`
// (reconcileMcpJson), so uninstall removes exactly that, never a leaf-by-leaf strip.
const MCP_JSON_RELPATHS = new Set([".mcp.json", path.join(".cursor", "mcp.json")]);
/**
 * Remove each `mcpServers` entry that is identical to a tracker entry in the template — the
 * entry bkit wrote. A consumer's own servers, and a bkit entry the consumer edited, stay. Drops
 * `mcpServers` once empty, so a file bkit wrote alone strips to `{}` (deleted by the caller).
 * Pure function — no file I/O.
 */
export function stripMcpTrackerEntries(consumer, template) {
    const out = JSON.parse(JSON.stringify(consumer));
    const servers = out.mcpServers;
    const owned = template.mcpServers;
    if (!isJsonObject(servers) || !isJsonObject(owned))
        return out;
    for (const [key, entry] of Object.entries(owned)) {
        if (JSON.stringify(servers[key]) === JSON.stringify(entry))
            delete servers[key];
    }
    if (Object.keys(servers).length === 0)
        delete out.mcpServers;
    return out;
}
function isJsonObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
// ---------------------------------------------------------------------------
// Decision table builder (for --dry-run output and UninstallResult)
// ---------------------------------------------------------------------------
/**
 * Build a decision table for all files that would be affected by uninstall.
 * Does NOT perform any writes.
 */
// Core doctrine files installed by the templates pass (runCoreTemplates), NOT the manifest —
// so the manifest-driven table never sees them and a full uninstall would orphan bkit's own
// rules/docs. Each carries a bkit managed block (markered-text), so strip-block preserves any
// consumer content added below `bkit:end`, exactly like the root AGENTS.md. Removed only on a
// full/core uninstall (gated on core in moduleList below).
const CORE_TEMPLATE_DOCTRINE = [
    { path: ".agents/context.md", format: "markered-text", module: "core" },
    { path: ".agents/docs.md", format: "markered-text", module: "core" },
    { path: ".agents/rules.md", format: "markered-text", module: "core" },
    { path: ".agents/skills.md", format: "markered-text", module: "core" },
];
/**
 * The top-level `docs/*.md` the core payload pass installs: each carries bkit's managed
 * block (`bkit:start` / `bkit:end`, managed marker inside), so uninstall strips the block
 * and keeps the consumer's content, exactly like `.agents/*.md`. The payload's
 * `shared/docs/` holds only these block docs; `docs/capabilities.md` is a template
 * (copied, never installed) and is left alone.
 */
function coreDocEntries() {
    const dir = path.join(getSharedRoot(), "docs");
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith(".md"))
        .map((e) => ({
        path: path.join("docs", e.name),
        format: "markered-text",
        module: "core",
    }));
}
/** Prefix of the bkit-owned files under `docs/templates/`; uninstall deletes them whole. */
const DOCS_TEMPLATES_DIR = path.join("docs", "templates");
const isOwnedDocsTemplate = (name) => name.startsWith("bkit-") && name.endsWith(".md");
export function buildDecisionTable(modules, ctx) {
    const moduleList = modules instanceof Set
        ? [...modules].filter((m) => 
        // Includes the opt-in add-ons (cloud) a Set caller passes.
        ["core", "claude", "cursor", "opencode", "codex", "cloud"].includes(m))
        : modules;
    const entries = [
        ...getInstallManifest(moduleList),
        ...(moduleList.includes("core") ? [...CORE_TEMPLATE_DOCTRINE, ...coreDocEntries()] : []),
    ];
    // The hash of every owned file as bkit last wrote it.
    const versionFilePath = path.join(ctx.cwd, ".bkit", "version");
    const canonicalHashes = readBkitVersion(versionFilePath)?.canonicalHashes ?? {};
    const table = [];
    const seen = new Set();
    for (const entry of entries) {
        const absPath = path.join(ctx.cwd, entry.path);
        const key = entry.path;
        if (seen.has(key))
            continue; // deduplicate (a path listed by more than one module)
        seen.add(key);
        if (!fs.existsSync(absPath)) {
            table.push({
                file: entry.path,
                decision: "skip-absent",
                reason: "file not found — nothing to do",
                format: entry.format,
            });
            continue;
        }
        if (ctx.nuke) {
            // Nuke: delete everything regardless of format
            table.push({
                file: entry.path,
                decision: "delete",
                reason: "--nuke: forcibly remove",
                format: entry.format,
            });
            continue;
        }
        // Single dispatch on entry.format
        switch (entry.format) {
            case "json": {
                // JSON deep-containment: strip bkit-owned scope from consumer doc
                // For uninstall, treat as strip-block (handled in runUninstall via stripTier2JsonScope)
                table.push({
                    file: entry.path,
                    decision: "strip-block",
                    reason: "json (deep-containment) — strip bkit-owned scope, preserve consumer keys",
                    format: "json",
                });
                break;
            }
            case "markered-text": {
                const content = fs.readFileSync(absPath, "utf-8");
                const style = detectMarkerStyle(content);
                if (!style) {
                    table.push({
                        file: entry.path,
                        decision: "preserve",
                        reason: "markered-text but no bkit markers found — 100% consumer content",
                        format: "markered-text",
                    });
                }
                else {
                    table.push({
                        file: entry.path,
                        decision: "strip-block",
                        reason: "markered-text — strip bkit block, preserve consumer content",
                        format: "markered-text",
                    });
                }
                break;
            }
            case "byte-equal-text": {
                // .bkit/version is bkit's own install-state manifest (pinnedVersion + hashes), never
                // consumer content. It records no hash for itself, so the generic hash-guard preserves it
                // as "consumer-modified" — leaving bkit state behind after a full teardown. It is
                // `module: core`, so it only reaches this table on a full/core uninstall; delete it there
                // (zero-footprint). A targeted (non-core) uninstall never sees it, so the modules that
                // remain keep working. The hashes are read into memory before the delete loop, so
                // removing this file mid-loop cannot affect any other file's decision.
                if (entry.path === ".bkit/version") {
                    table.push({
                        file: entry.path,
                        decision: "delete",
                        reason: "bkit install-state manifest — removed on full/core uninstall",
                        format: "byte-equal-text",
                    });
                    break;
                }
                if (ctx.force) {
                    table.push({
                        file: entry.path,
                        decision: "delete",
                        reason: "--force: delete byte-equal-text regardless of hash",
                        format: "byte-equal-text",
                    });
                    break;
                }
                if (canonicalHashes[entry.path] === undefined) {
                    table.push({
                        file: entry.path,
                        decision: "skip-unknown",
                        reason: "byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it)",
                        format: "byte-equal-text",
                    });
                }
                else if (!isConsumerModified(entry.path, absPath, canonicalHashes)) {
                    table.push({
                        file: entry.path,
                        decision: "delete",
                        reason: "byte-equal-text: content matches install-time hash — safe to delete",
                        format: "byte-equal-text",
                    });
                }
                else {
                    table.push({
                        file: entry.path,
                        decision: "skip-modified",
                        reason: "byte-equal-text: content differs from install-time hash — consumer modified, preserve",
                        format: "byte-equal-text",
                    });
                }
                break;
            }
        }
    }
    // `docs/templates/bkit-*.md` are bkit-owned whole (the audit templates and the plan
    // template); the consumer's own files in that folder stay. Full/core uninstall only.
    const templatesDir = path.join(ctx.cwd, DOCS_TEMPLATES_DIR);
    if (moduleList.includes("core") && fs.existsSync(templatesDir)) {
        for (const name of fs.readdirSync(templatesDir).sort()) {
            const rel = path.join(DOCS_TEMPLATES_DIR, name);
            if (!isOwnedDocsTemplate(name) || seen.has(rel))
                continue;
            if (!fs.statSync(path.join(ctx.cwd, rel)).isFile())
                continue;
            seen.add(rel);
            table.push({
                file: rel,
                decision: "delete",
                reason: "bkit-owned docs template — removed on full/core uninstall",
                format: "markered-text",
            });
        }
    }
    return table;
}
// ---------------------------------------------------------------------------
// Format dry-run decision table
// ---------------------------------------------------------------------------
/**
 * Format a decision table as a human-readable string.
 * Format: FILE | DECISION | REASON
 */
export function formatDecisionTable(table) {
    if (table.length === 0)
        return "[bkit-uninstall] No files to process.\n";
    const COL_FILE = 48;
    const COL_DEC = 22;
    const header = `${"FILE".padEnd(COL_FILE)} | ${"DECISION".padEnd(COL_DEC)} | REASON\n` +
        `${"-".repeat(COL_FILE)}-+-${"-".repeat(COL_DEC)}-+-${"-".repeat(40)}\n`;
    const rows = table
        .map((r) => `${r.file.padEnd(COL_FILE)} | ${r.decision.padEnd(COL_DEC)} | ${r.reason}`)
        .join("\n");
    return header + rows + "\n";
}
// ---------------------------------------------------------------------------
// Prompt helper (--nuke confirmation)
// ---------------------------------------------------------------------------
async function confirmNuke() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question("[bkit-uninstall] --nuke will delete ALL bkit-managed files. Type 'yes' to confirm: ", (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "yes");
        });
    });
}
// ---------------------------------------------------------------------------
// runUninstall — main orchestrator
// ---------------------------------------------------------------------------
/**
 * Perform the uninstall operation for the given modules.
 * Returns an UninstallResult describing what was done.
 */
export async function runUninstall(modules, ctx) {
    const result = {
        deleted: [],
        stripped: [],
        preserved: [],
        decisions: [],
        dryRun: ctx.dryRun,
    };
    const moduleList = modules instanceof Set
        ? [...modules].filter((m) => 
        // Includes the opt-in add-ons (cloud) a Set caller passes.
        ["core", "claude", "cursor", "opencode", "codex", "cloud"].includes(m))
        : modules;
    // Nuke confirmation
    if (ctx.nuke && !ctx.yes && !ctx.dryRun) {
        const confirmed = await confirmNuke();
        if (!confirmed) {
            console.log(`${ctx.logPrefix} --nuke cancelled.`);
            return result;
        }
    }
    const table = buildDecisionTable(moduleList, ctx);
    result.decisions = table;
    if (ctx.dryRun) {
        console.log(`${ctx.logPrefix} [dry-run] Decision table:`);
        console.log(formatDecisionTable(table));
    }
    const seen = new Set();
    for (const summary of table) {
        if (seen.has(summary.file))
            continue;
        seen.add(summary.file);
        const absPath = path.join(ctx.cwd, summary.file);
        switch (summary.decision) {
            case "skip-absent":
            case "skip-modified":
            case "skip-unknown":
            case "preserve": {
                result.preserved.push(summary.file);
                if (!ctx.dryRun) {
                    console.log(`${ctx.logPrefix} preserve: ${summary.file} (${summary.reason})`);
                }
                break;
            }
            case "delete": {
                result.deleted.push(summary.file);
                if (!ctx.dryRun) {
                    try {
                        fs.rmSync(absPath, { force: true });
                        console.log(`${ctx.logPrefix} delete: ${summary.file}`);
                    }
                    catch (err) {
                        console.error(`${ctx.logPrefix} error deleting ${summary.file}: ${err.message}`);
                    }
                }
                break;
            }
            case "strip-block": {
                if (!ctx.dryRun) {
                    try {
                        if (summary.format === "json") {
                            // JSON deep-containment: strip bkit-owned scope, preserve consumer keys
                            const templatePath = findTemplateSource(summary.file);
                            if (templatePath === null || !fs.existsSync(templatePath)) {
                                // No payload source — preserve as-is
                                console.warn(`${ctx.logPrefix} no template found for ${summary.file} — preserving`);
                                result.preserved.push(summary.file);
                                break;
                            }
                            const raw = fs.readFileSync(absPath, "utf-8");
                            const consumerDoc = JSON.parse(raw);
                            let templateRaw = fs.readFileSync(templatePath, "utf-8");
                            // opencode.json ships `@@OPENCODE_*@@` sentinel KEYS that render to the consumer's
                            // tracker / provider at install; strip-scope keyed on the RAW template never matches
                            // the rendered keys, so bkit's mcp + provider blocks (a token-referencing config)
                            // survive a full uninstall. Render the template with the consumer's OWN tracker +
                            // provider first so the keys line up and the bkit-owned scope strips cleanly.
                            if (templateRaw.includes("@@OPENCODE_TRACKER_MCP@@")) {
                                templateRaw = renderOpencodeJson(templatePath, detectOpencodeTracker(consumerDoc), detectOpencodeProvider(consumerDoc));
                            }
                            const templateDoc = JSON.parse(templateRaw);
                            // `.claude/settings.json` is not written verbatim: after rendering the
                            // template, install appends one `WebFetch(domain:<d>)` grant per entry in
                            // the resolved network allowlist and `mcp__…` grants per declared MCP
                            // server (enrichClaudeSettingsAllows). Stripping
                            // against the RAW template leaves those grants behind as if the consumer
                            // had added them. Recompute the same set — the very function that produced
                            // them — and treat it as part of the template, exactly as the opencode.json
                            // sentinel render above does.
                            if (summary.file === path.join(".claude", "settings.json")) {
                                const perms = templateDoc.permissions;
                                if (perms !== null && typeof perms === "object" && !Array.isArray(perms)) {
                                    const permsObj = perms;
                                    const allow = permsObj.allow;
                                    if (Array.isArray(allow)) {
                                        const enriched = resolveClaudeDerivedAllows(ctx.cwd);
                                        permsObj.allow = [
                                            ...allow,
                                            ...enriched.filter((e) => !allow.includes(e)),
                                        ];
                                    }
                                }
                            }
                            const stripped = MCP_JSON_RELPATHS.has(summary.file)
                                ? stripMcpTrackerEntries(consumerDoc, templateDoc)
                                : stripTier2JsonScope(consumerDoc, templateDoc);
                            const strippedJson = JSON.stringify(stripped, null, 2) + "\n";
                            if (Object.keys(stripped).length === 0) {
                                // All keys were bkit-owned → delete file
                                fs.rmSync(absPath, { force: true });
                                result.deleted.push(summary.file);
                                console.log(`${ctx.logPrefix} delete (empty after JSON scope strip): ${summary.file}`);
                            }
                            else {
                                fs.writeFileSync(absPath, strippedJson, "utf-8");
                                result.stripped.push(summary.file);
                                console.log(`${ctx.logPrefix} strip-json-scope: ${summary.file}`);
                            }
                        }
                        else {
                            // markered-text: strip bkit marker block, preserve consumer content
                            const content = fs.readFileSync(absPath, "utf-8");
                            const style = detectMarkerStyle(content) ?? "html-comment";
                            const stripped = stripManagedBlock(content, style);
                            // A bkit-seeded markdown file (AGENTS.md, CLAUDE.md) keeps its `# Title` H1
                            // OUTSIDE the bkit block. A markdown file reduced to a lone ATX heading (its only
                            // non-blank line) is a husk and is deleted. Scoped to .md/.mdc (shell/gitignore
                            // residue such as a lone `# comment` is unaffected); a multi-line residual (e.g.
                            // prompts.md's consumer `## Model Overrides`) is preserved.
                            const nonBlank = stripped.split("\n").filter((l) => l.trim().length > 0);
                            const isMarkdown = /\.mdc?$/.test(summary.file);
                            const isLoneHeadingHusk = isMarkdown && nonBlank.length === 1 && /^#{1,6}\s+\S/.test(nonBlank[0].trim());
                            // A file whose post-strip residual equals the bkit-seeded scaffold OUTSIDE the block
                            // (i.e. the template stripped the same way) carries NO genuine consumer content — it is
                            // 100% bkit-authored (hook shells left with only a shebang/header, a `.mdc` frontmatter
                            // shell, a pristine prompts.md) and is deleted. A consumer who added content outside
                            // the block strips UNEQUAL → preserved. Read is covered by the enclosing try/catch.
                            const normResidual = (s) => s
                                .split("\n")
                                .map((l) => l.replace(/[ \t]+$/, ""))
                                .join("\n")
                                .trim();
                            let isBkitOnlyScaffold = false;
                            const markeredTemplatePath = findTemplateSource(summary.file);
                            if (markeredTemplatePath !== null && fs.existsSync(markeredTemplatePath)) {
                                const templateContent = readTemplate(markeredTemplatePath);
                                const templateStripped = stripManagedBlock(templateContent, detectMarkerStyle(templateContent) ?? style);
                                isBkitOnlyScaffold = normResidual(stripped) === normResidual(templateStripped);
                            }
                            if (stripped.trim().length === 0 || isLoneHeadingHusk || isBkitOnlyScaffold) {
                                // File is now empty (or a bkit-seeded heading husk) → delete it
                                fs.rmSync(absPath, { force: true });
                                result.deleted.push(summary.file);
                                console.log(`${ctx.logPrefix} delete (empty after strip): ${summary.file}`);
                            }
                            else {
                                fs.writeFileSync(absPath, stripped, "utf-8");
                                result.stripped.push(summary.file);
                                console.log(`${ctx.logPrefix} strip-block: ${summary.file}`);
                            }
                        }
                    }
                    catch (err) {
                        console.error(`${ctx.logPrefix} error stripping block from ${summary.file}: ${err.message}`);
                    }
                }
                else {
                    result.stripped.push(summary.file);
                }
                break;
            }
        }
    }
    // Full/core uninstall: strip the `bkit` install-state object from package.json
    // (issueTracker / opencodeProvider(s) / cloudAgents), whatever keys it holds. Scripts
    // and devDeps are the consumer's and stay. No try/catch — malformed package.json is a hard failure on full
    // teardown (same as a missing dest would be).
    if (moduleList.includes("core") && !ctx.dryRun) {
        const pkgPath = path.join(ctx.cwd, "package.json");
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            if (pkg.bkit !== undefined) {
                delete pkg.bkit;
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
                console.log(`${ctx.logPrefix} package.json: removed bkit install-state block`);
                result.stripped.push("package.json#bkit");
            }
        }
    }
    // Clean up .agents/ bkit-prefix mirror files
    // (.claude/commands/bkit-*.md, .claude/agents/bkit-*.md, .opencode/agents/bkit-*.md, etc.)
    if (!ctx.dryRun) {
        const mirrorDirs = [
            // Each host's mirror dirs are gated on its own module so a targeted
            // uninstall (e.g. --claude / --auto) leaves other hosts
            // untouched — symmetric with install. A bare/full uninstall populates
            // moduleList with every host, so all mirrors are still swept then.
            ...(moduleList.includes("claude") ? [".claude/commands", ".claude/agents"] : []),
            ...(moduleList.includes("cursor") ? [".cursor/commands", ".cursor/agents"] : []),
            // opencode mirrors (plural dir names per opencode.ai/docs)
            ...(moduleList.includes("opencode") ? [".opencode/agents", ".opencode/commands"] : []),
            // codex agent mirrors. The workflow skills under `.agents/skills/bkit-*` are swept
            // separately below: `.agents/skills/` is SHARED with third-party skills installed via
            // skills.sh, so the directory itself must never be removed wholesale.
            ...(moduleList.includes("codex") ? [".codex/agents"] : []),
        ];
        for (const dir of mirrorDirs) {
            const absDir = path.join(ctx.cwd, dir);
            if (!fs.existsSync(absDir))
                continue;
            try {
                for (const f of fs.readdirSync(absDir)) {
                    // .toml as well as .md: codex agent mirrors are TOML.
                    if (!f.startsWith("bkit-") || !(f.endsWith(".md") || f.endsWith(".toml")))
                        continue;
                    const absFile = path.join(absDir, f);
                    fs.rmSync(absFile, { force: true });
                    result.deleted.push(path.join(dir, f));
                    console.log(`${ctx.logPrefix} delete mirror: ${path.join(dir, f)}`);
                }
            }
            catch (err) {
                console.error(`${ctx.logPrefix} error cleaning up ${dir}: ${err.message}`);
            }
        }
        // Workflow skills: `.agents/skills/` is SHARED with third-party skills installed via
        // skills.sh, so only the bkit-prefixed DIRECTORIES are removed — never the parent.
        if (moduleList.includes("codex")) {
            const skillsDir = path.join(ctx.cwd, ".agents", "skills");
            if (fs.existsSync(skillsDir)) {
                try {
                    for (const d of fs.readdirSync(skillsDir)) {
                        if (!d.startsWith("bkit-"))
                            continue;
                        const abs = path.join(skillsDir, d);
                        if (!fs.statSync(abs).isDirectory())
                            continue;
                        fs.rmSync(abs, { recursive: true, force: true });
                        result.deleted.push(path.join(".agents/skills", d));
                        console.log(`${ctx.logPrefix} delete mirror: ${path.join(".agents/skills", d)}`);
                    }
                }
                catch (err) {
                    const msg = err.message;
                    console.error(`${ctx.logPrefix} error cleaning up .agents/skills: ${msg}`);
                }
            }
        }
    }
    // Remove the generated `.claude/bkit-cloud.md` (untracked, gitignored — holds resolved
    // secrets). It is not in the manifest, so the table-driven pass never sees it;
    // delete it explicitly when the claude host is uninstalled so a live-secrets file
    // is never left behind. Pushed to result.deleted so a dry-run reports it too.
    if (moduleList.includes("claude")) {
        const cloudAbs = path.join(ctx.cwd, CLAUDE_CLOUD_RELPATH);
        if (fs.existsSync(cloudAbs)) {
            result.deleted.push(CLAUDE_CLOUD_RELPATH);
            if (!ctx.dryRun) {
                fs.rmSync(cloudAbs, { force: true });
                console.log(`${ctx.logPrefix} delete: ${CLAUDE_CLOUD_RELPATH} (generated cloud setup doc)`);
            }
        }
    }
    // Same for the Cursor twin `.cursor/bkit-cloud.md` (writeCursorCloudDoc) — untracked,
    // gitignored, holds resolved secrets; delete it explicitly when the cursor host is
    // uninstalled so a live-secrets file is never left behind.
    if (moduleList.includes("cursor")) {
        const cloudAbs = path.join(ctx.cwd, CURSOR_CLOUD_RELPATH);
        if (fs.existsSync(cloudAbs)) {
            result.deleted.push(CURSOR_CLOUD_RELPATH);
            if (!ctx.dryRun) {
                fs.rmSync(cloudAbs, { force: true });
                console.log(`${ctx.logPrefix} delete: ${CURSOR_CLOUD_RELPATH} (generated cloud setup doc)`);
            }
        }
    }
    // Full/core uninstall: the consumer's template copies (`.bkit/templates/`) are
    // bkit's folder, refreshed whole on every install and upgrade, so they go whole.
    // Never in dogfood, where that folder is bkit's own template source. Adopted copies
    // elsewhere in the repo stay.
    if (moduleList.includes("core")) {
        const templatesDir = path.join(ctx.cwd, TEMPLATE_COPIES_DIR);
        if (path.resolve(ctx.cwd) !== getPkgRoot() && fs.existsSync(templatesDir)) {
            result.deleted.push(TEMPLATE_COPIES_DIR);
            if (!ctx.dryRun) {
                fs.rmSync(templatesDir, { recursive: true, force: true });
                console.log(`${ctx.logPrefix} delete: ${TEMPLATE_COPIES_DIR}/`);
            }
        }
    }
    // Full/core uninstall: the payload view links (`.bkit/core`, `.bkit/shared`) are
    // bkit-created symlinks into the package and go with it. Symlinks ONLY — a real
    // directory or file at that path is consumer content (install's no-clobber guard)
    // and stays. Never in dogfood, where `.bkit/core` is bkit's own source.
    if (moduleList.includes("core") && path.resolve(ctx.cwd) !== getPkgRoot()) {
        for (const { relPath } of PAYLOAD_LINKS) {
            const linkAbs = path.join(ctx.cwd, relPath);
            let st = null;
            try {
                st = fs.lstatSync(linkAbs);
            }
            catch {
                st = null; // absent
            }
            if (st?.isSymbolicLink() !== true)
                continue;
            result.deleted.push(relPath);
            if (!ctx.dryRun) {
                fs.rmSync(linkAbs, { force: true });
                console.log(`${ctx.logPrefix} delete: ${relPath} (payload view link)`);
            }
        }
    }
    // Prune bkit-authored dirs left empty by the deletions above (e.g. .claude/agents,
    // .claude/hooks). Candidates are the parent
    // dirs of everything deleted, plus their ancestors; each is removed ONLY when it is actually
    // empty (never touches a dir still holding consumer files), deepest-first so the removal
    // cascades up. Skipped in dry-run — nothing was deleted, so nothing is empty to report.
    if (!ctx.dryRun) {
        const dirCandidates = new Set();
        for (const rel of result.deleted) {
            let dir = path.dirname(rel);
            while (dir && dir !== "." && dir !== path.sep) {
                dirCandidates.add(dir);
                dir = path.dirname(dir);
            }
        }
        const byDepthDesc = [...dirCandidates].sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
        for (const rel of byDepthDesc) {
            const absDir = path.join(ctx.cwd, rel);
            // rmdirSync removes ONLY an empty dir (throws on non-empty) — the emptiness check
            // above makes it a no-op on any dir still holding consumer files. Single-threaded, so
            // the check and the remove cannot race.
            if (fs.existsSync(absDir) && fs.readdirSync(absDir).length === 0) {
                fs.rmdirSync(absDir);
                console.log(`${ctx.logPrefix} prune empty dir: ${rel}`);
            }
        }
    }
    // Targeted (non-core) uninstall: `.bkit/version` stays (the modules that remain read it),
    // but its canonicalHashes still list every path this run deleted — absent entries that
    // `mergeCanonicalHashes` prunes. Left in place, the very next `bkit check` (a dry-run
    // install whose core postDispatch prunes the same absent paths) reports write-drift on
    // `.bkit/version` and fails the CI gate. Recompute and rewrite here so the on-disk manifest
    // already matches what the next check would produce. A full/core uninstall deletes the file
    // earlier instead (zero footprint) and never reaches this branch.
    if (!moduleList.includes("core")) {
        const versionFile = path.join(ctx.cwd, ".bkit", "version");
        const existing = readBkitVersion(versionFile);
        if (existing) {
            const { canonicalHashes, pruned } = mergeCanonicalHashes(ctx.cwd, existing.canonicalHashes, {});
            if (pruned > 0) {
                console.log(`${ctx.logPrefix}${ctx.dryRun ? " [dry-run]" : ""} update version pin: .bkit/version (pruned ${pruned})`);
                if (!ctx.dryRun) {
                    writeBkitVersion(versionFile, { ...existing, canonicalHashes });
                }
            }
        }
    }
    return result;
}
// ---------------------------------------------------------------------------
// runSurgicalOpencodeUninstall — remove exactly ONE provider block
// ---------------------------------------------------------------------------
/**
 * Surgical removal of a single opencode provider installed by bkit.
 *
 * Distinct from bare `bkit uninstall --opencode` (full host teardown):
 *   - Removes the provider block from `.opencode/opencode.json`
 *   - Updates `bkit.opencodeProviders` in `package.json`
 *   - If the removed provider was the active one, re-points `bkit.opencodeProvider`
 *     to the first remaining provider and emits a re-render advisory
 *   - If no providers remain, falls through to full host teardown via `runUninstall`
 */
export async function runSurgicalOpencodeUninstall(providerKey, dryRun, cwd) {
    const LOG_PREFIX = "[bkit-uninstall]";
    const tag = dryRun ? " (dry-run)" : "";
    const jsonDst = path.join(cwd, ".opencode", "opencode.json");
    const ws = { writes: [] };
    // 1. Remove provider block from opencode.json
    removeOpencodeProviderBlock(jsonDst, providerKey, dryRun, ws);
    if (ws.writes.length > 0) {
        console.log(`${LOG_PREFIX}${tag} removed provider block "${providerKey}" from opencode.json`);
    }
    // 2. Update bkit.opencodeProviders in package.json (read inline — no detectOpencodeProviders import)
    const pkgPath = path.join(cwd, "package.json");
    let remainingProviders = [];
    let wasActive = false;
    let newActive = null;
    if (fs.existsSync(pkgPath)) {
        const raw = fs.readFileSync(pkgPath, "utf-8");
        // Parse-or-sentinel idiom: keep the early-return outside the catch body.
        let pkg = null;
        try {
            pkg = JSON.parse(raw);
        }
        catch {
            pkg = null;
        }
        if (pkg === null) {
            console.warn(`${LOG_PREFIX} package.json is malformed — skipping bkit section update`);
            return;
        }
        const bkit = (pkg.bkit ?? {});
        const arr = Array.isArray(bkit.opencodeProviders)
            ? [...bkit.opencodeProviders]
            : [];
        remainingProviders = arr.filter((p) => p !== providerKey);
        wasActive = bkit.opencodeProvider === providerKey;
        if (wasActive && remainingProviders.length > 0) {
            newActive = remainingProviders[0];
        }
        if (!dryRun) {
            bkit.opencodeProviders = remainingProviders;
            if (wasActive) {
                if (newActive !== null) {
                    bkit.opencodeProvider = newActive;
                }
                else {
                    delete bkit.opencodeProvider;
                }
            }
            pkg.bkit = bkit;
            const indentMatch = raw.match(/\n([ \t]+)"/);
            const indent = indentMatch ? indentMatch[1] : "  ";
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + "\n", "utf-8");
            console.log(`${LOG_PREFIX} updated package.json: opencodeProviders=[${remainingProviders.join(", ")}]` +
                (wasActive ? ` opencodeProvider=${newActive ?? "(removed)"}` : ""));
        }
    }
    // 3. If none remain → full host teardown
    if (remainingProviders.length === 0) {
        console.log(`${LOG_PREFIX}${tag} no providers remain — triggering full opencode host teardown...`);
        await runUninstall(["opencode"], {
            cwd,
            dryRun,
            force: false,
            nuke: false,
            yes: false,
            logPrefix: LOG_PREFIX,
        });
        return;
    }
    // 4. If was active → emit advisory (re-rendering agents requires full ModuleContext)
    if (wasActive && newActive !== null) {
        console.log(`${LOG_PREFIX}${tag} active provider switched to "${newActive}". ` +
            `Run \`bkit install --opencode=${newActive}\` or \`bkit upgrade\` to re-render agent frontmatter.`);
    }
}
export async function runUninstallCommand(modules, opencodeProvider, uninstallFlags) {
    setLogPrefix("[bkit-uninstall]");
    // Surgical single-provider removal: `uninstall --opencode=<provider>`
    if (modules.has("opencode") && opencodeProvider !== null) {
        const tag = uninstallFlags.dryRun ? " (dry-run)" : "";
        console.log(`${LOG_PREFIX} Surgical opencode uninstall: removing provider "${opencodeProvider}"${tag}...`);
        await runSurgicalOpencodeUninstall(opencodeProvider, uninstallFlags.dryRun, process.cwd());
        return;
    }
    const uninstallCtx = {
        cwd: process.cwd(),
        dryRun: uninstallFlags.dryRun,
        force: uninstallFlags.force,
        nuke: uninstallFlags.nuke,
        yes: uninstallFlags.yes,
        logPrefix: LOG_PREFIX,
    };
    const moduleList = [...modules];
    console.log(`${LOG_PREFIX} Running uninstall${uninstallCtx.dryRun ? " (dry-run)" : ""}...`);
    const result = await runUninstall(moduleList, uninstallCtx);
    const totalDeleted = result.deleted.length;
    const totalStripped = result.stripped.length;
    const totalPreserved = result.preserved.length;
    if (uninstallCtx.dryRun) {
        console.log(`${LOG_PREFIX} [dry-run] Would delete: ${totalDeleted}, strip: ${totalStripped}, preserve: ${totalPreserved}`);
    }
    else {
        console.log(`${LOG_PREFIX} Done. Deleted: ${totalDeleted}, stripped: ${totalStripped}, preserved: ${totalPreserved}`);
    }
}
