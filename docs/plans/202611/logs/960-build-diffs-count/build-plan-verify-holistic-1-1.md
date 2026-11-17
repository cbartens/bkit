Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 6f5dd891030a4cef137d51679902af32e20f9c2bc35c43b4622897c34fdd60f1
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 plan groups verified.

## Integration Gaps

0 integration gaps. The groups fit together:

- Group 1's `cleanBase` fallback (`featureBase`) and Group 2's build Step 10 and verify-prompt wording both name the feature's start commit for the first holistic check. The `Test base` this check got, `e0325bd7c`, is `git merge-base HEAD refs/heads/dev`. That commit comes after `git merge-base HEAD origin/dev` (`5cf3981e3`, 14 commits earlier), so it is the value `featureBase` returns.
- Group 2's build Step 16 calls `branches scan-diff --paths=...` with no `--base`. Group 1 made `--base` optional on that verb. A live `node dist/cli.js branches scan-diff --paths='^\.bkit/core/engine/commands/'` with no `--base` exits 0 and lists only this branch's 12 engine files.
- Group 2's debug `{BASE_FLAG}` is empty off `dev`, so `context diff` and `scan-diff` fall back to Group 1's `featureBase`. In place on `dev` it is `--base={startSha}`, which matches the `startSha` contract of `worktrees setup` ("in place on dev (debug) ... absent otherwise").
- `bkit tests changed --base=e0325bd7c... --fallback=bkit:gate:static-unit` exits 0 with verdict PASS through `bkit:gate:changed`: format, typecheck, the related stage (68 files, 3969 passed, 2 skipped) and the named stage (154 files, 8398 passed, 2 skipped).

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 2 gaps (an import cycle from `status.ts`, and TASK 2's broken test). `build-plan-gaps-remediate-1-1-log.md` fixed both.
- `build-plan-verify-1-2.md`: PASS, `Tasks: 1, 2, 3`.
- `build-plan-verify-2-1.md`: CONCERNS, 3 gaps (two stale render baselines, and the build Step 10 row). `build-plan-gaps-remediate-2-1-log.md` fixed all three.
- `build-plan-verify-2-2.md`: PASS, `Tasks: 4, 5, 6`.
- This is the first holistic attempt.

## Notes

- Mode: Holistic, run 1, attempt 1. I judged all six tasks against the full feature diff (`tmp/bkit-diff-960-build-diffs-count.md`) and the current codebase. There are no decision records, no `build-plan-current.md`, and no brief `Deviations` sections.
- TASK 1 is still `[ ]` in the plan, even though `build-plan-verify-1-2.md` named it on `Tasks`. The likely cause is the open `delete-still-referenced` gap with `fixable: null` in `build-tests-green-1-2.md`, which the tick engine would not clear. I decide that gap now: no gap. The remaining `DIFF_BASE` hits are the local `origin/dev` constant in `tasks.ts` (and its `dist` copy), which the plan asks for. Also left: the `not.toContain("DIFF_BASE")` absence check in `workflow-shape.test.ts`, the debug-placeholder mention in `docs/testing.md:821` (a different thing with the same name, logged below as a TASK 6 doc gap), and the dated `floorplan/` snapshot. TASK 1's `DONE WHEN` holds: the six `featureBase` tests pass and `tasks.test.ts` is green.
- TASK 2 is satisfied. `context diff`, `challenge gate` and `scan-diff` use `defaultRange` when `--base` is absent, and an explicit `--base` keeps `{base}...HEAD`. The three new tests and the existing `--base` tests pass.
- TASK 3 is satisfied. `cleanBase` returns `featureBase(cwd)` when there is no clean round and when the round's sha is not an ancestor of HEAD. Its test and the existing `cleanBase` tests pass.
- TASK 4 is satisfied. Its audit test passes, and `node dist/cli.js check` exits 0.
- TASK 5 is satisfied. `git grep -n "origin/dev\.\.\.HEAD" -- '.bkit/**/*.md'` returns nothing. Decision `960-feature-base-start-commit` is in `docs/decisions.jsonl` and names `665-challenge-small-change-threshold`. `bkit check` passes.
- TASK 6 is not named on `Tasks`. Its `DONE WHEN` holds: the audit test passes and `bkit check` reports no drift. But the task rewrote `workflow-shape.test.ts` and left that file's row in `docs/testing.md` describing the removed `{DIFF_BASE}`, so the docs no longer match the code (see the gaps log).
- Test-first audits: `build-tests-green-2-2.md` reports Enforced true, 0 gaps and 0 Unproven. `build-tests-green-1-2.md` has the one null gap decided above. Neither report has an `Unproven`, `Updated tests` or `Already landed` entry.
- Derived Test Matrix: each of the 12 rows is named in the `DONE WHEN` of its task (1, 2, 3, 4 or 6), and every one of those test files ran green in this check. The plan has no `Documentation Updates` section.
- Observability: `featureBase` logs its one conflict-fallback line through the caller's `ctx.log`. `cleanBase` passes no log, so that line is dropped on the holistic path. Earlier rounds noted this, and the plan does not require it. `docs/testing.md` and `docs/observability.md` are present, and the `.agents/docs.md` index was loaded.
- Observation, not a gap: debug Step 2 now holds `startSha` as `START_SHA`, but no later line uses `{START_SHA}`. It is harmless, and the plan did not ask for it to be removed.
- Observation, not a gap: I could not rebuild `dist/` to compare it with the sources (out of mandate, and the command was denied). The built CLI loads and behaves as the sources do on the `scan-diff` default path.

## Identified Gaps Log

1 gap.

TASK 6: `docs/testing.md:821` (the `workflow-shape.test.ts` row) still describes debug on `dev` as "`{DIFF_BASE}` for every diff", but TASK 6 removed `DIFF_BASE` from `bkit-debug.md` and rewrote that test to assert `{BASE_FLAG}` on every `context diff` and `branches scan-diff` line; reword the row to `{BASE_FLAG}` (`--base={startSha}` in place on dev, else empty) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6 left the workflow-shape.test.ts row in docs/testing.md naming the removed {DIFF_BASE}
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/testing.md:821` · **Round:** 1
  - **DONE WHEN:** The workflow-shape.test.ts row in docs/testing.md describes debug on dev with {BASE_FLAG} (--base={startSha} in place on dev, else empty) and no longer contains DIFF_BASE
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
