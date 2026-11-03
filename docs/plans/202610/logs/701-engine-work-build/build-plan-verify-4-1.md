Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4` (one group: GROUP 4 — The plan's matrix, the ship diff and the producers they touch become engine checks; TASK 5 and TASK 6).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None
(first `build-plan-verify-4-*` artifact; groups 1-3 each hold a single prior attempt.)

## Notes

**TASK 5 — `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — satisfied; ticked `[x]`.** Judged against `build-diff-4-1.md` (the group's changes since `010cb7be3`, group 3's gate commit), not the whole branch.

- `.bkit/core/engine/commands/workflow/tests.ts` widens `PlanProblem.kind` with `matrix` and `supersession`, and `checkPlanText` adds both arms: a matrix table with no `Task` column is refused at the header line (`matrix.line`), a row whose `Task` cell names no task / two or more tasks / an undefined task is refused at the row's own line (`row.number`), a test-bearing task no row maps to is refused at the task block's line (`t.line`), and a `DELETE` whose normalised file has no `Supersession Inventory` row is refused at the `DELETE` entry's line. A plan with no matrix section yields no `matrix` problem (`derivedTestMatrix` returns `null`). `summary`, `output.problems` and the verb help text name the new kinds.
- `.bkit/core/engine/commands/workflow/plan-blocks.ts` adds `derivedTestMatrix` (header line, `taskColumn` or `null`, rows with `line` / `number` / `cells` / `tasks`) and `supersessionInventory` (`files` from the `Existing artifact` column) over the shared `tableCells` / `firstTable` helper factored out of `reuseInventory`.
- `.bkit/core/engine/commands/workflow/challenge.ts` appends one matrix row per appended finding task (`matrixRows`: test name, tier from the file's name, file, task number), splicing them at the table's last row and shifting the appended-block offset by `rows.length` when the matrix sits above the last group, so `challenge merge` neither strands its own tasks nor moves `written.from`.
- Producers moved with it: `.bkit/core/workflows/bkit-build.md` Step 5 `Fix now` now writes one `Derived Test Matrix` row per test, and Steps 3 and 7 route a `matrix` / `supersession` problem to `@bkit-build-plan-convert` beside `markers`; `.bkit/core/docs/templates/bkit-plan.md` and its mirror `docs/templates/bkit-plan.md` carry the `Task` column and its one-sentence rule; `.bkit/core/prompts/bkit-plan-scope-check.md` drops Process 9 (matrix ↔ runbook mapping) and Process 11 (supersession) and rewords Process 17's verdict mapping and the CRITICAL description, with the shared `Scenario detail` clause reworded in `.bkit/instructions.md` and its four carriers (`bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`) moved in the same change.
- DONE WHEN clauses hold, checked by running them: `node dist/cli.js tests plan-check --plan docs/plans/202610/701-engine-work-build-plan.md` exits 0 with `problems: []` (the plan carries the column and maps tasks 5 and 6), and a plan with no matrix section exits 0 with `problems: []`. Each refusal names its line, asserted exactly in the tests: `| case a` for an unmapped row, the `| Test description` header for a missing column (exactly one `matrix` problem), `src/old.ts`'s `DELETE` line for a missing supersession row, `| case b` for `TASK 9`, `| case c` naming both `TASK 1` and `TASK 2`, and `<!-- bkit:task 2 start -->` for the task no row maps to.
- Tests: all ten `TEST FIRST` tests exist under the plan's exact names in `.bkit/core/engine/commands/workflow/{tests,challenge,plan-blocks}.test.ts` and pass; 10 tests over 3 files, inside the per-task cap. `grep` of `bkit-plan-scope-check.md` finds no matrix-to-runbook mapping step and no supersession check; it keeps only the Contract's definition of the two inventory sections.

**TASK 6 — `branches scan-diff --disabled-tests` — satisfied; ticked `[x]`.**

- `.bkit/core/engine/commands/workflow/branches.ts` adds the fourth exclusive mode to `scanDiffVerb` (`--disabled-tests`), its own guard refusing it beside `--expect-none` (exit 2), `disabledTestsIn` over `git diff --no-renames {base}...HEAD -- . :(exclude)docs/plans`, and the `disabled: [{file, line, test}]` output on `ctx.emit`. The new-file line comes from the hunk header; the test name is the nearest declaration above the hit in the working tree's copy of the file, else the line's own text. The marker set covers `describe|it|test|suite|context|bench` `.skip|.todo|.fixme`, x-prefixed calls, `xfail`, `t.Skip(`, `#[ignore`, `@Disabled`, plus a removed assertion line inside a test file. The `--help` states the inversion and that the flag is never passed with `--expect-none`.
- Dogfooded with `node dist/cli.js` on a scratch repo: a branch adding `it.skip('b', …)` → exit 1, `disabled: [a.test.ts | 4 | b]`, log line `a.test.ts:4 — b` (file, line and the test in it); a commit whose skip predates `--base=HEAD~1` → exit 0 with `disabled: []`; a diff adding no disabled test → exit 0 with `disabled: []`; `--disabled-tests --expect-none` → exit 2, `--disabled-tests inverts the exit already; drop --expect-none`. `dist/commands/workflow/branches.js` carries the same code.
- `.bkit/core/prompts/bkit-ship-deferred-sweep.md` Process 8 now reads the verb (`bkit branches scan-diff --disabled-tests --base=` the base its Context names) and records its `disabled` entries; the prompt names no diff scan of its own. `.bkit/core/workflows/bkit-ship.md` Step 5 passes `origin/dev` in the sweep's Context. The render snapshot `bkit-ship.none.txt` and `.bkit/workflows.md` (source and mirror) move with it.
- All four `TEST FIRST` tests pass, one test file, inside the caps.

**Test-first audit (`build-tests-green-4-1.md`) — no gap, after reading all 13 diffs.** `Enforced: true`; every gap is `test-changed` with `Changed since red` = `yes`, so the added-lines-only rule does not apply. I read each diff against its snapshot and the current file:

- `tests.test.ts` (8 rows): one file-level diff with four parts — (a) the shared `asPlan` fixture now emits a `Supersession Inventory` row per `DELETE` in the blocks it wraps, which the new check requires and which the dedicated refusal test does not rely on; (b) `lineOf("plan.md", "**TASK 2:**")` → `lineOf("plan.md", "<!-- bkit:task 2 start -->")` for the unmapped-task problem, corrected to the block's canonical `t.line`, the same line the pre-existing `plan-check refuses a task without DONE WHEN` test asserts; the row still asserts one exact line and one message naming `TASK 2`; (c) two acceptance tests gain a rejection half (the same plan minus a row exits 1), which is stronger; (d) a `taskBlock([...])` array reflowed by the formatter. No assertion removed, none loosened.
- `challenge.test.ts` (1 row): the expected merged matrix goes from `[[3], [4]]` to `[[1], [2], [3], [4]]`. The fixture already writes rows for tasks 1 and 2, so this is the only expectation a correct append can satisfy; replacing the table would leave tasks 1-2 unmapped and trip the second, unchanged assertion (`checkPlanText(merged).problems` empty). The test still fails when the merge writes a task with no row.
- `branches.test.ts` (4 rows): fixtures only — the skip marker is composed from two pieces (`${"it"}.${"skip"}`, the slop gate needs the literal out of the file, recorded as the group's `docs/knowledge.jsonl` row) and the file content is written before the empty `commit`, bodies unchanged. Every assertion is untouched, and the passing `disabled: [{file: "src/a.test.ts", line: 4, test: "drops b"}]` proves the composed marker still plants a real marker the scanner finds.

Under the `test-changed` judgement (formatting or a preserving/correcting fixture → no gap; weakened or removed assertion → gap) none of the 13 is a gap. There is no `Late-red check` section in the report.

**Suite and gates.** `pnpm vitest run` over the four touched test files: 351/351 pass. Full suite `pnpm vitest run`: 201 files, 7929 passed, 1 skipped, exit 0 — no test this group broke is left failing. `build-plan-current.md` reports `Affected: 0`, so no task was re-judged on landed changes. No `build-plan-gaps-remediate-4-*-log.md` and no `build-decision-*.md` exist for this group, so no gap was previously accepted. `docs/testing.md`, `.bkit/pipeline.md` and `docs/capabilities.md` rows of `Documentation Updates` belong to TASK 10 and nothing in these two tasks' DONE WHEN claims them; the index sources and mirrors this group's edits needed (`.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`) moved in the same commit.

## Identified Gaps Log

None
