## Session Prompt — this run's, newer than everything below

#748

## Issue description — oldest

### Narrative

Branding: every name a consumer or their agent runs or sees in a consumer repo carries `bkit-` (package.json script names `bkit:`), so bkit's value shows wherever it works. bkit-internal plumbing (`.bkit/core/engine/`, `.bkit/core/hooks/*.js` parts) carries no prefix. A name the third-party tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.husky/pre-push`) is exempt.

File names already follow this (hooks, `scripts/**/bkit-*`, `context/bkit-*.md`, workflow files, issue forms). The names people type or see do not:

- package.json scripts whose command runs bkit code: `graph`, `graph:check|clean|graphml|refresh|rollup|scoped|tree|update` (`.bkit/templates.md:500-508`, all run `scripts/graphify/bkit-graphify.sh`); `lint:prose` (`bkit ci prose`) and `slop:delta` (`bkit ci slop`) (`.bkit/templates.md:164-166`), both chained by `BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`.
- GitHub check names on every PR: `bkit-cloud.yml` jobs show as `context`, `claude`, `opencode`; `bkit-renovate.yml` as `Renovate`; `bkit-trivy.yml` as `Trivy`. `bkit-ci.yml` jobs (`bkit-tests-*`) already comply.
- Vale style `House` (`.bkit/templates/.vale/styles/House/`, `.bkit/templates/.vale.ini`): findings print as `House.LLMSlop`.
- The smoke stub in `bkit-ci.yml:665-674` names a `smoke.yml` / `Smoke` workflow and listens on `workflows: ["CI"]`, a name no bkit workflow has (the CI workflow is `bkit-ci`), so the copied stub never fires.

Existing consumers keep the old names because `BKIT_GATE_SCRIPTS` is add-if-missing and every other surface is copy-and-own. An upgrade migration (`docs/migrations.md`) brings them current, so `bkit upgrade` alone is enough.

### Success Criteria

