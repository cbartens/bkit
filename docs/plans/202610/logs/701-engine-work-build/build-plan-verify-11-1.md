Verdict: CONCERNS
Failures: 1
Fixable: true

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 11` (one group)

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification of group 11 (`build-plan-verify-11-1.md`); no prior `build-plan-verify-11-*` or `build-plan-gaps-remediate-11-*-log.md` exists.

## Notes

Verified against the group diff (commit `65ca9732c`: `branches.ts`, `branches.test.ts`, the `dist/` copy, both `workflows.md` `branches` rows, `docs/testing.md`); no file deleted.

Every `DONE WHEN` re-checked with the branch's own build: `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` → exit 0 with `disabled: []`; `npx vitest run .bkit/core/engine/commands/workflow/branches.test.ts` → 188 passed (23 in the `scan-diff` block); full `npx vitest run` → 201 files, 7954 passed, 1 skipped; `npx tsc --noEmit` clean. The red records `build-task-red-11-20-1/2`, `-21-1/2`, `-22-1` each show the named test failing before the code (`expected 1 to be +0`, and `expected +0 to be 1` for the deleted file). Positive cases stay covered: `scan-diff reports a disabled test with its line`, `finds an added pytest mark skip`, `finds an added unittest skip`, `finds an added bare skip call`, `still reports a removed assertion` (net drop, naming file / line / test), and `finds an added skip` (an added file's `+++` path).

Test-first audit (`build-tests-green-11-1.md`: `Enforced: true`, 5 gaps, all `test-changed`): read every diff-since-red. The named test in 20-2 and 22-1 is byte-identical to its snapshot; 21-1 and 21-2 differ only by prettier line-wrapping of `write(…)` arguments; 20-1's quoted-skip fixture composes the same runtime document from `${"test"}.${"skip"}` pieces — assertions unchanged, the written `docs/guide.md` bytes identical, so the recorded red still applies and no assertion was weakened, removed or rewritten. No test-order gap.

Docs match the shipped behaviour: `docs/testing.md`'s `branches.test.ts` row and both `.bkit/workflows.md` / `.bkit/core/.bkit/workflows.md` `branches` rows name the test-file scoping, the comment / quoted-span exclusion, the per-file assertion count and the deleted file; `grep` finds no stale old wording. `challenge.test.ts` (32 passed) proves `challenge merge`'s matrix-row write is green, so the missing rows were landed by the round-2 append without that engine build, not by this group's code.

Ticked tasks 20-22 with `node dist/cli.js tasks tick --group=11 --tasks=20,21,22`; only the three boxes changed. The plan-level gap below stays open: the plan refuses its own `tests plan-check`.

## Identified Gaps Log

1. GROUP 11 (TASK 20, TASK 21, TASK 22): `Derived Test Matrix` rows missing — `node dist/cli.js tests plan-check --plan=docs/plans/202610/701-engine-work-build-plan.md --log=…` exits 1 with `matrix` problems at lines 944, 954 and 964 ("TASK 20/21/22 names TEST FIRST tests but no Derived Test Matrix row maps to it"); Task 5's `DONE WHEN` requires the verb to exit 0 on this plan and the table to map every test-bearing task, and the plan's own append rule (line 117) says the merge writes one row per appended task. Five rows are needed (two for TASK 20, two for TASK 21, one for TASK 22); a fourth problem at line 979 names group 12's TASK 23, outside this group. — Fixable: true
