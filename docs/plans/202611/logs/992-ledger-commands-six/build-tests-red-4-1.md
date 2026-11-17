Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again" | red | failure: expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/journal.integration.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/journal.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/journal.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests | 1 failed) 9879ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 91ms
     ✓ writes no friction row for a declared routing exit 64ms
     ✓ skips a call made outside the run's worktree 86ms
     ✓ writes nothing when no run is active in the cwd 86ms
     ✓ a call launched from a git hook writes no engine-call row 523ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 289ms
     ✓ branches anchor-read with a plan --file journals into the active run 64ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 187ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 149ms
     ✓ completes missing subagent attribution before a real append 164ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 97ms
   ❯ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 194ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2016ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 204ms
     ✓ resolves a pending ledger intent after its invocation is stale 214ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 145ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 109ms
     ✓ prepares afresh when nothing landed and a foreign row followed 129ms
     × receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again 135ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 3212ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 472ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 682ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 570ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > replay-safe ledger appends on real files > receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:1075:29
    1073|       operation: "op-moved",
    1074|     });
    1075|     expect(replay.appended).toBe(0);
       |                             ^
    1076|     expect(replay.receipt).toMatchObject({ operation: "op-moved", repl…
    1077|     expect(fs.readFileSync(file, "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 22 passed (23)
   Start at  07:08:50
   Duration  10.09s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-V7PT3Z/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
