Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: f18fb509cd42536bac515dc526c0a41489686cfc48ba894b7beca1fdafa8c76a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Tasks 1 and 2 were judged against `build-diff-1-1.md` (the group diff) and the codebase.

- TASK 1: `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts` reads `{L}) {name} — {effect}` lines, keeping the text before the first ` — ` as the name, and falls back to the `Options:` line for each item that has no option lines. `Recommended: none — {why}` reads as `recommended` null with `reason` = `{why}`, and `No recommendation` still reads as null. The header comment shows the new layout, keeps the `Fix task:` line and says the old layout is still read. The per-line regex needs `^[A-Z]\)`, so `Fix task:` and `Decision:` lines never become options. `DecisionItem` is unchanged, `fixTask` included. `summary.ts`, `summary-findings.ts` and `challenge.ts` are not in the diff. The nine TEST FIRST tests exist and pass. The existing `parseDecisionItems keeps the bare option name, dropping the letter` (`decisions.test.ts:1104`) and `a decision file written before the letters still parses` (`:1119`) are unchanged and pass.
- TASK 2: `ComposeOption {name, effect}` and `composeItems` map a bare fixed name to its default effect (`FIXED_EFFECTS`, worded as in the plan's Architecture), refuse any other bare string or an object missing `name` or `effect` (exit 2, naming the item, Q number and option letter), refuse a `—` in a name and keep the `MAX_OPTIONS` cap. `itemLines` writes one option per line, `Recommended: none — {why}` and the two `Default if unanswered:` phrases. `compose --loop` uses `fixed()` for `Try again`, `Decide` and `Stop`; the `--base-check` path's `Stop` goes through the same `fixed("Stop")`. The footer writes the shared reply line, plus the one-by-one line when there are 3 or more questions, the loop question counted. The `--items` help names `{name, effect}`. The ten TEST FIRST tests pass. The updated `refuses an item with more options than letters` asserts `at most 26 options`. `--defer letters the options in the deferral row` (`:1462`) is unchanged. The test the plan-current report flagged, `Try again is offered for every base verdict`, now asserts the per-line layout.
- Commands run: `pnpm vitest run` on `decisions.test.ts`, `summary.test.ts` and `challenge.test.ts`: 3 files and 171 tests passed. `pnpm tsx .bkit/core/engine/tools/cli-doc.ts` (check mode): exit 0, no drift in `.bkit/core/.bkit/cli.md`. `tsc --outDir {scratchpad}` followed by `diff -rq` against `dist/` showed no difference, so the committed `dist/` matches the sources. That is the same check `pnpm bkit:check:dist` makes, run without rebuilding the repo's `dist/`. `pnpm bkit:typecheck:tests`: exit 0.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Already landed` section, so there was nothing to decide.
- Derived Test Matrix rows for tasks 1 and 2 (plan lines 163-183): each row has its test in that task's DONE WHEN.
- Docs: `.agents/docs.md` lists `docs/testing.md` and `docs/observability.md` for Build. Usage errors use the existing `CommandError` exit-2 convention on stderr, and no new logging is needed.
- No decision records or earlier verify or remediation attempts exist for group 1.

## Identified Gaps Log

None
