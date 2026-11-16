# Brief: group 4 — Holistic fix — planned tests Task 11's add-only rule changed

Plan: Planned-Test Lock: Cross-Group Changes, Superseded Tests and a Working BLOCKED Escape Implementation Plan

## Why and what

### Context & Goals

`bkit steps finish` locks every planned test case after its red: a code step (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) whose diff changes a planned test's own lines is refused with exit 11 (`touchedTests`, `.bkit/core/engine/commands/workflow/tests.ts:320`, called at `.bkit/core/engine/commands/workflow/steps.ts:1308`). Issue #914 found three faults in that lock during #891's build:

<!-- prettier-ignore -->
| # | Fault | Cause in the code | Owner decision (issue comment, 2026-11-10T06:56:35Z) |
| --- | --- | --- | --- |
| 1 | A change to another group's planned test is caught only by a later holistic round that never touched the file. | `steps.ts:1296-1308` passes `group` to `touchedTests` for `build-plan-tasks` and `build-plan-gaps-remediate`, so only the step's own group is checked; the holistic step passes `undefined` and checks every group. | Both code steps check the planned tests of every group that already has a red row. |
| 2 | A planned test the owner superseded stays locked. | Fixed on `dev` by #926 (commit e4377aad7), so this plan adds no work for it: `finish` reads `--plan`, else the plan beside the status file (`runPlanPath`, `tests.ts:301`), and `touchedTests` skips a red entry whose `redKey` no `TEST FIRST` line names (`tests.ts:327-345`). With no plan file there, it checks every recorded red test. | A red row's test that the current plan no longer names is not checked. |
| 3 | The refusal offers a `BLOCKED` escape the engine never reads. | The exit 11 problem text (`steps.ts:1312`) and the exit-code help (`steps.ts:2067`) say "log the task BLOCKED", but nothing reads the agent's log. | Make the escape real: a `BLOCKED` line naming the test lets the step through, the change reaches the owner at the build Decision Pause, and a headless or `ask: false` run records an assumed accept that ship asks the owner to confirm. A changed test with no `BLOCKED` line naming it is still refused. |

**Goals:**

- Keep the lock's guarantee: no code agent can quietly weaken a planned test, because every change it keeps reaches the owner.
- Refuse a cross-group change in the step that made it, so a later step that did not touch the file is never refused for it.
- Stop failing runs whose code change is correct but forces a planned test's setup to change.

**Approach in one paragraph:** the code-step finish already reads the plan (`--plan`, else `runPlanPath`) and checks only the tests its `TEST FIRST` fields name; this plan makes the three code steps check those tests across every group with a red row. The engine reads the step's own log for ``BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why}`` lines; a changed test that such a line names is let through and recorded on the step's `step-done` row (`changedTests`), which becomes the test's new baseline for later steps. `tests green` lists those tests as `changed`, and build Step 15 asks the owner about them once, at a `CHANGED_TESTS` Decision Pause, before the existing `UNPROVEN` pause.

**Related Issues:**

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (CLOSED)
- #926 — Build: code step refused for a planned test the plan no longer names (CLOSED): fault 2's fix, already on `dev`

---

### Narrative

The owner runs `/bkit-build`, and the lock still makes sure a code agent can't quietly weaken a test until it passes. Every change to a planned test reaches the owner, without failing a run whose change is correct.

### Success Criteria

The owner chose these (Open Question Q1, answer A): the issue's `Expected` bullets and the owner's decisions (issue comment 2026-11-10T06:56:35Z), word for word.

1. A code step that changes another group's planned test is flagged in that step, not in a later holistic round.
2. A red row whose test the plan no longer names is not checked.
3. When a code step genuinely has to change a planned test, for example new setup lines that a correct code change forces while the assertions stay the same, it keeps the edit and logs the task BLOCKED, naming the test and saying why the change is needed. `steps finish` reads that line and lets the step through instead of refusing with exit 11.
4. The changed test then appears as an item at the build Decision Pause, where the owner accepts or rejects it. A headless or `ask: false` run takes the recommendation and records it as an assumed accept, the same as other assumed accepts, so ship asks the owner to confirm it.
5. A planned test that changed with no BLOCKED line naming it is still refused, as today.

### Out of Scope

