Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

This plan adds **opencode** (sst/opencode) as bkit's third execution host — a **universal, provider-agnostic render target** for models without dedicated CLI support (NVIDIA NIM, Ollama, OpenRouter, Gemini, etc.). It replaces Approach A (the `claude-code-router` stopgap), which bridges non-Claude models through Claude Code, leaking Claude's model identity and prompts into non-Claude models.

The milestone is **split into 4 sub-plans** (complexity > 1 agent budget):

1. **Spike (THE GATE):** Prove opencode runs 3 distinct specialised subagents concurrently, deterministically collects results, honours per-agent `model:` pins, captures the real `tool.execute.before` plugin payload for GateGuard porting.
2. **Render target + Transform:** `applyOpencodeAgent`, `applyOpencodeCommand`, opencode model lookup parser; `runOpencodeModule`; CLI `--opencode` flag; manifest.
3. **GateGuard plugin + Mode redesign:** `.opencode/plugin/gateguard.js` (`tool.execute.before` hook, advisory/deny/off modes, subagent-exempt); `bkit-mode.sh` redesign (host selector, per-agent pins, no router).
4. **Testing, docs, manual E2E, and Approach-A removal:** Full test coverage (round-trip, upgrade-migration, drift detection for stale `bkit-mode.sh`); doc rewrites (`providers.md`, `decisions.md`, `knowledge.md`); manual end-to-end on real Ollama/NVIDIA; then DELETE all router machinery (φ 8 router wires removed sequenced LAST so opencode is proven first).

**Key gates:** Gate 1 (human confirmations on Acceptance Scenario + Breaking Changes); Gate 1.5 (spike verdict green = proceed; serial-only or non-deterministic = park); Gate 2 (code-implementation checkpoint Phases 1–3); Gate 3 (test + doc coverage); Gate 4 (automated + manual verification).

## Plan Quality

**Well-scoped and dependency-clear.**

Strengths:

