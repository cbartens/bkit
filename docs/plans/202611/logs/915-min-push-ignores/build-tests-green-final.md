Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/915-min-push-ignores-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns the text through the bkit:end line" | red | passed |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has no markers" | red | passed |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has two bkit:end lines" | red | passed |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has a second bkit:start line below bkit:end" | red | passed |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when bkit:end comes before bkit:start" | red | passed |
| 2 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits" | red | passed |
| 2 | `.bkit/core/engine/commands/land.test.ts` "runs docs/audits/202611/logs.md through its declared gate in the built checkout" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "exits 0 when an audit template changes only below its bkit:end, and says why" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below" | red | passed |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below" | red | passed |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > --update exits 0 when the update changes only an audit template's project section, and logs the template once" | red | passed |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > --update exits 1 and lists only the code file when a project-section edit ships beside a code file" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate" | red | passed |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate" | red | passed |
| 5 | `.bkit/core/engine/commands/ci/push-gate.test.ts` "a full-gate receipt carries an audit template's project-section increment to the minimum gate" | red | passed |
| 5 | `.bkit/core/engine/commands/land.test.ts` "runs an audit template's project-section change through bkit:gate:min" | red | passed |

## Gaps

None.