None — every item the issue and the owner's decisions name is in the runbook, except fault 2's skip, which is already on `dev` (#926); Task 1 keeps its landed test passing.

## Where it fits

- Group 1: The planned-test lock in the engine — done
  - TASK 1: Lock the plan-named tests of every group with a red row — done
  - TASK 2: Make the `BLOCKED` escape real: read the step's log, let named changes through and record them — done
  - TASK 3: Use a recorded change as the next baseline for the lock and for `tests red` — done
- Group 2: `tests green`, the build workflow, prompts and docs — done
  - TASK 4: List the changed tests in `tests green`, for verify and for Step 15 — done
  - TASK 5: Offer the working `BLOCKED` line, and ask about changed tests once at Step 15 — done
  - TASK 6: Tell the code and verify agents how a needed planned-test change is kept and reported — done
  - TASK 7: Document the lock's contract, rebuild `dist/` and re-render the mirrors — done
- Group 3: Challenge round 1 findings — done
  - TASK 8: A code agent writes a planned test whose red recorded its file `missing`, and every code step now lets it through without a refusal or a `changedTests` record — done
  - TASK 9: A later code step puts a `BLOCKED`-changed test back as the tests step wrote it, is refused, and the re-ask tells it to do what it already did — done
  - TASK 10: A re-asked code agent re-appends the `BLOCKED` line with a reason already recorded for the test, the engine skips it without saying why, and the run takes the Failure Path — done
  - TASK 11: A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words — done
- Group 4: Holistic fix — planned tests Task 11's add-only rule changed — this group
  - TASK 12: Take over the ten `steps.test.ts` planned tests of Tasks 2-3 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one — open
  - TASK 13: Take over the three `tests green` and cross-group planned tests of Task 4 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one — open

## The work

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Take over the ten `steps.test.ts` planned tests of Tasks 2-3 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the ten tests below, each setting up a change that adds lines to the planned test, never one that rewrites or removes a line, so they hold under Task 11's add-only rule
  - **READ:** `docs/plans/202611/logs/914-build-planned-test/build-decision-1-4.md`: the owner's direction for this task
  - **READ:** `docs/plans/202611/logs/914-build-planned-test/build-decision-1-3.md`: the owner's acceptance of the group 3 rewrites
  - **DEPENDS ON:** 11
  - **DONE WHEN:** Each of the ten tests below sets up an additive change under its `BLOCKED` line and keeps the behaviour its `fails on` names; the ten tests pass; the rest of the `steps.test.ts` suite still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` fails on exit 11, or on a row with no `changedTests` entry holding the test, its new block and the reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its BLOCKED line names the changed test by the last segment of its name` fails on exit 11 for a test whose `BLOCKED` line names only the last `>` segment of its recorded name
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test` fails on the gaps fix's exit 11, or on a row with no `changedTests` entry, when its log holds a `BLOCKED — Gap {N}: test` line for the test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records only the changed test when a BLOCKED line also names an unchanged one` fails on exit 11, or on a `changedTests` list that is not exactly the one changed test, when the log names a changed and an unchanged planned test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses only the changed planned tests no BLOCKED line of the log names` fails on exit 0, or on `tests` naming the test the log's line named
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal names the BLOCKED line the engine reads` fails on a `problem` text that does not hold the `BLOCKED — TASK {N}: test` form with the test's file and name
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a later code step that leaves a BLOCKED change as it is` fails on the later step's exit 11 for a test the earlier step's row recorded, where a real finish wrote that row
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a later code step that changes a BLOCKED change again` fails on the first finish not exiting 0 with a `changedTests` entry for the test, or on the later step finishing with exit 0 after changing the recorded lines again while the earlier step's `BLOCKED` line is still in the same log
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line` fails on exit 11, or on a later `changedTests` entry holding the earlier block or reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `uses a red the tests step recorded after a code step's change as the baseline` fails on the first finish not exiting 0 with its `changedTests` entry, or on a later code step finishing with exit 0 after changing a test whose newest record is the later red

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Take over the three `tests green` and cross-group planned tests of Task 4 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: the two `green` tests below, each setting up a change that adds lines to the planned test
  - **UPDATE:** `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`: the cross-group test below, its group 2 change adding lines to group 1's planned test
  - **READ:** `docs/plans/202611/logs/914-build-planned-test/build-decision-1-4.md`: the owner's direction for this task
  - **READ:** `docs/plans/202611/logs/914-build-planned-test/build-decision-1-3.md`: the owner's acceptance of the group 3 rewrites
  - **DEPENDS ON:** 11
  - **DONE WHEN:** Each of the three tests below sets up an additive change under its `BLOCKED` line and keeps the behaviour its `fails on` names; the three tests pass; the rest of the `tests.test.ts` suite still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` fails on `changed` being absent or empty, a gap raised for the test, or a report with no `Changed by a code step` section
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a changed test the plan no longer names out of changed` fails on `changed` not equalling exactly the one plan-named entry while a `changedTests` record of a test no `TEST FIRST` line names exists, so a missing `changed` key also fails
    - `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` fails on the group 2 step or the later holistic step exiting 11, or on `tests green` not listing the test as changed, with group 1's tasks ticked `[x]` in the fixture plan

<!-- bkit:task 13 end -->

### Earlier tasks this group depends on

- TASK 11 (group 3, done): A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Prove the finish-to-green wiring through the CLI | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/*.integration.test.ts` (eight files); `grep -ln -e 'tests green' -e 'steps finish' .bkit/core/engine/commands/workflow/*.integration.test.ts` | None — no integration test drives `steps finish` and `tests green` together; `tests-lock.integration.test.ts` covers the machine-wide `tests` run lock, a different subject | NEW | Reason (a): the searches find no integration test of the build's test-first commands. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.test.ts`

- **Existence Check:** the file exists; suite `bkit steps finish — the tests step touches only tests, the code steps never touch a test` at line 1728, its `codeStep` argument builder at 1747, the landed superseded-test case at 1915.
- Add the Task 1, 2 and 3 tests on the suite's existing fixtures. The `codeStep` argument builder stays as it is; a new case that needs the plan passes `--plan=plan.md` itself, as the landed superseded-test case does. The cross-group fixtures tick group 1's tasks `[x]`, as a real run's Step 8 leaves them.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** the file exists; suite `bkit tests red / green` at line 2123.
- Add the `blockedTests` tests, the `tests red` standing test and the `tests green` `changed` tests. Fixtures write `changedTests` rows through a real `steps finish` or the row builder `finish` uses, never a hand-typed row, so a fixture cannot drift from what `finish` writes (`changedTests` keeps `testName`; `changed` and `blockedTests` use `name`).

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202611/914-build-planned-test-plan.md § Reuse Inventory and § Architecture & Component Changes.
