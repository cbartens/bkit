Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

The review covers the accepted interview input and `design-v1-draft.md`. The existing operational stack is CLI stdout / stderr and committed run records, with no hosted metrics or tracing service (`docs/observability.md` § Scope). A new hosted service is unnecessary for this feature.

<!-- prettier-ignore -->
| Flow | What fails | Detection and recovery in the design | Blast radius |
| --- | --- | --- | --- |
| Invocation and bootstrap adoption | Session identity is missing, stale or associated with another completed run. | Target / workflow / FID matching prevents adoption; ambiguous ownership uses standalone posting with a diagnostic. | One invocation loses consolidation; no other run's comment is intentionally edited. |
| Durable source and projection | A source file is absent, a record has an unsupported version, or preparation / acknowledgment persistence fails. | Seal the affected segment; never reconstruct from remote Markdown. Prepared evidence supports reconciliation after remote success. | One invocation's delivery state; accumulated artifacts also consume checkout and repository storage. |
| Local serialization | A publisher crashes while holding the new lock, another process contends, or a second machine publishes stale state. | Local ownership checks are proposed; cross-machine conflicts are an explicit open question. Wait bounds and stale-lock recovery are unspecified. | One target / invocation stalls or receives extra progress segments. |
| Eligibility inspection | Authentication, rate limiting, transport failure, missing metadata or partial pagination prevents identifying the newest comment and revision. | Failed reads return failure for the existing fallback and never authorize an edit. Adapter acceptance requires adequate evidence. | One tracker target, or every run using the affected credential / provider. |
| Concurrent remote changes | A human posts or edits after preflight; a different machine changes the target. | Preflight rejects observed interference; postflight detects some races and seals the segment. The remaining race is explicit and requires owner confirmation. | One issue's ordering or the raced comment's content. |
| Remote mutation | A create / edit fails, succeeds before a timeout, or succeeds before the local acknowledgment is saved. | Durable preparation, stable markers and reconciliation avoid blind retries. Unresolved outcomes retain uncertainty and use the unchanged fallback contract. | One report may be absent or duplicated; a provider outage affects all active runs on it. |
| Postflight inspection | The mutation is acknowledged, but the additional inspection fails or cannot establish ordering. | The design says to inspect and seal on observed interference, but does not define the result when the inspection itself fails. | One successfully delivered report can be misclassified, potentially triggering an unnecessary fallback. |
| Body budgeting and multipart delivery | Encoding exceeds a provider limit, one section is oversized, or only some parts publish. | Complete-body measurement, deterministic Unicode-safe parts and per-part acknowledgments resume from the first unacknowledged part. | One report / segment; repeated retries can add requests and notifications. |
| Notifications and fallback | Jira / project rules notify on every edit, or an unresolved operation causes repeated standalone fallback posts. | Notification limits and possible duplicates are disclosed. The draft does not define how recurring degradation is counted or summarized for the operator. | Watchers of one issue; a shared outage can affect watchers across runs. |

The critical content-preservation paths fail conservatively on missing source, mismatched ownership and failed eligibility reads. The draft does not claim atomic ordering or unconditional exactly-once delivery, and leaves those acceptance changes for the owner.

## Observability Coverage

<!-- prettier-ignore -->
| Failure modes | Logs | Metric / counter | Correlation |
| --- | --- | --- | --- |
| Identity, source corruption and projection failure | Redacted outcome and reason are required; use the owning `[bkit-<noun>]` stderr prefix. Exact reason vocabulary is unspecified. | No explicit occurrence counter or per-run summary is defined. | Invocation, section and operation IDs are sufficient if emitted together. |
| Lock contention and cross-machine conflict | Generic outcome requirement can cover them, but the draft does not name lock wait / owner / stale-lock diagnostic fields. | No wait, refusal or reclaim count is defined. | Target fingerprint and invocation ID can join local records; another machine needs the same invocation association. |
| Eligibility, provider mutation and uncertain delivery | Operation, segment, rendered length and reason are specified. Raw bodies and tokens are excluded. | Durable preparation / acknowledgment / uncertainty records can support counts, but no stable event schema or counting rule is committed. | Operation ID is an adequate lightweight trace substitute across local records and provider identity / URL. |
| Postflight failure | Failure logging and result semantics are not specified. | No separate acknowledged-write / failed-postflight counter is defined. | The acknowledged operation ID exists and should remain the correlation key. |
| Rollover, oversized bodies and partial parts | Segment, section count and rendered length are specified; reason can distinguish normal rollover from failure. | Per-part records provide raw evidence, but retry / rollover / partial-success totals are unspecified. | Section ID and part index identify the affected report. |
| Fallback and recurring notification degradation | CLI uncertainty is specified; edit-notification limits are documented. Agent fallback success is correctly not inferred from `done: false`. | No explicit aggregation-unavailable, uncertain-delivery or fallback-requested total is defined. | Run / operation / standalone body hash can associate engine evidence without pretending to observe the agent's successful write. |

This is an addressable observability gap, rather than a need for a new service. Stable local outcome records and a per-run summary fit the existing CLI stack. None of the identified gaps requires paging or a hosted tracing backend.

## On-Call Ergonomics

The design introduces no pager alert. Operators see command output, tracker fallback reports and status records. Recovery should remain attached to that invocation and avoid broad account or repository changes.

