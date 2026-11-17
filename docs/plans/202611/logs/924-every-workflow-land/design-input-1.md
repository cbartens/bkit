## Session Prompt — this run's, newer than everything below

#924

## Issue description — oldest

### Problem

How the owner handles small changes outside bkit:

1. An agent builds one issue in a worktree and runs the tests for the files it changed.
2. The agent brings the code onto local `dev` and commits it there.
3. Steps 1-2 repeat for a few issues.
4. One `git push origin dev` follows, so the whole batch gets one pre-push hook run and one remote CI run.

bkit covers step 1. `/bkit-build` with `publish=false` keeps the build in its worktree and pushes nothing (`.bkit/workflows.md` § `/bkit-build` — 16 steps, "Publish resolution"). bkit has no step 2. The only way to land a held build is `/bkit-ship`, and it pushes the branch, opens a PR, waits for CI and merges on GitHub, once for each feature. A batch therefore costs one PR and one CI run per feature, which is the cost the owner's own way of working avoids.

### Outcome

A local mode of `/bkit-ship` that takes a held build and does the following:

- It runs the deferred sweep (Step 5), the docs update and summary (Step 6) and the skill prune (Step 7) in the worktree, the same as today.
- It lands the feature on local `dev` as one commit that carries the code, its docs and its bookkeeping.
- It removes the worktree and the local `feat/{FID}` branch.
- It pushes nothing, opens no PR and waits for no CI run.

The owner pushes `dev` by hand once the batch is ready.

### Success criteria

- After a local ship, local `dev` holds the feature's code, docs, ledgers and `SHIPPED` row, and `origin/dev` has not changed.
- During the run there is no `git push`, no PR call and no Actions call to GitHub.
- The worktree and `feat/{FID}` are removed when they are clean and fully landed on local `dev`. Otherwise they are kept and the run reports why, using the same guard as Step 14 today.
- The commit that a local ship leaves at the tip of local `dev` has no `[skip ci]` in its subject. Today the ship close commit is `docs({FID}): ship DONE bkit [skip ci]`. If that commit were the last one in the batch, the owner's push would skip CI.
- Without the opt-in, `/bkit-ship` on a held build behaves exactly as it does today: push, PR, CI, merge.

### Constraints and non-goals

- Reuse the existing landing routine (`pushToDev` in `.bkit/core/engine/commands/land.ts`, with its scratch `.worktrees/_land-{FID}` checkout), based on local `dev` and with the push removed. Do not add a second landing routine.
- Local `dev` only ever fast-forwards: no reset, rebase or force. Uncommitted edits in the main checkout are never changed. If they block the move, the run stops and says so.
- Local runs only. A cloud or GitHub Actions run has no local `dev` to hold work on, so it publishes as it does today, the same way build turns `publish=false` back into `true` on those runs.
- Not in scope: pushing `dev`. The owner does that push.
- Not in scope: a bkit batch-push command. #715 turned one down, and this issue does not reopen that.

### Decisions already made

- On 2026-11-11 the owner asked for this. It reverses part of #715 for local runs. #715 turned down a ship that skips the PR and the CI run, because that ship changes shared state without a check. A local ship changes nothing on GitHub; the check moves to the owner's push (the pre-push hook, then `dev` CI). The design records this as a `docs/decisions.jsonl` row.
- The push stays manual: one push, one pre-push hook run and one remote CI run for each batch.

### Open questions

1. **How is the mode switched on?** One option is a `publish=false` token on `/bkit-ship`, the same as build has. The other is for ship to read the same `bkit.workflows.build.publish.local` setting, so that a repo which holds its builds also lands them locally, and `publish=true` on ship publishes one of them. The mode must not be inferred from "this branch was never pushed". Today that is exactly the documented case in which ship pushes the branch.
2. **What checks run before the commit lands on local `dev`?** The build has already run its tests in the worktree, and the owner's push runs the pre-push hook. The options are no further checks, only the tests the change affects, or `bkit:gate:min`. For comparison, `pushToDev` runs the deepest full push gate for code today.
3. **What about local `dev` drifting from `origin/dev`?** Design and plan closes still push straight to `origin/dev`. While local `dev` holds unpushed features, those closes make the two copies split, with three effects:
   - Later closes stop moving local `dev`. With #849 they report "divergent".
   - The next `/bkit-build` starts from `origin/dev` and so lacks the locally shipped code (`.bkit/workflows.md` § Common Workflow Anatomy: "the base is local `dev` while it is a fast-forward of `origin/dev`").
   - A normal `/bkit-ship` refuses a branch that carries unpushed `dev` commits.

   Should local mode also keep design and plan closes local? Or should it refuse when `origin/dev` has moved, or only warn?
