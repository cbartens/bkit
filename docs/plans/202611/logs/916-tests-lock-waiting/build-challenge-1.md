Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A Codex agent chains another ask-tier command before `bkit tests jump` (`gh pr close 999999; bkit tests jump build-1`), so the hook sees only the first ask match, turns it into an advisory, and the jump runs with no human approval
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-tiers.js:291`
  - **DONE WHEN:** under the Codex hook, `classifyShell` denies any command whose text matches the jump pattern, whatever other ask-tier pattern (git ask rules, `sudo`, `brew install`, `gh pr close`, package publish) matches first, for example by testing the jump pattern on its own before `askRule`'s first-hit result is used; Cursor and Antigravity still ask for those compound commands; the rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` are re-rendered. Reproduced on this diff: piping `{"tool_name":"Bash","tool_input":{"command":"gh pr close 999999; bkit tests jump build-1"}}` into `node .codex/hooks/bkit-guardrails.cjs` returns `additionalContext` "(gh pr close) ran without confirmation" instead of `permissionDecision: "deny"`; the same holds for `sudo -n true; bkit tests jump build-1`. The cause is `askRule` (`guardrails-tiers.js:191-199`), which returns the first ASK_PATTERNS hit, and the jump pattern sits last in the array.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump chained after another ask-tier command` fails on `codexVerdict("gh pr close 999999; bkit tests jump build-1")` and `codexVerdict("sudo -n true; bkit tests jump build-1")` returning "ask" instead of "deny"

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The human approves `bkit tests jump build-1` for a run that gave up more than 120 s ago, and the verb exits 0 saying the run moves to the front, although its held place has expired and nothing is waiting
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-jump.ts:34`
  - **DONE WHEN:** `linesFor` skips a `.held` entry whose mtime is more than 120 s old, the same cut-off the helper's scan uses (`time - $mtime > 120` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`), so a jump naming only an expired held place exits 1 with "no run named <run> waits for tests" and writes no marker, as the plan's edge case "names a run that no waiting ticket or held place carries" requires; a held place under 120 s old still matches. The marker the verb writes today lingers until some other take scans the queue; when the next contended take is that same run, it jumps the line on a stale approval.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-jump.test.ts` `refuses a run whose only held place is older than 120 s` fails on the verb exiting 0 and writing a `.jump` marker for a planted `1.000001-11.held` holding `build-1 — /co/a` whose mtime `fs.utimesSync` set 300 s in the past

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A regular file sits at `tests.queue` (the same blocked path that makes `run` exit 73), and `bkit tests jump build-1` crashes with "Unhandled error: ENOTDIR: not a directory, scandir …" instead of refusing with "no run named build-1 waits for tests"
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-jump.ts:30`
  - **DONE WHEN:** `linesFor` treats a queue path that exists but is not a readable folder as an empty line (for example `fs.statSync(queue, { throwIfNoEntry: false })?.isDirectory()` before `readdirSync`, and a ticket that vanishes or cannot be read between the listing and the read is skipped, not thrown), so the verb exits 1 through `CommandError(EXIT.NO, "no run named <run> waits for tests")` and writes nothing; today `fs.existsSync(queue)` is true for the file, `readdirSync` throws, `runCommand` rethrows the non-`CommandError` (`.bkit/core/engine/commands/lib.ts:639`), and `cli.ts` prints `Unhandled error` with no friction row.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-jump.test.ts` `refuses when a regular file sits at the queue path` fails on `jump(["build-1"])` rejecting with an ENOTDIR error after `fs.mkdirSync(path.dirname(queue), { recursive: true })` and `fs.writeFileSync(queue, "not a folder")`, instead of resolving with code 1 and "no run named build-1 waits for tests"

<!-- bkit:task 3 end -->
