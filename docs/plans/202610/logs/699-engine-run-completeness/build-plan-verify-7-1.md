Verdict: FAIL
Failures: 3
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 7`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Group 7's work is committed in `21e5c6a7d` (plan-execute group 7 attempt 1); judged against `build-diff-7-1.md` plus the bats file, the fixture and `build-task-red-7-13-1.md`, read directly. `build-plan-current.md`: PASS, Affected 0. No `build-decision-*` record covers group 7 (records 1-1 … 1-6 are groups 1-6), and no `build-plan-gaps-remediate-7-*` log exists.
- Test-first audit (`build-tests-green-7-1.md`, Enforced: true, 2 gaps): `no-red` arrives `Fixable: false` and stands. The `Broken` + already-landed override does not apply (plan-currency Affected 0; no `already landed` log line). The execute log's `red not enforced` reason (`bkit:lint:file` / oxlint finds no `.bats` file, so `bkit tests red` refused) is not a decision record. Only the owner can excuse a missing red. `not-green` arrives `Fixable: true` and stands: the engine ran the file through `bkit:test:file` (vitest), which found no test files. Run under bats here, `pnpm bkit:test:bats` reports 34/34 ok, including both new cases (ok 33, ok 34). The fix is recording green through the bats runner.
- TASK 13 DONE WHEN, checked in the codebase: `pnpm bkit:audit:status` exits 0 on the live corpus and prints `[bkit-status-holes] sweep: 9 file(s), 4 holey`. The `Check Status Holes` step keeps `|| true`, captures to `$RUNNER_TEMP/status-holes.txt` and runs `grep -qF ... || { ...; exit 1; }`. bats case 2 proves the pattern rejects output without the line. `actionlint .github/workflows/bkit-ci.yml` passes. Left off `Tasks` only for the two test-first gaps.
- TASK 14 DONE WHEN met: every stderr / stdout line from `ledgers/journal.ts` (none), `commands/lib.ts:553`, `checks/status-holes.ts` (908-998), `commands/workflow/completeness.ts` and `commands/workflow/workflows.ts:1086,1108` is listed in `docs/observability.md` under registered prefixes (`[bkit-status-holes]`, `[bkit-telemetry]`, `[bkit-workflows]` per the `[bkit-<noun>]` rule), and `docs/testing.md` no longer names `bkit-ship.md` or a ship-only file for the check. No code emits a `journalSuspect` heartbeat line, so the doc describes the field instead, which is correct. Left off `Tasks` because the task's own UPDATE field (the `sourceSha` replay procedure "so a reader has the command") ships a command that cannot run; see gap 3.
- Checks run: `pnpm exec vitest run` over `audits/repo`, `audits/templates`, `checks` and `tools/instructions.test.ts`: 62 files, 2145 tests passed. `prettier --check` is clean on `docs/observability.md`, `docs/testing.md` and `.github/workflows/bkit-ci.yml`. Derived Test Matrix row (plan line 180) maps to TASK 13's DONE WHEN. Documentation Updates rows for `docs/observability.md` and `docs/testing.md` are done except for the replay paragraph.

## Identified Gaps Log

3 gaps:

- TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — no-red — Fixable: false
- TASK 13: `tests/status-holes-sweep-liveness.bats` `the sweep prints the summary line the lane greps for` — not-green — Fixable: true
- TASK 14: `docs/testing.md` § Tier-3 fail-open advisory channel replay paragraph is wrong — it calls `sourceSha` "the commit whose workflow markdown produced it" and sets `{parentSha}` = the row's `sourceSha`, but `sourceSha` is the sha256 of the markdown text (`checks/status-holes.ts:339`) and the commit is the row's own `parentSha` (`commands/workflow/workflows.ts:1082`), so `git show {sourceSha}:{workflowMd}` fails; and `bkit completeness check` takes no markdown path (it always reads `getWorkflowsRoot()`), so "against that markdown" is not a runnable command — Fixable: true
