Verdict: CONCERNS
Failures: 16
Redesign: false
Fingerprint: 2c8d6038158011fcad60b5c32ba306dd398bf934a83439bf54fd277e73041f30
<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

Scope: `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md` against `docs/templates/bkit-plan.md`, the issue text in `plan-input-1.md` (body, the 2026-11-10 doc review, the 2026-11-13 decisions and the #917 note), `plan-generate-check.md`, `related-deferrals.md` and `related-failures.md`. `related-issues.md` says "Search unavailable." Parallel run: no other agent's output was read.

Notes:

- Every section the template mandates is present and filled. Gates 1 to 4, the Ledger rows line, the Rollback line and the Manual Verification block are in place.
- Success Criteria and Edge Cases rows 1-9 are the issue's text word for word. The Derived Test Matrix keeps all 23 issue rows word for word, adds the `Task` column and one row, and every row names one task.
- Every task has a scope (`UPDATE`) and a `DONE WHEN`; every group stays within 5 tasks and 25 tests; no task goes over 10 tests or 3 test files.
- No task edits inside a `bkit:start` / `bkit:end` block: the `.agents/docs.md` edits are in `Project Documents` below `bkit:end`, the `.bkit/authoring.md` and `.bkit/templates.md` changes are made in `.bkit/core/.bkit/` and re-rendered.
- Every Reuse Inventory row is `EXTEND` and has a search recorded and a matching `[MODIFY]` and task. No task creates a file, so no `NEW` row is needed.
- Every Out of Scope row is genuinely exempt: no Success Criterion, scenario line or matrix row needs it.
- Docs read: `.agents/docs.md`, `docs/templates/bkit-plan.md`, and the section lists of `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Code checked: `.bkit/templates/docs/*.md` (which starters have `## Project facts to record`), `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts:111-116`, and the text-rule comment in `.bkit/core/engine/checks/tips/catalogue.ts:14-18`.

## CRITICAL

1. (plan edit) `plan-v1-draft.md:435` — plan-check `format`: TASK 1: READ is neither `symbol` in `file`: what nor `file`: what.
2. (plan edit) `plan-v1-draft.md:463` — plan-check `format`: TASK 3: READ is neither `symbol` in `file`: what nor `file`: what.
3. (plan edit) `plan-v1-draft.md:478` — plan-check `format`: TASK 4: UPDATE is neither `symbol` in `file`: what nor `file`: what.
4. (plan edit) `plan-v1-draft.md:494` — plan-check `format`: TASK 5: UPDATE is neither `symbol` in `file`: what nor `file`: what.
5. (plan edit) `plan-v1-draft.md:516` — plan-check `format`: TASK 6: UPDATE is neither `symbol` in `file`: what nor `file`: what.
6. (plan edit) `plan-v1-draft.md:517` — plan-check `format`: TASK 6: READ is neither `symbol` in `file`: what nor `file`: what.
7. (plan edit) `plan-v1-draft.md:535` — plan-check `format`: TASK 7: READ is neither `symbol` in `file`: what nor `file`: what.
8. (plan edit) `plan-v1-draft.md:550` — plan-check `format`: TASK 8: UPDATE is neither `symbol` in `file`: what nor `file`: what.
9. (plan edit) `plan-v1-draft.md:567` — plan-check `format`: TASK 9: READ is neither `symbol` in `file`: what nor `file`: what.
10. (plan edit) `plan-v1-draft.md:629` — plan-check `format`: TASK 13: UPDATE is neither `symbol` in `file`: what nor `file`: what.
11. (plan edit) `plan-v1-draft.md:394` — Missing build task: `## Project facts to record` is in eight starters, not six. `.bkit/templates/docs/security.md` and `.bkit/templates/docs/observability.md` have it too. The Supersession Inventory row and Breaking Changes (line 136) say "six starters", and Task 6 (line 514-518) never removes the section, so after Task 6 those two starters keep the old list next to the new skeleton, which the Success Criterion "a `##` skeleton with bracketed fields" does not allow. The six-entry `UNAUDITED_DOC_SECTIONS` list (`templates.test.ts:112`) is why the count was missed: security and observability are covered by audit anchors instead. Fix: say "eight" in both places, and add to Task 6 the removal of `## Project facts to record` from both starters, with `DONE WHEN` saying no starter in `.bkit/templates/docs/` has that heading.
12. (plan edit) `plan-v1-draft.md:65` — The Acceptance Scenario's upgrade-report marker is vague: it appears with three different wordings. The Process Sketch (line 52) and the issue have "adopted — review your copy", the Concrete Example (line 65) has `changed: docs/architecture.md — adopted, review your copy`, and Architecture (line 361) and Task 12 (line 612) have "— adopted at {path}, review your copy". The owner confirms one string and the build tests another. Fix: pick one exact wording (with or without `{path}`) and use it in the Process Sketch, Concrete Example, Breaking Changes, Architecture, Task 12 and Manual Verification Step 3.
13. (plan edit) `plan-v1-draft.md:620` — Task 12's verification step cannot fail first. `changed doc starter with no copy and changed non-doc template are not marked` asserts that no marker appears, and today's code prints no marker, so the test passes before any code is written and the red step refuses it. Fix: put an adopted starter in the same fixture and assert that its line is marked while the other two are not, so the test fails on the missing "review your copy" marker. Or move the negative check into one of the two positive tests.
14. (plan edit) `plan-v1-draft.md:307` — Out of Scope and the ledgers: the six `Exempt` rows (lines 194-199) have no `docs/deferrals.jsonl` rows, and `**Ledger rows:** None` contradicts the five decisions the plan makes and that Documentation Updates (line 405) says go into `docs/decisions.jsonl`. The note at line 309 names the proposed keys but writes none. Fix: write the six deferral rows (`reason` `scope-declared`) and the five decision rows, and list every key on the `**Ledger rows:**` line.
15. (plan edit) `plan-v1-draft.md:588` — Scope item with no verification step: Task 10 adds a project-docs row to `DETAILS.md` § Templates ready to adopt (line 585), but its `DONE WHEN` checks only the tip tests. The text rule in `catalogue.ts:14-18` is a comment, and no test enforces it. Fix: add to `DONE WHEN` that `DETAILS.md` § Templates ready to adopt has a project-docs row whose benefit matches the tip's `line` and the `.bkit/templates.md` § Project docs — adoption order opener.
16. (plan edit) `plan-v1-draft.md:631` — Scope items with no verification step in Task 13: the four `.agents/docs.md` rows (line 628) and the `docs/testing.md` § Project documentation lifecycle coverage update (line 627). `node dist/cli.js check` reports no drift for `Project Documents`, because it sits below `bkit:end` and belongs to the project, so the stated `DONE WHEN` does not cover the rows. Fix: add that each of the four rows equals `projectDocRow(topic)` for its topic, and that § Project documentation lifecycle coverage names the starter-shape, tip and upgrade-report test files.

## OPTIONAL

- `plan-v1-draft.md:111-118` — The Derived Test Matrix covers only some of the behaviours the plan promises. (a) Success Criterion 5 says the tip fires "exactly when" any of three advisories does, but only the missing case is tested; the empty and unpopulated cases (Edge Case "A starter copied to `docs/` unchanged") have no row. (b) The plan's own Edge Cases for Task 12 (symlink, directory or out-of-tree equivalent not marked; `.agents/docs.md` missing or unreadable during upgrade) have no row. (c) The new exported `adoptedProjectDocPath` has no unit row of its own. Add a row and a `TEST FIRST` entry for each, within Task 10's and Task 12's caps.
- `plan-v1-draft.md:436` — Task 1's `DONE WHEN` "§ Doc Templates no longer reads as 'no instructions in a template'" cannot be checked in the codebase. Name the exact headline text it ends with, or the sentence that must be gone.
- `plan-v1-draft.md:631` — Task 13's "no ASCII flow diagram remains in `docs/*.md`" has no stated check. Name it, for example no box-drawing arrow characters (`▼`, `│`, `┌`) outside fenced directory trees, the same check the testing starter test uses.
- `plan-v1-draft.md:669` — The Verification Plan says "thirteen" cases in `project-docs.test.ts`, but the matrix has 16 rows targeting that file.
- `plan-v1-draft.md:224` — Project Context: `docs/decisions.jsonl` and `docs/knowledge.jsonl` were not read for project-doc rows. Read them before plan-update, so an earlier decision on the starters or the index rows is not contradicted.
- `plan-v1-draft.md:161-164` — Open Question 2: the default (A) differs from the recommendation (B). With A, a changed `components.md` starter goes unmarked in the upgrade report, yet the Concrete Example and Task 3 make components the model starter. Say in the question what the adopter of `docs/components.md` sees under A.

## OUT OF SCOPE

- Task 12 builds `adoptedProjectDocPath` on `findIndexedEquivalent`, so it inherits two open LOW deferrals from #864: `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` (a row saying "Not equivalent to docs/security.md" or naming `docs/security.mdx` counts as an equivalent, so the upgrade report would mark it adopted) and `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-303` (with two same-named indexed rows only the first is used). Consider adding both to `Suggested Scope Expansion` so the owner can decide whether to fold them in.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** plan-check format: TASK 1 READ
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:435` · **Round:** 1
  - **DONE WHEN:** TASK 1: READ line is in the form `symbol` in `file`: what or `file`: what (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** plan-check format: TASK 3 READ
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:463` · **Round:** 1
  - **DONE WHEN:** TASK 3: READ line is in the form `symbol` in `file`: what or `file`: what (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** plan-check format: TASK 4 UPDATE
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:478` · **Round:** 1
  - **DONE WHEN:** TASK 4: UPDATE line is in the form `symbol` in `file`: what or `file`: what, one symbol per line (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** plan-check format: TASK 5 UPDATE
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:494` · **Round:** 1
  - **DONE WHEN:** TASK 5: UPDATE line is in the form `symbol` in `file`: what or `file`: what, one symbol per line (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** plan-check format: TASK 6 UPDATE
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:516` · **Round:** 1
  - **DONE WHEN:** TASK 6: UPDATE line is in the form `symbol` in `file`: what or `file`: what, one symbol per line (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** plan-check format: TASK 6 READ
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:517` · **Round:** 1
  - **DONE WHEN:** TASK 6: READ line is in the form `symbol` in `file`: what or `file`: what (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** plan-check format: TASK 7 READ
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:535` · **Round:** 1
  - **DONE WHEN:** TASK 7: READ line is in the form `symbol` in `file`: what or `file`: what (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** plan-check format: TASK 8 UPDATE
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:550` · **Round:** 1
  - **DONE WHEN:** TASK 8: UPDATE line is in the form `symbol` in `file`: what or `file`: what, one symbol per line (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** plan-check format: TASK 9 READ
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:567` · **Round:** 1
  - **DONE WHEN:** TASK 9: READ line is in the form `symbol` in `file`: what or `file`: what (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** plan-check format: TASK 13 UPDATE
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:629` · **Round:** 1
  - **DONE WHEN:** TASK 13: UPDATE line is split into one `file`: what line per file (plan-check format finding cleared).
  - **TEST FIRST:**
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Project facts to record is in eight starters, security and observability are never cleaned
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:394` · **Round:** 1
  - **DONE WHEN:** Supersession Inventory and Breaking Changes say eight starters; Task 6 removes `## Project facts to record` from `.bkit/templates/docs/security.md` and `.bkit/templates/docs/observability.md`, and its DONE WHEN says no starter in `.bkit/templates/docs/` has that heading.
  - **TEST FIRST:**
<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** Upgrade-report marker has three different wordings
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:65` · **Round:** 1
  - **DONE WHEN:** One exact marker string is used in the Process Sketch, Concrete Example, Breaking Changes, Architecture, Task 12 and Manual Verification Step 3.
  - **TEST FIRST:**
<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** Task 12 negative test passes before any code is written
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:620` · **Round:** 1
  - **DONE WHEN:** The no-copy / non-doc test also asserts an adopted starter in the same fixture is marked, so it fails on today's code on the missing "review your copy" marker; or the negative check is folded into a positive test.
  - **TEST FIRST:**
    - .bkit/core/engine/install/template-copies.integration.test.ts
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** Exempt rows have no deferral rows; Ledger rows None contradicts five decisions
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:307` · **Round:** 1
  - **DONE WHEN:** Six `scope-declared` deferral rows and five decision rows are written, and every key is listed on the `**Ledger rows:**` line.
  - **TEST FIRST:**
<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** DETAILS.md row has no verification step
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:588` · **Round:** 1
  - **DONE WHEN:** Task 10 DONE WHEN says `DETAILS.md` § Templates ready to adopt has a project-docs row whose benefit matches the tip and the `.bkit/templates.md` § Project docs — adoption order opener.
  - **TEST FIRST:**
<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->
- [ ] **TASK 16:** Task 13 index rows and lifecycle-coverage update have no verification step
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:631` · **Round:** 1
  - **DONE WHEN:** Task 13 DONE WHEN says the four `.agents/docs.md` rows equal `projectDocRow(topic)` and `docs/testing.md` § Project documentation lifecycle coverage names the starter-shape, tip and upgrade-report test files.
  - **TEST FIRST:**
<!-- bkit:task 16 end -->
