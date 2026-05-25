# Design Brainstorm & Ideas

Lens: Migration mechanics and risk — move sequence, dist/bin continuity, dogfood no-op preservation,
backward-compat for already-installed consumers, snapshot/test churn, staged vs big-bang rollout.
Byte-identical consumer output before/after is a hard requirement.

---

## Approach A — Alias-first, then rename (two-release staged migration) ⭐ Recommended

**Summary:** In release N, introduce `.bkit/` as a NEW location and make the engine read from
`.bkit/` when present, falling back to `.agents/` if not. Keep both trees identical. In release
N+1, drop `.agents/scripts/` and `.agents/templates/` from `files[]` and delete the fallback.
Consumer output is byte-identical throughout because the engine always writes the same payload;
only the source root changes.

**Complexity:** MEDIUM

**Extensibility:** The two-release shape cleanly separates "move source" from "stop shipping old
source". New modules added post-N+1 only need to know about `.bkit/`. Dogfood-mode no-op logic is
isolated to `getPkgRoot()` / `bkit-paths.ts` — one well-contained change.

**Risk:** The main failure mode is a consumer who upgrades to release N+1 while still having the old
`.agents/templates/` in their installed `node_modules` from a partially-cached install. The
fallback drop in N+1 would then hit the absent-root guard and corrupt the run. Mitigation: the
release N tarball ships BOTH trees; `pnpm install` always writes fresh; no partially-cached mix is
possible in practice.

Secondary risk: the `canonicalHashes` keys in `.agents/.bkit-version` are consumer-relative paths
(e.g. `.github/workflows/ci.yml`) and do NOT contain the template source path, so they do NOT need
migration. However, the `tier3Hashes` and `canonicalHashes` maps are keyed by consumer destination,
which is unchanged. No `.bkit-version` migration is needed.

**Maintenance:** After N+1 ships, the old `.agents/templates/` and `.agents/scripts/` directories
are gone from the repo; ongoing cost returns to LOW. The two-release window requires discipline to
not diverge the two trees during the overlap period (e.g. via a CI test that asserts they are byte-
identical).

**Existing-codebase friction:**

- `tsconfig.json` has `"rootDir": ".agents/scripts"` and `"include": [".agents/scripts/**/*.ts"]`.
  Moving source to `.bkit/src/` requires updating both and ensuring `outDir: "dist"` still resolves.
  The compiled output path (`dist/bkit-install.js`) and `bin.bkit` in `package.json` are unchanged,
  so no consumer re-config.
- `getPkgRoot()` in `bkit-paths.ts` detects whether it is running from `dist/` or `.agents/scripts/`
  by path suffix. After the move, the fallback arm (`scriptDir.endsWith('.agents/scripts')`) must
  add `.bkit/src` as an additional recognized suffix (or be rewritten to walk-up for `package.json`).
  The detection point is narrow and already isolated in `bkit-paths.ts`.
- `runPayload()` in `bkit-install.ts` hard-codes `path.join(PKG_AGENTS, "templates")` as the template
  root, and `runCoreModule()` in `bkit-modules.ts` uses `path.join(PKG_ROOT, ".agents", "templates")`.
  Every `path.join(PKG_ROOT, ".agents", "templates")` reference (7 call sites in `bkit-modules.ts`,
  2 in `bkit-install.ts`) becomes `path.join(PKG_ROOT, ".bkit", "templates")`.
- `files[]` in `package.json` currently ships `".agents"` (with test exclusions). Must change to
  `".bkit"` plus retain `".agents"` in release N only, then drop `".agents"` in N+1.
- All `.agents/scripts/` files, including the bkit-lint-no-tier-terms.ts CLI script, the
  `lint:no-tier-terms` npm script, and all vitest tests, move to `.bkit/src/`. Test files assert
  on paths like `.agents/templates/.github/workflows/ci.yml` (hardcoded in `bkit-templates.content.test.ts`,
  `bkit-release-workflow.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`).
  These 6+ path constants must be updated.
