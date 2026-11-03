Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 15: Build Steps 7 and 9 pass the verify header's `Tasks: none` into `--tasks=`, which `tick` refuses — `--tasks=none` (case-insensitive) now names nothing to tick: exit 0, `{"ticked":[]}`, plan byte-identical (same shasum); the flag help states "`none` ticks nothing"; red recorded (`build-task-red-9-15-1.md`), `pnpm build` + `node dist/cli.js tasks tick --plan=… --group=9 --tasks=none --json` exits 0 on the real plan (.bkit/core/engine/commands/workflow/tasks.ts, .bkit/core/engine/commands/workflow/tasks.test.ts) — `tick treats the header's none as nothing to tick`
DONE — TASK 16: `ledgers triage` re-adjudicates a `CLOSED` deferral — a folded row with `status: "CLOSED"` now buckets `Exempt` with `tests: []` and writes nothing, checked before any deferral test; an `OPEN` row keeps today's `Lazy` + one written row (dogfooded in a scratch repo: `701-closed` Exempt, no row; `701-open` Lazy, 1 written); red recorded (`build-task-red-9-16-1.md`) (.bkit/core/engine/commands/workflow/ledgers.ts, .bkit/core/engine/commands/workflow/ledgers.test.ts) — `triage writes no row for a closed deferral`
DONE — TASK 17: An already-adjudicated `unjustified` deferral is bucketed `Exempt` — a folded row with `reason: "unjustified"` now reports `Lazy`, writes no row, and a second `triage` prints the identical `rows` with `written: 0`; the sweep's `Exempt Deferrals` never receives it (dogfood: `701-adjudicated` Lazy on two runs, file unchanged); red recorded (`build-task-red-9-17-1.md`); triage's `rows` help names the settled-row case (.bkit/core/engine/commands/workflow/ledgers.ts, .bkit/core/engine/commands/workflow/ledgers.test.ts, docs/testing.md) — `triage reports an adjudicated unjustified row outside exempt`
