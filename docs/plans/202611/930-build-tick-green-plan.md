# Build tick --green Implementation Plan

## Context & Goals

`bkit tasks tick --green=<report>` must skip only the tasks listed under the report's `## Gaps` section. Today `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts` matches every `- Task N` line in the whole report, so a task listed only under `## Already landed` or `## Updated tests` is left unticked even when the header reads `Gaps: 0` (#930).

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A task listed only under `## Updated tests` (report `Gaps: 0`, `## Gaps` reads `None.`) is ticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| A task listed only under `## Already landed` is ticked, while a task under `## Gaps` stays unticked | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — one parser function in an existing command file, no topology change | `.bkit/core/engine/commands/workflow/tasks.ts` | covered | None. |
| technology | `docs/technology.md` | no — no new dependency or tool | `.bkit/core/engine/commands/workflow/tasks.ts` | covered | None. |
| security | `docs/security.md` | no — reads a local report file only, no credential or permission change | `.bkit/core/engine/commands/workflow/tasks.ts` | covered | None. |
| testing | `docs/testing.md` | yes — Unit tier in the existing vitest file | `.bkit/core/engine/commands/workflow/tasks.test.ts` | partial | None; the existing test file is the tier evidence. |
| data-schema | `docs/data-schema.md` | no — no database change | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no logging change | none | none | Not applicable. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable. |

## Documentation Warnings

```jsonl
{
  "topic": "testing",
  "gap": "not read in full; tier chosen from the existing test file",
  "recommendedPath": "docs/testing.md",
  "alternativeEvidence": ".bkit/core/engine/commands/workflow/tasks.test.ts already holds the Unit cases for `tasks tick`",
  "action": "None; add the cases beside the existing tick tests."
}
```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read only the `## Gaps` section of a `tests green` report | `.bkit/core/engine/commands/workflow/tasks.ts` | `rg -l "REPORT_GAP" .bkit/core/engine`, `grep -n "gappedTasks" .bkit/core/engine/commands/workflow/tasks.ts` | `gappedTasks` / `REPORT_GAP` in `.bkit/core/engine/commands/workflow/tasks.ts` — matches the line shape but over the whole text | EXTEND | Slice the report to the `## Gaps` section before running `REPORT_GAP`; no new file. |
| Tests for the two extra report sections | `.bkit/core/engine/commands/workflow/tasks.test.ts` | `grep -n "green" .bkit/core/engine/commands/workflow/tasks.test.ts` | `tick narrows the group's gap-free tasks by --tasks` — covers only a `## Gaps` section | EXTEND | Add cases beside it with `## Already landed` and `## Updated tests`. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Limit the gap read to the `## Gaps` section

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Make `gappedTasks` read only the `## Gaps` section of the text report
  - **UPDATE:** `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts`: run `REPORT_GAP` only over the text from the `## Gaps` heading to the next `## ` heading (the `--json` branch stays as it is)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.test.ts`: add one case for an `## Updated tests` line and one for an `## Already landed` line beside the existing tick cases
  - **DONE WHEN:** `bkit tasks tick --green` on a report with `Gaps: 0` and a `- Task 9` line under `## Updated tests` or `## Already landed` ticks task 9, a `## Gaps` line still leaves its task unticked, and both new tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `ticks a task listed only under Updated tests` fails on task 9 missing from the `ticked` list
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `ticks a task listed only under Already landed and skips a Gaps task` fails on the Already landed task missing from the `ticked` list

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->
