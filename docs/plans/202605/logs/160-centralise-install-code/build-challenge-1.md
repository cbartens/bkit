Verdict: CONCERNS
Failures: 0
Findings: 5 (CRITICAL: 0, HIGH: 0, MEDIUM: 2, LOW: 3)

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

### MEDIUM — class: mechanical — .agents/README.md ships stale install/template paths

- **file:line** — `.agents/README.md:55,144,145,176-199,207,209,210,299,300`
- **exploit scenario** — `.agents/README.md` ships to consumers (it is inside the `.agents` payload listed in `package.json` `files[]` — confirmed `agents/README.md shipped: true` via `npm pack --dry-run`). #160 moved the engine to `.bkit/src/` and templates to `.bkit/templates/`, but did NOT update this README. It still instructs `pnpm tsx .agents/scripts/bkit-install.ts install` (lines 144-145), names `.agents/scripts/bkit-install.ts` as the install script (line 300, line 55), the snapshot-regen command `pnpm vitest run .agents/scripts/bkit-templates.content.test.ts -u` (line 210), and the entire "What install writes" table maps every managed file to `.agents/templates/...` (lines 176-199, 207, 209, 299). The referenced file `.agents/scripts/bkit-install.ts` no longer exists (verified: `ls` errors; only `.bkit/src/bkit-install.ts` exists). Anyone following the README dev/regen instructions hits "file not found"; the templates table points at a directory that is gone. (Note: `.agents/friction.md` refs are historical incident logs — bkit-repo-only, correctly left as-is. CHANGELOG/docs/pending/docs/plans refs are historical/archival — out of scope.)
- **suggested fix** — sweep `.agents/README.md`: replace `.agents/scripts/` -> `.bkit/src/` and `.agents/templates/` -> `.bkit/templates/` throughout (lines 55, 144, 145, 176-199, 207, 209, 210, 299, 300). Surgical find/replace, no redesign.

### MEDIUM — class: architectural — removeOrphanTemplatesDir unconditionally deletes consumer .agents/templates/

- **file:line** — `.bkit/src/bkit-install.ts:670-678`
- **exploit scenario** — `removeOrphanTemplatesDir` does `fs.rmSync(orphanDir, { recursive: true, force: true })` whenever `<cwd>/.agents/templates/` exists, with no ownership/marker/manifest check. Pre-#160, `.agents/templates/` was the SOURCE location INSIDE the package (read FROM, never written TO a normal consumer's tree — verified against `main:.agents/scripts/bkit-modules.ts`, all refs are `path.join(PKG_ROOT, ".agents", "templates", ...)`). So a normal tarball consumer never had `.agents/templates/` in their own repo, and this is a no-op for them — the realistic blast radius is small. BUT: any consumer who happens to maintain their own unrelated `.agents/templates/` directory (e.g. their own templating convention under the agents namespace) would have it silently and irreversibly deleted on the next `bkit upgrade`, with only a one-line log. There is no guard that the directory is bkit-shipped content. The function is also only wired into the `upgrade` verb (line 750), NOT `install` — a consumer who bumps the package and runs `bkit install` (not `upgrade`) never gets the cleanup, so the orphan persists. (#160 task item 6 confirms this install-vs-upgrade asymmetry is by design.)
- **suggested fix** — gate the delete on evidence the dir is bkit-origin: e.g. only remove when it contains a known bkit sentinel (an `AGENTS.md`/`CLAUDE.md` template, or a marker), or scope the rm to bkit-known subpaths rather than the whole tree. At minimum, log the contents being removed (count/paths) so the destructive action is auditable rather than a silent one-liner.

### LOW — class: mechanical — isDogfood() is dead production code (exported + tested, never called)

- **file:line** — `.bkit/src/bkit-paths.ts:67-69`
- **exploit scenario** — `isDogfood()` is exported and covered by unit + integration tests, but `grep` across all of `.bkit/src/*.ts` (non-test) and `dist/*.js` shows it is never called by any production code path. The actual dogfood no-op in `runPayload` (bkit-install.ts:641) relies on `path.resolve(srcDir) === path.resolve(dstDir)`, NOT on `isDogfood()`. This means: (a) the tested heuristic is not the one that actually guards writes, so the dogfood-noop integration test asserts a function that production never invokes (false confidence); (b) the `getPkgRoot() === process.cwd()` heuristic, if ever wired in, would misfire for any consumer whose cwd coincidentally equals the resolved pkg root (e.g. a tool run from within `node_modules/@cbartens/bkit/`), but that risk is currently latent because nothing calls it.
- **suggested fix** — either wire `isDogfood()` into `runPayload`/dispatch as the single source of the dogfood guard (and keep the path-equality check as defense-in-depth), or remove the export + its tests if the path-equality guard is the intended mechanism. Decide which is canonical so the tested function matches the enforced behaviour.

