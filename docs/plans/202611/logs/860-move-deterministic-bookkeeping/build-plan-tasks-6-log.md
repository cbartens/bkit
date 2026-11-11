Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 18: canonical request hash — `canonicalJson` (sorted keys) used for the issued operation id and stored request hash (.bkit/core/engine/commands/workflow/ledgers.ts)
DONE — TASK 19: audit ledger keys now `audit-<slug>-<content-slug>` (.bkit/core/engine/commands/workflow/issues.ts)
DONE — TASK 20: `renderResult` requires boolean `evidenceComplete` and a non-empty body for PASS; existing steps tests' `resultFile` helper now passes `evidenceComplete: true`; 10 prompts and their instructions.md entry say to always state it (steps.ts, steps.test.ts)
DONE — TASK 21: 8 query-reading prompts page until `nextCursor` is null and route on `coverage.status` (missing/partial/unreadable); instructions.md entries synced (.bkit/core/prompts/*)
DONE — TASK 22: committed `invocation` event holds checkout-relative `statusPath`/`bookRoot` and a one-way `worktree` fingerprint; `rebuildInvocation` resolves against the current top and refuses another checkout's event; receipt and printed result keep absolute paths (lib.ts, status.ts; docs/architecture.md)
NOTE: tasks 22 edits to status.ts and lib.ts were made with a one-off python script before I switched to the Edit tool; dist rebuilt with pnpm build; .claude/agents mirrors not regenerated (orchestrator end-of-session install).
