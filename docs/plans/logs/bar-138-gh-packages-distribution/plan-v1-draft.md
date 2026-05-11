Verdict: PASS

<!-- verdict:end -->

# bkit v0.4.0 — GitHub Packages npm Registry Distribution Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

Migrate `@cbartens/bkit` distribution from a git-dependency (with consumer-side git auth-shim) to the **GitHub Packages npm registry**. Ships as **v0.4.0** in a single atomic cutover — no dual-publish, no feature flag. The change eliminates the entire git-clone + auth-shim story (private-repo clone + auth-shim, two surfaces, lifecycle-hook OOM trap, pnpm tag-drop) by switching to standard scoped-package semantics: `@cbartens:registry=https://npm.pkg.github.com` + `.npmrc` + `GH_BKIT_TOKEN` (with `read:packages` scope) on the consumer side.

This plan covers ONLY the bkit-side ship (the publishing pipeline, installer print messages, README/docs, ADR, pre-release validations, and a scratch-consumer smoke test). Per-consumer migrations (`app-gether-life`, `www-visitfrasercoast-com`, etc.) are out of scope and live in separate follow-up PRs after v0.4.0 lands.

**Success Criteria:**

- `npm publish` from a tag-push (`v*`) on the bkit repo succeeds against `https://npm.pkg.github.com/@cbartens/bkit` with the built-in `GITHUB_TOKEN` (`packages: write`).
- A scratch consumer repo with only `.npmrc` + `GH_BKIT_TOKEN` env installs `@cbartens/bkit@^0.4.0` end-to-end with zero git config or `installCommand` patching.
- `bkit install --ci` print messages reference `.npmrc` flow only — no `insteadOf` shim, no `installCommand` shim, no git auth language anywhere; `pnpm` silent-`.npmrc`-ignore footgun is called out verbatim in both missing/unknown branches.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative _(inherited from design — do not rewrite)_

As a bkit consumer (e.g. `app-gether-life`), I add a single `.npmrc` and the `GH_BKIT_TOKEN` env var to my repo, then run `pnpm add -D @cbartens/bkit@^0.4.0` and `pnpm install` — the package resolves from the GitHub Packages npm registry without any git-clone, `insteadOf` shim, or Vercel `installCommand` hack. Running `bkit install --full` afterwards prints AI-actionable migration instructions that reference the new `.npmrc` flow rather than the old git auth shim.

### Success Criteria _(inherited from design — do not rewrite)_

1. `npm publish` from a tag-push (`v*`) on the bkit repo succeeds against `https://npm.pkg.github.com/@cbartens/bkit` with the built-in `GITHUB_TOKEN` (`packages: write`).
2. A scratch consumer repo with only `.npmrc` + `GH_BKIT_TOKEN` env installs `@cbartens/bkit@^0.4.0` end-to-end (GitHub Actions and Vercel) with zero git config or `installCommand` patching.
3. `bkit install --ci` prints `.npmrc`-based AI instructions when `GH_BKIT_TOKEN` is missing/unknown and prints a Vercel env-var-only block when `vercel.json` is present (no git-shim language anywhere).
4. The seeded consumer CI template (`.agents/templates/.github/workflows/ci.yml`) sets `GH_BKIT_TOKEN` as an env on the install step and contains no `Configure private-repo auth` step. bkit-self's own `.github/workflows/ci.yml` likewise has the dead `Configure private-repo auth` step removed (it was never needed — bkit-self is the source repo).
5. Pre-release tags `v0.4.0-pre.1` (pipeline only) and `v0.4.0-pre.2` (prints + docs) both publish successfully before `v0.4.0` cuts; ADR `DE-3` records the distribution decision.

### Concrete Example _(plan expands from design)_

**Setup:** A scratch consumer repo `tmp/bar-138-smoke/` with a minimal `package.json`, no `.npmrc`, no GHA workflow. The maintainer has just published `v0.4.0-pre.2` to GitHub Packages from the bkit repo. The maintainer's shell exports `GH_BKIT_TOKEN` (PAT with `read:packages`).

**Steps:**

1. Maintainer runs `echo "@cbartens:registry=https://npm.pkg.github.com" > .npmrc; echo "//npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}" >> .npmrc` → `.npmrc` written.
2. Maintainer runs `pnpm add -D @cbartens/bkit@0.4.0-pre.2` → pnpm resolves the tarball from `https://npm.pkg.github.com/@cbartens/bkit/-/...tgz`, `package.json` shows `"@cbartens/bkit": "0.4.0-pre.2"`, lockfile pins the registry URL.
3. Maintainer runs `pnpm exec bkit install --full` → bkit seeds `.agents/`, `.claude/`, `.cursor/`, `.github/workflows/ci.yml`, `.husky/`, `.vale/` etc.; print sink emits `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` (or `_UNKNOWN_`) referencing `.npmrc` setup and `read:packages` scope; first-install banner has NO `onlyBuiltDependencies` line.
4. Maintainer inspects the seeded `.github/workflows/ci.yml` → it has no `Configure private-repo auth` step and the install step carries `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`.
5. Maintainer commits `.npmrc`, pushes to a feature branch, sets `GH_BKIT_TOKEN` GHA secret → CI on the scratch repo turns green, install step pulls `@cbartens/bkit@0.4.0-pre.2` from GH Packages.

