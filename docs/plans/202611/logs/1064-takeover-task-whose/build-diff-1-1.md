diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 7dd0284f1..8d22c8e4e 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1811,7 +1811,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the nearest earlier task with a recorded red); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover whether or not the entry carries `from`: the earlier task's baseline gives way to the later task's red.
 - **The tests step's own lock:** `steps finish --step=build-plan-tests` refuses a diff that changes an earlier task's recorded test no open task of the group names: exit 11, `tests` names each, nothing committed; the orchestrator re-asks the tests step once to put them back, then Failure Path. The same route covers Step 9's test-loosened restore. Only a per-test lock binds here: an earlier group's test whose baseline has no per-test block (no line carries its name, or its file was recorded `missing`) is locked by its whole file, which cannot tell this group's own new tests in that file from an edit, so the tests step's finish leaves it out.
-- **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
+- **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused while its test has no red record, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 5) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 25) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). A group is one tests agent's work and then one code agent's work, so the code agent spends no turns on tests and a group carries more tasks than one agent writing both could; a bigger group still overflows a context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-tests, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
 - **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A task group is `<!-- bkit:group N start -->`, `### TASK GROUP N: {title}` (`### GROUP N: {title}` is read too) … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. The readers beside it — `reuseInventory`, `derivedTestMatrix` (its `Task` column) and `supersessionInventory` — read the plan's `Reuse Inventory`, `Derived Test Matrix` and `Supersession Inventory` tables; a `CREATE` with no new row, a matrix row naming no task / an undefined task / two tasks or a test-bearing task no row names, and a `DELETE` with no `Supersession Inventory` row are each plan-check problems. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 8c98864d8..612b274d9 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -844,6 +844,47 @@ describe("bkit tasks takeover", () => {
     expect(rows()).toHaveLength(1);
   });
 
