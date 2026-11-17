Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 10: ship pushes all set BKIT_PR_CONFLICT_CHECK=false — Step 4/8/10 pushes switched, ship-invariants expectations updated, templates.md both copies, snapshot and mirrors regenerated (.bkit/core/workflows/bkit-ship.md)
DONE — TASK 11: debug feature-branch pushes set BKIT_PR_CONFLICT_CHECK=false — four pushes switched, snapshot and mirrors regenerated (.bkit/core/workflows/bkit-debug.md)
DONE — TASK 12: shallow clone skips base fetch and merge-tree with one WARN naming git fetch --unshallow (.husky/pre-push, .bkit/templates/.husky/pre-push, templates.md)
NOTE — bkit tests changed exited 75/81: machine tests lock held by other worktrees for 1200s; targeted vitest on ship-invariants, debug-ci-evidence, husky-pre-push, render passed
