Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

7 of 7 (the plan has 7 groups; group 1 holds Tasks 1, 2, 3 and 14, group 6 the challenge round 1 Tasks 15-19, group 7 the challenge round 2 Tasks 20-22).

## Integration Gaps

0 integration gaps.

Checked and consistent:

- Groups 1 → 2: `junit.ts` is a leaf (imports only node built-ins, `install/manifest.js` and `shared/package-manager.js`); `tests.ts` holds none of the moved definitions and imports them from `./junit.js` (line 67), and registers `base: testsBaseVerb` (line 1510). `tests-base.ts` uses `reportFailures` / `countReportFailures` / `runTestFile` from `junit.ts`, `install` / `copyListed` / `devBase` from `worktrees.ts`, `withCleanup` from `ci/ci.ts`, `latestRuntimeRow` from `runtime.ts`, and has no static import of `tests.ts` or `runs.ts` (`shipGate` through `await import("./runs.js")` at line 213, with `event: "push"`).
- Groups 2 → 3 → 7: the `tests base` output contract (`reason` now "why the verdict is unknown, or which cases could not be checked for some; else null", `tests-base.ts:145`) matches what `decisions compose --base-check` reads and words (`decisions.ts:479-494`: `all` with the still-red-after-resume sentence and the adopt merge sentence, `some` as "a round can fix {branch} of {failing}" plus the unchecked count, `none`, `unknown`). `decisions.ts` does not import `tests-base.ts`.
- Groups 3 → 4 → 6 → 7: Decision Pause step 2 (`bkit-build.md:140-167`) runs `tests base` for a `TESTS_LOOP` or red-gate pause, sets `{BASE_FLAGS}` (`--header=Gate=FAIL`, plus `--base-check` only with a loop question), and keeps gate and suite failures out of the items. The Contract **Resume** bullet (`bkit-build.md:43`) re-runs the gate only when `OPEN_GATE` = `FAIL` and the loop question is the only undecided question, finishing `build-decision` before `apply --by=rerun`; `apply --by=rerun` (`decisions.ts:596-628`) reads `Gate:` from the header block only, and refuses a file with no `## Progress` block or with undecided item questions. Steps 8 and 12 route a still-red re-run to the pause and clear `GATE_RERUN` on every route (`bkit-build.md:721-754`, `1030-1038`). `openDecision.gate` reads the header block only (`workflows.ts:284`).
- Group 4 prompt rule (Task 12) is at `.bkit/core/prompts/bkit-build-plan-verify.md:77`, with the `DONE WHEN` / `TEST FIRST` exception.
- Group 5 and generated files: `pnpm bkit:check:dist` exits 0; `node dist/cli.js check` exits 0 with no `DRIFT DETECTED`; `git worktree list` shows no `bkit-base-*` worktree.
- Full feature: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 three times (the machine-wide tests lock was held by other worktrees for the full 1200 s wait each time) and was re-run as directed. The fourth run passed: the affected unit tier 65 files / 3612 tests, and `bkit:gate:changed` 230 files / 9296 passed / 2 skipped, "every stage passed", verdict PASS, exit 0.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (PASS, Tasks 1-14, 5 of 5 groups), written before the challenge rounds.
- `build-plan-verify-holistic-2.md` (CONCERNS, 2 fixable gaps), closed by `build-plan-gaps-remediate-holistic-2-log.md`.
- `build-plan-verify-holistic-3.md` (PASS, Tasks 1-19, 6 of 6 groups), written before challenge round 2 added group 7.
- `build-plan-verify-holistic-4.md` (CONCERNS, 1 fixable gap: the `tests base` `reason` output help and the catalog **Base check** bullet still said `reason` is null for `some`), closed by `build-plan-gaps-remediate-holistic-4-log.md` (commit `a8b0f055c`). This attempt re-checked that fix: `tests-base.ts:145` and `dist/commands/workflow/tests-base.js:111` now read "why the verdict is unknown, or which cases could not be checked for some; else null", and both `workflows.md` copies (line 984) add "`some` with unchecked cases names them too". No other copy of the old wording remains.
- Group reports: `-1-1`, `-2-1`, `-3-1`, `-7-1` (CONCERNS, closed by their remediation rounds); `-1-2`, `-1-3`, `-2-2`, `-3-2`, `-4-1`, `-5-1`, `-6-1`, `-7-2` (PASS).

## Notes

- All 22 tasks meet their `DONE WHEN` in the codebase. Every `TEST FIRST` test name (63 entries, the Task 3 / Task 14 test counted twice) occurs exactly once in its planned file, and every Derived Test Matrix row maps to one of them.
- The one gap from holistic attempt 4 is closed; the targeted files for that fix (`tests-base.test.ts`, `cli-doc.test.ts`, `catalog-parity.test.ts`, `version-hashes.test.ts`, `decisions.test.ts`) pass (5 files, 67 tests), and the full changed run above passes.
- TASK 16 is judged as `build-decision-1-3.md` directs (Decision: Fix now, refined by the owner 2026-11-10).
- `build-decision-1-1.md` Q2 (`Decision: Accept — Yes`, the owner's acceptance) accepted the Task 2 typecheck gap as closed by the Task 3 fix; Task 14 closed it.
- No test-first audit report was supplied for this holistic run, so step 8 had nothing to decide.
- Mandatory tasks: every `Documentation Updates` row is done (`docs/testing.md:757-758` names both `tests-base` files, `docs/capabilities.md` lists `tests-base`, `.bkit/cli.md:375` lists `base`, the "Add an exception mechanism" sentence is gone from both `workflows.md` copies). Errors reach the verb's log through `ctx.log`, with no new log prefix, per `docs/observability.md`.
- The supplied `tmp/bkit-diff-891-build-gate-stuck.md` has partial diff coverage (the 20 largest of 85 files). The engine, workflow and catalog changes were read from the working tree and `git diff HEAD~1 HEAD` directly.

## Identified Gaps Log

None.

