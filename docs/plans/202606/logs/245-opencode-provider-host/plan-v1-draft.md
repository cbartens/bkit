<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

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

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV. Describes what the user does and what they get back.
- **Success Criteria:** ≤5 bullets, each measurable / testable. Outcomes, NOT implementation steps.
- **Key Edge Cases:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions.
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + plan-level cases.
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook.

**Design-missing fallback:** No `{FID}-design.md` exists — by issue mandate ("the recon comments + the spike together replace a full `/bkit-design`"). The Narrative and Success Criteria below are authored from the issue body (the pre-design artifact) and require human confirmation before Gate 1 passes.

### Narrative _(authored from issue #245 — design-missing fallback; human must confirm)_

A bkit consumer who wants to run the full bkit workflow on a non-Anthropic model (NVIDIA NIM, Ollama, OpenRouter, Gemini, etc.) runs `bkit install --opencode`, points `bkit mode` at the opencode host and their provider, and gets the same 5 phase workflows + 46 subagents + GateGuard + tracker integration they get on Claude Code — running natively on their chosen model, with no `claude-code-router` and no Claude model-identity leakage.

### Success Criteria _(authored from issue #245 — design-missing fallback; human must confirm)_

- **Spike gate:** On opencode wired to a real NVIDIA or Ollama model, one command spawns 3 _distinct specialised_ subagents via the Task tool; all 3 run concurrently (wall-clock < serial sum), each result is collected deterministically by the orchestrator, and each subagent's per-agent `model:` pin is honoured. (Pass → proceed; serial-only fail → park.)
- **Render target:** `bkit install --opencode` writes `.opencode/agent/*.md` (46), `.opencode/command/*.md` (workflows), `.opencode/opencode.json` (permissions + mcp + provider config), and `.opencode/plugin/gateguard.js`; `bkit check --opencode` reports zero drift on a clean install; `bkit uninstall --opencode` leaves zero `.opencode/` footprint.
- **End-to-end:** The 5 phase commands + the worktree utilities execute end-to-end on opencode against a real non-Anthropic provider (manual verification recipe).
- **Mode redesign:** `bkit mode` selects host (claude | opencode) — for opencode it selects provider directly, exports no `ANTHROPIC_BASE_URL`, and never starts ccr.
- **Approach A removed:** ccr machinery, ollama/nvidia matrix columns, `--cloud=nvidia`/`--local=ollama` flags, `.bkit/.env` route block, and router doc content are gone; `grep -ri 'claude-code-router\|ccr ' .bkit/ docs/` returns only historical decision-log references; direct Anthropic still works.

### Concrete Example _(plan expands)_

**Setup:** A consumer has bkit installed (`--full`), an Ollama server running locally with the bkit-default models pulled, and `.opencode/` not yet present.

**Steps:**

1. User runs `bkit install --opencode` → installer renders 46 agents, the workflow commands, `opencode.json`, and the GateGuard plugin into `.opencode/`; prints a setup advisory.
2. User runs `bkit mode --opencode=ollama` → mode selects the opencode host + ollama provider, sets per-agent `model:` pins from the opencode model map, writes no `ANTHROPIC_BASE_URL`, starts no ccr.
3. User launches opencode and runs `/bkit-plan #<issue>` → the plan workflow runs; the parallel review triplet (`bkit-plan-review-1/-2/-3`) dispatches as 3 concurrent Task subagents; orchestrator collects all 3 verdicts.
4. User edits a `tsconfig.json` → the `.opencode/plugin/gateguard.js` `tool.execute.before` hook injects the "fix the code, don't weaken the gate" advisory into the model's context (advisory mode) or blocks it (deny mode).

**Outcome:** The plan workflow completes on the local Ollama model with full subagent fan-out, gate advisories, and tracker writes — identical observable behaviour to the Claude Code host, with no router and no "I'm Opus" identity leak.

