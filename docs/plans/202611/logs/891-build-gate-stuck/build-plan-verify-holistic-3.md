Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 groups; group 1 holds Tasks 1, 2, 3 and 14; group 6 holds the challenge-round Tasks 15-19).

## Integration Gaps

0 integration gaps. Checked across groups:

- Groups 1 → 2: `tests-base.ts` reads cases through `reportFailures` / `countReportFailures` from the leaf `junit.ts` (imports only node built-ins, `install/manifest.js` and `shared/package-manager.js`), the same reader the gate's `test-run` row counts with. It uses `install`, `copyListed`, `devBase`, `withCleanup` and `latestRuntimeRow` as Task 2 exported them. It has no static import of `tests.ts` or `runs.ts`; `shipGate` comes through `await import("./runs.js")` (`tests-base.ts:206`).
- Groups 1 → 3: `LOOPS.verify.gate` feeds `loopProgress`, which reads `build-group-gate-{group}` `test-run` rows at the verify attempt.
- Groups 2 → 3: `decisions.ts` validates the `tests base` output fields itself and imports nothing from `tests-base.ts`.
- Groups 3 → 4 → 6: Decision Pause step 2 runs `tests base --log="{GATE_LOG}" … --out="{OUTBOX}/base-check.json"` (`bkit-build.md:153`) and passes `--header=Gate=FAIL` through `{BASE_FLAGS}` (`bkit-build.md:164`). `apply --by=rerun` (`decisions.ts:584`) and `openDecision` (`workflows.ts:283-284`) read `Gate:` only from the header block before the first blank line, which is where compose writes it. The Resume bullet maps `gate` to `OPEN_GATE`, then runs `steps finish` and `apply --by=rerun` in that order, and Step 8 sub-step 11 and Step 12 sub-step 4 route `GATE_RERUN` to the pause when still red and onward when green.
- Groups 2, 5 and 6 (the gap from holistic attempt 2): the CI wording now reads "a passing push-event CI run" in `.bkit/core/.bkit/workflows.md:984`, `.bkit/workflows.md:984`, `tests-base.ts:141` and `tests-base.ts:203`, and `dist/commands/workflow/tests-base.js:107,161`. That matches `shipGate(…, event: "push")` at `tests-base.ts:208`.
- Full feature: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` → verdict PASS, exit 0. The affected unit tier ran 65 files / 3606 tests passed; `bkit:gate:changed` ran 230 files / 9290 passed, 2 skipped, plus bats 16 ok, lint, Prettier and typecheck. `pnpm bkit:check:dist` exits 0, `node dist/cli.js check` exits 0 with no `DRIFT DETECTED`, and `git worktree list` shows no `bkit-base-*` worktree.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (holistic attempt 1, PASS, Tasks 1-14, 5 of 5 groups): written before the challenge round added group 6.
- `build-plan-verify-holistic-2.md` (holistic attempt 2, CONCERNS, 2 fixable gaps: the push-event CI wording drift across groups 2, 5 and 6, and the Task 12 group-mode clause). `build-plan-gaps-remediate-holistic-2-log.md` (PASS, Fixed: 2, commit `246c9f554`) closed both; this attempt re-checked each fix in the codebase.
- Group reports: `build-plan-verify-1-1.md`, `-2-1.md`, `-3-1.md` (CONCERNS, closed by their remediation rounds); `-1-2.md`, `-1-3.md`, `-2-2.md`, `-3-2.md`, `-4-1.md`, `-5-1.md`, `-6-1.md` (PASS).

## Notes

- All 19 tasks meet their `DONE WHEN` in the codebase. Every `TEST FIRST` test name (56 in all) exists in its planned file, and the full affected suite passes. Every Derived Test Matrix row maps to one of those tests. The `status-holes.test.ts` resume re-run case is the `resume re-run of a red group gate` suite (line 817).
- TASK 12 now holds the full planned rule at `.bkit/core/prompts/bkit-build-plan-verify.md:77` ("…is not a gap, unless a task's `DONE WHEN` or `TEST FIRST` names that test…"). The `.bkit/instructions.md` entry and every host mirror carry it too (`.claude`, `.cursor`, `.opencode`, `.codex`, `.agents/plugins`). Holistic step 7 is unchanged.
- TASK 16 is judged as `build-decision-1-3.md` directs (Decision: Fix now, refined by the owner 2026-11-10).
- `build-decision-1-1.md` Q2 (`Decision: Accept — Yes`, the owner's acceptance) accepted the Task 2 typecheck gap as closed by the Task 3 fix. Task 14 closed it, and `pnpm typecheck` passes in the gate run.
- Observation, not a gap: `bkit-build.md:164` adds `--base-check` only when `{LOOP_FLAGS}` is not empty. `--header=Gate=FAIL` is added whenever the base check ran. Earlier group verifies accepted this, because the base check only words the loop question.
- No test-first audit report was supplied for this holistic run, so step 8 had nothing to decide.
- Mandatory tasks: every `Documentation Updates` row is done. `docs/testing.md:757-758` names both `tests-base` files. `docs/capabilities.md` lists `tests-base` and `junit`. Both `cli.md` copies list `base` at line 375. The "Add an exception mechanism" sentence is gone from both `workflows.md` copies. The `891-*` decision and deferral rows exist. Errors reach the verb's log, because `shipGate` gets `ctx.log`.
- The supplied `tmp/bkit-diff-891-build-gate-stuck.md` has only partial diff coverage (the 20 largest files). The engine, workflow and prompt changes were read from the working tree and `git show 246c9f554` directly.

## Identified Gaps Log

None

