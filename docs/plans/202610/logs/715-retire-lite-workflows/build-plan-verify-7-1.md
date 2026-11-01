Verdict: FAIL
Failures: 8
Fixable: false
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-7-1.md` (commit `84663eb42`). The brief has no `Deviations` section.
- The code work for both tasks is in place. Every `DONE WHEN` check holds when re-run:
  - TASK 14: the `grep -rnE '(:lite|lite\.md|[Ll]ite workflows?)'` over `.bkit/core/.agents`, `.bkit/core/prompts`, `.bkit/core/.bkit` and both `bkit-change.yml` copies returns nothing. The check-only instructions run (`tsx .bkit/core/engine/tools/instructions.ts`, no `--write`) exits 0 and leaves the tree clean. The five named vitest files pass (717 tests).
  - TASK 14: `grep -rn ':lite' .bkit/core/engine` returns 7 hits, but every one is a negative-match regex inside this task's own `TEST FIRST` guard tests (`instructions-sources.test.ts:175,183,189`, `workflow-shape.test.ts:1051`, `templates.test.ts:409,417,421`). No engine code or fixture names `:lite`; the `issues.test.ts` fixture now uses `next:plan`. I judged the check met in intent, so it is not logged as a gap.
  - TASK 15: the `grep -niE` over `README.md` and `docs/roadmap.md` returns nothing. `templates.test.ts` passes. `README.md` has the `/bkit-build #N publish=false` row, the held handoff (`Publish: held`, `Docs: not synced`) and a "Batch recipe (manual)" section that names both limits.
  - Every `UPDATE` field in both tasks maps to a hunk in the diff, including the publish-resolution note in `.bkit/core/.bkit/workflows.md` and the held build and batch recipe lines in `.bkit/core/.bkit/README.md`.
- The test-first audit (`build-tests-green-7-1.md`, `Enforced: true`, `Test order only: true`) reports 8 `no-red` gaps with `Fixable: false`, not `null`, so the report's value stands. The execute log admits that the sources were edited before the tests were written. The `no-red` override does not apply: `build-plan-current.md` classifies TASK 15 as `Reword`, not `Broken`, and the execute log has no `DONE — TASK {N}: already landed` line.
- Decision records `build-decision-1-1.md`, `build-decision-1-2.md` and `build-decision-1-3.md` cover groups 3, 5 and 6 only. None accepts a group 7 gap, so TASK 14 and TASK 15 are not satisfied. The remedy is the owner's call: accept the missing red proof as a TEST EXCEPTION, or record the tests failing against the pre-group sources.
- Out of scope for this group: there are no runtime error paths, so `docs/observability.md` logging does not apply. The full-suite gate and the dogfood mirror refresh belong to TASK 16 (group 8).

## Identified Gaps Log

8 gaps, all from the test-first audit (`build-tests-green-7-1.md`): every planned test passes now, but none was recorded failing before its code, and no decision record accepts them.

- TASK 14: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `no shipped prompt or workflow names a lite workflow` — no-red — Fixable: false
- TASK 14: `.bkit/core/engine/tools/instructions-sources.test.ts` `no shipped rule or prompt instructs a next:*:lite label` — no-red — Fixable: false
- TASK 14: `.bkit/core/engine/tools/instructions-sources.test.ts` `the clause store holds no lite text` — no-red — Fixable: false
- TASK 14: `.bkit/core/engine/audits/templates/templates.test.ts` `the change issue form names no lite workflow` — no-red — Fixable: false
- TASK 14: `.bkit/core/engine/audits/templates/templates.test.ts` `the shipped reference docs list no lite doc` — no-red — Fixable: false
- TASK 15: `.bkit/core/engine/audits/templates/templates.test.ts` `the root README points small changes at /bkit-build` — no-red — Fixable: false
- TASK 15: `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the held handoff` — no-red — Fixable: false
- TASK 15: `.bkit/core/engine/audits/templates/templates.test.ts` `the root README carries the manual batch recipe with both limitations` — no-red — Fixable: false
