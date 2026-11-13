Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "tests-lock waiters run their commands in arrival order" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "stack-lock waiters run their commands in arrival order" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a run that releases the lock and asks again queues behind runs already waiting" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with two slots, waiters take freed slots in arrival order" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "queued waiters keep their order while a copy without the queue also waits, and no two commands overlap" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter that gives up leaves the line and the runs behind it keep their order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller is killed leaves the line and the runs behind it keep their order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the queue folder when it cannot be created" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the queue folder when no ticket can be written" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run exits 4 naming the queue folder when a regular file blocks it" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a try while a run waits first in line reports busy even when the lock is free" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the waiting note says where the run is in line" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a stray file in the queue folder neither blocks the line nor gets deleted" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a stopped first-in-line waiter holds the line while the lock is free" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by the holder does not wait on its parent" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter that gives up and asks again within 120 s keeps its place in line" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a held place older than 120 s is deleted and the re-ask joins the end of the line" | red | passed |

## Gaps

None.
