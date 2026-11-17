Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" | missing | not passed |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP" | red | passed |
| 13 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the codex hook denies bkit tests jump when .codex is a symlinked folder" | red | passed |
| 14 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" | passed-accepted | passed |

## Gaps

- Task 11 `not-green` — the named test "runs that take a lock at once on a fresh cache never refuse over the queue folder" did not run; the report holds "machine lock slots, order and wait budgets > reports a remaining numbered slot under bash -e after the primary slot is released", "machine lock slots, order and wait budgets > with N slots, N runs hold a named lock at once and run N+1 waits naming every holder", "machine lock slots, order and wait budgets > a slots value that is not a whole number >= 1 falls back to 1 and says so", "machine lock slots, order and wait budgets > the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one", "machine lock slots, order and wait budgets > a killed tests-lock holder frees its slot within a second and the waiter starts", … — Fixable: true — log: TASK 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — not-green — Fixable: true

## Already landed

- Task 14 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" — passed at the group's red, and the tests step accepted it: TASK 11 fix (mkdir || -d) is already in the template, so 16 takes x 50 folders all exit 0; no red is due

## Unproven

- Task 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" — the tests step left it as `missing`, not red; the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 1621ms
     ✓ a killed holder leaves no stale lock 401ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2304ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1972ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 403ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 395ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2053ms
     ✓ preserves fragmented successful FIFO re… 1381ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2452ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1208ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 316ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 420ms
   ✓ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 972ms
     ✓ stack-lock waiters run their commands in arrival order 836ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 1033ms
     ✓ with two slots, waiters take freed slots in arrival order 1860ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 2048ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 2616ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 577ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2187ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2181ms
     ✓ the waiting note says where the run is in line 436ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 769ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1181ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2118ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2120ms
     ✓ a jump marker moves its waiting run to the front of the line 552ms
     ✓ the newest jump marker goes first 462ms
     ✓ a jump marker that matches no waiting run is deleted 353ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 1569ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 99839ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1108ms

 Test Files  1 passed (1)
      Tests  68 passed (68)
   Start at  08:55:38
   Duration  154.44s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8eJmw8/junit.xml
```
