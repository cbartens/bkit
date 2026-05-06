# Build Input — BAR-138 bkit GH Packages Distribution

## Session Prompt

/bkit-build bar-138

## Issue Description

BAR-138: bkit distribution GitHub Packages npm registry

Migrate `@cbartens/bkit` distribution from a git-dependency (with auth-shim + `prepare` hook history) to the **GitHub Packages npm registry**. Eliminates the entire git-clone + auth-shim story for consumers and aligns bkit with standard npm-package distribution semantics.

Ships as **v0.4.0**. Coordinated migration — every consumer (`app-gether-life`, `www-visitfrasercoast-com`, etc.) updates `.npmrc`, secret scopes, and `package.json` dep spec on the same upgrade.

### Goal

Migrate distribution from `pnpm add -D github:cbartens/bkit#vX.Y.Z` to `pnpm add -D @cbartens/bkit@^0.4.0` via GitHub Packages npm registry.

Eliminates: private-repo clone auth-shim, two auth surfaces (Actions + Vercel), lifecycle-hook OOM fragility, pnpm tag-drop bug.

### Key Changes (bkit-side)

1. `package.json`: `private: true` → `false`, add `publishConfig.registry` = `https://npm.pkg.github.com`
2. `.github/workflows/release.yml`: tag-push triggered publish with `GITHUB_TOKEN`, gated by full check suite
3. Installer print constants: drop git auth-shim language, replace with `.npmrc` setup instructions
4. README + `.agents/README`: rewrite for npm-registry install path
5. ADR DE-3: document distribution model change
6. Token requirements update: `GH_BKIT_TOKEN` needs `read:packages` scope

### Sub-plans

- Sub-plan 1: Phase A (pipeline foundation) + Phase B Tasks B1–B7 (installer print constants, CI template edits) + Phase C Tasks C0–C2 (Vitest tests)
- Sub-plan 2: Phase B Tasks B8–B15 (docs rewrites, dist rebuild) + Phase C Tasks C3–C5 (scratch consumer smoke) + Phase D (production ship) + Gates

## Plan Comments

### Plan Workflow Comment

The plan splits into two sequential sub-plans. Sub-plan 1 covers Phase A (pipeline foundation: package.json edits, release.yml, pre.1 publish smoke), Phase B Tasks B1–B7 (installer print constants, CI template edits), and Phase C Tasks C0–C2 (Vitest tests). Sub-plan 2 covers Phase B Tasks B8–B15 (docs rewrites, dist rebuild, pre.2 publish smoke), Phase C Tasks C3–C5 (scratch consumer smoke), Phase D (production ship), and Gates 2/3/4.

**HARD STOP** confirmation has been acknowledged — user initiated /bkit-build indicating plan checkboxes are confirmed.

## FID

bar-138-gh-packages-distribution
