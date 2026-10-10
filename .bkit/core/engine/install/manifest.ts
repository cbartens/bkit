// install/manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by commands/install/uninstall.ts
// and the upgrade walk.
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and upgrade.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ManifestEntry {
  /** Destination path relative to consumer repo root (as written by install). */
  path: string;
  /**
   * Format classification — determines the scope-extraction mechanism used by
   * install/check/uninstall dispatch:
   *   "json"           = deep-containment (writeTier2JsonContained / deepContains / stripTier2JsonScope);
   *                      `.mcp.json` / `.cursor/mcp.json` instead own only `mcpServers.<tracker>`
   *                      (reconcileMcpJson / stripMcpTrackerEntries)
   *   "markered-text"  = marker block extraction + byte-equal (insert-or-replace / strip)
   *   "byte-equal-text" = whole-file byte-equal (overwrite / hash-or-byte-equal delete)
   */
  format: "json" | "markered-text" | "byte-equal-text";
  /**
   * Module that owns this file.
   */
  module: ModuleName;
  /**
   * `byte-equal-text` only. bkit-GENERATED artefact: no file under `.bkit/templates/`
   * backs it (install computes the bytes from consumer config). Its install-time hash
   * lands in `canonicalHashes` like every owned file's, so uninstall deletes it while
   * it is unchanged.
   */
  generated?: boolean;
}

export type ModuleName = "core" | "claude" | "cursor" | "opencode" | "codex" | "lint" | "cloud";

// ---------------------------------------------------------------------------
// Issue tracker
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
// Cloud agents — post-CI auto-routing
// ---------------------------------------------------------------------------

/**
 * Cloud-agent automation chosen by the consumer (opt-in).
 * - `claude`  — `bkit install --auto=claude` writes `.claude/hooks/cloud-bootstrap.sh`; the
 *               consumer copies the `.github/workflows/bkit-cloud.yml` template. Requires `tracker=github`.
 * - `cursor`  — `bkit install --auto=cursor` writes no file; the consumer copies the
 *               `.cursor/Dockerfile` + `.cursor/environment.json` templates. Requires `tracker=linear`.
 * - `opencode` — `bkit install --auto=opencode` writes no file; the consumer copies the same
 *               `bkit-cloud.yml` template as claude (both jobs coexist, runtime-gated by secret
 *               presence). Requires `tracker=github` + local opencode host (`bkit install --opencode=<provider>`).
 * - `none`    — explicit opt-out; silences the post-install nudge advisory.
 *
 * Recorded in `package.json` `bkit.cloudAgents`. Presence of the adopted copy
 * (`bkit-cloud.yml` for github-host variants; `.cursor/Dockerfile` for cursor) is the authoritative
 * "active" signal; the package.json field only distinguishes an opt-out from
 * an undecided install.
 *
 * Single self-describing field (mirrors `bkit.issueTracker`).
 */
export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"] as const;
export type CloudAgents = (typeof CLOUD_MODES)[number];

/** Default when consumer manifest has no `bkit.cloudAgents` field (undecided). */
export const DEFAULT_CLOUD_AGENTS: CloudAgents = "none";

/** Narrow an unknown string to `CloudAgents` or return `null` if invalid. */
export function parseCloudAgents(value: unknown): CloudAgents | null {
  return typeof value === "string" && (CLOUD_MODES as readonly string[]).includes(value)
    ? (value as CloudAgents)
    : null;
}

// ---------------------------------------------------------------------------
// Per-module manifests
// ---------------------------------------------------------------------------

