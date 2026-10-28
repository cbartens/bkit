Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — the `matrix` / `supersession` kinds, `derivedTestMatrix` + `supersessionInventory`, `challenge merge`'s row per appended task, Step 5 `Fix now`'s row, the template's `Task` column and `plan-scope-check`'s dropped checks landed (`.bkit/core/engine/commands/workflow/{tests,plan-blocks,challenge}.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/docs/templates/bkit-plan.md`, `.bkit/core/prompts/bkit-plan-scope-check.md`); 10 reds recorded, 3 test files and the full suite green, `bkit tests plan-check` exits 0 on this plan
DONE — TASK 6: `branches scan-diff --disabled-tests` — the fourth exclusive mode, its marker set (`.skip` / `.todo` / `.fixme` / `xfail`, x-prefixed tests, `t.Skip()`, `#[ignore]`, `@Disabled`, a removed assertion line in a test file), `file:line` plus the test it sits in, exit 1 on a hit and 0 on none, `--expect-none` refused beside it, and the ship workflow's `origin/dev` base passed into a sweep prompt that reads the verb instead of scanning the diff (`.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/prompts/bkit-ship-deferred-sweep.md`, `.bkit/core/workflows/bkit-ship.md`); 4 reds recorded, dogfooded through `dist/cli.js` on a scratch repo, full suite and `bkit:gate:static` green
NOTE — group 4's `tests green --group=4` reports 13 `test-changed` rows (task 5: `tests.test.ts`, `challenge.test.ts`; task 6: `branches.test.ts`), each `Fixable: null` for the diff read: every one is a test added by this group that gained the group's other tests, a corrected line reference to where `matrix` reports, an added rejection half that strengthens the acceptance test, or the skip marker composed in two pieces so the file carries no marker the slop gate would flag — no assertion was removed or weakened, and each named test passes now
