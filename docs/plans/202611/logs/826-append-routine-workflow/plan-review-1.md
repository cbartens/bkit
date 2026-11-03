Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **Establish provider schemas before their implementation consumes them (plan edit).** Task 1 requires all three adapters to implement create/edit/inspect and its test to exercise the “verified update shape” (`plan-v1-draft.md:323-333`). The source design explicitly leaves Jira's deployed schemas and required IDs undiscovered and requires discovery before use (`plan-input-1.md:189`). The plan assigns schema/evidence recording to Task 10, after Tasks 1-9, and names missing Jira credentials only as a prerequisite for that late task (`plan-v1-draft.md:512-518`). Thus the early adapter task consumes contract evidence that neither the existing design evidence nor an earlier task supplies. Split the prerequisite schema/field/representation discovery from final acceptance: make verified production request/response shapes available before Task 1's implementation and fixture assertions, while retaining the full publisher/recovery mutation probes after integration. An unavailable prerequisite must block the affected adapter work rather than encourage an invented update shape. Also assign the final evidence-driven capability/counting updates to the matching tracker catalog and fixtures: Task 9 currently completes those documents before Task 10 changes the metadata.

2. **Give failed eligibility reads an explicit no-mutation outcome and test (plan edit).** The design requires a failed eligibility read to return the existing failure result and exact standalone fallback, without authorizing an edit or inferring absence (`plan-input-1.md:228`). The draft instead covers missing/unstable metadata, detected replies/edits/deletion, and pending-write reconciliation; its matrix broadly routes “unsupported evidence” to rollover (`plan-v1-draft.md:65-79`). Tasks 1 and 5 have no case distinguishing a failed preflight transport read from a conclusive ineligible target, and Task 6's unresolved-outcome tests concern prepared writes. Merely adding the `eligibility-failed` diagnostic in Task 8 does not establish the publishing behavior. Add the failed-read branch to Task 5's completion condition and the matrix, with a named test asserting zero engine create/edit calls, `done: false`, and unchanged standalone fallback bytes after the bounded eligibility read fails. Keep the separate safe rollover path for conclusive evidence that the old segment is ineligible.

## OPTIONAL

The remaining dependency graph is coherent: Tasks 1-2 produce adapter/rendering contracts; Task 3 produces durable source and identity records; Task 4 produces serialization; Tasks 5-6 consume those for publication/recovery; Task 7 supplies command lifecycle wiring; Task 8 consumes outcomes; Task 9 integrates host instructions; Tasks 10-11 establish final external and built-CLI evidence. No irreducible task cycle was found. The first two owner questions remain open with their strict defaults, and the plan does not claim that provider fallback satisfies consolidation acceptance.

Clarify in Task 1 that its adapter-level eligibility tests call a lower-level contract independent of the publisher introduced by Task 5. This keeps the first group's tests runnable without making the later publisher an implicit prerequisite.

## OUT OF SCOPE

None. The plan covers the whole parent design, preserves the existing transport and dependency boundaries, and introduces no unrelated release scope.

## SUGGESTED SCOPE EXPANSION

None. The supplied related issues are closed: [#758 — Workflow optimisation: tracker, roadmap and ledgers (done)](https://github.com/cbartens/bkit/issues/758) is a completed parent, and [#387 — Close workflows leave stats.jsonl uncommitted after push](https://github.com/cbartens/bkit/issues/387) supplies historical commit-order regression context already addressed by Task 7's real-git lifecycle coverage. Both supplied failure rows are also closed. Preserve their lessons in that coverage without reopening them or adding tasks; the deferral scan contains no candidates.
