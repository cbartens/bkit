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
 * Add a new value here when adding a provider section to `.agents/trackers.md`.
 * See `.agents/trackers.md` § "Adding a tracker (Jira, etc.)" in the Rules block.
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
// Per-module manifests
// ---------------------------------------------------------------------------
const CORE_MANIFEST = [
    { path: "AGENTS.md", format: "markered-text", module: "core" },
    { path: "CLAUDE.md", format: "markered-text", module: "core" },
    { path: ".gitignore", format: "markered-text", module: "core" },
    // Append-only ledger union-merge rules live in a managed block; consumers may add
    // their own attributes outside the block, so this is markered-text (not whole-file).
    { path: ".gitattributes", format: "markered-text", module: "core" },
    { path: ".agents/.bkit-version", format: "byte-equal-text", module: "core" },
];
const CLAUDE_MANIFEST = [
    { path: ".claude/settings.json", format: "json", module: "claude" },
    { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
    { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "claude" },
    { path: ".mcp.json", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    { path: ".agents/.env.example", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    { path: ".envrc", format: "byte-equal-text", module: "claude", seedOrPrint: true },
    // Mirrors from .agents/ — managed dynamically; not listed individually here
    // because the exact set depends on the bkit-prefix prompt/workflow files at
    // install time. The uninstall logic handles these via the BKIT_PREFIX filter.
];
const CURSOR_MANIFEST = [
    { path: ".cursor/hooks.json", format: "json", module: "cursor" },
    { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
    { path: ".cursor/rules/00-shared-rules.mdc", format: "markered-text", module: "cursor" },
    { path: ".cursor/settings.json", format: "byte-equal-text", module: "cursor", seedOrPrint: true },
    { path: ".cursor/Dockerfile", format: "markered-text", module: "cursor" },
    {
        path: ".cursor/environment.json",
        format: "byte-equal-text",
        module: "cursor",
        seedOrPrint: true,
    },
    { path: ".cursor/mcp.json", format: "byte-equal-text", module: "cursor", seedOrPrint: true },
    // Mirrors from .agents/ — managed dynamically; not listed individually.
];
const CI_MANIFEST = [
    // ci.yml is seed-or-print — appending bkit content to existing CI YAML produces
    // duplicate top-level keys, so consumers own it after the initial seed.
    { path: ".github/workflows/ci.yml", format: "byte-equal-text", module: "ci", seedOrPrint: true },
    // bkit-ci-router.yml is canonical (writeTier1) — bkit owns it end-to-end, auto-overwrites.
    { path: ".github/workflows/bkit-ci-router.yml", format: "byte-equal-text", module: "ci" },
    {
        path: "package.json",
        format: "markered-text",
        module: "ci",
        packageJsonKeys: {
            scripts: { typecheck: "tsc --noEmit" },
        },
    },
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
    { path: "scripts/ci/bkit-set-dependabot.sh", format: "byte-equal-text", module: "dependabot" },
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
    ci: CI_MANIFEST,
    lint: LINT_MANIFEST,
    "git-hooks": GIT_HOOKS_MANIFEST,
    renovate: RENOVATE_MANIFEST,
    dependabot: DEPENDABOT_MANIFEST,
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
