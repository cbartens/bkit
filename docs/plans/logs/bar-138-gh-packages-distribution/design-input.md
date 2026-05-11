# Design Input: BAR-138 — bkit distribution GitHub Packages npm registry

## Session Prompt

Design the implementation for BAR-138: migrate `@cbartens/bkit` distribution from a git-dependency to the GitHub Packages npm registry. Ships as v0.4.0.

## Issue Description

## Goal

Migrate `@cbartens/bkit` distribution from a git-dependency (with auth-shim + `prepare` hook history) to the **GitHub Packages npm registry**. Eliminates the entire git-clone + auth-shim story for consumers and aligns bkit with standard npm-package distribution semantics.

Ships as **v0.4.0**. Coordinated migration — every consumer (`app-gether-life`, `www-visitfrasercoast-com`, etc.) updates `.npmrc`, secret scopes, and `package.json` dep spec on the same upgrade.

## Background

bkit currently distributes via `pnpm add -D github:cbartens/bkit#vX.Y.Z`. This worked but produced a chain of friction:

- **Private-repo clone needs git auth.** Solved with the `git config --global url.insteadOf` shim driven by `GH_BKIT_TOKEN` (BAR-130 #1, BAR-131 #1).
- **Two surfaces to provision.** GH Actions and Vercel each need their own auth-shim path (BAR-130 Failure #4).
- **Lifecycle-hook OOM.** `prepare: tsc` running on a workspace with `onlyBuiltDependencies` triggered recursive `pnpm install` until the Vercel build container OOMed (BAR-130 Failure #5). Fixed in v0.3.0 by shipping pre-built `dist/` and dropping the hook, but the underlying fragility (any future lifecycle hook re-introduces the bug) remains.
- **pnpm tag-drop.** `pnpm add` rewrites `github:cbartens/bkit#vX.Y.Z` to `git+https://...` without the tag pin (BAR-131 #2). Workaround documented; bug persists.

GitHub Packages npm registry kills all four. Free for private packages. Standard npm tooling. Token auth via `.npmrc` instead of git config — no shim needed on Vercel or anywhere else.

## Approach

Two moving pieces: **publishing pipeline** on the bkit side, and **consumer migration guide** for downstream repos.

### Bkit-side

1. `package.json` publish config:
   - `private: true` → `private: false` (required for `npm publish`).
   - Add `publishConfig`:
     ```json
     "publishConfig": {
       "registry": "https://npm.pkg.github.com",
       "access": "restricted"
     }
     ```
   - Verify `files` array still ships `dist/`, `.agents/`, `README.md` (already correct since v0.3.0).
   - Optional: drop `repository.url` git+ prefix if it confuses npm.

2. **Release workflow** — new `.github/workflows/release.yml` triggered on tag push (`v*`):

   ```yaml
   on:
     push:
       tags: ["v*"]
   jobs:
     publish:
       permissions:
         contents: read
         packages: write
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
             registry-url: https://npm.pkg.github.com
             scope: "@cbartens"
         - uses: pnpm/action-setup@v4
         - run: pnpm install --frozen-lockfile
         - run: pnpm check:dist
         - run: npm publish
           env:
             NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   Uses the workflow's built-in `GITHUB_TOKEN` (no PAT needed for publish — the workflow itself has `packages: write`).

3. **bkit-self installer print messages** — `runCiModule` updates:
   - Drop `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` git auth-shim language. Replace with `.npmrc` setup AI message.
   - Drop `VERCEL_AUTH_INSTRUCTIONS` git auth-shim block. Replace with Vercel env-var-only AI message (no `installCommand` shim needed).
   - `checkBkitTokenSecret` keeps working — same secret name, just used for npm registry auth instead of git auth.

4. **README + .agents/README** rewrites:
   - Replace `pnpm add -D github:cbartens/bkit#vX.Y.Z` with `pnpm add -D @cbartens/bkit@^X.Y.Z` everywhere.
   - Replace "Consumer CI auth" + "Consumer Vercel auth" sections with a single "GitHub Packages auth" section covering `.npmrc`, secret scopes, and CI/Vercel env-var setup.
   - Update install snippets, troubleshooting, and the BAR-131 #2 pnpm tag-drop note (no longer relevant — registry semver pinning).

5. **ADR** `DE-3` — new decisions.md entry documenting the distribution model change. Why GH Packages over npmjs (cost), git-dep (fragility), tarball-release (URL clunk), or vendoring (per-repo work).

6. **Token requirements update** — the existing `GH_BKIT_TOKEN` PAT was scoped `Contents: read` on `cbartens/bkit`. For npm registry auth it needs `read:packages` (a classic-PAT scope) or fine-grained PAT with **Packages: read**. Document the regenerate as a one-time consumer step.

### Consumer-side (per-repo migration guide)

For each consumer (`app-gether-life`, `www-visitfrasercoast-com`):

1. **Update** `GH_BKIT_TOKEN` PAT to include `read:packages` scope. Re-set the secret in:
   - GitHub Actions: `gh secret set GH_BKIT_TOKEN --body=<new-token>` per repo
   - Vercel: `vercel env rm/add GH_BKIT_TOKEN preview` and `production` per project

2. **Add** `.npmrc` at the consumer repo root:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}
   ```

   Commit it. Token interpolation happens at install time from env.

3. **Update** `package.json`:

   ```diff
   -  "@cbartens/bkit": "github:cbartens/bkit#v0.3.0"
   +  "@cbartens/bkit": "^0.4.0"
   ```

4. **Update CI workflows** — drop `Configure private-repo auth` step. Add `GH_BKIT_TOKEN` env to install step:

   ```yaml
   - name: Install dependencies
     run: pnpm install --frozen-lockfile
     env:
       GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
   ```

5. **Update** `vercel.json` — drop the git auth-shim from `installCommand`:

   ```diff
   -  "installCommand": "git config --global url.\"https://x-access-token:$GH_BKIT_TOKEN@github.com/cbartens/bkit/\".insteadOf \"https://github.com/cbartens/bkit/\" && pnpm install"
   +  "installCommand": "pnpm install"
   ```

   `GH_BKIT_TOKEN` is already in Vercel env vars; pnpm reads `.npmrc` and uses it for the npm registry directly.

6. **Run** `pnpm install` to refresh the lockfile (npm registry resolution, not git commit hash).

7. **Re-run** `bkit install --full` — refreshed templates, refreshed prints (no more git-shim instructions).

## Scope

### In scope (bkit v0.4.0)

- All bkit-side changes listed above.
- Updated installer print messages.
- New release workflow.
- Updated README + ADR.
- A test publish to GH Packages from a `pre.1` tag to validate the pipeline before cutting v0.4.0 proper.
- End-to-end smoke test: install v0.4.0 in a scratch consumer repo via `.npmrc`, run `bkit install --full`, verify nothing breaks.

### Out of scope

- Per-consumer migrations (`app-gether-life`, `www-visitfrasercoast-com`) — happen as separate per-repo PRs after v0.4.0 ships, using the consumer-side guide above.
- Backward-compatible support for the old git-dep distribution. v0.3.x stays consumable by anyone not yet migrated; v0.4.0 is the cutover. No dual-publish.
- Migration of `BKIT_READ_TOKEN`-style auth in consumers that haven't already done the v0.2.2 rename. Block on that prerequisite.

## DoD

- [ ] `package.json` `private: false` + `publishConfig.registry` set to GH Packages.
- [ ] `.github/workflows/release.yml` publishes on tag push, gated by typecheck/test/check:dist.
- [ ] First successful `npm publish` to `https://npm.pkg.github.com/@cbartens/bkit` (visible at https://github.com/cbartens/bkit/packages).
- [ ] Scratch consumer repo can install with just `.npmrc` + `GH_BKIT_TOKEN` env — no git auth-shim anywhere.
- [ ] `bkit install --ci` print messages updated — `.npmrc` instructions instead of git auth-shim instructions.
- [ ] README + .agents/README rewritten for npm-registry install path.
- [ ] ADR DE-3 entry added documenting decision rationale.
- [ ] Tagged and pushed `v0.4.0`. Release workflow green.
- [ ] One real consumer (e.g. `app-gether-life`) successfully migrated using the consumer-side guide. Both GH Actions and Vercel CI runs green.
- [ ] BAR-131 #2 (pnpm tag-drop) marked resolved — no longer applicable to registry semver.

## References

- BAR-130 — distribution alternatives analysis lives in comment 522d990a (Option 4a vs Option 2 trade-off, why phased).
- BAR-130 v0.3.0 ship comment — current state of git-dep distribution post-fixes.
- BAR-131 — consumer issues catch-all (#2 pnpm tag-drop becomes a non-issue post-migration).
- GitHub Packages npm docs: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry
- Existing PAT setup: README § "Consumer CI auth" — same secret, expanded scope.

## Suggested implementation order

1. Branch `feat/gh-packages-distribution`. Base off latest `main`.
2. Add publishConfig + release.yml. Cut a `v0.4.0-pre.1` tag to validate publish pipeline. Don't touch installer prints yet — verify the pipeline first.
3. If pre.1 publish lands: write installer print updates, README rewrite, ADR. Cut `v0.4.0-pre.2` to verify all messages render right with the new install flow.
4. Consumer-side smoke test in a scratch tmp-repo (or `app-gether-life` worktree) — confirm `.npmrc` + token + `pnpm install` works end-to-end on Vercel.
5. Cut `v0.4.0` proper. Update BAR-130 + this issue with ship summary.

## Comments

(No comments on this issue yet)
