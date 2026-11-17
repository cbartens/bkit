# Brief: group 1 — Section, shared sentence and docs (tests)

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

- Group 1: Section, shared sentence and docs — this group
  - TASK 1: Add the `## Project Goals` starter and its header box line to the shipped rules file — open
  - TASK 2: Name `Project Goals` in the shared `**Rules file:**` sentence of every prompt — open
  - TASK 3: Bring the doc that describes the rules file in line — done
- Group 2: Tip and installed copies — next
  - TASK 4: Add the `project-goals` tip — open
  - TASK 5: Re-render the installed copies and check install and upgrade on a scratch project — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add the `## Project Goals` starter and its header box line to the shipped rules file
  - **UPDATE:** `.bkit/core/.agents/rules.md`: add the header box line after the `Project Rules` line, and add the `## Project Goals` section between `## Project Rules` and `## Project Settings`, both as the target text in issue #1011
  - **UPDATE:** `.bkit/core/engine/audits/repo/rules-sync.test.ts`: the test `the template ships NO project rules below bkit:end — only the empty group scaffold` removes HTML comments before it counts bullets, so the commented examples do not count and a real bullet still fails it
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files and § Docs
  - **DONE WHEN:** `git grep -c "^## Project Goals$" -- .bkit/core/.agents/rules.md` prints 1, and every test in `.bkit/core/engine/audits/repo/rules-sync.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/rules-sync.test.ts` `the template holds an empty Project Goals section between Project Rules and Project Settings` fails on the missing heading

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Name `Project Goals` in the shared `**Rules file:**` sentence of every prompt
  - **UPDATE:** `.bkit/instructions.md`: clause `rules-leaf` takes the target text in its `text` block, and its current text moves into the clause's `retired` block
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: the `**Rules file:**` bullet, and the same bullet in the other 39 files of `.bkit/core/prompts/`, all written by `pnpm instructions:sync` after the no-flag run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` shows only this change
  - **READ:** `.bkit/instructions.md`: the header rules on changing a clause
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -l "break ties by its" -- .bkit/core/prompts` lists 40 files, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules` fails on the current clause text

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The template holds `## Project Goals` between `## Project Rules` and `## Project Settings`, with no goal bullet outside an HTML comment | unit | `.bkit/core/engine/audits/repo/rules-sync.test.ts` | 1 |
| Clause `rules-leaf` reads below `bkit:end`, breaks ties by `Project Goals` and skips `Orchestrator Rules` | unit | `.bkit/core/engine/tools/instructions.test.ts` | 2 |

## Deviations

Already decided by the owner, do not reopen: the clause wording is "break ties by", not "work towards"; bkit ships the empty slot with commented examples, never its own goals; no migration and nothing ever writes below `<!-- bkit:end -->`; clause `rules-orchestrator` stays unchanged.

Already checked: the issue body passes `bkit tasks open` for both groups, and passes `bkit tests plan-check` with 0 problems and 0 existence findings once the plan-only `Task` column is added to the test matrix (rows map to tasks 1, 2, 4, 4, 4). The plan check accepts only real file paths, which is why tasks 2 and 5 name one file per folder (`bkit-build-plan-tasks`) and describe the other 39 in words — keep that form when converting.

Other agents may be editing the same checkout, so commit only files you touched, by explicit path, and never push `dev` without the owner's approval.

Done looks like: the workflow reaches its normal end state for a build (plan converted, both task groups implemented with their TEST FIRST tests written red first, gates green), and you report what the workflow produced and anything it stopped on. Do not push and do not start `/bkit-ship` unless the workflow itself or the user tells you to.
