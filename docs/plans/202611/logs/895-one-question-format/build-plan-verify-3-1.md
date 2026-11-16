Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 5, 7, 8
Loosened: none
Fingerprint: e6f81414b52b4e7125d868baa51411cae8d1aceb9047143804f98699eafb1ecd
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Tasks 5, 7 and 8 are satisfied. Task 6 meets its DONE WHEN literally but carries one unfixable gap (below), so it stays off the `Tasks` line.
- Tests: `question-option-format.test.ts`, `owner-wait-rows.test.ts`, `workflow-shape.test.ts`, `debug-ci-evidence.integration.test.ts` and `render/trackers.test.ts` pass (5 files, 456 tests). The DONE WHEN folder run (`.bkit/core/engine/tools/ .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/audits/workflows/`) gave up twice on the machine-wide tests lock (held by other worktrees' gate runs, 20 min wait), so the rest of `tools/` and `audits/workflows/` was not run here; the group gate covers it.
- `pnpm prettier --check` passes on the five edited workflows. `No tracker connected` counts in all five `*.none.txt` snapshots equal their counts at `dfddb318c` (build 1, debug 2, ship 1, design 3, plan 2).
- `pnpm tsx .bkit/core/engine/tools/instructions.ts` (the no-flag check) exits 0 with no findings and changes no file, so the clause entries, carriers and § Local Instructions coverage are consistent.
- Task 8's UPDATE says `workflow-plain-text-questions` carriers gain `bkit-plan`; they do not, and that is correct: the clause text is `plain text, not through a host question tool.` (with a full stop) and `bkit-plan.md:538` holds `not through a host question tool,` (a comma), so sync rightly keeps `bkit-plan` out and reports no near-copy or double count, which is what the DONE WHEN asks. The planned test confirms the plan line forbids the host question tool. No gap.
- Task 5 kept the `Offer only the file's options` bullet and the no-direction `Fix now` sentence in § Hard blockers, as `build-plan-current.md` asked.
- Task 6: `branches parse` reads the `branch={x}` token the new owner-answer file carries (`branches.ts:3437-3438`); the CI-run route keeps the lock held until a `Stop` answer and uses the same `locks release` flags as Close Workflow.
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` sections, so nothing to decide.
- Decision records `build-decision-1-1.md` / `-1-2.md` cover group 2's verify loop; none accepts a group 3 gap.

## Identified Gaps Log

1 gap.

- TASK 6: `.bkit/core/workflows/bkit-debug.md:151` — the Loop Question's fixed `**Else** → Recommended: A) Stop — the last attempt left no fewer failures` is false on the `stuck` trend where the count fell but no source code changed (`loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts:338-339`, trend line `The count fell ({a} → {b}), but no source code changed between the rounds.` at `:478`), so the question contradicts its own `{LOOP_TREND_LINE}` and brings back the no-progress claim the plan-current report asked this task to avoid; to fit the planned wording, the code step narrowed the existing `workflow-shape.test.ts` `debug Loop Question states the engine's trend line, never a fixed claim` assertion from the whole section to the `**Q1 — ` lines only (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts:2145-2151`). The plan's UPDATE, Derived Test Matrix row and TEST FIRST test all fix this wording for "every other branch", so a fix needs the owner's choice of reason wording — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: Loop Question's fixed 'no fewer failures' reason contradicts the stuck trend where the count fell with no code change
  **Severity:** MEDIUM · **Class:** edge-case · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-debug.md:151` · **Round:** 1
  - **DONE WHEN:** The Loop Question's non-LOOP_LIMIT recommendation reason agrees with {LOOP_TREND_LINE} on every trend that reaches the question (stuck with equal count, stuck with a fall and no code change, worse), and workflow-shape.test.ts again guards the whole Loop Question against a fixed no-progress claim; needs the owner's choice of wording because the plan fixes this text for every other branch
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/question-option-format.test.ts bkit-debug: the loop question's recommendation reason matches its trigger
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts debug Loop Question states the engine's trend line, never a fixed claim
<!-- bkit:task 1 end -->
