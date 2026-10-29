// install/manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by commands/install/uninstall.ts
// and the upgrade walk.
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and upgrade.

import type { ModuleFlag } from "../cli.js";

/**
 * Opt-in modules: never installed implicitly; each requires an explicit flag
 * (`--auto=`, `--opencode=`). A bare/full `uninstall` DOES remove them (zero footprint).
 * Dependency-updater files are not modules — bkit never writes or removes them.
 */
export const OPTIN_MODULES = new Set<ModuleFlag>(["cloud", "opencode", "codex", "antigravity"]);

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

export type ModuleName =
  "core" | "claude" | "cursor" | "opencode" | "codex" | "antigravity" | "cloud";

// ---------------------------------------------------------------------------
// Issue tracker
// ---------------------------------------------------------------------------

/**
 * Issue-tracker providers supported by `bkit install --tracker=<name>`.
 * - `github` — GitHub Issues + Projects v2.
 * - `linear` — Linear.
 * - `jira` — Jira Cloud through the Atlassian Rovo MCP server.
 * - `none` — no tracker wired; workflows skip tracker calls with one-line log (default).
 *
 * A new value needs its block in every tracker group of the workflow and prompt
 * sources (`.bkit/trackers.md` § Marker contract) and a branch in
 * `render/trackers.ts`.
 */
export const ISSUE_TRACKERS = ["github", "linear", "jira", "none"] as const;
export type IssueTracker = (typeof ISSUE_TRACKERS)[number];

/** Default tracker when consumer manifest has no `bkit.tracker.default` field. */
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
 * - `claude`  — `bkit install --auto=claude` writes no file; the consumer copies the
 *               `.github/workflows/bkit-cloud.yml` and `.claude/hooks/bkit-cloud-bootstrap.sh`
 *               templates. Requires `tracker=github`.
 * - `cursor`  — `bkit install --auto=cursor` writes no file; the consumer copies the
 *               `.cursor/Dockerfile` + `.cursor/environment.json` templates. Requires `tracker=linear`.
 * - `opencode` — `bkit install --auto=opencode` writes no file; the consumer copies the same
 *               `bkit-cloud.yml` template as claude (both jobs coexist, runtime-gated by secret
 *               presence). Requires `tracker=github` + local opencode host (`bkit install --opencode=<provider>`).
 * - `none`    — explicit opt-out; silences the post-install nudge advisory.
 *
 * Recorded in `package.json` `bkit.cloud.agent`. Presence of the adopted copy
 * (`bkit-cloud.yml` for github-host variants; `.cursor/Dockerfile` for cursor) is the authoritative
 * "active" signal; the package.json field only distinguishes an opt-out from
 * an undecided install.
 *
 * Single self-describing field (mirrors `bkit.tracker.default`).
 */
export const CLOUD_MODES = ["claude", "cursor", "opencode", "none"] as const;
export type CloudAgents = (typeof CLOUD_MODES)[number];

