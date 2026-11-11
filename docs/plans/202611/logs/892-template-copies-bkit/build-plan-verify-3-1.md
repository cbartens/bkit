Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 7
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 5: mostly done. `migrateLintStagedSample`, both calls, the old `#892 — upgrade copies the lint-staged sample to the root` tests and the `docs/migrations.md` row are gone (`rg` finds no reference outside `docs/plans/**`). `MISSING_LINT_STAGED_CONFIG_LINE` matches the DONE WHEN text exactly, `.bkit/templates.md` § lint-staged names it, and the `docs/decisions.jsonl` row `892-template-copies-bkit-lint-staged-missing-config-warning` names the superseded key. On a scratch consumer, `upgrade --auto-apply` and `install` each print the line once and `install --dry-run` prints it once, with no root `.lintstagedrc.json` written. One part is missing: `upgrade --dry-run` prints nothing (logged gap).
- TASK 6: done. `LINT_STAGED_CONFIGS` (`.bkit/core/engine/checks/tips/detect.ts:129`) lists all 16 file names in lint-staged 17.6.0's `CONFIG_FILE_NAMES` (`node_modules/lint-staged/lib/configFiles.js`), and `hasLintStagedConfig` reads a `lint-staged` key from `package.yaml` / `package.yml`. Minor note, not logged as a gap: the regex `^lint-staged\s*:` misses a quoted YAML key (`"lint-staged":`). That form is rare in `package.yaml`.
- TASK 7: done. `warnMissingLintStagedConfig` returns early when lint-staged is not in `readDependencyNames(cwd)`, or when the gate passes `--config` / `-c` (with a space or `=`).
- Test-first audit (`build-tests-green-3-1.md`): Enforced true, 0 gaps, 0 unproven. All 6 planned tests were red before the code and green after. No tests were updated or already landed.
- Tests: 38 files and 1636 tests pass across every test file that touches the changed code: `upgrade.integration.test.ts`, `install.integration.test.ts`, `template-copies*.test.ts`, `checks/tips`, `modules/index.integration.test.ts`, `modules/core.integration.test.ts`, `render/parts.test.ts`, `audits/repo/dogfood-templates.test.ts` and `audits/templates`.
- Decision records: none of `build-decision-1-1.md` to `build-decision-1-3.md` covers the logged gap. `build-decision-1-3.md` is the owner's direction for task 5.

## Identified Gaps Log

1 gap.

TASK 5: `bkit upgrade --dry-run` never prints `bkit upgrade: no root lint-staged config — commits will fail. Fix: cp .bkit/templates/lintstagedrc.example.json .lintstagedrc.json`; DONE WHEN requires the line in a dry run too. `warnMissingLintStagedConfig` is called only from `runCoreModule` (`.bkit/core/engine/install/modules/core.ts:1900`); `runUpgradeCommand` reaches it only through `runUpgradeAdvisories`, which runs only when not a dry run (`.bkit/core/engine/commands/install/upgrade.ts:1062`). Reproduced on a scratch consumer (lint-staged devDependency, bare `pnpm lint-staged` gate, no root config): `upgrade --auto-apply` prints the line once, `upgrade --dry-run` prints nothing; `install --dry-run` prints it once. No test covers the upgrade dry run. — Fixable: true
