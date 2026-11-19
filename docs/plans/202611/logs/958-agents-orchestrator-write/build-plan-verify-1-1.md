Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: 7f02b137bb413f30fa651a9919f5f7f272d8e0da33352cfed3b59833024140d8
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 1 (Tasks 1-4) judged against `build-diff-1-1.md`. All four tasks are satisfied.

- Tests: the 17 `TEST FIRST` tests of Tasks 1-4 pass, with `pairs agents with artifacts by position`, `a true | false header field is true when any agent sets it true` and `engine calls > %s calls only verbs and flags the CLI has` (one run over `steps.test.ts`, `challenge.test.ts`, `verdict-vocabulary.test.ts`, `workflow-shape.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `trackers.test.ts`: 8 files, 867 tests passed).
- Checks: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 with no output; `pnpm bkit:text:ceiling check` exits 0 (prompts 84053, workflows 58012, both below 86494 / 58535); `grep -l 'structured result file' .bkit/core/prompts/*.md` prints nothing; no source workflow names the Result-path delete line.
- Clauses: `set-failures`, `challenge-incomplete` and `workflow-finish` carry the planned text with the old text in `retired`; `structured-result-file`, `structured-result-render`, `structured-supply-only` and `result-path-cleared` are gone, as are the Local Instructions entries the tasks named.
- `dist/`: `dist/commands/workflow/steps.js` and `challenge.js` carry `headerDeclaration`, `bodyProblem` and `reportSection`, committed in `cad6af521`; the verifier does not build, so it did not rebuild to compare.
- Test-first audit `delete-still-referenced` gaps (Tasks 3 and 4, `.bkit/instructions.md`): the DELETE names clauses inside the file, not the file itself, so the hit is a different thing with the same name. No gap.
- Already landed (no gap): Task 2 `bkit steps finish > reads None under ## CRITICAL as zero items` and `bkit steps finish > counts only the Fixable gap lines under a verify gap-count line`; the tests step's reason: the old `finish` counts no section, so both reports were already accepted, and the tests guard the new count check.
- Fixture deviation: the tests step changed `c1.md` in `pairs agents with artifacts by position` from `CONCERNS` to `FAIL` with a `CRITICAL` block, because the plan's `CONCERNS` + `CRITICAL` fixture contradicts Task 2's own rule. The test still checks worst-verdict merging and the failure sum. No gap.
- Derived Test Matrix: every row for Tasks 1-4 has its test in its task's `DONE WHEN`. The Documentation Updates rows for Tasks 1, 3 and 4 (`.bkit/instructions.md`) are done; the other rows belong to later groups.
- Observability: the new refusal logs with `ctx.log` before `ctx.emit`, the same as the header refusal beside it.

## Identified Gaps Log

None
