Verdict: PASS
Failures: 0
Fixable: false
Tasks: 23
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Test-first audit (`build-tests-green-8-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. The one planned test went red and then passed. There is no `Updated tests` or `Already landed` section, and nothing was loosened.
- TASK 23: met.
  - The flag part of the `renameScriptTokens` pattern at `core.ts:824` changed from `-{1,2}[\w-]+` to `--?\w[\w-]*`. A flag now matches in one way only, because the character after the dashes must be a word character, and `\w` never matches `-`.
  - No other pattern in `core.ts` uses `-{1,2}` or another two-way flag split. `findOldScriptNames` (`core.ts:841`) has a plain word-bounded name pattern with no repeat.
  - `dist/install/modules/core.js:701` carries the same fixed pattern, character for character, in the same diff.
  - The planned test `renameScriptTokens returns a many-flag line in bounded time` is in `core.test.ts` (30 flags, `performance.now()`, under 500 ms, output unchanged), and it passes.
  - A probe against the built `dist/install/modules/core.js` ran these inputs in 0.12 ms or less each: 40 `--a` flags, 200 hyphenated flags, 200 `--x=y=z` flags, 200 flags with wide gaps, and 200 flags followed by a near-miss name. The positive rewrite `pnpm --silent --reporter=ndjson run lint:prose` still gives `bkit:lint:prose`.
  - `core.test.ts` passed 28/28. `upgrade.integration.test.ts` and `core.integration.test.ts` passed 198/198. `pnpm bkit:gate:static-unit` exited 0: 166 test files passed (6962 tests passed, 2 skipped), and the prose linter reported 0 errors.
  - Observation, not a gap: the new pattern no longer treats a bare `--` (or `---x`) as a flag. So `pnpm -- lint:prose` is now left as it is, where the old pattern rewrote it to `pnpm -- bkit:lint:prose`. That line is not a real pnpm script call, and `findOldScriptNames` still matches the old name there, so the manual-rename warning fires. Every existing `renameScriptTokens` and `findOldScriptNames` test keeps its output, which is what the DONE WHEN requires.
- Logging per `docs/observability.md`: the task adds no error path and no log line. No `Documentation Updates` row applies, because the `docs/migrations.md` rows describe what is rewritten, not the pattern.
- Decision record `build-decision-1-2.md` (owner: "Yes, fix hang") is the source of Task 23. Its accepted test exceptions cover Tasks 7 and 8, not this group. `build-decision-1-1.md` (group 3) does not touch this group.

## Identified Gaps Log

None
