Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/920-build-agents-run-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/tools/instructions.test.ts` "every build and debug prompt that runs tests carries local-pre-commit" | red | passed |
| 1 | `.bkit/core/engine/tools/instructions.test.ts` "local-pre-commit covers test runs made while working, not only before a commit" | red | passed |

## Gaps

None.
