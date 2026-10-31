Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 8: Classify holes: evidence, step, unexercised, unexpected — 7 reds recorded (build-task-red-4-8-1..7.md; red stub reported every journaled call unexpected), check() + contractUnits() + R1/R3 deriver tags; status-holes tests 50/50 green, replay of all five workflows CLEAN. Row ownership: a key belongs to the last section writing it (steps finish|done --step=, step:"), rowless sections fold into the owner of their first key; consecutive rows of one unit form a visit, a repeated key starts a new one (.bkit/core/engine/checks/status-holes.ts, status-holes.test.ts)
BLOCKED — TASK 9 (reds only): 4 of 5 reds refused as passed (build-task-red-4-9-1,2,3,5.md): preJournal, journalSuspect, unattributable, self-exclusion and no-baseline behaviour already landed inside TASK 8's check(); only red 4 (read path) was recorded; no code undone to force a red
DONE — TASK 9: Verdict metadata, unattributable calls, self-exclusion and the read path — readCompleteness() added (last stored completeness row, recomputed when a step-done/engine-call row follows); the other four behaviours were already in check() from TASK 8; status-holes + workflow-shape tests 298/298 green, pnpm build and bkit:gate:static pass (.bkit/core/engine/checks/status-holes.ts, status-holes.test.ts)
