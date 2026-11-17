Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/787-show-authoring-rules-plan.md
Group: 3
Verify attempt: 2

**Q1 — Task 11 [core.integration.test.ts] Upgrade can drop a consumer's own hook settings:** When an existing project upgrades bkit, this change alters the hook entries bkit registers (Claude gains NotebookEdit, Cursor becomes Write|Delete, Antigravity gains multi_replace_file_content). The upgrade's merge then no longer recognises the old file as 'bkit's entries plus the consumer's', and it replaces whole lists instead of merging them. The result is that a consumer's own custom hook group, and any permissions they added to Claude's settings, are dropped on upgrade. The current Task 11 test builds its starting files from the new layout, so it never sees this. What should the plan do?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Each choice changes what bkit does to consumers' files on upgrade: Accept leaves the loss in and restates the plan's wording; Fix now adds a new task to change the merge rules or add a migration (bkit is public, so a migration needs registering in docs/migrations.md); only the owner can weigh that.
Decision: Fix now — owner chose "Fix now": a new Task 13 changes the upgrade merge so consumer-added list entries survive; no migration.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
