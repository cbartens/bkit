## Session Prompt — this run's, newer than everything below

914

## Issue description — oldest

## What happens

`bkit steps finish` refuses a build commit with exit 11 when a planned test differs from the lines its group's tests step recorded at its red (`touchedTests`, `.bkit/core/engine/commands/workflow/tests.ts:309`, called at `.bkit/core/engine/commands/workflow/steps.ts:1262`). Two problems surfaced in #891's build:

### 1. A change to another group's planned test is caught only at the holistic fix

The check covers only the step's own group for `build-plan-tasks` and `build-plan-gaps-remediate`, and every group only for `build-plan-gaps-remediate-holistic`. A code step that legitimately has to reshape an earlier group's planned test is waved through. The refusal then lands on a later, unrelated holistic fix round that never touched the file.

In #891, group 7 Task 20 made `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. The group 3 (Task 8) planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` composed exactly that file, so its setup had to change; its assertions stayed the same. Group 7's finish passed. The holistic fix of attempt 4 (help-text wording only) then failed exit 11 twice.

### 2. A planned test the owner superseded stays locked

Task 16 was rewritten after an owner decision, replacing its `TEST FIRST` test. The old name, `bkit tests base > a gate red on a non-test stage as well never reads all`, is still in group 6's first `build-tests-red` row (state `missing`). The plan no longer names it and the file never held it, yet `touchedTests` keeps reporting it as changed.

### 3. The refusal offers a BLOCKED escape the engine never reads

The problem text says "...or log the task BLOCKED naming the test and what it gets wrong", and the `steps finish` help says the same. `touchedTests` reads only the red rows and the test files. No BLOCKED line in the agent's log changes the result, so the re-ask the workflow prescribes can't succeed when restoring the test would be wrong, and the run goes to the Failure Path.

## Expected

- A code step that changes another group's planned test is flagged in that step, not in a later holistic round.
- A red row whose test the plan no longer names is not checked.
- Either the BLOCKED escape works (the check reads it), or the message and help stop offering it.

## Found in

#891 build, holistic attempt 4, 2026-11-10.

## Issue comment — posted 2026-11-10T06:11:24.000Z

**Label added: `next:design`**

The issue had no `next:*` label. The cause of all three problems is known, but point 3 under "Expected" is an open choice: make the `BLOCKED` escape work, or stop offering it. Point 1 says what should happen but not how. That is design's job (`.bkit/workflows.md:58`). If the owner settles point 3 in a comment, the issue can skip design and go to `/bkit-plan 914`.

## Issue comment — posted 2026-11-10T06:56:35.000Z

### Owner decisions (design no longer needed)

**Point 3: make the BLOCKED escape real.** When a code step genuinely has to change a planned test, for example new setup lines that a correct code change forces while the assertions stay the same, it keeps the edit and logs the task BLOCKED, naming the test and saying why the change is needed. `steps finish` reads that line and lets the step through instead of refusing with exit 11. The changed test then appears as an item at the build Decision Pause, where the owner accepts or rejects it. A headless or `ask: false` run takes the recommendation and records it as an assumed accept, the same as other assumed accepts, so ship asks the owner to confirm it. A planned test that changed with no BLOCKED line naming it is still refused, as today.

Why: the lock exists so a code agent can't quietly weaken a test until it passes. This keeps that guarantee, because every change reaches the owner, without failing a run whose change is correct. The refusal text and the `steps finish` help now describe a path that works.

**Point 1: catch the change in the step that made it.** `build-plan-tasks` and `build-plan-gaps-remediate` check the planned tests of every group that already has a red row, not only their own group. A cross-group change is then flagged (or let through by BLOCKED, as above) in the step that made it, never in a later holistic round that didn't touch the file.

**Point 2: skip superseded tests.** A red row's test that the current plan no longer names (for example a `TEST FIRST` test replaced after an owner decision) is not checked.

Next step: `/bkit-plan 914`.

## Issue comment — posted 2026-11-14T00:34:56.000Z

### Owner decision: Q4 is settled by what is already on `dev`

**Decision:** keep the plan lookup already on `dev` and drop the plan's required `--plan` flag. The rest of this issue stays in scope.

#### What is already on `dev`

