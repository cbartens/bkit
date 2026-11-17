# Brief: group 4 — Challenge round 1 findings

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
- Group 4: Challenge round 1 findings — this group
  - TASK 10: A public issue whose body holds a `## Documentation Warnings` jsonl block becomes a bkit-authored "Action:" line in the run summary, because `related-issues.md` (raw tracker text) is aggregated as a trusted step artifact. — open
  - TASK 11: A consumer on the latest release (v6.1.1) with an untouched legacy `docs/security.md` or `docs/deployments.md`, or any consumer whose default branch is not `main`, gets no starter-only advisory: the digests come from unreleased revision `45f4254bd`, so the file reads as a populated "candidate". — open
  - TASK 12: A v5.x (or older) consumer upgrading straight to this release keeps `<!-- bkit:managed v5.x — PolyForm ... — do not edit; run \`bkit upgrade\` to refresh -->`inside a now project-owned doc, because the notice regex only matches the 6.x wording. — open
  - TASK 13: When `docs` is a regular file (or a doc / the index is unreadable or read-only), `syncProjectDocs` throws ENOTDIR / EACCES and aborts `bkit upgrade` after the managed writes but before `.bkit/version` is refreshed; `bkit check` / `doctor` crash the same way in `detectProjectDocs`. — open
  - TASK 14: `bkit check` tells the user to "run `bkit upgrade` to register" a present `docs/<topic>.md`, but upgrade silently skips it whenever any indexed row shares the basename or says `Equivalent to` (even a stale row for a deleted file), so the advisory repeats forever. — open
