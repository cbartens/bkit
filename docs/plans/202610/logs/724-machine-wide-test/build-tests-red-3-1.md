Enforced: true
Red: 19
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run" | red | failure: classifyLockExit is not a function |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81" | red | failure: classifyLockExit is not a function |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4" | red | failure: classifyLockExit is not a function |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate" | red | failure: expected [ …(3) ] to deeply equal [ StringContaining{…}, …(2) ] |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2" | red | failure: expected 'out: bkit:gate:static-unit-integratio…' to contain 'wait=1200' |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4" | red | failure: classifyLockExit is not a function |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run waits for a held tests lock and runs the gate once the holder finishes" | red | failure: process exited before writing waiting for tests to /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-mc9auY/consumer/logs/run.md |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run exits 81 naming the holder when the lock stays held past --lock-wait-s" | red | failure: [bkit-tests] unknown flag --lock-wait-s : expected 2 to be 81 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run holds the tests lock for the whole gate, so a second tests run waits" | red | failure: process exited before writing "event":"start" to /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-NuEfDa/events.jsonl |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests red runs its test file without waiting for a held tests lock" | red | failure: expected 2 to be 81 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=true never waits on a held tests lock" | red | failure: expected 2 to be 81 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=1 never waits on a held tests lock" | passed-accepted | passes; accepted by the tests step: the copied template already bypasses locking under CI=1 and the current CLI runs the gate successfully. |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run with an unwritable lock dir exits 4 naming the path" | red | failure: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/run.md [bkit-tests] [bkit-tests] > @ bkit:gate:static-unit /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/consumer [bkit-tests] > bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs [bkit-tests] [bkit-tests] mkdir: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/cache: Not a directory [bkit-tests] [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/cache/bkit/machine-lock [bkit-tests] ELIFECYCLE Command failed with exit code 73. [bkit-tests] WARN Local package.json exists, but node_modules missing, did you mean to install? [bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts) [bkit-tests] verdict FAIL (exit 73) : expected 1 to be 4 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run with --lock-wait-s=0 exits 81 at once against a held lock" | red | failure: [bkit-tests] unknown flag --lock-wait-s : expected 2 to be 81 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a gate that itself exits 75 is a FAIL verdict, not a lock wait" | passed-accepted | passes; accepted by the tests step: the existing CLI maps the wrapped gate's own 75 to FAIL; its recorded environment proves the template held the tests lock. |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait" | red | failure: [bkit-tests] unknown flag --lock-wait-s : expected 2 to be +0 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run --file appends no test-run row when it exits 81 on a held tests lock" | red | failure: [bkit-tests] unknown flag --lock-wait-s : expected 2 to be 81 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock" | red | failure: [bkit-tests] unknown flag --lock-wait-s : expected 2 to be 81 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests changed with an unwritable lock dir exits 4 naming the path" | red | failure: [bkit-tests] 1 changed file(s): src/planned.test.ts [bkit-tests] running pnpm bkit:gate:changed [bkit-tests] > @ bkit:gate:changed /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/consumer [bkit-tests] > bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs src/planned.test.ts [bkit-tests] mkdir: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/cache: Not a directory [bkit-tests] [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/cache/bkit/machine-lock [bkit-tests] ELIFECYCLE Command failed with exit code 73. [bkit-tests] WARN Local package.json exists, but node_modules missing, did you mean to install? : expected 1 to be 4 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate" | red | failure: expected [ …(3) ] to deeply equal [ StringContaining{…}, …(2) ] |
| 10 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every prompt that runs bkit tests changed routes exit 81 to a re-run of the command" | red | failure: .bkit/core/prompts/bkit-build-plan-tasks.md: expected '10. Run `bkit tests changed --fallbac…' to match /(?:exit(?:s)?\|exit code)\s+`?81\b/i |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 18.4 on 10 cores: unit limits 9224ms per test, 18448ms per hook (x1.84)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (141 tests | 7 failed) 11969ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 14ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 24ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 25ms
     ✓ no package.json, no scripts, or unparseable -> null 47ms
     ✓ debug's live-first chain stops at the deepest declared tier 26ms
     ✓ with no e2e gate, debug runs the integration gate build runs 24ms
   ❯ bkit tests run (16)
     × a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 17ms
     × a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 13ms
     × a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 12ms
     × tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 15ms
     × tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 363ms
     × a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 14ms
     × PASS: runs the gate through the package runner, saves stdout and stderr to the log 187ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 139ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 138ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 137ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 21ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 27ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 43ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 134ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 140ms
     ✓ --gate and --log are required 12ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 135ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 133ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 135ms
     ✓ PASS is 0 failures with or without reports 150ms
     ✓ clears a previous attempt's reports before the gate runs 133ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 140ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 176ms
     ✓ a log under the outbox is named main-checkout relative in the record 171ms
     ✓ a log small enough is copied whole: not clamped, raw null 157ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 152ms
     ✓ --artifact needs --fid and --step 13ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 191ms
     ✓ numbers runs within the workflow's active run and per step 191ms
     ✓ without --file no row is written and the output carries row null 174ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 17ms
   ✓ parseJunit (4)
     ✓ reads names, outcomes and failure messages, decoding entities 16ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 16ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 16ms
     ✓ no testcase elements -> empty 16ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 16ms
     ✓ state: no report (misspelled path) 16ms
     ✓ state: load error named after the file 17ms
     ✓ state: zero tests 15ms
     ✓ state: the named test passed (code written first) 19ms
     ✓ state: the named test skipped (filter matched nothing) 24ms
     ✓ state: other tests only 18ms
     ✓ a name only matches whole trailing segments 17ms
     ✓ green needs every case of the named test to pass 16ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 17ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 15ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 16ms
     ✓ narrows to one group's tasks 17ms
     ✓ reads no task from old-format task lines 17ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 15ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 17ms
     ✓ refuses a task that depends on itself 17ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 16ms
     ✓ reads a CRLF plan's Reuse Inventory 18ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 19ms
     ✓ the change-shape example in trackers.md parses 18ms
     ✓ change issue form example passes plan-check 35ms
     ✓ trackers.md change example shows every task field 24ms
     ✓ the shipped change form shows every plan cap with its settings default 21ms
     ✓ this repo's change form shows every plan cap with its settings default 18ms
     ✓ trackers.md shows each plan cap it names with its settings default 18ms
     ✓ README.md shows each plan cap it names with its settings default 17ms
     ✓ this repo's change form shows the caps this repo's package.json sets 22ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 62ms
     ✓ states the caps the template and workflows doc name 17ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 34ms
     ✓ plan-check refuses a task without DONE WHEN 45ms
     ✓ plan-check refuses DEPENDS ON a later group 58ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 59ms
     ✓ plan-check matches a Markdown heading symbol 59ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 40ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 38ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 37ms
     ✓ plan-check skips existence on ticked tasks 37ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 58ms
     ✓ plan-check refuses an unmapped matrix row 37ms
     ✓ plan-check refuses a delete with no supersession row 61ms
     ✓ plan-check refuses a matrix row mapped to two tasks 54ms
     ✓ plan-check refuses a task no matrix row maps to 38ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 57ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 36ms
     ✓ plan-check refuses a Task cell naming an undefined task 34ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 55ms
     ✓ plan-check refuses a group with 6 tasks 39ms
     ✓ plan-check refuses a group with 26 planned tests 34ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 33ms
     ✓ plan-check report lists groups, not a verdict 30ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 30ms
     ✓ plan-check follows bkit.workflows.tasks 55ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 47ms
     ✓ a missing plan file is a usage error 14ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 18ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 15ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 16ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 15ms
     ✓ starts at the call when the name sits on its own line under an open paren 15ms
     ✓ is stack-agnostic: pytest 15ms
     ✓ is stack-agnostic: go 15ms
     ✓ is stack-agnostic: rspec 15ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 15ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 14ms
     ✓ falls back to a suite line when nothing else carries the name 15ms
     ✓ is null when the name is not in the file, or there is no file 14ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 246ms
     ✓ a planned test that passes is a vacuous gap, exit 1 197ms
     ✓ a planned test absent from a loaded report is a missing gap 188ms
     ✓ a file that fails to load is a red of kind red-not-loaded 210ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 227ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 99ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 376ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 205ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 243ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 56ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 251ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 276ms
       ✓ a later unproven result never replaces a proven red of the same lines 42ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 376ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 266ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 235ms
     ✓ green: a passed-accepted test is already landed, not a gap 185ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 206ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 60ms
     ✓ green refuses a plan with no task markers 55ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 217ms
     ✓ green: --group audits only that group's tasks 197ms
     ✓ green: --group naming a group with no tasks is refused 54ms
     ✓ green: a code fence never closed is the reason, not missing task markers 54ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 306ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 292ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 221ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 271ms
     ✓ green: lists each gap kind, with the runner output 219ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 318ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 126ms
       ✓ green clears an exception-only task from a human commit 97ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run
