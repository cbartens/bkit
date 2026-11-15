Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/957-workflows-skip-re-plan.md

**Q1 — Task 8 [.bkit/core/workflows/bkit-build.md:307]:** If the run is stopped after the pause answer is recorded but before the accepted tasks are ticked, it resumes without those ticks: a blocked task re-opens its group, and a finished task stays unticked and fails the final summary. The suggested fix is to move the tick before the record step in the workflow text. This is a design choice about how the new continue route recovers from a stop, so the run cannot settle it alone. Accept the risk, fix it now, or stop?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The fix reorders steps in the workflow file the owner approved; whether a rare stop-and-resume window is worth another fix round is the owner's call.
Fix task: 8
Decision: Fix now — Fix now (the suggested fix: run the decision tick before the build-decision row is recorded)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
