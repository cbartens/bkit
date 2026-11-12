Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/891-build-gate-stuck-plan.md

**Q1 — TASK 16 (`.bkit/core/engine/commands/workflow/tests-base.ts:181`):** The new base check can tell you a red gate is entirely dev's fault when it is not. It only reads the test reports. If the gate is also red for a reason that is not a test (a coverage threshold, or a static check that runs after the unit tests) and some failing tests are also red on dev, it still says 'all of these fail on dev, no round here can fix them'. After dev is fixed, the branch's own failure keeps the gate red. The gate scripts report no per-stage result, so no agent can close this alone. Accept ships it as it is and records the limit. Fix now adds a task to make 'all' claim only the tests, and to recommend Stop only when the counted failing tests explain the whole red gate, which needs no change to the gate script contract. Stop hands the run over. Which do you want?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Choosing between changing the consumer-owned gate script contract and narrowing what the 'all' verdict claims is a design decision about bkit's shipped surface; the reviewer logged it as architectural and not fixable by an agent.
Decision: Fix now — B) Make "all" claim only the failing tests, and recommend Stop only when those tests explain the whole red gate. The gate script contract stays as it is.
Refined by owner (2026-11-10): "Yes as per your recommendation" — `all` keeps recommending `Stop` (Success Criterion 2) and claims only the failing tests; its reason adds that a gate still red after `dev` is fixed and the run resumed comes from this branch. The test is rewritten to match.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