**Outcome:** The scratch consumer installs, runs, and CI-validates `@cbartens/bkit` over the registry path with zero git auth ceremony. Maintainer cuts the production `v0.4.0` tag immediately afterwards.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Tag-without-version-bump on bkit repo (re-tagging the same SHA against an already-published version). | `release.yml` re-runs the full check suite, then `npm publish` exits non-zero ("cannot publish over previously published version"). No silent overwrite. |
| Consumer still on v0.3.x git-dep model after v0.4.0 ships. | v0.3.x remains consumable from git (no dual-publish required); per-consumer migration is a separate PR — out of scope here. |
| Consumer has stale `GH_BKIT_TOKEN` PAT scoped only `Contents: read`. | `pnpm install` fails with 401 from the registry; installer print and README explicitly call out the required `read:packages` (classic) / Packages: read (fine-grained) scope. |
| Consumer with `vercel.json` containing the legacy `installCommand` git-shim. | `bkit install --ci` print directs the AI to remove the shim and rely on `.npmrc` + Vercel env var. |
| `GH_BKIT_TOKEN` is unset at consumer install time (CI secret missing or local shell missing the export). | pnpm v7.20+ silently ignores the entire `.npmrc` and falls back to npmjs.org → opaque 401. Installer print copy enumerates this exact symptom-to-cause mapping verbatim in both `_MISSING_` and `_UNKNOWN_` constants. |
| `release.yml` runs against a SHA whose committed `dist/` is stale. | `pnpm check:dist` fails before `npm publish`; tag is throwaway, maintainer re-builds locally and re-tags. |
| Pre-release tag `v0.4.0-pre.1` fails on `permissions: packages: write` mismatch. | Failure isolated to the throwaway pre-release tag; ADR `DE-3` documents fallback to `access: public` if needed. |
| `npm publish` from `release.yml` succeeds but the package is not associated with the source repo in GitHub Packages UI. | `repository.url` set to bare HTTPS (`https://github.com/cbartens/bkit.git`, no `git+` prefix) — GitHub Packages auto-links once first publish lands. |
| Consumer's `.npmrc` has `${GH_BKIT_TOKEN}` interpolated literally (no env expansion). | pnpm install fails with 401; README and installer print copy show the exact `${GH_BKIT_TOKEN}` env-interpolation form and warn against hardcoding. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `package.json` manifest fields render correctly: `private:false`, `publishConfig.registry`, `publishConfig.access`, bare HTTPS `repository.url`, refreshed `description`. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) or new `.agents/scripts/package-manifest.test.ts` |
| `release.yml` triggers on tag-push (`v*`) and contains: setup-node 20 + registry-url + scope, full check suite, `npm publish` with `NODE_AUTH_TOKEN: GITHUB_TOKEN`, `permissions: packages: write`. | Schema/lint (yamllint + structural assertion) | `.agents/scripts/release-workflow.test.ts` (new) |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` (`.npmrc` + `read:packages` + pnpm silent-ignore warning) when `gh secret list` reports missing. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` (same pnpm silent-ignore warning) when `gh` is unavailable. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) |
| `runCiModule` print sink contains the rewritten `VERCEL_AUTH_INSTRUCTIONS` (env-var-only, NO `installCommand` shim) when `vercel.json` is detected. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) |
| `runCoreModule` first-install banner does NOT contain the `onlyBuiltDependencies` line. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) |
| Seeded consumer template `.agents/templates/.github/workflows/ci.yml` has NO `Configure private-repo auth` step and the install step carries `env: GH_BKIT_TOKEN`. | Snapshot/diff | `.agents/scripts/templates.test.ts` (extend or new) |
| bkit-self `.github/workflows/ci.yml` has NO `Configure private-repo auth` step (dead-code removal). | Manual + grep | shell command `grep -F 'Configure private-repo auth' .github/workflows/ci.yml` returns empty |
| `pnpm check:dist` passes after rebuilding `dist/` from the print-constant edits. | Script | `pnpm check:dist` (CI gate) |
| `v0.4.0-pre.1` publishes successfully to GH Packages from `release.yml` (pipeline-only validation). | Live release smoke | GitHub Actions run on tag push |
| `v0.4.0-pre.2` publishes successfully (prints + docs included) from `release.yml`. | Live release smoke | GitHub Actions run on tag push |
| Scratch consumer repo at `tmp/bar-138-smoke/` installs `@cbartens/bkit@0.4.0-pre.2` via `.npmrc` + `GH_BKIT_TOKEN` and `bkit install --full` runs clean. | Manual smoke | `tmp/bar-138-smoke/` (scratch repo) |
| `v0.4.0` publishes successfully and is consumable via `^0.4.0` semver from the registry. | Live release smoke | GitHub Actions run on tag push |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

> [!WARNING]
> **Distribution model breaking change.** v0.4.0 hard-cuts from `pnpm add -D github:cbartens/bkit#vX.Y.Z` (git dependency) to `pnpm add -D @cbartens/bkit@^0.4.0` (GitHub Packages npm registry). v0.3.x consumers are **not** force-migrated — they continue to install from git unchanged — but any consumer that bumps to `^0.4.0` MUST add `.npmrc`, expand their `GH_BKIT_TOKEN` PAT scope to include `read:packages` (classic) / Packages: read (fine-grained), and remove their GHA `insteadOf` step + Vercel `installCommand` shim. **No dual-publish.** Per-consumer migrations are separate PRs after v0.4.0 lands.

> [!IMPORTANT]
> **PAT scope expansion (same env-var name).** `GH_BKIT_TOKEN` is reused (no rename) — only the required PAT scopes change. Existing `Contents: read`-only PATs will 401 against the registry. Migration prompt + README + ADR `DE-3` enumerate the new scope set.

**Naming decisions (final):**

- Package name: `@cbartens/bkit` (unchanged).
- Env-var name: `GH_BKIT_TOKEN` (unchanged; scope expanded).
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

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

Full rationale lives in the design document (`docs/plans/drafts/bar-138-gh-packages-distribution-design.md` § Approaches Considered). Summary of rejected alternatives:

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

- **Per-consumer migrations** — `app-gether-life`, `www-visitfrasercoast-com`, etc. ship in separate PRs after v0.4.0 lands. Each consumer adds `.npmrc`, expands `GH_BKIT_TOKEN` scope, drops GHA `insteadOf` step + Vercel `installCommand` shim. Tracked as follow-ups in `docs/pending.md`.
- **Backward-compatible dual-publish** — no git+registry simultaneous publishing.
- **`BKIT_READ_TOKEN` rename** — already landed (v0.2.2); not re-litigated here.
- **Bumping bkit-self CI to Node 22** — design pins `release.yml` to Node 20 to match `ci.yml` and preserve `check:dist` determinism. Any future bump must happen in lock-step with a `dist/` regeneration commit.
- **`workflow_run` enforcement that ci.yml passed before release.yml runs** — `release.yml` re-runs the full check suite in-line instead. Single source of truth.

## Merge Method