The commit `e4377aad7` (#787, which also carries #926) already fixed this issue's second fault: a code step is no longer refused for a planned test the plan has dropped.

- **How the check finds the plan:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts:1302-1308` uses `--plan` when it is given. Otherwise it works out the plan from the run's log folder with `runPlanPath` (`.bkit/core/engine/commands/workflow/tests.ts:300`): `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` → `docs/plans/{YYYYMM}/{FID}-plan.md`.
- **How it filters:** `touchedTests` (`tests.ts:320`) takes the plan's text and checks only the tests that a `TEST FIRST` line still names.
- **With no plan file:** it checks every recorded test, as it did before the fix. The lock never gets weaker.

This is Q4's option B. The plan picked option A.

#### Why we keep it

- **Same protection.** Both options stop the lock from guarding a dropped test, and neither one weakens it.
- **Nothing breaks.** No flag is required, so a build already running keeps going. Option A makes such a build exit 2 at its next code-step finish.
- **The weak case doesn't arise in practice.** Option B is only weaker when the plan file is missing. Every build path writes the plan to `docs/plans/{YYYYMM}/{FID}-plan.md`, the same path `runPlanPath` reads, and that includes the step that converts an issue into a plan (`bkit-build.md` Step 4). A missing-plan error is therefore not worth adding.

#### What the re-plan drops

- **Task 1:** the required `--plan` flag on the three code-step finishes.
- **Task 2, plan lookup half:** the work that makes the check read the plan, and its three `TEST FIRST` tests. They already pass on `dev`, so they cannot be recorded failing first:
  - "plan no longer names"
  - "names only under another task number"
  - the integration case "plan dropped"
- **The exit-2 expectation for a finish without `--plan`.** It contradicts the landed test `steps.test.ts:1915`, which asserts exit 11 at `:1944`.

#### What the re-plan keeps

- **Fault 1:** a code step that changes another group's planned test is caught in that step. Today the check at `steps.ts:1296-1299` looks only at the step's own group, so the edit is caught later, in the check that runs across all groups.
- **Fault 3:** when a correct code change genuinely forces a planned test to change, the agent logs the task `BLOCKED` and names the test. `steps finish` reads that line and lets the step through, and the change goes to the owner at the Decision Pause. A changed test with no `BLOCKED` line is still refused.
- **Tasks 3-8:** updated to the lines as they are now (`docs/plans/202611/logs/914-build-planned-test/plan-refresh-current.md` on `feat/914-build-planned-test`). One file has moved: `.bkit/shared/docs/testing.md` is now `.bkit/templates/docs/testing.md`, and `docs/testing.md` no longer has a `bkit:start`/`bkit:end` block. The prerequisite notes about #891 and #903 are stale, because both have landed.

#### State

- `feat/914-build-planned-test` has had `origin/dev` merged in (`7c358a6a6`, not pushed).
- The plan check against `dev` returned FAIL: Task 2 is broken and six tasks need rewording.
- The plan itself is not revised yet.

Not recorded anywhere: why #926 was fixed on its own rather than as part of this issue.

## Plan — docs/plans/202611/914-build-planned-test-plan.md — last committed 2026-11-15T01:30:01.000Z

<!-- bkit:anchor
baseSha: 2d510c666901ca890d9166face8b676187a08496
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Planned-Test Lock: Cross-Group Changes, Superseded Tests and a Working BLOCKED Escape Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

The owner runs `/bkit-build`, and the lock still makes sure a code agent can't quietly weaken a test until it passes. Every change to a planned test reaches the owner, without failing a run whose change is correct.

### Success Criteria

The owner chose these (Open Question Q1, answer A): the issue's `Expected` bullets and the owner's decisions (issue comment 2026-11-10T06:56:35Z), word for word.

1. A code step that changes another group's planned test is flagged in that step, not in a later holistic round.
2. A red row whose test the plan no longer names is not checked.
3. When a code step genuinely has to change a planned test, for example new setup lines that a correct code change forces while the assertions stay the same, it keeps the edit and logs the task BLOCKED, naming the test and saying why the change is needed. `steps finish` reads that line and lets the step through instead of refusing with exit 11.
4. The changed test then appears as an item at the build Decision Pause, where the owner accepts or rejects it. A headless or `ask: false` run takes the recommendation and records it as an assumed accept, the same as other assumed accepts, so ship asks the owner to confirm it.
5. A planned test that changed with no BLOCKED line naming it is still refused, as today.

### Process Sketch

- **WHEN** a code step changes a planned test of an earlier group and its log names that test on no `BLOCKED` line **→ THEN** that step's `steps finish` exits 11, naming the test, and nothing is committed.
- **WHEN** a code step keeps a needed change to a planned test and its log holds ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` for it **→ THEN** the step finishes, and its `step-done` row records the test, its new lines' hash and the reason.
- **WHEN** a later code step leaves that recorded change as it is **→ THEN** it finishes without a `BLOCKED` line of its own.
- **WHEN** build Step 15 runs and `tests green` lists one or more `changed` tests **→ THEN** the owner answers each at a `CHANGED_TESTS` Decision Pause; a headless or `ask: false` run takes `Accept (assumed)`, and ship asks the owner to confirm it.
- **IF** a red row names a test that the plan's `TEST FIRST` fields no longer name **→ THEN** the lock skips it, and no step is refused for it.
- **IF** a code step's finish has no `--plan` **→ THEN** it reads the plan beside its status file (`docs/plans/{YYYYMM}/{FID}-plan.md`), and with no plan file there it checks every recorded red test.

### Concrete Example

**Setup:** The owner runs `/bkit-build` headless on a plan of 7 task groups. Group 3's Task 8 planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` in `.bkit/core/engine/commands/workflow/decisions.test.ts` is recorded red, then green. Group 6's first red row still names `bkit tests base > a gate red on a non-test stage as well never reads all`, state `missing`, a test the owner replaced in the plan after a decision.

**Steps:**

1. Group 7's code agent (Task 20) makes `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. It changes the setup lines of group 3's planned test, keeps its assertions and appends ``BLOCKED — TASK 20: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` — the file the test composes now needs a loop question; assertions unchanged`` to its log, then `DONE — TASK 20`. → `steps finish --step=build-plan-tasks --group=7` exits 0, and the row's `changedTests` names the test and the reason. Group 6's superseded test is not checked.
2. The holistic fix round edits help text only. → Its `steps finish` exits 0: group 3's test still matches the recorded change.
3. Step 15 runs `tests green` over the whole plan. → `changed` lists group 3's test with Task 20's reason. The run is headless, so the `CHANGED_TESTS` pause records `Decision: Accept (assumed)`.
4. The owner runs `/bkit-ship`. → Confirm Assumed Items asks the owner to confirm or reject the changed test.

**Outcome:** The build reaches its summary instead of the Failure Path, the owner sees the one planned-test change at ship, and no step was refused for a test it did not change.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A code step changes two planned tests, and its log's `BLOCKED` lines name only one | Exit 11 names only the unnamed test; nothing is written, so neither change is recorded. |
| A code step changes a test that a `BLOCKED` line recorded earlier in the run | Exit 11, unless this step's log names it on a new `BLOCKED` line, which records the newer lines. A line whose reason an earlier `changedTests` record of that test already carries is not new, so a line left in a log that a group's attempts share (`build-plan-tasks-{GROUP}-log.md` has no attempt number) lets no re-change through. |
| The tests step records a new red for a test after a code step recorded a change to it | The newer red row is the baseline, because the latest record in `status.jsonl` order wins. |
| A `BLOCKED` line names a planned test that the step did not change | Nothing is recorded for it; it stays an ordinary blocked-task line for verify to read. |
| A `BLOCKED` line names the test by the last ` > ` segment of its suite path | It matches, the same way the lock finds a test by its last segment. |
| A `BLOCKED` line has no `— {why}` reason after the test | It names no test, so the change is refused as an unlogged one. |
| A gaps-remediate log names the test on a `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` line | It lets the step through, the same as the `TASK` form. |
| The code step finishes with no `--plan` | The finish reads the plan beside its status file; with no plan file there, it checks every recorded red test. |
| A red row's test is still named by the plan but under a different task number | It is not plan-named under the recorded task, so it is skipped; the new task's own red row locks it. When the new task sits in a group whose red is already recorded, no new red row is written, so the test is locked nowhere until Step 7 is re-run for that group and records its red. |
| `--plan` names a missing file | The lock checks every recorded red test, as with no plan file. |
| The plan's `TEST FIRST` fields name no test while red rows exist | Every red row's test is skipped, the same as any test the plan no longer names; the finish adds no refusal for it (owner decision, issue comment 6868580061). |
| A later group's code step changes a planned test of a finished group, whose tasks Step 8's `tasks tick` has ticked `[x]` | The lock still checks it: done tasks stay in the plan-named set. |
| A `tests red` re-run (the tests step's restore on the loosened-test arm) meets a test a code step changed under a `BLOCKED` line | The test stands while its lines match the recorded change: it is not re-run, and the recorded change and its reason stay its baseline. |
| `tests green` runs on a plan with no recorded change | `changed` is `[]`, the report has no `Changed by a code step` section, and Step 15 goes straight to the `UNPROVEN` check. |
| The owner answers `Stop` at the `CHANGED_TESTS` pause | The run is handed over and stays `IN_PROGRESS`, as for any Decision Pause stop. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. The superseded-test row is a test already on `dev` (#926); Task 1's `DONE WHEN` keeps it passing. Every Unit row in `steps.test.ts` and `tests.test.ts` is `Unit (boundary: real temp git repo)`, built on its suite's existing temp-repo fixture rather than an extra repo per case; every row in `workflow-shape.test.ts` reads shipped workflow or prompt text, where the wording is the deliverable.

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
| `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` | Integration | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | 13 |
| `an exit 11 re-ask offers the BLOCKED test line the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `Step 15 asks once about planned tests a code step changed, before the unproven ones` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `a changed-test item offers Accept or Stop, recommended Accept` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `the execute prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| `the remediate prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| `the verify prompt notes a planned test a code step changed and raises no gap` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| Shipped workflow, prompt and doc text passes typecheck, lint, prose lint and the drift check after the mirror re-render | Static | `.bkit/workflows.md`, `.bkit/prompts.md`, `docs/testing.md`, `docs/templates/bkit-plan.md`, `dist/` and the host mirrors, checked by `pnpm bkit:gate:static` and `node dist/cli.js check` | 7 |
| refuses a code step that writes a planned test whose red recorded its file missing, exit 11 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 8 |
| the refusal of a restored BLOCKED change names the recorded change as the lines to put back | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 9 |
| the refusal of a re-change says the logged reason is already recorded | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 10 |
| refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 11 |
| records the baseline blob on a BLOCKED-named change that only adds lines | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 11 |
| green gives each changed test the line diff of its own lines since its baseline and whether it is additive | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 11 |
| a changed-test item shows the test's line diff since its baseline | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |
| the code prompts say a BLOCKED line lets through only a change that adds lines | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

**Breaking changes:**

<!-- prettier-ignore -->
| Change | Who it affects | Handling |
| --- | --- | --- |
| `build-plan-tasks` and `build-plan-gaps-remediate` refuse a change to any group's planned test, not only their own group's. | A run in progress whose earlier code step changed another group's test without a `BLOCKED` line is refused at its next code step instead of at its holistic round. | Intended (owner decision); the re-ask offers the `BLOCKED` line. |
| `touchedTests` loses its `group` parameter: `(top, file, workflow, group, plan?)` becomes `(top, file, workflow, plan?)`, and it gains `task` and `block` fields in its return. | Internal export; its only caller is `steps.ts`. | Updated in the same task. Its extra `task` and `block` fields stay inside `finish`: the exit 11 output keeps `tests: [{test, name}]`, so the existing assertions at `steps.test.ts:1905`, `:1951` and `:1967`, the documented help and the workflow re-asks' `<tests>` are unchanged. |

**New names:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `changedTests` | `step-done` row field: `[{task, test, testName, block, reason}]` | code steps' rows in `status.jsonl` |
| `changed` | `tests green` JSON key: `[{task, test, name, reason}]` | `bkit tests green` output |
| `## Changed by a code step` | report section | `build-tests-green-*.md` |
| `CHANGED_TESTS` | Decision Pause question (`Question: CHANGED_TESTS`) and workflow variable | `bkit-build.md` Step 15 and § Decision Pause |
| `blockedTests` | exported function | `tests.ts` |
| `lockBaselines` | exported function: the latest lock record per plan-named key, shared by the lock, `tests green` and `tests red` | `tests.ts` |
| `planned-test-lock.integration.test.ts` | test file | `.bkit/core/engine/commands/workflow/` |
| `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` | log line form | gaps-remediate logs |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q2:** Where a planned test that a code step changed under a `BLOCKED` line reaches the owner. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) A separate `CHANGED_TESTS` Decision Pause at Step 15, asked once, before the `UNPROVEN` pause — clear item semantics and the same ask-once shape as `UNPROVEN`, but a run with both kinds stops twice at the end · B) Items inside the `UNPROVEN` pause — one stop, but an `UNPROVEN` Accept writes a `TEST EXCEPTION`, which is the wrong record for a changed test, and the ask-once rule then covers two kinds · C) A gap in the group's verify report (Step 8) — the owner hears sooner, but verify pauses only when a limit is used up or a gap is unfixable, and an unfixable gap is a hard blocker that sends a headless run to the Failure Path, against the owner's decision.
  - **Recommended:** A) — it is the only option that keeps a headless run going with an assumed accept and records an owner Accept as a `docs/decisions.jsonl` row.
  - **Default if unanswered:** A).
