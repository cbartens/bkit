Verdict: CONCERNS
Failures: 5
Redesign: false
Fingerprint: 3d900032b8077c03e3d3c474d42f56e917f59151957dd034680c01f6b504b020
<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

Scope: `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md` (Tasks 1-13, Groups 1-4), read against `plan-input-1.md`, `related-deferrals.md`, `related-failures.md`, `related-knowledge.md` and the current worktree code. `related-issues.md` holds only "Search unavailable.".

Notes:

- No design artifact exists (no `docs/plans/202611/*887*-design.md`; the input references none), so Step 7 design-coverage does not apply. The doc-review comment the plan cites is input, not a design file.
- `docs/testing.md` is present; tiers below use its names (§ Which tier does a behaviour need?, `docs/testing.md:279-296`).
- `related-failures.md` is truncated (10 of 33 lines kept) and `related-knowledge.md` exceeds the read limit, so it was searched by key and keyword rather than read whole. Evidence is therefore marked incomplete.
- Instructions corpus: `.bkit/core/engine/tools/instructions.ts:238-333` covers only DOC_DIRS files that hold `<!-- bkit:start -->`; in `.bkit/core/.bkit/` that is `prompts.md` only, so Tasks 1-2 (`authoring.md`, `templates.md`) carry no instructions-coverage risk and the `instructions-store-clause-text-and-local-entries-need-hand-edits` knowledge row does not bite.

## Surface-Area Map

