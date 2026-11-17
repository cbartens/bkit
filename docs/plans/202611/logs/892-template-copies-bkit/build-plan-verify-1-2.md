Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
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

- `docs/plans/202611/logs/892-template-copies-bkit/build-plan-verify-1-1.md`: CONCERNS, 4 gaps, all `Fixable: true`.
- `docs/plans/202611/logs/892-template-copies-bkit/build-plan-gaps-remediate-1-1-log.md`: all 4 gaps reported DONE. Each is re-checked below and closed.

## Notes

- Mode: Group. Judged against `build-diff-1-2.md` (the group diff since group start). The brief has no `Deviations` section. No `build-decision-*.md` records exist.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`. All 3 planned tests went red, then green. Unproven: 0. No `Updated tests`, `Already landed` or `Unproven` sections.
- `delete-still-referenced` (`Fixable: null`): no gap. The one real hit from attempt 1, the sample list in `.bkit/core/.bkit/README.md:269` and its mirror `.bkit/README.md:269`, now names `lintstagedrc.example.json` and `prettierignore.example`. The listed hits are all something else with the same name. `.agents/plugins/bkit/hooks/bkit-gateguard.cjs:74,78` are anchored regexes for the consumer-root configs. `.bkit/core/.bkit/templates.md:166` and `:341` name the consumer-root `.lintstagedrc.json`. `:343` deliberately names the old sample names to say `bkit upgrade` removes them. The vitest skill is an unrelated third-party reference. Other hits are history in `CHANGELOG.md`, `docs/audits/` and `docs/plans/**` logs.
- Task 1: `lintstagedrc.example.json` and `prettierignore.example` exist under `.bkit/templates/`, and the two dotfiles do not. The root `.lintstagedrc.json` and `.prettierignore` are unchanged against the merge base with `origin/dev`. `vitest run` over `template-copies.integration.test.ts`, `dogfood-templates.test.ts`, `template-path-refs.test.ts`, `templates-content.test.ts` and `checks/tips`: 7 files, 356 tests passed. This includes `holds the renamed workflows, hooks, context blocks and the slop plugin`, which failed in attempt 1 and is now fixed at line 88. `upgrade.integration.test.ts -t "upgrade replaces the old sample config names"`: 1 passed.
- Task 2: the source `.bkit/core/.bkit/templates.md` now carries the reference updates, and lines 330-400 match the mirror `.bkit/templates.md`. `pnpm tsx .bkit/core/engine/cli.ts check` exits 0 with no drift. The DONE WHEN `rg` search returns nothing outside `docs/plans/**`; that glob does not exclude `docs/plans` in rg, so the plan and its logs still show up. A `--hidden` search over `.bkit`, `docs`, the host mirrors, `.agents` and `dist` also finds no old sample path outside `docs/plans/**`. The edits to `catalogue.ts`, `dist/checks/tips/catalogue.js` and `docs/testing.md:785` are in place, and the tips tests pass.
- Task 3: the oxlint result (no rename; the sample keeps its dotfile name) is recorded in the source `.bkit/core/.bkit/templates.md` § Oxlint and rendered to the mirror.
- Derived Test Matrix: all 3 rows map to task 1's TEST FIRST tests, and all 3 pass. The plan has no Documentation Updates section. No new error paths, so `docs/observability.md` does not apply.
- On the first test run, another worktree's push run (`feat/719-cloud-variants-add`) held the machine-wide tests lock. The rerun used `LOCAL_STACK_LOCK_WAIT_S=560` and passed. No code was changed.

## Identified Gaps Log

None
