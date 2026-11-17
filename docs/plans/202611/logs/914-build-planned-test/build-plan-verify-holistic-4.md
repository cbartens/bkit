Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13
Loosened: none
Fingerprint: b26d7b97a44829daa376045da298eb3b91c3e102a41bac293c3b431dc0b2c0bf
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 task groups)

## Integration Gaps

4 integration gaps:

1. **Capabilities register (Task 7, after Group 3).** `pnpm bkit:graph:check` exits 1, rebuilt from `0f46d8898`, on two runs in a row; the second re-extracted no file, so the drift is stable. `docs/capabilities.md` still shows `n_bkit_core_engine_commands -->|412| n_bkit_core_engine_shared` where the tree gives `407`, and it keeps a `n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_shared_json` edge (and its `linkStyle 219`) that the tree no longer produces. These are the same `412 -> 407` numbers holistic 3 reported. Commit `1325b01e6` refreshed only the symbol counts and the steps-to-tests edge, so Task 7's `DONE WHEN` still does not hold.
2. **Failing test `guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time`** (related stage): 1371 ms against a 1000 ms budget. No task touches the file, and it passes on its own. Tracked as load flake `guardrails-cursor-linear-time-test-1s-budget-under-load`.
3. **Failing test `locks.test.ts` `publication ownership lock > reclaims only a proven dead matching process identity`** (related stage): the child printed `null`. No task touches `locks.ts`, and the file passes 23 of 23 on its own. Tracked as `locks-dead-process-identity-reclaim-flake`.
4. **Failing test `ci-scripts.test.ts` `ci/bkit-test-awake.test.mjs passes when run on its own`** (named stage): its sub-test `direct cancellation waits for SIGHUP cleanup` failed after 3571 ms. No task touches `bkit-test-awake`, it passes on its own, and no `docs/failures.jsonl` key names this sub-test.

The cross-group contracts hold:

- Group 4 (Tasks 12 and 13) changed only `tests.test.ts`: two `green` fixtures moved from `body(6)` to `withSetup(5)`, which adds one line. The ten `steps.test.ts` tests and the cross-group integration test were already additive.
- The plan now names the 13 tests under Tasks 12 and 13. Their old red rows under Tasks 2-4 are therefore not plan-named under the recorded task, so the lock skips them, and Group 4's `passed-accepted` red rows are the new baselines (`build-tests-green-4-1.md`).
- Since holistic 3 the engine sources (`steps.ts`, `tests.ts`) and `dist/` have not changed. The `changedTests` (`blob`/`after`) -> `lockBaselines` (`text`/`origin`) -> `tests green` `changed` (`diff`/`additive`) chain that holistic 3 checked still stands.
- `bkit-build.none.txt:127` now matches `bkit-build.md:154`, and `trackers.test.ts` passed in the named stage.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (`CONCERNS`, 4 gaps; closed by `build-plan-gaps-remediate-holistic-1-log.md`) and `build-plan-verify-holistic-2.md` (`PASS`, Tasks 1-7) covered Groups 1 and 2.
- `build-plan-verify-holistic-3.md` (`CONCERNS`, 2 integration gaps: the stale `bkit-build.none.txt` render baseline and the stale `docs/capabilities.md` register). `build-plan-gaps-remediate-holistic-3-log.md` regenerated both in commit `1325b01e6`; its finish was refused for 13 planned tests, which `build-decision-1-4.md` (`Fix now`) moved into Group 4 (Tasks 12 and 13).
- Group reports: `build-plan-verify-1-1.md`, `build-plan-verify-2-1.md`, `build-plan-verify-3-1.md` to `-3-3.md`, and `build-plan-verify-4-1.md` (`PASS`, Tasks 12 and 13).

## Notes

- **Tasks satisfied:** 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12 and 13.
  - Every planned test that a `DONE WHEN` or `TEST FIRST` names exists exactly once in its target file (36 names checked).
  - `touchedTests(top, file, workflow, plan?)` (`tests.ts:427`) matches its planned signature. `lockBaselines` (`:343`), `baselineDiff` (`:474`) and `blockedTests` (`:1528`) are exported. `steps.ts:1316` is the one caller.
  - Tasks 5 and 11 are satisfied now: `bkit-build.none.txt` was regenerated in `1325b01e6`, and `trackers.test.ts` passed.
