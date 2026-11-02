# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Preserve recoverable delivery intent before editing ⭐ Recommended

Extend the shared tracker path with a durable per-run delivery journal: persist the original section and intended aggregate before the network write, then record the acknowledged comment identity and revision so a retry can reconcile an uncertain result without reconstructing source Markdown from tracker text.

The run identity includes the tracker target, workflow and run, with a bootstrap identity for Start Workflow before `status.jsonl` exists. Auto and its dispatched phase use different identities, following Q1. Each segment retains its original source body, section identities, original timestamps and provider comment ID. A journal can reuse the existing workflow record mechanisms; this is not a recommendation for a new service or database.

### Premortems

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Full-body replacements send growing payloads; Jira/Linear latest-comment reads may fetch an entire issue; more writers increase collision and rollover frequency. A broad lock would serialize unrelated issues. | Record provider, target/run identity, segment, section count, encoded length, operation and rollover reason. Measure calls through existing CLI diagnostics, without logging bodies or credentials. | Use a target/run-scoped local lock and bounded provider reads. Roll over before the full rendered body exceeds the provider budget. Resume only the pending operation, rather than replaying the run. |
| 6 months later | A renderer or marker change makes an old run appear new, or source bodies disappear when a temporary outbox is cleaned. Magic limits drift. | A versioned record reports an unsupported shape, missing source or mismatched target distinctly from a remote outage. | Keep durable run records until the run is complete; never recreate an old aggregate from tracker Markdown. With incomplete evidence, seal the old segment and start a new one carrying only unsent work. Document and verify provider limits centrally. |
| On-call at 3am | A timeout occurs after a successful create/edit, or acknowledgment persistence fails. Blind fallback creates duplicates; blind retry may overwrite a later update. | Distinguish prepared, acknowledged, reconciled and uncertain delivery. Preserve the intended revision/hash, target ID and local source path in redacted diagnostics. | Inspect remote markers to determine whether the exact revision landed. Retry the same prepared body only when safe. An unresolved remote result remains uncertain; preserve the existing fallback contract and disclose its duplicate risk rather than claiming exactly-once delivery. |
| Author leaves | The next maintainer mistakes `engine-action` deduplication for a delivery transaction, changes timestamp generation, or classifies failure/close reports as routine. | A small documented transition table maps routine, decision, failure, handover and terminal events to create/update behavior; examples show crash boundaries. | Keep routing in `postForVerb`/`postCommentOnce`, use explicit event metadata, and retain the standalone fallback payload. Document the bootstrap-to-run association and recovery paths alongside the contract. |

### Risk-mitigation guidance

- Use stable section identity separately from content hash. Identity must distinguish workflow, run, step, group, attempt and report purpose. Decide whether a changed report for the same identity is a correction or a new attempt; never let the current timestamp alone defeat retry deduplication.
- Preserve `###### bkit:generated` as the first line and use a versioned per-section marker that survives each provider's actual serialization. Verify marker behavior rather than assuming HTML comments survive Jira.
- Verify the stored comment belongs to the exact tracker/site/repository/issue and run before editing. A matching text marker alone is not sufficient ownership evidence.
- Check that the stored segment is the issue's newest comment immediately before editing. If reading fails, the comment is deleted, its identity differs, or an external edit is detected, create a new segment instead of overwriting uncertain content. Latest means creation order, not modification order.
- A local lock only protects cooperating processes sharing that lock. It does not provide an atomic latest-comment condition on the provider; the cross-approach owner question below remains necessary.
- Count the fully rendered request, including markers, timestamps and continuation headers. One section larger than a comment needs deterministic chunk identities and durable per-part acknowledgments. Existing Jira multi-part posting can partially succeed before throwing, so a whole-message retry is insufficient.
- Keep `commentFile` as the standalone current report for the agent fallback. It must not become the entire aggregate, which would duplicate earlier sections when posted as a new comment.

## Approach B — Protect prior content with a committed snapshot and conservative rollover

Persist one atomic source snapshot of the last acknowledged segment plus section identities; only edit while the snapshot, target identity and newest-comment check agree, and roll over whenever recovery evidence is incomplete.

This gives fewer state transitions than Approach A, but its failure boundary is weaker: remote success before local snapshot replacement can leave an ambiguous update or create. A deterministic marker permits some reconciliation, while state loss causes extra comments. It is suitable only if this degraded behavior is explicitly accepted, because the issue asks retries not to duplicate sections.

### Premortems

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Snapshot replacement and full remote edits still grow with aggregate size; frequent uncertainty creates many short segments. | Count snapshot mismatch, uncertain-write and rollover reasons, with lengths and IDs only. | Bound each segment, serialize local writers, and create a fresh segment only for unsent sections. Avoid rescanning all historical comments on each step. |
| 6 months later | Missing snapshots on another machine silently disable consolidation; old and new renderers disagree about equality. | Report state unavailable separately from no previous progress comment; retain an explicit snapshot format version. | Preserve old content remotely, start a new segment, and explain the extra comment. A supported snapshot upgrade may be proposed separately if needed; do not silently invent one. |
| On-call at 3am | A create succeeds but its ID is not saved; the next process cannot tell whether the section was delivered. | Log the stable section marker and uncertainty, not a success inferred from an empty recent-comment page. | Reconcile by identity through a bounded read; unresolved ambiguity follows the existing new-comment fallback, with possible duplication disclosed. This is the principal trade-off against Approach A. |
| Author leaves | A maintainer uses a remote Markdown body as the snapshot or overwrites a human's edit to a bot comment. | Document the distinction between source snapshot and remote evidence, with explicit mismatch reasons. | Treat remote content as evidence only. Seal a changed comment and continue in another segment; never repair it by overwriting the human change. |

