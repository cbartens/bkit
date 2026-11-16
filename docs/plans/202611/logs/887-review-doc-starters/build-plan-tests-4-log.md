Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 10: unchanged-starter fixture from .bkit/core/engine/checks/after/tools.ts:443
SOURCE — TASK 10: assessDocText empty/starter/heading-only reading from .bkit/core/engine/checks/after/tools.ts:454
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is missing`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when every project doc is populated and indexed`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip names the two project-docs advisory ids`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent for a Not applicable data-schema and a header-only noise`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is an unchanged starter copy`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when project-docs-missing is ignored`
WROTE — TASK 10: `.bkit/core/engine/checks/tips/catalogue.test.ts` `ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing`
WROTE — TASK 11: `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is empty`
WROTE — TASK 11: `.bkit/core/engine/checks/after/tools.test.ts` `missing and unpopulated advisories name the adoption-order section`
WROTE — TASK 11: `.bkit/core/engine/checks/after/tools.test.ts` `an empty project doc is reported as project-docs-unpopulated`
WROTE — TASK 12: `.bkit/core/engine/checks/after/tools.test.ts` `a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing`
WROTE — TASK 12: `.bkit/core/engine/install/project-docs.test.ts` `syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row`
WROTE — TASK 13: `.bkit/core/engine/install/project-docs.test.ts` `adoptedProjectDocPath returns the recommended path, an indexed equivalent or null`
SOURCE — TASK 13: formatTemplateChanges(changes, cwd) second-parameter position from .bkit/core/engine/install/template-copies.ts:127 and the call at .bkit/core/engine/commands/install/upgrade.ts:818
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with a project copy is marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter indexed under another path is marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with no copy and changed non-doc template are not marked`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a symlink is not marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a directory is not marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted`
WROTE — TASK 13: `.bkit/core/engine/install/template-copies.integration.test.ts` `missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report`
WROTE — TASK 13: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `bkit upgrade prints the adopted marker for a changed starter with a project copy`
