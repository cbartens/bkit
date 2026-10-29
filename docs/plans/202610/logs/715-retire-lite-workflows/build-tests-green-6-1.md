Enforced: true
Verdict: FAIL
Gaps: 7
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
| 12 | `.bkit/core/engine/tools/instructions-coverage.test.ts` "every standing line has an entry" | missing | — | not passed |
| 13 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "held close records the rows, summary and worktree-only roadmap row" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship pushes the held branch and opens a dev PR" | missing | — | passed |
| 13 | `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` "ship gates on CI and merges the pinned head" | missing | — | passed |

## Gaps

- Task 12 `no-red` — no red recorded for "bkit-build: the none render matches its baseline byte for byte" — the test was never seen failing before the code — Fixable: false — log: TASK 12: `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` — no-red — Fixable: false
- Task 12 `no-red` — no red recorded for "every standing line has an entry" — the test was never seen failing before the code — Fixable: false — log: TASK 12: `.bkit/core/engine/tools/instructions-coverage.test.ts` `every standing line has an entry` — no-red — Fixable: false
- Task 12 `not-green` — the named test "every standing line has an entry" did not run; the report holds "checkCoverage > the fixture passes", "checkCoverage > a standing line no entry matches fails and prints the entry to add", "checkCoverage > a local entry whose text left its file fails", "checkCoverage > a listed verbatim carrier without the text fails", "checkCoverage > a condensed carrier without a tagged local line fails", … — Fixable: true — log: TASK 12: `.bkit/core/engine/tools/instructions-coverage.test.ts` `every standing line has an entry` — not-green — Fixable: true
- Task 13 `no-red` — no red recorded for "held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock` — no-red — Fixable: false
- Task 13 `no-red` — no red recorded for "held close records the rows, summary and worktree-only roadmap row" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close records the rows, summary and worktree-only roadmap row` — no-red — Fixable: false
- Task 13 `no-red` — no red recorded for "ship pushes the held branch and opens a dev PR" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship pushes the held branch and opens a dev PR` — no-red — Fixable: false
- Task 13 `no-red` — no red recorded for "ship gates on CI and merges the pinned head" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship gates on CI and merges the pinned head` — no-red — Fixable: false

## Runner output — `.bkit/core/engine/tools/instructions-coverage.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/tools/instructions-coverage.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 337ms

 Test Files  1 passed (1)
      Tests  24 passed (24)
   Start at  13:37:28
   Duration  577ms (tests 67%, transform 18%, import 8%, setup 6%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Nxa9em/junit.xml
```
