# Brief: group 3 — Challenge round 2 findings

Plan: Template Copies Commit Cleanly Implementation Plan

## Why and what

### Context & Goals

After `bkit upgrade`, the sample configs `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` act as live configs in a consumer repo: lint-staged runs prettier from `.bkit/templates/`, which reformats the refreshed copies and blocks the commit. Rename the two samples to `lintstagedrc.example.json` and `prettierignore.example` so neither tool discovers them, update every reference, and prove a staged template copy commits unchanged with plain `pnpm lint-staged`.

## Where it fits

- Group 1: Rename the sample configs and prove the fix — done
  - TASK 1: Rename both sample configs, fix the tests that name the old paths, and add the regression tests — done
  - TASK 2: Update the references to the old sample names — done
  - TASK 3: Check whether `.bkit/templates/.oxlintrc.json` is the same trap — done
- Group 2: Challenge round 1 findings — done
  - TASK 4: A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found" — superseded by task 5 (owner, `build-decision-1-3.md`) — done
- Group 3: Challenge round 2 findings — this group
  - TASK 5: A consumer that commits through husky + lint-staged, relied on the nested sample and never copied `scripts/prettier/bkit-insert-ignore.mjs`, upgrades; the migration's root `.lintstagedrc.json` now claims every staged file, so the next bkit workflow commit that stages `docs/plans/**/*.md` runs `node scripts/prettier/bkit-insert-ignore.mjs`, which does not exist, and the pre-commit hook fails every such commit — open
  - TASK 6: A consumer whose own commit config is `lint-staged.config.ts` (or `.lintstagedrc.ts` / `.mts` / `.cts`, `lint-staged.config.mts` / `.cts`, or a `lint-staged` key in `package.yaml`) upgrades; `hasLintStagedConfig` does not know those names, so the migration writes `.lintstagedrc.json` beside it, and lint-staged, which sorts same-folder configs alphabetically and gives each folder to the first, silently runs bkit's sample instead of the consumer's own tasks — open
  - TASK 7: Every consumer that never adopted lint-staged gets an unrequested `.lintstagedrc.json` at its root on upgrade, and the "Quick tidy-up on commit" tip stops firing, because install seeds `bkit:gate:format` = `pnpm lint-staged` into every consumer, so the migration's gate check is true for all of them and nothing checks that lint-staged is installed — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** A consumer that commits through husky + lint-staged, relied on the nested sample and never copied `scripts/prettier/bkit-insert-ignore.mjs`, upgrades; the migration's root `.lintstagedrc.json` now claims every staged file, so the next bkit workflow commit that stages `docs/plans/**/*.md` runs `node scripts/prettier/bkit-insert-ignore.mjs`, which does not exist, and the pre-commit hook fails every such commit
      **Severity:** HIGH · **Class:** architectural · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:164` · **Round:** 2
  - **DONE WHEN:** The owner chose Fix now with the direction in `build-decision-1-3.md`. bkit writes no lint-staged config into a consumer repo: `migrateLintStagedSample`, its calls in `runCoreModule` (`.bkit/core/engine/install/modules/core.ts`) and `runUpgradeCommand` (`.bkit/core/engine/commands/install/upgrade.ts`), the `#892 — upgrade copies the lint-staged sample to the root` tests and the `Lint-staged sample copied to the root` row in `docs/migrations.md` are removed. In their place install and upgrade print exactly one line, `bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, when `package.json` `scripts["bkit:gate:format"]` runs `lint-staged` without a `--config` / `-c` path, `readDependencyNames(cwd)` (`.bkit/core/engine/shared/package-json.ts`) includes `lint-staged`, and `hasLintStagedConfig(cwd)` (`.bkit/core/engine/checks/tips/detect.ts`) is false; the line is printed in a dry run too and writes nothing. `.bkit/templates.md` § lint-staged names the line. One `docs/decisions.jsonl` row, appended with `bkit ledgers append`, records that the warning replaces the migration and names the superseded key `892-template-copies-bkit-lintstaged-root-migration`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged config for a consumer that relied on the nested sample` fails on `.lintstagedrc.json` existing at the consumer root after upgrading a consumer that holds the old `.bkit/templates/.lintstagedrc.json`, has `bkit:gate:format` = `pnpm lint-staged`, `devDependencies` `lint-staged` and no root lint-staged config
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade names the missing root lint-staged config with the copy command` fails on the upgrade output for the same consumer not containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A consumer whose own commit config is `lint-staged.config.ts` (or `.lintstagedrc.ts` / `.mts` / `.cts`, `lint-staged.config.mts` / `.cts`, or a `lint-staged` key in `package.yaml`) upgrades; `hasLintStagedConfig` does not know those names, so the migration writes `.lintstagedrc.json` beside it, and lint-staged, which sorts same-folder configs alphabetically and gives each folder to the first, silently runs bkit's sample instead of the consumer's own tasks
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:162` · **Round:** 2
  - **DONE WHEN:** `LINT_STAGED_CONFIGS` in `.bkit/core/engine/checks/tips/detect.ts:129` lists every name in lint-staged 17's `CONFIG_FILE_NAMES` (`node_modules/lint-staged/lib/configFiles.js`), including the `.ts` / `.mts` / `.cts` forms, and `hasLintStagedConfig` also reads a `lint-staged` key from `package.yaml` / `package.yml`; the task 5 upgrade line is then never printed for a repo that already has any lint-staged config.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/detect.test.ts` `hasLintStagedConfig is true for every config name lint-staged 17 reads` fails on `lint-staged.config.ts`, `.lintstagedrc.ts`, `.lintstagedrc.mts`, `.lintstagedrc.cts`, `lint-staged.config.mts`, `lint-staged.config.cts` and a `package.yaml` `lint-staged` key each returning false
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, after upgrading the task 5 consumer plus a root `lint-staged.config.ts`

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Every consumer that never adopted lint-staged gets an unrequested `.lintstagedrc.json` at its root on upgrade, and the "Quick tidy-up on commit" tip stops firing, because install seeds `bkit:gate:format` = `pnpm lint-staged` into every consumer, so the migration's gate check is true for all of them and nothing checks that lint-staged is installed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:161` · **Round:** 2
  - **DONE WHEN:** The task 5 upgrade line is not printed, and no root `.lintstagedrc.json` is written, when lint-staged is not in `readDependencyNames(cwd)`, or when the format gate passes lint-staged an explicit `--config` / `-c` path (lint-staged then reads only that file).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when lint-staged is not a dependency` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, after upgrading the task 5 consumer with no `lint-staged` in any dependency field
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, when `bkit:gate:format` is `pnpm lint-staged --config tools/lint-staged.json`

<!-- bkit:task 7 end -->
