Verdict: FAIL
Failures: 9
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md` (FAIL, 10 gaps); `build-plan-gaps-remediate-3-1-log.md` (gap 10 DONE, gap 9 BLOCKED as Task 8 work).

## Notes

- Code still matches every `UPDATE` field of Tasks 6 and 7 (as attempt 1 found): `migrateRetiredLite`, `RETIRED_LITE_STUB_SENTINEL` and the `publish: { remote: true, local: true }` seed appear 6 times each in `.bkit/core/engine/install/modules/core.ts` and `dist/install/modules/core.js`; no `migrateShortcutsToLite` left in `.bkit/core/engine` or `dist`; `docs/migrations.md` row 21 is the lite-retired row. Remediation since attempt 1 touched only `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (9 lines).
- Attempt-1 gap 10 resolved: the 5.2.4 upgrade case now `git init`s `tmpDir` and passes `GIT_DIR` / `GIT_WORK_TREE` pointing at it; the `migrateRetiredLite` describe sets both in `beforeEach`. Task 7's fixture-isolation `DONE WHEN` clause holds.
- Tests: `core.integration.test.ts` + `upgrade.integration.test.ts` 150 / 150 pass. Full `pnpm vitest run`: 1 failed / 8168 passed / 1 skipped; the one failure is gap 9.
- Test-first audit: 11 gaps vs 10 last round. New gap = Task 7 `test-changed` on `upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` (`Changed since red` = `yes`). Cause: remediating attempt-1 gap 10 edited this test after its red (`build-task-red-3-7-10.snapshot`): `runCli` env gains `GIT_DIR` / `GIT_WORK_TREE`; `mkdirSync(.git)` becomes `expect(spawnSync("git", ["init", "-q"]).status).toBe(0)`. Decided no gap: no assertion weakened, removed or rewritten; the change is the fixture isolation the task's own `DONE WHEN` requires, plus one added precondition assertion.
- Task 6 `test-changed` x2 (`seeds publish without dropping the ask blocks`, `seeds publish when the bkit block has no build`): no gap. Both tests sit in `describe("seedBkitDefaults ...")` (lines 768-791); every changed line is outside them and their setup (top-level `spawnSync` import, `DOCS` list, a comment, and Task 7's rewrite of the `migrateRetiredLite` describe at line 1163).
- Task 6 `red-evidence-missing` x2: engine `Fixable: false` stands (not `null`). Task 7 `added lines only` x6: `Fixable: false` under the literal rule; the three added `expect(...).toBe(SENTINEL)` lines are inside planned tests 7.6 / 7.7 / 7.8. They strengthen assertions; an owner accept would be needed to clear them.
- No decision records (`build-decision-*.md`) exist, so nothing is accepted. Task 6 not satisfied (gaps 1-2); Task 7 not satisfied (gaps 3-9).

## Identified Gaps Log

1. TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds build.publish on install` — red-evidence-missing (`build-task-red-3-6-2.snapshot` absent on disk and in every commit) — Fixable: false
2. TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `keeps an existing publish.local false on upgrade` — red-evidence-missing (`build-task-red-3-6-3.snapshot` absent on disk and in every commit) — Fixable: false
3. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `strips the managed block and keeps consumer lines` — test-changed (added lines only; three added `expect(...).toBe(SENTINEL)` lines sit inside planned tests `logs no fix and writes nothing on a second install over its own stub`, `is idempotent across a second install`, `records the same write set in a dry run`) — Fixable: false
4. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `deletes .bkit/lite.md when it holds only the seeded heading` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
5. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `merges .agents/shortcuts.md consumer lines into the stub` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
6. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `creates the stub when the shortcuts merge finds no lite.md` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
7. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a blockless or two-block lite.md untouched and logs` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
8. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs no lite.md and still mirrors every other canonical doc` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
9. TASK 7: `.bkit/core/engine/commands/install/install.integration.test.ts` `every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md` — broken-test-left (still failing: `payload files the install did not write: [ '.bkit/lite.md -> .bkit/lite.md' ]`; Task 7 dropped `lite.md` from `BKIT_CANONICAL_DOCS` while `.bkit/core/.bkit/lite.md` still ships; remediation attempt 1 BLOCKED it as Task 8 work; full `pnpm vitest run` 1 failed / 8168 passed / 1 skipped) — Fixable: true
