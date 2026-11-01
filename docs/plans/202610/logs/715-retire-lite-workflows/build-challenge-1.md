Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Coverage: partial diff coverage — `tmp/bkit-diff-715-retire-lite-workflows.md` shows 20 of 204 files (the code hunks are `disk.ts`, `analysis.ts`, `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts`, plus `.bkit/instructions.md` and vitest skill docs); findings are limited to that content. `disk.ts` and `analysis.ts` come from commits `41f02cedb`, `4d1704a4f`, `3107d10ac` on this branch, not #715 tasks.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A low-disk `bkit worktrees setup` that meets a hook-started `max` sweep now blocks for up to `LOCK_STALE_MS + pollMs` (3605s) with one log line, outliving the agent's shell-call timeout and the 3600s step timeout, so build Step 2 is killed mid-wait instead of getting the routed exit 12
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/disk.ts:554`
  - **DONE WHEN:** `ensureDiskSpace` waits for a running sweep only up to a bounded `maxWaitMs` (a named wait in `.bkit/core/engine/shared/timeouts.ts`, per `.bkit/workflows.md` § Retry / timeout / iteration constants "Waits live in `TIMEOUTS`"), set well under a single agent shell call, then returns the existing "another sweep ... re-run once it ends" refusal so `worktrees setup` exits 12 instead of hanging; `waitForLock` takes that bound instead of hard-coding `LOCK_STALE_MS + pollMs`; the detached `--auto` sweep keeps its long wait.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/disk.test.ts` `worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock` fails on `ensureDiskSpace({ cwd, minFreeGb: 1e9, pollMs: 10, maxWaitMs: 100, log })` with a fresh `holdLock(process.pid)` that is never released: today the option is ignored, the call waits ~3605s and the test times out instead of resolving with a message containing `another sweep`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/disk.ts:232`
  - **DONE WHEN:** `takeLock` replaces a stale lock atomically (e.g. `renameSync` the stale file to a unique name and verify it still holds the stale holder line before `tryCreate`, or re-read the holder immediately before removal and abort when it changed), so a lock another process created after this one's `statSync` is never removed; the existing "replaces a lock whose process is gone, or that is an hour old" case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/disk.lock-race.test.ts` `a stale-lock steal never removes a lock another sweep took after the stat` fails on a `vi.mock("node:fs")` wrapper whose `rmSync` on `disk-prune.lock` first rewrites the file with a fresh `{now} {live pid}` line (the second waiter winning between the stat and the rm), then a `sweep({ wait: false })` over a dead-pid lock: today the rm deletes the fresh lock, `tryCreate` succeeds and the sweep returns `reason: null` and runs its step instead of `reason: "locked"`

<!-- bkit:task 2 end -->
