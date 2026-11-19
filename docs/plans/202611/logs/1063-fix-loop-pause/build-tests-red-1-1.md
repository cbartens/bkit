Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1063-fix-loop-pause-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "a not-run gate then a red gate has no trend" | red | failure: expected '0 → 34' to be '? → 34' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "a gate that ran and counted 0 reads 0 beside a not-run round that reads ?" | red | failure: expected '0 → 0' to be '? → 0' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "a verify round whose gate did not run adds no gate failures" | red | failure: expected '0 → 3' to be '? → 3' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "a red gate then a verify round with no gate run has no trend" | red | failure: expected 'closing' to be 'unknown' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "a clean holistic verify with no gate row stays a round of the open loop" | red | failure: expected [ 3 ] to deeply equal [ 1, 2, 3 ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/counters.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/counters.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts (89 tests | 5 failed) 5666ms
   ✓ bkit counters derive (12)
     ✓ next = count + 1, current = count, count = count 7ms
     ✓ current refuses 0 (the step's own row is missing); count allows it 3ms
     ✓ counts only the active run: a fresh run starts at attempt 1 2ms
     ✓ counters isolate by group 5ms
     ✓ rejects an empty or non-integer --group instead of silently counting every group 4ms
     ✓ a decision row never resets the count, and --since is refused 3ms
     ✓ de-dupes: distinct parentSha = two attempts, byte-identical replay = one 5ms
     ✓ treats a step name with shell metacharacters as data 5ms
     ✓ exits 3 on a missing file and 2 on an unknown position 1ms
     ✓ counts only DONE rows: a FAILED row is not an attempt 6ms
     ✓ a build resumed after an interleaved finished debug run keeps its run and its budget 8ms
     ✓ a paused run keeps counting after another workflow's run interleaves 3ms
   ✓ bkit counters run (6)
     ✓ is 1 before any run, and stays the same across the run's own start row 4ms
     ✓ is n+1 after a finished run, and a resume keeps its number 5ms
     ✓ an interleaved debug run leaves the paused build run in progress 6ms
     ✓ is n+1 after a FAILED run too 4ms
     ✓ counts only this workflow's runs; a union-merge duplicate is one run 3ms
     ✓ exits 3 on a missing file 0ms
   ✓ bkit counters route (10)
     ✓ continues at the cap and below 1ms
     ✓ exits 1 one over the cap, naming the counter on stderr 0ms
     ✓ a max of 0 lets value 0 through and stops value 1 0ms
     ✓ refuses value "" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "abc" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "1.5" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "-1" (exit 2, nothing on stdout) 0ms
     ✓ refuses an empty or non-integer max with nothing on stdout 1ms
     ✓ takes the max from an ask point with --point 47ms
     ✓ needs exactly one of --max and --point 0ms
   ✓ bkit counters route --of (6)
     ✓ derives the value from the active run's DONE rows of the step 8ms
     ✓ counts one group's rows with --group 2ms
     ✓ exits 4 when :current finds the step's own row missing 1ms
     ✓ sums the DONE rows of several steps with <step>,<step>:count 2ms
     ✓ refuses a step list off :count, a repeated step, or an empty list entry 2ms
     ✓ needs exactly one of --value and --of, and --file with --workflow for --of 2ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 1126ms
     ✓ reads ask and the limit from bkit.workflows 92ms
     ✓ an invalid limit or ask takes its default 62ms
     ✓ takes the limit the run froze at its start, not package.json's live value 3ms
     ✓ reads package.json when the run froze no limit for the point 131ms
     ✓ holistic fix rounds count within the run without a reset 386ms
     ✓ build.holistic falls back to the package.json setting when the run's frozen limits lack it 143ms
     ✓ max --point takes the run's frozen limit with --file and --workflow, else package.json 110ms
     ✓ a headless run never asks 95ms
   ✓ bkit counters grant (4)
     ✓ grants one more full allowance at the used-up limit, and route counts it 389ms
     ✓ grants nothing below the limit, and nothing when nobody can agree 232ms
     ✓ a grant raises only the loop it was given for 164ms
     ✓ counts grants of the active run only, unless --all-runs 151ms
   ✓ bkit counters progress (19)
     ✓ reports a falling count as closing and recommends another round 45ms
     ✓ loop progress prints the same nextStrategy as status route 46ms
     ✓ reports the same count as stuck and a rising count as worse 70ms
     ✓ leaves codeChanged null when git cannot compare the rounds 35ms
     ✓ judges codeChanged on source only, from the rounds' parent commits 555ms
     ✓ a round with no count reports unknown and no recommendation 52ms
     ✓ does not compare a CI round with a local gate round 8ms
     ✓ compares the last round with the earliest round of the same scope 61ms
     ✓ measures minutesPerRound over all rounds, not only the compared same-scope ones 45ms
     ✓ reports each round's scope 2ms
     ✓ judges codeChanged between the compared same-scope rounds 489ms
     ✓ trendLine names an unknown count instead of claiming no fewer failures 26ms
     ✓ trendLine says the rounds ran different tests 2ms
     ✓ a scope with a line break adds no line to the loop question 3ms
     ✓ trendLine for a fall without a code change says no source code changed 463ms
     ✓ trendLine for the same count states both counts 34ms
     ✓ trendLine prefers different scopes over a missing count 5ms
     ✓ --since-clean over unscoped holistic rounds still compares them 32ms
     ✓ exits 3 on a missing file 0ms
   ❯ loopProgress with a gate (7)
     ✓ adds the group gate's failing tests to each verify round 33ms
     ✓ a red gate row with no failure count makes the round unknown 38ms
     ✓ a red gate row with 0 counted failures makes the round unknown 36ms
     × a verify round whose gate did not run adds no gate failures 52ms
     × a not-run gate then a red gate has no trend 35ms
     × a gate that ran and counted 0 reads 0 beside a not-run round that reads ? 33ms
     × a red gate then a verify round with no gate run has no trend 32ms
   ✓ loopProgress with the holistic gate (2)
     ✓ holistic loop progress adds the holistic gate's failing tests to each round 30ms
     ✓ a clean holistic verify whose gate is red stays a round of the open loop 32ms
   ❯ loopProgress with the holistic gate and no gate row (1)
     × a clean holistic verify with no gate row stays a round of the open loop 6ms
   ✓ loopTrend (2)
     ✓ a fall without a code change is stuck, not closing 1ms
     ✓ a missing count is unknown, not stuck 0ms
   ✓ bkit counters max (2)
     ✓ returns one point's limit and ask setting, or every point as set 100ms
     ✓ refuses an unknown point 2ms
   ✓ bkit counters rows (5)
     ✓ counts rows of the type since the active run's workflow-started row 6ms
     ✓ an engine-action row between counted rows is not counted 2ms
     ✓ a resumed run does not inherit a crashed run's rows (no workflow-finished between) 2ms
     ✓ route --rows derives the value from typed rows of the active run 4ms
     ✓ starts at 1 on a fresh run, and refuses a bad position or a missing log 2ms
   ✓ bkit counters correction (2)
     ✓ shares correction budget across candidate operations and honors specific limits 6ms
     ✓ refuses a reused correction candidate id with different rows 3ms
   ✓ bkit counters --since-clean retired from route and grant (2)
     ✓ route refuses --since-clean as an unknown flag 4ms
     ✓ grant refuses --since-clean as an unknown flag 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a verify round whose gate did not run adds no gate failures
AssertionError: expected '0 → 3' to be '? → 3' // Object.is equality

Expected: "? → 3"
Received: "0 → 3"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1237:31
    1235|     ]);
    1236|     const r = progress(file);
    1237|     expect(r.json.gateCounts).toBe("? → 3");
       |                               ^
    1238|     expect(r.json.counts).toBe("0 → 3");
    1239|     expect(r.json.trend).toBe("unknown");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a not-run gate then a red gate has no trend
