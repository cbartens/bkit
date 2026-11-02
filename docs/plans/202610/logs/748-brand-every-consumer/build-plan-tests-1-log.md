Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/install/manifest.test.ts` `gate chains call bkit:lint:prose and bkit:slop:delta`
WROTE — TASK 1: `.bkit/core/engine/install/manifest.test.ts` `gate tool script template values > bkit:lint:prose and bkit:slop:delta call their bkit ci gates`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `template bkit-tests-static job matches the bkit:gate:static local gate > reads the gate as a chain of pnpm scripts`
WROTE — TASK 1: `.bkit/core/engine/install/modules/core.integration.test.ts` `detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > every template has an entry, and every entry is a template`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/templates-content.test.ts` `bkit-launchd.plist > is a LaunchAgent that loads at login and re-runs on env-file writes`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/templates-content.test.ts` `lists the graphify scripts under bkit:graph names`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template script names that run bkit code`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code`
WROTE — TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template file names`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify.sh`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py`
PASSES — TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code`: runs on seeded fixture text through the test-local pure function, so it passes before the rename; the planned red (shipped names) is carried by the sibling test
