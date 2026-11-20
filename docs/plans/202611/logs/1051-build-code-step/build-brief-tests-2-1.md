# Brief: group 2 — Challenge round 1 findings (tests)

Plan: Build code step: a code step's commit carries the repo's generated output Implementation Plan

## Why and what

### Context & Goals

A build code step (`@bkit-build-plan-tasks`, `@bkit-build-plan-gaps-remediate`, and the holistic fix) edits engine sources and hands back; `bkit steps finish` then exits 8 because the pre-commit hook finds the committed `dist/` stale, and the orchestrator builds and re-runs by hand. Goal: `bkit steps finish` for a code step makes the repo's own generated output current before it commits, so the first finish commits, with no hand recovery and no stack named in the engine.

**Related Issues:**

- #1051 — a code step's `steps finish` refused on a stale `dist/` (open)

**Reproduction (settled from the five friction rows and the code):**

- The five rows in `.bkit/friction.jsonl` (`code-agent-skips-dist-build` for run `960`; `code-step-stale-dist/build-plan-tasks` for `1011-rules-ship-project` group 3, `992-ledger-commands-six` groups 1 and 4, `1018-subagent-commits-makes` group 4) record the exit 8 and the hand recovery. None of the five run logs records a command, so the rows cannot say whether the agent ran no build or built before its last edit. They do rule out "the instruction is missing": `.bkit/core/prompts/bkit-build-plan-tasks.md` step 9 already says to run `pnpm bkit:generate` once after the last edit, this repository's `bkit:generate` already starts with `pnpm build`, and the `1018-subagent-commits-makes` run carried the brief sentence too.
- Step 10 of the same prompt runs `bkit tests changed`, which can send the agent back to edit after step 9. So an instruction can be skipped or overtaken, and only the engine's own run at finish sees the final tree.
- The failing test drives `bkit steps finish` for a code step in a scratch git repository whose pre-commit hook refuses a stale output. It exits 8 today and passes once finish runs the repo's generate script.

**Home (one, in the engine): `bkit steps finish`, not `bkit tests changed`.** Finish is the last point before the commit, so it sees the tree that is committed. `bkit tests changed` runs before the agent's last fix round (step 10 loops until green) and only when the agent calls it; a build there can go stale again after the next edit, and it would add a side effect to a command that today only checks. The two homes are not both built.

**The contract is one that exists.** `bkit:generate` (`.bkit/core/.bkit/workflows.md` § Local gate scripts): no arguments, idempotent, exit 0 on success, rewrites every generated file and saved baseline; undeclared → every caller skips it. This repository's script already begins with `pnpm build`, so `dist/` is covered, and the engine names no `pnpm`, `tsc` or `dist/` beyond the existing `scriptCommand`. No new script name and no new `package.json` `bkit.*` key. A repo that does not declare `bkit:generate` (or declares it empty) behaves exactly as today: nothing runs. Exit 8 stays for every other hook refusal.

**Wiring this repository:** none needed, because `bkit:generate` is already declared and starts with `pnpm build`. The line of `tmp/v63/briefs/build-rules.md` the orchestrator can delete once this lands is "Run `pnpm build` in the worktree before the code step's finish block, so `dist/` matches the sources and the commit hook does not refuse the commit."

**Out of scope, proposed separately:** the prompt's own step 9 (`bkit:generate` run by the agent, with its `BLOCKED — bkit:generate` line) becomes a second way to do the same thing; `.bkit/core/prompts/` is frozen for this run, so removing it is a follow-up. `branches.ts` keeps private copies of "is `bkit:generate` declared" and "run it and log the tail"; folding them into one shared helper waits for the frozen file.

## Where it fits

- Group 1: A code step's finish makes the generated output current — done
  - TASK 1: `bkit steps finish` runs the repo's declared `bkit:generate` before it commits a build code step — done
  - TASK 2: The docs say who runs `bkit:generate`, and that `steps finish` makes `dist/` current for a code step — done
