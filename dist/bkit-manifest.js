// bkit-manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by bkit-uninstall.ts
// and bkit-package-json.ts (key strippers).
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and package.json strippers.
// ---------------------------------------------------------------------------
// Issue tracker (#39)
// ---------------------------------------------------------------------------
/**
 * Issue-tracker providers supported by `bkit install --tracker=<name>`.
 * - `github` — GitHub Issues + Projects v2 (default).
 * - `linear` — Linear (opt-in).
 * - `none` — no tracker wired; workflows skip tracker calls with one-line log.
 *
 * Add a new value here when adding a provider section to `.bkit/trackers.md`.
 * See `.bkit/trackers.md` § "Adding a tracker (Jira, etc.)" in the Rules block.
 */
export const ISSUE_TRACKERS = ["github", "linear", "none"];
/** Default tracker when consumer manifest has no `bkit.issueTracker` field. */
export const DEFAULT_ISSUE_TRACKER = "none";
/**
 * Narrow an unknown string to `IssueTracker` or return `null` if invalid.
 * Used by CLI flag parsing and consumer-manifest reads.
 */
export function parseIssueTracker(value) {
    return typeof value === "string" && ISSUE_TRACKERS.includes(value)
        ? value
        : null;
}
// ---------------------------------------------------------------------------
// Dependency updater (#123 follow-up)
// ---------------------------------------------------------------------------
/**
 * Dependency-update tool chosen by the consumer (opt-in, mutually exclusive).
 * - `renovate`   — `bkit install --renovate` (recommended).
 * - `dependabot` — `bkit install --dependabot` (alternative).
 * - `none`       — explicit opt-out; silences the post-install nudge advisory.
 *
 * Recorded in `package.json` `bkit.depUpdater` by the owning module so the
 * post-install advisory can distinguish "deliberately none" from "undecided".
 */
export const DEP_UPDATERS = ["renovate", "dependabot", "none"];
/** Default when consumer manifest has no `bkit.depUpdater` field (undecided). */
export const DEFAULT_DEP_UPDATER = "none";
/** Narrow an unknown string to `DepUpdater` or return `null` if invalid. */
export function parseDepUpdater(value) {
    return typeof value === "string" && DEP_UPDATERS.includes(value)
        ? value
        : null;
}
// ---------------------------------------------------------------------------
// Cloud agents — post-CI auto-routing (#119 "Managed Cloud Agents")
// ---------------------------------------------------------------------------
/**
 * Cloud-agent automation chosen by the consumer (opt-in).
 * - `claude`  — `bkit install --cloud=claude` installed `.github/workflows/bkit-cloud.yml`
 *               + `.claude/hooks/cloud-bootstrap.sh`. Requires `tracker=github`.
 * - `cursor`  — `bkit install --cloud=cursor` installed `.cursor/Dockerfile`
 *               + `.cursor/environment.json`. Requires `tracker=linear`.
 * - `opencode` — `bkit install --cloud=opencode` installed `.github/workflows/bkit-cloud.yml`
 *               (same file as claude; both jobs coexist, runtime-gated by secret presence).
 *               Requires `tracker=github` + local opencode host (`bkit install --opencode=<provider>`).
 * - `none`    — explicit opt-out; silences the post-install nudge advisory.
 *
 * Recorded in `package.json` `bkit.cloudAgents`. Like `depUpdater`, file presence
 * (`bkit-cloud.yml` for github-host variants; `.cursor/Dockerfile` for cursor) is the authoritative
 * "active" signal; the package.json field only distinguishes a deliberate opt-out from
 * an undecided install.
 *
 * DECISION-C (AMENDED 2026-05-27): single self-describing field (mirrors `bkit.issueTracker`).
 * Back-compat: legacy `"enabled"` is mapped to `"claude"` by `parseCloudAgents`.
 */
export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"];
/** Default when consumer manifest has no `bkit.cloudAgents` field (undecided). */
export const DEFAULT_CLOUD_AGENTS = "none";
/** Narrow an unknown string to `CloudAgents` or return `null` if invalid.
 * Back-compat: legacy `"enabled"` value maps to `"claude"` (the only meaning it ever had).
 */
