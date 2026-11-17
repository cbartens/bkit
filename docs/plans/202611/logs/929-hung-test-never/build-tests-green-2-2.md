Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives --test-timeout from the integration budget and --test-force-exit" | red-not-loaded | passed |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives the bats limit in whole seconds, 30 under CI" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` "node — a test awaiting a child that never exits fails within the limit" | red | passed |
| 4 | `scripts/gate/bkit-gate-changed.test.mjs` "passes the limit args to the node --test stage" | red | passed |
| 4 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" | vacuous | passed |

## Gaps

None.

## Unproven

- Task 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
