## Session Prompt — this run's, newer than everything below

/bkit-build #1011

Background (from the session that started this one):
bkit is a framework of agent workflows, subagent prompts and an engine. Issue #1011 gives every repo that installs bkit an empty `## Project Goals` section in the shipped rules file `.bkit/core/.agents/rules.md`, adds the words "and break ties by its `Project Goals`" to the shared `rules-leaf` clause in `.bkit/instructions.md` (which `pnpm instructions:sync` writes into all 40 files of `.bkit/core/prompts/`), and adds a `project-goals` entry to `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`.

Already decided by the owner, do not reopen: the clause wording is "break ties by", not "work towards"; bkit ships the empty slot with commented examples, never its own goals; no migration and nothing ever writes below `<!-- bkit:end -->`; clause `rules-orchestrator` stays unchanged.

Already checked: the issue body passes `bkit tasks open` for both groups, and passes `bkit tests plan-check` with 0 problems and 0 existence findings once the plan-only `Task` column is added to the test matrix (rows map to tasks 1, 2, 4, 4, 4). The plan check accepts only real file paths, which is why tasks 2 and 5 name one file per folder (`bkit-build-plan-tasks`) and describe the other 39 in words — keep that form when converting.

Why this session shares the main checkout: the earlier attempt ran in a desktop-app worktree under `.claude/worktrees/`, cut from `main`, and the app refused every write into bkit's build worktree under `.worktrees/`. This session was started with no app worktree so those writes work.

State of the repo: branch `dev` at `260d88ac7`, pushed, working tree clean. Other agents may be editing the same checkout, so commit only files you touched, by explicit path, and never push `dev` without the owner's approval. The owner reads plain English: lead with the answer and keep file paths, commands and error strings verbatim.

Task:
Run the bkit build workflow for GitHub issue #1011 in this repo: invoke the `bkit-build` skill with the argument `#1011` and follow the workflow exactly as it is written, including its own git, worktree and resume rules.

First confirm where you are: `pwd` must print `/Users/christian/Documents/GitHub/bkit` and `git branch --show-current` must print `dev`. If you are instead inside `.claude/worktrees/`, stop and report that, because the desktop app blocks writes from there into bkit's build worktree.

Issue: "Rules: ship a Project Goals section and name it in every prompt" — https://github.com/cbartens/bkit/issues/1011. Its body is in bkit's change shape with five tasks in two groups.

An earlier run of this build stopped at Step 4 (Plan Convert) and took the workflow's Failure Path. Let the workflow decide how to resume; do not clean up by hand. What that run left:
- build worktree `.worktrees/1011-rules-ship-project` on branch `feat/1011-rules-ship-project`, holding only the workflow's setup commits `55d6c2307` and `13c41d9e5`
- two uncommitted files in that worktree: `.bkit/friction.jsonl` and `docs/plans/202611/logs/1011-rules-ship-project/status.jsonl`
- labels `bkit:build` and `bkit:failed` on the issue, plus a failure comment
- no plan file in the repo (the converted plan was saved outside it), so expect the convert step to run again

Done looks like: the workflow reaches its normal end state for a build (plan converted, both task groups implemented with their TEST FIRST tests written red first, gates green), and you report what the workflow produced and anything it stopped on. Do not push and do not start `/bkit-ship` unless the workflow itself or the user tells you to.

Before you start, read `.agents/rules.md` and `CLAUDE.md` as the repo requires.

