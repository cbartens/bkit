Enforced: true
Verdict: FAIL
Gaps: 2
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 13 | `tests/status-holes-sweep-liveness.bats` "the sweep prints the summary line the lane greps for" | missing | — | not passed |

## Gaps

- Task 13 `no-red` — no red recorded for "the sweep prints the summary line the lane greps for" — the test was never seen failing before the code — Fixable: false — log: TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — no-red — Fixable: false
- Task 13 `not-green` — the named test "the sweep prints the summary line the lane greps for" did not run; the report holds no tests — Fixable: true — log: TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — not-green — Fixable: true

## Runner output — `tests/status-holes-sweep-liveness.bats`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" tests/status-holes-sweep-liveness.bats


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

No test files found, exiting with code 1

filter: tests/status-holes-sweep-liveness.bats
include: .bkit/core/engine/**/*.test.ts, .bkit/core/engine/**/*.integration.test.ts, scripts/harvest/**/*.test.ts
exclude:  **/node_modules/**, **/.git/**

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lO6mol/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
