## #74 — Ship workflow cancels feature CI run mid-flight (CLOSED)

<!-- linear-import: BAR-190 -->

**Linear:** [BAR-190](https://linear.app/bartens/issue/BAR-190) · **Created:** 2026-05-12 · **Linear assignee:** christian@bartens.biz

---

## Severity

**Urgent — silent CI-skip.** A feature can land on `origin/dev` without GitHub Actions ever fully running the test suite against the merge commit, and the workflow gives no signal. Spotted by accident on the gether-life 2026-05-12 ship (`bar-98-family-monitors`, PR #50).

## What happened (verbatim incident reconstruction)

The cascade that caused it:

1. `docs/deployments.md` was modified on local `dev` **before** the ship workflow started. The pre-worktree step committed it as a regular commit (`d7cff8e6`) — **without** `[skip build] [skip ci]` tags, because those tags are only required for docs-only commits and the commit-message logic didn't enforce it.
2. The PR squash merge landed on `origin/dev` (`816b4d58`) and triggered CI run **#784**. At this point, local `dev` had diverged from `origin/dev` by 1 commit (the docs commit vs the squash merge — both branched from the same base).
3. Step 7 (Switch to Dev) rebased local `dev` onto `origin/dev` to reconcile the divergence, producing a new commit `60cda14d` (the docs change on top of the squash merge). This rebase commit was then pushed to `origin/dev`.
4. That second push **cancelled CI run #784** — GitHub Actions cancels any in-progress run on a branch when a new push arrives. Run **#785** fired instead, but since `60cda14d` only changed a docs file, the CI's code-delta detection **skipped the run-tests job entirely** (vercel-build ran, tests were skipped).

**Net result:** The feature merge commit (`816b4d58`) never got a complete CI run. The empty trigger commit had to be pushed manually to force a full test run — and only because the user happened to spot the missing run. On a less-attentive ship, the feature merges to `dev` with no full GH Actions validation and no surface signal.

## Root causes (two)

1. **Pre-worktree docs commit lacks** `[skip build] [skip ci]` when the only staged paths are under `docs/`. Should never have interfered with CI in the first place.
2. **Step 7 rebase push lacks** `[skip ci]` when the rebased commit on top of `origin/dev` is docs-only. Even if root cause 1 is fixed, any subsequent docs-only push to `dev` immediately after a squash merge will cancel the in-flight feature CI run.

## Proposed fix (both required)

### Fix A — Step 2.1 (pre-worktree commit, all workflows)

In `bkit-ship.md`, `bkit-build.md`, `bkit-debug.md` Step 2.1 (where the pre-worktree commit happens), inspect staged paths after `git add`. If every staged path is under `docs/` (or matches an explicit docs-only allow-list — `docs/`, `.agents/friction.md`), append `[skip build] [skip ci]` to the commit message. The 1.1.2 fix on `bkit-design`/`bkit-plan` narrowed the `git add` allow-list but did **not** add the skip-tag enforcement.

```bash
git add -- <allow-list>
if git diff --cached --quiet; then
  : # nothing staged
elif git diff --cached --name-only | grep -qvE '^(docs/|\.agents/friction\.md$)'; then
  git commit -m "chore({FID}): pre-worktree uncommitted changes"
else
  git commit -m "chore({FID}): pre-worktree uncommitted changes [skip build] [skip ci]"
fi
```

### Fix B — Step 7 Switch-to-Dev rebase push

After `git pull --ff-only origin dev` (or rebase) in `bkit-ship.md` Step 7, if the local dev tip's diff vs `origin/dev`'s pre-pull tip is docs-only, amend the commit message (or push with `--push-option=ci.skip` where supported) to add `[skip ci]`. If amending is unsafe (e.g. rebase produced multiple commits), prefer the safer route: detect docs-only-ahead **before** push and rewrite via `git commit --amend -m "$(git log -1 --format=%B) [skip ci]"`.

**Cross-reference:** This is the upstream cause of the existing friction entries:

- "Docs-only pre-worktree commit pushed to dev without \[skip ci\], cancelling feature CI run" ([BAR-98](https://linear.app/bartens/issue/BAR-98/ws-6-family-monitors), OPEN)
- "Local dev 1 commit ahead of origin/dev after squash-merge" ([BAR-136](https://linear.app/bartens/issue/BAR-136/ws-11-outbound-summary-email), RECOVERED)
- partly: "Tracked tsbuildinfo.json causes dev divergence on ff-only pull" ([BAR-96](https://linear.app/bartens/issue/BAR-96/ws-4-auto-tagging-engine-and-override-memory)/[BAR-97](https://linear.app/bartens/issue/BAR-97/ws-5-family-lifecycle-and-switcher), RECOVERED — same Step 2.1 broad-add shape)

## Detection guard (defence in depth)

After Step 7 push, before close-workflow, assert that **a CI run exists for the squash-merge SHA** AND **its run-tests job completed successfully** (not skipped, not cancelled):

```bash
SQUASH_SHA=$(gh pr view "{PR_NUMBER}" --json mergeCommit -q .mergeCommit.oid)
RUN_STATUS=$(gh run list --branch dev --commit "$SQUASH_SHA" --json status,conclusion,jobs -L 1)
# fail close-workflow if tests job is skipped/cancelled/missing
```

If absent or skipped/cancelled → **Failure Path** with a clear "feature merge has no test-validated CI run" reason. Forces a manual rerun decision instead of silently shipping.

## DoD

- [ ] Fix A: pre-worktree commits in `bkit-ship.md`, `bkit-build.md`, `bkit-debug.md` Step 2.1 append `[skip build] [skip ci]` iff every staged path is docs-only.
- [ ] Fix B: Step 7 Switch-to-Dev in `bkit-ship.md` rewrites docs-only commit messages on local dev to include `[skip ci]` before push.
- [ ] Detection guard: `bkit-ship.md` close-workflow asserts the PR's squash-merge SHA has a green run-tests CI run before completing; failure → Failure Path with explicit reason string.
- [ ] Regression test or scripted scenario reproducing the cascade above (`docs` edit on dev → ship → cancelled #784 → docs-only #785 with skipped tests) and verifying the fix prevents it.
- [ ] Friction entries (`Docs-only pre-worktree commit pushed to dev without [skip ci]`, `Local dev 1 commit ahead of origin/dev`) marked `FIXED-IN: BAR-{this}` once shipped.

## Out of scope

- Disabling GH Actions's "cancel in-progress on new push" concurrency rule — that's the correct default; the fix is to make sure docs-only follow-up pushes carry `[skip ci]` so they don't trigger a new run at all.

## References

- gether-life PR #50, squash-merge `816b4d58`, cancelled CI run #784, replacement run #785 (run-tests skipped)
- #61 (workflow friction optimisation — parent topic) — friction sweep 2026-05-12 surfaced this as the highest-leverage open cluster.
- `bkit-ship.md:142` (Step 2.1 commit), `bkit-ship.md:419-427` (Step 7 Switch-to-Dev)

<!-- linear-links-start -->

**Links:**

- **Related:** [BAR-136](https://linear.app/bartens/issue/BAR-136) _(not imported)_, #61 ([BAR-155](https://linear.app/bartens/issue/BAR-155)), #99 ([BAR-230](https://linear.app/bartens/issue/BAR-230)), [BAR-96](https://linear.app/bartens/issue/BAR-96) _(not imported)_, [BAR-97](https://linear.app/bartens/issue/BAR-97) _(not imported)_, [BAR-98](https://linear.app/bartens/issue/BAR-98) _(not imported)_

<!-- linear-links-end -->

### Comment — @cbartens (2026-05-21T07:13:18Z)

<!-- linear-comment: 07d01ce0-f103-4544-9f23-2904819bd581 -->

**@christian (Linear, 2026-05-12):**

## Shipped on `dev` — commit `3d2b665`

All three sub-fixes from the DoD landed:

**Fix A — Pre-worktree docs-only `[skip ci]` enforcement**

- `bkit-ship.md` Step 2.1 tightened to allow-list `docs/ .agents/friction.md` (was deny-list — let `apps/web/.cache/tsbuildinfo.json` and other build cache through). Commit message now always `chore({FID}): pre-worktree uncommitted changes [skip build] [skip ci]`.
- `bkit-design.md`, `bkit-plan.md`, `bkit-build.md` Step 2.1 pre-worktree commit message also tagged `[skip build] [skip ci]` for cross-workflow consistency. (These workflows don't push mid-flight, but defensive tagging costs nothing and aligns the pattern.)

**Fix B — Step 7 Switch-to-Dev amend logic**

- `bkit-ship.md` Step 7 sub-step 1: when local `dev` is AHEAD of `origin/dev`, inspect commit messages. If every ahead commit is `[skip ci]`-tagged → `git pull --rebase origin dev` + `git push origin dev` silently (rebase preserves the `[skip ci]` tag so no new CI run fires on the push). If any non-skip-ci commit ahead → Failure Path with explicit reconciliation message.

**Fix C — Detection guard at Close Workflow**

- `bkit-ship.md` Step 11 new sub-step 2 (renumbered subsequent items): asserts the squash-merge SHA's CI run via `gh run list --commit "$SQUASH_SHA"`:
  - Missing run → fail.
  - Run cancelled → fail.
  - Any job matching `test*` skipped → fail.
- New Gate 11 checklist item: "Squash-merge CI run completed `run-tests` (not cancelled, not skipped)".
- Failure routes to standard Failure Path with explicit "feature merge not test-validated" reason — forces a manual rerun decision instead of silently shipping.

**Scope notes**

- Cascade is ship-only — `build`/`debug`/`design`/`plan` cannot trigger it because they never put `dev` into "CI running" state (no squash merge). Detection guard is therefore ship-only.
- Friction entries removed in the same commit (already deduplicated in the #61 sweep):
  - "Docs-only pre-worktree commit pushed to dev without [skip ci]" (BAR-98)
  - "Tracked tsbuildinfo.json causes dev divergence on ff-only pull" (BAR-96/97, both copies)
  - "Local dev 1 commit ahead of origin/dev after squash-merge" (BAR-136)
- Out of DoD: regression test scripting the full cascade (`docs` edit on dev → ship → cancelled #784 → docs-only #785). Deferred — current fix is mechanical and inspectable; can add a scripted scenario later if recurrence appears.

Closing as Done.

## #68 — Stale workflow lock main repo vs worktree cwd mismatch (CLOSED)

<!-- linear-import: BAR-183 -->

**Linear:** [BAR-183](https://linear.app/bartens/issue/BAR-183) · **Created:** 2026-05-11 · **Linear assignee:** christian@bartens.biz

---

## Summary

Recurring friction (6 distinct entries across #59, [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat), [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles), [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files) ×2, [BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding) over 2026-05-09 to 2026-05-11) where a workflow's `.lock` file is acquired in the **main repo working directory** but never released because the workflow's close/cleanup step runs from the **worktree** instead. Next workflow invocation against the same FID finds a stale lock (typically <2h old, under the auto-clean threshold) and blocks per the lock-protocol rule, even though the prior workflow ran to completion.

## Root cause

`docs/plans/logs/{FID}/.lock` is written via a relative path. When `start-workflow` runs from the main repo (e.g. on `dev`), the lock lands at `<MAIN_REPO>/docs/plans/logs/{FID}/.lock`. Subsequent workflow steps `cd` into `.worktrees/{FID}`; the `close-workflow` `rm -f docs/plans/logs/{FID}/.lock` then resolves against the worktree's path, which either has a separate lock or no lock at all. Net effect: main-repo lock never gets removed; the next debug/ship/plan run blocks on it.

Additionally, when `start-workflow` commits status.json to `dev` from the main repo (before worktree creation), the status.json entry lives on `dev` with `IN_PROGRESS` even after the worktree's status.json is `DONE` — orphaning state across two branches.

## Suggested fix options (cross-entry consensus)

1. **Absolute-path lock release.** `close-workflow` should resolve the lock at the repo root, e.g. `rm -f "$(git rev-parse --path-format=absolute --git-common-dir)/../docs/plans/logs/{FID}/.lock"` or capture `REPO_ROOT` at `start-workflow` and persist it in status.json for the close step to use.
2. **Acquire-and-release in same context.** Move `start-workflow` (and therefore lock acquisition) entirely into the worktree, after `cd`. This unifies cwd across the whole workflow and keeps status.json on the feature branch only.
3. **Per-workflow lock keys.** `{FID}-{workflow}.lock` so concurrent debug + build don't deadlock each other when one stalls (covers the [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files) build-lock-blocks-debug case).
4. **Mandatory lock-removal assertion on Failure Path.** Several entries note Failure Path doesn't `rm -f` the lock ([BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding), [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat)). Add an explicit assertion that lock cleanup succeeded before exiting any workflow.

## Affected friction entries (all RECOVERED, all same root cause)

### Entry 1 — #59: Build failure-path leaves stale lock in main repo (2026-05-09)

- **Workflow:** build → debug
- **Step:** orchestrator (lock cleanup in Failure Path)
- **Source:** orchestrator
- **What happened:** Build Step 1 acquires lock in main repo working directory (`docs/plans/logs/{FID}/.lock`). Build Failure Path runs from worktree context; `rm -f "docs/plans/logs/{FID}/.lock"` resolves to the worktree's lock, not the main repo's. Main repo lock is never removed. Debug workflow blocked with "lock <2h old" on next invocation. Additionally, if debug Step 1 commits status.json to dev and Step 2 rebases worktree on dev, a status.json conflict arises (dev has partial build steps + debug entry; feature branch has full build steps). To avoid both issues, all debug steps should run from inside the worktree, not the main repo.
- **Suggested fix:** Failure Path should delete the lock at an absolute path (`$(git rev-parse --show-toplevel)/docs/plans/logs/{FID}/.lock`) so it works regardless of cwd. Alternatively, Step 1 should always run from the worktree, not the main repo, so lock and status.json paths are consistent.
- **Related:** #59-option-1, build lock `2026-05-09T00:25:04Z`
- **Recovery:** Manually removed stale lock; debug workflow runs entirely from worktree to avoid rebase conflict.

### Entry 2 — visitfrasercoast [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat): Stale lock from debug workflow not cleaned up (2026-05-10)

- **Workflow:** ship, Step 1 — Start Workflow
- **Source:** orchestrator
- **What happened:** On ship start, found `.lock` from a previous debug workflow (age \~22min, < 2h threshold). The debug workflow HAD completed fully (confirmed via worktree status.json showing `close-workflow: DONE` and Linear comment showing all 11 steps). The lock was not removed by the debug workflow's close step. Also: main branch (dev) had a stale status.json (2 IN_PROGRESS entries for build+debug) while the worktree had the correct complete status.json (1 DONE entry with all steps). Normally this would trigger Failure Path per lock rules. Treated as stale since completion was confirmed; removed lock and continued.
- **Suggested fix:** bkit-debug Step 11 (Close Workflow) must assert `.lock` removal succeeded. Debug workflow should not leave orphaned lock files when the worktree's close-workflow step ran on a different branch than where the lock was acquired.
- **Related:** [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat)-chat-agent, [BAR-152](https://linear.app/bartens/issue/BAR-152/ws-5-chat-agent-runtime-prompts-models-retrieval-apichat)
- **Recovery:** Removed stale lock, proceeded with ship Step 1.

### Entry 3 — [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles): Debug lock left in main repo; close-workflow releases only worktree lock (2026-05-11)

- **Workflow:** debug, Step 1 / Step 11
- **Source:** orchestrator
- **What happened:** `start-workflow` acquires `.lock` in the MAIN repo cwd (dev branch), then the workflow switches to the worktree. `close-workflow` does `rm -f "docs/plans/logs/{FID}/.lock"` from inside the WORKTREE — which removes the worktree's lock (if it exists) but NOT the main repo's lock. The main repo's lock persisted after a complete successful debug run, causing the next /bkit-debug invocation to find a `<2h` lock and fail the guard. Also: debug workflow steps 2–11 append to the last IN_PROGRESS workflow entry in the worktree's status.json (which was `build`, not `debug`), while the dev branch retains an orphaned IN_PROGRESS `debug` entry with only `start-workflow` DONE.
- **Suggested fix:** (a) `close-workflow` should `cd` back to main repo root before `rm -f .lock`, or acquire the lock in the worktree. (b) Alternatively, write the lock to an absolute path (repo root + relative lock path) so worktree and main repo share the same inode. (c) For status.json: start-workflow should run from inside the worktree (after cd) so all status updates land in the same file.
- **Related:** [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles)-member-crud-invites, [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles), commit 76d2c26d (orphaned start-workflow), `.agents/prompts/bkit-debug.md`
- **Recovery:** Detected stale lock (37 min, < 2h) from prior completed session; removed manually and re-acquired; created new debug entry in dev status.json with corrected debugAttempt=1.

### Entry 4 — [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files): Debug workflow stale build lock (1h53m) blocked debug start (2026-05-11)

- **Workflow:** debug, Step 1 — Start Workflow
- **Source:** orchestrator
- **What happened:** Lock `docs/plans/logs/bar-166-prompt-tool-files/.lock` was held by the `build` workflow (written 2026-05-10T22:38:48Z). Build status was IN_PROGRESS with only `start-workflow` done (workflow clearly abandoned). Lock was 6819s old (< 7200s threshold). Protocol says Failure Path, but this was clearly not a concurrent run — the build stalled \~2h ago with no activity. Debug workflow was explicitly requested to fix GH Actions failures.
- **Suggested fix:** Differentiate lock per workflow type (e.g. `{FID}-{workflow}.lock`) so debug can proceed independently from a stalled build. Or extend stale threshold for cross-workflow lock detection.
- **Recovery:** Treated as stale — removed build lock, marked build workflow FAILED in status.json, re-acquired lock for debug.

### Entry 5 — [BAR-166](https://linear.app/bartens/issue/BAR-166/separate-prompt-tool-files): Ship workflow stale debug lock in main repo (2026-05-11)

- **Workflow:** ship, Step 1 — Start Workflow
- **What happened:** Lock `docs/plans/logs/bar-166-prompt-tool-files/.lock` was held by the `debug` workflow (written 2026-05-11T02:13:50Z, age 2773s). Debug workflow was DONE (close-workflow ran in worktree and released lock there, but main repo lock was never removed because Step 11's `rm -f` ran inside the worktree, not the main repo root).
- **Suggested fix:** In debug/ship close-workflow, release both the worktree's lock AND the main repo's lock (`git rev-parse --show-toplevel/../..` relative release).
- **Recovery:** Verified debug status showed `IN_PROGRESS` only on dev branch (fix branch has DONE); treated lock as stale; removed and re-acquired for ship.

### Entry 6 — [BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding): Stale lock from failed build workflow blocking plan re-run (2026-05-11)

- **Workflow:** plan, Step 1 — Start Workflow
- **Source:** orchestrator
- **What happened:** On plan start for [BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding)-aio-mdx-pages, found `.lock` from previous build workflow (age \~61min, < 2h threshold). Build workflow status in worktree showed `"status": "FAILED"` (build-challenge-remediate attempt 1 failed). Lock was orphaned — build Failure Path did not remove it. Dev branch status.json was stale (only showing build start-workflow IN_PROGRESS, not the full failed history). User re-ran `/bkit-plan` to re-generate the plan after build failure.
- **Suggested fix:** Build Failure Path should assert lock removal succeeds. Lock cleanup should also check worktree branch if lock was acquired on dev.
- **Related:** [BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding)-aio-mdx-pages, [BAR-150](https://linear.app/bartens/issue/BAR-150/ws-7-aio-mdx-pages-and-content-scaffolding)
- **Recovery:** Confirmed build FAILED via worktree status.json; removed stale lock; proceeded with plan Step 1.

## Acceptance criteria

- [ ] Pick one structural fix (absolute path / acquire-in-worktree / per-workflow keys) and apply consistently across `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`, `bkit-plan.md` workflows.
- [ ] Every Failure Path branch in all 4 workflows includes an explicit lock-removal assertion (must exit non-zero if `.lock` still present at exit).
- [ ] Add a Step 1 sub-step that distinguishes "lock from same workflow type" vs "lock from different workflow type" — only same-type with recent activity blocks; cross-type stale (>30min idle in status.json) auto-cleans.
- [ ] Regression: simulate the [BAR-95](https://linear.app/bartens/issue/BAR-95/ws-3-member-crud-invites-children-and-roles) scenario (debug close from worktree while lock is on main repo) and verify main repo lock is removed.

## Workflows affected

`bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`, `bkit-plan.md` — all Step 1 (Start Workflow), Step 11 (Close Workflow), Failure Path.

<!-- linear-links-start -->

**Links:**

- **Related:** #59 ([BAR-148](https://linear.app/bartens/issue/BAR-148)), [BAR-150](https://linear.app/bartens/issue/BAR-150) _(not imported)_, [BAR-152](https://linear.app/bartens/issue/BAR-152) _(not imported)_, [BAR-166](https://linear.app/bartens/issue/BAR-166) _(not imported)_, #69 ([BAR-184](https://linear.app/bartens/issue/BAR-184)), #71 ([BAR-187](https://linear.app/bartens/issue/BAR-187)), [BAR-95](https://linear.app/bartens/issue/BAR-95) _(not imported)_

<!-- linear-links-end -->

### Comment — @cbartens (2026-05-21T07:12:37Z)

<!-- linear-comment: 0ad0da36-7a5c-4035-a4c4-834d6639e1ce -->

**@christian (Linear, 2026-05-11):**

Shipped on `dev`:

- `9f3dbc8` fix(bar-183): absolute-path lock + status.json on dev for plan/design
- `8279ce9` chore: regenerate .claude/ and .cursor/ mirrors after bar-183

Implementation matches the decisions in [the earlier comment](https://linear.app/bartens/issue/BAR-183#comment-c556f927):

- Lock at `$REPO_ROOT/docs/plans/logs/{FID}/.lock` (absolute path, anchored via `git rev-parse --path-format=absolute --git-common-dir`) — same inode regardless of cwd.
- Staleness via `status.json` cross-check (workflow type from lock body → DONE/FAILED clean; IN_PROGRESS <30min idle block; ≥30min idle stale).
- Lock removal asserted absent at every Close Workflow + Failure Path exit (`Lock removal failed` → non-zero).
- `status.json` lives on `dev` for plan/design (`git -C "$REPO_ROOT" pull --ff-only` + commit + push every mutation; pull/push failure → Failure Path).
- Build/debug/ship `status.json` unchanged (stays on `feat/{FID}`).
- Schema enums lowercase → UPPER_CASE in `workflows.md` to match what workflows actually write.

Closes all six friction entries (#59, BAR-152, BAR-95, BAR-166 ×2, BAR-150).

### Comment — @cbartens (2026-05-21T07:12:38Z)

<!-- linear-comment: c556f927-e00a-4824-85e9-877a22f6dd66 -->

**@christian (Linear, 2026-05-11):**

## Pre-design: options analysed + final decisions

Skipping formal `/bkit-design` and `/bkit-plan` — direct implementation. Decisions below close all six friction entries.

#69 (just merged) deferred `status.json` init into the worktree to fix dev-divergence. This ticket narrows to (a) the `.lock` cwd mismatch and (b) where `status.json` lives during the run.

---

### Q1 — Lock location

| Option                              | Trade-off                                                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Absolute path in main repo**   | Capture `REPO_ROOT=$(git rev-parse --show-toplevel)` at Step 1, use `$REPO_ROOT/docs/plans/logs/{FID}/.lock` for both acquire and release. Smallest diff, no step reordering. |
| B. Acquire inside worktree (Step 2) | Mirrors #69's status.json move. Unifies cwd, but opens a Step-1 race window before the worktree exists.                                                                       |
| C. A + explicit cwd contract        | Option A plus a rule in `workflows.md` codifying Step 1 = `$REPO_ROOT`, Step 2+ = `$WORKTREE`. Documentation polish, not load-bearing.                                        |

**Decision: A** — for build/debug/ship. Plan/design lock co-locates with their `status.json` on dev (see § Q5).

### Q2 — Lock key granularity

| Option                                     | Trade-off                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **A. Keep per-FID (`{FID}/.lock`)**        | Current. One workflow per feature at a time.                                                                              |
| B. Per-workflow (`{FID}/.lock-{workflow}`) | Build + debug concurrent against same FID. Adds risk of interleaved `status.json` mutation; build→debug is serial anyway. |

**Decision: A (keep per-FID).** The one genuine cross-workflow case (BAR-166 Entry 4) is solved by Q3 staleness detection, not granularity.

### Q3 — Staleness detection

| Option                                        | Trade-off                                                                                                                                                                                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Flat 2h threshold                          | Current. Misclassifies completed-but-orphaned locks.                                                                                                                                                                                                                             |
| **B. Cross-check `status.json`**              | Lock body carries `{workflow}`. Step 1 reads it, checks that workflow's last `status.json` entry: `done`/`failed` → clean silently; `in_progress` + last step <30min → Failure Path (genuine concurrent run); `in_progress` + last step ≥30min → clean and mark workflow failed. |
| C. Tiered threshold (same-type vs cross-type) | Cheaper than B, coarser. Same-type 2h still misclassifies completed-recent orphans.                                                                                                                                                                                              |

**Decision: B.** Eliminates both misclassification modes. The `{workflow}` field is already written, just never read.

### Q4 — `status.json` orphan-on-dev cleanup scope

| Option                         | Trade-off                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **A. Descope — #69 closed it** | Historical orphan entries on `dev` are inert once locks are fixed.                                                     |
| B. Add cleanup pass            | Step 1 scanner marks stale `dev` `IN_PROGRESS` entries as failed. Cosmetic gain; new code path with own failure modes. |
| C. Verify only                 | Regression test asserting Step 1 makes zero `dev` commits across all 4 workflows. Cheap, but belongs to #69 followup.  |

**Decision: A (descope).**

---

### Q5 — `status.json` branch placement (new — supersedes parts of Q1)

The asymmetry between dev-bound (plan/design) and PR-bound (build/debug/ship) workflows means one rule doesn't fit all:

| Option                                                             | Trade-off                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Live on dev during the run (push every step) — all 5 workflows  | Cleanest uniformity. Collapses cwd issue entirely. But build/debug push status to dev outside their PR — breaks the "every dev change reviewed" boundary.                                         |
| **B. Live on dev for plan/design only; feat for build/debug/ship** | Matches each workflow's existing dev/PR boundary. Plan/design already `git merge feat→dev` at close-workflow — status.json on dev mid-run is consistent. Build/debug/ship keep current behaviour. |
| C. Stable Linear URLs only (status.json stays on feat for all)     | Smallest surface. Doesn't actually solve cwd-mismatch class of bugs — just papers over the URL symptom.                                                                                           |
| D. Symlink/cd-juggling per operation                               | Workable but adds cwd-switch boilerplate to every status mutation.                                                                                                                                |

**Decision: B.** Plan/design = dev-bound (merge directly to dev, no PR). Build/debug/ship = PR-bound (dev only changes via squash-merge). Different rules because the workflows have different dev relationships.

### Q6 — Linear comment URL for `status.json`

| Option                                                                      | Trade-off                                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A. Always `{BRANCH}` (current = feat branch)                                | Status.json on feat resolves; on dev only post-merge. For plan/design under Q5-B, dev would always have status — feat link redundant. |
| **B. Per-workflow: `dev` for plan/design, `{BRANCH}` for build/debug/ship** | Matches Q5-B. Plan/design Linear URLs are stable from Step 2 onwards; build/debug/ship URLs unchanged.                                |
| C. Always `dev`                                                             | Build/debug status.json doesn't reach dev until ship squash-merge — links would 404 mid-run.                                          |

**Decision: B.**

### Q7 — Push-failure / rebase-conflict policy (plan/design)

Q5-B means plan/design push `status.json` to `origin/dev` on every status mutation. Failure modes:

| Option                                                                                                         | Trade-off                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A. Retry N times on non-FF, then Failure Path                                                                  | Matches network/transient retry pattern in other workflows. Slightly more code.                                            |
| **B. `git pull --ff-only origin dev` before each push; failure → Failure Path with `status.json push failed`** | Same idiom as ship Step 7. Cheap, consistent. Concurrent same-FID runs are prevented by lock, so FF-only is normally safe. |
| C. Best-effort (swallow push errors)                                                                           | Status.json on dev silently drifts from local. Unacceptable.                                                               |

**Decision: B.** Note: this _extends_ #69, doesn't reverse it. #69 banned `dev` commits _pre-worktree_; Q5-B adds `dev` commits _post-worktree_ that always push immediately, so the local-accumulation failure mode #69 fixed stays fixed.

---

### Final direction — implementation surface

| Workflow                                | `status.json` branch                                   | `.lock` location                                                                                  | Linear `status.json` link      |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| `bkit-plan`, `bkit-design`              | `dev` (commit + push every step from `$REPO_ROOT` cwd) | `dev` working tree (= `$REPO_ROOT`)                                                               | `dev` (stable)                 |
| `bkit-build`, `bkit-debug`, `bkit-ship` | `feat/{FID}` (current, unchanged)                      | `$REPO_ROOT/docs/plans/logs/{FID}/.lock` (absolute path)                                          | `{BRANCH}` (= feat, unchanged) |
| **All five**                            | —                                                      | Staleness check reads `status.json.[-1].steps[-1].at` for the lock's `{workflow}` before blocking | —                              |
| **All five**                            | —                                                      | Failure Path asserts lock removal succeeded before exit                                           | —                              |

### Files to touch

- `.agents/workflows.md` § Concurrency lock — replace bash snippet with absolute-path variant; replace flat-threshold with status.json cross-check; document Q5 branch placement per workflow.
- `.agents/workflows/bkit-plan.md`, `bkit-design.md` — Step 2 onwards: status.json operations run via `git -C $REPO_ROOT`; every status commit followed by `git pull --ff-only origin dev && git push origin dev`; Linear comment URLs use `dev`.
- `.agents/workflows/bkit-build.md`, `bkit-debug.md`, `bkit-ship.md` — Step 1 lock acquisition uses absolute path; Close-workflow + Failure Path release uses absolute path; Failure Path asserts removal.
- All 5 workflows — Step 1 staleness check reads `status.json` to disambiguate stale-but-completed from genuine concurrent run.

Ready to implement.

## #209 — Workflow state model design/plan squash to dev persistent feat branch build→ship (CLOSED)

## Problem

Today the workflow state model has two friction points that hurt cloud-agent dispatch:

1. **`status.json` is pushed to `dev`** (one `[skip ci]` snapshot per run, every phase). Nobody reads it on `dev` — it's a _rendezvous file_, written there only because the cloud runner checks out `ref: dev` (`.github/workflows/bkit-cloud.yml:114`) and that's the one ref a stateless runner is guaranteed to reach. It's the path of least resistance, not a requirement.
2. **Per-phase branch lifecycle is inconsistent.** design and plan each create a throwaway `feat/{FID}` worktree, squash-merge their doc to `dev`, then **delete** the branch; build creates `feat/{FID}` and _keeps_ it (the PR spine). So state lives in different places depending on phase.

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
- design/plan `status.json` _does_ still land on `dev` (no persistent branch for those phases) — but that's now just a cheap one-commit archive, not a live state bus.

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

> Note: this does **not** by itself make CI run on an _already_-conflicted PR; it removes the **cause** so PRs stop becoming unmergeable in the first place.

### Defect B — `[skip ci]` status commit as the PR-branch tip suppresses ALL CI

**Root cause.** When the **tip of `feat/{FID}` carries a CI-suppressing token**, GitHub skips the workflow natively and gether's gate sets `run_level=none` → **zero CI runs**. Observed in gether: `feat/313-url-monitor-v2` tip was `chore(313-url-monitor-v2): build DONE bkit [skip ci]` — a status.json-only commit. The `[skip ci]` is correct _for its intended home, `dev`_; the defect is a **dev-destined status commit becoming the tip of the PR branch**.

Three defects compounding:

1. bkit's `feat/{FID}` branch accumulates many `[skip ci]` / `[skip build]` status + docs commits.
2. The terminal `build DONE` status commit leaked onto `feat` as well as `dev` (same message, two SHAs) — it should be `dev`-only per `bkit-build.md:1186` (`push origin dev`).
3. A **status.json conflict** (Defect A above) forced a manual `git rebase origin/dev -X theirs` + force-push, which **replayed the skip-ci status commit back to the tip**, bypassing the build workflow's HEAD-Subject Assertion guard.

**Fix — harden the "PR tip != suppressing token" invariant at every mutation point:**

- **Don't leak the terminal `build DONE [skip ci]` onto `feat`.** Assert branch identity (`git branch --show-current` == `dev`) immediately before that commit/push in `bkit-build.md` Close.
- **Re-run the HEAD-Subject Assertion after EVERY feat mutation** — at PR creation, and **after any conflict-resolution rebase/force-push** (both the `bkit-ship-conflict-resolve` agent path _and_ documented manual recovery). If the feat tip carries `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]`/`[skip build]`, append an empty `[force build]` trigger commit before declaring the push complete.
- This compounds with Defect A: removing the status.json conflict removes the rebase that re-exposed this. Fix together.

Change surface: `bkit-build.md` (Close branch-identity assert + PR-creation guard), `bkit-ship.md` + `bkit-ship-conflict-resolve` (post-rebase guard) + mirrors.

## Change surface (combined)

- `bkit-design.md` / `bkit-plan.md` — close-workflow merge → `git merge --squash -X ours`; add the doc/log-namespace guard. Keep dev push + branch delete (throwaway branch).
- All workflows — build/debug/ship drop the per-run `status.json` push to `dev` ("Status branch" rule); state stays on `feat/{FID}` until ship's final merge.
- `bkit-ship.md` / `bkit-debug.md` — check out `feat/{FID}` _before_ reading `status.json`; read `PRIOR_STRATEGY` / `DEBUG_ATTEMPT` from the branch.
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

Single-window branch means an **approved design/plan that never reaches build** still lands its doc on `dev` (because design/plan merge to `dev` regardless) — so this model _keeps_ the "approved designs are on dev" property. Confirmed acceptable.

## Related

- #119 (cloud phase-routed dispatch) — the `ref: dev` checkout and CI-class vs brief-class routing this builds on.
- #203 (CI verdicts / green != validated) — the two defects absorbed here were originally described under "Related defects" in that issue. #209 should land before #203.

### Comment — @cbartens (2026-06-01T02:28:56Z)

## Implementation design (1/3) — decisions + status.jsonl event model

Recording the implementation design before/while building on `dev` (this is being done directly in `dev`, not via the bkit workflow — we cannot dogfood the workflow files we are editing).

### Decisions locked

| Decision                    | Choice                                                                                                           | Rationale                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope this pass             | **Full**: state model (§1–3) + Defect B (skip-ci tip guard) + Defect A NDJSON hardening                          | Owner opted in to everything incl. NDJSON.                                                                                                               |
| NDJSON read/write mechanism | **Inline jq fold** — workflows stay pure bash+jq, no node/dist runtime dependency at status sites                | Avoids coupling status ops to the compiled `dist/` (and to #160's bin relocation). Cost accepted: the fold filter is repeated at the ~10 read sites.     |
| `bkit-status.ts`            | Stays as the **canonical reference reducer + `validateInvariants`**, now with a `fold` reducer + vitest coverage | The jq fold mirrors the TS reducer; TS is the unit-tested source of truth for fold semantics even though workflows execute jq.                           |
| Execution                   | **Two movements in this branch** (see comment 3/3)                                                               | Movement 1 (state model + Defect B) is independently valuable AND structurally removes the Defect A conflict; Movement 2 (NDJSON) is additive hardening. |

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

### Comment — @cbartens (2026-06-01T02:29:26Z)

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

**`git merge --squash`** (design/plan close only): design:736 · plan:718 → become `git merge --squash -X ours` (§1)

**`git push origin dev`** of status: design:739 · plan:721 · cloud:210; plus Failure-Path dev push design:64 / plan:64 / build:66 / debug:66 / ship:66 → build/debug/ship dev pushes of status are **dropped** (§3); design/plan retain (no persistent branch).

**`.github/workflows/bkit-cloud.yml`:** `ref: dev` at line 114 (+ BAR-187 note ~line 78) — stays for brief-class design/plan/build; ship/debug (CI-class) read branch-local state from `feat/{FID}`.

### Notes carried into edits

- The close step-done + `workflow-done` are **fused** in one jq today (design:727–729 etc.); in NDJSON they become two appended lines (`step-done` then `workflow-done`).
- debug fuses step-done + `workflow-meta` (debugAttempt) at 305–307 and 639–641 → two appended lines.
- build's strategy read at 551–555 additionally filters `.subPlan==$sp` — fold output preserves `subPlan` on steps, so the query is unchanged post-fold.
- Status-doc prose blocks to update: the `> - **Status:**` and `> - **Status branch:**` bullets (design:23–25, plan:23–25, and equivalents) describing the model.

Next: comment 3/3 = two-movement execution plan + per-file edit specs + verification gates.

### Comment — @cbartens (2026-06-01T02:30:02Z)

## Implementation design (3/3) — two-movement execution plan

All in one `dev` branch, but sequenced as two independently-verifiable movements. Mirrors (`.claude/commands/*`, `.cursor/commands/*`) regenerated once at the **end of each movement**, not per edit (per repo norm).

---

### Movement 1 — state model (§1–3) + Defect B _(high-value, ~30 edits, lower risk)_

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
- ship/debug **read state from `feat/{FID}`**: ensure the `feat/{FID}` checkout happens _before_ the Step-1 status read (resume/lock) and before `PRIOR_STRATEGY` / `DEBUG_ATTEMPT` reads. Today these read from the dev checkout.
- Update the `> - **Status branch:**` prose bullet in build/debug/ship to state: per-step commit on `feat/{FID}`; state reaches `dev` once, at ship's final squash-merge.
- `.github/workflows/bkit-cloud.yml`: ship/debug (CI-class) operate on the `feat/{FID}` checkout (it knows `head_branch`); `ref: dev` (line 114) stays for brief-class design/plan/build. `bkit-cloud.md:208–210` CI-class dev status push reconsidered accordingly.

**Defect B — PR-tip must never carry a CI-suppressing token**

- `bkit-build.md` Close: before the terminal `build DONE … [skip ci]` commit/push, assert `git branch --show-current` == `dev` (don't leak the dev-only status commit onto `feat`).
- Re-run the **HEAD-Subject Assertion** after _every_ `feat` mutation — at PR creation (`bkit-build.md`) and after any conflict-resolution rebase/force-push (`bkit-ship.md` + `bkit-ship-conflict-resolve`). If the `feat` tip subject matches `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]`/`[skip build]`, append an empty `[force build]` trigger commit before declaring the push complete.
  ```bash
  TIP=$(git log -1 --format=%s feat/{FID})
  case "$TIP" in
    *"[skip ci]"*|*"[ci skip]"*|*"[no ci]"*|*"[skip actions]"*|*"[actions skip]"*|*"[skip build]"*)
      git commit --allow-empty -m "chore({FID}): [force build] re-trigger CI after status-commit tip" ;;
  esac
  ```

**Movement 1 gate:** `pnpm bkit-trackers` render sweep clean (8×3); `pnpm test` green; regenerate mirrors; manual diff review of the 6 workflow files confirms no stray non-doc paths in §1 guard.

---

### Movement 2 — NDJSON (Defect A hardening) _(~145 sites, mechanical, higher churn)_

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

### Comment — @cbartens (2026-06-01T02:45:49Z)

## Implementation note (4/3) — §3 read-location + migration, decided during build

Two details the plan left open, resolved while converting `bkit-build.md` (the reference file):

### Where build/debug/ship status physically lives (the §3 crux)

Today `STATUS="$REPO_ROOT/docs/.../status.json"` resolves to the **dev main worktree** (`$REPO_ROOT = dirname(git-common-dir)` = main repo, not the feat worktree). Per-step writes land on dev's working copy; the once-per-run dev push is how they reach history → the dev↔feat divergence behind Defect A.

**Resolution (build/debug/ship):** status writes target the **feat worktree** copy (`$(git rev-parse --show-toplevel)/docs/.../status.jsonl`, cwd = worktree after Step 2), committed on `feat/{FID}` via the existing `git add -A` step commits. The mid-lifecycle dev push is **dropped** (Failure Path + close). State reaches dev once, at ship's squash-merge.

**Step-1 lock/resume read** runs _before_ the worktree is cd'd, and must see in-flight state. Resolution: read from the worktree copy when it exists, else the dev copy:

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

### Comment — @cbartens (2026-06-01T05:31:19Z)

## Implementation note (5/3) — comment-block link permanence (branch-pruning)

Surfaced while reviewing #209: the tracker `comment` blocks deep-link WIP artifacts by branch (`tree/{BRANCH}`, `blob/{BRANCH}/…`, where `{BRANCH}` = `feat/{FID}`). Those links **404 once `feat/{FID}` is pruned**, and the comments persist on the issue forever. §3 sharpened this for the `status.jsonl` link specifically — that file now lives on `feat` (not `dev`) for build/debug.

### Rule adopted

> **Link to `feat` while feat is alive and holds the artifact; link to `dev` once the artifact is permanently on `dev` (post-merge / post-close).**

Per workflow:

| Workflow          | Link base                    | Why                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `design` / `plan` | **`dev`**                    | They prune `feat` at close, so feat links break the moment the run ends. Their canonical doc + log artifacts land on `dev` via the `-X ours` squash-merge → `dev` links are permanent. (Trade: a `dev` link 404s _during_ the short run, before the close merge — acceptable for a comment that lives forever.)                                  |
| `build` / `debug` | **`feat`** (unchanged)       | Neither deletes `feat`; it lives across the whole build→debug→ship window — exactly when these WIP deep-links are clicked (live monitoring). They break only after ship prunes feat, by which point the PR + merged `dev` code are the durable references. Also §3-correct: build/debug `status.jsonl` genuinely lives on `feat` during the run. |
| `ship`            | **already split — leave it** | ship deletes `feat` mid-run (Step 5, `gh pr merge --delete-branch`). It correctly uses `feat` for pre-merge Steps 1-7 and `dev` for post-merge Steps 8-12. Blanket-hardcoding ship to `feat` would re-break its close/switch-to-dev comments.                                                                                                    |

The codebase already used this pattern for _final_ links (ship close → `tree/dev` / `blob/dev/…`; canonical design/plan docs → `blob/main/…`); this just extends it to design/plan's per-step links.

### Change applied (uncommitted, with #209)

- `bkit-design.md` (7 link sites) + `bkit-plan.md` (8 link sites): `tree/{BRANCH}` → `tree/dev`, `blob/{BRANCH}/…` → `blob/dev/…` in the `comment` blocks only (bash `$BRANCH` / prose `{BRANCH}` untouched). `build`/`debug`/`ship` unchanged. Mirrors regenerated; tests green.

### Considered, not taken

- **Commit-SHA blobs** (`blob/{SHA}/…`) — the only zero-compromise option (live _and_ permanent, survives prune). Rejected as too heavy for these glance-navigation links (capture+substitute a SHA per comment, uglier URLs). If the design/plan during-run 404 window ever matters, SHA-linking is the upgrade path.

### Comment — @cbartens (2026-06-01T05:33:56Z)

## Implementation note (6/3) — `merge=union` scoped to the status path (not blanket `*.jsonl`)

Correction to the `.gitattributes` change: shipped `*.jsonl merge=union` was **too broad** — it would impose union-merge on _any_ `.jsonl` a consumer has (datasets, fixtures, NDJSON logs). `merge=union` is **destructive for non-append-only files** (it concatenates both sides with no dedup → corrupt merge), and it also broke the file's own convention (every other entry is a specific path: `docs/pending.md`, `.agents/friction.md`).

Scoped to bkit's status files only:

```gitattributes
docs/plans/**/status.jsonl merge=union
```

(`*/status.jsonl` was considered but wouldn't match — gitattributes anchors slashed patterns and `*` doesn't cross `/`, so it can't reach the 4-deep `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`; `**` is required.)

Verified with `git check-attr merge`:

- `docs/plans/202606/logs/foo-123/status.jsonl` → `union` ✓
- `data/training.jsonl`, `fixtures/records.jsonl` → `unspecified` ✓ (consumer files untouched)

Applied to both `.gitattributes` and `.agents/templates/.gitattributes` (identical); index refs in `workflows.md` updated. Tests green.

### Comment — @cbartens (2026-06-01T05:48:50Z)

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

### Comment — @cbartens (2026-06-01T06:12:44Z)

## Implementation note (7b/3) — `→` flow-arrow kept ASCII-exempt (decided)

Decision on the one remaining non-ASCII glyph: **keep `→`, do not convert to `->`.**

**Why:**

- It's a different category from the operators we swept. `≥`/`⇒`/`×` were _stray_ math operators inconsistently mixed into ASCII text. `→` is the **uniform, documented flow notation** — every `**If** {condition} → {action}.` conditional and dispatch table uses it consistently (the "Procedural conditionals" authoring rule literally specifies it). It's a typographic device, not a comparison operator.
- Scale: ~1,200 occurrences in workflow/prompt sources (~1,564 across `.agents`) — ~14x the whole operator sweep, for a glyph that isn't a consistency or rendering problem.
- `→` reads clearer than `->` for "leads to", and `->` is overloaded (member-access in C/PHP, type-signature arrows) — i.e. slightly _more_ ambiguous, not less.

**Documented:** the "ASCII operators" bullet in both `.agents/workflows.md` and `.agents/prompts.md § Authoring Rules` now states `→` is the sole intentional non-ASCII glyph and is deliberately kept (with the rationale), with an explicit "do NOT convert `→`". Memory rule updated to match.

Net rule: **ASCII for operators that have expected ASCII forms; `→` is the one deliberate notation glyph.**

### Comment — @cbartens (2026-06-01T06:23:22Z)

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

### Comment — @cbartens (2026-06-01T11:40:31Z)

## Re-opening: §3 feat-relocation incomplete for design/plan (surfaced via #216 friction reconciliation)

The `status.jsonl` branch-placement model was not fully applied to **design** and **plan**. Current state:

- **build / debug** — `status.jsonl` is **feat-located** (worktree): `bkit-build.md:318` `STATUS="$WT/.../status.jsonl"` (`$WT` = `git rev-parse --show-toplevel`). ✅ intended model.
- **design / plan** — `status.jsonl` is **dev-located** (`$REPO_ROOT/...`): `bkit-design.md:25` ("design status.jsonl is dev-located"), written at `bkit-design.md:55,245`; `workflows.md:174` documents design/plan as a _"dev-located cheap archive, no persistent feat branch."_ ❌ This contradicts the intended model — status + generated docs live on `feat/{FID}` and squash-merge to `dev` at close; the **only** thing hard-coded to `dev` should be the doc links inside tracker comment blocks (pretend-already-merged URLs).

**Knock-on (also from #216):** design DOC artifacts _are_ worktree-located (subagents `cd` into `.worktrees/{FID}`), but `bkit-design-summary` intermittently writes `design-summary.md` to the main checkout (`$REPO_ROOT`) instead of the worktree — friction #29/#43. Root cause: the subagent `Context:` `cd` uses the `dirname git-common-dir` idiom rather than the orchestrator's already-computed `WORKTREE_PATH` (`bkit-design.md:216`). Same dev-vs-feat path fragility.

**To finish §3:** relocate design/plan `status.jsonl` (and the dev-located archive model in `workflows.md` / `bkit-design.md` / `bkit-plan.md`) onto `feat/{FID}` like build/debug, and pin subagent worktree paths to `WORKTREE_PATH`. Skipped in the #216 friction backlog and tracked here.

### Comment — @cbartens (2026-06-01T12:00:14Z)

## Implementation note (8/3) — re-open remediation plan: finish §3 for design/plan + align subagent cwd across all workflows

Acting on the re-open (comment above). Confirmed the gap against current `dev` (post-`.bkit/` relocation, so line refs differ from the original inventory). Doing this directly on `dev` like the rest of #209 — can't dogfood the workflow files being edited.

### Confirmed: §3 was applied to build/debug/ship but NOT design/plan

- **build/debug/ship** write per-step status to the **feat worktree**: `STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` (cwd is inside `.worktrees/{FID}`), committed per-step on `feat/{FID}`, reaching `dev` once via the squash-merge. ✅
- **design/plan** write per-step status to the **dev main checkout**: every site is `STATUS="$REPO_ROOT/docs/plans/.../status.jsonl"` (`$REPO_ROOT = dirname(git-common-dir)` = main repo). ❌ — even though design/plan **do** create & `cd` into a `feat/{FID}` worktree (`bkit-design.md:216`) and write their **docs** there. So inside design/plan, docs are feat-located but status is dev-located: the exact inconsistency the re-open flags.
- Docs encode the old decision: `.bkit/workflows.md:134/153/174/176` ("dev-located cheap archive") and stale `:1059` ("on dev for all five workflows — BAR-187"). `:176` is internally contradictory — it says "their doc squash-merges to dev at close" (docs ARE on feat during the run) yet keeps status on dev.

### Decisions (owner-confirmed)

| #   | Decision                   | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Where                      | **Fix now, directly on `dev`** (as rest of #209).                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2   | Subagent cwd pinning scope | **All five workflows**, not just design/plan. The fragile `cd "$(dirname "$(git rev-parse … --git-common-dir)")/.worktrees/{FID}"` idiom is universal (design 9, plan 11, build 14, debug 7, ship 4 = 45 sites) → pin every worktree `cd` to the orchestrator's already-computed `{WORKTREE_PATH}`. (Ship's two _main-repo_ `cd`s at 717/722 — no `.worktrees` suffix — are deliberately left untouched.) Closes friction #29/#43 consistently rather than leaving design/plan diverged from the other three. |
| 3   | design/plan Failure Path   | **Drop the best-effort `dev` push** of FAILED status. Match build/debug: status stays on the retained local `feat/{FID}` worktree; the tracker comment (FP step 3) carries the human failure signal. Only `dev` writes that remain are the doc-link URLs in comment blocks + the Close squash-merge.                                                                                                                                                                                                          |

### Edit plan

**design + plan (status feat-relocation):**

1. Per-step status blocks: `REPO_ROOT=…; STATUS="$REPO_ROOT/…"` → `STATUS="$(git rev-parse --show-toplevel)/…"` (worktree), matching build/debug. (7 blocks each.)
2. Step-2 init: convert to `WT=$(git rev-parse --show-toplevel)` + `DIR` form (mirrors `bkit-build.md:316–326`), incl. the migrate-once legacy reader reading `$WT/$DIR/status.json`.
3. Step-1 resume read: prefer the worktree copy, fall back to dev — `SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"` — then fold `$SRC` (mirrors `bkit-build.md:130`).
4. **Close reorder (the one non-mechanical bit):** today the close-workflow appends the `step-done`/`workflow-done` events _after_ the `git add -A && git commit`, so feat-locating the path alone would leave them uncommitted and the `git merge --squash feat` would drop them. Reorder to **append events → then `git add -A && git commit`** so they ride the feat commit and reach dev via the existing squash-merge. The Close `dev` push stays — that's the intended single dev write.
5. Failure Path: drop the `git -C "$REPO_ROOT" pull/add/commit/push origin dev` block; write `workflow-failed` to worktree-if-exists-else-dev (build's pattern).

**all 5 workflows (subagent cwd pinning):** one `replace_all` per file converting the 45 worktree-`cd` Context lines to `cd "{WORKTREE_PATH}"`; add `{WORKTREE_PATH}` to each Placeholders bullet (set at worktree setup, required for subagent Context).

**docs/prose:** rewrite the design/plan **Status branch** bullets (feat-located, reaches dev once via Close merge, no FP dev push); update `.bkit/workflows.md` (134/153/174/176 + stale 1059).

**Out of scope (unchanged):** build/debug/ship status placement (already correct); ship's main-repo post-merge `cd`s; cloud/audit dev-located status (no worktree).

### Verification gates

`pnpm test` green; `pnpm bkit-trackers` render sweep clean (mirror parity); regenerate `.claude/commands/*` + `.cursor/commands/*`; manual diff review of the Close reorder on both files. Shipped-summary comment to follow.

### Comment — @cbartens (2026-06-01T12:15:44Z)

## Implementation note (9/3) — §3 finish shipped to `dev`

Committed to `dev` as **`0359884`** (`fix(209): finish §3 — feat-locate design/plan status.jsonl + pin subagent cwd to WORKTREE_PATH`, 16 files, +286/−336). Not pushed (per request). Done directly on `dev` like the rest of #209.

### Delivered

**design/plan — status.jsonl relocated to `feat/{FID}` (matches build/debug):**

- Every per-step write + the Step-2 init now target the worktree (`$(git rev-parse --show-toplevel)/…` / `WT=$(git rev-parse --show-toplevel)` + `DIR`). `cwd` persistence across Bash calls (the "Worktree" invariant) resolves `--show-toplevel` to the feat worktree — the same mechanism build/debug rely on.
- Step-1 resume read prefers the worktree copy, falls back to dev (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`).
- **Close reorder** (the one non-mechanical edit): `step-done` + `workflow-done` are now appended _before_ `git add -A && git commit`, so they ride the feat commit and reach `dev` via the existing `git merge --squash -X ours` — instead of being written post-commit and dropped by the squash. The Close `dev` push stays (the single intended dev write).
- Failure Path: dropped the `git -C "$REPO_ROOT" pull/add/commit/push origin dev`; `workflow-failed` is appended to the retained worktree copy. Only `dev` writes left are the Close squash-merge + doc-link URLs.

**all 5 workflows — subagent cwd pinned (closes friction #29/#43):**

- 45 worktree-`cd` Context lines (design 9, plan 11, build 14, debug 7, ship 4) converted from the fragile `cd "$(dirname "$(git rev-parse … --git-common-dir)")/.worktrees/{FID}"` idiom to `cd "{WORKTREE_PATH}"` (orchestrator-substituted absolute path). `{WORKTREE_PATH}` registered in each Placeholders bullet. Ship's two _main-repo_ `cd`s (post-merge Steps 8-12) deliberately left as-is. This was the scope extension beyond design/plan — the idiom was universal, so leaving the other three on it would have diverged them.

**docs:** `.bkit/workflows.md` branch-placement model rewritten (table + rationale + staleness rule + the stale `:1059` "on dev for all five — BAR-187" line); `.claude/.cursor` command mirrors regenerated via `pnpm bkit install`.

### Verification

- `bkit-trackers` render sweep: 41 ✓ · `bkit-tokens` + `bkit-status`: 42 ✓
- Mirrors: 0 leftover idiom, 0 orphan tracker markers, 0 dev-located `status.jsonl` in design/plan, `cd "{WORKTREE_PATH}"` counts match sources (9/11/14/7/4 × 2 hosts).
- No Unicode operators introduced; prettier + vale + slop-scan clean on commit.

### Notes

- `cloud`/`audit` remain dev-located by design (no persistent worktree) — unchanged.
- §3 is now uniform across all worktree-bearing phases; the design/plan "dev-located cheap archive" exemption from the original issue body is removed.

### Comment — @cbartens (2026-06-01T12:39:53Z)

## Implementation note (10/3) — `bkit-cloud` router made fully stateless (no `status.jsonl`)

Follow-on cleanup (uncommitted — edits only, per request). The cloud router was the last workflow writing `status.jsonl` to `dev`. It's now a **pure stateless dispatcher**: no `status.jsonl`, no `dev` commit.

### Why it was safe to remove

Nothing read the router's status:

- **No lock** — the router never acquires `.lock`, so no staleness check depends on it.
- **No resume** — single-shot (Step 1 resolve → Step 2 dispatch → exit). Its only status consumer was the Step-1 `LATEST` "already-IN_PROGRESS?" dedup, which was self-referential (existed only because the write persisted).
- **Dispatched skill doesn't use it** — ship/debug fold the log for their _own_ `workflow` entries and ignore `"cloud"`; they own their FID/worktree/status.
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

## #71 — Workflow optimisation commit/push reduction (CLOSED)

<!-- bkit-canonical-artifacts:202605:start -->

> **Canonical artifacts** ([#110](https://github.com/cbartens/bkit/issues/110) retrofix — durable links on `dev`):
>
> - **Plan:** [`docs/plans/202605/bar-187-workflow-commit-push-reduction-plan.md`](https://github.com/cbartens/bkit/blob/dev/docs/plans/202605/bar-187-workflow-commit-push-reduction-plan.md)
>
> Historical comment links to `docs/plans/drafts/`, `docs/plans/active/`, or `docs/plans/completed/` are dead post-#110; paths above replace them.

<!-- bkit-canonical-artifacts:202605:end -->

<!-- linear-import: BAR-187 -->

**Linear:** [BAR-187](https://linear.app/bartens/issue/BAR-187) · **Created:** 2026-05-12 · **Linear assignee:** christian@bartens.biz

---

## Problem

Workflow orchestrators (`bkit-plan`, `bkit-design`, `bkit-build`, `bkit-debug`, `bkit-ship`) make \~15-28 commits and up to \~12 pushes per single workflow run. Two structural over-commitments drive the noise:

1. **Double commits per step** — every step emits a "work" commit on feat/{FID} followed by a separate "status" commit, because `status.json` records the work commit's SHA (`commitSha`) — chicken-and-egg ordering.
2. **Per-step dev pushes for plan/design** — #68 made plan/design push status.json to `dev` after every status mutation, \~10 dev pushes per workflow with no `[skip ci]` tag (CI noise).

Net effect on `dev` history per feature lifecycle: \~22 status-bookkeeping commits land on dev around 1 substantive feature commit (the PR squash). PR diffs include status.json churn for build/debug/ship. `git log dev` is dominated by workflow plumbing.

## Solution

Three changes, all mechanical:

### 1\. Drop `commitSha` → add `parentSha`

Capture `git rev-parse HEAD` at step _start_ (not after work commit). Eliminates the chicken-and-egg, lets ONE commit cover the step. `commitSha` is never read by any consumer outside the type declaration — pure forensic loss. `git log -S` covers any forensic need.

### 2\. Status.json canonical location = `dev` for ALL workflows

Extend #68 from plan/design to build/debug/ship. Path: `$REPO_ROOT/docs/plans/logs/{FID}/status.json`. Per-step writes are file-only (no git operations). Visible from anywhere via `cat $REPO_ROOT/…`. Outside-worktree visibility without git knowledge.

### 3\. Defer all dev commits/pushes to workflow termination

| Workflow      | Success close (1 commit + 1 push on dev)                                        | Failure Path (1 commit + 1 push on dev)                        |
| ------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| plan / design | `git merge --squash feat/{FID}` + stage status.json → ONE commit on dev         | Preserve feat granular history; status FAILED commit only      |
| build / debug | Status-only commit (status DONE, `[skip ci]`) — feat preserved for PR review/CI | Status FAILED commit; feat preserved                           |
| ship          | Batched commit: dev-side work from steps 7-11 + status.json final               | Status FAILED commit; partial dev work committed for forensics |

Per-step feat/{FID} commits stay (one per step for artifacts only — preserves bisectability, `git log` narrative, hook signal locality). Mid-workflow feat pushes stay only when externally required (build's create-pr, debug's push-remediation per attempt).

## Net impact

| Workflow | Commits today → new             | Pushes today → new   |
| -------- | ------------------------------- | -------------------- |
| plan     | 21 → 11 (10 step + 1 dev-close) | 12 → 1 (dev close)   |
| design   | 18 → 10                         | 11 → 1               |
| build    | 28 → 15                         | 2 → 3 (+1 dev close) |
| debug    | 16 → 9                          | 3 → 4 (+1 dev close) |
| ship     | 22 → 11                         | 1 → 1                |

Commits halved across the board. Plan/design dev pushes drop \~10× (12→1). All dev commits tagged `[skip ci]` (except plan/design squash which IS the substantive feature commit and must run CI). Build/debug gain 1 dev push at close (the cost of dev-canonical status.json — worth it for `cat`-from-anywhere visibility).

**Per-feature lifecycle on dev** (plan → build → ship clean): \~4 commits — 1 plan-squash + 1 build status + 1 PR-squash + 1 ship close. Today: \~22 commits per lifecycle.

## Trade-offs accepted

- **Mid-run GitHub visibility**: `…/blob/dev/docs/plans/logs/{FID}/status.json` lags real state until close. Local `cat` is live. Failure Path commits/pushes, so post-mortem links work.
- **Cross-machine resume mid-run**: never supported (`.lock` is local-only). No regression.
- `git blame` on plan artifacts points to squash commit, not the step that created them. Acceptable for plan logs; not load-bearing.

## Plan

**Plan file:** `docs/plans/drafts/bar-187-workflow-commit-push-reduction-plan.md`
**FID:** `bar-187-workflow-commit-push-reduction`
**Execution:** approve plan → move to `docs/plans/active/` → `/bkit-build bar-187-workflow-commit-push-reduction`

## Files touched (8 files + mirrors)

- `.agents/scripts/bkit-status.ts` — `commitSha` → `parentSha` in Step type
- `.agents/scripts/bkit-status.test.ts` — update fixture
- `.agents/workflows.md` — rewrite §status.json (Branch placement + Init/append patterns), §#68 rationale, §Concurrency lock staleness reads
- `.agents/workflows/bkit-plan.md` — collapse work+status pairs; remove per-step dev pushes; add `git merge --squash` in close-workflow
- `.agents/workflows/bkit-design.md` — same as plan
- `.agents/workflows/bkit-build.md` — collapse work+status pairs; status.json moves to `$REPO_ROOT`; add dev close-commit `[skip ci]`
- `.agents/workflows/bkit-debug.md` — same as build
- `.agents/workflows/bkit-ship.md` — same as build + batch steps 7-11 into close commit
- Plus `.claude/` and `.cursor/` mirrors regenerate via `bkit install` at session end

## Design rationale

Full design reasoning captured in plan doc § Design Decisions, covering: why parentSha (not commitSha), why dev-canonical status.json, why preserve per-step feat commits, why squash plan/design but not build/debug, why preserve granular on failure, #69 + #68 compatibility.

Plan is execution-ready — `/bkit-build` can run against it without a separate `/bkit-design` phase.

<!-- linear-links-start -->

**Links:**

- **Related:** #59 ([BAR-148](https://linear.app/bartens/issue/BAR-148)), #61 ([BAR-155](https://linear.app/bartens/issue/BAR-155)), [BAR-180](https://linear.app/bartens/issue/BAR-180) _(not imported)_, #68 ([BAR-183](https://linear.app/bartens/issue/BAR-183)), #69 ([BAR-184](https://linear.app/bartens/issue/BAR-184)), #99 ([BAR-230](https://linear.app/bartens/issue/BAR-230))

<!-- linear-links-end -->

### Comment — @cbartens (2026-05-21T07:12:57Z)

<!-- linear-comment: 46027ca5-29f1-48e2-9970-875c26371315 -->

**@christian (Linear, 2026-05-12):**

## Shipped — PR [#30](https://github.com/cbartens/bkit/pull/30) squash-merged to `dev` at `35d9cd9`

Implemented and merged manually (without `/bkit-build` / `/bkit-ship`, since the change modifies the workflows themselves — running them in flight against in-progress modifications would have been risky).

### Files touched

| File                                                               | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.agents/scripts/bkit-status.ts`                                   | `Step.commitSha` → `Step.parentSha`; doc-comment updated to clarify capture timing (at step START, before any commit)                                                                                                                                                                                                                                                                                                                                                                      |
| `.agents/scripts/bkit-status.test.ts`                              | Fixture rename                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `.agents/workflows.md`                                             | Rewrote §status.json (single Branch placement row — all workflows on dev via `$REPO_ROOT`; init/append patterns with `PARENT_SHA` capture; rationale paragraph), §Concurrency lock (collapsed branch-aware `case` to single `cat`), §#68 extension paragraph, Authoring Checklist gate (`commitSha` → `parentSha`)                                                                                                                                                                         |
| `.agents/workflows/bkit-plan.md`                                   | Caution-block Status branch + Locks updated; Step 1 lock-staleness collapsed; Step 2 dual-entry pattern (start-workflow + worktree-setup share `parentSha`, ONE commit); Steps 3-10 transformed via mechanical regex (work + status double-commit → single `chore({FID}): {step}`); Step 11 close-workflow rewritten as `git merge --squash feat/{FID}` + `docs({FID}): plan DONE` + push origin dev + cleanup; Failure Path commits + pushes `chore({FID}): plan FAILED [skip ci]` to dev |
| `.agents/workflows/bkit-design.md`                                 | Same pattern, 9 steps; close-workflow squash-merge → `docs({FID}): design DONE`                                                                                                                                                                                                                                                                                                                                                                                                            |
| `.agents/workflows/bkit-build.md`                                  | Same pattern, 14 step blocks; close-workflow: feat commit `chore({FID}): close-workflow` (no `[skip ci]` — triggers PR CI) + push origin feat + status-only dev commit `chore({FID}): build DONE [skip ci]` + push origin dev; create-pr feat push unchanged                                                                                                                                                                                                                               |
| `.agents/workflows/bkit-debug.md`                                  | Same pattern, 10 step blocks; close-workflow: feat commit + push (triggers CI on existing PR) + conditional `create-pr` sub-step preserved (when `TRIGGER_PR=1`: `gh pr create` + status entry + commit + push) + dev status-only commit `chore({FID}): debug DONE [skip ci]`                                                                                                                                                                                                              |
| `.agents/workflows/bkit-ship.md`                                   | Steps 1-6 same as build/debug; Steps 7-10 (`switch-to-dev`, `update-docs+summary`, `archive-docs`, `worktree-cleanup`) drop per-step commits — status writes file-only; Step 11 close-workflow batches everything: `git -C "$REPO_ROOT" add -A && commit -m "docs({FID}): ship DONE [skip ci]"` + push origin dev; removed prior line-544 standalone dev push (subsumed)                                                                                                                   |
| `.claude/commands/*`, `.cursor/commands/*`                         | Regenerated via `bkit install`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `docs/knowledge.md`                                                | KN-21 documents the new contract                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `docs/plans/active/bar-187-workflow-commit-push-reduction-plan.md` | Plan doc preserved on dev                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Verification

- Unit test `bkit-status.test.ts` passes with `parentSha` fixture
- Full suite: 786 passed, 2 skipped, 1 todo
- `tsc --noEmit`: clean
- `prettier --check`: clean
- Grep assertions all green:
  - No `commitSha` remaining in `.agents/`
  - No per-step `git add "$STATUS" && git commit` patterns
  - No relative `STATUS="docs/plans/..."` paths (all `$REPO_ROOT/`)
  - No `work"` suffix on commit messages
  - No mid-workflow per-step `git -C "$REPO_ROOT" push origin dev` patterns
  - All 5 workflow files have **Status branch** caution-block line
  - Each workflow has exactly 2 dev pushes (close-workflow + Failure Path)
- Pre-commit hooks (prettier, vale, slop-scan, check:dist) ran cleanly on commit
- CI on the squash-merge push to dev: expected to run (commit message has no `[skip ci]` token)

### Refinements during implementation

| Issue caught mid-implementation                                                                                                    | Fix                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 22-space alignment in dual-entry jq looked awkward                                                                                 | Switched to two separate single-entry jq calls sharing `PARENT_SHA` — cleaner, consistent with existing single-entry blocks                                                                             |
| Used `+` instead of `and` in gate-checklist conjunctions (e.g. ``steps `start-workflow` + `worktree-setup` ``)                     | Renamed to `and` across all 5 workflows (mixed convention before; aligned to `bkit-ship.md:512` precedent)                                                                                              |
| Bulk transformer left `[skip build] [skip ci]` flags on per-step commits (carried over from original work commits)                 | Manually cleaned `install-skills`, `summary`, `create-pr`, `observe-instrument`, `archive`, `worktree-cleanup`, `close-workflow` (build/debug feat close must NOT have `[skip ci]` — it triggers PR CI) |
| Authoring-rule violations: parenthetical explanations in caution-block "Status branch" line                                        | Tightened to instruction-only phrasing per `.agents/workflows.md` § Workflow Authoring Rules                                                                                                            |
| Authoring-rule violation: bullet description "Update status (file-only on dev's working copy) and commit on feat:" added rationale | Reverted to existing "Update status and commit:"                                                                                                                                                        |

### Net impact (vs `dev` HEAD as of pre-merge)

| Workflow | Commits today → new | Pushes today → new |
| -------- | ------------------- | ------------------ |
| plan     | 21 → 11             | 12 → 1             |
| design   | 18 → 10             | 11 → 1             |
| build    | 28 → 15             | 2 → 3              |
| debug    | 16 → 9              | 3 → 4              |
| ship     | 22 → 11             | 1 → 1              |

Net diff: -1726 +1889 = +163 net lines on dev (plan doc itself is +519; net workflow-file shrinkage ~356 lines).

Marking issue Done.

### Comment — @cbartens (2026-05-21T07:12:59Z)

<!-- linear-comment: 5166c7ee-2ea1-4003-9f6b-9fbe99fc162f -->

**@christian (Linear, 2026-05-12):**

## Per-workflow commit/push/status.json timeline (final canonical spec)

`status.json` writes go to `$REPO_ROOT/docs/plans/logs/{FID}/status.json` (file-only between steps). Feat commits land on `feat/{FID}` inside the worktree. Dev commits/pushes land on `dev` from `$REPO_ROOT`. `PARENT_SHA` is captured at step start (`git rev-parse HEAD`) before any commit the step produces.

---

### bkit-plan

| Step                               | status.json                                                                | feat commit                          | feat push | dev commit                                                       | dev push              |
| ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------------ | --------- | ---------------------------------------------------------------- | --------------------- |
| 1 start-workflow                   | — _(#69: no commits pre-worktree)_                                         | —                                    | —         | —                                                                | —                     |
| 2 worktree-setup                   | append 2 entries: `start-workflow` + `worktree-setup` (shared `parentSha`) | 1 × `chore({FID}): worktree-setup`   | —         | —                                                                | —                     |
| 3 generate-plan                    | append entry                                                               | 1 × `chore({FID}): generate-plan`    | —         | —                                                                | —                     |
| 4 review-plan                      | append entry (verdict)                                                     | 1 × `chore({FID}): review-plan`      | —         | —                                                                | —                     |
| 5 apply-review                     | append entry                                                               | 1 × `chore({FID}): apply-review`     | —         | —                                                                | —                     |
| 6 scope-check                      | append entry                                                               | 1 × `chore({FID}): scope-check`      | —         | —                                                                | —                     |
| 7 apply-scope                      | append entry                                                               | 1 × `chore({FID}): apply-scope`      | —         | —                                                                | —                     |
| 8 complexity-check                 | append entry                                                               | 1 × `chore({FID}): complexity-check` | —         | —                                                                | —                     |
| 9 complexity-split _(conditional)_ | append entry                                                               | 1 × `chore({FID}): complexity-split` | —         | —                                                                | —                     |
| 10 summary                         | append entry                                                               | 1 × `chore({FID}): summary`          | —         | —                                                                | —                     |
| **11 close-workflow**              | mark `workflow=DONE`                                                       | —                                    | —         | 1 × `docs({FID}): plan DONE` _(squash-merge feat + status.json)_ | **1 push origin dev** |
| **Failure Path** (any step)        | mark `workflow=FAILED`                                                     | —                                    | —         | 1 × `chore({FID}): plan FAILED [skip ci]`                        | **1 push origin dev** |

**Run totals (clean):** 10 feat commits, 0 feat pushes, 1 dev commit, **1 dev push**.

---

### bkit-design

Same shape as plan, 9 substantive steps:

| Step                       | feat commit                          | dev commit/push                                                          |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| 1 start-workflow           | — _(#69)_                            | —                                                                        |
| 2 worktree-setup           | 1 (shared `parentSha` for 2 entries) | —                                                                        |
| 3 brainstorm-ideate        | 1                                    | —                                                                        |
| 4 design-generate          | 1                                    | —                                                                        |
| 5 design-review            | 1                                    | —                                                                        |
| 6 apply-review             | 1                                    | —                                                                        |
| 7 design-organise          | 1                                    | —                                                                        |
| 8 summary                  | 1                                    | —                                                                        |
| 9 design-workstream-issues | 1                                    | —                                                                        |
| **10 close-workflow**      | —                                    | `docs({FID}): design DONE` + **1 push origin dev** _(squash-merge feat)_ |
| **Failure Path**           | —                                    | `chore({FID}): design FAILED [skip ci]` + **1 push origin dev**          |

**Run totals (clean):** 9 feat commits, 0 feat pushes, 1 dev commit, **1 dev push**.

---

### bkit-build

| Step                                                    | status.json                  | feat commit                        | feat push                                                    | dev commit                                 | dev push              |
| ------------------------------------------------------- | ---------------------------- | ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------ | --------------------- |
| 1 start-workflow                                        | — _(#69)_                    | —                                  | —                                                            | —                                          | —                     |
| 2 worktree-setup                                        | 2 entries (shared parentSha) | 1 × `chore({FID}): worktree-setup` | —                                                            | —                                          | —                     |
| 3 branch-sync                                           | append                       | 1 × `chore({FID}): branch-sync`    | —                                                            | —                                          | —                     |
| 4 install-skills                                        | append                       | 1 × `chore({FID}): install-skills` | —                                                            | —                                          | —                     |
| 5 plan-execute _(× SUB_COUNT)_                          | append per sub-plan          | 1 per sub-plan                     | —                                                            | —                                          | —                     |
| 6 plan-verify _(× attempts)_                            | append per attempt (verdict) | 1 per attempt                      | —                                                            | —                                          | —                     |
| 7 plan-gaps-remediate _(conditional × attempts)_        | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 8 plan-verify-holistic                                  | append                       | 1                                  | —                                                            | —                                          | —                     |
| 9 build-challenge _(× CHALLENGE_REMEDIATE_ATTEMPT)_     | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 10 build-challenge-reconcile _(per attempt)_            | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 11 build-challenge-remediate _(conditional × attempts)_ | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 12 build-challenge-tests                                | append                       | 1                                  | —                                                            | —                                          | —                     |
| 13 run-tests _(× TEST_ATTEMPT)_                         | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 14 failure-diagnose _(conditional × attempts)_          | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 15 failure-remediate _(conditional × attempts)_         | append per attempt           | 1 per attempt                      | —                                                            | —                                          | —                     |
| 16 summary                                              | append                       | 1 × `chore({FID}): summary`        | —                                                            | —                                          | —                     |
| **17 create-pr**                                        | append                       | 1 × `chore({FID}): create-pr`      | **1 push origin feat/{FID}** _(needed for `gh pr create`)_   | —                                          | —                     |
| **18 close-workflow**                                   | mark `workflow=DONE`         | 1 × `chore({FID}): close-workflow` | **1 push origin feat/{FID}** _(final PR state, triggers CI)_ | 1 × `chore({FID}): build DONE [skip ci]`   | **1 push origin dev** |
| **Failure Path**                                        | mark `workflow=FAILED`       | — _(preserve granular)_            | (best-effort)                                                | 1 × `chore({FID}): build FAILED [skip ci]` | **1 push origin dev** |

**Run totals (clean, 1 sub-plan / 1 attempt each):** ~14 feat commits, 2 feat pushes, 1 dev commit, **1 dev push**.

---

### bkit-debug (corrected — close-workflow has conditional `create-pr` sub-step)

`OBSERVE_MODE` is `off` (normal), `instrument` (single observation pass when `DEBUG_ATTEMPT > MAX`), or `analyse` (read prior CI logs, then revert). Steps run conditionally per OBSERVE_MODE.

| Step                                                         | trigger                                                               | status.json                                | feat commit                            | feat push                                                         | dev commit                                 | dev push              |
| ------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ | --------------------- |
| 1 start-workflow                                             | always                                                                | — _(#69)_                                  | —                                      | —                                                                 | —                                          | —                     |
| 2 worktree-setup                                             | always                                                                | 2 entries (shared parentSha)               | 1 × `chore({FID}): worktree-setup`     | —                                                                 | —                                          | —                     |
| 3 failure-diagnose _(per attempt)_                           | OBSERVE_MODE=off                                                      | append (verdict, strategy)                 | 1 × `chore({FID}): failure-diagnose`   | —                                                                 | —                                          | —                     |
| 4 failure-remediate _(per attempt)_                          | OBSERVE_MODE=off                                                      | append (verdict)                           | 1 × `chore({FID}): failure-remediate`  | —                                                                 | —                                          | —                     |
| 5 run-tests _(per attempt)_                                  | OBSERVE_MODE=off                                                      | append (verdict, failures)                 | 1 × `chore({FID}): run-tests`          | —                                                                 | —                                          | —                     |
| **6 push-remediation** _(per attempt, when MAX not reached)_ | OBSERVE_MODE=off + Step 5 PASS                                        | append (debugAttempt)                      | 1 × `chore({FID}): push-remediation`   | **1 push origin feat/{FID}** _(re-triggers CI on PR)_             | —                                          | —                     |
| **7 summary**                                                | OBSERVE_MODE=off + Step 5 PASS                                        | append (verdict)                           | 1 × `chore({FID}): summary`            | **1 push origin feat/{FID}** _(line 440)_                         | —                                          | —                     |
| **8 observe-instrument**                                     | OBSERVE_MODE=instrument                                               | append                                     | 1 × `chore({FID}): observe-instrument` | **1 push origin feat/{FID}** _(line 495 — gets CI logs)_          | —                                          | —                     |
| 9 observe-analyse                                            | OBSERVE_MODE=analyse                                                  | append                                     | 1 × `chore({FID}): observe-analyse`    | —                                                                 | —                                          | —                     |
| 10 observe-revert                                            | OBSERVE_MODE=analyse                                                  | append                                     | 1 × `chore({FID}): observe-revert`     | —                                                                 | —                                          | —                     |
| **11 close-workflow** _(skipped if OBSERVE_MODE=analyse)_    | OBSERVE_MODE=off or instrument                                        | mark `workflow=DONE`                       | 1 × `chore({FID}): close-workflow`     | **1 push origin feat/{FID}** _(always — fires CI on existing PR)_ | —                                          | —                     |
| **11.5 create-pr** _(conditional sub-step inside Step 11)_   | `TRIGGER_PR=1` _(DEBUG_MODE=local + feature branch + no existing PR)_ | append `create-pr` entry (PR_URL artifact) | 1 × `chore({FID}): create-pr`          | **1 push origin feat/{FID}** _(after `gh pr create`)_             | —                                          | —                     |
| **11.dev** _(final at end of Step 11)_                       | always                                                                | —                                          | —                                      | —                                                                 | 1 × `chore({FID}): debug DONE [skip ci]`   | **1 push origin dev** |
| **Failure Path**                                             | any step                                                              | mark `workflow=FAILED`                     | — _(preserve granular)_                | (best-effort)                                                     | 1 × `chore({FID}): debug FAILED [skip ci]` | **1 push origin dev** |

**Close-workflow flow detail (Step 11):**

1. Write `close-workflow` status.json entry → feat commit `chore({FID}): close-workflow` → push feat _(fires CI on existing PR if `EXISTING_PR` non-empty or branch is dev/main)_
2. Capture `CURRENT`, `EXISTING_PR`; set `TRIGGER_PR`
3. **If** `TRIGGER_PR=1` → `gh pr create` → write `create-pr` status.json entry → feat commit `chore({FID}): create-pr` → push feat
4. `cd "$REPO_ROOT"` → pull dev → stage status.json → dev commit `chore({FID}): debug DONE [skip ci]` → push dev

**Run totals — clean OBSERVE_MODE=off, 1 attempt → succeeds:**

| Scenario                                        | feat commits                                                                                       | feat pushes                                   | dev commits             | dev pushes |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- | ---------- |
| PR debug mode (existing PR)                     | ~6 (worktree-setup, diagnose, remediate, run-tests, push-remediation, summary, close-workflow) = 7 | 3 (push-remediation, summary, close-workflow) | 1                       | **1**      |
| Local debug mode (no existing PR, TRIGGER_PR=1) | 8 (same + create-pr)                                                                               | 4 (same + create-pr push)                     | 1                       | **1**      |
| OBSERVE_MODE=instrument (handover)              | 3 (worktree-setup, observe-instrument, close-workflow)                                             | 2 (observe-instrument, close-workflow)        | 1                       | **1**      |
| OBSERVE_MODE=analyse (no Step 11)               | 4 (worktree-setup, analyse, revert)                                                                | 0                                             | 0 _(no close-workflow)_ | **0**      |

_(OBSERVE_MODE=analyse note: Step 11 is skipped, so no dev commit/push. Workflow status remains `IN_PROGRESS` for analyse-mode "handover" — re-entered by a subsequent `/bkit-debug` invocation that resumes in `off` or completes via Failure Path.)_

---

### bkit-ship

Ship crosses cwd: Steps 1-6 on `feat/{FID}` (worktree); Steps 7-11 on `dev` (`$REPO_ROOT`). Step 4 `merge-pr` is `gh pr merge --squash` — lands the feature's PR-squash on dev via GitHub (no local push by orchestrator).

| Step                                           | cwd        | status.json                                     | feat commit                          | feat push                                                              | dev commit                                                                                 | dev push              |
| ---------------------------------------------- | ---------- | ----------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| 1 start-workflow                               | worktree   | — _(#69)_                                       | —                                    | —                                                                      | —                                                                                          | —                     |
| 2 worktree-setup                               | worktree   | 2 entries (shared parentSha)                    | 1 × `chore({FID}): worktree-setup`   | —                                                                      | —                                                                                          | —                     |
| 3 conflict-resolve                             | worktree   | append (verdict)                                | 1 × `chore({FID}): conflict-resolve` | —                                                                      | —                                                                                          | —                     |
| **4 merge-pr** _(× MERGE_ATTEMPT)_             | worktree   | append per attempt (verdict, attempt, failures) | 1 per attempt                        | —                                                                      | — _(`gh pr merge --squash` lands feature commit on dev externally)_                        | —                     |
| 5 failure-diagnose _(conditional × attempts)_  | worktree   | append per attempt                              | 1 per attempt                        | —                                                                      | —                                                                                          | —                     |
| 6 failure-remediate _(conditional × attempts)_ | worktree   | append (strategy)                               | 1 per attempt                        | **1 push origin feat/{FID}** _(re-triggers CI for next merge attempt)_ | —                                                                                          | —                     |
| 7 switch-to-dev                                | $REPO_ROOT | append (parentSha = dev HEAD post-PR-squash)    | — _(now on dev)_                     | —                                                                      | —                                                                                          | —                     |
| 8 update-docs + summary                        | $REPO_ROOT | append 2 entries                                | —                                    | —                                                                      | —                                                                                          | —                     |
| 9 archive-docs                                 | $REPO_ROOT | append                                          | —                                    | —                                                                      | —                                                                                          | —                     |
| 10 worktree-cleanup                            | $REPO_ROOT | append                                          | —                                    | —                                                                      | —                                                                                          | —                     |
| **11 close-workflow**                          | $REPO_ROOT | mark `workflow=DONE`                            | —                                    | —                                                                      | 1 × `docs({FID}): ship DONE [skip ci]` _(batches steps 7-10 dev work + status.json final)_ | **1 push origin dev** |
| **Failure Path (steps 1-6)**                   | worktree   | mark `workflow=FAILED`                          | — _(preserve granular)_              | (best-effort)                                                          | 1 × `chore({FID}): ship FAILED [skip ci]`                                                  | **1 push origin dev** |
| **Failure Path (steps 7-11)**                  | $REPO_ROOT | mark `workflow=FAILED`                          | —                                    | —                                                                      | 1 × `chore({FID}): ship FAILED [skip ci]` _(includes partial dev work for forensics)_      | **1 push origin dev** |

**Run totals (clean, no remediation):** ~6 feat commits, 0 feat pushes, 1 dev commit, **1 dev push**.

The PR-squash commit (`gh pr merge --squash`) lands at Step 4 — substantive feature commit on dev, external operation via GitHub (not counted in orchestrator commit tally).

---

### Aggregate summary

| Workflow                      | feat commits   | feat pushes                               | dev commits | dev pushes |
| ----------------------------- | -------------- | ----------------------------------------- | ----------- | ---------- |
| plan                          | 10             | 0                                         | 1           | **1**      |
| design                        | 9              | 0                                         | 1           | **1**      |
| build                         | ~14            | 2 (create-pr + close)                     | 1           | **1**      |
| debug (PR mode, 1 attempt)    | ~7             | 3 (push-remediation + summary + close)    | 1           | **1**      |
| debug (local mode, 1 attempt) | ~8             | 4 (same + create-pr)                      | 1           | **1**      |
| ship                          | ~6 (steps 1-6) | 0–N (failure-remediate per merge attempt) | 1           | **1**      |

### Invariants holding across all 5 workflows

- `status.json` writes happen at every step (file-only, on dev's working copy at `$REPO_ROOT`)
- Per-step feat commits = one per step, message `chore({FID}): {step}` — no `work` / `status` suffix
- Dev pushes = **exactly one per workflow run**, at close-workflow OR Failure Path _(exception: debug OBSERVE_MODE=analyse skips Step 11 → 0 dev pushes, deliberate handover behaviour)_
- All status-only dev commits carry `[skip ci]`; plan/design's squash close is the lone exception (substantive content → CI runs)
- #69 preserved: zero commits on dev between worktree creation and close-workflow / Failure Path
- #68 generalized: status.json on dev via `$REPO_ROOT` for all workflows (was plan/design only)

### Comment — @cbartens (2026-05-21T07:13:00Z)

<!-- linear-comment: 907b8886-9fa1-4633-94e8-37795bc7a2c2 -->

**@christian (Linear, 2026-05-12):**

Both addressed. Aligned commit message convention now codified centrally in the plan at § Architecture & Component Changes → Workflow files → "Commit message convention":

**Per-step (during workflow):**

- `chore({FID}): {step}` — no `work` / `status` suffix

**Close-workflow success:**

- plan / design: `docs({FID}): plan DONE` / `docs({FID}): design DONE` — substantive (squash brings plan markdown to dev), no `[skip ci]`
- build / debug: `chore({FID}): build DONE [skip ci]` / `chore({FID}): debug DONE [skip ci]` — status-only
- ship: `docs({FID}): ship DONE [skip ci]` — docs/archive updates + status.json (PR squash in Step 4 already triggered feature CI)

**Failure Path:** `chore({FID}): {workflow} FAILED [skip ci]` — always

Rationale: `DONE` / `FAILED` mirror `status.json`'s schema enum (`IN_PROGRESS | DONE | FAILED`). One word, grep-able, no synonym ambiguity. `{type}` follows conventional-commits — `docs` when the commit lands plan/docs content (plan/design close + ship docs updates), `chore` when status-only.

All inline examples in the plan body updated (5 substitutions). Ready to move to active and execute.

### Comment — @cbartens (2026-05-21T07:13:01Z)

<!-- linear-comment: 676ae8f9-2832-49b1-b689-ac5f955bd12f -->

**@christian (Linear, 2026-05-12):**

now that we only have one commit make it just 'commit -m "chore({FID}): {step}"' without the 'status' at end align usage 'git commit -m "chore({FID}): debug DONE \[skip ci\]"' vs 'git commit -m "feat({FID}): ship complete \[skip ci\]"' one 'DONE' and one 'complete' what do we use usually? align! otherwise looks fine

Right on both. Aligning to `DONE` (mirrors `status.json`'s schema enum: `IN_PROGRESS | DONE | FAILED`). Updating the plan.

### Comment — @cbartens (2026-05-21T07:13:02Z)

<!-- linear-comment: 5eee5474-8c5d-4e02-8508-07349994cc69 -->

**@christian (Linear, 2026-05-12):**

Walking through every change, in execution order.

## 1\. Schema — `.agents/scripts/bkit-status.ts`

**Single field rename in the** `Step` type.

```
// BEFORE (line 11)
commitSha: string;

// AFTER
parentSha: string;
```

Plus the top-of-file doc comment clarifies semantics: "`parentSha` is captured at step START via `git rev-parse HEAD`, before any commits the step produces." `validateInvariants()` unchanged — it never referenced either field.

## 2\. Test — `.agents/scripts/bkit-status.test.ts`

**Fixture rename only.**

```
// BEFORE (~line 10)
commitSha: "a1b2c3d",

// AFTER
parentSha: "a1b2c3d",
```

No new test cases. Invariant assertions untouched.

## 3\. Central rules — `.agents/workflows.md`

Three sections to rewrite:

### 3a. § status.json — Branch placement table (lines 121-128)

```
# BEFORE — two-row table
| `bkit-plan`, `bkit-design`         | `dev` (mid-run)        | git -C $REPO_ROOT … push origin dev every mutation |
| `bkit-build`, `bkit-debug`, `bkit-ship` | `feat/{FID}` (mid-run) | stays on worktree branch |

# AFTER — single row
| All workflows | `dev` working copy at `$REPO_ROOT` (uncommitted between steps) | Committed + pushed ONCE at close-workflow OR Failure Path; `[skip ci]` for status-only |
```

### 3b. § status.json — Init/append patterns (lines 172-199)

```
# BEFORE (two STATUS forms, per-step dev push at the end)
# plan/design: STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
# build/debug/ship: STATUS="docs/plans/logs/{FID}/status.json"
...
# plan/design only: every status mutation is followed by
git -C "$REPO_ROOT" pull --ff-only origin dev || exit 1
git -C "$REPO_ROOT" add "docs/plans/logs/{FID}/status.json"
git -C "$REPO_ROOT" commit -m "chore({FID}): {step} status"
git -C "$REPO_ROOT" push origin dev || exit 1

# AFTER (one STATUS form, no per-step dev push, parentSha pattern)
STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
PARENT_SHA=$(git rev-parse HEAD)    # capture BEFORE step's commit
# (file-only jq mutation with parentSha:$p)
# No dev pull/commit/push here — termination only.
```

### 3c. § Concurrency lock — staleness check (lines 213-217)

```
# BEFORE — branch case
case "$LOCK_WORKFLOW" in
  plan|design) STATUS_JSON=$(cat "$REPO_ROOT/$STATUS_REL" 2>/dev/null || echo '[]') ;;
  *)           STATUS_JSON=$(git -C "$REPO_ROOT" show "feat/{FID}:$STATUS_REL" 2>/dev/null || echo '[]') ;;
esac

# AFTER — single read
STATUS_JSON=$(cat "$REPO_ROOT/$STATUS_REL" 2>/dev/null || echo '[]')
```

### 3d. § #68 extension paragraph (line 91)

Rewrite to: "All workflows write `status.json` to `dev`'s working copy at `$REPO_ROOT` (file-only per step, uncommitted between steps). Single commit + push at close-workflow OR Failure Path. #69 divergence guard still holds: no commits on `dev` between worktree creation and close-workflow."

## 4\. Workflow files — per-file pattern

### Core diff (applies to every per-step status block in every workflow)

```
# BEFORE — two commits per step + (plan/design only) per-step dev push
STATUS="docs/plans/logs/{FID}/status.json"
git add -A && git commit --allow-empty -m "chore({FID}): {step} work"
SHA=$(git rev-parse HEAD)
t=$(mktemp); jq --arg sha "$SHA" ... '... commitSha:$sha ...' "$STATUS" > "$t" && mv "$t" "$STATUS"
git add "$STATUS" && git commit -m "chore({FID}): {step} status"
# plan/design only: pull/add/commit/push origin dev

# AFTER — one commit per step, no dev push
STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
PARENT_SHA=$(git rev-parse HEAD)
t=$(mktemp); jq --arg p "$PARENT_SHA" ... '... parentSha:$p ...' "$STATUS" > "$t" && mv "$t" "$STATUS"
git add -A && git commit --allow-empty -m "chore({FID}): {step}"
```

Plus per-step `recorded with commitSha` → `recorded with parentSha` in gate checklists (\~10 per file).

### 4a. `.agents/workflows/bkit-plan.md`

- 10 per-step status blocks (Step 2 has two entries: start-workflow + worktree-setup) → core diff applied
- Step 2 update: capture `PARENT_SHA` TWICE (one per status entry) since #69 defers start-workflow's entry to Step 2; both written to the same file before the single Step 2 commit
- **Step 11 close-workflow (lines \~540-595):**

```
# BEFORE — granular feat merged into dev + separate status commit on dev
cd "$REPO_ROOT"
git checkout dev
git pull origin dev
git merge "$BRANCH" --no-edit      # brings ~10 feat commits onto dev
git push origin dev
...
git -C "$REPO_ROOT" add status.json
git -C "$REPO_ROOT" commit -m "chore({FID}): close-workflow status [skip build] [skip ci]"
git -C "$REPO_ROOT" push origin dev

# AFTER — one squash commit on dev, no [skip ci] (this IS the feature)
cd "$REPO_ROOT"
git checkout dev
git pull --ff-only origin dev
git merge --squash feat/{FID}              # stages all feat content
git add docs/plans/logs/{FID}/status.json  # status DONE
git commit -m "feat({FID}): plan complete"
git push origin dev
git worktree remove ... && git branch -D feat/{FID} && git push origin --delete feat/{FID}
```

- **Failure Path (lines \~40-60):** stage status.json (status FAILED set in step body), `chore({FID}): plan FAILED [skip ci]`, push dev. Feat preserved.

### 4b. `.agents/workflows/bkit-design.md`

Same shape as plan: 9 per-step blocks → core diff. Step 11 close-workflow uses `git merge --squash` + `feat({FID}): design complete`.

### 4c. `.agents/workflows/bkit-build.md`

- 14 per-step status blocks → core diff applied
- All `STATUS=` paths switch to `$REPO_ROOT/...`
- **Operational feat pushes UNCHANGED** at create-pr (line \~803), close (\~885), Failure Path (\~68) — these push code for `gh pr create` / CI
- **New close-workflow dev commit (added):**

```
# AFTER close-workflow (in addition to the existing feat push)
cd "$REPO_ROOT"
git pull --ff-only origin dev
git add docs/plans/logs/{FID}/status.json
git commit -m "chore({FID}): build DONE [skip ci]"
git push origin dev
```

- Note: build's close already pushes feat (`bkit-build.md:885`). We add a SEPARATE dev push for the status close.

### 4d. `.agents/workflows/bkit-debug.md` _(file open in your IDE)_

- \~10 per-step status blocks → core diff applied
- All `STATUS=` paths to `$REPO_ROOT/...`
- **Operational feat pushes UNCHANGED:**
  - Line 407 — push-remediation per attempt (re-triggers CI on PR)
  - Line 443 — summary
  - Line 498 — observe-instrument (or observe-revert) end
  - Line 626 — close-workflow feat push
- **New close-workflow dev commit at line \~626+** (added after the existing feat push):

```
# Existing (kept):
git push origin "$(git branch --show-current)"

# New (added):
cd "$REPO_ROOT"
git pull --ff-only origin dev
git add docs/plans/logs/{FID}/status.json
git commit -m "chore({FID}): debug DONE [skip ci]"
git push origin dev
```

- Specific debug nuances:
  - PR-debug mode (resumes prior failed build/ship): reads `debugAttempt` from status.json via `cat $REPO_ROOT/...` instead of `git show feat/{FID}:status.json`
  - `MAX_DEBUG_ATTEMPT` / `DEBUG_ATTEMPT` counter logic unchanged
  - observe-instrument / observe-analyse / observe-revert step status blocks: same core diff
- Gate checklists: `recorded with commitSha` → `recorded with parentSha` (\~10 occurrences)

### 4e. `.agents/workflows/bkit-ship.md`

Different shape because steps 7-11 already run on `dev` (post-PR-merge).

- **Steps 1-6 (on feat/{FID} in worktree):** core diff per step
- **Steps 7-11 (on dev in** `$REPO_ROOT`): per-step status.json writes stay (file-only), but **per-step commits ELIMINATED**. No `git add -A && git commit` in steps 7, 8, 9, 10
- **Step 11 close-workflow** becomes the single batching point:

```
# AFTER Step 11
cd "$REPO_ROOT"
git pull --ff-only origin dev
git add -A   # captures steps 7-10 substantive work (update-docs, archive-docs, worktree-cleanup) + status.json final
git commit -m "feat({FID}): ship complete [skip ci]"
git push origin dev
```

- **Today's** `git push origin dev` at line 544 is REMOVED — subsumed by Step 11's batched push

## 5\. Mirror regeneration

After all `.agents/*` edits, run `bkit install` once at session end. Regenerates `.claude/` and `.cursor/` mirrors. Already part of the bkit-repo authoring rule.

## 6\. Documentation — `docs/knowledge.md`

Append KN entry referencing [BAR-187](https://linear.app/bartens/issue/BAR-187/workflow-optimisation-commitpush-reduction) / #68 / #69 chain. Explains: status.json on dev (universal), per-step feat commits only, termination-only dev push, squash on plan/design success.

## Summary of what changes where

| File                  | Changes                                                                                  | Lines |
| --------------------- | ---------------------------------------------------------------------------------------- | ----- |
| `bkit-status.ts`      | rename field on `Step` type                                                              | \~2   |
| `bkit-status.test.ts` | rename fixture field                                                                     | \~1   |
| `workflows.md`        | 4 sections rewritten                                                                     | \~80  |
| `bkit-plan.md`        | 10 step blocks + close-workflow + Failure Path + gates                                   | \~150 |
| `bkit-design.md`      | 9 step blocks + close-workflow + Failure Path + gates                                    | \~140 |
| `bkit-build.md`       | 14 step blocks + add dev close + Failure Path + gates                                    | \~200 |
| `bkit-debug.md`       | 10 step blocks + add dev close + Failure Path + gates                                    | \~150 |
| `bkit-ship.md`        | 6 feat step blocks + drop dev step commits 7-10 + batched Step 11 + Failure Path + gates | \~180 |
| `docs/knowledge.md`   | append KN entry                                                                          | \~10  |

All mechanical. No new abstractions, no new files, no schema migration of historical `status.json` records (they're forensic-only).

Ready to move to `docs/plans/active/` when you give the go-ahead?

## #341 — Make workflows run in all runtimes local GH Actions claude.ai (OPEN)

## Premise

bkit's workflows were authored for a **local developer laptop**, but they now run in **three materially different runtimes**, and several steps assume capabilities only the laptop has. Running the phases via **claude.ai cloud agents** (Claude Code on the web) surfaced a cluster of deviations — including a _silent CI-suppression bug_ — that trace back to conflating these runtimes.

This issue records a working session that (a) dissected real deviations (the ship of **#703**; a `/bkit-design` run on **#616**), (b) root-caused the gh-auth flakiness, (c) researched the downsides of GitHub MCP, and (d) settled on a **direction** (§6). Still **document-only** — no code lands here.

**Guiding principle:** _make the one workflow run in all modes with **minimal, additive changes**_ — a global fallback rule + a gh→MCP tool map + retry/minimal-output rules + any-branch support — **not** a rewrite of every call site.

Related: **#134** (design→ship branch / artifact-trail model).

---

## 1. The three runtimes

| Dimension                        | **1. local** (laptop)                               | **2. gh-action runner** (bkit install cloud option)                                          | **3. claude.ai runner** (`.claude/cloud.md`)                             |
| -------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Triggered by**                 | dev runs `/bkit-*` in IDE                           | CI event/label → `.github/workflows/{claude,opencode,bkit-cloud}.yml` on `ubuntu-latest`     | user starts a session at claude.ai/code (or Auto-fix webhook)            |
| **gh CLI auth**                  | `gh auth login` keychain — **real token, reliable** | default `GITHUB_TOKEN` present, gh reads it — **reliable transport**                         | **fragile** (see §2)                                                     |
| **Write / merge token**          | dev's own creds (full)                              | **GH_BKIT_TOKEN** (PAT/App) or Claude App — _not_ `GITHUB_TOKEN` (read-only + won't fire CI) | real tokens kept out of sandbox; server-side merge needs the fragile PAT |
| **GitHub MCP / built-in**        | usually not configured                              | optional                                                                                     | **proxy-managed → auth-reliable, but see §5 downsides**                  |
| **git push**                     | unrestricted                                        | standard runner (branch-protection only)                                                     | **proxy-restricted to the current working branch**                       |
| **Worktree `.worktrees/{FID}`**  | native                                              | works                                                                                        | breaks — session is on `claude/…`, no worktrees                          |
| **Network egress (debug-fetch)** | full                                                | full                                                                                         | **Trusted allowlist**; app backends need a **Custom** allowlist          |
| **Autonomous merge to `dev`**    | ✅ gh                                               | ✅ gh (GH_BKIT_TOKEN/App)                                                                    | ✅ gh if authed, else MCP fallback (both server-side)                    |

Detection primitives exist: `CLAUDE_CODE_REMOTE=true` (mode 3), `GITHUB_ACTIONS`/`CI` (mode 2), neither (mode 1).

---

## 2. Root cause — why gh auth is flaky on the claude.ai runner (mode 3)

Claude Code on the web has **three auth lanes**; gh is the disadvantaged one _by design_: **git** (scoped proxy credential, push restricted to current branch), **built-in GitHub tools** (proxy-brokered, _"token never enters the container"_), and **`gh` CLI** (needs a real PAT inside the sandbox). Ranked reasons gh is flaky in mode 3:

1. **gh needs a real token the platform deliberately withholds.** Works only if `GH_BKIT_TOKEN`/`GH_TOKEN` is present + valid this session (`cloud.md`: dashboard env vars invisible to the snapshot setup script; `knowledge.jsonl` KN-CORE-1: 401 after rotation).
2. **Env-var precedence (the reported "invalid GH_TOKEN").** gh reads `GH_TOKEN`→`GITHUB_TOKEN` and an env token **overrides** `gh auth login` creds ([gh manual](https://cli.github.com/manual/gh_help_environment), [cli/cli#2922](https://github.com/cli/cli/issues/2922)). bkit uses `gh auth login --with-token` with a differently-named `GH_BKIT_TOKEN` (`cloud-bootstrap.sh:56-64`); a placeholder `GH_TOKEN` beats it.
3. **Go-binary TLS/proxy trust** — [anthropics/claude-code#26466](https://github.com/anthropics/claude-code/issues/26466) (`x509: certificate signed by unknown authority`); `api.github.com` is allowlisted, so it's a trust/proxy-auth failure, not a domain block.
4. **Silent, non-blocking bootstrap** — `cloud-bootstrap.sh` swallows failure with `|| log`; SessionStart hooks can't block.

**Takeaway:** gh's auth is _fixable_ in mode 3 (use the sanctioned `GH_TOKEN` env var, fix CA/proxy trust, add a loud preflight) — so the answer is **harden gh + fall back to MCP when it's still unavailable**, not abandon gh (the MCP downsides in §5 are why).

---

## 3. Observed deviations (tagged by mode)

**D1 — `[skip ci]` leaked into the squash-merge _body_ → CI suppressed on `dev`.** _(mode 3)_
Ship of **#703**: 16 commit messages concatenated into the merge body; one was `chore(690-header-nav-shell): worktree-setup bkit [skip ci]`. Actions scans subject **and** body, so `dev` ran no CI. **Chain:** gh unauthed (D2) → ad-hoc MCP `merge_pull_request` substitution → MCP ignored the empty `commit_message` (confirmed: no force-empty-body) → default concatenated body carried the token. Step 6.3 (`bkit-ship.md:537`) scans only the **PR title**; the backstop (`bkit-ship.md:557`) is a `gh run list`.

> **Mode-2 cousin:** default `GITHUB_TOKEN` writes **don't trigger CI** (`renovate.yml:41-44`) — why mode 2 writes via `GH_BKIT_TOKEN`/App.

**D2 — ad-hoc, unguarded tool substitution.** _(mode 3)_ gh and MCP auth independently, so cloud can have MCP-up / gh-down. Today the only gh-outage branch is `gh-error → abort` (`bkit-build.md:1301`, `bkit-debug.md:1024`), so when an agent _does_ improvise a fallback it's **uncontrolled** (→ D1). **Fix: replace ad-hoc improvisation with an explicit, mapped, rule-governed fallback** (§6), not a ban.

**D3 — worktree model vs. single session branch.** _(mode 3)_ `git worktree add .worktrees/{FID} feat/{FID}` + "`pwd` outside worktree → Failure Path" (`bkit-ship.md:30`); claude.ai session has no `.worktrees/`.

**D4 — FID coupled to the `feat/` branch name.** _(mode 3)_ `bkit-auto.md:86-87` rejects non-`feat/` branches (`FID="${BRANCH#feat/}"`); ship 2.4 (`bkit-ship.md:219`) + `bkit-cloud.yml` too. Plus the proxy restricts `git push` to the current branch, so `git push origin dev` / `feat/{FID}` push / `--delete` fail — **infrastructure, not policy**.

**D5 — `sleep`-based CI polling stalls.** _(mode 3)_ bkit polls CI with `sleep` (`bkit-ship.md:556` `sleep 30`; build/debug gates too); the claude.ai Bash tool **blocks foreground `sleep`** → needs a condition/event-driven wait.

---

## 4. Secondary breakage (mode 3)

- **`/bkit-debug` egress blindness** — external-CLI/backend fetches behind Trusted egress self-skip `exit 0` → silent "no runtime errors" (`.agents/config.md:18-126`, `bkit-debug.md:551-565`). Fix = allowlist + loudness.
- **e2e Playwright-report artifact seam** — `bkit-debug.md:528` `gh run download -n playwright-report`; **no MCP artifact-download tool**. Failure signal is in job logs (`get_job_logs`); only the rich report is lost.
- **Hard-coded macOS paths** — `docs/plans/template.md:191`, `.agents/skills/using-git-worktrees/SKILL.md:191`.

---

## 5. Downsides of GitHub MCP (why it's a fallback, not the default)

Research on the GitHub MCP server surfaced three real cost centres — the reason we do **not** standardise on it for the gh-covered surface:

**5a. Security — the "lethal trifecta" prompt-injection.** Invariant Labs (May 2025) showed a malicious **public** issue with hidden instructions can hijack an agent that later reads issues with a broad token into pulling **private**-repo data and exfiltrating it via its response. Described as **architectural, "no obvious fix."** bkit hits all three legs: `issue-scan` reads untrusted issue **bodies + comments**, holds a broad **`GH_BKIT_TOKEN`** write PAT, and can act (PR/commit/merge). _(Not strictly MCP-vs-gh — a gh agent reading the same issue is equally exposed — but it's a first-class constraint now.)_ **Mitigation: narrowest-scoped token + treat all tracker/PR/comment content as untrusted; never let it steer git/merge actions.** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Simon Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](``https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/``)

**5b. Context / token bloat.** ~93 tools ≈ **55k tokens** of schema; quality degrades past ~50 tools; verbose payloads are brutal (a 50-item list ≈ 100k tokens). _Mitigated here_ by deferred/searchable tools (ToolSearch) + toolset scoping + `minimal_output`, but response verbosity still costs on every call. [github-mcp-server#1286](https://github.com/github/github-mcp-server/issues/1286) · [getunblocked](https://getunblocked.com/blog/github-mcp-token-cost/) · [anthropics/claude-code#13717](https://github.com/anthropics/claude-code/issues/13717)

**5c. Reliability, cost, debuggability.** Remote MCP fails on **TCP timeouts** (one benchmark: 7/25 ≈ 72% vs gh CLI 100% — gh runs locally); ~**$55/mo vs ~$3** at 10k ops; MCP failures are **opaque** (no exit code/stderr to branch on) — friction for bkit's bash `|| Failure Path` gates. This **qualifies our earlier "MCP is the reliable lane"**: it's reliable on _auth_ in mode 3, but adds a remote-timeout failure mode gh doesn't have. [mariozechner](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) · [Scalekit](https://www.scalekit.com/blog/mcp-vs-cli-use)

---

## 6. Direction (settled: gh primary, MCP fallback — details to investigate)

> **REVERSED from an earlier draft's "MCP everywhere."** gh remains **primary** for PR / CI / merge / repo-identity (correct `--body ""` merge semantics that avoid D1, local, debuggable, cheap, no MCP injection/verbosity amplification). MCP is a **controlled fallback**, only when gh is unavailable.

**6a. Harden gh in mode 3** so the fallback is rarely needed: prefer the sanctioned **`GH_TOKEN` env var** over `gh auth login --with-token`; fix Go-TLS/CA + proxy trust; add a **loud preflight** `gh auth status` (fail explicitly, never silent).

**6b. Global gh→MCP fallback rule (workflow header).** A single additive rule (not per-call rewrites): _"If a `gh` command is unavailable/unauthed, use the mapped MCP tool below; **retry with backoff** on timeout; request **minimal output**. The **merge** fallback MUST pass an explicit skip-token-free `commit_message`."_ This converts D2's dangerous improvisation into a deterministic, mapped path.

**6c. gh → MCP tool map** (reference):

| gh command                                      | MCP fallback                            | Notes                                                          |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `gh repo view --json nameWithOwner`             | `get_me` + context / parse `git remote` | identity                                                       |
| `gh pr create`                                  | `create_pull_request`                   |                                                                |
| `gh pr view {N} --json …`                       | `pull_request_read` (get)               | request minimal fields                                         |
| `gh pr list --head X`                           | `list_pull_requests`                    |                                                                |
| `gh pr merge {N} --squash`                      | `merge_pull_request`                    | ⚠ **pass explicit skip-free `commit_message`** (D1)            |
| `gh pr edit {N} --title`                        | `update_pull_request`                   |                                                                |
| `gh pr update-branch {N}`                       | `update_pull_request_branch`            |                                                                |
| `gh run list --branch X`                        | `actions_list`                          |                                                                |
| `gh run view {id} --json jobs` / `--log-failed` | `actions_get` / `get_job_logs`          |                                                                |
| `gh run download -n playwright-report`          | **— none —**                            | keep gh/`gh api` (§4 seam)                                     |
| `git push origin dev` (docs/status tail)        | `push_files` / `create_or_update_file`  | mode-3 only (git push to `dev` blocked); or land via PR (#134) |

**6d. D1 fix (all paths):** guarantee a skip-token-free merge body and extend Step 6.3 to scan the **resulting squash body**, not just the PR title; consider dropping `[skip ci]` from intermediate status-commit **subjects**.

**6e. Any-branch support:** _adopt-or-mint_ — if already on a non-`dev` working branch, adopt it (no worktree); else mint `feat/{FID}` (+ worktree). Requires **decoupling FID from the branch name** (`bkit-auto.md:86-87`, ship 2.4, `bkit-cloud.yml`).

**6f. Security constraint (first-class, all modes):** narrowest-scoped token; treat tracker/PR/comment content as untrusted.

**6g. Deferred — N2** (subagent fan-out vs shared account rate budget, [docs Limitations](https://code.claude.com/docs/en/claude-code-on-the-web)): revisit only if hit; fix would be mode-tuned concurrency pacing.

**6h. #134 stays optional** — the only op that truly can't be gh in mode 3 is the `git push origin dev` docs/status tail (it's git, not gh, and the proxy blocks it). Handle via the `push_files` fallback **or** by landing status/docs through the PR (#134) — but #134 is not _forced_.

**6i. Trackers stay on MCP (resolved — was §8.2).** Because the gh-primary **+ MCP-fallback** model keeps the GitHub MCP server **present anyway** (6b needs it), converting the `github` tracker blocks to `gh` would remove **no** surface (the server can't be dropped) while **losing** three real benefits:

- **Provider symmetry** — every tracker call site is a `github`/`linear` pair; **Linear is MCP-only (no CLI)**, so "everything is an MCP call" is what keeps the two providers uniform (`.bkit/trackers.md`). gh-ifying GitHub breaks the pair model + the `bkit-trackers.ts` resolver.
- **Rich markdown bodies** — MCP takes issue/comment bodies as **structured strings**; `gh` needs fragile shell-escaping for bkit's multi-line summaries/handoff blocks/comments.
- **Cleaner Projects v2** — `projects_write` vs hand-written `gh api graphql`.

Security is neutral (reading untrusted issue content is a risk with `gh` too — mitigated by 6f regardless). → **Keep tracker ops (issue/label/comment/search/projects) on MCP.** The gh→MCP fallback (6b) applies only to the gh-covered PR/CI/merge surface.

---

## 7. Prerequisites & seams (implementation-time)

- **Branch protection on `dev`** must permit the autonomous merge (status-checks-only, no required human review).
- **Head-branch cleanup has no MCP tool** (`merge_pull_request` has no `delete_branch`) → rely on the repo **"Automatically delete head branches"** setting.
- **D5:** replace `sleep` CI-polling with a condition/event-driven wait.
- Cleared non-issues: `npm.pkg.github.com` **is** allowlisted; the full MCP write surface **is** present in mode 3 (so the fallback is viable).

---

## 8. Open decisions / to investigate

1. **Investigate the gh→MCP fallback mechanism** (6b/6c) end-to-end: detection of "gh unavailable," retry/backoff shape, minimal-output patterns, and how the mapped MCP calls fit bkit's bash-gate control flow.
2. **Artifact seam:** job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception?
3. **`dev` config:** confirm branch protection allows the autonomous merge; enable auto-delete-head-branches.

_Resolved: "do GitHub trackers also move off MCP?" → **no**, keep on MCP (see §6i). "gh vs MCP per mode" → gh primary + MCP fallback (§6). N2 → deferred (§6g)._

---

## Evidence

- **Repo:** `cloud-bootstrap.sh:56-64`; `bkit-ship.md:30,219,537,556,557`; `bkit-auto.md:86-87`; `bkit-build.md:1301`/`bkit-debug.md:1024`; `bkit-debug.md:528,551-565`; `.agents/config.md:18-126`; `.bkit/trackers.md`; `renovate.yml:41-44`; `claude.yml:40`; `knowledge.jsonl` KN-CORE-1; `decisions.jsonl` (Claude-App/OIDC cloud tracker auth).
- **Docs (Claude Code on the web):** proxy restricts push to current branch; token never in container; `GH_TOKEN` env for gh; Trusted allowlist incl. `api.github.com` + `npm.pkg.github.com`; 30 GB disk; snapshot caches files-not-processes; shared account rate limits.
- **External:** [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) · [sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) · [gh precedence](https://cli.github.com/manual/gh_help_environment) · [cli/cli#2922](https://github.com/cli/cli/issues/2922) · [claude-code#26466](https://github.com/anthropics/claude-code/issues/26466) · **MCP downsides:** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](``https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/``) · [github-mcp-server#1286](https://github.com/github/github-mcp-server/issues/1286) · [getunblocked](https://getunblocked.com/blog/github-mcp-token-cost/) · [mariozechner](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) · [Scalekit](https://www.scalekit.com/blog/mcp-vs-cli-use)

_Working session record. §6 is the settled direction (fallback details to investigate, §8); not yet scoped into tasks._

### Comment — @cbartens (2026-07-14T11:21:47Z)

**Relationship to #134 — kept separate on purpose.**

#134 stays open as an **independent, mode-agnostic** decision: where the design→plan→build→ship artifact trail + `status.json` live — on `dev` early (status quo **A**) vs. on the feature branch via the PR (**B**). Its live tension is rebase churn over the weeks-long design→build gap vs. design/plan docs being searchable on `dev` before ship.

This issue (§6h) deliberately **does not force** that decision: the mode-3-blocked `git push origin dev` docs/status tail is handled by the `push_files` API fallback, so cloud support works with status quo A unchanged. The two issues intersect only at that single transport point — #134 is neither a blocker for nor a dependency of the cloud work here.

---

_Generated by [Claude Code](https://claude.ai/code)_

### Comment — @cbartens (2026-07-14T12:03:56Z)

## Update (2026-07-14): current code already branch-isolates every phase — re-scopes §1 and §6

Re-checked against the live source (`.bkit/workflows/*.md`). **§1's table is stale** on one load-bearing row, and it changes the approach.

### Correction to §1

> **§1 says:** _"design + plan (mode 1) run on the `dev` working copy — no worktree, no branch."_

**False in the current code.** Shipped via **#209** §3 ("design/plan feat-locate") + **#234** (NDJSON `status.jsonl`), design and plan now behave like build:

- Mint a **worktree + `feat/{FID}` at Step 2**, rebased on `origin/dev` — `bkit-design.md:216-229`, `bkit-plan.md:220-233`.
- Commit `status.jsonl` + docs **per-step on `feat/{FID}`**, _"NO mid-lifecycle `dev` push"_ — `bkit-design.md:27`, `bkit-plan.md:27`.
- **Close Workflow = local squash-merge to `dev` + delete branch** — `git merge --squash -X ours feat/{FID}` → `docs({FID}): design DONE bkit [skip ci]` → `git push origin dev` → delete (`bkit-design.md:795-810`, `bkit-plan.md:786-792`).

So it's a **per-phase ephemeral branch**: mint from `dev` → work isolated → squash-merge to `dev` → delete → next phase re-mints. build→debug→ship remains the one persistent PR branch.

### How this changes the approach

**1. D3 (worktrees) is now an every-phase problem, not just build/ship.** §1 assumed design/plan were worktree-free on `dev`. They're not — `git worktree add .worktrees/{FID}` runs in **design and plan** too, and worktrees break on the claude.ai runner. So the worktree-independence work (adopt-or-mint, §6e) must cover **all five phases**, not just the build-side ones §3 called out.

**2. The mode-3-blocked op is now concentrated and named: the phase-close merge.** Because everything mid-phase commits to `feat/{FID}` (= the current working branch, which the proxy _does_ let you push), the **only** proxy-blocked git op per phase is the Close Workflow's local `git merge --squash` + `git push origin dev` (`bkit-design.md:801,806`; `bkit-plan.md:792`). That's one point per phase, not per-status-write.

So the §6c fallback for the `dev` tail shifts:

- **Was framed as:** `git push origin dev` (docs/status tail) → `push_files`/`create_or_update_file`, per write.
- **Now is:** replace the per-phase **local squash-merge** with a **PR-based merge** in mode 3 — open a `feat/{FID}` → `dev` PR at Close Workflow and merge it via `gh` (primary) / `merge_pull_request` (fallback, explicit skip-token-free `commit_message` per D1). The design/plan close becomes structurally the same as the build/ship close, which already merges via PR. That's _more_ uniform than a `push_files` special-case, and it folds the design/plan `dev`-landing into the same gh-primary + MCP-fallback path as §6b/§6c.

**3. #134 is closed (not planned).** The branch-isolation #134 proposed already shipped in a better shape (per-phase ephemeral branch — see the [close comment](https://github.com/cbartens/bkit/issues/134#issuecomment-4968593061)... updated there). So §6h / §8's "handle via `push_files` **or** land via PR (#134)" collapses: there's no separate #134 artifact-trail decision to defer to — the artifact trail is **already** branch-isolated per phase, and the residual is purely the phase-close merge transport, owned here.

**4. D1 (`[skip ci]` in merge body) surface shrinks but stays relevant.** Each phase now lands as **one** squash commit whose subject carries `[skip ci]` (`docs({FID}): design DONE bkit [skip ci]`). Fewer intermediate `[skip ci]` commits on `dev`, but if a design/plan close ever merges via a PR (per change #2 above), the D1 body-scan guard (§6d) must extend to the **design/plan** close paths too, not just ship.

### Net re-scope

- §1 table: flip the design/plan row to "worktree + ephemeral `feat/{FID}`, per-phase squash-merge to `dev`."
- §6e: worktree-independence covers all five phases.
- §6c/§6h: the `dev`-tail fallback is a **PR-based phase-close merge** (design/plan close mirrors build/ship close), not per-write `push_files`; drop the #134 optionality (closed).
- §6d: extend the skip-token-free merge-body guard to the design/plan close paths.

Everything else in §6 (gh primary + MCP fallback, harden gh auth in mode 3, D5 sleep-less CI wait, security §6f, trackers stay on MCP §6i) is unchanged.

---

_Generated by [Claude Code](https://claude.ai/code)_

### Comment — @cbartens (2026-07-14T12:16:05Z)

## Updated scope: minimum top-level changes for the claude.ai runner (mode 3)

Consolidating §6 into a concrete, ordered change-set, re-based on the [current per-phase-branch code](https://github.com/cbartens/bkit/issues/341#issuecomment-4968936721). Frame per the guiding principle: **additive header rules gated on one mode flag — not a rewrite of call sites.** "Top level" = the `>` blockquote rule-block at the head of each workflow (`bkit-{design,plan,build,debug,ship}.md` + `bkit-auto.md`), plus `cloud-bootstrap.sh` and `rules.md`. Six changes, in dependency order.

---

### 0. Mode-detection anchor _(prerequisite, ~free)_

Everything branches on runtime; the primitives exist and are already used in `cloud-bootstrap.sh:26` (`CLAUDE_CODE_REMOTE=true` → mode 3; `GITHUB_ACTIONS`/`CI` → mode 2; neither → mode 1).
**Change:** add one header rule — **Runtime:** set `MODE` once at workflow start. This is the flag every rule below reads.

### 1. Harden `gh` auth + a _loud_ preflight (§6a)

`cloud-bootstrap.sh:61-63` already does `gh auth login --with-token` from `GH_BKIT_TOKEN`, but it's silent/non-blocking (`|| log`) and hits the env-precedence bug — a placeholder `GH_TOKEN`/`GITHUB_TOKEN` overrides the login (§2.2).
**Change:** prefer the sanctioned **`GH_TOKEN`** env over `--with-token`; add a header **gh-preflight** rule that runs `gh auth status` once and records `GH_OK=true|false` (loud, never silent). Makes "gh down" a known state, not an improvised one (kills D2's trigger).

### 2. Global `gh`→MCP fallback rule + tool map (§6b/6c) — _centerpiece_

Today the only gh-outage branch is `gh-error → abort` (`bkit-build.md:1301`, `bkit-debug.md:1024`), so any improvised fallback is uncontrolled — the exact chain that produced the D1 CI-suppression bug.
**Change:** one additive header rule — _"When `GH_OK=false`, use the mapped MCP tool below; retry with backoff on timeout; request minimal output; the **merge** fallback MUST pass an explicit skip-token-free `commit_message`."_ — plus the §6c map as a reference block. Applies only to the gh-covered PR/CI/merge surface; **trackers stay on MCP** (§6i). Converts D2's improvisation into a deterministic path and closes D1 by construction.

### 3. Any-branch _adopt-or-mint_ + FID decoupling (§6e) — _the biggest one_

Two mode-3 breaks converge: worktrees don't exist on the claude.ai runner (D3 — and per the code correction, **all five phases** now `git worktree add`, not just build/ship), and `bkit-auto.md:86-87` hard-rejects any non-`feat/` branch then derives `FID="${BRANCH#feat/}"` — the session is on `claude/…`, so it aborts (D4).
**Change:** a header **Branch model** rule — _adopt-or-mint_: if `MODE=3` (or already on a non-`dev` working branch), **adopt** the current branch and **skip `git worktree add`** (work in-place); else mint `feat/{FID}` + worktree as today. Plus **decouple the FID source from the branch name** — derive from the tracker/issue, not `${BRANCH#feat/}` (`bkit-auto.md:86-87`, ship 2.4, `bkit-cloud.yml`). The one change that touches each Step-2 setup, but still one rule + one FID-source swap.

### 4. Phase-close merge via PR instead of local squash-push (D4 + re-scope)

The proxy restricts `git push` to the current branch, so `git push origin dev` is blocked. After #3, mid-phase commits go to the adopted branch (allowed) — leaving **one** blocked op per phase: the Close-Workflow local `git merge --squash` + `git push origin dev` (`bkit-design.md:806`, `bkit-plan.md:792`; ship Steps 9-13 dev push, ship header line 8).
**Change:** in `MODE=3`, replace the local squash-merge with a **PR-based merge** — open a `feat/{FID}`→`dev` PR at close and merge via the rule-2 path (gh primary / `merge_pull_request` fallback). Makes design/plan close _structurally identical_ to the build/ship close that already merges via PR — more uniform than the earlier per-write `push_files`. Docs/status tail that can't ride a PR → `push_files` per the §6c map.

### 5. `sleep`-less CI wait (D5)

The claude.ai Bash tool blocks foreground `sleep`; bkit polls with it — `bkit-ship.md:556` (`sleep 30` then `gh run list`) + the build/debug CI gates.
**Change:** a header **CI-wait** rule — never foreground-`sleep`; bounded condition/event-driven poll of `gh run list --json status,conclusion`. Localized swap at ~3 sites, governed by one rule.

---

### Also required, but _not_ top-level (localized, §4)

Call-site fixes, listed so "works in mode 3" is honest:

- **Debug egress blindness** — fetches behind Trusted egress self-skip `exit 0` → silent "no runtime errors" (`.agents/config.md`, `bkit-debug.md:551-565`): needs a **Custom allowlist + loudness**.
- **Playwright report seam** — `bkit-debug.md:528` `gh run download -n playwright-report` has no MCP equivalent → fall back to job logs (`get_job_logs`); rich report lost.
- **Hard-coded macOS paths** — `docs/plans/template.md:191`, `using-git-worktrees/SKILL.md:191`.

---

### Net / sequencing

- **0-2** are cheap, additive, and unlock the rest (mode flag → gh preflight flag → mapped fallback).
- **3** (adopt-or-mint + FID decoupling) is the real structural lever — scope it first; it's the difference between "worktrees everywhere" and "runs on whatever branch the session is on."
- **4-5** fall out once **3** lands.
- Nothing rewrites phase logic: ~5 header rules gated on `MODE` + one FID-source change + 3 localized §4 fixes.

Open items unchanged (§8): fallback mechanism detail (backoff/minimal-output shape), artifact seam (job-logs-only vs one sanctioned `gh api`), `dev` branch protection + auto-delete-head-branches.

---

_Generated by [Claude Code](https://claude.ai/code)_

### Comment — @cbartens (2026-07-14T22:53:14Z)

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Comment — @cbartens (2026-07-14T22:56:45Z)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

### Comment — @cbartens (2026-07-14T23:06:29Z)

### Step 3 — Brainstorm & Ideate

### Comment — @cbartens (2026-07-14T23:15:49Z)

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v1-draft.md)

### Comment — @cbartens (2026-07-14T23:28:10Z)

### Step 5 — Design Review - Verdict: CONCERNS

### Comment — @cbartens (2026-07-14T23:40:01Z)

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v2-reviewed.md)

### Comment — @cbartens (2026-07-14T23:48:58Z)

### Step 7 — Design Organise - Verdict: CONCERNS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md)

### Comment — @cbartens (2026-07-14T23:55:09Z)

### Step 8 — Summary - Verdict: CONCERNS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-summary.md)

Verdict: CONCERNS

<!-- verdict:end -->

# Design Summary

## Overview

This design adds three-runtime workflow execution support to bkit: laptop (mode 1), GitHub Actions runner (mode 2), and claude.ai cloud session (mode 3). The core approach establishes a capability-table-based detection (`RUNTIME` → `CAN_WORKTREE`, `CAN_PUSH_DEV`, `CAN_SLEEP`, `GH_OK`) to branch control flow on what each runtime can do rather than what it is. Layer 0 (shim bash detection) feeds Layer 1 (CI-wait primitive extraction), Layer 2 (branch model: adopt-or-mint), and Layer 3 (invariant prose). Two close transports are adopted for shape A (docs-only): `git push origin dev` for modes 1–2, and `push_files` (GitHub MCP) for mode 3 — creating a design tension: mode 1 never exercises the mode-3 path, exactly how silent-failure incident D1 occurred.

## Design Quality

**Strengths:**

- Meticulously self-aware of trade-offs and risks. The design explicitly names its own worst accepted risk and records 9 named risks plus 3 open questions.
- Highly measured and evidence-based. Every claim about existing code is re-verified: STRAY guard, MODE collision, checkout-before-push sequencing, sleep counts, worktree assignments (6 sites, verified exact), structural ops (31 counted), marker parser, counter-bus idiom.
- Repair-first philosophy: each decision corrects a prior mistake (D21 state model, D23 rejecting `--dry-run` probe, D25 mechanical audit cross-check).
- Clear register boundaries: invariants (Layer 3) → prose; mechanism (Layer 0/1) → bash; procedure (Layer 2) → headers.

**Weaknesses & Gaps:**

- **Two central mechanism claims are contradicted by live code.** The shim state model (D21) assumes sourced variables survive Bash-call boundaries—they don't (35 `REPO_ROOT` re-derivations prove the opposite). The probe alternative creates a network round-trip × 34 per-block, exploding cost. **Spike A must settle this before build proceeds**; it is the fulcrum of Layer 0/1.
- **D5 (`push_files`) is demoted from "F1 resolution" to "co-equal candidate gated on Spike B".** Its claimed equivalence to `git push` is withdrawn as false on four counts: payload (193 KB inlined, §5b token bloat), conflict semantics (branch-wins server-side vs dev-wins locally — opposite of `-X ours`), STRAY tautology (guard must run over unfiltered diff first), and canonical assert (must use `get_file_contents`, not local `git show`). Only one of the four (D1 closure via explicit message) is verified. The other three are either repaired in Flow 4 (requiring extra assertions) or unrepaired (payload inversion).
- **Three load-bearing decisions have no owning spike.** The design states "Two spikes close all four pre-build decisions"; it does not. Spike A closes (2) + (4); Spike B closes (3); **D26 (which MCP server)—marked with `[!CAUTION] Build must not proceed on §6 as written`—closes none of them.** WS-2 was created to fill the gap. Guessing wrong on D26 invalidates §6c wholesale and leaves #341's centrepiece change (the fallback lane) unreachable in mode 3.
- **Credential coupling breaks the fallback premise (D26).** Both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`. If mode 3 withholds that token (the very reason gh is flaky in §2), then MCP fails too — `GH_OK=false → use MCP` is a fallback that dies with the thing it rescues.
- **Every layer couples work in the same files.** WS-8/11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Repo doctrine forbids concurrent workflows on one clone, so designs must be serialized at landing.
- **D7 integration coupling is larger than named.** "Adopt-or-mint + the pwd-outside-worktree rule" is 2 items; the actual integration is **13 coupled sites across 3 classes** (Placeholders definition, 5 gate items, 3 Worktree-removed items), all same-commit. A builder reading D7 only will miss 11 of them.
- **Discovery risk is high on adoption of mode 3.** The first real mode-3 run exercises all of WS-6 (detection), WS-8 (CI-wait), WS-9 (branch model), WS-11/12/13 (all three close shapes), WS-14 (fallback lane), WS-15 (peripherals). No CI can pre-exercise the mode-3 code path without a live mode-3 session, which is exactly the rot risk the design identifies.

## Acceptance Scenario

Narrative: A developer runs any phase (design/plan/build/debug/ship) from laptop, runner, or cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec: **PASS (content)** — narrative, success criteria (7), and key edge cases (6) all present and well-reasoned. **HOWEVER: Success Criterion 1 is aspirational, not guaranteed** — "mode-1 non-regression verified by a real end-to-end run, not a rule-text-presence test" depends on WS-16 executing, which is terminal to the plan and cannot validate the design itself.

## Breaking Changes

**API surface changes:**

- New `RUNTIME` flag + 4 `CAN_*` flags in workflow contexts. Existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80` is unaffected (D1 collision avoided by renaming).
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (no new artifact; existing NDJSON #234).
- FID resolution reordering (D9): marker-primary, branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject).
- `WORKTREE_PATH` becomes conditional (mint-or-adopt) instead of unconditional; mint case unchanged.

**Prose changes (user-facing):**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships.
- Adopt mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items.

**None of these break existing consumers on modes 1–2; mode-3-specific paths are additive.**

## Feasibility

**Spike-gated critical path:**

- **Spike A (D21, D22 state + sleep semantics)**: 2h observation. Blocks all of Layer 0/1. **Predicted to show sourced state does NOT survive Bash-call boundaries; current cost model is wrong.** High impact on implementation.
- **Spike B (D5 `push_files` against protected dev)**: 3h observation. Blocks shape-A transport selection. **Predicted to show payload acceptance and conflict semantics are inverse of `-X ours`.** May demote D5 to never-primary.
- **Spike C (D26 which MCP server)**: Observation from live mode-3 session. Blocks §6 map authoring. **Undiagnosed; hardest gate.** May discover MCP server or credential scope differs from assumption.

**Implementation feasibility if spikes return expected:**

- Layer 0 (detection shim): **HIGH** — sourcing idiom exists (counter-bus); bats precedent (tests/counter-bus.bats).
- Layer 1 (CI-wait extraction): **HIGH** — measured (7 sleeps in 4 constructs); test rewrite is overhead, not blocker.
- Layer 2 (adopt-or-mint): **MEDIUM-HIGH** — 13 coupled sites, same-commit constraint; branch model logic is uniform (spot-checked).
- Layer 3 (invariant prose): **HIGH** — 4 sentences into `rules.md`; no new mechanism.
- Shape A close (D5 or D5(a)): **MEDIUM** — depends on Spike B outcome. If D5(a) (PR-close), §6d scope (dropping `[skip ci]` from status-commit subjects) becomes prerequisite, not option — unbudgeted scope.

**Discovery risk:** Mode-3 code is exercised only by WS-16's real end-to-end runs, not by CI or review. Silent-failure incident D1 is the proof that prose-only verification fails.

## Synthesis Coverage

**Brainstorm produced 3 ideation streams; synthesis kept these shapes:**

1. **Ideate-1 A** (sourced shim + thin pointers) → **KEPT, D21 state model repaired**. Enables testable detection; reuses counter-bus idiom.
2. **Ideate-3 A** (capability table) → **KEPT**. Runtime is input to one table, not predicate at call sites; matches `bkit-preflight.ts:1135`.
3. **Ideate-2 A** (bash-readable artifact for MCP outcomes) → **MERGED into D13/D25**. Reused `status.jsonl` instead of sentinel schema; keeps "no new artifact type" constraint.
4. **Ideate-2 B** (shell-native MCP CLI shim) → **REJECTED, deferred**. New-tooling investment; best long-term shape but out of guiding principle scope.
5. **Ideate-1 C / Ideate-3 C** (uniform PR-close in all runtimes) → **REJECTED as uniform, D5(a) promoted to co-equal for shape A**. Breaks mode-1 constraints (offline, instant, no network), but PR-close shape returns when `push_files` payload/conflict becomes blocker.

**Good options dropped intentionally:**

- Render-time mode gating (D14 REJECTED): `bkit-trackers.ts:1` resolves at install-time; runtime unknown then.
- `--dry-run` probe (D23 REJECTED): Fails dangerous — sends no ref-update, pre-receive hook never fires, branch protection never evaluated. False-positive `CAN_PUSH_DEV=true` leads to `git checkout dev` on live session (D6, Risk 1).
- Cache file for state (D21 rejected alternative): New artifact, forbidden by D13 constraint.

## Scope Alignment

**Original brief (#341):**

- Make workflows run in all three runtimes (✓ in scope).
- End-to-end in each runtime (✓ in scope as WS-16).
- When gh is unavailable, use sanctioned fallback (✓ in scope, but D26 unresolved).

**Creep detected and managed:**

- **D20 (macOS path coupling)**: Reframed as shipped consumer bug (not mode-3 issue), kept in scope but not gated behind mode-3 milestone.
- **D7 (13 coupled sites, not 2)**: Correctly identified and called out; increases same-commit risk.
- **D26 (MCP server decision)**: Not in brainstorm, added because "two spikes close all four" is false.
- **WS-2 (Spike C)**: Not in original decomposition, added to own the unowned D26.

**Scope is disciplined.** The largest unbudgeted item is §6d (drop `[skip ci]` from status-commit subjects if D5(a) wins), which only materializes on one branch of the D5 fork and is explicitly named.

## Risks

**Nine named risks (design owns 3–5 structural mitigations):**

1. Detection misfire (env var absent) → false `CAN_PUSH_DEV=true` → checkout on live session: **Mitigated by D23 double-guard + reversible checkout** (structurally, not by probe accuracy).
2. Shim becomes load-bearing for 6 workflows; must be side-effect-free: **Mitigated by Flow 1 post-source assertion** (distinct message for unset vs false).
3. Blocked-`sleep` hang produces **zero observability**: **Mitigated by `timeout`-wrapped caps** (mechanism survives blocked primitive); **Spike A must confirm platform errors rather than blocks**.
4. Repo settings (branch protection, auto-delete-head-branches) invisible to git, break autonomous close: **Mitigated by committed assertion in close path** (`:806` already fails loudly); **dependency written into `docs/deployments.md`** (not a Step-1 preflight—lacks admin scope).
5. Flags set but read nowhere; magic-number duplication: **Mitigated by vitest prose audit** (not behaviour test; presence grep for `CAN_*` readers and foreground sleeps).
6. Extra MCP calls widen lethal-trifecta surface (§5a): **Adjacent to #342**; D13's max-1 gh→MCP bound is real mitigation; do not duplicate #342's scope.
7. Mode-1 non-regression (worst outcome: mode 1 never exercises mode 3's path): **Mitigated by real end-to-end run** (not rule-text-presence test; this is D1's exact aetiology).
8. `core.bare` flip rides along in close block (laptop-specific workaround): **Decided: leave unconditional** (no-op where already false; gating adds branch for zero gain).
9. `push_files` conflict inversion (branch-wins server-side vs dev-wins locally): **Mitigated by dev-head-unmoved precondition** (narrower than `-X ours`; only if D5 survives Spike B). **Biggest accepted risk**: two transports, mode 1 never exercises mode 3, silent divergence if heads collide.

**Spike-owned risks:**

- Spike A (D21): Predicted sourced state doesn't survive Bash-call boundary; re-probe × 34 explodes cost.
- Spike A (D22): Predicted platform errors on `sleep`; if blocked, hang produces zero observability.
- Spike B (D5): Predicted `push_files` payload accepted; conflict inversion confirmed; can be preconditioned away.

## Action Items

Design is **NOT ready for planning** in its current state. The following must be resolved before `/bkit-plan`:

1. **Spike A MUST run before building Layers 0/1.** Resolve:
   - Does sourced state survive Bash-call boundaries? (Predicted: no; current cost model is wrong.)
   - Per-block re-derivation price: time `bkit_runtime_detect` ×34.
   - Does mode-3 harness **error** on `sleep` or **block**? (If block, Risk 3 hang is real; yield branch mandatory.)
   - Does harness inspect command strings? (If yes, sourcing `sleep` in shim evades guard — shim defeats its own protection.)

2. **Spike C (D26) MUST establish which MCP server serves mode 3 under which tool names, before WS-2/14 author anything.**
   - Establish whether reachable GitHub MCP is `.mcp.json`'s `github` server (needs `GH_BKIT_TOKEN` in-sandbox) or claude.ai's proxy-brokered built-in (different names).
   - Resolve credential coupling: both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`; if mode 3 withholds it, `GH_OK=false → use MCP` fails with its own trigger condition.
   - Enumerate actual tool names; every `mcp__github__*` name in §6c is provisional.

3. **Spike B (D5) MUST measure `push_files` before WS-13 author adopts D5 or D5(a).**
   - Confirm payload acceptance (193 KB / 9 files on GitHub MCP `push_files` against protected dev).
   - Confirm conflict semantics: does `push_files` write unconditionally (clobbering concurrent dev edits) or respect dev head unmoved precondition?
   - If D5 survives, Flow 4's prologue (STRAY guard, dev-head-unmoved check, explicit message, `get_file_contents` re-read) is load-bearing.
   - If D5 rejected, D5(a) (PR-close + drop `[skip ci]`) becomes primary, making §6d scope (status-commit subjects) prerequisite, not option.

4. **D7 (13 coupled sites) scope clarification for WS-9.** Ensure builder knows all three site classes (Placeholders definition × 5 files, gate items × 5, Worktree-removed × 3) must ship in one commit; silent partial implementation breaks adopt mode on every step.

5. **Mode-3 integration risk: WS-16 real end-to-end run is the only guarantee that consumption honours flags.** CI cannot pre-exercise mode-3 code path. Accept that Success Criterion 1's "verified non-regression" rests entirely on WS-16.

6. **Two file-level concurrency hazards must be serialized at landing.** WS-8 + WS-11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Order and batch to prevent checkout conflicts.

## Outstanding Questions

- **OQ1: Playwright artifact seam (§8.2)**: Job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception? No MCP artifact-download tool exists; only the rich report is lost, not the failure signal. — **Recommended:** Job-logs-only is acceptable; adjust test expectations in WS-15 to not require rich artifacts from mode-3 runs.

- **OQ2: Narrow tracker read-path corroboration (§6i)**: Should `§6i` admit narrow `gh` read fallback for private repos outside MCP? D12 says no (doctrine forbids `gh` for tracker ops); corroborate within MCP instead. If MCP-internal corroboration proves unreliable (which D12's note explains it may), revisit. — **Recommended:** Stick with D12 (MCP-internal corroboration only). If live fallback frequency shows corroboration fails, open a follow-up; don't pre-guess. Root cause of `search_issues` zero on private repos is undiagnosed (OQ3).

- **OQ3: MCP `search_issues` zero on private repos**: Is this bkit-side config/scope or upstream MCP bug? Undiagnosed; logged in `docs/failures.jsonl`, `.bkit/friction.jsonl`. — **Recommended:** Open a separate diagnosis task post-ship. D12 mitigates the symptom (mark zero as inconclusive, corroborate via `list_*` call, log as distinct state); the root cause investigation is out of scope here.

- **OQ4: Which of 4 `CAN_*` flags earn their keep?**: `CAN_SLEEP` is structurally weakest (cannot obey D2, harness-policy-gated, unprobeable from bash); turn-yield alternative needs validation it doesn't degenerate into rate-limited tight-looping. — **Recommended:** Run Spike A's sleep-semantics probe. If harness blocks (not errors), yield branch becomes mandatory; measure whether counter-bus-based cross-turn yielding can bound the poll without degeneration. If it can, `CAN_SLEEP` earns keep; if not, fallback to pure prose prose-per-attempt orchestrator loop.

- **OQ5 (not adopted, recorded to not silently drop)**: Periodic `bkit-analysis` pass summarizing `transport-fallback` frequency against `GH_OK=false` runs. Proposed in review as ongoing reader of new rows. **Recommended:** Defer. D25 gives the rows a mechanical reader inside Close Workflow (part of design scope). Analysis/aggregation is new feature; revisit if fallback frequency becomes operational concern post-ship.

## Suggested Workstreams

**Decomposition is intricate.** Four roots (WS-1, WS-2, WS-4, WS-5); three spikes plus 16 workstreams; explicit ordering hazards and coupling constraints.

**Key sequencing notes:**

- WS-1 (Spike A) blocks Layers 0/1 (WS-6, WS-8).
- WS-2 (Spike C, D26) blocks WS-14 (fallback lane) and WS-3 (Spike B) payload/server assumptions.
- WS-3 (Spike B) blocks WS-13 (shape A close) transport selection (D5 vs D5(a)).
- WS-4 (FID reorder) is prerequisite to WS-9 (adopt-or-mint, needs marker-primary FID).
- WS-6 (shim) is prerequisite to WS-7/8/9/10/14/15 (all consume `CAN_*`).
- **WS-10 (close-guard kernel D23/D24/D25) is deliberately ordered early** (depends only on WS-6) and **off Spike-B critical path** — it mitigates the design's biggest accepted risk (mode 1 never exercises mode 3) regardless of which transport wins, so deferring it until D5 fork resolves would be the single most damaging sequencing error.
- WS-13 is not one workstream: it is a fork (D5 vs D5(a), spike-gated); each branch has different scope.

**Workstreams WS-1 through WS-16 as designed are dependency-clear; no step 9 (sub-issues) is planned since FID carries no MILESTONE label.**

## Recommended Next Step

```
/bkit-plan 341

Brief: Design ready for planning phase subject to three pre-build decision spikes (A, B, C). Spike A (shim state model, sleep semantics) is critical path and highest discovery risk; settles Layer 0/1 feasibility. Spike C (which MCP server) unowned in original design; hardest gate for #341's centrepiece change (#2 fallback lane). Spike B confirms D5 viability; if rejected, activates unbudgeted scope (§6d, PR-close + drop `[skip ci]` from status-commit subjects). All three spikes must return before WS-3/6/14 author code. Mode-3 code exercised only in WS-16 real end-to-end runs; CI pre-exercise impossible. Adoption of mode 3 carries highest mode-1 regression risk since the transport-specific paths diverge (D1's exact aetiology). See design file for 26 decisions, 9 risks, 5 open questions (3 non-blocking), 7 success criteria (1 aspirational pending WS-16).

Design doc: docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md
```

### Comment — @cbartens (2026-07-15T00:48:48Z)

### Step 10 — Close Workflow

Artifacts:

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-design.md)
- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-1.md)
- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-2.md)
- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-3.md)
- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-input.md)
- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-review-1.md)
- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-review-2.md)
- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-summary.md)
- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v1-draft.md)
- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v2-reviewed.md)
- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md)

Landed on `dev` as `e867af74` — `docs(341-three-runtimes): design DONE bkit [skip ci]`.

### Comment — @cbartens (2026-07-22T07:16:07Z)

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None (this issue's own design closed as `341-three-runtimes`)

### Comment — @cbartens (2026-07-22T07:22:31Z)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

### Comment — @cbartens (2026-07-22T07:36:15Z)

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v1-draft.md)

### Comment — @cbartens (2026-07-22T07:38:09Z)

### Step 4 — Fetch Context

[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-failures.md)

### Comment — @cbartens (2026-07-22T07:45:01Z)

### Step 5 — Review Plan - Verdict: CONCERNS - Failures: 1

### Comment — @cbartens (2026-07-22T07:54:32Z)

### Step 6 — Apply Review - Verdict: PASS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v2-reviewed.md)

### Comment — @cbartens (2026-07-22T07:57:53Z)

### Step 7 — Scope Check - Verdict: CONCERNS - Failures: 3

### Comment — @cbartens (2026-07-22T08:02:48Z)

### Step 8 — Apply Scope - Verdict: CONCERNS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v3-checked.md)

### Comment — @cbartens (2026-07-22T08:08:13Z)

### Step 9 — Complexity Check - Verdict: SPLIT

### Comment — @cbartens (2026-07-22T08:20:48Z)

### Step 10 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md)

### Comment — @cbartens (2026-07-22T08:26:14Z)

### Step 11 — Summary - Verdict: PASS

[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-summary.md)

Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

This plan implements three-runtime support (#341) for bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) plus `bkit-auto`, enabling execution on laptop (mode 1), GitHub Actions runner (mode 2), and claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`). The approach is minimal and additive: a single runtime shim (`bkit-runtime.sh`) emits a 4-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on these flags; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). **Plan consists of 16 tasks (T1–T16) organized into 6 sequential sub-plans** following a dependency DAG (T1–T5 → T6–T7 → T8–T9 → T10–T13 → T14–T15 → T16). **Three pre-build decision spikes (A/B/C) have been run and closed**; findings folded into the design (design-addendum-spikes.md). The plan directly implements the settled design (verdict CONCERNS, `docs/plans/202607/341-three-runtimes-design.md`).

## Plan Quality

**Strengths:**

- Disciplined dependency DAG with explicit serialization constraints (repo forbids concurrent workflows on one clone)
- Each sub-plan is self-contained with clear "Depends on" and "Feeds" relationships
- Four successive verification gates (Prerequisites, Code Implementation, Testing & Documentation, Automated Verification) per sub-plan
- Honest about testing limits: detection + presence tested by bats/vitest; consumption verified only by live runs (design's "honest limit" D3)
- Coupled files explicitly called out with serialization notes (e.g., T7 shared with Sub-Plan 3; T10/T11 with Sub-Plan 2)
- Contingency handling for open questions: OQ-A (transport D5(a) vs D5) explicitly picks whether T12 exists; if D5 selected, T12 dropped and T13 swapped
- Spike findings (A/B/C) are folded, not re-planned

**Weaknesses & Edge Cases:**

- High discovery risk on mode 3: the first real mode-3 run (WS-16 / Sub-Plan 6) exercises all of WS-6/8/9/11/12/13/14/15; no CI pre-exercise possible (this is exactly D1's aetiology — the silent CI-suppression bug that justified the whole effort)
- Integration coupling: 13 sites in one commit for T8 (adopt-or-mint); if partial, adopt mode breaks on every step
- Three live residuals from closed spikes remain (sleep block-vs-error, which MCP server in mode 3, push_files reject-vs-clobber on moved `dev` head) — settled only by WS-16 run
- Line anchors are acknowledged as stale (verified drift: `git push origin dev` now ~:840 in ship, `core.bare` flip ~:816; no `sleep 30` at `:556`); re-grep required at build
- Design's verdict was CONCERNS (not PASS); plan inherits those concerns

## Completeness

**Coverage:**

- All 16 tasks (T1–T16) explicitly mapped to sub-plans
- Derived Test Matrix: 16 rows, one per task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12 conditional, 13→T5, 14–15→T16, 16→T15). No uncovered row; no duplicated row.
- Test types: bats (integration, real subprocess/git), vitest (unit + in-process integration), manual verification (@live)
- Mitigations present for all 9 design-named risks; risk window identified (mirror regen must follow any `.bkit/` source revert)

**Documentation:**

- Each sub-plan carries `Documentation Updates` rows mapped to `docs/deployments.md`, `docs/testing.md`, `docs/observability.md`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`
- New test files: `tests/bkit-runtime.bats` (rows 1–9, 16), `tests/cloud-bootstrap-preflight.bats` (row 13), `.bkit/src/bkit-mcp-toolsets.test.ts` (row 10), `bkit-template-no-userpath.test.ts` (row 11), `bkit-skip-ci-subject-audit.test.ts` (row 12, conditional), `bkit-runtime-prose-audit.test.ts` (row 15)
- Batch mirror regen (`bkit install`) deferred to Sub-Plan 6 (T16) per doctrine (not after each edit)

**Architecture changes mapped:**

- [NEW] `.bkit/scripts/bkit-runtime.sh` + template (shim, capability table, GH_OK probe, Flow 1 loud-failure)
- [NEW] `runtime-resolved`, `transport-fallback`, `close-transport` row types in `status.jsonl` (additive to #234 artifact)
- [MODIFY] 8 workflow files for adopt-or-mint (T8), CI-wait migration (T7), close shapes (T10/T11/T13), skip-ci reconciliation (T12), fallback lane prose (T14), worktree helpers self-skip (T15)
- [MODIFY] `.agents/rules.md` invariants (T6), `.mcp.json` + template (T4 `actions` toolset), `cloud-bootstrap.sh` + template (T5 gh hardening), `docs/plans/template.md` (T1 no `/Users/` path)
- [DELETE] `feat/` hard-reject (T2), inline CI-dispatch kernel blocks (T7 extracted), blind CI-wait `sleep` in ship (T7)

## Acceptance Scenario

**Narrative:** A developer runs any phase (design/plan/build/debug/ship) from laptop, GitHub Actions runner, or claude.ai cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

**Success Criteria (7):**

1. All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; mode-1 verified non-regressed by a real run (not rule-text-presence test).
2. No run mutates the session's checked-out branch in a runtime that cannot restore it (zero `git checkout dev` when dev-push capability is absent).
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens; `dev` CI-dispatch outcome is asserted (not assumed).
4. Any gh→MCP transition is bounded (max 1/run), recorded in `status.jsonl`, confirmed by independent re-read, cross-checked mechanically.
5. An MCP read returning empty/zero is never recorded as authoritative absence — corroborated or reported unavailable, with the corroboration attempt logged.
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime.
7. No wait can hang; every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep`.

**Edge cases identified (6):**

- Identity-vs-reality mismatch (mode-2 read-only GITHUB_TOKEN; rotated GH_TOKEN 401) — transport selected by CAN_PUSH_DEV, real push certifies loudly
- Repo settings invisible to git (branch protection on `dev`; auto-delete-head-branches) — pre-close assertion on real push; dependency in `docs/deployments.md`
- Adopt mode collapses worktree isolation — accepted; existing `.lock` is only concurrency guard
- `--dry-run` probe fails dangerous (no ref-update, branch protection never evaluated) — rejected; replaced by double-guard + reversible checkout + real push
- Sleep block-vs-error in mode 3 (Bash tool blocks foreground `sleep`) — mitigated by `timeout`-wrapped cap; observable behavior settled in WS-16 live run
- `push_files` conflict inversion on moved `dev` head (branch-wins server-side vs dev-wins locally, inverse of `-X ours`) — mitigated by dev-head-unmoved precondition; reject-vs-clobber residual settled in WS-16

**Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec:** PASS (content). Narrative present; 7 success criteria (3 from design, 4 own); 6 edge cases identified. **SC1 is aspirational pending WS-16**: "mode-1 non-regression verified by a real run, not a rule-text-presence test" depends on Sub-Plan 6 executing, which is terminal to the plan and cannot validate the design itself. Prose-only consumption verification is the design's accepted honest limit (D3).

## Breaking Changes

**API surface:**

- New `RUNTIME` flag + 4 `CAN_*` flags (additive; no collision with existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80`)
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (additive; existing NDJSON artifact #234)
- FID resolution reordering (D9): marker-primary → branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject, which is deleted)
- `WORKTREE_PATH` becomes conditional (mint if `CAN_WORKTREE=true`, else `$REPO_ROOT`)

**Prose/user-facing:**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships
- Adopt-mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items
- (OQ-D conditional) `[skip ci]` dropped from phase-close and intermediate status-commit subjects (D5(a) prerequisite) — docs-only closes now fire full CI instead of `run_level=none`

**Verdict:** None break existing consumers on modes 1–2; every mode-3-specific path is additive. FID resolution is a reorder (marker already exists), not a new mechanism. Breaking-Changes section adheres to template spec.

## Design Alignment

**Alignment check:**

- Plan's Acceptance Scenario narrative: "developer runs any phase from laptop/runner/cloud; behaves identically in all three" ✓ matches design § Acceptance Scenario
- Plan's success criteria (SC1–7): all 7 present; match design's `Success Criteria` section verbatim ✓
- Plan scope: all 5 phases + `bkit-auto` + 5 close transports + 2 new fallback lanes + 9 risk mitigations ✓ within design scope
- Design's 26 decisions (D1–D26) explicitly addressed: D1 (skip-token in body), D2–D3 (shim detection), D4–D5(a) (close transports), D6–D7 (worktree), D8–D25 (guards and assertions), D26 (MCP server — C1/C2 decisions from spikes folded)
- Spikes A/B/C findings folded (not re-planned as open spikes)

**Verdict:** Plan directly implements the design with no scope leakage. Design's CONCERNS verdict carries forward (inheritance, not plan's content issue). Three pre-build decision spikes settled; residual live-mode-3 items properly tracked for WS-16.

## Deferred & Out-of-Scope

All items properly categorized per the plan:

| Item                                                    | Designation                                                                                    | Rationale                                                                                                      |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Shell-native MCP CLI shim                               | Exempt (out-of-guiding-principle scope; deferred to future / lower priority)                   | New-tooling investment; best long-term shape but not "minimal, additive changes"                               |
| Uniform PR-close in all runtimes                        | Exempt (rejected alternate in design; breaks mode-1 constraints: offline, instant, no network) | D5(a) (PR-close) is conditional on OQ-A; D5 is fallback if human selects it                                    |
| Runtime #4 (Cursor bg agent)                            | Exempt (first-class detection not in guiding principle)                                        | Scope limited to three known runtimes; Cursor left as future expansion                                         |
| Narrow gh read-path corroboration outside MCP           | Exempt (doctrine forbids gh for tracker ops; out of scope)                                     | MCP-internal corroboration per D12; if it proves unreliable, open separate follow-up                           |
| Root cause of MCP `search_issues` zero on private repos | Exempt (undiagnosed; logged in docs/failures.jsonl OQ3)                                        | Mitigated by D12 (mark as inconclusive, corroborate, log as distinct state); root-cause investigation deferred |
| Periodic transport-fallback frequency summariser        | Exempt (new feature; not in design scope)                                                      | D25 gives rows a mechanical reader inside Close Workflow; analysis/aggregation deferred                        |
| Mode-tuned subagent fan-out pacing                      | Exempt (deferred per design §6g; only if hit; would fix rate-limited tight-looping)            | N2; revisit only if shared-account rate budget becomes operational concern                                     |
| `/Users/jesse` vendored skill "fix" (D20 correction)    | Exempt (creates skill-sync drift; ships no consumer defect)                                    | Kept as-is per D20; consumer-side fix if needed; not bkit's responsibility                                     |

**Verdict:** No BLOCKING deferrals. All out-of-scope items are properly exempted (genuinely-additive or outside guiding principle). No scope gaps. OQ-A and OQ-D are contingencies (alter T12/T13 if certain human choices made), not deferrals.

## Suggested Scope Expansion

None identified. Plan is tightly scoped to the design. OQ items are gating questions (required for build decisions), not expansion candidates.

## Risks

**Nine design-named risks (plan owns mitigations for 3–5):**

1. **Detection misfire** (env var absent → false `CAN_PUSH_DEV=true` → checkout on live session) — Mitigated by D23 double-guard + reversible checkout (structural, not probe accuracy)
2. **Shim load-bearing** (must be side-effect-free) — Mitigated by Flow 1 post-source assertion (distinct message for unset vs false)
3. **Blocked `sleep` hang** (produces zero observability) — Mitigated by `timeout`-wrapped caps; Spike A confirmed platform errors rather than blocks; unobservable behavior settled by live run
4. **Repo settings invisible to git** (branch protection, auto-delete-head-branches) — Mitigated by committed assertion in close path; dependency written into `docs/deployments.md`; Risk-4 is NOT a Step-1 preflight (lacks admin scope)
5. **Flag duplication** (flags set but read nowhere) — Mitigated by vitest prose audit (not behavior test; presence grep for `CAN_*` readers + foreground-sleep audit)
6. **Extra MCP calls widen lethal-trifecta surface** (prompt injection per §5a) — Adjacent to #342; D13's max-1 bound is real mitigation; no scope duplication
7. **Mode-1 non-regression** (mode 1 never exercises mode 3's path) — Mitigated by real end-to-end run (not rule-text-presence test); this is D1's exact aetiology
8. **`core.bare` flip** (laptop-specific workaround) — Decided: leave unconditional (no-op where already false; gating adds branch for zero gain)
9. **`push_files` conflict inversion** (branch-wins server-side vs dev-wins locally, opposite of `-X ours`) — Mitigated by dev-head-unmoved precondition (narrower than `-X ours`); biggest accepted risk; two transports, mode 1 never exercises mode 3, silent divergence if heads collide (settled by live run)

**Spike-owned residuals (to settle in WS-16):**

- Sleep block-vs-error (mitigated regardless by `timeout` cap)
- Which MCP server mode 3 loads + whether `GH_BKIT_TOKEN` in-sandbox (determines whether C2 lands decoupled or coupled; safe either way)
- `push_files` reject-vs-clobber on a moved `dev` head (mitigated by precondition guard; only if guard fails)

**Unknowns requiring resolution before build:**

- OQ-A: Transport choice D5(a) PR-close (recommended) vs D5 `push_files` — picks whether T12 exists
- OQ-B: Playwright artifact seam — job-logs-only fallback acceptable?
- OQ-C: `dev` branch-protection config permits autonomous close + auto-delete-head-branches enabled (human/admin action required)
- OQ-D: Docs-close CI cost (OQ-A=D5(a) consequence) — accept full CI or require skip-signal without surfacing token?

## Action Items

**For build to proceed, the following MUST be resolved:**

1. **Human confirmation of parent plan's `👤` gates (Gate 1 in Sub-Plan 1):**
   - [ ] Acceptance Scenario confirmed (parent checkbox)
   - [ ] Breaking Changes confirmed (parent checkbox)
   - [ ] Open Questions confirmed (parent checkbox)
   - Without these, Sub-Plan 1 (T1–T5) cannot start

2. **Explicit resolution of OQ-A (transport choice for D5(a) vs D5) BEFORE Sub-Plan 4:**
   - If **D5(a) PR-close** (recommended): proceed as planned; T12 exists; T13 uses PR-merge tail
   - If **D5 `push_files`**: drop T12 entirely; swap T13's tail to use `push_files` + `get_file_contents` assert + dev-head-unmoved precondition; re-verify Sub-Plan 4's matrix/runbook; drop matrix row 12
   - **Plan default:** D5(a) (uniform with ship, credential-decoupled, no payload bloat, no conflict inversion)

3. **Explicit resolution of OQ-D (docs-close CI cost, contingent on OQ-A=D5(a)) BEFORE Sub-Plan 4:**
   - If **accept full CI on docs-only closes**: proceed as planned; T12 removes `[skip ci]` from subjects; docs closes fire full CI
   - If **decline CI cost**: require D5(a) transport to carry skip signal WITHOUT surfacing token in merge subject (Failure Path back to OQ-A)
   - **Plan assumption:** OQ-D cost is accepted (same class as D11 sleep reversal, a knowing reversal)

4. **Confirmation of OQ-B (job-logs-only Playwright fallback) BEFORE Sub-Plan 5:**
   - [ ] Confirm `get_job_logs` is the standing default (failure signal not lost, rich report lost)
   - [ ] Verify `download_workflow_run_artifact` output shape against a real run (WS-16); adopt it ONLY if it carries rich report

5. **Confirmation of OQ-C (branch config) BEFORE Sub-Plan 3/6:**
   - [ ] Branch protection on `dev` permits the autonomous close (status-checks-only, no required human review)
   - [ ] "Automatically delete head branches" is enabled (there is no MCP `delete_branch` tool)
   - **Manual verification step 4 (Sub-Plan 6 / WS-16):** confirm this post-deployment

6. **Acknowledge design's honest limit (D3):**
   - Prose consumption cannot be verified by static analysis; SC1's "mode-1 non-regression verified by real run" rests entirely on WS-16
   - Three live residuals (sleep behavior, MCP server, `push_files` conflict) are mitigated structurally but final behavior settled only by live run

7. **Address design's CONCERNS verdict:**
   - Design identified 9 risks, 5 open questions, 7 success criteria; plan operationalizes mitigations
   - Plan cannot resolve design's CONCERNS → must be accepted as inherited precondition to build
   - Spikes A/B/C closed; findings folded; no further re-spikes planned

## Recommended Next Step

```
/bkit-build 341

Brief: Plan ready for build. Human must confirm parent's `👤` gates (Acceptance / Breaking / OQ-A/D/B/C) before Sub-Plan 1 starts. OQ-A (transport D5(a) vs D5) picks whether T12 exists; OQ-D (docs-close CI cost) gates scope of T12. Sub-Plans 1–5 land 16 tasks across 8 workflow files, `.agents/rules.md`, tests, and docs with explicit serialization (repo forbids concurrent workflows on one clone). Sub-Plan 6 (WS-16) is terminal: prose audit, batch mirror regen, live end-to-end runs in all three runtimes to settle three residuals (sleep block-vs-error, MCP server presence, push_files conflict). Plan directly implements design (verdict CONCERNS, docs/plans/202607/341-three-runtimes-design.md). Three pre-build spikes (A/B/C) closed; findings folded into sub-plans. See plan-v4-split.md (parent index) + six sub-plan children for full task breakdown.

Plan doc: docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md
```

### Comment — @cbartens (2026-07-22T08:30:00Z)

### Step 12 — Close Workflow

#### Artifacts

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-design.md)
- [341-three-runtimes-plan-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-1.md)
- [341-three-runtimes-plan-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-2.md)
- [341-three-runtimes-plan-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-3.md)
- [341-three-runtimes-plan-4.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-4.md)
- [341-three-runtimes-plan-5.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-5.md)
- [341-three-runtimes-plan-6.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-6.md)
- [341-three-runtimes-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-complexity-check.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-input.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-scope-check-2.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-summary.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v1-draft.md)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v2-reviewed.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v3-checked.md)
- [plan-v4-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-1.md)
- [plan-v4-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-2.md)
- [plan-v4-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-3.md)
- [plan-v4-4.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-4.md)
- [plan-v4-5.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-5.md)
- [plan-v4-6.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-6.md)
- [plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md)

Landed on `dev` as `992f80a2` — `docs(341-three-runtimes): plan DONE bkit [skip ci]`.

#### Telemetry

**plan close** · cbartens/bkit

| metric          | this run                       | med·5 |
| --------------- | ------------------------------ | ----- |
| durationSeconds | 40042 (11h7m)                  | —     |
| linesChanged    | 4373 (+4337/-36)               | —     |
| filesChanged    | 31                             | —     |
| taskCount       | 119                            | —     |
| frictionAdded   | 1                              | —     |
| deferralsAdded  | 2                              | —     |
| failuresAdded   | 0                              | —     |
| compliance      | 2 pass · 0 fail · 0 n/a (100%) | —     |
| attempts        | PLAN_ATTEMPT 1                 | —     |

### Comment — @cbartens (2026-07-23T23:51:05Z)

Cursor promoted to first-class Runtime 4 (design/plan updated)

Scope change (2026-07-23/24): Cursor Cloud Agents moved from deferred to a first-class Runtime 4 in the capability table (was unknown → least-capable). Profile is mode-2-equivalent (CAN_WORKTREE/CAN_PUSH_DEV true, GH_OK probed).

Detection (verify-first): the reliable Cursor-cloud signal is the stdin-JSON hook field is_background_agent (already used by .cursor/hooks/preflight.sh, shipped in #75) — not a workflow-shell env var; CURSOR_AGENT/CURSOR_REMOTE_AGENT are unconfirmed. The shim bridges that signal to a bash-visible env marker via a bkit seam (.cursor/environment.json env or a SessionStart hook export). Exact bridge + sleep-block behaviour held for live confirmation in Sub-Plan 6 before mode 4 is asserted in SC1. Non-regressive: unmatched Cursor still falls through to unknown.

Folded into T3; deferrals.jsonl entry runtime-4-cursor-… → CLOSED.

### Comment — @cbartens (2026-07-23T23:53:31Z)

## Build Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Comment — @cbartens (2026-07-23T23:57:01Z)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/feat/341-three-runtimes](https://github.com/cbartens/bkit/tree/feat/341-three-runtimes)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

### Comment — @cbartens (2026-07-23T23:57:21Z)

### Step 3 — Branch Sync

[cbartens/bkit/tree/feat/341-three-runtimes](https://github.com/cbartens/bkit/tree/feat/341-three-runtimes)

### Comment — @cbartens (2026-07-23T23:59:55Z)

### Step 4 — Install Skills

### Comment — @cbartens (2026-07-24T00:14:34Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 1/6

### Comment — @cbartens (2026-07-24T00:18:11Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 1/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T00:42:38Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 2/6

### Comment — @cbartens (2026-07-24T00:45:54Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 2/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T01:06:03Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 3/6

### Comment — @cbartens (2026-07-24T01:08:20Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 3/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T01:31:32Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 4/6

### Comment — @cbartens (2026-07-24T01:34:03Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 4/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T01:52:44Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 5/6

### Comment — @cbartens (2026-07-24T01:56:01Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 5/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T02:14:03Z)

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 6/6

### Comment — @cbartens (2026-07-24T02:16:12Z)

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 6/6 - Attempt: 1

### Comment — @cbartens (2026-07-24T02:21:59Z)

### Step 8 — Plan Verify Holistic - Verdict: PASS - Failures: 0

### Comment — @cbartens (2026-07-24T02:25:33Z)

### Step 9 — Build Challenge - Verdict: CONCERNS - Failures: 0 - Attempt: 0

### Comment — @cbartens (2026-07-24T02:27:51Z)

### Step 10 — Reconcile Build Challenge - Verdict: CONCERNS - Failures: 0 - Attempt: 0

### Comment — @cbartens (2026-07-24T02:33:18Z)

### Step 11 — Build Challenge Remediate - Verdict: FAIL - Attempt: 1

### Comment — @cbartens (2026-07-24T02:34:04Z)

### Workflow Failure

Step: 11 — Build Challenge Remediate; Sub-step: 7 (routing)
Error: REMEDIATE_CHALLENGE_VERDICT = FAIL. Finding 4 (marker-primary FID reorder in `.bkit/workflows/bkit-auto.md:9-10`, D9 — untrusted PR-body FID marker flows unvalidated into `docs/plans/.../{FID}` and `.worktrees/{FID}` filesystem paths, enabling `../..` path traversal) is `class=architectural` and ended `BLOCKED` with no later `DONE`, per the remediate subagent's own verdict-mapping contract (architectural/CRITICAL findings left BLOCKED force FAIL, never silently downgraded). Findings 1-3 (D24 CI-suppression-token gap, GNU-`timeout` macOS absence, EXIT-trap command injection) were remediated DONE and verified green (typecheck, vitest 2484 passed, format:check, lint:slop, lint:prose, bats — all pass). Finding 4 logged to `docs/deferrals.jsonl`.
Stderr: n/a (verdict routing, not a tool/command failure)

### Comment — @cbartens (2026-07-24T04:07:48Z)

### F4 Remediation — architectural finding resolved, build resumed

The build-challenge routed to Failure Path at Step 11 because finding **F4** was `class=architectural` and left `BLOCKED` (architectural findings are never patched inline by the remediate subagent — they force `FAIL` and a human decision). That decision is made; F4 is now fixed, verified, and the build is resuming toward a PR. `bkit:failed` dropped.

**F4 — untrusted PR-body FID marker → path traversal.** `bkit-auto` step 9 (D9 marker-primary) resolved `{FID}` from the collaborator-editable PR-body marker (`<!-- bkit:fid={FID} -->`) and passed it into filesystem paths (`docs/plans/.../{FID}/`, `.worktrees/{FID}`) and downstream `/bkit-*` dispatch with **no slug validation** — the one FID-resolution site in the workflow suite that skipped the assertion the five phase workflows apply at mint time. A marker like `bkit:fid=../../elsewhere` could redirect writes.

**Fix** (commit `75434b0c`, branch `feat/341-three-runtimes`):

| Exit point              | Guard                        |
| ----------------------- | ---------------------------- |
| step 9 — github         | `^[0-9]+-[a-z0-9-]+$`        |
| step 9 — linear         | `^[a-z]+-[0-9]+-[a-z0-9-]+$` |
| step 9 — no-tracker     | `^[a-z0-9][a-z0-9-]*$`       |
| step 10 — branch-derive | `^[a-z0-9][a-z0-9-]*$`       |

All reject `/`, `.`, `..`, and shell metacharacters. Marker failing the assert → branch-derive fallback; branch-derive failing it → Failure Path.

- `docs/security.md` § CI Auto-Route Trust records the allowlist doctrine (the deferral's prescribed remediation).
- `.bkit/src/bkit-auto-fid-guard.test.ts` — 39 cases (regex rejects an 11-vector traversal/injection corpus + accepts valid FIDs; presence at every exit point).
- `docs/deferrals.jsonl` F4 row `OPEN → CLOSED`; durable `docs/knowledge.jsonl` gotcha added; `.claude`/`.cursor`/`.opencode` mirrors regenerated.

**Verification:** an independent adversarial security re-challenge returned **PASS / 0 failures / no regression** ([build-challenge-verify-f4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-verify-f4.md)); F1–F3 mechanical fixes confirmed intact. Full local suite green: typecheck, format, prose, vitest 2523 passed, slop:delta net 0, bats 99/99, `bkit check` clean.

Resuming build: Step 12 (Challenge Tests) → Step 13 (Run Tests) → Step 16 (Summary) → Step 17 (Create PR).

### Comment — @cbartens (2026-07-24T04:16:50Z)

### Step 12 — Build Challenge Tests - Verdict: PASS

9 regression tests added to `tests/bkit-runtime.bats` for F1 (all 5 CI-suppression tokens + case-insensitivity), F2 (timeout/gtimeout resolution + plain-sleep fallback), F3 (EXIT-trap injection neutralised) — each verified to fail against the pre-fix code and pass against the fix. bats 107/107.

### Comment — @cbartens (2026-07-24T04:18:12Z)

### Step 13 — Run Tests - Verdict: PASS - Failures: 0 - Scope: pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit - Attempt: 1

### Comment — @cbartens (2026-07-24T04:22:09Z)

### Step 16 — Summary - Verdict: PASS

[build-summary.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-summary.md)

Verdict: PASS

# Build Summary

## Overview

Built #341 three-runtimes workflow execution across 6 sub-plans (T1–T16). All 16 tasks implemented to spec: Layer-0 runtime shim detection (`bkit_runtime.sh` 10 functions, `bkit_runtime_detect`/`bkit_wait_ci`/close-guard kernel), Layer-1 CI-wait primitive extraction, Layer-2 branch model (adopt-or-mint), Layer-3 invariant prose (`rules.md` updates), FID marker-primary reorder (D9), gh auth hardening + MCP fallback lane, and close-guard kernel (D23/D24/D25). All six sub-plans verified PASS; holistic verification PASS (0 integration gaps). Build-challenge surfaced 4 findings; F1–F3 (mechanical) remediated first pass + regression tested; F4 (architectural, FID path traversal validation) escalated to human per protocol, manually fixed, independently re-verified PASS (0 failures).

## Test Status

Full test suite PASS after fixes. Challenge-tests: 9 new regression tests for F1/F2/F3 (F4 already covered by `bkit-auto-fid-guard.test.ts`). Run-tests scope `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit`, 0 failures. `pnpm test:bats` → 107/107; `pnpm test` → 2523 passed / 71 files (2 skipped, 1 todo); coverage:unit 2015 passed. slop:delta net 0.

## Challenge

4 findings, max severity HIGH → CONCERNS. All resolved.

- **F1** [HIGH]: D24 landed-body scan missed 3 of 5 CI-suppression tokens → regex widened to full case-insensitive set. Regression test PASS.
- **F2** [HIGH]: `bkit_wait_ci` hard-depended on GNU `timeout` (absent on stock macOS) → resolver detects timeout/gtimeout, falls back to plain sleep. Regression test PASS.
- **F3** [LOW]: command injection via branch name in close-guard EXIT trap → trap body single-quoted. Regression test PASS.
- **F4** [architectural]: marker-primary FID reorder → untrusted PR-body path traversal. Escalated to human, fixed with slug allowlist at every FID exit point, independent re-challenge PASS / 0 failures.

## Deferred

5 Manual Verification items (live mode-1/2/3 runs + `dev` branch-protection admin confirm + debug-egress live check) logged OPEN in `docs/deferrals.jsonl` — reachable only from live/admin sessions, not blockers per plan scope.

## Recommended Next Step

`/bkit-ship 341` — plan done, all 6 sub-plans implemented, all tests pass, challenge resolved. Plan: `docs/plans/202607/341-three-runtimes-plan.md`

### Comment — @cbartens (2026-07-24T04:26:03Z)

### Step 17 — Close Workflow & Create PR

[cbartens/bkit/pull/382](https://github.com/cbartens/bkit/pull/382)

CI on PR HEAD (`effbee27`): **all 5 checks pass** — bkit-tests-static, -unit, -integration, -scope, -check. mergeState: CLEAN.

#### Artifacts

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-design.md)
- [341-three-runtimes-plan-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-1.md)
- [341-three-runtimes-plan-2.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-2.md)
- [341-three-runtimes-plan-3.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-3.md)
- [341-three-runtimes-plan-4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-4.md)
- [341-three-runtimes-plan-5.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-5.md)
- [341-three-runtimes-plan-6.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-6.md)
- [341-three-runtimes-plan.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan.md)
- [build-challenge-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-1.md)
- [build-challenge-2.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-2.md)
- [build-challenge-remediate-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-remediate-log.md)
- [build-challenge-tests.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-tests.md)
- [build-challenge-verify-f4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-verify-f4.md)
- [build-challenge.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge.md)
- [build-input.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-input.md)
- [build-install-skills.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-install-skills.md)
- [build-plan-execute-1-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-1-log.md)
- [build-plan-execute-2-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-2-log.md)
- [build-plan-execute-3-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-3-log.md)
- [build-plan-execute-4-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-4-log.md)
- [build-plan-execute-5-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-5-log.md)
- [build-plan-execute-6-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-6-log.md)
- [build-plan-verify-1-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-1-1.md)
- [build-plan-verify-2-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-2-1.md)
- [build-plan-verify-3-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-3-1.md)
- [build-plan-verify-4-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-4-1.md)
- [build-plan-verify-5-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-5-1.md)
- [build-plan-verify-6-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-6-1.md)
- [build-plan-verify-holistic.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-holistic.md)
- [build-summary.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-summary.md)

#### Telemetry

```

> @cbartens/bkit@4.8.0 bkit /Users/christian/Documents/GitHub/bkit
> node dist/bkit-install.js telemetry summary --phase=build

**build close** · cbartens/bkit

| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 37100 (10h18m) | — |
| linesChanged | 238 (+238/-0) | — |
| filesChanged | 4 | — |
| taskCount | 119 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 2 | — |
| failuresAdded | 2 | — |
| attempts | BUILD_ATTEMPT 2 | — |

`med·5` = median of the previous 5 build runs (— if < 3) · ledger 13 rows, 0 malformed
```

### Comment — @cbartens (2026-07-26T23:52:13Z)

I'll extract this from the actual workflow files rather than from memory.

Extracted from the current branch state. Every divergence point is a `CAN_*`/`GH_OK` branch I can point at by step.

## The capability table (everything else follows from this)

`.bkit/scripts/bkit-runtime.sh` classifies once per Bash block and writes a durable `runtime-resolved` row at Step 2:

|                | **1. local** (laptop) | **2. gh-action runner**      | **3. claude.ai / cursor cloud** |
| -------------- | --------------------- | ---------------------------- | ------------------------------- |
| detected by    | neither primitive     | `GITHUB_ACTIONS`/`CI` = true | `CLAUDE_CODE_REMOTE=true`       |
| `CAN_WORKTREE` | true                  | true                         | **false**                       |
| `CAN_PUSH_DEV` | true                  | true                         | **false**                       |
| `CAN_SLEEP`    | true                  | true                         | **false**                       |
| `GH_OK`        | probed                | probed (token present)       | probed (**often false**)        |

**Modes 1 and 2 resolve identically at every flag.** They take the same branch of every conditional in every workflow — mode 2 is not a separate path, it's mode 1 on someone else's machine. Only mode 3 (and the `unknown` fallback) diverges.

---

## `/bkit-design` — 10 steps

1 Start Workflow · **2 Worktree Setup** ⚠️ · 3 Brainstorm & Ideate · 4 Generate Design · 5 Design Review · 6 Apply Review · 7 Design Organise · 8 Summary · 9 Workstream Issues · **10 Close Workflow** ⚠️

- **Step 2** — mode 1/2: `git worktree add .worktrees/{FID}` on `feat/{FID}`, copy env files, `pnpm install`. Mode 3: no worktree; adopts the branch the session is already on, `WORKTREE_PATH=$REPO_ROOT`, refuses if that branch is `dev`.
- **Step 10** — mode 1/2: local `git merge --squash -X ours` → `docs({FID}): design DONE bkit [skip ci]` → `git push origin dev` → worktree/branch teardown. Mode 3: opens a PR, squash-merges it with that same skip-token subject, no `--delete-branch` (repo auto-delete handles it), no teardown (nothing local to tear down).

Steps 3–9 are identical in all three modes.

## `/bkit-plan` — 12 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Generate Plan · 4 Fetch Context · 5 Review · 6 Apply Review · 7 Scope Check · 8 Apply Scope · 9 Complexity Check · 10 Complexity Split · 11 Summary · **12 Close Workflow** ⚠️

Same two divergences as design, same shapes. Steps 3–11 identical.

## `/bkit-build` — 17 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Branch Sync · 4 Install Skills · 5–8 Plan Execute/Verify · 9 Build Challenge · 10 Reconcile · 11 Remediate · 12 Challenge Tests · 13 Run Tests · 14 Failure Diagnose · 15 Failure Remediate · 16 Summary · **17 Close Workflow & Create PR** ⚠️

- **Step 2** — as above.
- **Step 17** — the close pushes to the _feature_ branch and creates the PR in all three modes (no `dev` push, so no `CAN_PUSH_DEV` branch). The divergence is the **CI-Dispatch Gate**: mode 1/2 poll in bash via `bkit_wait_ci` (`timeout`-wrapped sleeps). Mode 3 (`CAN_SLEEP=false`) can't block on `sleep`, so it runs the same gate as an **agent turn-loop** — one `gh pr view` per orchestrator turn instead of a bash poll.

Steps 3–16 identical.

## `/bkit-debug` — 10 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Run Tests · **4 Fetch Context** ⚠️ · 5 Failure Diagnose · 6 Failure Remediate · 7 Remediate Soak · 8 Push Remediation · 9 Summary · **10 Close Workflow** ⚠️

- **Step 2** — as above.
- **Step 4** — the Playwright artifact seam. `gh run download -n playwright-report` is primary; when `GH_OK=false` it falls back to `get_job_logs --failed-only`, which keeps the failure signal but loses the rich HTML report. Also where debug-fetch blocks must now narrate `CHECKED` / `SELF-SKIPPED` / `NO BLOCKS CONFIGURED` distinctly — a cloud egress block self-skipping `exit 0` must never read as "no runtime errors".
- **Step 10** — same CI-Dispatch Gate split as build (bash poll vs agent turn-loop), at both the PR-mode and LOCAL-mode close sites.

## `/bkit-ship` — 13 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Regression Guard · 4 Conflict Resolve · 5 Deferred Sweep · 6 Merge PR · 7 Failure Diagnose · 8 Failure Remediate · **9 Switch to Dev** ⚠️ · 10 Update Docs & Summary · 11 Prune Skills · 12 Worktree Cleanup · **13 Close Workflow** ⚠️

- **Step 2** — as above.
- **Step 6 Merge PR** — identical in all modes. The merge is server-side (`gh pr merge --squash`), so it works everywhere; mode 3 falls back to `merge_pull_request` only if `GH_OK=false`, with an explicit skip-token-free `commit_message`.
- **Step 9** — mode 1/2: take the dev lock, `git checkout dev`, `AHEAD_NON_SKIP` guard, pull/push, `pnpm install`. Mode 3: skipped entirely — the merge already landed server-side at Step 6 and local `dev` is never ahead there. Guarded by an inline `CAN_WORKTREE && CAN_PUSH_DEV` double-assert before any local `dev` checkout.
- **Step 13** — mode 1/2: status/telemetry tail committed and pushed on `dev`. Mode 3: recorded on the current branch instead.

Ship has no `CAN_SLEEP` branch — its CI check at Step 4 is a one-shot conclusion read, not a poll.

## `/bkit-auto` — 2 steps

No runtime branch at all, but it's what makes mode 3 reachable: **Step 9 now resolves `FID` from the PR-body marker first**, with the `feat/`-prefix branch derivation as fallback. Previously a non-`feat/` branch was an immediate Failure Path, which rejected every `claude/…` cloud session branch. Both paths pass a slug allowlist before `FID` builds any filesystem path.

## `/bkit-worktree-sync`, `/bkit-worktree-prune`

Both gained a `bkit_worktree_helper_guard` self-skip at the top: `CAN_WORKTREE=false` → loud "no `.worktrees/` tree here" and stop, treated as a **no-op, not an error**. Mode 1/2 proceed unchanged.

---

## Divergence total

| workflow            | divergence points            | steps identical in all 3 modes |
| ------------------- | ---------------------------- | ------------------------------ |
| design              | 2 (Steps 2, 10)              | 8 of 10                        |
| plan                | 2 (Steps 2, 12)              | 10 of 12                       |
| build               | 2 (Steps 2, 17)              | 15 of 17                       |
| debug               | 3 (Steps 2, 4, 10)           | 7 of 10                        |
| ship                | 4 (Steps 2, 9, 13 — 9 twice) | 10 of 13                       |
| auto                | 0                            | 2 of 2                         |
| worktree-sync/prune | 1 each (self-skip)           | —                              |

Three recurring shapes cover all of it: **mint-vs-adopt** the worktree, **local push vs server-side merge** for `dev`, and **bash poll vs agent turn-loop** for CI waits. Mode 1 and mode 2 take the left side of every one.

Want me to land this as a section in `.bkit/workflows.md`? That's the companion doc for exactly this kind of reference, and it'd replace the scattered per-bullet notes I added there during the restructure.
