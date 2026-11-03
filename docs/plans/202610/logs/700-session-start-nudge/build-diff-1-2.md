diff --git a/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs b/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs
new file mode 100644
index 000000000..f1c05f4cd
--- /dev/null
+++ b/.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs
@@ -0,0 +1,64 @@
+#!/usr/bin/env node
+// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Google Antigravity).
+//
+// Antigravity has no session-start event, and its only channel to the model is a `deny`'s
+// reason (bkit's `core/hooks/antigravity-hook.js`). So the advisory is delivered by
+// denying the FIRST tool call once with the advisory as the reason; the agent's retry of
+// the identical call is allowed. The session is never blocked.
+//
+// bkit generates the advisory text and its once-per-session helper into this hook at
+// install (bkit's `core/hooks/session-rules-advisory.js`), the same source as the opencode
+// and Codex hooks, plus the shared envelope adapter and `adviseOnce` deny-once delivery.
+//
+// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher
+// `write_to_file|replace_file_content|view_file|run_command` — the broadest PreToolUse
+// matcher, so the session's first call of any kind carries the advisory. See
+// .bkit/providers.md § GateGuard.
+//
+// CONTRACT — do not regress:
+// - ADVISORY, DELIVERED BY ONE BLOCK: the first call of a session is denied with the
+// advisory; the retry is allowed.
+// - FAIL OPEN: one top-level catch emits a bare allow on any error.
+// - ONCE PER SESSION: the rulesReadAdviceOnce() gate is keyed by `conversationId`, state
+// in the OS temp dir, GC'd after 24h. A payload carrying no conversation id falls back
+// to one shared bucket.
+//
+// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
+// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block. +
+"use strict"; +
+// bkit:start +
+// {{BKIT_MANAGED_MARKER}} +
+const fs = require("node:fs");
+const os = require("node:os");
+const path = require("node:path"); +
+// {{BKIT_PART session-rules-advisory.js}} +
+// {{BKIT_PART antigravity-hook.js}} +
+// bkit:end +
+function emit(decision) {

- process.stdout.write(JSON.stringify(decision));
  +}
-

+try {

- const raw = fs.readFileSync(0, "utf-8");
- if (!raw.trim()) {
- emit({ decision: "allow" });
- } else {
- const p = fromAntigravityPayload(JSON.parse(raw));
- const advisory = rulesReadAdviceOnce(p.session_id);
- emit(
-      advisory
-        ? adviseOnce("rules", p.session_id, agCallSignature(p.tool_name, p.tool_input), advisory)
-        : { decision: "allow" },
- );
- }
  +} catch {
- emit({ decision: "allow" }); // fail open — never block, never error out
  +}
  diff --git a/.bkit/core/.claude/hooks/bkit-preflight.sh b/.bkit/core/.claude/hooks/bkit-preflight.sh
  index 367f3c736..f1c1e5923 100755
  --- a/.bkit/core/.claude/hooks/bkit-preflight.sh
  +++ b/.bkit/core/.claude/hooks/bkit-preflight.sh
  @@ -14,9 +14,10 @@

# HARD STOP instruction) AND `stderr` (visible to the user). Exit code is

# informational only.

#

-# bkit generates the managed block at install: the Linear guard is shared with the
-# Cursor hook (bkit's `hooks/preflight-linear.sh`); the trigger, the brew check
-# and the output shape below are Claude's own.
+# bkit generates the managed block at install: the Linear guard and the rules-read
+# advisory are shared with the Cursor hook (bkit's `hooks/preflight-linear.sh` and
+# `hooks/preflight-rules.sh`); the trigger, the brew check and the output shape below
+# are Claude's own.

# <!-- bkit:start -->

@@ -28,21 +29,41 @@ set -euo pipefail

# Claude SessionStart payload: { session_id, transcript_path, cwd, permission_mode } — unused here.

INPUT=$(cat)

-# emit_context — Claude SessionStart expects { hookSpecificOutput: { hookEventName, additionalContext } }.
+# emit_context — Claude SessionStart expects ONE JSON document
+# { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
+# accumulates its string; the EXIT trap writes the document once, so the advisory and
+# the Linear guard result ride one document (two documents are unparseable).

# (Cursor variant: emits { additional_context: ... } directly.)

