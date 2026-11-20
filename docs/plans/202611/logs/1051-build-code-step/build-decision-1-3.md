Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/1051-build-code-step-plan.md
Group: 3
Verify attempt: 2

**Q2 — Task 5:** When finish cannot put the agent's own `package.json` back (both the structured write and the plain byte copy fail), it still says the file is restored, so the agent's own `bkit.workflows` edit is lost with no warning. The fix is small: the restore helper reports which of its three outcomes happened, and the refusal message prints the true one with the error text, plus one test where neither write lands. Fix it now?
A) Fix now — one more fix round runs before the build moves on
B) Accept — the item is recorded as accepted and the build moves on; the wrong "restored" message stays until a follow-up fixes it
Recommended: A) Fix now — the gap is one helper's return value and one message, the fix stays inside `steps.ts` and its tests, and it closes the DONE WHEN promise that nothing the agent wrote is lost
Default if unanswered: the run waits for you; taken as A when nobody can be asked

Owner (2026-11-20):
> Q1: B, Decide; Q2: A, Fix now. The build took each recommendation under the orchestrator's standing rule for a fixable MEDIUM-class gap (recorded as an assumption for the owner), not the owner's words.