- The snapshot key in `__snapshots__/bkit-templates.content.test.ts.snap` embeds the string
  `"consumer CI template (.agents/templates/.github/workflows/ci.yml)"` — the describe-block label.
  Renaming the constant updates the describe label, which invalidates the snapshot key and forces a
  snapshot regeneration (safe, not a semantic change).
- `package.json` script `lint:no-tier-terms` references `tsx .agents/scripts/bkit-lint-no-tier-terms.ts`
  — must update path.
- `runPayload()` dogfood guard: `path.resolve(tplSrc) !== path.resolve(tplDst)` already handles the
  no-op correctly as long as the new source path resolves to the same directory when in the bkit repo.
  After moving templates to `.bkit/templates/`, the src is `<repo>/.bkit/templates` and the dst
  remains `<repo>/.agents/templates` — these are different, so the dogfood payload pass would become
  active and start copying `.bkit/templates/` into `.agents/templates/`. This is actually the desired
  behavior (`.bkit/` is SoT, `.agents/templates/` is a derived tree), but it introduces a new category
  of sync step in the bkit repo itself. See Dogfood section below.

**Move sequence (release N):**

1. `git mv .agents/scripts .bkit/src` — engine moves.
2. `git mv .agents/templates .bkit/templates` — payload moves.
3. Update `tsconfig.json` rootDir/include.
4. Update `bkit-paths.ts` getPkgRoot to recognize `.bkit/src` suffix.
5. Update all `path.join(PKG_ROOT, ".agents", "templates")` → `path.join(PKG_ROOT, ".bkit", "templates")`.
6. Update `runPayload()` to read from `.bkit/{workflows,prompts}` and `.bkit/templates`.
7. Update `package.json` files[], scripts, build paths.
8. Update all test path constants and regenerate snapshots.
9. Add CI gate: `pnpm bkit install --dry-run` diff must be empty on a clean consumer clone, before
   and after the release, proving byte-identical consumer output.

**Dogfood no-op after move:**

In the current layout, dogfood no-op works because `runPayload()` detects `src == dst` for
`.agents/workflows`, `.agents/prompts`, and `.agents/templates`. After moving the source to `.bkit/`,
the src paths become `.bkit/` subtrees while the dst paths remain `.agents/` subtrees — they differ,
so the payload pass becomes active in dogfood mode. This means running `pnpm bkit install` on the
bkit repo would copy `.bkit/templates/` into `.agents/templates/` and `.bkit/{workflows,prompts}/`
into `.agents/{workflows,prompts}/` on every install. Two options:

- Option A1: Accept the copy — `.bkit/` is SoT, `.agents/` becomes a generated mirror. This aligns
  with the issue's stated goal ("from `.bkit/` we copy into `.agents/`"). Delete `.agents/templates/`
  from version control and generate it via `bkit install` dogfood run. Downside: `.agents/templates/`
  becomes untracked, complicating PR reviews.
- Option A2: Extend the dogfood guard in `runPayload()` to detect when `pkgRoot == cwd` (running
  inside the bkit repo) and skip the copy. This preserves the current dogfood no-op behavior.
  The guard already exists implicitly via `path.resolve(src) == path.resolve(dst)`. After the move
  it would be an explicit `pkgRoot === cwd` check.

Option A2 is recommended for this approach to avoid the generated-file-in-git issue.

**Backward-compat for installed consumers:**

The `.agents/.bkit-version` schema keys (`tier3Hashes`, `canonicalHashes`) are all keyed by
consumer-relative destination paths, which are unchanged. No migration of existing `.bkit-version`
files is needed. The `upgrade` engine walks the template tree starting from `tplRoot`; after the
move, `tplRoot` points to `.bkit/templates/` inside the package, which is transparent to the consumer.

**Byte-identical consumer output verification:**

Gate: before merging, run `pnpm pack` in the bkit repo and `pnpm bkit install` in a clean consumer
clone (dogfood tarball per memory note). Capture the full file tree hash of installed files. Compare
before/after the migration commit. Any diff surfaces a regression. This can be automated as a CI
integration test.

