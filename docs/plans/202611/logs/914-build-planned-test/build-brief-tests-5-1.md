# Brief: group 5 — Challenge round 2 findings (tests)

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
- Group 5: Challenge round 2 findings — this group
  - TASK 14: In a repo with no `bkit:test:file` script, a code agent keeps a planned-test change under a `BLOCKED` line and it merges unseen, because `tests green` prints `changed: []` whenever test-first is not enforced — open
  - TASK 15: A later group's tests step adds a test to a file whose earlier-group planned test has no recorded block, and every later code step is refused with exit 11 that no `BLOCKED` line can clear — open
  - TASK 16: A `changedTests` record on any step row, written through `--field changedTests=...` or with no reason, moves the lock's baseline, and `tests green` then hides it from the owner — open
  - TASK 17: A code agent writes a planned test whole, after its red recorded the file `missing`, under a `BLOCKED` line, and the owner's `CHANGED_TESTS` item carries no diff, only the agent's reason — open
  - TASK 18: A code agent adds one `return;` line before a planned test's assertions, logs a `BLOCKED` reason, and the engine lets the disabled test through as "additive", while verify only notes it — open

## The work

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** In a repo with no `bkit:test:file` script, a code agent keeps a planned-test change under a `BLOCKED` line and it merges unseen, because `tests green` prints `changed: []` whenever test-first is not enforced
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:2481` · **Round:** 2
  - **DONE WHEN:** `tests green` builds its `changed` list from `lockBaselines` before the not-enforced return and prints it (and the `## Changed by a code step` report section) on that path too, because the lock in `steps finish` runs on the red row's blobs whether or not the test-file script exists. Step 15 then reaches the `CHANGED_TESTS` pause for such a repo.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a changed test when test-first is not enforced` fails on `changed: []` when the test-file script is undeclared and a `build-plan-tasks` row written by `writeStepRow` carries a `changedTests` record for a plan-named test

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** A later group's tests step adds a test to a file whose earlier-group planned test has no recorded block, and every later code step is refused with exit 11 that no `BLOCKED` line can clear
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:468` · **Round:** 2
  - **DONE WHEN:** A planned test whose lines the lock cannot find (red `block` null, for example a parameterised `it.each` name) stays locked by its whole file across every later group, and its whole-file baseline is the newest `blob` any later `tests red` row recorded for the same file, so a later tests step's added test becomes the new baseline. A code step whose diff changes that file is still refused with exit 11, and a code step that did not touch the file is never refused for it (goal 2).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block` fails on exit 11 when group 1's red entry has `block: null` (its name is not in the file) and group 2's red row records a new test appended to the same file
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11` fails on exit 0 when group 2's red row moved the file's baseline and group 2's execute step then edits a line of group 1's unlocated test

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** A `changedTests` record on any step row, written through `--field changedTests=...` or with no reason, moves the lock's baseline, and `tests green` then hides it from the owner
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:377` · **Round:** 2
  - **DONE WHEN:** `lockBaselines` reads `changedTests` only from `step-done` rows of `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`, and only records with a non-empty string `reason`, so every record that moves a baseline is one `tests green` lists. `steps finish` and `steps record` refuse a `--field changedTests` with a usage error, so only the lock writes the field.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a changedTests record on a non-code-step row does not move the lock's baseline` fails on exit 0 when a `build-plan-verify` row written by `writeStepRow` carries a reason-less `changedTests` record holding the weakened test's block, and the execute step then removes an `expect` line from the planned test with no `BLOCKED` line
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a --field changedTests on a step finish` fails on exit 0 and a row carrying the forged `changedTests`

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** A code agent writes a planned test whole, after its red recorded the file `missing`, under a `BLOCKED` line, and the owner's `CHANGED_TESTS` item carries no diff, only the agent's reason
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:486` · **Round:** 2
  - **DONE WHEN:** `baselineDiff` reads a null baseline blob (a red that recorded the file `missing`) as empty text, so the diff lists every line of the test as added and `additive` is `true`. `tests green`'s `changed` entry for such a test then carries that diff, and the § Decision Pause item shows it. A baseline blob that is set but unreadable still gives null, so `steps finish` keeps refusing it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives a changed test whose red recorded its file missing every line of the test as added` fails on a `changed` entry with `diff: null` after a red row records the test `missing` with `blob: null` and a `build-plan-tasks` row records a `changedTests` entry for the file the code step then wrote

