## Session Prompt — this run's, newer than everything below

/bkit-ship #892

## Issue description — oldest

### Failing test or CI run

none yet

### What happened

After `bkit upgrade` refreshes the reference copies under `.bkit/templates/`, they cannot be committed in a consumer repo. The pre-commit hook (`pnpm bkit:gate:format` → `lint-staged`) reformats them back to their old shape, so:

- the commit ends with `✖ Prevented an empty git commit!` (or silently drops the template changes when committed as `git commit -- <paths>`), and
- the pre-push hook then fails with `[bkit-check] check: 17 write(s) would occur — DRIFT DETECTED`, so nothing can be pushed.

Cause: bkit ships sample configs inside the consumer repo at `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore`. lint-staged auto-discovers the nested `.lintstagedrc.json` as a real config for the files under `.bkit/templates/` and runs `prettier --write` from that directory. From there, prettier does not apply the root `.prettierignore` (which does list `.bkit/templates/`), so it formats the copies:

```
root:          prettier --file-info .bkit/templates/scripts/ci/bkit-test-awake.mjs → {"ignored":true}
cwd templates: prettier --file-info scripts/ci/bkit-test-awake.mjs               → {"ignored":false,"inferredParser":"babel"}
```

### What should happen

Template copies refreshed by `bkit upgrade` commit byte-for-byte as shipped, and `bkit check` reports no drift afterwards. The sample configs under `.bkit/templates/` must not act as live configs for the consumer repo.

### Steps to reproduce

1. Consumer repo with the adopted `.husky/pre-commit` template, `bkit:gate:format` = `pnpm lint-staged`, and the root `.prettierignore` listing `.bkit/templates/`.
2. Have several `.bkit/templates/scripts/**` copies differ from the shipped 6.1.1 versions, and run `bkit upgrade`.
3. `git add .bkit/templates/scripts && git commit -m test`.
4. lint-staged logs `.bkit/templates/.lintstagedrc.json — 17 files`, runs prettier, and prevents an empty commit. `bkit check` still shows drift.

Verified workaround: `lint-staged --config .lintstagedrc.json` (an explicit config disables nested discovery). With it, all 17 files stay staged unchanged.

### How often

Every time, on any upgrade that changes template copies prettier would reformat.

### Affected area

- `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` (shipped sample configs)
- the seeded `scripts.bkit:gate:format` default (`pnpm lint-staged`)
- `.bkit/templates/.husky/pre-commit`

### Where and when

bkit 6.1.1, lint-staged 17.6.0, prettier 3.9.10, macOS. Seen in `bartens-biz/app-voxlocal-io` on 2026-11-08. `app-gether-life` has the identical setup and the same prettier behaviour. It only escaped so far because its 6.1.1 upgrade changed a single, formatter-stable template script.

### Evidence

Reproduced in a throwaway clone: copying the shipped `.bkit/templates/scripts/` over the repo's copies and running `lint-staged` gives 0 staged files afterwards. With `lint-staged --config .lintstagedrc.json`, 17 remain staged.

Possible fixes, for whoever picks this up: ship the samples under names lint-staged and prettier do not discover (for example `lintstagedrc.example.json`), or seed `bkit:gate:format` with an explicit `--config`.

### References

- lint-staged docs on how it discovers config files in subfolders ("How to use lint-staged in a multi-package monorepo?")

## Issue comment — posted 2026-11-08T12:14:21.000Z

Verified: the bug is real and the cause in the report is right.

Reproduced in a throwaway consumer-style repo with bkit's own lint-staged 17.6.0 and prettier 3.9.10. The setup was a root `.lintstagedrc.json`, a root `.prettierignore` listing `.bkit/templates/`, and the shipped `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore`.

- `prettier --file-info` on a template script gives `ignored: true` from the repo root and `ignored: false` from inside `.bkit/templates/`. Prettier only reads the `.prettierignore` in the folder it runs from, and the shipped sample one does not list `scripts/`.
- A staged, unformatted `.bkit/templates/scripts/ci/x.mjs` got reformatted on commit. lint-staged logged `.bkit/templates/.lintstagedrc.json — 1 file`, so it picked the nested sample config as the live one for that folder.
- With `lint-staged --config .lintstagedrc.json` the same file stayed staged byte-for-byte. The workaround holds.
- `app-gether-life` has the same setup: both sample files under `.bkit/templates/`, `.bkit/templates/` in the root `.prettierignore`, and `bkit:gate:format` = `pnpm lint-staged`.

