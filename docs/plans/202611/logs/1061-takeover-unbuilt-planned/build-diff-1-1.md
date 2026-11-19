diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index fdfacaa4f..7dd0284f1 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1809,7 +1809,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead, only when it adds lines to the test's own lines and removes none (a removal or rewrite is refused even under that line; a reason already recorded for the test does not count again), and recorded in the step row's `changedTests` (its reason, its new block, the baseline `blob` stored with `hash-object -w` and the `after` blob), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
-- **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the earlier task); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover: the earlier task's baseline gives way to the later task's red.
+- **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the nearest earlier task with a recorded red); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover whether or not the entry carries `from`: the earlier task's baseline gives way to the later task's red.
 - **The tests step's own lock:** `steps finish --step=build-plan-tests` refuses a diff that changes an earlier task's recorded test no open task of the group names: exit 11, `tests` names each, nothing committed; the orchestrator re-asks the tests step once to put them back, then Failure Path. The same route covers Step 9's test-loosened restore. Only a per-test lock binds here: an earlier group's test whose baseline has no per-test block (no line carries its name, or its file was recorded `missing`) is locked by its whole file, which cannot tell this group's own new tests in that file from an edit, so the tests step's finish leaves it out.
 - **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index ca34be45d..bd3ce8536 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -39,6 +39,7 @@ import {
   testBlock,
   testSpan,
   testsCommand,
+  touchedTests,
 } from "./tests";
 import { parseJunit, reportFailures, type JunitCase } from "./junit";
 import { writeStepRow } from "./steps";
@@ -1823,10 +1824,42 @@ describe("lockBaselines and takeovers", () => {
   it("lockBaselines leaves a test nobody took over on its own baseline", () => {
     const rows = [
       redRow(1, [entry(2, "adds a row", "v2")]),
-      redRow(2, [entry(5, "adds a row", "v5")]),
+      redRow(2, [entry(5, "adds a row", "v5", { test: "src/b.test.ts" })]),
     ];
     expect(blocks(rows)).toEqual(["2:adds a row:v2", "5:adds a row:v5"]);
   });
+
+  it("lockBaselines moves an earlier task's key onto a later task's red entry that carries no from", () => {
+    const rows = [
+      redRow(1, [entry(2, "adds a row", "old")]),
+      redRow(2, [entry(5, "adds a row", "new")]),
+    ];
+    expect(blocks(rows)).toEqual(["2:adds a row:new", "5:adds a row:new"]);
+    expect(lockBaselines(rows, null).get(redKey(2, "src/a.test.ts", "adds a row"))).toEqual(
+      expect.objectContaining({ blob: "blob-new", block: "new", origin: "blob-new" }),
+    );
+  });
+
+  it("touchedTests reports nothing when the file holds the later task's lines and its red carries no from", () => {
+    const top = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-touched-"));
+    try {
+      const NAME = "adds a row";
+      const body = (n: number) => `it('${NAME}', () => {\n  expect(rows()).toBe(${n});\n});\n`;
+      const file = path.join(top, "status.jsonl");
+      const rows = [
+        redRow(1, [entry(2, NAME, blockHash(body(1), NAME)!)]),
+        redRow(2, [entry(5, NAME, blockHash(body(2), NAME)!)]),
+      ];
+      fs.writeFileSync(file, `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`);
+      fs.mkdirSync(path.join(top, "src"));
+      fs.writeFileSync(path.join(top, "src/a.test.ts"), body(2));
+      expect(touchedTests(top, file, "build")).toEqual([]);
+      fs.writeFileSync(path.join(top, "src/a.test.ts"), body(1));
+      expect(touchedTests(top, file, "build").map((t) => t.name)).toEqual([NAME, NAME]);
+    } finally {
+      fs.rmSync(top, { recursive: true, force: true });
+    }
+  });
 });
 
 describe("taskSizes", () => {
@@ -3658,6 +3691,51 @@ describe("bkit tests red / green", () => {
       ]);
     });
 
