Enforced: true
Red: 4
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/901-challenge-merge-breaks-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with an extra leading # column" | red | failure: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with Task not last" | red | failure: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses synonym matrix column names" | red | failure: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with no Task column, naming the column to add" | red | failure: expected 'the Derived Test Matrix header has no…' to contain 'Test description \| Type \| Target file…' |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check accepts the template matrix header in any letter case" | passed-accepted | passes; accepted by the tests step: current check accepts any header with a Task column, so the case-different header already passes (guards against over-strict fix) |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/901-challenge-merge-breaks
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/901-challenge-merge-breaks
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 19.0 on 10 cores: unit limits 14000ms per test, 28000ms per hook (x2.80)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/901-challenge-merge-breaks

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (148 tests | 4 failed) 49006ms
   ✓ CI evidence test rounds (3)
     ✓ records a CI evidence round without executing a local gate 58ms
     ✓ runs local gates only after current-generation remediation or soak 1167ms
     ✓ rejects CI rounds without active matching debug selection 84ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 42ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 122ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 173ms
     ✓ no package.json, no scripts, or unparseable -> null 243ms
     ✓ debug's live-first chain stops at the deepest declared tier 128ms
     ✓ with no e2e gate, debug runs the integration gate build runs 114ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 73ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 48ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 68ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 53ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 768ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 95ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 571ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 465ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 424ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 475ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 203ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 136ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 183ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 380ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 495ms
     ✓ --gate and --log are required 40ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 394ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 382ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 461ms
     ✓ PASS is 0 failures with or without reports 533ms
     ✓ clears a previous attempt's reports before the gate runs 447ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 416ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 822ms
     ✓ a log under the outbox is named main-checkout relative in the record 793ms
     ✓ a log small enough is copied whole: not clamped, raw null 632ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 567ms
     ✓ --artifact needs --fid and --step 45ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 855ms
     ✓ numbers runs within the workflow's active run and per step 1330ms
     ✓ without --file no row is written and the output carries row null 468ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 74ms
   ✓ parseJunit (4)
     ✓ reads names, outcomes and failure messages, decoding entities 106ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 48ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 58ms
     ✓ no testcase elements -> empty 69ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 116ms
     ✓ state: no report (misspelled path) 87ms
     ✓ state: load error named after the file 49ms
     ✓ state: zero tests 80ms
     ✓ state: the named test passed (code written first) 124ms
     ✓ state: the named test skipped (filter matched nothing) 78ms
     ✓ state: other tests only 88ms
     ✓ a name only matches whole trailing segments 74ms
     ✓ green needs every case of the named test to pass 83ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 184ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 168ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 126ms
     ✓ narrows to one group's tasks 66ms
     ✓ reads no task from old-format task lines 66ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 79ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 45ms
     ✓ refuses a task that depends on itself 73ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 68ms
     ✓ reads a CRLF plan's Reuse Inventory 54ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 75ms
     ✓ the change-shape example in trackers.md parses 60ms
     ✓ change issue form example passes plan-check 77ms
     ✓ trackers.md change example shows every task field 104ms
     ✓ the shipped change form shows every plan cap with its settings default 161ms
     ✓ this repo's change form shows every plan cap with its settings default 74ms
     ✓ trackers.md shows each plan cap it names with its settings default 68ms
     ✓ README.md shows each plan cap it names with its settings default 51ms
     ✓ this repo's change form shows the caps this repo's package.json sets 45ms
   ❯ bkit tests plan-check (32)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 250ms
     ✓ states the caps the template and workflows doc name 106ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 122ms
     ✓ plan-check refuses a task without DONE WHEN 154ms
     ✓ plan-check refuses DEPENDS ON a later group 242ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 216ms
     ✓ plan-check matches a Markdown heading symbol 228ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 212ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 146ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 170ms
     ✓ plan-check skips existence on ticked tasks 151ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 186ms
     ✓ plan-check refuses an unmapped matrix row 117ms
     ✓ plan-check refuses a delete with no supersession row 186ms
     ✓ plan-check refuses a matrix row mapped to two tasks 144ms
     ✓ plan-check refuses a task no matrix row maps to 161ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 253ms
     × plan-check refuses a matrix header with no Task column, naming the column to add 138ms
     × plan-check refuses a matrix header with an extra leading # column 145ms
     × plan-check refuses a matrix header with Task not last 175ms
     × plan-check refuses synonym matrix column names 296ms
     ✓ plan-check accepts the template matrix header in any letter case 122ms
     ✓ plan-check refuses a Task cell naming an undefined task 241ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 227ms
     ✓ plan-check refuses a group with 6 tasks 119ms
     ✓ plan-check refuses a group with 26 planned tests 117ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 116ms
     ✓ plan-check report lists groups, not a verdict 116ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 138ms
     ✓ plan-check follows bkit.workflows.tasks 231ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 228ms
     ✓ a missing plan file is a usage error 65ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 64ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 62ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 101ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 73ms
     ✓ starts at the call when the name sits on its own line under an open paren 51ms
     ✓ is stack-agnostic: pytest 82ms
     ✓ is stack-agnostic: go 70ms
     ✓ is stack-agnostic: rspec 114ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 68ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 78ms
     ✓ falls back to a suite line when nothing else carries the name 53ms
     ✓ is null when the name is not in the file, or there is no file 63ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 817ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1115ms
     ✓ a planned test absent from a loaded report is a missing gap 675ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1292ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1427ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 522ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 968ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 504ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 446ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 173ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 958ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 933ms
       ✓ a later unproven result never replaces a proven red of the same lines 234ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1066ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 930ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1276ms
     ✓ green: a passed-accepted test is already landed, not a gap 590ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 626ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 308ms
     ✓ green refuses a plan with no task markers 249ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 708ms
     ✓ green: --group audits only that group's tasks 563ms
     ✓ green: --group naming a group with no tasks is refused 161ms
     ✓ green: a code fence never closed is the reason, not missing task markers 144ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1122ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1101ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 996ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1653ms
     ✓ green: lists each gap kind, with the runner output 778ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1508ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 726ms
       ✓ green clears an exception-only task from a human commit 495ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix header with no Task column, naming the column to add
AssertionError: expected 'the Derived Test Matrix header has no…' to contain 'Test description | Type | Target file…'

Expected: "Test description | Type | Target file | Task"
Received: "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to"

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1619:40
    1617|     ]);
    1618|     expect(r.json.problems[0].message).toContain("Task");
    1619|     expect(r.json.problems[0].message).toContain("Test description | T…
       |                                        ^
    1620|     expect(report().match(/`matrix`/g)).toHaveLength(1);
    1621|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix header with an extra leading # column
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1634:20
    1632|     );
    1633|     const r = await check();
    1634|     expect(r.code).toBe(1);
       |                    ^
    1635|     expect(r.json.problems).toEqual([
    1636|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses a matrix header with Task not last
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1653:20
    1651|     );
    1652|     const r = await check();
    1653|     expect(r.code).toBe(1);
       |                    ^
    1654|     expect(r.json.problems).toEqual([
    1655|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses synonym matrix column names
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1672:20
    1670|     );
    1671|     const r = await check();
    1672|     expect(r.code).toBe(1);
       |                    ^
    1673|     expect(r.json.problems).toEqual([
    1674|       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 144 passed (148)
   Start at  16:26:16
   Duration  50.29s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gJNLmy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
