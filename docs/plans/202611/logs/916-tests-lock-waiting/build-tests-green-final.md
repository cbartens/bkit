Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 1

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
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "replaces a shipped 6.1.1 machine-lock copy and records the same unhashed write in dry run" | red | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "preserves an edited machine-lock copy without the queue and reports the template to merge by hand" | red | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves a symlinked machine-lock copy unchanged and reports the template to merge by hand" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jump marker moves its waiting run to the front of the line" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the newest jump marker goes first" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jump marker that matches no waiting run is deleted" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jumped run that gives up and asks again within 120 s keeps the front" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump moves a waiting run to the front of the tests line" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump refuses a run name no waiting run carries" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump refuses a run name two waiting runs share" | red | passed |
| 9 | `.bkit/core/engine/install/modules/index.integration.test.ts` "bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex" | red | passed |
| 9 | `.bkit/core/engine/install/modules/index.integration.test.ts` "path-prefixed bkit tests jump forms get the same verdicts on every host" | red | passed |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" | no row | passed |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP" | red | passed |
| 13 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the codex hook denies bkit tests jump when .codex is a symlinked folder" | red | passed |
| 15 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the codex hook denies bkit tests jump chained after another ask-tier command" | red | passed |

## Gaps

None.

## Unproven

- Task 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" — no tests step recorded a red for it (`bkit tests red --group=4`); the owner answers it at the end of the build
