# Brief: group 3 — Hand-written starters, waves 5 and 6, and capabilities (tests)

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
- Group 3: Hand-written starters, waves 5 and 6, and capabilities — this group
  - TASK 6: Rewrite `security.md` and `observability.md` (wave 5) — open
  - TASK 7: Rewrite `testing.md` (wave 5), keeping bkit's practice in place — open
  - TASK 8: Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6) — open
  - TASK 9: Rewrite the `capabilities.md` introduction (wave 7, generated) — open
- Group 4: Point adopters at the order — next
  - TASK 10: Add the `project-docs` setup tip — open
  - TASK 11: Merge the empty-doc advisory into `project-docs-unpopulated` and point the project-doc advisories at the adoption order — open
  - TASK 12: Make the index equivalence match affirmative and end-bounded — open
  - TASK 13: Mark adopted doc starters in the upgrade report — open
  - TASK 14: Bring bkit's own docs and mirrors in line — open
- Group 5: Guard shipped section citations — later
  - TASK 15: Guard the section names shipped files cite — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rewrite `security.md` and `observability.md` (wave 5)
  - **UPDATE:** `.bkit/templates/docs/security.md`: introduction, rules box, skeleton `## Trust boundaries`, `## Authentication`, `## Authorization`, `## Input validation`, `## Rate limiting`, `## Secrets`, `## PII`, `## Open questions`; a `sequenceDiagram` of one authenticated request; § Supply-Chain (GitHub Actions) kept with its exact heading and marked as bkit practice, with the bkit-practice line in the rules box; no separate `## Supply chain` slot, because the project's own dependency and CI rules go in a `### This project` slot under the kept section, opened by `> **Project slot:** …`; `## Project facts to record` removed; **Fill these first:** `docs/architecture.md`; **Finish against:** `docs/data-schema.md` (the PII table's "Where stored" column)
  - **UPDATE:** `.bkit/templates/docs/security.md`: `## Authorization` lists service accounts as rows beside user roles, and `## Secrets` is the one register of secret names and stores, because the plan template's Pre-Flight reads "the secret store and the service-account roles" from this doc; **Not here** sends the variables a developer sets locally to `setup.md` § Environment variables and per-environment config sync to `deployments.md` § Secrets and env config
  - **UPDATE:** `.bkit/templates/docs/observability.md`: introduction, rules box (Not here points at testing for smoke checks), skeleton `## Signal pipeline`, `## Log format`, `## Signals`, `## Correlation`, `## Error tracking`, `## Alerts`, `## Where to look`, `## Open questions`; a `flowchart LR` from app to people; `## Project facts to record` removed
  - **UPDATE:** `.bkit/templates/docs/observability.md`: `## Log format` opens by naming the logger module and the call every log line goes through, because `.agents/rules.md` **Explicit logging** sends agents here for "the project's structured logger"
  - **UPDATE:** `.bkit/templates/docs/observability.md`: `## Signals` is a table (Signal, Kind, Emitted from, Lands in) of the named log events, spans, metrics and audit records that an alert, a test, a `docs/noise.md` row or another doc relies on, not every log line; the plan template sends a plan's "new log names or spans" and its "logs, audit tables and traces" check here
  - **UPDATE:** `TOPIC_INFO.security.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new security Purpose line
  - **UPDATE:** `TOPIC_INFO.observability.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new observability Purpose line
  - **READ:** `uncoveredBkitDocSections` in `.bkit/core/engine/audits/templates/templates.test.ts`: security and observability are covered by the security and logs audits' every-rule-and-section anchors, so no `UNAUDITED_DOC_SECTIONS` entry
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/security.md` and `docs/observability.md` entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `starter shape: security` and `starter shape: observability` pass, each passing the skeleton headings its UPDATE line lists; `shipped-docs-refs.test.ts` passes; neither `.bkit/templates/docs/security.md` nor `.bkit/templates/docs/observability.md` has a `## Project facts to record` heading; `templates.test.ts` and `dogfood-templates.test.ts` pass; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: security` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: observability` fails on today's starter, which has no fill-in introduction

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Rewrite `testing.md` (wave 5), keeping bkit's practice in place
  - **UPDATE:** `.bkit/templates/docs/testing.md`: introduction; rules box keeps "keep the tiers separate" and adds Not here (points at observability for live alerts) and Update when; project slots `## Stack`, `## Tiers this project has`, `## Where tests live`, `## Test data`, `## CI lanes`, `## Test reports`, `## Running locally`, `## Open questions`; every existing practice section kept with its exact heading and marked `> **bkit practice:** …`; each slot marked `> **Project slot:** …`; the ASCII lane graph replaced by a `flowchart LR`, its `needs:` / `if:` notes moved to the lanes table; `## Project facts to record` removed
  - **UPDATE:** `.bkit/templates/docs/testing.md`: `## Tiers this project has` has one row per tier name in § Which tier does a behaviour need? (Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke), spelled the same, because a plan's `Derived Test Matrix` copies the tier name from this doc
  - **UPDATE:** `.bkit/templates/docs/testing.md`: `## Where tests live` is a table (Tier, Folder, File naming, Shared helpers) and is where a new test file or pattern is recorded; `## Test data` names the shared login setup whose auth state UI tests reuse and the typed factories that build test data, which the **Testing strategy** clause of the build prompts reads "per `docs/testing.md`"
  - **UPDATE:** `.bkit/templates/docs/testing.md`: **Not here** also sends the runner, gate, lock and JUnit requirements bkit adds to `.bkit/workflows.md` § Test and release mechanics, the pointer today's `## Project facts to record` carries; the rules box carries the bkit-practice line; each practice marker reads `> **bkit practice:** keep this section; bkit's CI template, advisories and audits cite its heading by name, so leave the heading text unchanged.`
  - **UPDATE:** `.bkit/templates/docs/testing.md`: `## Test first` after `## What each tier must do` is marked bkit practice — when the branch holds #917's section (commit `959a7a6e9`), its text is kept unchanged; otherwise the section is added with the same content as `docs/testing.md` § Test first
  - **UPDATE:** `.bkit/core/engine/install/project-docs.test.ts`: a `sectionMarks(text)` helper used by this test and Task 8's; the box-drawing check looks only inside fenced code blocks for `▼`, `▲`, `┌` or `┐` (the same set Task 14 checks), so the "(▲▼ vs the default branch)" prose does not trip it; `└` stays out of the set, because the plain-text directory tree in `docs/architecture.md` uses it
  - **UPDATE:** `TOPIC_INFO.testing.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new testing heading that `uncoveredBkitDocSections` reports added with the existing reason (`## Open questions` among them), `testing.md § Project facts to record` removed; `## CI lanes` gets no entry, because the adoption audit already names it and an entry makes `templates.test.ts` fail; `## Test first` gets no entry when the testing audit template names it (#917 adds `§ Test first` to `bkit-audit-testing.md`)
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `docs/testing.md` entry gains a region edit removing the starter's introduction
  - **READ:** `§ Test first` in `docs/testing.md`: the section the starter's `## Test first` matches (line 298)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** both testing tests pass, `starter shape: testing` passing the project-slot headings its UPDATE line lists; `UNAUDITED_DOC_SECTIONS` holds no `testing.md § Project facts to record` key; `shipped-docs-refs.test.ts` passes; `.bkit/templates/docs/testing.md` has exactly one `## Test first` heading, after `## What each tier must do`, marked bkit practice; `templates.test.ts` (anchors from the flakes, gates, ci-performance and testing audits) and `dogfood-templates.test.ts` pass; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: testing` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `testing marks every section slot or practice and has no box-drawing diagram` fails on today's unmarked sections and the ASCII lane graph

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Rewrite `data-schema.md`, `deployments.md` and `noise.md` (wave 6)
  - **UPDATE:** `.bkit/templates/docs/data-schema.md`: introduction, rules box (Pending defined; link a generated schema instead of copying it), skeleton `## Overview`, one `## {table}` section shape, `## Functions`, `## Open questions`; an `erDiagram` of keys and relationships; Not applicable: no persistent store; **Fill these first:** `docs/security.md`; **Finish against:** none; `## Project facts to record` removed
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: introduction, rules box (dangling "Pre-push checklist" reference removed; `--no-verify` line dropped as `.agents/rules.md` owns it), project slots `## Environments`, `## Release path`, `## Secrets and env config`, `## Branch protection`, `## Open questions`; every practice section kept with its exact heading as bkit practice, with the bkit-practice line in the rules box and the marker text Task 7 gives; every section marked slot or practice; a `flowchart LR` release path; `## Project facts to record` removed
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: no `## Rollback` slot; `## Production rollback runbook` and `## Dev rollback runbook` keep their headings, because the plan template's `Rollback Strategy` cites § Dev rollback runbook, and each is marked `> **Project slot:** replace the example steps with this project's own; keep the heading, because plans cite it.`, with its host-specific steps turned into `[e.g., …]` text
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: no `## Migrations at deploy time` slot; the kept `## Applying migrations at deploy time` gains a `### This project` slot (what applies migrations, and when), opened by `> **Project slot:** …`
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: the `## Environments` table is Environment, Branch, URL, Deploys when, and links `docs/architecture.md` § Environments for hosting and data store; `## Secrets and env config` says how each environment's config is synced and links `docs/security.md` § Secrets for the names
  - **UPDATE:** `.bkit/templates/docs/deployments.md`: **Not here** sends commit-message tags, phase-close prerequisites, post-merge routing and the ship gate to `.bkit/workflows.md` § Test and release mechanics, the pointer today's `## Project facts to record` carries
  - **UPDATE:** `.bkit/templates/docs/noise.md`: introduction (Fill these first: observability), one table header `| Date | Signal | Where | Change | Trigger | Why it is safe | Recheck when |` and no rows
  - **UPDATE:** `TOPIC_INFO["data-schema"].scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new data-schema Purpose line
  - **UPDATE:** `TOPIC_INFO.deployments.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new deployments Purpose line, which drops "promote after the capstone"
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: in the ci-yml stub advisory `action` text (line 304), the `docs/deployments.md` pointer drops "promote after the capstone", the same stale fact as `TOPIC_INFO.deployments`
  - **UPDATE:** `TOPIC_INFO.noise.scope` in `.bkit/core/engine/install/project-docs.ts`: equals the new noise Purpose line
  - **UPDATE:** `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts`: every new data-schema and deployments heading that `uncoveredBkitDocSections` reports added with the existing reason, their `§ Project facts to record` entries removed
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the three entries gain a region edit removing the starter's introduction
  - **DEPENDS ON:** 3, 7
  - **DONE WHEN:** the four tests below pass, each `starter shape` case passing the skeleton headings its UPDATE line lists; `UNAUDITED_DOC_SECTIONS` holds no `§ Project facts to record` key; `shipped-docs-refs.test.ts` passes; no starter in `.bkit/templates/docs/` has a `## Project facts to record` heading; "promote after the capstone" appears in neither `.bkit/core/engine/install/project-docs.ts` nor `.bkit/core/engine/checks/after/tools.ts`, and `tools.test.ts` passes; `templates.test.ts` (anchors from the config, cost, dependencies, reliability, security, gates and ci-performance audits) and `dogfood-templates.test.ts` pass; `pnpm build` ran and `dist/` is staged
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: data-schema` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: deployments` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `starter shape: noise` fails on today's starter, which has no fill-in introduction
    - `.bkit/core/engine/install/project-docs.test.ts` `deployments marks every section slot or practice` fails on today's unmarked sections

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Rewrite the `capabilities.md` introduction (wave 7, generated)
  - **UPDATE:** `.bkit/templates/docs/capabilities.md`: opener line "Generated document."; **Fill these first:** `docs/deployments.md`, the solid-arrow source into `CAP` in `.bkit/core/.bkit/templates.md` § Project docs — adoption order; prerequisites (code exists, the graphify templates adopted per `.bkit/templates.md` § graphify — map); `pnpm bkit:graph:rollup` builds from the working tree and `pnpm bkit:graph:refresh` from the staged files in a throwaway checkout, and when to run each; what stays hand-maintained (the Overrides block, `scripts/graphify/bkit-graph-drift-rules.json`); the register row, whose Scope equals the capabilities Purpose line; completion checks including the comparison with `docs/components.md`
  - **UPDATE:** `.bkit/core/engine/install/project-docs.test.ts`: a capabilities case that asserts the `Generated document.` opener, the Fill these first line equal to the solid-arrow sources into `CAP`, the register row with its Scope equal to the Purpose line, and the **Completion checks** line
  - **READ:** `§ graphify — map` in `.bkit/core/.bkit/templates.md`: the adoption steps the prerequisites point at (line 668)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** both capabilities tests pass; `dogfood-templates.test.ts` (capabilities is `generated`) and `shipped-docs-refs.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `capabilities names rollup and refresh and when to run each` fails while the starter names the two commands without saying when to run each
    - `.bkit/core/engine/install/project-docs.test.ts` `capabilities starter has the Generated document opener, Fill these first, register row and completion checks` fails on today's "Example output." opener and the missing Fill these first line, register row and completion checks

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 3 (group 2, done): Rewrite `components.md` as the model introduction and add the starter-shape tests — `.bkit/templates/docs/components.md`, `.bkit/core/engine/install/project-docs.test.ts`, `docs/components.md`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`

### Derived Test Matrix rows

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
| adoptedProjectDocPath returns the recommended path, an indexed equivalent or null | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 13 |
| capabilities starter has the Generated document opener, Fill these first, register row and completion checks | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 9 |
| syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 12 |
| setup index row marks Build and Debug as read when relevant | Unit | `.bkit/core/engine/install/project-docs.test.ts` | 5 |
