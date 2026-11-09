<!-- bkit:anchor
baseSha: 9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

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
| Web research | `.bkit/templates/context/bkit-tavily.md`, the shared egress policy and the Tavily Search and Extract APIs | EXTEND | Reuse the existing provider and credential convention. Expose bounded research calls through the same Pi adapter that enforces persona policy. |
| Gates, verdicts, evidence and resume | `status.jsonl`, the existing `bkit steps`, `bkit workflows` and worktree commands | EXTEND | Add Pi as an invocation host using the existing contracts. The extension reports dispatch evidence and leaves phase state to the engine. |

## Architecture

The Pi install target has the same three boundaries as other hosts. Canonical bkit sources define workflow intent, the installer writes Pi resources, and the trusted Pi runtime executes the host-specific operations. bkit's engine keeps authority over the worktree, gates, artifact validation, tracker writes and resume.

- **Pi module.** Register the opt-in `--pi` host and allow explicit provider selection with `--pi=<provider>`. Use the existing host lifecycle for install, tracker re-render, upgrade, check, status, doctor and uninstall. Install does not fetch Pi or touch global Pi configuration. Use an installed, supported Pi version for workflow execution.
- **Workflow skills.** Render the five phase skills and `bkit-auto` to `.pi/skills/bkit-pi-<workflow>/SKILL.md`, with names matching their directories. Route Pi to these skills through the existing router. Use exact `-skills/<name>/SKILL.md` exclusions in the Pi loader scope for the installed Codex workflow skills, relative to `.agents/` as measured on Pi 1.5.0. Keep user skills available. The entry command and auto-route select the Pi skill explicitly.
- **Pi extension.** Ship one project-local bkit-maintained extension based on the official subprocess example, with a coordinator entry and an explicitly loaded guard-only leaf entry. Pin its upstream provenance and retain any applicable notices. Resolve only generated bkit agent names. Start a fresh Pi RPC child using the verified worktree and explicit provider, model, thinking and tools. Each child has an independent conversation, writes its own expected artifact and returns a bounded structured outcome. Workers cannot dispatch more workers.
- **Readiness contract.** Extend the existing host launcher with a managed Pi entry that loads the pinned coordinator extension explicitly and starts without a workflow prompt. The extension's registered workflow entry checks readiness and registers the active invocation with the engine before expanding a skill. A direct skill load outside that entry has no active invocation. Pi workflow mutations through the engine require the matching live invocation for the repository, worktree and run. Use the same no-initial-prompt boundary for children. The supervisor sends the task only after a matching ready message arrives on the private startup channel. Verify Pi version, guard revision, role, trust, worktree, effective tools and provider/model/thinking in the executing runtime. Missing, invalid, stale or timed-out readiness closes the channel and aborts startup. A missing extension cannot generate its own proof. This enforces the managed workflow boundary. Arbitrary commands run outside it retain their OS permissions.
- **Safeguard adapter.** Map Pi's tool and session events to the shared rules-read, GateGuard, ReadGuard and guardrails logic. Preserve advisory versus blocking decisions, including user confirmation for actions that require it. In headless mode, return a blocked outcome when a required decision cannot be obtained. Cover shell, reads, edits, writes and any enabled tracker/research routes. These checks constrain managed Pi tool calls. A subprocess shares OS-level authority unless the host applies independent isolation.
- **Tracker tools.** Reuse bkit's engine-first tracker transport and render the applicable Pi fallback with native MCP. Preserve unrelated servers and options. The managed session starts from an explicit resource list and exposes only the exact tools allowed by its role. Disable native MCP when the role needs none. For a role that needs it, hide other tools, discovery, resources and Codemode, and recheck authorization in the tool-call guard. The active tool list alone cannot establish indirect reach. A tracker-free run needs no tracker MCP connection.
- **Research tools.** Map canonical `WebSearch` to the Pi adapter's `bkit_web_search` and `WebFetch` to `bkit_web_fetch`. Register each tool only for the coordinator or persona that declares it. Use Tavily's HTTPS Search and Extract endpoints, reusing the `BKIT_TAVILY_API_KEY` setup from the existing context recipe. Debug context blocks still use the engine's context-fetch path. Validate external query and URL arguments before sending them, apply the repository's egress and secret-handling rules, and bound responses to 16 KiB per call, five search results or one public HTTP(S) URL, and 15 seconds. Return source URLs, available content and a redacted failure status. Treat returned material as untrusted evidence. Missing credentials, denial, authentication failure or transport failure remains unavailable evidence and takes the workflow's existing recovery route when the tool is required. [Tavily Search](https://docs.tavily.com/documentation/api-reference/endpoint/search), [Tavily Extract](https://docs.tavily.com/documentation/api-reference/endpoint/extract).

