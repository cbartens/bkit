Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 1 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-input-2.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/related-deferrals.md`, `docs/plans/202611/logs/887-review-doc-starters/related-failures.md`, `docs/plans/202611/logs/887-review-doc-starters/related-issues.md` |
| plan-review | CONCERNS | 5 | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-review-1.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-review-2.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/887-review-doc-starters/plan-input-2.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-v1-draft.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/887-review-doc-starters/related-deferrals.md`, `docs/plans/202611/logs/887-review-doc-starters/related-failures.md`, `docs/plans/202611/logs/887-review-doc-starters/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-review-1.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-review-2.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md`, `docs/plans/202611/logs/887-review-doc-starters/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

bkit ships twelve project-doc starters in `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise, setup (moved there by [#864 — Move project docs to templates with adoption warnings](https://github.com/cbartens/bkit/issues/864)), plus components and capabilities. Only `components.md` tells the person or agent adopting it how to fill it in: where to look, numbered steps, completion checks, and "remove this introduction when done". The rest stop at a Purpose line and a few rules. `architecture.md`, `technology.md`, `data-schema.md` and `noise.md` have no body at all. `testing.md` (512 lines) and `deployments.md` (435 lines) are mostly bkit's own best practice, with a short "Project facts to record" list on top.

After this change every starter tells its adopter what to read, what to fill in, in which order, and how to tell it is done. Writing rules that apply to every doc are written once in `.bkit/authoring.md` § Docs, and every starter links to them. One adoption order, starting from the owner's `docs/idea.md`, lives in `.bkit/templates.md`. bkit's best practice stays inside the testing and deployments starters, clearly marked apart from the blanks the project fills. bkit also points adopters at the order: a new `bkit tips` entry, reworded project-doc advisories, and a marker in the upgrade report when a doc starter the project has adopted changes.

The per-starter detail (rules box wording, skeleton headings, sources, completion checks, chart type, wave) is in the doc review comment linked under References, § 3. Where that comment and this body disagree, this body wins.

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
- In `testing.md` and `deployments.md`, every `##` section is marked either as a project slot to fill or as bkit practice to keep, so an adopter can tell which is which.
- A `project-docs` tip fires exactly when a `project-docs-missing`, `project-docs-empty` or `project-docs-unpopulated` advisory does. Those advisories point at the adoption-order section. The `bkit upgrade` "Templates updated" report marks each changed doc starter whose project copy exists as adopted, to review.

### Process Sketch

- **WHEN** an adopter opens any hand-written starter **→ THEN** it reads an introduction above `# {Title}` naming what to fill first, what to finish against, where the facts come from, numbered steps, the empty state, completion checks and the exact `.agents/docs.md` row, then a rules box with Purpose, Not here and Update when.
- **WHEN** the adopter opens `.bkit/templates.md` § Project docs — adoption order **→ THEN** the waves table and Mermaid chart give the same prerequisites as each starter's **Fill these first** line.
- **WHEN** `bkit check` or `bkit tips` runs in a project with a missing, empty or untouched project doc **→ THEN** the matching `project-docs-*` advisory names the adoption-order section and the `project-docs` tip fires.
- **IF** a doc says `Not applicable: {reason}`, `docs/noise.md` holds only its rules box and table header, or `bkit.advisories.ignore` lists `project-docs-missing` **→ THEN** no tip for that cause.
- **WHEN** `bkit upgrade` changes a doc starter the project has a copy of, at the recommended path or an affirmatively indexed equivalent **→ THEN** its `changed:` line ends `— adopted at {path}, review your copy`.
- **IF** the starter has no copy, the copy is a symlink, a directory or out of the repo, the index row says "Not equivalent to", or the template is not a doc starter **→ THEN** the line has no adopted marker and the report never fails.

### Concrete Example

**Setup:** A developer adopts bkit in a new app. `docs/idea.md` holds the owner's notes; `docs/components.md` and `docs/technology.md` exist; no other project doc exists. bkit was upgraded from the release before this change.

**Steps:**

1. Developer runs `bkit check` → System reports `project-docs-missing` for `docs/architecture.md` (and the other absent topics), whose action text says to copy the starter from `.bkit/templates/docs/`, add its `.agents/docs.md` row, and follow `.bkit/templates.md` § Project docs — adoption order.
2. Developer runs `bkit tips` → System lists the `project-docs` tip pointing at the same section.
3. Developer opens the adoption-order section → System shows architecture and setup in wave 4, both needing technology first.
4. Developer copies `.bkit/templates/docs/architecture.md` to `docs/architecture.md` → The introduction says **Fill these first:** `docs/technology.md`, lists the steps, and gives the exact row `` | `docs/architecture.md` | {phases} | {Purpose text} | ``.
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
| A doc starter changes on upgrade and the project keeps the doc under another path, indexed as `Equivalent to docs/{topic}.md` | The upgrade report marks it as adopted, using the same equivalence `detectProjectDocs` uses |
| A doc starter changes on upgrade and the project has no copy | Listed as `changed:` with no adopted marker |
| The components starter changes on upgrade and `docs/components.md` is a regular file in the repo | Marked `— adopted at docs/components.md, review your copy` by a same-path check; no index equivalence is read for components |
| An index row says "Not equivalent to `docs/{topic}.md`" or names `docs/{topic}.mdx`, and `docs/{topic}.md` is absent | `detectProjectDocs` still reports `project-docs-missing` for the topic |
| An index row says "Not equivalent to `docs/{topic}.md`" and `docs/{topic}.md` is present but unindexed | `syncProjectDocs` registers `docs/{topic}.md` in `.agents/docs.md` |
| A non-doc template changes on upgrade | Listed as today, no adopted marker |
| A chart would need more than about 15 nodes | Split by `subgraph` or into a second chart, per the § Docs rule |
| `bkit.advisories.ignore` lists `project-docs-missing` and a doc is empty or an unchanged starter | `dropTipSilencedAdvisories` also drops `project-docs-empty` and `project-docs-unpopulated`, because the silenced tip names all three ids; `project-docs-index-missing` survives |
| A starter's introduction uses a `##` heading | Not allowed: the introduction uses bold labels only, so `uncoveredBkitDocSections` and the slot/practice check see only skeleton and practice sections; the starter-shape test fails |
| The recommended path `docs/{topic}.md` is a symlink or a directory | Not marked adopted: `adoptedProjectDocPath` accepts only a regular file, through `inspectRepoFile` |
| The indexed equivalent path is a symlink, a directory or outside the repo | Not marked adopted: the upgrade report uses `inspectRepoFile` / `isInTreePath`, the same safety checks `detectProjectDocs` uses |
| An index row's Scope says "Not equivalent to `docs/{topic}.md`" or names a longer path such as `docs/{topic}.mdx` or `docs/{topic}.md.bak` | Names no equivalent: no adopted marker, `detectProjectDocs` still reports the topic missing, and `syncProjectDocs` still registers a present `docs/{topic}.md` |
| `.agents/docs.md` is missing or unreadable during `bkit upgrade` | Only the recommended-path check runs; the report never fails because of the index |
| A practice heading kept in `testing.md` or `deployments.md` is renamed | `templates.test.ts` `unresolvedBkitDocAnchors` fails, so practice headings keep their exact text |
| The testing starter already holds `## Test first` from #917 when Task 7 runs | Task 7 keeps its text and adds only the bkit-practice marker; with no such section, Task 7 adds it from `docs/testing.md` § Test first |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

**Answered by the owner (2026-11-14), carried as decisions:**

- **Answered:** the tip-id test keeps the name `project-docs tip names the three project-docs advisory ids` in the matrix and in Task 10.
- **Answered, option A:** the equivalence match in `listIndexedEquivalents` (`.bkit/core/engine/install/project-docs.ts`) is fixed in Task 12 of the runbook. It accepts only an affirmative `Equivalent to docs/{topic}.md` whose path ends at a boundary (backtick, whitespace, punctuation or end of cell), and the upgrade-report task adds the test `changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted`. Plan review 2 added two tests for the matcher's other callers; with them the upgrade-report work exceeds the 10-test cap of one task, so the matcher fix and its two caller tests are Task 12, and the upgrade-report marker with that test is Task 13, which depends on Task 12. This closes the open deferral `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` once built; Breaking Changes states the effect on `detectProjectDocs` and `syncProjectDocs`.

**Assumptions:**

- **Assumption:** this issue ships in the same release as #864 (v6.2). Verified: the latest tag is `v6.1.1`, and `.bkit/templates/docs/` is not in it. → If v6.2 is released without #887, the post-#864 starter text needs digests in `LEGACY_STARTER_DIGEST_HISTORY` (`.bkit/core/engine/install/project-docs.ts`) before #887 ships, or an untouched v6.2 copy stops reading as unpopulated.
- **Assumption:** `components.md` from #863 is on this branch. Verified (116 lines). → If not, Task 3 has nothing to edit.
- **Assumption (corrected):** the issue says no engine code keys on "Example document." / "Example output.". No runtime code does, but `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` anchors the components entry on `"> Example document."`. → Task 3 changes that anchor; without it the dogfood test fails.
- **Assumption:** #917 is closed, and its commit `959a7a6e9` (which adds `## Test first` to `.bkit/templates/docs/testing.md` after `## What each tier must do`) is on the local `dev` branch but not on this branch or `origin/dev`. Task 7 keeps and marks that section when the branch has it, and otherwise adds the same text from `docs/testing.md` § Test first. → If the branch is not brought up to `dev` and Task 7 adds its own copy, the later merge conflicts in `.bkit/templates/docs/testing.md`; the Pre-Flight rebase item avoids that.
- **Assumption:** a starter's introduction uses bold labels, never `##` / `###` headings. → Otherwise `uncoveredBkitDocSections` in `templates.test.ts` and the slot/practice check would treat introduction headings as doc sections.
- **Assumption (settled by the issue's Task 10):** the `project-docs` tip's `advisories` names all three ids (`project-docs-missing`, `project-docs-empty`, `project-docs-unpopulated`), following the catalogue's detection rule. → Ignoring `project-docs-missing` then also drops the empty and unpopulated advisories through `dropTipSilencedAdvisories` (Breaking Changes). If the owner wants the ignore entry to keep them, the tip names only `project-docs-missing` and can fire while two of its causes are silenced.
- **Assumption:** with two same-basename indexed rows, `findIndexedEquivalent` takes the first one (open deferral `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-303`), and `adoptedProjectDocPath` inherits that. → If a project indexes two such rows, the marker may name the wrong copy; the line is still marked, so no adopted copy goes unreported.
- **Assumption:** the tip's `fires` reads the main checkout through `tipsBase`, while `bkit check` advisories read `cwd`. → In a worktree whose `docs/` differs from the main checkout, the tip and the advisories can disagree until the branch merges; the "fires exactly when" criterion holds in the main checkout.

**Open questions:**

- **Open Question:** Where does the index row's Scope text live in code? → Owner, at plan review.
  - **Options:** A) Keep `TOPIC_INFO[topic].scope` in `project-docs.ts` and let the starter-shape test assert the starter's given row equals `projectDocRow(topic)` — one more edit per starter, no runtime parsing · B) Parse the Purpose line out of the shipped starter at runtime — single source, but `syncProjectDocs` then depends on starter formatting and on the template folder being present
  - **Recommended:** A) — the test already fails on any drift, and the install path stays free of Markdown parsing.
  - **Default if unanswered:** A.
- **Open Question:** Which changed starters get the "adopted" marker in the upgrade report? → Owner, at plan review.
  - **Options:** A) Only the ten `PROJECT_DOC_TOPICS` — the issue's literal scope, but a changed `components.md` starter prints a plain `changed: .bkit/templates/docs/components.md` line and its adopter is not told to review `docs/components.md` · B) The ten topics plus `docs/components.md` by a same-path check — covers the wave-2 map, with no index equivalence for it · C) B plus `capabilities.md` — but that file is regenerated by `pnpm bkit:graph:rollup`, not reviewed by hand
  - **Recommended:** B) — components is hand-written and adopted like the ten, and Success Criterion 5 says "each changed doc starter", which includes `components.md`.
  - **Default if unanswered:** B; Task 13 marks a changed components starter whose `docs/components.md` is a regular file in the repo, asserted in `changed doc starter with a project copy is marked adopted`. On an answer of A, Task 13 drops that assertion and the components check.
