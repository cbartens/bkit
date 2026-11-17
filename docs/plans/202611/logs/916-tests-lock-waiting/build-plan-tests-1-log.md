Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 2: lock dir cache/bkit/machine-lock and exit 4 shape from .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:425
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `tests-lock waiters run their commands in arrival order`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `stack-lock waiters run their commands in arrival order`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a run that releases the lock and asks again queues behind runs already waiting`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with two slots, waiters take freed slots in arrival order`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `queued waiters keep their order while a copy without the queue also waits, and no two commands overlap`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter that gives up leaves the line and the runs behind it keep their order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose caller is killed leaves the line and the runs behind it keep their order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the queue folder when it cannot be created`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the queue folder when no ticket can be written`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 4 naming the queue folder when a regular file blocks it`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a try while a run waits first in line reports busy even when the lock is free`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the waiting note says where the run is in line`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a stray file in the queue folder neither blocks the line nor gets deleted`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a stopped first-in-line waiter holds the line while the lock is free`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by the holder does not wait on its parent`
WROTE — TASK 4: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a waiter that gives up and asks again within 120 s keeps its place in line`
WROTE — TASK 4: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a held place older than 120 s is deleted and the re-ask joins the end of the line`
SOURCE — TASK 1: ticket name pid and '<who> — <checkout>' ticket line from plan Task 1/4 UPDATE text (code not yet written); Task 4 ages a held place with utimes mtime
