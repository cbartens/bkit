## Session Prompt — this run's, newer than everything below

/bkit-build #957

## Issue description — oldest

### Narrative

**Rule, for every workflow:** after an owner's answer or an automatic answer (`ask: false`, headless), a check or test runs again only when one of these holds:

- the answer changes code (`Fix now`)
- the answer asks for another round (`Try again`)
- a red gate is still unsettled

When none of them holds, the workflow goes on to the step a passing re-run would have reached.

**Where it breaks today: build only.** In `.bkit/core/workflows/bkit-build.md` § Decision Pause, step 6 sets `DECISION_ROUTE` = `holistic` for any `From: holistic` pause with no `Fix now` or `Try again` answer, and `verify` for any `From: verify` one. Step 7 then routes them to "re-run Step 10" and "re-run Step 8".

- A fresh `@bkit-build-plan-verify` agent re-checks every task and re-runs `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (holistic), or the group's verify and group gate (Step 8).
- It reads the `build-decision-*.md` files, treats each accepted gap as no gap, and returns the result the answers already fixed.

Seen on [#814 — Local test limits only catch hangs; drop load-based scaling](https://github.com/cbartens/bkit/issues/814) (`docs/plans/202611/logs/814-local-test-limits/build-decision-1-2.md`):

- Step 10 attempt 1 failed only on two flaky `ENOTEMPTY` cleanup failures, in `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts`, files the feature does not touch.
- The owner answered `A, A`, and the build started Step 10 attempt 2: a second full check and test run.
- That run risks a fresh pause, because the race can hit a test the Accept does not name.

No recorded reason for these re-runs exists in the workflow, `.bkit/core/.bkit/workflows.md` or `docs/decisions.jsonl`.

**Checked and already compliant:**

- **Debug:** the **Loop Question** offers only `Stop` / `Try again` (`.bkit/core/workflows/bkit-debug.md` § Loop Question).
- **Ship:** the **Merge Question** offers only `Stop` / `Try again`. **Confirm Assumed Items** only writes answers and returns to Step 2 (`.bkit/core/workflows/bkit-ship.md`).
- **Plan and design:** they ask no question that leads to a test run.
- **Build, other pauses:**
  - A tests pause can only be answered `Try again` or `Stop`: `decisions compose` gives a loop question with no items exactly those two options (`.bkit/core/engine/commands/workflow/decisions.ts`).
  - A challenge pause answered Accept goes to Step 12's first run, not a re-run.
  - An `UNPROVEN` pause goes to Step 15, which skips `tests green` once a `Question: UNPROVEN` file exists.

**What changes (build):**

1. **Route `continue`:**
   - **When:** a `From: verify` or `From: holistic` pause gets only `Accept` or `Accept (assumed)` answers, the loop question (when asked) is answered `Decide`, and the decision file has no `Gate: FAIL` header.
   - **Holistic:** Step 11.
   - **Verify:** tick the accepted gaps' tasks, then Step 7, which briefs the next group with an open task or goes to Step 10.
2. **Ticking accepted tasks:** `bkit tasks tick --decision=<file>` ticks the task each accepted verify-gap item names. Today the re-run verifier ticks them, because an accepted gap is no gap. Step 7 picks "the first group with an open task", so an unticked accepted task would send the build back into the same group.
3. **Resume:** `DECISION_ROUTES` maps `continue` by the step before the pause. A stopped run resumes where the skip goes, not at a new check.
4. **Summary:** `bkit workflows summary` settles a holistic `FAIL` that an all-Accept holistic pause answered, the same way it already settles a verify `FAIL` (`every item accepted`).
5. **Docs and guard:**
   - `.bkit/core/.bkit/workflows.md` states the rule for every workflow.
   - A workflow audit test fails if debug or ship ever offers an answer that re-runs a check without a change.

**Answers to the questions on this issue:**

- **Tasks ticked when the re-run is skipped?**
  - **Holistic:** yes, already. Step 10 sub-step 4 ticks the failed round's `Tasks` before it routes, and every task was ticked at its group's Step 8.
  - **Verify:** no. Each accepted gap's `TASK {N}` stays unticked, so change 2 ticks it.
- **Step 8 and Step 12 too?**
  - **Step 8:** yes, it has the same waste, so it is in scope.
  - **Step 12:** a tests pause cannot be answered Accept, so nothing changes there.
- **Do later rounds still honour the accepts?** Yes, unchanged. The group and holistic verifiers glob `build-decision-*.md` and treat an accepted gap as no gap (`.bkit/core/prompts/bkit-build-plan-verify.md`). So a holistic round after challenge fix groups does not raise them again.
- **`counters grant` with no new round?**
  - It still runs. It writes a row only when the limit is used up.
  - **Holistic:** [#951 — Build: repeat whole-feature checks re-check everything, costing hours](https://github.com/cbartens/bkit/issues/951) moves the grant to `build.holistic`, counted within the run with no reset after a clean check: `counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`. The granted round serves the holistic fix rounds later in the same run, after challenge fix groups. A resumed run keeps it. A restarted run starts its count at 0, so nothing carries over.
  - **Skipping costs no count:** under #951 a clean check no longer resets the count, so the skipped re-run would not have lowered it either.
  - **Verify:** the grant stays on `build.verify`, per group, unchanged.

### Success Criteria

- An all-Accept `From: holistic` pause goes to Step 11 with no new `build-plan-verify-holistic` row.
- An all-Accept `From: verify` pause with no `Gate: FAIL` ticks the accepted gaps' tasks and goes to Step 7 with no new `build-plan-verify` or `build-group-gate` row for that group.
- Any `Fix now` or `Try again` answer, or a `Gate: FAIL` pause, routes as today.
- A run stopped after a `continue` decision resumes at Build Challenge (holistic) or Plan Execute (verify).
- The Step 15 summary lists the skipped round's `FAIL` under Resolved Findings as settled by that Decision Pause, and the run's verdict is no worse than a passing re-run would give.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holistic pause, every item Accept | `continue` → Step 11, no new holistic round |
| Verify pause, every item Accept, no `Gate: FAIL` | Accepted gaps' tasks ticked, `continue` → Step 7 (next open group, or Step 10) |
| Verify pause, every item Accept, `Gate: FAIL` | `verify` → re-run Step 8 as today: the red gate is not an item and stays unsettled |
| Any item `Fix now` | `fix` → Step 7 as today |
| Loop question `Try again` | `retry` as today |
| Headless or `ask: false`, every recommendation Accept | Each becomes `Accept (assumed)`, `continue`; summary stays CONCERNS and ship asks the owner to confirm, as today |
| Headless, a recommendation is `Fix now` | `fix` as today |
| Limit used up, owner accepts every item | `counters grant` writes its row (`build.holistic` or `build.verify`); no round runs now, and the allowance serves later rounds in the same run |
| Run stops after the `continue` decision row | Resume at `build-challenge` (holistic) or `build-plan-tasks` (verify) |
| Holistic round after challenge fix groups | The verifier still reads the decision file, so the accepted gaps stay no gap |
| Challenge pause, every item Accept | `tests` → Step 12's first run, unchanged |
| Tests pause | Options stay `Try again` / `Stop`, unchanged |
| Debug Loop Question, ship Merge Question, ship Confirm Assumed Items | Unchanged |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| tick --decision ticks the tasks of accepted verify-gap items | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| tick --decision leaves a Fix now item's task open | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| a continue decision after a holistic round resumes at Build Challenge | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| a continue decision after a group verify resumes at Plan Execute | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| an all-Accept holistic pause settles the holistic FAIL before it | unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| a holistic pause with a Fix now item settles nothing | unit | `.bkit/core/engine/commands/workflow/summary.test.ts` |
| an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| continue sends holistic to Step 11 and verify to the decision tick then Step 7 | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| a Gate FAIL pause never routes continue | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| debug and ship questions offer no answer that re-runs a check without a change | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Engine support for the skip
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
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Workflow route and the rule for every workflow
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Build routes Accept-only pauses to continue
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 2 titles each verify-gap item `Task {N}` from its `TASK {N}` gap line
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 6, after the `Fix now` and `Try again` rules and before `From: holistic`, `From: verify` or `From: holistic` with every item `Accept` or `Accept (assumed)`, the loop question (when asked) `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`
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
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: a `Gate: FAIL` verify pause keeps re-running Step 8 even when every item is accepted. No item covers a red group gate, so nothing has settled it. Step 12's full run would also catch it, so skipping is possible, but that changes how red gates are handled and is left out.
- Assumed: ticking an accepted gap's task is correct. It matches what the re-run verifier does today: an accepted gap is no gap, so the task counts as satisfied.
- Assumed: `counters grant` still runs on `continue`. It writes only when the limit is used up, and the allowance serves later holistic fix rounds in the same run, because #951 counts `build.holistic` within the run.
- Assumed: a `continue` leaves the holistic test base where it was. Under #951, a repeat holistic check tests only the files changed since the last holistic check that found no problems. A skipped re-run writes no such row, so the next holistic check, after challenge fix groups, tests from the older clean commit, or `origin/dev` when there is none. That run is wider than one after a passing re-run, but its result is the same: the verifier still treats the accepted gaps as no gap. Recording the skip as a clean check would claim a check that never ran, so it is left out.

### Breaking Changes & Naming

- New `route` value `continue` on `build-decision` rows. Older rows keep their values, and `status resume` reads both. No migration.
- New flag `bkit tasks tick --decision=<file>`.

### Out of Scope

- What tests a repeat holistic check, the group gate or the debug soak runs: [#951 — Build: repeat whole-feature checks re-check everything, costing hours](https://github.com/cbartens/bkit/issues/951).
- How a red group gate is re-run on resume (`decisions apply --by=rerun`).
- The flaky `ENOTEMPTY` cleanup race in `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts`.

### References

- `.bkit/core/workflows/bkit-build.md` § Decision Pause (steps 2, 6, 7), § Step 7 — Plan Execute, § Step 8 — Plan Verify, § Step 10 — Plan Verify Holistic, § Step 15 — Summary
- `.bkit/core/workflows/bkit-debug.md` § Loop Question
- `.bkit/core/workflows/bkit-ship.md` § Confirm Assumed Items, § Merge Question
- `.bkit/core/prompts/bkit-build-plan-verify.md` (accepted gap → no gap)
- `.bkit/core/.bkit/workflows.md` § Cross-step invariants, § `/bkit-build` Decision Pause
- `docs/plans/202611/logs/814-local-test-limits/build-decision-1-2.md`
- [#951 — Build: repeat whole-feature checks re-check everything, costing hours](https://github.com/cbartens/bkit/issues/951)
- [#900 — Build: summary says FAIL after Fix now moved a group's gaps elsewhere](https://github.com/cbartens/bkit/issues/900)
- [#843 — Friction triage](https://github.com/cbartens/bkit/issues/843)

###### bkit:blocked-by start
- #951
###### bkit:blocked-by end

## Issue comment — posted 2026-11-15T05:43:07.000Z

Made this issue build ready, with no design step.

- **Retitled and widened.** The rule now covers every workflow: after an answer, a check runs again only when the answer changes code (`Fix now`), asks for another round (`Try again`), or a red gate is still unsettled.
- **Only build breaks the rule.** Debug's Loop Question and ship's Merge Question offer only `Stop` / `Try again`. Ship's Confirm Assumed Items only writes the answers. Plan and design run no tests after a question. Inside build, the tests, challenge and `UNPROVEN` pauses already avoid a pointless re-run.
- **The four questions are answered in the body.** Holistic tasks are already ticked. Accepted verify gaps are not, so a new `bkit tasks tick --decision` flag ticks them. Step 8 is in scope. Step 12 needs no change. Later rounds already honour the accepts. `counters grant` still runs.
- **Judgement calls, open to overrule:**
  - A verify pause with `Gate: FAIL` still re-runs Step 8, because no answer covers the red gate.
  - Ticking an accepted gap's task matches what the re-running verifier does today.
- **Shape:** two task groups. Group 1 holds the engine changes (`tasks.ts`, `step-table.ts`, `summary.ts`). Group 2 holds the workflow route, the rule in `.bkit/core/.bkit/workflows.md`, a `docs/decisions.jsonl` row and an audit test for debug and ship. The plan checker passes, apart from the three-column test matrix the issue form uses.
- **Board:** Size M, `next:build`. Still blocked by [#951 — Build: repeat whole-feature checks re-check everything, costing hours](https://github.com/cbartens/bkit/issues/951), because both rewrite the same Decision Pause lines.
