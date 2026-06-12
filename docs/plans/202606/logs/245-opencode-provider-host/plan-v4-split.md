Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Master Index

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read the actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in the physical sub-plan documents.

> [!IMPORTANT]
> **This is a COMPLEXITY-SPLIT MASTER INDEX.** The original single-file plan exceeded the per-agent execution budget and was partitioned into 4 self-contained sub-plans by domain + dependency order. The Agent Execution Runbook, constraints, and 🔒 Gates now live in the sub-plans below. This master retains only context, goals, patterns, and the sub-plan index.
>
> **Execute the sub-plans IN ORDER** (`-1` → `-2` → `-3` → `-4`). Sub-plan -1 (the spike) is a HARD GATE: if its verdict is not green, the remaining sub-plans do NOT start.

## Context & Goals

bkit ships its 46 `bkit-*` agents + 5 phase workflows as a canonical `.claude/` surface (Claude Code), with a derived `.cursor/` render target. Models without a first-party agent CLI (NVIDIA NIM, Ollama, OpenRouter, Gemini, etc.) currently run only via **Approach A** (#243/#244): keep Claude Code as the harness and bridge non-Anthropic backends through `claude-code-router` (ccr). Approach A is a leaky stopgap — Claude Code injects its own model identity into every request, so a non-Claude model runs under Claude-tuned prompts and parrots "I'm Opus" (#244).

This plan adds **opencode** (sst/opencode) as bkit's third execution host — the **universal, provider-agnostic** render target for any model without a dedicated agent CLI. opencode talks NVIDIA/Ollama/OpenRouter/Gemini directly (no router, no model-identity lie), expresses bkit's subagent + command + permission + MCP + rules model near-1:1, and ports GateGuard MORE faithfully than Cursor (opencode's `tool.execute.before` plugin hook can block AND return model-visible text; Cursor has no pre-edit event). Once opencode runs these providers natively, **Approach A is removed** — A and B do not coexist.

This is milestone-sized: a new host needs a render target in the installer (`bkit-modules.ts`, manifest, templates, tests), a Claude→opencode transform path, a GateGuard plugin port, and a `bkit mode` redesign that selects a _host_ instead of an `ANTHROPIC_BASE_URL`. The work is gated on a **spike** proving opencode runs distinct specialised subagents concurrently with deterministic result collection.

**Success Criteria:**

- A green spike proves opencode executes 3 distinct specialised subagents concurrently against a real NVIDIA/Ollama model, with deterministic result collection and honoured per-subagent `model:` pins — or the milestone is parked and Approach A stays.
- `bkit install --opencode` renders all 46 agents + 5 workflows into `.opencode/` (agents/commands/permissions/plugin/config), and the 5 phase commands plus utilities execute end-to-end on opencode wired to a real non-Anthropic provider.
- `bkit mode` selects the active execution _host_ (claude | opencode) and, for opencode, the provider — with no `claude-code-router` involved.
- Approach A (the ccr router lanes, the ollama/nvidia matrix columns, `--cloud=nvidia`/`--local=ollama` flags, ccr preflight/config/log machinery, the `.bkit/.env` route block, and the `providers.md` § "Local / NVIDIA model swap" router content) is fully removed; `claude-code-router` is no longer a bkit dependency. Direct Anthropic stays.

**Related Issues:**

- `#245 — Multi-provider execution host via OpenCode NVIDIA Ollama etc (open)` — this plan.
- `#243 — local Ollama via router (Approach A)` — superseded here (router lanes removed).
- `#244 — NVIDIA NIM via router (Approach A)` — superseded here (router lanes removed).
- `#247 — Codex CLI / OpenAI-native host (open)` — sibling host; OpenAI's own models get a separate native lane there, NOT via opencode. Out of scope.
- `#246 — per-agent capability override config (open)` — generalises the convergent-reasoner override; out of scope here.
- `DE-26 (docs/decisions.md)` — establishes Approach A and the deferral of Approach B to #245; this plan supersedes its router half.

---

## Sub-Plan Index

> Execute in order. Each sub-plan is self-contained (carries its own context, constraints, Done-when criteria, and Gates). Bidirectional: each sub-plan links back here via `**Parent Plan:**`.

<!-- prettier-ignore -->
| Order | Sub-plan | Domain | Tasks / Gates | Hard dependency |
| --- | --- | --- | --- | --- |
| 1 | [plan-v4-1.md](./plan-v4-1.md) | **A — Spike (THE GATE)** | Task 0.1; 🔒 Gate 1.5 | none (must run first) |
| 2 | [plan-v4-2.md](./plan-v4-2.md) | **B — Transform path + Render module/manifest/CLI** | Tasks 1.1, 1.2, 1.3, 2.1, 2.2, 2.3 | Gate 1.5 green |
| 3 | [plan-v4-3.md](./plan-v4-3.md) | **C — GateGuard plugin port + `bkit mode` redesign** | Task 3.1; 🔒 Gate 2; Task 4.1 | plan-v4-2 (transforms + render output) |
| 4 | [plan-v4-4.md](./plan-v4-4.md) | **D — Testing & Docs + Manual E2E + Approach-A removal** | Testing/Docs mandatory tasks; 🔒 Gate 3; Tasks 5.1, 6.1, 6.2, 6.3; Verification Plan + 🔒 Gate 4 + Manual Verification | plan-v4-3 (mode redesign in place) |

> [!CAUTION]
> **🔒 Gate 1 (Prerequisites + Human Confirmations)** — the Acceptance Scenario, Breaking Changes, Pre-Flight, and Gate 1 checks — are reproduced in **plan-v4-1.md** (the first executed sub-plan) because they gate ALL downstream work. Do not start plan-v4-2/3/4 until plan-v4-1's Gate 1 and Gate 1.5 are both green.

## Acceptance Scenario (canonical contract — see plan-v4-1 for the full human-review section)

The full `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` human-review sections (with the Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix, and human-confirmation checkboxes) live in **[plan-v4-1.md](./plan-v4-1.md)** — they are the milestone-wide contract and gate every sub-plan. The Derived Test Matrix rows map to sub-plans as follows:

- `applyOpencodeAgent` / `applyOpencodeCommand` / model-lookup / parser-regression rows → **plan-v4-2**
- `runOpencodeModule` / manifest round-trip / CLI flag rows → **plan-v4-2**
- GateGuard plugin row → **plan-v4-3**
- `bkit-mode.sh` redesign row → **plan-v4-3**
- catalog/host parity row → **plan-v4-2** (+ docs in plan-v4-4)
- Approach-A removal / upgrade-migration / advisory-rewrite rows → **plan-v4-4**
- Spike verdict (manual) row → **plan-v4-1**
- End-to-end (manual) row → **plan-v4-4**

## Alternative Approaches & Recommendations

- **Approach A (ccr router) — REJECTED as the long-term path; REMOVED here.** Keeps Claude Code as harness, bridges OpenAI-format backends via `claude-code-router`. Leaky: Claude Code injects its own model identity, so a non-Claude model parrots "I'm Opus" (#244), and the model runs under Claude-tuned prompts. Was the zero-port stopgap (DE-26); this plan removes it once opencode runs the same providers natively.
- **Point `ANTHROPIC_BASE_URL` at an OpenAI `/v1` endpoint directly — REJECTED (DE-26).** Schema mismatch (Anthropic Messages vs OpenAI Chat Completions); the router was the only bridge. opencode sidesteps this entirely by speaking each provider's native API.
- **Codex CLI for OpenAI models — DEFERRED to #247.** OpenAI's own models (gpt/o/codex) get a separate native lane; opencode is the host for everything _without_ a first-party CLI. Do NOT route OpenAI models through opencode here.
- **`bkit-hosts/opencode.ts` module vs inline transform — OPEN (confirm in Breaking Changes).** Cursor's transform is inline (`applyT1/T2/T3` in `bkit-install.ts`). Recommendation: follow the Cursor precedent (inline `applyOpencode*`) unless the spike surfaces enough host-specific config to justify a `bkit-hosts/` directory — `providers.md` § "How to add a new host" already gestures at `bkit/hosts/<name>.ts`.
- **Future:** per-agent capability override config (#246) generalises the convergent-reasoner override across hosts; out of scope.

## Out of Scope

- OpenAI-native host via Codex CLI (#247).
- Per-agent capability override config (#246).
- A cloud/managed-CI lane for opencode — opencode is a local CLI with no managed cloud equivalent; the `--auto=` cloud-agent lane does NOT extend to opencode (issue § Scope boundaries).
- Renaming/altering the existing `--auto=claude|cursor` cloud-agent environment vocabulary (DE-26 keeps it).
- Any change to the Claude `gateguard.cjs` behaviour (the opencode plugin is parallel, not a refactor of the Claude one).
- Choosing/curating the opencode provider model IDs beyond seeding sane defaults verified during the spike (consumer tunes them, mirroring the Cursor model catalog churn caveat).

## Merge Method

**Merge method: always squash.** This plan decomposes into separate PRs by capability (spike → render target → transform → plugin → mode → Approach-A removal) so the LAST PR (removal) lands only after the opencode host is proven — preserving ordering via PR boundaries, not non-squash merges. The sub-plan boundaries here mirror those PR boundaries.

## Architecture & Component Changes (shared reference — see sub-plans for per-task detail)

> bkit repo topology: engine in `.bkit/src/*.ts` (compiled to `dist/`), shipped templates in `.bkit/templates/`, canonical agent/workflow sources in `.bkit/prompts/` + `.bkit/workflows/`, reference docs in `.bkit/*.md`. The opencode host mirrors the Cursor render path: a new module fn + manifest + transform + templates + tests. The per-file change detail is reproduced in the sub-plan that owns each task; this index lists only the touched-surface map:

- **plan-v4-2** owns: `.bkit/src/bkit-install.ts` (transforms + `parseModelLookup` generalisation), `.bkit/src/bkit-modules.ts` (`runOpencodeModule`), `.bkit/src/bkit-manifest.ts` (`OPENCODE_MANIFEST`), `.bkit/src/bkit-cli.ts` (`--opencode` flag), `.bkit/templates/.opencode/opencode.json` [NEW], `.bkit/prompts.md` (`opencode model` column).
- **plan-v4-3** owns: `.bkit/templates/.opencode/plugin/gateguard.js` [NEW], `.bkit/scripts/bkit-mode.sh` + template (host/provider redesign — additive, removal deferred to plan-v4-4).
- **plan-v4-4** owns: Approach-A removal in `.bkit/scripts/bkit-mode.sh` + template [DELETE rows], `.bkit/.env.example` + template, `mode-shim-not-sourced` advisory in `bkit-modules.ts`, `.bkit/providers.md`, `docs/decisions.md`, `docs/knowledge.md`, `docs/testing.md`, `AGENTS.md`/`.bkit/README.md`, and the manual E2E + dogfood verification.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` per PR | Each capability ships as its own squashed PR; the Approach-A removal PR (last, plan-v4-4) is independently revertible to restore the router lanes if opencode regresses post-merge. |
| **Risk window** | Between render-target merge (plan-v4-2/3) and Approach-A removal merge (plan-v4-4) | During this window BOTH paths exist (opencode + ccr) — intentional, so there is never a capability gap (issue mandate: removal sequenced LAST). |

_Code-only — `git revert` sufficient._