Not reproduced here: the `bkit check` drift count on pre-push. It follows directly from the reformatted copies, but I did not run it.

The bkit repo itself does not hit this. Here `.bkit/templates/` is the source and is meant to be formatted, and the two lint-staged configs are identical.

Things a fix has to cover:
- Seeded default: `.bkit/core/engine/install/manifest.ts:242` (`"bkit:gate:format": "pnpm lint-staged"`).
- Renaming the sample files means updating the references that name the current path: `.bkit/templates.md:57` and `:343`, the tip at `.bkit/core/engine/checks/tips/catalogue.ts:250`, and the dogfood entries in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`.
- Existing consumers keep the script they already have, so changing the seeded default alone will not fix them. That needs a migration registered in `docs/migrations.md`.

## Issue comment — posted 2026-11-08T12:23:46.000Z

Fix chosen: rename the two sample files so lint-staged and prettier stop treating them as live configs. Next step is `/bkit-build`, not debug: the cause is already proven, so there is nothing left to diagnose.

**The fix**

- Rename `.bkit/templates/.lintstagedrc.json` → `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/.prettierignore` → `.bkit/templates/prettierignore.example`. Neither tool looks for files under those names, so the copies under `.bkit/templates/` get formatted (or left alone) by the root config only.
- Seeding `bkit:gate:format` with `--config .lintstagedrc.json` on its own is not enough. It only protects that one script: anyone who runs `lint-staged` without the flag hits the bug again, and prettier still skips the root `.prettierignore` whenever it runs from inside `.bkit/templates/`.

**What the fix has to cover**

- The references to the old names: `.bkit/core/engine/install/manifest.ts:242` (check that the seeded default still fits), `.bkit/templates.md:57` and `:343`, the tip at `.bkit/core/engine/checks/tips/catalogue.ts:250`, and the dogfood pairs in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`. In the bkit repo the root `.lintstagedrc.json` and `.prettierignore` keep their names; only the template side is renamed.
- A migration for existing consumers. `bkit upgrade` does not delete template files bkit no longer ships, so after the rename a consumer would still have the old `.bkit/templates/.lintstagedrc.json` and still hit the bug. The migration deletes the old sample only when it is byte-identical to a shipped version. An edited copy is left in place, with a warning naming the manual delete. Register it in `docs/migrations.md` and test it in `core.integration.test.ts` and `upgrade.integration.test.ts`, the same as the other template migrations.
- A test that proves the original failure is gone: a staged, unformatted file under `.bkit/templates/scripts/` commits unchanged with the plain `pnpm lint-staged` script.

**Worth one check during the build (not verified)**

`.bkit/templates/.oxlintrc.json` may be the same kind of trap, because oxlint can also pick up config files in subfolders. bkit's own scripts pass `-c .oxlintrc.json`, which should rule that out, but nobody has checked what consumers' seeded lint scripts run. If it is the same trap, rename it in the same change.

## Issue comment — posted 2026-11-08T12:54:48.000Z

Finding: in `app-voxlocal-io` the template copies were already wrong when bkit was installed, before any upgrade. The upgrade only brought the damage to light.

**Evidence**

- `aaeb4d1` "chore(bkit-install): add bkit v6.1.1 tooling and agent config" committed the template copies. The same commit added `.husky/pre-commit`, the root `.prettierignore`, and `bkit:gate:format` = `pnpm lint-staged`.
- In that commit the copies already differ from bkit `v6.1.1`. `bkit-test-awake.mjs`, `bkit-secrets.mjs` and `bkit-serena.mcp.json` all differ. In `bkit-serena.mcp.json` the one-line `args` array was split over five lines, which is prettier's output.
- Install and upgrade were the same version, 6.1.1. The refresh in `a64a508` therefore brought in no newer files. It restored the shipped bytes the install commit had replaced, all 17 files at once.

**What this changes in the report**

- The bug starts at the first commit that touches `.bkit/templates/`. On a fresh install, that is the install commit itself. That commit fails silently: the reformatted files are not empty, so the commit succeeds and nobody notices.
- The visible failure (the "empty commit" message, then drift on pre-push) comes later, when an upgrade tries to restore the shipped bytes.
- "How often" is wider than "any upgrade that changes template copies". It is every fresh install where the pre-commit hook runs.

