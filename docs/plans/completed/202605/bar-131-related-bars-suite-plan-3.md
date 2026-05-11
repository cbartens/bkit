Verdict: PASS

<!-- verdict:end -->

# Sub-plan 3 — P3 (v0.8.x): Tier-1 to Tier-2 deep-merge for hooks/settings JSON via `__bkit__`

**Parent Plan:** [`bar-131-related-bars-suite-plan.md`](./bar-131-related-bars-suite-plan.md) (master source: [`plan-v3-checked.md`](./plan-v3-checked.md))

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-131-related-bars-suite-plan-3.md` natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes here.

## Context & Goals

Phase 3 ships v0.8.x: Tier-1 to Tier-2 reclass for `.cursor/hooks.json` and `.claude/settings.json` via `__bkit__` JSON namespace. Adds `deepMergeJson`, `extractBkitNamespace`, `applyBkitNamespace`, `writeTier2Json`, `migrateTier1JsonToTier2`. Versioned-defaults SoT (`bkit-tier1-defaults.ts`) backs migration. Retires `detectHooksConfigOverwriteRisk` (DELETE). Adds Vercel CLI hang guard (B3). Two-version upgrade-survival regression test reuses sub-plan-2's heavy-customised fixture.

**Success Criteria:**

- Consumer-added `hooks.Stop` / `hooks.PostToolUse` entries in `.claude/settings.json` survive `bkit install` upgrade across two consecutive bkit versions.
- `__bkit__` envelope is the recoverable record of bkit's shipped shape; missing envelope -> `writeTier2Json` throws (not silent corruption).
- Tier-1 to Tier-2 migration via P3.T6a versioned-defaults SoT lifts old shape into envelope; idempotent on re-run.
- `detectHooksConfigOverwriteRisk` deleted (architecturally redundant once `__bkit__` is canonical SoT).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.** Inherited from master, scoped to sub-plan-3.

### Narrative

A consumer maintainer of a heavily-customised repo upgrades `@cbartens/bkit` to v0.8.x. The Tier-1 to Tier-2 reclass migrates `.cursor/hooks.json` and `.claude/settings.json` into the `__bkit__` envelope; consumer-added hook keys survive byte-identical across two consecutive bkit upgrades.

### Success Criteria

- Two-version upgrade on gether-shaped fixture: install bkit@A -> consumer adds custom `hooks.Stop` -> install bkit@B -> assert `hooks.Stop` byte-identical AND `SessionStart` updated.
- `writeTier2Json` throws explicitly when input lacks `__bkit__` envelope (rollback safety).
- `migrateTier1JsonToTier2` idempotent on re-run; consults `BKIT_TIER1_DEFAULTS_BY_VERSION` (P3.T6a SoT).
- `detectHooksConfigOverwriteRisk` removed; obsolete tests deleted; Vercel CLI hang guard added (B3).

### Concrete Example

**Setup:** scratch consumer at `bkit@0.7.0` (sub-plan-2 shipped) with `--full` modules previously installed; consumer customised `.claude/settings.json` (`hooks.Stop`) and `.cursor/hooks.json` (`failClosed: true`, `loop_limit: 5`).

**Steps:**

1. `pnpm add -D @cbartens/bkit@0.8.0`.
2. `pnpm bkit install --full` -> migration auto-runs: old Tier-1 shape lifted into `__bkit__` envelope; consumer keys preserved outside envelope.
3. Inspect `.claude/settings.json` -> `__bkit__.SessionStart` updated; consumer `hooks.Stop` byte-identical.

**Outcome:** Tier-2 deep-merge ships; `__bkit__` becomes public contract; migration exercised on real consumer fixtures.

### Edge Cases

| Scenario                                           | Expected Behavior                                         |
| -------------------------------------------------- | --------------------------------------------------------- |
| Cursor v1 schema differs from bkit's shipped shape | P3.T0 spike must pass before A1 work                      |
| Consumer pre-dates `__bkit__` envelope             | Migration via P3.T6 lifts old shape into envelope         |
| `.cursor/hooks.json` schema vetoed in P3.T0        | Fix shipped shape in P3.T5 (one breaking change, not two) |
| Cursor reserves a key clashing with `__bkit__`     | P3.T0 must veto and propose alternative namespace         |
| Templates reverted to pre-`__bkit__` shape         | `writeTier2Json` throws loudly (no silent corruption)     |

### Derived Test Matrix

| Test description                                                      | Runbook task | Type                 | Target file                                                |
| --------------------------------------------------------------------- | ------------ | -------------------- | ---------------------------------------------------------- |
| `__bkit__` namespace extractor                                        | P3.T2        | Unit (Vitest)        | `.agents/scripts/bkit-tiers.test.ts`                       |
| JSON deep-merge primitive                                             | P3.T1        | Unit (Vitest)        | `.agents/scripts/bkit-tiers.test.ts`                       |
| `writeTier2Json` idempotent round-trip                                | P3.T3        | Unit (Vitest)        | `.agents/scripts/bkit-tiers.test.ts`                       |
| `writeTier2Json` throws on missing `__bkit__` envelope                | P3.T3        | Unit (Vitest)        | `.agents/scripts/bkit-tiers.test.ts`                       |
| `bkit-tier1-defaults` snapshot equality vs git-history JSON           | P3.T6a       | Unit (Vitest)        | `.agents/scripts/bkit-tier1-defaults.test.ts`              |
| Reclassed `.claude/settings.json` survives upgrade                    | P3.T4        | Integration (Vitest) | `.agents/scripts/bkit-modules.test.ts`                     |
| Reclassed `.cursor/hooks.json` survives upgrade                       | P3.T5        | Integration (Vitest) | `.agents/scripts/bkit-modules.test.ts`                     |
| Tier-1 to Tier-2 migration via versioned defaults                     | P3.T6        | Unit (Vitest)        | `.agents/scripts/bkit-tiers.test.ts`                       |
| Two-version upgrade-survival regression (gether/fraser-coast fixture) | P3.T9        | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Vercel CLI hang guard (B3)                                            | P3.T8        | Unit (Vitest)        | `.agents/scripts/bkit-preflight.test.ts`                   |
| `detectHooksConfigOverwriteRisk` removal                              | P3.T7        | Unit (Vitest)        | `.agents/scripts/bkit-preflight.test.ts`                   |

### 👤 Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe "done" for sub-plan-3.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until the checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.**

This sub-plan introduces TWO Major-Changes-bar items requiring explicit human sign-off before Gate 1 passes:

- [ ] **`__bkit__` JSON namespace becomes a public contract.** Top-level `__bkit__` key on `.claude/settings.json` and `.cursor/hooks.json` is the recoverable record of bkit's shipped shape. Once shipped (v0.8.0), removal or rename breaks consumers. Bumps minor -> 0.8.0 per Major-Changes bar.
- [ ] **Tier-1 to Tier-2 reclass for `.cursor/hooks.json` and `.claude/settings.json`.** Previously full overwrite; now managed-block deep-merge. Existing consumers receive auto-migration via P3.T6 (versioned-defaults SoT from P3.T6a). Migration MUST be exercised on real consumer fixtures (gether-life, fraser-coast) before sub-plan-3 merges.

### 👤 Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed both items above and approved.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both Acceptance Scenario AND Breaking Changes checkboxes are `[x]`.

---

## Alternative Approaches & Recommendations

| Rejected approach                                           | Why rejected                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Tier-2 via JSON-merge-patch (RFC 7396)                      | Cannot express "bkit owns these keys" without a namespace; chosen `__bkit__` envelope instead.        |
| Repurpose `detectHooksConfigOverwriteRisk`                  | Architecturally redundant once `__bkit__` envelope is canonical SoT; DELETE per P3.T1a contract spec. |
| Two breaking changes (separate Cursor schema fix + reclass) | Bundle both in P3.T5 — one breaking change, not two.                                                  |

## Out of Scope

- Staging install / upgrade verb / helper action (sub-plan-4).
- Three-way merge UI for `bkit upgrade` conflicts (master OOS).

## Merge Method

Always squash. One PR for sub-plan-3 -> v0.8.x release. `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

