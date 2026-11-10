Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/860-move-deterministic-bookkeeping-plan.md

**Q1 — TASK 13 [.bkit/core/engine/commands/workflow/steps.ts:2328]:** An audit run that follows its own prompt wipes out its finished report. The prompt tells the audit agent to run `steps stub --result-file --to=<the report>` at the end, and that command replaces the whole report with a short summary, so the findings it just wrote are lost before they are committed. The engine has two ways to stop this: (A) put the summary header and tables into the existing report and leave the rest alone, or (B) write the summary to its own separate file. Which do you want, or do you accept the risk and leave it?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Choosing between splicing into the report and writing a separate summary file changes what every audit run produces, so only the owner can settle it.
Decision: Fix now — owner: "Fix now, both"

**Q2 — TASK 14 [.bkit/core/engine/commands/workflow/ledgers.ts:1699]:** If a ledger write crashes after it records its intent but before its receipt, and a newer run has started since, nothing can ever finish or cancel that half-done write. Because the intent is kept in a committed file, it then spreads to other checkouts and blocks `ledgers union`, `ledgers compact` and the upgrade migration there. The fix needs your call on who may finish such a write, and whether the intent is private to one checkout (as the plan says) or committed state. Do you want it fixed in this PR, accepted as a known gap, or stop here?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Who may reconcile an interrupted write, and whether the record is checkout-local or committed, is a design decision for the owner.
Decision: Fix now — owner: "Fix now, both"

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
