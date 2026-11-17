Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 4
Loosened: none
Fingerprint: 7b3bffd2797f2e8aca370a1ad588adf974f6db8025c6094a9903915ead571a3a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None. This is the first verify attempt for group 2; `build-plan-verify-1-1.md` and `build-plan-verify-holistic-1.md` covered group 1.

## Notes

- Task 3: the new exit-80 arm sits in `.bkit/core/workflows/bkit-ship.md`:352, before **Else** → next sub-step, holds no `/bkit-debug {FID}`, and is rendered into `.claude/`, `.cursor/`, `.opencode/` commands and both `.agents/` `bkit-ship/SKILL.md` copies. `ship-invariants.test.ts` passes. The none-render baseline holds different text (gap below).
- Task 4: `### local-pre-commit` `carry` and `verbatim` name `bkit-debug-failure-reproduce`. The bullet is in its prompt and in all four host mirrors plus `.agents/plugins`. Both carrier tests detect a test run by its run step (`Run only those tests`, `test runner`, `file or name filter`). `bkit-debug-failure-soak` runs only its named `pnpm bkit:gate:static-unit` (`.bkit/core/prompts/bkit-debug-failure-soak.md`:80), so the DONE WHEN's condition for adding it is not met. No other build or debug prompt has a test-run step.
- Task 5: the new `Local tests first` wording is the same in the store, `.bkit/core/.agents/rules.md`, `.agents/rules.md`, the four carrier prompts and their mirrors. No tracked file outside `.bkit/instructions.md` (retired) and the test still holds "Exhaust the local test suite". The `retired` block is malformed (gap below).
- Tests run (`CI=1 pnpm bkit:test:file`): `instructions.test.ts` + `ship-invariants.test.ts`, 177 passed. This includes `has no findings` and `sync has nothing left to rewrite`. `render/trackers.test.ts` had 1 failure out of 107. `bkit check` exits 0 and reports no mirror drift.
- Task 6: accepted by `build-decision-1-1.md` Q2 (`Decision: Accept`, the owner's own answer). The test-first audit's `not-green` gap and its `Unproven` entry for `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` are covered by that record and are not gaps. The task is already ticked and is not in this group's briefs.
- Task 5 was rewritten by `build-decision-1-1.md` Q1 (`Decision: Fix now`). It was judged against its DONE WHEN as the plan now states it.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`. Tasks 3, 4 and 5 were red and then green. It has no `Updated tests` or `Already landed` section.
- `docs/observability.md`: not applicable, because the change is prompt and rule text only. The plan has no `Documentation Updates` rows.

## Identified Gaps Log

2 gaps.

TASK 3: `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`:272 reads "**If** any check is cancelled, action required or stale (none concluded failure) → **Failure Path**." but `.bkit/core/workflows/bkit-ship.md`:352 and every rendered mirror read "... or stale → **Failure Path**.", so the baseline does not carry the same text and `.bkit/core/engine/render/trackers.test.ts` `none render baselines > bkit-ship: the none render matches its baseline byte for byte` fails (CI=1) — Fixable: true
TASK 5: `.bkit/instructions.md`:1674-1675 the `### local-tests-first` `retired` block lists the current `text` wording ("Run only the tests the change affects ... pre-push hook.") at 1674 and repeats the old "Exhaust the local test suite" line at 1675; `retired` holds earlier wordings that are never valid (`.bkit/instructions.md` § Format), so delete lines 1674 and 1675 and keep one copy of the old wording — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 3: none-render baseline holds text the ship workflow source lacks
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt:272` · **Round:** 1
  - **DONE WHEN:** the rendered mirrors and __snapshots__/bkit-ship.none.txt carry the same text as the exit-80 arm in .bkit/core/workflows/bkit-ship.md:352
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts none render baselines > bkit-ship: the none render matches its baseline byte for byte
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 5: local-tests-first retired block lists the current wording and a duplicate old line
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/instructions.md:1674` · **Round:** 1
  - **DONE WHEN:** the old wording sits under retired (once), and the current text is not listed under retired
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
