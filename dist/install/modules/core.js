// install/modules/core.ts — the core module: the core payload blocks, the canonical
// `.bkit/*.md` docs, package.json gate scripts and `.bkit/version` (written last, in
// postDispatch). Also the file helpers every host renderer shares.
import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier1, writeTier2, ensurePackageJsonScripts } from "../write.js";
import { readBkitVersion, writeBkitVersion, hashFile, mergeCanonicalHashes, } from "../version-file.js";
import { extractManagedBlock, stripManagedBlock } from "../managed-block.js";
import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
import { writeNetworkAllowlist } from "../network-allowlist.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { ASK_POINTS, CONFIG_DEFAULTS, limitKey } from "../../shared/settings.js";
import { getCoreRoot, getSharedRoot, getBkitDocsRoot, TEMPLATE_COPIES_DIR, } from "../../shared/package-roots.js";
import { getInstallManifest, BKIT_GATE_SCRIPTS, BKIT_OPTIONAL_GATES, BKIT_PUSH_GATES, BKIT_TEST_FILE_SCRIPT, } from "../manifest.js";
import { migrateLedgers } from "../../ledgers/migrate.js";
export function listMdFiles(dir, prefix) {
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => (prefix ? f.startsWith(prefix) : true));
}
export function installFile(srcPath, destPath, transform, dryRun) {
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
// Hard allowlist: orphan pruning may ONLY remove files from these generated IDE
// mirror dirs. Mirror SOURCES live package-side under `.bkit/{workflows,prompts}`.
const ORPHAN_PRUNE_DIRS = [
    ".claude/agents",
    ".claude/commands",
    ".cursor/agents",
    ".cursor/commands",
    ".opencode/agents",
    ".opencode/commands",
    ".codex/agents",
    ".agents/skills",
    ".agents/plugins/bkit/agents",
    ".agents/plugins/bkit/skills",
];
/**
 * Removes entries of `destDir` that start with `prefix` and are absent from `sourceNames`
 * (entry names as they appear in `destDir`). Returns the removed names; with `dryRun` it
 * reports them without deleting. Throws for any `destDir` outside `ORPHAN_PRUNE_DIRS`.
 */
export function removeOrphans(destDir, sourceNames, dryRun, prefix, options = {}) {
    const resolved = path.resolve(destDir);
    if (!ORPHAN_PRUNE_DIRS.some((d) => path.resolve(d) === resolved)) {
        throw new Error(`removeOrphans: refusing orphan removal outside allowlist: ${destDir}`);
    }
    if (!fs.existsSync(destDir))
        return [];
    const { extension = ".md", wholeFolders = false } = options;
    const removed = [];
    for (const f of fs.readdirSync(destDir)) {
        if (!wholeFolders && !f.endsWith(extension))
            continue;
        if (prefix && !f.startsWith(prefix))
            continue;
        if (!sourceNames.has(f)) {
            const target = path.join(destDir, f);
            if (!dryRun)
                fs.rmSync(target, { recursive: wholeFolders, force: wholeFolders });
            removed.push(f);
        }
    }
    return removed;
}
/** The markered-text `.agents/*.md` blocks core owns. */
const CORE_AGENT_FILES = ["context.md", "docs.md", "rules.md", "skills.md"];
// The two shared-root files core writes: stored in `shared/`, owned by the core
// manifest, written as html-comment managed blocks.
const CORE_SHARED_FILES = [
    ["gitignore", ".gitignore"],
    [".gitattributes", ".gitattributes"],
];
// ---------------------------------------------------------------------------
// guardCoreRoot — fail-loud guard for the resolved core payload root.
// Exported so tests can inject an arbitrary (non-existent) path and assert
// the guard fires for ANY missing root — not just the literal ".bkit/core"
// string. This keeps the assertion valid across any future path changes.
//
// Called by runCoreTemplates (below) before any FS access.
// ---------------------------------------------------------------------------
export function guardCoreRoot(root, logPrefix = "[bkit-modules]") {
    if (!fs.existsSync(root)) {
        console.error(`${logPrefix} Core root not found at ${root} — package corrupt?`);
        process.exit(1);
    }
}
/**
 * The core-owned payload files, sourced from `root` (defaults to the resolved
 * core root). Every file under `core/docs/templates/` is included; `AGENTS.md`
 * and the `.agents/*.md` doctrine files are the block-merged rest.
 */
export function listCoreTemplateFiles(root = getCoreRoot()) {
    const out = [];
    const agentsDir = path.join(root, ".agents");
    for (const name of CORE_AGENT_FILES) {
        const src = path.join(agentsDir, name);
        if (fs.existsSync(src)) {
            out.push({ src, dst: path.join(".agents", name), scope: "block", marker: "html-comment" });
        }
    }
    const agentsMd = path.join(root, "AGENTS.md");
    if (fs.existsSync(agentsMd)) {
        out.push({ src: agentsMd, dst: "AGENTS.md", scope: "block", marker: "html-comment" });
    }
    for (const abs of listFilesRecursive(path.join(root, "docs", "templates"))) {
        out.push({
            src: abs,
            dst: path.relative(root, abs),
            scope: "block",
            marker: "html-comment",
        });
    }
    return out;
}
/**
 * The shared payload files core writes, sourced from `root` (defaults to the
 * resolved shared root): the `docs/*.md` managed blocks and the two shared-root
 * files the core manifest owns.
 */
export function listSharedTemplateFiles(root = getSharedRoot()) {
    const out = [];
    for (const [rel, dst] of CORE_SHARED_FILES) {
        const src = path.join(root, rel);
        if (fs.existsSync(src))
            out.push({ src, dst, scope: "block", marker: "html-comment" });
    }
    for (const name of listMdFiles(path.join(root, "docs"))) {
        out.push({
            src: path.join(root, "docs", name),
            dst: path.join("docs", name),
            scope: "block",
            marker: "html-comment",
        });
    }
    return out;
}
function runCoreTemplates(dryRun, tokens, ws, logPrefix) {
    const root = getCoreRoot();
    guardCoreRoot(root, logPrefix);
    const tag = dryRun ? "[dry-run] " : "";
    const files = [...listCoreTemplateFiles(root), ...listSharedTemplateFiles()];
    for (const { src, dst, scope, marker } of files) {
        const prevLen = ws.writes.length;
        if (scope === "whole")
            writeTier1(src, dst, tokens, dryRun, ws);
        else
            writeTier2(src, dst, tokens, marker, dryRun, ws);
        if (ws.writes.length > prevLen) {
            console.log(`${logPrefix} ${tag}core: ${dst}`);
        }
    }
}
// ---------------------------------------------------------------------------
// runCoreModule — core templates + .bkit/version (LAST)
// ---------------------------------------------------------------------------
// Canonical bkit-authored reference docs that live package-side under
// `.bkit/core/.bkit/`. They are read from there at runtime (getBkitDocsRoot) AND
// mirrored into the consumer's `.bkit/` on every install so a consumer can read them
// in-repo without spelunking node_modules. Force-overwritten (Tier 1) — bkit owns
// them, so a consumer edit is replaced. Source of truth is the package's own
// `.bkit/core/.bkit/<name>`. (`advisories.md` is a regenerated runtime artifact and
// `instructions.md` is repo-only tooling — neither belongs here. `LICENSE.md` is the MIT
// notice that travels with the files bkit writes: MIT requires the copyright and
// permission notice in every copy.)
export const BKIT_CANONICAL_DOCS = [
    "authoring.md",
    "cloud.md",
    "comparison.md",
    "install.md",
    "jsonl.md",
    "LICENSE.md",
    "lite.md",
    "pipeline.md",
    "providers.md",
    "prompts.md",
    "router.md",
    "templates.md",
    "trackers.md",
    "workflows.md",
    "README.md",
];
// Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
// the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: the consumer destination
// resolves to the repo's own installed copies, never the package source.
export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
    const tag = dryRun ? "[dry-run] " : "";
    const docsRoot = getBkitDocsRoot();
    // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
    // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
    // are block-merged so consumer content survives; the rest are force-overwritten.
    const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
    for (const name of BKIT_CANONICAL_DOCS) {
        const srcPath = path.join(docsRoot, name);
        // A doc missing from a partial/corrupt package is skipped (writeTier1 throws on a
        // missing src).
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
    migrateShortcutsToLite(dryRun, ws, logPrefix);
    migrateRetiredDevLock(dryRun, ws, logPrefix);
    migrateLedgerSchema(dryRun, ws, logPrefix);
    migrateJiraKeyName(dryRun, logPrefix);
}
// Migration (installs up to 5.5.x, `docs/migrations.md`): the Jira key was
// `BKIT_JIRA_API_TOKEN`; the engine and the MCP configs now read `BKIT_JIRA_API_KEY`.
// `.bkit/.env` lines naming the old key are renamed in place, value kept. Logged only,
// never recorded in ws: a ws write gets a canonical hash, and a secrets file never does.
// A file already naming the new key is left alone.
const ENV_FILE = path.join(".bkit", ".env");
const OLD_JIRA_KEY = "BKIT_JIRA_API_TOKEN";
const NEW_JIRA_KEY = "BKIT_JIRA_API_KEY";
export function migrateJiraKeyName(dryRun, logPrefix) {
    if (!fs.lstatSync(ENV_FILE, { throwIfNoEntry: false })?.isFile())
        return;
    const text = fs.readFileSync(ENV_FILE, "utf-8");
    const assigns = (key) => new RegExp(`^\\s*(export\\s+)?${key}=`, "m").test(text);
    if (!assigns(OLD_JIRA_KEY) || assigns(NEW_JIRA_KEY))
        return;
    if (!dryRun)
        fs.writeFileSync(ENV_FILE, text.split(OLD_JIRA_KEY).join(NEW_JIRA_KEY), "utf-8");
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${ENV_FILE} — ${OLD_JIRA_KEY} renamed to ${NEW_JIRA_KEY}`);
}
// Migration (5.1.0 – 5.2.4 installs, `docs/migrations.md`): the lite workflows lived at
// `.agents/shortcuts.md`. The consumer's own lines below `bkit:end` (minus the seeded
// heading) move under `.bkit/lite.md`'s consumer section; the old file is deleted. Runs
// after the docs loop, so `.bkit/lite.md` is already written. The delete is recorded in
// ws (as orphan-mirror deletes are) so `bkit check` fails until upgrade runs.
const RETIRED_SHORTCUTS = path.join(".agents", "shortcuts.md");
const RETIRED_SHORTCUTS_HEADING = "## Project Shortcuts";
export function migrateShortcutsToLite(dryRun, ws, logPrefix) {
    if (!fs.existsSync(RETIRED_SHORTCUTS))
        return;
    if (!fs.existsSync(path.join(getBkitDocsRoot(), "lite.md")))
        return;
    const tag = dryRun ? "[dry-run] " : "";
    const dst = path.join(".bkit", "lite.md");
    const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
    if (extractManagedBlock(old, "html-comment") === null) {
        console.warn(`${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${dst} below \`<!-- bkit:end -->\`, then delete it.`);
        return;
    }
    const own = stripManagedBlock(old, "html-comment")
        .split("\n")
        .filter((line) => line.trim() !== RETIRED_SHORTCUTS_HEADING)
        .join("\n")
        .trim();
    if (own.length > 0) {
        if (!dryRun) {
            const current = fs.readFileSync(dst, "utf-8");
            fs.writeFileSync(dst, `${current.replace(/\n*$/, "\n\n")}${own}\n`, "utf-8");
        }
        ws.writes.push({ path: dst, action: "update" });
    }
    if (!dryRun)
        fs.rmSync(RETIRED_SHORTCUTS);
    ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
    console.log(`${logPrefix} ${tag}core: moved ${RETIRED_SHORTCUTS} → ${dst}`);
}
// Migration (installs up to 5.3.x, `docs/migrations.md`): `.bkit/.dev.lock` was the
// repo-wide dev lock. Nothing reads it now, so one a crashed run left behind is deleted.
// bkit owned the name whole. Recorded in ws so `bkit check` fails until upgrade runs.
const RETIRED_DEV_LOCK = path.join(".bkit", ".dev.lock");
export function migrateRetiredDevLock(dryRun, ws, logPrefix) {
    if (!fs.lstatSync(RETIRED_DEV_LOCK, { throwIfNoEntry: false })?.isFile())
        return;
    if (!dryRun)
        fs.rmSync(RETIRED_DEV_LOCK);
    ws.writes.push({ path: RETIRED_DEV_LOCK, action: "write" });
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: removed ${RETIRED_DEV_LOCK} (the dev lock is gone)`);
}
// Migration (installs up to 5.5.x, `docs/migrations.md`): ledger rows written before
// `schema: 2` are rewritten into the current shape (`.bkit/jsonl.md` § Generic Fields).
// Recorded in ws so `bkit check` fails until upgrade runs; ledgers never get a
// canonical hash (`mergeCanonicalHashes`).
export function migrateLedgerSchema(dryRun, ws, logPrefix) {
    for (const { file, rewritten, dropped } of migrateLedgers(process.cwd(), dryRun)) {
        ws.writes.push({ path: file, action: "update" });
        const copies = dropped > 0 ? `, ${dropped} old copy(ies) of rewritten rows dropped` : "";
        console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${file} — ${rewritten} row(s) rewritten to schema 2${copies}`);
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
/** Record a host mirror would-write so `bkit check` exits 1 on content drift. */
export function trackMirrorWrite(ctx, relPath, written) {
    written.push(relPath);
    ctx.ws.writes.push({ path: relPath, action: "write" });
}
/**
 * The package.json scripts core keeps: the `bkit:gate:*` / `bkit:deps:*` names every
 * workflow, prompt and hook runs, seeded add-if-missing (a name already declared is
 * never touched, whatever its value). Install (runCoreModule) and upgrade
 * (renderManagedOutputs) both run it, so a
 * clean upgrade leaves `bkit check` nothing to write. A missing gate name is a write,
 * so `bkit check` reports it. A missing or malformed package.json is preflight's to
 * report. Returns the paths written.
 */
