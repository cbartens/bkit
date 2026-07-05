# bkit v0.4.0 — GitHub Packages npm Registry Distribution Implementation Plan (Split Index)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file (and the linked sub-plans) natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in the physical sub-plan documents. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> This plan was split from `plan-v3-checked.md` because the consolidated runbook exceeded the 100K-token-per-session budget (estimated ~115K). The split is **lossless** — every task, gate, constraint, and acceptance row from `plan-v3-checked.md` is preserved across the sub-plans below. Execute sub-plans **sequentially**: do NOT start sub-plan 2 until sub-plan 1 has reached the green hand-off state captured at its end.

## Sub-Plan Index

<!-- prettier-ignore -->
| # | File | Scope | Estimated tokens |
| --- | --- | --- | --- |
| 1 | [bar-138-gh-packages-distribution-plan-1.md](./bar-138-gh-packages-distribution-plan-1.md) | Phase A (pipeline foundation, pre.1 publish smoke) + Phase B Tasks B1–B7 (installer print constants + consumer/bkit-self CI YAML edits) + Phase C Tasks C0, C1, C1.5, C2 (Vitest manifest, print, release-workflow structural, template snapshot tests) | ~70K |
| 2 | [bar-138-gh-packages-distribution-plan-2.md](./bar-138-gh-packages-distribution-plan-2.md) | Phase B Tasks B8–B11.5 (docs rewrites/appends) + Tasks B12–B15 (dist rebuild, full local check, pre.2 publish + gate) + Phase C Tasks C3–C5 (scratch-consumer smoke + gate) + Phase D (PR, squash-merge, dev→main promotion, v0.4.0 production tag, BAR-131 resolution) + Gates 2/3/4 + final Verification Plan | ~55K |

**Total tasks across sub-plans:** 30 named tasks (A1–A5, B1–B15 incl. B11.5, C0–C5 incl. C1.5, D1–D5) + 5 mandatory testing/doc checklist items + 4 hard 🔒 Gates (Gate 1, Gate 2, Gate 3, Gate 4) + the inline gates within tasks (A5, B15, C5).

## Hand-off Contract Between Sub-Plans

Sub-plan 1 ends green when all of the following are true (verified via captured CLI / `gh` output):

1. `feat/bar-138-gh-packages-distribution` branch exists, branched off `main`.
2. `package.json` carries the new `publishConfig`, `private: false`, bare HTTPS `repository.url`, refreshed `description`. Version is at `0.4.0-pre.1`.
3. `.github/workflows/release.yml` exists and `v0.4.0-pre.1` published successfully to GitHub Packages (Task A5 gate green).
4. Print constants (`GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS`, `CI_YML_MERGE_INSTRUCTIONS`) and the `runCoreModule` first-install banner have been rewritten in `.agents/scripts/bkit-modules.ts`.
5. Consumer template `.agents/templates/.github/workflows/ci.yml` and bkit-self `.github/workflows/ci.yml` have had their dead `Configure private-repo auth` step removed; consumer template carries the install-step `env: GH_BKIT_TOKEN_INSTALL` block.
6. Vitest tests — Task C0 (manifest), Task C1 (installer print constants), Task C1.5 (`release.yml` structural), Task C2 (consumer ci.yml template snapshot) — are written and `pnpm test` passes.
7. **`dist/` has NOT yet been regenerated** — that intentionally happens in sub-plan 2 (Task B12) so the rebuild reflects the print-constant edits and is committed alongside the pre.2 tag commit.

Sub-plan 2 starts by re-reading `bar-138-gh-packages-distribution-plan-1.md` to confirm the above hand-off state is genuinely green before continuing with B8 (docs rewrites). Sub-plan 2 then drives the plan to ship: docs, dist rebuild, pre.2 tag + smoke, scratch-consumer smoke gate, PR open, squash-merge, dev→main promotion, production `v0.4.0` tag, and BAR-131 #2 resolution.

## Context & Goals

Migrate `@cbartens/bkit` distribution from a git-dependency (with consumer-side git auth-shim) to the **GitHub Packages npm registry**. Ships as **v0.4.0** in a single atomic cutover — no dual-publish, no feature flag. The change eliminates the entire git-clone + auth-shim story (private-repo clone + auth-shim, two surfaces, lifecycle-hook OOM trap, pnpm tag-drop) by switching to standard scoped-package semantics: `@cbartens:registry=https://npm.pkg.github.com` + `.npmrc` + `GH_BKIT_TOKEN_INSTALL` (with `read:packages` scope) on the consumer side.

