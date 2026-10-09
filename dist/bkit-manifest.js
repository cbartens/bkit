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
// Runner labels — configurable `runs-on` for bkit-managed workflows (#362)
// ---------------------------------------------------------------------------
/**
 * Default GitHub Actions `runs-on` label for bkit-managed canonical workflows
 * (`bkit-cloud.yml`). Substituted when `bkit.runners` is unset.
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
export function parseRunnerLabel(value) {
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
 * Recorded in `package.json` `bkit.cloudAgents`. File presence
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
/**
 * Codex twin of {@link GUARDRAILS_WIRING_INSTRUCTIONS}. Separate text, not a reuse:
 * the Codex engine returns `{ verdict, reason }` and emits the Claude-family
 * `hookSpecificOutput` envelope, so the Cursor wording would name the wrong function
 * result and the wrong stdout shape — and a consumer following it would wire a hook
 * that parses as nothing and silently never gates.
 */
export const CODEX_GUARDRAILS_WIRING_INSTRUCTIONS = `[bkit] {{PATH}} exists with your own content and no bkit markers — the bkit-managed guardrails block was appended at the end of the file (between \`// bkit:start\` and \`// bkit:end\`), but nothing calls into it yet.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open {{PATH}}. The appended block exports a pure function \`bkitGuardrails(payload)\`
  that returns \`{ verdict, reason }\` or \`null\` — it never touches stdin or stdout.
  \`verdict\` is "deny" or "ask". Wire it into your existing driver:
    1. Parse the PreToolUse payload your driver already reads from stdin.
    2. Call \`const decision = bkitGuardrails(payload);\`
    3. If \`decision\`, emit ONE JSON document to stdout:
       \`{ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny",
       permissionDecisionReason: decision.reason } }\` when \`verdict === "deny"\`,
       otherwise \`{ hookSpecificOutput: { hookEventName: "PreToolUse",
       additionalContext: decision.reason } }\`.
    4. A \`null\` result means bkit has no opinion — fall through to your own decision.
  Do NOT map an "ask" verdict to \`permissionDecision: "ask"\`. Codex parses that value
  but does not implement it: it records an error and runs the command anyway. Advisory
  context is the strongest thing that actually reaches the model on this host.
  Codex discards the entire hook's output if two emitters both write to stdout, so make
  sure your driver still emits exactly once per invocation.
`;
/**
 * Claude twin of {@link GUARDRAILS_WIRING_INSTRUCTIONS}. Separate text: the Claude
 * engine returns `{ context }` and emits `hookSpecificOutput.additionalContext`, and
 * it must NEVER be wired to a `permissionDecision` — that would turn an advisory into
 * the blanket prompt this host deliberately removed.
 */
