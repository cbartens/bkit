# Build Plan Execute — Sub-plan 4 Log

## WS-6: Docs and Prose Updates

**WS6-T1: `.agents/rules.md` — sync rule, central principle, preflight ref**

- Added `Install source of truth` bullet in `### bkit Repo Authoring`
- Updated template sync bullet: `.agents/templates/.agents/rules.md` → `.bkit/templates/.agents/rules.md`
- Updated preflight advisories bullet: `.agents/scripts/bkit-preflight.ts` → `.bkit/src/bkit-preflight.ts`

**WS6-T2: docs/ updates**

- `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md`, `docs/testing.md`, `docs/technology.md`, `docs/knowledge.md`: all stale `.agents/scripts/` → `.bkit/src/` and `.agents/templates/` → `.bkit/templates/` refs updated
- `.bkit/templates/.github/renovate.json5`: `ignorePaths` updated from `.agents/templates/**` → `.bkit/templates/**`; comment prose updated accordingly

**WS6-T3: Workflow/config re-points**

- `.agents/workflows.md`: `.agents/templates/.gitattributes` → `.bkit/templates/.gitattributes`
- `.agents/trackers.md`: `bkit-manifest.ts`, `.mcp.json`, `bkit-trackers.ts` refs → `.bkit/src/` and `.bkit/templates/`
- `.bkitignore`: comment "those always reflect `.agents/templates/`" → `.bkit/templates/`
- `.github/workflows/ci.yml`: `dist/ comment: .agents/scripts/**.ts` → `.bkit/src/**.ts`
- `.bkit/src/bkit-templates.content.test.ts`: renovate `ignorePaths` assertion updated to match new `.bkit/templates/**` pattern

## WS-7: `rules.md` Block-Scoped CI Gate

**WS7-T1: `.bkit/src/bkit-rules-sync.test.ts`**

- New test: extracts `<!-- bkit:start -->` … `<!-- bkit:end -->` managed block from both `.agents/rules.md` and `.bkit/templates/.agents/rules.md`, asserts byte-equality
- Third assertion: `### bkit Repo Authoring` section exists in `.agents/rules.md` but is ABSENT from `.bkit/templates/.agents/rules.md` (D3 exclusion — bkit-repo-only section never ships to consumers)
- All 3 assertions pass

**WS7-T2: `docs/decisions.md` — DE-22**

- New entry: block-scoped rules.md equality gate (D3 constraint), records discarded whole-file alternative

## Gate Verification

- `pnpm build` — exit 0
- `pnpm test` — 1141 passed, 2 skipped, 1 todo, 32 files, 0 failures
- WS-7 gate: 3/3 tests pass (`bkit-rules-sync.test.ts`)
- No stale `.agents/scripts/` or `.agents/templates/` refs in active workflow/docs files
- `.bkit/templates/.github/renovate.json5` `ignorePaths` updated to `.bkit/templates/**`
- `.agents/rules.md` `### bkit Repo Authoring` section updated; template sync ref corrected

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->
