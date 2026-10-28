diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index aa83ee1bd..1e74c62aa 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1441,6 +1441,32 @@ describe("bkit ledgers triage", () => {
     expect((after["by"] as Record<string, unknown>)["workflow"]).toBe("ship");
   });
 
+  it("triage writes no row for a closed deferral", async () => {
+    const r = triageRepo([deferral({ status: "CLOSED" })]);
+    const res = await triage(r);
+    expect(res.code).toBe(0);
+    expect(res.json.rows.map((x: { key: string; bucket: string }) => [x.key, x.bucket])).toEqual([
+      ["701-deferred-guard", "Exempt"],
+    ]);
+    expect(res.json.rows[0].tests).toEqual([]);
+    expect(res.json.written).toBe(0);
+    expect(lines(r)).toHaveLength(1);
+  });
+
+  it("triage reports an adjudicated unjustified row outside exempt", async () => {
+    const r = triageRepo([deferral({ reason: "unjustified", status: "TRIAGED" })]);
+    const once = lines(r);
+    const first = await triage(r);
+    const second = await triage(r);
+    expect([first.code, second.code]).toEqual([0, 0]);
+    expect(first.json.rows.map((x: { key: string; bucket: string }) => [x.key, x.bucket])).toEqual([
+      ["701-deferred-guard", "Lazy"],
+    ]);
+    expect(second.json.rows).toEqual(first.json.rows);
+    expect(second.json.written).toBe(0);
+    expect(lines(r)).toEqual(once);
+  });
+
   it("triage ignores another feature's deferral rows", async () => {
     const r = triageRepo([
       deferral(),
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index b0b41aec6..1c484728c 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -806,7 +806,7 @@ export const ledgersCommand: CommandSpec = {
       output: {
         fid: "the feature id triaged",
         plan: "the plan the tests were read from",
-        rows: "each matched deferral's key, bucket (Exempt | Lazy), test results and whether a row was written",
+        rows: "each matched deferral's key, bucket (Exempt | Lazy), test results (none for a settled row: closed, LOW, or already adjudicated) and whether a row was written",
         total: "deferral rows the FID matched",
         written: "unjustified rows appended",
       },
@@ -1517,7 +1517,10 @@ export interface DeferralTestResult {
 /** One matched deferral row's bucket and the tests behind it. */
 export interface TriageRow {
   key: string | null;
-  /** `Lazy` when every test holds: in-scope work that should have been finished. */
+  /**
+   * `Lazy` when every test holds, and for a row already adjudicated `unjustified`:
+   * in-scope work that should have been finished.
+   */
   bucket: "Exempt" | "Lazy";
   /** Empty when the row is settled before the tests are applied. */
   tests: DeferralTestResult[];
@@ -1713,11 +1716,19 @@ export function triageDeferrals(root: string, fid: string, planPath: string): Tr
   const write: Array<Record<string, unknown>> = [];
   for (const row of rows) {
     const key = typeof row["key"] === "string" ? row["key"] : null;
-    // A LOW challenge finding holds without the tests, and an adjudicated row is never re-adjudicated.
-    if (
-      (row["reason"] === "low-severity" && row["severity"] === "LOW") ||
-      row["reason"] === UNJUSTIFIED_REASON
-    ) {
+    // Closed work is done: nothing to test, nothing to write.
+    if (row["status"] === "CLOSED") {
+      out.push({ key, bucket: "Exempt", tests: [], written: false });
+      continue;
+    }
+    // A LOW challenge finding holds without the tests, and an adjudicated row is never
+    // re-adjudicated: it keeps the `Lazy` bucket its adjudication earned, so an
+    // outstanding unjustified deferral never reads as `Exempt Deferrals`.
+    if (row["reason"] === UNJUSTIFIED_REASON) {
+      out.push({ key, bucket: "Lazy", tests: [], written: false });
+      continue;
+    }
+    if (row["reason"] === "low-severity" && row["severity"] === "LOW") {
       out.push({ key, bucket: "Exempt", tests: [], written: false });
       continue;
     }
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index bf1402816..3bc565bdb 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -210,6 +210,15 @@ describe("bkit tasks tick", () => {
     expect(r.err).toContain("no-such-plan.md");
   });
 
+  it("tick treats the header's none as nothing to tick", async () => {
+    const text = planText(group(1, task(1), task(2)));
+    const plan = write("none.md", text);
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=none"]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([]);
+    expect(read(plan)).toBe(text);
+  });
+
   it("tick leaves every other plan line byte-identical", async () => {
     const text = planText(group(1, task(1), task(2)), group(2, task(3)));
     const plan = write("bytes.md", text);
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index 74825d5e2..d429849de 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -66,11 +66,20 @@ function groupTasks(plan: Plan, arg: string, group: number): PlanTaskBlock[] {
   return plan.tasks.filter((t) => t.group === group);
 }
 
-/** The task numbers a repeated value names: comma- or space-separated, each a positive integer. */
+/**
+ * The task numbers a repeated value names: comma- or space-separated, each a positive
+ * integer. The token `none` names nothing to tick, so the verify header's empty form
+ * (`Tasks: none`) passes straight through as `ticked: []`.
+ */
 function taskNumbers(values: readonly string[], flag: string): number[] {
   const numbers: number[] = [];
+  let none = false;
   for (const value of values)
     for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
+      if (token.toLowerCase() === "none") {
+        none = true;
+        continue;
+      }
       if (!/^[1-9][0-9]*$/.test(token))
         throw new CommandError(
           EXIT.USAGE,
@@ -79,7 +88,7 @@ function taskNumbers(values: readonly string[], flag: string): number[] {
       const n = Number(token);
       if (!numbers.includes(n)) numbers.push(n);
     }
-  if (numbers.length === 0) throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
+  if (numbers.length === 0 && !none) throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
   return numbers;
 }
 
@@ -157,7 +166,7 @@ export const tasksCommand: CommandSpec = {
           name: "tasks",
           type: "string",
           repeatable: true,
-          help: "the task numbers to tick, comma-separated or once per number (one of --tasks / --green)",
+          help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green)",
         },
         {
           name: "green",
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 0b7220184..19cf984ae 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -660,7 +660,7 @@ export const ledgersCommand = {
             output: {
                 fid: "the feature id triaged",
                 plan: "the plan the tests were read from",
-                rows: "each matched deferral's key, bucket (Exempt | Lazy), test results and whether a row was written",
+                rows: "each matched deferral's key, bucket (Exempt | Lazy), test results (none for a settled row: closed, LOW, or already adjudicated) and whether a row was written",
                 total: "deferral rows the FID matched",
                 written: "unjustified rows appended",
             },
@@ -1439,9 +1439,19 @@ export function triageDeferrals(root, fid, planPath) {
     const write = [];
     for (const row of rows) {
         const key = typeof row["key"] === "string" ? row["key"] : null;
-        // A LOW challenge finding holds without the tests, and an adjudicated row is never re-adjudicated.
-        if ((row["reason"] === "low-severity" && row["severity"] === "LOW") ||
-            row["reason"] === UNJUSTIFIED_REASON) {
+        // Closed work is done: nothing to test, nothing to write.
+        if (row["status"] === "CLOSED") {
+            out.push({ key, bucket: "Exempt", tests: [], written: false });
+            continue;
+        }
+        // A LOW challenge finding holds without the tests, and an adjudicated row is never
+        // re-adjudicated: it keeps the `Lazy` bucket its adjudication earned, so an
+        // outstanding unjustified deferral never reads as `Exempt Deferrals`.
+        if (row["reason"] === UNJUSTIFIED_REASON) {
+            out.push({ key, bucket: "Lazy", tests: [], written: false });
+            continue;
+        }
+        if (row["reason"] === "low-severity" && row["severity"] === "LOW") {
             out.push({ key, bucket: "Exempt", tests: [], written: false });
             continue;
         }
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 7862285da..0faa407ae 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -44,18 +44,27 @@ function groupTasks(plan, arg, group) {
         throw new CommandError(EXIT.USAGE, `${arg} has no GROUP ${group}`);
     return plan.tasks.filter((t) => t.group === group);
 }
-/** The task numbers a repeated value names: comma- or space-separated, each a positive integer. */
+/**
+ * The task numbers a repeated value names: comma- or space-separated, each a positive
+ * integer. The token `none` names nothing to tick, so the verify header's empty form
+ * (`Tasks: none`) passes straight through as `ticked: []`.
+ */
 function taskNumbers(values, flag) {
     const numbers = [];
+    let none = false;
     for (const value of values)
         for (const token of value.split(/[\s,]+/).filter((t) => t !== "")) {
+            if (token.toLowerCase() === "none") {
+                none = true;
+                continue;
+            }
             if (!/^[1-9][0-9]*$/.test(token))
                 throw new CommandError(EXIT.USAGE, `--${flag} must name positive task numbers, got "${token}"`);
             const n = Number(token);
             if (!numbers.includes(n))
                 numbers.push(n);
         }
-    if (numbers.length === 0)
+    if (numbers.length === 0 && !none)
         throw new CommandError(EXIT.USAGE, `--${flag} names no task`);
     return numbers;
 }
@@ -131,7 +140,7 @@ export const tasksCommand = {
                     name: "tasks",
                     type: "string",
                     repeatable: true,
-                    help: "the task numbers to tick, comma-separated or once per number (one of --tasks / --green)",
+                    help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green)",
                 },
                 {
                     name: "green",
diff --git a/docs/testing.md b/docs/testing.md
index 57bd2a953..ee865c425 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -609,7 +609,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
 | `commands/workflow/fids.test.ts` | Unit | `bkit fids check / parse`: per-tracker shapes, `any` for CI_DEV, linear / jira lowercased, tracker from the main checkout's `package.json`; marker beats branch, malformed or foreign marker falls through, neither → exit 3; `bkit fids check --issue`: an issue given → the FID must embed that same id (`123-foo` with `--issue=456` fails), empty → any lowercase slug; `parse --branch` takes the suffix verbatim and links an embedded issue only when `.bkit/issues.jsonl` has a feature row for it (else `issueId` null, `upgrade-react-19` accepted, a non-slug exits 3); `featureIssueIds`; `parse --prompt-file`: per-tracker issue forms in prompt order, `ref`, a named FID, a missing file exits 7; `slugWords` / `mintFid`; `bkit fids resolve`: prompt, branch, logged (working tree and `dev`, several → exit 4), minted, then the first free `-b`, `-c`, … suffix, an IN_PROGRESS run continued, exit 5 when every name is used, exit 1 on a bad format; `bkit fids plans`: single / none (numbered files beside the plan are not plans); `bkit fids design --description-file --prompt-file`: link, own design, audit paths, exit 7 for a missing file. `bkit fids find --issue`: one (0) / none (1) / several (4), never a longer issue number, Linear case-insensitive; auto's FID entry points go through `runs context`. |
 | `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`. `bkit tests plan-check`: the group and task blocks, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, a `Task` column on the matrix and a row per test-bearing task (an unmapped row, two tasks, an undefined task, a header with no column and a test-bearing task with no row each refused), the caps from `bkit.workflows.tasks`, symbol existence skipped on a ticked task, the change-issue form example accepted. `bkit tests red` / `green`: the named test decides, never the exit code alone; a red row + snapshot per test; green prints `verdict` and a `fixable` per gap, an empty `gaps` on a clean plan. |
-| `commands/workflow/tasks.test.ts` | Unit (boundary: real temp git repo for `currency`) | `bkit tasks tick / open / currency`: `tick` marks only the named group tasks, refuses another group's task, a plan with no task blocks, a non-number and a missing file, narrows the group by `--tasks`, leaves every other plan line byte-identical, idempotent on a ticked task; `open` lists each task holding neither a `DONE` nor a `BLOCKED` line and sets `handover` only when one is open; `currency` matches a task on a moved symbol, emits no hunk outside the matched set, judges `{base}...{against}`, exits 0 with no match, refuses a plan with no task blocks. |
+| `commands/workflow/tasks.test.ts` | Unit (boundary: real temp git repo for `currency`) | `bkit tasks tick / open / currency`: `tick` marks only the named group tasks, refuses another group's task, a plan with no task blocks, a non-number and a missing file, narrows the group by `--tasks`, treats `--tasks=none` (the verify header's empty form) as nothing to tick, leaves every other plan line byte-identical, idempotent on a ticked task; `open` lists each task holding neither a `DONE` nor a `BLOCKED` line and sets `handover` only when one is open; `currency` matches a task on a moved symbol, emits no hunk outside the matched set, judges `{base}...{against}`, exits 0 with no match, refuses a plan with no task blocks. |
 | `commands/workflow/plan-blocks.test.ts` | Unit (no file-system access) | `parsePlanBlocks`: group and task order, one `TEST FIRST` test per sub-bullet, `DEPENDS ON` bare numbers, CRLF plans read like LF, markers inside a fence ignored, a fence line with an info string, an unclosed fence, the file-only form, a repeated field keeping the first, task-like text outside a block, TASK 0 and GROUP 0, duplicate task numbers, mismatched markers; `reuseInventory`, `outOfScope` and `derivedTestMatrix` read the table under their own heading, never a later section's. |
 | `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's. |
@@ -622,7 +622,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
 | `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.tracker.github.project`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows, unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
-| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`. |
+| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run. |
 | `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks, real temp git repos for `diff`) | `bkit context clamp / clamp-log / ledger-scan / diff / brief / list-blocks / run-block / finalise` (`fetch` in `context-fetch.test.ts`): both profiles read against the clamped FILE, in-place loss markers, ceiling; ranked ledger scan; `diff` writes `{base}...HEAD` without `docs/plans/**` with `--numstat` totals, `--base` narrows to a group's start sha (a `build-group-start` row's `parentSha` via `status route`), unknown base exits 5 and writes nothing, empty range writes a one-line note, past the 10000-line guard a `partial diff coverage` first line + `--stat` + the largest files first cut to 500 lines each, `topFiles` / `totalLines` ceiling, record in the clamp log; `brief` `--next` picks the first group with an open task (none open: nothing written, `group: null`), leaves out a task with a `DONE — TASK N` log line, carries one-line summaries of earlier `DEPENDS ON` tasks, the note file under Deviations, the reds already recorded, the Reuse Inventory rows and Architecture entries naming the open tasks' files (past the 8 KB work cap left out and counted), prints only path / size / group / tasks / `workBytes` / `workCap`, an unknown group exits 2; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
 | `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended). `mirror`: worktree row then the same row committed in a throwaway `origin/dev` checkout and pushed as `dev`, skipped only on `dev`, a refused push never fails the close. |
 | `.bkit/core/engine/ledgers/migrate.test.ts` | Unit | Ledger rows without `schema` rewritten through `normalize` (idempotent; malformed, non-object, blank and schema lines kept byte-for-byte; CRLF and missing final newline kept; an old line whose rewrite the file holds dropped, repeated old lines with none kept); `migrateLedgers` rewrites in place via temp file, dry run counts only, missing ledgers skipped; `isSchemaLedger` covers every ledger. |
