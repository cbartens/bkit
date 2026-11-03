# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Prevent inherited identity from becoming durable false evidence ⭐ Recommended

Use host-specific evidence bound to the current session and process lineage, corroborate it with the nearest identifiable host ancestor where available, and record `unknown` when the evidence conflicts or cannot identify the caller. Persist bounded model observations during the run, then reconcile them with available host records at close. This extends the existing session and outcome contracts without making a repository-wide “last host” marker authoritative.

The source confirms the present failure surface: `hostChat` in `.bkit/core/engine/commands/workflow/run-facts.ts` accepts only `CLAUDE_CODE_SESSION_ID`; `recordChat` in `workflows.ts` emits nothing when it cannot obtain that chat. The current `agentContextBlock` already links Claude subagent records through fingerprints and the run's time window. Those are useful seams, but neither environment presence nor time overlap alone establishes ownership when hosts nest or chats share a run.

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Concurrent sessions overwrite a shared marker; scanning all chat stores for every commit makes workflow operations slow; large transcripts exhaust memory. | Each observation reports its evidence source and coverage state. Bounded reads report a limit reached rather than “no models.” A conflict records `unknown` with a stable reason. | Use session-scoped records and direct session lookup. Read incrementally or at bounded checkpoints. Reuse previously persisted observations; a failed lookup does not block the workflow. |
| 6 months later | A host changes hook payloads, storage schemas or process names. A stale marker still looks valid, and configured models change before close. | Distinguish unsupported schema, missing record, unreadable record, conflicting identity and partial collection. Record a parser/source version sufficient to diagnose schema drift without copying raw payloads. | Reject unrecognised shapes, retain valid prior evidence, and report the gap. Update one host adapter and its sanitised fixtures. Capture configured models at dispatch, not from the registry at close. |
| On-call at 3am | A remote resume cannot access the earlier machine's transcript. The close appears successful but reports only the last host. SQLite is busy or a transcript ends in a partial write. | Report all known session fingerprints and hosts, models observed so far, and per-session coverage. Emit one bounded diagnostic for the unavailable source; never dump the host payload or its error text. | Finish the workflow with partial attribution. Preserve earlier persisted observations. A later reconciliation may add evidence if the original records become available; it does not invent earlier models. |
| Author leaves | The distinction between a selected model, an actual model call and a provider alias is understood only by the original author. | Adapter contract and fixtures identify the source field, role, session association and confidence of every model entry. The report labels configured fallback as unverified. | Maintain one evidence contract and a host capability matrix. A new maintainer can reproduce each unsupported case from sanitised fixtures and targeted host probes. |

### Risk-mitigation guidance

- Bind a host receipt to a session and its process lineage. A timestamp or matching working directory alone is insufficient when two hosts run in the same checkout. A parent hook's receipt inherited by a child host remains parent evidence.
- Prefer verified evidence from the current caller over an inherited environment variable. A fixed host precedence fails when nesting reverses; environment cleanup in `bkit cursor` and `bkit opencode` can reduce contamination but cannot prove which host runs arbitrary nested commands.
- Preserve the existing `chatFingerprint` algorithm for linked records. Keep raw chat ids and local transcript paths out of committed ledgers, diagnostics, issue comments and commit messages.
- Persist observed model facts at bounded workflow checkpoints and before a cooperative handoff. The accepted whole-run reporting requirement includes earlier sessions, but the fail-open constraint means an abrupt loss of uncollected local records remains a visible coverage gap. Startup plus final close alone cannot recover such records on another machine.
- Link subagents by the host's explicit parent/child relationship and the run's activity boundaries. A transcript's existence, a matching model name, or a broad time window does not prove that the agent participated in this run. Keep an observed model with an unknown agent name separate from a configured fallback for a named agent.
- Read host stores only. For SQLite, use a read-only connection that can see the live database state, including its write-ahead log when present; do not silently open a replacement empty database. Put byte, row, traversal and elapsed-time bounds around each adapter and expose truncation.
- Snapshot effective configured models for agents actually dispatched. Preserve gateway-qualified ids where needed; do not guess that identically named models from different providers are identical, or report every registry entry as work performed.
- Use exactly one lowercase `bkit-host` trailer with an allowlisted host value or `unknown` for each workflow commit. Resolve the current committing operation, not the run's first host. Carry this contract through ordinary commits, failure/handover commits, throwaway landing commits and remote squash/merge bodies. Preserve unrelated trailers and existing commit subjects.

