Verdict: FAIL
Failures: 4
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 10

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`; judged against `build-diff-10-1.md`. The brief has no `Deviations` section. No supplied decision record covers group 10 (`build-decision-1-1` … `1-5` cover groups 3, 5, 6, 7 and 9).
- TASK 20 `DONE WHEN` text holds in the source: `.bkit/core/workflows/bkit-build.md:91` sends `PUBLISH` = false **or** not yet resolved to the `--ref="{BRANCH}"` handover with no `--push`, and `:95` keeps `--push` only under `PUBLISH` = true. The planned test passes.
- Test-first audit (`build-tests-green-10-1.md`, `Enforced: true`): the one `test-changed` gap, `Changed since red` = `test body`, is decided `Fixable: false` because its assertions were rewritten. The red run asserted `before` (all Failure Path text above the `--push` line) does not match `not yet resolved`; the fix the `DONE WHEN` names puts that phrase on the false branch above the push line, so the red test as written could not pass on that fix, and the executor narrowed the two assertions to the `**Else**` guard line and added a positive assertion on the false branch. Only the owner can accept that rewrite (a decision record with `Decision: Accept`).
- Task 20 broke two unit tests it did not fix: the `bkit-build` none-render baseline in `.bkit/core/engine/render/trackers.test.ts` and `has no coverage findings` in `.bkit/core/engine/tools/instructions-coverage.test.ts`. Unit suite run (integration excluded): 2 failed, 6750 passed.
- `pnpm tsx .bkit/core/engine/cli.ts check`: 6 writes would occur, DRIFT DETECTED, five of them the `bkit-build` host mirrors.
- `docs/deferrals.jsonl` gained three LOW challenge rows in this group's diff; they are out of Task 20's scope and satisfy nothing.

## Identified Gaps Log

4 gaps.

- TASK 20: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch` — test-changed — the red run's two assertions on `before` (`not.toMatch(/not yet resolved/)`, `toMatch(/`PUBLISH` = true/)`) were rewritten to check only the last `**Else**` line, and a third assertion was added — Fixable: false
- TASK 20: broke `.bkit/core/engine/render/trackers.test.ts` `none render baselines > bkit-build: the none render matches its baseline byte for byte`; `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:68` still holds the old Failure Path step 5 lines — regenerate the baseline — Fixable: true
- TASK 20: broke `.bkit/core/engine/tools/instructions-coverage.test.ts` `the repo > has no coverage findings`; `.bkit/instructions.md` `#### bkit-build` still lists the two old Failure Path step 5 lines and lacks the new ones at `.bkit/core/workflows/bkit-build.md:91` and `:95` — Fixable: true
- TASK 20: `bkit check` reports DRIFT DETECTED; the `bkit-build` mirrors (`.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md`) still carry the old "`PUBLISH` = true **or** not yet resolved" push guard — run `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true
