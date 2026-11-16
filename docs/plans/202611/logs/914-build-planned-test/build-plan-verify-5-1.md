Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 14, 15, 16, 17
Loosened: none
Fingerprint: f30611c60a809d581161d4cf501c36275c346f31a31f88fa1e20016cb993b0ea
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-5-1.md` (commits `f4ca3a679` tests, `fdf41478f` code). The three changed test files (`tests.test.ts`, `steps.test.ts`, `workflow-shape.test.ts`) pass 625 of 625 in a local run; every `TEST FIRST` test of Tasks 14-18 is among them.
- TASK 14: `changed` is built before the not-enforced return (`tests.ts:2479-2492`) and passed to both `writeAuditReport` and `ctx.emit`; the report writer prints `## Changed by a code step` with no enforced check; Step 15 (`bkit-build.md:1194-1198`) reads `changed` whatever `enforced` says. Satisfied.
- TASK 15: `lockBaselines` keeps the newest red blob per file and moves a `block: null`, non-change, non-missing baseline onto it (`tests.ts:406-413`). Satisfied.
- TASK 16: `CODE_STEPS` filter and non-empty `reason` check (`tests.ts:380-384`); `fieldExtras` refuses `changedTests=` with `EXIT.USAGE` in `steps finish` and in `steps done` (the record-only verb; there is no `steps record` verb, so `done` is read as the DONE WHEN's `steps record`). Satisfied.
- TASK 17: `baselineDiff` reads a null blob as `""` and `lineDiff` splits `""` to no lines; a set but unreadable blob still gives null and `steps.ts:1343` still refuses it; `bkit-build.md:155` shows the diff in the `CHANGED_TESTS` item. Satisfied.
- TASK 18: the verify prompt rule, the refusal text (`steps.ts:1387`) and `docs/testing.md:314` match the DONE WHEN, and the let-through gate is unchanged; left open for the two gaps below (restore route for a changed test, stale catalog rows).
- Test-first audit (`build-tests-green-5-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Changed by a code step` section. Already landed: Task 15 `steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" — the engine already refused any edit to an unlocated test's whole file; the test guards that it stays refused.
- Plan currency (`build-plan-current.md`): the two `Reword` items name Tasks 5 and 7 (earlier groups), none of this group.
- Decision records: decision 6 (`build-decision-1-6.md`) chose Fix now for Tasks 15 and 18 (option (a)); no record accepts either gap logged here.
- Out of scope, proposed separately: `runs.ts:2329` writes a `step-done` row with any `--step` and raw `--field` extras (when a CI dispatch is recorded), so `--step=build-plan-tasks --field=changedTests=...` could still forge a baseline-moving record; Task 16's DONE WHEN names only `steps finish` and `steps record`.

## Identified Gaps Log

2 gaps.

TASK 18: `.bkit/core/prompts/bkit-build-plan-tests.md:78-84` — the `test-loosened` gap the new verify rule raises for a `Changed by a code step` test has no working restore: the tests step's restore bullet reads only an `Updated tests` entry and restores "as it stood at `base`", which a code-step-changed test has neither of (its baseline is the red blob, the entry's `origin`), and for a test of an earlier group the restore route in `.bkit/core/workflows/bkit-build.md:833-850` is refused by `steps finish --step=build-plan-tests --group={GROUP}` (exit 15, file not named by the group's `TEST FIRST` lines) and `tests red --group={GROUP}` never re-records it, so the code step's `changedTests` baseline stays the loosened block; the verify rule also always logs `Fixable: true`, with no `Fixable: false` on a repeat the way the `Updated tests` rule escalates. DONE WHEN "raises a `test-loosened` gap that the tests step restores" is met on the verify side only; per decision 6 Q2 (a), a test the tests step cannot restore goes to the owner as a blocker — Fixable: true
TASK 18: `.bkit/core/.bkit/prompts.md:337` and `.bkit/core/.bkit/workflows.md:1799` — the catalog row for `bkit-build-plan-verify` still says "`Changed by a code step` entries → `Notes`, no gap" and the § Test-first Judgement row still says "`Changed by a code step` ... sections → noted, no gap", now that the prompt raises `test-loosened` for an added line that disables or loosens the test; `.agents/rules.md` § Index updates and the plan's `Documentation Updates` rows for these two rows (Tasks 6, 7) require them to match, and the rendered `.bkit/prompts.md` / `.bkit/workflows.md` need the re-render — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** No working restore for a test-loosened Changed by a code step test
  **Severity:** MEDIUM · **Class:** test-loosened-restore · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-build-plan-tests.md:78` · **Round:** 1
  - **DONE WHEN:** The tests step restore rule handles a Changed by a code step entry (restores the test to its baseline, removing the disabling added lines, keeping the rest), the restore route records it again so the code step changedTests baseline no longer holds the loosened block, a test of another group that the tests step cannot restore goes to the owner as Fixable: false, and a repeat test-loosened on the same changed test is Fixable: false
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Catalog rows still say Changed by a code step raises no gap
  **Severity:** LOW · **Class:** index-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/prompts.md:337` · **Round:** 1
  - **DONE WHEN:** The bkit-build-plan-verify row in .bkit/core/.bkit/prompts.md and the Test-first Judgement row in .bkit/core/.bkit/workflows.md:1799 say verify reads a changed test added lines and raises test-loosened for one that disables or loosens it; rendered .bkit/prompts.md and .bkit/workflows.md re-rendered
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
