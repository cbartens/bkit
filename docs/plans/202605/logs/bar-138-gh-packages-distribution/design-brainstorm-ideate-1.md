# Design Brainstorm & Ideas

> Scope: BAR-138 v0.4.0 — migrate `@cbartens/bkit` from git-dep to GitHub Packages npm registry. Decisions decomposed into orthogonal axes since the high-level "go to GH Packages" is already approved in the design input. Brainstorm enumerates the still-open implementation choices.

---

## Axis 1 — Release pipeline trigger & artifact provenance

### Approach A1 — Tag-push triggered workflow, build inside CI ⭐ Recommended

- **Summary:** New `.github/workflows/release.yml` fires on `v*` tag push; runs `pnpm install --frozen-lockfile`, `pnpm check:dist`, `npm publish` using built-in `GITHUB_TOKEN` with `packages: write`. Matches design-input snippet verbatim.
- **Complexity:** LOW — single workflow file, no PAT plumbing, mirrors the existing `ci.yml` shape.
- **Extensibility:** Easy to gate on extra checks (test, lint:prose, lint:slop) by reusing the same steps as `ci.yml`. Composite/reusable workflow can be lifted later if duplication grows.
- **Risk:** Tag-without-version-bump publishes whatever `dist/` is on the tagged SHA. `check:dist` rebuilds and diffs, so stale `dist/` fails fast. Tag deletion + retag would re-trigger publish; npm registry rejects duplicate versions, so worst case is a noisy failed run.
- **Maintenance:** Aligned with idiomatic `actions/setup-node` + `registry-url` flow. One workflow file, ~25 lines.

### Approach B1 — `release` event triggered (GitHub Releases UI)

- **Summary:** Trigger on `release: {types: [published]}`. Human creates a GitHub Release via UI/CLI; workflow publishes the tarball and attaches it as a release asset.
- **Complexity:** LOW-MEDIUM — adds a manual UI step + release-notes hand-curation; `gh release create` automates but adds another command in the runbook.
- **Extensibility:** Couples publish to GitHub Releases (changelog, notes). Useful later if we adopt release-please / changesets.
- **Risk:** Two-step ship (tag, then release) doubles the human gate; easier to forget the release step. Pre-release workflow (`pre.1`/`pre.2` validation) is awkward — needs `prerelease: true` flag, separate npm `--tag pre` flag.
- **Maintenance:** Slightly higher human ceremony per ship. Doesn't auto-publish from a tag, so `pre.1` validation in step 2 of the implementation order requires extra release UI clicks.

### Approach C1 — Reusable composite workflow shared by `ci.yml` and `release.yml`

- **Summary:** Extract `setup` (checkout + node + pnpm + install) into `.github/workflows/_setup.yml` reusable workflow; both `ci.yml` and `release.yml` call it.
- **Complexity:** MEDIUM — reusable-workflow syntax + `workflow_call` plumbing for what is currently ~5 duplicated lines.
- **Extensibility:** Pays off only when there are 3+ callers. Today: 2.
- **Risk:** YAGNI — premature abstraction adds indirection without removing real duplication.
- **Maintenance:** Higher cognitive cost for negligible LOC savings.

**Recommendation:** **A1**. Tag-push is the smallest-surface trigger, matches the design-input snippet, and lets `pre.1`/`pre.2` validation tags fire the full pipeline with zero extra ceremony.

---

## Axis 2 — Installer print-message migration strategy

### Approach A2 — Hard cutover, replace messages in v0.4.0 ⭐ Recommended

- **Summary:** Drop `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` git-shim language and `VERCEL_AUTH_INSTRUCTIONS` git-shim block. Replace with `.npmrc`-based instructions. `checkBkitTokenSecret` keeps its name and detection logic; only the "fix it like this" copy changes.
- **Complexity:** LOW — string replacement in `runCiModule` + tests.
- **Extensibility:** Single source of truth for the new install path. Future auth changes (e.g. fine-grained PAT default) edit one place.
- **Risk:** A consumer running `bkit install --ci` from v0.4.0 against a v0.3.x-era setup gets new instructions while still on the old install model. Mitigated: v0.4.0 is the cutover; the new instructions are exactly what the consumer needs to migrate (per design-input consumer guide). Print messages double as the migration prompt.
- **Maintenance:** Single code path. No legacy detection branch.

### Approach B2 — Dual-path detection, print conditional messages