export const CLAUDE_GUARDRAILS_WIRING_INSTRUCTIONS = `[bkit] {{PATH}} exists with your own content and no bkit markers — the bkit-managed guardrails block was appended at the end of the file (between \`// bkit:start\` and \`// bkit:end\`), but nothing calls into it yet.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open {{PATH}}. The appended block exports a pure function \`bkitGuardrails(payload)\`
  that returns \`{ context }\` or \`null\` — it never touches stdin or stdout.
  Wire it into your existing driver:
    1. Parse the PreToolUse payload your driver already reads from stdin.
    2. Call \`const result = bkitGuardrails(payload);\`
    3. If \`result\`, emit ONE JSON document to stdout:
       \`{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: result.context } }\`
    4. A \`null\` result means bkit has nothing to say — emit nothing.
  Do NOT map the result to \`permissionDecision\`. This hook is advisory by design:
  \`deny\` already lives in .claude/settings.json and is evaluated before any hook, and
  an \`ask\` here would force a permission prompt on every matching shell command — the
  exact stall this host is configured to avoid.
  Claude Code discards the entire hook's output if two emitters both write to stdout, so
  make sure your driver still emits exactly once per invocation.
`;
const CLAUDE_MANIFEST = [
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
    // guardrails.cjs — Tier-2 markered-text, third twin of the Cursor/Codex hooks.
    // PreToolUse matcher `Bash`. ADVISORY ONLY: it covers the two things a permission
    // table cannot express (URL hosts, shell-as-edit-channel) and never denies or asks,
    // because `deny` already runs before any hook and `ask` is the prompt this host is
    // configured to avoid.
    {
        path: ".claude/hooks/guardrails.cjs",
        format: "markered-text",
        module: "claude",
        noMarkerMigration: CLAUDE_GUARDRAILS_WIRING_INSTRUCTIONS,
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
export const LINT_PROSE_SCRIPT = 'bash -c \'if command -v vale >/dev/null 2>&1; then if [ ! -d .vale/styles/write-good ]; then echo "[bkit] .vale/styles/write-good absent (fresh checkout or worktree) - restoring" >&2; G=$(git rev-parse --git-common-dir 2>/dev/null) && M=$(dirname "$(cd "$G" && pwd)") && [ -d "$M/.vale/styles/write-good" ] && mkdir -p .vale/styles && cp -R "$M/.vale/styles/write-good" .vale/styles/ || vale sync || true; fi; if [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] WARNING - PROSE LINT SKIPPED: vale is installed but .vale/styles/write-good could not be restored (main-worktree copy and vale sync both failed). The prose gate is NOT enforcing here - run: vale sync" >&2; fi; else echo "[bkit] vale not installed - skipping prose lint (install vale, then run vale sync, to enable)"; fi\'';
// The `typecheck` default install seeds in a repo with NO `tsconfig.json`. Both this
// and `tsc --noEmit` are current bkit defaults — which one lands depends on the repo,
// not on the bkit version — so the uninstall stripper must recognise both or it orphans
// the script it seeded. Single source of truth for runLintModule and the stripper.
// `bkit:gate:static` chains `pnpm lint`, and bkit ships no linter of its own — so in a
// repo with no `lint` script pnpm falls back to whatever `lint` binary is on PATH and
// the gate can go GREEN THROUGH THE WRONG PROGRAM (an Android SDK `lint` was observed).
// Seed the eslint-aware default bkit already runs on itself: eslint where a config
// exists, an honest skip line where none does — never a silent fall-through to a
// stranger's binary. Add-if-missing, so a consumer's own `lint` always wins. The
// `gate-missing-called-scripts` advisory still names what bkit cannot supply
// (`build`, `test`).
export const LINT_SCRIPT = "bash -c 'if [ -f eslint.config.js ] || [ -f eslint.config.mjs ] || [ -f .eslintrc.json ]; then npx eslint .; else echo \"[bkit] no eslint config - skipping lint (bkit typechecks with tsc and scans with slop-scan)\"; fi'";
export const TYPECHECK_NO_TSCONFIG_SCRIPT = 'echo "[bkit] typecheck: no tsconfig.json — skipping" >&2';
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
export const LEGACY_LINT_PROSE_SCRIPTS = [
    'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
];
// The enforcing slop gate: `bkit ci slop` runs the delta against the PR base. CI
// passes the base sha as the one bare argument (`pnpm slop:delta "$BASE_SHA"`).
export const SLOP_DELTA_SCRIPT = "bkit ci slop";
// Same rule as LEGACY_LINT_PROSE_SCRIPTS: a value byte-matching an entry is bkit's
// own, so install / upgrade re-point it and uninstall reclaims it. Append the
// outgoing string whenever SLOP_DELTA_SCRIPT changes.
export const LEGACY_SLOP_DELTA_SCRIPTS = [
    "bash .bkit/scripts/bkit-slop-delta.sh",
];
// ---------------------------------------------------------------------------
// bkit:gate:* — the local gate workflows, prompts and hooks run (#437)
//
// Before this, eight prompts and two workflows each carried their own
// `if [ -f turbo.json ] … else jq -e ".scripts[…]"` copy. A consumer on a
// different toolchain silently no-opped every probe, `eval ""` exited 0, and the
// agent recorded the gate as having run.
//
// ONE CHAIN. Each gate is the previous gate plus its own tier, so the NAME and
// the VALUE describe the same sequence and cannot disagree. Tier vocabulary is
// the `ci.yml` job ids (bkit-tests-static / -unit / -integration / -e2e / -live),
// so a caller reads the coverage off the name without opening package.json and
// `scope` in status.jsonl is self-describing. Where a step is not a tier
// (`format`, the ship gate) the name spells out the actual steps rather than
// inventing a label.
//
// The consumer owns every value: a turbo monorepo writes `turbo run … --filter`,
// a Python repo writes `ruff check && pytest`. bkit never reads a value — only
// whether a name is declared.
//
// Declared here (pure data, no cycle) and consumed by BOTH the manifest entry
// below and runLintModule's ensurePackageJsonScripts call — one object, so the
// install default and the value the uninstall stripper byte-compares cannot
// drift apart (the failure mode the LINT_PROSE_SCRIPT comment above describes).
//
// The SAME names are what the git hooks run (`.husky/pre-commit`, `.husky/pre-push`),
// so agent and human gates cannot drift: one edit here changes both. `ci.yml` is
// deliberately NOT on them — it needs per-step reporting, affected-package
// conditionals, and tiers the local gate excludes, so it calls the scripts directly.
//
// `lint:slop` is in no gate by design: `slop-scan scan` is report-only and never
// fails (see runLintModule). The gate that fails on new findings is `slop:delta`.
//
// NOT SEEDED — and that is the point. The three deeper gates (…-integration,
// …-integration-e2e, …-integration-e2e-live) are absent unless the consumer
// writes them, because a seeded `pnpm test:integration` would hard-fail every
// repo without that tier, and a gate named `…-integration-e2e` that silently
// skipped them would be the exact false-green this issue exists to kill. Each is
// one line chaining its parent, e.g.
//   "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration"
// `/bkit-build` and `/bkit-debug` run the DEEPEST gate that exists and record its
// name, so a repo with no integration tier is visibly gated at
// `bkit:gate:static-unit` instead of quietly claiming more.
export const BKIT_GATE_SCRIPTS = {
    // `.husky/pre-commit`: prettier --write over staged files, and nothing else —
    // seconds, not minutes. Prose is a whole-repo scan, so it gates at pre-push.
    "bkit:gate:format": "pnpm lint-staged",
    // Everything that needs no test runner. Mirrors the bkit-tests-static CI job.
    // Build's plan-execute loop between tasks (tests come later, at Run Tests), and
    // the `.husky/pre-push` revert path where the tree is knowingly inconsistent and
    // the suite would fail on deletions it cannot fix.
    "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta",
    // The default local gate: `.husky/pre-push`, build Step 14, the remediates.
    "bkit:gate:static-unit": "pnpm bkit:gate:static && pnpm test",
    // Ship's conflict-resolve, the only caller whose dependency graph may have just
    // been hand-merged (lockfile conflict) and whose tree no one has ever compiled.
    // `install --frozen-lockfile` proves the merged lockfile still matches the
    // manifest; `build` proves the resolution compiles. Both are subjects of this
    // gate, not preconditions — which is why they are named here and nowhere else.
    "bkit:gate:install-static-unit-build": "pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build",
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
export const BKIT_DEBUG_GATES = [
    "bkit:gate:static-unit-integration-e2e-live",
    "bkit:gate:static-unit-integration-e2e",
    "bkit:gate:static-unit",
];
/**
 * What `/bkit-build` Step 14 will run, in DESCENDING order — first one declared wins.
 *
 * Build stops at integration ON PURPOSE. Its diagnose → remediate loop can only
 * repair what its own gate runs, so a tier left to CI is a defect the agent cannot
 * fix in-session: build closes green, the PR reds, and recovery becomes a separate
 * human-triggered `/bkit-debug`. Integration catches contract breaks the unit tier
 * structurally cannot, at a cost the loop can absorb. E2E does not pay for itself
 * here — a production build plus a browser, re-run on every remediation attempt,
 * minutes before CI runs the same thing on the resulting PR.
 *
 * Neither entry is seeded: declaring `bkit:gate:static-unit-integration` is how a
 * consumer opts their build loop into the integration tier. Absent it, build runs
 * exactly what it always ran.
 */
export const BKIT_BUILD_GATES = [
    "bkit:gate:static-unit-integration",
    "bkit:gate:static-unit",
];
/**
 * The deeper gates, shallowest first, with what declaring each one costs.
 *
 * Never seeded — a placeholder would be worse than nothing here. The probe's
 * rule is "declared = run it", so an empty or stub value exits 0 and the
 * workflow records a `scope` claiming integration coverage it never ran: the
 * exact false-green #437 exists to kill, wearing a more convincing name.
 *
 * Absence is therefore load-bearing, which leaves discoverability as the real
 * problem: a repo that HAS an integration tier and never declares the gate is
 * silently gated at `bkit:gate:static-unit` by both build and debug. `declaredBy`
 * is how install detects exactly that case and advises — see runLintModule.
 */
export const BKIT_OPTIONAL_GATES = [
    {
        gate: "bkit:gate:static-unit-integration",
        parent: "bkit:gate:static-unit",
        tier: "test:integration",
        declaredBy: ["test:integration"],
    },
    {
        gate: "bkit:gate:static-unit-integration-e2e",
        parent: "bkit:gate:static-unit-integration",
        tier: "test:e2e",
        declaredBy: ["test:e2e"],
    },
    {
        gate: "bkit:gate:static-unit-integration-e2e-live",
        parent: "bkit:gate:static-unit-integration-e2e",
        tier: "test:live",
        declaredBy: ["test:live", "test:integration:live", "test:e2e:live"],
    },
];
const CURSOR_MANIFEST = [
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
    // Curl/wget host allowlist read at runtime by guardrails.cjs. No template backs it —
    // `writeNetworkAllowlistArtifact` (bkit-cloud-env.ts) computes the domain set from the
    // consumer's own config, so it is `generated` and its hash is in `canonicalHashes`.
    { path: ".cursor/allowlist.json", format: "byte-equal-text", module: "cursor", generated: true },
    // Cursor CLI / cloud-agent MCP allows — `writeCursorCliPermissionsArtifact`
    // (bkit-cloud-env.ts) renders it from the consumer's `mcp-servers` block; same contract.
    { path: ".cursor/cli.json", format: "byte-equal-text", module: "cursor", generated: true },
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
export const OPENCODE_MANIFEST = [
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
// --codex (#435): Codex CLI host. NOTE there is deliberately no `.codex/config.toml` here —
// `openai` is a RESERVED built-in provider id in Codex (alongside `ollama` and `lmstudio`),
// so bkit has nothing to declare; re-stating it under `[model_providers.openai]` is rejected.
// Codex reads project config from `.codex/`, and hooks load only once that layer is TRUSTED.
export const CODEX_MANIFEST = [
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
    // divergence asserted in bkit-permissions-parity.integration.test.ts.
    {
        path: ".codex/hooks/guardrails.cjs",
        format: "markered-text",
        module: "codex",
        noMarkerMigration: CODEX_GUARDRAILS_WIRING_INSTRUCTIONS,
    },
    // Agent mirrors (.codex/agents/*.toml) and workflow skills (.agents/skills/bkit-*/) are
    // managed dynamically — the set follows the bkit-prefix prompt/workflow files at install.
];
// --ci (#265): the stack-agnostic CI/quality foundation. NO package.json footprint —
// a non-Node consumer can install this and stay green. ci.yml is seeded as the SKELETON
// (Node/TS step bodies commented) when --typescript is absent, or WIRED when present
// (see runCiModule + deriveCiSkeleton). Vale is stack-agnostic (external binary, lints
// .md) so its config ships here; the `lint:prose` npm wrapper stays under --typescript.
const CI_MANIFEST = [
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
//                              runtime-gated by secret presence. Requires BKIT_ANTHROPIC_API_KEY +
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
// --typescript (#265): the Node/TS toolchain (most of it is plain Node — prettier/husky/
// slop work on .js; only tsc + the cast/@ts-* rule are TS-exclusive). Always installed
// alongside `ci` (--typescript implies --ci). Vale CONFIG lives under `ci` (agnostic); the
// `lint:prose` npm wrapper stays here because it is a package.json/Node convenience.
const LINT_MANIFEST = [
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
    {
        path: "package.json",
        format: "markered-text",
        module: "lint",
        packageJsonKeys: {
            scripts: {
                // typecheck moved here from the (now agnostic) ci module — it is TS-exclusive (#265).
                typecheck: "tsc --noEmit",
                // Placeholder so `bkit:gate:static`'s `pnpm lint` cannot silently resolve to an
                // unrelated PATH binary. Add-if-missing — a consumer's own `lint` always wins.
                lint: LINT_SCRIPT,
                "format:check": "prettier --check .",
                "lint:prose": LINT_PROSE_SCRIPT,
                "lint:slop": "slop-scan scan .",
                "slop:delta": SLOP_DELTA_SCRIPT,
                // The local gate (#437). Lives with the lint module because that is
                // where its constituents already live (typecheck, format:check,
                // lint:prose, lint:slop, slop:delta are all seeded above) — a consumer
                // without the lint module has none of them, so a seeded gate would just
                // chain missing scripts. runLintModule advises that case instead.
                ...BKIT_GATE_SCRIPTS,
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
    codex: CODEX_MANIFEST,
    ci: CI_MANIFEST,
    lint: LINT_MANIFEST,
    "git-hooks": GIT_HOOKS_MANIFEST,
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
