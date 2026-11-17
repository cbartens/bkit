# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Pi extension with a bounded child process ⭐ Recommended

Keep the workflow in skills and let a bkit-maintained extension adapt the official subagent example. Give each delegated agent a separate Pi process and a fresh conversation. Pass a resolved worktree, canonical persona, model, reasoning level, tools and turn budget. Return bounded results in task order, including distinct cancellation, timeout, process failure and model failure outcomes. The workflow still validates its required artifacts and decides whether to advance. [Official Pi subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent)

- **Complexity** `MEDIUM`. Process spawning, cancellation and result streaming follow the example. bkit owns the execution policy, guard setup and the contract between the parent and child.
- **Extensibility**. The renderer selects the workflow skill, tracker integration and provider defaults. The extension resolves provider, model and reasoning overrides, checks the supported combination, and launches the same child path for both single and parallel delegation. Keep the provider-independent part of the request free of Pi CLI syntax so version changes stay at the boundary.
- **Risk**. A separate process isolates conversation state. It shares filesystem and operating system permissions with the parent unless another control restricts them. Explicitly load the guard logic in both sessions, restrict child tools and credential exposure, suppress recursive dispatch, and prove the child received the expected controls before its first model request. Test cancellation against descendants as well as the immediate Pi process. Treat child stdout, stderr and model summaries as data, including when forwarding a result to the coordinator.
- **Maintenance**. Pin the minimum supported Pi release against an upstream revision of the example. Keep the adaptation small and record the differences. Contract fixtures cover the startup handshake, model/tool event decoding, bounded output and cancellation. Use a live disposable repo to verify a valid provider/model/reasoning combination and an actual tool call before claiming compatibility.
- **Friction vs ideal**. Add one install module, one manifest slice, a workflow transform and one extension with separate coordinator and leaf entry points. Reuse canonical prompts, workflow engine commands and guard policy. Codex already renders workflow skills into `.agents/skills/bkit-*/SKILL.md`, which Pi also discovers. Give Pi's host-specific skills separate managed ownership, and prove that Pi selects the correct skill when both hosts are installed. Use `.pi/skills/` plus a verified precedence or resource filter. Preserve unrelated Pi files during install, check, upgrade and uninstall. [Pi skills](https://pi.dev/docs/latest/skills)

## Approach B — Separate child process with the Pi SDK

Adapt the example's parent-side tool, scheduler and cancellation approach, and launch a small worker that constructs a Pi SDK session with explicit resources, tools, model and reasoning settings. The worker reports through a bkit-owned structured protocol. [Pi SDK](https://pi.dev/docs/latest/sdk)

- **Complexity** `HIGH`. bkit would own SDK startup, resource discovery, session lifecycle and the result protocol as well as process supervision.
- **Extensibility**. The worker can inject a strict resource loader and an exact tool set. It can use a temporary session manager and expose guard initialization as a structured handshake. Isolation remains explicit because the worker runs out of process.
- **Risk**. An embedded session can diverge from interactive Pi. In particular, SDK sessions require explicit loading of built-in MCP extensions. It is easy for a fixture to pass while the SDK worker resolves different credentials, models, or tool exposure. [Pi MCP SDK configuration](https://pi.dev/docs/latest/mcp#use-mcp-from-the-sdk)
- **Maintenance**. bkit takes on SDK dependency compatibility, startup cost and resource configuration for each supported Pi release. The controlled protocol can reduce event decoding churn once the integration is stable.
- **Friction vs ideal**. Adds a second Pi entry point and packaging contract to the existing renderer and installer. Adopt it only if the CLI transport cannot load a guarded leaf with the required trust, credentials and model settings, or cannot stop it reliably.

## Approach C — Shared host-independent delegation service

Give bkit a process supervisor and worker protocol shared across hosts, with Pi's example adapted as the first client. Host adapters would translate model, skill, tracker and tool capabilities into the common request and result contract.

- **Complexity** `HIGH`. A shared supervisor must define worker lifetimes, identity, authorization and cancellation across unlike hosts.
- **Extensibility**. Other hosts can adopt the same supervision and observability once their capabilities and trust models fit. This is valuable only when more than one host has a demonstrated need for that contract.
- **Risk**. A lowest-common-denominator abstraction can weaken native safeguards or introduce a second workflow state owner. Credentials and action authority would also cross a new process boundary.
- **Maintenance**. A service or broker adds a versioned client/server interface, resource cleanup, platform support and a cross-host test matrix.
- **Friction vs ideal**. Moves execution responsibility out of existing native delegation. Other hosts would need invasive adapter work and migration even though Pi is the only requested integration. Keep the Pi boundary small and extract a shared implementation if another host later needs it.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Use skills for all five phase workflows and `bkit-auto`. Keep existing engine commands, gates and artifact contracts. | Template-only workflows or duplicating the workflow engine inside the extension. | A skill carries full instructions. Stable files and engine commands make runs resumable across hosts. |
| Adapt the official subprocess example in a bkit-maintained extension with a guarded leaf path. | SDK worker or host-independent broker. | The CLI path preserves Pi's native runtime and separate conversations while keeping the new boundary small. Use the SDK alternative if targeted probes disprove required CLI behavior. |
| Reuse the OpenRouter provider column for default model IDs and verify the corresponding Pi reasoning controls. Let users select a supported provider and override agent models and effort. | A duplicate Pi model column, copying OpenCode JSON, or silently inheriting the parent model. | Model identity is a provider concern. Pi's reasoning controls and credential resolution belong at the host boundary. Report incompatible combinations before dispatch. |
| Keep tracker writes with existing engine commands. Map required fallback tools through native Pi MCP on compatible versions, preserving unrelated server configuration. | An extension-maintained MCP bridge or copying all user MCP config. | Native Pi supports project MCP configuration for stdio and streamable HTTP. Probe the selected tracker transport, auth and direct tool exposure in a trusted disposable repo. [Pi MCP](https://pi.dev/docs/latest/mcp) |
| Keep the safety policy and workflow authority in bkit. | Depend on inherited extensions or on the child persona's prose alone. | Guard registration, restricted leaf tool access and abort handling are properties of execution. A successful child exit or summary cannot replace a passing workflow gate. |
