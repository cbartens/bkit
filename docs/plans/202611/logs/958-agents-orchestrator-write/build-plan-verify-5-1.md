Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 18, 19, 20, 21
Loosened: none
Fingerprint: 9096638e7edc1d55ffb0ed905a670d7933b132230b6a33aeefdbcb92b581fd99
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

Group 5 (Tasks 17-21, challenge round 1 findings) was judged against `build-diff-5-1.md`. The briefs `build-brief-5-1.md` and `build-brief-5-2.md` are identical and have no `Deviations` section. The four affected test files (`decisions.test.ts`, `open-decision.test.ts`, `steps.test.ts`, `audit-report.test.ts`) pass locally: 280 tests in 4 files.

- Test-first audit `build-tests-green-5-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all ten planned tests went red then green. It has no `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` section.
- Task 17: the en dash case and the no-question case are refused with exit 6 as the DONE WHEN asks, and `decisions counts` runs before `decisions check` in `bkit-build.md` Decision Pause, so a loop-only pause is checked with its engine file present. Not satisfied: the new stray-question regex at `decisions.ts:175` also refuses a correct question numbered Q10 or higher (checked with node: `**Q10 — a:** b` and `**Q12 — t:** x` match, `**Q1 — a:** b` does not), which is a line ITEM_SPLIT does split.
- Task 18: satisfied, as the owner's decision record `build-decision-1-2.md` directs (Q1 `Fix now`, direction (a); it is `assumed by the orchestrator on the owner's behalf`, not the owner's own words). `mergeItems` keeps the decision file's line only over an engine line matching `Accept (assumed)` or `recommended; applied without asking`. `decisions apply --by=owner`, the gate re-run line and ship's confirm line do not match, so they still win. `tasks tick`, `skipProblem`, `gateRerun`, `openDecision` / `pauseStatus` and the summaries all read through `decisionItems` / `mergeItems`. The plan's Edge Cases row (plan line 121) states the narrowed rule, and the existing test `the engine file's Decision line wins for one question` is unchanged.
- Task 19: satisfied. `itemProblem` refuses a `Status`, `Source changed` or `Gate` line in `decisionHeader` and names it.
- Task 20: satisfied. `fencedLines` / `unfencedLines` in `challenge.ts` keep fenced lines from counting and from starting or ending a section in `reportSection`, and the mismatch text names the rule.
- Task 21: satisfied. `readTable` in `audit-report.ts` keeps backslashes, skips alignment separators and a lone `None` / `N/A` row, and refuses a row with the wrong cell count by its first cell, which is `ID` in every audit template. Out of scope, no gap: `parseAuditReport` narrows the table with a plain `as {...} | undefined` cast, which is not one of the banned escapes.
- `docs/testing.md` and `docs/observability.md` are present. The refusals use the engine's existing `problem` / `CommandError` output, with no new error path to log. The plan's group 5 tasks name no `Documentation Updates` row.

## Identified Gaps Log

1 gap.

TASK 17: `.bkit/core/engine/commands/workflow/decisions.ts:175` the stray-question regex `\*\*Q\d+(?! — )` backtracks on a number of two or more digits, so a correctly written `**Q10 — {title}:**` (any Q10 or higher, which ITEM_SPLIT does split) matches as a stray line and `decisions check` exits 6 on a valid file; two exit 6 results send the pause to Failure Path. The DONE WHEN limits the refusal to lines ITEM_SPLIT does not split. Fix: forbid a following digit in the lookahead (e.g. `\*\*Q\d+(?!\d| — )`) and add a `decisions check` test that accepts a Q10 question — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 17: the stray-question regex refuses a correct **Q10 — question (any number of two or more digits)
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:175` · **Round:** 1
  - **DONE WHEN:** `decisions check` exits 6, naming the line, for any line that opens like a question (`**Q{n}` or a `Q{n}` heading) that `ITEM_SPLIT` does not split, and for a decision file with no question at all when its engine file holds no loop question.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/decisions.test.ts
<!-- bkit:task 1 end -->
