Enforced: true
Red: 12
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "loopTrend > a missing count is unknown, not stuck" | red | failure: expected 'stuck' to be 'unknown' // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > a round with no count reports unknown and no recommendation" | red | failure: expected { Object (rounds, counts, ...) } to match object { counts: '5 → ?', …(2) } (6 matching properties omitted from actual) |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > --loop=verify with an uncounted group gate reads unknown" | red | failure: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Trend: unknown' |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > does not compare a CI round with a local gate round" | red | failure: expected { Object (rounds, counts, ...) } to match object { trend: 'unknown', recommend: null } (7 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > compares the last round with the earliest round of the same scope" | red | failure: expected { rounds: [ { …(3) }, …(2) ], …(8) } to match object { trend: 'closing', …(1) } (7 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > reports each round's scope" | red | failure: expected [ undefined, undefined ] to deeply equal [ 'ci:123', null ] |
| 2 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > judges codeChanged between the compared same-scope rounds" | red | failure: expected { rounds: [ { …(3) }, …(2) ], …(8) } to match object { codeChanged: false, trend: 'stuck' } (7 matching properties omitted from actual) |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures" | red | failure: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine says the rounds ran different tests" | red | failure: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for a fall without a code change says no source code changed" | red | failure: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine for the same count states both counts" | red | failure: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string |
| 3 | `.bkit/core/engine/commands/workflow/counters.test.ts` "bkit counters progress > trendLine prefers different scopes over a missing count" | red | failure: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/counters.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/counters.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/counters.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts (80 tests | 13 failed) 949ms
   ✓ bkit counters derive (12)
     ✓ next = count + 1, current = count, count = count 2ms
     ✓ current refuses 0 (the step's own row is missing); count allows it 1ms
     ✓ counts only the active run: a fresh run starts at attempt 1 1ms
     ✓ counters isolate by group 1ms
     ✓ rejects an empty or non-integer --group instead of silently counting every group 1ms
     ✓ a decision row never resets the count, and --since is refused 1ms
     ✓ de-dupes: distinct parentSha = two attempts, byte-identical replay = one 1ms
     ✓ treats a step name with shell metacharacters as data 1ms
     ✓ exits 3 on a missing file and 2 on an unknown position 1ms
     ✓ counts only DONE rows: a FAILED row is not an attempt 1ms
     ✓ a build resumed after an interleaved finished debug run keeps its run and its budget 1ms
     ✓ a paused run keeps counting after another workflow's run interleaves 1ms
   ✓ bkit counters run (6)
     ✓ is 1 before any run, and stays the same across the run's own start row 1ms
     ✓ is n+1 after a finished run, and a resume keeps its number 1ms
     ✓ an interleaved debug run leaves the paused build run in progress 1ms
     ✓ is n+1 after a FAILED run too 0ms
     ✓ counts only this workflow's runs; a union-merge duplicate is one run 0ms
     ✓ exits 3 on a missing file 0ms
   ✓ bkit counters route (10)
     ✓ continues at the cap and below 0ms
     ✓ exits 1 one over the cap, naming the counter on stderr 0ms
     ✓ a max of 0 lets value 0 through and stops value 1 0ms
     ✓ refuses value "" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "abc" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "1.5" (exit 2, nothing on stdout) 0ms
     ✓ refuses value "-1" (exit 2, nothing on stdout) 0ms
     ✓ refuses an empty or non-integer max with nothing on stdout 0ms
     ✓ takes the max from an ask point with --point 8ms
     ✓ needs exactly one of --max and --point 0ms
   ✓ bkit counters route --of (6)
     ✓ derives the value from the active run's DONE rows of the step 1ms
     ✓ counts one group's rows with --group 1ms
     ✓ exits 4 when :current finds the step's own row missing 1ms
     ✓ sums the DONE rows of several steps with <step>,<step>:count 0ms
     ✓ refuses a step list off :count, a repeated step, or an empty list entry 0ms
     ✓ needs exactly one of --value and --of, and --file with --workflow for --of 0ms
   ✓ bkit counters route --point (7)
     ✓ takes each point's default limit and asks when nothing is set 173ms
     ✓ reads ask and the limit from bkit.workflows 20ms
     ✓ an invalid limit or ask takes its default 13ms
     ✓ takes the limit the run froze at its start, not package.json's live value 1ms
     ✓ reads package.json when the run froze no limit for the point 25ms
     ✓ max --point takes the run's frozen limit with --file and --workflow, else package.json 12ms
     ✓ a headless run never asks 12ms
   ✓ bkit counters grant (4)
     ✓ grants one more full allowance at the used-up limit, and route counts it 51ms
     ✓ grants nothing below the limit, and nothing when nobody can agree 36ms
     ✓ a grant raises only the loop it was given for 27ms
     ✓ counts grants of the active run only, unless --all-runs 31ms
   ✓ bkit counters route --since-clean (4)
     ✓ counts only the rounds after the step's last clean round 25ms
     ✓ a CONCERNS round with 0 failures is clean, one with failures is not 26ms
     ✓ counts only the grants after the last clean round, and only those without a group 24ms
     ✓ refuses --since-clean without one --of step, or with --all-runs 6ms
   ❯ bkit counters progress (16)
     ✓ reports a falling count as closing and recommends another round 7ms
     ✓ reports the same count as stuck and a rising count as worse 13ms
     ✓ leaves codeChanged null when git cannot compare the rounds 6ms
     ✓ judges codeChanged on source only, from the rounds' parent commits 108ms
     × a round with no count reports unknown and no recommendation 10ms
     × does not compare a CI round with a local gate round 8ms
     × compares the last round with the earliest round of the same scope 7ms
     × reports each round's scope 7ms
     × judges codeChanged between the compared same-scope rounds 97ms
     × trendLine names an unknown count instead of claiming no fewer failures 7ms
     × trendLine says the rounds ran different tests 7ms
     × trendLine for a fall without a code change says no source code changed 80ms
     × trendLine for the same count states both counts 7ms
     × trendLine prefers different scopes over a missing count 7ms
     ✓ --since-clean over unscoped holistic rounds still compares them 7ms
     ✓ exits 3 on a missing file 0ms
   ❯ loopProgress with a gate (4)
     ✓ adds the group gate's failing tests to each verify round 8ms
     × a red gate row with no failure count makes the round unknown 8ms
     × a red gate row with 0 counted failures makes the round unknown 11ms
     ✓ a verify round whose gate did not run adds no gate failures 7ms
   ❯ loopTrend (2)
     ✓ a fall without a code change is stuck, not closing 0ms
     × a missing count is unknown, not stuck 0ms
   ✓ bkit counters max (2)
     ✓ returns one point's limit and ask setting, or every point as set 24ms
     ✓ refuses an unknown point 1ms
   ✓ bkit counters rows (5)
     ✓ counts rows of the type since the active run's workflow-started row 0ms
     ✓ an engine-action row between counted rows is not counted 1ms
     ✓ a resumed run does not inherit a crashed run's rows (no workflow-finished between) 0ms
     ✓ route --rows derives the value from typed rows of the active run 0ms
     ✓ starts at 1 on a fresh run, and refuses a bad position or a missing log 1ms
   ✓ bkit counters correction (2)
     ✓ shares correction budget across candidate operations and honors specific limits 1ms
     ✓ refuses a reused correction candidate id with different rows 1ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > a round with no count reports unknown and no recommendation
AssertionError: expected { Object (rounds, counts, ...) } to match object { counts: '5 → ?', …(2) }
(6 matching properties omitted from actual)

- Expected
+ Received

  {
    "counts": "5 → ?",
-   "recommend": null,
-   "trend": "unknown",
+   "recommend": "stop",
+   "trend": "stuck",
  }

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:931:20
    929|     const r = await progress(file);
    930|     expect(r.code).toBe(0);
    931|     expect(r.json).toMatchObject({ counts: "5 → ?", trend: "unknown", …
       |                    ^
    932|   });
    933|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > does not compare a CI round with a local gate round
AssertionError: expected { Object (rounds, counts, ...) } to match object { trend: 'unknown', recommend: null }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
-   "recommend": null,
-   "trend": "unknown",
+   "recommend": "stop",
+   "trend": "stuck",
  }

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:950:20
    948|     ]);
    949|     const r = await progress(file);
    950|     expect(r.json).toMatchObject({ trend: "unknown", recommend: null }…
       |                    ^
    951|   });
    952|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > compares the last round with the earliest round of the same scope
