Verdict: PASS
Failures: 0
Fixable: false
Tasks: 9, 10, 11, 12, 13
Loosened: none
Fingerprint: 8dbcf10b273d6995f533b26a9e7e13a4e893612ef80c7a93ff7236625bdafc4f
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md` (CONCERNS, 3 gaps). `build-plan-gaps-remediate-3-1-log.md` closed the two Task 13 gaps and ported part of the Task 11 moved cases.
- `build-plan-verify-3-2.md` (CONCERNS, 1 gap: Task 11 moved cases, 9 behaviours still untested). `build-decision-1-1.md` answered the loop question `Try again`. `build-plan-gaps-remediate-3-2-log.md` ported the 9 behaviours and restored "summarise" at `bkit-build.md:77`.

## Notes

- Tests run: `pnpm exec vitest run -c vitest.unit.config.ts` on `open-decision.test.ts`, `decisions.test.ts`, `challenge.test.ts`, `tasks.test.ts`, `status.test.ts`, `steps.test.ts`, `workflows.test.ts`, `summary.test.ts`, `cli-doc.test.ts`, `workflow-shape.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `trackers.test.ts` and `question-option-format.test.ts`: 15 files, 1407 tests, all pass. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 with no report. `pnpm bkit:text:ceiling check` passes: prompts 83844, workflows 58004 (58012 at the start of the group).
- Task 11 now satisfied: every `--loop` / `--base-check` behaviour of the deleted `describe("bkit decisions compose")` (`e95997dff:.bkit/core/engine/commands/workflow/decisions.test.ts`) has a case in `describe("bkit decisions counts")` that asserts on the engine file, including the 9 that attempt 2 listed (`decisions.test.ts:1293-1398`). The ported cases keep the original expectations on the engine file's text. The originals' `r.json` `loopRecommended` checks map to the `Recommended:` line. The item-rendering `compose` cases were removed, not moved, as Task 13's DELETE directs; Task 10's `check` cases cover the item rules. The orchestrator's decision file stays byte-identical (`decisions.test.ts:1012`).
- Tasks 9, 10, 12 and 13: still satisfied, as in attempt 2. Since the execute commit `b3c7a5112`, the only engine-side change outside test files is the render snapshot, so the `dist/` built in that commit still matches the source.
- Rendered copies (`.claude/commands/bkit-build.md`, `.cursor/`, `.opencode/`, both `SKILL.md` copies) still have the pre-remediation `bkit-build.md:77` wording ("restate or paraphrase"). This is not a gap in group 3: `Install to mirror` runs upgrade once, at the end, and Task 16 (group 4) runs `upgrade`, and its DONE WHEN requires `bkit check` to exit 0.
- Test-first audit (`build-tests-green-3-3.md`, `Enforced: true`, 4 `delete-still-referenced` gaps at `Fixable: null`), decided:
  - `compose`: the sampled hits are `docker compose`, a different thing. In the engine, workflows, prompts and `.bkit/instructions.md`, `decisions compose` appears only in the `workflow-shape.test.ts` guard test that asserts it is absent. Outside those, `docs/testing.md:957` names it; Task 16 updates that row (plan § Documentation Updates). No gap.
  - `composeItems`: no hit in `decisions.ts`; the remaining hits are only in archived `docs/audits/` and `docs/plans/**/logs/`. No gap.
  - `itemLines`: `.bkit/core/engine/shared/text.ts:245-259` and `dist/shared/text.js` hold a different YAML-style function. No gap.
  - `decisions.test.ts` "the file still exists": the DELETE names the remaining `describe("bkit decisions compose")` cases, not the file, and that describe is gone. No gap.
- The audit has no `Taken over`, `Unproven`, `Changed by a code step` or `Updated tests` section. The brief has no `Deviations` section. Decision record `build-decision-1-1.md` holds the loop answer `Try again`. It accepts no gap.
- Each `Derived Test Matrix` row for Tasks 9-13 is named in its task's `DONE WHEN`. This group's `Documentation Updates` rows (the `.bkit/instructions.md` entries and the generated `cli.md` region) are done. The rest belong to Task 16.

## Identified Gaps Log

None
