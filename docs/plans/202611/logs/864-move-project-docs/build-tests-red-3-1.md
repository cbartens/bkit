Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/checks/after/tools.test.ts` "keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace" | passed-accepted | passes; accepted by the tests step: detectProjectDocs already resolves indexed equivalents and skips out-of-tree targets (task 5 code) |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/tools.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/tools.test.ts

[test-timeout-budget] load average 7.1 on 10 cores: unit limits 8051ms per test, 16101ms per hook (x1.61)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ✓ .bkit/core/engine/checks/after/tools.test.ts (37 tests) 45ms

 Test Files  1 passed (1)
      Tests  37 passed (37)
   Start at  07:50:39
   Duration  154ms (tests 49%, setup 23%, import 13%, transform 12%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-j6aoIb/junit.xml
```
