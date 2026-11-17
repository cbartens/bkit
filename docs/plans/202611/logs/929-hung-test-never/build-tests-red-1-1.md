Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "stops a spawnSync with no timeout at the remaining time and names it" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` did not load: Cannot find module '../../../../../vitest.child-deadline.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "leaves an explicit timeout as the caller set it" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` did not load: Cannot find module '../../../../../vitest.child-deadline.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "limits execSync and execFileSync the same way" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` did not load: Cannot find module '../../../../../vitest.child-deadline.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts |
| 1 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "uses at least 1ms when the limit has already passed" | red-not-loaded | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` did not load: Cannot find module '../../../../../vitest.child-deadline.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts |
| 2 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "fails a test whose spawnSync child hangs within the test's own timeout" | red | failure: RUN v5.0.5 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-CBR8nJ : expected Error: spawnSync /Users/christian/Documen… { …(5) } to be undefined |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts

[test-timeout-budget] load average 23.8 on 10 cores: unit limits 16400ms per test, 32800ms per hook (x3.28)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts [ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts ]
Error: Cannot find module '../../../../../vitest.child-deadline.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:9:1
      7| import * as childProcess from "node:child_process";
      8| import { describe, expect, it } from "vitest";
      9| import { withChildDeadline } from "../../../../../vitest.child-deadlin…
       | ^
     10|
     11| function wrapped(remainingMs: () => number) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  13:18:12
   Duration  518ms (setup 78%, transform 17%, worker 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tSUKkw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

[test-timeout-budget] load average 23.5 on 10 cores: unit limits 16250ms per test, 32500ms per hook (x3.25)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts (1 test | 1 failed) 25031ms
   × fails a test whose spawnSync child hangs within the test's own timeout 25029ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts > fails a test whose spawnSync child hangs within the test's own timeout
AssertionError: 
 RUN  v5.0.5 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-CBR8nJ

: expected Error: spawnSync /Users/christian/Documen… { …(5) } to be undefined

- Expected:
undefined

+ Received:
Error {
  "message": "spawnSync /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/vitest ETIMEDOUT",
  "errno": -60,
  "code": "ETIMEDOUT",
  "syscall": "spawnSync /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/vitest",
  "path": "/Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/vitest",
  "spawnargs": [
    "run",
    "--root",
    "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-CBR8nJ",
    "--config",
    "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-CBR8nJ/vitest.config.mjs",
  ],
}

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts:39:29
     37|   );
     38|   const output = `${run.stdout}${run.stderr}`;
     39|   expect(run.error, output).toBeUndefined();
       |                             ^
     40|   expect(Date.now() - started).toBeLessThan(20_000);
     41|   expect(run.status).not.toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  13:18:16
   Duration  25.51s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-kqc1zj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
