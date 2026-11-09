## Session Prompt — this run's, newer than everything below

[$bkit-design](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-design/SKILL.md) #254

## Issue description — oldest

## Summary

Add [pi.dev](https://pi.dev/docs/latest) (a minimal terminal coding harness, peer to Claude Code / Cursor) as a **fourth native install target**, alongside `claude`, `cursor`, and `opencode`. pi reads `AGENTS.md` — which bkit core already ships — so the rules/dispatch layer works on day one with zero new code. It slots in as a new module wired exactly like `opencode` was in #245.

## Why it's the `opencode` pattern

bkit already renders one canonical source into three per-tool on-disk formats. pi becomes the fourth: a `ModuleFlag`, a `runPiModule()` renderer, a `PI_MANIFEST`, a `.bkit/templates/.pi/` tree, transforms, and tests.

## Canonical-source → pi mapping

<!-- prettier-ignore -->
| bkit canonical source | pi.dev target | Effort |
| --- | --- | --- |
| `.agents/rules.md` via `AGENTS.md` | `AGENTS.md` (already shipped by core) | **free** |
| skills (`.agents/skills/`) | `.pi/skills/` | low — pi has first-class skills |
| `.claude/settings.json` analog | `.pi/settings.json` (project) / `~/.pi/agent/settings.json` (global) | low — JSON, Tier-2 deep-contain |
| `.bkit/workflows/bkit-*.md` (slash commands) | `.pi/prompts/bkit-*.md` (prompt templates) | low/medium — near pass-through |
| `.bkit/prompts/bkit-*.md` (30+ subagent personas) | **no clean native home** | **the design fork** |
| `.mcp.json` (tracker MCP) | unclear pi supports MCP | unknown — confirm live |
| per-agent model pins (`prompts.md` column) | pi model config | medium — new `Pi` column |

## Key finding: workflows → pi prompt-templates is the easy mapping (NOT a gap)

pi has **no separate "workflow" primitive**, and doesn't need one. On every target, bkit "workflows" already render to that tool's slash-command format (`.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`). pi's [prompt-templates](https://pi.dev/docs/latest/prompt-templates) are the closest match of any target to bkit's source:

- `.pi/prompts/*.md`, **filename → slash command** (`bkit-design.md` → `/bkit-design`)
- markdown + optional YAML frontmatter (`description`, `argument-hint`) — pi **keeps** frontmatter, unlike Cursor (T1 strips it)
- `$ARGUMENTS` / `$1` / `${1:-default}` — the **same syntax** bkit already emits for Claude commands

### Naming collision — pi "prompts" ≅ bkit **workflows**, not bkit prompts

The word collides but the behaviour inverts. Decisive tells from the frontmatter:

<!-- prettier-ignore -->
|  | bkit **prompts** (`.bkit/prompts/`) | bkit **workflows** (`.bkit/workflows/`) | pi **prompt-templates** (`.pi/prompts/`) |
| --- | --- | --- | --- |
| Frontmatter | `name, model, tools, effort, permissionMode, maxTurns` | `description` only | `description, argument-hint` |
| What it is | subagent **persona** (model+tool budget) | user **slash command** | user **slash command** |
| Invoked how | *dispatched* as an agent | typed `/bkit-auto` | typed `/review` |
| Takes `$ARGUMENTS`? | no | yes | yes |

So `.bkit/workflows/` → `.pi/prompts/` is the near-direct mapping. It's bkit's **prompts** (agent personas with `model`/`tools`/`effort`) that have no native pi home.

## The one real design fork: subagents

pi core has **no first-class subagent format**. Options:

- **A — target `pi-agents-team`'s `.pi/agent/agents-team.json` schema.** Faithful subagent semantics; couples bkit to a third-party package + assumes the user installs it. Most work.
- **B — render agent personas as pi skills / prompt-templates.** Native, no external dep; flattens orchestrator→subagent distinction. Medium work, some semantic loss.
- **C — ship rules + skills + commands only; defer subagents.** Smallest viable target; mirrors how opencode + model-curation were phased.

## Open questions (confirm against a live `pi` install before building)

- [ ] Exact prompt-template behaviour: can a template **dispatch a subagent**, or is it argument-expansion only? Per docs it's expansion-only — if so the workflow→template transform must flatten orchestration (like Cursor's T2). This gates the transform design.
- [ ] Does pi support **MCP** at all? If not, the tracker-integration layer (`.mcp.json` render) simply doesn't apply to this target.
- [ ] How pi pins **per-agent models** (new `Pi` column in `.bkit/prompts.md`, probed live — not guessed; cf. the Cursor/zen model-ID lessons).

## Recommended scope (phased, like opencode)

**Phase 1 — Option C, contained first PR, immediate value, no third-party coupling:**
- `pi` module: ships `AGENTS.md` (free) + `.pi/settings.json` + `.pi/skills/` + `.pi/prompts/` (from workflows)
- defer subagent orchestration until the `pi-agents-team`-vs-skills question is settled live

**Phase 2 — model curation:** add `Pi` column once the live catalog is probed + tool-calling verified per tier.

**Phase 3 — subagents:** resolve A/B/C after a live install confirms whether templates can dispatch agents.

## Surface area (by analogy to the opencode module)

