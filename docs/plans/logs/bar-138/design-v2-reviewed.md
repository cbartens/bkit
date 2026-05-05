Verdict: CONCERNS
<!-- verdict:end -->

# Design: bkit v0.4.0 — GitHub Packages npm Registry Distribution

## Acceptance Scenario

**Narrative:** As a bkit consumer (e.g. `app-gether-life`), I add a single `.npmrc` and the `GH_BKIT_TOKEN` env var to my repo, then run `pnpm add -D @cbartens/bkit@^0.4.0` and `pnpm install` — the package resolves from the GitHub Packages npm registry without any git-clone, `insteadOf` shim, or Vercel `installCommand` hack. Running `bkit install --full` afterwards prints AI-actionable migration instructions that reference the new `.npmrc` flow rather than the old git auth shim.

**Success Criteria:**

1. `npm publish` from a tag-push (`v*`) on the bkit repo succeeds against `https://npm.pkg.github.com/@cbartens/bkit` with the built-in `GITHUB_TOKEN` (`packages: write`).
2. A scratch consumer repo with only `.npmrc` + `GH_BKIT_TOKEN` env installs `@cbartens/bkit@^0.4.0` end-to-end (GitHub Actions and Vercel) with zero git config or `installCommand` patching.
3. `bkit install --ci` prints `.npmrc`-based AI instructions when `GH_BKIT_TOKEN` is missing/unknown and prints a Vercel env-var-only block when `vercel.json` is present (no git-shim language anywhere).
4. The seeded consumer CI template (`.agents/templates/.github/workflows/ci.yml`) sets `GH_BKIT_TOKEN` as an env on the install step and contains no `Configure private-repo auth` step. bkit-self's own `.github/workflows/ci.yml` likewise has the dead `Configure private-repo auth` step removed (it was never needed — bkit-self is the source repo).
5. Pre-release tags `v0.4.0-pre.1` (pipeline only) and `v0.4.0-pre.2` (prints + docs) both publish successfully before `v0.4.0` cuts; ADR `DE-3` records the distribution decision.

**Key Edge Cases:**

- Tag-without-version-bump on the bkit repo: `check:dist` rebuilds and diffs; npm registry rejects duplicate versions, so a re-tagged SHA fails fast (no silent overwrite).
- Consumer still on v0.3.x git-dep model after v0.4.0 ships: v0.3.x remains consumable from git (no dual-publish required); per-consumer migration is a separate PR.
- Consumer has stale `GH_BKIT_TOKEN` PAT scoped only `Contents: read`: `pnpm install` fails with 401 from the registry; installer print and README explicitly call out the required `read:packages` scope.
- Consumer with `vercel.json` containing the legacy `installCommand` git-shim: `bkit install --ci` print directs the AI to remove the shim and rely on `.npmrc` + Vercel env var.

## Architecture

