Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/825-show-progress-bar-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress normal debug attempts span runs" | red | failure: expected 'Progress: ██████░░░░ 64% · Step 7/11 …' to be 'Progress: ██████░░░░ 64% · Step 7/11 …' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress reuses saved soak counter on later completions" | red | failure: expected 'Progress: ███░░░░░░░ 27% · Step 3/11 …' to be 'Progress: ███░░░░░░░ 27% · Step 3/11 …' // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress challenge budget follows round rather than report attempt" | red | failure: expected 'Progress: ███████░░░ 69% · Step 11/16…' to be 'Progress: ███████░░░ 69% · Step 11/16…' // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/progress.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/progress.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/progress.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/progress.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar

 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests | 3 failed) 2220ms
   ❯ workflow progress command wiring (12)
     ✓ progress uses saved cross-run soak attempts and grants 45ms
     ✓ progress refuses contextless or mismatched numeric gates 38ms
     ✓ progress reads fresh plan groups 39ms
     ✓ progress resumes from saved run 45ms
     ✓ progress loop attempts and grants 249ms
     ✓ progress specialized completion producers 844ms
     ✓ progress accepts the ship base-check regression guard gate 46ms
     ✓ progress gate only completions 154ms
     × progress normal debug attempts span runs 72ms
     × progress reuses saved soak counter on later completions 69ms
     × progress challenge budget follows round rather than report attempt 56ms
     ✓ progress excludes noncompletions 563ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/progress.integration.test.ts > workflow progress command wiring > progress normal debug attempts span runs
AssertionError: expected 'Progress: ██████░░░░ 64% · Step 7/11 …' to be 'Progress: ██████░░░░ 64% · Step 7/11 …' // Object.is equality

Expected: "Progress: ██████░░░░ 64% · Step 7/11 Failure Remediate · Attempt 2 of 3"
Received: "Progress: ██████░░░░ 64% · Step 7/11 Failure Remediate"

 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts:583:38
    581|     expect(result.code).toBe(0);
    582|     expect(result.json.row).toMatchObject({ step: "debug-failure-remed…
    583|     expect(result.json.progressLine).toBe(
       |                                      ^
    584|       "Progress: ██████░░░░ 64% · Step 7/11 Failure Remediate · Attemp…
    585|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/progress.integration.test.ts > workflow progress command wiring > progress reuses saved soak counter on later completions
AssertionError: expected 'Progress: ███░░░░░░░ 27% · Step 3/11 …' to be 'Progress: ███░░░░░░░ 27% · Step 3/11 …' // Object.is equality

Expected: "Progress: ███░░░░░░░ 27% · Step 3/11 Run Tests · Attempt 4 of 6"
Received: "Progress: ███░░░░░░░ 27% · Step 3/11 Run Tests · Attempt 2 of 6"

 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts:605:38
    603|     expect(result.code).toBe(0);
    604|     expect(result.json.row).toMatchObject({ step: "debug-run-tests", a…
    605|     expect(result.json.progressLine).toBe(
       |                                      ^
    606|       "Progress: ███░░░░░░░ 27% · Step 3/11 Run Tests · Attempt 4 of 6…
    607|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/progress.integration.test.ts > workflow progress command wiring > progress challenge budget follows round rather than report attempt
AssertionError: expected 'Progress: ███████░░░ 69% · Step 11/16…' to be 'Progress: ███████░░░ 69% · Step 11/16…' // Object.is equality

Expected: "Progress: ███████░░░ 69% · Step 11/16 Build Challenge"
Received: "Progress: ███████░░░ 69% · Step 11/16 Build Challenge · Attempt 2 of 2"

 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts:625:38
    623|     expect(result.code).toBe(0);
    624|     expect(result.json.row).toMatchObject({ step: "build-challenge", a…
    625|     expect(result.json.progressLine).toBe("Progress: ███████░░░ 69% · …
       |                                      ^
    626|     expect(domainRows(cwd).filter((row) => row.step === "build-challen…
    627|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 9 passed (12)
   Start at  08:44:17
   Duration  2.54s (tests 90%, import 5%, transform 4%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-WrJoRp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
