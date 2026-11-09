# Brief: group 2 — Challenge round 1 findings

Plan: Template Copies Commit Cleanly Implementation Plan

## Why and what

### Context & Goals

After `bkit upgrade`, the sample configs `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` act as live configs in a consumer repo: lint-staged runs prettier from `.bkit/templates/`, which reformats the refreshed copies and blocks the commit. Rename the two samples to `lintstagedrc.example.json` and `prettierignore.example` so neither tool discovers them, update every reference, and prove a staged template copy commits unchanged with plain `pnpm lint-staged`.

## Where it fits

- Group 1: Rename the sample configs and prove the fix — done
  - TASK 1: Rename both sample configs, fix the tests that name the old paths, and add the regression tests — done
  - TASK 2: Update the references to the old sample names — done
  - TASK 3: Check whether `.bkit/templates/.oxlintrc.json` is the same trap — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found" — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found"
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/template-copies.ts:81` · **Round:** 1
  - **DONE WHEN:** No agent can settle this: the plan records "No new migration", and `.agents/rules.md` § Migrations requires the owner to confirm any migration. The owner chooses one: (a) accept the break, because the nested sample was never meant to be the live config; (b) add an install / upgrade / `bkit check` advisory that fires when `bkit:gate:format` runs `lint-staged` and `hasLintStagedConfig(cwd)` is false, with the `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json` fix inline; or (c) a migration that copies the sample to the root in that state. The chosen option is in place and recorded in `docs/decisions.jsonl` (and in `docs/migrations.md` for (c)).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade names the missing root lint-staged config when bkit:gate:format runs lint-staged` fails on the upgrade output and `bkit check` output naming no missing `.lintstagedrc.json` after the nested `.bkit/templates/.lintstagedrc.json` is removed (lint-staged 17 `runAll.js` throws `ConfigNotFoundError` when `searchConfigs` finds zero configs; before the rename `listConfigFilesFromGit` found the nested sample through `--others --exclude-standard`)

<!-- bkit:task 4 end -->
