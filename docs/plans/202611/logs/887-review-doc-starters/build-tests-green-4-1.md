Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/887-review-doc-starters-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is missing" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent when every project doc is populated and indexed" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip names the two project-docs advisory ids" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent for a Not applicable data-schema and a header-only noise" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is an unchanged starter copy" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent when project-docs-missing is ignored" | red | passed |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing" | red | passed |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "missing and unpopulated advisories name the adoption-order section" | red | passed |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "an empty project doc is reported as project-docs-unpopulated" | red | passed |
| 11 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is empty" | red | passed |
| 12 | `.bkit/core/engine/checks/after/tools.test.ts` "a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing" | red | passed |
| 12 | `.bkit/core/engine/install/project-docs.test.ts` "syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter with a project copy is marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter indexed under another path is marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter with no copy and changed non-doc template are not marked" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose recommended path is a symlink is not marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose recommended path is a directory is not marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted" | red | passed |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report" | red | passed |
| 13 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "bkit upgrade prints the adopted marker for a changed starter with a project copy" | red | passed |
| 13 | `.bkit/core/engine/install/project-docs.test.ts` "adoptedProjectDocPath returns the recommended path, an indexed equivalent or null" | red | passed |

## Gaps

None.