+    /** TASK 1 (group 1), TASK 2 (group 2, never run) and TASK 3 (group 3) all name `TEST` `NAME`. */
+    const writeUnbuiltPlan = () =>
+      fs.writeFileSync(
+        path.join(cwd, "plan.md"),
+        `# Plan\n\n${[
+          groupBlock(1, TASK_1),
+          groupBlock(2, testTask(2, [[TEST, NAME]])),
+          groupBlock(3, testTask(3, [[TEST, NAME]])),
+        ].join("\n")}\n`,
+      );
+    const groupThree = (verb: "red" | "green", log: string) =>
+      run(
+        [`--file=${STATUS}`, "--workflow=build", "--group=3", "--plan=plan.md", `--log=${log}`],
+        cwd,
+        verb,
+      );
+
+    it("tests red records from as the owner when an unbuilt task between the two names the test", async () => {
+      writeUnbuiltPlan();
+      runStarted(sha());
+      await groupOneRed();
+      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+      const r = await groupThree("red", "logs/build-tests-red-3-1.md");
+      expect(r.code).toBe(0);
+      expect(r.json.tests).toEqual([
+        expect.objectContaining({ task: 3, testName: NAME, state: "red", from: 1 }),
+      ]);
+    });
+
+    it("tests green lists a takeover whose nearest earlier task has no red as taken over from the owner", async () => {
+      writeUnbuiltPlan();
+      runStarted(sha());
+      await groupOneRed();
+      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      expect((await groupThree("red", "logs/build-tests-red-3-1.md")).code).toBe(0);
+      const r = await groupThree("green", "logs/green.md");
+      expect(r.code).toBe(0);
+      expect(r.json.takenOver).toEqual([
+        expect.objectContaining({ task: 3, from: 1, test: TEST, name: NAME }),
+      ]);
+    });
+
     it("a resumed tests red skips a taken-over entry", async () => {
       runStarted(sha());
       await groupOneRed();
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 2cb1c4c66..bcbc9bbd7 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -359,7 +359,7 @@ export interface RedTest {
    * start for a takeover.
    */
   base?: string;
-  /** The earlier task this test was taken over from (`planTakeovers`), when that task has a baseline. */
+  /** The nearest earlier task naming this test that has a baseline (`planTakeovers` decides it is a takeover). */
   from?: number;
 }
 
@@ -515,9 +515,9 @@ export function lockBaselines(
             text: t.blob,
             origin: t.blob,
           });
-        // A takeover's entry, whatever its state, is the new baseline of every earlier key
-        // naming the same test: the earlier task's lock moves onto the taken-over lines.
-        if (t.from === undefined) continue;
+        // A later task's entry, whatever its state and with or without `from`, is the new
+        // baseline of every earlier key of another task naming the same test: the earlier
+        // task's lock moves onto the taken-over lines.
         for (const [k, b] of out)
           if (k !== key && b.test === t.test && sameTestName(b.testName, t.testName))
             out.set(k, {
@@ -2597,12 +2597,21 @@ export const testsCommand: CommandSpec = {
         );
         const baselines = [...proven.values()];
         const fromOf = (task: number, test: string, name: string) => {
-          const k = takeovers.get(redKey(task, test, name));
-          if (k === undefined) return undefined;
-          const owned = baselines.some(
-            (b) => b.task === k.from && b.test === k.test && sameTestName(b.testName, k.name),
-          );
-          return owned ? k.from : undefined;
+          if (!takeovers.has(redKey(task, test, name))) return undefined;
+          const at = parsed.tasks.findIndex((b) => b.task === task);
+          const posix = path.posix.normalize(test);
+          for (let i = at - 1; i >= 0; i -= 1) {
+            const earlier = parsed.tasks[i]!;
+            const names = (earlier.testFirst?.tests ?? []).some(
+              (x) => path.posix.normalize(x.test) === posix && sameTestName(x.name, name),
+            );
+            if (!names) continue;
+            const owned = baselines.some(
+              (b) => b.task === earlier.task && b.test === test && sameTestName(b.testName, name),
+            );
+            if (owned) return earlier.task;
+          }
+          return undefined;
         };
         const runStartRaw = activeRunStart(status, workflow)?.parentSha;
         const runStart = typeof runStartRaw === "string" ? runStartRaw : undefined;
diff --git a/.bkit/version b/.bkit/version
index dac5065d4..bbe6ea173 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "91fde7d879669958e8a3fffc59d379d7f4f8380b24c4d84815e99b2ca204ac21",
+    ".bkit/workflows.md": "204034f2ae02f986d93d211852bb15364763e8be3fbadf732734634c0acaf008",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index ecd878a8b..d245b8c1f 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1809,7 +1809,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead, only when it adds lines to the test's own lines and removes none (a removal or rewrite is refused even under that line; a reason already recorded for the test does not count again), and recorded in the step row's `changedTests` (its reason, its new block, the baseline `blob` stored with `hash-object -w` and the `after` blob), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
-- **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the earlier task); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover: the earlier task's baseline gives way to the later task's red.
+- **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the nearest earlier task with a recorded red); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover whether or not the entry carries `from`: the earlier task's baseline gives way to the later task's red.
 - **The tests step's own lock:** `steps finish --step=build-plan-tests` refuses a diff that changes an earlier task's recorded test no open task of the group names: exit 11, `tests` names each, nothing committed; the orchestrator re-asks the tests step once to put them back, then Failure Path. The same route covers Step 9's test-loosened restore. Only a per-test lock binds here: an earlier group's test whose baseline has no per-test block (no line carries its name, or its file was recorded `missing`) is locked by its whole file, which cannot tell this group's own new tests in that file from an edit, so the tests step's finish leaves it out.
 - **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 54eaae156..03b2ba7c4 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -316,10 +316,9 @@ export function lockBaselines(rows, planned) {
                         text: t.blob,
                         origin: t.blob,
                     });
