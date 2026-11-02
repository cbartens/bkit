<!-- bkit:anchor
baseSha: fbc338ac6ab4f5ef01f489fc276dc7e2dff92284
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS

<!-- verdict:end -->

# Design: Append routine workflow step updates to one comment per run

> [!CAUTION]
> **Purpose:** Define consolidated workflow progress, delivery recovery and tracker boundaries for this feature.
>
> **Rules:**
>
> - Follow the owner decisions recorded under Decisions, including best-effort comments that never fail the workflow.
> - Keep implementation in the existing shared tracker posting path.
> - Preserve the engine's original section text and the agent's create-only fallback.

## Related Issues

None. The related-issue search returned only the current issue.

## Acceptance Scenario

The owner accepted the final-preflight chronology boundary, possible duplicate reports after uncertain delivery, all-three-tracker scope and the verification work described below. The later controlling clarification makes commenting best effort: try to append to the latest eligible engine-owned progress comment; if that is unavailable or fails, try a new comment. If commenting still fails, record friction best effort and continue the workflow. Lost or duplicate comments are acceptable occasional outcomes. Comment transport, source state, receipts, locks, reconciliation and failure logging cannot fail or block a workflow. Verification requirements govern implementation evidence, not the success of an individual workflow's comment delivery.

### Narrative

I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, bkit tries a new comment and keeps the workflow moving; a missing or duplicate report does not stop my work.

### Success Criteria

1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and delivery succeeds without fallback or an intervening comment: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each attempt a separate new comment; exact retries are deduplicated when existing evidence permits.
3. Before an append edit, the engine establishes that its own target is the newest created comment and still matches its saved revision evidence. An intervening comment, external edit or inconclusive check sends the current report to a new comment; the remaining read/write race is accepted.
4. Identical reports are deduplicated where saved receipts or bounded marker lookup establish prior delivery. Failed or uncertain append attempts fall back to a new comment. If all comment attempts fail, friction is recorded best effort and the workflow continues successfully with respect to commenting.
5. GitHub, Linear and Jira use their verified comment budgets, sections show their original UTC time when available, and auto and its dispatched phase own separate progress state. Missing or invalid comment state and tracker edit-notification limitations are diagnosed without stopping the workflow.

### Key Edge Cases

- Someone posts or edits a comment between the final read and the write; local serialization cannot make those provider actions atomic.
- A request succeeds remotely before its acknowledgment is saved locally.
- A comment reaches its size budget, or one section itself needs multiple parts.
- A step retries with identical or changed output, a workflow resumes, or durable source state is missing.
- An agent posts a fallback comment, a comment is deleted, or a tracker cannot expose adequate identity / revision evidence.

### Process Sketch

