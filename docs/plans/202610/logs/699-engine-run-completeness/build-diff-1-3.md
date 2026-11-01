diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 779cbf262..0f549f181 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -109,7 +109,7 @@ Same name, same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Cursor, Antigravity); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind or the `engine-call` / `completeness` rows the engine journals after a terminator (so `afterEnd` and `scan.rows` grow without a rewind); `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 4bf288701..859382b36 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -272,6 +272,8 @@ Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
+| `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. Not folded; step minutes skip it. |
+| `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
 | `ship-merge-ci` | `{type, workflow, at, sha, run, verdict, reason}` | Step 14's squash-merge CI verdict, written before routing: `verdict` `PASS|FAIL`, `reason` empty on PASS. A red merge is recorded, never inferred from a missing close row. Not folded. |
 | `ship-revalidate-timeout` | `{type, workflow, at, attempt, timeout_s}` | One Step 9 CI wait that ran out: `attempt` = polls made, `timeout_s` = seconds waited. Written by `bkit status row`, not folded. |
diff --git a/.bkit/core/engine/commands/workflow/run-facts.test.ts b/.bkit/core/engine/commands/workflow/run-facts.test.ts
index 74072025d..c19fc2179 100644
--- a/.bkit/core/engine/commands/workflow/run-facts.test.ts
+++ b/.bkit/core/engine/commands/workflow/run-facts.test.ts
@@ -221,6 +221,22 @@ describe("runStatusRows / stepsBlock / ciList", () => {
     expect(totalsProblem({ steps })).toBeUndefined();
   });
 
+  // A row read back from `status.jsonl`: its type is not one `StatusEvent` declares.
+  const journalRow = (fields: Record<string, unknown>): Row =>
+    JSON.parse(JSON.stringify({ workflow: "build", ...fields }));
+
+  it("leaves a run's step minutes unchanged when journal rows land between step rows", () => {
+    const plain = [started(0), step(1, "build-a"), step(4, "build-b")];
+    const journaled = [
+      started(0),
+      step(1, "build-a"),
+      journalRow({ type: "engine-call", at: at(2), noun: "steps", verb: "finish" }),
+      journalRow({ type: "completeness", at: at(3), verdict: "complete" }),
+      step(4, "build-b"),
+    ];
+    expect(stepsBlock(journaled)).toEqual(stepsBlock(plain));
+  });
+
   it("is empty when the run has only its start row", () => {
     expect(stepsBlock([started(0)])).toEqual({ total: { n: 0, totalMinutes: 0 }, byStep: {} });
   });
diff --git a/.bkit/core/engine/commands/workflow/run-facts.ts b/.bkit/core/engine/commands/workflow/run-facts.ts
index c40e75ddf..12b7848fd 100644
--- a/.bkit/core/engine/commands/workflow/run-facts.ts
+++ b/.bkit/core/engine/commands/workflow/run-facts.ts
@@ -351,7 +351,13 @@ export const chatFingerprint = (platform: string, id: string) =>
   `fp:${createHash("sha256").update(`${platform}:${id}`).digest("hex").slice(0, 12)}`;
 
 /** Status rows that mark a moment rather than the end of a piece of work: step minutes skip them. */
-export const MARK_ROWS: ReadonlySet<string> = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS: ReadonlySet<string> = new Set([
+  "session",
+  "owner-pause",
+  "owner-answer",
+  "engine-call",
+  "completeness",
+]);
 
 /** The `session` fingerprints on the run's status rows, in row order, each once. */
 export function runChats(rows: Row[]): string[] {
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 8e8cf6699..5c7bea148 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -7,7 +7,8 @@ import { afterEach, describe, expect, it } from "vitest";
 
 import { CommandError, runCommand } from "../lib";
 import { COMMANDS } from "../registry";
-import { readRuns } from "./status";
+import { runStatusRows, stepsBlock } from "./run-facts";
+import { readRuns, readStatusEvents, readStatusRows } from "./status";
 
 const dirs: string[] = [];
 afterEach(() => {
@@ -85,6 +86,39 @@ describe("the status fold", () => {
     expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-plan-verify"]);
   });
 
+  it("ignores a row type it does not know", () => {
+    const rows = [
+      started("build", "2026-10-01T00:00:00Z"),
+      done("build", "build-a", "2026-10-01T00:01:00Z"),
+      {
+        type: "engine-call",
+        workflow: "build",
+        at: "2026-10-01T00:02:00Z",
+        noun: "steps",
+        verb: "finish",
+        flags: [],
+      },
+      { type: "completeness", workflow: "build", at: "2026-10-01T00:03:00Z", verdict: "complete" },
+      { type: "future-row", workflow: "build", at: "2026-10-01T00:04:00Z" },
+      done("build", "build-b", "2026-10-01T00:05:00Z"),
+    ];
+    const file = log(rows);
+    expect(readStatusRows(file)).toHaveLength(rows.length);
+    const runs = readRuns(file);
+    expect(runs).toHaveLength(1);
+    expect(runs[0]!.steps.map((s) => s.step)).toEqual(["build-a", "build-b"]);
+    const kept = runStatusRows(readStatusEvents(file), "build", "2026-10-01T00:00:00Z");
+    expect(kept.map((r) => r.type)).toEqual([
+      "workflow-started",
+      "step-done",
+      "engine-call",
+      "completeness",
+      "future-row",
+      "step-done",
+    ]);
+    expect(stepsBlock(kept).total.n).toBe(2);
+  });
+
   it("refuses a line that is not JSON rather than folding around it (exit 3)", () => {
     const file = log([started("build", "2026-10-01T00:00:00Z")]);
     fs.appendFileSync(file, "{not json\n");
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 456e3badc..02d3c89e7 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -109,7 +109,7 @@ Same name, same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Cursor, Antigravity); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind or the `engine-call` / `completeness` rows the engine journals after a terminator (so `afterEnd` and `scan.rows` grow without a rewind); `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
diff --git a/.bkit/version b/.bkit/version
index 359ca2f82..3d62500ff 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -224,11 +224,11 @@
     ".bkit/cloud.md": "c06cf16e2553d0e1ecfac5ae16c1ca4439c488b6eb68300cbb38b0524f72ed47",
     ".bkit/comparison.md": "55c9cc956a824f699898e66dd9a9bd7534d984d29e095187e37ed0229e9e01e5",
     ".bkit/install.md": "406ba71349bc016d164a2119eeb35836bb0451eae03b92f54e134df07e921c46",
