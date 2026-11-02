Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Restore the mandatory automated-verification gate (plan edit).** `plan-v1-draft.md:562` calls the Automated Tests checks "advisory" and replaces the template's requirement that every applicable box be checked with proof. The template at `docs/templates/bkit-plan.md:349` makes this an automated verification gate; only the following owner-run Manual Verification section is advisory. Task 11 already requires the relevant checks, so this is a conflicting gate instruction rather than a need to change scope. Restore the requirement that every applicable Automated Tests item is checked with actual passing evidence, keeping unavailable required provider evidence incomplete. Preserve the separate advisory status of Manual Verification.

2. **Give postflight race detection an explicit implementation and verification outcome (plan edit).** The design's Routine delivery step 7 requires a successful postflight inspection that observes an intervening comment to seal the segment for future writes. The draft retains that edge case at `plan-v1-draft.md:48`, but its matrix and Tasks 5-6 cover replies detected before mutation and failed postflight reads, not a comment arriving after the final eligibility read and being observed after an acknowledged mutation. Add a matrix case and a test in the existing tracker suite, owned by Task 6 or the appropriate publication task, that inserts the intervening comment between preflight and postflight. Require the acknowledged write to remain successful with its URL, require the observed race to seal the segment, and require the next routine report to start a new segment. State that outcome in the task's completion criterion. Exercise the proposed preflight boundary only under an explicitly approved test contract; leave the unanswered strict chronology default unchanged. The additional case fits the current task and group caps.

## OPTIONAL

None. The acceptance criteria and original design edge cases are preserved, all required sections are present, both new files have reuse reasons, and every owner question has options, a recommendation and an explicit default. No task directs edits into a consumer-managed block. The unresolved chronology and delivery decisions remain prerequisites rather than implied approvals.

## OUT OF SCOPE

None. No required work is parked in Out of Scope, and the supplied related records introduce no mandatory expansion for this scope audit.
