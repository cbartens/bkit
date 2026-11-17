Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a pull_request-event CI run at the base sha does not settle none" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all says a gate still red after resume comes from this branch" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that exits non-zero without the failing case reads unknown" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > the base test run does not inherit the hooks-off git config" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header" | red | passed |

## Gaps

None.
