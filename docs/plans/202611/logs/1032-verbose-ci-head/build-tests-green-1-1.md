Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1032-verbose-ci-head-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` "static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` "passes actionlint" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` ".github/workflows/bkit-ci.yml" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "no template comment says a marker is inert on workflow_dispatch" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "never writes NODE_OPTIONS to $GITHUB_ENV" | red | passed |

## Gaps

None.
