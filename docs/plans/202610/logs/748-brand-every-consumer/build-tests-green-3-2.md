Enforced: true
Verdict: null
Gaps: 10
Unproven: 2

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
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

## Gaps

- Task 7 `not-green` — the named test "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` — not-green — Fixable: true
- Task 8 `not-green` — the named test "a second template-file migration and a dry run write and move nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` — not-green — Fixable: true
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:15`, and 12 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:14`, `.bkit/templates/.vale.ini:20`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:13`, `.bkit/templates/.vale.ini:19`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 31 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:15`, and 12 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:14`, `.bkit/templates/.vale.ini:20`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:13`, `.bkit/templates/.vale.ini:19`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 31 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null

## Already landed

- Task 13 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration second upgrade logs no branded line for the hook and CI file" — passed at the group's red, and the tests step accepted it: Task 7 migration already behaves so; test is a rescoped replacement; no red is due
- Task 14 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run leave scripts/ci and the hooks unchanged" — passed at the group's red, and the tests step accepted it: Task 8 migration already idempotent; snapshot now skips .claude/bkit-cloud.md; no red is due

## Unproven

- Task 7 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" — the tests step left it as `missing`, not red; the owner answers it at the end of the build
- Task 8 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" — the tests step left it as `missing`, not red; the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 972ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1383ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 928ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 906ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1445ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1040ms
     ✓ a dry-run hook and CI token migration writes nothing 492ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1280ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 916ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 865ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 984ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 684ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 795ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 767ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 813ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 654ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 627ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 629ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 787ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1046ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1086ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 575ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 506ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 1090ms

 Test Files  1 passed (1)
      Tests  60 passed (60)
   Start at  14:26:08
   Duration  37.24s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xA7ZqR/junit.xml
```
