Verdict: PASS
<!-- verdict:end -->

# Sub-plan 1 — P0 + P1 (v0.6.x): Test-infra prerequisite + `bkit doctor` + polish

**Parent Plan:** [`bar-131-related-bars-suite-plan.md`](./bar-131-related-bars-suite-plan.md) (master source: [`plan-v3-checked.md`](./plan-v3-checked.md))

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-131-related-bars-suite-plan-1.md` natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes here.

## Context & Goals

Phase 0 is the test-infra prerequisite (vitest glob extension) required before any integration test is authored across the umbrella plan. Phase 1 ships v0.6.x: `bkit doctor` verb (read-only preflight + post-install replay), polish fixes (B1-B6), and the `CHANGELOG.md` surface (A7).

**Success Criteria:**

- `pnpm bkit doctor` exits 0 and prints unified preflight + post-install advisories on a stale-pin scratch repo.
- Polish fixes B1 (line-anchored marker regex), B2 (position-stable cross-phase dedup), B4 (empty-vs-unset shell token), B5 (LOG_PREFIX dry-run), B6 (`.npmrc` `${VAR:-}` fallback + concrete one-liner action text) all land green.
- `CHANGELOG.md` exists, is shipped in tarball (via `package.json` `files`), and surfaces a version-delta header in post-install.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.** Inherited verbatim from master.

### Narrative

A consumer maintainer of a heavily-customised repo upgrades `@cbartens/bkit` to v0.6.x, runs `pnpm bkit doctor`, and receives unified preflight + post-install advisories without writes; polish fixes (anchored markers, empty-vs-unset shell token, LOG_PREFIX, `.npmrc` fallback) eliminate false positives and false-greens noticed in earlier minor versions.

### Success Criteria

- `pnpm bkit doctor` exits 0 and prints unified preflight + post-install advisories on a stale-pin scratch repo.
- Anchored marker regex correctly skips prose-fenced fixtures (B1).
- `detectShellToken` differentiates `unset` from empty-string (B4).
- Dry-run blocker banner is `LOG_PREFIX`-prefixed (B5).
- `.npmrc` literal in `.agents/scripts/bkit-modules.ts` uses `${GH_BKIT_TOKEN:-}` fallback iff pnpm supports it; action text instructs `export GH_BKIT_TOKEN=$(gh auth token)` (B6).
- Cross-phase dedup in `runPostInstallCheck` is position-stable (B2).
- Post-install surfaces a changelog version-delta header (A7).

### Concrete Example

**Setup:** scratch consumer at `bkit@0.5.0`, no customisations beyond bkit defaults.

**Steps:**

1. `pnpm add -D @cbartens/bkit@0.6.0` (no `bkit install` yet).
2. `pnpm bkit doctor` -> prints `bkit-version-pin-stale` advisory; exits 0.
3. `pnpm bkit install --core` -> dry-run banner is `LOG_PREFIX`-prefixed; post-install includes changelog header diff.

**Outcome:** doctor verb works read-only; polish fixes silence false positives; CHANGELOG ships in tarball.

### Edge Cases

| Scenario | Expected Behavior |
| --- | --- |
| `bkit doctor` against producer repo | Exits 0; banner printed |
| `detectShellToken` empty (`GH_BKIT_TOKEN=""`) vs unset | Action text differentiates |
| pnpm 10 onlyBuiltDependencies missing | Already advised — no change |
| Prose-fenced `bkit:start` text inside markdown | NOT detected as marker (B1 anchoring) |

### Derived Test Matrix

| Test description | Runbook task | Type | Target file |
| --- | --- | --- | --- |
| `hasBkitMarkers` line-anchored regex | P1.T2 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| Cross-phase dedup position-stable | P1.T3 | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `detectShellToken` empty vs unset | P1.T4 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `LOG_PREFIX` on dry-run blocker banner | P1.T5 | Unit (Vitest) | `.agents/scripts/bkit-install.test.ts` |
| `.npmrc` inline-string action text + fallback | P1.T6 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| Changelog header diff in post-install | P1.T7 | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `bkit doctor` integration on stale-pin fixture | P1.T1 | Integration (Vitest) | `.agents/scripts/bkit-doctor.integration.test.ts` |

### 👤 Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe "done" for sub-plan-1.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until the checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

**None.** Sub-plan-1 ships only additive surface (`bkit doctor` verb), polish fixes, and `CHANGELOG.md` skeleton. No Major-Changes items in v0.6.x.

### 👤 Human Confirmation

- [ ] **Breaking Changes confirmed:** No Major-Changes items in this sub-plan; reviewed and approved.

---

## Alternative Approaches & Recommendations

| Rejected approach | Why rejected |
| --- | --- |
| Bundle `doctor` verb with Phase 2 uninstall | Loses independent ship; inflates Phase 2 risk; doctor is read-only and low-risk. |
| Skip vitest glob extension | Integration tests would silently skip in P1+ (false-greens at gates). |
| Hand-list `.npmrc` literal locations | `bkit-modules.ts` lines ~367-369 and ~549-552 verified — agent edits both. |

## Out of Scope

- Uninstall verb (sub-plan-2).
- Tier-2 deep-merge (sub-plan-3).
- Staging install / upgrade verb / helper action (sub-plan-4).

## Merge Method

Always squash. One PR for sub-plan-1 -> v0.6.x release. `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `hasBkitMarkers` substring impl | Anchored regex (P1.T2) | DELETE | Intra-file delete (function body replaced; `bkit-preflight.ts` survives). |

