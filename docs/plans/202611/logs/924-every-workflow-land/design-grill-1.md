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
