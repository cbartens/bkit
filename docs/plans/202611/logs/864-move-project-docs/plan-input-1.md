## Session Prompt — this run's, newer than everything below

[$bkit-plan](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-plan/SKILL.md) #864

## Issue description — oldest

### Narrative

Move project documentation from bkit-managed content to copy-and-own templates while actively encouraging consumers to adopt and populate it. Keep explicit, task-relevant document references in rules, prompts and the plan template. Missing or unpopulated documentation must produce visible, non-blocking warnings rather than broken workflows or silent skips.

The agreed direction is **not** to remove individual document mentions or hide all guidance behind a generic index. bkit should recommend a consistent documentation set, accept equivalent project documents, and record the sources actually consulted.

This includes a full review of which `docs/*.md` documents each rule, prompt, workflow responsibility and plan-template section should reference by name. It is not merely a wording change to existing references: inspect responsibilities that currently name no docs, identify missing consultation requirements, and add the appropriate explicit references with applicability and warning behavior.

### Success Criteria

- [ ] Move all ten current `.bkit/shared/docs/` files to `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise and setup. Install/upgrade refresh template copies; adopted project docs are consumer-owned and preserved. Keep essential bkit operating instructions current in managed guides/rules so they do not depend on optional adoption.
- [ ] Complete a responsibility-by-responsibility review of all shared rules, workflows, prompts and the plan template, including those with no existing doc references. Determine which `docs/*.md` files each should consult, add missing named references and correct inappropriate ones, with explicit applicability and warning-and-continue behavior. Record the reviewed responsibility, recommended doc paths and reason or not-applicable outcome so completeness can be checked. Merely adjusting existing mentions does not satisfy this criterion. Support design, audits and debug without a plan, build's issue-to-plan conversion and generated plans.
- [ ] Ship `.agents/docs.md` with only absolute core operational references inside `bkit:start/end`. Register adopted project docs in the consumer-owned Project Documents section when starters are copied into `docs/`, without duplicates or overwriting existing entries. An indexed but untouched starter still generates warnings.
- [ ] Add actionable, non-blocking adoption/population advisories through the existing advisory system. Accept indexed equivalent documents and distinguish missing, empty/template-only and populated documents. Use agent assessment for substantive coverage; do not claim semantic completeness from a mechanical check.
- [ ] Update documentation maintenance utility prompts, ship documentation updates and documentation audit templates to check presence, index accuracy and project content explicitly. Report absence and incomplete coverage; populate within authorized scope and evidence. Missing files cannot be silently skipped or yield a false clean/completion report.

### Agreed behavior

**Common consultation contract**

Review coverage must come from the full inventory of rules, prompts, workflow responsibilities and plan-template sections, not just search hits for existing doc paths. For each responsibility, decide which project documents supply relevant constraints or evidence and name them explicitly. Consider the complete recommended document set, including existing optional templates where relevant; do not mechanically attach every document to every prompt. The review record must distinguish newly added references, retained or corrected references, and justified cases where no project doc is needed.

Read `.agents/docs.md` and documentation relevant to the task, explicitly naming the recommended documents for that responsibility. Accept equivalent documents identified in Project Documents. If the index or a relevant document is missing, empty, or still an unpopulated starter, issue a documentation warning and proceed using available project evidence. Template guidance is not evidence of project facts.

Warnings name the topic/document, the gap, available alternative evidence and the recommended adoption/population action. Agents report gaps in their outputs; workflows consolidate duplicate warnings into one visible list per run. Unresolved gaps remain visible on subsequent relevant runs. Do not make every prompt read every document or warn about irrelevant topics.

Missing documentation alone never blocks execution. Existing safeguards still apply when information needed for a safe implementation decision is genuinely unresolved.

**Explicit plan requirements**

The plan template names recommended docs and applicability, rather than using generic wording alone:
- Always assess architecture, technology, security and testing documentation.
- Database changes: schema documentation.
- UI changes: design documentation.
- Logging changes: observability documentation.
- Deployment changes: deployment documentation.
- Other topics, including setup and intentional signal downgrades: consult when relevant.

Generated plans record topic, actual source path/section, coverage, gap/action, alternative evidence and remaining uncertainty. Mark irrelevant topics not applicable. Prominently surface missing or unpopulated relevant docs, and carry required reads and documentation updates into the executable tasks. Apply this to both generated and converted plans.

**Ownership and index**

Keep `.agents/docs.md` as a managed core index with a consumer-owned Project Documents section; do not move the entire index into templates. Adoption registers a document even before it is populated, but registration never proves adequate content. Unadopted templates are recommendations, not entries pretending to be existing project docs. Existing alternative names/locations are supported.

**Approved migration of already-installed docs**

The owner explicitly requested a migration for the ten previously managed project documents. Include it in the install/upgrade path and record it in `docs/migrations.md`.

- Remove the `<!-- bkit:start -->` and `<!-- bkit:end -->` ownership delimiters and the generated `bkit:managed` version/do-not-edit notice from those installed documents. Remove the wrappers, not the enclosed content: preserve headings, guidance and project edits inside and outside the former managed region.
- Scope cleanup to those ten formerly managed project documents; do not strip markers across `docs/` indiscriminately. Keep managed blocks in `.agents/docs.md`, `.agents/rules.md`, core plan/audit templates and other still-managed files.
- Retire their managed-file bookkeeping so subsequent install, upgrade, check and uninstall operations do not reclaim, overwrite, flag managed drift in or remove the now project-owned docs. Newly adopted document templates carry no managed ownership delimiters or generated do-not-edit notice.
- Preserve existing project index entries and register the migrated documents under Project Documents without duplication. Missing files stay missing rather than being silently adopted.
- Make the migration idempotent. Already-unmanaged documents are unchanged on repeat runs. For malformed or ambiguous markers, preserve content and report the cleanup gap rather than risk deleting text. Legacy unpopulated starters still receive the population warnings after ownership markers are removed.

**Maintenance and audits**

Both documentation update utilities and documentation audit templates explicitly check whether expected relevant docs exist and contain project-specific information. Utilities report gaps and update/populate within scope; audits produce findings and recommendations. Updating all existing files is not proof that the documentation set is complete. Surface warnings in reports and summaries rather than inserting duplicate warning banners throughout project docs.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Fresh consumer adopts no docs | Templates available; relevant warnings/advisories; workflows remain usable. |
| Missing document index | Warn, discover available project evidence, continue without inventing an index or facts. |
| Starter exists and is indexed but contains only template instructions/placeholders | Warn that it is unpopulated, even if the file is nonempty. |
| Indexed equivalent uses a different path | Consult it; do not emit a false missing-default-path warning. |
| Populated document lacks information needed for this change | Agent reports the specific coverage gap and alternative evidence/uncertainty. |
| Topic does not apply | Mark not applicable; no adoption warning for that task. |
| Multiple agents find the same gap | Preserve reports and consolidate the workflow's visible warning list. |
| Design/debug/audit runs without a plan | Use the same direct references, project index and warning contract. |
| Existing consumer upgrades | Remove ownership delimiters and generated managed notices only from the ten migrated docs; preserve all substantive content and index entries; retire managed bookkeeping. |
| Migration runs again, a document is absent, or its markers are malformed | Repeated runs are idempotent; absent files are not created; ambiguous content is preserved and the cleanup gap is reported. |
| Missing documentation hides an unresolved requirement or unsafe uncertainty | Warning does not override existing clarification/safety gates. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Fresh installation ships all ten templates without managed markers or creating managed project docs; legacy migration removes only ownership metadata, preserves edits inside/outside blocks and index entries, is idempotent, handles missing/malformed markers safely and leaves still-managed files unchanged; later install/upgrade/check/uninstall preserve project ownership | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` and affected existing check/uninstall integration tests |
| Adoption advisories distinguish missing, zero-content, unchanged starters, populated and indexed equivalent docs; remain non-blocking and respect existing advisory controls | Unit | A documentation detector test beside the implementation in `.bkit/core/engine/checks/after/` (exact filename resolved in plan) |
| Shipped rules/prompts/plan/audit templates consistently preserve explicit relevant references with warning-and-continue behavior, including no-plan paths and output reporting | Unit | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` and affected existing prompt/template audits |
| Packaged CLI on fresh and legacy scratch consumers verifies template refresh, project ownership, index preservation and advisory output | Smoke | Scratch consumer fixtures under `tmp/`; commands recorded in the implementation plan |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Ownership and consultation contract
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Move project docs to templates and make the managed index core-only.
  - **UPDATE:** `.bkit/shared/docs/`, `.bkit/templates/docs/`, `.bkit/core/.agents/docs.md`, install ownership declarations, the install/upgrade migration path, `docs/migrations.md` and template/adoption catalogs.
  - **DONE WHEN:** All ten documents are optional project-owned adoptions; already-installed copies have ownership delimiters/notices removed without losing content; managed bookkeeping is retired; fresh and existing consumers satisfy the ownership/index criteria.
  - **TEST FIRST:** Integration matrix row: fresh install, legacy marker removal, content/index preservation, idempotency and subsequent lifecycle operations preserve the required footprint and ownership.
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Review which docs every rule, prompt, workflow responsibility and plan-template section should reference, then implement the resulting consultation requirements and warnings.
  - **UPDATE:** `.bkit/core/.agents/rules.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.bkit/core/docs/templates/bkit-plan.md` and shared instruction sources.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** The full inventory is reviewed, including surfaces with no existing references; a coverage record identifies the recommended doc paths and applicability for each responsibility; missing named references are added and inappropriate references corrected. A wording-only sweep of existing mentions is insufficient. Absent/unpopulated docs warn without blocking; generated/converted plans carry actual sources and gaps; no-plan workflows remain supported.
  - **TEST FIRST:** n/a — instruction/template editing; Task 5 verifies the shipped contract.
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Make documentation maintenance and audits report adoption and content gaps.
  - **UPDATE:** Documentation utility prompts, `.bkit/core/prompts/bkit-ship-update-docs.md` and documentation audit templates under `.bkit/core/docs/templates/`.
  - **DEPENDS ON:** 1, 2.
  - **DONE WHEN:** Presence and population checks appear in both execution instructions and outputs; absent docs cannot silently disappear from results.
  - **TEST FIRST:** n/a — instruction/template editing; Task 5 verifies the shipped contract.
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Advisories and verification
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Add documentation adoption/population advisories.
  - **UPDATE:** Existing advisory detection, reporting and suppression integration.
  - **DEPENDS ON:** 1, 2.
  - **DONE WHEN:** Recommendations are actionable, recognize indexed equivalents and untouched starters, and never fail solely for absent optional docs.
  - **TEST FIRST:** Unit matrix row: documentation detector scenarios and non-blocking output.
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Verify source contracts, regenerate mirrors and dogfood the complete change.
  - **UPDATE:** Affected source-reference/template audits, generated mirrors, compiled engine output and product/setup documentation.
  - **DEPENDS ON:** 2, 3, 4.
  - **DONE WHEN:** Source contract and scratch-consumer matrix rows pass; supported hosts render consistently; upgrade preserves content; warning reporting matches the agreed behavior.
  - **TEST FIRST:** Unit matrix row: shipped instruction contract; Smoke matrix row: fresh and legacy consumers using the built CLI.
<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

The product behavior above is agreed. Planning resolves the exact core index inventory, warning representation/consolidation, detector boundaries and how adoption registers entries through the existing flow.

Priority: Low under the tooling/enhancement ranking rule. Size: L because the change spans installer ownership, advisories, multiple host renderings, rules, prompts and audit/plan contracts. No parent or blocking dependency identified. Target milestone: v6.2. Next step: planning.

### Breaking Changes & Naming

Ownership changes for the ten previously managed project documents. The owner has approved the migration described above, including removal of existing `bkit:start/end` delimiters and generated managed notices while preserving document content. Include the migration and its tests in this work; it is not an optional follow-up awaiting approval. Do not remove or rename the operational ledgers or plan/audit artifact paths as part of this work.

### Out of Scope

Forcing adoption through hard failures; automatically fabricating project facts; indiscriminately reading every doc in every prompt; changing ledger ownership; redesigning unrelated workflow gates; automatic overwrites of adopted docs.

### References

- `.bkit/shared/docs/`, `.bkit/templates/docs/`
- `.bkit/core/.agents/rules.md`, `.bkit/core/.agents/docs.md`
- `.bkit/core/prompts/`, `.bkit/core/workflows/`
- `.bkit/core/docs/templates/bkit-plan.md` and documentation audit templates
- `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/install.md`
- Related precedent: [#863 — Ship a purpose-based components document template](https://github.com/cbartens/bkit/issues/863), not a blocking dependency.
- Historical context: [#354 — Plan template doc stack-agnostic refactor](https://github.com/cbartens/bkit/issues/354). This issue explicitly chooses named recommended docs with equivalents and warnings, rather than eliminating doc names.