AssertionError: expected '0 → 34' to be '? → 34' // Object.is equality

Expected: "? → 34"
Received: "0 → 34"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1264:31
    1262|     ]);
    1263|     const r = progress(file);
    1264|     expect(r.json.gateCounts).toBe("? → 34");
       |                               ^
    1265|     expect(r.json.trend).toBe("unknown");
    1266|     expect(r.json.recommend).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a gate that ran and counted 0 reads 0 beside a not-run round that reads ?
AssertionError: expected '0 → 0' to be '? → 0' // Object.is equality

Expected: "? → 0"
Received: "0 → 0"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1285:31
    1283|     ]);
    1284|     const r = progress(file);
    1285|     expect(r.json.gateCounts).toBe("? → 0");
       |                               ^
    1286|     expect(r.json.rounds[1].gateFailures).toBe(0);
    1287|     expect(r.json.rounds[0].gateFailures).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a red gate then a verify round with no gate run has no trend
AssertionError: expected 'closing' to be 'unknown' // Object.is equality

Expected: "unknown"
Received: "closing"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1304:26
    1302|     ]);
    1303|     const r = progress(file);
    1304|     expect(r.json.trend).toBe("unknown");
       |                          ^
    1305|     expect(r.json.recommend).toBeNull();
    1306|     expect(r.json.trendLine).not.toMatch(/closing/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with the holistic gate and no gate row > a clean holistic verify with no gate row stays a round of the open loop
AssertionError: expected [ 3 ] to deeply equal [ 1, 2, 3 ]

- Expected
+ Received

  [
-   1,
-   2,
    3,
  ]

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1416:44
    1414|       "build-holistic-gate",
    1415|     );
    1416|     expect(p.rounds.map((r) => r.attempt)).toEqual([1, 2, 3]);
       |                                            ^
    1417|   });
    1418| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 84 passed (89)
   Start at  13:16:53
   Duration  6.91s (tests 86%, transform 7%, import 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-htmdjG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
