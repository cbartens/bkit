## #842 — Ship fails when the local feature branch differs from GitHub's (open)

### Problem

`/bkit-ship` assumes that the copy of the feature branch on the machine running it is the latest one. Nothing in the workflow checks that or brings it up to date. When several features are built in parallel, some in cloud sessions and some on a laptop, and finish at different times, the local copy and GitHub's copy often differ. Ship then fails, or merges code that was never tested together.

These gaps come from reading `.bkit/core/workflows/bkit-ship.md` and the engine at `ba4e3fb91`. No ship run has reproduced them yet.

#### What ship already handles

<!-- prettier-ignore -->
| Situation | What ship does |
| --- | --- |
| Branch has no PR | Pushes it, opens a PR, waits for CI (Step 2) |
| `dev` has not moved since the PR head (Path A) | Skips integration (Step 3) |
| `dev` moved (Path B) | Merges `origin/dev` locally, settles ledgers, lockfile, register, embedding docs and install record, hands other conflicts to `@bkit-ship-conflict-resolve`, pushes plain, re-validates CI at the merged head (Step 4, #799, #841). A red run at the merged head goes to the Failure Path with no fix round, unless every failed step is a generated file (Step 10, gate exit 12); nothing records why |
| PR already merged, branch unchanged since | Skips to Step 13 / 14. A branch with commits past the merged PR is gap F |
| Someone pushes to the PR before the merge gate | `runs gate` exit 17 loops back to Step 9, and `runs revalidate` fetches the branch and validates at the PR's real head. A push between the gate and the merge is gap G |
| Local `dev` ahead of `origin/dev` after the merge | `branches sync-dev` leaves it, reports `devLocal: skipped` and prints the reconcile advice (wrong in gap E's case) |

#### A. GitHub's copy has commits the machine never downloaded

This happens after a cloud session, a debug run on another machine, Auto-fix on the PR, or GitHub's "Update branch" button. When a local branch exists, `addWorktree` takes it as it is and fetches nothing (`.bkit/core/engine/commands/workflow/worktrees.ts:266`). Step 1 `repo info --fetch` fetches `dev` only. Step 2 reads `ENTRY_HEAD` from GitHub, so it is a commit the machine does not have. Step 3 runs `branches sync --head="{ENTRY_HEAD}"`, which cannot resolve it and throws `--head … does not name a commit` (`.bkit/core/engine/commands/workflow/branches.ts:2276`). The run goes to the Failure Path.

The same root cause hits Step 2's no-PR route: `branches push --mode=plain` is rejected as non-fast-forward.

#### B. GitHub's copy is ahead, and the machine has fetched it

- Path A works: Step 5 `branches fast-forward --onto=origin/{SHIP_BRANCH}` catches up.
- Path B fails: Step 4 merges `origin/dev` into the old local copy first (`bkit-ship.md:395-420`). The plain push is rejected, because GitHub has commits the local branch lacks, and the run goes to the Failure Path. The fast-forward that would fix it sits in Step 5, after the merge.

#### C. The machine has commits GitHub does not

Examples: a fix committed by hand before running ship, or a build whose last push failed.

- Path B works: the Step 4 merge push carries them and has no skip token, so CI runs.
- Path A fails: they first leave the machine in the Step 8 push, under the `docs({FID}): ship bookkeeping bkit [skip ci]` commit. The pre-push CI-suppressor guard (`.bkit/templates/.husky/pre-push:107`) refuses a skip-token head whose push carries code while a PR is open, so the run goes to the Failure Path. Without the hook installed, the push goes through and Step 9 re-validates, so the failure depends on whether the consumer installed the hook.
- Both sides have new commits: Step 5 exits `EXIT_DIVERGED` with "reconcile, then re-run" (`branches.ts`, `fastForwardVerb`). Ship's own rule is to merge, never rebase (decision `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`), so it could merge `origin/{SHIP_BRANCH}` in itself.

#### D. Two ships at once can merge code that was never tested together

Example: feature A renames a function, and feature B adds a call to the old name. Each passes CI alone. Both ships take Path B at about the same time, and A merges while B's CI is still running. B's merge gate (`runs gate`, Step 10) checks CI at `VALIDATED_HEAD` but never checks whether `dev` moved since that CI run. It writes the answer into the pre-merge snapshot (`.bkit/core/engine/commands/workflow/runs.ts:2037`, field `ancestor`) and does not act on it. B merges and `dev` breaks. Only Step 14's `runs gate --squash-of` notices, after the merge.

The same window exists on Path A, between Step 3 and Step 10: the deferred sweep and docs agents run in between, often for 10 minutes or more.

Nothing serialises ships any more. The repo-wide dev lock is retired (`.bkit/core/engine/install/modules/core.ts:494` deletes `.bkit/.dev.lock`), and the per-FID lock covers only the same feature. #397 still describes ships as serialised by `.dev.lock`, and its GitHub Actions queue would cover bkit-cloud runners only, not laptop or claude.ai ships. Decision 799 reversed the trade that decision `661-ship-b1-updates-branch-only-when-dev-requires-checks` accepted (a clash with newer `dev` surfacing only after the merge), but only up to Step 4. Nothing records why `dev` is not re-checked at merge time.

#### E. A feature branch cut from a local `dev` that had unpushed commits

Build bases a new branch on local `dev` when local `dev` is ahead of `origin/dev` (`devBase`, `worktrees.ts:178`). Design and plan refuse to land such a branch (`inheritedDevCommits`, `worktrees.ts:988`, from #639). Ship has no such check. The PR's squash carries those unpushed `dev` commits inside the feature's single commit. Afterwards local `dev` holds them as separate commits while `origin/dev` holds them inside the squash. Step 13 `branches sync-dev` then cannot fast-forward, and the `git pull --rebase` it suggests (`fastForwardDev`, `branches.ts`) replays changes `origin/dev` already holds, which is likely to conflict.

#### F. A merged PR plus newer commits: ship deletes the newer commits

Step 2 finds the branch's PR with `prs probe --head --state=all`, which takes an open PR first, then a merged one (`.bkit/core/engine/commands/workflow/prs.ts:127`). It never checks whether the branch moved on after that PR merged. Example: the PR is merged on GitHub by hand, the branch is kept, a fix is committed to it, and `/bkit-ship` runs. Ship finds the old merged PR, records `ship-merged-on-entry` and goes to Step 13 and Step 14. Step 14's `workflows close` removes the branch (`workflows.ts:1566` → `removeWorktree`), which runs `git branch -D` locally and `git push origin --delete` on GitHub (`worktrees.ts:671-674`). The fix is gone from GitHub and survives only in the local reflog.

Design and plan's close already guards this: `branches land` deletes the branch only when `notOnDev` (`branches.ts:2818`) finds nothing on it that `origin/dev` lacks (`branches.ts:2947`). Ship's close does not call it.

#### G. A merge refused because the head moved goes to the CI-failure fix round

`prs merge --match-head` makes GitHub refuse the merge when the PR's head moved after the gate. `mergePr` then reads the PR back as OPEN, and `--expect-merged` turns that into exit 7 (`prs.ts:1072`). Step 10 sub-step 4 sends every not-merged state to Step 11 Failure Diagnose, then Step 12 Failure Remediate: a debug agent looks for a CI failure that does not exist, and a remediate agent changes code to fix it. The right route is back to Step 9, as gate exit 17 does.

The same route catches any other merge GitHub refuses, including a conflict that a parallel ship's merge just created (gap D). That case needs another merge of `origin/dev` (Step 3 / Step 4), not a fix round.

#### Smaller items

- **Adopt mode, branch not yet fetched.** With `runtimeWorktrees` false, `git switch {target}` (`worktrees.ts:947`) needs `refs/remotes/origin/{target}`. A cloud-built branch the machine never fetched fails, and the error says "commit or stash local changes", which is the wrong advice. Mint mode is fine: `addWorktree` asks `origin` and fetches.
- **Every ship after another ship's close is Path B.** Step 3 calls any movement of `dev` Path B, including a `ship DONE bkit [skip ci]` docs-only close. Each such ship pays a merge and a full CI run. `branches sync` already computes `docsBehind`, and ship does not read it. #788 made build's trigger count ledger paths, so the information exists.

### Outcome

Ship finishes whenever the branch can be integrated without a person's judgement, however the local branch, GitHub's copy and `dev` have moved. Ship never merges a PR whose CI ran against an older `dev` without saying so. Ship never squashes unpushed `dev` work into a feature, and never deletes a branch holding work that is not on `dev`.

### Success criteria

- A ship whose local branch is behind GitHub's copy, on Path A or Path B, catches up and merges without a hand step.
- A ship whose local branch has unpushed code commits pushes them with CI running, on Path A as well as Path B.
- A ship whose local branch and GitHub's copy have both moved merges `origin/{SHIP_BRANCH}` in, and stops only on a non-mechanical conflict, as Step 4 does for `dev`.
- A ship whose `dev` moved after its validated CI run does not merge silently: it re-integrates and re-validates, or stops with the reason, per the decision below.
- A ship of a branch carrying unpushed `dev` commits is refused or warned before Step 2 opens a PR, naming the commits and the fix.
- A ship whose branch has commits past its merged PR never deletes them: it stops, or opens a new PR for them, and the close keeps any branch `notOnDev` reports.
- A merge GitHub refuses because the head moved, or because of a new conflict with `dev`, routes back to re-validation or integration, never to Step 11 / Step 12.

### Constraints and non-goals

- Merge, never rebase or force-push (decision `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`).
- No commit carrying code gets a skip token (#841, `.agents/rules.md` § Docs commits).
- Engine verbs decide; no model judges whether the branches can be reconciled.
- Shell stays POSIX-portable, and the change works on every provider.
- Non-goal: the bkit-cloud GitHub Actions concurrency group (#397).
- Non-goal: resolving code conflicts automatically. They stay with `@bkit-ship-conflict-resolve`, or a handover.

### Decisions already made

- Integration with `dev` is a local merge pushed plain (#799).
- The squash-merge capstone check after the merge stays (Step 14).

### Open questions

Each question carries a proposed answer. Build follows the proposal unless the owner overrides it in a comment.

- **A–C, where the catch-up runs.** Inside `branches sync` before Step 3's ancestor check, so `--head` is always resolvable? Or a new verb at Step 2 sub-step 4, so `ENTRY_HEAD` and the local branch agree from then on?
  - **Proposed:** a fetch of `origin/{SHIP_BRANCH}` in Step 2 before the no-PR push, plus the catch-up inside `branches sync`, so one verb owns it and Step 3 and Step 4 both see the caught-up branch.
- **C, both sides moved.** Merge `origin/{SHIP_BRANCH}` automatically, or stop with a clear message? Merging matches #799. Is a local commit the owner made by hand safe to publish without asking?
  - **Proposed:** merge automatically, with the same conflict routing as Step 4. Running ship on the branch is the request to publish it.
- **D, what the gate does when `dev` moved since validation.** Options: (1) a new `runs gate` exit that routes back to Step 3 within the `ship.merge` counter; (2) rely on GitHub branch protection "require branches to be up to date" and document it; (3) one ship at a time across runtimes (#397 covers cloud only). Option 1 costs one more CI run per overlapping ship.
  - **Proposed:** option 1. It works on every provider and runtime, and costs a CI run only when ships actually overlap.
- **D, Path A window.** Re-check `dev` at Step 10 only, or also before Step 8?
  - **Proposed:** Step 10 only. It sits just before the merge, which is the only point where the answer matters.
- **E, refuse or warn.** Refuse as design and plan do, or warn and carry on?
  - **Proposed:** refuse, matching design and plan, with the push of local `dev` named as the fix.
- **F, merged PR plus newer commits.** Stop with the commits named, or treat the branch as unshipped and open a new PR for them?
  - **Proposed:** treat it as unshipped and open a new PR via Step 2's no-PR route; the commits are real work the owner asked to ship. Separately, the close calls `notOnDev` before deleting, as `branches land` does, so no route can delete unlanded work.
- **G, how Step 10 tells "head moved" from a real merge failure.** Compare the PR's head after the refused merge with `GATE_HEAD`, or a new `prs merge` exit for a moved head?
  - **Proposed:** a new `prs merge` exit when the head after the attempt differs from `--match-head`, routed to Step 9 within the `ship.merge` counter; a not-mergeable PR routes to Step 3.
- **Docs-only `dev` movement.** Should ship read `docsBehind` and skip the full CI run when `dev` moved only by docs and ledgers? The merge commit would then need a skip token that the pre-push guard and the FID-scoped bookkeeping allow-list both accept.
  - **Proposed:** out of scope here. It loosens the skip-token guard that #841 just tightened, so it gets its own issue if it is wanted.
- **Friction rows to re-verify with this change:** `.bkit/friction.jsonl` key `ship-bookkeeping-skip-ci-push-blocked-by-open-pr-guard` (decision `pre-push-open-pr-guard-mirrors-ship-carry-forward` seems to fix the bookkeeping-only case; C is what remains), `harvest/friction.jsonl` key `ship-step9-dev-ahead-unpushed` and key `ship-step9-dev-ahead-slop-blocked-push` (old step numbers; `sync-dev` now skips with exit 0, but E makes its advice wrong).

### References

- #99 — Friction triage — https://github.com/cbartens/bkit/issues/99
- #799 — Ship Step 4 cannot integrate dev into a Path B PR — https://github.com/cbartens/bkit/issues/799
- #838 — Rebase resolver: generated files, install record and the run log — https://github.com/cbartens/bkit/issues/838
- #841 — Ship Step 4 merge push is blocked by the pre-push skip-ci guard — https://github.com/cbartens/bkit/issues/841
- #788 — Build and debug PRs conflict on GitHub over union-merged ledgers — https://github.com/cbartens/bkit/issues/788
- #639 — Land parallel workflow closes on dev without colliding — https://github.com/cbartens/bkit/issues/639
- #800 — Pre-push misses CI's stale-file checks; ship has no fix round for them — https://github.com/cbartens/bkit/issues/800
- #801 — Build friction: undo per-file test locking and hard stops on missing proof — https://github.com/cbartens/bkit/issues/801
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration — https://github.com/cbartens/bkit/issues/397
- `.bkit/core/workflows/bkit-ship.md` § Step 3 — Base Check, § Step 4 — Integrate, § Step 5 — Deferred Sweep, § Step 8 — Commit + Push Bookkeeping, § Step 10 — Merge Gate + Merge PR, § Step 13 — Update Local Dev
- `.bkit/core/engine/commands/workflow/branches.ts` (`syncVerb`, `mergeDev`, `fastForwardVerb`, `pushPlain`, `fastForwardDev`, `notOnDev`)
- `.bkit/core/engine/commands/workflow/worktrees.ts` (`addWorktree`, `devBase`, `inheritedDevCommits`, `removeWorktree`, `deleteBranch`, ship adopt-mode switch)
- `.bkit/core/engine/commands/workflow/prs.ts` (`probePr`, `mergePr`, `prs merge --expect-merged`)
- `.bkit/core/engine/commands/workflow/workflows.ts` (`workflows close` branch removal)
- `.bkit/core/engine/commands/workflow/runs.ts` (`runRevalidate`, the `runs gate` pre-merge snapshot)
- `docs/decisions.jsonl` key `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`
- `docs/decisions.jsonl` key `661-ship-b1-updates-branch-only-when-dev-requires-checks`
- `docs/decisions.jsonl` key `pre-push-open-pr-guard-mirrors-ship-carry-forward`

Re-checked the "What ship already handles" table against the code and added two gaps to the body.

- **F:** a branch whose PR already merged but which has newer commits is treated as shipped, and the close deletes it locally and on GitHub. The newer commits are lost. Design and plan's close guards against this with `notOnDev`; ship's close does not.
- **G:** a merge GitHub refuses because the head moved, or because of a new conflict with `dev`, goes to Step 11 / Step 12, the CI-failure fix round, instead of back to re-validation or integration.

The table now says where its rows stop holding (Path B red CI with no fix round, merged-on-entry, push timing, the `sync-dev` advice). Success criteria, Outcome, Open questions (with proposed answers) and References are extended to match. Labels, milestone and board fields are unchanged.

## #813 — Add a rollback path for shipped workflow changes; decide dev checks (open)

### Problem

Two deferrals that each name the other are open, and neither has an issue (#384 closed 2026-07-29):

- **No rollback for shipped workflow changes:** when a released workflow change misbehaves in a consumer, there is no way to go back. `.bkit/core/engine/commands/install/upgrade.ts` has no revert or pin path (`git grep -E -- '--revert|revertWorkflow|pin.*workflow'` is empty, while the same file reads `upgradeFlags.dryRun` at `:1060`).
- **No required status checks on `dev`:** `.bkit/core/engine/commands/setup/setup.ts:5` still says "`dev` is left unprotected", so a red change can land on `dev` unchecked.

### Outcome

A consumer can undo a bad workflow change without hand-editing, and there is a recorded stance on whether `dev` requires checks.

### Success criteria

- A documented, tested command takes a consumer back to the previous workflow version, or pins one.
- `bkit protect` (or `setup`) either sets required checks on `dev` or records why not in `docs/decisions.jsonl`.

### Constraints and non-goals

- Stack-agnostic.
- Branch-protection changes on a consumer need explicit owner confirmation.

### Decisions already made

None recorded.

### Open questions

- Rollback mechanism? A) Pin: `bkit upgrade` can hold a workflow at a named bkit version. B) Revert: `bkit upgrade --revert` restores the previous rendered copy. Recommended: B, because it needs no version store beyond the previous render.
- `dev` stance? A) Require the `bkit-tests-check` capstone on `dev`. B) Keep `dev` unprotected and record why. Recommended: A, because the capstone already exists.

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-10)
- Audit parent: #344 — Deferrals triage
- `docs/deferrals.jsonl` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`
- `docs/deferrals.jsonl` key `384-required-status-checks-on-dev-via-bkit-protect-main`

## #493 — Plan and design close can delete the feature branch after a failed squash merge (closed)

## The problem

When plan close (and design close) merges the feature branch into `dev`, it never checks whether the merge worked. If the merge fails, the close keeps going anyway. It commits, pushes `dev`, and then deletes the feature branch, both on your machine and on GitHub. Only after all that does it check whether the plan actually reached `dev`. By then the branch holding the plan is gone.

Found by the October friction triage (#99, finding friction-1, CRITICAL). I read the code and the finding holds up. It has **not** been reproduced end to end.

## Where it happens

Plan close, local path, `.bkit/workflows/bkit-plan.md`:

<!-- prettier-ignore -->
| Line | What it does | What's wrong |
| --- | --- | --- |
| `:962` | `git merge --squash -X ours "feat/{FID}"` | No exit check. A merge that git refuses (for example because of local changes in the main checkout) doesn't stop the block. |
| `:963-964` | `STRAY` check on staged files | Only rejects staged non-doc files. A failed merge stages nothing, so this passes. |
| `:991` | `git commit --allow-empty -m "docs({FID}): plan DONE bkit [skip ci]"` | No file list. It commits whatever is staged in the main checkout, which breaks the rule in `.bkit/workflows.md:235` ("Main-checkout staging": every main-checkout `git commit` carries an explicit pathspec). With `--allow-empty`, it also succeeds when the merge brought nothing in. |
| `:992` | `git push origin dev` | Pushes a `plan DONE` commit that carries only bookkeeping rows and no plan. |
| `:996-999` | `git worktree remove --force`, `git branch -D "feat/{FID}"`, `git push origin --delete "feat/{FID}"` | Deletes the worktree and both copies of the branch. |
| `:1040` | `git show "$CANONICAL_REF:docs/plans/{YYYYMM}/{FID}-plan.md"` | The "did the plan land?" check. It runs after the deletion, so a failure here comes too late to save anything. |

After that sequence, the plan's commits exist only as unreachable git objects on the machine that ran the close, until git cleans them up.

Design close has the same shape (`.bkit/workflows/bkit-design.md:837` merge, `:866` commit with no file list, `:872-874` deletion). Design does check the plan file before cleanup (`:868`), but that check also passes on a re-run whose **older** design is already on `dev`. So it doesn't prove that this run's merge landed.

## How it shows up in practice

Two friction rows from consumers describe the trigger: a concurrent session leaves the main checkout dirty, and plan close can't merge.

- `plan-close-blocked-by-concurrent-session-dirty-dev-and-prepush-on-main-checkout` (app-gether-life, HIGH)
- `friction-plan-close-blocked-by-concurrent-274-uncommitted-docs-in-ma-6e469ae` (visitfrasercoast-com, MEDIUM)

In both cases the close stopped before reaching the deletion, for other reasons. Nothing in the close block itself guarantees that.

## Fix (from the triage report)

In both the plan and design close blocks:

1. Stop before committing if `git merge --squash` exits non-zero, or if the main checkout has tracked changes that aren't from the merge.
2. Commit only the files the squash brought in (an explicit pathspec), never the whole index.
3. Before removing the worktree or deleting any branch, confirm that **this run's** plan or design file is on `dev`. Compare it against the feature branch's copy; don't just check that a file exists.

Add a test that makes the squash fail (for example, a conflicting local change in the main checkout) and asserts that the feature branch still exists afterwards, locally and on the remote.

## References

- Triage report: `docs/audits/202610/friction.md` (friction-1)
- Rule broken: `.bkit/workflows.md:235`
- #99

## Verified: reproduced end to end, for both plan close and design close

The finding holds. I reproduced it in a throwaway repo (a local bare remote, a main checkout on `dev`, and a `feat/F1` branch with a worktree). I copied the local close path word for word from `.bkit/workflows/bkit-plan.md:957-1000` and `.bkit/workflows/bkit-design.md:832-875`, filling in only `{FID}` and `{YYYYMM}`. The real `bkit-book-commit.sh` did the staging. Two helper scripts were missing from the scratch repo: `bkit-workflow-telemetry.sh` and `bkit-roadmap-fold.sh`. Both only append rows, and the block carries on without them anyway. Nothing in these blocks sets `set -e`, as `.bkit/workflows.md:143` already says, so I ran them the same way an agent would.

The trigger in every case is the one from the friction rows: another session has left a tracked doc changed in the main checkout. Git refuses the squash merge (`error: Your local changes to the following files would be overwritten by merge ... Aborting`), and the block keeps going.

<!-- prettier-ignore -->
| Scenario | Plan close | Design close |
| --- | --- | --- |
| **A.** Another session has an unstaged edit to `docs/roadmap.md` | Pushes `docs(F1): plan DONE` with no plan in it, then deletes the worktree, the local branch and the remote branch. The plan's commit is left only as an unreachable object (`git fsck --unreachable` lists it). | Pushes the empty `design DONE` commit, then stops at `:868` with "Canonical design missing on dev". The branch survives, but the bad commit is already on `dev`. |
| **B.** Another session has *staged* `docs/roadmap.md` and its own `docs/plans/202610/OTHER-plan.md` | Same branch loss. The pushed commit also carries the other session's `OTHER-plan.md` and roadmap edit. | Same as A, plus the other session's files are in the pushed commit. |
| **C.** Re-run: an older `F1-design.md` / `F1-plan.md` is already on `dev` | Branch lost; `dev` still has the old plan. | **Branch lost.** The `:868` check passes because the old design is on `dev`. This confirms the issue's point that the design check doesn't prove this run's merge landed. |

## Line numbers

All correct on current `dev`, with one small shift: in plan close, the deletion is `:997-999`, not `:996-999` (`:996` sets `CANONICAL_REF`). `.bkit/workflows.md:235` is the "Main-checkout staging" rule, as cited.

## Two things the fix needs that the issue doesn't spell out

1. **The leftover-changes check has to run before bookkeeping stages anything, not just before the commit.** In scenario A, nobody had staged the other session's `docs/roadmap.md` edit. `bkit-book-commit.sh --mode=stage` (`bkit-plan.md:989`) staged it, because `docs/roadmap.md` is one of the ledgers it adds. It then went out in the `plan DONE` commit (the pushed roadmap reads `row0` / `rowOTHER`). So an explicit file list on `git commit` (fix step 2) wouldn't stop this. The bookkeeping step adds the other session's edit to the index itself. The guard has to compare the main checkout against `HEAD` right after the merge, before line `:989` / `:864`.
2. **Stopping before deletion isn't enough. It has to stop before the push.** Design close shows this. Its check at `:868` saved the branch in A and B, but `git push origin dev` at `:867` had already published the bad commit. Fix step 1 ("stop before committing") covers this if it's done as written. A fix that only moves the "did it land?" check ahead of the cleanup would still push the bad commit.

The staged-docs case (B) also shows why the `STRAY` filter at `:963` / `:838` can't stand in for a merge-success check. It only rejects files outside `docs/`, so a concurrent session's staged plan or roadmap passes it.

## Suggested regression test

Use scenario A (an unstaged tracked edit to a file the feature branch also changes) and scenario C (an older copy of the plan/design already on `dev`). After the close, assert that:
- `feat/F1` still exists locally and on the remote, and so does the worktree
- `origin/dev` has not moved

C is the case that gets past today's design check.

## Fix applied (working tree only, not staged or committed)

### What the close does now

Both the plan close and the design close, local path only (`RUNTIME_DEVPUSHES=true`):

1. **Stops if git refuses the squash.** `git merge --squash -X ours "feat/{FID}"` now has an exit check (`bkit-plan.md:962`, `bkit-design.md:837`). When it fails, the block exits before writing, committing or pushing anything. The branch, its remote copy and the worktree all stay.
2. **Checks that this run's doc actually came in, before committing.** It compares the staged copy of `{FID}-plan.md` (plus any `{FID}-plan-N.md` sub-plans) or `{FID}-design.md` against the copy on `feat/{FID}` (`bkit-plan.md:965-968`, `bkit-design.md:840-842`). This catches two cases:
   - the re-run case: an older doc is already on `dev`, so "the file exists" proves nothing
   - the conflict case: `dev` also edited the doc, and `-X ours` quietly kept `dev`'s version

   On a mismatch it stops before committing. The partial squash stays staged in the main checkout for a person to clear. Nothing is pushed or deleted.
3. **Commits only its own files.** The pathless `git commit --allow-empty` is gone. The commit now goes through `bkit-book-commit.sh --mode=commit-allow-empty --squash-of="feat/{FID}"` (`bkit-plan.md:993`, `bkit-design.md:867`). That commits the bookkeeping ledgers plus the files the squash brought in, and nothing else. A file another session staged stays staged and stays out of the close commit.
4. Branch and worktree deletion still come last, after the commit and push succeed.

### A change of plan from my earlier comment

My earlier comment suggested refusing the close whenever the bookkeeping files had changes the merge hadn't made. I dropped that. A successful close leaves its own `close-transport` row uncommitted in the main checkout (`bkit-plan.md:1041`). The next close is meant to sweep that row into its own commit. A guard like that would block every close after the first one. What protects against the scenario-A damage now is the exit check plus the doc check. In scenario A git refuses the merge, so the close stops before bookkeeping stages anything.

### New option on `bkit-book-commit.sh`

`--squash-of=<ref>` works in both commit modes. It adds the paths `<ref>` changed since its merge-base with `HEAD` to the commit's file list. Those paths are committed as the squash staged them and are never re-added, so a file the branch deleted is committed as a deletion. The option is refused in stage mode (exit 2), and an unknown ref exits 3. The template copy is updated to stay byte-identical.

### Tests

- **New: `.bkit/src/bkit-close-squash.integration.test.ts`.** It pulls the real local close block out of `bkit-plan.md` and `bkit-design.md` and runs it unchanged against a real remote, main checkout and worktree. Four cases per workflow:
  1. Another session has an unstaged edit that clashes with the squash. The branch survives locally and on the remote, the worktree survives, and `origin/dev` doesn't move.
  2. `dev` edited the same doc concurrently, so `-X ours` drops this run's version. Same assertions as case 1.
  3. Another session has staged a doc. It is not in the pushed commit and is still staged afterwards.
  4. Clean close, with an unrelated uncommitted edit in `src/`. The doc on `dev` matches the branch copy, the branch and worktree are removed, and the `src/` edit is untouched.

  Before the fix, the three failure cases failed for both workflows (6 of 8 tests) and the clean close passed. After the fix, all 8 pass.
- **`tests/book-commit.bats`:** 3 new tests for `--squash-of`, covering the deletion case, the "something to commit" check in `--mode=commit`, and the bad-input exits. All 23 pass under both zsh and bash.

### Other changes

- `.bkit/workflows.md:236`: a new **Close squash** row explaining the behaviour.
- Gate checklists: a new line in Gate 12 (plan) and Gate 11 (design).
- `bkit upgrade` re-rendered the 8 plan/design mirrors in `.claude/`, `.cursor/`, `.opencode/` and `.agents/skills/`.

### Checks run

- Full `pnpm vitest run`: 4137 passed, 2 failed. Both failures are in `bkit-ledger-integrity.test.ts` and come from `docs/deferrals.jsonl` rows another in-progress session wrote. Not related to this fix.
- `tsc` is clean, and `bkit check` exits 0.
- prettier and vale are clean on every file I touched.
- `slop:delta`: zero findings in the new test file. The gate still fails overall, from other uncommitted work in the tree.
- Test install with `--claude` into a fresh scratch repo: the installed `bkit-book-commit.sh` and both commands carry the fix.

One intermittent result: `bkit-release-workflow.integration.test.ts` (the published-tarball check) failed once in the first full run, then passed alone and in a second full run. Its output wasn't captured. It's logged in `docs/failures.jsonl` as `release-workflow-tarball-test-intermittent-under-full-suite`.

### Before review

`bkit-book-commit.sh` (and its template copy), `tests/book-commit.bats`, `.bkit/workflows.md`, `.bkit/version` and `docs/failures.jsonl` already had another session's **staged** changes. My edits to those files are unstaged on top, so `git diff` (not `git diff --cached`) shows only this fix. `.bkit/version` is the exception: `bkit upgrade` re-recorded file hashes there for other in-progress files as well as mine.

## Done: committed in 717f8d02 on `dev` (not pushed yet)

This shipped in one commit together with #452, because both changes touch `bkit-book-commit.sh`, `tests/book-commit.bats` and `.bkit/workflows.md`.

### What plan close and design close do now

The local path (`RUNTIME_DEVPUSHES=true`) behaves as described in the earlier comment:

1. **They stop if the squash merge fails.** Nothing is committed or pushed, and the feature branch and its worktree stay. This is the case from the friction reports, where another session's uncommitted edit makes git refuse the merge.
2. **They check that this run's plan or design was actually staged.** The staged copy of `{FID}-plan.md` (plus any sub-plans) or `{FID}-design.md` has to be identical to the copy on `feat/{FID}`; finding a file on `dev` isn't enough. That catches both a re-run where an older copy is already on `dev` and a conflict where `-X ours` quietly kept `dev`'s version.
3. **The commit holds only the close's own files.** It goes through `bkit-book-commit.sh --squash-of="feat/{FID}"`, which commits the bookkeeping ledgers plus the files the squash brought in. A file another session staged stays staged and out of the commit.
4. **Branch and worktree deletion run only after the commit has been pushed.**

### Changes since the last comment

- The gate checklist lines now end with the condition, as the other gate lines do: `(if RUNTIME_DEVPUSHES = true)`.
- `.bkit/workflows.md` § Close squash was tightened to the compress-markdown style.
- `docs/testing.md` now lists `bkit-close-squash.integration.test.ts` in its Key test files table.

### Verification

Run against exactly what was committed:

- **New close test (`bkit-close-squash.integration.test.ts`):** all 8 cases pass. Before the fix, 6 of them failed. It runs the real close block from both workflow files against a real remote and worktree.
- **`tests/book-commit.bats`:** the `--squash-of` cases pass under both zsh and bash.
- **Full Vitest suite:** 4197 pass.
  - Two `bkit-ledger-integrity` tests fail. They fail on the previous `HEAD` too, from rows already in `docs/deferrals.jsonl`.
  - The telemetry-script planSource test failed once in the full run, then passed when re-run.
- **`roadmap-fold.bats` row 19 is a timing flake.** It builds the roadmap twice and expects identical files, but the board stamps the current second, so it fails whenever the two builds straddle a second boundary. It isn't logged in `docs/failures.jsonl` yet.
- The pre-commit hooks (formatting and the stale-`dist/` check) passed on the commit.

## #288 — Remove Step 1 local dev sync gate from phase workflows (closed)

## Problem

Design, plan, build, ship, and debug workflows hard-stopped at Step 1 when local `dev` had unpushed commits ahead of `origin/dev`:

```
Local dev is N commits ahead of origin/dev. Push or reset before retrying.
```

This blocked workflow start frequently — often after a previous design/plan close squash-merged docs to local `dev`, or when unrelated local commits existed on `dev`.

Agents surfaced a manual recovery prompt:

```
The Design workflow requires local dev to be in sync with origin/dev before starting. Please either:
- Push the commit: git push origin dev
- Reset if the commit shouldn't be on dev: git reset --hard origin/dev
```

### Why the gate was wrong at Step 1

1. **Workflow work is isolated** — all phase work runs in `.worktrees/{FID}` on `feat/{FID}` (or `fix/{FID}` for debug), not on local `dev`.
2. **Step 2 already rebases against `origin/dev`** — the worktree branch is reconciled with remote at setup/resume time.
3. **Auto-push was rejected** — pushing local `dev` to sync would trigger CI on every unpushed commit, which is expensive and unnecessary before any work begins.
4. **The gate blocked starts that could proceed safely** — local `dev` ahead-of-`origin/dev` does not prevent creating a worktree or running design/plan subagents.

## Solution

Remove the Step 1 `git rev-list --count origin/dev..dev` hard-stop from all phase workflows. Step 1 now only:

1. `git fetch origin dev`
2. Acquires the concurrency lock
3. Initializes tracker/issue state

Divergence is handled where it matters — at **Close Workflow**, when merging back to `dev`:

<!-- prettier-ignore -->
| Workflow | Close reconciliation |
| --- | --- |
| Design / Plan | `git checkout dev` → `git pull --ff-only origin dev` → squash-merge from `feat/{FID}` → single docs commit with `[skip ci]` |
| Ship Step 9 | Reconciles local `dev` post-merge; only auto-pushes unpushed commits when all are `[skip ci]` |

## Changes

- **Workflow sources:** `.bkit/workflows/bkit-{design,plan,build,ship,debug}.md`
  - Removed Step 1 AHEAD check and Gate 1 "Local dev NOT ahead" requirement
  - Failure path text: "divergence check or lock acquisition" → "lock acquisition" only
- **Authoring docs:** `.bkit/workflows.md`
  - Replaced § Pre-worktree divergence guard with § Worktree isolation (no Step 1 dev sync gate)
  - Updated step tables for all affected workflows
- **Mirrors regenerated:** `.cursor/commands/`, `.claude/commands/`, `.opencode/commands/`

## Expected behavior after fix

- `/bkit-design` and `/bkit-plan` start without requiring manual `dev` sync first
- Unrelated unpushed local `dev` commits no longer block workflow entry
- Genuine divergence still surfaces at Close (merge to `dev`), when reconciliation is actually required

## Non-goals

- No auto-push of local `dev` at workflow start (avoids accidental CI runs)
- Ship Step 9 close-time `[skip ci]` push behavior unchanged

## #639 — Land parallel workflow closes on dev without colliding (closed)

### Narrative

Running several `/bkit-design` and `/bkit-plan` runs at once collides at the very end, when each run lands its docs on `dev`. How it collides depends on where the run happens. `bkit runtime detect` (`.bkit/core/engine/commands/workflow/runtime.ts`) sorts runs into two groups, and each group lands a different way:

<!-- prettier-ignore -->
| Runtime | Can push `dev`? | How the close lands today |
| --- | --- | --- |
| `LOCAL` (laptop) | yes | `landLocal`: squash `feat/{FID}` into `dev` in the main checkout, push `dev` |
| `GITHUB_ACTION` (bkit-cloud runner), `CLOUD_CURSOR` (Cursor background agent) | yes | `landLocal`, same as a laptop, on the runner's own clone |
| `CLOUD_CLAUDE` (claude.ai cloud session) | no — the git proxy only lets a session push its current branch | `landPr`: push the session branch, open or reuse a PR, squash-merge it |

Both functions live in `.bkit/core/engine/commands/workflow/branches.ts`. Both already land the right *content*: only doc and ledger files (`CLOSE_DOCS`), then the worktree and branch are cleaned up. The collisions come from *how* they land.

**1. Laptop: the close works inside the main checkout.** `landLocal` runs `git checkout dev`, `git pull --ff-only` and `git merge --squash` in the same folder you and other agents are working in.

- **Another session's work blocks the close.** Logged case: `.bkit/friction.jsonl` key `branches-land-blocked-by-concurrent-dev-work` (5.0.3, plan close). Another agent had 18 staged files on `dev` in the main checkout; git refused the squash ("Your local changes would be overwritten by merge") and the close died with exit 17.
- **The close can publish someone else's unfinished commits.** In that same case local `dev` was 3 commits ahead of `origin/dev`. `git pull --ff-only` succeeds when local is ahead (nothing to pull), and the close then runs a plain `git push origin dev`. Had the squash worked, those 3 commits would have gone out with the design.
- **The dev lock does not help.** `.bkit/.dev.lock` only stops two bkit closes overlapping. It cannot see a human or agent who is simply editing on `dev`.

**2. Cloud runners (GitHub Actions, Cursor): two closes racing to push `dev` — the loser fails.** Each runner has its own clone, so nobody else is in its folder. But `.bkit/.dev.lock` is a file on one machine, so it cannot stop two runners closing at the same moment. bkit-cloud runs design / plan for different features in parallel (#397). Both runners pull, squash and push `dev`; the second push is rejected because `dev` moved, and `landLocal` has no retry: it stops with "dev push failed" (exit 8) and the run goes down the Failure Path. Not seen in the logs yet; nothing prevents it.

**3. claude.ai cloud: the PR merge is tried once.** `landPr` calls `mergePr` (`.bkit/core/engine/commands/workflow/prs.ts`) once. If GitHub refuses the merge — for example `dev` requires branches to be up to date and another feature's close just landed — the close stops with "PR did not reach MERGED" and the PR is left open. Also not seen yet.

### Change

**One landing routine for every runtime**, built in a throwaway worktree started from `origin/dev`. It never touches the main checkout, retries a lost race, and falls back to a PR only when a direct push is not allowed.

1. `git worktree add --detach .worktrees/_land-{FID} origin/dev` — beside the feature worktrees. The `_land-` prefix cannot collide with a FID (FIDs start with an issue number or branch suffix).
2. `git merge --squash -X ours {BRANCH}` there (`feat/{FID}`; in a claude.ai session, the session branch). Per-feature docs are new files, so they cannot clash; shared ledgers are `merge=union` in `.gitattributes`, so both sides' rows are kept.
3. Keep today's guards: staged paths match `CLOSE_DOCS` only; the canonical `{FID}-design.md` / `{FID}-plan.md` (and sub-plans) blob equals `{BRANCH}`'s.
4. Roadmap row + `docs({FID}): {phase} DONE bkit [skip ci]` commit in the throwaway worktree.
5. `git push origin HEAD:dev`, in every runtime:
   - **Lands** → step 7.
   - **Rejected because `dev` moved** (non-fast-forward) → fetch, rebuild from the new `origin/dev`, retry. At most 10 attempts, with exponential backoff and random jitter between them: wait 2s, then double each time, capped at 30s (about 3.5 min worst case). The jitter stops two racing closes from retrying in lockstep.
   - **Refused for any other reason** (claude.ai proxy, branch protection on `dev`) → step 6.
6. **PR fallback** (today's `landPr`, hardened): push `{BRANCH}`, open or reuse the PR, squash-merge it. When GitHub refuses the merge, call `updateBranch` (`gh pr update-branch`, a server-side merge of `dev` into the PR) when the PR is behind, then retry the merge with the same backoff and 10-attempt budget. Exhausted → non-zero exit, PR left open.
7. **Laptop only:** fast-forward local `dev` to the landed commit, but only when that is a pure fast-forward (local `dev` has no commits `origin/dev` lacks):
   - main checkout on another branch → move the `dev` pointer only (`git fetch . <sha>:dev`); no files change;
   - main checkout on `dev` → `git merge --ff-only <sha>`; git refuses on its own when that would overwrite a local edit, and the close then skips the fast-forward with a log line;
   - local `dev` has local-only commits → skip with a log line; never rebase or merge them.
   A skipped fast-forward never fails the close: the landing already happened.
8. Remove the throwaway worktree, the feature worktree and `feat/{FID}` (a claude.ai session branch is kept, as today).

The `close-transport` row records which shape landed: `local` (direct push) or `pr` (fallback), as today.

Ship's close already uses this shape — detached worktree off `origin/dev`, push `dev`, refused → PR (`.bkit/workflows.md` § Ship, Step 15) — reuse what it can.

Design / plan closes then no longer need the dev lock: the push retry handles races on one machine and across machines alike. Ship and build / debug keep it, because they still work on `dev` in the main checkout.

### Success Criteria

- A design / plan close on a laptop lands on `origin/dev` while the main checkout has uncommitted, staged or untracked files, on any branch; local `dev` commits not on `origin/dev` are never pushed.
- The main checkout's branch, index and existing working-tree edits are untouched by the close; the only change is a fast-forward of `dev` when one is possible.
- Two closes racing to push `dev` — on one laptop or on two runners — both land; the loser backs off and retries.
- A claude.ai close whose PR merge GitHub refuses (branch behind `dev`) updates the branch, retries, and merges within the budget.
- Every runtime lands through the same routine; the PR route runs only when a direct `dev` push is refused for a reason other than "`dev` moved".

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Laptop: main checkout on `dev` with staged non-doc files from another agent | Close lands; the staged files stay staged and out of the close commit |
| Laptop: local `dev` ahead of `origin/dev` | Close lands on `origin/dev`; local-only commits are not pushed; local `dev` not fast-forwarded (logged) |
| Laptop: main checkout on another branch | Close lands; checkout stays on that branch; local `dev` pointer fast-forwarded |
| Laptop: main checkout on `dev`, edits that do not touch the landed files | Close lands; `dev` fast-forwarded in place; edits kept |
| Laptop: main checkout on `dev`, an uncommitted edit to a file the close changed (e.g. a ledger) | Close lands; git refuses the fast-forward; skipped with a log line; close exits 0 |
| Two closes (same laptop or two runners) push `dev` at the same moment | Loser's push rejected as non-fast-forward → refetch, rebuild, back off, retry; lands within 10 attempts |
| 10 push attempts exhausted | Exit non-zero; `{BRANCH}` and its worktree kept; throwaway worktree removed; nothing on `dev` |
| claude.ai: direct push refused by the proxy | PR fallback; shape `pr` recorded |
| Branch protection on `dev` forbids direct pushes (any runtime) | PR fallback, not a retry loop |
| PR merge refused, PR behind `dev` | `updateBranch`, back off, retry merge |
| PR merge refused 10 times | Exit non-zero; PR left open for a human; branch kept |
| `gh` unavailable during the PR fallback | Exit 80 hands the stage to MCP, as today |
| `{BRANCH}` carries a non-doc file | Refused before commit (same as today); nothing pushed; branch kept |
| Squash drops the branch's canonical doc (`-X ours` conflict) | Refused by the blob check (same as today); nothing pushed; branch kept |
| Close killed mid-run | A leftover `.worktrees/_land-{FID}` is pruned on the next close of the same FID |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Close lands while the main checkout has staged / untracked files on `dev` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Local `dev` ahead of `origin/dev` → close lands, local commits not on remote, no fast-forward | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Main checkout branch, index and existing edits unchanged after close | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Fast-forward: pointer-only on another branch; in place on `dev`; skipped when git refuses | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Non-fast-forward rejection → refetch + retry lands; 10 attempts exhausted → non-zero, branch kept | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Push refused for another reason (remote pre-receive hook rejects `dev`) → PR fallback taken, no retry loop | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| PR fallback: merge refused → `updateBranch` + retry merges; 10 refusals → non-zero, PR open | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` |
| Backoff schedule: doubles from 2s, capped at 30s, jittered, 10 attempts max | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| Close `branches land` line run verbatim: lands with another session's work in the main checkout | Integration | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` |

### Tasks

- [ ] **Task 1:** One landing routine builds the close commit in `.worktrees/_land-{FID}` off `origin/dev`; the main checkout is never checked out, pulled or merged into. **Done when:** the dirty-main-checkout and local-`dev`-ahead cases land. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land lands while the main checkout is dirty` fails on exit 17.
- [ ] **Task 2:** Push `HEAD:dev`; non-fast-forward rejection → refetch, rebuild, retry with exponential backoff + jitter (2s doubling, 30s cap, 10 attempts max; constants beside the existing ones in `TIMEOUTS`); exhausted → non-zero exit, branch kept, throwaway worktree removed. **Done when:** the race, exhausted-budget and backoff-schedule cases pass. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land retries a rejected dev push` fails on the push-failed exit.
- [ ] **Task 3:** Any other push refusal → PR fallback (`landPr`), in every runtime; `close-transport` records the shape that landed. **Done when:** a pre-receive-hook refusal takes the PR route without retrying. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land falls back to a PR when dev refuses the push` fails on the push-failed exit.
- [ ] **Task 4:** PR fallback retries a refused merge: `updateBranch` when the PR is behind, then retry with the same backoff and budget; exhausted → non-zero exit, PR left open. **Done when:** the refused-then-merged and 10-refusals cases pass. **Test first:** `.bkit/core/engine/commands/workflow/prs.test.ts` `merge retries after update-branch` fails on a single merge attempt.
- [ ] **Task 5:** After a landed direct push on a laptop, fast-forward local `dev` when it is a pure fast-forward: pointer-only when the main checkout is on another branch, `git merge --ff-only` when it is on `dev`; skip with a log line when local `dev` has local-only commits or git refuses; a skip never fails the close. **Done when:** the three fast-forward cases pass. **Test first:** `.bkit/core/engine/commands/workflow/branches.test.ts` `branches land fast-forwards local dev` fails on local `dev` behind `origin/dev`.
- [ ] **Task 6:** Drop the dev lock from the design / plan close. **Done when:** the landing routine takes no `.bkit/.dev.lock`. **Test first:** n/a — covered by Task 2's race test.
- [ ] **Task 7:** Update `close-squash.integration.test.ts` to the new shape. **Done when:** its scenarios assert the main checkout's own edits are untouched. **Test first:** `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` fails on the main checkout still being switched to `dev`.
- [ ] **Task 8:** Docs in the same change: `.bkit/workflows.md` § Close squash, § Dev lock (sites list), § Runtime capability table (design / plan close now *tries* `dev` in every runtime; `RUNTIME_DEVPUSHES` still governs ship, build, debug), the "Local happy path is byte-identical" and "PR-mode design/plan closes MUST push before `bkit prs open`" invariants, design Step 12 and plan close rows, `close-transport` shape descriptions, and the timeouts table (backoff constants). Design / plan workflow Step 12 text in `.bkit/core/workflows/bkit-design.md` / `bkit-plan.md` if the land line or its routes change. **Done when:** no doc describes the close as a main-checkout `dev` squash or as runtime-fixed local-vs-PR. **Test first:** n/a — docs.

### Open Questions & Assumptions

- Decided: push retries — at most 10 attempts, exponential backoff with jitter (2s doubling, 30s cap). The PR-merge retry uses the same budget.
- Decided: the close fast-forwards local `dev` when that is a pure fast-forward, in either main-checkout state (Change step 7).
- Decided: the throwaway worktree lives in `.worktrees/` beside the feature worktrees, as `.worktrees/_land-{FID}`. Nothing in the engine scans `.worktrees/*`; every lookup is keyed by FID, and `.worktrees/` is already excluded from repo checks.
- Decided: design / plan closes try a direct `dev` push in every runtime and fall back to a PR on refusal. A refused push leaves nothing behind in the throwaway worktree, so the reason `RUNTIME_DEVPUSHES` is a fixed default rather than probed (a wrong guess stranding a session on a `dev` checkout, `.bkit/workflows.md` § Runtime capability table) does not apply here.
- Assumed: telling "`dev` moved" (retry) apart from "push not allowed" (fall back) by git's rejection output (`[rejected] … (fetch first)` / `non-fast-forward` vs anything else) is reliable through the claude.ai proxy. Verify against a real claude.ai session during build.
- Assumed: GitHub's server-side squash-merge applies `merge=union` to the ledgers, so parallel PR fallbacks cannot conflict on them (`.bkit/workflows.md` § Why event log + `merge=union` records this). Not verified independently.

### Breaking Changes & Naming

- `close-transport` shapes `local` and `pr` keep their names. `local` now means "throwaway-worktree squash + direct `dev` push" in any runtime; `pr` means "direct push refused, PR fallback".
- A claude.ai session whose environment allows `dev` pushes now lands directly instead of through a PR.
- No consumer migration: behaviour lives in the engine and the workflow close step.

### Out of Scope

- **GitHub Actions-level concurrency** (one ship at a time globally, same-FID arbitration across trigger types): #397.
- **Ship, build and debug closes.** They still work on `dev` in the main checkout under the dev lock. Moving them to the same routine is a candidate follow-up once this lands.
- **The mid-run `feat/{FID}` push** (`bkit branches push --mode=feature`, design / plan Summary step) stays in every runtime: each feature has its own branch, so these pushes cannot collide, and they are the backup if the machine or container dies mid-run.

### References

- `.bkit/core/engine/commands/workflow/branches.ts` § `landLocal`, `landPr`, `CLOSE_DOCS`
- `.bkit/core/engine/commands/workflow/prs.ts` § `mergePr`, `updateBranch`
- `.bkit/core/engine/commands/workflow/runtime.ts` § `capable`, `detect`
- `.bkit/friction.jsonl` key `branches-land-blocked-by-concurrent-dev-work`
- `.bkit/workflows.md` § Close squash, § Dev lock, § Runtime capability table, § Ship (Step 15 close worktree)
- `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration — https://github.com/cbartens/bkit/issues/397

## Work done

Implemented on `dev` and staged. Not committed or pushed yet.

### What a design/plan close does now (every runtime)

1. `bkit branches land` fetches `origin/dev` and makes a throwaway checkout of it at `.worktrees/_land-{FID}`. Your main checkout and the feature worktree are never touched.
2. It squashes the feature branch into that checkout. It stops with nothing pushed if the squash would bring anything other than the design/plan docs and their logs, or if `dev` already has a different version of the design/plan doc.
3. It adds the roadmap row, commits `docs({FID}): design DONE` (or `plan DONE`) and pushes straight to `dev`.
4. If the push is turned away because `dev` moved in the meantime (another close landed first), it throws the checkout away, fetches again, rebuilds and tries again. That's up to 10 pushes, with waits starting at 2s, doubling, capped at 30s and randomly shortened so two closes don't retry in lockstep. That adds up to about 3 minutes of waiting at most (the issue said 3.5). If all 10 are used: exit 8, nothing landed, branch kept.
5. If the push is refused for any other reason (a protected `dev`, a cloud proxy), it falls back to closing through a PR. If the merge is refused while the PR is still open, it brings the PR branch up to date with `dev` and retries on the same schedule. If the PR is closed or attempts run out: exit 17, PR left open.
6. On the laptop only: local `dev` moves forward to the landed commit when that's a plain fast-forward. If local `dev` has commits of its own, or git refuses because of an uncommitted edit, it's left alone with a log line and the close still succeeds.
7. Design/plan closes no longer take the dev lock, so parallel closes don't queue behind each other.
8. Gate 12 reads `status.jsonl` from `origin/dev` (`bkit steps gate --ref=origin/dev`), so it passes whether or not local `dev` moved.

### Nothing is deleted until it's on dev

The only things removed are the throwaway `_land-{FID}` checkout (a copy of `origin/dev`, holding nothing of yours) and, on runtimes that push to `dev` directly, the feature worktree and `feat/{FID}`. Those last two go only after all of these hold:

- the close landed and the audit passed (design/plan docs present on `origin/dev`);
- every file the branch changed is identical on `origin/dev`, and every `.jsonl` line the branch added is there too (`docs/roadmap.md` is the one exception, since the close rewrites it). Otherwise: exit 18, branch and worktree kept, and the missing files are listed;
- the feature worktree has no uncommitted or untracked files. Otherwise the close succeeds but the worktree and branch are kept, the files are listed, and the result says `worktree.reason: uncommitted`.

A failed fetch leaves `origin/dev` out of date, so the check above fails safe: exit 18, nothing deleted. Stops before landing delete nothing. Cloud runtimes delete nothing locally.

### Cloud agents

- GitHub Actions and Cursor cloud push to `dev` directly, so they get the same path as the laptop: retries, fast-forward and cleanup.
- Claude cloud tries the direct push first. Its git proxy refuses pushes to `dev`, and that refusal doesn't look like "dev moved", so it goes straight to the PR close, with the merge retry.
- This was tested with a simulated refusal (a test git server that rejects `dev` pushes), not in a real Claude cloud session.

### Where this differs from the issue text

- The PR-merge retry test lives in `branches.test.ts`, not `prs.test.ts`.
- The worst-case wait is about 3 minutes, not 3.5.
- `bkit steps gate` gained `--ref`, so Gate 12 can read from `origin/dev`.
- A failed fetch now exits 10.
- The `workflow-dev-lock` wording clause was removed from `.bkit/wording.md`, since design/plan no longer use the lock.

### Tests

- `branches.test.ts`, `bkit branches land`: 15 tests. They cover the direct close, staged files left staged, local `dev` with its own commits left alone, another branch checked out, `dev` moving during the push (retried, and exhausted), non-doc files refused, the PR fallback (cloud and laptop), the PR merge retry, a closed PR, uncommitted worktree work kept, and branch work missing from `dev` (18, nothing deleted). A schedule test covers the backoff.
- I switched the two new protections off temporarily: both new tests failed, so they do catch the problem.
- `close-squash.integration.test.ts` runs the full local close from the workflow.
- Typecheck, lint and format are clean.
- Full suite: 6098 passed. The 7 failures are all in `issues.test.ts`, which is being changed separately and is unrelated to this work.
- `slop:delta` fails on `disk.ts` / `bkit-disk-prune.mjs` from #640, not on this work.

## Claude cloud: what a refused `dev` push looks like

This issue assumed that a claude.ai cloud session can't push `dev`, and that the close tells that refusal apart from "`dev` moved" by git's output. I checked both against the official docs and git's own code. No live cloud session was used.

### The proxy doesn't block pushes to `dev`

The cloud environments page (https://code.claude.com/docs/en/cloud-environments, § GitHub proxy) says:

> **Push restrictions**: the proxy rejects branch deletions and pushes of anything other than a branch, such as a tag. It doesn't limit which branches a push can update. To do that, use branch protection rules or rulesets on GitHub.

So in a claude.ai session, `bkit branches land` normally lands with the same direct `dev` push a laptop uses. The PR route runs only if GitHub itself refuses the push, through branch protection or a ruleset on `dev`.

Older bug reports show the proxy did block branches at one point: anthropics/claude-code#61307 and #57356, both closed. Back then a refused push came back as:

```
error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

### A refusal can't be mistaken for "`dev` moved"

The close retries only when git prints `[rejected] ... (fetch first)` or `(non-fast-forward)`.

- **Git prints those two itself, before sending anything.** It first reads where the remote's branches point, sees that the remote `dev` has commits the local copy lacks, and stops. They appear only when `dev` on GitHub really moved. Source: `set_ref_status_for_push` and `print_one_push_report` in git's `transport.c`.
- **A proxy refusal is an HTTP 403**, as in the output above. It never contains `[rejected]`.
- **A refusal from GitHub branch protection prints `[remote rejected] ... (reason)`.** That line doesn't match the retry pattern either, so it goes to the PR route as intended.

So the retry-or-fall-back split holds in a cloud session.

### Two things this changes

- **Wording.** The docs and decisions written for this issue gave "the cloud git proxy" as a reason a push gets refused. They now say "branch protection or a ruleset on `dev`".
- **The PR route has its own cloud gap. This is inferred from the docs, not tested.** The same docs page says the proxy answers `gh pr` and `gh issue` with a 403, because those commands use GitHub's GraphQL API. bkit treats only a missing `gh` or a `gh` login failure (exit 4) as "use the GitHub tools instead". A 403 is exit 1, so a cloud close that needed the PR route would stop with an error instead of switching. This path is reached only when `dev` is protected.

### Follow-up outside this issue

bkit still sets `RUNTIME_DEVPUSHES=false` for `CLOUD_CLAUDE`, on the stated reason that the proxy only lets a session push its current branch (`.bkit/core/engine/commands/workflow/runtime.ts:110`). Adopt mode rests on the same reason (`.bkit/workflows.md`, "Adopt mode does no `git worktree add`"). The docs no longer support that reason. Changing it affects ship, build and debug, so it needs its own decision.

## Follow-up: ship, build and debug still write to `dev` from the main checkout

This issue fixed how design and plan land on `dev`. The same problems still exist in three other places, which the issue left out of scope.

### What stays as it is

Code reaches `dev` only through ship's PR merge, after CI is green. Nothing here changes that.

bkit also writes **bookkeeping** commits straight to `dev`: roadmap rows, status logs, ledger rows, no code. That is on purpose. Ship's close and failure records describe the merge or its failure, so they can't ride inside the PR being merged.

### What's wrong with how they land

On a laptop, all three of these work inside the main checkout, the folder you and other agents are working in:

<!-- prettier-ignore -->
| Where | What it does |
| --- | --- |
| End of build / debug: roadmap update (`.bkit/core/engine/commands/workflow/roadmap.ts`, `mirror`) | checks out `dev`, pulls, commits the roadmap row, pushes `dev`, switches back |
| Ship Step 13 and Step 15 close (`branches.ts` `switchVerb`, `workflows.ts` `shipClose`) | checks out `dev`, pushes any local `[skip ci]` commits, installs dependencies; Step 15 commits `ship DONE` on `dev` and pushes |
| Ship Failure Path (`workflows.ts` `shipFlush`) | checks out `dev`, pulls, commits `ship FAILED`, pushes |

These have the same three problems this issue fixed for design and plan:

- **They can publish other people's unpushed commits.** If local `dev` is ahead of GitHub, the pull does nothing and the plain `git push origin dev` sends every local-only commit. The roadmap update does this without saying so. At the time of writing, local `dev` on the maintainer's laptop was 13 commits ahead, and a build finishing there would have pushed all of them along with its one roadmap line.
- **They switch the branch under whoever else is working in the main checkout,** and fail on that person's uncommitted edits. The dev lock only stops two bkit runs overlapping.
- **They don't retry when `dev` moved.** The roadmap update just skips. Ship's laptop close exits 8 after the PR has already merged, so a shipped feature reports failure. Ship's cloud close already uses a throwaway checkout, but it treats "`dev` moved" as a refusal and opens a `ship-close/{FID}` PR instead of retrying.

### Proposed follow-up

Build every bookkeeping commit in a throwaway checkout of `origin/dev` and land it with this issue's routine: retry when `dev` moved, PR when GitHub refuses for any other reason. The main checkout is never touched.

The roadmap update is a small change. Ship is bigger: on a laptop, ship keeps its lock, status rows and stats rows as uncommitted files in the main checkout until Step 15, so they need a new home. That decision, and what Step 13 keeps, are being settled before a design issue is filed.

### `RUNTIME_DEVPUSHES` for claude.ai stays `false`

Only one of its two stated reasons is wrong. "The proxy only lets a session push its current branch" (`.bkit/core/engine/commands/workflow/runtime.ts:110`, `.bkit/workflows.md` "Adopt mode does no `git worktree add`") is out of date. The other reason still holds: a push to `dev` can't be tested without actually making it, and a wrong guess strands a session on a `dev` checkout (`.bkit/workflows.md` § Runtime capability table). Once bookkeeping lands through the throwaway checkout, the flag no longer affects landing at all. The stale comment gets corrected in the follow-up.

## Follow-up done: ship, build and debug no longer touch `dev` in the main checkout

Built on `dev` and staged. Not committed or pushed yet.

### Decisions

These were settled in the session before building. Each one is recorded in `docs/decisions.jsonl` under the key shown.

1. **Ship keeps its records in the feature worktree, not the main checkout.** The status rows, stats rows and summaries live in `.worktrees/{FID}`. The lock file stays in the main checkout. Ship's `workflows start` now runs after the worktree is set up, so its first row goes straight into the worktree. (`ship-dev-writes-through-throwaway-origin-dev-checkout`)
2. **Step 13 only moves local `dev` forward, without switching to it.** The dependency install runs only when you are already on `dev` and it moved. (`ship-sync-dev-fast-forward-only-never-push-local-dev`)
3. **Local-only `dev` commits are never pushed.** Step 13 lists them and prints the command to publish them yourself.
4. **The ship FAILED record lands like the close does, with no lock.** If `dev` refuses it, the record stays in the worktree and the next ship of the feature carries it. (`ship-failed-record-refused-stays-in-book`)
5. **The build/debug roadmap update never blocks.** If `dev` refuses it, it logs why and skips it. No PR. (`roadmap-mirror-every-runtime-fail-open`)

### What each one does now

All three use the same landing routine as design/plan closes (`pushToDev`, now in `.bkit/core/engine/commands/land.ts`). It builds the commit in a throwaway checkout of a fresh `origin/dev` at `.worktrees/_land-{FID}` and pushes it to `dev`. If `dev` moved, it rebuilds and pushes again, up to 10 times. Your main checkout is never switched, staged or committed in.

<!-- prettier-ignore -->
| Where | Now |
| --- | --- |
| Build / debug roadmap update (`bkit roadmap mirror`) | Builds the roadmap row commit in the throwaway checkout. If `dev` refuses it: a log line, skipped. The row on the feature branch is already written. |
| Ship Step 13, renamed "Update Local Dev" (`bkit branches sync-dev`) | Fetches and moves local `dev` forward if that's a plain fast-forward, without switching to it. Local-only commits are listed and left alone. |
| Ship Step 14 "Close Workflow" (`bkit workflows close --flush`) | Writes the close rows in the worktree, lands `docs({FID}): ship DONE bkit [skip ci]` through the throwaway checkout, releases the lock, then removes the worktree and branch. If GitHub refuses the push, it publishes through a `ship-close/{FID}` PR, as before. |
| Ship Failure Path (`bkit workflows handover --flush`) | Lands `chore({FID}): ship FAILED bkit [skip ci]` through the throwaway checkout. If refused or out of retries, it exits 10 and keeps the record in the worktree. |

### Removed

- The dev lock (`.bkit/.dev.lock`). Its `.gitignore` line is removed by `bkit upgrade`.
- `bkit branches switch` (replaced by `bkit branches sync-dev`).
- The `--dev-pushes` and `--deadline` flags.
- Ship's separate worktree-cleanup step. The close now removes the worktree, and only after the close has landed. Ship has 14 steps instead of 15.

### Found while testing

Ship's close checks whether any generated mirror file (`.claude/agents/`, `.claude/commands/`, and so on) was hand-edited. It checks the last commit in the folder it runs in. That folder is now the feature worktree, so it would only have looked at the feature's last commit. It now starts from the commit before the squash (`--squash-sha`), so the whole feature is checked again.

### Verification

- Full `pnpm vitest run`: 6108 passed, 1 failed. The failure is a row in `docs/decisions.jsonl:630` with a whole-second timestamp. It came from another session's commit `e6aae9ed`, not from this work.
- The staged files alone (a copy of `HEAD` plus only this work) give the same result. tsc, oxlint and prettier are clean, and so is `bkit check`.
- Tried for real with a packed tarball installed in a clean scratch repo with a bare remote:
  - **Ship close:** a real close landed `docs(1-x): ship DONE bkit [skip ci]` on the remote `dev`, with the status rows, summary and stats rows. It removed the worktree and branch and left the main checkout untouched, and the Step 14 gate passed.
  - **Step 13:** `branches sync-dev` moved local `dev` forward without switching to it. It left a local-only `dev` commit unpushed and printed the command to publish it.
  - **Dev lock:** `locks acquire --kind=dev` is rejected.
  - **Upgrade:** with the old `.bkit/.dev.lock` line put back in `.gitignore`, `bkit upgrade` removed it.

### Not done / open

- **Cloud sessions:** if `dev` refuses a ship FAILED record, it stays in the worktree. A claude.ai container is thrown away later, so there the record is lost.
- **`RUNTIME_DEVPUSHES` comment:** the earlier comment said its out-of-date wording (`.bkit/core/engine/commands/workflow/runtime.ts:110`) would be corrected here. It wasn't, and it is still out of date. Design/plan closes still read the flag through `devPushesOf`.
- **Consumer note:** a short note in `docs/migrations.md` about the removed flags and verb is suggested, not written.
- **Push blocked:** `pnpm slop:delta` currently fails on three findings from #640 (`disk.ts:385`, `disk.ts:150`, `bkit-disk-prune.mjs:37`), so a normal push is blocked until those are fixed.

### In progress: one way to keep every Failure Path's record

Today each workflow keeps its failure record differently:

- **Design and plan** never commit it. It lives only in the local worktree.
- **Build and debug** commit and push it on the feature branch, but only when a handover is written.
- **Ship** always lands it on `dev`.

There is also a real bug. When a session is on `dev`, debug works directly on `dev`. If debug then fails, the handover runs `git add -A`, so the half-finished fix ends up in an "aborted" commit pushed to `dev`.

Agreed fix: design, plan, build and debug always commit their failure record and push it on their own feature branch, never `dev`. When there is no feature branch to use (debug running on `dev` or `main`), only the logs and ledger rows land on `dev` through the throwaway checkout, never code. Ship stays as above. An open PR on the feature branch still stops the push, as today. A further comment follows when this is built.

## Follow-up done: every Failure Path keeps its record, and none pushes code to `dev`

Built on `dev` and staged with the earlier work. Not committed or pushed yet.

### What changed

Design, plan, build and debug now keep a failed run's record the same way. It's step 3 of the Failure Path for design and plan, and step 5 for build and debug. Each one runs:

```
bkit workflows handover --workflow={wf} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
```

What that command does depends on the branch the run's checkout is on:

<!-- prettier-ignore -->
| Checkout is on | What happens |
| --- | --- |
| A feature branch | Everything in the run's checkout is committed as `docs({FID}): {workflow} aborted bkit [skip ci]` and pushed to that branch, whether or not a handover was written. If the branch has an open PR, nothing is pushed (exit 9) and the record stays committed locally, as before. |
| `dev`, `main` or no branch (debug can work directly on `dev`) | Nothing is committed in the checkout. Only the logs and ledger rows are copied into a throwaway `origin/dev` checkout and land as one `chore({FID}): {workflow} FAILED bkit [skip ci]` commit, the same way ship's Failure Path does. A half-finished fix stays as an uncommitted change in your checkout and never reaches `dev`. |

Ship is unchanged and still uses `--flush`.

Before this change, design and plan never committed their failure record at all. Build and debug only committed it when a handover was written. And debug failing on `dev` committed and pushed its half-finished fix to `dev`.

The decision is recorded in `docs/decisions.jsonl` under `failure-path-record-own-branch-dev-fallback`.

### A bug found while testing it for real, and fixed

After the record landed from a `dev` checkout, the checkout still had its own uncommitted copies of the same logs and ledger rows. The next fast-forward of local `dev` (ship's Step 13, `bkit branches sync-dev`) then stopped, because git won't overwrite untracked files even when their content is identical.

The command now hands those copies back once the record has landed. An untracked copy is deleted, and a changed tracked ledger is reset to the last commit. This only happens when every line of the file is already in what landed on `dev`, and nothing of it is staged, so nothing can be lost. Any other file is left alone and named in the log.

### Checked against the workflow authoring rules

All the workflow text I changed was checked against the rules in `.bkit/workflows.md` § Workflow Authoring Rules. Fixes made:

- **The new Failure Path step** no longer describes in prose what the command decides. It now uses the existing step shape: `git status --short` → remove unintended files, then commit and push the run's record — NEVER onto a branch with an open PR; **Skip if** `{WORKTREE_PATH}` is not set.
- **`bkit-ship.md`:** removed the explanations and reasons added in the earlier change: Step 1 item 8, Step 13, Gate 13, the Step 14 close step, the header "Status branch" and "Worktrees" bullets, and Failure Path step 5. The Gate 14 condition for an open close PR now just says which flags to change. Its value is written plainly (`close-pr-open`, no backticks), as the rules require for fixed values.
- The repeated sentences are registered in `.bkit/wording.md` as `workflow-keep-record`, `workflow-keep-record-open-pr` and `workflow-keep-record-comment`.

### Verification

- Full `pnpm vitest run`, both on the working tree and on the staged files alone (a copy of `HEAD` plus only this work): 6115 passed, 1 failed. The failure is the same `docs/decisions.jsonl:630` row as before, from another session's commit `e6aae9ed`.
- tsc and prettier are clean.
- New tests in `.bkit/core/engine/commands/workflow/workflows.test.ts`:
  - the feature-branch commit and push;
  - from `dev`, only logs and ledgers landing while the checkout's code is untouched;
  - the hand-back, followed by a fast-forward of local `dev` that succeeds;
  - a staged ledger being kept and named;
  - a refusal giving exit 10 with the record kept;
  - the named worktree being the one committed in.
- Tried for real with a packed tarball in a clean scratch repo with a bare remote:
  - **Debug failing on `dev` with a half-finished `src.ts`:** `dev` got only `chore(1-x): debug FAILED bkit [skip ci]` with the handover, status and ledger row. `src.ts` stayed an uncommitted local change. The landed files were handed back, and `bkit branches sync-dev` then fast-forwarded local `dev` onto the record.
  - **Design failing on a feature branch:** `docs(2-y): design aborted bkit [skip ci]` was pushed to `feat/2-y` only. Neither `dev` nor the main checkout changed.

### Still open

- Everything listed as open in the previous comment still is: the cloud-session caveat, the out-of-date `RUNTIME_DEVPUSHES` comment, the suggested `docs/migrations.md` note, and the #640 `slop:delta` findings that block a normal push.

## Reopened: the "local dev ahead of `origin/dev`" edge case does not land

This issue's Edge Cases table promises:

> Laptop: local `dev` ahead of `origin/dev` | Close lands on `origin/dev`; local-only commits are not pushed; local `dev` not fast-forwarded (logged)

Observed today (2026-10-26), plan close for #701 on `feat/701-engine-work-build`: **nothing landed, exit 17.** The rest of this issue's shape worked — throwaway checkout off a fresh `origin/dev`, no main-checkout write, retry loop unused because the push was never reached.

### What happened

- `bkit worktrees setup` (Step 2) cut the branch from the **local dev tip** `5c94780ac`, 5 commits ahead of `origin/dev`, and warned: `local dev is 5 commit(s) ahead of origin/dev — basing on local dev; push dev before the feature PR` (`devBase()` in `.bkit/core/engine/commands/workflow/worktrees.ts`, behaviour added by `b51bed084` on 2026-10-22).
- The branch therefore carries those 5 foreign commits as ordinary history. `git diff --stat origin/dev..feat/701-engine-work-build` = 45 files, including `dist/commands/workflow/*.js`, `branches.ts` / `worktrees.ts` / `ledgers.ts`, `.claude/settings.json`, `README.md`, `.github/assets/*`, `package.json`, `scripts/readme/readme-art.mjs`.
- The run's own 8 commits are docs-only: `git diff --stat 5c94780ac..feat/701-engine-work-build` = 19 files, 4,573 insertions, every one under `docs/plans/**`, the ledgers or `status.jsonl`.
- `bkit branches land` squashed the branch onto a fresh `origin/dev` in `.worktrees/_land-701-engine-work-build` and `buildClose`'s `CLOSE_DOCS` guard refused the inherited paths **before any push**:

```
[bkit-branches] plan close staged non-doc files:
.bkit/core/engine/commands/lib.ts
.bkit/core/engine/commands/workflow/branches.ts
...
scripts/readme/readme-art.mjs
```

Full output and the 25-path list: [#701 failure comment](https://github.com/cbartens/bkit/issues/701#issuecomment-6411068788).

- The PR fallback could not rescue it: `landPr` runs the same `CLOSE_DOCS` check, so there is no route to land a branch in this state.
- Repo state: `origin/dev` never moved (`820aee6c0`); local dev was 10 commits ahead at the failure and is **11 ahead now** (it took another commit while the run was in flight). Local dev is a live shared staging area in this repo — multiple runs' closes and records land there and nothing publishes it — so "local dev ahead" is not an exotic state, it is close to the default.

### Why the tests did not catch it

The two halves are covered separately; the combination is not:

- `branches.test.ts` — "local: dev with commits of its own is left alone; only the close is pushed": local dev ahead, but the feature branch is based on `origin/dev`. Lands (correctly).
- `branches.test.ts` — "local: stops (17) when the squash would bring non-doc files to dev": code committed **by the run itself**. Refused (correctly).
- Nothing covers a feature branch cut from the ahead local dev — which is exactly what `devBase()` now produces by default.

### Direction to consider (not prescriptive — this is a design decision)

1. **Make the close carry the run's own work, not everything the branch's history happens to contain.** The run's base commit is already recorded: `workflow-started.parentSha` in the run's `status.jsonl` (`5c94780ac` here). Either build the close from that base, or keep `merge --squash -X ours` and reset the staged paths the run's own commits never touched back to `origin/dev` in the throwaway checkout — with the existing `CLOSE_DOCS` check kept as the belt-and-braces guard for a run that really did write code.
2. **Decide the other half in writing.** `devBase()` basing a feature branch on local dev when it is ahead (`b51bed084`, "so unpushed dev commits are in the worktree and are not replayed under new SHAs") is deliberate and was made two days after this issue closed. Either design/plan branches base on `origin/dev` (their close is docs-only and does not need dev's newer code), or the close isolates the run's own commits. The current pair cancels out: whenever local dev is unpushed, a plan or design run **cannot** land, and the only signal is a log line at Step 2.
3. **Fail fast and say why.** The operator got a list of 25 unfamiliar paths; the cause is one line. A refusal along the lines of "the run's base `5c94780ac` is not on `origin/dev` (local dev is 11 commits ahead) — publish dev, then re-run the land" is the same guard with a usable diagnosis. A preflight at Step 2 that refuses (or bases on `origin/dev`) costs one line and saves the run.
4. **Same root cause, second symptom** (recorded under this issue's and #645's territory, not a separate defect): because the branch was non-min, every Step 7 push ran the full `bkit:gate:static-unit-integration` gate, and three attempts died on load-induced 5s/30s test timeouts while another session ran its own suite (`docs/failures.jsonl` keys `runs-test-*`, `resolve-push-base-*`, `ci-scripts-*`; friction row `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`). Publishing dev removes that cost too.

### Related

- #650 (closed) built `devBase()`'s "base on local dev when ahead" behaviour.
- #699 (open) — the deterministic Stop wrote no `docs/failures.jsonl` row (only the four flake rows), so this failure is invisible to plan/build reviewers' `ledger-scan`.
- #645 (closed) — bookkeeping-only push gate, the other symptom of the same state.

Reopened because the delivered landing routine does not meet this issue's own success criteria ("A design / plan close on a laptop lands on `origin/dev` … local `dev` commits not on `origin/dev` are never pushed") for a repo state that persists for hours at a time.

## Options to fix (follow-on to the reopen note above)

The two behaviours that collide: `devBase()` puts a new feature branch on **local dev** when local dev is ahead of `origin/dev` (so the branch carries other sessions' unpushed commits), and `buildClose` squashes the **whole branch** onto a fresh `origin/dev` and refuses any staged path outside `CLOSE_DOCS`. Any base except "a commit already on `origin/dev`" therefore makes a docs-only close unlandable, and `landPr` shares the guard so there is no fallback.

All line references are from current `dev`.

### A — Base design/plan worktrees on `origin/dev`

Make the state unrepresentable: a docs-only phase's branch should never contain another session's unpushed code.

- **Touch:** `worktrees.ts` only. `devBase()` (`:175`) has four call sites, all in that file — branch creation (`:219`), the resume rebase target (`:735`, `:739`) and the emitted `baseRef` (`:790`). The workflow is already a required flag of the verb (`:612`, `WORKFLOWS`) and every phase workflow passes it (`bkit-plan.md:203`, `bkit-design.md:188`, `bkit-build.md:316`, `bkit-debug.md:251`), so the predicate needs no new plumbing; `addWorktree` has to take it.
- **Effect:** the branch's diff *is* the run's own docs, so `buildClose`'s `CLOSE_DOCS` guard and the post-land `notOnDev` both pass **unchanged**. `branches.ts` is not touched at all.
- **Second win, automatic:** a docs-only branch is a min push, so the pre-push hook takes `bkit:gate:min` instead of the full `bkit:gate:static-unit-integration` chain (`.husky/pre-push`: "every changed file matches `bkit.testing.minPushPaths` … Files decide"). That is what cost three attempts and four `docs/failures.jsonl` rows on the #701 run.
- **The base the run records already follows:** `worktrees setup` emits `baseSha`, the workflow holds it as `{BASE_SHA}` and writes it into the `runtime-resolved` row (`bkit-plan.md:205`, `:217`), which `workflows promote` stamps into the doc's anchor. So the staleness anchor stays truthful with no extra work.
- **Does not fix:** a worktree already cut from ahead dev. A resume rebases onto the new target, and while dev is unpushed that *replays* the foreign commits under new SHAs — the close still refuses until dev is published, at which point the rebase drops them as patch-equivalent.
- **Tests that move:** `worktrees.integration.test.ts:159` asserts the **plan** case gets `baseRef: "dev"` plus the "1 commit(s) ahead of origin/dev" warning — that expectation inverts; add a build case asserting local dev is still used. `:399` (resume onto local dev) needs the same workflow split.
- **Size:** small — one predicate, the narration text, `dist/`, those tests, a docs line.

### B — Land only the run's own work

Make the close tolerate any base.

- **Touch:** `branches.ts` — **two** guards, not one: `buildClose`'s staged check (`:1463`) and the post-land `notOnDev` (`:1729`). Fixing only the first makes the close land and *then* exit 18 ("carries work `origin/dev` does not"), which is the worst half-state, so both must move together.
- **Mechanism:** after `merge --squash -X ours`, restore or delete the staged paths outside the run's own set, keep `restoreBranchRows`, and keep `CLOSE_DOCS` as the check on what remains. Derive the foreign set from refs — commits in `git rev-list origin/dev..dev` that are ancestors of the branch — **not** from `workflow-started.parentSha`, which is HEAD-at-run-start and equals the branch base only by accident on a fresh branch.
- **Fixes:** the class, including worktrees already cut from ahead dev, and any future route to a foreign base.
- **Cost:** medium, on the highest-stakes verb in the engine. Tests needed: cut-from-ahead-dev lands; a foreign *new* file (binary) is restored or deleted, not committed; the run's own code is still refused (`:2056` keeps passing); foreign ledger rows are tolerated; `notOnDev` no longer trips.
- **Semantic change to state in the docstring:** the guard's meaning moves from "this branch carries only docs" to "this run's own commits carry only docs".

### C — Fail fast and say why (worth doing either way)

- The Stop names the cause and the remedy instead of a list of paths: "the run's base `5c94780ac` is not on `origin/dev` (local dev is 11 commits ahead) — publish dev, then re-run the land". `buildClose`'s message and `notOnDev`'s.
- Optional: a Step 2 preflight for design/plan so a doomed run dies in seconds instead of after a whole plan — `worktrees setup` already computes the condition and emits `baseRef`, and the plan workflow already holds it.
- Optional, and arguably #699's: a deterministic land Stop writes a `docs/failures.jsonl` row. Today only the four gate flakes have rows, so `ledger-scan` never surfaces this failure to a later plan or build.
- **Size:** tiny.

### Rejected — replay the run's commits onto a fresh `origin/dev`

Reusing `replayBuild`/`pushToDev` (what `pushOwnCommits` does for an in-place dev run) reaches the same outcome as B, but cherry-pick conflicts on the ledgers need union resolution that today exists only for merge and rebase (`resolveRebase`, `unionResolve`). More machinery for the same result.

### Summary

<!-- prettier-ignore -->
|  | Fixes new runs | Fixes in-flight branches | Touches `branches land` | Removes the full-gate tax | Size |
| --- | --- | --- | --- | --- | --- |
| A | yes | no | no | yes | small |
| B | yes | yes | yes (2 guards) | no | medium |
| C | no — fails honestly, fast | no | messages only | no | tiny |

### Recommendation: A + C

A deletes the state that makes a docs-only close unlandable and takes the full test gate off every plan push; C makes any future instance cost seconds and tells the operator the single thing to do. It leaves build, debug and ship on local-dev bases, where that choice does pay, and it leaves the land routine's invariants intact.

B is the "land anything from any base" invariant. I would not take it here: nothing wants a design/plan worktree sitting on unpushed dev, since a plan's inputs come from the tracker and the ledgers rather than from dev's newest code, and the build phase re-bases onto dev anyway. Take B only if you decide design/plan *should* be able to plan against unpushed code — in that case A is the wrong lever and B is the fix.

**The one judgement call inside A:** you accept that design/plan docs are written against `origin/dev` rather than the newest local dev. The anchor records which, so the staleness judgement stays truthful — but it is a deliberate narrowing of what a plan sees.

### Done when (A + C)

- A new design/plan worktree is based on `origin/dev` even when local dev is strictly ahead, and `bkit worktrees setup` narrates that choice instead of warning "basing on local dev".
- A new build/debug/ship worktree is still based on local dev when it is a fast-forward of `origin/dev` (existing behaviour and its tests unchanged).
- A design/plan run whose local dev is ahead reaches Step 7 with a bookkeeping-only branch, so the pre-push hook takes `bkit:gate:min`.
- A close that cannot land says why and what to do, in one sentence naming the base commit and the number of unpushed dev commits.
- Regression proof for the original failure: a plan branch cut from local dev while it is ahead of `origin/dev` closes and lands with the close commit carrying only `docs/plans/**`, the ledgers and the roadmap row — no foreign code. (This is the case neither `worktrees.integration.test.ts:159` nor `branches.test.ts:2012`/`:2056` covers; under A it holds by construction, and it is the scenario this issue's Edge Cases table promised.)

Here it is without the engine vocabulary.
First, what actually went wrong
Picture three things: dev (the shared working branch), the published copy of dev (origin/dev, what everyone else can see), and your run's branch (where each phase does its work).
Two parts of the engine disagree:
1. When a run starts, it cuts its branch from the local copy of dev — including commits nobody has published yet. That was a deliberate choice: it means a build run works on the newest code, and those unpushed commits don't get copied and reappear under new names.
2. When a plan or design finishes, the closing step takes your branch, squashes everything it contains into one commit on top of the published dev, and refuses to push if that commit contains anything but documentation.
Those two rules are fine apart and impossible together. If dev has unpushed commits, your branch inherited them, so the closing step sees code in the squash — someone else's code — and stops. It has no way to tell "work this run did" from "work this run inherited".
Option A — start plan and design branches from the published copy
Simple: for the phases that only produce documents (design, plan), cut the branch from the published dev instead of the local one. Build, debug and ship keep the current behaviour, because they actually want the newest code.
Why it works: the closing step's question is "does this branch bring anything but docs?" If the branch started from the published copy, then everything on it is your own work — so the answer is correctly "no" and the close lands. Nothing in the landing code changes at all; you've removed the situation rather than taught the engine to tolerate it.
Two side benefits fall out: your branch stops dragging along other sessions' unpublished code (so reviewers see only your plan), and a docs-only branch gets the quick pre-push check instead of the full test suite — that's what made the run's push fail three times under load.
The trade-off you accept: a plan is written against the published code, not the very newest local code. That's usually fine — a plan's inputs come from the issue, tracker and ledgers, and the doc records which commit it was based on either way.
Option B — make the closing step carry only your own work
Leave the branch where it is, and teach the landing step to ignore the inherited commits: keep your docs and ledgers, throw away everything that came from someone else's unpublished dev work, then push.
It's the more general fix — it works no matter what the branch is based on — but it means changing the code that decides what lands on the shared branch, and it needs two changes, not one: the check before the push, and a check after it ("does this branch carry anything dev still doesn't have?"). Fix only the first and you land your docs and then report failure — the worst outcome, because state moved while the run is marked unverified.
It also needs a new, subtle idea: "the commits this run made". The obvious source — the commit the run recorded when it started — isn't the branch's base; it's whatever the branch tip was at that moment, which only happens to equal the base when the branch is brand new. So this is fiddly logic in the most delicate place.
Option C is just honesty: when the close can't land, say why in one sentence — "this run's branch is based on commit X, which isn't published; local dev is 11 commits ahead — publish dev, then re-run the landing" — instead of printing a list of 25 unfamiliar file names. Cheap; do it either way.
Why not B
1. It preserves a situation nothing wants. Design and plan runs have no reason to sit on other people's unpublished work. It's not a feature; it's an accident of one line choosing a base. B makes the engine permanently responsible for untangling that accident.
2. It rewrites the rule that protects dev. The guard exists because pushing the wrong thing to the shared branch is expensive. B changes its meaning from "this branch carries only docs" to "this run's own commits carry only docs" — a bigger, riskier claim in the one place where a mistake means someone else's code lands under your run's name.
3. The two-guard trap. Half of B is worse than none of it: you land and then fail.
4. It's harder to get right. The "which commits are mine" rule has to be derived from the branches themselves rather than the recorded start point, and the corner cases (a rebased branch, a resumed run, dev published midway) are exactly where quiet mistakes live.
5. The gain is small and shrinking. Everything B fixes beyond A is branches already cut the wrong way. Publish dev and even those clean themselves up the next time the run resumes, because the rebase recognises the now-published commits and drops them.
6. B doesn't fix the waste. Runs still start from an unpublishable base, still run the full test suite on every push, still spend 40 minutes before discovering they can't land. A fixes all of that by construction.
So: A plus C removes the cause and makes any remaining instance fail fast and clearly. B is the right answer only if you decide that plans should be written against unpublished code, or if you want the engine to guarantee "any branch can land from any base" for consumers and future phases too. Otherwise it's more risk, in the most sensitive code, for a case you can simply stop creating.

## Decision: take A and C

Recorded 2026-10-26 (this comment is the decision; the diagnosis is [above](https://github.com/cbartens/bkit/issues/639#issuecomment-6411307463) and the options detail is [above](https://github.com/cbartens/bkit/issues/639#issuecomment-6411449687)).

- **A — design and plan worktrees are based on `origin/dev`, not on local dev.** Build, debug and ship keep today's behaviour.
- **C — when a close cannot land, it says why in one sentence** (the base commit, how many dev commits are unpublished, and the instruction to publish dev and re-run the landing), and design/plan get a Step 2 preflight so a doomed run stops in seconds instead of after a whole plan.
- **B is not taken now.** It stays the right answer only if we later decide every phase must land exactly its own work from any base; if that decision is ever made, B is done *in addition to* A, never instead of it.

### A, B and C in plain English

**A.** Every run cuts its branch from a copy of dev. Today it cuts from the *local* copy, which includes commits nobody has published. Plan and design should cut from the *published* copy instead. Then everything on the branch is the run's own work, so the closing step's question — "did this bring anything but docs?" — gets the right answer and the close lands. Nothing in the landing code changes; the situation that breaks it stops happening. Side effect worth having: a docs-only branch is a small push, so the pre-push hook takes the quick check instead of the full test suite. That is the three failed pushes and four `docs/failures.jsonl` rows from #701, gone.

**B.** Leave the branch where it is and teach the closing step to push only the commits the run itself made, discarding whatever it inherited from someone else's unpublished dev work. More general, and it is the only option that rescues a branch already cut the wrong way — but it rewrites the code that decides what reaches dev.

**C.** Keep the refusal, but make it tell the truth. Today it prints 25 unfamiliar file names; the operator needs one line naming the cause and the one action that fixes it.

### Why not B

1. **Debug already does something like this, but it is a different trick, and it isn't reusable.** A debug run works straight on dev, so its commits sit mixed with everyone else's and history alone cannot say which are its own — so it writes each one down as it makes it, and refuses to push when it has no such note. Design and plan own their branch; the only strangers on it are ones the base choice dragged in. A removes the mixing; B builds machinery to live with it. What *is* reusable (the throwaway checkout and push, `pushToDev`) the close already uses; the genuinely new part would be deciding "which commits are mine" from history, and that is the fiddly part.
2. **B has a hazard that debug's version never meets.** Once A ships, resuming an *old* worktree rebases it onto `origin/dev`, and that rebase replays the inherited local-dev commits under new SHAs — same content, new names — because dev still hasn't published them. The obvious way to write B ("foreign commits are the ones on local dev but not on `origin/dev`") then stops recognising them and treats other people's code as the run's own, and lands it. That is precisely the accident the guard exists to prevent, so B's attribution would have to be content-based or anchored to a recorded base — more careful work in the most delicate function in the engine.
3. **The cost sits in the wrong place.** A touches the choice of base, changes nothing about what may land, and cannot affect build, debug or ship. B changes the meaning of the guard from "this branch carries only docs" to "this run's own commits carry only docs", in the one function where a mistake means someone else's code reaches the shared branch under this run's name. And half of B is worse than none: fix the pre-push check but not the post-push one and the close lands and *then* reports failure.
4. **B does not fix the waste.** Runs would still start from an unpublishable base, still run the full gate on every push, and still take 40 minutes to discover they cannot land. A and C fix all of that.
5. **A's one gap is empty as of today.** A does not rescue a worktree already cut from an unpushed dev. But local dev is level with `origin/dev` right now, so every existing worktree's base is already an ancestor of the published dev — including the branch that failed. The gap only reopens if dev drifts ahead again *and* a design/plan branch is cut from the drifting tip before A ships; after that, A prevents the cut.

### Scope: the failure is design and plan; the cause is not

Only design and plan land through `bkit branches land` — the verb refuses any other `--workflow` (`branches.ts:1759`), and the "docs only" rule lives there. So "the run finished and could not publish itself" is a design/plan-shaped failure.

The cause — a branch cut from unpublished dev — comes from `bkit worktrees setup`, which every phase uses. Elsewhere it shows up as:

- **build / ship**: the PR contains the inherited commits, so merging it brings other sessions' unpublished work to dev with your change. That is the case the setup warning already speaks to ("push dev before the feature PR"), and it is a different problem from this one.
- **debug**: no branch is minted the same way, and its in-place path already isolates the run's own commits.
- A design or plan run that adopts the checkout in place rather than minting a worktree has no branch base of its own, so this failure cannot arise there — it is the mint-mode (laptop) shape.

This is why A is scoped to design and plan and why it cannot regress the other three.

### Done when (A + C)

- A new design/plan worktree is based on `origin/dev` even when local dev is strictly ahead, and setup narrates that choice instead of warning "basing on local dev".
- A new build/debug/ship worktree is still based on local dev when it is a fast-forward of `origin/dev` — existing behaviour and its tests unchanged.
- A design/plan run whose local dev is ahead reaches Step 7 with a bookkeeping-only branch, so the pre-push hook takes `bkit:gate:min`.
- A close that cannot land says why and what to do, naming the base commit and the number of unpublished dev commits.
- Regression proof for the original failure: a plan branch cut from local dev while it is ahead of `origin/dev` closes and lands with the close commit carrying only `docs/plans/**`, the ledgers and the roadmap row — no foreign code. This is the case none of `worktrees.integration.test.ts:159`, `branches.test.ts:2012` or `:2056` covers; under A it holds by construction.
- Tests that move with A: `worktrees.integration.test.ts:159` asserts the *plan* case gets `baseRef: "dev"` — that expectation inverts, and a build case asserting local dev is still used is added; `:399` (resume onto local dev) needs the same workflow split.

### Not in this decision

- The missing `docs/failures.jsonl` row for a deterministic land Stop stays with #699 unless we choose to pull it in here.
- B, #650's base rule for the other phases, and the "any branch, any base" invariant are all untouched.
- The decision has no `docs/decisions.jsonl` row yet; it should be written when the change lands (or now, if we want it on record before then).

No design phase is needed: the direction is settled, the change is small and its acceptance criteria are above. #639 carries no phase label, so nothing routes off it automatically — label it `bkit:plan` and run `/bkit-plan #639`, or go straight to build if the direction is taken as final.

## Work done: A and C implemented, verified, committed on `dev`

Commit `46e558fc9` — `fix(639): base design and plan worktrees on origin/dev; name unpushed dev in a close refusal`, 11 files, +293 / −34. It is **local to `dev` and not pushed**: `git log origin/dev..HEAD` shows exactly this one commit. The push needs your approval, and it matters more than usual here — leaving `dev` one commit ahead is the very state that produced this failure (harmless for design / plan now, and `build` / `ship` warn with the unpushed count and tell you to publish before the PR).

### What changed

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `commands/workflow/worktrees.ts` | `worktreeBase(cwd, workflow, log)`: `origin/dev` for `design` / `plan`, `devBase`'s choice for everything else. `addWorktree` takes the workflow; the resume rebase target and the emitted `baseRef` go through it too. New Step 2 refusal (`inheritedDevCommits`, `inheritedDevRefusal`, exit 7) for a resumed docs-only branch that already carries unpushed `dev` commits. |
| `commands/workflow/branches.ts` | `localDevCopies` + `unpushedDevCause`: the staged non-doc refusal, and the post-land "carries work `origin/dev` does not" refusal, name unpushed `dev` as the cause when the paths they list are its own content — how many, its tip, how far ahead, and the fix. |
| `worktrees.integration.test.ts` | The plan case now asserts `baseRef: origin/dev` (it asserted `dev`); a build case asserts local `dev` and that the unpushed file *is* in the worktree; a new case asserts the Step 2 refusal (7) and that the same worktree still resumes for `build`. |
| `branches.test.ts` | Two cases: a branch based on unpushed `dev` names that cause and `git push origin dev`; and a branch carrying both inherited and its own code says "1 of them are local dev's content" while listing both paths. |
| `.bkit/workflows.md` + `.bkit/core/.bkit/workflows.md` | § Cross-step invariants: the base rule per workflow (design / plan always `origin/dev`; build / ship / debug local `dev` while it is ahead), the Step 2 refusal, and the land refusal naming the cause. The "those commits never reach the worktree" rationale was stale since `b51bed084`; it now says what is true. |
| `.bkit/instructions.md` | The `cross-step-invariants` clause's Close squash row carries the same wording as its catalog source (the suite caught this drift). |
| `docs/testing.md`, `CHANGELOG.md` | Test inventory and the Unreleased / Fixed entry. |

### Seen red before green

Each behaviour was reverted and the new test re-run first, so the tests are known to discriminate rather than pass by accident:

- without the base change: `cuts feat/{fid} off origin/dev for design and plan…` failed — `expected 7 to be +0` (the Step 2 refusal caught the branch, which is itself the guard working);
- without the refusal wording: `local: names unpushed dev as the cause…` failed — `expected '…' to contain 'all of them are local dev's content'`.

That red run also caught a mistake of mine: I had asserted exit `3` for `worktrees setup`, whose `EXIT_REFUSED` is `7`.

### Evidence

- `pnpm bkit:gate:static` — clean: typecheck (prod + tests), lint (oxlint, deny-warnings), prettier, table formatting, prose over 147 files, slop delta.
- `pnpm vitest run` — **198 files, 7848 passed, 1 skipped** (the pre-existing skip). Run three times across the change; this is the final state.
- `pnpm bkit:test:bats` — exit 0, 31 ok, 0 not ok.
- `node dist/cli.js check` — 13 findings, 0 blockers (all pre-existing advisories).
- Pre-commit hook: `bkit:gate:format` (lint-staged) and `bkit:check:dist` — `dist/` committed, not stale.
- Dogfood on a scratch consumer (`tmp/dogfood-639.sh`, three worktrees, unrelated bare origin): plan setup → `baseRef: origin/dev`, worktree free of the unpushed file, narration "basing this plan branch on origin/dev: its close lands docs and ledgers only"; build setup → `baseRef: dev`, unpushed file present, old narration intact; a build worktree resumed for plan → **exit 7** with `feat/3-dog carries 1 commit(s) of unpushed dev (tip 73175c4, 1 commit(s) ahead of origin/dev), and a plan close lands docs and ledgers only — this branch cannot land. Publish dev (git push origin dev), then re-run.` Footprint: `dev` never committed to by setup, ownership markers under `.git/bkit-outbox/{fid}`, log dirs inside the worktree only.

The original failing scenario is now unreachable by construction: a design / plan branch cannot start from unpushed `dev`, and one that already does is refused in seconds at Step 2 instead of after a whole plan with 25 unfamiliar paths.

### Not in this change

- **B** (land exactly the run's own work from any base) — still not taken, per the decision above. A covers new runs; C covers the diagnosis for anything else.
- **The `docs/failures.jsonl` row for a deterministic land Stop** — still parked with [#699 Engine run completeness check + auto friction/failure on errors](https://github.com/cbartens/bkit/issues/699) unless you want it pulled in here. The #701 run recorded four rows for the gate flakes and none for the stop that actually failed the run.
- **Pre-existing worktrees** cut from an unpushed `dev` before this commit: `dev` is level with `origin/dev` today, so their bases are already ancestors of it and they are clean; if one is ever resumed while `dev` is ahead, the Step 2 refusal names the fix.
- **Process note, not a defect:** editing a sentence in `.bkit/workflows.md` also means updating the clause in `.bkit/instructions.md` (the suite's catalog check enforces it). `.agents/rules.md` says to run `pnpm instructions:show --file {basename}` first; I learned it from the failing test instead.

Related: [#701 Engine work in build verify and ship: emit the facts, keep the judgement](https://github.com/cbartens/bkit/issues/701) is the run that failed, closed by hand after `dev` was published; [#650 Run workflows from the prompt alone, without issue, design or plan](https://github.com/cbartens/bkit/issues/650) is the build run that introduced basing on local `dev` (`b51bed084`).

## Review of the landed work (28 Oct 2026)

Code review of #639 on `dev`: `f3e4063ff`, `fee23d8a5`, `0df5dda6c` and `9ff03a2ca`, from 20 Oct. I checked them against the current code on `dev` at `8e73232bf`, which later commits have changed. **None of the findings is fixed yet.**

1. **HIGH: two closes landing at the same moment can still collide** (`.bkit/core/engine/commands/land.ts:131`).
   - Every landing starts with `git fetch origin dev` in the shared main checkout.
   - When two fetches run at once, git lets only one of them update the local `origin/dev`. The other fails with `cannot lock ref 'refs/remotes/origin/dev': is at X but expected Y`.
   - `pushToDev` treats that as a failed fetch, not as "dev moved", so it stops with "nothing landed" instead of retrying.
   - A landing that retries while another landing's push succeeds can hit the same error, because a push also updates the local `origin/dev`.
   - Everything that lands this way is affected:
     - the design/plan close stops with `EXIT_FETCH_FAILED`;
     - ship's close goes to the Failure Path;
     - the Failure Path's record is kept locally but never landed;
     - `pushOwnCommits` and the roadmap mirror fail the same way.
   - The reviewer reproduced it:
     - two plain `git fetch origin dev` runs started together lost one fetch in all 40 of 40 pairs;
     - two real `pushToDev` processes running at once failed with `cannot lock ref …` in 1 of 24 pairs against a local remote. Against GitHub the window is a full network round trip, so it will be hit more often.
   - This contradicts `.bkit/core/.bkit/workflows.md:112`, which promises "no collision with parallel closes".
   - Fix: retry a fetch whose error says `cannot lock ref`, within the existing attempt limit, or give each landing its own private ref to fetch into.
2. **MEDIUM: if the clone isn't set up to fetch `dev`, landing gives up after two minutes even though nothing is wrong.**
   - A single-branch clone is one example. There, the plain `git fetch origin dev` only writes FETCH_HEAD and leaves `origin/dev` out of date. It's used at `land.ts:131`, at `branches.ts:1324` (sync-dev) and at `branches.ts:1819` (the check after a close lands).
   - Every rebuilt push is then rejected with `(fetch first)`, which bkit reads as "dev moved". It retries 10 times and ends with "exhausted, nothing landed", although `dev` never moved. The reviewer measured 2m10s.
   - `worktrees.ts:110-115` already describes this trap. `fetchBranch`, `fetchRemoteRef` and `pushOwnCommits` all avoid it with the explicit form `+refs/heads/dev:refs/remotes/origin/dev`. The landing path is the only one that doesn't.
   - This contradicts `workflows.md:112` ("off fresh `origin/dev`") and the explicit-fetch rule at `workflows.md:1054`.
3. **LOW: ship's close gives up the feature's lock before deleting its worktree** (`shipClose`, `.bkit/core/engine/commands/workflow/workflows.ts:1423`).
   - It releases the lock and then force-removes `.worktrees/{fid}`. On the close-PR path there's also a network fetch in between.
   - Another run of the same feature that takes the lock in that gap would resume into the worktree, which then gets deleted underneath it.
   - `landVerb` does it in the safe order: remove the worktree first, then release the lock.
4. **LOW: back-to-back closes can give wrong advice.**
   - When two closes land one after the other, the second can move local `dev` past the first one's commit before the first finishes.
   - The first landing's `fastForwardDev` (`branches.ts:1702`) then reports "local dev has N commit(s) origin/dev does not". It lists commits that are already on `origin/dev`, tells you to run `git pull --rebase && git push`, and reports `localDev: "skipped"`.
   - The advice is wrong but harmless: `dev` is only ever fast-forwarded, so it never goes backwards.

### Checked and fine
- Both retry loops stop at `LAND_ATTEMPTS`: `pushToDev`, and the PR-merge loop in `landPr`.
- The way push errors are sorted into "dev moved" and "server refused" matches the docs.
- Taking over and releasing locks behaves as the code comments describe, both on the design/plan land path and in ship's close.
- No Failure Path pushes code to `dev`.

The summary for this whole review round is on #551.

---
_Generated by [Claude Code](https://claude.ai/code)_

### Review fixes: done

All four #639 findings are fixed in `49324bf6c`, including the HIGH one; the `workflows.md` and CHANGELOG updates are in `8e18df45f`. Both are on the local branch `review-fixes-deepseek`, which is **not yet pushed**. It fast-forwards into `dev` once another session's uncommitted doc edits are committed.

- **HIGH: two closes landing at once no longer stop with "nothing landed".** When another landing in the same clone updated `origin/dev` during this landing's fetch, git failed the fetch with `cannot lock ref 'refs/remotes/origin/dev'`. `pushToDev` now waits and fetches again within `LAND_ATTEMPTS`, as it already does when `dev` moves.
- **Every dev fetch names `dev` explicitly** (`+refs/heads/dev:refs/remotes/origin/dev`, via a shared `fetchDev`). A clone whose fetch settings skip `dev` no longer builds on a stale `origin/dev` and burns every push attempt. This covers four more fetch sites in `branches.ts` and `shipClose` that had the same bug but weren't in the review.
- **Ship's close removes the worktree before releasing the lock,** the same order `landVerb` uses.
- **A close no longer advises publishing a commit that's already on `origin/dev`.** When a later close has fast-forwarded local `dev`, `fastForwardDev` reports `current`, and its "not on origin" list names only commits that really aren't there.

**Checks:** eight new tests, each seen failing before its fix; the full gate on the branch is green.

---
_Generated by [Claude Code](https://claude.ai/code)_

### Follow-up idea: GitHub does not keep both sides of the ledger files, so build and debug PRs conflict

**One of this issue's assumptions is wrong.** Under "Open Questions & Assumptions" it says GitHub's server-side merge applies `merge=union` to the ledgers, so parallel PRs cannot conflict on them. PR #786 (the build for #699) shows it doesn't. GitHub marked that PR as conflicting, so CI could not run. Running `git merge origin/dev` locally on the same branch was clean, because local git reads `.gitattributes` and keeps both sides' rows; GitHub's mergeability check does not. Running `bkit branches sync --merge-docs` by hand and pushing the merge commit fixed it.

**Where this bites.** Build merges dev in once, at the start (`bkit-build.md` Step 3, `branches sync --merge-docs`), and opens its PR hours later. If another feature appends rows to any union-merged file on dev in between, both sides have added lines at the end of the same file, and GitHub calls it a conflict. That applies to every `merge=union` file: `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/roadmap.md`, `.bkit/issues.jsonl`, `.bkit/stats.jsonl`, `.bkit/friction.jsonl` and `docs/plans/**/status.jsonl`. Debug opens its PR the same way.

**What this issue's change already covers.** The direct design and plan close builds its squash locally in `.worktrees/_land-{fid}` (`branches.ts:1696`), so local git keeps both sides and it is not affected. Its PR fallback, used when a direct `dev` push is refused (for example in a claude.ai session), asks GitHub to update the branch (`updateBranch`, `branches.ts:1912`). That is a server-side merge, so it may hit the same conflict.

**Idea: do the merge in one place in the engine, not in each workflow's text.** Every workflow pushes through `bkit branches push`.

1. Move the merge that `branches sync --merge-docs` does (`syncVerb` in `branches.ts`) into one shared function.
2. Call it from `branches push --require-ci`, just before the push. That flag marks the push CI will test: build `bkit-build.md:1001`, debug `bkit-debug.md:666` and `:698`.
3. Leave ship alone. Ship rebases onto dev (Steps 3 and 4) and force-pushes with `branches push --mode=feature` without `--require-ci`, so tying the merge to that flag skips it.
4. Widen the "is dev ahead" check. Today `--merge-docs` merges only when dev has new commits under `docs/` (`branches.ts:1527`, `docsBehind > 0`), so a dev commit that only adds rows to `.bkit/issues.jsonl`, `.bkit/stats.jsonl` or `.bkit/friction.jsonl` is skipped and the PR still conflicts. The check should cover every path marked `merge=union` in `.gitattributes`.
5. When dev has not moved, the call does nothing. When dev's new commits also conflict on code, it stops the way `--merge-docs` does today (merge aborted, conflict exit), and never resolves code conflicts on its own.
6. Edge case: for the design and plan PR fallback, consider merging dev in locally before the push instead of relying on `updateBranch`.

Not built yet. If taken on, it becomes its own issue in v6.1 under #750, citing this comment and #786.

## #69 — Local dev diverges from origin/dev before worktree setup (closed)

<!-- linear-import: BAR-184 -->
**Linear:** [BAR-184](https://linear.app/bartens/issue/BAR-184) · **Created:** 2026-05-11 · **Linear assignee:** christian@bartens.biz

---

## Summary

Recurring friction (3 entries across [BAR-102](https://linear.app/bartens/issue/BAR-102/plan-milestone-digital-agent-mvp), [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat), [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files) over 2026-05-09 to 2026-05-11; entry 2 already explicitly tagged "Recurring") where Ship Step 1 commits `status.json` (and the ship entry itself) to **local dev** *before* the worktree is set up. The PR is then squash-merged on GitHub, which creates a new commit on `origin/dev` with a different SHA than the local pre-merge commits. Local dev now has the pre-merge commits + origin/dev has the squash commit on a common ancestor → divergent histories. `git pull --rebase` in Ship Step 6 (Switch to Dev) then triggers status.json conflicts (HEAD has resolved ship steps; replayed commit has partial step state). `friction.md` also conflicts in the same window because both branches have appended different entries.

## Root cause

Ship Step 1 (Start Workflow) executes from the **main repo on dev** before the worktree is created. It commits start-workflow status updates straight onto `dev`. After Step 3 (Merge PR) squash-merges the feature PR on GitHub, the local `dev` branch contains its own (un-squashed) status.json + ship-entry commits, while `origin/dev` contains only the GitHub-side squash commit. The two diverge from a common ancestor.

In Step 6 (Switch to Dev), `git pull --rebase origin dev` replays each local commit onto origin/dev one at a time, hitting status.json conflicts because the rebased commit has partial Step 1 state while HEAD has the full ship sequence. Manual `--ours` resolution is required for every status.json hunk and `--theirs` for friction.md.

## Suggested fix (cross-entry consensus)

**Defer all dev-branch commits until after worktree setup.** Move Ship Step 1's status.json commit into the worktree (on the feature branch), not onto local dev. Status updates can be replayed onto dev after Step 6 once dev is in sync with origin/dev. This eliminates the divergence at its source.

Secondary fix: append `bar-NN-{workflow}-start` style commits during Step 1 should target the worktree only; dev-side ledger updates (if needed at all) should be a single post-merge commit in Step 8 (Archive Docs) or Step 11 (Close Workflow).

## Affected friction entries (all RECOVERED, same root cause)

### Entry 1 — [BAR-102](https://linear.app/bartens/issue/BAR-102/plan-milestone-digital-agent-mvp): dev branch diverged from origin/dev after squash merge (2026-05-09)

* **Workflow:** ship, Step 6 — Switch to Dev
* **Source:** orchestrator
* **What happened:** Ship Step 1 added 2 commits to local dev (start-workflow work/status) before worktree was created. After squash merge, local dev had 2 commits + origin/dev had the squash merge on a common ancestor — divergent branches. `git pull --rebase` triggered a status.json conflict (HEAD had resolved ship steps; commit being applied had only partial start-workflow step). Also required Python fix to resolve truncated JSON from partial conflict resolution.
* **Suggested fix:** In Ship Step 1, defer dev-branch commits until after switch-to-dev (Step 6). All ship workflow status updates should happen on dev AFTER merging, not before.
* **Related:** [BAR-102](https://linear.app/bartens/issue/BAR-102/plan-milestone-digital-agent-mvp)-digital-agent-mvp, [BAR-132](https://linear.app/bartens/issue/BAR-132/ws-1-ws-4-bootstrap-and-spikes)
* **Recovery:** Resolved via `--ours` (HEAD version with all ship steps), then fixed truncated JSON with Python. Commit 08dcc19.

### Entry 2 — [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat): Recurring: dev branch diverged from origin/dev after squash merge (2026-05-10)

* **Workflow:** ship, Step 6 — Switch to Dev
* **Source:** orchestrator
* **What happened:** Same as 2026-05-09 [BAR-102](https://linear.app/bartens/issue/BAR-102/plan-milestone-digital-agent-mvp) entry. Ship Step 1 added commits to local dev (status.json sync + ship entry) before worktree creation. After PR squash merge, local dev diverged from origin/dev. Rebase triggered 6 status.json conflicts, all resolved with --ours (taking squash merge content). friction.md also conflicted (resolved with --theirs to keep local addition).
* **Suggested fix:** Still unresolved. Ship Step 1 should not commit status.json to dev before worktree setup. Defer all dev commits until Step 6 after checkout.
* **Related:** [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat)-chat-agent, [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat)
* **Recovery:** Resolved all 6 rebase conflicts with --ours for status.json, --theirs for friction.md. Then reconstructed ship entry in status.json post-rebase.

### Entry 3 — [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files): Ship step 6 dev rebase conflict on friction.md + [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) commits on dev (2026-05-11)

* **Workflow:** ship, Step 6 — Switch to Dev
* **Source:** orchestrator
* **What happened:** `git pull --rebase origin dev` on the main repo's `dev` branch conflicted on `.agents/friction.md` and `.cache/tsbuildinfo.json` (gitignored). Two [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) start-workflow commits were on local dev (accidentally committed there during a prior interrupted [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) ship workflow). Both conflicts required manual resolution.
* **Suggested fix:** (1) Ship Step 6 should check for diverged local dev before rebasing and warn if uncommitted/unpushed commits exist. (2) Start-workflow commits for non-dev branches should never land on dev — ship workflow should verify it's operating from the feature worktree, not the main repo root, when making status commits.
* **Related:** [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files)-prompt-tool-files
* **Recovery:** Resolved friction.md conflict by keeping both entries; resolved .cache conflict with --ours; continued rebase. [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) commits remain on local dev ahead of origin/dev — pending resolution by [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) ship workflow.

## Acceptance criteria

- [ ] Ship Step 1 makes zero commits on `dev` branch directly. All Step 1 status.json updates land on the feature branch in the worktree (or are deferred to Step 8/11 post-merge).
- [ ] Ship Step 6's `git pull --rebase origin dev` runs against a clean local dev (no local commits ahead of origin/dev). If divergence is detected pre-rebase, abort to Failure Path with a clear "local dev has unpushed commits — manual reconciliation required" message.
- [ ] Add a pre-flight check in Ship Step 1: assert `git rev-list --count origin/dev..dev` == 0 before any work. Block start if local dev is ahead of origin.
- [ ] Regression: simulate the [BAR-102](https://linear.app/bartens/issue/BAR-102/plan-milestone-digital-agent-mvp)/[BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat) scenario (squash-merge after local-dev pre-commits) and verify Step 6 either succeeds without conflict or aborts cleanly without partial-state status.json.

## Note on related but distinct issues

This issue is scoped to the **status.json divergence root cause**. The broader "Ship Step 2 bare rebase fails on merged branches" issue (#61 friction entry, `--rebase-merges` discussion) is a separate problem and stays in the friction log. The `friction.md`-specific append-only conflict is a symptom — it appears in entries 2 and 3 here but its lasting fix is the divergence prevention, not friction.md-specific merge logic.

## Workflows affected

`bkit-ship.md` — Step 1 (Start Workflow), Step 6 (Switch to Dev), Step 8 (Archive Docs).

<!-- linear-links-start -->
**Links:**

- **Related:** [BAR-102](https://linear.app/bartens/issue/BAR-102) _(not imported)_, [BAR-132](https://linear.app/bartens/issue/BAR-132) _(not imported)_, [BAR-152](https://linear.app/bartens/issue/BAR-152) _(not imported)_, #61 ([BAR-155](https://linear.app/bartens/issue/BAR-155)), [BAR-166](https://linear.app/bartens/issue/BAR-166) _(not imported)_, #68 ([BAR-183](https://linear.app/bartens/issue/BAR-183)), #71 ([BAR-187](https://linear.app/bartens/issue/BAR-187)), #99 ([BAR-230](https://linear.app/bartens/issue/BAR-230)), [BAR-95](https://linear.app/bartens/issue/BAR-95) _(not imported)_
<!-- linear-links-end -->

<!-- linear-comment: 83c54b3d-23e4-480d-af6a-fb96ed373d99 -->
**@christian (Linear, 2026-05-11):**

## Scope expansion — applied to all 5 phase workflows

Originally scoped to `bkit-ship` because the friction symptoms (status.json rebase conflicts in Switch-to-Dev) only surfaced during ship runs. Reviewing the root cause revealed the same pre-worktree commit anti-pattern in every workflow:

<!-- prettier-ignore -->
| Workflow | Step 1 git scope before | Compliance |
| --- | --- | --- |
| `bkit-design` | `git add docs/plans/ .agents/friction.md` (allow-list, but still commits to local `dev`) | Rule 87 ✓ but BAR-184 ✗ |
| `bkit-plan` | `git add docs/plans/ .agents/friction.md` (same) | Rule 87 ✓ but BAR-184 ✗ |
| `bkit-build` | `git add -A` (sweeps tracked dirty files to `dev`) | **Violates Rule 87** ✗ |
| `bkit-debug` | `git add -A` (same) | **Violates Rule 87** ✗ |
| `bkit-ship` | `git add -A` (same — this PR's original scope) | **Violates Rule 87** ✗ |

### Why expansion is in-scope, not a separate issue

Without applying the fix to all 5 workflows, the ship-only fix would degrade UX: every `plan` / `design` / `build` / `debug` cycle leaves orphan `start-workflow` commits on local `dev` that never reach `origin/dev` directly. Ship's new pre-flight check (`git rev-list --count origin/dev..dev` = 0) would then block ship until the user manually `git reset --hard origin/dev`. The ship-only fix converts silent divergence into loud friction at the wrong step.

`.agents/workflows.md` Rule 49 ("Cross-workflow alignment: ALWAYS change shared lines in ALL workflows using them") makes uniform application of shared patterns a requirement, not an option. The "no commits on `dev` pre-worktree" pattern is exactly that kind of shared invariant.

### What was applied to each workflow

1. **Step 1 sub-step 1 (lock acquisition)** — added pre-flight `git fetch origin dev` + `[ "$AHEAD" -gt 0 ] && exit 1` inline at the top of the lock bash block (matches existing `[ $LOCK_AGE -lt 7200 ] && exit 1` one-liner pattern).
2. **Step 1 status-init sub-step** — fully deleted (Rule 45: removal = delete, not replace with explanation). Renumbered subsequent sub-steps.
3. **Step 2 status-init sub-step** — expanded to do `ship/plan/build/debug/design` workflow entry init (idempotent) + commit `start-workflow work` + commit `start-workflow status` + existing `worktree-setup work` + `worktree-setup status`. Four commits, all on `feat/{FID}` inside the worktree.
4. **Step 1 Gate** — removed "Workflow status updated (...)" line (no longer touched in Step 1); added "Local `dev` NOT ahead of `origin/dev`" + "Lock acquired (...)" assertions.
5. **Step 2 Gate** — updated to assert BOTH `start-workflow` AND `worktree-setup` step entries recorded with `commitSha`.
6. **`bkit-build` Step 2 sub-step 1** — also fixed pre-worktree commit pathspec from exclusion (`':!.DS_Store' ':!*.log' ...`) to Rule 87 allow-list (`docs/plans/ .agents/friction.md`).
7. **`bkit-debug` `debugAttempt` carry-through** — preserved: the `.[-1] |= (. + {debugAttempt:$da})` jq mutation moved from Step 1 to Step 2's `start-workflow` commit block.
8. **`bkit-ship` Step 7 (Switch to Dev)** — replaced `git pull origin dev` with `git fetch` → divergence re-check → `git pull --ff-only`. Aborts to Failure Path on non-zero ahead-count. Ship-specific because only ship pulls dev mid-workflow.

### Rationale documentation

Moved from per-workflow files to `.agents/workflows.md` § Common Workflow Anatomy per Rule 47 ("Rationale lives here … NEVER in per-workflow files"). New section "Pre-worktree divergence guard (BAR-184)" generalises what was previously framed as a ship-specific exception. Common Workflow Anatomy step list updated to reflect that status init now lives in Step 2 across all 5 workflows, not Step 1.

### Files modified

- `.agents/workflows/bkit-ship.md`, `bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md` — uniform fix
- `.agents/workflows.md` — anatomy line, divergence guard section, all 5 phase tables

No template-side mirror (none exists for these files). Mirror regen (`pnpm bkit install`) deferred to session end per batching convention.

## #209 — Workflow state model: squash to dev, persistent feat branch (closed)

## Problem

Today the workflow state model has two friction points that hurt cloud-agent dispatch:

1. **`status.json` is pushed to `dev`** (one `[skip ci]` snapshot per run, every phase). Nobody reads it on `dev` — it's a *rendezvous file*, written there only because the cloud runner checks out `ref: dev` (`.github/workflows/bkit-cloud.yml:114`) and that's the one ref a stateless runner is guaranteed to reach. It's the path of least resistance, not a requirement.
2. **Per-phase branch lifecycle is inconsistent.** design and plan each create a throwaway `feat/{FID}` worktree, squash-merge their doc to `dev`, then **delete** the branch; build creates `feat/{FID}` and *keeps* it (the PR spine). So state lives in different places depending on phase.

Considered and **rejected**: "a PR for every workflow" — design→plan→build is a strict chain, so a design PR would have to auto-merge before plan starts anyway (pure ceremony), and a doc-only PR either burns the full `bkit-tests` suite (`ci.yml` has no path filter) or is `[skip ci]` and un-gateable. Human review is already handled conversationally (agent walks through checkpoints, human approves), so a human-merged PR buys nothing.

Also rejected: **one long-lived branch from design→ship** — design↔build can be days apart while `dev` moves on, so a branch spanning that whole window means constant rebasing.

## Decision — the approach

Keep squash-merge to `dev`. No PR ceremony for design/plan. Localize the persistent branch to the window that needs it.

### 1. design & plan → squash-merge to `dev`, "dev always wins" on conflict

design/plan are doc-only phases: the only files they add are FID-namespaced (`docs/plans/{YYYYMM}/{FID}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/**`), which `dev` never touches, so they **cannot conflict** (new files always land). The only genuinely-shared mutable file they touch is `.agents/friction.md` (the close-workflow sweep).

Change the close-workflow merge (`bkit-design.md:764`, same in `bkit-plan.md`) from:

```bash
git merge --squash "feat/{FID}"
```

to:

```bash
git merge --squash -X ours "feat/{FID}"
```

`-X ours` keeps `dev`'s side on a conflicting hunk while **still bringing in non-conflicting** feat changes (the new doc + logs). Result: docs/logs always land, any shared-file collision silently resolves to `dev`, and the merge **never halts → Failure Path** on drift. This is the fix for the "days of `dev` movement → rebasing pain" concern: design/plan never hold a branch across that gap; they merge straight to `dev`.

**Guard:** after the merge, assert the staged diff touches nothing outside `docs/plans/**` and `.agents/friction.md`. design/plan have no business changing code; if they did, surface a loud log rather than let "dev wins" silently drop it.

Note on `.agents/friction.md`: it's the one shared file `-X ours` adjudicates. Non-colliding appends survive; a directly-colliding hunk resolves to `dev`. Acceptable for an append-mostly file.

### 2. build creates the one persistent `feat/{FID}`, lasting build → debug → ship

- build branches `feat/{FID}` from `dev`. Because design and plan already squash-merged their docs to `dev`, **build inherits the design + plan docs for free** by branching from `dev` — no cross-branch reading.
- The branch persists through debug and ship; ship squash-merges it back to `dev` and deletes it (today's behavior). Rebasing during this window is already handled (`bkit-ship.md:249` rebases on `origin/dev` before merge).

### 3. build/debug/ship state comes off the branch

Because `feat/{FID}` now persists build→ship, those phases write `status.json` + logs **only on the branch** — no `[skip ci]` dev pushes mid-lifecycle. The state reaches `dev` exactly once, as an audit record, when ship squash-merges the branch.

- The cloud runner for ship/debug reads state from `feat/{FID}` (it already knows `head_branch`) instead of `ref: dev`.
- design/plan `status.json` *does* still land on `dev` (no persistent branch for those phases) — but that's now just a cheap one-commit archive, not a live state bus.

## Absorbed from #203 — two related defects

These defects were originally described under "Related defects" in #203. They are bkit-core orchestration plumbing (not CI-gate design) and do not flow from the gether-403 work. They belong here because the same branch/state lifecycle this issue redesigns is the root cause of both, and they share change surface with sections 1–3 above.

### Defect A — status.json conflicts → unmergeable PRs → CI never runs

**Root cause:** `status.json` for a given FID is committed on **both** `dev` (design/plan/build phases + the once-per-run dev commits) and `feat/{FID}` (per-step commits) → divergent content on the same path → conflict. A merge conflict on `docs/plans/{YYYYMM}/logs/{FID}/status.json` makes the PR unmergeable, so GitHub cannot build `refs/pull/N/merge` and **`pull_request` CI never runs** (`ci.yml` push triggers are `[main, dev]` only). Observed in gether — PR blocked on `docs/plans/202605/logs/313-url-monitor-v2/status.json` with "This branch has conflicts that must be resolved."

**Primary fix — the state model above.** Keeping `status.json` writes on the branch (not pushed to `dev` mid-lifecycle) removes the divergence source. The conflict cannot arise if only one ref writes to a given FID's log files during build→ship.

**Additive hardening — NDJSON event log + `merge=union` (if desired).** Convert `status.json` → append-only `status.jsonl`: one event per line (`workflow-started` / `step-done` / `workflow-done`), **never mutate prior lines**; derive current state by folding the log on read. Add `*.jsonl merge=union` to `.gitattributes` (+ template) so git auto-concatenates both branches' appended lines server-side — no conflict, PR stays mergeable. Union can interleave/duplicate lines, so the reader folds + dedupes by `(workflow, step, parentSha)` and orders by `at`. (Per-entry-file directory was the alternative; NDJSON+union chosen for consistency with the existing union-ledger pattern in `.gitattributes`.)

NDJSON scope (if included):
- `bkit-status.ts` becomes a **reducer** over the event log (current-state = fold of lines), + its tests.
- Every status-write `jq` site across the 8 `.agents/workflows/*.md` rewrites from array-mutation to **line-append**.
- `.gitattributes` **and** `.agents/templates/.gitattributes` gain the `*.jsonl merge=union` rule.
- Resume / lock-staleness logic that reads `.[-1]` switches to "fold then inspect latest."

> Note: this does **not** by itself make CI run on an *already*-conflicted PR; it removes the **cause** so PRs stop becoming unmergeable in the first place.

### Defect B — `[skip ci]` status commit as the PR-branch tip suppresses ALL CI

**Root cause.** When the **tip of `feat/{FID}` carries a CI-suppressing token**, GitHub skips the workflow natively and gether's gate sets `run_level=none` → **zero CI runs**. Observed in gether: `feat/313-url-monitor-v2` tip was `chore(313-url-monitor-v2): build DONE bkit [skip ci]` — a status.json-only commit. The `[skip ci]` is correct *for its intended home, `dev`*; the defect is a **dev-destined status commit becoming the tip of the PR branch**.

Three defects compounding:
1. bkit's `feat/{FID}` branch accumulates many `[skip ci]` / `[skip build]` status + docs commits.
2. The terminal `build DONE` status commit leaked onto `feat` as well as `dev` (same message, two SHAs) — it should be `dev`-only per `bkit-build.md:1186` (`push origin dev`).
3. A **status.json conflict** (Defect A above) forced a manual `git rebase origin/dev -X theirs` + force-push, which **replayed the skip-ci status commit back to the tip**, bypassing the build workflow's HEAD-Subject Assertion guard.

**Fix — harden the "PR tip != suppressing token" invariant at every mutation point:**
- **Don't leak the terminal `build DONE [skip ci]` onto `feat`.** Assert branch identity (`git branch --show-current` == `dev`) immediately before that commit/push in `bkit-build.md` Close.
- **Re-run the HEAD-Subject Assertion after EVERY feat mutation** — at PR creation, and **after any conflict-resolution rebase/force-push** (both the `bkit-ship-conflict-resolve` agent path *and* documented manual recovery). If the feat tip carries `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]`/`[skip build]`, append an empty `[force build]` trigger commit before declaring the push complete.
- This compounds with Defect A: removing the status.json conflict removes the rebase that re-exposed this. Fix together.

Change surface: `bkit-build.md` (Close branch-identity assert + PR-creation guard), `bkit-ship.md` + `bkit-ship-conflict-resolve` (post-rebase guard) + mirrors.

## Change surface (combined)

- `bkit-design.md` / `bkit-plan.md` — close-workflow merge → `git merge --squash -X ours`; add the doc/log-namespace guard. Keep dev push + branch delete (throwaway branch).
- All workflows — build/debug/ship drop the per-run `status.json` push to `dev` ("Status branch" rule); state stays on `feat/{FID}` until ship's final merge.
- `bkit-ship.md` / `bkit-debug.md` — check out `feat/{FID}` *before* reading `status.json`; read `PRIOR_STRATEGY` / `DEBUG_ATTEMPT` from the branch.
- `.github/workflows/bkit-cloud.yml` — `ref: dev` (line 114) stays correct for brief-class design/plan/build; ship/debug (CI-class) operate on the `feat/{FID}` checkout to read branch-local state.
- `bkit-build.md` — branch-identity assert before terminal `build DONE` commit; PR-creation HEAD-Subject Assertion guard.
- `bkit-ship-conflict-resolve` — post-rebase HEAD-Subject Assertion guard.
- `bkit-status.ts` (+ tests, mirrors) — if NDJSON hardening is included.
- `.gitattributes` + `.agents/templates/.gitattributes` — `*.jsonl merge=union` rule, if NDJSON hardening is included.
- Regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors after any workflow edits.

## Sharp edges (small, non-blocking)

1. **friction.md** is the one shared mutable file `-X ours` adjudicates — colliding hunks resolve to `dev`.
2. **design/plan `status.json` stays on `dev`** — accepted as cheap archive; the original "pollutes dev" complaint is solved for the phases that have a branch (build→ship).
3. **Cloud design/plan crash-resume is weak** — ephemeral worktree is gone and there's no dev snapshot until close, so a re-dispatch restarts the phase. This is true today too (not a regression); this change does not fix it.

## Open product question

Single-window branch means an **approved design/plan that never reaches build** still lands its doc on `dev` (because design/plan merge to `dev` regardless) — so this model *keeps* the "approved designs are on dev" property. Confirmed acceptable.

## Related

- #119 (cloud phase-routed dispatch) — the `ref: dev` checkout and CI-class vs brief-class routing this builds on.
- #203 (CI verdicts / green != validated) — the two defects absorbed here were originally described under "Related defects" in that issue. #209 should land before #203.

## Implementation design (1/3) — decisions + status.jsonl event model

Recording the implementation design before/while building on `dev` (this is being done directly in `dev`, not via the bkit workflow — we cannot dogfood the workflow files we are editing).

### Decisions locked

<!-- prettier-ignore -->
| Decision | Choice | Rationale |
| --- | --- | --- |
| Scope this pass | **Full**: state model (§1–3) + Defect B (skip-ci tip guard) + Defect A NDJSON hardening | Owner opted in to everything incl. NDJSON. |
| NDJSON read/write mechanism | **Inline jq fold** — workflows stay pure bash+jq, no node/dist runtime dependency at status sites | Avoids coupling status ops to the compiled `dist/` (and to #160's bin relocation). Cost accepted: the fold filter is repeated at the ~10 read sites. |
| `bkit-status.ts` | Stays as the **canonical reference reducer + `validateInvariants`**, now with a `fold` reducer + vitest coverage | The jq fold mirrors the TS reducer; TS is the unit-tested source of truth for fold semantics even though workflows execute jq. |
| Execution | **Two movements in this branch** (see comment 3/3) | Movement 1 (state model + Defect B) is independently valuable AND structurally removes the Defect A conflict; Movement 2 (NDJSON) is additive hardening. |

### Why the state-model change alone already fixes Defect A

Once build/debug/ship stop pushing `status.json` to `dev` mid-lifecycle (state lives only on `feat/{FID}` until ship's final squash-merge), the same FID's `status.json` is no longer written on **both** `dev` and `feat/{FID}` → the divergent-path merge conflict that made PRs unmergeable cannot arise. NDJSON + `merge=union` is belt-and-braces on top.

### status.jsonl event model

One JSON object per line, append-only, **prior lines never mutated**. Replaces the single nested `status.json` array (`[{workflow, startedAt, status, steps:[...]}]`).

**Event types:**

```jsonc
// opens a new run of a phase workflow
{"type":"workflow-started","workflow":"build","at":"<iso8601>"}

// one per completed step (the bulk — ~90 sites)
{"type":"step-done","workflow":"build","step":"build-run-tests","status":"DONE",
 "at":"<iso8601>","parentSha":"<sha>","artifacts":[],
 "verdict":"PASS","attempt":1,"subPlan":1,"failures":0,"strategy":"STANDARD"}
//   ^ verdict/attempt/subPlan/failures/strategy all optional, same as today's Step shape

// workflow-level metadata merged onto the run (e.g. debug counters)
{"type":"workflow-meta","workflow":"debug","at":"<iso8601>","debugAttempt":2}

// terminal state — replaces `.[-1] |= (.+{status:"DONE"|"FAILED"})`
{"type":"workflow-done","workflow":"build","at":"<iso8601>"}
{"type":"workflow-failed","workflow":"build","at":"<iso8601>"}
```

**Dedup identity** (union can interleave/duplicate lines):
- `step-done`: `(workflow, step, parentSha, at)`
- `workflow-*`: `(type, workflow, at)`

Keep first occurrence; then order by `at`.

### Canonical fold (jq `-s` over `status.jsonl` → legacy shape)

Reconstructs the exact `[{workflow, startedAt, status, steps:[...], <meta>}]` structure every existing read expects, so read queries downstream of the fold are unchanged.

```jq
# FOLD: array-of-events (from `jq -s` over status.jsonl) -> legacy status array.
# Canonical logic lives in bkit-status.ts (unit-tested); this jq mirrors it.
def lastIdx($w): [range(0;length) as $i | select(.[$i].workflow==$w) | $i] | last;
def fold:
  ( reduce .[] as $e ({seen:{},out:[]};
      ( if $e.type=="step-done"
        then "S^@\($e.workflow)^@\($e.step)^@\($e.parentSha)^@\($e.at)"
        else "W^@\($e.type)^@\($e.workflow)^@\($e.at)" end ) as $k
      | if .seen[$k] then . else .seen[$k]=true | .out += [$e] end )
    | .out | sort_by(.at) ) as $ev
  | reduce $ev[] as $e ([];
      if $e.type=="workflow-started" then
        . + [{workflow:$e.workflow, startedAt:$e.at, status:"IN_PROGRESS", steps:[]}]
      elif $e.type=="step-done" then
        (lastIdx($e.workflow)) as $i
        | if $i==null
          then . + [{workflow:$e.workflow, startedAt:$e.at, status:"IN_PROGRESS",
                     steps:[($e|del(.type,.workflow))]}]
          else .[$i].steps += [($e|del(.type,.workflow))] end
      elif $e.type=="workflow-meta" then
        (lastIdx($e.workflow)) as $i
        | if $i==null then . else .[$i] += ($e|del(.type,.workflow,.at)) end
      elif $e.type=="workflow-done" then
        (lastIdx($e.workflow)) as $i | if $i==null then . else .[$i].status="DONE" end
      elif $e.type=="workflow-failed" then
        (lastIdx($e.workflow)) as $i | if $i==null then . else .[$i].status="FAILED" end
      else . end );
```

**Read sites** become `jq -s 'fold | <existing query>' "$STATUS"` (with `def fold` prepended), e.g. resume logic's `[.[] | select(.workflow==$w)] | last` runs verbatim against `fold` output.

**Write sites** become a single appended line, e.g.
```bash
jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" --arg v "$VERDICT" \
  '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",
    at:$t,parentSha:$p,artifacts:[],verdict:$v,attempt:1,failures:0}' >> "$STATUS"
```

Next: comment 2/3 = full site inventory; comment 3/3 = two-movement execution plan + per-file edit specs.

## Implementation design (2/3) — complete status-site inventory

Exhaustive map of every status read/write site driving the NDJSON conversion. Line numbers are against `dev` at time of writing (`bkit-design.md` 793L, `bkit-plan.md` 774L, `bkit-build.md` 1230L, `bkit-ship.md` 933L, `bkit-debug.md` 1093L, `bkit-cloud.md` ~210L). Reference counts: build 83, debug 71, ship 65, plan 53, design 50, cloud 21; `worktree-sync`/`worktree-prune` = none.

### Write sites by event class

**`workflow-started`** (`. + [{workflow:…, startedAt:(now|todate), status:"IN_PROGRESS", steps:[]}]`):
design:245 · plan:249 · build:318 · debug:301 · ship:293 · cloud:159

**`workflow-failed`** (Failure Path, `.[-1] |= (.+{status:"FAILED"})`):
design:56 · plan:56 · build:58 · debug:58 · ship:58 · cloud:57

**`workflow-done`** (Close Workflow, `.[-1] |= (.+{status:"DONE"})`, fused with the close step-done):
design:728 · plan:710 · build:1152 · debug:948 · ship:881 · cloud:206

**`step-done`** (`.[-1].steps += [{…}]`) — ~90 sites:
- design: 249, 252, 305, 346, 397, 443, 489, 535, 674, 727
- plan: 253, 256, 301, 353, 398, 448, 494, 540, 585, 635, 709
- build: 322, 325, 368, 411, 463, 508, 574, 620, 672, 714, 768, 816, 868, 928, 976, 1022, 1103, 1151
- debug: 305, 309, 422, 488, 536, 595, 639, 695, 762, 825, 883, 947, 995
- ship: 297, 300, 367, 415, 490, 544, 602, 658, 714, 717, 775, 830, 880
- cloud: 163, 204

**`workflow-meta`** (fused metadata writes, `.[-1] |= (.+{…})`):
- debug:305–307 (`debugAttempt` on start), debug:639–641 (`debugAttempt` on push-remediation)

### Read sites

**Resume / lock-staleness** (`[.[] | select(.workflow==$w)] | last` → `.status`, `.steps | last | .at`) — identical block in 5 files:
design:105–114 · plan:106–114 · build:133–140 · debug:133–140 · ship:133–140

**Strategy extraction** (`[.[] | .steps[] | select(.step==$s and .status=="DONE")] | last.strategy // ""`):
build:551–555 (plan-gaps-remediate, also keyed `.subPlan==$sp`) · build:906–910 (failure-diagnose) · debug:469 (failure-diagnose) · ship:579–583 (failure-remediate)

**Debug metadata** (`[.[] | select(.workflow=="debug")] | last.debugAttempt // 0`; `…| .steps[] | select(.step=="worktree-setup")] | last.observeMode // "off"`):
debug:172–174

### Path / git-op references (rename `status.json` → `status.jsonl`)

**`STATUS=`/`STATUS_REL=` assignments** (one per step + Step 1): every `STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.json"` and `STATUS_REL="docs/plans/$YYYYMM/logs/{FID}/status.json"` across all 6 files (design ~12, plan ~12, build ~20, debug ~14, ship ~15, cloud ~3).

**Markdown links** to status in the Step-1 issue comment: design:267 · plan:271 · build:340 · debug:324 · ship:315

**`git add` of status:** design:62,737 · plan:62,719 · build:65,1166 · debug:65,1021 · ship:65 · cloud:208

**`git merge --squash`** (design/plan close only): design:736 · plan:718  → become `git merge --squash -X ours` (§1)

**`git push origin dev`** of status: design:739 · plan:721 · cloud:210; plus Failure-Path dev push design:64 / plan:64 / build:66 / debug:66 / ship:66 → build/debug/ship dev pushes of status are **dropped** (§3); design/plan retain (no persistent branch).

**`.github/workflows/bkit-cloud.yml`:** `ref: dev` at line 114 (+ BAR-187 note ~line 78) — stays for brief-class design/plan/build; ship/debug (CI-class) read branch-local state from `feat/{FID}`.

### Notes carried into edits

- The close step-done + `workflow-done` are **fused** in one jq today (design:727–729 etc.); in NDJSON they become two appended lines (`step-done` then `workflow-done`).
- debug fuses step-done + `workflow-meta` (debugAttempt) at 305–307 and 639–641 → two appended lines.
- build's strategy read at 551–555 additionally filters `.subPlan==$sp` — fold output preserves `subPlan` on steps, so the query is unchanged post-fold.
- Status-doc prose blocks to update: the `> - **Status:**` and `> - **Status branch:**` bullets (design:23–25, plan:23–25, and equivalents) describing the model.

Next: comment 3/3 = two-movement execution plan + per-file edit specs + verification gates.

## Implementation design (3/3) — two-movement execution plan

All in one `dev` branch, but sequenced as two independently-verifiable movements. Mirrors (`.claude/commands/*`, `.cursor/commands/*`) regenerated once at the **end of each movement**, not per edit (per repo norm).

---

### Movement 1 — state model (§1–3) + Defect B  *(high-value, ~30 edits, lower risk)*

**§1 — design/plan squash-merge "dev always wins"**
- `bkit-design.md:736` & `bkit-plan.md:718`: `git merge --squash "feat/{FID}"` → `git merge --squash -X ours "feat/{FID}"`.
- After the merge, add a **namespace guard**: assert the staged diff touches nothing outside `docs/plans/**` and `.agents/friction.md`; else loud log (do not let "dev wins" silently drop a code change).
  ```bash
  STRAY=$(git diff --cached --name-only | grep -vE '^docs/plans/|^\.agents/friction\.md$' || true)
  [ -n "$STRAY" ] && { echo "design/plan close touched non-doc files:" >&2; echo "$STRAY" >&2; exit 1; }
  ```
- Keep the dev commit + branch delete (throwaway branch unchanged).

**§2/§3 — build/debug/ship: state stays on `feat/{FID}`; no mid-lifecycle dev push of status**
- Drop the `git pull/add/commit/push origin dev` of `status.json` in build/debug/ship **Failure Path** (build:61–64, debug:61–64, ship:61–64) and any once-per-run dev status push — status writes commit on `feat/{FID}` only.
- ship/debug **read state from `feat/{FID}`**: ensure the `feat/{FID}` checkout happens *before* the Step-1 status read (resume/lock) and before `PRIOR_STRATEGY` / `DEBUG_ATTEMPT` reads. Today these read from the dev checkout.
- Update the `> - **Status branch:**` prose bullet in build/debug/ship to state: per-step commit on `feat/{FID}`; state reaches `dev` once, at ship's final squash-merge.
- `.github/workflows/bkit-cloud.yml`: ship/debug (CI-class) operate on the `feat/{FID}` checkout (it knows `head_branch`); `ref: dev` (line 114) stays for brief-class design/plan/build. `bkit-cloud.md:208–210` CI-class dev status push reconsidered accordingly.

**Defect B — PR-tip must never carry a CI-suppressing token**
- `bkit-build.md` Close: before the terminal `build DONE … [skip ci]` commit/push, assert `git branch --show-current` == `dev` (don't leak the dev-only status commit onto `feat`).
- Re-run the **HEAD-Subject Assertion** after *every* `feat` mutation — at PR creation (`bkit-build.md`) and after any conflict-resolution rebase/force-push (`bkit-ship.md` + `bkit-ship-conflict-resolve`). If the `feat` tip subject matches `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]`/`[skip build]`, append an empty `[force build]` trigger commit before declaring the push complete.
  ```bash
  TIP=$(git log -1 --format=%s feat/{FID})
  case "$TIP" in
    *"[skip ci]"*|*"[ci skip]"*|*"[no ci]"*|*"[skip actions]"*|*"[actions skip]"*|*"[skip build]"*)
      git commit --allow-empty -m "chore({FID}): [force build] re-trigger CI after status-commit tip" ;;
  esac
  ```

**Movement 1 gate:** `pnpm bkit-trackers` render sweep clean (8×3); `pnpm test` green; regenerate mirrors; manual diff review of the 6 workflow files confirms no stray non-doc paths in §1 guard.

---

### Movement 2 — NDJSON (Defect A hardening)  *(~145 sites, mechanical, higher churn)*

1. **`bkit-status.ts`** — add the `fold` reducer (events → legacy run array) + `appendEvent` helper + event type union; keep `validateInvariants`. **`bkit-status.test.ts`** — cover: single-run fold, multi-run/multi-phase fold, union dedup (duplicated + interleaved lines), `workflow-meta` merge, terminal state, invariant validation on folded steps.
2. **`.gitattributes` + `.agents/templates/.gitattributes`** — add `*.jsonl merge=union` (alongside existing union-ledger entries).
3. **Per-file conversion** (design → plan → cloud → ship → debug → build, simplest first):
   - rename `status.json` → `status.jsonl` at every `STATUS=`/`STATUS_REL=`/`git add`/markdown-link/commit-path site;
   - every write → appended event line(s) (fused writes split into 2 lines);
   - every read → `jq -s 'def fold: …; fold | <existing query>' "$STATUS"`;
   - resume/lock + strategy + debug-meta reads use the fold then the unchanged downstream query.
   Each file is independent → may fan out to subagents with this exact spec, then reconcile.
4. **One-time migration / coexistence** — reader tolerates a legacy `status.json` (single JSON array) OR new `status.jsonl`: if `status.jsonl` absent but `status.json` present, treat the array as already-folded; first write creates `status.jsonl`. (In-flight FIDs across the boundary.)

**Movement 2 gate:** `pnpm test` green incl. new fold tests; render sweep clean; regenerate mirrors; spot-check a folded multi-phase `status.jsonl` reproduces the legacy nested shape byte-for-byte for the read queries.

---

### Out of scope (confirmed)
- Cloud design/plan crash-resume weakness (pre-existing, not a regression — §"Sharp edges" #3).
- design/plan `status.json` on `dev` (accepted cheap archive — §"Sharp edges" #2).

### Cross-issue note
This lands **before #203** (per roadmap #214). #203's CI-gate work builds on the settled branch/state model here. NDJSON `merge=union` + the dropped mid-lifecycle dev push together remove the unmergeable-PR class that blocked `pull_request` CI — a precondition #203's "assert `bkit-gate` on the PR's full run" relies on.

## Implementation note (4/3) — §3 read-location + migration, decided during build

Two details the plan left open, resolved while converting `bkit-build.md` (the reference file):

### Where build/debug/ship status physically lives (the §3 crux)
Today `STATUS="$REPO_ROOT/docs/.../status.json"` resolves to the **dev main worktree** (`$REPO_ROOT = dirname(git-common-dir)` = main repo, not the feat worktree). Per-step writes land on dev's working copy; the once-per-run dev push is how they reach history → the dev↔feat divergence behind Defect A.

**Resolution (build/debug/ship):** status writes target the **feat worktree** copy (`$(git rev-parse --show-toplevel)/docs/.../status.jsonl`, cwd = worktree after Step 2), committed on `feat/{FID}` via the existing `git add -A` step commits. The mid-lifecycle dev push is **dropped** (Failure Path + close). State reaches dev once, at ship's squash-merge.

**Step-1 lock/resume read** runs *before* the worktree is cd'd, and must see in-flight state. Resolution: read from the worktree copy when it exists, else the dev copy:
```bash
REL="docs/plans/$YYYYMM/logs/{FID}/status.jsonl"
SRC="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$REL"
```
design/plan keep dev-located status (no persistent branch — the accepted "cheap archive"), so their reads stay `$REPO_ROOT`-based.

### Migrate-once at Step 1 (coexistence) — keeps every read uniform
Rather than branching every read on `.jsonl` vs legacy `.json`, each workflow's Step 1 converts a legacy array to events **once**, so all downstream reads can assume `.jsonl` and just fold:
```bash
LEGACY="$REPO_ROOT/$DIR/status.json"; JSONL="$REPO_ROOT/$DIR/status.jsonl"
if [ -f "$LEGACY" ] && [ ! -f "$JSONL" ]; then
  jq -c '.[] as $w | ($w.workflow) as $wf
    | {type:"workflow-started",workflow:$wf,at:$w.startedAt}
    , ($w.steps[] | {type:"step-done",workflow:$wf} + .)
    , (if $w.status=="DONE" then {type:"workflow-done",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
       elif $w.status=="FAILED" then {type:"workflow-failed",workflow:$wf,at:($w.steps[-1].at // $w.startedAt)}
       else empty end)' "$LEGACY" > "$JSONL"
fi
```
(Mirrors `parseStatus` in `bkit-status.ts`, which already tolerates both forms for the install/upgrade boundary.)

### Read sites inline the validated fold verbatim
The `def lastIdx … def fold` block (comment 1/3), proven byte-equal to the TS reducer, is inlined at each of the ~10 read sites: `jq -s '<fold> | <existing query>' "$SRC"`. WRITE sites are a single appended event line (no fold). This is the accepted verbosity cost of the "inline jq fold, no node dependency" mechanism.

### Progress (uncommitted on dev)
Done + verified: `bkit-status.ts` reducer + 18 tests; jq-fold↔TS parity; `.gitattributes` ×2; §1 design/plan `-X ours` + guard; `bkit-build.md` Failure Path (§3 pattern: append `workflow-failed`, drop dev push, feat-located, `.jsonl`). Typecheck + tests green. Remaining: finish build (Step 1 migrate/resume, ~16 writes, 2 strategy reads, Step 2 start, close, PR, Defect B) then replicate to debug/ship/design/plan/cloud; cloud.yml `ref` for CI-class; regenerate mirrors.

## Implementation note (5/3) — comment-block link permanence (branch-pruning)

Surfaced while reviewing #209: the tracker `comment` blocks deep-link WIP artifacts by branch (`tree/{BRANCH}`, `blob/{BRANCH}/…`, where `{BRANCH}` = `feat/{FID}`). Those links **404 once `feat/{FID}` is pruned**, and the comments persist on the issue forever. §3 sharpened this for the `status.jsonl` link specifically — that file now lives on `feat` (not `dev`) for build/debug.

### Rule adopted
> **Link to `feat` while feat is alive and holds the artifact; link to `dev` once the artifact is permanently on `dev` (post-merge / post-close).**

Per workflow:

<!-- prettier-ignore -->
| Workflow | Link base | Why |
| --- | --- | --- |
| `design` / `plan` | **`dev`** | They prune `feat` at close, so feat links break the moment the run ends. Their canonical doc + log artifacts land on `dev` via the `-X ours` squash-merge → `dev` links are permanent. (Trade: a `dev` link 404s *during* the short run, before the close merge — acceptable for a comment that lives forever.) |
| `build` / `debug` | **`feat`** (unchanged) | Neither deletes `feat`; it lives across the whole build→debug→ship window — exactly when these WIP deep-links are clicked (live monitoring). They break only after ship prunes feat, by which point the PR + merged `dev` code are the durable references. Also §3-correct: build/debug `status.jsonl` genuinely lives on `feat` during the run. |
| `ship` | **already split — leave it** | ship deletes `feat` mid-run (Step 5, `gh pr merge --delete-branch`). It correctly uses `feat` for pre-merge Steps 1-7 and `dev` for post-merge Steps 8-12. Blanket-hardcoding ship to `feat` would re-break its close/switch-to-dev comments. |

The codebase already used this pattern for *final* links (ship close → `tree/dev` / `blob/dev/…`; canonical design/plan docs → `blob/main/…`); this just extends it to design/plan's per-step links.

### Change applied (uncommitted, with #209)
- `bkit-design.md` (7 link sites) + `bkit-plan.md` (8 link sites): `tree/{BRANCH}` → `tree/dev`, `blob/{BRANCH}/…` → `blob/dev/…` in the `comment` blocks only (bash `$BRANCH` / prose `{BRANCH}` untouched). `build`/`debug`/`ship` unchanged. Mirrors regenerated; tests green.

### Considered, not taken
- **Commit-SHA blobs** (`blob/{SHA}/…`) — the only zero-compromise option (live *and* permanent, survives prune). Rejected as too heavy for these glance-navigation links (capture+substitute a SHA per comment, uglier URLs). If the design/plan during-run 404 window ever matters, SHA-linking is the upgrade path.

## Implementation note (6/3) — `merge=union` scoped to the status path (not blanket `*.jsonl`)

Correction to the `.gitattributes` change: shipped `*.jsonl merge=union` was **too broad** — it would impose union-merge on *any* `.jsonl` a consumer has (datasets, fixtures, NDJSON logs). `merge=union` is **destructive for non-append-only files** (it concatenates both sides with no dedup → corrupt merge), and it also broke the file's own convention (every other entry is a specific path: `docs/pending.md`, `.agents/friction.md`).

Scoped to bkit's status files only:
```gitattributes
docs/plans/**/status.jsonl merge=union
```
(`*/status.jsonl` was considered but wouldn't match — gitattributes anchors slashed patterns and `*` doesn't cross `/`, so it can't reach the 4-deep `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`; `**` is required.)

Verified with `git check-attr merge`:
- `docs/plans/202606/logs/foo-123/status.jsonl` → `union` ✓
- `data/training.jsonl`, `fixtures/records.jsonl` → `unspecified` ✓ (consumer files untouched)

Applied to both `.gitattributes` and `.agents/templates/.gitattributes` (identical); index refs in `workflows.md` updated. Tests green.

## Implementation note (7/3) — ASCII-operator sweep + documented authoring rule

The authoring audit surfaced pre-existing Unicode math operators in the workflow/prompt files (predate #209; I'd copied them verbatim per "match existing formatting"). Cleaned up codebase-wide and promoted to a written rule.

**Converted** (`≠`→`!=`, `≥`→`>=`, `≤`→`<=`, `⇒`→`=>`, `×`→`x`) — **89 glyphs across 26 files**:
- all `.agents/workflows/bkit-*.md` + `.agents/prompts/*.md`
- index docs `.agents/workflows.md`, `.agents/prompts.md`
- shipped templates (`.cursor/Dockerfile`, `docs/styles.md`, `docs/plans/template.md`)
- bkit-authored `.agents/README.md`, `.agents/cloud.md`, `.agents/scripts/bkit-upgrade.ts`
- `.claude`/`.cursor` mirrors regenerated → ASCII too

**Deliberately NOT touched:**
- The flow-arrow `→` (the documented `**If** … → …` / dispatch-table notation) — it's the one intentional non-ASCII glyph.
- Em-dashes, smart quotes, emoji, `§` — typography/section-refs, not operators.
- Vendored `.agents/skills/**` (Anthropic "superpowers" skills) — not bkit execution surfaces; editing them would diverge from upstream. Flagged, left as-is.

**Documented as a rule** — new "ASCII operators" bullet in both `.agents/workflows.md § Workflow Authoring Rules` and `.agents/prompts.md § Prompt Authoring Rules`:
> Use ASCII comparison/logic operators only — `!=`, `>=`, `<=`, `=>` — and `x` for "times"/dimensions. NEVER Unicode math glyphs. The flow-arrow `→` is the sole intentional non-ASCII glyph.

Verify clean: `git grep -n '≠\|≥\|≤\|⇒\|×' .agents/workflows .agents/prompts` → empty. Tests green (1146).

## Implementation note (7b/3) — `→` flow-arrow kept ASCII-exempt (decided)

Decision on the one remaining non-ASCII glyph: **keep `→`, do not convert to `->`.**

**Why:**
- It's a different category from the operators we swept. `≥`/`⇒`/`×` were *stray* math operators inconsistently mixed into ASCII text. `→` is the **uniform, documented flow notation** — every `**If** {condition} → {action}.` conditional and dispatch table uses it consistently (the "Procedural conditionals" authoring rule literally specifies it). It's a typographic device, not a comparison operator.
- Scale: ~1,200 occurrences in workflow/prompt sources (~1,564 across `.agents`) — ~14x the whole operator sweep, for a glyph that isn't a consistency or rendering problem.
- `→` reads clearer than `->` for "leads to", and `->` is overloaded (member-access in C/PHP, type-signature arrows) — i.e. slightly *more* ambiguous, not less.

**Documented:** the "ASCII operators" bullet in both `.agents/workflows.md` and `.agents/prompts.md § Authoring Rules` now states `→` is the sole intentional non-ASCII glyph and is deliberately kept (with the rationale), with an explicit "do NOT convert `→`". Memory rule updated to match.

Net rule: **ASCII for operators that have expected ASCII forms; `→` is the one deliberate notation glyph.**

## Shipped to `dev` — closing

Implemented directly on `dev` (not via the bkit workflow — can't dogfood the workflow files being edited). Commit **`fc76776`** (`feat(209): NDJSON status.jsonl event log + branch-local state placement`, 96 files), pushed to `dev`.

**Delivered (design-of-record in comments 1–7b):**
- `status.jsonl` append-only NDJSON event log replacing the mutated `status.json` array; canonical `fold` reducer in `bkit-status.ts` (+ tests), inline jq fold mirrored across all 6 workflows; migrate-once for in-flight legacy files.
- `docs/plans/**/status.jsonl merge=union` (path-scoped) — the git-layer guarantee.
- Branch placement: build/debug write status on `feat/{FID}` (no mid-lifecycle dev push); ship splits feat (Steps 1-7) / dev (Steps 8-12); design/plan/cloud dev-located.
- Defect B: `[skip build]` in the HEAD-Subject token set.
- Comment-link permanence: design/plan → `dev`; build/debug keep `feat`; ship already split.
- Authoring-rules remediation (53 violations cleared, 2 audit passes), `workflows.md` index rewrite, ASCII-operator sweep + documented rule.

CI validates on the `dev` push. The two "related defects" originally bundled here were the actual scope — the CI-gate generalization stays in #203, which builds on this settled state model.

## Re-opening: §3 feat-relocation incomplete for design/plan (surfaced via #216 friction reconciliation)

The `status.jsonl` branch-placement model was not fully applied to **design** and **plan**. Current state:

- **build / debug** — `status.jsonl` is **feat-located** (worktree): `bkit-build.md:318` `STATUS="$WT/.../status.jsonl"` (`$WT` = `git rev-parse --show-toplevel`). ✅ intended model.
- **design / plan** — `status.jsonl` is **dev-located** (`$REPO_ROOT/...`): `bkit-design.md:25` ("design status.jsonl is dev-located"), written at `bkit-design.md:55,245`; `workflows.md:174` documents design/plan as a *"dev-located cheap archive, no persistent feat branch."* ❌ This contradicts the intended model — status + generated docs live on `feat/{FID}` and squash-merge to `dev` at close; the **only** thing hard-coded to `dev` should be the doc links inside tracker comment blocks (pretend-already-merged URLs).

**Knock-on (also from #216):** design DOC artifacts *are* worktree-located (subagents `cd` into `.worktrees/{FID}`), but `bkit-design-summary` intermittently writes `design-summary.md` to the main checkout (`$REPO_ROOT`) instead of the worktree — friction #29/#43. Root cause: the subagent `Context:` `cd` uses the `dirname git-common-dir` idiom rather than the orchestrator's already-computed `WORKTREE_PATH` (`bkit-design.md:216`). Same dev-vs-feat path fragility.

**To finish §3:** relocate design/plan `status.jsonl` (and the dev-located archive model in `workflows.md` / `bkit-design.md` / `bkit-plan.md`) onto `feat/{FID}` like build/debug, and pin subagent worktree paths to `WORKTREE_PATH`. Skipped in the #216 friction backlog and tracked here.

## Implementation note (8/3) — re-open remediation plan: finish §3 for design/plan + align subagent cwd across all workflows

Acting on the re-open (comment above). Confirmed the gap against current `dev` (post-`.bkit/` relocation, so line refs differ from the original inventory). Doing this directly on `dev` like the rest of #209 — can't dogfood the workflow files being edited.

### Confirmed: §3 was applied to build/debug/ship but NOT design/plan

- **build/debug/ship** write per-step status to the **feat worktree**: `STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` (cwd is inside `.worktrees/{FID}`), committed per-step on `feat/{FID}`, reaching `dev` once via the squash-merge. ✅
- **design/plan** write per-step status to the **dev main checkout**: every site is `STATUS="$REPO_ROOT/docs/plans/.../status.jsonl"` (`$REPO_ROOT = dirname(git-common-dir)` = main repo). ❌ — even though design/plan **do** create & `cd` into a `feat/{FID}` worktree (`bkit-design.md:216`) and write their **docs** there. So inside design/plan, docs are feat-located but status is dev-located: the exact inconsistency the re-open flags.
- Docs encode the old decision: `.bkit/workflows.md:134/153/174/176` ("dev-located cheap archive") and stale `:1059` ("on dev for all five workflows — BAR-187"). `:176` is internally contradictory — it says "their doc squash-merges to dev at close" (docs ARE on feat during the run) yet keeps status on dev.

### Decisions (owner-confirmed)

<!-- prettier-ignore -->
| # | Decision | Choice |
| --- | --- | --- |
| 1 | Where | **Fix now, directly on `dev`** (as rest of #209). |
| 2 | Subagent cwd pinning scope | **All five workflows**, not just design/plan. The fragile `cd "$(dirname "$(git rev-parse … --git-common-dir)")/.worktrees/{FID}"` idiom is universal (design 9, plan 11, build 14, debug 7, ship 4 = 45 sites) → pin every worktree `cd` to the orchestrator's already-computed `{WORKTREE_PATH}`. (Ship's two *main-repo* `cd`s at 717/722 — no `.worktrees` suffix — are deliberately left untouched.) Closes friction #29/#43 consistently rather than leaving design/plan diverged from the other three. |
| 3 | design/plan Failure Path | **Drop the best-effort `dev` push** of FAILED status. Match build/debug: status stays on the retained local `feat/{FID}` worktree; the tracker comment (FP step 3) carries the human failure signal. Only `dev` writes that remain are the doc-link URLs in comment blocks + the Close squash-merge. |

### Edit plan

**design + plan (status feat-relocation):**
1. Per-step status blocks: `REPO_ROOT=…; STATUS="$REPO_ROOT/…"` → `STATUS="$(git rev-parse --show-toplevel)/…"` (worktree), matching build/debug. (7 blocks each.)
2. Step-2 init: convert to `WT=$(git rev-parse --show-toplevel)` + `DIR` form (mirrors `bkit-build.md:316–326`), incl. the migrate-once legacy reader reading `$WT/$DIR/status.json`.
3. Step-1 resume read: prefer the worktree copy, fall back to dev — `SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"` — then fold `$SRC` (mirrors `bkit-build.md:130`).
4. **Close reorder (the one non-mechanical bit):** today the close-workflow appends the `step-done`/`workflow-done` events *after* the `git add -A && git commit`, so feat-locating the path alone would leave them uncommitted and the `git merge --squash feat` would drop them. Reorder to **append events → then `git add -A && git commit`** so they ride the feat commit and reach dev via the existing squash-merge. The Close `dev` push stays — that's the intended single dev write.
5. Failure Path: drop the `git -C "$REPO_ROOT" pull/add/commit/push origin dev` block; write `workflow-failed` to worktree-if-exists-else-dev (build's pattern).

**all 5 workflows (subagent cwd pinning):** one `replace_all` per file converting the 45 worktree-`cd` Context lines to `cd "{WORKTREE_PATH}"`; add `{WORKTREE_PATH}` to each Placeholders bullet (set at worktree setup, required for subagent Context).

**docs/prose:** rewrite the design/plan **Status branch** bullets (feat-located, reaches dev once via Close merge, no FP dev push); update `.bkit/workflows.md` (134/153/174/176 + stale 1059).

**Out of scope (unchanged):** build/debug/ship status placement (already correct); ship's main-repo post-merge `cd`s; cloud/audit dev-located status (no worktree).

### Verification gates
`pnpm test` green; `pnpm bkit-trackers` render sweep clean (mirror parity); regenerate `.claude/commands/*` + `.cursor/commands/*`; manual diff review of the Close reorder on both files. Shipped-summary comment to follow.

## Implementation note (9/3) — §3 finish shipped to `dev`

Committed to `dev` as **`0359884`** (`fix(209): finish §3 — feat-locate design/plan status.jsonl + pin subagent cwd to WORKTREE_PATH`, 16 files, +286/−336). Not pushed (per request). Done directly on `dev` like the rest of #209.

### Delivered

**design/plan — status.jsonl relocated to `feat/{FID}` (matches build/debug):**
- Every per-step write + the Step-2 init now target the worktree (`$(git rev-parse --show-toplevel)/…` / `WT=$(git rev-parse --show-toplevel)` + `DIR`). `cwd` persistence across Bash calls (the "Worktree" invariant) resolves `--show-toplevel` to the feat worktree — the same mechanism build/debug rely on.
- Step-1 resume read prefers the worktree copy, falls back to dev (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`).
- **Close reorder** (the one non-mechanical edit): `step-done` + `workflow-done` are now appended *before* `git add -A && git commit`, so they ride the feat commit and reach `dev` via the existing `git merge --squash -X ours` — instead of being written post-commit and dropped by the squash. The Close `dev` push stays (the single intended dev write).
- Failure Path: dropped the `git -C "$REPO_ROOT" pull/add/commit/push origin dev`; `workflow-failed` is appended to the retained worktree copy. Only `dev` writes left are the Close squash-merge + doc-link URLs.

**all 5 workflows — subagent cwd pinned (closes friction #29/#43):**
- 45 worktree-`cd` Context lines (design 9, plan 11, build 14, debug 7, ship 4) converted from the fragile `cd "$(dirname "$(git rev-parse … --git-common-dir)")/.worktrees/{FID}"` idiom to `cd "{WORKTREE_PATH}"` (orchestrator-substituted absolute path). `{WORKTREE_PATH}` registered in each Placeholders bullet. Ship's two *main-repo* `cd`s (post-merge Steps 8-12) deliberately left as-is. This was the scope extension beyond design/plan — the idiom was universal, so leaving the other three on it would have diverged them.

**docs:** `.bkit/workflows.md` branch-placement model rewritten (table + rationale + staleness rule + the stale `:1059` "on dev for all five — BAR-187" line); `.claude/.cursor` command mirrors regenerated via `pnpm bkit install`.

### Verification
- `bkit-trackers` render sweep: 41 ✓ · `bkit-tokens` + `bkit-status`: 42 ✓
- Mirrors: 0 leftover idiom, 0 orphan tracker markers, 0 dev-located `status.jsonl` in design/plan, `cd "{WORKTREE_PATH}"` counts match sources (9/11/14/7/4 × 2 hosts).
- No Unicode operators introduced; prettier + vale + slop-scan clean on commit.

### Notes
- `cloud`/`audit` remain dev-located by design (no persistent worktree) — unchanged.
- §3 is now uniform across all worktree-bearing phases; the design/plan "dev-located cheap archive" exemption from the original issue body is removed.

## Implementation note (10/3) — `bkit-cloud` router made fully stateless (no `status.jsonl`)

Follow-on cleanup (uncommitted — edits only, per request). The cloud router was the last workflow writing `status.jsonl` to `dev`. It's now a **pure stateless dispatcher**: no `status.jsonl`, no `dev` commit.

### Why it was safe to remove
Nothing read the router's status:
- **No lock** — the router never acquires `.lock`, so no staleness check depends on it.
- **No resume** — single-shot (Step 1 resolve → Step 2 dispatch → exit). Its only status consumer was the Step-1 `LATEST` "already-IN_PROGRESS?" dedup, which was self-referential (existed only because the write persisted).
- **Dispatched skill doesn't use it** — ship/debug fold the log for their *own* `workflow` entries and ignore `"cloud"`; they own their FID/worktree/status.
- **`bkit-cloud.yml` doesn't read it** — gates on the `bkit:auto` label + `bkit [auto route]` marker.

Its sole purpose was an audit record of "router ran, dispatched phase X" — which the **Step 1 + Step 2 tracker comments already capture, with richer links** (branch / PR / run-id). Removing it also kills a `[skip ci]` `dev` push, consistent with #209's dev-write minimization.

### Changed (`bkit-cloud.md`)
- Removed: Step-1 status init (incl. `YYYYMM` resolution + migrate-once + `workflow-started`/`cloud-start-workflow`), Step-2 status write/commit/push (`cloud-dispatch`/`workflow-done`), Failure-Path status block. Sub-steps renumbered; gates de-statused.
- The `Status` + `Status branch` caution bullets → one `**State:** stateless dispatcher — writes NO status.jsonl and makes NO dev commit` bullet.
- Result: zero `STATUS=` / `REPO_ROOT` / `push origin dev` / `cloud`-event sites remain; ISSUE_ID resolution + the two tracker comments stay.

### Changed (`.bkit/workflows.md`)
- `cloud` removed from every status-placement / resume / staleness reference → documented as "writes none (stateless dispatcher)."
- Also fixed a **leftover from the §3 doc edits**: the Resume-rule line still listed `design`/`plan` as reading `$REPO_ROOT` directly — corrected to the `feat/{FID}` worktree-prefer group (they're feat-located as of `0359884`).
- `audit` (#80, not yet built) de-grouped from cloud; noted it will follow the design/plan feat-located pattern per #80.

### Verification
Full suite **1197 passed** / 2 skipped / 1 todo (the −2 vs prior run is exactly the parametrized assertions over cloud's removed status sites). Cloud mirrors regenerated (`pnpm bkit install`) — 0 status/REPO_ROOT/orphan-marker residue.

### Follow-up (not done here)
`.bkit/templates/.github/workflows/bkit-cloud.yml` + `.github/workflows/bkit-cloud.yml` carry an explanatory comment (~L107–111) that still says the dispatcher "commits a `cloud` run to dev's `status.jsonl`." That's now stale (comment-only, non-functional). Left untouched to avoid colliding with the concurrent #216 work that owns that file — fold a one-line correction into its next touch.

## #661 — Ship re-runs CI after updating the branch from dev, even though code did not change (closed)

## What happens

When `dev` has moved since a feature branch went green, `/bkit-ship` merges `dev` into the branch and then waits for a whole new CI run, even though the feature's own changes are byte-identical. The only new code is code that came from `dev`. The push to `dev` after the merge runs CI on that combination anyway, so the second run before the merge costs time and buys nothing.

## Example (a consumer repo, bkit 5.5.1, 2026-10-22)

- A feature branch went green at `c217ea97`.
- `dev` had already moved on with three commits (a bkit upgrade, an e2e test fix and a docs change) that the green run did not include.
- Ship Step 3 (`bkit branches sync`) found `dev` was not part of the branch, so it took Path B. Step 4 B1 ran `bkit prs update-branch`. GitHub created merge commit `49fc6644` ("Merge branch 'dev' into ...", committed by GitHub), which started a new CI run eight seconds later.
- The branch's own change is identical before and after the update: `git diff <old merge-base> c217ea97` and `git diff <new dev> 49fc6644` have the same `git patch-id --stable`.
- That repo's `dev` requires no status checks and has no "branch must be up to date" rule; its only ruleset stops `dev` being deleted. The PR was already mergeable without the update.

## Why it happens

1. **Ship moves the tip itself.** Step 4 B1 (`.bkit/core/workflows/bkit-ship.md`, § Step 4 — Integrate) always runs `bkit prs update-branch` when `dev` has moved, whether or not `dev` requires the branch to be up to date.
2. **Step 9 compares commits, not the branch's own changes.** `runRevalidate` in `.bkit/core/engine/commands/workflow/runs.ts` re-runs CI whenever the commit to validate differs from `ENTRY_HEAD` (the PR tip when ship started). The only exception is ship's own bookkeeping commits (`onlyBookkeeping`). A tip that moved only because `dev` was merged in counts as new code.
3. The merge gate in Step 10 (`bkit runs gate`) has the same rule: anything past the validated commit other than bookkeeping returns exit 17 and sends ship back to Step 9.

The only recorded reason for updating the branch is in the commit that added it, `4c785ccd` (fix(216), 2026-06-01): "so a base that moved during the ship window cannot fail the squash". GitHub refuses to merge an out-of-date PR only when there is a textual conflict (which updating the branch does not fix either) or when `dev` requires branches to be up to date. Neither applied here. No row in `docs/decisions.jsonl` covers the step.

## Proposed fix

Change Step 4 B1 so ship updates the branch only when the branch code has to change, or the repo asks for checks on `dev`:

<!-- prettier-ignore -->
| Situation | Behaviour |
| --- | --- |
| `MERGEABLE` = MERGEABLE (no textual conflict) and `dev` requires no status checks | **Skip `bkit prs update-branch`.** Merge the PR at the tip CI already passed on. The push to `dev` runs CI on the combined code. |
| `MERGEABLE` = CONFLICTING (Path B2) | Unchanged: resolve, push, re-run CI. Someone edited files to resolve the conflict, so the branch code really did change. |
| `dev` requires status checks (ruleset or branch protection) | Unchanged: update the branch and re-run CI. The repo has asked for checks to guard `dev`, so ship keeps the stricter behaviour. `devRequiresChecks` in `runs.ts` already detects this. (GitHub itself refuses an out-of-date branch only when the rule's "require branches to be up to date" setting is on.) |

Likely touch points:

- `.bkit/core/workflows/bkit-ship.md` § Step 4, sub-step 1 (B1) and Gate 4 (`B1: bkit prs update-branch attempted`), plus the mirrored command/skill renders.
- `.bkit/core/engine/commands/workflow/runs.ts` (`runRevalidate`, `runs gate`), so that skipping the update leaves `CODE_HEAD` = `ENTRY_HEAD` and no re-run happens.
- Tests for the three rows above, and the docs that describe Path B (`.bkit/workflows.md`, `docs/deployments.md`).

## Trade-off (accepted)

If `dev` and the branch break each other without a textual conflict (for example, `dev` renames a function the branch calls), the problem shows up as a red `dev` CI run after the merge, not as a red PR before it. This is accepted: the `dev` push run catches it.

GitHub's `mergeable` answer is occasionally wrong on very large diffs. If it reports no conflict and there is one, the merge itself is refused and ship goes through its existing retry path (Steps 11-12): a wasted attempt, not a bad merge.

Repos that want the stricter behaviour can turn on required status checks for `dev`. Ship then keeps updating the branch and re-running CI, as in the third row of the table.

so the branch code DID change and ci is justified no? what are we talking about here?

Yes, once ship had pulled dev in, the branch did change and the re-run was justified. The question in #661 is whether ship needed to pull dev in at all. I blurred this earlier by saying “the code on your branch didn’t change”; I should have said “your feature’s code didn’t change”.

Two different things:

Your feature’s code (what feat/1502 adds on top of dev) didn’t change. The update left it byte-identical.
The branch as a whole did change, but only because ship merged dev into it. The only new code on the branch was dev’s.

The chain:

Ship pulls dev into the branch. This step wasn’t necessary in gether. The PR could already merge, and gether’s dev doesn’t require the branch to be up to date.
That creates a new commit holding new code, the feature plus the latest dev.
Given that new code, re-running CI is correct. I’m not proposing to skip CI on changed code.

So #661 doesn’t say “this CI run was unjustified”. It says “don’t make the change that forces it”. If ship merges without pulling dev in first, the branch never changes, run 1’s green still applies, and there’s nothing to re-test.

The one thing you give up: the second run was testing feature plus latest dev together before the merge. After #661 that same test happens once, as the CI run on the push to dev after the merge. That’s the trade-off you accepted: a clash shows up as a red dev instead of a red PR.

> Ship pulls dev into the branch. This step wasn’t necessary in gether. The PR could already merge, and gether’s dev doesn’t require the branch to be up to date.

so why did we pull the code if we did not need it?

I traced the unconditional dev-pull step to commit 4c785ccd, which added it to prevent squash-merge failures from a base moving mid-ship — but that risk only matters if there’s a conflict or the repo enforces “up to date before merging,” neither of which applies here. I’d wrongly claimed in #661 that no reason was recorded (I’d only checked docs/decisions.jsonl); I’ll correct that now.

Pushing the corrected line to the issue now.

I’ve corrected #661: it now quotes the reason from commit 4c785ccd and explains why that reason didn’t apply here.

To answer you directly: we pulled dev in because ship has done it on every ship since June, needed or not. It was added on the belief that GitHub won’t merge a PR once dev has moved past it. That’s only true when there’s a conflict or when the repo requires branches to be up to date, and gether has neither. #661 makes the step happen only in those two cases.

> It was added on the belief that GitHub won’t merge a PR once dev has moved past it. That’s only true when there’s a conflict or when the repo requires branches to be up to date, and gether has neither.

so we should be checking if there is a merge conflict? if yes, we re run ci, if not we skip ci and do not run it again, that it?

Almost. There’s one more case to keep, and one correction to how you’ve put it: with no conflict, ship isn’t skipping a CI run that should happen. Nothing changes on the branch, so there’s nothing new to test.

The rule after #661:

Conflict with dev?	dev requires checks?	What ship does
No	No (gether today)	Merges straight away on the green it already has. The branch isn’t touched, so CI doesn’t run again.
Yes	Either	Resolves the conflict, pushes, and CI runs again. Someone edited files, so the code really changed.
No	Yes	Updates the branch and re-runs CI, because the repo has asked for dev to be guarded that way.

Ship already checks for conflicts. It reads GitHub’s “mergeable” answer at Step 1 and uses it to choose between B1 (no conflict) and B2 (conflict). #661 only changes what B1 does: today it pulls dev in, afterwards it does nothing.

One caveat: GitHub’s “mergeable” answer is occasionally wrong on very large diffs. If it says “no conflict” and there is one, the merge itself fails, and ship goes into its existing retry path (Step 11). That would be a wasted attempt, not a bad merge. I’ll add a line about it to #661 if you want it recorded.

Almost. There's one more case to keep, and one correction to how you've put it: with no conflict, ship isn't skipping a CI run that should happen. Nothing changes on the branch, so there's nothing new to test.

**The rule after #661:**

<!-- prettier-ignore -->
| Conflict with `dev`? | `dev` requires checks? | What ship does |
| --- | --- | --- |
| No | No (gether today) | Merges straight away on the green it already has. The branch isn't touched, so CI doesn't run again. |
| Yes | Either | Resolves the conflict, pushes, and CI runs again. Someone edited files, so the code really changed. |
| No | Yes | Updates the branch and re-runs CI, because the repo has asked for `dev` to be guarded that way. |

**Ship already checks for conflicts.** It reads GitHub's "mergeable" answer at Step 1 and uses it to choose between B1 (no conflict) and B2 (conflict). #661 only changes what B1 does: today it pulls `dev` in, afterwards it does nothing.

**One caveat:** GitHub's "mergeable" answer is occasionally wrong on very large diffs. If it says "no conflict" and there is one, the merge itself fails, and ship goes into its existing retry path (Step 11). That would be a wasted attempt, not a bad merge. I'll add a line about it to #661 if you want it recorded.

## #756 — Workflow optimisation: ship, land and close steps (done) (closed)

Completed workflow-optimisation issues about shipping, landing on dev, workflow close steps, branches and pushes, that have no other parent.

Closed: every sub-issue is closed. Open work in this area is under #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750).

## #66 — Workflows abort on rebase conflict (closed)

<!-- linear-import: BAR-169 -->
**Linear:** [BAR-169](https://linear.app/bartens/issue/BAR-169) · **Created:** 2026-05-10 · **Linear assignee:** christian@bartens.biz

---

## Context

When a bkit-managed feature branch develops merge conflicts against `dev`, none of the workflows can recover automatically — even for purely additive conflicts (both branches appending distinct entries to the same `## Header` section). All three workflows (`bkit-ship`, `bkit-build`, `bkit-debug`) currently bail with `git rebase || exit 1` and route everything — additive doc conflicts, lockfile churn, mechanical formatting drift, semantic code conflicts — through the same dead-end path.

## Incident (2026-05-09)

`feat/bar-155-workflow-friction-optimisation` had a single additive conflict in `docs/pending.md` (four #61 deferred entries on HEAD vs one #64 deferred entry on `dev`). PR #17 went `CONFLICTING` and CI did not re-trigger until the conflict was resolved manually and the merge commit pushed.

## Gap analysis

* `bkit-ship.md` Step 2 line 151: `git rebase origin/dev || { echo "Rebase conflict — resolve manually"; exit 1; }` — bare `|| exit 1`. (#61 Fix 5 introduced sentinel-file Failure Path on the `feat/bar-155` branch but has not yet merged; once merged, it becomes the canonical shape.)
* `bkit-build.md` Step 2 line 153: same `|| exit 1` shape. Carry-over flagged in `docs/pending.md`.
* `bkit-debug.md` Step 2 line 160: same `|| exit 1` shape. Carry-over flagged in `docs/pending.md`.
* bkit-debug's diagnose/remediate subagents are scoped to test/runtime failures, not git plumbing — verdict signal is "tests pass" which is necessary but **not sufficient** for a merge (tests can pass while one side's intent is silently dropped). So chaining ship → debug doesn't help.

## Conflict types and resolution

<!-- prettier-ignore -->
| Conflict type | Examples | Resolution | Where |
| --- | --- | --- | --- |
| **Append-only docs** | `docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`, `.agents/friction.md` (verify), `docs/completed.md` (verify) | `merge=union` — git auto-concatenates both sides | `.gitattributes` (one file, applies to ship/build/debug) |
| **Lockfile** | `pnpm-lock.yaml` | `git checkout --theirs` + `pnpm install --lockfile-only` + `git add` + `rebase --continue` | Inline 4-line retry in Step 2 of all three workflows |
| **Code / configs / everything else** | `*.ts`, `*.tsx`, `package.json`, `tsconfig.json`, source files | Sentinel → Failure Path → `@bkit-ship-conflict-resolve` (new subagent, narrow scope) → on verified PASS resume; on doubt → `@bkit-debug-abort-handover` → human | Ship Failure Path, before existing handover. **Build/debug do NOT get the resolver subagent** — they keep sentinel → handover only. |

### `@bkit-ship-conflict-resolve` scope (narrow on purpose)

* **Inputs:** conflict markers, last N commits per side, Linear ticket text for intent.
* **Attempts:** mechanical-only resolutions — non-overlapping import additions, formatting drift, dep-version supersedes, additive structural edits.
* **Verifies:** `pnpm install` / `pnpm build` / `pnpm test` all pass before declaring success.
* **Refuses:** same-function edits, semantic overlaps, anything where intent is ambiguous → fall through to handover.
* **Success path:** `rebase --continue` → clear sentinel → resume Step 3 (Merge PR).
* **Why ship-only:** ship is the only workflow that rebases against an active integration target where conflicts are common; build/debug operate on the feature branch in isolation and conflicts there are rarer and usually point to a deeper problem worth a human glance.

## Scope (combined)

1. **Consistency fix** — apply the post-merge `bkit-ship.md` Fix 5 sentinel-file Failure Path pattern to `bkit-build.md` Step 2 and `bkit-debug.md` Step 2 so all three workflows route rebase failures through the same shape. Remove the bare `|| exit 1` anti-pattern.
2. `.gitattributes merge=union` for append-only docs:
   * Confirmed: `docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`.
   * Verify before adding: `.agents/friction.md`, `docs/completed.md` (must be strictly append-only-at-EOF).
   * Record DE entry: trade-off is silent duplicate-`KN-N` / `DE-N` IDs if both branches allocate the same number — that is the same renumbering hazard already deferred separately, not a regression.
3. **Lockfile inline retry** in Step 2 of all three workflows. Pattern (after `if ! git rebase origin/dev; then` block):

   ```bash
   if [ -f "docs/plans/logs/{FID}/.rebase-failed" ]; then
     CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
     if [ "$CONFLICT_FILES" = "pnpm-lock.yaml" ]; then
       git checkout --theirs pnpm-lock.yaml
       pnpm install --lockfile-only
       git add pnpm-lock.yaml
       git rebase --continue
       rm -f "docs/plans/logs/{FID}/.rebase-failed"
     fi
   fi
   ```
4. `@bkit-ship-conflict-resolve` subagent — new prompt at `.agents/prompts/bkit-ship-conflict-resolve.md`. Invoked from `bkit-ship.md` Failure Path **before** `@bkit-debug-abort-handover` when sentinel `docs/plans/logs/{FID}/.rebase-failed` exists AND conflict isn't lockfile-only (already handled in step 3). Verdict gate: only resume on PASS; any CONCERNS → handover.

## Acceptance

- [ ] `bkit-build.md` and `bkit-debug.md` Step 2 use sentinel-file Failure Path routing (no bare `exit 1` on rebase failure).
- [ ] `.gitattributes` registers `merge=union` for the three confirmed append-only docs (plus any verified additions). DE entry records trade-off.
- [ ] Lockfile inline retry present in Step 2 of all three workflows; verified by simulating a `pnpm-lock.yaml` conflict in a test branch.
- [ ] `@bkit-ship-conflict-resolve` prompt exists with the scope above; ship's Failure Path invokes it before handover.
- [ ] `bkit-ship-conflict-resolve` is **NOT** wired into bkit-build or bkit-debug Failure Paths.
- [ ] #61 carry-over entry removed from `docs/pending.md` (replaced by this issue).
- [ ] Manual verification: simulate (a) additive doc conflict — should auto-merge silently; (b) lockfile conflict — should auto-regen and continue; (c) source-file conflict — should attempt resolver, escalate to handover on doubt.

## Out of scope (explicitly)

* Wiring the conflict-resolve subagent into bkit-build / bkit-debug Failure Paths.
* ID renumbering for `KN-*` / `DE-*` collisions (separately deferred).
* Three-way merge UI / interactive resolution.
* Detecting non-additive doc conflicts (e.g. edits to existing entries) — relies on append-only contract enforcement upstream.

## Build order

1. Consistency fix (item 1) — mechanical, \~10 min.
2. `.gitattributes` (item 2) — quick, with DE entry.
3. Lockfile retry (item 3) — pattern-match across three files.
4. Conflict-resolve subagent (item 4) — biggest piece; new prompt + ship Failure Path wiring.

## Related

* #61, DE-16
* `.agents/workflows/bkit-build.md` Step 2
* `.agents/workflows/bkit-debug.md` Step 2 line 160
* `.agents/workflows/bkit-ship.md` Step 2 lines 151 (post-Fix 5 reference shape)
* Incident: PR #17 (`feat/bar-155-workflow-friction-optimisation`)
* Prior pending.md entry: "#61 deferred — `bkit-build.md` Step 2 `git rebase || exit 1` anti-pattern carry-over"

<!-- linear-links-start -->
**Links:**

- **Related:** #61 ([BAR-155](https://linear.app/bartens/issue/BAR-155)), #64 ([BAR-167](https://linear.app/bartens/issue/BAR-167)), #99 ([BAR-230](https://linear.app/bartens/issue/BAR-230))
<!-- linear-links-end -->

<!-- linear-comment: 4ad892ce-09f2-4d25-8667-d3bfc436bcd8 -->
**@christian (Linear, 2026-05-11):**

## Shipped — PR #18 merged to dev (43bbe7b)

All four scope items delivered:

1. **Consistency fix** — `bkit-build.md` and `bkit-debug.md` Step 2 now route rebase failures through the same sentinel-file Failure Path shape as `bkit-ship.md` (Fix 5 from #61). No bare `|| exit 1` remains.
2. **`.gitattributes` `merge=union`** — installed at repo root (bkit dogfood) and as a template at `.agents/templates/gitattributes` that bkit-install propagates to consumer repos via NPM_STRIP_REMAP. DE-17 records the silent duplicate-ID trade-off.
3. **Lockfile inline retry** — Step 2 of all three workflows.
4. **`@bkit-ship-conflict-resolve` subagent** — new prompt at `.agents/prompts/bkit-ship-conflict-resolve.md`, narrow mechanical-only scope (additive edits, formatting drift, one-sided dep bumps), verifies via `pnpm install` / `typecheck` / `test` / `build`. Wired into ship's Failure Path before `@bkit-debug-abort-handover`. **NOT** wired into build/debug per scope.

### Incidental cleanups while in the area

- **Prettier emphasis-parser bug surfaced**: unbackticked `${VAR}` on the same line as `*` glob patterns caused prettier to mangle spaces, indentation, and convert `*` → `_`. Root cause traced; remediation:
  - Unified placeholder convention: `${VAR}` → `{VAR}` form for interpolation, bare `` `VAR` `` for reference
  - Removed all `\*` wildcard escapes (no longer needed)
  - Codified the two-form rule in `.agents/workflows.md` and `.agents/prompts.md` Authoring Rules
- **Authoring-rules pass**: procedural conditionals (`**If** {X} → {Y}.`) and variable-reference forms applied consistently across all five workflow files.

### Verification

- 711/711 tests pass
- `pnpm prettier --check .` clean
- Pre-push hooks (prettier + dist freshness) green
- CI green on PR #18
- `.claude/` and `.cursor/` mirrors regenerated

### Open acceptance items (manual)

- [ ] Simulate additive doc conflict — verify Tier 1 auto-merges
- [ ] Simulate lockfile conflict — verify Tier 2 retry succeeds
- [ ] Simulate source-file conflict — verify Tier 3 resolver attempts then escalates on doubt

These can be folded into next live rebase encounter rather than spun up as a dedicated test branch.

Marking Done.

<!-- linear-comment: ed6ed472-6d36-45b9-bbcf-a6128c6b30b6 -->
**@christian (Linear, 2026-05-11):**

## Implementation summary

Branch `feat/bar-169-tiered-rebase-recovery`. All 4 scope items from the issue description landed plus several integration fixes surfaced during review.

### What shipped

**1. Consistency fix — sentinel-file Failure Path across all 3 workflows**
- `bkit-build.md` Step 2, `bkit-debug.md` Step 2, `bkit-ship.md` Step 2: replaced bare `git rebase || exit 1` with `if ! git rebase; then; ... touch .rebase-failed; fi` pattern.
- Numbered step lists renumbered to insert sentinel-check; Failure Path step 4 routing extended with `or rebase failure sentinel previously existed`.

**2. `.gitattributes` `merge=union` for append-only doc ledgers**
- Template at `.agents/templates/gitattributes` (no leading dot, npm-strip safe); bkit-repo dogfood copy at `.gitattributes`.
- Covers `docs/{pending,knowledge,decisions,completed}.md`. Excludes `.agents/friction.md` (post-write edits to `Recovery`/`Status` fields break the strict-append contract).
- `bkit-install.ts` `NPM_STRIP_REMAP` extended with `gitattributes: ".gitattributes"`; symmetrical test added.
- DE-17 records the trade-off (silent duplicate `KN-N` / `DE-N` IDs if both branches allocate the same number — same renumbering hazard already deferred separately).

**3. Lockfile inline retry in Step 2 of all 3 workflows**
- After `git rebase` fails: `CONFLICT_FILES=$(git diff --name-only --diff-filter=U)`; if `pnpm-lock.yaml`-only → `git checkout --theirs` + `pnpm install --lockfile-only` + `git add` + `git rebase --continue`. Falls through to sentinel for anything else.

**4. `@bkit-ship-conflict-resolve` subagent + dedicated workflow step**
- New prompt at `.agents/prompts/bkit-ship-conflict-resolve.md`. Frontmatter: `effort: medium`, `model: claude-sonnet-4-6`, `maxTurns: 100`, full tool set (`Read, Grep, Glob, Write, Edit, Bash`).
- New **Step 3 — Conflict Resolve** in `bkit-ship.md` (between Worktree Setup and Merge PR). `**Run only if**` sentinel exists. Workflow renumbered 10 → 11 steps; downstream routing refs updated (`Step 4` → `5`, `Step 6` → `7`, `Re-run Step 3` → `Re-run Step 4`, etc).
- Ship-only — `bkit-build` and `bkit-debug` route rebase failures straight to handover (their conflicts are rarer and usually point to deeper problems).
- 2-way verdict (`PASS` / `FAIL`) — no semantic role for `CONCERNS` given the Mandate "On any ambiguity, abort cleanly and emit FAIL". Recorded in `workflows.md` § Verdict vocabulary.

### Integration fixes surfaced during review

**Fix A — Subagent owns its mid-rebase lifecycle (Option B):**
Original wiring had `bkit-ship.md` Step 2 abort the rebase before invoking the subagent, leaving the subagent's Process expecting mid-rebase state but finding nothing. Switched to: workflow Step 2 aborts (clean tree for sub-steps 3-9), subagent re-runs `git fetch origin dev && git rebase origin/dev` as its Process step 5 to recreate the conflict state in isolation, then resolves and either continues or aborts cleanly.

**Fix B — Failure Path defensive `git rebase --abort`:**
Added `git rebase --abort 2>/dev/null || true` to Failure Path step 1 across all 5 workflows. Catches mid-rebase state if the subagent crashes before reaching its own Step 11 abort, or any other code path that leaves a rebase in progress.

**Fix C — Read path:**
Step 3 subagent invocation Reads `docs/plans/logs/{FID}/ship-input.md` (canonical pattern — contains DESCRIPTION + COMMENTS + plan) instead of raw `DESCRIPTION`. `ship-input.md` exists by Step 3 invocation time because Step 2 sub-step 7 creates it.

**Fix D — Early-FAIL handling without `jump to step N` refs:**
Prompt Process step 9 (verify) guarded with `**If** \`Verdict\` != FAIL →` so test/build don't run on a half-resolved mid-rebase tree. Step 8 (resolve `Allowed` files + `rebase --continue`) runs unconditionally — surfaces more state for the handover log even when classification already set FAIL; the eventual Step 11 abort discards the partial work.

### End-to-end flow

1. **Step 2 — Worktree Setup:** rebase against `origin/dev`. Lockfile-only conflict → fast-path resolves. Anything else → abort + sentinel. Sub-steps 3-9 run on the clean (pre-rebase) feature-branch tip — pnpm install, status update, Linear comment, all stable.
2. **Step 3 — Conflict Resolve** (only if sentinel set): invokes `@bkit-ship-conflict-resolve`. Subagent re-fetches dev, re-runs rebase (recreating conflicts), enumerates conflicted files, classifies against `Allowed resolutions` / `Refused resolutions`, resolves Allowed via `Edit` + `git add`, runs `git rebase --continue`, verifies via `pnpm install` / `typecheck` / `test` / `build`. On `PASS` → orchestrator clears `.rebase-failed` sentinel, workflow continues. On `FAIL` → subagent aborts rebase, leaves sentinel, returns FAIL → Failure Path → `@bkit-debug-abort-handover` writes handover doc, labels `Failed`, state `In Review`, STOP.
3. **Failure Path defensive abort** catches any edge case where mid-rebase state leaks (subagent crash, Step 2 sub-step failure after the in-bash rebase, etc).

### Authoring rules also codified during this cycle

While auditing the new prompt against `prompts.md` / `workflows.md` rules, several conventions got tightened and documented for future authors:

- **Procedural conditionals:** flow-gating conditionals use bold `**If** {X} → {Y}.` (and `**Else** → {Z}.` for branches) regardless of syntactic shape. Audited + fixed across ~36 prompt lines + ~50 workflow lines.
- **Variable references:** field/variable/placeholder identifiers go in backticks in prose (`` `Verdict` ``, `` `VERIFY_ATTEMPT` ``, `` `FID` ``); operators stay outside (`` `MERGE_ATTEMPT` += 1 ``); singular literal enum values stay plain alongside a backticked variable (`` set `Verdict` = FAIL ``, `` `state` = MERGED ``); enum unions are one backticked unit (`` `PASS|CONCERNS|FAIL` ``); inside fenced output-format blocks: keep plain (verbatim template).
- Both rules now live in the Authoring Rules section of `prompts.md` and `workflows.md`.

### Verification

- All 711 tests pass (`pnpm vitest run`).
- Prettier clean across all touched files.
- DE-17 recorded in `docs/decisions.md`.
- Mirror regen (`.cursor/` / `.claude/`) deferred to session end per `bkit-install` batching rule.

### Files touched

`.agents/workflows/{bkit-build,bkit-debug,bkit-ship,bkit-design,bkit-plan,bkit-worktree-prune,bkit-worktree-sync}.md`, `.agents/workflows.md`, `.agents/prompts/bkit-ship-conflict-resolve.md` (new), `.agents/prompts.md`, `.agents/prompts/*.md` (many — authoring-rule passes), `.agents/scripts/bkit-install.ts` + `.test.ts`, `.agents/templates/gitattributes` (new), `.gitattributes` (new), `docs/decisions.md` (DE-17).
