// bkit-manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by bkit-uninstall.ts
// and bkit-package-json.ts (key strippers).
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and package.json strippers.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ManifestEntry {
  /** Destination path relative to consumer repo root (as written by install). */
  path: string;
  /**
   * Format classification — determines the scope-extraction mechanism used by
   * install/check/uninstall dispatch:
   *   "json"           = deep-containment (writeTier2JsonContained / deepContains / stripTier2JsonScope)
   *   "markered-text"  = marker block extraction + byte-equal (insert-or-replace / strip)
   *   "byte-equal-text" = whole-file byte-equal (overwrite / hash-or-byte-equal delete)
   */
  format: "json" | "markered-text" | "byte-equal-text";
  /**
   * Module that owns this file.
   */
  module: ModuleName;
  /**
   * Optional: package.json keys managed by this module (scripts / devDependencies).
   * Used by bkit-package-json.ts to strip default-only managed keys.
   */
  packageJsonKeys?: {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

export type ModuleName = "core" | "claude" | "cursor" | "ci" | "lint" | "git-hooks";

// ---------------------------------------------------------------------------
// Per-module manifests
// ---------------------------------------------------------------------------

const CORE_MANIFEST: ManifestEntry[] = [
  { path: "AGENTS.md", format: "markered-text", module: "core" },
  { path: "CLAUDE.md", format: "markered-text", module: "core" },
  { path: ".gitignore", format: "markered-text", module: "core" },
  { path: ".agents/.bkit-version", format: "byte-equal-text", module: "core" },
];

const CLAUDE_MANIFEST: ManifestEntry[] = [
  { path: ".claude/settings.json", format: "json", module: "claude" },
  { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
  { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "claude" },
  { path: ".mcp.json", format: "byte-equal-text", module: "claude" },
  { path: ".agents/.env.example", format: "byte-equal-text", module: "claude" },
  { path: ".envrc", format: "byte-equal-text", module: "claude" },
  // Mirrors from .agents/ — managed dynamically; not listed individually here
  // because the exact set depends on the bkit-prefix prompt/workflow files at
  // install time. The uninstall logic handles these via the BKIT_PREFIX filter.
];

const CURSOR_MANIFEST: ManifestEntry[] = [
  { path: ".cursor/hooks.json", format: "json", module: "cursor" },
  { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
  { path: ".cursor/rules/00-shared-rules.mdc", format: "markered-text", module: "cursor" },
  { path: ".cursor/settings.json", format: "byte-equal-text", module: "cursor" },
  { path: ".cursor/Dockerfile", format: "markered-text", module: "cursor" },
  { path: ".cursor/environment.json", format: "byte-equal-text", module: "cursor" },
  { path: ".cursor/mcp.json", format: "byte-equal-text", module: "cursor" },
  // Mirrors from .agents/ — managed dynamically; not listed individually.
];

const CI_MANIFEST: ManifestEntry[] = [
  { path: ".github/workflows/ci.yml", format: "byte-equal-text", module: "ci" },
  { path: ".github/workflows/bkit-ci-router.yml", format: "byte-equal-text", module: "ci" },
  { path: ".github/dependabot.yml", format: "byte-equal-text", module: "ci" },
  {
    path: "package.json",
    format: "markered-text",
    module: "ci",
    packageJsonKeys: {
      scripts: { typecheck: "tsc --noEmit" },
    },
  },
];

const LINT_MANIFEST: ManifestEntry[] = [
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
        "lint:prose":
          'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
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
const GIT_HOOKS_MANIFEST: ManifestEntry[] = [
  { path: ".husky/pre-commit", format: "byte-equal-text", module: "git-hooks" },
  { path: ".husky/pre-push", format: "byte-equal-text", module: "git-hooks" },
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

const MODULE_MANIFESTS: Record<ModuleName, ManifestEntry[]> = {
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
export function getInstallManifest(modules: ModuleName[] | Set<string> = []): ManifestEntry[] {
  const keys =
    modules instanceof Set
      ? ([...modules].filter((m) => m in MODULE_MANIFESTS) as ModuleName[])
      : modules.length === 0
        ? (Object.keys(MODULE_MANIFESTS) as ModuleName[])
        : modules;

  return keys.flatMap((m) => MODULE_MANIFESTS[m] ?? []);
}

/**
 * Return ALL manifest entries for a single module.
 */
export function getModuleManifest(module: ModuleName): ManifestEntry[] {
  return MODULE_MANIFESTS[module] ?? [];
}

/**
 * Return the aggregated package.json scripts/devDependencies keys managed
 * across ALL modules (or a subset). Used by bkit-package-json.ts to strip
 * default-only keys during uninstall.
 */
export function getManagedPackageJsonKeys(modules: ModuleName[] | Set<string> = []): {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  const entries = getInstallManifest(modules);
  const scripts: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  for (const entry of entries) {
    if (!entry.packageJsonKeys) continue;
    if (entry.packageJsonKeys.scripts) {
      Object.assign(scripts, entry.packageJsonKeys.scripts);
    }
    if (entry.packageJsonKeys.devDependencies) {
      Object.assign(devDependencies, entry.packageJsonKeys.devDependencies);
    }
  }

  return { scripts, devDependencies };
}
