Verdict: PASS
Failures: 0
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

None.

The issue is the source; the input names no parent design or audit. The plan retains its Narrative, five Success Criteria and original edge cases. Tasks 1-2 cover the specified arithmetic, fresh group reads, attempts and engine output. Task 3 covers plain-text narration across the five step-listed workflows and forwarding through auto. Task 4 covers documentation and the requested phone procedure. The two exclusions match the issue's explicit non-goals and have recorded deferral keys. The additive gate option is justified by the required gate-only completions; it does not add an unrelated feature.

The task dependency graph is acyclic and ordered:

<!-- prettier-ignore -->
| Task | Consumes | Produces | Order check |
| --- | --- | --- | --- |
| 1 | Existing workflow table, plan-group contract and counter semantics | Pure progress calculation and its Unit cases | Existing prerequisites; first producer. |
| 2 | Task 1 calculation; existing row writer, plan parser, run facts and limit resolution | Completion-command output, numeric gate rendering, wrapper propagation and Unit/Integration cases | Its new calculation exists after Task 1; all other prerequisites already exist. |
| 3 | Task 2 output keys and gate option; existing instruction sync and host renderers | Workflow callers, narration and rendered payload checks | Engine behavior precedes its workflow consumers. |
| 4 | Final engine and narration contracts from Tasks 1-3 | Current documentation and phone-verification procedure | Documents the completed contract after its producers. |

Group 1's planned tests exercise engine commands and fixtures rather than the workflow narration added in Group 2. Group 2 owns its renderer and synchronization checks. No listed test requires a later group to supply its behavior. The plan preserves the append-only status schema, frozen attempt limits, grants and per-run selection described by the relevant decisions and knowledge entries.

## OPTIONAL

1. Make the task-group regeneration boundary explicit. Task 3 currently names build/upgrade, while Task 4 changes canonical CLI and workflow documentation afterward. State that the final upgrade and drift check occur after Task 4's source edits; retain the required engine build/dist update with Group 1's code commits. This clarifies the existing verification obligation without adding scope.
2. Keep the phone result visibly unverified until screenshot evidence exists. The manual check is advisory under `docs/templates/bkit-plan.md`, and Task 4 produces a procedure rather than evidence of the external app's typography. Completion reporting should distinguish automated character-count coverage from the fifth Success Criterion's rendered-layout observation, as the draft already requires in Manual Verification.

## OUT OF SCOPE

None. Duration weighting and a live application bar are already explicitly excluded. The optional `groups added` suffix remains an owner question with the specified format as its default; it has not silently entered the runbook.

## SUGGESTED SCOPE EXPANSION

- `engine-journal-misattributes-calls-to-stale-run` — source: `related-failures.md`, TRIAGED. It overlaps status-file/run selection. Keep journal-attribution remediation in its own work; retain the plan's explicit supplied-status-path selection and prior-run isolation tests.
- `58-debug-run-tests-parentsha-advances-only-transitively` — source: `related-deferrals.md`, OPEN. It overlaps retry derivation. Review separately if counter identity proves unreliable; this plan should reuse the existing counter policy and must not restore the removed debug bookkeeping commit.
- `363-dev-dispatch-cap-self-resettable-by-controlled-principal` — source: `related-deferrals.md`, OPEN. It overlaps status-derived attempt limits but changes the authority used for a security/cost bound. Keep that counter-architecture decision outside a display-only change.
- `397-ship-lane-reconciler-for-depth-1-queue-eviction` — source: `related-deferrals.md`, TRIAGED. It overlaps workflow lifecycle visibility, but queue recovery is independent of completed-step progress. Keep it as a separate workflow-recovery feature.

The search returned no other related issue. Closed context entries are historical cautions, not scope-expansion candidates; this feature's two own exclusions are already represented in Out of Scope.
