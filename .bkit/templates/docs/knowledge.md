<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

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
> - **Confidence:** high | medium | low — raise on re-observation, lower on contradiction/correction
> - **Last-confirmed:** YYYY-MM-DD — most recent re-verification; defaults to entry date
> - **Severity:** critical | normal
> - **Scope:** bkit-repo | consumer | universal
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```
>
> **Namespacing:** bkit-shipped entries use `KN-CORE-{N}` and live inside this block (ported to consumers on upgrade). Consumer entries use `KN-{N}`, appended after `bkit:end`; the next-id formula ignores `KN-CORE-*`.

## KN-CORE-1: GitHub MCP / `gh` 401 immediately after token rotation (2026-05-24)

- **Category:** integrations
- **Symptom:** 401 from the GitHub MCP server or `gh` despite a freshly-rotated, valid, correctly-scoped PAT in `.bkit/.env`.
- **Root cause:** the MCP server captures `GH_BKIT_TOKEN` at process launch, so a mid-session rotation leaves it holding the dead token. Non-interactive shells also miss direnv (`.envrc` re-sources only on interactive prompt/cd), so the shell keeps a stale exported value. For `gh` specifically, an exported `GH_TOKEN` (legacy or manual) overrides the keyring — see KN-CORE-8.
- **Fix or rule:** restart/reload the MCP server after rotating the token; for one-off CLI prefix `direnv exec . gh …`. Confirm the live `GH_BKIT_TOKEN` matches `.bkit/.env` before chasing PAT scopes/approval.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** #137

## KN-CORE-2: Opaque 401 from `pnpm install` — one unset `${VAR}` makes pnpm ignore the entire `.npmrc` (2026-05-24)

- **Category:** infra
- **Symptom:** `pnpm install` (local, CI, or Vercel build) fails with a generic 401 against `registry.npmjs.org` — NOT against `npm.pkg.github.com`. The error reads as a plain auth failure with no "token missing" wording, and `@cbartens/bkit` is reported as not found.
- **Root cause:** pnpm v7.20+ silently discards the ENTIRE `.npmrc` the moment any `${VAR}` in it resolves to an unset env var. The `@cbartens:registry=https://npm.pkg.github.com` scope mapping is dropped, pnpm falls back to npmjs.org, which has no `@cbartens/bkit` → 401. The unset variable is almost always `GH_BKIT_TOKEN_INSTALL`. Separately, pnpm does NOT parse POSIX fallback syntax: `${VAR:-default}` sends no auth at all and 401s — use bare `${VAR}` only.
- **Fix or rule:** `GH_BKIT_TOKEN_INSTALL` must be present on every surface that runs `pnpm install` (shell for local installs, an Actions secret, a Vercel env var on preview + production). Diagnose with `echo "${GH_BKIT_TOKEN_INSTALL:-MISSING}"` immediately before `pnpm install`. **Update (pnpm >=10.34.3):** bkit no longer stores any auth token in the project `.npmrc` — the `${VAR}` env-substitution path 401s on download even when the token is set; the token now goes into pnpm's user-level config via `pnpm config set`. See KN-CORE-7.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** human
- **Related:** KN-CORE-7, `.npmrc`, `package.json`, `security.md`

## KN-CORE-3: GitHub Apps & CI integrations read config from the DEFAULT branch — land config on `main` before activating (2026-05-24)

- **Category:** integrations
- **Symptom:** A newly added integration config (`renovate.json5`, `dependabot.yml`, a branch-protection-scoped check, etc.) appears inert, or the App's onboarding PR opens against the wrong base branch / ungrouped / with a redundant root config — because the file was committed on a feature or integration branch but not yet merged to the default branch.
- **Root cause:** GitHub Apps and most CI integrations resolve their configuration from the repository's DEFAULT branch at install/scan time, not from the branch where the file was committed. bkit consumers gate the default branch to PRs-from-integration-branch-only, so the config must travel through to the default branch before the integration can see it. Activating the App first makes it scan a branch that has no config yet.
- **Fix or rule:** Land the config on the default branch FIRST (merge it through your integration branch → default), THEN install/activate the App. `bkit install --dependency=renovate` enforces this with a two-phase flow: Phase A writes the file and prompts you to merge it to the default branch; Phase B (re-run after the merge) detects it on the remote default branch, then prints the App install URL + activation checklist. The same ordering applies to Dependabot and any default-branch-scoped integration. See `deployments.md` § GitHub Actions pinning. **Renovate-specific:** the default-branch read applies to _ongoing_ config edits too, not just first activation — an edit to `renovate.json5` on `dev` is invisible until merged to `main`. bkit ships `useBaseBranchConfig: "merge"` so dev-side edits are honored for dev-targeted runs, but that option is itself read from `main` and needs one bootstrap merge to `main` before it takes effect.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `deployments.md` (§ GitHub Actions pinning), `.github/renovate.json5`, `.github/dependabot.yml`

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
- **Related:** `deployments.md` (§ GitHub Actions pinning), `.github/renovate.json5`, `.github/workflows/bkit-cloud.yml`

