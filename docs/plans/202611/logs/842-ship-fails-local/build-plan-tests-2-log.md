Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 5: GateResult fields and existing gate exit codes from .bkit/core/engine/commands/workflow/runs.ts:936 and snapshot ancestry fields from runs.ts:2018. New ship-only opt-in: --fresh-base, exit 19 for stale dev and 20 for missing evidence, retaining direct-head/post-merge defaults.
SOURCE — TASK 5: MCP --facts-file envelope is {ownerRepo, prNumber, headRefName, baseRefName, pr, ci:{workflowRuns,jobs}, base:{ref,sha,comparedHead,status}}. CI payloads use the existing Actions workflow_runs/jobs API shapes; PR identity uses the existing PrInfo fields; base status is the scoped GitHub compare status.
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/runs.test.ts` `refuses green CI when dev advanced beyond the validated code head`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/runs.test.ts` `does not let bookkeeping or a CI override waive stale dev ancestry`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/runs.test.ts` `checks the named repository base and fails closed on missing evidence`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/runs.test.ts` `refuses stale or missing MCP base evidence despite green CI without gh`
SOURCE — TASK 6: PrInfo fields and merge result/base refusal from .bkit/core/engine/commands/workflow/prs.ts:57,575,606. New ship-only --ship-retry preserves generic/default behavior; unused merge-verb codes 9 (route revalidate) and 10 (route integrate), existing 7 (route stop) and 5 (unreadable state).
SOURCE — TASK 6: MCP --facts-file envelope extends existing scoped probe facts: {ownerRepo,prNumber,headRefName,baseRefName,matchHead,before:PrInfo,after:PrInfo}, with --owner-repo required; classifiers must not call gh or attempt a second mutation.
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies a refused merge whose pinned head moved as revalidation`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies a refused merge with a new dev conflict as integration`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/prs.test.ts` `returns an explicit terminal reason for other merge refusals`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies independent MCP merge refusal facts without gh`
SOURCE — TASK 7: Existing reconciliation outputs head/reconciledHead/basePath and pending target from .bkit/core/engine/commands/workflow/branches.ts:2402,2521,3397; target continuation checks pending MERGE_HEAD against target at branches.ts:2262. Workflow fixtures use the real source markdown and existing section/fencedLinesByStep helpers.
SOURCE — TASK 7: Workflow wiring contracts are --reconcile-feature before PR open and base classification, --fresh-base/--ship-retry with bounded step-3/step-9 routes, existing MERGE_ATTEMPT accounting, --target={MERGE_TARGET} continuation, scoped --facts-file for all three safety classifiers, and recorded feature-code state/fingerprint for sweep/docs reuse.
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `reconciles and publishes feature code before bookkeeping on every ship path`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes stale bases and refused merges through the bounded integration or validation loop`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `passes the actual merge target and defers branch deletion to guarded close`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes MCP safety facts through engine decisions with transport accounting`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ties deferred sweep and docs reuse to the recorded feature code state`
