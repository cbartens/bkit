Verdict: CONCERNS
Failures: 2
Unfixable: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single`: Sub-Plan 2 of 2 (`docs/plans/202610/650-workflows-prompt-alone-plan-2.md`, master Tasks 7–10 and 14–19), attempt 2.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md` (`CONCERNS`, 4 fixable gaps: T8 `none` render not byte-identical; T16 Q7 continuity line; T16 / T14 Open Question 5 line; T16 `trackers.md` rows).
- `build-plan-gaps-remediate-2-1-log.md` (commit bf3dcc6c, `Fixed: 4`). Gaps 2, 3 and 4 are closed. Gap 1 is narrowed but still open: 2 residual `none` differences remain (see the gaps log).

## Notes

- **Ticks:** Task 16 is now `[x]`: the Q7 continuity line is at `.bkit/core/.bkit/workflows.md:1387`, the Open Question 5 line is in § Branch eligibility (exit 13 = `EXIT_SHARED_BUSY`, `worktrees.ts:54`), and the `trackers.md` `pr-body-metadata`, Linear and Jira rows are updated. Its `Done when` greps pass: `No issue ID …` appears only in tests, `lands bookkeeping only` gives rc 1, L137 names the debug-on-`dev` replay, and `CHANGELOG.md` has `[Unreleased]` with the `prs merge` refusal under Changed. Task 8 stays `[ ]` (gaps 1–2). Tasks 7, 9, 10, 14, 15, 17, 18 and 19 still hold. Gates and the other boxes are left as found.
- **The 4 "accepted" `none` lines, judged one by one.** Method: render each workflow with `substituteWorkflow(..., "none")` from origin/dev and from HEAD and diff them. Changed lines: design 12, plan 6, build 17, debug 91, ship 25. HEAD renders equal the new baselines byte for byte.
  - Mint line (`workflow-fid-mint`) and `ISSUE_ID` empty line (`workflow-fid-unset`): the conflict is real, and the plan allows it. The Task 7 `Done when` says both clauses "apply under every tracker". The extra blank lines next to the `FID` paragraph come from the unset line leaving its origin/dev `false` block: without them, prettier folds the next paragraph into sub-item 4. Accepted.
  - Comment-post line (`workflow-keep-record-comment`, `anchored: yes`): the conflict is real. An inline block would break the anchored template match, and the old text is `retired`. Behaviour under `none` does not change: Failure Path step 2 is `No tracker connected, skip step`, and an empty `ISSUE_ID` has no issue to post to. Accepted.
  - Gate item (`workflow-gate-issue-id`): the wording conflict is real, but the behaviour change is not allowed (gap 1).
  - Not one of the 4 lines: the `false`-block `Format` line in debug (gap 2).
  - Plan-sanctioned for every tracker: the T15 ship hunks (refusal, naming warning, MCP base assert), the T9 / T14 debug hunks, and the gate-log / tests-local copy from commits 463974e3 / 6dada8c1, which is outside this sub-plan.
  - Wired renders (github / linear / jira) are unchanged by bf3dcc6c, except that the unset line now sits on its own line and debug loses its blank lines.
- **`render/trackers.test.ts` `none render baselines`:** it compares HEAD's `none` render against snapshots taken from HEAD, so it catches future drift. It does not check against origin/dev. Its comment lists the accepted differences, but not debug's `Format` line or the blank lines. Fixing gaps 1–2 means regenerating the baselines with `vitest -u`.
- **Test-first audit (`build-tests-green-2-2.md`, `Enforced: true`, `Gaps: 26`). Each gap was judged by hand; none is counted:**
  - 25 × `test-changed`. `ci-dispatch-gate-alignment.test.ts`, `ship-invariants.test.ts` and `wording.test.ts` have not changed since 7247c6c4, so attempt 1's judgement stands (inline code moved into same-logic helpers). `workflow-shape.test.ts` changed in bf3dcc6c (36 lines):
    - `trackerBlocks` now reads inline markers.
    - `unguardedIssueCalls` skips `false`-block lines. Those blocks are dropped under every wired tracker; the only hit is debug:679 `issues labels`, the origin/dev `none` route.
    - For a line in no block, `unguardedIssueCalls` looks for the guard in the line's numbered item. Only the `issues text` lines rely on this (design:233, plan:246, ship:217), and each is guarded by an inline `true` Skip on its item.
    - The `--issue` assertion reads the github render.
    - No `expect` was removed and no expected value changed.
    - `workflow-fence-syntax.test.ts` is not a planned test. It now parses the github and `none` renders. No shell fence sits inside a linear / jira block, so the parse coverage is the same as before.
  - Task 15 `red-mismatch` + `not-green`, re-confirmed: the recorded test `naming warning fires issue-less when the branch is not feat/FID` (`ship-invariants.test.ts:675`) is the planned test with the braces dropped. Its red is in `build-task-red-2-15-2.md:64,175` and it passes now, so neither entry is a gap.
