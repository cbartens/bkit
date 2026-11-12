Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > all when every failing case also fails at base" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > some with the base-red and branch counts" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > none when each case passes, is absent, or its file is absent at base" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown with a reason when no case is base-red and one is undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > resolves from file, then a classname path, then one matching tracked basename" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > a classname matching two tracked basenames leaves the case undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > an untracked or outside-repo file attribute leaves the case undetermined" | red-not-loaded | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown when a red gate has no failing case" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > reports all from a local run at the merge-base" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failing file absent at the base commit is the branch's" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no JUnit report reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > an undeclared bkit:test:file reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failed base install reads unknown and removes the worktree" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > installs at base with --frozen-lockfile --prefer-offline" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > copies the worktreeCopy entries into the base checkout" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no origin/dev ref reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that writes no report reads unknown" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a missing required flag is a usage error" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a passing CI run at the exact base sha settles none without a local run" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a CI run that cannot settle the base falls back to the local run" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > adopt follows the run's runtimeWorktrees" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > worktreeInstall off reads unknown" | red | passed |

## Gaps

None.
