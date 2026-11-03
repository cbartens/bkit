Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 3

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" | passed-accepted | passes; accepted by the tests step: all active canonical push routes already satisfy the contract after rebase; the expected inventory now reflects dev's deliberate deletion. The focused file passes 31 cases with two unchanged conditional skips (tmp/724-group4-rebase-tests.log); file lint, Prettier check and scoped diff check pass. No production or plan file was edited. |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

[test-timeout-budget] load average 4.4 on 10 cores: unit limits 6700ms per test, 13400ms per hook (x1.34)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 68ms

 Test Files  1 passed (1)
      Tests  31 passed | 2 skipped (33)
   Start at  18:08:26
   Duration  316ms (tests 34%, transform 23%, import 22%, setup 19%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ujsAxs/junit.xml
```
