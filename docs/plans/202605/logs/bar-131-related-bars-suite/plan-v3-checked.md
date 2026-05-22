Verdict: PASS

<!-- verdict:end -->

# bar-131-related-bars-suite (BAR-131 + BAR-139 + BAR-142) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan.md` natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes here.

## Context & Goals

Resolve consumer-friction debt across `bkit install`/`check`/`uninstall` by phasing four self-contained releases (Phase 0 is a single-task test-infra prerequisite):

- **Phase 0 (test-infra):** extend `vitest.config.ts` include glob to match `*.integration.test.ts`. Single task. Required before any integration test authored.
- **Phase 1 (v0.6.x):** `bkit doctor` + polish + changelog surface.
- **Phase 2 (v0.7.x):** surgical `bkit uninstall` recovery primitive + Phase 3 blocker exit-1 + `.bkitignore`.
- **Phase 3 (v0.8.x):** Tier-1 → Tier-2 deep-merge for `.cursor/hooks.json` and `.claude/settings.json` via `__bkit__` namespace.
- **Phase 4 (v0.9.x → v1.0):** transactional install (staging dir) + `bkit upgrade` verb + BAR-131 helper-action. **NOT independently shippable** — depends on Phases 2 + 3.

**Success Criteria:**

- Consumer keys in `.claude/settings.json` / `.cursor/hooks.json` survive bkit upgrades byte-identically.
- `bkit install` failing in Phase 3 exits 1 and surfaces a single-line recovery command using `bkit uninstall`.
- `bkit uninstall` round-trip on a customised consumer leaves consumer files byte-identical to pre-install state.

### Scope summary

- **In-scope:** BAR-142 A1/A3/A4/A5/A6/A7 + B1/B2/B3/B4/B5/B6; full BAR-139 (uninstall core + Phase 3 exit-1 + auto-revert); BAR-131 helper-action stretch (Phase 4 only).
- **Out-of-scope:** npm-registry distribution; new `bkit install` payload structure beyond per-phase need; net-new preflight detectors (separate Linear issues).
- **Deferred-to-pending:** factory-reset uninstall mode; `pnpm-lock.yaml` cleanup; consumer-side workflow decisions; per-key drift exclusions in `.bkitignore` if A6 ships per-file only; **BAR-131 §2 pnpm tag-drop README note** (absorbed into BAR-130 dev follow-up — no action in this plan).

### Phase index

<!-- prettier-ignore -->
| Phase | Title | Closes | Effort | Risk |
| --- | --- | --- | --- | --- |
| 0 | Test-infra prerequisite (vitest glob extension) | none (internal) | S | Low |
| 1 | Quick wins + diagnostic (`bkit doctor`, polish, changelog) | BAR-142 A3/A7/B1/B2/B4/B5/B6 | M | Low |
| 2 | Recovery primitive (`bkit uninstall` + Phase 3 exit-1 + `.bkitignore`) | BAR-139 full + BAR-142 A6 | L | Med (P2.T11 → P1.T1 cross-phase dep) |
| 3 | Tier-2 deep-merge for hooks/settings JSON | BAR-142 A1 + B3 | L | High (schema + merge complexity) |
| 4 | Architectural ergonomics (transactional install, upgrade verb, helper action) | BAR-142 A4/A5 + BAR-131 stretch | L | Med (**NOT independently shippable** — P4.T1 → P3.T3, P4.T4 → P2.T3) |

> **Cross-phase dep note:**
>
> - P0 (vitest glob) is a prerequisite for ALL phases; integration tests will silently skip without it.
> - P2.T11 depends on P1.T1 (`bkit doctor` verb). Phase 2 cherry-pick without Phase 1 is NOT supported. If Phase 2 must ship standalone, scope P2.T11 to wire only into `bkit check`.
> - P4.T1 depends on P3.T3 (`writeTier2Json` staging path); P4.T4 depends on P2.T3 (`.bkit-version` schema). **Phase 4 is NOT independently shippable** — must follow Phase 3 (and therefore Phase 2). The phase index Effort/Risk fields above reflect this reality.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.** This is the testable contract. Everything downstream derives from it.

### Narrative

A consumer maintainer of a heavily-customised repo upgrades `@cbartens/bkit`, runs the new commands (`doctor`, `uninstall`, `upgrade`), and either keeps customisations intact across upgrades or recovers cleanly from a partial install — without losing custom hook configuration or hand-edited CI.

### Success Criteria

- `pnpm bkit doctor` exits 0 and prints unified preflight + post-install advisories on a stale-pin scratch repo.
- `pnpm bkit uninstall` after `bkit install --full` returns `git status` to clean (excluding `node_modules`/`.npmrc`).
- `pnpm bkit uninstall` on a customised consumer leaves consumer-customised files byte-identical to pre-install state (markers-as-SoT for Tier-2; hash-guard for Tier-3).
- Phase 3 blocker fires `process.exit(1)` AND surfaces `pnpm bkit uninstall <flags> && fix && pnpm bkit install <flags>` recovery line; advisory-only post-install runs still exit 0.
- Consumer-added `hooks.Stop` / `hooks.PostToolUse` entries in `.claude/settings.json` survive `bkit install` upgrade across two consecutive bkit versions.
- `pnpm bkit upgrade` from `0.4.x` → `0.5.x` against a customised `.cursor/hooks.json` does NOT silently overwrite consumer drift.

### Concrete Example

**Setup:** scratch consumer at `bkit@0.5.0` with `--full` modules previously installed; consumer has customised `.claude/settings.json` (added `hooks.Stop`) and customised `AGENTS.md` (added a project-specific rule outside bkit markers).

**Steps:**

1. `pnpm add -D @cbartens/bkit@0.6.0` (no `bkit install` yet).
2. `pnpm bkit doctor` → prints `bkit-version-pin-stale` advisory, exits 0.
3. `pnpm bkit install --full` → Phase 3 detects `gh-bkit-token` gap → **exits 1** with recovery line.
4. `pnpm bkit uninstall --full` → strips Tier-2 managed blocks (preserves consumer rule in `AGENTS.md`); skips `.github/workflows/ci.yml` (Tier-3, hash-mismatch → preserved whole, not stripped per-block).
5. Consumer fixes `.npmrc`, re-runs `pnpm bkit install --full` → green.

