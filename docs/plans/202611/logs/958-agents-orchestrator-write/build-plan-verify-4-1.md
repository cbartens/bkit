Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 15
Loosened: none
Fingerprint: c025987b4c75cfe7568758775e54be37c70a7fd9ffa169f0e8719a1e719fd9d2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-4-1.md` (Tasks 14, 15, 16). Task 15 is satisfied; Tasks 14 and 16 each have a fixable gap.
- Checks run and green: `workflow-shape.test.ts`, `trackers.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `cli-doc.test.ts`, `workflows.test.ts`, `context-fetch.test.ts` (817 tests); `debug-ci-evidence.integration.test.ts` and `workflows.integration.test.ts` (10 tests); `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exit 0; `pnpm bkit:text:ceiling check` ok (prompts 83844, workflows 58002, both below 86494 / 58535); `bkit check` (from source) exit 0.
- The Task 16 greps for `{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`, `--result-file`, `decision-items.json` and `decisions compose` print nothing, over `instructions.md` with the retired blocks left out too. The Task 15 grep for `<<'` prints nothing.
- `addAllButCopied` / `landFailedRecord` are still in `workflows.ts` (lines 719, 907, 921, 937), so the abort commit still carries the log folder.
- Not run here, because this verifier does not build or install: `pnpm build`, `bkit upgrade`, `pnpm cli:sync`, `ceiling lower`. The full `pnpm bkit:gate:static-unit-integration` was not re-run either; the execute log reports exit 0. `cli-doc.test.ts` passing and `bkit check` exit 0 stand in for the sync and mirror checks.
- Test-first audit `build-tests-green-4-1.md`: `Enforced: true`, 3 planned tests red then green, no gaps, and no `Taken over`, `Unproven`, `Changed by a code step` or `Updated tests` sections.
- `debug-ci-evidence.integration.test.ts` gained fixture writes for `context-fetch-{1,2,3}-1.sh`. This only adds setup for the new script path and is not a loosened test.
- Decision record `build-decision-1-1.md` is for group 3 and accepts no gap in this group.
- Observation, not a gap: `bkit-debug.md` Step 4 still says "adapt legacy blocks only in this temporary script", but the script is now a file in the run's log folder.

## Identified Gaps Log

3 gaps.

TASK 14: `.bkit/core/workflows/bkit-ship.md:95` (clause `workflow-error-file`, `.bkit/instructions.md:5716`) — the ship path is missing from the clause: ship's Failure Path prose says to write `{LOG_DIR}/{workflow}-error.md` and to drop `--error-file` "while it is not held", but bkit-ship.md never holds `LOG_DIR`, while its command line passes `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`; the plan's UPDATE line asks the clause to name the ship path — Fixable: true
TASK 16: `docs/testing.md` — the per-file rows the task names are not all updated: no row for the new `audit-report.test.ts` or for `verdict-vocabulary.test.ts`, and the `status.test.ts`, `workflows.test.ts` and `template-shape.test.ts` rows do not describe the tests the branch added (red-gate pause laid out in two files, an assumed item in an engine file counted once, audit templates carrying Title and Key) — Fixable: true
TASK 16: `.bkit/core/.bkit/cli.md:45` — the new Failure Path sentence is followed by "Outside every worktree, so it survives worktree removal; never committed.", which now reads as if the error file is never committed, though it lives in the run's log folder and the abort commit carries it — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 14: ship Failure Path names {LOG_DIR}, which ship never holds
  **Severity:** MEDIUM · **Class:** plan-deviation · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:95` · **Round:** 1
  - **DONE WHEN:** The workflow-error-file clause (.bkit/instructions.md:5716) names the ship path {WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md (and ship-stderr.md), so the prose in bkit-ship.md matches its workflows fail command line; pnpm instructions:sync and the no-flag check exit 0; workflow-shape.test.ts and trackers.test.ts pass
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 16: docs/testing.md per-file rows not all updated
  **Severity:** MEDIUM · **Class:** docs-drift · **Fixable:** true · **Location:** `docs/testing.md:963` · **Round:** 1
  - **DONE WHEN:** docs/testing.md has a row for .bkit/core/engine/commands/workflow/audit-report.test.ts and .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts, and the status.test.ts, workflows.test.ts and template-shape.test.ts rows describe the tests the branch added (two-file red-gate pause, engine-file assumed item counted once, audit templates with Title and Key)
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 16: cli.md says the Failure Path error file is never committed
  **Severity:** LOW · **Class:** docs-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/cli.md:45` · **Round:** 1
  - **DONE WHEN:** The {OUTBOX} paragraph at .bkit/core/.bkit/cli.md:45 no longer reads as if {LOG_DIR}/{workflow}-error.md sits outside the worktree and is never committed; bkit check exits 0 after bkit upgrade
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
