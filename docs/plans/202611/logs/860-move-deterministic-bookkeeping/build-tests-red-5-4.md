Enforced: true
Red: 0
Accepted: 0
Updated: 0
Gaps: 2

<!-- verdict:end -->

# Tests Red — group 5, attempt 4

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resolves a pending ledger intent after its invocation is stale" | vacuous | "resolves a pending ledger intent after its invocation is stale" passes at its red, so it proves nothing |
| 17 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "refuses to re-append a partly landed block after a foreign writer appended" | vacuous | "refuses to re-append a partly landed block after a foreign writer appended" passes at its red, so it proves nothing |

## Gaps

- TASK 14 `.bkit/core/engine/ledgers/journal.integration.test.ts` "resolves a pending ledger intent after its invocation is stale" `vacuous` — "resolves a pending ledger intent after its invocation is stale" passes at its red, so it proves nothing
- TASK 17 `.bkit/core/engine/ledgers/journal.integration.test.ts` "refuses to re-append a partly landed block after a foreign writer appended" `vacuous` — "refuses to re-append a partly landed block after a foreign writer appended" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts

[test-timeout-budget] load average 28.3 on 10 cores: unit limits 18650ms per test, 37300ms per hook (x3.73)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (20 tests) 33855ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 456ms
     ✓ writes no friction row for a declared routing exit 661ms
     ✓ skips a call made outside the run's worktree 620ms
     ✓ writes nothing when no run is active in the cwd 553ms
     ✓ a call launched from a git hook writes no engine-call row 1452ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1364ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 905ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 559ms
     ✓ completes missing subagent attribution before a real append 545ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 356ms
   ✓ replay-safe ledger appends on real files (6)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 769ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2857ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 711ms
     ✓ resolves a pending ledger intent after its invocation is stale 816ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 498ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 530ms
   ✓ persistent CI handoff on a real local remote (2)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 15427ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 2174ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 2360ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  12:36:28
   Duration  36.38s (tests 94%, transform 2%, import 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-zgXpGY/junit.xml
```
