# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

---

## [1.0.2] — 2026-05-08

### Fixed

- **Prevent bkit dogfood content from leaking into consumer `.agents/` on install.** `runCoreTemplates` now processes `.agents/` subtemplates from `templates/.agents/` (managed block sourced from the template), and `copyAdditive` excludes the Tier-2-style basenames (`rules.md`, `friction.md`, `docs.md`, `skills.md`) so it no longer additively copies bkit's own out-of-block content (e.g. `### bkit Repo Authoring`, bkit's `## Project Rules` body, friction-log entries) onto consumers. Added `bkit-modules.integration.test.ts` to lock the boundary. (commit `f6be98b`)

### Changed

- **`README.md` / `.agents/README.md` install docs.** Added explicit `GH_BKIT_TOKEN` export guidance for environments with restricted `.env*` access; clarified consumer-facing install flow. Trimmed redundant pre-push checklist from `.agents/rules.md`. (commit `f6be98b`)

---

## [1.0.1] — 2026-05-08

### Fixed

- **`bkit upgrade` no longer silently overwrites files lacking a recorded canonical hash.** Previously `isConsumerModified` returned `false` for unknown-hash files, which the upgrade engine treated as "no drift detected → safe to overwrite". Pre-v0.9.x installs (where `canonicalHashes` did not exist) and any managed file not re-written by `bkit install` since BAR-142 landed had no hash recorded — a single `bkit upgrade` could destroy consumer content. Default flipped: missing hash now returns `true` (treat as modified, surface a conflict, require explicit consumer resolution). `diffFile`'s idempotent `disk == template → skip` check moved earlier so identical files still skip cleanly. (DE-12, commit `954e827`)
- **`.claude/settings.json` template now matches consumer mirror for `apps/*/.env` and `packages/*/.env` reads.** Original deny→ask move (commit `1ecd15d`) only edited the consumer mirror; the canonical template still listed those reads under `deny`, so the next `bkit install` mirror-regen reverted the move. Now editing both in lockstep. (commit `8db6636`)

### Added

