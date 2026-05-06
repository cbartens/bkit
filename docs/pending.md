<!-- bkit:start -->

# Pending

> [!CAUTION]
> **Purpose:** Ledger of deferred issues and future feature ideas. Append-only.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Cross-doc: grep any `DE-\d+`/`KN-\d+` across `decisions.md` / `knowledge.md`.
>
> **Format:**
>
> ```markdown
> ## Title (YYYY-MM-DD)
>
> - **Type:** issue | feature
> - **Category:** {one of above}
> - **Severity:** critical | normal | low
> - **Status:** open | resolved | deferred
> - **Description:** what's wrong/risky/planned
> - **Workaround:** mitigation (omit if none)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## Consumer migration to @cbartens/bkit registry path — app-gether-life (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** normal
- **Status:** open
- **Description:** `app-gether-life` still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc` (`@cbartens:registry=https://npm.pkg.github.com` + `_authToken`), expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` git-shim.
- **Source:** phase
- **Related:** BAR-138, DE-3, `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`

## Consumer migration to @cbartens/bkit registry path — www-visitfrasercoast-com (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** normal
- **Status:** open
- **Description:** `www-visitfrasercoast-com` still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc` (`@cbartens:registry=https://npm.pkg.github.com` + `_authToken`), expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` git-shim.
- **Source:** phase
- **Related:** BAR-138, DE-3, `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`

## bkit doctor verb — standalone preflight CLI subcommand (2026-05-06)

- **Type:** feature
- **Category:** dx
- **Severity:** normal
- **Status:** open
- **Description:** Expose `runPreflight()` (built in BAR-141) as a standalone `pnpm bkit doctor` (or similar) CLI verb. Runs Phase 1 + Phase 3 detection without touching disk, prints the unified checklist, exits 0. Lets consumers diagnose drift between `bkit install` runs (e.g. stale version pin, missing token surfaces) without re-running a full install. Architecture is already factored — preflight is a pure function — so this is a thin CLI wrapper. Out of scope for BAR-141 (new CLI surface).
- **Source:** [BAR-141 comment](https://linear.app/bartens/issue/BAR-141/bkit-install-preflight-post-install-ai-checklist#comment-44d9e92b)
- **Related:** BAR-141
