Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group).

## Integration Gaps

0. Task 1's engine contract (exit 16 `EXIT_GENERATE_FAILED`, the `generate` output field, the `finish` summary) matches what Task 2 documents in `.bkit/core/.bkit/workflows.md` § Local gate scripts (rendered identically into `.bkit/workflows.md`), `docs/deployments.md` § `dist/` commit policy and the `docs/testing.md` `steps.test.ts` row; `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` carry the same `finish` row as `stepsCommand`.

## Previously Attempted

- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-1-1.md` (Group 1, attempt 1): PASS, Tasks 1, 2, no gaps. This is the first holistic attempt.

## Notes

- TASK 1: `finish` in `.bkit/core/engine/commands/workflow/steps.ts` runs `bkit:generate` (`resolveGate` + `scriptCommand`, spawned by argv at the repo top level) only for `workflow=build`, `--commit=auto` and the three `CODE_STEPS`, after the pre-write `gateChecks` and before the planned-test lock, the `bkit.workflows` check and the `git add -A` commit. A non-zero exit logs the command, its status and the last 20 output lines through `ctx.log` and returns 16 before any row or commit. `CODE_STEPS` also drives the lock condition. `EXIT_GENERATE_FAILED = 16`, the `generate` output and the exit-code text are in `stepsCommand`.
- TASK 1 checks re-run in this verification: `pnpm exec vitest run .bkit/core/engine/commands/workflow/steps.test.ts` → 183 passed, the eight `TEST FIRST` tests included (real scratch git repo, real pre-commit hook, real `package.json` script, no mocks); `tsx .bkit/core/engine/tools/cli-doc.ts` exit 0 (so `pnpm cli:sync` leaves `cli.md` unchanged); `node scripts/gate/bkit-check-dist.mjs --ref=HEAD` exit 0; `git diff --name-only` from the merge base touches none of the forbidden files (`tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.husky/`, `.github/workflows/`).
- TASK 2: `grep -n "steps finish" .bkit/core/.bkit/workflows.md` shows the new `Callers` clause; `.bkit/workflows.md` carries it (hash refreshed in `.bkit/version`); `node dist/cli.js check` exit 0 with no mirror drift; `node scripts/gate/bkit-text-ceiling.mjs check` → prompts 83837, workflows 57977.
- Derived Test Matrix: all eight rows map to TASK 1's `TEST FIRST` / `DONE WHEN` tests, all passing. The plan has no `Documentation Updates` section; TASK 2 carries the doc rows. `docs/testing.md` and `docs/observability.md` are present; the exit-16 refusal logs on stderr and keeps stdout to one output object, as `docs/observability.md` asks.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all eight tests red then green; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- No decision records, gaps-remediate logs or `build-plan-current.md` were supplied.
- Out of scope, proposed separately (not gaps): `.bkit/core/workflows/bkit-build.md` routes exits 11, 12 and 15 from the code steps' finish blocks by name but not the new exit 16, so a failing `bkit:generate` falls to the generic non-zero route (Failure Path); the plan froze workflow and prompt text for this run. In `steps.ts` the existing comment "A code step never edits a planned test case..." now sits above the new generate block instead of the lock block it describes.

## Identified Gaps Log

None
