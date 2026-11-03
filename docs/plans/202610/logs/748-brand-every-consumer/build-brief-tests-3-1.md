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
  - TASK 6: Rename Vale style `House` → `Bkit` — open
  - TASK 7: Unhashed write class and the husky / CI token migration — open
  - TASK 8: Upgrade migration for the renamed CI script files — open
- Group 4: Check-name and Vale migrations — next
  - TASK 9: Upgrade migration for workflow check names and the old health stub — open
  - TASK 10: Upgrade migration for the Vale style — open
- Group 5: Rule, docs, mirrors and dogfood — later
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — open
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rename Vale style `House` → `Bkit`
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Filler.yml`: byte-identical move of the `House/` rule
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Hedging.yml`: byte-identical move
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/LLMSlop.yml`: byte-identical move
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Verbose.yml`: byte-identical move
  - **DELETE:** `.bkit/templates/.vale/styles/House/Filler.yml`: replaced by `Bkit/Filler.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/Hedging.yml`: replaced by `Bkit/Hedging.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/LLMSlop.yml`: replaced by `Bkit/LLMSlop.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/Verbose.yml`: replaced by `Bkit/Verbose.yml`
  - **UPDATE:** `.bkit/templates/.vale.ini`: `BasedOnStyles = Bkit` / `write-good, Bkit`; `Bkit.<rule>` toggles
  - **UPDATE:** `detectValePackageNotSynced` in `.bkit/core/engine/checks/after/tools.ts`: `Bkit` style text in its no-`.vale.ini` `action` (line 67)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `Bkit` style text (line 220)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: Contract row and § Vale name `Bkit`
  - **UPDATE:** `.bkit/core/.bkit/README.md`: Vale path `.vale/styles/Bkit/*` (line 241)
  - **CREATE:** `.vale/styles/Bkit/Filler.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/Hedging.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/LLMSlop.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/Verbose.yml`: bkit's own adopted copy
  - **DELETE:** `.vale/styles/House/Filler.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/Hedging.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/LLMSlop.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/Verbose.yml`: bkit's own copy, replaced by `Bkit/`
  - **UPDATE:** `.vale.ini`: bkit's own copy names `Bkit`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` entries `.vale/styles/Bkit/*.yml`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates.test.ts`: `.vale.ini sets StylesPath, Packages and MinAlertLevel and enables House on .agents/**` → `… enables Bkit on .agents/**`
  - **UPDATE:** `.bkit/core/engine/install/template-copies.integration.test.ts`: fixture path `.vale/styles/Bkit/LLMSlop.yml` (line 85)
  - **UPDATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: Vale style check
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -rnw "House" .bkit/templates .bkit/core/.bkit .bkit/core/engine --exclude='*.test.ts'` is empty (word-bounded, so `ClickHouse` at `.bkit/templates/context/bkit-supabase.md:18` does not match; migration tables arrive in Task 10); `pnpm bkit:lint:prose` on bkit prints `Bkit.*` rule ids; `template-copies.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `Vale template ships the Bkit style and .vale.ini names it` fails on `House`
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > the shipped Vale style` fails on a `House` style directory
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Filler.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Hedging.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/LLMSlop.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Verbose.yml` fails on a missing adopted copy

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Unhashed write class and the husky / CI token migration
  - **UPDATE:** `WriteEntry` in `.bkit/core/engine/install/write.ts`: optional `unhashed?: true`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: install postDispatch canonical-hash loop (~1027-1060) skips `unhashed` entries
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.ts`: the `renderWs.writes` → `updateCanonicalHashesAfterUpgrade` path (~1025-1045) skips `unhashed` entries
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedFileTokens(dryRun, ws, logPrefix)` — `renameScriptTokens` over `.husky/pre-commit`, `.husky/pre-push` and `ciWorkflowPath(".")` for the active pairs (the one definition from Task 4: a pair is active unless `package.json` holds both keys or a foreign `graph*` value); each surviving old name (`findOldScriptNames`) → one `console.warn` naming file and line; absent files skipped silently; push `{ path, action: "update", unhashed: true }`; log line per file
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedFileTokens`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: line 12 states the copy-and-own contract with its one exception — `bkit install` / `bkit upgrade` rewrite an adopted copy only where bkit's exact shipped old text matches (the brand migrations, `docs/migrations.md`), never otherwise
  - **UPDATE:** `.bkit/core/engine/install/version-file.ts`: comment at lines 155-157 states the same exception
  - **UPDATE:** `.bkit/core/engine/install/version-file.test.ts`: comment at lines 250-252 states the same exception
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: describe `install never writes or flags an adopted template copy` (line 90) → `install never writes or flags an adopted template copy outside the exact-shipped-text brand migrations`
  - **READ:** `ciWorkflowPath` in `.bkit/core/engine/shared/settings.ts`: CI workflow path
  - **READ:** `mergeCanonicalHashes` in `.bkit/core/engine/install/version-file.ts`: prune behaviour the flag avoids
  - **READ:** `isTemplateSetPath` in `.bkit/core/engine/install/version-file.ts`: template-set paths it prunes
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded script tokens in hooks and CI" (`migrateBrandedFileTokens`, called by `runBkitDocs`; unhashed write; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `WriteEntry` has `unhashed?: true`; an old-shape scratch consumer's `.husky/*` and CI workflow name the new scripts after upgrade, `.bkit/version` `canonicalHashes` has no entry for them, a dry run writes nothing, and a second upgrade writes nothing; `.bkit/core/.bkit/templates.md:12` and `version-file.ts` state the brand-migration exception; `upgrade.integration.test.ts` `#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file` and `index.integration.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > rewrites old script tokens in husky hooks and the CI workflow` fails on old tokens left in `.husky/pre-push` or a custom `bkit.testing.ciWorkflow` file, or a surviving `pnpm --filter web lint:prose` with no warning naming the file and line
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` fails on a `canonicalHashes` entry for `.husky/pre-push` or the CI workflow, or a second-run write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a dry-run hook and CI token migration writes nothing` fails on `.husky/pre-push` or the CI workflow changing under `--dry-run`, or the dry-run writeset missing them

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Upgrade migration for the renamed CI script files
  - **UPDATE:** `.bkit/core/engine/checks/after/ci-yml.ts`: export `CI_SCRIPT_RENAMES` (old → new path per file, already listing all ten) and group it into units: `check-capstone.mjs` + `.test.mjs`; `check-dependency-audit.mjs` + `.test.mjs` + `accepted-advisories.json`; `check-accepted-divergences.mjs` + `.test.mjs` + `accepted-divergences.json`; `lanes/resolve-push-base.mjs` + `.test.mjs`; `detectCiScriptsOldNames` doc comment states that `bkit upgrade` moves unedited copies and the advisory names the ones it leaves
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `SHIPPED_CI_SCRIPT_HASHES` — sha256 of every distinct release content of the eight `.mjs` files, from `git tag -l 'v*'` × every path each file has had (`git log --all --follow --name-only -- .bkit/templates/scripts/ci/<file>`), committed as constants in the `RETIRED_DRIVER_HASHES` shape
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedTemplateFiles(dryRun, ws, logPrefix): PathRename[]` — a unit whose present `.mjs` files all match `SHIPPED_CI_SCRIPT_HASHES` and whose `bkit-` targets are absent → old files removed (`{ action: "write", unhashed: true }`), `.mjs` targets written from `getTemplatesRoot()` and the data file moved byte-identical (`{ action: "write", unhashed: true }`); an edited file or an existing target → unit left, one `console.warn` naming the manual move; no `scripts/ci/` → silent; returns the renames applied plus those already applied (old absent, new present)
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: `migrateBrandedFileTokens` (from Task 7) gains a `pathRenames` parameter, takes the returned renames and rewrites `scripts/ci/<old>` path tokens (followed by a character outside `[\w.-]` or end of text) in `.husky/pre-commit`, `.husky/pre-push`, `ciWorkflowPath(".")`, `.github/workflows/bkit-trivy.yml` and package.json script values (`writePackageJsonLike`)
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedTemplateFiles` before `migrateBrandedFileTokens` and passes its result
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: shipped templates root
  - **READ:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: move and removed-path write shape (lines 360-370)
  - **UPDATE:** `docs/migrations.md`: § Migrations row `ci-scripts-old-names` advisory states that the upgrade moves unedited copies; new row "Branded CI script files" (`migrateBrandedTemplateFiles`, called by `runBkitDocs`; unhashed writes; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `SHIPPED_CI_SCRIPT_HASHES` holds every distinct tagged content of the eight `.mjs` files; an old-shape scratch consumer with shipped `scripts/ci/check-capstone.mjs` + `.test.mjs` and `check-dependency-audit.mjs` + `.test.mjs` + `accepted-advisories.json`, and a CI workflow and `.husky/pre-push` calling them, upgrades to the `bkit-` files with every `scripts/ci/` path rewritten, `canonicalHashes` holds none of them, `node scripts/ci/bkit-check-capstone.test.mjs` exits 0 in the scratch consumer, and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > moves shipped CI script units to bkit- names and rewrites their paths` fails on `scripts/ci/check-capstone.mjs` left in place, a moved `.test.mjs` importing the old name, `accepted-advisories.json` not moved byte-identical with its reader, or the CI workflow still running `node scripts/ci/check-capstone.mjs`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves an edited or already-renamed unit and logs the manual move` fails on an edited `check-capstone.mjs` moved, a `bkit-check-capstone.mjs` target overwritten, or no warning
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` fails on a second-run write or a dry-run move or write

<!-- bkit:task 8 end -->

### Earlier tasks this group depends on

- TASK 3 (group 1, done): Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — `.bkit/core/engine/audits/templates/branding.test.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/templates/scripts/graphify/bkit-graphify.sh`, `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`, `.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh`, `.bkit/templates/scripts/graphify/bkit-graph-drift.py`, `.bkit/templates/scripts/graphify/bkit-graph-eager.py`, `.bkit/templates/scripts/graphify/bkit-graph-imports.py`, `.bkit/templates/scripts/graphify/bkit-graph-surface.py`, `.bkit/templates/scripts/graphify/bkit-graph-repair.py`, `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py`, `.bkit/templates/docs/capabilities.md`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-ci.yml`, `.bkit/core/engine/checks/tips/catalogue.ts`, `package.json`, `.husky/pre-push`, `docs/templates/bkit-audit-duplication.md`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `scripts/graphify/bkit-graphify.sh`, `scripts/graphify/bkit-graphify-rollup.py`, `scripts/graphify/bkit-graph-pre-push.sh`, `scripts/graphify/bkit-graph-drift.py`, `scripts/graphify/bkit-graph-eager.py`, `scripts/graphify/bkit-graph-imports.py`, `scripts/graphify/bkit-graph-surface.py`, `scripts/graphify/bkit-graph-repair.py`, `scripts/graphify/bkit-graphify-graphml.py`, `docs/capabilities.md`, `.bkit/core/engine/audits/templates/templates-content.test.ts`
- TASK 4 (group 2, done): Upgrade migration for package.json script names — `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `docs/migrations.md`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Upgrade renames old script keys, keeps custom values | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites `pnpm <old>` tokens in script values and the old default gate chains | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade leaves the old key when the new key exists | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites old tokens in `.husky/*` and the CI workflow file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| Second upgrade and `--dry-run` write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 4 |
| Upgrade rewrites shipped old workflow / job `name:` lines, leaves customised ones | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| Upgrade moves shipped-hash Vale rules to `Bkit/`, keeps own and edited rules in `House` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Vale template ships `Bkit` style and `.vale.ini` names it | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 6 |
| Branding guard: template script names running bkit code, workflow / job display names, Vale style all carry the prefix | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| bkit's own adopted copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 6 |
| Gate advisory names the missing tool scripts by their `bkit:` names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 1 |
| A foreign `graph*` script (value not running `scripts/graphify/bkit-`) keeps its key and its `pnpm graph` tokens | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| An old name the rewrite cannot reach (`pnpm --filter web lint:prose`) logs one warning naming file and line | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `package.json` that is not valid JSON gets no migration write and the error reaches the upgrade output | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Branding guard flags a seeded unprefixed script name that runs bkit code | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| Branding guard: every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`; a seeded `scripts/foo.sh` fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| `dogfood-templates.test.ts` `ADOPTED` names the renamed launchd templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 2 |
| bkit's own graphify copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 3 |
| Branding guard: workflow and job display names (`name`, else the job id) pass, a seeded unprefixed job display name fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 5 |
| bkit's own `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 5 |
| Branding guard: the shipped Vale style is `Bkit` | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| Copy-and-own migration writes record no `canonicalHashes` entry; a second upgrade writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| A dry-run hook / CI token migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| Shipped-content CI script units move to `bkit-` names with their data files, and their `scripts/ci/` paths are rewritten | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| An edited CI script unit, or one whose `bkit-` target exists, stays and is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| A second template-file migration and a dry run write and move nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 8 |
| The upgrade log names each renamed check with the branch-protection fix | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A `renovate:` / `trivy:` job that already carries a `name:` gets none inserted | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A custom `bkit.testing.ciWorkflow` file gets the health-stub rewrite; `bkit-ci.yml` is not looked for | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A second check-name migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| A dry-run check-name migration writes and moves nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| `.vale.ini` names moved rules `Bkit.*` and lists both styles while `House` keeps files | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| A second Vale migration and a dry run write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 10 |
| Every `House` rule moved → `House/` removed, `BasedOnStyles` names `Bkit` alone, toggles read `Bkit.<rule>` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| `.vale/` present, `.vale.ini` absent → rules move, no `.vale.ini` write | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
