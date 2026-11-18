Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/811-publish-dev-refused-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev publishes the FAILED record through a PR" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with the PR path failing keeps the record and exits 10" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "closePr titles the PR by the record it carries" | red | passed |

## Gaps

None.