- Every package.json script name `.bkit/templates.md` seeds or lists whose command runs bkit code starts with `bkit:`; `typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare` keep their names.
- Every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` (smoke stub included) starts with `bkit-`, and the smoke stub listens on `bkit-ci`.
- The shipped Vale style is `Bkit`; `.vale.ini` and every doc reference name `Bkit.*`.
- `bkit upgrade` on a consumer with the old names renames them in package.json, `.husky/pre-commit`, `.husky/pre-push`, the `bkit.testing.ciWorkflow` file and bkit's shipped workflow / Vale copies; a second run changes nothing.
- A branding guard test fails when a new consumer-facing script, check or style name lacks the prefix; `.agents/rules.md` § Naming Conventions states the rule and `docs/decisions.jsonl` records why.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer has `lint:prose` with a customised value | Key renamed to `bkit:lint:prose`, value kept |
| Consumer already has both `lint:prose` and `bkit:lint:prose` | Nothing renamed; old key left; logged once |
| Consumer script value calls `pnpm graph:update` or `pnpm run lint:prose` | Token rewritten to the new name; rest of the value untouched |
| `bkit:gate:static` holds the old default chain | Rewritten to the new default chain |
| Consumer's `.vale/styles/House/` holds the four shipped rules plus their own | Only files matching a shipped release hash move to `Bkit/`; own rules stay in `House`; `.vale.ini` `BasedOnStyles` lists both |
| Consumer edited a shipped Vale rule | File left in `House`; logged |
| Consumer's workflow `name:` line was customised | Left alone; only the exact shipped old line is rewritten |
| Consumer has no `.husky/`, no CI workflow or no `.vale/` | Skipped silently |
| `--dry-run` | Same writeset computed, nothing written |
| Consumer marked `Trivy / trivy` or a cloud job as a required branch-protection check | Not touched by the migration (only `bkit-tests-check` is the documented required check); see Open Questions |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Gate chains call `bkit:lint:prose` and `bkit:slop:delta` | Unit | `.bkit/core/engine/install/manifest.test.ts` |
| Gate tool scripts map `bkit:lint:prose` → `bkit ci prose`, `bkit:slop:delta` → `bkit ci slop` | Unit | `.bkit/core/engine/install/manifest.test.ts` |
| `bkit-tests-static` steps match the renamed gate parts | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| Upgrade renames old script keys, keeps custom values | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Upgrade rewrites `pnpm <old>` tokens in script values and the old default gate chains | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Upgrade leaves the old key when the new key exists | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Upgrade rewrites old tokens in `.husky/*` and the CI workflow file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Second upgrade and `--dry-run` write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
| Upgrade rewrites shipped old workflow / job `name:` lines, leaves customised ones | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Upgrade moves shipped-hash Vale rules to `Bkit/`, keeps own and edited rules in `House` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Vale template ships `Bkit` style and `.vale.ini` names it | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` |
| Smoke stub is `bkit-smoke` and listens on `bkit-ci` | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| Branding guard: template script names running bkit code, workflow / job display names, Vale style all carry the prefix | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` |
| bkit's own adopted copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` |

### Tasks

<!-- bkit:group 1 start -->

### TASK GROUP 1: Rename bkit-powered package.json scripts

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` in the engine
  - **UPDATE:** `BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`: gate chains call the new names
  - **UPDATE:** `GATE_TOOL_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`: keys renamed
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: gate advisory text (line ~1123)
  - **UPDATE:** `.bkit/core/engine/cli.ts`: help text (line ~814)
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: header comments
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: Vale advisory text
  - **DONE WHEN:** `grep -rn "lint:prose\|slop:delta" .bkit/core/engine` hits only the `bkit:` forms and migration old-name tables
  - **TEST FIRST:**
    - `.bkit/core/engine/install/manifest.test.ts` `gate chains call bkit:lint:prose and bkit:slop:delta` fails on the old names
    - `.bkit/core/engine/install/manifest.test.ts` `bkit:lint:prose and bkit:slop:delta call their bkit ci gates` fails on missing keys

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rename the scripts in every template and doc, and `graph*` → `bkit:graph*`
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: `run: pnpm bkit:lint:prose`, `run: pnpm bkit:slop:delta`, comments
  - **UPDATE:** `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push`, `.bkit/templates/.cursor/Dockerfile`: names in commands and comments
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify.sh`, `bkit-graph-repair.py`, `bkit-graph-eager.py`, `bkit-graphify-rollup.py`, `bkit-graph-imports.py`: usage / hint strings name `pnpm bkit:graph:*`
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: graphify and slop tip text
  - **UPDATE:** `.bkit/templates.md` (and `.bkit/core/.bkit/templates.md`): script blocks lines ~159-167 and ~500-508
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-duplication.md`: `pnpm bkit:graph:*`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** no template, tip or doc under `.bkit/` names `pnpm graph`, `pnpm lint:prose` or `pnpm slop:delta`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `bkit-tests-static steps match the gate parts` fails on the old step names

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Upgrade migration for package.json and the hook / CI copies
  - **CREATE:** `migrateBrandedScriptNames` in `.bkit/core/engine/install/modules/core.ts`: old→new table; old key present and new absent → rename key, keep value; whole-token `pnpm <old>` / `pnpm run <old>` → new in every script value; called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`
  - **CREATE:** same token rewrite over `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file, inside the install write path (dry-run computes the same writeset)
  - **UPDATE:** `docs/migrations.md`: one row
  - **DEPENDS ON:** 1
  - **DONE WHEN:** an old-shape scratch consumer upgrades to the new names and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `renames old bkit script keys and keeps custom values` fails on unrenamed keys
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites old script tokens in values and default gate chains` fails on old tokens
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves the old key when the new key exists` fails on a clobbered key
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites old script tokens in husky hooks and the CI workflow` fails on old tokens
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `branded script migration is idempotent and dry-run writes nothing` fails on a second write

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Brand check names and the Vale style

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Brand workflow and job display names; fix the smoke stub
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: job names `bkit-cloud-context (…)`, `bkit-cloud-claude (…)`, `bkit-cloud-opencode (…)`; job ids unchanged
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-renovate.yml`, `bkit-trivy.yml`: workflow `name: bkit-renovate` / `bkit-trivy`; job display names the same
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: smoke stub → `.github/workflows/bkit-smoke.yml`, `name: bkit-smoke`, `workflows: [bkit-ci]`
  - **DONE WHEN:** every `name:` in the four workflow templates starts with `bkit-`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `smoke stub is bkit-smoke and listens on bkit-ci` fails on `["CI"]`

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Rename Vale style `House` → `Bkit`
  - **UPDATE:** `.bkit/templates/.vale/styles/House/*.yml` → `.bkit/templates/.vale/styles/Bkit/*.yml`
  - **UPDATE:** `.bkit/templates/.vale.ini`: `BasedOnStyles = Bkit`, `Bkit.*` toggles
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/templates.md`, `.bkit/README.md`, `.bkit/instructions.md`, `.bkit/templates/context/bkit-supabase.md`: `Bkit` style references
  - **DONE WHEN:** `grep -rn "House" .bkit` hits only migration old-name tables
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `Vale template ships the Bkit style and .vale.ini names it` fails on `House`

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Upgrade migration for workflow names and the Vale style
  - **CREATE:** in `.bkit/core/engine/install/modules/core.ts`: rewrite the exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`; customised lines left alone
  - **CREATE:** in `.bkit/core/engine/install/modules/core.ts`: `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` whose hash matches a shipped release → moved to `.vale/styles/Bkit/`; `.vale.ini` `House.<rule>` → `Bkit.<rule>` for moved rules; `BasedOnStyles` keeps `House` while it still holds files
  - **UPDATE:** `docs/migrations.md`: one row per migration
  - **DEPENDS ON:** 4, 5
  - **DONE WHEN:** an old-shape scratch consumer upgrades to the new names, own and edited Vale rules stay in `House`, and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites shipped old workflow names and leaves customised ones` fails on old names
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `moves shipped Vale rules to Bkit and keeps own and edited rules in House` fails on `House`

<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Guard, rule and dogfood

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Branding guard test
  - **CREATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`; every package.json script name in `.bkit/templates.md` blocks whose command runs `bkit` or `scripts/**/bkit-*` starts with `bkit:`; every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-`; the shipped Vale style is `Bkit`
  - **DEPENDS ON:** 2, 4, 5
  - **DONE WHEN:** the test passes on the renamed tree and fails on a seeded `graph` script name
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix` fails on an unprefixed name

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Write the rule and record why
  - **UPDATE:** `.agents/rules.md` § Naming Conventions (below `bkit:end`, bkit-repo only): branding bullet — consumer-facing file, script, check and style names carry `bkit-` / `bkit:`; internal engine and hook parts never; tool-fixed names exempt
  - **CREATE:** `docs/decisions.jsonl` row via `bkit ledgers append`: the prefix is branding, so consumers see bkit's value where it runs
  - **DONE WHEN:** both present; `pnpm instructions:sync` check (no `--write`) clean
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Refresh bkit's own adopted copies
  - **UPDATE:** root `package.json` scripts, `.husky/pre-commit`, `.husky/pre-push`, `.github/workflows/bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`, `scripts/graphify/*`, `.vale/`, `.vale.ini`: match the renamed templates
  - **UPDATE:** `docs/testing.md`, `docs/deployments.md`, `docs/setup.md`, `docs/technology.md`, `CONTRIBUTING.md`: new names
  - **DEPENDS ON:** 3, 6
  - **DONE WHEN:** `pnpm build` → `node dist/cli.js upgrade` on a packed-tarball scratch consumer with the old shape lands the new names; bkit's own pre-push gate passes on the new names
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `adopted copies match renamed templates` fails on drift

<!-- bkit:task 9 end -->
<!-- bkit:group 3 end -->

### Open Questions & Assumptions

- Assumed: rename only scripts whose command runs bkit code. `lint:slop` (third-party `slop-scan`, report-only) keeps its name; say if it should become `bkit:lint:slop`.
- Assumed: only display names change in workflows; job ids (`context`, `run`, `opencode`, `renovate`, `trivy`) stay so `needs:` and consumer edits keep working.
- Open: a consumer who made a cloud, Renovate or Trivy check a required branch-protection check gets a stuck PR after the rename. Add a detect-only `bkit check` advisory, or leave it to release notes?
- Assumed: consumer's own scripts that wrap bkit tools (`db:reset` → `bkit-local-stack-lock.sh`) are the consumer's names and stay.

### Breaking Changes & Naming

- package.json: `lint:prose` → `bkit:lint:prose`; `slop:delta` → `bkit:slop:delta`; `graph` → `bkit:graph`; `graph:<verb>` → `bkit:graph:<verb>`.
- Checks: `context (…)` → `bkit-cloud-context (…)`; `claude (…)` → `bkit-cloud-claude (…)`; `opencode (…)` → `bkit-cloud-opencode (…)`; `Renovate` → `bkit-renovate`; `Trivy` → `bkit-trivy`; smoke stub `Smoke` / `smoke.yml` → `bkit-smoke` / `bkit-smoke.yml`.
- Vale: `House.*` → `Bkit.*`.
- Anyone typing the old names (agents, humans, consumer docs) breaks until upgraded; the migration covers bkit-shipped surfaces only.

### Out of Scope

- Generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `prepare`): consumer-owned slots, stack-agnostic contract.
- File names the tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.serena/project.yml`, `slop-scan.config.json`, `.husky/*`).
- Engine-internal names (`.bkit/core/engine/shared/bkit-latest.ts` keeps its name: it names the bkit release check, not a brand).
- Job ids.

### References

- `.bkit/templates.md` § Gate tool scripts
- `.bkit/core/engine/install/manifest.ts` `BKIT_GATE_SCRIPTS`
- `docs/migrations.md` § Migrations — `ci-scripts-old-names` advisory (prior CI-script rename)
- `docs/testing.md` § CI test tiers — `bkit-tests-check` is the sole required check
