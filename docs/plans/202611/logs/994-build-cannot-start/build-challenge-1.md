Verdict: CONCERNS
Failures: 2
Fingerprint: 409524089e14f8ec6cfb55b5da0b3edacbde463d0927c76eae4952325768e856
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-994-build-cannot-start.md` (full coverage, 1007 lines). Plan: `docs/plans/202611/994-build-cannot-start-plan.md`.
- Code read beyond the diff: `resolveRebase`, `rebaseVerb`, `appendLog`, `classifyConflict` callers, `rebuildRegisters` and `LEDGERS` in `branches.ts`; `ownershipMarker`, `carryLeftovers` and the resume rebase in `worktrees.ts`; `git` / `runGit` / `runCommand` in `lib.ts`; the `main()` catch in `cli.ts`; `promoteVerb` in `workflows.ts`; the `run`, `commit`, `git` and `inRebase` helpers in `branches.test.ts`.
- Docs: `.agents/docs.md`, `docs/architecture.md`, `docs/security.md` § PII and § CI Auto-Route Trust, the conflict recovery tiers in `.bkit/core/.bkit/workflows.md`, and the `docs/testing.md` rows the diff changes. None was missing.

## Notes

- Three LOW issues that round 1 recorded as OPEN deferral rows in the diff are still in the code: the `SKIPPED` wording after a plan-file replacement, glob pathspecs in `takeDevSide`, and a `/` in the feature id `rebasedFid` returns. They are not logged again.
- Checked and sound: the refusal check classifies every path before any is changed; the feature id is escaped and prefix-sharing ids refuse; `status.jsonl` stays a ledger; the target-deleted and branch-deleted stage shapes; the 64 MiB read limit; no import cycle from the new `branches.ts` to `worktrees.ts` edge; the 100-round cap against leftover plan branches (6 to 14 commits seen); merge-commit replays under `--rebase-merges`, where the merged `dev` parent is already an ancestor of the target; the `sync` docs-policy path is unchanged.
- The target-deleted keep-aside path that TASK 6's DONE WHEN names has no test. Traced by hand, it behaves correctly, so no failing test exists and it is not logged.
- `docs/testing.md` says "nothing kept for an identical copy", but identical blobs never conflict, so that branch cannot be reached and no test asserts it. This is a doc-accuracy point outside this lens.
- Outside this lens (privacy): the `RESOLVED` line names an absolute path under the git common dir, which holds the home folder and checkout path. All four workflows pass `--log-file="{LOG_DIR}/rebase-resolve-log.md"`, a tracked file that is committed and pushed, and `docs/security.md` § PII says to keep paths out of tracked records. None of the 16 tracked `rebase-resolve-log.md` files holds `/Users/` today. Proposed for a security review.
- Outside the change's main path: the `carryLeftovers` refactor swaps `fs.cpSync` for `readFileSync` plus `writeFileSync`, which follows a symlink and throws on a dangling one. It needs an untracked symlink at a path `dev` tracks, so it is not logged.
- A scratch-repository replay of the TASK 2 fixture was blocked by the permission system. TASK 2 rests on `commit()` using `fs.appendFileSync` (`branches.test.ts:240`) and on `pc-later`, which builds the same append shape and passes only because its second commit conflicts.
- No tests were run: this step challenges the diff only.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A full disk or a blocked outbox folder makes keeping the branch's plan-log copy throw, so `bkit branches rebase` crashes with exit 1 and leaves the rebase in progress and half resolved, with no abort, no sentinel and no JSON, instead of refusing
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:565` · **Round:** 1
  - **DONE WHEN:** `keptBranchCopy` in `.bkit/core/engine/commands/workflow/branches.ts` returns null when `droppedLogsDir` or `keepAside` throws, as it already does when `git cat-file` fails, so `resolveRebase` takes its existing `the branch's differing copy could not be kept aside` refusal. `bkit branches rebase` then exits 3, aborts the rebase, writes the `--sentinel` file, appends the log to `--log-file` and emits JSON with `outcome: refused` and `refused` naming the plan-log path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses and aborts the rebase when the branch's differing plan-log copy cannot be kept aside` fails on `run(dir, ["rebase"])` rejecting with `ENOTDIR` instead of returning code 3. Setup: `planClosed("pc-unkeepable", "feat/994-x", [{ [PC_LOG]: "branch copy\n" }], { [PC_LOG]: "dev copy\n" })`, then a regular file written at `.git/bkit-outbox/994-x`, so the keep-aside folder cannot be made. Expect `r.code` 3, `r.json` matching `{ outcome: "refused", refused: PC_LOG, aborted: true }`, and `inRebase(dir)` false.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** The test for a branch that ends on the target's exact plan-log bytes builds its commits with `commit()`, which appends, so the branch ends on `v1\ndev copy\n`, the test repeats the differing two-round case, and the byte-identical case that empties its commit is never run
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.test.ts:1091` · **Round:** 1
  - **DONE WHEN:** The second branch commit in `completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit` replaces the plan log's content instead of appending to it. Before the rebase, the test asserts that the branch tip's copy equals `main`'s. After it, the test asserts one round (`rounds: 1`), a completed rebase and `dev copy\n` in the worktree. The Derived Test Matrix row "including a byte-identical copy that empties its commit" is then covered.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit` fails on the added precondition `expect(git(dir, "show", "feat/994-x:" + PC_LOG).out).toBe("dev copy")`: the branch tip holds `v1\ndev copy`, because `commit()` writes with `fs.appendFileSync`.
<!-- bkit:task 2 end -->
