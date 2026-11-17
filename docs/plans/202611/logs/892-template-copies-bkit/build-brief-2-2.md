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
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:81` · **Round:** 1
  - **DONE WHEN:** The owner chose a migration (`build-decision-1-2.md`). On install / upgrade, when the consumer holds the old `.bkit/templates/.lintstagedrc.json` (the config lint-staged found until the rename), `package.json` `scripts["bkit:gate:format"]` runs `lint-staged`, and `hasLintStagedConfig(cwd)` (`.bkit/core/engine/checks/tips/detect.ts`) is false, the migration writes `.lintstagedrc.json` at the repo root with the bytes of the shipped `lintstagedrc.example.json`, before `syncTemplateCopies` prunes the old sample. It is idempotent, runs inside the normal install / upgrade write path, computes the same writeset in a dry run without writing, prints one line naming the copied file, and never touches a repo that already has any lint-staged config (`hasLintStagedConfig` true) or whose format gate does not run lint-staged. One row is added to `docs/migrations.md` § Migrations (release range up to 6.1.x) in the same change, and one `docs/decisions.jsonl` row records the owner's choice.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config` fails on no `.lintstagedrc.json` at the consumer root after upgrading a consumer that holds the old `.bkit/templates/.lintstagedrc.json`, has `bkit:gate:format` = `pnpm lint-staged` and no root lint-staged config; it also asserts the copied bytes equal `.bkit/templates/lintstagedrc.example.json` and that the upgrade output names `.lintstagedrc.json`
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run reports the lint-staged config copy without writing it` fails on the dry-run output naming no `.lintstagedrc.json` write for the same consumer; it also asserts no `.lintstagedrc.json` exists at the root afterwards

<!-- bkit:task 4 end -->
