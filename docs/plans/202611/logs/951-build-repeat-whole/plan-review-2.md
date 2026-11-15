Verdict: CONCERNS
Failures: 5
Redesign: false
Fingerprint: d241fd15f1ede2e31c33f368da590c899b92e9a23d7f1a76b13c109db18feec9
<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

- **Task 1** — `ASK_POINTS` / `CONFIG_DEFAULTS.asks` (`.bkit/core/engine/shared/settings.ts:88-96`, `:209-211`); `LOOPS.holistic.point` (`.bkit/core/engine/commands/workflow/decisions.ts:192-217`, read at `:519`); bkit's own `package.json`. Consumers of `ASK_POINTS`: `counters.ts:29,60,665,718`, `workflows.ts:2187` (freezes limits), `install/modules/core.ts:636-644` (`askBlocks` seeds a block per point into every consumer `package.json` on install / upgrade) and `:1661`, `checks/before/repo.ts:11,195`, `counter-prose-audit.test.ts:247`, `settings.test.ts:308,310`, `counters.test.ts:455-466,1249`. Exact-enumeration tests: `workflows.test.ts:259-271`, `core.integration.test.ts:1148-1157`. `pointLimit` (`counters.ts:529-558`) falls back to `package.json` when the frozen row lacks the point. High-risk: public type export + config seed.
- **Task 2** — `route()` in `status.ts:204-245` (pure today; adds a git existence check) and its output doc `:480`; reads `cleanRound` / `allRunsDoneSteps` (`ledgers/status.ts:536,562`). `parentSha` is HEAD before the step's commit (`steps.ts:657`).
- **Task 3** — `bkit-build.md` Step 10 (`:869-945`), Limits (`:85`), resume mapping (`:49`), grants (`:276-288`, `:282`), retry (`:302`); `bkit-build-plan-verify.md:85-86`; mirrors, render snapshots, `.bkit/instructions.md`. `changedFiles` (`tests-changed.ts:40`) uses a three-dot diff, so a stale base widens, never narrows.
- **Task 4** — `bkit-build.md` Step 10 sub-steps 1, 3, 7, 9; holistic artifact numbering.
- **Task 5** — `SINCE_CLEAN_FLAG` (`counters.ts:133`), `VALUE_FLAGS` (`:561-586`), `derivedOf` (`:101-130`), `grantCount` (`:264-292`, callers `:540-547`, `challenge.ts:671`), `sinceCleanStep` (`:517`); `cli.md` and its mirror; `decisions.ts:474` keeps `sinceClean` for `progress`. Public CLI flag removal.
- **Task 6** — `tests run` (`tests.ts:1760-1864`: `runToLog` env, `classifyLockExit` `:1784`, exit 81 `:1860`, `appendTestRun` `:1829`).
- **Task 7** — `bkit-build.md` Step 8 (`:713`, `:748`), Step 9 Context (`:837`), resume (`:49`); `bkit-build-plan-verify.md:77`; `local-gate-audit.test.ts:238-254`, `:302-331`.
- **Task 8** — `bkit-debug-failure-soak.md`; `GATE_CALLERS` (`local-gate-audit.test.ts:130-146`) and the count at `:184`.
- **Task 9** — `seedCorePackageJsonScripts` (`core.ts:547`), new migration after `migrateBkitLayout`; `docs/migrations.md`. High-risk: config migration (one-way, idempotent, registered).
- **Task 10** — `runPushGate` (`push-gate.ts:60-129`); callers `ci.ts`, `land.ts`; `tests run` (`tests.ts:1778`); `minPushPathspecs` (`ci.ts:611`). High-risk: push trust boundary.
- **Task 11** — `hasVerifiedIncrement` (`push-gate.ts:187-199`, `:196`); caller `minPushUpdates` (`ci.ts:733`); `push-gate.test.ts:270-284`. High-risk: push trust boundary.
- **Task 12** — `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/templates.md`, `docs/deployments.md`, mirrors.
- **Design artifact** — none (#951 is a change issue); design-coverage has nothing to check.
- **Knowledge / failures** — one push-gate knowledge row (spawn-heavy unit tests need a suite-level load-scaled timeout); none for the holistic counter, `--since-clean`, ask points or the group gate. `push-gate-overlap-later-failure-intermittent` is cited by the plan.

## CRITICAL

1. **(plan edit) Task 1 breaks two exact-enumeration tests it does not name, and the consumer-visible seed has no matrix row.** `workflows.test.ts:259-271` and `core.integration.test.ts:1148-1157` assert the ask points by `toEqual`; Task 1's DONE WHEN (`plan-v1-draft.md:503`) names only settings / counters tests. `askBlocks` (`core.ts:636-644`) writes `bkit.workflows.build.holistic` into every consumer `package.json` on install / upgrade, with no matrix row and no Breaking Changes line. Fix: name both tests; add a `core.integration.test.ts` row + TEST FIRST for the seeded block; state the seed in Breaking Changes.
2. **(plan edit) Task 8 breaks the exit-81 audit's caller count.** `local-gate-audit.test.ts:183-184` asserts `toHaveLength(4)` over `--fallback=bkit:gate:` callers; Task 8 (`plan-v1-draft.md:612-613`) adds a fifth without naming the test. Fix: name it with the count raised to 5.
3. **(plan edit) Task 11's second TEST FIRST already passes and its update removes an assertion.** `push-gate.ts:196` rejects every all-zero old sha, so the code-after-receipt case is already rejected; the red reason at `plan-v1-draft.md:662` cannot occur (matrix row `:131` likewise). Reversing `push-gate.test.ts:274` is a removed expectation, which the verifier blocks for an "updated" test (`tests.ts:2076-2080`). Fix: drop it from TEST FIRST; make the reversal a Task 11 UPDATE / DONE WHEN item; keep the full-gate rejection as a named regression guard.
4. **(plan edit) Task 6's `--changed-since` path has no lock-wait test.** `tests.ts:1784-1786`, `:1827-1828`, `:1860` turn a lock wait into exit 81, no row, `lockHolder`; no matrix row (`plan-v1-draft.md:118-122`) asserts the new path keeps that. A misclassified wait writes a FAIL group-gate row and starts a remediate round. Fix: add a row + TEST FIRST in `tests.test.ts`.
5. **(plan edit) Task 7's `GROUP_BASE` re-derive on the pause / resume path has no test.** Resume enters Step 8 sub-step 8 directly (`bkit-build.md:49`); `GROUP_BASE` is otherwise set only at `:713`; an empty `--changed-since=` is a usage error to the Failure Path. Matrix rows `:123-124` assert only the command flags. Fix: add a `local-gate-audit.test.ts` row + TEST FIRST asserting both gate sites re-derive `GROUP_BASE` first.

## OPTIONAL

- Task 10: `runPushGate` spawns the gate with `spawnSync` + `gitEnv()` (`push-gate.ts:91-97`), while `tests run` uses `runToLog` with `BKIT_TEST_REPORT_DIR` and the lock env (`tests.ts:1778-1782`). State that the helper takes a run callback; add a test that a lock wait on the required gate returns 81 and records no receipt.
- Task 10 tolerance: `minPushPathspecs` includes `docs/*.md` and skill dirs (`ledgers.ts:111`); a narrower tolerance (plans, audits, ledgers) is safer.
- Task 2: use `merge-base --is-ancestor` rather than existence for the base guard (an orphaned sha still exists after a rebase); reuse `DIFF_BASE` (`context.ts:833`).
- Task 1: attempt line can read "build holistic: attempt 3 of 2"; Progress uses `sinceClean` over the active run only (`decisions.ts:474`).
- In-flight runs with grants on `build.verify` get none on `build.holistic` and pause on resume; add a Breaking Changes line.
- Between Task 1 and Task 3 the generated `counter-prose-audit.test.ts:247` case for `build.holistic` fails; say so in Task 1's DONE WHEN.
- New spawn-heavy tests: use `tierTimeouts(true).testTimeout` per the `resolve-push-base.test.ts` knowledge row.
- `scope`: record the gate name and a file count, not the changed-file argv.

## OUT OF SCOPE

- The pre-push path getting the same uncommitted-bookkeeping tolerance (already under Suggested Scope Expansion).
- Progress for the holistic steps in `progressPoint` (`steps.ts:468-483`).

## Notes

- No design artifact exists; step 7 yields nothing.
- `related-knowledge.md` (275 KB) was searched by keyword only; `related-failures.md` and `related-deferrals.md` were truncated in the inputs, so evidence is marked incomplete.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 1 breaks two exact-enumeration tests it does not name; consumer seed of build.holistic has no matrix row
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:503` · **Round:** 1
  - **DONE WHEN:** Task 1 UPDATE/DONE WHEN name workflows.test.ts:259-271 (frozen limits) and core.integration.test.ts:1148-1157 (seeded build block); a matrix row + TEST FIRST in core.integration.test.ts asserts install seeds bkit.workflows.build.holistic {ask:true,maxAttempts:2} (core.ts:636-644) and keeps an existing one; Breaking Changes states the seed
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/workflows.test.ts
    - .bkit/core/engine/install/modules/core.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Task 8 breaks local-gate-audit.test.ts:184 toHaveLength(4) by adding a fifth --fallback caller
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:613` · **Round:** 1
  - **DONE WHEN:** Task 8 UPDATE and DONE WHEN name the exit-81 audit test with the count raised to 5, so it also covers the soak prompt
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/local-gate-audit.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Task 11 second TEST FIRST already passes (push-gate.ts:196 rejects all-zero old sha) and its update removes the push-gate.test.ts:274 assertion, which the verifier blocks (tests.ts:2076-2080)
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:662` · **Round:** 1
  - **DONE WHEN:** the updated existing test is removed from TEST FIRST; the line-274 reversal is a named Task 11 UPDATE/DONE WHEN item; the code-after-receipt full-gate rejection is a named regression guard in DONE WHEN
  - **TEST FIRST:**
    - .bkit/core/engine/commands/ci/push-gate.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Task 6 --changed-since path has no lock-wait test (exit 81, no row, lockHolder; tests.ts:1784-1786,1860)
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:579` · **Round:** 1
  - **DONE WHEN:** a matrix row + TEST FIRST in tests.test.ts asserts --changed-since with a lock-wait exit returns 81, writes no test-run row and reports lockHolder
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tests.test.ts
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Task 7 GROUP_BASE re-derive on the Decision Pause / resume path (bkit-build.md:49, :713) has no test; an empty --changed-since is a usage error to the Failure Path
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:597` · **Round:** 1
  - **DONE WHEN:** a matrix row + TEST FIRST in local-gate-audit.test.ts asserts the Step 8 group-gate sub-step and the Step 9 Context each re-derive GROUP_BASE from status route --step=build-group-start --group= before the --changed-since={GROUP_BASE} command
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/local-gate-audit.test.ts
<!-- bkit:task 5 end -->
