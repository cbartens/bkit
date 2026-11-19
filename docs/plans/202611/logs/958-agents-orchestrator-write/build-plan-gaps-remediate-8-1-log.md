Verdict: FAIL
Strategy: STANDARD
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: TASK 28 decision-counts row now carries attempt, max and progress (problems, gate failures, code changed, strategies, minutes, trend) in loop; row test added (.bkit/core/engine/commands/workflow/decisions.ts, ledgers/status.ts)
DONE — Gap 2: TASK 31 pauseStatus reads OPEN for a file with no parseable question whatever its Status line; test added (.bkit/core/engine/commands/workflow/open-decision.ts)
DONE — Gap 3: TASK 29 only a Status: header (or a text-only source, which cannot have rows) marks an old file; Gate-header test added (.bkit/core/engine/commands/workflow/open-decision.ts)
BLOCKED — Group gate: tests changed shows 16 decisions.test.ts apply/pending failures (named by verify as routed to group 9 / holistic) and workflow-shape.test.ts "decisions counts: no --out" (workflow files still pass --out); none caused by these fixes, not in the 3 gaps
