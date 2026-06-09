<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan B: Transform path + Render module/manifest/CLI

**Parent Plan:** [245-opencode-provider-host-plan.md](./245-opencode-provider-host-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 2 of 4.** It owns Phase 1 (transform path: Tasks 1.1, 1.2, 1.3) and Phase 2 (render module + manifest + CLI: Tasks 2.1, 2.2, 2.3).
>
> **HARD PREREQUISITE:** [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md) Gate 1 (human confirmations + pre-flight) AND Gate 1.5 (green spike verdict, including item (d) plugin payload + item (e) confirmed opencode dir names) MUST both be green before any task here starts. The spike's item (e) dir names (`agent` vs `agents`, `command` vs `commands`) drive the Task 2.1 manifest paths.

## Context & Goals

bkit adds **opencode** (sst/opencode) as a provider-agnostic execution host that mirrors the Cursor render path: a new module fn + manifest + transform + templates + tests. This sub-plan implements the pure-function transform path (Claude→opencode frontmatter/command rewrites + the opencode model lookup) and the render module that writes the full `.opencode/` tree, registers the manifest, and adds the `--opencode` CLI flag.

**Success Criteria (this sub-plan):**

- `applyOpencodeAgent` + `applyOpencodeCommand` + the generalised header-addressed `parseModelLookup` / opencode model-lookup parser are implemented and unit-tested (including a regression assertion that the existing claude/cursor column resolves to the same values as before the generalisation).
- `bkit install --opencode` renders `.opencode/agent/*.md`, `.opencode/command/*.md`, `.opencode/opencode.json`, `.opencode/plugin/gateguard.js`; dry-run/install parity holds; manifest round-trips (install → check zero drift → uninstall zero footprint); the `--opencode` flag parses.

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A superseded — removed in plan-v4-4), `DE-26` (decisions.md).

> The full milestone-wide `👤 Acceptance Scenario` (Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix) and `👤 Breaking Changes & Naming Review` live in [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md). The Derived Test Matrix rows owned by THIS sub-plan: `applyOpencodeAgent`, `applyOpencodeCommand`, opencode model lookup, parser-generalisation regression, `runOpencodeModule`, manifest round-trip (install/check/uninstall half), CLI `--opencode` flag, catalog/host parity (mapping presence).

## Merge Method

**Merge method: always squash.** This sub-plan's work ships as its own squashed PR (render-target + transform) per the master decomposition; the Approach-A removal PR (plan-v4-4) lands LAST.

## Security & Privacy

- [ ] **Generated config** — `opencode.json` (Task 2.1) must NOT embed plaintext provider keys; it references env vars (`${NVIDIA_API_KEY}`) the same way `.mcp.json` references `${GH_TOKEN}`. Verify no key material is written to disk.

_All other rows: None — no new routes, DB writes, app secrets, or user input. bkit repo (CLI/installer), no database._

## Data Schema Integration

None — bkit is a CLI/installer with no database. No schema changes.

## Architecture & Component Changes

> bkit repo topology: engine in `.bkit/src/*.ts` (compiled to `dist/`), shipped templates in `.bkit/templates/`, canonical agent/workflow sources in `.bkit/prompts/` + `.bkit/workflows/`, reference docs in `.bkit/*.md`. All `[MODIFY]` paths verified to exist in the master plan's session.

### Installer engine (`.bkit/src/`)

#### [MODIFY] `.bkit/src/bkit-install.ts`

- **Existence Check:** Exists (holds `applyT1/T2/T3`, `parseModelLookup`, `Host` type).
- Add `applyOpencodeAgent(content, opencodeModelLookup)` (frontmatter → opencode: `mode: subagent`, `model`, `permission`, map `effort`→`reasoningEffort`, drop Claude-only fields; fail loud on missing lookup) and `applyOpencodeCommand(content)` (strip frontmatter + rewrite invocation spelling), mirroring `applyT3`/`applyT1+T2`.
- Extend `Host` type to `"claude" | "cursor" | "opencode"`. Generalise `parseModelLookup` to take a column header (or add `parseOpencodeModelLookup`) reading the new `opencode model` column from `prompts.md` § Models. **Regression guard (no design doc — fallback per issue mandate):** `parseModelLookup` today resolves the cursor `applyT3` model pins; the generalisation MUST be header-addressed, never positional. A regression test asserts the existing claude/cursor column resolves to the SAME values as before the refactor — a positional/default-shift bug would silently mis-pin cursor agents and the catalog-parity row (presence-only) would not catch it.

#### [MODIFY] `.bkit/src/bkit-modules.ts`

