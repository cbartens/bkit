Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A cloud agent session (Claude on the web, Codex Cloud, Cursor Cloud: `BKIT_GH_TOKEN` comes from the dashboard env, and the session has no `.bkit/.env`) pushes, and the gate's tests, lint plugins and devDependency code still receive the write PAT, because the new unset loop only unsets keys that a `.bkit/.env` file in the folder names; the same holds for a tooling key that an app env file, `~/.zshrc` or the launchd env file supplies
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:58`
  - **DONE WHEN:** Both hook copies (`.bkit/templates/.husky/pre-push:58`, `.husky/pre-push:58`) also unset the fixed list of bkit tooling keys that `docs/security.md` § `.bkit/.env` scope names (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`), whether `.bkit/.env` exists or not, and whatever path loaded them. The loop over the keys `.bkit/.env` names stays. The `.bkit/core/.bkit/templates.md:293` sentence and the `pre-push-direnv` tip `why` then promise exactly what the hook does.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it` fails on the stub `pnpm` recording `BKIT_GH_TOKEN=dummy-write-pat` instead of `BKIT_GH_TOKEN=unset`. The test writes no `.bkit/.env`, removes `direnv` from `PATH` (the cloud path) and passes `BKIT_GH_TOKEN=dummy-write-pat` in the hook's env; today `[ -f .bkit/.env ]` is false, so nothing is unset.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A `.bkit/.env` line written `BKIT_GH_TOKEN = ghp_…` or `BKIT_GH_TOKEN: ghp_…` is loaded by direnv's `dotenv` parser (verified with `direnv dotenv bash` on direnv 2.38.2: spaces around `=` and the `KEY: value` form both export), but the hook's `sed` key list skips it, so that token reaches the gate and its `tmp/pre-push.log`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:59`
  - **DONE WHEN:** The key-name extraction in both hook copies (`.bkit/templates/.husky/pre-push:59`, `.husky/pre-push:59`) matches every line form direnv's dotenv parser exports: optional `export`, optional whitespace around `=`, and `KEY:` followed by whitespace. Every key direnv loads from `.bkit/.env` is then unset for the gate.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → .bkit/.env keys written "KEY = value" or "KEY: value" do not reach the gate` fails on the stub `pnpm` recording the dummy values. The test writes `.bkit/.env` with `BKIT_GH_TOKEN = dummy-write-pat` and `BKIT_OTHER_KEY: dummy-other`, and the stub `direnv` exports both keys as real direnv does; today the `sed` pattern requires `KEY=` with no space, so neither key is unset.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A pulled or branch-edited `.envrc` (tracked, so any commit can change it) makes direnv block it, and the hook's only fix line tells the pushing agent to run `direnv allow .`. Following it approves unreviewed shell code that then runs on every later push and every `cd`; the docs frame the allow as a once-per-folder chore, not a review of changed content
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:42`
  - **DONE WHEN:** The block message in both hook copies (`.bkit/templates/.husky/pre-push:42`, `.husky/pre-push:42`) and the `.bkit/core/.bkit/templates.md:445` bullet tell the reader to review the `.envrc` change first (`git log -p -- .envrc`) and to allow it only when the content is expected, and tell an agent to stop and ask the owner rather than run `direnv allow .` itself.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `untrusted .envrc → the fix line asks for a review of the .envrc change before direnv allow` fails on stderr carrying only "run `direnv allow .` in this folder, then push again" with no review step

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** The install-skills commit wipes the integrity hash of the universal `find-skills` skill (`computedHash: ""`), so a tampered `find-skills` body (a skill that tells agents to run `npx skills add`) no longer differs from the lock, and the lock fails `.agents/skills.md` § Install / Update
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `skills-lock.json:29`
  - **DONE WHEN:** `skills-lock.json` `skills["find-skills"].computedHash` is nonempty again, regenerated by the skills CLI for the unchanged `.agents/skills/find-skills` content, and every entry in the lock has a nonempty `computedHash`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/skills-lock.test.ts` `every skills-lock.json entry carries a nonempty computedHash` fails on `find-skills` having `computedHash: ""`

<!-- bkit:task 4 end -->
