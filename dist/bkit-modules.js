// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, printSink, ws }
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → ci → lint → git-hooks
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { writeTier1, writeTier2, writeTier3, writeTier2JsonContained, deepContains, deepMergeJson, migrateLegacyBkitEnvelope, ensurePackageJsonScripts, ensurePackageJsonDevDeps, } from "./bkit-tiers.js";
import { readBkitVersion, writeBkitVersion, hashFile, stampManagedVersion, } from "./bkit-version.js";
import { applyTokens } from "./bkit-tokens.js";
import { runPayload, applyT1, applyT2, applyT3, applyOpencodeAgent, applyOpencodeCommand, remapTemplateDest, } from "./bkit-install.js";
import { getPkgRoot, getTemplatesRoot, getWorkflowsRoot, getPromptsRoot, getBkitDocsRoot, } from "./bkit-paths.js";
import { getInstallManifest, DEFAULT_ISSUE_TRACKER, } from "./bkit-manifest.js";
import { substituteWorkflow } from "./bkit-trackers.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Persist a `bkit.<field>` value into the consumer's package.json so the
 * post-install advisory can tell "deliberately none" from "undecided". Mirrors
 * the `bkit.issueTracker` persist logic in bkit-install.ts. Used for the opt-in
 * decisions recorded by their owning modules (`depUpdater`, `cloudAgents`). No-op
 * on dry-run or when package.json is absent/unparseable (non-fatal — the config
 * file presence is still the primary signal).
 */
