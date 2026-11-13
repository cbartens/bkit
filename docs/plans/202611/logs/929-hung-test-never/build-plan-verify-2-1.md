Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 3, 5
Loosened: `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after`
Fingerprint: c194025eb2bfa8acfa451827c11ccdbd04d72912aba43e23611aa441162c4914
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 3 satisfied: `scripts/ci/bkit-test-limits.mjs` carries the same bkit-only header as `scripts/ci/bkit-test-file.mjs` line 2, derives both helpers from `tierTimeouts(true).testTimeout`, and `node --test scripts/ci/bkit-test-limits.test.mjs` passes 2/2 (30000 ms / 30 s under `CI=true`).
- TASK 4 runner changes are all present and work: `runNode` / `runBats` in `scripts/ci/bkit-test-file.mjs`, the `named` stage of `scripts/gate/bkit-gate-changed.mjs`, the `bkit:test:awake` script in `package.json`, and `setup_suite()` in `tests/shell/setup_suite.bash` (30 under `CI`, else 180). Run here: `CI=true vitest run` of `bats-setup-suite.integration.test.ts` and `test-file-script.integration.test.ts` 18/18 pass; `node --test scripts/gate/bkit-gate-changed.test.mjs` 3/3; `pnpm bkit:test:awake` 21/21; `pnpm bkit:test:bats` 40/40, exit 0. The unplanned restructure of `scripts/harvest/bkit-harvest.test.mjs` (subtests under one root test so `--test-force-exit` does not end the run early) keeps all 58 test call sites and passes 62/62 under `bkit:test:file`; it removes no expectation.
- TASK 4 is held back by one gap: the plan marked `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` as CREATE, but the file already existed (added in fd8718146), and the tests step overwrote it. That deleted four existing guard tests that check `setup_suite.bash` keeps bats runs from flipping `core.bare` or writing a git identity into the real checkout. The test-first audit (`build-tests-green-2-1.md`) has no `Updated tests` section and did not catch this, because it treated the file as new. Logged as `test-loosened`, Fixable: true, so the tests step restores the deleted tests from origin/dev and keeps the new hang test.
- TASK 5 satisfied: the **Time limits** bullet at `docs/testing.md:556` names only files and flags that exist (`vitest.timeout-budget.ts`, `vitest.child-deadline.ts`, `scripts/ci/bkit-test-limits.mjs`, `tests/shell/setup_suite.bash`, `--test-timeout`, `--test-force-exit`, `BATS_TEST_TIMEOUT`); the three inventory rows name files that exist.
- Test-first audit: `Enforced: true`, 0 gaps, 0 unproven, no `Already landed` section.
- Every Derived Test Matrix row for tasks 3 and 4 is a TEST FIRST test in its task, and each passes. The plan has no `Documentation Updates` section. `docs/observability.md` is present; no task in this group adds error handling that needs logging.
- No decision records, earlier group 2 verify reports or remediation logs were supplied; `build-plan-current.md` is absent.

## Identified Gaps Log

1 gap.

TASK 4: `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after` — test-loosened: the tests step wrote this file as new (plan says CREATE) but it already existed at group start, so its 4 core.bare / git-identity guard tests (`CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare`, `clears every GIT_* variable, so the same init stays in the temp dir`, `fails the run when a test writes an identity into the checkout, and removes it`, `fails the run when a test sets core.bare in the checkout, and puts it back`) and their helpers were deleted; restore them from origin/dev and keep the new hang test — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 4: tests step overwrote an existing test file and deleted 4 guard tests
  **Severity:** HIGH · **Class:** test-loosened · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts:1` · **Round:** 1
  - **DONE WHEN:** the four core.bare / git-identity guard tests deleted from this file are restored from origin/dev next to the new hang test `a hanging bats test fails with timeout after`, and the file passes
  - **TEST FIRST:**
    - CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare
    - clears every GIT_* variable, so the same init stays in the temp dir
    - fails the run when a test writes an identity into the checkout, and removes it
    - fails the run when a test sets core.bare in the checkout, and puts it back
<!-- bkit:task 1 end -->
