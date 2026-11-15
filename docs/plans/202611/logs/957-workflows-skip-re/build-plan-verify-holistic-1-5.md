Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
Loosened: none
Fingerprint: 8874d47cd7807bce0c5ddd60cb7407b08f254e54b1026265c8efce4061ade720
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 groups verified (the plan has 4 groups).

## Integration Gaps

1 integration gap.

- The `docs/decisions.jsonl` row `957-reruns-follow-answers` (line 863, written by Task 5 in Group 2) still describes the first version of the `continue` rule. It says build routes `continue` for a verify or holistic pause with every item accepted, the loop question answered `Decide`, and no `Gate: FAIL` header. It does not mention the no-source-change condition (Task 7, Group 3) or the `Source changed: false` decision-file header the rule now reads (Tasks 10-11, Group 4). It also does not say that the verify tick runs before the decision is recorded (Task 8). The workflow (`.bkit/core/workflows/bkit-build.md:268`, `:295-301`, `:346`) and the catalog (`.bkit/core/.bkit/workflows.md:259`, `:1003`) state the current rule. So the ledger is now the only place that states the old, looser rule. A design or plan agent reads this ledger at every phase, so it could restore a `continue` that skips the re-run after a fix round edited source. Fix: re-append the row with the same key (`bkit ledgers append`, `.bkit/jsonl.md` § Write Idiom), with the current condition in its `summary` and `description`.

## Previously Attempted

- `build-plan-verify-1-1.md`: PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md`: CONCERNS, 2 fixable gaps (`.bkit/instructions.md` out of sync). `build-plan-gaps-remediate-2-1-log.md` closed them.
- `build-plan-verify-2-2.md`: PASS, Tasks 4, 5.
- `build-plan-verify-holistic-1-1.md`: CONCERNS, 1 fixable integration gap (installed copies not re-rendered). `build-plan-gaps-remediate-holistic-1-1-log.md` closed it.
- `build-plan-verify-holistic-1-2.md`: PASS, Tasks 1-5.
- `build-plan-verify-3-1.md`: PASS, Tasks 6, 7, 8, 9.
- `build-plan-verify-holistic-1-3.md`: CONCERNS, 1 fixable integration gap (the catalog and the build gate line stated the old `continue` rule). `build-plan-gaps-remediate-holistic-1-3-log.md` closed it.
- `build-plan-verify-holistic-1-4.md`: PASS, Tasks 1-9. It marked both `Documentation Updates` rows done, but did not compare the decision row's text with the rule Task 7 had already tightened.
- `build-plan-verify-4-1.md`: PASS, Tasks 10, 11.

## Notes

- Diff reviewed: `git diff 3e08269f7..HEAD` (the feature's own commits) plus `git diff HEAD`. The uncommitted part is the `[x]` ticks on Tasks 10-11 in the plan and new `status.jsonl` rows only.
- Tasks 10-11 fit the earlier groups' rule. The verify and holistic `{HEADER_FLAGS}` lines (`bkit-build.md:168-169`) write `Source changed={SOURCE_CHANGED}`. `SOURCE_CHANGED` is set at every verify or holistic pause entry: Step 8 (`:781`, false), Step 9 scan-diff (`:873`), Step 10 sub-steps 5-6 (`:935`, false) and Step 10 sub-step 10 scan-diff (`:968`). So no pause composes the header from an unset value. A resume that reaches the pause through `openDecision` goes to Decision Pause step 3 with the existing file, so it never recomposes the header. The step 6 rule (`:268`) reads the header from the file and keeps the re-run when it is missing or not `false`. The Gate line (`:346`), the **Re-runs follow answers** row (`workflows.md:259`), the Decision Pause `Then:` bullet (`:1003`) and `.bkit/instructions.md` say the same thing.
- Rule order in step 6 is still right: `Fix now` → `fix`, then `Try again` → `retry`, then `continue`, then `holistic` / `verify`. A `Gate: FAIL` pause or one whose source changed falls through to `verify` / `holistic`, as the Edge Cases table requires.
- The engine pieces agree. `DECISION_ROUTES.continue` (`step-table.ts:233-241`) resumes a verify pause at `build-plan-tasks` and a holistic pause at `build-challenge`. `tasks tick --decision` (`tasks.ts:207-224`) skips the `Verify` loop item, because its `Decide` answer is not `Accept`. The holistic settling in `summary.ts:421-452` leaves out the `Holistic verify` loop item and requires `Decide` on it. `openDecision.sourceChanged` (`workflows.ts:309`) and `dist/commands/workflow/workflows.js:152` match.
- Tests: the caller said to run single named files only and no `bkit:gate:*` script, so `bkit tests changed --base=0d96277361f986ad0027e6087c6b793ef9b6b48f --fallback=bkit:gate:static-unit` was not run. Each file below was run alone with `BKIT_TEST_SLOTS=2 pnpm bkit:test:file`, and all passed: `tasks.test.ts` (25), `step-table.test.ts` (48), `summary.test.ts` (68), `workflows.test.ts` (172), `workflow-shape.test.ts` (284), `counter-prose-audit.test.ts` (71), `runtime-prose-audit.test.ts` (26), `instructions-coverage.test.ts` (28), `instructions-sources.test.ts` (23), `instructions.test.ts` (108) and `install/modules/core.integration.test.ts` (157).
- `node dist/cli.js check` exits 0 with `0 write(s) would occur`, so the installed copies match their sources.
- Derived Test Matrix: all 18 rows have their test in the `TEST FIRST` of the task the row names. Each test name appears once in its target file, and all of them pass.
- Documentation Updates: the `.bkit/core/.bkit/workflows.md` row is done. The `docs/decisions.jsonl` row exists and names #957, but its text is out of date (the integration gap above).
- Observability: `docs/observability.md` is present. The feature adds no new engine error path that needs logging. The new `--decision` errors are usage errors (`EXIT.USAGE`) like the flag's neighbours.
- Decision record `build-decision-1-1.md` is the owner's `Fix now` on Task 8, not an accept. Task 8 is built as that answer directs.
- No test-first audit report was supplied for this holistic round.
- Not a gap: `openDecision` reads `sourceChanged` with `field()`, which searches the whole file, while `gate` reads only the header block. The header comes first, so a header line always wins. Only a file with no header and a body line starting `Source changed:` could match by mistake, and no step writes such a body line.
- Out-of-scope proposals, carried from earlier reports: the `build-challenge-2.md` LOW findings are recorded in `docs/deferrals.jsonl` (the four `957-workflows-skip-re-challenge-low-*` rows), including the one about anchoring the title match in `tasks.ts:219`.

## Identified Gaps Log

1 gap.

INTEGRATION: `docs/decisions.jsonl:863` row `957-reruns-follow-answers` (Task 5, Group 2) states the build `continue` condition as all-Accept, loop question Decide and no Gate: FAIL only; it omits the no-source-change condition and the `Source changed: false` decision-file header that Tasks 7, 10 and 11 (Groups 3-4) added, and the tick-before-record order of Task 8, so the ledger now disagrees with `.bkit/core/workflows/bkit-build.md:268` and `.bkit/core/.bkit/workflows.md:259`/`:1003`; re-append the row with the same key and the current condition — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Decision row 957-reruns-follow-answers states the old continue condition
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `docs/decisions.jsonl:863` · **Round:** 1
  - **DONE WHEN:** The 957-reruns-follow-answers decision row is re-appended with the same key, and its summary and description state the current continue condition: every item Accept or Accept (assumed), loop question Decide, no Gate: FAIL header, and the decision file header holds Source changed: false (a missing header keeps the re-run), with the verify tick made before the decision is recorded
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