TypeError: classifyLockExit is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:142:12
    140|     const who = "bkit tests run bkit:gate:static-unit";
    141|     const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for …
    142|     expect(classifyLockExit({ exitCode: 75, log, who })).toBe("lock-wa…
       |            ^
    143|     expect(classifyLockExit({ exitCode: 75, log, who: who + " other" }…
    144|     expect(classifyLockExit({ exitCode: 1, log, who })).toBe("gate");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81
TypeError: classifyLockExit is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:151:12
    149|     const who = "bkit tests run bkit:gate:static-unit";
    150|     const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for …
    151|     expect(classifyLockExit({ exitCode: 75, log, who })).toBe("gate");
       |            ^
    152|   });
    153|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4
TypeError: classifyLockExit is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:157:7
    155|     const who = "bkit tests run bkit:gate:static-unit";
    156|     expect(
    157|       classifyLockExit({
       |       ^
    158|         exitCode: 73,
    159|         log: "[machine-lock] ❌ could not take the lock for tests: cann…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate
AssertionError: expected [ …(3) ] to deeply equal [ StringContaining{…}, …(2) ]

- Expected
+ Received

  [
-   StringContaining "--lock-wait-s takes a whole number >= 0",
-   StringContaining "--lock-wait-s takes a whole number >= 0",
-   StringContaining "--lock-wait-s takes a whole number >= 0",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
  ]

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:184:49
    182|     );
    183|     expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
    184|     expect(results.map((result) => result.err)).toEqual([
       |                                                 ^
    185|       expect.stringContaining("--lock-wait-s takes a whole number >= 0…
    186|       expect.stringContaining("--lock-wait-s takes a whole number >= 0…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2
AssertionError: expected 'out: bkit:gate:static-unit-integratio…' to contain 'wait=1200'

- Expected
+ Received

- wait=1200
+ out: bkit:gate:static-unit-integration in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-4lxYdw
+ err: bkit:gate:static-unit-integration
+ arg: 
+ wait= who=
+

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:196:23
    194|     const valid = await run(BUILD);
    195|     expect(valid.code).toBe(0);
    196|     expect(readLog()).toContain("wait=1200");
       |                       ^
    197|     fs.rmSync(path.join(cwd, "logs/test.md"));
    198|     vi.stubEnv("BKIT_LOCK_WAIT_S", "bad");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4
TypeError: classifyLockExit is not a function
 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:209:12
    207|     const log =
    208|       "[machine-lock] ❌ could not take the lock for database: cannot c…
    209|     expect(classifyLockExit({ exitCode: 73, log, who })).toBe("gate");
       |            ^
    210|   });
    211|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > bkit tests run > PASS: runs the gate through the package runner, saves stdout and stderr to the log
AssertionError: expected { verdict: 'PASS', exitCode: +0, …(9) } to deeply equal { Object (verdict, exitCode, ...) }

- Expected
+ Received

@@ -2,11 +2,10 @@
    "artifact": null,
    "clamp": null,
    "exitCode": 0,
    "failures": 0,
    "gate": "bkit:gate:static-unit-integration",
-   "lockHolder": null,
    "log": "logs/test.md",
    "logBytes": 173,
    "reports": "logs/test.md.reports",
    "row": null,
    "scope": "pnpm bkit:gate:static-unit-integration",

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:215:20
    213|     const r = await run(BUILD);
    214|     expect(r.code).toBe(0);
    215|     expect(r.json).toEqual({
       |                    ^
    216|       verdict: "PASS",
    217|       exitCode: 0,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 134 passed (141)
   Start at  08:32:41
   Duration  12.22s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-FVlDRl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts

[test-timeout-budget] load average 15.4 on 10 cores: unit limits 7700ms per test, 15400ms per hook (x1.54)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts (13 tests | 11 failed) 6107ms
   ❯ tests lock through a consumer's wrapped gate (13)
     × tests run --file appends no test-run row when it exits 81 on a held tests lock 348ms
     × tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock 278ms
     × tests changed with an unwritable lock dir exits 4 naming the path 481ms
     × tests run waits for a held tests lock and runs the gate once the holder finishes 316ms
     × tests run exits 81 naming the holder when the lock stays held past --lock-wait-s 343ms
     × tests run holds the tests lock for the whole gate, so a second tests run waits 306ms
     × tests red runs its test file without waiting for a held tests lock 807ms
     × tests run under CI=true never waits on a held tests lock 729ms
     ✓ tests run under CI=1 never waits on a held tests lock 588ms
     × tests run with an unwritable lock dir exits 4 naming the path 512ms
     × tests run with --lock-wait-s=0 exits 81 at once against a held lock 294ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 835ms
     × the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 268ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run --file appends no test-run row when it exits 81 on a held tests lock
AssertionError: [bkit-tests] unknown flag --lock-wait-s
: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:230:42
    228|       "--step=gate",
    229|     ]);
    230|     expect(result.status, result.stderr).toBe(81);
       |                                          ^
    231|     expect(output(result)).toMatchObject({
    232|       row: null,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock
AssertionError: [bkit-tests] unknown flag --lock-wait-s
: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:243:42
    241|     fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
    242|     const result = execute(["changed", `--fallback=${GATE}`, "--lock-w…
    243|     expect(result.status, result.stderr).toBe(81);
       |                                          ^
    244|     expect(output(result)).toMatchObject({
    245|       gate: "bkit:gate:changed",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests changed with an unwritable lock dir exits 4 naming the path
AssertionError: [bkit-tests] 1 changed file(s): src/planned.test.ts
[bkit-tests] running pnpm bkit:gate:changed
[bkit-tests] > @ bkit:gate:changed /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/consumer
[bkit-tests] > bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs src/planned.test.ts
[bkit-tests] mkdir: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/cache: Not a directory
[bkit-tests] [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-J9b5T1/cache/bkit/machine-lock
[bkit-tests]  ELIFECYCLE  Command failed with exit code 73.
[bkit-tests]  WARN   Local package.json exists, but node_modules missing, did you mean to install?
: expected 1 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 1

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:256:42
    254|     fs.appendFileSync(path.join(cwd, TEST), "// a change\n");
    255|     const result = execute(["changed", `--fallback=${GATE}`]);
    256|     expect(result.status, result.stderr).toBe(4);
       |                                          ^
    257|     expect(result.stderr).toContain(path.join(cache, "bkit", "machine-…
    258|     expect(output(result)).toMatchObject({ verdict: null });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run waits for a held tests lock and runs the gate once the holder finishes
Error: process exited before writing waiting for tests to /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-mc9auY/consumer/logs/run.md
 ❯ waitForFile .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:184:13
    182|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
    183|     if (child.exitCode !== null || child.signalCode !== null)
    184|       throw new Error(`process exited before writing ${text} to ${file…
       |             ^
    185|     await delay(20);
    186|   }
 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:265:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run exits 81 naming the holder when the lock stays held past --lock-wait-s
AssertionError: [bkit-tests] unknown flag --lock-wait-s
: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:286:42
    284|       "--step=gate",
    285|     ]);
    286|     expect(result.status, result.stderr).toBe(81);
       |                                          ^
    287|     expect(output(result)).toMatchObject({
    288|       lockHolder: expect.stringContaining("external holder"),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run holds the tests lock for the whole gate, so a second tests run waits
Error: process exited before writing "event":"start" to /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-NuEfDa/events.jsonl
 ❯ waitForFile .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:184:13
    182|     if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes…
    183|     if (child.exitCode !== null || child.signalCode !== null)
    184|       throw new Error(`process exited before writing ${text} to ${file…
       |             ^
    185|     await delay(20);
    186|   }
 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:301:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests red runs its test file without waiting for a held tests lock
AssertionError: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:333:63
    331|     expect(holder.child.exitCode).toBeNull();
    332|     expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);
    333|     expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
       |                                                               ^
    334|     expect(events()).toEqual([]);
    335|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run under CI=true never waits on a held tests lock
AssertionError: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:343:63
    341|     expect(events().map((event) => event.event)).toEqual(["start", "en…
    342|     expect(holder.child.exitCode).toBeNull();
    343|     expect(execute([...runArgs(), "--lock-wait-s=0"]).status).toBe(81);
       |                                                               ^
    344|   });
    345|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run with an unwritable lock dir exits 4 naming the path
AssertionError: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/run.md
[bkit-tests] 
[bkit-tests] > @ bkit:gate:static-unit /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/consumer
[bkit-tests] > bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node gate.mjs
[bkit-tests] 
[bkit-tests] mkdir: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/cache: Not a directory
[bkit-tests] [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-6M2ECW/cache/bkit/machine-lock
[bkit-tests]  ELIFECYCLE  Command failed with exit code 73.
[bkit-tests]  WARN   Local package.json exists, but node_modules missing, did you mean to install?
[bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts)
[bkit-tests] verdict FAIL (exit 73)
: expected 1 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 1

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:358:42
    356|     fs.writeFileSync(cache, "a file cannot hold a lock directory");
    357|     const result = execute(runArgs());
    358|     expect(result.status, result.stderr).toBe(4);
       |                                          ^
    359|     expect(result.stderr).toContain(path.join(cache, "bkit", "machine-…
    360|     expect(output(result)).toMatchObject({ verdict: null });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run with --lock-wait-s=0 exits 81 at once against a held lock
AssertionError: [bkit-tests] unknown flag --lock-wait-s
: expected 2 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:367:42
    365|     const holder = await hold();
    366|     const result = execute([...runArgs(), "--lock-wait-s=0"]);
    367|     expect(result.status, result.stderr).toBe(81);
       |                                          ^
    368|     expect(output(result).lockHolder).toEqual(expect.stringContaining(…
    369|     expect(result.ms).toBeLessThan(BUDGET.testTimeout / 2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait
AssertionError: [bkit-tests] unknown flag --lock-wait-s
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:386:42
    384|       GATE_NESTED: "1",
    385|     });
    386|     expect(result.status, result.stderr).toBe(0);
       |                                          ^
    387|     expect(events().map((event) => event.event)).toEqual(["start", "en…
    388|     expect(events()[0]!.env).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 2 passed (13)
   Start at  08:32:54
   Duration  6.20s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6gyiyk/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests-changed.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-changed.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-changed.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-changed.test.ts

[test-timeout-budget] load average 14.1 on 10 cores: unit limits 7045ms per test, 14089ms per hook (x1.41)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests | 1 failed) 1807ms
   ✓ changedFiles (2)
     ✓ lists modified, staged and untracked files, and leaves out ignored and deleted ones 68ms
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 143ms
   ❯ tests changed (10)
     × tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate 44ms
     ✓ runs bkit:gate:changed with the changed files as its arguments 206ms
     ✓ counts files committed since --base 201ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 180ms
     ✓ runs nothing and exits 0 when no file changed 66ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 187ms
     ✓ runs the --fallback gate even when no file changed, as it did before 434ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 65ms
     ✓ exits 4 when the gate could not run 166ms
     ✓ refuses a --base that names no commit 44ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-changed.test.ts > tests changed > tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate
AssertionError: expected [ …(3) ] to deeply equal [ StringContaining{…}, …(2) ]

- Expected
+ Received

  [
-   StringContaining "--lock-wait-s takes a whole number >= 0",
-   StringContaining "--lock-wait-s takes a whole number >= 0",
-   StringContaining "--lock-wait-s takes a whole number >= 0",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
+   "[bkit-tests] unknown flag --lock-wait-s
+ ",
  ]

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts:128:49
    126|     );
    127|     expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
    128|     expect(results.map((result) => result.err)).toEqual([
       |                                                 ^
    129|       expect.stringContaining("--lock-wait-s takes a whole number >= 0…
    130|       expect.stringContaining("--lock-wait-s takes a whole number >= 0…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
   Start at  08:33:02
   Duration  1.97s (tests 95%, import 2%, transform 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9oufsX/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

[test-timeout-budget] load average 14.1 on 10 cores: unit limits 7045ms per test, 14089ms per hook (x1.41)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (29 tests | 1 failed | 2 skipped) 24ms
   ❯ bkit-local-gate-audit (#437) (29)
     × every prompt that runs bkit tests changed routes exit 81 to a re-run of the command 4ms
     ✓ no toolchain command is inlined at a call site (2)
       ✓ `pnpm turbo` appears nowhere unexempted — names a task runner instead of a bkit:gate* script 12ms
       ✓ `--filter='...[origin/dev]'` appears nowhere unexempted — turbo affected-selector inlined at a call site 3ms
     ✓ every call site dispatches through a named gate (9)
       ✓ .bkit/templates/.husky/pre-commit runs `pnpm bkit:gate:format` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static-unit` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:min` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-tasks.md runs `--fallback=bkit:gate:static`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-verify.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md runs `pnpm bkit:gate:install-static-unit-build` 0ms
     ✓ every gate a call site names is one install actually seeds 0ms
     ✓ workflows run the local gate only through `bkit tests run` 1ms
     ✓ every `tests run` call site of a workflow is probed 0ms
     ✓ bkit-build.md build-run-tests runs the deepest declared gate (through integration) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-build.md build-group-gate- runs the deepest declared gate (through unit) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-debug.md tests run runs the deepest declared gate (through live) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ✓ routes the engine's gate list where a block passes {GATE_FLAGS} 0ms
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ only debug reaches the live tier, and only its deepest gate carries the `live` word 0ms
     ✓ the seeded gates chain only scripts that exist here or are themselves gates 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > every prompt that runs bkit tests changed routes exit 81 to a re-run of the command
AssertionError: .bkit/core/prompts/bkit-build-plan-tasks.md: expected '10. Run `bkit tests changed --fallbac…' to match /(?:exit(?:s)?|exit code)\s+`?81\b/i

- Expected:
/(?:exit(?:s)?|exit code)\s+`?81\b/i

+ Received:
"10. Run `bkit tests changed --fallback=bkit:gate:static`. Every local lint and typecheck must pass."

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:135:25
    133|       expect(step, rel).toBeDefined();
    134|       expect(step, rel).toMatch(/\btests changed\b/);
    135|       expect(step, rel).toMatch(/(?:exit(?:s)?|exit code)\s+`?81\b/i);
       |                         ^
    136|       expect(step, rel).toMatch(/(?:re-run|rerun|run (?:it|the command…
    137|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 26 passed | 2 skipped (29)
   Start at  08:33:05
   Duration  143ms (tests 32%, import 23%, setup 22%, transform 20%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-J69RvG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
