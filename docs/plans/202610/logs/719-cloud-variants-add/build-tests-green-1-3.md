Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "github fetch marks a closed issue terminal and an open one not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a completed state renamed Shipped terminal" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a canceled state terminal and a started state not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "fetch prints terminal in its facts and in issue-facts.json" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github issue without bkit:auto stops the Cursor background session" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github closed issue stops the session and an open labelled one passes" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github read failure stops the session naming the tracker and the reason" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "linear completed state renamed Shipped stops the session" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "generated Claude and Cursor hooks carry the one preflight-tracker.sh part" | red | passed |

## Gaps

- Task 2 `delete-still-referenced` — DELETE `.bkit/core/hooks/preflight-linear.sh` is still referenced as `preflight-linear`: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:355`, `.claude/hooks/bkit-preflight.sh:18`, `.cursor/hooks/bkit-preflight.sh:16`, `docs/audits/202611/deferrals.md:422`, `docs/decisions.jsonl:421`, and 2 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null