AssertionError: expected { rounds: [ { …(3) }, …(2) ], …(8) } to match object { trend: 'closing', …(1) }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
-   "recommend": "try-again",
-   "trend": "closing",
+   "recommend": "stop",
+   "trend": "stuck",
  }

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:961:20
    959|     ]);
    960|     const r = await progress(file);
    961|     expect(r.json).toMatchObject({ trend: "closing", recommend: "try-a…
       |                    ^
    962|   });
    963|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > reports each round's scope
AssertionError: expected [ undefined, undefined ] to deeply equal [ 'ci:123', null ]

- Expected
+ Received

  [
-   "ci:123",
-   null,
+   undefined,
+   undefined,
  ]

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:971:73
    969|     ]);
    970|     const r = await progress(file);
    971|     expect(r.json.rounds.map((x: { scope: string | null }) => x.scope)…
       |                                                                         ^
    972|   });
    973|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > judges codeChanged between the compared same-scope rounds
AssertionError: expected { rounds: [ { …(3) }, …(2) ], …(8) } to match object { codeChanged: false, trend: 'stuck' }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
-   "codeChanged": false,
-   "trend": "stuck",
+   "codeChanged": true,
+   "trend": "closing",
  }

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1007:20
    1005|     );
    1006|     const r = await progress(file);
    1007|     expect(r.json).toMatchObject({ codeChanged: false, trend: "stuck" …
       |                    ^
    1008|   });
    1009|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1017:30
    1015|     ]);
    1016|     const r = await progress(file);
    1017|     expect(r.json.trendLine).toContain("recorded no count");
       |                              ^
    1018|     expect(r.json.trendLine).not.toContain("no fewer");
    1019|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > trendLine says the rounds ran different tests
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1028:30
    1026|     ]);
    1027|     const r = await progress(file);
    1028|     expect(r.json.trendLine).toContain("ran different tests");
       |                              ^
    1029|   });
    1030|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > trendLine for a fall without a code change says no source code changed
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1065:30
    1063|     const r = await progress(gitFile);
    1064|     expect(r.json.trend).toBe("stuck");
    1065|     expect(r.json.trendLine).toContain("no source code changed");
       |                              ^
    1066|   });
    1067|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > trendLine for the same count states both counts
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1076:30
    1074|     ]);
    1075|     const r = await progress(file);
    1076|     expect(r.json.trendLine).toContain("(21 → 21)");
       |                              ^
    1077|   });
    1078|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > bkit counters progress > trendLine prefers different scopes over a missing count
AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string
 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1086:30
    1084|     ]);
    1085|     const r = await progress(file);
    1086|     expect(r.json.trendLine).toContain("ran different tests");
       |                              ^
    1087|     expect(r.json.trendLine).not.toContain("recorded no count");
    1088|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a red gate row with no failure count makes the round unknown
AssertionError: expected 'stuck' to be 'unknown' // Object.is equality

Expected: "unknown"
Received: "stuck"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1179:26
    1177|     expect(r.json.counts).toBe("2 → ?");
    1178|     expect(r.json.rounds[1].failures).toBeNull();
    1179|     expect(r.json.trend).toBe("unknown");
       |                          ^
    1180|     expect(r.json.recommend).toBeNull();
    1181|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown
AssertionError: expected 'stuck' to be 'unknown' // Object.is equality

Expected: "unknown"
Received: "stuck"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1192:26
    1190|     const r = progress(file);
    1191|     expect(r.json.counts).toBe("2 → ?");
    1192|     expect(r.json.trend).toBe("unknown");
       |                          ^
    1193|     expect(r.json.recommend).toBeNull();
    1194|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

 FAIL  .bkit/core/engine/commands/workflow/counters.test.ts > loopTrend > a missing count is unknown, not stuck
AssertionError: expected 'stuck' to be 'unknown' // Object.is equality

