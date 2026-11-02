## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Rules shown by edit tools: B. Owner: "q1 - no, B, keep it simple, detect edit more reliably and show same advisory to all, other idea record for future but not now". File-type-specific advisories are outside this change and must be recorded for future consideration.
- Q2 Scripts with unknown targets: A. Owner: "q2 - yes, A". Warn for scripts that might write files when their targets cannot be determined; exclude commands clearly identified as read-only.
- Q3 Same advisory everywhere: A. Owner: "A)". Shell edits and edit tools both show the same general authoring advisory, with no file-type-specific section selection in this change. This supersedes the issue's original shell requirement to quote sections selected by file kind.
- Q4 Draft acceptance scenario: A. Owner: "A)". Accept the draft below as the design's starting point.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

#### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with sources.
5. Consumer installs receive the hook improvements and requested rules/header pointers. File-type-specific advisories are recorded as future work.

#### Key Edge Cases

- Computed script targets cannot always be determined before execution.
- A file touched through both shell and edit tools should not receive duplicate first-touch advice.
- Hook failures retain the existing fail-open behavior: they do not stop the command.
- This change adds no shell blocking, after-edit checks, or file-type-specific rule selection.

#### Process Sketch

- WHEN an edit tool first touches a file → THEN show its checklist and the general advisory before the edit.
- WHEN a shell edit has known targets → THEN show the same advice for each target not already recorded.
- WHEN a script might write but its targets are unknown → THEN warn about that uncertainty and the required authoring reads.
- WHEN a command is clearly read-only → THEN omit the shell-edit warning.
- WHEN a host cannot intercept an edit method → THEN document the supported boundary.

