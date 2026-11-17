Enforced: true
Verdict: null
Gaps: 2
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
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail treats an empty --next-step as absent" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step on exit 2" | red | not passed |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit" | red | passed |

## Gaps

- Task 4 `not-green` — the named test "the Failure Path re-runs workflows fail without --next-step on exit 2" did not run; the report holds "deferred sweep — disabled-test evidence > adjudicates every scanner hit against the diff and current coverage", "deferred sweep — disabled-test evidence > requires scoped owner approval and current-contract evidence for retirement", "deferred sweep — disabled-test evidence > blocks scan errors, real disabling markers and unproven deletions", "deferred sweep — disabled-test evidence > records each disposition and requires complete adjudication before PASS", "ship reconciliation and retry contracts > reconciles and publishes feature code before bookkeeping on every ship path", … — Fixable: true — log: TASK 4: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path re-runs workflows fail without --next-step on exit 2` — not-green — Fixable: true
- Task 1 `delete-still-referenced` — DELETE `RETRY_LOOP_STEPS` in `.bkit/core/engine/checks/status-holes.ts` is still referenced: `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:1333`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:1524`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-1.md:868`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-2.md:1333`, `docs/plans/202610/logs/699-engine-run-completeness/build-diff-3-2.md:1524`, and 1 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 9.5 on 10 cores: unit limits 9250ms per test, 18500ms per hook (x1.85)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (68 tests) 75ms

 Test Files  1 passed (1)
      Tests  68 passed (68)
   Start at  21:18:35
   Duration  315ms (tests 45%, setup 39%, transform 9%, import 5%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5Aj9sM/junit.xml
```
