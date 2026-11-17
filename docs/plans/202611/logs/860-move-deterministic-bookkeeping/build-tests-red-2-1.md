Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" | passed-accepted | passes; accepted by the tests step: test passes before and after; the double cast was replaced by a plain object spread `writerProblem({ ...unavailable })`, every expectation unchanged; the planned red is the slop check on the cast, not a test failure. |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/telemetry.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/telemetry.test.ts

[test-timeout-budget] load average 4.7 on 10 cores: unit limits 6851ms per test, 13701ms per hook (x1.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (299 tests) 243ms

 Test Files  1 passed (1)
      Tests  299 passed (299)
   Start at  10:56:26
   Duration  361ms (tests 84%, setup 7%, import 6%, transform 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-JUSpGs/junit.xml
```