Pi supports interactive workflow execution through its verified owner answer channel. The coordinator passes the presence of that channel to bkit's runtime policy for each invocation and recomputes it on resume. JSON, print and RPC leaves have no owner answer channel. An unanswered approval requirement returns an explicit blocked or deferred result through the current decision path. The local/CI classification and existing worktree and push capabilities are resolved independently. `bkit-auto` dispatches to the selected Pi phase skill. Existing infrastructure that launches agents stays in charge of cloud dispatch and CI.

## Data Model

<!-- prettier-ignore -->
| Record | Authority and fields |
| --- | --- |
| Pi install state | Store the selected provider under the existing install state, proposed as `package.json` `bkit.providers.pi.default`, independently of OpenCode. A fresh Pi install defaults to `openrouter`. A later render or plain reinstall uses the recorded selection. An explicit `--pi=<provider>` replaces it after validation. The selected ID must match a configured Pi registry provider exactly at readiness. |
| Agent selection | Start from the complete canonical inventory of Pi-dispatchable personas. Resolve each model from the selected provider's existing `Prompt / Provider / Model` override before its canonical provider column. A provider without a column needs an explicit row for every persona. Reject duplicate, unknown and missing entries. A proposed consumer-owned `bkit.providers.pi.thinking` map in `package.json`, keyed by provider ID then canonical agent name, overrides the default thinking level. Validate its values against Pi's supported levels and reject mismatches for an explicit override. |
| Resolved child request | Correlate the run, workflow, step, attempt and dispatch with the validated worktree, exact persona and artifact paths, requested provider/model/reasoning and tool policy. Pass validated arguments and approved resource locations. Keep task text separate from executable and option selection. |
| Dispatch lease and outcome | Before admitting a writer, the engine records dispatch ownership and the supervisor and containment identities in the Git-common outbox, scoped to the canonical worktree. Keep the lease pending until cleanup is proved. Record one terminal outcome per requested child, even for one cancelled before launch, and one dispatch summary. Persist artifact receipts and cleanup evidence with the lease. Credentials use Pi auth or the provider's supported environment. |
| Workflow progress | Existing step artifacts and `status.jsonl` remain the durable source of truth. A child outcome identifies evidence for the existing validators. It does not determine step completion. |

## Components / Flows