- **Spike gates the work:** No code proceeds until concurrency + result collection proven empirically on real opencode + provider. Blocks entire milestone if the blocking unknown fails (serial-only execution) — correct gating strategy.
- **Complexity split is clean:** 4 sub-plans by domain + dependency order. Spike → render target (pure functions) → plugin + mode redesign → testing/docs/removal. No forward coupling (Task in plan-v4-2 depends only on completed plan-v4-1 Gate 1.5; plan-v4-3 awaits plan-v4-2's `runOpencodeModule` output, etc.). Parent master plan correctly routes.
- **Removal sequenced LAST:** Approach A (ccr router) is not removed until plan-v4-4, AFTER opencode is proven. No capability gap window — both paths coexist during plans 2–3, removal is separate PR, independently revertible. Matches issue mandate.
- **Human gates explicitly marked:** Both Acceptance Scenario and Breaking Changes require human review at Gate 1; unchecked → summary "REVISE". Neither gate is auto-approved.
- **Upgrade-migration is explicit:** Task 6.3 detects a stale router-bearing seeded `bkit-mode.sh` (Tier-3 seed-or-print doesn't overwrite) and emits a drift advisory + forced-reseed on upgrade — mirrors KN-17, acknowledged in MEMORY.
- **Test coverage mapped:** All Derived Test Matrix rows are traced to a specific task in the runbook. The spike's output (plugin payload + confirmed dir names) drives plan-v4-3's no-mock test fixtures — not a hand-authored mock contract.
- **Architecture precedent clear:** Cursor's inline transforms (`applyT1/T2/T3`) are the structural precedent; plan mirrors them (`applyOpencodeAgent`, `applyOpencodeCommand`). No new `bkit-hosts/` directory UNLESS the spike surfaces it.

## Completeness

**Plan-level scope is complete.**

Coverage:

- **Rendering complete:** agents, commands, `opencode.json` (permissions + mcp filtered by tracker + provider config via env vars, no plaintext keys), plugin (stub in plan-v4-2, filled in plan-v4-3).
- **Transforms complete:** frontmatter rewrites (mode/model/permission), `effort:` → `reasoningEffort`, command body rewrite (subagent/skill spelling), model lookup parser (header-addressed, not positional — with regression guard on existing claude/cursor column).
- **CLI complete:** `--opencode` flag (ALL_MODULES or OPTIN_MODULES per Breaking-Changes decision), help text.
- **Testing complete:** Unit (apply\* functions, parser, plugin behavior), integration (round-trip, dry-run parity, upgrade-migration drift detection), spike (manual empirical on real opencode + provider), end-to-end (manual on 5 workflows + utilities).
- **Docs complete:** 6 files rewritten (`providers.md`, `prompts.md`, `decisions.md`, `knowledge.md`, `testing.md`, `AGENTS.md`/`README.md`); old router content explicitly deleted; `.agents/docs.md` accuracy confirmed.
- **Removal complete:** 8 router wires explicitly itemized in Supersession Inventory; each DELETE mapped to a task in Phase 6 (plan-v4-4). `grep -ri 'claude-code-router|ccr'` guard test ensures no stale refs except decision-log history.

**Edge cases covered:** 11 rows in Edge Cases table, each with expected behavior. Includes: serial-only fail (parked), non-deterministic collection (park or narrow), `--opencode` not auto-installed, tool-name mismatch, `effort:` passthrough, GateGuard exemption signal, disabled GateGuard, host switching, global ccr uninstall scope, upgrade-migration detection, plugin fail-open, tracker pairing decoupled.

**Concrete Example:** Specific (Ollama consumer, `.opencode/` not present) → numbered steps → observable outcome (plan workflow runs on local Ollama with concurrent fan-out, no router, no "I'm Opus" leak).

## Acceptance Scenario

**Narrative ✅:** "A bkit consumer who wants to run the full bkit workflow on a non-Anthropic model (NVIDIA NIM, Ollama, OpenRouter, Gemini, etc.) runs `bkit install --opencode`, points `bkit mode` at the opencode host and their provider, and gets the same 5 phase workflows + 46 subagents + GateGuard + tracker integration they get on Claude Code — running natively on their chosen model, with no `claude-code-router` and no Claude model-identity leakage." ✅ User POV, 2 sentences, outcome clear.

**Success Criteria ✅:** 5 bullets, all measurable/testable, all outcomes not impl steps:

1. Spike gate (concurrency + determinism + model pins + plugin payload captured).
2. Render target (install/check/uninstall round-trip, 46 agents + workflows + opencode.json + plugin).
3. E2E manual (5 phase commands + utilities on real provider).
4. Mode redesign (host selection, per-agent pins, no `ANTHROPIC_BASE_URL`, no ccr).
5. Approach A removed (grep-guard passes, ccr gone from live code except decision-log history).

**Adherence to `docs/plans/template.md` § Acceptance Scenario spec:** PASS.

- Narrative: ✅ 1–2 sentences, user POV.
- Success Criteria: ✅ ≤5 bullets, measurable, outcomes.
- Key Edge Cases: ✅ 11 rows, design-shaping (concurrency, exemptions, upgrade-reach).
- Plan-level Edge Cases: ✅ Inherits design's + adds plan-level (validation, boundary, drift detection).
- Concrete Example: ✅ Setup (Ollama consumer, no `.opencode/`), numbered steps (install, mode, launch, edit), observable outcome.
- Derived Test Matrix: ✅ 18 rows, each row → exactly 1 task in runbook, all with target files named (unit/integration/manual).

## Breaking Changes

**BREAKING — `bkit mode` grammar:** `--cloud=nvidia` and `--local=ollama` REMOVED. Consumers upgrade to `bkit install --opencode` + `bkit mode --opencode=<provider>`. Direct Anthropic (`--claude`) preserved.

**BREAKING — `.bkit/.env` route block:** The `# bkit-mode:route` managed block (Router env, `ANTHROPIC_AUTH_TOKEN=bkit-router`) is stripped on next `bkit mode` run. **Upgrade caveat:** Tier-3 seed-or-print means existing `bkit-mode.sh` persists untouched on upgrade; plan-v4-4 Task 6.3 detects the stale shim and emits a drift advisory + forced-reseed recommendation (mirrors KN-17).

**NEW NAMES (all confirmed in Breaking Changes section of plan-v4-1):**

- CLI module flag: `--opencode`.
- `bkit mode` grammar: `--claude` (direct), `--opencode=<provider>` (`ollama|nvidia|openrouter|gemini|…`), `--status`, `--reset`.
- Render dir: `.opencode/agent/*.md`, `.opencode/command/*.md`, `.opencode/opencode.json`, `.opencode/plugin/gateguard.js`.
- Module identifier: `opencode` (ModuleName, OPENCODE_MANIFEST, runOpencodeModule).
- `prompts.md` column: new `opencode model` column (provider-prefixed e.g. `ollama/qwen3.6:27b`).
- Plugin: `.js` extension (parallel to `gateguard.cjs`, not a rename).

**DEFAULT-INSTALL DECISION:** Recommendation is **opt-in** (explicit `--opencode` flag, NOT auto-included in `--full`), mirroring cloud/renovate. Cursor is always-on — human must confirm which precedent applies.

## Design Alignment

**No design doc exists.** By issue #245 mandate: "the recon comments + the spike together replace a full `/bkit-design`." The Narrative and Success Criteria are authored from the issue body (pre-design artifact, Comment 3 feasibility spike + Comment 4 clarification). Plan-v4-1 § Acceptance Scenario explicitly flags this as "design-missing fallback" and requires human confirmation at Gate 1 before proceeding.

**Plan scope ⊆ issue scope ✅:**

- Issue sets host acceptance: "prove opencode executes 3 distinct subagents concurrently with deterministic result collection." ✅ Spike (plan-v4-1 Task 0.1) does exactly that.
- Issue sets render scope: "opencode render target in installer + manifest + templates + tests." ✅ Plan-v4-2 implements.
- Issue sets port scope: "port gateguard.cjs → opencode plugin; port mode shim." ✅ Plan-v4-3 implements.
- Issue sets removal scope: "remove Approach A (router lanes, ccr config, ollama/nvidia columns)." ✅ Plan-v4-4 Phase 6 removes.

**Narrative matches issue:** "A consumer installs `--opencode`, runs `bkit mode`, executes full workflows on non-Anthropic provider natively, no router, no identity leak." ✅ Matches issue § Approach A narrative.

## Risks

**Execution risks:**

1. **Spike unknown (mitigated):** One "🟡 narrow unknown" at plan-v4-1 Task 0.1: Does opencode's Task tool execute distinct specialized subagents in parallel, or serially? **Mitigation:** Spike is a hard gate; if serial-only, entire milestone parks and Approach A is retained. Issue explicitly states "fail (serial-only) → Approach A stays indefinitely." Correctly gated. Comment 4 downgrades risk from 🔴 to 🟡 (opencode docs confirm "Use this to run multiple units of work in parallel" on the built-in general subagent). Spike must **confirm concurrency across DISTINCT specialized subagents** (3 different agents, not N copies of general) — the narrow remaining unknown.

2. **Plugin payload capture (mitigated):** Task 3.1's no-mock subagent-exemption test depends on the spike-recorded real `tool.execute.before` payload (plan-v4-1 Task 0.1 item (d)). **Mitigation:** Spike explicitly captures this; if missing, plan-v4-3 cannot proceed without it. Gate 1.5 artifact-capture sub-check ensures (d) is recorded or spike re-run.

3. **opencode API churn (mitigated):** opencode is pre-1.0; agent/command/plugin spec can change. **Mitigation:** Spike pins the opencode version; plan-v4-2 (Task 2.1 manifest) + plan-v4-3 (Task 3.1 plugin smoke) confirm dir names and plugin hook shape against the pinned version. Breaking-Changes section (plan-v4-1) explicitly calls for version-pin guard in spike + smoke verification.

4. **Tier-3 seed-or-print upgrade reach (mitigated):** The `bkit-mode.sh` router-bearing seeded copy (a #243/#244 consumer has) is NOT overwritten on upgrade. Approach-A removal therefore doesn't reach them via the normal seed path. **Mitigation:** plan-v4-4 Task 6.3 adds a detect-and-advise upgrade-migration (mirrors KN-17 drift detection) that emits a forced-reseed advisory when the old shim is detected. Upgrade test (plan-v4-4 Testing & Documentation) asserts the drift signal is emitted.

5. **Default-install ambiguity (gates human confirmation):** Should `--opencode` be opt-in (explicit flag) or always-on (like cursor)? **Mitigation:** Breaking-Changes section flags this as a human decision required at Gate 1. Plan's Concrete Example assumes opt-in (explicit `--opencode` flag); if human confirms always-on, Task 2.3 switches to `ALL_MODULES`. Not a risk — a gated decision.

6. **Opencode.json tier decision (committed default in place):** Is it Tier-2 deep-contained (reconverged on upgrade) or Tier-3 seed-or-print (never overwritten)? **Mitigation:** Task 2.1 (plan-v4-2) commits **Tier-2 deep-contained** as the default (it is ownership-mixed; consumers add mcp/provider keys; KN-17 mandate reconvergence). Tier-2/json write path must throw on malformed destination (KN-19). A different tier choice requires explicit human Breaking-Changes confirmation absent in the plan today.

**Dependencies:**

- **Hard dep: Spike verdict green (Gate 1.5).** If spike fails (serial-only, non-deterministic), plan-v4-2/3/4 do NOT start.
- **Hard dep: plan-v4-1 Gate 1 + Gate 1.5 complete.** Both human confirmations + spike passed. Plan-v4-2 cannot start without both.
- **Hard dep: plan-v4-2 complete (render output).** Plan-v4-3 Task 4.1 rewrites `.opencode/agent/*.md` headers; requires `runOpencodeModule` output first.
- **Hard dep: plan-v4-3 Gate 2 complete.** Plan-v4-4 assumes Phase 1–3 verified; it adds testing coverage + manual E2E + removal.
- **Hard dep: opencode version pinned.** Spike pins it; if plan-v4-3 uses a different version, payload capture is stale — re-run spike spike capture before binding fixture.

**Unknowns post-spike (low residual risk):**

- Consumer opencode model-ID format (provider-prefixed vs not). **Addressed:** Spike captures actual opencode config shape; plan-v4-2 Task 1.2 uses that shape for `prompts.md` column.
- Whether opencode CLI `agent` vs `agents` dir names. **Addressed:** Spike (item (e)) confirms actual names against probed version; plan-v4-2 manifest paths use confirmed names.
- Whether inline transform (mirror Cursor) or new `bkit-hosts/` module. **Addressed:** Breaking-Changes section flags as a human decision; recommendation is inline (like Cursor) unless spike surfaces config complexity.

## Action Items

None. Plan is complete and ready for execution. All human gates are explicitly marked (`👤 ✅ Human Confirmation` checkboxes, unchecked). All blockers are conditional on executing the spike (plan-v4-1 Task 0.1). All prerequisites (user context, provider access, opencode version pin) are listed in plan-v4-1 Pre-Flight/Dependencies.

One administrative note: The plan is split into 4 sub-plans; ensure humans and agents follow the sub-plan boundaries. The master plan (plan-v4-split.md) is an index and context — execution flows through plan-v4-1 → plan-v4-2 → plan-v4-3 → plan-v4-4 in order. Sub-plans are INDEPENDENT PRs per the Merge Method section (squash merges per PR boundary, removal last).

## Recommended Next Step

`/bkit-build plan-v4-1`

**Brief:** Spike the opencode multi-provider host. Prove concurrent distinct subagent execution + deterministic result collection + per-agent model-pin honoring on a real NVIDIA/Ollama provider, with the real `tool.execute.before` plugin payload captured for GateGuard porting. Document verdict + captured artifacts (payload shape, confirmed opencode dir names, version pin, timing evidence). If spike passes, plan-v4-2 rendering auto-starts; if it fails (serial-only), park the milestone and retain Approach A. See [plan-v4-1.md](./docs/plans/202606/logs/245-opencode-provider-host/plan-v4-1.md) Gate 1 (Gate 1.5 is the hard gate; Gates 1/1.5 both require human confirmation of Acceptance Scenario + Breaking Changes before Task 0.1 runs).
