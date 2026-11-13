Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups: TASKS 1-5, TASK 6, TASKS 7-10, TASKS 11-14).

## Integration Gaps

0 gaps.

Attempt 3's one gap (`pnpm bkit:slop:delta` failing on three error-obscuring catches) is closed: `pnpm bkit:slop:delta` against `af0f02ba0` prints `added 0, resolved 0, worsened 0; net findings 0` and `passed: true`.

Cross-group contracts re-checked, and holding:

- Queue path and file names: the jump verb (TASK 8) reads `<cache>/bkit/machine-lock/tests.queue` and matches `^\d+\.\d{6}-\d+(\.held)?$`. The Perl helper (TASKS 1-4, 7) derives `$stem.queue`, scans the same names plus `^(\d+)\.jump$`, and ignores the verb's dot-prefixed temp file.
- Line format: both sides use `<who> — <checkout>`, so a held place keeps a jumped run's marker alive across a give-up and re-ask (TASK 4 with TASK 7).
- Group 4 on group 1: TASK 11's `mkdir($queue) || -d $queue` (template line 302) keeps the regular-file refusal that TASK 2's exit-73 test and `bkit tests run`'s exit-4 test assert. TASK 12 installs the INT / HUP wait-time handlers only when they are not inherited as `IGNORE` (line 243), and TERM is unchanged.
- Group 4 on group 3: TASK 13's `IS_CODEX_HOOK` tests both `__filename` and `process.argv[1]` in `.bkit/core/hooks/guardrails-tiers.js` and in the `.codex/`, `.cursor/` and `.agents/plugins/bkit/` hook copies.
- Migration (TASK 6) writes the current template, which carries the group 1, 3 and 4 code. `git tag --list 'v6.*'` still ends at `v6.1.1`, so the one hash in `SHIPPED_MACHINE_LOCK_HASHES` is complete.
- The holistic-3 remediation changed `tests-jump.ts` and its `dist/` build together (`dist/commands/workflow/tests-jump.js` carries the same `existsSync` guards), and `node dist/cli.js check` reports `0 write(s) would occur`.
- The queue served this attempt's own gate runs: the waiting notes said `1st in line`, and a give-up followed by a re-ask within 120 s took back the same place (`1st in line` again, one ticket in `tests.queue`).

## Previously Attempted

- `build-plan-verify-holistic-1.md`: CONCERNS, 1 gap (`tests-jump.test.ts` failed the `types` stage); closed by `build-plan-gaps-remediate-holistic-1-log.md`.
- `build-plan-verify-holistic-2.md`: PASS, Tasks 1-10, over the 3 groups the plan had before the challenge round added group 4.
- `build-plan-verify-holistic-3.md`: CONCERNS, 1 gap (`pnpm bkit:slop:delta` failed on three error-obscuring catches in `tests-jump.ts:23`, `tests-jump.ts:34` and `tests-lock.integration.test.ts:493`); `build-plan-gaps-remediate-holistic-3-log.md` (commit `277cb43c6`) replaced them with `fs.existsSync` guards. This attempt re-checks that fix.
- Group reports: `build-plan-verify-1-1.md` to `build-plan-verify-4-3.md`; the last of each group passed, and group 4's two owner decisions are `build-decision-1-1.md` (Fix now, added TASK 14) and `build-decision-1-2.md` (Accept on both questions).

## Notes

- Mode `Holistic`, judged against `tmp/bkit-diff-916-tests-lock-waiting.md` (the full feature diff against merge base `af0f02ba0`; it already carries the holistic-3 remediation). The only code change since attempt 3 is commit `277cb43c6`: three `try` / `catch` blocks replaced by `fs.existsSync` guards in `tests-jump.ts` (`firstLine`, `linesFor`), its `dist/` build, and `tests-lock.integration.test.ts` (`waitForQueued`).
- Docs: `.agents/docs.md` loaded; `docs/testing.md` and `docs/observability.md` are present.
- Test run (`node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit`): it waited about 12 minutes as `1st in line` for the tests lock, then ran `bkit:gate:changed` and exited 1 (`verdict: FAIL`, failed stages `related` and `named`).
  - Every failure was `Test timed out` at 50-55 s, at load averages of 8 to 38 on 10 cores. The failing tests were 3 in `related` and 2 in `named`: `install.integration.test.ts` (`bkit install --tracker=github` alone switches the tracker…), `upgrade.integration.test.ts` (`upgrade restores bkit's edited linear entry…` and `an install with every host and cloud lane creates no template outside .bkit/templates/`) and `tracker.integration.test.ts` (`preserves substantive step results under every comment boundary fault`). None of these three files is in the diff.
  - Every other stage passed. `related`: 3190 of 3193. `named`: 9351 passed and 2 skipped, including `machine-lock.integration.test.ts`, `tests-lock.integration.test.ts`, `core.integration.test.ts` and `index.integration.test.ts`. `node --test`: 53 passed. bats: 16 passed. Prettier and `pnpm typecheck` also passed.
  - A targeted rerun of the three files under the tests lock passed: `Test Files 3 passed (3)`, `Tests 148 passed (148)`. So all five failures were load timeouts, not regressions, and none is logged as a gap. The rerun's first try gave up (exit 75) after 1500 s while `1st in line`, because runs from `.worktrees/922-pre-push-load` and `.worktrees/903-build-owner-s` took the lock ahead of it. Both of those worktrees' lock scripts have no queue (`grep -c '\.queue'` prints 0), which the plan's Edge Cases allow.
