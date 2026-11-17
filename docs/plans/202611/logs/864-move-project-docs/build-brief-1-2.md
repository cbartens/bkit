# Brief: group 1 — Template ownership and index registration

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
  - TASK 1: Move the project documentation starters and migrate legacy ownership. — done
  - TASK 2: Register adopted documents and verify their new ownership before the group gate. — done
  - TASK 8: Narrow the second-upgrade idempotency check to the files the migration owns. — open
- Group 2: Responsibility guidance, warnings and verification — next
  - TASK 3: Review every instruction responsibility and apply the consultation contract. — open
  - TASK 4: Make documentation maintenance and audits report adoption and project content gaps. — open
  - TASK 5: Add actionable project documentation advisories. — open
  - TASK 6: Consolidate run warnings and verify the shipped source contracts. — open
  - TASK 7: Refresh rendered outputs and dogfood the packaged CLI. — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Narrow the second-upgrade idempotency check to the files the migration owns.
  - **READ:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: find the closing snapshot of `migrates legacy ownership without changing project text or core ownership`.
  - **READ:** `.bkit/core/engine/install/cloud-env.ts`: `renderCloudCacheBust` bumps the `# cache-bust` counter in `.claude/bkit-cloud.md` on every upgrade, by design.
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: make the closing "second run changes nothing" comparison skip `.claude/bkit-cloud.md` and `.bkit/advisories.md` (its `_Mode:` line differs between `check` and `upgrade`). Compare every other file.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `migrates legacy ownership without changing project text or core ownership` passes. Project docs, the doc index and `.bkit/version` are compared byte for byte between the two runs, and only `.claude/bkit-cloud.md` and `.bkit/advisories.md` are left out of the comparison. No source file changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `leaves project docs, the index and the version file unchanged when upgrade runs twice` fails on any project doc, index row or `.bkit/version` byte differing between the first and second upgrade.

<!-- bkit:task 8 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Verify refresh of the optional template payload | `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Serena symbol overview, `docs/capabilities.md` template-copies entry, `rg -l 'shared/docs' .bkit/core/engine` | `syncTemplateCopies` in `.bkit/core/engine/install/template-copies.ts` already mirrors the entire package template tree. | EXTEND | Extend the integration coverage in Task 1 to the ten project documents. Reuse the copy mechanism and its entry points as they are. |
