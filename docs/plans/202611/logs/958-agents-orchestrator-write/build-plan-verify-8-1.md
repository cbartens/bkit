Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 27, 30
Loosened: none
Fingerprint: ed43582c6593ca685f30cba71ba74e7cc31c86899fe10582d77fd1ae52135990
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-8-1.md`. Tasks 27 and 30 are satisfied; Tasks 28, 29 and 31 each have one unmet field or DONE WHEN clause (Identified Gaps Log). All 24 planned group 8 tests pass; the affected files (`status.test.ts`, `ledgers/status.test.ts`, `open-decision.test.ts`, `workflows.test.ts`, `tasks.test.ts`, `challenge.test.ts`, `steps.test.ts`, `cli-doc.test.ts`) pass in full: 684 passed.
- 16 older `decisions.test.ts` tests fail (apply `--by=rerun`/`--by=headless`/`--by=owner`, `pending`, two `check` tests) because group 8 moved `apply` and `pending` to `decision-answer` rows when Task 28 deleted `engineWith`. No group 8 DONE WHEN or TEST FIRST names them, so they are not gaps here; the group gate routes them. Six are named take-overs in group 9 (Tasks 32, 33, 34); the other ten are named by no later task, so the holistic check must see them fixed.
- Test-first audit: `Enforced: true`; no `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Audit gap `TASK 29: delete-still-referenced` (`mergeItems` at `docs/deferrals.jsonl:531`): no gap. The hit is the `Done when` text of an append-only deferral row about an earlier finding, not a code reference; `git grep` finds no `mergeItems`, `mergeHeader`, `TAKEN_UNASKED`, `engineSibling`, `isEngineFile`, `engineStub` or `engineWith` in `.bkit/core/engine` outside tests.
- Taken over (judged as new planned tests of the taking task, against its DONE WHEN): Task 28 takes six Task 11 `decisions counts` tests; Task 29 takes six Task 9 and two Task 18 `open-decision.test.ts` tests; Task 30 takes the Task 9 `status resume` and `workflows summary` tests and the Task 18 `decisions skip` test. Each asserts the row-based behaviour its task names. The Task 28 counts tests check the attempt and progress only in `show`, which is part of the Task 28 gap.
- Decision records `build-decision-1-1.md` (group 3 verify) and `build-decision-1-2.md` (challenge, Task 18 Fix now, assumed, not the owner's acceptance) accept no group 8 gap.
- `parseStatusLines` keeps the planned `(text, label)` signature, but `label` is unused (`_label`); not a gap.

## Identified Gaps Log

3 gaps.

- TASK 28: `.bkit/core/engine/commands/workflow/decisions.ts:519` — the `decision-counts` row holds only `sourceChanged`, `gate`, `baseCheck` and `loop {title, question, options, recommended, reason}`; the attempt and max, and the progress numbers from `loopProgress` (problems and gate failures per round, code changed, strategy, minutes per round, trend), appear only in the printed `show` lines, so DONE WHEN "the row carries every number the -engine.md file held" and the plan's `counts` contract (Architecture: "with `--loop`, the attempt and max, the progress numbers from `loopProgress`") are unmet; the planned test asserts them only in `show` — Fixable: true
- TASK 31: `.bkit/core/engine/commands/workflow/open-decision.ts:265` — `pauseStatus` returns a written `Status:` line for a file no row names before it checks for readable questions, so a file whose questions do not parse (en-dash `**Q2 – …`) and whose header says `Status: DECIDED` reads `DECIDED` through `pauseStatus` and `openDecision` (probe: `status: "DECIDED", questions: 0`); DONE WHEN says a file with no parseable question is never read as settled by `openDecision` or `pauseStatus` — Fixable: true
- TASK 29: `.bkit/core/engine/commands/workflow/open-decision.ts:154` — `hasEngineLines` treats a file as old when its header has `Status`, `Source changed` or `Gate`, but the task fields define an old file as one whose header carries a `Status:` line and that no row names; a file with no `Status` header but a `Gate:` or `Source changed:` header and no rows has its in-file `Decision:` lines read as answers, the case the planned test "a Decision line in a file with no Status header is not read as an answer" names — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 28: the decision-counts row lacks the attempt, max and progress numbers
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:519` · **Round:** 1
  - **DONE WHEN:** the decision-counts row carries the attempt and max and the loopProgress numbers (problems and gate failures per round, code changed, strategy, minutes per round, trend), and the Task 28 counts test asserts them in the row
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 31: a no-question file with a written Status: DECIDED reads settled
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:265` · **Round:** 1
  - **DONE WHEN:** pauseStatus and openDecision read OPEN for a decision file with no readable question, whatever Status line it carries, with a test
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 29: the old-file test also accepts a Source changed or Gate header
  **Severity:** LOW · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:154` · **Round:** 1
  - **DONE WHEN:** only a file whose header carries a Status: line and that no row names is read as an old file, with a test that a Gate: header file with a Decision line and no rows reads no answer
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
