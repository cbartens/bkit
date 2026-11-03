# Brief: group 2 — Migrate script names; brand check names

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
- Group 2: Migrate script names; brand check names — this group
  - TASK 4: Upgrade migration for package.json script names — open
  - TASK 5: Brand workflow and job display names — open
- Group 3: Brand the Vale style; migrate hook and CI tokens and CI script files — next
  - TASK 6: Rename Vale style `House` → `Bkit` — open
  - TASK 7: Unhashed write class and the husky / CI token migration — open
  - TASK 8: Upgrade migration for the renamed CI script files — open
- Group 4: Check-name and Vale migrations — later
  - TASK 9: Upgrade migration for workflow check names and the old health stub — open
  - TASK 10: Upgrade migration for the Vale style — open
- Group 5: Rule, docs, mirrors and dogfood — later
  - TASK 11: Write the rule; sweep the shared instruction and remaining shipped docs — open
  - TASK 12: Repo docs, mirror regeneration, build and old-shape dogfood — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Upgrade migration for package.json script names
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `BKIT_SCRIPT_RENAMES` — old → new table (`lint:prose`, `slop:delta`, `graph`, `graph:<verb>` for `check`, `clean`, `graphml`, `refresh`, `rollup`, `scoped`, `tree`, `update`); `graph*` entries carry the value guard (value runs `scripts/graphify/bkit-`)
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add the one **active pair** definition every token rewrite uses — `package.json` does not hold both keys, and the old key, when present, is not a foreign `graph*` value; a pair with neither key is active
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `renameScriptTokens(text, renames)` — exported, pure; rewrites `pnpm [flags] [run] [flags] <old>` where each flag is a value-less `-x` / `--x[=v]` token and `<old>` is followed by a character outside `[\w:-]` or end of text; flags and `run` kept
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `findOldScriptNames(text, renames)` — exported, pure; lists `{ line, name }` for each old name left after the rewrite
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedScriptNames(dryRun, ws, logPrefix): boolean` — `parseJson` read (invalid JSON → existing error path, no write); per active pair with the old key present → key renamed in place, value kept; both keys present → pair skipped, one `console.warn`; `renameScriptTokens` over every script value for active pairs; each surviving old name → one `console.warn` naming `package.json`, the script key and the name; `writePackageJsonLike` write; `ws.writes` push; log line
  - **UPDATE:** `seedCorePackageJsonScripts` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedScriptNames` before `ensurePackageJsonScripts`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.test.ts`: `renameScriptTokens` cases
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: delete `leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)`; new describe `migrateBrandedScriptNames (via seedCorePackageJsonScripts)`
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: line 960 also asserts `bkit:slop:delta` undefined; new idempotency test
  - **READ:** `tests/fixtures/heavy-customised-consumer/package.json`: its `"lint:prose": "custom-prose-linter"` is the real-upgrade case for a custom value kept under the new key; the fixture file is unchanged
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded script names" (`migrateBrandedScriptNames`, called by `seedCorePackageJsonScripts`; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** an old-shape scratch consumer's `package.json` upgrades to the new keys with values kept and a second upgrade writes nothing; a foreign `"graph": "nx graph"` keeps its key; no `lint:prose` / `slop:delta` / `graph*` old name in `.bkit/core/engine` outside `BKIT_SCRIPT_RENAMES` and the migration tests; `core.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts` and the heavy-fixture tests (`write.integration.test.ts`, `uninstall.integration.test.ts`) pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites whole pnpm tokens only` fails on `pnpm graph:update-all`, `npm run lint:prose` or `echo lint:prose` being rewritten
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites tokens after pnpm flags` fails on `pnpm -s lint:prose` or `pnpm run --silent slop:delta` keeping the old name, or a flag dropped
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `renames old bkit script keys and keeps custom values` fails on unrenamed keys
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites old script tokens in values and default gate chains` fails on old tokens, a `bkit:gate:static` that is not the new default, an old default chain left when `package.json` holds neither `lint:prose` nor `bkit:lint:prose`, or a `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm lint:prose` wrapper keeping the old token
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves the old key when the new key exists` fails on a clobbered key or a second log line
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a foreign graph script under its own name` fails on `"graph": "nx graph"` renamed or a `pnpm graph` token in another value rewritten
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `warns on an old script name the rewrite cannot reach` fails on `pnpm --filter web lint:prose` passing with no warning naming `package.json`, the script key and `lint:prose`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves package.json untouched when it is not valid JSON` fails on a migration write or the parse error not reaching the output
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `branded script migration is idempotent and dry-run writes nothing` fails on a second write or a dry-run write

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Brand workflow and job display names
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: job names `bkit-cloud-context (${{ github.event_name }})`, `bkit-cloud-claude (…)`, `bkit-cloud-opencode (…)`; job ids unchanged; comments naming the checks (lines 96, 472, 498, 547)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-renovate.yml`: workflow `name: bkit-renovate`; job `renovate` gets `name: bkit-renovate`
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-trivy.yml`: workflow `name: bkit-trivy`; job `trivy` gets `name: bkit-trivy`
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: bkit's own copy
  - **UPDATE:** `.github/workflows/bkit-renovate.yml`: bkit's own copy
  - **UPDATE:** `.github/workflows/bkit-trivy.yml`: bkit's own copy
  - **UPDATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: workflow / job display-name check (`parseYaml`; a job's display name is its `name`, else its id)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** every workflow `name:` and job display name (`name`, else the job id) in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-`; `dogfood-templates.test.ts` and `actionlint` on `.github/workflows/` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > workflow and job display names` fails on `Trivy`, `renovate` or `context (…)`
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-` fails on a seeded `name: lint` job, or a seeded job with no `name:` and the id `lint`, passing
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-cloud.yml` fails on bkit's own copy keeping `context (…)`, `claude (…)` or `opencode (…)`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-renovate.yml` fails on bkit's own copy keeping `name: Renovate` or a job with no `name:`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-trivy.yml` fails on bkit's own copy keeping `name: Trivy` or a job with no `name:`

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push`, `.bkit/templates/.cursor/Dockerfile`, `.cursor/Dockerfile`, `package.json`, `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/pre-commit`, `.husky/pre-push`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`, `.bkit/core/engine/audits/repo/release-workflow.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/checks/after/index.test.ts`, `.bkit/core/engine/checks/after/tools.test.ts`
- TASK 3 (group 1, done): Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — `.bkit/core/engine/audits/templates/branding.test.ts`, `.bkit/core/.bkit/templates.md`, `.bkit/templates/scripts/graphify/bkit-graphify.sh`, `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`, `.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh`, `.bkit/templates/scripts/graphify/bkit-graph-drift.py`, `.bkit/templates/scripts/graphify/bkit-graph-eager.py`, `.bkit/templates/scripts/graphify/bkit-graph-imports.py`, `.bkit/templates/scripts/graphify/bkit-graph-surface.py`, `.bkit/templates/scripts/graphify/bkit-graph-repair.py`, `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py`, `.bkit/templates/docs/capabilities.md`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-ci.yml`, `.bkit/core/engine/checks/tips/catalogue.ts`, `package.json`, `.husky/pre-push`, `docs/templates/bkit-audit-duplication.md`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `scripts/graphify/bkit-graphify.sh`, `scripts/graphify/bkit-graphify-rollup.py`, `scripts/graphify/bkit-graph-pre-push.sh`, `scripts/graphify/bkit-graph-drift.py`, `scripts/graphify/bkit-graph-eager.py`, `scripts/graphify/bkit-graph-imports.py`, `scripts/graphify/bkit-graph-surface.py`, `scripts/graphify/bkit-graph-repair.py`, `scripts/graphify/bkit-graphify-graphml.py`, `docs/capabilities.md`, `.bkit/core/engine/audits/templates/templates-content.test.ts`

Reuse Inventory rows left out: 8; Architecture entries left out: 3 — read them in docs/plans/202610/748-brand-every-consumer-plan.md § Reuse Inventory and § Architecture & Component Changes.
