Verdict: CONCERNS
Failures: 4
Unfixable: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — Sub-Plan 2 of 2 (`docs/plans/202610/650-workflows-prompt-alone-plan-2.md`, master Tasks 7–10, 14–19), attempt 1.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification of Sub-Plan 2 (no `build-plan-verify-2-*.md` or `build-plan-gaps-remediate-2-*-log.md` before this run).

## Notes

- **Ticks:** the execute run had ticked all 10 tasks. Re-verified against `Done when`: 7, 9, 10, 14, 15, 17, 18 and 19 hold. **Task 8** and **Task 16** reset to `[ ]` (gaps 1–4). Gates, Mandatory Tasks, Security, Pre-Flight and Verification Plan boxes left as found (tasks only).
- **Test-first audit (`build-tests-green-2-1.md`, `Enforced: true`, `Gaps: 26`), each gap judged by hand, none counted:**
  - Snapshots: one per test file (workflow-shape `f3e4…`, ci-dispatch `fc60…`, ship-invariants `8b0d…`, wording `50aa…`), all reds recorded 07:24:28Z–07:25:20Z. Snapshot → HEAD diffs: workflow-shape 83 lines, ci-dispatch 16, ship-invariants 5, wording 0.
  - 25 × `test-changed` (Tasks 8, 9, 10, 14, 15): every hunk moves inline code into a helper with the same logic (`unguardedIssueCalls`, `boardFences`, `commentPosts`, `guardedPost`, `blocksWithin`, `blockerBlocks`, `pushFences`, describe-scope `releaseFences` / `refusalRoute`, `nextAfter`). No `expect` was removed or loosened, and no expected value changed. The audit flags every test in a file whenever any part of that file changes.
  - Task 15 `red-mismatch` + `not-green`: the recorded test `naming warning fires issue-less when the branch is not feat/FID` (`ship-invariants.test.ts:675`) is the planned `…feat/{FID}` with the braces dropped. Its red is in `build-task-red-2-15-2.md:64,175` and it passes now → no gap, for either entry.
  - Plan-currency `CONCERNS` (`build-plan-current.md`, Task 16 `Reword`): `[Unreleased]` reopened above `[5.5.1]` (`CHANGELOG.md`); `docs/testing.md` rows rewritten at their new lines.
- **Tests run (this verifier):** the 5 sub-plan files → 387 passed. All 29 planned test names (plus the L564 re-read row) passed by name in the vitest JSON report. Full gate pieces: `typecheck` + `lint` exit 0; `prettier --check` clean on tracked files; `format:tables:check`, `lint:prose`, `slop:delta` (net 0) OK; unit coverage 135 files / 5190 tests passed; bats 31 ok / 0 not ok; integration 46 files / 1524 tests passed. `pnpm bkit check` exit 0; `pnpm bkit:check:dist` exit 0 with `dist/` unchanged.
- **Gate caveat:** the single `pnpm bkit:gate:static-unit-integration` run exited 1, but only because `format:check` flagged two untracked run artifacts: this report while it was being written, and `build-tests-green-2-1.md`. The orchestrator must format `build-tests-green-2-1.md` before committing it, or the pre-commit gate fails on it.
- **CLI spot checks (`node dist/cli.js`, scratch git repo):** `fids check --issue=""` → `dev-ci-failures` 0; `123-fix` / `fix-2-retry` 1 under github / linear / jira. `fids parse --branch=feat/dev-ci-failures` → `issueId: null`. `prs open --issue=""` with `gh` off `PATH` prints body `<!-- bkit:fid=dev-ci-failures -->`. `prs open --base=main` → exit 7. `worktrees setup --workflow=ship --branch=dev` → exit 7 "releases stay manual". The Task 19 packed-tarball install / upgrade dogfood was not re-run; it rests on the execute log.
- **Greps:** `.bkit/core/workflows/bkit-debug.md` has no `git push origin`. Its only `git add -A` (`:676`) is the `TRIGGER_PR` = 1 commit. The `--mode=feature` pushes sit behind `Skip if BRANCH = dev` or `BRANCH != dev` (`:558`, `:583`, `:636`). `No issue ID …` strings in `.bkit/core` appear only in `retired` blocks and in test assertions. `lands bookkeeping only` → rc 1. No `--placeholder=ISSUE_ID` in the five workflows. There is no `workflow-issue-id-missing-none` clause on `origin/dev` or HEAD; the `none` clause is `workflow-issue-id-none` and still continues issue-less.
- **Task 17:** 3 decision rows, 4 deferral rows (`650-debug-dev-ci-live-round-trip` `hard-blocked`) and the correction row (`ts` 1792661593022, both references). The correction row carries `workflow: build`, `step: manual`, `subagent: null`, not `bkit-utility-update-decisions` as the plan names. It was written after the execute run's `BLOCKED` entry; the `Done when` is met anyway.
- **Diff coverage:** partial. The Large Diff Guard applied (`git diff origin/dev..HEAD` = 181933 lines, 236 files, mostly `docs/plans/**/logs/**` and `.agents/skills/vitest/**`). Read in full: the sub-plan's source diffs (`.bkit/core/.bkit/{workflows,trackers,lite}.md`, `.bkit/core/AGENTS.md`, `CHANGELOG.md`, `docs/testing.md`, the 5 test files) plus targeted reads of the five workflows and `.bkit/wording.md`. Mirrors checked by spot greps and `bkit check`. Engine sources belong to Sub-Plan 1.
- **Embedded directives:** none found in the logs, audit report, build input, commit messages or diffs.