| Existing artifact                                                              | Replaced by                  | Decision | Justification                                                                                                                       |
| ------------------------------------------------------------------------------ | ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `detectHooksConfigOverwriteRisk` blocker (`.agents/scripts/bkit-preflight.ts`) | Tier-2 deep-merge (P3.T1-T5) | DELETE   | Architecturally impossible once hooks are Tier-2; intra-file delete in P3.T7. P3.T1a contract spec confirms DELETE (NOT repurpose). |
| Tier-1 classification for `.cursor/hooks.json`                                 | `writeTier2Json` (P3.T3)     | DELETE   | Intra-classification delete; migration P3.T6 lifts old shape into `__bkit__` envelope.                                              |
| Tier-1 classification for `.claude/settings.json`                              | `writeTier2Json` (P3.T3)     | DELETE   | Intra-classification delete; migration P3.T6 lifts old shape into `__bkit__` envelope.                                              |

## Security & Privacy

- [ ] **New API route** — N/A.
- [ ] **New DB table/column** — N/A.
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — N/A in this sub-plan.
- [ ] **PII** — N/A.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — N/A.

## 🚨 Pre-Flight / Dependencies 🚨

### Cross-sub-plan dependencies

- **P3.T9 depends on sub-plan-2 P2.T8a** (`tests/fixtures/heavy-customised-consumer/` committed fixture). Sub-plan-3 cannot merge without sub-plan-2's fixture in tree.

