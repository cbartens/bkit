<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan C: GateGuard plugin port + `bkit mode` redesign

**Parent Plan:** [245-opencode-provider-host-plan.md](./245-opencode-provider-host-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 3 of 4.** It owns Phase 3 (GateGuard plugin port: Task 3.1), 🔒 Gate 2 (code-implementation checkpoint for Phases 1–3), and Phase 4 (`bkit mode` host/provider redesign: Task 4.1 — additive redesign; Approach-A REMOVAL is deferred to plan-v4-4).
>
> **HARD PREREQUISITES:**
>
> - [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md) Gate 1.5 green — specifically item (d), the captured real subagent-initiated `tool.execute.before` payload, which Task 3.1's no-mock subagent-exemption fixture binds against.
> - [245-opencode-provider-host-plan-2.md](./245-opencode-provider-host-plan-2.md) complete — Task 4.1 rewrites `.opencode/agent/*.md` headers, which `runOpencodeModule` (plan-v4-2 Task 2.2) must have produced first.

## Context & Goals

opencode ports GateGuard MORE faithfully than Cursor: opencode's `tool.execute.before` plugin hook can block AND return model-visible text. This sub-plan authors that plugin (a parallel implementation of the Claude `gateguard.cjs`, NOT a rename) and redesigns `bkit mode` so it selects a _host_ (claude | opencode) then a provider — for opencode setting per-agent `model:` pins in `.opencode/agent/*.md`, with no `ANTHROPIC_BASE_URL` and no ccr.

**Success Criteria (this sub-plan):**

- `.opencode/plugin/gateguard.js` implements advisory / deny / off modes, subagent-exempt (keyed on the spike-recorded real subagent-identity field), fail-open, and per-(session,file) dedup in OS temp with 24h TTL — unit-tested against the real recorded payload shape, plus a live-opencode smoke step.
- The redesigned `bkit-mode.sh` (+ template) parses `--claude` / `--opencode=<provider>` / `--status` / `--reset`, rewrites `.opencode/agent/*.md` headers (not the `.bkit/.env` route block) for opencode, exports no `ANTHROPIC_BASE_URL` in opencode mode, and starts no ccr.
- Gate 2 confirms Phases 1–3 against their `Done when:` lines.

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A superseded — removed in plan-v4-4), `DE-26` (decisions.md).

> The full milestone-wide `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` live in [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md). Derived Test Matrix rows owned by THIS sub-plan: the opencode GateGuard plugin row, and the `bkit-mode.sh` redesign row (its Approach-A-removal half is owned by plan-v4-4).

## Merge Method

**Merge method: always squash.** The GateGuard plugin and the mode redesign ship as squashed PRs per the master decomposition; the Approach-A removal PR (plan-v4-4) lands LAST so the additive mode redesign here precedes the destructive removal.

## Security & Privacy

- [ ] **Plugin temp-only writes** — the opencode plugin (Task 3.1) writes only to OS temp (mirror `gateguard.cjs` — never into the consumer repo). Dedup state is per-(session,file) in OS temp with 24h TTL.
- [ ] **No plaintext keys** — the mode redesign (Task 4.1) for opencode sets per-agent `model:` pins only; it exports no `ANTHROPIC_BASE_URL` and writes no key material.

_All other rows: None — bkit repo (CLI/installer), no database, no new app routes._

## Data Schema Integration

None — bkit is a CLI/installer with no database. No schema changes.

## Architecture & Component Changes

> bkit repo topology: engine in `.bkit/src/*.ts`, templates in `.bkit/templates/`, scripts in `.bkit/scripts/`. All `[MODIFY]` paths verified to exist in the master plan's session.

### Render-target templates (`.bkit/templates/.opencode/`)

#### [NEW] `.bkit/templates/.opencode/plugin/gateguard.js`

