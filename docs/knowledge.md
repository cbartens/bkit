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

<!-- bkit:end -->

## KN-1: pnpm v7.20+ silently ignores entire `.npmrc` when `${VAR}` env-var is unset (2026-05-06)

- **Category:** infra
- **Symptom:** `pnpm install` fails with opaque 401 against npmjs.org (NOT against `npm.pkg.github.com`). Error reads as generic auth failure — no "token missing" language. `@cbartens/bkit` not found on npmjs.org.
- **Root cause:** When any `${VAR}` reference inside `.npmrc` resolves to an unset env-var, pnpm v7.20+ silently ignores the **entire** `.npmrc` file and falls back to defaults. The `@cbartens:registry=https://npm.pkg.github.com` line is dropped; pnpm hits npmjs.org instead; npmjs.org has no `@cbartens/bkit`; 401.
- **Fix or rule:** Ensure `GH_BKIT_TOKEN` is: (1) exported in the maintainer's shell before local `pnpm install`; (2) set as a GHA secret on the consumer repo; (3) set as a Vercel env var (preview + production) for any Vercel-deployed consumer. Verify with `echo "${GH_BKIT_TOKEN:-MISSING}"` before `pnpm install` when troubleshooting.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-138, DE-3, `.agents/scripts/bkit-modules.ts` (installer print copy enumerates this verbatim in `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` and `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`)

## KN-2: `.npmignore` still applies inside `files`-listed directories in `package.json` (2026-05-06)

- **Category:** infra
- **Symptom:** Publishing a package with `"files": [".agents"]` ships all `.ts` source and `*.test.ts` files inside `.agents/scripts/` to consumers. Consumers have no use for test tooling or TypeScript sources (compiled output lives in `dist/`).
- **Root cause:** The `files` array in `package.json` is an allowlist of paths/directories to include. npm does NOT auto-exclude sub-files within those directories. A top-level `.npmignore` (or per-subdirectory `.npmignore`) further filters what gets packed. Without `.npmignore`, every file under `.agents/` is shipped.
- **Fix or rule:** Add a `.npmignore` at repo root to exclude test sources and snapshots: `.agents/scripts/*.ts` and `.agents/scripts/__snapshots__/`. Verify exclusion with `npm publish --dry-run` before tagging. Note: `.npmignore` takes precedence over `.gitignore` for publish filtering — if `.npmignore` exists, `.gitignore` is ignored during pack.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-138, `.npmignore`, `package.json#files`

## KN-3: GitHub Actions `@v4` floating tags on publishing workflows — pin to commit SHAs (2026-05-06)

- **Category:** infra
- **Symptom:** OpenSSF Scorecard flags floating action major-version refs (e.g. `actions/checkout@v4`) in publishing workflows. A compromised upstream action repo or malicious tag re-point executes attacker code inside a job with `packages: write` on `GITHUB_TOKEN`.
- **Root cause:** `@v4` resolves to whichever commit the upstream repo's `v4` tag points to at run time. Tag re-pointing is possible for any action maintainer and is the primary supply-chain vector.
- **Fix or rule:** Pin `uses:` to a full 40-character commit SHA with a `# vX.Y.Z` comment for human readability. Use `git ls-remote https://github.com/<org>/<action>.git 'refs/tags/vX.Y.Z'` to get the tag SHA. Re-pin when Dependabot opens a version bump PR. Apply to ALL jobs that hold elevated permissions (`packages: write`, `id-token: write`, etc.).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-138, `.github/workflows/release.yml`

## KN-4: Phase 3 runs ONLY in install (not check) — dry-run parity (2026-05-06)

- **Category:** agentic
- **Symptom:** n/a (design rule — not a bug)
- **Root cause:** `bkit check` is read-only by design; Phase 3 post-install re-detection (token surfaces, ci.yml, vale sync, devDeps) shells out to `gh secret list`, `vercel env ls`, and `vale --version` — these are not read-only semantics and must not run in check mode.
- **Fix or rule:** Phase 3 is skipped when `dryRun=true`. HOWEVER, Phase 1 advisories accumulated in `ctx.advisories` ARE still rendered in dry-run via `formatChecklist(ctx.advisories)` to preserve parity with the legacy `printSink` dump — only the post-install re-detection layer is suppressed. `bkit check` exits 1 on drift WITHOUT a Phase 3 banner; Phase 1 advisories (e.g. `lint-prose-f9-vulnerable`, `husky-no-markers-precommit`) are visible. `runPostInstallCheck` accepts a `dryRun` parameter (default `false`); pass `true` to suppress Phase 3. Zero-advisory dry-runs print no banner (`formatChecklist([])` returns `""`).
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, DE-4, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.ts`
