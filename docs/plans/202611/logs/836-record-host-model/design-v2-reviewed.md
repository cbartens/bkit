Verdict: PASS
<!-- verdict:end -->

# Design: Record workflow hosts and models

## Related Issues

The semantic search returned no additional matches after excluding the current issue. The input also references:

- #526 — Telemetry: record per-workflow OpenCode cost in stats.jsonl (state not re-read) — https://github.com/cbartens/bkit/issues/526. The future cost reader can consume the same local OpenCode session association.
- #721 — Model registry (state not re-read) — https://github.com/cbartens/bkit/issues/721. Configured models remain distinct from observed execution.
- #752 — Provider support (state not re-read) — https://github.com/cbartens/bkit/issues/752. Host and model provider are separate axes.

## Acceptance Scenario

This develops the draft accepted in Q5 and preserves Q1-Q4, including the owner's lowercase trailer spelling. Host means the agent application, such as Codex; model means the model that application used.

### Narrative

After a workflow finishes, I can tell from the repository which hosts and models did the work, including subagents and resumed sessions, and where the available evidence has gaps. I can also see the host responsible for each workflow commit in its `bkit-host` trailer.

### Success Criteria

1. Every start or resume on each supported host produces a session record with that host when the current caller is established, or explicit `unknown` when it cannot be distinguished.
2. Committed records contain chat fingerprints and normalized model facts, with no raw chat ids, local host paths or transcript content.
3. The run log, outcome and `bkit stats` show observed orchestrator and subagent models across recorded sessions, including switches; configured fallback models are labelled unverified and incomplete coverage is explicit.
4. Every workflow-created commit carries exactly one lowercase `bkit-host` trailer naming the committing operation's host, or `unknown`.
5. Missing, unreadable, unsupported, busy or oversized host records leave visible reporting gaps and never fail or indefinitely delay workflow completion.

### Key Edge Cases

- A host launches another and passes down its environment, or loads another host's visible skill.
- Concurrent chats and worktrees share a repository or host store.
- Models switch, subagents use different models, configuration changes, or a run resumes on another host or machine.
- Model records lack a reliable run interval, agent relation or event boundary.
- Records are deleted, incomplete, not flushed yet, unsupported or unavailable on the closing machine.
- A landing or remote squash creates a commit after the final telemetry snapshot.

### Process Sketch

- WHEN Codex runs inside a Claude Code shell → THEN current-caller evidence identifies Codex, or reports uncertainty without selecting the inherited Claude chat.
- WHEN the host cannot be determined → THEN the session and commit trailer explicitly say `unknown`.
- WHEN models change during a run → THEN the final report includes observed models and their coverage.
- WHEN a subagent's actual model is unavailable → THEN its dispatch-time configured model is shown as unverified, or configuration is explicitly unavailable.
- WHEN another host resumes the run → THEN earlier persisted evidence remains represented and subsequent commits name their committing host.
- WHEN local host records cannot be read → THEN the run completes within a bounded collection budget with the gap visible.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Session identity and privacy | `run-facts.ts` `hostChat`, `chatFingerprint`, `runChats`; `workflows.ts` `recordChat` | EXTEND | Keep the existing session-to-run join and fingerprint algorithm. |
| Current-invocation host input | `.bkit/core/engine/render/hosts.ts`, existing tool hooks and CLI dispatch | EXTEND | Add current-runtime declarations and corroboration at existing boundaries; a rendered skill alone does not prove its executing host. |
| Host evidence resolver | Existing Claude-only `hostChat`; no shared five-host scoped resolver in supplied sources and scoped searches | NEW | Caller identity, chat association and conflicting evidence need one shared contract rather than a larger environment-variable switch. |
| Model readers | `agentContextBlock`; per-host readers in unshipped `scripts/harvest/bkit-harvest.mjs` | EXTEND | Extract only model identity, event positions/times and explicit child relations into shipped code. Do not import the maintainer-local scanner. |
| SQLite decoding and backup | Harvest `openDb`; Node's built-in `node:sqlite` | ADAPT | Reuse decoding and native backup only after a source route proves coherent acquisition without host writes. The spike disproved generic live `readOnly` access, including with pre-existing sidecars. |
| Durable checkpoints and dispatch snapshots | Append-only `status.jsonl`, step boundaries, `status row`, agent invocation blocks, `render/models.ts` | EXTEND | Capture actual evidence and effective configuration in the existing run log. |
| Bounded collection coordinator | No shipped five-host run-scoped collector found; harvest is a broad local scan | NEW | Enforce one budget across only explicitly linked sessions and dispatched agents. |
| Commit trailers | `ledgers.ts` `commitOwnSet`, `ownPathCommit`, `commitBookkeeping`, `retriggerCommit`; `branches.ts`, `prs.ts`, `roadmap.ts`; workflow/prompt commit instructions | EXTEND | Normalize the trailer in current message-construction paths and pass current operation context. |
| Run reporting | `OutcomePayload`, `closeWorkflow`, `restateOutcome`, `analysis.ts`, `stats.ts`, harvest run consistency checks | EXTEND | Project one evidence fold into outcomes and per-run stats; retain old-row compatibility. |

