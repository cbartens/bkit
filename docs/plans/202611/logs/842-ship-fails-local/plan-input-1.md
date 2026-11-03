## Session Prompt — this run's, newer than everything below

[$bkit-plan](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-plan/SKILL.md) #842

## Issue description — oldest

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

## Issue comment — posted 2026-11-03T06:01:09.000Z

Re-checked the "What ship already handles" table against the code and added two gaps to the body.

- **F:** a branch whose PR already merged but which has newer commits is treated as shipped, and the close deletes it locally and on GitHub. The newer commits are lost. Design and plan's close guards against this with `notOnDev`; ship's close does not.
- **G:** a merge GitHub refuses because the head moved, or because of a new conflict with `dev`, goes to Step 11 / Step 12, the CI-failure fix round, instead of back to re-validation or integration.

The table now says where its rows stop holding (Path B red CI with no fix round, merged-on-entry, push timing, the `sync-dev` advice). Success criteria, Outcome, Open questions (with proposed answers) and References are extended to match. Labels, milestone and board fields are unchanged.
