Enforced: true
Red: 5
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/957-workflows-skip-re-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick --decision ticks the tasks of accepted verify-gap items" | red | failure: expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick --decision leaves a Fix now item's task open" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a continue decision after a holistic round resumes at Build Challenge" | red | failure: expected { …(8) } to match object { step: 'build-challenge', …(2) } (5 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a continue decision after a group verify resumes at Plan Execute" | red | failure: expected { step: 'build-plan-verify', …(7) } to match object { step: 'build-plan-tasks', …(2) } (5 matching properties omitted from actual) |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "an all-Accept holistic pause settles the holistic FAIL before it" | red | failure: expected [ …(4) ] to not include 'build-plan-verify-holistic FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a holistic pause with a Fix now item settles nothing" | passed-accepted | passes; accepted by the tests step: current summary.ts settles no holistic FAIL on a pause, so the negative case already holds |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tasks.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (24 tests | 2 failed) 1181ms
   ❯ bkit tasks tick (14)
     × tick --decision ticks the tasks of accepted verify-gap items 7ms
     × tick --decision leaves a Fix now item's task open 1ms
     ✓ tick marks only the named tasks 3ms
     ✓ tick refuses a task in another group 1ms
     ✓ tick refuses a plan with no task blocks 1ms
     ✓ tick narrows the group's gap-free tasks by --tasks 1ms
     ✓ ticks a task listed only under Updated tests 1ms
     ✓ ticks a task listed only under Already landed and skips a Gaps task 1ms
     ✓ tick is idempotent on an already-ticked task 1ms
     ✓ tick refuses a --tasks value that is not a task number 1ms
     ✓ tick refuses a --plan that is no file 0ms
     ✓ tick treats the header's none as nothing to tick 1ms
     ✓ tick leaves every other plan line byte-identical 1ms
     ✓ tick refuses a call with no --group or with neither selector 1ms
   ✓ bkit tasks open (4)
     ✓ open lists tasks with no done line 1ms
     ✓ open sets handover only when a task is open 1ms
     ✓ open lists a ticked task with no log line 1ms
     ✓ open refuses a plan with no task blocks 1ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 204ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 190ms
     ✓ currency emits no hunk outside the matched set 201ms
     ✓ currency refuses a plan with no task blocks 76ms
     ✓ currency exits 0 with no hunks when no task matches 187ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 297ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick --decision ticks the tasks of accepted verify-gap items
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:158:20
    156|     );
    157|     const r = await run(["tick", `--plan=${plan}`, "--group=1", `--dec…
    158|     expect(r.code).toBe(0);
       |                    ^
    159|     expect(r.json.ticked).toEqual([1, 3]);
    160|     expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > tick --decision leaves a Fix now item's task open
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:178:20
    176|     );
    177|     const r = await run(["tick", `--plan=${plan}`, "--group=1", `--dec…
    178|     expect(r.code).toBe(0);
       |                    ^
    179|     expect(r.json.ticked).toEqual([1]);
    180|     expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 22 passed (24)
   Start at  20:45:58
   Duration  1.50s (tests 84%, import 8%, transform 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-eEvwZ6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/step-table.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/step-table.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/step-table.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/step-table.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts (48 tests | 2 failed) 1113ms
   ✓ workflow progress (9)
     ✓ workflow progress runProgress flat workflow 2ms
     ✓ runProgress build groups 0ms
     ✓ runProgress groups added 0ms
     ✓ runProgress loop back 0ms
     ✓ runProgress bar width 1ms
     ✓ workflow progress runProgress all workflow numbers 1ms
     ✓ runProgress missing plan fallback 0ms
     ✓ workflow progress runProgress attempt suffix 0ms
     ✓ runProgress final completion only 0ms
   ❯ bkit status resume (39)
     ✓ a build stopped after build-challenge resumes at the challenge merge (Step 11) 16ms
     ✓ a build that stopped after Plan Convert resumes at Plan Convert (Step 4) 12ms
     ✓ a build that stopped after Plan Current resumes at Install Skills (Step 6) 12ms
     ✓ a build that stopped after Plan Verify resumes at Plan Verify (Step 8) 12ms
     ✓ the challenge round comes from status.jsonl, not the plan files 75ms
     ✓ a build-decision row's route places the resume point 43ms
     ✓ a retry decision after build-plan-verify resumes at that loop's fix step 12ms
     ✓ a retry decision after build-group-gate resumes at that loop's fix step 12ms
     ✓ a retry decision after build-run-tests resumes at that loop's fix step 11ms
     ✓ bkit status resume ignores ship rows for the removed failure steps 11ms
     ✓ a retry decision with no loop row before it places no resume point 11ms
     ✓ a holistic verify PASS row resumes at { step: 'build-challenge', number: 11 } 11ms
     ✓ a holistic verify CONCERNS row resumes at { …(2) } 11ms
     ✓ a holistic verify FAIL row resumes at { …(2) } 11ms
     ✓ a holistic gaps fix resumes at the holistic verify that judges it 11ms
     ✓ a decision after build-plan-verify-holistic with route retry resumes at build-plan-gaps-remediate-holistic 11ms
     ✓ a decision after build-plan-gaps-remediate-holistic with route retry resumes at build-plan-gaps-remediate-holistic 11ms
     ✓ a decision after build-plan-verify-holistic with route holistic resumes at build-plan-verify-holistic 12ms
     × a continue decision after a holistic round resumes at Build Challenge 19ms
     × a continue decision after a group verify resumes at Plan Execute 15ms
     ✓ challengeDone is true once a round-2 challenge has merged 65ms
     ✓ old reconcile, remediate or tests rows resume at Run Tests (Step 12) 31ms
     ✓ ignores plan rows for steps the plan workflow no longer has 11ms
     ✓ a plan run stopped after the old complexity steps resumes at Summary, Step 7 12ms
     ✓ ignores rows that are not steps of the table (a red-test row, the decision) 11ms
     ✓ build-plan-tests is step 7 Plan Execute resuming at build-plan-tests 11ms
     ✓ a HANDOVER execute resumes at Plan Execute with the same group; PASS goes on to verify 22ms
     ✓ plan: a completed step resumes at the next one 63ms
     ✓ plan: no rows resumes at Step 1; setup rows alone at Step 3 32ms
     ✓ design: a completed step resumes at the next one 107ms
     ✓ design: no rows resumes at Step 1; setup rows alone at Step 3 32ms
     ✓ build: a completed step resumes at the next one 92ms
     ✓ build: no rows resumes at Step 1; setup rows alone at Step 3 34ms
     ✓ debug: a completed step resumes at the next one 74ms
     ✓ debug: no rows resumes at Step 1; setup rows alone at Step 3 31ms
     ✓ ship: a completed step resumes at the next one 76ms
     ✓ ship: no rows resumes at Step 1; setup rows alone at Step 3 31ms
     ✓ a finished run, or another workflow's run, resumes at Step 1 21ms
     ✓ refuses an unknown workflow, and a malformed log (exit 3) 11ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a continue decision after a holistic round resumes at Build Challenge
AssertionError: expected { …(8) } to match object { step: 'build-challenge', …(2) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "after": "build-decision",
-   "number": 11,
-   "step": "build-challenge",
+   "after": "build-plan-verify-holistic",
+   "number": 10,
+   "step": "build-plan-verify-holistic",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:372:50
    370|         done("build", "build-decision", { route: "continue" }),
    371|       ]);
    372|       expect((await resume("build", file)).json).toMatchObject({
       |                                                  ^
    373|         step: "build-challenge",
    374|         number: 11,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-table.test.ts > bkit status resume > a continue decision after a group verify resumes at Plan Execute
AssertionError: expected { step: 'build-plan-verify', …(7) } to match object { step: 'build-plan-tasks', …(2) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "after": "build-decision",
-   "number": 7,
-   "step": "build-plan-tasks",
+   "after": "build-plan-verify",
+   "number": 8,
+   "step": "build-plan-verify",
  }

 ❯ .bkit/core/engine/commands/workflow/step-table.test.ts:387:50
    385|         done("build", "build-decision", { route: "continue" }),
    386|       ]);
    387|       expect((await resume("build", file)).json).toMatchObject({
       |                                                  ^
    388|         step: "build-plan-tasks",
    389|         number: 7,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 46 passed (48)
   Start at  20:46:01
   Duration  1.47s (tests 81%, import 9%, transform 7%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OwnDRd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (67 tests | 1 failed) 37ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 2ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (64)
     ✓ writes the header every reader expects, and the next step with the ref 2ms
     ✓ writes Publish: held when publish is false 0ms
     ✓ writes Publish: pr by default 0ms
     ✓ writes Docs: not synced on a held summary 0ms
     ✓ keeps the verdict and next step unchanged by publish 0ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 0ms
     ✓ a group check whose fix moved to a new group is resolved by the later whole-run checks 1ms
     ✓ a group check's CONCERNS is not cleared by the whole-run checks 1ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 0ms
     ✓ design clears only the review covered by a passing update 0ms
     ✓ plan clears only the review covered by a passing update 0ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 0ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 1ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 0ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 4ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 0ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 0ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 0ms
     ❯ a holistic pause (2)
       × an all-Accept holistic pause settles the holistic FAIL before it 5ms
       ✓ a holistic pause with a Fix now item settles nothing 0ms
     ✓ a later PASS whole-plan verify resolves a group's failed execution and gaps fix 0ms
     ✓ a later passing test run resolves a failed test-failure fix 0ms
     ✓ a test-fix FAIL resolved by a later passing test run on the same scope is historical 0ms
     ✓ a debug fix FAIL resolved by a later passing debug test run is historical 0ms
     ✓ a debug fix FAIL after a CI-sourced round is not resolved by a local pass 0ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 1ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 1ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 0ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 1ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 0ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 0ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 0ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 0ms
     ✓ ignores a warning record placed after a forged closing marker in a fenced context artifact 0ms
     ✓ ignores warning records inside an UNTRUSTED fence 0ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 0ms
     ✓ a verify pause's group (10)
       ✓ a verify pause's Fix now group is resolved once each fix task is verified 1ms
       ✓ a verify pause before the round limit resolves its Fix now group the same way 0ms
       ✓ a verify pause clears its group's FAIL only when every item is answered 1ms
       ✓ a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause 2ms
       ✓ a verify pause clears only the group its Group header names 1ms
       ✓ a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL 1ms
       ✓ a paused group's CONCERNS rows stay concerns after its Fix now task is verified 0ms
       ✓ a holistic or challenge decision file clears no group rows 1ms
       ✓ a group that paused more than once is settled by its latest qualifying decision 1ms
       ✓ an Accept-only verify pause resolves its group's FAIL rows before the pause 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a holistic pause > an all-Accept holistic pause settles the holistic FAIL before it
AssertionError: expected [ …(4) ] to not include 'build-plan-verify-holistic FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:647:29
    645|     it("an all-Accept holistic pause settles the holistic FAIL before …
    646|       const s = run(pause("Accept — minor", "Accept (assumed) — headle…
    647|       expect(s.reasons).not.toContain("build-plan-verify-holistic FAIL…
       |                             ^
    648|       expect(s.reasons).not.toContain("build-plan-gaps-remediate-holis…
    649|       const resolved = s.markdown.split("## Resolved Findings")[1]!.sp…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  20:46:04
   Duration  368ms (import 47%, transform 26%, tests 14%, setup 12%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-l2Kdy9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
