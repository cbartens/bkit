Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

<!-- prettier-ignore -->
| Claim | Design dependency | Result |
| --- | --- | --- |
| P1: Each supported direct, nested, brokered and cloud entrypoint can bind its current host and native session to the later workflow command. | Current-caller resolver, session records and commit attribution. | BLOCKED. This Codex desktop route exposes a useful executable chain; the proposed receipt transport does not exist, and other live entrypoints were unavailable. |
| P2: Native host records prove the chat, model-call and child-agent associations required for run-level attribution. | Five host readers and observed-model reporting. | BLOCKED overall. Exact Codex thread-to-rollout metadata linkage and native child-link fields were observed in this session. Other hosts and per-call model proof remain unverified. |
| P3: A Node read-only connection plus native backup can read committed WAL state without changing any host file or sidecar inventory. | The draft's existing-sidecar read/backup acquisition route. | DISPROVEN. The source shared-memory sidecar changed even with existing sidecars, and was created when absent. |
| P4: The proposed cursor/fold protocol correctly handles first attachment, resume, failed reads, source replacement, carried model selection and overlapping workflow ranges. | Durable checkpoint and exact run attribution. | BLOCKED. The reviewed draft has no executable protocol and leaves the relevant ownership/acknowledgement rules unspecified. |
| P5: A bounded formatter based on Git trailer operations can produce one lowercase `bkit-host`, preserve representative message bodies/unrelated trailers and remain idempotent. | Local and remote commit-message construction. | SETTLED for the four exercised message fixtures. Actual remote API delivery remains outside this formatter claim. |

## Method

All commands ran from the required feature worktree. Probe programs live only in `docs/plans/202611/logs/836-record-host-model/spike/`. Node was `v24.16.0`; the exact minimum `24.0.0` runtime was not installed or downloaded.

- P1: `node docs/plans/202611/logs/836-record-host-model/spike/p1-caller.mjs`. Read only allowlisted variable-presence booleans and parent executable names, with 16-hop/250 ms bounds. The sandbox denied `ps`; the approved elevated retry used the same probe. No process arguments or ids were printed. No other host or paid session was launched.
- P2: `node docs/plans/202611/logs/836-record-host-model/spike/p2-codex.mjs`. Looked up the current native thread's filename in the local Codex sessions directory and compared its metadata in memory. Printed only equality, schema-key, count and model-name results. No raw id, private path or transcript text was retained.
- P3: `node docs/plans/202611/logs/836-record-host-model/spike/p3-sqlite.mjs`. Used real Node `DatabaseSync` and `backup` APIs with a disposable WAL writer. Compared source directory inventories and SHA-256 content fingerprints before and after backup. An absent-SHM fixture was copied from the probe's own quiescent writer; that copy prepared a fixture and is not a proposed host acquisition method. A second process performed 100 atomic updates/checkpoints while ten native backups were checked for integrity and matching generation values. The probe removed its scratch databases and sidecars on completion.
- P4: No substitute implementation was written. A synthetic state machine would choose the missing policy on the design's behalf and prove only that chosen policy. The review's fixture cases remain required once the design defines the protocol; they cannot establish live host event ownership by themselves.
- P5: `node docs/plans/202611/logs/836-record-host-model/spike/p5-trailers.mjs`. Exercised real `git interpret-trailers` with subject-only, duplicate/mixed-case, explicit squash-body and unknown-host fixtures. Iteratively replaced only the matching trailer with an empty value under `--trim-empty`, inserted the normalized lowercase key and normalized the trailer's final newline. Asserted exact expected messages, unrelated trailers, one matching key and idempotence. No Git commit or remote merge was created.

