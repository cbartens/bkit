Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 13: Chose a separate summary file over splicing (the report's bkit:anchor must stay on top and its Fingerprint would go stale on step 12 edits): when --to already holds a report, the audit summary goes to <result-file>.summary.md and the output prints reportKept (.bkit/core/engine/commands/workflow/steps.ts, .bkit/core/prompts/bkit-audit-generate.md). Planned test steps.test.ts `audit result render keeps an existing anchored report intact` still fails on a test-setup error: it writes docs/audits/security.md without creating docs/audits (ENOENT in the test's own write). Verified the behaviour by hand with dist/cli.js.
BLOCKED — TASK 13: test `.bkit/core/engine/commands/workflow/steps.test.ts` `audit result render keeps an existing anchored report intact` — never reaches the engine: write() into docs/audits fails with ENOENT because the test does not mkdir docs/audits; needs fs.mkdirSync(path.join(cwd, "docs/audits"), {recursive:true}) before line 2502
DONE — TASK 14: Request hash is now {ledger, rows} without the invocation id, so an operation stays replayable by id under a newer invocation; replay writes the recorded bytes (.bkit/core/engine/commands/workflow/ledgers.ts). Intents/receipts stay in .bkit/ledger-operations.jsonl; storage move left to Task 23.
DONE — TASK 15: auditLedgerRows no longer emits `by`; the engine fills it from the invocation (.bkit/core/engine/commands/workflow/issues.ts)
DONE — TASK 16: Re-trigger push at commit-created blocks any remote tip that is not the commit or its ancestor, regardless of origin/<branch> (.bkit/core/engine/commands/workflow/runs.ts)
DONE — TASK 17: Reconcile throws UncertainEffect when any prefix of the prepared block sits at the recorded offset, before the prepare-afresh branch (.bkit/core/engine/commands/workflow/ledgers.ts)
