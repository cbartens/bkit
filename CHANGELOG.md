# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

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
