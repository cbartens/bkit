# Brief: group 3 — Challenge round 1 findings (tests)

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
- Group 3: Challenge round 1 findings — this group
  - TASK 8: A code agent writes a planned test whose red recorded its file `missing`, and every code step now lets it through without a refusal or a `changedTests` record — open
  - TASK 9: A later code step puts a `BLOCKED`-changed test back as the tests step wrote it, is refused, and the re-ask tells it to do what it already did — open
  - TASK 10: A re-asked code agent re-appends the `BLOCKED` line with a reason already recorded for the test, the engine skips it without saying why, and the run takes the Failure Path — open
  - TASK 11: A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A code agent writes a planned test whose red recorded its file `missing`, and every code step now lets it through without a refusal or a `changedTests` record
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:436` · **Round:** 1
  - **DONE WHEN:** In `touchedTests`, the `t.blob === null` skip applies only to a baseline that came from a `changedTests` record (`fromChange`). A `build-tests-red` baseline with no blob and no block is refused when the test's file exists, as on `origin/dev`, unless a `BLOCKED` test line names it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step that writes a planned test whose red recorded its file missing, exit 11` fails on exit 0 when the red row's entry is `{state: "missing", blob: null}` with no block, and the execute step then creates the file holding that test with no `BLOCKED` line

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** A later code step puts a `BLOCKED`-changed test back as the tests step wrote it, is refused, and the re-ask tells it to do what it already did
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1344` · **Round:** 1
  - **DONE WHEN:** When a refused test's baseline is a code step's `changedTests` record, the exit 11 `problem` names that recorded change as the lines to put back, not "as the tests step left it" or "what the group's tests step recorded at its red". The text then matches `.bkit/core/.bkit/workflows.md` § Test-first, which already says the baseline is the red's block or a later `changedTests` block. The `problem` for a test whose baseline is a red is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a restored BLOCKED change names the recorded change as the lines to put back` fails on a `problem` holding "as the tests step left it" after a first finish records a `changedTests` entry and a later remediate step restores the test's original red lines and exits 11

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A re-asked code agent re-appends the `BLOCKED` line with a reason already recorded for the test, the engine skips it without saying why, and the run takes the Failure Path
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1328` · **Round:** 1
  - **DONE WHEN:** When a changed test is refused while a `BLOCKED` line of the log names it with a reason already in `c.reasons`, the exit 11 `problem` says that line's reason is already recorded for that test and a new reason is needed. A line that names the test with a reason not yet recorded still lets it through.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a re-change says the logged reason is already recorded` fails on a `problem` that does not contain the reused reason `needs a 2` when a second execute attempt changes the test again and its log carries only the first attempt's `BLOCKED` line

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:2372` · **Round:** 1
  - **DONE WHEN:** A `BLOCKED` line lets a planned-test change through only when the change is additive: it adds lines to the test's own lines and removes none, the same `additive` the `Updated tests` path computes. `steps finish` stores the baseline blob with `git hash-object -w` in each `changedTests` record, so the diff can be rebuilt later. A change that removes or rewrites any of the test's own lines is refused with exit 11 even when a `BLOCKED` line names it, and the `problem` says a `BLOCKED` line cannot remove or loosen a planned test's lines. Every `changed` entry of `tests green` carries `diff` (the test's own-line diff from its baseline) and `additive`. The `## Changed by a code step` report line (`tests.ts:1649`) and the § Decision Pause `CHANGED_TESTS` item rule (`bkit-build.md:154`) show that diff. The execute and remediate prompts, `.bkit/core/.bkit/workflows.md` § Test-first and `docs/testing.md` § Test first say a `BLOCKED` line lets through only a change that adds lines. The tests of Tasks 1-4 still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` fails on exit 0, or on a `problem` that does not say a `BLOCKED` line cannot remove or loosen a planned test's lines, when the execute step deletes an `expect` line from the planned test and its log names the test in a `BLOCKED` test line
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records the baseline blob on a BLOCKED-named change that only adds lines` fails on exit 11, or on a `changedTests` record with no stored baseline blob that `git cat-file` can read, when the execute step adds an `expect` line to the planned test under a `BLOCKED` test line
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives each changed test the line diff of its own lines since its baseline and whether it is additive` fails on a `changed` entry with no `diff` or `additive: true`, or a `diff` without the added `expect` line, after a code step's finish added an `expect` line to the planned test under a `BLOCKED` line
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a changed-test item shows the test's line diff since its baseline` fails on a § Decision Pause `CHANGED_TESTS` item rule that names only the task number, the test name and the step's reason
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the code prompts say a BLOCKED line lets through only a change that adds lines` fails on an execute or remediate prompt whose `BLOCKED` test line guidance does not say a change that removes or rewrites a planned test's lines is refused

<!-- bkit:task 11 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `refuses the execute step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `refuses the gaps-remediate step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `skips a red record for a test name the plan no longer holds, and still locks the planned test` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `blockedTests > ignores a BLOCKED line that names no test` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `lets a code step through when its BLOCKED line names the changed test by the last segment of its name` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `records only the changed test when a BLOCKED line also names an unchanged one` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `refuses only the changed planned tests no BLOCKED line of the log names` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `the refusal names the BLOCKED line the engine reads` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `the exit 11 help names the BLOCKED line that lets a change through` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `passes a later code step that leaves a BLOCKED change as it is` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| `refuses a later code step that changes a BLOCKED change again` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| `records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| `uses a red the tests step recorded after a code step's change as the baseline` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| `red keeps a test standing whose lines match a code step's recorded change` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| `green leaves a changed test the plan no longer names out of changed` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
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
