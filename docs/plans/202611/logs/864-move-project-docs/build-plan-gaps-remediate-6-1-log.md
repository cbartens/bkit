Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 19 every-unusable-row advisory — new listIndexedEquivalents; detectProjectDocs names all candidate rows in project-docs-ambiguous; test added (.bkit/core/engine/install/project-docs.ts, .bkit/core/engine/checks/after/tools.ts, tools.test.ts)
DONE — Gap 2: TASK 21 unparsed rows on install/upgrade — syncProjectDocs reports indexProblem and adds no row when the index has an unreadable row; cellPath rejects emphasis markers (*, ~) so **path** counts as unparsed; test added (.bkit/core/engine/install/project-docs.ts, project-docs.test.ts)
BLOCKED — bkit:generate: build and upgrade ran (dist/ updated); the final vitest render step gave up after 60s on the machine-wide tests lock held by worktree 787-show-authoring-rules (no code error)
BLOCKED — Group gate: bkit tests changed exited 81 after waiting 1200s on the same tests lock; targeted vitest on project-docs.test.ts and tools.test.ts passed (65 tests) and tsc -p . and tsconfig.test.json exit 0
