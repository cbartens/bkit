Verdict: FAIL
Failures: 7
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Code and DONE WHEN: both tasks' codebase work is present and green; neither task is on `Tasks` because each carries test-first audit gaps (step 9). No decision record covers group 6 (`build-decision-1-1.md` = group 3, `build-decision-1-2.md` = group 5).
- Test run: `pnpm vitest run` on `workflow-shape.test.ts`, `trackers.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts` → 6 files, 491 tests passed. Verbose filtered re-run → all 8 `build publish ending` tests, `bkit-build: the none render matches its baseline byte for byte`, `the repo > has no coverage findings`, both `bkit-build.md held close` tests and both `deferred landing of a held build` tests pass.
- `dist/`: not rebuilt (mandate: no build). Group 6 changed no engine source; `dist/` last committed at `70aca6be0` (group 5) and holds the held-close code (`Docs: not synced` in `dist/commands/workflow/summary.js`, `workflows.js`), so the Task 13 runs exercise current engine code.
- TASK 12 prose (`.bkit/core/workflows/bkit-build.md`): Step 2 runs `status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"` after `runtime row`, holds `{PUBLISH}` / `{PUBLISH_SOURCE}`, `runtime assert` has no `>/dev/null`, coercion warning present; Step 15 passes `--publish={PUBLISH}`, probe and push gated on `{PUBLISH}` = true, Gate 15 lines marked `(publish=true only)`; Step 16 held fence closes with `--ending=held --publish=false --record-step`, `roadmap feature --root="{WORKTREE_PATH}"` and no `roadmap mirror`, releases the lock, sets `In review`, posts the "Built locally, not published" comment, runs sub-steps 11-12; Gate 16 splits `build-close-workflow` (both paths) from `build-create-pr` (`{PUBLISH}` = true only). No Unicode `≠ ≥ ≤` in the added lines; no history prose. Baseline `bkit-build.none.txt` diff shows only the publish branch. The changed `final return at the close` expectation (build: 2 closes) still asserts `--session-dir` on every line; not a weakening.
- TASK 13 DONE WHEN conditions met: both fixtures set `GIT_DIR` / `GIT_WORK_TREE` to their own temp repo; bare-origin refs asserted before and after; `gh-calls.jsonl` proves `pr create --base dev` and `pr merge --match-head-commit <head> --squash`.
- Gaps 1-2 (TASK 12 no-red, `Fixable: false` stands): a red was possible but not taken — writing the expected `bkit-build.none.txt` baseline, or the new `.bkit/instructions.md` entries, before the workflow edit would have failed first. The execute log's "no red is possible" is wrong. The code has landed, so only an owner TEST EXCEPTION can clear these.
- Gap 3 (TASK 12 not-green, `Fixable: true`): no `it` titled `every standing line has an entry` exists; the phrase is only in the file's top comment (`instructions-coverage.test.ts:3`). The test that guards this is `the repo > has no coverage findings`, which passes. Fix: the plan's TEST FIRST names that test.
- Gaps 4-7 (TASK 13 no-red, `Fixable: false` stands): TASK 13 adds tests only; the code they cover landed in TASKs 4, 5, 10 and 12, so none could fail first in build order. This is a test-order gap, not a defect, but the already-landed override does not apply: plan currency does not classify TASK 13 `Broken`, and the execute log has a `NOTE`, not `DONE — TASK 13: already landed`. Needs an owner TEST EXCEPTION (the plan should have carried one).
- Process note: the execute log records workflow and test edits made with a shell heredoc and a python one-off, which breaks the `Edit tools ONLY` rule; content reviewed here, no defect found.

## Identified Gaps Log

7 gaps.

1. TASK 12: `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` — no-red — Fixable: false
2. TASK 12: `.bkit/core/engine/tools/instructions-coverage.test.ts` `every standing line has an entry` — no-red — Fixable: false
3. TASK 12: `.bkit/core/engine/tools/instructions-coverage.test.ts` `every standing line has an entry` — not-green — Fixable: true
4. TASK 13: `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock` — no-red — Fixable: false
5. TASK 13: `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `held close records the rows, summary and worktree-only roadmap row` — no-red — Fixable: false
6. TASK 13: `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship pushes the held branch and opens a dev PR` — no-red — Fixable: false
7. TASK 13: `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` `ship gates on CI and merges the pinned head` — no-red — Fixable: false
