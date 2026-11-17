# Brief: group 4 — Holistic check findings

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
- Group 3: Challenge round 2 findings — done
  - TASK 6: Every push of bkit's own repo fails its gate on a green tree: the hook exports `BKIT_PRE_PUSH_LOGGED=1` to the inner run, vitest inherits it, and the new `process.env.BKIT_PRE_PUSH_LOGGED` short-circuits in `runPostInstallCheck` and the `gh-mcp` tip turn four existing gh-mcp token tests red (reproduced: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run` fails `after/index.test.ts:862`, `tips/catalogue.test.ts:223`, and two `install.integration.test.ts` Scenario 2 / 3 tests) — done
  - TASK 7: A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_...` or `BKIT_GH_TOKEN: ghp_...` is exported by direnv's `dotenv_if_exists` and counted as set by bkit's own `detectBlankDotenvKeys`, but the hook's `sed` key extractor matches only `KEY=` with no space, so the write PAT silently reaches the gate and `tmp/pre-push.log` (reproduced: `direnv dotenv bash` exports `A_KEY = spaced` and `B_KEY: colon`; the hook's `sed` returns neither) — done
  - TASK 8: A cloud agent session (Claude on the web, Codex Cloud, Cursor Cloud: `BKIT_GH_TOKEN` comes from the dashboard env, and the session has no `.bkit/.env`) pushes, and the gate's tests, lint plugins and devDependency code still receive the write PAT, because the new unset loop only unsets keys that a `.bkit/.env` file in the folder names; the same holds for a tooling key that an app env file, `~/.zshrc` or the launchd env file supplies — done
- Group 4: Holistic check findings — this group
  - TASK 9: The type check of the test files fails on TASK 6's own planned test, so the push gate's typecheck stays red on every push: `const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" }` infers an object type with no `CI` or `GITHUB_ACTIONS` property, and the two `delete` lines after it give TS2339 — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The type check of the test files fails on TASK 6's own planned test, so the push gate's typecheck stays red on every push: `const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" }` infers an object type with no `CI` or `GITHUB_ACTIONS` property, and the two `delete` lines after it give TS2339
  - **DONE WHEN:** In `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, the `env` of `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` is typed `NodeJS.ProcessEnv` (`const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };`), with the test's steps and assertions unchanged; `pnpm exec tsc -p tsconfig.test.json --noEmit` reports no error in that file; and the test still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` fails on `pnpm exec tsc -p tsconfig.test.json --noEmit` reporting TS2339 (`Property 'CI' does not exist`, `Property 'GITHUB_ACTIONS' does not exist`) at lines 1523-1524

<!-- bkit:task 9 end -->
