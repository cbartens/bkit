Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 83ec9cb2e7f41661438afe165bc59647919c376127073d172eec3f117cdfa4c5
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 groups verified.

## Integration Gaps

0. Group 1's two hash writers and `bkit check` read one list: `dispatchModules` sets `ctx.renderedOutputs` from `listRenderedOutputs(process.cwd())`, the same `cwd` the core `.bkit/version` `postDispatch` hashes against, and `runUpgradeCommand` passes `listRenderedOutputs(process.cwd())` into `updateCanonicalHashesAfterUpgrade`'s `updated` list. The `.agents/` rule lives only in `mergeCanonicalHashes`, which both writers call. Group 2's install-doc row and `docs/testing.md` row describe group 1's behaviour as built, including the remediated missing-entry add, and TASK 6's `.bkit/version` is what group 1's engine writes (`node dist/cli.js check` exits 0 on it).

## Previously Attempted

- `build-plan-verify-1-1.md` (Group 1, PASS, tasks 1-4) and `build-plan-verify-2-1.md` (Group 2, PASS, tasks 5-6).
- `build-plan-verify-holistic-1-1.md` (Holistic attempt 1, CONCERNS, 2 gaps: install did not add a missing rendered entry when it wrote nothing else; the `docs/testing.md` row did not say the writers re-record rendered outputs). `build-plan-gaps-remediate-holistic-1-1-log.md` fixed both (commit c83c49e0e).

## Notes

- Both attempt-1 gaps are closed in the feature diff (`tmp/bkit-diff-1053-upgrade-leaves-stale.md`, which includes c83c49e0e):
  - Gap 1: `runCoreModule`'s `postDispatch` in `.bkit/core/engine/install/modules/core.ts` counts a missing rendered entry toward `hasNewEntries` only when `!dryRun`, so a real install adds it and `bkit check` (a dry run) does not fail on it, as the plan's Assumption requires. `dist/install/modules/core.js` carries the same change. `core.integration.test.ts` `adds a missing entry for a rendered output when the run writes nothing else` pins the add. No test pins the dry-run side; the code reads it directly, and no plan `DONE WHEN` or matrix row names such a test.
  - Gap 2: the `version-file.test.ts` row at `docs/testing.md:911` now says both hash writers re-record every rendered output from disk and that install adds a missing rendered entry.
- All six tasks meet their `DONE WHEN`. All nine `Derived Test Matrix` tests exist in the task that owns their row.
- Tests run by this verifier after the remediation, all passing: `core.integration.test.ts`, `check.integration.test.ts` (203 tests); `upgrade.integration.test.ts`, `modules/index.integration.test.ts`, `version-file.test.ts`, `version-file.integration.test.ts` (360 tests).
- TASK 6 re-checked in this repo: `.bkit/version` has 260 entries, no `.agents/` entry and no entry for a missing file. Only `.cursor/mcp.json`, `.mcp.json` and `package.json` differ from disk. `node dist/cli.js check` exits 0. `.bkit/install.md` differs from its source only by the managed-marker line.
- A scratch-consumer dogfood of the missing-entry case was denied by the permission system. The evidence for gap 1 is the passing test and the code. Attempt 1's dogfood of the Concrete Example still applies: the remediation only adds a write on a real run when an entry is missing.
- The remediation also changed `DETAILS.md` and `docs/capabilities.md`. Both changes are regenerated graph counts inside the `graphify` block, not hand edits.
- The new log line uses `${logPrefix}` (`[bkit-install]` / `[bkit-check]` / `[bkit-upgrade]`), as `docs/observability.md` L104 requires. No new error path was added.
- No test-first audit report was supplied to this step. The group audits `build-tests-green-1-1.md` and `build-tests-green-2-1.md` read `Enforced: true`, `Gaps: 0`, `Unproven: 0`.
- No decision records exist for this run.
- Both `Documentation Updates` rows are done. The full suite is not run here; the holistic gate covers it.

## Identified Gaps Log

None
