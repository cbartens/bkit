Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/819-build-pre-commit-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "passes for the staged tree with an unstaged engine edit beside it" | red | failure: expected 1 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a stale staged dist" | red | failure: expected 'node:internal/modules/cjs/loader:1503…' to contain '[bkit] dist/ is stale — run pnpm buil…' |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "leaves the working tree's dist untouched" | red | failure: node:internal/modules/cjs/loader:1503 throw err; ^ Error: Cannot find module '/Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit/scripts/gate/bkit-check-dist.mjs' at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15) at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27) at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10) at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12) at Module._load (node:internal/modules/cjs/loader:1285:25) at wrapModuleLoad (node:internal/modules/cjs/loader:255:19) at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5) at node:internal/main/run_main_module:33:47 { code: 'MODULE_NOT_FOUND', requireStack: [] } Node.js v24.16.0 : expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/check-dist.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/check-dist.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts (3 tests | 3 failed) 3272ms
   ❯ bkit-check-dist (3)
     × passes for the staged tree with an unstaged engine edit beside it 1298ms
     × refuses a stale staged dist 754ms
     × leaves the working tree's dist untouched 1215ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > passes for the staged tree with an unstaged engine edit beside it
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:105:29
    103|       const result = check(dir);
    104|       expect(result.stderr + result.stdout).not.toContain("dist/ is st…
    105|       expect(result.status).toBe(0);
       |                             ^
    106|     },
    107|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > refuses a stale staged dist
AssertionError: expected 'node:internal/modules/cjs/loader:1503…' to contain '[bkit] dist/ is stale — run pnpm buil…'

- Expected
+ Received

- [bkit] dist/ is stale — run pnpm build and commit the result
+ node:internal/modules/cjs/loader:1503
+   throw err;
+   ^
+
+ Error: Cannot find module '/Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit/scripts/gate/bkit-check-dist.mjs'
+     at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
+     at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
+     at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
+     at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
+     at Module._load (node:internal/modules/cjs/loader:1285:25)
+     at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
+     at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
+     at node:internal/main/run_main_module:33:47 {
+   code: 'MODULE_NOT_FOUND',
+   requireStack: []
+ }
+
+ Node.js v24.16.0
+

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:115:43
    113|     const result = check(dir);
    114|     expect(result.status).not.toBe(0);
    115|     expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
       |                                           ^
    116|   });
    117|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > leaves the working tree's dist untouched
AssertionError: node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '/Users/christian/Documents/GitHub/bkit/.worktrees/819-build-pre-commit/scripts/gate/bkit-check-dist.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.16.0
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:126:42
    124|     const before = readDist(dir);
    125|     const result = check(dir);
    126|     expect(result.status, result.stderr).toBe(0);
       |                                          ^
    127|     expect(readDist(dir)).toEqual(before);
    128|     expect(scratchLeftovers(dir)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed (3)
   Start at  14:32:45
   Duration  3.89s (tests 92%, setup 4%, transform 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OoZoId/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
