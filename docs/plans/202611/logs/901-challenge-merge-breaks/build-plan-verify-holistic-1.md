Verdict: CONCERNS
Failures: 1
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

1 gap.

- The changed-file suite for the branch is unproven, not failing on the branch's code. `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 on four runs: other worktrees and repos kept taking the machine-wide tests lock, and the waits were 1200s, 1200s, 1200s and 3300s (`--lock-wait-s=3300`). Running `node scripts/gate/bkit-gate-changed.mjs` directly on the same file list gave these results:
  - `named`: 4547 of 4548 passed. The one failure is `.bkit/core/engine/commands/workflow/tracker.test.ts` `reserves new comment opportunity within total delivery budget`, a 200ms-budget timing test in a file this branch does not touch. It passed on a re-run.
  - `lint`, `format` and `types` passed.
  - `related` gave up on the vitest lock. Its re-run, `vitest related --run`, reported 40 failures in 9 files that do not involve the matrix header: install, upgrade, cloud-env, preflight tracker, push-gate, branches-lock, bats setup and test-file-script.
- During that `related` run, the worktree's `node_modules/.bin` was emptied at 18:52. The cause is not established, and this verifier ran no install. Both the symptoms in that run (`lint-staged` not found) and the failures in the clean re-run of the 9 files (92 failed with `tsx not found at node_modules/.bin/tsx; run pnpm install`) come from those missing links. The branch's only code change is the matrix-header check in `checkPlanText`, and none of the failing tests exercise it.
- Fix: restore the worktree's `node_modules` (`pnpm install`) and re-run `bkit tests changed`. No code change is expected.

Cross-group integration needs no further check, because the plan has one group. Inside it, the engine and the documents name the same header, `Test description | Type | Target file | Task`, in each of these places:
- `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts:898` and `dist/commands/workflow/tests.js:644`.
- The template at `.bkit/core/docs/templates/bkit-plan.md:71` and its copy `docs/templates/bkit-plan.md:71`.
- `bkit-plan-generate.md:46` and `bkit-build-plan-convert.md:36`.
- The shared `Scenario detail` and `Matrix shape` clauses in `.bkit/instructions.md` and the three prompts that carry them.
- The plan form at `.bkit/trackers.md:142`.
- The `challenge.test.ts` fixtures.
- The matrix header of every plan this month under `docs/plans/202611/`.

`bkit challenge merge` (`challenge.ts`) is unchanged and still finds the column through `derivedTestMatrix`.

## Previously Attempted

- `docs/plans/202611/logs/901-challenge-merge-breaks/build-plan-verify-1-1.md` (Group 1, attempt 1): `PASS`, Tasks 1, 2, no gaps. This is the first holistic attempt.

## Notes

- TASK 1 is satisfied. `checkPlanText` normalises the header, ignoring letter case and spaces at cell edges. When the header differs, it pushes one `matrix` problem that names the expected header, and a header with no `Task` column falls under that same problem. All five TEST FIRST tests exist (`tests.test.ts:1603-1680`). The targeted run of `tests.test.ts`, `challenge.test.ts`, `plan-blocks.test.ts` and `template-shape.test.ts` passed 223 of 223. `dist/` is rebuilt.
- The plan file still shows TASK 1 as `[ ]`, although the group verify report (`build-plan-verify-1-1.md`) judged it satisfied. The uncommitted tick from `tasks tick` changed only TASK 2. This report does not edit the plan, and the codebase satisfies TASK 1's `DONE WHEN`.
- TASK 2 is satisfied. Each of the three files names the four-column header and forbids extra columns. `rg -n "Task. column beside"` finds nothing in the convert prompt.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`. It has no `Unproven` and no `Updated tests` section. Under `Already landed`, TASK 1's `plan-check accepts the template matrix header in any letter case` passed before the change. The tests step's reason: the check already accepted any header with a `Task` column, and the test guards against an over-strict fix.
- The plan has no `Derived Test Matrix` and no `Documentation Updates` section. The change adds no error path, so `docs/observability.md` does not apply.
- The feature diff also carries `package.json`, `docs/decisions.jsonl`, `docs/failures.jsonl` and other plans. These arrive from the local `dev` branch through branch-sync (commits `f0a2df906`, `4b8e3c772` and others), not from this plan.
- Advisory: the host mirrors of the edited prompts are not re-rendered yet. `.agents/rules.md` runs `upgrade` once at session end.
- This verifier ran `pnpm instructions:sync`, which is a `--write` script. It rewrote nothing: `git status` is unchanged, which also confirms the shared clauses are in sync.
- No decision records or remediation logs were supplied.

## Identified Gaps Log

1 gap.

- INTEGRATION: Group 1 (TASKS 1, 2) full changed-file suite unproven — `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 four times (machine-wide tests lock never granted, about 2h15m queued); the direct `node scripts/gate/bkit-gate-changed.mjs` run passed lint, format and types, but its `related` stage reported 40 failures in 9 files unrelated to the matrix header, after the worktree's `node_modules/.bin` was emptied mid-run (18:52), and the re-run fails on `tsx not found at node_modules/.bin/tsx`; no code defect found; restore the worktree's `node_modules` (`pnpm install`) and re-run `bkit tests changed` — Fixable: true
