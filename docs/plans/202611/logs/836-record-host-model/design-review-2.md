Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| Flow | What fails | Detection | Blast radius and recovery |
| --- | --- | --- | --- |
| Caller resolution | Inherited identities conflict, a receipt is stale, or process ancestry is inaccessible. | The resolver returns `unknown` with an identity reason; the session log and trailer expose uncertainty. | Attribution for the current invocation. Continue without choosing another chat. |
| Exact session lookup | The source is missing, deleted, unreadable or on another machine; a private locator cache is stale. | Typed coverage reasons and one `[bkit-telemetry]` diagnostic. | One session or run interval. Revalidate locators and retain prior persisted facts. |
| Model parsing | The host changes its format, lacks model capability or has not flushed new records. | Parser/capability version, explicit `unsupported`, `no-model-record` or `not-flushed` coverage. | One adapter's observations. Retain known facts and collect again at a later checkpoint. |
| Database collection | SQLite is busy; WAL changes during a copy; source size or collection time exceeds the budget. | `busy`, `partial` or `limited`, with bounded counts and a diagnostic. | One checkpoint. Stop the child collector and continue the workflow. Private snapshot cleanup needs the clarification below. |
| Evidence persistence | The collector has read valid facts but a log append fails, a process dies between append and cursor update, or a retry repeats the batch. | Stable event identities support retry deduplication, but persistence acknowledgement and cursor advancement order are unspecified. | A run's historical model evidence can be skipped permanently if a cursor advances before its batch is durable. See C1. |
| Resume and handoff | The previous machine is gone, its transcript is deleted, or a crash occurred before the last checkpoint. | Persisted coverage ranges expose the uncollected interval. | One run interval. Preserve earlier facts and show partial coverage. No claim of reconstructing absent evidence. |
| Agent dispatch | A spawn is recorded but never starts, a child link is missing, an override is unavailable, or the child never returns. | Configuration remains unverified; the missing child/return linkage leaves an explicit open interval or gap. | One agent attribution. Do not promote configuration to observed usage. |
| Outcome and stats | A later read fails, CI restates the outcome, or old rows have no attribution fields. | Evidence folding preserves prior facts; `restateOutcome` preserves `execution`; legacy rows display `not recorded`. | One run report. The existing telemetry append remains fail-open. |
| Commit creation | An uncommon local or remote path omits context, or a message already contains mixed-case/duplicate host trailers. | The formatter normalizes the key and uses explicit `unknown`; path parity needs implementation verification. | Attribution of newly created commits. No historical rewriting or change to CI tags is intended. |

## Observability Coverage

The design uses the existing CLI and committed ledgers; it introduces no external monitoring service. `docs/observability.md` confirms that this project has no tracing backend or server-side log drain. Local run/checkpoint identifiers provide appropriate correlation, while a remote squash already has a PR and matching-head identity.

<!-- prettier-ignore -->
| Failure group | Logs | Metrics or counters | Correlation and gaps |
| --- | --- | --- | --- |
| Identity and linkage | `[bkit-telemetry]`, identity reason and explicit unknown session state. | Outcome host/coverage summaries. | Active-run and session/dispatch fingerprints. Diagnostic run correlation should be explicit; see O2. |
| Missing, unreadable, unsupported and delayed sources | One concise diagnostic plus typed coverage. | Coverage counts/reasons in the outcome. | Source/parser and supported ranges remain recorded. Repeated identical failed attempts may be collapsed; see O2. |
| Busy, unstable and limited collection | Typed state, platform, checkpoint and counts. | Collection bounds are defined; budget-hit frequency is not yet named. | One bounded coordinator across adapters. Parent cleanup responsibility is incomplete; see O1. |
| Append failure and retry | A collection failure is supposed to emit a diagnostic. | No explicit persistence-failure count or acknowledgement is defined. | C1 requires an acknowledged log write before cursor advancement. |
| Cross-machine loss and missing agent evidence | Partial coverage and configuration-unavailable/unlinked-agent reasons. | Coverage and configured fallback summaries. | Run/session/dispatch identities distinguish available evidence from gaps. |
| Local/remote trailers | Existing command failure surfaces remain; values are allowlisted. | No production counter is necessary for a deterministic formatter. | Current operation context and existing PR/head correlation. O3 recommends an explicit final-message assertion. |

No missing external trace span is a blocker: host databases are local read sources, and the design adds no cross-service execution flow. Coverage is an attribution-quality signal; it does not warrant paging for ordinary transient unreadability.

## On-Call Ergonomics

No new alert or pager is proposed. Missing stores, busy databases and late flushes remain non-blocking and visible in the report, which avoids a transient alert storm.

The design should add a short diagnostic-to-action table when it updates `docs/observability.md`:

