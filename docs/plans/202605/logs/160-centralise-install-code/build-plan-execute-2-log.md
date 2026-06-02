# Build Plan Execute — Sub-plan 2 Log

## WS-3: Physical Move + Re-point + D1 Orphan Removal

**WS-3-T1: `git mv` all `.agents/scripts/bkit-*.ts` → `.bkit/src/`**

- All 48 files (source + tests + snapshot) relocated via git mv.
- `.agents/scripts/` directory is now empty and removed.

**WS-3-T2: `git mv` all `.agents/templates/**`→`.bkit/templates/**`**

- All template files relocated: `.agents/.claude/`, `.cursor/`, `.github/`, `.husky/`, `.vale/`, `docs/`, `scripts/ci/`, root dotfiles.
- `.agents/templates/` directory is now empty and removed.

**WS-3-T3: Update all path literals to use `getTemplatesRoot()`**

- All `path.join(PKG_ROOT, ".agents", "templates", ...)` literals replaced with `getTemplatesRoot()` in `bkit-modules.ts`, `bkit-preflight.ts`, `bkit-uninstall.ts`.
- `bkit-install.ts` `runPayload()` already uses `getPkgRoot()` from sub-plan 1.

**WS-3-T4: Update `tsconfig.json`, `vitest.config.ts`, `package.json`**

- `tsconfig.json` `include`: updated to `[".bkit/src/**/*.ts"]`
- `vitest.config.ts` `include`: updated to `[".bkit/src/**/*.test.ts", ".bkit/src/**/*.integration.test.ts"]`
- `package.json` `files[]`: now includes `.bkit` (excl. test/snapshot files) while keeping `.agents` runtime

**WS-3-T5: D1 orphan removal in upgrade engine**

- `removeOrphanTemplatesDir()` function added to `bkit-install.ts:662-680`
- Called at upgrade path (`bkit-install.ts:745`) to clean `.agents/templates/` from stale consumers
- Log message: `upgrade: removing orphan .agents/templates/ (D1 auto-clean)`

**WS-3-T6: Snapshot regeneration**

- Obsolete `.agents/templates/` keyed snapshot removed from `bkit-templates.content.test.ts.snap`
- New `.bkit/templates/` keyed snapshot written

**WS-3-T7: Vitest glob re-targeted**

- Both `vitest.config.ts` include globs updated from `.agents/scripts/**` to `.bkit/src/**`

**WS-3-T8: `package.json files[]` updated**

- Added `.bkit` entry, retained `.agents` entry (runtime reads still ship)

**Path literal fixes in test files:**

- `bkit-modules.test.ts:76,79` — updated `.agents/scripts/bkit-postinstall.ts` and `bkit-modules.ts` refs
- `bkit-install.test.ts:297,304,770` — updated `.agents/scripts/bkit-install.ts` refs
- `bkit-tiers.test.ts:939` — updated `.agents/templates/.cursor/hooks.json` ref
- `bkit-modules.upgrade.integration.test.ts:264` — updated `.agents/templates/.cursor/hooks.json` ref

## WS-5: Doctor Observability

**WS-5-T1: Doctor prints resolved templates root**

- `bkit-install.ts:711`: `console.log(\`${LOG_PREFIX} Templates root: ${getTemplatesRoot()}\`)`
- `bkit-doctor.integration.test.ts:92`: test asserts "Templates root line (WS5-T1)"

## Gate Verification

- `pnpm build` — exit 0
- `pnpm test` — 1138 passed, 2 skipped, 1 todo, 31 files, 0 failures, no obsolete snapshots
- `.bkit/src/` contains all 48 moved source files
- `.bkit/templates/` contains all moved template files
- No stale `.agents/templates/` or `.agents/scripts/` literals remain in non-test source files
- D1 orphan removal implemented in upgrade path
- WS-5 doctor observability implemented

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->
