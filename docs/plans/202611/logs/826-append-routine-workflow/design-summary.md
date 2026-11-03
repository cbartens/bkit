Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-input-2.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-grill-2.md`, `docs/plans/202611/logs/826-append-routine-workflow/design-input-2.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/826-append-routine-workflow/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/826-append-routine-workflow/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-review-1.md`, `docs/plans/202611/logs/826-append-routine-workflow/design-review-2.md` |
| design-spike | CONCERNS | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/design-v3-organised.md` |

## Suggested Plans

### P-1: Consolidate workflow progress with durable delivery recovery

Covers: WS-1 (Tracker contracts and acceptance boundaries), WS-2 (Invocation ownership and durable delivery records), WS-3 (Shared progress publication and bounded recovery), WS-4 (Workflow integration, diagnostics and compatibility documentation), WS-5 (Delivery acceptance and recovery evidence)
Requires: []


## Open Questions

- **Chronology departure from Q4:** Accept newest-at-final-preflight, with local serialization and postflight detection, as the enforceable boundary? Options: A) Accept this boundary — consolidation ships with an explicit remote race. · B) Retain the literal never-edit-after-an-intervening-comment guarantee — block editing on any adapter without verified atomic support. Recommended: A), because the documented GitHub update contract supplies no issue-wide newest predicate. Default if unanswered: B); the strict accepted guarantee remains unresolved and must not be silently weakened.
- **Uncertain-delivery departure from Q4:** Accept that an unresolved write followed by the unchanged agent fallback may duplicate a report? Options: A) Accept the disclosed exception after attempted reconciliation — preserves the required fallback behavior. · B) Require unconditional no-duplicate delivery — block the posting change until a compatible idempotent provider / fallback contract is proven. Recommended: A), because local records cannot prove a remote outcome through an outage. Default if unanswered: B); unconditional retry deduplication remains unresolved.
- **Provider contract evidence after the spike:** Linear's first-party schema settles edit support, and the read-only GitHub sample settles only the metadata prerequisites recorded in the matrix. Live mutation, normalization, external-edit detection, pagination and exact size boundaries remain unverified across the full provider matrix; the spike found no `BKIT_LINEAR_API_KEY` or `BKIT_JIRA_API_KEY`. Options: A) Retain all three adapters in scope and require authenticated disposable-target contract evidence before their consolidation acceptance — preserves the requested outcome without claiming a pass. · B) Ask the owner to narrow delivery to verified adapters and file separate work for the rest — permits a smaller release but departs from the issue. Recommended: A), because unavailable credentials do not prove that an adapter cannot meet the contract. Default if unanswered: A); each incomplete matrix row remains an acceptance blocker, and standalone fallback does not close it.
- **Lost-response recovery evidence:** The spike did not inject a lost create/edit response, so recovery is designed but unproven through the production read path. Options: A) Require a bounded mutation-and-discard probe on each accepted adapter plus implementation fixtures for reconciliation — verifies that stable identity and representation evidence survive the actual transport. · B) Ship without that evidence and disclose recovery as experimental — leaves an essential delivery claim unverified. Recommended: A), because source inspection cannot establish a remote acknowledgment lost in transit. Default if unanswered: A); no exactly-once claim or successful reconciliation result is inferred from the read-only spike.
- **Lifecycle persistence evidence:** Bootstrap/adoption and terminal ownership are specified above, but the spike could not execute mechanisms that do not yet exist. Options: A) Require implementation fixtures covering restart before/after adoption, auto worktree transfer, post-close acknowledgment loss, session/worktree cleanup and fresh-clone reconciliation — validates the selected lifecycle without implementing it during design. · B) Drop persistence across those edges — reduces work but invalidates the proposed retry/resume outcome. Recommended: A), because deterministic source and receipt ownership are necessary for the accepted resume behavior. Default if unanswered: A); the lifecycle remains unproven until those fixtures exercise the implementation.
- **Source loss / cross-machine concurrency:** Durable artifacts cover committed state, while another machine can act on stale uncommitted state and no local lock coordinates it. Options: A) Require one active publisher per invocation and roll over on missing source or conflicting revision evidence — fits the CLI workflow model. · B) Add a shared remote coordination service — expands deployment and ownership substantially. Recommended: A). Default if unanswered: A); report conflicts and never overwrite uncertain foreign revisions.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-plan #826
```

Or, to address the reasons first: `/bkit-design #826`
