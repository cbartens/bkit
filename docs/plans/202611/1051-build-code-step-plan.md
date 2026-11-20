# Build code step: a code step's commit carries the repo's generated output Implementation Plan

## Context & Goals

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

## Acceptance Scenario

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

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
| in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| in bkit's own repo a generated added key left by a finish the hook refused rides the re-run | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 7 |

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — engine file placement and the committed `dist/` | `docs/architecture.md` § File placement (compiler output row) | covered | None. No new file; the change sits in the existing `steps.ts`. |
| technology | `docs/technology.md` | yes — engine conventions | `docs/technology.md` (the `tsconfig.json` to committed `dist/` line) | covered | None. |
| security | `docs/security.md` | yes — the engine now spawns a repo-declared script | `docs/security.md` (read; no section on running a consumer's own scripts) | partial | Not a gap in the plan: the script is the same one `bkit branches sync --merge` and ship's regenerate already run from the repo's own `package.json`, spawned with no shell string and no input from the issue. |
| testing | `docs/testing.md` | yes — the new tests and the Key test files row | `docs/testing.md` § Key test files (the `commands/workflow/steps.test.ts` row, line 948) | covered | The row is updated in task 2. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no new log name or span; a failure prints its output tail through the existing finish log | none | none | Not applicable. |
| deployments | `docs/deployments.md` | yes — `dist/` commit policy and the hooks | `docs/deployments.md` § `dist/` commit policy | covered | The policy gains one bullet in task 2. |
| noise | `docs/noise.md` | no | none | none | Not applicable. |
| setup | `docs/setup.md` | no | none | none | Not applicable. |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Make a repo's generated output current before a code step's commit | `.bkit/core/engine/commands/workflow/steps.ts` | `rg -l "bkit:generate" .bkit/core/engine`; `grep -n "generateDeclared\|runGenerate\|runLogged" .bkit/core/engine/commands/workflow/branches.ts`; `grep -n "resolveGate" .bkit/core/engine/commands/workflow/tests.ts`; `grep -n "scriptCommand" .bkit/core/engine/shared/package-manager.ts`; `.bkit/core/.bkit/workflows.md` § Local gate scripts | `tests.ts` `resolveGate` (exported: first non-empty declared script); `shared/package-manager.ts` `scriptCommand` (argv for one script); `branches.ts` `generateDeclared` / `runGenerate` / `runLogged` (private to a file this run may not change); the `bkit:generate` contract itself | EXTEND | `finish` in the existing `steps.ts` calls `resolveGate` and `scriptCommand` and runs the script for the three build code steps; a spawn and a log of its last lines is the only new code, in `steps.ts`, because the private helpers in `branches.ts` cannot be reached. No new file, no new script name, no new `bkit.*` key. |
| Doc rows that list who runs `bkit:generate` and what `steps finish` does | `.bkit/core/.bkit/workflows.md` | `grep -n "bkit:generate" .bkit/core/.bkit/workflows.md docs/deployments.md docs/testing.md` | `.bkit/core/.bkit/workflows.md` § Local gate scripts (Callers bullet); `docs/deployments.md` § `dist/` commit policy; `docs/testing.md` Key test files row | EXTEND | One clause in each existing row; no new section. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: A code step's finish makes the generated output current

<!-- bkit:task 1 start -->

- [x] **TASK 1:** `bkit steps finish` runs the repo's declared `bkit:generate` before it commits a build code step
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

- [x] **TASK 2:** The docs say who runs `bkit:generate`, and that `steps finish` makes `dist/` current for a code step
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Local gate scripts, the `bkit:generate` `Callers` bullet gains one clause: `bkit steps finish` runs it again before the commit of each build code step, and exits 16 when it fails; the `Undeclared` bullet already says every caller skips it
  - **UPDATE:** `docs/deployments.md`: § `dist/` commit policy gains one bullet: a build code step's `steps finish` runs the repo's `bkit:generate` (which starts with `pnpm build`) before the commit, so the pre-commit `pnpm bkit:check:dist` finds `dist/` current; a hand `pnpm build && git add dist/` is for every other commit
  - **UPDATE:** `docs/testing.md`: the Key test files row for `commands/workflow/steps.test.ts` gains the finish-runs-`bkit:generate` coverage (declared, undeclared, empty, not a code step, failing, unrelated hook refusal, `--commit=none`)
  - **UPDATE:** `.bkit/workflows.md`: the rendered copy of the `.bkit/core/.bkit/workflows.md` edit, written by `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end
  - **READ:** `docs/capabilities.md`: confirm no capability row names the finish-time generate run; add none (no new capability owner)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n "steps finish" .bkit/core/.bkit/workflows.md` shows the new `Callers` clause; `docs/deployments.md` § `dist/` commit policy and the `docs/testing.md` row name the finish-time run; `.bkit/workflows.md` carries the same clause as its source (`bkit check` reports no mirror drift); no file under `.bkit/core/workflows/` or `.bkit/core/prompts/` changed, so `pnpm bkit:text:ceiling check` still stands at prompts 83,837 and workflows 57,977
  - **TEST FIRST:** n/a — docs only (a rule row, a policy bullet, a coverage row and a rendered mirror); no behaviour changes, and `bkit check` covers the mirror

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 3 start -->

- [x] **TASK 3:** A code step whose `bkit:generate` fails (a FAIL verdict with its `BLOCKED — bkit:generate` line, or a HANDOVER mid-edit) now exits 16, which no workflow routes, so a step that used to land and enter the remediate or handover loop sends the whole build to the Failure Path
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1437` · **Round:** 1
  - **DONE WHEN:** A failing `bkit:generate` never refuses a build code step's finish, whatever the step's verdict. Finish logs the command, its exit and its last 20 output lines to stderr as it does now, prints `generate: failed`, and appends one friction row through the existing `appendFrictionRow`, shaped like the planned-test-lock row of `recordTestLockFriction`. It then runs the planned-test lock, the `bkit.workflows` check, the row and the commit exactly as before this build. A FAIL or HANDOVER step lands its row, so the remediate or handover loop runs; a PASS step lands with the failure on record, and the later verify, gate and fix loop deal with it. Exit 16 and `EXIT_GENERATE_FAILED` are deleted from `steps.ts` (the constant, its `exitCodes` row and the `generate` output help), from `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` (through `pnpm cli:sync`), from the `Callers` bullet of `.bkit/core/.bkit/workflows.md` and its rendered `.bkit/workflows.md` ("exit 16 when it fails"), and from the `docs/testing.md` row. No workflow or prompt file changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs` fails on the finish exiting 16, "expected 16 to be 0" (fixture: `stale("echo generate-boom >&2; exit 3", "#!/bin/sh\nexit 0\n")` with `logs/execute-1-log.md` holding `Verdict: FAIL` and the line `BLOCKED — bkit:generate: generate-boom`)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens` fails on the finish exiting 16, "expected 16 to be 0" (same fixture with `Verdict: HANDOVER`)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit` fails on the finish exiting 16, "expected 16 to be 0" (same fixture with `Verdict: PASS`; asserts `generate: failed` in the output, one new friction row, the step row and a new commit)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failing bkit:generate exits 16 with nothing written and nothing committed` fails on the finish exiting 16 where the step must now land — existing test, taken over because this task removes exit 16; the rewrite asserts exit 0, the row written and the commit made

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [x] **TASK 4:** A code step whose engine change adds a seeded `bkit.workflows` default is refused with exit 13 on every finish, because this repo's `bkit:generate` runs `pnpm bkit upgrade` (`seedBkitDefaults` writes every missing seeded key into `package.json`) before the `bkit.workflows` check, so restoring HEAD's values as the exit-13 message says is undone by the next finish's generate
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
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 2 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** In bkit's own repo, the round-1 refusal this group set out to fix still ends the run: a code step that follows its prompt runs `pnpm bkit:generate` itself (`.bkit/core/prompts/bkit-build-plan-tasks.md:121`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md:106`), whose `pnpm bkit upgrade` writes the new seeded `bkit.workflows` key into `package.json` (`upgrade.ts:941` → `modules/index.ts:159` → `core.ts:591` `seedBkitDefaults`) before finish takes its "before generate" reading, so the first finish exits 13 as "the step's own edit"; a key left by a finish the hook (exit 8) or the planned-test lock (exit 11) refused does the same on the re-run; no build step routes exit 13, so the run goes to the Failure Path
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1718` · **Round:** 2
  - **DONE WHEN:** In bkit's own repo (`isBkitOwnRepo` on the git top level), a code step's finish defines a generated `bkit.workflows` change by what `bkit:generate` produces from HEAD's `bkit.workflows`, not by when the key appeared. When the working `package.json` `bkit.workflows` already differs from HEAD's before finish's own `bkit:generate`, finish keeps that working reading, writes HEAD's `bkit.workflows` into `package.json` (that subtree only, the rest of the working file untouched, through the `package.json` writer the engine already uses), runs `bkit:generate`, and takes the result as the generated reading. If the kept working reading equals the generated reading, nothing in it was the step's own edit, and the commit rides exactly as task 4 set it (added keys only, logged, in `generatedWorkflows` on the output and the `step-done` row). If they differ, the difference is the step's own edit: finish writes the kept working reading back so nothing the agent wrote is lost, and exits 13 naming the differing keys as the step's own edit. If `bkit:generate` fails during this, finish writes the kept working reading back before anything else, and the difference from HEAD counts as the step's own edit (exit 13), because it cannot be proven generated. With no difference from HEAD before generate, finish takes today's path, with no rewrite. In any other repo nothing changes: a difference from HEAD is exit 13 as today, and finish never rewrites `package.json`. The change stays inside `.bkit/core/engine/commands/workflow/steps.ts`, `steps.test.ts`, the doc source `.bkit/core/.bkit/workflows.md` (and its rendered `.bkit/workflows.md`), `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` through `pnpm cli:sync` when the exit-13 help changes, the `docs/testing.md` row, and the rebuilt `dist/`; no prompt, workflow or install file changes. Where the exit-13 text in the `exitCodes` help, `.bkit/core/.bkit/workflows.md` or `docs/testing.md` is no longer true, it is updated. Removes: the exit 13 that ends the run when the code agent ran `bkit:generate` itself, or a refused finish left a generated key behind, in bkit's own repo.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit` fails on the finish exiting 13 with "the step's own edit", "expected 13 to be 0" (fixture: `stale(ADD_KEY, OK_HOOK)`, `asBkitRepo(cwd)`, the `ADD_KEY` script run once in `cwd` before `EXECUTE`, as the prompt's own step does; asserts `seeded` in `HEAD:package.json` and on the `step-done` row)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a generated added key left by a finish the hook refused rides the re-run` fails on the second finish exiting 13, "expected 13 to be 0" (fixture: `stale(ADD_KEY, "#!/bin/sh\nif [ ! -f .git/hook-once ]; then touch .git/hook-once; echo first refusal >&2; exit 1; fi\nexit 0\n")`, `asBkitRepo(cwd)`, `EXECUTE` run twice; the first run exits 8, the second must exit 0 with `seeded` in `HEAD:package.json` and on the `step-done` row)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it` fails on `package.json` after the finish also holding the `seeded` key `bkit:generate` wrote, "expected <file with seeded> to be <file as written>" (fixture: `stale(ADD_KEY, OK_HOOK)`, `asBkitRepo(cwd)`, the committed `package.json` rewritten with `bkit.workflows.hand` = true before `EXECUTE`; asserts exit 13, `hand` and "own edit" in stderr, `package.json` byte-identical to the file written before finish, HEAD unchanged)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value` fails on `package.json` `bkit.workflows.seeded` being `true` after the finish, "expected true to be false" (fixture: `stale(ADD_KEY, OK_HOOK)`, `asBkitRepo(cwd)`, the committed `package.json` rewritten with `bkit.workflows.seeded` = false before `EXECUTE`; asserts exit 13, `seeded` and "own edit" in stderr, `seeded` still false in the working `package.json`, HEAD unchanged)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json` fails only if finish rewrites `package.json` outside bkit's own repo, "expected <HEAD's bkit.workflows> to be <the working bkit.workflows>"; it pins unchanged behaviour, so it passes before the fix (fixture: `stale` with a `bkit:generate` that copies `package.json` to `generate-saw.json`, `OK_HOOK`, no `asBkitRepo`, the committed `package.json` rewritten with `bkit.workflows.hand` = true before `EXECUTE`; asserts exit 13, `generate-saw.json` holding `hand`, `package.json` byte-identical to the file written before finish)
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13` fails on `package.json` after the finish holding the `seeded` key the failing `bkit:generate` wrote, "expected <file with seeded> to be <file as written>" (fixture: `stale(ADD_KEY + "; exit 3", OK_HOOK)`, `asBkitRepo(cwd)`, the committed `package.json` rewritten with `bkit.workflows.hand` = true before `EXECUTE`; asserts exit 13, "own edit" in stderr, `package.json` byte-identical to the file written before finish, HEAD unchanged)

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** A failed `bkit:generate` at a code step's finish is recorded as one more "a code step edited a planned test case" in any repo whose `.bkit/friction.jsonl` already holds an exit-11 row for that step (this repo does, at `recurrenceCount` 7), because `recordGenerateFriction` and `recordTestLockFriction` both key their rows `steps-finish/<step>` and `appendFrictionRow` folds a same-key row into the prior row's summary and description, so the only durable record of a step that landed with stale generated output is lost
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:129` · **Round:** 2
  - **DONE WHEN:** The failed-generate friction row carries a key no other friction writer at `steps finish` uses, so a failed `bkit:generate` lands as its own row (summary "bkit:generate failed at a code step's finish", its own `recurrenceCount`) whatever rows the ledger already holds, and an exit-11 row after it still folds into the exit-11 rows only. This is the record the diff's docs promise (`.bkit/core/.bkit/workflows.md:1750`, "a failure is logged, appends a friction row and never stops the step"; the `docs/testing.md` `commands/workflow/steps.test.ts` row). Probe (scratch repo, `.bkit/friction.jsonl` seeded with the last `steps-finish/build-plan-tasks` row of this repo's ledger, `bkit:generate` = `echo generate-boom >&2; exit 3`, `BKIT_ENGINE_JOURNAL=on`): finish exits 0, and the appended row has `key` `steps-finish/build-plan-tasks`, `summary` "a code step edited a planned test case", `recurrenceCount` 8 and the seeded row's exit-11 `description` ("refused build-plan-tasks with exit 11: …").
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step` fails on the last friction row's `summary`, "expected 'a code step edited a planned test case' to be 'bkit:generate failed at a code step's finish'" (fixture: `stale(BOOM, OK_HOOK)` with `.bkit/friction.jsonl` seeded before `EXECUTE` by `appendFrictionRow` with a `frictionRow({ workflow: "build", step: "build-plan-tasks", noun: "steps", verb: "finish", code: 11, bookRoot: cwd })` whose `summary` is "a code step edited a planned test case"; `BKIT_ENGINE_JOURNAL` stubbed on)

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A code step's finish in bkit's own repo that cannot put the step's `package.json` back says which write landed, and says so when none did
  - **UPDATE:** `restoreKept` in `.bkit/core/engine/commands/workflow/steps.ts`: return which of its three outcomes happened (the structured `bkit.workflows` write landed, the step's original bytes were written back, or nothing was written back with the write error's message) instead of a boolean that is false both when the byte fallback lands and when it throws; the catch keeps the error instead of dropping it
  - **UPDATE:** `refuseWriteBack` in `.bkit/core/engine/commands/workflow/steps.ts`: take the outcome and log the true one; when nothing was written back the message says the step's `package.json` was not restored and names the write error, and exit 13 with nothing written stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the test below, beside `in bkit's own repo a bkit:generate that leaves package.json unparseable gets the step's original package.json back and exits 13`
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt with `pnpm build` and staged
  - **DONE WHEN:** In bkit's own repo, when finish has set the step's `bkit.workflows` reading aside and neither the structured write nor the byte write can put it back, finish exits 13, commits nothing, and its message says the step's `package.json` was not restored and names the write error; when the byte write lands, the message still says the original `package.json` is restored. The change stays inside `.bkit/core/engine/commands/workflow/steps.ts`, `steps.test.ts` and the rebuilt `dist/`; no prompt, workflow or install file changes. Removes: the "its original package.json is restored" message on a finish that restored nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error` fails on stderr saying "its original package.json is restored" with no write error named, "expected <stderr> to contain 'not restored'" (fixture: `stale` with a `bkit:generate` that removes `package.json` and makes a directory of that name, `OK_HOOK`, `asBkitRepo(cwd)`, the committed `package.json` rewritten with `bkit.workflows.hand` = true before `EXECUTE`; asserts exit 13, stderr holding "not restored" and `EISDIR`, stderr not holding "is restored", HEAD unchanged)

<!-- bkit:task 7 end -->
<!-- bkit:group 3 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (none: both rows are `EXTEND`).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Text ceiling:** `pnpm bkit:text:ceiling check` passes at the recorded totals (no prompt or workflow text changed).
- [ ] **Dogfood (`Verify before complete`):** `pnpm build`, then a scratch repo with a stale-output pre-commit hook and a declared `bkit:generate`; `node dist/cli.js steps finish` on a code step exits 0 on the first call and its commit holds the rebuilt output; the same repo with the script removed exits 8 as before.

### Manual Verification

- [ ] **Step 1:** in the next build that edits engine sources, the code step's first `steps finish` commits with no hand `pnpm build`, and the orchestrator deletes the matching line from `tmp/v63/briefs/build-rules.md`.
