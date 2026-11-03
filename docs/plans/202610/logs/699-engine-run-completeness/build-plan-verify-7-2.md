Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 14

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 7`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-7-1.md` (FAIL, 3 gaps: TASK 13 no-red `Fixable: false`, TASK 13 not-green `Fixable: true`, TASK 14 replay paragraph `Fixable: true`). `build-plan-gaps-remediate-7-1-log.md` fixed gaps 2 and 3 and left gap 1 to the owner.

## Notes

- Judged against `build-diff-7-2.md` (group 7 changes plus the remediation: `scripts/ci/test-file.sh`, `package.json` `bkit:test:file`, `docs/testing.md`). `build-plan-current.md`: PASS, Affected 0. No `build-decision-*` record covers group 7: records 1-1 … 1-6 are groups 1-6.
- Test-first audit (`build-tests-green-7-2.md`, Enforced: true, 1 gap). The `no-red` gap on TASK 13 arrives `Fixable: false` and stands. The `Broken` + already-landed override does not apply: plan-currency Affected 0, and the execute log has no `already landed` line. The execute log's `red not enforced` line (oxlint finds no `.bats` file) is not a decision record. Only the owner can accept a missing red.
- Gap 2 of attempt 1 (not-green) is resolved. The audit now records green as `passed`. Re-run here: `BKIT_TEST_REPORT=… pnpm bkit:test:file tests/status-holes-sweep-liveness.bats` routes through `scripts/ci/test-file.sh` to `bats --report-formatter junit`, exits 0 and writes a JUnit report with both cases and 0 failures. The vitest route is unchanged: `checks/status-holes.test.ts` gives 55/55 and a 55-testcase report. `shellcheck` is clean on the script, and `docs/testing.md:57` documents the bats routing.
- Gap 3 of attempt 1 (replay procedure) is resolved. `docs/testing.md` § Tier-3 now says `sourceSha` is the sha256 of the markdown text, which matches `checks/status-holes.ts:339`. It says `parentSha` is the commit the run closed on, which matches `commands/workflow/workflows.ts:1082,1215` (HEAD at close). It says `bkit completeness check` reads the current workflows root and takes no markdown path, which matches `commands/workflow/completeness.ts:76` (`getWorkflowsRoot()`, package-relative). Replaying means a scratch worktree at `parentSha`, a build there, then `pnpm bkit completeness check --workflow= --file=`, which is a runnable command.
- TASK 13 DONE WHEN holds in the codebase. `pnpm bkit:audit:status` exits 0 and prints `[bkit-status-holes] sweep: 9 file(s), 4 holey`. The `Check Status Holes` step keeps `|| true`, captures output to `$RUNNER_TEMP/status-holes.txt` and fails only when `grep -qF '[bkit-status-holes] sweep:'` misses. `pnpm bkit:test:bats` passes 34 tests with 0 `not ok`, and ok 33 and ok 34 are the new cases. `actionlint` is clean. TASK 13 is left off `Tasks` only because of the no-red gap.
- TASK 14 DONE WHEN holds, and the attempt-1 replay defect is fixed. `docs/observability.md` lists every seam and check line under registered prefixes. `docs/testing.md` names no ship-only file for the check. `prettier --check` is clean on both docs and on `bkit-ci.yml`.
- Full suite (`pnpm exec vitest run`, run twice): 209/210 files and 8297 tests pass, with 1 skipped. The one failure is a 60 s timeout in `tools/instructions.test.ts` "has no findings". The same test passes in isolation (96/96, 42 s). Machine load average was about 40-47 from parallel agents, so this is load, not a regression from group 7. It is not logged as a gap; the CI lane is the arbiter.
- Derived Test Matrix: the group-7 row maps to TASK 13's DONE WHEN. Documentation Updates rows for `docs/observability.md` and `docs/testing.md` are done.

## Identified Gaps Log

1 gap:

- TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — no-red — Fixable: false