This plan covers ONLY the bkit-side ship (the publishing pipeline, installer print messages, README/docs, ADR, pre-release validations, and a scratch-consumer smoke test). Per-consumer migrations (`app-gether-life`, `www-visitfrasercoast-com`, etc.) are out of scope and live in separate follow-up PRs after v0.4.0 lands.

**Success Criteria:**

- `npm publish` from a tag-push (`v*`) on the bkit repo succeeds against `https://npm.pkg.github.com/@cbartens/bkit` with the built-in `GITHUB_TOKEN` (`packages: write`).
- A scratch consumer repo with only `.npmrc` + `GH_BKIT_TOKEN_INSTALL` env installs `@cbartens/bkit@^0.4.0` end-to-end with zero git config or `installCommand` patching.
- `bkit install --ci` print messages reference `.npmrc` flow only — no `insteadOf` shim, no `installCommand` shim, no git auth language anywhere; `pnpm` silent-`.npmrc`-ignore footgun is called out verbatim in both missing/unknown branches.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative _(inherited from design — do not rewrite)_

As a bkit consumer (e.g. `app-gether-life`), I add a single `.npmrc` and the `GH_BKIT_TOKEN_INSTALL` env var to my repo, then run `pnpm add -D @cbartens/bkit@^0.4.0` and `pnpm install` — the package resolves from the GitHub Packages npm registry without any git-clone, `insteadOf` shim, or Vercel `installCommand` hack. Running `bkit install --full` afterwards prints AI-actionable migration instructions that reference the new `.npmrc` flow rather than the old git auth shim.

### Success Criteria _(inherited from design — do not rewrite)_

1. `npm publish` from a tag-push (`v*`) on the bkit repo succeeds against `https://npm.pkg.github.com/@cbartens/bkit` with the built-in `GITHUB_TOKEN` (`packages: write`).
2. A scratch consumer repo with only `.npmrc` + `GH_BKIT_TOKEN_INSTALL` env installs `@cbartens/bkit@^0.4.0` end-to-end (GitHub Actions and Vercel) with zero git config or `installCommand` patching.
3. `bkit install --ci` prints `.npmrc`-based AI instructions when `GH_BKIT_TOKEN_INSTALL` is missing/unknown and prints a Vercel env-var-only block when `vercel.json` is present (no git-shim language anywhere).
4. The seeded consumer CI template (`.agents/templates/.github/workflows/ci.yml`) sets `GH_BKIT_TOKEN_INSTALL` as an env on the install step and contains no `Configure private-repo auth` step. bkit-self's own `.github/workflows/ci.yml` likewise has the dead `Configure private-repo auth` step removed (it was never needed — bkit-self is the source repo).
5. Pre-release tags `v0.4.0-pre.1` (pipeline only) and `v0.4.0-pre.2` (prints + docs) both publish successfully before `v0.4.0` cuts; ADR `DE-3` records the distribution decision.

### Concrete Example _(plan expands from design)_

**Setup:** A scratch consumer repo `tmp/bar-138-smoke/` with a minimal `package.json`, no `.npmrc`, no GHA workflow. The maintainer has just published `v0.4.0-pre.2` to GitHub Packages from the bkit repo. The maintainer's shell exports `GH_BKIT_TOKEN_INSTALL` (PAT with `read:packages`).

**Steps:**

1. Maintainer runs `echo "@cbartens:registry=https://npm.pkg.github.com" > .npmrc; echo "//npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN_INSTALL}" >> .npmrc` → `.npmrc` written.
2. Maintainer runs `pnpm add -D @cbartens/bkit@0.4.0-pre.2` → pnpm resolves the tarball from `https://npm.pkg.github.com/@cbartens/bkit/-/...tgz`, `package.json` shows `"@cbartens/bkit": "0.4.0-pre.2"`, lockfile pins the registry URL.
3. Maintainer runs `pnpm exec bkit install --full` → bkit seeds `.agents/`, `.claude/`, `.cursor/`, `.github/workflows/ci.yml`, `.husky/`, `.vale/` etc.; print sink emits `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` (or `_UNKNOWN_`) referencing `.npmrc` setup and `read:packages` scope; first-install banner has NO `onlyBuiltDependencies` line.
4. Maintainer inspects the seeded `.github/workflows/ci.yml` → it has no `Configure private-repo auth` step and the install step carries `env: GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}`.
5. Maintainer commits `.npmrc`, pushes to a feature branch, sets `GH_BKIT_TOKEN_INSTALL` GHA secret → CI on the scratch repo turns green, install step pulls `@cbartens/bkit@0.4.0-pre.2` from GH Packages.

