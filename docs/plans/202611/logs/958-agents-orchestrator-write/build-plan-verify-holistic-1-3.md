Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
Loosened: none
Fingerprint: 68cda1b02fd0e3c9977cba3cbd8a2ece6247b82c2637e0c1b58aa3f10b36b050
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

7 of 7 (the plan has 7 groups).

## Integration Gaps

0. Group 7 works with the earlier groups:

- Groups 3, 5 and 7: Task 25's new refusal in `itemProblem` (`.bkit/core/engine/commands/workflow/decisions.ts:180-187`) fires only when the engine file holds `## Progress`, the marker the earlier `Q1` refusal (Task 10) and Task 17's "no question" refusal use. It compares the decision file's `ITEM_SPLIT` count with the engine `Q1` options that `decisions counts` builds from the same count (`decisions.ts:546`), so a freshly counted pair always passes. A `TESTS_LOOP` pause with no items gets `Try again` / `Stop` and passes. `counts` overwrites the engine file (`writeFileSync`), so the re-run that `bkit-build.md:214` now orders ("re-run the commands above once") is idempotent. On a `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` pause, the commands above are only `tests base` (exits 0 on every verdict) and `decisions check`, so no `counts` call without flags happens. The en-dash case from Task 17 now recovers: the fix, then `counts` gives `Decide`, then `check` passes. No other workflow calls `decisions check` or `decisions counts`.
- Groups 4, 6 and 7: Task 26's `scrubSecrets` runs inside Task 23's `scrubFailureFiles`, after `redact`, on both files Task 14 moved into `{LOG_DIR}`. `failVerb` calls it at `workflows.ts:424`, before it reads `--error-file` for the comment (`workflows.ts:464-466`), so the comment and the committed copy carry the same scrubbed text. Task 23's test still passes.
- The re-run wording at `bkit-build.md:214` is identical in `.bkit/instructions.md`, `.claude`, `.cursor`, `.opencode`, both `.agents` skill copies and the render snapshot. No copy keeps the old "run it once more".
- The integration checks from attempt 2 (groups 1-6) still hold. Since attempt 2, only `decisions.ts`, `workflows.ts`, `bkit-build.md` step 2 and their copies, tests and `dist/` changed, and none of the readers attempt 2 traced changed.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: `PASS` over groups 1-4 (Tasks 1-16).
- `build-plan-verify-holistic-1-2.md`: `PASS` over groups 1-6 (Tasks 1-24), before challenge round 2 added group 7 (Tasks 25-26).
- Group 7: `build-plan-verify-7-1.md` `CONCERNS` (2 fixable gaps), closed by `build-plan-gaps-remediate-7-1-log.md`, confirmed by `build-plan-verify-7-2.md` `PASS`.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows 20 of 253 files. The cross-group check therefore used `git diff 665a96cae HEAD` (everything since holistic attempt 2: 19 files outside `docs/plans`) and the codebase itself.
- Tests run, all green: 24 unit files, 1865 tests (`steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `open-decision`, `decisions`, `tasks`, `status`, `workflows`, `summary`, `verdict-vocabulary`, `workflow-shape`, `question-option-format`, `template-shape`, `branding`, `trackers`, `cli-doc`, `instructions`, `conventions`, `context`, `context-fetch`, `instructions-coverage`, `instructions-sources`). They cover every test named in any task's `DONE WHEN` or `TEST FIRST`. The three group 7 test names and Task 23's test each exist exactly once. Each `Derived Test Matrix` row maps to one task's `TEST FIRST` (rows 200-202 map to Tasks 25-26).
- Checks run: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 and reports nothing. `pnpm bkit:text:ceiling check` reports ok at prompts 83844 and workflows 57996; the workflows ceiling fell from 58001 to 57996 and was never raised. `bkit check` (run from source) exits 0 and leaves the tree unchanged.
- Built CLI: `node dist/cli.js help`, `decisions check --help`, `workflows fail --help` and `ledgers findings --help` all exit 0. `dist/commands/workflow/decisions.js` and `workflows.js` carry the group 7 changes, committed in the same commits as the sources (`6fd1c0296`, `22a30ddfb`, `a4d419fb2`).
- Task 25's `DONE WHEN` says step 2 re-runs `decisions counts {COUNT_FLAGS}` before the second `check`. The step now says "re-run the commands above once", which re-runs `counts` exactly when it ran for the pause. This is the wording `build-plan-verify-7-1.md` gap 1 asked for, and `build-plan-verify-7-2.md` accepted it.
- Test-first audit `build-tests-green-7-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections. No test-first audit report was supplied for this holistic round.
- All 26 tasks are `[x]` in the plan; the Task 25 and 26 ticks are in the working tree, not yet committed.
- Decision records: `build-decision-1-1.md` (group 3, loop answer `Try again`) accepts no gap. `build-decision-1-2.md` (Task 18 `Fix now`, direction (a)) is assumed, not the owner's acceptance: the orchestrator took it on the owner's behalf. Task 18 is judged satisfied as that record directs.
- Documentation Updates: every row is done. Advisory, not a gap, because no `DONE WHEN` names it: the `docs/testing.md` rows for `decisions.test.ts` (line 957) and `workflows.test.ts` (line 963) do not name the newer behaviours (the question-count refusal; the failure-file scrub of secrets, URL passwords and local paths). `docs/observability.md` needs nothing, because the refusals use the existing `problem` / `CommandError` output.
- Not run here, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync` and Task 16's `pnpm bkit:gate:static-unit-integration`. The holistic gate runs the full suite.
- The two new `docs/deferrals.jsonl` rows are round-2 LOW challenge deferrals. They do not satisfy, or belong to, any task.
- Observations, not gaps (no `DONE WHEN` names them; propose them separately):
  - `.bkit/core/workflows/bkit-ship.md:406` still passes `--reason="{human's words}"` inside a double-quoted argument. This is the same shell-injection shape Task 24 removed from bkit-build.
  - `CREDENTIAL_NAME` also matches harmless names such as `TOKENIZERS_PARALLELISM`, so it over-redacts. This matches the `DONE WHEN` name list.
  - When run from a worktree, the main checkout's path is not stripped as a repo path, but its home prefix still becomes `~`, so no account name remains.

## Identified Gaps Log

None
