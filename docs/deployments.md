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

`GH_BKIT_TOKEN` is required at four surfaces; missing any one breaks an install or CI run. Detector coverage in `bkit install` Phase 3 mirrors this matrix.

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
- See KN-7 for the recurring source-only-commit failure mode.

### `.husky/pre-push` mirror-drift gate (bkit repo only)

The bkit repo's `.husky/pre-push` runs `pnpm bkit check` AFTER the templated `# bkit:end` marker, guarded by `set -e` above `# bkit:start`. Failing exit aborts the push when `.agents/*` was edited without `bkit install` regenerating `.claude/*` / `.cursor/*` / `.husky/*` mirrors.

- Lives **outside** the bkit:start/end block so Tier-2 re-install preserves it AND it does not leak into consumer repos via `.agents/templates/.husky/pre-push`.
- Consumers don't get this gate — they don't typically edit `.agents/*` source, so adding it to the template is pure ~1s push overhead with no detected pain.
- Fix on failure: run `pnpm bkit install`, stage the regenerated `.claude/*` / `.cursor/*` / `.husky/*` files, commit, push. `--no-verify` remains PROHIBITED per the universal pre-push rule.

### CI trigger on final workflow push

GitHub Actions suppresses both `pull_request` and `push` workflow runs when the HEAD commit message contains `[skip ci]` (or `[skip actions]`). When that happens on a PR branch, `gh pr view --json statusCheckRollup` returns empty — downstream fail-fast gates that check rollup status will admit a vacuously green PR.

**Rule:** every workflow's last push to a CI-validated ref MUST leave HEAD without `[skip ci]`.

| Surface | Mechanic |
| --- | --- |
| build / debug PR push (final) | Final commit `chore({FID}): close-workflow status trigger CI` — drops `[skip build] [skip ci]` from the existing close-workflow status commit. Push happens at end of close-workflow step. |
| ship squash merge | `gh pr merge --squash --body ""` — empty body strips `[skip ci]` from the squash subject so `dev`'s merge HEAD is clean. Followed by post-merge `gh run list --branch dev --limit 5` gate that captures `RUN_ID` and fails if no run registered within 60s of the push. |

All other docs-only intermediate commits (start-workflow, summary, create-pr, install-skills, switch-to-dev, update-docs, archive, worktree-cleanup) retain `[skip build] [skip ci]` to save CI minutes. Only the trailing `close-workflow status trigger CI` commit (build/debug) and the squash-merge subject (ship) are unmarked.

### `bkit install` three-phase contract

bkit's installer runs in three phases:

1. **Phase 1 — Preflight (read-only).** Runs blocker + advisory detectors. Blockers exit 1 before any writes (e.g. malformed `package.json`, hooks-config overwrite risk on consumer-extended files). Advisories accumulate in `ctx.advisories`.
2. **Phase 2 — Install (writes).** Module dispatch as before; modules append further structured advisories to `ctx.advisories`.
3. **Phase 3 — Post-install (re-detect).** Re-runs token-surface, `ci.yml`, vale-sync, devDeps detectors after writes. Cross-phase dedupe: Phase 3 wins on id conflict. Skipped in `bkit check` (dry-run) — only Phase 1 advisories render. See KN-4.

`pnpm bkit install` always runs all three phases. `pnpm bkit check` runs only Phase 1; if any drift is detected, exits 1 with Phase 1 advisories rendered.