WHEN a workflow starts → THEN its own progress comment opens.
WHEN a routine report arrives → THEN it appears once in the eligible progress comment with its original time.
WHEN the eligibility check sees another comment, an external edit or a size overflow → THEN only new progress starts another segment.
WHEN an acknowledged report repeats → THEN the existing delivery is returned.
WHEN an append fails or its outcome is uncertain → THEN a bounded check may establish prior success; otherwise bkit attempts a new comment.
WHEN all comment attempts fail → THEN bkit records friction best effort and continues the workflow.
WHEN attention is needed or the workflow ends → THEN a separate comment appears.
WHEN auto dispatches a phase → THEN that phase opens separate progress state.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Shared posting and policy | `.bkit/core/engine/commands/workflow/tracker.ts`: `postForVerb`, `postCommentOnce`, `trackerTarget` | EXTEND | Callers already converge here. Classify reports and choose create/update centrally. |
| Stable report identity and completion receipt | `ledgers/status.ts`: `actionKey`, `actionHash`, `alreadyDone`, `recordAction`; `tracker.ts`: `runActionKey`, `endedRunActionKey` | EXTEND | Preserve key-plus-body semantics and use available receipts, section identities and comment references for best-effort duplicate suppression. |
| Generated marker and standalone body file | `stampMarker`, `markerHashOf`, `writeBodyFile`, `commentFileOf` | EXTEND | Keep the first-line generated marker and the exact standalone fallback body; add section and revision evidence below it. |
| Exact source retention | Existing run artifacts under `docs/plans/{YYYYMM}/logs/{FID}/`; existing Git-common outbox for bootstrap | EXTEND | Keep the engine-authored aggregate in a small progress-state cache. Missing state starts a new comment; remote Markdown never becomes the outgoing source. |
| Local publication serialization | Workflow-lock primitives in `commands/workflow/locks.ts` | EXTEND | Reuse exclusive creation / ownership checks for a narrow delivery lock. A long-lived workflow lock alone does not serialize separate CLI processes. |
| Tracker creation, inspection and editing | `postComment`, `recentComments`, GitHub `gh`, Linear GraphQL and `JiraSession` | EXTEND | Add stable IDs and metadata to the existing transports and an edit operation. Do not introduce a messaging service or runtime dependency. |
| Body limits and continuation parts | `splitAt`, `JIRA_COMMENT_LIMIT` | EXTEND | Centralize all three provider budgets and retain deterministic per-part receipts. |
| Operator diagnostics | Existing prefixed stderr, `TrackerOutcome`, status records | EXTEND | Expose append, new-comment fallback, dedupe and lost reports using existing CLI output and best-effort friction records. |
| Cross-provider mutation contracts | [GitHub comment update](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment), [Linear GraphQL](https://linear.app/developers/graphql), [Rovo supported tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) | EXTEND | GitHub documents ID-based updates; Linear supports schema introspection; Rovo documents an add/edit comment tool. These establish transport directions, not an atomic newest-comment predicate or every required field. |

The repo sweep covered `tracker.ts`, its comment callers in `issues.ts` / `steps.ts`, `ledgers/status.ts`, the lock primitives and the committed capability map. No existing progress-aggregation or per-section delivery implementation was found in the engine text search. The language server rejected the ignored worktree path, so bounded source reads supplied symbol evidence. Node's filesystem and crypto facilities and the current transports cover the required primitives; no dependency addition is proposed.

## Architecture

### Shared publisher and nonfatal boundary

Extend `postForVerb` / `postCommentOnce` with one best-effort delivery policy. Report builders continue to produce the current standalone section. The publisher receives structured workflow, verb, step, group and attempt identity from `RunContext`, flags and existing action keys; it never classifies by display title.

The classification order is:

1. No issue or tracker: retain the existing skip result.
2. Decision Pause, failure, handover or final close / Create PR: attempt standalone creation with available duplicate suppression.
3. Recognized routine report in an identified workflow invocation: try the latest eligible engine-owned progress comment, then a new comment if appending is unavailable, failed or uncertain.
4. Missing or ambiguous workflow ownership: attempt a standalone new comment with a diagnostic.

Start Workflow opens progress on a successful create. Dispatch is routine within auto's own invocation. Auto and the dispatched phase own separate progress state. Intermediate summaries are routine; the final artifact / PR handoff is standalone at the existing posting point.

The complete comment path is nonfatal. Catch comment-specific errors at the shared posting boundary, including report preparation, state reads/writes, receipt handling, lock operations, inspection, transport, reconciliation and diagnostics. Return a failed or uncertain tracker outcome for fallback without turning the step verdict into failure. Preserve failures from the step's actual work; this rule does not swallow unrelated command errors.

The agent fallback remains create-only: when `tracker.done: false` and a body is available, attempt the printed standalone `commentFile` as a new comment. Bound that attempt and continue if it fails. Update every workflow's comment and gate wording together so a failed MCP comment never routes a successful step into Failure Path. The engine never edits a human comment, and agents never edit prior tracker content.

### Progress source and run ownership

Keep a small, replaceable progress-state record in the existing Git-common outbox, keyed by the exact tracker target and explicit workflow invocation. It holds the active comment identity, the engine's exact aggregate body, known section identities and available revision evidence. Use atomic replacement where practical, but a cache error invalidates append eligibility and sends only the current standalone report to a new comment. There is no requirement to save every historical aggregate, journal every prepared mutation or commit comment state before a workflow can proceed.

Pass explicit session invocation context to fileless Start Workflow and Dispatch calls. Reuse the same opaque invocation ID throughout that workflow run; bind it to the status path/run number when available. Auto retains its own invocation and the phase receives a new one. A conflicting association, missing session, cleanup or fresh clone starts fresh progress rather than guessing another run's comment. Normal session/worktree cleanup and workflow close do not wait for comment receipts or carry a pending-delivery obligation.

Keep only engine-authored text as outgoing source. Jira's returned formatting must never be read back and re-sent as historical content. Missing or corrupt source, unsupported state versions, target mismatch or external edits invalidate the old cache; retain its URL when available and start a new comment for the current report. Older sections may be unavailable locally after state loss; occasional lost retry evidence and duplicate reports are accepted.

One active publisher per invocation remains the operating assumption. Reuse a narrow local ownership-aware lock where available. A lock failure or inconclusive owner check skips append and tries standalone creation; it never blocks the step or authorizes overwriting another process's state. No cross-machine service or persistent pending-delivery queue is introduced.

### Provider boundary

Extend the existing adapters with stable comment identity, URL, author identity, creation ordering and useful revision evidence. Inspect the newest created comment, using bounded pagination only when required. Sorting by modification time is invalid. An eligible append target belongs to the exact invocation and tracker target, is still newest at the final check, and matches the engine's saved ownership and revision evidence.

Retain a fingerprint of a stable returned body representation when available, separately from the outgoing source. Before an edit, require the same comment identity, author, representation fingerprint and any useful revision token. Markers locate reports but do not prove unchanged content; a human can edit non-marker text. Missing or unstable evidence, unknown normalization or changed content sends the current report to a new comment. Do not mutate a comment merely because it contains a bkit marker.

GitHub keeps the authenticated `gh` transport; Linear keeps GraphQL; Jira keeps `JiraSession` and Rovo MCP. No new SDK, service or Jira REST credential path is introduced. Each adapter uses verified body budgets and complete-body counting, including markers and timestamps. Unsupported edit contracts use new-comment behavior and a friction record; they never fail a running workflow.

### Provider verification matrix

The matrix distinguishes public contracts from the read-only spike. Complete the provider evidence as implementation verification before claiming consolidation support. Missing credentials, inconclusive reads or unverified behavior do not become runtime workflow gates.

<!-- prettier-ignore -->
| Tracker | Evidence already available | Remaining implementation evidence |
| --- | --- | --- |
| GitHub | Existing create/read transport and official ID-based update; the spike observed stable IDs, author, creation/update times, ascending creation order, unchanged returned Markdown and generated h6 markers. | Create/edit/read round trip, external edits, new section markers, multi-page ordering, lost responses and header-inclusive ASCII/non-BMP boundary accounting. The issue specifies 65,536 characters. No issue-wide newest predicate is documented. |
| Linear | Existing GraphQL create/read; the first-party schema establishes `commentUpdate` and `CommentUpdateInput.body`. | Authenticated disposable-target update/read, stable IDs/order/representation, markers, pagination, external edits, numeric body limit and counting unit. No `BKIT_LINEAR_API_KEY` was available in the spike. Do not use internal `skipEditedAt` as a notification contract. |
| Jira | Existing `JiraSession`; the official Rovo catalog names add/edit and paginated comment listing. The existing budget is 32,767. | Discover deployed schema/IDs; verify transformed representation, h6 markers, external-edit detection, ordering/pagination, exact body counting and lost responses. No `BKIT_JIRA_API_KEY` was available in the spike. Project schemes may notify on edits. |

Record verified fields and limitations beside each adapter capability and in the tracker interaction catalog. All three adapters remain in scope. New-comment fallback is acceptable runtime degradation; it does not prove an adapter's consolidation tests passed. Notification limits remain disclosed.

## Data Model

Use the existing action identity and receipt mechanisms where they help. No new public configuration surface is required.

<!-- prettier-ignore -->
| Record | Fields and meaning |
| --- | --- |
| Progress state | Version, workflow invocation, target fingerprint, active comment ID/URL, exact engine-authored aggregate, known section identities, available author/revision/returned-representation fingerprint. |
| Section identity | Existing action key or equivalent structured purpose plus original-body hash, original UTC time when first available, and optional continuation part identity. |
| Existing success receipt | Existing action key/body hash and comment reference, written best effort after acknowledged delivery. Missing receipts may cause a duplicate and never fail the workflow. |
| Tracker outcome / friction | Attempted append/create, success/uncertainty/failure, redacted reason and known URL. Failure recording is itself best effort. |

Hash the original report before adding timestamp or continuation labels. The same action and body identify an identical report; changed output is appended as a new version when possible. Preserve existing first-line `###### bkit:generated {aggregateHash}` and use per-section h6 markers such as `###### bkit:section v1 {sectionId} {part}/{parts}` for bounded duplicate lookup. Every outgoing body is built from the engine's own cached source plus the current report.

## Components / Flows

### Routine delivery

1. Build the standalone current report and stable identity. Keep `comment` / `commentFile` unchanged for the create-only fallback. If even preparation fails, record friction best effort and return control to the workflow.
2. Use existing receipts or a bounded marker lookup to skip a clearly delivered identical report. Missing evidence does not create a recovery gate.
3. Resolve explicit invocation/cache state and attempt the short local lock. If either is unavailable, skip append and try a new comment.
4. Check the latest comment immediately before an edit. Append only to the eligible engine-owned progress comment, within its complete-body limit. External comments/edits, missing ownership evidence or size overflow select a new comment.
5. On failed or uncertain append, optionally use a bounded read to recognize success. If success is not established, attempt a standalone new comment with the current report. Duplicates are acceptable; do not wait for a pending operation to settle.
6. Save successful comment identity, aggregate source and existing receipt best effort. If all attempts fail, emit a diagnostic and append a friction row best effort, then continue the workflow.

A positively acknowledged write remains successful if postflight inspection or local cache/receipt persistence fails. Invalidate future append eligibility when evidence is unavailable. Do not turn that local failure into an unnecessary resend.

### Bounded attempts and failure handling

Keep the existing shorter transport timeouts. One comment-publication invocation has at most a 60-second network budget, including reconciliation, rate-limit waits and new-comment fallback, and at most 10 pages of 100 comments. Reserve enough of the budget for the new-comment attempt; abandon optional lookup when it would consume that opportunity. Use at most three transport attempts in total. No ambiguous append is retried as another append without a conclusive read; choose a new comment instead when uncertain.

Wait at most 30 seconds for a local append lock. Refusal, inconclusive same-host ownership or a remote-host lock skips append. Reclaim only a proven-dead owner under the existing ownership-aware mechanism; age alone never authorizes recovery. Release an owned lock in a finalizer. Lock acquire/release errors are comment diagnostics and cannot fail the step.

<!-- prettier-ignore -->
| Comment outcome | Required behavior |
| --- | --- |
| Clearly acknowledged identical report | Return its prior URL; no new write. |
| Eligible latest engine-owned progress comment | Try appending from the engine's source copy. |
| Human reply/edit, unavailable cache/lock, unsupported edit or size overflow | Try a new comment containing only the current report. |
| Failed or uncertain append | Use only a bounded success check, then try a new comment if success remains unknown. |
| New-comment attempt also fails | Record friction best effort and continue; an occasional lost comment is acceptable. |
| Successful remote write, failed local receipt/cache or postflight read | Keep the known success; invalidate append state as needed and record friction best effort. |
| Failed friction append or diagnostic write | Emit a brief redacted warning when possible and continue; do not recursively log or fail the workflow. |
| Independent decision/failure/handover/terminal report | Attempt its own new comment immediately; prior routine uncertainty cannot block it. |

The tracker outcome can remain `done: false` when no delivery is established, while the workflow's substantive step still passes. Agent fallback attempts are bounded and nonfatal too. Every workflow gate checks that commenting was attempted, not that it succeeded.

### State cleanup and diagnostics

Retain the active aggregate source and small identity cache only while useful. Exact retries reuse existing hashes and receipts when available. State cleanup, missing source or a fresh clone can start a new progress comment; no historical snapshots, post-close acknowledgment journal or fresh-clone reconciliation protocol is required to keep the workflow moving. Normal cleanup never waits for comment recovery.

For each exhausted comment problem, best-effort append a `friction` row through `bkit ledgers append`, with orchestrator author fields, stable recurrence key, redacted reason, phase and known URL. Cover append/create transport, cache, receipt, lock and reconciliation failures. The engine may perform this shared logging, and the orchestrator handles a failed MCP fallback similarly. Never log raw bodies, credentials or personal data. A failure to record friction produces a warning when possible and then stops that logging attempt.

Reuse existing tracker results and prefixed stderr to show append, new-comment fallback, dedupe, uncertainty and lost-report outcomes. Do not add a hosted metrics system, a new delivery ledger or a requirement to persist a counter before continuing.

### Limits and parts

Use the verified GitHub/Jira budgets and establish Linear's actual numeric budget and counting unit. Measure the entire submitted body, including first-line/section markers, timestamps and continuation headers. When appending would overflow, start a new comment with only the current report. If one report exceeds a verified budget, extend the existing splitter with deterministic Unicode-safe parts and exact header accounting.

Use available part receipts to avoid repeating acknowledged parts. A part failure gets the bounded new-comment fallback; exhausted failures are logged best effort, and remaining publication work does not block the workflow. Tests must document partial-loss/duplicate behavior instead of claiming unconditional exactly-once multipart delivery.

### Documentation and compatibility

Clarify the shared workflow clause: the engine may edit only its own eligible progress comment; agents post the standalone `commentFile` verbatim as a new comment. Routine append failure uses new-comment fallback, and commenting problems never trigger Failure Path or change a substantive step verdict. Update every provider block, the shared clause, interaction catalog, workflow catalog, CLI result contract and rendered host mirrors together.

Existing comments need no rewrite or migration. Existing success receipts continue to suppress known exact repeats. Old runs without usable state start a fresh progress comment. The manual Tracker work comments rule remains outside this feature. Provider contract, lost-response and lifecycle tests must exercise nonfatal degradation, bounded fallback and continuation after cache/receipt/lock/friction failures.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Extend the existing shared publisher with an exact aggregate source cache and available success receipts. | Per-verb posting policy; reconstruct outgoing text from returned Markdown. | Keeps one code path and avoids Jira formatting round trips while allowing a new comment when state is unavailable. |
| Use original body plus structured action identity for best-effort deduplication. | Timestamp hash; step number alone; unconditional exactly-once delivery. | Stable evidence suppresses known duplicates; lost evidence must not stop the workflow. |
| Preserve prior report text and append changed output as a new section where possible. | Replace an earlier section silently. | Existing sections may already have been read. |
| Keep Q1 separate auto / phase ownership, Q2 disclosed notification limits and Q3 the qualified two-comment outcome. | Shared auto/phase comment; universal silence; absolute two-comment cap. | The owner accepted those recommendations. |
| Accept newest-at-final-preflight with local serialization and postflight detection. Decision: `826-newest-at-final-preflight` in `docs/decisions.jsonl`. | Require literal global chronology or claim provider atomicity. | The owner accepted the remote read/write race; unavailable lock or revision evidence uses a new comment. |
| Accept possible duplicates after bounded reconciliation followed by new-comment fallback. Decision: `826-uncertain-write-fallback-duplicates` in `docs/decisions.jsonl`. | Block until unconditional exactly-once delivery is proven. | The owner accepted duplicate risk, and the later clarification requires workflow continuation. |
| Retain all three trackers and require authenticated disposable-target contract evidence for implementation acceptance claims. Decision: `826-three-provider-contract-evidence` in `docs/decisions.jsonl`. | Narrow the requested tracker scope. | Provider verification remains required work; unavailable evidence never becomes a runtime comment gate. |
| Require bounded lost-response probes and reconciliation/fallback fixtures. Decision: `826-lost-response-recovery-evidence` in `docs/decisions.jsonl`. | Claim recovery passed from the read-only spike. | Verify bounded success recognition, new-comment fallback and workflow continuation when delivery remains uncertain. |
| Require lifecycle fixtures across restart/adoption, auto transfer, post-close response loss, cleanup and fresh clones. Decision: `826-lifecycle-persistence-fixtures` in `docs/decisions.jsonl`. | Leave those boundaries untested. | The later clarification permits fresh comments and occasional loss/duplicates, so fixtures verify safe nonfatal degradation rather than mandate durable exactly-once recovery. |
| Use one active publisher per invocation and roll over on unavailable source or conflicting revision evidence. Decision: `826-single-active-publisher` in `docs/decisions.jsonl`. | Add a shared remote coordination service. | Fits the CLI model; uncertain ownership never authorizes editing foreign content. |
| Make all commenting best effort: eligible append, then new comment, then best-effort friction and continue. Decision: `826-commenting-best-effort-never-fails-workflow` in `docs/decisions.jsonl`. | Fail or block a workflow on comment delivery, locks, source, receipts, recovery or failure logging. | This later owner clarification controls earlier conflicting guarantees; occasional lost or duplicate comments are acceptable. |
| Retain h6 section markers, original timestamps and exact source separate from returned-representation evidence. | HTML comments; aggregate hash alone; returned Markdown as source. | Supports available duplicate detection and safe append eligibility without turning missing evidence into a workflow failure. |
| Keep separate attention/terminal creation and agents' create-only fallback, both nonfatal. | Hide attention reports in progress; require agents to edit prior comments. | Preserves visible attention reports and the existing agent boundary while following the best-effort rule. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Small progress-source cache, available receipts and bounded append/new-comment fallback | KEPT | Satisfies the owner's best-effort behavior with the existing shared posting path. |
| Durable prepared/acknowledged delivery journal, historical aggregate snapshots and pending-operation gates | REJECTED | Adds recovery and lifecycle obligations that conflict with continuing after commenting problems; occasional loss and duplicates are acceptable. |
| Reconstruct outgoing progress from remote comment Markdown | REJECTED | Jira transforms returned text, so repeated edits can damage previous sections. |
| Per-verb aggregation or a new remote coordination service | REJECTED | Duplicates the shared publisher or expands deployment beyond the requested CLI feature. |

## Trade-offs Accepted

- The owner accepts occasional missing or duplicate comments. Bounded delivery and workflow continuation take precedence over unconditional delivery guarantees.
- An eligible engine-owned progress comment receives a best-effort append. Human replies/edits, missing source, lock trouble, unsupported editing or an uncertain append can produce another comment.
- The engine retains its own aggregate source for ordinary appends. State loss can reset progress and duplicate detection without requiring a durable journal or historical snapshots.
- A final eligibility check and postflight detection cannot make provider creation and editing atomic. The owner accepted that race.
- Consolidation reduces clutter even where provider or project notification rules still send notifications on edits.
- Friction logging is best effort too. If it fails, a brief warning is sufficient and the workflow continues.

## Risks & Open Questions

No unanswered owner questions remain.

### Remaining verification requirements

- All three adapters remain in scope. The read-only spike established only the recorded metadata prerequisites. Complete authenticated disposable-target create/edit/read, normalization, external-edit detection, pagination and exact size-boundary evidence as implementation verification. The spike lacked Linear/Jira credentials; report missing evidence honestly while allowing running workflows to use best-effort new comments.
- Lost-response tests must exercise bounded success recognition, new-comment fallback, possible duplicates, exhausted delivery and workflow continuation. The read-only spike did not prove those outcomes.
- Lifecycle fixtures must cover restart before/after run association, auto worktree transfer, post-close response loss, session/worktree cleanup and fresh clones. Missing state must safely start new progress without blocking the workflow.
- Verify that cache, receipt, lock, transport, reconciliation and friction-recording errors are contained within commenting. Independent decision/failure/handover/close reports must still be attempted, and substantive step failures must retain their existing meaning.
- Local locks do not coordinate different machines. Test conflicts conservatively: skip append and attempt a new comment rather than overwrite uncertain foreign content.

## Suggested Workstreams

### WS-1: Tracker contracts and acceptance boundaries

#### Scope

Extend existing GitHub, Linear and Jira adapters with typed create/edit/inspection results, stable target/comment/author identity, creation ordering, bounded pagination and available returned-representation/revision evidence. Establish complete-body counting and provider limits, h6 marker behavior and notification caveats. Keep the selected transports and zero-runtime-dependency boundary.

Apply the owner-approved final-preflight race and possible duplicate/loss boundaries. Keep all three trackers in scope and collect authenticated contract evidence as implementation verification. Missing or unsupported comment capabilities select best-effort new-comment behavior at runtime.

#### Requires

[]

#### Rationale

One adapter boundary interprets provider ordering, ownership, edit eligibility and body limits for the shared publisher.

### WS-2: Run ownership and progress source state

#### Scope

Extend existing invocation/action context and Git-common outbox helpers with a small versioned active-progress cache containing the exact engine aggregate, target/invocation, comment identity, available revision evidence and section identities. Use existing receipts for known duplicates and atomic state replacement where practical.

Pass explicit ownership through fileless startup/auto calls and normal run association; keep auto and its dispatched phase separate. Missing/corrupt state, failed association, cleanup and fresh clones start fresh comments. Keep cache, receipt and lock failures nonfatal. Do not add historical aggregate snapshots, durable pending operations or post-close acknowledgment journals.

#### Requires

[]

#### Rationale

The engine needs its own source for safe appends and enough context to avoid editing another run's comment. Best-effort fallback removes the need for a durable delivery subsystem.

### WS-3: Shared progress publication and bounded fallback

#### Scope

Extend `postForVerb` / `postCommentOnce` with central routine/attention classification, available duplicate suppression and eligible latest-comment appending. Failed, uncertain or unavailable append selects a new comment containing the current report. Preserve exact standalone `comment` / `commentFile` payloads.

Contain all comment-specific failures, bound network/lock/read attempts, reserve a new-comment fallback opportunity and release owned locks best effort. Positively acknowledged delivery stays successful after cache/receipt/postflight failure. Exhausted publication logs friction best effort and returns control without changing the substantive step verdict. Prior routine uncertainty cannot block independent attention or terminal reports.

Extend the existing splitter for verified complete-body budgets and Unicode-safe parts. Use available part receipts without claiming unconditional delivery.

#### Requires

[WS-1, WS-2]

#### Rationale

Classification, safe append and nonfatal fallback form one shared posting behavior across every workflow.

### WS-4: Workflow integration and compatibility documentation

#### Scope

Pass only missing invocation context through existing callers. Clarify engine-owned progress updates versus agents' verbatim create-only fallback. Update source clauses, all provider/workflow fallback blocks and gates, interaction/capability catalog, workflow catalog, CLI result contract and rendered host mirrors together.

Make engine/MCP comment attempts, receipt/state/lock handling and best-effort friction explicitly nonfatal. Keep substantive workflow errors and Failure Path reports meaningful. Preserve issue-less behavior, existing receipts and the separate manual Tracker work comments rule. Document notification caveats, occasional lost/duplicate reports and state-reset behavior.

#### Requires

[WS-2, WS-3]

#### Rationale

Every caller and agent must interpret failed comments consistently so a successful step cannot be failed by a fallback or diagnostic error.

### WS-5: Commenting acceptance and failure-continuation evidence

#### Scope

Verify the complete best-effort Acceptance Scenario through existing tests and workflow fixtures: central classification, normal two-comment outcome, known duplicates, changed reports, timestamps, replies/edits, remote races, cache loss, size limits, partial parts, lock failures and bounded reads/retries.

Complete authenticated disposable-target provider contracts and lost-response probes where credentials/targets are available. Cover restart/run association, auto transfer, close response loss, cleanup and fresh clones. Fault-inject every comment boundary, including receipts and friction logging, and assert that workflow work continues with the intended substantive result. Confirm attention/terminal comments are attempted independently, fallback bodies stay verbatim and logs redact secrets.

Unavailable live evidence remains reported verification work; it does not authorize fabricated passes or introduce a runtime delivery gate.

#### Requires

[WS-1, WS-2, WS-3, WS-4]

#### Rationale

The observable behavior includes successful consolidation and continued workflow execution when any part of commenting fails.

## Suggested Plans

### P-1: Consolidate workflow progress with best-effort commenting

#### Deliverable

Ship one shared progress-comment path across GitHub, Linear and Jira: append to the latest eligible engine-owned comment when possible, try a new comment when append is unavailable or fails, and record friction best effort before continuing after exhausted delivery. Use the engine's own source cache and available receipts without durable pending-delivery gates. Preserve separate attention/final reports, create-only agent fallback, bounded operations and synchronized workflow documentation.

Apply all seven recorded owner decisions, with the later best-effort clarification controlling earlier conflicting delivery guarantees. Include provider, lost-response and lifecycle tests that prove safe degradation and continuation. Design approval does not claim unavailable live evidence passed.

All five workstreams belong to one release and rollback unit. Adapters and source state support the shared publisher, workflow integration makes fallback nonfatal on every host, and verification proves that behavior. No workstream is an independent requested deliverable.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5]

#### Requires

[]