- Group 2: Challenge round 1 findings — this group
  - TASK 3: A code step whose `bkit:generate` fails (a FAIL verdict with its `BLOCKED — bkit:generate` line, or a HANDOVER mid-edit) now exits 16, which no workflow routes, so a step that used to land and enter the remediate or handover loop sends the whole build to the Failure Path — open
  - TASK 4: A code step whose engine change adds a seeded `bkit.workflows` default is refused with exit 13 on every finish, because this repo's `bkit:generate` runs `pnpm bkit upgrade` (`seedBkitDefaults` writes every missing seeded key into `package.json`) before the `bkit.workflows` check, so restoring HEAD's values as the exit-13 message says is undone by the next finish's generate — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A code step whose `bkit:generate` fails (a FAIL verdict with its `BLOCKED — bkit:generate` line, or a HANDOVER mid-edit) now exits 16, which no workflow routes, so a step that used to land and enter the remediate or handover loop sends the whole build to the Failure Path
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1437` · **Round:** 1
  - **DONE WHEN:** A failing `bkit:generate` never refuses a build code step's finish, whatever the step's verdict. Finish logs the command, its exit and its last 20 output lines to stderr as it does now, prints `generate: failed`, and appends one friction row through the existing `appendFrictionRow`, shaped like the planned-test-lock row of `recordTestLockFriction`. It then runs the planned-test lock, the `bkit.workflows` check, the row and the commit exactly as before this build. A FAIL or HANDOVER step lands its row, so the remediate or handover loop runs; a PASS step lands with the failure on record, and the later verify, gate and fix loop deal with it. Exit 16 and `EXIT_GENERATE_FAILED` are deleted from `steps.ts` (the constant, its `exitCodes` row and the `generate` output help), from `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` (through `pnpm cli:sync`), from the `Callers` bullet of `.bkit/core/.bkit/workflows.md` and its rendered `.bkit/workflows.md` ("exit 16 when it fails"), and from the `docs/testing.md` row. No workflow or prompt file changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs` fails on the finish exiting 16, "expected 16 to be 0" (fixture: `stale("echo generate-boom >&2; exit 3", "#!/bin/sh\nexit 0\n")` with `logs/execute-1-log.md` holding `Verdict: FAIL` and the line `BLOCKED — bkit:generate: generate-boom`)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens` fails on the finish exiting 16, "expected 16 to be 0" (same fixture with `Verdict: HANDOVER`)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit` fails on the finish exiting 16, "expected 16 to be 0" (same fixture with `Verdict: PASS`; asserts `generate: failed` in the output, one new friction row, the step row and a new commit)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` fails on the finish exiting 16 where the step must now land — existing test, taken over because this task removes exit 16; the rewrite asserts exit 0, the row written and the commit made

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A code step whose engine change adds a seeded `bkit.workflows` default is refused with exit 13 on every finish, because this repo's `bkit:generate` runs `pnpm bkit upgrade` (`seedBkitDefaults` writes every missing seeded key into `package.json`) before the `bkit.workflows` check, so restoring HEAD's values as the exit-13 message says is undone by the next finish's generate
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1679` · **Round:** 1
  - **DONE WHEN:** `bkit steps finish` reads `bkit.workflows` from the working tree's `package.json` before it runs `bkit:generate`, and splits the `bkit.workflows` check in two:
    - A difference between `HEAD` and that reading is the step's own edit. It is refused with exit 13 in every repository, as today.
    - A difference between that reading and the file after `bkit:generate` is a generated change. In bkit's own repository, when every changed key is a key that was absent before generate, the change goes into the step's commit, the output prints the added keys, and the step's `step-done` row carries them. In bkit's own repository, a generated change to an existing key's value or a removed key exits 13 as today. In every other repository a generated change exits 13 as today, and the logged line says that `bkit:generate` made the change and names the keys.
    - bkit's own repository is the one whose main checkout (the parent of `git rev-parse --path-format=absolute --git-common-dir`) is the engine's package root, `getPkgRoot()`. One helper in `.bkit/core/engine/shared/package-roots.ts` answers it, taking the package root as a parameter that defaults to `getPkgRoot()` so the tests can name a scratch root. The three inline `path.resolve(cwd) === getPkgRoot()` copies in `.bkit/core/engine/install/payload-links.ts:73` and `.bkit/core/engine/install/template-copies.ts:62` and `:184` call it instead. No config key, environment variable, flag or `package.json` `name` decides it.
    - Every doc source that states the exit-13 refusal says this, starting with `.bkit/core/.bkit/workflows.md` and the `exitCodes` row `pnpm cli:sync` renders into `.bkit/core/.bkit/cli.md`. No workflow or prompt file changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing` fails on the logged line, which does not name `bkit:generate` or the added key (fixture: `stale(<a node -e script that adds bkit.workflows.seeded to package.json>, "#!/bin/sh\nexit 0\n")`; asserts exit 13, HEAD unchanged, no step row)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row` fails on the finish exiting 13, "expected 13 to be 0" (same fixture, the scratch repo named as the package root; asserts `package.json` with the added key in the commit, the key in the output and on the `step-done` row)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit` fails on the logged line, which does not tell the step's own edit from a generated one (the scratch repo named as the package root, `package.json` `bkit.workflows` edited before finish; asserts exit 13, nothing committed, the line naming the step's edit)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate` fails on the logged line, which does not name `bkit:generate` or the changed key (the scratch repo named as the package root, generate rewriting an existing key's value; asserts exit 13 and nothing committed)

<!-- bkit:task 4 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a code step finish runs the declared `bkit:generate` first, so a hook that refuses a stale output lets the commit through and the commit holds the rebuilt output | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| the gaps-remediate and holistic-remediate steps build the output too | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| a repo with no `bkit:generate` script runs nothing and a stale-output hook still exits 8 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| an empty `bkit:generate` script counts as undeclared | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| a step that is not a code step never runs `bkit:generate` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| a failing `bkit:generate` exits 16 with nothing written and nothing committed | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| a hook refusal about something else stays exit 8 after `bkit:generate` ran | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `--commit=none` does not run `bkit:generate` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| a failing `bkit:generate` exits 16 with nothing written and nothing committed | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 4 |
| in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 4 |
| in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 4 |
| in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 4 |

### Planned tests taken over from earlier tasks

- TASK 3 `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` — taken over from TASK 1; rewrite that test case so it fails until this task's code exists

## Deviations

Run instructions from the orchestrator's brief (tmp/v63/briefs/1051.md), word for word:

- Cut the worktree from local `dev`. Local `dev` is ahead of `origin/dev` (the build of issue 958 landed as `724848c61`). Do not fetch or push.
- Reproduce first, as the issue asks: settle from the five friction rows and from a test whether the code agent ran no build, or ran one before its last edit. The failing test drives `bkit steps finish` for a code step in a scratch repository whose commit hook refuses a stale build output, and fails today on exit 8.
- One home, in the engine. The issue names two candidates (`bkit steps finish` for a code step, or `bkit tests changed`). Pick one in the plan and say why; do not build both.
- Stack-agnostic is a hard rule here (`.agents/rules.md` § Repo Authoring, `Stack-agnostic`): the engine, the workflows and the prompts may not name `pnpm`, `tsc` or `dist/`. A stack-specific need is a `package.json` script name plus its input and output contract (`.bkit/core/.bkit/workflows.md` § Local gate scripts). Prefer a contract that already exists over a new one. If the fix needs a new script name or a new `package.json` `bkit.*` key, the plan names it, its default when a repo does not set it (nothing runs, as today), and the doc rows that list it; say so in your final message, because the owner sees it in the wave report.
- A repo that sets nothing behaves exactly as today. Prove that with a test.
- Exit 8 from `bkit steps finish` stays for every other hook refusal; the workflow's Finish contract sentence about exit 8 is not removed.
- Workflow and prompt text: no change expected. If a workflow or prompt sentence must change, the net word count may not grow (`pnpm bkit:text:ceiling check` stands at prompts 83,837 and workflows 57,977, exactly at the record). Never `raise`.
- Files you must not change: `.bkit/core/engine/commands/workflow/tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `.bkit/core/engine/commands/land.ts` and their tests (other helpers and the build of issue 1042 work on them now); `.bkit/instructions.md`; every file under `.bkit/core/prompts/`; `.husky/*`; `.github/workflows/*`. If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- This repository is also a user of the fix: when the engine part is proven, wire this repository's own setting (if the fix has one) so its code steps build `dist/` through it, and say in your final message which line of `tmp/v63/briefs/build-rules.md` the orchestrator can now delete.
