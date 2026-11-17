Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 23707769fd6585918c64943d5c7ce2ea5956f870e43a4727fda8bb903de16fa4
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 task groups)

## Integration Gaps

4 integration gaps, all `Fixable: true`:

1. Stale entries in `changed` (Task 3 with Task 4). `lockBaselines` copies a test's earlier `changedTests` reasons onto a later `build-tests-red` entry (`.bkit/core/engine/commands/workflow/tests.ts:349`), which the lock needs so that an old `BLOCKED` line left in a shared log lets no re-change through. `tests green` then picks `changed` by `reasons.length > 0` (`tests.ts:2369`). So when the tests step records a new red after a code step's recorded change, the lock correctly uses the new red as the baseline, but Step 15 still lists the test under `CHANGED_TESTS` with the old reason. Task 4 says `changed` holds only tests whose newest `lockBaselines` record is a code step's `changedTests` entry. No test covers this case. `DONE WHEN` for Tasks 3 and 4 still holds, so the gap is logged on its own.
2-4. Three tests outside this plan's code failed under the full `bkit tests changed --base=origin/dev` run (2 failed of 6553, then 1 failed of 8553). All three are timing-bound: `locks.test.ts` `serializes publication for one target and invocation`, `guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` (1013 ms against a 1000 ms limit) and `test-file-script.integration.test.ts` `node — with no report path the test file is left as it was` (worker-cancellation timeout). Each file passes in full when it runs alone (`pnpm bkit:test:file`: 23/23, 76/76, 17/17). No task of this plan touches their code. The locks case is already tracked as `docs/failures.jsonl` key `publication-lock-test-fails-under-load-30ms-ps-budget`; the other two are not tracked yet.

The cross-group wiring otherwise holds. `finish` (`steps.ts`) and `tests green` / `tests red` (`tests.ts`) read one baseline through `lockBaselines`. The `changedTests` row shape `{task, test, testName, block, reason}` that `finish` writes is what `lockBaselines` reads. `blockedTests` reads the exact line form that the refusal text, the three `bkit-build.md` exit 11 re-asks and both code prompts give. Step 15's `CHANGED_TESTS` pause uses the generic `decisions compose` / `apply` path, which filters on no question kind, and ship's Confirm Assumed Items covers the assumed accept.

## Previously Attempted

None — this is holistic attempt 1. Group reports `build-plan-verify-1-1.md` (PASS, Tasks 1-3) and `build-plan-verify-2-1.md` (PASS, Tasks 4-7) were read.

## Notes

- Every task's `DONE WHEN` holds in the codebase, so Tasks 1-7 are named on the `Tasks` line. The group reports `build-plan-verify-1-1.md` and `build-plan-verify-2-1.md` judged each task against its group diff; this pass re-checked them against the full feature diff (`a2c12d244..HEAD`; `tmp/bkit-diff-914-build-planned-test.md` also holds three commits that are on the branch but not on `origin/dev`: `a2c12d244`, `d8cee96cf` and `7b6a5e636`, which are outside this plan).
- Task 1: `touchedTests(top, file, workflow, plan?)` has no `group`; `finish` runs the lock for all three code steps under one condition and keeps the `--plan` / `runPlanPath` lookup. Task 2: `blockedTests` is exported; `extras.changedTests` is written only when nothing is refused; exit 11 keeps `tests: [{test, name}]`; the problem text and the exit 11 / `--plan` help are rewritten. Task 3: `lockBaselines` is the only baseline for `touchedTests` and the `tests red` `standing` check. Task 4: `changed` is printed (`[]` on both the not-enforced path and the empty path), and `## Changed by a code step` is written only when the list is non-empty. Tasks 5-6: workflow, prompt, catalog and instructions wording all landed, and the snapshot is regenerated. Task 7: docs landed and mirrors are re-rendered.
- Every planned test named by a `TEST FIRST` line exists under its exact name in `steps.test.ts`, `tests.test.ts`, `workflow-shape.test.ts` and `planned-test-lock.integration.test.ts`. The landed tests `skips a red record for a test name the plan no longer holds, and still locks the planned test` and `finds the run's plan beside its status file` are still present. Every `Derived Test Matrix` row is in its task's `DONE WHEN`.
- A weakness in one test, not a gap: in `tests.test.ts` `green leaves a changed test the plan no longer names out of changed`, the fixture's `codeStepRow` hard-codes `task: 1`, so the record for `third` (task 2) was never plan-named, even before the plan drops task 2. The test still checks the outcome its `TEST FIRST` names.
- Evidence I ran: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exit 1 (failing tests listed above; the format, typecheck and other stages passed); each of the three failing files re-run alone passed; `pnpm tsx .bkit/core/engine/tools/instructions.ts` exit 0; `node dist/cli.js check` exit 0 with "0 write(s) would occur" and 0 blockers; `pnpm bkit:graph:check` reports `docs/capabilities.md matches a rebuild at 763b831ed`. I did not run `pnpm build`, because this step builds nothing; `dist/commands/workflow/steps.js` and `tests.js` are committed with the engine edits.
- `Documentation Updates`: `.bkit/core/.bkit/workflows.md` (§ Decision Pause, Step 7 row, § Test-first), `.bkit/core/.bkit/prompts.md` (three rows), `docs/testing.md` (`The red test stays` and the § Key test files row), `.bkit/core/docs/templates/bkit-plan.md` Gate 2, `.bkit/instructions.md`, and the six `914-*` rows in `docs/decisions.jsonl` are all done. The `docs/knowledge.jsonl` correction belongs to ship's doc update, not to a runbook task.
- Observability (`docs/observability.md` is present): a refusal still appends the `agent-rework` friction row through `recordTestLockFriction`, and a let-through writes `changedTests` on the row. No new log names.
- No test-first audit report was supplied to this holistic pass, so step 8 (deciding audit gaps) had nothing to decide.
- `build-decision-1-1.md` (`VERIFY_GAPS`, group 1, `Decision: Re-run gate`) accepts no gap, so it clears nothing here. `build-plan-gaps-remediate-1-1-log.md` treated the group 1 gate failure as the tracked flake `tracker-new-comment-budget-shell-observation-flake`.
- `build-plan-tasks-1-log.md` carries `Verdict: FAIL` from a `BLOCKED — bkit:generate` line (the machine-wide tests lock was held). The mirror re-render it was blocked on landed in Task 7, and `bkit check` shows no drift.

