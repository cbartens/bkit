# Brief: group 3 — Challenge round 1 findings (tests)

Plan: Rules: ship a Project Goals section and name it in every prompt Implementation Plan

## Why and what

### Context & Goals

`.agents/rules.md` says what an agent may and may not do, but not what the project optimises for, so agents have nothing to break a tie by when two options both satisfy the rules. Issue #1011 ships an empty `## Project Goals` section in the shipped rules file `.bkit/core/.agents/rules.md`, adds "and break ties by its `Project Goals`" to the shared clause `rules-leaf` in `.bkit/instructions.md` (written into all 40 files of `.bkit/core/prompts/` by `pnpm instructions:sync`), and adds a `project-goals` entry to `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`.

Decided by the owner and not reopened: the clause says "break ties by", not "work towards"; bkit ships the empty slot with commented examples and never its own goals; no migration, and nothing is ever written below `<!-- bkit:end -->`; clause `rules-orchestrator` stays unchanged.

**Related Issues:**

- #1011 — Rules: ship a Project Goals section and name it in every prompt (open)
- #750 — Workflow optimisation (umbrella)

---

### Narrative

An owner installs bkit in a repo and finds an empty `## Project Goals` section in `.agents/rules.md`. Every subagent prompt tells its agent to break ties by it, and `bkit tips` tells the owner to fill it in when it is missing or empty.

### Success Criteria

- A fresh `bkit install` writes `.agents/rules.md` with `## Project Rules`, `## Project Goals` and `## Project Settings` in that order below `bkit:end`, and no goal outside a comment.
- All 40 files in `.bkit/core/prompts/` carry the new `**Rules file:**` sentence, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` reports nothing to change.
- `bkit upgrade` on a repo installed before this change leaves every byte below `bkit:end` as it was, and refreshes the header box above it.
- `bkit tips --all` lists the `project-goals` tip in a repo whose rules file has no goal, and does not list it once the section holds one bullet.
- `node dist/cli.js check` exits 0 in bkit's own repo after the installed copies are re-rendered.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Shipping bkit's own goals to other repos | A project's goals are its own | Owner decision, closed |
| Any install or upgrade step that writes below `bkit:end` | bkit never writes there | Owner decision, closed |
| Changing clause `rules-orchestrator`, or which bkit rules are copied into a prompt's `**Rules:**` block | Not needed for the goal | Owner decision, closed |
| Adding the tip to the list in `DETAILS.md` | The list names a chosen few | Owner decision, closed |
| Different goals per workflow or per agent | Adds to the plan's goal | A future issue |

## Where it fits

- Group 1: Section, shared sentence and docs — done
  - TASK 1: Add the `## Project Goals` starter and its header box line to the shipped rules file — done
  - TASK 2: Name `Project Goals` in the shared `**Rules file:**` sentence of every prompt — done
  - TASK 3: Bring the doc that describes the rules file in line — done
- Group 2: Tip and installed copies — done
  - TASK 4: Add the `project-goals` tip — done
  - TASK 5: Re-render the installed copies and check install and upgrade on a scratch project — done
- Group 3: Challenge round 1 findings — this group
  - TASK 6: On a fresh install the tip tells the agent to "Add a `## Project Goals` section", the agent adds a second filled section below the empty starter, and the tip still reports no goals on every design and plan run — open
  - TASK 7: The owner writes goals "most important first" as a numbered list, or with `*` bullets, and the tip keeps saying "Agents have rules but no goals" on every design and plan run — open

## The work

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** On a fresh install the tip tells the agent to "Add a `## Project Goals` section", the agent adds a second filled section below the empty starter, and the tip still reports no goals on every design and plan run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.ts:243` · **Round:** 1
  - **DONE WHEN:** `hasNoProjectGoals` returns false when any `## Project Goals` section below `<!-- bkit:end -->` holds a goal, not only the first; and the `project-goals` tip's `ask` (fixed text or the existing `resolve` hook) tells the agent to fill the section that is already there, instead of adding one, when the heading exists
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when a second Project Goals section holds a goal` fails on `fires` returning true, because `exec` reads only the first, comment-only section and stops at the second heading
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals ask says to fill the section when the heading already exists` fails on the fixed `ask` text "Add a `## Project Goals` section to .agents/rules.md, ..." with no fill or existing-section wording
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** The owner writes goals "most important first" as a numbered list, or with `*` bullets, and the tip keeps saying "Agents have rules but no goals" on every design and plan run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.ts:245` · **Round:** 1
  - **DONE WHEN:** the detector counts any Markdown list item outside an HTML comment in the section (`-`, `*`, `+` bullets and `1.` / `1)` ordered items) as a goal, matching the plan's edge case "Section holds one bullet outside a comment → the tip stays quiet" and the `[-*]` set that `rules-sync.test.ts` already treats as a bullet
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the goals are a numbered list` fails on `fires` returning true for `1. **Correct over fast:** x`, because `/^\s*- /m` matches only `- ` items
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the goals use * bullets` fails on `fires` returning true for `* **Correct over fast:** x`
<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The `project-goals` tip fires when the rules file has no `## Project Goals` heading | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| The `project-goals` tip fires when the section holds only commented examples | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| The `project-goals` tip stays quiet when the section holds one bullet, and when there is no rules file | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 4 |
| project-goals stays quiet when a second Project Goals section holds a goal | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 6 |
| project-goals ask says to fill the section when the heading already exists | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 6 |
| project-goals stays quiet when the goals are a numbered list | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 7 |
| project-goals stays quiet when the goals use * bullets | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 7 |

## Deviations

Already decided by the owner, do not reopen: the clause wording is "break ties by", not "work towards"; bkit ships the empty slot with commented examples, never its own goals; no migration and nothing ever writes below `<!-- bkit:end -->`; clause `rules-orchestrator` stays unchanged.

Already checked: the issue body passes `bkit tasks open` for both groups, and passes `bkit tests plan-check` with 0 problems and 0 existence findings once the plan-only `Task` column is added to the test matrix (rows map to tasks 1, 2, 4, 4, 4). The plan check accepts only real file paths, which is why tasks 2 and 5 name one file per folder (`bkit-build-plan-tasks`) and describe the other 39 in words — keep that form when converting.

Other agents may be editing the same checkout, so commit only files you touched, by explicit path, and never push `dev` without the owner's approval.

Done looks like: the workflow reaches its normal end state for a build (plan converted, both task groups implemented with their TEST FIRST tests written red first, gates green), and you report what the workflow produced and anything it stopped on. Do not push and do not start `/bkit-ship` unless the workflow itself or the user tells you to.