**Merge method: always squash.** Single PR feat/bar-138-gh-packages-distribution → dev. Pre-release tags `v0.4.0-pre.1` and `v0.4.0-pre.2` are cut against the feature branch (or against `dev` after intermediate squash-merges if the branch ships in stages); production `v0.4.0` is cut against `main` after the feature PR squash-merges to `dev` and `dev` flows into `main`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` step "Configure private-repo auth" (lines 23–24) | (none — bkit-self is source repo, never a consumer) | DELETE | Dead code; `insteadOf` shim is consumer-only; cleanup fits this PR per design. |
| `.agents/templates/.github/workflows/ci.yml` step "Configure private-repo auth" (lines 23–24) | install step `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` block | DELETE | Replaced by `.npmrc` + env block; consumer no longer needs git auth-shim. |
| `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — `.npmrc` setup + `read:packages` + pnpm silent-ignore warning | DELETE | Old body references git auth-shim that no longer exists. |
| `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` constant body in `.agents/scripts/bkit-modules.ts` | rewritten body — same shape, `.npmrc` + pnpm silent-ignore warning | DELETE | Old body references git auth-shim. |
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
- [x] **New secret/env var** — `GH_BKIT_TOKEN` env-var name unchanged. PAT scope expanded to include `read:packages` (classic) / Packages: read (fine-grained). Documented in README, installer prints, and ADR `DE-3`. Release workflow uses the built-in `GITHUB_TOKEN` (no new secret in bkit repo).

> [!IMPORTANT]
> **Token-scope drift risk on consumers.** The same env-var name reused with expanded PAT scope means a consumer's existing `Contents: read`-only token will silently 401 against the registry. Mitigation: installer print copy + README + ADR enumerate the required scopes verbatim. Per-consumer migration PRs will rotate scopes as part of the upgrade.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` for required packages. No new runtime deps; only manifest fields change. `pnpm-lock.yaml` should remain stable post-edit (no new entries).
- [ ] **Dependency Versions:** Spot-check `pnpm --version` (matches `package.json#packageManager` = `pnpm@10.33.0`), `node --version` (≥20), `gh --version`, `npm --version`. Confirm `actions/setup-node@v4`, `pnpm/action-setup@v4` are current pins (already used in `ci.yml`).
- [ ] **User Context:** Verify maintainer has push access to `cbartens/bkit` and `packages: write` is available on the built-in `GITHUB_TOKEN` (default for private repos in same owner). Verify maintainer has a local `GH_BKIT_TOKEN` PAT with `read:packages` for the scratch-consumer smoke test.
- [ ] **Pending Blockers:** Linear search for label `blocker` referencing BAR-138 / BAR-130 / BAR-131. Confirm `BKIT_READ_TOKEN → GH_BKIT_TOKEN` rename (v0.2.2) has fully landed (design assumes; out of scope here).
- [ ] **Project Context:** Re-read `docs/decisions.md` for prior `DE-*` entries (next ID = `DE-3` per current count). Re-read `docs/knowledge.md` for any BAR-130 lifecycle-hook lessons that constrain `dist/` handling.
- [ ] **Testing & Quality:** Align with `docs/testing.md` — Vitest unit only for installer print constants; no Playwright; no integration tests for build/distribution path.
- [ ] **Prerequisite Plans:** None. v0.3.0 (BAR-130) lifecycle-hook removal already shipped; this builds on top.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars:** No new secrets in bkit repo (uses built-in `GITHUB_TOKEN`). Verify the bkit repo's "Workflow permissions" setting allows `packages: write` for `GITHUB_TOKEN` (Settings → Actions → General → Workflow permissions). If repo defaults to read-only, the `permissions:` block in `release.yml` must explicitly grant `packages: write` (already in the design).
- [ ] **Architecture & UI:** No UI; architecture changes documented in ADR `DE-3` and `.agents/README.md` Distribution section.
- [ ] **Observability:** Installer prints already follow `[bkit] {message}` convention. No new log names; no new tracing.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None. This feature touches build, distribution, and CLI text only. No persistent data; no DB reads/writes.

### Data Schema Changes

None.

## Architecture & Component Changes

