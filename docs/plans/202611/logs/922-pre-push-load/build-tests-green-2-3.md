Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "setup with an .envrc differing from the main checkout's reports that the push will block" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → .bkit/.env tooling keys do not reach the gate" | red | passed |

## Gaps

None.
