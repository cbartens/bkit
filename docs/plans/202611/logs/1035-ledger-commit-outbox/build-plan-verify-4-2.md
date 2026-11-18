Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7, 8
Loosened: none
Fingerprint: 32b890d148c6b1f403ec97a9e9d6f687deea8432e08db46b72d12817efab3ed5
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-4-1.md`: `CONCERNS`, 1 gap (TASK 8, the `onlyBookkeeping` handler let `--month=*` through). `build-plan-gaps-remediate-4-1-log.md` reports it fixed.

## Notes

- Judged against `build-diff-4-2.md` (`.bkit/core/engine/commands/workflow/ledgers.ts`, `ledgers.test.ts`, `dist/commands/workflow/ledgers.js`, plus the generated graph counts in `DETAILS.md` and `docs/capabilities.md`).
- Attempt 1 gap closed: the `onlyBookkeeping` handler calls `monthAndFid(ctx)` again (`ledgers.ts:2445`, `dist/commands/workflow/ledgers.js:1982`), so it does not appear in the group diff. The new test `only-bookkeeping refuses --month=* from the command line` covers it. A repro on `dist/cli.js` in a scratch repo gives exit 2 for `--month=*` and `--month=2026`, and exit 0 for `--month=202610`.
- Test run: `pnpm exec vitest run` on `ledgers.test.ts`, `runs.test.ts`, `workflows.test.ts`, `branches.test.ts`, `decisions.test.ts` and `ci/ci.test.ts` passed: 6 files, 990 tests. This includes the three group 4 `TEST FIRST` tests, the new `--month=*` test and the issue-less FID cases.
- Test-first audit `build-tests-green-4-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. All three planned tests went red, then green. It has no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- TASK 7 is satisfied. Deleted tracked `*.bkit-lock` paths go into `removedLocks`, which never reaches `ownSet`. Recorded paths are filtered out of it, and it is appended to `paths` only after that filtering.
- TASK 8 is satisfied. `checkMonthFid` is split out of `monthAndFid` with no second pattern. `commitBookkeeping` (`ledgers.ts:1217`) and `checkOnlyBookkeeping` (`ledgers.ts:2393`) call it first. Only `checkOnlyBookkeeping` exempts `month` = `*`. The `commit` handler's `monthAndFid` call is removed because `commitBookkeeping` refuses the same input. The `onlyBookkeeping` handler keeps its call because the shared function lets `*` through. The `monthAndFid` comment matches the new behaviour. No caller source file was edited.
- `bkit runs gate --validated --month=*` still reaches the `*` exemption through `runs.ts:1282`. The base commit behaved the same way, and closing it needs a `runs.ts` edit that the DONE WHEN keeps out of the footprint. It is reported here for the owner and not logged as a gap.
- Decision records: `build-decision-1-1.md` (group 3 verify loop, Fix now) and `build-decision-1-2.md` (challenge, task 8 direction (a), taken as the orchestrator's assumption, not the owner's decision).
- Derived Test Matrix rows for group 4 are each in a group 4 task's `TEST FIRST`. Group 4 has no `Documentation Updates` row. `docs/testing.md:837` and `docs/security.md` still describe the check correctly. The change adds no new error path that `docs/observability.md` covers: the refusals are `CommandError` exits, as the existing check already threw.

## Identified Gaps Log

None
