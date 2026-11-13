Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7, 8, 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: `CONCERNS`, 1 gap (TASK 10, `node dist/cli.js check` reported DRIFT DETECTED because the committed guardrails mirrors split `IS_CODEX_HOOK` differently from the render). Tasks 7, 8 and 9 were judged satisfied.
- `build-plan-gaps-remediate-3-1-log.md`: `PASS`, fixed 1 (commit `3c3394cd1` split the constant into `CODEX_HOOK_RE` / `HOOK_FILE` / `IS_CODEX_HOOK` in `.bkit/core/hooks/guardrails-tiers.js` and the three mirrors).

## Notes

Judged against `build-diff-3-2.md` (the group diff since group 3 started, including the remediation commit `3c3394cd1`). The brief has no `Deviations` section. No decision records exist. `build-plan-current.md` names only TASK 5 (group 1) line-number rewording; it touches no group 3 task.

Test-first audit (`build-tests-green-3-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests` or `Already landed` sections, so nothing to decide.

DONE WHEN checks run here:

- The remediation gap is closed: `node dist/cli.js check` prints `[bkit-check] 0 write(s) would occur.` and exits 0. No engine TypeScript or `dist/` file changed since `c496efbbb`, so the committed `dist/` still matches the source without a rebuild (this verifier does not build).
- One run under the `tests` lock of every vitest file named in the TASK 7, 8 and 9 DONE WHEN fields, plus `tests-jump.test.ts` and `conventions.test.ts`: 14 files, 688 tests, all pass. `node --test` on both `bkit-test-awake.test.mjs` copies: 42 pass, 0 fail.
- TASK 7: `cmp` of the adopted and template lock scripts exits 0; `/bin/bash -n` on the template exits 0; the header comment names jump markers.
- TASK 8: `.bkit/cli.md` lists `jump`; `node dist/cli.js tests jump --help` says each use needs the human's approval. The two `catch` blocks in `tests-jump.ts` return a value (a missing queue folder means no run waits; a ticket can vanish between listing and reading), so they swallow no error the verb must report.
- TASK 9: the Claude and OpenCode globs are `*bkit*tests jump*` rather than the plan's `*bkit tests jump*`, and the ask pattern accepts a closing quote after `bkit`; both are wider and catch the quoted path form, which the path-prefixed test proves.
- TASK 10: the § Machine lock, § Permissions, § Codex CLI and § Tests lock source-vs-render diffs print nothing, and each section names `tests jump`. The plan's `sed` pattern for providers uses `## Codex CLI`, but the heading is `### Codex CLI`; the diff with `###` prints nothing. `grep -c "tests jump" .claude/settings.json` prints 3. § Machine lock names the 6.1.x upgrade migration.
- Derived Test Matrix rows 149-158 each map to a group 3 task's DONE WHEN test, and every group 3 `Documentation Updates` row is done.

Out of scope, for the owner: none found.

## Identified Gaps Log

None