export function parseCloudAgents(value) {
    if (value === "enabled")
        return "claude"; // back-compat
    return typeof value === "string" && CLOUD_MODES.includes(value)
        ? value
        : null;
}
// ---------------------------------------------------------------------------
// Per-module manifests
// ---------------------------------------------------------------------------
const CORE_MANIFEST = [
    { path: "AGENTS.md", format: "markered-text", module: "core" },
    { path: "CLAUDE.md", format: "markered-text", module: "core" },
    { path: ".gitignore", format: "markered-text", module: "core" },
    // Append-only ledger union-merge rules live in a managed block; consumers may add
    // their own attributes outside the block, so this is markered-text (not whole-file).
    { path: ".gitattributes", format: "markered-text", module: "core" },
    { path: ".bkit/version", format: "byte-equal-text", module: "core" },
    // Canonical bkit-authored reference docs. They live package-side under `.bkit/`
    // and are read from there at runtime (getBkitDocsRoot); these consumer copies are
    // force-overwritten mirrors (writeTier1) so a consumer can read them in-repo. Whole
    // file is bkit-owned → byte-equal-text, NOT seedOrPrint (refreshed every install).
    { path: ".bkit/cloud.md", format: "byte-equal-text", module: "core" },
    { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
    { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
    { path: ".bkit/trackers.md", format: "byte-equal-text", module: "core" },
    { path: ".bkit/workflows.md", format: "byte-equal-text", module: "core" },
    { path: ".bkit/README.md", format: "byte-equal-text", module: "core" },
];
const CLAUDE_MANIFEST = [
    { path: ".claude/settings.json", format: "json", module: "claude" },
    { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
    // GateGuard advisory PreToolUse hook — fully bkit-owned Node script (no consumer
    // edits expected; configured via env vars), so byte-equal-text (force-overwrite
    // on install, hash-tracked for upgrade/uninstall). Wired in .claude/settings.json.
    { path: ".claude/hooks/gateguard.cjs", format: "byte-equal-text", module: "claude" },
    // .claude/hooks/cloud-bootstrap.sh moved to the opt-in `cloud` module (CLOUD_MANIFEST) —
    // it only matters once a Claude Code on the web env is wired (a manual, opt-in step).
    // The SessionStart hook entry in .claude/settings.json is guarded (`test -f … || true`)
    // so a default --full install without the script no-ops instead of erroring.
    { path: ".mcp.json", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    { path: ".bkit/.env.example", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    { path: ".envrc", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    // Note: .bkit/scripts/bkit-mode.sh was removed in #245 (opencode host ships as additive
    // provider-agnostic host via `bkit install --opencode=<provider>`; the ccr router lane
    // and `bkit mode` surface are retired). Consumer copies are detected on upgrade and an
    // advisory is emitted advising deletion (see runClaudeModule's bkit-mode.sh drift check).
    // Mirrors from .agents/ — managed dynamically; not listed individually here
    // because the exact set depends on the bkit-prefix prompt/workflow files at
    // install time. The uninstall logic handles these via the BKIT_PREFIX filter.
];
const CURSOR_MANIFEST = [
    { path: ".cursor/hooks.json", format: "json", module: "cursor" },
    { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
    { path: ".cursor/rules/00-shared-rules.mdc", format: "markered-text", module: "cursor" },
    { path: ".cursor/settings.json", format: "byte-equal-text", module: "cursor", seedOrPrint: true },
    // .cursor/Dockerfile + .cursor/environment.json moved to the opt-in `cloud` module
    // (CLOUD_MANIFEST) — they only matter for Cursor Background Agents (cloud), are read
    // by Cursor's cloud infra (not in-repo hooks), and are inert for local Cursor use.
    { path: ".cursor/mcp.json", format: "byte-equal-text", module: "cursor", seedOrPrint: true },
    // Mirrors from .agents/ — managed dynamically; not listed individually.
];
// opencode is opt-in via `bkit install --opencode=<provider>` — additive alongside
// always-on claude/cursor. Agent and command mirrors are managed dynamically (like
// claude/cursor); listed entries cover the static config + plugin files.
//
// opencode.json is Tier-2 deep-contained (writeTier2JsonContained) — it is
// ownership-mixed: consumers add their own provider keys, model lists, and mcp entries,
// so bkit must reconverge only the bkit-managed keys on upgrade (KN-17). Seed-or-print
// (Tier-3) would silently abandon bkit's managed keys on consumer-modified files.
//
// gateguard.js is byte-equal-text (writeTier1 force-overwrite) — consumers configure
// via env vars, not by editing; fully bkit-owned like .claude/hooks/gateguard.cjs.
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
export const OPENCODE_MANIFEST = [
    // opencode.json — Tier-2 json (deep-contained, ownership-mixed, reconverged on upgrade).
    // writeTier2JsonContained throws on malformed destination (KN-19 guard).
    { path: ".opencode/opencode.json", format: "json", module: "opencode" },
    // gateguard.js — Tier-1 byte-equal-text (bkit-owned, force-overwrite; consumers use env vars).
    { path: ".opencode/plugin/gateguard.js", format: "byte-equal-text", module: "opencode" },
    // Agent and command mirrors are managed dynamically (not listed individually here —
    // the exact set depends on the bkit-prefix prompt/workflow files at install time).
    // Uninstall uses the BKIT_PREFIX filter for .opencode/agents/ and .opencode/commands/.
];
const CI_MANIFEST = [
    // ci.yml is seed-or-print — appending bkit content to existing CI YAML produces
    // duplicate top-level keys, so consumers own it after the initial seed.
    { path: ".github/workflows/ci.yml", format: "byte-equal-text", module: "ci", seedOrPrint: true },
    {
        path: "package.json",
        format: "markered-text",
        module: "ci",
        packageJsonKeys: {
            scripts: { typecheck: "tsc --noEmit" },
        },
    },
];
// Cloud agent integration is opt-in — NOT included in --full, so a default install
// ships ZERO cloud footprint. The module is split by variant (DECISION-D):
//
//   cloud=claude (tracker=github):
//   - bkit-cloud.yml        — phase-routed GitHub Action; carries BOTH claude + opencode jobs,
//                              runtime-gated by secret presence. Requires ANTHROPIC_API_KEY +
//                              Claude GitHub App + Actions write perms (for claude job).
//   - cloud-bootstrap.sh    — Claude Code on the web SessionStart install hook
//                              (no-op unless CLAUDE_CODE_REMOTE=true).
//
//   cloud=opencode (tracker=github):
//   - bkit-cloud.yml        — same file as cloud=claude; the opencode job runs when
//                              OPENCODE_PROVIDER_KEY is set. Requires local opencode host
//                              (`bkit install --opencode=<provider>`). No OIDC.
//
//   cloud=cursor (tracker=linear):
//   - .cursor/Dockerfile     — Cursor Background Agent container toolchain.
//   - .cursor/environment.json — Cursor Background Agent env config (consumer-owned).
//
// Splitting per variant ensures uninstall removes ONLY the recorded variant's files —
// a single manifest with conditional emission but unconditional uninstall listing would
// orphan the unused variant's files. See issue #119 ("Managed Cloud Agents").
export const CLOUD_MANIFEST_CLAUDE = [
    { path: ".github/workflows/bkit-cloud.yml", format: "byte-equal-text", module: "cloud" },
    { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "cloud" },
];
// opencode cloud variant ships the same bkit-cloud.yml (both jobs coexist, runtime-gated).
export const CLOUD_MANIFEST_OPENCODE = [
    { path: ".github/workflows/bkit-cloud.yml", format: "byte-equal-text", module: "cloud" },
];
export const CLOUD_MANIFEST_CURSOR = [
    { path: ".cursor/Dockerfile", format: "markered-text", module: "cloud" },
    {
        path: ".cursor/environment.json",
        format: "byte-equal-text",
        module: "cloud",
        seedOrPrint: true,
    },
];
// Combined manifest used by MODULE_MANIFESTS.cloud (install dispatch + uninstall).
// Uninstall intentionally removes the union (zero-footprint): each variant's files are
// physically absent on an install of the other variant, so removing absent files is a no-op.
// DECISION-D states the split exists for install EMISSION (variant-correct write), not for
// variant-correct uninstall listing — union removal is the correct uninstall behaviour.
// bkit-cloud.yml appears in both CLOUD_MANIFEST_CLAUDE and CLOUD_MANIFEST_OPENCODE; the
// duplicate is deduplicated here so uninstall only attempts one removal.
const CLOUD_MANIFEST = [
    ...CLOUD_MANIFEST_CLAUDE,
    // CLOUD_MANIFEST_OPENCODE shares bkit-cloud.yml with claude; skip duplicate workflow entry.
    ...CLOUD_MANIFEST_CURSOR,
];
// Renovate is opt-in via `bkit install --renovate` — phase-gated against the
// default branch. NOT included in --full. See issue #123 follow-up.
const RENOVATE_MANIFEST = [
    { path: ".github/renovate.json5", format: "byte-equal-text", module: "renovate" },
];
// Dependabot is opt-in via `bkit install --dependabot` — first-party GitHub
// feature, no App install required. Mutually exclusive with --renovate. NOT
// included in --full. See issue #109 (origin) + #123 follow-up. dependabot.yml
// is Tier 3 (seed-or-print) because consumers commonly tune the npm section
// per their monorepo shape; the helper script is Tier 1 (canonical).
const DEPENDABOT_MANIFEST = [
    { path: ".github/dependabot.yml", format: "byte-equal-text", module: "dependabot" },
    { path: ".bkit/scripts/bkit-set-dependabot.sh", format: "byte-equal-text", module: "dependabot" },
];
const LINT_MANIFEST = [
    { path: ".vale.ini", format: "byte-equal-text", module: "lint", seedOrPrint: true },
    { path: "slop-scan.config.json", format: "byte-equal-text", module: "lint", seedOrPrint: true },
    { path: ".prettierignore", format: "markered-text", module: "lint" },
    // .vale/styles/House/ — fully managed as a directory; individual files
    // are enumerated at uninstall time.
    {
        path: "package.json",
        format: "markered-text",
        module: "lint",
        packageJsonKeys: {
            scripts: {
                "format:check": "prettier --check .",
                "lint:prose": 'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
                "lint:slop": "slop-scan scan .",
                "slop:delta": "bash .bkit/scripts/bkit-slop-delta.sh",
            },
            devDependencies: {
                prettier: "^3.5.3",
                "slop-scan": "^0.3.0",
            },
        },
    },
];
// v2.0.4: husky hooks switched from "markered-text" (Tier 2) to "byte-equal-text"
// (Tier 3 seed-or-print). Hook scripts no longer carry bkit:start/bkit:end markers;
// the canonical file IS the install-time template, and uninstall is hash-guarded
// (delete only when consumer hasn't modified). See `runGitHooksModule` and
// CHANGELOG 2.0.4 for the architecture rationale.
const GIT_HOOKS_MANIFEST = [
    { path: ".husky/pre-commit", format: "byte-equal-text", module: "git-hooks", seedOrPrint: true },
    { path: ".husky/pre-push", format: "byte-equal-text", module: "git-hooks", seedOrPrint: true },
    {
        path: "package.json",
        format: "markered-text",
        module: "git-hooks",
        packageJsonKeys: {
            scripts: { prepare: "husky" },
            devDependencies: { husky: "^9.1.7" },
        },
    },
];
// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------
const MODULE_MANIFESTS = {
    core: CORE_MANIFEST,
    claude: CLAUDE_MANIFEST,
    cursor: CURSOR_MANIFEST,
    opencode: OPENCODE_MANIFEST,
    ci: CI_MANIFEST,
    lint: LINT_MANIFEST,
    "git-hooks": GIT_HOOKS_MANIFEST,
    renovate: RENOVATE_MANIFEST,
    dependabot: DEPENDABOT_MANIFEST,
    cloud: CLOUD_MANIFEST,
};
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Return a flat array of all ManifestEntry records for the given module names.
 * When `modules` is empty, returns entries for all modules.
 *
 * Caller is responsible for deduplication (e.g. `package.json` appears in
 * multiple module manifests when more than one module writes to it).
 */
export function getInstallManifest(modules = []) {
    const keys = modules instanceof Set
        ? [...modules].filter((m) => m in MODULE_MANIFESTS)
        : modules.length === 0
            ? Object.keys(MODULE_MANIFESTS)
            : modules;
    return keys.flatMap((m) => MODULE_MANIFESTS[m] ?? []);
}
/**
 * Return ALL manifest entries for a single module.
 */
export function getModuleManifest(module) {
    return MODULE_MANIFESTS[module] ?? [];
}
/**
 * Return the aggregated package.json scripts/devDependencies keys managed
 * across ALL modules (or a subset). Used by bkit-package-json.ts to strip
 * default-only keys during uninstall.
 */
export function getManagedPackageJsonKeys(modules = []) {
    const entries = getInstallManifest(modules);
    const scripts = {};
    const devDependencies = {};
    for (const entry of entries) {
        if (!entry.packageJsonKeys)
            continue;
        if (entry.packageJsonKeys.scripts) {
            Object.assign(scripts, entry.packageJsonKeys.scripts);
        }
        if (entry.packageJsonKeys.devDependencies) {
            Object.assign(devDependencies, entry.packageJsonKeys.devDependencies);
        }
    }
    return { scripts, devDependencies };
}
