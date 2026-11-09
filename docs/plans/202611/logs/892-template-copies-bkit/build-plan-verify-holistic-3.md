Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has two groups)

## Integration Gaps

0 gaps.

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: related, named, format`. None of the three is an open gap:
  - `format`: prettier exits on the symlink `.claude/skills/vitest` ("Explicitly specified pattern ".claude/skills/vitest" is a symbolic link."). Every other changed file is prettier-clean ("All matched files use Prettier code style!"). The owner accepted this in `build-decision-1-1.md` (`Decision: Accept — A)`), recorded as `892-template-copies-bkit-changed-format-symlink` in `docs/decisions.jsonl`. The fix `3b341024d` is still not on `origin/dev` (`git merge-base --is-ancestor` fails).
  - `related`: 1 of 3384 tests failed. `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed` failed because the wrapped node test `shell cancellation waits for SIGINT cleanup` (`scripts/ci/bkit-test-awake.test.mjs:110`) saw `''` instead of `SIGINT`. The same integration file passed in the later `named` stage of the same run, and `node --test scripts/ci/bkit-test-awake.test.mjs` passed 21 of 21 on 3 of 3 reruns.
  - `named`: 1 of 9133 tests failed (226 of 227 files passed). `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` timed out at 39.9 s while the load average was 4.3. It passed when rerun on its own.
  - The branch touches neither failing test nor its subject: `git diff --stat origin/dev...HEAD` over `scripts/`, `.bkit/core/engine/commands/workflow/`, `test-file-script.integration.test.ts` and `.husky/` is empty. Both are timing failures under load in unrelated code, so neither is logged as a gap.
- Every other stage passed: `node --test` (dependency-audit and hook-probe suites), `bats` (29 of 29), oxlint and `pnpm typecheck`. The plan's integration tests `template-copies.integration.test.ts` and `upgrade.integration.test.ts` ran and passed together in the `named` stage.
- Group 1 and group 2 work together:
  - `migrateLintStagedSample` (group 2) copies `getTemplatesRoot()/lintstagedrc.example.json`, the file group 1 created. It runs before `syncTemplateCopies` prunes the old `.bkit/templates/.lintstagedrc.json` in both install pass 3b2 (`.bkit/core/engine/install/modules/core.ts`) and `runUpgradeCommand` (`.bkit/core/engine/commands/install/upgrade.ts`).
  - `bkit upgrade` does not run `runCoreModule` (`renderManagedOutputs` runs only docs, allowlist, scripts and host renders), so the migration runs once per upgrade.
  - Once the migration writes the root `.lintstagedrc.json`, `hasLintStagedConfig` turns true, which ends the migration's trigger and silences the lint-staged tip in `.bkit/core/engine/checks/tips/catalogue.ts`. That tip names `lintstagedrc.example.json`, as do `.bkit/core/.bkit/templates.md` § Contract and § lint-staged.
  - `dist/install/template-copies.js`, `dist/install/modules/core.js` and `dist/commands/install/upgrade.js` carry the migration and both call sites.
  - `node dist/cli.js check` exits 0 with no drift.

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 4 gaps, all `Fixable: true`, closed by `build-plan-gaps-remediate-1-1-log.md`.
- `build-plan-verify-1-2.md`: PASS, tasks 1, 2, 3.
- `build-plan-verify-holistic-1.md`: FAIL, 1 gap (`Fixable: false`): the `format` stage of `bkit tests changed` trips over the `.claude/skills/vitest` symlink. The owner accepted it in `build-decision-1-1.md`.
- `build-plan-verify-holistic-2.md`: PASS, tasks 1, 2, 3 (one group at the time).
- The build challenge (`build-challenge-1.md`) then added group 2 (task 4, a migration chosen in `build-decision-1-2.md`).
- `build-plan-verify-2-1.md`: PASS, task 4. It flagged, as out of its group's scope, that the task 1 test `leaves a staged template copy unchanged under plain lint-staged` appeared to empty the worktree's `node_modules/.bin` mid-run.

## Notes

- Mode: Holistic over both groups. Judged against `tmp/bkit-diff-892-template-copies-bkit.md` and the current tree.
- Decision records: `build-decision-1-1.md` (`Decision: Accept — A)`, an owner answer, not an assumed accept) covers the `format` stage failure. `build-decision-1-2.md` (`Decision: Fix now — B, migration`) is the owner's instruction behind task 4.
- No test-first audit report was supplied as input, so step 8 has no gaps to decide. The group reports already closed the audits (`build-plan-verify-1-2.md`, `build-plan-verify-2-1.md`).
- Task 1: `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/prettierignore.example` exist, and the two dotfiles do not. `git diff origin/dev...HEAD -- .lintstagedrc.json .prettierignore` is empty. The three TEST FIRST tests and the updated dogfood, template-path-refs and templates-content tests passed in this run's gate stages.
- Task 2: the old sample paths remain only where task 4 names them on purpose: `migrateLintStagedSample` in `.bkit/core/engine/install/template-copies.ts` and `dist/install/template-copies.js`, the `docs/migrations.md` row and the task 4 tests in `upgrade.integration.test.ts`. Task 4's DONE WHEN requires that migration to detect the old `.bkit/templates/.lintstagedrc.json`, so these hits are the later owner-directed work, not stale references. Outside them and `docs/plans/**`, a `--hidden` search over `.bkit`, `docs`, the host mirrors, `.agents` and `dist` finds no old sample path. The tips tests pass.
- Task 3: the oxlint result (no rename; the sample keeps its dotfile name) is recorded in `.bkit/core/.bkit/templates.md` § Oxlint and in its rendered mirror.
- Task 4: `migrateLintStagedSample` meets every DONE WHEN condition. It runs only when the old sample exists, `scripts["bkit:gate:format"]` matches `lint-staged` and `hasLintStagedConfig` is false. It returns early in dogfood. It copies before the sync prunes and pushes the same write entry in a dry run without copying. It prints one line naming `.lintstagedrc.json`. The `docs/migrations.md` row (`up to 6.1.x`) and the `docs/decisions.jsonl` row `892-template-copies-bkit-lintstaged-root-migration` exist. Both TEST FIRST tests passed in the `named` stage.
- Derived Test Matrix: rows 1-3 are task 1's tests, which its DONE WHEN names as "the three new tests". Rows 4-5 are task 4's TEST FIRST tests. Task 4's DONE WHEN states the behaviours those two tests assert (the root copy, the dry run that writes nothing, the line naming the file) but does not name the tests. All five exist and pass.
- The plan has no `Documentation Updates` section. A failing `fs.copyFileSync` in the migration propagates, so nothing is swallowed (`docs/observability.md`).
- `build-plan-verify-2-1.md` reported that the task 1 lint-staged test emptied `node_modules/.bin` mid-run. That did not happen here: `node_modules/.modules.yaml` and `node_modules/.bin/tsx` kept their 16:22 timestamps from before the run (started 16:23), and both integration files passed in the same `named` stage.
- Out-of-scope findings carried over, already recorded as LOW deferrals by the build challenge in `docs/deferrals.jsonl`: the template-path guard no longer forbids the destination names, `GATE_CONFIG_PATTERNS` in `.bkit/core/hooks/gateguard-engine.js` match only the old basenames, and `bkit-audit-adoption.md` Step 9 (b) still diffs same-path.
- Observation from `build-plan-verify-2-1.md`, still true and not required by the DONE WHEN: in the install path the migration's write entry has no `unhashed: true`, so the consumer-owned root `.lintstagedrc.json` would get a `canonicalHashes` entry. Nothing acts on it: `.lintstagedrc.json` is not a manifest entry, so neither `bkit upgrade` nor `bkit uninstall` reads that hash.

## Identified Gaps Log

None

