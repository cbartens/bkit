Verdict: CONCERNS
Failures: 3
Redesign: false
Fingerprint: 0f1d85002ca948c825a31d0400bd4a9a65e88e77d1f0732cafe6db29cca7ac31
<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

Scope: `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md`, against `plan-input-2.md` (session prompt with the owner's answers of 2026-11-14, then the issue body and comments), `plan-generate-check.md` (Problems 0, Existence 0, so no plan-check finding to carry), `related-issues.md`, `related-deferrals.md` and `related-failures.md`.

Notes:

- Docs loaded: `.agents/docs.md`, `docs/templates/bkit-plan.md`; `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are present and the plan's Documentation Consultation cites their sections. `related-issues.md` and `related-failures.md` were read in part (the tool truncated them); the parts read hold nothing that changes these findings.
- Every section `docs/templates/bkit-plan.md` mandates is present and filled.
- Success Criteria match the issue word for word; the 23 issue matrix rows and 9 issue edge-case rows are carried word for word; the matrix header is `Test description | Type | Target file | Task` and every row names one task that lands its test.
- Every runbook task has scope lines and a `DONE WHEN`; group and task caps hold (largest: Task 12 with 10 tests across 3 files; Group 4 with 19 tests).
- Every `Reuse Inventory` row has a search and an `EXTEND` decision naming its file; there is no `[NEW]` file and no `CREATE` line.
- All 13 `Ledger rows` keys exist: the 7 `887-*` rows in `docs/decisions.jsonl` (lines 823-829) and the 6 in `docs/deferrals.jsonl` (lines 347-352), one per `Out of Scope` row; every `Out of Scope` row is `Exempt` with a reason and a home.
- No task edits text inside a `bkit:start` / `bkit:end` block: the `.agents/docs.md` edit is in `Project Documents` below `bkit:end`, and the `.bkit/authoring.md` / `.bkit/templates.md` mirrors are refreshed by `upgrade`, not edited by hand.

## CRITICAL

1. **(plan edit) Task 9 neither builds nor verifies the capabilities parts that Success Criteria 1 and 3 require.** `plan-v1-draft.md:669-675`. Success Criterion 3 says "Each starter's **Fill these first** line matches" the adoption order, and the chart has `DEP --> CAP`. Task 9 gives capabilities "prerequisites (code exists, the graphify templates adopted …)" and no Fill these first line. Success Criterion 1 says "A unit test fails when any starter lacks a part, or when its given row's Scope differs from its Purpose line". The only capabilities test, `capabilities names rollup and refresh and when to run each`, checks the two commands. Nothing fails when the capabilities register row, its Scope, the `Generated document.` opener or the completion checks are missing. Fix: add the Fill these first line to Task 9, and add one matrix row plus a Task 9 TEST FIRST entry asserting those parts.
2. **(plan edit) The shared starter-shape check tests less than Success Criterion 1 asks.** `plan-v1-draft.md:558`. The criterion requires "a `##` skeleton with bracketed fields and one `[e.g., …]` row per table". `starterShape(topic)` asserts only "at least one `[e.g.,` row" and does not check bracketed fields. It also does not check the skeleton headings each task names, such as technology's `## Stack` and `## Not used`, or deployments' `## Rollback`. Each of Tasks 4-8 has only the shape test as its verification, so a starter missing a named slot, or a second table with no example row, still passes. Fix: check one `[e.g.,` row per project-slot table (noise: the header-only table), check that bracketed fields are present, and pass each topic's skeleton heading list into its `starter shape: {topic}` case.
3. **(plan edit) Open Question 2's default leaves Success Criterion 5 unmet for components.** `plan-v1-draft.md:197-200`, Task 12 at line 724. The criterion reads "The `bkit upgrade` 'Templates updated' report marks each changed doc starter whose project copy exists as adopted". The Narrative counts `components.md` among the twelve doc starters. With `Default if unanswered: A`, a changed `.bkit/templates/docs/components.md` whose `docs/components.md` exists gets a plain `changed:` line. Work the request needs is in scope even when in doubt (`.agents/rules.md` § Finish over deferrals). Fix: make B, the recommended option, the default, add components to Task 12 with one assertion in `changed doc starter with a project copy is marked adopted`, or cite the source that limits the criterion to the ten `PROJECT_DOC_TOPICS`.

## OPTIONAL

1. **The Narrative is a cut-down copy of the issue's.** `plan-v1-draft.md:36-38`. It copies the issue's first two paragraphs word for word, then drops the third ("The per-starter detail … this body wins.") and the decisions list of 2026-11-13. It is also far longer than the 1-2 user-side sentences the template asks for. Pick one: copy the issue Narrative whole, or flag the length conflict for the owner. Do not keep a partial copy.
2. **No required dogfood run.** `.agents/rules.md` § Verify before complete requires `pnpm build` → `node dist/cli.js <verb>` on a fresh scratch consumer before work is called done. The plan's scratch-project steps sit only under Manual Verification, which says "An unticked box blocks nothing". Consider an Automated Tests item, or a Task 13 `DONE WHEN`, that runs `node dist/cli.js check`, `tips` and `upgrade` on a scratch consumer, since Tasks 10-12 change what those commands print.
3. **A contradiction stays in a file Task 1 edits.** Task 1 rewords `.bkit/instructions.md:27` to drop "shape-only", but the § Template Instructions body (`.bkit/instructions.md:9879`, "The plan template holds shape only") keeps the old claim. It is listed only under Suggested Scope Expansion. Folding it into Task 1 keeps the file consistent.
4. **The box-drawing checks disagree.** Task 7's check looks for `▼`, `▲`, `┌` and `┐`, but Task 13's `DONE WHEN` names only `▼`, `┌` and `┐`. Use one character set in both, and consider `└` and `┘` too, so a half-converted lane graph cannot pass Task 13.
5. **The search for a Mermaid parser is not recorded.** The starter-shape row's `Search performed` lists `grep -rln 'templates/docs'`. The new check also parses the adoption-order Mermaid chart's solid and dotted arrows, but the row records no search for an existing Mermaid-edge parser, for example in the graphify or capabilities tests. Add that search, or note that nothing was found.
6. **A cycle in the chart can confuse the arrow-parsing test.** The added `DATA -.-> SEC` arrow plus `SEC --> DATA` gives data-schema and security a two-way link. The starter-shape check should take only the arrow kind into the topic's node, so security's Fill these first stays `docs/architecture.md` and data-schema's Finish against stays `none`. Spelling out those two expected values in Task 3 or Task 6 would pin the rule.

## OUT OF SCOPE

1. `readStarterText` reads a consumer starter with no symlink or containment check (`864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-ts-440` / `-441`). It sits next to Task 11's edit but is a different defect.
2. The ci-yml advisory action text at `.bkit/core/engine/checks/after/tools.ts:304` carries the same stale "promote after the capstone" fact that Task 8 removes from `TOPIC_INFO.deployments`.
3. The graphify rollup writes "Box colour…" guidance into `docs/capabilities.md`, which the new no-colour Mermaid rule forbids (`.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`).
4. The security, logs and accessibility audit templates read "every rule and section" of their doc, so the new project slots and a header-only noise table would read as bkit rules.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** (plan edit) Task 9 neither builds nor verifies the capabilities parts Success Criteria 1 and 3 require
  **Severity:** CRITICAL · **Class:** missing-verification · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:669` · **Round:** 1
  - **DONE WHEN:** Task 9 UPDATE gives `.bkit/templates/docs/capabilities.md` a **Fill these first** line equal to the solid-arrow sources into CAP in `.bkit/core/.bkit/templates.md` § Project docs — adoption order (`docs/deployments.md`), and Task 9 TEST FIRST plus a new Derived Test Matrix row (Task 9) assert the `Generated document.` opener, that Fill these first line, the register row and its Scope equal to the capabilities Purpose line, and the completion checks, so a capabilities starter missing any of them fails a unit test.
  - **TEST FIRST:**
    - .bkit/core/engine/install/project-docs.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** (plan edit) The shared starter-shape check under-tests Success Criterion 1: 'at least one [e.g., row' instead of one per table, no bracketed-field check, and no check of each task's named skeleton headings
  **Severity:** CRITICAL · **Class:** weak-verification · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:558` · **Round:** 1
  - **DONE WHEN:** Task 3's `starterShape(topic)` asserts that every table in a project-slot section (every table, outside `testing` and `deployments`) has an `[e.g.,` row (noise: the header-only table instead), that the skeleton holds bracketed fields, and that each topic's skeleton headings named in its task (Tasks 3-8) are present; each `starter shape: {topic}` case passes that topic's heading list, so a starter missing a slot heading or a table's example row fails.
  - **TEST FIRST:**
    - .bkit/core/engine/install/project-docs.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** (plan edit) Open Question 2's default A leaves Success Criterion 5 unmet for components: a changed components starter with an adopted docs/components.md gets no adopted marker
  **Severity:** CRITICAL · **Class:** scope-gap · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:197` · **Round:** 1
  - **DONE WHEN:** Open Question 2's `Default if unanswered` is B (the recommended option), Task 12's UPDATE of `formatTemplateChanges` marks a changed `.bkit/templates/docs/components.md` whose `docs/components.md` is a safe regular file, and `changed doc starter with a project copy is marked adopted` asserts the components line too; or the plan cites the source that limits 'each changed doc starter' to the ten `PROJECT_DOC_TOPICS`.
  - **TEST FIRST:**
    - .bkit/core/engine/install/template-copies.integration.test.ts
<!-- bkit:task 3 end -->
