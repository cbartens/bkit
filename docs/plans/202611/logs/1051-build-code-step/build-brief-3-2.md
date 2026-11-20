# Brief: group 3 — Challenge round 2 findings

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
- Group 2: Challenge round 1 findings — done
  - TASK 3: A code step whose `bkit:generate` fails (a FAIL verdict with its `BLOCKED — bkit:generate` line, or a HANDOVER mid-edit) now exits 16, which no workflow routes, so a step that used to land and enter the remediate or handover loop sends the whole build to the Failure Path — done
  - TASK 4: A code step whose engine change adds a seeded `bkit.workflows` default is refused with exit 13 on every finish, because this repo's `bkit:generate` runs `pnpm bkit upgrade` (`seedBkitDefaults` writes every missing seeded key into `package.json`) before the `bkit.workflows` check, so restoring HEAD's values as the exit-13 message says is undone by the next finish's generate — done
- Group 3: Challenge round 2 findings — this group
  - TASK 5: In bkit's own repo, the round-1 refusal this group set out to fix still ends the run: a code step that follows its prompt runs `pnpm bkit:generate` itself (`.bkit/core/prompts/bkit-build-plan-tasks.md:121`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md:106`), whose `pnpm bkit upgrade` writes the new seeded `bkit.workflows` key into `package.json` (`upgrade.ts:941` → `modules/index.ts:159` → `core.ts:591` `seedBkitDefaults`) before finish takes its "before generate" reading, so the first finish exits 13 as "the step's own edit"; a key left by a finish the hook (exit 8) or the planned-test lock (exit 11) refused does the same on the re-run; no build step routes exit 13, so the run goes to the Failure Path — done
  - TASK 6: A failed `bkit:generate` at a code step's finish is recorded as one more "a code step edited a planned test case" in any repo whose `.bkit/friction.jsonl` already holds an exit-11 row for that step (this repo does, at `recurrenceCount` 7), because `recordGenerateFriction` and `recordTestLockFriction` both key their rows `steps-finish/<step>` and `appendFrictionRow` folds a same-key row into the prior row's summary and description, so the only durable record of a step that landed with stale generated output is lost — done
  - TASK 7: A code step's finish in bkit's own repo that cannot put the step's `package.json` back says which write landed, and says so when none did — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** A code step's finish in bkit's own repo that cannot put the step's `package.json` back says which write landed, and says so when none did
  - **UPDATE:** `restoreKept` in `.bkit/core/engine/commands/workflow/steps.ts`: return which of its three outcomes happened (the structured `bkit.workflows` write landed, the step's original bytes were written back, or nothing was written back with the write error's message) instead of a boolean that is false both when the byte fallback lands and when it throws; the catch keeps the error instead of dropping it
  - **UPDATE:** `refuseWriteBack` in `.bkit/core/engine/commands/workflow/steps.ts`: take the outcome and log the true one; when nothing was written back the message says the step's `package.json` was not restored and names the write error, and exit 13 with nothing written stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the test below, beside `in bkit's own repo a bkit:generate that leaves package.json unparseable gets the step's original package.json back and exits 13`
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt with `pnpm build` and staged
  - **DONE WHEN:** In bkit's own repo, when finish has set the step's `bkit.workflows` reading aside and neither the structured write nor the byte write can put it back, finish exits 13, commits nothing, and its message says the step's `package.json` was not restored and names the write error; when the byte write lands, the message still says the original `package.json` is restored. The change stays inside `.bkit/core/engine/commands/workflow/steps.ts`, `steps.test.ts` and the rebuilt `dist/`; no prompt, workflow or install file changes. Removes: the "its original package.json is restored" message on a finish that restored nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error` fails on stderr saying "its original package.json is restored" with no write error named, "expected <stderr> to contain 'not restored'" (fixture: `stale` with a `bkit:generate` that removes `package.json` and makes a directory of that name, `OK_HOOK`, `asBkitRepo(cwd)`, the committed `package.json` rewritten with `bkit.workflows.hand` = true before `EXECUTE`; asserts exit 13, stderr holding "not restored" and `EISDIR`, stderr not holding "is restored", HEAD unchanged)

<!-- bkit:task 7 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Make a repo's generated output current before a code step's commit | `.bkit/core/engine/commands/workflow/steps.ts` | `rg -l "bkit:generate" .bkit/core/engine`; `grep -n "generateDeclared\|runGenerate\|runLogged" .bkit/core/engine/commands/workflow/branches.ts`; `grep -n "resolveGate" .bkit/core/engine/commands/workflow/tests.ts`; `grep -n "scriptCommand" .bkit/core/engine/shared/package-manager.ts`; `.bkit/core/.bkit/workflows.md` § Local gate scripts | `tests.ts` `resolveGate` (exported: first non-empty declared script); `shared/package-manager.ts` `scriptCommand` (argv for one script); `branches.ts` `generateDeclared` / `runGenerate` / `runLogged` (private to a file this run may not change); the `bkit:generate` contract itself | EXTEND | `finish` in the existing `steps.ts` calls `resolveGate` and `scriptCommand` and runs the script for the three build code steps; a spawn and a log of its last lines is the only new code, in `steps.ts`, because the private helpers in `branches.ts` cannot be reached. No new file, no new script name, no new `bkit.*` key. |

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
