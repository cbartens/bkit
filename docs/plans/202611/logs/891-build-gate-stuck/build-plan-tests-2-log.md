Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 4: JunitCase shape (name, state, classname, file, message, detail) from .bkit/core/engine/commands/workflow/junit.ts:58
SOURCE — TASK 4: per-case row shape {name, file, atBase: red | pass | absent | unknown} and verdict counts from docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md:425
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > all when every failing case also fails at base`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > some with the base-red and branch counts`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > none when each case passes, is absent, or its file is absent at base`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > unknown with a reason when no case is base-red and one is undetermined`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > resolves from file, then a classname path, then one matching tracked basename`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > a classname matching two tracked basenames leaves the case undetermined`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `caseFile > an untracked or outside-repo file attribute leaves the case undetermined`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests-base.test.ts` `baseVerdict > unknown when a red gate has no failing case`
SOURCE — TASK 5: gate-fixture install args file and exit codes from tests/fixtures/gates/pnpm.cjs:18-33
SOURCE — TASK 6: gh stub run/jobs fixture shape from tests/fixtures/gh/runs/green-capstone.json:1 and tests/fixtures/gh/jobs/1001.json:1
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > reports all from a local run at the merge-base`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failing file absent at the base commit is the branch's`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > no JUnit report reads unknown`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > an undeclared bkit:test:file reads unknown`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a failed base install reads unknown and removes the worktree`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > installs at base with --frozen-lockfile --prefer-offline`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > copies the worktreeCopy entries into the base checkout`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > no origin/dev ref reads unknown`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a base file run that writes no report reads unknown`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a missing required flag is a usage error`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a passing CI run at the exact base sha settles none without a local run`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > a CI run that cannot settle the base falls back to the local run`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > adopt follows the run's runtimeWorktrees`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` `bkit tests base > worktreeInstall off reads unknown`
