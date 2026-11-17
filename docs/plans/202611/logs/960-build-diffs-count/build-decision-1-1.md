Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/960-build-diffs-count-plan.md

**Q1 — TASK 7 (`.bkit/core/engine/commands/workflow/branches.ts:1692`):** Commits that sit on local dev but were never pushed still go out with this branch's push and PR. After this change, the safety checks that run before publishing no longer look at them: the check that no debug-logging line is left behind, the migration scan that forces a full CI build, the security reviewer's diff and ship's pre-merge diff. For example, debug-logging commits left on local dev by a failed in-place /bkit-debug would reach origin/dev unchecked. Pick one: (a) make those publishing checks measure everything the push publishes (origin/dev...HEAD), and keep the feature's own start commit only for sizing and for the holistic test base; (b) add an engine check that refuses the push or PR while the branch carries commits that are on local dev but not on origin/dev; or (c) accept the risk and record it in docs/decisions.jsonl and docs/security.md. Answer Fix now with (a) or (b), Accept for (c), or Stop.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It reverses part of what the plan's Task 2 deliberately does (its test asserts that unpushed local dev commits are left out), so choosing between safety and attribution is the owner's call.
Decision: Fix now — fix now for both
Fix task: 7

**Q2 — TASK 9 (`.bkit/core/workflows/bkit-ship.md:530`):** /bkit-ship's deferred sweep now reads a diff that starts at the feature's own start commit, because its diff command passes no --base and the new default applies. Its instructions, though, still tell it to scan for disabled tests from origin/dev, and the PR merges everything since origin/dev. So the two disagree on a branch cut from a local dev that is ahead. The plan never decided ship. Pick which base ship's two diffs (the Step 5 sweep and the Failure Path handover) use: (a) the PR's full merge diff, by passing --base=origin/dev to both; or (b) the feature's start commit, by dropping origin/dev from the sweep's instructions and its disabled-tests scan. Answer Fix now with (a) or (b), Accept to leave it as it is, or Stop.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The plan scopes the new default to build and debug only, and the right base for ship depends on the owner's answer to TASK 7.
Decision: Fix now — fix now for both
Fix task: 9

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