<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** A code agent adds one `return;` line before a planned test's assertions, logs a `BLOCKED` reason, and the engine lets the disabled test through as "additive", while verify only notes it
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1333` · **Round:** 2
  - **DONE WHEN:** The verify prompt's `Changed by a code step` rule (`bkit-build-plan-verify.md:96-97`) reads the added lines of each `changed` test's diff the way its `Updated tests` rule (`bkit-build-plan-verify.md:99`) reads an updated test's, and an added line that disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test) raises a `test-loosened` gap that the tests step restores. The engine's let-through gate (`steps.ts:1333`) is unchanged. The exit 11 refusal text (`steps.ts:1377`) says what is guaranteed: the engine refuses a `BLOCKED`-named change that removes a line of a planned test, and verify reads every added line; it no longer says a `BLOCKED` line "cannot remove or loosen" a planned test. The `The red test stays` bullet of `docs/testing.md` (`docs/testing.md:314`) says that verify reads the added lines of a `BLOCKED`-named change.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment` fails on a `Changed by a code step` rule that only lists the test and its reason in `Notes` and raises no gap
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the exit 11 refusal says verify reads a BLOCKED change's added lines` fails on a refusal problem text that says a `BLOCKED` line cannot loosen a planned test

<!-- bkit:task 18 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `refuses the execute step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `refuses the gaps-remediate step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `skips a red record for a test name the plan no longer holds, and still locks the planned test` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `blockedTests > ignores a BLOCKED line that names no test` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `lets a code step through when its BLOCKED line names the changed test by the last segment of its name` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `records only the changed test when a BLOCKED line also names an unchanged one` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `refuses only the changed planned tests no BLOCKED line of the log names` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `the refusal names the BLOCKED line the engine reads` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `the exit 11 help names the BLOCKED line that lets a change through` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `passes a later code step that leaves a BLOCKED change as it is` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `refuses a later code step that changes a BLOCKED change again` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `uses a red the tests step recorded after a code step's change as the baseline` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 12 |
| `red keeps a test standing whose lines match a code step's recorded change` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 13 |
| `green leaves a changed test the plan no longer names out of changed` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 13 |
| `green prints an empty changed list and no Changed by a code step section when no code step changed a test` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `an exit 11 re-ask offers the BLOCKED test line the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `Step 15 asks once about planned tests a code step changed, before the unproven ones` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `a changed-test item offers Accept or Stop, recommended Accept` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `the execute prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| `the remediate prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| `the verify prompt notes a planned test a code step changed and raises no gap` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| refuses a code step that writes a planned test whose red recorded its file missing, exit 11 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| the refusal of a restored BLOCKED change names the recorded change as the lines to put back | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 9 |
| the refusal of a re-change says the logged reason is already recorded | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 10 |
| refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 11 |
| records the baseline blob on a BLOCKED-named change that only adds lines | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 11 |
| green gives each changed test the line diff of its own lines since its baseline and whether it is additive | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 11 |
| a changed-test item shows the test's line diff since its baseline | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |
| the code prompts say a BLOCKED line lets through only a change that adds lines | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |
| green lists a changed test when test-first is not enforced | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 14 |
| passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 15 |
| still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 15 |
| a changedTests record on a non-code-step row does not move the lock's baseline | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 16 |
| refuses a --field changedTests on a step finish | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 16 |
| green gives a changed test whose red recorded its file missing every line of the test as added | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 17 |
| the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 18 |
| the exit 11 refusal says verify reads a BLOCKED change's added lines | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 18 |