- **Existence Check:** Exists (holds `runClaudeModule`, `runCursorModule`, `MODULE_REGISTRY`, `MODULE_DISPATCH_ORDER`).
- Add `runOpencodeModule(ctx)`: render `.opencode/agent/*.md` (via `applyOpencodeAgent`), `.opencode/command/*.md` (via `applyOpencodeCommand` + tracker substitution), seed `.opencode/opencode.json` (permissions + mcp filtered by `issueTracker` + provider/model config), drop `.opencode/plugin/gateguard.js`. Register in `MODULE_REGISTRY` + `MODULE_DISPATCH_ORDER`. Add an opencode model lookup into `ModuleContext` — **prefer the additive `opencodeModelLookup` field over reshaping the shared `modelLookup`**: `modelLookup` is consumed by every module fn, so reshaping it is a high-risk shared-utility change touching all module signatures for no functional gain.
- **Note:** `runOpencodeModule` drops `.opencode/plugin/gateguard.js`, but the plugin's _authoring_ (the template body) is owned by plan-v4-3 (Task 3.1). For this sub-plan's render/round-trip tests, the plugin template file must exist (even as a stub) so the writeset is complete — coordinate ordering so a placeholder/stub plugin template is present, then plan-v4-3 fills its body. The manifest entry (Task 2.1) for the plugin is authored here.

#### [MODIFY] `.bkit/src/bkit-manifest.ts`

- **Existence Check:** Exists (holds `ModuleName`, per-module manifests).
- Add `"opencode"` to `ModuleName`; add `OPENCODE_MANIFEST` (agent/command mirrors dynamic like claude/cursor; `.opencode/opencode.json` json/seed-or-print; `.opencode/plugin/gateguard.js` byte-equal-text); register in `MODULE_MANIFESTS`.
- **Manifest `format` MUST match the actual write fn called (KN-18/KN-13/KN-16b):** `writeTier3` → `byte-equal-text`; `writeTier2JsonContained` → `json`. **Committed default = Tier-2 deep-contained** for `opencode.json`: it is ownership-mixed (consumers add their own mcp/provider keys), so it MUST be Tier-2 (KN-17, reconverged on upgrade), NOT seed-or-print — otherwise consumer `opencode.json` edits are never reconverged. (A deviation to seed-or-print requires explicit human Breaking-Changes confirmation; absent that, ship Tier-2.) A Tier-2/json `opencode.json` write path must **throw on a malformed destination** rather than silently overwrite it (KN-19).

#### [MODIFY] `.bkit/src/bkit-cli.ts`

- **Existence Check:** Exists (`ModuleFlag`, `MODULE_FLAGS`, `ALL_MODULES`/`OPTIN_MODULES`, `printUsage`).
- Add `"opencode"` to `ModuleFlag` + `MODULE_FLAGS`. Decide `ALL_MODULES` (always-on, like cursor) vs `OPTIN_MODULES` per the default-install decision. Update `printUsage` with `--opencode` + the redesigned `bkit mode` grammar.

### Render-target templates (`.bkit/templates/.opencode/`)

#### [NEW] `.bkit/templates/.opencode/opencode.json`

- opencode config template: `permission` block (edit/bash/read/grep/task = allow/ask/deny + bash globs), `mcp` block (tracker-filtered, mirrors `.mcp.json`), provider/model config referencing env-var creds (no plaintext keys), plugin registration. Tracker-filtered like `seedMcpJson`.

### Canonical sources & reference docs (`.bkit/`)

#### [MODIFY] `.bkit/prompts.md`

- **Existence Check:** Exists. Add an `opencode model` column to § Models (one model ID per agent; tier-mirrored like the removed matrix, provider-prefixed). Document `effort`→`reasoningEffort` mapping in § Frontmatter Conventions.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends. The bulk doc rewrite lands in plan-v4-4 (Gate 3); this sub-plan only authors the `prompts.md` `opencode model` column (which is canonical source, not narrative docs).

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.bkit/prompts.md` | New `opencode model` column + `effort`→`reasoningEffort` note (Task 1.2). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` for this sub-plan's PR | Render-target + transform ships as its own squashed PR. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

### Phase 1 — Transform path (pure functions; no external boundary)

- [ ] **Task 1.1:** Implement `applyOpencodeCommand` (strip frontmatter + rewrite subagent/skill invocation spelling to opencode Task spelling) in `bkit-install.ts`.
  - **Done when:** `applyOpencodeCommand` exported; unit tests in `bkit-install.test.ts` assert frontmatter stripped + invocation phrasing rewritten + `@name`→opencode form only on `**Subagent:**` lines; `pnpm test` green for that suite.
- [ ] **Task 1.2:** Add the `opencode model` column to `prompts.md` § Models (tier-mirrored defaults, provider-prefixed) + document `effort`→`reasoningEffort` in § Frontmatter Conventions. **Sequenced before the parser (Task 1.3) so the parser's all-agents assertion has a populated column to read** — resolves the 1.2↔1.3 data coupling the parser's count test would otherwise stall on.
  - **Done when:** `bkit-catalog-parity.test.ts` (extended) asserts every agent has an `opencode model` entry; the column header is present in § Models for all catalog agents.
