Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap" | red | failure: expected undefined to deeply equal [ { task: 1, …(3) } ] |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a changed test the plan no longer names out of changed" | red | failure: expected undefined to deeply equal [ { task: 1, …(3) } ] |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green prints an empty changed list and no Changed by a code step section when no code step changed a test" | red | failure: expected undefined to deeply equal [] |
| 4 | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` "a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed" | red | failure: expected undefined to deeply equal [ { task: 1, …(3) } ] |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "an exit 11 re-ask offers the BLOCKED test line the engine reads" | red | failure: exit 11 re-ask 1 offers no TASK test line form: expected null not to be null |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Step 15 asks once about planned tests a code step changed, before the unproven ones" | red | failure: expected '1. Ask once about the planned tests t…' to contain '`Question: CHANGED_TESTS`' |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item offers Accept or Stop, recommended Accept" | red | failure: § Decision Pause has no CHANGED_TESTS item rule: expected undefined to be defined |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the execute prompt's BLOCKED test line is one the engine reads" | red | failure: no line says a code change that forces a planned-test edit keeps the edit: expected -1 to be greater than or equal to 0 |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the remediate prompt's BLOCKED test line is one the engine reads" | red | failure: no line says a code change that forces a planned-test edit keeps the edit: expected -1 to be greater than or equal to 0 |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt notes a planned test a code step changed and raises no gap" | red | failure: no `Changed by a code step` section rule: expected -1 to be greater than or equal to 0 |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 8.9 on 10 cores: unit limits 8950ms per test, 17900ms per hook (x1.79)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (160 tests | 3 failed) 26086ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 29ms
     ✓ records the selected run's failed job count 24ms
     ✓ runs local gates only after current-generation remediation or soak 561ms
     ✓ rejects CI rounds without active matching debug selection 24ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 19ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 40ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 39ms
     ✓ no package.json, no scripts, or unparseable -> null 85ms
     ✓ debug's live-first chain stops at the deepest declared tier 38ms
     ✓ with no e2e gate, debug runs the integration gate build runs 37ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 20ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 20ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 21ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 22ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 393ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 20ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 342ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 266ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 267ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 540ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 85ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 57ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 82ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 257ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 319ms
     ✓ --gate and --log are required 26ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 263ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 256ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 551ms
     ✓ PASS is 0 failures with or without reports 326ms
     ✓ clears a previous attempt's reports before the gate runs 262ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 253ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 328ms
     ✓ a log under the outbox is named main-checkout relative in the record 301ms
     ✓ a log small enough is copied whole: not clamped, raw null 255ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 244ms
     ✓ --artifact needs --fid and --step 22ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 387ms
     ✓ numbers runs within the workflow's active run and per step 399ms
     ✓ without --file no row is written and the output carries row null 250ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 24ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 22ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 22ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 24ms
     ✓ keeps each case's classname and file attribute 20ms
     ✓ no testcase elements -> empty 19ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 23ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 20ms
     ✓ state: no report (misspelled path) 27ms
     ✓ state: load error named after the file 32ms
     ✓ state: zero tests 27ms
     ✓ state: the named test passed (code written first) 25ms
     ✓ state: the named test skipped (filter matched nothing) 21ms
     ✓ state: other tests only 21ms
     ✓ a name only matches whole trailing segments 22ms
     ✓ green needs every case of the named test to pass 24ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 25ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 21ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 21ms
     ✓ narrows to one group's tasks 21ms
     ✓ reads no task from old-format task lines 20ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 19ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 23ms
     ✓ refuses a task that depends on itself 23ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 20ms
     ✓ reads a CRLF plan's Reuse Inventory 31ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 25ms
     ✓ the change-shape example in trackers.md parses 26ms
     ✓ change issue form example passes plan-check 32ms
     ✓ trackers.md change example shows every task field 25ms
     ✓ the shipped change form shows every plan cap with its settings default 26ms
     ✓ this repo's change form shows every plan cap with its settings default 25ms
     ✓ trackers.md shows each plan cap it names with its settings default 25ms
     ✓ README.md shows each plan cap it names with its settings default 24ms
     ✓ this repo's change form shows the caps this repo's package.json sets 22ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 82ms
     ✓ states the caps the template and workflows doc name 23ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 41ms
     ✓ plan-check refuses a task without DONE WHEN 61ms
     ✓ plan-check refuses DEPENDS ON a later group 79ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 81ms
     ✓ plan-check matches a Markdown heading symbol 81ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 52ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 50ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 54ms
     ✓ plan-check skips existence on ticked tasks 49ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 75ms
     ✓ plan-check refuses an unmapped matrix row 49ms
     ✓ plan-check refuses a delete with no supersession row 84ms
     ✓ plan-check refuses a matrix row mapped to two tasks 52ms
     ✓ plan-check refuses rows left in the old column order under the template header 63ms
     ✓ plan-check refuses rows with an extra cell under the template header 85ms
     ✓ plan-check refuses a task no matrix row maps to 57ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 82ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 51ms
     ✓ plan-check refuses a matrix header with an extra leading # column 50ms
     ✓ plan-check refuses a matrix header with Task not last 53ms
     ✓ plan-check refuses synonym matrix column names 116ms
     ✓ plan-check refuses a matrix header with no closing pipe 79ms
     ✓ plan-check accepts the template matrix header in any letter case 55ms
     ✓ plan-check refuses a Task cell naming an undefined task 73ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 127ms
     ✓ plan-check refuses a group with 6 tasks 97ms
     ✓ plan-check refuses a group with 26 planned tests 109ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 71ms
     ✓ plan-check report lists groups, not a verdict 60ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 67ms
     ✓ plan-check follows bkit.workflows.tasks 90ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 81ms
     ✓ a missing plan file is a usage error 22ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 21ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 21ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 20ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 20ms
     ✓ starts at the call when the name sits on its own line under an open paren 20ms
     ✓ is stack-agnostic: pytest 20ms
     ✓ is stack-agnostic: go 23ms
     ✓ is stack-agnostic: rspec 22ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 21ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 26ms
     ✓ falls back to a suite line when nothing else carries the name 21ms
     ✓ is null when the name is not in the file, or there is no file 21ms
   ✓ blockedTests (2)
     ✓ reads the file, name and reason from a TASK or Gap BLOCKED test line 22ms
     ✓ ignores a BLOCKED line that names no test 21ms
   ❯ bkit tests red / green (36)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 386ms
     ✓ a planned test that passes is a vacuous gap, exit 1 338ms
     ✓ a planned test absent from a loaded report is a missing gap 317ms
     ✓ a file that fails to load is a red of kind red-not-loaded 449ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 445ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 192ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 625ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 464ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 435ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 149ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 760ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 366ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 462ms
       ✓ a later unproven result never replaces a proven red of the same lines 70ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 573ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 497ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 665ms
     ✓ green: a passed-accepted test is already landed, not a gap 414ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 422ms
     ❯ tests a code step changed (3)
       × green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 449ms
       × green leaves a changed test the plan no longer names out of changed 588ms
       × green prints an empty changed list and no Changed by a code step section when no code step changed a test 803ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 97ms
     ✓ green refuses a plan with no task markers 93ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 423ms
     ✓ green: --group audits only that group's tasks 410ms
     ✓ green: --group naming a group with no tasks is refused 84ms
     ✓ green: a code fence never closed is the reason, not missing task markers 79ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 508ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 523ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 408ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 539ms
     ✓ green: lists each gap kind, with the runner output 607ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 767ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 238ms
       ✓ green clears an exception-only task from a human commit 181ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap
AssertionError: expected undefined to deeply equal [ { task: 1, …(3) } ]

- Expected:
[
  {
    "name": "keeps a value inside the range",
    "reason": "new setup line",
    "task": 1,
    "test": "src/clamp.test.ts",
  },
]

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2756:30
    2754|       expect(r.code).toBe(0);
    2755|       expect(r.json.gaps).toEqual([]);
    2756|       expect(r.json.changed).toEqual([
       |                              ^
    2757|         { task: 1, test: TEST, name: NAME, reason: "new setup line" },
    2758|       ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green leaves a changed test the plan no longer names out of changed
AssertionError: expected undefined to deeply equal [ { task: 1, …(3) } ]

- Expected:
[
  {
    "name": "keeps a value inside the range",
    "reason": "kept",
    "task": 1,
    "test": "src/clamp.test.ts",
  },
]

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2781:30
    2779|       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    2780|       const r = await green();
    2781|       expect(r.json.changed).toEqual([{ task: 1, test: TEST, name: NAM…
       |                              ^
    2782|       expect(report()).not.toContain("dropped from the plan");
    2783|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green prints an empty changed list and no Changed by a code step section when no code step changed a test
AssertionError: expected undefined to deeply equal []

- Expected:
[]

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:2791:30
    2789|       const r = await green();
    2790|       expect(r.code).toBe(0);
    2791|       expect(r.json.changed).toEqual([]);
       |                              ^
    2792|       expect(report()).not.toContain("Changed by a code step");
    2793|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 157 passed (160)
   Start at  21:08:15
   Duration  26.66s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-msOkyu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts

[test-timeout-budget] load average 7.5 on 10 cores: unit limits 8250ms per test, 16500ms per hook (x1.65)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (1 test | 1 failed) 1619ms
   ❯ the planned-test lock across groups (1)
     × a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 1617ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts > the planned-test lock across groups > a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed
AssertionError: expected undefined to deeply equal [ { task: 1, …(3) } ]

- Expected:
[
  {
    "name": "adds a row",
    "reason": "the new src/c.ts needs setup()",
    "task": 1,
    "test": "src/a.test.ts",
  },
]

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts:225:32
    223|     );
    224|     expect(green.json.gaps).toEqual([]);
    225|     expect(green.json.changed).toEqual([
       |                                ^
    226|       {
    227|         task: 1,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  21:08:43
   Duration  1.79s (tests 96%, setup 2%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-c8FVfz/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/workflow-shape.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/workflow-shape.test.ts

[test-timeout-budget] load average 8.2 on 10 cores: unit limits 8600ms per test, 17200ms per hook (x1.72)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (281 tests | 6 failed) 213ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 3ms
     ✓ design calls only verbs and flags the CLI has 2ms
     ✓ plan calls only verbs and flags the CLI has 1ms
     ✓ build calls only verbs and flags the CLI has 2ms
     ✓ debug calls only verbs and flags the CLI has 5ms
     ✓ ship calls only verbs and flags the CLI has 1ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 2ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ design resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ plan resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ build resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ debug resolves the binary once, in Step 1, and holds it as BKIT 1ms
     ✓ ship resolves the binary once, in Step 1, and holds it as BKIT 1ms
   ✓ gate logs (13)
     ✓ auto writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ design writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ plan writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes every gate log to the outbox, outside the tree the gate's format check reads 1ms
     ✓ debug writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ ship writes every gate log to the outbox, outside the tree the gate's format check reads 0ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ debug writes the trimmed gate log with `tests run --artifact` 1ms
     ✓ build never copies or clamps a gate log by hand 1ms
     ✓ debug never copies or clamps a gate log by hand 1ms
     ✓ build routes the test failures on the engine's count, never a count from the log 0ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 2ms
     ✓ reconstructs nothing in shell or prose 0ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 0ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 0ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 0ms
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 0ms
     ✓ build re-runs a red gate pause instead of asking it 1ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 0ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 1ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 0ms
     ✓ plan records the failure through one `workflows fail` call 0ms
     ✓ build records the failure through one `workflows fail` call 0ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 0ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 0ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 1ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 0ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 1ms
     ✓ ship flushes through `workflows handover --flush` 1ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 0ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 0ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 0ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 0ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 0ms
     ✓ the last allowed challenge round never runs another 1ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 0ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 9ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 0ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 1ms
     ✓ Step 7 takes the next group's brief and hands execute its path 0ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 0ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 1ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 0ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 1ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 0ms
     ✓ group-mode verify logs no gap for a test the group gate runs 1ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 1ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 0ms
     ✓ a hard blocker answered Fix now with no direction is asked again 0ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 0ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 0ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 3ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 0ms
     ✓ build: the Resume line calls `status resume` 1ms
     ✓ debug: the Resume line calls `status resume` 0ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 1ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 1ms
     ✓ debug: the step table matches the step headings and their --step= calls 1ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 1ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 3ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ design never reads a verdict outside `steps finish` 0ms
     ✓ plan never reads a verdict outside `steps finish` 0ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 0ms
     ✓ ship never reads a verdict outside `steps finish` 0ms
   ✓ status route --require=strategy (1)
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 4ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 3ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 1ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 1ms
     ✓ build hands no agent a raw `git diff` 4ms
     ✓ debug hands no agent a raw `git diff` 0ms
     ✓ ship hands no agent a raw `git diff` 0ms
   ✓ ship (7)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 1ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 10ms
     ✓ plan and build hold the caps `repo info` prints 1ms
   ✓ plan (3)
     ✓ plan runs one review round 1ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
     ✓ carries draft formatting findings through review and update, with a strict final check 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 0ms
     ✓ debug reads its related issues through one `issues related` call 1ms
   ✓ highest-version lookups (2)
     ✓ design never lists versions with an `ls` glob 0ms
     ✓ plan never lists versions with an `ls` glob 0ms
   ✓ summary step (5)
     ✓ design writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ plan writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ build writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ debug writes its summary with `workflows summary`, no summary subagent 1ms
     ✓ ship writes its summary with `workflows summary`, no summary subagent 1ms
   ✓ locks (5)
     ✓ design's Locks header no longer waits on the lock file's age 0ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 0ms
     ✓ debug's Locks header no longer waits on the lock file's age 0ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 1ms
     ✓ debug passes its summary file 0ms
     ✓ ship passes its summary path plus the missing-summary line 0ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 0ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 0ms
     ✓ build: no wired-tracker block STOPs on a missing issue 1ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 0ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 0ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 4ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ design: the No issue bullet sits in a tracker true block 0ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 0ms
     ✓ ship: the No issue bullet sits in a tracker true block 0ms
     ✓ design: final messages start with the no-issue warning clause 1ms
     ✓ plan: final messages start with the no-issue warning clause 0ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 1ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 2ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 1ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ design: tracker gate items name the attempt, never its skip rule 1ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 1ms
     ✓ build: tracker gate items name the attempt, never its skip rule 1ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 1ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 0ms
     ✓ design Step 11 posts plans 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 1ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 0ms
     ✓ debug Steps 9 and 10 push nothing on dev 0ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 3ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 0ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 1ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 1ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 0ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 0ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 0ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 0ms
     ✓ re-derives publish on resume 1ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 0ms
     ✓ keeps the publish=true close path 0ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 0ms
     ✓ runs only the close gate on the held path 0ms
   ❯ planned tests a code step changed (6)
     × an exit 11 re-ask offers the BLOCKED test line the engine reads 7ms
     × Step 15 asks once about planned tests a code step changed, before the unproven ones 3ms
     × a changed-test item offers Accept or Stop, recommended Accept 1ms
     × the execute prompt's BLOCKED test line is one the engine reads 0ms
     × the remediate prompt's BLOCKED test line is one the engine reads 0ms
     × the verify prompt notes a planned test a code step changed and raises no gap 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > an exit 11 re-ask offers the BLOCKED test line the engine reads
AssertionError: exit 11 re-ask 1 offers no TASK test line form: expected null not to be null
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2329:84
    2327|       const kind = kinds[i]!;
    2328|       const form = FORM(kind).exec(line.replaceAll("``", ""));
    2329|       expect(form, `exit 11 re-ask ${i + 1} offers no ${kind} test lin…
       |                                                                                    ^
    2330|       expect(blockedTests(filled(form![0]))).toEqual([
    2331|         { test: "src/a.test.ts", name: "adds a row", reason: "the new …
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2326:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > Step 15 asks once about planned tests a code step changed, before the unproven ones
AssertionError: expected '1. Ask once about the planned tests t…' to contain '`Question: CHANGED_TESTS`'

Expected: "`Question: CHANGED_TESTS`"
Received: "1. Ask once about the planned tests that never failed before their code existed. **Skip if** a `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` file holds the line `Question: UNPROVEN`, because the owner already answered them this run → sub-step 2."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2343:18
    2341|     const step = stepBody(workflow("build"), /Step 15 — Summary/);
    2342|     const skip = step.split("\n").find((l) => l.includes("**Skip if**"…
    2343|     expect(skip).toContain("`Question: CHANGED_TESTS`");
       |                  ^
    2344|     expect(skip).toContain("`Question: UNPROVEN`");
    2345|     expect(step).toMatch(/Hold `changed` as `CHANGED_TESTS`/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > a changed-test item offers Accept or Stop, recommended Accept
AssertionError: § Decision Pause has no CHANGED_TESTS item rule: expected undefined to be defined
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2357:69
    2355|     const pause = section(workflow("build"), /Decision Pause/);
    2356|     const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUES…
    2357|     expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").to…
       |                                                                     ^
    2358|     expect(rule).toContain('Options `["Accept", "Stop"]`');
    2359|     expect(rule).toMatch(/recommended `Accept`/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > the execute prompt's BLOCKED test line is one the engine reads
AssertionError: no line says a code change that forces a planned-test edit keeps the edit: expected -1 to be greater than or equal to 0
 ❯ keepCase .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2315:7
    2313|       at,
    2314|       "no line says a code change that forces a planned-test edit keep…
    2315|     ).toBeGreaterThanOrEqual(0);
       |       ^
    2316|     return lines.slice(at, at + 5).join("\n");
    2317|   };
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2363:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > the remediate prompt's BLOCKED test line is one the engine reads
AssertionError: no line says a code change that forces a planned-test edit keeps the edit: expected -1 to be greater than or equal to 0
 ❯ keepCase .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2315:7
    2313|       at,
    2314|       "no line says a code change that forces a planned-test edit keep…
    2315|     ).toBeGreaterThanOrEqual(0);
       |       ^
    2316|     return lines.slice(at, at + 5).join("\n");
    2317|   };
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2373:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > the verify prompt notes a planned test a code step changed and raises no gap
AssertionError: no `Changed by a code step` section rule: expected -1 to be greater than or equal to 0
 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2386:60
    2384|     const lines = prompt("bkit-build-plan-verify").split("\n");
    2385|     const at = lines.findIndex((l) => l.includes("`Changed by a code s…
    2386|     expect(at, "no `Changed by a code step` section rule").toBeGreater…
       |                                                            ^
    2387|     const rule = lines.slice(at, at + 2).join("\n");
    2388|     expect(rule).toContain("`Notes`");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 275 passed (281)
   Start at  21:08:46
   Duration  668ms (tests 41%, import 30%, transform 21%, setup 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-o0nzWl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
