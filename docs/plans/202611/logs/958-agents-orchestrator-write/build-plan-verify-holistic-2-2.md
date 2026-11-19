Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44
Loosened: none
Fingerprint: 02add2aa17540ca80566f84137a2f45cf501dec98c92c2cbe6c130f4322bb8f2
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

12 of 12 (the plan has 12 groups, Tasks 1 to 44).

## Integration Gaps

1.

- Groups 3 and 8 (Tasks 9, 29, 30): the `decisionProblem` doc comment at `.bkit/core/engine/commands/workflow/tasks.ts:160` (built copy `dist/commands/workflow/tasks.js:126`) still says the header block is "merged with the engine file's (`decisionFileHeader`)". Task 29 removed the engine file, and `decisionFileHeader` reads the `decision-counts` row. The previous holistic report named this comment beside the `itemProblem` texts; the fix round's log says it fixed `tasks.ts`, but commit `c1772eefd` does not touch that file. Comment only, no behaviour.

Checked and working together:

- The previous integration gap is closed: the four `itemProblem` refusals (`decisions.ts:160`, `:166`, `:173`, `:181`) now name the `decision-counts` row, keep their actions, and the same text is in `dist/commands/workflow/decisions.js:130-146`. `bkit-build.md:215` passes that `problem` back to the orchestrator.
- No `engine file` or `-engine.md` wording remains in `.bkit/core/**/*.md` or in `.bkit/instructions.md` outside `retired` blocks (Task 37), and none in engine code except the `tasks.ts` comment above.
- The engine verbs, rows, single fold, old-layout reading, resume route and fixer calls described in `build-plan-verify-holistic-2-1.md` are unchanged by the fix round, which edited only clause text, carriers, render baselines, mirrors, the ceiling file and `decisions.ts` strings; the 26 test files below pass on the current tree.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`, `-1-2.md` and `-1-3.md` (run 1): `PASS` over groups 1-4, 1-6 and 1-7.
- `build-plan-verify-holistic-2-1.md` (run 2, attempt 1): `CONCERNS`, 2 gaps: Task 14 (the clause did not name ship's error path) and the `decisions check` refusal texts naming the `-engine.md` file. `build-plan-gaps-remediate-holistic-2-1-log.md` reports both fixed in `c1772eefd`.
- This is attempt 2 of run 2's holistic verify.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows the 20 largest of 265 files, 500 lines each. The cross-group check read the codebase, `git show c1772eefd` and `git show 2fa879a63:<file>` for the files it names.
- Previous gap 1 (Task 14 ship path): closed in substance. Clause `workflow-error-file` (`.bkit/instructions.md:5720`) and all five carriers now name `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`, which matches the `--error-file` path at `bkit-ship.md:97`. The same edit, though, dropped the text after the old clause on every carrier line (new gap 1), so Task 14 stays off the `Tasks` line. No test catches it: `workflow-shape.test.ts` and the instruction tests pass.
- Previous gap 2: closed for `decisions.ts`; the `tasks.ts` comment remains (new gap 2).
- Tasks 1 to 13 and 15 to 44 are satisfied. Every task is `[x]` in the plan, Task 14 included; the workflow, not this verifier, settles the tick.
- Tests run: 26 files, 1911 passed, 0 failed (`pnpm exec vitest run -c vitest.unit.config.ts` naming each file): `steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `decisions`, `open-decision`, `status` (both), `workflows`, `tasks`, `context`, `context-fetch`, `summary`, `summary-findings`, `verdict-vocabulary`, `workflow-shape`, `question-option-format`, `template-shape`, `branding`, `trackers`, `cli-doc`, `instructions`, `instructions-coverage`, `instructions-sources`, `conventions`.
- DONE WHEN greps re-run on the current tree: Tasks 3, 5, 6, 7, 8 (only the `refuses --result-file` test hits), 15, 16 (both forms), 30, 36 (the `--reason=` hits are `prs transport-row` and `runs revalidate`, engine values) and 37 print what their tasks ask for. `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57977`; `scripts/gate/bkit-text-ceiling.json` holds those totals (the fix round lowered workflows from 57987; no `raise`). `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0. `bkit check` from source exits 0 and leaves the tree unchanged. `node dist/cli.js help` and `ledgers findings --help` exit 0. `dist/commands/workflow/decisions.js` was rebuilt in the same commit as its source.
- Not run, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync`, Task 16's `pnpm bkit:gate:static-unit-integration`. The fix round's log records `bkit tests changed` exit 0.
- Decision records:
  - `build-decision-2-2.md` Q1 accepts Task 32's red confirmation test, moved to Task 44, which passes. Q2 (`applyRecommendations` returns text, `decisions.ts:275`) and Q3 (`apply --by=rerun` records `Re-run gate`, `decisions.ts:699`) are accepted. All three are `Accept (assumed)`: assumed, not the owner's acceptance. The record says the orchestrator finishes Q2 and Q3 on the branch before landing; both are still open.
  - `build-decision-1-2.md` (Task 18 `Fix now`, direction (a)) is assumed, not the owner's own words; Task 29's last-row-wins rule keeps that direction.
  - `build-decision-1-1.md`, `-2-1.md` and `-2-3.md` take loop answers and accept no gap.
  - All five records are in the old layout (`Status:` header, no row), which the reader still reads as written.
