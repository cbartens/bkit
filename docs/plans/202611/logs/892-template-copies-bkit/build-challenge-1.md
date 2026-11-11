Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer that commits through husky + lint-staged, relied on the nested sample and never copied `scripts/prettier/bkit-insert-ignore.mjs`, upgrades; the migration's root `.lintstagedrc.json` now claims every staged file, so the next bkit workflow commit that stages `docs/plans/**/*.md` runs `node scripts/prettier/bkit-insert-ignore.mjs`, which does not exist, and the pre-commit hook fails every such commit
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/template-copies.ts:164`
  - **DONE WHEN:** No agent can settle this, because the owner's decision (`build-decision-1-2.md`, `docs/decisions.jsonl` key `892-template-copies-bkit-lintstaged-root-migration`) fixed the migration's output as a byte copy of the sample, and changing what bkit writes into a consumer repo needs the owner. Facts that decide it: lint-staged 17 `groupFilesByConfig` gives a nested config only the files under its own folder, so before the rename the trigger population's hook processed only `.bkit/templates/**`; the copied sample's first entry runs `node scripts/prettier/bkit-insert-ignore.mjs` on `docs/{plans,audits}/**/*.md`, and `.bkit/templates.md` § lint-staged says "Without it, commits that touch those files fail"; its second entry runs `prettier --write` on every other staged file, which needs `prettier` installed and, without a root `.prettierignore`, rewrites bkit-managed files and the `.bkit/templates/` copies the rename protects. The owner chooses one: (a) the migration writes the full sample only when `scripts/prettier/bkit-insert-ignore.mjs` and a root `.prettierignore` exist and `prettier` is a dependency, and otherwise writes a reduced config with no `node scripts/...` entry, or prints a fix line instead; (b) the migration also copies `prettierignore.example` and `scripts/prettier/bkit-insert-ignore.mjs` when they are absent; (c) accept it and record why. The chosen option is in place, `docs/migrations.md` describes it, and a `docs/decisions.jsonl` row records the choice.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged command whose script file is absent from the consumer` fails on the migrated `.lintstagedrc.json` naming `node scripts/prettier/bkit-insert-ignore.mjs` while `scripts/prettier/bkit-insert-ignore.mjs` does not exist at the consumer root (seed: `seedOldLintStagedConsumer`; parse the written JSON and assert every `node <path>` command's path exists under `tmpDir`)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A consumer whose own commit config is `lint-staged.config.ts` (or `.lintstagedrc.ts` / `.mts` / `.cts`, `lint-staged.config.mts` / `.cts`, or a `lint-staged` key in `package.yaml`) upgrades; `hasLintStagedConfig` does not know those names, so the migration writes `.lintstagedrc.json` beside it, and lint-staged, which sorts same-folder configs alphabetically and gives each folder to the first, silently runs bkit's sample instead of the consumer's own tasks
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:162`
  - **DONE WHEN:** `LINT_STAGED_CONFIGS` in `.bkit/core/engine/checks/tips/detect.ts:129` lists every name in lint-staged 17's `CONFIG_FILE_NAMES` (`node_modules/lint-staged/lib/configFiles.js`), including the `.ts` / `.mts` / `.cts` forms, and `hasLintStagedConfig` also reads a `lint-staged` key from `package.yaml` / `package.yml`; the migration then never writes a root `.lintstagedrc.json` into a repo that already has any lint-staged config, as the owner's decision requires.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/detect.test.ts` `hasLintStagedConfig is true for every config name lint-staged 17 reads` fails on `lint-staged.config.ts`, `.lintstagedrc.ts`, `.lintstagedrc.mts`, `.lintstagedrc.cts`, `lint-staged.config.mts`, `lint-staged.config.cts` and a `package.yaml` `lint-staged` key each returning false
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade leaves a consumer's lint-staged.config.ts as its only root config` fails on `.lintstagedrc.json` existing at the root after upgrading `seedOldLintStagedConsumer` plus a root `lint-staged.config.ts`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Every consumer that never adopted lint-staged gets an unrequested `.lintstagedrc.json` at its root on upgrade, and the "Quick tidy-up on commit" tip stops firing, because install seeds `bkit:gate:format` = `pnpm lint-staged` into every consumer, so the migration's gate check is true for all of them and nothing checks that lint-staged is installed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:161`
  - **DONE WHEN:** `migrateLintStagedSample` returns false unless `readDependencyNames(cwd)` includes `lint-staged`, and also when the format gate passes lint-staged an explicit `--config` / `-c` path (lint-staged then reads only that file, so a root copy is never used); the two existing `#892 — upgrade copies the lint-staged sample to the root` tests seed `devDependencies: { "lint-staged": "^17.0.0" }` so they keep proving the copy.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged config when lint-staged is not a dependency` fails on `.lintstagedrc.json` existing at the root after upgrading `seedOldLintStagedConsumer` (seeded gate, old sample, no `lint-staged` in any dependency field)
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged config when the format gate passes lint-staged a config path` fails on `.lintstagedrc.json` existing at the root when `bkit:gate:format` is `pnpm lint-staged --config tools/lint-staged.json`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `bkit install` on a consumer in the trigger state records `.lintstagedrc.json` in `.bkit/version` `canonicalHashes`, so a copy-and-own file the consumer is told to adapt is tracked as a bkit-managed file, because the install path pushes the write without `unhashed: true`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:165`
  - **DONE WHEN:** The migration's write entry carries `unhashed: true`, as every other copy-and-own migration write in `.bkit/core/engine/install/modules/core.ts` does and as the `WriteEntry.unhashed` contract in `.bkit/core/engine/install/write.ts` requires; after `bkit install` in the trigger state, `.bkit/version` `canonicalHashes` has no `.lintstagedrc.json` key.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `install's lint-staged sample migration records no canonical hash for .lintstagedrc.json` fails on `.bkit/version` `canonicalHashes[".lintstagedrc.json"]` being set after a second `bkit install` on a consumer holding `.bkit/templates/.lintstagedrc.json`, the seeded `bkit:gate:format`, `lint-staged` in `devDependencies` and no root lint-staged config

<!-- bkit:task 4 end -->
