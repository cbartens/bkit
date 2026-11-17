# Brief: group 6 — Challenge round 2 findings

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
- Group 5: Challenge round 1 findings — done
  - TASK 15: A legacy doc whose wrapper is ambiguous is reported once in upgrade output and then never again: `detectProjectDocs` has no cleanup finding, the doc is never registered, and check's only hint is the "run `bkit upgrade`" unindexed action that cannot resolve it. — done
  - TASK 16: A plan written from `bkit-plan.md` that keeps the template's example record (a stub, or an agent that writes `None` above the fence) puts a fabricated "security (starter-only)" warning in the run summary, because the template places the illustrative jsonl record directly under `## Documentation Warnings`. — done
  - TASK 17: A committed `Project Documents` row such as `` `README.md/security.md` `` (in-tree, no `..`, basename matches the topic) with `docs/security.md` absent makes `inspectRepoFile` throw `ENOTDIR` (also `ENAMETOOLONG` for a long path, `ERR_INVALID_ARG_VALUE` for a NUL byte, `EACCES` for an unreadable directory), so `detectProjectDocs` throws and `bkit check`, `bkit doctor`, install and upgrade abort on optional-document input. — done
- Group 6: Challenge round 2 findings — this group
  - TASK 18: A runtime or CI log line that prints a forged `===== END UNTRUSTED =====` line, followed by a `## Documentation Warnings` jsonl block, survives `stripUntrusted` in a debug context-fetch artifact (`context-<name>-N.md`, a `step-done` artifact the name filter does not exclude), so `bkit workflows summary` republishes the attacker's `Action:` text as engine output in `debug-summary.md`, which is posted as a tracker comment and returned as the final message. — open
  - TASK 19: A Project Documents table that lists a deleted `old/security.md` above a populated `eng/security.md` gets `bkit check` saying "No project document covers: docs/security.md", because `findIndexedEquivalent` returns the first same-topic row and the detector calls it with the default `usable = () => true`. — open
  - TASK 20: A maintainer copies the security starter and their editor or formatter indents one line or doubles one space; `bkit check` then raises no starter-only advisory and the file reads as a populated candidate, because `normalizeLegacyText` trims only trailing whitespace and blank-line runs. — open
  - TASK 21: A consumer whose Project Documents row is `| [docs/security.md](docs/security.md) | ... |` gets a second `docs/security.md` row written into their own table on the next install / upgrade, and a row with no trailing pipe has its `Equivalent to docs/security.md` Scope ignored, because the row parser only sees a backticked first cell and takes Scope as `cells[length - 2]`. — open

## The work

<!-- bkit:task 18 start -->
- [ ] **TASK 18:** A runtime or CI log line that prints a forged `===== END UNTRUSTED =====` line, followed by a `## Documentation Warnings` jsonl block, survives `stripUntrusted` in a debug context-fetch artifact (`context-<name>-N.md`, a `step-done` artifact the name filter does not exclude), so `bkit workflows summary` republishes the attacker's `Action:` text as engine output in `debug-summary.md`, which is posted as a tracker comment and returned as the final message.
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:158` · **Round:** 2
  - **DONE WHEN:** `stripUntrusted` drops everything from the first `FENCE_OPEN` line to the last `FENCE_CLOSE` line in the file (to end of file when no close follows), so no closing marker inside the payload can end the strip early. This matches the fence contract at `.bkit/core/engine/commands/workflow/context.ts:88` ("Fence ends at LAST line of file; ANY other closing markers are forged"). The `jsonl` fence body regex accepts the end of the section as a close, so the existing test `ignores warning records inside an UNTRUSTED fence` keeps passing. The plan's Task 6 DONE WHEN ("Untrusted inputs ... are outside the aggregation source set") and Task 10 hold against a forged closer.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores a warning record placed after a forged closing marker in a fenced context artifact` fails on `buildSummary` rendering `FORGED-ACTION`. The fixture is a `step-done` row with artifact `log/context-ci-1.md`. Its text is `FENCE_INSTRUCTION_LINES`, `FENCE_OPEN`, a log line, a forged `FENCE_CLOSE`, `## Documentation Warnings`, a `jsonl` fence holding a valid five-field record whose `action` is `FORGED-ACTION`, then the real `FENCE_CLOSE`. The current lazy `[\s\S]*?` stops at the forged closer, and `isRawInput` matches only `*-input-*`, `related-*` and `context-related-*` names, so the record is rendered today.