### Risk-mitigation guidance

Layer the same target validation, section markers, size accounting, standalone fallback payload and latest-comment preflight onto this approach. Store the snapshot atomically and retain its last known good version. Do not interpret rolling over as proof that the uncertain prior section was absent; warn about the weaker retry guarantee. If crash-resilient deduplication remains a hard requirement, choose Approach A.

## Approach C — None

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A, with durable intent and acknowledgment. | A last-acknowledged snapshot only. | Recovery after remote success and local failure is load-bearing, not an optional operational convenience. |
| Extend the existing shared tracker delivery path and provider adapters. | Route each workflow verb independently; add a service. | `postForVerb` already funnels the relevant callers through `postCommentOnce`; a second path multiplies failure-policy drift. |
| Keep Q1–Q4 as settled, except expose the concurrency guarantee for confirmation. | Share auto's comment; require notification suppression everywhere; enforce two comments despite rollover. | The owner explicitly accepted separate phase comments, documented notification limitations and qualified comment counts. |
| Preserve engine-owned source and reconcile using identities. | Rebuild the aggregate from tracker Markdown. | The issue and `.bkit/trackers.md` document Jira's lossy round trip. |
| Keep agent fallback create-only with the current standalone report. | Let agents edit aggregates or resend the aggregate as a new comment. | The input explicitly preserves fallback behavior and forbids agent comment edits. |
| Make routine/attention classification explicit in the shared boundary. | Infer solely from human-readable titles. | Translated or renamed titles must not suppress a decision or failure notification. Existing no-file calls require a defined run/bootstrap association. |

## Cross-Approach Risks

1. **The accepted chronology guarantee is stronger than the observed API contract.** A human can post after the newest-comment read and before the edit. GitHub's documented update endpoint accepts a comment ID and body; it does not document an atomic predicate that the comment is still newest on its issue. This is an inference from the documented contract, not proof that every undocumented mechanism is impossible. A local lock or a postflight read cannot undo the ordering violation. Source: [GitHub issue comment API](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment), reviewed 2026-11-02.

   Owner confirmation needed for a departure from Q4: Should chronology mean newest at the final preflight read, with a documented race? Options: A) Accept that boundary and detect/report observed races, sealing the segment for future writes — delivers consolidation with an honest concurrency limit. B) Retain the literal never-edit-after-intervening-comment guarantee — require verified provider support for an atomic condition, otherwise block consolidation on that provider. Recommended: A). Default if unanswered: retain the accepted strict guarantee and mark this unresolved; do not silently weaken it. A postflight check is detection, not a claim of atomicity.

2. **Exactly-once delivery cannot be assumed across the unchanged fallback.** A timeout may conceal remote success, and the agent's create-only fallback can duplicate that report. The design must distinguish deterministic re-execution from an unresolvable network outcome. The owner accepted fallback-related additional comments, but has not explicitly accepted duplicate sections caused by an ambiguous write. Preserve durable intent and reconcile before returning fallback where the remote evidence permits it; surface any remaining gap in the final acceptance wording.

3. **Creation before the run record exists is a separate identity boundary.** Start Workflow occurs before worktree/setup and `workflows start`. Current `issues comment` computes a run key only when an existing file resolves one; `postForVerb` otherwise uses a last-five-comments hash check. A bootstrap association must survive that transition without joining a previous run or auto's run. A global issue-only cache would violate Q1 and permit cross-run overwrites.

4. **Provider metadata is currently insufficient for safe edits.** `PostedComment` returns URL/parts, while `recentComments` returns body/URL; non-GitHub recent reads derive from the fetched issue and discard identity. Durable IDs, author/ownership evidence, ordered latest-comment evidence and detectable external modifications must be part of the provider capability contract. Never parse a presentation URL as the only mutation authority.

5. **The three tracker transports have different evidence gaps.** Jira in this repo uses Rovo MCP rather than REST credentials. The official Jira REST update reference alone cannot prove which parameters Rovo exposes. Linear's limit and update/latest-comment shapes need authoritative verification. Treat unsupported metadata or unverified limits as a design blocker for that adapter, not as an empty result that permits an edit. Q2 allows documented notifications; it does not waive content safety or size limits. Reference: [Jira comment API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-comments/).

6. **Human edits to a progress comment are distinct from new comments.** Even if its creation order remains newest, replacing it from the engine's local copy can erase a human correction. Detect an external revision where the provider exposes one; otherwise document the uncertainty and choose a new segment when evidence does not match.

7. **The diagnostics must remain proportional to a CLI.** Existing observability is prefixed stderr plus structured results and status records, not a hosted metrics/tracing system. Reuse those surfaces to explain append, rollover, dedupe, uncertainty and fallback. Never add raw report bodies or secrets to logs.

Evidence read: `.bkit/core/engine/commands/workflow/tracker.ts` (`postComment`, `recentComments`, `postCommentOnce`, `runActionKey`, `postForVerb`), the `issues.ts` comment caller and `steps.ts` finish caller; `.bkit/trackers.md` §§ Interaction catalog and Jira notes; `docs/observability.md` §§ Scope and Log Format; relevant active decision summaries. The language-server query rejected the ignored worktree path, so code evidence used bounded reads from this worktree. No implementation or live tracker mutation was performed for this exploration.
