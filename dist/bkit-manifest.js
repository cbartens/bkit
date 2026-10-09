// bkit-manifest.ts — Per-module install-write manifest.
// Each module declares the set of files it writes; consumed by bkit-uninstall.ts
// and the upgrade walk.
//
// Design: pure data — no fs access, no side effects. Re-exported as a public
// contract consumed by uninstall and upgrade.
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
// Cloud agents — post-CI auto-routing (#119 "Managed Cloud Agents")
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
    // bkit owns only its tracker entry under `mcpServers` (reconcileMcpJson); every other
    // key is the consumer's.
    { path: ".mcp.json", format: "json", module: "claude" },
    // Owned (writeTier1): consumer edits are overwritten. Real values go in `.bkit/.env`.
    { path: ".bkit/.env.example", format: "byte-equal-text", module: "claude" },
    // Note: .bkit/scripts/bkit-mode.sh was removed in #245 (opencode host ships as additive
    // provider-agnostic host via `bkit install --opencode=<provider>`; the ccr router lane
    // and `bkit mode` surface are retired). Consumer copies are detected on upgrade and an
    // advisory is emitted advising deletion (see runClaudeModule's bkit-mode.sh drift check).
    // Mirrors from .agents/ — managed dynamically; not listed individually here
    // because the exact set depends on the bkit-prefix prompt/workflow files at
    // install time. The uninstall logic handles these via the BKIT_PREFIX filter.
];
// ---------------------------------------------------------------------------
// lint:prose — the prose-gate script value (single source of truth)
//
// bkit no longer seeds `lint:prose` (it is a template script, `.bkit/templates.md`),
// but two surfaces still carry this string and must agree:
//   - the legacy re-point target (repointLegacyScripts, bkit-package-json.ts)
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
// Prior bkit-shipped lint:prose defaults, newest first.
//
// Why this list exists: bkit once seeded `lint:prose`, and an existing consumer
// would keep the silently-self-disabling version forever. Any value byte-matching
// an entry here is provably bkit's own (never consumer-authored), so install and
// upgrade re-point it at LINT_PROSE_SCRIPT. A value matching NEITHER the current
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
// own, so install / upgrade re-point it. Append the outgoing string whenever
// SLOP_DELTA_SCRIPT changes.
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
// Seeded by core on every install and upgrade (seedCorePackageJsonScripts,
// bkit-modules.ts): add-if-missing, so a name already present is never touched,
// and uninstall leaves every name in place. The tool scripts the defaults chain
// (typecheck, lint, format:check, lint:prose, slop:delta, lint-staged) are the
// consumer's to add — `.bkit/templates.md` lists them; the
// `gate-missing-called-scripts` advisory names any that are missing.
//
// The SAME names are what the git hook templates run (`.husky/pre-commit`, `.husky/pre-push`),
// so agent and human gates cannot drift: one edit here changes both. `ci.yml` is
// deliberately NOT on them — it needs per-step reporting, affected-package
// conditionals, and tiers the local gate excludes, so it calls the scripts directly.
//
// `lint:slop` is in no gate by design: `slop-scan scan` is report-only and never
// fails. The gate that fails on new findings is `slop:delta`.
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
 * is how install detects exactly that case and advises — see detectGateAdvisories.
 */
export const BKIT_OPTIONAL_GATES = [
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
// Cloud agent integration is opt-in — NOT included in --full, so a default install
// ships ZERO cloud footprint. The module is split by variant (DECISION-D):
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
// Splitting per variant ensures uninstall removes ONLY the recorded variant's files.
// See issue #119 ("Managed Cloud Agents").
export const CLOUD_MANIFEST_CLAUDE = [
    { path: ".claude/hooks/cloud-bootstrap.sh", format: "markered-text", module: "cloud" },
];
export const CLOUD_MANIFEST_OPENCODE = [];
export const CLOUD_MANIFEST_CURSOR = [];
// Combined manifest used by MODULE_MANIFESTS.cloud (install dispatch + uninstall).
// Uninstall removes the union (zero-footprint): each variant's files are physically
// absent on an install of another variant, so removing absent files is a no-op.
const CLOUD_MANIFEST = [
    ...CLOUD_MANIFEST_CLAUDE,
    ...CLOUD_MANIFEST_OPENCODE,
    ...CLOUD_MANIFEST_CURSOR,
];
// --typescript (#265): the owned slop-scan type-suppression plugin, the one file
// `slop-scan.config.json` references that bkit keeps current. The tool scripts and
// devDeps, slop-scan.config.json, .prettierignore, .lintstagedrc.json, the Vale config
// and the husky hooks ship as templates (`.bkit/templates.md`); the consumer copies
// and owns them.
const LINT_MANIFEST = [
    // Moved OUT of the core template walk (#265) so it ships only with --typescript.
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
const MODULE_MANIFESTS = {
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
