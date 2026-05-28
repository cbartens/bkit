Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan 1 of 4: WS-1 resolver-seam consolidation + WS-2 baseline capture).

## Sub-Plans Verified

None (Single scope — only `160-centralise-install-code-plan-1.md`).

## Integration Gaps

None (Single scope — no cross-sub-plan integration verified at this stage).

## Previously Attempted

None (attempt 1; no prior verify or remediate logs found).

## Notes

All 7 WS-1 tasks, all 5 WS-2 tasks, and both gates (Gate WS-1, Gate WS-2) verified against the live codebase. Every plan checkbox for runbook tasks is already `[x]` and each `Done when` criterion is satisfied.

WS-1 (resolver seam, pre-move):

- WS1-T1: `BKIT_SRC_SUBPATH` exported in `bkit-paths.ts:17` (value `.agents${path.sep}scripts` — OLD form, correct for pre-move); `getPkgRoot()` derives its suffix check from it (`bkit-paths.ts:44`).
- WS1-T2: `getTemplatesRoot()` (`bkit-paths.ts:57-59`, joins `.agents/templates`) and `isDogfood()` (`bkit-paths.ts:68-70`, `getPkgRoot() === process.cwd()`) both exported; unit tests assert `getTemplatesRoot()` ends with `.agents/templates` and `isDogfood()` semantics.
- WS1-T3: header comment (`bkit-paths.ts:19-39`) enumerates all THREE run-contexts (dist / tsx-from-source / packed tarball); no two-context-only wording remains.
- WS1-T4: `runPayload()` (`bkit-install.ts:627-628`) obtains `PKG_ROOT` from `getPkgRoot()`; inline suffix walk deleted — no `scriptDir.endsWith(...scripts)` remains in `bkit-install.ts` (remaining `.endsWith` hits are `.md` filters). Workflows/prompts arm keeps `src === dst` skip (`bkit-install.ts:641`).
- WS1-T5: fail-loud `guardTemplatesRoot()` (`bkit-modules.ts:199-204`) emits `[bkit-modules] Templates root not found at <path> — package corrupt?` + `process.exit(1)`; called by `runCoreTemplates` (`bkit-modules.ts:216`). Path-agnostic unit test (`bkit-modules.test.ts:311-352`) injects `/tmp/bkit-guard-test-nonexistent-root-xyz123` — NO hard-coded `.agents/templates` literal in the guard assertions.
- WS1-T6: `bkit-dogfood-noop.integration.test.ts` exists, 4 tests, asserts zero writes to `.agents/` via mtime snapshot when `isDogfood()`; runs in tsx-from-source context.
- WS1-T7: `bkit-paths.test.ts` exists, 9 tests, three named run-context assertions (dist arm explicitly asserted, tsx-from-source, packed-tarball node_modules layout).
- Gate WS-1: `pnpm test` = 31 files / 1137 passed (2 skipped, 1 todo); `pnpm build` exit 0; `pnpm check:dist` exit 0 (dist/ in sync, not stale). All 3 new test files confirmed discovered by `vitest list`. Tree still at `.agents/` — no `.bkit/` directory exists.

WS-2 (baseline capture, all four artifacts committed under `baseline/`):

- WS2-T2: `baseline/bkit-version-hashes.json` — `pinnedVersion 2.8.4`, `tier3Hashes` + canonical hashes present.
- WS2-T3: `baseline/agents-tree.txt` — 123-line recursive consumer-tree listing.
- WS2-T4: `baseline/pack-filelist.txt` — 240 entries; `.agents/templates` (56) and `.agents/scripts` (16) still ship pre-move.
- WS2-T5: `baseline/stale-consumer-setup.md` — single artifact naming the exact deterministic construction step (install WS-1-state tarball `tmp/cbartens-bkit-2.8.4.tgz` then `bkit install`) for the D1 orphan-removal input.
- Gate WS-2: all four artifacts committed (clean `git status` under `baseline/`); captured from packed tarball per WS2-T1; no `git mv` has run (no `.bkit/` directory).

The two human-confirmation checkboxes (Acceptance Scenario line 106, Breaking Changes line 140) and the two human gates within Gate 1 (lines 194-195) remain `[ ]` by design — they require explicit human review and are NOT gated at this build/verify step per task instructions. Not counted as failures.

## Identified Gaps Log

None.
