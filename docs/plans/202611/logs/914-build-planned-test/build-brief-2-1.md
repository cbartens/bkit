# Brief: group 2 — `tests green`, the build workflow, prompts and docs

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
- Group 2: `tests green`, the build workflow, prompts and docs — this group
  - TASK 4: List the changed tests in `tests green`, for verify and for Step 15 — open
  - TASK 5: Offer the working `BLOCKED` line, and ask about changed tests once at Step 15 — open
  - TASK 6: Tell the code and verify agents how a needed planned-test change is kept and reported — open
  - TASK 7: Document the lock's contract, rebuild `dist/` and re-render the mirrors — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** List the changed tests in `tests green`, for verify and for Step 15
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `tests green` adds `changed: [{task, test, name, reason}]`, one entry per plan-named test whose `lockBaselines` record is a code step's `changedTests` entry; never a gap, never a verdict change
  - **UPDATE:** `writeAuditReport` in `.bkit/core/engine/commands/workflow/tests.ts`: a `## Changed by a code step` section, one line per entry with its reason, saying the owner answers it at the end of the build
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: fixtures write `changedTests` rows through a real `steps finish` or the row builder `finish` uses, never a hand-typed row
  - **UPDATE:** `dist/commands/workflow/tests.js`: rebuilt by `pnpm build` and staged with the engine edit
  - **CREATE:** `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`: spawns `bkit` through `requireTsx()` in a temp git repo; the cross-group scenario below
  - **READ:** `docs/testing.md`: § Spawning `bkit` from tests
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `tests green` prints `changed` (`[]` when nothing changed) and the report holds the section only when it is non-empty; `pnpm build` exits 0 and `dist/` is staged; the four tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` fails on `changed` being absent or empty, a gap raised for the test, or a report with no `Changed by a code step` section
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a changed test the plan no longer names out of changed` fails on `changed` not equalling exactly the one plan-named entry while a `changedTests` record of a test no `TEST FIRST` line names exists, so a missing `changed` key also fails
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints an empty changed list and no Changed by a code step section when no code step changed a test` fails on `changed` being absent rather than `[]`, or on a report holding a `Changed by a code step` section
    - `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` fails on the group 2 step or the later holistic step exiting 11, or on `tests green` not listing the test as changed, with group 1's tasks ticked `[x]` in the fixture plan

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Offer the working `BLOCKED` line, and ask about changed tests once at Step 15
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

- [ ] **TASK 6:** Tell the code and verify agents how a needed planned-test change is kept and reported
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

- [ ] **TASK 7:** Document the lock's contract, rebuild `dist/` and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Test-first (`:1786`) lock bullet (`:1800`; every group with a red row, plan-named tests only, the `BLOCKED` line, the `changedTests` row field as the next baseline), the Green row's `changed` list (`:1795`), the Judgement row's `Changed by a code step` rule (`:1796`), and a `Changed tests (Step 15)` row after the Unproven row (`:1797`)
  - **UPDATE:** `docs/testing.md`: § Test first, `The red test stays` (`:313`), hand-edited: a code step that must change a planned test logs a `BLOCKED` line naming it, and the owner answers the change at the end of the build
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: Gate 2 `Tests unchanged` box (`:334`) covers a change a code step's `BLOCKED` line names for the owner
  - **UPDATE:** `docs/testing.md`: a § Key test files (`:722`) row for `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6
  - **DONE WHEN:** `pnpm build` exits 0 and leaves `dist/` unchanged from the engine tasks' staged builds; `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/workflows.md`, `.bkit/prompts.md`, `docs/templates/bkit-plan.md` and the host mirrors; `pnpm bkit:gate:static`, `node dist/cli.js check` and `pnpm bkit:graph:check` exit 0 with no drift.
  - **TEST FIRST:** n/a — docs, a rebuilt `dist/` and re-rendered mirrors, covered by the Static tier

<!-- bkit:task 7 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Lock the plan-named tests of every group with a red row — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `dist/commands/workflow/tests.js`, `dist/commands/workflow/steps.js`
- TASK 2 (group 1, done): Make the `BLOCKED` escape real: read the step's log, let named changes through and record them — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `dist/commands/workflow/tests.js`, `dist/commands/workflow/steps.js`
- TASK 3 (group 1, done): Use a recorded change as the next baseline for the lock and for `tests red` — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `dist/commands/workflow/tests.js`, `dist/commands/workflow/steps.js`

Reuse Inventory rows left out: 8; Architecture entries left out: 14 — read them in docs/plans/202611/914-build-planned-test-plan.md § Reuse Inventory and § Architecture & Component Changes.