---

## Approach B — Symlink bridge (no file moves, redirect only)

**Summary:** Keep all files in their current locations. Create `.bkit/` as a directory of symlinks
pointing into `.agents/scripts/` and `.agents/templates/`. Update `package.json` files[] to also
ship `.bkit/` (which npm will dereference when packing). Consumer sees identical output. Source
layout is surfaced under a new alias without any file moves.

**Complexity:** LOW (no file moves, no path constant changes)

**Extensibility:** Poor. The symlink bridge is a cosmetic rename that does not actually solve the
separation of concerns. New contributors still discover that templates live under `.agents/`. Over
time, as new template files are added under `.bkit/templates/` (forgetting the symlink), or as
symlinks are accidentally broken in a `git mv`, the bridge degrades silently. npm packs symlink
targets, not symlinks themselves, so consumer tarballs are fine, but git does not follow symlinks
when scanning files[], meaning `files: [".bkit"]` would not work as intended — npm's `files[]`
does traverse symlinks, but this is npm-version-dependent and fragile.

**Risk:** Symlinks in npm packages have historically been unreliable across platforms (Windows
`junction` vs Unix). The `pnpm pack` path may resolve them differently than `npm pack`. On Windows
without developer mode, `git mv` creates a regular file containing the symlink path, silently
breaking the redirect. The dogfood-mode detection in `getPkgRoot()` would need to be aware of the
symlink, or it would follow the symlink and resolve a different `scriptDir`.

**Maintenance:** The dual-tree illusion requires that every new file in `.agents/scripts/` or
`.agents/templates/` is accompanied by a matching symlink under `.bkit/`. This is error-prone and
cannot be enforced by CI without a dedicated lint rule. The bridge also does not free `.agents/` from
its triple-duty problem — it adds a fourth alias on top.

**Existing-codebase friction:** Near-zero for code changes. High operational friction: contributors
must understand the symlink indirection, CI runners on Windows require symlink permissions, and `git
log --follow` does not traverse symlinks across renames.

**Move sequence:** None. Create `.bkit/src -> .agents/scripts` and `.bkit/templates -> .agents/templates`
symlinks. Update `files[]` to include `.bkit`. Verify `pnpm pack` includes both targets.

**Byte-identical consumer output verification:** Trivially satisfied — same bytes, different path in
tarball. No new consumer paths are written; the engine still reads from `.agents/` internally.

---

## Approach C — Big-bang single-commit move with feature flag

**Summary:** One commit moves everything: `git mv .agents/scripts .bkit/src`,
`git mv .agents/templates .bkit/templates`, updates all path constants, tsconfig, package.json,
test paths, snapshots. Ships as a single major version bump. No release-N fallback.

**Complexity:** HIGH (all changes land at once)

**Extensibility:** Best long-term shape — clean separation from day one. No overlap period, no
dual-tree maintenance, no conditional fallback code. The codebase immediately reflects the intended
architecture.

**Risk:** The main failure mode is an error introduced during the mass-edit that goes undetected
because all verification tests are themselves being migrated at the same time. A broken path constant
in `bkit-modules.ts` that silently resolves to a non-existent directory causes `runCoreTemplates()`
to return early (the `if (!fs.existsSync(root)) return` guard), producing a consumer install with
missing files — and the test that would catch it has its path constant updated incorrectly in the
same commit. The bug passes CI and ships.

A secondary risk is backward compat for the upgrade engine. Consumers running `bkit upgrade` after
upgrading the package to the big-bang version will be reading `canonicalHashes` from their existing
`.bkit-version`. Those hashes are destination-keyed and do not encode the source path, so they are
fine. However, if the upgrade engine's template walk starts from the new `.bkit/templates/` root,
and the consumer's installed `.agents/templates/` is now a stale copy (last synced from the old
package), the upgrade sees correct candidates and the consumer sees correct output. No issue.

