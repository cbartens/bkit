# Brief: group 4 — Challenge round 2 findings

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
- Group 3: Challenge round 1 findings — done
  - TASK 6: An at-limit holistic pause (loop question answered Decide, every gap Accept) routes continue, but the summary still lists build-plan-verify-holistic FAIL and the build ends FAIL — done
  - TASK 7: A fix round that edits source but reports Fixed: 0 pauses, the owner accepts the old gaps, and continue sends unverified edits on with no verify re-run — done
  - TASK 8: A run stopped between the build-decision row (route=continue) and the decision tick resumes at Plan Execute with the accepted tasks never ticked — done
  - TASK 9: An accepted gap titled `TASK 3` (copied from its TASK {N} gap line) ticks nothing, tasks tick --decision exits 0 and the route goes on to Step 7 unchecked — done
- Group 4: Challenge round 2 findings — this group
  - TASK 10: An owner stops at an all-Accept verify or holistic pause and resumes later; the resumed Decision Pause has no SOURCE_CHANGED value, so step 6 either routes continue past fix-round edits no verify saw or re-runs the check the answers settled — open
  - TASK 11: A fix round edits source and reports Fixed: 0, the owner picks Stop at the holistic pause, and the resumed run answers Accept and routes continue, because `SOURCE_CHANGED` lives only in session memory and the resume rebuilds every other pause variable but not this one, so the unverified edits skip the verify re-run — open

## The work

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** An owner stops at an all-Accept verify or holistic pause and resumes later; the resumed Decision Pause has no SOURCE_CHANGED value, so step 6 either routes continue past fix-round edits no verify saw or re-runs the check the answers settled
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:167` · **Round:** 2
  - **DONE WHEN:** A verify or holistic decision file records `--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`; `openDecision` in `.bkit/core/engine/commands/workflow/workflows.ts` prints it (as it prints `gate`); the build Resume line holds it as `SOURCE_CHANGED`; and the step 6 continue rule treats a missing header as `true`, so a resumed or reopened pause (Stop then resume, or the `DECIDED` file the pre-record tick leaves unrecorded) routes the same as the original session. Today `PAUSE_STEP` = 10 for both the Step 10 sub-step 6 pause and the sub-step 10 fix-round pause, so the value cannot be derived on resume
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a verify or holistic decision file records Source changed and a resume holds it` fails on `{HEADER_FLAGS}` naming no `Source changed` header and the Resume line holding no `SOURCE_CHANGED`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `openDecision carries the Source changed header` fails on `openDecision` having no `sourceChanged` field
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** A fix round edits source and reports Fixed: 0, the owner picks Stop at the holistic pause, and the resumed run answers Accept and routes continue, because `SOURCE_CHANGED` lives only in session memory and the resume rebuilds every other pause variable but not this one, so the unverified edits skip the verify re-run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 2
  - **DONE WHEN:** The verify and holistic pauses write the source-change fact into the decision file header (`--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`), step 6's continue rule reads it from that header, and a decision file with no `Source changed: false` header line keeps the verify / holistic re-run, so a resumed pause (Stop, or a session that died mid-pause) never routes continue on a guess
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue rule reads the source change from the decision file header` fails on `{HEADER_FLAGS}` carrying no `Source changed` header and the continue rule naming only the held `SOURCE_CHANGED`, which the `openDecision` resume never sets
<!-- bkit:task 11 end -->
