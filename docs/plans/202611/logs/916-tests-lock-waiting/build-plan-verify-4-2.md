Verdict: FAIL
Failures: 2
Fixable: true
Tasks: 12, 13
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

- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-1.md` — CONCERNS, Tasks 12, 13; one gap on the TASK 11 race test counting the waiting note as a refusal.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-1-log.md` — FAIL, Fixed 0; blocked because only the tests step may rewrite a planned test.
- `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-1.md` — owner chose "Fix now — B", which added TASK 14.

## Notes

- Mode: Group. Judged against `build-diff-4-2.md` (changes since the group started). Neither brief has a `Deviations` section.
- Decision record `build-decision-1-1.md` is `Decision: Fix now — B`, not an accept, so it accepts no gap.
- TASK 11: code part met (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:302` `mkdir($queue) || -d $queue`; a regular file still fails `-d`, covered by `run exits 73 naming the queue folder when it cannot be created` at `machine-lock.integration.test.ts:1370`, green; `cmp` shows `scripts/ci/bkit-machine-lock.sh` byte-identical). Left off `Tasks` for its audit gap: its planned test is gone (replaced by TASK 14), and the plan still names it.
- TASK 12: wait-time handler sets TERM always and INT / HUP only when not inherited as `IGNORE`, in template and `scripts/ci/` copy; its test was red, now passes (68 of 68 in `build-tests-green-4-2.md`). Plan already shows `[x]`.
- TASK 13: `IS_CODEX_HOOK` also tests `process.argv[1]` in `.bkit/core/hooks/guardrails-tiers.js`; `.codex/`, `.cursor/` and `.agents/plugins/bkit/` hook copies carry it and the `.bkit/version` hashes are updated; its test was red, now passes. Plan already shows `[x]`.
- TASK 14: the replacement test exists, the old name is gone from the test file (`grep -c` 0), the filter `/^exit=(?!0\n)|cannot create|File exists/` ignores the "in line" note, it forks 16 takes from one shell over 50 folders, and it passes on the fixed script (99.8 s). It is left off `Tasks` because it fails on the start commit only intermittently (gap logged, `Fixable: false`). Repro scripts: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/54e192ef-7375-468c-a9f1-1d5778a8f9db/scratchpad/race916/burst.sh` and `burst-barrier.sh`.
- Test-first audit (`build-tests-green-4-2.md`): `Enforced: true`. Gap TASK 11 `not-green`, engine `Fixable: true`, kept.
- Unproven: TASK 11 `runs that take a lock at once on a fresh cache never refuse over the queue folder` — left `missing`; the owner answers it at the end of the build.
- Already landed: TASK 14 `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` — tests step's reason: "TASK 11 fix (mkdir || -d) is already in the template, so 16 takes x 50 folders all exit 0; no red is due". The red check run here is what found the TASK 14 gap.
- No `Updated tests` section, so no test-loosened check.
- Out of scope for this group (carried from attempt 1): `build-plan-tasks-4-log.md` BLOCKED `bkit:gate:static` on slop `defensive.error-obscuring` at `tests-jump.ts:23,34` and `tests-lock.integration.test.ts:493` (group 3 files, not in this diff); the next holistic pass should check them.
- Docs: `.agents/docs.md` loaded; `docs/testing.md` and `docs/observability.md` present. Group 4 adds no error-logging paths and has no `Documentation Updates` rows.

## Identified Gaps Log

Gaps: 2

- TASK 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — not-green: the test no longer exists, because TASK 14 replaced it by design with `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`. The code part of TASK 11 is met (`mkdir($queue) || -d $queue` at `.bkit/templates/scripts/ci/bkit-machine-lock.sh:302`, `scripts/ci/` copy byte-identical, `run exits 73 naming the queue folder when it cannot be created` still green). The plan's TASK 11 `TEST FIRST` (plan line 777) and `Derived Test Matrix` row (plan line 159) still name the deleted test, so the audit keeps reporting it; the gap closes once the plan names the TASK 14 test for TASK 11 — Fixable: true
- TASK 14: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` — DONE WHEN clause "fails on the group's start commit `e929f8d63`" is met only some of the time. The test's exact burst (16 takes forked from one shell, 50 fresh `XDG_CACHE_HOME` folders, stderr filter for "cannot create" / "File exists" plus non-zero exit) run three times against `git show e929f8d63:.bkit/templates/scripts/ci/bkit-machine-lock.sh` gave one refusal in one run (`round 18 take 2 exit 73: … cannot create …/tests.queue: File exists`) and none in the other two; a variant that holds all 16 takes behind a start file also gave none. The tests step never recorded a red (audit `passed-accepted`). So the guard catches the race coming back in roughly one run of three. Making it reliably red needs a choice the plan does not make: raise the take or round counts beyond the 16 x 50 the DONE WHEN fixes (the test already takes ~100 s), add a test seam to the lock script beyond TASK 11, or accept an intermittent guard — Fixable: false