The subtler risk is the `runPayload()` dogfood guard, which in the current code relies on
`path.resolve(src) == path.resolve(dst)`. After the big-bang move, this guard fires only for
`.bkit/{workflows,prompts}` vs `.agents/{workflows,prompts}` — which are no longer the same path,
so the payload pass becomes active in dogfood. If the developer forgets to extend the guard before
running `pnpm bkit install` on the bkit repo post-move, they get a copy of `.bkit/templates/` into
`.agents/templates/`, which then gets committed as a source of truth violation.

**Maintenance:** Lowest ongoing cost post-ship. No fallback code paths. One canonical location for
every file.

**Existing-codebase friction:** All at once — tsconfig `rootDir`/`include`, 9+ path constants
across `bkit-modules.ts` and `bkit-install.ts`, 6+ test file path constants, one snapshot key
regeneration, `package.json` files[]/scripts/bin, `bkit-paths.ts` getPkgRoot detection, and the
dogfood guard in `runPayload()`. Estimated ~40-60 lines of concrete code changes plus all test
constants. The churn is manageable for a maintainer who knows the codebase but dangerous to delegate
to an agent without granular verification steps for each constant.

**Move sequence:** Single PR. Order within PR: (1) move files via `git mv`, (2) update all
references, (3) update tests and regenerate snapshots, (4) run `pnpm build`, (5) run full test suite,
(6) dogfood tarball install in clean consumer dir, (7) verify byte-identical output. The `check:dist`
gate catches any compiled output drift.

**Byte-identical consumer output verification:** After `git mv` and reference update, run
`pnpm pack --dry-run` to confirm tarball contents include all template files under `.bkit/templates/`.
Then `pnpm bkit install` on a clean consumer clone. Compare all installed file hashes to a baseline
snapshot captured from the pre-migration tag using `sha256sum` across every file bkit writes.
Automated via a pre-merge integration test asserting zero diff between the before and after WriteSet.

---

## Decisions

| Decided                                                                                 | Alternatives                                      | Why                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approach A (two-release staged) recommended                                             | B (symlinks), C (big-bang)                        | Staged migration lets each phase be verified independently; byte-identical consumer output is confirmed by the release-N tarball before the fallback is dropped in N+1. Big-bang (C) creates a window where test infrastructure is being updated alongside production code, increasing the chance a silent regression ships. Symlinks (B) solve the naming problem cosmetically without addressing the structural one. |
| Dogfood guard extension (Option A2) over generated `.agents/templates/` (A1)            | Accept `.agents/templates/` as a generated mirror | Keeping `.agents/templates/` in version control ensures PR reviewers can see template changes in diffs; generated files in git confuse `git blame` and cause unnecessary churn on every `pnpm bkit install` run on the bkit repo itself.                                                                                                                                                                               |
| `getPkgRoot()` pattern extended, not replaced                                           | Walk-up-for-package.json alternative              | The existing suffix detection is one if-branch; adding `.bkit/src` as a recognized suffix is a two-line change with zero runtime overhead. Walk-up for `package.json` would be more robust but adds file-system calls to every engine invocation.                                                                                                                                                                      |
| No `.bkit-version` schema migration needed                                              | Add a migration step                              | `canonicalHashes` and `tier3Hashes` keys are consumer-relative destination paths, which are unchanged by the source relocation. No consumer `.bkit-version` file encodes any source path.                                                                                                                                                                                                                              |
| Snapshot regeneration accepted as part of the move                                      | Guard against snapshot key changes                | The snapshot key change is cosmetic (describe label contains the old path). Regenerating snapshots via `pnpm test -- --update-snapshots` is one command and the diff is reviewable. Guarding against it would require keeping the old describe label, which is misleading.                                                                                                                                             |
| `package.json` ships `.bkit` only in N+1; ships both `.bkit` and `.agents` in release N | Ship only `.bkit` from day one                    | A consumer with cached release N-1 node_modules who runs `pnpm bkit install` with the N tarball still finds `.agents/` in their install because pnpm refreshes node_modules. The dual-ship in release N is purely a belt-and-suspenders guard against any edge case where the fallback arm is hit during the transition.                                                                                               |