All engine paths above are under `.bkit/core/engine/commands/workflow/` unless stated otherwise. The runtime targets Node.js 24 or newer and has no runtime dependencies. The harvest already uses `DatabaseSync` with `readOnly`; the [Node.js 24 SQLite reference](https://nodejs.org/docs/latest-v24.x/api/sqlite.html) documents the built-in API. Implementation must use the Node 24-compatible API rather than newer Node 26-only names or options.

## Architecture

### Boundaries

The run log remains the durable source. The proposed resolver and collection coordinator live under `.bkit/core/engine/commands/workflow/`, beside `run-facts.ts`; these are the two `NEW` capabilities above. Host readers sit behind the coordinator and use shared ledger types. No daemon, global Git hook, alternate ledger or all-repository scanner is introduced.

The resolver separates three facts: the current caller's host, its native chat association, and the model evidence attributable to this run. A missing chat or model does not erase an independently established host.

### Current-caller evidence

Use `claude-code|codex|cursor|opencode|antigravity|unknown` as the platform vocabulary. Host-specific rendering supplies a proposed `--host=<platform>` input to lifecycle, evidence and commit-producing commands. This is a new interface to implement, not an existing flag. Its value is a current-runtime declaration, not a conclusion drawn from the loaded skill's path.

Resolve evidence in this order:

1. Accept a host-native hook/tool receipt only when its session and direct invocation or process binding match this command. An inherited parent receipt is insufficient.
2. Accept an explicit current-runtime declaration when independently corroborated by the nearest recognized live host process or a causally bound native tool/hook identity.
3. Use bounded process ancestry as a fallback when it uniquely identifies the current caller. Match executable identity narrowly, not arbitrary command-line substrings.
4. Otherwise return `unknown`. Ambient variables, installed hosts, an unbound declaration, the newest marker, directory/time overlap and model vendor never break the tie.

Reject a declaration conflicting with stronger current-caller evidence; conflicting evidence at equal strength yields `unknown`. A known host without a causally associated chat keeps its platform and records `session: null`. Consider native environment ids only for that established platform and only when the id can be linked to its current hook/process/session evidence. A real but inherited parent's chat is still the wrong chat.

Process probing is optional and never gates workflow progress. Read executable names and parent ids with at most 16 ancestors and a 250 ms subprocess budget; retain no arguments. Verify lineage continuity rather than trusting a reused pid. Brokers, restricted sandboxes and container boundaries may make the result unknown.

Hook lifecycles differ. Do not assume a universal session-start event or that a hook child can export variables to future shell calls. Where existing events provide causal binding, receipts are atomically written to a gitignored cache under the Git common directory, isolated by host session and invocation. They are never chosen by modification time. No new receipt transport is required where a host cannot prove the handoff; use other verified evidence or `unknown`.

### Entrypoint capability gate

A receipt is usable only if the host's supported tool boundary can pass its exact opaque invocation selector to the later command. Its private fields are `host`, native session id, native tool-call id when exposed, invocation nonce, command digest, workspace identity, and the live process identity/start marker when available. The resolver selects by the supplied invocation nonce, checks the command/workspace and native call relation, and consumes that binding for the current invocation. An inherited nonce without that relation is rejected. A receipt proves neither another shell command nor a later resume. These are proposed fields; no receipt transport was implemented or proven by the spike.

**If** the host cannot inject the selector through a supported invocation boundary → do not implement an unbound latest-receipt lookup. Use independently verified ancestry for platform evidence, keep chat linkage unavailable without a separate join, and retain the capability as unresolved.

<!-- prettier-ignore -->
| Host / entrypoint | Native candidate and exact selection | Nested / concurrent rejection | Evidence status and completion gate |
| --- | --- | --- | --- |
| Claude Code local CLI | `CLAUDE_CODE_SESSION_ID` is a candidate for an established Claude caller; a tool receipt needs the native call selector and matching session. | Reject inherited Claude ids unless the current Claude invocation owns the receipt; nearest unique process can establish platform only. | Existing Claude session parsing is prior art; current-command receipt transport and both nesting directions remain unverified. |
| Codex desktop route exercised here | Nearest executable chain was `node → codex → ChatGPT`. The native thread id matched exactly one rollout's `session_meta.id`; child records exposed `thread_spawn` parent/depth/role fields. | Match native metadata exactly; an environment id plus ancestry alone does not establish that id's ownership by this command. | Partial live evidence only. Platform lineage and exact record lookup were observed separately; their causal join, nested launches and remote brokers remain gated. |
| Codex direct CLI / cloud / broker | Candidate `CODEX_THREAD_ID` or native hook/tool selector, resolved only after the current invocation's platform and id ownership are established. | Reject a parent host's variables and a selector lacking a current native call relation. | Unverified entrypoints. Do not extrapolate the available desktop probe to cloud or brokered execution. |
| Cursor local CLI / IDE | Candidate `CURSOR_CONVERSATION_ID` / `CURSOR_AGENT_CHAT_ID`; a native hook receipt must name the exact tool call and command. | No repository-wide marker or newest chat; require selector binding or independently verified caller evidence. | Variable names and store formats are prior art, not live proof. Direct, nested and IDE tool paths need captures. |
| Cursor cloud / broker | Same candidate fields only where the live payload actually supplies them. | Cloud broker identity cannot stand in for the Cursor chat. | Unverified; process/receipt availability must be demonstrated separately. |
| OpenCode direct / `bkit opencode` | Candidate `OPENCODE_SESSION_ID` and native plugin tool-call relation; exact session/child ids select records. | Launcher-provided environment is not sufficient; nested host ownership must be corroborated. | Store/parent-link prior art exists; invocation receipt propagation and live model-call ownership remain gated. |
| Claude Code web / cloud | Use only the native metadata and invocation relationship actually exposed there. | A runner, container or inherited desktop id is not the agent host/chat. | Unverified; local Claude evidence does not establish the web route. |
| Antigravity IDE / broker | Existing hook payload exposes `conversationId`; any receipt needs a supported native tool-call selector and exact command binding. | A conversation-wide receipt cannot prove a later shell command; reject shared marker selection. | Payload prior art exists, but receipt-to-command transport, live model ownership and broker paths remain unverified. |

Every normal supported host needs a proven working platform/session route and a documented model capability result before the five-host feature can be called complete. Unknown/partial is correct for an unavailable or ambiguous runtime case, but an implementation that always reports unknown on a required normal path does not satisfy acceptance. Unavailable route evidence remains an open capability gate; it is not authorization to add a mandatory launcher or weaken the success criteria.

### Model readers

The coordinator receives this run's recorded sessions and dispatch intervals and reads only their linked local records. A gitignored local locator cache keyed by platform and fingerprint may avoid repeated directory searches. Revalidate cached locators. Raw ids and paths remain in process memory or this private cache; committed rows, diagnostics, comments and trailers contain neither. Cache loss never invalidates persisted evidence.

<!-- prettier-ignore -->
| Host | Reader reference | Attribution boundary |
| --- | --- | --- |
| Claude Code | Main transcript `message.model`, exact-session subagent files and `.meta.json` | Explicit child links and per-call timestamps; preserve existing context-token semantics. |
| Codex | Rollout `session_meta`, `turn_context.model` and subsequent call evidence | The spike verified exact native id/metadata matching and child-link fields for its available route. Its assistant responses lacked model fields, so the captured turn selections remain `session-record` evidence; actual-call semantics stay gated until proven. |
| OpenCode | Exact `session_v2` session/descendants and `session_message` | Native parent ids and message times; no global directory/time correlation. |
| Cursor | Exact chat `store.db`, `providerOptions.cursor.modelName` | Stable message positions/checkpoint deltas when per-call times are absent. Full-chat names without a run boundary stay session-scoped. |
| Antigravity | Exact conversation database, `gen_metadata` model field `1.19` | Verify event/step linkage. Unlinked names cannot prove usage by a named subagent or within the run. |

Readers expose format version, capabilities, model identifiers, supported times/positions and explicit parent/child links. Preserve gateway-qualified ids rather than merging similar provider aliases. The harvest is a format reference, not proof of five-host live coverage. The scoped probe inventory below covers its unverified surfaces.

### Checkpoints and dispatch configuration

Collect at start/resume, after each completed workflow step, before cooperative handoff and immediately before close. First attachment and resume use different rules:

- First attachment records the run's attachment boundary and source identity. With trustworthy event times, exclude calls before that boundary. With native event positions, accept a baseline only when it is successfully captured at attachment; retain the prior model-selection context for interpreting later events without counting that selection as a call.
- A failed initial read records an uncovered interval. A later successful read may recover it only when native times or invocation relations establish its bounds. Starting a new baseline at the later end does not erase the earlier gap.
- Resume of an already linked source starts at its last acknowledged checkpoint, never the new end. Preserve earlier parser context and collect the prior session before switching when its records remain accessible.
- Source cursors include a fingerprinted native source identity, generation/format, position, and the parser's carried model-selection context. A shrink, identity replacement or incompatible generation invalidates the cursor. Re-read within budget using stable event identities; retain a replacement/truncation gap for anything that cannot be recovered.
- Overlapping workflows in one chat require an explicit native invocation/child relation or a demonstrably exclusive interval. Time overlap alone cannot assign a call to a run or dispatch. Otherwise retain the model as session-scoped and report ambiguous ownership; do not confidently count it in both runs.

A crash before collection leaves a visible partial interval. Configuration snapshots and observed model facts remain separate even when their model strings match.

Before each actual subagent spawn, record its effective configured model, gateway, role and fingerprinted dispatch identity. Resolve the installed host role plus an explicit invocation override when available; a registry entry for an agent never dispatched is not fallback evidence. Record explicit child linkage and the return boundary when the host exposes them. A runtime override unknown to bkit remains unknown. This contract covers normal, resume, no-plan, per-group, retry and remediation invocation paths.

### Checkpoint acknowledgement

The run log is the authority for acknowledged source progress. A checkpoint is one complete validated `model-evidence` record containing the bounded evidence batch, source/range, prior checkpoint identity, next cursor/parser context, coverage and attempt summary. Its stable batch identity is derived from its run, source generation, range and normalized facts; retrying the same batch cannot create additional observations.

Serialize collectors for the same run/source through an owner-scoped lock under the Git common directory. Lock acquisition shares the checkpoint budget and stops after 250 ms; contention records `busy` and retains prior progress. Re-read the acknowledged predecessor while holding that lock. Integrate record appends with the existing status writer's serialization so other status events cannot interleave a checkpoint's bytes.

The parent validates the complete child result, appends the full record, flushes it, and confirms a complete parseable record with the expected identity before acknowledging it. Only then may it replace a disposable private cursor cache. A filesystem acknowledgement is local durability; the ordinary workflow commit carries that record across machines. A handoff must not describe an uncommitted checkpoint as remotely durable.

- Crash before append or failed/uncertain append: retain the previous acknowledged cursor and replay the batch when the source remains available.
- Crash after append but before cache update: rebuild the cursor from the acknowledged record and deduplicate replay by batch/event identities.
- Truncated, malformed or unconfirmed record: treat it as no acknowledgement and keep coverage partial. Do not advance the cache or automatically rewrite existing status bytes. If the existing status log cannot safely accept another record, stop evidence persistence, emit a sanitized persistence failure, and leave repository-log repair to its existing failure contract.
- Concurrent checkpoints with the same predecessor: the serialized later writer re-reads and either recognizes the already acknowledged batch or recollects from the new predecessor. It never overwrites another acknowledgement.

The verification contract includes crash-before-append, crash-after-append-before-cache, uncertain/truncated write, duplicate retry, competing collectors, failed initial read, same-chat resume, source replacement, carried model selection, and overlapping workflow/dispatch fixtures. The spike did not execute this protocol because it was not defined in the draft; those fixtures are required implementation evidence, not claimed passing results.

### Resource and privacy boundary

Use one child collector process so the parent can stop synchronous SQLite/transcript work. A checkpoint has an 8-second total budget, at most 2 seconds per host adapter, 256 candidate files, 32 MiB source bytes, 10,000 model-bearing records and 1,000 normalized evidence entries. The first exhausted bound stops collection, retains valid facts and reports `limited`. These are implementation constants, not user settings. Incremental cursors avoid full rescans; linked subagents share the same budget rather than multiplying it.

Use known schema/columns and bound session parameters. The spike found that Node 24.16 `readOnly: true` plus native backup changed an existing source SHM file and created it when absent, even though ten backup samples were coherent. Therefore neither the read-only option, existing sidecars nor successful backup authorizes opening a live host database.

The acquisition gate permits only a host-provided coherent export, an already immutable/quiescent host snapshot with proven completeness, or a source connection whose no-write boundary is enforced and footprint-tested for its actual storage route. Do not change host permissions, request the host to checkpoint, or copy a changing DB/WAL pair and infer coherence from unchanged sizes/timestamps. No compliant live SQLite route was proven by the spike. Until one is established for an adapter, do not open that live database; record `unavailable`/`partial` with an unsupported acquisition reason and retain prior facts. A proven source boundary can use Node's native transaction/backup to produce a private coherent snapshot, subject to the same budgets. Minimum Node 24.0.0 compatibility and each real schema/WAL route still require verification.

The parent owns the collector and any private temporary artifacts. Create a fresh symlink-safe directory below repo `tmp/` with owner-only access (`0700`, files `0600`), tied to a random invocation ownership token. Cleanup runs on success, error and timeout. At the 8-second deadline, terminate the child, allow at most 250 ms for exit, then kill and reap it; cleanup is the parent's responsibility. Reclaim only this feature's abandoned directories whose owner is proven dead, never another live invocation or a host-owned store. A crash that prevents cleanup leaves private files for that narrow reclamation path. Never create a missing host database, alter its schema, create host-side sidecars or form a path from an unvalidated id.

Only allowlisted metadata leaves readers. Model identifiers reject control characters and have a 256-character maximum. Diagnostic lines use `[bkit-telemetry]` plus a safe run reference, checkpoint identity, platform, state and counts. They omit raw exceptions, ids, paths, SQL values, prompts and credentials. The collector's 8-second budget plus 250 ms termination grace is the maximum additional collection delay; failed cleanup is reported without retry loops that extend it indefinitely.

## Data Model

The contracts below are additive. Do not rewrite old rows. Old sessions/outcomes without attribution display `not recorded`, rather than fabricated historical `unknown` observations.

### Status events

<!-- prettier-ignore -->
| Row | Fields and meaning |
| --- | --- |
| Existing `session` | Preserve `workflow`, `at`, `platform` and fingerprint field `session`. Add active-run linkage, evidence source and identity reason. New rows allow `session: null` and `platform: unknown`; start/resume no longer silently returns without a row. |
| Proposed `agent-dispatch` | Active-run linkage, dispatch fingerprint, parent session fingerprint when known, agent name, host, nullable `configuredModel`, gateway and configuration source. Configuration is explicitly unverified. |
| Proposed `agent-return` | Dispatch fingerprint and return boundary. An absent return leaves the interval open. |
| Proposed `model-evidence` | Active-run linkage, stable batch/checkpoint and predecessor identities, session/dispatch fingerprints, normalized model entries, source generation/range, next cursor/parser context, source/parser version, coverage and attempt summary. Persist one complete replayable record per checkpoint attempt; unchanged model facts are deduplicated. |

Run linkage uses the active workflow run identity already resolved by the status fold, not wall-clock overlap or the feature's latest run. Session dedupe includes the run and invocation/session association. One chat can participate in several runs; a resume cannot replace prior session history.

Each model entry carries `model`, optional `gateway`, `role: orchestrator|subagent|unknown`, an agent name/dispatch fingerprint only when explicitly linked, source adapter/format, supported first/last positions or times, and stable source-event/aggregate identity for retry deduplication. Two dimensions preserve the evidence meaning:

- `basis: observed-call|session-record|configured`.
- `scope: run|session|dispatch`.

An `observed-call` with `scope: run` is actual run usage. A `session-record` is a selected/recorded model without proof of a call in this run. A `configured` value is always unverified, even when the same string was observed elsewhere.

Coverage records `state: complete|partial|unavailable`, its supported interval/position range and reasons from `missing|unreadable|unsupported|ambiguous|busy|limited|not-flushed|no-model-record|unlinked-agent|configuration-unavailable|acquisition-unsupported|persistence-failed|source-replaced`. `complete` applies only to the collected range and supported capabilities, not future live-host records. `no-model-record` requires a recognized source that lacks that capability; a failed read does not establish it. Cursor/parser summaries contain normalized values and fingerprinted source identities, never native ids or paths.

### Fold, outcome and stats

Union distinct observed facts and retain the latest coverage assessment per source/range. A later fully collected range can resolve an earlier gap for that range. A failed later read cannot erase known observations or declare an uncovered earlier interval complete. Retries and union merges deduplicate model facts and dispatches.

Coverage counts describe distinct currently uncovered source/range pairs, not collection frequency. A separate per-checkpoint summary counts attempts, adapter errors, budget hits and persistence failures; its stable attempt identity prevents replay from inflating counts. Repeated identical failures therefore remain measurable without copying model facts. A persistence failure that cannot itself be written is visible in the command's sanitized diagnostic and remains an unacknowledged attempt; no durable count is claimed for an unwritten row.

Add optional `execution` to `OutcomePayload`: distinct hosts, observed models by role/agent, session-scoped model records, configured fallback summaries and coverage counts/reasons. Detailed session/dispatch fingerprints remain in the run log. Outcomes contain no consumer task names, prompts, local paths or feature identifiers. Do not overload `by.model`, which names a ledger row's author.

`closeWorkflow` writes its final evidence checkpoint before constructing the outcome from the fold. `restateOutcome` preserves `execution` when adding CI results. Update telemetry validation/normalization, folding, stats projection and harvest run consistency checks together. Add observation event types to the relevant `MARK_ROWS` sets and timing tests so they do not corrupt step durations.

`bkit stats` adds a per-run table using the existing workflow and run reference: hosts, observed orchestrator models, observed subagent models, unverified configured fallbacks and coverage. It reads outcomes only and never private host stores. Legacy absence displays `not recorded`; explicit new uncertainty displays `unknown`.

## Components / Flows

### Run lifecycle

1. The lifecycle command receives the actual current-runtime declaration.
2. The resolver corroborates its caller and validates the native chat association.
3. Start/resume appends a session row and initial bounded checkpoint.
4. Before each subagent spawn, record effective configuration and dispatch identity.
5. Completion/handoff checkpoints collect newly available facts while retaining prior sessions.
6. Close reconciles within the budget, folds the log and projects the outcome.

The proposed evidence interface is `bkit workflows evidence --file=<status> --workflow=<phase> --host=<platform>`. A dispatch mode records the named agent and effective configuration before spawn. Its final flags must be registered and documented with existing CLI contracts during implementation. These interfaces do not exist today. The engine coordinator owns parsing and limits; workflow shell snippets do not parse host stores.

### Commit creation

One message formatter normalizes only `bkit-host`. Use Git's trailer-aware parsing/insertion as its basis with a narrow duplicate/case policy, rather than adding a general message parser. Preserve the subject, body, unrelated trailers, co-author lines and skip-CI semantics. Remove duplicate or differently cased versions of this key from the newly composed message, then append one lowercase trailer with an allowlisted value. Normalize the formatter's final newline so a second pass is byte-identical. Do not rewrite old commits. The spike's four message fixtures establish this formatter concept, not every production message path.

Resolve the host for the current committing operation, independently of the run's first/last host or host union. For remote squash, the host requesting the workflow commit is the attributed actor; this names the workflow operation, not the server's Git process. A human/server action without established workflow-host context uses `unknown`.

<!-- prettier-ignore -->
| Commit surface | Integration |
| --- | --- |
| Step finishes, scoped paths, bookkeeping and triggers | Thread invocation context through `steps.ts` and existing `ledgers.ts` helpers into the formatter. |
| Direct workflow/leaf-agent commits | Extend existing commit instructions to receive current host context and use the same normalized message. |
| Failure records, handovers, roadmap mirrors and close commits | Preserve operation context through their existing entrypoints. |
| Throwaway `dev` landings and replay-created commits | Carry the requesting invocation explicitly; do not infer it from the throwaway path or borrow a source commit trailer for a newly authored operation. |
| `prs merge`, `branches land` fallback and ship squash | Supply an explicit body containing the normalized trailer. Preserve subject and matching-head checks. Printed MCP fallback payloads include that exact body, replacing corresponding empty-body instructions. |
| Existing commits carried without a new workflow operation | Preserve existing attribution. Newly authored merge/resolution commits use their current operation's context. |

Immediately before local commit execution or remote merge submission, assert that the final composed message has exactly one lowercase `bkit-host` trailer with an allowlisted platform value. Apply the same assertion to the exact printed MCP fallback body. Formatter/assertion failure prevents that commit operation; it does not authorize rewriting its subject, CI markers or unrelated trailers. Existing matching-head and publication gates still apply. Implementation verification must exercise CLI and MCP payload transport and inspect the resulting remote squash message; the spike did not exercise either remote route.

The resolver ignores foreign ambient identities, so correctness does not require launcher cleanup. Keep existing launcher environment behavior rather than stripping all `CLAUDE_CODE_*`: broad cleanup is incomplete for other nesting directions and can alter intended host settings.

### Failure and scope

A collection failure returns a typed reason, preserves valid facts, emits one concise diagnostic and lets the workflow continue. Final coverage may be partial because the host has not flushed the model event generating the close itself. Failure handovers attempt a bounded checkpoint; abrupt process/machine loss can leave the last interval uncollected.

Update `docs/observability.md` with the following reason-to-action contract when implementing this feature. It uses existing CLI diagnostics and ledgers and introduces no new alerting system.

<!-- prettier-ignore -->
| Reason | Action and recovery |
| --- | --- |
| `missing` / cross-machine unavailable | Preserve persisted facts and show the uncovered interval; absent local files cannot be reconstructed by guessing. |
| `unsupported` / `acquisition-unsupported` | Retain adapter/format capability and request a sanitized maintenance fixture or proven acquisition route; do not modify a host store. |
| `busy` / `not-flushed` | Retry at the next ordinary bounded checkpoint; do not ask the owner to unlock or copy a live database. |
| `limited` | Report the exhausted bound and replay from the last acknowledged cursor. |
| `persistence-failed` | Keep prior acknowledged progress, emit the safe run/checkpoint reference and sanitized write-failure class, and replay idempotently if the log remains usable. |
| `source-replaced` / ambiguous ownership | Retain earlier facts, revalidate source generation, and keep unrecoverable intervals or ownership session-scoped. |

The per-checkpoint attempt/error/budget-hit summary and current-gap counts answer different operational questions. A safe run reference plus checkpoint identity correlates diagnostics without disclosing native chats, paths or consumer task details. No external trace span or production paging is required for these local metadata reads.

Run cost remains the separately referenced cost issue. The design adds no billing, token accounting expansion, mandatory host launcher, broad retrospective scan or historical commit rewrite. These are existing issue boundaries, not new deferred work.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Follow Q1 with observed usage separate from dispatch-time configured fallback. | Treat pins as execution; hide useful configuration. | The owner accepted fallback only when clearly unverified. |
| Follow Q2 with all recorded sessions and initial/close collection. | Startup-only or close-host-only snapshots. | Model switches and resumed sessions are explicitly in scope. |
| Add bounded step/handoff checkpoints within Q2. | Read only the final machine's files. | A later machine cannot recover an earlier machine's lost files. Checkpoints preserve evidence without claiming recovery before collection. |
| Follow Q3-Q4 with exactly lowercase `bkit-host`, current operation host or `unknown`. | Mixed case, first host, all hosts, omitted unknown. | These alternatives contradict explicit owner answers. |
| Attribute remote squash to its requesting workflow host. | Call the server an agent host; copy PR-author identity. | The requesting workflow operation is the meaningful actor. This interpretation is surfaced rather than hidden. |
| Clarify the accepted draft Narrative and Success Criterion 3 with explicit evidence gaps. | Promise exhaustive usage despite inaccessible records. | Cross-machine loss, fail-open reads and asynchronous flush make unconditional completeness false. |
| Expand the draft Key Edge Cases and Process Sketch for cross-host skills, configuration changes and bounded completion. | Cover only nested CLI environment leakage. | The risk lens exposes independent routes to false attribution and hanging close. |
| Use corroborated declarations, scoped native evidence and conservative unknown. | Trust rendered skill paths, fixed variable precedence or latest marker. | Visible skills, inherited variables and concurrency defeat those shortcuts. |
| Keep process ancestry as bounded corroboration/fallback. | Make it the sole detector. | Brokers, sandboxes and containers can hide the real host. |
| Persist evidence in existing run logs and project optional outcomes. | New parallel ledger; read private files from stats. | The repository must retain the answer and existing readers already join sessions to runs. |
| Preserve exact host/provider model ids and sources. | Guess alias equivalence. | Similar names do not prove identical execution. |
| Keep launcher environment behavior. | Strip all Claude-prefixed variables. | Scoped attribution handles correctness without an incomplete behavioral change. |
| Add fields without backfilling history or a breaking migration. | Rewrite old rows with guessed attribution. | Historical absence is not evidence; no migration is required or authorized. |
| Keep five-host completion gated on proven normal-path capability, while permitting conservative implementation of shared parts. | Treat unknown-only support as completion; block all design work until every live host is available. | The reviews and spike leave core entrypoints unproven; runtime fail-open behavior does not replace the requested capability. The capability-proof question remains for the owner. |
| Require a proven no-host-write acquisition boundary before a live SQLite source is opened. | Trust `readOnly`, existing sidecars, successful backup or raw DB/WAL copying. | The spike observed SHM changes/creation despite coherent native backups. No compliant source route was established. |
| Acknowledge a complete persisted checkpoint before advancing cursors; rebuild private caches from the log. | Advance on successful parsing; trust disposable local cursors after restart. | A failed append must not permanently skip source evidence. |
| Distinguish first attachment, resume, source replacement and ambiguous overlapping ownership. | Reset the baseline at each resume; assign calls by time overlap alone. | Those shortcuts discard uncollected calls or falsely assign shared-chat work. |
| Adopt parent-owned private-artifact cleanup, attempt summaries and final-message assertions. | Leave cleanup to a timed-out child; count only latest gaps; trust every caller to retain the trailer. | The operational review's optional findings fit the existing scope and close specific failure paths. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Current-invocation context and host evidence adapters | KEPT | Extends rendering and the session lifecycle while separating declaration from proven linkage. |
| Scoped hook evidence and bounded process corroboration | MERGED | Strengthen the selected approach where causal transport is verified; neither is universal alone. |
| Checkpoints, dispatch snapshots and resource limits | MERGED | Preserve whole-run reporting across handoffs, configuration changes and unreadable stores. |
| Process ancestry as the sole detector | REJECTED | Brokers and restricted visibility make it inconclusive. |
| Hooks as sole authority | REJECTED | Hook delivery differs and does not automatically bind a later shell command. |
| bkit-owned wrappers for every host | REJECTED | Changes how users start work and still misses direct IDE/cloud entrypoints. |
| Retrospective repository/time correlation | REJECTED | Cannot prove ownership amid concurrent work or reliably attribute commits. |
| Fixed environment precedence or shared last-host marker | REJECTED | Can confidently select a parent or concurrent chat. |

## Trade-offs Accepted

- Conservative attribution gains inspectable evidence and accepts explicit unknown where the current caller cannot be established.
- Checkpoints retain cooperative handoff evidence and accept visible gaps after abrupt loss or before host flush.
- One stable reporting contract requires maintenance of five narrow, versioned readers.
- Built-in SQLite preserves zero runtime package dependencies, but a coherent backup does not prove no host writes. Live database adapters remain capability-gated until both requirements are demonstrated.
- Per-commit attribution requires every local/remote message construction path, including exact MCP fallback bodies.
- Configured fallback remains useful while some hosts cannot prove exact agent role or run interval.

## Verification Contract

Implementation evidence must cover the per-entrypoint capability table and each commit surface. Fixture success proves parser/protocol behavior; it does not prove an unavailable live host. Keep the spike's results with their exact scope: available Codex lineage/id metadata and local trailer fixtures yielded useful evidence; five-host binding, per-call model proof and the checkpoint protocol were not settled; generic live read-only SQLite access was disproven.

- Prove direct and both nested-host directions with distinct concurrent chats where the host is available. Confirm the receipt-to-command join or the independently supported platform/session route, not just the presence of variables.
- Capture sanitized model-format and child-link fixtures per host. Preserve Codex turn selection as `session-record` until actual-call semantics are demonstrated; selected model plus a later timestamp alone is not stronger proof.
- Execute the checkpoint acknowledgement and cursor matrix above against the implemented protocol, including concurrency and every failure boundary. Verify that ambiguous events remain session-scoped and failed reads never close earlier gaps.
- For each permitted database route, test source hashes and directory inventories with existing/absent sidecars and concurrent writes/checkpoints, and test coherent contents. Prove Node 24.0.0 compatibility as well as the actual host schema. The current spike's Node 24.16 backup coherence samples do not satisfy the no-write gate.
- Verify ordinary, failure, replay, landing and remote CLI/MCP message paths and their resulting commit messages. Assert exactly one lowercase `bkit-host`, idempotence, explicit unknown, unrelated trailers and unchanged CI semantics.
- Verify legacy session/outcome reads, close/restate preservation, timing-row exclusion, outcome-only stats, private-cache loss, cross-machine resume and parent cleanup on success/error/timeout/crash recovery.

## Risks & Open Questions

- **Late host flush:** Coverage ends at the last collected event. A close may precede the model record for its own final response; report the boundary rather than infer no usage.
- **Remote operation interpretation:** The design treats the host requesting a squash as the committing operation's host. This is the practical application of Q4; literal server-process identity would require a different contract.
- **Open question — capability proof boundary:** Should implementation proceed with explicit unknown/partial results on entrypoints whose live evidence cannot be verified in the design spike? Options: A) Proceed with shared components and per-route capability gates, requiring live proof before claiming five-host completion — permits useful progress while keeping the requested outcome pending. · B) Block implementation until all five hosts and supported entrypoints are live-verified — stronger pre-build confidence but needs access to every host. Recommended: A), because it preserves progress and the five-host completion requirement. Default if unanswered: A).
- **Open question — native model evidence:** Should unproven Codex call semantics and unavailable Cursor/Antigravity/Claude/OpenCode live captures remain capability gates rather than be promoted from session-level model records? Options: A) Keep the gates and retain selected/session models separately until sanitized fixtures plus live evidence establish run/agent ownership — honest coverage with unfinished capabilities visible. · B) Pause the affected readers until a dedicated live verification round supplies that evidence — less implementation rework but delays them. Recommended: A), because the evidence categories already preserve the weaker facts without claiming actual usage. Default if unanswered: A).
- **Open question — SQLite acquisition:** How should database-backed readers proceed while no no-host-write acquisition route is proven? Options: A) Develop shared decoding/reporting and investigate a host-provided coherent export or enforced no-write source route, keeping affected live reads disabled and five-host acceptance pending — preserves the original constraint but leaves a load-bearing gate. · B) Pause database-backed implementation until such a route is demonstrated — avoids speculative reader work but blocks those hosts earlier. Recommended: A), because the spike disproves a route rather than the whole metadata pipeline. Default if unanswered: A). Neither option authorizes host sidecar mutations, permission changes or an unsafe DB/WAL copy.
- **Open question — checkpoint proof:** Should the newly specified attachment/resume/acknowledgement protocol be implemented with its full crash, replacement, parser-context and overlap fixture matrix before enabling run-observed aggregation? Options: A) Require the matrix before enabling aggregation — gives the previously blocked spike claim a concrete implementation gate. · B) Run a separate disposable protocol spike before implementation — buys earlier feedback but duplicates a small portion of protocol work. Recommended: A), because the design now defines the policy the original spike could not exercise. Default if unanswered: A).
- **Open question — remote trailer delivery:** Should remote CLI/MCP merge paths remain gated until exact payload and resulting squash-message verification succeeds? Options: A) Require both integration checks during implementation before claiming trailer parity — preserves the accepted lowercase requirement beyond the local formatter. · B) Arrange a separate disposable remote integration exercise first — earlier API confidence but needs an authorized remote target. Recommended: A), because the local fixture result does not establish remote delivery. Default if unanswered: A).
