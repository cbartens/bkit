# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Extend the shared poster with durable run artifacts ⭐ Recommended

Extend `postForVerb` → `postCommentOnce` in `.bkit/core/engine/commands/workflow/tracker.ts` to maintain a progress comment from an engine-authored body artifact under the run's existing log directory, with tracker identity and successful publication metadata recorded alongside the existing action records.

- Complexity: MEDIUM.
- Extensibility: The shared publisher owns routine versus standalone delivery, so another workflow step automatically receives the same policy. Small provider operations create, inspect and edit comments without adding a new service or dependency.
- Risk: A remote post may succeed before local publication state is recorded, and a person may comment between the newest-comment read and the edit. Preserve a pending body and section identity before the request, reconcile an uncertain result against section markers, and roll over whenever ownership, content or newest-comment eligibility cannot be established. The check-then-edit race is a provider capability question; a preflight read alone does not prove the issue's absolute ordering invariant.
- Maintenance: One body artifact per progress segment, a compact run-scoped record of comment identity, and tests at the existing tracker boundary. Artifacts survive a resumed run and a fresh checkout once the workflow commits them. Bootstrap handling is required because Start Workflow can post before `status.jsonl` exists.
- Reuse vs new: Reuse `trackerTarget`, `postCommentOnce`, `runActionKey`, `endedRunActionKey`, `alreadyDone`, `recordAction`, `stampMarker`, `markerHashOf`, `splitAt`, `commentFileOf` and the existing GitHub, Linear and Jira transports. Extend their data contracts with stable comment IDs, ordering / revision metadata and an edit operation. The new body artifacts contain only the engine's own generated output; they are not copies of tracker discussions.

The central delivery policy should use structured workflow / verb / step identity, rather than parsing human-facing headings. Decision Pause, failure, handover and final close / Create PR remain standalone. The common function already receives `RunContext`, and existing callers pass a run action key when one exists; a small shared context resolver can fill the missing run identity for verbs without `--file`. Start Workflow needs a bootstrap identity that the later run adopts, so its first comment becomes that run's progress comment instead of an orphan.

Retain the first-line `###### bkit:generated` marker. Use a separate visible h6 section marker carrying a deterministic section identity derived from the existing unstamped section body / action identity. Keep the timestamp outside the material used to decide whether the same report was already sent. This follows the repository's h6 marker convention and avoids relying on HTML comments that a tracker may remove. A same-body retry is suppressed; a genuinely new report or attempt remains a new section. The design must define changed-output behavior explicitly rather than treating every use of the same step number as a duplicate.

For each routine section, load the engine's own body, verify that its target comment is still eligible, measure the complete outgoing body including markers and timestamps, then append or start a new segment. Reuse `splitAt` for an individual section larger than a provider limit. Splitting must track each published part so a retry after a partial success does not repeat completed parts. Provider limits, including Linear's verified limit, belong in the provider adapter. Do not assume the existing Jira-only limit covers the other trackers.

Keep `commentFile` as the standalone current section, byte-for-byte, so the MCP fallback continues posting a new comment and does not receive a cached aggregate that would repeat older sections. A failed engine edit must not advance publication state. Agents still never edit tracker comments; clarify that wording in the shared workflow clause without granting agents an exception.

## Approach B — Keep the progress cache in the existing Git outbox

Use the same shared publisher and provider operations, but place the authoritative generated bodies and comment metadata in the existing Git-common `bkit-outbox` area, keyed by tracker, repository / site, issue, workflow and run identity.

- Complexity: MEDIUM.
- Extensibility: Delivery policy and provider support evolve in one place, as in Approach A.
- Risk: The cache disappears in a new clone or after outbox cleanup. On cache loss, the publisher must start a fresh progress comment rather than reconstructing an earlier aggregate from tracker markdown. This preserves earlier text but yields additional comments after machine changes. A deterministic section marker still handles ordinary retries and uncertain requests within the bounded recent-comment window.
- Maintenance: Fewer committed artifacts and no need to place generated aggregate text in a status row, but cache lifecycle, bootstrap adoption and cleanup must be maintained. Multiple worktrees must serialize access to the same run cache.
- Reuse vs new: Reuse the existing outbox location and the same action, marker and provider helpers. Add one cache format and atomic local replacement. Keep status action records as evidence of completed publication without making the outbox the source of workflow completion.

This is attractive when progress bodies are regarded as disposable transport state. It is less robust for a run resumed on another machine, because the current `RECENT_COMMENTS = 5` search cannot serve as a durable history of all sections. It also cannot safely reconstruct Jira's original markdown, which the input explicitly forbids. The owner accepted extra comments when a fallback or intervening comment requires them; cache loss is a further condition that should be made explicit if this option is chosen.

## Approach C

None.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A's run-owned body artifacts and compact publication metadata. | A disposable cache in the Git outbox. | It fits the existing per-run log and commit lifecycle and preserves the engine's own bytes across resume. |
| Extend the shared poster and provider functions. | Add posting policy to each workflow verb. | The issue names one code path, and current callers already converge on `postForVerb`. |
| Preserve independent progress comments for auto and its dispatched phase. | Reuse auto's comment in the dispatched phase. | The owner's Q1 answer settles ownership per workflow run. |
| Keep routine aggregation even where edit notifications cannot be suppressed. | Block release on notification silence across every tracker. | The owner's Q2 answer accepts documented limitations. |
| Qualify the two-comment result by fit, fallback and intervening comments. | Enforce two comments regardless of the conversation. | The owner's Q3 answer preserves rollover and conversation order. |
| Keep an engine-authored body; use remote reads only to establish eligibility and reconcile publication. | Read, append to and resend tracker-returned markdown. | Jira can normalize the text, so round-tripping the tracker copy would damage prior sections. |
| Keep standalone MCP fallback payloads and agent prohibitions. | Let agents edit an aggregate or repost its full cached body. | The issue explicitly keeps fallback posting as a new comment and leaves manual tracker work comments outside scope. |
| Treat every missing ordering / revision capability as unresolved until verified. | Claim a newest-comment check makes edits atomic against new replies. | The present transport has no edit operation or conditional edit contract; a read followed by a write has a race. |

Evidence: `tracker.ts:373-530` provides marker stamping, body files, splitting, creation and recent reads; `tracker.ts:1030-1198` provides action-key deduplication and verb glue. `issues.ts:1049-1064` shows an optional status file for issue comments, while `steps.ts:1210-1224` passes a run action key. The current comment reads retain bodies and URLs but do not expose the IDs and revision metadata an edit policy needs. `.bkit/trackers.md:98` documents the current per-step comment interaction, and its Jira notes describe markdown normalization and the existing size bound. The folded decisions confirm engine-owned tracker I/O with MCP fallback, h6 tracker markers, and the absence of a tracker snapshot ledger. Language-server extraction of the worktree's tracker module was unavailable; targeted text reads and the committed capability map supplied the code evidence.

