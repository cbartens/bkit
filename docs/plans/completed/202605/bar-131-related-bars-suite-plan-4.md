Verdict: PASS
<!-- verdict:end -->

# Sub-plan 4 — P4 (v0.9.x to v1.0): Transactional install + `bkit upgrade` verb + helper action

**Parent Plan:** [`bar-131-related-bars-suite-plan.md`](./bar-131-related-bars-suite-plan.md) (master source: [`plan-v3-checked.md`](./plan-v3-checked.md))

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-131-related-bars-suite-plan-4.md` natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes here.

> [!WARNING]
> **NOT independently shippable.** sub-plan-4 depends on sub-plan-2 (P4.T4 -> P2.T3 `.bkit-version` schema; P4.T7 -> P2.T8a fixture) AND sub-plan-3 (P4.T1 -> P3.T3 `writeTier2Json`; P4.T5 -> P3.T6 migration). Both MUST be merged before sub-plan-4 begins.

## Context & Goals

Phase 4 ships v0.9.x then v1.0: transactional install via staging dir (`.bkit-staging/<module>/`), atomic-rename per module, `bkit upgrade` CLI verb with diff engine + non-interactive auto-apply, BAR-131 helper-action `setup-auth@v1` composite action, and final v1 tag.

**Success Criteria:**

- `bkit install` mid-failure leaves consumer files untouched (staging dir discarded).
- `pnpm bkit upgrade` from `0.4.x` -> `0.5.x` against a customised `.cursor/hooks.json` does NOT silently overwrite consumer drift.
- `setup-auth@v1` composite action wraps PAT-shim using `BKIT_READ_TOKEN`; offline YAML parse + manual GitHub Actions smoke green.
- `v1` tag pushed post-merge; `uses: cbartens/bkit/.github/actions/setup-auth@v1` resolves in consumers.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.** Inherited from master, scoped to sub-plan-4.

### Narrative

A consumer maintainer of a heavily-customised repo upgrades to `bkit@1.0`. `bkit install` is now transactional: failures discard staging without touching consumer files. `bkit upgrade` diffs old vs new templates against customised JSON and prints conflicts to stderr without overwriting drift. Their CI workflow uses the new `cbartens/bkit/.github/actions/setup-auth@v1` composite step instead of the multi-line bash PAT shim.

### Success Criteria

- Mid-failure rollback: `bkit install --full` SIGTERM after first module -> consumer `git diff` empty.
- `bkit upgrade` non-interactive auto-apply mode preserves consumer drift; conflict list emitted to stderr.
- `bkit-action-yaml.test.ts` parses `.github/actions/setup-auth/action.yml` offline and asserts inputs (`token`, `registry`).
- Manual GitHub Actions smoke on a test consumer fork passes (post-`v1`-tag).
- `v1` tag pushed atomically post-merge.

### Concrete Example

**Setup:** scratch consumer at `bkit@0.8.0` (sub-plan-3 shipped) with `--full` modules previously installed, customised `.cursor/hooks.json` (`failClosed`, `loop_limit`).

**Steps:**

1. `pnpm add -D @cbartens/bkit@0.9.0`.
2. Start `pnpm bkit install --full`; SIGTERM after first module completes -> staging dir discarded; consumer files untouched.
3. Re-run `pnpm bkit install --full` -> green; `.bkit-version` records `canonicalHashes`.
4. `pnpm bkit upgrade` -> diff engine prints conflict list for `loop_limit`; consumer drift NOT overwritten.
5. Update `.agents/templates/.github/workflows/ci.yml` to `uses: cbartens/bkit/.github/actions/setup-auth@v1`; manual GitHub Actions smoke on consumer fork passes.
6. Post-merge: agent creates + pushes `v1` annotated tag.

**Outcome:** Transactional install ships; upgrade verb non-destructive; helper action consumed by CI; v1.0 released.

### Edge Cases

| Scenario | Expected Behavior |
| --- | --- |
| Concurrent `bkit install` mid-failure | Staging dir discarded, consumer files untouched |
| `.bkit-version` retro-fit (consumer pre-dates `canonicalHashes`) | Treat as unknown -> backward-compat read |
| Cursor v1 schema differs from bkit's shipped shape | Sub-plan-3 P3.T0 spike already addressed; this sub-plan inherits |
| `bkit upgrade --non-interactive` with conflicts | Auto-apply non-conflicting; emit conflict list to stderr; exit non-zero |
| Tag `v1` not pushed | `uses: cbartens/bkit/.github/actions/setup-auth@v1` fails to resolve in consumers — sub-task in P4.T8 mandatory |

### Derived Test Matrix

| Test description | Runbook task | Type | Target file |
| --- | --- | --- | --- |
| Staging dir + atomic rename | P4.T1, P4.T2 | Unit (Vitest) | `.agents/scripts/bkit-install.test.ts` |
| Mid-failure rollback fixture | P4.T3 | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| `.bkit-version` `canonicalHashes` (additive) | P4.T4 | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| `bkit upgrade` diff engine | P4.T5 | Unit (Vitest) | `.agents/scripts/bkit-upgrade.test.ts` |
| `--non-interactive` upgrade auto-apply | P4.T6 | Unit (Vitest) | `.agents/scripts/bkit-upgrade.test.ts` |
| Upgrade integration (customised hooks scenario) | P4.T7 | Integration (Vitest) | `.agents/scripts/bkit-upgrade.integration.test.ts` |
| `setup-auth/action.yml` schema parse (offline) | P4.T8 | Unit (Vitest) | `.agents/scripts/bkit-action-yaml.test.ts` |
| `setup-auth@v1` composite action smoke | P4.T8 | Manual (CI) | `.github/workflows/test-action.yml` |

### 👤 Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe "done" for sub-plan-4.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until the checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

**None.** Sub-plan-4 ships only additive surface (`bkit upgrade` verb, transactional install internals, `setup-auth` composite action). `.bkit-version` `canonicalHashes` field is additive (backward-compat read for old payloads). No Major-Changes-bar items.

> Note: the multi-line bash PAT-shim block in seeded `ci.yml` is RETAIN-WITH-REASON (external contract — bash fallback retained for non-Actions CI). Kill-date: v1.1.0.

### 👤 Human Confirmation

- [ ] **Breaking Changes confirmed:** No Major-Changes items; reviewed and approved.

---

## Alternative Approaches & Recommendations

| Rejected approach | Why rejected |
| --- | --- |
| Three-way merge UI for `bkit upgrade` | Out-of-scope; conflict list to stderr is sufficient for v1.0. |
| Bundle helper action into sub-plan-3 | Architecturally orthogonal; helper action depends on `.bkit-version` schema (sub-plan-2) and consumer ship pattern; clean fit in sub-plan-4. |
| Remove bash PAT-shim block from seeded `ci.yml` | External contract — non-Actions CI consumers rely on it. RETAIN-WITH-REASON kill-date v1.1.0. |

**Future recommendations:** post-v1.0, consider a `bkit init` scaffolder; npm-registry distribution; factory-reset uninstall mode.

## Out of Scope

- Three-way merge UI for upgrade conflicts.
- npm-registry distribution.
- Factory-reset uninstall mode.
- Removal of bash PAT-shim block (RETAIN-WITH-REASON kill-date v1.1.0).

## Merge Method

Always squash. One PR for sub-plan-4 -> v0.9.x release; v1.0 tag is a sub-step inside P4.T8/Phase 4 Gate (NOT a separate PR). `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Multi-line bash PAT-shim block in seeded `ci.yml` | `setup-auth@v1` action (P4.T8) | RETAIN-WITH-REASON | External contract — bash fallback retained for non-Actions CI. **Kill-date: v1.1.0** (follow-up issue post-v1.0 ship). |

