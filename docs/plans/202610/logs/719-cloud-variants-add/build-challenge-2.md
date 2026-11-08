Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

Verdict basis: partial diff coverage. The supplied diff showed 20 of 164 files; every unshown file touching auth, secrets, sessions or input handling (`.bkit/core/hooks/preflight-tracker.sh`, both host `bkit-preflight.sh` wrappers, `.bkit/templates/.github/workflows/bkit-cloud.yml` and its adopted copy, `checks/after/auth.ts`, `checks/after/github.ts`, `install/modules/cloud.ts`, `commands/install/install.ts`, `commands/workflow/tracker.ts`, `commands/workflow/issues.ts`, `.bkit/shared/.bkit/.env.example`, `skills-lock.json`) was read through `git diff origin/dev...HEAD -- <file>` or in full.

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A tracker read refused with `reason=auth` while the tracker secret is set prints the secret's value into the run log and the `::warning::` annotation
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:449`
  - **DONE WHEN:** the `reason=auth` warning in `bkit_gate` (template `:449` and bkit's adopted copy `.github/workflows/bkit-cloud.yml:449`) names the secret and states only `set but rejected` or `empty or missing`; no expansion of `${!secret_var}` can emit the secret's value (e.g. `if [ -n "${!secret_var:-}" ]; then state="set but rejected"; else state="empty or missing"; fi`). Today `${!secret_var:+set but rejected}${!secret_var:-empty or missing}` expands the second half to the value when the variable is set (checked in bash: prints `set but rejectedsupersecretvalue`), so for `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` or `GH_TOKEN` the only barrier is GitHub's log masking, which does not apply on `act`, self-hosted log shipping or the vitest harness. This breaks `.agents/rules.md` **Secrets in output** and the plan's Security & Privacy promise "annotations carry `reason` + secret **names**, never values".
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret and never prints its value` fails on stdout containing the sentinel value `jira-secret-sentinel` (featRun with `STUB_FETCH_EXIT: "80"`, `STUB_FETCH_OUT: {"reason":"auth"}`, `BKIT_JIRA_API_KEY: "jira-secret-sentinel"`, tracker `jira`; expects `BKIT_JIRA_API_KEY` and `set but rejected` in stdout and `jira-secret-sentinel` absent from stdout and the summary)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A feat branch pushed by a steered agent session ships its own `bkit` (package.json / lockfile / committed `node_modules/.bin/bkit`), which the context job then runs to decide the `bkit:auto` kill switch, so the agent can keep itself dispatched after the human removes the label
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:172`
  - **DONE WHEN:** the owner decides where the kill switch's code comes from, and the router and `docs/security.md` § CI Auto-Route Trust match that decision. Today the feat arm checks out `workflow_run.head_branch` (`:172`), runs `pnpm install --frozen-lockfile --ignore-scripts` from that head's lockfile (`:194`), then executes `node_modules/.bin/bkit fids parse` / `issues fetch` (`:581`, `:439`) inside a `contents: write` job whose step env holds `GH_TOKEN`, `BKIT_LINEAR_API_KEY` and `BKIT_JIRA_API_KEY`. Before this diff the gate was `gh issue view` on a `dev` checkout, which the branch could not change. `docs/security.md` justifies the new steering with "the same collaborator can edit the workflow file", but the codex and opencode jobs push with `GITHUB_TOKEN`, which GitHub refuses to let edit `.github/workflows/*`, while it can edit `package.json`, `pnpm-lock.yaml` and `.bkit/issues.jsonl`. No agent can settle this because it reverses an owner-confirmed plan row (Breaking Changes: "`feat/**` context job checks out the PR head") and the existing `workflow-templates.integration.test.ts` case that pins that ref. The owner chooses one of: (a) install and run `bkit` from a `dev` checkout and read only data (marker, branch, `.bkit/issues.jsonl`) from the PR head; (b) keep the PR-head `bkit` and record in § CI Auto-Route Trust that an agent session writing the branch can defeat the kill switch for that branch.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context job installs and runs bkit from dev, never from the feat/** PR head` fails on the context job's `Install bkit` step running in a checkout whose `ref` resolves to `github.event.workflow_run.head_branch`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A consumer who fills the new `BKIT_OPENAI_API_KEY` row in `.bkit/.env` gets that paid OpenAI key pasted into every generated cloud env block (`.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md`, `.codex/bkit-cloud.md`), so every cloud agent session that reads untrusted issue / PR text holds it
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/shared/.bkit/.env.example:88`
  - **DONE WHEN:** the owner settles the plan's open Suggested Scope Expansion row ("`BKIT_OPENAI_API_KEY` reaches every generated cloud env block … Owner security decision"), which no plan task builds, and the code matches it. The key is used only by the `codex` router job as a repo Actions secret. `.bkit/core/engine/install/cloud-env.ts:35-39` (`SESSION_HIJACK_KEYS`) drops only the three Anthropic keys and pastes every other resolved `.envrc` key. No agent can settle this because `cloud-env.test.ts` `drops exactly the three documented session-hijack keys` and `docs/security.md` § Secrets Management pin the current list. The owner chooses one of: (a) drop `BKIT_OPENAI_API_KEY` from the paste block (add it to the drop list, or a new router-only list) and update that test and § Secrets Management; (b) remove the row from `.env.example`, because the key belongs only in repo secrets; (c) keep the paste and record why in § Credential surfaces.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/cloud-env.test.ts` `never lets BKIT_OPENAI_API_KEY into the paste block` fails on `renderCloudEnvBlock(resolveCloudEnvVars(tmpDir))` containing `BKIT_OPENAI_API_KEY` and the sentinel value `sk-openai-must-not-leak` when `.bkit/.env` sets it

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A Cursor background session in a repo whose `bkit.tracker.default` holds a value the guard does not recognise (e.g. `GitHub`, `Jira`, `gitlab`) skips the `bkit:auto` check with exit 0 and writes no context line, so an unlabelled or finished issue runs unchecked
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/preflight-tracker.sh:189`
  - **DONE WHEN:** the `*)` arm of the tracker `case` in `.bkit/core/hooks/preflight-tracker.sh` stops the session through `bkit_guard_fail`-style output naming the unsupported `bkit.tracker.default` value (HARD STOP, exit 1). The header's own contract says "any unreadable answer is a HARD STOP", and today `*) exit 0` fails open with no context line. The rendered `.claude/hooks/bkit-preflight.sh` and `.cursor/hooks/bkit-preflight.sh` are regenerated.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `unrecognised bkit.tracker.default in a Cursor background session stops the session naming the value` fails on exit 0 or on stdout without `Guard pre-check: FAIL` and the value `gitlab` (Cursor hook, `runPreflight` with `cwd: fixtureRepo("gitlab")` and stdin `{"is_background_agent": true}`)

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** A session whose `GITHUB_ISSUE_ID` holds a path such as `1/../../../../repos/other-owner/other-repo/issues/5` makes the GitHub guard read an issue in another repo, so a labelled, open issue elsewhere passes the guard
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/preflight-tracker.sh:38`
  - **DONE WHEN:** the GitHub arm of `.bkit/core/hooks/preflight-tracker.sh` accepts `GITHUB_ISSUE_ID` only when it matches `^[0-9]+$`, and HARD STOPs naming the variable otherwise, before the value reaches the `curl` URL `https://api.github.com/repos/${GH_REPO}/issues/${GH_ISSUE}` (`:61`). curl collapses the `../` segments, so today the request goes to another repo's issue. The Jira arm already asserts its key shape (`:138`). The rendered host hooks are regenerated.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `non-numeric GITHUB_ISSUE_ID stops the session before any GitHub request` fails on exit 0 or a `Guard pre-check: PASS` line when `GITHUB_ISSUE_ID` is `1/../../../../repos/other/repo/issues/5` (Claude hook, `fixtureRepo("github")`, `BKIT_GH_TOKEN` set, `curlStub(githubIssue("open", ["bkit:auto"]))` on `PATH`); expects exit 1 and `GITHUB_ISSUE_ID` named in stdout

<!-- bkit:task 5 end -->
