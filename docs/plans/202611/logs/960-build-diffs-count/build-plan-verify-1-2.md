Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 9f2786f8a21319301feea1b4ebc2143d97706b9193ae01c006d111b823be1df9
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/960-build-diffs-count/build-plan-verify-1-1.md`: CONCERNS with 2 gaps. The first was an import cycle that `featureBase` in `status.ts` closed, which crashed the built CLI and turned two `context.test.ts` tests red (TASK 3). The second was that TASK 2's `DONE WHEN` was unmet because "writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers" was left broken.
- `docs/plans/202611/logs/960-build-diffs-count/build-plan-gaps-remediate-1-1-log.md`: PASS, both gaps fixed. `featureBase` and `defaultRange` moved to `.bkit/core/engine/commands/workflow/feature-base.ts` and are re-exported from `context.ts`. The broken test now runs on a `feat/1-x` branch.

## Notes

- Mode: Group. Judged TASKS 1-3 against `build-diff-1-2.md`, which holds the changes since the group started. The brief has no `Deviations` section. No decision records and no `build-plan-current.md` exist.
- Tests run (each file named): `context.test.ts`, `challenge.test.ts`, `branches.test.ts`, `status.test.ts`, `tasks.test.ts` and `feature-base.test.ts` under `.bkit/core/engine/commands/workflow/`, plus `.bkit/core/engine/commands/conventions.test.ts`. 7 files and 559 tests passed, 0 failed. All ten `TEST FIRST` tests pass.
- Both gaps from attempt 1 are closed. `node dist/cli.js steps done --help` exits 0 with no `ReferenceError`. `node dist/cli.js branches scan-diff --paths='^\.bkit/core/engine/'` runs with no `--base` and exits 0, listing only this branch's engine files.
- TASK 1 is satisfied. `featureBase` is defined in `feature-base.ts`. `context.ts` re-exports it, so the task's CREATE in `context.ts` holds: the move was the fix that attempt 1's gap asked for, to break the import cycle. `DIFF_BASE` is gone from `context.ts`. `tasks.ts` keeps `origin/dev` as its own local `DIFF_BASE` constant, and `tasks.test.ts` is green. The six `featureBase` tests pass.
- TASK 2 is satisfied. `context diff`, `challenge gate` and `scan-diff` each default to `defaultRange` when `--base` is absent. `--base` is no longer required on `scan-diff`. An explicit `--base` keeps `{base}...HEAD`. The three new tests pass. No existing test that passes `--base` was edited, and they are all green. The setup edits to the existing no-`--base` tests in `context.test.ts` (:1378, :1471, :1489) and `challenge.test.ts` (:855, :926) only add a `git checkout -q -b feat/1-x` line. These are the fixes for tests the task broke, and no assertion was removed. The `diffNumstat` UPDATE is done through `defaultRange`, which hands `{sha}..HEAD` to an unchanged `diffNumstat`. When the feature base is the `origin/dev` meeting point, `defaultRange` returns `origin/dev...HEAD`, which measures the same range. Neither is a gap.
- TASK 3 is satisfied. `cleanBase` in `status.ts` returns `featureBase(cwd)` both when there is no clean round and when the clean round's `parentSha` is not an ancestor of HEAD. The new test and the existing `cleanBase` tests in `status.test.ts` pass.
- Test-first audit (`build-tests-green-1-2.md`): Enforced true, Unproven 0, and no `Updated tests` or `Already landed` sections. Its one gap, TASK 1 `delete-still-referenced` (`DIFF_BASE`), is no gap. In engine code the only hits are the local constant in `tasks.ts` that the plan asks for. The rest are the `{DIFF_BASE}` placeholder in the `/bkit-debug` workflow, its mirrors and snapshots, and the `workflow-shape.test.ts` checks of that placeholder. That placeholder is a different thing with the same name, and Group 2 TASK 6 owns it.
- Every Derived Test Matrix row for tasks 1-3 is named in that task's `DONE WHEN` and its test passes. The rows for tasks 4 and 6 belong to Group 2.
- Observation, not a gap: the remediation added `feature-base.test.ts`, two unit tests that do not come from a Derived Test Matrix row. They test the moved helper and do not replace any planned test.
- Observation, not a gap: the remediation updated the `scan-diff` row in `.bkit/core/.bkit/cli.md`, but the installed copy in `.bkit/cli.md:92` still shows `--base` as required. Per `.agents/rules.md` § Install to mirror, the upgrade that refreshes it runs once at the end of the session. No task's `DONE WHEN` covers it.
- Observation carried from attempt 1: `cleanBase` calls `featureBase(cwd)` with no log callback, so on the holistic path the conflict fallback line is dropped. The plan does not require a log there.
- `docs/testing.md` and `docs/observability.md` are present. The `.agents/docs.md` index was loaded.

## Identified Gaps Log

None
