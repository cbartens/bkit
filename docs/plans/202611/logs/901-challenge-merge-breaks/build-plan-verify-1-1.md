Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1 satisfied: `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts` now normalises the matrix header (case and cell-edge spaces ignored) and pushes one `matrix` problem naming `Test description | Type | Target file | Task` when it differs; the missing-`Task` case falls under the same single problem. `dist/commands/workflow/tests.js` is rebuilt in the same commit. `pnpm vitest run .bkit/core/engine/commands/workflow/tests.test.ts`: 148 passed, including the five TEST FIRST tests. Neighbouring matrix tests (`challenge.test.ts`, `summary.test.ts`, `context.test.ts`, `plan-blocks.test.ts`, `template-shape.test.ts`): 223 passed. The template `.bkit/core/docs/templates/bkit-plan.md:71` header matches the pinned header.
- TASK 2 satisfied: `bkit-plan-generate.md:46`, `bkit-build-plan-convert.md:36` and `.bkit/trackers.md:142` name the four-column header with no extra columns (trackers.md: "the four columns ... with `Task` last"); `rg -n "Task. column beside"` on the convert prompt finds nothing. The shared `Scenario detail` clause is updated in `.bkit/instructions.md` and its carriers `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`; the instructions tool reported no further rewrites (worktree unchanged after the run).
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, no `Unproven` or `Updated tests` section. Already landed: TASK 1 `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts the template matrix header in any letter case` - the tests step's reason: the current check already accepts any header with a `Task` column, so the case-different header passes; it guards against an over-strict fix. The existing no-`Task`-column test gained one additive `toContain` expectation only.
- The plan has no `Derived Test Matrix` or `Documentation Updates` section, so there are no matrix rows or doc rows to map. No new error paths, so `docs/observability.md` logging is not engaged.
- Advisory, not a gap: the host mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`) of the edited prompts are not re-rendered yet; `.agents/rules.md` puts `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at session end.
- No decision records, earlier verify reports or remediation logs were supplied.

## Identified Gaps Log

None
