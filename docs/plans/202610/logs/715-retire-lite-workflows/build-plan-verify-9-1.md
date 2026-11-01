Verdict: FAIL
Failures: 3
Fixable: true
Tasks: 18

<!-- verdict:end -->

# Plan Verification

## Scope

Group 9

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-9-1.md` (changes since group 9 started). No group 9 `Deviations` section; no decision record covers group 9 (`build-decision-1-1` … `1-4` cover groups 3, 5, 6 and 7).
- TASK 18 satisfied. `ensureDiskSpace` / `sweep` / `waitForLock` take `maxWaitMs`; the default is `TIMEOUTS.DISK_SETUP_SWEEP_WAIT_S` = 60 in `.bkit/core/engine/shared/timeouts.ts`; `waitForLock` defaults to `LOCK_STALE_MS + pollMs` only when no bound is passed, so `bkit disk prune --wait` keeps its long wait and `--auto` still refuses `--wait`. The refusal text contains `another sweep ... re-run once it ends`, and `.bkit/core/engine/commands/workflow/worktrees.ts:788` turns it into `EXIT_DISK_FULL`. Red recorded 2026-11-01T02:59:30Z, unchanged since; the TEST FIRST test, `disk.test.ts` and `timeouts.test.ts` pass. `dist/` rebuilt in the same diff.
- TASK 19 not satisfied. Its workflow edit meets the DONE WHEN text: both handover fences branch on `PUBLISH`, the held branch drops `--push` and links with `--ref="{BRANCH}"`, which `handoverVerb` accepts without committing or pushing. `workflow-shape.test.ts:310` filters to the `--push` line. Three things block it. First, the test-first audit's `no-red` gap stays `Fixable: false`: plan currency does not class TASK 19 `Broken`, and the execute log has `BLOCKED — TASK 19`, not `already landed`. Second, the edit breaks 4 tests. Third, the mirrors were not re-rendered.
- Advisory, not a gap: on a held run the handover comment links `--ref="{BRANCH}"`, a branch that was never pushed to `origin`, so the link in the tracker comment points at a branch that does not exist on the remote.
- Full suite (`pnpm exec vitest run`): 4 failed / 8409 passed / 2 skipped; all 4 failures trace to the TASK 19 `bkit-build.md` edit.

## Identified Gaps Log

3 gaps.

TASK 19: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch` — no-red — Fixable: false
TASK 19: the `.bkit/core/workflows/bkit-build.md` Failure Path step 5 / Decision Pause step 8 edit breaks 4 tests the task did not fix — `.bkit/core/engine/render/trackers.test.ts` "bkit-build: the none render matches its baseline byte for byte" (`.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` not regenerated), `.bkit/core/engine/tools/instructions-coverage.test.ts` "has no coverage findings" (4 new lines at bkit-build.md:91/95/234/238 have no `.bkit/instructions.md` entry, the old step 8 entry is gone, `commits` / `pushes` drift at `bkit-build:356`, `secrets` carrier lost its tagged line), and `.bkit/core/engine/tools/instructions.test.ts` "has no findings" + "sync has nothing left to rewrite" (`workflow-keep-record` near-copy at bkit-build.md:90 — run `pnpm instructions:sync`); full `pnpm exec vitest run`: 4 failed / 8409 passed — Fixable: true
TASK 19: the dogfood mirrors were not re-rendered after the `.bkit/core/workflows/bkit-build.md` edit — `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md` and `.opencode/commands/bkit-build.md` still carry the single `--push` handover lines, so `bkit check` drift (a success criterion Task 16 met) no longer holds; run `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true
