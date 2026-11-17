Verdict: PASS
Failures: 0
Fixable: false
Tasks: 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-1.md` — CONCERNS, Tasks 12, 13; one gap: the TASK 11 race test counted the waiting note as a refusal.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-1-log.md` — FAIL, Fixed 0; only the tests step may rewrite a planned test.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-1.md` — owner chose "Fix now — B", which added TASK 14.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-2.md` — FAIL, Tasks 12, 13; gaps: TASK 11 named the deleted test (Fixable: true), TASK 14 red on `e929f8d63` only about 1 run in 3 (Fixable: false).
- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-2-log.md` — CONCERNS, Fixed 1; TASK 11 `TEST FIRST` and the `Derived Test Matrix` row now name the TASK 14 test.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-2.md` — owner accepted both attempt-2 gaps.

## Notes

- Mode: Group. Judged against `build-diff-4-3.md` (changes since the group started). Neither brief has a `Deviations` section.
- TASK 11: met. `.bkit/templates/scripts/ci/bkit-machine-lock.sh:302` reads `unless (mkdir($queue) || -d $queue)`; a regular file at the path still fails `-d`, covered by `run exits 73 naming the queue folder when it cannot be created` (`machine-lock.integration.test.ts:1370`). `cmp` shows `scripts/ci/bkit-machine-lock.sh` byte-identical to the template. Its `TEST FIRST` (plan line 776) and matrix row (plan line 159, tasks `11, 14`) now name `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`, which passed in `build-tests-green-4-3.md`. Decision record `build-decision-1-2.md` Q1 (`Decision: Accept`, the owner's answer; ledger key `916-task11-test-first-points-at-task14-test`) accepts this repointing.
- TASK 12: met. The wait-time handler sets TERM always and INT / HUP only when the inherited disposition is not `IGNORE` (template line 243, `scripts/ci/` copy identical); its test was red and now passes. Plan already shows `[x]`.
- TASK 13: met. `IS_CODEX_HOOK` also tests `process.argv[1]` in `.bkit/core/hooks/guardrails-tiers.js`; `.codex/`, `.cursor/` and `.agents/plugins/bkit/` hook copies carry `HOOK_INVOKED`, `.bkit/version` hashes updated; `.claude/hooks/bkit-guardrails.cjs` has no `IS_CODEX_HOOK`, so it needs no re-render. Its test was red and now passes. Plan already shows `[x]`.
- TASK 14: met. The replacement test exists at `machine-lock.integration.test.ts:1563`, the old name is gone from the file, the filter `/^exit=(?!0\n)|cannot create|File exists/` ignores the "in line" note, it forks 16 takes from one shell over 50 fresh `XDG_CACHE_HOME` folders, and it passes. The "fails on `e929f8d63`" clause holds only intermittently; decision record `build-decision-1-2.md` Q2 (`Decision: Accept`, the owner's answer; ledger key `916-queue-race-test-intermittent-guard`) accepts it as an intermittent guard, so no gap.
- Test-first audit (`build-tests-green-4-3.md`): `Enforced: true`, `Gaps: 0`.
- Unproven: TASK 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` — no red recorded for TASK 11; the owner answers it once at the end of the build.
- Already landed: TASK 14 `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` — tests step's reason: "TASK 11 fix (mkdir || -d) is already in the template, so 16 takes x 50 folders all exit 0; no red is due".
- No `Updated tests` section, so no test-loosened check.
- Out of scope for this group (carried from attempts 1 and 2): `build-plan-tasks-4-log.md` BLOCKED `bkit:gate:static` on slop `defensive.error-obscuring` at `tests-jump.ts:23,34` and `tests-lock.integration.test.ts:493` (group 3 files, not in this diff); the next holistic pass should check them.
- Docs: `.agents/docs.md` loaded; `docs/testing.md` and `docs/observability.md` present. Group 4 adds no error-logging paths, and no `Documentation Updates` row belongs to it.

## Identified Gaps Log

None
