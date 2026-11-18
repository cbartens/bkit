Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 7
Loosened: none
Fingerprint: 0b0366de83baca68f7cefe6f30febe5b20ca7c91433076c78bed4e02c3990fa0
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-4-1.md` (changes to `.bkit/core/engine/commands/workflow/ledgers.ts`, `ledgers.test.ts` and `dist/commands/workflow/ledgers.js`). The engine tree matches HEAD `ef41ab731`.
- Test run: `pnpm exec vitest run` on `ledgers.test.ts`, `runs.test.ts`, `workflows.test.ts`, `branches.test.ts`, `ci/ci.test.ts` and `decisions.test.ts` passed: 6 files, 989 tests, including the three group 4 `TEST FIRST` tests and the issue-less FID cases.
- Test-first audit `build-tests-green-4-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. All three planned tests went red, then green. It has no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- TASK 7 is satisfied. Deleted tracked `*.bkit-lock` paths are collected in `removedLocks`, so they never enter the `paths` list handed to `ownSet`. Recorded paths are filtered out of them, and they are appended only after that filtering. The planned test passes.
- TASK 8 is not satisfied (one gap, below). `checkMonthFid` was split out of `monthAndFid` and is called first in `commitBookkeeping` and `checkOnlyBookkeeping`. No second pattern was added. The `*` exemption is only in `checkOnlyBookkeeping`. `ci.ts` `FEAT_BRANCH` captures the same shape as `FID_PATTERNS.none`, so the CI hook still passes. Every caller in `runs.ts`, `workflows.ts` and `branches.ts` now gets the check without a source edit, and the footprint stays `ledgers.ts`, `ledgers.test.ts` and `dist/`. The `commit` handler's `monthAndFid` removal is correct, because `commitBookkeeping` gives it the same refusal. The `onlyBookkeeping` handler's removal is not.
- `required(ctx, "month")` / `required(ctx, "fid")` are back in the `commit` and `onlyBookkeeping` handlers, which goes against TASK 1's DONE WHEN wording. TASK 8's direction (decision 2, `build-decision-1-2.md`) supersedes that wording, and the reads are now checked in the shared functions, so this is not a gap.
- `bkit runs gate --validated --month=*` also reaches the `*` exemption through `runs.ts:1282`. It did the same at the base commit, so it is not a regression of this build. Closing it would need a `runs.ts` edit, which the DONE WHEN keeps out of the footprint. This is reported for the owner here and not logged as a gap.
- Decision records: `build-decision-1-1.md` (group 3 verify loop, Fix now) and `build-decision-1-2.md` (challenge, task 8 direction (a), taken as the orchestrator's assumption, not the owner's decision).
- Derived Test Matrix rows 64-66 are each in a group 4 task's `TEST FIRST`. No group 4 `Documentation Updates` row exists. The `docs/testing.md:837` row and `docs/security.md` still describe the check correctly.

## Identified Gaps Log

1 gap.

TASK 8: `ledgers.ts:2445` the `onlyBookkeeping` handler dropped its `monthAndFid(ctx)` call although the shared `checkOnlyBookkeeping` lets `month` = `*` through, so it does not get the same refusal: `bkit ledgers only-bookkeeping --month=* --fid=650-x` now exits 0 (repro on `dist/cli.js` in a scratch repo; `--month=2026` still exits 2), against the DONE WHEN bullet "Where a `ledgers` handler this build changed now gets the same refusal from the shared function, remove its own `monthAndFid` call" and the plan Success Criterion that `only-bookkeeping` exits 2 on a month that is not six digits; fix: keep `monthAndFid(ctx)` in the `onlyBookkeeping` handler and add a `--month=*` case to its describe — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** only-bookkeeping --month=* passes: the handler dropped monthAndFid but checkOnlyBookkeeping exempts *
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:2445` · **Round:** 1
  - **DONE WHEN:** Where a `ledgers` handler this build changed now gets the same refusal from the shared function, remove its own `monthAndFid` call. Keep a per-handler call only where the handler builds a path from `--month` or `--fid` before it reaches the shared function.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/ledgers.test.ts
<!-- bkit:task 1 end -->
