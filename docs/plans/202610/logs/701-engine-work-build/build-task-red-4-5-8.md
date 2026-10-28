
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/tests.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests | 8 failed) 7874ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 11ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 19ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 19ms
     ✓ no package.json, no scripts, or unparseable -> null 37ms
     ✓ debug's live-first chain stops at the deepest declared tier 19ms
     ✓ with no e2e gate, debug runs the integration gate build runs 21ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 162ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 118ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 163ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 129ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 25ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 25ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 34ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 129ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 132ms
     ✓ --gate and --log are required 13ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 126ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 123ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 136ms
     ✓ PASS is 0 failures with or without reports 144ms
     ✓ clears a previous attempt's reports before the gate runs 131ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 118ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 166ms
     ✓ a log under the outbox is named main-checkout relative in the record 156ms
     ✓ a log small enough is copied whole: not clamped, raw null 126ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 119ms
     ✓ --artifact needs --fid and --step 15ms
   ✓ parseJunit (3)
     ✓ reads names, outcomes and failure messages, decoding entities 12ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 12ms
     ✓ no testcase elements -> empty 10ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing on a non-zero exit 9ms
     ✓ not a red: no report (misspelled path) 9ms
     ✓ not a red: load error named after the file 9ms
     ✓ not a red: zero tests 9ms
     ✓ not a red: the named test passed (code written first) 9ms
     ✓ not a red: the named test skipped (filter matched nothing) 9ms
     ✓ not a red: report and exit code disagree 9ms
     ✓ a name only matches whole trailing segments 9ms
     ✓ green needs every case of the named test to pass 9ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 10ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 9ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 9ms
     ✓ narrows to one group's tasks 9ms
     ✓ reads no task from old-format task lines 9ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 9ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 10ms
     ✓ refuses a task that depends on itself 9ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 9ms
     ✓ reads a CRLF plan's Reuse Inventory 9ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 10ms
     ✓ the change-shape example in trackers.md parses 9ms
     ✓ change issue form example passes plan-check 14ms
     ✓ trackers.md change example shows every task field 11ms
     ✓ the shipped change form shows every plan cap with its settings default 10ms
     ✓ this repo's change form shows every plan cap with its settings default 10ms
     ✓ trackers.md shows each plan cap it names with its settings default 9ms
     ✓ README.md shows each plan cap it names with its settings default 10ms
     ✓ this repo's change form shows the caps this repo's package.json sets 10ms
   ❯ bkit tests plan-check (27)
     ✓ states the caps the template and workflows doc name 10ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 12ms
     ✓ plan-check refuses a task without DONE WHEN 19ms
     ✓ plan-check refuses DEPENDS ON a later group 27ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 36ms
     ✓ plan-check matches a Markdown heading symbol 25ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 18ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 19ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 18ms
     ✓ plan-check skips existence on ticked tasks 19ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 27ms
     × plan-check refuses an unmapped matrix row 21ms
     × plan-check refuses a delete with no supersession row 19ms
     × plan-check refuses a matrix row mapped to two tasks 18ms
     × plan-check refuses a task no matrix row maps to 20ms
     × plan-check accepts a matrix that maps every test-bearing task 26ms
     × plan-check refuses a matrix header with no Task column, naming the column to add 18ms
     × plan-check refuses a Task cell naming an undefined task 17ms
     × plan-check accepts a task whose only TEST FIRST is n/a 26ms
     ✓ plan-check refuses a group with 4 tasks 27ms
     ✓ plan-check refuses a group with 16 planned tests 18ms
     ✓ plan-check accepts 3 tasks and 15 tests in one group 19ms
     ✓ plan-check report lists groups, not a verdict 19ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 17ms
     ✓ plan-check follows bkit.workflows.tasks 32ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 26ms
     ✓ a missing plan file is a usage error 10ms
   ✓ onlyAddsLines (2)
     ✓ passes added lines and whitespace-only changes 10ms
     ✓ fails an edited or a removed line 9ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 192ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 146ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 177ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 158ms
     ✓ a script that cannot run is exit 4, not a rejected red 149ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 47ms
     ✓ green refuses a plan with no task markers 37ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 173ms
     ✓ green: --group audits only that group's tasks 153ms
     ✓ green: --group naming a group with no tasks is refused 38ms
     ✓ green: a code fence never closed is the reason, not missing task markers 33ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 187ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 184ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 163ms
     ✓ green prints a verdict and a fixable per gap 191ms
     ✓ green verdict is FAIL when a gap is unfixable 142ms
     ✓ green leaves a diff-reading kind fixable null 162ms
     ✓ green prints verdict null when a gap needs a diff read 163ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 167ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 157ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 164ms
     ✓ green: every test a task names needs its own red and its own pass 185ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 306ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 288ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 209ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 166ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 262ms
       ✓ green refuses an exception-only task from a workflow step commit 95ms
       ✓ green clears an exception-only task from a human commit 78ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check accepts a matrix that maps every test-bearing task
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1199:26
    1197|     );
    1198|     const missing = await check();
    1199|     expect(missing.code).toBe(1);
       |                          ^
    1200|   });
    1201|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix header with no Task column, naming the column to add
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1213:20
    1211|     );
    1212|     const r = await check();
    1213|     expect(r.code).toBe(1);
       |                    ^
    1214|     expect(r.json.problems).toEqual([
    1215|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a Task cell naming an undefined task
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1232:20
    1230|     );
    1231|     const r = await check();
    1232|     expect(r.code).toBe(1);
       |                    ^
    1233|     expect(r.json.problems).toEqual([
    1234|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check accepts a task whose only TEST FIRST is n/a
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1262:26
    1260|     );
    1261|     const missing = await check();
    1262|     expect(missing.code).toBe(1);
       |                          ^
    1263|   });
    1264|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 108 passed (116)
   Start at  22:49:36
   Duration  8.18s (tests 97%, transform 3%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-iaWmgP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
