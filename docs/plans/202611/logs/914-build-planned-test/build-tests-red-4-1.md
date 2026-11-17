Enforced: true
Red: 0
Accepted: 13
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its BLOCKED line names the changed test by the last segment of its name" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records only the changed test when a BLOCKED line also names an unchanged one" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses only the changed planned tests no BLOCKED line of the log names" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal names the BLOCKED line the engine reads" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a later code step that leaves a BLOCKED change as it is" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a later code step that changes a BLOCKED change again" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "uses a red the tests step recorded after a code step's change as the baseline" | passed-accepted | passes; accepted by the tests step: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule |
| 13 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap" | passed-accepted | passes; accepted by the tests step: change now adds a setup line; green already lists changed tests |
| 13 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a changed test the plan no longer names out of changed" | passed-accepted | passes; accepted by the tests step: change now adds a setup line; green already filters by plan |
| 13 | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` "a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed" | passed-accepted | passes; accepted by the tests step: already additive (adds setup() line); engine already supports it |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 11.4 on 10 cores: unit limits 10200ms per test, 20400ms per hook (x2.04)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (150 tests) 58904ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 625ms
     ✓ finishes a CI round only with its own failed job count 534ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 665ms
     ✓ done --group writes group on the row 332ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 645ms
     ✓ carries extra fields, parsed as JSON when they are JSON 469ms
     ✓ reports a failed commit with exit 8 without writing the row 666ms
     ✓ a failed commit leaves no row staged in the index 716ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1221ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 585ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 743ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 493ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1144ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 422ms
     ✓ --ref reads the status file as committed on that ref, not from disk 359ms
     ✓ --ref exits 3 when the ref does not carry the status file 478ms
     ✓ fails on a placeholder left in the artifact 304ms
     ✓ fails when the row's verdict differs from the artifact's 304ms
     ✓ fails when the row does not list the artifact, or carries another attempt 380ms
     ✓ fails on a missing artifact 366ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 318ms
     ✓ fails a run-tests row missing its scope, and an empty scope 559ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 564ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 434ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 414ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 582ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 451ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 624ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1035ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 770ms
     ✓ --post needs --number; without --post there is no tracker key 315ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 329ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 519ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 404ms
     ✓ --attempt-of checks the row carries the derived counter 386ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 923ms
     ✓ writeStepRow refuses when a recorded path changed 1184ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 458ms
     ✓ writeStepRow appends its commit sha to the record 856ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2123ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (31)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 545ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 791ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 910ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 716ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 321ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1145ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 839ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 586ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 410ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1154ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 354ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 424ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 689ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 871ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 864ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 835ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 512ms
     ✓ the refusal names the BLOCKED line the engine reads 472ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 1040ms
     ✓ refuses a later code step that changes a BLOCKED change again 683ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 1064ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 1065ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 478ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 760ms
     ✓ the refusal of a re-change says the logged reason is already recorded 740ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 444ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 308ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 871ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 517ms
     ✓ does not count an artifact the run found committed when it started 560ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 437ms
     ✓ commits a package.json change outside bkit.workflows 568ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1123ms

 Test Files  1 passed (1)
      Tests  150 passed (150)
   Start at  10:45:41
   Duration  60.35s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Ufngcs/junit.xml
```

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 15.8 on 10 cores: unit limits 12400ms per test, 24800ms per hook (x2.48)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (162 tests) 50601ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1391ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 320ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 390ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 553ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1027ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 555ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 339ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 302ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1058ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 540ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 455ms
     ✓ PASS is 0 failures with or without reports 479ms
     ✓ clears a previous attempt's reports before the gate runs 470ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 703ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 460ms
     ✓ a log under the outbox is named main-checkout relative in the record 620ms
     ✓ a log small enough is copied whole: not clamped, raw null 574ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 397ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 598ms
     ✓ numbers runs within the workflow's active run and per step 636ms
     ✓ without --file no row is written and the output carries row null 728ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check refuses a Task cell naming an undefined task 348ms
   ✓ bkit tests red / green (38)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 772ms
     ✓ a planned test that passes is a vacuous gap, exit 1 972ms
     ✓ a planned test absent from a loaded report is a missing gap 545ms
     ✓ a file that fails to load is a red of kind red-not-loaded 659ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 735ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 320ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1370ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 434ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 532ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1439ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 763ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1765ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1355ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 807ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1280ms
     ✓ green: a passed-accepted test is already landed, not a gap 817ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 773ms
     ✓ tests a code step changed (5)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 695ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 788ms
       ✓ green leaves a changed test the plan no longer names out of changed 672ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 842ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 730ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 775ms
     ✓ green: --group audits only that group's tasks 712ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 962ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1172ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 586ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1170ms
     ✓ green: lists each gap kind, with the runner output 900ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1273ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 517ms
       ✓ green clears an exception-only task from a human commit 445ms

 Test Files  1 passed (1)
      Tests  162 passed (162)
   Start at  10:46:44
   Duration  51.66s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ONTdpp/junit.xml
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

[test-timeout-budget] load average 22.6 on 10 cores: unit limits 15800ms per test, 31600ms per hook (x3.16)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test

 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (1 test) 3225ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 3222ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  10:47:40
   Duration  3.81s (tests 90%, setup 7%, transform 2%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uchwJl/junit.xml
```
