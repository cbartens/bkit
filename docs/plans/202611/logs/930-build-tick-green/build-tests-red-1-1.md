Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/930-build-tick-green-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "ticks a task listed only under Updated tests" | red | failure: expected [ 8 ] to deeply equal [ 8, 9 ] |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "ticks a task listed only under Already landed and skips a Gaps task" | red | failure: expected [ 8 ] to deeply equal [ 7, 8 ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tasks.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tasks.test.ts

[test-timeout-budget] load average 21.9 on 10 cores: unit limits 15450ms per test, 30900ms per hook (x3.09)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (22 tests | 2 failed) 3677ms
   ❯ bkit tasks tick (12)
     ✓ tick marks only the named tasks 12ms
     ✓ tick refuses a task in another group 3ms
     ✓ tick refuses a plan with no task blocks 2ms
     ✓ tick narrows the group's gap-free tasks by --tasks 10ms
     × ticks a task listed only under Updated tests 11ms
     × ticks a task listed only under Already landed and skips a Gaps task 4ms
     ✓ tick is idempotent on an already-ticked task 3ms
     ✓ tick refuses a --tasks value that is not a task number 5ms
     ✓ tick refuses a --plan that is no file 1ms
     ✓ tick treats the header's none as nothing to tick 2ms
     ✓ tick leaves every other plan line byte-identical 2ms
     ✓ tick refuses a call with no --group or with neither selector 2ms
   ✓ bkit tasks open (4)
     ✓ open lists tasks with no done line 3ms
     ✓ open sets handover only when a task is open 2ms
     ✓ open lists a ticked task with no log line 2ms
     ✓ open refuses a plan with no task blocks 2ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 631ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 582ms
     ✓ currency emits no hunk outside the matched set 578ms
     ✓ currency refuses a plan with no task blocks 204ms
     ✓ currency exits 0 with no hunks when no task matches 602ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 1011ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > ticks a task listed only under Updated tests
AssertionError: expected [ 8 ] to deeply equal [ 8, 9 ]

- Expected
+ Received

  [
    8,
-   9,
  ]

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:209:27
    207|     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tas…
    208|     expect(r.code).toBe(0);
    209|     expect(r.json.ticked).toEqual([8, 9]);
       |                           ^
    210|     expect(tickOf(read(plan), 9)).toBe("x");
    211|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks tick > ticks a task listed only under Already landed and skips a Gaps task
AssertionError: expected [ 8 ] to deeply equal [ 7, 8 ]

- Expected
+ Received

  [
-   7,
    8,
  ]

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:242:27
    240|     ]);
    241|     expect(r.code).toBe(0);
    242|     expect(r.json.ticked).toEqual([7, 8]);
       |                           ^
    243|     expect(tickOf(read(plan), 7)).toBe("x");
    244|     expect(tickOf(read(plan), 9)).toBe(" ");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 20 passed (22)
   Start at  17:40:15
   Duration  5.80s (tests 67%, transform 21%, import 9%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OQTcB5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