<!-- prettier-ignore -->
| Signal | Runbook clarity | Recovery / noise assessment |
| --- | --- | --- |
| Normal rollover or acknowledged dedupe | Clear from a reason and prior URL; no human action is required. | Automatic and idempotent. Keep informational so normal segmentation does not look like an outage. |
| Authentication / scope failure | Existing reason and token name identify the dependency. | Human credential repair, then bounded reconciliation. Repeated steps should summarize the persistent condition locally instead of producing a new warning category each time. |
| Transient network / rate-limit failure | A reason exists, but retry budget and provider delay handling are unspecified. | Automatic bounded retries are appropriate; exhaustion should name the pending operation and fallback status. No page for a single transient failure. |
| Ambiguous write or receipt failure | Preparation evidence is retained, but the draft gives no concrete operator procedure or terminal disposition when remote evidence remains unavailable. | Reconciliation is idempotent when evidence is conclusive. A human must not be told to delete pending evidence or repost blindly. |
| Stale local lock | No new-lock wait / reclamation contract is stated. | Requires an ownership-aware recovery path with a deadline; a lock file alone is insufficient as an operator action. |
| Missing source or external revision mismatch | Automatic sealing protects earlier content; a new segment is understandable. | Include the old comment URL, invocation and reason so an operator can distinguish expected protection from damaged local state. |
| Chronology race observed after acknowledgment | The design seals the segment, but the warning should identify the affected comment and acknowledge that the write already happened. | Human judgement may be needed; do not delete or rewrite discussion as an automatic repair. |

All four `Risks & Open Questions` entries include lettered options, a lettered recommendation and a default. They cover the main remote-ordering, uncertain-delivery, provider-evidence and cross-machine concerns. Lock lifecycle, postflight-read failure and operational artifact growth need additional detail; these can be design rules rather than more owner questions.

## Operational Dependencies

- A tracker-delivery recovery runbook covering pending operations, acknowledgment-write failures, missing source, external edits, stale locks and safe reruns.
- A stable local delivery-outcome record / per-run summary so operators can count degraded aggregation and unresolved operations without scraping rendered comment bodies.
- Provider contract evidence for metadata, marker survival, body budgets and edit semantics, as already identified in the draft.
- A documented retention boundary for immutable source and aggregate artifacts: retain evidence needed by an active / resumable run and state what completed-run cleanup preserves.

No dashboard, hosted metric pipeline, distributed coordinator or pager alert is required by this review.

## Verdict Reasoning

`CONCERNS`: the central recovery strategy is operable within the repo's existing CLI and run-artifact model. It preserves original text, records intent before mutation, reconciles uncertain outcomes and avoids treating missing reads as absence. Provider outages remain visible and do not silently turn into authorized edits.

The remaining gaps are concrete and addressable in the reviewed design: define local counting, bound new waits and inspection, distinguish an acknowledged mutation from a failed postflight read, and give the operator a safe recovery procedure. The open owner decisions and unverified provider contracts remain visible; this review does not settle or weaken them.

## CRITICAL

None. No failure mode demonstrates that the feature requires monitoring or incident infrastructure outside the existing CLI stack. The draft's conservative ownership and source checks provide recovery boundaries; the findings below improve their operational contract.

## OPTIONAL

1. **O1 — MEDIUM: Specify durable failure counts and a compact per-run summary.** `Components / Flows` § Documentation and compatibility asks for redacted delivery outcomes but defines no occurrence counter or stable counting rule. Add structured outcomes for append, create, dedupe, rollover, conflict, failed eligibility, uncertain delivery, receipt failure and fallback requested. Count one logical operation separately from its retry attempts. Include workflow / invocation, operation, target fingerprint, segment and reason in the output. A local summary should expose unresolved operations and repeated loss of aggregation; do not claim that fallback requested proves fallback delivered. This closes the counter gaps in Observability Coverage using existing records.

2. **O2 — MEDIUM: Bound the new lock, reconciliation and comment-inspection work.** `Routine delivery` starts with a narrow lock and `Provider boundary` permits pagination, but neither gives an ownership-aware stale-lock policy, a wait deadline, or a total network / pagination budget. State how inherited transport timeouts apply, how rate-limit delay is bounded, when incomplete inspection becomes uncertainty, and what the caller receives when the budget expires. The bound should release the local lock and retain prepared evidence. Otherwise a transient tracker problem or a crashed process can leave a routine step waiting indefinitely, which is a new operational burden.

3. **O3 — MEDIUM: Keep successful acknowledgment distinct from postflight-read failure.** `Routine delivery` step 7 saves acknowledgment and then performs postflight inspection. Specify that a failed postflight read cannot convert a known successful write into `done: false` and trigger an avoidable fallback duplicate. Record a separate warning / uncertain eligibility result and conservatively seal the segment for future edits. A failed acknowledgment write remains the existing prepared-operation reconciliation case. Include the operation ID and known comment URL in either diagnostic so the operator can see what has already happened.

4. **O4 — LOW: Add an explicit recovery and retention procedure.** `Recovery and fallback` retains unresolved pending state and `Trade-offs Accepted` acknowledges more small artifacts. Specify what a later command inspects, what it can safely retry, and when an operator must leave the run unresolved rather than delete state or blindly post. Explain whether a pending routine write blocks later attention reports or whether those may proceed independently with their own evidence. Document stale-lock recovery and preserve immutable source needed for resume. Also account for repeated full aggregate snapshots when estimating artifact growth; provider per-comment limits bound each file, not the total run directory. These are operational instructions, not a request for a new configuration surface.

## OUT OF SCOPE

None. Provider API feasibility and authorization correctness belong to the other review lens; this report uses the draft's explicit contract-verification gates rather than asserting that those unknowns are solved. The owner's chronology and uncertain-delivery decisions remain open as written.
