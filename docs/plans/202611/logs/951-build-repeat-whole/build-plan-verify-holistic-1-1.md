Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
Loosened: none
Fingerprint: b64bade23d0aa9593ec2fa36174281c54b1becf9aa4b82f4ecd20a40264a0680
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups)

## Integration Gaps

0 integration gaps.

## Previously Attempted

None (first holistic check of run 1). Group checks: `build-plan-verify-1-1.md` CONCERNS (1 gap, closed by `build-plan-gaps-remediate-1-1-log.md`), `build-plan-verify-1-2.md` PASS, `build-plan-verify-2-1.md` PASS, `build-plan-verify-3-1.md` CONCERNS (2 gaps, closed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` PASS.

## Notes

All 12 tasks across the 3 groups are satisfied, and the groups work together. No decision record (`build-decision-*.md`) exists for this run.

- Scope of the test run: local `dev` is ahead of `origin/dev`, so the run used `bkit tests changed --base=dev --fallback=bkit:gate:static-unit` with `BKIT_TEST_SLOTS=2`. `dev...HEAD` is the merge base `0859e4ede`, which yields only this feature's 99 changed files. `bkit:gate:changed` passed with exit 0: vitest related gave 105 files and 5427 tests passed, vitest named gave 161 files and 8521 tests passed, and the `node --test` stages gave 13 passed and 0 failed (2 skips came from before this change). `node dist/cli.js check` exited 0 with no mirror drift.
- Group 1 to Group 2/3 link (counting and file names): `build.holistic` is in `ASK_POINTS` and `CONFIG_DEFAULTS`. Step 10 sub-step 6 routes on `--of=build-plan-gaps-remediate-holistic:next --point=build.holistic`. The Decision Pause grant uses the same `--of` and point, so the route and the grant count the same rows. `LOOPS.holistic.point` = `holistic`, so the loop line reads `build holistic: attempt N of M`. The resume mapping's `PAUSE_POINT` = `build.{from}` now gives `build.holistic` for a holistic pause. Every holistic report, Result, stub, finish and fix-log path, plus both globs (line 141 and sub-step 8), carries `{RUN}`. `.bkit/core/.bkit/workflows.md` (Step 10 row, Allowance bullet, ask-points table, loop table) describes the same contract.
- Holistic base link: `status route` prints `cleanBase` from `lastCleanRound`, with the `merge-base --is-ancestor` fallback to `origin/dev`. Step 10 sub-step 1 holds it as `HOLISTIC_BASE`, sub-step 2 passes it as `Test base`, and the verify prompt runs `bkit tests changed --base={Test base}`. `changedFiles` diffs `{base}...HEAD` plus uncommitted and untracked files, so a stale base can only widen the scope.
- Group gate link (Task 6 to Task 7): Step 8 sub-step 8 and Step 9 sub-step 3 re-derive `GROUP_BASE` from `status route --step=build-group-start --group={GROUP}` and pass `--changed-since={GROUP_BASE}` to `tests run`. `tests run` validates the sha. It runs `bkit:gate:changed` with the changed files when the script is declared, and otherwise runs `--gate` whole. A run with `--changed-since` never writes a receipt.
- Push proof link (Task 10 to Task 11 to the hook): `tests run` of `requiredPushGate(top)` with no `--changed-since` goes through `runWithReceipt`, which tolerates `minPushPathspecs` (`docs/plans/**`, `docs/audits/**`, the ledger book paths). `runPushGate` passes no pathspecs and a never-wait callback, so its behaviour is unchanged. `.husky/pre-push` sets `MIN_PUSH` from `bkit ci min-push`, then `minPushUpdates` (`ci.ts:733-753`), then `hasVerifiedIncrement`. That function now walks the new sha's ancestors when the old sha is all zeros. The receipt `tests run` writes is the same file and format that `hasVerifiedIncrement` reads.
- Task 5 is unticked in the plan even though `build-plan-verify-1-2.md` judged it satisfied. The cause: the group tick (`tasks tick --green`) holds Task 5 back because `build-tests-green-1-2.md` carries two `delete-still-referenced` gaps with `Fixable: null`. I re-checked both hits. Each is `docs/decisions.jsonl:849`, the decision row `951-retire-counters-since-clean` that records the deletion. That is a different thing with the same name, so it is not a gap. `git grep` finds no other reference to `SINCE_CLEAN_FLAG` or `sinceCleanStep`. `node dist/cli.js counters route --since-clean` and `counters grant --since-clean` both exit 2, and `counters progress` still takes `--since-clean`. Task 5 is named on `Tasks`, so the holistic tick (which takes no `--green`) ticks it.
- Observation, not a gap: now that the plan has dropped the `HOLISTIC_ROUNDS = PAUSE_MAX` disjunct, the holistic loop question fires only on exit 1. At that point `HOLISTIC_ROUNDS` is the round that would come next, so the decision file reads `build holistic: attempt 3 of 2`. This matches the plan (the third fix round goes to the Decision Pause) and the known deferral `912-debug-loop-question-challenge-low-...-decisions-ts-464`.
- Derived Test Matrix: every row's test exists under its planned name and is named by its task's `DONE WHEN` (through "the tests below pass", or for Task 11's regression row, by name). Documentation Updates: `workflows.md`, `templates.md`, `cli.md`, `docs/deployments.md` and `docs/migrations.md` are updated. The `prompts.md` rows needed no change. `dist/` carries the source changes (`cleanBase`, `runWithReceipt`, `changedSince`, `lowerVerifyMaxAttempts`). The last engine commit and the last `dist/` commit are both `152304edc`.
- Observability: the migration logs through the `[bkit] core:` prefix, and the receipt logs go through the command's `log` callback, as `docs/observability.md` § Log Format requires.
- No test-first audit report was supplied for this holistic check, so Step 8 does not apply.
- Docs read: `.agents/docs.md`. `docs/testing.md` and `docs/observability.md` are present.

## Identified Gaps Log

None
