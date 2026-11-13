Verdict: CONCERNS
Failures: 4
Redesign: false
Fingerprint: c2abbf98c1346e9903c2ab7daa65f8706aa891ef62c07ba6f4c068587c5b5879
<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

Scope: `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md` against its source, the #887 change-shape issue in `plan-input-1.md` (body, the 2026-11-10 doc review comment it defers to for per-starter detail, and the 2026-11-13 comments). No design artifact exists: the issue was rewritten for `/bkit-plan` with no design run. The design-coverage steps (5 design part, 11) therefore have nothing to check; steps 5 (expansion, drift), 8-9, 12 and 13 ran against the issue. `related-issues.md` reads "Search unavailable."; `related-deferrals.md` and `related-failures.md` are truncated by the fetcher (rest not read).

## CRITICAL

1. **C1 — The Finish-against assertion contradicts the source's security detail (plan edit).** Task 3 (`plan-v1-draft.md:461`) has `starterShape(topic)` assert that **Fill these first** / **Finish against** equal the solid / dotted arrow sources into the topic's node in the Task 2 chart. Task 2 (`plan-v1-draft.md:444`) copies that chart from review § 2.2, which has no dotted arrow into `SEC`. The test then forces `security.md`'s **Finish against** to be empty. The per-starter source (review § 3.4, `plan-input-1.md:517`) sets security's **Finish against:** `docs/data-schema.md` (the PII table's "Where stored" column), and its completion check "Once `docs/data-schema.md` exists, every PII row's Where stored names a real table" depends on it. The issue body only requires **Fill these first** to match the order (Success Criteria 3). The Finish-against equality was added by the plan, so Task 6 cannot satisfy both the test and the source. Fix: either add `DATA -.-> SEC` and its dotted-arrow note to the Task 2 chart, or limit the Task 3 assertion to **Fill these first**. Record the choice in `Architecture & Component Changes` decisions.
2. **C2 — Task 13 index rows follow the starter wording, not bkit's own docs (plan edit).** Issue Task 13 (`plan-input-1.md:212`) says the `docs/data-schema.md`, `docs/testing.md` and `docs/security.md` rows "match their docs' Purpose lines", meaning bkit's own docs. Plan Task 13 (`plan-v1-draft.md:628`) and `Documentation Warnings` (`plan-v1-draft.md:269`) instead make them "equal `projectDocRow(topic)`": the new `TOPIC_INFO` scope, which Tasks 6-8 set to the new starter Purpose text. No task changes bkit's own Purpose lines (`docs/data-schema.md:4`, `docs/testing.md:4`, `docs/security.md:4`, `docs/deployments.md:4`). The dogfood region for each `docs/*.md` entry runs from `# {Title}` to the end of the file (`dogfood-templates.test.ts:484-583`), so bkit's copies keep their own boxes. bkit's index would then describe the starter, not bkit's doc, and review defect § 5.4 stays open for bkit itself. Fix: Task 13 sets each row's Scope to the Purpose line of the matching bkit doc, as the issue says. If the owner wants the starter wording instead, add a Task 13 step that rewrites bkit's own Purpose lines to match, and state which option was chosen.
3. **C3 — An issue test row is reworded (plan edit).** The issue matrix row `project-docs tip names the project-docs advisory ids` (`plan-input-1.md:69`) appears at `plan-v1-draft.md:113` and in Task 10 TEST FIRST (`plan-v1-draft.md:592`) as `project-docs tip names the three project-docs advisory ids`. The plan's Contract says issue rows stay word for word, and the test name is what `bkit tests red` records. Fix: restore the issue wording in both places.
4. **C4 — The Task 12 boundary edge cases the plan added have no test (plan edit).** Edge Cases rows `plan-v1-draft.md:84` and `:85` name two outcomes that can be tested. First, an indexed equivalent that is a symlink, a directory or outside the repo is not marked adopted. Second, a missing or unreadable `.agents/docs.md` during `bkit upgrade` falls back to the recommended-path check, and the report never fails. Both sit on the filesystem boundary of the new `adoptedProjectDocPath`, and `## Security & Privacy` (`plan-v1-draft.md:214`) rests on the first. No `Derived Test Matrix` row and no Task 12 TEST FIRST entry covers either one; Task 12's three tests (`plan-v1-draft.md:618-620`) cover only the adopted and not-adopted paths. Fix: add two Integration rows (`.bkit/core/engine/install/template-copies.integration.test.ts`, Task 12) and the matching TEST FIRST entries. Task 12 then has 5 tests and Group 4 has 10, both within the caps.

## OPTIONAL

1. **Task 13 DEPENDS ON is incomplete.** Task 13 (`plan-v1-draft.md:630`) lists 1-9. Its `docs/testing.md` § Project documentation lifecycle coverage update names the tip and upgrade-report tests from Tasks 10 and 12, and its `node dist/cli.js check` DONE WHEN relies on the `dist/` that Tasks 10-12 build. Runbook order already puts it after them, so nothing runs out of order. Add 10, 11 and 12 so the edge is explicit.
2. **The engine edits in Tasks 4-8 skip the build.** Tasks 4-8 edit `TOPIC_INFO` in `.bkit/core/engine/install/project-docs.ts`, but only Tasks 10-12 name `pnpm build && git add dist/` (`.agents/rules.md` § Repo Authoring, **Engine builds**; knowledge row `dist/ staleness`). `bkit:check:dist` is not in any `bkit:gate:*` script, so no group gate goes red. Still, `dist/` stays stale across Groups 2-3. Add the build to each of those tasks' DONE WHEN.
3. **The root mirrors stay stale from Group 1 to Task 13.** Tasks 1-2 edit `.bkit/core/.bkit/authoring.md` and `.bkit/core/.bkit/templates.md`, and only Task 13 refreshes `.bkit/authoring.md` and `.bkit/templates.md`. Knowledge row `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit` says `bkit check` reports drift until then. No unit test reads those root mirrors: `catalogue.test.ts:157` reads `getCoreRoot()`, and `gateguard-dogfood.integration.test.ts:107` reads the core source. So the hand-off is clean, which matches the rule to install once at the end. Note in Pre-Flight that `bkit check` drift during Groups 1-3 is expected.
4. **The upgrade-marker wording appears in three versions.** The Concrete Example (`plan-v1-draft.md:65`) has `changed: docs/architecture.md — adopted, review your copy`. The Process Sketch (`:52`) has "adopted — review your copy". Architecture and Task 12 (`:361`, `:612`) have "adopted at {path}, review your copy". In addition, `formatChangedLine` prints `path.join(TEMPLATE_COPIES_DIR, rel)`, i.e. `.bkit/templates/docs/architecture.md`, not `docs/architecture.md` (`template-copies.ts:118`), and it already appends a `TEMPLATE_CHANGE_CONSEQUENCES` note after ` — ` (`:119-120`). Pick one exact string, say how it combines with an existing consequence note, and use it in all three places so the Task 12 tests and Manual Step 3 have a single target.
5. **Check the #864 blocker before the build.** The 2026-11-09 comment says the issue body has a `bkit:blocked-by` block naming #864, so `/bkit-build` stops while #864 is open. The plan records #864 as open, with its code on this branch, and does not say how the block clears. Add a Pre-Flight item: #864 is closed, or the owner removes the block.
6. **§ Docs scope versus the starters.** The Task 1 READ (`plan-v1-draft.md:435`) says `.bkit/templates/docs/*.md` takes the `docs/*.md` row of § Which Sections Apply. The table (`.bkit/core/.bkit/authoring.md:24-25`) and the § Docs scope line (`:228`) name `docs/*.md` only, so the starters literally fall under "Any other file under `.bkit/`". The GateGuard hook does treat them as docs, because `isDocsPath` matches any `/docs/` segment (`.bkit/core/hooks/gateguard-engine.js:93-100`). Since every starter links to § Docs and the Mermaid rule covers "every file § Docs covers", have Task 1 add `.bkit/templates/docs/*.md` to the scope line and the table row.
7. **The § Docs Rules header rule describes the old box.** `.bkit/core/.bkit/authoring.md:230` says the box holds **Purpose** and **Rules**, but the new starter box adds **Not here** and **Update when**. Task 1 does not list that rule among its edits. Reword it in Task 1 so § Docs does not describe a different box from the one the starters carry.
8. **The `bkit.advisories.ignore` edge case has no test row.** That issue edge case (`plan-v1-draft.md:78`) relies on the existing `isTipSilenced`, and neither the issue's matrix nor the plan's has a row for it. A fourth Task 10 case (`project-docs tip stays silent when project-docs-missing is ignored`) would prove the new tip's `advisories` list is wired. That makes 5 tests in Task 10, still within the caps.
9. **Name the shipped-doc checks in Task 2.** `.bkit/core/.bkit/templates.md` ships to consumers, so `shipped-docs-refs.test.ts` scans it for `#NN` references. Add it to Task 2's DONE WHEN next to `bkit:lint:prose`.

## OUT OF SCOPE

1. `docs/templates/bkit-audit-prompts.md:224` (source in `.bkit/core/docs/templates/`) still says the supplied templates "hold shape only", which contradicts the reworded § Doc Templates. Audit templates are in the issue's Out of Scope, so this belongs in a follow-up issue together with the plan's `.bkit/instructions.md:9879` candidate.
2. Applying the about-15-nodes rule to the generated `docs/capabilities.md` chart (`MMD_MIN_WEIGHT`), from review § 3.11. The plan already lists it as needing a design decision.

## SUGGESTED SCOPE EXPANSION

1. `findIndexedEquivalent` matches a negated or longer path (`Not equivalent to docs/security.md`, `docs/security.mdx`) — source `docs/deferrals.jsonl` key `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` (OPEN) — overlaps Task 12: `adoptedProjectDocPath` would mark such a row adopted. Recommend folding it into Task 12, or naming it in Task 12's edge cases.
2. With two same-basename indexed rows, `findIndexedEquivalent` silently takes the first — source `docs/deferrals.jsonl` key `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-303` (OPEN) — overlaps Task 12's equivalence lookup. Recommend: owner decides; keep deferred unless C4's edge tests touch it.
3. `ROW_RE` misses a Project Documents row without backticks — source `docs/deferrals.jsonl` key `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-230` (OPEN) — overlaps Task 12 through `readProjectIndex`. Recommend keeping it deferred.
4. `readStarterText` reads a consumer starter with no symlink or containment check — source `docs/deferrals.jsonl` keys `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-ts-441` / `-440` (OPEN) — overlaps Tasks 10 and 11 (`detectProjectDocs`, which the tip calls). Recommend folding it into Task 11, since it is a one-call change to the same function.
5. The `project-docs-ambiguous` advisory echoes an untrusted index path raw — source `docs/deferrals.jsonl` keys `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-ts-506` / `-507` (OPEN) — overlaps Task 11's advisory action text. Recommend keeping it deferred; it is a different advisory id.
6. The out-of-tree fixture in `tools.test.ts` cannot fail — source `docs/deferrals.jsonl` key `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-test-ts-621` (OPEN) — overlaps Task 11's test file. Recommend: owner decides.
7. The `doc-indexed-equivalent` clause never defines "valid" — source `docs/deferrals.jsonl` key `864-move-project-docs-challenge-low-bkit-instructions-md-3393` (OPEN) — overlaps Task 1's `.bkit/instructions.md` edit and Task 12's equivalence rule. Recommend keeping it deferred.

## Notes

- Dependency graph (produces → consumed by): T1 § Docs rules and § Doc Templates → T3-T9 (starter links). T2 adoption-order section and chart → T3 test parser, T4-T9, T10 `steps` pointer, T11 action text. T3 `starterShape` helper and the `"> Starter document."` anchor → T4-T9. T7 `sectionMarks` helper → T8. T4-T8 `TOPIC_INFO` scopes → T13 rows. T12 `adoptedProjectDocPath` is created and used in T12. T10-T12 `dist/` build → T13 `node dist/cli.js check`. Every other consumed symbol is already in the repo: `detectProjectDocs` (`tools.ts:478`), `projectDocRow` (`project-docs.ts:433`), `inspectRepoFile` / `isInTreePath` / `readProjectIndex` / `findIndexedEquivalent` / `topicOfPath` (`project-docs.ts:107-451`), `formatTemplateChanges` and its one caller `upgrade.ts:819`, `isTipSilenced`, and `catalogue.ts` already importing from `../after/tools.js`. No consumed artefact comes only from a later task, and there are no cycles.
- Group hand-offs: no test is left red across groups. The dogfood regions run from `# {Title}` to the end of the file, so body edits and the Task 7 lane graph never touch bkit's own copies. Each starter task adds its own region edit and its own `UNAUDITED_DOC_SECTIONS` change. The catalogue heading test reads the core source. No unit test reads the root `.bkit/*.md` mirrors (see OPTIONAL 3).
- Caps: Group 2 has 3 tasks and 7 tests, Group 3 has 4 tasks and 9 tests, and Group 4 has 4 tasks and 8 tests (10 after C4). Each task's tests sit in one file.
- Audit anchors checked: the kept practice headings that the gates, flakes, testing, reliability, config, cost, dependencies, ci-performance and security audits cite exist in the starters today. design, security, observability and noise are covered by `every rule and section` anchors, so the new `## Open questions` and skeleton headings need no `UNAUDITED_DOC_SECTIONS` entry for them.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** C1 — Finish-against assertion contradicts the source's security detail (plan edit)
  **Severity:** CRITICAL · **Class:** drift · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:461` · **Round:** 1
  - **DONE WHEN:** Either Task 2's chart gains a dotted `DATA -.-> SEC` arrow with its note (so security's Finish against is `docs/data-schema.md`, per review § 3.4), or Task 3's `starterShape` assertion checks only Fill these first against the chart; the choice is recorded in Architecture & Component Changes decisions.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** C2 — Task 13 index rows follow the starter wording, not bkit's own docs (plan edit)
  **Severity:** CRITICAL · **Class:** drift · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:628` · **Round:** 1
  - **DONE WHEN:** Task 13 and Documentation Warnings set the `docs/deployments.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/security.md` rows in `.agents/docs.md` to match bkit's own docs' Purpose lines, as issue Task 13 says, or add a Task 13 step that rewrites bkit's own Purpose lines to the new starter wording, with the choice stated.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** C3 — An issue test row is reworded (plan edit)
  **Severity:** CRITICAL · **Class:** drift · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:113` · **Round:** 1
  - **DONE WHEN:** The Derived Test Matrix row and Task 10 TEST FIRST (plan-v1-draft.md:592) read `project-docs tip names the project-docs advisory ids`, word for word as in the issue.
  - **TEST FIRST:**
    - .bkit/core/engine/checks/tips/catalogue.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** C4 — The Task 12 boundary edge cases the plan added have no test (plan edit)
  **Severity:** CRITICAL · **Class:** missing-requirement · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:84` · **Round:** 1
  - **DONE WHEN:** Derived Test Matrix has two Integration rows in `.bkit/core/engine/install/template-copies.integration.test.ts`, Task 12 (symlink, directory or out-of-tree indexed equivalent is not marked adopted; missing or unreadable `.agents/docs.md` falls back to the recommended-path check without failing the report), and Task 12 TEST FIRST names both.
  - **TEST FIRST:**
    - .bkit/core/engine/install/template-copies.integration.test.ts
<!-- bkit:task 4 end -->
