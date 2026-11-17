Enforced: true
Red: 7
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a changed test when test-first is not enforced" | red | failure: expected [] to deeply equal [ ObjectContaining{…} ] |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block" | red | failure: expected 11 to be +0 // Object.is equality |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" | passed-accepted | passes; accepted by the tests step: the engine already refuses any edit to an unlocated test's whole file (exit 11); the test guards that it stays refused |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a changedTests record on a non-code-step row does not move the lock's baseline" | red | failure: expected +0 to be 11 // Object.is equality |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a --field changedTests on a step finish" | red | failure: expected +0 to be 2 // Object.is equality |
| 17 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives a changed test whose red recorded its file missing every line of the test as added" | red | failure: expected [ { task: 1, …(5) } ] to deeply equal [ ObjectContaining{…} ] |
| 18 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment" | red | failure: expected ' - `Changed by a code step` section…' to match /added lines?/ |
| 18 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 refusal says verify reads a BLOCKED change's added lines" | red | failure: expected '`src/a.test.ts` "adds a row" differs …' to match /verify reads[^.]*added lines?/ |

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


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (177 tests | 2 failed) 69415ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 85ms
     ✓ records the selected run's failed job count 60ms
     ✓ runs local gates only after current-generation remediation or soak 1034ms
     ✓ rejects CI rounds without active matching debug selection 39ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 37ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 69ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 73ms
     ✓ no package.json, no scripts, or unparseable -> null 149ms
     ✓ debug's live-first chain stops at the deepest declared tier 56ms
     ✓ with no e2e gate, debug runs the integration gate build runs 51ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 27ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 24ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 22ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 24ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1221ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 27ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 913ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 889ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1354ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1199ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 150ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 83ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 113ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 645ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1089ms
     ✓ --gate and --log are required 27ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1142ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 938ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 769ms
     ✓ PASS is 0 failures with or without reports 1069ms
     ✓ clears a previous attempt's reports before the gate runs 401ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 793ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 902ms
     ✓ a log under the outbox is named main-checkout relative in the record 861ms
     ✓ a log small enough is copied whole: not clamped, raw null 801ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1126ms
     ✓ --artifact needs --fid and --step 23ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1318ms
     ✓ numbers runs within the workflow's active run and per step 1381ms
     ✓ without --file no row is written and the output carries row null 1242ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 21ms
   ✓ bkit tests run --changed-since (6)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 1286ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 590ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 201ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1298ms
     ✓ changed-since refuses a sha that names no commit 148ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1766ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 1313ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 1074ms
     ✓ a failing required push gate leaves the failed marker 559ms
     ✓ uncommitted code blocks the receipt until it is committed 1261ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1545ms
     ✓ only the required push gate records a receipt 1153ms
     ✓ a tests-lock wait records no receipt and the re-run after the lock frees does 1512ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 29ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 33ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 28ms
     ✓ keeps each case's classname and file attribute 32ms
     ✓ no testcase elements -> empty 32ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 50ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 31ms
     ✓ state: no report (misspelled path) 34ms
     ✓ state: load error named after the file 29ms
     ✓ state: zero tests 28ms
     ✓ state: the named test passed (code written first) 32ms
     ✓ state: the named test skipped (filter matched nothing) 37ms
     ✓ state: other tests only 38ms
     ✓ a name only matches whole trailing segments 28ms
     ✓ green needs every case of the named test to pass 30ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 30ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 25ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 29ms
     ✓ narrows to one group's tasks 29ms
     ✓ reads no task from old-format task lines 26ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 28ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 28ms
     ✓ refuses a task that depends on itself 25ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 24ms
     ✓ reads a CRLF plan's Reuse Inventory 31ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 35ms
     ✓ the change-shape example in trackers.md parses 33ms
     ✓ change issue form example passes plan-check 44ms
     ✓ trackers.md change example shows every task field 32ms
     ✓ the shipped change form shows every plan cap with its settings default 31ms
     ✓ this repo's change form shows every plan cap with its settings default 29ms
     ✓ trackers.md shows each plan cap it names with its settings default 35ms
     ✓ README.md shows each plan cap it names with its settings default 39ms
     ✓ this repo's change form shows the caps this repo's package.json sets 36ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 94ms
     ✓ states the caps the template and workflows doc name 42ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 58ms
     ✓ plan-check refuses a task without DONE WHEN 61ms
     ✓ plan-check refuses DEPENDS ON a later group 107ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 102ms
     ✓ plan-check matches a Markdown heading symbol 107ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 66ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 70ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 57ms
     ✓ plan-check skips existence on ticked tasks 57ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 87ms
     ✓ plan-check refuses an unmapped matrix row 56ms
     ✓ plan-check refuses a delete with no supersession row 83ms
     ✓ plan-check refuses a matrix row mapped to two tasks 61ms
     ✓ plan-check refuses rows left in the old column order under the template header 59ms
     ✓ plan-check refuses rows with an extra cell under the template header 58ms
     ✓ plan-check refuses a task no matrix row maps to 58ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 90ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 64ms
     ✓ plan-check refuses a matrix header with an extra leading # column 60ms
     ✓ plan-check refuses a matrix header with Task not last 64ms
     ✓ plan-check refuses synonym matrix column names 75ms
     ✓ plan-check refuses a matrix header with no closing pipe 65ms
     ✓ plan-check accepts the template matrix header in any letter case 62ms
     ✓ plan-check refuses a Task cell naming an undefined task 69ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 114ms
     ✓ plan-check refuses a group with 6 tasks 58ms
     ✓ plan-check refuses a group with 26 planned tests 58ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 60ms
     ✓ plan-check report lists groups, not a verdict 59ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 58ms
     ✓ plan-check follows bkit.workflows.tasks 95ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 119ms
     ✓ a missing plan file is a usage error 31ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 28ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 26ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 30ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 31ms
     ✓ starts at the call when the name sits on its own line under an open paren 29ms
     ✓ is stack-agnostic: pytest 25ms
     ✓ is stack-agnostic: go 34ms
     ✓ is stack-agnostic: rspec 28ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 26ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 31ms
     ✓ falls back to a suite line when nothing else carries the name 30ms
     ✓ is null when the name is not in the file, or there is no file 32ms
   ✓ blockedTests (2)
     ✓ reads the file, name and reason from a TASK or Gap BLOCKED test line 28ms
     ✓ ignores a BLOCKED line that names no test 28ms
   ❯ bkit tests red / green (40)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 602ms
     ✓ a planned test that passes is a vacuous gap, exit 1 609ms
     ✓ a planned test absent from a loaded report is a missing gap 1125ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1048ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 964ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 182ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1026ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1085ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 431ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 144ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1244ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 1625ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1039ms
       ✓ a later unproven result never replaces a proven red of the same lines 74ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1053ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1606ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1671ms
     ✓ green: a passed-accepted test is already landed, not a gap 1615ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 528ms
     ❯ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 581ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 579ms
       ✓ green leaves a changed test the plan no longer names out of changed 700ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 627ms
       × green lists a changed test when test-first is not enforced 213ms
       × green gives a changed test whose red recorded its file missing every line of the test as added 703ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 855ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 130ms
     ✓ green refuses a plan with no task markers 141ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 948ms
     ✓ green: --group audits only that group's tasks 476ms
     ✓ green: --group naming a group with no tasks is refused 107ms
     ✓ green: a code fence never closed is the reason, not missing task markers 111ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 799ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 868ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 671ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1007ms
     ✓ green: lists each gap kind, with the runner output 630ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1080ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 386ms
       ✓ green clears an exception-only task from a human commit 200ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green lists a changed test when test-first is not enforced
