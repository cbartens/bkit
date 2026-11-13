Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups: TASKS 1-5, TASK 6, TASKS 7-10).

## Integration Gaps

0 gaps.

Attempt 1's one gap (the `types` stage failing on `.bkit/core/engine/commands/workflow/tests-jump.test.ts`) is closed: `npx tsc -p tsconfig.test.json --noEmit` exits 0, and the full changed-files gate passes every stage.

Cross-group contracts re-checked, and holding:

- Queue path: the jump verb (TASK 8) reads `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue`, the folder the Perl helper (TASKS 1-4, 7) derives as `$stem.queue`.
- File names: the verb matches `^\d+\.\d{6}-\d+(\.held)?$` and writes `<Date.now()>.jump` through a dot-prefixed temp file. The helper scans the same ticket and held-place names and `^(\d+)\.jump$`, and ignores the temp name.
- Line format: both sides use `<who> — <checkout>`, so a held place keeps a jumped run's marker alive across a give-up and re-ask (TASK 4 with TASK 7).
- Migration (TASK 6) replaces a shipped copy with the current template, which carries the group 3 jump scan; `git tag --list 'v6.*'` still ends at `v6.1.1`, so the one hash in `SHIPPED_MACHINE_LOCK_HASHES` is complete.
- Host approval (TASK 9) and its docs (TASK 10): `grep -c "tests jump" .claude/settings.json` prints 3, and `node dist/cli.js check` reports `0 write(s) would occur`.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: CONCERNS, 1 gap. `.bkit/core/engine/commands/workflow/tests-jump.test.ts` failed the `types` stage (TS2741 missing `classicVerbs`, TS2322 `number | null` returned as `number`). `build-plan-gaps-remediate-holistic-1-log.md` (commit `ccdc248d1`) passed `classicVerbs: new Set<string>()` and threw on a `null` result; this attempt re-checks that fix.
- Group reports: `build-plan-verify-1-1.md` and `build-plan-verify-1-2.md` PASS; `build-plan-verify-2-1.md` PASS; `build-plan-verify-3-1.md` CONCERNS (TASK 10 mirror drift), closed by `build-plan-gaps-remediate-3-1-log.md` and confirmed by `build-plan-verify-3-2.md` PASS.

## Notes

- Mode `Holistic`, judged against `tmp/bkit-diff-916-tests-lock-waiting.md` (the full feature diff against `origin/dev` `af0f02ba0`, which is also the branch's merge base). The diff already carries the holistic remediation (`classicVerbs` in `tests-jump.test.ts`). The only code change since attempt 1 is that 2-line test fix (`git diff --stat 757766db9 HEAD`), so the attempt-1 findings on the other files still apply, and the checks below were re-run.
- No `build-decision-*.md` record exists, and no test-first audit report was supplied, so step 8 had nothing to decide.
- Test run: `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 (`verdict: PASS`, `lockHolder: null`). Related vitest: 3190 tests passed. Named vitest: 228 files, 9350 passed and 2 skipped. `node --test`: 0 failed. bats: 13 passed. oxlint, prettier and `pnpm typecheck` passed. The cloud-setup lines (`db`, `cli` unavailable) are non-blocking notes from the environment, not test failures.
- DONE WHEN checks re-run:
  - `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0.
  - `/bin/bash -n` on the template exits 0.
  - The fixture's sha256 is `63ee5873795fd06b...`, the value in `SHIPPED_MACHINE_LOCK_HASHES`.
  - `docs/migrations.md` has the "Machine-lock copies without the queue" row.
  - `.bkit/cli.md` lists the `jump` verb in the `bkit tests` table, and `node dist/cli.js tests jump --help` says each use needs the human's approval.
  - The source-against-mirror diffs print nothing for § Machine lock, § Permissions, `### Codex CLI`, § Long-running shell commands and § Tests lock.
  - `node dist/cli.js check` reports 0 writes.
- Derived Test Matrix: all 34 named tests exist in their target files, and each sits in a task's `DONE WHEN`. No test in `tests-jump.test.ts` uses `.skip`, `.only`, a lint disable or a type escape.
- Documentation Updates and observability: unchanged since attempt 1, which found every row done and every log line within `docs/observability.md` § Log Format.
- Plan-text drift, carried from attempt 1 and not a code gap: the jump verb's printed line is shorter than the plan's text, and the Claude / OpenCode globs are `*bkit*tests jump*`, wider than the plan's `*bkit tests jump*`. No `DONE WHEN` checks either.
- Out of scope, carried for the owner: `CODEX_HOOK_RE` in `.bkit/core/hooks/guardrails-tiers.js` also matches a file ending `codex.cjs`; group 2's report named the symlink-before-template-equality order in `migrateMachineLockCopy`.

## Identified Gaps Log

None

