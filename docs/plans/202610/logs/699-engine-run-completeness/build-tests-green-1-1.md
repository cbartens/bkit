Enforced: true
Verdict: FAIL
Gaps: 3
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/run-facts.test.ts` "leaves a run's step minutes unchanged when journal rows land between step rows" | recorded 2026-10-28T12:57:41Z | no | passed |
| 1 | `scripts/harvest/bkit-harvest.test.mjs` "MARK_ROWS is the engine's" | missing | — | not passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "ignores a row type it does not know" | missing | — | passed |

## Gaps

- Task 1 `no-red` — no red recorded for "MARK_ROWS is the engine's" — the test was never seen failing before the code — Fixable: false — log: TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — no-red — Fixable: false
- Task 1 `not-green` — the named test "MARK_ROWS is the engine's" did not run; the report holds no tests — Fixable: true — log: TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — not-green — Fixable: true
- Task 2 `no-red` — no red recorded for "ignores a row type it does not know" — the test was never seen failing before the code — Fixable: false — log: TASK 2: `.bkit/core/engine/commands/workflow/status.test.ts` `ignores a row type it does not know` — no-red — Fixable: false

## Runner output — `scripts/harvest/bkit-harvest.test.mjs`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" scripts/harvest/bkit-harvest.test.mjs


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

No test files found, exiting with code 1

filter: scripts/harvest/bkit-harvest.test.mjs
include: .bkit/core/engine/**/*.test.ts, .bkit/core/engine/**/*.integration.test.ts, scripts/harvest/**/*.test.ts
exclude:  **/node_modules/**, **/.git/**

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-rfoBcX/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
