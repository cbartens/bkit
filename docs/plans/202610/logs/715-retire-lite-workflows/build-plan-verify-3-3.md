Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 7

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md` (FAIL, 10 gaps); `build-plan-gaps-remediate-3-1-log.md` (gap 10 DONE, gap 9 BLOCKED); `build-plan-verify-3-2.md` (FAIL, 9 gaps); `build-decision-1-1.md` (owner: Q2-Q9 accepted as TEST EXCEPTIONs, Q10 fix now → Task 17 added).

## Notes

- Group caps hold: 3 tasks, 15 `TEST FIRST` tests (4 + 10 + 1).
- DONE WHEN tests: `install.integration.test.ts`, `manifest.test.ts`, `templates.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts` 511 / 511 pass. `ls .bkit/core/.bkit/lite.md` fails. `dist/install/manifest.js` (Task 17) and `dist/install/modules/core.js` (Tasks 6, 7) are committed and mirror the source diff; `pnpm build` not run (mandate forbids building). Attempt-2 gap 9 (payload test) resolved by Task 17.
- Full `pnpm vitest run`: 1 failed / 8164 passed / 1 skipped. The one failure, `instructions.test.ts` `sync has nothing left to rewrite`, is new since attempt 2 (which had only the payload failure); commit `f7a5c10ad` (Task 17) is the only code change since, and its deletion of `.bkit/core/.bkit/lite.md` drops the `lite` carrier the store lists at `.bkit/instructions.md:5741`. Task 17 broke it and did not fix it → gap 1; Task 17 left off `Tasks`.
- Test-first audit (`build-tests-green-3-3.md`, 4 gaps, all `Fixable: null`):
  - Task 6 `test-changed` x2 (`seeds publish without dropping the ask blocks`, `seeds publish when the bkit block has no build`): no gap. Every changed line sits outside both tests and their `seedBkitDefaults` setup: a top-level `spawnSync` import, the `DOCS` list of another describe, a comment, and Task 7's migration describe rewrite.
  - Task 7 `test-changed` on `upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` (`Changed since red` = `yes`): no gap. Not covered by an exception; diff only adds `GIT_DIR` / `GIT_WORK_TREE` to the `runCli` env and swaps `mkdirSync(.git)` for an asserted `git init`; no assertion weakened, removed or rewritten; it is the fixture isolation Task 7's own `DONE WHEN` requires.
  - Task 17 `delete-still-referenced` (196 `lite` hits): only one real break. Nothing reads the deleted source at runtime (no `getBkitDocsRoot()` + `lite.md` join left in `.bkit/core/engine`). The `.bkit/lite.md` constants in `core.ts` / `uninstall.ts` and the tests name the consumer path the migration retires, a different thing. `.agents/docs.md:31` is an optional (`○`) index row for the repo's own `.bkit/lite.md`, which still exists until Task 16's install; its source row in `.bkit/core/.agents/docs.md` is Task 8's work. `.agents/plugins/**` hits are generated mirrors of prompts Task 14 edits and Task 16 regenerates. Remaining hits are prose that Tasks 8 / 14 / 15 remove. The real break is the `lite` carrier in `.bkit/instructions.md`, logged as gap 1 via its failing test.
  - Task 6 `red-evidence-missing` x2 and Task 7 `added lines only` x6: cleared by the plan's owner-committed `TEST EXCEPTION` fields (`build-decision-1-1.md` Q2-Q9, `Decision: Accept` by the owner); the audit reports them honoured.
- Task 6 satisfied: four seed cases pass; `SEEDED_BKIT_DEFAULTS` seed and dist committed. Task 7 satisfied: ten migration cases pass, fixtures set `GIT_DIR` / `GIT_WORK_TREE` to their own temp repo, `docs/migrations.md` row replaced, dist committed; the payload test it broke now passes via Task 17 per the owner's Q10 decision.

## Identified Gaps Log

1. TASK 17: `.bkit/core/engine/tools/instructions.test.ts` `the corpus matches the instructions store > sync has nothing left to rewrite` — broken-test-left (deleting `.bkit/core/.bkit/lite.md` removed the `lite` carrier the store still lists at `.bkit/instructions.md:5741` (`doc-local-section` carriers `docs`, `lite`, `skills`); fails `run pnpm instructions:sync`; only failure in full `pnpm vitest run`, 1 failed / 8164 passed / 1 skipped; fix = `pnpm instructions:sync` and commit `.bkit/instructions.md`) — Fixable: true
