Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/901-challenge-merge-breaks-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses rows left in the old column order under the template header" | red | failure: expected +0 to be 1 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses rows with an extra cell under the template header" | red | failure: expected +0 to be 1 // Object.is equality |

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

[test-timeout-budget] load average 2.6 on 10 cores: unit limits 5800ms per test, 11600ms per hook (x1.16)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/901-challenge-merge-breaks

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (151 tests | 2 failed) 13572ms
   ✓ CI evidence test rounds (3)
     ✓ records a CI evidence round without executing a local gate 17ms
     ✓ runs local gates only after current-generation remediation or soak 475ms
     ✓ rejects CI rounds without active matching debug selection 15ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 12ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 23ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 23ms
     ✓ no package.json, no scripts, or unparseable -> null 44ms
     ✓ debug's live-first chain stops at the deepest declared tier 25ms
     ✓ with no e2e gate, debug runs the integration gate build runs 23ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 12ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 12ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 12ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 12ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 395ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 18ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 165ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 161ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 160ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 157ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 50ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 29ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 46ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 176ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 198ms
     ✓ --gate and --log are required 13ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 164ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 160ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 158ms
     ✓ PASS is 0 failures with or without reports 196ms
     ✓ clears a previous attempt's reports before the gate runs 158ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 157ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 193ms
     ✓ a log under the outbox is named main-checkout relative in the record 183ms
     ✓ a log small enough is copied whole: not clamped, raw null 163ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 166ms
     ✓ --artifact needs --fid and --step 14ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 237ms
     ✓ numbers runs within the workflow's active run and per step 224ms
     ✓ without --file no row is written and the output carries row null 150ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 14ms
   ✓ parseJunit (4)
     ✓ reads names, outcomes and failure messages, decoding entities 13ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 13ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 13ms
     ✓ no testcase elements -> empty 13ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 13ms
     ✓ state: no report (misspelled path) 13ms
     ✓ state: load error named after the file 13ms
     ✓ state: zero tests 13ms
     ✓ state: the named test passed (code written first) 14ms
     ✓ state: the named test skipped (filter matched nothing) 14ms
     ✓ state: other tests only 13ms
     ✓ a name only matches whole trailing segments 13ms
     ✓ green needs every case of the named test to pass 13ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 14ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 14ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 14ms
     ✓ narrows to one group's tasks 14ms
     ✓ reads no task from old-format task lines 14ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 14ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 14ms
     ✓ refuses a task that depends on itself 18ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 15ms
     ✓ reads a CRLF plan's Reuse Inventory 17ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 15ms
     ✓ the change-shape example in trackers.md parses 14ms
     ✓ change issue form example passes plan-check 19ms
     ✓ trackers.md change example shows every task field 16ms
     ✓ the shipped change form shows every plan cap with its settings default 14ms
     ✓ this repo's change form shows every plan cap with its settings default 14ms
     ✓ trackers.md shows each plan cap it names with its settings default 13ms
     ✓ README.md shows each plan cap it names with its settings default 13ms
     ✓ this repo's change form shows the caps this repo's package.json sets 14ms
   ❯ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 56ms
     ✓ states the caps the template and workflows doc name 13ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 25ms
     ✓ plan-check refuses a task without DONE WHEN 36ms
     ✓ plan-check refuses DEPENDS ON a later group 54ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 52ms
     ✓ plan-check matches a Markdown heading symbol 52ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 36ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 34ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 37ms
     ✓ plan-check skips existence on ticked tasks 35ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 48ms
     ✓ plan-check refuses an unmapped matrix row 32ms
     ✓ plan-check refuses a delete with no supersession row 55ms
     ✓ plan-check refuses a matrix row mapped to two tasks 32ms
     × plan-check refuses rows left in the old column order under the template header 36ms
     × plan-check refuses rows with an extra cell under the template header 34ms
     ✓ plan-check refuses a task no matrix row maps to 31ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 55ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 29ms
     ✓ plan-check refuses a matrix header with an extra leading # column 30ms
     ✓ plan-check refuses a matrix header with Task not last 33ms
     ✓ plan-check refuses synonym matrix column names 32ms
     ✓ plan-check refuses a matrix header with no closing pipe 35ms
     ✓ plan-check accepts the template matrix header in any letter case 34ms
     ✓ plan-check refuses a Task cell naming an undefined task 33ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 57ms
     ✓ plan-check refuses a group with 6 tasks 38ms
     ✓ plan-check refuses a group with 26 planned tests 33ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 35ms
     ✓ plan-check report lists groups, not a verdict 32ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 30ms
     ✓ plan-check follows bkit.workflows.tasks 50ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 48ms
     ✓ a missing plan file is a usage error 13ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 13ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 13ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 11ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 14ms
     ✓ starts at the call when the name sits on its own line under an open paren 12ms
     ✓ is stack-agnostic: pytest 31ms
     ✓ is stack-agnostic: go 42ms
     ✓ is stack-agnostic: rspec 23ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 14ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 11ms
     ✓ falls back to a suite line when nothing else carries the name 12ms
     ✓ is null when the name is not in the file, or there is no file 15ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 258ms
     ✓ a planned test that passes is a vacuous gap, exit 1 241ms
     ✓ a planned test absent from a loaded report is a missing gap 200ms
     ✓ a file that fails to load is a red of kind red-not-loaded 316ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 250ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 91ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 403ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 192ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 193ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 64ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 369ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 269ms
       ✓ a later unproven result never replaces a proven red of the same lines 41ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 347ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 289ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 356ms
     ✓ green: a passed-accepted test is already landed, not a gap 238ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 221ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 64ms
     ✓ green refuses a plan with no task markers 54ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 247ms
     ✓ green: --group audits only that group's tasks 208ms
     ✓ green: --group naming a group with no tasks is refused 62ms
     ✓ green: a code fence never closed is the reason, not missing task markers 46ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 265ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 275ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 235ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 289ms
     ✓ green: lists each gap kind, with the runner output 236ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 413ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 142ms
       ✓ green clears an exception-only task from a human commit 111ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses rows left in the old column order under the template header
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1574:20
    1572|     );
    1573|     const r = await check();
    1574|     expect(r.code).toBe(1);
       |                    ^
    1575|     const lines = r.json.problems
    1576|       .filter((p: { kind: string }) => p.kind === "matrix")

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests plan-check > plan-check refuses rows with an extra cell under the template header
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1593:20
    1591|     );
    1592|     const r = await check();
    1593|     expect(r.code).toBe(1);
       |                    ^
    1594|     const lines = r.json.problems
    1595|       .filter((p: { kind: string }) => p.kind === "matrix")

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 149 passed (151)
   Start at  15:27:39
   Duration  13.76s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fSFhgv/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