- **Tests run (this verifier):**
  - 6 files (the 5 sub-plan test files plus `workflow-fence-syntax.test.ts`): 396 / 396 passed. All 29 planned names, the L564 re-read row and the 5 `none render matches its baseline` rows passed by name in the vitest JSON.
  - `pnpm bkit:gate:static-unit-integration` exit 0: typecheck, lint, `format:check` clean, `format:tables:check` 0/158, `lint:prose`, `slop:delta` net 0, unit 135 files / 5195 tests, bats 31 ok / 0 not ok, integration 46 files / 1524 tests.
  - `pnpm bkit check` exit 0. `pnpm bkit:check:dist` exit 0 with `dist/` unchanged. `core.bare` is false.
- **Task 17:** 3 decision rows, 4 deferral rows (`650-debug-dev-ci-live-round-trip`, `hard-blocked`) and the correction row (`ts` 1792661593022, carrying both references) are present.
- **Diff coverage: partial.** The Large Diff Guard applied (`git diff origin/dev..HEAD` = 187626 lines). Read in full: bf3dcc6c's prose and test hunks (workflows, `.bkit/core/.bkit/{workflows,trackers}.md`, `workflow-shape.test.ts`, `workflow-fence-syntax.test.ts`, `render/trackers.test.ts`). Targeted reads: `.bkit/wording.md` clauses, `CHANGELOG.md`, `docs/testing.md`, `lite.md`. Rendered outputs were diffed for none / github / linear / jira. Mirrors are covered by `bkit check`. Engine sources belong to Sub-Plan 1.
- **Embedded directives:** none found in the logs, audit report, build input, commit messages or diffs.

## Identified Gaps Log

2 gaps, both fixable.

1. **Task 8 (with the Task 7 `workflow-gate-issue-id` clause): Gate 1 cannot pass for an issue-less run under `none`.** Every workflow's Gate 1 item now reads ``Issue resolved (`ISSUE_ID` non-empty, or the no-issue warning emitted)`` (`bkit-design.md:194`, `bkit-plan.md:205`, `bkit-build.md:210`, `bkit-debug.md:239`, `bkit-ship.md:234`), and it renders under `none` too. Under `none` the no-issue warning never prints: it sits in `true` blocks only (0 hits in any `none` render), and `.bkit/core/.bkit/workflows.md:1387` says "`none` → runs without, no warning". So a `none` run with no issue, the normal `none` case, meets a Gate 1 item it cannot satisfy. The origin/dev text allowed it ("may be empty under `none`"). This breaks "the `none` tracker behaves as today" (issue constraint, Edge Cases row `none` tracker, Assumption on `none`). The wording conflict the remediator reports is real (the old text is `retired`, and a second variant in a `false` block would be a near-copy). But the plan does not sanction the behaviour change. Fix: reword the clause so that `none` is covered, e.g. ``Issue resolved (`ISSUE_ID` non-empty, the no-issue warning emitted, or no tracker wired)``, keeping the current text in `retired`. Then run `pnpm wording:sync`, regenerate the 5 `none` baselines and the mirrors. — fixable
2. **Task 8: `bkit-debug.md` adds a `none`-only line that is in no accepted category.** The remediation added a `false` block holding ``Format `{branch-suffix}-{slug}`.`` (`.bkit/core/workflows/bkit-debug.md:161-163`, commit bf3dcc6c), so the `none` render of debug Step 1 sub-step 4.4 now has an extra line (`bkit-debug.none.txt:91`). It is not the `workflow-fid-mint` / `workflow-fid-unset` clause text, and it is not a T9 or T14 hunk. It repeats the `ISSUE_ID` empty line above it, and it states the branch-suffix format unconditionally, even when `none` found `ISSUE_ID` in the prompt (`ISSUE-{ID}`), where the mint line says `FID` comes from `{ISSUE_ID}`. origin/dev's `none` render had only the `ISSUE_ID` unset line here. Fix: drop the `false` block, then regenerate `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt` and the mirrors. — fixable
