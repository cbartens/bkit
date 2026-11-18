Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1030-later-scope-passing-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run on a different scope still counts" | passed-accepted | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run with no scope still counts" | passed-accepted | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-soak FAIL followed by a passing same-scope run still counts" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run on a different scope still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a diagnose FAIL followed by a passing run with no scope still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
- Task 1 `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug-failure-soak FAIL followed by a passing same-scope run still counts" — passed at the group's red, and the tests step accepted it: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added; no red is due