function setConsumerBkitField(field, value, dryRun) {
    if (dryRun)
        return;
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath))
        return;
    try {
        const raw = fs.readFileSync(pkgPath, "utf-8");
        const pkg = JSON.parse(raw);
        const bkit = (pkg.bkit ?? {});
        if (bkit[field] === value)
            return; // already set — avoid a no-op rewrite
        bkit[field] = value;
        pkg.bkit = bkit;
        const indentMatch = raw.match(/\n([ \t]+)"/);
        const indent = indentMatch ? indentMatch[1] : "  ";
        const trailingNewline = raw.endsWith("\n") ? "\n" : "";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
    }
    catch {
        // non-fatal — file presence is the primary signal
    }
}
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function listMdFiles(dir, prefix) {
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => (prefix ? f.startsWith(prefix) : true));
}
function installFile(srcPath, destPath, transform, dryRun) {
    if (!transform) {
        if (fs.existsSync(destPath)) {
            const src = fs.readFileSync(srcPath);
            const dest = fs.readFileSync(destPath);
            if (src.equals(dest))
                return false;
        }
        if (!dryRun)
            fs.copyFileSync(srcPath, destPath);
        return true;
    }
    const src = fs.readFileSync(srcPath, "utf-8");
    const transformed = transform(src);
    if (fs.existsSync(destPath)) {
        const existing = fs.readFileSync(destPath, "utf-8");
        if (existing === transformed)
            return false;
    }
    if (!dryRun)
        fs.writeFileSync(destPath, transformed, "utf-8");
    return true;
}
function removeOrphans(destDir, sourceFiles, dryRun, prefix) {
    const BKIT_PREFIX = "bkit-";
    if (!fs.existsSync(destDir))
        return [];
    const removed = [];
    for (const f of fs.readdirSync(destDir)) {
        if (!f.endsWith(".md"))
            continue;
        if (prefix && !f.startsWith(prefix))
            continue;
        if (!sourceFiles.has(f)) {
            if (!dryRun)
                fs.rmSync(path.join(destDir, f));
            removed.push(f);
        }
    }
    return removed;
}
// Re-export getPkgRoot from bkit-paths (lifted there to break the preflight ↔ modules cycle).
export { getPkgRoot } from "./bkit-paths.js";
// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to ci/lint/git-hooks/claude/cursor modules.
// ---------------------------------------------------------------------------
// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs", ".agents", ".bkit", "scripts"]);
// Top-level template files (non-directory) that belong to core.
// `gitignore` is stored dot-less (npm strips a literal `.gitignore`); `.gitattributes`
// is stored with its dot (npm does not strip it) — see remapTemplateDest / NPM_STRIP_REMAP.
// CLAUDE.md is NOT here (#252): it moved to the `claude` module (a Claude-Code-only root
// redirect, the analog of Cursor's .cursor/rules/00-shared-rules.mdc) — runClaudeModule
// emits it. AGENTS.md (cross-host dispatch router) stays core.
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "gitignore", ".gitattributes"]);
// Files inside .agents/ subtemplate dir that are Tier 3 (seed-or-print) and are
// owned by other modules — skip in the core Tier 2 templates pass to avoid
// double-recording them in the WriteSet. These are written by their owning module.
const AGENTS_SUBTEMPLATE_TIER3_EXCLUDE = new Set([".env.example"]);
// Files that live under a core-owned template dir (e.g. `.bkit/scripts/`) but are
// NOT shipped by the plain core pass — skip them there so the right owner writes them:
//   - `.bkit/scripts/bkit-set-dependabot.sh` ships via `bkit install --dependency=dependabot` only.
// Note: `.bkit/scripts/bkit-mode.sh` was removed in #245 — no longer in templates.
const CORE_TEMPLATE_PATH_EXCLUDE = new Set([
    path.join(".bkit", "scripts", "bkit-set-dependabot.sh"),
    // slop-scan helpers moved to the `lint` module (--typescript) so a non-Node `--ci`
    // consumer never receives them (#265). runLintModule emits them as Tier 1.
    path.join(".bkit", "scripts", "bkit-slop-type-suppression.mjs"),
    path.join(".bkit", "scripts", "bkit-slop-delta.sh"),
]);
// Template subdirectories that belong to non-core modules (skip in core pass)
const NON_CORE_TEMPLATE_DIRS = new Set([
    ".github",
    ".vale",
    ".vale.ini",
    ".husky",
    ".prettierignore",
    ".cursor",
    ".claude",
    ".opencode",
]);
// ---------------------------------------------------------------------------
// guardTemplatesRoot — fail-loud guard for the resolved templates root.
// Exported so tests can inject an arbitrary (non-existent) path and assert
// the guard fires for ANY missing root — not just the literal ".bkit/templates"
// string. This keeps the assertion valid across any future path changes.
//
// Called by runCoreTemplates (below) before any FS access.
// ---------------------------------------------------------------------------
export function guardTemplatesRoot(root, logPrefix = "[bkit-modules]") {
    if (!fs.existsSync(root)) {
        console.error(`${logPrefix} Templates root not found at ${root} — package corrupt?`);
        process.exit(1);
    }
}
// Run templates pass only for core-owned files (top-level md files, docs/, .agents/ subtemplates).
// Each other module handles its own template files directly.
function runCoreTemplates(dryRun, tokens, ws, logPrefix) {
    const root = getTemplatesRoot();
    guardTemplatesRoot(root, logPrefix);
    const tag = dryRun ? "[dry-run] " : "";
    // Process top-level entries
    for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
        const name = ent.name;
        // Skip non-core module dirs/files
        if (NON_CORE_TEMPLATE_DIRS.has(name))
            continue;
        // Only process known core files or core dirs
        if (!CORE_TEMPLATE_FILES.has(name) && !CORE_TEMPLATE_DIRS.has(name) && !ent.isDirectory()) {
            // Allow slop-scan.config.json through (lint module handles it), skip others
            continue;
        }
        if (ent.isDirectory() && !CORE_TEMPLATE_DIRS.has(name))
            continue;
        const srcPath = path.join(root, name);
        if (ent.isFile()) {
            // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
            const dstPath = remapTemplateDest(name);
            const prevLen = ws.writes.length;
            writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}core: ${dstPath}`);
            }
        }
        else if (ent.isDirectory()) {
            // Process the directory recursively
            processCoreTemplateDir(srcPath, name, dryRun, tokens, ws, logPrefix);
        }
    }
    // Note: `.agents/` subtemplates in `templates/.agents/` ARE processed here
    // (via CORE_TEMPLATE_DIRS) so that their managed block is sourced from the
    // template — NOT from bkit's own dogfood `.agents/*.md` (which carries
    // bkit-specific out-of-block content like `### bkit Repo Authoring`). These
    // basenames are listed in COPY_EXCLUDE so copyAdditive does not race the
    // templates pass for the same destination paths (would double-record in
    // dry-run mode otherwise).
}
function processCoreTemplateDir(srcDir, relBase, dryRun, tokens, ws, logPrefix) {
    const tag = dryRun ? "[dry-run] " : "";
    if (!fs.existsSync(srcDir))
        return;
    for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
        // Skip Tier 3 files inside subtemplate dirs (e.g. .bkit/.env.example) — they
        // are owned by their respective modules and written via writeTier3
        // (seed-or-print), not Tier 2.
        if (ent.isFile() &&
            (relBase === ".agents" || relBase === ".bkit") &&
            AGENTS_SUBTEMPLATE_TIER3_EXCLUDE.has(ent.name)) {
            continue;
        }
        const srcPath = path.join(srcDir, ent.name);
        const relPath = path.join(relBase, ent.name);
        if (ent.isDirectory()) {
            processCoreTemplateDir(srcPath, relPath, dryRun, tokens, ws, logPrefix);
        }
        else if (ent.isFile()) {
            // Skip opt-in-module-owned files that happen to live under a core dir.
            if (CORE_TEMPLATE_PATH_EXCLUDE.has(relPath))
                continue;
            const dstPath = relPath;
            const prevLen = ws.writes.length;
            writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}core: ${dstPath}`);
            }
        }
    }
}
// ---------------------------------------------------------------------------
// runCoreModule — payload pass + core templates + .bkit-version (LAST)
// ---------------------------------------------------------------------------
// `.bkit-version` excluded: it's a runtime artifact written by postDispatch,
// never source of truth. Including it would pollute consumer `.agents/` and
// break the dry-run/install parity check (postDispatch suppresses its own
// write when the file already matches pkgVersion).
//
// Tier-2-style `.agents/*.md` files (rules/friction/docs/skills) are excluded
// because they ship as templates under `.bkit/templates/.agents/` and are
// installed by the templates pass. Copying them here additively would dump
// bkit's own out-of-block content (e.g. bkit's `### bkit Repo Authoring` section
// in `rules.md`, bkit's friction-log entries) onto consumers on first install.
const COPY_EXCLUDE = new Set([
    "skills",
    "scripts",
    "README.md",
    ".bkit-version",
    "rules.md",
    "friction.md",
    "docs.md",
    "skills.md",
    // BAR-260 follow-up: .env.example ships via Tier 3 (writeTier3 from the
    // template at .bkit/templates/.bkit/.env.example). Including it in the
    // payload copy would double-handle the same destination — Tier 3 sees the
    // file already written by payload copy in live mode, skips its own write,
    // and dry-run vs install writesets diverge. Tier 3 owns this file.
    ".env.example",
    // bkit-mode.sh was removed in #245 (opencode replaces the ccr router lane); this
    // entry is kept as a guard to prevent any future accidental re-addition.
    "bkit-mode.sh",
]);
// Top-level `.agents/` files that bkit force-overwrites on install (copyAdditive's
// default skip-if-exists is wrong for canonical bkit-owned content).
//
// Currently EMPTY: the former members (prompts.md, workflows.md, providers.md, cloud.md)
// are bkit-authoring docs / engine data that live package-side under `.bkit/` and
// are read directly from there at runtime (getBkitDocsRoot). They are no longer
// `.agents/` files at all, so there is nothing to force-overwrite HERE. Their
// consumer-side mirrors (under `.bkit/`, not `.agents/`) are written by
// `runBkitDocs` (see BKIT_CANONICAL_DOCS below). Kept as the extension point if a
// canonical consumer-side `.agents/` file is reintroduced.
export const CANONICAL_OVERWRITE_RELPATHS = new Set([]);
// Canonical bkit-authored reference docs that live package-side under `.bkit/`.
// They are read from there at runtime (getBkitDocsRoot) AND mirrored into the
// consumer's `.bkit/` on every install so a consumer can read them in-repo without
// spelunking node_modules. Force-overwritten (Tier 1) — bkit owns them, so a
// consumer edit is replaced. Source of truth is the package's own `.bkit/<name>`.
// `README.md` ships only because package.json `files` no longer excludes it; the
// other five already ship in the tarball. (`advisories.md` is a regenerated runtime
// artifact and `friction.md` is a consumer-owned seed — neither belongs here.)
export const BKIT_CANONICAL_DOCS = [
    "cloud.md",
    "providers.md",
    "prompts.md",
    "trackers.md",
    "workflows.md",
    "README.md",
];
// Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). No-op in
// dogfood: getBkitDocsRoot() resolves to <cwd>/.bkit, so src === dst and
// writeTier1 short-circuits on the byte-equal check (no ws write).
export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
    const tag = dryRun ? "[dry-run] " : "";
    const docsRoot = getBkitDocsRoot();
    // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
    // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
    // are block-merged so consumer content survives; the rest are force-overwritten.
    const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
    for (const name of BKIT_CANONICAL_DOCS) {
        const srcPath = path.join(docsRoot, name);
        // Defensive: a partial/corrupt package may be missing a doc — skip rather than
        // crash the whole install (writeTier1 would throw on a missing src).
        if (!fs.existsSync(srcPath))
            continue;
        const dstPath = path.join(".bkit", name);
        const prevLen = ws.writes.length;
        if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
            writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
        }
        else {
            writeTier1(srcPath, dstPath, tokens, dryRun, ws);
        }
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}core: ${dstPath}`);
        }
    }
}
// ---------------------------------------------------------------------------
// Source-rendered host outputs — agents (.agents/prompts source) and commands
// (.bkit/workflows source). Extracted from the host module functions so BOTH
// `bkit install` (via the modules) AND `bkit upgrade` (via renderManagedOutputs)
// render them identically — a single source of truth that can never diverge.
//
// These are bkit-OWNED output files: force-overwritten (installFile), never
// drift-detected, never consumer config. They are NOT recorded in canonicalHashes
// (installFile does not touch ws), matching the install path exactly. Each returns
// the consumer-relative dest paths it wrote (for the upgrade summary).
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Managed-version stamping (#256). The marker shape (stampManagedVersion +
// regexes) is the single source of truth in bkit-version.ts so the renderer and
// the `bkit check` detector can never drift. Here we only resolve WHICH version
// to stamp: ctx.version (set by install/upgrade) with a package-root fallback.
// ---------------------------------------------------------------------------
/**
 * Best-effort read of the installing bkit version from the package root's
 * package.json. Mirrors getInstallingVersion in bkit-install.ts; duplicated here
 * (not imported) to avoid a modules → install dependency cycle. Returns "0.0.0"
 * when unreadable — the same non-fatal fallback the install side uses.
 */
export function readInstallingVersion() {
    try {
        const pkgPath = path.join(getPkgRoot(), "package.json");
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        return pkg.version ?? "0.0.0";
    }
    catch {
        return "0.0.0";
    }
}
export function renderClaudeAgentsCommands(ctx) {
    const { dryRun, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    const version = ctx.version ?? readInstallingVersion();
    const written = [];
    const pairs = [
        [getWorkflowsRoot(), ".claude/commands"],
        [getPromptsRoot(), ".claude/agents"],
    ];
    for (const [src, dest] of pairs) {
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            // Resolve tracker blocks for workflow files; prompts are byte-identical. The
            // managed-version marker is stamped LAST so it lands after any frontmatter the
            // transform produced (#256).
            const transform = (c) => stampManagedVersion(dest === ".claude/commands" ? substituteWorkflow(c, issueTracker).output : c, version);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
                written.push(path.join(dest, f));
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    return written;
}
export function renderCursorAgentsCommands(ctx) {
    const { dryRun, modelLookup, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    const version = ctx.version ?? readInstallingVersion();
    const written = [];
    // Commands: tracker block resolution → T1 → T2 → managed-version stamp (last, #256)
    {
        const src = getWorkflowsRoot();
        const dest = ".cursor/commands";
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => stampManagedVersion(applyT2(applyT1(substituteWorkflow(c, issueTracker).output)), version);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
                written.push(path.join(dest, f));
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    // Agents: T3
    {
        const src = getPromptsRoot();
        const dest = ".cursor/agents";
        ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => stampManagedVersion(applyT3(c, modelLookup), version);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
                written.push(path.join(dest, f));
            }
        }
        for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
            console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
        }
    }
    return written;
}
export function renderOpencodeAgentsCommands(ctx) {
    const { dryRun, opencodeModelLookup, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    const version = ctx.version ?? readInstallingVersion();
    const written = [];
    // --- Agents: applyOpencodeAgent → managed-version stamp (last, #256) ---
    {
        const src = getPromptsRoot();
        const dest = ".opencode/agents";
        // dryRun-gated so `bkit check` stays read-only — installFile/removeOrphans below are
        // already dryRun-guarded, so the dir is only needed for a real write (#255 #8).
        if (!dryRun)
            ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => stampManagedVersion(applyOpencodeAgent(c, opencodeModelLookup), version);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
                written.push(path.join(dest, f));
            }
        }
        // Remove orphan agent files (bkit-prefix only, no allowlist gate needed — .opencode/agents
        // is a dynamic mirror dir like .claude/agents and .cursor/agents)
        if (!dryRun && fs.existsSync(dest)) {
            for (const f of fs.readdirSync(dest)) {
                if (!f.endsWith(".md"))
                    continue;
                if (!f.startsWith(BKIT_PREFIX))
                    continue;
                if (!sourceSet.has(f)) {
                    fs.rmSync(path.join(dest, f));
                    console.log(`${logPrefix} delete orphan: ${path.join(dest, f)}`);
                }
            }
        }
    }
    // --- Commands: tracker substitution + applyOpencodeCommand ---
    {
        const src = getWorkflowsRoot();
        const dest = ".opencode/commands";
        // dryRun-gated (see .opencode/agents above) — keep `bkit check` read-only (#255 #8).
        if (!dryRun)
            ensureDir(dest);
        const files = listMdFiles(src, BKIT_PREFIX);
        const sourceSet = new Set(files);
        for (const f of files) {
            const transform = (c) => stampManagedVersion(applyOpencodeCommand(substituteWorkflow(c, issueTracker).output), version);
            if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
                console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
                written.push(path.join(dest, f));
            }
        }
        if (!dryRun && fs.existsSync(dest)) {
            for (const f of fs.readdirSync(dest)) {
                if (!f.endsWith(".md"))
                    continue;
                if (!f.startsWith(BKIT_PREFIX))
                    continue;
                if (!sourceSet.has(f)) {
                    fs.rmSync(path.join(dest, f));
                    console.log(`${logPrefix} delete orphan: ${path.join(dest, f)}`);
                }
            }
        }
    }
    return written;
}
// ---------------------------------------------------------------------------
// renderManagedOutputs — re-render the bkit-managed OUTPUT files that the
// `bkit upgrade` template walk (runUpgrade over .bkit/templates/) does NOT cover
// (#251): host agents/commands (source-rendered) and the `.bkit/*.md` canonical
// docs (runBkitDocs). All are bkit-owned, not consumer config, so a version bump
// must refresh them. `.bkit/prompts.md` is markered → runBkitDocs block-merges it
// (managed block refreshed, consumer `## Model Overrides` below bkit:end preserved).
//
// CRITICAL (#204/#219): docs stay single-source PACKAGE-side and are mirrored from
// getBkitDocsRoot() — they are NEVER relocated into .bkit/templates/.
//
// Doc writes land in ctx.ws (runBkitDocs uses the tier writers) so the caller can
// refresh their canonicalHashes; agent/command writes are intentionally NOT
// ws-tracked (installFile), matching install — they never enter canonicalHashes.
// `modules` should contain only hosts the consumer actually has installed.
// Returns every consumer-relative path written (for the upgrade summary).
// ---------------------------------------------------------------------------
export function renderManagedOutputs(modules, ctx) {
    const written = [];
    // Canonical .bkit/*.md docs — always (core is always present once installed).
    const docsBefore = ctx.ws.writes.length;
    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
    for (let i = docsBefore; i < ctx.ws.writes.length; i++) {
        written.push(String(ctx.ws.writes[i].path));
    }
    // Host agents/commands — only for hosts the consumer has installed.
    if (modules.has("claude"))
        written.push(...renderClaudeAgentsCommands(ctx));
    if (modules.has("cursor"))
        written.push(...renderCursorAgentsCommands(ctx));
    if (modules.has("opencode"))
        written.push(...renderOpencodeAgentsCommands(ctx));
    return written;
}
function copyAdditive(src, dst, dryRun, log, relRoot) {
    let writes = 0;
    if (!fs.existsSync(src))
        return 0;
    const stats = fs.statSync(src);
    if (stats.isFile()) {
        const relPath = path.relative(relRoot, dst);
        const isCanonical = CANONICAL_OVERWRITE_RELPATHS.has(relPath);
        if (fs.existsSync(dst)) {
            if (!isCanonical)
                return 0;
            const srcBuf = fs.readFileSync(src);
            const dstBuf = fs.readFileSync(dst);
            if (srcBuf.equals(dstBuf))
                return 0;
        }
        if (!dryRun) {
            fs.mkdirSync(path.dirname(dst), { recursive: true });
            fs.copyFileSync(src, dst);
            fs.chmodSync(dst, stats.mode);
        }
        log(relPath);
        return 1;
    }
    if (!dryRun)
        fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        writes += copyAdditive(path.join(src, entry.name), path.join(dst, entry.name), dryRun, log, relRoot);
    }
    return writes;
}
export function runCoreModule(ctx) {
    const { dryRun, ws, advisories, logPrefix, postDispatch } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const cwd = process.cwd();
    const PKG_ROOT = getPkgRoot();
    const PKG_AGENTS = path.join(PKG_ROOT, ".agents");
    const PKG_PACKAGE_JSON = path.join(PKG_ROOT, "package.json");
    if (!fs.existsSync(PKG_AGENTS)) {
        console.error(`${logPrefix} Packaged .agents/ not found at ${PKG_AGENTS} — package corrupt?`);
        process.exit(1);
    }
    if (!fs.existsSync(PKG_PACKAGE_JSON)) {
        console.error(`${logPrefix} package.json not found at ${PKG_PACKAGE_JSON} — package corrupt?`);
        process.exit(1);
    }
    const pkgVersion = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, "utf-8")).version;
    const target = path.join(cwd, ".agents");
    // Capture first-install signal NOW (before any writes) — used for the post-install banner.
    // The actual .bkit-version write is deferred to postDispatch so that a mid-install crash
    // in a subsequent module does NOT leave .bkit-version on disk (which would suppress the
    // first-install banner on retry).
    const versionFile = path.join(cwd, ".bkit", "version");
    const isFirstInstall = !fs.existsSync(versionFile);
    // 1. Additive .agents/ payload copy (core subdirs only, excluding COPY_EXCLUDE)
    console.log(`${logPrefix} ${tag}Running core payload copy`);
    for (const entry of fs.readdirSync(PKG_AGENTS, { withFileTypes: true })) {
        if (COPY_EXCLUDE.has(entry.name))
            continue;
        const srcPath = path.join(PKG_AGENTS, entry.name);
        const dstPath = path.join(target, entry.name);
        copyAdditive(srcPath, dstPath, dryRun, (rel) => {
            console.log(`${logPrefix} ${tag}copy: ${rel}`);
            // Note: copyAdditive writes are internal .agents/ payload management (not consumer outputs).
            // We log them but do NOT add to ws (ws tracks consumer output files for parity checks).
        }, cwd);
    }
    // 2. Payload cleanup pass — mirror sources + bkit docs + rules.md are now
    // package-only (read directly from .bkit/); this removes any orphan copies a
    // consumer carries from an earlier layout. No-op in dogfood and on clean trees.
    console.log(`${logPrefix} ${tag}Running payload cleanup pass`);
    const { deletes: payloadDeletes } = runPayload(dryRun);
    if (payloadDeletes > 0) {
        console.log(`${logPrefix} ${tag}payload: ${payloadDeletes} relocated orphan(s) removed`);
    }
    // 3. Core templates pass (only core-owned template files: AGENTS.md, CLAUDE.md, .gitignore, docs/)
    // Each other module handles its own template files directly.
    console.log(`${logPrefix} ${tag}Running core templates pass`);
    runCoreTemplates(dryRun, ctx.tokens, ws, logPrefix);
    // 3b. bkit canonical docs pass — mirror the package's `.bkit/*.md` reference docs
    // (cloud/IDEs/prompts/trackers/workflows/README) into the consumer's `.bkit/` so
    // they are readable in-repo. Force-overwrite (Tier 1); no-op in dogfood.
    console.log(`${logPrefix} ${tag}Running bkit docs pass`);
    runBkitDocs(dryRun, ctx.tokens, ws, logPrefix);
    // 4. .bkit-version write — deferred to postDispatch so it only persists when ALL modules succeed.
    // This ensures a mid-install crash in a subsequent module does not suppress the first-install
    // banner on retry (MED-4).
    // C3 fix: write JSON format with canonicalHashes populated from ws.writes (fully populated
    // by the time postDispatch runs — all modules have completed). canonicalHashes records the
    // sha256 of each bkit-managed consumer file as written, enabling drift detection on upgrade.
    postDispatch.push(() => {
        // Read existing file to check whether an update is needed.
        const existingVersion = readBkitVersion(versionFile);
        const existingTier3Hashes = existingVersion?.tier3Hashes ?? {};
        const existingCanonical = existingVersion?.canonicalHashes ?? {};
        // Build the set of consumer-relative paths that have format "byte-equal-text".
        // tier3Hashes is narrowed (v2.0.0+) to only these paths — json and markered-text
        // formats use deepContains / marker extraction for drift detection, so they do NOT
        // need a hash entry. ".bkit/version" is excluded (it is the version file
        // itself, not a consumer-facing file).
        const byteEqualPaths = new Set(getInstallManifest()
            .filter((e) => e.format === "byte-equal-text" && e.path !== path.join(".bkit", "version"))
            .map((e) => e.path));
        // Build new canonicalHashes entries from ws.writes (files written in this run).
        // ws.writes is fully populated by the time postDispatch runs.
        // Exclude .bkit-version itself and .agents/ internal files (not consumer-facing).
        const newCanonicalEntries = {};
        // Also record hashes for byte-equal-text files written in this run.
        const newTier3Entries = {};
        for (const entry of ws.writes) {
            const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
            const relPath = path.relative(cwd, absPath);
            if (relPath === path.join(".bkit", "version"))
                continue;
            if (relPath.startsWith(".agents" + path.sep))
                continue;
            if (!fs.existsSync(absPath))
                continue;
            const hash = hashFile(absPath);
            if (hash) {
                newCanonicalEntries[relPath] = hash;
                // Narrow tier3Hashes to byte-equal-text format only.
                if (byteEqualPaths.has(relPath)) {
                    newTier3Entries[relPath] = hash;
                }
            }
        }
        // tier3Hashes: start from existing byte-equal-text entries only (drop any legacy wider entries),
        // then merge new writes. Backward-compat: preserve existing entries for known byte-equal-text
        // paths (uninstall safety — shouldDeleteTier3 needs the hash if the file was written before
        // this narrowing landed).
        const narrowedExistingTier3 = {};
        for (const [p, h] of Object.entries(existingTier3Hashes)) {
            if (byteEqualPaths.has(p))
                narrowedExistingTier3[p] = h;
        }
        const tier3Hashes = { ...narrowedExistingTier3, ...newTier3Entries };
        // Merge: existing hashes preserved, new writes overwrite (hashes stay current).
        const canonicalHashes = {
            ...existingCanonical,
            ...newCanonicalEntries,
        };
        // Decide whether a write is needed: version mismatch, first install, or new
        // canonical entries.
        const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
        const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
        const needsWrite = versionChanged || hasNewEntries;
        if (needsWrite) {
            console.log(`${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`);
            ws.writes.push({ path: versionFile, action: "write" });
            if (!dryRun) {
                fs.mkdirSync(target, { recursive: true });
                writeBkitVersion(versionFile, {
                    pinnedVersion: pkgVersion,
                    tier3Hashes,
                    canonicalHashes,
                });
            }
        }
    });
    // 5. First-run extra logging (only when .bkit-version was absent at start of install)
    // Note: package.json scripts (typecheck, format:check, lint:prose, lint:slop, slop:delta,
    // prepare) are auto-added by their respective modules — no manual copy-paste required.
    if (isFirstInstall) {
        advisories.push({
            id: "first-install-postinstall-steps",
            severity: "advisory",
            detect: "First install detected (.bkit-version was absent).",
            action: "Post-install steps:\n\n" +
                "1. Add GH_BKIT_TOKEN to your GitHub Actions repository secrets:\n" +
                "   - Create a classic PAT with `read:packages` scope (fine-grained PATs are\n" +
                "     not currently supported by GitHub Packages npm registry).\n" +
                "   - GitHub Settings → Secrets and variables → Actions → New repository secret\n" +
                "   - Name: GH_BKIT_TOKEN\n" +
                "   - See README.md ## Consumer CI auth for full setup.\n\n" +
                "2. Add a `.npmrc` at your repo root with the registry mapping AND auth token:\n" +
                "     @cbartens:registry=https://npm.pkg.github.com\n" +
                "     //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n\n" +
                "   pnpm interpolates `${GH_BKIT_TOKEN}` from the environment at runtime.\n\n" +
                "3. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
                "Note: package.json scripts (typecheck, format:check, lint:prose, lint:slop,\n" +
                "slop:delta, prepare) are auto-added by bkit when their parent module installs. Run\n" +
                "`pnpm bkit install --typescript` to seed them all. Existing scripts are preserved\n" +
                "(consumer values always win).",
        });
    }
}
// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------
const BKIT_PREFIX = "bkit-";
export function runClaudeModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    // Source-rendered agents/commands (.claude/agents from .bkit/prompts, .claude/commands
    // from .bkit/workflows). Extracted to renderClaudeAgentsCommands so `bkit upgrade`
    // re-renders them identically (#251) — bkit-owned output, force-overwritten.
    renderClaudeAgentsCommands(ctx);
    // Root CLAUDE.md — Claude-Code redirect to .agents/rules.md (#252: moved core → claude).
    // It is a ROOT file (not under .claude/), so the .claude/ template walk does not cover it
    // and core no longer emits it — the claude module writes it here. Tier-2 markered-text
    // (writeTier2 html-comment), byte-identical to the prior core emit, so dogfood/upgrade
    // stay no-op. The matching canonicalHashes entry is recorded by core's postDispatch from
    // ws (which aggregates every module's writes), so version-pin bookkeeping is unchanged.
    {
        const src = path.join(getTemplatesRoot(), "CLAUDE.md");
        const dst = "CLAUDE.md";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    const claudeTemplates = path.join(getTemplatesRoot(), ".claude");
    // Tier 2 JSON (contained) — deep-containment: settings.json
    // Phase 1: run migrateLegacyBkitEnvelope to strip __bkit__ before writing.
    const settingsSrc = path.join(claudeTemplates, "settings.json");
    const settingsDst = ".claude/settings.json";
    if (fs.existsSync(settingsSrc)) {
        // Run migration first (idempotent — strips __bkit__ envelope if present)
        if (fs.existsSync(settingsDst) && !dryRun) {
            try {
                const raw = fs.readFileSync(settingsDst, "utf-8");
                const doc = JSON.parse(raw);
                const templateRaw = fs.readFileSync(settingsSrc, "utf-8");
                const template = JSON.parse(templateRaw);
                const result = migrateLegacyBkitEnvelope(doc, template);
                if (result.stripped) {
                    // Write migrated doc atomically via temp file + rename
                    const tmpPath = `${settingsDst}.bkit-migrate-tmp`;
                    fs.writeFileSync(tmpPath, JSON.stringify(result.outDoc, null, 2) + "\n", "utf-8");
                    fs.renameSync(tmpPath, settingsDst);
                    const variant = result.schemaFlipped
                        ? "schema flip applied (flat-array → keyed-object)"
                        : "stripped __bkit__ envelope";
                    console.log(`[bkit] migrated ${settingsDst} — ${variant} (v2.0.0)`);
                }
            }
            catch {
                // Malformed JSON in migration — skip migration; writeTier2JsonContained below will throw
                // with a user-actionable error message requiring manual fix before re-running bkit install.
            }
        }
        const prevLen = ws.writes.length;
        writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}claude: ${settingsDst}`);
        }
    }
    // Markered-text — manifest format: "markered-text" — preflight hook.
    // Uses writeTier2 (html-comment markers: # <!-- bkit:start --> / # <!-- bkit:end -->)
    // to update only the bkit-managed block, preserving any consumer content outside markers.
    // Changed from writeTier1 to align install dispatch with manifest format classification.
    {
        const src = path.join(claudeTemplates, "hooks", "preflight.sh");
        const dst = ".claude/hooks/preflight.sh";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    // byte-equal-text — GateGuard advisory PreToolUse hook (Node script, fully
    // bkit-owned). writeTier1 force-overwrites on install/upgrade; consumers tune
    // behaviour via env vars (BKIT_GATEGUARD / BKIT_ALLOW_CONFIG_EDIT), not by editing.
    {
        const src = path.join(claudeTemplates, "hooks", "gateguard.cjs");
        const dst = ".claude/hooks/gateguard.cjs";
        if (fs.existsSync(src)) {
            const prevLen = ws.writes.length;
            writeTier1(src, dst, tokens, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${dst}`);
            }
        }
    }
    // cloud-bootstrap.sh moved to the opt-in `cloud` module (runCloudModule) — it
    // only matters once a Claude Code on the web env is wired (a manual opt-in step),
    // so a default --full install ships zero cloud footprint. The SessionStart hook
    // entry in .claude/settings.json is guarded (`test -f … || true`) so it no-ops
    // when the script is absent. The `cloud-env-customize` advisory moved with it.
    // Byte-equal-text — .mcp.json root-level MCP config — Tier 3 seed-or-print.
    // Content is filtered by issueTracker: only the selected tracker's mcpServers entry is seeded.
    {
        const mcpSrc = path.join(getTemplatesRoot(), ".mcp.json");
        const mcpDst = ".mcp.json";
        const prevLen = ws.writes.length;
        const result = seedMcpJson(mcpSrc, mcpDst, issueTracker, MCP_ROOT_MERGE_INSTRUCTIONS, dryRun, advisories, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}claude: ${mcpDst}`);
        }
        else if (result.suggested) {
            console.log(`${logPrefix} ${tag}claude: ${mcpDst} (exists; AI merge instructions printed)`);
        }
    }
    // Byte-equal-text — .bkit/.env.example — Tier 3 seed-or-print.
    // Seeds the canonical token-placeholder file on first install; emits merge
    // instructions if consumer has modified. Not claude-specific but the claude
    // module is the default-runs-everywhere module — appropriate home for
    // consumer-setup scaffolding that all environments need.
    {
        const envExampleSrc = path.join(getTemplatesRoot(), ".bkit", ".env.example");
        const envExampleDst = ".bkit/.env.example";
        if (fs.existsSync(envExampleSrc)) {
            const prevLen = ws.writes.length;
            const result = writeTier3(envExampleSrc, envExampleDst, dryRun, advisories, ws, ENV_EXAMPLE_MERGE_INSTRUCTIONS);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${envExampleDst}`);
            }
            else if (result.suggested) {
                console.log(`${logPrefix} ${tag}claude: ${envExampleDst} (exists; AI merge instructions printed)`);
            }
        }
    }
    // Byte-equal-text — .envrc — Tier 3 seed-or-print.
    // Seeds a single-line dotenv_if_exists directive for direnv auto-load.
    {
        const envrcSrc = path.join(getTemplatesRoot(), ".envrc");
        const envrcDst = ".envrc";
        if (fs.existsSync(envrcSrc)) {
            const prevLen = ws.writes.length;
            const result = writeTier3(envrcSrc, envrcDst, dryRun, advisories, ws, ENVRC_MERGE_INSTRUCTIONS);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}claude: ${envrcDst}`);
            }
            else if (result.suggested) {
                console.log(`${logPrefix} ${tag}claude: ${envrcDst} (exists; AI merge instructions printed)`);
            }
        }
    }
    // Task 6.3 — bkit-mode.sh deletion advisory (upgrade-migration drift detection).
    // .bkit/scripts/bkit-mode.sh was a Tier-3 seed-or-print file (consumers edit it;
    // upgrade never overwrites). Every prior consumer keeps a copy on disk even after
    // upgrading to a bkit version that no longer ships the template. Detect the orphan
    // and advise deletion — the opencode host (additive, via `bkit install --opencode=<provider>`)
    // is the replacement; the `bkit mode` surface and ccr router are retired.
    //
    // The advisory explicitly names the shell-rc source line removal step because
    // bkit-mode.sh installed a bkit() shell-function shim via `source .../bkit-mode.sh`
    // in ~/.zshrc/~/.bashrc. Deleting the file without removing the source line leaves
    // a broken source call that errors on every new shell.
    {
        const modeDst = ".bkit/scripts/bkit-mode.sh";
        if (fs.existsSync(modeDst)) {
            advisories.push({
                id: "bkit-mode-sh-deletion-required",
                severity: "advisory",
                detect: ".bkit/scripts/bkit-mode.sh is present but is no longer managed by bkit. The `bkit mode` surface and the ccr router it depended on have been retired. Keeping this file creates a broken shell-rc source call on every new terminal.",
                action: "1. Delete the orphan script: rm .bkit/scripts/bkit-mode.sh\n" +
                    "2. Remove the source line from your shell rc (~/.zshrc or ~/.bashrc): delete or comment out the line that reads `source <repo-path>/.bkit/scripts/bkit-mode.sh`.\n" +
                    "3. Provider selection is now an install operation: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The claude host is always-on — no flag needed.\n" +
                    "4. Check your installed hosts and credentials: `bkit doctor` (credentials + tools) and `bkit status` (installed hosts + providers).",
            });
        }
    }
}
// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------
export function runCursorModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    // Source-rendered agents/commands (.cursor/agents T3 from .bkit/prompts, .cursor/commands
    // T1/T2 from .bkit/workflows). Extracted to renderCursorAgentsCommands so `bkit upgrade`
    // re-renders them identically (#251) — bkit-owned output, force-overwritten.
    renderCursorAgentsCommands(ctx);
    // Tier 2 JSON (contained) — deep-containment: hooks.json
    // Phase 1: run migrateLegacyBkitEnvelope to strip __bkit__ before writing.
    const cursorTemplates = path.join(getTemplatesRoot(), ".cursor");
    const hooksSrc = path.join(cursorTemplates, "hooks.json");
    const hooksDst = ".cursor/hooks.json";
    if (fs.existsSync(hooksSrc)) {
        // Run migration first (idempotent — strips __bkit__ envelope if present)
        if (fs.existsSync(hooksDst) && !dryRun) {
            try {
                const raw = fs.readFileSync(hooksDst, "utf-8");
                const doc = JSON.parse(raw);
                const templateRaw = fs.readFileSync(hooksSrc, "utf-8");
                const template = JSON.parse(templateRaw);
                const result = migrateLegacyBkitEnvelope(doc, template);
                if (result.stripped) {
                    // Write migrated doc atomically via temp file + rename
                    const tmpPath = `${hooksDst}.bkit-migrate-tmp`;
                    fs.writeFileSync(tmpPath, JSON.stringify(result.outDoc, null, 2) + "\n", "utf-8");
                    fs.renameSync(tmpPath, hooksDst);
                    const variant = result.schemaFlipped
                        ? "schema flip applied (flat-array → keyed-object)"
                        : "stripped __bkit__ envelope";
                    console.log(`[bkit] migrated ${hooksDst} — ${variant} (v2.0.0)`);
                }
            }
            catch {
                // Malformed JSON in migration — skip migration; writeTier2JsonContained below will throw
                // with a user-actionable error message requiring manual fix before re-running bkit install.
            }
        }
        const prevLen = ws.writes.length;
        writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}cursor: ${hooksDst}`);
        }
    }
    // Markered-text — manifest format: "markered-text" — preflight hook + shared rules.
    // All use html-comment markers (# <!-- bkit:start --> / # <!-- bkit:end -->).
    // Uses writeTier2 to update only the bkit-managed block; consumer content outside
    // markers is preserved. `.cursor/Dockerfile` moved to the opt-in `cloud` module
    // (runCloudModule) — it only matters for Cursor Background Agents (cloud).
    {
        const markeredFiles = [
            [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
            [
                path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
                ".cursor/rules/00-shared-rules.mdc",
            ],
        ];
        for (const [src, dst] of markeredFiles) {
            if (!fs.existsSync(src))
                continue;
            const prevLen = ws.writes.length;
            writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}cursor: ${dst}`);
            }
        }
    }
    // Byte-equal-text — manifest format: "byte-equal-text" — seed-or-print for consumer infra.
    // Uses writeTier3 semantics: seed if absent, emit AI-actionable advisory if present and
    // differing. These files are consumer-configurable; bkit does not force-overwrite them.
    // The manifest classifies them "byte-equal-text" for check/uninstall dispatch; install
    // intentionally uses seed-or-print to preserve consumer modifications on upgrade.
    //
    // `.cursor/environment.json` moved to the opt-in `cloud` module (runCloudModule) — it
    // configures Cursor Background Agents (cloud) and is inert for local Cursor use.
    const tier3Files = [
        [
            path.join(cursorTemplates, "settings.json"),
            ".cursor/settings.json",
            CURSOR_SETTINGS_MERGE_INSTRUCTIONS,
        ],
    ];
    for (const [src, dst, msg] of tier3Files) {
        if (!fs.existsSync(src))
            continue;
        const prevLen = ws.writes.length;
        const result = writeTier3(src, dst, dryRun, advisories, ws, msg);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}cursor: ${dst}`);
        }
        else if (result.suggested) {
            console.log(`${logPrefix} ${tag}cursor: ${dst} (exists; AI merge instructions printed)`);
        }
    }
    // .cursor/mcp.json — Tier 3 seed-or-print, filtered by issueTracker (same as .mcp.json).
    {
        const cursorMcpSrc = path.join(cursorTemplates, "mcp.json");
        const cursorMcpDst = ".cursor/mcp.json";
        const prevLen = ws.writes.length;
        const result = seedMcpJson(cursorMcpSrc, cursorMcpDst, issueTracker, CURSOR_MCP_MERGE_INSTRUCTIONS, dryRun, advisories, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}cursor: ${cursorMcpDst}`);
        }
        else if (result.suggested) {
            console.log(`${logPrefix} ${tag}cursor: ${cursorMcpDst} (exists; AI merge instructions printed)`);
        }
    }
    // Post-install advisory: macOS GUI-isolation note.
    // MCP token placeholders (${GH_MCP_TOKEN}, ${LINEAR_API_KEY}, …) in .cursor/mcp.json are
    // expanded by Cursor from the process environment. When Cursor is launched from the
    // Dock/Finder (launchd), it does NOT inherit the login-shell / direnv env — tokens
    // resolve empty and MCP calls fail with auth errors (#279/#280).
    advisories.push({
        id: "cursor-gui-isolation",
        severity: "advisory",
        detect: "Cursor's MCP token placeholders (${GH_MCP_TOKEN}, …) resolve from process.env. " +
            "Dock/Finder-launched Cursor does not inherit the login-shell / direnv env.",
        action: "[cursor] Use `bkit cursor` to launch Cursor — it execs the binary directly with " +
            ".bkit/.env merged into the environment so MCP tokens resolve correctly. " +
            "Quit Cursor first (a running instance will not see the new env). " +
            'Alternative: `launchctl setenv GH_MCP_TOKEN "$GH_MCP_TOKEN"` (session-scoped; must re-run after reboot) ' +
            "then relaunch from Dock.",
    });
}
// checkBkitTokenSecret and detectVercelProject moved to bkit-postinstall.ts (Phase 3 owns them).
// ---------------------------------------------------------------------------
// runOpencodeModule — opencode provider-agnostic host (opt-in via --opencode=<provider>)
//
// Additive alongside always-on claude/cursor: .opencode/agents/*.md (via applyOpencodeAgent),
// .opencode/commands/*.md (via applyOpencodeCommand + tracker substitution),
// .opencode/opencode.json (Tier-2 deep-contained), .opencode/plugin/gateguard.js (Tier-1).
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
//   .opencode/plugin/   (singular, not plugins/)
//
// Provider config is seeded into opencode.json; consumers tune model IDs and provider
// keys after install. opencode.json is Tier-2 deep-contained (ownership-mixed) so bkit
// reconverges its keys on upgrade without clobbering consumer additions (KN-17).
// ---------------------------------------------------------------------------
// Per-provider provider key name + base URL + env var suggestions.
// These are sane defaults; consumers tune after install.
// npmPackage: set for custom OpenAI-compatible providers that use npm-based AI SDK driver.
const OPENCODE_PROVIDER_DEFAULTS = {
    "ollama-local": {
        envVar: "OLLAMA_HOST",
        baseURL: "http://localhost:11434/v1",
        apiPlaceholder: "",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Ollama (Local)",
    },
    nvidia: {
        envVar: "NVIDIA_API_KEY",
        baseURL: "https://integrate.api.nvidia.com/v1",
        // opencode custom providers use the npm driver (NOT an "api" field, which is invalid
        // and makes opencode reject the whole config) and read keys via {env:VAR} — never
        // shell ${VAR}. See https://opencode.ai/docs/config + /docs/providers.
        apiPlaceholder: "{env:NVIDIA_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "NVIDIA NIM",
    },
    // Free-tier fast cloud — same OpenAI-compatible driver as nvidia, different endpoint/key.
    groq: {
        envVar: "GROQ_API_KEY",
        baseURL: "https://api.groq.com/openai/v1",
        apiPlaceholder: "{env:GROQ_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Groq",
    },
    cerebras: {
        envVar: "CEREBRAS_API_KEY",
        baseURL: "https://api.cerebras.ai/v1",
        apiPlaceholder: "{env:CEREBRAS_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Cerebras",
    },
    // Aggregator — one key, every model (incl :free variants). Re-added as a named, pinned
    // provider (NOT the any-endpoint fallback #245 removed).
    openrouter: {
        envVar: "OPENROUTER_API_KEY",
        baseURL: "https://openrouter.ai/api/v1",
        apiPlaceholder: "{env:OPENROUTER_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "OpenRouter",
    },
    // Cloud-hosted Ollama (ollama.com) — DISTINCT key from `ollama-local` (localhost, no API
    // key). Matches opencode's own naming where built-in `ollama` = the cloud service.
    ollama: {
        envVar: "OLLAMA_API_KEY",
        baseURL: "https://ollama.com/v1",
        apiPlaceholder: "{env:OLLAMA_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Ollama (Cloud)",
    },
    // opencode-native gateway (Zen; opencode's "Go" plan, alias `go`). First-class built-in
    // opencode provider (id "opencode"; models opencode/<id>). Auth is via OPENCODE_API_KEY,
    // referenced as {env:OPENCODE_API_KEY} — renderOpencodeJson emits a minimal provider block
    // with only that apiKey (no npm driver, no baseURL: opencode resolves the built-in provider).
    opencode: {
        envVar: "OPENCODE_API_KEY",
        baseURL: "",
        apiPlaceholder: "{env:OPENCODE_API_KEY}",
        builtin: true,
        providerId: "opencode",
        displayName: "OpenCode",
    },
};
/**
 * The opencode-side provider id for a bkit provider key. Equal to the key for all providers
 * (opencode → opencode, groq → groq, etc.). Model ids are `<providerId>/<model>`. Unknown
 * keys pass through unchanged.
 */
export function opencodeProviderId(providerKey) {
    return OPENCODE_PROVIDER_DEFAULTS[providerKey]?.providerId ?? providerKey;
}
// Sentinel values used in the opencode.json template for tracker-filtered mcp injection.
const OPENCODE_TRACKER_MCP_SENTINEL = '"@@OPENCODE_TRACKER_MCP@@": {}';
const OPENCODE_PROVIDER_KEY_SENTINEL = "@@OPENCODE_PROVIDER_KEY@@";
const OPENCODE_PROVIDER_ENV_VAR_SENTINEL = "@@OPENCODE_PROVIDER_ENV_VAR@@";
const OPENCODE_PROVIDER_BASE_URL_SENTINEL = "@@OPENCODE_PROVIDER_BASE_URL@@";
/**
 * Render the opencode.json template with tracker-filtered mcp + provider config.
 * Resolves the @@OPENCODE_TRACKER_MCP@@ sentinel into the correct mcpServers entry
 * and fills in provider-specific fields.
 */
export function renderOpencodeJson(templatePath, tracker, provider) {
    const raw = fs.readFileSync(templatePath, "utf-8");
    // Strict allowlist: provider is gated to OPENCODE_PROVIDERS at the CLI, so it is always
    // a known key here. Fall back to the local default (never a synthesized placeholder URL)
    // for any unexpected id rather than emitting a non-working endpoint.
    const providerDefaults = OPENCODE_PROVIDER_DEFAULTS[provider] ?? OPENCODE_PROVIDER_DEFAULTS["ollama-local"];
    // Resolve tracker MCP entry
    // opencode's MCP schema differs from Claude/Cursor: remote servers use type "remote"
    // (NOT "http" — not in opencode's enum, which makes the whole config invalid) and read
    // secrets via {env:VAR} (NOT shell ${VAR}). See https://opencode.ai/config.json.
    let mcpEntry;
    if (tracker === "github") {
        mcpEntry =
            '"github": { "type": "remote", "url": "https://api.githubcopilot.com/mcp/", "headers": { "Authorization": "Bearer {env:GH_MCP_TOKEN}", "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects" } }';
    }
    else if (tracker === "linear") {
        mcpEntry = '"linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }';
    }
    else {
        mcpEntry = "";
    }
    let rendered = raw.replace(OPENCODE_TRACKER_MCP_SENTINEL, mcpEntry);
    rendered = rendered.replace(OPENCODE_PROVIDER_KEY_SENTINEL, provider);
    rendered = rendered.replace(OPENCODE_PROVIDER_ENV_VAR_SENTINEL, providerDefaults.envVar);
    rendered = rendered.replace(OPENCODE_PROVIDER_BASE_URL_SENTINEL, providerDefaults.baseURL);
    // Parse + re-serialize to normalise JSON (removes empty mcp entry if tracker=none)
    try {
        const parsed = JSON.parse(rendered);
        // Clean up empty mcp object when tracker=none
        const mcp = parsed.mcp;
        if (mcp && Object.keys(mcp).length === 0) {
            delete parsed.mcp;
        }
        // Built-in opencode gateway: opencode resolves the provider itself, so there is no
        // npm driver and no baseURL to seed — emit a minimal block keyed by the opencode-side
        // provider id carrying only the apiKey ({env:OPENCODE_API_KEY}). Models are opencode/<id>.
        if (providerDefaults.builtin) {
            const pid = providerDefaults.providerId ?? provider;
            const options = {};
            if (providerDefaults.apiPlaceholder)
                options.apiKey = providerDefaults.apiPlaceholder;
            parsed.provider = { [pid]: { options } };
            return JSON.stringify(parsed, null, 2) + "\n";
        }
        // For npm-based custom providers (e.g. ollama-local), replace the api-openai provider
        // block with the npm-driver format: { npm, name, options: { baseURL } }
        if (providerDefaults.npmPackage) {
            // Remote providers (nvidia) carry an apiKey as {env:VAR}; local (ollama-local) has
            // an empty placeholder → no apiKey field. opencode rejects an unknown "api" field,
            // so the block is rebuilt to the npm-driver shape only.
            const options = { baseURL: providerDefaults.baseURL };
            if (providerDefaults.apiPlaceholder)
                options.apiKey = providerDefaults.apiPlaceholder;
            parsed.provider = {
                [provider]: {
                    npm: providerDefaults.npmPackage,
                    name: providerDefaults.displayName ?? provider,
                    options,
                },
            };
        }
        return JSON.stringify(parsed, null, 2) + "\n";
    }
    catch {
        return rendered;
    }
}
/**
 * Reconcile a consumer's `.opencode/opencode.json` against the freshly-rendered template.
 * Install is purely additive: existing provider blocks (bkit-seeded or consumer-added) are
 * preserved unchanged. Only the current provider's template block is deep-merged in.
 *
 * To remove a stale bkit provider block (e.g. after switching providers), use the surgical
 * `removeOpencodeProviderBlock` below — called by the uninstall path, not install.
 *
 * Mirrors writeTier2JsonContained's contract (first-install write, idempotent no-op via
 * deepContains, else merge), so dry-run and real runs compute the identical writeset.
 */
export function reconcileOpencodeJson(renderedTemplate, relDst, dryRun, ws) {
    const template = JSON.parse(renderedTemplate);
    if (!fs.existsSync(relDst)) {
        // First install — write template as-is.
        if (!dryRun) {
            ensureDir(path.dirname(relDst));
            fs.writeFileSync(relDst, JSON.stringify(template, null, 2) + "\n", "utf-8");
        }
        ws.writes.push({ path: relDst, action: "write" });
        return;
    }
    // Parse into a sentinel and validate AFTER the catch — keeping the throw out of the catch
    // body (matches the codebase's parse-or-sentinel idiom; a throw inside catch obscures the
    // original error). Malformed consumer JSON is a hard stop: refuse to merge, require a fix.
    let existing = null;
    try {
        existing = JSON.parse(fs.readFileSync(relDst, "utf-8"));
    }
    catch {
        existing = null;
    }
    if (existing === null) {
        throw new Error(`[bkit] ${relDst} is malformed JSON — fix manually before running bkit install`);
    }
    // Idempotent no-op: skip write if existing already contains the template.
    if (deepContains(template, existing).ok) {
        return;
    }
    const merged = deepMergeJson(existing, template);
    const mergedStr = JSON.stringify(merged, null, 2) + "\n";
    if (mergedStr === fs.readFileSync(relDst, "utf-8"))
        return; // idempotent guard
    if (!dryRun) {
        fs.writeFileSync(relDst, mergedStr, "utf-8");
    }
    ws.writes.push({ path: relDst, action: "update" });
}
/**
 * Remove exactly one bkit-seeded provider block from the consumer's opencode.json.
 * `dst` may be an absolute or relative path (fs.* accepts both).
 * Used by the surgical uninstall path — this is NOT called during install (install is additive).
 * Compares on opencodeProviderId(providerKey) to resolve the opencode-side block key.
 * The caller is responsible for passing only bkit-seeded provider keys; this function does not
 * validate providerKey against OPENCODE_PROVIDER_DEFAULTS.
 */
export function removeOpencodeProviderBlock(dst, providerKey, dryRun, ws) {
    if (!fs.existsSync(dst))
        return;
    // Parse-or-sentinel idiom: keep the early-return outside the catch body.
    let existing = null;
    try {
        existing = JSON.parse(fs.readFileSync(dst, "utf-8"));
    }
    catch {
        existing = null;
    }
    if (existing === null) {
        console.warn(`[bkit] ${dst} is malformed — leaving as-is`);
        return;
    }
    const blockKey = opencodeProviderId(providerKey);
    const providerObj = existing.provider;
    if (providerObj === null || typeof providerObj !== "object" || Array.isArray(providerObj))
        return;
    const pObj = providerObj;
    if (!(blockKey in pObj))
        return; // already absent — idempotent
    delete pObj[blockKey];
    if (Object.keys(pObj).length === 0)
        delete existing.provider;
    const updatedStr = JSON.stringify(existing, null, 2) + "\n";
    if (!dryRun) {
        fs.writeFileSync(dst, updatedStr, "utf-8");
    }
    ws.writes.push({ path: dst, action: "update" });
}
const OPENCODE_JSON_MERGE_INSTRUCTIONS = `[bkit] .opencode/opencode.json exists — bkit will reconverge its managed keys (Tier-2 deep-contained). Manual review recommended after upgrade.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .opencode/opencode.json. Compare against the bkit reference below.
  bkit owns: the \`permission\` block, the \`plugin\` array, and the \`mcp\` entries
  it seeded. You own: any additional \`provider\` entries, model lists, and custom mcp servers.

  Required merge actions:
  1. Ensure the \`permission\` block contains the bkit reference entries.
  2. Ensure the \`plugin\` array includes ".opencode/plugin/gateguard.js".
  3. Preserve your provider configuration and any custom mcp servers.

  --- begin bkit reference .opencode/opencode.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .opencode/opencode.json ---
`;
export function runOpencodeModule(ctx) {
    const { dryRun, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
    const provider = ctx.opencodeProvider ?? "ollama-local";
    // Source-rendered agents/commands (.opencode/agents + .opencode/commands). Extracted to
    // renderOpencodeAgentsCommands so `bkit upgrade` re-renders them identically (#251) —
    // bkit-owned output, force-overwritten.
    renderOpencodeAgentsCommands(ctx);
    // --- opencode.json — Tier-2 deep-contained (reconverged on upgrade) ---
    {
        const opencodeTplDir = path.join(getTemplatesRoot(), ".opencode");
        const jsonSrc = path.join(opencodeTplDir, "opencode.json");
        const jsonDst = ".opencode/opencode.json";
        if (fs.existsSync(jsonSrc)) {
            // Render the template with tracker-filtered mcp + provider config, then reconcile it into
            // the consumer file. Install is additive: existing provider blocks are preserved.
            // reconcileOpencodeJson computes an identical writeset for dry-run vs real runs — no
            // `.bkit-staging` scratch file.
            const rendered = renderOpencodeJson(jsonSrc, issueTracker, provider);
            const prevLen = ws.writes.length;
            reconcileOpencodeJson(rendered, jsonDst, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}opencode: ${jsonDst}`);
            }
        }
    }
    // --- gateguard.js — Tier-1 byte-equal-text (bkit-owned, force-overwrite) ---
    {
        const opencodeTplDir = path.join(getTemplatesRoot(), ".opencode");
        const pluginSrc = path.join(opencodeTplDir, "plugin", "gateguard.js");
        const pluginDst = ".opencode/plugin/gateguard.js";
        if (fs.existsSync(pluginSrc)) {
            // dryRun-gated — writeTier1 honours dryRun, so the dir is only needed for a real
            // write; keeps `bkit check` read-only when gateguard's parent dir is absent (#255 #8).
            if (!dryRun)
                ensureDir(path.dirname(pluginDst));
            const prevLen = ws.writes.length;
            writeTier1(pluginSrc, pluginDst, ctx.tokens, dryRun, ws);
            if (ws.writes.length > prevLen) {
                console.log(`${logPrefix} ${tag}opencode: ${pluginDst}`);
            }
        }
    }
    // opencode post-install advisory — provider key + launch + model-ID lookup pointer.
    advisories.push({
        id: "opencode-setup",
        severity: "advisory",
        detect: `opencode host installed (provider: ${provider}). The opencode CLI and your provider credentials are required before running agents.`,
        action: `opencode setup for provider "${provider}":\n\n` +
            (() => {
                const pd = OPENCODE_PROVIDER_DEFAULTS[provider];
                if (!pd) {
                    return (`  1. Set ${provider.toUpperCase()}_API_KEY in your environment / .bkit/.env.\n` +
                        `  2. Update .opencode/opencode.json provider.${provider}.options.baseURL for your endpoint.\n`);
                }
                // Built-in opencode gateway → keyed via OPENCODE_API_KEY, no baseURL to seed.
                // Checked BEFORE the empty-apiPlaceholder branch so its guidance is gateway-specific.
                if (pd.builtin) {
                    return (`  1. opencode is the opencode-native gateway. Create an API key at https://opencode.ai/auth.\n` +
                        `  2. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
                        `     ${pd.envVar}=<your-api-key>\n` +
                        `  3. Models are referenced as opencode/<id>; opencode resolves the built-in provider.\n`);
                }
                // Local keyless provider (ollama-local) → local-setup guidance. Every provider uses
                // the npm driver, so npmPackage no longer discriminates local vs remote — an empty
                // apiPlaceholder (no API key) is the local marker (ollama-local only).
                if (!pd.apiPlaceholder) {
                    return (`  1. Ollama runs locally — no API key needed.\n` +
                        `  2. Ensure Ollama is running: \`ollama serve\` (default: http://localhost:11434).\n` +
                        `  3. Pull the seeded model: \`ollama pull qwen3-coder:30b\` (bkit pins all opencode agents to one model — see .bkit/prompts.md § Models).\n` +
                        `  4. Verify the tag matches what you pulled: \`ollama list\` (a config/disk mismatch makes calls silently fail).\n` +
                        `  5. Memory-safe SERVER config (esp. laptops / fanless machines): keep ONE model resident.\n` +
                        `     opencode (CLI or desktop app) is only an HTTP client to Ollama at localhost:11434 — it never launches or configures the server, so these settings are INDEPENDENT of which opencode surface you use. They are Ollama SERVER env vars (govern the \`ollama serve\` daemon / Ollama.app) and do NOT go in opencode.json. Where to set them:\n` +
                        `       - macOS (Ollama.app): run \`launchctl setenv OLLAMA_MAX_LOADED_MODELS 1\`, \`launchctl setenv OLLAMA_NUM_PARALLEL 1\`, and \`launchctl setenv OLLAMA_KEEP_ALIVE 2m\`, then quit + reopen Ollama. (Re-run after reboot, or add to a login script — launchctl values are not persistent across restarts.)\n` +
                        `       - Terminal \`ollama serve\`: add \`export OLLAMA_MAX_LOADED_MODELS=1\`, \`export OLLAMA_NUM_PARALLEL=1\`, and \`export OLLAMA_KEEP_ALIVE=2m\` to ~/.zshrc (or ~/.bashrc), then restart the server.\n` +
                        `       - Linux (systemd): \`systemctl edit ollama.service\` → under [Service] add \`Environment="OLLAMA_MAX_LOADED_MODELS=1"\`, \`Environment="OLLAMA_NUM_PARALLEL=1"\`, and \`Environment="OLLAMA_KEEP_ALIVE=2m"\` → \`systemctl daemon-reload && systemctl restart ollama\`.\n` +
                        `     MAX_LOADED_MODELS=1 = never hold 2+ models (avoids swap thrash on model switch); NUM_PARALLEL=1 = serialize bkit's concurrent subagent fan-out (one local model gives no parallel speedup, and >1 splits the KV cache → more memory); KEEP_ALIVE=2m = unload sooner after idle. These are Ollama-local only — remote providers (nvidia) ignore them.\n` +
                        `  6. Cap context per request: set \`OLLAMA_CONTEXT_LENGTH\` (server env, same locations as above; e.g. 16384) or num_ctx in a Modelfile — KV cache scales linearly with it. \`bkit doctor\` reports the current MAX_LOADED_MODELS / NUM_PARALLEL / KEEP_ALIVE values.\n`);
                }
                return (`  1. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
                    `     ${pd.envVar}=<your-api-key>\n` +
                    `  2. Provider base URL is pre-seeded: ${pd.baseURL}.\n`);
            })() +
            `  3. Launch opencode: \`opencode\` (CLI, reads .opencode/opencode.json automatically), or\n` +
            `     \`bkit opencode\` to launch the desktop app with .bkit/.env merged into its environment.\n` +
            `     macOS GUI apps launched from the Dock/Finder do not inherit the login-shell / direnv\n` +
            `     env — {env:KEY} placeholders in opencode.json resolve empty without this. Quit the\n` +
            `     running app first (a running instance ignores the new env).\n` +
            `  4. Model IDs: all seven providers (nvidia, ollama-local, groq, cerebras, openrouter, ollama, opencode) install ready-to-run curated per-agent pins. ` +
            `Re-pin any agent via .bkit/prompts.md § Model Overrides or by probing the provider's live /v1/models — see .bkit/providers.md § Models. NOTE: ollama (cloud) opus/convergent pins (kimi-k2.6, deepseek-v4-pro) need a paid Ollama plan; its sonnet/haiku pins run on the free tier. opencode gateway pins are existence-validated against the live gateway catalog (https://opencode.ai/zen/v1/models); the per-model tool-call smoke needs your OPENCODE_API_KEY set.\n` +
            `  5. Verify with: \`bkit doctor\` (credentials + tools) and \`bkit status\` (installed hosts + providers).`,
    });
}
// ---------------------------------------------------------------------------
// AI-actionable Tier 3 merge instructions
//
// Each constant is a self-contained instruction block: any AI agent
// (Claude/Cursor/Copilot/etc.) reading the install output can paste it as
// a prompt and apply the required merge without referring back to bkit
// docs. Use {{TEMPLATE_CONTENT}} as a placeholder — writeTier3 substitutes
// the live template content at print time.
// ---------------------------------------------------------------------------
// scanForeignBkitUses — BAR-164 installer guard. Returns every
// `uses: cbartens/bkit/...@<ref>` line in the canonical CI template. While
// `cbartens/bkit` stays private and consumers live in other GitHub orgs, such
// references cannot be resolved by the runner's GITHUB_TOKEN. The canonical
// install flow is the install step's `pnpm config set` + GH_BKIT_TOKEN env —
// see README §"Consumer CI auth". `runCiModule` calls this and throws
// before writing if any matches are found, so a regression is caught at
// dev/CI time, never in a consumer repo.
export function scanForeignBkitUses(content) {
    const matches = [];
    const re = /^\s*-?\s*uses:\s*(cbartens\/bkit\/[^\s@]+@\S+)\s*$/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
        matches.push(m[1]);
    }
    return matches;
}
const CI_YML_MERGE_INSTRUCTIONS = `[bkit] .github/workflows/ci.yml exists — bkit cannot safely YAML-merge jobs. Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .github/workflows/ci.yml. Compare it to the bkit reference workflow
  below (which represents the complete recommended CI gates for any bkit
  consumer). Your existing workflow likely has additional consumer-specific
  jobs and triggers — preserve those.

  Required merge actions:
  1. Ensure a .npmrc file exists at the repo root with BOTH the registry mapping
     AND the auth token reference:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     Commit this .npmrc file — pnpm interpolates \${GH_BKIT_TOKEN} from the
     environment at runtime. Vercel and CI both set this as an env var.

  2. Ensure the install step also writes the auth token via \`pnpm config set\`
     as belt-and-braces (supplements .npmrc):

        - name: Install Dependencies
          run: |
            pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"
            pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}

  3. Remove any 'Configure private-repo auth' step (git config --global
     url."...cbartens/bkit...".insteadOf "...") — this git auth-shim is
     obsolete. The .npmrc + \`pnpm config set\` approach replaces it entirely.

  4. Ensure the GitHub repo secret GH_BKIT_TOKEN is set with a PAT that has
     read:packages scope (classic) or Packages: read permission (fine-grained).

  5. Ensure 'package.json' has '"packageManager": "pnpm@<version>"' set.
     pnpm/action-setup@v4 reads this as single source of truth and will
     fail if it is missing or conflicts with a 'with: version:' block.

  6. Ensure the package.json scripts referenced by the workflow exist:
     "format:check", "lint:prose", "lint:slop", "slop:delta". Run 'bkit install
     --lint' to seed them, or add manually.

  7. The reference adds two gates an older workflow likely lacks:
       - an 'Install Vale' step (pinned tarball + 'vale sync') before the prose
         lint — without it 'pnpm lint:prose' silently skips (vale not installed)
         and the prose gate enforces nothing.
       - a 'Run Slop Delta' step (PR-only, 'pnpm slop:delta') — the enforcing
         slop gate. 'lint:slop' ('slop-scan scan') is report-only and never fails.
     Add both, and set 'fetch-depth: 0' on the checkout so slop:delta can
     materialise the base ref as a worktree.

  Do NOT remove or duplicate top-level 'name:', 'on:', or 'jobs:' keys.
  YAML allows only one of each per file.

  --- begin bkit reference workflow ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference workflow ---

  After merging, push to a feature branch and verify the workflow runs to
  green before merging to your default branch.
`;
// CI_ROUTER_YML_MERGE_INSTRUCTIONS removed — `.github/workflows/bkit-cloud.yml`
// is now Tier 1 canonical-overwrite. The YAML is pure plumbing; all routing
// logic lives in the mirrored slash-command orchestrator. No consumer-side
// customisation surface, so no merge instructions are needed.
// DEPENDABOT_YML_MERGE_INSTRUCTIONS removed — `.github/renovate.json5` is now
// Tier 1 canonical-overwrite. bkit owns the config; consumers do not edit it.
// Renovate's `extends: ["config:recommended"]` covers the customisation surface
// that Dependabot required hand-editing for, so no merge advisory is needed.
const VALE_INI_MERGE_INSTRUCTIONS = `[bkit] .vale.ini exists — bkit cannot safely INI-merge (core options must precede [glob] sections per Vale spec). Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .vale.ini. Compare it to the bkit reference content below.

  Required merge actions:
  1. Ensure these three CORE options appear at the TOP of the file (above
     any [glob] section). If they are already present with different
     values, prefer the existing value:
        StylesPath = .vale/styles
        MinAlertLevel = warning
        Packages = write-good
  2. Ensure the SCOPED sections from the reference are present below the
     core options. If a section header (e.g. '[.agents/**]' or '[*.md]')
     already exists in the file, merge the rules into it rather than
     duplicating the header.
  3. Run 'vale sync' once after merging to install any newly-listed
     Packages (e.g. 'write-good').

  Vale will reject the file with error E201 if any core option appears
  AFTER a [glob] section, so ordering matters.

  --- begin bkit reference .vale.ini ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .vale.ini ---

  After merging, run 'vale .agents/' (or your scoped path) to verify the
  rules apply with no parse errors.
`;
const SLOP_SCAN_MERGE_INSTRUCTIONS = `[bkit] slop-scan.config.json exists — bkit will not overwrite. Review the reference defaults and merge the build-output ignores (see below).

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open slop-scan.config.json. Compare against the bkit reference below.
  Merge any new patterns/exclusions you find useful into the existing
  file. Keep your existing project-specific entries.

  IMPORTANT — build-output ignores: ensure your "ignores" array carries the
  depth-agnostic build-output globs from the reference — "**/dist/**",
  "**/coverage/**", "**/node_modules/**", "**/.next/**", "**/.turbo/**". The
  slop:delta gate scans the live working tree (--head .) against a clean base
  worktree, so any build output present locally but absent from that base reads
  as net-new slop and FAILs the gate. slop-scan honours only the ROOT
  .gitignore, so build output ignored by a nested .gitignore (e.g.
  apps/web/.gitignore) is NOT excluded — list it here. Root-relative globs
  ("dist/**") do NOT match nested build dirs ("apps/web/dist/"); use the "**/"
  form. Add your own generated dirs the same way (e.g. "**/.svelte-kit/**",
  "**/.nuxt/**", "**/out/**").

  --- begin bkit reference slop-scan.config.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference slop-scan.config.json ---
`;
const LINTSTAGED_MERGE_INSTRUCTIONS = `[bkit] .lintstagedrc.json exists — bkit will not overwrite. The bkit pre-commit hook calls \`pnpm lint-staged\`; ensure your config formats markdown/code on staged files (e.g. \`"*": "prettier --write --ignore-unknown"\`).

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .lintstagedrc.json. Compare against the bkit reference below.
  Keep your existing project-specific entries; ensure that staged
  files matching the bkit canonical paths get formatted on commit.

  --- begin bkit reference .lintstagedrc.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .lintstagedrc.json ---
`;
// Husky hooks moved from Tier 2 (managed-block enforced) to Tier 3 (seed-or-print)
// in v2.0.4. Real-world consumers routinely already run typecheck/test/format:check
// via turbo or lint-staged in their own hook content, making the bkit-managed block
// a duplicate — and the strict Tier-2 drift gate (`tier2-text-drift`) failed CI
// whenever the consumer customised the block, forcing them either back to the
// canonical form or to delete the block (which the next install would re-seed).
// Tier 3 seeds the canonical hook for new consumers and emits an advisory for
// existing consumers whose hook differs — no drift gate, no managed-block markers
// to keep in sync. Declarative pattern files (`.gitignore`, `.prettierignore`)
// stay Tier 2 because their semantics genuinely require additive merging; husky
// hooks are imperative scripts whose semantics are fully replaceable.
const HUSKY_PRE_COMMIT_MERGE_INSTRUCTIONS = `[bkit] .husky/pre-commit exists — bkit will not overwrite. Review the reference below and merge if useful; otherwise keep yours.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  bkit's reference pre-commit hook runs \`pnpm lint-staged && pnpm lint:prose\` (fast staged
  gate). The enforcing slop gate (\`pnpm slop:delta\`) and the heavier gates live in pre-push.
  Most consumers using turbo or their own lint-staged config already cover the
  equivalent — in that case, ignore this advisory and keep your existing hook.
  If your hook does NOT already format staged files / run a prose lint,
  consider adopting the reference, or merging the missing commands into yours.

  Monorepo note: do not add eslint to lint-staged. In a workspace it must run
  per-package via turbo (at pre-push) so each package's own flat config resolves;
  lint-staged passes repo-root-absolute paths that bypass per-package config.

  Migration note: bkit versions <= 2.0.3 wrote a marker-block (# bkit:start ..
  # bkit:end) around its hook commands and failed CI on drift. v2.0.4+ ships
  the hook as a full-file template (Tier 3 seed-or-print). If your file still
  contains bkit:start/bkit:end markers, you can safely delete them — the file
  is yours to own. The block content itself can stay or go.

  --- begin bkit reference .husky/pre-commit ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .husky/pre-commit ---
`;
const HUSKY_PRE_PUSH_MERGE_INSTRUCTIONS = `[bkit] .husky/pre-push exists — bkit will not overwrite. Review the reference below and merge if useful; otherwise keep yours.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  bkit's reference pre-push hook runs \`pnpm typecheck && pnpm test && pnpm format:check\`,
  then \`pnpm lint:prose\` + \`pnpm slop:delta\` (the enforcing slop gate — fails only on
  findings this push adds/worsens vs the base), then \`pnpm bkit check\` (the same drift gate
  CI runs — catching it locally saves a wasted CI cycle when someone bumps @cbartens/bkit
  without re-running \`bkit install\`). Together these make pre-push a full deterministic
  mirror of CI. Most consumers using turbo (e.g.
  \`npx turbo run lint typecheck format:check test\`) already cover the first
  three gates — in that case, add \`pnpm slop:delta\` + \`pnpm bkit check\` after your
  existing command. If your hook does NOT already run those gates, consider adopting the
  reference, or merging the missing commands into yours.

  Monorepo note: eslint is the one lint that legitimately belongs at pre-push rather
  than in lint-staged/pre-commit — it must run per-package via turbo (\`npx turbo run
  lint\`) so each package's own flat config resolves, and turbo scopes it to changed
  packages and caches the result. eslint placement is the only sanctioned deviation
  from bkit's lint-hook layout; keep format/prose/slop/drift gates where bkit puts them.

  Migration note: bkit versions <= 2.0.3 wrote a marker-block (# bkit:start ..
  # bkit:end) around its hook commands and failed CI on drift. v2.0.4+ ships
  the hook as a full-file template (Tier 3 seed-or-print). If your file still
  contains bkit:start/bkit:end markers, you can safely delete them — the file
  is yours to own. The block content itself can stay or go.

  --- begin bkit reference .husky/pre-push ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .husky/pre-push ---
`;
// CLOUD_BOOTSTRAP_MERGE_INSTRUCTIONS removed in BAR-191 follow-up — file is
// now Tier 2 markered-text; writeTier2 updates only the bkit:start/bkit:end
// block and preserves consumer extensions outside it. The cloud-env-customize
// advisory above carries the customization guidance.
const CURSOR_SETTINGS_MERGE_INSTRUCTIONS = `[bkit] .cursor/settings.json exists — bkit will not overwrite consumer Cursor config. Review the reference defaults and merge if useful.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/settings.json. Compare against the bkit reference below.
  Merge any new keys (e.g. plugin allowlists, MCP entries) you want.
  Keep your existing project-specific entries.

  --- begin bkit reference .cursor/settings.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/settings.json ---
`;
// CURSOR_DOCKERFILE_MERGE_INSTRUCTIONS removed in BAR-191 follow-up — file
// is now Tier 2 markered-text. bkit owns the toolchain block (vale + gh +
// jq + python3 + corepack-pinned pnpm); consumers customise Node major,
// Playwright, Supabase CLI, etc. OUTSIDE the markers and bkit preserves
// those across upgrades.
const ENV_EXAMPLE_MERGE_INSTRUCTIONS = `[bkit] .bkit/.env.example exists — bkit will not overwrite. Review the reference and merge any new entries.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .bkit/.env.example. Compare against the bkit reference below.
  Merge any new entries you find into your existing file — tracker/cloud-agent
  tokens (GH_MCP_TOKEN, GH_BKIT_TOKEN, LINEAR_API_KEY, ANTHROPIC_API_KEY,
  CURSOR_API_KEY) and the observability / debug-fetch operator creds
  (VERCEL_TOKEN, SUPABASE_ACCESS_TOKEN). Those debug-fetch creds are account-level
  READ creds, NOT app-runtime secrets — keep your app's keys out of this file. Keep
  any project-specific additions you have.

  --- begin bkit reference .bkit/.env.example ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .bkit/.env.example ---
`;
const ENVRC_MERGE_INSTRUCTIONS = `[bkit] .envrc exists — bkit will not overwrite. Ensure it loads .bkit/.env via direnv.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .envrc. Compare against the bkit reference below.
  Ensure the file contains \`dotenv_if_exists .bkit/.env\` so direnv
  auto-exports the tokens into your shell. Keep any existing lines.
  You can append more \`dotenv_if_exists <path>\` lines to expose additional
  env files (e.g. .env.local, infra/secrets.env); run \`direnv allow\` after.

  --- begin bkit reference .envrc ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .envrc ---
`;
// Note: BKIT_MODE_MERGE_INSTRUCTIONS was removed — .bkit/scripts/bkit-mode.sh is no
// longer shipped by bkit (retired with the ccr router and `bkit mode` surface in #245).
const MCP_ROOT_MERGE_INSTRUCTIONS = `[bkit] .mcp.json exists — bkit will not overwrite. Review the reference defaults and merge if needed.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .mcp.json. Compare against the bkit reference below.
  Keep any project-specific server entries you have added.

  --- begin bkit reference .mcp.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .mcp.json ---
`;
/**
 * Build filtered `.mcp.json` content for the given tracker.
 * - "github"  → keep only the `github` mcpServers entry.
 * - "linear"  → keep only the `linear` mcpServers entry.
 * - "none"    → empty mcpServers object (tracker not wired).
 */
