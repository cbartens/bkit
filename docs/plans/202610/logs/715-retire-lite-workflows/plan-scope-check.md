Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

- **Task 8 / Task 9 (`bkit stats` coverage for `ending: held`):** Issue #715 § Implementation scope states "`workflows summary` and `bkit stats`: record `publish` and ending `held`", and `.bkit/core/.bkit/jsonl.md` + `docs/observability.md` define the `outcome` / `run` ending contract. Task 8 updates `telemetry.ts` (`workflowTelemetry` per-run view) and Task 9 updates `scripts/harvest/bkit-harvest.mjs`, but neither task updates `.bkit/core/engine/commands/stats.ts` / `analysis.ts` (if `bkit stats` reports endings) or `.bkit/core/.bkit/jsonl.md` (§ Per-Kind Fields `outcome` and `run` `ending` enum definitions at lines 104 and 112) and `docs/observability.md` (which `Documentation Updates` line 541 explicitly promises to update, yet no runbook task lists `docs/observability.md` or `.bkit/core/.bkit/jsonl.md` in `**UPDATE:**`). Add `docs/observability.md` and `.bkit/core/.bkit/jsonl.md` to Task 9 or Task 12 `**UPDATE:**` and `DONE WHEN`.
- **Derived Test Matrix ↔ Runbook Task 10 mapping mismatch (1:1 bidirectional rule):** Matrix row `"Gate 16 checks build-close-workflow only on the held path"` (line 137, mapped to Task 10) has no corresponding `TEST FIRST` test in Task 10; instead, Task 10's 4th `TEST FIRST` test is `` `warns when a non-LOCAL run resolves publish false` ``, which has no dedicated row in `Derived Test Matrix` (it is bundled into row 134 `"bkit-build.md resolves publish from token → config → runtime, with the non-LOCAL coercion warning"`). Align the Matrix rows and Task 10's `TEST FIRST` entries 1:1 so each testable behaviour in the Matrix maps to its exact `TEST FIRST` test in Task 10.
- **Derived Test Matrix rows 145–146 (`Static` gate rows mapped to Task 12) and `step-table.test.ts` scope:**
  1. Matrix rows 145 (`Full static + unit + integration gate passes`) and 146 (`bkit check passes on the repo after install`) are repo-wide `Static` gate commands, not unit/integration tests in Task 12's `TEST FIRST`, breaking the 1:1 mapping between Matrix rows and Task 12's 3 `TEST FIRST` tests (rows 143–144 map to 3 tests in Task 12: `the root README points small changes at /bkit-build`, `the root README carries the manual batch caveat`, `the root README carries the held handoff` — 2 Matrix rows for 3 `TEST FIRST` tests, plus 2 Static rows with no `TEST FIRST` entry). Split row 144 into two Matrix rows (manual batch caveat; held handoff) to match Task 12's 3 `TEST FIRST` tests 1:1, and keep suite-wide gate commands in `Verification Plan` rather than `Derived Test Matrix`.
  2. Issue #715 § Retirement scope & Implementation scope explicitly list "the uninstall list" (`.bkit/core/engine/commands/install/uninstall.ts` line 381 comment referencing `.bkit/lite.md` and `CORE_TEMPLATE_DOCTRINE` / uninstall handling of consumer `.bkit/lite.md` stubs) and `step-table.test.ts`. Verify and either include `.bkit/core/engine/commands/install/uninstall.ts` (and `step-table.test.ts` if needed) in Task 5 / Task 10 or justify in `Architecture & Component Changes`.

## OPTIONAL

- **Task 5 & Task 11 duplicate `UPDATE` entries:** Both Task 5 and Task 11 list `**UPDATE:** .bkit/core/.bkit/README.md` (dropping `lite.md` from Tier-1/Tier-2 tables and install-writes list) and `**UPDATE:** .bkit/core/.agents/docs.md` (deleting the `.bkit/lite.md` index row), and both Task 11 and Task 12 list `**UPDATE:** .bkit/core/.bkit/workflows.md` (changing build Output to the held alternative). Assign each file edit to a single task so Task 5's `DONE WHEN` and Task 11/12's `DONE WHEN` don't overlap on the same lines.
- **Task 10 `roadmap mirror` on `publish=false`:** Task 10 states that the held close skips `roadmap mirror` (as well as branch push), while `closeWorkflow` sets `roadmapFoldNeeded: true` and `featureStatus: "BUILT"`. Confirm whether `bkit roadmap feature` (local worktree `.bkit/issues.jsonl` + `docs/roadmap.md` fold, without the `dev` push) should still run on `publish=false` or be skipped altogether so `/bkit-ship` doesn't see a missing `BUILT` row.

## OUT OF SCOPE

- None.
