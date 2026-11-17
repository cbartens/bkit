Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 2: local-gate-audit branches push count for bkit-ship.md — expected 7 corrected to 6; cause verified: main had 5 sites, this branch adds 2 (Create PR and one more with --set-upstream) and removes 1 (old failure-path push), net 6 (.bkit/core/engine/audits/workflows/local-gate-audit.test.ts)
BLOCKED — Gap 1: clauses workflow-try-again-return (only bkit-debug) and workflow-round-read-back (only bkit-build) fell under the cut-off; no remaining ship step carries either sentence, and rewording would change behaviour; removing the two clause entries from .bkit/instructions.md (the store doctrine: under-used sentence goes back inline) was denied by the permission classifier as clause deletion, and the task forbids deleting a clause to pass — owner decision needed
BLOCKED — Group gate: not run; Gap 1 (instructions.test.ts cut-off) is unresolved so the gate would still fail
