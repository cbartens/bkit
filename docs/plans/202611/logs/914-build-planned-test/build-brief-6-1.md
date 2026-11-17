# Brief: group 6 — Verify fix — Task 11's planned test Task 18's refusal wording changed

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
- Group 4: Holistic fix — planned tests Task 11's add-only rule changed — done
  - TASK 12: Take over the ten `steps.test.ts` planned tests of Tasks 2-3 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one — done
  - TASK 13: Take over the three `tests green` and cross-group planned tests of Task 4 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one — done
- Group 5: Challenge round 2 findings — done
  - TASK 14: In a repo with no `bkit:test:file` script, a code agent keeps a planned-test change under a `BLOCKED` line and it merges unseen, because `tests green` prints `changed: []` whenever test-first is not enforced — done
  - TASK 15: A later group's tests step adds a test to a file whose earlier-group planned test has no recorded block, and every later code step is refused with exit 11 that no `BLOCKED` line can clear — done
  - TASK 16: A `changedTests` record on any step row, written through `--field changedTests=...` or with no reason, moves the lock's baseline, and `tests green` then hides it from the owner — done
  - TASK 17: A code agent writes a planned test whole, after its red recorded the file `missing`, under a `BLOCKED` line, and the owner's `CHANGED_TESTS` item carries no diff, only the agent's reason — done
  - TASK 18: A code agent adds one `return;` line before a planned test's assertions, logs a `BLOCKED` reason, and the engine lets the disabled test through as "additive", while verify only notes it — done
- Group 6: Verify fix — Task 11's planned test Task 18's refusal wording changed — this group
  - TASK 19: Take over Task 11's `steps.test.ts` planned test whose `problem` check names the refusal wording Task 18 replaced — open

## The work

<!-- bkit:task 19 start -->

- [ ] **TASK 19:** Take over Task 11's `steps.test.ts` planned test whose `problem` check names the refusal wording Task 18 replaced
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: the test below, its `problem` check matching the exit 11 refusal wording Task 18 sets
  - **READ:** `docs/plans/202611/logs/914-build-planned-test/build-decision-1-7.md`: the owner's direction for this task
  - **DEPENDS ON:** 11, 18
  - **DONE WHEN:** The test below sets up an execute step that deletes an `expect` line from the planned test under a `BLOCKED` test line, and checks exit 11, an unchanged `HEAD`, and a `problem` that says the engine refuses a `BLOCKED`-named change that removes a line of a planned test; the test passes; the rest of the `steps.test.ts` suite still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` fails on exit 0, or on a `problem` that does not say the engine refuses a `BLOCKED`-named change that removes a line of a planned test, when the execute step deletes an `expect` line from the planned test and its log names the test in a `BLOCKED` test line

<!-- bkit:task 19 end -->

### Earlier tasks this group depends on

- TASK 11 (group 3, done): A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words
- TASK 18 (group 5, done): A code agent adds one `return;` line before a planned test's assertions, logs a `BLOCKED` reason, and the engine lets the disabled test through as "additive", while verify only notes it

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.test.ts`

- **Existence Check:** the file exists; suite `bkit steps finish — the tests step touches only tests, the code steps never touch a test` at line 1728, its `codeStep` argument builder at 1747, the landed superseded-test case at 1915.
- Add the Task 1, 2 and 3 tests on the suite's existing fixtures. The `codeStep` argument builder stays as it is; a new case that needs the plan passes `--plan=plan.md` itself, as the landed superseded-test case does. The cross-group fixtures tick group 1's tasks `[x]`, as a real run's Step 8 leaves them.
