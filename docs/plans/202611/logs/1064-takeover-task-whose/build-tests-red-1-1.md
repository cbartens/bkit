Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1064-takeover-task-whose-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "addTakeoverTasks adds a new task when the open takeover task already has a red record" | red | failure: expected [ 3 ] to deeply equal [ 4 ] |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "addTakeoverTasks reuses the new task on a repeat call after a recorded takeover" | red | failure: expected [ 3 ] to deeply equal [ 4 ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1064-takeover-task-whose
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tasks.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tasks.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1064-takeover-task-whose
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tasks.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1064-takeover-task-whose

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts (48 tests | 2 failed) 3471ms
   ✓ bkit tasks tick (29)
     ✓ tick --decision ticks the tasks of accepted verify-gap items 7ms
     ✓ tick --decision ticks a task whose item title reads TASK {N} 2ms
     ✓ tick --decision leaves a Fix now item's task open 2ms
     ✓ tick --decision reads a per-line decision file with a lettered answer 2ms
     ✓ tick marks only the named tasks 2ms
     ✓ tick refuses a task in another group 2ms
     ✓ tick refuses a plan with no task blocks 1ms
     ✓ tick narrows the group's gap-free tasks by --tasks 2ms
     ✓ ticks a task listed only under Updated tests 1ms
     ✓ ticks a task listed only under Already landed and skips a Gaps task 1ms
     ✓ tasks tick --green refuses a report with no Gaps heading 1ms
     ✓ tasks tick --green refuses a report whose gap lines are fewer than its Gaps header 1ms
     ✓ tick --decision ticks nothing for a title that only mentions a task 2ms
     ✓ tick --decision still refuses a --tasks number from another group 1ms
     ✓ tick --decision still refuses an unknown --tasks number 1ms
     ✓ tick --decision refuses no From header 1ms
     ✓ tick --decision refuses a From that is not verify or holistic 1ms
     ✓ tick --decision refuses a Gate: FAIL header 1ms
     ✓ tick --decision refuses a verify Group that differs from --group 1ms
     ✓ tick --decision refuses a verify file with no Group header 1ms
     ✓ tick --decision ticks a holistic file's accepted tasks across groups without --group 1ms
     ✓ tick --decision still needs --group for a verify file 1ms
     ✓ gappedTasks still reads a report whose Gaps section is empty 2ms
     ✓ tick is idempotent on an already-ticked task 3ms
     ✓ tick refuses a --tasks value that is not a task number 1ms
     ✓ tick refuses a --plan that is no file 1ms
     ✓ tick treats the header's none as nothing to tick 1ms
     ✓ tick leaves every other plan line byte-identical 2ms
     ✓ tick refuses a call with no --group or with neither selector 1ms
   ✓ bkit tasks open (4)
     ✓ open lists tasks with no done line 2ms
     ✓ open sets handover only when a task is open 1ms
     ✓ open lists a ticked task with no log line 1ms
     ✓ open refuses a plan with no task blocks 1ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 345ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 392ms
     ✓ currency emits no hunk outside the matched set 496ms
     ✓ currency refuses a plan with no task blocks 272ms
     ✓ currency exits 0 with no hunks when no task matches 506ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 494ms
   ❯ bkit tasks takeover (9)
     ✓ addTakeoverTasks appends a takeover task in a new last group that plan-check accepts 118ms
     ✓ addTakeoverTasks reuses the open task on a second call 110ms
     × addTakeoverTasks adds a new task when the open takeover task already has a red record 109ms
     × addTakeoverTasks reuses the new task on a repeat call after a recorded takeover 100ms
     ✓ addTakeoverTasks writes only the missing row when a run stopped after the plan write 118ms
     ✓ addTakeoverTasks puts a second contradiction into the same pending group 114ms
     ✓ addTakeoverTasks takes the matrix tier from the test file's name 86ms
     ✓ tasks takeover refuses a call without --pending: steps finish adds the tasks 75ms
     ✓ tasks takeover --pending prints the group until its tests are recorded 80ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks takeover > addTakeoverTasks adds a new task when the open takeover task already has a red record
AssertionError: expected [ 3 ] to deeply equal [ 4 ]

- Expected
+ Received

  [
-   4,
+   3,
  ]

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:865:36
    863|     expect(takeover("adds a row")).toEqual([3]);
    864|     recordRed(3, 3, "adds a row");
    865|     expect(takeover("adds a row")).toEqual([4]);
       |                                    ^
    866|     const text = plan();
    867|     expect(text).toContain("- [ ] **TASK 4:** Take over `adds a row` f…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tasks.test.ts > bkit tasks takeover > addTakeoverTasks reuses the new task on a repeat call after a recorded takeover
AssertionError: expected [ 3 ] to deeply equal [ 4 ]

- Expected
+ Received

  [
-   4,
+   3,
  ]

 ❯ .bkit/core/engine/commands/workflow/tasks.test.ts:881:36
    879|     expect(takeover("adds a row")).toEqual([3]);
    880|     recordRed(3, 3, "adds a row");
    881|     expect(takeover("adds a row")).toEqual([4]);
       |                                    ^
    882|     const once = plan();
    883|     expect(takeover("adds a row")).toEqual([4]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 46 passed (48)
   Start at  13:12:30
   Duration  3.78s (tests 94%, import 3%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uxoJNp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
