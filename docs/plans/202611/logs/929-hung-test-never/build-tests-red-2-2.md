Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 2, attempt 2

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" | vacuous | "a hanging bats test fails with timeout after" passes at its red, so it proves nothing |

## Gaps

- TASK 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" `vacuous` — "a hanging bats test fails with timeout after" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts

[test-timeout-budget] load average 14.9 on 10 cores: unit limits 11950ms per test, 23900ms per hook (x2.39)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ✓ .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts (5 tests) 39556ms
   ✓ tests/shell/setup_suite.bash (4)
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 1400ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 3014ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 1515ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 1475ms
   ✓ a bats test's time limit (1)
     ✓ a hanging bats test fails with timeout after 32149ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  16:32:25
   Duration  40.22s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3oI22H/junit.xml
```
