Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group)

## Integration Gaps

0 gaps.

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: named, format`. Neither failure is an open gap:
  - `format`: prettier exits 2 on the symlink `.claude/skills/vitest` ("Explicitly specified pattern ".claude/skills/vitest" is a symbolic link."), the same failure holistic attempt 1 logged. The owner accepted it in `build-decision-1-1.md` (`Decision: Accept — A)`), recorded as `892-template-copies-bkit-changed-format-symlink` in `docs/decisions.jsonl`. The fix `3b341024d` is still not on `origin/dev` (`git merge-base --is-ancestor` fails), so the failure is expected. Every file the plan's tasks touched is prettier-clean ("All matched files use Prettier code style!").
  - `named`: 1 failure out of 9131 tests (226 of 227 files passed). `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` `branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock` failed in its `afterEach` cleanup at line 91 (`fs.rmSync(tmp, ...)` raised `ENOTEMPTY` right after `SIGKILL` to the child processes). The branch does not touch the test, `commands/workflow/`, `scripts/` or `.husky/` (`git diff --stat origin/dev...HEAD` over those paths is empty), and the file passed 3 of 3 reruns on its own (2 of 2 tests each time). It passed in holistic attempt 1 on the same code. This is a cleanup race in an unrelated test, not a failure this change causes, so it is not logged as a gap.
- Every other stage passed: `vitest related` (45 files, 2469 tests), the named `node --test` suites (37 tests) and `bats` (29 tests), oxlint and `pnpm typecheck`.
- Cross-task integration within the single group is consistent. The tip `ask` text in `.bkit/core/engine/checks/tips/catalogue.ts:210,250` and `dist/checks/tips/catalogue.js` names `prettierignore.example` and `lintstagedrc.example.json`. The same names appear in `.bkit/core/.bkit/templates.md` § Contract and § lint-staged, and in `.bkit/core/.bkit/README.md:269`. The dogfood test maps both samples to the root `.lintstagedrc.json` and `.prettierignore` through `copyAs`. `pnpm tsx .bkit/core/engine/cli.ts check` exits 0 with no drift.

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 4 gaps, all `Fixable: true`, closed by `build-plan-gaps-remediate-1-1-log.md`.
- `build-plan-verify-1-2.md`: PASS, tasks 1, 2, 3.
- `build-plan-verify-holistic-1.md`: FAIL, 1 gap (`Fixable: false`) on the `format` stage tripping over the `.claude/skills/vitest` symlink. The owner accepted it in `build-decision-1-1.md`.
- No code changed between holistic attempt 1 and this attempt. Commits `972006a63` and `db1af0e8a` touch only the plan checkboxes, run logs, `docs/decisions.jsonl` and `.bkit/friction.jsonl`.

## Notes

- Mode: Holistic over the one group. Judged against `tmp/bkit-diff-892-template-copies-bkit.md` and the current tree.
- Decision record: `build-decision-1-1.md` (`Decision: Accept — A)`, an owner answer, not an assumed accept) covers the `format` stage failure on `.claude/skills/vitest`.
- No test-first audit report was supplied as input, so step 8 has no gaps to decide. `build-plan-verify-1-2.md` already closed the group audit's `delete-still-referenced` gap.
- Task 1: `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/prettierignore.example` exist, and the two dotfiles are gone (git records a 100% rename). `git diff origin/dev...HEAD -- .lintstagedrc.json .prettierignore` is empty. The three TEST FIRST tests and the updated dogfood, template-path-refs and templates-content tests ran in the passing `vitest related` and integration stages.
- Task 2: the DONE WHEN `rg` finds hits only under `docs/plans/**` (run logs and history). A `--hidden` search over `.bkit`, `docs`, `.claude`, `.cursor`, `.opencode`, `.codex`, `.agents` and `dist` finds no old sample path outside `docs/plans/**`. The tips tests pass.
- Task 3: the oxlint result (no rename; the sample keeps its dotfile name) is recorded in `.bkit/core/.bkit/templates.md` § Oxlint and in its rendered mirror.
- Derived Test Matrix: all 3 rows are in task 1's TEST FIRST and DONE WHEN, and all pass. The plan has no `Documentation Updates` section. The change adds no error path, so `docs/observability.md` does not apply.
- Out-of-scope finding, proposed separately: `branches-lock.integration.test.ts:89-92` deletes the temp folder right after `SIGKILL` to its child processes, without waiting for them to exit. A child that is still writing can make `rmSync` fail with `ENOTEMPTY`. No ledger row records this flake.
- Out-of-scope finding carried over from holistic attempt 1: `.bkit/core/docs/templates/bkit-audit-adoption.md` Step 9 (b) still says `diff .bkit/templates/<path> <path>`, which does not fit the two renamed samples.
- The gate run waited about 2 minutes for the machine-wide tests lock, held by `feat/719-cloud-variants-add`, then ran to completion. No code was changed.

## Identified Gaps Log

None
