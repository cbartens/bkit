Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 2, attempt 3

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" | vacuous | "resolves an indexed equivalent without a missing default warning" passes at its red, so it proves nothing |

## Gaps

- TASK 5 `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" `vacuous` — "resolves an indexed equivalent without a missing default warning" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/tools.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/tools.test.ts

[test-timeout-budget] load average 22.5 on 10 cores: unit limits 15750ms per test, 31500ms per hook (x3.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ✓ .bkit/core/engine/checks/after/tools.test.ts (37 tests) 116ms

 Test Files  1 passed (1)
      Tests  37 passed (37)
   Start at  09:27:19
   Duration  453ms (tests 38%, transform 27%, setup 24%, import 9%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-INB25s/junit.xml
```
