Verdict: PASS
Failures: 0
Fixable: false
Tasks: 2, 3

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 2` (one group): TASK 2 (the `tasks` noun with `tick`, wired into the verifier and build Steps 7/9) and TASK 3 (`tasks open`, wired into build Step 6).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verify attempt for group 2 (no `build-plan-verify-2-*` and no `build-plan-gaps-remediate-2-*-log.md` existed; no `build-decision-*.md` record was supplied).

## Notes

Both group tasks were checked against the codebase, not against the execute log's two `DONE — TASK` lines. Group caps hold: 2 tasks (cap 3), 13 `TEST FIRST` tests (cap 15), 12 of them in one file and 1 in another (cap 10 tests across 3 files).

- **TASK 2.** `bkit tasks --help` lists `tick` and `open`; `tick --help` marks `--group` required and states "(one of --tasks / --green)" on both selectors. Dogfooded `node dist/cli.js tasks tick` on a scratch plan: `--group=1 --tasks=2` ticked only that box and the `diff` against the original was that one line (exit 0, `ticked: [2]`); re-running it printed `ticked: []` and left the file unchanged (exit 0); no `--group` → exit 2 `missing required flag --group`; `--group` with neither selector → exit 2 `give one of --tasks and --green`; a task of another group → exit 2 `TASK 3 is in group 2, not group 1`; `--tasks=one` → exit 2; a missing plan → exit 2; every error path left the plan byte-identical. `--green` drops exactly the report's gapped tasks (scratch report gapping task 1 and a non-group task 3: `--tasks=1,2 --green=` ticked only 2). `bkit-build-plan-verify.md` line 31 reads "never edit the plan" and names no plan tick; its output block line 85 declares `Tasks:`, which `steps finish` (`.bkit/core/engine/commands/workflow/steps.ts` `promptHeader`) parses as a required plain field. `bkit-build.md` Step 7 sub-step 6 and Step 9 sub-step 4 call `tasks tick`, Step 7 holds `fields.Tasks` from the finish, and the renumbered sub-steps (7 route, 8 gate, 9 finish, 10 next group, 11 rounds, 12 failure; Step 8 now "Step 7 sub-step 12") agree with each other.
- **TASK 3.** `bkit tasks open` on a scratch plan and log printed the one task with neither line (`tasks: [2]`, `handover: true`, exit 0) and `tasks: []`, `handover: false` when the log closed both; a plan with no task blocks exits 1 with `no task markers`. The reader is the exported `doneTasks`, widened with a `verbs` argument (`["DONE", "BLOCKED"]`) whose default keeps `context brief` reading `DONE` only — no second parser. Build Step 6 sub-step 5 runs the verb and routes on `EXECUTE_HANDOVER`; the prose set difference is gone. The verify prompt's Processes 6-7 no longer cross-reference the `DONE` log.
- **Test-first audit** (`build-tests-green-2-1.md`: `Enforced: true`, `Test order only: true`, 12 `test-changed` gaps, all `Changed since red` = `yes`; every row recorded a red and passed green). I read every diff (snapshots `2-2-1`…`2-2-9`, `2-3-1`…`2-3-3`) and re-diffed them against the current file: each holds the same three edits — a `dir()` temp-folder helper extracted out of `write`, that helper's call replacing `if (cwd === "") cwd = tmp();` in "tick refuses a --plan that is no file", and a formatter rejoin of one wrapped `expect(...).toEqual(["- [x] **TASK 2:** Task 2 title."])` — plus, in the Task 2 snapshots, TASK 3's `open` describe block appended outside every Task 2 test. No assertion was weakened, removed or rewritten (the `toEqual` literal is byte-identical), no planned test was renamed or dropped, and all 13 named tests exist and pass, so no gap stands. The `conventions.test.ts` red (`build-task-red-2-2-10`) covers the reachability row the matrix maps to task 2.
- **Gates.** `pnpm vitest run .bkit/core/engine/commands/conventions.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts` green (244 tests); `pnpm vitest run .bkit/core/engine/commands/workflow/tasks.test.ts` green (12 tests); full `pnpm vitest run` green (201 files, 7910 passed, 1 skipped).
- **Advisory, not a gap.** The prompt declares `Tasks: … none when there are none`, and both tick call sites pass `{VERIFIED_TASKS}` through verbatim, so a group with nothing satisfied runs `bkit tasks tick --tasks="none"` and exits 2 as a bad value. The outcome is right (nothing is ticked, and neither step routes on the tick's exit code), and no `DONE WHEN` names the case, so nothing is logged as a gap; tightening it belongs to a later change.
- Tick applied to the plan with `bkit tasks tick --group=2 --tasks=2,3` (no `--green`, the holistic call's form, because I cleared the report's gaps above); the plan's diff is exactly the two TASK heading lines.

## Identified Gaps Log

None
