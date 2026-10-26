Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The opencode plugin consumes the once-per-session advisory token before it knows it can deliver it, so a first tool call whose result is missing (or not `completed`) loses the advisory for the whole session
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.opencode/plugin/bkit-rules.js:63`
  - **DONE WHEN:** both drivers check the delivery shape _before_ calling `rulesReadAdviceOnce()` — V2 `if (!event || event.status !== "completed" || !event.result) return;` and V1 `if (!output || typeof output !== "object") return;` ahead of the consume — so a call that cannot carry the advisory leaves the session token unconsumed and the next call delivers it, exactly as `bkit-gateguard.js` (`bkitGateGuardAfterV2`/`…V1`) and `bkit-readguard.js` (`bkitReadGuardAfterV2`/`…V1`) already do.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `opencode plugin keeps the advisory for the next call when the first result is missing` fails on the finding — today the first `execute.after` event with no `event.result` returns `""` **and** consumes the token, so the second (well-formed) call also returns `""`; the test asserts the second call carries `.agents/rules.md`.
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the 1.x driver keeps the advisory when the first output is not an object` fails on the finding — the V1 hook with a non-object `output` consumes the token and never appends it.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The exit-8 rollback removes the appended step row from the working tree but leaves it staged in the index, so "nothing written, nothing committed" is false and a later pathspec-less commit commits the row
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:470`
  - **DONE WHEN:** the `rec === null` branch's rollback (the `addAllButCopied(cwd)` + `runGit(cwd, ["commit", "--allow-empty", …])` path at `steps.ts:493-499`, whose failure calls `rollback()` at `:496`) also restores the index entry it staged, so after an exit-8 the index matches the rolled-back working tree and no later commit can carry the row. Verified reproduction: `git add -A` then a pre-commit hook that exits 1 leaves `status.jsonl` staged; removing the working-tree file leaves `git status --porcelain` reporting `AD status.jsonl` and a pathspec-less `git commit` still commits the row. The `rec !== null` branch is already safe — `commitOwnSet` unstages on failure (`ledgers.ts:613-620`) — so only the worktree path needs the unstage.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failed commit leaves no row staged in the index` fails on the finding — after the exit-8 path (`reports a failed commit with exit 8 without writing the row`, whose pre-commit hook exits 1) the test asserts `git(cwd, ["diff", "--cached", "--name-only"])` does **not** list the `status.jsonl` row.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** The hand-rolled JSON escaper leaves every control character except `\n`, `\r`, `\t` raw, so a context carrying one yields an unparseable SessionStart document that the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.claude/hooks/bkit-preflight.sh:46` (twin `.bkit/core/.cursor/hooks/bkit-preflight.sh:44`)
  - **DONE WHEN:** `bkit_write_document` emits a document that parses for any byte the accumulated context can hold — the full U+0000–U+001F range is escaped (or the writer routes through a JSON encoder when one is on PATH, keeping the `printf` path as the no-`python3` fallback) — and a test feeds a context containing a control character and asserts `JSON.parse` succeeds. Reproduction: `bkit_json_escape` on `"advisory\nGuard: FAIL \x0b HARD STOP"` emits the `\x0b` raw and `JSON.parse` rejects the document ("Bad control character in string literal"). `LINEAR_ISSUE_ID` (env) and the Linear API's label names reach the context verbatim, and the diff's own knowledge row `kn-hooks-sessionstart-stdout-is-one-json-document` records that a rejected document drops the advisory _and_ the guard output with a zero exit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a context carrying a control character still writes one parseable JSON document` fails on the finding — with `LINEAR_ISSUE_ID` set to a value containing `\x0b`, `JSON.parse(result.stdout)` (the file's `emittedContext` helper) throws instead of yielding the guard text.

<!-- bkit:task 3 end -->
