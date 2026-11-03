# Docs Update

## Files Modified

- `CHANGELOG.md`

## Drift Resolved

History boundary: `git rev-parse --is-shallow-repository` printed `false`, so the full history behind `origin/dev..HEAD` (132 commits) was readable.

Docs the build already updated and that match the shipped code, so no edit was needed:

- `docs/architecture.md`: lists `ledgers/journal.ts`.
- `docs/observability.md`: the journal's stderr lines, `BKIT_ENGINE_JOURNAL=off`, the `[bkit-status-holes]` prefix and the start warning.
- `docs/testing.md`: the five-workflow contract, `pauseRows` / `subRows` / `anywhereCalls`, the sweep-liveness bats case and the CI `Check Status Holes` step.
- `.bkit/cli.md`: the `completeness` noun.
- `.bkit/jsonl.md`, `.bkit/workflows.md`: the `engine-call` and `completeness` row kinds.
- `.bkit/authoring.md`: the column-0 conditionality rule.

`CHANGELOG.md`: sync pass only. `## [Unreleased]` had no entry for this feature. Added one bullet under `### Added` covering `bkit completeness check`, the `engine-call` and `tool-failure` rows, `BKIT_ENGINE_JOURNAL=off`, the `completeness` row and start warning, the CI sweep, and the Step 4 skip row. The skip condition was checked against `.bkit/core/workflows/bkit-build.md:443` ("plan already in task-block form").

No reorganise, compress or cross-reference changes were needed. Agent memory (`MEMORY.md`) holds only pointers, so nothing there needed a change.

Not touched, reported only: `docs/roadmap.md` carries three extra stacked `_(refreshed …)_` lines above the current one at lines 26-28. The file is generated ("do not hand-edit the `bkit` tables"), so the next `bkit roadmap` run should replace them.

## Pending Items

From `ship-pending-items.md` (latest row per key):

- `699-engine-run-completeness-friction-recurrence-parallel-race`: OPEN, `low-severity`. Two parallel writers of the same friction recurrence can under-count by one.
- `699-friction-key-truncation-class-fix`: OPEN, `own-cycle`. The ~68-char prune truncation can collide long same-prefix friction keys.
- `699-completeness-verdict-no-success-axis`: OPEN, `scope-declared`. A required command that ran and failed still counts as present.
- `699-completeness-check-excludes-bkit-auto-router`: OPEN, `scope-declared`. The `bkit-auto` router has no contract.

Already CLOSED, listed for completeness:

- `699-task-25-visit-without-journaled-row-writer-judged-steps-only`
- the three `699-engine-run-completeness-challenge-low-*` rows
- `442-status-hole-detector-beyond-ship`

## Blockers

None
