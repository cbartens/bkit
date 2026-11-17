Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 groups; group 1 holds Tasks 1, 2, 3 and 14; group 6 holds the challenge-round Tasks 15-19).

## Integration Gaps

1 integration gap.

- **Base-check CI contract drift (groups 2, 5 and 6):** Task 15 makes `tests base` read only push-event CI runs (`shipGate` with `event: "push"`, `tests-base.ts:207`), because a `pull_request` run may test only the affected packages. The contract text written by Task 6 and Task 13 still says that any passing run at the base sha settles `none`: `.bkit/core/.bkit/workflows.md:984` (and `.bkit/workflows.md:984`), the `source` output help at `tests-base.ts:140`, and the comment at `tests-base.ts:202`. An agent that reads the catalog or the verb help would expect a green `pull_request` run to settle the check. This needs a wording fix and the regenerated copies; it needs no design choice.

Checked and consistent (no gap):

- Groups 1 → 2: `tests base` reads cases through `reportFailures` / `countReportFailures` in `junit.ts`, which is the same reader the gate's `test-run` row counts with. It uses `install(…, { preferOffline: true })`, `copyListed`, `withCleanup` and `latestRuntimeRow` as Task 2 exported them. `tests-base.ts` has no static import of `tests.ts` or `runs.ts` (`shipGate` comes through `await import("./runs.js")`, line 205).
- Groups 1 → 3: `LOOPS.verify.gate` feeds `loopProgress`, which reads `build-group-gate-{group}` `test-run` rows at the verify attempt.
- Groups 2 → 3: `readBaseCheck` in `decisions.ts` validates the fields `tests base` writes. `decisions.ts` imports nothing from `tests-base.ts`.
- Groups 3 → 4 → 6: `compose` writes its header block (`Status: OPEN`, the `--header` lines, then a blank line, `decisions.ts:429`). Task 19's readers (`apply --by=rerun`, `decisions.ts:584`; `openDecision`, `workflows.ts:283`) read `Gate:` only from the text before the first blank line, so the `--header=Gate=FAIL` that Decision Pause step 2 passes still reaches `openDecision.gate` and the Resume re-run. `composeItems` collapses CR/LF in every item string field.
- Groups 2 → 6: Task 17's `exits` map and Task 18's `-c core.hooksPath=/dev/null` on `worktree add` keep `withCleanup(baseRun, …)` synchronous, and `baseVerdict` maps the new `unknown` cases as the plan says.
- Full feature: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` → verdict PASS, exit 0 on the second run (the first exited 81 on the machine-wide tests lock, held by another worktree's run). The affected unit tier ran 65 files / 3606 tests, `bkit:gate:changed` ran 230 files / 9290 passed and 2 skipped, and bats 13 + 13 passed. `pnpm bkit:check:dist` exits 0, `bkit check` exits 0 with no `DRIFT DETECTED`, and no `bkit-base-*` worktree is left registered.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (holistic attempt 1, PASS, Tasks 1-14, 5 of 5 groups): written before the challenge round added group 6 (Tasks 15-19).
- Group reports: `build-plan-verify-1-1.md` (CONCERNS), `-1-2.md` / `-1-3.md` (PASS), `-2-1.md` (CONCERNS), `-2-2.md` (PASS), `-3-1.md` (CONCERNS), `-3-2.md` (PASS), `-4-1.md`, `-5-1.md`, `-6-1.md` (PASS). `build-plan-verify-6-1.md` Notes proposed the CI-wording drift as an out-of-scope find; this holistic report logs it as an integration gap between groups 2, 5 and 6.

## Notes

- 18 of 19 tasks satisfy their `DONE WHEN` in the codebase. Every `TEST FIRST` test name exists once in its planned file, and every Derived Test Matrix row maps to a task's `TEST FIRST` test that exists and passes in the gate run.
- TASK 12 is left off `Tasks`. The prompt's group-mode line drops the planned exception "log one only when a task's `DONE WHEN` or `TEST FIRST` names that test" (plan § Architecture, `bkit-build-plan-verify.md` bullet, and § Breaking Changes). Its test only checks for "not a gap", "group gate" and "Step 12 / final run / holistic", so the test passes without the clause. `build-brief-4-1.md` has no `Deviations` section that would explain the drop.
- TASK 16 is judged as `build-decision-1-3.md` directs (Decision: Fix now, refined by the owner 2026-11-10). The `all` reason keeps `Stop`, claims only the failing tests, and adds the still-red-after-resume sentence (`decisions.ts:474`).
- `build-decision-1-1.md` Q2 (`Decision: Accept — Yes`, the owner's acceptance) accepted the Task 2 typecheck gap as closed by the Task 3 fix. Task 14 closed it, and `pnpm typecheck` passes in the gate.
- No test-first audit report was supplied for this holistic run, so step 8 had nothing to decide.
- Mandatory tasks: every `Documentation Updates` row is done (the `891-*` decision and deferral rows exist; `docs/testing.md:757-758` names both `tests-base` files; `docs/capabilities.md` lists `tests-base` and `junit`; `.bkit/cli.md:375` lists `base`; the "Add an exception mechanism" sentence is gone from both `workflows.md` copies). Only the CI-run wording in `workflows.md:984` is stale (the integration gap). Errors reach the verb's log: `shipGate` gets `ctx.log` (remediation `build-plan-gaps-remediate-2-1-log.md`).
- The supplied `tmp/bkit-diff-891-build-gate-stuck.md` has only partial diff coverage (the 20 largest files). The engine changes were read from `git diff da97be38..HEAD` and `git diff 2760419bd..HEAD` directly.

## Identified Gaps Log

2 gaps.

INTEGRATION: Task 15 (group 6) narrowed the CI evidence to push-event runs (`shipGate` with `event: "push"`, `tests-base.ts:207`), but the base-check contract that Tasks 6 and 13 (groups 2 and 5) wrote still says any passing run at the base sha settles `none`: `.bkit/core/.bkit/workflows.md:984` and its installed copy `.bkit/workflows.md:984` ("a CI run at that exact sha settles `none` when it passed"), the `source` output help at `.bkit/core/engine/commands/workflow/tests-base.ts:140` ("ci (a passing CI run at the base sha)") and the comment at `tests-base.ts:202`; reword all three to "a passing push-event CI run at that exact sha", then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `dist/` and `.bkit/workflows.md` follow — Fixable: true
TASK 12: `.bkit/core/prompts/bkit-build-plan-verify.md:77` (Process step 6, Group mode) holds only the first half of the planned rule ("A failing test that the group gate (`bkit:gate:static-unit`) runs is not a gap"); it drops the exception the plan's Architecture and Breaking Changes sections name ("log one only when a task's `DONE WHEN` or `TEST FIRST` names that test"), so the group-mode rule now contradicts Process step 9 (a task whose `DONE WHEN` names a red gate-run test is still not satisfied); add the clause, then run the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts`, `pnpm instructions:sync` (the `.bkit/instructions.md:10843` entry follows) and `upgrade` for the host mirrors — Fixable: true