- No test-first audit report was supplied for this round, so step 8 has nothing to decide.
- Derived Test Matrix: every row names a test in its task's `TEST FIRST` or `DONE WHEN`, and each passes.
- Documentation Updates: every row is done, as `build-plan-verify-holistic-2-1.md` recorded; the fix round changed none of those docs. `docs/testing.md` and `docs/observability.md` are present; the new refusals use the existing `problem` / `CommandError` output, so `docs/observability.md` needs nothing.
- `.agents/docs.md` lists `docs/capabilities.md`, `docs/architecture.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/observability.md` for Build; none is missing or a starter.

## Identified Gaps Log

2 gaps.

TASK 14: the holistic fix round's new `workflow-error-file` clause text (`.bkit/instructions.md:5720`), carried into the five workflows by `c1772eefd`, swallowed the text that followed the old clause on each carrier line: `.bkit/core/workflows/bkit-ship.md:95` lost ", `--pr` when `{PR_NUMBER}` is empty;" (at base `2fa879a63` and before `c1772eefd` it read "drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when ..."), so ship's Failure Path no longer tells the orchestrator to drop `--pr` while `PR_NUMBER` is empty, although the command at `bkit-ship.md:97` passes `--pr={PR_NUMBER}` and `workflows fail` refuses a non-integer `--pr` (`positiveInt`, `status.ts:169`); `bkit-plan.md:91`, `bkit-design.md:91`, `bkit-build.md:124` and `bkit-debug.md:108` lost the `;` after "is empty", so two instructions run together ("is empty `--max-exceeded` only when", "is empty `{LABEL_FLAGS}` ="); the rendered copies and the five render baselines carry the same text; restore the separators and ship's `--pr` rule without raising a ceiling — Fixable: true
INTEGRATION: groups 3 and 8 (Tasks 9, 29, 30): the `decisionProblem` doc comment at `.bkit/core/engine/commands/workflow/tasks.ts:160` (and `dist/commands/workflow/tasks.js:126`) still says the header is "merged with the engine file's (`decisionFileHeader`)"; Task 29 removed the engine file and `decisionFileHeader` now reads the `decision-counts` row; the holistic fix round's log (`build-plan-gaps-remediate-holistic-2-1-log.md`) names `tasks.ts` as fixed, but `c1772eefd` does not touch it — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Clause workflow-error-file sync dropped the text after the clause: ship lost its --pr rule, four workflows lost the ; separator
  **Severity:** MEDIUM · **Class:** incomplete · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:95` · **Round:** 1
  - **DONE WHEN:** TASK 14 UPDATE: bkit-ship.md Failure Path step 1 again says to drop `--pr` when `{PR_NUMBER}` is empty, and the plan, design, build, debug and ship carrier lines keep the `;` after the workflow-error-file clause text, in sources, rendered copies and render baselines, with no ceiling raised
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** decisionProblem comment still names the engine file
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:160` · **Round:** 1
  - **DONE WHEN:** INTEGRATION: the decisionProblem comment in tasks.ts (and dist/commands/workflow/tasks.js) names the decision-counts row that decisionFileHeader reads, not the engine file
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