- **Open Question:** How is a section marked as a project slot or as bkit practice? → Owner, at plan review.
  - **Options:** A) A blockquote first line under the heading: `> **Project slot:** …` or `> **bkit practice:** keep this section; …` — headings keep their text, so audit anchors stay valid · B) A heading suffix such as `## Rollback (project slot)` — visible in a table of contents, but renames every practice heading and breaks the audit anchors that `templates.test.ts` checks
  - **Recommended:** A) — no audit template or anchor changes.
  - **Default if unanswered:** A.
- **Open Question:** How do the new project-slot headings satisfy `uncoveredBkitDocSections` in `templates.test.ts`? → Owner, at plan review.
  - **Options:** A) Add each slot heading that `uncoveredBkitDocSections` reports to `UNAUDITED_DOC_SECTIONS` with the existing reason ("prompts for the project's own facts; …") and drop the six `§ Project facts to record` entries · B) Name the slots from an audit template (for example a documentation audit anchor) — more audit coverage, but it widens this plan into the audit templates, which the issue's Out of Scope excludes
  - **Recommended:** A) — matches how `§ Project facts to record` is handled today.
  - **Default if unanswered:** A.

## Documentation Warnings

- **index** (project documents rows for deployments, data-schema, testing and security differ from the purpose lines of bkit's own docs/deployments.md, docs/data-schema.md, docs/testing.md and docs/security.md) — `.agents/docs.md`
  - Evidence: The Purpose line at line 4 of each of the four bkit docs
  - Action: Task 13 sets each of the four rows' Scope to the Purpose text of the matching bkit doc; bkit's own Purpose lines are not rewritten.
  - Action: Task 14 sets each of the four rows' Scope to the Purpose text of the matching bkit doc; bkit's own Purpose lines are not rewritten.
- **testing** (docs/testing.md § ci test tiers (the bkit scaffold) draws the lane graph in ascii) — `docs/testing.md`
  - Evidence: The needs: edges in .github/workflows and the lane table in the same section
  - Action: Task 13 replaces it with a Mermaid flowchart LR and a sentence saying what the arrows mean.
  - Action: Task 14 replaces it with a Mermaid flowchart LR and a sentence saying what the arrows mean.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #887
```

Or, to address the reasons first: `/bkit-plan #887`
