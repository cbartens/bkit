Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4, 5
Loosened: none
Fingerprint: 00559b3df3d6781f8e49e3c857b55baec7bfb3c114e50ad3dfa0f2580d1c6089
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/929-hung-test-never/build-plan-verify-2-1.md` (attempt 1): CONCERNS, 1 gap. The tests step had overwritten `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` and deleted its 4 core.bare / git-identity guard tests (test-loosened, Fixable: true). That gap is closed in this attempt.

## Notes

- Since attempt 1 (commit e30a39240), only `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` changed in code (plus the plan's task 3 / 5 ticks and logs). The runner changes judged in attempt 1 are unchanged.
- Attempt 1 gap closed: `git diff origin/dev` on `bats-setup-suite.integration.test.ts` is now purely additive (a new `describe("a bats test's time limit")` block after line 108). The four guard tests are back at lines 80, 86, 92 and 102, with their helpers. `build-plan-tests-2-log.md` records the restoration.
- TASK 3 satisfied: `node --test scripts/ci/bkit-test-limits.test.mjs` passes 2/2; both helpers derive from `tierTimeouts(true).testTimeout` (30000 ms / 30 s under `CI=true`).
- TASK 4 satisfied: `runNode` / `runBats` in `scripts/ci/bkit-test-file.mjs`, the `named` stage of `scripts/gate/bkit-gate-changed.mjs`, the `bkit:test:awake` script in `package.json` and `setup_suite()` in `tests/shell/setup_suite.bash` all carry the limits. Run here: `CI=true node --test scripts/gate/bkit-gate-changed.test.mjs` 3/3; `CI=true vitest run` of `bats-setup-suite.integration.test.ts` and `test-file-script.integration.test.ts` 22/22 (the 18 from attempt 1 plus the 4 restored guard tests). Attempt 1 ran `pnpm bkit:test:awake` 21/21 and `pnpm bkit:test:bats` 40/40, and that code is unchanged.
- TASK 5 satisfied: the **Time limits** bullet at `docs/testing.md:556` and the three inventory rows name only files and flags that exist (unchanged since attempt 1).
- Test-first audit (`build-tests-green-2-2.md`): `Enforced: true`, 0 gaps, no `Updated tests` or `Already landed` section. Unproven, as the caller noted, so not a gap: Task 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after` (left `vacuous`, because it was restored after the code existed). The owner answers it once at the end of the build.
- Every Derived Test Matrix row for tasks 3 and 4 is a TEST FIRST test in its task, and each one passes. The plan has no `Documentation Updates` section. `docs/observability.md` is present, and no task in this group adds error handling that would need logging.
- No decision records and no group 2 remediation logs were supplied; `build-plan-current.md` is absent.

## Identified Gaps Log

None
