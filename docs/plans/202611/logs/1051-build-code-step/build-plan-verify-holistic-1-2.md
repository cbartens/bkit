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

2 of 2 (the plan has two groups: group 1 tasks 1-2, group 2 tasks 3-4).

## Integration Gaps

0. Group 2 rewrote parts of group 1's contract as the decision record directs, and the pieces agree across the engine, the build output and the docs:
- Task 3 removed Task 1's exit 16: `EXIT_GENERATE_FAILED`, its `exitCodes` row and the exit-16 `generate` help are gone from `.bkit/core/engine/commands/workflow/steps.ts` and `dist/commands/workflow/steps.js`. The `Callers` bullet of `.bkit/core/.bkit/workflows.md` § Local gate scripts (rendered identically into `.bkit/workflows.md`) now says a failure is logged, appends a friction row and never stops the step. The `docs/testing.md` `steps.test.ts` row says the same. The only `exit 16` strings left belong to `bkit branches sync-dev` in `branches.ts`, a different command.
- Task 4 wires its parts end to end. `workflowsBefore` is read in the Task 1 generate block before the script runs. The split check reads it, and the added keys reach both the `step-done` row (`extras.generatedWorkflows`, written by `writeStepRow`) and the JSON output (`generatedWorkflows`). The exit-13 text in the `exitCodes` row, in `.bkit/core/.bkit/workflows.md` § Limits are fixed for the run and in `docs/testing.md` matches the code.
- Task 1's `CODE_STEPS` set drives both the generate run and the planned-test lock. The `docs/deployments.md` § `dist/` commit policy bullet from Task 2 still holds after Task 3: a failing generate now lands the step instead of refusing it, and the bullet only describes a generate that succeeds.
- `isBkitOwnRepo` in `.bkit/core/engine/shared/package-roots.ts` is the one shared helper. `payload-links.ts` and `template-copies.ts` (both call sites) use it, so no inline `path.resolve(cwd) === getPkgRoot()` copy is left.

## Previously Attempted

- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-1.md` (holistic attempt 1, run after group 1 only): PASS, Tasks 1, 2, no gaps.
- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-1-1.md` (Group 1): PASS, Tasks 1, 2.
- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-2-1.md` (Group 2): PASS, Tasks 3, 4.
- No `build-plan-gaps-remediate-*-log.md` exists, because no remediate round ran.

## Notes

- Decision record `docs/plans/202611/logs/1051-build-code-step/build-decision-1-1.md`: the owner answered both Q1 and Q2 `B` (Fix now). The answers are recorded in `status.jsonl` as `decision-answer` rows with `by: owner`, so neither is an assumed accept. Tasks 3 and 4 are those fixes. Q1's ruling supersedes the exit-16 clause of Task 1's `DONE WHEN` ("a failing `bkit:generate` exits 16 with no row and no commit"), so Task 1 is judged on the rest of its `DONE WHEN`. The record accepts no gap.
- TASK 1 satisfied. For `workflow=build`, `--commit=auto` and the three `CODE_STEPS`, `finish` runs `bkit:generate` through `resolveGate` and `scriptCommand`, spawned by argv at the repo's top level. It runs after the gate checks and before the planned-test lock, the `bkit.workflows` check and the commit. The output prints `generate` as `ran`, `undeclared`, `failed` or null. The `summary` and `output` help are updated, and `CODE_STEPS` drives the lock condition.
- TASK 2 satisfied. `grep -n "steps finish" .bkit/core/.bkit/workflows.md` shows the `Callers` clause, and `docs/deployments.md` and the `docs/testing.md` row name the finish-time run. `.bkit/workflows.md` matches its source, and no file under `.bkit/core/workflows/` or `.bkit/core/prompts/` changed.
- TASK 3 satisfied. A failing generate logs the command, its exit and the last 20 lines, then calls `recordGenerateFriction` (the same shape as `recordTestLockFriction`, written through `appendFrictionRow`). It logs `generate: failed` and goes on to the lock, the `bkit.workflows` check, the row and the commit. No exit 16 is left.
- TASK 4 satisfied. A difference between `HEAD` and the before-generate reading is refused as the step's own edit (exit 13, in every repo). In bkit's own repo, a generated change that only adds keys rides the commit and is printed and written on the row. Any other generated change exits 13 and names `bkit:generate` and the keys. `isBkitOwnRepo(cwd, pkgRoot = getPkgRoot())` uses `git rev-parse --path-format=absolute --git-common-dir`. No config key, environment variable, flag or `name` decides it. The tests name the scratch root by mocking `node:url` `fileURLToPath` rather than passing the `pkgRoot` parameter. `isBkitOwnRepo` itself runs unmocked, so this is not a mock of the unit under test.
- Checks re-run in this verification:
  - `pnpm exec vitest run` on `steps.test.ts`, `package-roots.test.ts`, `payload-links.test.ts`, `payload-links.integration.test.ts`, `template-copies.test.ts` and `template-copies.integration.test.ts`: 6 files, 253 tests passed.
  - All 15 distinct `TEST FIRST` names are present, with no `.skip` or `.only`.
  - `tsx .bkit/core/engine/tools/cli-doc.ts` exit 0, so there is no `cli.md` drift.
  - `node scripts/gate/bkit-check-dist.mjs --ref=HEAD` exit 0.
  - `node scripts/gate/bkit-text-ceiling.mjs check`: prompts 83837, workflows 57977.
  - `node dist/cli.js check` exit 0.
  - `git diff --name-only` from the merge base touches none of the frozen files (`tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.husky/`, `.github/workflows/`).
- Derived Test Matrix: all 16 rows map to a test in their task's `TEST FIRST`. The row "a failing `bkit:generate` exits 16 ..." appears under both Task 1 and Task 3. It is one test, taken over by Task 3.
- Test-first audits: `build-tests-green-1-1.md` and `build-tests-green-2-1.md` both show `Enforced: true`, `Gaps: 0` and `Unproven: 0`, with all 16 tests red then green.
- Taken over: Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` (from Task 1). Judged as a new Task 3 test: it asserts exit 0, a new commit, the step row and one friction row, which matches Task 3's `DONE WHEN` and its matrix row. No gap.
- Mandatory tasks:
  - `docs/testing.md` and `docs/observability.md` are present. The failure logs on stderr and keeps stdout to one output object.
  - The plan has no `Documentation Updates` section. Tasks 2, 3 and 4 carry the doc rows.
  - The full suite was not run here. Per `Local tests first`, it belongs to the holistic gate and the pre-push hook.
  - The plan's `Verification Plan` dogfood box is advisory. The `steps.test.ts` cases drive the real `finish` against a scratch git repo with a real stale-output pre-commit hook.
- Out of scope, proposed separately (not gaps):
  - (a) The OPEN deferral `1051-build-code-step-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1439` in `docs/deferrals.jsonl` still describes its fix as "the exit-16 headline ... still exits 16", which Task 3 made obsolete. Its signal problem remains: a signal-killed generate logs and writes a friction row reading `exited undefined`.
  - (b) In `finish`, the comment "A code step never edits a planned test case ..." still sits above the generate block instead of the lock block it describes.
  - (c) The deferral for challenge finding `steps.ts:1426` (generate builds `docs/capabilities.md` from the pre-edit index) is open in `docs/deferrals.jsonl`, as the challenge routing left it.

## Identified Gaps Log

None
