Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "bkit status resume ignores ship rows for the removed failure steps" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "workflow progress runProgress all workflow numbers" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "workflow progress runProgress flat workflow" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "workflow progress runProgress attempt suffix" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "workflow progress command wiring progress specialized completion producers" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "workflow progress command wiring progress accepts the ship base-check regression guard gate" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "workflow progress command wiring progress gate only completions" | red | passed |
| 1 | `.bkit/core/engine/checks/status-holes.test.ts` "detectHoles reports a pre-change run's ship-failure rows as unexpected and no step as missing" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "status route --require=strategy is used at exactly the four strategy-routing sites" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "ship asks the Merge Question only when the merge attempts are used up" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names)" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `RETRY_LOOP_STEPS` in `.bkit/core/engine/checks/status-holes.ts` is still referenced: `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:1333`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:1524`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:868`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-2.md:1333`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-2.md:1524`, and 1 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