- `pnpm bkit:slop:delta` passed (net 0), so the `bkit:gate:static` slop finding attempt 3 logged is closed.
- DONE WHEN checks re-run:
  - `cmp` of the template and `scripts/ci/bkit-machine-lock.sh` exits 0, and `/bin/bash -n` on the template exits 0.
  - The fixture's sha256 is `63ee5873795fd06b60e1f13c238c9e3c44d9f6dc76a50fe271793de6ad284e87`, the one value in `SHIPPED_MACHINE_LOCK_HASHES` (`core.ts:821`).
  - `docs/migrations.md:38` has the "Machine-lock copies without the queue" row.
  - `.bkit/cli.md:376` lists `jump`, and `node dist/cli.js tests jump --help` says each use needs the human's approval.
  - `grep -c "tests jump" .claude/settings.json` prints 3.
  - The source-against-mirror diffs print nothing for § Machine lock, § Permissions, § Long-running shell commands, § Tests lock and `### Codex CLI`.
  - `node dist/cli.js check` reports 0 writes.
- Derived Test Matrix: all 37 named tests exist exactly once in their target files, and each sits in a task's `DONE WHEN`. No `.skip`, `.only`, lint disable or type escape appears in `tests-jump.ts`, `tests-jump.test.ts` or the four test files the matrix names.
- Decision records:
  - TASK 11 is satisfied by `build-decision-1-2.md` Q1 (`Decision: Accept`, the owner's answer), which accepts pointing its `TEST FIRST` at the TASK 14 test.
  - TASK 14 is satisfied by `build-decision-1-2.md` Q2 (`Decision: Accept`, the owner's answer), which accepts that the test fails on `e929f8d63` only some of the time.
  - `build-decision-1-1.md` (Fix now) added TASK 14.
- No test-first audit report was supplied, so step 8 had nothing to decide. The owner still has to answer one Unproven test, carried from `build-plan-verify-4-3.md` and due at the end of the build: TASK 11 `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`.
- Documentation Updates and observability: every row is done, and all eleven decision keys plus the one deferral row are in their ledgers (re-checked in attempts 1 to 3; no doc changed since). The lock notes stay `[machine-lock]` stderr lines, and the give-up line is unchanged.
- Out of scope, for the owner (not gaps; no `DONE WHEN` covers them):
  - The holistic-3 fix left a small check-then-read race: a file can vanish between the check and the read. In `tests-jump.ts`, a ticket a helper unlinks between `existsSync(file)` and `readFileSync` now ends the verb with `Unhandled error: ENOENT` and exit 1, where it was skipped before. The same race in `waitForQueued` (`tests-lock.integration.test.ts:490-495`) could fail a test now and then, while a helper renames its `.<pid>.tmp` file. `fs.readFileSync` inside a `statSync(..., { throwIfNoEntry: false })`-style guard, or reading only names the regex accepts, would narrow it without a catch.
  - A regular file at `tests.queue` now makes `bkit tests jump` print `[bkit-install] Unhandled error: ENOTDIR … scandir` (exit 1, nothing written) instead of `no run named <run> waits for tests`. Probed here with a scratch `XDG_CACHE_HOME`. The friction row the probe appended to `.bkit/friction.jsonl` was removed again, so the file has no change.
  - Carried from earlier attempts: `CODEX_HOOK_RE` also matches a file ending `codex.cjs`, and `migrateMachineLockCopy` checks for a symlink before it checks equality with the template.

## Identified Gaps Log

None