## Security & Privacy

- [ ] **New API route** — N/A.
- [ ] **New DB table/column** — N/A.
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — N/A in this sub-plan.
- [ ] **PII** — N/A.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — N/A (`GH_BKIT_TOKEN` already documented).

## 🚨 Pre-Flight / Dependencies 🚨

### Cross-sub-plan dependencies

**None.** This is the foundation sub-plan. Sub-plan-2 P2.T11 depends on P1.T1 (doctor verb) — that dependency is recorded in sub-plan-2's Pre-Flight, not here.

### Core (always verify)

- [ ] **Package Management:** `package.json` verified; no new runtime deps required for v0.6.x. `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated` clean; pnpm 10 confirmed; tsx version current.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `docs/`, `README.md`, `CHANGELOG.md`, `vitest.config.ts`, `package.json`.
- [ ] **Pending Blockers:** Linear queried for `blocker` label scoped to BAR-142 §A3/A7/B1-B6.
- [ ] **Project Context:** `docs/knowledge.md` KN-8 reviewed; BAR-138 lesson on whitespace-greedy regex incorporated for P1.T2.
- [ ] **Testing & Quality:** Strategy aligned with `docs/testing.md` — Vitest for all units + integration.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars** — N/A.
- [ ] **Schema State** — N/A.
- [ ] **Architecture & UI** — N/A (CLI only).
- [ ] **Observability** — no new error paths in this sub-plan.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked `[x]` above.
- [ ] **Breaking Changes confirmed:** Human checked `[x]` above.
- [ ] **Gate 1 - Verified:** All Core items checked.

## Data Schema Integration

**None — no DB.** bkit is a CLI tool.

## Architecture & Component Changes

> All paths relative to repo root. Existence verified via `find .agents/scripts/`. `.agents/templates/...` is the canonical template root.

### Phase 0 — Test-infra prerequisite

| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `vitest.config.ts` | Extend include glob from `.agents/scripts/**/*.test.ts` to `[".agents/scripts/**/*.test.ts", ".agents/scripts/**/*.integration.test.ts"]`. |

### Phase 1 — Quick wins + diagnostic

| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | Add `doctor` to `Verb` union; arg parse; `printUsage`. |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | `main()` dispatch arm for `doctor`; LOG_PREFIX on dry-run banner (B5). |
| [MODIFY] | `.agents/scripts/bkit-postinstall.ts` | Expose `runPostInstallCheck(modules, cwd, { dryRun: true })` read-only replay; cross-phase dedup position-stable (B2); changelog version-delta header (A7). |
| [MODIFY] | `.agents/scripts/bkit-preflight.ts` | Anchor `hasBkitMarkers` (B1); `detectShellToken` empty vs unset (B4); update `gh-bkit-token-secret-unknown` action text (B6). |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Edit inline `.npmrc` literal (lines ~367-369 and ~549-552) to use `${GH_BKIT_TOKEN:-}` fallback iff pnpm supports it (B6). |
| [NEW] | `.agents/scripts/bkit-doctor.integration.test.ts` | Stale-pin fixture; assert exit 0 + banner content. |
| [MODIFY] | `.agents/scripts/bkit-cli.test.ts` | Verb parsing for `doctor`. |
| [MODIFY] | `.agents/scripts/bkit-preflight.test.ts` | New fixtures for B1/B4/B6. |
| [MODIFY] | `.agents/scripts/bkit-postinstall.test.ts` | Position-stable dedup; changelog header. |
| [MODIFY] | `.agents/scripts/bkit-install.test.ts` | LOG_PREFIX dry-run assertion. |
| [NEW] | `CHANGELOG.md` | Created in P1.T0 (skeleton); v0.6.x section seeded. |
| [MODIFY] | `package.json` | Ensure `files` array includes `CHANGELOG.md`. |
| [MODIFY] | `README.md` | Doctor usage section. |

## Documentation Updates

| File | Change required |
| --- | --- |
| `README.md` | Doctor (P1) usage section. |
| `CHANGELOG.md` | v0.6.x bullets per closed task. |
| `.agents/docs.md` | Verify still accurate after sub-plan-1. |

## Rollback Strategy

| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert <sub-plan-1 squash-merge SHA>` | Single squash commit; revert is atomic. |
| **`vitest.config.ts`** | Revert to single-glob form | Old glob still discovers `.test.ts`; integration tests silently skip but no failure. |
| **DB** | N/A | No DB. |
| **Risk window** | Single PR | Revert window = single PR. |

## Agent Execution Runbook

> Continuous execution. Do not pause for user permission at any Gate. Tick `[x]` as each task completes.
>
> Per-task fields: `Files`, `Depends on`, `Effort` (S | M | L), `Verify`, `Closes`.

### Phase 0 — Test-infra prerequisite

- [ ] **P0.T0:** Append OOS items from this plan to `docs/pending.md` (already complete in v3 commit; this task confirms append landed and re-runs only if missing). NOT relying on summariser hand-off.
  - Files: `docs/pending.md`
  - Depends on: none
  - Effort: S
  - Verify: `grep -q "Deferred from bar-131-related-bars-suite plan" docs/pending.md`
  - Closes: none (internal — plan summariser fallback)
- [ ] **P0.T1:** Extend `vitest.config.ts` include glob to match both `*.test.ts` and `*.integration.test.ts`. Required BEFORE any integration test added in P1+ (otherwise tests silently skip and gates produce false-greens).
  - Files: `vitest.config.ts`
  - Depends on: none
  - Effort: S
  - Verify: `pnpm vitest list 2>&1 | grep -q "integration.test.ts" || (echo "no integration tests discovered" && exit 1)` (run after at least one `*.integration.test.ts` exists; until then, assert the glob string itself: `grep -q "integration.test.ts" vitest.config.ts`)
  - Closes: none (internal)

### Phase 1 — v0.6.x

- [ ] **P1.T0:** Create `CHANGELOG.md` skeleton at repo root; add v0.6.x section header. Add `CHANGELOG.md` to `package.json` `files` array.
  - Files: `CHANGELOG.md`, `package.json`
  - Depends on: P0.T1
  - Effort: S
  - Verify: `pnpm pack --dry-run | grep -q CHANGELOG.md`
  - Closes: BAR-142 §A7 (prerequisite)
- [ ] **P1.T1:** Register `doctor` verb in `bkit-cli.ts`. Wire `main()` switch in `bkit-install.ts`. Expose pure-read replay in `bkit-postinstall.ts` with signature **`runPostInstallCheck(modules: ModuleSet, cwd: string, opts: { dryRun: true })`** — re-evaluates post-install detectors without writes; reuses existing detector entry points from `bkit-postinstall.ts`. New integration test `bkit-doctor.integration.test.ts`.
  - Files: `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-cli.test.ts`, `.agents/scripts/bkit-doctor.integration.test.ts`
  - Depends on: P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-cli.test.ts .agents/scripts/bkit-doctor.integration.test.ts`
  - Closes: BAR-142 §A3