Vendor references: [Node 24.0.0 SQLite](https://nodejs.org/download/release/v24.0.0/docs/api/sqlite.html) documents native backup. [SQLite WAL read-only rules](https://sqlite.org/wal.html#read_only_databases) allow sidecar creation in writable directories. [Git trailer options](https://git-scm.com/docs/git-interpret-trailers) define parsing, replacement and empty-trailer removal. These are API references; captured execution below determines the results.

## Evidence

### P1 — Sandbox attempt

```text
environment-presence={"CLAUDE_CODE_SESSION_ID":false,"CODEX_THREAD_ID":true,"CODEX_SESSION_ID":true,"OPENCODE_SESSION_ID":false,"CURSOR_CONVERSATION_ID":false,"CURSOR_AGENT_CHAT_ID":false,"ANTIGRAVITY_CONVERSATION_ID":false}
process-probe={"status":null,"code":"EPERM","stderr":""}
executable-chain=[]
receipt-to-command-binding=not-implemented
```

Exit code: `0`. The probe reported the failed source rather than treating an empty chain as proof.

### P1 — Approved retry

```text
environment-presence={"CLAUDE_CODE_SESSION_ID":false,"CODEX_THREAD_ID":true,"CODEX_SESSION_ID":true,"OPENCODE_SESSION_ID":false,"CURSOR_CONVERSATION_ID":false,"CURSOR_AGENT_CHAT_ID":false,"ANTIGRAVITY_CONVERSATION_ID":false}
executable-chain=["node","codex","ChatGPT"]
receipt-to-command-binding=not-implemented
```

Exit code: `0`.

### P2 — Available Codex session

```text
thread-id-present=true
matching-rollouts=1
child-link-keys={"thread_spawn":["parent_thread_id","depth","agent_path","agent_nickname","agent_role"]}
rollout-evidence={"nativeIdEqualsMetadata":true,"turnContextModels":["gpt-6-astra","gpt-6.1-sol"],"assistantResponseCount":26,"assistantResponsesWithModel":0,"sourceKind":"object","sourceKeys":["subagent"],"timestampedResponses":26}
```

Exit code: `0`. These are the values captured during the probe; the live transcript can subsequently grow.

### P3 — Native SQLite backup

```text
existing-sidecars={"snapshot":{"n":2,"lo":7,"hi":7,"integrity":"ok"},"changedSourceFiles":["host.db-shm"]}
absent-shm={"snapshot":{"n":2,"lo":7,"hi":7,"integrity":"ok"},"changedSourceFiles":["host.db-shm"],"createdShm":true}
concurrent-backups={"samples":10,"coherent":true,"writerExit":0,"writerStderrEmpty":true}
```

Exit code: `0`. Coherent backups and unchanged host files are separate requirements; coherence passed these samples while no-write failed.

### P4 — Unavailable protocol

Not run. No executable checkpoint/cursor protocol exists in the supplied draft, and the review explicitly leaves baseline, resume, parser carry-forward and overlapping attribution rules unresolved. No output or exit code is claimed.

### P5 — Trailer fixtures

```text
subject-only=PASS
mixed-case-duplicates=PASS
explicit-squash-body=PASS
unknown=PASS
remote-api-delivery=not-exercised
```

Exit code: `0`.

### Probe authoring corrections

The first P1 attempt passed a fractional timeout to `spawnSync` and failed with `RangeError [ERR_OUT_OF_RANGE]`. It was corrected by flooring the computed remaining milliseconds before the recorded sandbox attempt above. This was a probe-program error, not evidence against host attribution.

The first P5 implementation preserved an extra trailing blank line after removing and reinserting a trailer, so the idempotence assertion failed. Normalizing the final trailer newline repaired the probe without removing or weakening that assertion. Both failed authoring attempts preceded the successful runs above; no production source was changed.

## Design Impact

P3 invalidates treating `readOnly: true`, pre-existing sidecars or successful native backup as sufficient proof of zero writes to the host store. Even read operations updated the shared-memory sidecar in the observed writable-directory case. The absent-SHM route created a host-side file.

The design should require a source connection whose no-write behavior is enforced and verified for its actual storage route, or return `busy`/`partial` without opening that route. A genuinely write-denied source, a host-provided coherent export, or another proven snapshot boundary may be investigated; none was proven here. Do not change host permissions or copy live database/WAL files and call timestamp/size stability a coherent snapshot. Native backup remains useful after a compliant source connection is established.

P1 supports bounded ancestry as evidence on this available Codex desktop topology. It does not establish a session-to-command receipt, nested-host precedence in both directions, or universal desktop/cloud coverage.

P2 supports exact Codex native id/metadata matching and native child-link availability for this session. Preserve the distinction between a selected `turn_context` model and a response's actual model; these captured assistant response records did not carry a model field.

## Unsettled

- P1 needs a concrete receipt-selection protocol and live direct/nested probes on each supported host/entrypoint. Available ancestry alone cannot bind an inherited native chat id to the current process. Unavailable routes must retain `unknown`; they cannot count as proven five-host normal-path support.
- P2 needs live Cursor/Antigravity ids and event/agent linkage, corresponding Claude/OpenCode captures, and an explicit policy for what Codex turn selection plus subsequent call evidence proves. No unavailable host was simulated. A chat-level model must remain session-scoped when run or child ownership cannot be established.
- P3 still needs a no-host-write acquisition route. The ten coherent native backups do not settle the minimum Node version, real host schema variants or sidecar-write avoidance.
- P4 needs first-attachment versus resume rules, failed-initial-read gap retention, durable acknowledgement before cursor advancement, source identity/replacement detection, parser-state carry-forward, and explicit relation-or-ambiguity ownership rules. Then execute the named fixture matrix against that protocol. This spike does not claim a model call can be assigned to an overlapping run by timestamp alone.
- P5's local fixture result does not exercise GitHub MCP/CLI payload transport or a server-created squash commit. Those integrations still need to preserve and verify the exact formatted body during implementation.

## Verdict Reasoning

`FAIL` follows the required spike rule: at least one load-bearing claim is `DISPROVEN`. The generic read-only SQLite acquisition assumption fails the captured footprint check. P1, P2 and P4 also retain blocked parts; P5 establishes the bounded formatter concept for its exercised fixtures. This verdict reports design evidence, not an implementation failure or a claim that the overall feature is impossible. Apply the disproof and unresolved capability boundaries in the reviewed design before planning implementation.
