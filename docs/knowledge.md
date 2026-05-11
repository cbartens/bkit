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

## KN-15: Sentinel-file cleanup must bracket the write — stale sentinels cause false Failure Path (2026-05-09)

- **Category:** agentic
- **Symptom:** After manually resolving a `git rebase` conflict outside the workflow, re-invoking `/bkit-ship` immediately routes to the Failure Path even though the rebase is complete.
- **Root cause:** `bkit-ship.md` Step 2 `touch .rebase-failed` sentinel is never removed on success or retry. The sub-step 3a existence check fires on the stale file from the prior failed run, not the current run.
- **Fix or rule:** Bracket every sentinel with an explicit cleanup: (1) `rm -f` at the START of the bash block that writes the sentinel (clears stale-from-prior-run before any new attempt), and (2) `rm -f` in the Failure Path step that runs after the sentinel is no longer needed. Pattern: create-write only inside the failure branch; delete-unconditionally at start of each attempt and at Failure Path exit. See `bkit-ship.md` Step 2 revised bash block.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** build-challenge
- **Related:** BAR-155, `.agents/workflows/bkit-ship.md`

## KN-16: Multi-section output format — EOF-append landing section must be last (2026-05-09)

- **Category:** agentic
- **Symptom:** Agent appends gap findings at EOF of output file; entries land inside `## Notes` instead of `## Gaps Identified`, breaking downstream consumer parsing.
- **Root cause:** `bkit-build-plan-verify.md` Output format had `## Gaps Identified` in the middle of a six-section skeleton. The Fix 1b `echo {finding} >> {output}` directive appends at EOF, which is after `## Notes` (the last section). Downstream gap-remediate consumers grep for `## Gaps Identified` and find gaps mixed into Notes.
- **Fix or rule:** When an agent uses the flat-append-at-EOF pattern for a specific section, that section MUST be the last section in the Output format skeleton. Reorder sections so the append-target section is last. This is the same reason `bkit-build-challenge-tests.md`'s `## Bugs Discovered` must come after `## Blockers`.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** high
- **Source:** build-challenge
- **Related:** BAR-155, `.agents/prompts/bkit-build-plan-verify.md`, `.agents/prompts/bkit-build-challenge-tests.md`

## KN-17: Deep-containment is canonical for ownership-mixed JSON — `__bkit__` envelope removed (2026-05-11)

- **Category:** agentic
- **Symptom (original):** Consumer-side audit (2026-05-09) on `app-gether-life` found two failure modes with the v0.8.0 `__bkit__` envelope model: (1) duplicate content — every bkit-owned key appeared twice (inside `__bkit__` AND at the top level), bloating the consumer file and causing confusion; (2) silent drift — `.github/workflows/ci.yml` lost its `pnpm bkit check` step with no detection because the envelope check only walked `__bkit__`, not the full file.
- **Root cause:** The `__bkit__` envelope model required both the template AND the consumer to maintain two copies of every bkit-owned value. `writeTier2Json` wrote `{ ...consumer, __bkit__: template.__bkit__ }` but did not enforce top-level key presence — so the consumer could hold a stale top-level copy alongside a fresh `__bkit__` copy indefinitely. Drift detection only checked `canonicalHashes` (SHA-based), not semantic key presence.
- **Fix or rule (v2.0.0+):** Deep-containment model: the template JSON tree IS the bkit-declared scope. `deepContains(template, consumer)` checks that every leaf path in the template is present and equal in the consumer. Consumer keys outside the template tree are never touched. `writeTier2JsonContained` replaces `writeTier2Json`: dest absent → write template as-is; present → `deepContains` → ok no-op; fail → `deepMergeJson(existing, template)` (template-wins on conflict). `migrateLegacyBkitEnvelope` runs once on upgrade: strips `__bkit__`, runs `deepContains`, deep-merges if containment fails. Idempotent. Logs per `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. `detectLegacyBkitEnvelope` advisory surfaces if `__bkit__` still present. `detectTier2JsonDrift` advisory surfaces if `deepContains` fails.
- **Collision risk:** A consumer that added their own top-level `__bkit__` key for an unrelated purpose will see it stripped by `migrateLegacyBkitEnvelope` on first `bkit upgrade` to v2.0.0. Document as a known collision; consumers must rename their key before upgrading.
- **Type:** pattern
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-167, KN-8 (superseded), DE-18, `.agents/scripts/bkit-tiers.ts` (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`), `.agents/scripts/bkit-preflight.ts` (`detectLegacyBkitEnvelope`, `detectTier2JsonDrift`), `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`

