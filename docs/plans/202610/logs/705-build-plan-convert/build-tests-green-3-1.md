Enforced: true
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/705-build-plan-convert-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 3 | `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite" | missing | — | passed |

## Gaps

- Task 3 `red-mismatch` — no red for `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite"; reds recorded for `.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry" (passes now)