- [ ] **P1.T2:** Replace `hasBkitMarkers` substring check with line-anchored regex matching `findLineAnchoredMarkers`. Add prose-fenced fixture.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P0.T1
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §B1
- [ ] **P1.T3:** Position-stable cross-phase dedup in `runPostInstallCheck`.
  - Files: `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`
  - Depends on: P1.T1
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-postinstall.test.ts`
  - Closes: BAR-142 §B2
- [ ] **P1.T4:** Differentiate `unset` vs empty-string in `detectShellToken`.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P0.T1
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §B4
- [ ] **P1.T5:** Prepend `LOG_PREFIX` to dry-run blocker banner.
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.test.ts`
  - Depends on: P0.T1
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.test.ts`
  - Closes: BAR-142 §B5
- [ ] **P1.T6:** (a) Update `gh-bkit-token-secret-unknown` action text in `bkit-preflight.ts` to instruct concrete one-liner: `export GH_BKIT_TOKEN=$(gh auth token)` (test asserts on this exact substring). (b) Investigate POSIX `${VAR:-}` fallback in pnpm `.npmrc`; if supported, **edit inline string in `.agents/scripts/bkit-modules.ts` lines ~367-369 AND ~549-552** (NOT a top-level `templates/.npmrc` — no such file).
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`; manual `pnpm install` in shell without token (no warning)
  - Closes: BAR-142 §B6
- [ ] **P1.T7:** Changelog version-delta header in `bkit-postinstall.ts`.
  - Files: `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`
  - Depends on: P1.T0
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-postinstall.test.ts`
  - Closes: BAR-142 §A7
- [ ] **P1.T8:** README "Doctor" section + help-text rollup. CHANGELOG v0.6.x bullets per closed task.
  - Files: `README.md`, `CHANGELOG.md`
  - Depends on: P1.T1, P1.T2, P1.T3, P1.T4, P1.T5, P1.T6, P1.T7
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)

- [ ] **🔒 Phase 1 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm tsx .agents/scripts/bkit-install.ts doctor` (against the producer repo itself — note: producer entrypoint is `pnpm tsx .agents/scripts/bkit-install.ts <verb>`, NOT `pnpm exec bkit`).

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every P0/P1 task above checked off with explicit verification output.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** Every Test-Matrix row (sub-plan-1 scope) maps to a runbook task above; confirm none uncovered.
- [ ] **Update existing tests:** No regression in `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Write new tests:** Per Derived Test Matrix; per `docs/testing.md`.
- [ ] **Verify observability:** No new error paths introduced in this sub-plan.
- [ ] **Update documentation:** README + CHANGELOG only (no `docs/decisions.md` or `docs/knowledge.md` changes in v0.6.x).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Documentation Updates table satisfied for v0.6.x.
- [ ] **Gate 3 - Verified:** All testing + doc boxes ticked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm lint:prose`.
- [ ] **Test Synchronization:** Re-run `bkit-dry-run-parity.integration.test.ts`; should remain green.
- [ ] **Build Configuration:** Vitest include glob extended in P0.T1. Verify via `pnpm vitest list`.
- [ ] **Unit Tests:** Per Test-Matrix unit rows.
- [ ] **Integration Tests:** `bkit-doctor.integration.test.ts`.
- [ ] **Run all tests:** `pnpm typecheck && pnpm vitest run`. Fix all failures before Gate 4.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests boxes ticked; explicit proof captured.

### Manual Verification

- [ ] **Step 1:** Run `pnpm tsx .agents/scripts/bkit-install.ts doctor` against producer repo; verify exit 0 and banner.
