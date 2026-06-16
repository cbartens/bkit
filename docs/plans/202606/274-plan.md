<!-- Plan: docs/plans/202606/274-plan.md · FID 274 · created 2026-06. No design doc — issue #274 is the spec. -->

# pnpm Auth Rework — Relocate `_authToken` to User-Level Config (#274) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Source of truth = literal `[x]` vs `[ ]` checkboxes below. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

pnpm's auth-handling rework (regression boundary **between 10.34.1 and 10.34.3**, confirmed live) breaks `@cbartens/bkit` download from `npm.pkg.github.com`: a project-level `.npmrc` with env-substitution `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` 401s during the install **fetch** path (`ERR_PNPM_FETCH_401`) on pnpm ≥10.34.3, even with the token correctly set in the environment. Metadata calls (`pnpm view`) still resolve, so the failure hides until an actual download. bkit's own CI is green-but-misleading — bkit doesn't depend on `@cbartens/bkit`. Impact: **consumers** + bkit's **dogfood/tarball** install. Blocks #273 (pnpm 10.34.3 bump) and the pnpm-11 migration (#176).

**Fix (validated live, see Acceptance):** drop `_authToken` from the committed project `.npmrc` (registry mapping only) and write the token to pnpm's **user-level auth config** via `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` on every surface that runs `pnpm install` (CI, local, Vercel). Forced by config precedence (**project `.npmrc` > user config**): a broken project-level line would shadow the user-level token, so relocation — not belt-and-suspenders — is required.

**Why `pnpm config set` (not `echo >> ~/.npmrc`):** it is version-aware. Confirmed live: it writes `~/.npmrc` on pnpm 10.x and `~/.config/pnpm/auth.ini` on pnpm 11.x — i.e. the exact location _that_ pnpm reads at install time. A hand-written `~/.npmrc` would silently miss pnpm 11's `auth.ini`.

**Success Criteria:**

- New consumers + dogfood tarball install `@cbartens/bkit` cleanly under pnpm **10.34.1, 10.34.3, and 11**.
- `bkit install` AND `bkit upgrade` run live on the new shape → detectors emit correct nudges, **no false positives** on a registry-only `.npmrc`.
- #273 unblocked (pnpm pin can move off 10.34.1; the actual bump stays #273's PR).

**Related Issues:**

- `#274 — pnpm auth rework write GH_BKIT_TOKEN to user-level ~/.npmrc (open)` — this plan.
- `#273 — pnpm 10.34.3 bump (open, held)` — unblocked by this; not modified here.
- `#176 — pnpm download fragility root cause (open tracker)` — keep open; reference with plain `#176`.
- `#268 — Renovate pnpm-10.x bump (held)` — downstream; not modified here.

---

## 👤 Acceptance Scenario

### Narrative

