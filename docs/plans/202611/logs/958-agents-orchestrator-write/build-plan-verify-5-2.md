Verdict: PASS
Failures: 0
Fixable: false
Tasks: 17, 18, 19, 20, 21
Loosened: none
Fingerprint: e81b94801943471a0d3879a6ed198d7849bae7da1d63c2d3e293023046362676
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-5-1.md` (attempt 1: `CONCERNS`, 1 gap on Task 17, the stray-question regex refusing Q10 or higher; closed by `build-plan-gaps-remediate-5-1-log.md`).

## Notes

Group 5 (Tasks 17-21, challenge round 1 findings), attempt 2, was judged against `build-diff-5-2.md`. The briefs `build-brief-5-1.md` and `build-brief-5-2.md` are identical and have no `Deviations` section. The four affected test files (`decisions.test.ts`, `open-decision.test.ts`, `steps.test.ts`, `audit-report.test.ts`) pass locally: 281 tests in 4 files.

- Attempt 1's one gap is closed. Remediation commit `0ea7c87c4` changed the stray-question regex at `decisions.ts:175` to `\*\*Q\d+(?!\d| — )`, mirrored it into `dist/commands/workflow/decisions.js:137`, and added the test `bkit decisions check > accepts a correctly written question numbered Q10`, which passes. Checked with node: `**Q10 — a:** b` and `**Q123 — t:** x` no longer match, while `**Q1 – a:** b`, `**Q12 – a:** b` and `**Q1:** b` still do.
- Test-first audit `build-tests-green-5-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all ten planned tests went red, then green. It has no `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` section.
- Task 17: satisfied. A line that opens like a question but is not split by `ITEM_SPLIT` (an en dash, or no dash at all) is refused with exit 6, and the refusal names the line. A file with no question is also refused when its engine file holds no loop question.
- Task 18: satisfied, as the decision record `build-decision-1-2.md` directs (Q1 `Fix now`, direction (a)). That decision was assumed by the orchestrator on the owner's behalf, not the owner's own words. `mergeItems` keeps the decision file's line only over an engine line that matches `TAKEN_UNASKED`. This code is unchanged since attempt 1.
- Tasks 19, 20 and 21: satisfied, and their code is unchanged since attempt 1. Out of scope, no gap: `parseAuditReport` narrows its table with a plain `as {...} | undefined` cast, which is not one of the banned escapes.
- `docs/testing.md` and `docs/observability.md` are present. The refusals use the engine's existing `problem` / `CommandError` output, so no new error path needs logging. The group 5 tasks name no `Documentation Updates` row.

## Identified Gaps Log

None