## Security & Privacy

- [ ] **New API route** — N/A.
- [ ] **New DB table/column** — N/A.
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — N/A in this sub-plan beyond `.bkitignore` already shipped in sub-plan-2.
- [ ] **PII** — N/A.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — `BKIT_READ_TOKEN` consumed by helper action (already documented secret).

## 🚨 Pre-Flight / Dependencies 🚨

### Cross-sub-plan dependencies (HARD BLOCKERS)

- **P4.T1 depends on sub-plan-3 P3.T3** (`writeTier2Json` staging-dir compatible write path).
- **P4.T4 depends on sub-plan-2 P2.T3** (`.bkit-version` schema must exist before extending with `canonicalHashes`).
- **P4.T5 depends on sub-plan-3 P3.T6** (migration prerequisite for upgrade engine).
- **P4.T7 depends on sub-plan-2 P2.T8a** (`tests/fixtures/heavy-customised-consumer/` committed fixture). If fixture missing, must back-port from sub-plan-2.

Sub-plan-4 is NOT independently shippable. sub-plan-2 AND sub-plan-3 MUST be merged before sub-plan-4 begins.

### Core (always verify)

- [ ] **Package Management:** `package.json` verified; no new runtime deps. `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated` clean.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `.agents/templates/`, `.github/actions/`, `.github/workflows/`, `tests/fixtures/`, `docs/`, `README.md`, `CHANGELOG.md`.
- [ ] **Pending Blockers:** Linear queried for `blocker` label scoped to BAR-142 §A4/A5 + BAR-131 helper action.
- [ ] **Project Context:** `docs/knowledge.md` / `docs/decisions.md` reviewed.
- [ ] **Testing & Quality:** Strategy aligned with `docs/testing.md`.
- [ ] **Prerequisite Plans:** sub-plan-2 (`bar-131-related-bars-suite-plan-2.md`) AND sub-plan-3 (`bar-131-related-bars-suite-plan-3.md`) MUST be merged. Sub-plan-1 transitively required.

