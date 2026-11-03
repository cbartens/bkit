Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/package-json.test.ts` "bkit's root package.json wraps every test-running bkit:gate script in the tests lock" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every tests run call site routes exit 81 to a re-run of its block" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 11 `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" — passed at the group's red, and the tests step accepted it: all active canonical push routes already satisfy the contract after rebase; the expected inventory now reflects dev's deliberate deletion. The focused file passes 31 cases with two unchanged conditional skips (tmp/724-group4-rebase-tests.log); file lint, Prettier check and scoped diff check pass. No production or plan file was edited.; no red is due
