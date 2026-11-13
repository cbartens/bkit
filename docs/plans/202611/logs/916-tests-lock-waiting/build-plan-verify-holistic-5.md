Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups: TASKS 1-5, TASK 6, TASKS 7-10, TASKS 11-14, TASK 15).

## Integration Gaps

0 gaps.

Cross-group contracts re-checked, and holding:

- Group 5 on groups 3 and 4: TASK 15 pulls the jump regex into `TESTS_JUMP_RE` (`.bkit/core/hooks/guardrails-tiers.js:170`). `ASK_PATTERNS` (TASK 9) and the Codex deny branch in `classifyShell` (`guardrails-tiers.js:294`) both use it. The deny branch still keys on `IS_CODEX_HOOK`, which TASK 13 set up for symlinked `.codex` folders. All three rendered hooks (`.codex/`, `.cursor/`, `.agents/plugins/bkit/`) carry the change. `.bkit/version` holds the new hashes, and `node dist/cli.js check` reports `0 write(s) would occur`.
- Probed through the rendered hooks:
  - The Codex hook denies all three of `gh pr close 999999; bkit tests jump build-1`, `sudo -n true; bkit tests jump build-1` and a plain `bkit tests jump build-1`.
  - The Codex hook still gives the advisory for `gh pr close 1`, and says nothing for `bkit tests run`.
  - The Cursor hook answers `permission: "ask"` for the compound jump command.
- Queue path, file names and the `<who> — <checkout>` line format are shared by the jump verb (TASK 8) and the Perl helper (TASKS 1-4, 7). Neither changed since attempt 4.
- Migration (TASK 6): it writes the current template. `git tag --list 'v6.*'` still ends at `v6.1.1`, so `SHIPPED_MACHINE_LOCK_HASHES` (`core.ts:822`) is complete.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 (`verdict: PASS`, "every stage passed"):
  - related: `Test Files 66 passed`, `Tests 3194 passed`.
  - named: `Test Files 228 passed`, `Tests 9354 passed | 2 skipped`.
  - `node --test`: 53 passed. bats: 16 passed. prettier: passed.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: CONCERNS, 1 gap (`tests-jump.test.ts` failed the `types` stage); closed by `build-plan-gaps-remediate-holistic-1-log.md`.
- `build-plan-verify-holistic-2.md`: PASS, Tasks 1-10, over the 3 groups the plan had then.
- `build-plan-verify-holistic-3.md`: CONCERNS, 1 gap (`pnpm bkit:slop:delta`, three error-obscuring catches); closed by `build-plan-gaps-remediate-holistic-3-log.md`.
- `build-plan-verify-holistic-4.md`: PASS, Tasks 1-14, over the 4 groups the plan had before challenge round 2 added group 5 (TASK 15).
- Group reports: `build-plan-verify-1-1.md` to `build-plan-verify-5-1.md`; the last report of each group passed. `build-plan-verify-5-1.md` passed TASK 15.

## Notes

- Mode `Holistic`, judged against `tmp/bkit-diff-916-tests-lock-waiting.md` (the full feature diff against merge base `af0f02ba0`). Since attempt 4 (`112ec6adb`), the only code change is group 5's TASK 15. It touched `guardrails-tiers.js`, the three rendered guardrails hooks, `.bkit/version` and one new test in `index.integration.test.ts`. Challenge round 2 also added three LOW `docs/deferrals.jsonl` rows. Those rows are not task work, so they neither satisfy nor block any task.
- Docs: `.agents/docs.md` loaded. `docs/testing.md` and `docs/observability.md` are present.
- Test run: the first `tests changed` gave up (exit 81) after 1200 s while `1st in line`. A run from `.worktrees/915-min-push-ignores` held the tests lock for the whole wait. The re-run then waited behind a run from `.worktrees/918-ad-hoc-agent` before it got the lock and passed. That run took the lock while this run was first in line. Both of those worktrees' `scripts/ci/bkit-machine-lock.sh` have no queue (`grep -c '\.queue'` prints 0), which the plan's mixed-version edge case allows. No failure was logged as a gap.
- `pnpm bkit:slop:delta` against `af0f02ba0`: added 0, resolved 0, worsened 0, `netFindingCount: 0`.
- DONE WHEN checks re-run:
  - `cmp` of the template and `scripts/ci/bkit-machine-lock.sh` exits 0, and `/bin/bash -n` on the template exits 0.
  - The fixture's sha256 is `63ee5873795fd06b60e1f13c238c9e3c44d9f6dc76a50fe271793de6ad284e87`, the one value in `SHIPPED_MACHINE_LOCK_HASHES`.
  - `docs/migrations.md:38` has the "Machine-lock copies without the queue" row.
  - `.bkit/cli.md:376` lists `jump`.
  - `grep -c "tests jump" .claude/settings.json` prints 3.
  - The source-against-mirror diffs print nothing for § Machine lock, § Permissions, § Long-running shell commands, § Tests lock and `### Codex CLI`.
  - `node dist/cli.js check` reports 0 writes.
- Derived Test Matrix: all 35 `TEST FIRST` tests across TASKS 1-15 exist exactly once in their target files, and each sits in its task's `DONE WHEN` or `TEST FIRST`. The matrix's other rows are existing tests kept green: the give-up exit 81, the `CI` no-op, the dogfood identical check and `cli-doc`. No `.skip`, `.only`, lint disable or type escape appears in the group 5 files.
- Decision records:
  - TASK 11 is satisfied by `build-decision-1-2.md` Q1 (`Decision: Accept`, the owner's answer).
  - TASK 14 is satisfied by `build-decision-1-2.md` Q2 (`Decision: Accept`, the owner's answer).
  - `build-decision-1-1.md` (Fix now) added TASK 14.
- No test-first audit report was supplied, so step 8 had nothing to decide. Group 5's audit (`build-tests-green-5-1.md`) was `Enforced: true`, `Gaps: 0`, `Unproven: 0`. One Unproven test from `build-plan-verify-4-3.md` is still due for the owner at the end of the build: TASK 11 `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`.
- Documentation Updates and observability: every row is done (re-checked in attempts 1-4; group 5 changed no doc). The lock notes stay `[machine-lock]` stderr lines, and the give-up line is unchanged.
- Out of scope, for the owner (not gaps; no `DONE WHEN` covers them):
  - In `guardrails-tiers.js:168-170`, the `/** Ask tier, non-git — destructive or privileged shell. */` comment now sits above `TESTS_JUMP_RE` instead of `ASK_PATTERNS`. This is cosmetic.
  - Under Codex, `TESTS_JUMP_RE` also matches the jump text inside a quoted argument (for example `echo "bkit tests jump x"`), so such a command is denied. It errs toward the human-approval rule.
  - Carried from attempt 4: the check-then-read race and the `ENOTDIR` crash in `tests-jump.ts` (the latter is now deferral `916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-30`), `CODEX_HOOK_RE` matching a file ending `codex.cjs`, and `migrateMachineLockCopy` checking for a symlink before it checks equality with the template.

## Identified Gaps Log

None

