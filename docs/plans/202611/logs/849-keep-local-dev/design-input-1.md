## Session Prompt — this run's, newer than everything below

/bkit-design #849

## Issue description — oldest

### Problem

Local `dev` and `origin/dev` repeatedly end up ahead/behind one another after workflows finish. Users must reconcile them manually, and a successful close does not clearly distinguish successful remote landing from successful local synchronization.

Source inspection on 2026-11-03 found:
- Ship Step 13 runs `branches sync-dev` before Step 14 lands the final DONE bookkeeping commit. The close can therefore move remote `dev` again after local synchronization.
- `syncDevVerb` returns success when `fastForwardDev` reports `skipped`. This preserves the landing but must not be presented as proof that local `dev` is synchronized.
- `fastForwardDev` refuses non-fast-forward updates and prints generic pull/rebase/push advice. Local-only commit identities can include changes already published through a squash or copied commit, so generic replay advice is insufficient.
- The shared landing routine deliberately uses a throwaway checkout to avoid publishing unrelated local commits or disturbing another agent's work. Keep that protection.

The checkout reported 19 commits ahead and 1 behind its cached `origin/dev` during investigation. No fetch was performed; this is an observed local snapshot, not a verified live remote count. No workflow reproduction or failing test has been run yet.

### Outcome

Prevent routine local lag at workflow close and provide a deliberate recovery utility for existing divergence. Reuse shared engine logic for both paths.

Recommended approach:
1. After the final successful landing, fetch and classify local/remote state. Extend the existing `branches sync-dev` behavior rather than create a second implementation.
2. When local `dev` is only behind, advance it by fast-forward where the checkout can be safely updated. When already equal, report that explicitly.
3. When local `dev` is ahead, divergent, busy, or cannot be updated safely, preserve it and report counts, reason, and the recovery entry point. Keep remote landing success separate from local synchronization status.
4. Add a proposed `bkit-utility-sync-dev` prompt to inspect both histories, account for changes already published as copies or squashes, prepare reconciliation, run appropriate checks, and obtain approval for any push under the standalone push rules.

Close-only prevents routine lag but does not recover existing divergence. Utility-only leaves recurring manual work. Both should share the same state classification and safeguards.

### Success criteria

- Every close path that lands on `dev` reports local synchronization after its final landing, including ship DONE bookkeeping; existing design/plan synchronization is reused and checked.
- A clean, behind-only local `dev` advances safely; equal branches are a no-op. Fresh comparison results distinguish ahead, behind, divergent, skipped, and unavailable states.
- Local commits, staged changes, working-tree edits, the active branch, and other worktrees are preserved. Close never publishes unrelated local work.
- The recovery utility explains which changes remain unpublished and which may already be represented remotely; it never blindly replays or pushes all local commits.
- Tests cover equal/behind/ahead/divergent states, dirty or occupied worktrees, copied/squashed changes, fetch failures, remote movement during synchronization, and a close PR that remains unmerged.

### Constraints and non-goals

