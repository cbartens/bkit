# Brief: group 5 — Challenge round 1 findings (tests)

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
- Group 3: Repair the blocked advisory test — done
  - TASK 9: Make the indexed-equivalent advisory test observe file reads in a way the test tool allows. — done
- Group 4: Challenge round 1 findings — done
  - TASK 10: A public issue whose body holds a `## Documentation Warnings` jsonl block becomes a bkit-authored "Action:" line in the run summary, because `related-issues.md` (raw tracker text) is aggregated as a trusted step artifact. — done
  - TASK 11: A consumer on the latest release (v6.1.1) with an untouched legacy `docs/security.md` or `docs/deployments.md`, or any consumer whose default branch is not `main`, gets no starter-only advisory: the digests come from unreleased revision `45f4254bd`, so the file reads as a populated "candidate". — done
  - TASK 12: A v5.x (or older) consumer upgrading straight to this release keeps `<!-- bkit:managed v5.x — PolyForm ... — do not edit; run \`bkit upgrade\` to refresh -->`inside a now project-owned doc, because the notice regex only matches the 6.x wording. — done
  - TASK 13: When `docs` is a regular file (or a doc / the index is unreadable or read-only), `syncProjectDocs` throws ENOTDIR / EACCES and aborts `bkit upgrade` after the managed writes but before `.bkit/version` is refreshed; `bkit check` / `doctor` crash the same way in `detectProjectDocs`. — done
  - TASK 14: `bkit check` tells the user to "run `bkit upgrade` to register" a present `docs/<topic>.md`, but upgrade silently skips it whenever any indexed row shares the basename or says `Equivalent to` (even a stale row for a deleted file), so the advisory repeats forever. — done
- Group 5: Challenge round 1 findings — this group
  - TASK 15: A legacy doc whose wrapper is ambiguous is reported once in upgrade output and then never again: `detectProjectDocs` has no cleanup finding, the doc is never registered, and check's only hint is the "run `bkit upgrade`" unindexed action that cannot resolve it. — open
  - TASK 16: A plan written from `bkit-plan.md` that keeps the template's example record (a stub, or an agent that writes `None` above the fence) puts a fabricated "security (starter-only)" warning in the run summary, because the template places the illustrative jsonl record directly under `## Documentation Warnings`. — open
  - TASK 17: A committed `Project Documents` row such as `` `README.md/security.md` `` (in-tree, no `..`, basename matches the topic) with `docs/security.md` absent makes `inspectRepoFile` throw `ENOTDIR` (also `ENAMETOOLONG` for a long path, `ERR_INVALID_ARG_VALUE` for a NUL byte, `EACCES` for an unreadable directory), so `detectProjectDocs` throws and `bkit check`, `bkit doctor`, install and upgrade abort on optional-document input. — open

## The work

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** A legacy doc whose wrapper is ambiguous is reported once in upgrade output and then never again: `detectProjectDocs` has no cleanup finding, the doc is never registered, and check's only hint is the "run `bkit upgrade`" unindexed action that cannot resolve it.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:456` · **Round:** 1
  - **DONE WHEN:** `detectProjectDocs` runs `stripManagedWrapper` read-only on each present target and emits a suppressible advisory (for example `project-docs-cleanup`) naming the path and the `WrapperProblem` with the by-hand fix, on every check / doctor run, not only at upgrade time. Plan Architecture § Consultation: "Return advisory findings for ... unresolved cleanup".
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports an ambiguous legacy wrapper left in a project document` fails on no finding naming `docs/security.md` and its lone `bkit:start` marker.

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** A plan written from `bkit-plan.md` that keeps the template's example record (a stub, or an agent that writes `None` above the fence) puts a fabricated "security (starter-only)" warning in the run summary, because the template places the illustrative jsonl record directly under `## Documentation Warnings`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/docs/templates/bkit-plan.md:194` · **Round:** 1
  - **DONE WHEN:** The unfilled template yields no aggregated record: the example sits inside the bracketed instruction (removed on fill) or the summary skips a record byte-equal to the template example, and a section reading `None` / `PENDING` contributes nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a plan built from the unfilled bkit-plan.md template yields no documentation warning` fails on the summary containing `**security** (starter-only)` when a step-done artifact holds the text of `.bkit/core/docs/templates/bkit-plan.md` with its bracket replaced by `None`.

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** A committed `Project Documents` row such as `` `README.md/security.md` `` (in-tree, no `..`, basename matches the topic) with `docs/security.md` absent makes `inspectRepoFile` throw `ENOTDIR` (also `ENAMETOOLONG` for a long path, `ERR_INVALID_ARG_VALUE` for a NUL byte, `EACCES` for an unreadable directory), so `detectProjectDocs` throws and `bkit check`, `bkit doctor`, install and upgrade abort on optional-document input.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:510` · **Round:** 1
  - **DONE WHEN:** `inspectRepoFile` (`.bkit/core/engine/install/project-docs.ts:190`) returns `{ unsafe: <reason> }` instead of throwing for any `lstatSync` / `realpathSync` error other than not-found, and `isInTreePath` rejects paths containing NUL or other control characters. A malformed or hostile index row yields a `project-docs-ambiguous` advisory and `runPostInstallCheck` completes, matching the plan's "Findings never make install, upgrade, check or doctor fail on optional-document grounds."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports an index row through a regular file as ambiguous instead of throwing` fails on `detectProjectDocs(tmpDir)` throwing `ENOTDIR` for a fixture whose `.agents/docs.md` Project Documents table lists `` `README.md/security.md` `` while `README.md` is a regular file and `docs/security.md` is absent.
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports a NUL-byte index path as ambiguous instead of throwing` fails on `detectProjectDocs(tmpDir)` throwing `ERR_INVALID_ARG_VALUE` for a row `` `docs/a<NUL>/security.md` `` with `docs/security.md` absent.

<!-- bkit:task 17 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Adoption advisories distinguish missing, zero-content, unchanged starters, populated and indexed equivalent docs; remain non-blocking and respect existing advisory controls | Unit | `.bkit/core/engine/checks/after/tools.test.ts`, `.bkit/core/engine/checks/after/index.test.ts` | 5 |
| An indexed equivalent raises no missing-default warning and no read leaves the project tree, observed without spying on the `node:fs` module namespace | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 9 |
| Repeated reports merge by topic and gap within one run, and a subsequent run can report an unresolved gap | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 6 |
| excludes raw tracker text in related-issues.md from documentation warnings | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 10 |
| ignores warning records inside an UNTRUSTED fence | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 10 |
| recognizes the v6.1.1 untouched security starter as unpopulated | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 11 |
| recognizes a legacy deployments starter rendered with default branch dev | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 11 |
| returns an advisory instead of throwing when docs is a regular file | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 13 |
| does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 14 |
| reports an ambiguous legacy wrapper left in a project document | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 15 |
| a plan built from the unfilled bkit-plan.md template yields no documentation warning | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 16 |
| reports an index row through a regular file as ambiguous instead of throwing | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 17 |
| reports a NUL-byte index path as ambiguous instead of throwing | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 17 |
