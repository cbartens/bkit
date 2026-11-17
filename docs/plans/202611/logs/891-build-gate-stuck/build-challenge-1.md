Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Partial diff coverage: the diff file showed 20 of 85 files (500 lines each); findings are limited to the shown content (`tests-base.ts`, `tests-base.integration.test.ts`, `decisions.test.ts`, `dist/commands/workflow/tests-base.js`), read against the current helpers they call.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A failing case that is skipped at the base commit (an `it.skipIf` on an env var or a gitignored artefact the fresh checkout lacks) reads `pass`, so the verdict is `none` and the pause says "the failures come from this branch" with no evidence either way
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:287`
  - **DONE WHEN:** A base case whose JUnit state is `skipped` reads `atBase: "unknown"`, never `pass`, as decision `891-base-commit-check-at-the-decision-pause` states ("a case passing or absent at base ... is the branch's; anything else is undetermined"); only state `passed` reads `pass`; with no base-red case the verdict is `unknown` with a reason naming the skipped case count.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a case skipped at the base commit reads unknown, not the branch's` fails on verdict `none` with `atBase: "pass"` when the base commit's runner writes `<testcase name="x"><skipped/></testcase>` for the gate's failing case `x` (expected verdict `unknown`, `atBase: "unknown"`, `branch` 0)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** With one case red at base and the rest undetermined (their base file run crashed, or no file resolved), the verdict is `some` with reason null, so the pause says "a round can fix 4 of 5" for 4 cases nothing is known about, and the crash reason that Task 17 added is dropped
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:92`
  - **DONE WHEN:** `baseVerdict` returns `some` with a reason naming the undetermined count whenever `undetermined` > 0, the verb keeps its crash / no-report / unresolved reason for `some` as it does for `unknown`, and `decisions compose --base-check` (`readBaseCheck` and the `some` branch in `.bkit/core/engine/commands/workflow/decisions.ts`) reads `branch` and words the split as "a round can fix {branch} of {failing}; the build will still stop on the {baseRed} from `dev`", adding "{undetermined} could not be checked: {reason}" when undetermined > 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > some with an undetermined case names it in the reason` fails on `reason` being null for cases `[red, pass, unknown]` (expected verdict `some` and a reason naming 1 undetermined case)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > base check some with undetermined cases counts only the branch's as fixable` fails on the reason reading "a round can fix 2 of 3" for `{verdict: "some", failing: 3, baseRed: 1, branch: 1, undetermined: 1}` (expected "a round can fix 1 of 3" and a sentence naming the 1 case that could not be checked)

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A file holding two cases with the same name (an `it.each` title without a placeholder, or the same title in two `describe` blocks a runner does not prefix) matches the first one at base, so a case that fails at base reads `pass` (verdict `none`), or a case that passes at base reads `red` (a false `all` that recommends `Stop` and tells the owner to fix a healthy `dev`)
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:278`
  - **DONE WHEN:** The base case is matched by name among the base report's cases of the same file, and a name that occurs more than once in that file's base report with differing states reads `atBase: "unknown"`; a unique name, or duplicates that all share one state, read as today.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a case name repeated at base with differing results reads unknown` fails on verdict `none` with `atBase: "pass"` when the base commit's runner writes `<testcase name="x"/>` then `<testcase name="x"><failure message="boom"/></testcase>` for `tests/a.test.ts` and the gate's failing case is `x` (expected verdict `unknown`, `atBase: "unknown"`)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A `worktreeCopy` entry that `fs.cpSync` cannot copy (a FIFO or socket at `.env`, an unreadable file) throws out of `baseRun`, so `tests base` exits non-zero and the build takes the Failure Path instead of pausing with verdict `unknown`, breaking the verb's "exit 0 for every verdict" contract
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:241`
  - **DONE WHEN:** An error thrown by `copyListed`, `install` or `runTestFile` inside `baseRun` becomes verdict `unknown` with a reason naming the failed step and the error message (for example `base checkout copy failed: {message}`), the verb exits 0, and `withCleanup` still removes the detached checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a worktreeCopy entry that cannot be copied reads unknown` fails on `testsBase` rejecting with `ERR_FS_CP_FIFO_PIPE` (no exit 0, no output JSON) when `.env` in the checkout is a FIFO made with `mkfifo` (expected exit 0, verdict `unknown`, a reason naming the copy, and one registered worktree after the run)

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** A branch that breaks a shared setup file makes every test file fail, and `tests base` then re-runs every one of them at the base commit, one process at a time with no file cap and no timeout, so the Decision Pause waits for a serial re-run of the whole suite (or forever on a test that hangs in the fresh checkout)
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-base.ts:252`
  - **DONE WHEN:** `tests-base.ts` exports a cap on the distinct failing files it re-runs at base (a named constant); when the resolved files exceed it, the verb returns verdict `unknown` with reason `too many failing files to re-run at the base commit ({n} > {cap})` before any checkout or install, and below the cap it runs as today.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > more failing files than the base-run cap reads unknown without a base run` fails on the verb installing and running each file (one install run, verdict `all`) when the gate report names cap + 1 failing files that are all red at base (expected verdict `unknown`, a reason naming the cap, no install run, one registered worktree)

<!-- bkit:task 5 end -->