- No reset, force-push of shared branches, automatic stashing, or silent rewriting of shared history.
- Automatic close synchronization is limited to safe fast-forwards. Reconciliation requiring judgement is explicit.
- A successful remote landing remains successful when local synchronization is blocked; the final result must disclose the unresolved local state.
- Reuse engine commands; keep the utility thin and behavior consistent across providers.
- Feature-branch catch-up and pre-merge CI validation belong to [#842 — Ship fails when the local feature branch differs from GitHub's](https://github.com/cbartens/bkit/issues/842).
- This issue documents the proposal; it does not authorize an immediate push or reconciliation of the current checkout.

### Decisions already made

- File under [#99 — Friction triage](https://github.com/cbartens/bkit/issues/99), as explicitly requested, although that parent is now closed.
- Preserve the isolated landing architecture.
- Automatic close synchronization plus a recovery utility is the recommendation; detailed recovery policy still needs design.

### Open questions

- Define the shared synchronization result and how close summaries surface a successful landing with unresolved local divergence.
- Define how recovery proves changes are already represented by squashes or copied commits, and what it does when that cannot be proven.
- Choose the non-destructive reconciliation strategy and concurrency safeguards for an occupied `dev` worktree.
- Confirm coverage of roadmap mirrors and failure-record landings, alongside ordinary successful closes.

### References

- [#639 — Land parallel workflow closes on dev without colliding](https://github.com/cbartens/bkit/issues/639): existing safe-fast-forward and isolated-landing contract.
- [#842 — Ship fails when the local feature branch differs from GitHub's](https://github.com/cbartens/bkit/issues/842): especially gap E, inherited unpushed `dev` changes later represented by a squash. Related work, not an established blocker.
- `.bkit/core/workflows/bkit-ship.md` § Step 13 — Update Local Dev; § Step 14 — Close Workflow.
- `.bkit/core/engine/commands/workflow/branches.ts`: `syncDevVerb`, `fastForwardDev`, `pushOwnCommits`.
- `.bkit/core/engine/commands/workflow/workflows.ts`: `shipClose`.
- `.bkit/core/engine/commands/land.ts`: shared isolated landing routine.

Priority: High — recurring synchronization defect and misleading success reporting. Size: M — shared engine behavior, close integration, utility prompt, and regression coverage. Next step: design.

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Which pushes to dev get a local-sync check: every push to `dev` — design/plan close (`branches land`), ship close (`workflows close`, incl. close-PR fallback), build/debug `branches push --mode=dev`, failure-record handovers (`workflows handover --push`) and roadmap mirror pushes.
- Q2 Ship ordering: move the local sync into `workflows close` so it runs after the final `ship DONE` landing; drop ship Step 13 (`branches sync-dev` before the close) as a separate step.
- Q3 Reporting a blocked local sync: the close stays a success (exit 0); the final return adds a plain line with what landed, local `dev` ahead/behind counts, the reason it was not moved and the recovery command.
- Q4 Recovery tool form: a new engine command that inspects and classifies both histories (e.g. `bkit branches dev-status`) plus a thin `bkit-utility-sync-dev` prompt.
- Q5 Reconciliation strategy: replay only unpublished local commits onto `origin/dev` in a throwaway checkout, run checks, show result, push only after owner approval, then move local `dev` onto it keeping a backup branch of the old tip.
- Q6 Proving "already on GitHub": `git cherry` patch-id match first; for unmatched commits, every touched file's content identical on `origin/dev`; anything unproven counts as unpublished and is kept.
- Q7 Automatic sync with uncommitted edits on dev: fast-forward when git accepts it (`merge --ff-only` touching no edited file); otherwise skip and report.
- Q8 Backup branch: `dev-backup/{YYYYMMDD-HHMMSS}`, kept until the owner deletes it.
- Q9 Recovery checks: the deepest declared local gate (`bkit:gate:*`, as `bkit tests run`) in the throwaway checkout before asking to push.
- Q10 Ship close-PR fallback: local sync reports "landing pending" and moves nothing; does not wait for the PR.
- Q11 Install after fast-forward: keep the frozen install when the main checkout is on `dev` and was moved, on every syncing path.
- Q12 Draft acceptance scenario: accepted.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

When I finish a design, plan or ship run, or anything else pushes to `dev`, my local `dev` ends level with GitHub's whenever it safely can. When it can't, the final message tells me plainly that my work landed, how far my local `dev` is ahead or behind, why it wasn't moved, and which command fixes it. For divergence I already have, a recovery tool works out which of my local commits are really unpublished, prepares a clean result and pushes nothing until I approve.

#### Success Criteria

1. After any close or push to `dev` (design, plan, ship including its final `ship DONE` commit, build/debug `--mode=dev`, failure records, roadmap mirrors), a clean, behind-only local `dev` ends equal to `origin/dev`.
2. Every such path reports one local-sync result: equal, fast-forwarded, ahead, divergent, blocked (with reason) or unavailable (fetch failed); a blocked local sync never turns a successful landing into a failure.
3. Local commits, staged changes, working-tree edits, the active branch and other worktrees are never altered by automatic sync.
4. The recovery tool classifies every local-only commit as already-on-GitHub (patch-id or identical file content) or unpublished, pushes only unpublished ones, only after approval, with a `dev-backup/{timestamp}` branch kept.
5. Tests cover equal/behind/ahead/divergent, dirty and occupied worktrees, copied/squashed commits, fetch failure, `origin/dev` moving during sync, and a ship close-PR that stays unmerged.

#### Key Edge Cases

- `origin/dev` moves between landing and sync: one fetch, compare against that, report the state actually observed.
- Ship close falls back to an unmerged PR: local sync reports "landing pending", not "equal".
- `dev` checked out in another worktree: git refuses; report "blocked: occupied".
- A local commit published inside a larger squash: patch-id misses, the file-content check decides.
- Two parallel closes: each only fast-forwards; the later wins, neither breaks the other.

#### Process Sketch

- WHEN a close lands on `origin/dev` and local `dev` is clean and only behind → THEN local `dev` is fast-forwarded and the final message says local dev synced.
- WHEN local `dev` has commits `origin/dev` lacks → THEN it is left untouched and the final message says landed; local dev N ahead / M behind; run `/bkit-utility-sync-dev`.
- WHEN the fetch fails → THEN the landing still counts as done and local sync reports unavailable.
- WHEN the recovery tool runs → THEN it lists already-published vs unpublished local commits, prepares a replay in a throwaway checkout, runs the gate and waits for approval.
- WHEN the owner approves → THEN it pushes, keeps `dev-backup/{timestamp}` and moves local `dev` onto the result.
