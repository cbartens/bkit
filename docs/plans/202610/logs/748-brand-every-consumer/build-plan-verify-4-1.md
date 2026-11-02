Verdict: PASS
Failures: 0
Fixable: false
Tasks: 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`; judged against `build-diff-4-1.md` (commits eb14b9115 tests, 25c06ea5d code). The brief has no `Deviations` section.
- TASK 9: `migrateBrandedCheckNames` in `.bkit/core/engine/install/modules/core.ts` rewrites only the exact shipped `name:` lines (cloud `context` / `claude` / `opencode`, `Renovate`, `Trivy`), inserts a job `name:` under `  renovate:` / `  trivy:` only when absent, replaces the byte-identical old `bkit-stub:health` block in `ciWorkflowPath(".")` with the current template block (`{{DEFAULT_BRANCH}}` filled from `tokens.DEFAULT_BRANCH`), logs one line per renamed check with the branch-protection fix, and pushes `unhashed: true` writes. Called by `runBkitDocs`. The signature carries one extra optional `defaultBranch` parameter; compatible with the planned call. The old stub text is the same in every `v*` tag (one distinct hash across 17 tags), so the single `OLD_HEALTH_STUB` constant covers every release. `cloud.ts` advisories at lines 57, 113 and 166 carry the brand-migration exception; no test pins those strings (`rg` over `*.test.ts` found none), so "tests pinning them updated" has nothing to update. `upgrade.integration.test.ts` `does not rewrite a consumer-owned .github/renovate.json5` seeds `name: Renovate (ours)` and passes. `docs/migrations.md` row "Branded check names" present.
- TASK 10: `SHIPPED_HOUSE_RULE_HASHES` recomputed independently (every `v*` tag x `.agents/templates/...` and `.bkit/templates/.vale/styles/House/<rule>.yml`): 3 distinct sha256 per rule, all 12 identical to the committed constants. `migrateValeHouseStyle` matches the planned behaviour (move when absent, `console.warn` with the manual `mv` and toggle rename, `.vale.ini` toggle and `BasedOnStyles` rewrite, no `.vale.ini` write when absent, silent without `.vale/`, removed paths pushed `{ action: "write", unhashed: true }`). Called by `runBkitDocs`. `docs/migrations.md` row "Vale style `House` -> `Bkit`" present.
- Tests: the 11 planned `TEST FIRST` tests plus the renovate.json5 test pass (13 matched, 0 failed). Full `install/modules/` + `upgrade.integration.test.ts` run: 466 passed. Full `vitest run`: 216 files, 8682 passed, 2 skipped, 0 failed. `tsc --noEmit` clean. `dist/install/modules/core.js` carries both new functions and the hash table.
- Every `Derived Test Matrix` row for Tasks 9 and 10 maps to a `TEST FIRST` test in its task. All tests are real-filesystem / real-CLI integration tests (no mocks of the unit under test; only `console` is spied).
- Test-first audit `build-tests-green-4-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests`, `Already landed` or `delete-still-referenced` entries to decide.
- `build-decision-1-1.md` concerns group 3 (Tasks 7 and 8); it accepts no group 4 gap.
- The group diff also refreshes the installed copies `.bkit/README.md`, `.bkit/templates.md`, `.bkit/version` hashes and the generated `docs/capabilities.md`; these follow earlier source edits (Tasks 6, 7) and the graph refresh, and are not group 4 gaps.

## Identified Gaps Log

None
