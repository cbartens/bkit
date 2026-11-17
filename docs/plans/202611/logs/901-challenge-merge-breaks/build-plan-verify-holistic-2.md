Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has 1 group)

## Integration Gaps

2 gaps.

`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran three times. Run 1 exited 1, run 2 exited 81 (the `891-build-gate-stuck` push held the tests lock) and run 3 exited 1. Both failing runs passed `named` (68 files, 4624 tests, including `tests.test.ts`), the bats sweep, `lint`, `format` and `types`, and each failed `related` on exactly one test out of 9354. The failing test was different each time:

- Run 1: `.bkit/core/engine/commands/workflow/locks.test.ts` `publication ownership lock > bounds acquisition and preserves unverifiable owners` gave "expected null not to be null" at a load average of 26.4 on 10 cores. It passed 23 of 23 when run alone, and it passed in run 3.
- Run 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `workflow comment lifecycle across real CLI processes > preserves substantive step results under every comment boundary fault` timed out at 40200ms. It passed when run alone, and it passed in run 1.

The branch does not change either file, and neither one imports `tests.ts`. Both are timing-sensitive tests that failed while other worktrees were loading the machine. No code defect was found. The fix is to re-run `bkit tests changed` on a quieter machine until it exits 0.

Cross-group integration needs no further check, because the plan has one group. Inside it, the engine and the documents name the same header, `Test description | Type | Target file | Task`:
- `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts`, and `dist/commands/workflow/tests.js`.
- `.bkit/core/docs/templates/bkit-plan.md:71`.
- `bkit-plan-generate.md:46`, `bkit-build-plan-convert.md:36` and `.bkit/trackers.md:142`.
- The shared clauses in `.bkit/instructions.md` and the prompts that carry them (`bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`).
- The `Derived Test Matrix` header of every other plan under `docs/plans/202611/`.

`matrixRows` in the unchanged `challenge.ts` writes rows as `| {name} | {tier} | {file} | {task} |`, which is the same column order.

## Previously Attempted

- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-1-1.md` (Group 1, attempt 1): `PASS`, Tasks 1, 2, no gaps.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-holistic-1.md` (holistic attempt 1): `CONCERNS`, Tasks 1, 2, one `INTEGRATION` gap: the changed-file suite was unproven (tests lock never granted, worktree `node_modules/.bin` emptied mid-run).
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-gaps-remediate-holistic-1-log.md`: `PASS`, Fixed 1; `node_modules` restored and `bkit tests changed` exited 0, no code change.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-decision-1-1.md`: `Decision: Accept` on that gap.

## Notes

- TASK 1 is satisfied. `checkPlanText` normalises the header, ignoring letter case and spaces at cell edges. When the header differs, it pushes one `matrix` problem naming `Test description | Type | Target file | Task`, and a header with no `Task` column falls under that same problem. All five TEST FIRST tests exist (`tests.test.ts:1603-1680`), and `tests.test.ts` passed in the `named` stage of both completed runs. `dist/` is rebuilt.
- TASK 2 is satisfied. All three files name the four-column header. The two prompts say "no extra columns", and `.bkit/trackers.md:142` says "the four columns ... with `Task` last". `rg -n "Task. column beside"` finds nothing in the convert prompt. Both tasks are `[x]` in the plan.
- `build-decision-1-1.md` (`Decision: Accept`) accepts attempt 1's gap, which was that the suite could not be run. It does not cover the two failures this attempt observed, so those are logged as gaps.
- No test-first audit report was supplied, so step 8 does not apply.
- The plan has no `Derived Test Matrix` and no `Documentation Updates` section. The change adds no error path, so `docs/observability.md` does not apply.
- The feature diff also carries `package.json`, `docs/decisions.jsonl`, `docs/failures.jsonl`, `.bkit/friction.jsonl` and other plans. These come from `dev` through branch-sync, not from this plan.
- Advisory, not a gap: the host mirrors of the edited prompts are re-rendered by `upgrade` once at session end.
- Logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/e51408ae-6b05-4f5a-8b4c-2427dde89b52/scratchpad/changed-2.log` (run 1), `changed-3.log` (run 2, lock), `changed-4.log` (run 3), all in that scratchpad directory.

## Identified Gaps Log

2 gaps.

- INTEGRATION: Group 1 (TASKS 1, 2) `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` run 1 exited 1 (`failed: related`): `.bkit/core/engine/commands/workflow/locks.test.ts` `publication ownership lock > bounds acquisition and preserves unverifiable owners` failed ("expected null not to be null", load average 26.4 on 10 cores); the branch does not touch or import into that file, it passed 23 of 23 alone and passed in run 3; no code defect found; re-run `bkit tests changed` on a quieter machine until it exits 0 — Fixable: true
- INTEGRATION: Group 1 (TASKS 1, 2) `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` run 3 exited 1 (`failed: related`): `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `workflow comment lifecycle across real CLI processes > preserves substantive step results under every comment boundary fault` timed out at 40200ms; the branch does not touch or import into that file, it passed alone and passed in run 1; no code defect found; re-run `bkit tests changed` on a quieter machine until it exits 0 — Fixable: true
