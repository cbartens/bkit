Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "parses explicit and existing branch tokens without consuming URLs" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "rejects missing explicit and ambiguous existing branch selections" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "adopts a requested debug branch without mutating conflicting worktrees" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "locates CI evidence using prompt saved issue and local precedence" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects ambiguous cross-repository and malformed attempt references" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "filters branch and PR discovery by configured workflow and exact head" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "freezes explicit workflow run attempt and all failed job pages" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates branch fork ancestor divergent and unavailable ancestry evidence" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "distinguishes proven automatic no-red from explicit non-red and unavailable lookup" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates normalized fallback evidence against the requested identity" | red | passed |
| 2 | `.bkit/core/engine/ledgers/status.test.ts` "validates atomic CI and local selections with stable evidence identities" | red | passed |

## Gaps

None.