## Approach B — Prevent stale hook state by making process ancestry primary

Identify the nearest recognised host in the current process ancestry, use environment and local host files only to resolve that host's session, and collect model observations through the same bounded evidence contract. This reduces reliance on shared hook state, but process ancestry becomes the load-bearing integration boundary.

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Every commit and workflow command repeats process enumeration; wrappers or subprocess fans multiply calls. A race exits or reuses a process while its lineage is being read. | Record which bounded ancestry probe supplied identity, or that it was inaccessible or ambiguous. Never expose command-line arguments, which may contain credentials or prompts. | Bound traversal and subprocess time, validate lineage continuity, and fall back to scoped host evidence or `unknown`; do not cache one host globally. |
| 6 months later | Host executable names change, desktop hosts route tools through brokers, and container boundaries hide the host process. | A host/version fixture matrix exposes unsupported entrypoints. Increased unknown results remain visible in run reports instead of being silently relabelled Claude. | Update process recognition narrowly and retain hook evidence as corroboration. A process probe that finds no recognised host is inconclusive, not proof of a particular host. |
| On-call at 3am | A detached terminal, IDE helper or sandbox makes the nearest recognised ancestor misleading or inaccessible. The model collector still reads the inherited parent's chat. | Identity and session association are separate results; a recognised host can have an unavailable session. Contradictory evidence produces an explicit reason. | Keep the host if independently established, omit the unsupported session link, and record model coverage as unknown. Never borrow a parent's session to fill a missing field. |
| Author leaves | Platform-specific process inspection and host-name heuristics become an undocumented compatibility table. | Supported OS and entrypoint cases are enumerated with fixtures and the evidence each supplies. | Keep the process probe behind one small interface and document the conservative fallback. Probe the actual nested-launch matrix before treating ancestry as universally available. |

### Risk-mitigation guidance

Apply Approach A's model checkpoints, role attribution, read bounds, privacy protection, configured/observed distinction and trailer coverage. Process ancestry solves only caller identification; it does not establish a model record's relation to the run. POSIX portability rules out making Linux-only `/proc` availability a required condition. Do not add an unrestricted scan of process command lines or a permanent monitoring service.

## Approach C — Prevent process-probe dependence with host hook receipts only

Have each host adapter produce a scoped receipt from its own hook or plugin payload, then let workflow commands consume that receipt. This is attractive where the host gives a reliable session id, but it fails silently if a hook is missing, disabled, untrusted or cannot convey a receipt to its exact child command.

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Concurrent hooks race on one file, and a repo-level receipt identifies whichever host ran most recently. | A receipt includes session scope and a causal association to the caller. Ambiguous matching is visible as `unknown`. | Use isolated receipt keys and atomic writes, with no “newest marker wins” fallback. Bound retention and avoid deleting receipts another live session still needs. |
| 6 months later | Hooks change event shapes, a consumer owns its hook driver, or a host starts through an entrypoint without that hook. | Run logs distinguish absent receipt from malformed receipt. Installation checks can describe missing wiring without making telemetry a workflow gate. | Preserve fail-open operation, update the adapter and its fixtures, and let supported evidence sources recover attribution. Never claim installation of a host proves that it is the active host. |
| On-call at 3am | A nested child inherits the parent's receipt while its own hook does not run. An apparently authoritative marker now lies. | Receipt-to-process binding fails or multiple candidates conflict. A parent receipt is shown as rejected evidence, without raw ids. | Record `unknown`; do not trust a marker solely because it came from a bkit hook. The process corroboration in Approach A supplies a recovery path this approach lacks. |
| Author leaves | Session-start is assumed to exist uniformly across five hosts, although each has a different hook/plugin lifecycle. | Document supported event payloads and limitations per host. Tests cover a disabled hook and overlapping sessions, not just a fixture containing a chat id. | Keep adapters host-specific and reuse shared validation. Prove transport from hook to workflow command on each supported entrypoint before relying on it. |

### Risk-mitigation guidance

