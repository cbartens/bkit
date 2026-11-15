Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 2

Plan: `docs/plans/202611/951-build-repeat-whole-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a staged rename of code into a bookkeeping path records no receipt" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 2.9 on 10 cores: unit limits 5950ms per test, 11900ms per hook (x1.19)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (167 tests | 1 failed) 18122ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 16ms
     ✓ records the selected run's failed job count 13ms
     ✓ runs local gates only after current-generation remediation or soak 557ms
     ✓ rejects CI rounds without active matching debug selection 14ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 12ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 22ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 23ms
     ✓ no package.json, no scripts, or unparseable -> null 43ms
     ✓ debug's live-first chain stops at the deepest declared tier 24ms
     ✓ with no e2e gate, debug runs the integration gate build runs 25ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 12ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 13ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 13ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 13ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 216ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 15ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 189ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 182ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 181ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 176ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 68ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 28ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 46ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 180ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 220ms
     ✓ --gate and --log are required 12ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 199ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 177ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 250ms
     ✓ PASS is 0 failures with or without reports 235ms
     ✓ clears a previous attempt's reports before the gate runs 181ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 178ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 217ms
     ✓ a log under the outbox is named main-checkout relative in the record 279ms
     ✓ a log small enough is copied whole: not clamped, raw null 191ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 178ms
     ✓ --artifact needs --fid and --step 13ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 299ms
     ✓ numbers runs within the workflow's active run and per step 324ms
     ✓ without --file no row is written and the output carries row null 209ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 16ms
   ✓ bkit tests run --changed-since (6)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 348ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 248ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 86ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 275ms
     ✓ changed-since refuses a sha that names no commit 91ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 329ms
   ❯ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 256ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 304ms
     ✓ a failing required push gate leaves the failed marker 228ms
     ✓ uncommitted code blocks the receipt until it is committed 372ms
     × a staged rename of code into a bookkeeping path records no receipt 357ms
     ✓ only the required push gate records a receipt 298ms
     ✓ a tests-lock wait records no receipt and the re-run after the lock frees does 351ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 13ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 12ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 12ms
     ✓ keeps each case's classname and file attribute 12ms
     ✓ no testcase elements -> empty 12ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 13ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 13ms
     ✓ state: no report (misspelled path) 13ms
     ✓ state: load error named after the file 12ms
     ✓ state: zero tests 12ms
     ✓ state: the named test passed (code written first) 12ms
     ✓ state: the named test skipped (filter matched nothing) 12ms
     ✓ state: other tests only 13ms
     ✓ a name only matches whole trailing segments 15ms
     ✓ green needs every case of the named test to pass 13ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 14ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 13ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 14ms
     ✓ narrows to one group's tasks 13ms
     ✓ reads no task from old-format task lines 13ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 13ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 13ms
     ✓ refuses a task that depends on itself 13ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 15ms
     ✓ reads a CRLF plan's Reuse Inventory 13ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 13ms
     ✓ the change-shape example in trackers.md parses 13ms
     ✓ change issue form example passes plan-check 16ms
     ✓ trackers.md change example shows every task field 13ms
     ✓ the shipped change form shows every plan cap with its settings default 12ms
     ✓ this repo's change form shows every plan cap with its settings default 13ms
     ✓ trackers.md shows each plan cap it names with its settings default 12ms
     ✓ README.md shows each plan cap it names with its settings default 14ms
     ✓ this repo's change form shows the caps this repo's package.json sets 13ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 51ms
     ✓ states the caps the template and workflows doc name 12ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 16ms
     ✓ plan-check refuses a task without DONE WHEN 31ms
     ✓ plan-check refuses DEPENDS ON a later group 47ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 47ms
     ✓ plan-check matches a Markdown heading symbol 51ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 30ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 30ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 28ms
     ✓ plan-check skips existence on ticked tasks 29ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 47ms
     ✓ plan-check refuses an unmapped matrix row 29ms
     ✓ plan-check refuses a delete with no supersession row 48ms
     ✓ plan-check refuses a matrix row mapped to two tasks 30ms
     ✓ plan-check refuses rows left in the old column order under the template header 29ms
     ✓ plan-check refuses rows with an extra cell under the template header 32ms
     ✓ plan-check refuses a task no matrix row maps to 32ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 51ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 41ms
     ✓ plan-check refuses a matrix header with an extra leading # column 33ms
     ✓ plan-check refuses a matrix header with Task not last 31ms
     ✓ plan-check refuses synonym matrix column names 30ms
     ✓ plan-check refuses a matrix header with no closing pipe 31ms
     ✓ plan-check accepts the template matrix header in any letter case 34ms
     ✓ plan-check refuses a Task cell naming an undefined task 32ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 48ms
     ✓ plan-check refuses a group with 6 tasks 29ms
     ✓ plan-check refuses a group with 26 planned tests 28ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 30ms
     ✓ plan-check report lists groups, not a verdict 32ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 29ms
     ✓ plan-check follows bkit.workflows.tasks 48ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 46ms
     ✓ a missing plan file is a usage error 12ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 12ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 12ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 12ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 12ms
     ✓ starts at the call when the name sits on its own line under an open paren 11ms
     ✓ is stack-agnostic: pytest 12ms
     ✓ is stack-agnostic: go 11ms
     ✓ is stack-agnostic: rspec 11ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 12ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 11ms
     ✓ falls back to a suite line when nothing else carries the name 12ms
     ✓ is null when the name is not in the file, or there is no file 11ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 278ms
     ✓ a planned test that passes is a vacuous gap, exit 1 204ms
     ✓ a planned test absent from a loaded report is a missing gap 214ms
     ✓ a file that fails to load is a red of kind red-not-loaded 263ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 270ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 80ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 349ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 234ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 219ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 61ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 402ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 292ms
       ✓ a later unproven result never replaces a proven red of the same lines 40ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 366ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 305ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 394ms
     ✓ green: a passed-accepted test is already landed, not a gap 313ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 241ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 68ms
     ✓ green refuses a plan with no task markers 61ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 281ms
     ✓ green: --group audits only that group's tasks 233ms
     ✓ green: --group naming a group with no tasks is refused 50ms
     ✓ green: a code fence never closed is the reason, not missing task markers 44ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 297ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 325ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 262ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 320ms
     ✓ green: lists each gap kind, with the runner output 257ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 550ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 156ms
       ✓ green clears an exception-only task from a human commit 108ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > a staged rename of code into a bookkeeping path records no receipt
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1014:43
    1012|       const r = await run(gateArgs(DEEP));
    1013|       expect(r.code).toBe(0);
    1014|       expect(fs.existsSync(receipt(sha))).toBe(false);
       |                                           ^
    1015|     },
    1016|     timeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 166 passed (167)
   Start at  19:54:14
   Duration  18.31s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tYSZ3b/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
