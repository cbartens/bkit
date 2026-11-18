Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/819-build-pre-commit-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a staged dist file shadowed by a tab-named twin" | red | failure: expected +0 to be 1 // Object.is equality |
| 4 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a staged dist that matches the build only through a gitattributes filter" | red | failure: expected +0 to be 1 // Object.is equality |

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

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts (5 tests | 2 failed) 2834ms
   ❯ bkit-check-dist (5)
     ✓ passes for the staged tree with an unstaged engine edit beside it 651ms
     ✓ refuses a stale staged dist 521ms
     ✓ leaves the working tree's dist untouched 656ms
     × refuses a staged dist file shadowed by a tab-named twin 460ms
     × refuses a staged dist that matches the build only through a gitattributes filter 545ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > refuses a staged dist file shadowed by a tab-named twin
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:140:29
    138|       git(dir, "add", "dist");
    139|       const result = check(dir);
    140|       expect(result.status).toBe(1);
       |                             ^
    141|       expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    142|     },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > refuses a staged dist that matches the build only through a gitattributes filter
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:161:29
    159|       git(dir, "add", ".gitattributes", A, "dist");
    160|       const result = check(dir);
    161|       expect(result.status).toBe(1);
       |                             ^
    162|       expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    163|     },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 3 passed (5)
   Start at  16:08:38
   Duration  3.00s (tests 98%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Gvw33d/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
