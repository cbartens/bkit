Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 33, 34, 35
Loosened: none
Fingerprint: 801c61e875153104b138d53b4be4b07ab2c24a1b05689055f3495d76e9e194c3
<!-- verdict:end -->

# Plan Verification

## Scope

Group 9

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Tasks 33, 34 and 35 are satisfied; Task 32 is not.

- Ran `decisions.test.ts`, `cli-doc.test.ts`, `open-decision.test.ts`, `status.test.ts`, `tasks.test.ts`, `ship-invariants.test.ts`, `question-option-format.test.ts`, `ci-dispatch-gate-alignment.test.ts` and `owner-wait-rows.test.ts`: 468 passed, 1 failed (`writes a confirmation into the engine file`, decisions.test.ts:1851). `dist/commands/workflow/decisions.js` and `open-decision.js` carry the group's code; `.bkit/core/.bkit/cli.md` lists `--fix-task` and `answers`, and `cli-doc.test.ts` passes.
- Task 32 not-green: the tests step's rewrite expects `^Accept — fine (owner, confirmed at ship, ` in the status row's answer. Task 33's DONE WHEN says no `--by=owner` call puts `--reason-file` text in a status row, and its multi-line test enforces it. The plan therefore decides: the reason belongs only in the `docs/decisions.jsonl` rationale (`decisionRow`, decisions.ts:318, already writes it there). The test, not the code, is the part to change. The tests step should assert the rationale in `docs/decisions.jsonl` and an answer of `^Accept — `. The plan-tasks log's `BLOCKED — TASK 32` line names the same conflict and does not satisfy the DONE WHEN.
- Updated tests (test-first audit): none loosened. The headless and confirmation rewrites swap the engine-file expectations for row expectations with the same pattern. The three Task 34 tests swap the `-engine.md` fixture for a `decision-counts` row and keep their exit-code and text expectations.
- Taken over: Task 33's `--answer writes the loop answer under the engine file's Q1` drops the owner-words expectation (`one more round`), and `--answer reads the owner's reason from --reason-file` now expects exit 2 with no row. Both match Task 33's TEST FIRST and DONE WHEN. Task 32's headless and confirmation tests and Task 34's three check tests are judged above.
- Already landed: `bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED`. The tests step's reason: apply --by=rerun already appends the Q1 row with by rerun (decisions.ts:686).
- Unproven: none. Enforced: true.
- `.bkit/core/workflows/bkit-build.md:292` still passes `--q=1 --answer="{Try again|Decide|Stop}"`, which Task 33 removed. Task 36 (group 10) owns that line, so it is not a group 9 gap.
- `engineOf` stays in decisions.test.ts only for `existsSync(...) === false` checks, which the TEST FIRST rows ask for ("fails on a -engine.md file being written"). No check test writes an engine file any more.
- Decision records `build-decision-1-1.md`, `build-decision-1-2.md` and `build-decision-2-1.md` accept no group 9 item.
- No earlier verify or remediation report exists for group 9.

## Identified Gaps Log

3 gaps.

TASK 32: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` — not-green — Fixable: true
TASK 32: `applyRecommendations` in `.bkit/core/engine/commands/workflow/decisions.ts:275` still returns `Decision: …` text lines that the headless caller strips, not rows as the UPDATE field asks — Fixable: true
TASK 32: `apply --by=rerun` at `.bkit/core/engine/commands/workflow/decisions.ts:699` appends a Q1 row whose answer is `Re-run gate — …`, not the `Try again` answer the UPDATE field names, so `decisions answers` prints a Q1 answer that is none of the loop options — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 32's confirmation test is not green: it asks for the owner's reason inside the decision-answer row, which Task 33's DONE WHEN forbids
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.test.ts:1851` · **Round:** 1
  - **DONE WHEN:** TASK 32: the four tests below pass
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > writes a confirmation into the engine file
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** applyRecommendations still returns Decision: text lines that the headless caller strips
  **Severity:** LOW · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:275` · **Round:** 1
  - **DONE WHEN:** TASK 32 UPDATE: applyRecommendations returns rows instead of text
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** apply --by=rerun writes the Q1 answer as 'Re-run gate — …', not Try again
  **Severity:** LOW · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:699` · **Round:** 1
  - **DONE WHEN:** TASK 32 UPDATE: --by=rerun appends a Q1 Try again row with by: rerun
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
