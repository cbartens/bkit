# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md` § Debug CI evidence verification:
  - Sync: item 1 now states the first CI round's failure count (the selected run's failed jobs, the capstone left out, or unknown when the jobs were not read). The `debug-ci-evidence.integration.test.ts` paragraph now names the new case: the CI round's failed-job count, then an `unknown` Loop Question trend after an uncounted local round.
  - Reorganize, compress and cross-references: no change needed; both edits sit in the section's existing sentences.
- The build already applied the plan's `Documentation Updates` rows: `docs/testing.md` § JUnit reports for bkit (`CI rounds` bullet) and the `commands/workflow/counters.test.ts` row in § Counter derivation test coverage; `.bkit/core/.bkit/workflows.md` (mirrored to `.bkit/workflows.md`), `.bkit/core/.bkit/authoring.md` (mirrored to `.bkit/authoring.md`), `.bkit/instructions.md` and the two render baselines. Re-checked against the shipped code; no drift.
- A search of `docs/*.md` (outside `docs/plans/` and `docs/roadmap.md`) for `trend`, `stuck`, `left no fewer`, `failedJobCount`, `counters progress`, `trendLine` and `loopProgress` found no other stale text.

## Unresolved Coverage

- `docs/testing.md` file inventory: `commands/workflow/decisions.test.ts`, `ledgers/status.test.ts` and `ledgers/telemetry.test.ts` have no inventory row, and the `commands/workflow/runs.test.ts` rows do not name `runs locate`. These gaps predate this ship and cover more than its change, so they are left to a docs sweep.
- Ten recommended topics: `docs/testing.md` is the only one the shipped files touch. `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md` and `docs/setup.md` are not applicable: no topology, dependency, auth, database, CI lane, log name, UI, signal downgrade or local setup changed. Every one is present and indexed in `.agents/docs.md`.

## Pending Items

- `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-463` — an empty `--max` makes every unknown-trend pause claim "the limit is used up".
- `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-464` — after a granted retry, `decisions compose --loop` checks the claim against the original limit, not the raised one.
- `912-debug-loop-question-challenge-low-bkit-core-engine-ledgers-status-ts-350` — a hand-appended CI `test-run` row can claim any positive failure count.
- `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-466` — a line break in a row's `scope` can plant a `Recommended:` line in the loop question.
- `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-435` — two CI generations of one run share a scope and are compared.
- `912-debug-loop-question-challenge-low-bkit-core-engine-ledgers-status-ts-338` — `ciRoundMatches` accepts a CI count the selection does not back.
- `912-debug-loop-question-challenge-low-bkit-core-engine-commands-workflow-counters-ts-470` — the closing `trendLine` says "and the code changed" when git could not tell.

## Blockers

None
