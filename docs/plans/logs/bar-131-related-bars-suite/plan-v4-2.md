Verdict: PASS

<!-- verdict:end -->

# Sub-plan 2 — P2 (v0.7.x): `bkit uninstall` recovery primitive + Phase 3 exit-1 + `.bkitignore`

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md) (master source: [`plan-v3-checked.md`](./plan-v3-checked.md))

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan-v4-2.md` natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes here.

## Context & Goals

Phase 2 ships v0.7.x: surgical `bkit uninstall` recovery primitive, `process.exit(1)` on Phase 3 blockers with recovery line, `--auto-revert` install flag, `.bkit-version` schema extension (`tier3Hashes`), and `.bkitignore` parser + matcher.

**Success Criteria:**

- `pnpm bkit uninstall` after `bkit install --full` returns `git status` to clean (excluding `node_modules`/`.npmrc`).
- `pnpm bkit uninstall` on a customised consumer leaves consumer-customised files byte-identical to pre-install state (markers-as-SoT for Tier-2; hash-guard for Tier-3).
- Phase 3 blocker fires `process.exit(1)` AND surfaces `pnpm bkit uninstall <flags> && fix && pnpm bkit install <flags>` recovery line.
- `--auto-revert` install flag reverts on blocker.
- `.bkitignore` parser handles per-file (always on) and per-key (env-gated `BKIT_BKITIGNORE_PER_KEY=1`).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.** Inherited verbatim from master, scoped to sub-plan-2.

### Narrative

A consumer maintainer of a heavily-customised repo upgrades `@cbartens/bkit` to v0.7.x, runs `bkit install --full`, hits a Phase 3 blocker (e.g. `gh-bkit-token` gap) which now exits 1 with a recovery line; they run `pnpm bkit uninstall --full` and the surgical uninstall preserves customisations byte-identical.

### Success Criteria

- `pnpm bkit uninstall --full` after `bkit install --full` returns `git status` clean (excluding `node_modules`/`.npmrc`).
- Surgical-uninstall fixture (`tests/fixtures/heavy-customised-consumer/`) survives uninstall byte-identical for consumer-customised lines.
- Phase 3 blocker exits 1 with single-line recovery using `bkit uninstall`.
- `--auto-revert` reverts a partial install on blocker; consumer files untouched.
- `.bkitignore` parser handles `#` comments, blank lines, picomatch globs, and `:dotted.key` per-key suffix (per-key gated by env).

### Concrete Example

**Setup:** scratch consumer at `bkit@0.6.0` (sub-plan-1 shipped) with `--full` modules previously installed; consumer has customised `.claude/settings.json` (added `hooks.Stop`) and customised `AGENTS.md`.

**Steps:**

1. `pnpm add -D @cbartens/bkit@0.7.0`.
2. `pnpm bkit install --full` -> Phase 3 detects `gh-bkit-token` gap -> exits 1 with recovery line.
3. `pnpm bkit uninstall --full` -> strips Tier-2 managed blocks (preserves consumer rule in `AGENTS.md`); skips `.github/workflows/ci.yml` (Tier-3, hash-mismatch -> preserved whole).
4. Consumer fixes `.npmrc`, re-runs `pnpm bkit install --full` -> green.

