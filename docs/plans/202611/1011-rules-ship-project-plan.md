# Rules: ship a Project Goals section and name it in every prompt Implementation Plan

## Context & Goals

`.agents/rules.md` says what an agent may and may not do, but not what the project optimises for, so agents have nothing to break a tie by when two options both satisfy the rules. Issue #1011 ships an empty `## Project Goals` section in the shipped rules file `.bkit/core/.agents/rules.md`, adds "and break ties by its `Project Goals`" to the shared clause `rules-leaf` in `.bkit/instructions.md` (written into all 40 files of `.bkit/core/prompts/` by `pnpm instructions:sync`), and adds a `project-goals` entry to `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`.

Decided by the owner and not reopened: the clause says "break ties by", not "work towards"; bkit ships the empty slot with commented examples and never its own goals; no migration, and nothing is ever written below `<!-- bkit:end -->`; clause `rules-orchestrator` stays unchanged.

**Related Issues:**

- #1011 — Rules: ship a Project Goals section and name it in every prompt (open)
- #750 — Workflow optimisation (umbrella)

---

## Acceptance Scenario

### Narrative

An owner installs bkit in a repo and finds an empty `## Project Goals` section in `.agents/rules.md`. Every subagent prompt tells its agent to break ties by it, and `bkit tips` tells the owner to fill it in when it is missing or empty.

### Success Criteria

- A fresh `bkit install` writes `.agents/rules.md` with `## Project Rules`, `## Project Goals` and `## Project Settings` in that order below `bkit:end`, and no goal outside a comment.
- All 40 files in `.bkit/core/prompts/` carry the new `**Rules file:**` sentence, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` reports nothing to change.
- `bkit upgrade` on a repo installed before this change leaves every byte below `bkit:end` as it was, and refreshes the header box above it.
- `bkit tips --all` lists the `project-goals` tip in a repo whose rules file has no goal, and does not list it once the section holds one bullet.
- `node dist/cli.js check` exits 0 in bkit's own repo after the installed copies are re-rendered.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Repo has no `## Project Goals` heading (installed before this change) | Agents follow `Universal Rules` as today. No agent stops, warns or reports the missing section. The tip fires. |
| Section is present and holds only the commented examples | Treated as no goals: agents apply none of the examples, and the tip fires. |
| Section holds one bullet outside a comment | The tip stays quiet. |
| Repo has no `.agents/rules.md` | The tip stays quiet. |
| The owner wants no goals | `project-goals` in `bkit.advisories.ignore` silences the tip, as for any other tip. |
| A goal and a rule point different ways | The rule wins. Goals only choose between options the rules both allow. |
| The owner has edited the text below `bkit:end` | `bkit upgrade` leaves it byte-identical. |
| A goal suggests work outside the task | The agent proposes it and does not do it (`.agents/rules.md` § Basic Principles, **Scope discipline**). |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The template holds `## Project Goals` between `## Project Rules` and `## Project Settings`, with no goal bullet outside an HTML comment | unit | `.bkit/core/engine/audits/repo/rules-sync.test.ts` | 1 |
| Clause `rules-leaf` reads below `bkit:end`, breaks ties by `Project Goals` and skips `Orchestrator Rules` | unit | `.bkit/core/engine/tools/instructions.test.ts` | 2 |
| The `project-goals` tip fires when the rules file has no `## Project Goals` heading | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| The `project-goals` tip fires when the section holds only commented examples | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| The `project-goals` tip stays quiet when the section holds one bullet, and when there is no rules file | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| project-goals stays quiet when a second Project Goals section holds a goal | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 6 |
| project-goals ask says to fill the section when the heading already exists | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 6 |
| project-goals stays quiet when the goals are a numbered list | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 7 |
| project-goals stays quiet when the goals use * bullets | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 7 |

---

## Breaking Changes & Naming Review

No breaking change and no migration. A repo installed before this change works as it does today. bkit never writes below `bkit:end`, so no upgrade step adds the heading. Names: section `Project Goals`, tip id `project-goals`.

---

## Open Questions & Assumptions

None open. Decided or checked before the build:

