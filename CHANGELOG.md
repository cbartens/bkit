# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

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
