Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 2: TASK 4 capabilities graph — ran pnpm bkit:graph:refresh; docs/capabilities.md and DETAILS.md rewritten, graph:check compares against the committed copy so it passes once the caller commits both (docs/capabilities.md, DETAILS.md)
BLOCKED — Gap 1: test `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — the planned last assertion (line 800, rows(cwd).at(-1)?.type toBe "workflow-started") is wrong: a keyed post legitimately appends an engine-action row; code is correct, the tests step must assert the folded run status or no close row instead
