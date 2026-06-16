# Build Input — 245-opencode-provider-host

## Session Prompt

Build feature for GitHub issue #245: Multi-provider execution host via OpenCode NVIDIA Ollama etc

## Issue Description

Follow-up to #243 / #244. The harness-level alternative to the router (Approach A).

## Scope (corrected — was mis-titled "OpenAI format")

opencode is bkit's **universal, provider-agnostic execution host** — the render target for any model **without a dedicated first-party agent CLI**: **NVIDIA NIM, Ollama (local), OpenRouter, Gemini, and any other**. It is NOT an "OpenAI-format" host; that framing was wrong. OpenAI's own models get a _separate_ native lane via Codex CLI (#247).

### Host taxonomy

<!-- prettier-ignore -->
| Models | Native host | Status |
| --- | --- | --- |
| Anthropic (Claude) | Claude Code CLI | shipped (canonical) |
| Multi-model IDE | Cursor | shipped (derived) |
| OpenAI (gpt / o / codex) | Codex CLI | #247 (later) |
| **NVIDIA / Ollama / OpenRouter / Gemini / any other** | **opencode** | **THIS issue** |

## Approach A is a STOPGAP — it gets removed here, not kept

#243/#244 shipped Approach A: keep Claude Code as the harness and bridge NVIDIA/Ollama through `claude-code-router` (ccr). It was the zero-port stopgap, but it is a leaky abstraction. **Once opencode runs NVIDIA/Ollama natively, the router hack is removed.**

## Acceptance / scope

- [ ] **Spike (the gate)** — confirm concurrent _distinct_ subagents + deterministic result collection on opencode wired to a real NVIDIA/Ollama model.
- [ ] New **opencode render target** in the installer (`bkit-modules.ts`) + manifest + `.bkit/templates/.opencode/` + tests
- [ ] **Claude→opencode transform** — tool names, `effort:` → provider `reasoningEffort`, permission shape, frontmatter (`mode: subagent`)
- [ ] **Port `gateguard.cjs` → opencode JS plugin** (`tool.execute.before`)
- [ ] **`bkit mode` redesign** — select _host_, not `ANTHROPIC_BASE_URL`.
- [ ] **Remove Approach A (the ccr hack), sequenced LAST**
- [ ] **Tracker pairing** — decouple tracker from host

## Plan Revision (from comments)

**Hosts are ADDITIVE, not either/or.** `.claude/` + `.cursor/` render as today (always-on); `bkit install --opencode=<provider>` _adds_ the opencode host alongside them.

**`bkit mode` is REMOVED entirely** (not redesigned).

**New plan-5 — unified `bkit-cloud.yml` cloud lane:** renamed from `bkit-auto.yml`, carrying BOTH a `claude` job and an `opencode` job.

**Sub-plan map (5 sub-plans):**

1. Spike — the gate
2. Transform + render module/manifest/CLI
3. GateGuard plugin + additive install-flag host config + `bkit doctor`/`bkit status`
4. Tests + docs + Approach-A removal + `bkit mode` removal
5. Unified `bkit-cloud.yml` (claude + opencode jobs)
