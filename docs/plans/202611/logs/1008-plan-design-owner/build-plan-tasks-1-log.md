Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: status fold carries start-row progress — fold copies progress; status.test.ts passes (.bkit/core/engine/ledgers/status.ts)
DONE — TASK 2: session link from progress-id file — newSessionDir writes progress-id, sessionPublication hashes it; repo/tracker/issues unit tests pass (repo.ts, tracker.ts)
BLOCKED — TASK 3: test `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — final assertion `rows(cwd).at(-1)?.type` toBe "workflow-started" cannot hold: the keyed post from the main checkout legitimately appends an engine-action row, so the last row is engine-action; the one-comment assertions before it pass
DONE — TASK 3: start row records progress, tracker reads it — workflows.ts start writes progress, progressBinding reads run.progress, bindRunPublication/runPublicationFile deleted; workflows.test.ts passes, 27/28 integration pass (workflows.ts, tracker.ts)
DONE — TASK 4: runActionKey names latest run — endedRunActionKey deleted, issues.ts/workflows.ts use runActionKey; tracker, issues, workflows, integration tests pass; pnpm build done; graph:refresh reads staged files so docs/capabilities.md needs the caller to stage and refresh (tracker.ts, issues.ts)
DONE — TASK 7: moved-status-file test checks folded run status; code map matches — tracker.integration.test.ts 28/28 pass, graph:check passes after graph:clean (committed capabilities.md/DETAILS.md already current) (.bkit/core/engine/commands/workflow/tracker.integration.test.ts, docs/capabilities.md)
