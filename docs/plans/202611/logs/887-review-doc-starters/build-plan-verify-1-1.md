Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 58cefd81ff17bfb452f95bb87bf82d7a37dd18eeb5680bd6acd6399fefa38dc4
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged Tasks 1 and 2 against `build-diff-1-1.md` (commit `9861d639f`). No `Deviations` section in the brief; no decision records, earlier verify reports or remediation logs exist for group 1.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven; both tasks are `TEST FIRST: n/a — docs`.
- Gates run: `pnpm bkit:lint:prose` passed (0 errors; the warnings in the changed files sit on unchanged lines); `tsx .bkit/core/engine/tools/instructions.ts` (sync check) exit 0; `instructions.test.ts`, `instructions-coverage.test.ts`, `instructions-sources.test.ts`, `gateguard-dogfood.integration.test.ts` and `shipped-docs-refs.test.ts` passed (5 files, 474 tests).
- TASK 1 met: Mermaid rule (unscoped, all sub-rules present), **Project-doc starters** bullet (scoped, Purpose / Not here / Update when / bkit practice), unchanged **Rules header** rule and § Which Sections Apply, § Docs scope line, reworded § Doc Templates headline with the starter sentence, `.bkit/instructions.md` row 27 and § Template Instructions opener. Not met: the scope of the remaining starter rules (gap 1).
- TASK 2 met: section heading, waves column, `DATA -.-> SEC`, `docs/idea.md` rule, line 16, the § Project documents link and the `.bkit/core/.agents/docs.md` note. Not met: chart ids, labels and arrows, the `Fill these first` column and the dotted-arrow notes (gap 2). Gap 2 blocks the Group 2 to 3 tests (Tasks 3, 8, 9) that parse this chart.
- Docs: `.agents/docs.md` loaded; `.bkit/authoring.md` rules applied through the hook text. `docs/testing.md` and `docs/observability.md` did not apply to this docs-only group.

## Identified Gaps Log

2 gaps.

- TASK 1: `.bkit/core/.bkit/authoring.md` § Docs (lines 255-264) — the starter-scoped rules (current state with no history, facts from code / config / approved spec, unknowns under `## Open questions`, write once and link, tables over prose, name the file that holds a value, `Not applicable: {reason}`) sit in three unscoped bullets (**Current facts only**, **Write once, link elsewhere**, **Empty state**) that cover every § Docs file (`.agents/**`, `.bkit/*.md`, `docs/*.md`); DONE WHEN needs the starter rules' lead to name `.bkit/templates/docs/*.md` as their scope, and the plan's Out of Scope row keeps every new rule but Mermaid off bkit's own docs. Scope those rules to the starters (under the **Project-doc starters** lead, or with the starter scope in each lead) — Fixable: true
- TASK 2: `.bkit/core/.bkit/templates.md` § Project docs — adoption order (lines 688-707) — the chart does not use the node ids, labels and arrows of the doc review § 2.2 (in `build-input-1.md`): ids `DESIGN` / `SETUP` / `DEPLOY` replace `DES` / `SET` / `DEP`, the `IDEA` label is `"docs/idea.md"` not `"idea.md"`, solid arrows `SEC --> DATA`, `TEST --> DEP`, `OBS --> DEP`, `DEP --> CAP` and dotted arrows `TECH -.-> DES`, `ARCH -.-> SET`, `SEC -.-> SET`, `SEC -.-> OBS`, `DATA -.-> DEP`, `DATA -.-> TEST` are missing, and `COMP --> ARCH`, `ARCH --> DATA`, `ARCH --> DEPLOY`, `COMP --> CAP`, `SETUP -.-> TEST`, `DEPLOY -.-> TEST`, `NOISE -.-> OBS` are not in § 2.2; the waves table's `Fill these first` column (lines 671-683) follows the wrong chart and contradicts the plan's own starter tasks (data-schema `docs/security.md`, capabilities `docs/deployments.md`, architecture `docs/technology.md`), and the dotted-arrow notes (lines 709-712) are not § 2.2's six notes plus data-schema → security. Redraw the chart as § 2.2 plus `DATA -.-> SEC`, list the solid-arrow sources in the table, and rewrite the notes from § 2.2 — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Starter-only writing rules apply to every Docs file
  **Severity:** MEDIUM · **Class:** scope · **Fixable:** true · **Location:** `.bkit/core/.bkit/authoring.md:255` · **Round:** 1
  - **DONE WHEN:** the starter rules lead names `.bkit/templates/docs/*.md` as their scope
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Adoption-order chart, table and notes do not match doc review § 2.2
  **Severity:** HIGH · **Class:** content · **Fixable:** true · **Location:** `.bkit/core/.bkit/templates.md:688` · **Round:** 1
  - **DONE WHEN:** the section exists with table, chart (node ids and labels as in § 2.2, so the Task 3 test can parse them, and the DATA -.-> SEC arrow)
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
