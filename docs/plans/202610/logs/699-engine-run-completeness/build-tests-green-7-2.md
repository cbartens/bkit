Enforced: true
Verdict: FAIL
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 13 | `tests/status-holes-sweep-liveness.bats` "the sweep prints the summary line the lane greps for" | missing | — | passed |

## Gaps

- Task 13 `no-red` — no red recorded for "the sweep prints the summary line the lane greps for" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — no-red — Fixable: false