const CORE_MANIFEST: ManifestEntry[] = [
  { path: "AGENTS.md", format: "markered-text", module: "core" },
  // CLAUDE.md is in CLAUDE_MANIFEST: it is a Claude-Code-only redirect. AGENTS.md
  // (the cross-host dispatch router) is core.
  { path: ".gitignore", format: "markered-text", module: "core" },
  // Append-only ledger union-merge rules live in a managed block; consumers may add
  // their own attributes outside the block, so this is markered-text (not whole-file).
  { path: ".gitattributes", format: "markered-text", module: "core" },
  { path: ".bkit/version", format: "byte-equal-text", module: "core" },
  // Canonical bkit-authored reference docs. They live package-side under `.bkit/`
  // and are read from there at runtime (getBkitDocsRoot); these consumer copies are
  // force-overwritten mirrors (writeTier1) so a consumer can read them in-repo. Whole
  // file is bkit-owned → byte-equal-text (refreshed every install).
  { path: ".bkit/cloud.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/jsonl.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
  { path: ".bkit/templates.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/trackers.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/workflows.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/README.md", format: "byte-equal-text", module: "core" },
];

const CLAUDE_MANIFEST: ManifestEntry[] = [
  // Root CLAUDE.md — Claude-Code redirect to .agents/rules.md, owned by the claude module:
  // `uninstall --claude` removes it; a non-claude install/uninstall leaves it.
  // Emitted by runClaudeModule (a root file, outside the .claude/ dir walk).
  { path: "CLAUDE.md", format: "markered-text", module: "claude" },
  { path: ".claude/settings.json", format: "json", module: "claude" },
  { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
  // GateGuard advisory PreToolUse hook — markered-text (slash-comment): bkit owns
  // only the advisory engine between `// bkit:start` / `// bkit:end`; the stdin/
  // stdout driver outside the block is consumer-owned from first install onward, so
  // a consumer can add their own advisories without losing them on upgrade. Wired
  // in .claude/settings.json.
  {
    path: ".claude/hooks/gateguard.cjs",
    format: "markered-text",
    module: "claude",
  },
  // guardrails.cjs — Tier-2 markered-text, twin of the Cursor/Codex hooks.
  // PreToolUse matcher `Bash`. ADVISORY ONLY: covers URL hosts and shell-as-edit-channel;
  // never denies or asks.
  {
    path: ".claude/hooks/guardrails.cjs",
    format: "markered-text",
    module: "claude",
  },
  // .claude/hooks/cloud-bootstrap.sh is in the opt-in `cloud` module (CLOUD_MANIFEST).
  // The SessionStart hook entry in .claude/settings.json is guarded (`test -f … || true`),
  // so a default install without the script no-ops.
  // bkit owns only its tracker entry under `mcpServers` (reconcileMcpJson); every other
  // key is the consumer's.
  { path: ".mcp.json", format: "json", module: "claude" },
  // Owned (writeTier1): consumer edits are overwritten. Real values go in `.bkit/.env`.
  { path: ".bkit/.env.example", format: "byte-equal-text", module: "claude" },
  // Mirrors from .agents/ — managed dynamically, not listed individually here (the set
  // depends on the bkit-prefix prompt/workflow files at install time). The uninstall
  // logic handles these via the BKIT_PREFIX filter.
];

// ---------------------------------------------------------------------------
// bkit:gate:* — the local gate workflows, prompts and hooks run
//
// ONE CHAIN. Each gate is the previous gate plus its own tier; the NAME and the
// VALUE describe the same sequence. Tier vocabulary is the `ci.yml` job ids
// (bkit-tests-static / -unit / -integration / -e2e / -live). Where a step is not a
// tier (`format`, the ship gate) the name spells out the actual steps.
//
// The consumer owns every value: a turbo monorepo writes `turbo run … --filter`,
// a Python repo writes `ruff check && pytest`. bkit never reads a value — only
// whether a name is declared.
//
// Seeded by core on every install and upgrade (seedCorePackageJsonScripts,
// install/modules/index.ts): add-if-missing, so a name already present is never touched,
// and uninstall leaves every name in place. The tool scripts the defaults chain
// (typecheck, lint, format:check, lint:prose, slop:delta, lint-staged) are the
// consumer's to add — `.bkit/templates.md` lists them; the
// `gate-missing-called-scripts` advisory names any that are missing.
//
// The SAME names are what the git hook templates run (`.husky/pre-commit`,
// `.husky/pre-push`). `ci.yml` does NOT call the gates; it calls the scripts directly.
//
// `lint:slop` is in no gate: `slop-scan scan` is report-only and never fails. The gate
// that fails on new findings is `slop:delta`.
//
// NOT SEEDED: the three deeper gates (…-integration, …-integration-e2e,
// …-integration-e2e-live) are absent unless the consumer writes them. Each is one line
// chaining its parent, e.g.
//   "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration"
// `/bkit-build` and `/bkit-debug` run the DEEPEST gate that exists and record its name.
export const BKIT_GATE_SCRIPTS: Readonly<Record<string, string>> = {
  // `.husky/pre-commit`: prettier --write over staged files, and nothing else —
  // seconds, not minutes. Prose is a whole-repo scan, so it gates at pre-push.
  "bkit:gate:format": "pnpm lint-staged",
  // Everything that needs no test runner. Mirrors the bkit-tests-static CI job.
  // Callers: build's plan-execute loop between tasks, and the `.husky/pre-push` revert
  // path.
  "bkit:gate:static":
    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta",
  // The default local gate: `.husky/pre-push`, build Step 14, the remediates.
  "bkit:gate:static-unit": "pnpm bkit:gate:static && pnpm test",
  // Ship's conflict-resolve, the only caller whose dependency graph may have just
  // been hand-merged (lockfile conflict) and whose tree no one has ever compiled.
  // `install --frozen-lockfile` proves the merged lockfile still matches the
  // manifest; `build` proves the resolution compiles. Both are named here and
  // nowhere else.
  "bkit:gate:install-static-unit-build":
    "pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build",
  // --- dependency inspection ---------------------------------------------
  // Read-only, not gates: agents run these while diagnosing a version-shaped
  // hypothesis or auditing deps. Named so the prompts stop hardcoding `pnpm
  // outdated` / `pnpm audit`, which a cargo, go or uv consumer cannot run.
  "bkit:deps:outdated": "pnpm outdated",
  "bkit:deps:audit": "pnpm audit",
};

/**
 * The deeper gates, in DESCENDING order — `/bkit-debug` runs the first one the
 * consumer declares. Never seeded (see BKIT_GATE_SCRIPTS); listed here so the
 * workflow, the docs and the audit test share one ordering.
 *
 * The `:live` suffix is load-bearing: `/bkit-debug` greps the recorded scope for
 * the word `live` to decide `testsLiveSkipped`, and `:` is not a word character.
 */
export const BKIT_DEBUG_GATES: readonly string[] = [
  "bkit:gate:static-unit-integration-e2e-live",
  "bkit:gate:static-unit-integration-e2e",
  "bkit:gate:static-unit",
];

/**
 * What `/bkit-build` Step 14 will run, in DESCENDING order — first one declared wins.
 *
 * Build stops at integration; E2E and live are not in this list.
 *
 * Neither entry is seeded: declaring `bkit:gate:static-unit-integration` opts the build
 * loop into the integration tier.
 */
export const BKIT_BUILD_GATES: readonly string[] = [
  "bkit:gate:static-unit-integration",
  "bkit:gate:static-unit",
];

/**
 * The deeper gates, shallowest first, with what declaring each one costs.
 *
 * Never seeded. The probe's rule is "declared = run it". `declaredBy` is how install
 * detects a repo that HAS a tier but declares no gate for it, and advises — see
 * detectGateAdvisories.
 */
export const BKIT_OPTIONAL_GATES: ReadonlyArray<{
  gate: string;
  parent: string;
  declaredBy: readonly string[];
}> = [
  {
    gate: "bkit:gate:static-unit-integration",
    parent: "bkit:gate:static-unit",
    declaredBy: ["test:integration"],
  },
  {
    gate: "bkit:gate:static-unit-integration-e2e",
    parent: "bkit:gate:static-unit-integration",
    declaredBy: ["test:e2e"],
  },
  {
    gate: "bkit:gate:static-unit-integration-e2e-live",
    parent: "bkit:gate:static-unit-integration-e2e",
    declaredBy: ["test:live", "test:integration:live", "test:e2e:live"],
  },
];

const CURSOR_MANIFEST: ManifestEntry[] = [
  { path: ".cursor/hooks.json", format: "json", module: "cursor" },
  { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
  // Destructive-op + secret-exposure gates (parity with Claude permissions / OpenCode
  // permission map) — markered-text (slash-comment), same ownership split as the two
  // GateGuard hooks: bkit owns only the decision engine between the markers, the
  // stdin/stdout driver outside them is consumer-owned from first install onward, so a
  // consumer can add their own gates without losing them on upgrade.
  {
    path: ".cursor/hooks/guardrails.cjs",
    format: "markered-text",
    module: "cursor",
  },
  // GateGuard advisory PreToolUse hook for Cursor — same ownership split and the
  // same managed block as the Claude twin (byte-identical between the markers,
  // asserted by a parity test). Wired in .cursor/hooks.json → preToolUse
  // (matcher "Write"), without failClosed.
  {
    path: ".cursor/hooks/gateguard.cjs",
    format: "markered-text",
    module: "cursor",
  },
  // Curl/wget host allowlist read at runtime by guardrails.cjs. No template backs it —
  // `writeNetworkAllowlistArtifact` (install/cloud-env.ts) computes the domain set from the
  // consumer's own config, so it is `generated` and its hash is in `canonicalHashes`.
  { path: ".cursor/allowlist.json", format: "byte-equal-text", module: "cursor", generated: true },
  // Cursor CLI / cloud-agent MCP allows — `writeCursorCliPermissionsArtifact`
  // (install/cloud-env.ts) renders it from the consumer's `mcp-servers` block; same contract.
  { path: ".cursor/cli.json", format: "byte-equal-text", module: "cursor", generated: true },
  { path: ".cursor/rules/00-shared-rules.mdc", format: "markered-text", module: "cursor" },
  // Same per-entry ownership as `.mcp.json` (reconcileMcpJson).
  { path: ".cursor/mcp.json", format: "json", module: "cursor" },
  // Mirrors from .agents/ — managed dynamically; not listed individually.
];

// opencode is opt-in via `bkit install --opencode=<provider>` — additive alongside
// always-on claude/cursor. Agent and command mirrors are managed dynamically (like
// claude/cursor); listed entries cover the static config + plugin files.
//
// opencode.json is Tier-2 deep-contained (writeTier2JsonContained) — it is
// ownership-mixed: consumers add their own provider keys, model lists, and mcp entries,
// so bkit must reconverge only the bkit-managed keys on upgrade (KN-17).
//
// gateguard.js is markered-text (slash-comment) — bkit owns only the advisory engine
// between the markers; the exported plugin driver outside the block is consumer-owned
// from first install onward, same split as .claude/hooks/gateguard.cjs.
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
export const OPENCODE_MANIFEST: ManifestEntry[] = [
  // opencode.json — Tier-2 json (deep-contained, ownership-mixed, reconverged on upgrade).
  // writeTier2JsonContained throws on malformed destination (KN-19 guard).
  { path: ".opencode/opencode.json", format: "json", module: "opencode" },
  // gateguard.js — Tier-2 markered-text (slash-comment); see comment above.
  {
    path: ".opencode/plugin/gateguard.js",
    format: "markered-text",
    module: "opencode",
  },
  // Agent and command mirrors are managed dynamically (not listed individually here —
  // the exact set depends on the bkit-prefix prompt/workflow files at install time).
  // Uninstall uses the BKIT_PREFIX filter for .opencode/agents/ and .opencode/commands/.
];

// --codex: Codex CLI host. NOTE there is no `.codex/config.toml` here — `openai` is a
// RESERVED built-in provider id in Codex (alongside `ollama` and `lmstudio`); re-stating it
// under `[model_providers.openai]` is rejected.
// Codex reads project config from `.codex/`, and hooks load only once that layer is TRUSTED.
export const CODEX_MANIFEST: ManifestEntry[] = [
  // hooks.json — Tier-2 json (deep-contained): bkit owns the PreToolUse GateGuard entry,
  // consumers may add their own event groups alongside it.
  { path: ".codex/hooks.json", format: "json", module: "codex" },
  // gateguard.cjs — Tier-2 markered-text, twin of the Claude hook (same stdin/stdout
  // contract); differs only in tool name (apply_patch) and V4A patch-envelope parsing.
  {
    path: ".codex/hooks/gateguard.cjs",
    format: "markered-text",
    module: "codex",
  },
  // guardrails.cjs — Tier-2 markered-text, twin of the Cursor hook (same decision
  // engine). Registered on matcher `Bash`, Codex's shell tool name. Codex parses but
  // does not implement `permissionDecision: "ask"`, so the deny tier blocks for real
  // and the ask tier is emitted as advisory `additionalContext` — the documented
  // divergence asserted in install/modules/index.integration.test.ts.
  {
    path: ".codex/hooks/guardrails.cjs",
    format: "markered-text",
    module: "codex",
  },
  // Agent mirrors (.codex/agents/*.toml) and workflow skills (.agents/skills/bkit-*/) are
  // managed dynamically — the set follows the bkit-prefix prompt/workflow files at install.
];

// Cloud agent integration is opt-in — NOT in a default install, so a default install
// ships ZERO cloud footprint. The module is split by variant:
//
//   cloud=claude (tracker=github):
//   - cloud-bootstrap.sh    — Claude Code on the web SessionStart install hook
//                              (no-op unless CLAUDE_CODE_REMOTE=true).
//
//   cloud=opencode (tracker=github), cloud=cursor (tracker=linear): no files.
//
// The cloud workflow (bkit-cloud.yml) and the Cursor Background Agent files
// (.cursor/Dockerfile, .cursor/environment.json) ship as templates
// (`.bkit/templates.md`); the consumer copies and owns them.
//
// Uninstall removes ONLY the recorded variant's files.
export const CLOUD_MANIFEST_CLAUDE: ManifestEntry[] = [
  { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "cloud" },
];

export const CLOUD_MANIFEST_OPENCODE: ManifestEntry[] = [];

export const CLOUD_MANIFEST_CURSOR: ManifestEntry[] = [];

// Combined manifest used by MODULE_MANIFESTS.cloud (install dispatch + uninstall).
// Uninstall removes the union (zero-footprint): each variant's files are physically
// absent on an install of another variant, so removing absent files is a no-op.
const CLOUD_MANIFEST: ManifestEntry[] = [
  ...CLOUD_MANIFEST_CLAUDE,
  ...CLOUD_MANIFEST_OPENCODE,
  ...CLOUD_MANIFEST_CURSOR,
];

// --typescript: the owned slop-scan type-suppression plugin, the one file
// `slop-scan.config.json` references that bkit keeps current. The tool scripts and
// devDeps, slop-scan.config.json, .prettierignore, .lintstagedrc.json, the Vale config
// and the husky hooks ship as templates (`.bkit/templates.md`); the consumer copies
// and owns them.
const LINT_MANIFEST: ManifestEntry[] = [
  // Excluded from the core template walk so it ships only with --typescript.
  // Tier 1 (bkit-owned, force-overwritten). Mirrors .bkit/templates/.bkit/scripts/.
  // See CORE_TEMPLATE_PATH_EXCLUDE.
  {
    path: ".bkit/scripts/bkit-slop-type-suppression.mjs",
    format: "byte-equal-text",
    module: "lint",
  },
];

// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------

const MODULE_MANIFESTS: Record<ModuleName, ManifestEntry[]> = {
  core: CORE_MANIFEST,
  claude: CLAUDE_MANIFEST,
  cursor: CURSOR_MANIFEST,
  opencode: OPENCODE_MANIFEST,
  codex: CODEX_MANIFEST,
  lint: LINT_MANIFEST,
  cloud: CLOUD_MANIFEST,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return a flat array of all ManifestEntry records for the given module names.
 * When `modules` is empty, returns entries for all modules.
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