- opencode GateGuard plugin: `tool.execute.before` hook. Advisory mode injects the investigation checklist / gate-config advisory as model-visible text; deny mode `throw`s to block (thrown text returns to the model). Subagent-exempt (detect opencode's subagent/session identity). Fail-open. Dedup per (session, file) in OS temp with 24h TTL. Functional mirror of `.bkit/templates/.claude/hooks/gateguard.cjs` — NOT a rename.

### Canonical sources & scripts (`.bkit/`)

#### [MODIFY] `.bkit/scripts/bkit-mode.sh` + `.bkit/templates/.bkit/scripts/bkit-mode.sh`

- **Existence Check:** Both exist. Redesign (additive half — removal in plan-v4-4): mode selects host (claude | opencode) then provider; for opencode set per-agent `model:` in `.opencode/agent/*.md` from the opencode map, no `ANTHROPIC_BASE_URL`, no ccr. Keep direct Anthropic (`--claude`/`--reset`). The DELETE of `_bkit_registry` router rows / `_bkit_agent_matrix` ollama-nvidia columns / `_bkit_router_*` / `_bkit_env_route` / `--cloud=`/`--local=` / ccr preflight is owned by **plan-v4-4 Task 6.1**.
- **Upgrade-reach caveat (CRITICAL — drives a plan-v4-4 migration task):** `.bkit/scripts/bkit-mode.sh` is registered in `bkit-manifest.ts` as `format: "byte-equal-text", seedOrPrint: true` and installed via `writeTier3` — i.e. **Tier-3 seed-or-print**: on `bkit upgrade` an existing consumer copy is PRESERVED untouched. A #243/#244 consumer keeps the full router-bearing shim after upgrading. The Approach-A removal therefore does NOT reach existing consumers via the normal seed path; plan-v4-4 Task 6.3 adds the detect-and-advise migration.

## Documentation Updates

> Index: `.agents/docs.md`. The bulk doc rewrite lands in plan-v4-4 (Gate 3). This sub-plan's `bkit mode` narrative rewrite in `.bkit/providers.md` is sequenced with plan-v4-4 Task 6.2 (which also DELETES the router swap section) to avoid a split rewrite. No standalone doc rows here.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` per PR | Plugin and mode-redesign each ship as their own squashed PR; both are additive (no router removed yet), so revert restores prior state without a capability gap. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 3 — GateGuard plugin port (external boundary: opencode plugin runtime)

- [ ] **Task 3.1:** Author `.bkit/templates/.opencode/plugin/gateguard.js` — `tool.execute.before` hook; advisory injects model-visible checklist/gate-config advisory; deny mode `throw`s; `off` mode no-op; subagent-exempt (keyed on the spike-recorded real subagent-identity field, plan-v4-1 Task 0.1 item (d)); fail-open; per-(session,file) dedup in OS temp w/ 24h TTL. **Requires:** plan-v4-1 Task 0.1's captured `tool.execute.before` payload. **Version-pin guard:** the smoke step MUST run on the SAME pinned opencode version as Task 0.1 (opencode is pre-1.0; the plugin API can churn) — if the implementation version differs, re-run the Task 0.1 payload capture against the new version before binding the fixture, else the recorded real shape is stale.
  - **Done when:** `bkit-gateguard-opencode.test.ts` covers: advisory injects context on first edit, deny blocks first touch then allows retry, `off` mode no-op (no injection, no block, no dedup write), subagent payload exempt (the test's subagent fixture mirrors the spike-recorded real payload shape, NOT a hand-authored mock), gate-config path → config advisory, malformed stdin → fail-open (no throw). **Boundary test (no mock):** a smoke step loads the plugin in a real opencode session and observes (a) the advisory text appears in model context on a first edit, (b) deny mode actually blocks the edit, and (c) a subagent-initiated edit is exempt (no nag) — ground-truth signal = opencode's own tool-result surface, recorded in the verification log.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to Phase 4 below (and thereafter to [245-opencode-provider-host-plan-4.md](./245-opencode-provider-host-plan-4.md) for Testing & Documentation).

- [ ] **Gate 2 - Verified:** Phases 1–3 tasks independently verified against their `Done when:` lines. (Phase 1 + Phase 2 live in [245-opencode-provider-host-plan-2.md](./245-opencode-provider-host-plan-2.md), Tasks 1.1/1.2/1.3/2.1/2.2/2.3 — confirm those are `[x]`; Phase 3 = Task 3.1 above.)

### Phase 4 — `bkit mode` host/provider redesign

- [ ] **Task 4.1:** Redesign `bkit-mode.sh` (+ template) so `bkit mode` selects host (claude | opencode) then provider; for opencode set per-agent `model:` in `.opencode/agent/*.md` from the opencode map; `--status`/`--doctor`/`--list`/`--reset` reframed around opencode; no `ANTHROPIC_BASE_URL`, no ccr for opencode. **Requires:** plan-v4-2 render output (`runOpencodeModule` must have produced `.opencode/agent/*.md` for mode to rewrite its headers).
  - **Done when:** `bkit-mode.test.ts` (new — `bkit-mode.sh` is bash, so the test EITHER spawns bash against the rendered script OR string-scans the rendered template; name which in the test and keep the deterministic string-scan as the load-bearing half) asserts the redesigned flag grammar parses (`--claude`, `--opencode=<provider>`, `--status`, `--reset`), that opencode mode rewrites `.opencode/agent/*.md` headers (not `.bkit/.env` route block), and that no `ANTHROPIC_BASE_URL` is exported in opencode mode. **Boundary test (no mock):** a doctor run against a live opencode + provider reports the real provider catalog/creds (ground-truth = provider `/models` response), not a router status line.

## Next Sub-Plan

On completion of Phase 3 + Gate 2 + Phase 4 → proceed to **[245-opencode-provider-host-plan-4.md](./245-opencode-provider-host-plan-4.md)** (Testing & Documentation → Gate 3, Manual E2E, and the Approach-A removal sequenced LAST).
