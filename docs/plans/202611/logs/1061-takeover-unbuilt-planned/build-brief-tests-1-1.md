# Brief: group 1 — Takeover locks move whether or not `from` is set (tests)

Plan: Takeover of a test whose in-between owner is unbuilt Implementation Plan

## Why and what

### Context & Goals

A planned test is locked from the group's tests step on. A takeover moves that lock onto the rewritten lines, but only when the takeover's `build-tests-red` entry carries `from`. `bkit tests red` drops `from` when the nearest earlier task naming the test has no recorded red yet, and then two locks disagree and every later `steps finish` of a code step exits 11 (#1061, seen in #958). Goal, both in `.bkit/core/engine/commands/workflow/tests.ts`:

- Read side, `lockBaselines`: a red entry of one task for a test that an earlier-recorded key of another task names moves that key, whether or not the entry carries `from` (this frees rows already written).
- Write side, `fromOf` inside `bkit tests red`: `from` is the nearest earlier task naming the test that has a recorded baseline.

The lock stays as strong as before: a code step that changes a locked planned test is still refused with exit 11.

**Related Issues:**

- #1061 — takeover of a test whose in-between owner is unbuilt (this plan)
- #958 — Agents and the orchestrator write their own .md files (where it was seen)
- #1002 — Build: one planned-test lock instead of four mechanisms (waits on an owner decision; this bug stays in the takeover path)

---

### Narrative

A build whose status rows hold a takeover red without `from` passes the same `steps finish` call after the fix, with no row edited by hand, and new takeovers record `from`.

### Success Criteria

- A later task's red for a test an earlier task's key names moves that key, with or without `from`.
- `touchedTests` reports nothing for the issue's row shape when the file holds the later lines.
- `bkit tests red` records `from` as the nearest earlier task that names the test and has a baseline.
- `bkit tests green` lists such a takeover under `takenOver`.
- A code step that changes a locked planned test is still refused.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Reworking the lock into one mechanism | Only adds to the goal | #1002 |
| A `bkit tests plan-check` warning for such plans | The fix removes the failure instead | None |
| Changes to `steps.ts`, `tasks.ts`, `decisions.ts`, `status.ts`, `.bkit/instructions.md`, workflows and prompts | The run constraints forbid them; none reads `from` or the baseline `origin` in a way that needs a change (checked in TASK 2) | None |

## Where it fits

- Group 1: Takeover locks move whether or not `from` is set — this group
  - TASK 1: Read side: `lockBaselines` moves earlier keys on any red entry of another task naming the same test — open
  - TASK 2: Write side: `fromOf` walks back to the nearest earlier owner that has a baseline — open
  - TASK 3: Docs, rendered copy and `dist/` follow the rule — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Read side: `lockBaselines` moves earlier keys on any red entry of another task naming the same test
  - **READ:** `lockBaselines` in `.bkit/core/engine/commands/workflow/tests.ts`: the move loop after the `keepsProof` check, gated by `t.from === undefined`
  - **READ:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: the only reader of `lockBaselines` in `steps.ts` (its `finish` lock and the tests step's own lock); it compares each baseline's `block` to the file's lines
  - **READ:** `lockBaselines and takeovers` in `.bkit/core/engine/commands/workflow/tests.test.ts`: the `redRow` and `entry` fixtures
  - **UPDATE:** `lockBaselines` in `.bkit/core/engine/commands/workflow/tests.ts`: the move to other keys no longer needs `from`; the moved fields stay as today
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: import `touchedTests`; add the new tests; in `lockBaselines leaves a test nobody took over on its own baseline`, give task 5's entry `{ test: "src/b.test.ts" }`, since two tasks naming one test in one file is a takeover under the issue
  - **DONE WHEN:** the new `lockBaselines` and `touchedTests` tests pass; `touchedTests` lists nothing for an earlier red plus a later no-`from` red with a different `block` when the file holds the later lines, and still lists the test when the file holds the earlier lines; every other existing test of `touchedTests`, `lockBaselines` and the takeover chain is unchanged and green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `lockBaselines moves an earlier task's key onto a later task's red entry that carries no from` fails on task 2's key keeping "old" while task 5 holds "new"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `touchedTests reports nothing when the file holds the later task's lines and its red carries no from` fails on the test being reported touched for the earlier task, the "no open task of group" refusal of #1061

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Write side: `fromOf` walks back to the nearest earlier owner that has a baseline
  - **READ:** `fromOf` in `.bkit/core/engine/commands/workflow/tests.ts`: today `takeovers.get(...).from` is the nearest earlier owner, kept only if `baselines` holds it
  - **READ:** `takenOverEntry` in `.bkit/core/engine/commands/workflow/tests.ts`: with the `takenOver` push in the green verb, the other reader of a red entry's `from`; it finds the owner's red through `redEntries` by `red.from`, so an owner with a red works unchanged
  - **READ:** `redEntries` in `.bkit/core/engine/commands/workflow/tasks.ts`: `tasks.ts` reads reds through `redEntries` only (no `from`, no baseline `origin`); the baseline `origin` is read by `tests changed` in `tests.ts` through `lockBaselines`, whose moved fields TASK 1 leaves as they were
  - **READ:** `takeover` in `.bkit/core/engine/commands/workflow/tests.test.ts`: the describe with `writeTakeoverPlan`, `groupOneRed`, `red2` and the green call
  - **UPDATE:** `fromOf` in `.bkit/core/engine/commands/workflow/tests.ts`: from the task's place in `parsed.tasks`, walk back to the nearest earlier task whose `TEST FIRST` names the test (posix-normalized file, `sameTestName`) and for which `baselines` holds a key (same test and name); return its number, else `undefined`; `takeovers` still decides whether the entry is a takeover at all
  - **UPDATE:** `RedTest` in `.bkit/core/engine/commands/workflow/tests.ts`: the `from` doc comment, "the nearest earlier task naming this test that has a baseline"
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: add the three tests to the `takeover` describe, with a plan of TASK 1 (group 1), TASK 2 (group 2, unbuilt) and TASK 3 (group 3) naming the same test
  - **DEPENDS ON:** 1
  - **DONE WHEN:** with TASK 1 red recorded and group 2 never run, `bkit tests red --group=3` records TASK 3 with `from: 1`, and `bkit tests green --group=3` lists it under `takenOver` from TASK 1; with no baseline for any earlier owner `from` stays absent; the existing `tests red records a failing takeover as red with from` and the other `takeover` tests stay green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests red records from as the owner when an unbuilt task between the two names the test` fails on the entry carrying no `from`, "from: 1" missing
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests green lists a takeover whose nearest earlier task has no red as taken over from the owner` fails on `takenOver` being empty

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a later task's red with no `from` moves an earlier task's key onto its lines | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| rows shaped like #958 (earlier red, later red with no `from` and a different block) with the file holding the later lines: `touchedTests` reports nothing | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| the file holding the earlier lines after that move: `touchedTests` still reports the test (the lock is no weaker) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| the same test name in another file stays on its own baseline (the existing "nobody took over" test, its second entry moved to another file) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| an unbuilt task between the owner and the takeover: `bkit tests red` records `from` as the owner | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| the same plan: `bkit tests green` lists the takeover under `takenOver` from the owner | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| no earlier task naming the test has a baseline: `bkit tests red` records no `from` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |

## Deviations

- Files you may change: `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/tests.test.ts`, the built `dist/`, and a doc line only where a doc states the rule you change (search `docs/testing.md` and `.bkit/core/.bkit/workflows.md` for it; rendered copies are regenerated with `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited by hand).
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tasks.ts`, `decisions.ts`, `status.ts`, `.bkit/instructions.md`, and every workflow and prompt file. The 958 branch changes them. If the fix cannot be done without one of them, stop and message the orchestrator.
- Two parts, both named in the issue under "Possible fix":
  - Read side, `lockBaselines` (`tests.ts:489`): a red entry of one task for a test that an earlier-recorded key of another task names moves that key, whether or not the entry carries `from`. This part is what unsticks rows that are already written, so it is not optional.
  - Write side, `fromOf` inside `bkit tests red` (`tests.ts:2599`): `from` is the nearest earlier task naming the test that has a recorded baseline; today it gives up when the nearest earlier task has none.
- The lock itself must not get weaker. A code step that changes a locked planned test is still refused with exit 11, and every existing test of `touchedTests`, `lockBaselines` and the takeover chain stays as it is and stays green. Add tests; change an existing one only if the issue's own behaviour contradicts it, and say so in your report.
- Test first, on rows shaped like the real ones: an earlier task's `build-tests-red` entry for a test, then a later task's entry for the same test with no `from` and a different `block`, with the file holding the later lines. `touchedTests` must report nothing for it. Add the write-side test too: a plan where an unbuilt task names the test between the owner and the takeover task records `from` as the owner.
- Real rows to read, read-only: `.worktrees/958-agents-orchestrator-write/docs/plans/202611/logs/958-agents-orchestrator-write/status.jsonl` (`build-tests-red` rows of groups 3, 6, 7 and 11) and the plan beside it. Never write, stage or run a `bkit` verb that writes inside that worktree. A paused build session owns it.
- Check what else reads `from` or the baseline `origin` before you change either (`bkit tests green`, the `takenOver` entries at `tests.ts:3032`, `tests changed`), and say in your report what you found.