## Identified Gaps Log

4 gaps.

INTEGRATION: Task 3's `lockBaselines` (`.bkit/core/engine/commands/workflow/tests.ts:349`) carries a test's earlier `changedTests` reasons onto a later `build-tests-red` entry, and Task 4's `tests green` builds `changed` from `reasons.length > 0` (`tests.ts:2369`), so a planned test whose newest record is a later red (the plan's edge case "the newer red row is the baseline") is still listed in `changed` and asked at Step 15's `CHANGED_TESTS` pause with a stale reason; Task 4 says `changed` holds only tests whose `lockBaselines` record is a code step's `changedTests` entry. Fix: mark whether the latest record is a `changedTests` entry and filter `changed` on that, keeping the carried reasons for the lock's shared-log check, plus a `tests.test.ts` case for a red recorded after a change — Fixable: true
INTEGRATION: `bkit tests changed --base=origin/dev` failed `.bkit/core/engine/commands/workflow/locks.test.ts` `publication ownership lock > serializes publication for one target and invocation` (expected null not to be null) under the full changed-files run; it passes 23 of 23 when its file runs alone, no task of this plan touches the lock code, and `docs/failures.jsonl` key `publication-lock-test-fails-under-load-30ms-ps-budget` already tracks it as a load flake — Fixable: true
INTEGRATION: `bkit tests changed --base=origin/dev` failed `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `cursor guardrails.cjs — shell edit evidence > analyses dense script sources in linear time` (expected 1013 to be less than 1000, a 1 s timing budget) under the full run; it passes 76 of 76 alone, no task of this plan touches the hooks, and no `docs/failures.jsonl` row tracks it yet — Fixable: true
INTEGRATION: `bkit tests changed --base=origin/dev` failed `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `bkit:test:file runs every test file kind into a JUnit report > node — with no report path the test file is left as it was` (timed out waiting for worker cancellation, 11.9 s) under the full run; it passes 17 of 17 alone, no task of this plan touches the test-file script, and no `docs/failures.jsonl` row tracks it yet — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** tests green lists a test as changed after a later red replaced the change
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:2369` · **Round:** 1
  - **DONE WHEN:** tests green leaves out of changed a planned test whose newest lockBaselines record is a build-tests-red entry, while the lock still keeps the carried reasons; a tests.test.ts case records a red after a code step change and asserts changed is []
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tests.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** publication lock test fails under full-run load
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/locks.test.ts:97` · **Round:** 1
  - **DONE WHEN:** locks.test.ts publication ownership lock > serializes publication for one target and invocation passes under bkit tests changed, or is confirmed as the tracked flake publication-lock-test-fails-under-load-30ms-ps-budget
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/locks.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** cursor guardrails linear-time test exceeds its 1 s budget under load
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:700` · **Round:** 1
  - **DONE WHEN:** guardrails-cursor.integration.test.ts analyses dense script sources in linear time passes under bkit tests changed, or is recorded as a load flake in docs/failures.jsonl
  - **TEST FIRST:**
    - .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** test-file-script node no-report case times out under load
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:90` · **Round:** 1
  - **DONE WHEN:** test-file-script.integration.test.ts node — with no report path the test file is left as it was passes under bkit tests changed, or is recorded as a load flake in docs/failures.jsonl
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/test-file-script.integration.test.ts
<!-- bkit:task 4 end -->
