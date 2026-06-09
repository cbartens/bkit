<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan A: Spike (THE GATE)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 1 of 4** (split from the master for per-agent budget). It owns the **spike** that gates the entire milestone, plus the milestone-wide **Gate 1** human-review/pre-flight and the **Gate 1.5** spike verdict. If the spike verdict is NOT green, sub-plans [plan-v4-2.md](./plan-v4-2.md), [plan-v4-3.md](./plan-v4-3.md), [plan-v4-4.md](./plan-v4-4.md) do NOT start.

## Context & Goals

bkit ships its 46 `bkit-*` agents + 5 phase workflows as a canonical `.claude/` surface (Claude Code), with a derived `.cursor/` render target. Models without a first-party agent CLI (NVIDIA NIM, Ollama, OpenRouter, Gemini, etc.) currently run only via **Approach A** (#243/#244): keep Claude Code as the harness and bridge non-Anthropic backends through `claude-code-router` (ccr). Approach A is a leaky stopgap — Claude Code injects its own model identity into every request, so a non-Claude model runs under Claude-tuned prompts and parrots "I'm Opus" (#244).

This milestone adds **opencode** (sst/opencode) as bkit's third execution host. The whole milestone is gated on this spike proving opencode runs distinct specialised subagents concurrently with deterministic result collection, honoured per-subagent `model:` pins, and a capturable subagent-identity signal for the GateGuard plugin port.

**Success Criteria (this sub-plan):**

- A green spike proves opencode executes 3 distinct specialised subagents concurrently against a real NVIDIA/Ollama model, with deterministic result collection and honoured per-subagent `model:` pins — or the milestone is parked and Approach A stays.
- The spike captures the raw subagent-initiated `tool.execute.before` payload (the GateGuard exemption signal) and the actual opencode dir names (`agent` vs `agents`, `command` vs `commands`) against the probed CLI version.

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A superseded), `#247` (Codex CLI — out of scope), `#246` (capability override — out of scope), `DE-26` (decisions.md).

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
- **Render target:** `bkit install --opencode` writes `.opencode/agent/*.md` (one per catalog agent — currently 46), `.opencode/command/*.md` (workflows), `.opencode/opencode.json` (permissions + mcp + provider config), and `.opencode/plugin/gateguard.js`; `bkit check --opencode` reports zero drift on a clean install; `bkit uninstall --opencode` leaves zero `.opencode/` footprint.
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
| GateGuard subagent-exempt contract on opencode | Plugin must detect the subagent boundary (opencode's session/agent identity) and skip, matching the Claude `agent_id` exemption — else every subagent edit nags. The exemption signal in opencode's `tool.execute.before` payload is UNDOCUMENTED: the spike (or a Phase 3 boundary step) MUST capture the real subagent-initiated `tool.execute.before` payload and confirm an `agent_id`-equivalent exists; the unit test asserts against that recorded real shape, never a hand-authored mock. |
| GateGuard disabled (`BKIT_GATEGUARD=off`) on opencode | Plugin is a no-op — no advisory injection, no block, no dedup write — matching `gateguard.cjs`'s third (off) mode. Advisory and deny are the other two; the port honours all three. |
| `bkit mode` switches host while the other host's pins are stale | Mode operates on the active host's render dir only; switching host does not silently leave the other host mis-pinned (status reports per-host). |
| ccr still installed globally after Approach A removal | bkit no longer references/starts it; removal is of bkit's wiring, not the user's global binary — uninstall does not touch global npm. |
| Upgrade over a #243/#244 consumer with a router-bearing seeded `bkit-mode.sh` | `bkit-mode.sh` is Tier-3 seed-or-print — `bkit upgrade` does NOT overwrite an existing copy, so the removed `_bkit_router_*` / `--cloud=`/`--local=` shim survives on the exact target population. Upgrade MUST detect a router-bearing seeded `bkit-mode.sh` (drift signal mirroring `detectTier2JsonDrift`, KN-17) and emit a forced-reseed / manual-replace advisory — the canonical-source grep-guard passing is NOT sufficient evidence the removal reached consumers. |
| opencode plugin throws on malformed stdin | Plugin fails OPEN (never blocks the session on its own error), matching `gateguard.cjs` fail-open contract. |
| Tracker pairing on opencode | opencode is MCP-capable for github OR linear; tracker stays decoupled from host (no third forced pairing) — `--tracker=` drives `opencode.json` mcp block. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task (across sub-plans 1–4). bkit repo: tests are Vitest under `.bkit/src/*.test.ts` (+ `*.integration.test.ts`); no Playwright, no DB. The spike is a manual/empirical gate (no bkit code), recorded as a runbook task with a written verdict artifact, not a Vitest row. The **owning sub-plan** is noted per row.

<!-- prettier-ignore -->
| Test description | Type | Target file | Owning sub-plan |
| --- | --- | --- | --- |
| `applyOpencodeAgent` (T-equivalent for agents) emits opencode frontmatter (`mode: subagent`, `model`, `permission`), maps `effort`→`reasoningEffort`, drops Claude-only fields; fails loud on missing model lookup | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` | plan-v4-2 |
| `applyOpencodeCommand` strips Claude frontmatter + rewrites subagent/skill invocation spelling to opencode Task spelling | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` | plan-v4-2 |
| opencode model lookup parses the new `opencode model` column from `prompts.md` § Models; all catalog agents present (count = `parseModelLookup` length, not a frozen literal), no missing names | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` | plan-v4-2 |
| Parser-generalisation regression: after `parseModelLookup` is generalised to take a column header, the EXISTING claude/cursor column resolves to the same values as today (header-addressed, not positional) | Unit (Vitest) | `.bkit/src/bkit-install.test.ts` | plan-v4-2 |
| `runOpencodeModule` writes the full `.opencode/` set (agents, commands, opencode.json, plugin); dry-run vs install writesets identical | Integration (Vitest) | `.bkit/src/bkit-modules.integration.test.ts` + `bkit-dry-run-parity.integration.test.ts` | plan-v4-2 |
| opencode GateGuard plugin: advisory injects context on first edit; deny mode blocks first touch; `off` mode no-op; subagent-exempt (asserted against the spike-recorded real `tool.execute.before` payload, not a mock); gate-config path advisory; fail-open on bad input | Unit (Vitest) | `.bkit/src/bkit-gateguard-opencode.test.ts` (new) | plan-v4-3 |
| Manifest `OPENCODE_MANIFEST` round-trips: install → check (zero drift) → uninstall (zero footprint) | Integration (Vitest) | `.bkit/src/bkit-uninstall.surgical.integration.test.ts` + `bkit-modules.upgrade.integration.test.ts` | plan-v4-2 (round-trip) + plan-v4-4 (upgrade) |
| CLI parses `--opencode` module flag (install module resolution + help text) | Unit (Vitest) | `.bkit/src/bkit-cli.test.ts` | plan-v4-2 |
| `bkit-mode.sh` redesign: `--claude` / `--opencode=<provider>` / `--status` / `--reset` grammar parses; opencode mode rewrites `.opencode/agent/*.md` headers (not `.bkit/.env` route block); no `ANTHROPIC_BASE_URL` exported; no ccr started | Unit (Vitest — bash spawn OR rendered-template string-scan) | `.bkit/src/bkit-mode.test.ts` (new) | plan-v4-3 |
| catalog/host parity: every agent has an `opencode model` mapping; `providers.md` host table lists opencode | Unit (Vitest) | `.bkit/src/bkit-catalog-parity.test.ts` | plan-v4-2 |
| Approach-A removal: no `claude-code-router`/`ccr` wiring remains in `.bkit/` engine/scripts/docs (except decision-log history); ollama/nvidia matrix columns + router flags gone | Unit (Vitest) | `.bkit/src/bkit-mode.test.ts` (new) + a repo-grep guard test | plan-v4-4 |
| Upgrade-migration: a router-bearing seeded `bkit-mode.sh` (the #243/#244 consumer state) is detected on upgrade and emits a forced-reseed / manual-replace advisory (Tier-3 seed-or-print does NOT overwrite it) | Integration (Vitest) | `.bkit/src/bkit-modules.upgrade.integration.test.ts` | plan-v4-4 |
| `mode-shim-not-sourced` advisory rewrite: rewritten advisory text contains no ccr / `--cloud=` / `--local=` / ollama / nvidia router tokens | Unit (Vitest) | `.bkit/src/bkit-modules.test.ts` (or the advisory's existing suite) | plan-v4-4 |
| Spike verdict: 3 distinct subagents concurrent + deterministic collection + model pins honoured on a real provider; PLUS the real subagent-initiated `tool.execute.before` payload captured for the GateGuard exemption signal; PLUS the actual opencode dir names (`agent`/`agents`, `command`/`commands`) confirmed against the probed CLI version | Manual (empirical gate — not a Vitest file) | `docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md` | **plan-v4-1 (this)** |
| End-to-end: 5 phase commands + worktree utilities execute on opencode against a real non-Anthropic provider; parallel fan-out dispatches concurrent Task subagents; GateGuard advisory fires; tracker writes land; no Claude identity leak | Manual (empirical gate — not a Vitest file) | `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md` (or inline in the Manual Verification log) | plan-v4-4 |

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
> **BREAKING — `.bkit/.env` route block.** The `# bkit-mode:route` managed block (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN=bkit-router`) is no longer written and is stripped on the next `bkit mode` run. `NVIDIA_API_KEY` stays in `.env.example` (opencode reads it directly), but the router-specific persistence is gone. **Note the upgrade-reach caveat:** stripping happens only when the NEW shim runs — a #243/#244 consumer keeps the OLD seeded `bkit-mode.sh` (Tier-3 seed-or-print is not overwritten on upgrade), so the route block persists until the migration task (plan-v4-4 Task 6.3) detects the stale shim and advises reseed/replace. **Confirm the chosen upgrade-migration behaviour** (forced-reseed advisory vs documented manual replace).

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

## Supersession Inventory (milestone-wide reference; DELETE tasks execute in plan-v4-4)

> Approach A is removed, not deprecated. Each DELETE row is mirrored as a removal task in plan-v4-4 (sequenced LAST). Listed here for human review at Gate 1.

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
- [ ] **Prerequisite Plans:** None — but the **spike (this sub-plan) gates everything**: sub-plans plan-v4-2/3/4 do NOT start until the spike verdict is recorded green.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** _(provider creds)_: opencode provider keys live in `.bkit/.env` (direnv). No GCP/Vercel secret store involved (bkit repo).
- [ ] **Architecture & UI** _(new installer files/render target)_: Validate against `.bkit/providers.md` § "How to add a new host" (the 6-step host-addition checklist) and the Cursor render path as the structural precedent.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to the Agent Execution Runbook below.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

None — bkit is a CLI/installer with no database. No `docs/data-schema.md` tables read or written. No schema changes.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 0 — Spike (THE GATE; no bkit code)

- [ ] **Task 0.1:** Pin the opencode CLI version; author one opencode command whose body dispatches 3 _distinct specialised_ subagents (3 different trivial agent files, not 3 copies of `general`) via the Task tool, each with a distinct `model:` pin, wired to a real NVIDIA or Ollama model. Capture wall-clock, per-subagent collected results, and which model served each. Additionally capture the raw `tool.execute.before` payload for a subagent-initiated edit (the GateGuard exemption signal) so plan-v4-3's plugin can assert against a real shape, not a mock.
  - **Done when:** `docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md` exists recording: (a) the 3 ran concurrently (observed wall-clock < sum of individual durations), (b) each result was collected deterministically by the orchestrator, (c) each per-agent `model:` pin was honoured, (d) the verbatim `tool.execute.before` payload from a subagent-initiated edit, showing whether an `agent_id`-equivalent subagent-identity field exists (and naming it), (e) the actual opencode dir names (`agent` vs `agents`, `command` vs `commands`) confirmed against the probed CLI version (these drive the plan-v4-2 manifest paths) — with the opencode version, provider, and raw timing/log evidence. **Boundary test (no mock):** the spike runs against a live opencode CLI + live provider endpoint; ground-truth signal = the provider's own response/log identity per subagent (not a Claude-injected identity), measured concurrency, and the captured real plugin payload.

### 🔒 Gate 1.5: Spike Verdict (HARD GATE — milestone proceed/park)

**CRITICAL:** 🛑 If the spike verdict is NOT green (serial-only, or non-deterministic collection), STOP. Park the milestone, retain Approach A, update issue #245. Sub-plans plan-v4-2/3/4 do NOT start. If green, proceed to [plan-v4-2.md](./plan-v4-2.md).

- [ ] **Gate 1.5 - Verified:** `spike-verdict.md` records a green result (concurrent distinct subagents + deterministic collection + honoured model pins). Human acknowledged proceed.
- [ ] **Gate 1.5 - Artifact capture sub-check:** `spike-verdict.md` ALSO records item (d) — the verbatim subagent-initiated `tool.execute.before` payload + the named subagent-identity field — and item (e) — the confirmed opencode dir names. If (d) or (e) is missing, plan-v4-3's no-mock GateGuard-exemption contract and the plan-v4-2 manifest paths have no ground truth: re-run the spike capture before proceeding. (Concurrency green alone does NOT satisfy this gate.)

## Next Sub-Plan

On a green Gate 1.5 → proceed to **[plan-v4-2.md](./plan-v4-2.md)** (Transform path + Render module/manifest/CLI).
