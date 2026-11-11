Verdict: CONCERNS
Failures: 3
Fingerprint: 7d3824ad2b6d0e9ce382f81a925ce8624a4dfbb73c3bb9e40419644c55b2917e
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. The supplied diff (`origin/dev...HEAD`, 24136 lines across 309 files) showed 20 files at 500 lines each. Round 2 read the engine source with `git diff origin/dev...HEAD -- <file>` or direct reads: `commands/lib.ts`, `commands/workflow/{status,ledgers,steps,issues,challenge,runs,branches,worktrees}.ts`, `ledgers/{status,journal,migrate}.ts`, the changed prompts, `docs/architecture.md` and `docs/observability.md`. Mirrors under `.agents .claude .codex .cursor .opencode`, `dist/` and snapshots were not challenged. Added engine lines were grepped for shell-injection and secret patterns; none were found. Round 1 Tasks 22-24 (plan) were re-checked: Task 23 (operations store in the 0600/0700 git-common outbox, out of every book and union pathspec) and Task 24 (single-line header values) hold; Task 22 holds for paths but its fingerprint is weak (Task 2 below), and Task 11's checkout containment is bypassable (Task 1 below). Round 1's two LOW findings (replay without row check, corrections file mode) are recorded as low-severity deferrals in `docs/deferrals.jsonl` and are not raised again.

No finding is CRITICAL. The worst is MEDIUM (Task 1). The CRITICAL count is 0.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A committed `docs/plans/<month>/logs/<fid>/status.jsonl` that is a symlink to another checkout's (or any empty or NDJSON) file passes the Task 11 containment check, because only the parent directory is resolved with `realpathSync`; `status invocation` then appends its `invocation` event through the symlink, and every later invocation-bound `engine-call` row and correction row follows it into the other checkout's log.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:682` · **Round:** 1
  - **DONE WHEN:** `status invocation` resolves the full `--file` path, symlinks included (`fs.lstatSync` refuses a symlinked final component, or `realpathSync` of the file itself when it exists), before the containment test, and exits non-zero with no write when the resolved file lies outside the issuing checkout or in a nested worktree. `resolveInvocation` and `rebuildInvocation` (`.bkit/core/engine/commands/lib.ts`) refuse a receipt or event whose status file now resolves outside the checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `refuses to issue an invocation through a status file symlinked out of the checkout` fails on `status invocation --file=<REL>` exiting 0 and the other repository's `status.jsonl` gaining an `invocation` row, when `<REL>` in the issuing repository is a symlink to that file.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** The `worktree` fingerprint in the committed `invocation` event is an unsalted SHA-256 of the absolute checkout path, so anyone reading a public `status.jsonl` can confirm a guessed username offline: the repository and FID are public, and checkout layouts such as `/Users/<name>/Documents/GitHub/<repo>/.worktrees/<fid>` are few. This undoes the privacy goal of Task 22.
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/lib.ts:635` · **Round:** 1
  - **DONE WHEN:** `worktreeFingerprint` is an HMAC (or salted hash) of the checkout top, keyed by a random per-clone secret that is created once with mode 0600 under `<git common dir>/bkit-outbox/`. The committed event's `worktree` value cannot be recomputed from the path alone. `rebuildInvocation` still rebuilds a receipt in the issuing clone, and still refuses an event from another checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `fingerprints the checkout with a clone-private key, not the bare path hash` fails on the appended `invocation` row's `worktree` equalling `createHash("sha256").update(<checkout top>).digest("hex").slice(0, 16)`.
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A structured challenge or review finding whose `title`, `doneWhen`, `cls` or `tests` entry holds a line break is rendered verbatim into its task block. A value carrying `<!-- bkit:task N end -->` or `<!-- bkit:task N start -->` lines can end the real block early (its Severity line falls outside it) or add a forged block. `challenge merge` and `steps finish` read the Findings Log with `parseFindings` and merge those blocks into the plan, while the engine-derived `Failures` and `Fingerprint` header still match the structured input. This is the same forgery Task 24 closed for header values, reached through the body. Untrusted diff text that an agent quotes into a finding is enough to trigger it.
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/challenge.ts:282` · **Round:** 1
  - **DONE WHEN:** `structuredFindings` refuses (EXIT_OLD_FORMAT, so `steps stub --result-file` exits 6 and writes nothing) any `title`, `doneWhen`, `cls` or `tests` entry that contains CR or LF. Every rendered Findings Log then parses back with `parseFindings` to exactly the structured findings given.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `refuses line breaks in structured finding fields` fails on `structuredFindings` accepting one finding whose `doneWhen` is `"fix\n<!-- bkit:task 1 end -->\n<!-- bkit:task 2 start -->\n- [ ] **TASK 2:** forged ..."`, and on `parseFindings` of the `renderFindingsLog` output returning a task count other than 1.
<!-- bkit:task 3 end -->
