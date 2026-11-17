## Session Prompt — this run's, newer than everything below

/bkit-plan #894

## Issue description — oldest

### Narrative

Since #825, every `/bkit-*` workflow shows a progress line when a numbered step **finishes**. Long steps therefore start in silence: the owner doesn't see which step is running or why the wait is long until it's over. Run logs under `docs/plans/2026{10,11}/logs/*/status.jsonl` show the usual long silences:

<!-- prettier-ignore -->
| Step | Typical wait with no line |
| --- | --- |
| `plan-generate` | 10-45m |
| `build-plan-tasks` (per group) | 15-35m |
| `ship-deferred-sweep` | 7-29m |
| `build-run-tests`, `build-challenge` | 20-90m |

The orchestrator can't print while a subagent runs, so the fix is to announce each step **before** it starts and to mark the edges of task groups and retry loops clearly. This applies to **every** workflow: design, plan, build, debug, ship, and `/bkit-auto` forwarding the lines of the workflow it hands off to.

Three changes:

1. **Step start, all workflows.** Before each numbered step's work begins, show a start line:
   ```text
   Progress: ████░░░░░░ 44% · Starting Step 8/16 Plan Verify · Group 2 of 3
   ```
   The % is the work finished **before** this step, so a start line never shows more than the done line that follows it.
