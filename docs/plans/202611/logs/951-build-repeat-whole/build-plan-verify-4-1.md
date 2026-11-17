Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 14
Loosened: none
Fingerprint: d1304ec19458c8ab8693d32848ed0582804164e5231eca58247f9a46b8e3a704
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

- Judged against `build-diff-4-1.md` (commits `a87e5fcef`, `f6429e9a1`). No `build-decision-*.md` records exist.
- TASK 14 satisfied: `STATUS` in `.bkit/core/engine/commands/ci/push-gate.ts:46` carries `--no-renames`, used by both the full and the filtered `cleanHead` count; `dist/commands/ci/push-gate.js` rebuilt. `tests.test.ts` "a staged rename of code into a bookkeeping path records no receipt" passes; `push-gate.test.ts` and `husky-pre-push.integration.test.ts` also pass (157 tests).
- TASK 13 not satisfied (2 gaps below). Its planned test passes, `validCap` (`.bkit/core/engine/shared/settings.ts:246`) still accepts any integer >= 1, the `docs/migrations.md` row says "once", and `dist/install/modules/core.js` is rebuilt. The guard, though, compares the recorded `.bkit/version` against the installing version, so the migration fires again on every later version bump, which breaks the owner's "runs once per install" direction. The planned test covers only recorded == installing. The plan file's wording was not updated.
- The version pin is written in `postDispatch` after `seedCorePackageJsonScripts` (`core.ts:2011`), so on the first upgrade the guard still sees the old recorded version. That ordering is correct.
- Test-first audit (`build-tests-green-4-1.md`): Enforced true, Gaps 0, Unproven 0, no Updated tests or Already landed sections.
- `core.integration.test.ts` and `tests.test.ts` pass in full (323 tests) with `BKIT_TEST_SLOTS=2`.
- Docs loaded: `.agents/docs.md`, `docs/migrations.md`; `docs/testing.md` and `docs/observability.md` exist. No new error path needs logging.

## Identified Gaps Log

2 gaps.

- TASK 13: `lowerVerifyMaxAttempts` in `.bkit/core/engine/install/modules/core.ts:1605-1607` — the guard compares the recorded `.bkit/version` against `readInstallingVersion()`, a moving target, not against the release that ships the migration: an install recorded at a later release (e.g. 6.2.0) with `build.verify.maxAttempts: 3` is lowered to 2 again on its next version upgrade (`compareSemver("6.2.0", "6.2.1")` returns -1, so the function proceeds), and `bkit check` reports that write as drift in between. The migration runs once per version bump, not once per install; the guard needs a fixed threshold (run only when the recorded version is missing, unparseable or at or below 6.1.1, the last release without this change) plus a test with a recorded version newer than 6.1.1 but older than the installing one — Fixable: true
- TASK 13: `docs/plans/202611/951-build-repeat-whole-plan.md` lines 94, 172, 230 and 452 still say `bkit upgrade` lowers any `build.verify.maxAttempts` above 2, with no "once, on the upgrade to this release"; DONE WHEN requires the plan's wording to say so (only `docs/migrations.md` was updated) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 13: lowerVerifyMaxAttempts re-fires on every later version upgrade
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:1606` · **Round:** 1
  - **DONE WHEN:** lowerVerifyMaxAttempts runs only when the recorded .bkit/version is missing, unparseable or at or below 6.1.1 (a fixed threshold, the last release without this change), so an install recorded at a later release keeps a maxAttempts above 2 across later upgrades; a test with a recorded version newer than 6.1.1 but older than the installing version proves it
  - **TEST FIRST:**
    - .bkit/core/engine/install/modules/core.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 13: plan wording does not say the migration lowers the value once
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/951-build-repeat-whole-plan.md:94` · **Round:** 1
  - **DONE WHEN:** The plan's Edge Case row (line 94), Breaking Changes row (line 172), Assumption (line 230) and implementation note (line 452) say the migration lowers build.verify.maxAttempts once, on the upgrade to this release
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
