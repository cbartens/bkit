Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/951-build-repeat-whole-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since runs the changed gate on changed files and writes a test-run row" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since runs the --gate whole when bkit:gate:changed is undeclared" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since with no changed files writes a PASS row and runs nothing" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since counts failures from the changed gate's JUnit reports" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since refuses a sha that names no commit" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests.test.ts` "changed-since on a tests-lock wait exits 81 with no row and reports lockHolder" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "group gate runs the changed-files scope from GROUP_BASE" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "the remediate group gate runs the changed-files scope from GROUP_BASE" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "both group-gate sites re-derive GROUP_BASE before the changed-since gate" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "soak runs the changed-files gate" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrade lowers build.verify.maxAttempts above 2 to 2 and leaves 2 or less alone" | red | passed |

## Gaps

None.
