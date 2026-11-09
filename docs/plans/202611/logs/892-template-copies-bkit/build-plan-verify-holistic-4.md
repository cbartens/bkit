Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has three groups)

## Integration Gaps

0 gaps.

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: format` only. That stage fails on the symlink `.claude/skills/vitest` ("Explicitly specified pattern ".claude/skills/vitest" is a symbolic link."), and every other changed file is prettier-clean ("All matched files use Prettier code style!"). The owner accepted this in `build-decision-1-1.md`, and the fix `3b341024d` is still not on `origin/dev` (`git merge-base --is-ancestor` fails). Not a gap.
- Every other stage passed: `related` (70 files, 3424 tests), `named` vitest (227 files, 9136 passed, 2 skipped), `node --test` (13 + 11 tests), `bats` (32 of 32), oxlint and `pnpm typecheck`. The run included `upgrade.integration.test.ts`, `template-copies.integration.test.ts`, `checks/tips/detect.test.ts`, `dogfood-templates.test.ts`, `template-path-refs.test.ts` and `templates-content.test.ts`. `node_modules/.bin/tsx` was intact after the run.
- Groups 1 and 3 work together:
  - Group 1 renames the samples, and `syncTemplateCopies` prunes the old `.bkit/templates/.lintstagedrc.json`. Group 3's `warnMissingLintStagedConfig` then runs after that sync in install pass 3b2 (`.bkit/core/engine/install/modules/core.ts:1900`). In upgrade, it runs from `runUpgradeAdvisories` on a real run and from `runUpgradeCommand` on a dry run (`.bkit/core/engine/commands/install/upgrade.ts:1067`). The tests assert that the line appears exactly once on each path.
  - The warning names `lintstagedrc.example.json`, the file group 1 created. The tip `ask` in `.bkit/core/engine/checks/tips/catalogue.ts` and `.bkit/core/.bkit/templates.md` § Contract and § lint-staged name the same file.
  - The warning and the "Quick tidy-up on commit" tip share `hasLintStagedConfig`. `LINT_STAGED_CONFIGS` matches lint-staged 17.6.0's `CONFIG_FILE_NAMES` name for name (16 files, plus `package.json` and `package.yaml` / `package.yml` keys).
- Group 2's migration is fully gone, as task 5 and `build-decision-1-3.md` direct. `rg --hidden` finds no `migrateLintStagedSample`, `OLD_LINT_STAGED_SAMPLE` or `upgrade copies the lint-staged sample` outside `docs/plans/**`. `git diff origin/dev...HEAD -- docs/migrations.md` is empty. `docs/decisions.jsonl` keeps the append-only migration row, and the warning row `892-template-copies-bkit-lint-staged-missing-config-warning` names the superseded key.
- `dist/install/template-copies.js`, `dist/install/modules/core.js` and `dist/commands/install/upgrade.js` carry the warning and both call sites. `template-copies.ts` imports `checks/tips/detect.ts`, which imports nothing from `install/`, so the new import adds no cycle. `node dist/cli.js check` exits 0 with no drift.

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 4 gaps, closed by `build-plan-gaps-remediate-1-1-log.md`; `build-plan-verify-1-2.md`: PASS, tasks 1, 2, 3.
- `build-plan-verify-2-1.md`: PASS, task 4.
- `build-plan-verify-3-1.md`: CONCERNS, 1 gap (`upgrade --dry-run` printed no missing lint-staged line), closed by `build-plan-gaps-remediate-3-1-log.md`; `build-plan-verify-3-2.md`: PASS, tasks 5, 6, 7.
- `build-plan-verify-holistic-1.md`: FAIL, 1 gap (`format` stage trips on the `.claude/skills/vitest` symlink), accepted by the owner in `build-decision-1-1.md`.
- `build-plan-verify-holistic-2.md`: PASS, tasks 1, 2, 3 (one group at the time).
- `build-plan-verify-holistic-3.md`: PASS, tasks 1, 2, 3, 4 (two groups at the time). The build challenge round 2 then added group 3 (tasks 5, 6, 7), and the owner's `build-decision-1-3.md` replaced the task 4 migration with a warning.

## Notes

- Mode: Holistic over all three groups. Judged against `tmp/bkit-diff-892-template-copies-bkit.md` and the current tree.
- Decision records: `build-decision-1-1.md` (`Decision: Accept — A)`, the owner's answer, not an assumed accept) covers the `format` stage failure. `build-decision-1-2.md` is the owner's instruction behind task 4. `build-decision-1-3.md` (`Decision: Fix now`, drop the migration and warn instead) is the owner's instruction behind task 5. It supersedes task 4.
- No test-first audit report was supplied as input, so step 8 has no gaps to decide. The group reports already closed each group's audit (`build-plan-verify-1-2.md`, `build-plan-verify-2-1.md`, `build-plan-verify-3-2.md`).
- Task 1: `lintstagedrc.example.json` and `prettierignore.example` exist under `.bkit/templates/`, and the two dotfiles do not. `git diff origin/dev...HEAD -- .lintstagedrc.json .prettierignore` is empty. The three new tests and the updated dogfood, template-path-refs and templates-content tests passed in this run.
- Task 2: the DONE WHEN `rg` hits only files under `docs/plans/**`, because rg's `!plans/**` glob does not exclude that nested path. A `--hidden` search over `.bkit`, `docs`, the host mirrors, `.agents` and `dist` (outside `docs/plans/**`) finds no old sample path. The task 4 hits that holistic attempt 3 allowed are gone with the migration. The tips tests pass.
- Task 3: the oxlint result (no rename) is recorded in `.bkit/core/.bkit/templates.md` § Oxlint and its rendered mirror.
- Task 4: counted as satisfied by supersession. The plan marks it "superseded by task 5 (owner, `build-decision-1-3.md`)", and task 5's DONE WHEN requires removing its migration, call sites, tests and `docs/migrations.md` row. Its literal DONE WHEN (the migration exists) no longer holds, and that is the owner-directed end state, not a gap.
- Task 5: `MISSING_LINT_STAGED_CONFIG_LINE` matches the DONE WHEN text exactly. The warning prints once on install, on upgrade and on an upgrade dry run, and writes nothing. `.bkit/templates.md` § lint-staged names the line, and the decision row names the superseded key.
- Task 6: `LINT_STAGED_CONFIGS` lists every lint-staged 17 file name, and `hasLintStagedConfig` reads `package.yaml` / `package.yml`.
- Task 7: the warning is skipped when lint-staged is not a dependency, or when the gate passes `--config` / `-c`.
- Derived Test Matrix: rows 1-3 are named in task 1's DONE WHEN ("the three new tests"). Rows 6-11 are task 5-7 TEST FIRST tests, and each exists and passed. Rows 4-5 name task 4 tests that task 5's DONE WHEN removes on the owner's direction (`build-decision-1-3.md`). Not logged as a gap, because restoring them would undo the owner's choice.
- The plan has no `Documentation Updates` section. Per `docs/observability.md`, the change adds no error path: the warning is fixed advisory text on stdout, and its wording is set by task 5's DONE WHEN.
- Out-of-scope findings carried over, already LOW deferrals in `docs/deferrals.jsonl`: the template-path guard and `GATE_CONFIG_PATTERNS` in `.bkit/core/hooks/gateguard-engine.js`, and `bkit-audit-adoption.md` Step 9 (b) same-path diff. Minor, not logged: the `package.yaml` regex `^lint-staged\s*:` misses a quoted key (`"lint-staged":`).

## Identified Gaps Log

None
