Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1061-takeover-unbuilt-planned-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "lockBaselines moves an earlier task's key onto a later task's red entry that carries no from" | red | failure: expected [ '2:adds a row:old', …(1) ] to deeply equal [ '2:adds a row:new', …(1) ] |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "touchedTests reports nothing when the file holds the later task's lines and its red carries no from" | red | failure: expected [ { test: 'src/a.test.ts', …(8) } ] to deeply equal [] |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests red records from as the owner when an unbuilt task between the two names the test" | red | failure: expected [ { task: 3, …(5) } ] to deeply equal [ ObjectContaining{…} ] |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests green lists a takeover whose nearest earlier task has no red as taken over from the owner" | red | failure: expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1061-takeover-unbuilt-planned
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1061-takeover-unbuilt-planned
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1061-takeover-unbuilt-planned

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (214 tests | 4 failed) 26378ms
   ✓ CI evidence test rounds (5)
     ✓ records a CI evidence round without executing a local gate 18ms
     ✓ records the selected run's failed job count 14ms
     ✓ a CI evidence test-run row lists each failed job as job:{name} 13ms
     ✓ runs local gates only after current-generation remediation or soak 571ms
     ✓ rejects CI rounds without active matching debug selection 13ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 11ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 22ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 21ms
     ✓ no package.json, no scripts, or unparseable -> null 44ms
     ✓ debug's live-first chain stops at the deepest declared tier 22ms
     ✓ with no e2e gate, debug runs the integration gate build runs 22ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 210ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 180ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 14ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 169ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 170ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 172ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 173ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 173ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 64ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 27ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 42ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 177ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 218ms
     ✓ --gate and --log are required 16ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 221ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 184ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 174ms
     ✓ PASS is 0 failures with or without reports 233ms
     ✓ clears a previous attempt's reports before the gate runs 172ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 174ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 206ms
     ✓ a log under the outbox is named main-checkout relative in the record 198ms
     ✓ a log small enough is copied whole: not clamped, raw null 179ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 169ms
     ✓ --artifact needs --fid and --step 14ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 381ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 235ms
     ✓ numbers runs within the workflow's active run and per step 365ms
     ✓ tests run --file records the tested snapshot on its test-run row 255ms
     ✓ a FAIL test-run row records each failing case as file and name 224ms
     ✓ a PASS test-run row records no failed tests 379ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 240ms
     ✓ without --file no row is written and the output carries row null 174ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 16ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 315ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 278ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 116ms
     ✓ the nothing-to-run row records the tested snapshot 130ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 473ms
     ✓ --since-pass-of skips failing runs and steps it does not name 534ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 430ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 328ms
     ✓ --since-pass-of needs --file, --workflow and --changed-since 69ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 317ms
     ✓ changed-since refuses a sha that names no commit 85ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 325ms
     ✓ a deleted file that no file mentions passes and the log says so 155ms
     ✓ a failed importer search runs the whole check 337ms
     ✓ --changed-since=feature-base starts at the feature's start commit 361ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 73ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 307ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 252ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 263ms
     ✓ a failing required push gate leaves the failed marker 238ms
     ✓ uncommitted code blocks the receipt until it is committed 333ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 272ms
     ✓ only the required push gate records a receipt 279ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 340ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 11ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 11ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 11ms
     ✓ keeps each case's classname and file attribute 11ms
     ✓ no testcase elements -> empty 10ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, [] for clean reports, or null with none 12ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 10ms
     ✓ state: no report (misspelled path) 11ms
     ✓ state: load error named after the file 11ms
     ✓ state: zero tests 10ms
     ✓ state: the named test passed (code written first) 11ms
     ✓ state: the named test skipped (filter matched nothing) 11ms
     ✓ state: other tests only 11ms
     ✓ a name only matches whole trailing segments 11ms
     ✓ green needs every case of the named test to pass 11ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 11ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 11ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 12ms
     ✓ narrows to one group's tasks 11ms
     ✓ reads no task from old-format task lines 12ms
   ✓ planTakeovers (2)
     ✓ planTakeovers names a later task's test that an earlier task owns 12ms
     ✓ planTakeovers matches normalized paths and the last name segment and flags a same-group pair 11ms
   ✓ sameTestName (2)
     ✓ sameTestName matches a bare name to a suite path's last segment, either way round 11ms
     ✓ sameTestName keeps two suite paths with the same last segment apart, either way round 11ms
   ❯ lockBaselines and takeovers (5)
     ✓ lockBaselines moves every same-name key onto a takeover's red entry 11ms
     ✓ lockBaselines follows a takeover chain to the newest lines 11ms
     ✓ lockBaselines leaves a test nobody took over on its own baseline 12ms
     × lockBaselines moves an earlier task's key onto a later task's red entry that carries no from 15ms
     × touchedTests reports nothing when the file holds the later task's lines and its red carries no from 13ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 11ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 12ms
     ✓ refuses a task that depends on itself 11ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 12ms
     ✓ reads a CRLF plan's Reuse Inventory 11ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 12ms
     ✓ the change-shape example in trackers.md parses 12ms
     ✓ change issue form example passes plan-check 16ms
     ✓ trackers.md change example shows every task field 13ms
     ✓ the shipped change form shows every plan cap with its settings default 12ms
     ✓ this repo's change form shows every plan cap with its settings default 11ms
     ✓ trackers.md shows each plan cap it names with its settings default 11ms
     ✓ README.md shows each plan cap it names with its settings default 12ms
     ✓ this repo's change form shows the caps this repo's package.json sets 11ms
   ✓ bkit tests plan-check (40)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 44ms
     ✓ plan-check reports takeovers without refusing and leaves them out of existing 28ms
     ✓ states the caps the template and workflows doc name 11ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 21ms
     ✓ plan-check refuses a task without DONE WHEN 29ms
     ✓ plan-check refuses DEPENDS ON a later group 46ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 46ms
     ✓ plan-check matches a Markdown heading symbol 46ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 28ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 29ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 30ms
     ✓ plan-check skips existence on ticked tasks 29ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 46ms
     ✓ plan-check refuses an unmapped matrix row 29ms
     ✓ plan-check refuses a delete with no supersession row 45ms
     ✓ plan-check refuses a matrix row mapped to two tasks 29ms
     ✓ plan-check refuses rows left in the old column order under the template header 29ms
     ✓ plan-check refuses rows with an extra cell under the template header 29ms
     ✓ plan-check refuses a task no matrix row maps to 29ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 46ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 29ms
     ✓ plan-check refuses a matrix header with an extra leading # column 29ms
     ✓ plan-check refuses a matrix header with Task not last 28ms
     ✓ plan-check refuses synonym matrix column names 29ms
     ✓ plan-check refuses a matrix header with no closing pipe 28ms
     ✓ plan-check accepts the template matrix header in any letter case 29ms
     ✓ plan-check refuses a Task cell naming an undefined task 28ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 45ms
     ✓ plan-check refuses a group with 6 tasks 28ms
     ✓ plan-check refuses a group with 26 planned tests 29ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 29ms
     ✓ plan-check report lists groups, not a verdict 28ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 29ms
     ✓ plan-check follows bkit.workflows.tasks 47ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 45ms
     ✓ a missing plan file is a usage error 12ms
     ✓ --ledger-rows (4)
       ✓ refuses a plan that parses when a key on its Ledger rows line has no row, and names the key 35ms
       ✓ refuses a missing or unfilled Ledger rows line 57ms
       ✓ passes when the plan parses and every key has a decision or deferral row 57ms
       ✓ leaves the Ledger rows line unchecked without the flag 28ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 11ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 11ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 11ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 11ms
     ✓ starts at the call when the name sits on its own line under an open paren 11ms
     ✓ is stack-agnostic: pytest 11ms
     ✓ is stack-agnostic: go 11ms
     ✓ is stack-agnostic: rspec 11ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 11ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 11ms
     ✓ falls back to a suite line when nothing else carries the name 11ms
     ✓ is null when the name is not in the file, or there is no file 11ms
   ✓ blockedTests (2)
     ✓ reads the file, name, reason and task from a TASK or Gap BLOCKED test line 11ms
     ✓ ignores a BLOCKED line that names no test 11ms
   ❯ bkit tests red / green (48)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 268ms
     ✓ a planned test that passes is a vacuous gap, exit 1 206ms
     ✓ a planned test absent from a loaded report is a missing gap 193ms
     ✓ a file that fails to load is a red of kind red-not-loaded 247ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 261ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 78ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 334ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 222ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 199ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 60ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 376ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 247ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 260ms
       ✓ a later unproven result never replaces a proven red of the same lines 39ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 356ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 307ms
     ❯ takeover (7)
       ✓ tests red records a failing takeover as red with from 260ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 263ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 330ms
       × tests red records from as the owner when an unbuilt task between the two names the test 281ms
       × tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 259ms
       ✓ a resumed tests red skips a taken-over entry 274ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 308ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 354ms
     ✓ green: a passed-accepted test is already landed, not a gap 274ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 229ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 243ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 252ms
       ✓ green leaves a changed test the plan no longer names out of changed 282ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 295ms
       ✓ green lists a changed test when test-first is not enforced 70ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 231ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 231ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 52ms
     ✓ green refuses a plan with no task markers 51ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 268ms
     ✓ green: --group audits only that group's tasks 219ms
     ✓ green: --group naming a group with no tasks is refused 48ms
     ✓ green: a code fence never closed is the reason, not missing task markers 41ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 287ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 286ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 254ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 286ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 256ms
     ✓ green: lists each gap kind, with the runner output 239ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 403ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 130ms
       ✓ green clears an exception-only task from a human commit 99ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > lockBaselines and takeovers > lockBaselines moves an earlier task's key onto a later task's red entry that carries no from
