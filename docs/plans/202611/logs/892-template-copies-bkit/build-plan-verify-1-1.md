Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged against `build-diff-1-1.md`. The brief has no `Deviations` section. No decision records and no earlier verify or remediation reports exist for this group.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`. All 3 planned tests went red, then green. Unproven: 0. No `Updated tests` or `Already landed` sections.
- The `delete-still-referenced` gap is decided `Fixable: true`, based on one real hit. `.bkit/core/.bkit/README.md:269` (rendered to `.bkit/README.md:269`) lists the templates shipped into `.bkit/templates/` and still names `.lintstagedrc.json` and `.prettierignore` there. Every other hit names something else with the same name: the consumer-root configs in `bkit-gateguard` hooks and `gateguard-engine.js`, `checks/tips/detect.ts`, `.bkit/core/.bkit/templates.md:166` and `:341` (the copy destination), `bkit-audit-adoption.md`, `check.test.ts`, the vitest skill, plus history in `CHANGELOG.md` and `docs/audits/`.
- Task 1: the 3 new tests pass (`template-copies.integration.test.ts` x2, plus `upgrade.integration.test.ts -t "upgrade replaces the old sample config names"`). The dogfood, template-path-refs, templates-content and tips tests pass. The two example files exist and the two dotfiles are gone. The root `.lintstagedrc.json` and `.prettierignore` are unchanged. The task is still not satisfied: the existing test `holds the renamed workflows, hooks, context blocks and the slop plugin` in the same integration file now fails at line 88, and the README hit above is still open. `vitest run` over `audits/` and `install/` unit tests: 2586 passed.
- Task 2: the DONE WHEN `rg` search returns nothing, but only because rg skips the hidden `.bkit/core/.bkit/` folder. The source `.bkit/core/.bkit/templates.md` still names `.bkit/templates/.prettierignore` and `.bkit/templates/.lintstagedrc.json`. `pnpm tsx .bkit/core/engine/cli.ts check` reports `core: .bkit/templates.md` as drift (DRIFT DETECTED). The plan's UPDATE field names the mirror path, but `.agents/rules.md` § Edit source requires editing `.bkit/core/.bkit/templates.md` and re-rendering it. The `catalogue.ts`, `dist/` and `docs/testing.md` edits are correct. `.bkit/install.md` and its source hold no old-path references.
- Task 3: the result is recorded (no rename, and the oxlint sample keeps its dotfile name), but only in the mirror, so the next upgrade erases it. Same root cause as task 2.
- Derived Test Matrix: all 3 rows map to task 1's TEST FIRST tests, and all pass. The plan has no Documentation Updates section. No new error paths, so `docs/observability.md` does not apply.

## Identified Gaps Log

Gaps: 4
TASK 1: delete-still-referenced — Fixable: true
TASK 1: `.bkit/core/engine/install/template-copies.integration.test.ts` `holds the renamed workflows, hooks, context blocks and the slop plugin` fails: line 88 still expects `.prettierignore` under the templates root, a test the rename broke and did not fix — Fixable: true
TASK 2: reference updates landed in the rendered mirror `.bkit/templates.md`, not its source `.bkit/core/.bkit/templates.md` (lines 55, 56, 335 and the § lint-staged copy line still name the old samples); `bkit check` reports DRIFT on `.bkit/templates.md`, so the next `bkit upgrade` reverts them — Fixable: true
TASK 3: the oxlint result is recorded only in the rendered mirror `.bkit/templates.md`, not in its source `.bkit/core/.bkit/templates.md`, so the next `bkit upgrade` erases the record — Fixable: true
