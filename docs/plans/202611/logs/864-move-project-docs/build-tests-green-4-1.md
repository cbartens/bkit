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
| 10 | `.bkit/core/engine/commands/workflow/summary.test.ts` "excludes raw tracker text in related-issues.md from documentation warnings" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/summary.test.ts` "ignores warning records inside an UNTRUSTED fence" | red | passed |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes the v6.1.1 untouched security starter as unpopulated" | red | passed |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes a legacy deployments starter rendered with default branch dev" | red | passed |
| 12 | `.bkit/core/engine/install/managed-block.test.ts` "removes a v5 PolyForm-licensed notice with the wrapper" | red | passed |
| 12 | `.bkit/core/engine/install/managed-block.test.ts` "removes a pre-6.0 do NOT edit notice with the wrapper" | red | passed |
| 13 | `.bkit/core/engine/install/project-docs.test.ts` "reports instead of throwing when docs is a regular file" | red | passed |
| 13 | `.bkit/core/engine/checks/after/tools.test.ts` "returns an advisory instead of throwing when docs is a regular file" | red | passed |
| 14 | `.bkit/core/engine/checks/after/tools.test.ts` "does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent" | red | passed |
| 14 | `.bkit/core/engine/install/project-docs.test.ts` "registers a present default doc when its only equivalent row points at a missing file" | red | passed |

## Gaps

None.
