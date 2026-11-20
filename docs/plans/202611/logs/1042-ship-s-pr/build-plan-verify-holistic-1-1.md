Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group).

## Integration Gaps

0. The plan has one group, so there is no cross-group seam. Within it, the `closePr` return contract (`{ ref, via, sha }` or `{ failed }`) matches both callers: `landFailedRecord` maps `close-pr` to `linkRef: DEV` and `close-pr-open` to the pushed `sha`, which `handoverVerb` feeds to `buildComment`; `shipClose` keeps only `ref` and `via` in `landed`, so its output shape is unchanged. `restoreBranchRows` (exported from `branches.ts`) and `minPushOutside` / `minPushPathspecs` (from `ci/ci.ts`) are called with their existing signatures. `tsc --noEmit -p .` exits 0.

## Previously Attempted

- `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-1.md` (Group 1): `CONCERNS`, 2 gaps at `Fixable: true`, both from one missing setup write in the TASK 1 test `--flush refused by dev does not merge a leftover tip that changes code`.
- `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-1-1-log.md`: both gaps fixed by a setup-only addition (commit `6422b197e`).
- `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-2.md` (Group 1): `PASS`, tasks 1, 2, 3.
- This is the first holistic attempt.

## Notes

- Tests run here: `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts` → 2 files, 531/531 passed, none skipped. The test file carries no `.skip` / `.only` / `it.todo`.
- TASK 1: satisfied. All six TEST FIRST tests and the three existing tests the DONE WHEN names (`closePr with base dev still merges`, `closePr refuses when the PR base is unknown`, `--flush refused by dev publishes the FAILED record through a PR`) exist and pass. `closePr` reads the tip, refuses on `minPushOutside(...).outside` naming the branch and paths, merges `--no-ff --no-commit -X ours`, calls `restoreBranchRows` while `MERGE_HEAD` is set (it `git add`s each file it appends to), commits, takes `head` after the merge, reuses an open PR through `probePr`, and names the branch when `gh pr create` fails. `dist/commands/workflow/{workflows,branches}.js` carry the change. The `...-1509` deferral has a `CLOSED` row referencing `1042`. The plain `ls-remote` in place of `--exit-code` gives the same behaviour, as both group attempts judged; no gap.
- TASK 2: satisfied. Both TEST FIRST tests and `--flush refused by dev links the handover comment at dev once the PR merged` pass; `closePr` returns `sha: head` and `landFailedRecord` links `close-pr-open` at it; the `linkRef` doc comment says so; `dist/` refreshed; the `...-830` deferral has a `CLOSED` row. That row's carried-over `description` still quotes the original finding's done-when ("the link targets `dev`"), while the plan's Task 2 chose the pushed SHA; the plan's choice governs, so no gap.
- TASK 3: satisfied. Lines 131-132, 150, 825, 1128 and 1354 of `.bkit/core/.bkit/workflows.md` and lines 138 and 357 of `docs/deployments.md` carry the clause; no line in those files says a refused close or flush fails on a branch already on origin. The `docs/testing.md` row is updated, `811-leftover-...` has a `SUPERSEDED` row naming `1042`, and `.bkit/workflows.md` matches the source on every `ship-failed` line (re-rendered; `.bkit/version` hash updated).
- `.bkit/instructions.md`, `DETAILS.md` and `docs/capabilities.md` changes in the run diff are generated output (instructions sync and graph refresh) of the planned edits, as `build-plan-verify-1-2.md` judged; no gap.
- Derived Test Matrix: all 8 rows sit in their task's TEST FIRST and pass. Documentation Updates: all 4 rows done. `docs/observability.md` is present; the new failure reasons go through the existing `ctx.log` / `stop` paths.
- No test-first audit report was supplied for this holistic run, so Step 8 has nothing to decide. No decision records (`build-decision-*.md`) exist.
- The full suite was not run here (`Local tests first`: it runs in the pre-push hook and the workflow's final gate).

## Identified Gaps Log

None
