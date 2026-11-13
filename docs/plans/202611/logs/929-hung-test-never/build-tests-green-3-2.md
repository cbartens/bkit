Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "stops a child that ignores SIGTERM at the remaining time" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "gives a file's afterEach child call the hook timeout after a test that used most of its time" | red | passed |

## Gaps

None.
