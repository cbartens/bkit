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

## KN-7: dist/ staleness — `pnpm build` must run before push for `.agents/scripts/*.ts` changes (2026-05-06)

- **Category:** infra
- **Symptom:** Local pre-commit/pre-push hooks pass green (`typecheck`, `test`, `format:check`, `lint:slop`, `lint:prose`) but CI's `run-tests` job fails on the very first step "Verify dist/ is fresh" with a giant unified diff showing `dist/*.js` is missing the latest source changes.
- **Root cause:** Pre-commit/pre-push hooks invoke `tsc --noEmit` (typecheck only) and `vitest run` (no compile). They do NOT run `pnpm build`. CI runs `pnpm build && git diff --exit-code dist/` to ensure shipped artefacts match source. Source-only commits leave `dist/` stale; CI catches it.
- **Fix or rule:** Any TS edit under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit. Or move `pnpm build` into the pre-push hook to make this automatic. Hit during BAR-141 PR #5: commit `edbd891` failed the dist/ check; commit `7ab6bff` regenerated dist and unblocked CI.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, PR #5, commits `edbd891` (broke), `7ab6bff` (fixed), `.husky/pre-push`, `.github/workflows/ci.yml`

## KN-8: Tier-1 full-overwrite is unsafe for consumer-extensible config files (2026-05-06)

- **Category:** agentic
- **Symptom:** Consumer-side regression: bkit upgrade silently overwrote `.cursor/hooks.json` and `.claude/settings.json` on `app-gether-life`, destroying the consumer's `Stop` hook block, postflight wiring, `failClosed`, and `loop_limit` fields. Recovered only by `git revert` of the install commit.
- **Root cause:** Both files ship as Tier-1 (full-overwrite) in `bkit-modules.ts`. Consumers legitimately add their own hook events (e.g. `hooks.Stop`) alongside bkit's `hooks.SessionStart` — full-overwrite has no awareness of consumer additions and silently destroys them on every install.
- **Fix or rule:** Default rule — any file where the schema permits multiple top-level entries AND consumers commonly add their own keys must be Tier-2 (managed-block: bkit owns only the marker-delimited region). Tier-1 is reserved for files bkit fully owns end-to-end (e.g. `vale.ini`, slop-scan config). Mitigated in BAR-141 PR #5 by `detectHooksConfigOverwriteRisk` (preflight blocker — exits 1 if non-default content detected). Long-term Tier-1 → Tier-2 refactor for these two files tracked separately.
- **Type:** pattern
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-141, PR #5, `.agents/scripts/bkit-modules.ts` (cursor + claude module functions), `.agents/scripts/bkit-preflight.ts` (`detectHooksConfigOverwriteRisk`), Gether install findings comment on Linear BAR-141