Apply Approach A's evidence collection and commit guidance. Existing hook support is a useful integration point, but `.bkit/providers.md` shows different lifecycles: Claude and Cursor have session-start hooks, while Codex, Antigravity and OpenCode also use tool hooks/plugins. Do not design around an unverified universal session-start event or assume a child hook can mutate its parent process environment.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend corroborated, session-scoped evidence with explicit unknown and partial states. | Fixed environment precedence; one latest-host marker; ancestry as the only source. | Nested launches and concurrent worktrees make false confidence more damaging than a clearly reported gap. |
| Preserve the owner's Q1 and Q2 decisions: actual model evidence is distinct from configured fallback, and reporting spans the whole run. | Record the final model only; reconstruct earlier configuration at close. | Model switching, registry changes and remote resume otherwise turn a plausible value into a false historical claim. |
| Add bounded evidence checkpoints within the accepted whole-run scope. | Rely exclusively on the final host's local files. | The final machine cannot read an earlier machine's lost transcript. Checkpoints preserve evidence already obtained; they cannot guarantee recovery after an abrupt loss before collection. |
| Preserve Q3 and Q4 with the exact trailer `bkit-host`, one value for the committing operation or `unknown`. | Mixed-case spelling; first-host value; all hosts on every commit; no trailer on uncertainty. | These alternatives contradict the explicit owner answers. Squash and merge paths must preserve the same meaning. |
| Reuse existing session fingerprints and shipped telemetry contracts; extract only the model-reader capability needed from the harvest reference. | Import the unshipped harvest or copy its global all-chat scan. | The harvest is intentionally maintainer-local and broad; consumer workflow attribution must be scoped, read-only and bounded. |
| Keep host attribution independent of model availability. | Make a missing model erase a known host, or use a model vendor to infer a host. | Hosts and providers are separate axes in `.bkit/providers.md`; a known host with unknown model is still useful evidence. |

## Cross-Approach Risks

- **Unproven host surfaces:** The input explicitly leaves Codex rollout-id equivalence and live Cursor/Antigravity environment probes unverified. The design should name these as probe claims rather than treating bundle strings as a runtime contract. No live host-storage or external documentation verification was performed in this brainstorm.
- **Different machines and asynchronous flush:** Whole-run reporting must distinguish complete evidence from partial evidence. A close can precede the host writing its final model record; an earlier machine may be unavailable. Checkpoints reduce loss but do not justify claiming exhaustive coverage without supporting records.
- **Resume boundaries:** Timestamp overlap alone can include unrelated turns when a chat performs more than one workflow. Use explicit session association and the narrowest supported event boundaries. Duplicate checkpoints and outcome restatements must fold without duplicating observed models or erasing prior coverage gaps.
- **Commit creation semantics:** A remote squash creates the Git object on a server, while a host requests the operation. Define which evidenced actor supplies `bkit-host` for that path and use `unknown` if it cannot satisfy Q4's committing-host meaning. Do not silently reuse the PR author's host or a copied source commit trailer.
- **Partial commit coverage:** A single engine helper will not automatically cover direct agent `git commit` calls, throwaway landing worktrees and GitHub squash merge bodies. The design needs an explicit inventory of these paths and their trailer inputs. Replacing global Git hooks would exceed this issue's focused need.
- **Sensitive and adversarial records:** Session ids, paths, prompts and provider errors can leak through diagnostics even when the main ledger uses fingerprints. Validate extracted model identifiers and trailer values, restrict fields, and never execute transcript content or interpolate it into shell text.
- **Compatibility and durability:** Additive model data must survive telemetry validation, outcome restatement, stats aggregation, harvest and ledger folding. Older rows without attribution mean “not recorded,” not a fabricated historical host. `stats.jsonl` remains free of consumer task details, consistent with `docs/decisions.jsonl`'s active decision on harvested telemetry.
- **Fallback accuracy:** A configured model should refer to an agent that actually ran and the effective configuration at dispatch. If that configuration was not captured, mark it unavailable instead of silently substituting a newer registry value. Preserve observed models even when the host cannot name their subagent role precisely.
- **Fail-open cost:** Fail-open means both “does not fail the close” and “does not hang the close.” Bounded probes, read-only database access, partial-read detection and concise diagnostics are required across all five adapters.