**Outcome:** The scratch consumer installs, runs, and CI-validates `@cbartens/bkit` over the registry path with zero git auth ceremony. Maintainer cuts the production `v0.4.0` tag immediately afterwards.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Tag-without-version-bump on bkit repo (re-tagging the same SHA against an already-published version). | `release.yml` re-runs the full check suite, then `npm publish` exits non-zero ("cannot publish over previously published version"). No silent overwrite. |
| Consumer still on v0.3.x git-dep model after v0.4.0 ships. | v0.3.x remains consumable from git (no dual-publish required); per-consumer migration is a separate PR — out of scope here. |
| Consumer has stale `GH_BKIT_TOKEN_INSTALL` PAT scoped only `Contents: read`. | `pnpm install` fails with 401 from the registry; installer print and README explicitly call out the required `read:packages` (classic) / Packages: read (fine-grained) scope. |
| Consumer with `vercel.json` containing the legacy `installCommand` git-shim. | `bkit install --ci` print directs the AI to remove the shim and rely on `.npmrc` + Vercel env var. |
| `GH_BKIT_TOKEN_INSTALL` is unset at consumer install time (CI secret missing or local shell missing the export). | pnpm v7.20+ silently ignores the entire `.npmrc` and falls back to npmjs.org → opaque 401. Installer print copy enumerates this exact symptom-to-cause mapping verbatim in both `_MISSING_` and `_UNKNOWN_` constants. |
| `release.yml` runs against a SHA whose committed `dist/` is stale. | `pnpm check:dist` fails before `npm publish`; tag is throwaway, maintainer re-builds locally and re-tags. |
| Pre-release tag `v0.4.0-pre.1` fails on `permissions: packages: write` mismatch. | Failure isolated to the throwaway pre-release tag; ADR `DE-3` documents fallback to `access: public` if needed. |
| `npm publish` from `release.yml` succeeds but the package is not associated with the source repo in GitHub Packages UI. | `repository.url` set to bare HTTPS (`https://github.com/cbartens/bkit.git`, no `git+` prefix) — GitHub Packages auto-links once first publish lands. |
| Consumer's `.npmrc` has `${GH_BKIT_TOKEN_INSTALL}` interpolated literally (no env expansion). | pnpm install fails with 401; README and installer print copy show the exact `${GH_BKIT_TOKEN_INSTALL}` env-interpolation form and warn against hardcoding. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task (now lives in sub-plan 1 or sub-plan 2 per the mapping below).

<!-- prettier-ignore -->
| Test description | Type | Target file | Sub-plan |
| --- | --- | --- | --- |
| `package.json` manifest fields render correctly: `private:false`, `publishConfig.registry`, `publishConfig.access`, bare HTTPS `repository.url`, refreshed `description`. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) or new `.agents/scripts/package-manifest.test.ts` | 1 (Task C0) |
| `release.yml` triggers on tag-push (`v*`) and contains: setup-node 20 + registry-url + scope, full check suite, `npm publish` with `NODE_AUTH_TOKEN: GITHUB_TOKEN`, `permissions: packages: write`. | Schema/lint (yamllint + structural assertion) | `.agents/scripts/release-workflow.test.ts` (new) | 1 (Task C1.5) |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` (`.npmrc` + `read:packages` + pnpm silent-ignore warning) when `gh secret list` reports missing. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | 1 (Task C1) |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS` (same pnpm silent-ignore warning) when `gh` is unavailable. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | 1 (Task C1) |
| `runCiModule` print sink contains the rewritten `VERCEL_AUTH_INSTRUCTIONS` (env-var-only, NO `installCommand` shim) when `vercel.json` is detected. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | 1 (Task C1) |
| `CI_YML_MERGE_INSTRUCTIONS` print sink contains rewritten `.npmrc` + `env: GH_BKIT_TOKEN_INSTALL` + `read:packages` guidance and no `Configure private-repo auth` directive. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | 1 (Task C1) |
| `runCoreModule` first-install banner does NOT contain the `onlyBuiltDependencies` line. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | 1 (Task C1) |
| Seeded consumer template `.agents/templates/.github/workflows/ci.yml` has NO `Configure private-repo auth` step and the install step carries `env: GH_BKIT_TOKEN_INSTALL`. | Snapshot/diff | `.agents/scripts/templates.test.ts` (extend or new) | 1 (Task C2) |
| bkit-self `.github/workflows/ci.yml` has NO `Configure private-repo auth` step (dead-code removal). | Manual + grep | shell command `grep -F 'Configure private-repo auth' .github/workflows/ci.yml` returns empty | 1 (Task B7) |
| `pnpm check:dist` passes after rebuilding `dist/` from the print-constant edits. | Script | `pnpm check:dist` (CI gate) | 2 (Task B12) |
| `v0.4.0-pre.1` publishes successfully to GH Packages from `release.yml` (pipeline-only validation). | Live release smoke | GitHub Actions run on tag push | 1 (Task A4–A5) |
| `v0.4.0-pre.2` publishes successfully (prints + docs included) from `release.yml`. | Live release smoke | GitHub Actions run on tag push | 2 (Task B14–B15) |
| Scratch consumer repo at `tmp/bar-138-smoke/` installs `@cbartens/bkit@0.4.0-pre.2` via `.npmrc` + `GH_BKIT_TOKEN_INSTALL` and `bkit install --full` runs clean. | Manual smoke | `tmp/bar-138-smoke/` (scratch repo) | 2 (Task C3–C5) |
| `v0.4.0` publishes successfully and is consumable via `^0.4.0` semver from the registry. | Live release smoke | GitHub Actions run on tag push | 2 (Task D4) |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

