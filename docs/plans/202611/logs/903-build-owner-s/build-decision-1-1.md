Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/903-build-owner-s-plan.md

**Q1 — Task 8 [.bkit/core/workflows/bkit-build.md:226]:** If a build is stopped right after the Decision Pause writes the owner's answers but before it records the pause as finished, the next start does not reopen that pause and composes it again from scratch. That wipes the saved `Fix task:` lines, so a second fix task is written for the same item. There are two ways to close this: (1) `openDecision`, the check that finds a pause to resume, also reopens an answered file that has no finished record, so the pause picks up where it stopped; or (2) `decisions compose` refuses to overwrite a file that already holds answers or `Fix task:` lines. Answer `Fix now` and name 1 or 2 as your direction to have it built as a new fix, `Accept` to ship with the gap, or `Stop`. Which do you choose?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Both fixes change how a stopped run resumes (the contract in .bkit/workflows.md § Decision Pause and DECISION_ROUTES); only the owner can pick which.
Decision: Fix now — B - 1 (reopen a decided file that no build-decision row names)
Fix task: 8

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
