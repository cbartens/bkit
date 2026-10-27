Verdict: CONCERNS
Failures: 0
Note: partial diff coverage — origin/dev...HEAD has 13132 diff lines across 127 files; the 20 largest shown whole. The not-shown-whole files touching input handling (`branches.ts`, `tests.ts`, `challenge.ts`, `plan-blocks.ts`, `registry.ts`, the workflow and prompt sources) were challenged via `git diff origin/dev...HEAD -- <file>`; the rest (mirrors, snapshots, skill docs) stayed out of scope.

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `scan-diff --disabled-tests` reads the working-tree body of each test file named by the diff through `path.resolve(root, rel)` with no containment or symlink check, so a repo test file that is a symlink to an outside file (`~/.aws/credentials`, a consumer's env file) has its content scanned and a declaration-shaped line of the target surfaces as the `test` name in stderr and the emitted `disabled` payload — one line of an arbitrary local file leaking into the sweep's report artifact
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1126`
  - **DONE WHEN:** the `body` read in `disabledTestsIn` resolves the diff path inside the repo root and refuses symlink escapes — the same guard `existsIn` in `ledgers.ts` (this diff) carries (`path.relative(root, abs)` non-`..`, non-absolute), plus `lstat` symlink detection as `worktrees.ts` does — so a symlinked test file's outside target is never opened, while an ordinary in-repo test file still resolves its test name
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --disabled-tests does not follow a symlinked test file out of the repo` fails while the body read follows the symlink and the outside file's line surfaces as the reported test name

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `challenge merge`'s `matrixRows` interpolates a finding's backticked test file and name into the plan's `Derived Test Matrix` row unsanitised (a `|` in either span breaks the row's cells and shifts its `Task` mapping — finding text derived from untrusted diff content), and the merge gate `planProblems` filters plan-check problems to the appended task range only, so the corrupt matrix row inserted near the plan's top is never checked and the broken plan is written
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/challenge.ts:269`
  - **DONE WHEN:** `matrixRows` strips or refuses table-breaking markup (`|`, leading/trailing cell whitespace tricks) from the file and name spans before interpolation — the same sanitisation the no-spans fallback (`entry.replace(/[`|]/g, "")`) already applies — and a row that would break the table refuses the merge with exit 1 naming the finding, never writing a corrupt plan
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `challenge merge refuses a finding whose test name carries a pipe` fails while the merge exits 0 and writes the plan with the corrupt matrix row

<!-- bkit:task 2 end -->
