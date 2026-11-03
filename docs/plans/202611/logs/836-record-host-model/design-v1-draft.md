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
| Read-only SQLite access | Harvest `openDb`; Node's built-in `node:sqlite` | EXTEND | Reuse its sidecar-aware read-only concept with strict bounds; no runtime package or SQLite CLI dependency. |
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

### Model readers

The coordinator receives this run's recorded sessions and dispatch intervals and reads only their linked local records. A gitignored local locator cache keyed by platform and fingerprint may avoid repeated directory searches. Revalidate cached locators. Raw ids and paths remain in process memory or this private cache; committed rows, diagnostics, comments and trailers contain neither. Cache loss never invalidates persisted evidence.

<!-- prettier-ignore -->
| Host | Reader reference | Attribution boundary |
| --- | --- | --- |
| Claude Code | Main transcript `message.model`, exact-session subagent files and `.meta.json` | Explicit child links and per-call timestamps; preserve existing context-token semantics. |
| Codex | Rollout `session_meta`, `turn_context.model` and subsequent call evidence | Verify native id/rollout equivalence and child links. A selected turn model alone is weaker than an observed response. |
| OpenCode | Exact `session_v2` session/descendants and `session_message` | Native parent ids and message times; no global directory/time correlation. |
| Cursor | Exact chat `store.db`, `providerOptions.cursor.modelName` | Stable message positions/checkpoint deltas when per-call times are absent. Full-chat names without a run boundary stay session-scoped. |
| Antigravity | Exact conversation database, `gen_metadata` model field `1.19` | Verify event/step linkage. Unlinked names cannot prove usage by a named subagent or within the run. |

Readers expose format version, capabilities, model identifiers, supported times/positions and explicit parent/child links. Preserve gateway-qualified ids rather than merging similar provider aliases. The harvest is a format reference, not proof of five-host live coverage. The scoped probe inventory below covers its unverified surfaces.

### Checkpoints and dispatch configuration

Collect at start/resume, after each completed workflow step, before cooperative handoff and immediately before close. Initial collection establishes a cursor/baseline, excluding older turns in a reused chat. Capture the prior session before switching on resume when its local records are still accessible. A crash before collection leaves a visible partial interval.

Before each actual subagent spawn, record its effective configured model, gateway, role and fingerprinted dispatch identity. Resolve the installed host role plus an explicit invocation override when available; a registry entry for an agent never dispatched is not fallback evidence. Record explicit child linkage and the return boundary when the host exposes them. A runtime override unknown to bkit remains unknown. This contract covers normal, resume, no-plan, per-group, retry and remediation invocation paths.

### Resource and privacy boundary

Use one child collector process so the parent can stop synchronous SQLite/transcript work. A checkpoint has an 8-second total budget, at most 2 seconds per host adapter, 256 candidate files, 32 MiB source bytes, 10,000 model-bearing records and 1,000 normalized evidence entries. The first exhausted bound stops collection, retains valid facts and reports `limited`. These are implementation constants, not user settings. Incremental cursors avoid full rescans; linked subagents share the same budget rather than multiplying it.

Use known schema/columns, bound session parameters and read-only connections. Preserve the harvest's WAL handling: immutable reads only when no live WAL pages are required; use existing host-owned sidecars where safe; otherwise copy a bounded database/WAL snapshot under the repo's gitignored `tmp/` and establish that it is stable before reading. If stability cannot be established within budget, report `busy` or `partial`. Never create sidecars in host directories, create a missing database, alter schema or form a path from an unvalidated id.

Only allowlisted metadata leaves readers. Model identifiers reject control characters and have a 256-character maximum. Diagnostic lines use `[bkit-telemetry]` plus platform, checkpoint, state and counts. They omit raw exceptions, ids, paths, SQL values, prompts and credentials.

## Data Model

The contracts below are additive. Do not rewrite old rows. Old sessions/outcomes without attribution display `not recorded`, rather than fabricated historical `unknown` observations.

### Status events

<!-- prettier-ignore -->
| Row | Fields and meaning |
| --- | --- |
| Existing `session` | Preserve `workflow`, `at`, `platform` and fingerprint field `session`. Add active-run linkage, evidence source and identity reason. New rows allow `session: null` and `platform: unknown`; start/resume no longer silently returns without a row. |
| Proposed `agent-dispatch` | Active-run linkage, dispatch fingerprint, parent session fingerprint when known, agent name, host, nullable `configuredModel`, gateway and configuration source. Configuration is explicitly unverified. |
| Proposed `agent-return` | Dispatch fingerprint and return boundary. An absent return leaves the interval open. |
| Proposed `model-evidence` | Active-run linkage, checkpoint identity, session/dispatch fingerprints, normalized model entries, cursor summary, source/parser version and coverage. Persist new or changed evidence only. |

