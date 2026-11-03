Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 20 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name" | red | passed |
| 21 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens leaves recursive flag forms alone" | red | passed |
| 22 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names" | red | passed |

## Gaps

None.
