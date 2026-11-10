Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an ambiguous legacy wrapper left in a project document" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a plan built from the unfilled bkit-plan.md template yields no documentation warning" | red | passed |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an index row through a regular file as ambiguous instead of throwing" | passed-accepted | passed |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports a NUL-byte index path as ambiguous instead of throwing" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 17 `.bkit/core/engine/checks/after/tools.test.ts` "reports an index row through a regular file as ambiguous instead of throwing" — passed at the group's red, and the tests step accepted it: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture; no red is due
- Task 17 `.bkit/core/engine/checks/after/tools.test.ts` "reports a NUL-byte index path as ambiguous instead of throwing" — passed at the group's red, and the tests step accepted it: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture; no red is due
