# Pre-push: load the repo environment Implementation Plan

## Context & Goals

The pre-push hook's inner, logged run goes through `direnv exec .`, so the gate always runs with the repo's `.envrc` variables, and an untrusted folder blocks in seconds with `direnv allow .`. A `bkit tips` entry tells repos with an older hook copy to paste the new block.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| direnv-loaded inner run and trust probe | `.bkit/templates/.husky/pre-push` | `grep -n "BKIT_PRE_PUSH_LOGGED" .bkit/templates/.husky/pre-push .husky/pre-push` | `.bkit/templates/.husky/pre-push` log block — runs `sh "$0" "$@"`, lacks direnv | EXTEND | change the log block in place |
| bkit's own hook copy | `.husky/pre-push` | same search | `.husky/pre-push` log block (hand-edited bkit-only region) | EXTEND | same change by hand |
| pre-push-direnv tip | `.bkit/core/engine/checks/tips/catalogue.ts` | `grep -n "min-push" .bkit/core/engine/checks/tips/catalogue.ts` | `min-push` tip — same shape (stale hook copy) | EXTEND | add a sibling tip entry |
| hook docs | `.bkit/core/.bkit/templates.md` | `grep -n "direnv" .bkit/core/.bkit/templates.md` | § Git hooks — Husky, § direnv — `.envrc` | EXTEND | rewrite both sections |

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| trusted `.envrc`, variable missing from the shell → the gate sees the variable | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| untrusted `.envrc` → exit 1, stderr names `direnv allow .`, no `bkit check` or gate call | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| no `.envrc` → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `direnv` not on `PATH` → gates run, no warning | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `CI` set → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| delete-only push through `direnv exec` → exit 0, no gate | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| tip fires for a hook without `direnv exec` when `.envrc` exists; not when the hook has it; not without `.envrc` | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 2 |
| setup with an .envrc differing from the main checkout's reports that the push will block | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
| trusted .envrc → .bkit/.env tooling keys do not reach the gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 5 |
| the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 8 |
| the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 9 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: The pre-push hook loads the repo environment itself

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the log block (`BKIT_PRE_PUSH_LOGGED`): when `.envrc` exists, `direnv` is on `PATH` and `CI` is empty, probe trust with `direnv exec . true`; probe fails → print the `direnv allow .` fix and exit 1 inside the logged group; probe passes → start the inner run as `BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 direnv exec . sh "$0" "$@"`; otherwise keep `sh "$0" "$@"`; update the block's comment to say so
  - **UPDATE:** `.husky/pre-push`: the same change in bkit's own copy (its log block sits in the `bkit-only` region, so it is edited by hand)
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the `.husky/pre-push log` suite's stub `pnpm` and `PATH` setup, to add a stub `direnv`
  - **DONE WHEN:** every row of the Derived Test Matrix in `husky-pre-push.integration.test.ts` passes for both `.bkit/templates/.husky/pre-push` and `.husky/pre-push`, and the existing suites in that file still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → the gate sees its variables` fails on the gate running without the variable
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `untrusted .envrc → blocked before bkit check, names direnv allow` fails on `bkit check` and the gate running
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no .envrc → no direnv call` fails on a `direnv` call being recorded
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `direnv not on PATH → gates run, no warning` fails on a warning or a missing gate
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `CI set → no direnv call` fails on a `direnv` call being recorded
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `delete-only push through direnv exec → exit 0, no gate` fails on a gate run or a non-zero exit

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Add a `bkit tips` entry for repos whose hook copy predates the direnv block
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: a `pre-push-direnv` tip next to `min-push`, firing when `.husky/pre-push` and `.envrc` exist and the hook does not contain `direnv exec`; its `ask` names the log block of `.bkit/templates/.husky/pre-push` to paste over the copy's own
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the tip fires and stays quiet exactly as the Derived Test Matrix row says, and bkit's own repo does not fire it
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc` fails on the tip not existing

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Document the hook's direnv behaviour
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky: the inner run loads `.envrc` through `direnv exec` and an untrusted folder blocks in seconds; § direnv — `.envrc`: the hook loads it on push, so an agent's shell that never loaded it still pushes with it
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both sections describe the behaviour Task 1 ships, and `bkit install` regenerates `.bkit/templates.md` with the same text
  - **TEST FIRST:** n/a — docs, no behaviour change

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** An unattended workflow whose worktree `.envrc` differs from the main checkout's (the branch edits it, or a dev merge mid-run changes it) does all its build work, then dies at its first push with exit 1, because worktree setup still treats an un-allowed `.envrc` as "never fatal"
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:39` · **Round:** 1
  - **DONE WHEN:** The owner decides where an un-allowed worktree `.envrc` fails: either `bkit worktrees setup` (`.bkit/core/engine/commands/workflow/worktrees.ts` `allowDirenv`) turns a differing / failed `direnv allow` into a fail-early exit or an explicit "push will block" narration, and `.bkit/workflows.md` § Worktree Setup (line 1184, "never fatal") is reworded to match; or the hook downgrades an untrusted `.envrc` inside `.worktrees/*` to a warning. No agent can settle it: the plan mandates the hard block, while the worktree-setup contract in `.bkit/workflows.md` promises the opposite, and only the owner can say which contract wins.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `setup with an .envrc differing from the main checkout's reports that the push will block` fails on setup narrating only "not allowed; read it, then run direnv allow" and exiting 0

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** An agent whose shell was kept free of `.bkit/.env` pushes, and the hook hands the write PAT `BKIT_GH_TOKEN` and every other tooling key to all code the gate runs (agent-authored tests, lint plugins, devDependency code), whose output lands in the agent-readable `tmp/pre-push.log`
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:40` · **Round:** 1
  - **DONE WHEN:** The owner decides, and records in `docs/decisions.jsonl`, which variables the pre-push gate may receive. No agent can settle this, because the plan's goal ("the gate always runs with the repo's `.envrc` variables") conflicts with `docs/security.md` § `.bkit/.env` scope (tooling secrets only, not stack credentials) and § Untrusted Content (give each job the narrowest-scoped token), and with the `Read(./.bkit/.env)` deny in `.claude/settings.json:267`. The options are: (a) accept that the full `.envrc` reaches the gate, and document it in `docs/security.md` as an accepted risk; (b) load only the app env files and `unset` the `BKIT_*` tooling keys in the inner run; or (c) load a dedicated gate env file. The hook copies (`.bkit/templates/.husky/pre-push:40`, `.husky/pre-push:40`) and `.bkit/core/.bkit/templates.md` § Git hooks then match that decision.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → .bkit/.env tooling keys do not reach the gate` fails on the stub `pnpm` recording `BKIT_GH_TOKEN` as set. The test stubs `direnv` to source an `.envrc` that runs `dotenv_if_exists .bkit/.env` over a `.bkit/.env` holding a dummy `BKIT_GH_TOKEN`, as real direnv does; today the hook passes the whole loaded env to `sh "$0"`.

