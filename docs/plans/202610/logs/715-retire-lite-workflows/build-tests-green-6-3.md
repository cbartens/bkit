Enforced: true
Verdict: PASS
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "resolves publish through status route" | recorded 2026-10-29T03:03:30Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "re-derives publish on resume" | recorded 2026-10-29T03:03:31Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "warns when a non-LOCAL run resolves publish false" | recorded 2026-10-29T03:03:32Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "skips push, PR and CI on a held close" | recorded 2026-10-29T03:03:34Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "keeps the publish=true close path" | recorded 2026-10-29T03:03:35Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "appends the held roadmap row without roadmap mirror" | recorded 2026-10-29T03:03:37Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "makes Gate 15 conditional on the held path" | recorded 2026-10-29T03:03:39Z | outside the test only | passed |
| 12 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "runs only the close gate on the held path" | recorded 2026-10-29T03:03:40Z | outside the test only | passed |
| 12 | `.bkit/core/engine/render/trackers.test.ts` "bkit-build: the none render matches its baseline byte for byte" | missing | — | passed |
| 12 | `.bkit/core/engine/tools/instructions-coverage.test.ts` "the repo > has no coverage findings" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close records the rows, summary and worktree-only roadmap row" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship pushes the held branch and opens a dev PR" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship gates on CI and merges the pinned head" | missing | — | passed |

## Gaps

None.

## Test exceptions

- Task 12 — honoured; cleared `no-red` for `.bkit/core/engine/render/trackers.test.ts` "bkit-build: the none render matches its baseline byte for byte", `no-red` for `.bkit/core/engine/tools/instructions-coverage.test.ts` "the repo > has no coverage findings"
- Task 13 — honoured; cleared `no-red` for `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock", `no-red` for `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close records the rows, summary and worktree-only roadmap row", `no-red` for `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship pushes the held branch and opens a dev PR", `no-red` for `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship gates on CI and merges the pinned head"
