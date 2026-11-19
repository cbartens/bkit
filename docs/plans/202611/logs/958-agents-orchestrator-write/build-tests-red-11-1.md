Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 6

<!-- verdict:end -->

# Tests Red — group 11, attempt 1

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 38 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |
| 39 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |
| 40 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |
| 41 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |
| 42 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |
| 43 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | lint | bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below) |

## Gaps

- TASK 38 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)
- TASK 39 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)
- TASK 40 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)
- TASK 41 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)
- TASK 42 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)
- TASK 43 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" `lint` — bkit:lint:file exited 1 on `.bkit/core/engine/commands/workflow/decisions.test.ts`: fix the test until it lints clean (output below)

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

.bkit/core/engine/commands/workflow/decisions.test.ts:1550:21: error vitest(no-conditional-in-test): Avoid having conditionals in tests. help: Replace conditionals with separate test cases for each branch to keep tests deterministic and easy to understand.
 ELIFECYCLE  Command failed with exit code 1.
```