## KN-16: bkit-modules.ts format dispatch alignment — writeTier2 for markered-text, not writeTier1 (BAR-167 Phase 2) (2026-05-11)

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
- **Fix:** Always set manifest `format` to match the *actual install function called*: `writeTier3` → `byte-equal-text`; `writeTier2`/`writeTier2JsonContained` → `markered-text`/`json`. When install strategy changes, update both the module code and the manifest entry atomically.
- **Type:** incident
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-167, `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-modules.ts`

## KN-19: malformed-JSON destination must throw, not silently overwrite (2026-05-11)

- **Symptom:** `writeTier2JsonContained` silently overwrote a malformed-JSON destination file with the template, destroying any consumer content that was unrecoverable as JSON.
- **Root cause:** Catch branch treated parse failure as "absent" and wrote the template wholesale — same as a fresh install. A corruption or partial write that left invalid JSON would be permanently lost without warning.
- **Fix:** Throw `[bkit] <path> is malformed JSON — fix manually before running bkit install` when destination exists but fails JSON.parse. Matches the `malformed-package-json` blocker discipline. Fresh install (file absent) path is unchanged.
- **Type:** incident
- **Confidence:** high
- **Severity:** normal
- **Source:** phase
- **Related:** BAR-167, KN-8, `.agents/scripts/bkit-tiers.ts` (`writeTier2JsonContained`)

## KN-20: Release workflow silently skipped after `chore(release)` tag push — re-tag at same SHA does NOT re-fire (2026-05-11)

- **Category:** infra
- **Symptom:** Pushing `v2.0.2` tag after merging `chore(release): 2.0.2 (#26)` into `main` produced zero workflow runs. CI on the `main` push event ALSO did not fire. Deleting the tag and re-pushing at the same SHA produced no run either. Previous releases (v2.0.0, v2.0.1) had succeeded via the same flow.
- **Root cause:** Two stacked issues. (1) The squash commit body inherited `[skip ci]` / `[skip build]` tokens from historical dev commits (e.g. `chore(bar-167-...): close-workflow status [skip build] [skip ci]`). GitHub Actions parses ANY commit message in a push and skips workflow dispatch on `[skip ci]`. (2) For tag-push events, deleting and re-creating a tag at the SAME target commit does NOT generate a new push event — GitHub deduplicates. v2.0.0 succeeded with the same skip-ci tokens because the previous run did fire, then a NEW tag commit was created — different SHA → new push event.
- **Fix or rule:** Two complementary defences:
  1. **Strip `[skip ci]` / `[skip build]` tokens from squash-commit bodies before merging** into `main`. `gh pr merge --squash` lets you edit the commit message inline; remove any historical skip markers. Reviewer rule: "if the PR squashes dev-history commits with skip-ci, scrub the body before clicking merge."
  2. **To re-fire a tag push, move the tag to a NEW commit** (cherry-pick or empty commit), then `git tag -f` + `git push --force origin v{N}`. Deleting and recreating at the same SHA is a no-op for the push trigger.
- **Type:** post-mortem
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-186, feedback memory `skip-ci commits must not be HEAD when PR is created`, `.github/workflows/release.yml`, commit `05a3e6b chore(release): 2.0.2 (#26)`
