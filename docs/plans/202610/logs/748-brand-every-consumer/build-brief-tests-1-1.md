# Brief: group 1 — Rename bkit-powered package.json scripts and template files (tests)

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

- Group 1: Rename bkit-powered package.json scripts and template files — this group
  - TASK 1: Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired — open
  - TASK 2: Rename the two unprefixed launchd template files to `bkit-*` — open
  - TASK 3: Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names — open
- Group 2: Migrate script names; brand check names — next
  - TASK 4: Upgrade migration for package.json script names — open
  - TASK 5: Brand workflow and job display names — open
- Group 3: Brand the Vale style; migrate hook and CI tokens and CI script files — later
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

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired
  - **UPDATE:** `BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`: gate chains call `pnpm bkit:lint:prose` / `pnpm bkit:slop:delta`; comments
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: gate advisory text (line ~1098)
  - **UPDATE:** `.bkit/core/engine/cli.ts`: help text (line ~814)
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: header comments (lines 3, 12)
  - **UPDATE:** `detectValeMissing` in `.bkit/core/engine/checks/after/tools.ts`: look up the `bkit:lint:prose` script key instead of the literal `"lint:prose"` (line 35), so the `vale-not-installed` advisory keeps firing after the rename; its doc comment (line 26) and `detect` text (line 44) name `bkit:lint:prose`
  - **UPDATE:** `detectValePackageNotSynced` in `.bkit/core/engine/checks/after/tools.ts`: `lint:prose` in its write-good `action` text (line 76)
  - **UPDATE:** `renderAdvisoriesMarkdown` in `.bkit/core/engine/checks/after/index.ts`: comment naming the shipped `lint:prose` (line 177)
  - **UPDATE:** `runPostInstallCheck` in `.bkit/core/engine/checks/after/index.ts`: the comment `vale missing while lint:prose runs the prose gate` above the `detectValeMissing` call (line 483) names `bkit:lint:prose`
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `lint:prose` / `slop:delta` parts of the CI and slop tip text (lines 170, 200)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Gate tool scripts json block and table keys (lines ~146-178, ~192, ~246-263)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: gate chains (lines ~1405-1421)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: `run: pnpm bkit:lint:prose`, `run: pnpm bkit:slop:delta "$BASE_SHA"` and comments naming them (lines 61, 194, 216, 228, 813)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: comment `phase's bkit:lint:prose` (line 498)
  - **UPDATE:** `.bkit/templates/.husky/pre-commit`: comments naming `slop:delta` (lines 6, 10)
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: comment naming `slop:delta` (line 195)
  - **UPDATE:** `.bkit/templates/.cursor/Dockerfile`: comment naming `pnpm lint:prose` (line 58)
  - **UPDATE:** `.cursor/Dockerfile`: bkit's own copy (line 58; pinned `identical` by `dogfood-templates.test.ts:429`)
  - **UPDATE:** `package.json`: keys `bkit:lint:prose`, `bkit:slop:delta`; bkit's own `bkit:gate:*` chains call them
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: bkit's own copy (lines 351, 436, 458, 475)
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: bkit's own copy (line 498)
  - **UPDATE:** `.husky/pre-commit`: bkit's own copy (lines 6, 10)
  - **UPDATE:** `.husky/pre-push`: bkit's own copy (line 292)
  - **UPDATE:** `.bkit/core/engine/install/manifest.test.ts`: `gate tool script template values` keys; `this repo's lint:prose calls the same gate` → `this repo's bkit:lint:prose calls the same gate`
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: `reads the gate as a chain of pnpm scripts` expects `bkit:lint:prose`, `bkit:slop:delta`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: `lists slop:delta as the bkit ci slop verb` → `lists bkit:slop:delta as the bkit ci slop verb`
  - **UPDATE:** `.bkit/core/engine/audits/repo/release-workflow.test.ts`: line 157 `pnpm bkit:lint:prose`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-ci.yml` adapted edits (lines 180, 194) name `pnpm bkit:slop:delta`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: `names the tool scripts a default gate chains that package.json lacks` (line 261) and the `bkit:gate:format` advisory case (lines 290-294) use the new names
  - **UPDATE:** `.bkit/core/engine/checks/after/index.test.ts`: test title naming `lint:prose` (line 181)
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.test.ts`: the three `detectValeMissing` tests (lines 67, 75, 81) seed `bkit:lint:prose` and name it in their titles; `returns a finding when lint:prose runs bkit ci prose and vale is not on PATH` → `returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH`, which fails on the old `"lint:prose"` lookup and also asserts the `detect` text names `bkit:lint:prose`
  - **READ:** `unresolvedGateCalls` in `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: every default-gate `pnpm` call resolves in the repo's own `package.json`
  - **DONE WHEN:** every `lint:prose` / `slop:delta` in non-test files under `.bkit/core/engine`, `.bkit/templates/.github/`, `.bkit/templates/.husky/` and `.bkit/core/.bkit/templates.md` is preceded by `bkit:`; root `package.json` has no `lint:prose` / `slop:delta` key; `detectValeMissing` reads `scripts["bkit:lint:prose"]`; `grep -nE '(^|[^:])lint:prose' .bkit/core/engine/checks/after/tools.test.ts` is empty; `tools.test.ts` `detectValeMissing > returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH` passes; `template-ci-yml.test.ts` `runs every part of the local static gate as a step, bar the named exceptions`, `local-gate-audit.test.ts` and `dogfood-templates.test.ts` pass; `pnpm bkit:gate:static` passes on bkit
  - **TEST FIRST:**
    - `.bkit/core/engine/install/manifest.test.ts` `gate chains call bkit:lint:prose and bkit:slop:delta` fails on chains calling the old names
    - `.bkit/core/engine/install/manifest.test.ts` `gate tool script template values > bkit:lint:prose and bkit:slop:delta call their bkit ci gates` fails on the `templates.md` block lacking the new keys
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `template bkit-tests-static job matches the bkit:gate:static local gate > reads the gate as a chain of pnpm scripts` fails on the old gate parts (the issue's `bkit-tests-static steps match the gate parts`)
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks` fails on the advisory naming `lint:prose` / `slop:delta`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rename the two unprefixed launchd template files to `bkit-*`
  - **CREATE:** `.bkit/templates/scripts/launchd/bkit-launchd.plist`: moved byte-identical (Label `ai.bkit.launchd` kept)
  - **CREATE:** `.bkit/templates/scripts/launchd/bkit-launchd.env.example`: moved byte-identical
  - **DELETE:** `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`: replaced by `bkit-launchd.plist`
  - **DELETE:** `.bkit/templates/scripts/launchd/launchd.env.example`: replaced by `bkit-launchd.env.example`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: placeholder rows (lines 84-85) and § Launchd GUI environment table source column and `cp` commands (lines 324-334) name the `bkit-launchd.*` templates; each `cp` names its destination file (`cp .bkit/templates/scripts/launchd/bkit-launchd.plist ~/Library/LaunchAgents/ai.bkit.launchd.plist`), because copying into the directory would install it as `bkit-launchd.plist`; install destinations `~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env` and the `launchctl` lines (336-337, 350) unchanged
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: launchd tip `ask` (line 450) names the `bkit-launchd.*` sources and the `ai.bkit.launchd.plist` / `launchd.env` destination files
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` keys `scripts/launchd/bkit-launchd.plist`, `scripts/launchd/bkit-launchd.env.example` (lines 611, 615)
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: `PLIST` / `ENV_EXAMPLE` paths and describes `bkit-launchd.plist`, `bkit-launchd.env.example` (lines 692-693, 731, 748)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `find .bkit/templates/scripts .bkit/templates/context -type f ! -name 'bkit-*'` is empty; `git grep -nE 'scripts/launchd/(ai\.bkit\.launchd\.plist|launchd\.env\.example)' -- .bkit/core/engine .bkit/templates .bkit/core/.bkit .bkit/shared ':!*.test.ts'` is empty; `templates-content.test.ts`, `catalogue.test.ts` and `dogfood-templates.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > every template has an entry, and every entry is a template` fails on `ADOPTED` keyed by the old launchd file names
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `bkit-launchd.plist > is a LaunchAgent that loads at login and re-runs on env-file writes` fails on the plist still shipping as `ai.bkit.launchd.plist` or its Label changing

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: graphify script block and table (lines ~485-555)
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify.sh`: usage and hint strings name `pnpm bkit:graph*`
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`: `docs/capabilities.md` header lines (~763-785) name `pnpm bkit:graph:refresh`, `pnpm bkit:graph:update`, `pnpm bkit:graph`; `slop:delta` hint (line 672) reads `bkit:slop:delta`
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-drift.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-eager.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-imports.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-surface.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-repair.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py`: hint strings
  - **UPDATE:** `.bkit/templates/docs/capabilities.md`: lines 3, 12, 33, 64, 68, 72
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: comments and messages naming `pnpm graph*` (lines 275, 295)
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: bkit's own copy (lines 531, 551)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `pnpm graph*` parts of the graphify and slop tip text (lines 170, 200)
  - **UPDATE:** `package.json`: `graph`, `graph:<verb>` keys → `bkit:graph`, `bkit:graph:<verb>`
  - **UPDATE:** `package.json`: `bkit:generate` value (line 66) calls `pnpm bkit:graph:refresh` instead of `pnpm graph:refresh` inside its `command -v graphify` branch
  - **UPDATE:** `.husky/pre-push`: bkit-only graphify hints (lines 259, 263, 274)
  - **UPDATE:** `docs/templates/bkit-audit-duplication.md`: project part (below `bkit:end`) permissions and capability-register lines name `pnpm bkit:graph:check`, `pnpm bkit:graph:update`, `pnpm bkit:graph:rollup` (lines 242, 246, 249)
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `what: "pnpm bkit:graph:rollup writes it"` (line 459)
  - **UPDATE:** `scripts/graphify/bkit-graphify.sh`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graphify-rollup.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-pre-push.sh`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-drift.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-eager.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-imports.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-surface.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-repair.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graphify-graphml.py`: bkit's own copy
  - **UPDATE:** `docs/capabilities.md`: regenerated with `pnpm bkit:graph:refresh`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: graphify script assertions
  - **CREATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: describe `consumer-facing names carry the bkit prefix` — script names in `.bkit/core/.bkit/templates.md` json blocks whose value runs `bkit ` or `scripts/**/bkit-*` start with `bkit:`; every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`, no exception list; checks are pure functions so seeded negatives run on fixture text
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** no file under `.bkit/templates/`, `.bkit/core/.bkit/`, `.bkit/core/engine/checks/` names `pnpm graph` without `bkit:`; `grep -rnE '(^|[^:])(lint:prose|slop:delta)' .bkit/templates` is empty; `docs/templates/bkit-audit-duplication.md` names no `pnpm graph:` script without `bkit:`; root `package.json` has no `graph*` key; no root `package.json` script value calls `pnpm graph` (`bkit:generate` calls `pnpm bkit:graph:refresh`); `pnpm bkit:graph:check` passes on bkit; `husky-pre-push.integration.test.ts`, `catalogue.test.ts` and `dogfood-templates.test.ts` pass; `branding.test.ts` passes on the tree and its file-name check fails on a seeded `scripts/foo.sh`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `lists the graphify scripts under bkit:graph names` fails on `graph*` keys
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template script names that run bkit code` fails on the shipped `graph` script names
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code` fails on a seeded `"graph": "bash scripts/graphify/bkit-graphify.sh"` passing
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template file names` fails on a seeded unprefixed `scripts/foo.sh` passing or any shipped file under `.bkit/templates/scripts/` / `.bkit/templates/context/` lacking `bkit-`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify.sh` fails on bkit's own copy still naming `pnpm graph*`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py` fails on bkit's own copy still writing `pnpm graph*` header lines