- Group 5: Challenge round 1 findings — next
  - TASK 15: A legacy doc whose wrapper is ambiguous is reported once in upgrade output and then never again: `detectProjectDocs` has no cleanup finding, the doc is never registered, and check's only hint is the "run `bkit upgrade`" unindexed action that cannot resolve it. — open
  - TASK 16: A plan written from `bkit-plan.md` that keeps the template's example record (a stub, or an agent that writes `None` above the fence) puts a fabricated "security (starter-only)" warning in the run summary, because the template places the illustrative jsonl record directly under `## Documentation Warnings`. — open
  - TASK 17: A committed `Project Documents` row such as `` `README.md/security.md` `` (in-tree, no `..`, basename matches the topic) with `docs/security.md` absent makes `inspectRepoFile` throw `ENOTDIR` (also `ENAMETOOLONG` for a long path, `ERR_INVALID_ARG_VALUE` for a NUL byte, `EACCES` for an unreadable directory), so `detectProjectDocs` throws and `bkit check`, `bkit doctor`, install and upgrade abort on optional-document input. — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A public issue whose body holds a `## Documentation Warnings` jsonl block becomes a bkit-authored "Action:" line in the run summary, because `related-issues.md` (raw tracker text) is aggregated as a trusted step artifact.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:153` · **Round:** 1
  - **DONE WHEN:** `documentationWarnings` reads no record from raw external evidence: `related-issues.md`, `related-failures.md`, `related-deferrals.md` (the `plan-fetch-context` step-done artifacts that `.bkit/core/workflows/bkit-plan.md:310` fills with issue descriptions and human comments verbatim) and any text between `===== BEGIN UNTRUSTED =====` / `===== END UNTRUSTED =====` are excluded, alongside `*-input-*`. Cross-ref `docs/security.md` § Untrusted Content & Prompt Injection and the plan's Task 6 DONE WHEN ("Untrusted inputs ... are outside the aggregation source set").
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `excludes raw tracker text in related-issues.md from documentation warnings` fails on the summary listing a warning whose only source is a `## Documentation Warnings` jsonl record inside a `plan-fetch-context` step-done artifact `log/related-issues.md`.
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores warning records inside an UNTRUSTED fence` fails on a record between `===== BEGIN UNTRUSTED =====` and `===== END UNTRUSTED =====` in an agent report reaching the summary.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A consumer on the latest release (v6.1.1) with an untouched legacy `docs/security.md` or `docs/deployments.md`, or any consumer whose default branch is not `main`, gets no starter-only advisory: the digests come from unreleased revision `45f4254bd`, so the file reads as a populated "candidate".
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:160` · **Round:** 1
  - **DONE WHEN:** `LEGACY_STARTER_DIGESTS` holds, per topic, the normalized digest of every released shipped text (at least each tag that installed `.bkit/shared/docs/`, v6.1.1 included; `git diff v6.1.1 45f4254bd -- .bkit/shared/docs/security.md .bkit/shared/docs/deployments.md` shows real content changes from #893), and normalization makes the rendered `{{DEFAULT_BRANCH}}` value (testing.md x2, deployments.md x6) branch-agnostic. Plan Task 5 DONE WHEN "recognized legacy starters".
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `recognizes the v6.1.1 untouched security starter as unpopulated` fails on `detectProjectDocs` returning no `project-docs-unpopulated` finding for `docs/security.md` seeded with the v6.1.1 rendered text (markers plus notice).
    - `.bkit/core/engine/checks/after/tools.test.ts` `recognizes a legacy deployments starter rendered with default branch dev` fails on the same omission for a copy rendered with `dev` in place of `{{DEFAULT_BRANCH}}`.

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** A v5.x (or older) consumer upgrading straight to this release keeps `<!-- bkit:managed v5.x — PolyForm ... — do not edit; run \`bkit upgrade\` to refresh -->`inside a now project-owned doc, because the notice regex only matches the 6.x wording.
**Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:**`.bkit/core/engine/install/managed-block.ts:255` · **Round:** 1
  - **DONE WHEN:** `MANAGED_NOTICE_RE` (and `LEGACY_NOTICE_RE` at `.bkit/core/engine/install/project-docs.ts:131`) match every historically generated notice inside the wrapper: the v5 PolyForm-licensed form and the pre-#501 `do NOT edit` form, as well as the 6.x form. The migrated doc carries no `bkit:managed` line. Plan Edge Cases: "Remove ownership delimiters and generated managed notices".
  - **TEST FIRST:**
    - `.bkit/core/engine/install/managed-block.test.ts` `removes a v5 PolyForm-licensed notice with the wrapper` fails on `stripManagedWrapper` returning `removed` content that still contains the `bkit:managed v5.0.0 — PolyForm` line.
    - `.bkit/core/engine/install/managed-block.test.ts` `removes a pre-6.0 do NOT edit notice with the wrapper` fails on the `do NOT edit` notice surviving.

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** When `docs` is a regular file (or a doc / the index is unreadable or read-only), `syncProjectDocs` throws ENOTDIR / EACCES and aborts `bkit upgrade` after the managed writes but before `.bkit/version` is refreshed; `bkit check` / `doctor` crash the same way in `detectProjectDocs`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:373` · **Round:** 1
  - **DONE WHEN:** `inspectRepoFile`, the doc reads / writes and the index write in `syncProjectDocs` catch filesystem errors and record the path under `unsafe` (or `indexProblem`) with the reason; `upgrade.ts:1024` and `install.ts` always reach the version refresh and advisories; `detectProjectDocs` reports the path as `project-docs-ambiguous` instead of throwing. Verified: `fs.lstatSync("docs/architecture.md", { throwIfNoEntry: false })` throws `ENOTDIR` on Node v24.16.0 when `docs` is a file. Plan Task 5 DONE WHEN: "Findings never make install, upgrade, check or doctor fail on optional-document grounds".
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `reports instead of throwing when docs is a regular file` fails on `syncProjectDocs` throwing ENOTDIR.
    - `.bkit/core/engine/checks/after/tools.test.ts` `returns an advisory instead of throwing when docs is a regular file` fails on `detectProjectDocs` throwing ENOTDIR.

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** `bkit check` tells the user to "run `bkit upgrade` to register" a present `docs/<topic>.md`, but upgrade silently skips it whenever any indexed row shares the basename or says `Equivalent to` (even a stale row for a deleted file), so the advisory repeats forever.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** false · **Location:** `.bkit/core/engine/install/project-docs.ts:400` · **Round:** 1
  - **DONE WHEN:** The detector and sync agree: either sync registers a present default whose equivalent row is unusable (absent, out of tree, unsafe), and `logReport` prints the `equivalent` entries it skipped; or `detectProjectDocs` (`.bkit/core/engine/checks/after/tools.ts:527`, action at `:570`) reports a present default beside an indexed equivalent as two candidates with a hand-edit action instead of "run `bkit upgrade`". No advisory names an action the CLI will not perform.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent` fails on `detectProjectDocs` still returning `project-docs-unindexed` with the "run `bkit upgrade`" action after `syncProjectDocs` ran and added no row (index row `engineering/security.md`, populated `docs/security.md`).
    - `.bkit/core/engine/install/project-docs.test.ts` `registers a present default doc when its only equivalent row points at a missing file` fails on no row being added for `docs/security.md`.

<!-- bkit:task 14 end -->
