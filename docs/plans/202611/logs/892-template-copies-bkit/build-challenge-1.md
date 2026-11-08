Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found"
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/template-copies.ts:81`
  - **DONE WHEN:** No agent can settle this: the plan records "No new migration", and `.agents/rules.md` § Migrations requires the owner to confirm any migration. The owner chooses one: (a) accept the break, because the nested sample was never meant to be the live config; (b) add an install / upgrade / `bkit check` advisory that fires when `bkit:gate:format` runs `lint-staged` and `hasLintStagedConfig(cwd)` is false, with the `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json` fix inline; or (c) a migration that copies the sample to the root in that state. The chosen option is in place and recorded in `docs/decisions.jsonl` (and in `docs/migrations.md` for (c)).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade names the missing root lint-staged config when bkit:gate:format runs lint-staged` fails on the upgrade output and `bkit check` output naming no missing `.lintstagedrc.json` after the nested `.bkit/templates/.lintstagedrc.json` is removed (lint-staged 17 `runAll.js` throws `ConfigNotFoundError` when `searchConfigs` finds zero configs; before the rename `listConfigFilesFromGit` found the nested sample through `--others --exclude-standard`)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A workflow or prompt can now name `.prettierignore` or `.lintstagedrc.json` (an adopted-template path) and the template-path guard stays green, because the forbidden names derive from template file names and the rename dropped both destination names
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/templates/template-path-refs.test.ts:61`
  - **DONE WHEN:** `forbiddenNames()` also yields the Contract destination of each renamed sample (`.prettierignore`, `.lintstagedrc.json`), and the `derives the forbidden list from every template file` test asserts both names, so the guard covers what it covered before the rename.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-path-refs.test.ts` `forbids the destination names of the renamed sample configs` fails on `forbiddenNames()` not containing `.prettierignore` or `.lintstagedrc.json`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** An agent editing bkit's own `.bkit/templates/prettierignore.example` or `lintstagedrc.example.json` gets the generic checklist instead of the gate-config advisory, because `GATE_CONFIG_PATTERNS` match only the old dotfile basenames, while the hook comment says bkit's template source "stays guarded"
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/gateguard-engine.js:18`
  - **DONE WHEN:** `GATE_CONFIG_PATTERNS` match `prettierignore.example` and `lintstagedrc.example.json`, so in bkit's repo both source templates get `configAdvisory`, and a consumer's copies stay excluded by `isTemplateCopy`; the hook mirrors are re-rendered.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `bkit's own .bkit/templates/prettierignore.example is a gate config` fails on the hook returning the investigation checklist, not the gate-config advisory, for that path in the dogfood repo

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** The adoption audit's reconcile step runs `diff .bkit/templates/<path> <path>`, which for the renamed samples diffs against a root `prettierignore.example` / `lintstagedrc.example.json` that never exists, and its merged check runs `git log` on a path whose history starts at the upgrade commit, so an adopted `.prettierignore` reads as unreconciled or pending
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/docs/templates/bkit-audit-adoption.md:116`
  - **DONE WHEN:** Step 9 (b) diffs each template against the destination `.bkit/templates.md` § Contract names (as Step 8 already does), and (c) reads the template history with `git log --follow`; the installed copy in `docs/templates/` is re-rendered.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `adoption audit reconciles each template against its Contract destination` fails on Step 9 (b) still reading `diff .bkit/templates/<path> <path>`

<!-- bkit:task 4 end -->
