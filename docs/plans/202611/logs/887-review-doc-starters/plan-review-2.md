Verdict: CONCERNS
Failures: 1
Redesign: false
Fingerprint: d2dffbf4528ef135530ee04a71da8ad84764dc50dee0089506101fc2e33fe92b
<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

Scope: `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md` (Tasks 1-13, groups 1-4), read against `plan-input-2.md` (owner answers 1 and 2, 2026-11-14), `related-deferrals.md`, `related-failures.md`, `related-knowledge.md` and the current worktree code.

Notes:

- No design artifact exists for 887 (`docs/plans/202611/887-*-design.md` absent; the input names none), so the design-coverage step does not apply.
- `docs/testing.md` is present; matrix `Type` values (Unit, Integration) are tiers from § Which tier does a behaviour need? (lines 279-296).
- `related-knowledge.md` and `related-failures.md` are too large to read whole; they were searched by key and by touched path, so knowledge evidence is incomplete.
- Plan caps checked: group 4 holds 4 tasks and 19 `TEST FIRST` tests (Task 10: 8, Task 11: 1, Task 12: 10); Task 12 is exactly at the 10-test, 3-file per-task cap.
- `bkit:gate:static` (`package.json:59`) runs typecheck, lint, format, prose lint and slop delta, not `bkit check`, so the expected `.bkit/authoring.md` / `.bkit/templates.md` mirror drift from Task 1 to Task 13 (plan line 275) does not red a group gate. No unit test reads those root mirrors; `gateguard-dogfood.integration.test.ts:107` and `templates-content.test.ts:815` read the sources.

## Surface-Area Map

