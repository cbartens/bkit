## Session Prompt — this run's, newer than everything below

#1064 publish=false

## Issue description — oldest

### What happened

Seen in the build of "Agents and the orchestrator write their own .md files; the engine checks and counts" (https://github.com/cbartens/bkit/issues/958), run 2, group 9.

A planned test is a test the plan names for a task. A code step may not change it (`bkit steps finish` exits 11). When a later change contradicts a planned test whose owner task is ticked, the engine adds a takeover task to the plan, and that task's tests step rewrites the test before the next verify or gate (`bkit-build.md` § Pending takeovers). This is the only way a build changes a planned test without the owner.

`addTakeoverTasks` in `.bkit/core/engine/commands/workflow/tasks.ts` (line 359) reuses an open takeover task that already names the test (lines 371-382). That keeps a repeated call from adding a second task. It also reuses a takeover task whose tests step has already run:

1. In group 8, the engine added takeover TASK 38 for the test `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file`. Its tests step ran and the test's red record was written.
2. In group 9, TASK 33 changes the behaviour again (the owner's words no longer reach a status row), so one assertion of the same test can no longer hold.
3. A code or fix step that changes that assertion and logs a `BLOCKED` line is refused, as designed. The engine then answers "the build added takeover TASK 38, which rewrites it in its own tests step — put it back". TASK 38 is still open (unticked), so it is reused.
4. TASK 38's test is already recorded, so `bkit tasks takeover --pending` does not name its group, and no tests step runs for it before group 9's verify and gate.

The test stays as it is, group 9's gate cannot go green, and no answer at a pause changes that. The build stops for the owner on a contradiction the plan itself settles.

### What should happen

A second contradiction of a test whose takeover task has already recorded its tests gets a new takeover task. § Pending takeovers then runs that task's tests step, the test is rewritten there, and its red record moves the lock of every other task naming the test.

A repeated call for the same contradiction, before the takeover task's tests were recorded, still reuses the open task: one task and one `build-takeover` row.

### How bad

High for a build that reaches it: the run cannot finish without the owner or a hand edit ("Runs finish unattended"). It needs one test to be contradicted twice in one build, by two different groups.

### Possible fix

In `addTakeoverTasks` (`tasks.ts`, lines 371-378): an open takeover task is reused only while the test it names has no red record for that task (`redEntries(statusPath, "build")` with the key `redKey(task, test, name)`). Otherwise a new takeover task is added, as for a first contradiction.

Tests first, in `.bkit/core/engine/commands/workflow/tasks.test.ts`, next to `addTakeoverTasks reuses the open task on a second call` (line 838):

- a second entry for a test whose open takeover task already has a red record adds a new task and a new `build-takeover` row, and `bkit tasks takeover --pending` names the new task's group;
- the existing reuse test stays as it is and stays green.

Check against "Build: one planned-test lock instead of four mechanisms" (https://github.com/cbartens/bkit/issues/1002), which reworks the same lock; its comment of 2026-11-19 lists three more takeover findings from the same build.

### Removes

Nothing.

## Plan — docs/plans/202611/1064-takeover-task-whose-plan.md — last committed 2026-11-19T03:38:39.000Z

# A takeover task whose tests are recorded is not reused Implementation Plan

## Context & Goals

`addTakeoverTasks` (`.bkit/core/engine/commands/workflow/tasks.ts`) reuses an open takeover task that already names the contradicted test, even when that task's tests step has already run and recorded the test (a `build-tests-red` row). A second contradiction of the same test then adds no task, `bkit tasks takeover --pending` names no group, and the test is never rewritten. The fix: an open takeover task is reused only while the test it names has no red record for that task; otherwise a new takeover task is added the way a first contradiction adds one. A repeated call before the new task's tests are recorded still reuses it (one task, one `build-takeover` row). Issue #1064.

**Related Issues:**

- #1064 — A takeover task whose tests are already recorded is reused for a second contradiction (this plan)
- #1002 — Build: one planned-test lock instead of four mechanisms (reworks the same lock; the 5-task group cap and `pendingTakeovers` reading red records by group are tracked there and are out of scope here)

---

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — engine code under `.bkit/core/engine/` | `docs/architecture.md` § File placement (headings read) | covered | None |
| technology | `docs/technology.md` | yes — TypeScript engine conventions | `docs/technology.md` § Conventions (headings read) | covered | None |
| security | `docs/security.md` | no — no route, secret, user input or network change; the change reads and writes local plan and status files only | none | none | None |
| testing | `docs/testing.md` | yes — test-first rule and the tier of the new tests | `docs/testing.md` § Test first (line 510, the takeover rule) and § Tests table row for `commands/workflow/tasks.test.ts` (line 956) | covered | The row lists what `tasks.test.ts` covers; the takeover rule at line 510 states no reuse condition, so no doc line changes there. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None |
| design | `docs/design.md` | no — no UI | none | none | None |
| observability | `docs/observability.md` | no — no log or trace name changes; the existing `added TASK` and `already takes over` log lines keep their text | none | none | None |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | None |
| workflows (rule being changed) | `.bkit/core/.bkit/workflows.md` | yes — line 1814 states the reuse rule | `.bkit/core/.bkit/workflows.md` § Pending takeovers bullet "A takeover added mid-build" (line 1814) | covered | One clause of line 1814 states the reuse rule and is changed in TASK 2. |

## Documentation Warnings

None

## Acceptance Scenario

### Narrative

A build contradicts a planned test whose takeover task has already had its tests recorded. The engine adds a new takeover task, the next tests step rewrites the test, and the gate can go green with no owner stop.

### Success Criteria

- A second entry for a test whose open takeover task has a red record adds a new takeover task and a new `build-takeover` row.
- `bkit tasks takeover --pending` names the new task's group.
- A repeated call for the same entry, before the new task has a red record, reuses the new task and writes no second `build-takeover` row.
- The existing reuse test `addTakeoverTasks reuses the open task on a second call` stays unchanged and green.

### Process Sketch

- **WHEN** `addTakeoverTasks` gets an entry whose open takeover task has a `build-tests-red` record for its test **→ THEN** it adds a new takeover task, its matrix row and a `build-takeover` row.
- **WHEN** it gets the same entry again, before the new task has a red record **→ THEN** it reuses the new task and writes nothing.
- **IF** the open takeover task has no red record **→ THEN** it is reused as before.

### Concrete Example

**Setup:** A plan with takeover TASK 3 (group 3) for `adds a row`, a `build-takeover` row for TASK 3 and a `build-tests-red` row for group 3 that records TASK 3's test.

**Steps:**

1. A code step contradicts `adds a row` again → `addTakeoverTasks` returns `[4]` and adds TASK 4 in group 4 plus a second `build-takeover` row.
2. `bkit tasks takeover --pending` → names group 4 and task 4.
3. The same entry arrives again → `addTakeoverTasks` returns `[4]`, the plan is byte-identical and there are still two `build-takeover` rows.

**Outcome:** The test is rewritten in group 4's tests step, and group 9's gate in the original build can go green.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The open takeover task's test has no red record | The task is reused; one task and one row (existing test) |
| The open takeover task's test has a red record | A new takeover task and row are added |
| The same entry repeats after the new task was added | The new task is reused; no second row |
| A run stopped after the plan write, before the row write | Only the missing row is written (existing behaviour, unchanged) |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a second entry for a test whose open takeover task has a red record adds a new task and a new `build-takeover` row, and `bkit tasks takeover --pending` names the new task's group | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| a repeated call for that entry reuses the new task and writes no second row | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |

### Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## Breaking Changes & Naming Review

None

## Open Questions & Assumptions

- **Assumption:** the red record is read with `redEntries(statusPath, "build")` (all groups) and keyed by `redKey(task, test, name)` with the plan's own test name, as `pendingTakeovers` already does → if the key used a differently spelled name, a recorded task would still be reused.

## Alternative Approaches & Recommendations

- Tick the old takeover task or edit its test name instead of adding a new one: rejected, the engine would rewrite plan state the owner of the plan did not ask to change, and the issue names the new-task shape.
- `pendingTakeovers` reading red records by group and the cap of 5 tasks per group: tracked on #1002.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The cap of 5 tasks per group | Only adds to this fix's goal | #1002 |
| `pendingTakeovers` reading red records by group | Only adds to this fix's goal | #1002 |
| Changes to `steps.ts`, `tests.ts`, `decisions.ts`, `status.ts`, `.bkit/instructions.md`, workflow and prompt files | Not needed; `redEntries` and `redKey` are only read | None |

## Suggested Scope Expansion

None

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

## Pre-Flight / Dependencies

- **Prerequisite Plans:** None.
- **Other branch:** another branch also changes `tasks.ts` at lines 18, 157-166 and 473-515 of the base commit. This change stays away from those lines; it edits only the `open` lookup in `addTakeoverTasks` (about lines 371-378) and its doc comment.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Skip an open takeover task that already has a red record | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -n "redEntries\|redKey\|addTakeoverTasks\|pendingTakeovers" .bkit/core/engine/commands/workflow/tasks.ts`; read `redEntries` and `redKey` in `tests.ts` (lines 399-438) | `tasks.ts` — `addTakeoverTasks` finds the open task but ignores red records; `redEntries` and `redKey` are already imported there (lines 34-38) and used by `pendingTakeovers` | EXTEND | Add a red-record check to the existing `open` lookup; no new helper or file |
| Tests for the reuse rule | `.bkit/core/engine/commands/workflow/tasks.test.ts` | `grep -n "addTakeoverTasks\|takeover(" .bkit/core/engine/commands/workflow/tasks.test.ts`; read lines 780-900 | `tasks.test.ts` — the `takeover`, `pending`, `plan` and `rows` helpers and the existing reuse test | EXTEND | Two new tests beside the existing reuse test, using its helpers |
| The reuse rule's doc line | `.bkit/core/.bkit/workflows.md` | `grep -rn "open takeover\|reuses the open\|already takes over" docs/testing.md .bkit/core/.bkit/workflows.md` | `.bkit/core/.bkit/workflows.md` line 1814 states the rule; `docs/testing.md` does not | EXTEND | One clause of line 1814 gains the red-record condition |

## Architecture & Component Changes

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tasks.ts`

- **Existence Check:** the file exists; `addTakeoverTasks` is at line 359.
- The `open` lookup skips a task whose test has a red record for that task (`redEntries(statusPath, "build")` and `redKey(t.task, x.test, x.name)`). The doc comment above the function says so.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tasks.test.ts`

- **Existence Check:** the file exists; the existing reuse test is at line 838.
- Two new tests beside it.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; line 1814 holds the reuse clause.
- The clause says an open takeover task is reused only while its test has no red record.

**Ledger rows:** None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | Line 1814: the reuse clause names the red-record condition. Rendered copies come from `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never by hand. |
| `docs/testing.md` | None — line 510 and the `tasks.test.ts` row state no reuse condition. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: A recorded takeover task is not reused

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Reuse an open takeover task only while its test has no red record
  - **UPDATE:** `addTakeoverTasks` in `.bkit/core/engine/commands/workflow/tasks.ts`: the `open` lookup skips a task whose test has a `redEntries(statusPath, "build")` entry under `redKey(t.task, x.test, x.name)`; the doc comment states the rule; lines 18, 157-166 and 473-515 stay untouched
  - **READ:** `redEntries` in `.bkit/core/engine/commands/workflow/tests.ts`: the red records per task, read only
  - **READ:** `redKey` in `.bkit/core/engine/commands/workflow/tests.ts`: the key of a red record, read only
  - **READ:** `pendingTakeovers` in `.bkit/core/engine/commands/workflow/tasks.ts`: names the group of a takeover task with no red record, unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.test.ts`: two new tests beside `addTakeoverTasks reuses the open task on a second call`; the existing tests stay as they are
  - **READ:** `docs/testing.md`: § Test first (line 510) and the `tasks.test.ts` row (line 956), no change needed
  - **DONE WHEN:** both new tests pass, `addTakeoverTasks reuses the open task on a second call` is unchanged and passes, `git diff` of `tasks.ts` shows no change at lines 18, 157-166 or 473-515 of the base commit, and the plan-check accepts a plan written by the second call
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `addTakeoverTasks adds a new task when the open takeover task already has a red record` fails on the second call returning the old TASK 3 and writing no new `build-takeover` row, so `tasks takeover --pending` names no group
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `addTakeoverTasks reuses the new task on a repeat call after a recorded takeover` fails on the first call after the red record returning the old TASK 3, so no new task exists to reuse

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** State the reuse rule in the workflow doc and rebuild
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: in the bullet "A takeover added mid-build" (line 1814), the sentence "an open takeover task naming the same file and name is reused" gains "while its test has no red record"; no other change
  - **READ:** `.bkit/core/engine/commands/workflow/tasks.ts`: the final behaviour the sentence must match
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n "no red record" .bkit/core/.bkit/workflows.md` finds the clause, `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md` with the same clause, `pnpm build` has refreshed `dist/` so it matches the new `tasks.ts`, and `bkit check` reports no drift
  - **TEST FIRST:** n/a — a doc sentence and a regenerated build output; the behaviour tests are TASK 1's

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

## Verification Plan

### Automated Tests

- [ ] **Run the new and neighbouring tests:** `.bkit/core/engine/commands/workflow/tasks.test.ts` passes in full.
- [ ] **Static gate:** `pnpm build` leaves `dist/` matching the source, and `bkit check` passes.
