# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Carry the active host through the existing workflow commands ⭐ Recommended

Extend the host-specific workflow rendering to supply an explicit active-host identity to workflow startup and commit-producing commands, then extend the existing session and outcome records with narrowly scoped model evidence.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | MEDIUM. The identity has to reach more than startup, but bkit already renders a different command or skill for each host. |
| Extensibility | A new host adds one identity value and a local evidence reader. The workflow lifecycle and reporting continue to share the same records. |
| Risk | A copied command or incorrectly rendered invocation can declare the wrong host. Record the evidence source, validate the corresponding native chat identity where possible, and return unknown on unresolved conflicts. |
| Maintenance | Small shipped readers must track the host formats. The command rendering and commit call sites need parity coverage across the five hosts. |
| Reuse vs new | Extend `recordChat`, `hostChat`, `chatFingerprint`, `runChats`, `closeWorkflow`, the telemetry codecs and `stats.ts`. Add one shared identity resolver and narrow model readers. Use the harvest as a format reference, without importing its unshipped scanner. |

The active-host declaration is attached to the current invocation by the host-specific rendering. It is not a generic environment variable inherited by nested hosts, and it is not a repository-wide last-host file. A Codex-rendered workflow therefore declares Codex even when its shell also contains Claude Code variables. A native chat id is selected only from the declared host's verified inputs. The declaration is evidence of the workflow being invoked, not cryptographic proof of the process executing it.

For commands without explicit active-host context, use corroborated local evidence where available. Multiple ambient host variables do not have a fixed winner. An inconclusive identity produces a `session` row with `platform: "unknown"` and no fabricated fingerprint. The literal CLI flag or input shape is a design addition, not an existing supported interface.

Start and resume append the current host and chat fingerprint, while preserving earlier sessions in the same run. The close resolves local records for those exact sessions and their linked child sessions. Inherited variables are candidates, not authority. Hooks may provide identity evidence when they can bind it to the current chat or tool invocation; a global marker is not such a binding.

For models, ship only the parsing needed for model identity, role, parent relation and available call times. Do not copy the harvest's cost, token accounting, prompt extraction or cross-repository scans. Keep actual observations separate from configured model fallbacks. A fallback applies only to an agent known to have been invoked, not every agent in the model registry. Evidence without call times remains explicitly session-scoped; it must not silently become proof that a model was used during the run's time window.

At close, write a compact model-evidence snapshot into the run's own log as well as the outcome projection. The issue requires an answer from the run log itself; adding host and models only to `.bkit/stats.jsonl` would leave that requirement unmet. The outcome and `bkit stats` derive their per-run display from the same normalized evidence. Read failures leave an explicit coverage reason and never fail the workflow close.

Use the same current-invocation identity for the lowercase `bkit-host: codex` trailer and its other allowed host values. Use `bkit-host: unknown` when unresolved. Thread that identity through the existing scoped commit helpers and the remaining direct workflow commit paths, including bookkeeping landings, handovers and squash subjects/bodies. A resumed run's previous host is not the committing host. Preserve existing trailers and emit one normalized `bkit-host` line; do not install a global Git hook or rewrite past commits.

## Approach B — Resolve the nearest host process

Walk a bounded parent-process chain when bkit starts, resumes or creates a workflow commit, choose the nearest recognized host executable, and use that platform to select chat and model evidence.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | MEDIUM to HIGH. It reduces workflow text changes but needs careful process inspection across macOS and Linux, desktop apps, wrappers, shared servers and restricted sandboxes. |
| Extensibility | Another host adds a process classifier and chat reader. Runtime topology changes can require classifier changes even when the host's chat format stays stable. |
| Risk | A shell may be brokered by a tool server, reparented, or detached from the visible host. Matching a host name anywhere in a command line can create a false positive. |
| Maintenance | Process-name fixtures and host-version probes are an ongoing cost. Process listing must be bounded and avoid retaining arguments that can contain secrets. |
| Reuse vs new | Reuse the same session, outcome, fingerprint and local readers as Approach A. Add process traversal and executable classification instead of active-host context in rendered commands. |

This option handles ordinary nested CLI launches naturally: the closest host wins, rather than a fixed priority among environment variables. It is weaker for desktop shells that run through a shared server. Unavailable process information must become `unknown`; it cannot authorize a fallback to an inherited Claude Code variable.

Use it as optional corroboration for Approach A if a small probe confirms a portable, bounded implementation. Making it the sole identity source would put all five-host coverage behind a runtime-topology assumption that the repository has not established.

## Approach C — Let host hooks capture session evidence

