Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 3, attempt 3

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/install/modules/core.integration.test.ts`: fix the test until it lints clean (output below) |

## Gaps

- TASK 13 `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/install/modules/core.integration.test.ts`: fix the test until it lints clean (output below)

## Lint output — `.bkit/core/engine/install/modules/core.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/core.integration.test.ts

.bkit/core/engine/install/modules/core.integration.test.ts:2648:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/install/modules/core.integration.test.ts:2649:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/install/modules/core.integration.test.ts:2649:11: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/install/modules/core.integration.test.ts:2651:19: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/install/modules/core.integration.test.ts:2651:19: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
 ELIFECYCLE  Command failed with exit code 1.
```
