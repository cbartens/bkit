# Brief: group 3 — Brand the Vale style; migrate hook and CI tokens and CI script files (tests)

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
- Group 3: Brand the Vale style; migrate hook and CI tokens and CI script files — this group
  - TASK 6: Rename Vale style `House` → `Bkit` — done
  - TASK 7: Unhashed write class and the husky / CI token migration — done
  - TASK 8: Upgrade migration for the renamed CI script files — done
  - TASK 13: Scope the second-upgrade check of the hook and CI token migration to its own log line — open
  - TASK 14: Leave the per-upgrade cache-bust file out of the second-run snapshot of the CI script move — open
- Group 4: Check-name and Vale migrations — next
  - TASK 9: Upgrade migration for workflow check names and the old health stub — open
  - TASK 10: Upgrade migration for the Vale style — open
- Group 5: Rule, docs, mirrors and dogfood — later
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — open
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — open

## The work

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Scope the second-upgrade check of the hook and CI token migration to its own log line
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: replace `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` (Task 7, line ~1059) with a test that checks the second upgrade's output for the migration's own line (`core: .husky/pre-push — branded`) and not for the bare path `.husky/pre-push`, which every upgrade of the bare scratch consumer names in advisories
  - **DEPENDS ON:** 7
  - **DONE WHEN:** the replaced test passes; it still asserts the hook and CI file are rewritten, `.bkit/version` `canonicalHashes` has no entry for them, and a second upgrade logs no migration line for them; the Task 7 test it replaces is gone from the file
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration second upgrade logs no branded line for the hook and CI file` fails on a second-run `core: .husky/pre-push — branded` line, a `canonicalHashes` entry for `.husky/pre-push` or the CI workflow, or an old token left in either file

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Leave the per-upgrade cache-bust file out of the second-run snapshot of the CI script move
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: replace `a second template-file migration and a dry run write and move nothing` (Task 8, line ~1147) with a test whose before-and-after tree snapshot leaves out `.claude/bkit-cloud.md`, which `renderCloudCacheBust` (`.bkit/core/engine/install/cloud-env.ts:335`) rewrites with a new `# cache-bust` counter on every upgrade
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the replaced test passes; `scripts/ci/`, the hooks and the CI workflow are equal before and after a second upgrade and after a dry run; the Task 8 test it replaces is gone from the file
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run leave scripts/ci and the hooks unchanged` fails on a second-run write or a dry-run move or write in `scripts/ci/`, `.husky/` or the CI workflow

<!-- bkit:task 14 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Second upgrade and `--dry-run` write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 4 |
| Copy-and-own migration writes record no `canonicalHashes` entry; a second upgrade writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| A dry-run hook / CI token migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| A second template-file migration and a dry run write and move nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 8 |
| Second upgrade logs no branded line for the hook and CI file, and records no hash for them | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 13 |
| A second template-file migration and a dry run leave `scripts/ci/`, the hooks and the CI workflow unchanged | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 14 |
| A second check-name migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| A dry-run check-name migration writes and moves nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| A second Vale migration and a dry run write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 10 |
