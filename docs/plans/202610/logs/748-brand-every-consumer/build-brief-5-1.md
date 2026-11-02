# Brief: group 5 — Rule, docs, mirrors and dogfood

Plan: Brand Every Consumer-Facing Name Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** none — no parent design; the plan covers issue #748 whole. Required workstream dependencies: None.

Names a consumer types or sees still lack the bkit brand (issue #748 § Narrative lists them). Facts found while planning that correct the issue text:

<!-- prettier-ignore -->
| Issue says | Codebase shows | Plan does |
| --- | --- | --- |
| `GATE_TOOL_SCRIPTS` in `.bkit/core/engine/install/manifest.ts` | No such constant; `manifest.test.ts:397` parses `.bkit/core/.bkit/templates.md` § Gate tool scripts into a test-local `GATE_TOOL_SCRIPTS` | Renames keys in the `templates.md` block; no new constant |
| `bkit-renovate.yml` / `bkit-trivy.yml` show as `Renovate` / `Trivy` | Their jobs (`renovate`, `trivy`) carry no `name:`, so the job half of the check shows the bare id | Adds `name: bkit-renovate` / `name: bkit-trivy` to the workflow and the job |
| File names under `scripts/**` already carry `bkit-` | c491ae133 renamed the ten CI template files under `.bkit/templates/scripts/ci/` and bkit's own copies; the two launchd templates (`ai.bkit.launchd.plist`, `launchd.env.example`) still lack it; consumer copies of the CI scripts keep their old names (only the `ci-scripts-old-names` advisory names them); the health check already ships as the `bkit-health.yml` template, and the CI template carries no smoke stub | Renames the two launchd templates (Task 2), moves unedited consumer CI-script copies in an upgrade migration (Task 8) and rewrites the old health stub text in consumer CI copies (Task 9); guard has no exception list (Open Question 2, answered) |
| `House` named in `.bkit/instructions.md`, `bkit-supabase.md` | No `House` style hits; `bkit-supabase.md:18` names `ClickHouse` | Not touched; `House` checks are word-bounded |
| `pnpm graph:*` in `bkit-audit-duplication.md` | No hits in `.bkit/core/docs/templates/bkit-audit-duplication.md`; bkit's own `docs/templates/bkit-audit-duplication.md` project part (lines 242, 246, 249) names `pnpm graph:check`, `pnpm graph:update`, `pnpm graph:rollup` | Renamed in Task 3 |
| Copy-and-own copies are never written by bkit | `.bkit/core/.bkit/templates.md:12`, `.bkit/core/engine/install/modules/cloud.ts:57`, `:113`, `:166`, `.bkit/core/engine/install/version-file.ts:155-157` state it | Restated with the exact-shipped-text brand-migration carve-out (Tasks 7, 9) |
| Migration example: `ci-scripts-old-names` advisory | `detectCiScriptsOldNames` and `CI_SCRIPT_RENAMES` in `.bkit/core/engine/checks/after/ci-yml.ts` (c491ae133); `docs/migrations.md` row `ci-scripts-old-names` advisory | Task 8 reuses `CI_SCRIPT_RENAMES` for the move; the advisory stays for copies the migration leaves; follows the `migrateBkitLayout` / `migrateShortcutsToLite` write patterns |

Goals: rename in templates, engine text, shipped docs and bkit's own adopted copies; upgrade migrations registered in `docs/migrations.md`; a branding guard test; the rule in `.agents/rules.md` § Naming Conventions.

**Related Issues:**

- #748 — Brand every consumer-facing script, check and style name bkit-* (OPEN)
- #719 — Cloud variants: add --auto=codex and allow any tracker (OPEN)
- #745 — Enforce the authoring.md Notation rules on docs automatically (OPEN)
- #724 — Machine-wide test lock: one test run at a time across agents (OPEN; wraps `bkit:gate:*` values, edits `.bkit/core/.bkit/templates.md`)
- #489 — Own only what a workflow runs; ship the rest as templates (CLOSED)

---

### Narrative

Branding: every name a consumer or their agent runs or sees in a consumer repo carries `bkit-` (package.json script names `bkit:`), so bkit's value shows wherever it works. An upgrade migration (`docs/migrations.md`) brings them current, so `bkit upgrade` alone is enough.

### Success Criteria

- Every package.json script name `.bkit/templates.md` seeds or lists whose command runs bkit code starts with `bkit:`; `typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare` keep their names.
- Every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-`.
- The shipped Vale style is `Bkit`; `.vale.ini` and every doc reference name `Bkit.*`.
- `bkit upgrade` on a consumer with the old names renames them in package.json, `.husky/pre-commit`, `.husky/pre-push`, the `bkit.testing.ciWorkflow` file and bkit's shipped workflow / Vale copies; a second run changes nothing.
- A branding guard test fails when a new consumer-facing script, check or style name lacks the prefix; `.agents/rules.md` § Naming Conventions states the rule and `docs/decisions.jsonl` records why.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare`), file names a third-party tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.serena/project.yml`, `slop-scan.config.json`, `.husky/*`), engine-internal names (`.bkit/core/engine/shared/bkit-latest.ts`), job ids | Issue #748 § Out of Scope declares them outside the rule; Success Criterion 1 names the generic scripts as keeping their names; no criterion, scenario or test row needs them renamed | Issue #748 § Out of Scope; deferral `748-names-outside-the-branding-rule` |

## Where it fits

- Group 1: Rename bkit-powered package.json scripts and template files — done
  - TASK 1: Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired — done
  - TASK 2: Rename the two unprefixed launchd template files to `bkit-*` — done
  - TASK 3: Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — done
- Group 2: Migrate script names; brand check names — done
  - TASK 4: Upgrade migration for package.json script names — done
  - TASK 5: Brand workflow and job display names — done
- Group 3: Brand the Vale style; migrate hook and CI tokens and CI script files — done
  - TASK 6: Rename Vale style `House` → `Bkit` — done
  - TASK 7: Unhashed write class and the husky / CI token migration — done
  - TASK 8: Upgrade migration for the renamed CI script files — done
  - TASK 13: Scope the second-upgrade check of the hook and CI token migration to its own log line — done
  - TASK 14: Leave the per-upgrade cache-bust file out of the second-run snapshot of the CI script move — done
- Group 4: Check-name and Vale migrations — done
  - TASK 9: Upgrade migration for workflow check names and the old health stub — done
  - TASK 10: Upgrade migration for the Vale style — done
- Group 5: Rule, docs, mirrors and dogfood — this group
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — open
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — open

## The work

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Write the rule; sweep the shared instruction and remaining shipped docs
  - **READ:** `.bkit/authoring.md`: prose rules for the rule bullet and clause edits
  - **READ:** `.bkit/instructions.md`: current clause text via `pnpm instructions:show --file instructions.md`
  - **UPDATE:** `.agents/rules.md`: § Naming Conventions (below `bkit:end`) branding bullet — consumer-facing file, script, check and style names carry `bkit-` / `bkit:`; engine and hook internals never; tool-fixed names exempt
  - **UPDATE:** `.bkit/instructions.md`: clause `slop-gate` names `bkit:slop:delta`; old wording moved to the clause's `retired` list
  - **UPDATE:** `.bkit/core/.agents/rules.md`: line 131 regenerated by `pnpm instructions:sync` after the plain check (`pnpm exec tsx .bkit/core/engine/tools/instructions.ts`) reports only the edited clauses (`bkit-audit-slop` cites the clause by id, so no text changes there)
  - **UPDATE:** `.bkit/core/.bkit/README.md`: remaining old names (line ~282)
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: old names (line 100)
  - **UPDATE:** `.bkit/core/.bkit/install.md`: old names (line 241)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: prose naming the tool scripts (line 1421)
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new names (line 17)
  - **UPDATE:** `.bkit/shared/docs/deployments.md`: `pnpm bkit:graph` (line 380)
  - **UPDATE:** `.bkit/shared/gitignore`: new names (line 69)
  - **DEPENDS ON:** 1, 2, 3, 5, 6
  - **DONE WHEN:** `.agents/rules.md` § Naming Conventions holds the branding bullet; `grep -rnE "(^|[^:])(lint:prose|slop:delta)|pnpm (run )?graph|House\.|styles/House|BasedOnStyles.*House|name: Smoke|[^-]health\.yml|accepted-advisories\.json" .bkit/core/.bkit .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/instructions.md | grep -v 'bkit-accepted-advisories'` hits only the `retired` lists; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0
  - **TEST FIRST:** n/a — docs and shared instruction text, no behaviour change

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Repo docs, mirror regeneration, build and old-shape dogfood
  - **UPDATE:** `docs/testing.md`: project part line ~763 and lines 640-641; § Key test files row for `.bkit/core/engine/audits/templates/branding.test.ts`
  - **UPDATE:** `docs/deployments.md`: project part (lines ~485-499)
  - **UPDATE:** `docs/security.md`: `bkit:slop:delta` (line 143)
  - **UPDATE:** `docs/setup.md`: new names (lines ~55, ~82)
  - **UPDATE:** `docs/technology.md`: new names (line ~83)
  - **UPDATE:** `CONTRIBUTING.md`: new names (line ~27)
  - **UPDATE:** `.agents/docs.md`: `.bkit/templates.md` row (line 72) states the exact-shipped-text brand-migration exception; `pnpm bkit:graph:rollup` (line 75)
  - **UPDATE:** `CHANGELOG.md`: `## [Unreleased]` breaking-change entry listing every rename, the migrations and the branch-protection note
  - **UPDATE:** `.bkit/templates.md`: mirror regenerated by one `bkit install` (with every other `.bkit/*.md`, `docs/*` managed block, the `.agents/rules.md` managed block and host mirror)
  - **UPDATE:** `dist/cli.js`: `pnpm build` (with the rest of `dist/`)
  - **UPDATE:** `docs/capabilities.md`: `pnpm bkit:graph:refresh` after the last engine edit
  - **DEPENDS ON:** 4, 7, 8, 9, 10, 11
  - **DONE WHEN:** no template, tip or doc under `.bkit/` names `pnpm graph`, `pnpm lint:prose` or `pnpm slop:delta` (`grep -rnE "pnpm (run )?(graph|lint:prose|slop:delta)" .bkit --exclude='*.test.ts'` hits only migration old-name tables and `.bkit/instructions.md` `retired` lists); `grep -rnw House .bkit` hits only `SHIPPED_HOUSE_RULE_HASHES` / `migrateValeHouseStyle`, the branding guard's seeded negatives and their tests; `grep -rnE "scripts/ci/(lanes/)?(check-|resolve-push-base|accepted-)" .bkit docs --include='*.md' --include='*.ts' --include='*.yml' --include='*.mjs' --exclude-dir=plans --exclude-dir=audits` hits only `BKIT_TEMPLATE_FILE_RENAMES`, its tests and `docs/migrations.md`; `grep -rnE "(^|[^:])(lint:prose|slop:delta)|pnpm (run )?graph|House\.|name: Smoke" docs CONTRIBUTING.md .agents/*.md README.md --include='*.md' --exclude-dir=plans --exclude-dir=audits` (which reaches `docs/templates/*.md`) hits only `docs/migrations.md` (old-name rows); `CHANGELOG.md` `## [Unreleased]` holds the breaking-change entry; `bkit check` reports 0 writes; `pnpm bkit:graph:check` passes; a packed-tarball scratch consumer seeded with the old shape (old keys, old husky / CI tokens, shipped `bkit-trivy.yml`, shipped `scripts/ci/check-capstone.mjs` + `.test.mjs` with the CI step calling them, `House/` with an own rule) upgrades via `node dist/cli.js upgrade` to the new names and a second upgrade writes nothing; bkit's own pre-push gate passes on the new names
  - **TEST FIRST:** n/a — docs, generated mirrors, build output and a packed-tarball dogfood run; the issue's `dogfood-templates.test.ts` `adopted copies match renamed templates` lands in Tasks 2, 3, 5 and 6 under the runner names `this repo adopts its own templates > {path}`, and Task 1's `.husky/*` and `bkit-ci.yml` copies are gated by its `DONE WHEN` (`dogfood-templates.test.ts` passes)

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push`, `.bkit/templates/.cursor/Dockerfile`, `.cursor/Dockerfile`, `package.json`, `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/pre-commit`, `.husky/pre-push`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`, `.bkit/core/engine/audits/repo/release-workflow.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/checks/after/index.test.ts`, `.bkit/core/engine/checks/after/tools.test.ts`
- TASK 2 (group 1, done): Rename the two unprefixed launchd template files to `bkit-*` — `.bkit/templates/scripts/launchd/bkit-launchd.plist`, `.bkit/templates/scripts/launchd/bkit-launchd.env.example`, `.bkit/core/.bkit/templates.md`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`, `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`, `.bkit/templates/scripts/launchd/launchd.env.example`
- TASK 3 (group 1, done): Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — `.bkit/core/engine/audits/templates/branding.test.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/templates/scripts/graphify/bkit-graphify.sh`, `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`, `.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh`, `.bkit/templates/scripts/graphify/bkit-graph-drift.py`, `.bkit/templates/scripts/graphify/bkit-graph-eager.py`, `.bkit/templates/scripts/graphify/bkit-graph-imports.py`, `.bkit/templates/scripts/graphify/bkit-graph-surface.py`, `.bkit/templates/scripts/graphify/bkit-graph-repair.py`, `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py`, `.bkit/templates/docs/capabilities.md`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-ci.yml`, `.bkit/core/engine/checks/tips/catalogue.ts`, `package.json`, `.husky/pre-push`, `docs/templates/bkit-audit-duplication.md`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `scripts/graphify/bkit-graphify.sh`, `scripts/graphify/bkit-graphify-rollup.py`, `scripts/graphify/bkit-graph-pre-push.sh`, `scripts/graphify/bkit-graph-drift.py`, `scripts/graphify/bkit-graph-eager.py`, `scripts/graphify/bkit-graph-imports.py`, `scripts/graphify/bkit-graph-surface.py`, `scripts/graphify/bkit-graph-repair.py`, `scripts/graphify/bkit-graphify-graphml.py`, `docs/capabilities.md`, `.bkit/core/engine/audits/templates/templates-content.test.ts`
- TASK 4 (group 2, done): Upgrade migration for package.json script names — `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `docs/migrations.md`
- TASK 5 (group 2, done): Brand workflow and job display names — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.bkit/templates/.github/workflows/bkit-renovate.yml`, `.bkit/templates/.github/workflows/bkit-trivy.yml`, `.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-renovate.yml`, `.github/workflows/bkit-trivy.yml`, `.bkit/core/engine/audits/templates/branding.test.ts`
- TASK 6 (group 3, done): Rename Vale style `House` → `Bkit` — `.bkit/templates/.vale/styles/Bkit/Filler.yml`, `.bkit/templates/.vale/styles/Bkit/Hedging.yml`, `.bkit/templates/.vale/styles/Bkit/LLMSlop.yml`, `.bkit/templates/.vale/styles/Bkit/Verbose.yml`, `.vale/styles/Bkit/Filler.yml`, `.vale/styles/Bkit/Hedging.yml`, `.vale/styles/Bkit/LLMSlop.yml`, `.vale/styles/Bkit/Verbose.yml`, `.bkit/templates/.vale.ini`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/README.md`, `.vale.ini`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/install/template-copies.integration.test.ts`, `.bkit/core/engine/audits/templates/branding.test.ts`, `.bkit/templates/.vale/styles/House/Filler.yml`, `.bkit/templates/.vale/styles/House/Hedging.yml`, `.bkit/templates/.vale/styles/House/LLMSlop.yml`, `.bkit/templates/.vale/styles/House/Verbose.yml`, `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml`
- TASK 7 (group 3, done): Unhashed write class and the husky / CI token migration — `.bkit/core/engine/install/write.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/install/upgrade.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/install/version-file.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `docs/migrations.md`
- TASK 8 (group 3, done): Upgrade migration for the renamed CI script files — `.bkit/core/engine/checks/after/ci-yml.ts`, `.bkit/core/engine/install/modules/core.ts`, `docs/migrations.md`
- TASK 9 (group 4, done): Upgrade migration for workflow check names and the old health stub — `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/cloud.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `docs/migrations.md`
- TASK 10 (group 4, done): Upgrade migration for the Vale style — `.bkit/core/engine/install/modules/core.ts`, `docs/migrations.md`

Reuse Inventory rows left out: 1; Architecture entries left out: 3 — read them in docs/plans/202610/748-brand-every-consumer-plan.md § Reuse Inventory and § Architecture & Component Changes.
