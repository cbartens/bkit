Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

The review read the supplied input and draft, the document index, relevant architecture, technology, security and authoring context, and scoped source sections. Serena refused the worktree path because its active main-checkout project ignores `.worktrees`; scoped worktree text reads supplied the code evidence instead. The capability register confirms the workflow/telemetry modules but does not enumerate the requested host functions. Its missing symbol hits were corroborated with known module hits and direct source searches, not treated as proof of absence.

<!-- prettier-ignore -->
| Capability | What exists and fit | Recommendation |
| --- | --- | --- |
| Session identity and fingerprints | `run-facts.ts:320-350` contains Claude-only `hostChat`, the existing SHA-256 fingerprint and `runChats`; `workflows.ts:217-240` appends/deduplicates session rows. These are shipped and already consumed at close. They lack all-host attribution and explicit unknown records. | EXTEND-EXISTING. Keep these public seams and fingerprint compatibility; extract the resolver behind them if needed. Calling the internal resolver a new module must not create a parallel identity path. |
| Host-native input | Existing rendering and hook drivers provide per-host extension points. `antigravity-hook.js:1-29` documents a live-verified tool payload with `conversationId`, tool arguments and workspace roots. It proves receipt of a host event, not automatic binding to a later shell command. | EXTEND-EXISTING. Specify a verified binding path per entrypoint. Do not build a generic receipt bus before the host evidence supports it. |
| Model and subagent readers | `agentContextBlock` reads exact Claude session subagent transcripts; harvest contains Codex turn/model/token events, OpenCode session parent links, Cursor model names and Antigravity metadata. Harvest is unshipped and its broad scans and heuristic attribution are unsuitable for the new authoritative path. | ADAPT. Move only the narrow reading/decoding capability into shipped readers, with sanitized version fixtures and explicit capability gaps. Reuse the existing Claude parser rather than maintaining two incompatible interpretations. |
| SQLite reads and snapshots | Harvest `openDb` at lines 2497-2530 uses built-in SQLite, immutable/no-WAL reads, existing sidecars, then a separate database/WAL copy. That last branch has no transactional snapshot proof. Node 24.0.0 already provides `sqlite.backup`; SQLite read transactions provide snapshot isolation. | ADAPT. Prefer a verified read transaction or built-in backup when the source can be opened without violating host-file constraints. If it cannot, return a gap unless the copy has a proven coherent acquisition protocol. See C2. |
| Checkpoint execution bounds | Node child-process APIs provide process isolation, timeouts and signals. Existing status append/fold machinery provides durable rows; `MARK_ROWS` in `run-facts.ts:338` already excludes observations from step timing. | EXTEND-EXISTING for lifecycle and rows; USE-AS-IS for process primitives. A small coordinator is justified, but no new service, scheduler or general scanner is needed. |
| Effective subagent configuration | Existing rendered role files and `render/models.ts` are configuration sources; none proves actual execution or an invisible runtime override. | EXTEND-EXISTING. Capture available configuration at dispatch and preserve the draft's explicit unavailable/unverified semantics. |
| Commit metadata | `commitOwnSet` in `ledgers.ts:557` already constructs messages and handles scoped commits. Other listed landing/merge paths need the same message policy. Git provides `interpret-trailers` for trailer-aware parsing/insertion. | EXTEND-EXISTING / ADAPT. Use existing message constructors and Git trailer semantics. Git's `replace` removes only the nearest matching trailer, so duplicate removal and exact lowercase normalization still require a narrowly tested policy. |
| Outcome and reporting | Existing `OutcomePayload`, close/restate, stats and harvest consumers are the correct integration surface. The current Claude context block is not a general model-execution block. | EXTEND-EXISTING. The proposed optional `execution` block is a reasonable additive contract; preserve older rows as not recorded and keep `by.model` separate. |

Official prior-art searches covered Node built-in SQLite/child-process support, live SQLite snapshot safety, Git trailer handling, and 2026 agent/model provenance conventions. OpenTelemetry's published GenAI attribute reference distinguishes requested and response models and identifies conversations and agents; this supports the draft's separation of configured and observed evidence, but an OpenTelemetry SDK would not discover these five hosts' private stores or current invocation. No ecosystem package was found that replaces the scoped adapters within the dependency and privacy constraints. [OpenTelemetry GenAI attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)