Expected: "unknown"
Received: "stuck"

 ❯ .bkit/core/engine/commands/workflow/counters.test.ts:1218:42
    1216|
    1217|   it("a missing count is unknown, not stuck", () => {
    1218|     expect(loopTrend([r(5), r()], true)).toBe("unknown");
       |                                          ^
    1219|     expect(loopTrend([r(), r(5)], true)).toBe("unknown");
    1220|     expect(loopTrend([r(), r()], false)).toBe("unknown");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯


 Test Files  1 failed (1)
      Tests  13 failed | 67 passed (80)
   Start at  20:48:41
   Duration  1.21s (tests 83%, transform 8%, import 6%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ufmpp2/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (43 tests | 1 failed) 824ms
   ❯ bkit decisions compose (22)
     ✓ writes the header, one item per question and the reply line 15ms
     ✓ compose letters every option and the recommended one 13ms
     ✓ refuses an item whose recommendation is not one of its options 13ms
     ✓ refuses an item with more options than letters 12ms
     ✓ round-trips the last lettered option through parseDecisionItems 13ms
     ✓ --loop adds the attempt line, the progress block and the loop question as Q1 14ms
     ✓ --loop letters the loop question's options and recommendation 13ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 14ms
     ✓ prints the group gate's failing tests per round for the verify loop 14ms
     × --loop=verify with an uncounted group gate reads unknown 16ms
     ✓ base check all with no items recommends Stop 14ms
     ✓ base check all with items recommends Decide 13ms
     ✓ base check all says a gate still red after resume comes from this branch 14ms
     ✓ base check all in adopt mode adds the merge sentence 26ms
     ✓ base check some names the split 13ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 13ms
     ✓ base check none keeps the trend and names the branch 14ms
     ✓ base check unknown keeps the trend and says why 14ms
     ✓ Try again is offered for every base verdict 102ms
     ✓ base check prints how many failing tests are also red on base 24ms
     ✓ a missing or malformed base check is a usage error that names the problem 25ms
     ✓ --loop needs --file 12ms
   ✓ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 14ms
     ✓ refuses a file without Gate: FAIL or not OPEN 13ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 13ms
     ✓ refuses a loop file with an undecided item question 12ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 13ms
   ✓ bkit decisions apply --by=headless (3)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 20ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 19ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 62ms
   ✓ parseDecisionItems (4)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 0ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 0ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ✓ bkit decisions apply --by=owner and pending (6)
     ✓ pending lists each assumed Accept nobody confirmed 26ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 62ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 19ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 50ms
     ✓ --defer letters the options in the deferral row 55ms
     ✓ refuses a malformed --month 19ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop=verify with an uncounted group gate reads unknown
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Trend: unknown'

- Expected
+ Received

- Trend: unknown
+ Status: OPEN
+ Question: CHALLENGE
+ From: challenge
+
+ build verify: attempt 2 of 2
+
+ ## Progress
+
+ Problems after each round: 2 → ?
+ Group gate failures after each round: 0 → ?
+ Code changed: unknown
+ Strategy: none → next STANDARD
+ Minutes per round: 20
+ Trend: stuck
+
+ **Q1 — Verify:** decide the items below instead of another round? No fewer problems, or the code did not change.
+ Options: A) Try again / B) Stop
+ Recommended: B) Stop — another round is unlikely to close the remaining items
+
+ Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:356:18
    354|     expect(r.code).toBe(0);
    355|     const text = fs.readFileSync(out, "utf-8");
    356|     expect(text).toContain("Trend: unknown");
       |                  ^
    357|     expect(text).not.toContain("Trend: stuck");
    358|     expect(r.json.loopRecommended).not.toBe("Decide");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 42 passed (43)
   Start at  20:48:43
   Duration  1.01s (tests 86%, import 7%, transform 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-p3njHP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
