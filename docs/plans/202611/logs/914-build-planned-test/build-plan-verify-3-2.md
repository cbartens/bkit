Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 8, 9, 10
Loosened: none
Fingerprint: 17983a38189ed9d2ad4a553e7b5614259f863fd999160ddf336e12795387b1fe
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md` (FAIL, 2 gaps): the deleted-or-renamed-test gap is closed by `build-plan-gaps-remediate-3-1-log.md`; the 13-rewritten-tests gap (`Fixable: false`) still stands.

## Notes

- Mode `Group`, judged against `build-diff-3-2.md` (the group's changes since 7173cf467, through a566a20f4).
- Task 8: `touchedTests` (`tests.ts:458`) skips a blob-less baseline only when `t.fromChange`; its test passes.
- Task 9: the exit 11 `problem` names "the change a code step already recorded ... (changedTests)" for a `fromChange` baseline and keeps the red wording otherwise; its test passes.
- Task 10: the `problem` says "the BLOCKED line's reason ... is already recorded for that test — log a new reason"; a new reason still lets the test through; its test passes.
- Task 11: the additive check, the stored `blob` and `after`, `diff` and `additive` on `tests green` `changed`, the report diff fence, the § Decision Pause rule, both code prompts, `.bkit/core/.bkit/workflows.md` § Test-first and `docs/testing.md:314` all landed, and its 5 tests pass. It stays off `Tasks` for the gap logged below.
- Remediate gap 2 of attempt 1: `steps.ts` now counts a null `baselineDiff` against a recorded baseline as not additive (`removes = diff === null ? c.text !== null : !diff.additive`). The new test covers a rename; a deleted test takes the same branch (its lines are gone, so `testBlock` returns null), so the gap is closed.
- Targeted run: `steps.test.ts`, `tests.test.ts`, `planned-test-lock.integration.test.ts` and `workflow-shape.test.ts`: 4 files, 596 tests passed, so the tests of Tasks 1-4 pass.
- Test-first audit (`build-tests-green-3-2.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests`, `Already landed` or `Changed by a code step` section.
- Decision records: `build-decision-1-2.md` (`Fix now — diff + refuse`) is the owner's direction Task 11 follows; `build-decision-1-1.md` concerns group 1's gate. Neither accepts the 13 rewritten tests, and no decision record was written after `build-plan-verify-3-1.md`.
- The remediate step's finish (status.jsonl line 277) passed with no exit 11 although this branch's engine reports 13 changed planned tests, so the engine that ran it is not this branch's `dist/`; which one ran is not recorded.
- The `bkit:generate` render-snapshot `BLOCKED` lines (execute and remediate logs) are a group-gate matter, not a gap here, because no group 3 `DONE WHEN` names that test.
- `docs/observability.md`: the refusal path logs through `ctx.log` and appends the `agent-rework` friction row, as before.

## Identified Gaps Log

1 gap.

- TASK 11: `.bkit/core/engine/commands/workflow/steps.test.ts`, `tests.test.ts`, `planned-test-lock.integration.test.ts` — the 13 planned tests of Tasks 2-4 that commit cc3170b86 rewrote are still rewritten after the remediate round, with no `changedTests` record on any group 3 row (status.jsonl lines 260 and 277) and no decision record about them. `touchedTests` from this branch's `dist/` reports all 13 changed against their red baseline, and `baselineDiff` reports 12 of them non-additive, which Task 11's rule refuses even under a `BLOCKED` line. So Step 15 `tests green` will not show them to the owner, and the next code step's finish under this branch's engine is refused for tests it did not touch. Restoring the old lines breaks the tests, so only the owner can accept the rewrites or send them to the tests step — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** 13 planned tests of Tasks 2-4 rewritten with no changedTests record
  **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.test.ts:2210` · **Round:** 1
  - **DONE WHEN:** Every planned test of Tasks 2-4 that the group 3 code step changed either reaches the owner (recorded so tests green lists it under changed) or is restored, and a code step steps finish under this branch engine is not refused for tests it did not touch; the owner decides between accepting the rewrites and sending them to the tests step.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
    - .bkit/core/engine/commands/workflow/tests.test.ts
    - .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
<!-- bkit:task 1 end -->
