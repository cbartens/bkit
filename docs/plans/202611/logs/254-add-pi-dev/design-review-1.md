Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

The search used the current worktree's host modules, renderers, hook engines, workflow runtime and context templates. `docs/capabilities.md` confirms the marker and tracker-substitution owners; it is not a complete host-runtime inventory. The configured TypeScript language server confirmed `buildOpencodeModelLookup`, its install/upgrade/uninstall callers and `classify`. Serena's project activation tool was unavailable, so its root-checkout results were corroborated against this worktree's source. No absence claim rests on the language server alone.

<!-- prettier-ignore -->
| Capability | Existing solution and fit | Recommendation |
| --- | --- | --- |
| Host installation and resource ownership | The shipped OpenCode module, `MODULE_REGISTRY`, manifests, write primitives and managed-output lifecycle already cover most installation behavior. Pi adds a host and owned destinations, rather than another installer. | EXTEND-EXISTING. Keep checks, upgrade and surgical removal on the existing paths. |
| Workflow skills | `install/modules/codex.ts:29` already transforms canonical workflows into `SKILL.md`; its writer owns `.agents/skills/bkit-*`. Pi supports private project skill directories and configured exclusions. | EXTEND-EXISTING. Reuse the rendering technique, give Pi its own output ownership, and validate exact exclusions without changing other skills. |
| Provider/model defaults and overrides | `render/models.ts:146` resolves provider columns; `parseModelOverrides` and `applyModelOverrides` implement the existing override format. The latter applies only to agents already present in its lookup. | EXTEND-EXISTING. Extend resolution explicitly for providers without a canonical column; do not create a second model table or assume an empty map accepts overrides. |
| Reasoning settings | The existing effort map is keyed by host, and the OpenCode transform applies model-dependent adjustments. Pi exposes a thinking selection that may be clamped. | ADAPT. Specify a Pi mapping of the intended OpenRouter behavior and verify requested versus effective settings. |
| Delegation | Pi's maintained upstream subagent example has separate CLI processes, parallel scheduling and event collection. It is an example rather than a bkit-compatible executor: model-pinned agents omit its inherited thinking argument, and the example's result and cancellation handling need adaptation. | ADAPT. Preserve the upstream approach and replace only the missing bkit contract pieces. |
| Safeguards | Shared `.bkit/core/hooks/` engines and `render/parts.ts` own policy. Pi tool events can wrap calls. Its extension system has materially different failure and startup semantics. | EXTEND-EXISTING. Add a host driver, preserving policy ownership and advisory/blocking distinctions. |
| Runtime readiness | `commands/workflow/runtime.ts` classifies runtime capabilities and validates stored rows; it does not attest a live Pi process. Searches for readiness/handshake/delegation in runtime, shared helpers and hooks found no existing Pi runtime verifier. | BUILD-CUSTOM only for the Pi process handshake inside the adapter. Extend existing runtime validation and diagnostics around it. The draft's NEW verdict is justified at this narrow boundary. |
| Tracker transport | `mergeTrackerEntry`, tracker transforms and engine verbs already own tracker integration. Pi has native MCP configuration and tool exposure. | EXTEND-EXISTING. Convert the bkit tracker entry only and keep transport/retry ownership in the engine. |
| Web research | Pi's documented built-in tools do not include web search or fetch. The repo has `.bkit/templates/context/bkit-tavily.md`, but it is an operator-owned debug context recipe, not a general callable research tool. | ADAPT an explicit configured research route; see C3. Do not claim that renaming `WebSearch` supplies it. |
| Process cleanup | Node supplies subprocess and process-group primitives. The repo's detached launcher and disk sweeper are background-service launchers, not bounded worker supervisors. | ADAPT the upstream supervisor using platform-specific Node/OS behavior; no second cross-host agent service is warranted. |