### Conditional

- [ ] **Secrets & Env Vars** — `BKIT_READ_TOKEN` already documented; no new secret.
- [ ] **Schema State** — N/A (no DB).
- [ ] **Architecture & UI** — N/A (CLI + GitHub composite action only).
- [ ] **Observability** — `console.error("[bkit-upgrade] …", payload)` for error paths in new upgrade module per `docs/observability.md`.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked `[x]` above.
- [ ] **Breaking Changes confirmed:** Human checked `[x]` (no Major-Changes items).
- [ ] **Gate 1 - Verified:** All Core items checked. sub-plan-2 AND sub-plan-3 confirmed merged.

## Data Schema Integration

**None — no DB.** `.bkit-version` extended additively in P4.T4 (`canonicalHashes`); backward-compat read for old payloads.

## Architecture & Component Changes

| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | Staging-aware write wrapper; `commitStaging`/`discardStaging`; record canonical-file hashes on write. |
| [MODIFY] | `.agents/scripts/bkit-install.test.ts` | Staging + atomic-rename + error-path assertions. |
| [MODIFY] | `.agents/scripts/bkit-install.integration.test.ts` | Mid-failure rollback fixture; SIGTERM-after-first-module fixture. |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Pass staging dir to module dispatcher. |
| [MODIFY] | `.agents/scripts/bkit-version.ts` | Extend (already [NEW] in sub-plan-2 P2.T3) — additive `canonicalHashes` field. |
| [MODIFY] | `.agents/scripts/bkit-version.test.ts` | Backward-compat with absent field. |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | Register `upgrade` verb. |
| [NEW] | `.agents/scripts/bkit-upgrade.ts` | Orchestrator + diff engine; `--non-interactive` flag. |
| [NEW] | `.agents/scripts/bkit-upgrade.test.ts` | Diff engine; conflict abort; auto-apply. |
| [NEW] | `.agents/scripts/bkit-upgrade.integration.test.ts` | 0.4.x -> 0.5.x customised hooks scenario. |
| [NEW] | `.github/actions/setup-auth/action.yml` | Composite action wraps PAT-shim using `BKIT_READ_TOKEN`. |
| [MODIFY] | `.agents/templates/.github/workflows/ci.yml` | Update step to `uses: cbartens/bkit/.github/actions/setup-auth@v1`. |
| [NEW] | `.github/workflows/test-action.yml` | Meta-test invokes the action. Manual GitHub Actions smoke at gate. |
| [NEW] | `.agents/scripts/bkit-action-yaml.test.ts` | Offline acceptance: parse `action.yml`, assert valid YAML schema + expected inputs (`token`, `registry`). |
| [MODIFY] | `README.md` | Upgrade / Transactional install / Helper action sections. |
| [MODIFY] | `docs/decisions.md` | Staging-dir architecture; `.bkit-version` schema extension. |
| [MODIFY] | `CHANGELOG.md` | v0.9.x and v1.0 entries. |