Distribution model shift from git-dep (`github:cbartens/bkit#vX.Y.Z`) to GitHub Packages npm registry (`@cbartens:registry=https://npm.pkg.github.com`). Two coordinated surfaces: (1) **bkit publishing pipeline** (this PR's scope) — tag-push triggers `release.yml`, builds in CI, validates `dist/` is fresh, publishes via `npm publish` with built-in `GITHUB_TOKEN` + `packages: write`; (2) **consumer migration guide** (out of scope; per-consumer PRs after ship).

**Invariants preserved (do NOT regress):**

- No lifecycle hooks in the published package — `prepare` / `prepublishOnly` / `postinstall` stay forbidden (BAR-130 v0.3.0 invariant). `dist/` remains pre-built and committed; `check:dist` is the staleness gate.
- `checkBkitTokenSecret` and the `GH_BKIT_TOKEN` env-var name are unchanged — only PAT scope expands and the surrounding instructional copy changes.

### Database Migrations

Not applicable.

### Build & Distribution

#### [MODIFY] `package.json`

- **Existence Check:** Confirmed (read at session start).
- Flip `private: true` → `private: false`.
- Rewrite `description` to drop the "git dependency from a private GitHub repo (no npm registry)" lie; new copy describes scoped-package distribution via GitHub Packages.
- Strip `git+` prefix from `repository.url`: `git+https://github.com/cbartens/bkit.git` → `https://github.com/cbartens/bkit.git`.
- Add `publishConfig`:
  ```json
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
  ```
- Bump `version` per cadence: `0.3.0` → `0.4.0-pre.1` (pipeline tag) → `0.4.0-pre.2` (prints+docs tag) → `0.4.0` (production).
- DO NOT add any `prepare` / `prepublishOnly` / `postinstall` script (invariant).
- `files` array stays: `["dist", ".agents", "README.md"]` (verified — already correct for registry shipping).

#### [NEW] `.github/workflows/release.yml`

- New file. Triggers `on: push: tags: ['v*']`.
- `permissions: { contents: read, packages: write }`.
- Job `release` on `ubuntu-latest`. Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `node-version: 20`, `registry-url: https://npm.pkg.github.com`, `scope: '@cbartens'`.
  3. `pnpm/action-setup@v4` (no `with:` — pnpm version sourced from `package.json#packageManager`).
  4. `pnpm install --frozen-lockfile`.
  5. `pnpm typecheck`.
  6. `pnpm test`.
  7. `pnpm format:check`.
  8. `pnpm lint:prose`.
  9. `pnpm lint:slop`.
  10. `pnpm check:dist`.
  11. `npm publish` with env `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- Pinned Node 20 to match `ci.yml` (preserves `check:dist` determinism per design).
- `npm publish` (NOT `pnpm publish`) — matches GH Packages docs; `setup-node` registry-url wiring assumes `npm`.
- Full check suite re-run on tagged SHA (no `workflow_run` trust on prior CI) — design Open-Question resolution.

### Installer Print Constants

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Confirmed.
- Replace `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` body — drop git-shim language; new copy directs the AI to:
  - Add `.npmrc` with `@cbartens:registry=https://npm.pkg.github.com` + `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`.
  - Set `GH_BKIT_TOKEN` GHA secret (PAT with `read:packages` / Packages: read scope; classic OR fine-grained).
  - Verbatim warning: pnpm v7.20+ silently ignores `.npmrc` when `${GH_BKIT_TOKEN}` env is unset → install falls back to npmjs.org → opaque 401 (NOT "token missing"). Phrase so an AI agent can map symptom → cause.
- Replace `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` body — same shape as `_MISSING_`; include the same pnpm silent-ignore warning so symptom-to-cause is consistent across both states.
- Replace `VERCEL_AUTH_INSTRUCTIONS` body — Vercel env-var-only setup; explicitly tells AI to REMOVE any legacy `installCommand: "git config --global url.\"...\".insteadOf ... && pnpm install"` and replace with plain `pnpm install` (or remove `installCommand` entirely), plus add `GH_BKIT_TOKEN` via `vercel env add` for preview + production. Heuristic (`detectVercelProject`) unchanged.
- Replace `CI_YML_MERGE_INSTRUCTIONS` body — `.npmrc`-based merge guidance: tells AI to (a) ensure `.npmrc` exists at repo root, (b) ensure install step has `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`, (c) remove any `Configure private-repo auth` `git config --global url.…insteadOf` step, (d) ensure GHA secret `GH_BKIT_TOKEN` has `read:packages` scope.
- In `runCoreModule` first-install banner: REMOVE the `3. Add to pnpm-workspace.yaml or package.json: onlyBuiltDependencies: ["@cbartens/bkit"]` block. Renumber remaining steps. Update step 1 prose to reference `read:packages` scope.
- `checkBkitTokenSecret()` and `detectVercelProject()` function bodies unchanged — only the surrounding string constants change.

### Consumer CI Template

#### [MODIFY] `.agents/templates/.github/workflows/ci.yml`

- **Existence Check:** Confirmed.
- DELETE the "Configure private-repo auth" step (lines 23–24).
- Modify the "Install dependencies" step to add an `env:` block:
  ```yaml
  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    env:
      GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
  ```
- The consumer is expected to commit `.npmrc` at their repo root (out of scope for the bkit-side seed; documented in `CI_YML_MERGE_INSTRUCTIONS` and README).
- Token replacements (`{{DEFAULT_BRANCH}}`, `{{NODE_VERSION}}`) unchanged.

### bkit-self CI

#### [MODIFY] `.github/workflows/ci.yml`

- **Existence Check:** Confirmed (read at session start).
- DELETE the "Configure private-repo auth" step (lines 23–24). Per design — bkit-self is the source repo, never a consumer of `@cbartens/bkit`; the `insteadOf` shim is dead code today. Cleanup fits this PR because the templated equivalent is being touched and leaving the dead step is misleading documentation for any agent reading bkit-self's ci.yml as a reference.
- DO NOT add any registry-auth step to bkit-self's ci.yml. bkit-self does NOT install `@cbartens/bkit` from the registry — it uses local source via `pnpm tsx .agents/scripts/bkit-install.ts` and `pnpm bkit`.

### Documentation

#### [MODIFY] `README.md`

- **Existence Check:** Confirmed.
- Rewrite `## Install` section — replace `pnpm add -D github:cbartens/bkit#v0.2.0` with `pnpm add -D @cbartens/bkit@^0.4.0`; remove pnpm tag-drop note (no longer applies on registry path).
- DELETE `### ⚠️ One-time consumer config (pnpm 10+)` section (the `onlyBuiltDependencies` allowlist is obsolete — registry packages with no lifecycle hooks do not need it).
- Rewrite `## Consumer CI auth` section — single GitHub Packages auth section: (1) PAT scope = `read:packages` (classic) / Packages: read (fine-grained); (2) GHA secret name = `GH_BKIT_TOKEN`; (3) `.npmrc` snippet at repo root; (4) install step `env:` block; (5) explicit pnpm silent-ignore warning.
- Rewrite `## Consumer Vercel auth` section — env-var-only: (1) `vercel env add GH_BKIT_TOKEN preview production`; (2) `.npmrc` committed at repo root is sufficient — NO `installCommand` shim required; (3) explicit warning that any pre-existing `installCommand` git-shim must be removed.
- Refresh any `## Removed in v0.2.0` historical-breaking-changes block to also note v0.4.0 git-dep cutover.

#### [MODIFY] `.agents/README.md`

- **Existence Check:** Confirmed.
- Rewrite `## Distribution` section — describe scoped-package distribution via GH Packages registry; drop the "not published to the npm registry" sentence and the "git dependency from `github.com/cbartens/bkit`" sentence.
- DELETE `### Required consumer config — pnpm 10 build-script allowlist` section (registry packages with no lifecycle hooks).
- Rewrite `## Install / regenerate` opening prose: replace `pnpm add -D github:cbartens/bkit` with `pnpm add -D @cbartens/bkit@^0.4.0`.

#### [MODIFY] `docs/decisions.md`

- **Existence Check:** Confirmed.
- APPEND new ADR entry at EOF (per file's append-only rule):
  - `## DE-3: bkit Distribution via GitHub Packages npm Registry (2026-05-06)`
  - **Category:** infra
  - **Status:** active
  - **Decision:** Distribute `@cbartens/bkit` via GitHub Packages npm registry (`https://npm.pkg.github.com`) starting v0.4.0; v0.3.x remains consumable from git but is frozen.
  - **Why:** Eliminates four classes of friction inherited from git-dep (private-repo clone needs git auth → consumer auth-shim; two surfaces — Actions + Vercel; lifecycle-hook OOM trap; pnpm tag-drop). Registry path is standard scoped-package semantics with one auth file (`.npmrc`) and one env var.
  - **Discarded:** (1) npmjs.org public registry — package is private; private-org plan adds cost. (2) Continue git-dep — all four friction classes persist. (3) GitHub Releases tarball URL — clunky version pinning, no semver resolution. (4) Vendor bkit per-consumer — N×duplication; manual sync. (5) Dual-publish git+registry — code-path drift; contradictory installer guidance.
  - **Source:** phase
  - **Related:** BAR-138, BAR-130 (#5 lifecycle-hook OOM), `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`, `package.json`, `.github/workflows/release.yml`

#### [MODIFY] `docs/pending.md`

- **Existence Check:** Confirmed.
- APPEND a deferred-issue entry for per-consumer migrations (one row per known consumer). Entry per-consumer:
  - `## Consumer migration to @cbartens/bkit registry path — {consumer-name} (2026-05-06)`
  - **Type:** issue
  - **Category:** infra
  - **Severity:** normal
  - **Status:** open
  - **Description:** {consumer-name} still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc`, expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` shim.
  - **Source:** phase
  - **Related:** BAR-138, DE-3, `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`
- Known consumers to enumerate: `app-gether-life`, `www-visitfrasercoast-com`. (Add others if discovered during build.)

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | APPEND ADR `DE-3` (distribution model decision; rejected alternatives enumerated). |
| `docs/pending.md` | APPEND per-consumer migration entries (`app-gether-life`, `www-visitfrasercoast-com`, plus any others discovered). |
| `README.md` | Rewrite Install / Consumer CI auth / Consumer Vercel auth sections; delete pnpm 10 allowlist section. |
| `.agents/README.md` | Rewrite Distribution + Install/regenerate sections; delete pnpm 10 allowlist subsection. |
| `docs/knowledge.md` | (No change required — no new gotcha emerges from this ship beyond what ADR `DE-3` captures. If pnpm silent-ignore behavior surprises during build/debug, add KN-N entry then.) |

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

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.

### Phase A — Pipeline foundation (validates publishing path before touching prints)

- [ ] **Task A1: Branch off `main`.**
  - Scope: Create branch `feat/bar-138-gh-packages-distribution` off `main`.
  - Acceptance: `git rev-parse --abbrev-ref HEAD` returns `feat/bar-138-gh-packages-distribution`; branch tip matches `main` tip.
  - Verification: `git log -1 --oneline` matches `git log -1 --oneline main`.

- [ ] **Task A2: Edit `package.json` manifest fields (publish config + repo URL + description).**
  - Scope: Flip `private: true → false`. Strip `git+` prefix from `repository.url`. Rewrite `description` (drop the "git dependency from a private GitHub repo (no npm registry)" lie). Add `publishConfig: { registry: "https://npm.pkg.github.com", access: "restricted" }`. DO NOT bump `version` yet (`v0.4.0-pre.1` bump happens in Task A4 just before tag).
  - Acceptance: `node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf-8')).publishConfig)"` prints the registry+access object. `private` is `false`. `repository.url` is bare HTTPS.
  - Verification: `git diff package.json` shows only those four field deltas; `pnpm install --frozen-lockfile` re-runs cleanly (lockfile untouched).

- [ ] **Task A3: Create `.github/workflows/release.yml`.**
  - Scope: New file per the design (tag-push trigger on `v*`, `permissions: packages:write`, Node 20, setup-node `registry-url: https://npm.pkg.github.com` + `scope: '@cbartens'`, pnpm/action-setup, frozen install, full check suite — typecheck → test → format:check → lint:prose → lint:slop → check:dist — then `npm publish` with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`).
  - Acceptance: File exists at `.github/workflows/release.yml`. `yamllint` (or `actionlint` if available) passes. `grep -F 'npm publish' .github/workflows/release.yml` matches; `grep -F 'pnpm publish' .github/workflows/release.yml` returns empty.
  - Verification: Visual diff against the design doc § "Flow 1 — Release pipeline" step list — all 11 steps present in order.

- [ ] **Task A4: Bump `version` to `0.4.0-pre.1`, commit, tag.**
  - Scope: Edit `package.json#version` → `0.4.0-pre.1`. Commit `feat(bar-138): publishConfig + release.yml for GH Packages [skip build] [skip ci]` is INCORRECT — this commit IS the code change that needs CI. Use `feat(bar-138): publishConfig + release.yml for GH Packages`. Push branch. Tag `v0.4.0-pre.1` on the same SHA. Push tag.
  - Acceptance: `git describe --tags --exact-match` on the tip = `v0.4.0-pre.1`. `gh run list --workflow=release.yml --limit=1` shows the tagged run starting.
  - Verification: Wait for the run; `gh run view --log` for that run shows full check suite green and `npm publish` printing the published version. Visit `https://github.com/cbartens/bkit/packages` and confirm `@cbartens/bkit@0.4.0-pre.1` is listed.

- [ ] **Task A5 🔒 GATE — pre.1 publish smoke validates pipeline before any print/doc edits.**
  - Scope: If Task A4 fails (release.yml red, 401 on `npm publish`, `permissions: packages:write` mismatch, etc.), STOP. Diagnose and fix release.yml on the same branch; re-tag `v0.4.0-pre.1` only after deleting the failed tag (`git tag -d v0.4.0-pre.1; git push origin :refs/tags/v0.4.0-pre.1`); re-publish. Do NOT proceed to Phase B until pre.1 publish is green.
  - Acceptance: GH Packages UI shows `@cbartens/bkit@0.4.0-pre.1` published successfully. `release.yml` run on `v0.4.0-pre.1` is green end-to-end.
  - Verification: `gh api -H "Accept: application/vnd.github+json" /users/cbartens/packages/npm/bkit/versions` returns `0.4.0-pre.1` in the version list.

### Phase B — Installer prints + templates + bkit-self ci.yml + docs (validates UX layer)

- [ ] **Task B1: Rewrite `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` constant in `.agents/scripts/bkit-modules.ts`.**
  - Scope: Replace body verbatim with the `.npmrc`-based AI-actionable block. MUST include: (a) `.npmrc` snippet (registry + `_authToken=${GH_BKIT_TOKEN}`), (b) `GH_BKIT_TOKEN` GHA secret instructions with `read:packages` (classic) / Packages: read (fine-grained) PAT scope, (c) verbatim pnpm v7.20+ silent-ignore-on-unset-env warning so an AI agent can map symptom → cause.
  - Acceptance: New constant body contains literal substrings `@cbartens:registry=https://npm.pkg.github.com`, `_authToken=${GH_BKIT_TOKEN}`, `read:packages`, `pnpm`, `silently ignores`. Old git-shim language strings (`insteadOf`, `git config --global url.`) are absent.
  - Verification: Vitest unit test (Task C1) asserts these substrings in the constant body. Manual inspection: `grep -n 'insteadOf' .agents/scripts/bkit-modules.ts` returns empty.

- [ ] **Task B2: Rewrite `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` constant.**
  - Scope: Same shape as `_MISSING_`; same pnpm silent-ignore warning verbatim; copy adapted for "couldn't auto-check" framing (no `gh` CLI / not a GH repo).
  - Acceptance: New body contains the same `.npmrc`/`read:packages`/silent-ignore substrings. No `insteadOf` / git-shim language.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B3: Rewrite `VERCEL_AUTH_INSTRUCTIONS` constant.**
  - Scope: New body — env-var-only Vercel setup. Tells AI to (a) `vercel env add GH_BKIT_TOKEN preview` + `production`, (b) commit `.npmrc` at repo root, (c) REMOVE any pre-existing `installCommand: "git config --global url.…insteadOf … && pnpm install"` (set `installCommand` to `pnpm install` or remove the key entirely), (d) trigger redeploy. Heuristic (`detectVercelProject`) unchanged.
  - Acceptance: New body contains `vercel env add GH_BKIT_TOKEN`, `.npmrc`, `Remove` (referring to `installCommand` shim). Old `git config --global url.…` literal absent.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B4: Rewrite `CI_YML_MERGE_INSTRUCTIONS` constant.**
  - Scope: New body — `.npmrc`-based merge guidance for a consumer's existing ci.yml: (a) commit `.npmrc` at repo root, (b) ensure install step has `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`, (c) remove any `Configure private-repo auth` `git config --global url.…insteadOf` step, (d) GHA secret has `read:packages` PAT scope.
  - Acceptance: New body contains `.npmrc`, `env: GH_BKIT_TOKEN`, `Remove` (or equivalent for the dead auth-shim step), `read:packages`. Old auth-shim merge actions absent.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B5: Remove `onlyBuiltDependencies` line from first-install banner in `runCoreModule`.**
  - Scope: In the `printSink.push(\`...\`)`block, delete step`3. Add to pnpm-workspace.yaml or package.json: onlyBuiltDependencies: ["@cbartens/bkit"]`. Renumber remaining steps. Update step 1 prose for `read:packages` scope (token requirement).
  - Acceptance: First-install banner string contains no `onlyBuiltDependencies` substring. Step numbering is contiguous (1, 2 only — `prepare` script note is part of step 2's `scriptEntries` JSON).
  - Verification: Vitest unit test (Task C1) asserts `onlyBuiltDependencies` is absent from the banner constant. `pnpm test` green.

- [ ] **Task B6: Edit `.agents/templates/.github/workflows/ci.yml` (consumer CI template).**
  - Scope: DELETE the "Configure private-repo auth" step (lines 23–24). Add `env: { GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }} }` block to the "Install dependencies" step. Token replacements (`{{DEFAULT_BRANCH}}`, `{{NODE_VERSION}}`) unchanged.
  - Acceptance: `grep -F 'Configure private-repo auth' .agents/templates/.github/workflows/ci.yml` returns empty. `grep -A1 'Install dependencies' .agents/templates/.github/workflows/ci.yml` shows the install run line followed by the `env:` block.
  - Verification: `yamllint` passes against the template. Snapshot test (Task C2) asserts the diff.

- [ ] **Task B7: Edit `.github/workflows/ci.yml` (bkit-self CI).**
  - Scope: DELETE the "Configure private-repo auth" step (lines 23–24). DO NOT add any registry-auth — bkit-self does not consume the published package.
  - Acceptance: `grep -F 'Configure private-repo auth' .github/workflows/ci.yml` returns empty.
  - Verification: `yamllint` passes. Push to feature branch and confirm `ci.yml` runs green (the deleted step was dead — removal must not break anything).

- [ ] **Task B8: Rewrite `README.md` install + consumer-CI + Vercel sections.**
  - Scope: `## Install` — replace `pnpm add -D github:cbartens/bkit#v0.2.0` with `pnpm add -D @cbartens/bkit@^0.4.0`; remove pnpm tag-drop note. DELETE `### ⚠️ One-time consumer config (pnpm 10+)` section. Rewrite `## Consumer CI auth`: PAT scope = `read:packages`; GHA secret = `GH_BKIT_TOKEN`; `.npmrc` snippet at repo root; install step `env:` block; explicit pnpm silent-ignore warning. Rewrite `## Consumer Vercel auth`: env-var-only; `vercel env add` for preview + production; explicit removal of any pre-existing `installCommand` git-shim.
  - Acceptance: `grep -F 'github:cbartens/bkit' README.md` returns empty. `grep -F '@cbartens/bkit@^0.4.0' README.md` matches. `grep -F 'onlyBuiltDependencies' README.md` returns empty (or only in v0.2.0 historical-removal context; verify). `grep -F 'installCommand' README.md` shows context that explicitly tells consumers to remove it.
  - Verification: Manual prose review for tone consistency; `pnpm format:check` and `pnpm lint:prose` green.

- [ ] **Task B9: Rewrite `.agents/README.md` Distribution + Install sections.**
  - Scope: `## Distribution` — describe scoped-package distribution via GH Packages; drop "not published to the npm registry" + "git dependency from `github.com/cbartens/bkit`" sentences. DELETE `### Required consumer config — pnpm 10 build-script allowlist` subsection. `## Install / regenerate` opening prose: replace `pnpm add -D github:cbartens/bkit` with `pnpm add -D @cbartens/bkit@^0.4.0`.
  - Acceptance: Same `grep` checks as README — no `github:cbartens/bkit` substrings; new `@cbartens/bkit@^0.4.0` substring present. `onlyBuiltDependencies` removed from this file.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green.

- [ ] **Task B10: Append ADR `DE-3` to `docs/decisions.md`.**
  - Scope: APPEND new entry at EOF (file is append-only; respect `<!-- bkit:end -->` boundary — append BELOW it). Body per design (Decision/Why/Discarded/Source/Related fields populated as enumerated in `Architecture & Component Changes § Documentation`).
  - Acceptance: `grep -F '## DE-3:' docs/decisions.md` matches. ADR follows the file's documented format header.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green. Visual review of the appended block.

- [ ] **Task B11: Append per-consumer migration entries to `docs/pending.md`.**
  - Scope: APPEND one entry per known consumer (`app-gether-life`, `www-visitfrasercoast-com`). Each entry per the file's documented format. Reference `BAR-138`, `DE-3`, design doc path.
  - Acceptance: `grep -c '## Consumer migration to @cbartens/bkit' docs/pending.md` returns ≥2.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green.

- [ ] **Task B12: Regenerate `dist/`.**
  - Scope: Run `pnpm build` (tsc emit). Inspect `git diff dist/` — should reflect the print-constant edits from Tasks B1–B5 (no other changes).
  - Acceptance: `pnpm check:dist` returns non-zero BEFORE running `pnpm build` (proves dist was stale), and zero AFTER (proves the rebuild matches committed dist after the edit). Stage-and-commit dist alongside the source edits.
  - Verification: `git diff --stat HEAD~1 dist/` shows only the print-constant deltas. `pnpm bkit check` runs without crashing locally.

- [ ] **Task B13: Run full local check suite.**
  - Scope: `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm lint:slop && pnpm check:dist`. All must pass.
  - Acceptance: Every script exits 0.
  - Verification: Capture run output; if any fails, fix before tagging pre.2.

- [ ] **Task B14: Bump `version` to `0.4.0-pre.2`, commit, tag.**
  - Scope: Edit `package.json#version` → `0.4.0-pre.2`. Commit `feat(bar-138): installer prints + README + ADR DE-3 for GH Packages`. Push branch. Tag `v0.4.0-pre.2` on the same SHA. Push tag.
  - Acceptance: `git describe --tags --exact-match` = `v0.4.0-pre.2`. `gh run list --workflow=release.yml --limit=1` shows the tagged run starting.
  - Verification: `gh run view --log` for that run shows full check suite green and `npm publish` succeeds. `https://github.com/cbartens/bkit/packages` shows `@cbartens/bkit@0.4.0-pre.2`.

- [ ] **Task B15 🔒 GATE — pre.2 publish smoke validates print/doc layer before scratch-consumer test.**
  - Scope: If pre.2 publish fails, STOP. Diagnose; the failure surface is now print-constant or doc related (since pre.1 already validated the pipeline). Fix on branch; re-tag only after deleting the failed tag.
  - Acceptance: pre.2 visible in GH Packages UI; release.yml run green.
  - Verification: `gh api …/packages/npm/bkit/versions` returns `0.4.0-pre.2`.

### Phase C — Tests + scratch-consumer smoke

- [ ] **Task C1: Extend (or create) Vitest unit tests for installer print constants.**
  - Scope: In `.agents/scripts/bkit-modules.test.ts` (or a new `.agents/scripts/install-prints.test.ts` — match existing test conventions for that source file by inspecting the dir before deciding). Add tests asserting:
    - `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` contains `.npmrc`, `_authToken=${GH_BKIT_TOKEN}`, `read:packages`, `silently ignores`. Does NOT contain `insteadOf` or `git config --global url.`.
    - `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` same.
    - `VERCEL_AUTH_INSTRUCTIONS` contains `vercel env add GH_BKIT_TOKEN`, `.npmrc`, `Remove` (referring to `installCommand`). Does NOT contain `git config --global url.`.
    - `CI_YML_MERGE_INSTRUCTIONS` contains `.npmrc`, `env: GH_BKIT_TOKEN`, `read:packages`. Does NOT contain `Configure private-repo auth` (as a directive to add).
    - `runCoreModule` first-install banner does NOT contain `onlyBuiltDependencies`.
  - Acceptance: New tests are in the file, `pnpm test` green.
  - Verification: Comment out one print constant edit locally → corresponding test fails; revert.

- [ ] **Task C2: Add snapshot/diff test for `.agents/templates/.github/workflows/ci.yml`.**
  - Scope: Either (a) add to existing template-snapshot test file if one exists in `.agents/scripts/`, or (b) create `.agents/scripts/templates.test.ts` with a Vitest snapshot of the rendered template post-edit. Test asserts: no `Configure private-repo auth` substring; install step contains `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`.
  - Acceptance: `pnpm test` green. Manual edit to reintroduce the dead step → test fails; revert.
  - Verification: Snapshot diff is committed.

- [ ] **Task C3: Create scratch consumer repo for end-to-end smoke.**
  - Scope: Under `tmp/bar-138-smoke/` (NEVER `/tmp/` per repo rules), `git init`; minimal `package.json` (`name`, `version`, `private: true`, `packageManager: pnpm@10.33.0`); `.npmrc` with the registry+authToken lines; export `GH_BKIT_TOKEN` (PAT with `read:packages`).
  - Acceptance: `tmp/bar-138-smoke/.npmrc` exists with the two required lines. `tmp/bar-138-smoke/package.json` is valid.
  - Verification: `cat tmp/bar-138-smoke/.npmrc` shows registry + authToken. `tmp/` is git-ignored at repo root (verify against `.gitignore`).

- [ ] **Task C4: Smoke-install `@cbartens/bkit@0.4.0-pre.2` in scratch repo.**
  - Scope: `cd tmp/bar-138-smoke; pnpm add -D @cbartens/bkit@0.4.0-pre.2`. Verify `pnpm install` succeeds (registry resolution, no git auth involved). `pnpm exec bkit install --full` → run completes, `.agents/`, `.claude/`, `.cursor/`, `.github/workflows/ci.yml`, `.husky/`, `.vale/` all seeded; print sink emits the rewritten messages (capture stdout for inspection).
  - Acceptance: `bkit install --full` exits 0. Captured stdout contains `.npmrc`-based instructions (or shows present-state silence if `gh` reports the secret as set on the scratch repo). First-install banner has no `onlyBuiltDependencies` line.
  - Verification: Visual inspection of captured stdout. Inspection of seeded `.github/workflows/ci.yml` — has no `Configure private-repo auth` step; install step has `env: GH_BKIT_TOKEN`. Inspection of seeded `.agents/.bkit-version` = `0.4.0-pre.2`.

- [ ] **Task C5 🔒 GATE — scratch-consumer smoke test must pass before cutting v0.4.0 production.**
  - Scope: If smoke fails (registry 401, install failure, missing template fields, regression in print copy), STOP. Diagnose; fix in bkit; cut a `v0.4.0-pre.3` if needed; re-run smoke. Do NOT cut `v0.4.0` until smoke is green.
  - Acceptance: Captured smoke transcript shows full success per Task C4 acceptance criteria.
  - Verification: Save transcript to `docs/plans/logs/bar-138/smoke-pre.2.txt` (or comparable) for ship-phase summary attachment.

### Phase D — Production cut + ship-phase handoff

- [ ] **Task D1: Open PR `feat/bar-138-gh-packages-distribution → dev`.**
  - Scope: `gh pr create --base dev --title 'feat(bar-138): GitHub Packages npm registry distribution (v0.4.0)' --body '<bkit-build summary fenced section>'`. Body includes link to design doc, ADR `DE-3`, smoke transcript.
  - Acceptance: PR opened; CI runs trigger.
  - Verification: `gh pr checks {PR_NUMBER}` shows `ci.yml` running.

- [ ] **Task D2: Squash-merge PR after CI green + human review.**
  - Scope: `gh pr merge {PR} --squash --delete-branch --body ""` (per repo rules; squash is mandatory).
  - Acceptance: PR merged; squash commit on `dev`.
  - Verification: `git log --oneline dev | head -1` shows the squash commit message.

- [ ] **Task D3: Promote `dev` → `main` (per repo's standard path).**
  - Scope: Standard PR `dev → main` with explicit human approval (per repo rules). After merge, `main` has the squash commit.
  - Acceptance: `main` tip contains the squash commit.
  - Verification: `git log --oneline main | head -1` matches.

- [ ] **Task D4: Bump `version` to `0.4.0`, commit, tag, push.**
  - Scope: On `main` (or via short-lived branch + fast-forward PR if branch protection requires), edit `package.json#version` → `0.4.0`. Commit `chore(bar-138): cut v0.4.0`. Push. Tag `v0.4.0` on the resulting SHA. Push tag.
  - Acceptance: `git describe --tags --exact-match origin/main` = `v0.4.0`. `release.yml` run on the tag is starting.
  - Verification: `gh run view --log` for the tag run shows full check suite green and `npm publish` succeeds. `https://github.com/cbartens/bkit/packages` shows `@cbartens/bkit@0.4.0`.

- [ ] **Task D5: Mark BAR-131 #2 resolved.**
  - Scope: Linear comment on BAR-138 + on BAR-131 #2 referencing the v0.4.0 ship; flip BAR-131 #2 status to resolved per workspace conventions.
  - Acceptance: Linear status reflects resolution.
  - Verification: Linear comment thread shows the resolution note.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every checkbox above (Tasks A1–A5, B1–B15, C1–C5, D1–D5) independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):**
>
> - **Distribution/installer-print logic MUST be tested via Vitest unit tests only.** No Playwright (no UI). No integration tests against the live registry — pre-release tag publish IS the integration test.
> - **Snapshot tests** for templates (consumer ci.yml) protect against regression in seeded YAML.
> - **End-to-end validation** is the scratch-consumer smoke (Task C4), not an automated integration test — registry auth requires a real PAT and live GH Packages, neither suitable for CI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task in Phase A/B/C/D above. Confirm one-to-one mapping; add new tasks if a row is uncovered.
- [ ] **Update existing tests:** Inspect `.agents/scripts/*.test.ts` (or wherever bkit's existing Vitest suite lives) and adjust any tests that asserted the old print-constant content (e.g. tests checking for `insteadOf` literal, or for `onlyBuiltDependencies` in the first-install banner). Update assertions to match new constants.
- [ ] **Write new tests:** Tasks C1–C2 are the new test deliverables.
- [ ] **Verify observability:** Installer prints already follow `[bkit] {message}` convention — preserved in rewrites. No new log names; no new tracing scopes; no `docs/observability.md` changes.
- [ ] **Update documentation:** Tasks B8 (README), B9 (.agents/README), B10 (decisions DE-3), B11 (pending.md) are the doc deliverables. Confirm `.agents/docs.md` index still accurate (no new doc files added; just updates to existing).

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` table completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm lint:slop`. All exit 0.
- [ ] **Unit tests:** `pnpm test` — all pass, including new assertions from Tasks C1 + C2.
- [ ] **Dist staleness gate:** `pnpm check:dist` — exits 0 (proves committed dist matches re-emitted dist).
- [ ] **bkit-self ci.yml run:** Push branch; `gh run watch {run_id} -e` against the latest `ci.yml` run on the feature branch — green.
- [ ] **Pre-release publish runs:** `release.yml` runs on `v0.4.0-pre.1` and `v0.4.0-pre.2` tags both green (Tasks A4–A5, B14–B15 gates).
- [ ] **Build configuration:** No new mock files; no new test config exclusions needed in tsconfig.

> [!IMPORTANT]
> **No Architectural Downgrades**: If `release.yml` fails on auth, do NOT add a `prepublishOnly` hook to "fix" it (would re-introduce lifecycle hooks — BAR-130 invariant violation). Instead, debug `permissions: packages: write` + `NODE_AUTH_TOKEN` wiring per `docs/knowledge.md` and the design doc.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, GHA run links) gathered and pasted into the Linear ship comment.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `npm`, `pnpm`) instead of asking users to check dashboards.

- [ ] **Step 1 — Confirm pre.1 published:** `gh api -H "Accept: application/vnd.github+json" /users/cbartens/packages/npm/bkit/versions | jq '.[].name'` includes `0.4.0-pre.1`.
- [ ] **Step 2 — Confirm pre.2 published:** Same call, includes `0.4.0-pre.2`.
- [ ] **Step 3 — Run scratch-consumer smoke (Task C4) against pre.2 locally:** Confirm `pnpm install` resolves from `https://npm.pkg.github.com`, `bkit install --full` runs clean, print sink shows new `.npmrc`-based copy.
- [ ] **Step 4 — Confirm v0.4.0 published:** Same `gh api` call, includes `0.4.0`.
- [ ] **Step 5 — Confirm `release.yml` triggered green on v0.4.0:** `gh run list --workflow=release.yml --limit=5` and `gh run view {run_id}` for the v0.4.0 tag run — all steps green, `npm publish` step printed `+ @cbartens/bkit@0.4.0`.
- [ ] **Step 6 — Confirm BAR-131 #2 marked resolved:** Linear MCP query on BAR-131 reflects status update.
- [ ] **Step 7 — Confirm bkit-self ci.yml still green post-cleanup:** `gh run list --workflow=ci.yml --limit=3` on the feature branch and on `dev` post-merge — all green; "Configure private-repo auth" step is gone but no run failed because of its absence.
