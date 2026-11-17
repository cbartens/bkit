Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7
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

None

## Notes

Task 7 was judged against the group diff `build-diff-4-1.diff` (commit 236f2ea51). The briefs `build-brief-4-1.md` and `build-brief-4-2.md` are identical, and neither has a `Deviations` section.

- **Engine:** `EXIT_NEXT_STEP_REFUSED = 6` sits at `.bkit/core/engine/commands/workflow/workflows.ts:400`. `failVerb` throws it for a bad `--next-step` at line 412, before `failState` runs, and the verb's `exitCodes` lists it at line 2287. Code 6 falls in the per-command range 3-79 and does not clash with `EXIT_REMOVE_FAILED` (5) or `EXIT_SPLIT_BUCKET` (7). No other throw in `failVerb` or `failState` uses 6. `node dist/cli.js workflows fail --help` lists exit 6, and `dist/` was rebuilt in the same commit.
- **Workflow:** In the `.bkit/core/workflows/bkit-ship.md` Failure Path, step 1 now retries without `--next-step` only on exit 6. Any other non-zero exit, including exit 2, falls through to the existing `Lock removal failed` line, so the run keeps `NEXT_STEP` and does not call `failState` a second time. These copies carry the new wording: the `.claude`, `.cursor` and `.opencode` commands, the two `.agents` SKILL.md copies, `.bkit/instructions.md` and the `bkit-ship.none.txt` snapshot. A search found no file outside `docs/plans` that still has the old `exit 2 **and** --next-step` wording.
- **Docs:** § Failure Path in `.bkit/core/.bkit/workflows.md` and its mirror `.bkit/workflows.md` name exit 6. `.bkit/cli.md` sends readers to `--help` for the exit codes of each verb, so it needed no edit.
- **Tests:** Both TEST FIRST tests exist and pass. They are `workflows.test.ts` "bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares" and `ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal". Task 7 broke two older tests and fixed both: the multi-line refusal test now expects exit 6, and the red-CI exit test now matches `exit 6`. Both still assert the new contract and assert no less than before, so neither was loosened. Four suites were run: `workflows.test.ts`, `ship-invariants.test.ts`, `render/trackers.test.ts` and `conventions.test.ts`. All 355 of their tests pass.
- **Gates:** `pnpm bkit:graph:check` reports that `docs/capabilities.md` matches a rebuild at 236f2ea51. The concern in the code log about a capability refresh is therefore settled. `bkit check` exits 0 with no mirror drift.
- **Test-first audit:** `build-tests-green-4-1.md` reports `Enforced: true`, 0 gaps and 0 unproven tests, and has no `Updated tests` or `Already landed` sections. Nothing was left for this report to decide.
- **Observability:** The task adds no logging. The refusal reaches stderr as a `CommandError`, the same way the verb's other refusals do.
- **Out of scope:** The two LOW `911-ship-failed-merge-challenge-*` rows in `docs/deferrals.jsonl` in this diff were written by the challenge step, not by Task 7.

## Identified Gaps Log

None
