Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/903-build-owner-s-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a test-fix FAIL resolved by a later passing test run on the same scope is historical" | red | failure: expected [] to include 'build-failure-remediate FAIL' |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug fix FAIL resolved by a later passing debug test run is historical" | red | failure: expected [ 'debug-failure-remediate FAIL' ] to not include 'debug-failure-remediate FAIL' |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug fix FAIL after a CI-sourced round is not resolved by a local pass" | red | failure: expected [ 'debug-failure-remediate FAIL' ] to not include 'debug-failure-remediate FAIL' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts

[test-timeout-budget] load average 28.1 on 10 cores: unit limits 18550ms per test, 37100ms per hook (x3.71)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (55 tests | 3 failed) 80ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 4ms
     ✓ gives the uppercase key for a prefixed issue segment 1ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (52)
     ✓ writes the header every reader expects, and the next step with the ref 5ms
     ✓ writes Publish: held when publish is false 1ms
     ✓ writes Publish: pr by default 1ms
     ✓ writes Docs: not synced on a held summary 2ms
     ✓ keeps the verdict and next step unchanged by publish 1ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 1ms
     ✓ a group check whose fix moved to a new group is resolved by the later whole-run checks 1ms
     ✓ a group check's CONCERNS is not cleared by the whole-run checks 1ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 2ms
     ✓ design clears only the review covered by a passing update 1ms
     ✓ plan clears only the review covered by a passing update 1ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 2ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 4ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 0ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 10ms
     ✓ a later verification covering the complete plan resolves its currency findings 1ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 1ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 1ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 0ms
     ✓ a later PASS whole-plan verify resolves a group's failed execution and gaps fix 0ms
     ✓ a later passing test run resolves a failed test-failure fix 1ms
     × a test-fix FAIL resolved by a later passing test run on the same scope is historical 11ms
     × a debug fix FAIL resolved by a later passing debug test run is historical 2ms
     × a debug fix FAIL after a CI-sourced round is not resolved by a local pass 1ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 1ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 1ms
     ✓ two plans ask to file plan issues first 1ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 2ms
     ✓ a build with no plan file fails, even when every step passed 1ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 1ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 3ms
     ✓ keeps a repaired Task blocker in history rather than current action items 1ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 0ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 2ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 1ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 1ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 0ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 0ms
     ✓ ignores a warning record placed after a forged closing marker in a fenced context artifact 0ms
     ✓ ignores warning records inside an UNTRUSTED fence 1ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a test-fix FAIL resolved by a later passing test run on the same scope is historical
AssertionError: expected [] to include 'build-failure-remediate FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:694:53
    692|       [tests(1, "FAIL", 1, scope), remediate, tests(2, "FAIL", 1, scop…
    693|     ])
    694|       expect(buildSummary(input({ rows })).reasons).toContain("build-f…
       |                                                     ^
    695|   });
    696|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a debug fix FAIL resolved by a later passing debug test run is historical
AssertionError: expected [ 'debug-failure-remediate FAIL' ] to not include 'debug-failure-remediate FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:713:34
    711|       }),
    712|     );
    713|     expect(answered.reasons).not.toContain("debug-failure-remediate FA…
       |                                  ^
    714|     expect(answered.markdown).toContain(
    715|       "debug-failure-remediate FAIL, resolved by debug-run-tests",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a debug fix FAIL after a CI-sourced round is not resolved by a local pass
AssertionError: expected [ 'debug-failure-remediate FAIL' ] to not include 'debug-failure-remediate FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:747:33
    745|       }),
    746|     );
    747|     expect(control.reasons).not.toContain("debug-failure-remediate FAI…
       |                                 ^
    748|
    749|     const ci = buildSummary(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 52 passed (55)
   Start at  16:21:21
   Duration  2.21s (transform 49%, import 36%, setup 7%, tests 6%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-hBKKqE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
