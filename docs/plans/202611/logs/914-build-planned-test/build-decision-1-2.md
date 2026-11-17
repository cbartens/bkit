Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/914-build-planned-test-plan.md

**Q1 — Task 11 [.bkit/core/engine/commands/workflow/tests.ts:2372]:** When a code step changes a planned test and logs a BLOCKED reason, the change goes through on the agent's word alone. Nobody sees what actually changed in the test: verify only notes it, the Step 15 question shows only the agent's reason, a headless run accepts it automatically, and rejecting it at ship puts nothing back. So an agent could delete a test's assertions, write a believable reason, and the weakened test would merge. You need to decide two things. (a) Should each changed test carry its line diff against the version that was recorded red, plus a flag saying whether the change only added lines? That diff and flag would then appear in the report and in the Step 15 question. This needs steps finish to store the old test text when it records the change. (b) Should a change that removes or loosens an expectation still be let through when a BLOCKED line names it, or be refused, or be raised as a test-loosened gap? Accept leaves it as built and records your reason. Fix now adds a fix task shaped by your answers to (a) and (b). Stop pauses the run here so it can be resumed.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It reopens owner decisions Q2 and Q3 from the issue (comment 2026-11-10T06:56:35Z): how much evidence a changed planned test must carry, and whether a loosened test may pass at all. That is a policy choice about what the test-first lock guarantees, not a code defect an agent can settle.
Decision: Fix now — diff + refuse
Fix task: 11

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
