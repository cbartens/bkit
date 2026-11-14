## #863 — Ship a purpose-based components document template (open)

### Narrative

Ship a reusable, purpose-based `docs/components.md` template and populate it for bkit. The document explains what the repository does without requiring a reader to inspect code. Its structure draws on a consumer's component document and bkit's existing `floorplan/` walkthrough.

The final overview includes the five development workflows; Core, Shared and Templates; multiple assistant hosts and model providers; and the core concepts explained in `DETAILS.md`. It contains **one Mermaid chart**. It references `docs/capabilities.md` without requiring matching component names, counts or boundaries.

### Success Criteria

- [x] Ship `.bkit/templates/docs/components.md` as a copy-and-own template and populate `docs/components.md` for bkit.
- [x] Explain Design, Plan, Build, Debug and Ship, including inputs, outcomes, direct entry points, Debug's recovery role and Auto's routing role.
- [x] Explain Core/Shared/Templates ownership and supported hosts/providers, with more detail for Shared and Templates while staying at the level of purpose.
- [x] Keep exactly one Mermaid chart; distinguish this view from architecture, the generated capability register and the interactive floorplan.
- [x] Integrate discovery/adoption documentation and verify packaging, formatting and preservation of adopted content.

### Completed Work

1. **Initial template and bkit overview**
   - Added a reusable template with purpose, responsibilities, relationships, journeys, shared foundations, scope and related views.
   - Populated bkit's document, read the consumer example after its path was supplied, and used its purpose groups and component breakdown as structural inspiration.
   - Added the template catalog entry and adoption instructions, regenerated the installed catalog mirror, registered the document in the project document index and linked it from architecture.
   - Extended the existing adoption audit to allow the populated body and removal of the template introduction while preserving the shared rules header.
2. **Lifecycle and ownership refinement**
   - Made all five workflows explicit, with a purpose/input/output table.
   - Added Core, Shared and Templates as delivery and ownership roles, including package-only sources, managed content and consumer-owned adopted copies.
   - Added generic primary-workflow and optional delivery/ownership prompts to the reusable template.
3. **Single chart and host/provider support**
   - Consolidated the lifecycle and supporting responsibilities into one Mermaid chart.
   - Explained the distinction between hosts and providers: Claude/Anthropic, Codex/OpenAI, Cursor/Cursor, Antigravity/Google, and OpenCode with OpenRouter, Ollama, Zen or Go.
   - Covered per-agent model/effort choices, multiple configured hosts, retained OpenCode provider configurations and saved-state continuation. Clarified that switching is configured rather than automatic request failover.
   - Linked the authoritative provider and agent catalogs and acknowledged host-specific tool/permission limits.
4. **Product concepts and expanded Shared/Templates**
   - Read `DETAILS.md` and brought out independent specialist review, completion checked by code, test-first evidence, human control, persistent project knowledge, focused resumable work and audits beyond existing tests.
   - Expanded Shared into project knowledge foundations, assistant/tool connections and environment/workspace conventions.
   - Expanded Templates into verification/delivery, cloud continuation/evidence, code understanding/work intake and security/repository upkeep.
   - Distinguished Core's installed audit checklists in `docs/templates/` from copy-and-own tools in `.bkit/templates/`.
   - Expanded the same single chart with these groups, independent review, owner decisions, knowledge upkeep and audit findings feeding Plan.
   - Kept detailed inventories, counts, benchmarks, model versions and setup recipes in their existing documentation.

### Files Changed

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.bkit/templates/docs/components.md` | New shipped template, refined through all follow-ups. |
| `docs/components.md` | Populated bkit overview and single integrated Mermaid chart. |
| `.bkit/core/.bkit/templates.md` | Canonical template catalog and adoption instructions. |
| `.bkit/templates.md` | Regenerated installed catalog. |
| `.agents/docs.md` | Project-owned document index entry. |
| `docs/architecture.md` | Link and boundary between purpose and implementation views. |
| `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Declared permitted adoption customizations. |
| `.bkit/version` | Installer-generated hashes for changed managed documents. |

Scratch smoke fixtures and the accumulating work record were kept under ignored `tmp/`; they are not shipped.

### Commits

These commits are present on local `dev`; **they have not been pushed**.

<!-- prettier-ignore -->
| Commit | Work |
| --- | --- |
| `19cb2d9b81cd061b175ad826a0002c8683f39d67` | Ship purpose-based repository overview and template integration. |
| `762e806681e5ff29a16409899b7460cfa627b724` | Explain lifecycle and content ownership. |
| `1951b1b4c092eee6b5e4e8b07d7b4fe733f0dc62` | Unify the diagram and explain providers. |
| `86dd0f383a63bb4cf1b73ba01a788201b4e64159` | Clarify core ideas and supporting roles from the product guide. |

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Outcome |
| --- | --- |
| No capability register or floorplan | Template identifies these as optional; the component document remains usable. |
| Components differ from generated capabilities | Explicitly allowed; no one-to-one mapping is required. |
| Install or upgrade after a consumer adopts the document | The template source refreshes and the adopted document remains unchanged. |
| Different assistant hosts/providers | The overview describes the shared process while linking host-specific limitations. |
| Workflow failure | Debug is a recovery path, not a mandatory phase after a successful build. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Check | Type | Evidence |
| --- | --- | --- |
| Existing adoption, shipped-reference, branding, template-content, template-path and template-copy checks | Unit | Initial six-file run: 528 passed and one missing template-introduction failure; fixed the introduction, then both affected files passed all 173 tests. The other four files had passed all 356 tests. |
| Lifecycle refinement | Unit | 458 tests passed across three affected files. |
| Single-chart/provider refinement and final Shared/Templates refinement | Unit | Each follow-up passed all 173 tests across the adoption and template-content files. |
| Formatting, test-file lint, shared-instruction consistency, relative links and whitespace | Static | Passed for the applicable changed files. Exactly one Mermaid block was checked in each component document. |
| Build | Build | `pnpm build` passed; no compiled output changed. |
| Fresh consumer using built CLI, Claude and Codex selected | Smoke | Install copied the template byte-for-byte without creating an adopted `docs/components.md`. Repeat install and upgrade preserved a project-owned adopted document and refreshed the template source/catalog. |

Final targeted unit command:
```text
pnpm test .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts
```

Commit hooks passed and the working tree was clean after the last implementation commit. Catalog regeneration completed without conflicts. Existing setup advisories were outside this documentation change. The initial sandbox restriction on tsx's local socket was resolved through an approved rerun.

No integration, E2E or live tiers were run for this documentation change. Mermaid block count and document structure were checked; a rendered visual preview was not part of the recorded verification.

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Ship the purpose-based overview
<!-- bkit:task 1 start -->
- [x] **TASK 1:** Create the shipped template and populated bkit document.
  - **CREATE:** `.bkit/templates/docs/components.md`, `docs/components.md`.
  - **DONE WHEN:** Both describe responsibilities and relationships at the intended level.
  - **TEST FIRST:** n/a — documentation; existing unit audits and smoke checks above provide verification.
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [x] **TASK 2:** Integrate catalogs, discovery and adoption checks.
  - **UPDATE:** The six existing files listed in Files Changed.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** The template is discoverable, packaged and preserves adopted content.
  - **TEST FIRST:** n/a — documentation and adoption metadata; existing checks exercised.
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [x] **TASK 3:** Incorporate owner feedback and verify the final overview.
  - **UPDATE:** `docs/components.md`, `.bkit/templates/docs/components.md`.
  - **DEPENDS ON:** 1, 2.
  - **DONE WHEN:** The lifecycle, ownership, host/provider support and product concepts appear in a top-level overview with one Mermaid chart.
  - **TEST FIRST:** n/a — documentation refinements; verification recorded above.
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

Implementation and local verification are complete. Push, pull request, release and human acceptance have not occurred. Keep the issue open in review with `next:ship`.

Priority: Medium under the documentation/copy ranking rule. Size: S, one documentation surface. No parent or blocking dependency.

### Breaking Changes & Naming

None. The adopted `docs/components.md` remains project-owned and independently maintained.

### Out of Scope

Runtime behavior changes, new workflow gates, floorplan regeneration, capability-register generation changes, publishing or release.

### References

- `DETAILS.md`
- `floorplan/README.md` and `floorplan/architecture.json`
- `docs/capabilities.md`
- `.bkit/providers.md`, `.bkit/prompts.md`, `.bkit/templates.md`

Because I treated it as an optional **copy-and-own template**, whose adopted file is entirely project-owned.

Standard bkit docs such as `architecture.md` instead have:

- A managed title and rules header between `bkit:start` / `bkit:end`.
- Project-owned content below that block.

For `components.md`, that standard pattern makes more sense: bkit can maintain the population rules while preserving each repo’s component descriptions. It should have a shared managed header, with the reusable population example kept in Templates.

My earlier audit checked the copy-and-own implementation but missed that ownership distinction.

See #864

## #864 — Move project docs to templates with adoption warnings (closed)

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

### Plan signed off and blocker moved

- **Plan sign-off:** the owner confirmed the acceptance scenario, the breaking changes and the two assumptions. Those three boxes, and their copies under Gate 1, are ticked in `docs/plans/202611/864-move-project-docs-plan.md` (commit `378dee840` on `dev`, not pushed yet). `/bkit-build` still ticks "Gate 1 — Verified" itself.
- **Blocker moved:** the #887 design interview on 2026-11-09 agreed that this issue goes first. The `bkit:blocked-by` block naming #887 is gone from this issue, and `bkit issues blocked-by --issue=864` now reports no blockers. [#887 — Review doc starters: population steps, order and shared rules](https://github.com/cbartens/bkit/issues/887) now lists this issue as its blocker instead. Nothing else in the body changed.

Next step: `/bkit-build #864`.

**Done: committed straight to `dev` as `ad7c1f478`, with no PR. It is not pushed yet.**

**What changed**
- The ten project documents (architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup) now ship as starters in `.bkit/templates/docs/`. bkit no longer manages them. A project copies a starter once, and the copy is the project's own.
- Prompts and rules read these documents only where they apply. If one is missing, empty or still the starter, the agent warns and keeps going. It records the gap in a `## Documentation Warnings` section of its output.
- `bkit upgrade` turns an old managed copy into the project's own document. It strips the bkit markers, keeps the project's text and adds the document to `.agents/docs.md`. If the markers are malformed (for example a start marker with no end), it leaves the file untouched and reports it. `bkit check` does not fail because of that.
- `bkit check` and `bkit upgrade` name any document that still holds only the starter text.
- The workflow summary now counts a later passing whole-plan verify, or a later passing test run, as the answer to an earlier failed step. Before this, the build summary showed FAIL even after the failures were fixed.

**How it got to dev**
- The build run's own push stopped on a merge conflict with `dev`. Dev had edited the old shared starter docs that this change moves. I merged `dev` in by hand and carried those edits to where the text now lives:
  - the ship gate paragraphs → `.bkit/core/.bkit/workflows.md`
  - the jest `bkit:test:file` lines → `.bkit/core/.bkit/templates.md`
  - the tier-order note → `.bkit/templates/docs/testing.md`
- I then merged the branch into local `dev` as `ad7c1f478`. Dev's own unpushed commits since then are only plan answers and ledger rows.

**Checks**
- Typecheck, lint, format and `bkit check` are clean on the merged tree.
- The render tests and the two hand-merged test files passed: 416 tests.
- The full pre-push gate passed 1939 of 1940 tests. The one failure was a timeout in `tracker.integration.test.ts` while the machine was overloaded (load about 15–17 on 10 cores). Run alone, that file passes all 13 tests.
- CI has **not** run on this change.
- Two tests were accepted at the build's decision pause without a recorded red-then-green proof. They are recorded in the plan as `TEST EXCEPTION` entries for Tasks 1 and 5.

**Clean-up**
- The worktree `.worktrees/864-move-project-docs` and the local branch `feat/864-move-project-docs` are removed.
- The GitHub copy of `feat/864-move-project-docs` still exists, at the older `a46d27f03`. It is not deleted.

