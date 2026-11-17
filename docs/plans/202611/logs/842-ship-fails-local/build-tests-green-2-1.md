Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/runs.test.ts` "refuses green CI when dev advanced beyond the validated code head" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/runs.test.ts` "does not let bookkeeping or a CI override waive stale dev ancestry" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/runs.test.ts` "checks the named repository base and fails closed on missing evidence" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/runs.test.ts` "refuses stale or missing MCP base evidence despite green CI without gh" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/prs.test.ts` "classifies a refused merge whose pinned head moved as revalidation" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/prs.test.ts` "classifies a refused merge with a new dev conflict as integration" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/prs.test.ts` "returns an explicit terminal reason for other merge refusals" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/prs.test.ts` "classifies independent MCP merge refusal facts without gh" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "reconciles and publishes feature code before bookkeeping on every ship path" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "routes stale bases and refused merges through the bounded integration or validation loop" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "passes the actual merge target and defers branch deletion to guarded close" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "routes MCP safety facts through engine decisions with transport accounting" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ties deferred sweep and docs reuse to the recorded feature code state" | red | passed |

## Gaps

None.
