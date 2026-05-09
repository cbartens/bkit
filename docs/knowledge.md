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
- **Fix or rule:** Any TS edit under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit. Hook-level enforcement landed in BAR-131 PR #7 — `.husky/pre-push` now runs `pnpm check:dist` (source-repo only, outside the bkit:start..bkit:end block so `bkit install` doesn't strip it), so a stale dist/ now fails the push locally rather than waiting for CI. Fired twice before enforcement: BAR-141 PR #5 (commit `edbd891` broke, `7ab6bff` fixed) and BAR-131/139/142 PR #7 (~2.6k lines of new TS across 13 files with zero dist/ updates; required a separate rebuild commit). Recurrence motivated the hook upgrade.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-141, BAR-131, PR #5, PR #7, commits `edbd891` (broke), `7ab6bff` (fixed), `.husky/pre-push`, `.github/workflows/ci.yml`, `docs/deployments.md` § Pre-push checklist

## KN-8: Tier-2 deep-merge via `__bkit__` envelope is canonical for ownership-mixed JSON (2026-05-07)

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
- **Symptom:** `migrateTier1JsonToTier2` receives a full JSON string (e.g. `{"pinnedVersion":"0.8.0",...}`) instead of a semver string when `.bkit-version` is in v0.7.x+ JSON format. `semverLte` returns false for the JSON blob, silently skipping the Tier-1 → Tier-2 migration.
- **Root cause:** The claude and cursor modules in `bkit-modules.ts` read `.bkit-version` with `fs.readFileSync(...).trim()` before the fix. This works for v0.6.x plain-text format but yields the full JSON string for v0.7.x+. `migrateTier1JsonToTier2` uses the value in a semver comparison — a JSON blob fails the comparison silently.
- **Fix or rule:** Always read `.bkit-version` via `readBkitVersion(path).pinnedVersion` (or `parseBkitVersion(content).pinnedVersion`) — never with raw `readFileSync(...).trim()`. The helper handles all schema versions (v0.6.x plain-text, v0.7.x+ JSON) and returns null for absent/empty files.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-131, build-challenge C1, `.agents/scripts/bkit-modules.ts` (claude + cursor migration paths), `.agents/scripts/bkit-version.ts` (`readBkitVersion`)

## KN-10: bkit install never populated canonicalHashes until after first upgrade (2026-05-07)

- **Category:** agentic
- **Symptom:** After `bkit install`, `.bkit-version` had `canonicalHashes: {}`. On `bkit upgrade`, `isConsumerModified` always returned `false` for all paths (no recorded hashes), so drift detection was ineffective until after the first upgrade pass populated the hashes.
- **Root cause:** `writeBkitVersion` was only called from `bkit-upgrade.ts:updateCanonicalHashesAfterUpgrade`. The `runCoreModule` postDispatch wrote `.bkit-version` with `fs.writeFileSync(versionFile, pkgVersion + "\n")` — plain text, no canonicalHashes. Consumer key survival was preserved by `writeTier2Json` deep-merge semantics regardless, but drift detection via `canonicalHashes` was broken on fresh installs.
- **Fix or rule:** The postDispatch in `runCoreModule` now uses `writeBkitVersion` (JSON format) and populates `canonicalHashes` from `ws.writes` entries (files written in this run, excluding `.agents/` internal paths). The write is guarded: only when pinnedVersion changed or new canonical entries were recorded (preserves idempotence — 3rd run of install produces zero writes).
- **Type:** gotcha
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-131, build-challenge C3, `.agents/scripts/bkit-modules.ts` (`runCoreModule` postDispatch), `.agents/scripts/bkit-version.ts` (`writeBkitVersion`)

## KN-11: PR `statusCheckRollup` stays empty when `[skip ci]` is HEAD on push (2026-05-08)

