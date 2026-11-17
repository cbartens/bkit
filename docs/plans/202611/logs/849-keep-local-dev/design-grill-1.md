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