-    ".bkit/jsonl.md": "0c9c8b5bf4f1241e64b07898a9ed16e54d3825c40f43067608ea374a5680d549",
+    ".bkit/jsonl.md": "f1b9dfbbe99cad4be0dba3dda44386022d27324bff0a2d4c8ffe3664962cd020",
     ".bkit/providers.md": "9b1486ca46eb2ee3c6637700ddcf7e2cadf32979e85d0336c12378de23d61ca5",
     ".bkit/prompts.md": "11073ff6c2402286452b27472d8b104d89fdf34eb50080adbc3255bd795a7c11",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
-    ".bkit/workflows.md": "aa50abc950fa36bd774ee55300d2566dd734c31cc883ef013dec7c68bb40907e",
+    ".bkit/workflows.md": "4933251df01e994c045858f81d8246a433ee158c54ef4626624967087d19e848",
     ".bkit/README.md": "530e36472878d389d8b4770ce20ff21ead9df87637da4b592e5c6c7a0be962dd",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "ca5312fbfe6ae3198df0b98ca8f48ec3e640df0c7a3918271777355b8367ada9",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 284880995..27adeac2c 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -272,6 +272,8 @@ Rationale: per-run state on `feat/{FID}` removes dev↔feat divergence at source
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
+| `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. Not folded; step minutes skip it. |
+| `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
 | `ship-merge-ci` | `{type, workflow, at, sha, run, verdict, reason}` | Step 14's squash-merge CI verdict, written before routing: `verdict` `PASS|FAIL`, `reason` empty on PASS. A red merge is recorded, never inferred from a missing close row. Not folded. |
 | `ship-revalidate-timeout` | `{type, workflow, at, attempt, timeout_s}` | One Step 9 CI wait that ran out: `attempt` = polls made, `timeout_s` = seconds waited. Written by `bkit status row`, not folded. |
