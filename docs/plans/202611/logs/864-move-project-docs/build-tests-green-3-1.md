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
| 9 | `.bkit/core/engine/checks/after/tools.test.ts` "keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 9 `.bkit/core/engine/checks/after/tools.test.ts` "keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace" — passed at the group's red, and the tests step accepted it: detectProjectDocs already resolves indexed equivalents and skips out-of-tree targets (task 5 code); no red is due