- **Task 1:** `.bkit/core/.bkit/authoring.md` § Docs rules, § Doc Templates headline, § Docs scope line, § Which Sections Apply `docs/*.md` row; `.bkit/instructions.md:27`. Consumers: the GateGuard dogfood advisory reads § Docs `- **Lead:**` bullets and § Which Sections Apply at hook time (`.bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts:119-148`, `:281-286`); `DOC_PATTERNS` in `.claude/hooks/bkit-gateguard.cjs:527` already routes `.bkit/templates/docs/*.md` as a doc, so the new scope line matches hook behaviour; root mirror `.bkit/authoring.md` (Task 13). Risk: shared agent-read rules (every Docs-route advisory grows).
- **Task 2:** `.bkit/core/.bkit/templates.md` new `## Project docs — adoption order`, line 16, § Project documents — starters and the index. Consumers: Task 3 `starterShape` parses the chart; the Task 10 tip `steps` pointer is checked by `catalogue.test.ts:152-170` (reads `getCoreRoot()` headings with `startsWith`); `templates-content.test.ts:815` and `manifest.test.ts:410` read the same file; `shipped-docs-refs.test.ts`.
- **Task 3:** `.bkit/templates/docs/components.md`; `docs/components.md:1-13`; the `dogfood-templates.test.ts:590` anchor `> Example document.` becomes `> Starter document.`; new `starterShape` in `.bkit/core/engine/install/project-docs.test.ts`. Consumers: dogfood parity (`dogfood-templates.test.ts:483-600`, the span `# Components` to `## Repository purpose` must stay byte-equal); the `.agents/docs.md` register row.
- **Tasks 4-8:** eight starters in `.bkit/templates/docs/`; `TOPIC_INFO[topic].scope` (`.bkit/core/engine/install/project-docs.ts:44-91`); `UNAUDITED_DOC_SECTIONS` (`.bkit/core/engine/audits/templates/templates.test.ts:111-116`); `dist/`. Consumers: `projectDocRow` feeds the rows `syncProjectDocs` inserts into a consumer's `.agents/docs.md` (no test pins the old Scope strings; grep finds them only in `project-docs.ts` and bkit's own `.agents/docs.md`); audit anchors in `.bkit/core/docs/templates/bkit-audit-*.md` (`unresolvedBkitDocAnchors`, `uncoveredBkitDocSections`); `readStarterText` (`.bkit/core/engine/checks/after/tools.ts:442-448`) compares project copies with the package starter, and `LEGACY_STARTER_DIGEST_HISTORY` (`project-docs.ts:192-262`) covers only released `.bkit/shared/docs/` texts. Risk: public type export (`TOPIC_INFO` via `projectDocRow`) and shipped starter text that `detectProjectDocs` reads.
- **Task 7:** `.bkit/templates/docs/testing.md` (lane graph to Mermaid, slot/practice markers, `## Test first`); `sectionMarks` helper. Consumers: gates / flakes / ci-performance / testing audit anchors (§ CI test tiers (the bkit scaffold)); no engine test reads the starter's lane graph.
- **Task 9:** `.bkit/templates/docs/capabilities.md` opener. Consumer: `dogfood-templates.test.ts` (`generated`). Low risk.
- **Task 10:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts` (new `project-docs` entry whose `fires` calls `detectProjectDocs`); `DETAILS.md`. Consumers: `isTipSilenced` / `dropTipSilencedAdvisories` (`.bkit/core/engine/checks/tips/index.ts:138-156`), applied to all after-phase findings at `.bkit/core/engine/checks/after/index.ts:531`; the existing ignore test `.bkit/core/engine/checks/after/index.test.ts:1022-1058`; catalogue id and ordering tests (`catalogue.test.ts:102-150`). Risk: shared utility (advisory silencing) and a wider `bkit.advisories.ignore` effect.
- **Task 11:** `detectProjectDocs` action text for `project-docs-missing` / `-empty` / `-unpopulated` (`tools.ts:569-592`). Consumers: `tools.test.ts` `describe("detectProjectDocs")`; `docs/observability.md:216-222` (ids only). Low risk.
- **Task 12:** the `listIndexedEquivalents` regex (`.bkit/core/engine/install/project-docs.ts:457`); new export `adoptedProjectDocPath`; `formatTemplateChanges(changes, cwd?)` (`.bkit/core/engine/install/template-copies.ts:127`); the `runUpgradeCommand` call (`.bkit/core/engine/commands/install/upgrade.ts:819`); `docs/architecture.md`. Consumers: `findIndexedEquivalent` (`project-docs.ts:447`) feeds `detectProjectDocs` (`tools.ts:500`, `:501`, `:541`) and `syncProjectDocs` (`project-docs.ts:553-561`); `formatTemplateChanges` has one production caller (`upgrade.ts:819`) and four test calls (`template-copies.integration.test.ts:175-203`), all without `cwd`, so the optional parameter is backwards compatible. Risk: a shared matcher with three callers, and a public signature shimmed by an optional parameter.
- **Task 13:** the `docs/testing.md` lane graph (fenced box-drawing characters at lines 38-53) becomes Mermaid; four `.agents/docs.md` rows; the `.bkit/authoring.md` and `.bkit/templates.md` mirrors refreshed via upgrade. Consumers: `bkit check` mirror drift; no engine test parses the bkit lane graph (grep for `CI test tiers` in `*.test.ts` finds none); `docs/testing.md` is the only top-level `docs/*.md` with fenced box-drawing characters, so the Task 13 DONE WHEN check is passable.

High-risk surfaces flagged: the `listIndexedEquivalents` shared matcher (Task 12, CRITICAL below); `SETUP_TIPS` plus tip silencing (Task 10, covered by matrix rows 118-129, OPTIONAL items below); `TOPIC_INFO` / `projectDocRow` (Tasks 4-8, covered by the `starter shape` rows, which assert the register row equals `projectDocRow(topic)`); the `formatTemplateChanges` signature and the `adoptedProjectDocPath` export (Task 12, covered by rows 122-136); `.bkit/core/.bkit/authoring.md` § Docs as GateGuard advisory input (Task 1, OPTIONAL below).

## CRITICAL

1. **(plan edit) The stricter equivalence match changes `detectProjectDocs` and `syncProjectDocs`, and no matrix row tests either change.** Task 12 changes `listIndexedEquivalents` (`.bkit/core/engine/install/project-docs.ts:457`, today a regex for `equivalent to docs/{topic}.md` with no negation guard and no end anchor). Breaking Changes (plan lines 151-154) says this changes two more callers: `detectProjectDocs` (`.bkit/core/engine/checks/after/tools.ts:500-501`, `:541`) will report `project-docs-missing` and drop the `project-docs-ambiguous` candidate for a "Not equivalent to `docs/{topic}.md`", `docs/{topic}.mdx` or `docs/{topic}.md.bak` row; and `syncProjectDocs` (`project-docs.ts:553-561`) will register a present `docs/{topic}.md` despite such a row. The only matrix row on the new match is row 133, which checks the upgrade-report marker in `template-copies.integration.test.ts`. Task 12's DONE WHEN names the existing `describe("syncProjectDocs")` and `describe("detectProjectDocs")` blocks, but plan line 154 says every existing row is affirmative. Those blocks pass whether or not the two callers change, so a regression in either caller (for example, `detectProjectDocs` keeping its own loose check) would go unseen. Manual Verification Step 4 checks it by hand only.
   - Fix: add two `Derived Test Matrix` rows.
     - Unit, `.bkit/core/engine/checks/after/tools.test.ts`: "a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing".
     - Unit, `.bkit/core/engine/install/project-docs.test.ts`: "syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row".
   - Both fail on today's code, because the regex at `project-docs.ts:457` matches the negated and `.mdx` rows.
   - Task 12 is already at the 10-test, 3-file cap. Move the `listIndexedEquivalents` UPDATE and these two tests into their own task (or into Task 11, which has 1 test in `tools.test.ts`) and make Task 12 depend on it. Group 4 then holds 5 tasks and 21 `TEST FIRST` tests, inside the 5 / 25 caps.

## OPTIONAL

- **Task 1 DONE WHEN, GateGuard advisory parse:** name `.bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts`. It parses § Docs `- **Lead:** text` bullets (`:119-136`) and asserts § Which Sections Apply rows equal the hook's routes (`:281-286`). Task 1 adds § Docs rules and edits the `docs/*.md` row. If the edit keeps the row's last cell and writes each rule as one `- **Lead:**` line, the test stays green; a new row, or rule text split across unindented lines, would red it. Each rule added to § Docs also lengthens every Docs-route advisory on every host (`.agents/**`, `.bkit/*.md`, `docs/*.md` edits), so keep the new bullets terse.
- **Task 10 DONE WHEN, existing ignore test:** name `.bkit/core/engine/checks/after/index.test.ts:1022-1058`. The silenced tip's `dropTipSilencedAdvisories` runs on all after-phase findings (`.bkit/core/engine/checks/after/index.ts:531`). That test covers the ignore entry end to end and stays green only because it uses `arrayContaining` / `toContainEqual`.
- **Task 10 silent-case tests:** the two "stays silent" tests should look the tip up by id and assert it is defined before checking `fires`. That way they fail today because the tip is missing, not because of an incidental `undefined` access.
- **Task 10 "unchanged starter copy" fixture:** copy the real `.bkit/templates/docs/{topic}.md`, because `readStarterText` compares against the package starter first (`.bkit/core/engine/checks/after/tools.ts:443-446`). A hand-written "starter" reads as a candidate and the tip would not fire.
- **Task 12 spawned upgrade test timeout:** set an explicit test-level timeout (`}, 180_000)`, as the other spawned cases in `upgrade.integration.test.ts` do). The `requireTsx` spawn waits up to 60_000 ms, and the `install-upgrade-integration-tests-flake-on-default-5s-timeout` failure row (CLOSED) came from that gap.
- **Legacy digest assumption (plan line 182):** nothing enforces "ships in the same release as #864". If v6.2 ships without #887, an untouched copy of today's `.bkit/templates/docs/` starter reads as a candidate once the starter text changes, because `LEGACY_STARTER_DIGEST_HISTORY` (`project-docs.ts:192-262`) covers only `.bkit/shared/docs/` releases. Consider a release-time check, or record today's digests now.
- **Task 1 instructions store:** after the `.bkit/instructions.md:27` edit, also run `instructions-coverage.test.ts` and `instructions-sources.test.ts`, as the ACTIVE knowledge row `instructions-store-clause-text-and-local-entries-need-hand-edits` advises.

## OUT OF SCOPE

- Audit templates that read "every rule and section" of security, logs and accessibility will treat the new project slots as bkit rules. The plan already defers this to a follow-up issue (plan line 257).
- A follow-up tip that names the next doc in the adoption order once one wave is filled.
- `.bkit/instructions.md:9879` still says the plan template "holds shape only". That still holds for plan and audit templates; a wording pass could tie it to the reworded § Doc Templates headline.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** (plan edit) Stricter listIndexedEquivalents changes detectProjectDocs and syncProjectDocs with no matrix row testing either
  **Severity:** CRITICAL · **Class:** test-coverage-gap · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:151` · **Round:** 1
  - **DONE WHEN:** The Derived Test Matrix has a Unit row in .bkit/core/engine/checks/after/tools.test.ts ('a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing') and a Unit row in .bkit/core/engine/install/project-docs.test.ts ('syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row'); the listIndexedEquivalents UPDATE (ruling .bkit/core/engine/install/project-docs.ts:457) and both tests sit in one task within the 10-test / 3-file cap (a new task or Task 11), and Task 12 depends on it.
  - **TEST FIRST:**
    - .bkit/core/engine/checks/after/tools.test.ts a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing
    - .bkit/core/engine/install/project-docs.test.ts syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
<!-- bkit:task 1 end -->