Shared notes folder for this group of sessions (outside the repo; read siblings' notes there, leave hand-over notes or large findings there instead of pasting them into messages): /Users/christian/Library/Application Support/Claude/side-session-notes/local_4753a8b4-a104-467c-a320-673d3c5746b1

## Issue description — oldest

### Narrative

`.agents/rules.md` (the one rulebook every agent reads) tells an agent what it may and may not do. It does not say what the project is trying to achieve. So when two options both satisfy the rules, an agent has nothing to choose by, and the design and plan agents make that kind of choice on every run.

bkit's own repo has a `## Project Goals` section for this, between `## Project Rules` and `## Project Settings`. It sits below `<!-- bkit:end -->`, the line under which a project owns the text and bkit never writes, so it reaches no other repo.

This change gives every repo the same slot:

1. **An empty `## Project Goals` section in the shipped rules file,** shaped like `## Project Settings`: one sentence saying what goes there, then commented-out examples. bkit ships the slot, not goals. A project's goals are its own.
2. **Every subagent prompt names the section.** Each of the 40 prompts opens with one shared sentence that says to read the rules file from `bkit:end` down and "follow its `Universal Rules`". Goals sit beside the rules, not under that name, so the sentence gains a clause that says to break ties by the `Project Goals`.
3. **`bkit tips` (the command that suggests setup improvements) points out a missing or empty section.** bkit never writes below `bkit:end`, so a repo installed before this change does not get the heading on upgrade. A tip tells the owner to add it.

**Target text — the shared sentence,** clause `rules-leaf` in `.bkit/instructions.md` § Clauses:

```text
**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
```

**Target text — the section** in `.bkit/core/.agents/rules.md`, between `## Project Rules` and `## Project Settings`. The examples name no app stack:

```markdown
## Project Goals

What this project optimises for, most important first. Goals break ties: when two options both satisfy the rules, pick the one that serves these goals better. One bullet per goal; delete unused examples.

<!-- Examples:
- **Correct over fast:** A wrong answer costs more than a slow one. Prefer the option that checks its input.
- **Works for everyone:** Every screen works with a keyboard and a screen reader. Prefer the option that keeps it so.
- **Small to run:** Prefer the option with fewer moving parts to deploy and watch.
-->
```

**Target text — the header box line** in the same file, after the `Project Rules` line:

```markdown
> - What the project optimises for → `Project Goals`, between `Project Rules` and `Project Settings`. Goals break ties between options the rules both allow, and add no rule.
```

**Target text — the tip,** a `SetupTip` entry in `.bkit/core/engine/checks/tips/catalogue.ts`:

<!-- prettier-ignore -->
| Field | Value |
| --- | --- |
| `id` | `project-goals` |
| `workflows` | `design`, `plan` |
| `title` | Project goals |
| `line` | Agents have rules but no goals, so when two options both fit the rules they choose by guesswork. Write down what this project optimises for. |
| `why` | Design and plan agents choose between options on every run. The rules say what is allowed, not what matters most here, so each agent weighs speed, cost and polish its own way. |
| `ask` | Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first. |
| `steps` | `` `.agents/rules.md` § Project Goals. `` |
| `fires` | True when `.agents/rules.md` exists and its `## Project Goals` section, read below `<!-- bkit:end -->`, is missing or holds no `- ` bullet once HTML comments are removed. |

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
| Test description | Type | Target file |
| --- | --- | --- |
| The template holds `## Project Goals` between `## Project Rules` and `## Project Settings`, with no goal bullet outside an HTML comment | unit | `.bkit/core/engine/audits/repo/rules-sync.test.ts` |
| Clause `rules-leaf` reads below `bkit:end`, breaks ties by `Project Goals` and skips `Orchestrator Rules` | unit | `.bkit/core/engine/tools/instructions.test.ts` |
| The `project-goals` tip fires when the rules file has no `## Project Goals` heading | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` |
| The `project-goals` tip fires when the section holds only commented examples | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` |
| The `project-goals` tip stays quiet when the section holds one bullet, and when there is no rules file | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` |

### Tasks

<!-- bkit:group 1 start -->

### TASK GROUP 1: Section, shared sentence and docs

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add the `## Project Goals` starter and its header box line to the shipped rules file
  - **UPDATE:** `.bkit/core/.agents/rules.md`: add the header box line after the `Project Rules` line, and add the `## Project Goals` section between `## Project Rules` and `## Project Settings`, both as the target text above
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
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Bring the doc that describes the rules file in line
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `Central agent rules` row of § Special Behaviors describes `Project Goals` as a third section a leaf reads, and quotes the new sentence
  - **UPDATE:** `.bkit/instructions.md`: entry `central-agent-rules-rules-bullet` of § Special Behaviors carries the same row text
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `git grep -n "follow its \`Universal Rules\`; skip" -- .bkit/core .bkit/instructions.md` finds the old sentence only inside `retired` blocks, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->

### TASK GROUP 2: Tip and installed copies

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Add the `project-goals` tip
  - **UPDATE:** `SETUP_TIPS` in `.bkit/core/engine/checks/tips/catalogue.ts`: a `project-goals` entry with the fields of the target table above
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

- [ ] **TASK 5:** Re-render the installed copies and check install and upgrade on a scratch project
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

### Open Questions & Assumptions

No question is open. These were decided or checked before the build:

- **Wording of the clause.** "break ties by its `Project Goals`", confirmed by the owner over "work towards", which reads as an instruction to act and could send a build agent outside its task.
- **Workflows and entry files keep their sentence.** Clause `rules-orchestrator` ("Read `.agents/rules.md` → follow all rules.") is carried by the six workflows, `CLAUDE.md` and `GEMINI.md`. Those readers load the whole file, and the section's own first sentence says how to use it.
- **No doc lists the tips one by one.** `DETAILS.md` § Spending fewer tokens names a chosen few and stays as it is.
- **Cost of an unfilled section.** The starter adds a few lines that every agent in every run reads. Accepted, because the tip asks the owner to fill the section or delete the examples.
- **bkit's own repo.** Its `## Project Goals` section already holds goals, so the tip stays quiet there and nothing below `bkit:end` changes.

### Breaking Changes & Naming

- No breaking change and no migration. A repo installed before this change works as it does today. bkit never writes below `bkit:end`, so no upgrade step adds the heading.
- Names: section `Project Goals`, tip id `project-goals`.

### Out of Scope

- Shipping bkit's own goals to other repos.
- Any install or upgrade step that writes into the text below `bkit:end`.
- Changing clause `rules-orchestrator`, or which bkit rules are copied into a prompt's `**Rules:**` block.
- Adding the tip to the list in `DETAILS.md`.
- Different goals per workflow or per agent.

### References

- `.agents/rules.md` § Project Goals — bkit's own goals, the model for the section.
- `.bkit/instructions.md` § Clauses — `rules-leaf`, `rules-orchestrator`.
- `.bkit/authoring.md` § All Agent-Read Files — **Shared wording**, **Say it once**.
- [#750 — Workflow optimisation](https://github.com/cbartens/bkit/issues/750)

## Issue comment — posted 2026-11-17T01:27:24.000Z

Made build-ready and moved to the v6.2 milestone.

**What changed on the issue**

- Label `next:build`, milestone `v6.2`, board Status `Ready`.
- The body is now in the change shape with five tasks in two groups. Every file and symbol a task reads or updates was checked against the repo.
- Each test named under TEST FIRST fails today for the reason given. The clause change has a red test because `.bkit/core/engine/tools/instructions.test.ts` already pins the exact `rules-leaf` text.
- Task 1 also updates the existing test `the template ships NO project rules below bkit:end — only the empty group scaffold` in `.bkit/core/engine/audits/repo/rules-sync.test.ts`. Without that, the commented example goals would count as real rules and fail it.

**Checked with bkit's own commands**

- `bkit tasks open` reads both groups: tasks 1 to 3 in group 1, tasks 4 and 5 in group 2.
- `bkit tests plan-check` on the body with the plan-only `Task` column added to the test matrix: 0 problems, 0 existence findings. The issue keeps the three-column matrix that `.bkit/trackers.md` § Issue shapes asks for; the convert step adds the fourth column.
- The plan check accepts only real files, not folders or wildcards. So tasks 2 and 5 name one real prompt file per folder (`bkit-build-plan-tasks`) and say the other 39 files in that folder are written by the same command.

**Not done here**

- No shipped file is changed yet. bkit's own `## Project Goals` section is in `.agents/rules.md` on `dev` (commit `e35b938a1`, not pushed).
