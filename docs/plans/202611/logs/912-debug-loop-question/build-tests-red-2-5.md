Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 5

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" | passed-accepted | passes; accepted by the tests step: the same test as Task 10, corrected by the owner-approved Fix now (decision 1); its second round is now a failing local gate with no JUnit report, so it passes against the existing runner |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

[test-timeout-budget] load average 2.3 on 10 cores: unit limits 5650ms per test, 11300ms per hook (x1.13)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ✓ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (8 tests) 22296ms
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 3517ms
     ✓ records the failed job count and reads an uncounted local round as unknown 2328ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 1816ms
     ✓ finishes the first CI evidence round of the second debug run 1061ms
     ✓ checks the complete selected CI fix sequence against green and red final runs 2833ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 4186ms
     ✓ preserves local and repro overrides across actual workflow command sequences 4886ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 1668ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  08:53:49
   Duration  22.37s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wsHO1t/junit.xml
```