### Core (always verify)

- [ ] **Package Management:** `package.json` verified; no new runtime deps required for v0.8.x. `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated` clean.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `.agents/templates/`, `tests/fixtures/`, `docs/`, `README.md`, `CHANGELOG.md`.
- [ ] **Pending Blockers:** Linear queried for `blocker` label scoped to BAR-142 §A1/B3.
- [ ] **Project Context:** `docs/knowledge.md` KN-8 (markers-as-SoT); `docs/decisions.md` reviewed.
- [ ] **Testing & Quality:** Strategy aligned with `docs/testing.md`.
- [ ] **Prerequisite Plans:** sub-plan-2 (`bar-131-related-bars-suite-plan-2.md`) MUST be merged first (P3.T9 -> P2.T8a fixture). Sub-plan-1 transitively required (sub-plan-2 depends on it).

### Conditional

- [ ] **Secrets & Env Vars** — N/A.
- [ ] **Schema State** — N/A.
- [ ] **Architecture & UI** — N/A (CLI only).
- [ ] **Observability** — no new error paths beyond existing modules.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked `[x]` above.
- [ ] **Breaking Changes confirmed:** Human checked `[x]` (both Major-Changes items).
- [ ] **Gate 1 - Verified:** All Core items checked. sub-plan-2 confirmed merged.

## Data Schema Integration

**None — no DB.**

## Architecture & Component Changes

