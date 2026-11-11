Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. The run's diff showed 20 of 383 files. The hidden files that touch permissions, hook registration or input handling were read directly with `git diff origin/dev...HEAD`: the hook sources under `.bkit/core/hooks/`, the host bridges under `.bkit/core/.{claude,cursor,codex,opencode,agents}`, the `.bkit/shared/` registrations, `.bkit/core/engine/install/write.ts`, `.bkit/core/.agents/rules.md`, `.bkit/core/.bkit/install.md`, `skills-lock.json` and `vitest.setup.ts`. The group 5 fixes hold: control characters, backticks and targets over 160 characters become `unresolved-target`, the shell notice quotes each target with `JSON.stringify`, and the `rename|copy` patch line now parses in linear time. Fuzzed 64 KiB patch and shell-script shapes (long `diff --git` lines, `$(` / `${` nesting, many heredocs) each finished in 62 ms or less. The two new skills (`vitest`, `typescript-advanced-types`) are markdown only, with no scripts or embedded directives, and are unpinned like the existing `find-skills` entry.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A dense script source (a planted or minified 64 KiB `.js` / `.py` file the agent runs, or a 250 KiB inline `node -e` / heredoc script) stalls every shell hook call for seconds, because the script analyzers are quadratic and never check the 200 ms deadline
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:1634`
  - **DONE WHEN:** `analyzeJs` and `analyzePython` find a token's position in constant time (for example the tokenizer records each token's index, or `recognized` holds token objects), with no `tokens.indexOf(t)` inside the per-token loops at lines 1436, 1441 and 1634, and the analyzers stop at `evidenceExpired(st)` and report `analysis-limit` like the lexer does. Measured on the current code: a 64 KiB `a;` file run as `node scripts/min.js` takes 593 ms of CPU in the analyzer (3x the 200 ms deadline, 1.5 s wall under load), and the rendered Cursor hook takes 8.2 s of CPU (8.9 s wall) on `node -e '<250 KiB of a;>'` and 4.4 s on `python3 -c '<250 KiB of a.b\n>'`. The cost grows with the square of the source size. `evalItems` checks the deadline only between commands, so one analysis runs unbounded inside the 256 KiB command bound. The deny, ask and secret tiers in `classifyShell` return before the detector runs, so this is a hang on every host, not a bypass. The plan's Security & Privacy section and task 3 promise a cooperative 200 ms deadline.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` fails on `advise("node -e '" + "a;".repeat(125 * 1024) + "'", dir)` taking longer than 1,000 ms to return its advise() result (8.9 s measured), with `permission` `allow`.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** On a shared Linux `/tmp`, another local user pre-creates `bkit-gateguard-<uid>` and plants `<session>.json` as a symlink, and the next shell or edit hook call overwrites the victim's file with warning JSON
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/gateguard-engine.js:211`
  - **DONE WHEN:** `stateDir()` is created with mode `0o700`, and every state read and write first confirms with `lstat` that the folder is a real directory owned by `process.getuid()` with no group or other access; otherwise the call treats state as unavailable and falls back to the in-process set (advisory only, as today). `markWarned` writes through a temporary file opened with `O_CREAT | O_EXCL | O_NOFOLLOW` plus `rename`, so a planted symlink is never followed. Probe on the current code: with `TMPDIR` set to a scratch folder and `stateFile("sess-1")` planted as a symlink to `victim.txt`, `firstTouchAdvice("docs/x.md", "sess-1", false, "/repo")` replaced `victim.txt` with `{"files":{"/repo/docs/x.md":true,"docs/x.md":true}}`. The state code predates this branch, but the branch adds the engine to the Claude, Cursor, Codex and Antigravity shell guardrails hooks, so every shell edit call now writes there, and the files also record edited paths at the default `0644` (`docs/security.md` § PII; `.agents/rules.md` § Data access).
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `never writes warning state through a planted symlink` fails on the engine, loaded with a private `TMPDIR` whose `stateFile(session)` is a symlink to a sentinel file, replacing the sentinel's content with warning JSON after `firstTouchAdvice` runs.

<!-- bkit:task 2 end -->

