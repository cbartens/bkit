Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

7 of 7 (the plan has 7 groups; group 1 holds Tasks 1, 2, 3 and 14, group 6 the challenge round 1 Tasks 15-19, group 7 the challenge round 2 Tasks 20-22).

## Integration Gaps

1 integration gap.

- **`tests base` `reason` contract drift (groups 2, 5 and 7):** Task 22 makes verdict `some` carry a reason whenever some cases could not be checked (`baseVerdict`, `tests-base.ts:92-99`; the verb's crash, no-report, unresolved or skipped reason, `tests-base.ts:301-312`), and `decisions compose` prints it in the `some` sentence (`decisions.ts:486-490`). The verb's output help that Task 5 wrote still says `reason` is "why the verdict is unknown, else null" (`tests-base.ts:145`, and `dist/commands/workflow/tests-base.js`). The catalog's **Base check** bullet from Task 13 (`.bkit/core/.bkit/workflows.md:984`, installed copy `.bkit/workflows.md:984`) says only "`unknown` names its reason". This is a wording fix with regenerated copies; it needs no design choice.

Checked and consistent (no gap):

- Groups 1 → 2: `tests-base.ts` reads cases through `reportFailures` / `countReportFailures` in the leaf `junit.ts`, whose `CaseState` (`passed | failure | error | skipped`) is what Task 21's `passed` → `pass`, `skipped` → `unknown` mapping reads. It uses `install`, `copyListed`, `devBase`, `withCleanup` and `latestRuntimeRow` as Task 2 exported them, and has no static import of `tests.ts` or `runs.ts` (`shipGate` via `await import("./runs.js")`, `tests-base.ts:213`, `event: "push"`).
- Groups 2 → 3 → 7: `tests base` writes `branch` and `undetermined` (`BaseVerdict`, `tests-base.ts:37-44`), and `readBaseCheck` now reads both, with fallbacks (`failing - baseRed`, 0) for an older output (`decisions.ts:225-251`). Compose words `some` as "a round can fix {branch} of {failing}" plus "{undetermined} could not be checked: {reason}".
- Groups 3 → 4 → 6 → 7: Decision Pause step 2 passes `--header=Gate=FAIL` whenever the base check ran, and `--base-check` only with a loop question. A `Gate: FAIL` file with no `## Progress` block, or with undecided item questions, is now refused by `apply --by=rerun` (`decisions.ts:603-620`, undecided numbers named, nothing written) and sent by the Contract **Resume** bullet (`bkit-build.md:43`) to **Decision Pause** step 3. The catalog bullet **Resume into a red-gate pause** (`.bkit/core/.bkit/workflows.md:985`) says the same. The Resume bullet's new text is in the source, the render snapshot and all 5 host copies (`.claude`, `.cursor`, `.opencode`, both `.agents` skills). `openDecision` and `apply` still read `Gate:` from the header block only (Task 19).
- Group 4 prompt rule (Task 12) still holds the `DONE WHEN` / `TEST FIRST` exception at `.bkit/core/prompts/bkit-build-plan-verify.md:77`.
- Generated files: `pnpm bkit:check:dist` exits 0, `node dist/cli.js check` exits 0 with no `DRIFT DETECTED`, and `git worktree list` shows no `bkit-base-*` worktree.
- Full feature: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`. The first run exited 81 (another worktree held the machine-wide tests lock) and was re-run. The re-run's affected unit tier passed 65 files / 3612 tests. `bkit:gate:changed` reported 2 failed / 9294 passed / 2 skipped of 230 files: `test-file-script.integration.test.ts` `node — with no report path the test file is left as it was` (a SIGTERM timing assertion inside `scripts/ci/bkit-test-awake.test.mjs:110`) and `tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` (timed out at 45600 ms). A targeted repro of both files under the tests lock passed (2 files, 29 tests). Neither file, nor `scripts/ci/bkit-test-awake.test.mjs`, is in the branch diff, so both are load-sensitive flakes (the open budget issue #814), not failures of this plan; no gap is logged for them.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (PASS, Tasks 1-14, 5 of 5 groups), written before the challenge rounds.
- `build-plan-verify-holistic-2.md` (CONCERNS, 2 fixable gaps: the push-event CI wording drift and the Task 12 clause), closed by `build-plan-gaps-remediate-holistic-2-log.md` (commit `246c9f554`).
- `build-plan-verify-holistic-3.md` (PASS, Tasks 1-19, 6 of 6 groups), written before challenge round 2 added group 7.
- Group 7: `build-plan-verify-7-1.md` (CONCERNS, 2 Task 20 gaps), closed by `build-plan-gaps-remediate-7-1-log.md`; `build-plan-verify-7-2.md` (PASS, Tasks 20-22). This attempt re-checked those fixes in the codebase.
- Earlier group reports: `-1-1`, `-2-1`, `-3-1` (CONCERNS, closed by their remediation rounds); `-1-2`, `-1-3`, `-2-2`, `-3-2`, `-4-1`, `-5-1`, `-6-1` (PASS).

## Notes

- All 22 tasks meet their `DONE WHEN` in the codebase. Every `TEST FIRST` test name (62 in all) occurs exactly once in its planned file, every Derived Test Matrix row maps to one of them (the Task 11 `status-holes.test.ts` row is the `resume re-run of a red group gate` suite, line 817), and the affected unit tier plus every touched integration file pass.
- The one gap is cross-group contract text, not a task's `DONE WHEN`: Task 22's own conditions hold, so it stays on `Tasks`, as holistic attempt 2 did for Tasks 6, 13 and 15 with the CI wording drift.
- TASK 16 is judged as `build-decision-1-3.md` directs (Decision: Fix now, refined by the owner 2026-11-10).
- `build-decision-1-1.md` Q2 (`Decision: Accept — Yes`, the owner's acceptance) accepted the Task 2 typecheck gap as closed by the Task 3 fix; Task 14 closed it.
- No test-first audit report was supplied for this holistic run, so step 8 had nothing to decide.
- Mandatory tasks: every `Documentation Updates` row is done (`docs/testing.md:757-758` names both `tests-base` files, `docs/capabilities.md` lists `tests-base`, `.bkit/cli.md:375` lists `base`, the "Add an exception mechanism" sentence is gone from both `workflows.md` copies, and the `891-*` decision and deferral rows exist). Errors reach the verb's log through `ctx.log` (`[bkit-tests]`, and `shipGate`'s `[bkit-runs]`), with no new prefix, per `docs/observability.md` § Log Format.
- The supplied `tmp/bkit-diff-891-build-gate-stuck.md` has partial diff coverage (the 20 largest files). The engine, workflow and catalog changes were read from the working tree and `git diff a63968093..HEAD` directly.

## Identified Gaps Log

1 gap.


INTEGRATION: Task 22 (group 7) gives verdict `some` a non-null `reason` whenever `undetermined` > 0 (`baseVerdict`, `.bkit/core/engine/commands/workflow/tests-base.ts:92-99`, and the verb's `some` reason at `tests-base.ts:301-312`), and `decisions compose` reads it for `some` (`decisions.ts:486-490`). But the `tests base` output contract that Task 5 (group 2) wrote still says `reason` is "why the verdict is unknown, else null" (`tests-base.ts:145`, built into `dist/commands/workflow/tests-base.js`), and the catalog's **Base check** bullet (`.bkit/core/.bkit/workflows.md:984`, installed copy `.bkit/workflows.md:984`) says only "`unknown` names its reason". An agent reading the verb help would expect `reason` to be null for `some`. Fix: reword the `reason` output help to "why the verdict is unknown, or which cases could not be checked for some; else null", add "`some` with unchecked cases names them too" to the catalog bullet, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `dist/` and `.bkit/workflows.md` follow — Fixable: true
