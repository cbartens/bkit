Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/951-build-repeat-whole-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a passing required push gate records a receipt" | red | failure: expected false to be true // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a passing required push gate with only bookkeeping uncommitted records a receipt" | red | failure: expected false to be true // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a failing required push gate leaves the failed marker" | red | failure: expected false to be true // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "uncommitted code blocks the receipt until it is committed" | red | failure: expected false to be true // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "only the required push gate records a receipt" | red | failure: expected false to be true // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a tests-lock wait records no receipt and the re-run after the lock frees does" | red | failure: expected false to be true // Object.is equality |
| 11 | `.bkit/core/engine/commands/ci/push-gate.test.ts` "a new branch with only bookkeeping after a receipted ancestor takes the minimum gate" | red | failure: expected 1 to be +0 // Object.is equality |

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

[test-timeout-budget] load average 23.3 on 10 cores: unit limits 16150ms per test, 32300ms per hook (x3.23)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (166 tests | 6 failed) 69740ms
   ✓ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 90ms
     ✓ records the selected run's failed job count 87ms
     ✓ runs local gates only after current-generation remediation or soak 1152ms
     ✓ rejects CI rounds without active matching debug selection 64ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 44ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 139ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 107ms
     ✓ no package.json, no scripts, or unparseable -> null 253ms
     ✓ debug's live-first chain stops at the deepest declared tier 121ms
     ✓ with no e2e gate, debug runs the integration gate build runs 125ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 58ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 73ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 66ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 48ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 681ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 74ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 674ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 568ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 769ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 721ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 230ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 178ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 242ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 467ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 652ms
     ✓ --gate and --log are required 55ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 515ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 502ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1047ms
     ✓ PASS is 0 failures with or without reports 928ms
     ✓ clears a previous attempt's reports before the gate runs 572ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 544ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 874ms
     ✓ a log under the outbox is named main-checkout relative in the record 769ms
     ✓ a log small enough is copied whole: not clamped, raw null 531ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 736ms
     ✓ --artifact needs --fid and --step 62ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 964ms
     ✓ numbers runs within the workflow's active run and per step 895ms
     ✓ without --file no row is written and the output carries row null 447ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 62ms
   ✓ bkit tests run --changed-since (6)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 1010ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 1438ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 386ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1079ms
     ✓ changed-since refuses a sha that names no commit 494ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1028ms
   ❯ bkit tests run — push-gate receipt (6)
     × a passing required push gate records a receipt 964ms
     × a passing required push gate with only bookkeeping uncommitted records a receipt 731ms
     × a failing required push gate leaves the failed marker 711ms
     × uncommitted code blocks the receipt until it is committed 1395ms
     × only the required push gate records a receipt 913ms
     × a tests-lock wait records no receipt and the re-run after the lock frees does 1027ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 124ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 83ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 48ms
     ✓ keeps each case's classname and file attribute 48ms
     ✓ no testcase elements -> empty 73ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 50ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 61ms
     ✓ state: no report (misspelled path) 61ms
     ✓ state: load error named after the file 51ms
     ✓ state: zero tests 56ms
     ✓ state: the named test passed (code written first) 54ms
     ✓ state: the named test skipped (filter matched nothing) 50ms
     ✓ state: other tests only 60ms
     ✓ a name only matches whole trailing segments 57ms
     ✓ green needs every case of the named test to pass 51ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 47ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 60ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 69ms
     ✓ narrows to one group's tasks 73ms
     ✓ reads no task from old-format task lines 60ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 47ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 58ms
     ✓ refuses a task that depends on itself 106ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 66ms
     ✓ reads a CRLF plan's Reuse Inventory 62ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 62ms
     ✓ the change-shape example in trackers.md parses 63ms
     ✓ change issue form example passes plan-check 96ms
     ✓ trackers.md change example shows every task field 63ms
     ✓ the shipped change form shows every plan cap with its settings default 60ms
     ✓ this repo's change form shows every plan cap with its settings default 67ms
     ✓ trackers.md shows each plan cap it names with its settings default 64ms
     ✓ README.md shows each plan cap it names with its settings default 99ms
     ✓ this repo's change form shows the caps this repo's package.json sets 58ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 319ms
     ✓ states the caps the template and workflows doc name 82ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 77ms
     ✓ plan-check refuses a task without DONE WHEN 195ms
     ✓ plan-check refuses DEPENDS ON a later group 315ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 239ms
     ✓ plan-check matches a Markdown heading symbol 217ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 135ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 158ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 130ms
     ✓ plan-check skips existence on ticked tasks 112ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 191ms
     ✓ plan-check refuses an unmapped matrix row 94ms
     ✓ plan-check refuses a delete with no supersession row 185ms
     ✓ plan-check refuses a matrix row mapped to two tasks 87ms
     ✓ plan-check refuses rows left in the old column order under the template header 90ms
     ✓ plan-check refuses rows with an extra cell under the template header 88ms
     ✓ plan-check refuses a task no matrix row maps to 84ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 131ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 83ms
     ✓ plan-check refuses a matrix header with an extra leading # column 78ms
     ✓ plan-check refuses a matrix header with Task not last 92ms
     ✓ plan-check refuses synonym matrix column names 89ms
     ✓ plan-check refuses a matrix header with no closing pipe 86ms
     ✓ plan-check accepts the template matrix header in any letter case 105ms
     ✓ plan-check refuses a Task cell naming an undefined task 86ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 182ms
     ✓ plan-check refuses a group with 6 tasks 112ms
     ✓ plan-check refuses a group with 26 planned tests 114ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 109ms
     ✓ plan-check report lists groups, not a verdict 149ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 118ms
     ✓ plan-check follows bkit.workflows.tasks 192ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 226ms
     ✓ a missing plan file is a usage error 52ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 59ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 46ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 52ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 43ms
     ✓ starts at the call when the name sits on its own line under an open paren 47ms
     ✓ is stack-agnostic: pytest 47ms
     ✓ is stack-agnostic: go 43ms
     ✓ is stack-agnostic: rspec 45ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 57ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 48ms
     ✓ falls back to a suite line when nothing else carries the name 54ms
     ✓ is null when the name is not in the file, or there is no file 51ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1144ms
     ✓ a planned test that passes is a vacuous gap, exit 1 622ms
     ✓ a planned test absent from a loaded report is a missing gap 1092ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1344ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1552ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 515ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1378ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 855ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 861ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 275ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1395ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 903ms
       ✓ a later unproven result never replaces a proven red of the same lines 171ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1433ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 997ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1859ms
     ✓ green: a passed-accepted test is already landed, not a gap 1017ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1245ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 259ms
     ✓ green refuses a plan with no task markers 227ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 908ms
     ✓ green: --group audits only that group's tasks 989ms
     ✓ green: --group naming a group with no tasks is refused 334ms
     ✓ green: a code fence never closed is the reason, not missing task markers 254ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1442ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 2325ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1733ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 2303ms
     ✓ green: lists each gap kind, with the runner output 927ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2020ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 753ms
       ✓ green clears an exception-only task from a human commit 634ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > a passing required push gate records a receipt
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:946:43
    944|       const r = await run(gateArgs(DEEP));
    945|       expect(r.code).toBe(0);
    946|       expect(fs.existsSync(receipt(sha))).toBe(true);
       |                                           ^
    947|       expect(JSON.parse(fs.readFileSync(receipt(sha), "utf-8"))).toMat…
    948|         sha,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > a passing required push gate with only bookkeeping uncommitted records a receipt
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:965:43
    963|       const r = await run(gateArgs(DEEP));
    964|       expect(r.code).toBe(0);
    965|       expect(fs.existsSync(receipt(sha))).toBe(true);
       |                                           ^
    966|     },
    967|     timeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > a failing required push gate leaves the failed marker
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:978:55
    976|       const r = await run(gateArgs(DEEP));
    977|       expect(r.code).toBe(1);
    978|       expect(fs.existsSync(`${receipt(sha)}.failed`)).toBe(true);
       |                                                       ^
    979|       expect(fs.existsSync(receipt(sha))).toBe(false);
    980|     },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > uncommitted code blocks the receipt until it is committed
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:997:43
    995|       const second = await run(gateArgs(DEEP));
    996|       expect(second.code).toBe(0);
    997|       expect(fs.existsSync(receipt(sha))).toBe(true);
       |                                           ^
    998|     },
    999|     timeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > only the required push gate records a receipt
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1012:43
    1010|       const required = await run(gateArgs(DEEP));
    1011|       expect(required.code).toBe(0);
    1012|       expect(fs.existsSync(receipt(sha))).toBe(true);
       |                                           ^
    1013|     },
    1014|     timeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run — push-gate receipt > a tests-lock wait records no receipt and the re-run after the lock frees does
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:1030:43
    1028|       const rerun = await run(gateArgs(DEEP));
    1029|       expect(rerun.code).toBe(0);
    1030|       expect(fs.existsSync(receipt(sha))).toBe(true);
       |                                           ^
    1031|     },
    1032|     timeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 160 passed (166)
   Start at  17:19:59
   Duration  70.82s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-XjHRpM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/ci/push-gate.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/ci/push-gate.test.ts

