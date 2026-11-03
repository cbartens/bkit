Enforced: true
Verdict: null
Gaps: 2
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/manifest.test.ts` "gate chains call bkit:lint:prose and bkit:slop:delta" | red | passed |
| 1 | `.bkit/core/engine/install/manifest.test.ts` "gate tool script template values > bkit:lint:prose and bkit:slop:delta call their bkit ci gates" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` "template bkit-tests-static job matches the bkit:gate:static local gate > reads the gate as a chain of pnpm scripts" | red | passed |
| 1 | `.bkit/core/engine/install/modules/core.integration.test.ts` "detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > every template has an entry, and every entry is a template" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "bkit-launchd.plist > is a LaunchAgent that loads at login and re-runs on env-file writes" | red-not-loaded | passed |
| 3 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "lists the graphify scripts under bkit:graph names" | red-not-loaded | passed |
| 3 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > template script names that run bkit code" | red | passed |
| 3 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code" | passed-accepted | passed |
| 3 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > template file names" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > scripts/graphify/bkit-graphify.sh" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py" | red | passed |

## Gaps

- Task 2 `delete-still-referenced` — DELETE `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` is still referenced as `ai.bkit.launchd`: `.bkit/.env.example:13`, `.bkit/core/.bkit/templates.md:423`, `.bkit/core/.bkit/templates.md:433`, `.bkit/core/.bkit/templates.md:435`, `.bkit/core/.bkit/templates.md:436`, and 18 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null
- Task 2 `delete-still-referenced` — DELETE `.bkit/templates/scripts/launchd/launchd.env.example` is still referenced as `launchd.env`: `.bkit/.env.example:11`, `.bkit/.env.example:16`, `.bkit/core/.bkit/templates.md:424`, `.bkit/core/.bkit/templates.md:430`, `.bkit/core/.bkit/templates.md:431`, and 24 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null

## Already landed

- Task 3 `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code" — passed at the group's red, and the tests step accepted it: runs on seeded fixture text through the test-local pure function, so it passes before the rename; the planned red (shipped names) is carried by the sibling test; no red is due