## Documentation Updates

| File | Change required |
| --- | --- |
| `README.md` | Upgrade + Transactional install + Helper action sections. |
| `docs/decisions.md` | Staging-dir architecture; `.bkit-version` `canonicalHashes` extension. |
| `docs/knowledge.md` | Transactional-install learnings. |
| `CHANGELOG.md` | v0.9.x and v1.0 bullets per closed task. |
| `.agents/docs.md` | Verify still accurate after sub-plan-4. |

## Rollback Strategy

| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert <sub-plan-4 squash-merge SHA>` | Single squash commit; revert is atomic. Note: `v1` tag must also be deleted/moved if revert post-tag. |
| **`.bkit-version`** | `canonicalHashes` extension is additive | Old code reads new file via backward-compat reader. |
| **Helper action** | `v1` tag deletion (`git push origin :refs/tags/v1`) | Consumers using `@v1` will fail to resolve until next ship; bash fallback retained. |
| **DB** | N/A | No DB. |
| **Risk window** | Single PR + tag | Per-phase revert window. |

## Agent Execution Runbook

> Continuous execution. Per-task fields: `Files`, `Depends on`, `Effort`, `Verify`, `Closes`.

### Phase 4 — v0.9.x to v1.0

> **Cross-sub-plan dep reminder:** sub-plan-4 is NOT independently shippable. P4.T1 -> sub-plan-3 P3.T3; P4.T4 -> sub-plan-2 P2.T3.

- [x] **P4.T1:** `.bkit-staging/<module>/` write path. Staging-aware write wrapper.
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.test.ts`, `.agents/scripts/bkit-modules.ts`
  - Depends on: sub-plan-3 P3.T3 (cross-sub-plan)
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.test.ts`
  - Closes: BAR-142 §A4 (staging foundation)
- [x] **P4.T2:** Validate-then-atomic-rename per module. `commitStaging` / `discardStaging`.
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.test.ts`
  - Depends on: P4.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.test.ts`
  - Closes: BAR-142 §A4 (commit/discard)
- [x] **P4.T3:** Mid-failure rollback test fixtures (reproduce 0.5.0 `bkit-design-organise` lookup-miss); SIGTERM-after-first-module fixture.
  - Files: `.agents/scripts/bkit-install.integration.test.ts`
  - Depends on: P4.T2
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`
  - Closes: BAR-142 §A4 (regression net)
- [x] **P4.T4:** `.bkit-version` `canonicalHashes` field (additive); backward-compat read for old payloads.
  - Files: `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-version.test.ts`
  - Depends on: sub-plan-2 P2.T3 (cross-sub-plan)
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-version.test.ts`
  - Closes: BAR-142 §A5 (schema extension)
- [x] **P4.T5:** `bkit upgrade` CLI verb + diff engine.
  - Files: `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-upgrade.ts`, `.agents/scripts/bkit-upgrade.test.ts`
  - Depends on: P4.T4, sub-plan-3 P3.T6 (cross-sub-plan)
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`
  - Closes: BAR-142 §A5 (upgrade verb)
- [x] **P4.T6:** `--non-interactive` upgrade auto-apply.
  - Files: `.agents/scripts/bkit-upgrade.ts`, `.agents/scripts/bkit-upgrade.test.ts`
  - Depends on: P4.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`
  - Closes: BAR-142 §A5 (non-interactive)
- [x] **P4.T7:** Upgrade integration test (0.4.x -> 0.5.x customised hooks).
  - Files: `.agents/scripts/bkit-upgrade.integration.test.ts`, `tests/fixtures/heavy-customised-consumer/...` (referenced)
  - Depends on: P4.T5, sub-plan-2 P2.T8a (cross-sub-plan)
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.integration.test.ts`
  - Closes: BAR-142 §A5 (regression net)
