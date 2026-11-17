# Brief: group 1 — The planned-test lock in the engine (tests)

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

- Group 1: The planned-test lock in the engine — this group
  - TASK 1: Lock the plan-named tests of every group with a red row — open
  - TASK 2: Make the `BLOCKED` escape real: read the step's log, let named changes through and record them — open
  - TASK 3: Use a recorded change as the next baseline for the lock and for `tests red` — open
- Group 2: `tests green`, the build workflow, prompts and docs — next
  - TASK 4: List the changed tests in `tests green`, for verify and for Step 15 — open
  - TASK 5: Offer the working `BLOCKED` line, and ask about changed tests once at Step 15 — open
  - TASK 6: Tell the code and verify agents how a needed planned-test change is kept and reported — open
  - TASK 7: Document the lock's contract, rebuild `dist/` and re-render the mirrors — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Lock the plan-named tests of every group with a red row
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: remove its `group` parameter, so it checks every group's red entries; keep the `plan?: string` parameter and its inline plan-named key set, which keeps done tasks (`- [x]`) because `readTestFirst` reads every task block, unlike `tests red`'s skip at `tests.ts:1981`
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: replace the own-group condition (`steps.ts:1296-1299`) with one for `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`; keep the plan lookup (`--plan`, else `runPlanPath`) as it is, and pass the plan text to `touchedTests`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new cases reuse the suite's existing temp-repo fixture, with no extra repo per case, and pass `--plan=plan.md` as the landed superseded-test case does
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt by the same `pnpm build` and staged with it
  - **READ:** `runPlanPath` in `.bkit/core/engine/commands/workflow/tests.ts`: the plan path the finish derives without `--plan`
  - **READ:** `readTestFirst` in `.bkit/core/engine/commands/workflow/tests.ts`: the plan's `TEST FIRST` specs
  - **READ:** `redKey` in `.bkit/core/engine/commands/workflow/tests.ts`: the `[task, test, name]` key
  - **DONE WHEN:** `touchedTests` takes `(top, file, workflow, plan?)`; `pnpm build` exits 0 and `dist/` is staged; the two tests below pass, and the rest of the `bkit steps finish — the tests step touches only tests, the code steps never touch a test` suite still passes, including `skips a red record for a test name the plan no longer holds, and still locks the planned test` and `finds the run's plan beside its status file`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses the execute step when it changes another group's planned test, exit 11` fails on a group 2 execute step finishing with exit 0 while it changed group 1's planned test, with group 1's tasks ticked `[x]` in the fixture plan as Step 8's `tasks tick` leaves them
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses the gaps-remediate step when it changes another group's planned test, exit 11` fails on a group 2 gaps fix finishing with exit 0 while it changed group 1's planned test, with group 1's tasks ticked `[x]` in the fixture plan

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Make the `BLOCKED` escape real: read the step's log, let named changes through and record them
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add an exported `blockedTests(log)` beside `passesLines`, reading ``BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why}`` lines (em dash, en dash or hyphen) as `{test, name, reason}`
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: return each changed test's `task` and current `block` for `finish`'s internal use; the signature stays `(top, file, workflow, plan?)` as Task 1 leaves it
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: read `blockedTests` from the first `--artifact`; let a changed test through when a line names it (its recorded name or the last `>` segment) and add `{task, test, testName, block, reason}` to `extras.changedTests`; refuse the rest with exit 11 and the rewritten problem text that names the line form; the emitted `tests` list keeps its `{test, name}` shape
  - **UPDATE:** `stepsCommand` in `.bkit/core/engine/commands/workflow/steps.ts`: rewrite the `--plan` flag help and the exit 11 help to name the `BLOCKED` line the lock reads; the help still documents `tests: [{test, name}]`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new cases reuse the suite's existing temp-repo fixture, with no extra repo per case
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt by the same `pnpm build` and staged with it
  - **READ:** `passesLines` in `.bkit/core/engine/commands/workflow/tests.ts`: the sibling line-reader style
  - **READ:** `recordTestLockFriction` in `.bkit/core/engine/commands/workflow/steps.ts`: stays on the refusal path only
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `blockedTests` is exported from `tests.ts`; a code step whose log names its changed planned test exits 0 and its `step-done` row carries `changedTests`; an unnamed change still exits 11 with `tests: [{test, name}]`; `pnpm build` exits 0 and `dist/` is staged; the nine tests below pass, and the rest of the suite still passes, including the existing `r.json.tests` assertions at `steps.test.ts:1905`, `:1951` and `:1967`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` fails on no entry, or a wrong file, name or reason, read from a `TASK` or a `Gap` line
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > ignores a BLOCKED line that names no test` fails on an entry read from a plain `BLOCKED — TASK {N}: {title} — {reason}` line or a test line with no reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` fails on exit 11, or on a row with no `changedTests` entry holding the test, its new block and the reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its BLOCKED line names the changed test by the last segment of its name` fails on exit 11 for a test whose `BLOCKED` line names only the last `>` segment of its recorded name
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test` fails on the gaps fix's exit 11, or on a row with no `changedTests` entry, when its log holds a `BLOCKED — Gap {N}: test` line for the test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records only the changed test when a BLOCKED line also names an unchanged one` fails on exit 11, or on a `changedTests` list that is not exactly the one changed test, when the log names a changed and an unchanged planned test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses only the changed planned tests no BLOCKED line of the log names` fails on exit 0, or on `tests` naming the test the log's line named
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal names the BLOCKED line the engine reads` fails on a `problem` text that does not hold the `BLOCKED — TASK {N}: test` form with the test's file and name
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the exit 11 help names the BLOCKED line that lets a change through` fails on exit 11 help that still says only "log the task BLOCKED"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Use a recorded change as the next baseline for the lock and for `tests red`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add an exported `lockBaselines(rows, planned)`, where `planned` is the plan-named key set `touchedTests` builds, or `null` for every key when no plan text is found: every group's `build-tests-red` entries and the code steps' `changedTests` records in `status.jsonl` order, the latest per key as the baseline
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: compare each plan-named test with its `lockBaselines` record
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: a `BLOCKED` line lets a test through only when no earlier `changedTests` record of that test carries the line's reason, so a line left in a log that a group's attempts share lets no re-change through
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `tests red`'s `standing` check (`tests.ts:1959-1970`) reads the block from `lockBaselines`, so a test a code step changed under a `BLOCKED` line stands while its lines match the recorded change
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new cases reuse the suite's existing temp-repo fixture, with no extra repo per case; each records its earlier change through a real `steps finish`, never a hand-typed row
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt by the same `pnpm build` and staged with it
  - **READ:** `redEntries` in `.bkit/core/engine/commands/workflow/tests.ts`: stays as it is for `tests green`'s red audit and `context brief --tests-only`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `lockBaselines` is exported from `tests.ts` and is the only baseline `touchedTests` and the `tests red` `standing` check read; `pnpm build` exits 0 and `dist/` is staged; the five tests below pass, and the rest of the `steps.test.ts` and `tests.test.ts` suites still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a later code step that leaves a BLOCKED change as it is` fails on the later step's exit 11 for a test the earlier step's row recorded, where a real finish wrote that row
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a later code step that changes a BLOCKED change again` fails on the first finish not exiting 0 with a `changedTests` entry for the test, or on the later step finishing with exit 0 after changing the recorded lines again while the earlier step's `BLOCKED` line is still in the same log
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line` fails on exit 11, or on a later `changedTests` entry holding the earlier block or reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `uses a red the tests step recorded after a code step's change as the baseline` fails on the first finish not exiting 0 with its `changedTests` entry, or on a later code step finishing with exit 0 after changing a test whose newest record is the later red
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `red keeps a test standing whose lines match a code step's recorded change` fails on `tests red` re-running a test whose lines match its latest `changedTests` record and recording it as not red

<!-- bkit:task 3 end -->

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