| Tag      | File                                                       | Purpose                                                                                                                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [MODIFY] | `docs/decisions.md`                                        | P3.T0 spike outcome; `__bkit__` namespace contract decision.                                                                                                                                                                                                                                                             |
| [MODIFY] | `.agents/scripts/bkit-tiers.ts`                            | `deepMergeJson`, `extractBkitNamespace`, `applyBkitNamespace`, `writeTier2Json`, `migrateTier1JsonToTier2`.                                                                                                                                                                                                              |
| [MODIFY] | `.agents/scripts/bkit-tiers.test.ts`                       | Six concrete `.claude/settings.json` cases; `__bkit__` extraction; round-trip; migration.                                                                                                                                                                                                                                |
| [NEW]    | `.agents/scripts/bkit-tier1-defaults.ts`                   | **Versioned-defaults source-of-truth** (P3.T6a prerequisite). Exports `BKIT_TIER1_DEFAULTS_BY_VERSION: Record<semver, { '.claude/settings.json': JsonValue, '.cursor/hooks.json': JsonValue }>`. Snapshots committed at known prior versions (0.5.x, 0.6.x, 0.7.x). Sourced from `git show <tag>:.agents/templates/...`. |
| [NEW]    | `.agents/scripts/bkit-tier1-defaults.test.ts`              | Snapshot equality vs git-history-extracted JSON.                                                                                                                                                                                                                                                                         |
| [MODIFY] | `.agents/templates/.claude/settings.json`                  | Restructured payload with `__bkit__` envelope.                                                                                                                                                                                                                                                                           |
| [MODIFY] | `.agents/templates/.cursor/hooks.json`                     | Same; corrected schema if P3.T0 says so.                                                                                                                                                                                                                                                                                 |
| [MODIFY] | `.agents/scripts/bkit-modules.ts`                          | Claude/Cursor module dispatchers call `writeTier2Json`.                                                                                                                                                                                                                                                                  |
| [MODIFY] | `.agents/scripts/bkit-modules.test.ts`                     | Custom `hooks.Stop` + `loop_limit`/`failClosed` survive install.                                                                                                                                                                                                                                                         |
| [NEW]    | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` | Two-version upgrade; gether scenario. **References `tests/fixtures/heavy-customised-consumer/` from sub-plan-2 P2.T8a.**                                                                                                                                                                                                 |
| [MODIFY] | `.agents/scripts/bkit-preflight.ts`                        | Remove `detectHooksConfigOverwriteRisk` (P3.T7).                                                                                                                                                                                                                                                                         |
| [MODIFY] | `.agents/scripts/bkit-preflight.test.ts`                   | Remove obsolete tests; add Vercel CLI hang guard tests (B3).                                                                                                                                                                                                                                                             |
| [MODIFY] | `docs/knowledge.md`                                        | KN-8 update — Tier-2 deep-merge canonical for ownership-mixed JSON.                                                                                                                                                                                                                                                      |
| [MODIFY] | `README.md`                                                | `__bkit__` consumer-visible behaviour.                                                                                                                                                                                                                                                                                   |
| [MODIFY] | `CHANGELOG.md`                                             | v0.8.x entries.                                                                                                                                                                                                                                                                                                          |

## Documentation Updates

| File                | Change required                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/knowledge.md` | KN-8 update: Tier-2 deep-merge canonical for ownership-mixed JSON; markers-as-SoT (BAR-138 lesson) reinforced.                                                       |
| `docs/decisions.md` | (a) `__bkit__` namespace contract; (b) P3.T0 Cursor v1 schema spike outcome; (c) P3.T1a contract spec including `detectHooksConfigOverwriteRisk` DELETE disposition. |
| `README.md`         | `__bkit__` consumer-visible behaviour; migration notes.                                                                                                              |
| `CHANGELOG.md`      | v0.8.x bullets per closed task.                                                                                                                                      |
| `.agents/docs.md`   | Verify still accurate after sub-plan-3.                                                                                                                              |

## Rollback Strategy

| Axis            | Action                                                                                                              | Notes                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Code**        | `git revert <sub-plan-3 squash-merge SHA>`                                                                          | Single squash commit; revert is atomic.                                                                            |
| **Templates**   | Revert `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json` to pre-`__bkit__` shape | Consumers running new bkit against old templates: `writeTier2Json` errors loud with "missing `__bkit__` envelope". |
| **DB**          | N/A                                                                                                                 | No DB.                                                                                                             |
| **Risk window** | Single PR                                                                                                           | Per-phase revert window.                                                                                           |

## Agent Execution Runbook

> Continuous execution. Per-task fields: `Files`, `Depends on`, `Effort`, `Verify`, `Closes`.