1. **Install and verify ownership.** Resolve the module and provider, check destination ownership and JSON validity before writing, and register exact Pi-owned resources in the manifest. Add the extension, persona and skill mirrors to the managed output lifecycle. Merge shared JSON against its current bytes and fail with a retry diagnostic if another writer changes them before replacement. Check partial Pi footprints using exact managed paths and ownership markers even when a failed run has left the previous version record in place. Diagnose the failed destination and rerun the same scoped install or upgrade, then run `bkit check`. Scoped uninstall removes only proven Pi-owned entries. A partial-write fixture must preserve an unrelated JSON key and a co-installed host across repair and removal.
2. **Enter the workflow.** Start through the managed Pi launcher in a trusted project. A ready coordinator invocation binds the selected phase, repository, current checkout and invocation role. Bind the resolved worktree and run before their first scoped mutation. Recheck current authorization in the engine at mutating workflow entry points, including gate and resume calls. The managed tool guard also checks that authorization before workflow writes through shell, edit or tracker tools. Preserve the existing branches, retry routes, progress, owner decisions and artifact expectations. `bkit-auto` forwards the selected phase and arguments through the verified skill route.
3. **Resolve and delegate.** Validate exact registry identities, credentials and tool capabilities for the selected provider. For OpenRouter defaults, reuse the OpenCode policy intent with the resolved model: at-bar models keep canonical effort, other models follow the OpenCode ladder, and `none` maps to Pi's `off`. Translate to the closest verified level at or below the intended level, except where a model's documented minimum is higher. Report the translation before dispatch and verify the exact resulting level at readiness. Fail when no verified mapping exists. For another provider, start from canonical effort and its verified Pi capability map. For both paths, validate explicit thinking overrides exactly and refuse silent clamping, provider fallback or model aliases. The three measured default pairs are `deepseek/deepseek-v4.1-flash-1017` with `max` and `openai/gpt-6.1-sol` with `medium` or `high`. Use literal argument arrays and at most four concurrent children per dispatch. Disable discovered extension packages for leaves and explicitly load the bkit guard and the required, verified capabilities. Configure the selected provider through Pi's supported registry and auth sources. [Pi RPC mode](https://pi.dev/docs/latest/rpc), [Pi tool exposure](https://pi.dev/docs/latest/mcp#control-tool-exposure).
4. **Supervise and collect.** A dispatch supervisor independent of the coordinator owns an OS-enforced containment scope and observes coordinator loss on a private control channel. The engine records the lease before the supervisor admits a worker into that scope. Pi and every descendant, including a shell that starts a separate process group, must enter or inherit the same scope before task execution. Use a delegated cgroup v2 on Linux as a candidate and require a separate proof of a suitable containment mechanism on macOS or Windows. A PID check, process-group signal or process-list snapshot is insufficient proof. On cancellation, deadline or coordinator loss, stop scheduling, request cancellation, wait up to 5 seconds, then terminate the whole scope and verify it is empty and closed to new work. Record cleanup before releasing the lease. If the supervisor or scope fails, treat the lease as unresolved and prohibit worktree reuse until cleanup is proved.
5. **Validate outcomes and evidence.** Require a matching startup message within 10 seconds. Enforce each persona's turn cap and a 30-minute wall deadline per child. Limit each JSON record to 256 KiB, retained stdout and stderr to 1 MiB each, and model-visible terminal text to 16 KiB. Oversized protocol records fail the child. Keep bounded retained output marked when truncated. Accept a settled result only for the matching RPC prompt after its run is idle, its startup and effective settings match, and the child and its scope have stopped. A single `agent_end` event or zero exit cannot prove this. Return results in request order.
6. **Bind artifacts to the attempt.** Reserve distinct canonical output paths for concurrent children and reject paths or symlinks that leave the permitted artifact directory. Before admitting a new child, set aside any existing file at its declared output path in the run outbox, and establish that the output is absent. The previous evidence stays linked to its original dispatch. On settled success, validate each newly created expected file, reject unexpected workflow output paths, and issue a receipt with its path and digest bound to the run, step, attempt, agent and dispatch. Require the receipt and matching bytes at `steps finish` before the existing verdict validation. Quarantine partial or failed outputs without issuing a success receipt. For an authorized header-only repair, seed the prior receipted artifact explicitly, bind its body digest and lineage to the repair dispatch, and replace its receipt only after the unchanged body and corrected header pass validation. Test an unsuccessful retry followed by a child that claims success without writing.
7. **Resume or switch hosts.** Before any host reuses or removes the canonical worktree, the engine checks the shared lease under the existing worktree lock. An absent coordinator, elapsed deadline or changed host cannot clear it. Continue only after the supervisor or a recovery check independently verifies the exact containment identity is drained and closed, and records cleanup. If evidence is unavailable, report `cleanup-unverified` with the worktree, dispatch and recovery action. Keep the lease active and forbid a new writer. Recompute the current Pi capabilities and owner answer channel on a Pi resume. An uncertain external write follows the existing workflow reconciliation route before retry.
8. **Report and prove compatibility.** Emit one bounded `[bkit-pi]` structured diagnostic per refused startup and one terminal outcome per requested child to the Pi result channel or launcher stderr. Include the startup or dispatch ID, run/step/attempt and agent when available, a stable reason, and requested and effective non-secret settings when relevant. Count outcomes once per dispatch by reason in the existing workflow evidence. Distinguish missing credentials, incompatible settings, tool policy denial, provider refusal, timeout, cancellation, invalid artifact, unverified cleanup and evidence-write failure. Persist the terminal summary in the Git-common run outbox after startup. A failed evidence write blocks completion and leaves the lease unresolved where cleanup cannot be recorded. Document diagnostics and recovery in the provider and observability references.

