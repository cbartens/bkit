<!-- bkit:start -->

<!-- bkit:managed v4.1.5 — do NOT edit; run `bkit upgrade` to refresh -->

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
- **Root cause:** the MCP server captures `GH_MCP_TOKEN` at process launch, so a mid-session rotation leaves it holding the dead token. Non-interactive shells also miss direnv (`.envrc` re-sources only on interactive prompt/cd), so the shell keeps a stale exported value. For `gh` specifically, an exported `GH_TOKEN` (legacy or manual) overrides the keyring — see KN-CORE-8.
- **Fix or rule:** restart/reload the MCP server after rotating the token; for one-off CLI prefix `direnv exec . gh …`. Confirm the live `GH_MCP_TOKEN` matches `.bkit/.env` before chasing PAT scopes/approval.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** #137

## KN-CORE-2: Opaque 401 from `pnpm install` — one unset `${VAR}` makes pnpm ignore the entire `.npmrc` (2026-05-24)

- **Category:** infra
- **Symptom:** `pnpm install` (local, CI, or Vercel build) fails with a generic 401 against `registry.npmjs.org` — NOT against `npm.pkg.github.com`. The error reads as a plain auth failure with no "token missing" wording, and `@cbartens/bkit` is reported as not found.
- **Root cause:** pnpm v7.20+ silently discards the ENTIRE `.npmrc` the moment any `${VAR}` in it resolves to an unset env var. The `@cbartens:registry=https://npm.pkg.github.com` scope mapping is dropped, pnpm falls back to npmjs.org, which has no `@cbartens/bkit` → 401. The unset variable is almost always `GH_BKIT_TOKEN`. Separately, pnpm does NOT parse POSIX fallback syntax: `${VAR:-default}` sends no auth at all and 401s — use bare `${VAR}` only.
- **Fix or rule:** `GH_BKIT_TOKEN` must be present on every surface that runs `pnpm install` (shell for local installs, an Actions secret, a Vercel env var on preview + production). Diagnose with `echo "${GH_BKIT_TOKEN:-MISSING}"` immediately before `pnpm install`. The project `.npmrc` must carry both the registry mapping AND `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` — pnpm interpolates the env var at runtime. CI also runs `pnpm config set` as belt-and-braces.
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
- **Fix or rule:** Fence the overridden package in `.github/renovate-local.json5` (consumer-owned, bkit-seeded once, survives `install`/`upgrade`; pulled into `renovate.json5` via `extends: ["local>cbartens/bkit//.github/renovate-local.json5"]` — the explicit `.json5` extension is load-bearing; an extensionless local preset resolves to `.json`, 404s, and Renovate disables the whole config): `{ matchPackageNames: ["<pkg>"], enabled: false }`. Precedence caveat: extended-preset rules are evaluated BEFORE bkit's inline rules, so the fence works only because it sets `enabled: false` and bkit never sets `enabled: true` on a matching rule — `renovate-local` canNOT override keys bkit sets explicitly (e.g. `automerge`). Renovate resolves the preset from the default branch; commit `renovate-local.json5` alongside `renovate.json5` and land both there (the `extends` target must exist or Renovate raises a config error). See bkit issue #179.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** human
- **Related:** `deployments.md` (§ GitHub Actions pinning), `.github/renovate.json5`, `.github/renovate-local.json5`, `package.json` (`pnpm.overrides`)

## KN-CORE-7: `.npmrc` auth — both registry mapping AND auth token reference required (2026-06-17)

- **Category:** infra
- **Symptom:** `pnpm install` fails with `ERR_PNPM_FETCH_401` when the project `.npmrc` is missing the `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` line. Vercel builds are especially affected because Vercel reads `.npmrc` directly with no `pnpm config set` pre-step.
- **Root cause:** The `.npmrc` must carry BOTH lines: the registry scope mapping AND the auth token reference. pnpm interpolates `${GH_BKIT_TOKEN}` from the environment at runtime. Without the auth token line, pnpm has no credential for the GitHub Packages registry.
- **Fix or rule:** Ensure `.npmrc` at the repo root has both lines: `@cbartens:registry=https://npm.pkg.github.com` AND `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`. CI also runs `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` as belt-and-braces. **POSIX fallback syntax** (`${VAR:-default}`) must never appear — pnpm cannot parse it and 401s. Use bare `${VAR}` only.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** human
- **Related:** KN-CORE-2, `.npmrc`, `deployments.md` (§ Consumer CI auth)

## KN-CORE-8: `GH_TOKEN` in shell overrides `gh auth login` keyring (2026-06-17)

- **Category:** integrations
- **Symptom:** Agent or human reports "`GH_TOKEN` env var is overriding the keyring token which has proper repo scopes"; `gh` behaves differently from `gh auth status` expectations.
- **Root cause:** `gh` checks `GH_TOKEN` / `GITHUB_TOKEN` before the OS keyring. bkit historically exported `GH_TOKEN` from `.bkit/.env` for both MCP and CLI — direnv put a fine-grained PAT in the shell and shadowed `gh auth login`.
- **Fix or rule:** Use `GH_MCP_TOKEN` in `.bkit/.env` for the GitHub MCP server only (`Authorization: Bearer ${GH_MCP_TOKEN}` in `.mcp.json`). Use `gh auth login` for the CLI locally — do not export `GH_TOKEN` from `.bkit/.env`. Cloud dashboards: set `GH_MCP_TOKEN` for MCP; authenticate `gh` via setup/bootstrap (`gh auth login --with-token`) or cloud-only `GH_TOKEN` if headless CLI requires it. CI keeps `GH_TOKEN: ${{ github.token }}` in workflow steps (unchanged).
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

<!-- bkit:end -->

## KN-1: pnpm v7.20+ silently ignores entire `.npmrc` when `${VAR}` env-var is unset (2026-05-06)

- **Category:** infra
- **Symptom:** `pnpm install` fails with opaque 401 against npmjs.org (NOT `npm.pkg.github.com`). Error reads as generic auth failure — no "token missing" language. `@cbartens/bkit` not found on npmjs.org.
- **Root cause:** Any `${VAR}` in `.npmrc` resolving to an unset env-var causes pnpm v7.20+ to silently ignore the entire `.npmrc` and fall back to defaults. `@cbartens:registry=https://npm.pkg.github.com` is dropped; pnpm hits npmjs.org; npmjs.org has no `@cbartens/bkit`; 401.
- **Fix or rule:** Ensure `GH_BKIT_TOKEN` is: (1) exported in maintainer's shell before local `pnpm install`; (2) set as a GHA secret on the consumer repo; (3) set as a Vercel env var (preview + production) for Vercel-deployed consumers. Verify with `echo "${GH_BKIT_TOKEN:-MISSING}"` before `pnpm install` when troubleshooting. **Superseded by KN-CORE-7 (#274):** as of pnpm >=10.34.3 the project-`.npmrc` `${VAR}` auth path is no longer used at all (it 401s on download even with the token set); the token now lives in pnpm's user-level config via `pnpm config set`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-138, DE-3, `.agents/scripts/bkit-modules.ts` (installer print copy enumerates this verbatim in `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` and `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`)

## KN-2: `.npmignore` still applies inside `files`-listed directories in `package.json` (2026-05-06)

- **Category:** infra
- **Symptom:** Publishing with `"files": [".agents"]` ships all `.ts` source and `*.test.ts` files inside `.agents/scripts/` to consumers. Consumers have no use for test tooling or TypeScript sources (compiled output in `dist/`).
- **Root cause:** `files` in `package.json` is an allowlist — npm does NOT auto-exclude sub-files within listed directories. Without `.npmignore`, every file under `.agents/` is shipped.
- **Fix or rule:** Add `.npmignore` at repo root excluding `.bkit/src/*.ts` and `.bkit/src/__snapshots__/`. Verify with `npm publish --dry-run` before tagging. Note: `.npmignore` takes precedence over `.gitignore` during pack — if `.npmignore` exists, `.gitignore` is ignored.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-138, `.npmignore`, `package.json#files`

## KN-3: GitHub Actions `@v4` floating tags on publishing workflows — pin to commit SHAs (2026-05-06)

- **Category:** infra
- **Symptom:** OpenSSF Scorecard flags floating action major-version refs (e.g. `actions/checkout@v4`) in publishing workflows. A compromised upstream action or malicious tag re-point executes attacker code in a job with `packages: write` on `GITHUB_TOKEN`.
- **Root cause:** `@v4` resolves to whichever commit the upstream `v4` tag points to at run time. Tag re-pointing is possible for any action maintainer and is the primary supply-chain vector.
- **Fix or rule:** Pin `uses:` to a full 40-character commit SHA with a `# vX.Y.Z` comment. Use `git ls-remote https://github.com/<org>/<action>.git 'refs/tags/vX.Y.Z'` to get the tag SHA. Re-pin manually, or automatically if you opt into an updater: `bkit install --dependency=renovate` (the shipped `renovate.json5` runs `github-actions` weekly with `pinDigests: true`) or `bkit install --dependabot`. Both are opt-in (mutually exclusive); bkit does not ship either by default. Apply to ALL jobs with elevated permissions (`packages: write`, `id-token: write`, etc.).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-138, `.github/workflows/release.yml`

