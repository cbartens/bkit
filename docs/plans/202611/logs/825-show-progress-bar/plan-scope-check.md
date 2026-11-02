Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Reuse search evidence is not reproducible (plan edit).** `plan-v1-draft.md` § Reuse Inventory (lines 148-163) records descriptions such as “searched `progressLine`,” “opened existing … helpers,” and “no app-specific automated harness exists,” but no exact text-search commands or language-server queries. The template requires the commands and queries actually run, and the scope-check contract treats recorded searches rather than claims as the evidence for reuse decisions. This is especially material for the two `NEW` rows at lines 159 and 163, whose reason (a) depends on absence of a reusable artifact. Replace the descriptions with the actual scoped commands/query arguments and the candidates/results that support each decision. Perform and record any missing search rather than inventing a past command. Keep the existing extension-first architecture and runbook scope.

## OPTIONAL

1. **Make the consumer-owned documentation region explicit.** Task 4 scopes an update to `docs/testing.md` without naming a section. That file has a managed block through line 530 and project-owned test coverage below it. Name the project-owned coverage section below `<!-- bkit:end -->` as the target so the implementation cannot accidentally put feature-specific text in an overwritten region. The plan does not currently direct a managed-block edit, so this is clarification rather than a blocking violation.

2. **Keep phone evidence status visible at build handover.** The plan correctly follows the template's advisory owner-run Manual Verification policy and distinguishes character width from rendered layout. Task 4 completes when the procedure exists, however, while the screenshot success criterion remains unverified until the owner executes it. Have the evidence file carry an explicit `not run` / `passed` / `failed` outcome and carry that outcome into the handover; do not equate creating the procedure with proving the 375px layout. This does not add a new approval or merge gate.

## OUT OF SCOPE

None. The two declared exclusions (duration weighting and a live application bar) are additive to the requested chat-line behavior, and their matching deferral rows are present in the supplied context. All mandatory plan sections are filled; task scopes and verification are present, and the optional suffix question carries options, a recommendation and a default. No source-design change is required.