> [!WARNING]
> **Distribution model breaking change.** v0.4.0 hard-cuts from `pnpm add -D github:cbartens/bkit#vX.Y.Z` (git dependency) to `pnpm add -D @cbartens/bkit@^0.4.0` (GitHub Packages npm registry). v0.3.x consumers are **not** force-migrated — they continue to install from git unchanged — but any consumer that bumps to `^0.4.0` MUST add `.npmrc`, expand their `GH_BKIT_TOKEN_INSTALL` PAT scope to include `read:packages` (classic) / Packages: read (fine-grained), and remove their GHA `insteadOf` step + Vercel `installCommand` shim. **No dual-publish.** Per-consumer migrations are separate PRs after v0.4.0 lands.

> [!IMPORTANT]
> **PAT scope expansion (same env-var name).** `GH_BKIT_TOKEN_INSTALL` is reused (no rename) — only the required PAT scopes change. Existing `Contents: read`-only PATs will 401 against the registry. Migration prompt + README + ADR `DE-3` enumerate the new scope set.

**Naming decisions (final):**

- Package name: `@cbartens/bkit` (unchanged).
- Env-var name: `GH_BKIT_TOKEN_INSTALL` (unchanged; scope expanded).
- Workflow file: `.github/workflows/release.yml` (new).
- ADR: `DE-3` (next free ID per `decisions.md` template).
- Tags: `v0.4.0-pre.1` → `v0.4.0-pre.2` → `v0.4.0` (semver pre-release ordering).

**Manifest field deltas (`package.json`):**

<!-- prettier-ignore -->
| Field | Before (v0.3.x) | After (v0.4.0) |
| --- | --- | --- |
| `private` | `true` | `false` |
| `description` | "...installed as a git dependency from a private GitHub repo (no npm registry)." | rewritten to drop the lie; describes registry distribution |
| `repository.url` | `git+https://github.com/cbartens/bkit.git` | `https://github.com/cbartens/bkit.git` |
| `publishConfig` | (absent) | `{ "registry": "https://npm.pkg.github.com", "access": "restricted" }` |
| `version` | `0.3.0` | bumped to `0.4.0-pre.1` → `0.4.0-pre.2` → `0.4.0` per cadence |

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

Full rationale lives in the design document (`docs/plans/completed/202605/bar-138-gh-packages-distribution-design.md` § Approaches Considered). Summary of rejected alternatives:

