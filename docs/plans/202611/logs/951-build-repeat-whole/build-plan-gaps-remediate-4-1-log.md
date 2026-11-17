Verdict: PASS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 13 fixed threshold — lowerVerifyMaxAttempts now skips any install recorded after 6.1.1 (LAST_RELEASE_WITHOUT_VERIFY_CAP), plus a 6.1.2-recorded test (not red until the package version is bumped past 6.1.2) (.bkit/core/engine/install/modules/core.ts)
DONE — Gap 2: TASK 13 plan wording says once, on the upgrade to this release (docs/plans/202611/951-build-repeat-whole-plan.md lines 94, 172, 230, 452)
DONE — Group gate: not run per caller instruction; core.integration.test.ts 157 passed, pnpm build and pnpm bkit:generate exit 0