## Stack Feasibility

The design is implementable with Node.js 24+, TypeScript and the existing CLI/ledger architecture. It introduces no runtime package, server, database service or mandatory launcher. A separate collector process is appropriate because `DatabaseSync` calls execute synchronously.

The metadata pipeline is feasible; universal successful host attribution is not yet demonstrated. The draft correctly allows unknown results, but that fallback must not substitute for proving a working normal path for each of the five hosts. C1 makes the distinction an explicit acceptance boundary.

The data model is plausible but needs the cursor/attribution rules in C3. A session fingerprint establishes which chat produced a record, not which overlapping workflow in that chat owns each model call.

## Library / API Evaluation

<!-- prettier-ignore -->
| Surface | Maturity, footprint, types and license | Fit / limitation |
| --- | --- | --- |
| Node `node:sqlite` | Built into the approved runtime; no new npm dependency or separately shipped binary. Node 24.0.0 labels the API active development and exposes `DatabaseSync`, `readOnly`, `timeout` and `backup`. The repo pins `@types/node` 24.19.2. | Validate against the minimum supported Node 24.0.0 API, not just the newer installed typings. Host schema compatibility remains bkit's responsibility. [Node 24.0.0 SQLite](https://nodejs.org/download/release/v24.0.0/docs/api/sqlite.html) |
| Node filesystem, crypto and child processes | Existing runtime facilities; TypeScript types are already available. Node's license includes its MIT-licensed core and listed third-party notices. | Use argument-vector subprocess calls, strict read budgets and parent-enforced termination. No new execution framework is warranted. [Node license](https://github.com/nodejs/node/blob/main/LICENSE) |
| SQLite storage format and backup | Mature embedded storage; public-domain library. Read transactions and the online backup API are established consistency mechanisms. | Raw database/WAL copies are not equivalent to a transactional snapshot. Opening read-only may still interact with sidecars, so the no-host-write requirement needs a footprint probe. [SQLite isolation](https://sqlite.org/isolation.html), [backup API](https://sqlite.org/backup.html), [copyright](https://www.sqlite.org/copyright.html) |
| Git trailer parser | Existing Git executable, no new dependency; mature CLI with explicit insertion and replacement policies. | Preserve unrelated message bytes/trailers and control configuration effects. `--if-exists=replace` alone does not remove all duplicate keys. [Git trailer reference](https://git-scm.com/docs/git-interpret-trailers) |
| Host transcripts and databases | Private/versioned local formats, not a stable common SDK. Existing harvest code gives useful evidence of adoption inside this repository. | Record parser/version capability and fail open on unsupported shapes. Do not claim a proprietary host schema or bundle string is a guaranteed runtime API. |

## Integration Risk

The blast radius is broad but follows existing seams: five host renderers/hooks, all five workflow lifecycles, agent invocation blocks, status/telemetry codecs, timing folds, stats, harvest checks and local/remote commit constructors. This is a single-package repository; there is no monorepo service boundary to introduce.

The highest risks are identity transport across a hook/tool/CLI boundary, model-call ownership when chats are reused, and preserving exact MCP merge bodies while adding the lowercase trailer. The design already inventories ordinary, failure, landing, replay and squash paths. The plan must turn that inventory into coverage rather than relying on one helper change to reach all paths.

Keep the existing context-token block's meaning unchanged. New observation rows must be excluded wherever time accounting uses status-row adjacency. Additive fields require real old-row fixtures and a close/restate round trip so enrichment is not discarded.

## PoC Approach

Use one small disposable probe per claim, confined to the workflow spike directory. First capture sanitized host/tool metadata and parent executable identities for available direct and nested entrypoints, proving the proposed receipt-to-command join without recording ids or arguments. Verify Codex native id/rollout and child linkage. For each model store, establish whether a call can be assigned to a bounded run or only to its session. Use synthetic reused-session and overlapping-run fixtures to prove cursor carry-forward and ambiguity handling. Exercise a temporary SQLite WAL writer and reader to compare a native read/backup snapshot with the proposed acquisition route, checking source hashes and directory entries before and after. Finally, run trailer normalization on message fixtures, including duplicate/mixed-case keys, unrelated trailers and explicit squash bodies. Unavailable live hosts are marked blocked, not simulated as verified.

## Unknowns & Blockers

- **P1 — Current-caller binding:** Can each supported entrypoint provide a receipt or nearest-process identity that survives the actual shell/broker topology and distinguishes nested hosts in both directions? Run probes; source names alone cannot settle this.
- **P2 — Native chat/model linkage:** Confirm Codex id-to-rollout mapping, Cursor and Antigravity live ids, child links, model-call versus selected-model meaning, and event positions/times. A host that exposes only session-level evidence cannot be labelled run-observed.
- **P3 — Safe SQLite acquisition:** Prove the chosen read/backup path includes committed WAL records while leaving the host's files and sidecar inventory unchanged, including absent-SHM and concurrent-checkpoint cases.
- **P4 — Cursor and overlap behavior:** Demonstrate resume on the same chat, a failed initial read, transcript truncation/replacement, a model selected before the baseline but used after it, and two overlapping workflow ranges.
- **P5 — Trailer normalization:** Verify exactly one lowercase `bkit-host` for representative local and remote message bodies without changing other trailers or subject semantics.

These are load-bearing experiments, so `Spike: true`. No probe, implementation, install or live host launch was performed in this review.

## Verdict Reasoning

`CONCERNS`: the approved stack supports the architecture, and the draft generally reuses the correct existing seams. Three addressable caveats remain before the design can serve as a reliable implementation contract. None establishes that the entire feature is infeasible. Unknown or partial telemetry is a valid runtime result, but unresolved core host support cannot be described as completed five-host coverage.

## CRITICAL

### C1 — Turn the host evidence contract into a per-entrypoint capability gate

The Current-caller evidence section requires direct invocation/process binding but does not specify a demonstrated transport for any host. Hook children cannot export state into future shell calls; parent executable names do not by themselves prove that an environment chat id belongs to that process. The existing Antigravity payload is useful prior art, not proof of the proposed join.

Add a capability table naming the concrete receipt fields, how the later command selects that receipt, how nested/concurrent calls are rejected, and the evidence status for each supported entrypoint. The spike must prove available routes. A blocked route may remain explicitly unresolved during design, but its default must not turn five-host success into five hosts that always report unknown. Keep the owner's capability-proof question visible and identify which required behavior it would limit.

### C2 — Choose a concrete, coherent SQLite acquisition protocol

The Resource and privacy boundary says to copy a live database/WAL and establish stability, but does not define a method that guarantees one database state. The harvest's two `copyFileSync` calls are a reference reader, not a consistency guarantee. Comparing sizes or timestamps alone is insufficient when the writer checkpoints or changes pages during acquisition.

Prefer SQLite's existing read-transaction or online-backup capability when a source connection satisfies the no-host-write constraint. Specify how the minimum Node version opens it, which sidecars may be touched, and how the bound is enforced. If that safe connection is unavailable, return `busy`/`partial` unless a genuinely coherent snapshot mechanism is proven; do not invent a general file-copy stabilization algorithm. This is both a missing algorithm and a built-in reuse opportunity. [SQLite backup API](https://sqlite.org/backup.html), [SQLite read-only WAL constraints](https://sqlite.org/wal.html)

### C3 — Define baseline, resume and shared-chat attribution rules

“Initial collection establishes a cursor/baseline” does not distinguish the first attachment from resuming an already-recorded session. Resetting the cursor on resume can discard uncollected in-run events; starting at the new end after a failed initial read can hide the gap. Codex parsing also needs the model selection preceding a cursor to interpret later calls, as harvest `scanCodex` shows.

Specify first-attachment versus resume cursors, durable checkpoint acknowledgement, source replacement/truncation detection, and carry-forward parser context. Define how a model event is assigned when one chat has overlapping workflow/dispatch ranges: require an explicit invocation/child relation or retain ambiguous session-scoped evidence, rather than assigning the same event confidently by time alone. Include these cases in the spike and verification contract.

## OPTIONAL

- Use Git's trailer-aware parsing/insertion as the formatter's basis and document the small additional duplicate/case policy, rather than writing a general commit-message parser.
- Keep the per-host/entrypoint capability table in the final design so a planner can distinguish implementation work from unavailable live verification without asking the same questions again.

## OUT OF SCOPE

None. Cost accounting, broad retrospective harvesting and historical commit rewriting remain the input's explicit exclusions.
