# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Contain failed agents in supervised Pi processes ⭐ Recommended

Adapt Pi's official subagent extension into a bkit-maintained process supervisor, with one isolated Pi process per delegated task and a shared adapter for bkit's existing safeguard engines.

The owner's latest decisions require complete workflows, configurable providers and per-agent model and reasoning overrides, with existing OpenRouter selections as defaults. They supersede the issue's proposed partial first release and the earlier OpenRouter-only interpretation. Process isolation fits those requirements without placing a second workflow engine inside Pi: bkit's current commands remain responsible for gates, retries, artifacts, locks and resumption.

### Premortems

<!-- prettier-ignore -->
| Scenario | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Parallel workflow calls multiply processes, provider requests and context buffers. A per-tool-call concurrency limit does not bound simultaneous calls. Multiple writers can target the same artifact. | Report queued/running/terminal task states and peak active children across the parent session. Associate each child with its agent, task, workflow attempt and output artifact. Record output truncation explicitly. | Use one bounded queue per parent session; children do not expose delegation. Cancel queued work before starting more children. Respect workflow-assigned file ownership and existing locks; do not add automatic retries that duplicate writes. |
| 6 months later | Pi changes its event stream, package names, tool events or model naming. A model exists in OpenRouter but its requested reasoning setting behaves differently through Pi. Install succeeds while runtime semantics drift. | Expose the installed Pi version, extension version, selected provider/model and effective reasoning setting. Distinguish configured, catalog-resolved and live-verified compatibility. | Declare and verify a supported Pi version range. Reject an unsupported required capability before delegation. Repair through ordinary upgrade and doctor paths; never silently substitute a model or weaken a safeguard. |
| On-call at 3am | A child hangs, loses its provider connection, exits successfully without its required artifact, or leaves grandchildren running after cancellation. Replaying the task may repeat external writes. | Return a structured terminal state, exit/signal reason, bounded redacted stderr, artifact paths and a correlation identifier. Preserve partial progress without describing it as success. | Propagate cancellation, terminate owned descendants with bounded escalation and await their exit. Reconcile existing workflow state and artifacts before resuming through bkit's established path. An unknown outcome stays unknown until reconciled. |
| Author leaves | The extension contains undocumented assumptions about the official example, model overrides and inherited guards. Future maintainers copy upstream changes and undo a safety property. | Keep a short upstream provenance record, a capability matrix and fixtures for each required runtime contract. The matrix identifies which guarantees are enforced and which remain advisory. | Maintain a narrow upstream adaptation boundary. Reuse existing bkit model lookup, tracker rendering, manifest and safeguard logic; update compatibility evidence when changing the boundary. |

### Risk-mitigation guidance

- Validate the requested agent against the generated bkit agent inventory. Resolve its working directory to the authorized checkout, including a workflow-created worktree, before reading configuration or starting a child. Keep caller-provided task text out of shell command construction.
- Give each child the resolved provider, model and reasoning setting explicitly. Do not let missing agent configuration inherit the parent's current model. Preserve the existing host/provider distinction: model selections belong to the provider; Pi-specific reasoning translation belongs to the host.
- Make parent and child safeguard initialization observable before they perform workflow mutations. Reuse the engines in `.bkit/core/hooks/`, retaining their documented advisory/off/deny modes. A required extension failing to load is different from a deliberately configured advisory hook and should prevent a claimed fully supported run.
- Disable delegation in child sessions while retaining the guard, tracker and research capabilities their personas require. An inherited environment marker alone is not a security sandbox; verify the actual active tool set and supported extension configuration. Account for Pi's composed tool calls as well as direct model tool calls.
- Enforce each persona's existing `maxTurns` meaning as a runaway-loop cap. Bound retained stdout, stderr and event buffers independently of the model-visible summary. A malformed or missing terminal result cannot turn into success merely because the process exited with code zero.
- Keep summary truncation separate from the authoritative artifact. Existing `steps finish` validates artifact headers and step state; the extension should report paths and outcomes, not invent another verdict parser or mark workflow steps complete itself.
- Define headless approval behavior before launch. A child that requires fresh approval should return a blocked result to its parent, rather than treating an unavailable prompt as approval or waiting indefinitely.
- Separate Pi workflow rendering from Codex's owned skill files unless one genuinely host-neutral rendering can satisfy both. Verify discovery, invocation and uninstall with both hosts installed; a shared directory does not establish shared file ownership.

## Approach B — Contain configuration drift with SDK-owned child sessions

Keep the bkit-maintained extension and the official example's agent contract, but create independent Pi SDK sessions inside the coordinating process so provider, model, tools, guards and result events are passed as typed configuration rather than reconstructed by child CLI discovery.

This is a candidate to investigate, not a proven substitute. It departs from the example's separate-process mechanism while preserving its delegation concept. It is viable only if SDK-created sessions demonstrably retain every required safeguard, trust and cancellation behavior.

### Premortems