- **Wording of the clause.** "break ties by its `Project Goals`", confirmed by the owner over "work towards", which reads as an instruction to act and could send a build agent outside its task.
- **Workflows and entry files keep their sentence.** Clause `rules-orchestrator` is carried by the six workflows, `CLAUDE.md` and `GEMINI.md`. Those readers load the whole file, and the section's own first sentence says how to use it.
- **No doc lists the tips one by one.** `DETAILS.md` § Spending fewer tokens names a chosen few and stays as it is.
- **Cost of an unfilled section.** The starter adds a few lines that every agent in every run reads. Accepted, because the tip asks the owner to fill the section or delete the examples.
- **bkit's own repo.** Its `## Project Goals` section already holds goals, so the tip stays quiet there and nothing below `bkit:end` changes.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Shipping bkit's own goals to other repos | A project's goals are its own | Owner decision, closed |
| Any install or upgrade step that writes below `bkit:end` | bkit never writes there | Owner decision, closed |
| Changing clause `rules-orchestrator`, or which bkit rules are copied into a prompt's `**Rules:**` block | Not needed for the goal | Owner decision, closed |
| Adding the tip to the list in `DETAILS.md` | The list names a chosen few | Owner decision, closed |
| Different goals per workflow or per agent | Adds to the plan's goal | A future issue |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The tip reads `.agents/rules.md` the same way the other tips read repo files.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — install and upgrade never write below `bkit:end`, and tips run through `checks/tips` | `docs/architecture.md` § Install Lifecycle (Three Phases), § Consumer Integration Model | covered | None. |
| technology | `docs/technology.md` | yes — Vitest naming and the build step | `docs/technology.md` § Testing, § Build & Output | covered | None. |
| security | `docs/security.md` | no — no route, secret or input; the tip only reads a repo file | `docs/security.md` § Untrusted Content & Prompt Injection (checked, nothing to change) | covered | None. |
| testing | `docs/testing.md` | yes — red-first unit tests in `checks/tips/catalogue.test.ts` | `docs/testing.md` § Test first, § Which tier does a behaviour need? | covered | None. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable: no database change. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable: no UI. |
| observability | `docs/observability.md` | no — no logging change | none | none | Not applicable: no log or span change. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable: no release or CI change. |

## Documentation Warnings

None

## Data Schema Integration

None — no database.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Project Goals starter section and header box line | `.bkit/core/.agents/rules.md` | `grep -n "^## Project" .bkit/core/.agents/rules.md`, `grep -n "Project Settings" .bkit/core/.agents/rules.md`, references to `rules-sync.test.ts` | `.bkit/core/.agents/rules.md` — has `## Project Rules` and `## Project Settings`, missing `## Project Goals` | EXTEND | Add the section between the two and one header box line. |
| Test that the shipped rules template holds no project rules | `.bkit/core/engine/audits/repo/rules-sync.test.ts` | `grep -n "ships NO project rules" .bkit/core/engine/audits/repo/rules-sync.test.ts` | `.bkit/core/engine/audits/repo/rules-sync.test.ts` — counts bullets, commented examples would count | EXTEND | Remove HTML comments before counting, and add the heading-order test. |
| Shared `**Rules file:**` sentence in every prompt | `.bkit/instructions.md` | `pnpm instructions:show --file bkit-build-plan-tasks.md`, `grep -n "rules-leaf" .bkit/instructions.md`, `grep -rn "rules-leaf" .bkit/core/engine/tools/instructions.test.ts` | clause `rules-leaf` in `.bkit/instructions.md` — carries the sentence to 40 prompts | EXTEND | Change its text and move the old text to `retired`; `pnpm instructions:sync` writes the prompts. |
| Prompts guide row for the central agent rules | `.bkit/core/.bkit/prompts.md` | `grep -n "Central agent rules" .bkit/core/.bkit/prompts.md .bkit/instructions.md` | `.bkit/core/.bkit/prompts.md` — row describes the old sentence | EXTEND | Update the row text to match the new sentence. |
| `project-goals` setup tip | `.bkit/core/engine/checks/tips/catalogue.ts` | `grep -n "id:" .bkit/core/engine/checks/tips/catalogue.ts`, references to `SETUP_TIPS`, `grep -n "readRepoFile\|exists" .bkit/core/engine/checks/tips/detect.ts` | `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts` — holds the other tips | EXTEND | Add one entry that uses the same file-reading helpers. |
| Tip tests | `.bkit/core/engine/checks/tips/catalogue.test.ts` | `grep -n "describe\|it(" .bkit/core/engine/checks/tips/catalogue.test.ts` | `.bkit/core/engine/checks/tips/catalogue.test.ts` — tests the other tips | EXTEND | Add three tests for the new entry. |

