Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-v1-draft.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-deferrals.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-failures.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-issues.md` |
| plan-review | CONCERNS | 6 | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-review-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-review-2.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-v2-reviewed.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-v1-draft.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-deferrals.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-failures.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-review-1.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-review-2.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-v2-reviewed.md`, `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-update-check.md` |

## Acceptance Scenario

### Narrative
Agents provide findings, evidence and judgments. The engine owns deterministic metadata, serialization, derived counts, durable operation state and safe replay.
### Success Criteria
1. **deterministic-bookkeeping-1:** Resolve workflow, step, subagent and actual model from verified invocation context before validation. Reuse the host/model capture contract of the existing issue. Keep configured model distinct from observed model. Define explicit missing/ambiguous-context handling without inventing attribution. Reject conflicting or unauthorized authorship rather than silently overwriting it.
2. **deterministic-bookkeeping-2:** Expose an engine-owned, read-only ledger query using the canonical parser/folder, with key/status filters, deterministic timestamp/tie handling, complete paging and structured malformed-line diagnostics. Never represent unread or malformed content as an empty/clean scan. Route prompts through it instead of bespoke Python/jq helpers.
3. **deterministic-bookkeeping-3:** Provide an engine-owned artifact serializer/envelope and compute redundant totals/booleans from structured findings where the contract is deterministic. Preserve evidence-dependent judgements and special verdict rules as explicit inputs. Validate that the envelope agrees with the body before completing the step, without a model round trip for formatting alone.
4. **deterministic-bookkeeping-4:** Bind commands to an explicit durable run/invocation identity, and derive registered step metadata and paths there. Resolve ambiguity explicitly when multiple runs/worktrees exist; validate overrides and scope. Cover start, resume, no-plan conversion, task groups, remediation and ship's bookkeeping root. Do not assume the most recent global run is the caller.
5. **deterministic-bookkeeping-5:** Persist CI handoff phase, poll observations, attempt count, cumulative errors, target head/PR/repository and retrigger identity in engine state. A poll command should record its own observation and derive the next action, preserving state across compaction/resume and preventing stale evidence from another head or run.
6. **deterministic-bookkeeping-6:** Accept structured audit findings once, then derive stable report-local IDs, severity totals, deterministic report/ledger/comment metadata and source links. Expose candidate prior-key matches, while retaining human/agent judgement for semantic equivalence, closure evidence and issue grouping. Coordinate tracker publication with the existing progress-comment issue.
7. **deterministic-bookkeeping-7:** Add scoped replay/reconciliation support for bookkeeping writes and return a durable receipt describing effects. Reuse existing engine-action primitives where appropriate. Keep a deliberate same-key update distinct from replay; do not deduplicate all same-key or equal-content events globally. Inspect uncertain outcomes before retrying. No duplicate-write incident was reproduced in this audit.
8. **deterministic-bookkeeping-8:** Add shared wording permitting bounded correction after a guaranteed no-write rejection, engine deterministic fill first, verified continuation at the same substep and explicit reconciliation for uncertain effects. Preserve authorization, named gates, special recovery routes and finite retry accounting.
### Process Sketch
- **WHEN** the planner delegates a step **→ THEN** the engine issues an invocation ID bound to that run, step and agent.
- **WHEN** that agent submits its finding without a model field **→ THEN** verified attribution is completed, or optional model telemetry is explicitly unavailable, and the authorized finding is appended once.
- **WHEN** the same operation is retried after its response was lost **→ THEN** the engine returns the recorded receipt without another ledger event.
- **WHEN** validation rejects an input before effects **→ THEN** the corrected input can retry within the persistent two-correction budget and resume the same sub-step.
- **IF** run identity conflicts, an operation ID is reused with another payload, or write effects remain uncertain **→ THEN** the affected mutation is blocked with evidence and independent authorized work can continue.
### Concrete Example
**Setup:** A maintainer is running a plan step. The step has a verified invocation binding and permission to append a failure finding; the model source is available from the approved host/session contract.

**Steps:**

1. The agent submits the substantive finding and its engine-issued invocation/operation references, omitting repetitive attribution → the engine resolves the run, step, agent and observed model.
2. The ledger row validates and is appended → a durable receipt records the operation ID, canonical request hash and exact effect.
3. The caller loses the result and repeats the same operation → the original receipt is returned and the ledger remains one event longer.
4. A subsequent distinct finding has a missing required substantive field → validation reports no effects, the agent corrects that field within its shared correction budget, and the interrupted sub-step resumes after verification.

**Outcome:** The maintainer receives a completed plan step with one ledger event per intended write, accurate provenance and no failed workflow caused solely by the recovered bookkeeping error.
### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Missing subagent model with verified invocation data | Engine completes it and appends once; workflow continues. |
| Runtime model differs from source prompt pin | Record the authoritative runtime value and provenance; do not silently substitute the pin. |
| Unknown, conflicting or stale invocation context | Explicit unavailable/conflict result under the agreed policy; no fabricated fields or wrong-run attribution. |
| Two concurrent runs/worktrees | Metadata, counters, paths and replay identities remain isolated. |
| Malformed ledger row among valid rows | Deterministic diagnostics and explicit coverage status; no silent deletion or false clean read. |
| Findings change after a header was produced | Derived totals are regenerated or stale data is rejected; no false PASS. |
| Lost response after successful append | Reconciliation returns the original operation result without a duplicate append. |
| Legitimate later update uses the same ledger key | New update remains possible with correct lineage. |
| CI polling crosses process/turn resume | Attempt budgets and retrigger state persist, and conclusions stay bound to provider evidence. |
| Validation correction succeeds; then correction budget exhausts | First resumes the same sub-step; second enters Failure Path and preserves work. |
| Permission denial, real failed test, unknown side effect | Existing explicit policy remains enforced; generic recovery does not bypass it. |
| Audit report, ledger rows and tracker comment | Counts and identities agree from the same validated result. |
| Same operation ID with a different canonical request hash | Reject the collision before mutation; use a new engine-issued operation for a deliberate update. |
| Missing model telemetry with valid author/run binding | Record model availability and provenance without failing the authorized substantive write. |
| Invalid or missing explicit author/run binding | Block the affected mutation; optional telemetry policy does not grant authority. |
| Canonical query cursor is reused after ledger content changes | Reject the stale cursor or restart explicitly; never silently omit or duplicate folded winners. |

## Open Questions

**Open questions:** None. The six defaults in #860 are accepted. Concrete API/storage choices appear below and do not reopen them.

- **Assumption:** #836 supplies an authoritative observed host/model record when available → if absent, model availability is explicitly unavailable with provenance; no fallback prompt pin is recorded as actual execution.
- **Assumption:** #826 continues using the existing tracker posting/action contract → a change to that contract must be adapted at the existing publisher, or tracker receipt integration can diverge.
- **Assumption:** Same-checkout engine processes use the shared git-common outbox and repository files → unsupported simultaneous writers bypassing the CLI cannot receive the new replay guarantee; unexpected target changes block reconciliation.
- **Assumption:** Legacy standalone CLI users remain supported without invocation flags → removing that path would break direct administrative ledger writes and existing scripts. New managed workflow callers always pass explicit invocation context.
- **Assumption:** Additive status/ledger metadata and new local runtime receipts need no historical rewrite → evidence requiring a schema migration blocks that change for owner approval; this plan authorizes no migration.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #860
```
