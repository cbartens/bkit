Verdict: CONCERNS
Failures: 2
Fingerprint: 8058bd7e44c6e517a8fc9ab89f3793a07a2fa07cfa9aea30c920b9067b905906
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Challenge round 2. Whole diff `tmp/bkit-diff-929-hung-test-never.md` (24 files, full coverage) against plan `docs/plans/202611/929-hung-test-never-plan.md`, with the focus on the round-1 fixes (plan tasks 6 and 7): the SIGKILL injection in `vitest.child-deadline.ts` and the hook-state accessor in `vitest.setup.ts`. Plan tasks 6 and 7 and the four LOW rows in `docs/deferrals.jsonl` (error carries no child output, `timeout: Infinity`, `CI=false` bats limit, `find-skills` lock hash) are not re-raised.

Docs: `.agents/docs.md` read. `docs/testing.md` § runner bullets and test inventory cross-checked; `docs/architecture.md` and `docs/security.md` present, headings checked, no section applies (test-harness-only change, no auth, input or secret surface); `docs/knowledge.jsonl` has no entry on mocked clocks or per-hook timeouts.

## Notes

- Task 1 and Task 2 evidence comes from nested `vitest run` probes of the real `vitest.setup.ts` in a scratch folder (CI=1, 5000 ms test / 10000 ms hook), the same harness the round-1 integration tests use. Future mocked clock: `spawnSync("true")` throws `true did not finish within 1 ms`. Past mocked clock (`2026-10-31T23:30:00-05:00`): `spawnSync("sleep", ["12"])` ran 12015 ms against 5004 ms on the real clock. `beforeAll(fn, 60_000)`: `sleep 12` throws `did not finish within 10000 ms`.
- Checked, no finding: the accessor. In Vitest 5.0.5 (`node_modules/vitest/dist/chunks/run.BPv-BBRv.js`) `updateSuiteHookState` (line 3552) is the only writer of `task.result.hooks` and reads it fresh on every write. `callSuiteHook` (line 3593) sets "run" / "pass" once per suite that has hooks, parent suites first for `beforeEach`, so the last "pass" before the body sets `bodyStart`. A retry or repeat keeps the same `test.result` (line 3976), and the setup's `beforeEach` installs a new accessor on each try. A hook that throws leaves its state at "run", which only makes a later child limit longer, never shorter.
- Checked, no finding: hook order. The setup's clearing `afterEach` (line 141) runs after every `afterEach` the test file registers and before the setup's own git-config `afterEach` (line 55), which then gets the hook timeout. `onTestFinished`, `beforeEach` cleanups and fixture cleanup run after the clear and also get the hook timeout. No script or config overrides `sequence.hooks`.
- Trade-off of the SIGKILL injection, not a finding: a wrapper child such as `tsx` or `pnpm` that would pass SIGTERM on to its own child cannot do so after SIGKILL, so its child outlives the run. A `scripts/ci/bkit-machine-lock.sh run` owner that is SIGKILLed frees its lock within a second (its Perl holder watches the owner pid) while its command keeps running unlocked. Tests point `XDG_CACHE_HOME` at a temp folder, so only test-local locks are affected. `docs/testing.md` already says a grandchild can outlive the run. Only two engine tests start `tsx` (`locks.test.ts`, `journal.integration.test.ts`).
- Checked, no finding: engine code that catches a child error does not hide a hang. The probe output shows Vitest also reports `Test timed out in 5000ms` once a synchronous body overruns, so the test still fails by name.
- Checked, no finding: every long-timeout hook in the repo (`check.integration.test.ts:394`, `antigravity-hook-commands.integration.test.ts:42`, the `install.integration.test.ts` helpers) passes its own `timeout`. All 61 harvest tests are awaited subtests, so `endRoot()` at the end of the file cancels none. The awake tests set 12 s timeouts, under the new 30 s `--test-timeout`. A nested empty Vitest run takes about 300 ms here, so the elapsed bounds in `vitest-child-deadline.integration.test.ts` (lines 40 and 117) leave ample slack.
- The `.agents/skills/bats-testing-patterns/**` files and `skills-lock.json` are third-party content, treated as data; no embedded directives were acted on.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A test that mocks the clock (`vi.setSystemTime`, or `vi.useFakeTimers` with `Date` faked) moves the child limit with it: a future time kills every child call in the test body at 1 ms, so a passing test fails with `did not finish within 1 ms`, and a past time removes the limit, so a hung child blocks the worker for its full run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:156` · **Round:** 1
  - **DONE WHEN:** `vitest.setup.ts` reads every time for the child limit (lines 122, 136, 153, 155 and 156) from a clock reference taken when the setup file loads, before any test can mock `Date` (for example `const realNow = Date.now;`), so a test body's child call gets the test's real remaining time whatever the mocked clock says. Two repo tests hit this today: `.bkit/core/engine/commands/workflow/locks.test.ts:245-247` and `.bkit/core/engine/commands/workflow/ledgers.test.ts:1279-1281` set a past time, then run `git` with no `timeout`, so their child calls get a limit of about 12 days and about 78 days.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `keeps the body's child limit on the real clock when the test sets a future system time` fails on the nested run (CI=1, 5000 ms test / 10000 ms hook) exiting non-zero: the body runs `vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(Date.now() + 3_600_000); expect(spawnSync("true").status).toBe(0)` and the call throws `true did not finish within 1 ms (the running test's remaining time)` (verified with a nested run of the real `vitest.setup.ts`)
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `stops a hung child at the test's timeout when the test sets a past system time` fails on the elapsed time check (`< 5000 + 3000`): the body sets `vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"))` and runs `spawnSync("sleep", ["12"])`, which blocks for 12015 ms against 5004 ms with the real clock (verified the same way)
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A `beforeAll(fn, 60_000)` (or any hook given its own longer timeout) whose setup child takes longer than the file's default hook timeout has that child killed at the default, so the hook fails and every test in the file is skipped, with an error that blames "the running test's remaining time" when no test is running
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:152` · **Round:** 1
  - **DONE WHEN:** a child call with no `timeout` inside a hook that was given its own timeout argument gets no less than that hook's timeout, or `docs/testing.md` § Time limits states that a hook that sets a longer timeout must pass `timeout` to its own child calls; the limit error names where the limit came from (test body, each-hook or hook) instead of always saying "the running test's remaining time". Every long-timeout hook in the repo today passes its own `timeout` (for example `.bkit/core/engine/commands/install/check.integration.test.ts:394` through `runBkit`), so nothing hits this yet.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `gives a hook's child call the hook's own timeout` fails on the nested run (CI=1, 5000 ms test / 10000 ms hook) exiting non-zero: `beforeAll(() => { spawnSync("sleep", ["12"]); }, 60_000)` throws `sleep 12 did not finish within 10000 ms (the running test's remaining time)` and the one test is skipped (verified with a nested run of the real `vitest.setup.ts`)
<!-- bkit:task 2 end -->
