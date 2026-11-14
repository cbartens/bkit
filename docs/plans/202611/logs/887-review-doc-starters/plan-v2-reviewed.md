Verdict: FAIL
<!-- verdict:end -->

# Review Doc Starters Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

bkit ships twelve project-doc starters in `.bkit/templates/docs/`. Only `components.md` tells its adopter how to fill it in; the other eleven stop at a Purpose line and a few rules, four have no body, and `testing.md` (512 lines) and `deployments.md` (435 lines) mix bkit's own practice with a short "Project facts to record" list. This plan gives every starter one fill-in introduction, one rules-box shape and a bracketed skeleton; writes the shared writing rules (including the Mermaid rule) once in `.bkit/authoring.md` § Docs; adds one adoption order to `.bkit/templates.md`; and points adopters at that order from a new `bkit tips` entry, the reworded project-doc advisories and the `bkit upgrade` "Templates updated" report.

Goals beyond the issue's task list, found while reading the code:

- Keep the three places that hold a doc's index row identical: the starter's register step, `TOPIC_INFO[topic].scope` in `.bkit/core/engine/install/project-docs.ts` (which `syncProjectDocs` inserts into `.agents/docs.md`) and the starter's Purpose line. The starter-shape test asserts the given row equals `projectDocRow(topic)`.
- Keep the template audits green: `.bkit/core/engine/audits/templates/templates.test.ts` (`unresolvedBkitDocAnchors`, `uncoveredBkitDocSections`, `UNAUDITED_DOC_SECTIONS`) and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` (the `docs/*.md` entries, including the components anchor `"> Example document."` at line 590).

**Related Issues:**

- #887 — Review doc starters: headers, fill-in instructions and Mermaid (open; this plan)
- #864 — Move project docs to templates with adoption warnings (open per the 2026-11-09 comment; its starters are in `.bkit/templates/docs/` on this branch)
- #863 — Ship a purpose-based components document template (state not recorded in the input; `components.md` is present)
- #917 — Node test file reporting docs (open; its `## Test first` section is not yet in `.bkit/templates/docs/testing.md`)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

bkit ships twelve project-doc starters in `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup (moved there by [#864 — Move project docs to templates with adoption warnings](https://github.com/cbartens/bkit/issues/864)), plus components and capabilities. Only `components.md` tells the person or agent adopting it how to fill it in: where to look, numbered steps, completion checks, and "remove this introduction when done". The rest stop at a Purpose line and a few rules. `architecture.md`, `technology.md`, `data-schema.md` and `noise.md` have no body at all. `testing.md` (512 lines) and `deployments.md` (435 lines) are mostly bkit's own best practice, with a short "Project facts to record" list on top.

After this change every starter tells its adopter what to read, what to fill in, in which order, and how to tell it is done. Writing rules that apply to every doc are written once in `.bkit/authoring.md` § Docs, and every starter links to them. One adoption order, starting from the owner's `docs/idea.md`, lives in `.bkit/templates.md`. bkit's best practice stays inside the testing and deployments starters, clearly marked apart from the blanks the project fills. bkit also points adopters at the order: a new `bkit tips` entry, reworded project-doc advisories, and a marker in the upgrade report when a doc starter the project has adopted changes.

### Success Criteria

- Every starter in `.bkit/templates/docs/` opens with the same introduction: an opener line, **Fill these first**, **Finish against**, **Where the facts come from**, numbered fill steps, **If it does not apply**, **Completion checks**, and a step giving the exact `.agents/docs.md` row. `capabilities.md` instead names the command that builds it and when to run each. Every hand-written starter has a rules box with **Purpose**, **Not here** and **Update when**, a `##` skeleton with bracketed fields and one `[e.g., …]` row per table, and `## Open questions`. A unit test fails when any starter lacks a part, or when its given row's Scope differs from its Purpose line.
- `.bkit/authoring.md` § Docs holds the shared writing rules, including the Mermaid rule. § Doc Templates says fill-in instructions sit in the template and rules for acting on it live in the prompts, and that project-doc starters carry their own fill-in steps. bkit's own `docs/` copies follow the new rules: the ASCII lane graph in `docs/testing.md` § CI test tiers (the bkit scaffold) is Mermaid.
- `.bkit/templates.md` has one project-docs adoption-order section with the waves table and a Mermaid chart, and names `docs/idea.md`. Each starter's **Fill these first** line matches it. Line 16 no longer says the `bkit tips` order covers project docs.
- In `testing.md` and `deployments.md`, every `##` section is marked either as a project slot to fill or as bkit practice to keep, so an adopter can tell which is which.
- A `project-docs` tip fires exactly when a `project-docs-missing`, `project-docs-empty` or `project-docs-unpopulated` advisory does. Those advisories point at the adoption-order section. The `bkit upgrade` "Templates updated" report marks each changed doc starter whose project copy exists as adopted, to review.

### Process Sketch

- **WHEN** an adopter opens any hand-written starter **→ THEN** it reads an introduction above `# {Title}` naming what to fill first, what to finish against, where the facts come from, numbered steps, the empty state, completion checks and the exact `.agents/docs.md` row, then a rules box with Purpose, Not here and Update when.
- **WHEN** the adopter opens `.bkit/templates.md` § Project docs — adoption order **→ THEN** the waves table and Mermaid chart give the same prerequisites as each starter's **Fill these first** line.
- **WHEN** `bkit check` or `bkit tips` runs in a project with a missing, empty or untouched project doc **→ THEN** the matching `project-docs-*` advisory names the adoption-order section and the `project-docs` tip fires.
- **IF** a doc says `Not applicable: {reason}` or `docs/noise.md` holds only its rules box and table header **→ THEN** no advisory and no tip.
- **WHEN** `bkit upgrade` changes a doc starter the project has a copy of, at the recommended path or an indexed equivalent **→ THEN** its `changed:` line ends `— adopted at {path}, review your copy`, where `{path}` is the project copy; a starter with no copy, or a non-doc template, has no note.

### Concrete Example

**Setup:** A developer adopts bkit in a new app. `docs/idea.md` holds the owner's notes; `docs/components.md` and `docs/technology.md` exist; no other project doc exists. bkit was upgraded from the release before this change.

**Steps:**

1. Developer runs `bkit check` → System reports `project-docs-missing` for `docs/architecture.md` (and the other absent topics), whose action text says to copy the starter from `.bkit/templates/docs/`, add its `.agents/docs.md` row, and follow `.bkit/templates.md` § Project docs — adoption order.
2. Developer runs `bkit tips` → System lists the `project-docs` tip pointing at the same section.
3. Developer opens the adoption-order section → System shows architecture and setup in wave 4, both needing technology first.
4. Developer copies `.bkit/templates/docs/architecture.md` to `docs/architecture.md` → The introduction says **Fill these first:** `docs/technology.md`, lists the steps, and gives the exact row `| \`docs/architecture.md\` | … | {Purpose text} |`.
5. Developer fills the skeleton, removes the introduction and adds the row → `bkit check` no longer reports a project-docs advisory for architecture.
6. A later `bkit upgrade` changes `.bkit/templates/docs/architecture.md` → The "Templates updated" report reads `changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy`.

**Outcome:** The developer filled the doc in the documented order, the advisory and tip cleared, and the upgrade report told them which adopted doc to compare with its new starter.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A project has no database and writes `Not applicable: no persistent store` in `docs/data-schema.md` | `detectProjectDocs` reads it as a candidate, so no `project-docs-unpopulated` advisory and no tip |
| `docs/noise.md` adopted with only the introduction removed (empty table, rules box kept) | Read as a candidate; no advisory, no tip |
| A starter copied to `docs/` unchanged | `project-docs-unpopulated` fires and the `project-docs` tip fires |
| A project still holds a 6.1.x legacy starter | Still flagged through `LEGACY_STARTER_DIGEST_HISTORY`, unchanged by this issue |
| `bkit.advisories.ignore` lists `project-docs-missing` | The `project-docs` tip stays silent for that cause, per the catalogue's advisory-id rule |
| `bkit.advisories.ignore` lists `project-docs-missing` and a doc is empty or an unchanged starter | `dropTipSilencedAdvisories` also drops `project-docs-empty` and `project-docs-unpopulated`, because the silenced tip names all three ids; `project-docs-index-missing` survives |
| A doc starter changes on upgrade and the project keeps the doc under another path, indexed as `Equivalent to docs/{topic}.md` | The upgrade report marks it as adopted, using the same equivalence `detectProjectDocs` uses |
| A doc starter changes on upgrade and the project has no copy | Listed as `changed:` with no adopted marker |
| A non-doc template changes on upgrade | Listed as today, no adopted marker |
| A chart would need more than about 15 nodes | Split by `subgraph` or into a second chart, per the § Docs rule |
| A starter's introduction uses a `##` heading | Not allowed: the introduction uses bold labels only, so `uncoveredBkitDocSections` and the slot/practice check see only skeleton and practice sections |
| The recommended path `docs/{topic}.md` is a symlink or a directory | Not marked adopted: `adoptedProjectDocPath` accepts only a regular file, through `inspectRepoFile` |
| The indexed equivalent path is a symlink, a directory or outside the repo | Not marked adopted: the upgrade report uses `inspectRepoFile` / `isInTreePath`, the same safety checks `detectProjectDocs` uses |
| `.agents/docs.md` is missing or unreadable during `bkit upgrade` | Only the recommended-path check runs; the report never fails because of the index |
| A practice heading kept in `testing.md` or `deployments.md` is renamed | `templates.test.ts` `unresolvedBkitDocAnchors` fails, so practice headings keep their exact text |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test. The issue's matrix names the tip-id test `project-docs tip names the three project-docs advisory ids`; its Task 10 TEST FIRST drops "three". The plan keeps the matrix wording in both places, so the test has one name.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| starter shape: components | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 3 |
| components register row Scope equals its Purpose line | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 3 |
| components Fill these first matches the adoption order | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 3 |
| starter shape: technology | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 4 |
| starter shape: design | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 4 |
| starter shape: architecture | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 5 |
| starter shape: setup | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 5 |
| starter shape: security | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 6 |
| starter shape: observability | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 6 |
| starter shape: testing | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 7 |
| testing marks every section slot or practice and has no box-drawing diagram | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 7 |
| starter shape: data-schema | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 8 |
| starter shape: deployments | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 8 |
| deployments marks every section slot or practice | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 8 |
| starter shape: noise | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 8 |
| capabilities names rollup and refresh and when to run each | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 9 |
| project-docs tip fires when a project doc is missing | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip stays silent when every project doc is populated and indexed | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip names the three project-docs advisory ids | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip stays silent for a Not applicable data-schema and a header-only noise | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip fires when a project doc is empty | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip fires when a project doc is an unchanged starter copy | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| project-docs tip stays silent when project-docs-missing is ignored | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| ignoring project-docs-missing drops the empty and unpopulated advisories and keeps project-docs-index-missing | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 10 |
| missing, empty and unpopulated advisories name the adoption-order section | Unit | `.bkit/core/engine/checks/after/tools.test.ts` | 11 |
| changed doc starter with a project copy is marked adopted | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| changed doc starter indexed under another path is marked adopted | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| changed doc starter with no copy and changed non-doc template are not marked | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| changed doc starter whose recommended path is a symlink is not marked adopted | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| changed doc starter whose recommended path is a directory is not marked adopted | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 12 |
| bkit upgrade prints the adopted marker for a changed starter with a project copy | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 12 |
| adoptedProjectDocPath returns the recommended path, an indexed equivalent or null | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 12 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **`formatTemplateChanges(changes, cwd?)`** in `.bkit/core/engine/install/template-copies.ts` gains an optional second parameter, the project root. Without it the output is byte-for-byte today's, so the existing `describe("formatTemplateChanges")` tests in `template-copies.integration.test.ts` keep passing. Its one caller, `.bkit/core/engine/commands/install/upgrade.ts:819`, passes `process.cwd()`. With it, a changed doc starter whose project copy exists prints `  changed: .bkit/templates/docs/{topic}.md — adopted at {path}, review your copy`, where `{path}` is the copy `adoptedProjectDocPath` returns. No doc starter has a `TEMPLATE_CHANGE_CONSEQUENCES` entry today; if both notes apply to one line, they read `— {consequence}; adopted at {path}, review your copy`.
- **New exported helper `adoptedProjectDocPath(root, topic)`** in `.bkit/core/engine/install/project-docs.ts`: returns `docs/{topic}.md` when it is a safe regular file, else the first usable `Equivalent to docs/{topic}.md` path from `readProjectIndex(root)` via `findIndexedEquivalent`, else `null`.
- **New tip id `project-docs`** in `SETUP_TIPS`. It differs from the advisory ids `project-docs-missing`, `project-docs-empty` and `project-docs-unpopulated`, which the existing "ids are unique and never collide with an advisory id" test checks. Placed after `graphify`, workflows `design`, `plan` and `build`, so the "X leads with Y" and "audit tips are …" tests keep their exact lists. Because the tip's `advisories` names all three ids, one `bkit.advisories.ignore` entry for any of them silences the tip, and `dropTipSilencedAdvisories` then drops all three advisories. Today `ignore: ["project-docs-missing"]` drops only the missing advisory; after this change it also drops every `project-docs-empty` and `project-docs-unpopulated` finding. `project-docs-index-missing`, `project-docs-unindexed` and `project-docs-ambiguous` are not named, so they still survive (see Open Questions).
- **New `.bkit/templates.md` heading `## Project docs — adoption order`.** The tip's `steps` pointer and the advisory action texts name it, and the catalogue test "every docs pointer in steps resolves to a heading" checks it.
- **Starter opener wording:** "Example document." becomes "Starter document." (hand-written) and "Example output." becomes "Generated document." (`capabilities.md`). The introduction moves above `# {Title}` in every starter, as in `components.md` today. Projects that already copied a starter keep their copy; the upgrade report marks the change.
- **Starter section headings:** `## Project facts to record` is removed from the eight starters that have it (architecture, technology, setup, security, observability, testing, data-schema, deployments) and replaced by named skeleton slots (listed per task). Every kept bkit-practice heading keeps its exact text, because the audit templates anchor on it.
- **Index wording:** `TOPIC_INFO[topic].scope` becomes each starter's new Purpose text, so a row `syncProjectDocs` inserts from now on uses the new wording. Rows already in a project's `Project Documents` table are not rewritten.
- **Slot/practice marker:** the first line under every `##` heading of `testing.md` and `deployments.md` is `> **Project slot:** …` or `> **bkit practice:** keep this section; …` (see Open Questions).

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** this issue ships in the same release as #864 (v6.2). Verified: the latest tag is `v6.1.1`, and `.bkit/templates/docs/` is not in it. → If v6.2 is released without #887, the post-#864 starter text needs digests in `LEGACY_STARTER_DIGEST_HISTORY` (`.bkit/core/engine/install/project-docs.ts`) before #887 ships, or an untouched v6.2 copy stops reading as unpopulated.
- **Assumption:** `components.md` from #863 is on this branch. Verified (116 lines). → If not, Task 3 has nothing to edit.
- **Assumption (corrected):** the issue says no engine code keys on "Example document." / "Example output.". No runtime code does, but `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:590` anchors the components entry on `"> Example document."`. → Task 3 changes that anchor; without it the dogfood test fails.
- **Assumption:** #917 has not landed (verified: no `## Test first` in `.bkit/templates/docs/testing.md`). Per the 2026-11-13 issue comment, Task 7 adds `## Test first` after `## What each tier must do`, from bkit's own `docs/testing.md` § Test first (line 298), marked bkit practice. → If #917 lands first, Task 7 keeps its section and only marks it.
- **Assumption:** a starter's introduction uses bold labels, never `##` / `###` headings. → Otherwise `uncoveredBkitDocSections` in `templates.test.ts` and the slot/practice check would treat introduction headings as doc sections.
- **Open Question:** Where does the index row's Scope text live in code? → Owner, at plan review.
  - **Options:** A) Keep `TOPIC_INFO[topic].scope` in `project-docs.ts` and let the starter-shape test assert the starter's given row equals `projectDocRow(topic)` — one more edit per starter, no runtime parsing · B) Parse the Purpose line out of the shipped starter at runtime — single source, but `syncProjectDocs` then depends on starter formatting and on the template folder being present
  - **Recommended:** A) — the test already fails on any drift, and the install path stays free of markdown parsing.
  - **Default if unanswered:** A.
- **Open Question:** Which changed starters get the "adopted" marker in the upgrade report? → Owner, at plan review.
  - **Options:** A) Only the ten `PROJECT_DOC_TOPICS` — matches the issue text, but a changed `components.md` starter goes unmarked: the adopter of `docs/components.md` sees a plain `changed: .bkit/templates/docs/components.md` line and is not told to review the copy · B) The ten topics plus `docs/components.md` by same-path check — covers the wave-2 map, no index equivalence for it · C) B plus `capabilities.md` — but that file is regenerated, not reviewed by hand
  - **Recommended:** B) — components is hand-written and adopted like the ten; capabilities is rebuilt by `pnpm bkit:graph:rollup`.
  - **Default if unanswered:** A (the issue's literal scope); B joins only on a yes.
- **Open Question:** How is a section marked as a project slot or as bkit practice? → Owner, at plan review.
  - **Options:** A) A blockquote first line under the heading: `> **Project slot:** …` or `> **bkit practice:** keep this section; …` — headings keep their text, so audit anchors stay valid · B) A heading suffix such as `## Rollback (project slot)` — visible in a table of contents, but renames every practice heading and breaks the audit anchors in `templates.test.ts`
  - **Recommended:** A) — no audit template or anchor changes.
  - **Default if unanswered:** A.
- **Open Question:** How do the new project-slot headings satisfy `uncoveredBkitDocSections` in `templates.test.ts`? → Owner, at plan review.
  - **Options:** A) Add each slot heading to `UNAUDITED_DOC_SECTIONS` with the existing reason ("prompts for the project's own facts; …") and drop the six `§ Project facts to record` entries · B) Name the slots from an audit template (e.g. a documentation audit anchor) — more audit coverage, but it widens this plan into the audit templates
  - **Recommended:** A) — matches how `§ Project facts to record` is handled today.
  - **Default if unanswered:** A.
- **Open Question:** Which advisory ids does the `project-docs` tip name in `advisories`? → Owner, at plan review.
  - **Options:** A) All three (`project-docs-missing`, `project-docs-empty`, `project-docs-unpopulated`) — follows the catalogue's detection rule that `advisories` names every id the tip's detector raises, and the issue's "names the three project-docs advisory ids" row; but ignoring `project-docs-missing` for a topic that does not apply also drops the empty and unpopulated advisories (see Breaking Changes) · B) Only `project-docs-missing` — ignoring it keeps the empty and unpopulated advisories; but the tip can fire while its advisory is silenced, and the issue's three-ids row changes its assertion
  - **Recommended:** A) — the widening matches every other multi-id tip in `SETUP_TIPS`, and Breaking Changes states it.
  - **Default if unanswered:** A.
- **Open Question:** Does Task 12 fix the equivalence match that accepts a negated or longer path? `listIndexedEquivalents` in `.bkit/core/engine/install/project-docs.ts` accepts a row whose Scope says "Not equivalent to `docs/security.md`" or names `docs/security.mdx` (open deferral `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429`). → Owner, at plan review.
  - **Options:** A) Fold the fix into Task 12: the match accepts only an affirmative `Equivalent to docs/{topic}.md` with an end boundary, and Task 12 adds the test `changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted` — the upgrade marker and `detectProjectDocs` stay in step, but `detectProjectDocs` behaviour changes beyond the issue · B) Keep it deferred — no change outside the upgrade report, but the report tells an adopter to review a copy their index says is not equivalent
  - **Recommended:** A) — the new marker makes the defect visible on every upgrade.
  - **Default if unanswered:** B (the deferral joins the plan only on the owner's yes).
- **Assumption:** with two same-basename indexed rows, `findIndexedEquivalent` takes the first one (open deferral `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-303`), and `adoptedProjectDocPath` inherits that. → If a project indexes two such rows, the marker may name the wrong copy; the line is still marked, so no adopted copy goes unreported.
- **Assumption:** the tip's `fires` reads the main checkout through `tipsBase`, while `bkit check` advisories read `cwd`. → In a worktree whose `docs/` differs from the main checkout, the tip and the advisories can disagree until the branch merges; the "fires exactly when" criterion holds in the main checkout.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **A managed practice guide per topic** (the doc review comment's § 4) — rejected by the owner on 2026-11-13: bkit's practice stays in the starters, marked apart from the project slots.
- **A shared "unfilled" marker in every starter** — rejected: `detectProjectDocs` already calls a doc unfilled only when it matches a shipped starter exactly or holds only headings and comments, so `Not applicable: …` docs and a header-only noise table already read as candidates.
- **Index rows for all twelve starters in the managed block of `.bkit/core/.agents/docs.md`** — rejected: since #864 the adopter adds every row, and each starter's register step gives it.
- **Keeping the introduction below `# {Title}`** — would avoid the dogfood region edits, but `components.md`, the model, puts it above, and an introduction above the title is the one block an adopter deletes whole. Rejected for consistency.
- **A tip that names the next doc to fill** (the review's § 7 item 6) — new code beyond the three advisories; recommended for a future phase once the order has been used.
- **Generating the Purpose line from `TOPIC_INFO`** — see Open Questions; recommended against for now.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Moving files between folders, ownership changes and the adoption warnings themselves | Done by #864; no success criterion here needs it | #864 |
| Plan and audit templates in `.bkit/core/docs/templates/`, other than the § Doc Templates headline and `.bkit/instructions.md:27` | The criteria cover the project-doc starters only | Issue Out of Scope; a follow-up issue |
| A template for `docs/idea.md`, and a `docs/idea.md` for bkit itself | Settled with the owner: free-form, no template | Issue Out of Scope (owner decision 2026-11-13) |
| An advisory that persists until a changed starter is reviewed | Needs stored per-copy state; the upgrade-report marker meets the criterion | A follow-up issue |
| Migrations for already-adopted copies | No criterion asks to rewrite adopted docs | A future advisory or migration when bkit's practice changes |
| Vendor-specific starter content | Starters stay stack-agnostic; vendor names stay marked as examples | `.agents/rules.md` stack-agnostic rule |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `.bkit/instructions.md` § Template Instructions opens "The plan template holds shape only" — the same claim Task 1 rewords at line 27 | `.bkit/instructions.md:9877` | Task 1 | Fold in if the owner agrees; it contradicts the reworded § Doc Templates |
| The `catalogue.ts` text-rule comment says "README" where it means `DETAILS.md` § Templates ready to adopt | `.bkit/core/engine/checks/tips/catalogue.ts` | Task 10 | Fold in as a one-word fix |
| Mermaid charts for other bkit docs (`docs/architecture.md` § Install Lifecycle, `docs/deployments.md` § Run-level decision matrix, § Ship gate + bookkeeping, § One run per branch or pull request, § Smoke trigger plumbing) | #887 doc review comment § 6 | Task 13 | Keep deferred; only the lane graph is required |
| A node cap check for generated Mermaid (tier and graph output) | #887 doc review comment § 3.11 | Task 9 | Needs a design decision |
| Tip that names the next project doc to fill | #887 doc review comment § 7 item 6 | Task 10 | Keep deferred; own issue |
| `docs/templates/bkit-audit-prompts.md:224` (source in `.bkit/core/docs/templates/`) says the supplied templates "hold shape only", which contradicts the reworded § Doc Templates | Plan review (tightness) | Task 1 | Follow-up issue with the `.bkit/instructions.md:9877` row; audit templates are out of scope |
| `findIndexedEquivalent` accepts a negated or longer path (`Not equivalent to docs/security.md`, `docs/security.mdx`) | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` (OPEN) | Task 12 (`adoptedProjectDocPath`) | Owner decides through the matching Open Question; fold into Task 12 on A |
| With two same-basename indexed rows, `findIndexedEquivalent` takes the first | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-303` (OPEN) | Task 12 | Keep deferred; named under Open Questions & Assumptions |
| `ROW_RE` misses a Project Documents row without backticks | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-230` (OPEN) | Task 12 (`readProjectIndex`) | Keep deferred |
| `readStarterText` reads a consumer starter with no symlink or containment check | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-ts-440` / `-441` (OPEN) | Tasks 10 and 11 (`detectProjectDocs`) | Fold into Task 11 if the owner agrees; one call in the same function |
| The `project-docs-ambiguous` advisory echoes an untrusted index path raw | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-ts-506` / `-507` (OPEN) | Task 11 (advisory text) | Keep deferred; a different advisory id |
| The out-of-tree fixture in `tools.test.ts` cannot fail | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-checks-after-tools-test-ts-621` (OPEN) | Task 11 (same test file) | Owner decides |
| The `doc-indexed-equivalent` clause never defines "valid" | `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-instructions-md-3393` (OPEN) | Tasks 1 and 12 | Keep deferred |
| The ci-yml advisory action text carries the same stale "promote after the capstone" fact Task 8 removes from `TOPIC_INFO.deployments` | `.bkit/core/engine/checks/after/tools.ts:304`, plan review (regression risk) | Tasks 8 and 11 | Fold into Task 8 if the owner agrees; one string |
| The security, logs and accessibility audits read "every rule and section" of their doc, so project slots and a header-only noise table read as bkit rules | `bkit-audit-security.md:37`, `bkit-audit-logs.md:41-42`, `bkit-audit-accessibility.md:38`, plan review (regression risk) | Tasks 4, 6 and 8 | Follow-up issue; audit templates are out of scope |
| The graphify rollup writes "Box colour..." guidance into `docs/capabilities.md`, which the new no-colour Mermaid rule forbids | `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py:828-854`, plan review (regression risk) | Tasks 1 and 9 | Follow-up issue on the generator |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The upgrade-report helper reads the project's own `docs/` files and `.agents/docs.md` through the existing `inspectRepoFile` / `isInTreePath` checks, so a symlink or out-of-tree index path is never followed.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no new packages; `package.json` and `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** Vitest `5.x` per `docs/technology.md` § Testing; no toolchain change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file named in the runbook was opened in this session.
- [ ] **Project Context:** `docs/decisions.jsonl` rows `864-project-doc-adoption-index` and `864-project-doc-warning-aggregation` read; the plan keeps their copy-and-own adoption, consumer index and `Equivalent to docs/{topic}.md` mapping. `docs/knowledge.jsonl` rows `kn-7-dist-staleness-pnpm-build-must-run-before-push-for-bk` and `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit` apply and are reflected in the engine-task builds and the Task 13 mirror refresh.
- [ ] **#864 blocker cleared:** #864 is closed, or the owner has removed the `bkit:blocked-by` block naming #864 from the #887 body; otherwise `/bkit-build` stops.
- [ ] **Expected drift:** `bkit check` reports mirror drift for `.bkit/authoring.md` and `.bkit/templates.md` from Task 1 until Task 13 refreshes them; no unit test reads those root mirrors, so no group gate goes red.
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` assessed through `.agents/docs.md`; see `Documentation Consultation`.
- [ ] **Prerequisite Plans:** #864 (`docs/plans/202611/864-move-project-docs-plan.md`) — its starters are already in `.bkit/templates/docs/` on this branch.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no secrets.
- [ ] **Schema State:** not applicable — no database.
- [ ] **Architecture & UI:** checked against `docs/architecture.md` § Project documents boundary; no UI.
- [ ] **Observability:** not applicable — no new logs; advisory text only.
- [ ] **Deployments & Setup:** engine `.ts` edits rebuild `dist/` (`pnpm build && git add dist/`); `.bkit/core/.bkit/*` edits refresh mirrors (`pnpm tsx .bkit/core/engine/cli.ts upgrade`), per `.agents/rules.md`.
- [ ] **Notifications:** not applicable.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| index | `.agents/docs.md` | yes | `.agents/docs.md` managed block line 48 and `## Project Documents` | covered | Rows for deployments, data-schema, testing and security drift from bkit's own docs' Purpose lines (review § 5). Task 13 sets each to its doc's Purpose text. The other six rows already name the same items as their docs' Purpose lines. |
| architecture | `docs/architecture.md` | yes | § Project documents boundary, § Package Boundaries | covered | None |
| technology | `docs/technology.md` | yes | § Testing (Vitest `5.x`, `*.test.ts` / `*.integration.test.ts`) | covered | None |
| security | `docs/security.md` | yes — confirms no new surface | § Scope | covered | None |
| testing | `docs/testing.md` | yes | § CI test tiers (the bkit scaffold) (line 29), § Which tier does a behaviour need? (line 279), § Test first (line 298), § Project documentation lifecycle coverage (line 715), § Key test files (line 722) | covered | Its lane graph is ASCII; Task 13 converts it. § Project documentation lifecycle coverage needs the new tests (Task 13). |
| deployments | `docs/deployments.md` | yes — its starter changes | Rules box (lines 3-10), section headings | partial | The rules box carries the dangling "Pre-push checklist" pointer that the starter also has; the starter fix is Task 8, bkit's copy keeps its own `## Project` section. |
| data-schema | `docs/data-schema.md` | no — no database change | none | none | None |
| design | `docs/design.md` | no — no UI | none | none | None |
| observability | `docs/observability.md` | no — no new logs | none | none | None |
| noise | `docs/noise.md` | no — no signal change | none | none | None |
| setup | `docs/setup.md` | no — no local-setup change | none | none | None |

Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).

## Documentation Warnings

```jsonl
{"topic": "index", "gap": "Project Documents rows for deployments, data-schema, testing and security differ from the Purpose lines of bkit's own docs/deployments.md, docs/data-schema.md, docs/testing.md and docs/security.md", "recommendedPath": ".agents/docs.md", "alternativeEvidence": "The Purpose line at line 4 of each of the four bkit docs", "action": "Task 13 sets each of the four rows' Scope to the Purpose text of the matching bkit doc; bkit's own Purpose lines are not rewritten."}
{"topic": "testing", "gap": "docs/testing.md § CI test tiers (the bkit scaffold) draws the lane graph in ASCII", "recommendedPath": "docs/testing.md", "alternativeEvidence": "The needs: edges in .github/workflows and the lane table in the same section", "action": "Task 13 replaces it with a Mermaid flowchart LR and a sentence saying what the arrows mean."}
```

## Data Schema Integration

No database. The plan changes Markdown starters, two `.bkit/core/.bkit/*` docs and three engine modules.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Shared project-doc writing rules and Mermaid rule | `.bkit/core/.bkit/authoring.md` | Read § Docs (line 226) and § Doc Templates (line 472); `git grep -n mermaid -- .bkit/core/.bkit` | § Docs — has rules header, one-home and index rules; missing Mermaid and fill rules | EXTEND | Add the rules to § Docs; reword § Doc Templates |
| Adoption order | `.bkit/core/.bkit/templates.md` | Read line 16, § Contract (line 46), § Project documents — starters and the index (line 658), § Component map (line 662) | § Project documents — names the starters, no order | EXTEND | New `## Project docs — adoption order` section; link from line 16 and § Project documents |
| Fill-in introduction shape | `.bkit/templates/docs/components.md` | Read all twelve starters | `components.md` intro — has steps and checks; missing Fill these first, Finish against, Not here, `## Open questions` | EXTEND | It becomes the model; the other eleven copy its shape |
| Starter-shape test | `.bkit/core/engine/install/project-docs.test.ts` | Read the file (193 lines); `git grep -n 'templates/docs' -- '*.test.ts'` | `project-docs.test.ts` — tests stripManagedWrapper, legacy digests, syncProjectDocs; `shipped-docs-refs.test.ts` checks refs only | EXTEND | Add a `describe("starter shape")` block here, next to `projectDocRow` |
| Index row source | `.bkit/core/engine/install/project-docs.ts` | Read `TOPIC_INFO`, `projectDocRow`, `syncProjectDocs` | `TOPIC_INFO[topic].scope` feeds `projectDocRow` | EXTEND | Each starter task sets `scope` to its new Purpose text |
| Find a project's adopted copy of a topic | `.bkit/core/engine/install/project-docs.ts` | Read `readProjectIndex`, `findIndexedEquivalent`, `listIndexedEquivalents`, `inspectRepoFile`, `isInTreePath`; `detectProjectDocs` in `tools.ts` (line 478) | Those helpers — cover the parts; no single "where is the adopted copy" function | EXTEND | Add `adoptedProjectDocPath(root, topic)` composed from them in the same module, so the upgrade report and the detector share one equivalence |
| `project-docs` setup tip | `.bkit/core/engine/checks/tips/catalogue.ts` | Read `SetupTip`, `SETUP_TIPS` order, `dependabot-renovate` (advisories pattern); `catalogue.test.ts` constraints | `SETUP_TIPS` — the catalogue; `isTipSilenced` in `checks/tips/index.ts` handles `advisories` | EXTEND | One new entry; no new silencing code |
| Advisory pointer text | `.bkit/core/engine/checks/after/tools.ts` | Read `detectProjectDocs` and its three `action` strings; `tools.test.ts` assertions | The three `action` strings | EXTEND | Append the section pointer; keep `.bkit/templates/docs/`, `.agents/docs.md` and "equivalent" that existing tests assert |
| Adopted marker in upgrade report | `.bkit/core/engine/install/template-copies.ts` | Read `formatTemplateChanges`, `formatChangedLine`, `TEMPLATE_CHANGE_CONSEQUENCES`; caller `upgrade.ts:819` | `formatChangedLine` — builds each `changed:` line | EXTEND | Optional `cwd`; note appended in `formatChangedLine` |
| Slot/practice marker check | `.bkit/core/engine/install/project-docs.test.ts` | `git grep -n 'bkit practice\|Project slot'` (no hits) | None — no marker exists | EXTEND | A helper in the same test file as the shape check; no new file |
| Template audit coverage of new headings | `.bkit/core/engine/audits/templates/templates.test.ts` | Read `UNAUDITED_DOC_SECTIONS` (line 111), `uncoveredBkitDocSections`, `unresolvedBkitDocAnchors` | `UNAUDITED_DOC_SECTIONS` | EXTEND | New slot headings added, `§ Project facts to record` entries removed |
| Dogfood comparison of bkit's own copies | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Read lines 483-600 | The `docs/*.md` entries | EXTEND | Each entry gains a region edit removing the starter's introduction; components anchor becomes `"> Starter document."` |

## Architecture & Component Changes

Decisions (see Open Questions for the options):

- The introduction sits above `# {Title}` and uses bold labels only.
- A starter's index row is locked by test to `projectDocRow(topic)`; bkit's own `.agents/docs.md` rows follow bkit's own docs' Purpose lines, as the issue's Task 13 says.
- **Fill these first** = the sources of solid arrows and **Finish against** = the sources of dotted arrows into the topic's node in the adoption-order chart, or `none`. The chart gains a dotted `DATA -.-> SEC` arrow, because security's PII table "Where stored" column is finished against data-schema (doc review § 3.4).
- Slot/practice is marked by a blockquote first line; new headings `uncoveredBkitDocSections` reports go in `UNAUDITED_DOC_SECTIONS`.
- The `project-docs` tip names all three advisory ids, and the widening of `bkit.advisories.ignore` is stated under Breaking Changes.
- The upgrade marker is exactly `— adopted at {path}, review your copy`.

**Ledger rows:** 887-project-doc-intro-placement, 887-project-doc-index-row-source, 887-project-doc-slot-practice-marker, 887-project-docs-tip-placement, 887-upgrade-report-adopted-marker, 887-adoption-order-finish-against, 887-project-docs-move-864, 887-plan-audit-template-instructions, 887-idea-md-template, 887-persistent-starter-review-advisory, 887-adopted-copy-migrations, 887-starter-vendor-content

### Database Migrations

None

### Shared rules and adoption order (docs)

#### [MODIFY] `.bkit/core/.bkit/authoring.md`

- **Existence Check:** exists; § Docs at line 226, § Doc Templates at line 472.
- § Docs gains the shared rules from the issue's Task 1 (Mermaid for flow, order, dependency or relationship; plain text for trees and command output; one sentence on what arrows mean; node names from the doc's tables; about 15 nodes, else `subgraph` or a second chart; only `flowchart`, `sequenceDiagram`, `erDiagram`, `stateDiagram-v2`; quoted labels; no colours, `style` or `classDef`; current state only; facts from code, config or an approved spec; unknowns under `## Open questions`; one home per topic; tables over prose; name the file that holds a value; `Not applicable: {reason}` as the empty state).
- § Docs scope line and the `docs/*.md` row of § Which Sections Apply also name `.bkit/templates/docs/*.md`, so the starters fall under § Docs; the § Docs Rules header rule describes the box the starters carry (**Purpose**, the rules, **Not here**, **Update when**).
- § Doc Templates: "Template is shape, prompt owns rules" reworded; adds that project-doc starters carry their own fill-in steps.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** exists; line 27 row for `## Template Instructions`.
- Drops "shape-only". Kept in sync with `pnpm instructions:sync`; checked by `tools/instructions.test.ts`.

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** exists; line 16, § Project documents — starters and the index (line 658).
- New `## Project docs — adoption order`: waves table, the Mermaid chart from the review's § 2.2 plus a dotted `DATA -.-> SEC` arrow, its dotted-arrow notes (including "data-schema → security: the PII table's Where stored column is finished against the schema"), and the `docs/idea.md` rule. Line 16 limits the `bkit tips` order to tool templates and links the new section. `.bkit/templates.md` is the templates index, so this also meets the "Index updates" rule.

### Starters

#### [MODIFY] `.bkit/templates/docs/{components,technology,design,architecture,setup,security,observability,testing,data-schema,deployments,noise,capabilities}.md`

- **Existence Check:** all twelve exist.
- Introduction above `# {Title}` with the parts the Success Criteria list; rules box with **Purpose**, **Not here**, **Update when** and a link to `.bkit/authoring.md` § Docs; `##` skeleton per the issue's tasks; `## Open questions`. No `#NN` issue refs (`shipped-docs-refs.test.ts` ISSUE_REF), no consumer names, stack-agnostic examples.

#### [MODIFY] `.bkit/core/engine/install/project-docs.ts`

- **Existence Check:** exists.
- `TOPIC_INFO[topic].scope` set to each starter's Purpose text (Tasks 4-8, one topic per starter).
- New exported `adoptedProjectDocPath(root, topic): string | null` (Task 12), built from `inspectRepoFile`, `readProjectIndex` and `findIndexedEquivalent` with an `isInTreePath` + regular-file `usable` check.

### Engine — tips, advisories, upgrade report

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.ts`

- **Existence Check:** exists; `graphify` entry at line 389.
- New `project-docs` entry after `graphify`: `workflows: ["design", "plan", "build"]`; `advisories: ["project-docs-missing", "project-docs-empty", "project-docs-unpopulated"]`; `steps` "`.bkit/templates.md` § Project docs — adoption order."; `fires` true when `detectProjectDocs` returns any of the three ids not suppressed.

#### [MODIFY] `.bkit/core/engine/checks/after/tools.ts`

- **Existence Check:** exists; `detectProjectDocs` at line 478.
- Each of the three `action` strings gains "Fill in the order in `.bkit/templates.md` § Project docs — adoption order." The inline fix stays (advisories self-contained).

#### [MODIFY] `.bkit/core/engine/install/template-copies.ts`

- **Existence Check:** exists.
- `formatTemplateChanges(changes, cwd?)`; for each changed rel `docs/{topic}.md` (posix-normalised) where `topicOfPath(rel)` is a topic and `adoptedProjectDocPath(cwd, topic)` is non-null, the `changed:` line ends `— adopted at {path}, review your copy`, e.g. `  changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy`. A line that also has a `TEMPLATE_CHANGE_CONSEQUENCES` note reads `— {consequence}; adopted at {path}, review your copy`.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.ts`

- **Existence Check:** exists; line 819.
- Passes `process.cwd()` as the second argument.

#### [MODIFY] `DETAILS.md`

- **Existence Check:** exists; § Templates ready to adopt (line 309) has no project-docs row.
- New row with the same benefit text as the tip and the section opener.

### Tests and bkit's own docs

#### [MODIFY] `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`

- **Existence Check:** both exist.
- See `Reuse Inventory`; updated by each starter task for its own topics.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

- **Existence Check:** exists.
- One spawned-CLI case proving `upgrade.ts` passes the project root to `formatTemplateChanges` (Task 12).

#### [MODIFY] `docs/components.md`

- **Existence Check:** exists; rules box at lines 1-13.
- Its rules box equals the new starter rules box byte for byte, because the dogfood entry keeps the span from `# Components` to `## Repository purpose` unadapted (Task 3).

#### [MODIFY] `docs/testing.md`, `.agents/docs.md`, `.bkit/authoring.md`, `.bkit/templates.md`

- **Existence Check:** all exist.
- Lane graph to Mermaid; four index rows set to bkit's own docs' Purpose text; mirrors refreshed by `pnpm tsx .bkit/core/engine/cli.ts upgrade`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `## Project facts to record` in eight starters (architecture, technology, setup, security, observability, testing, data-schema, deployments) | Named skeleton slot sections | DELETE | The skeleton slots hold the same prompts with bracketed fields |
| ASCII lane graph in `docs/testing.md` § CI test tiers (the bkit scaffold) | Mermaid `flowchart LR` | DELETE | The new § Docs Mermaid rule |
| ASCII lane graph in `.bkit/templates/docs/testing.md` | Mermaid `flowchart LR`, `needs:` / `if:` notes moved to the lanes table | DELETE | Same rule; the testing shape test fails on box-drawing characters |
| `UNAUDITED_DOC_SECTIONS` entries for `§ Project facts to record` | Entries for the new slot headings | DELETE | The heading no longer exists |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | None expected; add a row if the dogfood region edits surface a gotcha |
| `docs/decisions.jsonl` | The six `887-*` decision rows listed under `Ledger rows` |
| `docs/deferrals.jsonl` | The six `887-*` deferral rows listed under `Ledger rows`, one per `Out of Scope` row |
| `docs/components.md` | Rules box equals the new starter rules box |
| `docs/architecture.md` | None — § Project documents boundary still holds |
| `docs/technology.md` | None |
| `docs/data-schema.md` | None |
| `docs/design.md` | None |
| `docs/testing.md` | Lane graph to Mermaid; § Project documentation lifecycle coverage names the starter-shape, tip and upgrade-report tests |
| `docs/observability.md` | None — its advisory table lists ids and when each is raised, not action text |
| `.agents/docs.md` | deployments, data-schema, testing and security rows' Scope equals the Purpose text of bkit's own matching doc |
| `.bkit/core/.bkit/authoring.md` | § Docs rules; § Doc Templates headline |
| `.bkit/core/.bkit/templates.md` | Adoption-order section; line 16 |
| `.bkit/instructions.md` | Line 27 |
| `DETAILS.md` | § Templates ready to adopt project-docs row |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Shared rules and adoption order

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Write the shared project-doc writing rules and reword § Doc Templates
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Docs gains the shared rules listed under Architecture (Mermaid rule, current state only, facts from code or an approved spec, `## Open questions`, one home per topic, tables over prose, name the file that holds a value, `Not applicable: {reason}`)
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Doc Templates headline "Template is shape, prompt owns rules" says fill-in instructions sit in the template and rules for acting on it live in the prompts; adds that project-doc starters carry their own fill-in steps because no prompt fills them
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the § Docs scope line and the `docs/*.md` row of § Which Sections Apply also name `.bkit/templates/docs/*.md`
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the § Docs Rules header rule describes the box the starters carry: **Purpose**, the rules, **Not here** and **Update when**
  - **UPDATE:** `.bkit/instructions.md`: line 27, the `## Template Instructions` row no longer calls the plan and audit templates "shape-only"; run `pnpm instructions:sync`
  - **READ:** `.bkit/templates/docs/components.md`: its general writing rules, which move to § Docs in Task 3
  - **READ:** `§ Which Sections Apply` in `.bkit/core/.bkit/authoring.md`: the `docs/*.md` row this task extends to `.bkit/templates/docs/*.md`
  - **DONE WHEN:** § Docs holds every rule listed; the headline "Template is shape, prompt owns rules" no longer appears in `.bkit/core/.bkit/authoring.md`, and § Doc Templates says project-doc starters carry their own fill-in steps; the § Docs scope line and the § Which Sections Apply row name `.bkit/templates/docs/*.md`; the § Docs Rules header rule names **Not here** and **Update when**; `pnpm bkit:lint:prose` passes on both files; `tools/instructions.test.ts` passes
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add the project-docs adoption order to `.bkit/templates.md`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: new `## Project docs — adoption order` section with the waves table (1 `docs/idea.md`; 2 components; 3 technology, design; 4 architecture, setup; 5 security, testing, observability; 6 data-schema, deployments, noise; 7 capabilities), the Mermaid chart with solid "must exist first" and dotted "finished against" arrows from the doc review comment § 2.2 plus a dotted `DATA -.-> SEC` arrow (security's PII table "Where stored" column is finished against data-schema, per doc review § 3.4) and a sentence saying what each arrow means, the dotted-arrow notes with a "data-schema → security" note, and the `docs/idea.md` rule (free-form, kept, not indexed, no template)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: line 16 says the `bkit tips` order covers the tool templates and points to the new section for project docs; § Project documents — starters and the index links to the new section
  - **DONE WHEN:** the section exists with table, chart (node ids and labels as in § 2.2, so the Task 3 test can parse them, and the `DATA -.-> SEC` arrow) and `docs/idea.md` rule; line 16 no longer claims the tips order for project docs; `pnpm bkit:lint:prose` passes; `shipped-docs-refs.test.ts` passes (the file ships, so it holds no `#NN` reference)
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Hand-written starters, waves 2 to 4

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Rewrite `components.md` as the model introduction and add the starter-shape tests
  - **UPDATE:** `.bkit/templates/docs/components.md`: opener line "Starter document."; **Fill these first:** `docs/idea.md`; step 2 reads `docs/idea.md`, the README and any approved spec instead of the other docs; new `## Constraints` section (platforms, offline, live updates, scale, hard external requirements, each naming its source in `docs/idea.md`); open questions under `## Open questions`; general writing rules replaced by a link to `.bkit/authoring.md` § Docs; register step gives the exact `.agents/docs.md` row with Scope = Purpose; introduction uses bold labels, no `##` headings
  - **UPDATE:** `.bkit/core/engine/install/project-docs.test.ts`: a shared `starterShape(topic)` check that reads `.bkit/templates/docs/{topic}.md` and asserts every introduction part (opener line, Fill these first, Finish against, Where the facts come from, numbered steps, If it does not apply, Completion checks, register row), the rules box lines (Purpose, Not here, Update when), `## Open questions`, at least one `[e.g.,` row (`noise`: a header-only table instead), the register row equal to `projectDocRow(topic)` for the ten topics and its Scope equal to the Purpose line, Fill these first / Finish against equal to the solid / dotted arrow sources into the topic's node in `.bkit/core/.bkit/templates.md` § Project docs — adoption order (`none` when the chart has no such arrow), no `##` or `###` heading above `# {Title}`, and no `## Project facts to record` heading. Each later starter task adds its own `starter shape: {topic}` case
  - **UPDATE:** `docs/components.md`: its rules box (lines 1-13) equals the new starter rules box byte for byte, keeping bkit's own body, because the dogfood entry keeps the span from `# Components` to `## Repository purpose` unadapted
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `docs/components.md` region anchor `"> Example document."` becomes `"> Starter document."`
  - **READ:** `§ Which tier does a behaviour need?` in `docs/testing.md`: shape checks are Unit
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the three components tests pass; `docs/components.md` lines 1-13 equal the starter's rules box; `dogfood-templates.test.ts` and `shipped-docs-refs.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: components` fails on today's starter, which has no Fill these first, Not here or `## Open questions`
    - `.bkit/core/engine/install/project-docs.test.ts` `components register row Scope equals its Purpose line` fails because today's register step gives no row text
    - `.bkit/core/engine/install/project-docs.test.ts` `components Fill these first matches the adoption order` fails because the starter names no prerequisites

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rewrite `technology.md` and `design.md` (wave 3)
  - **UPDATE:** `.bkit/templates/docs/technology.md`: introduction above `# Technology`, rules box (never type a version number) and skeleton `## Stack` (Layer, Technology, Version from, Chosen for), `## Conventions`, `## Not used`, `## Open questions`; no chart
  - **UPDATE:** `.bkit/templates/docs/design.md`: introduction; the four hard rules become bracketed defaults the project confirms; the machine-checked token guidance split into fill steps and the two rules that survive adoption, keeping the heading `## Machine-checked reference` verbatim (the gates audit anchors on it); skeleton `## Tokens`, `## Typography`, `## Spacing and layout`, `## Components`, `## Accessibility`, `## Open questions`; Not applicable: no user interface
  - **UPDATE:** `TOPIC_INFO.technology.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new technology Purpose line
  - **UPDATE:** `TOPIC_INFO.design.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new design Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new technology heading that `uncoveredBkitDocSections` reports added with the existing reason, `technology.md § Project facts to record` removed; design's sections stay covered by the accessibility audit's every-rule-and-section anchor
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/technology.md` and `docs/design.md` entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `starter shape: technology` and `starter shape: design` pass; `templates.test.ts` and `dogfood-templates.test.ts` pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: technology` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: design` fails on today's starter, which has no fill-in introduction

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Rewrite `architecture.md` and `setup.md` (wave 4)
  - **UPDATE:** `.bkit/templates/docs/architecture.md`: introduction, rules box, skeleton `## System context`, `## Containers`, `## Package boundaries`, `## Environments`, `## Open questions`; one `flowchart LR` with a `subgraph` per runtime, the same shape the architecture audit draws
  - **UPDATE:** `.bkit/templates/docs/setup.md`: introduction, rules box (never write a secret value), skeleton `## Prerequisites`, `## First-time setup`, `## Environment variables`, `## Local services`, `## Everyday commands`, `## Troubleshooting`, `## Open questions`; no chart
  - **UPDATE:** `TOPIC_INFO.architecture.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new architecture Purpose line
  - **UPDATE:** `TOPIC_INFO.setup.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new setup Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new architecture and setup heading that `uncoveredBkitDocSections` reports added with the existing reason, the two `§ Project facts to record` entries removed
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/architecture.md` and `docs/setup.md` entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `starter shape: architecture` and `starter shape: setup` pass; `templates.test.ts` and `dogfood-templates.test.ts` pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: architecture` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: setup` fails on today's starter, which has no fill-in introduction

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Hand-written starters, waves 5 and 6, and capabilities

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rewrite `security.md` and `observability.md` (wave 5)
  - **UPDATE:** `.bkit/templates/docs/security.md`: introduction, rules box, skeleton `## Trust boundaries`, `## Authentication`, `## Authorization`, `## Input validation`, `## Rate limiting`, `## Secrets`, `## PII`, `## Supply chain`, `## Open questions`; a `sequenceDiagram` of one authenticated request; § Supply-Chain (GitHub Actions) kept with its exact heading and marked as bkit practice; `## Project facts to record` removed; **Finish against:** `docs/data-schema.md` (the PII table's "Where stored" column)
  - **UPDATE:** `.bkit/templates/docs/observability.md`: introduction, rules box (Not here points at testing for smoke checks), skeleton `## Signal pipeline`, `## Log format`, `## Correlation`, `## Error tracking`, `## Alerts`, `## Where to look`, `## Open questions`; a `flowchart LR` from app to people; `## Project facts to record` removed
  - **UPDATE:** `TOPIC_INFO.security.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new security Purpose line
  - **UPDATE:** `TOPIC_INFO.observability.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new observability Purpose line
  - **READ:** `uncoveredBkitDocSections` in `.bkit/core/engine/audits/templates/templates.test.ts`: security and observability are covered by the security and logs audits' every-rule-and-section anchors, so no `UNAUDITED_DOC_SECTIONS` entry
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/security.md` and `docs/observability.md` entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `starter shape: security` and `starter shape: observability` pass; neither `.bkit/templates/docs/security.md` nor `.bkit/templates/docs/observability.md` has a `## Project facts to record` heading; `templates.test.ts` and `dogfood-templates.test.ts` pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: security` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: observability` fails on today's starter, which has no fill-in introduction

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Rewrite `testing.md` (wave 5), keeping bkit's practice in place
  - **UPDATE:** `.bkit/templates/docs/testing.md`: introduction; rules box keeps "keep the tiers separate" and adds Not here (points at observability for live alerts) and Update when; project slots `## Stack`, `## Tiers this project has`, `## Where tests live`, `## Test data`, `## CI lanes`, `## Test reports`, `## Running locally`, `## Open questions`; every existing practice section kept with its exact heading and marked `> **bkit practice:** …`; each slot marked `> **Project slot:** …`; `## Test first` added after `## What each tier must do` from `docs/testing.md` § Test first and marked bkit practice, unless #917 has landed it; the ASCII lane graph replaced by a `flowchart LR`, its `needs:` / `if:` notes moved to the lanes table; `## Project facts to record` removed
  - **UPDATE:** `.bkit/core/engine/install/project-docs.test.ts`: a `sectionMarks(text)` helper used by this test and Task 8's; the box-drawing check looks only inside fenced code blocks for `▼`, `▲`, `┌` or `┐`, so the "(▲▼ vs the default branch)" prose at line 482 does not trip it
  - **UPDATE:** `TOPIC_INFO.testing.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new testing heading that `uncoveredBkitDocSections` reports added with the existing reason (`## Test first` and `## Open questions` among them), `testing.md § Project facts to record` removed; `## CI lanes` gets no entry, because the adoption audit already names it and an entry makes `templates.test.ts` fail
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/testing.md` entry gains a region edit removing the starter's introduction
  - **READ:** `§ Test first` in `docs/testing.md`: the section this task copies into the starter (line 298)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** both testing tests pass; `templates.test.ts` (anchors from the flakes, gates, ci-performance and testing audits) and `dogfood-templates.test.ts` pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: testing` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `testing marks every section slot or practice and has no box-drawing diagram` fails on today's unmarked sections and the ASCII lane graph

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6)
  - **UPDATE:** `.bkit/templates/docs/data-schema.md`: introduction, rules box (Pending defined; link a generated schema instead of copying it), skeleton `## Overview`, one `## {table}` section shape, `## Functions`, `## Open questions`; an `erDiagram` of keys and relationships; Not applicable: no persistent store
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: introduction, rules box (dangling "Pre-push checklist" reference at line 11 removed; `--no-verify` line dropped as `.agents/rules.md` owns it), project slots `## Environments`, `## Release path`, `## Secrets and env config`, `## Branch protection`, `## Migrations at deploy time`, `## Rollback`, `## Open questions`; the rollback runbooks and every other practice section kept with exact headings as bkit practice; every section marked slot or practice; a `flowchart LR` release path
  - **UPDATE:** `.bkit/templates/docs/noise.md`: introduction (Fill these first: observability), one table header `| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |` and no rows
  - **UPDATE:** `TOPIC_INFO["data-schema"].scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new data-schema Purpose line
  - **UPDATE:** `TOPIC_INFO.deployments.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new deployments Purpose line, which drops "promote after the capstone"
  - **UPDATE:** `TOPIC_INFO.noise.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new noise Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new data-schema and deployments heading that `uncoveredBkitDocSections` reports added with the existing reason, their `§ Project facts to record` entries removed
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the three entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 3, 7
  - **DONE WHEN:** the four tests below pass; no starter in `.bkit/templates/docs/` has a `## Project facts to record` heading; `templates.test.ts` (anchors from the config, cost, dependencies, reliability, security, gates and ci-performance audits) and `dogfood-templates.test.ts` pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: data-schema` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: deployments` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: noise` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `deployments marks every section slot or practice` fails on today's unmarked sections

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Rewrite the `capabilities.md` introduction (wave 7, generated)
  - **UPDATE:** `.bkit/templates/docs/capabilities.md`: opener line "Generated document."; prerequisites (code exists, the graphify templates adopted per `.bkit/templates.md` § graphify); `pnpm bkit:graph:rollup` builds from the working tree and `pnpm bkit:graph:refresh` from the staged files in a throwaway checkout, and when to run each; what stays hand-maintained (the Overrides block, `scripts/graphify/bkit-graph-drift-rules.json`); the register row; completion checks including the comparison with `docs/components.md`
  - **READ:** `§ graphify — map` in `.bkit/core/.bkit/templates.md`: the adoption steps the prerequisites point at (line 668)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the capabilities test passes; `dogfood-templates.test.ts` (capabilities is `generated`) passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `capabilities names rollup and refresh and when to run each` fails while the starter names the two commands without saying when to run each

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Point adopters at the order

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Add the `project-docs` setup tip
  - **UPDATE:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`: new `project-docs` entry after `graphify`, `workflows: ["design", "plan", "build"]`, whose `fires` calls `detectProjectDocs` and is true when it returns `project-docs-missing`, `project-docs-empty` or `project-docs-unpopulated`; `advisories` names those three ids; `ask` and `steps` point at `.bkit/templates.md` § Project docs — adoption order
  - **UPDATE:** `DETAILS.md`: § Templates ready to adopt gains a project-docs row whose benefit reads the same as the tip and the `.bkit/templates.md` section opener, per the catalogue's text rule
  - **READ:** `isTipSilenced` in `.bkit/core/engine/checks/tips/index.ts`: an ignored advisory id silences the tip
  - **READ:** `dropTipSilencedAdvisories` in `.bkit/core/engine/checks/tips/index.ts`: a silenced tip drops every advisory its `advisories` names, applied to all after-phase findings at `.bkit/core/engine/checks/after/index.ts:531`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the eight tip tests and the existing catalogue tests ("every docs pointer in steps resolves to a heading", "ids are unique and never collide with an advisory id", "X leads with Y", "audit tips are …") pass; `DETAILS.md` § Templates ready to adopt has a project-docs row whose benefit text equals the tip's `line` and the opener of `.bkit/core/.bkit/templates.md` § Project docs — adoption order; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is missing` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when every project doc is populated and indexed` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip names the three project-docs advisory ids` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent for a Not applicable data-schema and a header-only noise` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is empty` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip fires when a project doc is an unchanged starter copy` fails because no such tip exists
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-docs tip stays silent when project-docs-missing is ignored` fails because no `project-docs` tip is reported as suppressed
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `ignoring project-docs-missing drops the empty and unpopulated advisories and keeps project-docs-index-missing` fails because today the `project-docs-empty` and `project-docs-unpopulated` findings survive the ignore entry

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Point the project-doc advisories at the adoption order
  - **UPDATE:** `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts`: the `action` text of `project-docs-missing`, `project-docs-empty` and `project-docs-unpopulated` names `.bkit/templates.md` § Project docs — adoption order, keeping the inline fix and the `.bkit/templates/docs/`, `.agents/docs.md` and "equivalent" wording existing tests assert
  - **READ:** `docs/observability.md`: its project-docs advisory table (lines 214-220) lists ids and when each is raised, not action text, so it stays unchanged
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the advisory test and the existing `tools.test.ts` project-docs tests pass; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `missing, empty and unpopulated advisories name the adoption-order section` fails on today's action text, which has no "Project docs — adoption order"

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Mark adopted doc starters in the upgrade report
  - **UPDATE:** `.bkit/core/engine/install/project-docs.ts`: new exported `adoptedProjectDocPath(root, topic)` (recommended path when a safe regular file, else `findIndexedEquivalent(readProjectIndex(root) rows, topic, usable)`, else `null`)
  - **UPDATE:** `formatTemplateChanges` in `.bkit/core/engine/install/template-copies.ts`: optional `cwd`; a changed `docs/{topic}.md` starter whose `adoptedProjectDocPath(cwd, topic)` is non-null gets `— adopted at {path}, review your copy` on its `changed:` line, or `— {consequence}; adopted at {path}, review your copy` when a `TEMPLATE_CHANGE_CONSEQUENCES` note also applies; no `cwd` → today's output; a missing or unreadable `.agents/docs.md` never throws
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.ts`: the `formatTemplateChanges` call at line 819 passes `process.cwd()`
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: one spawned-CLI case on a temp repo with an adopted `docs/architecture.md` and a changed architecture starter
  - **READ:** `.bkit/core/engine/checks/after/tools.ts`: how `detectProjectDocs` resolves an indexed equivalent
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the nine upgrade-report and `adoptedProjectDocPath` tests and the existing `describe("formatTemplateChanges")` tests pass; the spawned `bkit upgrade` prints `changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy`; `pnpm build && git add dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with a project copy is marked adopted` fails because no "review your copy" marker exists
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter indexed under another path is marked adopted` fails because no "review your copy" marker exists
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter with no copy and changed non-doc template are not marked` fails because the same fixture's adopted starter line has no "review your copy" marker; the test also asserts the no-copy starter line and the non-doc template line carry none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a symlink is not marked adopted` fails because the same fixture's regular-file copy of another topic has no "review your copy" marker; the test also asserts the symlinked topic's line carries none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose recommended path is a directory is not marked adopted` fails because the same fixture's regular-file copy of another topic has no "review your copy" marker; the test also asserts the directory topic's line carries none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted` fails because the same fixture's in-tree indexed equivalent has no "review your copy" marker; the test also asserts the symlinked and out-of-tree equivalents' lines carry none
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report` fails because the recommended-path copy has no "adopted at docs/" marker
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `bkit upgrade prints the adopted marker for a changed starter with a project copy` fails because the printed `changed:` line has no "review your copy" marker
    - `.bkit/core/engine/install/project-docs.test.ts` `adoptedProjectDocPath returns the recommended path, an indexed equivalent or null` fails because `adoptedProjectDocPath` is not exported

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Bring bkit's own docs and mirrors in line
  - **UPDATE:** `docs/testing.md`: the ASCII lane graph in § CI test tiers (the bkit scaffold) becomes a Mermaid `flowchart LR`, with a sentence saying what the arrows mean; § Project documentation lifecycle coverage names the starter-shape, tip and upgrade-report tests
  - **UPDATE:** `.agents/docs.md`: the `docs/deployments.md` row no longer says "promote after the capstone"; the Scope of the `docs/deployments.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/security.md` rows equals the Purpose text of bkit's own matching doc (line 4 of each), as the issue says; bkit's own Purpose lines are not rewritten, and the other six rows already name the same items as their docs' Purpose lines
  - **UPDATE:** `.bkit/authoring.md`: refreshed from `.bkit/core/.bkit/authoring.md` with `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.bkit/templates.md`: refreshed from `.bkit/core/.bkit/templates.md` by the same upgrade run
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  - **DONE WHEN:** `node dist/cli.js check` reports no drift; each of the four `.agents/docs.md` rows' Scope equals the Purpose text of its bkit doc; `docs/testing.md` § Project documentation lifecycle coverage names `install/project-docs.test.ts`, `checks/tips/catalogue.test.ts`, `install/template-copies.integration.test.ts` and `commands/install/upgrade.integration.test.ts`; no fenced code block in `docs/*.md` holds `▼`, `┌` or `┐` (the lane graph's arrow and corner characters); `dogfood-templates.test.ts` passes
  - **TEST FIRST:** n/a — docs and mirror refresh

<!-- bkit:task 13 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** existing tests kept green: `templates.test.ts`, `dogfood-templates.test.ts`, `shipped-docs-refs.test.ts`, `catalogue.test.ts`, `tools.test.ts` project-docs block, `template-copies.integration.test.ts` `describe("formatTemplateChanges")`, `tools/instructions.test.ts`.
- [ ] **Build Configuration:** test files stay `*.test.ts` / `*.integration.test.ts`, excluded from `dist/` as today; `pnpm build && git add dist/` after each engine task.
- [ ] **Unit (`.bkit/core/engine/install/project-docs.test.ts`):** sixteen starter-shape, register-row, adoption-order, slot/practice and capabilities cases read the shipped starters with no fixtures; one `adoptedProjectDocPath` case runs on a temp directory.
- [ ] **Unit (`.bkit/core/engine/checks/tips/catalogue.test.ts`, `.bkit/core/engine/checks/after/tools.test.ts`):** eight tip cases and one advisory case on temp directories built with the existing `writeIndex` / `writeDoc` helpers.
- [ ] **Integration (`.bkit/core/engine/install/template-copies.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`):** seven upgrade-report cases on a scratch project under `os.tmpdir()`, and one spawned `bkit upgrade` case that reads the printed "Templates updated" block.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch project with only `docs/components.md` and `docs/technology.md`, run `node dist/cli.js check` and `node dist/cli.js tips`: the `project-docs-missing` action and the `project-docs` tip both name `.bkit/templates.md` § Project docs — adoption order.
- [ ] **Step 2:** Copy `.bkit/templates/docs/architecture.md` to `docs/architecture.md`, follow its introduction, and confirm its **Fill these first** line and register row match the adoption-order section and `.agents/docs.md`.
- [ ] **Step 3:** Edit a starter in the package, run `node dist/cli.js upgrade` in the scratch project, and confirm the "Templates updated" report prints `changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy` and leaves a non-doc template unmarked.
- [ ] **Step 4:** Render `.bkit/templates.md` § Project docs — adoption order and `docs/testing.md` § CI test tiers (the bkit scaffold) on GitHub and confirm both Mermaid charts draw.
