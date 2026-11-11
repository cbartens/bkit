Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/864-move-project-docs-plan.md

**Q1 — Task 14 [project-docs.ts:400]:** The check can keep telling you to run bkit upgrade to register a project doc that bkit upgrade will never register. This happens when the doc index already has a row for an equivalent doc, even a stale row for a file that has been deleted: upgrade skips the doc, so the advice never goes away. The reviewer marked this as not safe to settle automatically because there are two reasonable fixes. (1) Upgrade registers the present doc when the existing equivalent row is unusable (missing file, out of tree, unsafe) and prints which equivalent rows it skipped. (2) The check stops saying 'run bkit upgrade' and instead reports two candidates with a hand-edit action. Fix now adds the repair as a new task (tests first, then the code); tell me which of the two you want, or I take the reviewer's first suggestion. Accept leaves the endless advice as it is and records that you accepted it. Stop writes a handover and ends the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The two fixes change different behaviour (what upgrade writes to the index versus what check says), so the choice between them is the owner's.
Decision: Fix now — Yes, both halves

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
