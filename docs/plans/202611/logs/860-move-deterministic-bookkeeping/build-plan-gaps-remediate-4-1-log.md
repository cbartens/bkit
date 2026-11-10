Verdict: CONCERNS
Strategy: STANDARD
Fixed: 9

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: runs handoff re-poll head identity — runHandoff resolves the printed re-trigger commit/remote back to the original-head target via resolveHandoffHead (.bkit/core/engine/commands/workflow/runs.ts)
DONE — Gap 2: runs handoff no-PR target — --pr optional, empty/absent = pr null for a shared-branch run (runs.ts; cli.md regenerated via pnpm cli:sync)
DONE — Gap 3: exit 80/81 hint — with an engine invocation dispatchCode now names `runs handoff --invocation` and re-run with the same --invocation, no --poll-result/--attempts (runs.ts)
DONE — Gap 4: prompt migration — 29 prompts updated one by one by edit/script (ledgers query for ledger reads, runless/engine invocation + --operation receipt appends, structured-result and steps-finish ownership lines, stub-seed Fingerprint line); bkit-plan now saves a knowledge query for the shell-less reviewers; new shared clauses plus Local Instructions entries in .bkit/instructions.md; instructions check clean (.bkit/core/prompts/*.md)
DONE — Gap 5: four-paragraph wording + precedence — added as workflow clauses workflow-deterministic-bookkeeping, workflow-recoverable-execution-errors, workflow-uncertain-effects, workflow-failure-boundary, workflow-recovery-precedence and in all six workflows (.bkit/instructions.md, .bkit/core/workflows/*.md)
DONE — Gap 6: caller contracts — bkit-auto dispatch/invocation/recovery lines; bkit-plan knowledge query for reviewers; design/plan/ship carry the full recovery paragraphs (.bkit/core/workflows/bkit-auto.md, bkit-plan.md)
DONE — Gap 7: rules.md — new Recovery precedence rule and query-based Check gotchas first (.bkit/core/.agents/rules.md; instructions rule entries, 7 carrier prompts rewritten by sync)
DONE — Gap 9: Special Behaviors entry for Engine-owned model evidence added to .bkit/instructions.md; instructions check mode exits 0 (sync run in --write form only after the entry existed)
DONE — Gap 8: docs rows — architecture.md (Deterministic bookkeeping ownership), observability.md (Bookkeeping effects and receipts), testing.md (Deterministic bookkeeping test coverage)
BLOCKED — Gap 10: instructions.test.ts recovery precedence test timeout — planned test, cannot be edited; it passes alone (11 s) and times out only at load average 20+ (72 renderings); no needless work found in the rendering code to cut cheaply
DONE — pnpm build exit 0 after the runs.ts edits; runs.test.ts 191 passed; instructions check and cli:sync clean; shell-based edits: node/python scripts for bulk mechanical inserts across prompts, workflows and instructions.md
