# Plan Input — 245-opencode-provider-host

## Session Prompt

/bkit-plan #245

## Issue #245 — Multi-provider execution host via OpenCode NVIDIA Ollama etc

**URL:** https://github.com/cbartens/bkit/issues/245
**State:** open
**Labels:** enhancement, bkit:plan

### Description

Follow-up to #243 / #244. The harness-level alternative to the router (Approach A).

## Scope (corrected — was mis-titled "OpenAI format")

opencode is bkit's **universal, provider-agnostic execution host** — the render target for any model **without a dedicated first-party agent CLI**: **NVIDIA NIM, Ollama (local), OpenRouter, Gemini, and any other**. It is NOT an "OpenAI-format" host; that framing was wrong. OpenAI's own models get a _separate_ native lane via Codex CLI (#247).

### Host taxonomy

| Models                                                | Native host     | Status              |
| ----------------------------------------------------- | --------------- | ------------------- |
| Anthropic (Claude)                                    | Claude Code CLI | shipped (canonical) |
| Multi-model IDE                                       | Cursor          | shipped (derived)   |
| OpenAI (gpt / o / codex)                              | Codex CLI       | #247 (later)        |
| **NVIDIA / Ollama / OpenRouter / Gemini / any other** | **opencode**    | **THIS issue**      |

## Approach A is a STOPGAP — it gets removed here, not kept

#243/#244 shipped Approach A: keep Claude Code as the harness and bridge NVIDIA/Ollama through `claude-code-router` (ccr). It was the zero-port stopgap, but it is a leaky abstraction — Claude Code injects its own model identity into every request, so a non-Claude model runs under Claude-tuned prompts and parrots "I'm Opus" (see #244). **Once opencode runs NVIDIA/Ollama natively, the router hack is removed — A and B do not coexist.**

## Why milestone-sized

Adding a host is the most expensive thing in bkit. The `.claude/` surface encodes contracts a new host doesn't share 1:1: subagent spawning + parallel fan-out (the 46 `bkit-*` agents), slash-command/skill syntax, `settings.json` hooks + `gateguard.cjs`, per-agent `model:`/`effort:` headers, MCP wiring, tool names. Every primitive needs a port + a render path in the installer (`bkit-modules.ts`, manifest, templates, tests) on the scale of the Cursor integration.

## Feasibility — recon DONE

See the two comments below. Summary: opencode expresses bkit's subagent + command + permission + MCP + rules model **near-1:1**, and **GateGuard ports MORE faithfully than to Cursor** (opencode has a `tool.execute.before` plugin hook that can block + return model-visible text; Cursor has no pre-edit event, so GateGuard is Claude-only today). Parallel subagent fan-out is **doc-confirmed** (the built-in `general` subagent: "run multiple units of work in parallel") — **🟡 one narrow unknown left**: concurrency across _distinct specialised_ subagents + deterministic result collection (docs don't state how a subagent returns its result). That's the spike.

## Acceptance / scope

- [ ] **Spike (the gate)** — confirm concurrent _distinct_ subagents + deterministic result collection on opencode wired to a real NVIDIA/Ollama model. Pass → proceed; fail (serial-only) → Approach A stays indefinitely and this issue is parked.
- [ ] New **opencode render target** in the installer (`bkit-modules.ts`) + manifest + `.bkit/templates/.opencode/` + tests
- [ ] **Claude→opencode transform** — tool names, `effort:` → provider `reasoningEffort`, permission shape, frontmatter (`mode: subagent`)
- [ ] **Port `gateguard.cjs` → opencode JS plugin** (`tool.execute.before`)
- [ ] **`bkit mode` redesign** — select _host_, not `ANTHROPIC_BASE_URL`. opencode talks NVIDIA/Ollama/etc. **directly — no router**
- [ ] **Remove Approach A (the ccr hack), sequenced LAST so there's no capability gap** — revert the NVIDIA/Ollama router lanes from #243/#244: the `_bkit_router_*` machinery, `--cloud=nvidia` / `--local=ollama` flags, the ollama/nvidia columns in `_bkit_agent_matrix`, ccr config/preflight, the `.bkit/.env` route-persistence block + ccr-log verification docs, and the `providers.md` § "Local / NVIDIA model swap" router content. Keep direct Anthropic. `claude-code-router` ceases to be a bkit dependency.
- [ ] **Tracker pairing** — opencode is MCP-capable for either GitHub or Linear; suggest **decoupling** tracker from host rather than inventing a third pairing.

## Do NOT start before