- **Open Question Q3:** What "reject" means for a changed-test item. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) Options `Accept` / `Stop`: `Stop` hands the run over, and the owner restores the test or reworks the code before resuming — it mirrors the `UNPROVEN` item and adds no new routing. A headless run's assumed accept is asked again at ship, where Confirm Assumed Items merges either way (`bkit-ship.md:374`): a reject there records a `needs-decision` deferral and puts nothing back, so the changed test still merges · B) Options `Accept` / `Fix now` / `Stop`: `Fix now` adds a new last-group task that restores the test's intent — the reject stays inside the run, but `From: summary` needs a task-placement rule, and a change that the fix group itself makes needs asking again.
  - **Recommended:** A) — a rejected change means the code step's premise was wrong, which is a judgement the owner makes, not a task an agent can be briefed on from the pause.
  - **Default if unanswered:** A).
- **Assumption:** A code agent copies the `BLOCKED` line form from the refusal or its prompt, with an em dash, en dash or hyphen as `doneTasks` accepts. → If agents write another shape, the engine reads no line and refuses the step as it does today; the lock is never weaker.
- **Assumption:** A task whose log holds a `BLOCKED` test line followed by its `DONE — TASK {N}` line keeps `Verdict: PASS`, because the prompts' `FAIL` rule counts only a `BLOCKED` with no later `DONE`. The exit 11 re-ask appends the `BLOCKED` test line after the task's existing `DONE` line, so Task 5 has each re-ask append the `DONE — TASK {N}` (or `DONE — Gap {N}`) line again after it. → If wrong, the step's verdict reads `FAIL`, `summary.ts:732-736` keeps `BLOCKED` as the task's last disposition, and the group goes through verify and remediate for a task that is done.
- **Assumption:** The first `--artifact` of each code-step finish is the agent's own log (`reask.artifact` already relies on this). → If a step passes another file first, the engine reads `BLOCKED` lines from the wrong file.
- **Assumption:** Rows written by the current engine carry no `changedTests` field, and a row without it records no change. → Nothing breaks for runs in progress: their reds stay the baseline.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Why rejected |
| --- | --- |
| Stop offering the `BLOCKED` escape: drop it from the refusal text and the exit-code help | The owner chose the working escape (issue comment 2026-11-10T06:56:35Z): a correct code change that forces a planned test's setup to change would still fail the run. |
| Read `BLOCKED` lines from every log of the run, not only the finishing step's own log | A line one step wrote would let a later step's fresh change through unseen. The recorded `changedTests` baseline already carries an accepted change forward. |
| Keep the let-through in the step's log only, and re-read the logs on every later finish | A later step's finish would need every earlier log to agree with the rows. The `step-done` row is committed with the step and replays in `status.jsonl` order, the same as red rows. |
| Re-baseline the test silently, with no reason recorded | The owner must see why the change was needed at the Decision Pause; a hash alone gives the owner nothing to judge. |
| Let verify judge the change as a `test-loosened`-style gap | Verify raises an unfixable gap as a hard blocker, which sends a headless run to the Failure Path; the owner asked for an assumed accept instead. |
| Check only the planned tests in files the step's diff touched | It gives the same answer as comparing every plan-named test with its baseline, and adds a diff dependency the lock does not need. |

**Recommendations for a future phase:**

- A `bkit tests restore --test --name` command that puts one planned test back at its recorded lines, so a re-asked code agent restores by command instead of by hand-editing.

## Out of Scope

None — every item the issue and the owner's decisions name is in the runbook, except fault 2's skip, which is already on `dev` (#926); Task 1 keeps its landed test passing.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| A pre-push timeout of the steps test `passes the execute step when every planned test file matches the row, and checks nothing without a row` | `docs/failures.jsonl` key `.bkit/core/engine/commands/workflow/steps.test.ts bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes the execute step when every planned test file matches the row, and checks nothing without a row` (OPEN) | The suite Tasks 1, 2 and 3 extend in `steps.test.ts` | Keep deferred: unrelated to the lock's logic; new tests in that suite reuse its fixtures, so watch their runtime. |
| The progress line at step start and at task group boundaries | #894 — Show the progress line at step start and at task group boundaries (OPEN; blocked by #911 and #849), from `related-issues.md` | `bkit-build.md` Step 7, `steps.ts`, `workflow-shape.test.ts` and the `bkit-build.none.txt` baseline | Keep separate; whichever lands second regenerates the baseline. |
| The pre-commit `dist/` freshness check built from the staged tree | #819 — Build the pre-commit dist freshness check from the staged tree (OPEN), from `related-issues.md` | `.husky/pre-commit`'s `bkit:check:dist`, which every engine task's commit runs | Keep separate; this plan only needs `dist/` rebuilt and staged with each engine task. |
| An instructions corpus store timeout under the full gate | `docs/failures.jsonl` key `instructions-corpus-store-timeout-under-full-gate` (TRIAGED), from `related-failures.md` | The `.bkit/instructions.md` edits in Tasks 5 and 6, which the corpus comparison case re-checks under the full gate | Keep deferred; if the group gate times out on that case, treat the timeout as a known flake, not a gap. |
| A `bkit tests restore` command that puts a planned test back at its recorded lines | `Alternative Approaches & Recommendations` | The exit 11 re-ask | Needs a design decision; file it as an idea issue if wanted. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a handler input; the agent-written `BLOCKED` reason is treated as data (below).
- [ ] **PII** — not applicable: the reason holds test names and code reasons only.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input. Two points follow `docs/security.md` § Untrusted Content & Prompt Injection:

- **Agent text stays data.** The engine stores the `BLOCKED` reason as a JSON string in `status.jsonl` and passes it to `decisions compose` as item text; it never reaches a shell command (`docs/security.md` § Shell Injection) or a commit message.
- **The escape cannot weaken a test unseen.** Each let-through is recorded and reaches the owner at the `CHANGED_TESTS` pause; a headless assumed accept keeps the build summary at `CONCERNS` and is asked again at ship's Confirm Assumed Items.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added; `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-11) lists dev-only minor or patch updates (`vitest` 5.0.5 → 5.1.0, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5); none blocks this build. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (matches `packageManager`).
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook names was opened this session; the Narrative and Success Criteria come from the owner's answer to Q1 (A).
- [ ] **Project Context:** read `docs/knowledge.jsonl` key `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (its remediation still says "log the task `BLOCKED`"), `docs/decisions.jsonl` key `796-red-proven-per-group-blob-identity`, and `docs/failures.jsonl` key `.bkit/core/engine/commands/workflow/steps.test.ts bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes the execute step when every planned test file matches the row, and checks nothing without a row` (an open pre-push timeout on a test this plan edits).
- [ ] **Testing & Quality:** Unit tests use real temp git repos and no mocks at the git boundary; the Integration test spawns `bkit` through `requireTsx()` (`docs/testing.md` § Spawning `bkit` from tests); no E2E or `@live` tier applies (`docs/testing.md` § Tiers: none for bkit).
- [ ] **Prerequisite Plans:** none; this plan's line numbers are checked against `origin/dev` at `2d510c666`.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — no database; the one row change is a `step-done` field in a run's `status.jsonl`, documented in `.bkit/workflows.md` § Test-first.
- [ ] **Architecture & UI:** the new Integration test file sits next to the module it tests, as `docs/testing.md` § Stack places test files; no UI.
- [ ] **Observability:** no new log names; the existing `agent-rework` friction row on refusal stays, and a let-through writes the `changedTests` row field instead of a log line.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md` holds no table). The feature reads and writes rows of a run's `status.jsonl`, which `.bkit/core/.bkit/workflows.md` § Test-first documents.

