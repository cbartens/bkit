<!-- bkit:start -->

# Decisions

> [!CAUTION]
> **Purpose:** ADRs — what was decided, why, discarded alternatives. Append-only.
> **ID:** `DE-{N}` — next = `max(grep 'DE-\d+') + 1`.
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
> ## DE-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Status:** active | superseded | deferred
> - **Decision:** what
> - **Why:** reasoning
> - **Discarded:** alternatives (omit if none)
> - **Superseded by:** DE-{N} (only if superseded)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## DE-3: bkit Distribution via GitHub Packages npm Registry (2026-05-06)

- **Category:** infra
- **Status:** active
- **Decision:** Distribute `@cbartens/bkit` via GitHub Packages npm registry (`https://npm.pkg.github.com`) starting v0.4.0. v0.3.x remains consumable from git but is frozen. Consumer auth = PAT with `read:packages` scope + `.npmrc` at repo root.
- **Why:** Eliminates four friction classes from git-dep model: (1) private-repo clone requires git auth on two surfaces (GHA + Vercel); (2) `Configure private-repo auth` shim needed in every consumer CI workflow; (3) lifecycle-hook OOM trap via `prepare: tsc` (BAR-130 #5); (4) pnpm tag-drop bug strips `#vX.Y.Z` pin from `package.json`. Registry path uses standard scoped-package semantics — one `.npmrc` file + one env var — with no git ceremony.
- **Discarded:** (1) npmjs.org public registry — package is private; private-org plan adds cost. (2) Continue git-dep — all four friction classes persist. (3) GitHub Releases tarball URL — clunky version pinning, no semver resolution. (4) Vendor bkit per-consumer — N×duplication, manual sync. (5) Dual-publish git+registry — code-path drift; contradictory installer guidance during transition window.
- **Note:** `publishConfig.access: restricted` in `package.json` is silently ignored by GitHub Packages — package visibility tracks the linked repository's visibility (private repo = private package), not the npm `access` field. The field is kept for documentation intent but has no enforcement effect. If `cbartens/bkit` is ever made public the package becomes public regardless of this setting.
- **Note:** The `release.yml` publish job has no `environment:` protection by design (single-maintainer; no secondary approval needed). If a second maintainer is onboarded, gate the publish step behind `environment: production` with required-reviewer protection in GitHub repo settings.
- **Source:** phase
- **Related:** BAR-138, BAR-130, `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`, `package.json`, `.github/workflows/release.yml`, KN-1

## DE-4: BAR-141 — Structured PreflightFinding replaces printSink (2026-05-06)

- **Category:** agentic
- **Status:** active
- **Decision:** Replace `ModuleContext.printSink: string[]` with `ModuleContext.advisories: PreflightFinding[]` (shape: `{id, severity, detect, action}`). Install is restructured into three phases: Phase 1 preflight (read-only, blockers short-circuit before any writes), Phase 2 dispatch (unchanged), Phase 3 post-install re-detection (token surfaces, ci.yml, vale sync, devDeps). Findings deduplicated by `id` — Phase 3 wins on conflict.
- **Why:** `printSink: string[]` was unparseable by downstream tooling, emitted advisory strings during module execution (before post-install state was accurate), and had no structured `id` for deduplication. The structured shape enables: (1) stable `id` registry for downstream automation; (2) blocker short-circuit before any writes; (3) accurate post-install re-detection; (4) unified banner formatter reusable by BAR-139 (`bkit uninstall`).
- **Discarded:** (1) Keep `printSink` + add parallel `findings: PreflightFinding[]` — two sinks → drift risk; downstream tooling has to merge two shapes. (2) `--strict` flag promoting advisories to blockers — out of scope; consumer can use `bkit check` (exit-1-on-drift). (3) Auto-apply advisory fixes — violates consumer-value-wins principle.
- **Source:** phase
- **Related:** BAR-141, `docs/plans/active/bar-141-preflight-checklist-plan.md`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-tiers.ts`, DE-3, KN-4