The spike passes (this issue's gate) — proof opencode can express bkit's subagent + gate + hook model. The recon comments + the spike together replace a full `/bkit-design`; go straight to `/bkit-plan` on a green spike.

Relates: #243, #244, #247 (Codex CLI / OpenAI-native host).

---

## Comments

### Comment 1 (cbartens)

https://opencode.ai/ support really more important than OpenAI

### Comment 2 (cbartens)

https://apps.apple.com/au/app/opencode-mobile-app/id6757406313

### Comment 3 (cbartens) — Feasibility spike — opencode as the Approach-B host

Pre-design recon against the gate this issue sets ("prove the chosen harness can express bkit's subagent + gate + hook model"). Target harness evaluated: **opencode** (sst/opencode). Sources: opencode docs — [agents](https://opencode.ai/docs/agents/), [plugins](https://opencode.ai/docs/plugins/), [commands](https://opencode.ai/docs/commands/), [config](https://opencode.ai/docs/config/), [rules](https://opencode.ai/docs/rules/).

**Verdict:** Feasible — no disqualifying gap found. opencode's primitive surface is near-isomorphic to Claude Code's, it speaks OpenAI-format / local models natively (no router, no model-identity lie), and on the single hardest primitive (GateGuard) it is **more** expressible than the existing Cursor host. **One** genuine open risk remains: parallel subagent fan-out concurrency — resolvable only by an empirical spike (below). Recommendation: run the spike before committing the milestone; if it passes, promote to `/bkit-design`.

**Primitive → opencode mapping:**

| bkit primitive                                          | opencode mechanism                                                                                                      | Status                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Subagents (`.claude/agents/*.md` + frontmatter)         | `.opencode/agents/*.md` — `mode: subagent`, `model`, `permission`, `temperature`, `hidden`, `description`               | ✅ near-isomorphic; new render target     |
| Per-agent `model:` + `effort:`                          | per-agent `model:` + provider pass-through (`reasoningEffort: high`)                                                    | ✅ effort → provider param (transform)    |
| Slash-commands / workflows                              | `.opencode/commands/*.md` — `agent`, `model`, `subtask`; `$ARGUMENTS`/`$1`; `` !`shell` `` injection                    | ✅ tool-name transform needed             |
| **GateGuard** (pre-edit deny + model-visible checklist) | plugin hook `tool.execute.before` — **can `throw` to block**; thrown error text returns to the model as the tool result | ✅ MORE faithful than Cursor              |
| MCP (GitHub / Linear)                                   | native `mcp` config, local + remote servers                                                                             | ✅                                        |
| Permissions (per-tool / bash globs)                     | `permission: { edit, bash, read, grep, task }` = allow/ask/deny + bash glob patterns                                    | ✅                                        |
| Rules                                                   | native `AGENTS.md`                                                                                                      | ✅ bkit already ships it                  |
| Hooks plumbing                                          | plugins are JS/TS in `.opencode/plugins/`, `(input, output)` async                                                      | ⚠️ port `gateguard.cjs` → opencode plugin |
| **Parallel subagent fan-out**                           | subagents invoked via the Task tool (`permission.task`); concurrency not fully documented                               | 🟡 one narrow unknown                     |

**The one blocking unknown — and the spike that settles it:**
bkit's orchestrators (design-brainstorm ×3, plan-review ×3, build-challenge ×2, plan-scope-check ×2) depend on **concurrent** subagent execution. opencode invokes subagents through a Task tool — but opencode's docs do not confirm the runtime executes them concurrently rather than serially.

**Spike (½–1 day, no bkit code):** author one opencode command whose body instructs the build agent to spawn 3 trivial subagents via Task and report wall-clock; confirm (a) they run in parallel, (b) results are collected deterministically, (c) per-subagent `model:` pinning is honored.

**Scope boundaries surfaced:**

- **Cloud lane N/A.** opencode is a local CLI with no managed cloud equivalent. The cloud auto-routing lane does **not** extend to opencode.
- **Tracker pairing (open AC).** No forced pairing — opencode is MCP-capable for either GitHub or Linear.
- **`bkit-mode.sh` shrinks.** For the opencode host, the router drops out entirely.

**Effort shape:** Comparable to the Cursor port — new render target in `bkit-modules.ts` + manifest + `.bkit/templates/.opencode/` + tests + a Claude→opencode transform path — **minus** the router shim, **plus** a JS GateGuard plugin port.

### Comment 4 (cbartens) — Correction — parallel fan-out risk downgraded (doc-confirmed)

The earlier "🔴 blocking unknown" on parallel fan-out is **downgraded to 🟡** — opencode documents parallel subagent execution as a first-class notion.

**The evidence:** opencode's built-in **general** subagent is described as having "full tool access… **Use this to run multiple units of work in parallel.**" Parallelism is supported in principle, not merely inferred.

**Also confirmed:** subagent shape is structurally 1:1 with bkit's `.claude/agents/*.md`:

```yaml
---
description: ...
mode: subagent
model: anthropic/claude-sonnet-4-20250514 # optional, per-agent pin
permission:
  edit: deny
  bash: { "*": ask }
---
```

**What the spike still has to prove (now narrower):**

1. Concurrency across **distinct specialized subagents** (3 different ideator/reviewer agents at once), not just N copies of `general`.
2. **Deterministic result collection** — the docs do **not** state how a subagent returns its result to the invoking agent.

Net: feasibility verdict unchanged (feasible, no disqualifying gap); the headline risk is smaller than first written. Spike scope shrinks to (1)+(2) above.
