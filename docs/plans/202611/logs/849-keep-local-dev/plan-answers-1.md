## Owner answers

### Question

The design file on `origin/dev` (`3e69d12e3`, the last commit to touch it) still holds WS-1 to WS-4, P-1 and P-2 and the recovery-tool Acceptance Scenario; the in-place edit the issue comment of 2026-11-10 describes is not on `origin/dev` or in this worktree. This plan follows the issue's newer Scope decision and comment.

**Answer:** A

Decision: none

### Question

Ship's Close Workflow is Step 14 today. With Step 13 removed, should it become Step 13?

**Answer:** A

Decision: 849-ship-close-renumbered-step-13

### Question

The design writes one `friction` row when the sync's catch-all maps an exception to `unavailable: internal`. A `friction` row is a write to `.bkit/friction.jsonl` in a checkout, which the newer Success Criterion "working-tree edits … are never changed by the automatic sync" forbids, and the issue drops the `friction` row for install failures.

**Answer:** A

Decision: 849-sync-catch-all-no-friction-row
