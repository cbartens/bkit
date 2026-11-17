Enforced: true
Verdict: null
Gaps: 10
Unproven: 2

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "ships ten optional document starters on fresh install" | red | passed |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves the contents of a legacy managed document when reinstalling" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "migrates legacy ownership without changing project text or core ownership" | vacuous | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "preserves ambiguous legacy markers and reports cleanup without blocking check" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "previews project document migration without mutating the checkout" | red | passed |
| 1 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "preserves project document copies on full uninstall" | red | passed |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "registers an adopted starter without duplicating project rows" | red | passed |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves indexed equivalents and warns about unsafe registration paths" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates.test.ts` "resolves documentation references against the correct ownership sources" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` "allows qualified project document reads and rejects mandatory template dependencies" | red | passed |
| 8 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "leaves project docs, the index and the version file unchanged when upgrade runs twice" | passed-accepted | passed |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "distinguishes missing and empty project documentation from populated candidates" | red | passed |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes current and migrated untouched starters" | red | passed |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" | vacuous | passed |
| 5 | `.bkit/core/engine/checks/after/index.test.ts` "reports and suppresses project documentation advisories without a blocker" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/summary.test.ts` "consolidates documentation warnings from the active run without changing its verdict" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` "reports only attributed documentation warnings for the active run" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "covers the full documentation responsibility inventory" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "ships documentation warning contracts for plan and no-plan paths" | red | passed |
| 9 | `.bkit/core/engine/checks/after/tools.test.ts` "keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace" | passed-accepted | passed |
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
| 15 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an ambiguous legacy wrapper left in a project document" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a plan built from the unfilled bkit-plan.md template yields no documentation warning" | red | passed |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an index row through a regular file as ambiguous instead of throwing" | passed-accepted | passed |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports a NUL-byte index path as ambiguous instead of throwing" | passed-accepted | passed |
| 18 | `.bkit/core/engine/commands/workflow/summary.test.ts` "ignores a warning record placed after a forged closing marker in a fenced context artifact" | red | passed |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid same-topic row when the first indexed row is stale" | red | passed |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid equivalent row when the first is out of tree" | red | passed |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies a starter copy that differs only in whitespace as unpopulated" | red | passed |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies an indented legacy starter copy as unpopulated" | red | passed |
| 21 | `.bkit/core/engine/install/project-docs.test.ts` "does not add a second row for a default doc indexed through a markdown link" | red | passed |
| 21 | `.bkit/core/engine/checks/after/tools.test.ts` "reads the Scope of a row without a trailing pipe" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/architecture.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/technology.md` is still referenced as `technology`: `.agents/plugins/bkit/agents/bkit-build-install-skills.md:53`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:54`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:55`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:74`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:86`, and 226 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/security.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/data-schema.md` is still referenced as `data-schema`: `.bkit/README.md:294`, `.bkit/core/.bkit/README.md:294`, `.bkit/core/.bkit/install.md:335`, `.bkit/core/.bkit/templates.md:653`, `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:203`, and 22 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/testing.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/deployments.md` is still referenced as `deployments`: `.bkit/README.md:294`, `.bkit/core/.bkit/README.md:294`, `.bkit/core/.bkit/install.md:335`, `.bkit/core/.bkit/prompts.md:545`, `.bkit/core/.bkit/prompts.md:546`, and 258 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/observability.md` is still referenced as `observability`: `.agents/context.md:118`, `.agents/plugins/bkit/agents/bkit-debug-abort-handover.md:108`, `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md:107`, `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md:167`, `.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md:54`, and 465 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/design.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/noise.md` is still referenced as `noise`: `.agents/plugins/bkit/agents/bkit-design-review-2.md:106`, `.agents/skills/brainstorming/visual-companion.md:100`, `.agents/skills/property-based-testing/references/interpreting-failures.md:11`, `.agents/skills/property-based-testing/references/refactoring.md:115`, `.agents/skills/property-based-testing/references/reviewing.md:34`, and 330 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/setup.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Already landed

- Task 8 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "leaves project docs, the index and the version file unchanged when upgrade runs twice" — passed at the group's red, and the tests step accepted it: the file ran 68/68 green; the existing upgrade migration already leaves docs, index and version unchanged, and the two excluded files are skipped by the test itself; no red is due
- Task 9 `.bkit/core/engine/checks/after/tools.test.ts` "keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace" — passed at the group's red, and the tests step accepted it: detectProjectDocs already resolves indexed equivalents and skips out-of-tree targets (task 5 code); no red is due
- Task 17 `.bkit/core/engine/checks/after/tools.test.ts` "reports an index row through a regular file as ambiguous instead of throwing" — passed at the group's red, and the tests step accepted it: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture; no red is due
- Task 17 `.bkit/core/engine/checks/after/tools.test.ts` "reports a NUL-byte index path as ambiguous instead of throwing" — passed at the group's red, and the tests step accepted it: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture; no red is due

## Unproven

- Task 1 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "migrates legacy ownership without changing project text or core ownership" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 5 `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
