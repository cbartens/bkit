Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Coverage: partial diff coverage — `tmp/bkit-diff-715-retire-lite-workflows.md` shows 20 of 207 files; the code hunks are `disk.ts`, `analysis.ts`, `close-squash.integration.test.ts` and `ship-verdict.integration.test.ts` (the rest are `.bkit/instructions.md` and vitest skill reference docs). Findings are limited to that content.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A disk sweep that runs longer than `LOCK_STALE_MS` (1h) has its lock replaced by a queued `--wait` sweep, because the running sweep never renews the lock and `waitForLock` waits exactly `LOCK_STALE_MS + pollMs`, so the waiter deterministically sees an "hour-old" lock, deletes it and runs a second sweep alongside the first (breaks `.bkit/templates.md` § Disk prune "One sweep runs per machine at a time")
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/disk.ts:245`
  - **DONE WHEN:** while `sweep` holds the lock it refreshes the lock file's mtime on an interval well under `LOCK_STALE_MS` (a named constant, overridable by a `renewMs` option for tests) and clears the interval in the same `finally` that calls `releaseLock`, so `takeLock` only ever replaces a lock whose holder died or stopped renewing; the `waitForLock` doc comment matches the behaviour; the existing "replaces a lock whose process is gone, or that is an hour old" test still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/disk.test.ts` `a running sweep renews its lock, so a waiting sweep never replaces it mid-run` fails on a repo `max` step (function `run`) that backdates `disk-prune.lock` by 2h with `fs.utimesSync` and then awaits 200ms, started via `sweep({ cwd, mode: "max", dryRun: false, renewMs: 20, log })`; ~100ms in, a second `sweep({ cwd: other, mode: "min", dryRun: false, wait: true, pollMs: 10, maxWaitMs: 50, log })` must return `reason: "locked"`, but today nothing renews the lock, `takeLock` treats it as stale, deletes it and the second sweep runs (`reason: null`)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A low-disk `bkit worktrees setup` that gives up after the 60s `DISK_SETUP_SWEEP_WAIT_S` wait has already stamped `low` / `max` / `min` for every step file, so the pre-commit / pre-push `--auto` hooks treat this checkout's (and the machine's) turn as spent for an hour (`low`) and a day (`min` / `max`) although no sweep ran for them — contradicting `.bkit/templates.md` § Disk prune "the worktree check wait[s] for a running sweep to end, so their turn is never lost"
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/disk.ts:559`
  - **DONE WHEN:** `ensureDiskSpace` stamps the step files only when its `max` sweep actually took the lock (`ran.reason !== "locked"`), so a timed-out wait leaves every `--auto` stamp untouched and the next hook still starts this checkout's low-disk `max` sweep; a sweep that ran keeps today's stamping.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/disk.test.ts` `worktree setup's timed-out wait leaves the --auto turn unspent` fails on `holdLock(process.pid)`, `ensureDiskSpace({ cwd, minFreeGb: 1e9, pollMs: 10, maxWaitMs: 50, log })` (returns the "another sweep" refusal), then `fs.rmSync(lock())` and `schedule({ cwd, mode: "min", minFreeGb: 1e9, start })`: it must start `max`, but today the stamps written before the wait make it return `reason: "not-due"` with `start` never called

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** The deferred-landing test's `openPr` runs only the push and `prs open` lines of ship Step 2's no-PR fence; the shipped `prs open` line ends `|| OPEN_EXIT=$?` and the dropped `case` / `exit "$OPEN_EXIT"` lines are what surface its exit, so a `prs open` that creates the PR and then fails its read-back (`EXIT_GH_FAILED`, `prs.ts:349-354`) still gives bash status 0 and both landing tests pass on a broken open
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts:302`
  - **DONE WHEN:** `openPr` runs the whole Step 2 no-PR fence from `.bkit/core/workflows/bkit-ship.md` as written (push, `OPEN_EXIT=0`, `prs open … || OPEN_EXIT=$?`, the `case "$OPEN_EXIT"` `status meta --opened-pr` line and `exit "$OPEN_EXIT"`), extracted as one fence rather than line by line and not hand-prefixed, so any non-zero `prs open` exit fails the helper's `res.status` assertion.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `openPr fails when prs open cannot read the created PR back` fails on a shim whose `pr view` exits 1 (after `pr create` is recorded): `expect(() => openPr()).toThrow()` must hold, but today `|| OPEN_EXIT=$?` swallows the `prs open` exit, `res.status` is 0 and `openPr` returns normally

<!-- bkit:task 3 end -->