- **Auto-seed `canonicalHashes` for skipped files on `bkit upgrade`.** `updateCanonicalHashesAfterUpgrade` now records canonical hashes for files where `disk == template` (the upgrade engine's `skip` classification), in addition to the existing `update` path. Conflict files are explicitly NOT seeded — that would re-introduce the silent-overwrite bug. Effect: running `bkit upgrade` once after this release auto-heals the missing-hash gap for any consumer installed before BAR-142. Truly-customised files continue to surface as conflicts requiring manual resolution. (DE-13, commit `e2889e1`)

### Notes

- Pre-v0.9.x consumers will see all-conflict on first `bkit upgrade` after this release. This is the safe failure mode — review each conflict, accept or reject, and the auto-seed populates canonical hashes for any files where you accept the bkit template. Subsequent upgrades will only flag genuine drift.

---

## [1.0.0] — 2026-05-07

### Added

- **`setup-auth@v1` composite action** — GitHub Actions composite action at `.github/actions/setup-auth/action.yml` wraps the multi-line bash PAT-shim. Consumers reference `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Requires `v1` annotated tag (pushed post-merge). Inputs: `token` (required, `GH_BKIT_TOKEN` PAT), `registry` (optional, defaults to `https://npm.pkg.github.com`). Exports `BKIT_READ_TOKEN` into the job env. (BAR-131 §1)
- **`v1` annotated tag** — pushed post-merge, pointing to the sub-plan-4 squash-merge commit. Required for `uses: cbartens/bkit/.github/actions/setup-auth@v1` to resolve in consumers.

### Notes

- Multi-line bash PAT-shim block in seeded `ci.yml` is **retained** (RETAIN-WITH-REASON: external contract — non-Actions CI fallback). Kill-date: v1.1.0.
- `.github/workflows/test-action.yml` meta-test workflow added for manual `workflow_dispatch` smoke testing.
- Offline acceptance test `bkit-action-yaml.test.ts` parses `action.yml` without network calls.

---

## [0.9.0] — 2026-05-07

### Added

- **Transactional install** — `bkit install` now writes to `.bkit-staging/<module>/` per module before committing. On success, staged files are atomically renamed to consumer destinations. On failure, `discardAllStaging` removes all staging dirs — consumer files left byte-identical to pre-install state. (BAR-142 §A4)
- **`bkit upgrade` verb** — diff engine compares old vs new template content against consumer drift. Non-conflicting changes applied automatically; conflicting files (consumer-modified since install) emitted to stderr without overwrite. `--non-interactive` flag: auto-apply non-conflicting; exit non-zero on any conflict (CI-safe). (BAR-142 §A5)
- **`canonicalHashes` in `.bkit-version`** — additive field (v0.9.x+) records sha256 of every bkit-managed file at install time. Used by `bkit upgrade` drift detection. Backward-compat: absent field defaults to `{}` (all files appear "unknown" → conservative no-overwrite). (BAR-142 §A5)
- **`isConsumerModified` helper** — exported from `bkit-version.ts`; returns true when a managed file's on-disk hash differs from its recorded canonical hash (consumer drift). (BAR-142 §A5)

### Breaking Changes

None. All new surface is additive. `canonicalHashes` absent in old `.bkit-version` payloads defaults to `{}` — backward-compat read.

---

## [0.8.0] — 2026-05-07

### Added

- **`__bkit__` JSON namespace (public contract)** — `.claude/settings.json` and `.cursor/hooks.json` now carry a `__bkit__` top-level envelope containing bkit's managed payload. Consumer-added keys live outside the envelope and survive every `bkit install` upgrade byte-identically. This is a public contract: the key name is stable from v0.8.0 onward. (BAR-142 §A1)
- **Tier-2 JSON deep-merge** (`writeTier2Json`) — replaces the Tier-1 full-overwrite for ownership-mixed JSON files. bkit updates only `__bkit__`; consumer keys are never touched. Throws explicitly when template lacks `__bkit__` envelope (rollback safety). (BAR-142 §A1)
- **Tier-1 → Tier-2 auto-migration** (`migrateTier1JsonToTier2`) — consumers upgrading from v0.5.x–v0.7.x have their existing files automatically migrated on the first v0.8.0 install. Consumer-added keys (e.g. `hooks.Stop`, `failClosed`, `loop_limit`) are preserved outside `__bkit__`. Idempotent. (BAR-142 §A1)
- **Versioned-defaults SoT** (`bkit-tier1-defaults.ts`) — `BKIT_TIER1_DEFAULTS_BY_VERSION` snapshots bkit's shipped template shapes at v0.5.x–v0.7.x. Used by migration to identify bkit-owned vs consumer-added keys when upgrading from pre-`__bkit__` installs. (BAR-142 §A1)
- **B3 — Vercel CLI hang guard** — `detectVercelEnv` now pre-checks `.vercel/project.json` before shelling out to `vercel env ls`. If the project is not linked (file absent), the CLI call is skipped entirely — no TTY hang, no login prompt in non-interactive CI. (BAR-142 §B3)

### Breaking Changes

- **`.claude/settings.json` and `.cursor/hooks.json` reclassified Tier-1 → Tier-2.** Files written by prior bkit versions are auto-migrated to the `__bkit__` envelope form on the first v0.8.0 install. Consumers with custom hook entries no longer need to skip `--claude` / `--cursor` to prevent overwrite. The `detectHooksConfigOverwriteRisk` preflight blocker is removed (architecturally redundant). **Action required: run `pnpm bkit install` after upgrading to v0.8.0** to apply migration.

### Removed

- **`detectHooksConfigOverwriteRisk`** — preflight blocker (ids `hooks-config-overwrite-risk-claude`, `hooks-config-overwrite-risk-cursor`) removed. No longer needed: Tier-2 deep-merge guarantees consumer keys survive upgrades without a preflight gate. (BAR-142 §A1)

---

## [0.7.0] — 2026-05-07

### Added

- **`bkit uninstall` verb** — surgical removal of bkit-managed content. Tier-1 files deleted, Tier-2 managed-block stripped (consumer content preserved), Tier-3 files protected by sha256 hash guard (deleted only if content matches install-time hash). Module flags mirror install (`--ci`, `--lint`, `--git-hooks`, etc.). (BAR-139)
- **`--dry-run` for uninstall** — prints a `FILE | DECISION | REASON` table without writing. (BAR-139)
- **`--nuke` for uninstall** — deletes ALL bkit-managed files regardless of tier; requires `--yes` or interactive confirm. (BAR-139)
- **`--auto-revert` for install** — on Phase 3 blocker, automatically reverts via `bkit uninstall` in-process before exiting 1. (BAR-139 §7)
- **`process.exit(1)` on Phase 3 blockers** — `bkit install` now exits 1 when a `severity: "blocker"` finding is detected in Phase 3. Prints a single-line recovery command: `pnpm bkit uninstall <flags> && <fix> && pnpm bkit install <flags>`. Advisory findings remain informational only. (BAR-142 §A6)
- **`.bkitignore` parser** — create `.bkitignore` at repo root to suppress `bkit check` drift for specific files (picomatch globs) or JSON keys (`:dotted.key` syntax, opt-in via `BKIT_BKITIGNORE_PER_KEY=1`). Comments (`#`) and blank lines ignored. (BAR-142 §A2)
- **`.bkit-version` schema extension** — file format upgraded from plain-text semver to JSON `{ pinnedVersion, tier3Hashes }`. Backward-compatible: old plain-text format is auto-parsed. `tier3Hashes` records sha256 of Tier-3 files at install time for safe-delete decisions during uninstall. (BAR-139)
- **Per-module install manifest** (`bkit-manifest.ts`) — typed record of files each module writes with tier classifications; drives uninstall and `package.json` key stripping. (BAR-139)

### Breaking Changes

- `process.exit(1)` on Phase 3 blockers: **consumers gating CI on `bkit install` exit code may see new failures** if Phase 3 blocker conditions are present. Advisories continue to exit 0. See § Phase 3 exit-1 and recovery in README.

---

## [0.6.0] — 2026-05-07

### Added

- **`bkit doctor` verb** — read-only preflight + post-install advisory replay. Run `pnpm bkit doctor` to diagnose drift without writing. Exits 0. (BAR-142 §A3)
- **CHANGELOG.md** — this file; shipped in tarball and surfaced as a version-delta header in post-install. (BAR-142 §A7)

### Fixed

- **B1 — Anchored marker regex** — `hasBkitMarkers` now uses line-anchored detection (matching `findLineAnchoredMarkers`). Prose-fenced `` `<!-- bkit:start -->` `` inside markdown no longer falsely suppresses the `husky-no-markers` advisory. (BAR-142 §B1)
- **B2 — Position-stable cross-phase dedup** — `runPostInstallCheck` cross-phase dedup now preserves preflight advisory order (preflight first, Phase 3 at back), matching `formatChecklist` display order. (BAR-142 §B2)
- **B4 — `detectShellToken` empty vs unset** — Empty-string `GH_BKIT_TOKEN=""` is now treated as missing (was silently "present"). Action text differentiates the two cases. (BAR-142 §B4)
- **B5 — `LOG_PREFIX` on dry-run blocker banner** — The dry-run blockers banner now carries the `[bkit-check]` or `[bkit-install]` log prefix. (BAR-142 §B5)
- **B6 — `.npmrc` `${GH_BKIT_TOKEN:-}` fallback + concrete action text** — Inline `.npmrc` literal in `bkit-modules.ts` now uses the POSIX `${GH_BKIT_TOKEN:-}` fallback form so pnpm does not silently ignore the entire `.npmrc` when the token is unset. Action text for `gh-bkit-token-secret-unknown` instructs: `export GH_BKIT_TOKEN=$(gh auth token)`. (BAR-142 §B6)
