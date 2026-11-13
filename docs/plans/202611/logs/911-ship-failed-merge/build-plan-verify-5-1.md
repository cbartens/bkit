Verdict: PASS
Failures: 0
Fixable: false
Tasks: 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Task 8 was judged against the final tree (commit `3d765165e`; the working tree holds only log changes) and the group diff `build-diff-5-1.diff`. Two code agents made the edits, so the tree was checked directly rather than through the code log.

- `FlagSpec.placeholderExit?: number` is in `.bkit/core/engine/commands/lib.ts:154`. `refuseUnsubstituted` now takes the spec and throws `spec.placeholderExit ?? EXIT.USAGE` (`lib.ts:272`), for both named and positional flags.
- `placeholderExit: EXIT_NEXT_STEP_REFUSED` is set only on the `next-step` spec (`.bkit/core/engine/commands/workflow/workflows.ts:2252`). No other engine file sets `placeholderExit`. The `exitCodes` text for exit 6 now names the placeholder case.
- Every other flag still exits 2. The existing `lib.test.ts` cases `refuses a literal workflow placeholder in ... (exit 2)` and `refuses a placeholder in a positional argument` assert `EXIT.USAGE` through the `usage()` helper, and they pass.
- The wording is updated in `.bkit/core/workflows/bkit-ship.md:101`, `.bkit/instructions.md` (two places), `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, the host mirrors (`.claude/commands`, `.cursor/commands`, `.opencode/commands`, `.agents/skills/bkit-ship/SKILL.md`, `.agents/plugins/bkit/skills/bkit-ship/SKILL.md`), the render baseline `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` and the `.bkit/version` hashes. A search found no stale copy of the old exit-6 wording outside `docs/plans`.
- `dist/commands/lib.js` and `dist/commands/workflow/workflows.js` carry the same change as the sources.
- The planned test `bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit` exists at `.bkit/core/engine/commands/workflow/workflows.test.ts:910`. It was red before the code (`build-tests-red-5-1.md`: expected 2 to be 6) and passes now. It checks both `/bkit-debug {FID}` and `{NEXT_STEP}`, an unchanged status file, no `workflow-failed` row, and a lock still held. Its Derived Test Matrix row (plan line 140, task 8) is covered.
- Re-run here: the filtered `lib.test.ts` and `workflows.test.ts` placeholder / `--next-step` cases (11 passed), plus `ship-invariants.test.ts` and `render/trackers.test.ts` (173 passed).
- Test-first audit: `Enforced: true`, 0 gaps, 0 unproven, 0 updated tests.
- No error-logging path changed, so `docs/observability.md` does not apply.

## Identified Gaps Log

0 gaps. None
