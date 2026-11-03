
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tests.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests | 6 failed) 7808ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 11ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 19ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 20ms
     ✓ no package.json, no scripts, or unparseable -> null 37ms
     ✓ debug's live-first chain stops at the deepest declared tier 20ms
     ✓ with no e2e gate, debug runs the integration gate build runs 19ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 165ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 124ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 132ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 134ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 29ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 29ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 36ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 129ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 138ms
     ✓ --gate and --log are required 13ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 125ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 124ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 128ms
     ✓ PASS is 0 failures with or without reports 151ms
     ✓ clears a previous attempt's reports before the gate runs 129ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 137ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 150ms
     ✓ a log under the outbox is named main-checkout relative in the record 149ms
     ✓ a log small enough is copied whole: not clamped, raw null 123ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 117ms
     ✓ --artifact needs --fid and --step 12ms
   ✓ parseJunit (3)
     ✓ reads names, outcomes and failure messages, decoding entities 11ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 11ms
     ✓ no testcase elements -> empty 10ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing on a non-zero exit 10ms
     ✓ not a red: no report (misspelled path) 9ms
     ✓ not a red: load error named after the file 9ms
     ✓ not a red: zero tests 9ms
     ✓ not a red: the named test passed (code written first) 9ms
     ✓ not a red: the named test skipped (filter matched nothing) 9ms
     ✓ not a red: report and exit code disagree 9ms
     ✓ a name only matches whole trailing segments 8ms
     ✓ green needs every case of the named test to pass 9ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 10ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 10ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 9ms
     ✓ narrows to one group's tasks 9ms
     ✓ reads no task from old-format task lines 9ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 10ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 11ms
     ✓ refuses a task that depends on itself 9ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 9ms
     ✓ reads a CRLF plan's Reuse Inventory 9ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 10ms
     ✓ the change-shape example in trackers.md parses 9ms
     ✓ change issue form example passes plan-check 14ms
     ✓ trackers.md change example shows every task field 11ms
     ✓ the shipped change form shows every plan cap with its settings default 10ms
     ✓ this repo's change form shows every plan cap with its settings default 9ms
     ✓ trackers.md shows each plan cap it names with its settings default 10ms
     ✓ README.md shows each plan cap it names with its settings default 9ms
     ✓ this repo's change form shows the caps this repo's package.json sets 10ms
   ❯ bkit tests plan-check (27)
     ✓ states the caps the template and workflows doc name 9ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 13ms
     ✓ plan-check refuses a task without DONE WHEN 19ms
     ✓ plan-check refuses DEPENDS ON a later group 26ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 27ms
     ✓ plan-check matches a Markdown heading symbol 26ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 18ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 19ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 18ms
     ✓ plan-check skips existence on ticked tasks 19ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 27ms
     × plan-check refuses an unmapped matrix row 20ms
     × plan-check refuses a delete with no supersession row 19ms
     × plan-check refuses a matrix row mapped to two tasks 18ms
     × plan-check refuses a task no matrix row maps to 19ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 18ms
     × plan-check refuses a matrix header with no Task column, naming the column to add 18ms
     × plan-check refuses a Task cell naming an undefined task 17ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 19ms
     ✓ plan-check refuses a group with 4 tasks 19ms
     ✓ plan-check refuses a group with 16 planned tests 18ms
     ✓ plan-check accepts 3 tasks and 15 tests in one group 18ms
     ✓ plan-check report lists groups, not a verdict 19ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 33ms
     ✓ plan-check follows bkit.workflows.tasks 28ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 25ms
     ✓ a missing plan file is a usage error 9ms
   ✓ onlyAddsLines (2)
     ✓ passes added lines and whitespace-only changes 10ms
     ✓ fails an edited or a removed line 10ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 205ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 145ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 182ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 162ms
     ✓ a script that cannot run is exit 4, not a rejected red 153ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 52ms
     ✓ green refuses a plan with no task markers 37ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 175ms
     ✓ green: --group audits only that group's tasks 154ms
     ✓ green: --group naming a group with no tasks is refused 39ms
     ✓ green: a code fence never closed is the reason, not missing task markers 33ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 173ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 179ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 157ms
     ✓ green prints a verdict and a fixable per gap 180ms
     ✓ green verdict is FAIL when a gap is unfixable 150ms
     ✓ green leaves a diff-reading kind fixable null 159ms
     ✓ green prints verdict null when a gap needs a diff read 169ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 164ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 161ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 157ms
     ✓ green: every test a task names needs its own red and its own pass 173ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 303ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 281ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 221ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 170ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 243ms
       ✓ green refuses an exception-only task from a workflow step commit 95ms
       ✓ green clears an exception-only task from a human commit 78ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses an unmapped matrix row
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1119:20
    1117|     );
    1118|     const r = await check();
    1119|     expect(r.code).toBe(1);
       |                    ^
    1120|     expect(r.json.problems).toEqual([
    1121|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a delete with no supersession row
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1132:20
    1130|     write("plan.md", groupBlock(1, okTask(1, 1, 1, del)));
    1131|     let r = await check();
    1132|     expect(r.code).toBe(1);
       |                    ^
    1133|     expect(r.json.problems).toEqual([
    1134|       expect.objectContaining({ kind: "supersession", line: lineOf("pl…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix row mapped to two tasks
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1154:20
    1152|     );
    1153|     const r = await check();
    1154|     expect(r.code).toBe(1);
       |                    ^
    1155|     expect(r.json.problems).toEqual([
    1156|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a task no matrix row maps to
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1169:20
    1167|     );
    1168|     const r = await check();
    1169|     expect(r.code).toBe(1);
       |                    ^
    1170|     expect(r.json.problems).toEqual([
    1171|       expect.objectContaining({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix header with no Task column, naming the column to add
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1205:20
    1203|     );
    1204|     const r = await check();
    1205|     expect(r.code).toBe(1);
       |                    ^
    1206|     expect(r.json.problems).toEqual([
    1207|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a Task cell naming an undefined task
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1224:20
    1222|     );
    1223|     const r = await check();
    1224|     expect(r.code).toBe(1);
       |                    ^
    1225|     expect(r.json.problems).toEqual([
    1226|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 110 passed (116)
   Start at  22:48:19
   Duration  8.12s (tests 97%, transform 3%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lJfwaO/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