diff --git a/dist/commands/workflow/run-facts.js b/dist/commands/workflow/run-facts.js
index b9bf94c77..714ec9595 100644
--- a/dist/commands/workflow/run-facts.js
+++ b/dist/commands/workflow/run-facts.js
@@ -283,7 +283,13 @@ export function hostChat(env) {
  */
 export const chatFingerprint = (platform, id) => `fp:${createHash("sha256").update(`${platform}:${id}`).digest("hex").slice(0, 12)}`;
 /** Status rows that mark a moment rather than the end of a piece of work: step minutes skip them. */
-export const MARK_ROWS = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS = new Set([
+    "session",
+    "owner-pause",
+    "owner-answer",
+    "engine-call",
+    "completeness",
+]);
 /** The `session` fingerprints on the run's status rows, in row order, each once. */
 export function runChats(rows) {
     const out = [];
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index 6dc223b81..2ddfaec67 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -768,3 +768,4 @@
 {"schema":3,"ts":1793150918080,"kind":"decision","key":"715-build-publish-setting","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md",".bkit/core/engine/shared/settings.ts",".bkit/core/workflows/bkit-build.md"],"status":"ACTIVE","summary":"`/bkit-build` ending is configurable through `bkit.workflows.build.publish` (`remote` / `local`, both `true` by default)","description":"`package.json` `bkit.workflows.build.publish` holds `remote` and `local`. `remote` accepts only `true`; anything else takes the default and `bkit check` raises `bkit-build-publish-remote`. `local` accepts `true` or `false`; an invalid value takes the default and raises `bkit-build-publish-invalid`. A LOCAL run resolves `publish.local`; every other runtime resolves `publish.remote` and coerces a resolved `false` to `true` with a warning. A plain-text `publish=true` / `publish=false` token in the session prompt overrides config for that run. `false` skips branch push, PR creation, CI dispatch and docs sync, keeps the worktree and branch, releases the lock, records ending `held` and `publish: false` in the close row and telemetry, leaves the issue `In review` with a 'built locally, not published' comment, and prints `Publish: held` in the summary. `true` keeps the existing push, PR and `/bkit-ship` handoff.","rationale":"The worktree, plan convert, verify, gaps, challenge and tests are the value a user wants; publishing is the only part some runs do not need. Making the ending a setting keeps one workflow implementation and one test suite, while the per-run token covers a one-off.","alternatives":"A separate `bkit ship --batch` verb (a second landing workflow that drops the per-feature checks) - rejected. A per-run flag only, no config default (every run must restate its ending) - rejected. String values `pr` / `local` (the earlier sketch; contradicts the issue's final `true`/`false` vocabulary) - rejected."}
 {"schema":3,"ts":1793150918081,"kind":"decision","key":"715-lite-workflows-retired","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate"},"references":["715","https://github.com/cbartens/bkit/issues/715",".bkit/core/.bkit/lite.md",".bkit/core/engine/install/modules/core.ts","docs/migrations.md"],"status":"ACTIVE","summary":"Lite workflows are retired; `.bkit/lite.md` becomes a consumer-owned stub and the five full workflows are the only path","description":"Delete the `.bkit/core/.bkit/lite.md` source, its manifest entry and canonical-docs list entry, the README tier-table rows, the `.agents/docs.md` index row, and every rules / prompt / README guidance line naming a lite workflow. `migrateRetiredLite` replaces `migrateShortcutsToLite`: it strips the managed block from a consumer's `.bkit/lite.md`, appends consumer lines from a `.agents/shortcuts.md` managed block, writes the merged lines under a retired-lite stub heading, deletes either file when no consumer content remains, leaves a file with no single managed block in place and logs the fix, and is idempotent. The change lands in `docs/migrations.md`. Historical ledgers, `CHANGELOG.md` and closed issues keep their mentions.","rationale":"A lite workflow skips the gates, worktree isolation, PR, CI and audit trail, and a second implementation of each workflow drifts with nothing testing it. Removing it leaves one tested path; the publish setting covers the real need to hold a build locally.","alternatives":"Move the consumer section into `.bkit/prompts.md` (that doc holds model pins, not workflow guidance) - rejected. Keep `.bkit/lite.md` as a managed doc with a retirement notice (still ships a managed lite block) - rejected. Delete the consumer section outright (destroys consumer edits) - rejected."}
 {"schema":3,"ts":1793186238813,"kind":"decision","key":"686-readme-compression-numbers-exception","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"step":"manual"},"references":["686","README.md","tests/compression/bkit-caveman-headroom-compression-proxy-comparison.md","scripts/readme/readme-art.mjs"],"status":"ACTIVE","summary":"README and README charts quote bkit's own compression-tool measurements; every other public figure names an outside source","description":"The README token section and the bkit-tokens chart keep bkit's own transcript measurements (cost split over more than 400 transcripts, per-tool saving, repeat-read and shell-read shares) because the comparison publishes its method, scripts and 95% ranges so a reader can re-run it on their own transcripts. Transcript counts are rounded down (more than 400), not exact. Every other public README or chart figure names an outside source until bkit has measured its own runs under the current workflow shape; readers are pointed at bkit stats for their own numbers.","rationale":"Owner decision 2026-10-28: the compression comparison is a deliberate exception to the outside-sources-only rule for public numbers.","alternatives":["Drop all bkit-measured figures from the README token section"]}
+{"schema":3,"ts":1793220238166,"kind":"decision","key":"699-harvest-test-outside-audit-runner","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-decision"},"references":["699","scripts/harvest/bkit-harvest.test.mjs","docs/plans/202610/699-engine-run-completeness-plan.md"],"status":"ACTIVE","summary":"699 step 8: the harvest MARK_ROWS test stays outside the build audit's vitest runner","description":"The test `MARK_ROWS is the engine's` in scripts/harvest/bkit-harvest.test.mjs runs under `pnpm test:harvest` (node), not vitest, so the build's test-first audit cannot run it. Owner accepted the not-green gap at Decision Pause 1 (group 1, step 8).","rationale":"accepted by owner: the harvest test is a plain-node .mjs test the vitest-based audit cannot run; widening vitest's include list would change a gate"}
diff --git a/scripts/harvest/bkit-harvest.mjs b/scripts/harvest/bkit-harvest.mjs
index 78a0ea255..b8c50f31b 100644
--- a/scripts/harvest/bkit-harvest.mjs
+++ b/scripts/harvest/bkit-harvest.mjs
@@ -1475,7 +1475,13 @@ export function endingOf(run, dir, ordinal) {
  * it that is not one of these. A copy of the engine's `MARK_ROWS`
  * (`.bkit/core/engine/commands/workflow/run-facts.ts`); a test holds the two equal.
  */
-export const MARK_ROWS = new Set(["session", "owner-pause", "owner-answer"]);
+export const MARK_ROWS = new Set([
+  "session",
+  "owner-pause",
+  "owner-answer",
+  "engine-call",
+  "completeness",
+]);
 
 /** A run row's key: `<fid fp>:<workflow>:<start>`. */
 const runKey = (slug, fid, workflow, start) =>
diff --git a/scripts/harvest/bkit-harvest.test.mjs b/scripts/harvest/bkit-harvest.test.mjs
index 44fe3f7ff..b7e67dc9e 100644
--- a/scripts/harvest/bkit-harvest.test.mjs
+++ b/scripts/harvest/bkit-harvest.test.mjs
@@ -2940,7 +2940,8 @@ await test("MARK_ROWS is the engine's", () => {
     "utf8",
   );
   const list = facts.match(/export const MARK_ROWS[^=]*= new Set\((\[[^\]]*\])\)/)?.[1];
-  assert.deepEqual([...MARK_ROWS], JSON.parse(list));
+  assert.deepEqual([...MARK_ROWS], JSON.parse(list.replace(/,\s*\]$/, "]")));
+  for (const t of ["engine-call", "completeness"]) assert.ok(MARK_ROWS.has(t), `${t} is a mark row`);
 });
 
 await test("report shows per-run tokens and owner waits", () => {
