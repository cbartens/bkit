## Session Prompt — this run's, newer than everything below

#891

## Issue comment — posted 2026-11-09T06:52:16.000Z

## Rescope: no accepting red tests. Give better advice at the pause instead.

This replaces everything above it. The marker sits on the line above this heading, so the workflows read this comment and nothing earlier.

### What happened

A consumer's `dev` had 3 red unit tests that the build's branch did not cause. A clean `dev` checkout shows the same 3 failures: `Tests 3 failed | 8 passed (11)`. They were the consumer's own: a dead-code registry missing two new files, and a suppression-count ceiling that wasn't raised. `/bkit-build` built and verified task group 1, then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept`, and the owner took it. The gate failed again on the same tests. The second pause offered only `Try again` (a round that can't change anything) or `Stop`. Groups 2-6 never started.

### The shape stays

A failure a fix round can fix → `Try again`. A failure no round can fix → say so plainly, recommend `Stop`, and have the owner fix the cause first (here, `dev`) and then resume. That is the workflow's shape today. This issue does **not** add a way to accept red tests and build past them.

That is why the earlier design is dropped: accepted-failure records, `$BKIT_ACCEPTED_TESTS` passed into every test runner, and the same list passed through the pre-push hook. It only gets the branch *built*. CI on the PR runs the same red tests, so `/bkit-ship` still can't merge until `dev` is fixed. A lot of machinery for a branch that can't merge anyway.

### What's actually wrong (found by reading the code, not reproduced)

1. **"Try again or not" never asks why a test fails.** The loop question recommends from a trend alone (`loopTrend` / `loopProgress`, `.bkit/core/engine/commands/workflow/counters.ts:257-334`). After the first round it always recommends `Try again`. After that it recommends `Try again` only when there are fewer problems than the first round and the source changed in between; otherwise `Stop` / `Decide`. A test that also fails on `dev` can't be fixed by any round on this branch, and nothing checks for that.
2. **The pause's numbers ignore the group gate.** The verify loop's progress block counts the verify agent's problems, not the gate's failing tests (`LOOPS.verify.check` = `build-plan-verify`, `.bkit/core/engine/commands/workflow/decisions.ts:179`). In this run verify passed both rounds, so the pause showed "Problems after each round: 0 → 0" while 3 tests were red. The reason it gave ("another round is unlikely to close the remaining items") says nothing useful.
3. **"Stop, fix `dev`, resume" can loop on the old pause.**
   - Picking up the fix works in worktree mode. On every resume, Step 2's `bkit worktrees setup` fetches `dev` and rebases the branch onto it (`.bkit/core/engine/commands/workflow/worktrees.ts:1010`). In adopt mode (`RUNTIME_WORKTREES=false`, the cloud default, working on the branch in place) there is no rebase, so the owner must merge `dev` into the branch by hand.
   - The resume then goes straight back to the open pause (`.bkit/core/workflows/bkit-build.md:43`). That pause still shows the gate result from before the fix, and with no items it offers only `Try again` or `Stop`.
   - `Try again` starts a fix round (Step 9). The gate is now green, so the fix agent changes nothing, and a round that changes nothing goes back to the Decision Pause (`.bkit/core/workflows/bkit-build.md:820`). No answer re-runs the gate on its own, so the build loops on that pause.
4. **The `Accept` the owner was offered isn't in the workflow.** The Decision Pause says a group-gate failure is never an item (`.bkit/core/workflows/bkit-build.md:140`; the same goes for Step 12's suites, `:147`). So either the orchestrator made the item up, or the verify agent logged the gate's failing tests as gaps. The run's logs weren't available, so which one is not known.

### Scope

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. No new options or owner answers.

1. **Check whether the failing tests also fail on the base commit.** At a pause after a red group gate (Step 8) or a red final run (Step 12), re-run only the failing test files on the commit the branch started from. If a CI run on that exact commit exists, use it instead. Then:
   - **all failures also red on base** → recommend `Stop`: "these N tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." In adopt mode, add: "merge `dev` into the branch before resuming."
   - **some** → say so: "a round can fix 2 of 5; the build will still stop on the 3 from `dev`." The owner chooses between `Try again` and stopping now.
   - **can't tell** (no JUnit report, no `bkit:test:file` script, no base run possible) → today's trend rule, and say the cause is unknown.
   - `Try again` stays offered in every case; only the recommendation and the wording change.
   - Never use "the last CI run on `dev`" as evidence. Most bkit commits are `[skip ci]`, so that run is often many commits old.
   - Cost: in bkit, a detached checkout of an older commit, an offline `pnpm install` and one test file took about 8 s (1 s + 2 s + 5 s). Installing dependencies is most of it and will be slower in heavier repos. It runs once per pause, not once per round.
   - `bkit tests run` doesn't record which file each failing test is in today. The check has to read that from the gate's JUnit report (`classname` / `file`).
2. **Count the gate's failing tests in the pause's progress numbers**, so the trend reflects the gate, not just verify.
3. **On a resume into a pause about a red gate, re-run the gate first.** That means Step 8 for a group gate, Step 12 for the final run. If it passes, carry on without asking. If it's still red, ask again with fresh numbers. Do not add a rebase or merge of `dev` for adopt mode: the pause text tells the owner to merge it instead.
4. **Never offer `Accept` for a group-gate or suite failure**, and make the verify agent's instructions say gate failures are not verify gaps.

Out of scope: `/bkit-debug`. It often runs to fix exactly such a failure, so a "came from `dev`, can't be fixed here" label would be wrong when that failure is the job. Also out of scope: `/bkit-ship`, which still needs green CI as today.

### The existing plan

`docs/plans/202611/891-build-gate-stuck-plan.md` on `dev` and the 4 decision rows and 5 deferral rows it added (`e452f6993`) assume the dropped accept design. A re-plan replaces the plan and corrects or closes those rows. Two exceptions:
- The deferral "Run a gate's failing cases on the base commit at the Decision Pause …" is now in scope as scope item 1, without the `Accept` part.
- The deferral "Document that a runner-less test file needs one JUnit case per planned test name" is unrelated and stays open.

Next step: `/bkit-plan #891`.

## Issue comment — posted 2026-11-09T08:21:41.000Z

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.