/** Default when consumer manifest has no `bkit.cloud.agent` field (undecided). */
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
  // Curl/wget host allowlist read at runtime by every host's bkit-guardrails.cjs (Claude,
  // Cursor, Codex, Antigravity). No template backs it — `writeNetworkAllowlist`
  // (install/network-allowlist.ts) computes the domain set from the consumer's own config,
  // so it is `generated` and its hash is in `canonicalHashes`. Core-owned: it stays until
  // the last host goes (full/core uninstall).
  { path: ".bkit/allowlist.json", format: "byte-equal-text", module: "core", generated: true },
  // Canonical bkit-authored reference docs. They live package-side under
  // `.bkit/core/.bkit/` and are read from there at runtime (getBkitDocsRoot); these
  // consumer copies are force-overwritten mirrors (writeTier1) so a consumer can read
  // them in-repo. Whole file is bkit-owned → byte-equal-text (refreshed every install);
  // prompts.md and lite.md are markered-text, keeping the consumer section below `bkit:end`.
  { path: ".bkit/authoring.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/cloud.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/cli.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/comparison.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/install.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/jsonl.md", format: "byte-equal-text", module: "core" },
  // The MIT notice that travels with the files bkit writes: the full text and copyright
  // notice. Sourced from `.bkit/core/.bkit/LICENSE.md`.
  { path: ".bkit/LICENSE.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/lite.md", format: "markered-text", module: "core" },
  { path: ".bkit/pipeline.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/providers.md", format: "byte-equal-text", module: "core" },
  { path: ".bkit/prompts.md", format: "markered-text", module: "core" },
  { path: ".bkit/router.md", format: "byte-equal-text", module: "core" },
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
  { path: ".claude/hooks/bkit-preflight.sh", format: "markered-text", module: "claude" },
  // GateGuard advisory PreToolUse hook — markered-text (slash-comment): bkit owns
  // only the advisory engine between `// bkit:start` / `// bkit:end`; the stdin/
  // stdout driver outside the block is consumer-owned from first install onward, so
  // a consumer can add their own advisories without losing them on upgrade. Wired
  // in .claude/settings.json.
  {
    path: ".claude/hooks/bkit-gateguard.cjs",
    format: "markered-text",
    module: "claude",
  },
  // ReadGuard advisory repeat-read hook — same ownership split as GateGuard. Wired in
  // .claude/settings.json → PreToolUse (matcher `Read|Bash`) and PreCompact.
  {
    path: ".claude/hooks/bkit-readguard.cjs",
    format: "markered-text",
    module: "claude",
  },
  // bkit-guardrails.cjs — Tier-2 markered-text, twin of the Cursor/Codex hooks.
  // PreToolUse matcher `Bash`. ADVISORY ONLY: covers URL hosts and shell-as-edit-channel;
  // never denies or asks.
  {
    path: ".claude/hooks/bkit-guardrails.cjs",
    format: "markered-text",
    module: "claude",
  },
  // .claude/hooks/bkit-cloud-bootstrap.sh ships as a copy-and-own template.
  // The SessionStart hook entry in .claude/settings.json is guarded (`test -f … || true`),
  // so a consumer who has not adopted the script no-ops.
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
// VALUE describe the same sequence. Tier vocabulary is the `bkit-ci.yml` job ids
// (bkit-tests-static / -unit / -integration / -e2e / -live). Where a step is not a
// tier (`format`, the ship gate) the name spells out the actual steps. One exception:
// `min` sits off the chain: the least a push runs, on a push that changes no code
// (`bkit.testing.minPushPaths`); its steps are whatever that push can still break.
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
// `.husky/pre-push`). `bkit-ci.yml` does NOT call the gates; it calls the same scripts
// directly, one step each.
//
// `lint:slop` is in no gate: `slop-scan scan` is report-only and never fails. The gate
// that fails on new findings is `slop:delta`.
//
// NOT SEEDED: the three deeper gates (…-integration, …-integration-e2e,
// …-integration-e2e-live) are absent unless the consumer writes them. Each is one line
// chaining its parent, e.g.
//   "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration"
// `/bkit-build` and `/bkit-debug` run the DEEPEST gate that exists and record its name;
// `.husky/pre-push` runs `…-integration` when it exists (BKIT_PUSH_GATES).
export const BKIT_GATE_SCRIPTS: Readonly<Record<string, string>> = {
  // `.husky/pre-commit`: prettier --write over staged files, and nothing else —
  // seconds, not minutes. Prose is a whole-repo scan, so it gates at pre-push.
  "bkit:gate:format": "pnpm lint-staged",
  // `.husky/pre-push` on a min push (every file matches `bkit.testing.minPushPaths`): no code, so
  // no typecheck, lint or tests. Off the chain. Add any test that reads a min-push file.
  "bkit:gate:min": "pnpm format:check && pnpm lint:prose && pnpm slop:delta",
  // Everything that needs no test runner. Every part has a matching step in the
  // bkit-tests-static CI job; audits/templates/template-ci-yml.test.ts fails when one is missing.
  // Callers: build's plan-execute loop between tasks, and the `.husky/pre-push` revert
  // path.
  "bkit:gate:static":
    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta",
  // The default local gate: `.husky/pre-push` (when no `…-integration` gate is declared),
  // build Step 11, the remediates. `pnpm test` is the unit tier only: a test file the
  // integration gate also runs must not match it.
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
  "bkit:gate:static-unit-integration",
  "bkit:gate:static-unit",
];

/**
 * What `/bkit-build` Step 12 will run, in DESCENDING order — first one declared wins.
 * The Step 8 group gate runs `BKIT_GROUP_GATES` instead.
 *
 * Build stops at integration; E2E and live are not in this list.
 *
 * Declaring `bkit:gate:static-unit-integration` (never seeded) opts Step 12 and the
 * pre-push hook into the integration tier.
 */
export const BKIT_BUILD_GATES: readonly string[] = [
  "bkit:gate:static-unit-integration",
  "bkit:gate:static-unit",
];

/**
 * What `/bkit-build` Step 8 runs after every group but the last, and hands the Step 9 fix
 * round: static checks and the unit tier. Integration runs once, at Step 12.
 */
export const BKIT_GROUP_GATES: readonly string[] = ["bkit:gate:static-unit"];

/**
 * What `.husky/pre-push` runs on a full push, in DESCENDING order — first one declared wins.
 *
 * Integration runs on push, never on commit; E2E and live stay in CI. The template hook
 * reads package.json for the first entry itself (it cannot import this list).
 */
