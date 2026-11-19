Verdict: PASS
Failures: 0
Fixable: false
Tasks: 14, 15, 16
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-4-1.md`: `CONCERNS`, 3 fixable gaps (ship Failure Path names `{LOG_DIR}`, `docs/testing.md` rows missing, `cli.md:45` says the error file is never committed). Task 15 was satisfied then.
- `build-plan-gaps-remediate-4-1-log.md`: all 3 gaps reported fixed. All 3 are closed in the codebase.

## Notes

- Judged against `build-diff-4-2.md` (Tasks 14, 15, 16). All three tasks are satisfied.
- Gap 1 of attempt 1 is closed by a ship-only sentence, not by the shared clause. `.bkit/core/workflows/bkit-ship.md:99` now says "Ship: use the command's paths.", so the prose and the `workflows fail` command line (`{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md` and `ship-stderr.md`) agree. The `workflow-error-file` clause (`.bkit/instructions.md:5716`) does not name the ship path as Task 14's UPDATE line asked. The remediator kept it out to stay under the workflows word ceiling, which Task 14's DONE WHEN gates. The intent of the UPDATE line is met, so this is no gap. The replaced wording sits in the clause's `retired` blocks.
- Gap 2 is closed. `docs/testing.md` has rows for `audit-report.test.ts` (line 991) and `verdict-vocabulary.test.ts` (line 992). The `status.test.ts` row names the two-file red-gate pause, the `workflows.test.ts` row names the assumed item in an engine file counted once, and the `template-shape.test.ts` row names Title and Key. The `workflow-shape.test.ts` row names the error file, the 20-line stderr limit and the no-heredoc check.
- Gap 3 is closed. `.bkit/core/.bkit/cli.md:45` says the error file sits in the run's log folder and the abort commit carries it. Observation, not a gap: the fix also deleted "Outside every worktree, so it survives worktree removal; never committed." about `{OUTBOX}`. The same line still places `{OUTBOX}` in the git common dir, and `docs/security.md:142` says the outbox stays outside committed content.
- Checks run and green: 10 unit files, 975 tests (`workflow-shape.test.ts`, `verdict-vocabulary.test.ts`, `trackers.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `cli-doc.test.ts`, `workflows.test.ts`, `context-fetch.test.ts`, `context.test.ts`); `debug-ci-evidence.integration.test.ts` and `workflows.integration.test.ts`, 10 tests; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exit 0; `pnpm bkit:text:ceiling check` ok (prompts 83844, workflows 58001, both below 86494 and 58535, and the ceiling file holds the same values); `bkit check` (from source) exit 0, with no tracked file changed.
- The Task 16 grep for `{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`, `--result-file`, `decision-items.json` and `decisions compose` prints nothing. It also prints nothing over `.bkit/instructions.md` with the retired blocks left out. The Task 15 grep for `<<'` prints nothing. `addAllButCopied` and `landFailedRecord` are still in `workflows.ts` (lines 719, 907, 921, 937), so the abort commit still carries the log folder.
- Documentation Updates rows for this group are done: `cli.md`, `workflows.md`, `prompts.md` and `jsonl.md:159` (computed `Status` across the decision file and its `-engine.md` sibling), plus the `docs/testing.md` rows. The group adds no error logging, so `docs/observability.md` needs nothing.
- Derived Test Matrix rows for Tasks 14 and 15 (three `workflow-shape.test.ts` tests) are each named in their task's TEST FIRST and pass.
- Not run here, because this verifier does not build or install: `pnpm build`, `bkit upgrade`, `pnpm cli:sync` and `ceiling lower`. The full `pnpm bkit:gate:static-unit-integration` was not re-run either; the execute log reports exit 0. `cli-doc.test.ts` passing and `bkit check` exit 0 stand in for the sync and mirror checks.
- Test-first audit `build-tests-green-4-2.md`: `Enforced: true`, 3 planned tests red then green, 0 gaps, 0 unproven. It has no `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Decision record `build-decision-1-1.md` is for group 3. It accepts no gap in this group.

## Identified Gaps Log

None