## KN-4: Phase 3 runs ONLY in install (not check) — dry-run parity (2026-05-06)

- **Category:** agentic
- **Symptom:** n/a (design rule — not a bug)
- **Root cause:** `bkit check` is read-only by design; Phase 3 post-install re-detection (token surfaces, ci.yml, vale sync, devDeps) shells out to `gh secret list`, `vercel env ls`, and `vale --version` — not read-only semantics, must not run in check mode.
- **Fix or rule:** Phase 3 is skipped when `dryRun=true`. Phase 1 advisories in `ctx.advisories` ARE still rendered in dry-run via `formatChecklist(ctx.advisories)` to preserve parity with the legacy `printSink` dump — only the post-install re-detection layer is suppressed. `bkit check` exits 1 on drift WITHOUT a Phase 3 banner; Phase 1 advisories (e.g. `lint-prose-f9-vulnerable`, `husky-no-markers-precommit`) are visible. `runPostInstallCheck` accepts a `dryRun` parameter (default `false`); pass `true` to suppress Phase 3. Zero-advisory dry-runs print no banner (`formatChecklist([])` returns `""`).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, DE-4, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.ts`

## KN-5: `parseInt("")` returns NaN — guard version file reads (2026-05-06)

- **Category:** backend
- **Symptom:** A zero-byte or whitespace-only `.agents/.bkit-version` causes `detectBkitVersionMajorDowngrade` to emit a misleading advisory containing `"NaN"` in the detect text.
- **Root cause:** `parseInt("", 10) === NaN`; `NaN <= installingMajor` evaluates to `false`, so the `return null` guard is skipped and the advisory is emitted with a `NaN` major.
- **Fix or rule:** After trimming, guard with `if (!onDisk) return null;` before calling `parseInt`. Follow with `Number.isNaN(onDiskMajor)` check for any further NaN-producing inputs. Apply the same defence to any version-parsing that reads arbitrary on-disk files.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, `.agents/scripts/bkit-preflight.ts` (`detectBkitVersionMajorDowngrade`)

## KN-6: Use execFileSync over execSync when the argument comes from a variable (2026-05-06)

- **Category:** security
- **Symptom:** `execSync(\`vercel env ls ${env}\`)` passes type-checked TypeScript, but at runtime nothing prevents shell metacharacters from a future refactor or JS caller from executing unintended commands.
- **Root cause:** `execSync` with a template string passes the full command to the shell; shell metacharacter interpretation applies. Even a TypeScript union type (`"preview" | "production"`) is erased at runtime.
- **Fix or rule:** Use `execFileSync("vercel", ["env", "ls", env])` to bypass shell interpretation entirely. Add a runtime guard (`if (env !== "preview" && env !== "production") return "unknown"`) for defence in depth. Apply to all `execSync` calls that interpolate any variable, even TypeScript-typed ones.
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, `.agents/scripts/bkit-postinstall.ts` (`detectVercelEnv`)

## KN-7: dist/ staleness — `pnpm build` must run before push for `.bkit/src/*.ts` changes (2026-05-06)

- **Category:** infra
- **Symptom:** Local pre-commit/pre-push hooks pass green (`typecheck`, `test`, `format:check`, `lint:slop`, `lint:prose`) but CI's `run-tests` job fails on "Verify dist/ is fresh" with a diff showing `dist/*.js` missing latest source changes.
- **Root cause:** Pre-commit/pre-push hooks invoke `tsc --noEmit` (typecheck only) and `vitest run` (no compile) — do NOT run `pnpm build`. CI runs `pnpm build && git diff --exit-code dist/` to ensure shipped artefacts match source. Source-only commits leave `dist/` stale; CI catches it.
- **Fix or rule:** Any TS edit under `.bkit/src/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit. Hook-level enforcement landed in BAR-131 PR #7 — `.husky/pre-push` now runs `pnpm check:dist` (source-repo only, outside the bkit:start..bkit:end block so `bkit install` doesn't strip it), so a stale dist/ fails the push locally rather than waiting for CI. Fired twice before enforcement: BAR-141 PR #5 (commit `edbd891` broke, `7ab6bff` fixed) and BAR-131/139/142 PR #7 (~2.6k lines of new TS across 13 files with zero dist/ updates; required a separate rebuild commit).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, BAR-131, PR #5, PR #7, commits `edbd891` (broke), `7ab6bff` (fixed), `.husky/pre-push`, `.github/workflows/ci.yml`, `docs/deployments.md` § Pre-push checklist

## KN-8: Tier-2 deep-merge via `__bkit__` envelope is canonical for ownership-mixed JSON (2026-05-07) (superseded by KN-17, BAR-167, 2026-05-11)

- **Category:** agentic
- **Symptom (original):** Consumer-side regression: bkit upgrade silently overwrote `.cursor/hooks.json` and `.claude/settings.json` on `app-gether-life`, destroying the consumer's `Stop` hook block, postflight wiring, `failClosed`, and `loop_limit` fields. Recovered only by `git revert` of the install commit.
- **Root cause:** Both files shipped as Tier-1 (full-overwrite) in `bkit-modules.ts`. Consumers legitimately add their own hook events alongside bkit's `hooks.SessionStart` — full-overwrite silently destroys them on every install.
- **Fix or rule (v0.8.0+):** Any JSON file where the schema permits multiple top-level entries AND consumers commonly add their own keys MUST be Tier-2 JSON deep-merge via `__bkit__` envelope (`writeTier2Json`). Tier-1 is reserved for files bkit fully owns end-to-end (e.g. `vale.ini`, slop-scan config). The `__bkit__` top-level key is the public contract (v0.8.0): bkit's shipped values live there; consumer keys live outside. `writeTier2Json` THROWS when template lacks `__bkit__` (rollback safety). Migration (`migrateTier1JsonToTier2`) auto-lifts pre-v0.8.0 installs; consults `BKIT_TIER1_DEFAULTS_BY_VERSION`. `detectHooksConfigOverwriteRisk` DELETED in v0.8.0 — architecturally redundant once `__bkit__` is canonical SoT. Markers-as-SoT (BAR-138 lesson) applies to text files; `__bkit__` envelope applies to JSON files.
- **Type:** pattern
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-141, BAR-142 §A1, PR #5, `.agents/scripts/bkit-modules.ts` (cursor + claude module functions), `.agents/scripts/bkit-tiers.ts` (`writeTier2Json`, `migrateTier1JsonToTier2`), `.agents/scripts/bkit-tier1-defaults.ts`, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`, DE-7, DE-8, Gether install findings comment on Linear BAR-141

## KN-9: .bkit-version migration reads must use readBkitVersion().pinnedVersion (2026-05-07)

- **Category:** agentic
- **Symptom (historical — `migrateTier1JsonToTier2` deleted in v2.0.0):** `migrateTier1JsonToTier2` received a full JSON string (e.g. `{"pinnedVersion":"0.8.0",...}`) instead of a semver string when `.bkit-version` was in v0.7.x+ JSON format. `semverLte` returned false for the JSON blob, silently skipping the legacy migration.
- **Root cause:** Claude and cursor modules in `bkit-modules.ts` read `.bkit-version` with `fs.readFileSync(...).trim()` before the fix. Works for v0.6.x plain-text but yields full JSON string for v0.7.x+. `migrateTier1JsonToTier2` uses the value in a semver comparison — a JSON blob fails silently.
- **Fix or rule:** Always read `.bkit-version` via `readBkitVersion(path).pinnedVersion` (or `parseBkitVersion(content).pinnedVersion`) — NEVER with raw `readFileSync(...).trim()`. The helper handles all schema versions (v0.6.x plain-text, v0.7.x+ JSON) and returns null for absent/empty files.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-131, build-challenge C1, `.agents/scripts/bkit-modules.ts` (claude + cursor migration paths), `.agents/scripts/bkit-version.ts` (`readBkitVersion`)

## KN-10: bkit install never populated canonicalHashes until after first upgrade (2026-05-07)

- **Category:** agentic
- **Symptom:** After `bkit install`, `.bkit-version` had `canonicalHashes: {}`. On `bkit upgrade`, `isConsumerModified` always returned `false` for all paths (no recorded hashes), so drift detection was ineffective until after the first upgrade pass.
- **Root cause:** `writeBkitVersion` was only called from `bkit-upgrade.ts:updateCanonicalHashesAfterUpgrade`. The `runCoreModule` postDispatch wrote `.bkit-version` via `fs.writeFileSync(versionFile, pkgVersion + "\n")` — plain text, no canonicalHashes. Consumer key survival was preserved by `writeTier2Json` deep-merge regardless, but drift detection via `canonicalHashes` was broken on fresh installs.
- **Fix or rule:** `runCoreModule` postDispatch now uses `writeBkitVersion` (JSON format) and populates `canonicalHashes` from `ws.writes` entries (files written in this run, excluding `.agents/` internal paths). Write is guarded: only when pinnedVersion changed or new canonical entries were recorded (preserves idempotence — 3rd run of install produces zero writes).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-131, build-challenge C3, `.agents/scripts/bkit-modules.ts` (`runCoreModule` postDispatch), `.agents/scripts/bkit-version.ts` (`writeBkitVersion`)

## KN-11: PR `statusCheckRollup` stays empty when `[skip ci]` is HEAD on push (2026-05-08)

- **Category:** agentic
- **Symptom:** PR opens with no Actions runs visible — `gh pr view --json statusCheckRollup` returns empty. Ship Step 2's CI fail-fast gate (`if ANY failures → Failure Path`) admits the PR despite no CI verification. First observed on PR #7 (BAR-131 consumer-friction suite) — CI only triggered after manually pushing an empty commit without `[skip ci]`.
- **Root cause:** GitHub suppresses both `pull_request` and `push` workflow runs when HEAD commit message contains `[skip ci]` (or `[skip actions]`). Build's Step 15 summary push left `summary status [skip build] [skip ci]` as remote HEAD, so when `gh pr create` opened the PR (Step 16), no `pull_request` event fired. Same shape in debug Step 7 summary push, which would overwrite a previously-clean HEAD with `[skip ci]` and silently empty the PR's rollup. Build Step 17 / debug Step 11 close-workflow commits also never reached remote — no explicit `git push` in either step. Recurs intermittently when the clean final commit does not end up as the dispatched HEAD (e.g. EC-2: Failure Path pushes a `[skip ci]` abort commit onto a live PR).
- **Fix or rule:** Final commit before `git push` in build / debug close-workflow renamed to `chore({FID}): close-workflow status trigger CI` (no skip tags). Explicit `git push` added to close-workflow (also fixes the missing-push side bug). Ship Step 5 already used `gh pr merge --body ""` (empty body strips `[skip ci]` from the squash subject). The **CI-Dispatch Gate** (`docs/plans/202606/261-ci-trigger-gate-plan.md`, #261) closes the residual gap: after the final loud push it polls `gh pr view --json statusCheckRollup` for a `bkit-decide` run, self-heals once with a clean `re-trigger` commit if none appears, and terminates with a named verdict (`dispatched`/`self-healed`/`no-ci`/`unresolved`). The outcome-verification gate is now the enforcement mechanism — not just the pre-push string clause. EC-2 abort-guard prevents Failure-Path abort commits from pushing a `[skip ci]` HEAD onto a live PR.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-146, BAR-131 (PR #7 first observation), #261 (CI-Dispatch Gate — outcome-based verification), `.bkit/workflows/bkit-build.md` Step 18 Gate 18, `.bkit/workflows/bkit-debug.md` Step 10 Gate 10, `.bkit/workflows/bkit-ship.md` Step 5 + Gate 5, `.bkit/workflows.md` § CI-Dispatch Gate

## KN-12: Transactional install via staging dir — zero-overwrite mid-failure guarantee (2026-05-07)

- **Category:** agentic
- **Symptom (design goal):** A crash mid-install (after some modules write but before all complete) would leave partial consumer files in place — no way to distinguish "partial bkit write" from "consumer customisation".
- **Root cause:** Pre-v0.9.0, modules wrote directly to consumer destinations. Any error after the first module's writes left a partially-updated consumer repo with no rollback path.
- **Fix or rule:** v0.9.0+ staging contract: (1) Each module writes to `.bkit-staging/<module>/` (not the real destination). (2) After ALL modules complete, `commitStaging` renames staged files to consumer destinations (atomic per file). (3) On any error (throw, crash, SIGTERM), `discardAllStaging` removes `.bkit-staging/` entirely — consumer files untouched. Test this contract: seed consumer files, simulate mid-install failure via `discardAllStaging`, assert consumer files byte-identical to pre-install state (`fs.readFileSync` equality).
- **Type:** pattern
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-142 §A4, DE-9, `.agents/scripts/bkit-install.ts` (`getStagingDir`, `commitStaging`, `discardAllStaging`), `.agents/scripts/bkit-install.integration.test.ts` (Scenario 9)

## KN-13: `canonicalHashes` vs `tier3Hashes` — distinct purposes, shared schema (2026-05-07)

- **Category:** agentic
- **Symptom (design clarification):** Two sha256 hash maps in `.agents/.bkit-version` serve different purposes; conflating them causes logic errors.
- **Root cause / design:** `tier3Hashes` (v0.7.x+): hash of Tier-3 file content AT install time → used by `bkit uninstall` to decide safe-delete (hash match = bkit installed it, no consumer edit → delete; mismatch = consumer edited → preserve). `canonicalHashes` (v0.9.x+): hash of EVERY bkit-managed file content at install time → used by `bkit upgrade` to detect consumer drift (hash mismatch = consumer modified since install → conflict, do not overwrite).
- **Fix or rule:** Do NOT use `tier3Hashes` for upgrade drift detection (covers Tier-3 only; Tier-1/Tier-2 also need drift detection). Do NOT use `canonicalHashes` for uninstall safe-delete (covers all files; safe-delete semantics are Tier-3-only). Keep them separate.
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-142 §A5, DE-10, `.agents/scripts/bkit-version.ts` (`BkitVersion` interface), `.agents/scripts/bkit-upgrade.ts`

## KN-14: Helper-action additions to seeded templates are additive, not replacement (2026-05-07)

- **Category:** agentic
- **Symptom:** Four assertions in `templates.test.ts` and `bkit-install.test.ts` fail — substring `GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` not found in seeded `ci.yml` template.
- **Root cause:** Sub-plan P4.T8 added `cbartens/bkit/.github/actions/setup-auth@v1` to `.agents/templates/.github/workflows/ci.yml` but simultaneously deleted the inline `env: GH_BKIT_TOKEN` block under `Install Dependencies`. The plan marked that block RETAIN-WITH-REASON (kill-date v1.1.0). The implementer treated the composite action as a replacement, not an addition.
- **Fix or rule:** When a sub-plan adds a composite GitHub Action alongside an existing inline auth pattern marked RETAIN-WITH-REASON in the Supersession Inventory, the inline pattern MUST be preserved verbatim until its declared kill-date. The addition is strictly additive. After editing any seeded `.bkit/templates/.github/workflows/*.yml` file, re-run `pnpm vitest run .bkit/src/bkit-templates.content.test.ts .bkit/src/bkit-install.test.ts` and regenerate the snapshot with `-u`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-131, BAR-138, `.agents/templates/.github/workflows/ci.yml`, `bar-131-related-bars-suite-plan-4.md` §P4.T8, `build-failure-diagnose-1.md`

## KN-15: Sentinel-file cleanup must bracket the write — stale sentinels cause false Failure Path (2026-05-09)

- **Category:** agentic
- **Symptom:** After manually resolving a `git rebase` conflict outside the workflow, re-invoking `/bkit-ship` immediately routes to the Failure Path even though the rebase is complete.
- **Root cause:** `bkit-ship.md` Step 2 `touch .rebase-failed` sentinel is never removed on success or retry. The sub-step 3a existence check fires on the stale file from the prior failed run.
- **Fix or rule:** Bracket every sentinel with explicit cleanup: (1) `rm -f` at the START of the bash block that writes the sentinel (clears stale-from-prior-run before any new attempt), and (2) `rm -f` in the Failure Path step after the sentinel is no longer needed. Pattern: create-write only inside the failure branch; delete-unconditionally at start of each attempt and at Failure Path exit. See `bkit-ship.md` Step 2 revised bash block.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** build-challenge
- **Related:** BAR-155, `.bkit/workflows/bkit-ship.md`

## KN-16: Multi-section output format — EOF-append landing section must be last (2026-05-09)

- **Category:** agentic
- **Symptom:** Agent appends gap findings at EOF of output file; entries land inside `## Notes` instead of `## Gaps Identified`, breaking downstream consumer parsing.
- **Root cause:** `bkit-build-plan-verify.md` Output format had `## Gaps Identified` in the middle of a six-section skeleton. The Fix 1b `echo {finding} >> {output}` directive appends at EOF, which is after `## Notes` (the last section). Downstream gap-remediate consumers grep for `## Gaps Identified` and find gaps mixed into Notes.
- **Fix or rule:** When an agent uses flat-append-at-EOF for a specific section, that section MUST be last in the Output format skeleton. Reorder so the append-target section is last. Same reason `bkit-build-challenge-tests.md`'s `## Bugs Discovered` must come after `## Blockers`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** build-challenge
- **Related:** BAR-155, `.bkit/prompts/bkit-build-plan-verify.md`, `.bkit/prompts/bkit-build-challenge-tests.md`

## KN-17: Deep-containment is canonical for ownership-mixed JSON — `__bkit__` envelope removed (2026-05-11)

- **Category:** agentic
- **Symptom (original):** Consumer-side audit (2026-05-09) on `app-gether-life` found two failure modes with the v0.8.0 `__bkit__` envelope model: (1) duplicate content — every bkit-owned key appeared twice (inside `__bkit__` AND at the top level), bloating the consumer file; (2) silent drift — `.github/workflows/ci.yml` lost its `pnpm bkit check` step with no detection because the envelope check only walked `__bkit__`, not the full file.
- **Root cause:** The `__bkit__` envelope model required both the template AND the consumer to maintain two copies of every bkit-owned value. `writeTier2Json` wrote `{ ...consumer, __bkit__: template.__bkit__ }` but did not enforce top-level key presence — the consumer could hold a stale top-level copy alongside a fresh `__bkit__` copy indefinitely. Drift detection only checked `canonicalHashes` (SHA-based), not semantic key presence.
- **Fix or rule (v2.0.0+):** Deep-containment model: the template JSON tree IS the bkit-declared scope. `deepContains(template, consumer)` checks that every leaf path in the template is present and equal in the consumer. Consumer keys outside the template tree are never touched. `writeTier2JsonContained` replaces `writeTier2Json`: dest absent → write template as-is; present → `deepContains` → ok no-op; fail → `deepMergeJson(existing, template)` (template-wins on conflict). `migrateLegacyBkitEnvelope` runs once on upgrade: strips `__bkit__`, runs `deepContains`, deep-merges if containment fails. Idempotent. Logs per `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. `detectLegacyBkitEnvelope` advisory surfaces if `__bkit__` still present. `detectTier2JsonDrift` advisory surfaces if `deepContains` fails.
- **Collision risk:** A consumer that added their own top-level `__bkit__` key for an unrelated purpose will see it stripped by `migrateLegacyBkitEnvelope` on first `bkit upgrade` to v2.0.0. Document as a known collision; consumers must rename their key before upgrading.
- **Type:** pattern
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-167, KN-8 (superseded), DE-18, `.agents/scripts/bkit-tiers.ts` (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`), `.agents/scripts/bkit-preflight.ts` (`detectLegacyBkitEnvelope`, `detectTier2JsonDrift`), `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`

## KN-16b: bkit-modules.ts format dispatch alignment — writeTier2 for markered-text, not writeTier1 (BAR-167 Phase 2) (2026-05-11)

- **Pattern:** Files classified as `format: "markered-text"` in `bkit-manifest.ts` MUST use `writeTier2` (marker-block update semantics) in `bkit-modules.ts`, NOT `writeTier1` (full-overwrite semantics). Using `writeTier1` on a markered-text file silently overwrites consumer content outside the markers on every `bkit upgrade`. `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, and `.cursor/rules/00-shared-rules.mdc` were incorrectly using `writeTier1` via `tier1Files` arrays prior to Phase 2 remediation.
- **Resolution:** Remove `tier1Files` local arrays; replace with direct `writeTier2(src, dst, tokens, "html-comment", dryRun, ws)` calls. Files with `# <!-- bkit:start -->` markers (hash-comment wrapper around html-comment marker) are detected by `extractManagedBlock` with `"html-comment"` style via the `ALLOWED_PREFIXES` `"# "` logic.
- **Corollary:** Files classified as `format: "byte-equal-text"` (e.g. `.cursor/settings.json`, `.cursor/Dockerfile`) should intentionally use `writeTier3` (seed-or-print) for install semantics — not `writeTier1` (force-overwrite). The manifest classification is for check/uninstall dispatch; install uses seed-or-print to preserve consumer modifications on upgrade. Document this explicitly in the module function.
- **Type:** incident
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-167, KN-15, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-tiers.ts` (`writeTier2`, `writeTier1`)

## KN-18: manifest format must match install dispatch (not intent) (2026-05-11)

- **Symptom:** `bkit check` / `bkit uninstall` apply wrong strip/delete strategy for ci.yml, .vale.ini, slop-scan.config.json — all three call `writeTier3` (seed-or-print) but were classified `markered-text` or `json` in bkit-manifest.ts.
- **Root cause:** Manifest format was set to reflect the intended future format (markered-text ownership) rather than the actual installed format (byte-equal-text / seed-or-print). Downstream dispatch in uninstall/check used manifest format, so it tried to strip a managed block that never existed.
- **Fix:** Always set manifest `format` to match the _actual install function called_: `writeTier3` → `byte-equal-text`; `writeTier2`/`writeTier2JsonContained` → `markered-text`/`json`. When install strategy changes, update both the module code and the manifest entry atomically.
- **Type:** incident
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-167, `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-modules.ts`

## KN-19: malformed-JSON destination must throw, not silently overwrite (2026-05-11)

- **Symptom:** `writeTier2JsonContained` silently overwrote a malformed-JSON destination file with the template, destroying any consumer content that was unrecoverable as JSON.
- **Root cause:** Catch branch treated parse failure as "absent" and wrote the template wholesale — same as a fresh install. A corruption or partial write leaving invalid JSON would be permanently lost without warning.
- **Fix:** Throw `[bkit] <path> is malformed JSON — fix manually before running bkit install` when destination exists but fails JSON.parse. Matches the `malformed-package-json` blocker discipline. Fresh install (file absent) path is unchanged.
- **Type:** incident
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-167, KN-8, `.agents/scripts/bkit-tiers.ts` (`writeTier2JsonContained`)

## KN-20: Release workflow silently skipped after `chore(release)` tag push — re-tag at same SHA does NOT re-fire (2026-05-11)

- **Category:** infra
- **Symptom:** Pushing `v2.0.2` tag after merging `chore(release): 2.0.2 (#26)` into `main` produced zero workflow runs. CI on the `main` push event also did not fire. Deleting the tag and re-pushing at the same SHA produced no run either. Previous releases (v2.0.0, v2.0.1) had succeeded via the same flow.
- **Root cause:** Two stacked issues. (1) The squash commit body inherited `[skip ci]` / `[skip build]` tokens from historical dev commits (e.g. `chore(bar-167-...): close-workflow status [skip build] [skip ci]`). GitHub Actions parses ANY commit message in a push and skips workflow dispatch on `[skip ci]`. (2) For tag-push events, deleting and re-creating a tag at the SAME target commit does NOT generate a new push event — GitHub deduplicates. v2.0.0 succeeded with the same skip-ci tokens because a NEW tag commit was created — different SHA → new push event.
- **Fix or rule:** Two complementary defences:
  1. **Strip `[skip ci]` / `[skip build]` tokens from squash-commit bodies before merging** into `main`. `gh pr merge --squash` lets you edit the commit message inline; remove any historical skip markers. Reviewer rule: "if the PR squashes dev-history commits with skip-ci, scrub the body before clicking merge."
  2. **To re-fire a tag push, move the tag to a NEW commit** (cherry-pick or empty commit), then `git tag -f` + `git push --force origin v{N}`. Deleting and recreating at the same SHA is a no-op for the push trigger.
- **Type:** post-mortem
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-186, feedback memory `skip-ci commits must not be HEAD when PR is created`, `.github/workflows/release.yml`, commit `05a3e6b chore(release): 2.0.2 (#26)`

## KN-22: pnpm 10 narrows manifest range on `pnpm update @cbartens/bkit` (2026-05-12)

- **Category:** install / consumer-upgrade
- **Symptom:** Consumer running `pnpm update @cbartens/bkit` (pnpm 10.33.0) to bump 2.0.3 → 2.0.5 sees `package.json` rewritten from `"@cbartens/bkit": "^2"` to `"^2.0.5"`. `pnpm-lock.yaml` also records `specifier: ^2.0.5` instead of `^2`. Future minor/patch bumps no longer satisfied by the manifest range — consumer is silently pinned to an exact minor.
- **Root cause:** pnpm 10 changed the default `pnpm update <pkg>` behaviour from "lockfile-only re-resolve" to "rewrite manifest specifier to the resolved minor". Observed on `app-gether-life` during 2.0.3 → 2.0.5 upgrade (commit `2e8af1a1`).
- **Fix or rule:** After `pnpm update @cbartens/bkit`, verify the manifest range is still `"^2"`. If pnpm narrowed it, restore the manifest by hand and re-resolve the lockfile with `pnpm install --frozen-lockfile=false`. Verify with `grep -A2 "'@cbartens/bkit'" pnpm-lock.yaml` → `specifier: ^2`. README upgrade callout documents the check-and-restore sequence.
- **Type:** rule
- **Confidence:** high
- **Severity:** normal
- **Source:** consumer-friction
- **Related:** BAR-155 comment 2026-05-12, README upgrade callout, BAR-189

## KN-21: Workflow status.json on dev for all five workflows; single termination commit + push (2026-05-12)

- **Category:** workflow
- **Rule:** All bkit workflows (`plan`, `design`, `build`, `debug`, `ship`) write `status.json` to `$REPO_ROOT/docs/plans/logs/{FID}/status.json` (dev working copy). Per-step writes are file-only (uncommitted between steps). Per-step commits on `feat/{FID}` capture artifacts only — message `chore({FID}): {step}`, no `work` / `status` suffix, no `[skip ci]` flag. `dev` is committed and pushed exactly ONCE per workflow run at Close Workflow (success) OR Failure Path (failure), with `[skip ci]` on status-only termination commits. Plan/design close is a `git merge --squash feat/{FID}` + status.json → `docs({FID}): {plan|design} DONE` (no `[skip ci]` — substantive content); build/debug close is status-only `chore({FID}): {build|debug} DONE [skip ci]`; ship close is `docs({FID}): ship DONE [skip ci]` batching steps 7-10 dev work.
- **Why:** Eliminates ~50 commits and ~10 dev pushes per typical workflow run. `cat $REPO_ROOT/docs/plans/logs/{FID}/status.json` works from anywhere on the machine without entering the worktree or knowing git. PR diffs for build/debug/ship contain only substantive feature work — no `status.json` churn.
- **Mechanism:** `Step.commitSha` replaced by `Step.parentSha` (captured at step START via `git rev-parse HEAD`, BEFORE the step's commit) — eliminates the chicken-and-egg that drove the prior double-commit pattern.
- **Scope:** BAR-187 extended BAR-183 (status.json on dev for plan/design only) to all five workflows. BAR-184 (no commits on `dev` between worktree creation and close-workflow) preserved.
- **Type:** rule
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-187, BAR-183, BAR-184, `.bkit/docs/workflows.md` §status.json, `.agents/scripts/bkit-status.ts`

## KN-23: Server-side CI is the only quality gate; agent self-verification is informational, not authoritative (2026-05-14)

- **Category:** agentic
- **Symptom:** Debug-loop subagent declares `Verdict: PASS` after `pnpm turbo lint typecheck test --filter='...[origin/dev]'`, then CI fails on `test:integration` / `test:e2e` against the same SHA. Loop closes "successfully" but the underlying failure persists; multiple iterations push status JSON without ever fixing anything.
- **Root cause:** Agent-local verify can only run what's runnable in the agent context. Integration tests need real Supabase + env vars; E2E needs a deployed Vercel preview — neither is available locally. Subagent PASS verdict is structurally narrower than CI PASS. Treating subagent verdict as a gate creates a false-confidence loop.
- **Fix or rule:** Single source of truth for "merge-ready" is the consumer's CI run. Agent-local verify exists to catch trivially broken code before push (typecheck, unit). Subagent PASS means "didn't make it worse on the things I can see locally" — never "ready to merge." When designing CI gates, prefer server-side enforcement (e.g., adding `test:integration` to partial CI on push to dev) over expanding agent verify suites. Bkit ci.yml template ships the structural gate; agent prompts run the narrower verify with `--continue` to surface multiple failures per run.
- **Type:** pattern
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-192, BAR-195, `.bkit/workflows/bkit-debug.md` Step 6, `.bkit/prompts/bkit-debug-failure-remediate.md`, `.bkit/prompts/bkit-debug-failure-diagnose.md`, `.agents/templates/.github/workflows/ci.yml`

## KN-24: Turbo content-keyed cache replays across SHAs — declare external-state proxies in `inputs` to avoid ghost-greens (2026-05-14)

- **Category:** testing
- **Symptom:** CI reports `test:integration` green on a dev push, but the same test would fail when actually executed because external state (DB migration, RLS policy, fixture data) changed since the cache was warmed. Turbo replays a stale-but-input-hash-matching result.
- **Root cause:** Turbo's remote cache key is content-keyed on declared `inputs`. Default `inputs` for a task covers source files in the package only. External dependencies — Supabase migration files, seed/fixture data, env templates — are invisible to the hash, so a change there does NOT bust the cache. PR-merge-to-dev typically replays the PR's cached green correctly; concurrent migrations from another PR landing on dev between PR-CI and merge-CI are the failure mode.
- **Fix or rule:** For tasks that touch external state (`test:integration`, `test:e2e`), declare external-state proxies in the consumer's `turbo.json` task `inputs` — `supabase/migrations/**`, fixture files, env templates. Cache replay then only fires when inputs that affect the test outcome are truly unchanged. Defence in depth: bkit ci.yml template ships direct-push-to-dev detection that sets `TURBO_FORCE=1` (no PR ancestry → cache always busted). Manual escape hatch: `[force cache]` tag in commit message / PR title. The one residual ghost-green that no automation catches: direct edits to the dev DB without a migration file (out-of-band schema drift).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-192, BAR-195, `.agents/templates/.github/workflows/ci.yml` (Detect Tags and Direct Push step), consumer `turbo.json` `inputs` declaration

## KN-25: DB schema state persists across code rollback — reset required for schema-aware tests (2026-05-14)

- **Category:** testing
- **Symptom:** Rolling code back to a known-good SHA leaves the linked Supabase project carrying migrations from the rolled-out range. Schema-aware tests (e.g. `cdc-schema-assurance`) compare live DB structure against code expectations and fail on the "clean" rolled-back tree because the DB is ahead of the code.
- **Root cause:** `git revert` / `git reset` rewinds the source tree only. Supabase migrations applied during the rolled-out range remain materialised in the linked dev project — Supabase has no "unapply" semantics for code-driven migrations. Any test that introspects the live schema sees columns / tables / RLS the code no longer declares, and flags the drift as a failure.
- **Fix or rule:** When rolling back code that contained applied migrations, reset the linked dev DB before treating the rolled-back tree as the new baseline. One-liner reset against the Supabase service-role connection: drop the `public` and `stripe` (or other consumer-managed) schemas with `CASCADE`, truncate `supabase_migrations.schema_migrations`, then `supabase db push --linked --include-all` to replay the surviving migration files. Same procedure applies whether the rollback was production-side (cherry-pick revert) or dev-side (`git reset --hard <green-sha>`). Documented as a sibling runbook to the production-rollback playbook in the consumer's `deployments.md` (bkit-marker section).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-192, BAR-195, `.agents/templates/docs/deployments.md` (Dev rollback runbook), Supabase CLI `db push --linked --include-all`

## KN-26: `^chore:`-prefixed PR HEAD silently skips Vercel preview + demotes CI to partial — regression gate never fires (2026-05-16)

- **Category:** agentic
- **Symptom:** Debug loop closes "successfully" with all status JSON checks PASS; router dispatches `/bkit-ship`; squash-merge lands; subsequent prod / next-PR-CI surfaces the regression that `/bkit-debug` claimed to fix. Investigation shows the Vercel preview for the PR HEAD was cancelled with `Ignored Build Step` and `decide` step demoted CI from `full` to `partial` tier — Playwright/e2e were skipped entirely. CI conclusion still reported `success` because skipped tier-cap suites are not failures. Ship Step 2's existing fail-fast gate (`if ANY failures → Failure Path`) admits the PR because there are no failed steps, only skipped ones.
- **Root cause:** Two reinforcing mechanisms. (1) Debug Step 5 previously committed remediation as `chore({FID}): failure-remediate attempt N`. Debug Step 7 then added an `--allow-empty` `chore({FID}): run-tests attempt N` followed by `chore({FID}): push-remediation attempt N/MAX` — three `chore(...)` commits stacked, last one pushed as HEAD. Consumer Vercel projects commonly ship `Ignored Build Step` regex `^chore:` (default for housekeeping). Vercel sees `chore(...)` subject → cancels the preview → CI's `decide` step downgrades to `partial` tier → Playwright/integration suites skipped. (2) Skipped-step semantics: GitHub Actions reports the CI run `conclusion=success` even when half the steps were tier-capped out. Existing fail-fast gate keyed on `state=FAILURE` (any failed step) cannot distinguish "no test ran" from "all tests passed".
- **Fix or rule:** Two complementary defences land together (cannot be split — defence (b) without (a) blocks every legitimate ship; (a) without (b) leaves no safety net if a future Vercel rule expands beyond `^chore:`):
  1. **Debug Step 5 commits as `fix({FID}): {description}`.** `{description}` is parsed from the first `DONE — Step` line of `debug-failure-remediate-${TEST_ATTEMPT}-log.md` (strips `\r\n\`"\\`, truncates to 72 chars; fallback `failure-remediate attempt ${TEST_ATTEMPT}`). Step 7 removes its prior intermediate `chore(...)`commits — status.json updates are file-only between Steps 5 and 7; the push leaves`fix(...)`as branch HEAD. Vercel-ignore regex`^chore:` no longer matches.
  2. **Ship Step 3 — Regression Guard.** Dedicated step (extracted from former Step 2 sub-step 7) sitting between Worktree Setup and Conflict Resolve. Resolve PR HEAD SHA via `gh pr view --json headRefOid`. No CI run found for HEAD → `REGRESSION_VERDICT=FAIL` immediately. Otherwise find the most recent prior failed CI run on the branch; for each step that failed in that prior run, assert the same-named step in the current run on PR HEAD has `conclusion=success` (NOT `skipped` / `cancelled` / missing). Mismatch or missing run → Failure Path. Universal — applies to both router-dispatched and manual `/bkit-ship` invocations.
- **Type:** post-mortem
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-200, KN-11 (`[skip ci]` HEAD gap — same shape, different mechanism), `.bkit/workflows/bkit-debug.md` Steps 5–7 + Gate 7, `.bkit/workflows/bkit-ship.md` Step 3 + Gate 3, `.bkit/docs/workflows.md` §CI / Vercel commit tags (`fix({FID}): {description}` row)

## KN-27: Playwright artifacts via `actions/upload-artifact` are invisible to `gh run view --log-failed` — fetch separately (2026-05-16)

- **Category:** agentic
- **Symptom:** `@bkit-debug-failure-diagnose` on an e2e failure reads `debug-logs-ci-{DEBUG_ATTEMPT}.md` and sees only the bare `pnpm test:e2e` exit code + final summary line ("3 failed"). Per-test stack traces, expected/received diffs, console-capture, screenshots, video, and `trace.zip` are all missing. Diagnose attempts cycle on the same hypothesis (test runner config / Playwright version) because the actual failure context never reaches the agent.
- **Root cause:** `gh run view --log-failed` returns the stdout/stderr of the failing GHA step only. Playwright's rich failure artifacts (per-test output under `test-results/`, the HTML viewer under `playwright-report/`, embedded traces / screenshots / videos) are uploaded via `actions/upload-artifact@v4` in a _separate_ GHA step that runs `if: failure() && steps.e2e.conclusion == 'failure'`. Artifacts live behind the `gh run download -n <name>` API and never appear in `--log-failed` output.
- **Fix or rule:** Three coupled pieces:
  1. **Consumer-side template** — `.bkit/templates/.github/workflows/ci.yml` ships `bkit-stub:e2e-artifacts` immediately after `bkit-stub:e2e`. Stub body uploads `playwright-report/` + `test-results/` to artifact named `playwright-report`, 14-day retention, `if-no-files-found: ignore`. Both stubs must be uncommented together — `bkit-stub:e2e` without `bkit-stub:e2e-artifacts` produces no fetchable artifact; `bkit-stub:e2e-artifacts` without `bkit-stub:e2e` produces nothing to upload.
  2. **Debug Step 3 fetch path** — between CI sub-fetch and runtime sub-fetch, detect e2e failure via `gh run view --json jobs --jq '[.jobs[] | select((.name | test("e2e"; "i")) or (.steps // [] | any(.name | test("e2e|playwright"; "i")))) | select(.conclusion=="failure")] | length'` > 0. Download into `docs/plans/logs/{FID}/debug-e2e-{DEBUG_ATTEMPT}/`. Write `debug-logs-e2e-{DEBUG_ATTEMPT}.md` as a verbatim dump of every text file under `test-results/` with `===== file: <relpath> =====` separators (matches `test-results/` for multi-test runs, falls back to download root for flat layouts). Binary artifacts (`*.html`, `*.png`, `*.jpg`, `*.jpeg`, `*.webm`, `*.zip`) listed by relpath in a trailing block; NOT inlined (would explode log size with no diagnostic value to a text-only LLM).
  3. **Artifact name is a tight contract** — debug fetcher hardcodes `playwright-report` as the artifact name; consumer rename = silent empty fetch = empty log file (then `rm -f` because `[ -s "$E2E_LOG" ]` fails). `actions/upload-artifact`'s `if-no-files-found: ignore` means CI doesn't complain either. Document the name explicitly in any future Playwright stub variant.
- **Conditional gating chain:** e2e step gates on `should_run_e2e || needs_e2e`. If neither fires (e.g. KN-26 scenario — `decide` demoted to `partial`), e2e step is `skipped`, `steps.e2e.conclusion != 'failure'`, upload step also skipped, no artifact. Symmetric with the BAR-200 ship-side regression gate that catches the upstream cause (skipped previously-failing step).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-201, KN-26 (sibling — same milestone, closes both ends of the e2e-debug loop), `.bkit/workflows/bkit-debug.md` Step 3 sub-step 3 + Gate 3, `.agents/templates/.github/workflows/ci.yml` (`bkit-stub:e2e` + `bkit-stub:e2e-artifacts`), `.bkit/docs/workflows.md` §`/bkit-debug` Step 3

## KN-28: `turbo query affected --exit-code` returns 0 in every path — affected-gates with `workflow_dispatch` "fall back to safe" comments don't actually fall back (2026-05-23)

- **Category:** infra
- **Symptom:** Consumer's `ci.yml` `Detect Web Affected` step ships with a comment promising `workflow_dispatch` will "fall back to running everything to be safe", but manual `gh workflow run ci.yml --ref main` invocations leave `WEB_AFFECTED=false`. Every downstream step gated on `env.WEB_AFFECTED == 'true'` (E2E, integration, Vercel-await, preview-URL validation) is skipped. CI conclusion is `success` because skipped is not failure (same shape as KN-26). Operator believes they ran full CI against `main`; they actually ran lint-only.
- **Root cause:** `turbo query affected --packages <pkg> --exit-code` exits 0 in all observed paths — verified locally across (a) no `--base` flag → `GitRefNotFound` error, exit 0; (b) `--base=origin/main` with no affected packages → length 0, exit 0; (c) `--base=HEAD~10` with `DefaultGlobalFileChanged` → length >= 1, exit 0. The `--exit-code` flag's documented contract (exit 2 on error / fallback) does NOT apply to the `query affected` sub-command. The `case` statement in `Detect Web Affected` (`case "$EC" in 0) ... 2) WEB_AFFECTED=true ;; esac`) therefore ALWAYS hits the EC=0 branch, regardless of whether turbo could resolve a base ref. The "run to be safe" fallback never fires. `workflow_dispatch` is the only event without a usable git base ref (no `github.event.before`, no `pull_request.base.ref`), so it's the only event where the bug is observable — `pull_request` and `push` continue to work correctly because their `--base` resolves and the affected-graph query is meaningful.
- **Fix or rule:** When a consumer `ci.yml` gates downstream steps on a turbo-affected env var, short-circuit `workflow_dispatch` BEFORE the turbo query:

  ```yaml
  - name: Detect Web Affected
    run: |
      if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
        echo "WEB_AFFECTED=true" >> "$GITHUB_ENV"
        exit 0
      fi
      # ... existing turbo affected logic ...
  ```

  Trade-off: `workflow_dispatch` runs become slow (~3 min lint-only -> ~15 min full suite). Acceptable because manual dispatch is deliberate and infrequent, and reaches for "validate this ref end-to-end" — exactly the contract the short-circuit enforces. Do NOT rely on `--exit-code` semantics for any `turbo query` sub-command. Bug is consumer-shaped (specific to monorepos with turbo-affected gating + Vercel-preview-dependent steps); NOT generalised into the bkit `ci.yml` template because different consumers have different affected-detection schemes.

- **Type:** gotcha
- **Confidence:** high (turbo behaviour reproduced locally across three `--base` permutations on 2026-05-23)
- **Severity:** normal
- **Source:** consumer-friction
- **Related:** KN-23 (server-side CI is the only quality gate — when manual dispatch silently demotes to lint-only, the gate is gone), KN-26 (skipped-step semantics — `success` despite empty E2E coverage; same false-confidence shape, different mechanism), turbo `query affected` sub-command

## KN-29: bkit lints itself with a narrower `lint:prose` than it ships — canonical doc prose escaped every gate and shipped in 2.8.0 (2026-05-26)

- **Category:** tooling
- **Symptom:** A sentence-initial "So" in `docs/deployments.md` (added by the #179 Renovate-docs relocation) shipped in 2.8.0 and blocked **consumers** at `pnpm lint:prose`: the bkit-shipped Vale `write-good.So` rule flags it as an `error` in pre-commit, pre-push, and CI. Because the text lives in a managed `<!-- bkit:start -->` block, the only consumer workarounds were rewording (drifts a canonical file) or `--no-verify` (skips the gate) — both defeat the design. bkit's own pre-commit/pre-push/CI were all green.
- **Root cause:** bkit lints itself with a **different, narrower** `lint:prose` than the one it ships. bkit's repo script fed only `.agents/{,workflows,prompts}/*.md` + root `*.md` to vale — it never linted `docs/**` or `.agents/templates/**`. The shipped consumer script (`bkit-modules.ts`) is `vale $(find . -name "*.md" ...)` — lints everything, so the same bytes hit `write-good` once they land in a consumer's `docs/deployments.md` (matched by `.vale.ini` `[*.md] = write-good, House`). All three "gates" (commit/push/CI) were the **same** `pnpm lint:prose` wearing three hats, so they shared one blind spot — not independent defenses. NOTE: the Vale config was never the blocker — `write-good` already applies to `.agents/templates/docs/**` via `[*.md]` (Vale **merges** `BasedOnStyles` across matching scopes; a more-specific `[.agents/**] = House` does NOT replace it). The only gap was the file list.
- **Fix or rule:** Lint the artifacts you ship with the config you ship. bkit's `lint:prose` now also feeds `docs/*.md` **and** the shipped source `.bkit/templates/docs/**/*.md` to vale (commit `ade8cd1` + follow-up). Released as 2.8.1; consumers re-run `pnpm bkit upgrade` to reconverge the managed block with zero drift (verified live: install + upgrade on a packed tarball in a clean dir, consumer `lint:prose` → 0 errors both paths). Decision: keep `write-good.So` at `error` — fix the canonical prose, don't loosen the rule.
- **Config learnings (from gether, the consumer that caught it):** (a) gether's `lint:prose` is `vale --minAlertLevel=error docs/*.md .agents/*.md *.md` — it lints `docs/` where bkit's didn't; that single difference is why gether caught it and bkit didn't. (b) gether scopes `[docs/**]` (not `[*.md]`) for write-good and adds `write-good.So = NO` + LLMSlop/Hedging exemptions for `[**/docs/plans/**/*.md]` and `[**/docs/notes.md]` — plan/working artifacts quote slop tokens as documentation. bkit's shipped `.vale.ini` previously lacked these, so consumers whose bkit workflows generate `docs/plans/YYYYMM/**` hit write-good false positives — **now fixed in 2.8.1**: the template `.vale.ini` ships `[**/docs/plans/**/*.md]` + `[**/docs/notes.md]` exemptions (note: `.vale.ini` is `seedOrPrint`, so only NEW installs seed them; existing consumers merge manually). (c) Vale gotcha gether documented: an empty `BasedOnStyles =` _inherits_ from less-specific scopes rather than disabling rules — disable each rule explicitly via `<Style>.<Rule> = NO`; and use a leading `**/` in scope globs so lint-staged's absolute paths still match.
- **Type:** gotcha
- **Confidence:** high (root cause confirmed in code on both sides; fix verified live via tarball install + upgrade)
- **Severity:** normal
- **Source:** consumer-friction
- **Related:** #195, #179 (introduced the prose), KN-23 (CI is the only authoritative gate — but only over the files it actually lints), `.agents/scripts/bkit-modules.ts` (shipped `lint:prose`), `.agents/templates/.vale.ini`

## KN-30: bkit-cloud CI path never ran end-to-end: D1 OIDC boot failure, D2 mid-build router fire, D3 concurrency race (2026-05-27)

- **Category:** tooling
- **Symptom:** (D1) A live dispatch of `bkit-cloud.yml` failed ~26s in with "Could not fetch an OIDC token … add `id-token: write`". `claude-code-action@v1` in `mode: agent` calls `getOidcToken` at boot — `github.token` passed only as `env: GH_TOKEN` is NOT consumed for the action's own auth. The CI cloud path had never completed. (D2) On a re-build with an open PR, the `worktree-setup` and `create-pr` commits (neither carried `[skip ci]`) triggered a `pull_request: synchronize` CI event → the cloud auto-router fired mid-build. (D3) Dispatched build `bkit-cloud.yml` runs (issue `inputs.issue=50` → group `bkit-cloud-50`) and CI-completion runs (branch `head_branch=feat/50-slug` → group `bkit-cloud-feat/50-slug`) resolved to different concurrency groups → `cancel-in-progress` could not serialize a dispatched build against the ship it triggered.
- **Root cause:** (D1) `bkit-cloud.yml` was designed on the assumption that `github.token` handles all repo git/gh access — the App's OIDC requirement was not surfaced until a live dispatch. (D2) The `worktree-setup` and `create-pr` commits lacked `[skip ci]` tags (documented in `deployments.md` for `create-pr` but not implemented; `worktree-setup` was a genuinely NEW contract entry). (D3) The concurrency key mixed `inputs.issue` (numeric FID) with `head_branch` (`feat/50-slug`) across the two trigger paths — different strings, no cancel.
- **Fix or rule:** (D1) Add `id-token: write` to `bkit-cloud.yml` permissions; require the Claude GitHub App via `/install-github-app`. (D2) Add `bkit [skip ci]` to `worktree-setup` and `create-pr` commit messages; add `bkit [auto route]` to the close-workflow commit (and debug re-trigger commit) only when the issue carries `bkit:auto` at close time. (D3 — revised after structural analysis): Full cross-surface token equality in the `concurrency.group` expression is NOT achievable via GHA expression functions. GitHub evaluates `concurrency.group` from trigger-payload context only, before any step runs. The dispatch payload exposes only the bare issue number (`inputs.issue`, e.g. `141`); the `workflow_run` payload exposes only `head_branch` (= `feat/{FID-with-slug}`, e.g. `feat/141-cloud-app`). GHA expression functions have no regex, no split, and no `replace()` that can reduce a slugged FID to the bare issue number — `replace('feat/141-cloud-app','feat/','')` = `141-cloud-app`, not `141`. The shipped approach (`replace()` to strip `feat/`) was invalid for the actual bkit branch convention (`bkit-build.md:146` defines FID with a slug). Corrected design: serialise WITHIN each surface separately — dispatch keys on `inputs.issue`; CI-completion keys on `head_branch`. Cross-boundary races between a dispatched build and the auto-ship it triggers are handled by the orchestrator stale-run guard + `status.json` lock. See also: DE-21 (full architectural decision), `docs/deployments.md` § "CI trigger on final workflow push", `.bkit/docs/workflows.md` § "HEAD-Subject Assertion".
- **Type:** gotcha
- **Confidence:** high (D1 confirmed live; D2/D3 confirmed by code analysis)
- **Severity:** high (D1 blocked all cloud CI usage; D2 mid-build fires caused confirmed CI run #202/PR #102 phantom; D3 latent race)
- **Source:** live-dispatch
- **Related:** #141, #184, DE-21, KN-11 (`[skip ci]` HEAD → empty rollup)

## KN-31: `grep -oP` PCRE lookbehind fails under `set -euo pipefail` on non-GNU environments (2026-05-27)

- **Category:** infra
- **Symptom:** A `bkit-cloud.yml` step using `grep -oP '(?<=bkit:issue=#)\d+'` under `set -euo pipefail` exits with code 1 on a PR body that lacks the marker pattern. The whole step is aborted; the documented fallback (`feat/{FID}` branch extraction) and fail-safe `skip=true` path become dead code. The job shows RED instead of a clean no-op skip.
- **Root cause:** (1) `grep` exits 1 when the pattern has no match; `pipefail` propagates that exit code through the pipe; `set -e` aborts the script at the assignment line. (2) `grep -oP` relies on PCRE (`-P`), unavailable on BSD/macOS grep and some minimal CI runner images. On `ubuntu-latest` GNU grep has `-P` so it works today, but any runner-image change silently falls through to the branch fallback, which may resolve the wrong issue number if the branch slug and issue number diverge.
- **Fix or rule:** Two independent fixes applied together: (a) append `|| true` to each assignment so a no-match exit code does not abort the step — `ISSUE=$(... || true)`; (b) replace PCRE lookbehind with portable POSIX ERE: `grep -oE 'bkit:issue=#[0-9]+'  | sed 's/bkit:issue=#//'` (match the whole token, then strip the prefix with sed). This is robust across GNU grep, BSD grep, and minimal images. Applied to both `.github/workflows/bkit-cloud.yml` and `.bkit/templates/.github/workflows/bkit-cloud.yml` (must stay byte-identical per the T3.1 test). Pattern: NEVER use `grep -oP` in shipped CI YAML — always use `grep -oE` + `sed` for portability.
- **Type:** gotcha
- **Confidence:** high (root cause confirmed in code; both files fixed)
- **Severity:** high (breaks the auto-route fail-safe; any bkit:auto repo with a malformed/missing PR body marker hits a red job)
- **Source:** build-challenge (challenge-1 + challenge-2 merged finding)
- **Related:** #141, DE-21, `.github/workflows/bkit-cloud.yml`

## KN-32: `slop:delta` scans `--head .` (live tree) against a clean base worktree — gitignored build output surfaces as phantom "added" findings (2026-06-06)

- **Category:** infra
- **Symptom:** A consumer's `pnpm slop:delta` failed on hundreds of phantom "added" findings (707, all from `apps/web/.next/`) before anything shipped. The build output exists in the live tree but not in the base, so the gate read it as net-new slop and FAILed spuriously. After adding `**/.next/**` to the consumer's `slop-scan.config.json` ignores, net dropped to -1 and the gate passed.
- **Root cause:** Two compounding facts. (1) `slop-scan delta --base <wt> --head .` is asymmetric — the base is a detached `git worktree` (a fresh checkout: tracked files only, no untracked or gitignored build output), while `--head .` scans the real working tree (which has `.next/`, `.turbo/`, etc. from local builds). Any path present live but absent from the base checkout reads as added. (2) slop-scan respects only the **root** `.gitignore`, not nested ones; in a monorepo, build output ignored by a package-level `.gitignore` (e.g. `apps/web/.gitignore`) is never excluded. The shipped default ignores compounded it by being root-relative (`dist/**`, which matches only the repo root, not `apps/web/dist/` — confirmed: `dist/**` still flags the nested path, `**/dist/**` does not).
- **Fix or rule:** Ship depth-agnostic, monorepo-safe build-output ignores in the default `slop-scan.config.json` — `**/dist/**`, `**/coverage/**`, `**/node_modules/**`, `**/.next/**`, `**/.turbo/**` (`**/X/**` matches root and nested alike, so bkit's own tracked root `dist/` stays ignored). Never slop-scan build output. Residual: the `--head .`-vs-clean-worktree asymmetry makes any untracked or gitignored build artifact a latent false-positive source, so a consumer with other generated dirs (`.svelte-kit/`, `.nuxt/`, `out/`) still adds them to their own `slop-scan.config.json`. CI checks out a clean tree (no prior build) and never sees this; local pre-push on a built tree does.
- **Type:** gotcha
- **Confidence:** high (both mechanisms — glob depth and root-only `.gitignore` — reproduced in isolation)
- **Severity:** medium (spurious local pre-push FAIL for any consumer with build artifacts in the tree; the consumer-side ignore unblocks immediately; never ships bad code)
- **Source:** consumer dogfood feedback
- **Related:** #226, `scripts/tooling/slop-delta.sh`, `slop-scan.config.json`

## KN-33: `installFile`-based agent/command writes are NOT recorded in `ws.writes` — parity tests must use disk presence, not writeset, for these paths (2026-06-10)

- **Symptom:** A test asserting `ws.writes.filter(w => w.path.includes(".opencode/agent"))` returns zero entries even after a successful `runOpencodeModule` install. Same issue for `.claude/agents`, `.cursor/agents`, `.claude/commands`, `.cursor/commands`.
- **Root cause:** `installFile()` in `bkit-modules.ts` does not push to `ctx.ws.writes` — it returns a boolean (written/skipped) and the caller logs to console. Only the tier-writer functions (`writeTier1`, `writeTier2JsonContained`, `writeTier3`) record to `ws.writes`. The WriteSet is for tier-managed, reconverged files (JSON configs, byte-equal scripts, markered-text blocks), not the dynamic agent/command mirror dirs.
- **Fix or rule:** When testing agent/command file count or content after a module install: assert `fs.readdirSync(dir).filter(f => f.endsWith('.md'))` on the destination dir, NOT `ws.writes`. The dry-run parity test (`bkit-dry-run-parity.integration.test.ts`) correctly covers only tier-writer paths (opencode.json + gateguard.js for the opencode module). Agent/command dry-run correctness is exercised by checking no `.md` files exist on disk after dry-run dispatch.
- **Type:** trap
- **Confidence:** high (reproduced in test authoring for opencode module, consistent with claude/cursor module behaviour)
- **Severity:** low (test authoring trap only — does not affect production behaviour)
- **Source:** #245 sub-plan 2 gap-remediate

## KN-34: opencode spec churn — pin the probed version, not a naive next-digit bump (2026-06-10)

- **Category:** agentic
- **Symptom:** After upgrading opencode or updating `opencode.json`, agents fail to launch or plugin API calls are rejected with schema errors.
- **Root cause:** opencode's plugin spec, frontmatter fields (`reasoningEffort`, provider config shape), and command-file syntax change between releases without a stable semver contract. Naively bumping a version number or copying from release notes produces configs that may never have existed in the actual binary.
- **Fix or rule:** Probe the installed opencode binary for its supported field names and plugin API shape before updating `opencode.json`. Read `.opencode/opencode.json` against the opencode docs for the version that `opencode --version` reports. When in doubt, copy from a fresh `opencode init` output with that version, not from examples in issues or READMEs that may lag the release.
- **Type:** gotcha
- **Confidence:** medium (observed during #245 spike; spec drift confirmed across minor releases)
- **Severity:** normal
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, `.bkit/src/bkit-modules.ts` (applyOpencodeAgent transform), spike-verdict.md

## KN-35: GateGuard subagent-exemption mechanism differs between Claude and opencode (2026-06-10)

- **Category:** agentic
- **Symptom:** On Claude, GateGuard's subagent-exemption (skip advisory when `agent_id` is present) fires correctly. On opencode, the equivalent exemption may not fire — GateGuard runs against every file edit including sub-agent dispatches.
- **Root cause:** Claude's PreToolUse hook payload includes `agent_id` when the hook fires inside a subagent context; `gateguard.cjs` reads this field to suppress the advisory. opencode's plugin API provides a different event payload shape — the field name (if any) that indicates subagent context is not the same as Claude's. The opencode plugin (`gateguard.js`) must use the opencode-specific mechanism, which may not be present in all plugin API versions.
- **Fix or rule:** Validate the opencode plugin's subagent-detection against the installed opencode version's plugin API spec before relying on it. If the opencode API lacks a reliable subagent indicator, gate the advisory behind a more conservative heuristic (e.g. trust file count per session as a proxy). Do not assume parity with Claude's payload shape.
- **Type:** gotcha
- **Confidence:** medium (identified from spec review; not yet empirically verified post-spike)
- **Severity:** low (advisory suppression failure = extra noise, not a functional regression)
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, `.opencode/plugin/gateguard.js`, `.claude/hooks/gateguard.cjs`

## KN-36: Tier-3 seed-or-print upgrade-reach gap — deleting `bkit-mode.sh` does NOT reach seeded consumer copies (2026-06-10)

- **Category:** agentic
- **Symptom:** After upgrading bkit to a version that no longer ships `.bkit/scripts/bkit-mode.sh`, every prior consumer still has the file on disk. The upgrade silently leaves the orphan in place. Worse, the file's shell-function shim (`bkit()`) is still sourced from `~/.zshrc` / `~/.bashrc`, causing a broken `source` error in every new terminal after the file is eventually deleted.
- **Root cause:** `.bkit/scripts/bkit-mode.sh` was Tier-3 seed-or-print. Tier-3 files are written once when absent; on upgrade, bkit checks if the template still exists and skips if the template is gone. There is no deletion step — the consumer copy is abandoned without notice (mirrors KN-17 for `bkit-mode.sh`).
- **Fix or rule:** Any Tier-3 file that is retired must be paired with an upgrade-migration drift-detect advisory in `runClaudeModule` (or the owning module) that: (1) detects the orphan on disk, (2) emits an advisory telling the consumer to delete the file, (3) explicitly names the shell-rc source line to remove (if applicable), and (4) points at the replacement workflow. Implemented for `bkit-mode.sh` in `bkit-modules.ts` via the `bkit-mode-sh-deletion-required` advisory. Also: the `CORE_TEMPLATE_PATH_EXCLUDE` and `PAYLOAD_SKIP_BKIT_SCRIPTS` sets must remove the entry to avoid the `installFile` short-circuit guard from hiding the advisory path.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical (broken `source` call in every new shell = user-visible error)
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, KN-17, `.bkit/src/bkit-modules.ts` (bkit-mode-sh-deletion-required advisory), DE-27

## KN-37: GHA workflow injection — never expand context outputs inside `run:` shell strings (2026-06-10)

- **Category:** security
- **Symptom:** `opencode run "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"` expands before the shell runs; a crafted issue number (e.g. `"; malicious-cmd"`) becomes a shell argument.
- **Root cause:** GitHub Actions expressions (`${{ }}`) are string-interpolated into YAML by the runner before bash executes — they bypass shell quoting. Any step that accepts free-text inputs (workflow_dispatch `type: string`, PR titles, issue numbers) is a sink.
- **Fix or rule:** Pass dynamic values via `env:` entries (e.g. `BKIT_PHASE`, `BKIT_ARG`) and reference via `$VAR` in the `run:` body. Combine with an allowlist regex guard on the env var before use. Implemented in `.bkit/templates/.github/workflows/bkit-cloud.yml` opencode job (#245 Fix 1 + Fix 2).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, `.bkit/templates/.github/workflows/bkit-cloud.yml`

## KN-38: Orphan-cleanup must be gated on replacement presence (2026-06-10)

- **Category:** infra
- **Symptom:** `bkit install` (no `--cloud` flag) runs the upgrade-orphan block that deletes `bkit-auto.yml` without installing `bkit-cloud.yml`, leaving the consumer with no cloud workflow at all.
- **Root cause:** The delete guard only checked `fs.existsSync(oldAutoWorkflow)`, not whether the replacement was arriving in the same run.
- **Fix or rule:** Gate orphan deletion on `fs.existsSync(newCloudWorkflow) || candidates.some(c => c.relPath === "...bkit-cloud.yml")`. Implemented in `bkit-install.ts` (#245 Fix 4).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, `.bkit/src/bkit-install.ts`

## KN-39: CI tool downloads flake on transient CDN blips — retry one-shot fetches, loop subcommand fetches (2026-06-11)

- **Category:** infra
- **Symptom:** `bkit-tests` goes red on a transient network/CDN hiccup while downloading a CI tool (vale tarball, actionlint binary, opencode installer) — a one-off failure with no code cause; a re-run is green.
- **Root cause:** A one-shot `curl` with no retry dies on the first blip. For a fetch buried inside a tool subcommand (`vale sync` pulling styles) or a third-party installer script (`download-actionlint.bash` fetching the binary), there is no curl flag to harden — the bare invocation has no retry at all.
- **Fix or rule:** One-shot `curl` → add `--retry 3 --retry-all-errors` (needs curl ≥ 7.71; ubuntu-latest 8.x and the Debian Dockerfile base are clear). Fetch inside a subcommand / 3rd-party script → wrap in a 3× retry-loop that `exit 1`s loudly after the last attempt (never a bare loop that swallows a persistent outage). Applied to `ci.yml`, `.cursor/Dockerfile`, `bkit-cloud.yml` (own + template) and the `cloud.md` setup script. Do NOT "simplify" the loops back to a single call.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Scope:** consumer
- **Source:** agent
- **Related:** #236, `.github/workflows/ci.yml`, `.bkit/templates/.cursor/Dockerfile`

## KN-40: opencode zen gateway model IDs come from the live `/zen/v1/models`, not `/docs/zen` (2026-06-12)

- **Category:** agentic
- **Symptom:** Pinning zen (opencode-native gateway) models from the `https://opencode.ai/docs/zen` page would ship a non-existent id — the docs listed `qwen3.7-plus`/`qwen3.7-max`, but the live `https://opencode.ai/zen/v1/models` endpoint only had `qwen3.6-plus`. A pinned `opencode/qwen3.7-plus` fails at runtime.
- **Root cause:** The docs page runs ahead of the deployed gateway. Same class as the Cursor model-ID lesson — probe the live API, never trust the stored/docs format.
- **Fix or rule:** Always curate zen pins from `curl https://opencode.ai/zen/v1/models` (public, no auth; returns bare ids that opencode references as `opencode/<id>`), never the docs page. zen is managed-auth (`opencode auth login`) so bkit holds no key — the per-model agent-loop tool-call smoke is deferred to the consumer's login; document pins as **existence-validated** until then (a step above placeholders, honest about the unmet smoke).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Scope:** consumer
- **Source:** agent
- **Related:** #245, DE-28, `.bkit/prompts.md` § Models (Zen column), `.bkit/providers.md` § Models, Cursor-live-API analog (#205).
