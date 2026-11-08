Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

Verdict basis: partial diff coverage. The supplied diff showed 20 of 168 files, 500 lines each. Every unshown file that touches auth, secrets, sessions or input handling was challenged through `git diff origin/dev...HEAD -- <file>` or read in full: `.bkit/templates/.github/workflows/bkit-cloud.yml` and its adopted copy, `.bkit/core/hooks/preflight-tracker.sh`, both host `bkit-preflight.sh` wrappers, `checks/after/auth.ts`, `install/cloud-env.ts`, `install/modules/cloud.ts`, `commands/workflow/tracker.ts`, `commands/workflow/issues.ts` (plus `fids.ts` for issue-id validation), `.bkit/shared/.bkit/.env.example`, `skills-lock.json`. The earlier round's findings (secret value in the `reason=auth` warning, PR-head bkit deciding the kill switch, `BKIT_OPENAI_API_KEY` in cloud env blocks) are fixed in the current tree and are not re-logged.

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A feat branch (written by any collaborator or by an agent session pushing with `GITHUB_TOKEN`) sets `bkit.cloud.agent` in its `package.json` to a multi-line string; `Select agent job` writes it raw into `$GITHUB_OUTPUT`, so the branch injects `claude=true`, `opencode=true` and `dispatched=claude` and swallows the real lines with a `key<<delim` block, starting every router agent job at once on the same PR
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:225`
  - **DONE WHEN:** `Select agent job` (template `:225` and `:269`, and bkit's adopted copy `.github/workflows/bkit-cloud.yml:225` / `:269`) accepts `bkit.cloud.agent` only when it matches `^(claude|opencode|codex|cursor|none)$`, and otherwise treats it as unrecognised (no router job, the notice prints a fixed placeholder rather than the raw value); its `$GITHUB_OUTPUT` file then always holds exactly the six fixed `agent= / claude= / opencode= / codex= / dispatched= / ignored=` lines. Today `jq -r '.bkit.cloud.agent // empty | strings'` keeps JSON `\n`, and `echo "agent=$AGENT" >> "$GITHUB_OUTPUT"` is the first of the six writes. Reproduced in bash with the agent string `none\nclaude<<E\ntrue\nE\nopencode<<E\ntrue\nE\ndispatched<<E\nclaude\nE\nzz<<dispatched=` and BKIT_ANTHROPIC_API_KEY + BKIT_OPENCODE_API_KEY set: a runner-style parse of the output file gives `claude=true`, `opencode=true`, `dispatched=claude`, so `bkit_gate` skips its `no-agent` refusal and, with `bkit:auto` on the issue, both the claude and opencode jobs start (the multi-agent race that `719-cloud-router-dispatches-recorded-agent-only` removed, and two paid sessions per event). The same raw value reaches `::notice::` lines, so it can also emit arbitrary workflow commands on stdout. `docs/security.md` § CI Auto-Route Trust treats the PR head's `package.json` as data the routing run reads; data must not reach `$GITHUB_OUTPUT` unvalidated.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `a multi-line bkit.cloud.agent cannot inject GITHUB_OUTPUT lines or start a job` fails on the output file holding more than six lines, or a line outside `^(agent|claude|opencode|codex|dispatched|ignored)=`, when `runSelect` (describe `bkit-cloud.yml gate step — per-job credential detection`) records the agent string above with `BKIT_ANTHROPIC_API_KEY` and `BKIT_OPENCODE_API_KEY` set; it also asserts that no `true` value follows a `claude<<` / `opencode<<` line in the file

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A session whose `GITHUB_ISSUE_ID` carries a path (`12/../../../../other-owner/other-repo/issues/5`) makes the GitHub session guard read a different repo's issue that carries `bkit:auto`, so the guard prints PASS for work on an issue that never opted in
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/preflight-tracker.sh:38`
  - **DONE WHEN:** the GitHub branch of the tracker guard accepts `GITHUB_ISSUE_ID` only when it matches `^[0-9]+$` (the same digits-only shape the `feat/([0-9]+)` branch fallback already enforces) and HARD STOPs naming GitHub and the reason otherwise, before the id reaches the `https://api.github.com/repos/${GH_REPO}/issues/${GH_ISSUE}` URL; the rendered copies `.claude/hooks/bkit-preflight.sh:147` and `.cursor/hooks/bkit-preflight.sh:140` match after `bkit upgrade`. Today the value goes into the URL verbatim and curl folds `../` segments, so the bearer `BKIT_GH_TOKEN` read lands on any issue the token can see (no token leaves api.github.com). `.bkit/core/.bkit/README.md:160` says the value is injected from the PR-body `bkit:issue=#NNN` marker, and decision `719-tracker-guard-no-issue-id-not-verified` records that the injection is unverified, so the guard must not trust its shape.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github GITHUB_ISSUE_ID that is not all digits stops the session` (describe `preflight-tracker.sh — GitHub tracker`) fails on exit 0 with `PASS` in the context document when `run(githubIssue("open", ["bkit:auto"]), { GITHUB_ISSUE_ID: "12/../../../../other-owner/other-repo/issues/5" })` runs; it expects exit 1, `HARD STOP` and no `PASS`

<!-- bkit:task 2 end -->

