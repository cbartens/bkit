# Brief: group 1 — Rename the sample configs and prove the fix

Plan: Template Copies Commit Cleanly Implementation Plan

## Why and what

### Context & Goals

After `bkit upgrade`, the sample configs `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` act as live configs in a consumer repo: lint-staged runs prettier from `.bkit/templates/`, which reformats the refreshed copies and blocks the commit. Rename the two samples to `lintstagedrc.example.json` and `prettierignore.example` so neither tool discovers them, update every reference, and prove a staged template copy commits unchanged with plain `pnpm lint-staged`.

## Where it fits

- Group 1: Rename the sample configs and prove the fix — this group
  - TASK 1: Rename both sample configs, fix the tests that name the old paths, and add the regression tests — open
  - TASK 2: Update the references to the old sample names — open
  - TASK 3: Check whether `.bkit/templates/.oxlintrc.json` is the same trap — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Rename both sample configs, fix the tests that name the old paths, and add the regression tests
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

- [ ] **TASK 2:** Update the references to the old sample names
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

- [ ] **TASK 3:** Check whether `.bkit/templates/.oxlintrc.json` is the same trap
  - **READ:** `.bkit/templates/.oxlintrc.json`: its `ignorePatterns` already list `.bkit/templates/**`
  - **READ:** `.bkit/templates.md`: seeded lint script `oxlint -c .oxlintrc.json --type-aware --deny-warnings` (line 175)
  - **UPDATE:** `.bkit/templates.md`: records the result of running oxlint from a throwaway consumer root over a violating file under `.bkit/templates/`; if oxlint reports it, also rename the sample to `oxlintrc.example.json` and update its references and the dogfood entry in the same change
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a throwaway-root `oxlint -c .oxlintrc.json` run over a violating file under `.bkit/templates/` is recorded; it either reports nothing and no rename is made, or the rename and reference updates are done and the dogfood and path-refs tests pass
  - **TEST FIRST:** n/a — a one-off check of an external tool's behaviour; a rename, if needed, is covered by the existing dogfood and path-refs tests

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Non-discoverable lint-staged sample | `.bkit/templates/lintstagedrc.example.json` | `rg -l "templates/\.lintstagedrc" --glob '!node_modules'`; `NPM_STRIP_REMAP` in `.bkit/core/engine/shared/package-roots.ts` | `.bkit/templates/.lintstagedrc.json` — same bytes, discoverable name | NEW | (c) the old file is a Supersession Inventory DELETE; a rename is a CREATE plus DELETE. |
| Non-discoverable prettier-ignore sample | `.bkit/templates/prettierignore.example` | same searches | `.bkit/templates/.prettierignore` — same bytes, discoverable name | NEW | (c) the old file is a Supersession Inventory DELETE. |
