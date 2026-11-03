Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run whose every filter is an existing test file is light and takes no lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run with no filters, or a pattern filter, is heavy and takes the tests lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run started under a live tests-lock owner takes no lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "CI=true takes no lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "CI=1 takes no lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "BKIT_TEST_WORKERS sets maxWorkers when present" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a watch-mode run takes no lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup waits for a held tests lock and takes it once the holder ends" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup throws naming the holder when the wait gives up" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup's teardown frees the tests lock" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` did not load: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-test-lock.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-test-lock.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-test-lock.test.ts [ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts ]
Error: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.test.ts
 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts:3:1
      1| import { describe, expect, it, vi } from "vitest";
      2|
      3| import { testLockDecision, testWorkers } from "../../../../../vitest.t…
       | ^
      4|
      5| const files = new Set(["src/a.test.ts", "src/b.integration.test.ts"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  10:53:59
   Duration  103ms (setup 76%, transform 16%, worker 8%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-A6mfwS/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts [ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts ]
Error: Cannot find module '../../../../../vitest.test-lock' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test/.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts
 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts:9:1
      7| import { afterEach, beforeEach, describe, expect, it, vi } from "vites…
      8|
      9| import setup from "../../../../../vitest.test-lock";
       | ^
     10| import { tierTimeouts } from "../../../../../vitest.timeout-budget";
     11|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  10:54:00
   Duration  86ms (setup 77%, transform 15%, worker 7%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KXNLLc/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
