Verdict: CONCERNS
Failures: 1
Fixable: true

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 6` (one group — TASK 9, TASK 10, TASK 11), judged against `build-diff-6-1.md` (the changes since the group start) and the execute log's `DONE — TASK {N}` lines.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification attempt for group 6.

## Notes

One gap: TASK 10's `.bkit/pipeline.md` rewrite. The other two tasks hold.

- TASK 9 — satisfied. `.bkit/instructions.md`'s `plan-scenario-detail` `text` block gained `each with a target file and a `Task` cell naming the one runbook task that lands its test` and the old sentence moved into a `retired` fence; all four carriers (`bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`) carry the sentence in core and in every host mirror, and `bkit-build-plan-convert.md`'s Contract carries the new `Matrix shape` bullet. Named guards green: `instructions.test.ts` + `dogfood-templates.test.ts` + `template-shape.test.ts` = 166 tests passed; `instructions-coverage.test.ts` 22 passed.
- TASK 10 — NOT satisfied. `.bkit/core/.bkit/prompts.md` describes the changed scopes (convert, current, verify, deferred-sweep, update-docs; `bkit-plan-scope-check` already carried the matrix mapping from group 4), `.bkit/core/.bkit/workflows.md` carries build Steps 3, 6, 7 and 9 plus ship Steps 5 and 6 and the `tests` / `tasks` / `ledgers` primitive rows, `docs/testing.md` names `tasks.test.ts`, `plan-blocks.test.ts`, `challenge.test.ts` and extends `tests.test.ts` / `branches.test.ts` / `ledgers.test.ts`, and the knowledge row `plan-derived-test-matrix-needs-a-task-column` exists. `.bkit/pipeline.md` is untouched (gap 1). Its guards are green: catalog-parity + models-table-parity + verdict-vocabulary = 44 passed.
- TASK 11 — satisfied. Worktree `node dist/cli.js check` prints `0 write(s) would occur` and exits 0 (mirrors of all changed prompts / workflows / template in `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`); `pnpm graph:check` reports `docs/capabilities.md matches a rebuild at e44077002` (HEAD); `pnpm bkit:check:dist` (rm -rf dist && tsc && `git diff --exit-code dist/`) exits 0 with no `dist/` diff; a scratch directory run of `node dist/cli.js tasks --help` lists `tick` / `open` / `currency`, `branches scan-diff --help` lists `--disabled-tests` and its `disabled` output key, `ledgers --help` lists `triage`; `pnpm bkit:gate:static-unit-integration` exits 0 (47 integration files, 1602 coverage-unit tests) and `pnpm vitest run` is green (201 files, 7937 passed, 1 skipped).
- Test-first audit (`build-tests-green-6-1.md`): `Enforced: true`, `Gaps: 0` — no task 9-11 gap; all three tasks read `TEST FIRST: n/a` (prose, docs and artifact regeneration). Plan-currency report PASS, `Affected: 0`, so no `no-red` interaction. No `build-decision-*.md` and no `build-plan-gaps-remediate-6-*-log.md` exist, so no accepted decision record excuses the gap.
- `bkit tests plan-check --existence=report` on the plan: 0 problems, 0 existence findings; group 6 = 3 tasks, 0 planned tests.
- Ticks written by the engine, not by hand: `bkit tasks tick --plan=docs/plans/202610/701-engine-work-build-plan.md --group=6 --tasks="9,11"` → `ticked: 9, 11`; the plan diff is those two lines only. TASK 10 stays `[ ]`.
- A `bkit check` run with the main checkout's installed binary reports drift (60 writes) because it renders from the installed package, not this worktree; the worktree's own `node dist/cli.js check` is the dogfood path and is clean.

## Identified Gaps Log

1. TASK 10 — `.bkit/pipeline.md` still carries both stale verifier sentences verbatim: `:87` reads `6. verify group      (critic — the group's own diff; tick only on confirmed artifacts)` and `:213` reads `…; ticks boxes only on confirmed artifacts. Producer-critic loop…`, so the task's `.bkit/pipeline.md` update and the matching `Documentation Updates` row are undone (the template source `.bkit/core/.bkit/pipeline.md` is stale at the same two lines). Every other Task 10 deliverable is present and its three guards pass. — Fixable: true