**What it does not change**

- The chosen fix, renaming the two sample files, covers the install case too. So does the planned test: a staged, unformatted file under `.bkit/templates/scripts/` commits unchanged.
- The migration rule still works for fresh installs. In `aaeb4d1`, `.bkit/templates/.lintstagedrc.json`, `.prettierignore` and `.oxlintrc.json` are byte-identical to bkit `v6.1.1`. The migration can therefore delete the old samples cleanly instead of warning.
- Consumers who installed 6.1.1 and have not upgraded yet already carry reformatted copies. Their first upgrade after the fix restores the copies, and that commit goes through because the nested config is gone.

Not checked: other consumer repos besides `app-voxlocal-io`. `bkit check` was not run on the install commit.

## Issue comment — posted 2026-11-09T06:48:50.000Z

Let me check two facts before answering. Both decide whether the migration was ever needed.

**Short answer:** you're not stuck in a workflow loop, and #892 still makes sense. The core fix is done. But the extra migration I recommended is creating a design loop, and I'd take it back out. My pick is **Fix now, with the direction "drop the migration, warn instead"**.

**No workflow loop.** Challenge rounds are capped at 2 and round 2 is finished, so nothing new can be found from here. What's left is fixed: decide task 5, build tasks 5-7, verify, run the tests, then write the summary and open the PR.

**#892 itself is sound.** The rename to `lintstagedrc.example.json` and `prettierignore.example` is in, the holistic verify passed, the security review was clean, and `bkit check` shows no drift. That was the whole point of the issue, and it works.

**The migration is where it went wrong, and that's on me.** The break it was meant to fix is real but narrow. I checked both facts:
- lint-staged 17.6.0 fails every commit with "Configuration could not be found" when it finds no config.
- The consumer hook runs `pnpm bkit:gate:format`.

So it affects a consumer who copied the husky hook and installed lint-staged but never copied a root `.lintstagedrc.json`. Until now their hook quietly formatted nothing outside `.bkit/templates/`.

My migration fixes that by writing the sample to their root, which creates two new problems:
- **Commits break if pieces are missing.** The sample runs `scripts/prettier/bkit-insert-ignore.mjs` and prettier. If either is missing, every commit fails. That's task 5.
- **Commits that do work behave differently.** Their hook goes from doing nothing at the root to reformatting every file they stage. Writing a live config into someone's repo without being asked is a real behaviour change.

Fixing the first problem means guarding the copy: check that lint-staged, prettier and the helper script are all there, and also detect the `.ts`/`.mts`/`.cts` and `package.yaml` config names. That's tasks 6 and 7, plus more combinations to test. It's the snowball you noticed.

**What "drop the migration, warn instead" means:**
- **Remove task 4's work:** `migrateLintStagedSample`, its two calls, the two upgrade tests and the `docs/migrations.md` row. Then record the reversal in `docs/decisions.jsonl`.
- **Add a warning line** to `bkit upgrade` when the format gate runs lint-staged and there's no root config. The line names the fix: `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`. The existing `lint-staged` tip already says the same thing.
- **Task 7 goes away**, because it only concerned when the migration fires.
- **Task 6 stays.** It's a small fix that stops the warning and tip firing for repos that use a `.ts` config.

**The cost:** in that narrow group, commits fail after the upgrade until they run that one `cp`. They get told exactly how, and nothing is written into their repo that they didn't choose.

This reverses your "B, migration" answer from decision 2, so it's your call. I won't record anything until you answer.

**My pick: Fix now, and drop the migration.** The workflow isn't looping, and the core #892 fix is done. The problem is the migration I recommended at decision 2, which keeps creating new problems.

**No workflow loop.** Challenge rounds stop at 2 and both have run, so nothing new gets added from here. What's left is: decide task 5, build tasks 5-7, verify them, run the tests, then write the summary and open the PR.

**#892 still makes sense, and its main fix is done.** The rename to `lintstagedrc.example.json` and `prettierignore.example` passed the full verify and the security review, and `bkit check` shows no drift.

