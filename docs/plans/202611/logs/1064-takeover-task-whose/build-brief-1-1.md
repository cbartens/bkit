# Brief: group 1 — A recorded takeover task is not reused

Plan: A takeover task whose tests are recorded is not reused Implementation Plan

## Why and what

### Context & Goals

`addTakeoverTasks` (`.bkit/core/engine/commands/workflow/tasks.ts`) reuses an open takeover task that already names the contradicted test, even when that task's tests step has already run and recorded the test (a `build-tests-red` row). A second contradiction of the same test then adds no task, `bkit tasks takeover --pending` names no group, and the test is never rewritten. The fix: an open takeover task is reused only while the test it names has no red record for that task; otherwise a new takeover task is added the way a first contradiction adds one. A repeated call before the new task's tests are recorded still reuses it (one task, one `build-takeover` row). Issue #1064.

**Related Issues:**

- #1064 — A takeover task whose tests are already recorded is reused for a second contradiction (this plan)
- #1002 — Build: one planned-test lock instead of four mechanisms (reworks the same lock; the 5-task group cap and `pendingTakeovers` reading red records by group are tracked there and are out of scope here)

---

### Narrative

A build contradicts a planned test whose takeover task has already had its tests recorded. The engine adds a new takeover task, the next tests step rewrites the test, and the gate can go green with no owner stop.

### Success Criteria

- A second entry for a test whose open takeover task has a red record adds a new takeover task and a new `build-takeover` row.
- `bkit tasks takeover --pending` names the new task's group.
- A repeated call for the same entry, before the new task has a red record, reuses the new task and writes no second `build-takeover` row.
- The existing reuse test `addTakeoverTasks reuses the open task on a second call` stays unchanged and green.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The cap of 5 tasks per group | Only adds to this fix's goal | #1002 |
| `pendingTakeovers` reading red records by group | Only adds to this fix's goal | #1002 |
| Changes to `steps.ts`, `tests.ts`, `decisions.ts`, `status.ts`, `.bkit/instructions.md`, workflow and prompt files | Not needed; `redEntries` and `redKey` are only read | None |

## Where it fits

- Group 1: A recorded takeover task is not reused — this group
  - TASK 1: Reuse an open takeover task only while its test has no red record — open
  - TASK 2: State the reuse rule in the workflow doc and rebuild — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Reuse an open takeover task only while its test has no red record
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

- [ ] **TASK 2:** State the reuse rule in the workflow doc and rebuild
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: in the bullet "A takeover added mid-build" (line 1814), the sentence "an open takeover task naming the same file and name is reused" gains "while its test has no red record"; no other change
  - **READ:** `.bkit/core/engine/commands/workflow/tasks.ts`: the final behaviour the sentence must match
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n "no red record" .bkit/core/.bkit/workflows.md` finds the clause, `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md` with the same clause, `pnpm build` has refreshed `dist/` so it matches the new `tasks.ts`, and `bkit check` reports no drift
  - **TEST FIRST:** n/a — a doc sentence and a regenerated build output; the behaviour tests are TASK 1's

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Skip an open takeover task that already has a red record | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -n "redEntries\|redKey\|addTakeoverTasks\|pendingTakeovers" .bkit/core/engine/commands/workflow/tasks.ts`; read `redEntries` and `redKey` in `tests.ts` (lines 399-438) | `tasks.ts` — `addTakeoverTasks` finds the open task but ignores red records; `redEntries` and `redKey` are already imported there (lines 34-38) and used by `pendingTakeovers` | EXTEND | Add a red-record check to the existing `open` lookup; no new helper or file |
| Tests for the reuse rule | `.bkit/core/engine/commands/workflow/tasks.test.ts` | `grep -n "addTakeoverTasks\|takeover(" .bkit/core/engine/commands/workflow/tasks.test.ts`; read lines 780-900 | `tasks.test.ts` — the `takeover`, `pending`, `plan` and `rows` helpers and the existing reuse test | EXTEND | Two new tests beside the existing reuse test, using its helpers |
| The reuse rule's doc line | `.bkit/core/.bkit/workflows.md` | `grep -rn "open takeover\|reuses the open\|already takes over" docs/testing.md .bkit/core/.bkit/workflows.md` | `.bkit/core/.bkit/workflows.md` line 1814 states the rule; `docs/testing.md` does not | EXTEND | One clause of line 1814 gains the red-record condition |

### Architecture entries

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

## Deviations

publish=false
