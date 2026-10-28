Verdict: FAIL
Failures: 10
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

None

## Notes

- Code matches every `UPDATE` field of Tasks 6 and 7: `withBuildPublish` merges `publish: { remote: true, local: true }` beside `askBlocks().build`; `migrateRetiredLite` replaces `migrateShortcutsToLite` at the same `runBkitDocs` call site, writes the `RETIRED_LITE_STUB_SENTINEL` first line, stays silent on its own stub, warns without naming `<!-- bkit:end -->`, creates a missing destination, drops the `getBkitDocsRoot()/lite.md` gate and filters both seeded headings; `"lite.md"` left `BKIT_CANONICAL_DOCS` and the test `DOCS` list; `renderedLite()` is gone; the `docs/migrations.md` row is replaced; `dist/install/modules/core.js` is rebuilt and committed in `571a3d983`. No stale `migrateShortcutsToLite` reference outside `docs/decisions.jsonl` (append-only ledger). No diagnostics on `core.ts`.
- All 14 `TEST FIRST` tests pass (`core.integration.test.ts` + `upgrade.integration.test.ts`: 150 / 150). `pnpm build` not run (mandate forbids building); the committed `dist/` diff mirrors the source diff line for line.
- Test-first audit decisions: the two `red-evidence-missing` gaps keep the engine's `Fixable: false` (the 3-6-2 / 3-6-3 artefacts that `status.jsonl` lines 68-69 name were never committed; `build-task-red-3-6-4.md` does show all four Task 6 tests red in one run, which the owner may weigh in an accept). The two Task 6 `test-changed` gaps are no gap: every changed line sits outside the four Task 6 tests and their `seedBkitDefaults` setup (it is Task 7's own migration rewrite plus a top-level import). The six Task 7 `added lines only` gaps are `Fixable: false` under the literal rule: the three added `expect(...).toBe(SENTINEL)` lines sit inside planned tests 7.6 / 7.7 / 7.8. Context for an accept: those rows show no change since their own red, the lines strengthen (never weaken) the assertions, and the red at 3-7-1 shows those three tests passing before the lines were added.
- Full suite (`pnpm vitest run`): 1 failed / 8168 passed / 1 skipped; the one failure is gap 9, which Task 7 caused and the execute log defers to Task 8.
- No decision records (`build-decision-*.md`) and no prior verify or remediation logs for group 3.

## Identified Gaps Log

1. TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `seeds build.publish on install` — red-evidence-missing (status.jsonl line 68 names `build-task-red-3-6-2.md` / `.snapshot`; neither exists on disk nor in any commit) — Fixable: false
2. TASK 6: `.bkit/core/engine/install/modules/core.integration.test.ts` `keeps an existing publish.local false on upgrade` — red-evidence-missing (status.jsonl line 69 names `build-task-red-3-6-3.md` / `.snapshot`; neither exists on disk nor in any commit) — Fixable: false
3. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `strips the managed block and keeps consumer lines` — test-changed (added lines only; the three added `expect(...).toBe(SENTINEL)` lines sit inside planned tests `logs no fix and writes nothing on a second install over its own stub`, `is idempotent across a second install`, `records the same write set in a dry run`) — Fixable: false
4. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `deletes .bkit/lite.md when it holds only the seeded heading` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
5. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `merges .agents/shortcuts.md consumer lines into the stub` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
6. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `creates the stub when the shortcuts merge finds no lite.md` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
7. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a blockless or two-block lite.md untouched and logs` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
8. TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs no lite.md and still mirrors every other canonical doc` — test-changed (same three added lines inside planned tests 7.6 / 7.7 / 7.8) — Fixable: false
9. TASK 7: `.bkit/core/engine/commands/install/install.integration.test.ts` `every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md` — broken-test-left (Task 7 dropped `lite.md` from `BKIT_CANONICAL_DOCS` while the payload still ships `.bkit/core/.bkit/lite.md`; fails `payload files the install did not write: [ '.bkit/lite.md -> .bkit/lite.md' ]`; the execute log defers it to Task 8; only failure in the full `pnpm vitest run`, 1 failed / 8168 passed) — Fixable: true
10. TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade from a 5.2.4 lite.md keeps the consumer section` — done-when-unmet (DONE WHEN requires each fixture to set `GIT_DIR` / `GIT_WORK_TREE` to its own temp repo; this case only `mkdirSync`s an empty `.git` dir and spawns the CLI with `process.env`, setting neither) — Fixable: true
