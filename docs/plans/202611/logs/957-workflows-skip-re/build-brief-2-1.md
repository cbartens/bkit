# Brief: group 2 — Workflow route and the rule for every workflow

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
- Group 2: Workflow route and the rule for every workflow — this group
  - TASK 4: Build routes Accept-only pauses to continue — open
  - TASK 5: State the rule for every workflow and guard it — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Build routes Accept-only pauses to continue
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 2 titles each verify-gap item `Task {N}` from its `TASK {N}` gap line
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 6, after the `Fix now` and `Try again` rules and before `From: holistic` / `From: verify`, a `From: verify` or `From: holistic` pause with every item `Accept` or `Accept (assumed)`, the loop question (when asked) `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 7 routes `continue` from holistic → Step 11, and `continue` from verify → `"{BKIT}" tasks tick --plan=... --group={GROUP} --decision=...`, then Step 7
  - **UPDATE:** `Gate — Decision Pause` in `.bkit/core/workflows/bkit-build.md`: one checklist line for the `continue` route
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** an all-Accept verify or holistic pause records `route=continue` and starts no new verify round
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs` fails on no continue route
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `continue sends holistic to Step 11 and verify to the decision tick then Step 7` fails on no continue route
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a Gate FAIL pause never routes continue` fails on no Gate FAIL condition in the continue rule

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** State the rule for every workflow and guard it
  - **UPDATE:** `Cross-step invariants` in `.bkit/core/.bkit/workflows.md`: a **Re-runs follow answers** row, for all workflows, stating the three conditions and naming build's `continue`, debug's Loop Question, ship's Merge Question and Confirm Assumed Items
  - **UPDATE:** `Decision Pause` in `.bkit/core/.bkit/workflows.md`: the `Then:` bullet names `continue` and where it goes
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `route` field values in § `status.jsonl` — workflow state SoT and the Step 15 row of § `/bkit-build` name `continue`
  - **UPDATE:** `docs/decisions.jsonl`: one row for the rule, naming this issue
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the docs name `continue` wherever they list decision routes, and the audit test passes on today's debug and ship questions
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug and ship questions offer no answer that re-runs a check without a change` fails on the missing test

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Tick the tasks of accepted verify gaps — `.bkit/core/engine/commands/workflow/tasks.ts`
- TASK 2 (group 1, done): Resume after a continue decision — `.bkit/core/engine/commands/workflow/step-table.ts`
- TASK 3 (group 1, done): Summary settles an all-Accept holistic pause — `.bkit/core/engine/commands/workflow/summary.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Continue route in build | `.bkit/core/workflows/bkit-build.md` | `grep -n DECISION_ROUTE` | Decision Pause steps 2, 6, 7 and gate | EXTEND | Add the route and its rules |
| Rule for every workflow and guard | `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `docs/decisions.jsonl` | `grep -n "Cross-step invariants"` | Invariants table; existing shape audit | EXTEND | Add a row, audit tests and a ledger row |

### Architecture entries

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists. Decision Pause steps 2, 6, 7 and the gate.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists. Rule and route names.