AssertionError: expected [ '2:adds a row:old', …(1) ] to deeply equal [ '2:adds a row:new', …(1) ]

- Expected
+ Received

  [
-   "2:adds a row:new",
+   "2:adds a row:old",
    "5:adds a row:new",
  ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1837:26
    1835|       redRow(2, [entry(5, "adds a row", "new")]),
    1836|     ];
    1837|     expect(blocks(rows)).toEqual(["2:adds a row:new", "5:adds a row:ne…
       |                          ^
    1838|     expect(lockBaselines(rows, null).get(redKey(2, "src/a.test.ts", "a…
    1839|       expect.objectContaining({ blob: "blob-new", block: "new", origin…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > lockBaselines and takeovers > touchedTests reports nothing when the file holds the later task's lines and its red carries no from
AssertionError: expected [ { test: 'src/a.test.ts', …(8) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "block": "897b1e68f588cbdbad780c5e0fc166f969ca8c01",
+     "fromChange": false,
+     "name": "adds a row",
+     "origin": "blob-30c40235534c5123000a663f99b2476ef54cbae5",
+     "reasons": [],
+     "task": 2,
+     "test": "src/a.test.ts",
+     "text": "blob-30c40235534c5123000a663f99b2476ef54cbae5",
+     "wholeFile": false,
+   },
+ ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1856:48
    1854|       fs.mkdirSync(path.join(top, "src"));
    1855|       fs.writeFileSync(path.join(top, "src/a.test.ts"), body(2));
    1856|       expect(touchedTests(top, file, "build")).toEqual([]);
       |                                                ^
    1857|       fs.writeFileSync(path.join(top, "src/a.test.ts"), body(1));
    1858|       expect(touchedTests(top, file, "build").map((t) => t.name)).toEq…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > takeover > tests red records from as the owner when an unbuilt task between the two names the test
AssertionError: expected [ { task: 3, …(5) } ] to deeply equal [ ObjectContaining{…} ]

- Expected
+ Received

  [
    {
-     "from": 1,
+     "blob": "146d1a5080f3b8f4e1d0227f07a4a1611f59445e",
+     "block": "59a521a774156b9297bb37ab68a0f3c2493bd495",
      "state": "red",
      "task": 3,
+     "test": "src/clamp.test.ts",
      "testName": "keeps a value inside the range",
    },
  ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:3719:28
    3717|       const r = await groupThree("red", "logs/build-tests-red-3-1.md");
    3718|       expect(r.code).toBe(0);
    3719|       expect(r.json.tests).toEqual([
       |                            ^
    3720|         expect.objectContaining({ task: 3, testName: NAME, state: "red…
    3721|       ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests red / green > takeover > tests green lists a takeover whose nearest earlier task has no red as taken over from the owner
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:3731:77
    3729|       vi.stubEnv("FAKE_EXIT", "0");
    3730|       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    3731|       expect((await groupThree("red", "logs/build-tests-red-3-1.md")).…
       |                                                                             ^
    3732|       const r = await groupThree("green", "logs/green.md");
    3733|       expect(r.code).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 210 passed (214)
   Start at  10:56:42
   Duration  26.60s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-A5PgfD/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
