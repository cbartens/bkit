Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template's project section even when minPushPaths matches docs/**" | red | passed |
| 5 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a docs/audits file whose name has non-ASCII characters" | red | passed |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main" | red | passed |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template new to main whose project section was edited on origin/dev" | red | passed |

## Gaps

None.