- `missing` or cross-machine `unavailable`: preserve committed evidence and explain that the absent interval cannot be reconstructed locally.
- `unsupported`: retain the adapter/version and obtain a sanitized format fixture through normal maintenance; do not edit a host database.
- `busy` or `not-flushed`: allow the next bounded checkpoint to retry; do not ask the owner to unlock, copy or modify a live database by hand.
- `limited`: retain valid facts and the limit reached; incremental replay resumes from the last acknowledged position.
- Persistence failure: keep the last acknowledged cursor and emit an actionable write-failure reason without raw paths or host content.

Automatic retries remain bounded by the ordinary checkpoint schedule. Repairing a broken adapter or recovering a damaged repository log is a maintenance decision, while replaying an unacknowledged batch must be idempotent.

## Operational Dependencies

No dashboard, external service, scheduled monitor or alert is added.

New maintenance burdens are five versioned host readers, sanitized format fixtures, a private-cache/snapshot cleanup policy, and the short coverage-reason runbook above. The code must retain Node.js 24 compatibility and the existing zero-runtime-dependency boundary. Live capability probes remain a prerequisite for claiming a host-specific capability, with the design's open question governing unavailable access.

## Verdict Reasoning

`CONCERNS`: the design is operable with addressable caveats. It has bounded execution, fail-open collection, explicit coverage gaps, stable evidence identities, privacy-filtered diagnostics and a repository-only reporting path. It preserves the owner's exact lowercase `bkit-host` decision and distinguishes configured models from actual calls.

One durability contract must be made explicit before implementation: evidence must be acknowledged in the run log before a private cursor can skip its source positions. The design also needs tighter lifetime rules for raw database snapshots and bounded child cleanup. These are concrete additions to the selected architecture; they do not require a new monitoring stack or a broader feature.

The `Risks & Open Questions` section covers the host-format, late-flush, process-visibility and stable-WAL concerns. Its single owner question has lettered options, a lettered recommendation and a default. The persistence-order and private-snapshot lifecycle gaps below are not yet represented there.

## CRITICAL

### C1 — Acknowledge persisted evidence before advancing a source cursor

**Evidence:** `Checkpoints and dispatch configuration`, `Data Model / Status events`, and `Fold, outcome and stats` define incremental cursors, stable fact identities and retained evidence, but do not define the write acknowledgement or ordering between a collected batch and its cursor. `Failure and scope` only gives generic fail-open behavior.

**Failure:** A collector reads a model call and advances its private cursor. The status append then fails, or the process exits before the row is durable. The next checkpoint skips that call; deleting the original transcript or moving machines makes the loss unrecoverable. A later successful checkpoint can incorrectly make the remaining range look complete. Stable fact deduplication alone cannot recover a fact that was never appended.

**Required design change:** Make the committed run-log checkpoint the authority for acknowledged source progress. Append a complete validated batch with its cursor/range as one replayable checkpoint record, acknowledge successful durable writing, then update any private cache. Rebuild disposable cursors from acknowledged records after restart. A failed or uncertain append retains the previous cursor and replays the batch using stable identities; a truncated record cannot count as acknowledgement. Define idempotent retry and how concurrent collectors serialize or reconcile their acknowledgements. Emit one sanitized persistence-failure diagnostic and keep coverage partial if writing cannot be confirmed. Verify crash-before-append, crash-after-append-before-cache, truncated-write and retry behavior during implementation.

## OPTIONAL

### O1 — Define the lifetime and permissions of private snapshots and collector processes

The resource section permits copying a raw host database/WAL to gitignored `tmp/`. These files can contain full prompts and other private content even though only allowlisted metadata enters the run log. Gitignore prevents ordinary staging; it does not set permissions or remove orphaned copies. Specify owner-only temporary directories/files, a symlink-safe creation policy, parent-owned cleanup on success/error/timeout, bounded termination and reaping of the collector, and safe reclamation of this feature's abandoned temporary files after a crash. Cleanup must never delete host-owned stores or another live invocation's snapshot. A process killed at the 8-second budget cannot be responsible for cleaning up after itself.

### O2 — Make coverage frequency and diagnostic correlation unambiguous

The design promises coverage counts/reasons but also persists only new or changed evidence and retains the latest assessment. State whether counts represent current gaps, distinct affected ranges or collection attempts. Preserve a small per-checkpoint attempt/error/budget-hit summary so repeated identical failures remain measurable without duplicating model facts. Include the safe run reference plus checkpoint identity in diagnostics, and document the reason-to-action mapping in `docs/observability.md`. This makes an unsupported adapter distinguishable from one transient busy read across concurrent runs.

### O3 — State the final commit-message verification boundary

The commit table includes ordinary, handover, throwaway landing and remote squash paths, and it preserves matching-head checks and CI semantics. Add a final composed-message assertion for exactly one lowercase `bkit-host` with an allowlisted value, including the printed MCP merge body. Treat that assertion as part of constructing a new workflow commit; do not reinterpret failure as permission to change its subject, CI tags or unrelated trailers. This gives the accepted commit requirement a clear operational enforcement point.

## OUT OF SCOPE

None. Cost accounting, historical reconstruction, a mandatory launcher, global Git hooks and an external monitoring platform remain outside this design. No new deferral is introduced by this review.