export function seedCorePackageJsonScripts(ctx) {
    const { dryRun, ws, logPrefix } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const written = [];
    const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
    if (gates.added.length > 0) {
        written.push("package.json");
        console.log(`${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}]`);
    }
    if (migrateLinearTeamKey(dryRun, ws, logPrefix) && !written.includes("package.json")) {
        written.push("package.json");
    }
    if (migrateGithubProjectKey(dryRun, ws, logPrefix) && !written.includes("package.json")) {
        written.push("package.json");
    }
    if (migrateBkitLayout(dryRun, ws, logPrefix) && !written.includes("package.json")) {
        written.push("package.json");
    }
    if (seedBkitDefaults(dryRun, ws, logPrefix) && !written.includes("package.json")) {
        written.push("package.json");
    }
    return written;
}
/**
 * Every `bkit.*` setting, written on every install and upgrade so consumers see them all;
 * add-if-missing, nested blocks included. A key with a default gets it; a choice not made
 * yet is `""` or `[]`, which every reader treats as unset.
 */
export const SEEDED_BKIT_DEFAULTS = {
    tracker: {
        default: "",
        github: {
            project: "",
            progress: CONFIG_DEFAULTS.github.progress,
            review: CONFIG_DEFAULTS.github.review,
        },
        linear: {
            team: "",
            project: "",
            progress: CONFIG_DEFAULTS.linear.progress,
            review: CONFIG_DEFAULTS.linear.review,
        },
        jira: {
            site: "",
            project: "",
            progress: CONFIG_DEFAULTS.jira.progress,
            review: CONFIG_DEFAULTS.jira.review,
        },
    },
    cloud: { agent: "" },
    providers: { opencode: { default: "", installed: [] } },
    testing: {
        ciWorkflow: CONFIG_DEFAULTS.ciWorkflow,
        ciCapstone: CONFIG_DEFAULTS.capstoneJob,
        shipGate: [...CONFIG_DEFAULTS.shipGateRequiredLanes],
        minPushPaths: [...CONFIG_DEFAULTS.minPushPaths],
    },
    workflows: {
        minFreeGb: CONFIG_DEFAULTS.diskMinFreeGb,
        worktree: { copy: [...CONFIG_DEFAULTS.worktreeCopy], install: CONFIG_DEFAULTS.worktreeInstall },
        tasks: { ...CONFIG_DEFAULTS.tasks },
        ...askBlocks(),
    },
    // bkit-utility-update-roadmap list length; the prompt falls back to 25 too.
    prompts: { roadmapNext: 25 },
    dependencies: { updater: "" },
    advisories: { ignore: [] },
};
/** `{design: {grill: {ask, maxTurns}}, build: {...}, ...}`, from `CONFIG_DEFAULTS.asks`. */
function askBlocks() {
    const out = {};
    for (const point of ASK_POINTS) {
        const [workflow, name] = point.split(".");
        const d = CONFIG_DEFAULTS.asks[point];
        (out[workflow] ??= {})[name] = { ask: d.ask, [limitKey(point)]: d.max };
    }
    return out;
}
const plainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
// Copy each `defaults` key missing from `target`, descending into blocks both sides hold.
// A present key keeps its value, whatever it is. Pushes each added key's dotted path.
function addMissingKeys(target, defaults, prefix, added) {
    for (const [k, v] of Object.entries(defaults)) {
        if (!Object.prototype.hasOwnProperty.call(target, k)) {
            target[k] = structuredClone(v);
            added.push(`${prefix}${k}`);
        }
        else if (plainObject(v) && plainObject(target[k])) {
            addMissingKeys(target[k], v, `${prefix}${k}.`, added);
        }
    }
}
// Add each SEEDED_BKIT_DEFAULTS key missing from `package.json` `bkit`, creating the block
// when absent. Runs after the legacy-key migrations, which test `=== undefined`. Returns
// true when package.json changed.
export function seedBkitDefaults(dryRun, ws, logPrefix) {
    const pkgPath = "package.json";
    if (!fs.existsSync(pkgPath))
        return false;
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const parsed = parseJson(raw);
    if (!parsed.ok)
        return false;
    const pkg = parsed.value;
    if (pkg.bkit !== undefined && !plainObject(pkg.bkit))
        return false;
    const cfg = (pkg.bkit ?? {});
    const added = [];
    addMissingKeys(cfg, SEEDED_BKIT_DEFAULTS, "bkit.", added);
    if (added.length === 0)
        return false;
    pkg.bkit = cfg;
    ws.writes.push({ path: pkgPath, action: "update" });
    if (!dryRun)
        writePackageJsonLike(raw, pkg);
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: added ${added.join(", ")} to package.json`);
    return true;
}
/** Rewrite package.json with `pkg`, keeping the file's indent and trailing newline. */
function writePackageJsonLike(raw, pkg) {
    const indentMatch = raw.match(/\n([ \t]+)"/);
    const indent = indentMatch ? indentMatch[1] : "  ";
    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
}
// Status option ids of GitHub's Kanban and Team planning board templates; every board
// made from one carries the same ids.
const TEMPLATE_STATUS_OPTIONS = {
    "47fc9ee4": "In progress",
    df73e18b: "In review",
};
// Migration (up to 5.4.x installs, `docs/migrations.md`): the board lived at
// `bkit.githubProject` as `{owner, number, statusFieldId, *OptionId}`, org boards only; it
// is `bkit.github.project`, the board URL, with Status set by option name from
// `bkit.github.progress` / `review`. An existing `bkit.github.project` wins over the old
// key. Returns true when package.json changed.
export function migrateGithubProjectKey(dryRun, ws, logPrefix) {
    const pkgPath = "package.json";
    if (!fs.existsSync(pkgPath))
        return false;
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const parsed = parseJson(raw);
    if (!parsed.ok)
        return false;
    const pkg = parsed.value;
    const bkit = pkg.bkit;
    if (bkit === null || typeof bkit !== "object" || Array.isArray(bkit))
        return false;
    const cfg = bkit;
    if (!Object.prototype.hasOwnProperty.call(cfg, "githubProject"))
        return false;
    const old = cfg.githubProject;
    const github = cfg.github !== null && typeof cfg.github === "object" && !Array.isArray(cfg.github)
        ? cfg.github
        : {};
    const unnamed = [];
    if (github.project === undefined) {
        if (old === false)
            github.project = false;
        else if (old !== null && typeof old === "object" && !Array.isArray(old)) {
            const board = old;
            const owner = typeof board.owner === "string" ? board.owner.trim() : "";
            const number = Number(board.number);
            if (owner !== "" && Number.isInteger(number) && number > 0) {
                github.project = `https://github.com/orgs/${owner}/projects/${number}`;
                for (const [moment, key] of [
                    ["progress", "progressOptionId"],
                    ["review", "reviewOptionId"],
                ]) {
                    const id = board[key];
                    if (typeof id !== "string" || id.trim() === "")
                        continue;
                    const name = TEMPLATE_STATUS_OPTIONS[id.trim()];
                    if (name === undefined)
                        unnamed.push(moment);
                    else if (github[moment] === undefined && name !== CONFIG_DEFAULTS.github[moment])
                        github[moment] = name;
                }
            }
        }
    }
    delete cfg.githubProject;
    if (Object.keys(github).length > 0)
        cfg.github = github;
    ws.writes.push({ path: pkgPath, action: "update" });
    if (!dryRun)
        writePackageJsonLike(raw, pkg);
    const tag = dryRun ? "[dry-run] " : "";
    console.log(`${logPrefix} ${tag}core: moved bkit.githubProject to bkit.github in package.json`);
    for (const moment of unnamed)
        console.log(`${logPrefix} ${tag}core: bkit.githubProject named its ${moment} Status option by id; set bkit.tracker.github.${moment} to that option's name (default "${CONFIG_DEFAULTS.github[moment]}")`);
    return true;
}
// Migration (up to 5.5.x installs, `docs/migrations.md`): `bkit` settings sat flat; they
// are grouped into named sections. Each old key moves to its new path; a value already at
// the new path wins, and two blocks merge key by key. `loopPause: true|false` becomes
// `ask` on every point under `workflows.<workflow>`, where an `ask` already set wins.
// Runs after the linearTeam and githubProject moves, which write the flat keys. Returns
// true when package.json changed.
export const BKIT_LAYOUT_MOVES = [
    ["issueTracker", "tracker.default"],
    ["github", "tracker.github"],
    ["linear", "tracker.linear"],
    ["jira", "tracker.jira"],
    ["cloudAgents", "cloud.agent"],
    ["opencodeProvider", "providers.opencode.default"],
    ["opencodeProviders", "providers.opencode.installed"],
    ["minPushPaths", "testing.minPushPaths"],
    ["capstoneJob", "testing.ciCapstone"],
    ["ciWorkflow", "testing.ciWorkflow"],
    ["shipGateRequiredLanes", "testing.shipGate"],
    ["disk.minFreeGb", "workflows.minFreeGb"],
    ["worktree", "workflows.worktree"],
    ["tasks", "workflows.tasks"],
    ["roadmapNext", "prompts.roadmapNext"],
    ["depUpdater", "dependencies.updater"],
    ["ignoreAdvisories", "advisories.ignore"],
];
// Fill `into` with each `from` key it lacks, descending into blocks both sides hold.
function mergeMissing(into, from) {
    for (const [k, v] of Object.entries(from)) {
        if (into[k] === undefined)
            into[k] = v;
        else if (plainObject(v) && plainObject(into[k]))
            mergeMissing(into[k], v);
    }
}
export function migrateBkitLayout(dryRun, ws, logPrefix) {
    const pkgPath = "package.json";
    if (!fs.existsSync(pkgPath))
        return false;
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const parsed = parseJson(raw);
    if (!parsed.ok)
        return false;
    const pkg = parsed.value;
    if (!plainObject(pkg.bkit))
        return false;
    const cfg = pkg.bkit;
    const moved = [];
    for (const [from, to] of BKIT_LAYOUT_MOVES) {
        const fromPath = from.split(".");
        const fromParent = fromPath
            .slice(0, -1)
            .reduce((o, k) => (plainObject(o) ? o[k] : undefined), cfg);
        const fromKey = fromPath[fromPath.length - 1];
        if (!plainObject(fromParent) || !Object.prototype.hasOwnProperty.call(fromParent, fromKey))
            continue;
        const old = fromParent[fromKey];
        const toPath = to.split(".");
        let parent = cfg;
        let blocked = false;
        for (const k of toPath.slice(0, -1)) {
            if (parent[k] === undefined)
                parent[k] = {};
            if (!plainObject(parent[k])) {
                blocked = true;
                break;
            }
            parent = parent[k];
        }
        // A non-object where the new section belongs: leave the old key for `bkit check` to show.
        if (blocked)
            continue;
        const toKey = toPath[toPath.length - 1];
        if (parent[toKey] === undefined)
            parent[toKey] = old;
        else if (plainObject(parent[toKey]) && plainObject(old))
            mergeMissing(parent[toKey], old);
        delete fromParent[fromKey];
        if (fromParent !== cfg && Object.keys(fromParent).length === 0)
            delete cfg[fromPath[0]];
        moved.push(`bkit.${from} -> bkit.${to}`);
    }
    if (Object.prototype.hasOwnProperty.call(cfg, "loopPause")) {
        const old = cfg.loopPause;
        if (typeof old === "boolean") {
            if (cfg.workflows === undefined)
                cfg.workflows = {};
            if (plainObject(cfg.workflows))
                mergeMissing(cfg.workflows, askOnly(old));
        }
        delete cfg.loopPause;
        moved.push("bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask");
    }
    if (moved.length === 0)
        return false;
    ws.writes.push({ path: pkgPath, action: "update" });
    if (!dryRun)
        writePackageJsonLike(raw, pkg);
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: moved ${moved.join(", ")} in package.json`);
    return true;
}
/** `{design: {grill: {ask}}, build: {verify: {ask}, ...}, ...}` with every `ask` = `ask`. */
function askOnly(ask) {
    const out = {};
    for (const point of ASK_POINTS) {
        const [workflow, name] = point.split(".");
        (out[workflow] ??= {})[name] = { ask };
    }
    return out;
}
// Migration (up to 5.4.x installs, `docs/migrations.md`): the Linear team lived at
// `bkit.linearTeam`; it is `bkit.linear.team`, beside the project and state names. An
// existing `bkit.linear.team` wins over the old key. Returns true when package.json changed.
export function migrateLinearTeamKey(dryRun, ws, logPrefix) {
    const pkgPath = "package.json";
    if (!fs.existsSync(pkgPath))
        return false;
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const parsed = parseJson(raw);
    if (!parsed.ok)
        return false;
    const pkg = parsed.value;
    const bkit = pkg.bkit;
    if (bkit === null || typeof bkit !== "object" || Array.isArray(bkit))
        return false;
    const cfg = bkit;
    if (!Object.prototype.hasOwnProperty.call(cfg, "linearTeam"))
        return false;
    const old = cfg.linearTeam;
    const linear = cfg.linear !== null && typeof cfg.linear === "object" && !Array.isArray(cfg.linear)
        ? cfg.linear
        : {};
    if (linear.team === undefined && typeof old === "string" && old.trim() !== "")
        linear.team = old;
    delete cfg.linearTeam;
    if (Object.keys(linear).length > 0)
        cfg.linear = linear;
    ws.writes.push({ path: pkgPath, action: "update" });
    if (!dryRun)
        writePackageJsonLike(raw, pkg);
    console.log(`${logPrefix} ${dryRun ? "[dry-run] " : ""}core: moved bkit.linearTeam to bkit.linear.team in package.json`);
    return true;
}
// Tokens that follow `pnpm` in a gate value but are not package.json scripts: the
// package manager's own subcommands (`install` in bkit:gate:install-static-unit-build,
// `audit` / `outdated` in the bkit:deps:* pair) and node_modules binaries pnpm resolves
// directly (`lint-staged` in bkit:gate:format). None can be "missing" as a script.
const PNPM_NOT_A_SCRIPT = new Set([
    "install",
    "run",
    "exec",
    "dlx",
    "audit",
    "outdated",
    "lint-staged",
]);
/**
 * The scripts a gate ends up running: each `pnpm <script>` / `pnpm run <script>` it calls,
 * with every `bkit:gate:*` it chains expanded in place. pnpm's own subcommands and
 * binaries are left out.
 */
export function gateLeafScripts(gate, declared, seen = new Set()) {
    const value = declared[gate];
    if (typeof value !== "string" || seen.has(gate))
        return [];
    seen.add(gate);
    const leaves = [];
    for (const [, called] of value.matchAll(/\bpnpm (?:run )?([\w:-]+)/g)) {
        if (PNPM_NOT_A_SCRIPT.has(called))
            continue;
        if (called.startsWith("bkit:gate:"))
            leaves.push(...gateLeafScripts(called, declared, seen));
        else
            leaves.push(called);
    }
    return leaves;
}
/**
 * Advisories for the `bkit:gate:*` scripts: the scripts a still-default gate
 * chains that package.json does not declare, the deeper test tiers the repo has
 * but no gate runs, a commit gate that repeats the push gate, and a missing
 * `bkit:test:file`. Judges the scripts as install
 * leaves them (missing gate names at their seeded defaults), so install, `bkit check`
 * and `bkit upgrade` report the same set. Read-only; an absent or unparseable
 * package.json yields none.
 */
export function detectGateAdvisories(cwd) {
    const read = readJsonFile(path.join(cwd, "package.json"));
    // Absent or malformed package.json — preflight's no-package-json /
    // malformed-package-json blockers already report it.
    if (!read.ok || read.value === null)
        return [];
    const pkg = read.value;
    const declared = { ...BKIT_GATE_SCRIPTS, ...pkg.scripts };
    const findings = [];
    // Every script a seeded gate default chains MUST exist, or the gate dies on the first
    // missing one and the workflow reads that as a real failure. Checked only where the
    // value is still bkit's default — a consumer who rewrote the gate owns what it calls.
    const missing = new Set();
    for (const [name, seeded] of Object.entries(BKIT_GATE_SCRIPTS)) {
        if (declared[name] !== seeded)
            continue;
        for (const [, called] of seeded.matchAll(/\bpnpm ([\w:-]+)/g)) {
            if (PNPM_NOT_A_SCRIPT.has(called))
                continue;
            if (!(called in declared))
                missing.add(called);
        }
    }
    if (missing.size > 0) {
        const names = [...missing].sort().map((n) => `\`${n}\``);
        findings.push({
            id: "gate-missing-called-scripts",
            severity: "advisory",
            detect: `The bkit:gate scripts call scripts package.json does not declare: ${names.join(", ")}.`,
            action: `Every bkit workflow runs a \`bkit:gate*\` script, so a missing link fails the whole gate. Add ${names.join(", ")} to package.json (\`.bkit/templates.md\` lists the tool scripts and the devDeps they need), or edit the \`bkit:gate*\` scripts to drop what this repo does not have.`,
        });
    }
    // A repo that HAS a deeper tier but declares no gate for it is gated at
    // bkit:gate:static-unit by both /bkit-build and /bkit-debug. bkit does not seed these
    // gates; it detects the mismatch and hands over the line to paste.
    const unwired = [];
    for (const { gate, parent, declaredBy } of BKIT_OPTIONAL_GATES) {
        const tierCall = declaredBy.find((s) => s in declared);
        if (tierCall === undefined || gate in declared)
            continue;
        unwired.push(`    "${gate}": "pnpm ${parent} && pnpm ${tierCall}"`);
    }
    if (unwired.length > 0) {
        findings.push({
            id: "gate-tier-not-wired",
            severity: "advisory",
            detect: "package.json declares deeper test tiers than any `bkit:gate*` script runs, so `/bkit-build`, `/bkit-debug` and the pre-push hook gate at `bkit:gate:static-unit` and never execute them.",
            action: "Each workflow runs the DEEPEST gate you declare, and `.husky/pre-push` runs `bkit:gate:static-unit-integration` when it is declared; an undeclared one is skipped, never guessed. Add the gates you want the agent loop to run:\n\n" +
                unwired.join("\n") +
                "\n\nOrder matters — each chains the one above it. Omit a level deliberately to keep it CI-only (E2E in the build loop costs a production build on every remediation attempt). `.bkit/templates.md` lists the tool scripts the gates chain.",
        });
    }
    // The commit gate is the fast one: a script it shares with the push gate runs on every
    // commit and again on the push that carries it.
    const pushGate = BKIT_PUSH_GATES.find((g) => g in declared);
    const commitCalls = pushGate === undefined ? [] : gateLeafScripts("bkit:gate:format", declared);
    const pushCalls = new Set(pushGate === undefined ? [] : gateLeafScripts(pushGate, declared));
    const repeated = [...new Set(commitCalls.filter((s) => pushCalls.has(s)))].sort();
    if (repeated.length > 0) {
        const names = repeated.map((n) => `\`${n}\``).join(", ");
        findings.push({
            id: "gate-commit-repeats-push",
            severity: "advisory",
            detect: `\`bkit:gate:format\` (pre-commit) runs ${names}, which \`${pushGate}\` (pre-push) runs again.`,
            action: `Drop ${names} from \`bkit:gate:format\`. The commit gate formats staged files and nothing else; every whole-repo check runs once, at pre-push.`,
        });
    }
    // /bkit-build records each task's red through this script; without it test-first is
    // reported as not enforced. bkit cannot seed it: what runs one file is the stack's.
    if (!(BKIT_TEST_FILE_SCRIPT in declared)) {
        findings.push({
            id: "test-file-script-missing",
            severity: "advisory",
            detect: `package.json does not declare \`${BKIT_TEST_FILE_SCRIPT}\`, so \`/bkit-build\` cannot check that each task's tests fail before its code is written.`,
            action: `Add \`${BKIT_TEST_FILE_SCRIPT}\` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in \`$BKIT_TEST_REPORT\`. Vitest example:\n\n    "${BKIT_TEST_FILE_SCRIPT}": "vitest run --reporter=default --reporter=junit --outputFile.junit=\\"$BKIT_TEST_REPORT\\""\n\nCall the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it.`,
        });
    }
    return findings;
}
/** One command that cannot fail: `true`, `:`, `exit 0`, or an `echo`. */
const NOOP_COMMAND = /^(?:true|:|exit 0|echo(?:\s.*)?)$/;
/** Whether a script value checks nothing: empty, or only no-op commands chained. */
export function isNoopScript(value) {
    return value
        .split(/&&|\|\||;|\n/)
        .map((part) => part.trim())
        .every((part) => part === "" || NOOP_COMMAND.test(part));
}
/**
 * Advisory for every `bkit:gate:*` script that is empty or a no-op: it checks nothing,
 * so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on
 * every branch. Read-only; an absent or unparseable package.json yields none.
 */