## KN-CORE-6: Renovate's hosted lockfile regen ignores `pnpm.overrides` — fence overridden packages in the consumer-owned `renovate-local.json5` (2026-05-25)

- **Category:** integrations
- **Symptom:** A package pinned in root `pnpm.overrides` (e.g. `react = 19.2.4` to stop cross-package skew) gets its locked version rewritten by Renovate on an "eligible" bump (e.g. patch `19.2.4 → 19.2.6`) while the `19.2.4` override stays in `package.json`. The resulting `pnpm-lock.yaml` is inconsistent → CI fails `pnpm install --frozen-lockfile` with `ERR_PNPM_OUTDATED_LOCKFILE … doesn't satisfy range`, `automerge` never fires, and Renovate keeps recreating/rebasing the branch, clobbering any manually-corrected lockfile pushed to it.
- **Root cause:** Renovate's hosted lockfile regeneration does NOT reconcile the bumped version against `pnpm.overrides` (local `pnpm` does). Same shape as the `bkit-cloud.yml` SHA-pin case — a Renovate config fighting an intentional pin. The class is general: any `pnpm.overrides`-pinned package can hit it; react was just the instance. A bare react fence in the canonical `renovate.json5` is the wrong layer — bkit has no react, so it would push a consumer-specific pin to every consumer and re-appear on the next override (whack-a-mole).
- **Fix or rule:** Fence the overridden package in `.github/renovate-local.json5` (consumer-owned, bkit-seeded once, survives `install`/`upgrade`; pulled into `renovate.json5` via `extends: ["local>{{REPO_SLUG}}//.github/renovate-local.json5"]` — the explicit `.json5` extension is load-bearing; an extensionless local preset resolves to `.json`, 404s, and Renovate disables the whole config): `{ matchPackageNames: ["<pkg>"], enabled: false }`. Precedence caveat: extended-preset rules are evaluated BEFORE bkit's inline rules, so the fence works only because it sets `enabled: false` and bkit never sets `enabled: true` on a matching rule — `renovate-local` canNOT override keys bkit sets explicitly (e.g. `automerge`). Renovate resolves the preset from the default branch; commit `renovate-local.json5` alongside `renovate.json5` and land both there (the `extends` target must exist or Renovate raises a config error). See bkit issue #179.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `deployments.md` (§ GitHub Actions pinning), `.github/renovate.json5`, `.github/renovate-local.json5`, `package.json` (`pnpm.overrides`)

## KN-CORE-7: pnpm >=10.34.3 auth rework — project `.npmrc` `${GH_BKIT_TOKEN_INSTALL}` 401s on download; use user-level `pnpm config set` (2026-06-15)

- **Category:** infra
- **Symptom:** `pnpm install` / `pnpm add @cbartens/bkit` fails with `ERR_PNPM_FETCH_401` (`GET https://npm.pkg.github.com/@cbartens%2Fbkit: Unauthorized`) on pnpm >=10.34.3 even though `GH_BKIT_TOKEN_INSTALL` is correctly set in the environment. Metadata calls (`pnpm view @cbartens/bkit`) still resolve, so "it works locally" via `view` is misleading — only the actual download 401s. pnpm 10.34.1 is unaffected (the regression boundary is between 10.34.1 and 10.34.3).
- **Root cause:** pnpm's auth-handling rework stopped honouring a project-level `.npmrc` env-substitution `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN_INSTALL}` at install fetch time. The token must instead live in pnpm's user-level auth config. Independently, config precedence is project `.npmrc` > user config, so a leftover project auth line also shadows a correct user-level token.
- **Fix or rule:** Commit ONLY the registry mapping in the project `.npmrc` (`@cbartens:registry=https://npm.pkg.github.com`) — NEVER an `_authToken` line. Write the token into pnpm's user-level config with `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"` on every surface that runs `pnpm install`: CI (a step before install), local dev (run once), Vercel (`vercel.json` `installCommand: pnpm config set //npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL && pnpm install`). `pnpm config set` stores the shell-expanded literal token (the shell resolves `$GH_BKIT_TOKEN_INSTALL` before pnpm writes it), so the one command is version-proof across pnpm 10.x and 11.x — prefer it over a hand-written `~/.npmrc`. Do NOT "restore" the project `.npmrc` `_authToken` line: it appears to work only on pnpm 10.34.1 (warning + store cache) and 401s again the instant pnpm bumps.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** human
- **Related:** KN-CORE-2, `.npmrc`, `deployments.md` (§ Consumer CI auth)

