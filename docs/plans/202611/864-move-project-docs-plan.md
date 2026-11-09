<!-- bkit:anchor
baseSha: 9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Move project docs to templates with adoption warnings Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan for project document ownership and adoption.

## Context & Goals

The installer currently owns project guidance alongside its operating instructions. Give project teams ownership of their guidance while keeping enough evidence visible for bkit to carry out a task safely. Treat a document path as a recommendation and record the source the agent actually used.

**Related Issues:**

- [#863 — Ship a purpose-based components document template](https://github.com/cbartens/bkit/issues/863) (open in the related issue search).
- [#354 — Plan template doc stack-agnostic refactor](https://github.com/cbartens/bkit/issues/354) (state unverified in plan input).

The related-failure report retained one of eight matching rows. Its retained row is closed. The report gives partial historical context, so use the source ledger for any specific overlap that affects verification.

## 👤 ⚠️ Acceptance Scenario

### Narrative

Move project documentation from bkit-managed content to copy-and-own templates while actively encouraging consumers to adopt and populate it. Keep explicit, task-relevant document references in rules, prompts and the plan template. Missing or unpopulated documentation must produce visible, non-blocking warnings rather than broken workflows or silent skips.

### Success Criteria

- [ ] Move all ten current `.bkit/shared/docs/` files to `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise and setup. Install/upgrade refresh template copies; adopted project docs are consumer-owned and preserved. Keep essential bkit operating instructions current in managed guides/rules so they do not depend on optional adoption.
- [ ] Complete a responsibility-by-responsibility review of all shared rules, workflows, prompts and the plan template, including those with no existing doc references. Determine which `docs/*.md` files each should consult, add missing named references and correct inappropriate ones, with explicit applicability and warning-and-continue behavior. Record the reviewed responsibility, recommended doc paths and reason or not-applicable outcome so completeness can be checked. Merely adjusting existing mentions does not satisfy this criterion. Support design, audits and debug without a plan, build's issue-to-plan conversion and generated plans.
- [ ] Ship `.agents/docs.md` with only absolute core operational references inside `bkit:start/end`. Register adopted project docs in the consumer-owned Project Documents section when starters are copied into `docs/`, without duplicates or overwriting existing entries. An indexed but untouched starter still generates warnings.
- [ ] Add actionable, non-blocking adoption/population advisories through the existing advisory system. Accept indexed equivalent documents and distinguish missing, empty/template-only and populated documents. Use agent assessment for substantive coverage; do not claim semantic completeness from a mechanical check.
- [ ] Update documentation maintenance utility prompts, ship documentation updates and documentation audit templates to check presence, index accuracy and project content explicitly. Report absence and incomplete coverage; populate within authorized scope and evidence. Missing files cannot be silently skipped or yield a false clean/completion report.

### Process Sketch

- **WHEN** a fresh project installs bkit **→ THEN** it gets starters in `.bkit/templates/docs/` and can run a workflow before adopting them.
- **WHEN** a maintainer adopts and indexes an untouched starter **→ THEN** a relevant workflow warns that it still needs project content.
- **WHEN** the index names a populated equivalent at a different path **→ THEN** the workflow consults it and records its actual path and section.
- **WHEN** several agents find the same gap **→ THEN** their reports retain the evidence and the workflow shows one warning for that gap.
- **WHEN** a legacy project upgrades **→ THEN** existing project text and index entries survive and only valid ownership wrappers are removed from the ten migrated docs.
- **WHEN** an applicable topic remains unclear after consulting available sources **→ THEN** the agent records the uncertainty and applies existing safeguards.

### Concrete Example

**Setup:** A maintainer has a fresh bkit installation and an existing architecture note at `engineering/system.md`.

**Steps:**

1. The maintainer copies the security starter into `docs/security.md` using the documented adoption flow.
2. The maintainer registers the architecture note as the architecture topic in Project Documents and starts planning a CLI change.
3. The planner cites the architecture note and the section it used. It reports that the security starter lacks project information and names the repository evidence it checked.
4. Reviewers also identify that security gap. Their reports retain it and the plan summary shows it once.

**Outcome:** The maintainer can see what evidence the plan used and how to populate the security document. The documentation gap does not prevent planning.

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
| Index has duplicate or out-of-tree entries | Keep user text, prefer safe in-repo sources and report the ambiguity when it matters. |
| Copied starter differs only in whitespace or the former ownership lines | Classify it as starter-only. |
| A write to the adopted path would overwrite a file or follow a symlink outside the repository | Preserve the existing file and surface the specific failure. |

### Derived Test Matrix

`Type` uses the tiers in `docs/testing.md`. Each task owns its named tests.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fresh installation ships all ten templates without managed markers or creating managed project docs; legacy migration removes only ownership metadata, preserves edits inside/outside blocks and index entries, is idempotent, handles missing/malformed markers safely and leaves still-managed files unchanged; later install/upgrade/check/uninstall preserve project ownership | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 1 |
| Explicit adoption registers the starter immediately, preserves existing equivalent entries and handles retries and unsafe paths | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 2 |
| Ownership audits resolve relocated starter paths and the managed destinations of operational guidance | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 2 |
| The template-path guard accepts a named project-document read with applicability, equivalents and warning-and-continue behavior, and rejects a mandatory document read and hard dependencies on executable or configuration templates | Unit | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | 2 |
| Adoption advisories distinguish missing, zero-content, unchanged starters, populated and indexed equivalent docs; remain non-blocking and respect existing advisory controls | Unit | `.bkit/core/engine/checks/after/tools.test.ts`, `.bkit/core/engine/checks/after/index.test.ts` | 5 |
| Shipped rules/prompts/plan/audit templates consistently preserve explicit relevant references with warning-and-continue behavior, including no-plan paths and output reporting | Unit | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | 6 |
| Repeated reports merge by topic and gap within one run, and a subsequent run can report an unresolved gap | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 6 |
| The real summary command reads attributed files from the active run, excludes raw input and prior-run files, tolerates missing optional artifacts, preserves the verdict, and reports unresolved gaps again on a later run. If handover selects files independently, exercise the real handover command against the same fixture. | Integration | `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` | 6 |
| Packaged CLI on fresh and legacy scratch consumers verifies template refresh, project ownership, index preservation and advisory output | Smoke | Scratch consumer fixtures under `tmp/` | 7 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the testable contract above.

## 👤 ⚠️ Breaking Changes & Naming Review

- The ten project documents move from `.bkit/shared/docs/` to `.bkit/templates/docs/` in the package. Fresh install no longer creates these documents at `docs/<topic>.md`. Existing consumers retain their files at those paths through the owner-approved metadata migration.
- `.agents/docs.md` keeps its managed section and its consumer-owned `Project Documents` section. The latter can name a canonical topic for an equivalent document in its existing Scope cell. The table keeps its current columns.
- Plan and report output gains a `Documentation Consultation` section for source evidence and a `Documentation Warnings` section for unresolved gaps. The existing verdict header, runbook markers, workflow status rows, operational ledger paths and plan/audit locations retain their contracts.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed the breaking changes and naming decisions.

## 👤 ⚠️ Open Questions & Assumptions

**Open Questions:** None.

- **Assumption:** The current copy-and-own adoption procedure can pair the copy and index update. A raw copy outside that procedure can be reconciled on the next install or upgrade. If a project never runs either, its maintainer must add the row explicitly.
- **Assumption:** Repository evidence can establish some constraints when relevant guidance is missing. If available evidence cannot settle a requirement or a safety decision, the existing clarification or failure route applies.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have reviewed the open questions and assumptions.

## Alternative Approaches & Recommendations

- Use the existing template-copy pipeline, explicit copy-and-own instructions, and lifecycle reconciliation for present default paths. The flow can register an adopted starter immediately without adding a CLI verb or installing optional docs for the project.
- Keep a small core index and accept a project-owned mapping for alternatives. A generic instruction to read the index cannot communicate which evidence each responsibility needs.
- Keep mechanical state detection in the advisory pipeline and semantic assessment with the agent. A parser can identify a missing file or a known starter, but cannot establish that a real document covers a specific change.
- Put structured documentation findings in existing step artifacts and gather them at the phase summary. Files preserve each agent's evidence and make deduplication work on resumed runs without a new state log.

## Out of Scope

None. The issue's non-goals are acceptance boundaries. Warnings remain advisory, project facts require evidence, reads are scoped by applicability, and the ledger and existing gate contracts stay in force.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Purpose-based components document starter | [#863 — Ship a purpose-based components document template](https://github.com/cbartens/bkit/issues/863) | An additional optional documentation topic. | Keep independent. Review its applicability as part of the responsibility inventory if the template is present at build time. |
| Nested template migration path rewriting | `docs/deferrals.jsonl` key `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-884` | Installer migration path boundaries. | Keep CI script renaming independent. Use the existing finding to check that this migration stays within the ten intended document paths. |
| Managed-version restamp test timing | `docs/failures.jsonl` key `upgrade-managed-marker-restamp-timeout-release-gate` | The full verification gate exercises the same upgrade suite. | Diagnose independently if the timing failure recurs. Record its effect on verification. |

## Security & Privacy

- [x] **User input:** Treat Project Documents paths and text as repository data. Validate relative paths and resolve real paths within the repository. Reject absolute paths, traversal, symlink escapes and non-regular files before reading or writing. Use an explicit ten-path allowlist for wrapper removal.
- [x] **PII:** Print only validated, repository-relative paths and bounded gap/action metadata. Keep raw document content and secret values out of advisories and workflow summaries.

There are no new API routes, database writes, credentials, redirects or webhooks.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** `package.json` and `pnpm-lock.yaml` declare the existing toolchain. No new dependency is planned.
- [x] **Dependency Versions:** Node `v24.16.0`, pnpm `10.34.7`, GitHub CLI `2.102.0`. `pnpm bkit:deps:outdated` returned the outdated-package table and exit 1. It listed dev tooling updates for `oxlint-tsgolint`, `oxlint`, `@types/node`, and `vite`. No planned task requires those updates.
- [x] **Existing-Solution Search:** See Reuse Inventory.
- [x] **User Context:** The issue provides the acceptance criteria and authorizes the ownership migration. The planning worktree contains the source and test surfaces.
- [x] **Project Context:** Relevant folded ledger rows include the existing no-unused-code decision and the mirror drift check gotcha. Use `bkit check` for rendered mirror drift because rendering resolves host and tracker variants.
- [x] **Testing & Quality:** Use Vitest unit and integration tiers, and a built CLI smoke run against disposable Git repositories.
- [x] **Prerequisite Plans:** None.

### Conditional

<!-- prettier-ignore -->
| Topic | Actual source and section | Coverage, gap, and action |
| --- | --- | --- |
| Architecture | `docs/architecture.md` § Install Lifecycle (Three Phases), § Consumer Integration Model | Covers the managed and template lifecycles. Confirm both write paths in the engine and update the ownership description. |
| Technology | `docs/technology.md` § Runtime & Language, § Build & Output | Covers Node, TypeScript and committed distribution. Use existing Node file APIs and rebuild `dist/`. |
| Security | `docs/security.md` § Untrusted Content & Prompt Injection | Covers privileged agents consuming text. Validate index paths against repository boundaries and print metadata only. |
| Testing | `docs/testing.md` § Which tier does a behaviour need?, § Test first | Covers the tier selection. Use a real scratch repository for install, upgrade, check, and uninstall. |
| Observability | `docs/observability.md` § Advisory Checklist Output, § Phase 3 Credential + Migration Findings | Covers the current checklist and migration findings. Keep optional document gaps in those outputs and the workflow summary. |
| Setup | `docs/setup.md` § Bootstrap, § Verify | Covers the local bootstrap. The managed install and template guides will carry the reusable adoption instructions. |
| Data schema, design, deployments, noise | Not applicable | This work changes no database, visual interface, deployment behavior, or intentional downgrade of an existing signal. |

No new secrets, services or notification channels apply.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** Owner confirmation is recorded above.
- [x] **Breaking Changes confirmed:** Owner confirmation is recorded above.
- [x] **Open Questions confirmed:** Owner confirmation is recorded above.
- [ ] **Security & Privacy checked:** Verify the filesystem boundaries and safe warning output in the runbook.
- [ ] **Reuse Inventory complete:** Verify each changed capability against its named source.
- [ ] **Reuse reasons:** Verify each new file has its reuse reason.
- [ ] **Gate 1 — Verified:** Confirm every applicable prerequisite.

## Data Schema Integration

The feature uses repository files.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Verify refresh of the optional template payload | `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Serena symbol overview, `docs/capabilities.md` template-copies entry, `rg -l 'shared/docs' .bkit/core/engine` | `syncTemplateCopies` in `.bkit/core/engine/install/template-copies.ts` already mirrors the entire package template tree. | EXTEND | Extend the integration coverage in Task 1 to the ten project documents. Reuse the copy mechanism and its entry points as they are. |
| Ten project starter files | `.bkit/templates/docs/architecture.md`, `.bkit/templates/docs/technology.md`, `.bkit/templates/docs/security.md`, `.bkit/templates/docs/data-schema.md`, `.bkit/templates/docs/testing.md`, `.bkit/templates/docs/deployments.md`, `.bkit/templates/docs/observability.md`, `.bkit/templates/docs/design.md`, `.bkit/templates/docs/noise.md`, `.bkit/templates/docs/setup.md` | `rg --files --hidden .bkit/templates/docs .bkit/shared/docs`, template guide, install ownership declarations | Each starter replaces its managed source. | NEW | Reason (c). Move the ten managed sources and remove their former copies in the package. |
| Migrate ownership metadata | `.bkit/core/engine/install/managed-block.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/install/upgrade.ts` | `rg -n 'runCoreModule\|stripManagedBlock\|runBkitDocs' .bkit/core/engine`, Node line-preserving text and file operations | Line-anchored marker recognition, install/upgrade wiring and scoped migration patterns. | EXTEND | Reuse marker recognition for a wrapper-only edit. The existing removal operation deliberately removes the enclosed region. |
| Map topics, preserve Project Documents, and share adoption state | `.bkit/core/engine/install/project-docs.ts` | Text searches for `Project Documents` and `templates adopt` in `.bkit/core/engine`, `shared/text.ts` § table parsing, managed index and template guide | A generic Markdown table parser and a managed-block parser cover syntax, while the core index source covers managed rendering. | NEW | Reason (a). The searches found no project-topic resolver or surgical registration writer. Share one resolver between lifecycle reconciliation and advisories. |
| Retire managed bookkeeping | `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/commands/install/uninstall.ts`, `.bkit/core/engine/checks/after/managed.ts` | `rg -n 'isTemplateSetPath\|canonicalHashes\|coreDocEntries' .bkit/core/engine` | `mergeCanonicalHashes` already prunes template-set paths from prior entries. Uninstall and managed-marker checks use ownership-specific inputs. | EXTEND | Cover fresh-write exclusion and exclude the former managed docs from stale marker/drift inputs, including when malformed markup is preserved. |
| Report local adoption state | `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts` | Serena advisory symbol search, `rg -n 'detectBkitStubs\|isAdvisorySuppressed' .bkit/core/engine/checks`, `docs/observability.md` § Advisory Checklist Output | Existing local advisory detectors, checklist, artifact, and suppression settings. | EXTEND | Add a detector using the shared resolver and feed actionable findings through the existing advisory path. |
| Record the full responsibility review | `.bkit/core/.bkit/workflows.md` and `.bkit/core/.bkit/prompts.md` | `rg --files --hidden .bkit/core/{workflows,prompts,docs/templates}`, `pnpm instructions:show` tooling, existing catalogs and source reference audits | Existing workflow and prompt catalogs describe their responsibilities. | EXTEND | Add coverage tables in the existing catalogs with rule, prompt, workflow-step and plan-section locators. Preserve the source of each instruction. |
| Consult and record project documentation in every applicable phase | `.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.bkit/core/docs/templates/bkit-plan.md` | `rg -n 'docs/\|^##' .bkit/core/prompts`, plan-template pre-flight, shared instruction index | Named doc reads, shared wording propagation, runbook contract, and existing phase artifacts. | EXTEND | Give each responsibility explicit topic paths and applicability, and carry actual sources and gaps through native outputs. |
| Deduplicate warnings within a phase | `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/workflows.ts` | `rg -n 'buildSummary\|summaryVerb' .bkit/core/engine/commands/workflow`, `.bkit/workflows.md` § status.jsonl | Existing summary already consumes current-run step rows and reads their artifacts. | EXTEND | Render one list from structured report rows attached to the active run. |
| Report maintenance and audit gaps | `.bkit/core/prompts/bkit-utility-update-documentation.md`, `.bkit/core/prompts/bkit-ship-update-docs.md`, `.bkit/core/docs/templates/bkit-audit-documentation.md`, `.bkit/core/docs/templates/bkit-audit-adoption.md` | `rg -n 'Project Documents\|Written Files\|Drift Resolved' .bkit/core/{prompts,docs/templates}` | Documentation maintenance reports and documentation/adoption audit probes already exist. | EXTEND | Cover absent and underpopulated applicable docs in their own output sections and verify evidence before clean status. |
| Verify template ownership and safe references | `.bkit/core/engine/audits/templates/template-path-refs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/rules-sync.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `package.json` | `rg -l 'shared/docs' .bkit/core/engine/audits`, the template guard's `forbiddenNames` and corpus checks, `package.json` § scripts | Existing source audits, dogfood inventory, lint globs and `pnpm bkit:generate`. | EXTEND | Update ownership assertions and refresh affected generated outputs before the first group gate. Permit only qualified project-doc reads and preserve the dependency guard for other templates. |
| Verify rendered and packaged contract | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` | `rg -l 'shared/docs' .bkit/core/engine/audits`, mirror drift ledger | Source audits, host render fixtures and built CLI smoke fixtures. | EXTEND | Verify responsibility coverage, host rendering and the installed footprint using existing harnesses. |
| Verify artifact selection through command dispatch and local storage | `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` | `rg --files --hidden .bkit/core/engine/commands/workflow -g '*.integration.test.ts'`, `workflows.test.ts` § `bkit workflows summary`, `docs/testing.md` § Which tier does a behaviour need? | `workflows.test.ts` has a summary fixture but runs in the unit tier. `progress.integration.test.ts` shows how the integration tier dispatches registered commands against real files. | NEW | Reason (b). Keep the existing unit caller and its test-tier contract. Use the established scratch-tree and dispatch patterns in an integration file because selection spans the command and filesystem. |

## Architecture & Component Changes

**Ledger rows:** `489-uninstall-cleans-docs`, `864-project-doc-adoption-index`, `864-project-doc-warning-aggregation`

### Database Migrations

None.

### Installer and ownership

- **[DELETE]** `.bkit/shared/docs/` — move the ten project-doc sources listed below into the existing optional template tree.
- **[NEW]** `.bkit/templates/docs/{architecture,technology,security,data-schema,testing,deployments,observability,design,noise,setup}.md` — reason (c) in Reuse Inventory. Remove the ownership wrappers and generated managed notices from package starters. Give each starter clear prompts for project facts. Move required bkit mechanics into existing managed rules or guides and correct named links to their new homes.
- **[MODIFY]** `.bkit/core/engine/commands/install/install.integration.test.ts` and `.bkit/core/engine/commands/install/upgrade.integration.test.ts` — extend the existing lifecycle fixtures to verify the relocated template copies. The current template copy implementation supplies the files.
- **[MODIFY]** `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/install/install.ts`, `.bkit/core/engine/commands/install/upgrade.ts`, `.bkit/core/engine/commands/install/uninstall.ts`, `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/checks/after/managed.ts` — these exist. Remove the shared-doc enumeration and former uninstall ownership. Ensure the ten paths cannot enter fresh or retained ownership hashes or the stale managed-marker detector. Check uses the usual template-copy drift check only for the shipped copies.
- **[MODIFY]** `.bkit/core/engine/install/managed-block.ts` — exists. Identify the one ordered pair of marker lines and the exact generated notice line inside the block. Remove those lines only, retaining every other byte, including original line endings. Warn and leave an ambiguous block byte-for-byte, including cases with a missing partner, reversed or multiple delimiters, or marker-looking lines in Markdown fences. If both markers are absent, leave content alone. Reject unsafe file paths. Use real install and upgrade entry points after managed index rendering and before final advisory evaluation. An upgrade dry run previews actions. Check and doctor only detect gaps, and retired docs never add would-writes to the managed drift gate.
- **[MODIFY]** `.bkit/core/.agents/docs.md` — exists. Keep the rules, phase legend, managed operations references (workflow, prompt, CLI, router, skills, context, authoring, JSONL, tracker and install guides), workflow ledgers, plan/audit inputs and templates in the managed index as applicable to bkit itself. Move project advice and optional project paths out of its managed block. Keep Project Documents below the closing marker. Update the bkit repo's own index with existing project rows without dropping its local entries.
- **[NEW]** `.bkit/core/engine/install/project-docs.ts` — reason (a) in Reuse Inventory. Centralize the ten default recommendations, recognized equivalent mapping and surgical row insertion. Resolve default names, unique indexed same-basename alternatives, and explicit equivalents whose Scope cell identifies the recommended path, for example `Equivalent to docs/architecture.md`. Leave human interpretation of other scope prose to the agent. Resolve only regular repository files. Preserve unrelated rows and text. Prefer a usable indexed equivalent when the default is absent. Keep alternatives visible when more than one could apply. Warn on ambiguous or unreadable index structures, rather than rewriting them.
- **Adoption procedure:** In the existing template guide, pair an explicit copy of a missing starter with adding its Project Documents row. Give an equivalent document the same topic by naming the recommended path in its Scope cell. Install and upgrade reconcile present unregistered default files and migrated copies without creating missing project documents or replacing an indexed equivalent. Treat the exact indexed path as the deduplication key. A migrated path gets its own row when it has no existing row, even if a distinct equivalent path is already indexed. Preserve both documents and surface ambiguity if a task needs it. Keep reconciliation retryable if a prior run wrote the document but could not register it.
- **[MODIFY]** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/rules-sync.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/template-path-refs.test.ts` and `package.json` — update the former ownership assumptions, adoption inventory and lint globs before the first group gate. Keep the guard's rejection of hard dependencies on executable and configuration templates. Permit named project-document reads only where the surrounding instruction establishes applicability, equivalents and warning-and-continue behavior.

Task 1 verifies that bkit can operate without optional docs by mapping each required instruction to its managed home and updating the old references.

<!-- prettier-ignore -->
| Source guidance | Managed destination and completion evidence |
| --- | --- |
| `.bkit/shared/docs/security.md` § Untrusted Content & Prompt Injection | `.bkit/core/.bkit/prompts.md` § Special Behaviors carries the threat model and agent boundaries. Existing managed rules retain the instructions. The rules audit checks the managed destination. |
| `.bkit/shared/docs/testing.md` § Local test sleep prevention, § CI test tiers (the bkit scaffold), § Test first, § Tests lock and § JUnit reports for bkit | `.bkit/core/.bkit/workflows.md` keeps the runner, gate and evidence requirements alongside the existing Local gate scripts and Test-first guidance. The starter asks for the project's choices. |
| `.bkit/shared/docs/deployments.md` § Commit-message force tags, § Autonomous phase-close prerequisites, § Post-merge dev CI auto-routing and § Ship gate + bookkeeping | `.bkit/core/.bkit/workflows.md` keeps the bkit routing, phase prerequisites and safety gates with the per-phase workflows. The managed operator guide describes bkit recovery requirements. Project-specific rollback and deploy decisions stay with the project. |
| `.bkit/shared/docs/setup.md` § Templates, § Agent hosts and § Remote access | `.bkit/core/.bkit/install.md` keeps host and remote setup requirements. `.bkit/core/.bkit/templates.md` keeps the copy-and-own procedure. Verify the install entry point and links in the rendered guides. |

### Consultation, advisories and reporting

- **[MODIFY]** `.bkit/core/engine/checks/after/tools.ts` and `.bkit/core/engine/checks/after/index.ts` — these exist. Return advisory findings for missing index, missing/unindexed paths, unreadable alternatives, empty or placeholder-only content, and unresolved cleanup. Compare meaningful text with normalized current and known legacy shipped baselines, including markers removed and historically rendered placeholders. Keep only the minimum legacy comparison data needed to recognize shipped content. Compare conservatively and call a differing document a candidate for agent assessment. Keep warnings actionable, topic-specific and suppressible through the existing advisory controls. CLI install/check/doctor are repository-wide discovery, while phase warnings apply only to topics touched by a responsibility.
- **[MODIFY]** `.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.bkit/core/docs/templates/bkit-plan.md` — these exist. Enumerate all rule bullets, workflow responsibilities, prompt responsibilities, and plan-template sections from their headings and instruction structure before searching for current path references. For each give the named recommendation, applicability and reason, or a reason for no project doc. Mark each applicable citation added, retained, or corrected. Record the review in the managed workflow and prompt catalogs and verify coverage against the source inventory. Adopt shared wording only through the instruction registry.
- **Consultation contract:** Read the index when available. For each applicable topic, name the recommended path and consult a valid indexed equivalent or the available canonical document. Record topic, actual path and section, coverage, gap, action, alternative evidence and remaining uncertainty. A missing index is itself a warning and triggers repository evidence discovery. Mark irrelevant topics not applicable. Always assess architecture, technology, security and testing in generated and converted plans. Consult data schema for DB changes, design for UI, observability for logging, deployments for release/CI behavior, and setup, noise and other optional templates when relevant. Carry required reads and updates into executable tasks. Apply the same responsibility contract when design, audits or debug have no plan. Keep checks that require genuine safety evidence in force.
- **[MODIFY]** `.bkit/core/engine/commands/workflow/summary.ts` and `.bkit/core/engine/commands/workflow/workflows.ts` — these exist. Add a named report-body section after any machine-readable verdict header. Give warnings a stable topic and gap key with recommended path, alternative evidence and action. Read structured fields only from the current run's attributed step artifacts and its plan/design outputs, including resumed runs, avoiding raw tracker or external input. Merge duplicates by normalized topic and gap, retain distinct evidence and actions, and expose one visible warning list per run through the existing summary and final return. Do not change verdict or failure counts for these warnings. Individual audit and utility reports use the same fields in their own output.
- **[NEW]** `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` — reason (b) in Reuse Inventory. Exercise current-run file selection and summary rendering through the real command with scratch status and report files. Exercise handover through its real command if it selects warning files independently.
- **[MODIFY]** `.bkit/core/prompts/bkit-utility-update-documentation.md`, `.bkit/core/prompts/bkit-ship-update-docs.md`, `.bkit/core/docs/templates/bkit-audit-documentation.md`, and `.bkit/core/docs/templates/bkit-audit-adoption.md` — these exist. Audit and maintenance reports inventory expected and actual topics even when files are absent, validate index accuracy and distinguish registration from project-specific coverage. Report gaps and actions. Populate within authorized scope and evidence. Replace old shared-project-doc probes with adoption and content probes.

#### Documentation warning record

Task 3 defines the report body below and Task 6 reads it. Use one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with JSON string escaping. Require nonempty `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`. Use a short topic identifier and a stable gap key. Write `"None available"` when no alternative evidence is available. Omit a missing section or malformed record from aggregation and keep the original artifact available for inspection. A missing or malformed record does not change the verdict. Source attribution comes from the workflow's artifact selection.

```jsonl
{
  "topic": "security",
  "gap": "starter-only",
  "recommendedPath": "docs/security.md",
  "alternativeEvidence": "The CI configuration defines token permissions.",
  "action": "Populate the security document with the project's credential and permission boundaries."
}
```

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/shared/docs/architecture.md`, `.bkit/shared/docs/technology.md`, `.bkit/shared/docs/security.md`, `.bkit/shared/docs/data-schema.md`, `.bkit/shared/docs/testing.md`, `.bkit/shared/docs/deployments.md`, `.bkit/shared/docs/observability.md`, `.bkit/shared/docs/design.md`, `.bkit/shared/docs/noise.md`, `.bkit/shared/docs/setup.md` | Same basenames in `.bkit/templates/docs/` | DELETE | A single starter source avoids duplicate package ownership and copy drift. |
| Core shared project-doc installation enumeration | Existing optional template-copy lifecycle | DELETE | The consumer owns adopted project documents. |
| Uninstall enumeration of the ten project docs | Existing managed uninstall scope and template-folder removal | DELETE | Removing the old enumerator keeps adopted and migrated files outside uninstall. |
| Optional project-doc rows in the managed index | Recommendations in relevant instructions and actual adopted entries in Project Documents | DELETE | The managed index describes core operations. A project row represents a real document. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.agents/docs.md` and bkit's `.agents/docs.md` | Define the core/consumer boundary and existing project paths. Document equivalent-topic mapping and preserve consumer-owned rows. |
| `.bkit/templates/docs/` and `docs/migrations.md` | Ship ten usable starters and record the scoped, idempotent ownership migration with fixtures and version coverage. |
| `.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.bkit/core/docs/templates/bkit-plan.md` | Add explicit applicable sources, warning behavior and structured output fields. Propagate shared clauses and regenerate mirrors. |
| `.bkit/core/.bkit/workflows.md` and `.bkit/core/.bkit/prompts.md` | Record the responsibility inventory and warning/report contract, and sync catalog rows with their sources. |
| `.bkit/core/prompts/bkit-utility-update-documentation.md`, `.bkit/core/prompts/bkit-ship-update-docs.md`, documentation and adoption audit templates | Add presence, registration, source and content coverage evidence to checks and reports. |
| `.bkit/core/.bkit/README.md`, `.bkit/core/.bkit/install.md`, `.bkit/core/.bkit/templates.md`, `README.md`, and `DETAILS.md` | Explain template refresh, copy and index steps, alternatives, advisory output and lifecycle preservation. Keep required setup and workflow mechanics in their managed guide. |
| `docs/architecture.md`, `docs/observability.md`, `docs/testing.md`, and affected project docs | Update package boundaries, advisory paths, test coverage and any project-specific references rendered obsolete by the move. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| Package | Revert the code and source changes and rebuild the package. | Verify the package against pre-migration and already-migrated scratch repositories. |
| Consumer docs | Keep the current project documents and index entries. | Before running a reverted version, inspect its managed ownership behavior against the migrated snapshot. An old installer may claim those paths again, so use a pre-migration checkout or restore only the ownership metadata after reviewing the diff. |

## Agent Execution Runbook

The groups describe implementation order. A single pull request can carry all groups.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Template ownership and index registration

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Move the project documentation starters and migrate legacy ownership.
  - **READ:** `docs/architecture.md`: verify install and package boundaries.
  - **READ:** `docs/security.md`: apply the untrusted content and filesystem constraints.
  - **READ:** `docs/testing.md`: apply the lifecycle integration tier.
  - **READ:** `.bkit/core/engine/install/template-copies.ts`: keep the existing template refresh entry points.
  - **CREATE:** `.bkit/templates/docs/architecture.md`: move and adapt the architecture starter.
  - **CREATE:** `.bkit/templates/docs/technology.md`: move and adapt the technology starter.
  - **CREATE:** `.bkit/templates/docs/security.md`: move and adapt the security starter.
  - **CREATE:** `.bkit/templates/docs/data-schema.md`: move and adapt the data-schema starter.
  - **CREATE:** `.bkit/templates/docs/testing.md`: move and adapt the testing starter.
  - **CREATE:** `.bkit/templates/docs/deployments.md`: move and adapt the deployments starter.
  - **CREATE:** `.bkit/templates/docs/observability.md`: move and adapt the observability starter.
  - **CREATE:** `.bkit/templates/docs/design.md`: move and adapt the design starter.
  - **CREATE:** `.bkit/templates/docs/noise.md`: move and adapt the noise starter.
  - **CREATE:** `.bkit/templates/docs/setup.md`: move and adapt the setup starter.
  - **CREATE:** `.bkit/core/engine/install/project-docs.ts`: share the topic catalog, marker migration coordination and Project Documents resolver and row insertion.
  - **DELETE:** `.bkit/shared/docs/architecture.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/technology.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/security.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/data-schema.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/testing.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/deployments.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/observability.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/design.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/noise.md`: remove the old managed source after moving it.
  - **DELETE:** `.bkit/shared/docs/setup.md`: remove the old managed source after moving it.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: stop enumerating the ten shared docs and update the install lifecycle.
  - **UPDATE:** `.bkit/core/engine/install/modules/index.ts`: keep retired doc paths out of managed-marker discovery.
  - **UPDATE:** `.bkit/core/engine/install/managed-block.ts`: remove the exact recognized wrapper lines and preserve enclosed and surrounding bytes. Isolate wrapper-only removal from the shared parser and the existing block-removal operation.
  - **UPDATE:** `.bkit/core/engine/commands/install/install.ts`: call the migration in real install after managed index rendering and before advisory evaluation.
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.ts`: call the same migration and preview it on dry run.
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.ts`: remove retired doc entries from the uninstall table.
  - **UPDATE:** `.bkit/core/engine/install/version-file.ts`: ensure no migrated or reconciled project doc contributes an ownership hash.
  - **UPDATE:** `.bkit/core/engine/checks/after/managed.ts`: align managed marker drift checks with current ownership inputs.
  - **UPDATE:** `.bkit/core/.agents/docs.md`: keep core operating rows and the Project Documents boundary.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: relocate the required security operating guidance and update its references.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: relocate the required testing and deployment mechanics using the managed destinations in Architecture & Component Changes.
  - **UPDATE:** `.bkit/core/.bkit/install.md`: keep the required host, remote and recovery guidance available without the starters.
  - **UPDATE:** `docs/migrations.md`: record the migration, legacy release scope and integration evidence.
  - Before editing the old starters, preserve per-topic digests of their normalized shipped text in `.bkit/core/engine/install/project-docs.ts`, with the source revision and rendering rules used to produce them. Normalize former ownership lines, line endings and historically rendered placeholders so Task 5 can recognize known legacy starters. Keep fixtures that demonstrate the normalized comparison against real legacy text.
  - **DONE WHEN:** All ten optional starter copies refresh with no ownership markers and no fresh project-doc writes. Legacy install and upgrade remove only ownership metadata, preserve bytes inside and outside the old block, and register existing paths without changing existing rows. Missing files stay missing. Malformed paths or wrappers are preserved and reported. Repeated operations are idempotent. Ownership hashes and stale managed checks exclude retired docs. Managed index and plan/audit blocks keep their ownership. Every mapped operating requirement has a managed destination and working references. The lifecycle integration tests and existing shared parser and writer tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `ships ten optional document starters on fresh install` fails on the CLI creating managed documents at project paths.
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `preserves the contents of a legacy managed document when reinstalling` fails on retaining legacy markers or losing project text and its index entry.
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` fails on a stale ownership hash, a repeated write, an overwritten project row, or loss of CRLF and edits around the wrapper.
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `preserves ambiguous legacy markers and reports cleanup without blocking check` fails on changing or ignoring the malformed copy, creating a missing file, or classifying the retired copy as owned drift.
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `previews project document migration without mutating the checkout` fails on missing migration output or a dry-run file or index edit.
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `preserves project document copies on full uninstall` fails on removing a migrated or adopted copy or removing its consumer index row while removing the still-owned template files.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Register adopted documents and verify their new ownership before the group gate.
  - **READ:** `docs/setup.md`: identify which setup mechanics belong in the managed operator guide.
  - **UPDATE:** `.bkit/core/engine/install/project-docs.ts`: reconcile present canonical docs after the existing managed index write. Keep a malformed index byte-for-byte and provide a repair advisory.
  - **UPDATE:** `.bkit/core/engine/commands/install/install.ts`: reconcile without creating missing project documents.
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.ts`: reconcile through the same helper.
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: document the paired copy and index steps and equivalent topic notation.
  - **UPDATE:** `.bkit/core/.bkit/install.md`: document install, upgrade and uninstall ownership.
  - **UPDATE:** `.bkit/core/.bkit/README.md`: align ownership and footprint tables with the new lifecycle.
  - **UPDATE:** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`: derive the starter inventory from the new location and preserve reference validation.
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates.test.ts`: walk the relocated starters and verify references to managed guidance and optional docs against their respective sources.
  - **UPDATE:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: verify required threat-model guidance at its managed destination and the continued presence of its rule.
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: register all ten document templates against this repo's existing project copies with the appropriate adoption entries.
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-path-refs.test.ts`: keep the guard across workflows, prompts and shared clauses. Enforce the qualified project-doc contract with explicit approved topics and applicable source context. Convert any existing rejected reference needed for this gate to the qualified form and carry that change into Task 3's full responsibility review.
  - **UPDATE:** `package.json`: remove the retired prose lint glob and retain the existing template glob.
  - **UPDATE:** `dist/cli.js`: rebuild the changed installer and its imported modules. Run the repository generator to refresh affected mirrors, template copies and snapshots, then run the affected ownership audits and `bkit check` before the group gate. Confirm that the dogfood index preserves existing project entries.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The copy-and-own instructions give an immediate registration step. Install and upgrade can reconcile a present unregistered default doc, including an untouched starter, while preserving an indexed equivalent and unrelated entries. Check only warns about adoption gaps. Unsafe paths and unreadable index shapes are handled without overwrites. The adoption integration tests pass. Ownership audits pass against the moved files and current mirrors before Group 2 starts. The template guard accepts qualified recommendations and continues to reject mandatory project-doc reads and hard dependencies on executable or configuration templates.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `registers an adopted starter without duplicating project rows` fails on omitting the existing starter from Project Documents or adding a duplicate on reinstall.
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `preserves indexed equivalents and warns about unsafe registration paths` fails on inserting a redundant default topic, reading outside the repository, or overwriting ambiguous index text.
    - `.bkit/core/engine/audits/templates/templates.test.ts` `resolves documentation references against the correct ownership sources` fails on a dangling managed link or an audit still expecting the old shared docs.
    - `.bkit/core/engine/audits/templates/template-path-refs.test.ts` `allows qualified project document reads and rejects mandatory template dependencies` fails on rejection of the qualified read, acceptance of an unconditional project-doc read, or acceptance of a hard dependency on an executable or configuration template.

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Responsibility guidance, warnings and verification

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Review every instruction responsibility and apply the consultation contract.
  - **READ:** `docs/technology.md`: use the declared runtime and host versions.
  - **READ:** `docs/security.md`: preserve the boundaries for missing or untrusted evidence.
  - **READ:** `docs/testing.md`: preserve the test selection rules.
  - **READ:** `.bkit/core/.bkit/workflows.md`: enumerate current phases, branches and output contracts.
  - **READ:** `.bkit/core/.bkit/prompts.md`: enumerate all shipped phase, audit and utility prompts.
  - **UPDATE:** `.bkit/core/.agents/rules.md`: give applicable rules named guidance and the shared warning behavior.
  - **UPDATE:** `.bkit/instructions.md`: change shared wording at its canonical source after checking each touched file with `pnpm instructions:show --file`.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-generate.md`: record actual sources and gaps and required task reads.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-convert.md`: carry the same contract into issue-to-plan conversion.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-update.md`: preserve source evidence and update it when a review changes the plan.
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: apply the consultation contract without relying on a plan.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: capture attributed warnings for design, including runs without a plan.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: pass attributed warnings and consultation evidence through review and summary.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: support converted plans and warnings from applicable tasks.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: capture warnings on no-plan and handover paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: retain doc maintenance findings in the ship summary.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: forward delegated warning output without duplicating it.
  - Review every remaining shipped prompt identified by the inventory and update each source whose responsibility needs an added or corrected consultation reference.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: add explicit topic applicability, source and gap fields and task propagation.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: record each rule, workflow-step and plan-section responsibility reviewed, with its recommended paths and why, or its not-applicable reason.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: record each prompt responsibility reviewed with the same fields.
  - Give each warning producer the exact Documentation Warnings section and filled record specified in Architecture & Component Changes.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** The coverage records enumerate the full source responsibility inventory, including entries that originally had no doc citation. Each entry records added, retained, corrected or not-applicable with evidence. Sources add missing named references and correct inappropriate ones. Generated and converted plans carry actual sources, coverage, gaps and required runbook reads and updates. No-plan design, debug and audit paths handle missing docs and preserve relevant safeguards. Read every source file carrying changed artifact fields and trace callers across generate, convert, apply, review, resume and remediation.
  - **TEST FIRST:** n/a — instruction and template editing. The shipped contract is checked by the same group's source audit.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Make documentation maintenance and audits report adoption and project content gaps.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-documentation.md`: review relevant expected documents even when absent from the index.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: report unresolved coverage alongside edits and existing results.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-documentation.md`: report missing, unindexed, starter-only and undercovered project topics with evidence.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-adoption.md`: replace the former shared-doc ownership probes with adoption and content checks.
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** Presence, index accuracy and population checks appear in the execution instructions and report schema. Missing docs and incomplete content remain visible in results and prevent a false clean report. Utilities populate only within authorized scope and available evidence. Reports distinguish absence, incomplete coverage, and an irrelevant topic.
  - **TEST FIRST:** n/a — instruction and template editing. The shipped contract is checked by the same group's source audit.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Add actionable project documentation advisories.
  - **READ:** `docs/observability.md`: follow advisory checklist and migration findings conventions.
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: detect file and index states using the shared topic resolver.
  - **UPDATE:** `.bkit/core/engine/checks/after/index.ts`: integrate detection, rendering and existing suppression.
  - Use the legacy starter baselines from Task 1 for comparison. Keep check and doctor read-only with respect to project docs and their index.
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** Findings distinguish missing index or docs, empty files, unchanged or placeholder-only starters, recognized legacy starters, and usable candidates at default or equivalent paths. Unpopulated and ambiguous findings name the gap, alternative evidence and adoption or repair action. Findings never make install, upgrade, check or doctor fail on optional-document grounds. Existing suppression controls work and a populated candidate does not claim semantic completeness. Unit tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `distinguishes missing and empty project documentation from populated candidates` fails on the detector omitting required gaps or warning for a populated candidate.
    - `.bkit/core/engine/checks/after/tools.test.ts` `recognizes current and migrated untouched starters` fails on treating generated text or placeholder-only content as substantive project guidance.
    - `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` fails on reporting absence for a valid alternative or consulting an out-of-tree target.
    - `.bkit/core/engine/checks/after/index.test.ts` `reports and suppresses project documentation advisories without a blocker` fails on warnings bypassing the shared rendering and suppression pipeline or becoming blockers.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Consolidate run warnings and verify the shipped source contracts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: aggregate structured findings from attributed current-run files by topic and gap.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: supply the active run and its attributed files through summary and handover using Task 3's warning record contract.
  - **UPDATE:** `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`: audit responsibility coverage, applicability and output contracts using the relocated starter inventory from Task 2.
  - **CREATE:** `.bkit/core/engine/commands/workflow/workflows.integration.test.ts`: exercise artifact selection and summary output at the command and filesystem boundary.
  - Follow the existing summary and progress test fixtures to write two runs and their attributed report files, raw input with a warning-shaped section and a reference to a missing optional artifact. Invoke the real `bkit workflows summary` command through the registered dispatcher and read its summary from disk. Append a subsequent run with the unresolved gap and verify it appears again. If handover selects files through a distinct route, invoke its real command against the same fixture and assert on the warning content in its handover result.
  - **DEPENDS ON:** 3, 4, 5
  - **DONE WHEN:** The same gap from several agents appears once in the visible run warnings with retained evidence. Distinct gaps and unresolved gaps on subsequent runs remain visible. Untrusted inputs and previous run files are outside the aggregation source set. Output stays advisory and works with absent optional artifacts. The source audits verify the required named topics, no-plan paths, generated/converted output and maintenance/audit coverage. Unit and integration tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `consolidates documentation warnings from the active run without changing its verdict` fails on duplicate or missing warnings, a changed verdict, or untrusted and older content surfacing as a current gap.
    - `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` `reports only attributed documentation warnings for the active run` fails on a missing active warning, a duplicate, a stale or raw-input warning, a failure from a missing optional artifact, a changed verdict, or suppression of the same unresolved gap in a later run.
    - `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `covers the full documentation responsibility inventory` fails on missing sources, coverage records, applicability reasons, or required named references.
    - `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `ships documentation warning contracts for plan and no-plan paths` fails on missing source and warning fields, skipped maintenance coverage, or accidental managed starters.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Refresh rendered outputs and dogfood the packaged CLI.
  - **READ:** `docs/architecture.md`: verify the installer contract in a fresh and legacy scratch repo.
  - **UPDATE:** `docs/architecture.md`: describe the copy, reconciliation and migration boundaries.
  - **UPDATE:** `docs/observability.md`: document CLI advisories and phase warning summaries.
  - **UPDATE:** `docs/testing.md`: document lifecycle coverage.
  - **UPDATE:** `README.md`: list project documentation adoption in the package overview.
  - **UPDATE:** `DETAILS.md`: align product ownership and advice.
  - **UPDATE:** `dist/cli.js`: rebuild the engine distribution, including its imported modules, and refresh rendered mirrors through the bkit generator.
  - **DEPENDS ON:** 2, 3, 4, 5, 6
  - **DONE WHEN:** The source contract and the scratch consumer matrix pass with the built CLI. Host renderings for Claude, Codex, Cursor, OpenCode and Antigravity preserve the contract. The dogfood index keeps its project entries. Managed and shipped-template drift checks remain accurate, and already-adopted documents, even untouched ones, survive template refresh and uninstall. Record commands, exit codes, and actual ownership and advisory outputs.
  - **TEST FIRST:** n/a — generated artifacts and CLI smoke. The source audit tests belong to the tasks that change their contracts and run before the relevant group's code.

<!-- bkit:task 7 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** Every new file has a reuse reason and production consumer.
- [ ] **Extensions landed:** Each existing implementation carries the extension described in Reuse Inventory.
- [ ] **No gate weakened:** Verify project safety gates and core-managed drift detection remain in force.
- [ ] **Red before code:** Record each planned red or existing updated test before the group's code.
- [ ] **Tests unchanged:** Preserve the assertions recorded on red.
- [ ] **Unproven tests:** Resolve a missing red only through a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** Verify the above checks.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Match each test row to its runbook task.
- [ ] **Sweep existing tests:** Update the old shared-path assumptions and run the affected suites.
- [ ] **Sweep new tests:** Run every named test.
- [ ] **Verify observability:** Inspect the advisory checklist and current-run warning summary.
- [ ] **Update documentation:** Verify every Documentation Updates row.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Verify every Documentation Updates row.
- [ ] **Docs index accurate:** Check both the managed core list and preserved Project Documents entries.
- [ ] **Gate 3 — Verified:** Verify the above checks.

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** Run `pnpm bkit:gate:static-unit-integration` and `pnpm bkit check` after regeneration. If the existing managed-version restamp test times out, record the observed failure and how it affects verification. Preserve the timeout and assertions.
- [ ] **Source and host synchronization:** Run the affected instruction and template audits. Run `pnpm bkit:generate` and inspect host render results and committed `dist/`. Confirm the authoritative drift check rather than raw source-to-mirror equality.
- [ ] **Build configuration:** Keep Vitest-only files out of the production output through the existing compiler setup.
- [ ] **Unit:** Run the advisory, summary and source reference tests named in the Derived Test Matrix. Run the existing managed-block parser and writer suites alongside the migration fixtures.
- [ ] **Integration:** Run the real install/upgrade/uninstall fixtures and invoke check within the legacy lifecycle fixture. Run the real summary dispatch test against its two-run scratch fixture.
- [ ] **Packaged CLI smoke:** Run `pnpm build`. Use the built binary at `dist/cli.js` by its absolute path from each disposable Git repo under `tmp/`. In a fresh scratch repo with a minimal `package.json`, run `node "$bkit_cli" install --codex --tracker=none`, then `node "$bkit_cli" check` and `node "$bkit_cli" doctor`. Verify the ten marker-free template copies, absence of automatically created project docs, and advisory output without optional-doc failure. Copy and register a starter, add a populated equivalent at a different path, and rerun check. Verify the starter-only warning and absence of a false missing-default warning. Seed an independently installed legacy fixture with wrapped edited documents, an existing index row, an omitted document, one ambiguous wrapper, and prior canonical hashes. Run `node "$bkit_cli" upgrade --auto-apply` twice, then check, then `node "$bkit_cli" uninstall`. Inspect exact retained contents, warnings, hashes and index rows after each boundary, and confirm uninstall removes still-owned templates but preserves the project copies.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Record test and smoke evidence, including actual files, output and exit status.

### Manual Verification

> [!CAUTION]
> Owner-run acceptance checks are advisory.

- [ ] Follow the managed template guide to adopt a starter and record its index row. Ask for a plan touching that topic. Inspect the actual source, warning, alternative evidence and action in the result.
- [ ] Replace the starter with project-specific content, or register a populated equivalent, and repeat. Confirm the relevant warning is resolved and an irrelevant topic is not reported.
- [ ] Run the documentation audit on a scratch project with an absent or incomplete relevant document and confirm the report shows the gap and the next action.