export function detectNoopGates(cwd) {
    const read = readJsonFile(path.join(cwd, "package.json"));
    // Absent or malformed package.json — preflight's blockers already report it.
    if (!read.ok || read.value === null)
        return [];
    const pkg = read.value;
    const declared = pkg.scripts ?? {};
    const noop = Object.entries(declared)
        .filter(([name, value]) => name.startsWith("bkit:gate:") && typeof value === "string")
        .filter(([, value]) => isNoopScript(value))
        .map(([name, value]) => `\`${name}\` (\`${String(value).trim() || "empty"}\`)`)
        .sort();
    if (noop.length === 0)
        return [];
    return [
        {
            id: "gate-noop",
            severity: "advisory",
            detect: `These bkit:gate scripts are empty or cannot fail, so they check nothing: ${noop.join(", ")}.`,
            action: 'Every bkit workflow and the pre-push hook trust a green `bkit:gate*` script, so a no-op gate passes every agent run and push. Point each at the checks it should run (e.g. `"bkit:gate:static": "pnpm typecheck && pnpm lint"`), or delete it from package.json and run `bkit upgrade` to get bkit\'s default back.',
        },
    ];
}
export function runCoreModule(ctx) {
    const { dryRun, ws, advisories, logPrefix, postDispatch } = ctx;
    const tag = dryRun ? "[dry-run] " : "";
    const cwd = process.cwd();
    const pkgVersion = readInstallingVersion();
    // Capture first-install signal NOW (before any writes) — used for the post-install banner.
    // The .bkit/version write happens in postDispatch, so a mid-install crash in a later
    // module leaves no .bkit/version on disk.
    const versionFile = path.join(cwd, ".bkit", "version");
    const isFirstInstall = !fs.existsSync(versionFile);
    // 2. Core payload pass (AGENTS.md, `.agents/*.md`, `docs/templates/**`, the two
    // shared-root files core owns). Each host module writes its own hook files.
    console.log(`${logPrefix} ${tag}Running core payload pass`);
    runCoreTemplates(dryRun, ctx.tokens, ws, logPrefix);
    // 3b. bkit canonical docs pass — mirror the package's reference docs
    // (cloud/IDEs/prompts/trackers/workflows/README/install/comparison/pipeline) into the
    // consumer's `.bkit/` so they are readable in-repo. Force-overwrite (Tier 1).
    console.log(`${logPrefix} ${tag}Running bkit docs pass`);
    runBkitDocs(dryRun, ctx.tokens, ws, logPrefix);
    // 3b2. Template copies — the whole templates root into the consumer's
    // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
    console.log(`${logPrefix} ${tag}Running template copies pass`);
    const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
    for (const [verb, paths] of Object.entries(templateChanges)) {
        for (const p of paths) {
            console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
        }
    }
    // 3b3. Payload view links — `.bkit/core` + `.bkit/shared` symlinks into the
    // installed package (browse-only, gitignored; no-op in dogfood). A real
    // directory or file at either path is never clobbered (advisory); a platform
    // refusal is an advisory, never a failure.
    const linkChanges = syncPayloadLinks(cwd, { dryRun });
    for (const rel of linkChanges.created) {
        console.log(`${logPrefix} ${tag}payload link: ${rel}`);
    }
    for (const rel of linkChanges.repaired) {
        console.log(`${logPrefix} ${tag}payload link repaired: ${rel}`);
    }
    for (const rel of linkChanges.skippedRealDir) {
        advisories.push({
            id: "payload-link-real-dir",
            severity: "advisory",
            detect: `${rel} is a real directory or file, not a view symlink into the installed package — left untouched.`,
            action: `bkit never overwrites consumer content. The ${rel} view is a symlink into node_modules/@cbartens/bkit; if you want it, remove your own ${rel} by hand and re-run \`bkit install\`.`,
        });
    }
    for (const rel of linkChanges.failed) {
        advisories.push({
            id: "payload-link-failed",
            severity: "advisory",
            detect: `could not create the ${rel} view symlink into the installed package (the platform refused).`,
            action: `Browse-only — bkit reads its payload from the package regardless. To add the view by hand on POSIX: ln -s ../node_modules/@cbartens/bkit/${rel} ${rel}`,
        });
    }
    // 3b4. `.bkit/allowlist.json` — the network allowlist every host's guardrails hook
    // reads (writeNetworkAllowlist), plus the move off the retired `.cursor/` copy.
    writeNetworkAllowlist(cwd, dryRun, ws, logPrefix);
    // 3c. The bkit:gate:* / bkit:deps:* package.json scripts (add-if-missing). The
    // advisories read the result.
    seedCorePackageJsonScripts(ctx);
    advisories.push(...detectGateAdvisories(cwd));
    advisories.push(...detectNoopGates(cwd));
    // 4. .bkit/version write — deferred to postDispatch so it only persists when ALL modules succeed.
    // This ensures a mid-install crash in a subsequent module does not suppress the first-install
    // banner on retry (MED-4).
    // C3 fix: write JSON format with canonicalHashes populated from ws.writes (fully populated
    // by the time postDispatch runs — all modules have completed). canonicalHashes records the
    // sha256 of each bkit-managed consumer file as written, enabling drift detection on upgrade.
    postDispatch.push(() => {
        // Read existing file to check whether an update is needed.
        const existingVersion = readBkitVersion(versionFile);
        const existingCanonical = existingVersion?.canonicalHashes ?? {};
        // Build new canonicalHashes entries from ws.writes (files written in this run).
        // ws.writes is fully populated by the time postDispatch runs.
        // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
        const newCanonicalEntries = {};
        for (const entry of ws.writes) {
            const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
            const relPath = path.relative(cwd, absPath);
            if (relPath === path.join(".bkit", "version"))
                continue;
            if (relPath.startsWith(".agents" + path.sep))
                continue;
            // Template copies carry no hash.
            if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep))
                continue;
            // Payload view links carry no hash either — a symlink's bytes are the package's.
            if (PAYLOAD_LINK_RELPATHS.has(relPath))
                continue;
            if (!fs.existsSync(absPath))
                continue;
            const hash = hashFile(absPath);
            if (hash)
                newCanonicalEntries[relPath] = hash;
        }
        // Merge: existing hashes preserved, new writes overwrite (hashes stay current),
        // and entries whose path is gone are pruned (mergeCanonicalHashes).
        const { canonicalHashes, pruned } = mergeCanonicalHashes(cwd, existingCanonical, newCanonicalEntries);
        // Decide whether a write is needed: version mismatch, first install, new canonical
        // entries, a pruned stale entry, or a changed claudeAllowDerived record.
        const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
        const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
        const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
        const derivedChanged = JSON.stringify(claudeAllowDerived) !==
            JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
        const needsWrite = versionChanged || hasNewEntries || pruned > 0 || derivedChanged;
        if (needsWrite) {
            console.log(`${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`);
            ws.writes.push({ path: versionFile, action: "write" });
            if (!dryRun) {
                writeBkitVersion(versionFile, {
                    pinnedVersion: pkgVersion,
                    canonicalHashes,
                    claudeAllowDerived: [...claudeAllowDerived],
                });
            }
        }
    });
    // 5. First-run extra logging (only when .bkit/version was absent at start of install)
    if (isFirstInstall) {
        advisories.push({
            id: "first-install-postinstall-steps",
            severity: "advisory",
            detect: "First install detected (.bkit/version was absent).",
            action: "Post-install steps:\n\n" +
                "1. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
                "2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.\n\n" +
                "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
                "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
                "lint, format:check, lint:prose, slop:delta) and the devDeps those need are yours to\n" +
                "add: see .bkit/templates.md.",
        });
    }
}
// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------
export const BKIT_PREFIX = "bkit-";