- **Task not satisfied:** Task 7, because `pnpm bkit:graph:check` exits 1 (gap 1). Its other clauses hold: `node dist/cli.js check` exits 0 with `0 write(s) would occur` and 0 blockers, and the gate's lint, format and types stages passed.
- **Derived Test Matrix:** every row maps to one task's `DONE WHEN` through its `TEST FIRST` list. The Task 12 and 13 rows are now held by Tasks 12 and 13, and Tasks 2-4 say so.
- **Evidence I ran:**
  - `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 with `verdict: FAIL`, `failed: related, named`.
    - Related stage: 2 failed, 6559 passed, 2 skipped.
    - Named vitest stage: 1 failed, 8560 passed, 2 skipped.
    - node, bats, lint, format and types stages passed.
  - The three failing tests each passed when re-run on their own (each named file through `vitest run`). The run printed `db unavailable: 3 GB free`, so the machine was short on resources.
  - `node dist/cli.js check` exited 0.
  - `pnpm tsx .bkit/core/engine/tools/instructions.ts` exited 0.
  - `pnpm bkit:graph:check` exited 1 twice. It left no tracked file changed.
- **Decision records:**
  - `build-decision-1-3.md` (`Decision: Accept`) accepts the group 3 rewrites of the 13 planned tests.
  - `build-decision-1-4.md` (`Decision: Fix now`) moved those tests into Tasks 12 and 13. Group 4 took them over, so neither the rewrites nor the earlier `BLOCKED — Gap 1: test` lines in `build-plan-gaps-remediate-holistic-3-log.md` raise a gap.
  - `build-decision-1-2.md` (`Fix now — diff + refuse`) is the direction Task 11 follows.
  - `build-decision-1-1.md` concerns group 1's gate.
- **Test-first audit:** none was supplied to this holistic pass. Group 4's `build-tests-green-4-1.md` (Enforced true, Gaps 0, Unproven 0) lists all 13 Task 12 and 13 tests under `Already landed`, as `passed-accepted` (no red due because the tests were already additive). `build-plan-verify-4-1.md` recorded each reason.
- **Documentation Updates:** no doc changed since holistic 3, which found every row done. The `docs/knowledge.jsonl` correction belongs to ship's doc update.
- **Observability:** `docs/observability.md` is present. The refusal path still appends the `agent-rework` friction row, and a let-through writes `changedTests` on the row. The engine is unchanged since holistic 3.
- **Not gaps:** the `BLOCKED — bkit:generate` lines in the group 1 and group 3 logs satisfy no `DONE WHEN`.

## Identified Gaps Log

4 gaps.

INTEGRATION: Task 7 (Group 2) DONE WHEN (`pnpm bkit:graph:check` exits 0 with no drift) still fails after Group 3 (Tasks 8-11) and the holistic-3 fix: `pnpm bkit:graph:check` exits 1 twice in a row (the second run re-extracted no file), rebuilt from 0f46d8898; `docs/capabilities.md` still shows commands -> shared `412` where the tree gives `407`, and keeps a `workflow_steps -->|7| shared_json` edge the tree no longer produces. Commit 1325b01e6 refreshed only the symbol counts (1865 -> 1866, tests 105 -> 106) and the steps -> tests edge. Fix: run `pnpm bkit:graph:refresh` on the committed tree (it reads staged files), commit `docs/capabilities.md` and `DETAILS.md`, then re-run `pnpm bkit:graph:check` — Fixable: true
INTEGRATION: failing test in `bkit tests changed --base=origin/dev` (related stage): `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `cursor guardrails.cjs — shell edit evidence > analyses dense script sources in linear time` (expected 1371 to be less than 1000, at :704); no task of any group touches the file, it passed when re-run on its own, and `docs/failures.jsonl` key `guardrails-cursor-linear-time-test-1s-budget-under-load` already tracks it as a load flake — confirm the flake under the gate and record the recurrence — Fixable: true
INTEGRATION: failing test in `bkit tests changed --base=origin/dev` (related stage): `.bkit/core/engine/commands/workflow/locks.test.ts` `publication ownership lock > reclaims only a proven dead matching process identity` (TypeError: Cannot read properties of null (reading 'owner'), at :152); no task of any group touches `locks.ts`, the file passed 23 of 23 when re-run on its own, and `docs/failures.jsonl` key `locks-dead-process-identity-reclaim-flake` already tracks it — confirm the flake under the gate and record the recurrence — Fixable: true
INTEGRATION: failing test in `bkit tests changed --base=origin/dev` (named stage): `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own` (its sub-test `direct cancellation waits for SIGHUP cleanup` failed after 3571 ms); no task of any group touches `bkit-test-awake`, it passed when re-run on its own, and no `docs/failures.jsonl` key names this sub-test — confirm it is a load flake and record it in `docs/failures.jsonl`, or fix it — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** INTEGRATION: docs/capabilities.md still drifts from the tree, so Task 7 graph check fails
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `docs/capabilities.md:175` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:graph:check` exits 0 with no drift after `pnpm bkit:graph:refresh` on the committed tree and a commit of `docs/capabilities.md` and `DETAILS.md` (commands -> shared edge 407, no workflow_steps -> shared_json edge)
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** INTEGRATION: guardrails-cursor linear-time test failed under the changed-tests gate
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704` · **Round:** 1
  - **DONE WHEN:** `analyses dense script sources in linear time` passes under `bkit tests changed --base=origin/dev`, or the recurrence is recorded against `docs/failures.jsonl` key `guardrails-cursor-linear-time-test-1s-budget-under-load`
  - **TEST FIRST:**
    - .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** INTEGRATION: locks.test.ts dead-process reclaim test failed under the changed-tests gate
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/locks.test.ts:152` · **Round:** 1
  - **DONE WHEN:** `publication ownership lock > reclaims only a proven dead matching process identity` passes under `bkit tests changed --base=origin/dev`, or the recurrence is recorded against `docs/failures.jsonl` key `locks-dead-process-identity-reclaim-flake`
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/locks.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** INTEGRATION: ci-scripts bkit-test-awake SIGHUP sub-test failed under the changed-tests gate
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/audits/templates/ci-scripts.test.ts:130` · **Round:** 1
  - **DONE WHEN:** `shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own` passes under `bkit tests changed --base=origin/dev`, or its `direct cancellation waits for SIGHUP cleanup` failure is recorded as a load flake in `docs/failures.jsonl`
  - **TEST FIRST:**
    - .bkit/core/engine/audits/templates/ci-scripts.test.ts
<!-- bkit:task 4 end -->