**Outcome:** customised files intact; bkit-owned regions current; CI gate green.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `bkit uninstall` on file with NO bkit markers | Skip file (100% consumer); never delete |
| Tier-3 `ci.yml` modified by consumer | Preserve whole; skip unless `--force` |
| `.bkitignore` lists a Tier-3 file | `bkit check` exits 0 even if drift exists |
| Cursor v1 schema differs from bkit's shipped shape | P3.T0 spike must pass before A1 work |
| Phase 3 blocker on `--auto-revert` install | uninstall in-process, exit 1 |
| Concurrent `bkit install` mid-failure (P4) | Staging dir discarded, consumer files untouched |
| Empty `GH_BKIT_TOKEN=""` vs unset | Action text differentiates (B4) |
| pnpm 10 onlyBuiltDependencies missing | Already advised — no change |
| Tier-3 hash retro-fit (consumer pre-dates `tier3Hashes` field) | Treat as unknown → preserve-default; tested in P2.T3 |
| Removed `--module <name>` flag (P2.T6) | Not user-visible (flag never shipped); not a semver-major break; documented inline in P2.T6 |

### Derived Test Matrix

> Each row → at least one Agent Execution Runbook task. Multiple rows MAY share a target test file.

<!-- prettier-ignore -->
| Test description | Runbook task | Type | Target file |
| --- | --- | --- | --- |
| `hasBkitMarkers` line-anchored regex | P1.T2 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| Cross-phase dedup position-stable | P1.T3 | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `detectShellToken` empty vs unset | P1.T4 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `LOG_PREFIX` on dry-run blocker banner | P1.T5 | Unit (Vitest) | `.agents/scripts/bkit-install.test.ts` |
| `.npmrc` inline-string action text + fallback | P1.T6 | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| Changelog header diff in post-install | P1.T7 | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `bkit doctor` integration on stale-pin fixture | P1.T1 | Integration (Vitest) | `.agents/scripts/bkit-doctor.integration.test.ts` |
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
| `__bkit__` namespace extractor | P3.T2 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| JSON deep-merge primitive | P3.T1 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2Json` idempotent round-trip | P3.T3 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2Json` throws on missing `__bkit__` envelope | P3.T3 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `bkit-tier1-defaults` snapshot equality vs git-history JSON | P3.T6a | Unit (Vitest) | `.agents/scripts/bkit-tier1-defaults.test.ts` |
| Reclassed `.claude/settings.json` survives upgrade | P3.T4 | Integration (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| Reclassed `.cursor/hooks.json` survives upgrade | P3.T5 | Integration (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| Tier-1 → Tier-2 migration via versioned defaults | P3.T6 | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| Two-version upgrade-survival regression (gether/fraser-coast fixture) | P3.T9 | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `.bkit-version` schema + canonical hashes | P2.T3, P4.T4 | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| Staging dir + atomic rename | P4.T1, P4.T2 | Unit (Vitest) | `.agents/scripts/bkit-install.test.ts` |
| Mid-failure rollback fixture | P4.T3 | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| `bkit upgrade` diff engine | P4.T5 | Unit (Vitest) | `.agents/scripts/bkit-upgrade.test.ts` |
| Upgrade integration (customised hooks scenario) | P4.T7 | Integration (Vitest) | `.agents/scripts/bkit-upgrade.integration.test.ts` |
| `setup-auth/action.yml` schema parse (offline) | P4.T8 | Unit (Vitest) | `.agents/scripts/bkit-action-yaml.test.ts` |
| `setup-auth@v1` composite action smoke | P4.T8 | Manual (CI) | `.github/workflows/test-action.yml` |

### 👤 Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe "done".

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until the checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.**

This plan introduces four explicit Major-Changes-bar items. Each requires explicit human sign-off before Gate 1 passes:

- [ ] **`__bkit__` JSON namespace becomes a public contract.** Top-level `__bkit__` key on `.claude/settings.json` and `.cursor/hooks.json` is the recoverable record of bkit's shipped shape. Once shipped (v0.8.0), removal or rename breaks consumers. Bumps minor → 0.8.0 per Major-Changes bar.
- [ ] **Tier-1 → Tier-2 reclass for `.cursor/hooks.json` and `.claude/settings.json`.** Previously full overwrite; now managed-block deep-merge. Existing consumers receive auto-migration via P3.T6 (versioned-defaults source-of-truth from P3.T6a). Migration must be exercised on real consumer fixtures (gether-life, fraser-coast) before P3 merges.
- [ ] **`process.exit(1)` on Phase 3 blockers.** New behaviour for consumers gating CI on bkit exit codes. Default-off for advisories; only blockers exit 1; recovery line included. Ships in v0.7.x.
- [ ] **`.bkitignore` is a new public file.** Gitignore-style globs + optional `:json.path` per-key suffix. Once parsed by `bkit check`, schema is a public contract.

### 👤 Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed all four items above and approved.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both Acceptance Scenario AND Breaking Changes checkboxes are `[x]`.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected approach | Why rejected |
| --- | --- |
| Single mega-PR for all four phases | Long-running PR risk; loses independent-shipping property; complicates revert. |
| Tier-2 via JSON-merge-patch (RFC 7396) | Cannot express "bkit owns these keys" without a namespace; chosen `__bkit__` envelope instead. |
| `.bkitignore` per-key as required (not opt-in) | Implementation cost likely high; per-file covers the gether-life scenario; ship per-key only if low-cost. |
| Three-way merge UI for `bkit upgrade` | Out-of-scope; conflict list to stderr is sufficient for v1.0. |
| Rebase merge for ordering | Project rule = squash always (`bkit-ship.md` Step 3 hardcoded). |

**Future recommendations:** post-v1.0, consider a `bkit init` scaffolder for consumer CI variants (composite vs. reusable workflow); npm-registry distribution; factory-reset uninstall mode.

## Out of Scope

- npm-registry distribution (BAR-131 explicit OOS).
- Factory-reset uninstall mode (BAR-139 explicit OOS).
- Net-new preflight detectors (separate Linear issues per BAR-142 §Out of scope).
- `pnpm-lock.yaml` cleanup automation post-uninstall.
- Pre-install state restoration of incrementally-modified files (impossible without backups).
- Three-way merge UI for `bkit upgrade` conflicts.
- BAR-131 §2 pnpm tag-drop README note (absorbed into BAR-130 dev follow-up).
- B3 Vercel CLI guard if Phase 3 work doesn't intersect `bkit-preflight.ts` (otherwise included as P3.T8).

> OOS items above are appended to `docs/pending.md` by P0.T0 (explicit runbook task — not relying on summariser hand-off).

## Merge Method

**Merge method: always squash.** One squash-merged PR per phase (Phase 1 → v0.6.x; Phase 2 → v0.7.x; Phase 3 → v0.8.x; Phase 4 → v0.9.x → v1.0). `bkit-ship.md` Step 3 hardcoded `gh pr merge --squash --delete-branch --body ""`. Plans MUST NOT propose rebase or merge-commit.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `detectHooksConfigOverwriteRisk` blocker (`.agents/scripts/bkit-preflight.ts`) | Tier-2 deep-merge (P3.T1-T5) | DELETE | Architecturally impossible once hooks are Tier-2; intra-file delete (function removed; `bkit-preflight.ts` survives) in P3.T7. P3.T1a contract spec confirms DELETE (NOT repurpose). |
| Tier-1 classification for `.cursor/hooks.json` | `writeTier2Json` (P3.T3) | DELETE | Intra-classification delete: file persists, classification changes; migration P3.T6 lifts old shape into `__bkit__` envelope. |
| Tier-1 classification for `.claude/settings.json` | `writeTier2Json` (P3.T3) | DELETE | Intra-classification delete: file persists, classification changes; migration P3.T6 lifts old shape into `__bkit__` envelope. |
| Manual 10-step uninstall recipe (BAR-139 comments) | `pnpm bkit uninstall` (P2.T6) | DELETE | Replaced by CLI verb. |
| `hasBkitMarkers` substring impl | Anchored regex (P1.T2) | DELETE | Intra-file delete (function body replaced; `bkit-preflight.ts` survives). |
| Multi-line bash PAT-shim block in seeded `ci.yml` | `setup-auth@v1` action (P4.T8) | RETAIN-WITH-REASON | External contract — bash fallback retained for non-Actions CI. **Kill-date: v1.1.0** (follow-up issue to be created post-v1.0 ship). |

## Security & Privacy

- [ ] **New API route** — N/A (no API surface).
- [ ] **New DB table/column** — N/A (no DB).
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — `.bkitignore` parsed input; treat as untrusted; do NOT shell-exec. Glob library = `picomatch` (no shell-out, regex-only).
- [ ] **PII** — N/A; bkit logs no PII.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — `GH_BKIT_TOKEN` already documented (no new secret).

_Mostly N/A — bkit is a CLI tool with no API/DB/auth surface. Only `.bkitignore` parsing introduces consumer-supplied input; treat as untrusted glob string only._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` verified; no new runtime deps required for Phases 1-3. Phase 4 may add `picomatch` (already vetted in repo). `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated` clean; pnpm 10 confirmed; tsx version current.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `.agents/templates/`, `docs/`, `README.md`, `CHANGELOG.md`. No new files outside known roots.
- [ ] **Pending Blockers:** Linear queried for `blocker` label scoped to BAR-131/139/142.
- [ ] **Project Context:** `docs/knowledge.md` KN-8 (markers-as-SoT) and `docs/decisions.md` reviewed; BAR-138 lesson on whitespace-greedy regex incorporated into P2.T2.
- [ ] **Testing & Quality:** Strategy aligned with `docs/testing.md` — Vitest for all units + integration; manual smoke at gates only.
- [ ] **Prerequisite Plans:** None — this is the umbrella plan for the three Linear issues.

### Conditional

- [ ] **Secrets & Env Vars** — N/A.
- [ ] **Schema State** — N/A (no DB).
- [ ] **Architecture & UI** — N/A (CLI only).
- [ ] **Observability** — `console.error("[bkit-uninstall] …", payload)` for error paths in new uninstall + upgrade modules per `docs/observability.md`.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked `[x]` in Acceptance Scenario section.
- [ ] **Breaking Changes confirmed:** Human checked `[x]` in Breaking Changes & Naming Review section.
- [ ] **Gate 1 - Verified:** All Core items above checked.

## Data Schema Integration

**None — no DB.** bkit is a CLI tool; sole structured persistence is `.bkit-version` (consumer-side JSON), extended in P2.T3 (`tier3Hashes`) and P4.T4 (canonical-file hashes). Both extensions are additive; backward-compat read for old payloads.

## Architecture & Component Changes

> All paths relative to repo root. Existence verified via `find .agents/scripts/`. `.agents/templates/...` is the canonical template root (NOT `templates/...`).

### Phase 0 — Test-infra prerequisite

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `vitest.config.ts` | Extend include glob from `.agents/scripts/**/*.test.ts` to `[".agents/scripts/**/*.test.ts", ".agents/scripts/**/*.integration.test.ts"]` so integration tests run in `pnpm vitest run`. |

### Phase 1 — Quick wins + diagnostic

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | Add `doctor` to `Verb` union; arg parse; `printUsage`. |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | `main()` dispatch arm for `doctor`; LOG_PREFIX on dry-run banner (B5). |
| [MODIFY] | `.agents/scripts/bkit-postinstall.ts` | Expose `runPostInstallCheck(modules, cwd, { dryRun: true })` read-only replay (no writes); cross-phase dedup position-stable (B2); changelog version-delta header (A7). |
| [MODIFY] | `.agents/scripts/bkit-preflight.ts` | Anchor `hasBkitMarkers` (B1); `detectShellToken` empty vs unset (B4); update `gh-bkit-token-secret-unknown` action text (B6). |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Edit inline `.npmrc` literal (lines ~367-369 and ~549-552) to use `${GH_BKIT_TOKEN:-}` fallback iff pnpm supports it (B6). |
| [NEW] | `.agents/scripts/bkit-doctor.integration.test.ts` | Stale-pin fixture; assert exit 0 + banner content. |
| [MODIFY] | `.agents/scripts/bkit-cli.test.ts` | Verb parsing for `doctor`. |
| [MODIFY] | `.agents/scripts/bkit-preflight.test.ts` | New fixtures for B1/B4/B6. |
| [MODIFY] | `.agents/scripts/bkit-postinstall.test.ts` | Position-stable dedup; changelog header. |
| [MODIFY] | `.agents/scripts/bkit-install.test.ts` | LOG_PREFIX dry-run assertion. |
| [NEW] | `CHANGELOG.md` | Created in P1.T0 prerequisite (skeleton); v0.6.x section seeded. |
| [MODIFY] | `package.json` | Ensure `files` array includes `CHANGELOG.md` so it ships in tarball. |
| [MODIFY] | `README.md` | Doctor usage section. |

### Phase 2 — Recovery primitive

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Per-module install manifest exports; register `uninstallModule` per module. |
| [NEW] | `.agents/scripts/bkit-manifest.ts` | `getInstallManifest(modules)` → typed records. |
| [NEW] | `.agents/scripts/bkit-manifest.test.ts` | Snapshot. |
| [MODIFY] | `.agents/scripts/bkit-tiers.ts` | New export `stripManagedBlock`; reuse line-anchored regex. |
| [MODIFY] | `.agents/scripts/bkit-tiers.test.ts` | HTML / hash markers / marker-absent / whitespace fixtures. |
| [NEW] | `.agents/scripts/bkit-version.ts` | NEW file (verified absent in repo). Schema: `{ pinnedVersion, tier3Hashes: Record<path, sha256> }`. Backward-compat reader for old `.bkit-version` plain-text payloads. |
| [NEW] | `.agents/scripts/bkit-version.test.ts` | Schema parse + backward-compat. |
| [NEW] | `.agents/scripts/bkit-uninstall.ts` | `runUninstall(modules, ctx)` orchestrator; `shouldDeleteTier3(path)` consult; idempotent skip + `--nuke` prompt; `--dry-run` decision-table formatter. **Single owner of all uninstall logic.** |
| [NEW] | `.agents/scripts/bkit-uninstall.test.ts` | Round-trip; hash-guard; idempotency; decision-table snapshot; **retro-fit fixture (consumer with `.bkit-version` lacking `tier3Hashes`)**. |
| [NEW] | `.agents/scripts/bkit-uninstall.surgical.integration.test.ts` | Heavily-customised fixture (custom hooks/scripts/tuned `.vale.ini`) → consumer files byte-identical. |
| [NEW] | `tests/fixtures/heavy-customised-consumer/` | Committed fixture simulating gether-life-style customisations: Stop hook in `.claude/settings.json`, custom `failClosed`/`loop_limit` in `.cursor/hooks.json`, modified `.vale.ini`, custom husky scripts, project-specific `AGENTS.md` rule outside markers. Consumed by P2.T8a, P3.T9, P4 gates. |
| [NEW] | `.agents/scripts/bkit-package-json.ts` | `stripManagedKeys(pkgJson, manifest)` — keys driven from P2.T1 manifest (closes the loop). |
| [NEW] | `.agents/scripts/bkit-package-json.test.ts` | Default removed; customised preserved. |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | Extend `WriteSet` with `deletes`; Phase 3 exit-1 wiring + recovery action text; `--auto-revert` flag. |
| [MODIFY] | `.agents/scripts/bkit-install.integration.test.ts` | Phase 3 blocker + revert fixtures. |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | `uninstall` verb; flags. **Flag-style decision: keep boolean module flags `--ci`/`--lint`/etc. (mirrors install); REMOVE `--module <name>` from P2.T6 to avoid parsing ambiguity.** |
| [MODIFY] | `.agents/scripts/bkit-postinstall.ts` | Recovery action-text on Phase 3 blockers. |
| [NEW] | `.agents/scripts/bkit-bkitignore.ts` | Pure parser (string in, parsed-rules out) — no fs reads. **Spec:** comment char `#`; blank lines ignored; glob library = `picomatch`; `:json.path` uses dotted-key notation (`.` delimiter, `\.` escape for literal dot in key); per-key feature flag = `BKIT_BKITIGNORE_PER_KEY=1` env var (off by default; per-file always on). |
| [NEW] | `.agents/scripts/bkit-bkitignore.test.ts` | Glob match; `:json.path` parse; comment / blank-line handling. |
| [NEW] | `.agents/scripts/bkit-bkitignore.integration.test.ts` | Fs-touching matcher; `bkit check` consults `.bkitignore`. |
| [MODIFY] | `README.md` | Uninstall + `.bkitignore` + Recovery sections. |
| [MODIFY] | `CHANGELOG.md` | v0.7.x entries. |

### Phase 3 — Tier-2 deep-merge

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `docs/decisions.md` | P3.T0 spike outcome; `__bkit__` namespace contract decision. |
| [MODIFY] | `.agents/scripts/bkit-tiers.ts` | `deepMergeJson`, `extractBkitNamespace`, `applyBkitNamespace`, `writeTier2Json`, `migrateTier1JsonToTier2`. |
| [MODIFY] | `.agents/scripts/bkit-tiers.test.ts` | Six concrete `.claude/settings.json` cases; `__bkit__` extraction; round-trip; migration. |
| [NEW] | `.agents/scripts/bkit-tier1-defaults.ts` | **Versioned-defaults source-of-truth** (P3.T6a prerequisite). Exports `BKIT_TIER1_DEFAULTS_BY_VERSION: Record<semver, { '.claude/settings.json': JsonValue, '.cursor/hooks.json': JsonValue }>`. Snapshots committed at known prior versions (0.5.x, 0.6.x, 0.7.x). Sourced from `git show <tag>:.agents/templates/...`. Used by `migrateTier1JsonToTier2` to identify consumer-added vs bkit-shipped content in old Tier-1 files. |
| [NEW] | `.agents/scripts/bkit-tier1-defaults.test.ts` | Snapshot equality vs git-history-extracted JSON. |
| [MODIFY] | `.agents/templates/.claude/settings.json` | Restructured payload with `__bkit__` envelope. |
| [MODIFY] | `.agents/templates/.cursor/hooks.json` | Same; corrected schema if P3.T0 says so. |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Claude/Cursor module dispatchers call `writeTier2Json`. |
| [MODIFY] | `.agents/scripts/bkit-modules.test.ts` | Custom `hooks.Stop` + `loop_limit`/`failClosed` survive install. |
| [NEW] | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` | Two-version upgrade; gether scenario. References `tests/fixtures/heavy-customised-consumer/` from P2.T8a. |
| [MODIFY] | `.agents/scripts/bkit-preflight.ts` | Remove `detectHooksConfigOverwriteRisk` (P3.T7). **v0.7.x interim disposition:** detector remains active until P3.T7 merges in v0.8.0. No back-port. |
| [MODIFY] | `.agents/scripts/bkit-preflight.test.ts` | Remove obsolete tests; add Vercel CLI hang guard tests (B3). |
| [MODIFY] | `docs/knowledge.md` | KN-8 update — Tier-2 deep-merge canonical for ownership-mixed JSON. |
| [MODIFY] | `README.md` | `__bkit__` consumer-visible behaviour. |
| [MODIFY] | `CHANGELOG.md` | v0.8.x entries. |

### Phase 4 — Architectural ergonomics

<!-- prettier-ignore -->
| Tag | File | Purpose |
| --- | --- | --- |
| [MODIFY] | `.agents/scripts/bkit-install.ts` | Staging-aware write wrapper; `commitStaging`/`discardStaging`; record canonical-file hashes on write. |
| [MODIFY] | `.agents/scripts/bkit-install.test.ts` | Staging + atomic-rename + error-path assertions. |
| [MODIFY] | `.agents/scripts/bkit-install.integration.test.ts` | Mid-failure rollback fixture; SIGTERM-after-first-module fixture. |
| [MODIFY] | `.agents/scripts/bkit-modules.ts` | Pass staging dir to module dispatcher. |
| [MODIFY] | `.agents/scripts/bkit-version.ts` | Extend (already [NEW] in P2.T3) — additive `canonicalHashes` field. |
| [MODIFY] | `.agents/scripts/bkit-version.test.ts` | Backward-compat with absent field. |
| [MODIFY] | `.agents/scripts/bkit-cli.ts` | Register `upgrade` verb. |
| [NEW] | `.agents/scripts/bkit-upgrade.ts` | Orchestrator + diff engine; `--non-interactive` flag. |
| [NEW] | `.agents/scripts/bkit-upgrade.test.ts` | Diff engine; conflict abort; auto-apply. |
| [NEW] | `.agents/scripts/bkit-upgrade.integration.test.ts` | 0.4.x → 0.5.x customised hooks scenario. |
| [NEW] | `.github/actions/setup-auth/action.yml` | Composite action wraps PAT-shim using `BKIT_READ_TOKEN`. |
| [MODIFY] | `.agents/templates/.github/workflows/ci.yml` | Update step to `uses: cbartens/bkit/.github/actions/setup-auth@v1`. |
| [NEW] | `.github/workflows/test-action.yml` | Meta-test invokes the action. Verification = manual GitHub Actions smoke at gate-time. |
| [NEW] | `.agents/scripts/bkit-action-yaml.test.ts` | Offline acceptance: parse `.github/actions/setup-auth/action.yml`, assert valid YAML schema + expected inputs (`token`, `registry`). |
| [MODIFY] | `README.md` | Upgrade / Transactional install / Helper action sections. |
| [MODIFY] | `docs/decisions.md` | Staging-dir architecture; `.bkit-version` schema extension. |
| [MODIFY] | `CHANGELOG.md` | v0.9.x and v1.0 entries. |

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | KN-8 update: Tier-2 deep-merge canonical for ownership-mixed JSON; markers-as-SoT (BAR-138 lesson) reinforced. |
| `docs/decisions.md` | (a) `__bkit__` namespace contract; (b) staging-dir transactional install; (c) `.bkit-version` schema extensions; (d) P3.T0 Cursor v1 schema spike outcome. |
| `docs/pending.md` | Append OOS items after plan approval (BAR-131 §2 absorbed into BAR-130; per-key `.bkitignore` if not shipped; factory-reset uninstall; npm-registry distribution; `pnpm-lock.yaml` cleanup; three-way merge UI; `bkit init` scaffolder). |
| `README.md` | Doctor (P1) + Uninstall + `.bkitignore` + Recovery (P2) + `__bkit__` (P3) + Upgrade + Transactional install + Helper action (P4). |
| `CHANGELOG.md` | Per closed sub-issue per phase (v0.6.x → v1.0). |
| `.agents/docs.md` | Verify still accurate after each phase. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert <squash-merge-SHA>` per phase | Each phase is a single squash commit; revert is atomic. |
| **`.bkit-version`** | Schema extensions are additive | Old code reads new file via backward-compat reader; revert leaves new fields harmlessly present. |
| **Templates** | Revert `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json` to pre-`__bkit__` shape | Phase 3 only. Consumers running new bkit against old templates: `writeTier2Json` errors loud with "missing `__bkit__` envelope". |
| **DB** | N/A | No DB. |
| **Risk window** | Per-phase | Each phase ships independently; revert window = single PR. |

## Agent Execution Runbook

> Continuous execution. Do not pause for user permission at any Gate. Tick `[x]` as each task completes.
>
> **Per-task fields:** every task line carries `Files:`, `Depends on:`, `Effort:` (S | M | L), `Verify:`, `Closes:`. Read together — runbook is the executable contract.

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

### Phase 2 — v0.7.x

- [ ] **P2.T1:** Build per-module install-write manifest. Each module declares the set of files it writes; output is consumed by uninstall + package.json strippers.
  - Files: `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-manifest.test.ts`
  - Depends on: P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-manifest.test.ts`
  - Closes: BAR-139 §Suggested order #1
- [ ] **P2.T2:** `stripManagedBlock` helper in `bkit-tiers.ts` — pure-string transform; reuses BAR-138 line-anchored regex.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: none (pure string transform — no logical dep on P2.T1)
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-139 §Surgical Tier 2
- [ ] **P2.T3:** Tier-3 hash-guard via `.bkit-version` (`bkit-version.ts` is **[NEW]**, verified absent). Schema: `{ pinnedVersion, tier3Hashes: Record<path, sha256> }`. Add fixture: consumer with `.bkit-version` lacking `tier3Hashes` → preserve-default-on-unknown.
  - Files: `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-version.test.ts`
  - Depends on: P0.T1
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
  - Closes: none (backs Phase 2 Gate surgical-uninstall assertion)
- [ ] **P2.T9:** Phase 3 blocker exit-1 wiring + recovery action text. Integration fixture: gap → exit 1; subsequent uninstall → clean. _(Note: NOT cross-attributed to BAR-142 §A2 — A2 was moved to BAR-139. Linear: ensure BAR-142 §A2 references this task.)_
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
- [ ] **P2.T11:** `.bkitignore` parser + check/doctor integration. Spec: comment `#`, blank-line ignore, `picomatch` glob, `:dotted.key` syntax (`.` delimiter, `\.` escape), per-key gated by env `BKIT_BKITIGNORE_PER_KEY=1`. Pure parser tested in `.test.ts` (TWO matrix rows: per-file AND per-key with env-var-gated fixture using `afterEach` cleanup); fs matcher tested in `.integration.test.ts`. **Cross-phase dep: requires P1.T1 `bkit doctor` verb wiring (Phase 2 cherry-pick without Phase 1 NOT supported; if Phase 2 ships standalone, scope to `bkit check` only).**
  - Files: `.agents/scripts/bkit-bkitignore.ts`, `.agents/scripts/bkit-bkitignore.test.ts`, `.agents/scripts/bkit-bkitignore.integration.test.ts`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`
  - Depends on: P1.T1 (cross-phase)
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-bkitignore.test.ts .agents/scripts/bkit-bkitignore.integration.test.ts`
  - Closes: BAR-142 §A6
- [ ] **P2.T12:** README + recovery docs rollup; CHANGELOG v0.7.x.
  - Files: `README.md`, `CHANGELOG.md`
  - Depends on: P2.T1, P2.T2, P2.T3, P2.T4, P2.T5, P2.T6, P2.T7, P2.T8, P2.T8a, P2.T9, P2.T10, P2.T11
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)
- [ ] **🔒 Phase 2 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + round-trip + P2.T8a surgical-fixture snapshot green.

### Phase 3 — v0.8.x (Major-Changes — human approval before PR opens)

- [ ] **P3.T0:** Verify Cursor v1 hooks schema; record decision in `docs/decisions.md`. **P3.T0 acceptance must explicitly bless or veto `__bkit__` envelope shape** (if Cursor reserves a conflicting key, namespace must change). **Abort path:** if Cursor v1 schema is undocumented after reasonable web-search effort, agent issues a blocker Linear issue against BAR-142 and pauses Phase 3 entry — does NOT proceed to P3.T1a on guess.
  - Files: `docs/decisions.md`
  - Depends on: P0.T1
  - Effort: M
  - Verify: human review of decisions.md entry; record blesses-or-vetoes `__bkit__` shape
  - Closes: BAR-142 §A1 prerequisite
- [ ] **P3.T1a (NEW — namespace contract spec):** One-page contract doc in `docs/decisions.md` defining `__bkit__` envelope shape, extractor semantics, bkit-owned-key predicate signature, AND **disposition for `detectHooksConfigOverwriteRisk` (DELETE — do not repurpose; rationale: detector becomes architecturally redundant once `__bkit__` envelope is canonical SoT)**. Output: stable type signatures in `bkit-tiers.ts`.
  - Files: `docs/decisions.md`, `.agents/scripts/bkit-tiers.ts`
  - Depends on: P3.T0
  - Effort: M
  - Verify: `pnpm typecheck` (type signatures compile); decisions.md entry reviewed
  - Closes: none (contract spec — unblocks P3.T1, P3.T2, P3.T7)
- [ ] **P3.T1:** JSON `deepMergeJson` primitive (consumes contract from P3.T1a). Test six `.claude/settings.json` cases.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T1a
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (deep-merge primitive)
- [ ] **P3.T2:** `__bkit__` namespace extractor/applier (`extractBkitNamespace`, `applyBkitNamespace`); restructure `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json` payloads.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`
  - Depends on: P3.T1a, P3.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (namespace extractor)
- [ ] **P3.T3:** `writeTier2Json()` helper. Idempotent round-trip. **Acceptance: `writeTier2Json` MUST throw (not swallow) when the input lacks the `__bkit__` envelope; unit test asserts the throw with explicit message.** This guards rollback path (templates reverted to pre-`__bkit__` shape must error loudly, not corrupt silently).
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T2
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts` (covers both happy-path and missing-envelope throw)
  - Closes: BAR-142 §A1 (write helper)
- [ ] **P3.T4:** Reclassify `.claude/settings.json` to Tier-2 (Claude module dispatcher).
  - Files: `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-modules.test.ts`
  - Depends on: P3.T3
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.test.ts`
  - Closes: BAR-142 §A1 (Claude reclass)
- [ ] **P3.T5:** Reclassify `.cursor/hooks.json` to Tier-2; if P3.T0 vetoed shipped schema, fix it here (one breaking change, not two).
  - Files: `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-modules.test.ts`, `.agents/templates/.cursor/hooks.json`
  - Depends on: P3.T0, P3.T3
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.test.ts`
  - Closes: BAR-142 §A1 (Cursor reclass)
- [ ] **P3.T6a (NEW — versioned defaults source-of-truth):** Create `.agents/scripts/bkit-tier1-defaults.ts` with `BKIT_TIER1_DEFAULTS_BY_VERSION` snapshots for prior versions (0.5.x, 0.6.x, 0.7.x), extracted from `git show <tag>:.agents/templates/.claude/settings.json` and `git show <tag>:.agents/templates/.cursor/hooks.json`. Test: snapshot equality vs git-history JSON.
  - Files: `.agents/scripts/bkit-tier1-defaults.ts`, `.agents/scripts/bkit-tier1-defaults.test.ts`
  - Depends on: P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-tier1-defaults.test.ts`
  - Closes: none (migration prerequisite for P3.T6)
- [ ] **P3.T6:** `migrateTier1JsonToTier2` consults `BKIT_TIER1_DEFAULTS_BY_VERSION` (P3.T6a) to identify previous bkit defaults; lifts into `__bkit__` envelope; idempotent on re-run.
  - Files: `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tiers.test.ts`
  - Depends on: P3.T4, P3.T5, P3.T6a
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`
  - Closes: BAR-142 §A1 (migration)
- [ ] **P3.T7:** Retire `detectHooksConfigOverwriteRisk` — **DELETE per P3.T1a contract spec (NOT repurposed)**. Remove obsolete tests. **v0.7.x interim disposition:** detector remains active until P3.T7 merges in v0.8.0; no back-port.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P3.T1a, P3.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §A1 (cleanup)
- [ ] **P3.T8:** Vercel CLI hang guard (B3). **Concrete behaviour: pre-check `.vercel/project.json` and SKIP `vercel env ls` when file absent (do NOT shell out, do NOT depend on timeout heuristics).** Phase 3 work touches `bkit-preflight.ts` via P3.T7, so this is unconditional.
  - Files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`
  - Depends on: P3.T7
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`
  - Closes: BAR-142 §B3
- [ ] **P3.T9:** Two-version upgrade-survival regression test (gether/fraser-coast fixture). Consumes `tests/fixtures/heavy-customised-consumer/` from P2.T8a.
  - Files: `.agents/scripts/bkit-modules.upgrade.integration.test.ts`, `tests/fixtures/heavy-customised-consumer/...` (referenced)
  - Depends on: P2.T8a, P3.T6
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-modules.upgrade.integration.test.ts`
  - Closes: BAR-142 §A1 (regression net)
- [ ] **P3.T10:** KN-8 + decisions + README + CHANGELOG v0.8.x.
  - Files: `docs/knowledge.md`, `docs/decisions.md`, `README.md`, `CHANGELOG.md`
  - Depends on: P3.T1, P3.T2, P3.T3, P3.T4, P3.T5, P3.T6, P3.T6a, P3.T7, P3.T8, P3.T9
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)
- [ ] **🔒 Phase 3 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` (standardised across all phases). Manual smoke against `tests/fixtures/heavy-customised-consumer/` (committed in P2.T8a): two-version upgrade → consumer keys byte-identical, bkit keys current. **Major-Changes-bar items confirmed in `Breaking Changes & Naming Review` section.**

### Phase 4 — v0.9.x → v1.0

> **Cross-phase dep reminder:** Phase 4 is NOT independently shippable. P4.T1 → P3.T3; P4.T4 → P2.T3.

- [ ] **P4.T1:** `.bkit-staging/<module>/` write path. Staging-aware write wrapper.
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.test.ts`, `.agents/scripts/bkit-modules.ts`
  - Depends on: P3.T3 (cross-phase)
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.test.ts`
  - Closes: BAR-142 §A4 (staging foundation)
- [ ] **P4.T2:** Validate-then-atomic-rename per module. `commitStaging` / `discardStaging`.
  - Files: `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.test.ts`
  - Depends on: P4.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.test.ts`
  - Closes: BAR-142 §A4 (commit/discard)
- [ ] **P4.T3:** Mid-failure rollback test fixtures (reproduce 0.5.0 `bkit-design-organise` lookup-miss); SIGTERM-after-first-module fixture.
  - Files: `.agents/scripts/bkit-install.integration.test.ts`
  - Depends on: P4.T2
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`
  - Closes: BAR-142 §A4 (regression net)
- [ ] **P4.T4:** `.bkit-version` `canonicalHashes` field (additive); backward-compat read for old payloads.
  - Files: `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-version.test.ts`
  - Depends on: P2.T3 (cross-phase)
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-version.test.ts`
  - Closes: BAR-142 §A5 (schema extension)
- [ ] **P4.T5:** `bkit upgrade` CLI verb + diff engine.
  - Files: `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-upgrade.ts`, `.agents/scripts/bkit-upgrade.test.ts`
  - Depends on: P4.T4, P3.T6
  - Effort: L
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`
  - Closes: BAR-142 §A5 (upgrade verb)
- [ ] **P4.T6:** `--non-interactive` upgrade auto-apply.
  - Files: `.agents/scripts/bkit-upgrade.ts`, `.agents/scripts/bkit-upgrade.test.ts`
  - Depends on: P4.T5
  - Effort: S
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`
  - Closes: BAR-142 §A5 (non-interactive)
- [ ] **P4.T7:** Upgrade integration test (0.4.x → 0.5.x customised hooks).
  - Files: `.agents/scripts/bkit-upgrade.integration.test.ts`, `tests/fixtures/heavy-customised-consumer/...` (referenced)
  - Depends on: P4.T5, P2.T8a
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-upgrade.integration.test.ts`
  - Closes: BAR-142 §A5 (regression net)
- [ ] **P4.T8:** BAR-131 helper-action `setup-auth@v1` at `.github/actions/setup-auth/action.yml`. Update `.agents/templates/.github/workflows/ci.yml` step to `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Add `.github/workflows/test-action.yml` meta-test. Add **offline acceptance**: Vitest-level YAML schema/parse test in `.agents/scripts/bkit-action-yaml.test.ts` asserting `action.yml` parses + has expected `inputs` (`token`, `registry`). **Tag step (sub-task):** after Phase 4 squash-merge lands on default branch, create + push annotated tag `v1` pointing to that commit (`gh release create v1 --target <SHA> --title 'setup-auth@v1'` OR `git tag -a v1 -m 'setup-auth helper action v1' <SHA> && git push origin v1`). Without the `v1` tag, `uses: cbartens/bkit/.github/actions/setup-auth@v1` fails to resolve in consumers. Manual GitHub Actions smoke at gate-time.
  - Files: `.github/actions/setup-auth/action.yml`, `.agents/templates/.github/workflows/ci.yml`, `.github/workflows/test-action.yml`, `.agents/scripts/bkit-action-yaml.test.ts`
  - Depends on: P0.T1
  - Effort: M
  - Verify: `pnpm vitest run .agents/scripts/bkit-action-yaml.test.ts`; manual GitHub Actions smoke on test consumer fork (post-tag)
  - Closes: BAR-131 §1 (helper action stretch)
- [ ] **P4.T9:** README + CHANGELOG v0.9/v1.0 + `docs/decisions.md` + `docs/knowledge.md`.
  - Files: `README.md`, `CHANGELOG.md`, `docs/decisions.md`, `docs/knowledge.md`
  - Depends on: P4.T1, P4.T2, P4.T3, P4.T4, P4.T5, P4.T6, P4.T7, P4.T8
  - Effort: S
  - Verify: `pnpm lint:prose`
  - Closes: none (docs rollup)
- [ ] **🔒 Phase 4 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + scripted SIGTERM fixture: `start bkit install --full → SIGTERM after first module → assert consumer git-diff clean`. End-to-end upgrade test against `tests/fixtures/heavy-customised-consumer/` confirms no silent overwrites. Post-merge: `v1` tag pushed.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every phase task above checked off with explicit verification output.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** Every Test-Matrix row maps to a runbook task above (matrix now carries explicit `Runbook task` column); confirm none uncovered. Spot-check by grepping `pnpm vitest list` against matrix target files.
- [ ] **Update existing tests:** No regression in `bkit-dry-run-parity.integration.test.ts` after each phase.
- [ ] **Write new tests:** Per Derived Test Matrix; per `docs/testing.md`.
- [ ] **Verify observability:** `console.error("[bkit-uninstall] …", payload)` and `console.error("[bkit-upgrade] …", payload)` for error paths.
- [ ] **Update documentation:** `docs/knowledge.md` KN-8; `docs/decisions.md` `__bkit__` + staging + `.bkit-version` ext; `docs/pending.md` OOS items; `README.md`; `CHANGELOG.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Documentation Updates table satisfied.
- [ ] **Gate 3 - Verified:** All testing + doc boxes ticked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm lint:prose && pnpm lint:slop` after each phase.
- [ ] **Test Synchronization:** Re-run `bkit-dry-run-parity.integration.test.ts` after each phase; should remain green.
- [ ] **Build Configuration:** Vitest include glob extended in P0.T1 to match both `*.test.ts` and `*.integration.test.ts`. New integration test files added in subsequent phases auto-discovered. Verify via `pnpm vitest list` after each phase.
- [ ] **Unit Tests:** Per Test-Matrix unit rows.
- [ ] **Integration Tests:** Per Test-Matrix integration rows.
- [ ] **Run all tests:** `pnpm typecheck && pnpm vitest run`. Fix all failures before Gate 4.

<!-- prettier-ignore -->
| Gate | Phase | Commands | Pass criteria |
| --- | --- | --- | --- |
| G1 | End of Phase 1 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm tsx .agents/scripts/bkit-install.ts doctor` | All Phase 1 tests green; doctor runs clean against producer repo |
| G2 | End of Phase 2 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + manual round-trip + P2.T8a surgical-fixture | install→uninstall→`git status` clean; surgical fixture preserves consumer files byte-identical |
| G3 | End of Phase 3 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + manual two-version upgrade | Consumer hooks survive; obsolete detector removed; migration path exercised on gether/fraser-coast fixtures |
| G4 | End of Phase 4 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + scripted SIGTERM fixture | Staging cleaned on error; upgrade non-destructive |

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests boxes ticked with explicit proof captured.

### Manual Verification

- [ ] **Step 1 (Phase 1):** Run `pnpm tsx .agents/scripts/bkit-install.ts doctor` against producer repo; verify exit 0 and banner.
- [ ] **Step 2 (Phase 2):** On heavily-customised consumer fixture, run `bkit install --full && bkit uninstall --full`; verify `git status` clean (excluding `node_modules`/`.npmrc`); verify consumer customisations byte-identical to pre-install.
- [ ] **Step 3 (Phase 3):** Two-version upgrade on gether-shaped fixture: install bkit@A → consumer adds custom `hooks.Stop` → install bkit@B → assert `hooks.Stop` byte-identical AND `SessionStart` updated.
- [ ] **Step 4 (Phase 4):** Start `bkit install --full`, send SIGTERM after first module completes; verify consumer `git diff` empty. Run `bkit upgrade` on customised hooks fixture; verify no silent overwrite.
- [ ] **Step 5 (Phase 4):** Manual GitHub Actions run on a test consumer fork to verify `setup-auth@v1` composite action (P4.T8 verification path).

## Risks & cross-cutting concerns

<!-- prettier-ignore -->
| Risk / coupling | Phase | Mitigation | Approval gate |
| --- | --- | --- | --- |
| Cursor v1 hooks schema unverified | 3 | P3.T0 spike; P3.T1a contract spec consumes spike outcome | research-only |
| `__bkit__` namespace becomes public contract → semver-major | 3 | Documented in decisions; bump 0.8.0 | **YES — Major-Changes bar (Breaking Changes section)** |
| Tier-1 → Tier-2 reclass for hooks/settings | 3 | P3.T6 migration via P3.T6a versioned-defaults SoT; release notes | **YES — Major-Changes bar** |
| Phase 3 `process.exit(1)` behaviour change | 2 | Default off for advisories; only blockers exit 1; recovery line | **YES — Major-Changes bar** |
| `.bkitignore` new public file | 2 | Spec'd in P2.T11 (comment `#`, picomatch, `:dotted.key`) | **YES — Major-Changes bar** |
| `.bkit-version` schema extension | 2/4 | Additive; backward-compat read; retro-fit fixture in P2.T3 | No |
| Markers-as-SoT regex risk (BAR-138) | 2 | Reuse line-anchored extractor; whitespace fixture | No |
| Multi-bar plan size | All | Each phase ships independently EXCEPT Phase 4 (depends on Phase 2 + 3); squash per phase | No |
| P2.T11 cross-phase dep on P1.T1 | 1/2 | Documented in Phase index Risk column AND inline in P2.T11 task body | No |
| P4.T1 cross-phase dep on P3.T3 | 3/4 | Phase 4 NOT independently shippable — must follow Phase 3; flagged in Phase Index Risk + Phase 4 header note | No |
| P4.T4 cross-phase dep on P2.T3 | 2/4 | Phase 4 NOT independently shippable — must follow Phase 2 (`.bkit-version` schema must exist); flagged in Phase Index Risk | No |
| P4.T7 cross-phase dep on P2.T8a | 2/4 | Reuses gether/fraser-coast fixture from P2.T8a; if Phase 4 ships before Phase 2 fixture, fixture must be back-ported | No |
| BAR-131 helper-action surface | 4 | v0.9.x; opt-in for consumers; bash fallback retained (kill-date v1.1.0); `v1` tag pushed in P4.T8 sub-step | No |
| Vitest integration-test glob silent-skip | 0 | P0.T1 extends include glob BEFORE any integration test authored | No |