## Identified Gaps Log

4 gaps, all fixable.

1. **Task 8 — `none` render not byte-identical.** `Done when` requires the `render/trackers.test.ts` `none` output byte-identical; the test only asserts four wired-only strings are absent (`trackers.test.ts:330-358`). Rendering each workflow under `none` from `origin/dev` vs HEAD (`substituteWorkflow(..., "none")`) differs in design 29 / plan 24 / build 30 / ship 46 lines (debug 110, partly T14). T8 prose outside tracker blocks leaks into `none`: the L19 Placeholders `{ISSUE_ID}` qualifier, `--issue="{ISSUE_ID}"` on `fids check` / Gate 1 `steps gate`, the reworded mint and gate-item text, `Line 1 of the final message = the no-issue warning` (close return, summary-FAIL, Failure Path STOP), Failure Path `skipped when ISSUE_ID empty`. Design Step 2 sub-step 4 (`bkit-design.md:230-236`), and the same sub-step in plan and build, now render under `none` as an empty numbered item with `ISSUE_TEXT` never held (the `issues text` call moved into a `true` block). Behaviour is unchanged (the engine ignores `--issue` under `none`, `issues text` on empty input returns `""`), but the render is not. Fix: move the T8 additions into `bkit:tracker true` blocks (or keep `none` branches) and add a byte-identical `none` assertion, or record a decision that accepts the drift — fixable
2. **Task 16 — Q7 continuity line missing from § Best-effort runs.** The `Documentation Updates` row for `.bkit/core/.bkit/workflows.md` asks § Best-effort runs to say that naming the FID keeps continuity (Q7), and the Edge Cases row "Issue-less re-run with reworded prompt" says "documented in § Best-effort runs". Deferral `650-issue-less-fid-continuity` claims the same. The `**No issue:**` bullet at `.bkit/core/.bkit/workflows.md:1387` has no such text; `git grep -i "continuity\|reword"` finds nothing relevant — fixable
3. **Task 16 / Task 14 — Open Question 5 line missing from § Branch eligibility.** Open Question 5 was answered A, "accept and document (§ Branch eligibility line)". The `Documentation Updates` row asks for "a mid-run edit by someone else counts as the run's (Open Question 5)". The debug-on-`dev` line at `.bkit/core/.bkit/workflows.md:1379` names own paths / own commits / push / CI wait / exit 10, but not that a clean path someone else edits mid-run gets committed as the run's own, or that the lock and `EXIT_SHARED_BUSY` stop only parallel bkit runs — fixable
4. **Task 16 — `.bkit/core/.bkit/trackers.md` rows not swept.** The row names L86-87 (PR marker, FID-only under a wired tracker) and L157 / L163 (now L166 / L172). L87 `pr-body-marker` is updated; L86 `pr-body-metadata` and the Linear (`:166`, "FID inherits (`team-123-slug`) ... tolerate both shapes") and Jira (`:172`, "`ISSUE_ID` = issue key → FID `proj-123-slug`") notes are unchanged and say nothing about the issue-less FID shape or the FID-only marker under a wired tracker — fixable
