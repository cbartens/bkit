Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 27: engine-only row types and parseStatusLines; `status row` refuses decision-counts and decision-answer (ledgers/status.ts, commands/workflow/status.ts)
DONE — TASK 28: `decisions counts --decision` appends a decision-counts row and prints show; engineStub and engineWith removed; apply and pending now append decision-answer rows so no -engine.md is written (decisions.ts, cli.md)
DONE — TASK 29: one row reader folds decision-counts and decision-answer rows, last appended wins; engineSibling, isEngineFile, mergeItems, mergeHeader and TAKEN_UNASKED removed (open-decision.ts)
DONE — TASK 30: every caller reads through the row reader with no engine text (challenge.ts, summary.ts, workflows.ts, status.ts, steps.ts, decisions.ts)
DONE — TASK 31: empty item list reads OPEN, openDecision carries questions (status resume prints it), headless apply exits 6 with a problem, tasks tick reads Accept rows (open-decision.ts, decisions.ts, status.ts)
DONE — group 8 note: 16 older decisions.test.ts apply/pending/check tests still assert the -engine.md layout and fail until group 9 (tasks 32-35) takes them over; every group 8 planned test, and the status, workflows, tasks, steps, challenge, summary and open-decision test files, pass; tsc and oxlint are clean