- **Dual-publish (git + registry) transition window** — REJECTED. Design-input forbids; v0.3.x staying consumable from git is sufficient backward-compat.
- **Feature-flag gated dual-phase rollout** — REJECTED. Dead code, contradictory-instruction window between phases.
- **`prepublishOnly: tsc` + drop committed `dist/`** — REJECTED. Erodes the BAR-130 "no lifecycle hooks" invariant; next contributor adds `prepare` and re-summons the OOM.
- **Build in CI + attach tarball to GitHub Release** — REJECTED. Local dev breaks; tempts a `postinstall: pnpm build` re-introduction.
- **`release: published` event trigger (GitHub Releases UI)** — REJECTED. Doubles human ceremony per ship; awkward for `pre.*` tags.
- **Reusable composite workflow shared by `ci.yml` and `release.yml`** — REJECTED. YAGNI at 2 callers; ~5 LOC duplication does not justify `workflow_call` indirection.
- **`pnpm publish` instead of `npm publish`** — REJECTED. `setup-node` `registry-url` wiring assumes `npm`; pnpm has stricter lifecycle hooks; GH Packages docs use `npm publish`.
- **Single-shot validation via `npm pack`** — REJECTED. Doesn't exercise GH Packages auth or `GITHUB_TOKEN` scoping; first registry interaction would be the production cut.
- **New env-var name (e.g. `BKIT_NPM_TOKEN`)** — REJECTED. Forces consumers to rotate two secrets simultaneously during migration; same secret authenticates v0.3.x git-clone + v0.4.0 registry path.

**Future-phase recommendations (out of scope for v0.4.0):**

- After all consumers migrate, retire the v0.3.x branch and remove the legacy `Configure private-repo auth` step from any orphaned consumer template variants.
- Consider release-please / changesets if changelog automation becomes valuable; tag-push trigger is changelog-tooling-compatible.
- If a pre-release ever needs retraction, validate `npm deprecate` against GH Packages and document in ADR.

## Out of Scope

- **Per-consumer migrations** — `app-gether-life`, `www-visitfrasercoast-com`, etc. ship in separate PRs after v0.4.0 lands. Each consumer adds `.npmrc`, expands `GH_BKIT_TOKEN_INSTALL` scope, drops GHA `insteadOf` step + Vercel `installCommand` shim. Tracked as follow-ups in `docs/pending.md`.
- **Backward-compatible dual-publish** — no git+registry simultaneous publishing.
- **`BKIT_READ_TOKEN` rename** — already landed (v0.2.2); not re-litigated here.
- **Bumping bkit-self CI to Node 22** — design pins `release.yml` to Node 20 to match `ci.yml` and preserve `check:dist` determinism. Any future bump must happen in lock-step with a `dist/` regeneration commit.
- **`workflow_run` enforcement that ci.yml passed before release.yml runs** — `release.yml` re-runs the full check suite in-line instead. Single source of truth.

## Merge Method

**Merge method: always squash.** Single PR feat/bar-138-gh-packages-distribution → dev.

**Tag → branch mapping (pinned, no alternatives):**

- `v0.4.0-pre.1` and `v0.4.0-pre.2` are cut on the **feature branch's tip** (`feat/bar-138-gh-packages-distribution`). `release.yml` lives only on this branch until the squash-merge, and GitHub fires workflows from the workflow file at the tagged ref — this is the only path where the tag-triggered run can find `release.yml`.
- `v0.4.0` (production) is cut on **`main`** after the feature PR squash-merges to `dev` and `dev` flows into `main`. By that point `release.yml` exists on `main` via the squash commit.
- The "or against `dev` after intermediate squash-merges" alternative is explicitly REJECTED — it splits the model and gives the executing agent two contradictory paths.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` step "Configure private-repo auth" (lines 23–24) | (none — bkit-self is source repo, never a consumer) | DELETE | Dead code; `insteadOf` shim is consumer-only; cleanup fits this PR per design. |
| `.agents/templates/.github/workflows/ci.yml` step "Configure private-repo auth" (lines 23–24) | install step `env: GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}` block | DELETE | Replaced by `.npmrc` + env block; consumer no longer needs git auth-shim. |
| `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — `.npmrc` setup + `read:packages` + pnpm silent-ignore warning | DELETE | Old body references git auth-shim that no longer exists. |
| `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — same shape, `.npmrc` + pnpm silent-ignore warning | DELETE | Old body references git auth-shim. |
| `VERCEL_AUTH_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — Vercel env-var-only, NO `installCommand` shim | DELETE | Old body told consumer to add `installCommand` git-shim, now obsolete. |
| `CI_YML_MERGE_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — `.npmrc`-based merge guidance | DELETE | Old body references git auth-shim merge actions. |
| First-install banner `onlyBuiltDependencies: ["@cbartens/bkit"]` line in `runCoreModule` | (none — line removed) | DELETE | BAR-130 #5 workaround obsolete post-v0.3.0; registry packages with no lifecycle hooks do not need it. |
| `package.json#description` ("...installed as a git dependency from a private GitHub repo...") | rewritten description | DELETE | Description is now factually false. |
| `package.json#repository.url` `git+https://...` prefix | bare `https://github.com/cbartens/bkit.git` | DELETE | Standard npm convention; helps GH Packages "linked repository" UX. |
| `README.md` install / consumer-CI / Vercel-auth sections (git-dep model) | rewritten registry sections | DELETE | Whole-section rewrite; old prose contradicts shipped behavior. |
| `.agents/README.md` Distribution + "Required consumer config — pnpm 10 build-script allowlist" sections | rewritten registry sections | DELETE | Same as above; canonical agent-facing reference. |