+BKIT_CONTEXT=""
emit_context() {

- python3 - "$1" <<'PY'
  -import json, sys
  -print(json.dumps({
- "hookSpecificOutput": {
- "hookEventName": "SessionStart",
- "additionalContext": sys.argv[1],
- },
  -}))
  -PY

* [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
* BKIT_CONTEXT+="$1"
  }

-# IDE session detection — skip silently when this isn't a background/cloud run.
+# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
+# document. No python3 on this path: a python3-less IDE session must still get the
+# advisory (Claude cannot block, so a lost advisory would be silent).
+bkit_json_escape() {

- local s=$1
- s=${s//\\/\\\\}
- s=${s//\"/\\\"}
- s=${s//$'\n'/\\n}
- s=${s//$'\r'/\\r}
- s=${s//$'\t'/\\t}
- printf '%s' "$s"
  +}
-

+bkit_write_document() {

- [[ -n "$BKIT_CONTEXT" ]] || return 0
- printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' \
- "$(bkit_json_escape "$BKIT_CONTEXT")"
  +}
-

+trap bkit_write_document EXIT +
+# {{BKIT_PART preflight-rules.sh}} +
+# IDE session detection — the advisory above already fired; nothing else runs here.

# Claude has no native is-background flag, so we use empty LINEAR_ISSUE_ID as the proxy.

# (Cursor variant: parses `is_background_agent` from stdin JSON.)

if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
diff --git a/.bkit/core/.codex/hooks/bkit-rules.cjs b/.bkit/core/.codex/hooks/bkit-rules.cjs
new file mode 100644
index 000000000..4ac46bd05
--- /dev/null
+++ b/.bkit/core/.codex/hooks/bkit-rules.cjs
@@ -0,0 +1,57 @@
+#!/usr/bin/env node
+// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Codex CLI).
+//
+// Codex's hook contract is the same family as Claude Code's — same stdin envelope
+// (`tool_name`, `tool_input`, `session_id`, `cwd`), same stdout shape
+// (`hookSpecificOutput` with `additionalContext`). bkit generates the advisory text and
+// its once-per-session helper into it at install (bkit's
+// `core/hooks/session-rules-advisory.js`), the same source as the opencode and
+// Antigravity hooks.
+//
+// Codex has no session-start event, so the advisory rides the FIRST tool call instead:
+// the hook writes it as `additionalContext` once per session, and every later call writes
+// nothing. `additionalContext` is advisory only — no call is ever blocked.
+//
+// REGISTRATION: `.codex/hooks.json`, two single-value `PreToolUse` groups — `apply_patch`
+// and `Bash`, the shape every shipped Codex matcher uses (alternation is not verified on
+// that host). Codex loads project-local hooks only once the project `.codex/` layer is
+// TRUSTED — until then this does not run. See .bkit/providers.md § GateGuard.
+//
+// CONTRACT — do not regress:
+// - ADVISORY ONLY: emits `additionalContext`, never a permission decision.
+// - FAIL OPEN: one top-level catch swallows every error and exits 0.
+// - ONCE PER SESSION: dedup is by `session_id`, state in the OS temp dir, GC'd after
+// 24h. Codex reports the parent's session_id inside a subagent and no agent id, so a
+// subagent can miss an advisory its parent already consumed — the same limit
+// GateGuard records. A payload carrying no session id falls back to one shared bucket.
+//
+// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
+// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block. +
+"use strict"; +
+// bkit:start +
+// {{BKIT_MANAGED_MARKER}} +
+const fs = require("node:fs");
+const os = require("node:os");
+const path = require("node:path"); +
+// {{BKIT_PART session-rules-advisory.js}} +
+// bkit:end +
+function emit(payload) {

- process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
  +}
-

+try {

- const raw = fs.readFileSync(0, "utf-8");
- if (raw.trim()) {
- const advisory = rulesReadAdviceOnce(JSON.parse(raw).session_id);
- if (advisory) emit({ hookEventName: "PreToolUse", additionalContext: advisory });
- }
  +} catch {
- process.exitCode = 0; // fail open — never block, never error out
  +}
  diff --git a/.bkit/core/.cursor/hooks/bkit-preflight.sh b/.bkit/core/.cursor/hooks/bkit-preflight.sh
  index c4fb1697b..bd5a58090 100755
  --- a/.bkit/core/.cursor/hooks/bkit-preflight.sh
  +++ b/.bkit/core/.cursor/hooks/bkit-preflight.sh
  @@ -12,9 +12,10 @@

# blocks the session before the agent starts. Failures are also surfaced via

# `additional_context` so the user sees the reason.

#

-# bkit generates the managed block at install: the Linear guard is shared with the
-# Claude hook (bkit's `hooks/preflight-linear.sh`); the trigger, the runtime
-# marker and the output shape below are Cursor's own.
+# bkit generates the managed block at install: the Linear guard and the rules-read
+# advisory are shared with the Claude hook (bkit's `hooks/preflight-linear.sh` and
+# `hooks/preflight-rules.sh`); the trigger, the runtime marker and the output shape
+# below are Cursor's own.

# <!-- bkit:start -->

@@ -26,6 +27,39 @@ set -euo pipefail

# Cursor sessionStart payload: { session_id, is_background_agent, composer_mode } — used for IDE detection below.

INPUT=$(cat)

+# emit_context — Cursor sessionStart expects ONE JSON document { additional_context: ... }
+# on stdout. Each call accumulates its string; the EXIT trap writes the document once, so
+# the advisory and the Linear guard result ride one document. Defined above the bail so an
+# IDE session gets the advisory too, and built with no python3: failClosed:true blocks the
+# session on a non-zero exit, and an IDE session may not have python3 at all.
+# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
+BKIT_CONTEXT=""
+emit_context() {

- [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
- BKIT_CONTEXT+="$1"
  +}
-

+# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
+# document.
+bkit_json_escape() {

- local s=$1
- s=${s//\\/\\\\}
- s=${s//\"/\\\"}
- s=${s//$'\n'/\\n}
- s=${s//$'\r'/\\r}
- s=${s//$'\t'/\\t}
- printf '%s' "$s"
  +}
-

+bkit_write_document() {

- [[ -n "$BKIT_CONTEXT" ]] || return 0
- printf '{"additional_context":"%s"}\n' "$(bkit_json_escape "$BKIT_CONTEXT")"
  +}
-

+trap bkit_write_document EXIT +
+# {{BKIT_PART preflight-rules.sh}} +

# IDE session bailout — grep only, no python3 on the skip path (failClosed:true in

# .cursor/hooks.json blocks the session if this exits non-zero). Background-agent

# sessions run inside the bkit Dockerfile, where python3 is present for the code below.

@@ -44,15 +78,6 @@ if BKIT_REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && [[ -d "$BKIT_R
|| echo "[bkit-runtime] could not write .bkit/.runtime-cursor — runtime will resolve as LOCAL" >&2
fi

-# emit_context — Cursor sessionStart expects { additional_context: ... } directly.
-# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
-emit_context() {

- python3 - "$1" <<'PY'
  -import json, sys
  -print(json.dumps({"additional_context": sys.argv[1]}))
  -PY
  -}
-

# Brew dep preflight — N/A on Cursor Cloud.

# Cursor Cloud runs in a containerised env where required CLIs (gh, jq, vale, pnpm, bun) are

# pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.

diff --git a/.bkit/core/.opencode/plugin/bkit-rules.js b/.bkit/core/.opencode/plugin/bkit-rules.js
new file mode 100644
index 000000000..42fbe0a87
--- /dev/null
+++ b/.bkit/core/.opencode/plugin/bkit-rules.js
@@ -0,0 +1,83 @@
+// bkit-rules.js — bkit rules-read advisory plugin for opencode.
+//
+// Fires on opencode's tool hooks. On the FIRST tool call of a session it appends the
+// rules-read advisory to the tool result, so the model is told to read `.agents/rules.md`
+// before any other action; every later call appends nothing.
+//
+// CONTRACT — do not regress:
+// - ADVISORY ONLY: appends the advisory to the tool RESULT in the after-execute hook —
+// never blocks. stderr is NOT a model channel on 2.0's detached server.
+// - FAIL OPEN: a top-level try/catch swallows every error; the plugin never throws.
+// - ONCE PER SESSION: dedup is by sessionID, state in the OS temp dir, GC'd after 24h.
+// A subagent runs in its own session, so it gets its own advisory; a payload carrying
+// no session id falls back to one shared bucket.
+// - NO SESSION-START EVENT: opencode has none, so the advisory rides the first tool
+// call's result instead.
+//
+// The advisory text and its once-per-session helper are generated at install from bkit's
+// `core/hooks/session-rules-advisory.js`, the same source as the Codex and Antigravity
+// hooks.
+//
+// OWNERSHIP: everything between the markers below is bkit-managed and is overwritten on
+// every `bkit install` / `bkit upgrade`. It is a pure advisory only — no client calls, no
+// stderr write, no throw — so it composes with your own checks in the exported plugin
+// that follows the managed block. +
+// bkit:start +
+// {{BKIT_MANAGED_MARKER}} +
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path"; +
+// {{BKIT_PART session-rules-advisory.js}} +
+// bkit:end +
+// ---------------------------------------------------------------------------
+// Driver — the one export shape OpenCode 1.x and 2.0 both load (same as
+// `bkit-gateguard.js`): 2.0 calls `setup(ctx)` and registers `execute.after`; 1.18.29+
+// calls `server()` and uses `"tool.execute.after"`. Both call the shared
+// rulesReadAdviceOnce() above, so once-per-session behaviour is identical across the two.
+// The file deliberately imports NOTHING from `@opencode/plugin`: that package only exists
+// on 2.0, and importing it would break the module load on 1.x.
+// --------------------------------------------------------------------------- +
+/** OpenCode 1.x after hook: append the advisory to `output.output`, the result text. */
+async function bkitRulesAfterV1(hookInput, output) {

- try {
- const advisory = rulesReadAdviceOnce(hookInput?.sessionID);
- if (!advisory) return;
- if (!output || typeof output !== "object") return;
- const existing = typeof output.output === "string" ? output.output : "";
- output.output = existing.length > 0 ? `${existing}\n\n${advisory}` : advisory;
- } catch {
- // fail-open: never let an advisory error reach the host
- }
  +}
-

+/** OpenCode 2.0 after hook: append the advisory to `event.result.content`. */
+async function bkitRulesAfterV2(event) {

- try {
- const advisory = rulesReadAdviceOnce(event?.sessionID);
- if (!advisory) return;
- if (!event || !event.result) return;
- const content = Array.isArray(event.result.content) ? event.result.content : [];
- event.result.content = [...content, { type: "text", text: advisory }];
- } catch {
- // fail-open: never let an advisory error reach the host
- }
  +}
-

+const bkitRulesPlugin = {

- id: "bkit-rules",
- async setup(ctx) {
- await ctx.tool.hook("execute.after", bkitRulesAfterV2);
- },
- async server() {
- return { "tool.execute.after": bkitRulesAfterV1 };
- },
  +};
-

+export default bkitRulesPlugin;
diff --git a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
index 11ff9b825..44682eaa5 100644
--- a/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts
@@ -5,10 +5,10 @@
//
// The Claude hook runs as a Claude SessionStart hook, the Cursor one as a Cursor Cloud
// sessionStart hook (a different surface from the install-time TS preflight). Covered:
-// - IDE-skip paths (Claude: empty LINEAR_ISSUE_ID; Cursor: no is_background_agent)
-// exit 0 silently.
+// - IDE sessions (Claude: empty LINEAR_ISSUE_ID; Cursor: no is_background_agent) exit 0
+// carrying the rules-read advisory, built without python3.
// - Missing BKIT_LINEAR_API_KEY / LINEAR_ISSUE_ID hard-stop, in each host's own
-// output shape.
+// output shape, with the advisory riding the same one JSON document.
// - Neither hook calls bkit: both run with no node_modules at all.
// - Jira has no preflight guard: a Jira session passes through, and neither hook
// reads the Jira token or calls Atlassian.
@@ -36,6 +36,7 @@ function runPreflight(
hook: string,
env: Record<string, string | undefined>,
input = "{}",

- opts: { path?: string } = {},
  ): { status: number | null; stdout: string; stderr: string } {
  // Strip undefined keys so we don't leak the parent process env back in.
  const cleanEnv: Record<string, string> = {};
  @@ -45,7 +46,7 @@ function runPreflight(
  // cwd outside any git repo: Cursor's runtime marker write is skipped.
  const result = spawnSync("bash", [hook], {
  cwd: GENERATED,

* env: { PATH: process.env.PATH ?? "", ...cleanEnv },

- env: { PATH: opts.path ?? process.env.PATH ?? "", ...cleanEnv },
  input,
  encoding: "utf-8",
  timeout: 10_000,
  @@ -57,11 +58,37 @@ function runPreflight(
  };
  }

+// A `python3` that behaves like a missing one (127 = command not found), so a PATH
+// holding it is a python3-less session. The advisory path must build its JSON without
+// python3: Cursor's `failClosed: true` blocks a session on a non-zero exit, and Claude
+// would lose the advisory silently.
+const NO_PYTHON_BIN = path.join(GENERATED, "no-python-bin");
+fs.mkdirSync(NO_PYTHON_BIN, { recursive: true });
+const NO_PYTHON_STUB = path.join(NO_PYTHON_BIN, "python3");
+fs.writeFileSync(NO_PYTHON_STUB, "#!/bin/sh\nexit 127\n");
+fs.chmodSync(NO_PYTHON_STUB, 0o755);
+const NO_PYTHON_PATH = `${NO_PYTHON_BIN}${path.delimiter}${process.env.PATH ?? ""}`; +
+/** The context string a rendered hook writes, in that host's own stdout envelope. */
+function emittedContext(stdout: string): string {

- const doc = JSON.parse(stdout);
- return doc.hookSpecificOutput?.additionalContext ?? doc.additional_context;
  +}
-

describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () => {

- it("exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)", () => {

* it("emits the rules advisory on a Claude IDE session", () => {
  const result = runPreflight(CLAUDE_HOOK, {});
  expect(result.status).toBe(0);

- expect(result.stdout).toBe("");

* expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
* });
*
* it("a cloud session prints one JSON document carrying the advisory and the Linear guard result", () => {
* const result = runPreflight(CLAUDE_HOOK, { LINEAR_ISSUE_ID: "BAR-186-test" });
* expect(result.status).toBe(1);
* expect(result.stdout.trim().split("\n")).toHaveLength(1);
* const context = emittedContext(result.stdout);
* expect(context).toContain(".agents/rules.md");
* expect(context).toContain("HARD STOP");
  });

it("missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard)", () => {
@@ -76,10 +103,10 @@ describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () =>
});

describe("Claude SessionStart preflight.sh — no Jira guard", () => {

- it("a Jira session (token set, no LINEAR_ISSUE_ID) exits 0 silently", () => {

* it("a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0", () => {
  const result = runPreflight(CLAUDE_HOOK, { BKIT_JIRA_API_KEY: "t" });
  expect(result.status).toBe(0);

- expect(result.stdout).toBe("");

* expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
  expect(result.stderr).toBe("");
  });

@@ -93,10 +120,12 @@ describe("Claude SessionStart preflight.sh — no Jira guard", () => {
});

describe("Cursor sessionStart preflight.sh runtime behaviour", () => {

- it("exits 0 silently when the session is not a background agent", () => {
- const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": false}');

* it("a Cursor session emits the advisory without python3 and exits 0", () => {
* const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": false}', {
*      path: NO_PYTHON_PATH,
* });
  expect(result.status).toBe(0);

- expect(result.stdout).toBe("");

* expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
  });

it("a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape", () => {
@@ -117,6 +146,23 @@ describe("Cursor sessionStart preflight.sh runtime behaviour", () => {
});
});

+describe("preflight.sh — the rules-read advisory", () => {

- it("names .agents/rules.md and never AGENTS.md", () => {
- const sessions: Array<[string, string]> = [
-      [CLAUDE_HOOK, "{}"],
-      [CURSOR_HOOK, '{"is_background_agent": false}'],
- ];
- for (const [hook, input] of sessions) {
-      const result = runPreflight(hook, {}, input);
-      expect(result.status, hook).toBe(0);
-      const context = emittedContext(result.stdout);
-      expect(context, hook).toContain(".agents/rules.md");
-      expect(context, hook).not.toContain("AGENTS.md");
-      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
- }
- });
  +});
-

describe("preflight.sh — generated from one Linear guard", () => {
it("both generated hooks carry the shared guard verbatim and never call bkit", () => {
const guard = fs
diff --git a/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
new file mode 100644
index 000000000..d832e0cf3
--- /dev/null
+++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
@@ -0,0 +1,336 @@
+// audits/hooks/session-rules-advisory.integration.test.ts — the rules-read advisory on
+// the hosts with no session-start event (opencode, Codex, Antigravity): it lands at the
+// first tool call, once per session.
+//
+// The opencode plugin is imported as install generates it (shared part spliced in) and
+// driven through the dual shape OpenCode 1.x (`server()`) and 2.0 (`setup(ctx)`) load.
+// The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
+// JSON on stdin, JSON on stdout. +
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { pathToFileURL } from "node:url";
+import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"; +
+import { readTemplate } from "../../render/parts"; +
+const HOOK_SOURCES = path.join(__dirname, "..", "..", "..", "..", "core");
+const PARTS_DIR = path.join(HOOK_SOURCES, "hooks"); +
+const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-rules-"));
+afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true })); +
+// The plugin as install generates it. `.mjs`: it is an ES module and the temp dir has no
+// package.json saying so.
+const OPENCODE_PLUGIN = path.join(GENERATED, "bkit-rules.mjs");
+fs.writeFileSync(

- OPENCODE_PLUGIN,
- readTemplate(path.join(HOOK_SOURCES, ".opencode", "plugin", "bkit-rules.js")),
  +);
-

+// ---------------------------------------------------------------------------
+// Delivered-once state — the advisory is keyed by session id and lives in the OS temp
+// dir, so tests use their own ids and clear them (plus the shared no-session bucket).
+// --------------------------------------------------------------------------- +
+const STATE_DIR = path.join(os.tmpdir(), "bkit-rules-advisory");
+const safeKey = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128); +
+let sessionCounter = 0;
+const usedSessions: string[] = [];
+function newSession(): string {

- sessionCounter += 1;
- const id = `rules-test-${process.pid}-${sessionCounter}`;
- usedSessions.push(id);
- return id;
  +}
-

+afterEach(() => {

- if (!fs.existsSync(STATE_DIR)) return;
- fs.rmSync(path.join(STATE_DIR, "no-session.json"), { force: true });
- for (const id of usedSessions.splice(0)) {
- fs.rmSync(path.join(STATE_DIR, `${safeKey(id)}.json`), { force: true });
- }
  +});
-

+// ---------------------------------------------------------------------------
+// The opencode plugin, driven the way each OpenCode release drives it.
+// --------------------------------------------------------------------------- +
+interface RulesPlugin {

- id: string;
- setup: (ctx: object) => Promise<void>;
- server: () => Promise<Record<string, unknown>>;
  +}
-

+async function loadPlugin(): Promise<RulesPlugin> {

- const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
- return plugin;
  +}
-

+interface HookOutcome {

- threw: boolean;
- /** The text the host surfaces to the model in the tool result, or "". */
- advice: string;
  +}
-

+type HookFn = (input: unknown, output: unknown) => Promise<void>; +
+/** Drive the plugin as OpenCode 2.0 does: `setup()`, then `execute.after` with a result. */
+async function runV2(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutcome> {

- const hooks: Record<string, HookFn> = {};
- const ctx = {
- tool: {
-      hook: async (name: string, cb: HookFn) => {
-        hooks[name] = cb;
-      },
- },
- };
- try {
- await plugin.setup(ctx);
- } catch {
- return { threw: true, advice: "" };
- }
- const after = hooks["execute.after"];
- if (typeof after !== "function") return { threw: false, advice: "" };
- const result: { content: { type: string; text: string }[] } = { content: [] };
- const event = {
- ...(typeof hookInput === "object" && hookInput !== null ? hookInput : {}),
- status: "completed",
- result,
- };
- try {
- await after(event, {});
- } catch {
- return { threw: true, advice: "" };
- }
- return { threw: false, advice: result.content.map((part) => part.text).join("") };
  +}
-

+/** Drive the plugin as OpenCode 1.x does: `server()`, then `tool.execute.after`. */
+async function runV1(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutcome> {

- let hooks: Record<string, HookFn>;
- try {
- hooks = (await plugin.server()) as Record<string, HookFn>;
- } catch {
- return { threw: true, advice: "" };
- }
- const after = hooks["tool.execute.after"];
- if (typeof after !== "function") return { threw: false, advice: "" };
- const output = { title: "", output: "", metadata: {} };
- try {
- await after(hookInput ?? {}, output);
- } catch {
- return { threw: true, advice: "" };
- }
- return { threw: false, advice: output.output };
  +}
-

+describe("opencode plugin — the rules-read advisory", () => {

- let plugin: RulesPlugin;
- beforeEach(async () => {
- plugin = await loadPlugin();
- });
-
- it("opencode plugin appends the rules advisory to the first tool result", async () => {
- const result = await runV2(plugin, {
-      tool: "read",
-      sessionID: newSession(),
-      id: "call-1",
-      input: { path: "src/index.ts" },
- });
- expect(result.threw).toBe(false);
- expect(result.advice).toContain(".agents/rules.md");
- });
-
- it("opencode plugin appends nothing on the second call in the same session", async () => {
- const call = {
-      tool: "read",
-      sessionID: newSession(),
-      id: "call-1",
-      input: { path: "src/index.ts" },
- };
- const first = await runV2(plugin, call);
- expect(first.threw).toBe(false);
- expect(first.advice).toContain(".agents/rules.md");
-
- const second = await runV2(plugin, { ...call, id: "call-2" });
- expect(second.threw).toBe(false);
- expect(second.advice).toBe("");
- });
-
- it("opencode plugin fails open on a malformed hook input", async () => {
- const result = await runV2(plugin, null);
- expect(result.threw).toBe(false);
- expect(result.advice).toContain(".agents/rules.md");
- });
-
- it("the 1.x driver delivers the same advisory once per session", async () => {
- const call = { tool: "read", sessionID: newSession(), callID: "call-1", args: {} };
- const first = await runV1(plugin, call);
- expect(first.threw).toBe(false);
- expect(first.advice).toContain(".agents/rules.md");
- const second = await runV1(plugin, { ...call, callID: "call-2" });
- expect(second.threw).toBe(false);
- expect(second.advice).toBe("");
- });
  +});
-

+// ---------------------------------------------------------------------------
+// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
+// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
+// --------------------------------------------------------------------------- +
+/**

- - The hook as install generates it (shared parts spliced in), in the temp dir. The host
- - path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
- */
  +function renderHook(rel: string): string {
- const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
- fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
- return out;
  +}
-

+const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
+const ANTIGRAVITY_HOOK = renderHook(

- path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
  +);
-

+function runHook(

- hook: string,
- input: string,
  +): { status: number | null; stdout: string; stderr: string } {
- const result = spawnSync(process.execPath, [hook], { input, encoding: "utf-8", timeout: 10_000 });
- return {
- status: result.status,
- stdout: result.stdout ?? "",
- stderr: result.stderr ?? "",
- };
  +}
-

+/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
+function emittedAdvisory(stdout: string): string {

- const doc = JSON.parse(stdout);
- return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
  +}
-

+describe("codex hook — the rules-read advisory", () => {

- it("codex hook writes the rules advisory as additionalContext once per session", () => {
- const payload = JSON.stringify({
-      tool_name: "apply_patch",
-      session_id: newSession(),
-      cwd: "/w",
- });
- const first = runHook(CODEX_HOOK, payload);
- expect(first.status).toBe(0);
- expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
-      ".agents/rules.md",
- );
-
- const second = runHook(CODEX_HOOK, payload);
- expect(second.status).toBe(0);
- expect(second.stdout.trim()).toBe("");
- });
-
- it("codex hook fails open on an empty payload", () => {
- const result = runHook(CODEX_HOOK, "");
- expect(result.status).toBe(0);
- expect(result.stdout).toBe("");
- });
-
- it("an unknown session id still yields the advisory once and never throws", () => {
- // No session id: the advisory must still reach the model (fail-open), and must not
- // repeat on the next call.
- const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
- const first = runHook(CODEX_HOOK, payload);
- expect(first.status).toBe(0);
- expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
-      ".agents/rules.md",
- );
-
- const second = runHook(CODEX_HOOK, payload);
- expect(second.status).toBe(0);
- expect(second.stdout.trim()).toBe("");
- });
  +});
-

+describe("antigravity hook — the rules-read advisory", () => {

- it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
- const payload = JSON.stringify({
-      conversationId: newSession(),
-      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
-      workspacePaths: ["/w"],
- });
- const first = runHook(ANTIGRAVITY_HOOK, payload);
- expect(first.status).toBe(0);
- const decision = JSON.parse(first.stdout);
- expect(decision.decision).toBe("deny");
- expect(decision.reason).toContain(".agents/rules.md");
-
- const retry = runHook(ANTIGRAVITY_HOOK, payload);
- expect(retry.status).toBe(0);
- expect(JSON.parse(retry.stdout).decision).toBe("allow");
- });
  +});
-

+describe("every rendered advisory hook", () => {

- it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
- const sessions: Array<[string, string]> = [
-      [
-        CODEX_HOOK,
-        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
-      ],
-      [
-        ANTIGRAVITY_HOOK,
-        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
-      ],
- ];
- for (const [hook, payload] of sessions) {
-      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
-      const result = runHook(hook, payload);
-      expect(result.status, hook).toBe(0);
-      const advisory = emittedAdvisory(result.stdout);
-      expect(advisory, hook).toContain(".agents/rules.md");
-      expect(advisory, hook).not.toContain("AGENTS.md");
- }
- });
  +});
-

+// ---------------------------------------------------------------------------
+// The shared advisory text — one sentence, declared once per language, held together by
+// these two assertions.
+// --------------------------------------------------------------------------- +
+/** The advisory sentence the shell part declares. */
+function shellAdvisory(): string {

- const src = fs.readFileSync(path.join(PARTS_DIR, "preflight-rules.sh"), "utf-8");
- const m = /^BKIT_RULES_ADVISORY='([^']*)'$/m.exec(src);
- expect(m, "BKIT_RULES_ADVISORY not found in preflight-rules.sh").not.toBeNull();
- return m![1]!;
  +}
-

+/** The advisory sentence the JS part declares. */
+function jsAdvisory(): string {

- const src = fs.readFileSync(path.join(PARTS_DIR, "session-rules-advisory.js"), "utf-8");
- const m = /^const RULES_READ_ADVISORY =\s*"([^"]*)";$/m.exec(src);
- expect(m, "RULES_READ_ADVISORY not found in session-rules-advisory.js").not.toBeNull();
- return m![1]!;
  +}
-

+describe("the shared rules-read advisory", () => {

- it("the shared advisory names .agents/rules.md and not AGENTS.md", () => {
- for (const [name, advisory] of [
-      ["shell", shellAdvisory()],
-      ["js", jsAdvisory()],
- ] as const) {
-      expect(advisory, name).toContain(".agents/rules.md");
-      expect(advisory, name).not.toContain("AGENTS.md");
- }
- });
-
- it("the shell part and the JS part hold the byte-identical advisory string", () => {
- expect(jsAdvisory()).toBe(shellAdvisory());
- });
  +});
  diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
  index db6eafdcd..cb2f6848e 100644
  --- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
  +++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
  @@ -368,14 +368,14 @@ const ADOPTED: Record<string, Entry> = {
  {
  kind: "bkit-only",
  what: "the core hook sources share their mirrors' opt-outs",

*        fill: '"files": [".opencode/plugin/bkit-gateguard.js", ".opencode/plugin/bkit-readguard.js"]',
*        with: '"files": [\n        ".bkit/core/.opencode/plugin/bkit-gateguard.js",\n        ".opencode/plugin/bkit-gateguard.js",\n        ".bkit/core/.opencode/plugin/bkit-readguard.js",\n        ".opencode/plugin/bkit-readguard.js"\n      ]',

-        fill: '"files": [\n        ".opencode/plugin/bkit-gateguard.js",\n        ".opencode/plugin/bkit-readguard.js",\n        ".opencode/plugin/bkit-rules.js"\n      ]',
-        with: '"files": [\n        ".bkit/core/.opencode/plugin/bkit-gateguard.js",\n        ".opencode/plugin/bkit-gateguard.js",\n        ".bkit/core/.opencode/plugin/bkit-readguard.js",\n        ".opencode/plugin/bkit-readguard.js",\n        ".bkit/core/.opencode/plugin/bkit-rules.js",\n        ".opencode/plugin/bkit-rules.js"\n      ]',
       },
       {
         kind: "bkit-only",
         what: "the core hook sources share their mirrors' opt-outs",
         fill: '      "files": [\n        "**/.claude/hooks/bkit-gateguard.cjs",\n',

*        with: '      "files": [\n        ".bkit/core/.claude/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.cursor/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.codex/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.opencode/plugin/bkit-gateguard.js",\n        ".bkit/core/hooks/gateguard-engine.js",\n        ".bkit/core/hooks/gateguard-edit-payload.js",\n        ".bkit/core/.claude/hooks/bkit-readguard.cjs",\n        ".bkit/core/.cursor/hooks/bkit-readguard.cjs",\n        ".bkit/core/.codex/hooks/bkit-readguard.cjs",\n        ".bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs",\n        ".bkit/core/.opencode/plugin/bkit-readguard.js",\n        ".bkit/core/hooks/readguard-engine.js",\n        ".bkit/core/hooks/readguard-payload.js",\n        ".bkit/core/hooks/antigravity-hook.js",\n        "**/.claude/hooks/bkit-gateguard.cjs",\n',

-        with: '      "files": [\n        ".bkit/core/.claude/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.cursor/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.codex/hooks/bkit-gateguard.cjs",\n        ".bkit/core/.opencode/plugin/bkit-gateguard.js",\n        ".bkit/core/hooks/gateguard-engine.js",\n        ".bkit/core/hooks/gateguard-edit-payload.js",\n        ".bkit/core/.claude/hooks/bkit-readguard.cjs",\n        ".bkit/core/.cursor/hooks/bkit-readguard.cjs",\n        ".bkit/core/.codex/hooks/bkit-readguard.cjs",\n        ".bkit/core/.agents/plugins/bkit/hooks/bkit-readguard.cjs",\n        ".bkit/core/.opencode/plugin/bkit-readguard.js",\n        ".bkit/core/hooks/readguard-engine.js",\n        ".bkit/core/hooks/readguard-payload.js",\n        ".bkit/core/hooks/antigravity-hook.js",\n        ".bkit/core/.opencode/plugin/bkit-rules.js",\n        ".bkit/core/hooks/session-rules-advisory.js",\n        ".bkit/core/.codex/hooks/bkit-rules.cjs",\n        ".bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs",\n        "**/.claude/hooks/bkit-gateguard.cjs",\n',
       },
       {
         kind: "bkit-only",

diff --git a/.bkit/core/engine/audits/repo/resolve-push-base.test.ts b/.bkit/core/engine/audits/repo/resolve-push-base.test.ts
index 8a787bede..40c4d8fd9 100644
--- a/.bkit/core/engine/audits/repo/resolve-push-base.test.ts
+++ b/.bkit/core/engine/audits/repo/resolve-push-base.test.ts
@@ -11,8 +11,20 @@ import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

+import { tierTimeouts } from "../../../../../vitest.timeout-budget"; +
const SCRIPT = path.resolve("scripts/ci/lanes/resolve-push-base.mjs");

+/**

- - The `exit 0 always` cases below spawn the real script — node, plus the fake `gh` / `git`
- - this test puts on PATH — so their wall time is subprocess latency, not CPU: 0.4-0.7s idle,
- - but past the 5s unit base under a loaded full gate. They ride the load-scaled
- - integration-tier budget instead (30s, and higher while the box is contended; CI pins the
- - factor to 1) — the shape `audits/templates/ci-scripts.test.ts` already gives its
- - spawned-suite case.
- */
  +const SPAWN_CASE = { timeout: tierTimeouts(true).testTimeout };
-

interface PushBaseInput {
lastGreenSha: string;
beforeSha?: string;
@@ -119,7 +131,7 @@ describe("resolve-push-base", () => {
expect(newestRunSha([{ run_number: "x", head_sha: "a" }, { head_sha: 3 }])).toBe("");
});

- describe("exit 0 always", () => {

* describe("exit 0 always", SPAWN_CASE, () => {
  const runWithFakes = (gh: string, git: string, args: string[] = [], env = {}) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "push-base-"));
  try {
  diff --git a/.bkit/core/engine/commands/install/check.integration.test.ts b/.bkit/core/engine/commands/install/check.integration.test.ts
  index 77f4a8a76..b473c89f7 100644
  --- a/.bkit/core/engine/commands/install/check.integration.test.ts
  +++ b/.bkit/core/engine/commands/install/check.integration.test.ts
  @@ -342,10 +342,12 @@ describe("check-owned-hooks", () => {
  ".codex/hooks/bkit-gateguard.cjs",
  ".codex/hooks/bkit-guardrails.cjs",
  ".codex/hooks/bkit-readguard.cjs",
*        ".codex/hooks/bkit-rules.cjs",
       ]);
       expect(paths(["opencode"]).sort()).toEqual([
         ".opencode/plugin/bkit-gateguard.js",
         ".opencode/plugin/bkit-readguard.js",
*        ".opencode/plugin/bkit-rules.js",
       ]);
  });

@@ -358,6 +360,7 @@ describe("check-owned-hooks", () => {
touch(dir, ".codex/hooks/bkit-gateguard.cjs");
touch(dir, ".codex/hooks/bkit-guardrails.cjs");
touch(dir, ".codex/hooks/bkit-readguard.cjs");

-      touch(dir, ".codex/hooks/bkit-rules.cjs");
       expect(paths(["codex"])).toEqual([]);
  });

diff --git a/.bkit/core/engine/install/manifest.ts b/.bkit/core/engine/install/manifest.ts
index acd60b2ef..e350ee9fc 100644
--- a/.bkit/core/engine/install/manifest.ts
+++ b/.bkit/core/engine/install/manifest.ts
@@ -412,6 +412,13 @@ export const OPENCODE_MANIFEST: ManifestEntry[] = [
format: "markered-text",
module: "opencode",
},

- // bkit-rules.js — same split as bkit-gateguard.js. Delivers the rules-read advisory
- // on the session's first tool call (opencode has no session-start event).
- {
- path: ".opencode/plugin/bkit-rules.js",
- format: "markered-text",
- module: "opencode",
- },
  // Agent and command mirrors are managed dynamically (not listed individually here —
  // the exact set depends on the bkit-prefix prompt/workflow files at install time).
  // Uninstall uses the BKIT_PREFIX filter for .opencode/agents/ and .opencode/commands/.
  @@ -449,6 +456,14 @@ export const CODEX_MANIFEST: ManifestEntry[] = [
  format: "markered-text",
  module: "codex",
  },
- // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
- // session as `additionalContext` on the first tool call (Codex has no session-start
- // event). Registered on two single-value matchers, `apply_patch` and `Bash`.
- {
- path: ".codex/hooks/bkit-rules.cjs",
- format: "markered-text",
- module: "codex",
- },
  // Agent mirrors (.codex/agents/_.toml) and workflow skills (.agents/skills/bkit-_/) are
  // managed dynamically — the set follows the bkit-prefix prompt/workflow files at install.
  ];
  @@ -486,6 +501,14 @@ export const ANTIGRAVITY_MANIFEST: ManifestEntry[] = [
  format: "markered-text",
  module: "antigravity",
  },
- // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
- // session by denying the first tool call with the advisory as the reason (Antigravity's
- // only channel to the model); the identical retry is allowed.
- {
- path: ".agents/plugins/bkit/hooks/bkit-rules.cjs",
- format: "markered-text",
- module: "antigravity",
- },
  // Root GEMINI.md — Antigravity workspace-rule redirect to .agents/rules.md, owned by the
  // antigravity module: `uninstall --antigravity` removes it; other installs leave it.
  { path: "GEMINI.md", format: "markered-text", module: "antigravity" },
  diff --git a/.bkit/core/engine/install/modules/antigravity.ts b/.bkit/core/engine/install/modules/antigravity.ts
  index 0c71bad91..6c8b6fae7 100644
  --- a/.bkit/core/engine/install/modules/antigravity.ts
  +++ b/.bkit/core/engine/install/modules/antigravity.ts
  @@ -198,8 +198,9 @@ export function runAntigravityModule(ctx: ModuleContext): void {
  }
  }

* // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude/Codex hooks ---
* for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {

- // --- bkit-gateguard.cjs / bkit-readguard.cjs / bkit-rules.cjs — Tier-2 markered-text,
- // twins of the Claude/Codex hooks ---
- for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs", "bkit-rules.cjs"]) {
  const hookSrc = path.join(pluginHooksSrc, hook);
  const hookDst = path.join(ANTIGRAVITY_HOOKS_DIR, hook);
  if (fs.existsSync(hookSrc)) {
  diff --git a/.bkit/core/engine/install/modules/codex.ts b/.bkit/core/engine/install/modules/codex.ts
  index c3ac5dbeb..bae0d7511 100644
  --- a/.bkit/core/engine/install/modules/codex.ts
  +++ b/.bkit/core/engine/install/modules/codex.ts
  @@ -168,8 +168,9 @@ export function runCodexModule(ctx: ModuleContext): void {
  }
  }

* // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude hooks ---
* for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {

- // --- bkit-gateguard.cjs / bkit-readguard.cjs / bkit-rules.cjs — Tier-2 markered-text,
- // twins of the Claude hooks ---
- for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs", "bkit-rules.cjs"]) {
  const hookSrc = path.join(codexHooks, hook);
  const hookDst = `.codex/hooks/${hook}`;
  if (fs.existsSync(hookSrc)) {
  diff --git a/.bkit/core/engine/install/modules/opencode.ts b/.bkit/core/engine/install/modules/opencode.ts
  index 289d6a63c..e63d1f51e 100644
  --- a/.bkit/core/engine/install/modules/opencode.ts
  +++ b/.bkit/core/engine/install/modules/opencode.ts
  @@ -516,8 +516,9 @@ export function runOpencodeModule(ctx: ModuleContext): void {
  }
  }

* // --- bkit-gateguard.js / bkit-readguard.js — Tier-2 markered-text (slash-comment); see install/manifest.ts ---
* for (const plugin of ["bkit-gateguard.js", "bkit-readguard.js"]) {

- // --- bkit-gateguard.js / bkit-readguard.js / bkit-rules.js — Tier-2 markered-text
- // (slash-comment); see install/manifest.ts ---
- for (const plugin of ["bkit-gateguard.js", "bkit-readguard.js", "bkit-rules.js"]) {
  const opencodeCore = path.join(getCoreRoot(), ".opencode", "plugin");
  const pluginSrc = path.join(opencodeCore, plugin);
  const pluginDst = `.opencode/plugin/${plugin}`;
  diff --git a/.bkit/core/engine/render/parts.test.ts b/.bkit/core/engine/render/parts.test.ts
  index e8c25ad76..83b811f01 100644
  --- a/.bkit/core/engine/render/parts.test.ts
  +++ b/.bkit/core/engine/render/parts.test.ts
  @@ -84,6 +84,7 @@ describe("shipped hook templates", () => {
  ".agents/plugins/bkit/hooks/bkit-gateguard.cjs",
  ".agents/plugins/bkit/hooks/bkit-guardrails.cjs",
  ".agents/plugins/bkit/hooks/bkit-readguard.cjs",
-      ".agents/plugins/bkit/hooks/bkit-rules.cjs",
       ".claude/hooks/bkit-gateguard.cjs",
       ".claude/hooks/bkit-guardrails.cjs",
       ".claude/hooks/bkit-preflight.sh",

@@ -91,12 +92,14 @@ describe("shipped hook templates", () => {
".codex/hooks/bkit-gateguard.cjs",
".codex/hooks/bkit-guardrails.cjs",
".codex/hooks/bkit-readguard.cjs",

-      ".codex/hooks/bkit-rules.cjs",
       ".cursor/hooks/bkit-gateguard.cjs",
       ".cursor/hooks/bkit-guardrails.cjs",
       ".cursor/hooks/bkit-preflight.sh",
       ".cursor/hooks/bkit-readguard.cjs",
       ".opencode/plugin/bkit-gateguard.js",
       ".opencode/plugin/bkit-readguard.js",
-      ".opencode/plugin/bkit-rules.js",
  ]);
  });

diff --git a/.bkit/core/hooks/preflight-rules.sh b/.bkit/core/hooks/preflight-rules.sh
new file mode 100644
index 000000000..bdface1d6
--- /dev/null
+++ b/.bkit/core/hooks/preflight-rules.sh
@@ -0,0 +1,8 @@
+# --- Rules-read advisory: the one session-start nudge (bkit renders it from this one
+# source into each SessionStart host's hook). Advisory only: it names `.agents/rules.md`
+# and no other file, never blocks a session and never changes the exit code. Needs
+# `emit_context`, which the host's own code above defines. +
+BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.' +
+emit_context "$BKIT_RULES_ADVISORY"
diff --git a/.bkit/core/hooks/session-rules-advisory.js b/.bkit/core/hooks/session-rules-advisory.js
new file mode 100644
index 000000000..af63dab67
--- /dev/null
+++ b/.bkit/core/hooks/session-rules-advisory.js
@@ -0,0 +1,51 @@
+// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
+// source into every host hook whose host has no session-start event: opencode, Codex,
+// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
+// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
+// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
+// these bytes into each host template, so either would make the rendered CJS hook invalid. +
+const RULES_READ_ADVISORY =

- "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";
-

+/** The OS-temp dir holding one state file per session the advisory already reached. */
+function rulesAdvisoryStateDir() {

- return path.join(os.tmpdir(), "bkit-rules-advisory");
  +}
-

+/** One state file per session id; a payload with no id falls back to one shared bucket. */
+function rulesAdvisoryFile(sessionId) {

- const safe =
- typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
- return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
  +}
-

+/** Opportunistic TTL: drops state files older than 24h. */
+function rulesAdvisoryGc() {

- const dir = rulesAdvisoryStateDir();
- if (!fs.existsSync(dir)) return;
- const cutoff = Date.now() - 24 * 60 * 60 * 1000;
- for (const name of fs.readdirSync(dir)) {
- const file = path.join(dir, name);
- const stat = fs.statSync(file, { throwIfNoEntry: false });
- if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
- }
  +}
-

+/**

- - The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
- - dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
- - returns the advisory instead of throwing, so the nudge is never lost to a bad state.
- */
  +function rulesReadAdviceOnce(sessionId) {
- try {
- const file = rulesAdvisoryFile(sessionId);
- if (fs.existsSync(file)) return null;
- fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
- fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
- rulesAdvisoryGc();
- return RULES_READ_ADVISORY;
- } catch {
- return RULES_READ_ADVISORY;
- }
  +}
  diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
  index dcd9f52bd..d467a5d1e 100644
  --- a/.bkit/friction.jsonl
  +++ b/.bkit/friction.jsonl
  @@ -1,2 +1,5 @@
  {"schema":3,"ts":1792989246062,"kind":"friction","key":"worktree-copy-gitignored-file-commit-failure","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["700","702","f4273d2ca"],"category":"tool-failure","scope":"universal","severity":"HIGH","summary":"Repeated `bkit steps finish` commit failures (exit 8) on a worktree whose worktree.copy names a gitignored file; the run had to abort at Step 2","description":"On build run 1 of 700-session-start-nudge the Step 2 `bkit steps finish` exited 8 (EXIT_COMMIT): the row landed but `git add -A -- . :(exclude).bkit/.env` refused because `.bkit/.env` is gitignored and was copied into the worktree by `bkit worktrees setup`. Every subsequent commit would fail the same way, so the run could not persist work and was routed to the Failure Path; `bkit workflows fail` and the handover push then ran (the handover commit succeeded via a different path). Root cause recorded as failures key `worktree-copy-gitignored-file-breaks-commit`.","status":"OPEN"}
  {"schema":3,"ts":1793001502139,"kind":"friction","key":"pre-push-gate-flakes-under-concurrent-load-block-workflow-push","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-summary"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Step 7's `bkit branches push --mode=feature` was refused three times by the pre-push gate before it landed, each time on a different load-induced 5s/30s test timeout","description":"Plan workflow for 701-engine-work-build, 2026-10-26. The feature branch carries five unpushed local-`dev` commits with code, so `bkit ci min-push` fails and every push runs the full `pnpm bkit:gate:static-unit-integration`: attempt 1 failed 5 tests (ci-scripts.test.ts 30s, runs.test.ts 5s x3), attempt 2 failed 2 (resolve-push-base.test.ts 5s, runs.test.ts 5s), attempt 3 passed. The failures are load-induced: the machine was running another session's full vitest suite in `.worktrees/700-session-start-nudge` (load average 8-10 on 10 cores), and each failing file passes on its own in the same worktree. Each attempt costs a full static + coverage-unit + bats + integration run.","remediation":"Two levers: push `dev` to origin (its five commits are what make the branch non-min, per the worktree setup warning) so later feature pushes take the light `bkit:gate:min` path; and make the audit tests' fixed 5s/30s timeouts load-aware the way the unit tier's test-timeout-budget already is, so a busy machine cannot block a mandated workflow push.","source":"701-engine-work-build plan run, Step 7","status":"OPEN","confidence":0.7}
  +{"schema":3,"ts":1793002120648,"kind":"friction","key":"build-steps-finish-commit-blocked-by-dist-staleness","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute"},"references":["700","kn-7-dist-staleness-pnpm-build-must-run-before-push-for-bk"],"category":"tool-failure","scope":"bkit-repo","severity":"HIGH","summary":"build Step 6 steps finish commit refused by bkit:check:dist after engine TS edits","description":"Group 1 edited .bkit/core/engine/**/_.ts. The repo pre-commit hook runs bkit:check:dist whenever a staged non-test engine TS exists, and the committed dist/ was stale, so steps finish exited 8 (row written, commit failed). No build workflow step, plan template or prompt mandates pnpm build + git add dist/ for engine edits (gotcha kn-7 names .bkit/src/_.ts only), so the plan omitted it and every subsequent commit in the run is blocked by the same guard.","remediation":"Add pnpm build && git add dist/ to the plan runbook (and the plan-convert / plan-execute prompts) whenever a task edits .bkit/core/engine/**/_.ts, so the step commit passes bkit:check:dist.","source":"orchestrator","status":"OPEN","confidence":0.9}
  +{"schema":3,"ts":1793002120649,"kind":"friction","key":"build-plan-execute-self-authorized-format-gate-config-change","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute"},"references":["700"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"plan-execute subagent self-authorized a .prettierignore + workflows.md format-gate config change","description":"Group 1's subagent hit format:check failing on the raw build-task-red-_.md logs the mandated red command writes, and self-authorized edits to .prettierignore, .bkit/templates/.prettierignore, .bkit/core/.bkit/workflows.md and its mirror. It also reported a test file truncated to 0 bytes by an edit call, then restored byte-for-byte with two harness fixes (test-changed). Owner review of the config change is owed.","remediation":"Ship the raw-gate log ignore pattern in the template .prettierignore so plan runs need no self-authorized edit.","source":"orchestrator","status":"OPEN","confidence":0.8}
  +{"schema":3,"ts":1793021685003,"kind":"friction","key":"build-gaps-remediate-subagent-returns-pending-while-gate-runs","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":["700","build-plan-gaps-remediate-1-1-log.md"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"build Step 8 gaps-remediate subagent returned a status line with a PENDING header while its own gate run was still going","description":"Group 1's group gate failed on one unit test timeout; the gaps-remediate subagent started a full `pnpm vitest run` to verify a fix and returned before it finished, leaving build-plan-gaps-remediate-1-1-log.md with `Verdict: PENDING` and an empty Remediation Log, plus an orphaned vitest process. `steps finish` would read the PENDING header (exit 5). The group-gate scope (full static-unit-integration tier) is far longer than one subagent turn, so an agent that waits on it returns mid-run.","remediation":"Give the gaps-remediate prompt an explicit long-run contract: run a scoped command for the failing test only, never the full tier, and never wait on a background gate — or raise the subagent turn budget so a full-tier verify fits one turn.","source":"orchestrator","status":"OPEN","confidence":0.8}
  diff --git a/.bkit/shared/.agents/plugins/bkit/hooks.json b/.bkit/shared/.agents/plugins/bkit/hooks.json
  index a58469d4e..a9df089ec 100644
  --- a/.bkit/shared/.agents/plugins/bkit/hooks.json
  +++ b/.bkit/shared/.agents/plugins/bkit/hooks.json
  @@ -30,6 +30,16 @@
  "statusMessage": "bkit ReadGuard"
  }
  ]
-      },
-      {
-        "matcher": "write_to_file|replace_file_content|view_file|run_command",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "f=hooks/bkit-rules.cjs; test -f \"$f\" || f=.agents/plugins/bkit/$f; test -f \"$f\" && node \"$f\" || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
       }
  ]
  }
  diff --git a/.bkit/shared/.codex/hooks.json b/.bkit/shared/.codex/hooks.json
  index 856998ef7..a9052a775 100644
  --- a/.bkit/shared/.codex/hooks.json
  +++ b/.bkit/shared/.codex/hooks.json
  @@ -30,6 +30,26 @@
  "statusMessage": "bkit ReadGuard"
  }
  ]
-      },
-      {
-        "matcher": "apply_patch",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "test -f .codex/hooks/bkit-rules.cjs && node .codex/hooks/bkit-rules.cjs || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
-      },
-      {
-        "matcher": "Bash",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "test -f .codex/hooks/bkit-rules.cjs && node .codex/hooks/bkit-rules.cjs || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
       }
  ],
  "PreCompact": [
  diff --git a/.bkit/shared/.opencode/opencode.json b/.bkit/shared/.opencode/opencode.json
  index 86eea1eb0..a54b0bd80 100644
  --- a/.bkit/shared/.opencode/opencode.json
  +++ b/.bkit/shared/.opencode/opencode.json
  @@ -101,7 +101,7 @@
  "mcp": {
  "@@OPENCODE_TRACKER_MCP@@": {}
  },

* "plugin": ["./plugin/bkit-gateguard.js", "./plugin/bkit-readguard.js"],

- "plugin": ["./plugin/bkit-gateguard.js", "./plugin/bkit-readguard.js", "./plugin/bkit-rules.js"],
  "provider": {
  "@@OPENCODE_PROVIDER_KEY@@": {
  "npm": "@ai-sdk/openai-compatible",
  diff --git a/.bkit/templates/slop-scan.config.json b/.bkit/templates/slop-scan.config.json
  index 2e13b44b5..f158ef791 100644
  --- a/.bkit/templates/slop-scan.config.json
  +++ b/.bkit/templates/slop-scan.config.json
  @@ -81,7 +81,11 @@
  }
  },
  {

*      "files": [".opencode/plugin/bkit-gateguard.js", ".opencode/plugin/bkit-readguard.js"],

-      "files": [
-        ".opencode/plugin/bkit-gateguard.js",
-        ".opencode/plugin/bkit-readguard.js",
-        ".opencode/plugin/bkit-rules.js"
-      ],
       "rules": {
         "defensive.empty-catch": {
           "enabled": false

@@ -99,7 +103,10 @@
"**/.cursor/hooks/bkit-readguard.cjs",
"**/.codex/hooks/bkit-readguard.cjs",
"**/.agents/plugins/bkit/hooks/bkit-readguard.cjs",

-        "**/.opencode/plugin/bkit-readguard.js"

*        "**/.opencode/plugin/bkit-readguard.js",
*        "**/.opencode/plugin/bkit-rules.js",
*        "**/.codex/hooks/bkit-rules.cjs",
*        "**/.agents/plugins/bkit/hooks/bkit-rules.cjs"
       ],
       "rules": {
         "structure.duplicate-function-signatures": {

diff --git a/dist/install/manifest.js b/dist/install/manifest.js
index f84e0da8b..cef53f7da 100644
--- a/dist/install/manifest.js
+++ b/dist/install/manifest.js
@@ -349,6 +349,13 @@ export const OPENCODE_MANIFEST = [
format: "markered-text",
module: "opencode",
},

- // bkit-rules.js — same split as bkit-gateguard.js. Delivers the rules-read advisory
- // on the session's first tool call (opencode has no session-start event).
- {
-        path: ".opencode/plugin/bkit-rules.js",
-        format: "markered-text",
-        module: "opencode",
- },
  // Agent and command mirrors are managed dynamically (not listed individually here —
  // the exact set depends on the bkit-prefix prompt/workflow files at install time).
  // Uninstall uses the BKIT_PREFIX filter for .opencode/agents/ and .opencode/commands/.
  @@ -385,6 +392,14 @@ export const CODEX_MANIFEST = [
  format: "markered-text",
  module: "codex",
  },
- // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
- // session as `additionalContext` on the first tool call (Codex has no session-start
- // event). Registered on two single-value matchers, `apply_patch` and `Bash`.
- {
-        path: ".codex/hooks/bkit-rules.cjs",
-        format: "markered-text",
-        module: "codex",
- },
  // Agent mirrors (.codex/agents/_.toml) and workflow skills (.agents/skills/bkit-_/) are
  // managed dynamically — the set follows the bkit-prefix prompt/workflow files at install.
  ];
  @@ -421,6 +436,14 @@ export const ANTIGRAVITY_MANIFEST = [
  format: "markered-text",
  module: "antigravity",
  },
- // bkit-rules.cjs — Tier-2 markered-text. Delivers the rules-read advisory once per
- // session by denying the first tool call with the advisory as the reason (Antigravity's
- // only channel to the model); the identical retry is allowed.
- {
-        path: ".agents/plugins/bkit/hooks/bkit-rules.cjs",
-        format: "markered-text",
-        module: "antigravity",
- },
  // Root GEMINI.md — Antigravity workspace-rule redirect to .agents/rules.md, owned by the
  // antigravity module: `uninstall --antigravity` removes it; other installs leave it.
  { path: "GEMINI.md", format: "markered-text", module: "antigravity" },
  diff --git a/dist/install/modules/antigravity.js b/dist/install/modules/antigravity.js
  index 5e1cd3819..599d78af9 100644
  --- a/dist/install/modules/antigravity.js
  +++ b/dist/install/modules/antigravity.js
  @@ -161,8 +161,9 @@ export function runAntigravityModule(ctx) {
  console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
  }
  }

* // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude/Codex hooks ---
* for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {

- // --- bkit-gateguard.cjs / bkit-readguard.cjs / bkit-rules.cjs — Tier-2 markered-text,
- // twins of the Claude/Codex hooks ---
- for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs", "bkit-rules.cjs"]) {
  const hookSrc = path.join(pluginHooksSrc, hook);
  const hookDst = path.join(ANTIGRAVITY_HOOKS_DIR, hook);
  if (fs.existsSync(hookSrc)) {
  diff --git a/dist/install/modules/codex.js b/dist/install/modules/codex.js
  index d54a4ef91..92c6b880c 100644
  --- a/dist/install/modules/codex.js
  +++ b/dist/install/modules/codex.js
  @@ -141,8 +141,9 @@ export function runCodexModule(ctx) {
  console.log(`${logPrefix} ${tag}codex: ${jsonDst}`);
  }
  }

* // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude hooks ---
* for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {

- // --- bkit-gateguard.cjs / bkit-readguard.cjs / bkit-rules.cjs — Tier-2 markered-text,
- // twins of the Claude hooks ---
- for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs", "bkit-rules.cjs"]) {
  const hookSrc = path.join(codexHooks, hook);
  const hookDst = `.codex/hooks/${hook}`;
  if (fs.existsSync(hookSrc)) {
  diff --git a/dist/install/modules/opencode.js b/dist/install/modules/opencode.js
  index 402385f01..25c4e016f 100644
  --- a/dist/install/modules/opencode.js
  +++ b/dist/install/modules/opencode.js
  @@ -445,8 +445,9 @@ export function runOpencodeModule(ctx) {
  }
  }
  }

* // --- bkit-gateguard.js / bkit-readguard.js — Tier-2 markered-text (slash-comment); see install/manifest.ts ---
* for (const plugin of ["bkit-gateguard.js", "bkit-readguard.js"]) {

- // --- bkit-gateguard.js / bkit-readguard.js / bkit-rules.js — Tier-2 markered-text
- // (slash-comment); see install/manifest.ts ---
- for (const plugin of ["bkit-gateguard.js", "bkit-readguard.js", "bkit-rules.js"]) {
  const opencodeCore = path.join(getCoreRoot(), ".opencode", "plugin");
  const pluginSrc = path.join(opencodeCore, plugin);
  const pluginDst = `.opencode/plugin/${plugin}`;
  diff --git a/docs/failures.jsonl b/docs/failures.jsonl
  index 33e4355af..143f2e778 100644
  --- a/docs/failures.jsonl
  +++ b/docs/failures.jsonl
  @@ -190,3 +190,4 @@
  {"schema":3,"ts":1793001499427,"kind":"failure","key":"runs-wait-cli-found-flaky-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-summary"},"references":["701","701-engine-work-build","9da84621a"],"category":"testing","severity":"LOW","summary":"runs.test.ts \"CLI: found exits 0; --once not found exits 81\" failed once under the full static-unit gate, passed on rerun","description":"Re-observed 2026-10-26 in the plan workflow for 701-engine-work-build, Step 7's `bkit branches push --mode=feature` pre-push gate: 'Test timed out in 5000ms' at `.bkit/core/engine/commands/workflow/runs.test.ts:1108`. The gate ran again and passed; the push landed. Same machine and time window as the other runs.test.ts flake recorded here (a concurrent session's vitest run in `.worktrees/700-session-start-nudge`).","status":"OPEN"}
  {"schema":3,"ts":1793001499428,"kind":"failure","key":"resolve-push-base-falls-back-gh-fails-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-summary"},"references":["701","701-engine-work-build","9da84621a"],"category":"testing","severity":"LOW","summary":"resolve-push-base.test.ts 'falls back to origin/dev with the reason on stderr when gh fails' timed out at 5000ms under the full pre-push gate, passed standalone","description":"Observed 2026-10-26 during the plan workflow for 701-engine-work-build, Step 7's `bkit branches push --mode=feature`: the pre-push hook's `pnpm bkit:gate:static-unit-integration` run reported 'Test timed out in 5000ms' at `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:205` (local mode, the test that runs a fake gh that exits 4). A later attempt of the same gate passed and the push landed (`9da84621a`). Load average was ~8-10 on 10 cores with a concurrent session's vitest run in `.worktrees/700-session-start-nudge`, which is what the fixed 5000ms timeout does not survive.","status":"OPEN"}
  {"schema":3,"ts":1793001499429,"kind":"failure","key":"ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-summary"},"references":["701","701-engine-work-build","9da84621a"],"category":"testing","severity":"LOW","summary":"ci-scripts.test.ts 'ci/lanes/resolve-push-base.test.mjs passes when run on its own' timed out at 30000ms under the full pre-push gate, passed standalone","description":"Observed 2026-10-26 during the plan workflow for 701-engine-work-build, Step 7's `bkit branches push --mode=feature`: the pre-push hook's `pnpm bkit:gate:static-unit-integration` run reported 'Test timed out in 30000ms' at `.bkit/core/engine/audits/templates/ci-scripts.test.ts:260` (the it.each case for the shipped copy-and-own `ci/lanes/resolve-push-base.test.mjs`). The shipped script's own test file passes when run directly in the same worktree, and a later attempt of the same gate passed. Same machine and time window as the other pre-push gate flakes: a concurrent session's vitest run in `.worktrees/700-session-start-nudge`.","status":"OPEN"}
  +{"schema":3,"ts":1793022027164,"kind":"failure","key":"resolve-push-base-uses-last-green-run-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":["700","700-session-start-nudge","docs/plans/202610/logs/700-session-start-nudge/build-plan-gaps-remediate-1-1-log.md","docs/plans/202610/logs/700-session-start-nudge/build-group-gate-1-1.md",".bkit/core/engine/audits/repo/resolve-push-base.test.ts","vitest.timeout-budget.ts","resolve-push-base-falls-back-gh-fails-timeout-under-full-gate"],"category":"testing","severity":"LOW","summary":"resolve-push-base.test.ts 'uses the last green run when it is an ancestor of --head, looked up on origin's repo' timed out at the flat 5000ms unit base under the full static-unit-integration group gate","description":"Observed 2026-10-26 in the build run for 700-session-start-nudge, group 1's `pnpm bkit:gate:static-unit-integration` (docs/plans/202610/logs/700-session-start-nudge/build-group-gate-1-1.md): the coverage-unit lane reported 'Test timed out in 5000ms' at `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:192`, one of the seven `exit 0 always` cases that spawn the real `scripts/ci/lanes/resolve-push-base.mjs` (node) with a fake `gh` and `git` on PATH. 1 failed of 6264 (6262 passed, 1 skipped); no other failure in that gate. The file is hermetic — 17/17 in isolation in 3.7s, slowest case 731ms cold and the failing case 541ms — so the 5055ms it took under the gate is contention, not test cost. The same file and the same seven cases timed out at the same 5000ms in the 650-workflows-prompt-alone run (docs/plans/202610/logs/650-workflows-prompt-alone/run-tests-1.md), whose diagnosis left 'confirm these files pick up the load-scaled timeout budget' as an out-of-scope recommendation.","rootCause":"The seven cases carry subprocess wall time (node plus the fake gh / git), not CPU, and the unit tier's 5000ms base is measured on an idle box; the load-scaled budget that would raise it is computed as `loadAverage / cores` floored at 1, so a 10-core machine at load average 7.5-13 scales by 1.0-1.34 — far short of the ~9x inflation contention actually produces. The file did pick the budget up (vitest.setup.ts calls vi.setConfig per file); the factor is what failed to grow.","remediation":"Fixed: the seven spawn-heavy cases now ride a load-scaled integration-tier budget — `describe(\"exit 0 always\", SPAWN_CASE, ...)` with `SPAWN_CASE = { timeout: tierTimeouts(true).testTimeout }` (30s base, scaled by load, CI pinned to 1) in `.bkit/core/engine/audits/repo/resolve-push-base.test.ts`. No assertion changed; the ten pure cases keep the unit base. Verified 17/17 green, plus a control run at `{ timeout: 100 }` that failed exactly those seven. The wider class (runs.test.ts, bkit-latest.test.ts, ci-scripts.test.ts, and the inert factor itself) stays open — see .bkit/friction.jsonl `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`.","status":"CLOSED"}
  diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
  index e1048d60b..25347db6e 100644
  --- a/docs/knowledge.jsonl
  +++ b/docs/knowledge.jsonl
  @@ -307,3 +307,5 @@
  {"schema":2,"ts":1792718454116,"kind":"knowledge","key":"tracker-true-block-between-group-and-false-block-breaks-none-render","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A standalone tracker true block placed between a github/linear/jira group and its false block makes the none render print a spurious No tracker connected stub","rootCause":"The tracker renderer pairs the github, linear and jira blocks with a false block only when the false block follows the group directly; anything between them leaves the group unpaired and it renders the NONE_STUB line under none, while the false block then renders as a separate standalone block.","remediation":"Order a Step 1 tracker region as github, linear, jira, false, then any standalone true block. After editing workflow sources, run the none render baselines (trackers.test.ts) and read the snapshot diff for a stray stub line.","status":"ACTIVE"}
  {"schema":2,"ts":1792718455123,"kind":"knowledge","key":"wording-retired-prefix-of-new-text-and-loose-list-items","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A retired wording that is a prefix of its new text makes pnpm wording:sync re-expand synced lines; a blank line inside a workflow list item makes prettier pad every block in it","rootCause":"wording:sync rewrites any line that starts with a retired text into the clause text, so a retired block equal to the first part of the new text appends the new tail again on every run. Separately, one blank line inside a markdown list item makes prettier treat the item as loose and insert blank lines around every block in it, including tracker marker lines that must stay tight.","remediation":"When the old clause text is a prefix of the new one, leave the old text out of the retired block. In a tracker-block list item, keep the block free of blank lines (put the else-case in the lead-in sentence or as a Route bullet), then run prettier --check on the workflow files and wording:sync twice to confirm it is idempotent.","status":"ACTIVE"}
  {"schema":2,"ts":1792747332665,"kind":"knowledge","key":"identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-knowledge","model":"claude-opus-5-5"},"references":["343","234","scripts/harvest/ledgers.ts",".bkit/core/engine/ledgers/telemetry.ts (identity, VALID_KINDS)","docs/observability.md § [bkit-harvest] prefix","8badea26","abe49983","683"],"summary":"A prune gated on identity destroys rows the dedup fold dropped — friction keys truncate to ~68 chars and collide, so two distinct entries share one identity and only one is ever stored","description":"Found while making bkit harvest MOVE consumer friction (#343). fold() is last-write-wins per identity(), so colliding rows collapse to ONE stored row. An identity-gated prune then deletes EVERY colliding row from the consumer while the store kept one — the loser exists nowhere. Reproduced against live consumer-a data: 'Plan Step 11: close-workflow STRAY guard rejects protocol-mandated docs/pending.md edit' (ts 1783944967776) and a different entry about docs/decisions.md + docs/pending.md edits truncate to the byte-identical key 'friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma'; the first was destroyed. Harmless under the old copy-only harvest, fatal the moment harvest deletes. Second instance of the same shape: identity() has no default branch, so rows whose kind is outside VALID_KINDS all collide on undefined — live data has kind:'tool-failure' and kind:'agent-rework' rows in consumer-a friction, and the newer evicted the older from the store.","rootCause":"identity() is a lossy projection of a row (kind+repo+key, or ts when key is absent), and fold() treats an identity match as an upsert. Anything gating a DELETE on that projection deletes rows the projection cannot distinguish. Two independent sources of collision: (1) friction keys are truncated at write time, so distinct content yields identical keys; (2) identity() returns undefined for kinds outside VALID_KINDS, mapping every unknown-kind row onto a single fold slot.","remediation":"Gate any destructive drain on byte-for-byte row CONTENT read back off disk, never on identity, and keep a store of every DISTINCT row (content dedup), never of fold winners — `scripts/harvest/ledgers.ts` header invariants (the harvest, `pnpm harvest`). The same gate covers friction rows and the `chat` / `run` rows pruned from `.bkit/stats.jsonl`. A fold loser is then stored and safe to prune; consumer lines not in the store stay and are logged (`kept N line(s) not in the store`). `identity()` (`.bkit/core/engine/ledgers/telemetry.ts`) still has no branch for kinds outside VALID_KINDS — never gate a delete on it. General rule: an identity used for dedup/upsert is NOT safe as a delete gate.","status":"ACTIVE"}
  +{"schema":3,"ts":1793001618237,"kind":"knowledge","key":"new-raw-gate-log-name-must-join-prettierignore","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"summary":"`prettier --check .` fails on a workflow's raw gate log unless the log's name pattern sits in the raw-gate-output block of both `.prettierignore` and `.bkit/templates/.prettierignore`: the current pnpm/vitest runner output starts with a blank line, and prettier's markdown parser then reflows the whole log.","rootCause":"That block lists one pattern per log name. `bkit tests red` writes `docs/plans/*/logs/*/build-task-red-*.md`, which was never added, so the format gate reads raw runner output as markdown and every build's static gate fails.","remediation":"When a command starts writing a new `docs/plans/*/logs/*/*.md` raw log, add its pattern to the raw-gate-output block of `.prettierignore` and `.bkit/templates/.prettierignore` in the same change, and name it in `.bkit/core/.bkit/workflows.md` § Gate logs plus the `.bkit/workflows.md` mirror.","status":"ACTIVE"}
  +{"schema":3,"ts":1793022027352,"kind":"knowledge","key":"spawn-heavy-unit-suite-needs-its-own-budget-under-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":["700-session-start-nudge","docs/plans/202610/logs/700-session-start-nudge/build-plan-gaps-remediate-1-1-log.md",".bkit/core/engine/audits/repo/resolve-push-base.test.ts","vitest.timeout-budget.ts","local-pnpm-test-full-parallelism-integration-timeouts-flake"],"summary":"A unit-tier test file that spawns real child processes needs its own suite-level budget: the load-scaled budget's factor is `loadAverage / cores` floored at 1, so a box at or above capacity scales nothing","description":"Symptom: 'Error: Test timed out in 5000ms' on a different child-process-spawning unit test each run, all green in isolation, on a box whose load average is at or above its core count. The repo's load-scaled budget (vitest.timeout-budget.ts, re-read per file by vitest.setup.ts) is wired and does apply to these files, but `loadFactor()` returns `loadAverage / cores` clamped to a floor of 1 — at load average 7.5 on 10 cores it returns 1, and at 13 it returns 1.34 — while contention inflates a spawn-heavy case's wall time about 9x (541ms idle to 5055ms under a full gate). So the factor is inert exactly when it is needed.","rootCause":"`loadAverage / cores` reads a machine at full capacity as '1x slower than idle'. A CPU-bound test sharing its core with one other runnable process takes about 2x, and subprocess spawn latency plus memory and IO contention inflate it further, so the measured 1.0-1.34 is a large under-estimate; MAX_LOAD_FACTOR (6) is never reached in practice.","remediation":"For a file whose cases spawn child processes, give the spawn-heavy suite its own load-scaled budget rather than relying on the unit base: `describe(\"…\", { timeout: tierTimeouts(true).testTimeout }, …)` in `.bkit/core/engine/audits/repo/resolve-push-base.test.ts` (30s base, scaled by load, CI pinned to 1). `it(…, { timeout }, …)` is the equivalent per-case form, as `audits/templates/ci-scripts.test.ts` uses. Do NOT hard-code a bare number — a fixed 30s also flaked under the full gate for the shipped-suite case. The underlying factor under-scaling is still open (`.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`); a whole-config fix would raise `loadFactor` above 1 when load average reaches the core count, which would fix every such file at once.","status":"ACTIVE"}
  diff --git a/slop-scan.config.json b/slop-scan.config.json
  index 64d894152..7e34bbb6c 100644
  --- a/slop-scan.config.json
  +++ b/slop-scan.config.json
  @@ -84,7 +84,9 @@
  ".bkit/core/.opencode/plugin/bkit-gateguard.js",
  ".opencode/plugin/bkit-gateguard.js",
  ".bkit/core/.opencode/plugin/bkit-readguard.js",

*        ".opencode/plugin/bkit-readguard.js"

-        ".opencode/plugin/bkit-readguard.js",
-        ".bkit/core/.opencode/plugin/bkit-rules.js",
-        ".opencode/plugin/bkit-rules.js"
       ],
       "rules": {
         "defensive.empty-catch": {

@@ -108,6 +110,10 @@
".bkit/core/hooks/readguard-engine.js",
".bkit/core/hooks/readguard-payload.js",
".bkit/core/hooks/antigravity-hook.js",

-        ".bkit/core/.opencode/plugin/bkit-rules.js",
-        ".bkit/core/hooks/session-rules-advisory.js",
-        ".bkit/core/.codex/hooks/bkit-rules.cjs",
-        ".bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs",
         "**/.claude/hooks/bkit-gateguard.cjs",
         "**/.cursor/hooks/bkit-gateguard.cjs",
         "**/.codex/hooks/bkit-gateguard.cjs",

@@ -117,7 +123,10 @@
"**/.cursor/hooks/bkit-readguard.cjs",
"**/.codex/hooks/bkit-readguard.cjs",
"**/.agents/plugins/bkit/hooks/bkit-readguard.cjs",

-        "**/.opencode/plugin/bkit-readguard.js"

*        "**/.opencode/plugin/bkit-readguard.js",
*        "**/.opencode/plugin/bkit-rules.js",
*        "**/.codex/hooks/bkit-rules.cjs",
*        "**/.agents/plugins/bkit/hooks/bkit-rules.cjs"
       ],
       "rules": {
         "structure.duplicate-function-signatures": {
