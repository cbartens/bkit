# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

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
