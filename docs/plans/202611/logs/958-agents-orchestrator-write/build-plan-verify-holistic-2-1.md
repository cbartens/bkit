Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44
Loosened: none
Fingerprint: 3a2a68660a44b71554558a623effd8e0f21cadf8a759c81717ba95a3a7622c85
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

12 of 12 (the plan has 12 groups, Tasks 1 to 44).

## Integration Gaps

1.

- Groups 3, 5 and 7 against groups 8 to 10: the `decisions check` refusals that Tasks 17, 19 and 25 added still word their reason around the `-engine.md` file (`decisions.ts:160` "the engine writes it in the -engine.md file", `:166` "the engine file holds no loop question", `:173` "the engine file's loop question was built for a different question count", `:181` "Q1 is the loop question the engine file holds"). Groups 8 and 9 replaced that file with the `decision-counts` row (Tasks 28, 34), and group 10 removed every workflow mention of it (Tasks 36, 37). `bkit-build.md:215` hands this `problem` back to the orchestrator, which is then told about a file that never exists. The action each refusal asks for (delete the line, write a question, re-run `decisions counts`, number from `Q2`) is still right, and no test asserts the stale words, so only the wording needs to change. The comment at `.bkit/core/engine/commands/workflow/tasks.ts:160` ("merged with the engine file's") is the same stale wording in a code comment.

Checked and working together:

