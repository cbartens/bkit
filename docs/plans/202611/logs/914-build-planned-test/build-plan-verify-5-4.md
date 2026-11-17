Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 14, 15, 16, 17
Loosened: none
Fingerprint: e2d5e88668ead6b7a29a40366ae800ecf882756b5758fc22a3c86ff108051ab1
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-5-1.md` (CONCERNS, 2 Fixable: true gaps on Task 18). Closed by `build-plan-gaps-remediate-5-1-log.md` (PASS, Fixed 2).
- `build-plan-verify-5-2.md` (CONCERNS, 2 Fixable: true gaps on Task 18). Closed by `build-plan-gaps-remediate-5-2-log.md` (PASS, PIVOT, Fixed 2).
- `build-plan-verify-5-3.md` (FAIL, 2 gaps on Task 18: the Fixable: false rewrite of Task 11's group 3 planned test at `steps.test.ts:2453`, and a Fixable: true self-contradicting restore bullet). `build-plan-gaps-remediate-5-3-log.md` (PASS, FINAL, Fixed 1) closed only the restore bullet; the Fixable: false gap stays open and is carried below.

## Notes

- Judged against `build-diff-5-4.md` (the group diff since group 5 started). Engine source and `dist/` are unchanged since `fdf41478f`; remediate attempt 3 changed only `.bkit/core/prompts/bkit-build-plan-tests.md`, its five mirrors and `.bkit/instructions.md`.
- Attempt 3's gap 2 is closed: the restore bullet (`bkit-build-plan-tests.md:81`) now says the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it, and all five mirrors and `.bkit/instructions.md` carry the same text.
- TASK 14: `changed` is built from `lockBaselines` before the not-enforced return and passed to both outputs on that path. Satisfied; its `TEST FIRST` test passes.
- TASK 15: `lockBaselines` records the newest red blob per file and moves a `block: null`, non-change baseline onto it. Satisfied; both `TEST FIRST` tests pass.
- TASK 16: `CODE_STEPS` filter and non-empty `reason` check in `lockBaselines`; `fieldExtras` refuses `--field changedTests=` with `EXIT.USAGE` in `steps finish` and `steps done` (there is no `steps record` verb; `done` is the record-only verb). Satisfied; both `TEST FIRST` tests pass.
- TASK 17: `baselineDiff` reads a null blob as `""`, `lineDiff` splits `""` to no lines, and a set but unreadable blob still gives null. Satisfied; its `TEST FIRST` test passes.
- TASK 18: every DONE WHEN item holds (verify rule at `bkit-build-plan-verify.md:96-100`, unchanged let-through gate, refusal text in `steps.ts`, `docs/testing.md:314`), and both `TEST FIRST` tests pass. It stays open for the carried Fixable: false gap. I re-checked it independently: `git show 16b20835` (the group 3 red blob) against HEAD shows the block of `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` differs only in its `toMatch` line; `status.jsonl` has no `changedTests` record on any row.
- Local run: `tests.test.ts`, `steps.test.ts` and `workflow-shape.test.ts` pass 625 of 625.
- Test-first audit (`build-tests-green-5-4.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Changed by a code step` section, so no `null` gap to decide and nothing loosened. Already landed: Task 15 `steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11", because the engine already refused any edit to an unlocated test's whole file and the test guards that it stays refused.
- Plan currency (`build-plan-current.md`): the two `Reword` items name Tasks 5 and 7 (earlier groups), none of this group.
- Decision records: decision 6 (`build-decision-1-6.md`) chose Fix now for Tasks 15 and 18. Decisions 3 and 4 covered 13 other rewritten planned tests of Tasks 2-4, not Task 11's, so no record accepts the carried gap.
- Docs: `.agents/docs.md` read; `docs/testing.md` § Test first matches the diff. `docs/observability.md` applies only to the new `--field changedTests` refusal, a `CommandError` usage error that writes nothing.
- Out of scope, carried from attempts 1-3 and proposed separately: `runs.ts:2329` writes a `step-done` row with any `--step` and raw `--field` extras, so `--step=build-plan-tasks --field=changedTests=...` could still forge a record that moves a baseline.

## Identified Gaps Log

1 gap.

TASK 18: `.bkit/core/engine/commands/workflow/steps.test.ts:2453` — the group 5 code step (`fdf41478f`) still holds a rewrite of a line of Task 11's group 3 planned test `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` (group 3 red row, blob `16b20835`, block `4ab20b15`): `/BLOCKED line cannot remove or loosen/` became `/refuses a BLOCKED-named change that removes a line/`, with no `BLOCKED` line in `build-plan-tasks-5-log.md` and no `changedTests` record on any code-step row, so `tests green` lists no `Changed by a code step` entry, the owner never sees it at Step 15, and this branch's lock refuses the next code step it runs on with exit 11 naming the test. Task 18's DONE WHEN forces the rewrite while Task 11's `TEST FIRST` (plan line 671) still requires the old wording, a code step cannot keep a rewritten line even under a `BLOCKED` line, and the group 5 tests step cannot re-record a ticked group 3 task's test; remediate attempt 3 (fixable only) left it open and no decision record covers it, so the owner must move the test to a new fix task for the tests step (as decision 4 did for Tasks 12-13) or accept the rewrite — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group 5 code step rewrote a line of Task 11 group 3 planned test with no BLOCKED line or changedTests record
  **Severity:** HIGH · **Class:** planned-test-rewrite · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.test.ts:2453` · **Round:** 1
  - **DONE WHEN:** Task 11 planned test `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11` has an owner-approved baseline for its current lines: either it moves to a new fix task whose tests step records it red again (as decision 4 did for Tasks 12-13), or the owner accepts the rewrite; then the lock reports no planned test touched for the current tree and the next code step steps finish is not refused with exit 11 for it
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
<!-- bkit:task 1 end -->
