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
   * Seed-or-print (Tier 3): bkit writes the file once when absent, then NEVER
   * overwrites it — the consumer owns it thereafter (install uses `writeTier3`).
   * Only meaningful for `byte-equal-text`; distinguishes these from canonical
   * (`writeTier1`) byte-equal files that bkit auto-overwrites. `bkit upgrade` must
   * refuse to overwrite a present seed-or-print file (surface a conflict instead),
   * mirroring install — otherwise it eats consumer-owned content (issue #129).
   */
  seedOrPrint?: boolean;
  /**
   * Optional: package.json keys managed by this module (scripts / devDependencies).
   * Used by bkit-package-json.ts to strip default-only managed keys.
   */
  packageJsonKeys?: {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  /**
   * `markered-text` only. Opt in to the no-marker migration policy in `writeTier2`:
   * when a consumer's file predates this entry's marker adoption (exists, no markers),
   * distinguish "ours, unmodified" (hash matches a prior canonical hash — replace
   * wholesale) from "the consumer's own file" (append the block, then print this
   * wiring-instructions string, with `{{PATH}}` substituted with the dest path)
   * instead of always appending blind. Undefined (default) — every other
   * markered-text file keeps the original append-blind behaviour.
   */
  noMarkerMigration?: string;
}

export type ModuleName =
  | "core"
  | "claude"
  | "cursor"
  | "opencode"
  | "ci"
  | "lint"
  | "git-hooks"
  | "renovate"
  | "dependabot"
  | "cloud";

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
 * - `renovate`   — `bkit install --dependency=renovate` (recommended).
 * - `dependabot` — `bkit install --dependency=dependabot` (alternative).
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
// Renovate runner — WHERE Renovate executes (#325)
// ---------------------------------------------------------------------------

/**
 * Where Renovate runs, chosen via
 * `bkit install --renovate=<name>`.
 * - `mend`       — Mend Community Cloud hosted GitHub App (default). No workflow
 *                  file; activated by installing the App (the Phase A/B flow).
 * - `self` — a bkit-managed `.github/workflows/renovate.yml` runs
 *                  `renovatebot/github-action` on `ubuntu-latest` (~16 GB), the
 *                  escape hatch for repos that OOM on Mend's 3 GB hosted microvm
 *                  (physical `kernel-out-of-memory`; #308, KN-41).
 *
 * Orthogonal to `depUpdater` (which is WHAT = renovate); this is WHERE. Recorded
 * in `package.json` `bkit.renovateRunner`. Like `cloudAgents`, file presence
 * (`.github/workflows/renovate.yml`) is the authoritative "self-hosted" signal;
 * the manifest field only distinguishes the deliberate mode on a re-install.
 */
export const RENOVATE_RUNNERS = ["mend", "self"] as const;
export type RenovateRunner = (typeof RENOVATE_RUNNERS)[number];

/** Default when consumer manifest has no `bkit.renovateRunner` field. */
export const DEFAULT_RENOVATE_RUNNER: RenovateRunner = "mend";

/** Narrow an unknown string to `RenovateRunner` or return `null` if invalid. */
export function parseRenovateRunner(value: unknown): RenovateRunner | null {
  return typeof value === "string" && (RENOVATE_RUNNERS as readonly string[]).includes(value)
    ? (value as RenovateRunner)
    : null;
}

// ---------------------------------------------------------------------------
// Runner labels — configurable `runs-on` for bkit-managed workflows (#362)
// ---------------------------------------------------------------------------

/**
 * Default GitHub Actions `runs-on` label for bkit-managed canonical workflows
 * (`renovate.yml`, `bkit-cloud.yml`). Substituted when `bkit.runners` is unset,
 * so existing consumers see zero behaviour change (#362).
 */
export const DEFAULT_RUNNER = "ubuntu-latest";

/**
 * Validate a single GitHub Actions `runs-on` label supplied via `bkit.runners.*`
 * config (#362). The label is arbitrary — a GitHub-hosted size (`ubuntu-latest`),
 * a GitHub larger runner, a Depot label (`depot-ubuntu-24.04-4`), or a self-hosted
 * alias. Accepts letters, digits, dot, dash, underscore (the charset GitHub allows
 * for a single label); rejects empty/whitespace strings, YAML-breaking characters,
 * and non-strings (arrays/objects) so the caller falls back to `DEFAULT_RUNNER`.
 * Only the single-label form is supported here, not a label matrix/array.
 */
export function parseRunnerLabel(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9._-]+$/.test(value) ? value : null;
}

