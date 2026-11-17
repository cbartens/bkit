Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 3, attempt 2

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/steps.test.ts`: fix the test until it lints clean (output below) |

## Gaps

- TASK 5 `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/steps.test.ts`: fix the test until it lints clean (output below)

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

.bkit/core/engine/commands/workflow/steps.test.ts:2287:26: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2307:9: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2307:13: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2308:29: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2308:55: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2318:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2319:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2335:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2336:7: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
.bkit/core/engine/commands/workflow/steps.test.ts:2318:28: error vitest(no-conditional-expect): Unexpected conditional expect help: Avoid calling `expect` conditionally
.bkit/core/engine/commands/workflow/steps.test.ts:2319:27: error vitest(no-conditional-expect): Unexpected conditional expect help: Avoid calling `expect` conditionally
.bkit/core/engine/commands/workflow/steps.test.ts:2335:28: error vitest(no-conditional-expect): Unexpected conditional expect help: Avoid calling `expect` conditionally
.bkit/core/engine/commands/workflow/steps.test.ts:2336:27: error vitest(no-conditional-expect): Unexpected conditional expect help: Avoid calling `expect` conditionally
 ELIFECYCLE  Command failed with exit code 1.
```
