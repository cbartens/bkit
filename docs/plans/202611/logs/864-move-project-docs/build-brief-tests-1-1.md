# Brief: group 1 — Template ownership and index registration (tests)

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

- Group 1: Template ownership and index registration — this group
  - TASK 1: Move the project documentation starters and migrate legacy ownership. — open
  - TASK 2: Register adopted documents and verify their new ownership before the group gate. — open
- Group 2: Responsibility guidance, warnings and verification — next
  - TASK 3: Review every instruction responsibility and apply the consultation contract. — open
  - TASK 4: Make documentation maintenance and audits report adoption and project content gaps. — open
  - TASK 5: Add actionable project documentation advisories. — open
  - TASK 6: Consolidate run warnings and verify the shipped source contracts. — open
  - TASK 7: Refresh rendered outputs and dogfood the packaged CLI. — open

## The work

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

- [ ] **TASK 2:** Register adopted documents and verify their new ownership before the group gate.
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

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fresh installation ships all ten templates without managed markers or creating managed project docs; legacy migration removes only ownership metadata, preserves edits inside/outside blocks and index entries, is idempotent, handles missing/malformed markers safely and leaves still-managed files unchanged; later install/upgrade/check/uninstall preserve project ownership | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 1 |
| Explicit adoption registers the starter immediately, preserves existing equivalent entries and handles retries and unsafe paths | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 2 |
| Ownership audits resolve relocated starter paths and the managed destinations of operational guidance | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 2 |
| The template-path guard accepts a named project-document read with applicability, equivalents and warning-and-continue behavior, and rejects a mandatory document read and hard dependencies on executable or configuration templates | Unit | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | 2 |