Use the pinned npm release `@earendil-works/pi-coding-agent@1.5.0` as the initial compatibility target and record its registry integrity and the exact revision used to adapt the example. Prove every supported platform and mode in a disposable repo. Cover broken or missing guard in parent and child, direct and indirect tool denial, two concurrent children, non-interactive owner decisions, normal and forced cleanup of a descendant in another process group, hard coordinator and supervisor termination, and cross-host resume. Exercise all five workflows and `bkit-auto` through the existing gates, including the configured tracker fallback, a tracker-free run, and the research tools. Verify a real tool call and effective thinking for every default OpenRouter pair and a non-default provider with an agent override. Record which checks ran, which could not run, and the exact supported combinations. Static rendering verifies resource ownership. Claim runtime support only where the real Pi checks pass.

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
| Start without a task and require explicit readiness, current decision-channel capability and attempt-bound artifact evidence. | Trust extension discovery, infer prompts from local/CI, or accept a valid file at its expected path. | Pi 1.5.0 demonstrated startup refusal only with the guard loaded and disproved the current local/headless equivalence. An older valid artifact cannot certify the current child. |
| Require containment across descendant process groups and retain a lease on uncertain cleanup. | Signal Pi's process group or wait for a stale timeout. | On macOS the spike observed a separate shell process group still alive after Pi was killed. Worktree reuse requires proof the prior writer stopped. |
| Use the existing Tavily credential convention for named Pi research tools. | Treat shell fetching or the debug context block as a callable search tool. | The default Pi tools lack both research capabilities. The adapter can bound calls and apply existing policy without a new service. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Pi skill renderer with supervised CLI child processes | KEPT | The official example supplies subprocess delegation. Release requires a verified guard and containment boundary around that subprocess path. |
| Independent Pi SDK sessions | REJECTED | A separate SDK worker offers precise resource construction but would own additional Pi startup and MCP wiring. Reconsider the separate worker only if a required CLI capability is disproved and the same workflow guarantees can be verified with the SDK. In-process SDK sessions share more failure state. |
| Host-independent delegation broker | REJECTED | Existing hosts already have their own delegation contracts. A broker would add a second lifecycle and widen the credential boundary for a single host integration. |

## Trade-offs Accepted

- Separate Pi processes add startup time and memory. They give each agent its own conversation. An independent supervisor owns worker cleanup.
- Host-specific skills add rendered output and tests. Canonical workflow sources and gates still have one owner.
- Exact model and tool validation can stop execution on a version or configuration mismatch. It prevents a run from silently changing models, effort or available safeguards.
- Process and tool boundaries need verification on supported platforms. Cost and performance comparisons require representative complete workflows, including guards and delegation.

## Risks & Open Questions

- **Mixed installations.** The exact Codex exclusion and explicit Pi skill invocation worked through reload in a checkout and linked worktree on Pi 1.5.0. Repeat with the shipped assets and both install orders. [Pi skills discovery](https://pi.dev/docs/latest/skills).
- **Failure evidence.** A readiness refusal, policy mismatch, invalid artifact or uncertain cleanup blocks the applicable operation with its own reason. Failure to persist the diagnostic is independently visible. Resume keeps an unresolved cleanup lease active.
- **Compatibility scope.** The design may progress with identified runtime unknowns. Release requires live evidence for the complete scoped integration and a version-bound compatibility record. The public harness leaderboard is motivation. A bkit cost claim needs a controlled full-workflow comparison.

### Startup proof (S1)

Which route should the build use to prove refusal before a provider request and a workflow mutation when the guard is missing or broken? The loaded refusal handler exited before provider hooks in TUI, JSON and print. Missing-guard behavior remains unverified.

Options: A) Require the managed CLI entry and RPC handshake to pass both sentinels — preserves the chosen subprocess route and holds support until it is proved · B) Evaluate a separate SDK worker when the CLI proof fails — adds integration work and keeps the same sentinels.