Run linkage uses the active workflow run identity already resolved by the status fold, not wall-clock overlap or the feature's latest run. Session dedupe includes the run and invocation/session association. One chat can participate in several runs; a resume cannot replace prior session history.

Each model entry carries `model`, optional `gateway`, `role: orchestrator|subagent|unknown`, an agent name/dispatch fingerprint only when explicitly linked, source adapter/format, supported first/last positions or times, and stable source-event/aggregate identity for retry deduplication. Two dimensions preserve the evidence meaning:

- `basis: observed-call|session-record|configured`.
- `scope: run|session|dispatch`.

An `observed-call` with `scope: run` is actual run usage. A `session-record` is a selected/recorded model without proof of a call in this run. A `configured` value is always unverified, even when the same string was observed elsewhere.

Coverage records `state: complete|partial|unavailable`, its supported interval/position range and reasons from `missing|unreadable|unsupported|ambiguous|busy|limited|not-flushed|no-model-record|unlinked-agent|configuration-unavailable`. `complete` applies only to the collected range and supported capabilities, not future live-host records. `no-model-record` requires a recognized source that lacks that capability; a failed read does not establish it.

### Fold, outcome and stats

Union distinct observed facts and retain the latest coverage assessment per source/range. A later fully collected range can resolve an earlier gap for that range. A failed later read cannot erase known observations or declare an uncovered earlier interval complete. Retries and union merges deduplicate model facts and dispatches.

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

One message formatter normalizes only `bkit-host`. Preserve the subject, body, unrelated trailers, co-author lines and skip-CI semantics. Remove duplicate or differently cased versions of this key from the newly composed message, then append one lowercase trailer with an allowlisted value. Do not rewrite old commits.

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

The resolver ignores foreign ambient identities, so correctness does not require launcher cleanup. Keep existing launcher environment behavior rather than stripping all `CLAUDE_CODE_*`: broad cleanup is incomplete for other nesting directions and can alter intended host settings.

### Failure and scope

A collection failure returns a typed reason, preserves valid facts, emits one concise diagnostic and lets the workflow continue. Final coverage may be partial because the host has not flushed the model event generating the close itself. Failure handovers attempt a bounded checkpoint; abrupt process/machine loss can leave the last interval uncollected.

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
- Built-in SQLite preserves zero runtime package dependencies but needs compatibility and stable-snapshot checks.
- Per-commit attribution requires every local/remote message construction path, including exact MCP fallback bodies.
- Configured fallback remains useful while some hosts cannot prove exact agent role or run interval.

## Risks & Open Questions

- **Probe inventory:** Verify Codex id-to-rollout association; live Cursor/Antigravity identity inputs; causally bound tool/hook or nearest-process identification for each supported entrypoint; and each host's child links/event boundaries. Bundle strings are not runtime contracts. Unavailable probes leave conservative, explicitly unverified capability results.
- **SQLite snapshots:** A live changing database/WAL copy needs a stable-snapshot probe. Unsupported or unstable snapshots remain partial rather than silently dropping WAL records.
- **Late host flush:** Coverage ends at the last collected event. A close may precede the model record for its own final response; report the boundary rather than infer no usage.
- **Declaration transport:** A rendered host value requires corroboration. Probe reports must enumerate local CLI, desktop, brokered and cloud entrypoints. Inaccessible current-caller evidence produces `unknown`.
- **Remote operation interpretation:** The design treats the host requesting a squash as the committing operation's host. This is the practical application of Q4; literal server-process identity would require a different contract.
- **Open question — capability proof boundary:** Should implementation proceed with explicit unknown/partial results on entrypoints whose live evidence cannot be verified in the design spike? Options: A) Proceed conservatively and require sanitized fixtures plus live proof before claiming each capability — permits progress without false coverage claims. · B) Block implementation until all five hosts and supported entrypoints are live-verified — stronger pre-build confidence but needs access to every host. Recommended: A), because the issue explicitly requires fail-open and unknown behavior. Default if unanswered: A).