## KN-CORE-8: `GH_TOKEN` in shell overrides `gh auth login` keyring (2026-06-17)

- **Category:** integrations
- **Symptom:** Agent or human reports "`GH_TOKEN` env var is overriding the keyring token which has proper repo scopes"; `gh` behaves differently from `gh auth status` expectations.
- **Root cause:** `gh` checks `GH_TOKEN` / `GITHUB_TOKEN` before the OS keyring. bkit historically exported `GH_TOKEN` from `.bkit/.env` for both MCP and CLI — direnv put a fine-grained PAT in the shell and shadowed `gh auth login`.
- **Fix or rule:** Use `GH_BKIT_TOKEN` in `.bkit/.env` for the GitHub MCP server only (`Authorization: Bearer ${GH_BKIT_TOKEN}` in `.mcp.json`). Use `gh auth login` for the CLI locally — do not export `GH_TOKEN` from `.bkit/.env`. Cloud dashboards: set `GH_BKIT_TOKEN` for MCP; authenticate `gh` via setup/bootstrap (`gh auth login --with-token`) or cloud-only `GH_TOKEN` if headless CLI requires it. CI keeps `GH_TOKEN: ${{ github.token }}` in workflow steps (unchanged).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** #287, KN-CORE-1, `.bkit/.env.example`, `.mcp.json`

## KN-CORE-9: Agent shell misses direnv — repo env vars appear unset (2026-06-17)

- **Category:** agentic
- **Symptom:** `SENTRY_AUTH_TOKEN`, `GH_TOKEN`, `VERCEL_TOKEN`, `OPENROUTER_API_KEY`, etc. empty in Cursor agent Shell; Sentry `curl` 401; `gh` 401; `/bkit-debug` blocks print `[debug-fetch:*] skipped — … unset` despite values present under `.bkit/.env` or `apps/web/.env.local`.
- **Root cause:** `.envrc` loads repo env via direnv: `dotenv_if_exists .bkit/.env`, `apps/web/.env.local`, `apps/web/.env.preview`. Interactive terminals re-source on `cd`; Cursor agent Shell and other non-interactive bash do not auto-run direnv — so **none** of those exports reach the agent. macOS GUI apps launched from Dock also miss direnv (see `.bkit/providers.md` — `bkit cursor`). **Exception:** `.envrc` deliberately `unset`s some `apps/web/.env.local` keys (`UPSTASH_*`, `SUPABASE_PROJECT_ID`) even when direnv runs — they stay out of `$ENV` by design; read the file or use Next.js/runtime paths instead.
- **Fix or rule:** One-off CLI/API from agent: prefix `direnv exec . bash -c '…'` (loads all `.envrc` sources). Verify: `direnv exec . bash -c 'test -n "$SENTRY_AUTH_TOKEN" && echo ok'`. Persistent GUI/MCP env: launch Cursor with `bkit cursor`. Cloud/headless agents: set tokens in dashboard env (see `docs/observability.md` Debug Fetch). Sentry org API: EU host `https://de.sentry.io/api/0/...` if global `sentry.io` 404s on issue IDs. Same pattern as KN-CORE-1 (`GH_TOKEN`).
- **Type:** gotcha
- **Confidence:** high
- **Last-confirmed:** 2026-06-17
- **Severity:** normal
- **Scope:** consumer
- **Source:** agent
- **Related:** KN-CORE-1, `.envrc`, `.bkit/.env`, `apps/web/.env.local`, `apps/web/.env.preview`, `.bkit/providers.md`, #478, `docs/observability.md`, `SENTRY_AUTH_TOKEN`

## KN-CORE-10: Mend hosted Renovate OOMs on the 3 GB microvm — offer a self-hosted runner on ubuntu-latest via renovatebot/github-action (2026-07-04)