/**
 * Render the tracker-filtered `.mcp.json` / `.cursor/mcp.json` content: keep only the selected
 * tracker's `mcpServers` entry (none → empty map). Token-free, so the output is the exact bytes
 * install seeds. Exported because the `bkit upgrade` template walk MUST render these the same way
 * (as a `contentOverride`, like bkit-cloud.yml #138 / opencode.json #245) — otherwise it compares
 * the RAW (all-tracker) template against the filtered on-disk seed and reports a false conflict on
 * every same-version run (#255 P3). Genuine consumer drift still differs from this and conflicts.
 */
export function buildMcpJson(templatePath, tracker) {
    const template = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    const all = template.mcpServers ?? {};
    const filtered = {};
    if (tracker !== "none" && Object.prototype.hasOwnProperty.call(all, tracker)) {
        filtered[tracker] = all[tracker];
    }
    return JSON.stringify({ mcpServers: filtered }, null, 2) + "\n";
}
/**
 * Seed-or-suggest a tracker-filtered MCP JSON file (Tier 3 semantics).
 * Absent → seed with filtered content. Present+different → push advisory.
 */
function seedMcpJson(templatePath, dstPath, tracker, mergeInstructions, dryRun, advisories, ws) {
    if (!fs.existsSync(templatePath))
        return { suggested: false };
    const content = buildMcpJson(templatePath, tracker);
    const basename = path.basename(dstPath);
    if (fs.existsSync(dstPath)) {
        const existing = fs.readFileSync(dstPath, "utf-8");
        if (existing !== content) {
            advisories.push({
                id: `tier3-merge-suggested-${basename}`,
                severity: "advisory",
                detect: `${dstPath} exists and differs from the bkit reference. Manual merge required.`,
                action: mergeInstructions.replace(/\{\{TEMPLATE_CONTENT\}\}/g, () => content.trimEnd()),
            });
            return { suggested: true };
        }
        return { suggested: false };
    }
    ws.writes.push({ path: dstPath, action: "write" });
    if (!dryRun) {
        ensureDir(path.dirname(dstPath));
        fs.writeFileSync(dstPath, content, "utf-8");
    }
    return { suggested: false };
}
const CURSOR_MCP_MERGE_INSTRUCTIONS = `[bkit] .cursor/mcp.json exists — bkit will not overwrite. Review the reference defaults and merge if needed.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/mcp.json. Compare against the bkit reference below.
  Ensure the mcpServers object contains entries for both "linear" and "github".
  Keep any project-specific server entries you have added.

  --- begin bkit reference .cursor/mcp.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/mcp.json ---
`;
const CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS = `[bkit] .cursor/environment.json exists — bkit will not overwrite. This file is fully consumer-owned because the \`install\` / \`start\` / \`terminals[]\` / \`env\` fields are typically repo-specific.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/environment.json. Compare against the bkit reference below.
  Merge new top-level fields if useful; keep your project-specific overrides.

  Typical non-trivial customisations consumers add:
  - Monorepo prebuild: \`"install": "pnpm install --frozen-lockfile && npx turbo run build --filter='./packages/*'"\`
    so workspace packages are compiled before the agent starts.
  - Dev-server terminal + port forwarding: \`env: { PORT: "4000" }\` plus a
    \`terminals[]\` entry that runs \`pnpm turbo dev --filter=web\` with
    \`ports: [4000]\` exposed.
  - \`start\` field with a one-line "read docs/deployments.md before setup"
    nudge so the agent doesn't blindly run dev commands.

  The bkit baseline runs \`pnpm install --frozen-lockfile && vale sync\` (when
  .vale.ini exists). Replace if your monorepo needs prebuild, your repo uses
  npm/yarn/bun, or you don't ship vale.

  --- begin bkit reference .cursor/environment.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/environment.json ---
`;
// ---------------------------------------------------------------------------
// runCiModule — .github/workflows/ci.yml (Tier 3 seed-or-print)
//
// Switched from Tier 2 to Tier 3 in v0.2.1 — appending a complete workflow
// to an existing ci.yml produces duplicate top-level keys (invalid GHA YAML).
// Bkit can't safely YAML-merge, so we seed when absent and print AI-actionable
// merge instructions when present.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// deriveCiSkeleton — turn the WIRED ci.yml template into the stack-agnostic SKELETON
// by commenting out every line inside each `# bkit:start ts-ci-steps` … `# bkit:end
// ts-ci-steps` region. The wired template is the single source of truth (bkit dogfoods
// it); the skeleton is purely derived, so the two never drift (#265). The result is
// valid YAML whose Node/TS step bodies are inert, copy-to-adapt examples — a non-Node
// consumer (`--ci` without `--typescript`) gets a workflow that runs trivially green.
// ---------------------------------------------------------------------------
const CI_TS_REGION_START = /^\s*#\s*bkit:start ts-ci-steps\s*$/;
const CI_TS_REGION_END = /^\s*#\s*bkit:end ts-ci-steps\s*$/;
export function deriveCiSkeleton(content) {
    const lines = content.split("\n");
    let inRegion = false;
    const out = lines.map((line) => {
        if (CI_TS_REGION_START.test(line)) {
            inRegion = true;
            return line;
        }
        if (CI_TS_REGION_END.test(line)) {
            inRegion = false;
            return line;
        }
        if (inRegion && line.trim() !== "") {
            // Insert "# " after the leading whitespace so indentation is preserved.
            const m = /^(\s*)(.*)$/.exec(line);
            return m ? `${m[1]}# ${m[2]}` : `# ${line}`;
        }
        return line;
    });
    return out.join("\n");
}
export function runCiModule(ctx) {
    const { dryRun, tokens, ws, advisories, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    // Wired (Node/TS step bodies active) when the TS toolchain is co-installed
    // (--typescript/--tooling ⇒ `lint` present). Otherwise seed the agnostic skeleton.
    const wiredCi = ctx.wiredCi === true;
    const templatePath = path.join(getTemplatesRoot(), ".github", "workflows", "ci.yml");
    if (!fs.existsSync(templatePath)) {
        console.warn(`${logPrefix} CI template not found at ${templatePath} — skipping CI module`);
        return;
    }
    // BAR-164 guard: refuse to seed a canonical template that contains a
    // `uses: cbartens/bkit/...@<ref>` reference. While `cbartens/bkit` stays
    // private and consumers live in other GitHub orgs, the runner's GITHUB_TOKEN
    // cannot resolve such a reference and CI fails with "repository not found"
    // before any install step runs. The canonical install flow is the install
    // step's `pnpm config set` (writes the token to pnpm's user-level config) +
    // GH_BKIT_TOKEN env — see README §"Consumer CI auth". Hard error so the
    // regression is caught at dev/CI time, never written into a consumer repo.
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const foreignUses = scanForeignBkitUses(templateContent);
    if (foreignUses.length > 0) {
        throw new Error(`${logPrefix} canonical CI template contains cross-org private \`uses:\` reference(s) — consumer auth cannot resolve them at action-resolution time. Remove from .bkit/templates/.github/workflows/ci.yml and use the env-var pattern (GH_BKIT_TOKEN env on \`pnpm install\`) instead. See README §"Consumer CI auth" / BAR-164. Offending reference(s):\n  - ${foreignUses.join("\n  - ")}`);
    }
    const dstPath = path.join(".github", "workflows", "ci.yml");
    const prevLen = ws.writes.length;
    const result = writeTier3(templatePath, dstPath, dryRun, advisories, ws, CI_YML_MERGE_INSTRUCTIONS, tokens, wiredCi ? undefined : deriveCiSkeleton);
    if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}ci: ${dstPath}${wiredCi ? "" : " (skeleton — no --typescript)"}`);
    }
    else if (result.suggested) {
        console.log(`${logPrefix} ${tag}ci: ${dstPath} (exists; AI merge instructions printed)`);
    }
    // bkit-cloud.yml is no longer shipped by the ci module (`--tooling`). Post-CI
    // auto-routing is now opt-in via `bkit install --auto=<variant>` (see `runCloudModule`
    // below). The router is inert without ANTHROPIC_API_KEY + LINEAR_API_KEY secrets, GitHub
    // Actions write permissions, and (Cursor half) a dashboard trigger — and it
    // depends on the issue tracker, which is itself opt-in. Shipping it on every
    // tooling install wired an autonomous router to a tracker that may
    // not be configured. See issue #119 ("Managed Cloud Agents").
    // renovate.json5 is no longer shipped by the ci module (`--tooling`). Renovate is opt-in via
    // `bkit install --dependency=renovate` (phase-gated). See `runRenovateModule` below
    // and issue #123 follow-up for rationale (Renovate App's first scan reads
    // the default branch, so the file must reach `main` before App install —
    // default install can't sequence that).
    // Vale prose-lint config is stack-agnostic (external binary, lints .md) → ships with
    // --ci (#265). The `lint:prose` npm wrapper + typecheck/test package.json footprint live
    // under --typescript (runLintModule); --ci has NO package.json footprint so a non-Node
    // consumer can install it and stay green.
    const templatesBase = getTemplatesRoot();
    // .vale.ini — Tier 3 (seed-or-print).
    const valeIniSrc = path.join(templatesBase, ".vale.ini");
    if (fs.existsSync(valeIniSrc)) {
        const valeDst = ".vale.ini";
        const prevValeLen = ws.writes.length;
        const valeRes = writeTier3(valeIniSrc, valeDst, dryRun, advisories, ws, VALE_INI_MERGE_INSTRUCTIONS);
        if (ws.writes.length > prevValeLen) {
            console.log(`${logPrefix} ${tag}ci: ${valeDst}`);
        }
        else if (valeRes.suggested) {
            console.log(`${logPrefix} ${tag}ci: ${valeDst} (exists; AI merge instructions printed)`);
        }
    }
    // .vale/styles/House/ — Tier 1 (fully managed).
    const valeStylesSrc = path.join(templatesBase, ".vale", "styles", "House");
    if (fs.existsSync(valeStylesSrc)) {
        const valeStylesDst = path.join(".vale", "styles", "House");
        ensureDir(valeStylesDst);
        for (const file of fs.readdirSync(valeStylesSrc)) {
            const srcPath = path.join(valeStylesSrc, file);
            const dstFilePath = path.join(valeStylesDst, file);
            if (!fs.statSync(srcPath).isFile())
                continue;
            const prevStyleLen = ws.writes.length;
            writeTier1(srcPath, dstFilePath, tokens, dryRun, ws);
            if (ws.writes.length > prevStyleLen) {
                console.log(`${logPrefix} ${tag}ci: ${dstFilePath}`);
            }
        }
    }
    // Note: GH_BKIT_TOKEN secret check and Vercel detection are now Phase 3 responsibilities.
    // runPostInstallCheck in bkit-postinstall.ts handles them after writes complete.
}
// ---------------------------------------------------------------------------
// runLintModule — vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore
// ---------------------------------------------------------------------------
export function runLintModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const templatesBase = getTemplatesRoot();
    // Vale config (.vale.ini + .vale/styles/House) moved to the stack-agnostic `ci` module
    // (#265) — vale is an external binary that lints .md, so it is not Node/TS-coupled. The
    // `lint:prose` npm wrapper stays here (a package.json/Node convenience). --typescript
    // always co-installs `ci`, so a --typescript consumer still gets the vale config.
    // slop-scan.config.json — Tier 3 (seed-or-print)
    const slopSrc = path.join(templatesBase, "slop-scan.config.json");
    if (fs.existsSync(slopSrc)) {
        const slopDst = "slop-scan.config.json";
        const prevLen = ws.writes.length;
        const slopRes = writeTier3(slopSrc, slopDst, dryRun, advisories, ws, SLOP_SCAN_MERGE_INSTRUCTIONS);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${slopDst}`);
        }
        else if (slopRes.suggested) {
            console.log(`${logPrefix} ${tag}lint: ${slopDst} (exists; AI merge instructions printed)`);
        }
    }
    // .lintstagedrc.json — Tier 3 (seed-or-print). Pairs with the lint-staged
    // call in the bkit-managed pre-commit hook block; without the config file
    // lint-staged errors out at commit time.
    const lintstagedSrc = path.join(templatesBase, ".lintstagedrc.json");
    if (fs.existsSync(lintstagedSrc)) {
        const lintstagedDst = ".lintstagedrc.json";
        const prevLen = ws.writes.length;
        const lintstagedRes = writeTier3(lintstagedSrc, lintstagedDst, dryRun, advisories, ws, LINTSTAGED_MERGE_INSTRUCTIONS);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${lintstagedDst}`);
        }
        else if (lintstagedRes.suggested) {
            console.log(`${logPrefix} ${tag}lint: ${lintstagedDst} (exists; AI merge instructions printed)`);
        }
    }
    // .prettierignore — Tier 2 hash-comment
    const prettierSrc = path.join(templatesBase, ".prettierignore");
    if (fs.existsSync(prettierSrc)) {
        const prettierDst = ".prettierignore";
        const prevLen = ws.writes.length;
        writeTier2(prettierSrc, prettierDst, tokens, "hash-comment", dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${prettierDst}`);
        }
    }
    // slop-scan helper scripts — moved OUT of the core template walk (#265) so they ship
    // ONLY with the TS toolchain (--typescript), never to a non-Node --ci consumer. Tier 1
    // (bkit-owned, force-overwritten; core pass would preserve the +x bit, writeTier1 copies
    // the source mode). Listed in CORE_TEMPLATE_PATH_EXCLUDE so the core pass skips them.
    for (const script of ["bkit-slop-type-suppression.mjs", "bkit-slop-delta.sh"]) {
        const scriptSrc = path.join(templatesBase, ".bkit", "scripts", script);
        if (!fs.existsSync(scriptSrc))
            continue;
        const scriptDst = path.join(".bkit", "scripts", script);
        ensureDir(path.dirname(scriptDst));
        const prevLen = ws.writes.length;
        writeTier1(scriptSrc, scriptDst, tokens, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}lint: ${scriptDst}`);
        }
    }
    // Ensure the package.json scripts the seeded configs + wired ci.yml expect actually
    // exist. Add-if-missing; consumer values win. `typecheck` moved here from the (now
    // agnostic) ci module (#265) — it is TS-exclusive; default is tsconfig-aware.
    const typecheckDefault = fs.existsSync("tsconfig.json")
        ? "tsc --noEmit"
        : 'echo "[bkit] typecheck: no tsconfig.json — skipping" >&2';
    const lintScripts = ensurePackageJsonScripts({
        typecheck: typecheckDefault,
        "format:check": "prettier --check .",
        "lint:prose": 
        // F9 (BAR-138): symmetric soft-skip — protect against missing vale
        // binary AND missing referenced packages (e.g. write-good not synced
        // after .vale.ini was rewritten or after a clean checkout). Hard-failing
        // on a missing package would break local commits via the pre-commit
        // hook with no actionable signal.
        'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
        "lint:slop": "slop-scan scan .",
        // The enforcing slop gate (lint:slop above is an advisory scan that never fails).
        "slop:delta": "bash .bkit/scripts/bkit-slop-delta.sh",
    }, dryRun, ws);
    if (lintScripts.added.length > 0) {
        console.log(`${logPrefix} ${tag}lint: package.json scripts added [${lintScripts.added.join(", ")}]`);
    }
    if (lintScripts.missingPkg) {
        advisories.push({
            id: "lint-package-json-missing",
            severity: "advisory",
            detect: "package.json not found — cannot ensure lint scripts.",
            action: "Configs are installed but ci.yml steps will fail until you add `format:check`, `lint:prose`, `lint:slop`, `slop:delta` scripts to package.json.",
        });
    }
    else if (lintScripts.malformed) {
        advisories.push({
            id: "lint-package-json-malformed",
            severity: "advisory",
            detect: "package.json failed to parse — cannot ensure lint scripts.",
            action: "Fix the JSON syntax error in package.json and re-run `pnpm bkit install`.",
        });
    }
    // The `test` script is the consumer's responsibility — flag if absent so they know
    // (the wired ci.yml step bodies call `pnpm test`). Moved here from runCiModule (#265):
    // the agnostic --ci skeleton has the test step commented, so the advisory belongs with
    // the TS toolchain that activates it.
    if (!dryRun && !lintScripts.missingPkg && !lintScripts.malformed) {
        try {
            const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
            if (!pkg.scripts || !pkg.scripts.test) {
                advisories.push({
                    id: "ci-no-test-script",
                    severity: "advisory",
                    detect: "package.json has no `test` script.",
                    action: 'The wired ci.yml calls `pnpm test` — add a script (e.g. `"test": "vitest run"`) or remove the step from ci.yml.',
                });
            }
        }
        catch {
            // Already handled above
        }
    }
    // Ensure devDeps for the tools the lint scripts call. Vale is a system tool
    // (binary) and is documented as a prereq instead of a managed devDep.
    const lintDevDeps = ensurePackageJsonDevDeps({
        prettier: "^3.5.3",
        "slop-scan": "^0.3.0",
        "lint-staged": "^15.2.10",
    }, dryRun, ws);
    if (lintDevDeps.added.length > 0) {
        console.log(`${logPrefix} ${tag}lint: package.json devDependencies added [${lintDevDeps.added.join(", ")}] — run \`pnpm install\` to fetch`);
        // Thread devDepsAdded through the WriteSet for Phase 3 detection
        const lastWrite = ws.writes[ws.writes.length - 1];
        if (lastWrite && lastWrite.path === "package.json") {
            lastWrite.devDepsAdded = lintDevDeps.added;
        }
    }
    // vale sync advisory removed in v2.1.0 — duplicated by `vale-package-not-synced`
    // (Phase 3, gated on `vale --version` actually succeeding). The Phase 3 variant
    // is actionable; this one fired on every install regardless of vale presence.
}
// ---------------------------------------------------------------------------
// runGitHooksModule — .husky/pre-commit + .husky/pre-push (Tier 3 seed-or-print)
//
// Switched from Tier 2 (managed-block) to Tier 3 (seed-or-print) in v2.0.4.
// Rationale: imperative hook scripts don't need the additive-merge semantics
// of `.gitignore` / `.prettierignore`. Consumers with their own turbo /
// lint-staged hook content fully replace bkit's commands and would otherwise
// fail the `tier2-text-drift` gate every install. Tier 3 seeds the canonical
// hook for new consumers, prints AI-actionable merge instructions when one
// already exists, and never enforces drift. See KN entry / CHANGELOG 2.0.4.
// ---------------------------------------------------------------------------
const HUSKY_MERGE_INSTRUCTIONS = {
    "pre-commit": HUSKY_PRE_COMMIT_MERGE_INSTRUCTIONS,
    "pre-push": HUSKY_PRE_PUSH_MERGE_INSTRUCTIONS,
};
export function runGitHooksModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const huskyTemplatesDir = path.join(getTemplatesRoot(), ".husky");
    if (!fs.existsSync(huskyTemplatesDir)) {
        console.warn(`${logPrefix} .husky templates not found at ${huskyTemplatesDir} — skipping git-hooks module`);
        return;
    }
    ensureDir(".husky");
    for (const hookName of ["pre-commit", "pre-push"]) {
        const srcPath = path.join(huskyTemplatesDir, hookName);
        if (!fs.existsSync(srcPath))
            continue;
        const dstPath = path.join(".husky", hookName);
        const prevLen = ws.writes.length;
        const result = writeTier3(srcPath, dstPath, dryRun, advisories, ws, HUSKY_MERGE_INSTRUCTIONS[hookName], tokens);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}git-hooks: ${dstPath}`);
            if (!dryRun && fs.existsSync(dstPath)) {
                fs.chmodSync(dstPath, 0o755);
            }
        }
        else if (result.suggested) {
            console.log(`${logPrefix} ${tag}git-hooks: ${dstPath} (exists; AI merge instructions printed)`);
        }
    }
    // Ensure `prepare: husky install` exists so hooks activate on `pnpm install`.
    // Husky 9+ requires this; without it, the .husky/* files exist but never run.
    // Husky 9+: `husky install` was renamed to plain `husky` (legacy form prints
    // "DEPRECATED" warning on every `pnpm install`). Bkit ships the modern form
    // for new consumers; existing consumers with `husky install` keep theirs
    // (consumer-value-wins) — they can manually shorten to silence the warning.
    const hookScripts = ensurePackageJsonScripts({ prepare: "husky" }, dryRun, ws);
    if (hookScripts.added.length > 0) {
        console.log(`${logPrefix} ${tag}git-hooks: package.json scripts added [${hookScripts.added.join(", ")}]`);
    }
    if (hookScripts.missingPkg) {
        advisories.push({
            id: "git-hooks-package-json-missing",
            severity: "advisory",
            detect: "package.json not found — cannot ensure `prepare` script.",
            action: 'Hooks installed but won\'t activate until you add `"prepare": "husky"` to package.json and run `pnpm install`.',
        });
    }
    else if (hookScripts.malformed) {
        advisories.push({
            id: "git-hooks-package-json-malformed",
            severity: "advisory",
            detect: "package.json failed to parse — cannot ensure `prepare` script.",
            action: "Fix the JSON syntax error in package.json and re-run `pnpm bkit install`.",
        });
    }
    else if (hookScripts.preserved.includes("prepare")) {
        // Consumer has a custom `prepare` value — note it but don't override.
        // Either `husky` (modern, 9+) or `husky install` (legacy) activates the
        // hooks; the legacy form just emits a deprecation warning on each install.
        advisories.push({
            id: "git-hooks-package-json-preserved-prepare",
            severity: "advisory",
            detect: "package.json `prepare` already set (preserved — consumer value wins).",
            action: "Ensure it runs `husky` (or legacy `husky install`) for hooks to activate. The modern form is plain `husky`; `husky install` emits a deprecation warning on each `pnpm install`.",
        });
    }
    // Ensure husky devDep — without it, the `prepare: husky install` script we
    // just added blows up on `pnpm install` with `husky: not found`. Surfaced
    // by BAR-138 Finding 5 during consumer-repo smoke testing.
    const hookDevDeps = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, dryRun, ws);
    if (hookDevDeps.added.length > 0) {
        console.log(`${logPrefix} ${tag}git-hooks: package.json devDependencies added [${hookDevDeps.added.join(", ")}] — run \`pnpm install\` to fetch`);
        // husky-devdep-added advisory removed in v2.1.0 — duplicated by the generic
        // `devdeps-need-fetch` Phase 3 advisory which fires for any added devDep.
        // Thread devDepsAdded through the WriteSet for Phase 3 detection.
        const lastWrite = ws.writes[ws.writes.length - 1];
        if (lastWrite && lastWrite.path === "package.json") {
            lastWrite.devDepsAdded = hookDevDeps.added;
        }
    }
}
// ---------------------------------------------------------------------------
// runRenovateModule — opt-in `.github/renovate.json5` (phase-gated)
// ---------------------------------------------------------------------------
//
// Renovate is NOT shipped by default install (--full). It's opt-in via
// `bkit install --dependency=renovate` and runs a two-phase flow gated on whether the
// config has reached the remote default branch:
//
//   Phase A — file NOT yet on origin/<DEFAULT_BRANCH>:
//     Writes the file to the working tree and emits a "commit + PR to main,
//     then re-run" advisory. Does NOT print the App-install URL — installing
//     the App before the config reaches the default branch causes Renovate
//     to fire its default onboarding flow (broken; ignores the shipped
//     config). See issue #123 follow-up.
//
//   Phase B — file IS on origin/<DEFAULT_BRANCH>:
//     Re-writes the file (idempotent byte-equal) and emits the App-install
//     URL + activation checklist.
// Seed content for `.github/renovate-local.json5` — the consumer-owned overrides
// file pulled in by renovate.json5's `extends`. bkit writes this ONCE (create-if-
// absent) and never touches it again: it is NOT a managed template (no Tier-1/2/3
// candidate), so neither `bkit install` nor `bkit upgrade` overwrites or nags about
// it. The `extends` target must exist or Renovate raises a config error, so the
// stub guarantees a resolvable, valid (if empty) preset from the first commit.
const RENOVATE_LOCAL_STUB = `// Consumer-owned Renovate overrides. bkit does NOT manage or overwrite this file.
//
// \`.github/renovate.json5\` (bkit-owned, rewritten on every \`bkit install\`) pulls
// this file in via \`extends: ["local>OWNER/REPO//.github/renovate-local.json5"]\`. Put
// repo-specific Renovate rules here — they survive \`bkit install\`/\`bkit upgrade\`.
//
// Precedence: rules here are evaluated BEFORE bkit's built-in rules in renovate.json5,
// so this file can ADD rules and set keys bkit leaves unset — notably \`enabled: false\`
// to fence a package — but it canNOT override a key bkit sets explicitly (e.g.
// \`automerge\`). Renovate resolves this preset from your DEFAULT branch; commit it
// alongside renovate.json5 and land both on the default branch before activating the
// Renovate App. To resolve it from a different branch, append \`#<branch>\` to the
// extends entry in renovate.json5 (e.g. \`.../renovate-local.json5#dev\`).
//
// Example — fence a package pinned in root \`pnpm.overrides\` so Renovate's hosted
// lockfile regen can't rewrite the locked version and desync pnpm-lock.yaml (which
// would fail CI's \`pnpm install --frozen-lockfile\`):
//
//   packageRules: [
//     { matchPackageNames: ["react", "react-dom", "react-test-renderer"], enabled: false },
//   ],
{
  $schema: "https://docs.renovatebot.com/renovate-schema.json",

  // Private-registry read auth for the restricted \`@cbartens/bkit\` package on
  // npm.pkg.github.com. Renovate resolves the WHOLE workspace (incl. this package)
  // to regenerate pnpm-lock.yaml for ANY dependency bump — without a token the regen
  // 401s, every dependency PR lands with a stale lockfile, and CI fails
  // \`pnpm install --frozen-lockfile\` (ERR_PNPM_OUTDATED_LOCKFILE). The GitHub-Actions
  // \`GH_BKIT_TOKEN\` CI secret is NOT visible to Mend's hosted runner — provision it
  // on Renovate's side, then activate the token below. This anchor lives here
  // (consumer-owned) and NOT in renovate.json5 (canonical-overwrite, clobbered every
  // \`bkit upgrade\`): Renovate merges hostRules across presets, so the token SURVIVES
  // upgrades.
  //   - Mend hosted: add \`GH_BKIT_TOKEN\` (a PAT with \`read:packages\`) as a Mend
  //     repository secret (https://developer.mend.io/github/<owner>/<repo> → Settings →
  //     Secrets). You MUST tick "If checked - secret will be used during the scan as an
  //     environment variable." — without it the secret is never exposed to the scan and
  //     regen still 401s. Then uncomment the \`token:\` line below.
  //   - Self-hosted: inject via the \`RENOVATE_HOST_RULES\` env var or an \`encrypted\`
  //     block — no edit needed here.
  hostRules: [
    {
      matchHost: "npm.pkg.github.com",
      hostType: "npm",
      // token: "{{ secrets.GH_BKIT_TOKEN }}",
    },
  ],

  packageRules: [],
}
`;
// Customization guidance appended to EVERY renovate install advisory (Phase A
// and Phase B), so a consumer learns where their overrides go before they reach
// Phase B — not only at App-activation time. The load-bearing point: renovate.json5
// is bkit-owned and overwritten on every install, so any override that would
// conflict with it belongs in renovate-local.json5, which survives install/upgrade.
const RENOVATE_CUSTOMIZE_NOTE = "Customizing Renovate: do NOT edit `.github/renovate.json5` — it's bkit-owned and rewritten on every `bkit install`/`bkit upgrade`, so changes there are lost on the next run. Put repo-specific rules in `.github/renovate-local.json5` instead (consumer-owned; bkit never overwrites it). On conflict renovate-local ADDS to bkit's rules and can set keys bkit leaves unset (notably `enabled: false` to fence a package) but canNOT override a key bkit sets explicitly (e.g. `automerge`). Common case — fence a package pinned in `pnpm.overrides` so Renovate's lockfile regen can't desync it: add `{ matchPackageNames: [\"<pkg>\"], enabled: false }` to its `packageRules`. Renovate resolves that file from the default branch, so land changes there.";
function isRenovateConfigOnDefaultBranch(defaultBranch, cwd) {
    try {
        // Strip git hook env vars so this git command operates on the repo at `cwd`
        // rather than the GIT_DIR injected by the pre-push hook runner.
        const env = { ...process.env };
        delete env["GIT_DIR"];
        delete env["GIT_WORK_TREE"];
        execSync(`git cat-file -e origin/${defaultBranch}:.github/renovate.json5`, {
            cwd,
            stdio: ["ignore", "ignore", "ignore"],
            env,
        });
        return true;
    }
    catch {
        return false;
    }
}
export function runRenovateModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    // Mutually exclusive with --dependabot — refuse if Dependabot config exists.
    // Both opening PRs against the same packages is silly and creates noise.
    const dependabotYml = path.join(process.cwd(), ".github", "dependabot.yml");
    const dependabotYaml = path.join(process.cwd(), ".github", "dependabot.yaml");
    if (fs.existsSync(dependabotYml) || fs.existsSync(dependabotYaml)) {
        advisories.push({
            id: "renovate-dependabot-mutually-exclusive",
            severity: "blocker",
            detect: "`.github/dependabot.yml` is present — Renovate and Dependabot are mutually exclusive (running both opens competing PRs against the same packages). Refusing to install Renovate.",
            action: "Choose one:\n\n" +
                "  A. Switch to Renovate (recommended):\n" +
                "     1. `git rm .github/dependabot.yml` (also `git rm .bkit/scripts/bkit-set-dependabot.sh` if present).\n" +
                "     2. GitHub UI → Settings → Code security → Dependabot version updates → Disable. Leave Dependabot ALERTS on.\n" +
                "     3. Re-run `pnpm bkit install --dependency=renovate`.\n\n" +
                "  B. Keep Dependabot: skip renovate; run `pnpm bkit install --dependency=dependabot` to keep using bkit's Dependabot module.",
        });
        return;
    }
    const renovateSrc = path.join(getTemplatesRoot(), ".github", "renovate.json5");
    if (!fs.existsSync(renovateSrc))
        return;
    const renovateDst = path.join(".github", "renovate.json5");
    const prevLen = ws.writes.length;
    writeTier1(renovateSrc, renovateDst, tokens, dryRun, ws);
    if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}renovate: ${renovateDst}`);
    }
    // Seed the consumer-owned overrides file pulled in by renovate.json5's `extends`.
    // Create-if-absent only: once written it is the consumer's — never overwritten,
    // never diffed, no nag advisory (its whole purpose is to diverge from this stub).
    // It is deliberately NOT a managed template, so `bkit upgrade` ignores it too.
    const renovateLocalDst = path.join(".github", "renovate-local.json5");
    if (!fs.existsSync(renovateLocalDst)) {
        if (!dryRun) {
            fs.mkdirSync(path.dirname(renovateLocalDst), { recursive: true });
            fs.writeFileSync(renovateLocalDst, RENOVATE_LOCAL_STUB, "utf-8");
        }
        ws.writes.push({ path: renovateLocalDst, action: "write" });
        console.log(`${logPrefix} ${tag}renovate (consumer overrides): ${renovateLocalDst}`);
    }
    // Record the choice so the post-install advisory stays quiet about
    // "undecided dep updater" and the mutual-exclusion check has a record.
    setConsumerBkitField("depUpdater", "renovate", dryRun);
    const defaultBranch = tokens.DEFAULT_BRANCH;
    const onDefault = isRenovateConfigOnDefaultBranch(defaultBranch, process.cwd());
    if (!onDefault) {
        advisories.push({
            id: "renovate-phase-a-pr-to-default-branch",
            severity: "advisory",
            detect: `.github/renovate.json5 is in the working tree but not yet on origin/${defaultBranch}. The Renovate GitHub App's first scan reads the default branch — installing the App before the config lands there triggers a broken onboarding PR that ignores this config (issue #123).`,
            action: "Phase A — land the config on the default branch BEFORE installing the Renovate App:\n\n" +
                "  1. Commit BOTH `.github/renovate.json5` AND `.github/renovate-local.json5` (the consumer-owned overrides file renovate.json5 pulls in via `extends`). Renovate raises a config error if the `extends` target is missing, so they must travel together.\n" +
                `  2. Open a PR to your integration branch and merge it through to \`${defaultBranch}\`.\n` +
                `  3. Re-run \`pnpm bkit install --dependency=renovate\` once the files are on \`origin/${defaultBranch}\`. The command will detect it and print the App-install URL (Phase B).\n\n` +
                "Do NOT install the Renovate App yet — that's Phase B. Installing it now produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`).\n\n" +
                RENOVATE_CUSTOMIZE_NOTE,
        });
        return;
    }
    advisories.push({
        id: "renovate-phase-b-install-app",
        severity: "advisory",
        detect: `.github/renovate.json5 is present on origin/${defaultBranch} — ready for Renovate GitHub App activation.`,
        action: "Phase B — activate Renovate by installing the GitHub App (one-time, manual, free; bkit cannot automate this — no `gh api` equivalent exists):\n\n" +
            "  1. Open https://github.com/apps/renovate and click Install.\n" +
            '  2. Choose "Only select repositories" → pick this repo.\n' +
            "  3. Grant Renovate read-auth to the private `@cbartens/bkit` package — REQUIRED, else every dependency PR fails CI with `ERR_PNPM_OUTDATED_LOCKFILE`. Renovate resolves the whole workspace (incl. the GitHub Packages `@cbartens/bkit`) to regenerate `pnpm-lock.yaml`; the CI `GH_BKIT_TOKEN` secret is NOT visible to Mend's runner. Your consumer-owned `.github/renovate-local.json5` ships a commented `hostRules` token anchor for `npm.pkg.github.com` — activate it (it survives `bkit upgrade`; the canonical `renovate.json5` deliberately holds no token):\n" +
            '     - Mend hosted: dashboard → https://developer.mend.io/github/<owner>/<repo> → Settings → Secrets → add `GH_BKIT_TOKEN` (PAT with `read:packages`). CRITICAL: in the secret dialog, tick "If checked - secret will be used during the scan as an environment variable." — without it the secret is not exposed to the scan and lockfile regen still 401s. Then uncomment `token: "{{ secrets.GH_BKIT_TOKEN }}"` in `.github/renovate-local.json5`.\n' +
            "     - Self-hosted: set the `RENOVATE_HOST_RULES` env var (or an `encrypted` block). See docs/deployments.md § GitHub Actions pinning.\n" +
            '  4. Wait ~5 minutes for Renovate\'s onboarding PR. Verify it targets your integration branch (the shipped config sets `baseBranches: ["dev"]`).\n' +
            "     - If the onboarding PR targets a different branch, adds a redundant root `renovate.json`, or proposes 40+ ungrouped PRs: close it. Renovate scanned a stale commit. Re-trigger from the Mend dashboard at https://developer.mend.io/github/<owner>/<repo>.\n" +
            "  5. (If migrating from Dependabot) GitHub UI → Settings → Code security → Dependabot version updates → Disable. Leave Dependabot ALERTS on (Renovate's `osvVulnerabilityAlerts` surfaces them via the same Security tab).\n" +
            "  6. Merge the onboarding PR. The first batch of grouped update PRs follows on the next scheduled run (Monday ~06:00 UTC).\n\n" +
            RENOVATE_CUSTOMIZE_NOTE,
    });
}
// ---------------------------------------------------------------------------
// runDependabotModule — opt-in `.github/dependabot.yml` + helper script
// ---------------------------------------------------------------------------
//
// Dependabot is NOT shipped by default install (--full). It's opt-in via
// `bkit install --dependency=dependabot` and is mutually exclusive with `--renovate`.
//
// Unlike Renovate, Dependabot is first-party GitHub and does NOT have an
// App-install race condition — the `dependabot.yml` file is read directly
// from the default branch by GitHub's hosted Dependabot service. The only
// out-of-band setup is the repo-level Dependabot toggles (auto-fixes-enabled,
// vulnerability-alerts), which the shipped helper script `bkit-set-dependabot.sh`
// flips via `gh api`.
export function runDependabotModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    // Mutually exclusive with --renovate — refuse if Renovate config exists.
    const renovateJson5 = path.join(process.cwd(), ".github", "renovate.json5");
    const renovateJson = path.join(process.cwd(), ".github", "renovate.json");
    if (fs.existsSync(renovateJson5) || fs.existsSync(renovateJson)) {
        advisories.push({
            id: "dependabot-renovate-mutually-exclusive",
            severity: "blocker",
            detect: "`.github/renovate.json5` is present — Renovate and Dependabot are mutually exclusive (running both opens competing PRs against the same packages). Refusing to install Dependabot.",
            action: "Choose one:\n\n" +
                "  A. Switch to Dependabot:\n" +
                "     1. `git rm .github/renovate.json5`.\n" +
                "     2. Uninstall the Renovate GitHub App at https://github.com/settings/installations → Renovate → Configure → Uninstall.\n" +
                "     3. Re-run `pnpm bkit install --dependency=dependabot`.\n\n" +
                "  B. Keep Renovate (recommended — see docs/deployments.md § GitHub Actions pinning): skip dependabot; the existing Renovate setup stays.",
        });
        return;
    }
    // Write Tier 1: dependabot.yml + bkit-set-dependabot.sh.
    const ymlSrc = path.join(getTemplatesRoot(), ".github", "dependabot.yml");
    const scriptSrc = path.join(getTemplatesRoot(), ".bkit", "scripts", "bkit-set-dependabot.sh");
    if (!fs.existsSync(ymlSrc) || !fs.existsSync(scriptSrc))
        return;
    const ymlDst = path.join(".github", "dependabot.yml");
    const scriptDst = path.join(".bkit", "scripts", "bkit-set-dependabot.sh");
    const prevLen = ws.writes.length;
    writeTier1(ymlSrc, ymlDst, tokens, dryRun, ws);
    if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}dependabot: ${ymlDst}`);
    }
    const prevLen2 = ws.writes.length;
    writeTier1(scriptSrc, scriptDst, tokens, dryRun, ws);
    if (ws.writes.length > prevLen2) {
        console.log(`${logPrefix} ${tag}dependabot: ${scriptDst}`);
        // Preserve executable bit on the helper script.
        if (!dryRun) {
            try {
                fs.chmodSync(scriptDst, 0o755);
            }
            catch {
                // non-fatal — surface via advisory below
            }
        }
    }
    // Record the choice (parity with renovate path).
    setConsumerBkitField("depUpdater", "dependabot", dryRun);
    advisories.push({
        id: "dependabot-setup-repo-state",
        severity: "advisory",
        detect: "`.github/dependabot.yml` and `.bkit/scripts/bkit-set-dependabot.sh` are now installed. Dependabot version updates need repo-level state (auto-fixes-enabled, vulnerability-alerts) that the YAML file alone does not set.",
        action: "One-shot repo-level setup (idempotent — safe to re-run):\n\n" +
            "    bash .bkit/scripts/bkit-set-dependabot.sh\n\n" +
            "The script uses `gh api` to enable Dependabot security updates, vulnerability alerts, and the never-auto-merge-on-main policy. Re-run any time the policy needs sanity-checking; use `--dry-run` to preview, `--print` to inspect current state.\n\n" +
            "After commit + merge through to your default branch, Dependabot will start opening PRs on the next scheduled poll (per `schedule:` in dependabot.yml — default weekly).",
    });
}
// ---------------------------------------------------------------------------
// runCloudModule — opt-in cloud-agent integration (issue #119, "Managed Cloud Agents")
// ---------------------------------------------------------------------------
//
// NOT shipped by a default install — opt-in via `bkit install --auto=<variant>`,
// so a default install ships ZERO cloud footprint. Variant-split (DECISION-C/D):
//
//   cloud=claude (tracker=github):
//   - `.github/workflows/bkit-cloud.yml`   — phase-routed GitHub Action; requires
//        ANTHROPIC_API_KEY + Claude GitHub App (id-token: write for OIDC auth).
//   - `.claude/hooks/cloud-bootstrap.sh`   — Claude Code on the web SessionStart install
//        hook (Tier 2 markered; no-op unless CLAUDE_CODE_REMOTE=true).
//
//   cloud=cursor (tracker=linear):
//   - `.cursor/Dockerfile`                 — Cursor Background Agent toolchain (Tier 2 markered).
//   - `.cursor/environment.json`           — Cursor Background Agent env config (Tier 3,
//        consumer-owned).
//
// Variant constraints are enforced in bkit-install.ts before dispatch (tracker mismatch
// = hard error). The context's cloudVariant carries the chosen variant.
// Render the bkit-cloud.yml template. The template is GitHub-only (cloud=claude and
// cloud=opencode both require tracker=github; the Linear cloud path is Cursor-native
// via cloud=cursor). The tracker parameter is accepted for interface stability but not
// branched on — any remaining @@CLOUD_TRACKER_*@@ sentinels are resolved to empty
// (should be none after T1.1, but this guard prevents accidental sentinel leakage).
export function renderCloudWorkflow(raw, _tracker) {
    return raw
        .replace(/@@CLOUD_TRACKER_MCP@@/g, () => "mcp__github__*")
        .replace(/@@CLOUD_TRACKER_SECRET_NOTE@@/g, () => "")
        .replace(/^@@CLOUD_TRACKER_SECRET_ENV@@\n/gm, () => "");
}
export function runCloudModule(ctx) {
    const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const templates = getTemplatesRoot();
    // Default to "claude" when cloudVariant is not set (back-compat: the old bare --cloud
    // always meant the Claude/GitHub path). Callers should always pass cloudVariant.
    const variant = ctx.cloudVariant ?? "claude";
    if (variant === "claude") {
        // --- cloud=claude: GitHub-tracker path ---
        // 1. Phase-routed workflow — `.github/workflows/bkit-cloud.yml` (Tier 1 canonical).
        // Carries both claude + opencode jobs; claude job requires id-token: write for OIDC App auth.
        const workflowSrc = path.join(templates, ".github", "workflows", "bkit-cloud.yml");
        if (!fs.existsSync(workflowSrc))
            return;
        const workflowDst = path.join(".github", "workflows", "bkit-cloud.yml");
        {
            const rendered = applyTokens(renderCloudWorkflow(fs.readFileSync(workflowSrc, "utf-8"), "github"), tokens);
            const current = fs.existsSync(workflowDst) ? fs.readFileSync(workflowDst, "utf-8") : null;
            if (current !== rendered) {
                ws.writes.push({ path: workflowDst, action: "write" });
                if (!dryRun) {
                    ensureDir(path.dirname(workflowDst));
                    fs.writeFileSync(workflowDst, rendered, "utf-8");
                }
                console.log(`${logPrefix} ${tag}cloud: ${workflowDst}`);
            }
        }
        // 2. Claude Code on the web SessionStart install hook — Tier 2 markered.
        {
            const src = path.join(templates, ".claude", "hooks", "cloud-bootstrap.sh");
            const dst = ".claude/hooks/cloud-bootstrap.sh";
            if (fs.existsSync(src)) {
                const prevLen = ws.writes.length;
                writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
                if (ws.writes.length > prevLen) {
                    console.log(`${logPrefix} ${tag}cloud: ${dst}`);
                    if (!dryRun && fs.existsSync(dst)) {
                        fs.chmodSync(dst, 0o755);
                    }
                }
            }
        }
        // Record the variant so the post-install advisory and `bkit check` stay consistent.
        setConsumerBkitField("cloudAgents", "claude", dryRun);
        // Advisory — cloud=claude setup checklist (App required; id-token: write).
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "`.github/workflows/bkit-cloud.yml` is in place (unified cloud workflow: claude + opencode jobs, runtime-gated by secret presence). The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "REQUIRED ONE-TIME SETUP:\n" +
                "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.\n" +
                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
                "  - Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions). Used by `claude-code-action@v1`.\n" +
                "  - Do NOT add `GH_BKIT_TOKEN` to this workflow — it is package-install scoped and has no access to the consumer repo. Repo git/gh ops use the auto-provided `github.token` via the workflow's `permissions:` block.\n" +
                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
                "OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.\n\n" +
                "Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).",
        });
        // Advisory — cloud env scaffolding (Claude half).
        advisories.push({
            id: "cloud-env-customize",
            severity: "advisory",
            detect: "Cloud env config splits across the repo (`.claude/hooks/cloud-bootstrap.sh`, bkit-managed) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
            action: "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
                "IN REPO (Tier 2 markered; bkit owns content between `# <!-- bkit:start -->` and `# <!-- bkit:end -->`; consumer customises outside):\n" +
                "  - `.claude/hooks/cloud-bootstrap.sh`: add repo-specific install steps after the bkit:end marker (Supabase start, turbo prebuild, etc. — examples inlined).\n\n" +
                "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
                "  - Name: `bkit-shared` (or per-repo).\n" +
                "  - Setup script: paste from bkit's `cloud.md` § Setup script (installs vale 3.9.1 + gh + corepack-pinned pnpm 10.33.0).\n" +
                "  - Environment variables: `GH_MCP_TOKEN` (fine-grained PAT for GitHub MCP), `GH_BKIT_TOKEN` (classic PAT with read:packages), `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`.\n" +
                "  - Tracker env vars (GitHub): No tracker PAT needed. Run `gh auth login` once for CLI surface. MCP auth is browser OAuth (automatic on first tool call). Set `GH_MCP_TOKEN` (fine-grained PAT for GitHub MCP server).\n" +
                "  - Network access: `Trusted` (default). One env can be reused across bkit + every consumer repo.",
        });
    }
    else if (variant === "opencode") {
        // --- cloud=opencode: GitHub-tracker path (same bkit-cloud.yml, no OIDC) ---
        // 3. Phase-routed workflow — same bkit-cloud.yml as cloud=claude.
        // The opencode job is already in the file; no separate template needed.
        const workflowSrc = path.join(templates, ".github", "workflows", "bkit-cloud.yml");
        if (!fs.existsSync(workflowSrc))
            return;
        const workflowDst = path.join(".github", "workflows", "bkit-cloud.yml");
        {
            const rendered = applyTokens(renderCloudWorkflow(fs.readFileSync(workflowSrc, "utf-8"), "github"), tokens);
            const current = fs.existsSync(workflowDst) ? fs.readFileSync(workflowDst, "utf-8") : null;
            if (current !== rendered) {
                ws.writes.push({ path: workflowDst, action: "write" });
                if (!dryRun) {
                    ensureDir(path.dirname(workflowDst));
                    fs.writeFileSync(workflowDst, rendered, "utf-8");
                }
                console.log(`${logPrefix} ${tag}cloud: ${workflowDst}`);
            }
        }
        // Record the variant.
        setConsumerBkitField("cloudAgents", "opencode", dryRun);
        // Advisory — cloud=opencode setup checklist.
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "`.github/workflows/bkit-cloud.yml` is in place (unified cloud workflow: claude + opencode jobs, runtime-gated by secret presence). The opencode job runs when `OPENCODE_PROVIDER_KEY` is set.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "REQUIRED ONE-TIME SETUP:\n" +
                "  - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.\n" +
                "  - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`NVIDIA_API_KEY`/`GROQ_API_KEY`/`CEREBRAS_API_KEY`/`OPENROUTER_API_KEY`/`OLLAMA_API_KEY`/`OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.\n" +
                "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
                "  - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.\n" +
                "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
                "REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.",
        });
    }
    else {
        // --- cloud=cursor: Linear-tracker path ---
        // 4. Cursor Background Agent Dockerfile — Tier 2 markered.
        {
            const src = path.join(templates, ".cursor", "Dockerfile");
            const dst = ".cursor/Dockerfile";
            if (fs.existsSync(src)) {
                const prevLen = ws.writes.length;
                writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
                if (ws.writes.length > prevLen) {
                    console.log(`${logPrefix} ${tag}cloud: ${dst}`);
                }
            }
        }
        // 5. Cursor Background Agent env config — Tier 3 seed-or-print (fully consumer-owned).
        {
            const src = path.join(templates, ".cursor", "environment.json");
            const dst = ".cursor/environment.json";
            if (fs.existsSync(src)) {
                const prevLen = ws.writes.length;
                const result = writeTier3(src, dst, dryRun, advisories, ws, CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS);
                if (ws.writes.length > prevLen) {
                    console.log(`${logPrefix} ${tag}cloud: ${dst}`);
                }
                else if (result.suggested) {
                    console.log(`${logPrefix} ${tag}cloud: ${dst} (exists; AI merge instructions printed)`);
                }
            }
        }
        // Record the variant.
        setConsumerBkitField("cloudAgents", "cursor", dryRun);
        // Advisory — cloud=cursor setup checklist.
        advisories.push({
            id: "bkit-cloud-setup",
            severity: "advisory",
            detect: "`.cursor/Dockerfile` and `.cursor/environment.json` are in place (Cursor cloud scaffolding). The Cursor Background Agent trigger is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
            action: "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
                "IN CURSOR DASHBOARD:\n" +
                "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
                "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
                "  - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.\n" +
                "  - Allowed concurrency: latest-supersedes.\n" +
                "  - Set `LINEAR_API_KEY` in Cursor → Settings → Background Agents → Environment Variables.\n" +
                "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
                "IN REPO (Tier 2 markered; consumer customises outside `# <!-- bkit:start -->` markers):\n" +
                "  - `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps below the bkit block.\n" +
                "  - `.cursor/environment.json`: Tier 3, fully consumer-owned — set `install` / `start` / `terminals[]` / `env` for your stack.",
        });
        // Advisory — cloud env scaffolding (Cursor half).
        advisories.push({
            id: "cloud-env-customize",
            severity: "advisory",
            detect: "Cloud env config splits across the repo (`.cursor/Dockerfile` + `.cursor/environment.json`, bkit-managed) and the Cursor app dashboard (env vars + auth tokens, manual).",
            action: "IN CURSOR APP (Cursor → Settings → Background Agents → Environment Variables):\n" +
                "  - `GH_MCP_TOKEN`, `GH_BKIT_TOKEN`.\n" +
                "  - Tracker env vars (Linear): `LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n" +
                "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.\n\n" +
                "Full recipe in bkit's `cloud.md`.",
        });
    }
}
// ---------------------------------------------------------------------------
// MODULE_REGISTRY — maps ModuleFlag → ModuleFn
// ---------------------------------------------------------------------------
export const MODULE_REGISTRY = {
    core: runCoreModule,
    claude: runClaudeModule,
    cursor: runCursorModule,
    opencode: runOpencodeModule,
    ci: runCiModule,
    lint: runLintModule,
    "git-hooks": runGitHooksModule,
    renovate: runRenovateModule,
    dependabot: runDependabotModule,
    cloud: runCloudModule,
    // "full" is never directly in the registry — resolveModules expands it to all modules
};
// Canonical dispatch order
export const MODULE_DISPATCH_ORDER = [
    "core",
    "claude",
    "cursor",
    "opencode",
    "ci",
    "lint",
    "git-hooks",
    "renovate",
    "dependabot",
    "cloud",
];
/**
 * Dispatch modules in canonical order.
 * ctx.ws is populated by each module fn; ctx.advisories accumulates findings flushed by caller.
 * After all modules complete, ctx.postDispatch callbacks are run in order.
 */
export function dispatchModules(modules, ctx) {
    // The `ci` module seeds the WIRED ci.yml when the TS toolchain is co-installed
    // (`lint` present ⇒ --typescript/--tooling), else the agnostic skeleton (#265).
    ctx.wiredCi = modules.has("lint");
    for (const flag of MODULE_DISPATCH_ORDER) {
        if (!modules.has(flag))
            continue;
        const fn = MODULE_REGISTRY[flag];
        if (!fn)
            continue;
        fn(ctx);
    }
    // Run deferred finalisation callbacks (e.g. .bkit-version write) only after all modules succeed.
    for (const cb of ctx.postDispatch) {
        cb();
    }
}