// ---------------------------------------------------------------------------
// Cloud agents — post-CI auto-routing (#119 "Managed Cloud Agents")
// ---------------------------------------------------------------------------

/**
 * Cloud-agent automation chosen by the consumer (opt-in).
 * - `claude`  — `bkit install --auto=claude` installed `.github/workflows/bkit-cloud.yml`
 *               + `.claude/hooks/cloud-bootstrap.sh`. Requires `tracker=github`.
 * - `cursor`  — `bkit install --auto=cursor` installed `.cursor/Dockerfile`
 *               + `.cursor/environment.json`. Requires `tracker=linear`.
 * - `opencode` — `bkit install --auto=opencode` installed `.github/workflows/bkit-cloud.yml`
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
export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"] as const;
export type CloudAgents = (typeof CLOUD_MODES)[number];

/** Default when consumer manifest has no `bkit.cloudAgents` field (undecided). */
export const DEFAULT_CLOUD_AGENTS: CloudAgents = "none";

/** Narrow an unknown string to `CloudAgents` or return `null` if invalid.
 * Back-compat: legacy `"enabled"` value maps to `"claude"` (the only meaning it ever had).
 */
export function parseCloudAgents(value: unknown): CloudAgents | null {
  if (value === "enabled") return "claude"; // back-compat
  return typeof value === "string" && (CLOUD_MODES as readonly string[]).includes(value)
    ? (value as CloudAgents)
    : null;
}

// ---------------------------------------------------------------------------
// Per-module manifests
// ---------------------------------------------------------------------------