```

## Runner output — `.bkit/core/engine/commands/ci/push-gate.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/ci/push-gate.test.ts

[test-timeout-budget] load average 20.6 on 10 cores: unit limits 14800ms per test, 29600ms per hook (x2.96)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole

[feat/test 8c203ec] gate
 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts (24 tests | 1 failed) 40322ms
   ❯ verified incremental push gates (24)
     ✓ keeps the later failure when two full gates overlap on the same commit 3658ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3641ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 567ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 499ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 474ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 518ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3810ms
     ✓ does not fall back through a malformed later success receipt 2072ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1334ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1142ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2631ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 2504ms
     ✓ requires proof even when the pushed increment changes no files 1271ms
     ✓ ignores malformed receipts 1279ms
     ✓ does not record a tracked tree 1057ms
     ✓ does not record a untracked tree 830ms
     ✓ does not record a mutated tree 909ms
     ✓ does not record a committed tree 950ms
     ✓ records no proof for a failed gate or lighter gate 1481ms
     ✓ requires integration proof when integration is declared 2078ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3928ms
     × a new branch with only bookkeeping after a receipted ancestor takes the minimum gate 1437ms
     ✓ invalidates proof when the gate definition changes 1479ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 767ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/ci/push-gate.test.ts > verified incremental push gates > a new branch with only bookkeeping after a receipted ancestor takes the minimum gate
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts:297:50
    295|       write(cwd, "docs/plans/202611/logs/test/more.md", "more\n");
    296|       const tip = commit(cwd);
    297|       expect((await min(cwd, ZERO, tip)).status).toBe(0);
       |                                                  ^
    298|     },
    299|     tierTimeouts(true).testTimeout,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 23 passed (24)
   Start at  17:21:13
   Duration  41.30s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-zp7zkp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
