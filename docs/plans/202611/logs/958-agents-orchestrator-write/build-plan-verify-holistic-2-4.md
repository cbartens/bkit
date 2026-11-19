Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46
Loosened: none
Fingerprint: 7a615a369141ce818e14869a8b153bf3f14f97588838b04eb3c8fb04a4a7c809
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

13 of 13 (the plan has 13 groups, Tasks 1 to 46).

## Integration Gaps

1.

- Groups 4 and 13: Task 45 reworded ship's Failure Path step 1 (`.bkit/core/workflows/bkit-ship.md:95`) from "only the last 20 lines of the failed shell command's stderr" to "the failed command's last 20 stderr lines". Task 14's planned guard test `workflow-shape.test.ts` `engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr` matches `last 20 lines of (?:the failed (?:shell )?command's )?stderr` and now fails on `ship`. Group 13 is the last group, so no group gate ran it, and Task 45's DONE WHEN names only `instructions-coverage.test.ts`, `instructions.test.ts` and `render/trackers.test.ts`.

Checked and working together:

- Task 45's drop rule closes the previous Task 14 gap: ship's step 1 drops `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, keeps the `;` separators and drops `--pr` when `{PR_NUMBER}` is empty. The source, the five rendered copies and the ship render baseline carry the same line.
- Task 46 closes the previous Task 16 drift gap: `pnpm tsx .bkit/core/engine/cli.ts check` exits 0 with `0 write(s) would occur`.
- Ship is not a carrier of the `workflow-error-file` clause (`.bkit/instructions.md:5717`), so the clause and ship's line do not have to match, and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0.
- Nothing else changed since attempt 3 (`git diff --stat 6c64f0f00 HEAD`: ship's line, its copies and baseline, `.bkit/version`, plan logs). The engine verbs, the two row types, the fold, the old-layout reader and the resume route are as `build-plan-verify-holistic-2-1.md` to `-2-3.md` checked them.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`, `-1-2.md` and `-1-3.md` (run 1): `PASS`.
- `build-plan-verify-holistic-2-1.md` and `-2-2.md` (run 2): `CONCERNS`, 2 gaps each, fixed in `c1772eefd` and `5562d4190`.
- `build-plan-verify-holistic-2-3.md` (run 2, attempt 3): `CONCERNS`, 2 gaps (ship's drop rule, `.bkit/version` drift). `build-decision-2-4.md` answered both `Fix now` as Tasks 45 and 46, built in group 13 (`8390afd4e`) and judged `PASS` by `build-plan-verify-13-1.md`.
- This is attempt 4.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows the 20 largest of 265 files. The cross-group check read the codebase and `git show 8390afd4e`.
- Tests run (`pnpm exec vitest run -c vitest.unit.config.ts`, each file named): 21 files, 1791 passed, 1 failed, the Task 14 guard test above. The files: `steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `decisions`, `open-decision`, `status`, `workflows`, `tasks`, `context`, `summary`, `verdict-vocabulary`, `workflow-shape`, `template-shape`, `branding`, `render/trackers`, `cli-doc`, `instructions`, `instructions-coverage`, `instructions-sources`.
- Tasks 14, 16 and 45 are off the `Tasks` line: Task 14's DONE WHEN names the failing test, Task 16's DONE WHEN needs `pnpm bkit:gate:static-unit-integration` (which runs it), and Task 45 broke it. One fix closes all three.
- `build-holistic-gate-2-3.md` was red with 16 failures in `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` ("Corepack is about to download … pnpm-10.34.9.tgz", then `Cannot find module …/corepack/…/pnpm.cjs`). The branch does not touch that test, `package.json` or `scripts/ci/`. Re-run here, the file passes 17 of 17, so it was the machine, not the branch. It is no gap; the holistic gate routes it.
- `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57977`, equal to the ceilings in `scripts/gate/bkit-text-ceiling.json` and below 86494 and 58535; no `raise`. The workflows total sits at its ceiling, so the fix must not add words.
- DONE WHEN greps re-run on the current tree: Task 16's removed-path grep (sources, and `.bkit/instructions.md` outside `retired` blocks), the Success Criterion 1 grep, Task 15's heredoc grep and the `-engine.md` grep all print nothing.
- Not run, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync`, `pnpm instructions:sync` and `pnpm bkit:gate:static-unit-integration`.
- Decision records (all in the old layout, read as written): `build-decision-2-4.md` Q1 `Decide`, Q2 and Q3 `Fix now` (Tasks 45, 46), taken under the owner's away rule, not the owner's own words. `build-decision-2-2.md` Q1 to Q3 `Accept (assumed)` for Task 32: assumed, not the owner's acceptance; the confirmation test Task 44 took over passes. `build-decision-1-2.md` (Task 18 `Fix now`) is assumed, not the owner's own words. `build-decision-1-1.md`, `-2-1.md` and `-2-3.md` record loop answers and accept no gap.
- No test-first audit report was supplied for this round, so step 8 has nothing to decide. `build-tests-green-13-1.md` (group 13) is `Enforced: true`, `Gaps: 0`, `Unproven: 0`.
- Derived Test Matrix: every row names a test in its task's `TEST FIRST` or `DONE WHEN`; all pass except Task 14's row above.
- Documentation Updates: every row is done, as `build-plan-verify-holistic-2-1.md` recorded; group 13 changed none of those docs. `.agents/docs.md` lists the Build docs; `docs/testing.md` and `docs/observability.md` are present, and the new refusals use the existing `problem` / `CommandError` output.
- Every task is `[x]` in the plan; the workflow, not this verifier, settles the ticks.

## Identified Gaps Log

1 gap (one root cause, logged as an integration gap and against the task that owns the fix).

INTEGRATION: Task 45 (group 13) reworded ship's Failure Path step 1 (`.bkit/core/workflows/bkit-ship.md:95`) to "the failed command's last 20 stderr lines", which breaks Task 14's (group 4) planned test `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr` (regex `last 20 lines of (?:the failed (?:shell )?command's )?stderr` at line 165; it now fails with `expected [ 'ship' ] to deeply equal []`); group 13 is the last group, so no group gate ran on it — Fixable: true
TASK 45: `.bkit/core/workflows/bkit-ship.md:95` must keep a phrase Task 14's guard test reads, for example "only the last 20 lines of stderr" in place of "the failed command's last 20 stderr lines" (same word count, so the workflows total stays at its ceiling 57977); then regenerate the rendered ship copies and `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`, re-run `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `.bkit/version` matches (Task 46) and `bkit check` exits 0, and pass `workflow-shape.test.ts`, `render/trackers.test.ts`, `instructions-coverage.test.ts` and `pnpm bkit:text:ceiling check`, with no ceiling raised; Task 14 (its DONE WHEN names this test) and Task 16 (its DONE WHEN needs `pnpm bkit:gate:static-unit-integration`, which runs it) clear with the same fix — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 45 reworded ship stderr line so Task 14 guard test fails
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:95` · **Round:** 1
  - **DONE WHEN:** TASK 45 UPDATE: bkit-ship.md Failure Path step 1 says "only the last 20 lines of stderr" (or another phrase matching the workflow-shape regex) in source, rendered copies and ship render baseline, with no words added; pnpm tsx .bkit/core/engine/cli.ts upgrade re-records .bkit/version and check exits 0; workflow-shape.test.ts engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr passes; render/trackers.test.ts and instructions-coverage.test.ts pass; pnpm bkit:text:ceiling check exits 0 with no ceiling raised
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts
<!-- bkit:task 1 end -->
