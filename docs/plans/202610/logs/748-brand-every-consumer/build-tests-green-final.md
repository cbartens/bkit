Enforced: true
Verdict: null
Gaps: 12
Unproven: 2

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
| 6 | `.bkit/core/engine/audits/templates/templates.test.ts` "Vale template ships the Bkit style and .vale.ini names it" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > the shipped Vale style" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Filler.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Hedging.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/LLMSlop.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Verbose.yml" | red | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedFileTokens (via runBkitDocs) > rewrites old script tokens in husky hooks and the CI workflow" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" | missing | not passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a dry-run hook and CI token migration writes nothing" | red | passed |
| 8 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > moves shipped CI script units to bkit- names and rewrites their paths" | red | passed |
| 8 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves an edited or already-renamed unit and logs the manual move" | red | passed |
| 8 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" | missing | not passed |
| 13 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration second upgrade logs no branded line for the hook and CI file" | passed-accepted | passed |
| 14 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run leave scripts/ci and the hooks unchanged" | passed-accepted | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file" | red | passed |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second check-name migration writes nothing" | red | passed |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a dry-run check-name migration writes and moves nothing" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini" | red | passed |
| 10 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second Vale migration and a dry run write nothing" | red | passed |
| 15 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names" | red | passed |
| 16 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key" | red | passed |
| 17 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens leaves package-selecting flag forms alone" | red | passed |
| 18 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory" | red | passed |
| 20 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name" | red | passed |
| 21 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens leaves recursive flag forms alone" | red | passed |
| 22 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names" | red | passed |

## Gaps

- Task 7 `not-green` — the named test "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` — not-green — Fixable: true
- Task 8 `not-green` — the named test "a second template-file migration and a dry run write and move nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` — not-green — Fixable: true
- Task 2 `delete-still-referenced` — DELETE `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` is still referenced as `ai.bkit.launchd`: `.bkit/.env.example:13`, `.bkit/core/.bkit/templates.md:423`, `.bkit/core/.bkit/templates.md:433`, `.bkit/core/.bkit/templates.md:435`, `.bkit/core/.bkit/templates.md:436`, and 17 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null
- Task 2 `delete-still-referenced` — DELETE `.bkit/templates/scripts/launchd/launchd.env.example` is still referenced as `launchd.env`: `.bkit/.env.example:11`, `.bkit/.env.example:16`, `.bkit/core/.bkit/templates.md:424`, `.bkit/core/.bkit/templates.md:430`, `.bkit/core/.bkit/templates.md:431`, and 25 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1243`, and 25 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/install/modules/core.integration.test.ts:2116`, `.bkit/core/engine/install/modules/core.integration.test.ts:2150`, and 24 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/install/modules/core.integration.test.ts:2116`, `.bkit/core/engine/install/modules/core.integration.test.ts:2155`, and 19 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 40 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1243`, and 25 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/install/modules/core.integration.test.ts:2116`, `.bkit/core/engine/install/modules/core.integration.test.ts:2150`, and 24 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1227`, `.bkit/core/engine/install/modules/core.integration.test.ts:2116`, `.bkit/core/engine/install/modules/core.integration.test.ts:2155`, and 19 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 40 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null

## Already landed

- Task 3 `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code" — passed at the group's red, and the tests step accepted it: runs on seeded fixture text through the test-local pure function, so it passes before the rename; the planned red (shipped names) is carried by the sibling test; no red is due
- Task 5 `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-" — passed at the group's red, and the tests step accepted it: runs on seeded text through the test-local pure function, so it passes before the templates change; the sibling test carries the red; no red is due
- Task 13 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration second upgrade logs no branded line for the hook and CI file" — passed at the group's red, and the tests step accepted it: Task 7 migration already behaves so; test is a rescoped replacement; no red is due
- Task 14 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run leave scripts/ci and the hooks unchanged" — passed at the group's red, and the tests step accepted it: Task 8 migration already idempotent; snapshot now skips .claude/bkit-cloud.md; no red is due

## Unproven

- Task 7 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" — the tests step left it as `missing`, not red; the owner answers it at the end of the build
- Task 8 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" — the tests step left it as `missing`, not red; the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 892ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1396ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 989ms
     ✓ a dry-run hook and CI token migration writes nothing 480ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1226ms
     ✓ a second check-name migration writes nothing 1173ms
     ✓ a dry-run check-name migration writes and moves nothing 526ms
     ✓ a second Vale migration and a dry run write nothing 1266ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 905ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 863ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 943ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 659ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 639ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 712ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 624ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 631ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 632ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 622ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 776ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 897ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 893ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 484ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 579ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 939ms

 Test Files  1 passed (1)
      Tests  63 passed (63)
   Start at  16:46:35
   Duration  38.08s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8qlH45/junit.xml
```
