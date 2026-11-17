Verdict: CONCERNS
Failures: 1
Fingerprint: 7f0ad2f96ea1e85d8f02d2659776516efeaf8c074e255e6aeb1b9f73c7c4bd60
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Diff `tmp/bkit-diff-930-build-tick-green.md` (full coverage): `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts:109-114`, its `dist/commands/workflow/tasks.js` build, and two new cases in `.bkit/core/engine/commands/workflow/tasks.test.ts`. Read against the plan `docs/plans/202611/930-build-tick-green-plan.md`, the sole report writer `writeAuditReport` in `.bkit/core/engine/commands/workflow/tests.ts:1461-1540`, the tick caller `tasks.ts:214-235`, `.bkit/core/workflows/bkit-build.md` Step 8 sub-step 6, `.bkit/workflows.md:973` and `.bkit/cli.md:370`.

## Notes

- Section slicing checked and sound: `writeAuditReport` always writes exactly one `## Gaps` heading, before every other `## ` heading; the gap lines are single-line; the `## Updated tests` diff fences are indented two spaces, so no `## ` line inside them can end the section early; the `## Runner output` fences come after Gaps. CRLF reports still parse (`[^\n]*` eats the `\r`). `## Gaps (2)` style headings match via `\b`; `### Gaps` does not.
- Behaviour change outside the two cases the plan names: tasks listed only under `## Unproven` were held open before and are now ticked. This matches the doctrine (`tests.ts:1066-1070` "a test with no proven red is no gap"; `.bkit/workflows.md:973` "notes the `Unproven` section without a gap"), so it is not logged as a finding, but no test pins it.
- New tests read against the old and new code: both fail on the old whole-text match (task 9 / task 7 gapped) and pass on the new section slice.
- Pre-existing, unchanged by this diff, outside the task: a plan-level gap (`- Plan ...`, task null) names no task, so a malformed plan still lets every task tick; the red report's `- TASK N` lines never match `REPORT_GAP` (case-sensitive), which only matters if `--green` is pointed at a red report.
- Docs: `.agents/docs.md`, `docs/architecture.md` and `docs/security.md` present; neither architecture nor security addresses this parser. The finding is cross-referenced against `.bkit/core/workflows/bkit-build.md` Step 8 sub-step 6 ("A task that the test-first report lists as a gap stays open").

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A `--green` text report with gap lines but no `## Gaps` heading (hand-written, truncated or wrong file) reads as zero gaps, so `tasks tick` ticks every gapped task and exits 0
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:110` · **Round:** 1
  - **DONE WHEN:** gappedTasks fails closed: a text report with no `## Gaps` heading (and no JSON `gaps` array) makes `bkit tasks tick --green` exit 2 with a message naming the missing section, and leaves the plan unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a green report with no Gaps section` fails on exit 0 with `ticked` [1, 2] for a report whose only gap line (``- Task 2 `not-green` …``) sits under no `## Gaps` heading
<!-- bkit:task 1 end -->