<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 2 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Every push of bkit's own repo fails its gate on a green tree: the hook exports `BKIT_PRE_PUSH_LOGGED=1` to the inner run, vitest inherits it, and the new `process.env.BKIT_PRE_PUSH_LOGGED` short-circuits in `runPostInstallCheck` and the `gh-mcp` tip turn four existing gh-mcp token tests red (reproduced: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run` fails `after/index.test.ts:862`, `tips/catalogue.test.ts:223`, and two `install.integration.test.ts` Scenario 2 / 3 tests)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:105` · **Round:** 2
  - **DONE WHEN:** `vitest.setup.ts` deletes `BKIT_PRE_PUSH_LOGGED` from `process.env` beside the `CI` / `GITHUB_ACTIONS` scrub (tests of the inner-run skip set it with `vi.stubEnv`), so `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/checks/tips/catalogue.test.ts .bkit/core/engine/checks/after/index.test.ts` and `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run .bkit/core/engine/commands/install/install.integration.test.ts` both pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` fails on a `vitest run .bkit/core/engine/checks/tips/catalogue.test.ts -t "inside the pre-push hook"` child spawned with `BKIT_PRE_PUSH_LOGGED=1` in its env exiting non-zero (the setup file does not scrub the variable, so line 223 expects `true` and gets `false`)

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_...` or `BKIT_GH_TOKEN: ghp_...` is exported by direnv's `dotenv_if_exists` and counted as set by bkit's own `detectBlankDotenvKeys`, but the hook's `sed` key extractor matches only `KEY=` with no space, so the write PAT silently reaches the gate and `tmp/pre-push.log` (reproduced: `direnv dotenv bash` exports `A_KEY = spaced` and `B_KEY: colon`; the hook's `sed` returns neither)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:59` · **Round:** 2
  - **DONE WHEN:** The key extractor in `.bkit/templates/.husky/pre-push:59` and `.husky/pre-push:59` names every key direnv's dotenv grammar exports: optional `export `, then the key, then optional spaces and `=`, or `:` (e.g. `[[:space:]]*[=:]` after the key group, POSIX BRE, no `\|`), so `KEY = v`, `KEY: v`, `export KEY=v` and `KEY=v` are all unset before the gate, and `.bkit/core/.bkit/templates.md` § Git hooks — Husky still matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` when `.bkit/.env` holds `BKIT_GH_TOKEN = dummy-write-pat` and `BKIT_OTHER_KEY: dummy-other` and the stub `direnv` exports both, as real direnv does

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A cloud agent session (Claude on the web, Codex Cloud, Cursor Cloud: `BKIT_GH_TOKEN` comes from the dashboard env, and the session has no `.bkit/.env`) pushes, and the gate's tests, lint plugins and devDependency code still receive the write PAT, because the new unset loop only unsets keys that a `.bkit/.env` file in the folder names; the same holds for a tooling key that an app env file, `~/.zshrc` or the launchd env file supplies
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:58` · **Round:** 2
  - **DONE WHEN:** Both hook copies (`.bkit/templates/.husky/pre-push:58`, `.husky/pre-push:58`) also unset the fixed list of bkit tooling keys that `docs/security.md` § `.bkit/.env` scope names (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`), whether `.bkit/.env` exists or not, and whatever path loaded them. The loop over the keys `.bkit/.env` names stays. The `.bkit/core/.bkit/templates.md:293` sentence and the `pre-push-direnv` tip `why` then promise exactly what the hook does.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` instead of `BKIT_GH_TOKEN=unset`. The test writes no `.bkit/.env`, removes `direnv` from `PATH` (the cloud path) and passes `BKIT_GH_TOKEN=dummy-write-pat` in the hook's env; today `[ -f .bkit/.env ]` is false, so nothing is unset.

<!-- bkit:task 8 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Holistic check findings

<!-- bkit:task 9 start -->

- [x] **TASK 9:** The type check of the test files fails on TASK 6's own planned test, so the push gate's typecheck stays red on every push: `const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" }` infers an object type with no `CI` or `GITHUB_ACTIONS` property, and the two `delete` lines after it give TS2339
  - **DONE WHEN:** In `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, the `env` of `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` is typed `NodeJS.ProcessEnv` (`const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };`), with the test's steps and assertions unchanged; `pnpm exec tsc -p tsconfig.test.json --noEmit` reports no error in that file; and the test still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` fails on `pnpm exec tsc -p tsconfig.test.json --noEmit` reporting TS2339 (`Property 'CI' does not exist`, `Property 'GITHUB_ACTIONS' does not exist`) at lines 1523-1524

<!-- bkit:task 9 end -->
<!-- bkit:group 4 end -->