<!-- bkit:task 3 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Gate chains call `bkit:lint:prose` and `bkit:slop:delta` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 1 |
| Gate tool scripts map `bkit:lint:prose` → `bkit ci prose`, `bkit:slop:delta` → `bkit ci slop` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 1 |
| `bkit-tests-static` steps match the renamed gate parts | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | 1 |
| Upgrade renames old script keys, keeps custom values | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites `pnpm <old>` tokens in script values and the old default gate chains | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade leaves the old key when the new key exists | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites old tokens in `.husky/*` and the CI workflow file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| Upgrade rewrites shipped old workflow / job `name:` lines, leaves customised ones | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| Upgrade moves shipped-hash Vale rules to `Bkit/`, keeps own and edited rules in `House` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Branding guard: template script names running bkit code, workflow / job display names, Vale style all carry the prefix | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| bkit's own adopted copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 6 |
| Gate advisory names the missing tool scripts by their `bkit:` names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 1 |
| A foreign `graph*` script (value not running `scripts/graphify/bkit-`) keeps its key and its `pnpm graph` tokens | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| An old name the rewrite cannot reach (`pnpm --filter web lint:prose`) logs one warning naming file and line | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `package.json` that is not valid JSON gets no migration write and the error reaches the upgrade output | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `templates.md` lists the graphify scripts under `bkit:graph*` names | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 3 |
| Branding guard flags a seeded unprefixed script name that runs bkit code | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| Branding guard: every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`; a seeded `scripts/foo.sh` fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| `dogfood-templates.test.ts` `ADOPTED` names the renamed launchd templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 2 |
| The LaunchAgent template ships as `bkit-launchd.plist` with Label `ai.bkit.launchd` | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| bkit's own graphify copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 3 |
| Branding guard: workflow and job display names (`name`, else the job id) pass, a seeded unprefixed job display name fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 5 |
| bkit's own `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 5 |
| Branding guard: the shipped Vale style is `Bkit` | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| Shipped-content CI script units move to `bkit-` names with their data files, and their `scripts/ci/` paths are rewritten | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| An edited CI script unit, or one whose `bkit-` target exists, stays and is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| The upgrade log names each renamed check with the branch-protection fix | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A `renovate:` / `trivy:` job that already carries a `name:` gets none inserted | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A custom `bkit.testing.ciWorkflow` file gets the health-stub rewrite; `bkit-ci.yml` is not looked for | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| `.vale.ini` names moved rules `Bkit.*` and lists both styles while `House` keeps files | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Every `House` rule moved → `House/` removed, `BasedOnStyles` names `Bkit` alone, toggles read `Bkit.<rule>` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| `.vale/` present, `.vale.ini` absent → rules move, no `.vale.ini` write | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