Extend each host's existing hook integration to capture its known platform, native conversation identity and model information when available, then let workflow commands read the matching session's private evidence.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | HIGH. Each hook transport needs an exact association between a hook event and the subsequent bkit invocation; startup hooks do not automatically export variables into the host's future shell commands. |
| Extensibility | Hook payloads can supply better model and child-agent information as hosts expose it. Each host's event lifecycle becomes part of the integration contract. |
| Risk | A repository-wide marker races between parallel chats and can outlive its chat. A marker inherited by a child host repeats the current attribution bug. Hook trust or delivery may also be unavailable. |
| Maintenance | Five hook lifecycles, cleanup and private evidence stores need fixtures and live probes. |
| Reuse vs new | Reuse existing hook rendering and payload adaptation, including Antigravity's `conversationId` mapping. Add a session-scoped evidence store and a verified handoff from the hook event to each CLI invocation. |

Choose this as the primary route only after proving the handoff for all five hosts. The existence of a hook that knows its platform is insufficient: the CLI must select that hook's exact chat without relying on the same ambiguous inherited environment it is meant to replace. This is useful supplementary evidence for Approach A.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Follow the owner's accepted Q1: observed models and configured fallbacks are separate, with fallbacks marked unverified. | Treat configured pins as actual usage, or hide all configured information. | Pins are useful context but do not prove execution. |
| Follow Q2: retain all sessions that start or resume the run, and collect model evidence at close. | A startup-only model snapshot. | Model switches, subagents and host changes happen after startup. |
| Follow Q3 and Q4: workflow commits carry exactly the lowercase `bkit-host` trailer for the host creating that commit, including `unknown`. | Uppercase `Bkit-Host`, accumulated run hosts, or an omitted unknown trailer. | The owner explicitly chose this meaning and spelling. |
| Recommend Approach A, with hooks or process evidence used only when correctly scoped. | Process-only attribution or hooks as the sole source. | Host-specific rendering already exists, and an explicit current invocation avoids selecting the wrong ambient host variable. |
| Extend the existing session and outcome lifecycle, with a model-evidence snapshot in the run log. | A parallel telemetry ledger or stats-only storage. | The run must be understandable from its own log, and the existing harvest joins through session fingerprints. |
| Port narrow local model readers into the shipped engine. | Import the unshipped harvest scanner or add a daemon/service. | The engine is dependency-free, local and stack-agnostic; the harvest includes much broader accounting than this request needs. |
| Preserve unknown and unavailable as distinct evidence states. | Report every absent model as “host keeps no model record.” | A permission failure, unsupported format and a host that genuinely records no model are different facts. |
| Keep the addition backward-compatible and leave old rows unchanged. | Rewrite historical run logs. | Missing historical fields remain unknown; no migration is authorized by this design request. |

## Repository Evidence and Design Checks

- `commands/workflow/run-facts.ts:320` accepts only `CLAUDE_CODE_SESSION_ID`; `chatFingerprint` hashes platform plus id, and `runChats` already deduplicates run session fingerprints.
- `commands/workflow/workflows.ts:217` returns without a session row when `hostChat` yields nothing; its start handler invokes `recordChat` for both a new run and a resume.
- `commands/workflow/workflows.ts:1324` collects Claude subagent context at close, and `outcomeRow` is the existing telemetry assembly point.
- `ledgers/telemetry.ts:622` defines `OutcomePayload`; the model addition must extend its codec/normalizer paths as well as the writer so that fields survive folding and restatement.
- `commands/workflow/ledgers.ts:590` and `:626` create scoped commits, while `commands/workflow/steps.ts:607` has another direct commit path. Commit attribution needs an inventory beyond one helper.
- `commands/launch.ts:122` passes the merged environment to launched hosts. Removing only Claude Code variables is optional hygiene, not a complete attribution rule. Preserve tokens and unrelated environment settings.
- `scripts/harvest/bkit-harvest.mjs:2734` reads Codex `turn_context.model`; its OpenCode reader follows `session_v2.parent_id`; `:3130` reads Cursor model names; `:3236` reads Antigravity `gen_metadata` model field `1.19`. These are format references, not confirmation that every current host exposes a usable live-session identity.
- The harvest's Cursor reader records model turns without timestamps. Preserve that limitation in the evidence rather than claiming exact time-window attribution.
- `hooks/antigravity-hook.js` adapts `conversationId` into the shared payload. It documents a pre-tool event, not a universal session-start handoff.
- Before implementation relies on automatic evidence, probe the native chat-id-to-local-record join for Codex, Cursor and Antigravity, nested launch behavior in both directions, and model/child-session attribution. These remain verification needs rather than facts established by this brainstorm.
- Serena refused symbol queries for the required worktree because its active project ignores `.worktrees`. The source evidence above was gathered through bounded reads in the required working directory.

