# Brief: group 1 — Shared rules and adoption order

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

- Group 1: Shared rules and adoption order — this group
  - TASK 1: Write the shared project-doc writing rules and reword § Doc Templates — open
  - TASK 2: Add the project-docs adoption order to `.bkit/templates.md` and point the document index at it — open
- Group 2: Hand-written starters, waves 2 to 4 — next
  - TASK 3: Rewrite `components.md` as the model introduction and add the starter-shape tests — open
  - TASK 4: Rewrite `technology.md` and `design.md` (wave 3) — open
  - TASK 5: Rewrite `architecture.md` and `setup.md` (wave 4) — open
- Group 3: Hand-written starters, waves 5 and 6, and capabilities — later
  - TASK 6: Rewrite `security.md` and `observability.md` (wave 5) — open
  - TASK 7: Rewrite `testing.md` (wave 5), keeping bkit's practice in place — open
  - TASK 8: Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6) — open
  - TASK 9: Rewrite the `capabilities.md` introduction (wave 7, generated) — open
- Group 4: Point adopters at the order — later
  - TASK 10: Add the `project-docs` setup tip — open
  - TASK 11: Merge the empty-doc advisory into `project-docs-unpopulated` and point the project-doc advisories at the adoption order — open
  - TASK 12: Make the index equivalence match affirmative and end-bounded — open
  - TASK 13: Mark adopted doc starters in the upgrade report — open
  - TASK 14: Bring bkit's own docs and mirrors in line — open
