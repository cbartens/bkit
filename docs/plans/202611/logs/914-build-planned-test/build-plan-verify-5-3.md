Verdict: FAIL
Failures: 2
Fixable: true
Tasks: 14, 15, 16, 17
Loosened: none
Fingerprint: b9e32d95661f2e4e7a50d747500ff8fd5218a2217cd18e04406e75dd1190b8ec
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-5-1.md` (CONCERNS, 2 Fixable: true gaps on Task 18: no working restore for a `test-loosened` `Changed by a code step` test; stale catalog rows). Closed by `build-plan-gaps-remediate-5-1-log.md` (PASS, Fixed 2).
- `build-plan-verify-5-2.md` (CONCERNS, 2 Fixable: true gaps on Task 18: a mis-nested `Else` in the verify rule; a restore bullet naming an `origin` field the `changed` entry does not carry). Closed by `build-plan-gaps-remediate-5-2-log.md` (PASS, PIVOT, Fixed 2).

## Notes

- Judged against `build-diff-5-3.md` (group diff: `f4ca3a679` tests, `fdf41478f` code, `e98a5acf9` and `1e9ff2f77` remediate). Engine source and `dist/` are unchanged since `fdf41478f`; remediate attempt 2 touched only the two prompts, `.bkit/instructions.md`, the mirrors and `.bkit/version`.
- Both attempt-2 gaps are closed. In `.bkit/core/prompts/bkit-build-plan-verify.md:96-100` the `If` / `Else` sit at 5 spaces under the `Changed by a code step` bullet, with the earlier-group-or-repeat `If` / `Else` at 7 spaces under the "added line disables or loosens" case, and all five mirrors carry it. The tests-step restore bullet (`bkit-build-plan-tests.md:81`) now works from the entry's diff and names no `origin` field.
- TASK 14-17: unchanged since attempt 1 and still satisfied (`changed` built before the not-enforced return in `tests.ts`; `newestBlob` move for a `block: null` baseline in `lockBaselines`; `CODE_STEPS` and non-empty `reason` filter; `fieldExtras` refusal in `steps finish` and `steps done`; `baselineDiff` reads a null blob as `""` and `lineDiff` splits `""` to no lines).
- TASK 18: every DONE WHEN item holds (verify rule, unchanged let-through gate, refusal text at `steps.ts:1387`, `docs/testing.md:314`). It stays open for gap 1: making the refusal text change meant rewriting a line of Task 11's group 3 planned test, which bypassed the lock. I checked this by diffing the test's block in the group 3 red blob `16b2083531c9` against HEAD; the only difference is line 2453. The `renames a planned test away` test at `:2465` is not plan-named, so editing it is free. Group 5's `steps finish` let the rewrite through with no `changedTests`. That fits the observation in `build-decision-1-3.md` that the run's `bkit` commands use the main checkout's dev engine, not this branch's lock, so a green `steps finish` in this run does not prove a planned test is untouched.
- Local run: `tests.test.ts`, `steps.test.ts` and `workflow-shape.test.ts` pass 625 of 625, which includes every `TEST FIRST` test of Tasks 14-18.
- Test-first audit (`build-tests-green-5-3.md`): `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Changed by a code step` section, so there is no `null` gap to decide and nothing loosened. Already landed: Task 15 `steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11", because the engine already refused any edit to an unlocated test's whole file and the test guards that it stays refused.
- Plan currency (`build-plan-current.md`): the two `Reword` items name Tasks 5 and 7 (earlier groups), none of this group.
- Decision records: decision 6 (`build-decision-1-6.md`) chose Fix now for Tasks 15 and 18 (option (a)). Decisions 3 and 4 covered 13 other rewritten planned tests of Tasks 2-4, not Task 11's, so no record accepts gap 1.
- Docs: `docs/testing.md` § Test first and `docs/observability.md` § Scope / Bookkeeping effects were read; the new `--field changedTests` refusal is a `CommandError` usage error that writes nothing, which matches. `docs/data-schema.md` is the starter (no database). `docs/architecture.md` and `docs/security.md` were not relevant to this group's diff.
- Out of scope, carried from attempts 1-2 and proposed separately: `runs.ts:2329` writes a `step-done` row with any `--step` and raw `--field` extras, so `--step=build-plan-tasks --field=changedTests=...` could still forge a record that moves a baseline.

## Identified Gaps Log

2 gaps.

TASK 18: `.bkit/core/engine/commands/workflow/steps.test.ts:2453` — the group 5 code step (`fdf41478f`) rewrote a line of Task 11's planned test `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` (group 3 red row, blob `16b20835`, block `4ab20b15`): `/BLOCKED line cannot remove or loosen/` became `/refuses a BLOCKED-named change that removes a line/`, with no `BLOCKED` line in `build-plan-tasks-5-log.md` and no `changedTests` record on the group 5 `build-plan-tasks` row, so `tests green` lists no `Changed by a code step` entry and the owner never sees it at Step 15, and this branch's lock (Task 1, every group with a red row) refuses the next code step it runs on with exit 11 naming the test. The rewrite is forced by Task 18's own DONE WHEN (the refusal text no longer says "cannot remove or loosen", which Task 11's `fails on` text requires), a code step cannot keep a rewritten line even under a `BLOCKED` line (Task 11's add-only rule), and the group 5 tests step cannot record it red because Task 11 is a ticked group 3 task; closing it needs the owner to move the test to a new fix task for the tests step (as decision 4 did for Tasks 12-13) or accept the rewrite — Fixable: false
TASK 18: `.bkit/core/prompts/bkit-build-plan-tests.md:81` — the restore bullet for a `Changed by a code step` entry contradicts itself: it says to remove each added line that disables or loosens the test "so the test's own lines match the baseline side of the entry's diff" and then that "the code step's other added lines stay", but a test that keeps any other added line cannot match the baseline side; say instead that the restored test holds every baseline line and only the added lines that do not disable or loosen it, and re-render the mirrors and `.bkit/instructions.md` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group 5 code step rewrote a line of Task 11's group 3 planned test with no BLOCKED line or changedTests record
  **Severity:** HIGH · **Class:** planned-test-rewrite · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.test.ts:2453` · **Round:** 1
  - **DONE WHEN:** Task 11's planned test `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` has an owner-approved baseline for its current lines: either it moves to a new fix task whose tests step records it red again (as decision 4 did for Tasks 12-13), or the owner accepts the rewrite; then the lock reports no planned test touched for the current tree and the next code step's steps finish is not refused with exit 11 for it
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Restore bullet for a Changed by a code step entry contradicts itself
  **Severity:** LOW · **Class:** prompt-wording · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-build-plan-tests.md:81` · **Round:** 1
  - **DONE WHEN:** The tests-step restore bullet for a Changed by a code step entry says the restored test holds every baseline line plus only the added lines that do not disable or loosen it, with no claim that its lines match the baseline side; mirrors re-rendered and .bkit/instructions.md synced
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
