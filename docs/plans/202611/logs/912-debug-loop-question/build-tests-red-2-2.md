Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 2

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/status.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/status.test.ts

[test-timeout-budget] load average 7.3 on 10 cores: unit limits 8150ms per test, 16300ms per hook (x1.63)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/ledgers/status.test.ts (16 tests | 1 failed) 10ms
   ❯ CI evidence selection contract (2)
     ✓ validates atomic CI and local selections with stable evidence identities 1ms
     × validates failedJobCount as a positive whole number outside the identity 2ms
   ✓ fold — event log → run array (7)
     ✓ folds a single run, step-done appends to the open run 0ms
     ✓ preserves multiple phase runs in one log (design → plan → build) 0ms
     ✓ attaches step-done to the latest run of its workflow across two runs of the same phase 0ms
     ✓ de-dupes identical lines (union duplication) — keeps one 0ms
     ✓ orders interleaved (union-shuffled) lines by `at` 0ms
     ✓ fold reads an old subPlan row as its group 0ms
     ✓ merges workflow-meta onto the run (debugAttempt) 0ms
   ✓ appendLine (1)
     ✓ serializes one event as a newline-terminated JSON line 0ms
   ✓ engine-action rows (4)
     ✓ key joins its parts with /, an absent part as -; hash is sha256 hex 0ms
     ✓ records a row and finds it only by the same key and hash 1ms
     ✓ skips malformed lines 0ms
     ✓ the fold ignores them 0ms
   ✓ ledger operation receipts (1)
     ✓ preserves tracker changed-hash actions while rejecting ledger operation collisions 1ms
   ✓ CI handoff events (1)
     ✓ preserves handoff events across status folding and rejects stale CI selection 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/status.test.ts > CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/ledgers/status.test.ts:92:70
     90|     expect(validateCiSelection(selection)).toBe(true);
     91|     expect(validateCiSelection({ ...selection, failedJobCount: 2 })).t…
     92|     expect(validateCiSelection({ ...selection, failedJobCount: 0 })).t…
       |                                                                      ^
     93|     expect(validateCiSelection({ ...selection, failedJobCount: -1 })).…
     94|     expect(validateCiSelection({ ...selection, failedJobCount: 1.5 }))…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  22:48:56
   Duration  139ms (transform 44%, setup 24%, import 18%, tests 12%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZufEnF/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
