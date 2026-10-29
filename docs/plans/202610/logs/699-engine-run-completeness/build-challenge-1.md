Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer on tracker `none` gets an evidence hole on every design / plan / debug / ship run, because the contract is derived from the unrendered workflow source whose `<!-- bkit:tracker true start -->` blocks hold calls that consumer never runs (`issues related`, `plans parse`, `plans comment`, `issues labels`, `issues comment`, `issues fetch`)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1060`
  - **DONE WHEN:** `contractOf` (close and start paths) and `bkit completeness check` derive the contract from the workflow markdown rendered for the consumer's configured tracker (`substituteWorkflow(md, tracker)` from `.bkit/core/engine/render/trackers.ts`), so a tracker-`none` run that journals every call its rendered workflow names is `CLEAN`.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `a tracker-none run that journals every rendered call is CLEAN` fails on ship-start-workflow reported as an evidence hole lacking `issues labels`, `issues comment` (and plan-fetch-context lacking `issues related`) when the rows replay `substituteWorkflow(src, "none")` and the contract is built from the raw source
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run` fails on the stored row carrying `holey: true`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Every build that reaches Step 5 is marked HOLEY: `branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md` is never journaled, because `resolveActiveRun` treats any `--file` as the run's `status.jsonl`, returns undefined for a non-status file and never falls back to `--fid` or the cwd scan, while the contract requires that call for `build-plan-current`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/lib.ts:407`
  - **DONE WHEN:** a `--file` that is not a `docs/plans/<month>/logs/<fid>/status.jsonl` path falls through to the `--fid` and cwd-scan resolution instead of returning undefined, so `branches anchor-read --file=<plan.md>` inside the run's worktree journals an `engine-call` row (verified live: `resolveActiveRun({cwd, file: "docs/plans/202610/699-engine-run-completeness-plan.md"})` returns undefined today while the scan alone resolves the run).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `resolveActiveRun falls back to the cwd scan when --file names a non-status file` fails on undefined returned for `--file=docs/plans/202610/x-plan.md` in a tree with exactly one IN_PROGRESS run
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `branches anchor-read with a plan --file journals into the active run` fails on no `engine-call` row appended to the run's `status.jsonl`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A run whose journal starts partway (resumed across a `bkit upgrade` to the journaling engine, or `BKIT_ENGINE_JOURNAL=off` lifted mid-run) is HOLEY with an evidence hole on every step finished before its first `engine-call` row, because `preJournal` is all-or-nothing per run (`callCount === 0`); this run itself shows it today (`bkit completeness check --workflow=build` on its own `status.jsonl` reports build-start-workflow, build-branch-sync, build-plan-convert, ... as evidence holes) and its close row will make the ship start warn
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/status-holes.ts:501`
  - **DONE WHEN:** visits whose rows all precede the run's first `engine-call` row are judged steps-only (no evidence hole, no `unexercised`), while visits after it are judged on calls as today; a run with zero `engine-call` rows keeps `preJournal: true`.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row` fails on `build-worktree-setup` (finished with no calls before the first `engine-call` row) listed in `evidenceHoles`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `bkit completeness check` folds every run of one workflow in the file into one verdict: a failed pre-journal build run 1 followed by a journaling build run 2 reports run 1's `build-worktree-setup` as an evidence hole lacking `steps finish` (reproduced on a 6-row fixture), and a run 1 `close-workflow` row makes run 2's absent steps step holes; 5 of the 12 `status.jsonl` files in this tree hold two runs of one workflow
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/completeness.ts:83`
  - **DONE WHEN:** the verb splits the file's rows per run (each `workflow-started` to the next of that workflow, as `previousRunWarning` already does via `runRowsOf`) and reports one verdict per run, so no row of one run is attributed to, or closes, another.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/completeness.test.ts` `a file holding two runs of one workflow is checked per run` fails on a single verdict whose `evidenceHoles` names run 1's pre-journal `build-worktree-setup`

<!-- bkit:task 4 end -->