AssertionError: expected [] to deeply equal [ ObjectContaining{…} ]

- Expected
+ Received

- [
-   ObjectContaining {
-     "name": "keeps a value inside the range",
-     "reason": "new setup line",
-     "task": 1,
-     "test": "src/clamp.test.ts",
-   },
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:3189:30
    3187|       const r = await green();
    3188|       expect(r.json).toMatchObject({ enforced: false });
    3189|       expect(r.json.changed).toEqual([
       |                              ^
    3190|         expect.objectContaining({ task: 1, test: TEST, name: NAME, rea…
    3191|       ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > tests a code step changed > green gives a changed test whose red recorded its file missing every line of the test as added
AssertionError: expected [ { task: 1, …(5) } ] to deeply equal [ ObjectContaining{…} ]

- Expected
+ Received

  [
    {
-     "additive": true,
+     "additive": null,
+     "diff": null,
      "name": "keeps a value inside the range",
+     "reason": "wrote the test file",
+     "task": 1,
      "test": "src/clamp.test.ts",
    },
  ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:3208:30
    3206|       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    3207|       const r = await green();
    3208|       expect(r.json.changed).toEqual([
       |                              ^
    3209|         expect.objectContaining({ test: TEST, name: NAME, additive: tr…
    3210|       ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 175 passed (177)
   Start at  08:54:27
   Duration  70.33s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fRmgn9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (155 tests | 4 failed) 39459ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 384ms
     ✓ finishes a CI round only with its own failed job count 342ms
     ✓ preserves local clamp enforcement when completing test rounds 111ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 106ms
     ✓ done prints progressLine 125ms
     ✓ progress output metadata 1ms
     ✓ gate progress number validation 127ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 307ms
     ✓ done --group writes group on the row 239ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 384ms
     ✓ --commit=none writes the row and leaves it uncommitted 120ms
     ✓ build-group-start records parentSha and group 110ms
     ✓ carries extra fields, parsed as JSON when they are JSON 222ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 83ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 82ms
     ✓ refuses an empty artifact 82ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 88ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 99ms
     ✓ rejects ["--verdict=MAYBE"] 87ms
     ✓ rejects ["--strategy=YOLO"] 93ms
     ✓ rejects ["--failures=-1"] 86ms
     ✓ rejects ["--field=verdict=PASS"] 85ms
     ✓ rejects ["--status=SKIPPED"] 83ms
     ✓ needs a message unless --commit=none 97ms
     ✓ reports a failed commit with exit 8 without writing the row 613ms
     ✓ a failed commit leaves no row staged in the index 457ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 743ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1082ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 557ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 735ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1127ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 78ms
     ✓ a missing artifact exits 4 87ms
     ✓ empty artifact exits 0 114ms
     ✓ pending artifact exits 1 79ms
     ✓ no marker artifact exits 2 88ms
     ✓ disallowed artifact exits 3 100ms
     ✓ bad failures artifact exits 4 85ms
     ✓ a required field that is absent is invalid (re-prompt) 83ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 97ms
     ✓ only reads above the marker 78ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 182ms
     ✓ fails when no row was written for the step 84ms
     ✓ --ref reads the status file as committed on that ref, not from disk 235ms
     ✓ --ref exits 3 when the ref does not carry the status file 227ms
     ✓ fails on a placeholder left in the artifact 188ms
     ✓ fails when the row's verdict differs from the artifact's 205ms
     ✓ fails when the row does not list the artifact, or carries another attempt 223ms
     ✓ fails on a missing artifact 200ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 216ms
     ✓ refuses a negative or non-integer attempt (2) 85ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 100ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 91ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 80ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 90ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 92ms
     ✓ fails a diagnose row missing its strategy, passes with it 204ms
     ✓ fails a run-tests row missing its scope, and an empty scope 324ms
     ✓ names every missing field at once 96ms
     ✓ asks nothing of a step that writes none of them 94ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 9ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 1ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 114ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 371ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 89ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 79ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 79ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 99ms
     ✓ a true | false header field is true when any agent sets it true 108ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 136ms
     ✓ records the header's Strategy on the row 139ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 142ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 301ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 92ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 218ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 418ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 523ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 405ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 438ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 676ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 505ms
     ✓ --post needs --number; without --post there is no tracker key 180ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 114ms
     ✓ --strip-header drops the prior version's own header 93ms
     ✓ exits 4 when the prior version is missing or empty 91ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 94ms
     ✓ checks the FID's shape for the wired tracker 118ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 208ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 111ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 384ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 318ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 205ms
       ✓ gate --issue without --fid is a usage error 93ms
       ✓ gate --issue="" under none keeps today's check 100ms
     ✓ --attempt-of checks the row carries the derived counter 242ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 674ms
     ✓ writeStepRow refuses when a recorded path changed 705ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 371ms
     ✓ writeStepRow appends its commit sha to the record 603ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 795ms
   ❯ bkit steps finish — the tests step touches only tests, the code steps never touch a test (36)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 277ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 495ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 436ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 518ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 298ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 717ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 466ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 357ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 285ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 720ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 276ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 248ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 452ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 422ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 459ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 447ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 327ms
     ✓ the refusal names the BLOCKED line the engine reads 268ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 577ms
     ✓ refuses a later code step that changes a BLOCKED change again 460ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 608ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 668ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 248ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 393ms
     ✓ the refusal of a re-change says the logged reason is already recorded 396ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 272ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 262ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 448ms
     × passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 355ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 341ms
     × a changedTests record on a non-code-step row does not move the lock's baseline 389ms
     × refuses a --field changedTests on a step finish 352ms
     × the exit 11 refusal says verify reads a BLOCKED change's added lines 280ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 118ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 271ms
     ✓ does not count an artifact the run found committed when it started 302ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 189ms
     ✓ commits a package.json change outside bkit.workflows 272ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 527ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 88ms
     ✓ registers every named header kind 11ms
     ✓ renders and verifies the header of every prompt that declares one 128ms
     ✓ renders no PASS from a result that omits its evidence 76ms
     ✓ refuses line breaks in header-bound result values 83ms
     ✓ retains special verdict judgments and legacy stub behavior 85ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 94ms
     ✓ derives a fresh audit key when the ledger already holds it 83ms
     ✓ keeps the audit key when the same finding is rendered again after its append 84ms
     ✓ reads held audit keys from the linked worktree's own ledger 139ms
     ✓ refuses a result file left from an earlier round 93ms
     ✓ audit result render keeps an existing anchored report intact 86ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block
AssertionError: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2536:20
    2534|     const cwd = laterTestsStepAppended();
    2535|     const r = await run(cwd, inGroup2(EXECUTE));
    2536|     expect(r.code).toBe(0);
       |                    ^
    2537|     expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toCon…
    2538|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > a changedTests record on a non-code-step row does not move the lock's baseline
AssertionError: expected +0 to be 11 // Object.is equality

- Expected
+ Received

- 11
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2572:20
    2570|     write(cwd, TEST.file, weakened);
    2571|     const r = await run(cwd, EXECUTE);
    2572|     expect(r.code).toBe(11);
       |                    ^
    2573|     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }…
    2574|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > refuses a --field changedTests on a step finish
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2584:20
    2582|       `--field=changedTests=[{"task":1,"test":"${TEST.file}","testName…
    2583|     ]);
    2584|     expect(r.code).toBe(2);
       |                    ^
    2585|     expect(r.err).toContain("changedTests");
    2586|     expect(stepRows(cwd, "build-plan-tasks")).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish — the tests step touches only tests, the code steps never touch a test > the exit 11 refusal says verify reads a BLOCKED change's added lines
AssertionError: expected '`src/a.test.ts` "adds a row" differs …' to match /verify reads[^.]*added lines?/

- Expected:
/verify reads[^.]*added lines?/

+ Received:
"`src/a.test.ts` \"adds a row\" differs from what the group's tests step recorded at its red: a code step never edits a planned test case — put that test back as the tests step left it (other edits to the file stay), or keep the edit and log one line per test in the step's log: BLOCKED — TASK {N}: test `src/a.test.ts` `adds a row` — {why} (`src/a.test.ts` \"adds a row\": a BLOCKED line cannot remove or loosen a planned test's lines — it lets through only a change that adds lines) (Gap {N} in a gaps fix) (nothing written)"

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:2595:28
    2593|     const r = await run(cwd, EXECUTE);
    2594|     expect(r.code).toBe(11);
    2595|     expect(r.json.problem).toMatch(/verify reads[^.]*added lines?/);
       |                            ^
    2596|     expect(r.json.problem).not.toMatch(/cannot remove or loosen/);
    2597|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 151 passed (155)
   Start at  08:55:40
   Duration  40.31s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-54vakE/junit.xml
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


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (293 tests | 1 failed) 294ms
   ✓ engine calls (8)
     ✓ auto calls only verbs and flags the CLI has 3ms
     ✓ design calls only verbs and flags the CLI has 2ms
     ✓ plan calls only verbs and flags the CLI has 2ms
     ✓ build calls only verbs and flags the CLI has 4ms
     ✓ debug calls only verbs and flags the CLI has 5ms
     ✓ ship calls only verbs and flags the CLI has 1ms
     ✓ the call check reports an unknown verb and an unknown flag 0ms
     ✓ no workflow names a removed sub-plan flag 3ms
   ✓ bkit lookup (6)
     ✓ auto resolves the binary once, in Step 1, and holds it as BKIT 2ms
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
     ✓ build routes the test failures on the engine's count, never a count from the log 1ms
     ✓ debug routes the test failures on the engine's count, never a count from the log 0ms
   ✓ debug Step 1 start decisions (3)
     ✓ decides attempt, mode, repro and gates with one `status route --prompt-file` 2ms
     ✓ reconstructs nothing in shell or prose 1ms
     ✓ Step 3 reads `[live=off]` from the gates, never from the input file 1ms
   ✓ Step 1 FID check (10)
     ✓ design resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ plan resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ build resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ debug resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ ship resolves the FID at Step 1 with `fids resolve`, outside every tracker block 1ms
     ✓ design writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ plan writes the session prompt to a file and reads it with `fids parse` 0ms
     ✓ build writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ debug writes the session prompt to a file and reads it with `fids parse` 1ms
     ✓ ship writes the session prompt to a file and reads it with `fids parse` 1ms
   ✓ resume facts (4)
     ✓ build resumes an open decision from `openDecision`, not a file scan 1ms
     ✓ build re-runs a red gate pause instead of asking it 1ms
     ✓ Resume re-runs a red gate only when openDecision status is OPEN 1ms
     ✓ build re-runs a red gate pause only when the loop question is its only undecided question 1ms
   ✓ pre-worktree commit (3)
     ✓ design passes the repo root explicitly 1ms
     ✓ plan passes the repo root explicitly 0ms
     ✓ build passes the repo root explicitly 1ms
   ✓ Failure Path (17)
     ✓ design records the failure through one `workflows fail` call 1ms
     ✓ plan records the failure through one `workflows fail` call 1ms
     ✓ build records the failure through one `workflows fail` call 1ms
     ✓ debug records the failure through one `workflows fail` call 0ms
     ✓ ship records the failure through one `workflows fail` call 1ms
     ✓ design always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ plan always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ build always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ debug always keeps its record through one `workflows handover --push` in the run's worktree 1ms
     ✓ bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch 1ms
     ✓ bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch 1ms
     ✓ design removes only files the run created by mistake, never other agents' changes 0ms
     ✓ plan removes only files the run created by mistake, never other agents' changes 0ms
     ✓ build removes only files the run created by mistake, never other agents' changes 1ms
     ✓ debug removes only files the run created by mistake, never other agents' changes 1ms
     ✓ ship flushes through `workflows handover --flush` 0ms
     ✓ build routes exit 5 (lock left in place) on, like exit 0 1ms
   ✓ build (43)
     ✓ Step 13's diagnose agent reads the committed log, not the outbox copy 0ms
     ✓ writes the challenge attempt on every row, counted from the challenge's own rows 1ms
     ✓ Step 11 merges the findings into the plan and routes on the merge 1ms
     ✓ Step 11 records its round on the challenge row and reads it back from status.jsonl 1ms
     ✓ a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file 0ms
     ✓ the decision row records its route, which `status resume` maps 1ms
     ✓ the last allowed challenge round never runs another 1ms
     ✓ challenge merge exit 23 gets the same one retry as exit 22 0ms
     ✓ an execute cap stop is a handover, never a FAIL attempt 1ms
     ✓ build challenge runs the size gate first 1ms
     ✓ Branch Sync merges docs and finishes as its own step 1ms
     ✓ Plan Convert checks the plan, converts one with no task markers, and re-checks 0ms
     ✓ Plan Convert leaves a valid plan with no newer comments alone 0ms
     ✓ build's comment numbers match the step table 12ms
     ✓ the convert step posts under Plan Convert's number and title 1ms
     ✓ Plan Convert's finish carries the plan-check log as an optional artifact 0ms
     ✓ Plan Current posts a comment whether it runs or skips 0ms
     ✓ Plan Current's skipped comment says no plan anchor 0ms
     ✓ issue comments newer than a valid plan send the build through convert once 1ms
     ✓ only convert reads the build-input file, and nothing reads a sub-plan 3ms
     ✓ Step 7 takes the next group's brief and hands execute its path 1ms
     ✓ Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute 1ms
     ✓ a re-run gate that is still red goes straight to the Decision Pause 1ms
     ✓ a green re-run gate continues without asking and clears GATE_RERUN 1ms
     ✓ Step 8 verifies a diff cut from the group's start commit 1ms
     ✓ the Decision Pause checks a red gate against the base commit before composing 2ms
     ✓ a no-progress round after a red gate pauses with the loop question 0ms
     ✓ a failing gate or suite test is never a pause item 1ms
     ✓ group-mode verify logs no gap for a test the group gate runs 0ms
     ✓ the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read 0ms
     ✓ a Fix now edit is checked with plan-check before the loop goes on 0ms
     ✓ a Fix now challenge task is rewritten to the owner's direction in place 1ms
     ✓ a hard blocker answered Fix now with no direction is asked again 1ms
     ✓ each Fix now item records its Fix task line before the decision row is finished 0ms
     ✓ Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check 0ms
     ✓ the owner decisions contract names the task block as the Fix now carrier 0ms
     ✓ Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause 0ms
     ✓ an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date 0ms
     ✓ build writes one input file with every input in Step 2, before any plan check 1ms
     ✓ convert and plan-generate prompts (3)
       ✓ convert copies an input's TEST EXCEPTION and never writes its own 0ms
       ✓ convert names no plan format but the task-block one 0ms
       ✓ convert reads the whole input file; the newer text wins where it and the plan disagree 0ms
     ✓ records the PR URL in artifacts, not a prUrl field 1ms
   ✓ live docs (1)
     ✓ live docs name no build step the table does not carry 4ms
   ✓ resume (10)
     ✓ design: the Resume line calls `status resume` 0ms
     ✓ plan: the Resume line calls `status resume` 1ms
     ✓ build: the Resume line calls `status resume` 1ms
     ✓ debug: the Resume line calls `status resume` 1ms
     ✓ ship: the Resume line calls `status resume` 0ms
     ✓ design: the step table matches the step headings and their --step= calls 2ms
     ✓ plan: the step table matches the step headings and their --step= calls 1ms
     ✓ build: the step table matches the step headings and their --step= calls 2ms
     ✓ debug: the step table matches the step headings and their --step= calls 2ms
     ✓ ship: the step table matches the step headings and their --step= calls 1ms
   ✓ plan convert skip row (1)
     ✓ writes a build-plan-convert row on the no-conversion route 1ms
   ✓ promoted parsers (1)
     ✓ holds the workflows to the step table 4ms
   ✓ debug (1)
     ✓ records the PR URL in artifacts, not a prUrl field 0ms
   ✓ verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6) (10)
     ✓ design: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ plan: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ build: the Finish header line routes exit 5 or 6 to a re-ask 1ms
     ✓ debug: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ ship: the Finish header line routes exit 5 or 6 to a re-ask 0ms
     ✓ design never reads a verdict outside `steps finish` 0ms
     ✓ plan never reads a verdict outside `steps finish` 0ms
     ✓ build never reads a verdict outside `steps finish` 1ms
     ✓ debug never reads a verdict outside `steps finish` 1ms
     ✓ ship never reads a verdict outside `steps finish` 1ms
   ✓ status route --require=strategy (1)
     ✓ status route --require=strategy is used at exactly the four strategy-routing sites 2ms
   ✓ auto (2)
     ✓ resolves phase, mode and the CI context with one `runs context` call 0ms
     ✓ workflows impose no blanket runtime deadline on workflows or subagents 5ms
   ✓ diff per reader (10)
     ✓ build /Failure Path/ writes the diff right before its agents 1ms
     ✓ build /Step 10 — / writes the diff right before its agents 1ms
     ✓ build /Step 11 — Build Challenge/ writes the diff right before its agents 1ms
     ✓ debug /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Failure Path/ writes the diff right before its agents 0ms
     ✓ ship /Step 5 — / writes the diff right before its agents 0ms
     ✓ build group verify cuts its own diff from the group's start, right before the agent 1ms
     ✓ build hands no agent a raw `git diff` 1ms
     ✓ debug hands no agent a raw `git diff` 1ms
     ✓ ship hands no agent a raw `git diff` 1ms
   ✓ ship (7)
     ✓ ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12 1ms
     ✓ post-merge check reads the capstone job alone, at the squash commit 0ms
     ✓ the close removes the worktree and deletes the branch through the command, then leaves it 0ms
     ✓ brings local dev level through `branches sync-dev`, never a checkout 0ms
     ✓ skill prune warns and carries on rather than stopping the ship 0ms
     ✓ re-validates through `runs revalidate` and merges through `prs merge --match-head` 0ms
     ✓ closes through `workflows close --flush` 0ms
   ✓ plan caps (2)
     ✓ no prompt or workflow states a literal group cap 9ms
     ✓ plan and build hold the caps `repo info` prints 1ms
   ✓ plan (3)
     ✓ plan runs one review round 1ms
     ✓ bkit-plan runs plan-check after every plan-writing step 1ms
     ✓ carries draft formatting findings through review and update, with a strict final check 1ms
   ✓ design and plan close (5)
     ✓ design lands on dev through `branches land` 0ms
     ✓ plan lands on dev through `branches land` 0ms
     ✓ design reads its related issues through one `issues related` call 0ms
     ✓ plan reads its related issues through one `issues related` call 1ms
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
     ✓ design's Locks header no longer waits on the lock file's age 1ms
     ✓ plan's Locks header no longer waits on the lock file's age 0ms
     ✓ build's Locks header no longer waits on the lock file's age 1ms
     ✓ debug's Locks header no longer waits on the lock file's age 1ms
     ✓ ship's Locks header no longer waits on the lock file's age 0ms
   ✓ final return at the close (10)
     ✓ design builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ plan builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ build builds its final message in `workflows close` and displays it verbatim 2ms
     ✓ debug builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ ship builds its final message in `workflows close` and displays it verbatim 1ms
     ✓ design passes its summary file 0ms
     ✓ plan passes its summary file 0ms
     ✓ build passes its summary file 1ms
     ✓ debug passes its summary file 1ms
     ✓ ship passes its summary path plus the missing-summary line 1ms
   ✓ issue-less runs (68)
     ✓ design: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ plan: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ build: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ debug: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 2ms
     ✓ ship: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty 1ms
     ✓ design: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ plan: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ build: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ debug: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ ship: every issues labels --board fence has a Skip if ISSUE_ID empty line 1ms
     ✓ design: no wired-tracker block STOPs on a missing issue 1ms
     ✓ plan: no wired-tracker block STOPs on a missing issue 1ms
     ✓ build: no wired-tracker block STOPs on a missing issue 1ms
     ✓ debug: no wired-tracker block STOPs on a missing issue 1ms
     ✓ ship: no wired-tracker block STOPs on a missing issue 1ms
     ✓ design: fids resolve and steps gate carry --issue in every workflow 4ms
     ✓ plan: fids resolve and steps gate carry --issue in every workflow 2ms
     ✓ build: fids resolve and steps gate carry --issue in every workflow 7ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ ship: fids resolve and steps gate carry --issue in every workflow 3ms
     ✓ design: the No issue bullet sits in a tracker true block 1ms
     ✓ plan: the No issue bullet sits in a tracker true block 0ms
     ✓ build: the No issue bullet sits in a tracker true block 1ms
     ✓ debug: the No issue bullet sits in a tracker true block 1ms
     ✓ ship: the No issue bullet sits in a tracker true block 1ms
     ✓ design: final messages start with the no-issue warning clause 2ms
     ✓ plan: final messages start with the no-issue warning clause 1ms
     ✓ build: final messages start with the no-issue warning clause 1ms
     ✓ debug: final messages start with the no-issue warning clause 1ms
     ✓ ship: final messages start with the no-issue warning clause 2ms
     ✓ design: no wired-tracker block extracts the issue from the prompt 2ms
     ✓ plan: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ build: no wired-tracker block extracts the issue from the prompt 1ms
     ✓ debug: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ ship: no wired-tracker block extracts the issue from the prompt 0ms
     ✓ design: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ plan: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 0ms
     ✓ build: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ debug: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit 1ms
     ✓ ship checks the plan with `fids plans`; build checks it with `tests plan-check` 2ms
     ✓ plan reads the parent design and audit reports from `fids design` 0ms
     ✓ design: the merge MCP fallback asserts base.ref = dev before merging 1ms
     ✓ plan: the merge MCP fallback asserts base.ref = dev before merging 0ms
     ✓ ship's merge MCP fallback proves the scoped dev base through the engine before merging 0ms
     ✓ design: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ plan: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ build: Placeholders rule lets ISSUE_ID be empty in every workflow 1ms
     ✓ debug: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ ship: Placeholders rule lets ISSUE_ID be empty in every workflow 0ms
     ✓ design: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ plan: the Jira related-issues query drops key != when ISSUE_ID is empty 0ms
     ✓ debug: the Jira related-issues query drops key != when ISSUE_ID is empty 1ms
     ✓ design: tracker gate items name the attempt, never its skip rule 1ms
     ✓ plan: tracker gate items name the attempt, never its skip rule 1ms
     ✓ build: tracker gate items name the attempt, never its skip rule 1ms
     ✓ debug: tracker gate items name the attempt, never its skip rule 1ms
     ✓ ship: tracker gate items name the attempt, never its skip rule 1ms
     ✓ design: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ plan: every Failure Path comment post sits behind the ISSUE_ID guard 0ms
     ✓ build: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ debug: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ ship: every Failure Path comment post sits behind the ISSUE_ID guard 1ms
     ✓ build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty 2ms
     ✓ build Step 1 blocker check skips when ISSUE_ID is empty 1ms
     ✓ design Step 11 requires an issue 0ms
     ✓ design Step 11 posts plans 0ms
     ✓ debug Step 1 never probes for a PR on dev or main 1ms
   ✓ workflow routing (5)
     ✓ AGENTS.md sends only a bkit-{command} prompt to router.md 0ms
     ✓ router.md hands back a prompt that only mentions a workflow 0ms
     ✓ router.md reads the issue through bkit verbs, never a tracker MCP tool 0ms
     ✓ router.md names an existing command file for every host and command 1ms
     ✓ phase workflows read the issue themselves, never from AGENTS.md 2ms
   ✓ debug on dev (4)
     ✓ debug diffs against DIFF_BASE on dev 1ms
     ✓ debug Steps 9 and 10 push nothing on dev 1ms
     ✓ the TRIGGER_PR commit is unreachable on dev 1ms
     ✓ debug stops and asks on a foreign path 0ms
   ✓ input files (2)
     ✓ every agent that reads a `*-input-*.md` file carries the newer-wins bullet 5ms
     ✓ a re-run reads its previous design or plan as superseded context, never as a constraint 1ms
   ✓ fix loops ask only when the last round made no progress (5)
     ✓ build takes a further test round without asking unless the trend is stuck or worse 1ms
     ✓ debug takes a further fix or soak attempt without asking unless the trend is stuck or worse 1ms
     ✓ debug Loop Question states the engine's trend line, never a fixed claim 1ms
     ✓ debug Loop Question at the used-up soak limit states the trend line 0ms
     ✓ ship asks the Merge Question only when the merge attempts are used up 1ms
   ✓ build publish ending (8)
     ✓ resolves publish through status route 1ms
     ✓ re-derives publish on resume 1ms
     ✓ warns when a non-LOCAL run resolves publish false 0ms
     ✓ skips push, PR and CI on a held close 1ms
     ✓ keeps the publish=true close path 1ms
     ✓ appends the held roadmap row without roadmap mirror 0ms
     ✓ makes Gate 15 conditional on the held path 1ms
     ✓ runs only the close gate on the held path 0ms
   ✓ build Decision Pause continue route (8)
     ✓ an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs 1ms
     ✓ continue sends holistic to Step 11 and verify to the decision tick then Step 7 1ms
     ✓ a Gate FAIL pause never routes continue 1ms
     ✓ continue is never set after a fix round that changed source files 1ms
     ✓ the continue decision tick runs before the build-decision row is recorded 1ms
     ✓ a verify or holistic decision file records Source changed and a resume holds it 1ms
     ✓ the continue rule reads the source change from the decision file header 1ms
     ✓ the continue decision tick routes a non-zero exit to the Failure Path 1ms
   ✓ questions never re-run a check without a change (1)
     ✓ debug and ship questions offer no answer that re-runs a check without a change 1ms
   ❯ planned tests a code step changed (9)
     ✓ an exit 11 re-ask offers the BLOCKED test line the engine reads 1ms
     ✓ Step 15 asks once about planned tests a code step changed, before the unproven ones 1ms
     ✓ a changed-test item offers Accept or Stop, recommended Accept 1ms
     ✓ the execute prompt's BLOCKED test line is one the engine reads 1ms
     ✓ the remediate prompt's BLOCKED test line is one the engine reads 0ms
     ✓ a changed-test item shows the test's line diff since its baseline 1ms
     ✓ the code prompts say a BLOCKED line lets through only a change that adds lines 1ms
     ✓ the verify prompt notes a planned test a code step changed and raises no gap 0ms
     × the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment 8ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-shape.test.ts > planned tests a code step changed > the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment
AssertionError: expected '   - `Changed by a code step` section…' to match /added lines?/

- Expected:
/added lines?/

+ Received:
"   - `Changed by a code step` section → list each test and its reason in `Notes`.
     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build."

 ❯ .bkit/core/engine/audits/workflows/workflow-shape.test.ts:2530:18
    2528|       .join("\n")
    2529|       .split(/\n {3}- `Updated tests`/)[0]!;
    2530|     expect(rule).toMatch(/added lines?/);
       |                  ^
    2531|     expect(rule).toMatch(/\bdiff\b/);
    2532|     expect(rule).toMatch(/early `?return/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 292 passed (293)
   Start at  08:56:22
   Duration  1.07s (transform 36%, tests 34%, import 23%, setup 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Y6j9z5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
