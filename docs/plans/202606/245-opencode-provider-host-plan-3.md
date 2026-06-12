<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan C: GateGuard plugin port + install-flag host/provider selection (`bkit mode` removed)

**Parent Plan:** [245-opencode-provider-host-plan.md](./245-opencode-provider-host-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 3 of 5.** It owns Phase 3 (GateGuard plugin port: Task 3.1), 🔒 Gate 2 (code-implementation checkpoint for Phases 1–3), and Phase 4 (install-flag host/provider selection + read-only diagnostics: Task 4.1 — additive; the `bkit-mode.sh` DELETE + Approach-A removal are deferred to plan-v4-4).
>
> **Decision (2026-06): `bkit mode` is REMOVED, not redesigned; hosts are ADDITIVE.** Hosts coexist — `.claude/` + `.cursor/` render as today (always-on); `bkit install --opencode=<provider>` ADDITIVELY renders + configures the opencode host (re-render `.opencode/agent/*.md` model pins via `runOpencodeModule`) alongside them. **No host switch, no `--claude` selection flag** (claude is always present, direct Anthropic). Read-only diagnostics move to two thin verbs: `bkit doctor` / `bkit status` (per installed host). (Model-ID lookup is documentation in `.bkit/providers.md` § Models — no `bkit list` verb.) This sub-plan adds the `--opencode=<provider>` config flag + the verbs (additive); plan-v4-4 DELETEs `bkit-mode.sh` + its manifest entry. The earlier "additive redesign of `bkit-mode.sh`" framing is void.
>
> **HARD PREREQUISITES:**
>
> - [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md) Gate 1.5 green — specifically item (d), the captured real subagent-initiated `tool.execute.before` payload, which Task 3.1's no-mock subagent-exemption fixture binds against.
> - [245-opencode-provider-host-plan-2.md](./245-opencode-provider-host-plan-2.md) complete — Task 4.1's `bkit install --opencode=<provider>` path drives `runOpencodeModule` (plan-v4-2 Task 2.2) to (re)write `.opencode/agent/*.md` model pins, so the render module must exist first.

## Context & Goals

opencode ports GateGuard MORE faithfully than Cursor: opencode's `tool.execute.before` plugin hook can block AND return model-visible text. This sub-plan authors that plugin (a parallel implementation of the Claude `gateguard.cjs`, NOT a rename) and adds **additive install-flag host config** — `bkit install --opencode=<provider>` renders + configures the opencode host (re-render `.opencode/agent/*.md` model pins, no `ANTHROPIC_BASE_URL`, no ccr) alongside the always-on claude/cursor hosts (no `--claude` selection flag) — plus two thin read-only diagnostic verbs (`bkit doctor` / `bkit status`; model-ID lookup is documented in `.bkit/providers.md` § Models, no `bkit list`). `bkit mode` is removed (script DELETE in plan-v4-4).

**Success Criteria (this sub-plan):**

- `.opencode/plugin/gateguard.js` implements advisory / deny / off modes, subagent-exempt (keyed on the spike-recorded real subagent-identity field), fail-open, and per-(session,file) dedup in OS temp with 24h TTL — unit-tested against the real recorded payload shape, plus a live-opencode smoke step.
- `bkit install --opencode=<provider>` ADDITIVELY rewrites `.opencode/agent/*.md` model pins (via `runOpencodeModule`) for the chosen provider, leaving the always-on claude/cursor hosts intact (no `--claude` flag); it exports no `ANTHROPIC_BASE_URL` and starts no ccr. `bkit doctor` / `bkit status` resolve creds / per-installed-host state respectively, read-only, with no key material echoed. (Model-ID lookup is documented in `.bkit/providers.md` § Models — no `bkit list` verb.)
- Gate 2 confirms Phases 1–3 against their `Done when:` lines.

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A superseded — removed in plan-v4-4), `DE-26` (decisions.md).

> The full milestone-wide `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` live in [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md). Derived Test Matrix rows owned by THIS sub-plan: the opencode GateGuard plugin row, and the install-flag selection + diagnostics row (the `bkit-mode.sh` DELETE half is owned by plan-v4-4).

## Merge Method

**Merge method: always squash.** The GateGuard plugin and the install-flag selection + diagnostics ship as squashed PRs per the master decomposition; the `bkit-mode.sh` DELETE + Approach-A removal PR (plan-v4-4) lands LAST so the additive install-flag path here precedes the destructive removal (no capability gap: selection works via flags before the script is deleted).

## Security & Privacy