+  /** The tests step's red row for the takeover task, as `steps finish` records it. */
+  const recordRed = (group: number, task: number, name: string) =>
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      `${JSON.stringify({
+        type: "step-done",
+        workflow: "build",
+        step: "build-tests-red",
+        status: "DONE",
+        group,
+        tests: [{ task, test: TEST, testName: name, state: "red", blob: null }],
+      })}\n`,
+    );
+
+  it("addTakeoverTasks adds a new task when the open takeover task already has a red record", async () => {
+    setup();
+    expect(takeover("adds a row")).toEqual([3]);
+    recordRed(3, 3, "adds a row");
+    expect(takeover("adds a row")).toEqual([4]);
+    const text = plan();
+    expect(text).toContain("- [ ] **TASK 4:** Take over `adds a row` from TASK 1");
+    expect(checkPlanText(text).problems).toEqual([]);
+    expect(rows()).toEqual([
+      expect.objectContaining({ task: 3, name: "adds a row" }),
+      expect.objectContaining({ task: 4, name: "adds a row" }),
+    ]);
+    const p = (await pending()).json;
+    expect(p.pending).toEqual(expect.objectContaining({ tasks: [4] }));
+  });
+
+  it("addTakeoverTasks reuses the new task on a repeat call after a recorded takeover", () => {
+    setup();
+    expect(takeover("adds a row")).toEqual([3]);
+    recordRed(3, 3, "adds a row");
+    expect(takeover("adds a row")).toEqual([4]);
+    const once = plan();
+    expect(takeover("adds a row")).toEqual([4]);
+    expect(plan()).toBe(once);
+    expect(rows()).toHaveLength(2);
+  });
+
   it("addTakeoverTasks writes only the missing row when a run stopped after the plan write", () => {
     setup();
     takeover("adds a row");
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index dbe556b44..ccb663175 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -350,7 +350,8 @@ export interface TakeoverEntry {
 /**
  * Adds one pure takeover task per entry to the plan at `planFile`, plus its Derived Test
  * Matrix row and its `build-takeover` row in `statusPath`. Safe to repeat: an open takeover
- * task whose `TEST FIRST` already names the entry's file and name is reused, and only a
+ * task whose `TEST FIRST` already names the entry's file and name is reused while its test has
+ * no red record for that task (a recorded test is rewritten by a new takeover task), and only a
  * missing row is written, so a second run or a run stopped between the two writes leaves one
  * task and one row. The task goes into the plan's last group while that group is a takeover
  * group whose tests half has not run, else into a new last group. Returns the takeover task
@@ -368,12 +369,16 @@ export function addTakeoverTasks(
     const test = path.posix.normalize(e.test);
     const text = fs.readFileSync(planFile, "utf-8");
     const plan = parsePlanBlocks(text);
+    const reds = redEntries(statusPath, "build");
     const open = plan.tasks.find(
       (t) =>
         !t.done &&
         t.title.startsWith("Take over ") &&
         (t.testFirst?.tests ?? []).some(
-          (x) => path.posix.normalize(x.test) === test && sameTestName(x.name, e.name),
+          (x) =>
+            path.posix.normalize(x.test) === test &&
+            sameTestName(x.name, e.name) &&
+            !reds.has(redKey(t.task, x.test, x.name)),
         ),
     );
     let n: number;
diff --git a/.bkit/version b/.bkit/version
index bbe6ea173..25c544642 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -211,7 +211,7 @@
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
     ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
-    ".bkit/workflows.md": "204034f2ae02f986d93d211852bb15364763e8be3fbadf732734634c0acaf008",
+    ".bkit/workflows.md": "c288d47168c7f7d38fc3ce4bb5a1c5b40bee655dd20ab137e294e7494b559aac",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index d245b8c1f..1b9877cf3 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1811,7 +1811,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Taking over an earlier task's test:** a later task whose `TEST FIRST` names the same test file and name as an earlier task's takes that test over (`tests plan-check` lists it under `takeovers`, reported only; a bare test name matches a suite path on its last segment, while two suite paths match only whole). The tests brief lists it under `Planned tests taken over from earlier tasks`, and the tests step may rewrite it, old expectations included. Its red entry carries `from` (the nearest earlier task with a recorded red); a takeover that passes after the rewrite is recorded `taken-over`, and `tests green` lists it under `takenOver` with its diff against the earlier task's red, never as a gap or `unproven`. The lock follows the takeover whether or not the entry carries `from`: the earlier task's baseline gives way to the later task's red.
 - **The tests step's own lock:** `steps finish --step=build-plan-tests` refuses a diff that changes an earlier task's recorded test no open task of the group names: exit 11, `tests` names each, nothing committed; the orchestrator re-asks the tests step once to put them back, then Failure Path. The same route covers Step 9's test-loosened restore. Only a per-test lock binds here: an earlier group's test whose baseline has no per-test block (no line carries its name, or its file was recorded `missing`) is locked by its whole file, which cannot tell this group's own new tests in that file from an edit, so the tests step's finish leaves it out.
-- **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
+- **A takeover added mid-build:** a code step whose `BLOCKED` line names a test a ticked (`[x]`) task owns, with a change that removes or rewrites its lines, is contradicted. `steps finish` itself adds one takeover task per test (its `TEST FIRST` that test, `DEPENDS ON` the contradicting task when a `TASK N` line names one) in a new last group `Planned tests the build took over`, or in that group while its tests are unrecorded, plus a `Derived Test Matrix` row with the tier the file's name gives and a `build-takeover` status row. A chain of takeovers gives one entry, from the latest owner. The write is safe to repeat: an open takeover task naming the same file and name is reused while its test has no red record, and only a missing row is written. The finish still exits 11, lists the test in `tests` and in `contradicts` (`{test, name, from, task, takeover}`), and its `problem` tells the agent to put the test back, since a BLOCKED line does not keep it; the workflow's plain exit-11 re-ask carries that `problem`. Step 8 and a resumed gate re-run run § Pending takeovers (`tasks takeover --pending`, which runs Step 7 sub-steps 3-6 for the group) first. A holistic fix round goes back through Step 7, which runs a takeover group it added (its code step, verify and tick) and goes straight to Step 10 when no group is open. No owner pause: the summary lists each test that changed hands under `## Tests that changed hands`, saying whether its red proved it failing (`red`), changed hands without a failing run (`taken-over`), updated a passing existing test (`updated`), or was not recorded red.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 5) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 25) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). A group is one tests agent's work and then one code agent's work, so the code agent spends no turns on tests and a group carries more tasks than one agent writing both could; a bigger group still overflows a context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-tests, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
 - **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A task group is `<!-- bkit:group N start -->`, `### TASK GROUP N: {title}` (`### GROUP N: {title}` is read too) … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. The readers beside it — `reuseInventory`, `derivedTestMatrix` (its `Task` column) and `supersessionInventory` — read the plan's `Reuse Inventory`, `Derived Test Matrix` and `Supersession Inventory` tables; a `CREATE` with no new row, a matrix row naming no task / an undefined task / two tasks or a test-bearing task no row names, and a `DELETE` with no `Supersession Inventory` row are each plan-check problems. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 270f84c69..0e6a72cf9 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -261,7 +261,8 @@ function withTakeoverTask(text, task, n, group, into, row) {
 /**
  * Adds one pure takeover task per entry to the plan at `planFile`, plus its Derived Test
  * Matrix row and its `build-takeover` row in `statusPath`. Safe to repeat: an open takeover
- * task whose `TEST FIRST` already names the entry's file and name is reused, and only a
+ * task whose `TEST FIRST` already names the entry's file and name is reused while its test has
+ * no red record for that task (a recorded test is rewritten by a new takeover task), and only a
  * missing row is written, so a second run or a run stopped between the two writes leaves one
  * task and one row. The task goes into the plan's last group while that group is a takeover
  * group whose tests half has not run, else into a new last group. Returns the takeover task
@@ -273,9 +274,12 @@ export function addTakeoverTasks(cwd, planFile, statusPath, entries, log) {
         const test = path.posix.normalize(e.test);
         const text = fs.readFileSync(planFile, "utf-8");
         const plan = parsePlanBlocks(text);
+        const reds = redEntries(statusPath, "build");
         const open = plan.tasks.find((t) => !t.done &&
             t.title.startsWith("Take over ") &&
-            (t.testFirst?.tests ?? []).some((x) => path.posix.normalize(x.test) === test && sameTestName(x.name, e.name)));
+            (t.testFirst?.tests ?? []).some((x) => path.posix.normalize(x.test) === test &&
+                sameTestName(x.name, e.name) &&
+                !reds.has(redKey(t.task, x.test, x.name))));
         let n;
         if (open !== undefined) {
             n = open.task;
