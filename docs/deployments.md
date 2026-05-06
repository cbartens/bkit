<!-- bkit:start -->

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Pre-push runs lint/typecheck/format/unit tests; never `--no-verify`.

<!-- bkit:end -->

## Project

### `GH_BKIT_TOKEN` — four-surface presence matrix

`GH_BKIT_TOKEN` is required at four surfaces; missing any one breaks an install or CI run. Detector coverage in BAR-141 mirrors this matrix.

| Surface | Where to set | Symptom if missing | bkit detector |
| --- | --- | --- | --- |
| Local shell | `~/.zshrc` / `~/.bashrc` → `export GH_BKIT_TOKEN=<classic PAT>` | `pnpm install` 401 against `npm.pkg.github.com` (sometimes opaque against `npmjs.org` — see KN-1) | `detectShellToken` (Phase 3) |
| `.npmrc` | `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` (env-var ref, **never** literal) plus `@cbartens:registry=https://npm.pkg.github.com` | Same 401, more opaque (pnpm v7.20+ silently ignores entire `.npmrc` — see KN-1) | `detectNpmrcAuth` (Phase 3) |
| GitHub Actions secret | `gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN` AND `env: { GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }} }` on every install step | CI 401 on `@cbartens/bkit` fetch on next push | `detectGhSecret` + `detectCiYmlMissingTokenEnv` (Phase 3, blocker when `.npmrc` references `${GH_BKIT_TOKEN}`) |
| Vercel env (preview + production) | `vercel env add GH_BKIT_TOKEN preview` and `vercel env add GH_BKIT_TOKEN production` | Vercel preview / production deploy 401 — Vercel runs `pnpm install` in a separate container, no GH-secret inheritance | `detectVercelEnv("preview" \| "production")` (Phase 3) |

Token must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` permission (fine-grained). Generate at <https://github.com/settings/tokens>.

### `dist/` commit policy

Any TypeScript change under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit.

- Pre-commit and pre-push hooks run `typecheck` + `test` only — they do NOT run `pnpm build`.
- CI's `run-tests` job has a "Verify dist/ is fresh" step (`pnpm build && git diff --exit-code dist/`) that fails the build if shipped artefacts drift from source.
- Hit during BAR-141 PR #5: commit `edbd891` (source only) failed; commit `7ab6bff` regenerated `dist/` and unblocked CI. See KN-7.

### `bkit install` three-phase contract

bkit's installer runs in three phases (BAR-141, DE-4):

1. **Phase 1 — Preflight (read-only).** Runs blocker + advisory detectors. Blockers exit 1 before any writes (e.g. malformed `package.json`, hooks-config overwrite risk on consumer-extended files). Advisories accumulate in `ctx.advisories`.
2. **Phase 2 — Install (writes).** Module dispatch as before; modules append further structured advisories to `ctx.advisories`.
3. **Phase 3 — Post-install (re-detect).** Re-runs token-surface, `ci.yml`, vale-sync, devDeps detectors after writes. Cross-phase dedupe: Phase 3 wins on id conflict. Skipped in `bkit check` (dry-run) — only Phase 1 advisories render. See KN-4.

`pnpm bkit install` always runs all three phases. `pnpm bkit check` runs only Phase 1; if any drift is detected, exits 1 with Phase 1 advisories rendered.