Recommended: A) Prove the selected route first. Revisit the SDK only if the required mechanism is disproved.

Default if unanswered: A).

### Tool reach (S2)

How should the build handle unverified native MCP restrictions? The spike observed a restricted tool list with MCP disabled. It did not exercise an actual forbidden call or an allowed subset.

Options: A) Verify the guarded native route against a real MCP fixture — retains the current tracker fallback and requires foreign-extension, direct, indirect and nested-delegation negatives · B) Investigate a narrow adapter that publishes only explicit tracker calls if native restrictions fail — adds a translation surface and requires the same denial and tracker parity tests.

Recommended: A) Prove the native route with a positive control for an allowed call and negative controls for the others.

Default if unanswered: A). Withhold support for any affected route until it passes.

### Alternate provider evidence (S3)

Which non-default provider should be the first live override fixture? The spike verified all three OpenRouter default pairs. The results show Pi's effective thinking settings and real tool calls. They do not measure provider-internal reasoning.

Options: A) Use the first credentialed alternate Pi provider with a complete persona model mapping — minimizes setup and proves configurable selection with an explicit override · B) Name one specific alternate provider before planning the probe — targets the owner's preferred setup and may require provisioning.

Recommended: A) Validate the resolver with one real alternate and limit the advertised matrix to tested combinations.

Default if unanswered: A). Alternate provider support stays unverified until an authenticated tool call passes through bkit's resolver.

### Descendant containment (S5)

Should release wait for native macOS containment proof or certify each platform independently? Pi's own process group did not contain its shell descendant in the macOS spike.

Options: A) Certify each platform only after its own containment and recovery tests pass — allows verified platforms to proceed while retaining every workflow requirement · B) Require macOS containment proof before releasing any platform — prioritizes a common release and may delay all Pi support.

Recommended: A) The cleanup guarantee is platform-specific. Preserve the unresolved lease on every platform until cleanup can be proved.

Default if unanswered: A). A platform without proved containment stays unsupported for workflow execution.

### Owner decisions in local non-interactive mode (S6)

Should local sessions without a human answer channel use the existing headless decision policy or wait for an explicit caller integration? The spike showed Pi JSON and print expose no UI while the current engine classified local execution as interactive.

Options: A) Report the verified channel capability independently and apply current headless decision rules — permits safe automation and blocks or defers unresolved required decisions · B) Add and verify an explicit external owner answer channel before allowing non-interactive decisions — supports remote answers and adds protocol and authorization work.

Recommended: A) Reuse the existing decision policy and verify both the interactive and blocked paths without changing worktree or push capabilities.

Default if unanswered: A).

## Suggested Workstreams

### WS-1: Pi installation and configuration

#### Scope

Cover the opt-in Pi module, manifest, project-local assets and the existing install, upgrade, check, status, doctor and uninstall paths. Render the five phase skills, `bkit-auto`, personas and extension entries from their canonical sources. Own the Pi skill route and exact Codex skill exclusions while retaining unrelated skills. Preserve other hosts and consumer-owned settings through concurrent JSON changes, partial writes, tracker changes, repair and removal.

Resolve the independent Pi provider setting, OpenRouter defaults, complete persona model selections and Pi thinking overrides. Reuse the provider columns and existing model overrides, and specify the effective thinking translation for the runtime to verify.

#### Requires

[]

#### Rationale

One owner can define the assets and requested settings that the launcher and delegated agents consume.

### WS-2: Process containment and worktree recovery

#### Scope

