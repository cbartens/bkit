Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 2

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets while keeping its driver untouched" | passed-accepted | passes; accepted by the tests step: renamed from the old case with the contradictory single-line emit assertion dropped; the code already exists and satisfies it (driver has only the ternary form), so it passes now |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts

[test-timeout-budget] load average 11.8 on 10 cores: unit limits 10400ms per test, 20800ms per hook (x2.08)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ✓ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts (15 tests) 2317ms
   ✓ cursor gateguard — delete and shell advice (1)
     ✓ routes Cursor delete and shell targets while keeping its driver untouched 474ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  22:15:32
   Duration  2.47s (tests 98%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-YJ4hKq/junit.xml
```