### Phase 3 — v0.8.x (Major-Changes — human approval before PR opens)

- [x] **P3.T0:** Verify Cursor v1 hooks schema; record decision in `docs/decisions.md`. **P3.T0 acceptance must explicitly bless or veto `__bkit__` envelope shape** (if Cursor reserves a conflicting key, namespace must change). **Abort path:** if Cursor v1 schema is undocumented after reasonable web-search effort, agent issues a blocker Linear issue against BAR-142 and pauses Phase 3 entry — does NOT proceed to P3.T1a on guess.
  - Files: `docs/decisions.md`
  - Depends on: sub-plan-1 P0.T1
  - Effort: M
  - Verify: human review of decisions.md entry; record blesses-or-vetoes `__bkit__` shape
  - Closes: BAR-142 §A1 prerequisite
- [x] **P3.T1a (NEW — namespace contract spec):** One-page contract doc in `docs/decisions.md` defining `__bkit__` envelope shape, extractor semantics, bkit-owned-key predicate signature, AND **disposition for `detectHooksConfigOverwriteRisk` (DELETE — do not repurpose; rationale: detector becomes architecturally redundant once `__bkit__` envelope is canonical SoT)**. Output: stable type signatures in `bkit-tiers.ts`.
  - Files: `docs/decisions.md`, `.agents/scripts/bkit-tiers.ts`
  - Depends on: P3.T0
  - Effort: M
  - Verify: `pnpm typecheck` (type signatures compile); decisions.md entry reviewed
  - Closes: none (contract spec — unblocks P3.T1, P3.T2, P3.T7)
- [x] **P3.T1:** JSON `deepMergeJson` primitive (consumes contract from P3.T1a). Test six `.claude/settings.json` cases.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T1a
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (deep-merge primitive)
- [x] **P3.T2:** `__bkit__` namespace extractor/applier (`extractBkitNamespace`, `applyBkitNamespace`); restructure `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json` payloads.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`
  - Depends on: P3.T1a, P3.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (namespace extractor)
- [x] **P3.T3:** `writeTier2Json()` helper. Idempotent round-trip. **Acceptance: `writeTier2Json` MUST throw (not swallow) when the input lacks the `__bkit__` envelope; unit test asserts the throw with explicit message.** This guards rollback path (templates reverted to pre-`__bkit__` shape must error loudly, not corrupt silently).
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T2
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts` (covers both happy-path and missing-envelope throw)
  - Closes: BAR-142 §A1 (write helper)
- [x] **P3.T4:** Reclassify `.claude/settings.json` to Tier-2 (Claude module dispatcher).
  - Files: `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-modules.test.ts`
  - Depends on: P3.T3
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.test.ts`
  - Closes: BAR-142 §A1 (Claude reclass)
- [x] **P3.T5:** Reclassify `.cursor/hooks.json` to Tier-2; if P3.T0 vetoed shipped schema, fix it here (one breaking change, not two).
  - Files: `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-modules.test.ts`, `.agents/templates/.cursor/hooks.json`
  - Depends on: P3.T0, P3.T3
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.test.ts`
  - Closes: BAR-142 §A1 (Cursor reclass)
