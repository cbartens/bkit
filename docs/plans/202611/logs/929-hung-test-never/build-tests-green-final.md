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
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "stops a spawnSync with no timeout at the remaining time and names it" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "leaves an explicit timeout as the caller set it" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "limits execSync and execFileSync the same way" | red-not-loaded | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "uses at least 1ms when the limit has already passed" | red-not-loaded | passed |
| 2 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "fails a test whose spawnSync child hangs within the test's own timeout" | red | passed |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives --test-timeout from the integration budget and --test-force-exit" | red-not-loaded | passed |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives the bats limit in whole seconds, 30 under CI" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` "node — a test awaiting a child that never exits fails within the limit" | red | passed |
| 4 | `scripts/gate/bkit-gate-changed.test.mjs` "passes the limit args to the node --test stage" | red | passed |
| 4 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" | vacuous | passed |
| 6 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "stops a child that ignores SIGTERM at the remaining time" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "gives a file's afterEach child call the hook timeout after a test that used most of its time" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "keeps the body's child limit on the real clock when the test sets a future system time" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "stops a hung child at the test's timeout when the test sets a past system time" | red | passed |

## Gaps

None.

## Unproven

- Task 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
