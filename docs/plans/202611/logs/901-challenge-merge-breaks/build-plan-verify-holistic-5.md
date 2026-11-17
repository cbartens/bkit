Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups)

## Integration Gaps

0 gaps.

`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran once on 58 changed files and exited 1 with `verdict: FAIL`, failing only the `related` stage:

- `related`: 229 test files, 9354 passed, 1 failed, 2 skipped (9357). The one failure is `tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault`, which hit "Test timed out in 37800ms" after 60680ms. The load average was 3.6 at the start and 24.70 (5-minute) on 10 cores by the end.
- `named`: 69 test files, 4764 passed, 2 skipped (4766), including `.bkit/core/engine/commands/workflow/tests.test.ts` and `challenge.test.ts`.
- `bats`, `lint`, `format` and `types` passed.

That failure is the same test with the same timeout that `build-decision-1-2.md` Q2 accepted as a load-related flake (`Decision: Accept`). This branch does not touch `tracker.integration.test.ts` or `tracker.ts` (`git diff --stat origin/dev` is empty for both). Run on its own afterwards, it passed (1 passed, 12 skipped). Under that record it is not a gap.

Cross-group integration:

- Group 1 (TASK 1) pins the header in `checkPlanText` (`.bkit/core/engine/commands/workflow/tests.ts:898-909`). Group 2 (TASK 3) parses it with `.split("|").slice(1, -1)` plus trim, which is the same parse as `tableCells` in `plan-blocks.ts:128`, the parse `derivedTestMatrix` uses to find `taskColumn`. Group 3 (TASK 4) adds the row-shape check (`tests.ts:914-923`) inside the same `matrix.taskColumn !== null` branch. It reads `row.cells` from the same `tableCells` parse, and its `else if` chain keeps each row to one problem. The three groups read the same cells.
- Group 3 changed the Group 1 test `plan-check refuses a matrix header with an extra leading # column` so that it asserts the header problem first and then both 5-cell rows. That change fixes a test TASK 4 broke, because TASK 4's DONE WHEN refuses those rows. The `Task not last`, synonym, no-`Task`-column and no-closing-pipe tests still assert exactly one `matrix` problem, which is still correct: their rows have 4 cells and numeric `Task` cells, or `taskColumn` is null.
- `challenge.ts` is unchanged, as the plan's goal requires. `matrixRows` (`challenge.ts:282`) writes `| {name} | {tier} | \`{file}\` | {N} |`, which has 4 cells and a bare task number, so merged rows pass the TASK 4 row check. It already refuses a name or file that contains `|`.
- The pinned header `Test description | Type | Target file | Task` is the same in the engine message, `dist/commands/workflow/tests.js`, the template (`.bkit/core/docs/templates/bkit-plan.md:71`), `bkit-plan-generate.md:46`, `bkit-build-plan-convert.md:36`, the shared clauses in `.bkit/instructions.md` and `.bkit/trackers.md:142`.

## Previously Attempted

- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-1-1.md` (Group 1, attempt 1): `PASS`, Tasks 1, 2.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-2-1.md` (Group 2, attempt 1): `PASS`, Task 3.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-3-1.md` (Group 3, attempt 1): `PASS`, Task 4.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-holistic-1.md`: `CONCERNS`, changed-file suite unproven; closed by `build-plan-gaps-remediate-holistic-1-log.md` and accepted in `build-decision-1-1.md`.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-holistic-2.md`: `CONCERNS`, two load-related flakes (`locks.test.ts`, `tracker.integration.test.ts`); re-run in `build-plan-gaps-remediate-holistic-2-log.md` and accepted in `build-decision-1-2.md`.
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-holistic-3.md`: `PASS`, Tasks 1, 2 (1 group).
- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-holistic-4.md`: `PASS`, Tasks 1, 2, 3 (2 groups). After it, challenge round 2 (`build-challenge-1.md`) added Group 3 (TASK 4). This attempt is the first holistic check of Group 3. The security round (`build-challenge-2.md`) found nothing.

## Notes

- TASK 1 is satisfied. A differing header gets one `matrix` problem naming `Test description | Type | Target file | Task`. Letter case and spaces at cell edges are ignored, and a header with no `Task` column falls under that same problem. The five TEST FIRST tests exist in `tests.test.ts` and pass in `named`.
- TASK 2 is satisfied. Both prompts name the header with "no extra columns", and `.bkit/trackers.md:142` names the four columns "with `Task` last". `rg -n "Task. column beside"` on the convert prompt exits 1, so the old wording is gone.
- TASK 3 is satisfied. Dogfood: running `node dist/cli.js tests plan-check` on a scratch copy of this plan, with the header `| Test description | Type | Target file | Task` (no closing pipe) and a row naming TASK 7, exits 1 with one `matrix` problem naming the expected header. TEST FIRST `plan-check refuses a matrix header with no closing pipe` exists and passes.
- TASK 4 is satisfied. Dogfood on scratch copies, all under the template header:
  - Rows still in the old order (`| a | Unit | 1 | \`t1.test.ts\` |`) exit 1, with one row-shape `matrix` problem on each row's line.
  - Rows with an extra leading cell (5 cells) exit 1 the same way.
  - The good shape, with `1`, `3` and `TASK 4` in the `Task` cells, exits 0.
  - Both TEST FIRST tests exist and pass. `plan-check refuses a matrix row mapped to two tasks` and the challenge-merge tests pass in `named`.
- All four tasks are `[x]` in the plan. TASK 4's tick is uncommitted in the working tree, written by the workflow. No brief has a `Deviations` section.
- No test-first audit report was supplied for this attempt, so step 8 does not apply.
- Decision records:
  - `build-decision-1-2.md` (Q2, `Decision: Accept`) covers this attempt's only test failure, described above. This is the second time that test has timed out under load in this run's holistic checks.
  - `build-decision-1-1.md` (`Decision: Accept`) covers an earlier attempt, and this attempt does not rely on it.
- The plan has no `Derived Test Matrix` and no `Documentation Updates` section, so there are no matrix rows or doc rows to map. The change adds no error path, so `docs/observability.md` does not apply.
- Advisory, out of scope, not a gap: the `tests.test.ts` row at `docs/testing.md:760` still describes the matrix check as "a `Task` column on the matrix". It does not mention the pinned header or the row-shape refusal. The plan names no doc update for it.
- The feature diff also carries `package.json` (`publish.local` -> `false`), `docs/decisions.jsonl`, `docs/failures.jsonl`, `.bkit/friction.jsonl` and other plans. These come from `dev` through branch-sync, not from this plan.
- The run log's `vitest all gave up after 0s waiting for tests` is a lock check nested inside a test, and no stage failed on it. The `cloud-setup` lines say `db` and `cli` are unavailable here, which does not block anything.
- Run log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/e51408ae-6b05-4f5a-8b4c-2427dde89b52/scratchpad/changed-h5-1.log`. Dogfood plans and logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/e51408ae-6b05-4f5a-8b4c-2427dde89b52/scratchpad/h5/`.

## Identified Gaps Log

None