- **Summary:** Detect whether consumer's `package.json` uses `github:cbartens/bkit#...` vs `@cbartens/bkit@^X.Y.Z` and print git-shim vs `.npmrc` instructions accordingly. Bridges in-flight migrations.
- **Complexity:** MEDIUM — added detection logic, two code paths to maintain, both must stay green.
- **Extensibility:** Negative — adds branch every future change has to honor.
- **Risk:** Detection mis-fires (e.g. mixed monorepo) cause confusing prints. Doubles test surface for no real gain (consumers migrate once).
- **Maintenance:** Carrying dead-code path indefinitely. Design input explicitly says "no dual-publish" / "no backward-compat" — same logic applies to print paths.

**Recommendation:** **A2**. Aligns with design-input "v0.4.0 is the cutover. No dual-publish." YAGNI on conditional detection.

---

## Axis 3 — `dist/` build & verification at publish time

### Approach A3 — Keep `check:dist` gate, publish committed `dist/` as-is ⭐ Recommended

- **Summary:** Pre-built `dist/` stays committed (status quo since v0.3.0). Release workflow runs `pnpm check:dist` before `npm publish` to catch staleness. `npm publish` uses the on-disk `dist/`. No `prepare`/`prepublishOnly` lifecycle hook re-introduced.
- **Complexity:** LOW — zero changes vs current state.
- **Extensibility:** Future build steps (e.g. minify, type-bundle) plug into `check:dist` script.
- **Risk:** Carries forward the "committed `dist/`" tradeoff (review-noise on every script change). Already accepted in v0.3.0. Lifecycle-hook OOM (Failure #5) stays buried.
- **Maintenance:** No new mechanism. `check:dist` is the existing safety net.

### Approach B3 — Re-introduce `prepublishOnly: tsc`, drop committed `dist/`

- **Summary:** Build `dist/` only at publish time via `prepublishOnly` lifecycle. Stop committing `dist/`.
- **Complexity:** LOW in code, but resurrects exactly the lifecycle-hook fragility v0.3.0 fixed (BAR-130 Failure #5). Even though `prepublishOnly` only fires for `npm publish` (not `npm install`), re-adding any lifecycle hook erodes the "no hooks" invariant the team paid OOM debugging to establish.
- **Extensibility:** Cleaner repo (no `dist/` diffs in PRs). Real benefit.
- **Risk:** HIGH — regresses BAR-130 hard-won invariant. Even if `prepublishOnly` is technically safe, the next contributor adds a `prepare` and re-summons the OOM. Also: tarball contents are no longer git-inspectable pre-publish.
- **Maintenance:** Cheaper PR diffs, but invariant erosion has high downstream cost.

### Approach C3 — Build in CI, attach tarball to release, do NOT commit `dist/`

- **Summary:** Release workflow runs `pnpm build` then `npm publish`. `dist/` is `.gitignore`d.
- **Complexity:** MEDIUM — `check:dist` becomes obsolete; need new gate ensuring builds reproducibly succeed in CI. Local `bkit` script (`pnpm bkit`) needs an explicit build step or fails.
- **Extensibility:** Decouples published artifact from git history.
- **Risk:** Local dev breaks until `pnpm build` runs. `npm publish` becomes the only canonical build. Loses the "git diff shows the actual shipped JS" auditability.
- **Maintenance:** Need to add a developer-onboarding `postinstall: pnpm build` (re-introducing exactly the lifecycle hook we banned). Catch-22.

**Recommendation:** **A3**. Status quo + `check:dist` is the lowest-risk path that honors the BAR-130 v0.3.0 invariant. Repo cleanliness is a real concern but not worth re-litigating in v0.4.0.

---

## Axis 4 — Pre-release validation cadence

### Approach A4 — Two pre-release tags (`v0.4.0-pre.1`, `v0.4.0-pre.2`) ⭐ Recommended

- **Summary:** Per design-input implementation order: `pre.1` validates publish pipeline with **only** `publishConfig` + `release.yml` changes. `pre.2` validates installer-print + README rewrites. `v0.4.0` cuts after both pass + scratch consumer smoke.
- **Complexity:** LOW — pre-releases are just extra tags.
- **Extensibility:** Splits the failure surface (pipeline failures isolated from message-rendering failures). Each pre-tag is a recoverable rollback boundary.
- **Risk:** Pre-release versions are visible in the registry. Acceptable for a private package; consumers won't pin to `pre.*` accidentally given semver `^0.4.0`.
- **Maintenance:** Three publishes instead of one for the v0.4.0 release. Marginal cost.

### Approach B4 — Single shot, validate locally with `npm pack` + scratch repo

- **Summary:** Skip pre-releases. Validate locally via `npm pack` + manual install in a scratch consumer pointing at the tarball. Cut `v0.4.0` directly.
- **Complexity:** LOW — fewer tags.
- **Extensibility:** Nothing in registry until v0.4.0 lands. Cleaner version history.
- **Risk:** HIGH — local `npm pack` doesn't exercise the GH Packages auth path or the workflow's `GITHUB_TOKEN` scoping. First registry interaction is the production cut. Workflow auth bugs surface only after v0.4.0 is tagged.
- **Maintenance:** Cheaper-looking but the first failed v0.4.0 publish costs more than two pre-releases (re-tag, force-push avoidance dance, etc).

### Approach C4 — One pre-release (`pre.1`) covering everything

- **Summary:** Single combined pre-release validates both publish pipeline AND installer prints simultaneously.
- **Complexity:** LOW.
- **Extensibility:** Mid-ground.
- **Risk:** Pipeline + message bugs intermix; on failure, harder to attribute root cause. Loses the design-input's deliberate "validate pipeline before touching prints" sequencing.
- **Maintenance:** Marginal savings.

**Recommendation:** **A4**. Matches design-input implementation order exactly. Two pre-releases is cheap insurance against the highest-risk part (first-ever publish to GH Packages registry).

---

## Axis 5 — `repository.url` git+ prefix handling

### Approach A5 — Drop `git+` prefix → `https://github.com/cbartens/bkit.git` ⭐ Recommended

- **Summary:** Per design-input "Optional: drop `repository.url` git+ prefix if it confuses npm." Change `git+https://...` → `https://github.com/cbartens/bkit.git`. npm registry tooling and GitHub Packages link the published package to the source repo via the bare URL.
- **Complexity:** LOW — single-line `package.json` edit.
- **Extensibility:** Standard npm convention. GitHub Packages "linked repository" UX picks up the bare URL.
- **Risk:** Trivial. `git+` prefix has been valid in npm metadata for years; dropping is a hygiene move.
- **Maintenance:** None.

### Approach B5 — Leave `git+https://...` as-is

- **Summary:** Status quo.
- **Complexity:** LOW.
- **Risk:** None functional. Mild aesthetic clutter; GH Packages might or might not parse correctly (per design-input "if it confuses npm").
- **Maintenance:** None.

**Recommendation:** **A5**. Free hygiene win; no downside.

---

## Decisions

<!-- prettier-ignore -->
| Axis | Decided | Alternatives | Why |
| --- | --- | --- | --- |
| 1. Pipeline trigger | **A1** — tag-push `v*` triggers `release.yml`; built-in `GITHUB_TOKEN` with `packages: write` | B1 (`release: published`), C1 (reusable composite) | Smallest surface; matches design-input snippet; pre-release tags fire same pipeline with zero extra ceremony; built-in token avoids PAT plumbing |
| 2. Installer prints | **A2** — hard cutover, replace git-shim copy with `.npmrc` copy | B2 (dual-path detect old vs new install) | Design-input mandates "v0.4.0 is the cutover, no dual-publish"; same logic applies to prints; YAGNI on conditional detection |
| 3. `dist/` build & verify | **A3** — keep committed `dist/` + `check:dist` gate in release workflow | B3 (`prepublishOnly: tsc`), C3 (build in CI, gitignore `dist/`) | Honors BAR-130 v0.3.0 invariant ("no lifecycle hooks"); `check:dist` is the existing safety net; repo-cleanliness gains do not outweigh re-introducing hook fragility |
| 4. Pre-release validation | **A4** — `v0.4.0-pre.1` (pipeline only), `v0.4.0-pre.2` (prints + README), then `v0.4.0` | B4 (single shot, local `npm pack`), C4 (one combined pre.1) | Matches design-input implementation order; isolates pipeline-auth bugs from message-rendering bugs; cheap insurance for first-ever GH Packages publish |
| 5. `repository.url` | **A5** — drop `git+` prefix | B5 (leave as-is) | Free hygiene win; standard npm convention; helps GH Packages "linked repository" UX |
| (constant) Token reuse | Reuse `GH_BKIT_TOKEN_INSTALL` name, expand scope to `read:packages` | New env var | Design-input explicit; avoids forcing consumers to rotate two secrets simultaneously |
| (constant) Backward compat | None — v0.3.x stays usable for un-migrated consumers; v0.4.0 is the cutover | Dual-publish (git+npm), shim package | Design-input explicit "no dual-publish"; per-consumer migration is a separate per-repo PR |
| (constant) ADR | Add `DE-3` documenting GH Packages choice over npmjs (cost), git-dep (fragility), tarball-release (URL clunk), vendoring (per-repo work) | Skip ADR | Distribution model is architectural; future contributors will ask "why not npmjs?" |