2. **Task group start (build).** [bkit-build.md:602](https://github.com/cbartens/bkit/blob/dev/.bkit/core/workflows/bkit-build.md) records `build-group-start` with `steps done ... >/dev/null`, so the line the engine returns is thrown away. Show a start line for the group's Step 7 instead, so `Group 3 of 4` appears before the long `build-plan-tasks` wait.
3. **Task group end (build).** A passing `build-group-gate` row prints a line today, but it reads the same as the verify line before it (both are titled `Plan Verify`). Add `· Group {g} of {G} done` to that line.

Retry loops in every workflow use the same start line: a step re-entered on attempt > 1 shows `Attempt {a} of {max}` in its **start** line, not only in its done line. The looped points are `build.verify`, `build.challenge`, `build.tests`, `debug.fix`, `debug.soak` and `ship.merge` (`progressPoint` in `.bkit/core/engine/commands/workflow/steps.ts`). Design and plan have no loops or groups, so they get the step-start line only.

### Success Criteria

- In all five step-listed workflows (design, plan, build, debug, ship), each numbered step that does work shows the engine's start line word for word before its work begins. `/bkit-auto` forwards those lines.
- The start line's % equals the % of the done line before it, and is never above the done line after it.
- In build, every task group shows a start line with `Group {g} of {G}` before Step 7 runs, and a passing group gate shows `Group {g} of {G} done`.
- A step re-entered by a retry loop, in any workflow, shows `Attempt {a} of {max}` in its start line.
- Start lines are worked out from `status.jsonl` and the plan alone and never write a status row, so a resumed run shows the same line it would have shown without the stop.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| First step of a workflow | Start line shows 0% and an empty bar |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form, ship Step 4 on Path A) | No start line; the done line still prints as today |
| Decision Pause, owner pause, unnumbered bookkeeping | No start line |
| Build before Step 4, so no plan yet | G counts as 1, as for done lines |
| Group gate that fails or goes to gaps remediation | No `done` suffix; the done suffix appears only on the passing gate |
| Retry loop that goes back to an earlier step | That step's start line shows the lower % and the attempt |
| Resume after a stop | The resumed step shows its start line once, worked out again from `status.jsonl` |
| Headless / cloud run | Start lines print; nothing waits on them |
| Start line on a 375px-wide phone | The `Progress: {bar} {pct}%` part never wraps, as for done lines |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Start line for a flat workflow uses the units finished before the step, with `Starting Step` wording | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Start line for the first step is 0% with an empty bar | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build start line inside group 2 of 3 shows `Group 2 of 3` and the % before Step 7 of that group | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Start line on attempt 2 of a looped point shows `Attempt 2 of {max}` for each of build, debug and ship | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Passing group gate line ends `Group {g} of {G} done`; a failing one does not | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Start command prints `progressLine` and writes no status row | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Start command rejects an unknown step and prints no line for skipped or unnumbered steps | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Every numbered step section in the five workflow files shows the start line before its work, and build's group-start blocks no longer discard their output | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Engine works out start lines and group-end lines
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Work out a start line for any numbered step, including its group and attempt
  - **UPDATE:** `runProgress` in `.bkit/core/engine/commands/workflow/step-table.ts`: add a start mode that counts the units finished before the step and words the line `Starting Step {n}/{steps} {title}`
  - **READ:** `.bkit/workflows.md`: § Progress Lines for the done-line formulas the start line mirrors
  - **DONE WHEN:** the four step-table tests in the matrix pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start flat` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start first step` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start build group` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start attempt` fails on a missing start mode
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Mark a passing group gate's line as the end of its group
  - **UPDATE:** `stepProgress` in `.bkit/core/engine/commands/workflow/steps.ts`: add `· Group {g} of {G} done` when the row is a passing `build-group-gate`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a passing gate line ends with the done suffix and a failing one does not
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `group gate pass prints group done` fails on a missing suffix
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Add a read-only engine command that prints a step's start line without writing a row
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: new read-only verb (name decided in the plan) taking `--file` `--workflow` `--step` `--group`, reusing `stepProgress` inputs (plan groups, saved attempts and limits)
  - **UPDATE:** `.bkit/cli.md`: verb row and `progressLine` output contract
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the command prints `progressLine`, leaves `status.jsonl` unchanged, and refuses unknown steps
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start prints progressLine without writing a row` fails on a missing verb
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start rejects unknown and skips unnumbered steps` fails on a missing verb
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Every workflow shows the start lines
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Show the start line at the start of every numbered step in all workflows
  - **UPDATE:** `.bkit/instructions.md`: § `workflow-narrate` clause, adding wording without removing any
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`: each numbered step that does work runs the start command and shows its line before its work
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: forwards start lines as it forwards done lines
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: new `describe` block that walks each workflow's numbered step sections with `stepSections` and `WORKFLOW_STEPS`
  - **READ:** `stepSections` in `.bkit/core/engine/checks/status-holes.ts`: how a workflow file is split into step sections
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the workflow-shape test passes and the instructions sync check reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `every numbered step shows a start line` fails on steps with no start call
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Show a start line when each build task group starts, instead of discarding the group-start output
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the group-start blocks around lines 598-602 and 684 show the group's Step 7 start line instead of sending output to `/dev/null`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** a build with 2+ groups shows `Group {g} of {G}` before each group's Step 7 work
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build group start shows its start line` fails while the group-start output goes to `/dev/null`
<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Update the docs that describe progress lines
  - **UPDATE:** `.bkit/workflows.md`: § Progress Lines and the **Narrate** row in the Protocol table
  - **UPDATE:** `CHANGELOG.md`: entry
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the docs describe start lines, group-end lines and attempt start lines, and match the engine output
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: start-line wording is `Starting Step {n}/{steps} {title}`; the rest of the format matches #825.
- Assumed: a skipped step shows no start line, only its done line, since no work runs.
- Open: the new verb's name (`steps start` or a flag on an existing verb); the plan picks it, reusing existing code per `.agents/rules.md` § Improve over duplicate.
- Open: whether the done suffix should say `done` or `passed`.

### Breaking Changes & Naming

- New read-only verb that outputs `progressLine`. No existing key, row or output changes, apart from the added `done` suffix on passing group gate lines.

### Out of Scope

- A line per plan task inside Plan Execute (`Task {t} of {T}`). It needs subagent output changes, and should be a separate issue.
- Weighting the % by how long steps take. This changes accuracy, not how often lines appear.
- A live bar in a status line or app UI.

### References

- #825 — Show a progress bar line after every workflow step
- `.bkit/workflows.md` § Progress Lines
- `.bkit/core/engine/commands/workflow/step-table.ts` § `runProgress`
- `.bkit/core/engine/commands/workflow/steps.ts` § `stepProgress`, `progressPoint`
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — existing checks on the shipped workflow files
- `.bkit/instructions.md` § `workflow-narrate`
- `.bkit/core/workflows/bkit-build.md` § Group Loop — Steps 7-9

🤖 Generated with [Claude Code](https://claude.com/claude-code)