<!-- prettier-ignore -->
| Task | Files / symbols touched | Consumers and downstream readers | Risk |
| --- | --- | --- | --- |
| 1 | `.bkit/core/.bkit/authoring.md` § Docs, § Doc Templates; `.bkit/instructions.md:27` + `pnpm instructions:sync` | Root mirror `.bkit/authoring.md` (refreshed in Task 13); every agent that follows `.bkit/authoring.md`; `tools/instructions.test.ts` | Low (docs); mirror drift until Task 13 (knowledge `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit`) |
| 2 | `.bkit/core/.bkit/templates.md` new § Project docs — adoption order, line 16, § Project documents | Parsed by Task 3's shape test (Mermaid node ids); pointed at by Task 10 tip `steps` (`catalogue.test.ts` "every docs pointer in steps resolves to a heading" reads `getCoreRoot()/.bkit/templates.md`) and Task 11 advisory text; root mirror `.bkit/templates.md` | Medium: the heading text becomes a contract for three later tasks |
| 3 | `.bkit/templates/docs/components.md` (introduction and rules box `:30-42`); `project-docs.test.ts` new `starterShape`; `dogfood-templates.test.ts` components anchor | `docs/components.md:1-13` must equal the starter rules box byte for byte (`dogfood-templates.test.ts:584-600`, comparison `:930-939`); consumer copies via `bkit upgrade` "Templates updated" | High: dogfood parity break (CRITICAL 2) |
| 4 | `technology.md`, `design.md` starters; `TOPIC_INFO.technology/design.scope` (`project-docs.ts:44-91`); `UNAUDITED_DOC_SECTIONS` (`templates.test.ts:111-116`); dogfood region edits | `projectDocRow` (`project-docs.ts:433-436`) renders `.agents/docs.md` rows; `uncoveredBkitDocSections` exact-equality check (`templates.test.ts:215`); gates audit anchor `docs/design.md § Machine-checked reference` (`bkit-audit-gates.md:42`); accessibility audit "every rule and section" (`bkit-audit-accessibility.md:38`) | Medium: shared `TOPIC_INFO`, exported scope strings (no test hard-codes them) |
| 5 | `architecture.md`, `setup.md` starters; `TOPIC_INFO` scopes; `UNAUDITED_DOC_SECTIONS`; dogfood region edits | As Task 4 | Medium |
| 6 | `security.md`, `observability.md` starters; `TOPIC_INFO` scopes; dogfood region edits | Security audit "every rule and section" (`bkit-audit-security.md:37`), logs audit (`bkit-audit-logs.md:41`); `docs/deployments.md § GitHub Actions pinning` anchor unaffected | Medium: the two audits that anchor on the whole doc now read project slots as rules |
| 7 | `testing.md` starter (ASCII lane graph `:39-56`, `▲▼` prose `:482`); `sectionMarks` helper; `TOPIC_INFO.testing.scope`; `UNAUDITED_DOC_SECTIONS`; dogfood region edit | Gates, testing, flakes, ci-performance audit anchors (`bkit-audit-gates.md:38`, `bkit-audit-testing.md:42`, `bkit-audit-flakes.md:36`, `bkit-audit-ci-performance.md:39`); adoption audit names `docs/testing.md` and "CI lanes" (`bkit-audit-adoption.md:112-113`) | High: most-anchored starter; heading renames break `templates.test.ts` |
| 8 | `data-schema.md`, `deployments.md`, `noise.md` starters; three `TOPIC_INFO` scopes; `UNAUDITED_DOC_SECTIONS`; dogfood region edits | Reliability, cost, gates, ci-performance, security, config, dependencies audit anchors on `docs/deployments.md`; logs audit "every rule and section" on `noise.md`; `assessDocText` (`tools.ts`) for header-only noise; ci-yml advisory text `tools.ts:304` (same stale "promote after the capstone" fact) | High: deployments is anchored by seven audits |
| 9 | `capabilities.md` starter introduction | `bkit-graphify-rollup.py:828-854` writes its own `# Capabilities` header and drops the starter introduction; dogfood entry is `generated` | Low |
| 10 | `SETUP_TIPS` new `project-docs` entry (`catalogue.ts`, after graphify `:389`); `DETAILS.md` § Templates ready to adopt | `isTipSilenced` / `dropTipSilencedAdvisories` (`checks/tips/index.ts:100-106`, `:138-155`) applied to every advisory at `checks/after/index.ts:531`; `detectProjectDocs` findings pushed at `checks/after/index.ts:478`; `bkit tips` output; `tipsBase` reads the main checkout | High: shared catalogue + advisory suppression path (CRITICAL 1) |
| 11 | `detectProjectDocs` action text (`tools.ts`) | `tools.test.ts` project-docs assertions; `docs/observability.md:217-219` advisory table; `bkit check` after-phase output | Low |
| 12 | New export `adoptedProjectDocPath` (`project-docs.ts`); `formatTemplateChanges` / `formatChangedLine` (`template-copies.ts:117-139`) gains optional `cwd`; `upgrade.ts:819` (only caller) | `findIndexedEquivalent` / `listIndexedEquivalents` / `readProjectIndex` (`project-docs.ts:442-448`) with open deferrals `864-...-project-docs-ts-429` and `-303`; `readStarterText` symlink deferrals `864-...-tools-ts-440/441`; existing `describe("formatTemplateChanges")` (`template-copies.integration.test.ts:173-205`); no upgrade-level test captures "Templates updated" | High: public export, filesystem read of consumer paths (CRITICAL 3, 4, 5) |
| 13 | `docs/testing.md` lane graph + § Project documentation lifecycle coverage (`:715-720`); `.agents/docs.md` four rows; root `.bkit/authoring.md`, `.bkit/templates.md` refresh | `bkit check` core pass; `dogfood-templates.test.ts`; agents loading `.agents/docs.md` | Medium: mirror refresh order (knowledge `rendered-mirror-diff-nonempty-by-construction-tracker-resolution` makes "no drift" the right wording) |

High-risk surfaces flagged: `SETUP_TIPS` and the tip-silencing path (Task 10), `TOPIC_INFO` / `projectDocRow` (Tasks 4-8), the exported `formatTemplateChanges` signature and the new `adoptedProjectDocPath` export (Task 12). No schema, migration, RLS, endpoint, event or queue surface is touched.

## CRITICAL