- [x] **P4.T8:** BAR-131 helper-action `setup-auth@v1` at `.github/actions/setup-auth/action.yml`. Update `.agents/templates/.github/workflows/ci.yml` step to `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Add `.github/workflows/test-action.yml` meta-test. Add **offline acceptance**: Vitest-level YAML schema/parse test in `.agents/scripts/bkit-action-yaml.test.ts` asserting `action.yml` parses + has expected `inputs` (`token`, `registry`). **Tag step (sub-task):** after sub-plan-4 squash-merge lands on default branch, create + push annotated tag `v1` pointing to that commit (`gh release create v1 --target <SHA> --title 'setup-auth@v1'` OR `git tag -a v1 -m 'setup-auth helper action v1' <SHA> && git push origin v1`). Without the `v1` tag, `uses: cbartens/bkit/.github/actions/setup-auth@v1` fails to resolve in consumers. Manual GitHub Actions smoke at gate-time.
  - Files: `.github/actions/setup-auth/action.yml`, `.agents/templates/.github/workflows/ci.yml`, `.github/workflows/test-action.yml`, `.agents/scripts/bkit-action-yaml.test.ts`
  - Depends on: sub-plan-1 P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-action-yaml.test.ts`; manual GitHub Actions smoke on test consumer fork (post-tag)
  - Closes: BAR-131 §1 (helper action stretch)
- [x] **P4.T9:** README + CHANGELOG v0.9/v1.0 + `docs/decisions.md` + `docs/knowledge.md`.
  - Files: `README.md`, `CHANGELOG.md`, `docs/decisions.md`, `docs/knowledge.md`
  - Depends on: P4.T1, P4.T2, P4.T3, P4.T4, P4.T5, P4.T6, P4.T7, P4.T8
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)

- [ ] **🔒 Phase 4 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + scripted SIGTERM fixture: `start bkit install --full -> SIGTERM after first module -> assert consumer git-diff clean`. End-to-end upgrade test against `tests/fixtures/heavy-customised-consumer/` confirms no silent overwrites. Post-merge: `v1` tag pushed.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every P4 task above checked off with explicit verification output.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** Every Test-Matrix row (sub-plan-4 scope) maps to a runbook task above.
- [ ] **Update existing tests:** No regression in `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Write new tests:** Per Derived Test Matrix.
- [ ] **Verify observability:** `console.error("[bkit-upgrade] …", payload)` for error paths in new upgrade module.
- [ ] **Update documentation:** `docs/decisions.md` (staging + `.bkit-version` ext); `docs/knowledge.md` (transactional install learnings); README; CHANGELOG.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Documentation Updates table satisfied for v0.9.x/v1.0.
- [ ] **Gate 3 - Verified:** All testing + doc boxes ticked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm lint:prose && pnpm lint:slop`.
- [ ] **Test Synchronization:** Re-run `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Build Configuration:** Verify integration tests auto-discovered via `pnpm vitest list`.
- [ ] **Unit Tests:** Per Test-Matrix unit rows.
- [ ] **Integration Tests:** Per Test-Matrix integration rows including `bkit-upgrade.integration.test.ts`.
- [ ] **Run all tests:** `pnpm typecheck && pnpm vitest run`.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests boxes ticked; explicit proof captured.

### Manual Verification

- [ ] **Step 1:** Start `bkit install --full`, send SIGTERM after first module completes; verify consumer `git diff` empty.
- [ ] **Step 2:** Run `bkit upgrade` on customised hooks fixture; verify no silent overwrite; conflict list emitted to stderr.
- [ ] **Step 3:** Manual GitHub Actions run on a test consumer fork to verify `setup-auth@v1` composite action.
- [ ] **Step 4 (post-merge):** Create + push annotated `v1` tag pointing to sub-plan-4 squash-merge commit. Verify `gh api repos/cbartens/bkit/git/refs/tags/v1` returns the tag.
