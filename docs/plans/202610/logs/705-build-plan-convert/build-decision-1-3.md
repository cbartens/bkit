Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 7
Plan: docs/plans/202610/705-build-plan-convert-plan.md
Group: 3
Verify attempt: 1

**Q1 — TASK 3 — `instructions.test.ts` "sync has nothing left to rewrite" has no obtainable red (red-mismatch):** The plan's TASK 3 `TEST FIRST` line names `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite", but that test passes against the stale store — `bkit tests red` returned `refused: passed` — so no red for it can exist, and the verifier confirms the named test is a different file, name and drift mechanism from the one that actually failed. The recorded red (`.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry") is honest: it failed before the catalogue edit with `cross-step-invariants: text differs` and passes now. The plan line is at fault: `syncClauses`/`syncStore` only cover `## Clauses`, so a Special-Behaviors drift is invisible to the test the plan named. No agent move can make the plan-named test go red. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: Accept / Stop
No recommendation — A test-order gap is the owner's call, and the only alternatives are a waiver or correcting the plan line — neither of which an agent may authorise.
Decision: Fix now — ok fix teh plan line (TASK 3 `TEST FIRST` retargeted to the test that observes the drift; no TEST EXCEPTION written)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
