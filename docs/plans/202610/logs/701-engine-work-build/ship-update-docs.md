# Docs Update

## Files Modified

None. This cycle's diff (`origin/dev..HEAD`) already carries the doc edits for the shipped code: `docs/testing.md`, `docs/templates/bkit-plan.md`, `.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/pipeline.md`, `.bkit/instructions.md`. Repo is not shallow.

## Drift Resolved

None needed. Checked against the shipped engine changes (`tasks.ts`, `ledgers.ts` triage, `branches.ts` scan-diff `--disabled-tests`, `tests.ts` plan-check / green, `plan-blocks.ts`, `challenge.ts`):

- `docs/testing.md`: test-matrix rows already cover `tests.test.ts` (plan-check, red / green with `verdict` and `fixable`), `tasks.test.ts`, `plan-blocks.test.ts`, `challenge.test.ts`, `branches.test.ts` (scan-diff) and `ledgers.test.ts` (triage). No other section names the old agent-side behaviour.
- `docs/templates/bkit-plan.md`: `Derived Test Matrix` carries the `Task` column that `plan-check` now requires.
- `docs/migrations.md`, `docs/architecture.md`, `docs/capabilities.md` (generated), the other `docs/*.md`: no reference to the changed behaviour; no new migration shipped.
- Memory (`MEMORY.md`): pointers only; no entry covers this feature; nothing stale or duplicated.

## Pending Items

`docs/deferrals.jsonl` rows matching 701 (human review):

- `701-design-workflow-reviewer-audit`
- `701-sweep-deliverable-verification-stays-in-prompt`
- `701-plan-current-classification-stays-in-prompt`
- `701-verify-diff-reads-stay-in-prompt`
- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-266` (`tasks open` drops ticked-but-unlogged tasks)
- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-branches-ts-1126` (`scan-diff --disabled-tests` reads symlinked test files without a containment check)
- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-challenge-ts-269` (`challenge merge` writes unsanitised `|` into the matrix row)

Also in the build summary: the build verdict is FAIL; TASK 14 is BLOCKED (red evidence missing for the Python skip markers; the code and test are in place and green).

## Blockers

None.
