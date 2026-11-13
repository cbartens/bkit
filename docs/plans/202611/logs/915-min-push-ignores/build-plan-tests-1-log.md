Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns the text through the bkit:end line`
WROTE — TASK 1: `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has no markers`
WROTE — TASK 1: `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has two bkit:end lines`
WROTE — TASK 1: `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has a second bkit:start line below bkit:end`
WROTE — TASK 1: `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when bkit:end comes before bkit:start`
WROTE — TASK 2: `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits`
WROTE — TASK 2: `.bkit/core/engine/commands/land.test.ts` `runs docs/audits/202611/logs.md through its declared gate in the built checkout`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `exits 0 when an audit template changes only below its bkit:end, and says why`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below`
WROTE — TASK 3: `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below`
WROTE — TASK 4: `.bkit/core/engine/commands/ci/ci.test.ts` `--update exits 0 when the update changes only an audit template's project section, and logs the template once`
WROTE — TASK 4: `.bkit/core/engine/commands/ci/ci.test.ts` `--update exits 1 and lists only the code file when a project-section edit ships beside a code file`
WROTE — TASK 4: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate`
WROTE — TASK 4: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate`
WROTE — TASK 5: `.bkit/core/engine/commands/ci/push-gate.test.ts` `a full-gate receipt carries an audit template's project-section increment to the minimum gate`
WROTE — TASK 5: `.bkit/core/engine/commands/land.test.ts` `runs an audit template's project-section change through bkit:gate:min`
SOURCE — TASK 3: log output via ctx.log (err) and outside list from .bkit/core/engine/commands/ci/ci.ts:610-640
