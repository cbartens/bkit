Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/860-move-deterministic-bookkeeping-plan.md
Group: 1
Verify attempt: 4

**Q1 — Task 1 [commands/lib.ts:766] engine-call log row for invocation-bound commands:** Commands run with an invocation id (the new --invocation flag) currently leave no engine-call row in the run's status.jsonl, which the plan said to keep and which `bkit completeness check` reads as evidence. Writing the row would change status.jsonl on every such call, and a planned test (journal.integration.test.ts, 'resumes explicit invocation across two real worktrees without identity leakage') requires that file to stay byte-for-byte unchanged. Accept the gap as it is (and document it in docs/observability.md), or fix it now by letting these calls write to status.jsonl and rewriting that test?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The plan does not say where evidence for invocation-bound calls lives; either answer contradicts one planned requirement.
Decision: Fix now — owner: "ok fix now" (new Task 10 in group 1)

**Q2 — Task 1 [ledgers/status.ts, workflows.ts, step-table.ts] invocation not recorded in status.jsonl:** The plan says an invocation is recorded in status.jsonl as the source of truth, with the outbox receipt only a rebuildable copy. As built, the outbox receipt is the only record, so deleting it makes a live run's invocation id unresolvable. Writing the status event would break the planned test status.test.ts 'issues invocation metadata from an explicit run and registered step' (it asserts issuing changes no run state). Accept the receipt-only design, or fix it now by writing the event to status.jsonl and rewriting that test?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Same underlying choice as the first item: whether issuing or using an invocation may write to status.jsonl.
Decision: Fix now — owner: "ok fix now" (new Task 10 in group 1)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