### Edge Cases _(plan expands from issue Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Spike shows serial-only subagent execution | Milestone parked; Approach A retained; issue updated. Implementation tasks below do NOT start. |
| Spike shows concurrency but non-deterministic result collection | Park or narrow scope per human decision at Gate 1.5; do NOT proceed to full render target on a non-deterministic collection model. |
| `bkit install` run with no `--opencode` flag | Zero `.opencode/` footprint — opencode is an explicit render target, never auto-installed in `--full` (mirror Cursor's always-on? — see Breaking Changes; default decision required). |
| opencode tool names differ from Claude (`Agent`/`Skill`/`Bash`/`Edit`) | Transform maps Claude tool/invocation spelling → opencode's Task-tool spelling, mirroring the Cursor T2 transform; unmapped names fail loud at install. |
| Per-agent `effort:` present (Claude thinking budget) | Transformed to opencode provider pass-through (`reasoningEffort`) where the provider supports it; dropped with a documented note where it does not. |
| GateGuard subagent-exempt contract on opencode | Plugin must detect the subagent boundary (opencode's session/agent identity) and skip, matching the Claude `agent_id` exemption — else every subagent edit nags. |
| `bkit mode` switches host while the other host's pins are stale | Mode operates on the active host's render dir only; switching host does not silently leave the other host mis-pinned (status reports per-host). |
| ccr still installed globally after Approach A removal | bkit no longer references/starts it; removal is of bkit's wiring, not the user's global binary — uninstall does not touch global npm. |
| opencode plugin throws on malformed stdin | Plugin fails OPEN (never blocks the session on its own error), matching `gateguard.cjs` fail-open contract. |
| Tracker pairing on opencode | opencode is MCP-capable for github OR linear; tracker stays decoupled from host (no third forced pairing) — `--tracker=` drives `opencode.json` mcp block. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. bkit repo: tests are Vitest under `.bkit/src/*.test.ts` (+ `*.integration.test.ts`); no Playwright, no DB. The spike is a manual/empirical gate (no bkit code), recorded as a runbook task with a written verdict artifact, not a Vitest row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `applyOpencodeAgent` (T-equivalent for agents) emits opencode frontmatter (`mode: subagent`, `model`, `permission`), maps `effort`→`reasoningEffort`, drops Claude-only fields; fails loud on missing model lookup | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` |
| `applyOpencodeCommand` strips Claude frontmatter + rewrites subagent/skill invocation spelling to opencode Task spelling | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` |
| opencode model lookup parses the new `opencode model` column from `prompts.md` § Models; all 46 agents present, no missing names | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` |
| `runOpencodeModule` writes the full `.opencode/` set (agents, commands, opencode.json, plugin); dry-run vs install writesets identical | Integration (Vitest) | `.bkit/src/bkit-modules.integration.test.ts` + `bkit-dry-run-parity.integration.test.ts` |
| opencode GateGuard plugin: advisory injects context on first edit; deny mode blocks first touch; subagent-exempt; gate-config path advisory; fail-open on bad input | Unit (Vitest) | `.bkit/src/bkit-gateguard-opencode.test.ts` (new) |
| Manifest `OPENCODE_MANIFEST` round-trips: install → check (zero drift) → uninstall (zero footprint) | Integration (Vitest) | `.bkit/src/bkit-uninstall.surgical.integration.test.ts` + `bkit-modules.upgrade.integration.test.ts` |
| CLI parses `--opencode` module flag + `bkit mode --opencode=<provider>`; help text updated | Unit (Vitest) | `.bkit/src/bkit-cli.test.ts` |
| catalog/host parity: every agent has an `opencode model` mapping; `providers.md` host table lists opencode | Unit (Vitest) | `.bkit/src/bkit-catalog-parity.test.ts` |
| Approach-A removal: no `claude-code-router`/`ccr` wiring remains in `.bkit/` engine/scripts/docs (except decision-log history); ollama/nvidia matrix columns + router flags gone | Unit (Vitest) | `.bkit/src/bkit-mode.test.ts` (new) + a repo-grep guard test |
| Spike verdict: 3 distinct subagents concurrent + deterministic collection + model pins honoured on a real provider | Manual (empirical gate) | `docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

> [!WARNING]
> **BREAKING — Approach A removal (`bkit mode` grammar).** `bkit mode --cloud=nvidia` and `bkit mode --local=ollama` are REMOVED. Consumers using the router lanes must re-install with `--opencode` and switch to `bkit mode --opencode=<provider>`. `bkit mode --cloud=claude` / `--reset` (direct Anthropic) is preserved (likely renamed `--claude`; see grammar below). `claude-code-router` ceases to be referenced by bkit.

> [!WARNING]
> **BREAKING — `.bkit/.env` route block.** The `# bkit-mode:route` managed block (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN=bkit-router`) is no longer written and is stripped on the next `bkit mode` run. `NVIDIA_API_KEY` stays in `.env.example` (opencode reads it directly), but the router-specific persistence is gone.

> [!IMPORTANT]
> **NEW NAMES — proposed (confirm):**
>
> - **CLI module flag:** `--opencode` (parallels `--claude` / `--cursor`). Renders `.opencode/`.
> - **`bkit mode` grammar redesign:** mode selects a _host_, then (for opencode) a provider. Proposed: `bkit mode --claude` (direct Anthropic, default), `bkit mode --opencode=<provider>` (`ollama` | `nvidia` | `openrouter` | `gemini` | …), plus `--status` / `--reset` / `--doctor` / `--list=<provider>`. The old `--cloud=`/`--local=` axis is retired. **Confirm the exact flag grammar.**
> - **Render dir + filenames:** `.opencode/agent/*.md` (singular `agent`, per opencode docs), `.opencode/command/*.md`, `.opencode/opencode.json`, `.opencode/plugin/gateguard.js`. **Confirm opencode's actual dir names** (`agent` vs `agents`, `command` vs `commands`) against current opencode docs during the spike — these drive the manifest paths.
> - **Module/manifest identifier:** `opencode` (new `ModuleName` / `ModuleFlag` value); `OPENCODE_MANIFEST`; `runOpencodeModule`.
> - **prompts.md column:** new `opencode model` column in § Models (one model ID per agent, provider-prefixed e.g. `ollama/qwen3.6:27b`). **Confirm whether opencode model IDs are provider-prefixed** (`provider/model`) per opencode config.
> - **Plugin extension:** `.js` (opencode plugins are JS/TS, not `.cjs`). The Claude `gateguard.cjs` stays; the opencode plugin is a parallel implementation, not a rename.
> - **New doc:** `.bkit/providers.md` host-difference matrix gains an opencode row; `bkit-hosts/opencode.ts` (if a hosts dir is introduced) OR inline transform in `bkit-install.ts` (mirror Cursor's inline `applyT*`). **Confirm: inline transform (like Cursor) vs new `bkit-hosts/` module.**

> [!IMPORTANT]
> **DEFAULT-INSTALL DECISION (confirm):** Is opencode part of `--full` (always rendered, like `.claude`/`.cursor`) or opt-in (explicit `--opencode`, like cloud/renovate)? Recommendation: **opt-in** (a consumer not using opencode should not carry a `.opencode/` tree), but Cursor is always-on — confirm which precedent applies.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

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

**Merge method: always squash.** This plan decomposes into separate PRs by capability (spike → render target → transform → plugin → mode → Approach-A removal) so the LAST PR (removal) lands only after the opencode host is proven — preserving ordering via PR boundaries, not non-squash merges.

## Supersession Inventory

> Approach A is removed, not deprecated. Each DELETE row is mirrored in `Architecture & Component Changes` and as a removal task in the runbook (Phase 6, sequenced LAST).

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `_bkit_registry` rows `cloud/nvidia`, `local/ollama` (`.bkit/scripts/bkit-mode.sh` + template) | opencode host + provider selection in redesigned `bkit mode` | DELETE | Router lanes gone; opencode talks providers directly. |
| `_bkit_agent_matrix` `ollama` + `nvidia` columns (`.bkit/scripts/bkit-mode.sh` + template) | opencode model map (prompts.md `opencode model` column → opencode render) | DELETE | Per-host model pins move to the render target; router matrix obsolete. |
| `_bkit_router_*` machinery (`_bkit_router_bin`/`_config`/`_url`/`_ensure`/`_stop`) | none — opencode needs no router | DELETE | ccr no longer a bkit dependency. |
| `_bkit_env_route` + `.bkit/.env` `# bkit-mode:route` managed block | none | DELETE | Router env persistence obsolete. |
| `bkit mode --cloud=nvidia` / `--local=ollama` flag handling (`bkit()` shim) | `bkit mode --opencode=<provider>` | DELETE | Mode now selects host, not `ANTHROPIC_BASE_URL`. |
| ccr preflight branches in `_bkit_preflight` (router-missing / ollama-server / nvidia-key router framing) | opencode-host preflight (opencode binary present, provider creds, provider catalog) | DELETE | Preflight reframed around opencode, not ccr. |
| `.bkit/providers.md` § "Local / NVIDIA model swap" router content (incl. ccr log-verification subsection) | rewritten `bkit mode` + new opencode host rows | DELETE | Router narrative replaced by opencode host narrative. |
| ccr-related `.bkit/.env.example` route note (if any) + the `mode-shim-not-sourced` advisory's ccr/ollama/nvidia framing | opencode-framed advisory | DELETE | Advisory text references the removed router. |
| DE-26 router half (`docs/decisions.md`) | new decision entry (opencode host = Approach B shipped) | RETAIN-WITH-REASON | Decision log is append-only history; superseded-by note added, original kept as record (staged: superseding entry links it). |

> [!CAUTION]
> **Default = `DELETE`.** The one `RETAIN-WITH-REASON` is the append-only decision-log entry (history, not live code) — a new superseding entry references it; the router code/flags/docs it described are all DELETED.

## Security & Privacy

> bkit repo (a CLI/installer), not the gether-life app. The app-specific rows (RLS, family-scoped DB, Zod validators, redirects, webhooks, CDC) do NOT apply.

- [ ] **New secret/env var** — opencode reads provider creds (`NVIDIA_API_KEY`, etc.) from `.bkit/.env` via direnv (same surface as today). No new bkit-managed secret store; `.bkit/.env.example` documents provider keys. The opencode plugin writes only to OS temp (mirror `gateguard.cjs` — never into the consumer repo).
- [ ] **Generated config** — `opencode.json` must NOT embed plaintext provider keys; it references env vars (`${NVIDIA_API_KEY}`) the same way `.mcp.json` references `${GH_TOKEN}`. Verify no key material is written to disk.

_All other rows: None — no new routes, DB writes, app secrets, or user input._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new bkit runtime dependency (opencode is a consumer-installed CLI, NOT a bkit dep). Confirm `claude-code-router` was never a `package.json` dependency (it is a consumer-global `npm i -g`); Approach-A removal is wiring/docs only. Ensure `pnpm-lock.yaml` syncs cleanly after any test-only devDep additions.
- [ ] **Dependency Versions:** Spot-check `node --version`, `pnpm --version`, `npx tsc --version`. Pin the opencode CLI version used in the spike + manual verification recipe (opencode is pre-1.0; its agent/command/plugin spec churns — record the exact version probed).
- [ ] **User Context:** Verify read/write access to `.bkit/src/`, `.bkit/templates/`, `.bkit/*.md`, `docs/`. Confirm a real provider is reachable for the spike (Ollama server up + models pulled, OR a valid `NVIDIA_API_KEY`).
- [ ] **Pending Blockers:** Query Linear/GitHub for open `blocker` issues touching the installer or mode shim.
- [ ] **Project Context:** Re-read `docs/decisions.md` DE-26 (Approach A), `.bkit/providers.md` (host-diff contract), `docs/knowledge.md` (installer gotchas), `.bkit/prompts.md` § Models (effort→model mapping).
- [ ] **Testing & Quality:** Align with `docs/testing.md` — Vitest only in the bkit repo; dry-run/install parity is a hard invariant (`bkit-dry-run-parity.integration.test.ts`); validate shipped config with the real tool, not string-presence (per MEMORY: install AND upgrade live, validate via real resolver).
- [ ] **Prerequisite Plans:** None — but the **spike (Phase 0) gates everything**: Phases 1–6 do NOT start until the spike verdict is recorded green.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** _(provider creds)_: opencode provider keys live in `.bkit/.env` (direnv). No GCP/Vercel secret store involved (bkit repo).
- [ ] **Architecture & UI** _(new installer files/render target)_: Validate against `.bkit/providers.md` § "How to add a new host" (the 6-step host-addition checklist) and the Cursor render path as the structural precedent.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — bkit is a CLI/installer with no database. No `docs/data-schema.md` tables read or written.

### Data Schema Changes

None.

## Architecture & Component Changes

> bkit repo topology: engine in `.bkit/src/*.ts` (compiled to `dist/`), shipped templates in `.bkit/templates/`, canonical agent/workflow sources in `.bkit/prompts/` + `.bkit/workflows/`, reference docs in `.bkit/*.md`. The opencode host mirrors the Cursor render path: a new module fn + manifest + transform + templates + tests. All `[MODIFY]` paths verified to exist in this session.

### Installer engine (`.bkit/src/`)

#### [MODIFY] `.bkit/src/bkit-install.ts`

- **Existence Check:** Exists (holds `applyT1/T2/T3`, `parseModelLookup`, `Host` type).
- Add `applyOpencodeAgent(content, opencodeModelLookup)` (frontmatter → opencode: `mode: subagent`, `model`, `permission`, map `effort`→`reasoningEffort`, drop Claude-only fields; fail loud on missing lookup) and `applyOpencodeCommand(content)` (strip frontmatter + rewrite invocation spelling), mirroring `applyT3`/`applyT1+T2`.
- Extend `Host` type to `"claude" | "cursor" | "opencode"`. Generalise `parseModelLookup` to take a column header (or add `parseOpencodeModelLookup`) reading the new `opencode model` column from `prompts.md` § Models.

#### [MODIFY] `.bkit/src/bkit-modules.ts`

- **Existence Check:** Exists (holds `runClaudeModule`, `runCursorModule`, `MODULE_REGISTRY`, `MODULE_DISPATCH_ORDER`).
- Add `runOpencodeModule(ctx)`: render `.opencode/agent/*.md` (via `applyOpencodeAgent`), `.opencode/command/*.md` (via `applyOpencodeCommand` + tracker substitution), seed `.opencode/opencode.json` (permissions + mcp filtered by `issueTracker` + provider/model config), drop `.opencode/plugin/gateguard.js`. Register in `MODULE_REGISTRY` + `MODULE_DISPATCH_ORDER`. Add an opencode model lookup into `ModuleContext` (extend `modelLookup` to a per-host map, or add `opencodeModelLookup`).

#### [MODIFY] `.bkit/src/bkit-manifest.ts`

- **Existence Check:** Exists (holds `ModuleName`, per-module manifests).
- Add `"opencode"` to `ModuleName`; add `OPENCODE_MANIFEST` (agent/command mirrors dynamic like claude/cursor; `.opencode/opencode.json` json/seed-or-print; `.opencode/plugin/gateguard.js` byte-equal-text); register in `MODULE_MANIFESTS`.

#### [MODIFY] `.bkit/src/bkit-cli.ts`

- **Existence Check:** Exists (`ModuleFlag`, `MODULE_FLAGS`, `ALL_MODULES`/`OPTIN_MODULES`, `printUsage`).
- Add `"opencode"` to `ModuleFlag` + `MODULE_FLAGS`. Decide `ALL_MODULES` (always-on, like cursor) vs `OPTIN_MODULES` per the default-install decision. Update `printUsage` with `--opencode` + the redesigned `bkit mode` grammar.

### Render-target templates (`.bkit/templates/.opencode/`)

#### [NEW] `.bkit/templates/.opencode/opencode.json`

- opencode config template: `permission` block (edit/bash/read/grep/task = allow/ask/deny + bash globs), `mcp` block (tracker-filtered, mirrors `.mcp.json`), provider/model config referencing env-var creds (no plaintext keys), plugin registration. Tracker-filtered like `seedMcpJson`.

#### [NEW] `.bkit/templates/.opencode/plugin/gateguard.js`

- opencode GateGuard plugin: `tool.execute.before` hook. Advisory mode injects the investigation checklist / gate-config advisory as model-visible text; deny mode `throw`s to block (thrown text returns to the model). Subagent-exempt (detect opencode's subagent/session identity). Fail-open. Dedup per (session, file) in OS temp with 24h TTL. Functional mirror of `.bkit/templates/.claude/hooks/gateguard.cjs` — NOT a rename.

### Canonical sources & reference docs (`.bkit/`)

#### [MODIFY] `.bkit/prompts.md`

- **Existence Check:** Exists. Add an `opencode model` column to § Models (one model ID per agent; tier-mirrored like the removed matrix, provider-prefixed). Document `effort`→`reasoningEffort` mapping in § Frontmatter Conventions.

#### [MODIFY] `.bkit/providers.md`

- **Existence Check:** Exists. Add opencode rows to § Supported hosts, § Subagent invocation, § Frontmatter, § Hooks (GateGuard MORE faithful — `tool.execute.before`), § Permissions, § MCP, § Models, § Tool name parity. DELETE § "Local / NVIDIA model swap" router content; replace with the redesigned `bkit mode` host/provider narrative.

#### [MODIFY] `.bkit/scripts/bkit-mode.sh` + `.bkit/templates/.bkit/scripts/bkit-mode.sh`

- **Existence Check:** Both exist. Redesign: mode selects host (claude | opencode) then provider; for opencode set per-agent `model:` in `.opencode/agent/*.md` from the opencode map, no `ANTHROPIC_BASE_URL`, no ccr. **DELETE** `_bkit_registry` router rows, `_bkit_agent_matrix` ollama/nvidia columns, all `_bkit_router_*`, `_bkit_env_route`, the `--cloud=`/`--local=` flag handling, and ccr preflight branches. Keep direct Anthropic (`--claude`/`--reset`).

### Approach-A removal (Phase 6 — sequenced LAST)

#### [DELETE] router machinery in `.bkit/scripts/bkit-mode.sh` (+ template mirror)

- Remove `_bkit_router_bin/_config/_url/_ensure/_stop`, `_bkit_env_route`, the `cloud/nvidia` + `local/ollama` registry rows, the `ollama`/`nvidia` matrix columns, `_bkit_target_model` ollama/nvidia branches, and ccr preflight. Reason: opencode runs providers natively; ccr is no longer a bkit dependency.

#### [MODIFY] `.bkit/.env.example` (+ template)

- Remove any ccr route note; keep `NVIDIA_API_KEY` (opencode reads it). Update the `mode-shim-not-sourced` advisory text in `bkit-modules.ts` to drop ccr/ollama/nvidia router framing.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | New decision: opencode host (Approach B) shipped; Approach A removed. Add superseded-by note to DE-26. |
| `docs/knowledge.md` | opencode spec-churn gotcha (pin probed version), dry-run parity for the new module, GateGuard subagent-exemption mechanism difference. |
| `.bkit/providers.md` | Add opencode host rows across all matrices; DELETE router swap section; rewrite `bkit mode` narrative. |
| `.bkit/prompts.md` | New `opencode model` column + `effort`→`reasoningEffort` note. |
| `.bkit/README.md` / `AGENTS.md` | Add opencode to the host/command-path routing table (`.opencode/command/`). |
| `docs/testing.md` | New opencode test files + the manual spike/e2e verification recipe. |

_Remove rows with no change. Add rows for any other affected docs._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` per PR | Each capability ships as its own squashed PR; the Approach-A removal PR (last) is independently revertible to restore the router lanes if opencode regresses post-merge. |
| **Risk window** | Between render-target merge and Approach-A removal merge | During this window BOTH paths exist (opencode + ccr) — intentional, so there is never a capability gap (issue mandate: removal sequenced LAST). |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 0 — Spike (THE GATE; no bkit code)

- [ ] **Task 0.1:** Pin the opencode CLI version; author one opencode command whose body dispatches 3 _distinct specialised_ subagents (3 different trivial agent files, not 3 copies of `general`) via the Task tool, each with a distinct `model:` pin, wired to a real NVIDIA or Ollama model. Capture wall-clock, per-subagent collected results, and which model served each.
  - **Done when:** `docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md` exists recording: (a) the 3 ran concurrently (observed wall-clock < sum of individual durations), (b) each result was collected deterministically by the orchestrator, (c) each per-agent `model:` pin was honoured — with the opencode version, provider, and raw timing/log evidence. **Boundary test (no mock):** the spike runs against a live opencode CLI + live provider endpoint; ground-truth signal = the provider's own response/log identity per subagent (not a Claude-injected identity) and measured concurrency.

### 🔒 Gate 1.5: Spike Verdict (HARD GATE — milestone proceed/park)

**CRITICAL:** 🛑 If the spike verdict is NOT green (serial-only, or non-deterministic collection), STOP. Park the milestone, retain Approach A, update issue #245. Phases 1–6 do NOT start. If green, proceed.

- [ ] **Gate 1.5 - Verified:** `spike-verdict.md` records a green result (concurrent distinct subagents + deterministic collection + honoured model pins). Human acknowledged proceed.

### Phase 1 — Transform path (pure functions; no external boundary)

- [ ] **Task 1.1:** Implement `applyOpencodeCommand` (strip frontmatter + rewrite subagent/skill invocation spelling to opencode Task spelling) in `bkit-install.ts`.
  - **Done when:** `applyOpencodeCommand` exported; unit tests in `bkit-install.test.ts` assert frontmatter stripped + invocation phrasing rewritten + `@name`→opencode form only on `**Subagent:**` lines; `pnpm test` green for that suite.
- [ ] **Task 1.2:** Implement `applyOpencodeAgent` (frontmatter → `mode: subagent` + `model` + `permission`; `effort`→`reasoningEffort`; drop Claude-only fields; fail loud on missing model lookup) + the opencode model lookup parser for the `opencode model` column.
  - **Done when:** both exported; unit tests assert the emitted frontmatter shape, the `effort`→`reasoningEffort` mapping, the fail-loud `process.exit(1)` on missing lookup, and that the parser returns all 46 agent names with no missing entries; `pnpm test` green.
- [ ] **Task 1.3:** Add the `opencode model` column to `prompts.md` § Models (tier-mirrored defaults, provider-prefixed) + document `effort`→`reasoningEffort` in § Frontmatter Conventions.
  - **Done when:** `bkit-catalog-parity.test.ts` (extended) asserts every agent has an `opencode model` entry; `parseOpencodeModelLookup('.bkit/prompts.md')` returns 46 names.

### Phase 2 — Render module + manifest + CLI

- [ ] **Task 2.1:** Author `.bkit/templates/.opencode/opencode.json` (permission + tracker-filtered mcp + provider/model config via env vars, no plaintext keys) and register `opencode` in `ModuleName` + `OPENCODE_MANIFEST` (`bkit-manifest.ts`).
  - **Done when:** `OPENCODE_MANIFEST` lists agent/command mirrors + `.opencode/opencode.json` (json, seedOrPrint) + `.opencode/plugin/gateguard.js` (byte-equal-text); `bkit-manifest.test.ts` round-trips it; `opencode.json` contains no plaintext key material.
- [ ] **Task 2.2:** Implement `runOpencodeModule` in `bkit-modules.ts`; register in `MODULE_REGISTRY` + `MODULE_DISPATCH_ORDER`; thread the opencode model lookup through `ModuleContext`.
  - **Done when:** `bkit-modules.integration.test.ts` asserts a clean install writes `.opencode/agent/*.md` (46), `.opencode/command/*.md`, `.opencode/opencode.json`, `.opencode/plugin/gateguard.js`; `bkit-dry-run-parity.integration.test.ts` shows identical dry-run vs install writesets for `--opencode`.
- [ ] **Task 2.3:** Add `--opencode` to `ModuleFlag`/`MODULE_FLAGS` + `ALL_MODULES` or `OPTIN_MODULES` (per confirmed default-install decision); update `printUsage`.
  - **Done when:** `bkit-cli.test.ts` asserts `parseArgs(["install","--opencode"])` resolves the opencode module (+ core); help text lists `--opencode`; unknown-flag path unaffected.

### Phase 3 — GateGuard plugin port (external boundary: opencode plugin runtime)

- [ ] **Task 3.1:** Author `.bkit/templates/.opencode/plugin/gateguard.js` — `tool.execute.before` hook; advisory injects model-visible checklist/gate-config advisory; deny mode `throw`s; subagent-exempt; fail-open; per-(session,file) dedup in OS temp w/ 24h TTL.
  - **Done when:** `bkit-gateguard-opencode.test.ts` covers: advisory injects context on first edit, deny blocks first touch then allows retry, subagent payload exempt, gate-config path → config advisory, malformed stdin → fail-open (no throw). **Boundary test (no mock):** a smoke step loads the plugin in a real opencode session and observes (a) the advisory text appears in model context on a first edit and (b) deny mode actually blocks the edit — ground-truth signal = opencode's own tool-result surface, recorded in the verification log.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Phases 1–3 tasks independently verified against their `Done when:` lines.

> [!IMPORTANT]
> **Testing Strategy (bkit repo — see `docs/testing.md`):** Vitest only; no Playwright, no DB. Hard invariants: dry-run/install parity, manifest install→check→uninstall round-trip, catalog/host parity. Validate shipped config (`opencode.json`, the plugin) with the **real tool**, not string-presence (per MEMORY: validate via the actual resolver; verify install AND upgrade live).

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row has a corresponding checked-off task. The spike row maps to `spike-verdict.md`; the manual e2e maps to Manual Verification.
- [ ] **Add manifest round-trip + upgrade coverage:** Extend `bkit-uninstall.surgical.integration.test.ts` + `bkit-modules.upgrade.integration.test.ts` for `--opencode` (install → check zero drift → uninstall zero footprint → upgrade preserves seed-or-print `opencode.json`).
  - **Done when:** both integration tests pass for the opencode module; uninstall leaves no `.opencode/` path on disk.
- [ ] **Update documentation:** Rewrite `.bkit/providers.md` (opencode rows + DELETE router section), `.bkit/prompts.md` (column), `AGENTS.md`/`.bkit/README.md` (routing), `docs/decisions.md` (new entry + DE-26 superseded note), `docs/knowledge.md`, `docs/testing.md`. Rewrite prose; no lazy appends.
  - **Done when:** `.agents/docs.md` still accurate; `bkit check` clean; no router content remains in `providers.md` outside historical decision refs.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every `📚 Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

### Phase 4 — `bkit mode` host/provider redesign

- [ ] **Task 4.1:** Redesign `bkit-mode.sh` (+ template) so `bkit mode` selects host (claude | opencode) then provider; for opencode set per-agent `model:` in `.opencode/agent/*.md` from the opencode map; `--status`/`--doctor`/`--list`/`--reset` reframed around opencode; no `ANTHROPIC_BASE_URL`, no ccr for opencode.
  - **Done when:** `bkit-mode.test.ts` (new) asserts the redesigned flag grammar parses (`--claude`, `--opencode=<provider>`, `--status`, `--reset`), that opencode mode rewrites `.opencode/agent/*.md` headers (not `.bkit/.env` route block), and that no `ANTHROPIC_BASE_URL` is exported in opencode mode. **Boundary test (no mock):** a doctor run against a live opencode + provider reports the real provider catalog/creds (ground-truth = provider `/models` response), not a router status line.

### Phase 5 — Manual end-to-end on a real provider

- [ ] **Task 5.1:** Install `--opencode`, `bkit mode --opencode=<provider>` (real Ollama or NVIDIA), run the 5 phase commands + worktree utilities end-to-end in opencode.
  - **Done when:** the manual verification recipe (Verification Plan § Manual) is executed and recorded: the 5 phase workflows + utilities complete; parallel fan-out dispatches concurrent Task subagents; GateGuard advisory fires; tracker writes land. **Boundary test (no mock):** runs against live opencode + live provider; ground-truth = the provider serving each subagent (no Claude identity leak) + observed concurrency.

### Phase 6 — Approach A removal (SEQUENCED LAST; its own PR)

- [ ] **Task 6.1:** Remove all router machinery from `bkit-mode.sh` + template: `_bkit_router_*`, `_bkit_env_route`, `cloud/nvidia`+`local/ollama` registry rows, `ollama`/`nvidia` matrix columns, `_bkit_target_model` ollama/nvidia branches, ccr preflight branches, `--cloud=`/`--local=` flag handling.
  - **Done when:** `bkit-mode.test.ts` asserts none of the removed identifiers/flags remain; a repo-grep guard test asserts `claude-code-router`/`ccr ` appears in `.bkit/` + `docs/` ONLY in the appended decision-log history; `bkit check` clean.
- [ ] **Task 6.2:** Strip ccr framing from advisories + docs: update the `mode-shim-not-sourced` advisory in `bkit-modules.ts`, remove the `providers.md` § "Local / NVIDIA model swap" router/ccr-log content, clean `.bkit/.env.example` route note. Add the DE-26 superseded-by decision entry.
  - **Done when:** `grep -ri 'claude-code-router\|ANTHROPIC_AUTH_TOKEN=bkit-router\|_bkit_router' .bkit/ docs/` returns only the historical decision-log lines; the new decision entry links DE-26; direct Anthropic mode (`bkit mode --claude`) still resolves the Anthropic key.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + ESLint clean across `.bkit/src/`.
- [ ] **Test Synchronization:** Update `bkit-install.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-manifest.test.ts`, `bkit-cli.test.ts`, `bkit-catalog-parity.test.ts`, `bkit-uninstall.surgical.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts`; add `bkit-gateguard-opencode.test.ts` + `bkit-mode.test.ts`.
- [ ] **Build:** Rebuild `dist/` (the engine compiles from `.bkit/src/`); confirm the new module/manifest/transform compile and ship.
- [ ] **Dogfood (tarball, clean dir):** `pnpm pack` → fresh consumer dir → install `--opencode` → confirm `.opencode/` renders + `bkit check --opencode` clean (per MEMORY: dogfood via packed tarball, not the repo; verify install AND upgrade live).
- [ ] **Run all tests:** `pnpm test` green; `pnpm bkit check` clean on dogfood.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/test errors, follow `docs/architecture.md` + `docs/knowledge.md`; never weaken a gate to pass (GateGuard's own contract). Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, CLI results, `bkit check` exit codes).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (opencode, ollama, curl provider `/models`) to verify — do not ask the user to check a dashboard.

- [ ] **Step 1:** In a clean consumer repo, `bkit install --opencode`; confirm `.opencode/` tree (agents/commands/opencode.json/plugin) exists and `bkit check --opencode` exits 0.
- [ ] **Step 2:** `bkit mode --opencode=ollama` (server up, models pulled) OR `--opencode=nvidia` (valid key); `bkit mode --status` shows opencode host + provider, NO `ANTHROPIC_BASE_URL`, NO ccr.
- [ ] **Step 3:** Launch opencode; run `/bkit-plan #<issue>`; confirm the parallel review triplet dispatches 3 concurrent Task subagents and the orchestrator collects all verdicts; confirm via the provider's own logs/responses that the provider (not Claude) served the subagents.
- [ ] **Step 4:** Edit a `tsconfig.json` in the opencode session; confirm the GateGuard plugin injects the gate-config advisory (advisory mode) and blocks (deny mode).
- [ ] **Step 5:** After Phase 6 merge, confirm `bkit mode --cloud=nvidia` is gone (usage error) and `bkit mode --claude` still routes direct Anthropic; `grep` confirms no live ccr references remain.
