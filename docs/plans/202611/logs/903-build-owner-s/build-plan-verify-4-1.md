Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: 67cd3be55af7b0ea7d2cb4f5bd83f81320ee490d3cbf216650ac76bfe5709d04
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

- Mode: Group. Judged Tasks 6 and 7 against `build-diff-4-1.md` (commit `8f40f2607`). No `build-decision-*.md` file exists for this run, and the brief has no `Deviations` section.
- Test-first audit (`build-tests-green-4-1.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` entries. Both tasks are `TEST FIRST: n/a`.
- TASK 6 satisfied. `.bkit/core/.bkit/workflows.md` § Resolution evidence holds the verify-pause row (names the `Accept`-only case, FAIL rows only, the keep-FAIL cases), the test-fix row (Step 14 / debug Step 7, same scope, the Q2 option A flake wording), and the pointer on the existing "Failed group execution or gap remediation" row. The **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets match Task 5; the `STANDARD → PIVOT → FINAL` sentence is unchanged. The `docs/testing.md` `summary.test.ts` row names all three cases. `pnpm prettier --check` on both files passes; `instructions-coverage.test.ts` and `render/trackers.test.ts` pass (129 tests).
- TASK 6 also adds a row "Failed group verification or group gate", and extends the existing row with the holistic-verify rule. Both describe resolution rules already in `summary.ts` (`RESOLVED_BY_RUN`, `WHOLE_RUN`), which `build-plan-current.md` asked the Task 6 rows to agree with. The added text matches the code, so it is not a gap.
- TASK 7 DONE WHEN checks all hold: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0; `pnpm bkit check` exits 0 with no drift; `.bkit/workflows.md` matches the source's Resolution evidence section byte for byte; `dist/commands/workflow/summary.js` holds `build/build-failure-remediate` (and `debug/debug-failure-remediate`); `git diff HEAD -- dist/ .bkit/core/engine/render/__snapshots__/bkit-build.none.txt` is empty and commit `8f40f2607` touches neither. The Claude, Cursor, OpenCode and `.agents` skill mirrors of `bkit-build.md` were re-rendered with Task 5's text.
- `pnpm bkit:generate` was not re-run here, because it builds and writes files. Its outputs were checked one by one instead (the list above).
- Dogfood replay: `feat/864-move-project-docs` no longer resolves, so the replay used the same log from HEAD (`docs/plans/202611/logs/864-move-project-docs/status.jsonl` plus its plan and logs) in a scratch folder. `node dist/cli.js workflows summary --workflow=build` exited 0, and its `build-summary.md` lists `build-failure-remediate FAIL, resolved by build-run-tests` under `Resolved Findings`. As `build-plan-current.md` notes, this check and the `dist` grep would also pass before this branch's work, so they prove little about it. That is a plan weakness, not a task gap.
- TASK 7 is not ticked. Its `docs/capabilities.md` UPDATE field did not land, and `pnpm bkit:graph:check` reports drift (see the gap below).
- Mandatory tasks: `docs/decisions.jsonl` holds the `903-*` ledger rows, and `docs/deferrals.jsonl` holds both `Out of Scope` deferral keys. `docs/observability.md` is n/a per the plan.

## Identified Gaps Log

1 gap.

- TASK 7: `docs/capabilities.md` — its UPDATE field (refreshed by `pnpm bkit:generate` when graphify is installed) did not land: graphify is installed at `/Users/christian/.local/bin/graphify`, the execute log says the graph refresh was not run, and `pnpm bkit:graph:check` exits 1 with `DRIFT: docs/capabilities.md is not what this tree produces` (the `commands`, `workflow/decisions` and `workflow/summary` symbol counts from Tasks 2-4); the pre-push graph check would fail on it. Fix: `pnpm bkit:graph:refresh` and commit `docs/capabilities.md` (and `DETAILS.md` if it changes) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 7: docs/capabilities.md not refreshed; bkit:graph:check reports drift
  **Severity:** MEDIUM · **Class:** task-field-not-landed · **Fixable:** true · **Location:** `docs/capabilities.md:333` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:graph:check exits 0 after pnpm bkit:graph:refresh, with docs/capabilities.md (and DETAILS.md if changed) committed
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