export const BKIT_PUSH_GATES: readonly string[] = [
  "bkit:gate:static-unit-integration",
  "bkit:gate:static-unit",
];

/**
 * Runs ONE test file — `pnpm bkit:test:file <repo-relative path>` — and writes a JUnit
 * report to `$BKIT_TEST_REPORT`. `/bkit-build` records each task's red and audits its
 * green through it. Never seeded: no default works on every stack; install, check and
 * upgrade advise when it is missing (detectGateAdvisories).
 */
export const BKIT_TEST_FILE_SCRIPT = "bkit:test:file";

/**
 * Lints ONE test file — `pnpm bkit:lint:file <repo-relative path>`, exit 0 when clean.
 * `bkit tests red` runs it before recording a red, so a lint rewrite never lands after
 * the red. Never seeded: install, check and upgrade advise when `bkit:test:file` is
 * declared and this is not (detectGateAdvisories).
 */
export const BKIT_LINT_FILE_SCRIPT = "bkit:lint:file";

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
  { path: ".cursor/hooks/bkit-preflight.sh", format: "markered-text", module: "cursor" },
  // Destructive-op + secret-exposure gates (parity with Claude permissions / OpenCode
  // permission map) — markered-text (slash-comment), same ownership split as the two
  // GateGuard hooks: bkit owns only the decision engine between the markers, the
  // stdin/stdout driver outside them is consumer-owned from first install onward, so a
  // consumer can add their own gates without losing them on upgrade.
  {
    path: ".cursor/hooks/bkit-guardrails.cjs",
    format: "markered-text",
    module: "cursor",
  },
  // GateGuard advisory PreToolUse hook for Cursor — same ownership split and the
  // same managed block as the Claude twin (byte-identical between the markers,
  // asserted by a parity test). Wired in .cursor/hooks.json → preToolUse
  // (matcher "Write"), without failClosed.
  {
    path: ".cursor/hooks/bkit-gateguard.cjs",
    format: "markered-text",
    module: "cursor",
  },
  // ReadGuard for Cursor — same managed block as the Claude twin. Wired in
  // .cursor/hooks.json → preToolUse (matcher "Read|Shell") and preCompact, without
  // failClosed.
  {
    path: ".cursor/hooks/bkit-readguard.cjs",
    format: "markered-text",
    module: "cursor",
  },
  // Cursor CLI / cloud-agent MCP allows — `writeCursorCliPermissionsArtifact`
  // (install/cloud-env.ts) renders it from the consumer's `mcp-servers` block; same contract.
  { path: ".cursor/cli.json", format: "byte-equal-text", module: "cursor", generated: true },
  { path: ".cursor/rules/bkit-rules.mdc", format: "markered-text", module: "cursor" },
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
// bkit-gateguard.js is markered-text (slash-comment) — bkit owns only the advisory engine
// between the markers; the exported plugin driver outside the block is consumer-owned
// from first install onward, same split as .claude/hooks/bkit-gateguard.cjs.
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
export const OPENCODE_MANIFEST: ManifestEntry[] = [
  // opencode.json — Tier-2 json (deep-contained, ownership-mixed, reconverged on upgrade).
  // writeTier2JsonContained throws on malformed destination (KN-19 guard).
  { path: ".opencode/opencode.json", format: "json", module: "opencode" },
  // bkit-gateguard.js — Tier-2 markered-text (slash-comment); see comment above.
  {
    path: ".opencode/plugin/bkit-gateguard.js",
    format: "markered-text",
    module: "opencode",
  },
  // bkit-readguard.js — same split as bkit-gateguard.js.
  {
    path: ".opencode/plugin/bkit-readguard.js",
    format: "markered-text",
    module: "opencode",
  },
  // bkit-rules.js — same split as bkit-gateguard.js. Delivers the rules-read advisory
  // on the session's first tool call (opencode has no session-start event).
  {
    path: ".opencode/plugin/bkit-rules.js",
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
  // bkit-gateguard.cjs — Tier-2 markered-text, twin of the Claude hook (same stdin/stdout
  // contract); differs only in tool name (apply_patch) and V4A patch-envelope parsing.
  {
    path: ".codex/hooks/bkit-gateguard.cjs",
    format: "markered-text",
    module: "codex",
  },
  // bkit-readguard.cjs — Tier-2 markered-text, twin of the Claude hook. Registered on
  // PreToolUse matcher `Bash` (Codex has no read tool) and PreCompact.
  {
    path: ".codex/hooks/bkit-readguard.cjs",
    format: "markered-text",
    module: "codex",
  },
  // bkit-guardrails.cjs — Tier-2 markered-text, twin of the Cursor hook (same decision
  // engine). Registered on matcher `Bash`, Codex's shell tool name. Codex parses but
  // does not implement `permissionDecision: "ask"`, so the deny tier blocks for real
  // and the ask tier is emitted as advisory `additionalContext` — the documented
  // divergence asserted in install/modules/index.integration.test.ts.
  {
    path: ".codex/hooks/bkit-guardrails.cjs",
    format: "markered-text",
    module: "codex",
  },
  // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
  // session as `additionalContext` on the first tool call (Codex has no session-start
  // event). Registered on two single-value matchers, `apply_patch` and `Bash`.
  {
    path: ".codex/hooks/bkit-rules.cjs",
    format: "markered-text",
    module: "codex",
  },
  // Agent mirrors (.codex/agents/*.toml) and workflow skills (.agents/skills/bkit-*/) are
  // managed dynamically — the set follows the bkit-prefix prompt/workflow files at install.
];

// --antigravity: Google Antigravity IDE host. Installs as a workspace PLUGIN at
// `.agents/plugins/bkit/` (Antigravity's own packaging surface), so `.agents/` root stays
// the dedicated Codex install. Root `GEMINI.md` is the redirect mirror of `CLAUDE.md`
// (Antigravity loads `GEMINI.md` as a workspace rule file).
export const ANTIGRAVITY_MANIFEST: ManifestEntry[] = [
  // plugin.json — the required plugin manifest. Tier-2 json (deep-contained): bkit owns
  // the schema/name/description keys (the schema is `additionalProperties: false`).
  { path: ".agents/plugins/bkit/plugin.json", format: "json", module: "antigravity" },
  // hooks.json — Tier-2 json (deep-contained): bkit owns the PreToolUse GateGuard and
  // guardrails entries, consumers may add their own event groups alongside them.
  { path: ".agents/plugins/bkit/hooks.json", format: "json", module: "antigravity" },
  // bkit-gateguard.cjs — Tier-2 markered-text, twin of the Claude/Codex hook (same
  // stdin/stdout contract); differs in the tool names (`write_to_file` /
  // `replace_file_content`) and the payload path field.
  {
    path: ".agents/plugins/bkit/hooks/bkit-gateguard.cjs",
    format: "markered-text",
    module: "antigravity",
  },
  // bkit-readguard.cjs — Tier-2 markered-text, twin of the Claude hook. Registered on
  // matcher `view_file|run_command`.
  {
    path: ".agents/plugins/bkit/hooks/bkit-readguard.cjs",
    format: "markered-text",
    module: "antigravity",
  },
  // bkit-guardrails.cjs — Tier-2 markered-text, twin of the Cursor/Codex hook. Registered
  // on matcher `view_file|run_command`, Antigravity's file-read and shell tool names.
  {
    path: ".agents/plugins/bkit/hooks/bkit-guardrails.cjs",
    format: "markered-text",
    module: "antigravity",
  },
  // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
  // session by denying the first tool call with the advisory as the reason (Antigravity's
  // only channel to the model); the identical retry is allowed.
  {
    path: ".agents/plugins/bkit/hooks/bkit-rules.cjs",
    format: "markered-text",
    module: "antigravity",
  },
  // Root GEMINI.md — Antigravity workspace-rule redirect to .agents/rules.md, owned by the
  // antigravity module: `uninstall --antigravity` removes it; other installs leave it.
  { path: "GEMINI.md", format: "markered-text", module: "antigravity" },
  // Subagent prompts (.agents/plugins/bkit/agents/bkit-*.md) and workflow skills
  // (.agents/plugins/bkit/skills/bkit-*/) are managed dynamically — the set follows the
  // bkit-prefix prompt/workflow files at install.
];

// Cloud agent integration is opt-in — NOT in a default install, so a default install
// ships ZERO cloud footprint. Every variant writes no files: the cloud workflow
// (bkit-cloud.yml), bkit-cloud-bootstrap.sh and the Cursor Background Agent files
// (.cursor/Dockerfile, .cursor/environment.json) ship as templates
// (`.bkit/templates.md`); the consumer copies and owns them. Each variant only
// records `bkit.cloud.agent` and prints its setup advisories.
export const CLOUD_MANIFEST_CLAUDE: ManifestEntry[] = [];

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

// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------

const MODULE_MANIFESTS: Record<ModuleName, ManifestEntry[]> = {
  core: CORE_MANIFEST,
  claude: CLAUDE_MANIFEST,
  cursor: CURSOR_MANIFEST,
  opencode: OPENCODE_MANIFEST,
  codex: CODEX_MANIFEST,
  antigravity: ANTIGRAVITY_MANIFEST,
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
