Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 4: `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites whole pnpm tokens only`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites tokens after pnpm flags`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `renames old bkit script keys and keeps custom values`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites old script tokens in values and default gate chains`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves the old key when the new key exists`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a foreign graph script under its own name`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `warns on an old script name the rewrite cannot reach`
WROTE — TASK 4: `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves package.json untouched when it is not valid JSON`
WROTE — TASK 4: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `branded script migration is idempotent and dry-run writes nothing`
WROTE — TASK 5: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > workflow and job display names`
PASSES — TASK 5: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-`: runs on seeded text through the test-local pure function, so it passes before the templates change; the sibling test carries the red
WROTE — TASK 5: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-cloud.yml`
WROTE — TASK 5: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-renovate.yml`
WROTE — TASK 5: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-trivy.yml`
SOURCE — TASK 4: BKIT_GATE_SCRIPTS static/min chains from .bkit/core/engine/install/manifest.ts:245-251
SOURCE — TASK 5: workflow/job names from .bkit/templates/.github/workflows/bkit-{cloud,renovate,trivy}.yml:3,14,16,96,472,547
