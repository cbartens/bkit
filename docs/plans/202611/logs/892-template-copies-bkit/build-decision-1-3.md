Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/892-template-copies-bkit-plan.md

**Q1 — Task 5 [.bkit/core/engine/install/template-copies.ts:164]:** The migration you chose copies bkit's lint-staged sample to the consumer's root as-is, and that sample assumes two things the consumer may not have: a helper script (scripts/prettier/bkit-insert-ignore.mjs) that it runs on plan and audit docs, and prettier, which it runs on every other staged file. Before the rename, the nested sample only ever applied to files under .bkit/templates/, so a consumer missing those never noticed. After the migration the root copy applies to every staged file, so in such a repo every commit that stages docs/plans/**/*.md (every bkit workflow commit does) fails on the missing script, and without prettier every commit fails. Accept keeps the straight copy and records the break as known. Fix now adds a task that tests first and then guards the migration; your reply can say how: copy the sample only when lint-staged and prettier are installed, also copy the helper script from .bkit/templates/scripts/prettier/ when it is missing, or drop the migration for the warning-only fix (bkit upgrade and bkit check name the missing root config, nothing is written). Stop ends the run here. What do you want to do?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The owner fixed the migration's output as a straight copy of the sample; whether to guard it, widen it to companion files, or fall back to the warning changes that decision, so it is the owner's call.
Decision: Fix now — "Yes, drop it" (asked: "Fix task 5 by dropping the migration and warning instead?")

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