## #513 — Remove consumer project names and schema leaks from shipped docs and workflows (closed)

## Goal

Remove internal consumer project names, specific database schema names, and private project flows from shipped documentation, audit templates, and workflows.

## Problem

Files distributed to bkit consumers currently contain references to private consumer repositories and specific application domain schemas:

1. **Dangerous database schema drop:**
   - `docs/deployments.md:84` includes `psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS stripe CASCADE;'` along with `cdc-schema` references at lines 66–108. `stripe` and `cdc-schema` are application-specific schemas from a private consumer project.
   - Replace with generic database reset instructions and place any provider-specific examples into clearly marked, generic example blocks.

2. **Consumer project names:**
   - `docs/deployments.md:187` mentions "Proven shape: bkit CI + consumers gether/fraser".
   - The shipped CI template `.bkit/templates/.github/workflows/ci.yml:502, 808` references "gether/fraser".
   - Replace these references with generic phrasing such as "bkit CI + consumer repos".

3. **Application flow leaks in audit templates:**
   - `.bkit/templates/docs/templates/bkit-audit-accessibility.md:102, 103, 133, 137, 140` and `.bkit/templates/docs/templates/bkit-audit-usability.md:104-106` describe specific flows from `app-gether-life` as universal audit steps (e.g. invitation/sign-up confirmation emails, "create main object → calendar or list", proprietary raw-colour guards, and internal screenshot pipelines).
   - Reframe these as generic checks (e.g. "primary flows declared in Project Instructions", "if screenshot capture pipeline exists").

4. **Internal commit and ledger IDs:**
   - `.bkit/workflows.md:1190` references an internal feature branch and commit SHA `842afd51`.
   - `.bkit/workflows.md:1233` references internal ledger IDs.
   - Replace with generic references in accordance with bkit's rules against internal identifiers in shipped docs.

Related: #498
Parent: #498

## Analysis

Most of the audit's list was already fixed by the #467 rewrites and the #505 README pass. Verified each item in both the installed copy and the package source:

