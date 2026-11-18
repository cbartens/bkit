Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "passes when a total equals its ceiling" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails below the ceiling and names the lower command" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "names only the files that grew since the record's last commit" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower rewrites both ceilings and keeps each reason" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower refuses when a total is above its ceiling" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "bkit's own workflow and prompt folders sit exactly at the committed ceilings" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/package-json.test.ts` "bkit:text:ceiling runs scripts/gate/bkit-text-ceiling.mjs" | red | passed |

## Gaps

None.
