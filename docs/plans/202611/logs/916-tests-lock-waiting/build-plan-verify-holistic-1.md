Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups: TASKS 1-5, TASK 6, TASKS 7-10).

## Integration Gaps

1 gap.

- The full changed-files gate fails its `types` stage on a test file that TASK 8 (group 3) added. `.bkit/core/engine/commands/workflow/tests-jump.test.ts:28` calls `runCommand(["tests", "jump", ...args], [testsCommand], { io })` without the `classicVerbs` option that `runCommand` in `.bkit/core/engine/commands/lib.ts:568` requires (TS2741). Line 31 returns the `number | null` result as `number` (TS2322). At run time the missing option is never read, because `jump` is a declared verb and short-circuits the `classicVerbs.has` check, so vitest passes; only `tsc -p tsconfig.test.json` catches it. Reproduced with `npx tsc -p tsconfig.test.json`: these two errors and no others. The fix needs no plan choice (pass `classicVerbs`, as `.bkit/core/engine/commands/lib.test.ts:257` does, and handle `null`).

Cross-group contracts that do hold:

- Queue path: the jump verb (TASK 8) reads `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue`, the folder the Perl helper (TASKS 1-4, 7) derives as `$stem.queue`.
- Ticket and marker names: the verb matches `^\d+\.\d{6}-\d+(\.held)?$` and writes `<Date.now()>.jump` through a dot-prefixed temp file. The helper scans the same ticket and held-place names and `^(\d+)\.jump$`, and ignores the temp name.
- Line format: both sides use `<who> — <checkout>`. Held places count as known lines, so a jumped run keeps its marker across a give-up and re-ask (TASK 4 with TASK 7).
- Migration (TASK 6) replaces a shipped copy with the current template, which now carries the group 3 jump scan. The template contains `.queue`, so a merged copy stays silent. `git tag --list 'v6.*'` shows no release after v6.1.1.
- Host approval (TASK 9): `.claude/settings.json` and `.opencode/opencode.json` carry the three `tests jump` ask globs, and the rendered Cursor, Codex and Antigravity hooks carry the ask pattern and the Codex deny. `node dist/cli.js check` reports `0 write(s) would occur`.

## Previously Attempted

- No earlier holistic attempt.
- Group reports: `build-plan-verify-1-1.md` PASS and `build-plan-verify-1-2.md` PASS (after `build-plan-gaps-remediate-1-1-log.md` fixed a `bkit:slop:delta` finding); `build-plan-verify-2-1.md` PASS; `build-plan-verify-3-1.md` CONCERNS (TASK 10 mirror drift), closed by `build-plan-gaps-remediate-3-1-log.md` and confirmed by `build-plan-verify-3-2.md` PASS.

## Notes

- Mode `Holistic`, judged against `tmp/bkit-diff-916-tests-lock-waiting.md` (the full feature diff against `origin/dev` `af0f02ba0`). No `build-decision-*.md` record exists, and no test-first audit report was supplied, so step 8 had nothing to decide.
- Test run: `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 (`verdict: FAIL`, `lockHolder: null`). Related vitest: 66 files, 3190 tests passed. Named vitest: 228 files, 9350 passed and 2 skipped. `node --test`: 53 passed. bats: 13 passed. oxlint and prettier passed. Only `types` failed (see Integration Gaps).
- All ten tasks are on the `Tasks` line because each task's `DONE WHEN` holds. The typecheck failure is in a test file that no `DONE WHEN` names, so it is logged once as an integration gap, not as a task gap. The holistic fix round closes it.
- DONE WHEN checks re-run here:
  - `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0.
  - `/bin/bash -n` on the template exits 0.
  - The fixture's sha256 is `63ee5873795fd06b...`, the one value in `SHIPPED_MACHINE_LOCK_HASHES`.
  - `grep -c "tests jump" .claude/settings.json` prints 3.
  - `node dist/cli.js tests jump --help` says each use needs the human's approval.
  - `node dist/cli.js check` reports 0 writes.
  - The source-against-mirror diffs print nothing for § Machine lock, § Permissions, `### Codex CLI`, § Long-running shell commands and § Tests lock.
  - The plan's `sed` pattern uses `## Codex CLI`, but the heading is `### Codex CLI — three deviations`. The diff with `###` is empty.
- Derived Test Matrix: all 34 named tests exist in their target files, and each sits in a task's `DONE WHEN`. The two existing kept-green rows are covered by TASK 1's whole-file clause (`CI=%s is a no-op`, dogfood identical) and by TASK 4's named tests. The `cli-doc.test.ts` row is covered by TASK 8. No test added in the diff uses `.skip`, `.only`, a lint disable or a type escape.
- Documentation Updates: every row is done.
  - Covered docs: § Machine lock (queue and jump), § Long-running shell commands, § Codex CLI, § Tests lock (place in line, 120 s re-run, jump bullet), the `docs/testing.md` fixture sentence, the script header lines 9 and 34 plus the queue, held-place and jump sentences, § Permissions `ask` row, `.bkit/cli.md` and the `docs/migrations.md` row.
  - Ledgers: all eleven plan decision keys exist in `docs/decisions.jsonl`, and the deferral key `916-lock-wait-estimate-from-last` exists in `docs/deferrals.jsonl`.
- Observability: the lock notes stay `[machine-lock]` stderr lines and the give-up line is unchanged. The migration logs `${logPrefix} core:` like its sibling. The jump verb logs through `ctx.log`. `docs/observability.md` § Log Format allows each of these.
- Plan-text drift, not code gaps:
  - The jump verb prints `<run> moves to the front of the tests line` plus an output object. The plan text gives a longer sentence, but no `DONE WHEN` checks it.
  - The Claude and OpenCode globs are `*bkit*tests jump*`, wider than the plan's `*bkit tests jump*`, so they also catch the quoted path form.
- Out of scope, for the owner:
  - `CODEX_HOOK_RE` in `.bkit/core/hooks/guardrails-tiers.js` also matches a file ending `codex.cjs`, a name the hook parity tests use for their temporary copies. The rendered Codex hook matches through `.codex/hooks/` either way.
  - Group 2's report already named the symlink-before-template-equality order in `migrateMachineLockCopy`.

## Identified Gaps Log

1 gap.

INTEGRATION: TASK 8 (group 3) added `.bkit/core/engine/commands/workflow/tests-jump.test.ts`, which fails the `types` stage of `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (`pnpm typecheck` → `tsc -p tsconfig.test.json`): line 28 calls `runCommand` without the required `classicVerbs` option (TS2741), and line 31 returns its `number | null` result as `number` (TS2322); vitest does not type-check, so every group run passed, and no group 3 group-gate log exists — Fixable: true
