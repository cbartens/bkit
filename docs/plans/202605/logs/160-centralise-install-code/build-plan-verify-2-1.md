Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

Single (one sub-plan — sub-plan 2, WS-3 + WS-5).

## Sub-Plans Verified

None (Single scope — only `160-centralise-install-code-plan-2.md`).

## Integration Gaps

None (Single scope — integration is verified holistically in Sub-Plan 3).

## Previously Attempted

None — first verification attempt for sub-plan 2 (no prior `build-plan-verify-2-*` or `build-plan-gaps-remediate-2-*` logs).

## Notes

LARGE DIFF mode (8810 insertions across 160 files, mostly zero-delta `git mv` renames). Full diff coverage achieved for the load-bearing files (no partial-coverage flag needed): the move is overwhelmingly renames; the substantive engine edits are concentrated in `bkit-paths.ts`, `bkit-install.ts`, `bkit-modules.ts`, `bkit-preflight.ts`, `bkit-uninstall.ts`, `tsconfig.json`, `vitest.config.ts`, `package.json`, all of which were read in full or targeted-grepped.

VERIFIED PASSING (10 of 12 runbook items + WS5-T1):

- WS3-T1: `.bkit/src/` (48 files inc. `bkit-install.ts`) and `.bkit/templates/.agents/rules.md` exist; `.agents/scripts` and `.agents/templates` removed; git tracks the moves.
- WS3-T2: `BKIT_SRC_SUBPATH = .bkit/src`; `getTemplatesRoot()` → `.bkit/templates` (sole literal); `dist/` arm of `getPkgRoot()` untouched; 3-context `bkit-paths.test.ts` + dogfood-noop + fail-loud guard tests all green (in the 1138).
- WS3-T3: all 19 template `path.join` lookups route through `getTemplatesRoot()`; the only residual `path.join(cwd,".agents","templates")` is the intentional D1 consumer-orphan target at `bkit-install.ts:671`.
- WS3-T4: dead `runPayload` templates arm gone (no `tplSrc`/`tplDst`/`mirrorDirAlways`-block residue; `mirrorDirAlways` survives only as its own helper fn).
- WS3-T5: `removeOrphanTemplatesDir(cwd, dryRun)` exists (bkit-install.ts:670-678), dry-run aware, no-op when absent, called in upgrade path (line 750); tests green.
- WS3-T7: `vitest.config.ts` globs → `.bkit/src/**`; vitest discovered 31 files / 1141 tests (non-zero).
- WS3-T9: `.bkit/templates/gitignore` exists dot-less; `NPM_STRIP_REMAP` unchanged.
- WS3-T10: test path-constants re-pointed; `pnpm test` green; residual `.agents.{0,2}templates` test-file hits are dest-layout-describing or the renovate-template `ignorePaths` assertions (Sub-Plan 4 scope).
- WS3-T11: consumer-facing error at `bkit-modules.ts:1266` now reads `.bkit/templates/.github/workflows/ci.yml`; engine comments re-pointed (13 `.bkit/(src|templates)` refs now present); remaining `.agents/templates` source comments are D1-consumer-orphan or pre-move-history documentation. `COPY_EXCLUDE` retains `"scripts"` (cosmetic — permitted by the `Done when`).
- WS5-T1: `bkit doctor` prints `[bkit-doctor] Templates root: ${getTemplatesRoot()}` (bkit-install.ts:711); `bkit-doctor.integration.test.ts:104` asserts it.
- Build: `pnpm build` exit 0. Tests: `pnpm test` = 31 files, 1138 passed / 2 skipped / 1 todo, 0 failures.

FAILING / UNCHECKED:

- WS3-T6 + Gate WS-3: `check:dist` RED (stale committed `dist/bkit-install.js`) — see GAP-1. BLOCKING.
- WS3-T8: `files[]` portion correct (`dist`,`.bkit`,`.agents`,README,CHANGELOG + re-targeted `!.bkit/src/*` exclusions), but its literal `Done when` cites a non-existent `lint:no-tier-terms` script/file — see GAP-3 (plan-grounding artifact). The `lint:prose` reference to `.agents/templates/docs` is a separate coverage regression — see GAP-2.

Verdict FAIL because GAP-1 blocks the CI `check:dist` gate that Gate WS-3 explicitly requires green. Remediation is mechanical (`pnpm build` + commit dist); GAP-2 (lint:prose re-point) is bundled into the same remediation loop.

## Identified Gaps Log

3 gaps (1 blocking FAIL, 1 CONCERN, 1 INFO/plan-grounding).

GAP-1 [FAIL, blocking] WS3-T6 / Gate WS-3 — `check:dist` is RED. Committed `dist/bkit-install.js` is stale vs a fresh `tsc`. The committed dist wraps `const pkgVersion = JSON.parse(...).version` across two lines, but `tsc` from the final committed `.bkit/src/bkit-install.ts` (which now calls `getPkgRoot()` instead of the old `pkgRoot` local) emits it on a single line. `dist/` is in `.prettierignore`, so this is not a prettier artifact — the committed dist was generated from an intermediate source state and never regenerated from the final source. `pnpm check:dist` exits 1 with "[bkit] dist/ is stale". `check:dist` is CI-gated (.github/workflows/ci.yml:86, release.yml:58). FIX: run `pnpm build` and commit the regenerated `dist/bkit-install.js`.
GAP-2 [CONCERN] WS3-T8 / Gate WS-3 — `lint:prose` in package.json:43 still calls `find .agents/templates/docs -name "*.md"`. The template docs moved to `.bkit/templates/docs/` (19 md files on origin/dev), so this find now returns nothing and those 19 template docs are silently dropped from vale prose linting. This does NOT fail CI (missing dir → empty find → vale lints fewer files, no error) but is a real prose-lint coverage regression. The plan's WS3-T8 grounding note claimed lint:prose needs no change "because it does NOT reference .agents/scripts" — but it DOES reference `.agents/templates/docs`. FIX: re-point to `.bkit/templates/docs`.
GAP-3 [INFO, plan-grounding artifact, not a build gap] WS3-T8 / WS3-T11 reference a `lint:no-tier-terms` script (package.json line 43) pointing at `.agents/scripts/bkit-lint-no-tier-terms.ts`, and WS3-T11 lists re-pointing that file's usage comments. Neither the script nor the file `bkit-lint-no-tier-terms.ts` exists on origin/dev or in this branch — the plan grounded against a stale snapshot. Vacuously satisfied (nothing to re-point). No remediation needed; WS3-T8's substantive `files[]` change IS correctly applied. WS3-T8 left unchecked only because its literal `Done when` cites the non-existent script path.

<!-- verdict:start -->

Verdict: FAIL
Failures: 1

<!-- verdict:end -->