**The migration fixes a real problem, but a narrow one.** I confirmed that lint-staged 17.6.0 fails every commit with "Configuration could not be found" when it finds no config file. I also confirmed that the consumer pre-commit hook runs `pnpm bkit:gate:format`, which runs lint-staged. So repos that installed lint-staged but never copied a root `.lintstagedrc.json` lose their commits after the upgrade.

My migration copies the sample to their root, and that causes two new problems:
- **Commits can fail.** The sample runs `scripts/prettier/bkit-insert-ignore.mjs` and prettier. If either one is missing from their repo, every commit fails. That's task 5.
- **Commits behave differently.** Today their hook doesn't touch files outside `.bkit/templates/`. After the copy, it reformats every file they stage, which they never asked for.

Guarding the copy against those cases is what tasks 6 and 7 are, plus more cases to test. That's the snowball.

**"Drop it" means:**
- **Undo task 4:** remove `migrateLintStagedSample`, its two calls, the two upgrade tests and the `docs/migrations.md` row, and record the reversal in `docs/decisions.jsonl`.
- **Warn instead:** `bkit upgrade` prints a line with `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`. The existing `lint-staged` tip already says the same thing.
- **Task 7 goes away**, because it only decided when the migration should run.
- **Task 6 stays.** It's a small fix so the warning doesn't fire for repos that use a `.ts` lint-staged config.

**The cost:** those few repos can't commit after the upgrade until they run that one `cp` command. They're told exactly what to run, and bkit writes nothing into their repo that they didn't choose.

This reverses your "B, migration" answer, so I haven't recorded anything yet.

## Plan — docs/plans/202611/892-template-copies-bkit-plan.md — last committed 2026-11-09T07:52:57.000Z

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
| upgrade writes no root lint-staged config for a consumer that relied on the nested sample | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 5 |
| upgrade names the missing root lint-staged config with the copy command | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 5 |
| hasLintStagedConfig is true for every config name lint-staged 17 reads | Unit | `.bkit/core/engine/checks/tips/detect.test.ts` | 6 |
| upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 6 |
| upgrade prints no missing lint-staged config line when lint-staged is not a dependency | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |

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