- Group 5: Guard shipped section citations — later
  - TASK 15: Guard the section names shipped files cite — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Write the shared project-doc writing rules and reword § Doc Templates
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Docs gains the Mermaid rule for every file § Docs covers: diagrams of flow, order, dependency or relationship are Mermaid, while directory trees and command output stay plain text; each chart says in one sentence what its arrows mean, uses node names from the doc's tables, keeps to about 15 nodes (else `subgraph` or a second chart), uses only `flowchart`, `sequenceDiagram`, `erDiagram` or `stateDiagram-v2`, quotes every label and sets no colours or `style` / `classDef`
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Docs gains the starter rules under one lead scoped to the project-doc starters in `.bkit/templates/docs/*.md`: the rules box carries **Purpose**, the rules, **Not here** and **Update when**; **Purpose** says what the doc holds and the question it answers, with no "Read before …" clause, because the phase columns of `.agents/docs.md` say when to read it; a section marked `> **bkit practice:**` keeps its heading text and stays a separate section; content is current state with no history; facts come from code, config or an approved spec, never from template example text; unknowns go under `## Open questions`; each topic is written once and linked from elsewhere; tables over prose for facts; name the file that holds a value instead of typing the value; `Not applicable: {reason}` is the empty state for a doc that does not apply
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: each new rule is one `- **Lead:** text` bullet with `Why` / `Example` sub-bullets, kept short, because `gateguard-dogfood.integration.test.ts` parses § Docs bullets and every Docs-route advisory repeats them
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: § Doc Templates headline "Template is shape, prompt owns rules" reworded to say fill-in instructions sit in the template and rules for acting on it live in the prompts; adds that project-doc starters carry their own fill-in steps because no prompt fills them
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the § Docs scope line also names `.bkit/templates/docs/*.md`
  - **UPDATE:** `.bkit/instructions.md`: line 27, the `## Template Instructions` row no longer calls the plan and audit templates "shape-only"; run `pnpm instructions:sync`
  - **UPDATE:** `.bkit/instructions.md`: the § Template Instructions opener (line 9879, "The plan template holds shape only") is reworded to match the reworded § Doc Templates, with the same claim the line 27 row makes
  - **READ:** `.bkit/templates/docs/components.md`: its general writing rules, which move to § Docs in Task 3
  - **READ:** `§ Which Sections Apply` in `.bkit/core/.bkit/authoring.md`: its `docs/*.md` row already matches `.bkit/templates/docs/*.md` ("A path matches at any depth"), so the table stays unchanged
  - **READ:** `.bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts`: how it parses § Docs `- **Lead:**` bullets (lines 119-136) and compares § Which Sections Apply rows with the hook's routes (lines 281-286)
  - **DONE WHEN:** § Docs holds every rule listed; the Mermaid rule names no narrower scope than § Docs; the starter rules' lead names `.bkit/templates/docs/*.md` as their scope, and the starter-box rule names **Not here** and **Update when**; the existing § Docs **Rules header** rule still requires only **Purpose** and **Rules**; § Which Sections Apply is unchanged; the headline "Template is shape, prompt owns rules" no longer appears in `.bkit/core/.bkit/authoring.md`, and § Doc Templates says project-doc starters carry their own fill-in steps; the § Docs scope line names `.bkit/templates/docs/*.md`; the phrase "holds shape only" no longer appears in `.bkit/instructions.md` § Template Instructions; `pnpm bkit:lint:prose` passes on both files; `.bkit/core/engine/tools/instructions.test.ts`, `.bkit/core/engine/tools/instructions-coverage.test.ts`, `.bkit/core/engine/tools/instructions-sources.test.ts` and `.bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts` pass
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add the project-docs adoption order to `.bkit/templates.md` and point the document index at it
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: new `## Project docs — adoption order` section with the waves table (1 `docs/idea.md`; 2 components; 3 technology, design; 4 architecture, setup; 5 security, testing, observability; 6 data-schema, deployments, noise; 7 capabilities), the Mermaid chart with solid "must exist first" and dotted "finished against" arrows from the doc review comment § 2.2 plus a dotted `DATA -.-> SEC` arrow (security's PII table "Where stored" column is finished against data-schema, per doc review § 3.4) and a sentence saying what each arrow means, the dotted-arrow notes with a "data-schema → security" note, and the `docs/idea.md` rule (free-form, kept, not indexed, no template)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: line 16 says the `bkit tips` order covers the tool templates and points to the new section for project docs; § Project documents — starters and the index links to the new section
  - **UPDATE:** `.bkit/core/.agents/docs.md`: the note under the Universal Documents table (line 48) gains one last sentence, "Fill them in the order in `.bkit/templates.md` § Project docs — adoption order."; the rest of the note stays as it is, because a project's index has no row for `.bkit/templates.md` and this note is where the 39 prompts that load the index meet the order
  - **DONE WHEN:** the section exists with table, chart (node ids and labels as in § 2.2, so the Task 3 test can parse them, and the `DATA -.-> SEC` arrow) and `docs/idea.md` rule; line 16 no longer claims the tips order for project docs; the note in `.bkit/core/.agents/docs.md` names `.bkit/templates.md` § Project docs — adoption order; `pnpm bkit:lint:prose` passes; `shipped-docs-refs.test.ts` passes (the file ships, so it holds no `#NN` reference); `.bkit/core/engine/tools/instructions.test.ts` passes (`.bkit/core/.bkit/templates.md` is a doc surface for its near-copy clause check)
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Shared project-doc writing rules and Mermaid rule | `.bkit/core/.bkit/authoring.md` | Read § Which Sections Apply (line 14), § Docs (line 226) and § Doc Templates (line 472); `grep -n mermaid` over `.bkit/core/.bkit` | § Docs — has the rules header, one-home and index rules; missing Mermaid and fill rules | EXTEND | Add the rules to § Docs; reword § Doc Templates |
| Adoption order | `.bkit/core/.bkit/templates.md` | Read line 16, § Project documents — starters and the index (line 658), § Component map (line 662), § graphify — map (line 668) | § Project documents — names the starters, no order | EXTEND | New `## Project docs — adoption order` section; link from line 16 and § Project documents |

### Architecture entries

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** exists; line 27 row for `## Template Instructions`; § Template Instructions opener at line 9879 ("The plan template holds shape only").
- Drops "shape-only" from the line 27 row, and rewords the § Template Instructions opener to match the reworded § Doc Templates (owner answer 8, 2026-11-14). Kept in sync with `pnpm instructions:sync`; checked by `.bkit/core/engine/tools/instructions.test.ts`.

Reuse Inventory rows left out: 0; Architecture entries left out: 3 — read them in docs/plans/202611/887-review-doc-starters-plan.md § Reuse Inventory and § Architecture & Component Changes.
