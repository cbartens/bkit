Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/locks.ts:533
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/worktrees.ts:341
- build-challenge round 1: LOW .bkit/core/engine/commands/lib.ts:1238
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/worktrees.ts:1512
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/worktrees.ts:1416
- 5 deferral(s) from this run remain open

Plan tasks: 9 of 9 ticked in `docs/plans/202611/1050-host-made-worktrees-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1050-host-made-worktrees-plan.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1050-host-made-worktrees/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 4 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-1.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-4-1.md` |
| build-challenge | CONCERNS | 2 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-1.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/worktrees.ts:351, resolved by build-plan-verify (group 4, task 9)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1050-host-made-worktrees/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1050-host-made-worktrees-plan.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-1.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1050-host-made-worktrees/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-1.md`, `docs/plans/202611/logs/1050-host-made-worktrees/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1050-host-made-worktrees/run-tests-1.md` |

## Challenge

- Task 9 — MEDIUM — ticked (`docs/plans/202611/1050-host-made-worktrees-plan.md`)
- LOW, deferred: 1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-locks-ts-533 — LOW build challenge finding at .bkit/core/engine/commands/workflow/locks.ts:533: After debug in place on dev from a linked worktree closes and releases its lock, its shared-checkout record stays under .git/worktrees/{name}/bkit/shared-checkout/{fid}.json, so a later bkit branches push --mode=dev from that worktree with no --fid picks the stale record and exits 0 with "nothing to push" instead of refusing with no record. Done when: `locks release --kind=workflow` removes the FID's shared-checkout record from the session's own checkout (`sessionCheckout(ctx.cwd)`) as well as from the main checkout, so the record `openSharedRecord(root, checkout, ...)` now writes under a linked worktree's git dir is gone once its lock is released, as `.bkit/core/.bkit/cli.md` line 241 states ("and the feature's shared-checkout record"); the existing "locks release removes the FID shared-checkout record" test still passes and another FID's record is still left in place. The diff moved where the record is written (`worktrees.ts:251` `writeRecord(checkout, rebuilt)`) but left this remover on `repoRoot(ctx.cwd)`, the main checkout.
- LOW, deferred: 1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-341 — LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:341: Plan or design adopted on a branch whose name is also a top-level path (for example docs or scripts), while local dev is ahead of origin/dev, exits 7 with "cannot inspect unpublished dev work for docs: fatal: ambiguous argument 'docs': both revision and filename" even when the branch carries none of those commits. Done when: `inheritedDevCommits` reads `branch` only as a revision (`rev-list {branch} --not origin/dev --`, or `refs/heads/{branch}` from the adopted call at `worktrees.ts:1414`), so adopted design / plan on a branch named like a top-level path adopts when the branch carries no unpushed `dev` commit and refuses with the "commit(s) of unpushed dev" message when it does. The diff made this reachable: adopted mode now passes the checked-out branch (any name) where the resume path only ever passed `feat/{fid}`. Verified on git 2.56: `git rev-list docs --not dev` exits 128 with that message beside a `docs/` directory, and both disambiguated forms exit 0.
- LOW, deferred: 1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-lib-ts-1238 — LOW build challenge finding at .bkit/core/engine/commands/lib.ts:1238: From a linked worktree that does not hold the run, statusLocation returns that worktree's committed copy of the FID's log directory (status logs are tracked and land on dev, so any branch cut after an earlier phase landed carries it) instead of the main checkout's live run, so failState appends workflow-failed to the stale copy and resolveActiveRun --fid misses the live run. Done when: The owner decides what proves that the session's linked worktree holds the run, because the plan's evidence (the log directory exists) is also true for every checkout whose branch carries a landed earlier phase, and no single predicate covers every adoption: the session's branch matching the run's branch covers `feat/{fid}` and debug on `dev`, but `statusLocation` is not told debug's `--branch`; an `IN_PROGRESS` row needs the file and misses the window before `workflows start`; a marker written by setup adds a new artifact. Reachable when setup adopts the main checkout from a linked worktree on another branch (no `--worktrees`, `session !== target`, so `adoptRoot` is the main checkout at `worktrees.ts:1343`). Before the diff this case resolved to the main checkout; the plan's edge-case table covers only an unrelated worktree whose log directory is absent. Once decided, the end state is that `statusLocation` from a linked worktree that is not the run's adopted checkout resolves to the main checkout even when that worktree carries a landed copy of the log directory.
- LOW, deferred: 1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1512 — LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:1512: A user whose core.hooksPath points outside the checkout (~/.githooks or /opt/git-hooks, which TASK 9 now expands) and whose directory is missing gets a stderr line saying the directory is missing in the worktree and telling the agent to run the package install there, which cannot create a directory outside the checkout, so the agent spends an install and the same warning returns on the next adopted setup. Done when: The stderr line tells the two cases apart by the resolved directory. When the directory lies inside the checkout (`path.relative(wt, dir)` neither starts with `..` nor is absolute), the line is unchanged. When it lies outside (an absolute path, a `~` path, or a relative path that escapes the checkout), the line names the resolved directory, says no git hook runs, and says to create that directory or change `core.hooksPath`, with no "is missing in {wt}" and no package-install remedy. `hooksMissing` still carries the configured value in both cases, and the `.husky/_` and `~` cases in "says so when the adopted worktree has no hooks directory" and "does not report a ~ hooks directory that exists" still pass.
- LOW, deferred: 1050-host-made-worktrees-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1416 — LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:1416: A checked-out branch named `--output=src/index.ts` (a cloned repo's default branch can carry the name) makes adopted plan / design setup run `git rev-list --output=src/index.ts --not origin/dev`, which empties that file and skips the unpushed-`dev` refusal. Done when: the adopted docs-only check passes the checked-out branch to `inheritedDevCommits` only as a qualified revision (`refs/heads/{adoptedBranch}` at `worktrees.ts:1416`, or `inheritedDevCommits` itself qualifying `branch` before the `rev-list` at `worktrees.ts:341`), so a branch name that starts with `-` is never parsed as a `git rev-list` option: plan setup in a main checkout on `refs/heads/--output=keep.txt` with local `dev` one commit ahead of `origin/dev` leaves `keep.txt` intact and exits 7 with "1 commit(s) of unpushed dev"; the host-made-worktree refusal and the no-remote adoption tests still pass. Verified on git 2.56: `git rev-list '--output=src/index.ts' --not origin/dev` exits 0 and truncates `src/index.ts` to 0 bytes; `git rev-list 'refs/heads/--output=src/index.ts' --not origin/dev` lists the commit and leaves the file alone; `--end-of-options` before the branch fails because `--not` then counts as a non-option. `git branch` / `git switch -c` refuse such names, but `git update-ref` + `git symbolic-ref` accept them, and `git clone` checks out a remote default branch of that name.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1050
```
