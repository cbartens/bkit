# Brief: group 4 — Point adopters at the order

Plan: Review Doc Starters Implementation Plan

## Why and what

### Context & Goals

bkit ships twelve project-doc starters in `.bkit/templates/docs/`, and only `components.md` tells its adopter how to fill it in. This plan gives every starter one fill-in introduction, one rules-box shape and a bracketed skeleton. It writes the shared writing rules (the Mermaid rule among them) once in `.bkit/authoring.md` § Docs, adds one adoption order to `.bkit/templates.md`, and points adopters at that order from a new `bkit tips` entry, the reworded project-doc advisories and the `bkit upgrade` "Templates updated" report.

Goals beyond the issue's task list, found while reading the code or settled by the owner:

- Keep the three places that hold a doc's index row identical: the starter's register step, `TOPIC_INFO[topic].scope` in `.bkit/core/engine/install/project-docs.ts` (which `syncProjectDocs` inserts into `.agents/docs.md`) and the starter's Purpose line. The starter-shape test asserts the given row equals `projectDocRow(topic)`.
- Keep the template audits green: `.bkit/core/engine/audits/templates/templates.test.ts` (`unresolvedBkitDocAnchors`, `uncoveredBkitDocSections`, `UNAUDITED_DOC_SECTIONS`) and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` (the `docs/*.md` entries, including the components anchor `"> Example document."`).
- Make the index equivalence match accept only an affirmative `Equivalent to docs/{topic}.md` with an end boundary (owner answer 2, 2026-11-14), so the new upgrade marker, `detectProjectDocs` and `syncProjectDocs` never treat "Not equivalent to `docs/security.md`" or `docs/security.mdx` as an adopted copy.
- Keep the `## Test first` section that #917 adds to the testing starter, marked as bkit practice (issue comment, 2026-11-13).
- Merge `project-docs-empty` into `project-docs-unpopulated`, so an empty project doc is reported as unpopulated and `project-docs-missing` keeps its own id (owner answer 3, 2026-11-14).
- Give every reader of a project doc a named home for what it is sent there to find. `.agents/rules.md`, the plan template and the build prompts name facts they expect in `docs/{topic}.md`, and each skeleton holds a section for them (reader review, 2026-11-14; the table under `Architecture & Component Changes` § Starters).
- Keep every section name a shipped file cites. A unit test resolves each `docs/{topic}.md § {heading}` citation in the shipped files against the starter's headings (Task 15).

**Related Issues:**

- #887 — Review doc starters: population steps, order and shared rules (open)
- #864 — Move project docs to templates with adoption warnings (closed)
- #863 — Ship a purpose-based components document template (open)
- #917 — Docs: how a Node test file reports test names to bkit:test:file (closed)

---

### Narrative

bkit ships twelve project-doc starters in `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup (moved there by [#864 — Move project docs to templates with adoption warnings](https://github.com/cbartens/bkit/issues/864)), plus components and capabilities. Only `components.md` tells the person or agent adopting it how to fill it in: where to look, numbered steps, completion checks, and "remove this introduction when done". The rest stop at a Purpose line and a few rules. `architecture.md`, `technology.md`, `data-schema.md` and `noise.md` have no body at all. `testing.md` (512 lines) and `deployments.md` (435 lines) are mostly bkit's own best practice, with a short "Project facts to record" list on top.

After this change every starter tells its adopter what to read, what to fill in, in which order, and how to tell it is done. Writing rules that apply to every doc are written once in `.bkit/authoring.md` § Docs, and every starter links to them. One adoption order, starting from the owner's `docs/idea.md`, lives in `.bkit/templates.md`. bkit's best practice stays inside the testing and deployments starters, clearly marked apart from the blanks the project fills. bkit also points adopters at the order: a new `bkit tips` entry, reworded project-doc advisories, and a marker in the upgrade report when a doc starter the project has adopted changes.

The per-starter detail (rules box wording, skeleton headings, sources, completion checks, chart type, wave) is in the doc review comment linked under References, § 3. Where that comment and this body disagree, this body wins. Where that comment and a runbook task's `UPDATE` line disagree, the task wins: the reader review of 2026-11-14 changed five skeletons, and the table under `Architecture & Component Changes` § Starters names the reader each change serves.

Decisions settled with the owner on 2026-11-13:

- bkit's best practice stays in the starters. One file holds both the fill-in steps and bkit's advice where it applies, mainly testing and deployments, because bkit's CI depends on them. When an important part of that advice changes, the template changes and bkit can add an advisory or migration then.
- `docs/idea.md` holds the owner's free-form notes on the problem, the users and what the app must and must not do. It stays after `components.md` exists, is not indexed in `.agents/docs.md`, and has no template.
- Each starter's "register this doc" step gives the exact `.agents/docs.md` row, with its Scope cell copied from the starter's Purpose line. A unit test in bkit keeps the two identical.
- Shared writing rules live in `.bkit/authoring.md` § Docs. The adoption order lives in a new `.bkit/templates.md` section. The Mermaid rule covers every file § Docs covers, and applies whenever a doc has a chart; no doc is required to have one.
- #887 includes the `bkit tips` entry, the advisory rewording and the upgrade-report marker.

### Success Criteria

- Every starter in `.bkit/templates/docs/` opens with the same introduction: an opener line, **Fill these first**, **Finish against**, **Where the facts come from**, numbered fill steps, **If it does not apply**, **Completion checks**, and a step giving the exact `.agents/docs.md` row. `capabilities.md` instead names the command that builds it and when to run each. Every hand-written starter has a rules box with **Purpose**, **Not here** and **Update when**, a `##` skeleton with bracketed fields and one `[e.g., …]` row per table, and `## Open questions`. A unit test fails when any starter lacks a part, or when its given row's Scope differs from its Purpose line.
- `.bkit/authoring.md` § Docs holds the shared writing rules, including the Mermaid rule. § Doc Templates says fill-in instructions sit in the template and rules for acting on it live in the prompts, and that project-doc starters carry their own fill-in steps. bkit's own `docs/` copies follow the new rules: the ASCII lane graph in `docs/testing.md` § CI test tiers (the bkit scaffold) is Mermaid.
- `.bkit/templates.md` has one project-docs adoption-order section with the waves table and a Mermaid chart, and names `docs/idea.md`. Each starter's **Fill these first** line matches it. Line 16 no longer says the `bkit tips` order covers project docs.
- In `testing.md` and `deployments.md`, every `##` section is marked either as a project slot to fill or as bkit practice to keep, so an adopter can tell which is which. Every section a shipped file cites as `docs/{topic}.md § {heading}` exists in that topic's starter, and a unit test fails when one does not.
- A `project-docs` tip fires exactly when a `project-docs-missing` or `project-docs-unpopulated` advisory does; an empty project doc is reported as `project-docs-unpopulated`, and no `project-docs-empty` advisory exists. Those advisories point at the adoption-order section. The `bkit upgrade` "Templates updated" report marks each changed doc starter whose project copy exists as adopted, to review.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Moving files between folders, ownership changes and the adoption warnings themselves | Done by #864 (closed); no success criterion here needs it | #864 |
| Plan and audit templates in `.bkit/core/docs/templates/`, other than the § Doc Templates headline and `.bkit/instructions.md:27` | The criteria cover the project-doc starters only | Issue Out of Scope; a follow-up issue |
| A template for `docs/idea.md`, and a `docs/idea.md` for bkit itself | Settled with the owner: free-form, no template | Issue Out of Scope (owner decision 2026-11-13) |
| An advisory that persists until a changed starter is reviewed | Needs stored per-copy state; the upgrade-report marker meets the criterion | A follow-up issue |
| Migrations for already-adopted copies | No criterion asks to rewrite adopted docs | A future advisory or migration when bkit's practice changes |
| Vendor-specific starter content | Starters stay stack-agnostic; vendor names stay marked as examples | `.agents/rules.md` stack-agnostic rule |
| **Not here** / **Update when** box lines and the other starter-scoped § Docs rules in bkit's own `.agents/**`, `.bkit/*.md` and `docs/*.md` files | Those rules apply to the starters in `.bkit/templates/docs/*.md` (Breaking Changes, scope of the new § Docs rules); the one new rule that covers bkit's own copies is the Mermaid rule, and Task 14 meets it for Success Criterion 2 | A follow-up issue that brings bkit's own docs in line, with tests |

## Where it fits

- Group 1: Shared rules and adoption order — done
  - TASK 1: Write the shared project-doc writing rules and reword § Doc Templates — done
  - TASK 2: Add the project-docs adoption order to `.bkit/templates.md` and point the document index at it — done
- Group 2: Hand-written starters, waves 2 to 4 — done
  - TASK 3: Rewrite `components.md` as the model introduction and add the starter-shape tests — done
  - TASK 4: Rewrite `technology.md` and `design.md` (wave 3) — done
  - TASK 5: Rewrite `architecture.md` and `setup.md` (wave 4) — done
- Group 3: Hand-written starters, waves 5 and 6, and capabilities — done
  - TASK 6: Rewrite `security.md` and `observability.md` (wave 5) — done
  - TASK 7: Rewrite `testing.md` (wave 5), keeping bkit's practice in place — done
  - TASK 8: Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6) — done
  - TASK 9: Rewrite the `capabilities.md` introduction (wave 7, generated) — done
- Group 4: Point adopters at the order — this group
  - TASK 10: Add the `project-docs` setup tip — open
  - TASK 11: Merge the empty-doc advisory into `project-docs-unpopulated` and point the project-doc advisories at the adoption order — open
  - TASK 12: Make the index equivalence match affirmative and end-bounded — open
  - TASK 13: Mark adopted doc starters in the upgrade report — open
  - TASK 14: Bring bkit's own docs and mirrors in line — open
- Group 5: Guard shipped section citations — next
  - TASK 15: Guard the section names shipped files cite — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Add the `project-docs` setup tip
  - **UPDATE:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`: new `project-docs` entry after `graphify`, `workflows: ["design", "plan", "build"]`, whose `fires` calls `detectProjectDocs` and is true when it returns `project-docs-missing` or `project-docs-unpopulated`; `advisories` names those two ids; `ask` and `steps` point at `.bkit/templates.md` § Project docs — adoption order
  - **UPDATE:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`: the `project-docs` entry's `caution` says in plain English that ignoring either the missing-doc or the unfilled-doc advisory also silences this tip and the other advisory (owner answer 1, 2026-11-14)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: the header comment's text rule names `DETAILS.md` § Templates ready to adopt where it says "README"
  - **UPDATE:** `DETAILS.md`: § Templates ready to adopt gains a project-docs row whose benefit reads the same as the tip and the `.bkit/templates.md` section opener, per the catalogue's text rule
  - **READ:** `isTipSilenced` in `.bkit/core/engine/checks/tips/index.ts`: an ignored advisory id silences the tip
  - **READ:** `dropTipSilencedAdvisories` in `.bkit/core/engine/checks/tips/index.ts`: a silenced tip drops every advisory its `advisories` names, applied to all after-phase findings at `.bkit/core/engine/checks/after/index.ts:531`
  - **READ:** `§ Which tier does a behaviour need?` in `docs/testing.md`: the tip cases run on temp directories, so they are Unit
  - **READ:** `readStarterText` in `.bkit/core/engine/checks/after/tools.ts`: it compares a project copy with the package starter first (lines 443-446), so the "unchanged starter copy" fixture copies the real `.bkit/templates/docs/{topic}.md`, not hand-written starter text
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: the two "stays silent" cases for populated docs and for a Not applicable data-schema with a header-only noise look the tip up by id and assert it is defined before reading `fires`
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: the `ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing` fixture uses an unchanged starter copy, not an empty doc, because an empty doc reads as unpopulated only after Task 11
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the seven tip tests below and the existing catalogue tests ("every docs pointer in steps resolves to a heading", "ids are unique and never collide with an advisory id", "%s leads with %s", "audit tips are …") pass; the existing `.bkit/core/engine/checks/after/index.test.ts` case `reports and suppresses project documentation advisories without a blocker` (lines 1022-1058) passes; `DETAILS.md` § Templates ready to adopt has a project-docs row whose benefit text equals the tip's `line` and the opener of `.bkit/core/.bkit/templates.md` § Project docs — adoption order; the `project-docs` tip's `advisories` is exactly `["project-docs-missing", "project-docs-unpopulated"]` and its `caution` is set; the `catalogue.ts` header comment names `DETAILS.md` and not "README"; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is missing` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when every project doc is populated and indexed` fails because the lookup by id finds no `project-docs` tip, which the test asserts is defined before it reads `fires`
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip names the two project-docs advisory ids` fails because no such tip exists; the test asserts `advisories` equals `["project-docs-missing", "project-docs-unpopulated"]` and that `caution` is set
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent for a Not applicable data-schema and a header-only noise` fails because the lookup by id finds no `project-docs` tip, which the test asserts is defined before it reads `fires`
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is an unchanged starter copy` fails because no such tip exists; its fixture copies the real `.bkit/templates/docs/{topic}.md`
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when project-docs-missing is ignored` fails because no `project-docs` tip is reported as suppressed
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing` fails because today the `project-docs-unpopulated` finding survives the ignore entry

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Merge the empty-doc advisory into `project-docs-unpopulated` and point the project-doc advisories at the adoption order
  - **UPDATE:** `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts`: a doc assessed as empty (the `assessed === "empty"` branch, line 538) goes on the `unpopulated` list; the `project-docs-empty` finding and its `action` text (lines 577-584) are removed; the `project-docs-unpopulated` `detect` text names empty docs as well as untouched starters
  - **UPDATE:** `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts`: the `action` text of `project-docs-missing` and `project-docs-unpopulated` names `.bkit/templates.md` § Project docs — adoption order, keeping the inline fix and the `.bkit/templates/docs/`, `.agents/docs.md` and "equivalent" wording existing tests assert
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.test.ts`: in `distinguishes missing and empty project documentation from populated candidates`, the `project-docs-empty` assertion (line 507) moves to the `project-docs-unpopulated` id, keeping its `docs/testing.md`, `docs/setup.md` and not-`docs/security.md` checks
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: the `project-docs tip fires when a project doc is empty` case, which lands here because the tip fires on an empty doc only once it reads as `project-docs-unpopulated`
  - **UPDATE:** `docs/observability.md`: the `project-docs-empty` row of the project-docs advisory table (line 218) is removed, and the `project-docs-unpopulated` row reads "A covering document is empty, still a current or legacy starter, or only headings"
  - **DEPENDS ON:** 2, 10
  - **DONE WHEN:** the three tests below, the existing `tools.test.ts` `describe("detectProjectDocs")` tests and the existing `.bkit/core/engine/checks/after/index.test.ts` case `reports and suppresses project documentation advisories without a blocker` pass; the string `project-docs-empty` appears in none of `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/tools.test.ts`, `.bkit/core/engine/checks/tips/catalogue.ts` or `docs/observability.md`; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `missing and unpopulated advisories name the adoption-order section` fails on today's action text, which has no "Project docs — adoption order"
    - `.bkit/core/engine/checks/after/tools.test.ts` `an empty project doc is reported as project-docs-unpopulated` fails because today an empty doc is reported under `project-docs-empty` and no `project-docs-unpopulated` finding names it
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is empty` fails because an empty doc still raises only `project-docs-empty`, which the tip does not read, so `fires` returns false

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Make the index equivalence match affirmative and end-bounded
  - **UPDATE:** `listIndexedEquivalents` in `.bkit/core/engine/install/project-docs.ts`: the Scope regex matches only an affirmative `Equivalent to docs/{topic}.md` (no `not` / `non` directly before `equivalent`) whose path ends at a backtick, whitespace, punctuation or the end of the cell, so "Not equivalent to `docs/{topic}.md`", `docs/{topic}.mdx` and `docs/{topic}.md.bak` name no equivalent; same-basename rows match as today
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.test.ts`: one `describe("detectProjectDocs")` case with no `docs/{topic}.md` and index rows whose Scope reads "Not equivalent to `docs/{topic}.md`" and names `docs/{topic}.mdx`, asserting `project-docs-missing` for the topic
  - **UPDATE:** `.bkit/core/engine/install/project-docs.test.ts`: one `describe("syncProjectDocs")` case with a present, unindexed `docs/{topic}.md` beside a "Not equivalent to `docs/{topic}.md`" row, asserting the topic's row is inserted into `.agents/docs.md`
  - **READ:** `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts`: how it resolves an indexed equivalent (lines 500-501 and 541), which the stricter match changes
  - **READ:** `syncProjectDocs` in `.bkit/core/engine/install/project-docs.ts`: how an indexed equivalent stops it registering the recommended path (line 553)
  - **DONE WHEN:** the two tests below and the existing `project-docs.test.ts` `describe("syncProjectDocs")` and `tools.test.ts` `describe("detectProjectDocs")` tests pass, every affirmative `Equivalent to docs/{topic}.md` fixture still matching; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing` fails because the loose regex reads the negated and `.mdx` rows as the topic's equivalent, so no `project-docs-missing` finding is reported
    - `.bkit/core/engine/install/project-docs.test.ts` `syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row` fails because the loose regex reads the negated row as the topic's equivalent, so `docs/{topic}.md` is not registered

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Mark adopted doc starters in the upgrade report
  - **UPDATE:** `.bkit/core/engine/install/project-docs.ts`: new exported `adoptedProjectDocPath(root, topic)` (recommended path when a safe regular file through `inspectRepoFile`, else `findIndexedEquivalent(readProjectIndex(root) rows, topic, usable)` with an `isInTreePath` + regular-file `usable` check, else `null`; a missing or unreadable index yields only the recommended-path result)
  - **UPDATE:** `formatTemplateChanges` in `.bkit/core/engine/install/template-copies.ts`: required `cwd`; a changed `docs/{topic}.md` starter whose `adoptedProjectDocPath(cwd, topic)` is non-null, and a changed `docs/components.md` starter whose `docs/components.md` is a regular file in the repo (same-path check through `inspectRepoFile`), gets `— adopted at {path}, review your copy` on its `changed:` line, or `— {consequence}; adopted at {path}, review your copy` when a `TEMPLATE_CHANGE_CONSEQUENCES` note also applies; a root with no adopted copy → today's output; a missing or unreadable `.agents/docs.md` never throws
  - **UPDATE:** `.bkit/core/engine/install/template-copies.integration.test.ts`: the four existing `describe("formatTemplateChanges")` calls pass a temp root that holds no adopted copy, and keep their expected output
  - **UPDATE:** `runUpgradeCommand` in `.bkit/core/engine/commands/install/upgrade.ts`: the `formatTemplateChanges` call (lines 818-819) passes `process.cwd()`
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: one spawned-CLI case on a temp repo with an adopted `docs/architecture.md` and a changed architecture starter, following the `spawnSync(requireTsx(), [bkitInstallPath, "upgrade", "--auto-apply"], …)` pattern at lines 257-269, with an explicit test-level timeout `}, 180_000)` as the other spawned cases in the file use
  - **UPDATE:** `docs/architecture.md`: § Project documents boundary gains one sentence: `bkit upgrade` marks a changed doc starter whose project copy exists, found by `adoptedProjectDocPath` through the same affirmative equivalence `detectProjectDocs` uses
  - **READ:** `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts`: how it resolves an indexed equivalent (lines 500-501 and 541), which `adoptedProjectDocPath` mirrors
  - **READ:** `docs/security.md`: § Scope — the helper reads only the project's own files through the existing symlink and containment checks
  - **DEPENDS ON:** 3, 12
  - **DONE WHEN:** the ten tests below and the existing `describe("formatTemplateChanges")`, `describe("syncProjectDocs")` and `tools.test.ts` `describe("detectProjectDocs")` tests pass; `formatTemplateChanges` has no optional parameter; the spawned `bkit upgrade` prints `changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy`; `docs/architecture.md` § Project documents boundary names `adoptedProjectDocPath`; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with a project copy is marked adopted` fails because no "review your copy" marker exists; the test asserts both a topic line and the components line `— adopted at docs/components.md, review your copy`
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter indexed under another path is marked adopted` fails because no "review your copy" marker exists
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with no copy and changed non-doc template are not marked` fails because the same fixture's adopted starter line has no "review your copy" marker; the test also asserts the no-copy starter line and the non-doc template line carry none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a symlink is not marked adopted` fails because the same fixture's regular-file copy of another topic has no "review your copy" marker; the test also asserts the symlinked topic's line carries none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a directory is not marked adopted` fails because the same fixture's regular-file copy of another topic has no "review your copy" marker; the test also asserts the directory topic's line carries none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted` fails because the same fixture's in-tree indexed equivalent has no "review your copy" marker; the test also asserts the symlinked and out-of-tree equivalents' lines carry none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted` fails because the same fixture's affirmatively indexed equivalent has no "review your copy" marker; the test also asserts the lines for a "Not equivalent to" row and a `docs/{topic}.mdx` row carry none, which the loose regex would mark
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report` fails because the recommended-path copy has no "adopted at docs/" marker
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `bkit upgrade prints the adopted marker for a changed starter with a project copy` fails because the printed `changed:` line has no "review your copy" marker
    - `.bkit/core/engine/install/project-docs.test.ts` `adoptedProjectDocPath returns the recommended path, an indexed equivalent or null` fails because `adoptedProjectDocPath` is not exported

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Bring bkit's own docs and mirrors in line
  - **UPDATE:** `docs/testing.md`: the ASCII lane graph in § CI test tiers (the bkit scaffold) becomes a Mermaid `flowchart LR`, with a sentence saying what the arrows mean; § Project documentation lifecycle coverage names the starter-shape, tip, equivalence and upgrade-report tests
  - **UPDATE:** `.agents/docs.md`: the `docs/deployments.md` row no longer says "promote after the capstone"; the Scope of the `docs/deployments.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/security.md` rows equals the Purpose text of bkit's own matching doc (line 4 of each), as the issue says; bkit's own Purpose lines are not rewritten, and the other six rows already name the same items as their docs' Purpose lines
  - **UPDATE:** `.bkit/authoring.md`: refreshed from `.bkit/core/.bkit/authoring.md` with `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.bkit/templates.md`: refreshed from `.bkit/core/.bkit/templates.md` by the same upgrade run
  - **UPDATE:** `.agents/docs.md`: the note under the Universal Documents table refreshed from `.bkit/core/.agents/docs.md` by the same upgrade run
  - **UPDATE:** `.bkit/version`: re-pinned by the same upgrade run
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
  - **DONE WHEN:** `node dist/cli.js check` reports no drift; each of the four `.agents/docs.md` rows' Scope equals the Purpose text of its bkit doc; `docs/testing.md` § Project documentation lifecycle coverage names `install/project-docs.test.ts`, `checks/tips/catalogue.test.ts`, `checks/after/tools.test.ts`, `install/template-copies.integration.test.ts` and `commands/install/upgrade.integration.test.ts`; no fenced code block in `docs/*.md` holds `▼`, `▲`, `┌` or `┐` (the lane graph's arrow and corner characters, the same set Task 7 checks); `dogfood-templates.test.ts` passes; after `pnpm build`, `node dist/cli.js install` on a fresh scratch consumer then `node dist/cli.js check`, `node dist/cli.js tips` and `node dist/cli.js upgrade` there print the `project-docs-missing` pointer to `.bkit/templates.md` § Project docs — adoption order, the `project-docs` tip, and the `— adopted at docs/{topic}.md, review your copy` marker for a changed starter with a copy (`.agents/rules.md` § Verify before complete)
  - **TEST FIRST:** n/a — docs, mirror refresh and the dogfood run

<!-- bkit:task 14 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Write the shared project-doc writing rules and reword § Doc Templates — `.bkit/core/.bkit/authoring.md`, `.bkit/instructions.md`
- TASK 2 (group 1, done): Add the project-docs adoption order to `.bkit/templates.md` and point the document index at it — `.bkit/core/.bkit/templates.md`, `.bkit/core/.agents/docs.md`
- TASK 3 (group 2, done): Rewrite `components.md` as the model introduction and add the starter-shape tests — `.bkit/templates/docs/components.md`, `.bkit/core/engine/install/project-docs.test.ts`, `docs/components.md`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 4 (group 2, done): Rewrite `technology.md` and `design.md` (wave 3) — `.bkit/templates/docs/technology.md`, `.bkit/templates/docs/design.md`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 5 (group 2, done): Rewrite `architecture.md` and `setup.md` (wave 4) — `.bkit/templates/docs/architecture.md`, `.bkit/templates/docs/setup.md`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/install/project-docs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 6 (group 3, done): Rewrite `security.md` and `observability.md` (wave 5) — `.bkit/templates/docs/security.md`, `.bkit/templates/docs/observability.md`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 7 (group 3, done): Rewrite `testing.md` (wave 5), keeping bkit's practice in place — `.bkit/templates/docs/testing.md`, `.bkit/core/engine/install/project-docs.test.ts`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 8 (group 3, done): Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6) — `.bkit/templates/docs/data-schema.md`, `.bkit/templates/docs/deployments.md`, `.bkit/templates/docs/noise.md`, `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 9 (group 3, done): Rewrite the `capabilities.md` introduction (wave 7, generated) — `.bkit/templates/docs/capabilities.md`, `.bkit/core/engine/install/project-docs.test.ts`

Reuse Inventory rows left out: 11; Architecture entries left out: 10 — read them in docs/plans/202611/887-review-doc-starters-plan.md § Reuse Inventory and § Architecture & Component Changes.