- **Category:** agentic
- **Symptom:** PR opens with no Actions runs visible — `gh pr view --json statusCheckRollup` returns empty. Ship Step 2's CI fail-fast gate (`if ANY failures → Failure Path`) admits the PR despite no actual CI verification. First observed on PR #7 (BAR-131 consumer-friction suite) — CI only triggered after manually pushing an empty commit without `[skip ci]`.
- **Root cause:** GitHub suppresses both `pull_request` and `push` workflow runs when the HEAD commit message contains `[skip ci]` (or `[skip actions]`). Build's Step 15 summary push left `summary status [skip build] [skip ci]` as remote HEAD, so when `gh pr create` opened the PR (Step 16), no `pull_request` event fired. Same shape in debug Step 7 summary push, which would overwrite a previously-clean HEAD (e.g. push-remediation) with `[skip ci]` and silently empty the PR's rollup. Build Step 17 / debug Step 11 close-workflow commits also never reached remote — there was no explicit `git push` in either step.
- **Fix or rule:** Final commit before `git push` in build / debug close-workflow renamed to `chore({FID}): close-workflow status trigger CI` (no skip tags). Explicit `git push` added to close-workflow (also fixes the missing-push side bug). Ship Step 3 already used `gh pr merge --body ""` (empty body strips `[skip ci]` from the squash subject). Identical gate phrasing across all three workflows: `HEAD on remote does NOT contain [skip ci]`. Codified in `.agents/rules.md` § Git block as "Last push to PR / `dev` (validated): HEAD MUST NOT contain `[skip ci]`."
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-146, BAR-131 (PR #7 first observation), `.agents/workflows/bkit-build.md` Step 17, `.agents/workflows/bkit-debug.md` Step 11, `.agents/workflows/bkit-ship.md` Step 3 + Gate 3, `.agents/workflows.md` § CI / Vercel commit tags

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
- **Fix or rule:** Do NOT use `tier3Hashes` for upgrade drift detection (it only covers Tier-3; Tier-1/Tier-2 also need drift detection). Do NOT use `canonicalHashes` for uninstall safe-delete (it covers all files; safe-delete semantics are Tier-3-only). Keep them separate.
- **Type:** pattern
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-142 §A5, DE-10, `.agents/scripts/bkit-version.ts` (`BkitVersion` interface), `.agents/scripts/bkit-upgrade.ts`

## KN-14: Helper-action additions to seeded templates are additive, not replacement (2026-05-07)

- **Category:** agentic
- **Symptom:** Four assertions in `templates.test.ts` and `bkit-install.test.ts` fail — substring `GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` not found in seeded `ci.yml` template.
- **Root cause:** Sub-plan P4.T8 added `cbartens/bkit/.github/actions/setup-auth@v1` to `.agents/templates/.github/workflows/ci.yml` but simultaneously deleted the inline `env: GH_BKIT_TOKEN` block under `Install Dependencies`. The plan marked that block RETAIN-WITH-REASON (kill-date v1.1.0). The implementer treated the composite action as a replacement, not an addition.
- **Fix or rule:** When a sub-plan adds a composite GitHub Action alongside an existing inline auth pattern that is marked RETAIN-WITH-REASON in the Supersession Inventory, the inline pattern MUST be preserved verbatim until its declared kill-date. The addition is strictly additive. After editing any seeded `.agents/templates/.github/workflows/*.yml` file, re-run `pnpm vitest run .agents/scripts/templates.test.ts .agents/scripts/bkit-install.test.ts` and regenerate the snapshot with `-u`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-131, BAR-138, `.agents/templates/.github/workflows/ci.yml`, `bar-131-related-bars-suite-plan-4.md` §P4.T8, `build-failure-diagnose-1.md`

## KN-15: Stale-CI-run dispatch hazard — router must compare head SHA before dispatching (2026-05-09)

- **Symptom:** `bkit-ci-router` fires for a `workflow_run` completion whose `head_sha` is no longer the PR's current head — i.e., new commits pushed after the CI run started. Dispatching `/bkit-ship` against a stale SHA can attempt to merge an outdated branch.
- **Root cause:** `workflow_run` events are emitted per-run, not per-PR-state. By the time the runner starts the router session, the PR may have advanced (push after the watched CI run kicked off). The `github.event.workflow_run.head_sha` exposed as `CI_RUN_HEAD_SHA` in the runner environment may not match `gh pr view --json headRefOid`.
- **Fix:** Step 4 of `bkit-ci-router.md` (Stale-Run Guard): before any dispatch, compare `PR_HEAD_SHA=$(gh pr view "$PR_NUMBER" --json headRefOid -q .headRefOid)` against `LATEST_SHA=$(gh run list --branch "$CI_RUN_HEAD_BRANCH" --limit 1 --json headSha -q '.[0].headSha')`. If they differ, exit no-op (`echo "stale run — skipping"`). `cancel-in-progress: true` on the router concurrency group ensures the newly-dispatched router for the fresher run supersedes the in-flight stale one.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-148, `.agents/workflows/bkit-ci-router.md` § Step 4, `.github/workflows/bkit-ci-router.yml` (cancel-in-progress: true), DE-14

## KN-16: Negative `.not.toContain()` assertions fail when the forbidden token is documented in prose (2026-05-09)

- **Symptom:** A test asserting `expect(content).not.toContain("SOME_CONSTANT")` fails even though no shell code uses the constant — because the orchestrator markdown documents "do NOT use SOME_CONSTANT" in constraint/gate-check prose, which naturally names the token.
- **Root cause:** `.toContain()` is a literal substring search over the entire file. Prose explanations of why a constant must NOT be used are indistinguishable from actual code usage by this assertion.
- **Fix:** Replace the broad `.not.toContain(name)` with regex assertions that target actual code patterns: `expect(content).not.toMatch(/\$\{?SOME_CONSTANT\}?/)` (shell variable expansion) and `expect(content).not.toMatch(/SOME_CONSTANT\s*[<>=!-]/)` (arithmetic/comparison usage). Documentation prose passes; code usage fails.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** phase
- **Related:** BAR-148, `.agents/scripts/release-workflow.test.ts` C9f, `.agents/workflows/bkit-ci-router.md`
