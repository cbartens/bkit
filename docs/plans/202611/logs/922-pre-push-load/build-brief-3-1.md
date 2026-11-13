# Brief: group 3 — Challenge round 2 findings

Plan: Pre-push: load the repo environment Implementation Plan

## Why and what

### Context & Goals

The pre-push hook's inner, logged run goes through `direnv exec .`, so the gate always runs with the repo's `.envrc` variables, and an untrusted folder blocks in seconds with `direnv allow .`. A `bkit tips` entry tells repos with an older hook copy to paste the new block.

## Where it fits

- Group 1: The pre-push hook loads the repo environment itself — done
  - TASK 1: Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it — done
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the direnv block — done
  - TASK 3: Document the hook's direnv behaviour — done
- Group 2: Challenge round 1 findings — done
  - TASK 4: An unattended workflow whose worktree `.envrc` differs from the main checkout's (the branch edits it, or a dev merge mid-run changes it) does all its build work, then dies at its first push with exit 1, because worktree setup still treats an un-allowed `.envrc` as "never fatal" — done
  - TASK 5: An agent whose shell was kept free of `.bkit/.env` pushes, and the hook hands the write PAT `BKIT_GH_TOKEN` and every other tooling key to all code the gate runs (agent-authored tests, lint plugins, devDependency code), whose output lands in the agent-readable `tmp/pre-push.log` — done
- Group 3: Challenge round 2 findings — this group
  - TASK 6: Every push of bkit's own repo fails its gate on a green tree: the hook exports `BKIT_PRE_PUSH_LOGGED=1` to the inner run, vitest inherits it, and the new `process.env.BKIT_PRE_PUSH_LOGGED` short-circuits in `runPostInstallCheck` and the `gh-mcp` tip turn four existing gh-mcp token tests red (reproduced: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run` fails `after/index.test.ts:862`, `tips/catalogue.test.ts:223`, and two `install.integration.test.ts` Scenario 2 / 3 tests) — open
  - TASK 7: A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_...` or `BKIT_GH_TOKEN: ghp_...` is exported by direnv's `dotenv_if_exists` and counted as set by bkit's own `detectBlankDotenvKeys`, but the hook's `sed` key extractor matches only `KEY=` with no space, so the write PAT silently reaches the gate and `tmp/pre-push.log` (reproduced: `direnv dotenv bash` exports `A_KEY = spaced` and `B_KEY: colon`; the hook's `sed` returns neither) — open
  - TASK 8: A cloud agent session (Claude on the web, Codex Cloud, Cursor Cloud: `BKIT_GH_TOKEN` comes from the dashboard env, and the session has no `.bkit/.env`) pushes, and the gate's tests, lint plugins and devDependency code still receive the write PAT, because the new unset loop only unsets keys that a `.bkit/.env` file in the folder names; the same holds for a tooling key that an app env file, `~/.zshrc` or the launchd env file supplies — open

## The work

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Every push of bkit's own repo fails its gate on a green tree: the hook exports `BKIT_PRE_PUSH_LOGGED=1` to the inner run, vitest inherits it, and the new `process.env.BKIT_PRE_PUSH_LOGGED` short-circuits in `runPostInstallCheck` and the `gh-mcp` tip turn four existing gh-mcp token tests red (reproduced: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run` fails `after/index.test.ts:862`, `tips/catalogue.test.ts:223`, and two `install.integration.test.ts` Scenario 2 / 3 tests)
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:105` · **Round:** 2
  - **DONE WHEN:** `vitest.setup.ts` deletes `BKIT_PRE_PUSH_LOGGED` from `process.env` beside the `CI` / `GITHUB_ACTIONS` scrub (tests of the inner-run skip set it with `vi.stubEnv`), so `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/checks/tips/catalogue.test.ts .bkit/core/engine/checks/after/index.test.ts` and `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run .bkit/core/engine/commands/install/install.integration.test.ts` both pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` fails on a `vitest run .bkit/core/engine/checks/tips/catalogue.test.ts -t "inside the pre-push hook"` child spawned with `BKIT_PRE_PUSH_LOGGED=1` in its env exiting non-zero (the setup file does not scrub the variable, so line 223 expects `true` and gets `false`)
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_...` or `BKIT_GH_TOKEN: ghp_...` is exported by direnv's `dotenv_if_exists` and counted as set by bkit's own `detectBlankDotenvKeys`, but the hook's `sed` key extractor matches only `KEY=` with no space, so the write PAT silently reaches the gate and `tmp/pre-push.log` (reproduced: `direnv dotenv bash` exports `A_KEY = spaced` and `B_KEY: colon`; the hook's `sed` returns neither)
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:59` · **Round:** 2
  - **DONE WHEN:** The key extractor in `.bkit/templates/.husky/pre-push:59` and `.husky/pre-push:59` names every key direnv's dotenv grammar exports: optional `export `, then the key, then optional spaces and `=`, or `:` (e.g. `[[:space:]]*[=:]` after the key group, POSIX BRE, no `\|`), so `KEY = v`, `KEY: v`, `export KEY=v` and `KEY=v` are all unset before the gate, and `.bkit/core/.bkit/templates.md` § Git hooks — Husky still matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` when `.bkit/.env` holds `BKIT_GH_TOKEN = dummy-write-pat` and `BKIT_OTHER_KEY: dummy-other` and the stub `direnv` exports both, as real direnv does
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** A cloud agent session (Claude on the web, Codex Cloud, Cursor Cloud: `BKIT_GH_TOKEN` comes from the dashboard env, and the session has no `.bkit/.env`) pushes, and the gate's tests, lint plugins and devDependency code still receive the write PAT, because the new unset loop only unsets keys that a `.bkit/.env` file in the folder names; the same holds for a tooling key that an app env file, `~/.zshrc` or the launchd env file supplies
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:58` · **Round:** 2
  - **DONE WHEN:** Both hook copies (`.bkit/templates/.husky/pre-push:58`, `.husky/pre-push:58`) also unset the fixed list of bkit tooling keys that `docs/security.md` § `.bkit/.env` scope names (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`), whether `.bkit/.env` exists or not, and whatever path loaded them. The loop over the keys `.bkit/.env` names stays. The `.bkit/core/.bkit/templates.md:293` sentence and the `pre-push-direnv` tip `why` then promise exactly what the hook does.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` instead of `BKIT_GH_TOKEN=unset`. The test writes no `.bkit/.env`, removes `direnv` from `PATH` (the cloud path) and passes `BKIT_GH_TOKEN=dummy-write-pat` in the hook's env; today `[ -f .bkit/.env ]` is false, so nothing is unset.
<!-- bkit:task 8 end -->
