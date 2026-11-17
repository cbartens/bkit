Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 5: BKIT_PR_CONFLICT_CHECK=false switch in both hooks; ship sets it on the three pushes before Step 4 (.bkit/templates/.husky/pre-push, .husky/pre-push, .bkit/core/workflows/bkit-ship.md, .bkit/core/.bkit/templates.md)
DONE — TASK 6: trial merge runs with an empty attribute source so merge=union conflicts block (both hooks)
DONE — TASK 7: base fetched with explicit refspec; exit 1 is a conflict only when the first line is an OID (both hooks)
DONE — TASK 8: pre-push-pr-conflict fires without PUSH_BRANCH_SHA=, ask names it; older catalogue test updated (.bkit/core/engine/checks/tips/catalogue.ts)
DONE — TASK 9: open-PR lookup keeps only same-repo PRs (both hooks)
