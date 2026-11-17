Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the changed gate on changed files and writes a test-run row`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the --gate whole when bkit:gate:changed is undeclared`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since with no changed files writes a PASS row and runs nothing`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since counts failures from the changed gate's JUnit reports`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since refuses a sha that names no commit`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since on a tests-lock wait exits 81 with no row and reports lockHolder`
SOURCE — TASK 6: lock give-up line format from .bkit/core/engine/commands/lib.ts:171
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `group gate runs the changed-files scope from GROUP_BASE`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the remediate group gate runs the changed-files scope from GROUP_BASE`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `both group-gate sites re-derive GROUP_BASE before the changed-since gate`
WROTE — TASK 8: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `soak runs the changed-files gate`
WROTE — TASK 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrade lowers build.verify.maxAttempts above 2 to 2 and leaves 2 or less alone`
