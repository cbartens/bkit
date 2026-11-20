Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1: `finish` in `.bkit/core/engine/commands/workflow/steps.ts` runs `bkit:generate` (via `resolveGate` + `scriptCommand`, spawned by argv) for `workflow=build`, `--commit=auto` and the three `CODE_STEPS`, after the pre-write gate checks and before the planned-test lock, the `bkit.workflows` check and the commit. Exit 16 `EXIT_GENERATE_FAILED` added beside the other finish exits; the failure logs the command, its exit status and the last 20 output lines on stderr through `ctx.log`, and emits before any row or commit. `generate` (`ran` / `undeclared` / `failed` / null) is in the JSON output and the verb's `output`; `summary` and `exitCodes` updated. `CODE_STEPS` also drives the planned-test-lock condition. `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` carry the new `finish` row; `dist/commands/workflow/steps.js` rebuilt in the same commit.
- Checks run: `pnpm exec vitest run .bkit/core/engine/commands/workflow/steps.test.ts` → 183 passed (the eight `TEST FIRST` tests included); `tsx .bkit/core/engine/tools/cli-doc.ts` (check mode) exit 0, so `pnpm cli:sync` would leave `cli.md` unchanged; `node scripts/gate/bkit-check-dist.mjs --ref=HEAD` exit 0; `node scripts/gate/bkit-text-ceiling.mjs check` → prompts 83837, workflows 57977; `node dist/cli.js check` reports no mirror drift.
- Forbidden files: `git diff --name-only dev...HEAD` touches none of `tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts` (or their tests), `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.husky/`, `.github/workflows/`.
- TASK 2: `.bkit/core/.bkit/workflows.md` § Local gate scripts `Callers` bullet names `bkit steps finish` (exit 16), rendered identically into `.bkit/workflows.md` (hash refreshed in `.bkit/version`); `docs/deployments.md` § `dist/` commit policy and the `docs/testing.md` `steps.test.ts` row name the finish-time run; `docs/capabilities.md` has no row naming it, none added (as planned).
- Derived Test Matrix: all eight rows map to TASK 1 `TEST FIRST` / `DONE WHEN` tests in `steps.test.ts`; the tests run a real scratch git repo with a real pre-commit hook and a real `package.json` script (no mocks at the boundary). The plan has no `Documentation Updates` section; TASK 2 carries the doc rows.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all eight tests red then green; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- Observability: the exit-16 refusal logs on stderr with the command, exit status and output tail, matching `docs/observability.md` (stderr diagnostics, stdout one output object).
- No decision records or earlier verify / remediate reports for group 1 were supplied; `build-plan-current.md` is absent.

## Identified Gaps Log

None
