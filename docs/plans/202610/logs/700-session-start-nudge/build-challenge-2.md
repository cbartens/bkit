Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

- [challenge-2] diff fully read (7076 lines, ~100 files): 5 new advisory hooks + 2 rewritten preflight hooks + engine changes (branches/worktrees/steps/context) + install wiring + 2 vendored skills. Verifying: preflight-linear guard content, git() spawn helper, temp-dir patterns, skill-body directives.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `bkit_json_escape` passes C0 control chars (e.g. `\x0b` `\x0c` `\x08`) through unescaped, so a Linear-API-derived label name carrying one makes the single SessionStart JSON document unparseable — the host silently discards it, and a cloud session loses both the advisory and the Linear guard's HARD STOP text (the pre-change `python3 json.dumps` path escaped everything; the model-facing channel is the only one the guard has, per the hook's own "exit code is informational only" contract)
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.claude/hooks/bkit-preflight.sh:46`
  - **DONE WHEN:** every byte U+0000–U+001F in an `emit_context` string is escaped (or the document is re-encoded through a real JSON encoder on the guard path), so a guard message containing any control character still yields one stdout document that parses as JSON; the mirrored `bkit_json_escape` in `.bkit/core/.cursor/hooks/bkit-preflight.sh:44` matches; the Linear guard's HARD STOP reaches the model whatever a label name holds.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a Linear label carrying a control character still yields one valid JSON document` fails on stdout that fails `JSON.parse` when the stubbed Linear API returns a label name containing `\x0c`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** the Antigravity `bkit-rules.cjs` matcher adds `run_command`, so `adviseOnce` now persists the first call's full tool args — a complete shell command line, secrets included if the agent put one on it — in cleartext at `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` (default 0644, world-readable on multi-user hosts), with no TTL and no removal unless the identical call is retried; the pre-existing GateGuard registered edit tools only (file paths), so this diff widens the at-rest exposure from paths to command lines
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/antigravity-hook.js:63`
  - **DONE WHEN:** the retry state no longer stores the raw call signature — `adviseOnce` writes a one-way hash (e.g. SHA-256 of the signature) and compares hashes instead, so no tool argument of any host hook ever rests on disk in cleartext; deny-once retry behaviour is unchanged on all three Antigravity hooks.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `antigravity retry state never persists tool args in cleartext` fails on a marker string from a `run_command` payload's `CommandLine` appearing in a file under `os.tmpdir()/bkit-antigravity-retry/` after the hook denies the first call

<!-- bkit:task 2 end -->

- [challenge-2] verified: `git()`/`runGit` use `spawnSync` array args (no shell interpolation); hook registration commands are constant strings; advisory text is a static constant with no interpolation; state-file session ids are allowlist-sanitized (`[a-zA-Z0-9_-]`, 128 cap) so no path traversal; the OS-temp advisory state pattern (dir 0755 / file 0644, `{"at":ts}` content) is byte-identical to the pre-existing readguard/gateguard engines — accepted pattern, not flagged; steps.ts rollback guards concurrent appends via `endsWith(line)`. Vendored skills (`hook-development`, `bash-defensive-patterns`, hash-pinned in skills-lock.json) scanned for embedded directives aimed at the agent — none found; their example scripts are defensive linters/validators; insecure teaching snippets in `references/advanced.md` are marked examples, not directives, and ship no execution path.
