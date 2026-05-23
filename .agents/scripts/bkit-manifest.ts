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

export type ModuleName =
  | "core"
  | "claude"
  | "cursor"
  | "ci"
  | "lint"
  | "git-hooks"
  | "renovate"
  | "dependabot";

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
export const ISSUE_TRACKERS = ["github", "linear", "none"] as const;
export type IssueTracker = (typeof ISSUE_TRACKERS)[number];

/** Default tracker when consumer manifest has no `bkit.issueTracker` field. */
export const DEFAULT_ISSUE_TRACKER: IssueTracker = "none";

/**
 * Narrow an unknown string to `IssueTracker` or return `null` if invalid.
 * Used by CLI flag parsing and consumer-manifest reads.
 */
export function parseIssueTracker(value: unknown): IssueTracker | null {
  return typeof value === "string" && (ISSUE_TRACKERS as readonly string[]).includes(value)
    ? (value as IssueTracker)
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
export const DEP_UPDATERS = ["renovate", "dependabot", "none"] as const;
export type DepUpdater = (typeof DEP_UPDATERS)[number];

/** Default when consumer manifest has no `bkit.depUpdater` field (undecided). */
export const DEFAULT_DEP_UPDATER: DepUpdater = "none";

/** Narrow an unknown string to `DepUpdater` or return `null` if invalid. */
export function parseDepUpdater(value: unknown): DepUpdater | null {
  return typeof value === "string" && (DEP_UPDATERS as readonly string[]).includes(value)
    ? (value as DepUpdater)
    : null;
}

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
const RENOVATE_MANIFEST: ManifestEntry[] = [
  { path: ".github/renovate.json5", format: "byte-equal-text", module: "renovate" },
];

// Dependabot is opt-in via `bkit install --dependabot` — first-party GitHub
// feature, no App install required. Mutually exclusive with --renovate. NOT
// included in --full. See issue #109 (origin) + #123 follow-up. dependabot.yml
// is Tier 3 (seed-or-print) because consumers commonly tune the npm section
// per their monorepo shape; the helper script is Tier 1 (canonical).
const DEPENDABOT_MANIFEST: ManifestEntry[] = [
  { path: ".github/dependabot.yml", format: "byte-equal-text", module: "dependabot" },
  { path: "scripts/ci/bkit-set-dependabot.sh", format: "byte-equal-text", module: "dependabot" },
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
