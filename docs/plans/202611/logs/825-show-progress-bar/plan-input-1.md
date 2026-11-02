## Session Prompt — this run's, newer than everything below

[$bkit-plan](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-plan/SKILL.md) #825

## Issue description — oldest

### Narrative

While a `/bkit-*` workflow runs, the owner can't easily tell how far along it is or how much is left. After every step, the workflow should show one progress line, with a bar first:

```text
Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 2 of 3
Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR · Attempt 2 of 3
```

The engine works out the line and the agent shows it word for word, so the agent never makes up a number.

**How the % is worked out:**

- Each step in the workflow's step list (`WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`) is one unit. Steps that share a number (e.g. build's `build-plan-tests` and `build-plan-tasks`, both Step 7) count as one unit.
- In build, Steps 7-9 run once per task group, so they count 3 units per group. With G groups, build's total is 6 + 3G + 7. G is read fresh from the plan every time (`parsePlanBlocks`), because a run adds groups partway through: challenge findings become new groups (Step 11), and so do test and challenge fixes taken at a Decision Pause, and verify fixes that push a group over its size cap.
- % = units up to and including the step that just finished ÷ total units.
- **When a loop goes back, the % goes back too.** A retry really does run those steps again, so the work left really has grown. Examples: debug going back to Run Tests, ship going back to Merge PR after a CI failure, build going back to Step 7 for new fix groups. The `Attempt` part of the line shows why the bar dropped.

**Line format:**

- `Progress: ` comes first, then a 10-cell bar (`█` filled, `░` empty, no spaces inside it), a space, then the %. That start is at most 25 characters (`Progress: ██████████ 100%`), so it fits on one line on any phone.
- Then, joined with ` · `, comes `Step {n}/{steps} {title}`. In build's group loop, `Group {g} of {G}` follows. When the attempt is above 1, `Attempt {a} of {max}` follows; it's just `Attempt {a}` when the step has no budget.
- Words are capitalised exactly as shown: `Progress`, `Step`, `Group`, `Attempt`.
- The text after the bar may wrap onto a second line on a narrow screen. The bar itself must never break across lines.
- It's shown as plain text, not in a code block, because a code block scrolls sideways on a phone instead of wrapping.

### Success Criteria

- After every step that writes a `step-done` row, in all five step-listed workflows (design, plan, build, debug, ship), the agent shows exactly the line the engine printed.
- The % is worked out by the engine from `status.jsonl` and the plan alone, so a run that resumes after a stop shows the same line it would have shown without the stop.
- In build, adding task groups partway through increases the total straight away, and `Group {g} of {G}` shows the new count.
- A loop going back makes the % go back, and the line shows `Attempt {a}`.
- On a 375px-wide phone screen, the `Progress: {bar} {pct}%` part never wraps, and only the text after it may go onto a second line (checked by screenshot in the Claude app).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Build before Step 4, so no plan yet | G counts as 1; the total corrects itself once the plan exists |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form) | Counts as done; the line still prints |
| Step that ends in `steps done` or `steps gate` rather than `steps finish` (Step 1, closes, ship Steps 3 and 9) | Prints the same line |
| Decision Pause and owner-pause rows | No line; they aren't steps |
| Run resumed after a stop | Line worked out again from `status.jsonl`; same values |
| `/bkit-auto` | No line of its own; shows the lines of the workflow it hands off to |
| Headless / cloud run | Line still printed; nothing waits on it |
| Last step of the workflow | 100%, and only there |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Units and % for a flat workflow (ship Step 10 of 14 → 71%, 7 filled cells) | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build with 3 groups: Step 8 of group 2 → 50%, `Group 2 of 3` | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build total grows when the plan gains groups after Step 11 | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| A loop back lowers the % and adds `Attempt {a} of {max}` | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Line starts `Progress: `, has a 10-cell bar with no spaces, and the bar part is <= 25 characters | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| `steps finish` and `steps done` print `progressLine` | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Engine works out and prints the line
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Work out a run's progress line from its status rows, its group count and its attempt budget
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: add `runProgress` next to `WORKFLOW_STEPS`, returning the % and the finished line
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `parsePlanBlocks` for the group count
  - **DONE WHEN:** the five step-table tests in the matrix pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress flat workflow` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress build groups` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress groups added` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress loop back` fails on a missing `runProgress`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress bar width` fails on a missing `runProgress`
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Print the line from every call that writes a `step-done` row
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: emit `progressLine`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: `steps done` emits `progressLine` too
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: the attempt budget behind `counters max --point`
  - **UPDATE:** `.bkit/cli.md`: § `steps` output keys
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both calls print `progressLine`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finish prints progressLine` fails on a missing `progressLine` key
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `done prints progressLine` fails on a missing `progressLine` key
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Workflows show the line
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Tell every workflow to show the printed line word for word after each step, as plain text and not in a code block
  - **UPDATE:** `.bkit/instructions.md`: § `workflow-narrate` clause, adding wording without removing any
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-auto.md`: the synced `**Narrate:**` bullet
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the instructions sync check reports no drift
  - **TEST FIRST:** n/a — prompt wording, covered by the instructions sync check
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Update the docs that describe narration and step endings
  - **UPDATE:** `.bkit/workflows.md`: **Narrate** row in the Protocol table
  - **UPDATE:** `CHANGELOG.md`: entry
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the docs name the progress line and where it comes from
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: the line prints when a step **finishes**, so `Step 8/16 Plan Verify` means Step 8 is done.
- Open: whether to add a short reason when the total grows, e.g. `· 2 groups added`. That needs the previous group count, which no status row records today.
- Assumed: 10 bar cells, so each cell is 10%.
- Assumed: the % is rounded to the nearest whole number, and filled cells = the % rounded to the nearest 10.

### Breaking Changes & Naming

- New output key `progressLine` on `steps finish` and `steps done`. It isn't called `progress`, to avoid confusion with the existing `counters progress` verb and `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`, which check whether a retry loop made headway.
- No existing key or row changes.

### Out of Scope

- Weighting steps by how long they take. Steps differ a lot (Step 7 is most of a build), but weighting would need measured timings.
- A live bar in a status line or app UI. This is a chat line only.

### References

- `.bkit/core/engine/commands/workflow/step-table.ts` § `WORKFLOW_STEPS`
- `.bkit/instructions.md` § `workflow-narrate`
- `.bkit/core/workflows/bkit-build.md` § Group Loop — Steps 7-9
- `.bkit/cli.md` § Step endings