- **Category:** integrations
- **Symptom:** Every Mend-hosted Renovate job on a large pnpm-11 monorepo fails `kernel-out-of-memory` (3.0/3.0 GB) during `pnpm update --lockfile-only`, blocking all dependency PRs; the worker-cap + Renovate-side `minimumReleaseAge` (KN-41) mitigate but do not guarantee headroom as the graph grows (app-gether-life hit the ceiling 2026-07-04).
- **Root cause:** Mend Community Cloud runs Renovate in a fixed ~3 GB hosted microvm; pnpm-11 lockfile resolution + release-age metadata for a large graph exceeds physical RAM. The constraint is runner size, not config — CI / Vercel (>> 3 GB) never OOM.
- **Fix or rule:** Offer a self-hosted alternative — a bkit-managed `.github/workflows/renovate.yml` running `renovatebot/github-action@<pinned-sha>` on `ubuntu-latest` (~16 GB), reusing the SAME backend-agnostic `renovate.json5`. Correctness points: (1) platform auth MUST be a PAT / GitHub App as `GH_BKIT_TOKEN`, NOT `GITHUB_TOKEN` (its PRs don't trigger CI, so `platformAutomerge` never fires); (2) private-registry auth moves from Mend `{{ secrets.GH_BKIT_TOKEN_INSTALL }}` templating to a `RENOVATE_HOST_RULES` env (consumer comments the `token` line in `renovate-local.json5` — an uncommented Mend-style line adds an empty-token rule and 401s); (3) the workflow cron wakes the bot (every 4h) while `renovate.json5`'s own `schedule` gates normal PRs and `osvVulnerabilityAlerts` bypasses both — do NOT narrow the cron to Monday-only; (4) `concurrency: { group: renovate, cancel-in-progress: false }`; (5) the Mend App MUST be suspended for the repo (GitHub UI, no `gh api`) or both open duplicate PRs — surfaced by the `renovate-self-hosted-mend-both-active` advisory (warn-only; App state is off-repo / undetectable); (6) `renovate.yml` goes in `renovate.json5` `ignorePaths` (KN-CORE-5) so consumer Renovate never bumps its own pinned action. OOM mitigations are KEPT, not relaxed. Adopt the existing Dependency Dashboard + open PRs by keeping the default `renovate/` `branchPrefix`. (7) Token scope + repo settings the smoke run surfaced: the `GH_BKIT_TOKEN` fine-grained PAT needs `Dependabot alerts: Read` (else `403` on the alert feed — non-fatal, OSV still covers CVEs), and the repo must have `Dependency graph` + `Dependabot alerts` ENABLED but `Dependabot security updates` + `Dependabot version updates` DISABLED (detection ON, auto-fixing OFF — else Dependabot opens PRs competing with Renovate). (8) Commit author: Renovate reads the token owner's email via the `Email addresses: Read` **Account** permission, which exists ONLY on personal-account tokens — org-owned tokens have no such permission, so set the repo variable `RENOVATE_GIT_AUTHOR` (the shipped workflow reads `${{ vars.RENOVATE_GIT_AUTHOR }}`); otherwise commits show the Mend bot author as `Unverified` (cosmetic). (9) `Commit statuses: Read and write` is REQUIRED on the PAT — Renovate reads `/commits/{sha}/statuses` to open the PR / gate `platformAutomerge` and posts its own `renovate/stability-days` checks; missing it, Renovate creates the `renovate/*` branch but `403`s and opens NO PR (symptom: lone `renovate/*` branch, no PR, no CI run). Fine-grained PATs have NO `Checks` permission (check-run writes are App-only) — commit statuses is the PAT mechanism; do not hunt for a Checks toggle. (10) Config hygiene: `matchPackagePatterns` and `baseBranches` are deprecated in Renovate 41+ and drive the Dependency Dashboard's "Config Migration Needed" prompt; the shipped `renovate.json5` uses `matchPackageNames` (glob) + `baseBranchPatterns`, so consumers never see that prompt — do NOT accept it via the dashboard checkbox (`renovate.json5` is Tier-1 canonical-overwrite; a migration PR is clobbered on the next `bkit install`/`upgrade` — fix such deprecations in the bkit template + ship).
- **Type:** post-mortem
- **Confidence:** high
- **Last-confirmed:** 2026-07-04
- **Severity:** normal
- **Scope:** consumer
- **Source:** human
- **Related:** KN-41, KN-CORE-3, KN-CORE-5, KN-CORE-8, #308, #123, #325

<!-- bkit:end -->