## Security & Privacy

- [ ] **New API route** — n/a (no runtime API surface; this is build/distribution).
- [ ] **New DB table/column** — n/a.
- [ ] **Role-gated mutation** — n/a.
- [ ] **User input** — n/a (no runtime user input).
- [ ] **PII** — n/a (no logs of user data; `console.log` already used by installer).
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [x] **New secret/env var** — `GH_BKIT_TOKEN_INSTALL` env-var name unchanged. PAT scope expanded to include `read:packages` (classic) / Packages: read (fine-grained). Documented in README, installer prints, and ADR `DE-3`. Release workflow uses the built-in `GITHUB_TOKEN` (no new secret in bkit repo).

> [!IMPORTANT]
> **Token-scope drift risk on consumers.** The same env-var name reused with expanded PAT scope means a consumer's existing `Contents: read`-only token will silently 401 against the registry. Mitigation: installer print copy + README + ADR enumerate the required scopes verbatim. Per-consumer migration PRs will rotate scopes as part of the upgrade.

## Documentation Updates (master index)

Tracked individually inside sub-plan 2's runbook. Summary:

<!-- prettier-ignore -->
| File | Change required | Sub-plan |
| --- | --- | --- |
| `docs/decisions.md` | APPEND ADR `DE-3` (distribution model decision; rejected alternatives enumerated). | 2 (Task B10) |
| `docs/pending.md` | APPEND per-consumer migration entries (`app-gether-life`, `www-visitfrasercoast-com`, plus any others discovered). | 2 (Task B11) |
| `README.md` | Rewrite Install / Consumer CI auth / Consumer Vercel auth sections; delete pnpm 10 allowlist section. | 2 (Task B8) |
| `.agents/README.md` | Rewrite Distribution + Install/regenerate sections; delete pnpm 10 allowlist subsection. | 2 (Task B9) |
| `docs/knowledge.md` | APPEND `KN-N` entry for the pnpm v7.20+ silent-`.npmrc`-ignore footgun. | 2 (Task B11.5) |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Pipeline** | Delete `.github/workflows/release.yml`; revert `package.json#private` to `true` and remove `publishConfig`. | `git revert {feat/bar-138 squash SHA}` rolls everything back atomically. |
| **Code** | `git revert {squash SHA}` on `dev` (or `main` post-promotion). | Single squash commit reverts cleanly; no migration to undo. |
| **Published packages** | `npm deprecate @cbartens/bkit@<bad-version> "deprecated; use 0.3.x git-dep"` against GH Packages. | Cannot delete published versions; deprecation is the only mitigation. |
| **Risk window** | Between `v0.4.0` tag publish and any consumer bumping to `^0.4.0`. | Effectively zero — consumer migration is a separate PR per consumer; until they bump, they stay on v0.3.x git-dep. |

_DB changes: none — code-only — `git revert` sufficient. Deprecation is a sub-step for the registry-published artifact._

## Agent Execution Runbook

> The runbook is split across the two sub-plan files below. Execute them sequentially.

1. [`bar-138-gh-packages-distribution-plan-1.md`](./bar-138-gh-packages-distribution-plan-1.md) — Phase A (A1–A5) + Phase B Tasks B1–B7 + Phase C Tasks C0–C2 (incl. C1.5).
2. [`bar-138-gh-packages-distribution-plan-2.md`](./bar-138-gh-packages-distribution-plan-2.md) — Phase B Tasks B8–B15 (incl. B11.5) + Phase C Tasks C3–C5 + Phase D (D1–D5) + Gates 2/3/4 + Verification Plan + Manual Verification.
