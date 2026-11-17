Verdict: PASS
Failures: 0
Fixable: false
Tasks: 15, 16, 17
Loosened: none

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

- Mode `Group`, judged against `build-diff-5-1.md` (commits `bd0b5e3ba`, `184e4505c`). The diff matches the source and `dist/` changes in those commits. No brief has a `Deviations` section. No decision record covers group 5 (the five `build-decision-1-*.md` records cover groups 1, 2 and the challenge round for Task 14).
- TASK 15: `detectProjectDocs` (`.bkit/core/engine/checks/after/tools.ts:522`) calls the pure `stripManagedWrapper` on each readable target. It emits `project-docs-cleanup` (advisory, filtered by `isAdvisorySuppressed`) naming the path, the `WrapperProblem` and the by-hand fix. The function is wired into the check / doctor phase at `.bkit/core/engine/checks/after/index.ts:477`. Its test passes after a red at the group's red run.
- TASK 16: the template example now sits inside the bracketed instruction (`.bkit/core/docs/templates/bkit-plan.md:196`). The summary parses only a fenced `jsonl` block under `## Documentation Warnings` (`summary.ts:215-218`), so `None`, `PENDING` and the unfilled bracket yield no record. Its test passes after a red at the group's red run.
- TASK 17: `inspectRepoFile` (`.bkit/core/engine/install/project-docs.ts:278-294`) already caught every `lstatSync` / `realpathSync` error and returned `{ unsafe }`. `isInTreePath` now rejects control characters. A probe against `dist/` confirmed that a `README.md/security.md` row gives `project-docs-ambiguous` (`ENOTDIR`) and a NUL-byte row gives `project-docs-ambiguous`, both without throwing. A 300-character path segment gives `project-docs-missing`, also without throwing.
- Test-first audit: `Enforced: true`, no gaps, no `Unproven` and no `Updated tests` sections. Its `Already landed` section lists two tests. Both are Task 17 tests ("reports an index row through a regular file as ambiguous instead of throwing" and "reports a NUL-byte index path as ambiguous instead of throwing"). For both, the tests step's reason was that the current `detectProjectDocs` already returned `project-docs-ambiguous` without throwing on the fixture, so no red was due.
- Tests run: `tools.test.ts` and `summary.test.ts` passed 90 of 90. `template-shape.test.ts` and `shipped-docs-refs.test.ts` passed 288 of 288. `workflows.integration.test.ts` plus `.bkit/core/engine/install/` and `.bkit/core/engine/checks/` passed 1704 of 1704 in 51 files.
- Advisory, not gaps: (1) The rendered copy `docs/templates/bkit-plan.md` still holds the old fenced example. The `Install to mirror` rule refreshes it once at the end of the session. (2) `stripManagedWrapper` reports `inside-fence` for a populated doc that quotes a marker line inside a fenced example. In that case the new cleanup action ("delete the marker lines") does not apply. The finding can be suppressed, and its detect text names the problem.

## Identified Gaps Log

None

