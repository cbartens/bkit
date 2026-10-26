diff --git a/.bkit/core/.opencode/plugin/bkit-rules.js b/.bkit/core/.opencode/plugin/bkit-rules.js
index 42fbe0a87..c9a44cef1 100644
--- a/.bkit/core/.opencode/plugin/bkit-rules.js
+++ b/.bkit/core/.opencode/plugin/bkit-rules.js
@@ -10,7 +10,9 @@
// - FAIL OPEN: a top-level try/catch swallows every error; the plugin never throws.
// - ONCE PER SESSION: dedup is by sessionID, state in the OS temp dir, GC'd after 24h.
// A subagent runs in its own session, so it gets its own advisory; a payload carrying
-// no session id falls back to one shared bucket.
+// no session id falls back to one shared bucket. The token is spent only once the call
+// is known to carry the advisory, so a call whose result never arrived leaves it for
+// the next call instead of losing the nudge for the whole session.
// - NO SESSION-START EVENT: opencode has none, so the advisory rides the first tool
// call's result instead.
//
@@ -47,9 +49,11 @@ import * as path from "node:path";
/** OpenCode 1.x after hook: append the advisory to `output.output`, the result text. */
async function bkitRulesAfterV1(hookInput, output) {
try {

- // Check the delivery shape BEFORE spending the session's one advisory: a call that
- // cannot carry it must leave the token for the next call.
- if (!output || typeof output !== "object") return;
  const advisory = rulesReadAdviceOnce(hookInput?.sessionID);
  if (!advisory) return;

* if (!output || typeof output !== "object") return;
  const existing = typeof output.output === "string" ? output.output : "";
  output.output = existing.length > 0 ? `${existing}\n\n${advisory}` : advisory;
  } catch {
  @@ -60,9 +64,11 @@ async function bkitRulesAfterV1(hookInput, output) {
  /** OpenCode 2.0 after hook: append the advisory to `event.result.content`. */
  async function bkitRulesAfterV2(event) {
  try {

- // Check the delivery shape BEFORE spending the session's one advisory: a call that
- // cannot carry it must leave the token for the next call.
- if (!event || event.status !== "completed" || !event.result) return;
  const advisory = rulesReadAdviceOnce(event?.sessionID);
  if (!advisory) return;

* if (!event || !event.result) return;
  const content = Array.isArray(event.result.content) ? event.result.content : [];
  event.result.content = [...content, { type: "text", text: advisory }];
  } catch {
  diff --git a/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
  index d832e0cf3..bc8a08a2f 100644
  --- a/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
  +++ b/.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts
  @@ -78,8 +78,20 @@ interface HookOutcome {

type HookFn = (input: unknown, output: unknown) => Promise<void>;

+/** How the 2.0 `execute.after` event is shaped when the call cannot carry the advisory. */
+interface V2EventShape {

- /** Leave `result` off the event, as a call whose result never arrived. */
- omitResult?: boolean;
- /** The event's status; `"completed"` unless a test asks for another. */
- status?: string;
  +}
-

/** Drive the plugin as OpenCode 2.0 does: `setup()`, then `execute.after` with a result. */
-async function runV2(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutcome> {
+async function runV2(

- plugin: RulesPlugin,
- hookInput: unknown,
- shape: V2EventShape = {},
  +): Promise<HookOutcome> {
  const hooks: Record<string, HookFn> = {};
  const ctx = {
  tool: {
  @@ -96,11 +108,11 @@ async function runV2(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutco
  const after = hooks["execute.after"];
  if (typeof after !== "function") return { threw: false, advice: "" };
  const result: { content: { type: string; text: string }[] } = { content: [] };

* const event = {

- const event: Record<string, unknown> = {
  ...(typeof hookInput === "object" && hookInput !== null ? hookInput : {}),

* status: "completed",
* result,

- status: shape.status ?? "completed",
  };
- if (shape.omitResult !== true) event.result = result;
  try {
  await after(event, {});
  } catch {
  @@ -109,8 +121,23 @@ async function runV2(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutco
  return { threw: false, advice: result.content.map((part) => part.text).join("") };
  }

-/** Drive the plugin as OpenCode 1.x does: `server()`, then `tool.execute.after`. _/
-async function runV1(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutcome> {
+/_* The result text a 1.x `output` carries, or "" when it is no result object at all. */
+function outputText(output: unknown): string {

- if (typeof output !== "object" || output === null) return "";
- const text = "output" in output ? output.output : undefined;
- return typeof text === "string" ? text : "";
  +}
-

+/**

- - Drive the plugin as OpenCode 1.x does: `server()`, then `tool.execute.after`. `output`
- - defaults to a well-formed result object; a test passes its own to drive a call whose
- - output is not an object.
- */
  +async function runV1(
- plugin: RulesPlugin,
- hookInput: unknown,
- output: unknown = { title: "", output: "", metadata: {} },
  +): Promise<HookOutcome> {
  let hooks: Record<string, HookFn>;
  try {
  hooks = (await plugin.server()) as Record<string, HookFn>;
  @@ -119,13 +146,12 @@ async function runV1(plugin: RulesPlugin, hookInput: unknown): Promise<HookOutco
  }
  const after = hooks["tool.execute.after"];
  if (typeof after !== "function") return { threw: false, advice: "" };

* const output = { title: "", output: "", metadata: {} };
  try {
  await after(hookInput ?? {}, output);
  } catch {
  return { threw: true, advice: "" };
  }
* return { threw: false, advice: output.output };

- return { threw: false, advice: outputText(output) };
  }

describe("opencode plugin — the rules-read advisory", () => {
@@ -167,6 +193,24 @@ describe("opencode plugin — the rules-read advisory", () => {
expect(result.advice).toContain(".agents/rules.md");
});

- it("opencode plugin keeps the advisory for the next call when the first result is missing", async () => {
- const call = {
-      tool: "read",
-      sessionID: newSession(),
-      id: "call-1",
-      input: { path: "src/index.ts" },
- };
- // No result to append to: nothing to deliver, and the session's one advisory must
- // stay unspent so the next call — the one that can carry it — still gets it.
- const first = await runV2(plugin, call, { omitResult: true });
- expect(first.threw).toBe(false);
- expect(first.advice).toBe("");
-
- const second = await runV2(plugin, { ...call, id: "call-2" });
- expect(second.threw).toBe(false);
- expect(second.advice).toContain(".agents/rules.md");
- });
- it("the 1.x driver delivers the same advisory once per session", async () => {
  const call = { tool: "read", sessionID: newSession(), callID: "call-1", args: {} };
  const first = await runV1(plugin, call);
  @@ -176,6 +220,19 @@ describe("opencode plugin — the rules-read advisory", () => {
  expect(second.threw).toBe(false);
  expect(second.advice).toBe("");
  });
-
- it("the 1.x driver keeps the advisory when the first output is not an object", async () => {
- const call = { tool: "read", sessionID: newSession(), callID: "call-1", args: {} };
- // A call whose `output` is no result object cannot carry the advisory either, so the
- // session's one advisory stays unspent for the next call.
- const first = await runV1(plugin, call, null);
- expect(first.threw).toBe(false);
- expect(first.advice).toBe("");
-
- const second = await runV1(plugin, { ...call, callID: "call-2" });
- expect(second.threw).toBe(false);
- expect(second.advice).toContain(".agents/rules.md");
- });
  });

// ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index b2be0b0cf..673babeaf 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -211,6 +211,21 @@ describe("bkit steps done", () => {
expect(r.err).toContain("blocked");
expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
}); +

- it("a failed commit leaves no row staged in the index", async () => {
- const cwd = repo();
- fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
- write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
- fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
- const r = await run(cwd, doneArgs());
- expect(r.code).toBe(8);
- // The rollback takes the row off disk, so the index must lose it too: a pathspec-less
- // commit would otherwise carry the row the failed attempt was refused. Nothing else
- // the attempt staged is left behind either — the index matches the rolled-back tree.
- const staged = git(cwd, "diff", "--cached", "--name-only");
- expect(staged).not.toContain("status.jsonl");
- expect(staged).toBe("");
- });
  });

describe("bkit steps verdict", () => {
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 07642b979..fc279c133 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -410,6 +410,26 @@ export function requireRecordOnShared(
);
}

+/** The paths staged in `cwd`, NUL-delimited so a path holding a newline stays one entry. */
+function stagedPaths(cwd: string): Set<string> {

- return new Set(
- runGit(cwd, ["diff", "--cached", "--name-only", "-z"])
-      .stdout.split("\0")
-      .filter((p) => p !== ""),
- );
  +}
-

+/**

- - Take this attempt's staging back off the index: every path staged now that was not
- - staged before it ran. A refused commit wrote nothing, so the index must match the
- - rolled-back working tree — a row left staged rides the next pathspec-less commit. A
- - path the caller had already staged is never touched.
- */
  +function unstageStaged(cwd: string, stagedBefore: Set<string>): void {
- const staged = [...stagedPaths(cwd)].filter((p) => !stagedBefore.has(p));
- if (staged.length > 0) runGit(cwd, ["reset", "-q", "--", ...staged]);
  +}
-

/**

- Append one `step-done` row, then commit (parentSha first, the row, then the
- commit — the order the fold's de-dup relies on). Returns the row and the new
  @@ -490,10 +510,15 @@ export function writeStepRow(
  }
  return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
  }

* const stagedBefore = stagedPaths(cwd);
  const add = addAllButCopied(cwd);
  const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message!]) : add;
  if (!made.ok) {
  rollback();
* // `addAllButCopied` put the row — and the rest of the tree — in the index, so the
* // rollback has to take the index back with the working tree: exit 8 means nothing was
* // written or committed, and a row left staged rides the next pathspec-less commit.
* unstageStaged(cwd, stagedBefore);
  log(`no row written to ${r.file}: the commit failed: ${made.stderr || made.stdout}`);
  return { row, commit: null, code: EXIT_COMMIT };
  }
  diff --git a/.bkit/version b/.bkit/version
  index 0debe2670..1a8195649 100644
  --- a/.bkit/version
  +++ b/.bkit/version
  @@ -266,7 +266,7 @@
  ".opencode/agents/bkit-build-plan-convert.md": "d92d55cab671b8b9f3897f7e7cb8471ecb8c2bac3f983e624aa63a5216dd43d7",
  ".codex/agents/bkit-build-plan-convert.toml": "114f3d7eb538b94088ae441b3181648f41511fa94bbd090b5ade02f225b2d0cc",
  ".bkit/authoring.md": "3ed815ec886f46a41e8c4a0c35326fe24f4ec1301325da2472846d987354ee1e",

- ".opencode/plugin/bkit-rules.js": "ee9ab878d4939f7569d377930cb8ab0c608916f3846d82bdf10f5e228de7e3ec",

* ".opencode/plugin/bkit-rules.js": "c1490239625cf0e7e87c7a52c788731c5108f342378a86de2292b1d8cf1641c6",
  ".codex/hooks/bkit-rules.cjs": "d692d543a9295b0ba351ee0c456eedd672454654391288582b6fb706f50b33a6"
  },
  "claudeAllowDerived": [
  diff --git a/.opencode/plugin/bkit-rules.js b/.opencode/plugin/bkit-rules.js
  index 4fbf0309e..3aaaf2384 100644
  --- a/.opencode/plugin/bkit-rules.js
  +++ b/.opencode/plugin/bkit-rules.js
  @@ -10,7 +10,9 @@
  // - FAIL OPEN: a top-level try/catch swallows every error; the plugin never throws.
  // - ONCE PER SESSION: dedup is by sessionID, state in the OS temp dir, GC'd after 24h.
  // A subagent runs in its own session, so it gets its own advisory; a payload carrying
  -// no session id falls back to one shared bucket.
  +// no session id falls back to one shared bucket. The token is spent only once the call
  +// is known to carry the advisory, so a call whose result never arrived leaves it for
  +// the next call instead of losing the nudge for the whole session.
  // - NO SESSION-START EVENT: opencode has none, so the advisory rides the first tool
  // call's result instead.
  //
  @@ -97,9 +99,11 @@ function rulesReadAdviceOnce(sessionId) {
  /** OpenCode 1.x after hook: append the advisory to `output.output`, the result text. */
  async function bkitRulesAfterV1(hookInput, output) {
  try {
* // Check the delivery shape BEFORE spending the session's one advisory: a call that
* // cannot carry it must leave the token for the next call.
* if (!output || typeof output !== "object") return;
  const advisory = rulesReadAdviceOnce(hookInput?.sessionID);
  if (!advisory) return;

- if (!output || typeof output !== "object") return;
  const existing = typeof output.output === "string" ? output.output : "";
  output.output = existing.length > 0 ? `${existing}\n\n${advisory}` : advisory;
  } catch {
  @@ -110,9 +114,11 @@ async function bkitRulesAfterV1(hookInput, output) {
  /** OpenCode 2.0 after hook: append the advisory to `event.result.content`. */
  async function bkitRulesAfterV2(event) {
  try {

* // Check the delivery shape BEFORE spending the session's one advisory: a call that
* // cannot carry it must leave the token for the next call.
* if (!event || event.status !== "completed" || !event.result) return;
  const advisory = rulesReadAdviceOnce(event?.sessionID);
  if (!advisory) return;

- if (!event || !event.result) return;
  const content = Array.isArray(event.result.content) ? event.result.content : [];
  event.result.content = [...content, { type: "text", text: advisory }];
  } catch {
  diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
  index 28270ea13..88f15860d 100644
  --- a/dist/commands/workflow/steps.js
  +++ b/dist/commands/workflow/steps.js
  @@ -291,6 +291,23 @@ export function requireRecordOnShared(cwd, workflow, rec) {
  return;
  throw new CommandError(EXIT_NO_RECORD, `no shared-checkout record for this run on ${branch} — nothing written or committed (the record is gone or belongs to another run); a plain commit here would carry work the run does not own`);
  }
  +/** The paths staged in `cwd`, NUL-delimited so a path holding a newline stays one entry. */
  +function stagedPaths(cwd) {

* return new Set(runGit(cwd, ["diff", "--cached", "--name-only", "-z"])
*        .stdout.split("\0")
*        .filter((p) => p !== ""));

+}
+/**

- - Take this attempt's staging back off the index: every path staged now that was not
- - staged before it ran. A refused commit wrote nothing, so the index must match the
- - rolled-back working tree — a row left staged rides the next pathspec-less commit. A
- - path the caller had already staged is never touched.
- */
  +function unstageStaged(cwd, stagedBefore) {
- const staged = [...stagedPaths(cwd)].filter((p) => !stagedBefore.has(p));
- if (staged.length > 0)
-        runGit(cwd, ["reset", "-q", "--", ...staged]);

+}
/**

- Append one `step-done` row, then commit (parentSha first, the row, then the
- commit — the order the fold's de-dup relies on). Returns the row and the new
  @@ -373,10 +390,15 @@ export function writeStepRow(cwd, r, log) {
  }
  return { row, commit: runGit(cwd, ["rev-parse", "HEAD"]).stdout, code: EXIT.OK };
  }

* const stagedBefore = stagedPaths(cwd);
  const add = addAllButCopied(cwd);
  const made = add.ok ? runGit(cwd, ["commit", "--allow-empty", "-m", r.message]) : add;
  if (!made.ok) {
  rollback();
*        // `addAllButCopied` put the row — and the rest of the tree — in the index, so the
*        // rollback has to take the index back with the working tree: exit 8 means nothing was
*        // written or committed, and a row left staged rides the next pathspec-less commit.
*        unstageStaged(cwd, stagedBefore);
         log(`no row written to ${r.file}: the commit failed: ${made.stderr || made.stdout}`);
         return { row, commit: null, code: EXIT_COMMIT };
  }
  diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
  index 4200b4b33..bd1492bd3 100644
  --- a/docs/deferrals.jsonl
  +++ b/docs/deferrals.jsonl
  @@ -274,3 +274,5 @@
  {"schema":3,"ts":1793001441034,"kind":"deferral","key":"699-completeness-check-excludes-bkit-auto-router","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["699","docs/plans/202610/699-engine-run-completeness-design.md"],"reason":"scope-declared","type":"issue","category":"observability","severity":"LOW","summary":"The completeness check covers design / plan / build / debug / ship only; the bkit-auto router markdown has no contract of its own","description":"The design's Success Criterion 1 scopes the report to design / plan / build / debug / ship, and the derived step universe is cross-checked against WORKFLOW_STEPS, whose keys are exactly those five. bkit-auto is a phase router: it dispatches to one of the five workflows rather than carrying a step universe of its own, so a run whose status.jsonl workflow is auto has no contract to check against and the CLI reports no verdict for it (rather than reporting it holey).","remediation":"Decide whether bkit-auto should carry a contract at all (e.g. 'the dispatched workflow's run started'), then either extend WORKFLOW_STEPS with an auto entry or have the check treat the routed workflow's run as the auto run's continuation.","source":"plan-1 Task 7 (WS-1 Out of Scope); design Success Criterion 1","status":"OPEN"}
  {"schema":3,"ts":1793001441035,"kind":"deferral","key":"699-completeness-verdict-no-success-axis","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["699","docs/plans/202610/699-engine-run-completeness-design.md"],"reason":"scope-declared","type":"feature","category":"observability","severity":"LOW","summary":"The completeness verdict has no success axis: a required command that ran and failed still counts as present","description":"The design declares this a deliberate non-goal for the cycle (design § Risks, 'Attempted ≠ succeeded'; § Suggested Workstreams WS-2 Scope). The engine-call row records the attempt at dispatch entry, so 'journaled' means attempted, not succeeded, and an evidence hole is a missing call, never a failed one. No Success Criterion, Acceptance Scenario line or Derived Test Matrix row needs a success axis, and the friction ledger already surfaces the failures separately.","remediation":"Once the corpus exists, decide whether an engine-call row should also carry the exit code so a required call that ran and failed can be reported distinctly (a third hole class), or whether that stays the friction ledger's job.","source":"plan-1 Task 8 (WS-2 Out of Scope); design § Risks 'Attempted ≠ succeeded'","status":"OPEN"}
  {"schema":3,"ts":1793001912314,"kind":"deferral","key":"699-friction-key-truncation-class-fix","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"deepseek-v4.1-flash"},"references":["699","docs/plans/202610/logs/699-engine-run-completeness/plan-review-2.md"],"reason":"own-cycle","type":"issue","category":"tooling","severity":"MEDIUM","summary":"The identity-gated prune truncates a friction key at ~68 chars, so two long same-prefix keys collide and the fold loser is destroyed","description":"The knowledge row `identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide` records that the harvest's identity-gated prune truncates a friction key before comparing it, so two distinct rows whose keys share that ~68-char prefix collide and the fold loser is dropped. This plan's own keys are `<noun>-<verb>/<step>` and stay far under the truncation point, so the plan avoids the envelope rather than fixing it. Plan-sized: the durable fix is a schema-level change to key minting and the prune gate (the identity tuple in `.bkit/core/engine/ledgers/telemetry.ts` and the prune gate in `scripts/harvest/ledgers.ts`) plus a migration story for the keys already truncated on disk — new architecture, not a bounded mechanical edit.","remediation":"Stop truncating the compared key (hash the full key, or truncate a digest of it), then re-derive and re-run the prune gate over the existing store rows.","source":"plan-review-2 § Out of Scope 1; knowledge `identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide`","status":"OPEN"}
  +{"schema":3,"ts":1793024241338,"kind":"deferral","key":"700-session-start-nudge-challenge-low-bkit-core-claude-hooks-bkit-preflight-sh-46","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["700-session-start-nudge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The hand-rolled JSON escaper leaves every control character except `\\n`, `\\r`, `\\t` raw, so a context carrying one yields an unparseable SessionStart document that the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory","description":"LOW build challenge finding at .bkit/core/.claude/hooks/bkit-preflight.sh:46: The hand-rolled JSON escaper leaves every control character except `\\n`, `\\r`, `\\t` raw, so a context carrying one yields an unparseable SessionStart document that the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory. Done when: `bkit_write_document` emits a document that parses for any byte the accumulated context can hold — the full U+0000–U+001F range is escaped (or the writer routes through a JSON encoder when one is on PATH, keeping the `printf` path as the no-`python3` fallback) — and a test feeds a context containing a control character and asserts `JSON.parse` succeeds. Reproduction: `bkit_json_escape` on `\"advisory\\nGuard: FAIL \\x0b HARD STOP\"` emits the `\\x0b` raw and `JSON.parse` rejects the document (\"Bad control character in string literal\"). `LINEAR_ISSUE_ID` (env) and the Linear API's label names reach the context verbatim, and the diff's own knowledge row `kn-hooks-sessionstart-stdout-is-one-json-document` records that a rejected document drops the advisory _and_ the guard output with a zero exit.","source":".bkit/core/.claude/hooks/bkit-preflight.sh:46"}
  +{"schema":3,"ts":1793024241339,"kind":"deferral","key":"700-session-start-nudge-challenge-low-bkit-core-hooks-antigravity-hook-js-63","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["700-session-start-nudge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"the Antigravity `bkit-rules.cjs` matcher adds `run_command`, so `adviseOnce` now persists the first call's full tool args — a complete shell command line, secrets included if the agent put one on it — in cleartext at `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` (default 0644, world-readable on multi-user hosts), with no TTL and no removal unless the identical call is retried; the pre-existing GateGuard registered edit tools only (file paths), so this diff widens the at-rest exposure from paths to command lines","description":"LOW build challenge finding at .bkit/core/hooks/antigravity-hook.js:63: the Antigravity `bkit-rules.cjs` matcher adds `run_command`, so `adviseOnce` now persists the first call's full tool args — a complete shell command line, secrets included if the agent put one on it — in cleartext at `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` (default 0644, world-readable on multi-user hosts), with no TTL and no removal unless the identical call is retried; the pre-existing GateGuard registered edit tools only (file paths), so this diff widens the at-rest exposure from paths to command lines. Done when: the retry state no longer stores the raw call signature — `adviseOnce` writes a one-way hash (e.g. SHA-256 of the signature) and compares hashes instead, so no tool argument of any host hook ever rests on disk in cleartext; deny-once retry behaviour is unchanged on all three Antigravity hooks.","source":".bkit/core/hooks/antigravity-hook.js:63"}
  diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
  index d2222135a..8811df5cb 100644
  --- a/docs/knowledge.jsonl
  +++ b/docs/knowledge.jsonl
  @@ -310,3 +310,4 @@
  {"schema":3,"ts":1793001618237,"kind":"knowledge","key":"new-raw-gate-log-name-must-join-prettierignore","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"summary":"`prettier --check .` fails on a workflow's raw gate log unless the log's name pattern sits in the raw-gate-output block of both `.prettierignore` and `.bkit/templates/.prettierignore`: the current pnpm/vitest runner output starts with a blank line, and prettier's markdown parser then reflows the whole log.","rootCause":"That block lists one pattern per log name. `bkit tests red` writes `docs/plans/*/logs/*/build-task-red-*.md`, which was never added, so the format gate reads raw runner output as markdown and every build's static gate fails.","remediation":"When a command starts writing a new `docs/plans/*/logs/*/*.md` raw log, add its pattern to the raw-gate-output block of `.prettierignore` and `.bkit/templates/.prettierignore` in the same change, and name it in `.bkit/core/.bkit/workflows.md` § Gate logs plus the `.bkit/workflows.md` mirror.","status":"ACTIVE"}
  {"schema":3,"ts":1793022027352,"kind":"knowledge","key":"spawn-heavy-unit-suite-needs-its-own-budget-under-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":["700-session-start-nudge","docs/plans/202610/logs/700-session-start-nudge/build-plan-gaps-remediate-1-1-log.md",".bkit/core/engine/audits/repo/resolve-push-base.test.ts","vitest.timeout-budget.ts","local-pnpm-test-full-parallelism-integration-timeouts-flake"],"summary":"A unit-tier test file that spawns real child processes needs its own suite-level budget: the load-scaled budget's factor is `loadAverage / cores` floored at 1, so a box at or above capacity scales nothing","description":"Symptom: 'Error: Test timed out in 5000ms' on a different child-process-spawning unit test each run, all green in isolation, on a box whose load average is at or above its core count. The repo's load-scaled budget (vitest.timeout-budget.ts, re-read per file by vitest.setup.ts) is wired and does apply to these files, but `loadFactor()` returns `loadAverage / cores` clamped to a floor of 1 — at load average 7.5 on 10 cores it returns 1, and at 13 it returns 1.34 — while contention inflates a spawn-heavy case's wall time about 9x (541ms idle to 5055ms under a full gate). So the factor is inert exactly when it is needed.","rootCause":"`loadAverage / cores` reads a machine at full capacity as '1x slower than idle'. A CPU-bound test sharing its core with one other runnable process takes about 2x, and subprocess spawn latency plus memory and IO contention inflate it further, so the measured 1.0-1.34 is a large under-estimate; MAX_LOAD_FACTOR (6) is never reached in practice.","remediation":"For a file whose cases spawn child processes, give the spawn-heavy suite its own load-scaled budget rather than relying on the unit base: `describe(\"…\", { timeout: tierTimeouts(true).testTimeout }, …)` in `.bkit/core/engine/audits/repo/resolve-push-base.test.ts` (30s base, scaled by load, CI pinned to 1). `it(…, { timeout }, …)` is the equivalent per-case form, as `audits/templates/ci-scripts.test.ts` uses. Do NOT hard-code a bare number — a fixed 30s also flaked under the full gate for the shipped-suite case. The underlying factor under-scaling is still open (`.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`); a whole-config fix would raise `loadFactor` above 1 when load average reaches the core count, which would fix every such file at once.","status":"ACTIVE"}
  {"schema":3,"ts":1793023059383,"kind":"knowledge","key":"kn-hooks-sessionstart-stdout-is-one-json-document","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":[".bkit/core/.claude/hooks/bkit-preflight.sh",".bkit/core/hooks/preflight-rules.sh",".bkit/core/.cursor/hooks/bkit-preflight.sh"],"summary":"A Claude Code hook's stdout is one JSON document — a second top-level print discards both","description":"A SessionStart hook that prints JSON twice — once for the rules-read advisory, once for the Linear guard result — writes `{...}{...}`; the host parses stdout as a single JSON document, fails, and drops the whole output (advisory included) with no error and a zero exit.","rootCause":"Claude Code reads a hook's stdout as ONE JSON document. A second top-level print is not merged into the first; it makes the stream unparseable, so bkit's own output is lost too.","remediation":"Accumulate every context string through one helper (`emit_context`) and write the single document from an EXIT trap; a spliced part must call that helper, never `echo` / `printf` JSON itself.","status":"ACTIVE"}
  +{"schema":3,"ts":1793024922946,"kind":"knowledge","key":"hook-driver-below-bkit-end-is-consumer-owned-so-install-never-updates-it","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek/deepseek-v4.1-flash"},"references":["700","docs/plans/202610/700-session-start-nudge-plan.md",".bkit/core/.opencode/plugin/bkit-rules.js",".bkit/core/engine/install/write.ts"],"summary":"A host driver below `// bkit:end` in an opencode plugin / Codex / Antigravity hook template is consumer-owned: `bkit install` and `bkit check` never carry a driver edit into an existing install","description":"`writeTier2` rewrites only the text between the marker pair. In `.bkit/core/.opencode/plugin/*.js` the host driver (e.g. `bkitRulesAfterV1` / `bkitRulesAfterV2`) sits BELOW `// bkit:end`, so editing that driver and re-running `bkit install --opencode=<provider>` reports `0 write(s)`, `bkit check` stays drift-clean, and the installed `.opencode/plugin/<name>.js` keeps the old driver. The whole template is written only when the destination is missing, or when the destination's out-of-block text hashes to a `RETIRED_DRIVER_HASHES` entry.","rootCause":"these hook templates are Tier-2 markered-text: everything outside the marker pair is treated as the consumer's own plugin code, so bkit must not clobber it, and only the retired-driver table may replace a whole file.","remediation":"After editing such a driver: delete the installed copy and re-run `bkit install --<host>` (the recovery path install's own warnings print), then confirm `bkit check` exits 0. To reach existing consumer installs, add the old out-of-block driver's sha256 to `RETIRED_DRIVER_HASHES` in `.bkit/core/engine/install/write.ts`."}
