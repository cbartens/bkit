Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

NOTE — TASK 10 test 3 (refuses an unknown ending): already passed before code (unknown --ending flag is a usage error, exit 2); no red possible, test kept.
NOTE — TASK 11 tests 1-3 (bkit-harvest.test.mjs): red tool cannot run .mjs (vitest include excludes it, red 'not-run'); failures observed directly with node scripts/harvest/bkit-harvest.test.mjs (2 failed before code, 60 passed after). Test 11-3 and stats test 11-5 passed before code (no red possible).
DONE — TASK 10: Record ending held and publish false on the close — --ending/--publish on close, workflow-done + outcome rows, telemetry held/publish validation, jsonl.md + observability.md, dist rebuilt and staged (.bkit/core/engine/commands/workflow/workflows.ts)
DONE — TASK 11: Derive and display held in stats/harvest — endingOf, held report column, per-run ending row, stats held test, existing report regex updated, dist staged (scripts/harvest/bkit-harvest.mjs)