4. **What does the issue show?** A normal ship sets `bkit:merged` and `In review`, but here the feature is on local `dev` and not on GitHub. One option is `In review` with a "landed on local dev, not pushed" comment and no `bkit:merged`. The other is to set `bkit:merged` straight away.
5. **How does post-push CI handle a batch?** CI on `dev` sees one head commit for the whole batch, so the post-merge auto-debug can read only the last FID. #715 already noted this limit for a manual batch push. Do we accept it, or record the batch's FIDs where that CI run can find them?
6. **Where does ship's close record go?** That record is the Step 14 `status.jsonl` rows and telemetry. It can go in the same commit as the code or in a second local commit. Either way, the batch must not end on a `[skip ci]` commit (see Success criteria).

### References

- #715 — Retire lite workflows; add build publish true/false — https://github.com/cbartens/bkit/issues/715 (its "No batch command" section and its rejection of `ship:lite`)
- #849 — Keep local dev synchronized after workflow close — https://github.com/cbartens/bkit/issues/849 (it moves ship's local `dev` sync into close and retires Step 13; this issue changes the same code)
- `.bkit/workflows.md` § `/bkit-build` — 16 steps ("Publish resolution")
- `.bkit/workflows.md` § `/bkit-ship` — 14 steps
- `.bkit/core/workflows/bkit-ship.md` § Step 13 — Update Local Dev
- `.bkit/core/workflows/bkit-ship.md` § Step 14 — Close Workflow
- `.bkit/core/engine/commands/land.ts` `pushToDev`

###### bkit:blocked-by start
- #849
###### bkit:blocked-by end

## Issue comment — posted 2026-11-12T03:03:28.000Z

### Owner answers to the open questions (2026-11-12)

The owner confirmed the scope: in local mode a workflow brings the code onto local `dev` and commits it there. The push is left to the owner, once enough has been committed.

1. **How the mode is switched on.** Each workflow has its own setting plus a token. A setting `bkit.workflows.{workflow}.publish.local` in `package.json` sets the default, and a `publish=true|false` token in the prompt overrides it for that run. This works the same way as build's existing `bkit.workflows.build.publish`. Ship does not share build's setting, so build and ship can be set differently.
2. **Checks before landing on local `dev`.** Only the tests the change affects, plus static checks on the changed files. They run on the combined result in the scratch checkout, because local `dev` may already hold other features that were shipped locally. The full gates wait for the pre-push hook on the owner's push.
3. **Local `dev` drifting from `origin/dev`.** Design and plan closes stay local as well. **This widens the scope:** the same publish setting and token apply to `/bkit-design`, `/bkit-plan`, `/bkit-ship` and `/bkit-debug`, alongside `/bkit-build`. When the setting or the token says local, each of these works in its worktree and lands on local `dev` without pushing. Nothing reaches GitHub until the owner pushes, so the two copies of `dev` do not split.
4. **Issue state after a local ship.** The same as a normal ship: `bkit:merged`, board status `In review`, and the issue left open. The run also posts a comment saying the feature landed on local `dev` and is not pushed yet.
5. **CI after a batch push.** The automatic follow-up in `.github/workflows/bkit-cloud.yml` reads every `{type}({FID}):` commit in the pushed range, not only the head commit's message, and uses those to pick the issue or issues. This edits a CI workflow file, so the build needs the owner's sign-off on that change (`.agents/rules.md` § CI edits).
6. **Keeping a batch from ending on `[skip ci]`.** Local commits keep their markers. The pre-push hook refuses a push that carries code when its last commit says `[skip ci]`, and its message tells the owner to add an empty trigger commit. This replaces the success criterion in the body about ship's landed commit having no `[skip ci]`.

**Effect on this issue:** the work now covers four workflows' closes, the pre-push hook and `bkit-cloud.yml`, so it no longer fits size `L` or the title "Ship a held build onto local dev without pushing". The design run should split it into plan issues.

## Issue comment — posted 2026-11-12T04:45:02.000Z

### Scope addition: where local-mode workflows start from (2026-11-12)

The owner confirmed this as in scope. Until now the issue covered only where local work **lands** (local `dev`). It also has to cover where each workflow **starts from**. Otherwise a feature lands on local `dev`, but the next workflow can start from `origin/dev` and miss it.

**Today** (`.bkit/workflows.md` § Common Workflow Anatomy):

<!-- prettier-ignore -->
| Workflow | Starts from | What goes wrong in local mode |
| --- | --- | --- |
| design / plan | always `origin/dev` | A design started after a local ship cannot see that feature's code or docs. A design or plan branch that carries unpushed `dev` work is refused at Step 2 (exit 7). |
| build / ship | local `dev` while it is a fast-forward of `origin/dev`, otherwise `origin/dev` | Once anything else lands on `origin/dev` (a cloud run, another machine), the build starts from `origin/dev` and leaves out the unpushed features. The run also tells the owner to push `dev` before the PR, which does not apply in local mode. |
| debug | adopts or resumes the existing branch | Nothing changes for an existing branch. A debug run that has to create its branch needs the same rule as build. |