## Architecture & Component Changes

### Rules file and shared sentence

#### [MODIFY] `.bkit/core/.agents/rules.md`

- **Existence Check:** the file exists.
- Add the header box line and the `## Project Goals` section, as in the issue's target text.

#### [MODIFY] `.bkit/core/engine/audits/repo/rules-sync.test.ts`

- **Existence Check:** the file exists.
- Strip HTML comments before counting bullets, and add the heading-order test.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists.
- Clause `rules-leaf` takes the new text, the old text moves to `retired`, and entry `central-agent-rules-rules-bullet` carries the new row text.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-tasks.md`

- **Existence Check:** the file exists.
- One of 40 prompt files rewritten by `pnpm instructions:sync`.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** the file exists.
- `Central agent rules` row of § Special Behaviors describes `Project Goals`.

### Tips

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.ts`

- **Existence Check:** the file exists.
- Add the `project-goals` entry (`workflows`: `design`, `plan`).

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.test.ts`

- **Existence Check:** the file exists.
- Three tests for the entry.

**Ledger rows:** None

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/prompts.md` | `Central agent rules` row names `Project Goals` and quotes the new sentence |
| `.bkit/instructions.md` | entry `central-agent-rules-rules-bullet` carries the same row text |
| `.bkit/prompts.md` | installed copy, refreshed by `upgrade` |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Section, shared sentence and docs

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add the `## Project Goals` starter and its header box line to the shipped rules file
  - **UPDATE:** `.bkit/core/.agents/rules.md`: add the header box line after the `Project Rules` line, and add the `## Project Goals` section between `## Project Rules` and `## Project Settings`, both as the target text in issue #1011
  - **UPDATE:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: the test `the template ships NO project rules below bkit:end — only the empty group scaffold` removes HTML comments before it counts bullets, so the commented examples do not count and a real bullet still fails it
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files and § Docs
  - **DONE WHEN:** `git grep -c "^## Project Goals$" -- .bkit/core/.agents/rules.md` prints 1, and every test in `.bkit/core/engine/audits/repo/rules-sync.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/rules-sync.test.ts` `the template holds an empty Project Goals section between Project Rules and Project Settings` fails on the missing heading

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [x] **TASK 2:** Name `Project Goals` in the shared `**Rules file:**` sentence of every prompt
  - **UPDATE:** `.bkit/instructions.md`: clause `rules-leaf` takes the target text in its `text` block, and its current text moves into the clause's `retired` block
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: the `**Rules file:**` bullet, and the same bullet in the other 39 files of `.bkit/core/prompts/`, all written by `pnpm instructions:sync` after the no-flag run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` shows only this change
  - **READ:** `.bkit/instructions.md`: the header rules on changing a clause
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -l "break ties by its" -- .bkit/core/prompts` lists 40 files, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules` fails on the current clause text

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [x] **TASK 3:** Bring the doc that describes the rules file in line
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `Central agent rules` row of § Special Behaviors describes `Project Goals` as a third section a leaf reads, and quotes the new sentence
  - **UPDATE:** `.bkit/instructions.md`: entry `central-agent-rules-rules-bullet` of § Special Behaviors carries the same row text
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `git grep -n "follow its \`Universal Rules\`; skip" -- .bkit/core .bkit/instructions.md`finds the old sentence only inside`retired`blocks, and`pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->