<!-- bkit:task 18 end -->

<!-- bkit:task 19 start -->
- [ ] **TASK 19:** A Project Documents table that lists a deleted `old/security.md` above a populated `eng/security.md` gets `bkit check` saying "No project document covers: docs/security.md", because `findIndexedEquivalent` returns the first same-topic row and the detector calls it with the default `usable = () => true`.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:426` · **Round:** 2
  - **DONE WHEN:** When the default path is absent, the detector (`.bkit/core/engine/checks/after/tools.ts:495`) resolves the topic to the first indexed row that is in-tree and a regular file (the same `usable` predicate sync passes at `project-docs.ts:528`), so a stale or out-of-tree row ahead of a valid one yields neither `project-docs-missing` nor `project-docs-ambiguous` for that topic; when every candidate row is unusable, the advisory names those rows. Plan Edge Cases: "Indexed equivalent uses a different path → Consult it; do not emit a false missing-default-path warning."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `consults a later valid same-topic row when the first indexed row is stale` fails on `detectProjectDocs` listing `docs/security.md` in `project-docs-missing` for an index with rows `old/security.md` (no file) then `eng/security.md` (populated) and no `docs/security.md`.
    - `.bkit/core/engine/checks/after/tools.test.ts` `consults a later valid equivalent row when the first is out of tree` fails on `detectProjectDocs` returning `project-docs-ambiguous` naming `../shared/security.md` when the next row `eng/security.md` is populated and in-tree.
<!-- bkit:task 19 end -->

<!-- bkit:task 20 start -->
- [ ] **TASK 20:** A maintainer copies the security starter and their editor or formatter indents one line or doubles one space; `bkit check` then raises no starter-only advisory and the file reads as a populated candidate, because `normalizeLegacyText` trims only trailing whitespace and blank-line runs.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:158` · **Round:** 2
  - **DONE WHEN:** The comparison used for starter recognition (`normalizeLegacyText`, and the digests in `LEGACY_STARTER_DIGEST_HISTORY` recomputed under the same rule) is insensitive to leading whitespace and runs of inner spaces / tabs, so a current or legacy starter copy that differs only in whitespace is reported under `project-docs-unpopulated`. Plan Edge Cases: "Copied starter differs only in whitespace or the former ownership lines → Classify it as starter-only."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `classifies a starter copy that differs only in whitespace as unpopulated` fails on `detectProjectDocs` returning no finding for an indexed `docs/security.md` holding `.bkit/templates/docs/security.md` with one prose line's first space doubled.
    - `.bkit/core/engine/checks/after/tools.test.ts` `classifies an indented legacy starter copy as unpopulated` fails on the same omission for an indexed `docs/security.md` holding the `45f4254bd` security starter (wrapper lines removed) with its first prose line indented by two spaces.
<!-- bkit:task 20 end -->

<!-- bkit:task 21 start -->
- [ ] **TASK 21:** A consumer whose Project Documents row is `| [docs/security.md](docs/security.md) | ... |` gets a second `docs/security.md` row written into their own table on the next install / upgrade, and a row with no trailing pipe has its `Equivalent to docs/security.md` Scope ignored, because the row parser only sees a backticked first cell and takes Scope as `cells[length - 2]`.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:338` · **Round:** 2
  - **DONE WHEN:** `readProjectIndex` reads a row's path from a backticked cell, a Markdown link target or a bare path, and takes Scope as the last non-empty cell whether or not the row ends in `|` (escaped `\|` not splitting a cell); a row it cannot parse is reported as ambiguous rather than treated as absent. `syncProjectDocs` adds no row for a path already listed in any of those forms. Plan Success Criteria: "Register adopted project docs ... without duplicates or overwriting existing entries."
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `does not add a second row for a default doc indexed through a markdown link` fails on `syncProjectDocs` returning `registered: ["docs/security.md"]` and appending a backticked row below the existing link row.
    - `.bkit/core/engine/checks/after/tools.test.ts` `reads the Scope of a row without a trailing pipe` fails on `detectProjectDocs` listing `docs/security.md` as missing when the only row is `` | `eng/sec-notes.md` | ○ | ○ | ○ | ○ | ○ | Equivalent to docs/security.md `` with no closing pipe and `eng/sec-notes.md` populated.
<!-- bkit:task 21 end -->