Establish the independent supervisor and prove the operating system containment boundary before admitting child writers. Own cancellation, deadlines, coordinator loss, forced termination and cleanup of descendants in separate process groups. Use the Git-common lease and existing worktree lock to gate reuse and removal across hosts. Keep the lease active after supervisor loss or whenever cleanup cannot be proved. Preserve the existing reconciliation route for uncertain external writes. Carry the platform support decision in S5 into the compatibility evidence.

#### Requires

[]

#### Rationale

Containment can be proved with a disposable process fixture before integrating Pi. The shared lease and worktree lock enforce the same writer boundary on every host that resumes or removes the worktree.

### WS-3: Managed entry and runtime safeguards

#### Scope

Bind the managed launcher, trusted coordinator entry and guard-only RPC leaf entry to live engine invocation checks. Enforce the no-initial-task startup boundary and verify readiness, role, worktree, tool policy and exact effective provider, model and thinking. Reuse the existing rules and guard engines for Pi's shell, file and tool events. Carry owner answer channel capability independently of local or CI classification, retain worktree and push permissions, and recompute the channel on resume. Cover refusal for broken or missing guards and required decisions with no answer channel under S1 and S6.

#### Requires

[WS-1]

#### Rationale

The managed entry and both execution roles share the same trust and readiness contract.

### WS-4: Tracker and research tools

#### Scope

Preserve the engine-first tracker path and merge the configured tracker entry into Pi's native MCP settings without taking ownership of unrelated entries. Enforce each role's exact grants and cover direct and indirect access, foreign extensions and nested delegation under S2. Preserve tracker-free execution. Expose the bounded Tavily search and extract tools to the declared roles, applying the existing egress, credential, untrusted-evidence and recovery rules.

#### Requires

[WS-3]

#### Rationale

Tracker and research calls cross the same runtime tool policy and need explicit grants and denial evidence.

### WS-5: Delegation and workflow evidence

#### Scope

Adapt Pi's official subprocess example with pinned provenance and notices. Wire the workflow skills and `bkit-auto` to isolated RPC children under the verified supervisor. Bind each request to its run, step, attempt, agent, worktree and reserved artifact. Cover bounded parallel dispatch, readiness and execution limits, settled RPC results, output budgets and stable result order. Issue receipts for fresh artifacts and authorized header repairs, quarantine incomplete output and require matching receipts at the existing step gates.

Emit bounded, redacted startup refusals and terminal child outcomes, including cancellation before launch. Persist dispatch summaries and reason counts in existing workflow evidence, and block completion on evidence-write failures. Document diagnostics and recovery with the provider and observability references.

#### Requires

[WS-2, WS-4]

#### Rationale

The dispatcher must coordinate process lifetime and evidence ownership before the engine can accept a delegated result.

### WS-6: Compatibility and release evidence

#### Scope

Record the pinned Pi release, registry integrity and example revision. Exercise the shipped assets and lifecycle across both mixed-host install orders, a checkout and a linked worktree. Run the five phase workflows and `bkit-auto` through their existing gates. Include guard refusal, real tool grants and denials, tracker fallback, tracker-free and research runs, parallel agents, cancellation, recovery, stale artifacts and cross-host resume.

Verify every default OpenRouter model and thinking pair through the bkit resolver and run an authenticated tool call with a non-default provider and per-agent override under S3. Preserve the Pi 1.5.0 spike observations as scoped evidence. Record the supported platform, mode and provider combinations only after live proof. Carry S1, S2, S3, S5 and S6 into the release checks with their reviewed defaults and fallback conditions.

#### Requires

[WS-5]

#### Rationale

Runtime support depends on the installed assets, guards and process recovery working together. Each verified combination can be named precisely in the supported matrix.

## Suggested Plans

### P-1: Complete Pi workflow support

#### Deliverable

Ship the opt-in Pi host with its managed skills, configurable providers and per-agent settings, supervised delegation, safeguards and the existing bkit workflow gates. Include lifecycle and recovery documentation and publish the compatibility evidence for the verified combinations.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5, WS-6]

#### Requires

[]
