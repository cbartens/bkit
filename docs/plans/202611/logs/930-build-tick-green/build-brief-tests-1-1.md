# Brief: group 1 — Limit the gap read to the `## Gaps` section (tests)

Plan: Build tick --green Implementation Plan

## Why and what

### Context & Goals

`bkit tasks tick --green=<report>` must skip only the tasks listed under the report's `## Gaps` section. Today `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts` matches every `- Task N` line in the whole report, so a task listed only under `## Already landed` or `## Updated tests` is left unticked even when the header reads `Gaps: 0` (#930).

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A task listed only under `## Updated tests` (report `Gaps: 0`, `## Gaps` reads `None.`) is ticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| A task listed only under `## Already landed` is ticked, while a task under `## Gaps` stays unticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |

## Where it fits

- Group 1: Limit the gap read to the `## Gaps` section — this group
  - TASK 1: Make `gappedTasks` read only the `## Gaps` section of the text report — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Make `gappedTasks` read only the `## Gaps` section of the text report
  - **UPDATE:** `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts`: run `REPORT_GAP` only over the text from the `## Gaps` heading to the next `## ` heading (the `--json` branch stays as it is)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.test.ts`: add one case for an `## Updated tests` line and one for an `## Already landed` line beside the existing tick cases
  - **DONE WHEN:** `bkit tasks tick --green` on a report with `Gaps: 0` and a `- Task 9` line under `## Updated tests` or `## Already landed` ticks task 9, a `## Gaps` line still leaves its task unticked, and both new tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `ticks a task listed only under Updated tests` fails on task 9 missing from the `ticked` list
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `ticks a task listed only under Already landed and skips a Gaps task` fails on the Already landed task missing from the `ticked` list

<!-- bkit:task 1 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A task listed only under `## Updated tests` (report `Gaps: 0`, `## Gaps` reads `None.`) is ticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| A task listed only under `## Already landed` is ticked, while a task under `## Gaps` stays unticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