- [x] **P3.T6a (NEW — versioned defaults source-of-truth):** Create `.agents/scripts/bkit-tier1-defaults.ts` with `BKIT_TIER1_DEFAULTS_BY_VERSION` snapshots for prior versions (0.5.x, 0.6.x, 0.7.x), extracted from `git show <tag>:.agents/templates/.claude/settings.json` and `git show <tag>:.agents/templates/.cursor/hooks.json`. Test: snapshot equality vs git-history JSON.
  - Files: `.agents/scripts/bkit-tier1-defaults.ts`, `.agents/scripts/bkit-tier1-defaults.test.ts`
  - Depends on: sub-plan-1 P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tier1-defaults.test.ts`
  - Closes: none (migration prerequisite for P3.T6)
- [x] **P3.T6:** `migrateTier1JsonToTier2` consults `BKIT_TIER1_DEFAULTS_BY_VERSION` (P3.T6a) to identify previous bkit defaults; lifts into `__bkit__` envelope; idempotent on re-run.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T4, P3.T5, P3.T6a
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (migration)
- [x] **P3.T7:** Retire `detectHooksConfigOverwriteRisk` — **DELETE per P3.T1a contract spec (NOT repurposed)**. Remove obsolete tests. **v0.7.x interim disposition:** detector remains active until P3.T7 merges in v0.8.0; no back-port.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P3.T1a, P3.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §A1 (cleanup)
- [x] **P3.T8:** Vercel CLI hang guard (B3). **Concrete behaviour: pre-check `.vercel/project.json` and SKIP `vercel env ls` when file absent (do NOT shell out, do NOT depend on timeout heuristics).** Phase 3 work touches `bkit-preflight.ts` via P3.T7, so this is unconditional.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P3.T7
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §B3
- [x] **P3.T9:** Two-version upgrade-survival regression test (gether/fraser-coast fixture). Consumes `tests/fixtures/heavy-customised-consumer/` from sub-plan-2 P2.T8a.
  - Files: `.agents/scripts/bkit-modules.upgrade.integration.test.ts`, `tests/fixtures/heavy-customised-consumer/...` (referenced)
  - Depends on: sub-plan-2 P2.T8a (cross-sub-plan), P3.T6
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.upgrade.integration.test.ts`
  - Closes: BAR-142 §A1 (regression net)
- [x] **P3.T10:** KN-8 + decisions + README + CHANGELOG v0.8.x.
  - Files: `docs/knowledge.md`, `docs/decisions.md`, `README.md`, `CHANGELOG.md`
  - Depends on: P3.T1, P3.T2, P3.T3, P3.T4, P3.T5, P3.T6, P3.T6a, P3.T7, P3.T8, P3.T9
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)

- [ ] **🔒 Phase 3 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop`. Manual smoke against `tests/fixtures/heavy-customised-consumer/`: two-version upgrade -> consumer keys byte-identical, bkit keys current. **Major-Changes-bar items confirmed in `Breaking Changes & Naming Review` section.**

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every P3 task above checked off with explicit verification output.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** Every Test-Matrix row (sub-plan-3 scope) maps to a runbook task above.
- [ ] **Update existing tests:** Remove obsolete `detectHooksConfigOverwriteRisk` tests in P3.T7. No regression in `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Write new tests:** Per Derived Test Matrix.
- [ ] **Verify observability:** No new error paths beyond existing modules.
- [ ] **Update documentation:** `docs/knowledge.md` KN-8; `docs/decisions.md` `__bkit__` contract; README; CHANGELOG.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Documentation Updates table satisfied for v0.8.x.
- [ ] **Gate 3 - Verified:** All testing + doc boxes ticked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm lint:prose && pnpm lint:slop`.
- [ ] **Test Synchronization:** Re-run `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Build Configuration:** Verify integration tests auto-discovered via `pnpm vitest list`.
- [ ] **Unit Tests:** Per Test-Matrix unit rows.
- [ ] **Integration Tests:** `bkit-modules.upgrade.integration.test.ts`.
- [ ] **Run all tests:** `pnpm typecheck && pnpm vitest run`.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests boxes ticked; explicit proof captured.

### Manual Verification

- [ ] **Step 1:** Two-version upgrade on gether-shaped fixture: install bkit@A -> consumer adds custom `hooks.Stop` -> install bkit@B -> assert `hooks.Stop` byte-identical AND `SessionStart` updated.
- [ ] **Step 2:** Verify `detectHooksConfigOverwriteRisk` removed from `bkit-preflight.ts`; obsolete tests deleted.
- [ ] **Step 3:** Manually corrupt `.claude/settings.json` (remove `__bkit__` envelope) and confirm `writeTier2Json` throws with explicit message (rollback safety).