Official sources: [Pi skills](https://pi.dev/docs/latest/skills), [resource settings](https://pi.dev/docs/latest/settings#resources), [CLI selection and tool controls](https://pi.dev/docs/latest/cli), [subagent source](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/subagent/index.ts), and [Node subprocess behavior](https://nodejs.org/api/child_process.html). Searches for current Pi built-in extension/skill capabilities and Node child-process cancellation led to these primary sources; third-party summaries were not relied on.

## Stack Feasibility

The design fits the approved Node.js >=24, TypeScript and ESM stack. It preserves bkit's existing engine and canonical-source boundaries. No server or database is required. Separate Pi processes are a reasonable implementation path, but the requirements for refusal before a model request, restricted child resources and headless decisions are not satisfied merely by rendering files or loading an extension.

The native CLI provides enough selection controls to investigate the intended approach. A live probe must establish the missing behavior before a supported Pi version and platform set are claimed. Pi was not found on PATH in this review environment; that is a probe prerequisite, not evidence of infeasibility.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library/API | Assessment |
| --- | --- |
| Pi coding agent | The current upstream manifest identifies `@earendil-works/pi-coding-agent` version `1.5.0`, ESM exports and TypeScript declarations. This is source evidence, not a locally installed or tested release. Select an exact released version and upstream revision before implementation. |
| Pi extensions | First-party typed APIs supply tools, events and resource integration. Extensions execute with the process's OS authority. General extension errors can leave the agent running; `ctx.shutdown()` does not stop print mode. The readiness implementation needs a proven control path. |
| Pi example | MIT-licensed upstream source can be adapted with its copyright and license notice retained. Pin provenance. Its UI helpers and package imports should not be copied wholesale when only process execution is required. |
| Node `child_process` | Built into the approved runtime. Literal argument arrays avoid shell interpolation. Killing a direct child does not by itself kill descendants; POSIX process groups and Windows termination need separate treatment. |
| Packaging footprint | Keeping Pi as an explicitly installed execution prerequisite avoids bundling its whole runtime in bkit. Declare any imports needed by the shipped extension and verify resolution in an installed consumer; a producer devDependency alone does not prove consumer loading. No binary or package-size measurement was performed. |

Sources: [Pi package manifest](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/package.json), [MIT license](https://github.com/earendil-works/pi/blob/main/LICENSE), [extension lifecycle and error handling](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), and [Node child processes](https://nodejs.org/api/child_process.html).

## Integration Risk

The highest shared-code risk is model/effort resolution: changing helpers used by Codex and OpenCode can alter existing hosts. Preserve their current lookup, override and missing-provider behavior. The Pi module must be additive across manifest ownership, installed-host detection, drift/stamping, orphan removal, tracker re-render and uninstall.

Skill exclusion is a host resource rule, not a change in Codex ownership. Pi's `resources_discover` event adds paths; it is not the documented exclusion mechanism. Use the supported settings exclusions or a verified loader policy, and test both install orders and worktree discovery.

The runtime mode contract also crosses workflow behavior. Current `runtime.ts:125` classifies only `GITHUB_ACTION` as headless. Local Pi JSON/print processes cannot be treated as interactive merely because they run outside CI. This affects grills, decision pauses and permission requests.

The repository is one package, not a multi-service monorepo. Keeping the process adapter inside the Pi host integration avoids unnecessary service, credential and distribution boundaries.

## PoC Approach

Use a pinned Pi release in a disposable trusted worktree with minimal single-file extensions. First, record whether a deliberate startup-readiness failure prevents both the first provider request and a sentinel mutation in interactive and JSON/print modes. Then launch two short leaf processes with explicit model and thinking selections, collecting effective runtime identities and separate artifacts. Exercise a direct forbidden tool and an indirect MCP call through Codemode; neither may execute. Load Codex and Pi skill fixtures together and verify exact-path exclusion and explicit Pi invocation. Cancel a child that starts a harmless descendant and prove both stop, including forced escalation. Finally, make one authenticated tool-calling request for each distinct default model/effort pair and one explicit alternate-provider override. Keep each claim separate; missing Pi, credentials or a platform is BLOCKED, not a passing simulation.

## Unknowns & Blockers

<!-- prettier-ignore -->
| Claim | Required experiment |
| --- | --- |
| S1: Startup refusal | A failed/missing guard bootstrap prevents the first model request and workflow mutation. Verify exact control flow in the chosen CLI mode; throwing from `session_start` or calling print-mode `ctx.shutdown()` is insufficient evidence. |
| S2: Exact leaf capabilities | Explicitly loaded child resources preserve safeguards, remove delegation and restrict both direct and indirect tools. Verify missing guard, foreign extension and MCP/Codemode cases. |
| S3: Model and reasoning parity | Each reused default provider/model ID resolves exactly and executes a real tool call at the expected effective thinking level. Probe an override and non-default provider. A catalog hit is not completion evidence. |
| S4: Mixed-host resources | Exact exclusions remove only installed Codex workflow resources in Pi, keep user skills and Pi skills, and behave consistently in a worktree and after reload. |
| S5: Cancellation | Cancellation/deadline stops scheduling and terminates the child plus its descendants within the documented bound on every claimed platform. |
| S6: Headless decisions | Local JSON/print execution exposes the correct inability to ask to both the extension and bkit workflow runtime, with an explicit blocked/deferred outcome rather than an unanswered wait. |

S1-S6 require runtime evidence. This review performed source and documentation checks only. Full five-phase acceptance remains a later complete-integration check, not a substitute for the small feasibility probes.

## Verdict Reasoning

CONCERNS: the architecture is compatible with the approved stack and reuse choices, but startup enforcement, local headless classification, research-tool availability and configuration resolution need concrete contracts. These are addressable. No evidence currently proves that the complete integration is infeasible. Spike is true because its load-bearing runtime assumptions cannot be settled through documentation alone.

## CRITICAL

### C1 — Define the mechanism that makes readiness mandatory

The draft requires readiness before a child's first model call and before parent workflow side effects, including when the extension is absent. It does not select the execution control that enforces those conditions. Pi documents that general extension errors are logged while the agent continues, and print-mode `ctx.shutdown()` is a no-op. An absent extension cannot enforce its own gate. Specify the parent entry/bootstrap boundary and child launch/handshake protocol, the exact missing/error behavior, and the supported-mode semantics. Probe S1 before claiming this guarantee. A prose instruction to stop or a successfully rendered hook file is not equivalent.

### C2 — Bind Pi's execution mode to the workflow's headless policy

The existing runtime resolver marks only `GITHUB_ACTION` as headless, while a locally launched Pi JSON/print process has no interactive answer channel. Specify how the Pi adapter conveys this capability to the engine without pretending every local process is CI or silently broadening worktree/push permissions. Cover coordinator and leaf behavior, owner decisions, blocked permission requests and resume. Probe S6.

### C3 — Choose a real research capability for the required personas

The draft promises complete design/debug workflows but leaves `WebSearch`/`WebFetch` as a translation to unspecified Pi capabilities. Pi's built-in tool inventory has neither. The existing Tavily context template is a reuse candidate, but it requires configuration and credentials and covers a debug context path only. Select and document the callable research route, required setup, persona/tool mapping and unavailable behavior. Reuse configured provider/MCP/context facilities where sufficient; do not create an unrequested search service or count shell URL fetching alone as web search.

### C4 — Make configurable providers and reasoning overrides implementable

Specify the source and shape of Pi provider selection and per-agent reasoning overrides, their precedence and validation, and the accepted provider identity rule. The current model override helper modifies only existing lookup entries; a provider without a canonical column cannot be supported by passing an empty map through it. Define a complete known-agent inventory for explicit selections, missing-selection refusal and exact registry matching. State how the existing OpenCode/OpenRouter model-dependent reasoning policy translates to Pi, including clamping, so “same settings” cannot silently become canonical Claude effort. Keep OpenCode's settings and allowlist unchanged unless an explicit shared contract needs extension. Probe S3.

## OPTIONAL

- State numeric defaults and ownership for the wall deadline, startup handshake timeout, event/output limits and cancellation grace period. They can be tuned after measurement, but implementations need one defined policy.
- Name the initial supported OS set. A POSIX process-group implementation is not proof for Windows; leave untested platform combinations visibly unverified.
- Record the exact upstream revision and released Pi version in the compatibility evidence. The current `main` source and `latest` documentation can change independently of the installed binary.
- In the terminal protocol, distinguish an individual `agent_end` from the final settled outcome; Pi can automatically continue after a low-level run ends. Preserve the engine's artifact validation as the completion authority.

## OUT OF SCOPE

None. No new cross-host agent broker, new model catalog, provider benchmarking service or cloud launcher is required to resolve these findings.