A consumer (or bkit's own dogfood) on pnpm 10.34.3 or 11 commits a project `.npmrc` containing only the `@cbartens` registry mapping, sets `GH_BKIT_TOKEN`, runs the seeded `pnpm config set` step (CI/local) or `installCommand` (Vercel), and `pnpm install` resolves `@cbartens/bkit` without a 401.

### Success Criteria

- Registry-only `.npmrc` + `pnpm config set` → `pnpm install`/`add @cbartens/bkit` succeeds on pnpm 10.34.1, 10.34.3, 11.6.0. **(Validated live during planning — bug reproduced as `ERR_PNPM_FETCH_401` on 10.34.3/11 with old env-sub; new shape green on all three.)**
- `detectNpmrcAuth` returns `present` for a registry-only `.npmrc` (no false `npmrc-missing-gh-packages`).
- `detectCiYmlMissingTokenEnv` passes the new install-step shape and flags a `pnpm install` step that lacks the `pnpm config set` auth step.
- A consumer still carrying the legacy `_authToken=${GH_BKIT_TOKEN}` project line gets a migration nudge.
- No advisory string anywhere prescribes `${GH_BKIT_TOKEN:-}` (permanent BAR-142 §B6 guard preserved).

### Concrete Example

**Setup:** Fresh consumer repo, pnpm 11.6.0, `GH_BKIT_TOKEN` exported, `.npmrc` = `@cbartens:registry=https://npm.pkg.github.com` only.

**Steps:**

1. CI install step runs `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` → token written to `~/.config/pnpm/auth.ini`.
2. `pnpm install --frozen-lockfile` → resolves `@cbartens/bkit` from `npm.pkg.github.com`.

**Outcome:** Install succeeds; no `ERR_PNPM_FETCH_401`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| pnpm 11 (`auth.ini`) vs pnpm 10 (`~/.npmrc`) | `pnpm config set` writes the right file for the running pnpm; both resolve |
| Consumer keeps legacy `_authToken=${GH_BKIT_TOKEN}` project line | install 401s on ≥10.34.3 (shadowing) → `npmrc-legacy-authtoken` advisory nudges removal |
| `ci.yml` has install but no `pnpm config set` step | `detectCiYmlMissingTokenEnv` flags it (blocker when next run would 401) |
| `GH_BKIT_TOKEN` unset/empty | `pnpm config set` writes empty token → 401; existing `detectShellToken`/empty-token advisories still fire |
| Vercel build (no shell pre-step) | `vercel.json` `installCommand` runs `pnpm config set … && pnpm install` |
| `pnpm view` (metadata) with broken env-sub | resolves OK — misleading "works locally"; document in KN |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `detectNpmrcAuth` → `present` for registry-only `.npmrc` | Unit (Vitest) | `.bkit/src/bkit-postinstall.test.ts` |
| `detectNpmrcAuth` → `missing` only when registry line absent | Unit | `.bkit/src/bkit-postinstall.test.ts` |
| `npmrc-legacy-authtoken` advisory fires on legacy project line | Unit | `.bkit/src/bkit-postinstall.test.ts` |
| `detectCiYmlMissingTokenEnv` passes new (config-set) shape | Unit | `.bkit/src/bkit-postinstall.test.ts` |
| `detectCiYmlMissingTokenEnv` flags install-without-config-set | Unit | `.bkit/src/bkit-postinstall.test.ts` |
| Advisory strings use new shape; `${VAR:-}` forbidden everywhere | Unit | `.bkit/src/bkit-preflight.test.ts` |
| CI template install step contains `pnpm config set …:_authToken` | Unit | `.bkit/src/bkit-templates.test.ts` |
| Phase-3 blocker scenario reflects new shape | Integration | `.bkit/src/bkit-install.integration.test.ts` |
| Clean-dir tarball install green on pnpm 10.34.1/10.34.3/11 | @live (dogfood) | manual — `pnpm pack` + corepack |
| `bkit install` + `bkit upgrade` live: no false positives on registry-only `.npmrc` | @live | manual |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed** — confirmed in-session via plan approval + design Q&A (2026-06-15).

---

## 👤 Breaking Changes & Naming Review

> [!WARNING]
> **Consumer-facing behaviour change (migration required).** The committed project `.npmrc` shape changes: the `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` line is **removed**; the token moves to pnpm user-level config (`pnpm config set …`). Existing consumers must run `pnpm config set` once (CI step / local one-off / Vercel `installCommand`) or their next install 401s on pnpm ≥10.34.3. Surfaced via the new `npmrc-legacy-authtoken` advisory + README/KN docs.

- **New finding id:** `npmrc-legacy-authtoken` (low/advisory).
- **Vercel `installCommand` reintroduced** — `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN" && pnpm install`. **Not** a DE-3/BAR-164 regression (those removed a _git-auth_ shim and a _cross-org composite action_ respectively; neither is this). Recorded as DE-31.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed** — confirmed in-session via plan approval (2026-06-15).

---

## Alternative Approaches & Recommendations

- **Keep project `_authToken` + add `pnpm config set` (belt-and-suspenders)** — rejected: project config shadows user config, so the broken line still 401s. Relocation is mandatory.
- **Hand-write `~/.npmrc`** — rejected: misses pnpm 11's `auth.ini`. `pnpm config set` is version-aware.
- **Pin Vercel to pnpm <10.34.3** — rejected: fragile (Vercel auto-bumps pnpm); shim is robust.

## Out of Scope

- Actual pnpm pin bump off 10.34.1 + Renovate pnpm-10.x fence → **#273 / #176** (this only unblocks them).
- pnpm-11 `pnpm.overrides` → `pnpm-workspace.yaml` migration (separate pnpm-11 issue; observed `WARN` during planning).
- No `.claude`/`.cursor`/`.opencode` mirror regen (no `.bkit/workflows|prompts` edits).
- No `.bkit/version` bump (release-time concern).

## Merge Method

**Squash.**

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| project `.npmrc` `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` line (in templates/docs/advisories) | `pnpm config set` user-level auth + registry-only `.npmrc` | DELETE | broken on pnpm ≥10.34.3; shadows user-level token |
| `detectNpmrcAuth` "requires `_authToken`" contract | registry-line-only contract | DELETE | old contract false-positives on the correct new shape |

## Security & Privacy

None — no new routes/DB/secrets. `GH_BKIT_TOKEN` handling unchanged (still env-var ref, never literal in committed files; `pnpm config set` writes user-level config, ephemeral in CI). Permanent guard: no advisory prescribes `${VAR:-}`.

## 🚨 Pre-Flight / Dependencies 🚨

- [x] **Package Management:** no new deps. pnpm versions exercised via corepack.
- [x] **Dependency Versions:** pnpm 10.34.1 (pin), 10.34.3, 11.6.0 probed live.
- [x] **Project Context:** `docs/knowledge.md` (KN-CORE-2, KN-1), `docs/decisions.md` (DE-3, DE-11) reviewed; memory `project_pnpm_10_34_3_breaks_bkit_download` noted.
- [x] **Testing & Quality:** `docs/testing.md` tiers; validate-with-real-tool lesson applied (live dogfood).
- [x] **Prerequisite Plans:** none.

### 🔒 Gate 1: Prerequisites — PASS

## Architecture & Component Changes

### CI Template

#### [MODIFY] `.bkit/templates/.github/workflows/ci.yml`

- Install Dependencies step (`186-190`): multi-line `run:` — `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` then `pnpm install --frozen-lockfile`; keep `env: GH_BKIT_TOKEN`.
- Reframe job-level `GH_BKIT_TOKEN` comment (`36-44`) from ".npmrc env-sub" to "consumed by the `pnpm config set` auth step".

### Install Engine (detectors + advisories)

#### [MODIFY] `.bkit/src/bkit-postinstall.ts`

- `detectNpmrcAuth` (`94-101`): `present` iff `@cbartens:registry=` present; `missing` iff registry absent; `unknown` iff file absent. Rewrite doc-comment.
- NEW `detectNpmrcLegacyAuthToken(cwd)` + `npmrc-legacy-authtoken` advisory in post-install block (`~1980`): fires when project `.npmrc` still contains `//npm.pkg.github.com/:_authToken=`.
- `detectCiYmlMissingTokenEnv` (`239-277`): keep `GH_BKIT_TOKEN` env-mapping requirement; add "missing `pnpm config set …:_authToken` step" detection; re-key blocker to "next run will 401" (install step + no config-set step). Inline action text → new shape.
- Advisory constants: `GH_BKIT_TOKEN_MISSING_ACTION` (`1587`), `VERCEL_MISSING_ACTION` (`1613` → `installCommand` shim), `npmrc-missing-gh-packages` action (`1988`), empty-token action (`1947`) → new shape; bare `$GH_BKIT_TOKEN` only.

#### [MODIFY] `.bkit/src/bkit-modules.ts`

- First-install banner (`879-882`), CI merge-guidance block (`1659-1675`), region `~2052` → new shape. `scanForeignBkitUses` untouched.

### Tests

#### [MODIFY] `.bkit/src/bkit-postinstall.test.ts`, `bkit-preflight.test.ts`, `bkit-install.integration.test.ts`, `bkit-templates.test.ts`

- Per Derived Test Matrix. Keep `${GH_BKIT_TOKEN:-}` forbidance. Skim `bkit-challenge-tests.test.ts` (`150-206`, references `npmrc-missing-gh-packages`).

### Docs (bkit-repo + shipped template mirrors — keep bkit:start/end synced)

#### [MODIFY] `README.md`

- Quick-install block (`57-72`), checklist (`94/101`), §Consumer CI auth (`224-240`), §Consumer Vercel auth (`256-280`, ADD shim, keep "remove git-shim"), §Local env setup (one-time `pnpm config set`), Phase-3 table (`313/319`).

#### [MODIFY] `docs/deployments.md` + `.bkit/templates/docs/deployments.md`

- Presence-matrix `.npmrc` row (`272`) + GH-Actions row (`273`); §Consumer CI auth (`402`); confirm §Renovate read-auth (`193`, separate `renovate-local.json5` path — expect no change).

#### [MODIFY] `docs/knowledge.md` + `.bkit/templates/docs/knowledge.md`

- NEW shipped **KN-CORE-7**: pnpm ≥10.34.3 auth rework — project `.npmrc` env-sub 401s on install fetch (metadata/`view` misleadingly OK); fix = registry-only `.npmrc` + `pnpm config set` (writes `~/.npmrc` on 10.x, `~/.config/pnpm/auth.ini` on 11.x). Cross-ref KN-CORE-2; one-line note on bkit-repo-only KN-1 (`111`).

#### [MODIFY] `docs/decisions.md`

- NEW **DE-31**: user-level pnpm auth + Vercel `installCommand` shim — explicitly not a DE-3/BAR-164 regression.

#### [MODIFY] `docs/setup.md` (`16/69`), `docs/security.md` (`32`), `docs/architecture.md` (`95`), `.bkit/templates/.bkit/.env.example` (`13`)

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` (+template) | NEW KN-CORE-7; cross-ref KN-CORE-2/KN-1 |
| `docs/decisions.md` | NEW DE-31 |
| `docs/deployments.md` (+template) | presence matrix + Consumer CI auth |
| `docs/architecture.md` | `.npmrc` line (`95`) |
| `docs/setup.md` | `16/69` |
| `docs/security.md` | `32` |
| `README.md` | CI auth / Vercel / local / quick-install / checklist / phase-3 |

## Rollback Strategy

Code-only — `git revert` sufficient. No DB. Template/doc change; consumers re-run `bkit upgrade` to pick up new advisories.

## Agent Execution Runbook

- [x] **T1: De-risk `pnpm config set` form + reproduce bug.** **Done when:** old env-sub 401s on 10.34.3/11, new shape green on 10.34.1/10.34.3/11 (✅ done in planning).
- [x] **T2: CI template.** **Done when:** `.bkit/templates/.github/workflows/ci.yml` install step has `pnpm config set …:_authToken=$GH_BKIT_TOKEN` before `pnpm install`; comment reframed.
- [x] **T3: `detectNpmrcAuth` + legacy nudge.** **Done when:** registry-only `.npmrc` → `present`; `npmrc-legacy-authtoken` fires on legacy line; unit tests pass.
- [x] **T4: `detectCiYmlMissingTokenEnv`.** **Done when:** new shape passes; install-without-config-set flagged; blocker re-keyed; unit tests pass.
- [x] **T5: Advisory strings (postinstall + modules).** **Done when:** all four postinstall constants + three modules sites use new shape; no `${VAR:-}` anywhere; `bkit-preflight.test.ts` green.
- [x] **T6: Tests.** **Done when:** all Derived Test Matrix unit/integration rows pass; `bkit-templates.test.ts` asserts the config-set line.
- [x] **T7: Docs + template mirrors + DE-31/KN-CORE-7.** **Done when:** every Documentation Updates row done; bkit:start/end blocks byte-synced; `bkit check` clean.
- [x] **T8: Verify.** **Done when:** local gate green (typecheck, 1515 tests, prettier, vale 0-errors, slop, `bkit check` exit 0); tarball install + CLI smoke green on 10.34.3/11; registry-fetch green on 10.34.1/10.34.3/11; `bkit install` + `bkit upgrade` live → no false positives (Scenario A), migration nudge fires (Scenario B).

### 🔒 Gate 2 / 3 / 4 — all verified during execution (T2–T8 complete).

## Verification Plan

### Automated

- [ ] `pnpm turbo lint typecheck format:check test` green.
- [ ] Targeted vitest: `bkit-postinstall`, `bkit-preflight`, `bkit-templates`, `bkit-install.integration`.

### Manual (@live)

- [ ] `pnpm pack` → install tarball into a clean throwaway dir (registry-only `.npmrc` + `pnpm config set`), confirm `pnpm install --frozen-lockfile` resolves `@cbartens/bkit` on pnpm **10.34.1 / 10.34.3 / 11.6.0** (corepack).
- [ ] `bkit install` AND `bkit upgrade` live on a registry-only `.npmrc`: detectors emit correct nudges, **no false positives**; blocker fires when config-set step absent.
- [ ] Report results on #274; commit only on human go-ahead.