**Distribution model shift.** v0.3.x ships as a git dependency (`github:cbartens/bkit#vX.Y.Z`) with a per-consumer git auth-shim and a once-tripped lifecycle-hook OOM trap (BAR-130 #5). v0.4.0 shifts to the **GitHub Packages npm registry** (`@cbartens:registry=https://npm.pkg.github.com`). Standard scoped-package semantics replace the git-clone story end-to-end.

**Two coordinated surfaces:**

1. **Bkit publishing pipeline** (this PR's scope): tag-push triggers `release.yml`, which builds in CI, validates `dist/` is fresh, and publishes via `npm publish` using the workflow's built-in `GITHUB_TOKEN` with `packages: write`.
2. **Consumer migration guide** (out of scope here, per-consumer PRs after v0.4.0 ships): each consumer adds `.npmrc`, expands `GH_BKIT_TOKEN` PAT scope to include `read:packages` / Packages: read, drops the GHA `insteadOf` step and the Vercel `installCommand` shim.

**Components touched in v0.4.0:**

- `package.json` — flip `private`, add `publishConfig`, drop `git+` URL prefix, refresh stale `description`.
- `.github/workflows/release.yml` — new file, tag-push triggered, `npm publish` (not `pnpm publish`).
- `.agents/scripts/bkit-modules.ts` — replace three install-print constants and the consumer ci.yml merge instructions; drop the `onlyBuiltDependencies` line from the first-install banner.
- `.agents/templates/.github/workflows/ci.yml` — drop `Configure private-repo auth` step, add `env: GH_BKIT_TOKEN` to install step.
- `.github/workflows/ci.yml` (bkit-self) — drop the legacy `Configure private-repo auth` step (lines 23–24). bkit-self is the source repo, never a consumer of `@cbartens/bkit`, so the `insteadOf` shim is dead code today. Cleanup fits in this PR because (a) the templated equivalent is already being touched, (b) leaving the dead step is misleading documentation for any agent reading bkit-self's ci.yml as a reference, (c) the diff is one block deletion with zero behavioral risk.
- `README.md` + `.agents/README.md` — rewrite install snippets and the auth section.
- `docs/decisions.md` — append `DE-3`.

**Invariants preserved (do NOT regress):**

- No lifecycle hooks in the published package — `prepare` / `prepublishOnly` / `postinstall` stay forbidden (BAR-130 v0.3.0 invariant). `dist/` remains pre-built and committed; `check:dist` is the staleness gate.
- `checkBkitTokenSecret` and the `GH_BKIT_TOKEN` secret name are unchanged — only scope expands and the surrounding instructional copy changes.

**Integration points:**

- GitHub Actions runner uses `actions/setup-node@v4` with `registry-url: https://npm.pkg.github.com` + `scope: '@cbartens'` so `NODE_AUTH_TOKEN` (set to the built-in `GITHUB_TOKEN`) auto-wires into the runner's `~/.npmrc` for the publish call.
- GitHub Packages "linked repository" UI auto-associates the published package with `cbartens/bkit` once the bare HTTPS `repository.url` is in the manifest.

## Data Model

Not applicable — this feature touches build, distribution, and CLI text. No persistent data, no schema changes.

**Manifest field deltas (`package.json`):**

| Field | Before (v0.3.x) | After (v0.4.0) |
| --- | --- | --- |
| `private` | `true` | `false` |
| `description` | "...installed as a git dependency from a private GitHub repo (no npm registry)." | rewritten to drop the lie; describes registry distribution |
| `repository.url` | `git+https://github.com/cbartens/bkit.git` | `https://github.com/cbartens/bkit.git` |
| `publishConfig` | (absent) | `{ "registry": "https://npm.pkg.github.com", "access": "restricted" }` |
| `version` | `0.3.0` | bumped to `0.4.0-pre.1` → `0.4.0-pre.2` → `0.4.0` per cadence |

**Print-constant edit targets (`bkit-modules.ts`):**

| Constant | Action |
| --- | --- |
| `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` | Replace body — `.npmrc` setup + new PAT scope (`read:packages` / Packages: read). Same trigger condition. **MUST explicitly warn that pnpm v7.20+ silently ignores the entire `.npmrc` when `${GH_BKIT_TOKEN}` is unset at install time → install falls back to npmjs.org and surfaces an opaque 401, NOT a "token missing" error.** Phrase the warning so an AI agent reading the print recognizes the symptom. |
| `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` | Replace body — same shape, new copy. Include the same pnpm silent-ignore warning so the symptom-to-cause mapping is consistent across both states. |
| `VERCEL_AUTH_INSTRUCTIONS` | Replace body — Vercel env-var-only (no `installCommand` shim). Heuristic (`detectVercelProject`) unchanged. |
| `CI_YML_MERGE_INSTRUCTIONS` | Replace body — `.npmrc`-based merge guidance for an existing consumer ci.yml. |
| First-install banner (`runCoreModule`) | Drop the `onlyBuiltDependencies: ["@cbartens/bkit"]` line — registry packages with no lifecycle hooks do not need it; carrying it is noise. |

## Components / Flows

**Flow 1 — Release pipeline (bkit repo):**

1. Maintainer bumps `version` in `package.json`, commits, tags `v0.4.0-pre.1` (or `v0.4.0`).
2. Tag push fires `.github/workflows/release.yml`.
3. Workflow steps: checkout → setup-node (Node 20, with `registry-url: https://npm.pkg.github.com` + `scope: '@cbartens'`) → pnpm/action-setup → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm test` → `pnpm format:check` → `pnpm lint:prose` → `pnpm lint:slop` → `pnpm check:dist` → `npm publish` with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
4. Publish is gated on the full check suite (typecheck + test + format + lint + check:dist) so a stale committed `dist/`, broken test, or lint regression aborts the run on the tagged SHA itself — no reliance on a prior `ci.yml` run.
5. On success, the package appears at `https://github.com/cbartens/bkit/packages`.

**Flow 2 — Consumer install (post-migration):**

1. Consumer has `.npmrc` at repo root: `@cbartens:registry=https://npm.pkg.github.com` + `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`.
2. Consumer has `GH_BKIT_TOKEN` env var (with `read:packages` / Packages: read scope) in their shell, GHA secrets, and Vercel env vars.
3. `pnpm add -D @cbartens/bkit@^0.4.0` resolves via the registry.
4. `pnpm install` in CI / Vercel reads `.npmrc`, interpolates the token from env, fetches the tarball — no git auth involved.

**Flow 3 — `bkit install --ci` print path (consumer-side, unchanged shape):**

1. `runCiModule` writes/seeds the ci.yml template (Tier 3).
2. Calls `checkBkitTokenSecret()` (unchanged).
3. On `missing` or `unknown` → pushes the rewritten `.npmrc`-based instruction string.
4. On `detectVercelProject() === true` → pushes the rewritten Vercel env-var-only instruction string.
5. Consumer pastes the printed block into their AI agent; agent applies the migration.

**Pre-release validation cadence (matches design-input order):**

| Tag | Scope | Validation goal |
| --- | --- | --- |
| `v0.4.0-pre.1` | publishConfig + release.yml only | First-ever publish to GH Packages registry; isolates pipeline-auth bugs. |
| `v0.4.0-pre.2` | + installer prints + README rewrite + ADR | Validates message rendering with the new install flow. |
| `v0.4.0` | merge of pre.1 + pre.2; no further code changes vs pre.2 | Production cut after scratch-consumer smoke. |

## Decisions

| Decided | Alternatives | Why |
| --- | --- | --- |
| **Tag-push trigger** (`on: push: tags: ['v*']`) — single `release.yml`, built-in `GITHUB_TOKEN` with `packages: write` | `release: published` event (manual UI step); reusable composite workflow shared with `ci.yml` | Smallest surface; matches design-input snippet; pre-release tags fire same pipeline with zero extra ceremony; built-in token avoids PAT plumbing. Reusable composite is YAGNI at 2 callers. |
| **release.yml runs the full check suite on the tagged SHA** (typecheck + test + format + lint + check:dist), does NOT trust prior CI | Trust ci.yml green status on the same SHA via `workflow_run` / maintainer protocol; lean release.yml with `check:dist` only | No `workflow_run` enforcement exists today — tagging a SHA where ci.yml never ran (or failed) would silently publish. Re-running the suite costs ~30s per release; cheap insurance. Resolves the DoD/design gate mismatch flagged by both reviews — DoD ("gated by typecheck/test/check:dist") and design now agree. |
| **Pin `node-version: 20` in `release.yml`** to match `.github/workflows/ci.yml` | Pin 22 in release.yml; bump ci.yml to 22 in the same PR | Current ci.yml ships `node-version: 20`; bumping it would require regenerating committed `dist/` and is out of scope for v0.4.0. Keeping both workflows on 20 preserves `tsc`-emit determinism for `check:dist`. Both reviews flagged the v1 "pin 22" line as contradicting the actually-shipped ci.yml. |
| **Hard cutover, atomic PR** — flip `private`, add `publishConfig`, new workflow, replace prints, rewrite docs all in one branch | Feature-flag gating two-phase rollout; dual-publish (git + registry) transition window | Design-input explicitly excludes dual-publish and backward-compat. Flag gating creates a window of contradictory installer guidance. v0.3.x stays consumable from git for un-migrated consumers — that is the backward-compat story; nothing extra needed in v0.4.0. |
| **Status quo `dist/`** — keep committed `dist/`, gate publish on `pnpm check:dist`, no `prepublishOnly` | Re-introduce `prepublishOnly: tsc`, drop committed `dist/`; build in CI + `.gitignore` `dist/` | Honors BAR-130 v0.3.0 "no lifecycle hooks" invariant. Even `prepublishOnly` (which fires only on `npm publish`) erodes the invariant — the next contributor adds a `prepare` and re-summons the OOM. Repo-cleanliness gain does not outweigh invariant erosion. |
| **Two pre-release tags** — `pre.1` (pipeline only) then `pre.2` (prints + docs) | Single shot validated locally via `npm pack`; one combined `pre.1` covering everything | Local `npm pack` does not exercise GH Packages auth or `GITHUB_TOKEN` scoping. Splitting prints from pipeline isolates failure surface; first-ever registry publish is the highest-risk step and deserves its own gate. |
| **Drop `git+` prefix** from `repository.url` → `https://github.com/cbartens/bkit.git` | Leave `git+https://...` as-is | Free hygiene win; standard npm convention; helps GH Packages "linked repository" UX pick up the source repo. |
| **`npm publish`** in release workflow (not `pnpm publish`) | `pnpm publish` | Matches GitHub Packages docs. Avoids pnpm's stricter publish lifecycle hooks and the `--no-git-checks` flag dance. `setup-node` registry-url wiring assumes `npm`. |
| **Surgical string-constant edits** in `bkit-modules.ts` — touch only the four print constants + first-install banner | Refactor `checkBkitTokenSecret`/`detectVercelProject` into a separate auth-check module | Auth-check logic is correct and unchanged — only the surrounding instruction copy differs. Surgical edits are lower risk; isolates the diff to text. |
| **Drop `onlyBuiltDependencies: ["@cbartens/bkit"]` line** from first-install banner | Keep the line | The entry was a lifecycle-hook OOM workaround (BAR-130 #5). v0.3.0 dropped `prepare`; registry packages with no lifecycle hooks do not need it. Keeping it is noise and confuses new consumers. |
| **Reuse `GH_BKIT_TOKEN` name**; expand PAT scope to include `read:packages` (classic) / Packages: read (fine-grained) | Introduce a new env var (e.g. `BKIT_NPM_TOKEN`) | Design-input explicit; avoids forcing consumers to rotate two secrets simultaneously. The same secret authenticates both the (legacy) git-clone path on v0.3.x consumers and the (new) registry path on v0.4.0 consumers — eases mid-flight migration. |
| **Update CI template + `CI_YML_MERGE_INSTRUCTIONS` in the same commit** as installer text | Separate commits | Template and AI-merge instructions must remain consistent; splitting them creates a window where the seed describes the new pattern but the merge instructions describe the old one. |
| **No backward-compat dual-path detection** in installer prints | Detect `github:cbartens/bkit#...` vs `@cbartens/bkit@^X.Y.Z` and print conditionally | Design-input mandates "v0.4.0 is the cutover, no dual-publish". Same logic applies to print copy. Detection adds a dead-code branch every future change has to honor. |
| **Add ADR `DE-3`** to `docs/decisions.md` | Skip ADR | Distribution model is architectural; future contributors will ask "why not npmjs?" / "why not vendoring?". Documents the rejected alternatives (npmjs cost, git-dep fragility, tarball-release URL clunk, vendoring per-repo work). |

## Approaches Considered

| Approach | Verdict | Why |
| --- | --- | --- |
| **A1** Tag-push triggered `release.yml`, built-in `GITHUB_TOKEN` | KEPT | Smallest surface; matches design-input snippet; pre-release tags reuse same pipeline. |
| **B1** `release: published` event (GitHub Releases UI) | REJECTED | Doubles human gate per ship; awkward for `pre.*` validation tags; no real benefit over tag-push for a single-maintainer package. |
| **C1** Reusable composite workflow shared by `ci.yml` and `release.yml` | REJECTED | YAGNI at 2 callers; ~5 LOC of duplication does not justify `workflow_call` indirection. |
| **A2** Hard cutover, replace prints in v0.4.0 | KEPT | Aligns with "no dual-publish" mandate; single source of truth; print messages double as the migration prompt for downstream agents. |
| **B2** Dual-path detection of consumer install model | REJECTED | Adds a dead branch; mis-fires confuse consumers; design-input forbids backward-compat. |
| **A3** Keep committed `dist/` + `check:dist` gate | KEPT | Honors BAR-130 v0.3.0 "no lifecycle hooks" invariant; existing safety net. |
| **B3** `prepublishOnly: tsc`, drop committed `dist/` | REJECTED | Even though `prepublishOnly` is technically safe for `npm publish` only, re-adding any lifecycle hook erodes the invariant the team paid OOM debugging to establish. |
| **C3** Build in CI, attach tarball to release, `.gitignore` `dist/` | REJECTED | Local dev breaks until `pnpm build` runs; loses git-inspectable tarball auditability; tempts a `postinstall: pnpm build` re-introducing the banned hook. |
| **A4** Two pre-release tags (`pre.1` pipeline, `pre.2` prints) | KEPT | Matches implementation order; isolates pipeline-auth bugs from message-rendering bugs; cheap insurance for first-ever registry publish. |
| **B4** Single shot, validate locally with `npm pack` | REJECTED | Does not exercise GH Packages auth or `GITHUB_TOKEN` scoping; first registry interaction would be the production cut. |
| **C4** One combined `pre.1` covering pipeline + prints | REJECTED | Pipeline + message bugs intermix on failure; loses the design-input's deliberate sequencing. |
| **A5** Drop `git+` prefix from `repository.url` | KEPT | Free hygiene win; standard npm convention; helps GH Packages "linked repository" UX. |
| **B5** Leave `git+https://...` as-is | REJECTED | Mild aesthetic clutter; design-input explicitly flagged as optional cleanup. |
| **B (gated dual-phase with feature flag)** from brainstorm-2 | REJECTED | Same reasoning as B2 — flag introduces dead code, creates a contradictory-instruction window between phases. |
| **C (dual-publish transition period)** from brainstorm-2 | REJECTED | Design-input forbids; v0.3.x staying consumable from git is sufficient backward-compat. |
| **`npm publish` over `pnpm publish`** | KEPT (MERGED from brainstorm-2 implementation note) | Matches GH Packages docs; avoids pnpm publish lifecycle hook surprises; `setup-node` `registry-url` wiring assumes `npm`. |
| **Drop `onlyBuiltDependencies` line from first-install banner** | KEPT (MERGED from brainstorm-2 implementation note) | BAR-130 #5 workaround obsolete post-v0.3.0; carrying it is noise. |

## Trade-offs Accepted

**For tag-push trigger (vs `release: published`):**
- Gain: zero extra human ceremony, pre-release tags fire same pipeline, smallest workflow file.
- Sacrifice: no auto-curated GitHub Release notes / changelog. If we later adopt release-please / changesets, we revisit.

**For hard atomic cutover (vs phased flag rollout):**
- Gain: single PR, no dead code, no contradictory-instruction window, no flag-cleanup follow-up.
- Sacrifice: cannot ship pipeline and prints independently — a regression in either blocks the whole release. Mitigated by the two pre-release tags isolating each surface.

**For status-quo committed `dist/` (vs CI-built or `prepublishOnly`):**
- Gain: BAR-130 invariant intact; tarball contents are git-inspectable pre-publish; `pnpm bkit` works locally without an explicit build step.
- Sacrifice: PR review noise on every script change (every `.ts` edit produces a `dist/` diff). Already accepted in v0.3.0; not re-litigated here.

**For two pre-release tags (vs single shot):**
- Gain: failure-surface isolation; cheap rollback boundary; first-ever GH Packages publish gets its own gate.
- Sacrifice: three publishes instead of one; pre-release versions visible in registry. Acceptable for a private package with `^0.4.0` consumer pinning.

**For surgical string-constant edits (vs auth-check module refactor):**
- Gain: minimal blast radius; tests barely change shape; review is mechanical.
- Sacrifice: no structural cleanup of the (currently fine) auth-check code. If we later need polymorphic detection (e.g. multiple registries), we revisit.

## Risks & Open Questions

**Risks:**

- **`GITHUB_TOKEN` permissions mismatch on first publish.** Mitigated by `v0.4.0-pre.1` smoke tag — failure here is zero-cost to fix (tag is throwaway). Without pre.1, discovering the bug on `v0.4.0` proper requires a patch release.
- **`check:dist` divergence in the release runner.** `tsc` output should be deterministic across machines, but Node minor-version drift could in principle change emit. Same risk exists in current `ci.yml`; already covered by the `pnpm check:dist` script. **Pin `node-version: 20` in `release.yml`** to match the version currently pinned in `.github/workflows/ci.yml` (engines.node = `>=20`; current ci.yml uses `node-version: 20`). Both reviews flagged the prior "pin 22" wording as a contradiction with the actually-shipped ci.yml — resolved here by aligning on 20. If we later bump ci.yml to 22 it must happen in lock-step with release.yml plus a `dist/` regeneration commit.
- **Pre-release versions visible in the registry.** Acceptable for a private package; consumers using `^0.4.0` semver will not pin to `pre.*` accidentally. If a stray pre-release breaks something, deprecate via `npm deprecate`.
- **`GH_BKIT_TOKEN` PAT scope drift on consumers.** Existing `Contents: read` PATs lack `read:packages`; consumers see a 401 from the registry on first install post-migration. Mitigated by installer print copy (calls out the scope explicitly) and per-consumer migration guide step 1.
- **pnpm v7.20+ silently ignores `.npmrc` on unset env var.** If `${GH_BKIT_TOKEN}` is missing at install time (CI secret not wired, local shell missing the export), pnpm drops the entire `.npmrc` and falls back to the default registry — symptom is a generic 401 from `npmjs.org`, NOT an explicit "token missing" error. This wastes consumer-migration debug cycles. Mitigated by the rewritten `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` and `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` print copy, which MUST enumerate this footgun verbatim so the consumer's AI agent can map symptom → cause without further debugging.
- **Lifecycle-hook re-introduction by future contributors.** Documented invariant in `decisions.md` and `knowledge.md`; the published package has no hooks. Code review must catch any attempt to add `prepare` / `prepublishOnly` / `postinstall`.

**Open questions:**

- ~~Should `release.yml` also run `pnpm test` and `pnpm lint:*` before publishing, or rely on the CI run that already passed on the tagged SHA?~~ **RESOLVED (post-review):** `release.yml` runs the **full check suite** in-line — `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm test` → `pnpm format:check` → `pnpm lint:prose` → `pnpm lint:slop` → `pnpm check:dist` → `npm publish`. Rationale: both reviews flagged the DoD/design gate mismatch — design-input DoD requires "gated by typecheck/test/check:dist" while v1 proposed "lean release.yml trusting prior CI". There is no `workflow_run` / `needs:` enforcement today that the tagged SHA passed `ci.yml`, so trusting the prior run is unsafe. Cost is ~30s of extra runtime per tag — trivial. This becomes the single source of truth for the DoD: **`release.yml` does not trust prior CI; it re-runs the same gate set on the tagged SHA before publishing.**
- Does GitHub Packages `access: restricted` interact correctly with the per-org token scope, or do we need `access: public` + repo-private as a fallback? Validated implicitly by pre.1 publish; if pre.1 fails on access semantics, fallback documented in ADR `DE-3`.
- Will `npm deprecate` against GH Packages work the same as npmjs.org if a pre-release needs to be retracted? Should be fine but un-tested in this codebase; flag for first deprecation event.

**Dependencies / assumptions:**

- Assumes `cbartens/bkit` repo has `packages: write` available to the built-in `GITHUB_TOKEN` (default for private repos in the same org as the package).
- Assumes `BKIT_READ_TOKEN` → `GH_BKIT_TOKEN` rename (v0.2.2) has landed for all consumers already; per design-input, that is a hard prerequisite (out of scope here).
- Assumes Node 20 + pnpm 10.x (per repo `packageManager` and current `.github/workflows/ci.yml#node-version`) on the release runner. `engines.node = ">=20"` permits future upgrades but the release runner stays in lock-step with `ci.yml` to keep `check:dist` deterministic.
