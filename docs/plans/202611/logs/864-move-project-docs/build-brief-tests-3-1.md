# Brief: group 3 — Repair the blocked advisory test (tests)

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
- Group 2: Responsibility guidance, warnings and verification — done
  - TASK 3: Review every instruction responsibility and apply the consultation contract. — done
  - TASK 4: Make documentation maintenance and audits report adoption and project content gaps. — done
  - TASK 5: Add actionable project documentation advisories. — done
  - TASK 6: Consolidate run warnings and verify the shipped source contracts. — done
  - TASK 7: Refresh rendered outputs and dogfood the packaged CLI. — done
- Group 3: Repair the blocked advisory test — this group
  - TASK 9: Make the indexed-equivalent advisory test observe file reads in a way the test tool allows. — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Make the indexed-equivalent advisory test observe file reads in a way the test tool allows.
  - **READ:** `.bkit/core/engine/checks/after/tools.test.ts`: the test `resolves an indexed equivalent without a missing default warning` calls `vi.spyOn(fs, "readFileSync")` on its own `import * as fs from "node:fs"` namespace, which vitest rejects ("Module namespace is not configurable in ESM") before the detector runs.
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.test.ts`: rewrite how that one test watches file reads (for example `vi.mock("node:fs", ...)` with a pass-through wrapper) and keep every assertion it makes: an indexed equivalent raises no missing-default warning and no read leaves the project tree. Make the same change to any other test in the file that spies on the `node:fs` namespace.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `resolves an indexed equivalent without a missing default warning` passes and still asserts the equivalent is resolved with no missing-default finding and no out-of-tree read. No source file changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace` fails on a missing-default warning for a valid indexed equivalent, or on a read outside the project tree.

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 5 (group 2, done): Add actionable project documentation advisories. — `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Adoption advisories distinguish missing, zero-content, unchanged starters, populated and indexed equivalent docs; remain non-blocking and respect existing advisory controls | Unit | `.bkit/core/engine/checks/after/tools.test.ts`, `.bkit/core/engine/checks/after/index.test.ts` | 5 |
| An indexed equivalent raises no missing-default warning and no read leaves the project tree, observed without spying on the `node:fs` module namespace | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 9 |