### Data Schema Usage

- **Input (Read):** `build-tests-red` `step-done` rows: `group`, `tests[].task`, `tests[].test`, `tests[].testName`, `tests[].state`, `tests[].blob`, `tests[].block`.
- **Input (Read):** the plan's `**TEST FIRST:**` fields, through `readTestFirst` (`.bkit/core/engine/commands/workflow/tests.ts:665`), from `--plan` or else the plan beside the status file (`runPlanPath`, `tests.ts:301`).
- **Input (Read):** the finishing code step's own log (its first `--artifact`), for `BLOCKED` test lines.
- **Output (Write):** `step-done` rows of `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic` gain `changedTests: [{task, test, testName, block, reason}]` when a `BLOCKED` line lets a change through.

### Data Schema Changes

None — no `docs/data-schema.md` table changes. The `changedTests` row field is documented in `.bkit/core/.bkit/workflows.md` § Test-first (Task 7).

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Lock plan-named tests across every group with a red row | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rn -e 'touchedTests' -e 'redEntries(' .bkit/core/engine --include='*.ts'`; `grep -n -e 'readTestFirst' -e 'runPlanPath' .bkit/core/engine/commands/workflow/*.ts`; read `touchedTests` at `tests.ts:320-357` and the lock block at `steps.ts:1293-1324` | `touchedTests` (`tests.ts:320`) — covers the hash compare and already takes the plan text (`plan?: string`), skipping tests no `TEST FIRST` line names through an inline set built from `readTestFirst` (`tests.ts:665`) and `redKey` (`tests.ts:255`); it still scopes by `group` through `redEntries` (`tests.ts:280`) | EXTEND | Remove the `group` parameter, so it walks every group's entries. The inline plan-named set already keeps done tasks, because `readTestFirst` reads every task block, unlike `tests red`, which skips them (`tests.ts:1981`). |
| Code-step finish takes the plan | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n -e 'name: "plan"' -e 'str(f.plan)' -e 'runPlanPath' .bkit/core/engine/commands/workflow/steps.ts` | `finish` reads `--plan`, else `runPlanPath` (`steps.ts:1302-1307`), and passes the plan text to `touchedTests` | EXTEND | No edit to the lookup (owner decision, issue comment 6868580061): this row records the reuse. Task 2 rewrites the `--plan` help (`steps.ts:1971`), which names only `build-plan-tests`. |
| Read `BLOCKED` test lines from a step's log | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rln 'BLOCKED' .bkit/core/engine --include='*.ts'`; read `doneTasks` (`tests.ts:1135`), `passesLines` (`tests.ts:1383`), `summary.ts:732-736` | `doneTasks` — task numbers only; `passesLines` — the same backticked file-and-name shape for `PASSES` lines, with `: reason`; `summary.ts:732-736` — last disposition per task, no test | EXTEND | Add an exported `blockedTests` next to `passesLines`, in its style. Widening `passesLines` would change its contract: a different verb, a `TASK\|Gap` prefix and a `— why` separator. |
| Let a named change through and record it | `.bkit/core/engine/commands/workflow/steps.ts` | read `finish` (`steps.ts:1081-1324`); `grep -n 'extras\b' steps.ts` | the `extras` object written onto the `step-done` row (`steps.ts:1103`, `1279`) | EXTEND | Put `changedTests` on `extras`; refuse only the unnamed tests, with the rewritten problem text. |
| Use a recorded change as the next baseline | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n -e 'readStatusRows' -e 'function redRows' tests.ts`; read `redEntries` (`tests.ts:280`) | `redEntries` — latest red per key, used by `tests red`, `tests green` and `context brief`; `readStatusRows` — the ordered rows | EXTEND | Add an exported `lockBaselines` that walks the rows in order, so a later `changedTests` record replaces a red entry's block and a later red replaces both. `touchedTests`, `tests green`'s `changed` list and `tests red`'s `standing` check (`tests.ts:1959-1970`) all read it, so the lock, the report and the red re-run agree on one baseline. `redEntries` stays as it is for `tests green`'s red audit and `context brief --tests-only` (`context.ts:1624-1632`). |
| List changed tests for verify and Step 15 | `.bkit/core/engine/commands/workflow/tests.ts` | read `tests green` (`tests.ts:2146-2418`) and `writeAuditReport` (`tests.ts:1461-1540`) | `unproven` and `updated` lists — the same per-test JSON plus report-section shape | EXTEND | Add a `changed` list and a `## Changed by a code step` section, built the same way. |
| Ask the owner once at the end | `.bkit/core/workflows/bkit-build.md` | `grep -n 'UNPROVEN' .bkit/core/workflows/bkit-build.md`; `grep -rn -e 'UNPROVEN' -e 'VERIFY_GAPS' .bkit/core/engine --include='*.ts'` (no hit: `decisions compose` / `apply` take any `Question` header) | Step 15 sub-step 1 and § Decision Pause `UNPROVEN` items | EXTEND | Add a `CHANGED_TESTS` question with the same ask-once rule; an owner Accept takes the existing `docs/decisions.jsonl` branch. |
| Ship confirms an assumed accept | `.bkit/core/workflows/bkit-ship.md` | read § Confirm Assumed Items (`bkit-ship.md:370-412`) | `decisions pending` lists every assumed accept of any question kind | EXTEND | No edit: the existing step already covers a `CHANGED_TESTS` item, so this row records the reuse. |
| Tell code agents how to keep a needed change | `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | `grep -n -e 'BLOCKED' -e 'planned test' bkit-build-plan-tasks.md bkit-build-plan-gaps-remediate.md`; `grep -n -e 'planned test' -e 'BLOCKED' .bkit/instructions.md` | `bkit-build-plan-tasks.md:109` — the `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` form, for a wrong test left unedited; the remediate prompt has no test form | EXTEND | Add the keep-and-log case to both prompts, and the `Gap` form to the remediate prompt's log format. |
| Verify notes the change and raises no gap | `.bkit/core/prompts/bkit-build-plan-verify.md` | `grep -n -e 'Unproven' -e 'Updated tests' bkit-build-plan-verify.md` | step 8's `Unproven` rule (noted, no gap) | EXTEND | Add a `Changed by a code step` rule beside it. |
| Prove the finish-to-green wiring through the CLI | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/*.integration.test.ts` (eight files); `grep -ln -e 'tests green' -e 'steps finish' .bkit/core/engine/commands/workflow/*.integration.test.ts` | None — no integration test drives `steps finish` and `tests green` together; `tests-lock.integration.test.ts` covers the machine-wide `tests` run lock, a different subject | NEW | Reason (a): the searches find no integration test of the build's test-first commands. |

## Architecture & Component Changes

The change sits in the build's test-first lock: two engine modules, the build workflow, three build prompts and the docs that describe them. No new command, verb or exit code.
**Ledger rows:** `914-lock-checks-every-group-with-a-red`, `914-lock-skips-tests-the-plan-no-longer-names`, `914-blocked-line-lets-a-planned-test-change-through`, `914-changed-tests-asked-once-at-step-15`, `914-code-step-finish-requires-plan`, `914-one-lock-baseline-for-lock-green-and-red`

### Database Migrations

None — bkit has no database, and no install or upgrade migration is needed: old `status.jsonl` rows read as "no recorded change".

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists; `redKey` at line 255, `redEntries` at 280, `runPlanPath` at 301, `touchedTests` at 320 (its inline plan-named set at 327-334, its skip at 345), `readTestFirst` at 665, `doneTasks` at 1135, `passesLines` at 1383, `writeAuditReport` at 1461, `tests green` at 2146.
- `touchedTests(top, file, workflow, plan?)`: remove the `group` parameter, so it walks every group's red entries. The `plan?: string` parameter and its inline set (the `redKey` of every test the plan's `TEST FIRST` fields name) stay as they are; done tasks (`- [x]`) stay in the set, because Step 8's `tasks tick` ticks a group's tasks before a later group's code step runs. Compare every plan-named test with its `lockBaselines` record. Return `{task, test, name, block}` per changed test, where `block` is the current lines' hash; `finish` keeps `task` and `block` internal.
- Add an exported `lockBaselines(rows, planned)`, where `planned` is the plan-named key set `touchedTests` builds, or `null` for every key when no plan text is found: walk every group's `build-tests-red` entries and the `changedTests` records of the three code steps' `step-done` rows in `status.jsonl` order; the latest record per key is the baseline, so a later red replaces a recorded change and a later change replaces a red.
- `tests red`: the `standing` check (`tests.ts:1959-1970`) reads the block from `lockBaselines`, so a test a code step changed under a `BLOCKED` line stands while its lines match the recorded change, and a red re-run does not replace that record.
- Add an exported `blockedTests(log)`, a sibling of `passesLines`: every ``BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why}`` line (em dash, en dash or hyphen, as `doneTasks` reads) as `{test, name, reason}`. A line with no `— {why}` names no test.
- `tests green`: add `changed: [{task, test, name, reason}]` to its JSON, one entry per plan-named test whose `lockBaselines` record is a code step's `changedTests` entry, and a `## Changed by a code step` report section that says the owner answers each at the end of the build. `changed` is never a gap and never changes the verdict.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists; `recordTestLockFriction` at line 109, `extras` at 1103, the lock block at 1293-1324 (its own-group condition at 1296-1299, its plan lookup at 1302-1307, the exit 11 problem text at 1312), the `--plan` flag at 1971, the exit 11 help at 2066-2067.
- For `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`, run the lock under one condition with `group` ignored. The plan lookup (`--plan`, else `runPlanPath`; no filter when no plan file is found) stays as it is (owner decision, issue comment 6868580061).
- Read `blockedTests` from the first `--artifact`. A changed test that a line names (by its recorded name, or the last `>` segment of it) is let through and added to `extras.changedTests` as `{task, test, testName, block, reason}`, unless an earlier `changedTests` record of that test already carries the line's reason: such a line is left over from an earlier attempt in a shared log and lets nothing through. Every other changed test is refused as today: exit 11, `tests: [{test, name}]` (shape unchanged), `touched`, `reask`, the friction row, nothing written.
- Rewrite the problem text: put the test back as the tests step left it (other edits to the file stay), or, when a correct code change needs the edit, keep it and append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (`Gap {N}` in a gaps fix) to `{artifact}`; the owner answers each kept change at the end of the build.
- Rewrite the `--plan` help (the plan whose `TEST FIRST` lines bound the tests step's commit and name the tests the code steps' lock checks; the code steps read the plan beside the status file when it is absent) and the exit 11 help (any group's planned test changed with no `BLOCKED` line naming it).

#### [DELETE] `group` parameter of `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`

- Superseded by the plan-named key set across every group (`Supersession Inventory` row 1); removed by Task 1.

#### [DELETE] own-group lock condition in `.bkit/core/engine/commands/workflow/steps.ts`

- `(step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined` is superseded by one condition for the three code steps (`Supersession Inventory` row 2); removed by Task 1.

#### [DELETE] unread-escape problem and help text in `.bkit/core/engine/commands/workflow/steps.ts`

- The exit 11 problem text (`steps.ts:1312`) and help (`steps.ts:2067`) are replaced by text naming the line form the engine reads (`Supersession Inventory` row 3); replaced by Task 2.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.test.ts`

- **Existence Check:** the file exists; suite `bkit steps finish — the tests step touches only tests, the code steps never touch a test` at line 1728, its `codeStep` argument builder at 1747, the landed superseded-test case at 1915.
- Add the Task 1, 2 and 3 tests on the suite's existing fixtures. The `codeStep` argument builder stays as it is; a new case that needs the plan passes `--plan=plan.md` itself, as the landed superseded-test case does. The cross-group fixtures tick group 1's tasks `[x]`, as a real run's Step 8 leaves them.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** the file exists; suite `bkit tests red / green` at line 2123.
- Add the `blockedTests` tests, the `tests red` standing test and the `tests green` `changed` tests. Fixtures write `changedTests` rows through a real `steps finish` or the row builder `finish` uses, never a hand-typed row, so a fixture cannot drift from what `finish` writes (`changedTests` keeps `testName`; `changed` and `blockedTests` use `name`).

#### [NEW] `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Prove the finish-to-green wiring through the CLI", reason (a).
- Spawns `bkit` through `requireTsx()` in a temp git repo holding a two-group plan; drives `steps finish` for the code steps and `tests green`, asserting exit codes, the `changedTests` row field and the `changed` list. Created by Task 4.

#### [MODIFY] `dist/`

- **Existence Check:** `dist/cli.js` exists.
- Rebuilt by `pnpm build` and staged in each engine task (Tasks 1, 2, 3 and 4), because `.husky/pre-commit:18-23` runs `pnpm bkit:check:dist` on any staged non-test engine `.ts` and refuses a commit whose `dist/` is stale (`.agents/rules.md` § Engine builds); Task 7 re-checks it. Never hand-edited.

### Workflow and Prompts

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; § Decision Pause step 2 at line 140 (its `UNPROVEN` item rule at 154) and step 5's Accept `Else` branch at 220; Step 7 sub-step 8 at 668-673 (exit 11 re-ask at 672); Step 9 sub-step 4 at 841-846 (re-ask at 845); Step 10 sub-step 9 at 931-936 (re-ask at 935); Step 15 sub-step 1 at 1164-1171; Gate 15 at 1202.
- Rewrite the three exit 11 re-asks to offer the line form the engine reads: ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` for execute, ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` for both gaps fixes. Each re-ask also has the agent append the `DONE — TASK {N}` (or `DONE — Gap {N}`) line again after the `BLOCKED` test line, so the log's last disposition stays `DONE`.
- Step 15 sub-step 1: hold `changed` as `CHANGED_TESTS`. **If** `CHANGED_TESTS` is not empty and no decision file of the run holds `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**; then the existing `UNPROVEN` check. The sub-step's opening skip (`bkit-build.md:1164`, today on `Question: UNPROVEN` alone, which also bypasses `tests green`) skips only when a decision file holds both questions, so a run that returns to Step 15 still runs `tests green` for `CHANGED_TESTS`.
- § Decision Pause step 2: a `CHANGED_TESTS` item per entry, titled with its task number and test name, stating that a code step changed this planned test after its red and why; options `["Accept", "Stop"]`, recommended `Accept`. Step 5's existing `Else` branch writes an owner Accept as a `docs/decisions.jsonl` row.
- Gate 15: add `Changed planned tests asked once, or none left`.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

- **Existence Check:** the file exists; the three exit 11 re-asks at `:587`, `:760` and `:850`, compared by `.bkit/core/engine/render/trackers.test.ts:399-403` (`bkit-build: the none render matches its baseline byte for byte`).
- Regenerated with `vitest -u` on `trackers.test.ts` after the `bkit-build.md` edit (Task 5), and reviewed so that only the edited lines change.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-tasks.md`

- **Existence Check:** the file exists; step 8's planned-test bullets at lines 107-109, the log format at 140-146.
- Add the case: **If** a correct code change forces an edit to a planned test (for example new setup lines while its assertions stay the same) → keep the edit, finish the task's code first, then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why the change is needed}`` and the task's `DONE` line; a changed planned test with no such line is refused with exit 11. The order matters because `tasks open` counts any `BLOCKED` line as closed (`tasks.ts:285`), so a task cut off between the line and its code would get no handover.
- State that formatting a planned test file (for example `prettier --write` over it) changes its lines and counts as an edit.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`

- **Existence Check:** the file exists; the strategy rule at line 95, the log format at 135.
- Add the same case, order and formatting note with the ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` form, and add that form to the log format.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** the file exists; step 8's audit-report rules at lines 90-104.
- Add: `Changed by a code step` section → list each test and its reason in `Notes`; no gap, because the owner answers it at the end of the build.

### Docs and Catalogs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; Step 7 row at line 971, § Decision Pause `Record` line 991 and `Unproven tests (Step 15)` line 995, § Test-first heading at 1786, its table rows at 1793-1797 (Green 1795, Judgement 1796, Unproven 1797) and the lock bullet at 1800.
- Task 5 owns § Decision Pause and the Step 7 row: `CHANGED_TESTS` in the `Question` list, a `Changed tests (Step 15)` line, and the Step 7 row's exit 11 text with the `BLOCKED` line.
- Task 7 owns § Test-first: a `Changed tests (Step 15)` table row, the `changed` list in the Green row, the `Changed by a code step` rule in the Judgement row, and the every-group, plan-named and `BLOCKED` rules plus the `changedTests` row field in the lock bullet.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** the file exists; rows `bkit-build-plan-tasks` (line 336) and `bkit-build-plan-gaps-remediate` (338).
- State the keep-and-log escape in both rows, and the `Changed by a code step` rule in the `bkit-build-plan-verify` row.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists and is project-owned throughout (no `bkit:start` / `bkit:end` block, so it is hand-edited and no upgrade renders it); § Test first at line 298, `The red test stays` at 313, § Key test files at 722.
- Add to `The red test stays`: a code step that must change a planned test logs a `BLOCKED` line naming it, and the owner answers the change at the end of the build.
- Add a § Key test files row for `planned-test-lock.integration.test.ts`.
- `.bkit/templates/docs/testing.md` is not edited: it is the copy-and-own tier guide for a consumer's own stack, with no § Test first and no section on the build's planned-test lock, so the sentence has no home there.

#### [MODIFY] `.bkit/core/docs/templates/bkit-plan.md`

- **Existence Check:** the file exists; Gate 2 `Tests unchanged` at line 334.
- Reword the box: every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names its change for the owner.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; `## Local Instructions` holds the exit 11 re-ask lines (line 10196, 10236).
- Bring the carried lines in line with the workflow and prompt edits: run the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, and run `pnpm instructions:sync` (`--write`) only once the check lists just this change's lines.

#### Rendered mirrors

- `pnpm tsx .bkit/core/engine/cli.ts upgrade` runs once at the end (Task 7), which re-renders `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`, `.bkit/workflows.md`, `.bkit/prompts.md` and `docs/templates/bkit-plan.md`; no mirror is hand-edited.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The `group` parameter of `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts` | The plan-named key set across every group | DELETE | The owner decided the code steps check every group; no caller needs a group-scoped lock. Task 1 removes it in place, as an `UPDATE` line, because the function stays and a `DELETE` line naming `touchedTests` would raise a false `delete-still-referenced` gap. |
| The own-group condition in `finish` (`steps.ts:1296-1299`): `PLAN_TASKS_STEP` or `PLAN_REMEDIATE_STEP` with `group !== undefined`, or `PLAN_REMEDIATE_HOLISTIC_STEP` | One condition covering the three code steps | DELETE | Task 1 removes it; the holistic and per-group steps then run the same check. |
| The exit 11 problem text and help that offer an unread `BLOCKED` escape (`steps.ts:1312`, `steps.ts:2067`) | Text naming the line form the engine reads | DELETE | Task 2 replaces both strings. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (rendered to `.bkit/workflows.md`) | § Decision Pause: `CHANGED_TESTS` in the `Question` list and a `Changed tests (Step 15)` line; the Step 7 row's exit 11 text. Task 5. § Test-first: the Green, Judgement and new `Changed tests (Step 15)` rows; the lock bullet (every group, plan-named tests, the `BLOCKED` line, the `changedTests` field). Task 7. |
| `.bkit/core/.bkit/prompts.md` (rendered to `.bkit/prompts.md`) | Rows `bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate` and `bkit-build-plan-verify`. Task 6. |
| `docs/testing.md` (project-owned, hand-edited) | § Test first, `The red test stays`. Task 7. |
| `.bkit/core/docs/templates/bkit-plan.md` (rendered to `docs/templates/bkit-plan.md`) | Gate 2 `Tests unchanged`. Task 7. |
| `.bkit/instructions.md` | `## Local Instructions` lines carrying the edited workflow and prompt sentences. Tasks 5 and 6. |
| `docs/testing.md` § Key test files | A row for `planned-test-lock.integration.test.ts`. Task 7 (hand-edited). |
| `docs/decisions.jsonl` | The six `914-*` rows on the `**Ledger rows:**` line, written by this plan. |
| `docs/knowledge.jsonl` | Key `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`: its summary still names only `build-plan-execute` / `build-plan-gaps-remediate` and the group's blob, and its remediation's "log the task `BLOCKED`" now needs the line form. A same-`key` correction by `@bkit-utility-update-knowledge` at ship's doc update, not a runbook task. |
| `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no topology, library, table, UI or log name changes. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — no database. | — |
| **Code** | `git revert {COMMIT}` of the squash merge, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-render `dist/` and the mirrors. | A `status.jsonl` row that carries `changedTests` reads as an ordinary row after the revert: the old lock ignores the field and compares against the red again. |
| **Risk window** | A build run in progress across the revert. | Its next code step falls back to the old own-group lock and may refuse a test a `BLOCKED` line let through; re-run the step after putting the test back. |
| **Forward window** | A build run in progress when its `{BKIT}` reaches the new engine (a `dev` sync of the main checkout, a consumer `bkit upgrade`, or this plan's own build once Task 1's `dist/` lands in the worktree). | Its next code step checks every group's planned tests, so a cross-group change an earlier step made with no `BLOCKED` line is refused there (exit 11, nothing written), and the re-ask puts the test back. The code-step finishes take no new flag, so the old workflow text keeps working. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine lock and its `BLOCKED` escape (Group 1), then `tests green`, the workflow, prompts and docs that call and describe them (Group 2). Each engine task rebuilds and stages `dist/` with its edit, because the pre-commit hook's `pnpm bkit:check:dist` refuses a commit whose staged engine sources and `dist/` disagree. One PR for every task is fine; the groups are a suggested commit order only. The code-step finishes keep the plan lookup already on `dev` (`--plan`, else `runPlanPath`), so the workflow's finish lines do not change.

<!-- bkit:group 1 start -->

### TASK GROUP 1: The planned-test lock in the engine

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Lock the plan-named tests of every group with a red row
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

- [x] **TASK 2:** Make the `BLOCKED` escape real: read the step's log, let named changes through and record them
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
  - **DONE WHEN:** `blockedTests` is exported from `tests.ts`; a code step whose log names its changed planned test exits 0 and its `step-done` row carries `changedTests`; an unnamed change still exits 11 with `tests: [{test, name}]`; `pnpm build` exits 0 and `dist/` is staged; the three tests below pass (Task 12 holds its other six), and the rest of the suite still passes, including the existing `r.json.tests` assertions at `steps.test.ts:1905`, `:1951` and `:1967`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` fails on no entry, or a wrong file, name or reason, read from a `TASK` or a `Gap` line
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > ignores a BLOCKED line that names no test` fails on an entry read from a plain `BLOCKED — TASK {N}: {title} — {reason}` line or a test line with no reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the exit 11 help names the BLOCKED line that lets a change through` fails on exit 11 help that still says only "log the task BLOCKED"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Use a recorded change as the next baseline for the lock and for `tests red`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add an exported `lockBaselines(rows, planned)`, where `planned` is the plan-named key set `touchedTests` builds, or `null` for every key when no plan text is found: every group's `build-tests-red` entries and the code steps' `changedTests` records in `status.jsonl` order, the latest per key as the baseline
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: compare each plan-named test with its `lockBaselines` record
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: a `BLOCKED` line lets a test through only when no earlier `changedTests` record of that test carries the line's reason, so a line left in a log that a group's attempts share lets no re-change through
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `tests red`'s `standing` check (`tests.ts:1959-1970`) reads the block from `lockBaselines`, so a test a code step changed under a `BLOCKED` line stands while its lines match the recorded change
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new cases reuse the suite's existing temp-repo fixture, with no extra repo per case; each records its earlier change through a real `steps finish`, never a hand-typed row
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **UPDATE:** `dist/commands/workflow/steps.js`: rebuilt by the same `pnpm build` and staged with it
  - **READ:** `redEntries` in `.bkit/core/engine/commands/workflow/tests.ts`: stays as it is for `tests green`'s red audit and `context brief --tests-only`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `lockBaselines` is exported from `tests.ts` and is the only baseline `touchedTests` and the `tests red` `standing` check read; `pnpm build` exits 0 and `dist/` is staged; the test below passes (Task 12 holds its other four), and the rest of the `steps.test.ts` and `tests.test.ts` suites still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `red keeps a test standing whose lines match a code step's recorded change` fails on `tests red` re-running a test whose lines match its latest `changedTests` record and recording it as not red

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: `tests green`, the build workflow, prompts and docs

<!-- bkit:task 4 start -->

- [x] **TASK 4:** List the changed tests in `tests green`, for verify and for Step 15
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `tests green` adds `changed: [{task, test, name, reason}]`, one entry per plan-named test whose `lockBaselines` record is a code step's `changedTests` entry; never a gap, never a verdict change
  - **UPDATE:** `writeAuditReport` in `.bkit/core/engine/commands/workflow/tests.ts`: a `## Changed by a code step` section, one line per entry with its reason, saying the owner answers it at the end of the build
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: fixtures write `changedTests` rows through a real `steps finish` or the row builder `finish` uses, never a hand-typed row
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **CREATE:** `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`: spawns `bkit` through `requireTsx()` in a temp git repo; the cross-group scenario below
  - **READ:** `docs/testing.md`: § Spawning `bkit` from tests
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `tests green` prints `changed` (`[]` when nothing changed) and the report holds the section only when it is non-empty; `pnpm build` exits 0 and `dist/` is staged; the test below passes (Task 13 holds its other three).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints an empty changed list and no Changed by a code step section when no code step changed a test` fails on `changed` being absent rather than `[]`, or on a report holding a `Changed by a code step` section

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Offer the working `BLOCKED` line, and ask about changed tests once at Step 15
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: rewrite the three exit 11 re-asks (Step 7 sub-step 8 at `:672`, Step 9 sub-step 4 at `:845`, Step 10 sub-step 9 at `:935`) with the ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (execute) and ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (gaps fixes) forms, each followed by the `DONE — TASK {N}` (or `DONE — Gap {N}`) line appended again
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 15 sub-step 1 holds `changed` as `CHANGED_TESTS` and pauses with `PAUSE_QUESTION` = `CHANGED_TESTS` once per run (skip when a decision file holds `Question: CHANGED_TESTS`), before the `UNPROVEN` check; the sub-step's opening skip (`bkit-build.md:1164`) skips only when a decision file holds both `Question: CHANGED_TESTS` and `Question: UNPROVEN`, so `tests green` still runs; § Decision Pause step 2 writes one `CHANGED_TESTS` item per entry, options `["Accept", "Stop"]`, recommended `Accept`; Gate 15 gains `Changed planned tests asked once, or none left`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated with `vitest -u` on `trackers.test.ts` after the workflow edit, and reviewed so that only the edited lines change
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Decision Pause `Record` line adds `CHANGED_TESTS` to the `Question` list, a `Changed tests (Step 15)` line beside `Unproven tests (Step 15)`, and the Step 7 row's exit 11 text
  - **UPDATE:** `.bkit/instructions.md`: the `## Local Instructions` lines carrying the edited workflow sentences, after the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts`
  - **READ:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items (`:370-412`) already covers an assumed `CHANGED_TESTS` accept
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** Step 15 routes to a `CHANGED_TESTS` pause before `UNPROVEN`; `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` passes; the instructions check exits 0; the three tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `an exit 11 re-ask offers the BLOCKED test line the engine reads` fails on an exit 11 re-ask whose line form, filled in, gives `blockedTests` no entry, or that does not have the agent append the `DONE` line again after it
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Step 15 asks once about planned tests a code step changed, before the unproven ones` fails on Step 15 with no `CHANGED_TESTS` route, no `Question: CHANGED_TESTS` skip, that route after the `UNPROVEN` one, or an opening skip that bypasses `tests green` when only `Question: UNPROVEN` is answered
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a changed-test item offers Accept or Stop, recommended Accept` fails on a § Decision Pause with no `CHANGED_TESTS` item rule, or one with other options or no `Accept` recommendation

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Tell the code and verify agents how a needed planned-test change is kept and reported
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: step 8 adds the case where a correct code change forces an edit to a planned test: keep it, finish the task's code first, then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why the change is needed}`` and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed (`tasks.ts:285`); formatting a planned test file (for example `prettier --write`) counts as an edit
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: step 6's strategy rule adds the same case, order and formatting note with ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}``; the Remediation Log format adds that form
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: step 8 (`:90-104`) adds the `Changed by a code step` section rule: list each test and its reason in `Notes`, no gap
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: rows `bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate` and `bkit-build-plan-verify`
  - **UPDATE:** `.bkit/instructions.md`: the `## Local Instructions` lines carrying the edited prompt sentences, after the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** both code prompts show their `BLOCKED` test line form; the verify prompt holds the `Changed by a code step` rule; the instructions check exits 0; the three tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the execute prompt's BLOCKED test line is one the engine reads` fails on the execute prompt's keep-and-log line form, filled in, giving `blockedTests` no entry
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the remediate prompt's BLOCKED test line is one the engine reads` fails on the remediate prompt having no `Gap` test line form, or one `blockedTests` does not read
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the verify prompt notes a planned test a code step changed and raises no gap` fails on a verify prompt with no `Changed by a code step` rule, or one that logs a gap for it

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Document the lock's contract, rebuild `dist/` and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Test-first (`:1786`) lock bullet (`:1800`; every group with a red row, plan-named tests only, the `BLOCKED` line, the `changedTests` row field as the next baseline), the Green row's `changed` list (`:1795`), the Judgement row's `Changed by a code step` rule (`:1796`), and a `Changed tests (Step 15)` row after the Unproven row (`:1797`)
  - **UPDATE:** `docs/testing.md`: § Test first, `The red test stays` (`:313`), hand-edited: a code step that must change a planned test logs a `BLOCKED` line naming it, and the owner answers the change at the end of the build
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: Gate 2 `Tests unchanged` box (`:334`) covers a change a code step's `BLOCKED` line names for the owner
  - **UPDATE:** `docs/testing.md`: a § Key test files (`:722`) row for `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6
  - **DONE WHEN:** `pnpm build` exits 0 and leaves `dist/` unchanged from the engine tasks' staged builds; `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/workflows.md`, `.bkit/prompts.md`, `docs/templates/bkit-plan.md` and the host mirrors; `pnpm bkit:gate:static`, `node dist/cli.js check` and `pnpm bkit:graph:check` exit 0 with no drift.
  - **TEST FIRST:** n/a — docs, a rebuilt `dist/` and re-rendered mirrors, covered by the Static tier

<!-- bkit:task 7 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 8 start -->

- [x] **TASK 8:** A code agent writes a planned test whose red recorded its file `missing`, and every code step now lets it through without a refusal or a `changedTests` record
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:436` · **Round:** 1
  - **DONE WHEN:** In `touchedTests`, the `t.blob === null` skip applies only to a baseline that came from a `changedTests` record (`fromChange`). A `build-tests-red` baseline with no blob and no block is refused when the test's file exists, as on `origin/dev`, unless a `BLOCKED` test line names it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step that writes a planned test whose red recorded its file missing, exit 11` fails on exit 0 when the red row's entry is `{state: "missing", blob: null}` with no block, and the execute step then creates the file holding that test with no `BLOCKED` line

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [x] **TASK 9:** A later code step puts a `BLOCKED`-changed test back as the tests step wrote it, is refused, and the re-ask tells it to do what it already did
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1344` · **Round:** 1
  - **DONE WHEN:** When a refused test's baseline is a code step's `changedTests` record, the exit 11 `problem` names that recorded change as the lines to put back, not "as the tests step left it" or "what the group's tests step recorded at its red". The text then matches `.bkit/core/.bkit/workflows.md` § Test-first, which already says the baseline is the red's block or a later `changedTests` block. The `problem` for a test whose baseline is a red is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a restored BLOCKED change names the recorded change as the lines to put back` fails on a `problem` holding "as the tests step left it" after a first finish records a `changedTests` entry and a later remediate step restores the test's original red lines and exits 11

<!-- bkit:task 9 end -->
<!-- bkit:task 10 start -->

- [x] **TASK 10:** A re-asked code agent re-appends the `BLOCKED` line with a reason already recorded for the test, the engine skips it without saying why, and the run takes the Failure Path
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1328` · **Round:** 1
  - **DONE WHEN:** When a changed test is refused while a `BLOCKED` line of the log names it with a reason already in `c.reasons`, the exit 11 `problem` says that line's reason is already recorded for that test and a new reason is needed. A line that names the test with a reason not yet recorded still lets it through.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a re-change says the logged reason is already recorded` fails on a `problem` that does not contain the reused reason `needs a 2` when a second execute attempt changes the test again and its log carries only the first attempt's `BLOCKED` line

<!-- bkit:task 10 end -->
<!-- bkit:task 11 start -->

- [x] **TASK 11:** A code agent deletes a planned test's assertions, logs a plausible `BLOCKED` reason, and the weakened test merges, because the owner only ever sees the agent's own words
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:2372` · **Round:** 1
  - **DONE WHEN:** A `BLOCKED` line lets a planned-test change through only when the change is additive: it adds lines to the test's own lines and removes none, the same `additive` the `Updated tests` path computes. `steps finish` stores the baseline blob with `git hash-object -w` in each `changedTests` record, so the diff can be rebuilt later. A change that removes or rewrites any of the test's own lines is refused with exit 11 even when a `BLOCKED` line names it, and the `problem` says a `BLOCKED` line cannot remove or loosen a planned test's lines. Every `changed` entry of `tests green` carries `diff` (the test's own-line diff from its baseline) and `additive`. The `## Changed by a code step` report line (`tests.ts:1649`) and the § Decision Pause `CHANGED_TESTS` item rule (`bkit-build.md:154`) show that diff. The execute and remediate prompts, `.bkit/core/.bkit/workflows.md` § Test-first and `docs/testing.md` § Test first say a `BLOCKED` line lets through only a change that adds lines. The tests of Tasks 1-4 still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` fails on exit 0, or on a `problem` that does not say a `BLOCKED` line cannot remove or loosen a planned test's lines, when the execute step deletes an `expect` line from the planned test and its log names the test in a `BLOCKED` test line
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `records the baseline blob on a BLOCKED-named change that only adds lines` fails on exit 11, or on a `changedTests` record with no stored baseline blob that `git cat-file` can read, when the execute step adds an `expect` line to the planned test under a `BLOCKED` test line
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives each changed test the line diff of its own lines since its baseline and whether it is additive` fails on a `changed` entry with no `diff` or `additive: true`, or a `diff` without the added `expect` line, after a code step's finish added an `expect` line to the planned test under a `BLOCKED` line
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a changed-test item shows the test's line diff since its baseline` fails on a § Decision Pause `CHANGED_TESTS` item rule that names only the task number, the test name and the step's reason
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the code prompts say a BLOCKED line lets through only a change that adds lines` fails on an execute or remediate prompt whose `BLOCKED` test line guidance does not say a change that removes or rewrites a planned test's lines is refused

<!-- bkit:task 11 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Holistic fix — planned tests Task 11's add-only rule changed

<!-- bkit:task 12 start -->

- [x] **TASK 12:** Take over the ten `steps.test.ts` planned tests of Tasks 2-3 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one
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

- [x] **TASK 13:** Take over the three `tests green` and cross-group planned tests of Task 4 that set up a rewritten line, now that a `BLOCKED` line lets through only an added one
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
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the refusal still appends its `agent-rework` friction row, and a let-through writes `changedTests` on the row.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration`, `node dist/cli.js check` and `pnpm bkit:graph:check` pass.
- [ ] **Test Synchronization:** the existing lock tests in `.bkit/core/engine/commands/workflow/steps.test.ts`, including the superseded-test case already on `dev`, pass with the `codeStep` argument builder unchanged; the Step 7 audit in `workflow-shape.test.ts` (`Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute`) still passes.
- [ ] **Build Configuration:** the new `*.integration.test.ts` file stays out of `dist/` through the existing build config; `pnpm build` output holds no test file.
- [ ] **Render baseline:** `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` passes against the regenerated `bkit-build.none.txt`.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/steps.test.ts`, `tests.test.ts`):** the Task 1, 2, 3 and 4 rows, on each suite's existing temp git repo fixture removed in `afterEach`.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`):** the cross-group scenario through `requireTsx()`, asserting a positive signal (exit code plus the row field or the `changed` entry), never only an exit code.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`):** the Task 5 and 6 rows, with the line-form tests run through `blockedTests`.
- [ ] **Apply local migrations:** not applicable — no migration.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch git repo with a two-group plan, run `pnpm build`, then `node dist/cli.js steps finish --workflow=build --step=build-plan-tasks --group=2 --plan=plan.md …` after changing group 1's planned test: it exits 11. Append ``BLOCKED — TASK 2: test `{file}` `{name}` — setup changed`` to the log and re-run: it exits 0, and the new `status.jsonl` row carries `changedTests`.
- [ ] **Step 2:** In the same repo, run `node dist/cli.js tests green --workflow=build --plan=plan.md --file=… --log=…`: the JSON lists the test under `changed`, and the report holds `## Changed by a code step`.
- [ ] **Step 3:** On the next headless build, confirm that the `CHANGED_TESTS` decision file reads `Decision: Accept (assumed)` and that `/bkit-ship` asks about it under Confirm Assumed Items.