1. **(plan edit) Task 10's tip widens what one ignore entry silences, and no row covers it.** The tip's `advisories` names `project-docs-missing`, `project-docs-empty` and `project-docs-unpopulated` (`plan-v1-draft.md:584`). `isTipSilenced` returns true when the ignore list holds the tip id or any one of its advisory patterns (`.bkit/core/engine/checks/tips/index.ts:101-106`), and `dropTipSilencedAdvisories` then drops every advisory matching the patterns of any silenced tip (`.bkit/core/engine/checks/tips/index.ts:138-155`), applied to all after-phase findings at `.bkit/core/engine/checks/after/index.ts:531`. Today `bkit.advisories.ignore: ["project-docs-missing"]` (which the missing advisory's own text invites: "Skip topics that do not apply") drops only that advisory; `checks/after/index.test.ts:1022-1058` asserts only that `project-docs-index-missing` survives. After Task 10 the same entry also drops every `project-docs-empty` and `project-docs-unpopulated` finding. The plan's READ note at `plan-v1-draft.md:586` describes the tip half only, Breaking Changes is silent, and no `Derived Test Matrix` row asserts which advisories survive. Fix: either list only `project-docs-missing` in `advisories` (or one tip per id), or state the widening under Breaking Changes; in both cases add a Unit/Integration row in `catalogue.test.ts` (in the style of `catalogue.test.ts:276-290`) asserting the exact survivors of `ignore: ["project-docs-missing"]`, red before Task 10 lands.
2. **(plan edit) Task 3's DONE WHEN cannot pass: no task updates `docs/components.md`.** The `starter shape: components` test requires the rules box to carry Purpose, Not here and Update when lines and the general writing rules to become a link to `.bkit/authoring.md` § Docs (`plan-v1-draft.md:460-461`). The rules box is `.bkit/templates/docs/components.md:32-42`; today it has `**Purpose:**` and `**Rules:**` only. The dogfood entry keeps the span from `# Components` to `## Repository purpose` unadapted (`.bkit/core/engine/audits/repo/dogfood-templates.test.ts:584-600`), and the comparison `expect(copy).toBe(applied.text)` (`dogfood-templates.test.ts:930-939`) therefore requires `docs/components.md:1-13` to equal the new box byte for byte. Task 3 only renames the anchor (`plan-v1-draft.md:462`) and Task 13 does not touch `docs/components.md` (`plan-v1-draft.md:627-629`), so `dogfood-templates.test.ts` named in Task 3's DONE WHEN (`plan-v1-draft.md:465`) fails. Fix: add `**UPDATE:** docs/components.md: rules box equals the new starter box` to Task 3, or add a region edit that adapts the box.
3. **(plan edit) Task 12's third TEST FIRST already passes on current code.** `changed doc starter with no copy and changed non-doc template are not marked` (`plan-v1-draft.md:620`) asserts the absence of a marker. `formatChangedLine` emits no adopted marker today (`.bkit/core/engine/install/template-copies.ts:117-121`), and vitest accepts the extra `cwd` argument, so the test is green before any code lands; its stated red reason ("fails if the marker is put on every changed line") is a regression guard, not a first failure. Fix: fold the negative assertions into one of the two marked-line tests (one fixture with an adopted starter, an unadopted starter and a non-doc template, asserting the marked line and both unmarked lines), or record a human `TEST EXCEPTION`.
4. **(plan edit) The `upgrade.ts:819` wiring has no test row.** Task 12 changes the only caller, `const templateReport = formatTemplateChanges(templateChanges);` at `.bkit/core/engine/commands/install/upgrade.ts:819`, to pass `process.cwd()` (`plan-v1-draft.md:613`). All three planned tests call `formatTemplateChanges` directly (`plan-v1-draft.md:618-620`), and no existing upgrade test captures the "Templates updated" block, so a build that forgets the argument ships the old output with every test green. Fix: add an Integration row in `upgrade.integration.test.ts` (spawned CLI against a temp repo with an adopted `docs/architecture.md` and a changed starter) asserting the printed `changed: .bkit/templates/docs/architecture.md` line carries the adopted marker, and name it in Task 12's DONE WHEN.
5. **(plan edit) `adoptedProjectDocPath` safety cases have no rows.** The new export reads consumer paths: the recommended path "when a safe regular file", else `findIndexedEquivalent(readProjectIndex(root) rows, topic, usable)` (`plan-v1-draft.md:611`; `.bkit/core/engine/install/project-docs.ts:442-448`). The planned tests cover only the happy paths. Open deferrals in `related-deferrals.md` record exactly these escapes on the same helpers: `864-...-tools-ts-440/441` (no symlink check in `readStarterText`), `864-...-project-docs-ts-429` (equivalence regex with no negation check and no end boundary, so a "Not equivalent to `docs/x.md`" row matches) and `864-...-project-docs-ts-303` (only the first same-basename candidate is used). The plan neither acknowledges them nor tests the new caller against them. Fix: add Integration rows in `template-copies.integration.test.ts` or `project-docs.test.ts` for a symlinked recommended path, a directory at the path, an indexed equivalent outside the repo, a missing or unreadable `.agents/docs.md` (returns `null`, no throw), and a negated "Not equivalent to" row; acknowledge the two `project-docs-ts` deferrals under Risks. The per-task cap (10 tests, 3 files) leaves room.

## OPTIONAL

- Tasks 4-9 edit `project-docs.ts` (`TOPIC_INFO`), which ships in `dist/`, but only Tasks 10-12 name `pnpm build && git add dist/` in DONE WHEN (`plan-v1-draft.md:482`, `:498`, `:520`, `:537`, `:554` versus `:588`). Knowledge row `kn-7-dist-staleness-pnpm-build-must-run-before-push` applies; add it to each.
- Task 13 aligns only four of the ten `.agents/docs.md` rows with `projectDocRow(topic)` (`plan-v1-draft.md:628`), yet Tasks 4-8 change every topic's scope. Either align all ten rows or say why six stay.
- `.bkit/core/engine/checks/after/tools.ts:304` (ci-yml advisory) carries the same stale "promote after the capstone" fact Task 8 removes from `TOPIC_INFO.deployments`; fold it into Task 8 or 11.
- Task 7's "no box-drawing diagram" check must target U+2500-U+257F or fenced blocks only: `.bkit/templates/docs/testing.md:482` holds the prose "(▲▼ vs the default branch)" that a naive check would trip.
- `UNAUDITED_DOC_SECTIONS` wording: `## CI lanes` is already named by `bkit-audit-adoption.md:112-113`, which cites `docs/testing.md` and contains "CI lanes", so adding it makes `templates.test.ts:215` fail. Word Tasks 4, 5, 7, 8 as "add every new heading `uncoveredBkitDocSections` reports" rather than "the slot headings"; `## Test first` and `## Open questions` will need entries.
- Marker text varies across the plan ("adopted — review your copy", "adopted, review your copy", "adopted at {path}, review your copy" at `plan-v1-draft.md:612`), and the Concrete Example prints `docs/architecture.md` where the real line prints `.bkit/templates/docs/architecture.md` (`template-copies.ts:117-121`). Pin one string so the tests and docs agree.
- The shape check does not assert "no `##` heading inside the introduction". A `##` written there would be read by `uncoveredBkitDocSections` (`templates.test.ts:138`) and, for the four "every rule and section" docs, would silently become an audited rule.
- Security, observability, noise and design are audited as "every rule and section" (`bkit-audit-security.md:37`, `bkit-audit-logs.md:41-42`, `bkit-audit-accessibility.md:38`). After Tasks 4, 6 and 8 those audits read project slots and a header-only noise table as bkit rules. Consider a note in each audit, or narrowing the anchor to the kept practice sections.
- The tip's `fires` reads the main checkout via `tipsBase`, while the advisories read `cwd`. In a worktree, "fires exactly when the advisories fire" can diverge; add a note or a row.
- `docs/observability.md:217-219` lists the project-docs advisory ids; check whether it needs the adoption-order pointer after Task 11.

## OUT OF SCOPE

- The graphify rollup writes its own `# Capabilities` header with "Box colour..." guidance (`.bkit/templates/scripts/graphify/bkit-graphify-rollup.py:828-854`), which conflicts with the new no-colour Mermaid rule in § Docs. Aligning the generator is a separate change.
- `.bkit/instructions.md:9879` still reads "The plan template holds shape only" after Task 1 rewords § Doc Templates; a later instructions sweep can align it.
- A "next doc" tip that names the next unfilled wave, rather than one tip for all three advisories.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** (plan edit) Task 10 tip advisories widen what one ignore entry silences; no row covers it
  **Severity:** CRITICAL · **Class:** test-coverage-gap · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:584` · **Round:** 1
  - **DONE WHEN:** Task 10 either lists only project-docs-missing in the tip's advisories (or one tip per id) or Breaking Changes states that ignoring any one project-docs id drops all three advisories (isTipSilenced .bkit/core/engine/checks/tips/index.ts:101-106, dropTipSilencedAdvisories :138-155, applied at .bkit/core/engine/checks/after/index.ts:531); and a Derived Test Matrix row plus TEST FIRST in catalogue.test.ts asserts the exact surviving advisories for ignore: ["project-docs-missing"].
  - **TEST FIRST:**
    - .bkit/core/engine/checks/tips/catalogue.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** (plan edit) Task 3 DONE WHEN cannot pass: docs/components.md rules box must match the new starter box byte for byte
  **Severity:** CRITICAL · **Class:** unpassable-check · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:465` · **Round:** 1
  - **DONE WHEN:** Task 3 adds an UPDATE of docs/components.md so its rules box (lines 1-13) equals the new starter box at .bkit/templates/docs/components.md, or adds a dogfood region edit adapting the box, so dogfood-templates.test.ts:584-600 / :930-939 passes.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/dogfood-templates.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** (plan edit) Task 12 third TEST FIRST already passes: formatChangedLine emits no marker today
  **Severity:** CRITICAL · **Class:** test-cannot-fail · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:620` · **Round:** 1
  - **DONE WHEN:** The negative assertions of 'changed doc starter with no copy and changed non-doc template are not marked' are folded into a test that also asserts a marked line (red on .bkit/core/engine/install/template-copies.ts:117-121), or the test carries a human TEST EXCEPTION.
  - **TEST FIRST:**
    - .bkit/core/engine/install/template-copies.integration.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** (plan edit) upgrade.ts:819 wiring of process.cwd() has no Derived Test Matrix row
  **Severity:** CRITICAL · **Class:** test-coverage-gap · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:613` · **Round:** 1
  - **DONE WHEN:** Task 12 names an Integration test in upgrade.integration.test.ts (spawned CLI, temp repo with an adopted docs/architecture.md and a changed starter) asserting the printed 'changed: .bkit/templates/docs/architecture.md' line carries the adopted marker, with a matching matrix row and DONE WHEN entry.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/install/upgrade.integration.test.ts
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** (plan edit) adoptedProjectDocPath safety cases untested; open #864 deferrals on the same helpers unacknowledged
  **Severity:** CRITICAL · **Class:** test-coverage-gap · **Fixable:** true · **Location:** `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md:611` · **Round:** 1
  - **DONE WHEN:** Task 12 adds Integration rows for a symlinked recommended path, a directory at the path, an indexed equivalent outside the repo, a missing or unreadable .agents/docs.md (returns null, no throw) and a negated 'Not equivalent to' row; the plan's Risks acknowledge deferrals 864-...-project-docs-ts-429 and -303 (findIndexedEquivalent .bkit/core/engine/install/project-docs.ts:442-448).
  - **TEST FIRST:**
    - .bkit/core/engine/install/template-copies.integration.test.ts
    - .bkit/core/engine/install/project-docs.test.ts
<!-- bkit:task 5 end -->