- [x] **TASK 4:** A consumer with lint-staged installed and no root lint-staged config upgrades, the sync deletes `.bkit/templates/.lintstagedrc.json` (the only config lint-staged found), and every later commit fails in pre-commit with "Configuration could not be found" — superseded by task 5 (owner, `build-decision-1-3.md`)
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:81` · **Round:** 1
  - **DONE WHEN:** The owner chose a migration (`build-decision-1-2.md`). On install / upgrade, when the consumer holds the old `.bkit/templates/.lintstagedrc.json` (the config lint-staged found until the rename), `package.json` `scripts["bkit:gate:format"]` runs `lint-staged`, and `hasLintStagedConfig(cwd)` (`.bkit/core/engine/checks/tips/detect.ts`) is false, the migration writes `.lintstagedrc.json` at the repo root with the bytes of the shipped `lintstagedrc.example.json`, before `syncTemplateCopies` prunes the old sample. It is idempotent, runs inside the normal install / upgrade write path, computes the same writeset in a dry run without writing, prints one line naming the copied file, and never touches a repo that already has any lint-staged config (`hasLintStagedConfig` true) or whose format gate does not run lint-staged. One row is added to `docs/migrations.md` § Migrations (release range up to 6.1.x) in the same change, and one `docs/decisions.jsonl` row records the owner's choice.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config` fails on no `.lintstagedrc.json` at the consumer root after upgrading a consumer that holds the old `.bkit/templates/.lintstagedrc.json`, has `bkit:gate:format` = `pnpm lint-staged` and no root lint-staged config; it also asserts the copied bytes equal `.bkit/templates/lintstagedrc.example.json` and that the upgrade output names `.lintstagedrc.json`
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run reports the lint-staged config copy without writing it` fails on the dry-run output naming no `.lintstagedrc.json` write for the same consumer; it also asserts no `.lintstagedrc.json` exists at the root afterwards

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 2 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** A consumer that commits through husky + lint-staged, relied on the nested sample and never copied `scripts/prettier/bkit-insert-ignore.mjs`, upgrades; the migration's root `.lintstagedrc.json` now claims every staged file, so the next bkit workflow commit that stages `docs/plans/**/*.md` runs `node scripts/prettier/bkit-insert-ignore.mjs`, which does not exist, and the pre-commit hook fails every such commit
      **Severity:** HIGH · **Class:** architectural · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:164` · **Round:** 2
  - **DONE WHEN:** The owner chose Fix now with the direction in `build-decision-1-3.md`. bkit writes no lint-staged config into a consumer repo: `migrateLintStagedSample`, its calls in `runCoreModule` (`.bkit/core/engine/install/modules/core.ts`) and `runUpgradeCommand` (`.bkit/core/engine/commands/install/upgrade.ts`), the `#892 — upgrade copies the lint-staged sample to the root` tests and the `Lint-staged sample copied to the root` row in `docs/migrations.md` are removed. In their place install and upgrade print exactly one line, `bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, when `package.json` `scripts["bkit:gate:format"]` runs `lint-staged` without a `--config` / `-c` path, `readDependencyNames(cwd)` (`.bkit/core/engine/shared/package-json.ts`) includes `lint-staged`, and `hasLintStagedConfig(cwd)` (`.bkit/core/engine/checks/tips/detect.ts`) is false; the line is printed in a dry run too and writes nothing. `.bkit/templates.md` § lint-staged names the line. One `docs/decisions.jsonl` row, appended with `bkit ledgers append`, records that the warning replaces the migration and names the superseded key `892-template-copies-bkit-lintstaged-root-migration`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged config for a consumer that relied on the nested sample` fails on `.lintstagedrc.json` existing at the consumer root after upgrading a consumer that holds the old `.bkit/templates/.lintstagedrc.json`, has `bkit:gate:format` = `pnpm lint-staged`, `devDependencies` `lint-staged` and no root lint-staged config
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade names the missing root lint-staged config with the copy command` fails on the upgrade output for the same consumer not containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** A consumer whose own commit config is `lint-staged.config.ts` (or `.lintstagedrc.ts` / `.mts` / `.cts`, `lint-staged.config.mts` / `.cts`, or a `lint-staged` key in `package.yaml`) upgrades; `hasLintStagedConfig` does not know those names, so the migration writes `.lintstagedrc.json` beside it, and lint-staged, which sorts same-folder configs alphabetically and gives each folder to the first, silently runs bkit's sample instead of the consumer's own tasks
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:162` · **Round:** 2
  - **DONE WHEN:** `LINT_STAGED_CONFIGS` in `.bkit/core/engine/checks/tips/detect.ts:129` lists every name in lint-staged 17's `CONFIG_FILE_NAMES` (`node_modules/lint-staged/lib/configFiles.js`), including the `.ts` / `.mts` / `.cts` forms, and `hasLintStagedConfig` also reads a `lint-staged` key from `package.yaml` / `package.yml`; the task 5 upgrade line is then never printed for a repo that already has any lint-staged config.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/detect.test.ts` `hasLintStagedConfig is true for every config name lint-staged 17 reads` fails on `lint-staged.config.ts`, `.lintstagedrc.ts`, `.lintstagedrc.mts`, `.lintstagedrc.cts`, `lint-staged.config.mts`, `lint-staged.config.cts` and a `package.yaml` `lint-staged` key each returning false
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, after upgrading the task 5 consumer plus a root `lint-staged.config.ts`

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** Every consumer that never adopted lint-staged gets an unrequested `.lintstagedrc.json` at its root on upgrade, and the "Quick tidy-up on commit" tip stops firing, because install seeds `bkit:gate:format` = `pnpm lint-staged` into every consumer, so the migration's gate check is true for all of them and nothing checks that lint-staged is installed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/template-copies.ts:161` · **Round:** 2
  - **DONE WHEN:** The task 5 upgrade line is not printed, and no root `.lintstagedrc.json` is written, when lint-staged is not in `readDependencyNames(cwd)`, or when the format gate passes lint-staged an explicit `--config` / `-c` path (lint-staged then reads only that file).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when lint-staged is not a dependency` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, after upgrading the task 5 consumer with no `lint-staged` in any dependency field
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path` fails on `.lintstagedrc.json` existing at the root, or on the upgrade output containing `cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`, when `bkit:gate:format` is `pnpm lint-staged --config tools/lint-staged.json`

<!-- bkit:task 7 end -->
<!-- bkit:group 3 end -->
