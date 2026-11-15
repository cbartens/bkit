# Brief: group 1 — Engine support for the skip (tests)

Plan: Skip pointless re-runs after an answer Implementation Plan

## Why and what

### Context & Goals

After an owner's answer or an automatic answer (`ask: false`, headless), a check or test runs again only when the answer changes code (`Fix now`), asks for another round (`Try again`), or a red gate is still unsettled. Build breaks this today: an all-Accept `From: holistic` or `From: verify` pause re-runs Step 10 or Step 8 and returns the result the answers already fixed. This plan adds a `continue` route for those pauses, a `tasks tick --decision` flag, resume and summary support, and the rule in the workflow docs with an audit guard. Debug and ship already comply.

**Related Issues:**

- #957 — Workflows skip re-runs after an answer (this issue)
- #951 — Build: repeat whole-feature checks re-check everything, costing hours (blocks this issue; same Decision Pause lines)
- #814 — Local test limits only catch hangs (the case seen)

---

### Narrative

When an owner accepts every gap in a build's verify or holistic pause, the build goes on to the next step instead of running the same check again.

### Success Criteria

- An all-Accept `From: holistic` pause goes to Step 11 with no new `build-plan-verify-holistic` row.
- An all-Accept `From: verify` pause with no `Gate: FAIL` ticks the accepted gaps' tasks and goes to Step 7 with no new `build-plan-verify` or `build-group-gate` row for that group.
- Any `Fix now` or `Try again` answer, or a `Gate: FAIL` pause, routes as today.
- A run stopped after a `continue` decision resumes at Build Challenge (holistic) or Plan Execute (verify).
- The Step 15 summary lists the skipped round's `FAIL` under Resolved Findings as settled by that Decision Pause, and the run's verdict is no worse than a passing re-run would give.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| What tests a repeat holistic check, the group gate or the debug soak runs | Test selection does not change the skip | #951 |
| How a red group gate is re-run on resume (`decisions apply --by=rerun`) | Unchanged by the skip | Keep as is |
| The flaky `ENOTEMPTY` cleanup race in `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts` | A separate test bug | Follow-up issue |

## Where it fits

- Group 1: Engine support for the skip — this group
  - TASK 1: Tick the tasks of accepted verify gaps — open
  - TASK 2: Resume after a continue decision — open
  - TASK 3: Summary settles an all-Accept holistic pause — open
- Group 2: Workflow route and the rule for every workflow — next
  - TASK 4: Build routes Accept-only pauses to continue — open
  - TASK 5: State the rule for every workflow and guard it — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Tick the tasks of accepted verify gaps
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: `tasks tick --decision=<file>` ticks, in `--group`, the task each item answered `Accept` or `Accept (assumed)` names in its `Task {N}` title; `Fix now` and undecided items tick nothing
  - **READ:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: item title and decision
  - **DONE WHEN:** `tasks tick --decision` on a decision file with one Accept and one Fix now item ticks only the accepted item's task
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision ticks the tasks of accepted verify-gap items` fails on the unknown flag
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision leaves a Fix now item's task open` fails on the unknown flag

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Resume after a continue decision
  - **UPDATE:** `DECISION_ROUTES` in `.bkit/core/engine/commands/workflow/step-table.ts`: add `continue` keyed on the step before the pause: `build-plan-verify`, `build-group-gate`, `build-plan-gaps-remediate` → `build-plan-tasks`; `build-plan-verify-holistic`, `build-plan-gaps-remediate-holistic` → `build-challenge`
  - **DONE WHEN:** `status resume` after a `route=continue` decision row names Build Challenge or Plan Execute by the prior step
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a continue decision after a holistic round resumes at Build Challenge` fails on no resume point
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a continue decision after a group verify resumes at Plan Execute` fails on no resume point

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Summary settles an all-Accept holistic pause
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: a `From: holistic` decision file whose every item is `Accept` or `Accept (assumed)` settles the last `build-plan-verify-holistic` and `build-plan-gaps-remediate-holistic` FAIL rows before it, listed as `resolved by the Decision Pause (...), every item accepted`
  - **DONE WHEN:** a run whose last holistic row is FAIL, followed by an all-Accept holistic pause, has no unresolved holistic FAIL in its summary
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `an all-Accept holistic pause settles the holistic FAIL before it` fails on the FAIL left unresolved
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a holistic pause with a Fix now item settles nothing` fails on a wrongly settled FAIL

<!-- bkit:task 3 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| tick --decision ticks the tasks of accepted verify-gap items | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| tick --decision leaves a Fix now item's task open | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| a continue decision after a holistic round resumes at Build Challenge | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 2 |
| a continue decision after a group verify resumes at Plan Execute | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 2 |
| an all-Accept holistic pause settles the holistic FAIL before it | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| a holistic pause with a Fix now item settles nothing | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
