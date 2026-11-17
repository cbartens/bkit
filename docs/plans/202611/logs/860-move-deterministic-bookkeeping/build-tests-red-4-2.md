Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 2

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/tools/instructions.test.ts` "renders one recovery precedence contract for all hosts and tracker adapters" | passed-accepted | passes; accepted by the tests step: it passes because the group's code is built; the correction only gives it the corpus time budget |

## Gaps

None.

## Lint output — `.bkit/core/engine/tools/instructions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/tools/instructions.test.ts

```

## Runner output — `.bkit/core/engine/tools/instructions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/tools/instructions.test.ts

[test-timeout-budget] load average 22.4 on 10 cores: unit limits 15700ms per test, 31400ms per hook (x3.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ✓ .bkit/core/engine/tools/instructions.test.ts (102 tests) 16822ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 6172ms
     ✓ sync has nothing left to rewrite 3924ms
     ✓ every clause reaches the cut-off of one surface it applies to 667ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 5792ms

 Test Files  1 passed (1)
      Tests  102 passed (102)
   Start at  18:10:30
   Duration  16.99s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QxV9s8/junit.xml
```