### TASK GROUP 2: Tip and installed copies

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Add the `project-goals` tip
  - **UPDATE:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`: a `project-goals` entry with the fields of the target table in issue #1011
  - **READ:** `.bkit/core/engine/checks/tips/detect.ts`: the file-reading helpers the other entries use
  - **READ:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: the catalogue tests every entry must pass (`every tip carries every text field`, `every docs pointer in steps resolves to a heading`)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** every test in `.bkit/core/engine/checks/tips/catalogue.test.ts` passes, and `pnpm build` leaves the rebuilt `dist/` in the same commit
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals fires when the rules file has no Project Goals heading` fails on an unknown tip id
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals fires when the section holds only commented examples` fails on an unknown tip id
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the section holds one bullet, and when there is no rules file` fails on an unknown tip id

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** Re-render the installed copies and check install and upgrade on a scratch project
  - **UPDATE:** `.claude/agents/bkit-build-plan-tasks.md`: the installed prompt copy, and the other 39 files of `.claude/agents/`, all written by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never by hand
  - **UPDATE:** `.cursor/agents/bkit-build-plan-tasks.md`: the installed prompt copy, and the other 39 files of `.cursor/agents/`, all written by the same run
  - **UPDATE:** `.opencode/agents/bkit-build-plan-tasks.md`: the installed prompt copy, and the other 39 files of `.opencode/agents/`, all written by the same run
  - **UPDATE:** `.codex/agents/bkit-build-plan-tasks.toml`: the installed prompt copy, and the other 39 files of `.codex/agents/`, all written by the same run
  - **UPDATE:** `.agents/plugins/bkit/agents/bkit-build-plan-tasks.md`: the installed prompt copy, and the other 39 files of `.agents/plugins/bkit/agents/`, all written by the same run
  - **UPDATE:** `.agents/rules.md`: the header box above `bkit:end`, written by the same run
  - **UPDATE:** `.bkit/prompts.md`: the installed copy of the prompts guide, written by the same run
  - **DEPENDS ON:** 2, 3, 4
  - **DONE WHEN:** `node dist/cli.js check` exits 0; a fresh install from a packed tarball into an empty scratch project writes the three sections in order; an upgrade of a scratch project whose rules file has no `## Project Goals` leaves the text below `bkit:end` byte-identical; and `node dist/cli.js tips --all` lists `project-goals` in that project
  - **TEST FIRST:** n/a — generated files and a manual install check

<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** On a fresh install the tip tells the agent to "Add a `## Project Goals` section", the agent adds a second filled section below the empty starter, and the tip still reports no goals on every design and plan run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.ts:243` · **Round:** 1
  - **DONE WHEN:** `hasNoProjectGoals` returns false when any `## Project Goals` section below `<!-- bkit:end -->` holds a goal, not only the first; and the `project-goals` tip's `ask` (fixed text or the existing `resolve` hook) tells the agent to fill the section that is already there, instead of adding one, when the heading exists
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when a second Project Goals section holds a goal` fails on `fires` returning true, because `exec` reads only the first, comment-only section and stops at the second heading
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals ask says to fill the section when the heading already exists` fails on the fixed `ask` text "Add a `## Project Goals` section to .agents/rules.md, ..." with no fill or existing-section wording

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** The owner writes goals "most important first" as a numbered list, or with `*` bullets, and the tip keeps saying "Agents have rules but no goals" on every design and plan run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.ts:245` · **Round:** 1
  - **DONE WHEN:** the detector counts any Markdown list item outside an HTML comment in the section (`-`, `*`, `+` bullets and `1.` / `1)` ordered items) as a goal, matching the plan's edge case "Section holds one bullet outside a comment → the tip stays quiet" and the `[-*]` set that `rules-sync.test.ts` already treats as a bullet
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the goals are a numbered list` fails on `fires` returning true for `1. **Correct over fast:** x`, because `/^\s*- /m` matches only `- ` items
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the goals use * bullets` fails on `fires` returning true for `* **Correct over fast:** x`

<!-- bkit:task 7 end -->
<!-- bkit:group 3 end -->

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** `rules-sync.test.ts`, `instructions.test.ts` and `catalogue.test.ts` pass, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing.

### Manual Verification

- [ ] **Step 1:** Install from a packed tarball into an empty scratch project, and confirm the three sections in order and `bkit tips --all` listing `project-goals`.
