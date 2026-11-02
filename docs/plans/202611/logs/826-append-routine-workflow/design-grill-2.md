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