**Outcome:** customised files intact; bkit-owned regions current; recovery primitive shipped.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `bkit uninstall` on file with NO bkit markers | Skip file (100% consumer); never delete |
| Tier-3 `ci.yml` modified by consumer | Preserve whole; skip unless `--force` |
| `.bkitignore` lists a Tier-3 file | `bkit check` exits 0 even if drift exists |
| Phase 3 blocker on `--auto-revert` install | uninstall in-process, exit 1 |
| Empty `GH_BKIT_TOKEN=""` vs unset | Action text differentiates (B4 — already shipped in sub-plan-1) |
| Tier-3 hash retro-fit (consumer pre-dates `tier3Hashes` field) | Treat as unknown -> preserve-default; tested in P2.T3 |
| Removed `--module <name>` flag (P2.T6) | Not user-visible (flag never shipped); not a semver-major break |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Runbook task | Type | Target file |
| --- | --- | --- | --- |
| Install manifest snapshot | P2.T1 | Unit (Vitest) | `.agents/scripts/bkit-manifest.test.ts` |
| Tier-2 strip-managed-block helper | P2.T2 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| Tier-3 hash-guard preserve/delete | P2.T3 | Unit (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| `package.json` default-only stripping | P2.T4 | Unit (Vitest) | `.agents/scripts/bkit-package-json.test.ts` |
| `runUninstall` round-trip clean | P2.T5 | Integration (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| `bkit uninstall` CLI flag parsing | P2.T6 | Unit (Vitest) | `.agents/scripts/bkit-cli.test.ts` |
| `--dry-run` decision-table snapshot | P2.T7 | Unit (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| Idempotency + `--nuke` confirm | P2.T8 | Unit (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| Phase 3 blocker exit-1 + recovery line | P2.T9 | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| `--auto-revert` reverts on blocker | P2.T10 | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| `.bkitignore` parser (pure) — per-file | P2.T11 | Unit (Vitest) | `.agents/scripts/bkit-bkitignore.test.ts` |
| `.bkitignore` parser per-key (env `BKIT_BKITIGNORE_PER_KEY=1`) | P2.T11 | Unit (Vitest) | `.agents/scripts/bkit-bkitignore.test.ts` |
| `.bkitignore` matcher (fs) | P2.T11 | Integration (Vitest) | `.agents/scripts/bkit-bkitignore.integration.test.ts` |
| Heavily-customised surgical-uninstall snapshot | P2.T8a | Integration (Vitest) | `.agents/scripts/bkit-uninstall.surgical.integration.test.ts` |
| `.bkit-version` schema + canonical hashes | P2.T3 | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |

### 👤 Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe "done" for sub-plan-2.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until the checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.**

This sub-plan introduces TWO Major-Changes-bar items requiring explicit human sign-off before Gate 1 passes:

- [ ] **`process.exit(1)` on Phase 3 blockers.** New behaviour for consumers gating CI on bkit exit codes. Default-off for advisories; only blockers exit 1; recovery line included. Ships in v0.7.x.
- [ ] **`.bkitignore` is a new public file.** Gitignore-style globs + optional `:json.path` per-key suffix. Once parsed by `bkit check`, schema is a public contract.

### 👤 Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed both items above and approved.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both Acceptance Scenario AND Breaking Changes checkboxes are `[x]`.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected approach | Why rejected |
| --- | --- |
| Manual 10-step uninstall recipe (BAR-139 comments) | Replaced by `bkit uninstall` CLI verb. |
| `.bkitignore` per-key as required (not opt-in) | Implementation cost likely high; per-file covers gether-life scenario; per-key opt-in via env var. |
| `--module <name>` flag for uninstall | Parse ambiguity vs install boolean module flags; REMOVE in P2.T6 (never shipped — not user-visible break). |

## Out of Scope

- Tier-2 deep-merge for hooks/settings (sub-plan-3).
- `__bkit__` namespace (sub-plan-3).
- Staging install / upgrade verb / helper action (sub-plan-4).
- Factory-reset uninstall mode (BAR-139 explicit OOS).

## Merge Method

Always squash. One PR for sub-plan-2 -> v0.7.x release. `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Manual 10-step uninstall recipe (BAR-139 comments) | `pnpm bkit uninstall` (P2.T6) | DELETE | Replaced by CLI verb. |

## Security & Privacy

- [ ] **New API route** — N/A.
- [ ] **New DB table/column** — N/A.
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — `.bkitignore` parsed input; treat as untrusted; do NOT shell-exec. Glob library = `picomatch` (no shell-out, regex-only).
- [ ] **PII** — N/A.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — `BKIT_BKITIGNORE_PER_KEY=1` (opt-in, public; not a secret).

## 🚨 Pre-Flight / Dependencies 🚨

### Cross-sub-plan dependencies

- **P2.T11 depends on sub-plan-1 P1.T1** (`bkit doctor` verb). Phase 2 cherry-pick without sub-plan-1 is NOT supported. If sub-plan-2 must ship standalone, scope P2.T11 to wire only into `bkit check`.

### Core (always verify)

- [ ] **Package Management:** `package.json` verified. Phase 2 may add `picomatch` (already vetted in repo). `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated` clean.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `.agents/templates/`, `tests/fixtures/`, `docs/`, `README.md`, `CHANGELOG.md`.
- [ ] **Pending Blockers:** Linear queried for `blocker` label scoped to BAR-139 + BAR-142 §A6/A2.
- [ ] **Project Context:** `docs/knowledge.md` KN-8 (markers-as-SoT); BAR-138 lesson on whitespace-greedy regex incorporated into P2.T2.
- [ ] **Testing & Quality:** Strategy aligned with `docs/testing.md`.
- [ ] **Prerequisite Plans:** sub-plan-1 (`plan-v4-1.md`) MUST be merged first (P2.T11 -> P1.T1 dependency).

### Conditional

- [ ] **Secrets & Env Vars** — `BKIT_BKITIGNORE_PER_KEY=1` documented (opt-in feature flag).
- [ ] **Schema State** — N/A.
- [ ] **Architecture & UI** — N/A (CLI only).
- [ ] **Observability** — `console.error("[bkit-uninstall] …", payload)` for error paths in new uninstall module per `docs/observability.md`.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked `[x]` above.
- [ ] **Breaking Changes confirmed:** Human checked `[x]` (both Major-Changes items).
- [ ] **Gate 1 - Verified:** All Core items checked. sub-plan-1 confirmed merged.

## Data Schema Integration

**None — no DB.** Sole structured persistence is `.bkit-version` (consumer-side JSON), extended in P2.T3 (`tier3Hashes`). Additive; backward-compat read for old plain-text payloads.

## Architecture & Component Changes

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Per-module install manifest exports; register `uninstallModule` per module. |
| [NEW] | `.agents/scripts/bkit-manifest.ts` | `getInstallManifest(modules)` -> typed records. |
| [NEW] | `.agents/scripts/bkit-manifest.test.ts` | Snapshot. |
| [MODIFY] | `.agents/scripts/bkit-tiers.ts` | New export `stripManagedBlock`; reuse line-anchored regex. |
| [MODIFY] | `.agents/scripts/bkit-tiers.test.ts` | HTML / hash markers / marker-absent / whitespace fixtures. |
| [NEW] | `.agents/scripts/bkit-version.ts` | NEW file. Schema: `{ pinnedVersion, tier3Hashes: Record<path, sha256> }`. Backward-compat reader for old plain-text payloads. |
| [NEW] | `.agents/scripts/bkit-version.test.ts` | Schema parse + backward-compat. |
| [NEW] | `.agents/scripts/bkit-uninstall.ts` | `runUninstall(modules, ctx)` orchestrator; `shouldDeleteTier3(path)`; idempotent skip + `--nuke` prompt; `--dry-run` decision-table formatter. **Single owner of all uninstall logic.** |
| [NEW] | `.agents/scripts/bkit-uninstall.test.ts` | Round-trip; hash-guard; idempotency; decision-table snapshot; retro-fit fixture. |
| [NEW] | `.agents/scripts/bkit-uninstall.surgical.integration.test.ts` | Heavily-customised fixture -> consumer files byte-identical. |
| [NEW] | `tests/fixtures/heavy-customised-consumer/` | Committed fixture simulating gether-life-style customisations. Consumed by P2.T8a, **and re-used by sub-plan-3 P3.T9 + sub-plan-4 P4.T7**. |
| [NEW] | `.agents/scripts/bkit-package-json.ts` | `stripManagedKeys(pkgJson, manifest)` — keys driven from P2.T1 manifest. |
| [NEW] | `.agents/scripts/bkit-package-json.test.ts` | Default removed; customised preserved. |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | Extend `WriteSet` with `deletes`; Phase 3 exit-1 wiring + recovery action text; `--auto-revert` flag. |
| [MODIFY] | `.agents/scripts/bkit-install.integration.test.ts` | Phase 3 blocker + revert fixtures. |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | `uninstall` verb; flags. **Keep boolean module flags `--ci`/`--lint`/etc. (mirrors install); REMOVE `--module <name>`.** |
| [MODIFY] | `.agents/scripts/bkit-postinstall.ts` | Recovery action-text on Phase 3 blockers. |
| [NEW] | `.agents/scripts/bkit-bkitignore.ts` | Pure parser. **Spec:** comment char `#`; blank lines ignored; glob library = `picomatch`; `:json.path` uses dotted-key notation (`.` delimiter, `\.` escape); per-key feature flag = `BKIT_BKITIGNORE_PER_KEY=1` env (off by default). |
| [NEW] | `.agents/scripts/bkit-bkitignore.test.ts` | Glob match; `:json.path` parse; comment / blank-line handling. |
| [NEW] | `.agents/scripts/bkit-bkitignore.integration.test.ts` | Fs-touching matcher; `bkit check` consults `.bkitignore`. |
| [MODIFY] | `README.md` | Uninstall + `.bkitignore` + Recovery sections. |
| [MODIFY] | `CHANGELOG.md` | v0.7.x entries. |

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `README.md` | Uninstall + `.bkitignore` + Recovery sections. |
| `CHANGELOG.md` | v0.7.x bullets per closed task. |
| `docs/decisions.md` | `.bkit-version` schema extension (`tier3Hashes`); `.bkitignore` schema decision. |
| `docs/pending.md` | Append OOS items (per-key `.bkitignore` if not shipped per-key; factory-reset uninstall). |
| `.agents/docs.md` | Verify still accurate after sub-plan-2. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert <sub-plan-2 squash-merge SHA>` | Single squash commit; revert is atomic. |
| **`.bkit-version`** | Schema extensions are additive | Old code reads new file via backward-compat reader; revert leaves new fields harmlessly present. |
| **DB** | N/A | No DB. |
| **Risk window** | Single PR | Per-phase revert window. |

## Agent Execution Runbook

> Continuous execution. Per-task fields: `Files`, `Depends on`, `Effort`, `Verify`, `Closes`.

### Phase 2 — v0.7.x

- [ ] **P2.T1:** Build per-module install-write manifest. Each module declares the set of files it writes; output is consumed by uninstall + package.json strippers.
  - Files: `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-manifest.test.ts`
  - Depends on: sub-plan-1 P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-manifest.test.ts`
  - Closes: BAR-139 §Suggested order #1
- [ ] **P2.T2:** `stripManagedBlock` helper in `bkit-tiers.ts` — pure-string transform; reuses BAR-138 line-anchored regex.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: none (pure string transform — no logical dep on P2.T1)
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-139 §Surgical Tier 2
- [ ] **P2.T3:** Tier-3 hash-guard via `.bkit-version` (`bkit-version.ts` is **[NEW]**, verified absent). Schema: `{ pinnedVersion, tier3Hashes: Record<path, sha256> }`. Add fixture: consumer with `.bkit-version` lacking `tier3Hashes` -> preserve-default-on-unknown.
  - Files: `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-version.test.ts`
  - Depends on: sub-plan-1 P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-version.test.ts`
  - Closes: BAR-139 §Surgical Tier 3
- [ ] **P2.T4:** `stripManagedKeys` for managed `package.json` keys; **key list driven by P2.T1 manifest** (NOT hand-listed). Test fixture: matrix row "`package.json` default-only stripping" — assert default `lint:slop` script removed; consumer-customised `lint:slop` preserved.
  - Files: `.agents/scripts/bkit-package-json.ts`, `.agents/scripts/bkit-package-json.test.ts`
  - Depends on: P2.T1
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-package-json.test.ts`
  - Closes: BAR-139 §Surgical managed package.json
- [ ] **P2.T5:** `runUninstallModule` per install module + `WriteSet.deletes`. **Sole owner of `bkit-uninstall.ts`.** Round-trip integration test.
  - Files: `.agents/scripts/bkit-uninstall.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-uninstall.test.ts`
  - Depends on: P2.T1, P2.T2, P2.T3, P2.T4
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`
  - Closes: BAR-139 §Suggested order #2, DoD #1, #4
- [ ] **P2.T6:** `bkit uninstall` CLI verb + flags. **Flag style: keep boolean module flags `--ci`/`--lint`/`--git-hooks`/`--core`/`--claude`/`--cursor`/`--full` (mirror install). REMOVE `--module <name>` to eliminate parse ambiguity.** Other flags: `--dry-run`, `--force`, `--nuke`, `--package`, `--keep-npmrc`, `--keep-tooling`, `--yes`.
  - Files: `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-cli.test.ts`
  - Depends on: P2.T5
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-cli.test.ts`
  - Closes: BAR-139 §Scope #1, #5
- [ ] **P2.T7:** `--dry-run` decision-table (FILE / DECISION / REASON) snapshot.
  - Files: `.agents/scripts/bkit-uninstall.ts`, `.agents/scripts/bkit-uninstall.test.ts`
  - Depends on: P2.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`
  - Closes: BAR-139 DoD dry-run
- [ ] **P2.T8:** Idempotency + `--nuke` confirm prompt.
  - Files: `.agents/scripts/bkit-uninstall.ts`, `.agents/scripts/bkit-uninstall.test.ts`
  - Depends on: P2.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`
  - Closes: BAR-139 DoD idempotent
- [ ] **P2.T8a:** Create `tests/fixtures/heavy-customised-consumer/` committed fixture simulating gether-life-style customisations: Stop hook in `.claude/settings.json`, custom `failClosed`/`loop_limit` in `.cursor/hooks.json`, modified `.vale.ini`, custom husky scripts, project-specific `AGENTS.md` rule outside markers, customised `package.json` scripts. Add `bkit-uninstall.surgical.integration.test.ts` consuming this fixture; snapshot asserts byte-identical post-uninstall.
  - Files: `tests/fixtures/heavy-customised-consumer/...` (committed), `.agents/scripts/bkit-uninstall.surgical.integration.test.ts`
  - Depends on: P2.T5, P2.T6
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-uninstall.surgical.integration.test.ts`
  - Closes: none (backs Phase 2 Gate surgical-uninstall assertion; **fixture re-used by sub-plan-3 P3.T9 and sub-plan-4 P4.T7**)
- [ ] **P2.T9:** Phase 3 blocker exit-1 wiring + recovery action text. Integration fixture: gap -> exit 1; subsequent uninstall -> clean. _(Note: NOT cross-attributed to BAR-142 §A2 — A2 was moved to BAR-139.)_
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.integration.test.ts`
  - Depends on: P2.T5, P2.T6
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`
  - Closes: BAR-139 §6, DoD Phase-3 exit-1
- [ ] **P2.T10:** `--auto-revert` install flag. Integration test fixture name: **`fixture-phase3-token-gap`** (gap on `gh-bkit-token` blocker).
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.integration.test.ts`
  - Depends on: P2.T9
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`
  - Closes: BAR-139 §7, DoD `--auto-revert`
- [ ] **P2.T11:** `.bkitignore` parser + check/doctor integration. Spec: comment `#`, blank-line ignore, `picomatch` glob, `:dotted.key` syntax (`.` delimiter, `\.` escape), per-key gated by env `BKIT_BKITIGNORE_PER_KEY=1`. Pure parser tested in `.test.ts` (TWO matrix rows: per-file AND per-key with env-var-gated fixture using `afterEach` cleanup); fs matcher tested in `.integration.test.ts`. **Cross-sub-plan dep: requires sub-plan-1 P1.T1 `bkit doctor` verb wiring (cherry-pick without sub-plan-1 NOT supported; if sub-plan-2 ships standalone, scope to `bkit check` only).**
  - Files: `.agents/scripts/bkit-bkitignore.ts`, `.agents/scripts/bkit-bkitignore.test.ts`, `.agents/scripts/bkit-bkitignore.integration.test.ts`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`
  - Depends on: sub-plan-1 P1.T1 (cross-sub-plan)
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-bkitignore.test.ts .agents/scripts/bkit-bkitignore.integration.test.ts`
  - Closes: BAR-142 §A6
- [ ] **P2.T12:** README + recovery docs rollup; CHANGELOG v0.7.x.
  - Files: `README.md`, `CHANGELOG.md`
  - Depends on: P2.T1, P2.T2, P2.T3, P2.T4, P2.T5, P2.T6, P2.T7, P2.T8, P2.T8a, P2.T9, P2.T10, P2.T11
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)

- [ ] **🔒 Phase 2 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + round-trip + P2.T8a surgical-fixture snapshot green. **Major-Changes-bar items confirmed in `Breaking Changes & Naming Review` section.**

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every P2 task above checked off with explicit verification output.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** Every Test-Matrix row (sub-plan-2 scope) maps to a runbook task above; confirm none uncovered.
- [ ] **Update existing tests:** No regression in `bkit-dry-run-parity.integration.test.ts`.
- [ ] **Write new tests:** Per Derived Test Matrix; per `docs/testing.md`.
- [ ] **Verify observability:** `console.error("[bkit-uninstall] …", payload)` for error paths in new uninstall module.
- [ ] **Update documentation:** `docs/decisions.md` (.bkit-version + .bkitignore decisions); `docs/pending.md` OOS items; `README.md`; `CHANGELOG.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Documentation Updates table satisfied for v0.7.x.
- [ ] **Gate 3 - Verified:** All testing + doc boxes ticked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm lint:prose && pnpm lint:slop`.
- [ ] **Test Synchronization:** Re-run `bkit-dry-run-parity.integration.test.ts`; should remain green.
- [ ] **Build Configuration:** Verify integration tests auto-discovered via `pnpm vitest list`.
- [ ] **Unit Tests:** Per Test-Matrix unit rows.
- [ ] **Integration Tests:** Per Test-Matrix integration rows including P2.T8a surgical fixture and `bkit-bkitignore.integration.test.ts`.
- [ ] **Run all tests:** `pnpm typecheck && pnpm vitest run`.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests boxes ticked; explicit proof captured.

### Manual Verification

- [ ] **Step 1:** On heavily-customised consumer fixture, run `bkit install --full && bkit uninstall --full`; verify `git status` clean (excluding `node_modules`/`.npmrc`); verify consumer customisations byte-identical to pre-install.
- [ ] **Step 2:** Trigger Phase 3 blocker (`gh-bkit-token` gap) -> assert exit 1 + recovery line printed.
- [ ] **Step 3:** With `--auto-revert`, trigger same blocker -> assert in-process uninstall reverts cleanly, exit 1.