- [ ] **Task 1.3:** Implement `applyOpencodeAgent` (frontmatter → `mode: subagent` + `model` + `permission`; `effort`→`reasoningEffort`; drop Claude-only fields; fail loud on missing model lookup) + the opencode model lookup parser for the `opencode model` column. Generalise `parseModelLookup` to be **header-addressed, not positional** (see Architecture regression note). **Requires:** Task 1.2's column.
  - **Done when:** both exported; unit tests assert the emitted frontmatter shape, the `effort`→`reasoningEffort` mapping, the fail-loud `process.exit(1)` on missing lookup, that `parseOpencodeModelLookup('.bkit/prompts.md')` returns every catalog agent name (count = `parseModelLookup` length, no missing entries), AND a regression assertion that the existing claude/cursor column resolves to the SAME values as before the generalisation (header-addressed, not positional); `pnpm test` green.

### Phase 2 — Render module + manifest + CLI

- [ ] **Task 2.1:** Author `.bkit/templates/.opencode/opencode.json` (permission + tracker-filtered mcp + provider/model config via env vars, no plaintext keys) and register `opencode` in `ModuleName` + `OPENCODE_MANIFEST` (`bkit-manifest.ts`). Ship `opencode.json` as **Tier-2 deep-contained** (committed default — it is ownership-mixed; consumers add their own mcp/provider keys, so bkit must reconverge its keys on upgrade per KN-17); seed-or-print is allowed ONLY with explicit human Breaking-Changes confirmation. Use the spike-confirmed (plan-v4-1 item (e)) opencode dir names for the manifest paths.
  - **Done when:** `OPENCODE_MANIFEST` lists agent/command mirrors + `.opencode/opencode.json` + `.opencode/plugin/gateguard.js`; the manifest `format` of each entry MATCHES the write fn actually dispatched (`writeTier3`→`byte-equal-text`, `writeTier2JsonContained`→`json`) per KN-18; the Tier-2/json `opencode.json` write path throws on a malformed destination rather than overwriting (KN-19) — this assertion is present unconditionally for the committed Tier-2 default; `bkit-manifest.test.ts` round-trips it; `opencode.json` contains no plaintext key material.
- [ ] **Task 2.2:** Implement `runOpencodeModule` in `bkit-modules.ts`; register in `MODULE_REGISTRY` + `MODULE_DISPATCH_ORDER`; thread the opencode model lookup through `ModuleContext` via an additive `opencodeModelLookup` field (do NOT reshape the shared `modelLookup`). **Requires:** Phase 1 transforms (Task 1.1/1.3) and the manifest (Task 2.1). _(Plugin template body is authored in plan-v4-3 Task 3.1; a stub `.opencode/plugin/gateguard.js` template must exist for the writeset to be complete here.)_
  - **Done when:** `bkit-modules.integration.test.ts` asserts a clean install writes `.opencode/agent/*.md` (one per catalog agent, count = `parseModelLookup` length), `.opencode/command/*.md`, `.opencode/opencode.json`, `.opencode/plugin/gateguard.js`; `bkit-dry-run-parity.integration.test.ts` shows identical dry-run vs install writesets for `--opencode`; a transactional-staging assertion confirms a mid-install failure leaves zero `.opencode/` footprint (KN-12 discard-staging, not just clean-state uninstall).
- [ ] **Task 2.3:** Add `--opencode` to `ModuleFlag`/`MODULE_FLAGS` + `ALL_MODULES` or `OPTIN_MODULES` (per confirmed default-install decision). **This task forks on the Breaking-Changes DEFAULT-INSTALL confirmation** (`ALL_MODULES` always-on like cursor vs `OPTIN_MODULES` opt-in); the Concrete Example assumes explicit `--opencode` (opt-in) — keep them consistent with whichever the human confirms. Update `printUsage`.
  - **Done when:** `bkit-cli.test.ts` asserts `parseArgs(["install","--opencode"])` resolves the opencode module (+ core); help text lists `--opencode`; the `--full`-without-`--opencode` writeset matches the confirmed default-install decision; unknown-flag path unaffected.

## Next Sub-Plan

On completion of Phase 1 + Phase 2 → proceed to **[245-opencode-provider-host-plan-3.md](./245-opencode-provider-host-plan-3.md)** (GateGuard plugin port + `bkit mode` host/provider redesign). Note: plan-v4-3's Gate 2 verifies Phases 1–3 collectively, so plan-v4-3 re-checks this sub-plan's outputs as part of its Gate 2.