-                // A takeover's entry, whatever its state, is the new baseline of every earlier key
-                // naming the same test: the earlier task's lock moves onto the taken-over lines.
-                if (t.from === undefined)
-                    continue;
+                // A later task's entry, whatever its state and with or without `from`, is the new
+                // baseline of every earlier key of another task naming the same test: the earlier
+                // task's lock moves onto the taken-over lines.
                 for (const [k, b] of out)
                     if (k !== key && b.test === t.test && sameTestName(b.testName, t.testName))
                         out.set(k, {
@@ -1995,11 +1994,20 @@ export const testsCommand = {
                 const takeovers = new Map(planTakeovers(planText).map((k) => [redKey(k.task, k.test, k.name), k]));
                 const baselines = [...proven.values()];
                 const fromOf = (task, test, name) => {
-                    const k = takeovers.get(redKey(task, test, name));
-                    if (k === undefined)
+                    if (!takeovers.has(redKey(task, test, name)))
                         return undefined;
-                    const owned = baselines.some((b) => b.task === k.from && b.test === k.test && sameTestName(b.testName, k.name));
-                    return owned ? k.from : undefined;
+                    const at = parsed.tasks.findIndex((b) => b.task === task);
+                    const posix = path.posix.normalize(test);
+                    for (let i = at - 1; i >= 0; i -= 1) {
+                        const earlier = parsed.tasks[i];
+                        const names = (earlier.testFirst?.tests ?? []).some((x) => path.posix.normalize(x.test) === posix && sameTestName(x.name, name));
+                        if (!names)
+                            continue;
+                        const owned = baselines.some((b) => b.task === earlier.task && b.test === test && sameTestName(b.testName, name));
+                        if (owned)
+                            return earlier.task;
+                    }
+                    return undefined;
                 };
                 const runStartRaw = activeRunStart(status, workflow)?.parentSha;
                 const runStart = typeof runStartRaw === "string" ? runStartRaw : undefined;
diff --git a/docs/testing.md b/docs/testing.md
index 07e777123..405e60e45 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -507,7 +507,7 @@ Each tier lists the rule to follow, then a **Not:** line naming the failure the
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts when the named test ran and failed, or when its file failed to load: no case carries the planned name, and the report holds no case, or only non-passing cases whose name contains the file's stem (the tests step writes no source, so an import of unwritten code is the expected shape of a red); a green only when it ran and passed.
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
 - **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through only when the change adds lines and removes none (a removed or rewritten line is refused even under a `BLOCKED` line), verify reads the added lines of that change and raises `test-loosened` for one that disables or loosens the test (an early `return`, a skip, a reassignment), and the owner answers the change, shown as a diff, at the end of the build.
-- **A later task can take a test over:** when a later task changes what an earlier task's planned test asserts, its `TEST FIRST` names that same test, and the tests step rewrites it to fail until the later task's code exists. The red records it with the earlier task as `from`; one that passes after the rewrite is `taken-over`, listed under `takenOver`, never a gap. When a code step finds the contradiction mid-build, its `steps finish` adds the takeover task itself, and the build records the task's test before the next verify, with no owner pause.
+- **A later task can take a test over:** when a later task changes what an earlier task's planned test asserts, its `TEST FIRST` names that same test, and the tests step rewrites it to fail until the later task's code exists. The red records the nearest earlier task with a recorded red as `from`; one that passes after the rewrite is `taken-over`, listed under `takenOver`, never a gap. When a code step finds the contradiction mid-build, its `steps finish` adds the takeover task itself, and the build records the task's test before the next verify, with no owner pause.
 
 ## Design assertions are a dimension, not a lane
 
