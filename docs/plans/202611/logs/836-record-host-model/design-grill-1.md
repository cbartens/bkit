## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Unverified subagent models: A. Show actual models when known; otherwise show the configured model separately as unverified.
- Q2 Model changes: A. Record the initial identity, then collect available model evidence at close across the whole run, including switches and resumed sessions.
- Q3 Commit metadata: B. Include host information in workflow commit messages as well as logs and stats.
- Q4 Commit trailer meaning: A. Each commit names the host creating that commit, or explicitly says unknown. The owner specifies lowercase bkit; the exact trailer is `bkit-host`.
- Q5 Draft acceptance scenario: A, yes. The owner accepted the draft, with the trailer spelling corrected to `bkit-host`.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

After a workflow finishes, I can tell from the repository which hosts and models did the work, including subagents and resumed sessions. I can also see the host responsible for each workflow commit in its `bkit-host` trailer.

#### Success Criteria

- All five supported hosts produce a session record; uncertain identification explicitly records `unknown`.
- Chat identifiers are fingerprinted, never stored raw in ledgers.
- Run outcomes and `bkit stats` report observed models across the run, with configured fallback models clearly marked unverified.
- Workflow commits carry `bkit-host`, naming the committing host or `unknown`.
- Unreadable host records never prevent workflow completion.

#### Key Edge Cases

- One host launches another and passes along its environment variables.
- Models switch, subagents use different models, or a workflow resumes on another host.
- Host records are missing, unreadable, or cannot be confidently linked to the run.

#### Process Sketch

- WHEN Codex runs inside a Claude Code shell → THEN the session identifies Codex when supported by reliable evidence.
- WHEN the host cannot be determined → THEN the session and commit trailer explicitly say `unknown`.
- WHEN models change during a run → THEN the final report includes the observed models.
- WHEN a subagent's actual model is unavailable → THEN its configured model is shown as unverified.
- WHEN another host resumes the workflow → THEN both sessions remain represented, and subsequent commits name their committing host.
- WHEN local host records cannot be read → THEN the workflow completes with the reporting gap visible.

