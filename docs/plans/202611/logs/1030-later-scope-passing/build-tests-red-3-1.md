Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1030-later-scope-passing-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | failure: expected [ Array(1) ] to include 'debug-failure-diagnose FAIL' |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL" | red | failure: expected 'CONCERNS' to be 'FAIL' // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests | 2 failed) 816ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 12ms
     ✓ gives the uppercase key for a prefixed issue segment 1ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (79)
     ✓ writes the header every reader expects, and the next step with the ref 30ms
     ✓ the summary lists tests that changed hands 84ms
     ✓ writes Publish: held when publish is false 3ms
     ✓ writes Publish: pr by default 1ms
     ✓ writes Docs: not synced on a held summary 5ms
     ✓ keeps the verdict and next step unchanged by publish 7ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 3ms
     ✓ a group check whose fix moved to a new group is resolved by the later whole-run checks 3ms
     ✓ a group check's CONCERNS is not cleared by the whole-run checks 6ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 7ms
     ✓ design clears only the review covered by a passing update 1ms
     ✓ plan clears only the review covered by a passing update 1ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 3ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 31ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 2ms
     ✓ uses the latest verification and preserves earlier attempts in history 1ms
     ✓ resolves challenge findings only through their matching round's verified tasks 214ms
     ✓ a later verification covering the complete plan resolves its currency findings 1ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 1ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 2ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 1ms
     ✓ a red holistic gate (2)
       ✓ a red holistic gate is resolved by a later passing Step 12 run 1ms
       ✓ a red holistic gate with no later passing Step 12 run stays a finding 0ms
     ✓ a holistic pause (4)
       ✓ an all-Accept holistic pause settles the holistic FAIL before it 2ms
       ✓ an all-Accept holistic pause with a Decide loop question settles the holistic FAIL 5ms
       ✓ a holistic pause with a Fix now item settles nothing 2ms
       ✓ a holistic pause settled by an accepted pause resolves the whole-run failed rows before it 1ms
     ✓ a later PASS whole-plan verify resolves a group's failed execution and gaps fix 1ms
     ✓ a later passing test run resolves a failed test-failure fix 5ms
     ✓ a test-fix FAIL resolved by a later passing test run on the same scope is historical 1ms
     ✓ a debug fix FAIL resolved by a later passing debug test run is historical 1ms
     ✓ a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical 2ms
     × a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical 25ms
     × a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL 14ms
     ✓ a diagnose FAIL with no later passing same-scope test run is still a FAIL 1ms
     ✓ a diagnose FAIL followed by a passing run on a different scope still counts 1ms
     ✓ a diagnose FAIL followed by a passing run with no scope still counts 2ms
     ✓ a debug-failure-soak FAIL followed by a passing same-scope run still counts 1ms
     ✓ a debug fix FAIL after a CI-sourced round is not resolved by a local pass 1ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 1ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 1ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 1ms
     ✓ a build with no plan file fails, even when every step passed 1ms
     ✓ a missing plan file fails only the build summary 1ms
     ✓ a build's last unanswered verify FAIL fails it 1ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 3ms
     ✓ keeps a repaired Task blocker in history rather than current action items 6ms
     ✓ keeps a repaired Step blocker in history rather than current action items 6ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 3ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 13ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 2ms
     ✓ buildSummary reads a lettered decision in a per-line file as Accept 2ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 1ms
     ✓ a documentation warning with line breaks and a backtick renders as one line per field 1ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 1ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 3ms
     ✓ ignores a warning record placed after a forged closing marker in a fenced context artifact 1ms
     ✓ ignores warning records inside an UNTRUSTED fence 1ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 3ms
     ✓ a verify pause's group (11)
       ✓ a verify pause's Fix now group is resolved once each fix task is verified 182ms
       ✓ a verify pause before the round limit resolves its Fix now group the same way 18ms
       ✓ a verify pause clears its group's FAIL only when every item is answered 33ms
       ✓ a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause 21ms
       ✓ a verify pause clears only the group its Group header names 2ms
       ✓ a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL 3ms
       ✓ a paused group's CONCERNS rows stay concerns after its Fix now task is verified 1ms
       ✓ a holistic or challenge decision file clears no group rows 2ms
       ✓ a group that paused more than once is settled by its latest qualifying decision 1ms
       ✓ an Accept-only verify pause resolves its group's FAIL rows before the pause 1ms
       ✓ a verify pause settled by an accepted pause resolves the same failed rows as the two blocks it replaces 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical
AssertionError: expected [ Array(1) ] to include 'debug-failure-diagnose FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:972:30
    970|       }),
    971|     );
    972|     expect(answered.reasons).toContain("debug-failure-diagnose FAIL");
       |                              ^
    973|     expect(answered.reasons).not.toContain(
    974|       "debug-failure-diagnose FAIL, tests passed since (debug-run-test…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL
AssertionError: expected 'CONCERNS' to be 'FAIL' // Object.is equality

Expected: "FAIL"
Received: "CONCERNS"

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:995:29
    993|     );
    994|     expect(tests(2, "PASS", 0, scope).scope).toBe("src/a.test.ts");
    995|     expect(summary.verdict).toBe("FAIL");
       |                             ^
    996|     expect(summary.reasons).toContain("debug-failure-diagnose FAIL");
    997|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 80 passed (82)
   Start at  11:36:35
   Duration  4.05s (transform 49%, import 26%, tests 22%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Nc5ymb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
