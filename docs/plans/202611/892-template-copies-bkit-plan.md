# Template Copies Commit Cleanly Implementation Plan

## Context & Goals

After `bkit upgrade`, the sample configs `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` act as live configs in a consumer repo: lint-staged runs prettier from `.bkit/templates/`, which reformats the refreshed copies and blocks the commit. Rename the two samples to `lintstagedrc.example.json` and `prettierignore.example` so neither tool discovers them, update every reference, and prove a staged template copy commits unchanged with plain `pnpm lint-staged`.

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Staged unformatted file under the synced `.bkit/templates/scripts/` stays byte-identical after plain `lint-staged` | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 1 |
| Sync ships `lintstagedrc.example.json` and `prettierignore.example` and prunes the old dotfile names | Integration | `.bkit/core/engine/install/template-copies.integration.test.ts` | 1 |
| Upgrade of a consumer holding the old sample names leaves only the new names, and `bkit check` is clean | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 1 |
| upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 4 |
| upgrade dry run reports the lint-staged config copy without writing it | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 4 |

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Remove stale sample names from consumer copies | `.bkit/core/engine/install/template-copies.ts` | `grep -n "removed" .bkit/core/engine/install/template-copies.ts`; read `syncTemplateCopies` | `syncTemplateCopies` — already prunes any copy that left the shipped set, unconditionally | EXTEND | No code change: the rename alone makes the sync delete the old names; the regression tests prove it. No new migration. |
| Non-discoverable lint-staged sample | `.bkit/templates/lintstagedrc.example.json` | `rg -l "templates/\.lintstagedrc" --glob '!node_modules'`; `NPM_STRIP_REMAP` in `.bkit/core/engine/shared/package-roots.ts` | `.bkit/templates/.lintstagedrc.json` — same bytes, discoverable name | NEW | (c) the old file is a Supersession Inventory DELETE; a rename is a CREATE plus DELETE. |
| Non-discoverable prettier-ignore sample | `.bkit/templates/prettierignore.example` | same searches | `.bkit/templates/.prettierignore` — same bytes, discoverable name | NEW | (c) the old file is a Supersession Inventory DELETE. |
| Real-tool regression of the commit failure | `.bkit/core/engine/install/template-copies.integration.test.ts` | `rg -l "lint-staged" .bkit/core/engine --glob '*.test.ts'` | `template-copies.integration.test.ts` — owns the copy sync | EXTEND | Add tests that run the real lint-staged over synced copies. |

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/.lintstagedrc.json` | `.bkit/templates/lintstagedrc.example.json` | DELETE | lint-staged auto-discovers the dotfile name in a subfolder. |
| `.bkit/templates/.prettierignore` | `.bkit/templates/prettierignore.example` | DELETE | Prettier reads a `.prettierignore` in its working folder; the sample lacks `scripts/`. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Rename the sample configs and prove the fix

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Rename both sample configs, fix the tests that name the old paths, and add the regression tests
  - **CREATE:** `.bkit/templates/lintstagedrc.example.json`: the current `.lintstagedrc.json` bytes
  - **CREATE:** `.bkit/templates/prettierignore.example`: the current `.prettierignore` bytes
  - **DELETE:** `.bkit/templates/.lintstagedrc.json`: replaced by the example name
  - **DELETE:** `.bkit/templates/.prettierignore`: replaced by the example name
  - **UPDATE:** `ADOPTED` in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: entries for the two renamed templates keyed by the new names, with the root `.lintstagedrc.json` and `.prettierignore` still compared to them
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-path-refs.test.ts`: forbidden-name list names the new sample names, not `.prettierignore`
  - **UPDATE:** `CONSUMER_PRETTIERIGNORE_TEMPLATE` in `.bkit/core/engine/audits/templates/templates-content.test.ts`: path points at `.bkit/templates/prettierignore.example`
  - **READ:** `syncTemplateCopies` in `.bkit/core/engine/install/template-copies.ts`: prunes copies that left the shipped set
  - **DONE WHEN:** the two example files exist and the two dotfiles do not; the root `.lintstagedrc.json` and `.prettierignore` are unchanged; the three new tests and the updated dogfood, template-path-refs and templates-content tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `leaves a staged template copy unchanged under plain lint-staged` fails on the staged file being reformatted by the nested `.bkit/templates/.lintstagedrc.json` ("lint-staged" rewrote it)
    - `.bkit/core/engine/install/template-copies.integration.test.ts` `ships the sample configs under non-discoverable names` fails on `lintstagedrc.example.json` being absent and `.lintstagedrc.json` being shipped
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade replaces the old sample config names` fails on `.bkit/templates/.lintstagedrc.json` still being present after upgrade

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Update the references to the old sample names
  - **UPDATE:** `.bkit/templates.md`: lines 55, 56, 343 and the `lint-staged` / `Prettier` sections name `.bkit/templates/prettierignore.example` and `.bkit/templates/lintstagedrc.example.json`, copy commands keep the dotfile destination; note that `bkit upgrade` removes the old sample names
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: the `ask` text at lines 210 and 250 names the example files
  - **UPDATE:** `.bkit/install.md`: references to the old sample paths
  - **UPDATE:** `docs/testing.md`: the `template-path-refs.test.ts` row (line 785) names the new sample names
  - **READ:** `.bkit/core/engine/install/manifest.ts`: `bkit:gate:format` stays `pnpm lint-staged`; the rename removes the cause
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `rg -l "templates/\.(lintstagedrc|prettierignore)" .bkit docs --glob '!*.jsonl' --glob '!plans/**'` returns nothing outside generated mirrors; the tips tests pass
  - **TEST FIRST:** n/a — wording in docs and a tip's `ask` text; the behaviour is covered by task 1

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Check whether `.bkit/templates/.oxlintrc.json` is the same trap
  - **READ:** `.bkit/templates/.oxlintrc.json`: its `ignorePatterns` already list `.bkit/templates/**`
  - **READ:** `.bkit/templates.md`: seeded lint script `oxlint -c .oxlintrc.json --type-aware --deny-warnings` (line 175)
  - **UPDATE:** `.bkit/templates.md`: records the result of running oxlint from a throwaway consumer root over a violating file under `.bkit/templates/`; if oxlint reports it, also rename the sample to `oxlintrc.example.json` and update its references and the dogfood entry in the same change
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a throwaway-root `oxlint -c .oxlintrc.json` run over a violating file under `.bkit/templates/` is recorded; it either reports nothing and no rename is made, or the rename and reference updates are done and the dogfood and path-refs tests pass
  - **TEST FIRST:** n/a — a one-off check of an external tool's behaviour; a rename, if needed, is covered by the existing dogfood and path-refs tests

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found"
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:81` · **Round:** 1
  - **DONE WHEN:** The owner chose a migration (`build-decision-1-2.md`). On install / upgrade, when the consumer holds the old `.bkit/templates/.lintstagedrc.json` (the config lint-staged found until the rename), `package.json` `scripts["bkit:gate:format"]` runs `lint-staged`, and `hasLintStagedConfig(cwd)` (`.bkit/core/engine/checks/tips/detect.ts`) is false, the migration writes `.lintstagedrc.json` at the repo root with the bytes of the shipped `lintstagedrc.example.json`, before `syncTemplateCopies` prunes the old sample. It is idempotent, runs inside the normal install / upgrade write path, computes the same writeset in a dry run without writing, prints one line naming the copied file, and never touches a repo that already has any lint-staged config (`hasLintStagedConfig` true) or whose format gate does not run lint-staged. One row is added to `docs/migrations.md` § Migrations (release range up to 6.1.x) in the same change, and one `docs/decisions.jsonl` row records the owner's choice.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config` fails on no `.lintstagedrc.json` at the consumer root after upgrading a consumer that holds the old `.bkit/templates/.lintstagedrc.json`, has `bkit:gate:format` = `pnpm lint-staged` and no root lint-staged config; it also asserts the copied bytes equal `.bkit/templates/lintstagedrc.example.json` and that the upgrade output names `.lintstagedrc.json`
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run reports the lint-staged config copy without writing it` fails on the dry-run output naming no `.lintstagedrc.json` write for the same consumer; it also asserts no `.lintstagedrc.json` exists at the root afterwards

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->
