Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups: TASKS 1-5, TASK 6, TASKS 7-10, TASKS 11-14).

## Integration Gaps

1 gap.

- The `bkit:gate:static` gate (part of the `bkit:gate:static-unit` fallback) fails at `pnpm bkit:slop:delta`. Three error-obscuring catch blocks from group 3 TASK 8 are net-new against `af0f02ba0`: `tests-jump.ts:23` (`firstLine`), `tests-jump.ts:34` (`linesFor`) and `tests-lock.integration.test.ts:493` (`waitForQueued`). Group 4 logged the failure BLOCKED as outside its scope, and no later step fixed it. The fix is mechanical: replace each catch with an existence guard and keep the verb's "no queue folder → exit 1" behaviour.

Cross-group contracts re-checked, and holding:

- Queue path and file names: the jump verb (TASK 8) reads `<cache>/bkit/machine-lock/tests.queue` and matches `^\d+\.\d{6}-\d+(\.held)?$`. The Perl helper (TASKS 1-4, 7) derives `$stem.queue`, scans the same names plus `^(\d+)\.jump$`, and ignores the verb's dot-prefixed temp file.
- Group 4 on group 1: TASK 11's `mkdir($queue) || -d $queue` keeps the regular-file refusal that TASK 2's exit-73 test and `bkit tests run`'s exit-4 test assert. TASK 12 installs the INT / HUP wait-time handlers only when they are not inherited as `IGNORE`, and keeps TERM, so TASK 2's SIGTERM test and the post-acquire handler are unchanged.
- Group 4 on group 3: TASK 13's `IS_CODEX_HOOK` reads `__filename` and `process.argv[1]`. It is present in `.bkit/core/hooks/guardrails-tiers.js` and the `.codex/`, `.cursor/` and `.agents/plugins/bkit/` hook copies, and TASK 9's ask rows still pass.
- Migration (TASK 6) writes the current template, which carries the group 1, 3 and 4 code. `git tag --list 'v6.*'` still ends at `v6.1.1`, so the one hash in `SHIPPED_MACHINE_LOCK_HASHES` is complete.
- `node dist/cli.js check` reports `0 write(s) would occur`.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: CONCERNS, 1 gap (`tests-jump.test.ts` failed the `types` stage); closed by `build-plan-gaps-remediate-holistic-1-log.md` (commit `ccdc248d1`).
- `build-plan-verify-holistic-2.md`: PASS, Tasks 1-10, over the 3 groups the plan had before the challenge round added group 4.
- Group 4 reports: `build-plan-verify-4-1.md` CONCERNS (TASK 11 race test counted the waiting note as a refusal), `build-plan-gaps-remediate-4-1-log.md` FAIL (only the tests step may rewrite a planned test), `build-decision-1-1.md` Fix now (added TASK 14), `build-plan-verify-4-2.md` FAIL (TASK 11 named the deleted test; TASK 14 red on `e929f8d63` only about 1 run in 3), `build-plan-gaps-remediate-4-2-log.md` CONCERNS (plan repointed), `build-decision-1-2.md` Accept on both, `build-plan-verify-4-3.md` PASS, Tasks 11-14.
- Every group report from attempts 4-1 to 4-3 carried the BLOCKED `bkit:gate:static` slop finding from `build-plan-tasks-4-log.md` forward for this holistic pass.

## Notes

