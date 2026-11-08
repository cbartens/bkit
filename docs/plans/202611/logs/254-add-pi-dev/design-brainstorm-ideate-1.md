# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Pi skills and guarded Pi subprocesses ⭐ Recommended

Add an opt-in Pi module that renders project workflow skills and agent definitions from bkit's canonical sources, then delegates through a bkit-owned extension adapted from Pi's subprocess example.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | HIGH. The installer and subprocess baseline exist. Most new work is the guard adapter, precise runtime validation and workflow verification. |
| Extensibility | New workflows follow the existing canonical render path. More providers can use the same explicit gateway-to-Pi mapping and validation once compatibility is verified. |
| Risk | A child can start with the wrong cwd, model or extensions and still exit successfully. A bare Pi tool allowlist can leave MCP access through Codemode. |
| Maintenance | One Pi host module, one Pi extension and a supported Pi version range with live compatibility checks. Existing hosts keep their render and runtime contracts. |
| Reuse vs new | Reuse Codex's skill frontmatter pattern, tracker substitution, OpenCode's selected-provider lifecycle, provider columns and model overrides, shared guards, and the official subprocess example. Add Pi-specific skill and agent rendering, settings and detection, an extension adapter and parity tests. |

- Write the workflow mirrors to Pi's own project skill directory and give them Pi-specific bkit names, for example `.pi/skills/bkit-pi-design/SKILL.md`. Route Pi's normal entry and `bkit-auto` to those skills. Pi also discovers `.agents/skills` and keeps the first duplicate name, so never make Pi's correctness depend on matching Codex names or resource load order. During co-installation, verify how Pi advertises the Codex skills and use exact Pi-side exclusions for the generated Codex workflow paths if required. Preserve arbitrary project skills, settings and other host files. [Pi skill discovery](https://pi.dev/docs/latest/skills), [Pi resource settings](https://pi.dev/docs/latest/settings#resources).
- Register Pi through the module and manifest machinery. Follow `renderManagedOutputs` and the host-owned-path rules for check, upgrade, version stamps and uninstall. Prefer Pi's project-local extension auto-discovery in a trusted repository to managing user-global configuration. Give `status` and `doctor` a way to distinguish installed files from a usable Pi integration. Fail the workflow readiness gate before the first workflow mutation if the expected Pi extension or mandatory tool is unavailable. [Pi project resources](https://pi.dev/docs/latest/settings#resources), [Pi extensions](https://pi.dev/docs/latest/extensions).
- Preserve the existing bkit workflow steps, status rows, worktree checks and artifact parsers. Transform `Agent` dispatch and host tool vocabulary in Pi's rendered workflow text. Adapt the example's single and bounded parallel dispatch, JSON event parsing and cancellation. Accept an exact generated agent name and verified bkit worktree rather than arbitrary paths, shell fragments or user-level agent substitutions. Pin child invocation arguments and use guarded child mode without nested delegation. Treat child process success and required artifact validity as separate checks. A child can write its named artifact directly in the worktree and return a compact result. [Pi's subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent), [Pi CLI modes](https://pi.dev/docs/latest/cli).
- Reuse the `OpenRouter` model column, including its exact model IDs, for the default provider. Keep the provider selection separate from OpenCode install state. Use existing provider columns where they describe the same gateway and reuse the existing model-override reader. Keep per-agent Pi reasoning overrides distinct from provider model defaults, and use Pi-native thinking levels through an explicit translation of bkit effort. Validate each configured provider/model with Pi's exact registry identity and verify effective thinking, since Pi can clamp requested values. Report an unsupported override or unavailable default without fuzzy matching or inheriting the parent's session model. Keep credentials in environment variables or Pi auth, outside rendered definitions and subprocess arguments. [Pi model selection and thinking](https://pi.dev/docs/latest/cli#models), [Pi providers](https://pi.dev/docs/latest/providers#openrouter).
- Load the same mandatory safeguard adapter in orchestrator and child mode. Use Pi's pre-tool event for shell, read, edit and write policy and its result event for advisories when appropriate. Translate the existing guard payload and reuse the classifiers and allowlist. Verify that any per-agent tool restriction also covers MCP, deferred discovery and Codemode. A plain `--tools` allowlist can leave MCP tools reachable from a script, and disabling all extensions also disables Pi's built-ins. Confirm the adapter is active before the child's first model call. Treat extension hooks as guard coverage for Pi calls, with OS isolation as a separate boundary. [Pi tool events](https://pi.dev/docs/latest/extensions), [Pi CLI tool selection](https://pi.dev/docs/latest/cli#tools), [Pi MCP permissions](https://pi.dev/docs/latest/mcp#permissions).
- Render supported tracker MCP wiring with Pi's native format and keep the existing engine-first tracker transport. Verify the names and tool exposure of the fallback actually used by each workflow. Cover interactive and headless behavior, including an explicit refusal if headless execution would require a user decision. The local Pi host can execute `bkit-auto`'s dispatcher and selected phase skill. A hosted Pi worker is a different integration surface from that workflow.
- Use the real Pi binary for release verification. Exercise all five phase skills and `bkit-auto`, same-repo Codex and Pi coexistence, install lifecycle, process failure and cancellation, direct and nested tool safety, and a verified non-default provider. Probe two distinct OpenRouter model pins, including authenticated tool calls and the effective reasoning level. The current bkit model catalog reports existence checks and an OpenRouter quota failure for the tool-call smoke, so those records cannot certify Pi compatibility.

## Approach B — Pi skills and SDK child sessions

Ship the same Pi host and workflow skills, but host separate SDK child sessions inside the bkit-maintained extension. Adapt the official example's task schema, fan-out and outcome model while using Pi's SDK to create and close each child session.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | HIGH. An SDK runner needs explicit construction of resources, tracker MCP, provider registry, auth, tools and session management. |
| Extensibility | Explicit resource loading gives the adapter direct control of each child's context and supported extensions. |
| Risk | Child state, process-wide settings and cancellation can interact across concurrent SDK sessions. The SDK requires deliberate loading of built-in MCP and related tools. |
| Maintenance | The extension owns more Pi session initialization and needs stronger tests around SDK version changes. |
| Reuse vs new | Reuse the same bkit rendering, model configuration, guard policy and upstream dispatch shape. Add a session factory and child tool wiring instead of subprocess/event transport. |

This route earns its cost if the subprocess readiness, cancellation or tool filtering probes show a capability gap. Confirm that each SDK child has independent context, effective tools, cancellation and artifact attribution before using it for the workflow's parallel roles. [Pi SDK](https://pi.dev/docs/latest/sdk), [MCP setup for SDK sessions](https://pi.dev/docs/latest/mcp#use-mcp-from-the-sdk).

## Approach C — None

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Target complete support for the five phases and `bkit-auto` in the first Pi integration. | Ship rules and commands first, then add delegated agents. | The owner settled full workflow support. |
| Ship the bkit-maintained extension and start with the official subprocess design. | Rely on an independently installed extension, or construct SDK children. | The owner selected bkit maintenance based on the official example. The example's subprocess shape already establishes the integration baseline for separate context, fan-out and cancellation. |
| Render distinct Pi workflow skills from the existing canonical sources. | Reuse Codex's installed skill file, duplicate its name, or maintain full workflow bodies in templates. | The Pi and Codex tool contracts differ, and distinct paths and names allow independent rendering and removal. |
| Use selectable compatible providers with existing OpenRouter defaults and explicit model/effort overrides. | Require OpenRouter, add a Pi-specific model table, or inherit the parent's current model. | The owner settled configurability. The model catalog is keyed on provider. Pi's reasoning interface belongs to its host adapter. |
| Reuse bkit guard policy and prove it is active before dispatch. | Depend on instructions in the skill, or presume the upstream example's defaults enforce bkit policy. | Existing workflow safeguards must apply to coordinating and delegated calls. Pi documents additional call paths through MCP and Codemode. |
| Keep bkit workflow state and verdict checks authoritative. | Treat a child exit code or Pi's session history as workflow completion. | Artifact gates and status records already support verification, resumption and host changes. |

Repository evidence: `.bkit/core/engine/install/modules/codex.ts` for skill rendering, `.bkit/core/engine/install/modules/index.ts` and `.bkit/core/engine/install/manifest.ts` for ownership and re-rendering, `.bkit/core/engine/render/models.ts` for gateway columns and overrides, `.bkit/core/hooks/` for shared policy, `.bkit/providers.md` § How to add a new host and `.bkit/workflows.md` § Subagent Invocation. The current environment has no Pi binary on `PATH`. The conclusions describe the documented interface and upstream example, and the actual runtime checks remain release gates.
