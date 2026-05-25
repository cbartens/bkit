<!-- bkit:start -->

# Knowledge

> [!CAUTION]
> **Purpose:** Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only.
> **ID:** `KN-{N}` — next = `max(grep 'KN-\d+') + 1`.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Grep keywords/categories first → read only relevant, no dupes.
>
> **Format:**
>
> ```markdown
> ## KN-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Symptom:** observed (n/a for pattern/config)
> - **Root cause:** why
> - **Fix or rule:** action
> - **Type:** gotcha | pattern | config | dependency | workaround | post-mortem
> - **Confidence:** high | medium | low
> - **Severity:** critical | normal
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```
>
> **Namespacing:** bkit-shipped entries use `KN-CORE-{N}` and live inside this block (ported to consumers on upgrade). Consumer entries use `KN-{N}`, appended after `bkit:end`; the next-id formula ignores `KN-CORE-*`.

## KN-CORE-1: GitHub MCP / `gh` 401 immediately after token rotation (2026-05-24)

- **Category:** integrations
- **Symptom:** 401 from the GitHub MCP server or `gh` despite a freshly-rotated, valid, correctly-scoped `GH_TOKEN`.
- **Root cause:** the MCP server captures `GH_TOKEN` at process launch, so a mid-session rotation leaves it holding the dead token. Non-interactive shells also miss direnv (`.envrc` re-sources only on interactive prompt/cd), so `gh` keeps the stale exported value.
- **Fix or rule:** restart/reload the MCP server after rotating the token; for one-off CLI prefix `direnv exec . gh …`. Confirm the live token matches the file before chasing PAT scopes/approval.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** #137

## KN-CORE-2: Opaque 401 from `pnpm install` — one unset `${VAR}` makes pnpm ignore the entire `.npmrc` (2026-05-24)

- **Category:** infra
- **Symptom:** `pnpm install` (local, CI, or Vercel build) fails with a generic 401 against `registry.npmjs.org` — NOT against `npm.pkg.github.com`. The error reads as a plain auth failure with no "token missing" wording, and `@cbartens/bkit` is reported as not found.
- **Root cause:** pnpm v7.20+ silently discards the ENTIRE `.npmrc` the moment any `${VAR}` in it resolves to an unset env var. The `@cbartens:registry=https://npm.pkg.github.com` scope mapping is dropped, pnpm falls back to npmjs.org, which has no `@cbartens/bkit` → 401. The unset variable is almost always `GH_BKIT_TOKEN`. Separately, pnpm does NOT parse POSIX fallback syntax: `${VAR:-default}` sends no auth at all and 401s — use bare `${VAR}` only.
- **Fix or rule:** `GH_BKIT_TOKEN` must be present on every surface that runs `pnpm install`: (1) exported in your shell before local installs; (2) an Actions secret on the repo; (3) a Vercel env var on BOTH preview and production (Vercel-deployed consumers). Diagnose with `echo "${GH_BKIT_TOKEN:-MISSING}"` immediately before `pnpm install`. Keep `.npmrc` to bare `${VAR}` form — never `${VAR:-default}`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** human
- **Related:** `.npmrc`, `package.json`, `security.md`

## KN-CORE-3: GitHub Apps & CI integrations read config from the DEFAULT branch — land config on `main` before activating (2026-05-24)

- **Category:** integrations
- **Symptom:** A newly added integration config (`renovate.json5`, `dependabot.yml`, a branch-protection-scoped check, etc.) appears inert, or the App's onboarding PR opens against the wrong base branch / ungrouped / with a redundant root config — because the file was committed on a feature or integration branch but not yet merged to the default branch.
- **Root cause:** GitHub Apps and most CI integrations resolve their configuration from the repository's DEFAULT branch at install/scan time, not from the branch where the file was committed. bkit consumers gate the default branch to PRs-from-integration-branch-only, so the config must travel through to the default branch before the integration can see it. Activating the App first makes it scan a branch that has no config yet.
- **Fix or rule:** Land the config on the default branch FIRST (merge it through your integration branch → default), THEN install/activate the App. `bkit install --renovate` enforces this with a two-phase flow: Phase A writes the file and prompts you to merge it to the default branch; Phase B (re-run after the merge) detects it on the remote default branch, then prints the App install URL + activation checklist. The same ordering applies to Dependabot and any default-branch-scoped integration. See `security.md` § Renovate activation. **Renovate-specific:** the default-branch read applies to _ongoing_ config edits too, not just first activation — an edit to `renovate.json5` on `dev` is invisible until merged to `main`. bkit ships `useBaseBranchConfig: "merge"` so dev-side edits are honored for dev-targeted runs, but that option is itself read from `main` and needs one bootstrap merge to `main` before it takes effect.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `security.md` (§ Renovate activation, § Dependabot alternative), `.github/renovate.json5`, `.github/dependabot.yml`

## KN-CORE-4: `pnpm update @cbartens/bkit` narrows the manifest range to an exact minor (pnpm 10) (2026-05-24)

- **Category:** infra
- **Symptom:** After `pnpm update @cbartens/bkit`, `package.json` is rewritten from `"@cbartens/bkit": "^2"` to `"^2.0.5"` and `pnpm-lock.yaml` records `specifier: ^2.0.5`. Future minor/patch releases no longer satisfy the manifest range — the consumer is silently pinned to one exact minor and stops receiving bkit updates.
- **Root cause:** pnpm 10 changed the default behaviour of `pnpm update <pkg>` from a lockfile-only re-resolve to rewriting the manifest specifier to the resolved version.
- **Fix or rule:** After any `pnpm update @cbartens/bkit`, confirm the manifest range is still the broad `"^2"`. If pnpm narrowed it, restore the range by hand and re-resolve with `pnpm install --frozen-lockfile=false`. Verify with `grep -A2 "'@cbartens/bkit'" pnpm-lock.yaml` → expect `specifier: ^2`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `package.json`, `pnpm-lock.yaml`

## KN-CORE-5: Renovate's tag→SHA pinning ignores `enabled: false` — fence bkit-owned workflows via `ignorePaths` (2026-05-25)

- **Category:** integrations
- **Symptom:** Renovate repeatedly opens a `chore(deps): Pin dependencies` PR whose only change pins the `uses:` action tags in `.github/workflows/bkit-cloud.yml` to SHAs. Closing it — even with the branch deleted — brings it back on the next scan, recreating across multiple PRs in a single repo.
- **Root cause:** The bkit-cloud.yml fence was a packageRule `matchFileNames` + `enabled: false`. `enabled: false` suppresses _version updates_, but the `github-actions` manager still SCANS the file and Renovate's tag→SHA `pinDigests` (enabled globally for github-actions) is applied anyway — so the Pin PR keeps getting created, contradicting the file's own tag-only-pin header. Regression from the 2.6.0 `bkit-ci-router.yml → bkit-cloud.yml` rename: the packageRule was renamed but the file was never added to `ignorePaths`.
- **Fix or rule:** Add bkit-owned, tag-pinned workflow files to `ignorePaths` — Renovate then doesn't scan them at all, which is the only thing that stops the pinning. `enabled: false` is NOT sufficient. bkit ships `.github/workflows/bkit-cloud.yml` in `ignorePaths`; the `matchFileNames` packageRule is kept only as a secondary guard.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `security.md` (§ SHA-pinning / Renovate), `.github/renovate.json5`, `.github/workflows/bkit-cloud.yml`

<!-- bkit:end -->
