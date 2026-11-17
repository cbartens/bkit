## Owner answers

Round of 2026-11-14, in chat. The owner was asked two questions one by one, then settled a third point in chat, and approved the recommended option for every other open item with "ok do it".

### 1. Ignore entry silences the tip and every advisory it names

**Question:** #887 question 1 of 2. The new project-docs tip reuses three advisory ids: missing, empty and unpopulated. Under the catalogue rule, a project that adds just `project-docs-missing` to `bkit.advisories.ignore` (say it deliberately has no security doc) also silently stops hearing that its other docs are still unfilled starters. Is that acceptable?

**Answer:** Accept it. Follow the catalogue rule as is: one ignore entry silences the tip and all the advisories it names. Document the effect in the tip's caution text.

Decision: 887-project-docs-tip-placement

### 2. Release coupling with #864

**Question:** #887 question 2 of 2. The plan assumes #887 ships in v6.2 together with #864, and nothing enforces that. If v6.2 goes out without #887, people's untouched copies of today's starters stop being recognised as unfilled once #887 rewrites the starter text, so the unpopulated warning goes quiet for them. How do you want that covered?

**Answer:** Hold v6.2 for #887. No code; the plan's assumption stays as is. The Suggested Scope Expansion row "Nothing enforces 'ships in the same release as #864'" is settled this way.

Decision: none

### 3. Merge `project-docs-empty` into `project-docs-unpopulated`

**Question:** the three advisories overlap; are all three needed? (`project-docs-empty` is the extreme case of `project-docs-unpopulated`; `project-docs-missing` needs a different fix.)

**Answer:** "ok do it - project-docs-empty merges into project-docs-unpopulated". `project-docs-missing` stays its own id. In this plan:

- `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts` reports a whitespace-only doc as `project-docs-unpopulated`; the `project-docs-empty` finding and its `action` text are removed. Lands in Task 11, with a new test `an empty project doc is reported as project-docs-unpopulated` in `.bkit/core/engine/checks/after/tools.test.ts`; the existing `project-docs-empty` assertion in that file (line 507) moves to the unpopulated id.
- `docs/observability.md` line 218 (the `project-docs-empty` row of the advisory table) is removed, and the `project-docs-unpopulated` row reads "A covering document is empty, still a current or legacy starter, or only headings" (Task 11).
- The `project-docs` tip's `advisories` names two ids, `project-docs-missing` and `project-docs-unpopulated` (Task 10). The test `project-docs tip names the three project-docs advisory ids` becomes `project-docs tip names the two project-docs advisory ids`; this replaces the earlier owner answer that kept "three".
- Matrix row `missing, empty and unpopulated advisories name the adoption-order section` becomes `missing and unpopulated advisories name the adoption-order section`; row `ignoring project-docs-missing drops the empty and unpopulated advisories and keeps project-docs-index-missing` becomes `ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing`. `project-docs tip fires when a project doc is empty` stays: an empty doc now raises `project-docs-unpopulated`.
- Success Criterion 5, Process Sketch, Edge Cases, Breaking Changes (new removed id; the ignore effect now covers two ids) and every other mention of three ids or of `project-docs-empty` follow. No migration: none of the three ids exists in v6.1.1.

Decision: 887-project-docs-empty-merged-into-unpopulated

### 4. Where the index row's Scope text lives in code

**Question:** Where does the index row's Scope text live in code? Options: A) Keep `TOPIC_INFO[topic].scope` in `project-docs.ts` and let the starter-shape test assert the starter's given row equals `projectDocRow(topic)` · B) Parse the Purpose line out of the shipped starter at runtime.

**Answer:** A (recommended), approved by the owner with "ok do it".

Decision: 887-project-doc-index-row-source

### 5. Which changed starters get the "adopted" marker

**Question:** Which changed starters get the "adopted" marker in the upgrade report? Options: A) Only the ten `PROJECT_DOC_TOPICS` · B) The ten topics plus `docs/components.md` by a same-path check · C) B plus `capabilities.md`.

**Answer:** B (recommended), approved by the owner with "ok do it". `capabilities.md` stays unmarked because the rollup regenerates it.

Decision: 887-upgrade-report-adopted-marker

### 6. How a section is marked project slot or bkit practice

**Question:** How is a section marked as a project slot or as bkit practice? Options: A) A blockquote first line under the heading · B) A heading suffix such as `## Rollback (project slot)`.

**Answer:** A (recommended), approved by the owner with "ok do it".

Decision: 887-project-doc-slot-practice-marker

### 7. New slot headings and `uncoveredBkitDocSections`

**Question:** How do the new project-slot headings satisfy `uncoveredBkitDocSections` in `templates.test.ts`? Options: A) Add each reported slot heading to `UNAUDITED_DOC_SECTIONS` and drop the six `§ Project facts to record` entries · B) Name the slots from an audit template.

**Answer:** A (recommended), approved by the owner with "ok do it".

Decision: 887-project-doc-slot-practice-marker

### 8. Suggested Scope Expansion rows

**Question:** the Suggested Scope Expansion rows marked "fold in if the owner agrees" or "owner decides".

**Answer:** approved by the owner with "ok do it":

- Fold into Task 1: `.bkit/instructions.md` § Template Instructions opener (line 9879, "The plan template holds shape only") is reworded to match the reworded § Doc Templates, the same claim Task 1 fixes in the line 27 row.
- Fold into Task 8: the ci-yml advisory action text in `.bkit/core/engine/checks/after/tools.ts` (line 304) drops "promote after the capstone", the same stale fact Task 8 removes from `TOPIC_INFO.deployments`.
- Fold into Task 10: the `catalogue.ts` text-rule header comment says `DETAILS.md` § Templates ready to adopt where it says "README".
- Keep deferred: the `readStarterText` containment check, the out-of-tree fixture in `tools.test.ts`, and every other row already marked "keep deferred" or "follow-up issue".
- #863 being open does not block: `.bkit/templates/docs/components.md` is on `dev`.

Decision: none
