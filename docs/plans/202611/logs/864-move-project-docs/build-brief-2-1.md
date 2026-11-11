# Brief: group 2 — Responsibility guidance, warnings and verification

Plan: Move project docs to templates with adoption warnings Implementation Plan

## Why and what

### Context & Goals

The installer currently owns project guidance alongside its operating instructions. Give project teams ownership of their guidance while keeping enough evidence visible for bkit to carry out a task safely. Treat a document path as a recommendation and record the source the agent actually used.

**Related Issues:**

- [#863 — Ship a purpose-based components document template](https://github.com/cbartens/bkit/issues/863) (open in the related issue search).
- [#354 — Plan template doc stack-agnostic refactor](https://github.com/cbartens/bkit/issues/354) (state unverified in plan input).

The related-failure report retained one of eight matching rows. Its retained row is closed. The report gives partial historical context, so use the source ledger for any specific overlap that affects verification.

### Narrative

Move project documentation from bkit-managed content to copy-and-own templates while actively encouraging consumers to adopt and populate it. Keep explicit, task-relevant document references in rules, prompts and the plan template. Missing or unpopulated documentation must produce visible, non-blocking warnings rather than broken workflows or silent skips.

### Success Criteria

- [ ] Move all ten current `.bkit/shared/docs/` files to `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise and setup. Install/upgrade refresh template copies; adopted project docs are consumer-owned and preserved. Keep essential bkit operating instructions current in managed guides/rules so they do not depend on optional adoption.
- [ ] Complete a responsibility-by-responsibility review of all shared rules, workflows, prompts and the plan template, including those with no existing doc references. Determine which `docs/*.md` files each should consult, add missing named references and correct inappropriate ones, with explicit applicability and warning-and-continue behavior. Record the reviewed responsibility, recommended doc paths and reason or not-applicable outcome so completeness can be checked. Merely adjusting existing mentions does not satisfy this criterion. Support design, audits and debug without a plan, build's issue-to-plan conversion and generated plans.
- [ ] Ship `.agents/docs.md` with only absolute core operational references inside `bkit:start/end`. Register adopted project docs in the consumer-owned Project Documents section when starters are copied into `docs/`, without duplicates or overwriting existing entries. An indexed but untouched starter still generates warnings.
- [ ] Add actionable, non-blocking adoption/population advisories through the existing advisory system. Accept indexed equivalent documents and distinguish missing, empty/template-only and populated documents. Use agent assessment for substantive coverage; do not claim semantic completeness from a mechanical check.
- [ ] Update documentation maintenance utility prompts, ship documentation updates and documentation audit templates to check presence, index accuracy and project content explicitly. Report absence and incomplete coverage; populate within authorized scope and evidence. Missing files cannot be silently skipped or yield a false clean/completion report.

### Out of Scope

None. The issue's non-goals are acceptance boundaries. Warnings remain advisory, project facts require evidence, reads are scoped by applicability, and the ledger and existing gate contracts stay in force.

## Where it fits

- Group 1: Template ownership and index registration — done
  - TASK 1: Move the project documentation starters and migrate legacy ownership. — done
  - TASK 2: Register adopted documents and verify their new ownership before the group gate. — done
  - TASK 8: Narrow the second-upgrade idempotency check to the files the migration owns. — done
- Group 2: Responsibility guidance, warnings and verification — this group
  - TASK 3: Review every instruction responsibility and apply the consultation contract. — open
  - TASK 4: Make documentation maintenance and audits report adoption and project content gaps. — open
  - TASK 5: Add actionable project documentation advisories. — open
  - TASK 6: Consolidate run warnings and verify the shipped source contracts. — open
  - TASK 7: Refresh rendered outputs and dogfood the packaged CLI. — open

## The work

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

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Move the project documentation starters and migrate legacy ownership. — `.bkit/templates/docs/architecture.md`, `.bkit/templates/docs/technology.md`, `.bkit/templates/docs/security.md`, `.bkit/templates/docs/data-schema.md`, `.bkit/templates/docs/testing.md`, `.bkit/templates/docs/deployments.md`, `.bkit/templates/docs/observability.md`, `.bkit/templates/docs/design.md`, `.bkit/templates/docs/noise.md`, `.bkit/templates/docs/setup.md`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/index.ts`, `.bkit/core/engine/install/managed-block.ts`, `.bkit/core/engine/commands/install/install.ts`, `.bkit/core/engine/commands/install/upgrade.ts`, `.bkit/core/engine/commands/install/uninstall.ts`, `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/checks/after/managed.ts`, `.bkit/core/.agents/docs.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/install.md`, `docs/migrations.md`, `.bkit/shared/docs/architecture.md`, `.bkit/shared/docs/technology.md`, `.bkit/shared/docs/security.md`, `.bkit/shared/docs/data-schema.md`, `.bkit/shared/docs/testing.md`, `.bkit/shared/docs/deployments.md`, `.bkit/shared/docs/observability.md`, `.bkit/shared/docs/design.md`, `.bkit/shared/docs/noise.md`, `.bkit/shared/docs/setup.md`
- TASK 2 (group 1, done): Register adopted documents and verify their new ownership before the group gate. — `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/commands/install/install.ts`, `.bkit/core/engine/commands/install/upgrade.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/install.md`, `.bkit/core/.bkit/README.md`, `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/rules-sync.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/template-path-refs.test.ts`, `package.json`, `dist/cli.js`

Reuse Inventory rows left out: 7; Architecture entries left out: 0 — read them in docs/plans/202611/864-move-project-docs-plan.md § Reuse Inventory and § Architecture & Component Changes.
