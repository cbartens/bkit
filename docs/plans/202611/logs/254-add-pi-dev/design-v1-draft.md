# Design: Add Pi support

## Related Issues

None.

## Acceptance Scenario


### Narrative

I install Pi support and run complete bkit workflows through skills. A bkit-maintained extension runs delegated agents with configurable providers, models and reasoning settings, defaulting to bkit's existing OpenRouter selections, while preserving safeguards and reporting failures clearly.

### Success Criteria

- All five workflows and `bkit-auto` support their required delegation and gates.
- Agents run separately, including required parallel execution and result handling.
- Provider selection and per-agent model and reasoning overrides work. Defaults reuse existing OpenRouter selections.
- Safeguards apply to both the coordinating session and delegated agents.
- Install, upgrade, check and uninstall preserve unrelated configuration and other hosts.

### Key Edge Cases

- Pi and Codex discover skills in the same repository.
- A selected provider, model or reasoning setting is unsupported.
- A required extension or safeguard is unavailable.
- An agent fails, exceeds its limits or is cancelled. A workflow resumes or switches hosts.

### Process Sketch

- WHEN I install Pi support → THEN workflows and the required extension become available.
- WHEN I configure a provider or agent override → THEN agents use the verified settings.
- WHEN I leave settings unchanged → THEN existing OpenRouter selections apply.
- WHEN a workflow delegates → THEN separate agents execute with its required safeguards.
- WHEN execution fails or is cancelled → THEN the outcome is recorded and running agents are handled.
- WHEN I upgrade or uninstall → THEN unrelated configuration remains intact.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Opt-in host and managed file lifecycle | `.bkit/core/engine/install/modules/opencode.ts`, `install/modules/index.ts`, `install/manifest.ts`, `install/write.ts` (paths relative to the engine for abbreviated entries) | EXTEND | Add Pi to the existing registry, rendering, manifest, stamping, drift and removal paths. Reuse format-aware merges for consumer-owned JSON. |
| Workflow skills and agent rendering | `install/modules/codex.ts`, `render/hosts.ts`, `render/trackers.ts`, canonical `.bkit/core/workflows/` and `.bkit/core/prompts/` | EXTEND | Adapt the existing skill render shape and tracker transforms. Keep each host's installed output separately owned. |
| Provider, model and reasoning resolution | `render/models.ts`, `.bkit/prompts.md` §§ Models and Model Overrides, OpenCode provider state, Pi model registry | EXTEND | Reuse provider model defaults and overrides. Add Pi's reasoning and registry translation at the host boundary. |
| Guard policy and advisory rendering | `.bkit/core/hooks/`, `render/parts.ts`, Pi extension tool events | EXTEND | Reuse the guard engines and repository egress policy. Translate Pi event shapes and report the outcome in Pi. |
| Agent subprocess dispatch | [Pi's official subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent) | EXTEND | Adapt its subprocess, parallel dispatch, event and cancellation design. Add bkit-specific persona, policy and lifecycle checks in the Pi adapter. |
| Pi-specific readiness contract | Existing install diagnostics report configuration and credentials. Pi's extension and CLI documentation and the official example supply event and launch primitives. The host module, renderer and hook inventories contain no bkit Pi runtime verification. | NEW | A Pi extension must demonstrate that the expected safeguards, tools and configuration are active in the current parent or child. A file-presence check cannot establish that. |
| Tracker integration | `render/trackers.ts`, `install/write.ts` `mergeTrackerEntry`, engine tracker verbs, [Pi native MCP](https://pi.dev/docs/latest/mcp) | EXTEND | Convert only the configured bkit tracker entry. Verify the tool names and transport the workflow already expects. |
| Gates, verdicts, evidence and resume | `status.jsonl`, the existing `bkit steps`, `bkit workflows` and worktree commands | EXTEND | Add Pi as an invocation host using the existing contracts. The extension reports dispatch evidence and leaves phase state to the engine. |

## Architecture

The Pi install target has the same three boundaries as other hosts. Canonical bkit sources define workflow intent, the installer writes Pi resources, and the trusted Pi runtime executes the host-specific operations. bkit's engine keeps authority over the worktree, gates, artifact validation, tracker writes and resume.

- **Pi module.** Register the opt-in `--pi` host and allow explicit provider selection with `--pi=<provider>`. Use the existing host lifecycle for install, tracker re-render, upgrade, check, status, doctor and uninstall. Install does not fetch Pi or touch global Pi configuration. Use an installed, supported Pi version for workflow execution.
- **Workflow skills.** Render the five phase skills and `bkit-auto` to `.pi/skills/bkit-pi-<workflow>/SKILL.md`, with names matching their directories. Route Pi to these skills through the existing router. Keep `.agents/skills/` project skills available. Filter only the exact installed Codex workflow skill resources in the managed Pi workflow session if they remain discoverable. Keep Codex ownership and uninstall unchanged. The supported invocation and auto-route must identify the Pi skill explicitly.
- **Pi extension.** Ship one project-local bkit-maintained extension based on the official subprocess example, with a coordinator entry and an explicitly loaded guard-only leaf entry. Pin its upstream provenance and retain any applicable notices. Resolve only generated bkit agent names. Start a fresh Pi child using the verified worktree and explicit provider, model, thinking and tools. Each child has an independent conversation, writes its own expected artifact and returns a bounded structured outcome. Workers cannot dispatch more workers.
- **Readiness contract.** Run a mandatory check before workflow side effects and before a child's first model call. Validate the supported Pi version, extension and guard revision, role, trusted repository and resolved worktree, configured tool policy and effective provider/model/reasoning. A skill loaded directly without the required extension must stop before the first mutating workflow step. A readiness result must come from the runtime that will execute the work.
- **Safeguard adapter.** Map Pi's tool and session events to the shared rules-read, GateGuard, ReadGuard and guardrails logic. Preserve advisory versus blocking decisions, including user confirmation for actions that require it. In headless mode, return a blocked outcome when a required decision cannot be obtained. Cover shell, reads, edits, writes and any enabled tracker/research routes. These checks constrain managed Pi tool calls. A subprocess shares OS-level authority unless the host applies independent isolation.
- **Tracker and research tools.** Reuse bkit's engine-first tracker transport and render the applicable Pi fallback with native MCP. Preserve unrelated servers and options. Use explicit tool exposure and constrain indirect tool reach. Translate research tools to the verified Pi capabilities required by each persona. Require the applicable transport on its normal execution path and report unavailable capabilities explicitly. A tracker-free configuration continues to work without MCP.

The host supports local interactive workflow execution and the headless behavior defined by bkit's existing runtime. `bkit-auto` dispatches to the selected Pi phase skill. Existing infrastructure that launches agents stays in charge of cloud dispatch and CI.

## Data Model

<!-- prettier-ignore -->
| Record | Authority and fields |
| --- | --- |
| Pi install state | The existing bkit install-state mechanism records the selected provider independently of OpenCode. A fresh Pi install defaults to OpenRouter. A later render or plain reinstall uses the recorded selection. An explicit provider selection replaces it after validation. |
| Agent selection | The canonical persona supplies the agent name, allowed tools and `maxTurns`. For the selected provider, reuse an existing per-agent model override before the matching canonical provider pin. A provider without canonical pins needs complete explicit model selections. A Pi-specific per-agent reasoning override wins over the documented Pi translation of the canonical effort. |
| Resolved child request | Correlate workflow, step, attempt and dispatch identity with the validated worktree, exact persona and artifact path, requested provider/model/reasoning and tool policy. Pass only validated arguments and approved resource locations. Keep task text separate from executable and option selection. |
| Child startup and outcome | Record guard and capability readiness, effective provider/model/reasoning, agent identity and a bounded terminal result. Distinguish completion, cancellation, wall or turn limit, startup failure, tool/transport failure, and invalid output. Keep diagnostic fields redacted. Credentials use Pi auth or the provider's supported environment. |
| Workflow progress | Existing step artifacts and `status.jsonl` remain the durable source of truth. A child outcome identifies evidence for the existing validators. It does not determine step completion. |

## Components / Flows

1. **Install and verify ownership.** Resolve the module and provider, check destination ownership and JSON validity before writing, and register exact Pi-owned resources in the manifest. Add the extension, persona and skill mirrors to the managed output lifecycle. Add settings keys only where the runtime needs them. Test clean and mixed-host installs in both orders, repeated renders, tracker/provider changes, drift, and removal. Preserve shared and user-owned files and keys.
2. **Enter the workflow.** From a trusted Pi project, invoke the Pi skill and check readiness before workflow mutations. The transformed workflow keeps existing branches, retry routes, progress, owner decisions and artifact expectations. `bkit-auto` forwards the selected phase and arguments through Pi's verified skill activation path. The router sends callers to the Pi resource even when Codex files are present.
3. **Resolve and delegate.** Validate exact Pi registry identities, credentials and tool capabilities for the selected provider. For a default OpenRouter run, use the same model IDs as OpenCode/OpenRouter and map intended reasoning to Pi's supported levels. Use the supported Pi launcher and literal argument arrays. Admit up to four children at a time in one dispatch, covering current parallel workflow fan-outs. Bind each agent to its expected worktree and artifact. Permit only the exact effective tool set, accounting for MCP, discovery and Codemode in addition to direct tools. For a leaf with no MCP requirement, disable MCP.
4. **Supervise and collect.** Enforce each persona's turn limit and a finite wall deadline. Bound individual JSON events, retained stdout and stderr, and model-visible output independently. Keep task results correlated and in request order. Require a valid terminal event and matching effective settings even when the process exits zero. On cancel or deadline, stop scheduling, terminate active process groups, escalate after a bounded grace period, and reap descendants. Preserve partial artifacts as incomplete evidence for the existing recovery path. The workflow uses `steps finish` to validate the named artifact and its verdict before advancing.
5. **Resume or switch hosts.** Reopen through the existing engine, trust only the durable completed rows and artifacts, and revalidate the current Pi capabilities before a new dispatch. A cancelled process, partial result or stale readiness result cannot certify a new invocation. Any uncertain external side effect follows the workflow's current reconciliation rule before retry.
6. **Prove compatibility.** Record the Pi binary version and upstream revision. In a disposable repo, verify skill selection with Codex installed, guard registration and direct/indirect tool policy in parent and leaf, two concurrent children writing distinct artifacts, owner decisions, terminal and cancellation paths, and resume. Run all five workflow paths and `bkit-auto` through their existing gates. Verify authenticated tool calls and effective thinking for each distinct default OpenRouter model/effort pair and a configured non-default provider, with an agent override. Exercise the configured tracker paths with actual tool names, unavailable transport and tracker-free operation. Catalog existence, fixtures and static rendering are evidence for their own contracts. Claim runtime support only for versions and configurations verified on real Pi.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Deliver complete Pi workflow support using skills and a bkit-maintained extension (Q1, Q2, Q6). | Skills without delegation, in-session personas, third-party agent package. | The owner selected isolated delegated agents and bkit responsibility for safeguards and compatibility. |
| Keep Pi-specific skill names and project-local ownership. | Shared writes to the Codex skills directory, duplicate names resolved by discovery order. | Pi sees both locations. An explicit Pi name and route keep execution and removal independent of install order. |
| Support configurable providers and agent overrides (Q5), with OpenRouter defaults derived from existing model selections (Q3). | OpenRouter-only support or separate Pi model catalog. | Providers own model identities. Pi owns the translation and verification of reasoning controls. The revised scenario supersedes the initial fixed-provider answer. |
| Use supervised CLI children and adapt official subprocess behavior. | SDK workers or a shared delegation broker. | The subprocess path follows the upstream example, preserves native Pi startup, and isolates conversations and most failures. The upstream example needs bkit-specific controls, including explicit thinking when a persona pins a model. |
| Require verified runtime readiness and keep the engine's artifact gates. | Infer readiness from installation, or let a child exit advance a step. | The installed extension can be unavailable or overridden. Runtime state and the required artifact are separate facts. |
| Use native MCP for applicable Pi fallback and exact tool exposure for leaves. | Proxy all tool calls through a new bridge or copy the whole consumer MCP configuration. | The existing tracker transport owns policy and retry. Pi supports native transports and exposure controls. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Pi skill renderer with supervised CLI child processes | KEPT | The official example provides the closest operational fit. The risk lens adds explicit startup, tool reach, bounded supervision and result validation. |
| Independent Pi SDK sessions | REJECTED | A separate SDK worker offers precise resource construction but would own additional Pi startup and MCP wiring. Reconsider the separate worker only if a required CLI capability is disproved and the same workflow guarantees can be verified with the SDK. In-process SDK sessions share more failure state. |
| Host-independent delegation broker | REJECTED | Existing hosts already have their own delegation contracts. A broker would add a second lifecycle and widen the credential boundary for a single host integration. |

## Trade-offs Accepted

- Separate Pi processes add startup time and memory. They give each agent its own conversation and allow the coordinator to reap a failed worker.
- Host-specific skills add rendered output and tests. Canonical workflow sources and gates still have one owner.
- Exact model and tool validation can stop execution on a version or configuration mismatch. It prevents a run from silently changing models, effort or available safeguards.
- Process and tool boundaries need verification on supported platforms. Cost and performance comparisons require representative complete workflows, including guards and delegation.

## Risks & Open Questions

- **Runtime compatibility is unproven.** Current documentation establishes the intended extension, skill, CLI and MCP surfaces. Probe a named Pi release to check guard timing, leaf startup before the first model call, cancellation of descendants and the effective selection in a trusted worktree. If a necessary subprocess capability is disproved, reassess the SDK route against the same requirements before declaring support. [Pi extension lifecycle](https://pi.dev/docs/latest/extensions), [Pi CLI](https://pi.dev/docs/latest/cli).
- **MCP exposure and prompt modes can change with Pi versions.** Verify exact names, approval behavior and reachability through direct calls, discovery and Codemode. Restrict indirect tools where parity cannot be demonstrated. [Pi MCP tool exposure and permissions](https://pi.dev/docs/latest/mcp#control-tool-exposure).
- **Provider resolution can silently select an unintended setting.** Verify exact provider/model identity and requested versus effective reasoning in Pi. Report an incompatible combination and a remediation before dispatch. A missing credential or unverified model combination leaves compatibility unproven.
- **Mixed installations can advertise the wrong workflow.** Verify discovery and activation in a co-installed repo. Use verified exact-path exclusions for the managed Codex skills if required, and leave other skills available. [Pi skills discovery](https://pi.dev/docs/latest/skills).
- **Compatibility probe and acceptance scope.** The design may progress with identified runtime unknowns. Release requires live evidence for the complete scoped integration and a version-bound compatibility record. The public harness leaderboard is motivation. A bkit cost claim needs a controlled full-workflow comparison.

