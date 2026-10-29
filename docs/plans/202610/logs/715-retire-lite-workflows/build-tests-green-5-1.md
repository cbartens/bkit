Enforced: true
Verdict: FAIL
Gaps: 6
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "records ending held and publish false on the workflow-done row" | recorded 2026-10-29T02:12:11Z | no | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "defaults the close row to ending done" | recorded 2026-10-29T02:13:12Z | no | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "refuses an unknown ending" | already landed by TASK 9 (0139455) | — | passed |
| 10 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts held in outcome and run endings" | recorded 2026-10-29T02:14:36Z | no | passed |
| 10 | `.bkit/core/engine/ledgers/telemetry.test.ts` "keeps publish false on the outcome row" | recorded 2026-10-29T02:14:38Z | no | passed |
| 10 | `.bkit/core/engine/ledgers/telemetry.test.ts` "rejects a non-boolean publish" | recorded 2026-10-29T02:14:41Z | no | passed |
| 11 | `scripts/harvest/bkit-harvest.test.mjs` "derives held from a workflow-done row ending held" | missing | — | not passed |
| 11 | `scripts/harvest/bkit-harvest.test.mjs` "counts held runs in the workflow report" | missing | — | not passed |
| 11 | `scripts/harvest/bkit-harvest.test.mjs` "keeps a normal done run as done" | missing | — | not passed |
| 11 | `.bkit/core/engine/ledgers/telemetry.test.ts` "shows an ending row for a held close" | recorded 2026-10-29T02:14:56Z | no | passed |
| 11 | `.bkit/core/engine/commands/stats.test.ts` "counts a held outcome row in its kind total" | already landed by TASK 9 (0139455) | — | passed |

## Gaps

- Task 11 `no-red` — no red recorded for "derives held from a workflow-done row ending held" — the test was never seen failing before the code — Fixable: false — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` — no-red — Fixable: false
- Task 11 `not-green` — the named test "derives held from a workflow-done row ending held" did not run; the report holds no tests — Fixable: true — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` — not-green — Fixable: true
- Task 11 `no-red` — no red recorded for "counts held runs in the workflow report" — the test was never seen failing before the code — Fixable: false — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` — no-red — Fixable: false
- Task 11 `not-green` — the named test "counts held runs in the workflow report" did not run; the report holds no tests — Fixable: true — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` — not-green — Fixable: true
- Task 11 `no-red` — no red recorded for "keeps a normal done run as done" — the test was never seen failing before the code — Fixable: false — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` — no-red — Fixable: false
- Task 11 `not-green` — the named test "keeps a normal done run as done" did not run; the report holds no tests — Fixable: true — log: TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` — not-green — Fixable: true

## Late-red check

- Task 10 — not checked: no plan-execute step commit's log records `DONE — TASK 10`, so when its code landed is unknown
- Task 11 — not checked: no plan-execute step commit's log records `DONE — TASK 11`, so when its code landed is unknown

## Already landed

- Task 10 `.bkit/core/engine/commands/workflow/workflows.test.ts` "refuses an unknown ending" — passed at its red, standing on TASK 9's code (0139455), which shares its CREATE / UPDATE files; no red is due
- Task 11 `.bkit/core/engine/commands/stats.test.ts` "counts a held outcome row in its kind total" — passed at its red, standing on TASK 9's code (0139455), which shares its CREATE / UPDATE files; no red is due

## Runner output — `scripts/harvest/bkit-harvest.test.mjs`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" scripts/harvest/bkit-harvest.test.mjs


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

No test files found, exiting with code 1

filter: scripts/harvest/bkit-harvest.test.mjs
include: .bkit/core/engine/**/*.test.ts, .bkit/core/engine/**/*.integration.test.ts, scripts/harvest/**/*.test.ts
exclude:  **/node_modules/**, **/.git/**

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mOj7uV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