- [x] **Plugin temp-only writes** — the opencode plugin (Task 3.1) writes only to OS temp (mirror `gateguard.cjs` — never into the consumer repo). Dedup state is per-(session,file) in OS temp with 24h TTL.
- [x] **No plaintext keys** — install-flag selection (Task 4.1) for opencode sets per-agent `model:` pins only (via `runOpencodeModule`); it exports no `ANTHROPIC_BASE_URL` and writes no key material. `bkit doctor` reads creds from env and never echoes them.

_All other rows: None — bkit repo (CLI/installer), no database, no new app routes._

## Data Schema Integration

None — bkit is a CLI/installer with no database. No schema changes.

## Architecture & Component Changes

> bkit repo topology: engine in `.bkit/src/*.ts`, templates in `.bkit/templates/`, scripts in `.bkit/scripts/`. All `[MODIFY]` paths verified to exist in the master plan's session.

### Render-target templates (`.bkit/templates/.opencode/`)

#### [NEW] `.bkit/templates/.opencode/plugin/gateguard.js`

- opencode GateGuard plugin: `tool.execute.before` hook. Advisory mode injects the investigation checklist / gate-config advisory as model-visible text; deny mode `throw`s to block (thrown text returns to the model). Subagent-exempt (detect opencode's subagent/session identity). Fail-open. Dedup per (session, file) in OS temp with 24h TTL. Functional mirror of `.bkit/templates/.claude/hooks/gateguard.cjs` — NOT a rename.

### Canonical sources & scripts (`.bkit/`)

#### [MODIFY] `.bkit/src/bkit-cli.ts` + `.bkit/src/bkit-install.ts` (install-flag selection + diagnostic verbs)

- **`bkit-mode.sh` is NOT modified here** — it is DELETED in plan-v4-4. Host/provider selection is now an install operation:
  - Claude needs **no flag** — `.claude/` renders by default (always-on, direct Anthropic). There is no `--claude` selection flag (that came from the deleted `bkit mode`).
  - `bkit install --opencode=<provider>` — ADDITIVELY adds the opencode host + provider; `runOpencodeModule` writes per-agent `model:` pins in `.opencode/agent/*.md` from the opencode map for `<provider>` (`ollama` | `nvidia` | `openrouter` | `gemini` | …), leaving `.claude/`/`.cursor/` intact. Idempotent re-render: switching provider = re-run with a different value. No `ANTHROPIC_BASE_URL`, no ccr.
  - Read-only diagnostic verbs (NOT install — own `verb` branches in the CLI): `bkit doctor` (required tools/creds per host+provider) and `bkit status` (current host+provider, sampled from the rendered `.opencode/`/`.claude/` state). These write nothing. **No `bkit list` verb** — the retired `bkit mode --list` live-`/v1/models` recipe is documented per-provider in `.bkit/providers.md` § Models instead (plan-v4-4 doc task), since model-ID discovery is a "how-to" the consumer runs once, not a hot-path command.
- **Upgrade-reach is SIMPLER under removal:** the old `bkit-mode.sh` Tier-3 seed-or-print upgrade-reach problem (an existing consumer copy is PRESERVED untouched on `bkit upgrade`, so removals don't reach them) no longer needs a reseed migration — because the whole script goes away. plan-v4-4 Task 6.3 instead detects ANY seeded `bkit-mode.sh` on upgrade and advises **deletion** + points the consumer at the install flags / `bkit doctor`. (Detect-and-advise, not detect-and-reseed.)

## Documentation Updates

> Index: `.agents/docs.md`. The bulk doc rewrite lands in plan-v4-4 (Gate 3). This sub-plan's `bkit mode` narrative rewrite in `.bkit/providers.md` is sequenced with plan-v4-4 Task 6.2 (which also DELETES the router swap section) to avoid a split rewrite. No standalone doc rows here.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` per PR | Plugin and install-flag selection + diagnostics each ship as their own squashed PR; both are additive (no `bkit-mode.sh`/router removed yet — that's plan-v4-4), so revert restores prior state without a capability gap. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 3 — GateGuard plugin port (external boundary: opencode plugin runtime)

- [x] **Task 3.1:** Author `.bkit/templates/.opencode/plugin/gateguard.js` — `tool.execute.before` hook; advisory injects model-visible checklist/gate-config advisory; deny mode `throw`s; `off` mode no-op; subagent-exempt (keyed on the spike-recorded real subagent-identity field, plan-v4-1 Task 0.1 item (d)); fail-open; per-(session,file) dedup in OS temp w/ 24h TTL. **Requires:** plan-v4-1 Task 0.1's captured `tool.execute.before` payload. **Version-pin guard:** the smoke step MUST run on the SAME pinned opencode version as Task 0.1 (opencode is pre-1.0; the plugin API can churn) — if the implementation version differs, re-run the Task 0.1 payload capture against the new version before binding the fixture, else the recorded real shape is stale.
  - **Done when:** `bkit-gateguard-opencode.test.ts` covers: advisory injects context on first edit, deny blocks first touch then allows retry, `off` mode no-op (no injection, no block, no dedup write), subagent payload exempt (the test's subagent fixture mirrors the spike-recorded real payload shape, NOT a hand-authored mock), gate-config path → config advisory, malformed stdin → fail-open (no throw). **Boundary test (no mock):** a smoke step loads the plugin in a real opencode session and observes (a) the advisory text appears in model context on a first edit, (b) deny mode actually blocks the edit, and (c) a subagent-initiated edit is exempt (no nag) — ground-truth signal = opencode's own tool-result surface, recorded in the verification log.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to Phase 4 below (and thereafter to [245-opencode-provider-host-plan-4.md](./245-opencode-provider-host-plan-4.md) for Testing & Documentation).

- [x] **Gate 2 - Verified:** Phases 1–3 tasks independently verified against their `Done when:` lines. (Phase 1 + Phase 2 live in [245-opencode-provider-host-plan-2.md](./245-opencode-provider-host-plan-2.md), Tasks 1.1/1.2/1.3/2.1/2.2/2.3 — confirm those are `[x]`; Phase 3 = Task 3.1 above.)

### Phase 4 — install-flag host/provider selection + `bkit doctor`/`bkit status` verbs

> **Replaces the old "redesign `bkit-mode.sh`" task.** `bkit mode` is removed (decision 2026-06); selection collapses into install flags and `bkit-mode.sh` is DELETED in plan-v4-4. This phase is ADDITIVE: it adds the flags/verbs so selection + diagnostics work via the new surface BEFORE the script is deleted, leaving no capability gap.

- [x] **Task 4.1:** Wire host/provider selection into the install path + add the two read-only diagnostic verbs, all in `.bkit/src/bkit-cli.ts` (arg/verb parsing) + `.bkit/src/bkit-install.ts` (dispatch). **Do NOT touch `bkit-mode.sh`** (its DELETE is plan-v4-4 Task 6.1).
  - **No `--claude` flag** — claude renders by default (always-on, direct Anthropic); additive hosts means there is nothing to "select".
  - `--opencode=<provider>` (install flag): ADDITIVELY adds the opencode host + provider; drives `runOpencodeModule` (plan-v4-2 Task 2.2) to write per-agent `model:` pins in `.opencode/agent/*.md` from the opencode map for `<provider>`, leaving claude/cursor intact. Idempotent — switching provider = re-run with a different value.
  - `bkit doctor` (new read-only verb): reports required tools/creds for the active host+provider; reads creds from env, never echoes them.
  - `bkit status` (new read-only verb): reports current host+provider, sampled from the rendered `.opencode/`/`.claude/` state. Writes nothing.
  - **No `bkit list` verb** — model-ID lookup is documented per-provider in `.bkit/providers.md` § Models (plan-v4-4 doc task).
  - **Requires:** plan-v4-2 render output (`runOpencodeModule` must exist for `--opencode=<provider>` to (re)write `.opencode/agent/*.md`).
  - **Done when:** a CLI test (`bkit-cli.test.ts` / `bkit-install.integration.test.ts`) asserts: `--opencode=<provider>` parses and ADDITIVELY renders the opencode host while `.claude/`/`.cursor/` remain present (no host removed); `bkit install --opencode=nvidia` rewrites `.opencode/agent/*.md` model pins to the nvidia map (and re-running with `--opencode=ollama` re-renders to the ollama map — idempotent provider switch); no `ANTHROPIC_BASE_URL` is exported and no ccr is started; no `--claude` selection flag exists; `bkit doctor` / `bkit status` exist as read-only verbs that write zero files (write-set assertion). **Boundary test (no mock):** `bkit doctor` against a live opencode + provider reports the real provider creds/reachability (ground-truth = the provider responds to an authenticated `/v1/models` request), not a router status line.

## Next Sub-Plan

On completion of Phase 3 + Gate 2 + Phase 4 → proceed to **[245-opencode-provider-host-plan-4.md](./245-opencode-provider-host-plan-4.md)** (Testing & Documentation → Gate 3, Manual E2E, and the Approach-A removal sequenced LAST).
