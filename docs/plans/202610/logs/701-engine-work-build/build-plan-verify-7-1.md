Verdict: FAIL
Failures: 1
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 7` (one group — TASK 12, TASK 13, TASK 14), attempt 1, judged against `build-diff-7-1.md` (the changes since the group started), the execute log's per-task lines (`build-plan-execute-7-log.md`), the test-first audit `build-tests-green-7-1.md`, the plan-currency report `build-plan-current.md` and the plan file itself.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — no earlier `build-plan-verify-7-*` artifact exists and no `build-plan-gaps-remediate-7-*-log.md` was written; this is the group's first verification attempt.

## Notes

- TASK 12 — satisfied. `.bkit/core/engine/commands/workflow/ledgers.ts:1727` now reads `"bounded-remediation": row["reason"] !== "own-cycle" && existsIn(root, paths)`, so a genuine `own-cycle` row fails one of the four `DEFERRAL_TESTS`, buckets `Exempt`, and `write` never receives an `unjustified` row. The planned test `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage keeps an own-cycle deferral exempt" exists and passes; the whole file is green (80 passed). Audit row: red recorded 2026-10-27T22:34:05Z, `Changed since red` = `no`, green `passed`. Ticked.
- TASK 13 — satisfied. `.bkit/core/engine/commands/workflow/branches.ts:1092-1103` hardens `ASSERTION` to a call shape (`(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]`), adds `BARE_ASSERT` for Python's `assert x` statement and `COMMENT` to skip commented lines, and `disabledTestsIn` (1164-1200) now collects removals into `removed` and drops one only when an added line of the same diff re-adds its trimmed text. The planned tests "scan-diff ignores a removed comment in a test file" and "scan-diff ignores an assertion moved within the file", plus the control "scan-diff still reports a removed assertion", all pass, and the whole file is green (183 passed). Audit rows: both reds recorded (22:37:12Z, 22:37:54Z), `Changed since red` = `yes`, green `passed`; read in full, the two diffs are prettier re-wrapping of `.join("\n")` inside the neighbouring control test plus three new `it()` blocks belonging to TASK 14 — neither planned test's assertion is weakened, removed or rewritten, so no `test-changed` gap. Ticked.
- TASK 14 — DONE WHEN present in the tree, but the task is not done. `.bkit/core/engine/commands/workflow/branches.ts:1083-1090` adds `TEST_FILE_MARKERS` (`@pytest.mark.skip`, `@unittest.skip`, `.skip(`), `ALL_MARKERS` and `markersFor(file)` so those markers apply only where `TEST_FILE` matches, and `testAt` (1126-1133) walks down from a decorator line to name the test beneath it; the three tests ("scan-diff finds an added pytest mark skip", "added unittest skip", "added bare skip call") exist and pass. What is absent is the red: `build-task-red-7-14-1.md` holds 183 passing tests (refused as `passed`), `build-tests-green-7-1.md` reports `no-red` for "scan-diff finds an added pytest mark skip", the execute log's line is `BLOCKED — TASK 14` and not `DONE — TASK 14: already landed`, and `build-plan-current.md` is `PASS` / `Affected: 0` — so the `no-red` exemption (currency `Broken` plus an `already landed` DONE line) does not apply. This is a test-order gap: the fix landed inside TASK 13's edit of the same marker table and was never seen failing. Box left `[ ]`; gap logged, `Fixable: false`.
- Test-first audit `build-tests-green-7-1.md`: `Enforced: true`, `Gaps: 3`, `Test order only: true`. The two TASK 13 `test-changed` rows resolved to no gap by reading their diffs as above; the one TASK 14 `no-red` row stands as the single gap. No decision record accepts a gap: the only `build-decision-*.md` is `build-decision-1-1.md`, group 6's verify-loop decision, which names TASK 10's `.bkit/pipeline.md` sentences and no group-7 item.
- Plan caps and coverage: `bkit tests plan-check` prints `0 problem(s), 0 existence finding(s)`; group 7 holds 3 tasks and 4 `TEST FIRST` tests (caps 3 / 15), and the `Derived Test Matrix` rows for TASK 12, 13 and 14 each map to the task that lands their test.
- Docs for the group's behaviour: `docs/testing.md:619` (the `branches.test.ts` row) names `scan-diff --disabled-tests` with "a test file's `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(`", which is the `Documentation Updates` row's requirement for this file; `dist/commands/workflow/branches.js` and `dist/commands/workflow/ledgers.js` carry byte-equivalent changes to their sources.
- The group diff also appends three LOW challenge deferrals and one `docs/knowledge.jsonl` row (`scan-diff-removal-case-diffs-a-commit-not-the-branch`), written by the executor; no task field requires or forbids them, and none is a gap.
- Suite evidence: the two files the group edits are green in full (`ledgers.test.ts` 80 passed, `branches.test.ts` 183 passed), and `pnpm vitest run` (full, unscoped) passes — 201 files, 7944 passed, 1 skipped — so neither task left a broken test behind.
- Ticks: TASK 12 and TASK 13 only. TASK 14 stays open on its test-order gap.

## Identified Gaps Log

1 gap.

- TASK 14: `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff finds an added pytest mark skip" — no-red — Fixable: false
