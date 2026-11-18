Enforced: true
Red: 2
Accepted: 3
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1030-later-scope-passing-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | failure: expected [ 'build-failure-diagnose FAIL' ] to not include 'build-failure-diagnose FAIL' |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | failure: expected [ 'debug-failure-diagnose FAIL' ] to not include 'debug-failure-diagnose FAIL' |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run on a different scope still counts" | passed-accepted | passes; accepted by the tests step: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run with no scope still counts" | passed-accepted | passes; accepted by the tests step: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-soak FAIL followed by a passing same-scope run still counts" | passed-accepted | passes; accepted by the tests step: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1030-later-scope-passing
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1030-later-scope-passing
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1030-later-scope-passing

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (80 tests | 2 failed) 24ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 1ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (77)
     ✓ writes the header every reader expects, and the next step with the ref 1ms
     ✓ the summary lists tests that changed hands 1ms
     ✓ writes Publish: held when publish is false 0ms
     ✓ writes Publish: pr by default 0ms
     ✓ writes Docs: not synced on a held summary 0ms
     ✓ keeps the verdict and next step unchanged by publish 0ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 0ms
     ✓ a group check whose fix moved to a new group is resolved by the later whole-run checks 0ms
     ✓ a group check's CONCERNS is not cleared by the whole-run checks 0ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 0ms
     ✓ design clears only the review covered by a passing update 0ms
     ✓ plan clears only the review covered by a passing update 0ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 0ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 0ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 0ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 2ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 0ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 0ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 0ms
     ✓ a red holistic gate (2)
       ✓ a red holistic gate is resolved by a later passing Step 12 run 0ms
       ✓ a red holistic gate with no later passing Step 12 run stays a finding 0ms
     ✓ a holistic pause (4)
       ✓ an all-Accept holistic pause settles the holistic FAIL before it 0ms
       ✓ an all-Accept holistic pause with a Decide loop question settles the holistic FAIL 0ms
       ✓ a holistic pause with a Fix now item settles nothing 0ms
       ✓ a holistic pause settled by an accepted pause resolves the whole-run failed rows before it 0ms
     ✓ a later PASS whole-plan verify resolves a group's failed execution and gaps fix 0ms
     ✓ a later passing test run resolves a failed test-failure fix 0ms
     ✓ a test-fix FAIL resolved by a later passing test run on the same scope is historical 0ms
     ✓ a debug fix FAIL resolved by a later passing debug test run is historical 0ms
     × a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical 3ms
     × a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical 0ms
     ✓ a diagnose FAIL followed by a passing run on a different scope still counts 0ms
     ✓ a diagnose FAIL followed by a passing run with no scope still counts 0ms
     ✓ a debug-failure-soak FAIL followed by a passing same-scope run still counts 0ms
     ✓ a debug fix FAIL after a CI-sourced round is not resolved by a local pass 0ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 0ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 0ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 0ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 0ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 0ms
     ✓ buildSummary reads a lettered decision in a per-line file as Accept 0ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 0ms
     ✓ a documentation warning with line breaks and a backtick renders as one line per field 1ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 0ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 0ms
     ✓ ignores a warning record placed after a forged closing marker in a fenced context artifact 0ms
     ✓ ignores warning records inside an UNTRUSTED fence 0ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 1ms
     ✓ a verify pause's group (11)
       ✓ a verify pause's Fix now group is resolved once each fix task is verified 1ms
       ✓ a verify pause before the round limit resolves its Fix now group the same way 0ms
       ✓ a verify pause clears its group's FAIL only when every item is answered 0ms
       ✓ a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause 1ms
       ✓ a verify pause clears only the group its Group header names 0ms
       ✓ a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL 0ms
       ✓ a paused group's CONCERNS rows stay concerns after its Fix now task is verified 0ms
       ✓ a holistic or challenge decision file clears no group rows 0ms
       ✓ a group that paused more than once is settled by its latest qualifying decision 0ms
       ✓ an Accept-only verify pause resolves its group's FAIL rows before the pause 0ms
       ✓ a verify pause settled by an accepted pause resolves the same failed rows as the two blocks it replaces 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical
AssertionError: expected [ 'build-failure-diagnose FAIL' ] to not include 'build-failure-diagnose FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:954:34
    952|       input({ rows: [tests(1, "FAIL", 1, scope), diagnose, tests(2, "P…
    953|     );
    954|     expect(answered.reasons).not.toContain("build-failure-diagnose FAI…
       |                                  ^
    955|     const findings = answered.markdown.split("## Resolved Findings")[1…
    956|     expect(findings).toContain("build-failure-diagnose FAIL, resolved …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical
AssertionError: expected [ 'debug-failure-diagnose FAIL' ] to not include 'debug-failure-diagnose FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:968:34
    966|       }),
    967|     );
    968|     expect(answered.reasons).not.toContain("debug-failure-diagnose FAI…
       |                                  ^
    969|     expect(answered.markdown).toContain("debug-failure-diagnose FAIL, …
    970|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 78 passed (80)
   Start at  06:57:09
   Duration  294ms (transform 44%, import 34%, tests 11%, setup 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3Q0djy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
