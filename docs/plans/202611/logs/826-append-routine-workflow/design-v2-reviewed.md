Verdict: PASS

<!-- verdict:end -->

# Design: Append routine workflow step updates to one comment per run

> [!CAUTION]
> **Purpose:** Define consolidated workflow progress, delivery recovery and tracker boundaries for this feature.
>
> **Rules:**
>
> - Treat this document as a design proposal, with unresolved owner decisions named under Risks & Open Questions.
> - Keep implementation in the existing shared tracker posting path.
> - Preserve the engine's original section text and the agent's create-only fallback.

## Related Issues

None. The related-issue search returned only the current issue.

## Acceptance Scenario

This is the starting scenario accepted in the design interview, refined below for concurrency and uncertain delivery. The two departures from Q4 require owner confirmation before the plan treats them as settled acceptance criteria. Until then, their strict defaults apply: no consolidation edit without verified atomic chronology support, and no declaration of duplicate-free acceptance through unresolved delivery. Finishing this design records those dependencies; it does not approve the departures or certify any adapter's consolidation behavior.

### Narrative

I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, I can see that uncertainty rather than being told that delivery was exactly once.

### Success Criteria

1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and neither fallback nor an intervening comment requires another: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each use a separate new comment; exact retries of those reports are deduplicated.
3. Before an edit, the engine establishes that its target is the newest created comment and still matches its last acknowledged revision. An intervening comment or external edit detected at that check causes a new progress segment; the remaining read/write race is disclosed.
4. Re-executing an acknowledged report adds no duplicate section. Prepared writes are reconciled before retry; an unresolved remote outcome or unchanged create-only fallback is reported as uncertain and can duplicate a report.
5. GitHub, Linear and Jira stay within their verified comment budgets, every section displays its original UTC time, and auto and its dispatched phase own separate progress state. Tracker edit-notification limitations are documented.

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
WHEN a previous write is uncertain → THEN recovery checks its identity before another write and reports unresolved ambiguity.
WHEN attention is needed or the workflow ends → THEN a separate comment appears.
WHEN auto dispatches a phase → THEN that phase opens separate progress state.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Shared posting and policy | `.bkit/core/engine/commands/workflow/tracker.ts`: `postForVerb`, `postCommentOnce`, `trackerTarget` | EXTEND | Callers already converge here. Classify reports and choose create/update centrally. |
| Stable report identity and completion receipt | `ledgers/status.ts`: `actionKey`, `actionHash`, `alreadyDone`, `recordAction`; `tracker.ts`: `runActionKey`, `endedRunActionKey` | EXTEND | Preserve key-plus-body semantics and add pending delivery, section identities and comment references. Existing successful action rows remain valid evidence. |
| Generated marker and standalone body file | `stampMarker`, `markerHashOf`, `writeBodyFile`, `commentFileOf` | EXTEND | Keep the first-line generated marker and the exact standalone fallback body; add section and revision evidence below it. |
| Exact source retention | Existing run artifacts under `docs/plans/{YYYYMM}/logs/{FID}/`; existing Git-common outbox for bootstrap | EXTEND | Save engine-authored outgoing bodies beside run records. The outbox bridges pre-run posting; it is not the durable authority after adoption. |
| Local publication serialization | Workflow-lock primitives in `commands/workflow/locks.ts` | EXTEND | Reuse exclusive creation / ownership checks for a narrow delivery lock. A long-lived workflow lock alone does not serialize separate CLI processes. |
| Tracker creation, inspection and editing | `postComment`, `recentComments`, GitHub `gh`, Linear GraphQL and `JiraSession` | EXTEND | Add stable IDs and metadata to the existing transports and an edit operation. Do not introduce a messaging service or runtime dependency. |
| Body limits and continuation parts | `splitAt`, `JIRA_COMMENT_LIMIT` | EXTEND | Centralize all three provider budgets and retain deterministic per-part receipts. |
| Operator diagnostics | Existing prefixed stderr, `TrackerOutcome`, status records | EXTEND | Expose append, rollover, dedupe and uncertainty using CLI output and records. |
| Cross-provider mutation contracts | [GitHub comment update](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment), [Linear GraphQL](https://linear.app/developers/graphql), [Rovo supported tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) | EXTEND | GitHub documents ID-based updates; Linear supports schema introspection; Rovo documents an add/edit comment tool. These establish transport directions, not an atomic newest-comment predicate or every required field. |

The repo sweep covered `tracker.ts`, its comment callers in `issues.ts` / `steps.ts`, `ledgers/status.ts`, the lock primitives and the committed capability map. No existing progress-aggregation or per-section delivery implementation was found in the engine text search. The language server rejected the ignored worktree path, so bounded source reads supplied symbol evidence. Node's filesystem and crypto facilities and the current transports cover the required primitives; no dependency addition is proposed.

## Architecture

### Shared publisher

Extend `postForVerb` / `postCommentOnce` with one delivery policy and one recovery protocol. Report builders continue to produce their current standalone section. The publisher receives structured workflow, verb, step, group and attempt identity from `RunContext`, flags and existing action keys; it never classifies by a display title.

The classification order is:

1. No issue or tracker: retain the existing skip result.
2. Decision Pause, failure, handover or final close / Create PR: standalone creation with deduplication.
3. Recognized routine report in an identified workflow invocation: progress publication.
4. Missing or ambiguous workflow ownership: standalone creation, with a diagnostic explaining why aggregation was unavailable.

Start Workflow is routine and opens a segment. Dispatch is routine within auto's own invocation. Intermediate summaries are routine; the final artifact / PR handoff is standalone. A single final report is posted by the existing final posting point, rather than adding an extra terminal notification at a verb that currently only prepares return text.

### Durable run source and delivery state

Keep exact report and prepared aggregate bodies under the existing run log tree, in a `tracker-progress/{workflow}-{runId}/` artifact directory. This stores only text bkit generated and publication metadata; it does not snapshot human discussion or add a tracker ledger.

Extend the existing status action mechanism with delivery preparation and acknowledgment records referencing those bodies. Historical source files are immutable. The active segment and pending operation are a projection of these records. Use atomic local file replacement for prepared body files and append records only after the corresponding file exists.

For a pre-run Start Workflow call, `repo info`'s session directory holds an invocation manifest with an opaque ID, target fingerprint, workflow and FID. The first routine posting call receives that session directory explicitly through proposed shared invocation context. It creates the manifest once under the publication lock, and every later fileless call receives the same context; cwd, the issue's newest comment and the most recent session are never identity sources. This requires extending the common invocation resolver and the callers that currently omit session context. The session directory alone is not an already implemented resolver.

Before `workflows start` removes or supersedes bootstrap state, it copies immutable bodies into `tracker-progress/{workflow}-{runId}/`, writes an adoption record binding the invocation ID to the exact status path and run number, and commits those artifacts with the setup step. The operation is restartable: matching files and the same adoption binding are reused byte-for-byte; a conflicting target, workflow, FID or binding refuses adoption. A completed invocation cannot become a new run. Once the durable binding exists, fileless resolution uses the explicit invocation ID plus that binding, and the session manifest becomes a pointer rather than the source authority.

Auto has no ordinary phase status run in its current workflow. Its Start Workflow and Dispatch calls receive the same explicit session invocation context and store their source and receipts under the feature's log tree using that invocation ID, even without a numbered phase status run. Dispatch persists a cleanup-safe copy of that artifact bundle in the Git-common delivery area. If dispatch moves into another worktree, phase setup imports the bundle under `tracker-progress/auto-{runId}/` and commits it with setup before the bootstrap copy can be removed. The dispatched phase receives a new identity, following Q1; it archives auto's final bundle without adopting auto's publishing identity. This is context plumbing, not separate posting policy. An unassociated fileless call falls back to standalone posting rather than borrowing the latest issue comment.

For a terminal report posted after the close commit, prepare its exact standalone body, deterministic operation ID and invocation binding in the run artifact tree before that commit. The operation ID uses the target, workflow invocation, terminal purpose and original-body hash, so a later retry can resolve it from the closed run's committed manifest without a live session. After publication, save its acknowledgment in a target/invocation-keyed delivery journal under the Git-common outbox, outside the removable session directory. This journal is a recovery cache, not the sole source authority: a fresh clone reconciles the committed preparation against the provider marker before any resend. The next ordinary run-record commit may carry the acknowledgment into the artifact tree; no extra push is required solely for it. Normal session/worktree cleanup preserves the Git-common delivery journal, and cleanup failure never erases pending evidence. If the pre-close body cannot be determined at that point, move its preparation before the close commit rather than introducing an unrecorded terminal write.

### Provider boundary

Each adapter returns stable comment identity, URL, author identity, creation-order evidence, revision evidence and extracted bkit markers. Fetch only enough comments to identify the newest created comment and reconcile a known pending operation; paginate when the provider cannot answer that directly. Sorting by modification time is invalid.

The adapter also exposes create, edit, its verified encoded-body budget and whether useful conditional revision semantics exist. GitHub uses its existing authenticated `gh` transport; Linear stays on GraphQL; Jira stays on Rovo MCP with the existing token. No Jira REST credential path is introduced.

Revision equality uses an acknowledged remote representation, independently of the saved outgoing source. After a successful mutation, retrieve the recorded comment and retain SHA-256 of the exact UTF-8 bytes of its stable returned body representation, together with its representation kind, comment ID, author and any provider revision token. Before an edit, fetch through the same adapter and representation and require the same fingerprint, identity and author; require an equal revision token as well when one is available. Markers locate an operation but do not prove body equality, and update timestamps alone are insufficient. A person changing non-marker text therefore invalidates eligibility even when every marker survives. Normalization that changes across unchanged reads, an unavailable acknowledgment fingerprint, a missing field or a representation-version change makes equality inconclusive and seals the segment. The remote body is hashed in memory as evidence and is never substituted into the next outgoing body.

### Provider acceptance matrix

The matrix distinguishes public contract evidence from the read-only spike. None of these observations proves a live mutation round trip or an atomic newest-comment condition. Complete the remaining evidence on authenticated disposable issues before declaring the corresponding adapter accepted; a standalone fallback does not satisfy consolidation acceptance.

<!-- prettier-ignore -->
| Tracker | Create / edit / read contract | Identity, order and pagination | Revision and marker evidence | Body budget and notifications | Consolidation acceptance |
| --- | --- | --- | --- | --- | --- |
| GitHub | Existing create/read transport; official REST ID-based comment update. | The spike observed stable IDs, author, creation/update times, ascending creation order and a complete four-comment sample. Multi-page behavior remains to exercise. | Exact returned Markdown matched production bodies; ordinary generated h6 markers survived unchanged reads. Fingerprint comparison, new section markers and mutation normalization still need a create/edit/read probe. No documented issue-wide newest predicate. | The issue specifies 65,536 characters. Header-inclusive ASCII/non-BMP counting and boundary acceptance remain unverified. Edit-notification behavior is documented as a limitation, not measured by this spike. | BLOCKED by unconfirmed chronology default and unverified mutation, recovery and boundary evidence. |
| Linear | Existing GraphQL create/read; the first-party schema establishes `commentUpdate` with `CommentUpdateInput.body`. Edit schema availability is settled. | Stable IDs, exact creation ordering and bounded pagination through the production read path remain to verify. | Returned representation stability, external-edit fingerprinting, h6/part marker extraction and conditional revision semantics remain to verify. | Numeric comment limit and counting unit remain unknown; establish them through authoritative contract or bounded boundary evidence. Do not use an internal `skipEditedAt` argument as a notification contract. | BLOCKED; credentials and a disposable issue were unavailable in the spike. |
| Jira | Existing `JiraSession`; official Rovo tool catalog names add/edit and paginated comment listing. Discover exact deployed schemas and required IDs before use. | Stable comment/author IDs, creation ordering and pagination remain to verify. | Jira returns transformed text. Use one verified stable returned representation for fingerprints; h6/part marker extraction and revision evidence require a live round trip. | Existing threshold is 32,767; actual encoded-body/header/non-BMP counting remains unverified. Project notification schemes may notify on edits, accepted as a disclosed limitation under Q2. | BLOCKED; credentials and a disposable issue were unavailable in the spike. |

Record the accepted schema fields, representation, ordering query, counting unit and evidence version beside each adapter capability. Carry the compact capability/notification table into the interaction catalog during implementation. If a required contract is missing or unstable, report `aggregation-unavailable` and use the existing safe creation/fallback behavior while leaving that adapter's feature acceptance blocked.

A recorded comment ID, exact tracker target and known create acknowledgment establish ownership. A generated marker alone never authorizes a mutation. Remote text is evidence only; every outgoing aggregate is assembled from saved source.

## Data Model

These are proposed internal shapes, not a public configuration surface.

<!-- prettier-ignore -->
| Record | Fields and meaning |
| --- | --- |
| Invocation | Format version, opaque `runId`, tracker target fingerprint, workflow, FID when present, session association, eventual status-file / run-number binding. |
| Section | `sectionId`, existing action key or equivalent structured purpose, original-body hash, exact source-body path, first prepared UTC timestamp, routine / standalone classification. |
| Segment | Run and sequence, ordered section-part identities, exact acknowledged aggregate path/hash, provider comment ID/URL, author, last observed revision, stable returned-representation kind/fingerprint, sealed state and reason. |
| Prepared operation | Deterministic operation ID, create / edit, segment identity, expected prior revision, intended exact body path/hash, section-part identities, preparation time. |
| Acknowledgment | Operation ID, provider ID/URL, observed revision, stable returned-body fingerprint and marker evidence, acknowledged / reconciled delivery time; fingerprint may be unavailable while the mutation remains acknowledged. |
| Uncertainty | Operation ID, failed phase, redacted reason and reconciliation result; never a fabricated success receipt. |
| Delivery outcome | Version, workflow/invocation, operation ID, target fingerprint, segment, section/part count, rendered length, attempt number, outcome/reason and known comment URL; omit raw bodies and credentials. |

Use the existing action-key meaning: a repeated action key with the same original report body is the same section. The body hash is taken before adding a timestamp, segment header or continuation labels. A changed body for the same key is a new immutable report version, appended with a new section identity; previous text is preserved. New attempts / groups already differ in their structured identity.

Keep the existing first line `###### bkit:generated {aggregateHash}`. Add a versioned h6 run / segment / revision marker and a h6 section marker such as `###### bkit:section v1 {sectionId} {part}/{parts}` before each timestamped section. The design chooses visible headings to align with existing tracker markers; exact parsing must cover Markdown and Jira's returned HTML. Marker survival and unambiguous extraction must be demonstrated before that adapter is accepted.

A prepared create has a stable run/segment marker, so it can be found after a lost response. A prepared edit carries an aggregate revision marker and all new section-part markers. All parts of one report retain its original timestamp. Unsupported state versions, missing files or target mismatches seal the affected segment; they do not trigger remote-body reconstruction.

## Components / Flows

### Routine delivery

1. Acquire a narrow local lock for the target and invocation under the bounded policy below; read durable state.
2. Resolve any pending operation before accepting another operation for that invocation.
3. Deduplicate the original report identity against acknowledged sections in every segment, not only the last five comments.
4. Prepare its section text and timestamp once. Keep the printed `comment` and `commentFile` as the original standalone report.
5. Inspect the current target. Once the owner's chronology gate permits editing, edit only when the comment is still newest by creation order, belongs to the exact run and target, and matches the acknowledged fingerprint and revision evidence. Otherwise seal it and start a new segment. An unanswered strict chronology gate never silently selects editing.
6. Measure the complete outgoing body, persist the prepared operation and source bytes, then create or edit.
7. Save the returned identity/revision acknowledgment and the existing engine-action receipt. A postflight inspection records the stable representation fingerprint and detects an observed intervening comment, sealing the segment for future writes; it cannot undo a race. If this inspection fails after a mutation was positively acknowledged, retain `done: true` and the known comment URL, record `postflight-unavailable`, and seal the segment. Do not request fallback for a known successful write. An acknowledgment persistence failure retains the prepared-operation recovery case and reports the operation ID and known URL.

A failed eligibility read returns the existing failure result for fallback. It does not authorize an edit or prove that no comment exists. An unsupported edit capability can choose a fresh progress segment when creation remains safe; the capability limitation is visible rather than reported as successful consolidation.

### Bounded work and lock ownership

Use the existing exclusive-create and token ownership primitives for one delivery lock per target/invocation. Wait at most 30 seconds to acquire it, reporting holder identity and elapsed wait without credentials. Reclaim only when the recorded same-host owner process is proved dead using its process identity/start evidence; age alone, a remote host or an inconclusive process check never authorizes reclamation. Refusal returns a bounded `lock-unavailable` outcome, leaves pending source intact and does not edit a comment. Release the owned lock in a finalizer on every path.

One publication/reconciliation invocation has a 60-second network budget and at most 10 comment-list pages of at most 100 comments each. Existing transport request timeouts remain ceilings; clamp each request and rate-limit delay to the remaining total budget, never lengthen an existing shorter timeout. Use at most three read or conclusively failed transport attempts within that budget. Never automatically retry an ambiguous mutation; reconcile it first. Exhaustion before complete ordering or identity evidence returns uncertainty rather than absence. Release the local lock and retain the prepared operation. A later invocation starts a fresh bounded inspection of the same operation; it does not reset its identity or accumulated attempt history.

### Recovery and fallback

<!-- prettier-ignore -->
| Observed state | Result |
| --- | --- |
| Section already acknowledged | Return its prior URL with `deduped: true`. |
| Prepared create found remotely with matching identity/revision | Record a reconciled acknowledgment; do not create another comment. |
| Prepared edit's intended revision found on the recorded comment | Record a reconciled acknowledgment; do not resend it. |
| Known absence after a conclusive read, or recorded prior revision still current | Retry the same prepared operation only after rechecking eligibility. |
| Changed, deleted or superseded target with no pending outcome | Seal it and start a new segment containing only new sections. |
| Unresolved remote outcome | Retain pending state, return `done: false` with an uncertainty reason, and preserve the current standalone fallback payload. |
| Remote success followed by local receipt failure | Return success with the existing warning convention, retain preparation evidence, and reconcile on the next call. |
| Acknowledged mutation followed by failed postflight read | Keep `done: true` and the known URL; record `postflight-unavailable` and seal the segment so no future edit assumes eligibility. |

The unchanged agent fallback posts a new standalone comment. It can duplicate a report after an unresolved remote success, which is a stated limit requiring owner confirmation below. A later engine call reconciles marker evidence where possible; it does not retroactively edit or delete fallback comments. Successful fallback is not inferred merely because a command returned `done: false`.

### Recovery and retention procedure

On a rerun, resolve the exact invocation manifest, inspect prepared and acknowledged operation records, and verify referenced source hashes before provider reads. A matching acknowledged operation returns its saved URL. A prepared operation is inspected by its stable identity and intended fingerprint/markers; retry only after a conclusive non-delivery result or a verified unchanged prior revision and a fresh eligibility check. A partial report resumes at its first unacknowledged part. Preserve all evidence when inspection is incomplete, fingerprints disagree or the network budget expires; report the operation, target fingerprint, known URL and next safe inspection rather than instructing the operator to delete state or repost blindly.

A pending routine mutation serializes further routine publication for that invocation. Attention reports may proceed as independent standalone operations under the same short local lock after the routine attempt has released it; each has its own prepared source and acknowledgment, so an unresolved progress append cannot hide a failure, decision or handover. Any such new comment seals the previous progress segment. An uncertain attention report blocks only retries of that same report until reconciliation, with the existing fallback and disclosed duplicate risk retained.

For a stale lock, first check its recorded host/process/start identity. Automatic recovery uses only the proven-dead rule above. An unverifiable owner is a bounded refusal requiring the operator to verify that no publisher is active before an ownership-aware recovery action; there is no age-only delete instruction. For missing source or external edits, preserve the old URL and reason, seal the segment and use a new segment for new content. A confirmed remote success is never undone by deleting or rewriting discussion.

Retain immutable section source, all prepared aggregate snapshots, operation records and the invocation binding for the lifetime of a resumable run. Completed-run cleanup may remove disposable staging files and bootstrap copies only after verified adoption and with no pending delivery; committed source and manifests remain ordinary design/run artifacts. Retain the Git-common terminal delivery journal until its acknowledgment is carried into durable run artifacts or independently reconciled from committed preparation; pending journals are never removed by session/worktree cleanup. An unresolved journal remains visible in the local delivery summary even after close. Fresh clones rely on committed preparation plus bounded provider reconciliation, not on the old machine's cache.

Artifact growth includes one original body per section and one full aggregate body per prepared revision, plus small records. For a segment with cumulative body lengths `L1..Ln`, source storage is approximately the section bytes plus `sum(Li)`, not merely the provider's final comment limit; one segment can therefore accumulate quadratic snapshot bytes in its section count. Reuse an identical hash-addressed snapshot for exact retries, record the accumulated bytes in the local summary, and retain snapshots needed by pending or acknowledged reconciliation. No new retention setting, automatic history rewrite or remote cleanup service is introduced.

### Limits and parts

Use the issue's GitHub budget of 65,536 characters and the existing Jira budget of 32,767, with the provider's actual counting / encoded request semantics verified. Linear's numeric limit remains unverified; do not copy a third-party client truncation limit into the design as a provider fact.

Measure the entire submitted body, including first-line and section markers, time lines and continuation headers. If the next section does not fit, create a fresh segment without copying earlier sections. If one section exceeds the provider budget, extend `splitAt` to produce deterministic, Unicode-safe parts with exact header accounting and per-part acknowledgments. A partial multi-comment success resumes at the first unacknowledged part.

### Documentation and compatibility

Clarify the shared workflow fallback wording to bind agents explicitly: the engine may update its own run-owned progress comments through its posting API; agents still post `commentFile` verbatim as a new comment and never edit prior tracker content. Update the shared clause source, the interaction catalog, workflow catalog and CLI output contract together, then render host mirrors through the existing install process.

Existing comments need no rewrite or migration. Existing action receipts still suppress exact repeats. A resumed old run with no source state starts a new segment for new work. The manual Tracker work comments rule remains outside this feature.

Emit redacted delivery outcomes with operation, segment, section count, rendered length and reason. Reuse existing verb stderr prefixes and structured tracker results; do not add raw bodies, tokens, a hosted metrics system or a tracing dependency.

Append durable local outcomes for `create`, `append`, `dedupe`, `rollover`, `conflict`, `eligibility-failed`, `uncertain`, `receipt-failed`, `postflight-unavailable`, `aggregation-unavailable`, `lock-unavailable` and `fallback-requested`. Include workflow/invocation, operation, target fingerprint, segment, attempt, length and reason; include a known URL when available. Count one logical operation by its deterministic operation ID and count each transport attempt separately. A transition to uncertainty followed by reconciliation is one operation with both events, not two delivered reports. A compact per-run/local terminal summary reports successful operations, attempts, dedupes, rollovers by reason, recurring aggregation failures, unresolved operations and retained source/snapshot bytes. `fallback-requested` is never counted as fallback delivered. Repeated provider failures retain the same reason and expose their count rather than inventing a warning category per step.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Extend the existing publisher with durable exact bodies and prepared / acknowledged delivery records. | Outbox-only cache; active snapshot only; reconstruct from step artifacts. | Preserves original bytes and permits recovery across crash, retry and committed-run resume. |
| Keep policy centralized and pass only missing invocation context from callers. | Per-verb aggregation rules; display-title matching. | The issue requires one code path, while auto's fileless Dispatch lacks enough context today. |
| Use original body plus structured action identity for deduplication. | Timestamp hash; step number alone. | Retries stay stable, and changed reports / attempts remain distinguishable. |
| Preserve prior versions and append changed output as a new section. | Replace an earlier section silently. | Earlier sections are part of the conversation history and may already have been read. |
| Keep Q1 separate auto / phase ownership, Q2 documented notification limits and Q3 qualified two-comment outcome. | Shared comment; universal silence; absolute two-comment cap. | The owner explicitly accepted those recommendations. |
| Depart from Q4's absolute chronology wording to recommend newest-at-final-preflight with race detection. | Claim atomicity from a local lock; require an unverified provider condition. | GitHub's documented update accepts a comment ID and body, with no issue-wide newest predicate. A read and edit can race; confirmation remains open. |
| Refine Q4 Success Criteria 4 to distinguish acknowledged retries from uncertain delivery and fallback. | Promise unconditional exactly-once delivery. | A remote write can succeed before a timeout, and the unchanged fallback creates another comment. Confirmation remains open. |
| Refine Q4 fit criteria to include usable source and invocation state. | Reconstruct from remote Markdown after state loss. | Jira normalization prevents a safe source round trip. |
| Store h6 section / revision markers and original timestamps separately from duplicate identity. | HTML comments; aggregate hash only. | Fits the existing marker contract and makes parts independently reconcilable; provider round-trip evidence is still required. |
| Retain create-only standalone fallback and separate attention reports. | Resend the aggregate as fallback; agents edit progress. | These are explicit issue constraints. |
| Compare exact stable returned-body fingerprints separately from outgoing source. | Trust surviving markers or timestamp equality. | A human edit can preserve every marker, and provider normalization makes outgoing/returned byte equality an unsafe assumption. |
| Bind bootstrap and terminal operations to explicit invocation manifests with committed preparation and cleanup-safe local acknowledgment caches. | Guess the newest session; require a post-close status write to have been in an earlier commit. | Startup and terminal posting occur outside an ordinary open-run action boundary; deterministic binding permits conservative reconciliation after cleanup or on a fresh clone. |
| Apply bounded delivery work, acknowledged-success semantics, local outcome counts and retention rules. | Unbounded pagination/retries; turn failed postflight inspection into fallback; prune pending evidence. | These review refinements make failure behavior operable within the existing CLI stack. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Durable exact sections, source bodies and separate delivery records, with risk-premortem recovery layered in | KEPT | Best handles resume, normalization, partial delivery and uncertain responses within existing CLI boundaries. |
| Mutable active snapshot with a pending-operation field | MERGED | Atomic snapshot preparation is useful, but all segment identities and acknowledgments must remain available; an active-only cache loses retry evidence. |
| Outbox-only cache | REJECTED | Cleanup or a fresh clone loses the authoritative source and bootstrap state cannot be the lasting run record. |
| Re-render old progress from workflow artifacts | REJECTED | Historical artifacts and renderers can change, and fileless calls lack replay inputs. Saving rendered source is simpler. |

## Trade-offs Accepted

- Durable source and delivery records add an internal format and more small artifacts. They preserve exact source across ordinary resume and avoid lossy tracker round trips.
- Full-body edits cost more bytes as a segment grows. Provider budgets bound each segment, and rollover keeps calls proportional to one segment.
- Conservative rollover produces extra comments after external edits, unavailable source or unsupported evidence. It protects existing content and makes degradation visible.
- Visible h6 markers add a small amount of issue text. They support independently recoverable sections using the repository's established marker style.
- Q2 accepts notification limitations. Consolidation reduces clutter even where the provider or project still notifies on edits.
- The recommended concurrency and uncertainty guarantees are weaker than literal global ordering / exactly-once promises. They are proposals for owner confirmation, not settled permissions.

## Risks & Open Questions

- **Chronology departure from Q4:** Accept newest-at-final-preflight, with local serialization and postflight detection, as the enforceable boundary? Options: A) Accept this boundary — consolidation ships with an explicit remote race. · B) Retain the literal never-edit-after-an-intervening-comment guarantee — block editing on any adapter without verified atomic support. Recommended: A), because the documented GitHub update contract supplies no issue-wide newest predicate. Default if unanswered: B); the strict accepted guarantee remains unresolved and must not be silently weakened.
- **Uncertain-delivery departure from Q4:** Accept that an unresolved write followed by the unchanged agent fallback may duplicate a report? Options: A) Accept the disclosed exception after attempted reconciliation — preserves the required fallback behavior. · B) Require unconditional no-duplicate delivery — block the posting change until a compatible idempotent provider / fallback contract is proven. Recommended: A), because local records cannot prove a remote outcome through an outage. Default if unanswered: B); unconditional retry deduplication remains unresolved.
- **Provider contract evidence after the spike:** Linear's first-party schema settles edit support, and the read-only GitHub sample settles only the metadata prerequisites recorded in the matrix. Live mutation, normalization, external-edit detection, pagination and exact size boundaries remain unverified across the full provider matrix; the spike found no `BKIT_LINEAR_API_KEY` or `BKIT_JIRA_API_KEY`. Options: A) Retain all three adapters in scope and require authenticated disposable-target contract evidence before their consolidation acceptance — preserves the requested outcome without claiming a pass. · B) Ask the owner to narrow delivery to verified adapters and file separate work for the rest — permits a smaller release but departs from the issue. Recommended: A), because unavailable credentials do not prove that an adapter cannot meet the contract. Default if unanswered: A); each incomplete matrix row remains an acceptance blocker, and standalone fallback does not close it.
- **Lost-response recovery evidence:** The spike did not inject a lost create/edit response, so recovery is designed but unproven through the production read path. Options: A) Require a bounded mutation-and-discard probe on each accepted adapter plus implementation fixtures for reconciliation — verifies that stable identity and representation evidence survive the actual transport. · B) Ship without that evidence and disclose recovery as experimental — leaves an essential delivery claim unverified. Recommended: A), because source inspection cannot establish a remote acknowledgment lost in transit. Default if unanswered: A); no exactly-once claim or successful reconciliation result is inferred from the read-only spike.
- **Lifecycle persistence evidence:** Bootstrap/adoption and terminal ownership are specified above, but the spike could not execute mechanisms that do not yet exist. Options: A) Require implementation fixtures covering restart before/after adoption, auto worktree transfer, post-close acknowledgment loss, session/worktree cleanup and fresh-clone reconciliation — validates the selected lifecycle without implementing it during design. · B) Drop persistence across those edges — reduces work but invalidates the proposed retry/resume outcome. Recommended: A), because deterministic source and receipt ownership are necessary for the accepted resume behavior. Default if unanswered: A); the lifecycle remains unproven until those fixtures exercise the implementation.
- **Source loss / cross-machine concurrency:** Durable artifacts cover committed state, while another machine can act on stale uncommitted state and no local lock coordinates it. Options: A) Require one active publisher per invocation and roll over on missing source or conflicting revision evidence — fits the CLI workflow model. · B) Add a shared remote coordination service — expands deployment and ownership substantially. Recommended: A). Default if unanswered: A); report conflicts and never overwrite uncertain foreign revisions.
