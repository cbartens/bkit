Verdict: CONCERNS
Failures: 4
Fingerprint: cf8c85f74268b7957cb9582c4fde00584a00e726ffaf799c4dc476994b2ccee8
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-803-close-codex-opencode.md` (6339 lines, full coverage; its first line is not `partial diff coverage`). Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`, Tasks 1-16 (Group 6 closed the round-1 findings).
- The diff is taken against `baseSha` 2d510c666. Between that base and the branch tip sit 17 commits from other features that live on the local `dev` branch (`fa0400fe6` #923 pre-push PR conflict, `a2c12d244` #920 named test files, `d8cee96cf` discovered gotchas, among others). They went through their own runs, so this challenge covers only the #803 surfaces: the Codex hook deny, the key-first `shellSecretRead`, the two `files.ts` detectors and `redactUrlParts`, the record-based strip and review lines in `uninstall.ts`, the OpenCode generator, the allowlist fingerprint (`cloud-env.ts`, `network-allowlist.ts`), the `codex-setup` advisory and the bootstrap template.

## Notes

- Docs read: `.agents/docs.md`, `docs/architecture.md`, `docs/security.md` (both present). Cross-referenced: `.bkit/core/.bkit/cloud.md:151` (no cloud session surfaces a stderr line; Task 2), `cloud.md:98` and `:137` (the setup script runs once and is re-stamped for a new paste; Task 3), the plan's Reuse Inventory row that keeps `renderCloudEnvBlock` unchanged (Task 4), and the plan's Edge Cases rows for the Codex deny (Task 1). No existing plan task, test or `docs/deferrals.jsonl` row covers any of the four.
- Task 1 was checked live. Piping `git rm --cached id_rsa`, `openssl genrsa -out key.pem 2048`, `ssh-keygen -t rsa -f ./id_rsa -N ""` and `git commit -m "id_rsa"` into the rendered `.codex/hooks/bkit-guardrails.cjs` returns `deny` with "this command reads ...". The rendered `.cursor/hooks/bkit-guardrails.cjs` returns `ask` for the same commands.
- Round-1 fixes re-checked live, with no finding: `sudo cat ~/.ssh/id_rsa`, `cat ~/.ssh/id_rsa; gh pr close 1`, `bash -c "cat ~/.ssh/id_rsa"`, `K=$(cat ~/.ssh/id_rsa)` and `bkit tests jump --run x; cat id_rsa` all deny on Codex; `cat ~/.ssh/id_rsa.pub` is allowed; `cat .env` stays advisory. `redactUrlParts` in `files.ts` and in `dist/checks/before/files.js` strips user-info with or without a scheme. The `codex-setup` advisory now carries its check steps inline.
- Checked with no finding: `classifyShell` never returns null when `shellSecretRead` finds a path, so the Codex pre-check cannot be skipped; the hole placeholders in `instructions-sources.ts` match the new `${secret}` deny text; `readJsonFile` never throws, so `detectOpencodeSubstringFetchGrants` is safe on an absent, unreadable or unparseable file; the bootstrap `jq` read is guarded under `set -euo pipefail` and the variable is regex-checked before it is printed; `claudeAllowDerived` is read before `buildDecisionTable`, and `parseBkitVersion` maps a missing record to `[]`; the OpenCode review loop runs on the stripped document, which still holds the legacy keys because the sentinel render no longer generates them.
- Not raised: the comment-only bootstrap match is already deferred (`803-close-codex-opencode-challenge-low-bkit-core-engine-checks-before-files-ts-158`). The `*.pem` deny on `cat certs/server.pem` and `openssl x509 -in cert.p12 -noout` is what the plan's Edge Cases ask for. The same goes for commands that do read key content to use it (`ssh -i ~/.ssh/id_rsa host`, `curl --cacert ca.pem ...`), which the plan treats as reads, so they stay out of Task 1. OpenCode `webfetch` `*{base}*` allows surviving uninstall are kept under decision 551.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A Codex agent runs `git rm --cached id_rsa` to untrack a committed key (or `openssl genrsa -out key.pem 2048`, `ssh-keygen -t rsa -f ./id_rsa -N ""`), and the hook hard-denies it as "this command reads id_rsa", with no way to approve, because the ask-tuned secret detector now drives a Codex deny
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs:73` · **Round:** 1
  - **DONE WHEN:** On the Codex hook, a key-kind path is denied only when the command reads the file's content (the plan's rows keep `deny`: `cat ~/.ssh/id_rsa`, `cat certs/server.pem`, `openssl x509 -in cert.p12 -noout`, `cat .env ~/.ssh/id_rsa`, `sudo cat ~/.ssh/id_rsa`, `git stash drop && cat certs/server.pem`); a key path that is a write destination (`openssl ... -out key.pem` / `-keyout key.pem`, `ssh-keygen -f ./id_rsa`) or only an index or message argument (`git rm --cached id_rsa`, `git commit -m "id_rsa"`) gets the advisory instead of a deny; Cursor and Antigravity verdicts are unchanged. Probed on the rendered `.codex/hooks/bkit-guardrails.cjs` today: all four commands return `permissionDecision: "deny"` with "this command reads ...". Codex cannot prompt, so this deny is final, unlike the Cursor and Antigravity `ask` the shared `shellSecretRead` was tuned for.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex does not deny commands that write or only name a key file` fails on `codexVerdict("git rm --cached id_rsa")`, `codexVerdict("openssl genrsa -out key.pem 2048")` and `codexVerdict('ssh-keygen -t rsa -f ./id_rsa -N ""')` returning `deny`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** An operator re-pastes a stale network allowlist, a Claude cloud session starts, and nobody learns the fingerprints differ, because the bootstrap's WARNING goes only to stderr, which no cloud session surfaces
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh:77` · **Round:** 1
  - **DONE WHEN:** Every fingerprint WARNING branch (unset, not 8-hex, mismatch, expected fingerprint unavailable) also prints one line on stdout, the channel that reaches the session's context (as the `.bkit/.unavailable` notice already does at `:173-174`), so the agent can relay it; the value-hiding rule still holds (a non-8-hex value is never printed); the hook still exits 0; bkit's adopted `.claude/hooks/bkit-cloud-bootstrap.sh` stays byte-identical. Today the block uses `log` (`printf ... >&2`) for every branch, and `.bkit/core/.bkit/cloud.md:151` states that a stderr line is a notice "that no cloud session surfaces". The six bats cases pass only because bats `run` merges stdout and stderr.
  - **TEST FIRST:**
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: the stale-allowlist warning reaches the session context on stdout` fails on the hook's stdout (stderr discarded) holding no WARNING when `BKIT_CLOUD_ALLOWLIST_FINGERPRINT=deadbeef` and `.bkit/allowlist.json` records `abcd1234`
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** An operator follows the Claude paste note and sets `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` "in the setup script", and every session then warns that the variable is not set
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/cloud-env.ts:711` · **Round:** 1
  - **DONE WHEN:** The `renderCloudNetworkAllowlist` note names only the environment's **Environment variables** field as the place to set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, matching `.bkit/core/.bkit/cloud.md` § Network access step 4. Today it offers "(or the setup script)", but the setup script runs once as root and is snapshotted (`cloud.md:98`), so an `export` there never reaches the SessionStart hook's environment, and `bkit upgrade` re-stamps the generated script for a fresh paste (`cloud.md:137`), which drops a hand-added line.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/cloud-env.test.ts` `renderCloudNetworkAllowlist names only the environment variables as the place to set BKIT_CLOUD_ALLOWLIST_FINGERPRINT` fails on the output containing `or the setup script`
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** An operator rotates `BKIT_GH_TOKEN` by re-pasting § 4 of `.claude/bkit-cloud.md` into the Environment variables field, the hand-added `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` line is wiped, and the fingerprint compare silently stops matching
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/cloud-env.ts:877` · **Round:** 1
  - **DONE WHEN:** The owner decides whether the Claude § 4 environment-variables block (`writeClaudeCloudDoc`, `@@CLOUD_ENV_VARS@@`) carries `BKIT_CLOUD_ALLOWLIST_FINGERPRINT=<fingerprint>` so a re-paste keeps it, or whether the § 2 note and `cloud.md` § Network access tell the operator to re-add the line after every § 4 paste. No agent can settle it, because the plan decided `renderCloudEnvBlock` stays unchanged (it is shared with the Cursor and Codex docs), and changing that is a plan change. Today the variable lives only in the § 2 prose, while § 4 is the block bkit tells operators to paste whole.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/cloud-env.test.ts` `the Claude environment-variables block keeps BKIT_CLOUD_ALLOWLIST_FINGERPRINT across a re-paste` fails on the rendered `.claude/bkit-cloud.md` § 4 `dotenv` block lacking a `BKIT_CLOUD_ALLOWLIST_FINGERPRINT=` line
<!-- bkit:task 4 end -->
