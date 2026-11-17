Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 5342aa3600dd459e8dafd0a4cd5eb640b2fc54de5c9b1a14f77314a12743a3a7
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 groups verified (the plan has 2 groups).

## Integration Gaps

1 integration gap.

- Installed copies not re-rendered: the feature edited the sources `.bkit/core/.bkit/cli.md` (TASK 1), `.bkit/core/workflows/bkit-build.md` (TASK 4) and `.bkit/core/.bkit/workflows.md` (TASK 5), but no step re-rendered the installed copies, and no later build step runs `upgrade`. `node dist/cli.js check` exits 1 with `8 write(s) would occur — DRIFT DETECTED`. Among the drifted files are `.bkit/cli.md`, `.bkit/workflows.md`, `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md` and `.agents/plugins/bkit/skills/bkit-build/SKILL.md`. `.github/workflows/bkit-ci.yml:495` runs `pnpm bkit check`, so the PR's CI fails on the drift. Agents that read the installed copies also never see the `continue` route or the **Re-runs follow answers** row (`.bkit/workflows.md:259` has no such row). The group verifies left this to the end of the session (`.agents/rules.md` § Install to mirror). The holistic fix round is the last step that changes code, so the upgrade belongs there.

## Previously Attempted

- `build-plan-verify-1-1.md`: PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md`: CONCERNS, 2 fixable gaps (`.bkit/instructions.md` out of sync), closed by `build-plan-gaps-remediate-2-1-log.md`.
- `build-plan-verify-2-2.md`: PASS, Tasks 4, 5.
- This is the first holistic attempt.

## Notes

- Diff reviewed: `git diff 3e08269f7..HEAD`, the feature's own commits, as the caller directed. The supplied `tmp/bkit-diff-957-workflows-skip-re.md` is partial and also covers 13 local `dev` commits from other work.
- Tests: the caller said to run single named files only and no `bkit:gate:*` script, so `bkit tests changed --base=origin/dev` was not run. Instead, each of these files was run alone with `pnpm bkit:test:file`, and all passed: `tasks.test.ts` (24), `step-table.test.ts` (48), `summary.test.ts` (67), `workflow-shape.test.ts` (279), `instructions-coverage.test.ts` (28), `instructions-sources.test.ts` (23), `instructions.test.ts` (108), `status-holes.test.ts` (77), `decisions.test.ts` (50), `status.test.ts` (87) and `.bkit/core/engine/tools/cli-doc.test.ts` (7).
- Derived Test Matrix: all 10 rows have their test, named in the `TEST FIRST` of the task the row names. The `DONE WHEN` lines state the behaviour those tests check. Each test exists under its exact name and passes.
- TASK 1 `DONE WHEN` holds: `tasks tick --decision` ticks only in-group tasks named `Task {N}` in items answered `Accept` / `Accept (assumed)`.
- TASK 2 `DONE WHEN` holds: `DECISION_ROUTES.build.routes.continue` in `.bkit/core/engine/commands/workflow/step-table.ts` sends the three group steps to `build-plan-tasks` and the two holistic steps to `build-challenge`. `resumePoint` reads keyed routes generically.
- TASK 3 `DONE WHEN` holds: `buildSummary` settles the last pre-pause holistic FAIL rows after an all-Accept `From: holistic` pause.
- TASK 4 and TASK 5 `DONE WHEN` hold, as recorded in `build-plan-verify-2-2.md`. The diff since then touches only run logs.
- How the groups fit together, each checked:
  - Pause step 2 titles verify items `Task {N}`, which matches the `\bTask (\d+)\b` match in `tasks.ts`.
  - Step 8 sub-step 6 ticks the verified tasks before any pause, so on a verify `continue` the decision tick adds only the accepted tasks.
  - `tasks tick` only ever ticks boxes, and Step 7 reaches Step 10 only when every task is ticked. So a holistic `continue` to Step 11 leaves no task unticked for Step 15.
  - The `steps finish --field=route=continue` row is read back by `resumePoint`.
  - The Step 10 holistic verifier still reads every `build-decision-*.md`.
  - The Step 15 row in `.bkit/core/.bkit/workflows.md` matches `summary.ts`.
- Observation, not a gap: `summary.ts` settles only `FAIL` rows, both in the existing verify-pause logic and in the new holistic logic. A `CONCERNS` verify or holistic row that a `continue` leaves as the last row adds one more `CONCERNS` reason to the summary. The verdict is unchanged, because any Accept already makes the summary `CONCERNS` ("item(s) accepted at the Decision Pause"), which is what a passing re-run would also give.
- Documentation Updates: both rows are done in the sources (`docs/decisions.jsonl` row `957-reruns-follow-answers`, and the `.bkit/core/.bkit/workflows.md` edits). The installed `.bkit/workflows.md` copy is covered by the integration gap above.
- Observability: the new engine code reports bad input through `CommandError` with `EXIT.USAGE`, like the rest of `tasks.ts`. It logs no personal data, so `docs/observability.md` adds no requirement here.
- No decision record (`build-decision-*.md`) and no test-first audit report were supplied for this holistic round.
- `node dist/cli.js check` rewrote only the gitignored `.bkit/advisories.md`. No tracked file changed.

## Identified Gaps Log

1 gap.

INTEGRATION: Groups 1 and 2 (TASK 1, TASK 4, TASK 5) edited the sources `.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md` and `.bkit/core/workflows/bkit-build.md`, but the installed copies were never re-rendered, and no later build step runs `upgrade`. `node dist/cli.js check` exits 1 with `8 write(s) would occur — DRIFT DETECTED` (`.bkit/cli.md`, `.bkit/workflows.md`, `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md`, ...), and `.github/workflows/bkit-ci.yml:495` runs `pnpm bkit check`, so the PR's CI fails. Agents reading the installed `.bkit/workflows.md` and host command files also get no `continue` route. Fix: run `pnpm tsx .bkit/core/engine/cli.ts upgrade` (`.agents/rules.md` § Install to mirror), commit the re-rendered copies, and confirm `node dist/cli.js check` reports no drift — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Installed copies not re-rendered after source edits; bkit check reports drift
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/workflows.md:259` · **Round:** 1
  - **DONE WHEN:** pnpm tsx .bkit/core/engine/cli.ts upgrade has re-rendered the installed copies (.bkit/cli.md, .bkit/workflows.md, .claude/.cursor/.opencode bkit-build commands, .agents bkit-build skills) and node dist/cli.js check reports no drift
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