<!-- prettier-ignore -->
| Scenario | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Many child sessions share one heap, event loop and extension process. A runaway allocation or blocking extension can stall all work, including cancellation. | Track active sessions, retained result sizes and queue delay per delegated task. Report which sessions were active when the parent failed. | Apply one global concurrency queue and bounded session state. Stop scheduling after a failure. Dispose completed sessions promptly; restart the parent from durable bkit artifacts when isolation fails. |
| 6 months later | The SDK's constructors, session lifecycle or resource loader change. Explicit assembly misses a newly required trust or guard step. | Pin and probe the SDK boundary and report its capability handshake. Contract fixtures compare a normal guarded Pi session with a delegated session. | Keep the SDK integration confined to one adapter. Upgrade only after the same guard, model and tracker checks pass; fall back to Approach A as an architectural change, not an invisible runtime fallback. |
| On-call at 3am | One child corrupts shared state or the parent dies before child results are recorded. Error attribution is harder because all sessions share a PID. | Associate every event, cancellation and resource lifetime with a task ID, and distinguish parent failure from child model failure. | Dispose every owned session and reconcile workflow outputs before restarting. Treat in-memory completion without the expected artifact as incomplete. |
| Author leaves | The team inherits a bespoke miniature Pi session host. Typed APIs make individual calls clear but conceal the required combination of loaders, trust settings and tool registration. | Maintain a single documented session-construction contract with observable guard readiness and explicit resource ownership. | Reuse Pi's public session helpers and bkit's existing policy owners. Avoid reimplementing Pi's model registry, tool executor or permission system. |

### Risk-mitigation guidance

Apply Approach A's provider validation, artifact authority, bounded output, leaf-only delegation and host-coexistence controls. Additionally, prove that session-specific configuration, credentials and tool restrictions cannot bleed between simultaneous children. Do not share mutable tool registries or override maps. Confirm cancellation reaches network calls and tools, not just the model loop. Avoid this approach if these guarantees require a substantial replacement for Pi's resource-loading or session lifecycle machinery.

## Approach C — None

Flattening agents into the coordinating session or shipping commands without delegation contradicts the accepted scope. Requiring a separate third-party agent package contradicts the owner's extension-ownership choice.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A, with process supervision rather than a direct copy of the upstream example. | SDK sessions inside one process. | It provides a clearer failure boundary and follows the owner-approved upstream starting point. The extra process lifecycle work is explicit and testable. |
| Retain bkit commands and artifacts as workflow authority. | Let the Pi extension own retries, gates and workflow resumption. | Competing state machines would create duplicate tracker actions, ambiguous retries and host-switch inconsistencies. |
| Reuse provider model selections and add a Pi-specific reasoning mapping with explicit compatibility reporting. | Copy OpenCode JSON verbatim; add a parallel Pi model catalog. | OpenRouter model intent can be shared, but host configuration formats and reasoning semantics differ. |
| Treat model/provider settings as configurable, with existing OpenRouter defaults. | OpenRouter-only support; arbitrary unverified combinations reported as supported. | This follows Q5 and Q6 while preserving the requirement to verify compatibility. The design must distinguish available configuration from verified combinations. |
| Establish file ownership and skill resolution before choosing a shared skill location. | Both host modules overwrite `.agents/skills/bkit-*`; accept first-discovered duplicates. | Codex's module already owns those files. Install order and discovery order must not determine which host instructions execute. |
| Require live runtime evidence for the proposed compatibility contract before release. | Treat catalog presence and static render tests as full support. | Agent behavior, tool restrictions and nested safeguards cannot be established by generated files alone. |

## Cross-Approach Risks

<!-- prettier-ignore -->
| Risk | Evidence and consequence | Required design treatment |
| --- | --- | --- |
| Upstream example loses effort when an agent pins its own model. | In `runSingleAgent`, the observed example passes `--thinking` only when it inherits the dispatch configuration. bkit agents have explicit model pins. The example also collects child messages/stderr and derives completion from process/model outcomes. [Official subagent source](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/subagent/index.ts). | Specify explicit per-agent reasoning serialization, bounded buffers, terminal validation and lifecycle fixtures. This observation is about the fetched example, not an assertion that bkit currently has the bug. |
| Guard placement can leave nested calls or children uncovered. | Pi supports blocking tool hooks and composed calls through its tool executor. JSON and print modes cannot display approval dialogs. Extensions execute with the process's operating-system permissions. [Pi extension contract](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md). | Verify direct, nested and child tool paths. State the trust boundary honestly: event hooks are not isolation from malicious extensions or arbitrary code using process privileges. |
| Host/provider axes can become conflated. | `.bkit/prompts.md` defines provider model columns and host effort columns. Pi exposes provider/model defaults and per-model thinking settings. [Pi settings](https://pi.dev/docs/latest/settings). | Reuse model policy but validate the effective Pi translation. Explain override precedence and display effective selections. |
| Codex and Pi can load the same skill names with incompatible instructions. | `.bkit/core/engine/install/modules/codex.ts` writes `.agents/skills/bkit-*/SKILL.md` and documents Codex ownership. Pi supports that discovery location, but name collisions use discovery order. [Pi skills](https://pi.dev/docs/latest/skills). | Prove deterministic discovery, host selection and surgical uninstall in mixed-host fixtures. Do not resolve this by silently replacing Codex skills. |
| Global and project configuration can alter child capabilities. | Upstream child processes discover their own configuration from their effective working directory. Worktrees, project trust and user-installed extensions can change what loads. | Define configuration precedence and the required child capability handshake. Test clean, configured and mixed-host checkouts. |
| Lower overhead is mistaken for guaranteed savings. | The accepted scope adds guards, skills and delegation beyond a minimal Pi session. | Report cost and completion evidence for representative complete workflows if making an efficiency claim; do not inherit a public harness benchmark's savings as a bkit acceptance guarantee. |

The repository's existing integration points are `.bkit/core/engine/install/modules/`, `install/manifest.ts`, `install/write.ts`, `render/models.ts`, `render/trackers.ts`, `.bkit/core/hooks/` and the workflow status/step commands. This brainstorm proposes extensions of those owners rather than parallel policy implementations. No live Pi compatibility run was performed in this design exploration; upstream evidence was read on 7 November 2026 and needs a version-bound runtime probe.
