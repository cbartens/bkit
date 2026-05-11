// bkit-manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by bkit-uninstall.ts
// and bkit-package-json.ts (key strippers).
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and package.json strippers.
// ---------------------------------------------------------------------------
// Per-module manifests
// ---------------------------------------------------------------------------
const CORE_MANIFEST = [
    { path: "AGENTS.md", format: "markered-text", module: "core" },
    { path: "CLAUDE.md", format: "markered-text", module: "core" },
    { path: ".gitignore", format: "markered-text", module: "core" },
    { path: ".agents/.bkit-version", format: "byte-equal-text", module: "core" },
];
const CLAUDE_MANIFEST = [
    { path: ".claude/settings.json", format: "json", module: "claude" },
    { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
    // Mirrors from .agents/ — managed dynamically; not listed individually here
    // because the exact set depends on the bkit-prefix prompt/workflow files at
    // install time. The uninstall logic handles these via the BKIT_PREFIX filter.
];
const CURSOR_MANIFEST = [
    { path: ".cursor/hooks.json", format: "json", module: "cursor" },
    { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
    { path: ".cursor/rules/00-shared-rules.mdc", format: "markered-text", module: "cursor" },
    { path: ".cursor/settings.json", format: "byte-equal-text", module: "cursor" },
    { path: ".cursor/Dockerfile", format: "byte-equal-text", module: "cursor" },
    { path: ".cursor/environment.json", format: "byte-equal-text", module: "cursor" },
    // Mirrors from .agents/ — managed dynamically; not listed individually.
];
const CI_MANIFEST = [
    { path: ".github/workflows/ci.yml", format: "byte-equal-text", module: "ci" },
    {
        path: "package.json",
        format: "markered-text",
        module: "ci",
        packageJsonKeys: {
            scripts: { typecheck: "tsc --noEmit" },
        },
    },
];
const LINT_MANIFEST = [
    { path: ".vale.ini", format: "byte-equal-text", module: "lint" },
    { path: "slop-scan.config.json", format: "byte-equal-text", module: "lint" },
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
const GIT_HOOKS_MANIFEST = [
    { path: ".husky/pre-commit", format: "markered-text", module: "git-hooks" },
    { path: ".husky/pre-push", format: "markered-text", module: "git-hooks" },
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
