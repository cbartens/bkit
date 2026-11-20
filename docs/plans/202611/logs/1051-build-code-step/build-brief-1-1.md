# Brief: group 1 — A code step's finish makes the generated output current

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

- Group 1: A code step's finish makes the generated output current — this group
  - TASK 1: `bkit steps finish` runs the repo's declared `bkit:generate` before it commits a build code step — open
  - TASK 2: The docs say who runs `bkit:generate`, and that `steps finish` makes `dist/` current for a code step — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `bkit steps finish` runs the repo's declared `bkit:generate` before it commits a build code step
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: for `workflow=build`, `--commit=auto` and a code step (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`), run the repo's `bkit:generate` once the gate's mechanical checks have passed and before the planned-test lock, the `bkit.workflows` check and the commit, so each of those judges the tree that is committed; on a non-zero exit refuse with the new exit 16, log the last 20 lines of its output, write nothing and commit nothing; print `generate` (`ran`, `undeclared`, or null when not a code step or `--commit=none`) in the JSON output
  - **UPDATE:** `EXIT_SOURCE_TOUCHED` in `.bkit/core/engine/commands/workflow/steps.ts`: add `EXIT_GENERATE_FAILED = 16` beside the other finish exit codes and one `CODE_STEPS` set of the three code steps, used by the new check and by the existing planned-test-lock condition so the two lists cannot drift
  - **UPDATE:** `stepsCommand` in `.bkit/core/engine/commands/workflow/steps.ts`: the `finish` verb's `summary` (one clause: a build code step first runs a declared `bkit:generate`), its `output` (`generate`) and its `exitCodes` (16)
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate the `finish` row with `pnpm cli:sync`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: a `describe` for the eight tests below, over a real scratch git repo with a `package.json` `bkit:generate` script and a `.git/hooks/pre-commit` that exits 1 when `built.txt` differs from `source.txt`
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt with `pnpm build` and staged, so the engine edit and its output land in one commit
  - **READ:** `resolveGate` in `.bkit/core/engine/commands/workflow/tests.ts`: returns the first non-empty declared script, so an empty `bkit:generate` counts as undeclared
  - **READ:** `scriptCommand` in `.bkit/core/engine/shared/package-manager.ts`: the argv for one `package.json` script, the only place the package runner is named
  - **READ:** `runGenerate` in `.bkit/core/engine/commands/workflow/branches.ts`: the existing run-and-log-the-tail shape to match; the file is not changed
  - **READ:** `docs/architecture.md`: § File placement, `dist/` is compiler output
  - **READ:** `docs/security.md`: the script is the repo's own, spawned by argv
  - **DONE WHEN:** the eight tests below pass; with `bkit:generate` declared, a code step's finish whose hook refuses a stale output exits 0 and its commit holds the rebuilt output; with no `bkit:generate` declared, or an empty one, nothing runs and the stale-output hook still exits 8; a failing `bkit:generate` exits 16 with no row and no commit; `pnpm cli:sync` leaves `.bkit/core/.bkit/cli.md` unchanged on a second run; `pnpm build` leaves `dist/` equal to a fresh compile (`pnpm bkit:check:dist` passes); `.bkit/core/engine/commands/workflow/tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.husky/` and `.github/workflows/` are unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through` fails on the finish exiting 8, "expected 8 to be 0", because nothing rebuilds `built.txt` before the commit
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the gaps-remediate and holistic steps build the output too` fails on both finishes exiting 8, "expected 8 to be 0"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8` fails on the output having no `generate` field, "expected undefined to be 'undeclared'"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `an empty bkit:generate script counts as undeclared` fails on the output having no `generate` field, "expected undefined to be 'undeclared'"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a step that is not a code step never runs bkit:generate` fails on the output having no `generate` field, "expected undefined to be null"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` fails on the finish committing instead, "expected 0 to be 16"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a hook refusal about something else stays exit 8 after bkit:generate ran` fails on the output having no `generate` field, "expected undefined to be 'ran'"
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `--commit=none does not run bkit:generate` fails on the output having no `generate` field, "expected undefined to be null"

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The docs say who runs `bkit:generate`, and that `steps finish` makes `dist/` current for a code step
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Local gate scripts, the `bkit:generate` `Callers` bullet gains one clause: `bkit steps finish` runs it again before the commit of each build code step, and exits 16 when it fails; the `Undeclared` bullet already says every caller skips it
  - **UPDATE:** `docs/deployments.md`: § `dist/` commit policy gains one bullet: a build code step's `steps finish` runs the repo's `bkit:generate` (which starts with `pnpm build`) before the commit, so the pre-commit `pnpm bkit:check:dist` finds `dist/` current; a hand `pnpm build && git add dist/` is for every other commit
  - **UPDATE:** `docs/testing.md`: the Key test files row for `commands/workflow/steps.test.ts` gains the finish-runs-`bkit:generate` coverage (declared, undeclared, empty, not a code step, failing, unrelated hook refusal, `--commit=none`)
  - **UPDATE:** `.bkit/workflows.md`: the rendered copy of the `.bkit/core/.bkit/workflows.md` edit, written by `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end
  - **READ:** `docs/capabilities.md`: confirm no capability row names the finish-time generate run; add none (no new capability owner)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n "steps finish" .bkit/core/.bkit/workflows.md` shows the new `Callers` clause; `docs/deployments.md` § `dist/` commit policy and the `docs/testing.md` row name the finish-time run; `.bkit/workflows.md` carries the same clause as its source (`bkit check` reports no mirror drift); no file under `.bkit/core/workflows/` or `.bkit/core/prompts/` changed, so `pnpm bkit:text:ceiling check` still stands at prompts 83,837 and workflows 57,977
  - **TEST FIRST:** n/a — docs only (a rule row, a policy bullet, a coverage row and a rendered mirror); no behaviour changes, and `bkit check` covers the mirror

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Doc rows that list who runs `bkit:generate` and what `steps finish` does | `.bkit/core/.bkit/workflows.md` | `grep -n "bkit:generate" .bkit/core/.bkit/workflows.md docs/deployments.md docs/testing.md` | `.bkit/core/.bkit/workflows.md` § Local gate scripts (Callers bullet); `docs/deployments.md` § `dist/` commit policy; `docs/testing.md` Key test files row | EXTEND | One clause in each existing row; no new section. |

Reuse Inventory rows left out: 1; Architecture entries left out: 0 — read them in docs/plans/202611/1051-build-code-step-plan.md § Reuse Inventory and § Architecture & Component Changes.

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
