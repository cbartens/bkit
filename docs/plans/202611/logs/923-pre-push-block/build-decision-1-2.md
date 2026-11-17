Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/923-pre-push-block-plan.md

**Q1 — Task 5 [.bkit/templates/.husky/pre-push:240] /bkit-ship can no longer repair a conflicting PR:** The new pre-push check blocks any push from a branch whose open PR conflicts with its base. But /bkit-ship pushes before it merges the base in (pushes at .bkit/core/workflows/bkit-ship.md:282, :306 and :432, and the merge at Step 4 :456), so a conflicting PR now stops ship before it reaches the step that would fix the conflict. Agents may not use --no-verify. Once Task 6 is fixed, ledger-only conflicts, the common case, hit this too. Fix now adds a fix task, and you then say which way: (1) ship merges the base before its first push, (2) the hook lets through a push that already contains the base merge, or (3) leave it and ship needs a manual merge first. Accept leaves ship as it is, with the check blocking those pushes.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Each choice changes either ship's step order or the hook's blocking promise, so only the owner can pick one.
Fix task: 5
Decision: Fix now — Yes, on/off switch (BKIT_PR_CONFLICT_CHECK=false skips the check and prints one off line; ship sets it on its pushes before Step 4 only)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
