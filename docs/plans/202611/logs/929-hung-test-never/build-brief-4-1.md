# Brief: group 4 — Challenge round 2 findings

Plan: Time limits for hung tests Implementation Plan

## Why and what

### Context & Goals

Every test runner bkit uses on itself gets a time limit that holds when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the machine-wide tests lock frees (#929).

## Where it fits

- Group 1: Time limit for synchronous child calls in Vitest workers — done
  - TASK 1: Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout` — done
  - TASK 2: Install the wrapper in every Vitest worker — done
- Group 2: Time limits for node --test and bats runs — done
  - TASK 3: One source for the `node --test` and bats limits, derived from the integration budget — done
  - TASK 4: Apply the limits in every runner bkit uses on itself — done
  - TASK 5: Document the limits — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: A test whose child traps or ignores SIGTERM (the `scripts/ci/bkit-machine-lock.sh run` owner, or `sh -c "trap '' TERM; ..."`) still blocks the worker for the child's full run, because the injected limit only sends the default SIGTERM — done
  - TASK 7: A test that uses most of its budget, followed by a file-level or `describe`-level `afterEach` that cleans up with `execFileSync` (for example `git worktree remove`), has the cleanup killed after a few ms; the passing test is reported failed and the cleanup is skipped — done
- Group 4: Challenge round 2 findings — this group
  - TASK 8: A test that mocks the clock (`vi.setSystemTime`, or `vi.useFakeTimers` with `Date` faked) moves the child limit with it: a future time kills every child call in the test body at 1 ms, so a passing test fails with `did not finish within 1 ms`, and a past time removes the limit, so a hung child blocks the worker for its full run — open

## The work

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** A test that mocks the clock (`vi.setSystemTime`, or `vi.useFakeTimers` with `Date` faked) moves the child limit with it: a future time kills every child call in the test body at 1 ms, so a passing test fails with `did not finish within 1 ms`, and a past time removes the limit, so a hung child blocks the worker for its full run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:156` · **Round:** 2
  - **DONE WHEN:** `vitest.setup.ts` reads every time for the child limit (lines 122, 136, 153, 155 and 156) from a clock reference taken when the setup file loads, before any test can mock `Date` (for example `const realNow = Date.now;`), so a test body's child call gets the test's real remaining time whatever the mocked clock says. Two repo tests hit this today: `.bkit/core/engine/commands/workflow/locks.test.ts:245-247` and `.bkit/core/engine/commands/workflow/ledgers.test.ts:1279-1281` set a past time, then run `git` with no `timeout`, so their child calls get a limit of about 12 days and about 78 days.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `keeps the body's child limit on the real clock when the test sets a future system time` fails on the nested run (CI=1, 5000 ms test / 10000 ms hook) exiting non-zero: the body runs `vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(Date.now() + 3_600_000); expect(spawnSync("true").status).toBe(0)` and the call throws `true did not finish within 1 ms (the running test's remaining time)` (verified with a nested run of the real `vitest.setup.ts`)
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `stops a hung child at the test's timeout when the test sets a past system time` fails on the elapsed time check (`< 5000 + 3000`): the body sets `vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"))` and runs `spawnSync("sleep", ["12"])`, which blocks for 12015 ms against 5004 ms with the real clock (verified the same way)
<!-- bkit:task 8 end -->
