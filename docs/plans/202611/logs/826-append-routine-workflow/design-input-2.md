## Session Prompt — this run's, newer than everything below

Fix the missing model metadata and resume bkit-design #826 from the saved work. Finish the design.

## Issue description — oldest

### Problem

Every workflow step posts its own new comment on the issue (`.bkit/trackers.md` § Interaction catalog, row `comment-post-step`: "new comment per workflow step"). A full `/bkit-build` posts one for Start Workflow, Worktree Setup, Branch Sync, Plan Convert, Plan Current, Install Skills, every tests / code / verify / group-gate attempt per task group, Plan Verify Holistic, Build Challenge, Run Tests, the diagnose / remediate loop, Summary and Close. The other five workflows do the same.

Two things go wrong:

- **The issue becomes hard to read.** The few comments a person needs (a question at a Decision Pause, a failure, the PR link) are buried between routine step reports.
- **Every step pings watchers.** A new comment sends a notification, so a person gets a ping for every routine step, not just the ones that need them.

### Outcome

Each workflow run keeps one **progress comment** on the issue. Routine steps add their section to it by editing it, which on GitHub sends no notification. A new comment is posted only when a person needs to act or be told:

- Decision Pause (`steps finish --step=build-decision`)
- Failure Path (`workflows fail`)
- Handover (`workflows handover`)
- The final close / Create PR comment

Start Workflow opens the progress comment.

### Success criteria

- A clean `/bkit-build` run with no pauses or failures leaves at most 2 bkit comments on the issue: the progress comment and the close / PR comment.
- A Decision Pause, a failure and a handover each still arrive as their own new comment.
- A comment a person posts mid-run stays below everything bkit wrote before it: bkit never edits a progress comment that is no longer the newest comment on the issue.
- Re-running a step does not add its section twice.
- Works on all three trackers (`github`, `linear`, `jira`), each within its own comment size limit.

### Constraints and non-goals

- **One code path.** Every step comment already goes through `postForVerb` → `postCommentOnce` in `.bkit/core/engine/commands/workflow/tracker.ts`. The change belongs there, not in each verb.
- **The engine re-sends its own copy.** Jira returns comments in different markdown than was sent (`.bkit/trackers.md` § jira notes: checkboxes and alerts come back escaped). Appending by reading the comment back and re-sending it would damage earlier sections on every edit, so the engine keeps the full body itself and sends that.
- **Size limits.** GitHub caps a comment at 65,536 characters and Jira at 32,767. When the next section would not fit, the engine starts a new progress comment.
- **Each section shows its own time.** The comment timestamp no longer tells you when a step ran.
- **`###### bkit:generated` stays the first line**, so `bkit issues text` keeps dropping the comment from workflow input.
- **The MCP fallback keeps posting a new comment.** When a verb prints `tracker.done: false`, the agent still posts `commentFile` as a new comment. Agents never edit tracker comments.
- **Not in scope:** the manual **Tracker work comments** rule in `.agents/rules.md` (one comment per major turn outside workflows). That rule covers separate commits and findings and stays one comment each.

### Decisions already made

- Routine steps append to the progress comment; Decision Pause, Failure Path, handover and close / Create PR post new comments.
- The MCP fallback is left alone and posts a new comment.

### Open questions

- **Jira notifications.** GitHub sends no notification for an edited comment. Jira's default notification scheme has a "Comment Edited" event that may notify watchers on every edit. Does the change hold up on Jira, or does Jira need a different approach?
- **Duplicate check for verbs without `--file`.** Today those check the first-line hash against the issue's last 5 comments (`RECENT_COMMENTS`). With several sections in one comment, the check needs a marker per section. What does that marker look like?
- **Wording of the agent rule.** All six workflow files say "NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior tracker content" next to the fallback. Does it need rewording so it clearly binds agents and not the engine's own progress comment?
- **`/bkit-auto`.** It posts Start Workflow and Dispatch, then hands over to a phase workflow. Does that phase workflow append to auto's progress comment or open its own?

### References

- `.bkit/core/engine/commands/workflow/tracker.ts` — `postForVerb`, `postCommentOnce`, `postComment`, `recentComments`, `RECENT_COMMENTS`
- `.bkit/trackers.md` § Interaction catalog (`comment-post-step` row), § Issue shapes (`###### bkit:generated` line), § jira notes (markdown round trip, 32,767 limit)
- `.bkit/core/workflows/bkit-auto.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-design.md`, `bkit-plan.md`, `bkit-ship.md` — the **Comments:** bullet for each tracker
- `.bkit/cli.md` — `steps finish`, `issues comment`, `workflows fail` / `handover` / `close` `--post`

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Automatic dispatch: Yes — each dispatched phase opens its own progress comment. Owner: "Yes both".
- Q2 Notification requirement: Yes — consolidation may ship where edit notifications cannot reliably be suppressed; document the limitation. Owner: "Yes both".
- Q3 Two-comment limit: Yes — the limit applies when progress fits and no fallback or intervening comment requires another. Owner: "q3 and q4 yes to both".
- Q4 Draft acceptance scenario: Yes — accept the draft as the design's starting point. Owner: "q3 and q4 yes to both".

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and my replies keep their place in the conversation.

#### Success Criteria

1. An uninterrupted build produces at most two comments when its progress fits within one comment and no fallback is needed: progress and completion.
2. Decision pauses, failures, handovers and close / PR reports each receive a new comment.
3. Routine updates extend only the run's newest progress comment while it remains the newest comment on the issue; otherwise, they start another.
4. Repeating the same step report adds no duplicate section; each section displays its own time.
5. GitHub, Linear and Jira respect their comment limits. Each dispatched phase owns its progress comment, and notification limitations are documented.

#### Key Edge Cases

- Someone replies, or another workflow posts, between routine updates.
- A comment reaches its size limit.
- A step retries or a workflow resumes.
- Posting through the fallback creates a new comment.
- A tracker still sends notifications for edits.

#### Process Sketch

- WHEN a workflow starts → THEN its progress comment opens.
- WHEN a routine step finishes → THEN its timestamped section joins the eligible progress comment.
- WHEN another comment intervenes or the size limit is reached → THEN progress continues in a new comment.
- WHEN the same report repeats → THEN its section appears only once.
- WHEN attention is needed or the workflow ends → THEN a separate comment appears.
- WHEN auto dispatches a phase → THEN that phase opens its own progress comment.
