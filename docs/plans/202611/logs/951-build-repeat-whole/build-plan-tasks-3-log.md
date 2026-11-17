Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 10: Step 12 records a full-gate receipt — `tests run` calls the exported `runWithReceipt` for the required push gate when `--changed-since` is unset, tolerating min-push paths; a lock wait records no receipt (.bkit/core/engine/commands/ci/push-gate.ts, .bkit/core/engine/commands/workflow/tests.ts)
DONE — TASK 11: A new branch reuses a receipted ancestor — `hasVerifiedIncrement` searches the new sha's ancestors for a receipt when the old sha is all zeros (.bkit/core/engine/commands/ci/push-gate.ts)
DONE — TASK 12: Docs state the new rule — receipt and changed-files rules in the shipped workflow and template docs and the deployments rules; generated copies refreshed (.bkit/core/.bkit/workflows.md, .bkit/core/.bkit/templates.md, docs/deployments.md)

## Checks

- `vitest run .bkit/core/engine/commands/ci/push-gate.test.ts .bkit/core/engine/commands/workflow/tests.test.ts`: 190 passed.
- `vitest run .bkit/core/engine/render -u`: 290 passed, no snapshot changes.
- `node dist/cli.js check`: exit 0, advisories only.
- `pnpm bkit:lint:prose`: 0 errors.