- Engine verbs and workflow calls: `bkit-build.md` Decision Pause calls `decisions counts --decision=`, `decisions check --file=`, `decisions apply --by=headless|owner|rerun` with `--answer=Q{n}={letter}` and `--fix-task=Q{n}={N}`, and `decisions skip`; `bkit-ship.md` calls `apply --by=owner --q --confirm|--reject --reason-file` and `decisions pending [--defer]`. Every flag exists in the built CLI; `workflow-shape.test.ts` "calls only verbs and flags the CLI has" runs over them.
- Rows: `decisions counts` and `decisions apply` / `pending --defer` append the two row types that `status row` refuses (Task 27), and `decisionRows` / `foldDecision` in `open-decision.ts` read them by file name from the `status.jsonl` beside the file, last row winning. `openDecision`, `pauseStatus`, `gateRerun`, `skipProblem`, `tasks tick --decision`, `acceptedLocations`, `workflows summary` (build rows only) and `decisions answers` all read through that one fold, so they cannot disagree.
- Old layout: a file whose header has `Status:` and that no row names is read as written. This run's own `build-decision-2-1.md` to `2-3.md` are in that layout, and Task 19's refusal keeps `Status:` out of every new file, so the two layouts cannot be confused.
- Resume: `status resume` prints `questions`, and `bkit-build.md:66` routes `questions` = 0 to Decision Pause step 2.
- Fixers: `bkit-build-plan-verify.md:110`, `bkit-build-plan-gaps-remediate.md:100` and `bkit-debug-failure-diagnose.md:85` run `bkit decisions answers --file=`, which prints `by`, so an assumed answer is never read as the owner's.
- Reports: the six count-checked prompts declare their count rule, `promptHeader` reads it, and `steps finish` checks it. The audit prompt, `ledgers findings --report` and `issues comment --report` share `audit-report.ts`, which imports nothing from `./`.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`, `-1-2.md` and `-1-3.md` (run 1): `PASS` over groups 1-4, 1-6 and 1-7 (Tasks 1 to 26).
- Run 2 group verifies: group 8 `8-1` `CONCERNS` (3 gaps), then `8-2`, `8-3` and `8-4` `PASS` (Tasks 27-31); group 9 `9-1` `CONCERNS` (3 Task 32 gaps, settled by `build-decision-2-2.md`); group 10 `10-1` and `10-2` `CONCERNS`, then `10-3` `PASS`; group 11 `11-1` `PASS`; group 12 `12-1` `PASS`.
- This is the first holistic attempt of run 2.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows 20 of 265 files, 500 lines each. The cross-group check therefore read the codebase itself, plus `git log` and `git diff` for the files it names.
- Tasks 1 to 13 and 15 to 44 are satisfied. Task 14 is not (gap 1).
- Task 29 is satisfied but is still `[ ]` in the plan, although `build-plan-verify-8-2.md`, `-8-3.md` and `-8-4.md` all named it on their `Tasks` line. Its code is in `open-decision.ts` (`decisionRows`, `foldDecision`, `statusOf`; old file = a `Status:` header and no row) and in `dist/commands/workflow/open-decision.js`. `engineSibling`, `isEngineFile`, `mergeItems`, `mergeHeader` and `TAKEN_UNASKED` are gone from `.bkit/core/engine` and `dist`. All ten of its tests exist once and pass, and so does the Task 9 old-layout test.
- Tests run: 26 files, 1911 passed, 0 failed. They are every test file a task names: `steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `decisions`, `open-decision`, `status` (both), `workflows`, `summary`, `summary-findings`, `tasks`, `context`, `context-fetch`, `verdict-vocabulary`, `workflow-shape`, `question-option-format`, `template-shape`, `branding`, `trackers`, `cli-doc`, `instructions`, `instructions-coverage`, `instructions-sources` and `conventions`. Every group 8 to 12 test name exists exactly once.
- DONE WHEN checks: each grep in Tasks 3, 5, 6, 7, 8, 15, 16, 30, 36 and 37 prints what its task asks for. The only Task 8 hit is the `refuses --result-file` test. The Task 36 `--reason=` hits are `prs transport-row --reason=<why>` and `runs revalidate --reason="{REVALIDATE_REASON}"`, which carry engine values, not the owner's words. `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57987`, and `scripts/gate/bkit-text-ceiling.json` holds those two totals (both below 86494 and 58535; no `raise`). `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0. `bkit check` (from source) exits 0 and leaves the tree unchanged. On the built CLI, `node dist/cli.js help`, `ledgers findings --help`, `decisions answers --help` and `decisions counts --help` exit 0. Every `commands/workflow/*.js` file in `dist` was committed at or after its source; the one later `ledgers/status.ts` change adds types only.
- Not run here, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync` and Task 16's `pnpm bkit:gate:static-unit-integration`. `cli-doc.test.ts` passing shows `cli.md` matches the registry.
- Decision records:
  - `build-decision-2-2.md` Q1 accepts Task 32's red confirmation test and moves it to Task 44, which now passes. Q2 accepts `applyRecommendations` returning text. Q3 accepts the `Re-run gate` answer of `apply --by=rerun`. All three are `Accept (assumed)`: assumed, not the owner's acceptance. The record says the orchestrator finishes Q2 and Q3 on the branch before landing, and both are still open in `decisions.ts:275` and `:699`.
  - `build-decision-1-2.md` (Task 18 `Fix now`, direction (a)) is assumed, not the owner's own words. Task 29's last-row-wins rule keeps that direction, because the owner's row is appended after the headless one.
  - `build-decision-1-1.md`, `-2-1.md` and `-2-3.md` take loop answers and accept no gap.
- No test-first audit report was supplied for this round. `build-tests-green-final.md` in the log folder is run 1's audit (Tasks 1 to 26), so it is not judged here.
- Derived Test Matrix: every row names a test in its task's `TEST FIRST`, and each of those tests exists and passes.
- Documentation Updates: every row is done. `docs/testing.md` has the rows (lines 944, 957, 958 and 991), `.bkit/core/.bkit/workflows.md:303-304` lists the two row types, `cli.md:176-177` lists `counts` and `apply`, and `docs/deferrals.jsonl:521-522` holds the two `Exempt` rows. `docs/testing.md` and `docs/observability.md` are present. The new refusals use the existing `problem` / `CommandError` output, so `docs/observability.md` needs nothing.
- Gap 1 was already in the tree at run 1's holistic attempt 3 (`d0f4af14c`). `build-plan-verify-10-3.md` raised it as out of scope. No decision record accepts it.

## Identified Gaps Log

2 gaps.

TASK 14: `.bkit/core/workflows/bkit-ship.md:95` (Failure Path step 1, carried from clause `workflow-error-file` at `.bkit/instructions.md:5720`) tells the ship orchestrator to write `{LOG_DIR}/{workflow}-error.md` and to drop `--error-file` while `LOG_DIR` is not held, but ship never holds `LOG_DIR`, and the command at `bkit-ship.md:97` reads `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`; the UPDATE field asks the clause to name that ship path, and the live clause text no longer does (only its `retired` blocks do) — Fixable: true
INTEGRATION: groups 3, 5 and 7 (Tasks 17, 19, 25) vs groups 8 to 10 (Tasks 28, 34, 36): the `decisions check` refusal texts in `itemProblem` (`.bkit/core/engine/commands/workflow/decisions.ts:160`, `:166`, `:173`, `:181`) still tell the orchestrator about "the -engine.md file" and "the engine file's loop question", which the engine no longer writes (the counts are a `decision-counts` row), so the problem the Decision Pause step 2 re-ask passes back names a file that does not exist — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Ship Failure Path step 1 names {LOG_DIR}, which ship never holds
  **Severity:** MEDIUM · **Class:** incomplete · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:95` · **Round:** 1
  - **DONE WHEN:** TASK 14 UPDATE: clause workflow-error-file names the ship path {WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md (and ship-stderr.md), so bkit-ship.md Failure Path step 1 matches the --error-file / --stderr-file paths its command at line 97 reads
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** decisions check refusal texts still name the -engine.md file the engine no longer writes
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:160` · **Round:** 1
  - **DONE WHEN:** INTEGRATION: no itemProblem refusal text in decisions.ts (lines 160, 166, 173, 181) names an -engine.md or engine file; each names the decision-counts row instead and keeps its action
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
