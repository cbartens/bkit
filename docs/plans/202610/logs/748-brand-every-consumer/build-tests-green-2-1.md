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
| 4 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens rewrites whole pnpm tokens only" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens rewrites tokens after pnpm flags" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "renames old bkit script keys and keeps custom values" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "rewrites old script tokens in values and default gate chains" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves the old key when the new key exists" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves a foreign graph script under its own name" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "warns on an old script name the rewrite cannot reach" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves package.json untouched when it is not valid JSON" | red | passed |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "branded script migration is idempotent and dry-run writes nothing" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > workflow and job display names" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-" | passed-accepted | passed |
| 5 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .github/workflows/bkit-cloud.yml" | red | passed |
| 5 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .github/workflows/bkit-renovate.yml" | red | passed |
| 5 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .github/workflows/bkit-trivy.yml" | red | passed |

## Gaps

None.

## Already landed

- Task 5 `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-" — passed at the group's red, and the tests step accepted it: runs on seeded text through the test-local pure function, so it passes before the templates change; the sibling test carries the red; no red is due
