Enforced: true
Verdict: null
Gaps: 2
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/951-build-repeat-whole-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/shared/settings.test.ts` "build.holistic defaults to ask true, max 2" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "holistic fix rounds count within the run without a reset" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "build.holistic falls back to the package.json setting when the run's frozen limits lack it" | red | passed |
| 1 | `.bkit/core/engine/install/modules/core.integration.test.ts` "install seeds a build.holistic block and keeps an existing one" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "last clean holistic base is the newest zero-failure row" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "a holistic row with gaps does not move the base" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "holistic base falls back to origin/dev with no clean row" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "a clean holistic row from an earlier run does not set the base" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "holistic base falls back to origin/dev when the clean sha is no longer an ancestor of HEAD" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "holistic verify takes its test base from Context" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` "holistic rounds route and grant on build.holistic within the run" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "--loop=holistic names build holistic in the attempt line" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` "holistic report and fix log names carry the run number" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/counters.test.ts` "route refuses --since-clean as an unknown flag" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/counters.test.ts` "grant refuses --since-clean as an unknown flag" | red | passed |
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
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a passing required push gate records a receipt" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a passing required push gate with only bookkeeping uncommitted records a receipt" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a failing required push gate leaves the failed marker" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "uncommitted code blocks the receipt until it is committed" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "only the required push gate records a receipt" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a tests-lock wait records no receipt and the re-run after the lock frees does" | red | passed |
| 11 | `.bkit/core/engine/commands/ci/push-gate.test.ts` "a new branch with only bookkeeping after a receipted ancestor takes the minimum gate" | red | passed |
| 13 | `.bkit/core/engine/install/modules/core.integration.test.ts` "a verify limit set above 2 after this release's upgrade is kept and bkit check reports no drift" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a staged rename of code into a bookkeeping path records no receipt" | red | passed |

## Gaps

- Task 5 `delete-still-referenced` — DELETE `SINCE_CLEAN_FLAG` in `.bkit/core/engine/commands/workflow/counters.ts` is still referenced: `docs/decisions.jsonl:849` — Fixable: null — log: TASK 5: delete-still-referenced — Fixable: null
- Task 5 `delete-still-referenced` — DELETE `sinceCleanStep` in `.bkit/core/engine/commands/workflow/counters.ts` is still referenced: `docs/decisions.jsonl:849` — Fixable: null — log: TASK 5: delete-still-referenced — Fixable: null
