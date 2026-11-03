# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Durable sections with a replaceable tracker projection ⭐ Recommended

Treat each routine report as an immutable, identified section in a durable per-run record. The progress comment is a projection of those sections, grouped into consecutive comment segments. The engine owns the exact submitted text and records the remote comment identity and successful delivery separately. Centralize the policy in `postForVerb` → `postCommentOnce`, with tracker adapters handling create, edit, latest-comment identity and size limits.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | MEDIUM. It needs a section record, delivery state and a deterministic renderer, but no server or runtime package dependency. |
| Extensibility | A report's identity, submitted content and delivery status remain separate. Tracker formatting, additional report types and resume behavior can change without changing historical sections. |
| Risk | A remote write can succeed before its local receipt is saved. Recovery must reconcile a stable section marker before it retries. Local serialization alone cannot make a remote latest-comment check and edit atomic. |
| Maintenance | One shared policy and three small transport implementations, with explicit recovery cases. Durable state adds a schema to maintain, but prevents body reconstruction from lossy tracker reads. |
| Friction vs ideal | Extend the existing centralized posting path and its engine-action receipt handling. It currently stores a body hash and URL, not the exact body, comment ID, segment identity or pending write. The shared call context must identify the workflow run even for Start Workflow and other verbs without `--file`. Update tracker reference docs and the shared workflow fallback wording together. Existing comments need no migration: a run with no usable source record opens a new comment. |

Recommended behavior:

- Keep the original report body as the duplicate identity input. Add its first successful section timestamp outside that identity, so retrying later does not change the key.
- Store the exact section body before attempting delivery. Store the assembled body sent to each progress comment, rather than reconstructing it from remote markdown.
- Keep `###### bkit:generated` on the first line of every comment. Give each section its own stable marker so an ambiguous delivery can be reconciled independently of the whole-comment hash.
- Key state by the tracker target, workflow identity and run. Auto dispatch and its phase have separate identities, following the owner's answer.
- Append only when the recorded progress comment is still the newest remote comment. Otherwise open a new segment containing only the new sections, preserving the conversation order.
- Roll over before adding a section that would exceed the tracker's size limit. A single oversized section needs the existing splitting behavior extended to the same limits, with stable part identities.
- Leave decision, failure, handover and close / PR reports on the separate-comment path. Preserve the standalone section body in `commentFile` so fallback agents keep posting it verbatim as a new comment.
- Serialize cooperating local writers for the same run. Document the remaining remote race unless the tracker offers a conditional edit with the required semantics; this capability needs verification rather than an assumed guarantee.

The exact state-file placement and section-marker syntax remain design choices. Prefer an existing durable run-state seam over a parallel general-purpose messaging subsystem. A marker that survives each tracker's normalization must be verified, especially on Jira. If the engine cannot prove that its stored source still owns the remote comment, opening a new segment preserves human edits more safely than overwriting it.

## Approach B — One mutable body snapshot per active progress comment

Maintain a local snapshot containing the current comment ID, exact body and accepted section hashes. Each routine report updates that snapshot, edits the current comment when eligible, or replaces the snapshot with a new segment on rollover. Retain the existing engine-action rows as successful delivery receipts.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | LOW to MEDIUM. A single state document and atomic file replacement keep the implementation compact. |
| Extensibility | Fits the requested behavior directly. Further recovery, delivery auditing or many concurrent reports would gradually add journal-like history around the snapshot. |
| Risk | Losing or partially updating the snapshot can lose the only exact source body. Saving before delivery can make unposted sections look delivered; saving after delivery can make a retry duplicate them. A pending-operation field is needed to distinguish those states. |
| Maintenance | Fewer types and readers initially, but recovery logic tends to accumulate special cases. Prior segments still need retained section identities for deduplication after rollover. |
| Friction vs ideal | Closest to the current synchronous comment helper. Extend `PostedComment` and recent-comment reads to carry stable identity, add edit adapters, and persist the snapshot beside existing workflow state. No change to individual report builders is required if run context can be resolved centrally. |

This is a credible smaller implementation, especially if the snapshot is durable and the pending-operation protocol is explicit. It becomes less attractive if it stores only the active segment: retries of sections in older segments and resumed runs still need a reliable receipt history. The distinction from Approach A is durable representation, not user-visible behavior.

## Approach C — Rebuild progress from workflow records and artifacts

Use the existing status log and saved step artifacts as the source of truth. On each routine report, render all sections belonging to the active segment and send the resulting full body. Store only segment boundaries and remote comment identities as additional delivery state.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | HIGH. Reconstructing the exact originally submitted comment requires a deterministic historical renderer and all of its inputs. |
| Extensibility | Gives one workflow history from which several views could be rendered, but ties tracker reporting to the completeness and versioning of workflow records. |
| Risk | An artifact changes, a renderer upgrades, or a verb has no status file, so a later edit rewrites an earlier section. That breaks the requirement to resend the engine's own exact copy. |
| Maintenance | A long-lived renderer and compatibility rules for old workflow runs. Every new report shape becomes part of a replay contract. |
| Friction vs ideal | The current helper receives already-rendered text; it does not receive enough structured facts to reproduce every report. Start Workflow and other fileless calls require new durable inputs. Capturing the exact rendered bodies to close those gaps converges on Approach A. |

This is attractive only if workflow records already contain every immutable report body. The inspected posting path does not establish that. Introducing a broad event model for every workflow verb is beyond the requested centralized comment change.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend durable identified sections with exact submitted source and separate delivery receipts. | Mutable active snapshot; reconstruction from artifacts. | It handles retries, resume and tracker normalization without treating remote markdown as authoritative source. |
| Keep consolidation in the shared engine posting path. | Teach every workflow verb its own aggregation rules. | The issue requires one code path, and centralized classification prevents policy drift. |
| Identify duplicate sections before adding timestamps or assembling the comment. | Hash the timestamped assembled body. | The same report must retain its identity when retried later or placed in a different segment. |
| Treat the progress comment as a sequence of immutable segments. | Keep editing the original comment after replies; copy all historical sections into every new segment. | The owner accepted additional comments when conversation order, fallback or size requires them. New segments need only the new progress. |
| Give auto and the dispatched phase distinct run state. | Share one progress comment across workflows. | This follows Q1 and avoids cross-workflow state ownership. |
| Permit documented tracker notification limitations. | Require quiet edits on every tracker. | This follows Q2; consolidation and notification suppression are separate outcomes. |
| Preserve the standalone fallback payload and agent-only edit prohibition. | Let an agent reconstruct or edit the accumulated progress comment. | The engine owns exact source and delivery state. The existing fallback remains a new comment posted verbatim. |
| Require explicit analysis of check-then-edit races and ambiguous success. | Claim exactly-once delivery or strict global ordering from local state alone. | A local durable record cannot atomically coordinate an independent human comment with a remote tracker write. |

Evidence consulted: the supplied input and accepted interview answers; `.agents/docs.md`; `.bkit/workflows.md` § When to Run; `.bkit/prompts.md` § Design Phase; `docs/architecture.md` § Package Boundaries and ledger sections; `docs/technology.md`; `docs/security.md` § Untrusted Content & Prompt Injection and Secrets Management; `.bkit/trackers.md` comment interaction and Jira notes; `.bkit/core/engine/commands/workflow/tracker.ts` marker helpers, `splitAt`, `postComment`, `recentComments`, `postCommentOnce`, `runActionKey` and `postForVerb`. No sibling brainstorm output was read. No design document, plan or source code was written.