const CORE_MANIFEST: ManifestEntry[] = [
  { path: "AGENTS.md", format: "markered-text", module: "core" },
  // CLAUDE.md moved core → claude (#252) — see CLAUDE_MANIFEST. AGENTS.md (the
  // cross-host dispatch router) stays core; CLAUDE.md is a Claude-Code-only redirect.
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
  { path: ".bkit/jsonl.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
  { path: ".bkit/trackers.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/workflows.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/README.md", format: "byte-equal-text", module: "core" },
];

// GateGuard wiring instructions (#422): printed by writeTier2's noMarkerMigration
// policy when a consumer's gateguard file predates marker adoption AND its hash does
// not match a known bkit release — i.e. it is the consumer's own file, not bkit's.
// bkit appends the (pure, inert) advisory-engine block regardless; these instructions
// are the one thing bkit cannot do for the consumer — call the appended function from
// their existing driver. {{PATH}} is substituted with the destination path.
export const GATEGUARD_CJS_WIRING_INSTRUCTIONS = `[bkit] {{PATH}} exists with your own content and no bkit markers — the bkit-managed advisory block was appended at the end of the file (between \`// bkit:start\` and \`// bkit:end\`), but nothing calls into it yet.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open {{PATH}}. The appended block exports a pure function \`bkitGateguard(payload)\`
  that returns \`{ mode, context }\` or \`null\` — it never touches stdin or stdout.
  Wire it into your existing driver:
    1. Parse the PreToolUse payload your driver already reads from stdin.
    2. Call \`const result = bkitGateguard(payload);\`
    3. If \`result\`, emit ONE JSON document to stdout: \`{ hookEventName: "PreToolUse",
       permissionDecision: "deny", permissionDecisionReason: result.context }\` when
       \`result.mode === "deny"\`, otherwise \`{ hookEventName: "PreToolUse",
       additionalContext: result.context }\`.
  Claude Code discards the entire hook's output if two emitters both write to
  stdout, so make sure your driver still emits exactly once per invocation.
`;

export const GATEGUARD_JS_WIRING_INSTRUCTIONS = `[bkit] {{PATH}} exists with your own content and no bkit markers — the bkit-managed advisory block was appended at the end of the file (between \`// bkit:start\` and \`// bkit:end\`), but nothing calls into it yet.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open {{PATH}}. The appended block exports a pure function
  \`bkitGateguard(toolName, filePath, sessionId)\` that returns \`{ mode, context }\`
  or \`null\` — it never touches opencode's client, stderr, or the throw path. Wire
  it into your \`tool.execute.before\` hook:
    1. Extract the file path from the tool args (\`write\`/\`edit\`/\`patch\` use \`path\`).
    2. Call \`const result = bkitGateguard(tool, filePath, sessionID);\`
    3. If \`result\` and \`result.mode === "deny"\`, \`throw new Error(result.context)\`
       to block the call; otherwise surface \`result.context\` to the model (e.g. via
       \`process.stderr.write\`) without blocking.
`;

export const GUARDRAILS_WIRING_INSTRUCTIONS = `[bkit] {{PATH}} exists with your own content and no bkit markers — the bkit-managed guardrails block was appended at the end of the file (between \`// bkit:start\` and \`// bkit:end\`), but nothing calls into it yet.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open {{PATH}}. The appended block exports a pure function \`bkitGuardrails(payload)\`
  that returns \`{ permission, user_message, agent_message }\` or \`null\` — it never
  touches stdin or stdout. Wire it into your existing driver:
    1. Parse the hook payload your driver already reads from stdin.
    2. Call \`const decision = bkitGuardrails(payload);\`
    3. If \`decision\`, emit it to stdout as ONE JSON document; a \`null\` result means
       bkit has no opinion — fall through to your own decision, defaulting to
       \`{ permission: "allow" }\`.
  Cursor discards the entire hook's output if two emitters both write to stdout,
  so make sure your driver still emits exactly once per invocation.
`;

const CLAUDE_MANIFEST: ManifestEntry[] = [
  // Root CLAUDE.md — Claude-Code redirect to .agents/rules.md (#252: moved core → claude,
  // so `uninstall --claude` removes it and a non-claude install/uninstall leaves it).
  // Emitted by runClaudeModule (a root file, outside the .claude/ dir walk).
  { path: "CLAUDE.md", format: "markered-text", module: "claude" },
  { path: ".claude/settings.json", format: "json", module: "claude" },
  { path: ".claude/hooks/preflight.sh", format: "markered-text", module: "claude" },
  // GateGuard advisory PreToolUse hook — markered-text (slash-comment): bkit owns
  // only the advisory engine between `// bkit:start` / `// bkit:end`; the stdin/
  // stdout driver outside the block is consumer-owned from first install onward, so
  // a consumer can add their own advisories without losing them on upgrade. Wired
  // in .claude/settings.json. noMarkerMigration covers every pre-markers consumer
  // install (hash matches a prior canonical hash → replace wholesale).
  {
    path: ".claude/hooks/gateguard.cjs",
    format: "markered-text",
    module: "claude",
    noMarkerMigration: GATEGUARD_CJS_WIRING_INSTRUCTIONS,
  },
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

// ---------------------------------------------------------------------------
// lint:prose — the managed prose-gate script (single source of truth)
//
// Declared here (pure data, no cycle) because THREE surfaces must carry the
// identical string or the gate silently degrades:
//   - this manifest's packageJsonKeys default (what install seeds, what the
//     uninstall stripper byte-compares to decide "still ours?")
//   - runLintModule's ensurePackageJsonScripts call (bkit-modules.ts)
//   - the F9 advisory remedy text (bkit-preflight.ts)
//
// F9 (BAR-138) contract, preserved: symmetric soft-skip — never hard-fail a
// consumer's commit because the vale binary is absent. What CHANGED: a missing
// `.vale/styles/write-good` is no longer treated the same as a missing binary.
// The styles dir is gitignored, so it is absent in every fresh checkout AND in
// every `git worktree add` — which meant the pre-commit prose gate silently
// self-disabled in worktrees while still reporting success. Now that case
// self-heals (copy from the main worktree via --git-common-dir, zero network;
// `vale sync` as fallback) and, if self-heal fails with vale present, says so
// LOUDLY on stderr instead of emitting one quiet line nobody reads.
//
// Shell constraints: no single quotes anywhere in the body (it is wrapped in
// `bash -c '...'`), and no backticks (a backtick inside the double-quoted echo
// would command-substitute).
export const LINT_PROSE_SCRIPT =
  'bash -c \'if command -v vale >/dev/null 2>&1; then if [ ! -d .vale/styles/write-good ]; then echo "[bkit] .vale/styles/write-good absent (fresh checkout or worktree) - restoring" >&2; G=$(git rev-parse --git-common-dir 2>/dev/null) && M=$(dirname "$(cd "$G" && pwd)") && [ -d "$M/.vale/styles/write-good" ] && mkdir -p .vale/styles && cp -R "$M/.vale/styles/write-good" .vale/styles/ || vale sync || true; fi; if [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] WARNING - PROSE LINT SKIPPED: vale is installed but .vale/styles/write-good could not be restored (main-worktree copy and vale sync both failed). The prose gate is NOT enforcing here - run: vale sync" >&2; fi; else echo "[bkit] vale not installed - skipping prose lint (install vale, then run vale sync, to enable)"; fi\'';

// Prior bkit-shipped lint:prose defaults, newest first.
//
// Why this list exists: `ensurePackageJsonScripts` is add-if-missing — it NEVER
// overwrites an existing script — so changing LINT_PROSE_SCRIPT above reaches
// new consumers only. An existing consumer would keep the silently-self-disabling
// version forever. Any value byte-matching an entry here is provably bkit's own
// (never consumer-authored), so install/upgrade may safely replace it, and the
// uninstall stripper may safely reclaim it. A value matching NEITHER the current
// default NOR a legacy entry is consumer-customised and is left strictly alone.
//
// Append the outgoing string here whenever LINT_PROSE_SCRIPT changes.
export const LEGACY_LINT_PROSE_SCRIPTS: readonly string[] = [
  'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
];

const CURSOR_MANIFEST: ManifestEntry[] = [
  { path: ".cursor/hooks.json", format: "json", module: "cursor" },
  { path: ".cursor/hooks/preflight.sh", format: "markered-text", module: "cursor" },
  // Destructive-op + secret-exposure gates (parity with Claude permissions / OpenCode
  // permission map) — markered-text (slash-comment), same ownership split as the two
  // GateGuard hooks: bkit owns only the decision engine between the markers, the
  // stdin/stdout driver outside them is consumer-owned from first install onward, so a
  // consumer can add their own gates without losing them on upgrade. noMarkerMigration
  // covers every pre-markers consumer install (hash matches a prior canonical hash →
  // replace wholesale).
  {
    path: ".cursor/hooks/guardrails.cjs",
    format: "markered-text",
    module: "cursor",
    noMarkerMigration: GUARDRAILS_WIRING_INSTRUCTIONS,
  },
  // GateGuard advisory PreToolUse hook for Cursor — same ownership split and the
  // same managed block as the Claude twin (byte-identical between the markers,
  // asserted by a parity test). Wired in .cursor/hooks.json → preToolUse
  // (matcher "Write"), deliberately without failClosed: an advisory hook that
  // fails closed would block the edit it only meant to comment on.
  {
    path: ".cursor/hooks/gateguard.cjs",
    format: "markered-text",
    module: "cursor",
    noMarkerMigration: GATEGUARD_CJS_WIRING_INSTRUCTIONS,
  },
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
    noMarkerMigration: GATEGUARD_JS_WIRING_INSTRUCTIONS,
  },
  // Agent and command mirrors are managed dynamically (not listed individually here —
  // the exact set depends on the bkit-prefix prompt/workflow files at install time).
  // Uninstall uses the BKIT_PREFIX filter for .opencode/agents/ and .opencode/commands/.
];

// --ci (#265): the stack-agnostic CI/quality foundation. NO package.json footprint —
// a non-Node consumer can install this and stay green. ci.yml is seeded as the SKELETON
// (Node/TS step bodies commented) when --typescript is absent, or WIRED when present
// (see runCiModule + deriveCiSkeleton). Vale is stack-agnostic (external binary, lints
// .md) so its config ships here; the `lint:prose` npm wrapper stays under --typescript.
const CI_MANIFEST: ManifestEntry[] = [
  // ci.yml is seed-or-print — appending bkit content to existing CI YAML produces
  // duplicate top-level keys, so consumers own it after the initial seed.
  { path: ".github/workflows/ci.yml", format: "byte-equal-text", module: "ci", seedOrPrint: true },
  // .vale.ini — Tier 3 (seed-or-print). Vale config (stack-agnostic prose lint).
  { path: ".vale.ini", format: "byte-equal-text", module: "ci", seedOrPrint: true },
  // .vale/styles/House/*.yml — Tier 1 (fully managed, bkit-owned, force-overwritten).
  // Keep in sync with .bkit/templates/.vale/styles/House/ (a parity test guards drift).
  { path: ".vale/styles/House/Filler.yml", format: "byte-equal-text", module: "ci" },
  { path: ".vale/styles/House/Hedging.yml", format: "byte-equal-text", module: "ci" },
  { path: ".vale/styles/House/LLMSlop.yml", format: "byte-equal-text", module: "ci" },
  { path: ".vale/styles/House/Verbose.yml", format: "byte-equal-text", module: "ci" },
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
export const CLOUD_MANIFEST_CLAUDE: ManifestEntry[] = [
  { path: ".github/workflows/bkit-cloud.yml", format: "byte-equal-text", module: "cloud" },
  { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "cloud" },
];

// opencode cloud variant ships the same bkit-cloud.yml (both jobs coexist, runtime-gated).
export const CLOUD_MANIFEST_OPENCODE: ManifestEntry[] = [
  { path: ".github/workflows/bkit-cloud.yml", format: "byte-equal-text", module: "cloud" },
];

export const CLOUD_MANIFEST_CURSOR: ManifestEntry[] = [
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
const CLOUD_MANIFEST: ManifestEntry[] = [
  ...CLOUD_MANIFEST_CLAUDE,
  // CLOUD_MANIFEST_OPENCODE shares bkit-cloud.yml with claude; skip duplicate workflow entry.
  ...CLOUD_MANIFEST_CURSOR,
];

// Renovate is opt-in via `bkit install --dependency=renovate` — phase-gated against the
// default branch. NOT included in --full. See issue #123 follow-up.
const RENOVATE_MANIFEST: ManifestEntry[] = [
  { path: ".github/renovate.json5", format: "byte-equal-text", module: "renovate" },
  // .github/renovate-local.json5 — consumer-owned overrides, seeded once (create-if-absent)
  // and deliberately unmanaged: it has NO template file, so the template-walking check/upgrade
  // collector never sees it (its whole purpose is to diverge from the seed). Listed here ONLY
  // so uninstall reclaims it — hash-guarded (removed while still byte-equal to the seed,
  // preserved once customised), unconditional on --nuke (#255 P1-7).
  {
    path: ".github/renovate-local.json5",
    format: "byte-equal-text",
    module: "renovate",
    seedOrPrint: true,
  },
  // .github/workflows/renovate.yml — self-hosted GitHub Actions runner (#325).
  // Written by runRenovateModule ONLY when renovateRunner === "self"; on a
  // "mend" install it is hash-guarded-reclaimed (deleted while byte-equal to the
  // canonical template, preserved once the consumer edits it) so migrating back to
  // Mend never leaves a second, double-running Renovate. Kept in this SINGLE union
  // manifest (no mend/self split, unlike CLOUD_MANIFEST): a mend consumer
  // simply never has the file on disk, so union-removal of an absent file on
  // uninstall is a no-op — the DECISION-D rationale documented above. Canonical
  // Tier-1 byte-equal (force-overwritten every install), exactly like bkit-cloud.yml.
  { path: ".github/workflows/renovate.yml", format: "byte-equal-text", module: "renovate" },
];

// Dependabot is opt-in via `bkit install --dependency=dependabot` — first-party GitHub
// feature, no App install required. Mutually exclusive with --renovate. NOT
// included in --full. See issue #109 (origin) + #123 follow-up. dependabot.yml
// is Tier 3 (seed-or-print) because consumers commonly tune the npm section
// per their monorepo shape; the helper script is Tier 1 (canonical).
const DEPENDABOT_MANIFEST: ManifestEntry[] = [
  { path: ".github/dependabot.yml", format: "byte-equal-text", module: "dependabot" },
  { path: ".bkit/scripts/bkit-set-dependabot.sh", format: "byte-equal-text", module: "dependabot" },
];

// --typescript (#265): the Node/TS toolchain (most of it is plain Node — prettier/husky/
// slop work on .js; only tsc + the cast/@ts-* rule are TS-exclusive). Always installed
// alongside `ci` (--typescript implies --ci). Vale CONFIG lives under `ci` (agnostic); the
// `lint:prose` npm wrapper stays here because it is a package.json/Node convenience.
const LINT_MANIFEST: ManifestEntry[] = [
  { path: "slop-scan.config.json", format: "byte-equal-text", module: "lint", seedOrPrint: true },
  { path: ".prettierignore", format: "markered-text", module: "lint" },
  // .lintstagedrc.json — Tier 3 seed-or-print (consumer may customise; pairs with the
  // lint-staged call in the pre-commit hook). Hash-guarded delete on uninstall: removed
  // when still byte-equal to the seed, preserved once the consumer edits it (#255 P1-7).
  { path: ".lintstagedrc.json", format: "byte-equal-text", module: "lint", seedOrPrint: true },
  // slop-scan helper scripts — moved OUT of the core template walk (#265) so they ship
  // ONLY with the TS toolchain, never to a non-Node --ci consumer. Tier 1 (bkit-owned,
  // force-overwritten). Mirrors .bkit/templates/.bkit/scripts/. See CORE_TEMPLATE_PATH_EXCLUDE.
  {
    path: ".bkit/scripts/bkit-slop-type-suppression.mjs",
    format: "byte-equal-text",
    module: "lint",
  },
  { path: ".bkit/scripts/bkit-slop-delta.sh", format: "byte-equal-text", module: "lint" },
  {
    path: "package.json",
    format: "markered-text",
    module: "lint",
    packageJsonKeys: {
      scripts: {
        // typecheck moved here from the (now agnostic) ci module — it is TS-exclusive (#265).
        typecheck: "tsc --noEmit",
        "format:check": "prettier --check .",
        "lint:prose": LINT_PROSE_SCRIPT,
        "lint:slop": "slop-scan scan .",
        "slop:delta": "bash .bkit/scripts/bkit-slop-delta.sh",
      },
      devDependencies: {
        prettier: "^3.5.3",
        "slop-scan": "^0.3.0",
        // lint-staged is injected by runLintModule (pairs with .lintstagedrc.json +
        // the pre-commit hook's `pnpm lint-staged` call). It MUST be declared here so
        // getManagedPackageJsonKeys surfaces it to the uninstall stripper — otherwise
        // a default-only lint-staged devDep is orphaned on uninstall.
        "lint-staged": "^15.2.10",
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

const MODULE_MANIFESTS: Record<ModuleName, ManifestEntry[]> = {
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
