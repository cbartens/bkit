## Session Prompt — this run's, newer than everything below

/bkit-plan #916

## Issue description — oldest

### Failing test or CI run

none yet

### What happened

The machine-wide `tests` lock has no wait list. Each waiting run's Perl helper retries the lock file every 0.1 s with a non-blocking `flock` (`scripts/ci/bkit-machine-lock.sh:234-252`), and whichever helper happens to retry first after a release gets the lock. How long a run has been waiting counts for nothing: a run that started waiting a second ago has the same chance as one that has waited 50 minutes, and a session that just released the lock and asks again for its next gate is just as likely to win.

Observed on one laptop: a `bkit tests run` gate waited 51 minutes without starting. Over that time three other sessions took the lock ahead of it, each one that started waiting after it did: two sessions in a consumer repo (`bkit:gate:static-unit`, `bkit:gate:changed`) and one bkit session (`bkit:gate:changed`). Its wait limit was 3600 s, so it would give up (exit 75) without ever having run.

### What should happen

Runs get the lock in the order they started waiting. A run waiting with a long enough limit always gets its turn once the runs ahead of it finish.

Approach the fix should settle:

- Each waiter adds a ticket (its start time + pid) to a queue folder beside the lock file. Only the oldest live ticket tries the `flock`, or the oldest N with `BKIT_TEST_SLOTS=N`.
- A waiter that gives up or whose caller dies loses its ticket. The helper already checks every 0.1 s whether its caller is alive, so a dead ticket gets skipped and never blocks the queue.
- The `⏳ waiting` note says where the run is in line (for example "3rd in line"), and can estimate the wait from the `<name>.last` held times the lock already records.
- A blocking `flock` (no `LOCK_NB`) is not the fix: macOS does not promise to hand the lock over in arrival order, and blocking would break the wait limit and the caller-alive check.
- Open: whether consumers' adopted copies need a `docs/migrations.md` entry. #724 shipped the script as copy-and-own with no migration, so as things stand a consumer only gets this fix by copying the script again.

### Steps to reproduce

1. Hold the `tests` lock: `bash scripts/ci/bkit-machine-lock.sh run holder --lock tests -- sleep 30`.
2. Start waiter A with a long wait: `LOCAL_STACK_LOCK_WAIT_S=600 bash scripts/ci/bkit-machine-lock.sh run A --lock tests -- sleep 5`.
3. A few seconds later, start waiters B and C the same way.
4. When the holder finishes, look at which waiter's command runs first. With ordering it is always A; today it is any of A, B or C.

### How often

Every time three or more runs are waiting: on each release, a given waiter wins about 1 in k times, with k waiters. If new runs keep arriving there is no limit on how long one run can wait.

### Affected area

- `scripts/ci/bkit-machine-lock.sh` (the Perl helper's acquire loop) and its template `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, which must stay byte-identical
- `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`
- Every caller of the `tests` lock: `bkit tests run`, bkit's wrapped `bkit:gate:*` scripts, the `vitest.test-lock.ts` global setup

### Where and when

Local machines running several agent sessions in parallel, across repos. CI never takes the lock (`CI=true` / `CI=1` skips it).

### Evidence

- `scripts/ci/bkit-machine-lock.sh:235-251`: `flock($next, LOCK_EX | LOCK_NB)` on each slot, then `select(undef, undef, undef, 0.1)` and retry, with no record of arrival order.
- No decision in `docs/decisions.jsonl` and nothing in `docs/plans/202610/724-machine-wide-test-plan.md` covers the order in which waiters get the lock.

### References

- #724 — Machine-wide test lock: one test run at a time across agents
- #822 — Route raw test-runner commands through the tests lock per host
- `.bkit/templates.md` § Machine lock
- `docs/testing.md` § Stack (`vitest.test-lock.ts`)