- Mode `Holistic`. Judged against `tmp/bkit-diff-916-tests-lock-waiting.md`, the full feature diff against merge base `af0f02ba0`.
- Test run (`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`):
  - Runs 1 to 3 exited 81 on the tests lock. Each run was "1st in line", but runs from `.worktrees/922-pre-push-load` and a consumer worktree took the lock ahead of it. The `922-pre-push-load` lock script has no queue (`grep -c '\.queue'` prints 0). The plan's Edge Cases allow this: a copy without the queue may still take the lock ahead of queued runs.
  - Run 4 ran and exited 1 at the `related` stage. Two tests timed out under load (load average 8.2 on 10 cores): the `beforeAll` hook of `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` at 21 s, and `upgrade.integration.test.ts` `check flags an old marker; upgrade restamps every marker with no conflict; check is then clean` at 38 s. Neither file is in the diff.
  - A targeted rerun of those two files under the tests lock passed: 81 of 81 tests in 198 s. So both were load timeouts, not regressions, and are not logged as gaps.
  - Every other stage passed in run 4: `named` (228 files, 9353 passed, 2 skipped), `node --test` (53 passed), bats (13 passed), oxlint, prettier and `pnpm typecheck`. `named` includes `machine-lock.integration.test.ts`, which holds the TASK 11 / 14 race test and the TASK 12 SIGHUP test.
- `bkit:gate:changed` has no slop stage, so the gap above came from a separate `pnpm bkit:slop:delta` run (exit 1).
- DONE WHEN checks re-run:
  - `cmp` of the template and `scripts/ci/bkit-machine-lock.sh` exits 0, and `/bin/bash -n` on the template exits 0.
  - The fixture's sha256 is `63ee5873795fd06b...`, the value in `SHIPPED_MACHINE_LOCK_HASHES`.
  - `docs/migrations.md` has the "Machine-lock copies without the queue" row, and `.bkit/cli.md` lists `jump`. `node dist/cli.js tests jump --help` says each use needs the human's approval.
  - `grep -c "tests jump" .claude/settings.json` prints 3.
  - Source-against-mirror diffs print nothing for § Machine lock, § Permissions, § Long-running shell commands, `### Codex CLI` and § Tests lock.
- Derived Test Matrix: all 37 named tests exist once each in their target files. The old TASK 11 test name is gone. No `.skip`, `.only`, lint disable or type escape appears in the five test files.
- TASK 11: met. Decision record `build-decision-1-2.md` Q1 (`Decision: Accept`, the owner's answer) accepts pointing its `TEST FIRST` at the TASK 14 test.
- TASK 14: met. Decision record `build-decision-1-2.md` Q2 (`Decision: Accept`, the owner's answer) accepts that the test fails on `e929f8d63` only some of the time.
- The plan still shows TASKS 11 and 14 as `[ ]`, although `build-plan-verify-4-3.md` passed them. The workflow ticks the plan from the `Tasks` line above.
- No test-first audit report was supplied to this attempt, so step 8 had nothing to decide. The owner still has to answer one Unproven test, carried from `build-plan-verify-4-3.md` and due at the end of the build: TASK 11 `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal`.
- Docs: `.agents/docs.md` loaded; `docs/testing.md` and `docs/observability.md` are present. Every `Documentation Updates` row is done, and all eleven decision keys plus the one deferral row are in their ledgers.
- Out of scope, carried for the owner: `CODEX_HOOK_RE` also matches a file ending `codex.cjs`, and `migrateMachineLockCopy` checks for a symlink before it checks equality with the template.

## Identified Gaps Log

Gaps: 1

- INTEGRATION: `bkit:gate:static` (inside the `bkit:gate:static-unit` fallback) fails at its `pnpm bkit:slop:delta` stage on three net-new `defensive.error-obscuring` findings from group 3 TASK 8 (and its tests): `.bkit/core/engine/commands/workflow/tests-jump.ts:23` (`firstLine` catch returns null), `.bkit/core/engine/commands/workflow/tests-jump.ts:34` (`linesFor` catch returns []) and `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:493` (`waitForQueued` catch returns false); `bkit ci slop` vs `af0f02ba0` prints `added 3 ... FAIL — change adds/worsens slop on net`. Group 4 logged it BLOCKED (`build-plan-tasks-4-log.md`) as out of its scope; no group fixed it. Fix in place without empty catches, e.g. an `fs.existsSync` / `statSync({ throwIfNoEntry: false })` guard as `build-plan-gaps-remediate-1-1-log.md` did for `ticketsIn`, keeping "no queue folder → no run named <run> waits for tests" — Fixable: true
