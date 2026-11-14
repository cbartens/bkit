Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 3

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires only for a hook without merge-tree" | passed-accepted | passes; accepted by the tests step: owner accepted the group 2 edit on 2026-11-14 (its up-to-date hook sample gains the PUSH_BRANCH_SHA= line so it agrees with Task 8's test); recorded through tests red because the BLOCKED escape is not read yet (#914) |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/catalogue.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/catalogue.test.ts

[test-timeout-budget] load average 31.7 on 10 cores: unit limits 20350ms per test, 40700ms per hook (x4.07)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (66 tests) 742ms

 Test Files  1 passed (1)
      Tests  66 passed (66)
   Start at  16:11:28
   Duration  1.63s (tests 53%, transform 21%, import 21%, setup 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ccfglh/junit.xml
```
