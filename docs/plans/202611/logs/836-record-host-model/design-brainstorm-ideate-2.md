# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Host evidence adapters with invocation-scoped identity ⭐ Recommended

Treat host identity, chat linkage and model usage as separately evidenced facts, normalize them through one host-adapter boundary, and retain their provenance in the run's existing session log.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `MEDIUM`. Five adapters and a common evidence model require more initial work than extending an environment-variable switch. |
| Extensibility | A new host implements identification and model observation without changing reporting, run aggregation or commit formatting. An adapter can report that a capability is unavailable. |
| Risk | A supposedly current hook marker actually belongs to an ancestor or another concurrent chat. Binding evidence to the invoking process or a host-provided invocation identity is the critical requirement. |
| Maintenance | Local transcript and database readers need versioned fixtures and explicit unsupported-format results. The common normalization and reporting code remains stable. |
| Friction vs ideal | Replace the Claude-only assumption in `hostChat` and `recordChat`, add shipped equivalents of the harvest's relevant readers, extend status and telemetry codecs, update hooks and host rendering, and cover every workflow commit-producing path. Existing fingerprints and session rows remain usable. Older rows continue to read as having no recorded evidence. |

The ideal boundary returns facts with their source and availability, rather than a bare host string. Identification can succeed while the chat id is missing. Model reading can fail while identity remains certain. A configured model remains a separate unverified value, never an observed model.

Identification follows the strongest evidence scoped to the current invocation. A host-specific hook or tool context is useful only when its association with this command can be established. A shared repository marker, a latest-file lookup and fixed environment-variable precedence each fail under concurrent or nested hosts. Parent-process evidence can corroborate the current host where available, but ambiguous or inaccessible evidence resolves to `unknown`. Process command lines should not be retained because they may contain prompts or credentials.

The durable `session` row contains the host, fingerprint when available and evidence quality. Raw ids remain transient inputs for exact local lookup. Close enumerates every session recorded during the run, reads only the corresponding host records within the run interval, and writes normalized model observations into the run log. The `outcome` row is a projection of these run facts so a repository-only reader can explain the result. This also avoids changing the answer when a developer later deletes local chat files.

Subagent observations keep an agent or invocation association when the host exposes one. A model observed somewhere in a chat is insufficient proof that a particular subagent used it. Missing actual usage produces an unverified configured fallback for that agent and an explicit reason for the gap. A resumed workflow preserves earlier sessions and adds the new one, rather than replacing the run's identity with that of its closer.

Commit creation uses the same current-invocation resolver and appends exactly `bkit-host: <platform>`, or `bkit-host: unknown`. It does not borrow the first session's host or the run's union of hosts. A throwaway landing checkout still belongs to the invocation creating its commit. Squash and failure-handover paths need the same rule as ordinary step commits.

## Approach B — bkit owns the execution boundary

Launch every supported host through a bkit-owned wrapper that creates a fresh invocation context, removes inherited host identity and passes explicit host metadata to every workflow command.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `HIGH`. Reliable propagation through GUI launches, remote sessions, subprocesses and host resumes is an execution-management concern. |
| Extensibility | A strong ownership boundary makes host identification predictable. Model evidence still needs per-host readers or callbacks. |
| Risk | Any host launched outside the wrapper bypasses the guarantee. Inherited wrapper metadata can itself become stale when another host is launched without replacing the context. |
| Maintenance | Wrapper compatibility and lifecycle management become part of the product, alongside adapters for actual model usage. |
| Friction vs ideal | The existing Cursor and OpenCode launchers cover only part of the surface. This approach adds equivalent launch paths for all hosts and changes how users start work. It cannot silently replace direct IDE and cloud entry points. |

This is the cleanest theoretical ownership model: the component starting an actor knows that actor's identity. However, bkit is currently installed inside independently launched hosts. Requiring bkit to own those launches adds product scope and still requires a conservative fallback for direct invocation. Sanitizing inherited foreign host variables in existing launchers can be a useful local measure, but it does not establish the general identity contract.

## Approach C — Reconstruct identity and models after the run

Read host stores at close, correlate their activity with the run's time and working directory, and backfill normalized facts into the run log.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `MEDIUM` initially, becoming `HIGH` as ambiguity and concurrent runs require more correlation rules. |
| Extensibility | New host formats fit as readers, but every new ambiguous signal expands the correlation policy. |
| Risk | Two hosts can work in the same repository at the same time. Matching time and repository cannot prove which one created a workflow command or commit. Missing stores make reconstruction impossible. |
| Maintenance | Broad local-store scans, correlation heuristics and host-format changes need continuing attention. |
| Friction vs ideal | Harvest already demonstrates the reader concept, but it is unshipped and may use heuristics unsuitable for authoritative consumer telemetry. Commit trailers cannot be reliably attributed retrospectively without rewriting commits. |

This approach is suitable for supplementary analysis or historical investigation, not as the primary source of new workflow attribution. Exact chat fingerprints established during execution can support close-time model enrichment. Time overlap alone should yield an attribution gap rather than a confident host or subagent assignment.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A, retaining the existing session log as the durable source of run identity and model evidence. | Make bkit own all host launches; reconstruct everything after close. | It establishes an explicit evidence boundary without requiring a new way to launch every host. |
| Bind host evidence to the current invocation and report `unknown` for unresolved conflicts. | Fixed precedence among environment variables; one repository-wide latest marker. | Both alternatives can attribute a nested or concurrent host to the wrong chat. |
| Record initial identity and enrich models across all run sessions at close. | Startup-only model snapshot; report only the closing session. | The owner accepted whole-run reporting, including model changes and resumed sessions. |
| Persist normalized model facts in the run log and project them into the outcome and stats report. | Read private local files whenever stats are displayed. | The required answer must survive in the repository without local host data. |
| Keep observed usage and configured fallback distinct, with a reason when actual usage is unavailable. | Treat a pinned model as proof of execution; discard all configuration evidence. | This follows Q1 while preserving the difference between intended and actual execution. |
| Resolve the host independently at each commit and use lowercase `bkit-host`. | One run-wide host trailer; uppercase trailer; omit unknown host. | Q3 and Q4 explicitly require commit attribution and an explicit unknown value. |
| Read host stores only through bounded, read-only adapters and keep unreadable or unsupported sources non-blocking. | General filesystem harvesting; write to host stores; require host availability at close. | The issue requires fail-open completion and privacy, while a narrow reader reduces accidental disclosure. |

The host-store and hook capabilities in the input are evidence with different confidence levels. Cursor and Antigravity environment names and Codex rollout linkage still need targeted validation before the design can promise their exact implementation. An unavailable model store is different from a host that keeps no model record; reporting should preserve that distinction.