1. **Schema drop** — `docs/deployments.md` now says "Drop every schema your migrations create (`CASCADE`) ... Name ONLY your own app-managed schemas", with a generic Supabase example (`DROP SCHEMA IF EXISTS public CASCADE`). No `stripe` or `cdc-schema` schema references remain anywhere in the shipped docs; every remaining `CDC` / `stripe` mention is the generic term (change data capture) or the Stripe context-fetch integration.
2. **Consumer project names** — `docs/deployments.md:187` no longer names anyone ("Consumer measured", "Consumer's 12 concurrent E2E lanes" — unnamed, generic). The CI template (now `.bkit/templates/.github/workflows/bkit-ci.yml`) carries no consumer names.
3. **Audit templates** — `.bkit/core/docs/templates/bkit-audit-accessibility.md` and `bkit-audit-usability.md` (and the adopted `docs/templates/` copies) are generic: the usability steps say "Project has a screenshot-capture pipeline (`Project Instructions` names it)", "Invitations exist → join by invitation", etc. No invitation/calendar/raw-colour/screenshot-pipeline specifics from a private app.
4. **Internal IDs** — no `842afd51`, no `DE-*` / `EC-*` / `KN-*` / `#NNN` references in `.bkit/workflows.md` or its package mirror. (Fixed by the #467 workflow rewrites.)

## Work done

Commit `0c0d5f79` (`docs(513): the last consumer names leave the repo; .bkit/version catches up`):

- `docs/testing.md:678` named two private consumer repos in the integration-lane note → "consumer repos".
- `CHANGELOG.md` carried four historical mentions ("real consumers (gether, fraser)", "consumers gether/fraser", "reference impl: gether app-gether-life", "the consumer (gether #451) contract") → all generic now, meaning unchanged. The CHANGELOG ships in the npm package, so this mattered.
- Two test fixtures/comments named the private repos (the harvest remote-vs-path fixture and the context-fetch lane comment) → neutral fixture names. Tests are excluded from the published package, but the repo itself is public.
- `.bkit/version`: a concurrent re-stamp had staged the conflict-resolve hash updates from #510; the commit carries them, with the `docs/testing.md` hash set to the file's new content.

## Left alone, deliberately

`docs/consumers.md` (tracked, lists the maintainer's local consumer checkout paths): it is maintainer-local tooling input — `bkit harvest` reads the real paths — excluded from the published package, and its header says both ("Maintainer-local. Not in the published package."). Changing it would break the maintainer's harvest workflow, and it is not a shipped surface. Flagging it anyway in case you would rather gitignore it before the launch.

## Verification

- `npx vitest run .bkit/core/engine/commands/harvest.integration.test.ts .bkit/core/engine/checks/before/context-fetch.test.ts` → 2 files, 53 tests passed.
- Prettier clean on all four edited files; repo-wide sweep for `gether-life` / `visitfraser` / `fraser` now returns only the intentional `docs/consumers.md` lines.

Closing as completed.

## #354 — Plan template doc stack-agnostic refactor (closed)

## Status: source edits DONE (uncommitted); mirror regen + follow-ups open

Made `docs/plans/template.md` **fully doc- and stack-agnostic**, matching the rest of the shipped surface.

### Done — source: `.bkit/templates/docs/plans/template.md`

- **No project doc is named** anywhere. Every reference is now "the project's <domain> doc (resolve via `.agents/docs.md`)"; the plan author cites concrete docs per task at authoring time.
- **No consumer-doc section anchors** (e.g. `§ security checklist`, `§ audit triggers`) — a consumer's doc may not carry that structure. Anchors into bkit-controlled artifacts (`{FID}-design.md § Acceptance Scenario`, `.agents/rules.md § Tracker MCP`) kept, since bkit guarantees those.
- **No required stack** — Supabase / Vercel / Inngest / Playwright / Zod appear only as `e.g.` examples (ci.yml style). Deep de-stack: the Security & Privacy checklist (`requireFamilyMember`/`family_members`/`familyRole`/`isAllowedRedirect`/`packages/env`), CDC monitored-table names, correlation IDs, the Playwright/`storageState`/datafactory code fences, the Supabase branching assertion, and local absolute reference-repo paths — all now generic-with-examples.
- New top directive making the contract explicit ("resolve docs via `.agents/docs.md`; any named tool is an example").
- Two nits fixed: directive punctuation; the `📚 Documentation Updates` gate cross-reference (the header carries no 📚).
- `bkit-templates.test.ts` **54/54** green; markers / gates / `prettier-ignore` intact.

### Not yet done

- **Regenerate the rendered mirror** `docs/plans/template.md` via `pnpm bkit install`/`upgrade` before commit — else `bkit check` drift-fails on dev (`totalWrites > 0`). Reset `core.bare=false` afterward (known install quirk).
- Not committed.

### Follow-ups (design decisions)

1. **Resolution model is ambiguous.** The directive says "cite the specific docs inline" (generation-time) but the body says "(resolve via `.agents/docs.md`)" (execution-time). Decide, and make the directive explicit that the plan author **replaces each scaffolding pointer with the concrete resolved path** (or drops the line if the project has no such doc), so no `(resolve via …)` scaffolding survives into a generated plan.
2. **Enforce it** in `bkit-plan-review-*` / `bkit-plan-scope-check-*`: fail a generated plan that still carries unresolved "resolve via" scaffolding or foreign stack names that aren't this project's stack.
3. **Prompt-side asymmetry (safe, optional).** `bkit-plan-generate.md` still hardcodes `docs/testing.md` / `decisions.jsonl` / `deferrals.jsonl`. That's fine — those are seeded / always-present — but the template is now more doc-agnostic than the prompt consuming it. A repo-wide doc-agnosticism sweep across the ~45 prompts is a separate call.

### Acceptance

- Mirror regenerated and committed; `bkit check` clean on dev.
- Directive unambiguous on the resolution model; review/scope-check gate the resolution.

Template **content** enhancements (universal-rule coverage + audit shift-left) tracked in the companion issue.

## Update — doc-resolution model REVISED (edits applied, uncommitted)

The original "names **no** project doc" premise was over-rotated. Revised per maintainer call: **core/universal docs are named inline; only non-core docs resolve via `.agents/docs.md`.**

### Applied to `.bkit/templates/docs/plans/template.md`

- **Core docs now named directly** (the `.agents/docs.md` § Universal Documents set, always seeded): `docs/architecture.md`, `docs/data-schema.md`, `docs/security.md`, `docs/testing.md`, `docs/observability.md`, `docs/deployments.md`, `docs/setup.md`, and the `docs/knowledge.jsonl` / `docs/decisions.jsonl` / `docs/deferrals.jsonl` / `docs/failures.jsonl` ledgers.
- **Only non-core docs stay generic** via `resolve via .agents/docs.md`: the project's **design** doc, **notifications** doc, and **cron/scheduled-jobs** doc (none are seeded).
- **Directive rewritten** to state the model: "core docs named inline; other docs resolved per project; no stack assumed."
- **Section anchors still omitted** for all docs (the earlier "a project's doc may not carry that section" call stands) — core docs are named, their internal sections are not.

### Effect on the follow-ups
- **#1 (resolution ambiguity) largely resolved:** core = named inline; non-core = explicit `resolve via` reference. No ambiguous "cite inline vs resolve later" for core docs anymore.
- **#2 (enforce in plan-review/scope-check)** still applies, now narrowed to the non-core generic refs + stack examples.

Status: **edits only, not committed.** Rendered mirror `docs/plans/template.md` still needs `pnpm bkit install`/`upgrade` before commit. `bkit-templates.test.ts` 54/54.

## #417 — Design and plan close steps overwrite the canonical doc (closed)

## What happens

When design or plan runs a second time on a feature that already has a document, the close step copies the new version straight over the old one. Nothing checks whether a file is already there.

`.bkit/workflows/bkit-design.md:754`

```bash
CANONICAL="docs/plans/$YYYYMM/{FID}-design.md"
cp "$DESIGN_FINAL" "$CANONICAL"
```

`.bkit/workflows/bkit-plan.md:806`

```bash
cp "$PLAN_FINAL" "docs/plans/$YYYYMM/{FID}-plan.md"
```

The previous design or plan is gone from the working tree, recoverable only from git history.

## It only bites on a deliberate re-run, which is the worst case

An interrupted run does not regenerate anything — `bkit-design.md:24` says the workflow folds `status.jsonl` and picks up after the last `DONE` step. So the only way to reach that `cp` with real prior content is re-running a design or plan that already completed. That is exactly when the old document is a finished, reviewed, possibly already-built-against artifact.

## Second half of the problem: the re-run never reads the old document

Both workflows deliberately reuse the FID when a doc already exists (`bkit-design.md:148`, `bkit-plan.md:149`), but the input artifact built in Step 2 is only the session prompt plus the tracker issue body and comments (`bkit-design.md:253`, `bkit-plan.md:257`). So the new document is generated from a blank page and then lands on top of the old one.

Every other phase that re-enters an existing feature already reads the canonical doc back in — build (`bkit-build.md:334`), debug (`bkit-debug.md:347`), ship (`bkit-ship.md:659`). Design and plan are the only two that do not read their own prior output. Reusing the identity but not the content is the inconsistency.

## Fix

1. Before writing the canonical file, move any existing one to `docs/plans/{YYYYMM}/archive/{TIMESTAMP}-{FID}-design.md`, timestamp from `date -u +%Y%m%dT%H%M%SZ`. Same for plans, and for every `{FID}-plan-{N}.md` sub-plan so a split set is preserved together rather than leaving orphans behind when a re-run splits into fewer children. Skip the move when the content is unchanged.
2. Feed the existing design to `bkit-design-generate` at Step 4 — **not** into `design-input.md`. The three `bkit-design-brainstorm-ideate-*` agents read that file, and their independence is the point: `bkit-design-generate.md` tells the consolidator "Inputs carry distinct lenses; merge as raw material — do NOT collapse to consensus." Hand the old design to all three and they all anchor on it. The consolidator should see it; the ideators should not.
3. Feed the existing plan into `plan-input.md`. `bkit-plan-generate` is a single agent, so there is no anchoring concern there.

## Why a separate `archive/` directory rather than renaming in place

Renaming in place collides with globs that are already live:

- Appending a timestamp to a plan produces `{FID}-plan-{TS}.md`, which matches the sub-plan count glob at `bkit-build.md:331`. That flips a single-plan feature into split mode, hunting for a `{FID}-plan-1.md` that does not exist. It is also double-counted by the task-count globs at `bkit-ship.md:1308` and `.bkit/scripts/bkit-workflow-telemetry.sh:39`.
- Putting archives flat in `logs/{FID}/` collides with the catch-all glob at `bkit-ship.md:1043`, which would feed superseded designs and plans to the ship doc-sync agent as though they described what shipped.

A sibling `archive/` directory is reached by none of them. There are no recursive globs over `docs/plans` anywhere in the workflows, the scripts, or `.bkit/src` — every read is either an exact filename or a non-recursive glob anchored in the month bucket or in `logs/{FID}/`. Vale's `[**/docs/plans/**/*.md]` scope is recursive, so archives inherit the existing lint exemption automatically.

Resulting shape:

```
docs/plans/202607/
├── 341-three-runtimes-design.md          ← active
├── 341-three-runtimes-plan.md            ← active
├── 341-three-runtimes-plan-1.md … -6.md  ← active sub-plans
├── archive/                              ← superseded, same kind of doc
│   └── 20260801T134500Z-341-three-runtimes-design.md
└── logs/341-three-runtimes/              ← per-run working artifacts
```

## Depends on #416

Design's close step resolves the month bucket with `date +%Y%m` instead of discovering the feature's own bucket. Left as-is, the archive step would look for the existing canonical in the wrong bucket, find nothing, and skip silently — turning a loud failure into exactly the quiet data loss this issue is about.

## Fixed on `dev` — uncommitted

Both halves of the problem are done — the overwrite itself and the missing continuity. Line numbers below are post-fix.

### Archive before overwrite

`bkit-design.md:762` and `bkit-plan.md:815`. Any existing canonical is moved into `docs/plans/{YYYYMM}/archive/{TIMESTAMP}-{FID}-…md` before the new one is written, timestamp from `date -u +%Y%m%dT%H%M%SZ`, skipped when `cmp -s` shows the content is unchanged.

Plan archives the **whole set** under a single timestamp — the main plan plus every `{FID}-plan-{N}.md`. Because they are moved rather than copied, the subsequent copy loop writes a fresh set, which also clears the orphan case: a feature that previously split into six sub-plans and now splits into four no longer leaves `-5` and `-6` sitting in the bucket looking active.

### Continuity on re-run

- `bkit-design.md` Step 4: `bkit-design-generate` now reads `docs/plans/{YYYYMM}/{FID}-design.md` when present, with the instruction to revise rather than replace and to keep section structure stable so `docs/deferrals.jsonl` `references` stay valid. It is supplied **only** to the consolidator — the three `bkit-design-brainstorm-ideate-*` subagents still read `design-input.md` alone, so their exploration stays independent and does not collapse onto the existing design.
- `bkit-plan.md` Step 2: `plan-input.md` appends the superseded plan when one exists. `bkit-plan-generate` is a single agent, so there is no anchoring concern there.

## Tests

New `.bkit/src/bkit-workflow-archive-snippet.integration.test.ts`, 10 cases. It extracts the real fenced bash block from each close step and executes it against a fabricated tree, so it pins behaviour rather than the literal path string:

- Design: existing canonical moves to `archive/` under a timestamped name while the new canonical gets the latest version's content.
- No archive is created when there was no previous document, and none when the content is unchanged.
- The archive lands in the feature's own bucket rather than the current month — this one guards the companion fix in #416, since the old `date +%Y%m` form would have looked in the wrong place and skipped the archive silently.
- Plan: main plan and both sub-plans archived under one shared timestamp, verified by asserting a single distinct stamp across the set.
- The orphan case: two sub-plans before, none after, and the bucket is left holding exactly `{FID}-plan.md`.
- `archive/` is unreachable from the three real globs that made a rename-in-place unsafe — the sub-plan count glob from `bkit-build.md`, the task-count glob from `bkit-ship.md`, and the logs sweep from `bkit-ship.md`.

Full suite: 80 files, 2854 passed, 2 skipped. Prettier clean. Vale 0 errors.

## Not done

The generated mirrors under `.claude/commands/`, `.cursor/commands/` and `.opencode/commands/` are stale — running a workflow still gets the old behaviour until `pnpm bkit upgrade` regenerates them. Left deliberately, since it flips `core.bare=true` and needs `git config core.bare false` afterwards.

## Review discussion — three things changed from the original fix

### 1. The superseded doc is context, not a baseline to revise

The first cut told the generating agent to _revise_ the old document: "revise it rather than replacing it wholesale, and keep section structure stable so `docs/deferrals.jsonl` `references` stay valid."

That is the wrong instruction. A re-design has to be free to produce a genuinely different design; anchoring it on the old one defeats the point of re-running. Final wording, in both workflows:

- `bkit-design.md` Step 4 — `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design; context ONLY, do NOT revise or treat as constraint).
- `bkit-plan.md` Step 3 — same clause for `{FID}-plan.md`.

Dropped with it: the "keep section structure stable so deferral `references` stay valid" constraint. It was a real constraint rather than prose, and the trade-off is explicit — a re-design that renames sections can leave a `docs/deferrals.jsonl` row pointing at a section that no longer exists. Binding the new document to the old document's shape is the larger cost.

### 2. The superseded doc goes to the generating agent and nobody else

Originally design routed the old doc to `@bkit-design-generate` (bypassing `design-input.md`, which the sibling-blind ideate triplet reads) while plan appended the old plan to `plan-input.md`. The stated reason was that plan has "a single agent, no anchoring concern."

That reason was wrong. `plan-input.md` has five readers, not one:

<!-- prettier-ignore -->
|  | `design-input.md` | `plan-input.md` |
| --- | --- | --- |
| Generator | — (routed separately) | `@bkit-plan-generate` (`bkit-plan.md:324`) |
| Fan-out | 3 ideate agents (`bkit-design.md:327,331,335`) — blind | 3 reviewers (`bkit-plan.md:442,446,450`) |
| Reviewers | 2 design reviewers (`bkit-design.md:424,428`) | — |
| Summary | — | `@bkit-plan-summary` (`bkit-plan.md:743`) |

Since `@bkit-plan-generate` reads `plan-input.md`, putting the old plan there was a strict superset of routing it to the generator: the generator saw it either way, plus three reviewers and the summary. So the real question was never whether the generator gets it — it was who else does.

**Decision: the generator only.** `bkit-plan.md:324` now reads the superseded plan directly, and `plan-input.md` no longer carries it.

Reasoning:

- **A superseded document is adversarially selected.** A plan or design is only superseded because it was rejected at the gate, outdated by a changed design, or proved unbuildable. Conditional on a re-run happening at all, the prior should be "this document was probably defective" — the opposite of treating it as a useful baseline.
- **The harm is not spread evenly.** One generator, explicitly told "context ONLY, do NOT treat as constraint", can weigh a bad old plan against the design and the issue, which are its primary inputs. Three reviewers whose entire job is to find fault cannot tell which parts of the old plan _caused_ the re-plan, so a deliberately fixed defect reads to them as a regression — dragging the new plan back toward the old one, which is exactly the constraint point 1 removes.
- **The generator is the right filter.** Anything genuinely worth keeping survives into `plan-v1-draft.md` and reaches every downstream agent there, in adopted form on its own merits, rather than as a competing baseline. Anything bad dies at the generator.
- **One doctrine now covers both phases:** the superseded doc reaches the generating agent and nobody else — design to `@bkit-design-generate`, plan to `@bkit-plan-generate`, never via `{phase}-input.md`.

**Accepted cost:** `@bkit-plan-summary` can no longer report "this re-plan drops three tasks the prior one had" at the Gate 1 confirmation. That is a real loss of signal to the human. It is one extra `Read:` entry on Step 11 if it turns out to be wanted, and the summary is descriptive rather than evaluative, so it does not carry the reviewer anchoring risk.

### 3. Archive ordering — confirmed correct as built, and why it must not move earlier

Question raised: the archive happens at the close step, long after the new design is generated — should it not archive first, to guarantee nothing is overwritten?

The premise is half right. The archive is late in the _workflow_, but it is immediately before the only write to that path. Within the close block: the `mv` is `bkit-design.md:760-762`, the `cp` is `:764`. Everything generated earlier lands in `docs/plans/{YYYYMM}/logs/{FID}/design-v*.md`, a different file. Checked every reference to the canonical path in both workflows — the close block is the only writer; all others are reads, existence checks, issue-body links or post-push verification.

Moving the archive earlier would break two things:

1. The superseded doc is live input to design Step 4 / plan Step 3. Archive before that and the read finds nothing.
2. The close step runs only when `SUMMARY_VERDICT` is PASS or CONCERNS. A run that fails review or dies in a subagent never reaches it — and today the feature simply keeps its working design. Archive early and an aborted run leaves the feature with no active document at all: the old one in `archive/`, no replacement written. That relocates the data loss this issue was filed about rather than fixing it.

Late archiving is what makes the operation atomic in practice: either the run completes and you get old-in-archive plus new-as-canonical, or nothing moved.

## Other changes from review

- **`.bkit/workflows.md` updated** — it is the prose/doctrine doc and had nothing on any of this. Added to § Versioned Outputs: the archive rule (move, timestamp format, `cmp -s` skip, plan moving the whole sub-plan set under one timestamp, why a sibling directory rather than a rename in place), the re-run-only scope and the archive-at-close-never-earlier rule with both reasons, and the "generating agent and nobody else" doctrine. Added a `Superseded design / plan` row to § File path conventions. Updated the per-phase table cells for design Steps 4 and 10 and plan Steps 2, 3 and 12. Design Step 4's `Read` column also said "both brainstorms" when there are three — fixed.
- **Test anchor made robust.** `bkit-workflow-archive-snippet.integration.test.ts` extracted the close-step bash block by matching the full step heading including its trailing clause, so rewording "Archive any superseded design, then copy…" to "…and copy…" broke 7 of 10 cases. It now anchors on the shortest unique prefix. The failure was loud rather than silent, which is the right behaviour — the extraction helper asserts the heading was found.

## Residual, deliberately not fixed here

Two narrow gaps in the plan archive trigger, both left as-is:

- The trigger compares only the top-level `{FID}-plan.md`. If that comes out byte-identical while the sub-plan set changed, nothing archives and old children can be orphaned. It needs an identical parent _and_ a different child set _and_ a parent that does not name its children by filename — because if it does, the `sed` rewrite at the end of the block leaves the old canonical different from the raw new one, so `cmp -s` reports a difference and the whole set archives anyway.
- Consequently the "skip when unchanged" shortcut effectively never fires for split plans. It errs toward keeping a copy, so it is harmless.

Separately, and pre-existing rather than from this issue: the `/bkit-plan` per-phase table in `.bkit/workflows.md` contradicts § Versioned Outputs. Step 3 says `@bkit-plan-generate` "Writes `plan-generate.md` log + `docs/plans/{YYYYMM}/{FID}-plan.md`" and Steps 6 and 8 say "In-place edits to `{FID}-plan.md`", but the doctrine says steps never write the canonical directly and the versioned-chain table has those steps producing `plan-v1-draft.md` / `plan-v2-reviewed.md` / `plan-v3-checked.md`. The chain table is right, the per-phase table is stale. It matters more now, because "steps never write the canonical" is the invariant that makes archive-at-close safe. Worth its own commit.

## #617 — Harden the Renovate examples: preset, runner image, majors, ignores (closed)

From the 2026-10 dependency audit (#482): findings `deps-3`, `deps-4`, `deps-8` and `deps-9` (all MEDIUM), plus `deps-14` and `deps-15` (LOW, folded in). Report: `docs/audits/202610/dependencies.md`, audited at `72baf71f`.

## What's wrong

The Renovate config and its runner workflow ship to consumers as examples, and both are weaker than Renovate's own recommended setup. Each problem below exists in the repo copy and the same way in the template copy under `.bkit/templates/`.

- **Weaker base preset (`deps-3`).** `.github/renovate.json5:22-25` extends `config:recommended`. Compared with `config:best-practices` it is missing:
  - `abandonments:recommended`: flags packages nobody maintains any more.
  - `:configMigration`: opens PRs when the config format changes.
  - `docker:pinDigests`: pins images to an exact build.
  - `:pinDevDependencies`: pins dev dependencies to exact versions.

  The dependency dashboard (#328) has no abandoned-packages section as a result.
- **Bot image floats a major behind (`deps-4`).** `.github/workflows/bkit-renovate.yml:68` sets no `renovate-version`, so it runs `ghcr.io/renovatebot/renovate:43`, whatever the newest 43.x is (run 39121442307 resolved 43.288.0). The latest version is 44.167.5. Renovate itself warns that "Renovate versions older than the latest major version are unsupported".
- **Scans archives and test fixtures (`deps-8`).** The repo's `ignorePaths` (`renovate.json5:84-90`) replaces the default list from `:ignoreModulesAndTests` instead of adding to it, and it leaves out `docs/plans/**`. That causes noise PRs:
  - The dashboard picks up `tests/fixtures/heavy-customised-consumer/package.json`.
  - #583 only touches 2 files under `docs/plans/202610/logs/504-example-project/spike/`, and #544 only 3.
  - #579 carries 2 hunks there.
- **Major versions open without approval (`deps-9`).** The majors rule (`renovate.json5:141-145`) has no `dependencyDashboardApproval`. So #583 (actions v4 → v7, archived files only) and #584 (vitest 5) opened and ran CI before anyone decided to take them.
- **Pinned CLIs nobody watches (`deps-14`, LOW).** These tools are pinned to exact versions, but they aren't in any package file and no Renovate rule tracks them, so nobody hears about new releases:

<!-- prettier-ignore -->
  | Tool | Pinned | Latest at audit | Where |
  | --- | --- | --- | --- |
  | Vale | 3.9.1 | 3.24.0 | `bkit-ci.yml:478` |
  | actionlint | 1.7.12 | 1.7.12 | `bkit-ci.yml:525` |
  | graphifyy | 0.9.50 | 0.9.92 | `bkit-ci.yml:573` |
  | @opencode/cli | 2.0.26 | 2.0.32 | `bkit-cloud.yml:545` |
  | jq | 1.7.1 | 1.8.2 | `.bkit/shared/.claude/bkit-cloud.md:72` |
- **pnpm bumps open alone (`deps-15`, LOW).** The non-major group (`renovate.json5:112-129`) matches only `devDependencies` and `dependencies`. A `packageManager` bump such as #581 therefore opens as its own PR instead of joining the group.

## Fix

Apply each change to both copies (lines from the report's Recommendations):

1. `extends: ["config:best-practices", ":dependencyDashboard"]`. (R4)
2. Pin `renovate-version` to an exact 44.x, with a `# renovate: datasource=docker depName=ghcr.io/renovatebot/renovate` comment and a matching custom manager. Run the config validator on 44 first. (R5)
3. Add `dependencyDashboardApproval: true` to the majors rule. (R6)
4. Add `"docs/plans/**"`, `"**/tests/**"` and `"**/__fixtures__/**"` to `ignorePaths`. (R7)
5. Add `customManagers` regex rules for `VALE_VERSION`, `GRAPHIFY_SPEC`, `@opencode/cli@` and jq. Pins that are paired with a checksum (Vale, actionlint) still need their sha256 updated by hand when the bot bumps them (`renovate.json5:209-212`). (R15)
6. Set `matchDepTypes: ["devDependencies", "packageManager"]` on the non-major group rule. (R9)

Then close #583 and #544. Once `ignorePaths` changes, Renovate no longer needs them.

## Done when

- Both config copies extend `config:best-practices`.
- The runner pins an exact current-major image that a bot rule keeps up to date.
- Major updates wait on the dashboard.
- The dashboard's detected-file list has no archived plan or test-fixture paths.
- The dashboard lists the off-manifest CLIs, and `packageManager` bumps join the non-major group.

Logged in `docs/failures.jsonl` under keys `audit-dependencies-renovate-not-best-practices-preset`, `audit-dependencies-renovate-image-floating-major-behind`, `audit-dependencies-renovate-ignorepaths-scans-archives-fixtures` and `audit-dependencies-renovate-majors-no-dashboard-approval`.

Next step: `/bkit-build`. It changes shipped dependency config and a workflow file, so no shortcut. Editing `.github/workflows/*` needs explicit confirmation under `.agents/rules.md`.

Fixed in #622 (4ca0f71a), in both this repo's renovate.json5 and the shipped template. It extends config:best-practices (7-day npm wait kept), uses rebaseWhen conflicted, holds majors for Dependency Dashboard approval, runs lockfile maintenance monthly, repeats the preset ignorePaths plus docs/plans/**, and has one regex custom manager for # renovate: pins. bkit-renovate.yml pins renovate-version, bumped through dated GitHub releases. Checked with renovate-config-validator --strict and a local Renovate lookup run. Decision row: 617-renovate-example-hardening.

## #489 — Own only what a workflow runs; ship the rest as templates (closed)

## Idea

Reduce install to the files a workflow step runs or parses. Everything a person or another tool runs ships as a copy-and-own template. Upgrade always carries the latest templates and an advisory that names which template paths changed. The user adopts or leaves them.

Seed-or-print goes away for that second set. The first write, the hash baseline, the upgrade conflict, and the uninstall reclaim exist so bkit can claim the file still matches the installed version. Once the user decides whether to adopt, that claim is gone and the machinery has nothing left to do.

## Boundary

<!-- prettier-ignore -->
| Owns, overwrite on install / upgrade | Template, never written |
| --- | --- |
| A workflow step runs or parses it | A person or another tool runs it |
| Command files, agent prompts, rules the router reads, `.bkit/scripts/` those commands execute | CI, Husky, Vale, lint-staged, slop-scan config, MCP config, env samples, Dependabot, Renovate, Serena, graphify |

Shared files stay marker blocks. `AGENTS.md`, `CLAUDE.md`, `rules.md`, `.gitignore`. Both sides write the same file. A whole-file adopt would replace the user's half.

## Advisory

On upgrade, list the template paths whose bytes changed since the installed version. The user diffs those against their copy.

A single line "templates were updated" on every release gets skipped. No per-file ownership record and no drift hash. The list is "these paths changed in this version," not "your copy is behind."

Install instructions for the template set live in `.bkit/tooling.md`. A flag stays only where the bytes are computed from choices already made (tracker, TypeScript or not) and a missing file means the thing just turned on is not there. That is the workflow-owned set, not the template set.

## Already this shape

Dependabot, Renovate, Serena, and graphify. Install and upgrade never write them. See #444.

## Cost

bkit stops promising that a consumer's CI, hooks, and prose-lint config match the version they installed. That is the cut. Workflows must not call those files.

Related 
Simplify process: less prose, more scripts, one wording file #467
Serena Graphify code graph templates #444

Key files / folder
.bkit/templates.md describes it all (not tooling.md?)
.bkit/templates/ sub folders contains all templates that can be copied incl. scripts, settings etc
we do not automatically update or track we just ship latest templates and advisory they were updated leaving user to adopt or not

ship gether secret sync and prettier ignore script as templates as well!

## Settled plan (2026-10-07)

This comment records what was decided in review. Where it differs from the issue body, this comment wins. The body's boundary table was too coarse: it put MCP config and the gate scripts on the template side, and it missed that workflows still call some "template" files.

### 1. Seed-or-print goes away completely

Nothing bkit ships will be "write once, record a hash, warn on upgrade conflict, print merge instructions, take back on uninstall" any more. Every file falls into one of four groups instead:

<!-- prettier-ignore -->
| Group | Install / upgrade | Uninstall | What's in it |
| --- | --- | --- | --- |
| **Owned file** | Overwrites | Removes | `.bkit/workflows/`, `.bkit/prompts/`, agent and command copies, `docs/templates/bkit-plan.md` and `docs/templates/bkit-audit-*.md`, `.bkit/.env.example`, the remaining `.bkit/scripts/` files (only the slop plugin once #467 lands), and the **hook scripts**: `.claude/hooks/{preflight.sh,gateguard.cjs,guardrails.cjs,cloud-bootstrap.sh}`, `.codex/hooks/*`, `.cursor/hooks/*`, `.opencode/plugin/gateguard.js` |
| **Owned part of a shared file** | Rewrites only its part | Removes only its part | Markdown between `bkit:start` and `bkit:end`: `AGENTS.md`, `CLAUDE.md`, `.agents/rules.md`, `.agents/docs.md`, `docs/*.md`, `gitignore`, `.gitattributes`. JSON keys: hook entries and permissions in `.claude/settings.json`; `hooks.json` for Cursor and Codex; `permission`, `plugin`, `mcp` and `provider` in `.opencode/opencode.json`; the tracker entry under `mcpServers` in `.mcp.json` and `.cursor/mcp.json` |
| **Create if missing** | Writes once if absent, never again. No hash, no message | Leaves it | The record files (`docs/failures.jsonl`, `docs/deferrals.jsonl`, `docs/roadmap.md`, `.bkit/issues.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`), `.agents/context.md`, `.agents/skills.md`, and the `bkit:gate:*` script **names** in `package.json` (the user owns what each one runs) |
| **Template** | Never applied. Reference copies refresh in `.bkit/templates/` (section 3) | Leaves the user's copies | Section 2 |

**Why the hooks and JSON keys stay bkit-managed, not templates:**
- **The hooks are part of the workflows.** They enforce what the workflows and prompts forbid (force push, `--no-verify`, `git reset --hard`), and they change in step with them. A stale copy means workflows run under old guards and nothing says so.
- **The JSON configs are generated from install choices.** `.bkit/templates/.opencode/opencode.json` carries `@@OPENCODE_TRACKER_MCP@@` and `@@OPENCODE_PROVIDER_KEY@@`, which install fills in. That is the body's own test for staying bkit-written.
- **The tracker MCP entry is what makes tracker steps work.** Tracker writes go only through MCP.
- **They change often.** Recent examples: #441, #458, #394, #381, #435. #381 already records exactly which keys bkit granted so uninstall can take them back, which is the mechanism this needs.

`.mcp.json` and `.cursor/mcp.json` are the one real change of kind. Today they are seed-or-print. They become "bkit owns its tracker entry, the user owns the rest of the file", using the same per-key replace `opencode.json` already uses (`.bkit/src/bkit-modules.ts:1930`).

### 2. What becomes a template

<!-- prettier-ignore -->
| Template | Copy to | Note |
| --- | --- | --- |
| `.github/workflows/ci.yml` | same path | Only after the #467 prerequisites (section 7) |
| `.github/workflows/bkit-cloud.yml` | same path | **Riskiest one.** Nothing in the workflows starts it, but it runs bkit and `bkit-counter-bus-config.sh:25` counts its runs. If bkit changes how it is called, an adopted copy breaks with only the changed-paths message as warning |
| `.github/workflows/renovate.yml`, `.github/renovate.json5`, `.github/dependabot.yml` | same paths | Already templates |
| `.husky/pre-commit`, `.husky/pre-push` | same paths | Workflows ban `--no-verify`, so every workflow commit runs the user's hooks. A failing hook blocks a workflow. That is the user's call |
| `.vale.ini`, `.vale/styles/House/*.yml` | same paths | Workflows only reach Vale through the user's `bkit:gate:*` scripts |
| `.lintstagedrc.json`, `slop-scan.config.json`, `.prettierignore`, `.envrc` | same paths | Same reasoning as Vale |
| `.cursor/settings.json`, `.cursor/environment.json`, `.cursor/Dockerfile` | same paths | Editor and cloud settings for the user's stack |
| `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md` | same paths | Already templates (#444). `.graphifyignore` stays at the repo root because graphify reads it there, the way git reads `.gitignore`. No `.graphify/` folder |
| `scripts/graphify/`, `scripts/serena/` | same paths | Already templates (#444). Moved from `scripts/tooling/<tool>/`. The `tooling/` level is gone |
| `scripts/secrets/` | same path | New: the gether secret sync script, labelled as an example |
| `scripts/prettier/` | same path | New: today's bkit-repo-only `scripts/tooling/insert-prettier-ignore.py` |

`isCopyPasteExample` (`.bkit/src/bkit-modules.ts:289`) now treats everything under the templates' root `scripts/` as a template. bkit's own scripts live under `.bkit/scripts/`, so new `scripts/<tool>/` folders are covered with no code change.

### 3. Where templates live and how upgrades announce them

- **Install copies the template set into the consumer's own `.bkit/templates/`.** It is bkit's folder, so this doesn't break "never write the user's files". Today templates exist only under `node_modules/@cbartens/bkit/.bkit/templates/` (checked in app-gether-life), so the "copy from `.bkit/templates/…`" paths in `.bkit/tooling.md` are wrong for consumers.
- **Upgrade overwrites `.bkit/templates/`.** The upgrade commit's `git diff` on that folder is the changelog.
- **The changed-paths message costs nothing.** Upgrade compares the old copy on disk with the new one before overwriting. No hash record and no release-time list are needed. The user or their agents diff and adopt, or don't.

### 4. `.bkit/templates.md` replaces `.bkit/tooling.md`

One document for the whole template set. Per template:
- what it does, and whether any bkit workflow cares (almost none do)
- where to copy it from and to
- how to install the tool behind it: install command, `package.json` scripts to add, `.gitignore` lines
- what to adapt for the repo
- known traps (e.g. graphify ignore rules can silently stop it resolving imports, from #444)

The install message becomes one line pointing to `templates.md`. The upgrade message lists the changed template paths plus the same pointer.

### 5. Rules point at the gate scripts, not at tools

`.agents/rules.md` stops listing tools and names the `package.json` gate scripts instead. `package.json` then becomes the one place that defines what "the checks" are. Workflows, pre-push and the rules all point at it. The shipped `docs/testing.md:227` already describes gates this way.

<!-- prettier-ignore -->
| Line | Change |
| --- | --- |
| `:103` Local pre-push | "`pnpm bkit:gate:static-unit`, then `bkit check`. Gate scripts MUST NOT run tests needing a deployed boundary / backing service." `bkit check` stays outside the gate, because it is bkit's own drift check and must not be removable |
| `:98` Fix code not gates | "(lint / format / types / test / slop)" becomes "anything a `bkit:gate:*` script runs" |
| `:107` Slop gate | Becomes conditional: "When the gate runs `slop:delta`: …". It stays in `rules.md`, because agents never read `templates.md` |

**The accepted cost:** if a user's `bkit:gate:static` is `echo ok`, every agent run and push goes green. Section 6 is how that gets noticed. Ignoring the finding is the user's recorded choice.

### 6. The gates audit checks every `bkit:gate:*` script

Edited in `.bkit/templates/docs/templates/bkit-audit-gates.md` and its installed copy `docs/templates/bkit-audit-gates.md`. Not committed yet.

- **Repo Gates scope** now names "every `bkit:gate:*` script in `package.json`".
- **Step 12 (Health)** treats each `bkit:gate:*` script as a landed gate. The audit follows every nested `pnpm <script>` down to the real commands and lists them.
  - Missing, empty, or can't fail (`echo`, `true`, `|| exit 0`): `CRITICAL`.
  - A command that exits 0 when its tool isn't installed: `HIGH`, with the tool and install step named.
  - One `Health` row per gate script, listing every command and which ones can skip.
- **Ignoring a finding** means a REJECT row in `docs/decisions.jsonl`, through the audit's existing Step 10. That is the "knowingly" record.
- **This repo will be flagged too.** `bkit:test:bats` and `bkit:lint:workflows` (`package.json:55,58`) print "skipping" and pass when their tool is missing.

**Audit cadence:** the gates audit runs when asked. The roadmap suggests it from time to time, and bkit does nothing more than that.

### 7. Prerequisites, done in #467 first

Workflows still depend on files in section 2. #467 rewrites exactly those lines, so the fixes belong there and #489 must not edit them separately:

- `bkit-ship.md:659,670,764` hardcode `ci.yml`. `bkit.ciWorkflow` already exists and `bkit-ship-gate.sh:142` reads it.
- `bkit-build.md:54` and `bkit-debug.md:54` hardcode the check-name pattern `bkit-tests|decide`. `bkit.capstoneJob` already exists and `bkit-ship-gate.sh:137` and `bkit-protect-main.sh:47` read it.
- Worktree setup hardcodes `.env .env.local apps/web/.env.preview apps/web/.env.production` (`bkit-ship.md:414` and the same step in build, debug, design and plan) and the Vale styles copy. #467 already plans `bkit.worktree.copy` / `bkit.worktree.install`.

### 8. What changes in code

- **Delete:** `writeTier3`, `tier3Hashes`, the merge-instruction text blocks (`bkit-modules.ts:2130` onward), the uninstall rule that takes back unchanged seeded files, and the upgrade conflict messages for template paths.
- **Modules:** the `ci` and git-hooks modules stop writing files. The lint module keeps only the owned slop plugin. The `--ci` flag goes.
- **Existing installs:** add every newly-template path to `RETIRED_MANAGED_PATHS`, so upgrade drops their hashes and keeps the user's files. Uninstall then leaves a user's `ci.yml` in place where today it may take an unchanged one back. Say so in the release notes.
- **Hashes stay for owned files.** #467 needs them to delete retired scripts only when the user hasn't edited them. Only template-set hashes go.
- **`.mcp.json` / `.cursor/mcp.json`:** switch to per-key replace of the tracker entry.
- **Install / upgrade:** copy `.bkit/templates/` into the consumer and print the changed-paths list.
- **`bkit check`:** assert the owned hook files exist. The hook commands are `test -f … && node … || true` (e.g. `.claude/settings.json:73,82`), so a missing `guardrails.cjs` silently turns the guard off.
- **Closing test:** no workflow or prompt names a template path.

### 9. Order

1. #444: commit and close (templates already in place, moved to `scripts/<tool>/`).
2. #467: including the section 7 prerequisites.
3. #489: mostly deletion in install code, plus `templates.md`, the `rules.md` edits, the gates-audit edit, the copy-to-`.bkit/templates/` step, and the closing test.

### 10. Proposed, not yet confirmed

**Source layout in the bkit package:**

```
.bkit/
├── templates.md      ← was tooling.md
├── workflows/  prompts/  src/
├── install/          ← NEW: what install writes (groups 1–3 above); the owned half of today's templates/
└── templates/        ← copy-and-own only (section 2), copied to the consumer's .bkit/templates/
```

Splitting today's `.bkit/templates/` means changing every install path constant and test fixture that names it. The cheaper option is to leave owned sources where they are and call the template folder `examples/`, but that goes against the "`.bkit/templates/` holds all templates" comment above.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Build plan (2026-10-09)

The 2026-10-07 settled plan still stands. This comment records what has landed since, two new findings, the answer on converting scripts to Node, and the order of work. **#467 lands first.** Its build plan is on #467.

### 1. Already done

<!-- prettier-ignore -->
| Settled-plan item | Landed in |
| --- | --- |
| Section 4: `.bkit/templates.md` replaces `tooling.md`, and install copies it into the consumer's `.bkit/` | #444, 1ce3bc4b |
| Section 2: `scripts/graphify/`, `scripts/serena/`, `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md` | #444, 1ce3bc4b |
| Section 2: `scripts/secrets/` (Node) | 415b28aa |
| Section 2: `scripts/prettier/` (Node, replaces the Python original) | e89d09af |
| Section 6: the gates audit checks every `bkit:gate:*` script | 3a6561b6 |
| `isCopyPasteExample` covers everything under the templates' `scripts/` | #444, 1ce3bc4b |

### 2. Converting scripts to Node: one rule for templates

- **Rule:** a template is written in Node unless the tool it wraps already needs another runtime. It goes in `.bkit/templates.md` § Contract.
- **graphify and Serena stay as they are** (Python, plus shell launchers). Both tools are Python, so porting the helpers removes no dependency.
- **bkit's own `.bkit/scripts/*.sh` become TypeScript commands in #467**, not here.
- **The hook scripts stay shell and stay owned** (`preflight.sh`, `cloud-bootstrap.sh`).
- **bkit-repo leftover:** `scripts/tooling/linear-to-github-import.ts` and its README are the last files under `scripts/tooling/`. The README also names the wrong path (`scripts/linear-to-github-import.ts`). They move to `scripts/linear/`, with the README paths fixed. They are not a template.

### 3. New findings

- **Templates call bkit scripts.** `bkit-cloud.yml` sources `bkit-counter-bus-config.sh`, and `package.json` `slop:delta` runs `bkit-slop-delta.sh`. #467 switches these to `bkit` commands before retiring the scripts (#467 plan, section 2). After that, templates touch bkit only through the `bkit` command. That also lowers the `bkit-cloud.yml` risk from settled-plan section 2: a stable command name replaces a script path that could move.
- **Template headers still say "Tier-3 seed-or-print".** Eight files: `.envrc`, `.husky/pre-commit`, `.husky/pre-push`, `.prettierignore`, `.github/workflows/ci.yml`, `docs/deployments.md`, `docs/templates/bkit-audit-agents.md`, `.bkit/.env.example`.
  - Template files get the one-line header the graphify and Serena files use: "Example. Copy into the repo and own it."
  - Owned files (`.bkit/.env.example`, the audit template, the `docs/deployments.md` block) lose the seed-or-print wording.
- **`ci.yml:159` claims `bkit check` warns when its promotion-lag block drifts.** No such check exists in `.bkit/src/`. The comment is wrong today. As a template, the block is plain content and the comment goes.
- **`templates.md` has no install lines or tool links yet.** Settled-plan section 4 requires both for every template.

### 4. Where the consumer's templates come from (settles section 10)

**Decided (2026-10-09): copy only the template set, and leave the package layout alone.**

- Install and upgrade copy into the consumer's `.bkit/templates/` exactly the paths `isCopyPasteExample` matches.
- So the consumer's folder holds only templates. Owned sources never land there.
- The package's own `.bkit/templates/` stays mixed. Only bkit sees it, so no path constant or test fixture has to move.
- `isCopyPasteExample` gets renamed `isTemplate`. Its exact-path list grows by the section-2 rows still to convert: `ci.yml`, `bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`.

The full `install/` + `templates/` split proposed on 2026-10-07 would buy the same result for consumers at the cost of moving every install path. Rejected.

**Also decided (2026-10-09), on #467:** no shim scripts when #467 retires a script. The upgrade message names each consumer file that still calls a retired path.

### 5. Order of work

Each wave is its own commit on `dev`, green before the next.

**Wave 1: templates are templates**
- Grow `isTemplate` to the full section-2 list.
- Install and upgrade copy that set into the consumer's `.bkit/templates/`. Upgrade first compares old and new bytes, then prints the changed paths plus a pointer to `.bkit/templates.md`.
- Add every newly-template path to `RETIRED_MANAGED_PATHS`. Upgrade drops their hashes and keeps the user's files.
- Rewrite the template headers (section 3).
- Release note: uninstall now leaves a consumer's `ci.yml` and hooks in place.

**Wave 2: delete seed-or-print**
- Delete `writeTier3`, `tier3Hashes`, the merge-instruction blocks, the uninstall reclaim for seeded files, and the upgrade conflict messages for template paths.
- The `ci` and git-hooks modules stop writing files. The lint module keeps only the owned slop plugin. The `--ci` flag goes.
- `canonicalHashes` stays for owned files, because #467's retire step uses it.
- The record files, `.agents/context.md`, `.agents/skills.md` and the `bkit:gate:*` script names become create-if-missing: written once, no hash, no message.

**Wave 3: shared files**
- `.mcp.json` and `.cursor/mcp.json`: bkit replaces only its tracker entry under `mcpServers`, the same per-key replace `opencode.json` uses.
- `bkit check` fails when an owned hook file is missing. The hook commands are `test -f … && node … || true`, so today a missing `guardrails.cjs` turns the guard off without a word.

**Wave 4: rules and docs**
- `.agents/rules.md`, all still unchanged:
  - `:103` Local pre-push: "`pnpm bkit:gate:static-unit`, then `bkit check`".
  - `:98` Fix code not gates: "anything a `bkit:gate:*` script runs".
  - `:107` Slop gate: "When the gate runs `slop:delta`: …".
- `.bkit/templates.md` gets a section for every section-2 template: what it does, copy from and to, install command and tool link, `package.json` scripts, `.gitignore` lines, what to adapt, known traps.
- Move `scripts/tooling/linear-to-github-import.*` to `scripts/linear/`.
- Refresh this repo's own adopted copies so they match the templates byte for byte, unless a difference is a deliberate repo adaptation.

**Wave 5: close**
- The closing test is #467's (no workflow or prompt names a template path). #489 adds one test: install writes nothing outside `.bkit/` for a template path, and upgrade never touches a consumer's adopted copy.
- Dogfood: install, upgrade and uninstall from a packed tarball in a clean folder, plus `bkit upgrade` on this repo.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Proposal: ship context-fetch blocks as templates (2026-10-10)

### The need

app-gether-life has built up a lot of working debug context in `.agents/config.md`:

- **14 fetch blocks** below `bkit:end`, which are what `/bkit-debug` runs: GitHub CI failures, diff against the last green run, Playwright, Maestro iOS, Tavily, Sentry, Vercel, Supabase, Stripe, Resend, Inngest, Cloud Run, Expo builds and Expo workflows.
- **4 cloud provision blocks** (vercel, serena, cloudrun, expo). These install a block's CLI in cloud sessions.
- **About 140 lines of allowed domains** for the cloud egress proxy.
- **An `mcp-servers` list.**

bkit ships only 6 examples (github ci, github diff, playwright, vercel, supabase, tavily), and they sit *inside* the managed block of `.agents/context.md`. A new consumer starts nearly from scratch, and gether's blocks show the proven shape: self-gating, bounded output, region hosts, and the empty-result-is-not-clean warnings.

### A problem this exposed in #489 as built

Wave 2a (ef1f09a7) made `.agents/context.md` **create-if-missing**, as the settled plan grouped it: written once, never touched again. But the managed half of that file is not just examples. It is the **rules** that `/bkit-debug` and `bkit install` parse against:

- the `context-fetch:start`, `:provision`, `allowed-domains` and `mcp-servers` marker formats;
- the self-skip contract;
- the apex-domain rule.

With create-if-missing, those rules freeze at the version a consumer first installed, while the code that reads the blocks keeps moving. That is the "stale doc agents act on" failure.

**Recommendation:** `.agents/context.md` goes back to **owned part of a shared file**. bkit rewrites the block between `bkit:start` and `bkit:end` on install and upgrade, and never touches anything below `bkit:end`. That is how it worked before Wave 2a, and it is the same rule as `AGENTS.md`, `rules.md` and the `docs/*.md` blocks. The plan's create-if-missing group then holds only `.agents/skills.md` and the `bkit:gate:*` names.

### Suggested approach

1. **One template file per provider** in `.bkit/templates/context-fetch/<name>.md`, holding everything that provider needs in one place:
   - the fetch block, plus its provision sibling if it has a CLI;
   - the env vars, split into secret (from env or dashboard) and non-secret (set inline so cloud agents inherit it);
   - the `allowed-domains` lines it needs (only hosts bkit's egress registry does not already derive);
   - the `mcp-servers` names, if it has an MCP;
   - its `# Customise:` knobs.

   Install copies them raw into the consumer's `.bkit/templates/`, and upgrade lists the ones that changed, like every other template.
2. **Move the 6 examples out of the managed block** into that folder. The managed block keeps only the rules and points at `.bkit/templates.md`, which makes it short and stable.
3. **Scrub gether specifics into placeholders**, in the same style as `{{CLOUD_RUNNER}}`:
   - org and project slugs (`bartens`, `gether-life`);
   - GCP project ids;
   - app domains (`gether.life`);
   - the Sentry EU region host, which becomes a commented option.

   Marker names use the current `context-fetch` spelling; gether is still on `debug-fetch` in `config.md`.
4. **`.bkit/templates.md` § Context-fetch blocks.** One table row per provider (context, what it fetches, env vars, domains, CLI), plus the adoption steps:
   - copy the block below `bkit:end`;
   - add its domains and MCP names to your lists;
   - set the env vars.
5. **No separate allowed-domains or MCP template.** The domains and servers a block needs travel with that block. The consumer's own app domains stay theirs.
6. **Test the mechanics:** every template file has matched marker pairs, and run with its env unset, each block exits 0 with a `[context-fetch:<name>] skipped —` line on stderr.

### Scope

This uses the template mechanism #489 just built, and the context.md grouping fix above corrects a #489 decision. So I suggest doing it in #489 as a wave before the close wave, rather than as a separate issue. Separately, gether should then upgrade, so that the existing `config.md` → `context.md` migration runs.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Decided (2026-10-10): context-fetch templates and context.md ownership

The proposal above is agreed, with one change:

- **Folder:** `.bkit/templates/context/`, one file per provider. Each file holds the fetch block, its cloud provision block, its env vars, the domains it needs and its MCP server names.
- **`.agents/context.md` goes back to owned part of a shared file.** bkit keeps the block between `bkit:start` and `bkit:end` current and never touches anything below `bkit:end`. Only `.agents/skills.md` and the `bkit:gate:*` names are create-if-missing.
- **Order:** both land as one more #489 wave before the close wave.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Done (2026-10-10)

bkit now writes only the files its workflows actually run. Everything else ships as a template: a reference copy the consumer reads and adopts by hand.

### What landed (on `dev`, 605051db..64fa2dc9)

- **Templates are templates.** Install and upgrade never write a template file into the repo. A raw copy of every template goes to the consumer's `.bkit/templates/`, and upgrade prints which template paths changed. `.bkit/templates.md` has one section per template, covering what it is for, its placeholders, and how to adopt it.
- **Seed-or-print is gone.** Gate tool scripts, their devDependencies and the husky `prepare` script are templates now. Core still seeds the `bkit:gate:*` script names into `package.json`, but only when they are missing, and warns when a gate has nothing behind it.
- **Removed:** the `--ci` flag, the ci and git-hooks modules, `bkit.runners`, `uninstall --package` and `--keep-tooling`, and `.bkitignore` (along with its picomatch dependency).
- **What bkit owns in shared files is narrower.**
  - In `.mcp.json` and `.cursor/mcp.json`, bkit owns only its tracker entry.
  - `.agents/context.md` keeps a block between the bkit markers that bkit owns and refreshes. Everything below the end marker belongs to the consumer.
  - `.agents/skills.md` works the same way: bkit refreshes its block, and the consumer's skills below the end marker are never touched.
- **Context-fetch blocks ship as templates.** There are 13 provider files in `.bkit/templates/context/`, one per provider: github, expo, maestro (iOS and Android), playwright, sentry, vercel, supabase, stripe, resend, inngest, cloudrun, tavily and serena. Each has its block, its allowed domains and its MCP names. The § Context-fetch blocks table in `.bkit/templates.md` lists them all.
- **`bkit check` fails when a hook file bkit owns is missing.** `cloud-bootstrap.sh` counts as missing only when cloud agents are set to claude.
- **Gateguard skips `.bkit/templates/` in consumer repos**, so editing a reference copy does not trip the gate.
- **Comments, docs and templates describe how things work now.** The reasons that used to sit in comments are decision rows in `docs/decisions.jsonl`.
- **Fixed on the way (#467):** `bkit ci slop` was reading only about 64 KB of slop-scan's report, so the gate failed on large changes even when the scan passed. It now reads the whole report.

Checks: 4914 tests pass, slop:delta, format and graph:check pass, and `bkit check` reports 0 writes. Dogfood from a packed tarball passed a fresh install, adoption, an upgrade from the published 4.12.0 and an uninstall.

### Release notes

- Uninstall deletes `.bkit/templates/` and leaves anything adopted from a template in place.
- Whole-repo gates (lint, format, spell check) should ignore `.bkit/templates/`, because those files are reference copies.
- `.bkit/.env.example` is owned by bkit; edits to it are overwritten on upgrade.
- `.bkit/version` has no `tier3Hashes` field, and upgrade does not read one. The two existing installs get their `.bkit/version` fixed by hand.
- Removed flags: `--ci`, `--tooling`, `uninstall --package`, `uninstall --keep-tooling`. The `bkit.runners` key is removed.
- Install no longer adds tool scripts or devDependencies to `package.json`; adopt them from `.bkit/templates.md` § Gate tool scripts.

## Templates: what #489 did (2026-10-10)

A **template** is a file bkit ships but never writes into your repo. You copy it, edit it, and own it from then on. bkit keeps the latest version beside your copy, so you can see what changed.

### How templates reach a consumer

- **Install and upgrade never write a template into the repo, and never overwrite your copy.**
- **Every install and upgrade copies the full set to your `.bkit/templates/`, unchanged.** No placeholders are filled in, so the copy is exactly what bkit ships. That makes `git diff .bkit/templates` on an upgrade commit the list of template changes.
- **Upgrade lists the template paths that changed, were added or were removed,** so you know which of your copies to compare.
- **Templates that leave the set are deleted from `.bkit/templates/`,** and `bkit check` flags a copy that is out of date.
- **`.bkit/templates.md` is the index.** For each template it says what it does, where to copy it, its placeholders, and how to install the tool behind it.
- **The rule for what counts as a template is `isTemplate`** (`.bkit/src/bkit-modules.ts`): a fixed list of paths, plus everything under `scripts/`, `.vale/styles/House/` and `context/`.
- **Templates carry no `bkit:start`/`bkit:end` blocks.** Only files bkit writes have them, so a block always means bkit refreshes that part.

### Files bkit used to write that are now templates

- **CI and cloud:** `.github/workflows/ci.yml`, `.github/workflows/bkit-cloud.yml`.
- **Dependency updates:** `.github/workflows/renovate.yml`, `.github/renovate.json5`, `.github/dependabot.yml`.
- **Git hooks:** `.husky/pre-commit`, `.husky/pre-push`.
- **Formatting and lint config:** `.prettierignore`, `.lintstagedrc.json`, `.vale.ini` and the four Vale House styles, `slop-scan.config.json`.
- **Editor and environment:** `.envrc`, `.cursor/settings.json`, `.cursor/environment.json`, `.cursor/Dockerfile`.
- **Code-map and symbol tools:** `.graphifyignore`, `.serena/project.yml`, `docs/capabilities.md`.
- **Per-tool scripts** under `scripts/`: graphify, prettier, secrets, serena.

**On upgrade, your existing copy of any of these stays where it is.** bkit drops only its recorded hash for the file (`RETIRED_MANAGED_PATHS`). Without that, an old hash could exempt the file from checks.

**bkit spots an adopted `ci.yml` by its job names.** The CI advisories (missing actionlint, run-step injection, capstone contract) look for `bkit-tests` / `bkit-tests-<lane>` jobs, not for markers.

### `package.json` is no longer edited for tooling

- **No tool scripts, devDependencies or husky `prepare` are added.** `.bkit/templates.md` § Gate tool scripts lists them for you to add.
- **bkit adds only the `bkit:gate:*` script names, and only if they are missing.** `bkit check` warns when a gate name has nothing behind it.
- **Uninstall never touches `package.json` scripts or devDependencies.**

### Context-fetch blocks (`.bkit/templates/context/`)

A context-fetch block is a shell snippet in `.agents/context.md` that pulls evidence for an agent, such as a failing CI log, an e2e report or production errors. There is **one file per provider** (13):

<!-- prettier-ignore -->
| File | Blocks |
| --- | --- |
| `github.md` | the failing CI run (`context=ci`); the diff since the last green CI run (`context=diff`) |
| `expo.md` | runtime (`context=runtime`); EAS workflow e2e evidence (`context=e2e`), each with its own install step and allowed domains |
| `maestro.md` | every failed Maestro job in the run, for iOS and Android lanes (`context=e2e`) |
| `playwright.md` | e2e report artifact |
| `sentry.md`, `vercel.md`, `supabase.md`, `stripe.md`, `resend.md`, `inngest.md`, `cloudrun.md` | that service's errors and logs |
| `tavily.md` | web search |
| `serena.md` | install step for the Serena symbol server |

- **Each file holds** its block or blocks, any install step, the allowed domains bkit doesn't already add, and any MCP server names.
- **Each block skips itself with a log line** when its tool or token is missing. A test runs every block with no tokens set to prove it.
- **No app-specific value is left in them.** Project names, domains and IDs are placeholders listed in `.bkit/templates.md`.
- **Adopting one:** copy a block below `<!-- bkit:end -->` in `.agents/context.md`, add its domains and MCP names to your lists, and set its environment variables.

### Files bkit keeps current

- **`.agents/context.md` and `.agents/skills.md`:** bkit refreshes only the block between its markers. Everything below `bkit:end` is yours: your fetch blocks, and your project skills.
- **There is no longer a "write once" group.** Every shipped file is either kept current by bkit (the whole file or its block) or a template.
- **Every file and block bkit writes carries a version marker,** `bkit:managed vX.Y.Z — do NOT edit; run bkit upgrade to refresh`, in that file's comment style:
  - markdown: `<!-- … -->`;
  - shell, `.gitignore`, `.gitattributes`, `.env.example`: `# <!-- … -->`;
  - JS hooks and scripts: `// …`.

  JSON files can't hold comments, so they carry none.
- **`bkit check` flags any marker left at an older version** (`bkit-managed-stale`). That catches a bkit update that was never re-applied. It blocks on main/dev and is advisory on feature branches. It replaces `bkit-rendered-prompts-stale` and `bkit-managed-docs-stale`.
- **The list of checked files is worked out from what install writes,** and a test fails if any written file lacks the marker.
- **Every release touches every managed file,** because the marker carries the version.

### Template contents

- **Template comments say what each part does**, never why or what came before. The reasons are recorded in `docs/decisions.jsonl`.
- **The repo's own copies follow the templates.** bkit's `.github/workflows/renovate.yml`, `.vale.ini`, the House styles and `.prettierignore` match their templates byte for byte. `bkit-cloud.yml` differs only in its runner label, plus its `bkit:start`/`bkit:end` lines, which are still there pending sign-off.
- **Gateguard (the hook that asks an agent to justify a new file) skips anything under `.bkit/templates/`** in a consumer repo, so editing a reference copy doesn't trip it.

## Work after the close (2026-10-10)

What landed on `dev` after the closing comment, plus the two pieces still running. The template details are in the "Templates: what #489 did" comment above. This comment covers everything, so nothing is missing from the record.

### Comments describe current state only (e4d5b78f, 53447d4f, 64fa2dc9)

- **Code comments say what the code does,** never why, what came before, or which issue changed it. This covers 173 source, hook, template and test files, plus the CI workflows (`ci.yml`, `bkit-cloud.yml`, `renovate.yml`) and their templates.
- **Every reason taken out of a comment is a row in `docs/decisions.jsonl`:** 20 from the source pass, 12 from the follow-up, and 27 from the workflows. Where no reason had ever been written down, the row says so.
- **Two workflow comments described the wrong behaviour and are corrected:**
  - unit coverage leaves out five files, not one;
  - a dropped dev dispatch is reported in the job summary, not `status.jsonl`.
- **`.agents/rules.md` (and its template) says "Comments explain what, not why".**
- **Leftovers fixed:**
  - a parity test now actually injects a mismatch;
  - two duplicate tests are removed;
  - `cloud-bootstrap.sh` messages point at `.bkit/cloud.md` instead of bkit's private tracker.

### Context-fetch templates: one file per provider (33d73e55, 8d5cc16d)

- **`.bkit/templates/context/` has 13 files, one per provider.**
  - `github.md` holds the failing-CI block (`context=ci`) and the diff-since-green block (`context=diff`).
  - `expo.md` holds the runtime block and the EAS e2e block, each with its own install step and allowed domains.
  - `maestro.md` covers iOS and Android lanes.
- **The `maestro` block prints every failed Maestro job in the run,** each under its own heading, so iOS and Android failing together both reach the agent. `MAESTRO_JOB_RE` names the lanes. The block name is `maestro`, and the variables are `MAESTRO_*`.
- Block code is unchanged except for maestro's loop over jobs. Tested against a fake `gh`: it prints failed iOS and Android jobs, leaves out a web lane and a lane that passed, and skips cleanly with the placeholder name.

### Version marker on every file bkit writes (802d94f4)

- **Every file and block bkit writes or refreshes carries `bkit:managed vX.Y.Z — do NOT edit; run bkit upgrade to refresh`,** in the file's comment style. JSON files carry none, because JSON can't hold comments. That is 290 files in a fresh all-hosts install.
- **`bkit check` reports `bkit-managed-stale` for any marker at an older version.** It blocks on main/dev and is advisory on feature branches. It replaces `bkit-rendered-prompts-stale` and `bkit-managed-docs-stale`.
- **The list of checked files comes from what install writes** (`listStampedFiles`). An integration test fails if any written file lacks the marker. It also sets every marker back to an older version and checks that `check` flags them all and `upgrade` restamps them with no conflicts.
- **Found and fixed on the way:**
  - Codex agent files were never stamped, and Codex skill files were stamped but never checked.
  - A fresh install of `cloud-bootstrap.sh` never exactly matched its refreshed version, because blank lines were missing in its block.
- **`.agents/skills.md` is a block bkit refreshes,** like `.agents/context.md`. The write-once group (`CREATE_IF_MISSING_PATHS`, `writeIfAbsent`) is deleted.
- **Templates carry no `bkit:start`/`bkit:end` blocks.** The CI advisories recognise an adopted `ci.yml` by its `bkit-tests` jobs.

### This repo's own workflows (8daf4992)

- **`.github/workflows/bkit-cloud.yml` is the template with `ubuntu-latest` as the runner,** and nothing else differs.
- **`ci.yml` no longer names a template block.**

### Ledgers

- **Decision rows:**
  - one each for the marker, the derived check list, the token in bkit's own source docs, templates without blocks, and `skills.md` as a block;
  - updated rows for the three file groups (owned file, owned block, template) and for the context templates.
- **Deferral:** the #467 untrusted-input render-time deferral is closed (2a21a2be).

### Checks at 8daf4992

- All 4876 tests pass, and format, slop, graph and actionlint pass.
- Upgrading this repo gives 0 conflicts, and `bkit check` reports 0 writes.
- Tarball dogfood:
  - fresh install, then `check` at 0 writes;
  - three markers set back are flagged as 3 of 290;
  - upgrade fixes them with no conflicts;
  - uninstall keeps the consumer's lines.

### In progress

- **Full dogfood.** Every file this repo copied from a template becomes that template with only the adaptations `.bkit/templates.md` allows. Where the repo's copy is better, the improvement moves into the template. `ci.yml` is rebuilt from the template. A test will check every adopted copy.
- **Dead-code removal.** A whole-repo scan, removing unused features, code, tests and docs. The first known cases are named blocks and the `optional` block flag, which no shipped file uses since templates lost their blocks.

This comment will be updated when both land.

## Review of what landed (2026-10-10)

**Short answer: #489 is done in substance, and nothing from the plan is missing outright.** The gaps are wording that still describes the old install, one release note and one decision row that disagree with the code, a closing test that covers less than it claims, and a few weak tests. The #467 review comment covers the workflows and commands; this one covers only #489's own scope.

**How this was checked.** I compared HEAD (`8daf4992`) with every commitment in the 2026-10-07, 2026-10-09 and 2026-10-10 comments. A reviewer read the source, ran the template and context tests (109 pass) and the 7 #489 upgrade integration tests, and dogfooded the committed `dist/` in a fresh repo: install, adopt a template, check, upgrade, check, uninstall. The results:
- install wrote 52 template copies and nothing outside `.bkit/templates/`;
- upgrade printed the changed template path and left the adopted `ci.yml` alone;
- the second check reported 0 writes;
- uninstall kept the adopted `ci.yml`, `.husky/pre-push` and the `bkit:gate:*` scripts, and removed `.bkit/templates/`.

Items marked ✔ I re-checked myself. The live working tree has another session's in-progress dogfood and dead-code edits, so this review doesn't cover them. Item 6 may already be fixed there.

### Done as planned

All of this is in the code:
- seed-or-print and `tier3Hashes` are gone; only the one-time fold on first upgrade remains;
- `--ci`, the ci and git-hooks modules, `bkit.runners`, the uninstall flags and `.bkitignore` are gone;
- `isTemplate` and the template copy step are in place;
- bkit owns only its tracker entry in `.mcp.json` and `.cursor/mcp.json`;
- the newly-template paths are in `RETIRED_MANAGED_PATHS`;
- the three `.agents/rules.md` edits landed;
- `bkit check` checks that the hook files bkit owns exist;
- gateguard skips `.bkit/templates/`;
- the linear import script is in `scripts/linear/`;
- every file and block bkit writes carries the version marker, and `bkit-managed-stale` flags old ones;
- the gates audit checks every `bkit:gate:*` script;
- the 13 context-fetch templates exist, with the test that each block skips itself when its env vars are unset.

Two things were decided differently from the plan, and both have decision rows:
- `.agents/context.md` and `.agents/skills.md` are blocks bkit refreshes, and the write-once group is deleted (`docs/decisions.jsonl` lines 276 and 281).
- The record files are created by the commands that first write to them, not by install (lines 195 and 211).

### Wrong or stale now

<!-- prettier-ignore -->
| # | What's wrong | Where |
| --- | --- | --- |
| 1 ✔ | **The install advisory still talks about "the seeded ci.yml install step".** bkit no longer writes a `ci.yml`, and the dogfood install printed this into a repo that has none. | `.bkit/src/bkit-postinstall.ts:1978-1979`, `:1288` |
| 2 ✔ | **The release note in the "Done" comment is wrong about uninstall.** It says uninstall "leaves template copies … in place". The code deletes `.bkit/templates/` whole (`bkit-uninstall.ts:751-761`). `.bkit/templates.md:47` and `.bkit/install.md:430,467` describe the code correctly. What uninstall does leave is anything *adopted* from a template. There is also no #489 CHANGELOG entry yet. | issue comment, CHANGELOG |
| 3 ✔ | **Decision row `489-own-only-what-a-workflow-runs-four-file-groups` disagrees with uninstall.** It says uninstall removes the owned `docs/templates/bkit-*.md` files and strips the `docs/*.md` blocks. Uninstall never touches `docs/`, and `.bkit/install.md:467` says that is deliberate. Either the row or the code has to change. Nothing written down says which is intended. | `docs/decisions.jsonl:275` |
| 4 ✔ | **The closing test doesn't take its list from `isTemplate`.** The #467 comment says "the names come from the templates folder, so a new template is covered automatically". In fact `bkit-template-path-refs.test.ts:21-33` reads only `.github/workflows/`, `scripts/` and `context/`, plus a hand-written list. It misses `.prettierignore`, `.cursor/*`, `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md`, `.github/renovate.json5` and `.github/dependabot.yml`. So it can't see that `.bkit/prompts/bkit-design-review-1.md:48` reads `docs/capabilities.md` "when present". That may be an acceptable read, since it's optional, but the test should be the one deciding. | `.bkit/src/bkit-template-path-refs.test.ts` |
| 5 | **"`bkit check` warns when a gate has nothing behind it" is narrower than it sounds.** It warns only when a gate still has bkit's default value and a script that value calls is missing (`bkit-modules.ts:1057`). A gate set to `""` or `echo ok` gets no warning. The gates audit catches that case, but `bkit check` doesn't. | release note, `bkit-modules.ts:1057` |
| 6 | **The "byte for byte" claim isn't true yet.** This repo's `.vale.ini` and `.prettierignore` both lack the `.bkit/templates/` exclusion their templates have. The repo's `.cursor/Dockerfile` still has `bkit:start`/`bkit:end` markers. This is the dogfood work marked in progress, so it may already be fixed in the working tree. | repo root |
| 7 | **`templates.md` is missing tool links** for Dependabot, Renovate, Serena, graphify and opencode, and install commands for Dependabot and Renovate. The 2026-10-07 plan asked for both on every template. | `.bkit/templates.md` |

### Old wording left behind

- `templates/scripts/graphify/bkit-graph-pre-push.sh:2` and `.bkit/templates.md:318` say to paste "below the bkit-managed block in `.husky/pre-push`". The pre-push template has no block any more.
- `templates/scripts/serena/bkit-serena-mcp.sh:14` still names `.agents/config.md` and the old `debug-fetch:provision` marker.
- User-facing text still says "Debug-fetch" (`bkit-postinstall.ts:1903`, `bkit-cloud-env.ts:847`) and "## Debug Fetch" (`templates/.agents/context.md:17`).
- `.claude/agents/utility-pre-release-check.md:52` still lists a "seed-once" file class. That agent is hand-written, so no mirror regeneration will fix it.
- `bkit-telemetry.ts:47` names app-gether-life in a comment.

### Weak tests

- **Both #489 upgrade integration tests return early, and so pass, when `tsx` is missing** (`bkit-upgrade.integration.test.ts:581,604`). They ran in this review, but nothing stops a machine without `tsx` from skipping them silently.
- **The context-template test's `/gether|bartens/i` check also matches "together".** It will fail falsely the day a template uses that word. A word-boundary match would fix it.
- **Not confirmed, medium confidence:** the Vale advisory tells a consumer with no `.vale.ini` to run `vale sync`, which fails without a config.

### Dropped with no decision recorded

- Uninstall removing the `docs/**` files bkit owns (item 3).
- The CHANGELOG release note (item 2).
- The full "warn when a gate is empty" check (item 5).
- Tool links and install commands for every template (item 7).

### Suggested fixes

1. Correct the release note here (uninstall removes `.bkit/templates/` and keeps adopted copies), and add the CHANGELOG entry.
2. Decide item 3. Leaving `docs/` alone on uninstall matches `install.md`, so I'd change the decision row rather than the code.
3. Build the closing test's list from `isTemplate`, so a new template really is covered automatically.
4. Sweep the old wording above and add the missing `templates.md` links. Both are mechanical.
5. Make the two integration tests fail, not return, when `tsx` is missing.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Review fixes and migration removal (2026-10-10)

This comment covers the fixes for the [review](https://github.com/cbartens/bkit/issues/489#issuecomment-6095032420) and the removal of all migration code. Commits on `dev`:
- `359035ff`: review wording, links and the closing test;
- `8badea26`: code;
- `8c52183e`: mirrors and the capability register;
- `b4573cfe`: the new project rule and decision rows.

Nothing is pushed yet. **Tests were written or edited but not run**, because the owner asked for the test pass to come later. `pnpm build` compiled cleanly.

### Review items
- **Item 1, fixed.** The install advisories describe `ci.yml` as a template the consumer adopts. Three places still talked about a seeded install step.
- **Item 2, fixed.** The "Done" comment's release notes now say uninstall deletes `.bkit/templates/` and keeps what was adopted. Its stale lines are corrected too: the `tier3Hashes` fold, the 15 context files and the written-once `skills.md`. `CHANGELOG.md` has an Unreleased entry for #489.
- **Item 3, waiting for your call.** The decision row says uninstall removes bkit's `docs/` files; the code leaves `docs/` alone. The reviewer suggests changing the row.
- **Item 4, fixed.** The closing test takes its names from every file `isTemplate` accepts. That covers the seven templates it missed. The `docs/capabilities.md` read in `bkit-design-review-1` is held as one narrow allowance, because it is optional ("when present").
- **Item 5, waiting for your call.** `bkit check` still warns about a gate only when the gate has bkit's default value and a script behind it is missing.
- **Item 6, no change needed.** `.cursor/Dockerfile` is identical to its template. `.vale.ini` and `.prettierignore` leave out the `.bkit/templates/` exclusion on purpose, because here that folder is source. The dogfood test records both.
- **Item 7, fixed.** `templates.md` links Dependabot, Renovate, Serena, graphify and opencode, and has install commands for Dependabot and Renovate. **Real bug found:** the Serena install command installed an unrelated PyPI package called `serena`. It is now `uv tool install -p 3.13 serena-agent`.
- **Old wording, fixed:**
  - the graphify pre-push and Serena scripts (template and this repo's copy);
  - "Debug-fetch" is now "Context-fetch", and "## Debug Fetch" is now "## Context Fetch";
  - `.agents/context.md`'s `# Config` heading is now `# Context`;
  - `utility-pre-release-check` lists the three file groups;
  - the app-gether-life name is gone from the `bkit-telemetry.ts` comment.
- **Weak tests, fixed:**
  - the five tests that need `tsx` fail instead of returning early when it is missing;
  - the name check uses word boundaries, so "together" no longer matches.
- **Vale advisory, fixed.** It was confirmed to say `vale sync` without a `.vale.ini`. It now says to copy the `.vale.ini` template first.

### Migration code removed

Only two installs exist and we control both, so code that carries old installs forward is dead (decision `489-no-migration-code`). About 10,900 lines are gone, mostly tests and fixtures.
- **Deleted modules:** `bkit-retire`, `bkit-package-json`, `bkit-context-migrate`, and telemetry `migrate`, `validate`, `normalise` and `lint`.
- **Removed inside surviving files:**
  - the `tier3Hashes` fold;
  - the envelope readers;
  - the `# bkit:start` marker style;
  - the opencode provider aliases;
  - the `status.json` rewrite and fallback;
  - old-layout handling;
  - the legacy advisories.
- **Bug found:** the version downgrade and stale-pin detectors read `.bkit/version` as plain text, so they never fired. They now read `pinnedVersion`.
- **Kept, because the input exists today:**
  - the `.npmrc` `_authToken` advisory: GitHub's docs tell people to write that line, and it breaks pnpm >=10.34.3;
  - tolerant reading of old ledger rows: app-gether-life's append-only ledgers contain them.
- **New project rule** in `.agents/rules.md`: agents never add migration code unasked. They suggest it and list the manual fixes instead.

**Other fixes from the same pass:**
- `.gitignore` is drift-checked against the `gitignore` template;
- `bkit comply` uses `resolveRepoSlug`;
- test-only flags are removed, along with `bkit status fold`;
- there is one context list and one start-line parser;
- the `bkit-tests-scope` advisory points at the template;
- `templates.md` uses `{{DEFAULT_BRANCH}}`.

**Template `ci.yml`:** it ships the `bkit-tests-check` capstone, so `/bkit-ship` works on the template as shipped. It ships no planner, because no bkit command reads one.

### app-gether-life: fixes by hand before its next upgrade
1. Rename `.agents/config.md` to `.agents/context.md`, and change every `debug-fetch:` marker to `context-fetch:`. That covers 21 fetch blocks, 6 provision blocks and 2 opt-out markers.
2. Move `docs/warnings.md` to `docs/noise.md`.
3. Run `pnpm bkit telemetry migrate` with the bkit 4.12.0 that is still installed, before upgrading, so `docs/completed.md` becomes `.bkit/issues.jsonl`. Otherwise the roadmap board comes out empty.
4. Change `package.json` `slop:delta` to `bkit ci slop`.
5. Take the current template's `bkit-cloud.yml`. Lines 235 and 620 source a retired script.
6. Delete the 12 retired `.bkit/scripts/*.sh` files. Keep `bkit-slop-type-suppression.mjs`.
7. Remove `Bash(curl:*)` and `Bash(wget:*)` from `.claude/settings.json` `permissions.ask`.
8. Rename `GH_BKIT_TOKEN_INSTALL` / `GH_BKIT_TOKEN` to `BKIT_GH_TOKEN_INSTALL` / `BKIT_GH_TOKEN` everywhere: `.bkit/.env`, the CI secret, Vercel, `pnpm config set` and the Renovate secret.
9. Optional: tidy the stale keys in `.bkit/version`.

### Still open
- Items 3 and 5 above need your call.
- **Upgrade in this repo reports a conflict on `LICENSE.md`.** The #506 licence commit added `.bkit/templates/LICENSE.md`, and today the engine treats that as a file it writes to the repo root. The licence files stay as they are. The conflict goes away once #507 leaves only templates in `.bkit/templates/`.
- Two stale `status.json` mentions remain in `.bkit/templates/.github/workflows/bkit-cloud.yml:66` and this repo's copy. They need CI-file sign-off.
- **Tests still to write:**
  - a drifted `.gitignore` block;
  - the comply repo slug;
  - the ship gate run against the template's job names;
  - actionlint on the filled-in template;
  - a replacement for the `status fold` malformed-line test.
  Then the full suite, `bkit check` and a tarball dogfood run.

Next: #507, the file and folder reorganisation.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Dogfood verification — bkit installing itself in the #489 format

Verified the repo's own install against #489 (own only what a workflow runs; ship the rest as templates) and #467.

**Green**

- `pnpm bkit check` → exit 0, `0 write(s) would occur` — owned, shared, rendered and managed-block files all current.
- `pnpm bkit:check:dist` → clean; committed `dist/` matches source.
- `pnpm test` → 156 files / 5029 tests pass; `audits/*` → 61 files / 1970 pass.
- Templates are word-for-word: `audits/repo/dogfood-templates.test.ts` maps **every** template path to a root copy and asserts equality after only the declared edits; `dogfood-noop.test.ts` covers the byte-identity mirrors. No orphan or old copies; no leftover bkit placeholders (the `{{ … }}` in the workflows are GitHub Actions expressions, not install tokens).
- `docs/templates/bkit-audit-*.md` and `.bkit/*.md` mirrors match source modulo the managed stamp; every `bkit:managed` marker is `v4.12.0` (850 occurrences, one version).

**Finding — stale template hashes in `.bkit/version`**

`canonicalHashes` still records 10 paths that are template-set files (a template is never written, so it must carry no hash):

```
scripts/graphify/bkit-graph-{drift,eager,imports,repair,surface}.py
scripts/graphify/bkit-graphify-{graphml,rollup}.py
scripts/graphify/bkit-graphify.sh
scripts/graphify/bkit-graph-pre-push.sh
scripts/serena/bkit-serena-mcp.sh
```

- Each maps to a live file under `.bkit/templates/` (graphify / Serena, per `.bkit/templates.md` § Contract), and each recorded hash **no longer matches disk**.
- Root cause: `mergeCanonicalHashes` (`install/version-file.ts:160`) prunes only entries whose path is **absent**. An entry whose path is still on disk but no longer owned survives. The mechanism the settled plan named — "add every newly-template path to `RETIRED_MANAGED_PATHS` so upgrade drops their hashes" — does not exist in the engine.
- Impact: contradicts "Only template-set hashes go", and bkit's own `docs/templates/bkit-audit-adoption.md` Step 2 lists "canonicalHashes entry the package no longer ships" as a finding — so the adoption audit would flag this repo. Invisible to `bkit check` (it diffs rendered writes, not the hash map) and inert to `bkit upgrade` (these paths are not in the owned set). Wrong state, no runtime effect.

**Fix applied (working tree, not committed)**

- Removed the 10 entries from `.bkit/version`.
- Added `audits/repo/version-hashes.test.ts`: asserts no `canonicalHashes` key maps to a `.bkit/templates/` path. It fails on HEAD with exactly these 10 and passes now; full audit suite 62 files / 1971 tests green.

Caveat: unrelated in-progress edits landed in the working tree during this session (Notation/wording docs, opencode GateGuard), so a later `bkit check` reports drift from those — out of scope for this finding.
