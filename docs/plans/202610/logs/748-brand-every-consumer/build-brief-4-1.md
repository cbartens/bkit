# Brief: group 4 — Check-name and Vale migrations

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
- Group 4: Check-name and Vale migrations — this group
  - TASK 9: Upgrade migration for workflow check names and the old health stub — open
  - TASK 10: Upgrade migration for the Vale style — open
- Group 5: Rule, docs, mirrors and dogfood — next
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — open
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Upgrade migration for workflow check names and the old health stub
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedCheckNames(dryRun, ws, logPrefix)` — exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` → branded; job `name:` inserted after the exact `  renovate:` / `  trivy:` line when the job has none; in `ciWorkflowPath(".")`, the old shipped `bkit-stub:health` block → the current block naming `.bkit/templates/.github/workflows/bkit-health.yml` (`{{DEFAULT_BRANCH}}` matched as any branch); one log line per renamed check naming old → new and the branch-protection fix; writes `unhashed: true`
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedCheckNames`
  - **UPDATE:** `.bkit/core/engine/install/modules/cloud.ts`: advisory strings (lines 57, 113, 166) state the copy-and-own contract with the exact-shipped-text brand-migration exception; tests pinning them updated
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: `does not rewrite a consumer-owned .github/renovate.json5` (lines 369-394) seeds a customised `bkit-renovate.yml` line (`name: Renovate (ours)\n`) and asserts it unchanged
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded check names" (releases up to 6.0.x; tests)
  - **DEPENDS ON:** 5, 7
  - **DONE WHEN:** an old-shape scratch consumer's shipped workflows carry the `bkit-*` names after upgrade, customised `name:` lines are unchanged, the log names each renamed check, a dry run writes and moves nothing, and a second upgrade writes nothing; `upgrade.integration.test.ts` `does not rewrite a consumer-owned .github/renovate.json5` passes on its customised seed
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones` fails on old names or a rewritten custom line
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix` fails on a missing log line for `Trivy / trivy`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one` fails on a second `name:` line under `  renovate:` or `  trivy:`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file` fails on the old stub block left in the custom file, an edited block rewritten, or a `bkit-ci.yml` read or write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second check-name migration writes nothing` fails on a second-run write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a dry-run check-name migration writes and moves nothing` fails on a workflow file changing under `--dry-run`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Upgrade migration for the Vale style
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `SHIPPED_HOUSE_RULE_HASHES` — sha256 of every distinct release content of `Filler`, `Hedging`, `LLMSlop`, `Verbose`, from `git tag -l 'v*'` × every path each rule has had (`git log --all --follow --name-only -- .bkit/templates/.vale/styles/House/<rule>.yml`), committed as constants in the `RETIRED_DRIVER_HASHES` shape
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateValeHouseStyle(dryRun, ws, logPrefix)` — matching `House/<rule>.yml` moved byte-identical to `Bkit/<rule>.yml` when absent; edited rule or existing target → left, one `console.warn` naming the rule and the manual move (`mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/` plus the `.vale.ini` toggle); `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` `House` → `Bkit` once `House/` is empty (directory removed), else `Bkit` appended; no `.vale.ini` → rules move, no `.vale.ini` write; no `.vale/` → silent; moved-away and removed paths pushed `{ action: "write", unhashed: true }`; other writes `unhashed: true`
  - **READ:** `RETIRED_DRIVER_HASHES` in `.bkit/core/engine/install/write.ts`: table shape and `sha256` use
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateValeHouseStyle`
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Vale style `House` → `Bkit`" (releases up to 6.0.x; tests)
  - **DEPENDS ON:** 6, 7
  - **DONE WHEN:** `SHIPPED_HOUSE_RULE_HASHES` holds every distinct tagged content of the four rules across every path each has had; an old-shape scratch consumer upgrades with shipped rules in `Bkit/`, own and edited rules in `House/`, `.vale.ini` naming both styles, the log naming each edited rule's manual move, and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House` fails on shipped rules left in `House`, an own / edited rule moved, or no manual-move warning for the edited rule
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files` fails on `House.<moved>` toggles left or `BasedOnStyles` dropping `House`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House` fails on `House/` left, `BasedOnStyles` still naming `House`, or a `House.<rule>` toggle left
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini` fails on shipped rules left in `House` or a `.vale.ini` written
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second Vale migration and a dry run write nothing` fails on a second-run or dry-run write

<!-- bkit:task 10 end -->

### Earlier tasks this group depends on

- TASK 5 (group 2, done): Brand workflow and job display names — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.bkit/templates/.github/workflows/bkit-renovate.yml`, `.bkit/templates/.github/workflows/bkit-trivy.yml`, `.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-renovate.yml`, `.github/workflows/bkit-trivy.yml`, `.bkit/core/engine/audits/templates/branding.test.ts`
- TASK 6 (group 3, done): Rename Vale style `House` → `Bkit` — `.bkit/templates/.vale/styles/Bkit/Filler.yml`, `.bkit/templates/.vale/styles/Bkit/Hedging.yml`, `.bkit/templates/.vale/styles/Bkit/LLMSlop.yml`, `.bkit/templates/.vale/styles/Bkit/Verbose.yml`, `.vale/styles/Bkit/Filler.yml`, `.vale/styles/Bkit/Hedging.yml`, `.vale/styles/Bkit/LLMSlop.yml`, `.vale/styles/Bkit/Verbose.yml`, `.bkit/templates/.vale.ini`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/README.md`, `.vale.ini`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/install/template-copies.integration.test.ts`, `.bkit/core/engine/audits/templates/branding.test.ts`, `.bkit/templates/.vale/styles/House/Filler.yml`, `.bkit/templates/.vale/styles/House/Hedging.yml`, `.bkit/templates/.vale/styles/House/LLMSlop.yml`, `.bkit/templates/.vale/styles/House/Verbose.yml`, `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml`
- TASK 7 (group 3, done): Unhashed write class and the husky / CI token migration — `.bkit/core/engine/install/write.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/install/upgrade.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/install/version-file.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `docs/migrations.md`

Reuse Inventory rows left out: 7; Architecture entries left out: 2 — read them in docs/plans/202610/748-brand-every-consumer-plan.md § Reuse Inventory and § Architecture & Component Changes.
