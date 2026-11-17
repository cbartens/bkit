Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 1, attempt 7

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" | vacuous | "distinguishes unreadable missing malformed and clean ledger coverage without writing" passes at its red, so it proves nothing |

## Gaps

- TASK 3 `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" `vacuous` — "distinguishes unreadable missing malformed and clean ledger coverage without writing" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts

[test-timeout-budget] load average 9.7 on 10 cores: unit limits 9350ms per test, 18700ms per hook (x1.87)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (22 tests) 16116ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 627ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 511ms
   ✓ replay-safe ledger appends on real files (7)
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2031ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 5279ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1072ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1352ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 2684ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  15:52:32
   Duration  16.41s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-j3klrJ/junit.xml
```