**Rule for local mode:**

- Every workflow (design, plan, build, debug, ship) starts its worktree from local `dev`, always, including when local `dev` and `origin/dev` have split.
- When they have split, the run warns once with the ahead and behind counts and carries on. It does not refuse and does not fall back to `origin/dev`.
- Local mode drops design and plan's Step 2 refusal of a branch that carries unpushed `dev` work (exit 7).
- Local mode drops build and ship's "publish `dev` before the feature PR" narration.
- Published mode (`publish=true`) keeps today's rules unchanged.

**Success criterion:** after a local ship of feature A, a design, plan, build or debug run for feature B in local mode starts from a base that contains A's code, docs and ledger rows. A test covers both the case where local `dev` is only ahead of `origin/dev` and the case where the two have split.

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Single-commit landing: every workflow that brings work onto local `dev` lands it as ONE squashed commit per run; the worktree's per-step commit history is never replayed onto `dev` (owner note, mid-interview).
- Q2 Build in local mode: build keeps today's `publish=false` behaviour — held on `feat/{FID}` in its worktree; only local `/bkit-ship` lands it (keeps the deferred sweep, docs update and skill prune before code reaches `dev`).
- Q3 Debug in local mode: on a held `feat/{FID}`, debug commits the fix there and pushes nothing, so the branch stays held for ship; when debug runs in place on local `dev`, it commits there and skips the close push.
- Q4 Tracker links in local mode: keep the `blob/dev/...` links and add one line saying they resolve after the owner pushes `dev`.
- Q5 `/bkit-auto` in local mode: each delegated workflow reads its own `bkit.workflows.{workflow}.publish` setting and token; a `publish=` token given to `/bkit-auto` is passed through; nothing is pushed, so the `bkit-cloud.yml` auto-route starts nothing until the owner pushes.
- Q6 Main checkout not on `dev`: advance the `dev` ref by fast-forward only without checking it out; the owner's current branch and working files stay untouched.
- Q7 Concurrent landings: the second run waits on a lock until the first lands, then lands on top of it.
- Q8 Pre-land checks fail: the run stops before landing; local `dev` unchanged, worktree kept, failure reported (route to `/bkit-debug`).
- Q9 Draft acceptance scenario: accepted.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

The owner sets a workflow to local (setting or `publish=false`) and runs design, plan, build, debug and ship for a few issues in a row. Each works in its own worktree, starts from the owner's local `dev` so it sees what landed earlier, and brings its result onto local `dev` as one commit. Nothing reaches GitHub until the owner pushes `dev` once for the batch.

#### Success Criteria

1. After a local run, local `dev` holds one new squashed commit with the run's code, docs and ledger rows; `origin/dev` is unchanged; the run made no `git push`, no PR call and no Actions call.
2. A local run for feature B starts from local `dev` and contains feature A's code, docs and ledger rows from A's earlier local ship — both when local `dev` is only ahead of `origin/dev` and when the two have split (one warning with ahead/behind counts in the split case).
3. Without the setting or token, every workflow behaves exactly as today; cloud and Actions runs always publish.
4. On a batch push, the pre-push hook refuses a push that carries code and ends on a `[skip ci]` commit, telling the owner to add an empty trigger commit; `dev` CI maps every `{type}({FID}):` commit in the pushed range to its issue.
5. A local ship leaves the issue with `bkit:merged`, board `In review`, still open, plus a "landed on local dev, not pushed" comment.

#### Key Edge Cases

- Uncommitted edits in the main checkout overlap the incoming commit → run stops and says so; local `dev` and the edits untouched.
- Main checkout on a branch other than `dev` → `dev` ref fast-forwarded without checkout.
- Two local runs land at the same moment → serialised by a lock; second lands on top of the first.
- Affected tests / static checks fail on the combined result in the scratch checkout → no landing, worktree kept.
- Held feature branches: build holds, debug fixes the held branch, only ship lands it.

#### Process Sketch

- WHEN a local design or plan closes → THEN one squashed commit lands on local `dev`; nothing is pushed.
- WHEN a local build finishes → THEN it stays held on `feat/{FID}` and the issue says built locally, not published.
- WHEN a local ship runs on a held build → THEN the deferred sweep, docs update and skill prune run in the worktree, affected tests and static checks pass on the combined result, one commit lands on local `dev`, and the clean worktree and branch are removed.
- WHEN a local debug fixes a held branch → THEN the fix is committed there and stays held for ship.
- WHEN the owner pushes a batch → THEN the pre-push hook and `dev` CI run once and the automatic follow-up maps each FID in the range to its issue.
