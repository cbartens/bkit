Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Every push of bkit's own repo fails its gate on a green tree: the hook exports `BKIT_PRE_PUSH_LOGGED=1` to the inner run, vitest inherits it, and the new `process.env.BKIT_PRE_PUSH_LOGGED` short-circuits in `runPostInstallCheck` and the `gh-mcp` tip turn four existing gh-mcp token tests red (reproduced: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run` fails `after/index.test.ts:862`, `tips/catalogue.test.ts:223`, and two `install.integration.test.ts` Scenario 2 / 3 tests)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:105`
  - **DONE WHEN:** `vitest.setup.ts` deletes `BKIT_PRE_PUSH_LOGGED` from `process.env` beside the `CI` / `GITHUB_ACTIONS` scrub (tests of the inner-run skip set it with `vi.stubEnv`), so `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/checks/tips/catalogue.test.ts .bkit/core/engine/checks/after/index.test.ts` and `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run .bkit/core/engine/commands/install/install.integration.test.ts` both pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` fails on a `vitest run .bkit/core/engine/checks/tips/catalogue.test.ts -t "inside the pre-push hook"` child spawned with `BKIT_PRE_PUSH_LOGGED=1` in its env exiting non-zero (the setup file does not scrub the variable, so line 223 expects `true` and gets `false`)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_...` or `BKIT_GH_TOKEN: ghp_...` is exported by direnv's `dotenv_if_exists` and counted as set by bkit's own `detectBlankDotenvKeys`, but the hook's `sed` key extractor matches only `KEY=` with no space, so the write PAT silently reaches the gate and `tmp/pre-push.log` (reproduced: `direnv dotenv bash` exports `A_KEY = spaced` and `B_KEY: colon`; the hook's `sed` returns neither)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:59`
  - **DONE WHEN:** The key extractor in `.bkit/templates/.husky/pre-push:59` and `.husky/pre-push:59` names every key direnv's dotenv grammar exports: optional `export `, then the key, then optional spaces and `=`, or `:` (e.g. `[[:space:]]*[=:]` after the key group, POSIX BRE, no `\|`), so `KEY = v`, `KEY: v`, `export KEY=v` and `KEY=v` are all unset before the gate, and `.bkit/core/.bkit/templates.md` § Git hooks — Husky still matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` when `.bkit/.env` holds `BKIT_GH_TOKEN = dummy-write-pat` and `BKIT_OTHER_KEY: dummy-other` and the stub `direnv` exports both, as real direnv does

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** On a machine without direnv (most cloud agents) or with `CI` set, worktree setup still narrates that "the pre-push hook will block the first push" for a differing `.envrc`, although the hook skips direnv there and the push goes through, so an unattended agent following `.bkit/workflows.md` § Worktree Setup stops for a human it does not need
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:651`
  - **DONE WHEN:** `allowDirenv` in `.bkit/core/engine/commands/workflow/worktrees.ts` (and the rebuilt `dist/commands/workflow/worktrees.js`) adds the "push will block" warning to the differing-`.envrc` narration only when direnv is on `PATH` and `CI` is unset, matching the hook's own condition; otherwise it narrates the differing file without the block claim. `.bkit/core/.bkit/workflows.md` § Worktree Setup says the same, and `bkit upgrade` re-renders `.bkit/workflows.md`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `setup with a differing .envrc and no direnv on PATH does not claim the push will block` fails on `r.err` containing "push will block" when the stub `direnv` is removed from `PATH`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** On every push, `bkit check` runs after the hook has unset `BKIT_GH_TOKEN`, so `ghAsEngine` falls back to the shell's `GH_TOKEN` or the `gh` keyring and `buildGithubProjectTokenScopeAdvisory` probes the wrong token: a `GH_TOKEN` without the `project` scope prints "Give `BKIT_GH_TOKEN` Projects read & write" into `tmp/pre-push.log` although the PAT is fine, and an agent reading the log rotates a working token. Only the `gh-mcp` advisory got the `BKIT_PRE_PUSH_LOGGED` skip
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/github.ts:358`
  - **DONE WHEN:** `buildGithubProjectTokenScopeAdvisory` returns `null` when `BKIT_PRE_PUSH_LOGGED` is set (beside its `isCloudOrCi()` short-circuit), the same as `detectGhMcpToken`'s call site in `runPostInstallCheck`, and `dist/checks/after/github.js` is rebuilt; no other `bkit check` advisory names `BKIT_GH_TOKEN` while that token is unset on purpose.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/github.test.ts` `token-scope check stays quiet inside the pre-push hook's inner run` fails on `buildGithubProjectTokenScopeAdvisory(tmpDir)?.id` being `github-project-token-scope` with `vi.stubEnv("BKIT_PRE_PUSH_LOGGED", "1")` and `ghAnswers(userResponse("repo, read:org"))`

<!-- bkit:task 4 end -->

