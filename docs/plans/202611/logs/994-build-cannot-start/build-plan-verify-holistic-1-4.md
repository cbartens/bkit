Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 286e7c3d7b57f6be4c0d33cdcb926f817308ea964e4fb43c902313b685a2ee7f
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups).

## Integration Gaps

0. The four groups agree with each other (details in Notes).

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS, Tasks 1-5, judged 2 groups before the challenge rounds added groups 3 and 4.
- `build-plan-verify-holistic-1-2.md`: CONCERNS, 1 gap (TASK 6: a differing copy over 1 MiB silently not kept); fixed by `build-plan-gaps-remediate-holistic-1-2-log.md`.
- `build-plan-verify-holistic-1-3.md`: PASS, Tasks 1-6, judged 3 groups before challenge round 2 added group 4 (TASK 7).
- Group reports read: `build-plan-verify-1-1.md` (CONCERNS: no byte-identical plan-log test; `build-plan-gaps-remediate-1-1-log.md` added one), `build-plan-verify-1-2.md` (PASS, Tasks 1, 2), `build-plan-verify-2-1.md` (PASS, Tasks 3, 4, 5), `build-plan-verify-3-1.md` (CONCERNS, docs drift; fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (PASS, Task 6), `build-plan-verify-4-1.md` (PASS, Task 7).

## Notes

- Mode: Holistic, judged against `tmp/bkit-diff-994-build-cannot-start.md`. No test-first audit report was supplied to this step, so Step 8 does not apply.
- Decision `build-decision-1-1.md` is a Fix-now (direction a) for TASK 6, not an accept, so it accepts no gap. The orchestrator answered it under the away policy; the owner did not type it.
- TASK 1 satisfied: `classifyConflict(file, embeds, fid?)` returns `"planlog"` through `isOwnPlanFile` after the ledger check; the classification case passes.
- TASK 2 held back. Its own DONE WHEN behaviours all hold: `rebasedFid` via `readRebaseState`, `takeDevSide` shared with `resolvePath`, `how: "dev"`, the `RESOLVED ... — took the rebase target's copy` line, the `NOT_RESOLVABLE` plan-file clause, and the end-to-end chain in `worktrees.integration.test.ts` (`setup` exits 3, `branches rebase` exits 0, `setup` exits 0) against a real bare remote. But the byte-identical clause of its Derived Test Matrix row has no working test (gap below). The test the group-1 remediation added for it appends instead of replacing, so the branch never ends on the target's bytes. Challenge round 2 recorded the same problem as LOW deferral `994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-test-ts-1091`; a deferral row does not satisfy a matrix row.
- TASK 3 satisfied: `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` exits 0 with no drift, and `cli-doc.test.ts` passes. The Tier 2 row and both `docs/testing.md` rows name the new cases.
- TASK 4 satisfied: `dist/commands/workflow/branches.js` and `worktrees.js` (built 00:03:43) are newer than their sources (23:53:39 and 22:24:06) and carry the `outboxRel` change. `node dist/cli.js check` exits 0. `git status` shows only this run's plan, `status.jsonl` and this report.
- TASK 5 satisfied: `bkit ledgers query` reports `951-build-rebase-plan-v2-reviewed-add-add-conflict` as `status: CLOSED`, and `git diff --numstat origin/dev...HEAD -- docs/failures.jsonl` is `1 0`.
- TASK 6 satisfied: a differing branch copy is kept under `{FID}/dropped-logs/{time}/{path}` through `droppedLogsDir` / `keepAside` (shared with `carryLeftovers`), the `RESOLVED` line names it, an identical copy keeps nothing, and a copy that cannot be read is refused.
- TASK 7 satisfied: the `RESOLVED` line names the kept copy through `outboxRel(top, kept)`; the 1 MiB test resolves the named path with `path.resolve(dir, ...)` before its `statSync`; the new test asserts a relative `.git/bkit-outbox/994-x/dropped-logs/...` path and no repo path in the log file.
- Integration between groups: group 4 changes only the path text on group 3's `RESOLVED` suffix, and group 1's tests match that line with `toContain`, so they still pass. The group 2 help text, `.bkit/core/.bkit/cli.md` / `.bkit/cli.md`, the Tier 2 row in `.bkit/core/.bkit/workflows.md` / `.bkit/workflows.md` (identical) and the failures-row remediation still describe the built behaviour; none claims the kept path is absolute. `Resolution["how"]` gains no new value. `worktrees.ts` does not import `./branches.js`, so no import cycle.
- Run constraints: every changed file is on the allowed list, a rendered copy (`.bkit/version` fingerprints, `.bkit/cli.md`, `.bkit/workflows.md`), a generated graph count (`DETAILS.md`, `docs/capabilities.md`) or an engine-written ledger row (`.bkit/friction.jsonl`, `docs/deferrals.jsonl`). No workflow or prompt file changed.
- Derived Test Matrix: 10 of 11 rows have a working test in a task's `DONE WHEN` / `TEST FIRST`; the byte-identical clause of row 2 does not (gap below).
- Test run (load 2.8): `pnpm exec vitest run` on `branches.test.ts`, `worktrees.integration.test.ts`, `worktrees.test.ts` and `cli-doc.test.ts` ran 4 files and 476 tests, all passed in 113.57s. `oxlint` on `branches.ts`, `branches.test.ts` and `worktrees.ts` exits 0. The full suite was not run here: the rules keep it for the pre-push hook and the workflow's final run.
- Open LOW deferrals from the challenge rounds (not gaps): `branches.ts-646` (misleading skip line), `branches.ts-553` (glob characters given to `git rm`), `branches.ts-907` (a feature id holding `/`), `branches.ts-565` (a throwing `keepAside` leaves the rebase in progress, exit 1). `branches.test.ts-1091` is the same problem as the gap below.
- Observability: `docs/observability.md` is present. Each settled plan file logs one `RESOLVED` line, and every refusal logs a `REFUSE ... ; routing to Failure Path` line.
- Every `Documentation Updates` row is done.

## Identified Gaps Log

1 gap.

TASK 2: `.bkit/core/engine/commands/workflow/branches.test.ts:1087` — Derived Test Matrix row "a plan log both sides added is settled on the rebase target's copy and the rebase completes (including a byte-identical copy that empties its commit)" still has no byte-identical test: `completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit` builds its commits through `commit()` (`branches.test.ts:237`), which calls `fs.appendFileSync`, so the branch tip holds `v1\ndev copy\n` while the target holds `dev copy\n` (reproduced in a scratch repo: blob `042f44d6` vs `0adb0429`) and the case repeats the differing two-round test; make the second branch commit replace the file's content, assert before the rebase that the branch tip's blob equals `main`'s, and assert after it that the rebase completed (exit 0, not in a rebase) with `dev copy\n` in the worktree (the open LOW deferral `994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-test-ts-1091` names the same fix and does not satisfy the row) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 2: the byte-identical plan-log test never gives the branch the target's bytes
  **Severity:** LOW · **Class:** test-matrix-gap · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.test.ts:1087` · **Round:** 1
  - **DONE WHEN:** The second branch commit in `completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit` replaces the plan log's content instead of appending to it (`commit()` at branches.test.ts:237 uses fs.appendFileSync); before the rebase the test asserts the branch tip's blob of the plan log equals main's; after it the test asserts exit 0, no rebase in progress and `dev copy\n` in the worktree, so the Derived Test Matrix clause "including a byte-identical copy that empties its commit" has a working test
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/branches.test.ts
<!-- bkit:task 1 end -->
