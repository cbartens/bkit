Verdict: FAIL
Failures: 2
Fixable: true
Tasks: 8, 9, 10
Loosened: none
Fingerprint: 3d85c097e59571802ad5144b811da0ef0e69c3b43229ab6b3e4d9c4a575e4f25
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-3-1.md` (commit cc3170b86 over 7173cf467).
- Task 8: `touchedTests` (`tests.ts:458`) now skips a blob-less baseline only when `t.fromChange`; its test passes.
- Task 9: the exit 11 `problem` names "the change a code step already recorded" (`changedTests`) for a `fromChange` baseline and keeps the red wording otherwise; its test passes.
- Task 10: the `problem` adds "the BLOCKED line's reason ... is already recorded for that test — log a new reason"; a new reason still lets the test through; its test passes.
- Task 11: the additive check, the stored `blob` and `after`, the `diff` and `additive` on `tests green` `changed`, the report diff fence, the § Decision Pause rule, both code prompts, `.bkit/core/.bkit/workflows.md` § Test-first and `docs/testing.md` § Test first all landed, and its 5 tests pass. It stays off `Tasks` for the two gaps logged below.
- Targeted run: `steps.test.ts`, `tests.test.ts`, `planned-test-lock.integration.test.ts` and `workflow-shape.test.ts`: 4 files, 595 tests passed, so the tests of Tasks 1-4 pass.
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section.
- Decision records: `build-decision-1-2.md` (`Fix now — diff + refuse`) is the owner's direction Task 11 follows; `build-decision-1-1.md` concerns group 1's gate and accepts nothing here.
- The execute log's last `BLOCKED` line (the `bkit:generate` render snapshot `bkit-build: the none render matches its baseline`) is a group-gate matter, not a gap here, because no group 3 `DONE WHEN` names it.
- Which engine ran the group 3 `steps finish` is not recorded; the evidence is only that the step-done row has no `changedTests` while this branch's `touchedTests` reports 13 changed tests now.
- `docs/observability.md`: the refusal path logs through `ctx.log` and appends the `agent-rework` friction row, as before.

## Identified Gaps Log

2 gaps.

- TASK 11: `.bkit/core/engine/commands/workflow/steps.test.ts`, `tests.test.ts`, `planned-test-lock.integration.test.ts` — 13 planned tests of Tasks 2-4 were rewritten in commit cc3170b86 (for example `write(cwd, TEST.file, body("2", "0"))` replaced by `grown(body, 1, 0)`, exact `toEqual` replaced by `objectContaining`), but the group 3 `build-plan-tasks` step-done row (status.jsonl line 260) carries no `changedTests` and no exit 11 refusal was recorded. `touchedTests` run now with this branch's engine reports all 13 as changed from their red baseline; "the refusal names the BLOCKED line the engine reads" has no BLOCKED line in the log at all, and the log's `BLOCKED — TASK 1` line names a test whose red row says task 2. So Step 15 `tests green` will not list these changes for the owner, the next code step's finish will be refused for 13 tests it did not touch, and the changes remove lines, which Task 11's own rule refuses even under a BLOCKED line. No code step can close it: restoring the old lines breaks the tests (they assert a rewrite is let through, which Task 11 now refuses), and only the owner can accept the rewrites or send them to the tests step — Fixable: false
- TASK 11: `.bkit/core/engine/commands/workflow/steps.ts:1332` — a BLOCKED-named change that deletes a planned test or renames its name string is let through and recorded: `touchedTests` reports it (current block null, baseline block set), but `baselineDiff` returns null when the test's lines cannot be found now, and `finish` refuses only when `diff !== null && !diff.additive`. DONE WHEN says a change that removes any of the test's own lines is refused with exit 11 even under a BLOCKED line; treat a null diff with a readable baseline as not additive, and add a test for the deleted-test case — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** 13 planned tests of Tasks 2-4 rewritten with no changedTests record
  **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.test.ts:2210` · **Round:** 1
  - **DONE WHEN:** Every planned test of Tasks 2-4 that the group 3 code step changed either reaches the owner (recorded so `tests green` lists it under `changed`) or is restored, and a code step's `steps finish` under this branch's engine is not refused for tests it did not touch; the owner decides between accepting the rewrites and sending them to the tests step.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
    - .bkit/core/engine/commands/workflow/tests.test.ts
    - .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A BLOCKED line lets through a deleted or renamed planned test
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1332` · **Round:** 1
  - **DONE WHEN:** `steps finish` refuses with exit 11, under a BLOCKED line naming it, a change that deletes a planned test or renames its name string (baselineDiff null with a readable baseline counts as not additive), and a steps.test.ts test covers the deleted-test case.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
<!-- bkit:task 2 end -->
