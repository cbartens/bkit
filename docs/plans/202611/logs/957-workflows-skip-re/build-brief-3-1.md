# Brief: group 3 — Challenge round 1 findings

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

- Group 1: Engine support for the skip — done
  - TASK 1: Tick the tasks of accepted verify gaps — done
  - TASK 2: Resume after a continue decision — done
  - TASK 3: Summary settles an all-Accept holistic pause — done
- Group 2: Workflow route and the rule for every workflow — done
  - TASK 4: Build routes Accept-only pauses to continue — done
  - TASK 5: State the rule for every workflow and guard it — done
- Group 3: Challenge round 1 findings — this group
  - TASK 6: An at-limit holistic pause (loop question answered Decide, every gap Accept) routes continue, but the summary still lists build-plan-verify-holistic FAIL and the build ends FAIL — open
  - TASK 7: A fix round that edits source but reports Fixed: 0 pauses, the owner accepts the old gaps, and continue sends unverified edits on with no verify re-run — open
  - TASK 8: A run stopped between the build-decision row (route=continue) and the decision tick resumes at Plan Execute with the accepted tasks never ticked — open
  - TASK 9: An accepted gap titled `TASK 3` (copied from its TASK {N} gap line) ticks nothing, tasks tick --decision exits 0 and the route goes on to Step 7 unchecked — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** An at-limit holistic pause (loop question answered Decide, every gap Accept) routes continue, but the summary still lists build-plan-verify-holistic FAIL and the build ends FAIL
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:430` · **Round:** 1
  - **DONE WHEN:** The holistic settling in buildSummary leaves the loop item (title `Holistic verify`, as `decisions compose` writes it) out of the all-Accept check, as the verify settling drops title `Verify` at line 383, and settles only when that loop item, when present, is answered `Decide`; a `Try again` loop answer still settles nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `an all-Accept holistic pause with a Decide loop question settles the holistic FAIL` fails on `build-plan-verify-holistic FAIL` left in `reasons`, because the `Q1 — Holistic verify` item's `Decision: Decide` fails `/^Accept\b/`

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** A fix round that edits source but reports Fixed: 0 pauses, the owner accepts the old gaps, and continue sends unverified edits on with no verify re-run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 1
  - **DONE WHEN:** The continue rule also requires that no source changed since the paused verify: the pause came from Step 8 or Step 10 sub-steps 5-6, or the Step 9 / Step 10 sub-step 10 `branches scan-diff --base=HEAD~1 --code` exited 1; a pause reached with exit 0 and VERIFY_FIXED / HOLISTIC_FIXED = 0 keeps the verify / holistic re-run
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `continue is never set after a fix round that changed source files` fails on the continue rule line naming no source-change condition

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A run stopped between the build-decision row (route=continue) and the decision tick resumes at Plan Execute with the accepted tasks never ticked
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-build.md:307` · **Round:** 1
  - **DONE WHEN:** The verify continue tick (`tasks tick --decision`) runs in step 6 before the `steps finish --step=build-decision` block, so a resume either reopens the unrecorded decision (step 5 keeps a tick already made) or finds the tasks ticked; today DECISION_ROUTES.continue resumes at build-plan-tasks and nothing replays the tick, so a BLOCKED task re-opens the same group (Step 8 re-runs) and a DONE task stays unticked into Step 15's `Task N not done` FAIL
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue decision tick runs before the build-decision row is recorded` fails on the `tasks tick ... --decision=` line sitting after the `steps finish --workflow=build --step=build-decision` block

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** An accepted gap titled `TASK 3` (copied from its TASK {N} gap line) ticks nothing, tasks tick --decision exits 0 and the route goes on to Step 7 unchecked
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:219` · **Round:** 1
  - **DONE WHEN:** The title match is case-insensitive (`/\btask\s+(\d+)\b/i`), and the build route checks the tick's exit (non-zero → Failure Path) instead of a bare `run ..., then Step 7`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision ticks a task whose item title reads TASK {N}` fails on `ticked` = `[]`, because `/\bTask (\d+)\b/` is case-sensitive
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue decision tick routes a non-zero exit to the Failure Path` fails on the continue / From: verify route line naming no exit handling

<!-- bkit:task 9 end -->