- `bkit-cli.ts` — add `"pi"` to `ModuleFlag` + `MODULE_FLAGS`; flag parsing in `parseArgs`; `printUsage`
- `bkit-modules.ts` — `runPiModule()`, `renderPiAgentsCommands()`, `applyPiCommand()` transform, `MODULE_REGISTRY` + dispatch order + `renderManagedOutputs`
- `bkit-manifest.ts` — `PI_MANIFEST` + register in `MODULE_MANIFESTS`
- `bkit-install.ts` — `parsePiModelLookup()` / `Pi` column (Phase 2)
- `.bkit/templates/.pi/` — settings.json, etc.
- tests — `bkit-cli.test.ts`, `bkit-install.test.ts`, `bkit-manifest.test.ts`, install integration
- docs — `README.md`, `.bkit/providers.md` (or equivalent), `.bkit/prompts.md` column

## References
- pi.dev docs: https://pi.dev/docs/latest
- prompt-templates: https://pi.dev/docs/latest/prompt-templates
- quickstart: https://pi.dev/docs/latest/quickstart
- pi-agents-team package: https://pi.dev/packages/pi-agents-team

## Issue comment — posted 2026-11-07T05:37:02.000Z

https://github.com/earendil-works/pi/

## Issue comment — posted 2026-11-07T05:37:27.000Z

https://huggingface.co/spaces/joelniklaus/harness-leaderboard

## Issue comment — posted 2026-11-07T06:02:29.000Z

**Yes—Pi supports workflows through skills, much like Codex.** It also offers prompt templates as a simpler way to create slash commands. My earlier answer focused too narrowly on templates.

<!-- prettier-ignore -->
| Pi mechanism | What it provides | Fit for bkit |
| --- | --- | --- |
| **Skills** | `SKILL.md` instructions plus scripts and references, loaded when needed | Full workflow instructions |
| **Prompt templates** | Markdown expanded by `/name`, with arguments such as `$ARGUMENTS` | Convenient workflow entry commands |
| **Extensions** | Executable code adding tools, commands and event handlers | Subagent dispatch and other runtime integration |

Pi explicitly recommends skills for workflows needing more context than a prompt template. It discovers **`.agents/skills/` directly**, and supports explicit invocation such as:

```text
/skill:bkit-build your-task
```

That means our existing skill location is already compatible with Pi’s discovery mechanism. It does **not** establish that every instruction inside those skills will run unchanged. [Pi skills documentation](https://pi.dev/docs/latest/skills)

This is essentially the same packaging approach as Codex: reusable workflow instructions in `SKILL.md`, with supporting resources loaded as needed. [Codex customization](https://learn.chatgpt.com/docs/customization/overview)

**The remaining gap is subagent execution, rather than workflow packaging.** A skill can instruct Pi to delegate, but it cannot create a missing delegation tool. Pi documents a `subagent/` extension example; bkit would need to integrate and verify that capability, including agent personas, model choices and result handling. [Pi extensions](https://pi.dev/docs/latest/extensions)

For [#254 — Add pi.dev support](https://github.com/cbartens/bkit/issues/254), I’d therefore recommend **skills for the workflows, optional prompt templates for `/bkit-build` convenience, and an explicit subagent integration**. The issue’s earlier template-first proposal deserves updating.

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 First release scope: Complete workflow support, including delegated agents, model selection and safeguards. The owner also directed attention to https://github.com/cbartens/bkit/issues/254#issuecomment-6703124017, incorporated into the input.
- Q2 Delegated-agent integration: Ship a bkit-maintained Pi extension based on Pi's official subagent example.
- Q3 Model providers: Reuse existing model selections with compatibility verified. The owner's initial clarification was OpenRouter only, using the OpenCode/OpenRouter settings; Q5 supersedes that provider restriction.
- Q4 Initial draft acceptance scenario: The owner requested configurable settings instead of fixed OpenRouter delegation; the revised Q6 scenario supersedes this draft.
- Q5 Configurability: Select the provider and override per-agent models and reasoning settings, similar to OpenCode; default to the existing OpenRouter selections. The owner answered A).
- Q6 Revised draft acceptance scenario: Accepted. The owner answered A).

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

I install Pi support and run complete bkit workflows through skills. A bkit-maintained extension runs delegated agents with configurable providers, models and reasoning settings, defaulting to bkit's existing OpenRouter selections, while preserving safeguards and reporting failures clearly.

#### Success Criteria

- All five workflows and `bkit-auto` support their required delegation and gates.
- Agents run separately, including required parallel execution and result handling.
- Provider selection and per-agent model/reasoning overrides work; defaults reuse existing OpenRouter selections.
- Safeguards apply to both the coordinating session and delegated agents.
- Install, upgrade, check and uninstall preserve unrelated configuration and other hosts.

#### Key Edge Cases

- Pi and Codex discover skills in the same repository.
- A selected provider, model or reasoning setting is unsupported.
- A required extension or safeguard is unavailable.
- Agents fail, exceed limits or are cancelled; workflows resume or switch hosts.

#### Process Sketch

- WHEN I install Pi support → THEN workflows and the required extension become available.
- WHEN I configure a provider or agent override → THEN agents use the verified settings.
- WHEN I leave settings unchanged → THEN existing OpenRouter selections apply.
- WHEN a workflow delegates → THEN separate agents execute with its required safeguards.
- WHEN execution fails or is cancelled → THEN the outcome is recorded and running agents are handled.
- WHEN I upgrade or uninstall → THEN unrelated configuration remains intact.
