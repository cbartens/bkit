Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7, 17

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md` (FAIL, 10 gaps); `build-plan-gaps-remediate-3-1-log.md` (gap 10 DONE, gap 9 BLOCKED); `build-plan-verify-3-2.md` (FAIL, 9 gaps); `build-decision-1-1.md` (owner: Q2-Q9 accepted as TEST EXCEPTIONs, Q10 fix now → Task 17 added); `build-plan-verify-3-3.md` (CONCERNS, 1 fixable gap: `.bkit/instructions.md` still listed the `lite` carrier).

## Notes

- Group caps hold: 3 tasks, 15 `TEST FIRST` tests (4 + 10 + 1).
- Attempt-3 gap 1 resolved: commit `46f3af42e` (`pnpm instructions:sync`) drops `lite` from the `doc-local-section` carriers (`.bkit/instructions.md:5741`) and refreshes one generated `where-used` carrier list; no uncommitted drift in `.bkit/instructions.md`.
- Targeted run (caller-scoped; full repo suite not run per caller): `instructions.test.ts`, `install.integration.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts`, `manifest.test.ts`, `templates.test.ts` → 6 files, 607 / 607 pass, exit 0. `ls .bkit/core/.bkit/lite.md` fails (No such file).
- `dist/install/manifest.js` and `dist/install/modules/core.js` are committed in the group diff and mirror the source changes; `pnpm build` not run (mandate forbids building).
- Unrelated working-tree change: `package.json` `bkit.workflows.build.verify.maxAttempts` 2 → 4 (orchestrator / another agent); not judged, not touched.
- Test-first audit (`build-tests-green-3-4.md`, 4 gaps, all `Fixable: null`), same rows as attempt 3:
  - Task 6 `test-changed` x2 (`seeds publish without dropping the ask blocks`, `seeds publish when the bkit block has no build`): no gap. Changed lines sit outside both tests and their setup (top-level `spawnSync` import, another describe's `DOCS` list, a comment, Task 7's migration describe rewrite).
  - Task 7 `test-changed` `upgrade from a 5.2.4 lite.md keeps the consumer section` (`Changed since red` = `yes`): no gap. Diff only adds `GIT_DIR` / `GIT_WORK_TREE` to the `runCli` env and swaps `mkdirSync(.git)` for an asserted `git init`; no assertion weakened, removed or rewritten; this is the fixture isolation Task 7's `DONE WHEN` requires.
  - Task 17 `delete-still-referenced` (195 hits, one fewer than attempt 3 after the store sync): no gap. Nothing reads the deleted source at runtime; `.bkit/lite.md` constants name the consumer path the migration retires (a different thing); `.agents/docs.md:31` is the optional row for the repo's own `.bkit/lite.md` (Task 8 / 16); `.agents/plugins/**` are generated mirrors (Task 14 / 16); remaining prose is removed by Tasks 8, 14, 15, 16.
  - Task 6 `red-evidence-missing` x2 and Task 7 `added lines only` x6: cleared by owner-committed `TEST EXCEPTION` fields (`build-decision-1-1.md` Q2-Q9, `Decision: Accept` by the owner); the audit reports them honoured.
- Task 6 satisfied: four seed cases pass; seed and dist committed. Task 7 satisfied: ten migration cases pass, fixtures isolate git, `docs/migrations.md` row replaced, dist committed. Task 17 satisfied: source doc deleted, manifest entry and comment removed, `manifest.test.ts` / `templates.test.ts` updated, its `DONE WHEN` tests pass, broken `instructions.test.ts` now fixed.

## Identified Gaps Log

None
