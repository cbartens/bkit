Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202610/699-engine-run-completeness-plan.md

**Q1 — TASK 25 [.bkit/core/engine/checks/status-holes.ts:592] this run's own build still reads as having missing evidence:** The check that tells you whether a run's steps are backed by recorded bkit commands still flags this very build as HOLEY (41 steps lack a recorded `steps finish`). The reason: the build's `bkit` calls run the main checkout's copy of bkit, which does not record them, while the worktree's own copy records only background commands, so the earlier fix (which skips steps from before the first recorded call) never applies. The effect is advisory only: a warning when the ship workflow starts. Fix it now (one more small task: treat a step as unproven only when its own finishing call was recorded), or accept and ship as is?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — Without it the feature's own first run warns falsely; the fix is small and has a failing test already named.
Decision: Fix now — Yes, fix it

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