### LOW — class: mechanical — doctor verb prints getTemplatesRoot() without guardTemplatesRoot()

- **file:line** — `.bkit/src/bkit-install.ts:711`
- **exploit scenario** — The `doctor` verb prints `Templates root: ${getTemplatesRoot()}` but never calls `guardTemplatesRoot()`. On a corrupt/partial package where `.bkit/templates/` is missing, doctor prints a non-existent path as if valid and continues the read-only scan, giving no signal that the package is broken. `guardTemplatesRoot` (bkit-modules.ts:199) is only invoked from `runCoreTemplates`, which the doctor path does not execute. This is a diagnostic-blind-spot, not a crash.
- **suggested fix** — call `guardTemplatesRoot(getTemplatesRoot(), LOG_PREFIX)` before/after printing in the doctor branch, or have doctor surface a "templates root missing" advisory instead of fail-loud (read-only scan should warn, not exit).

### LOW — class: architectural — guardTemplatesRoot only fires in runCoreTemplates; other module callsites silent-skip on missing root

- **file:line** — `.bkit/src/bkit-modules.ts:215` (only guard call) vs unguarded `getTemplatesRoot()` callsites at 581, 643, 668, 693, 768, 1248, 1358, 1541, 1759, 1864, 1941
- **exploit scenario** — `guardTemplatesRoot` is called once, inside `runCoreTemplates`. The claude/cursor/lint/git-hooks/renovate/dependabot/ci module passes each call `getTemplatesRoot()` and then rely on per-file `fs.existsSync(specificSrc)` checks — if the templates root is missing, those checks return false and the module silently installs nothing rather than failing loud. In practice this is masked because `resolveModules` always injects `core` (bkit-cli.ts:27) and `core` dispatches first (MODULE_DISPATCH_ORDER[0]), so the guard fires before any module pass — a missing root aborts at core. The residual risk is purely structural: the fail-loud invariant depends on (a) core always being present and (b) core always running first; if either changes, the other modules degrade to silent no-ops.
- **suggested fix** — hoist `guardTemplatesRoot(getTemplatesRoot())` to the top of `dispatchModules` (bkit-modules.ts:2136) so the guard is unconditional and order-independent, rather than implicitly coupled to core running first.

### Notes (verified NOT bugs)

- **Windows path-sep in upgrade filter (bkit-upgrade.ts:370 `relPath.startsWith(".agents" + path.sep)`)** — NOT a bug. `relPath` is built via `path.join` in `collectTemplates` (bkit-install.ts:795) → OS-native separators; the install-side mirror filter (bkit-modules.ts:469) uses `path.relative` → also OS-native. Both use `path.sep` consistently, so the filter matches on Windows. The filter is new in #160 (confirmed via `git diff main`) and correctly mirrors the install-path filter (preserve existing `.agents/` hashes, skip adding new ones); `.agents/.bkit-version` is covered by the `startsWith` prefix.
- **package.json files[] negation patterns** — verified via `npm pack --dry-run --json`: 0 test/integration-test/snapshot files ship; 16 `.bkit/src/*.ts` source files ship (intended, matches pre-#160 `.agents/scripts/*.ts` behaviour).
- **ESM .js import extensions** — all relative imports in `.bkit/src/*.ts` use `.js` (grep clean). Typecheck passes (`tsc --noEmit` exit 0).
- **dist/ in sync** — `dist/bkit-paths.js` reflects `.bkit/src` subpath + `.bkit/templates` root; `bin` -> `./dist/bkit-install.js` (correct).
- **Test suites** — bkit-paths/dogfood/rules-sync/templates-content (45) + modules/install/upgrade/preflight/uninstall (300) all green.

<!-- verdict:start -->

Verdict: CONCERNS
Findings: 5 (CRITICAL: 0, HIGH: 0, MEDIUM: 2, LOW: 3)

<!-- verdict:end -->
