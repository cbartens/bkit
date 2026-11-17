Verdict: FAIL
Failures: 1
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

1 gap.

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` fails on its `format` stage only. The gate script `scripts/gate/bkit-gate-changed.mjs:96` hands every changed path to `prettier --check --ignore-unknown`. The run's `install-skills` workflow step (commit 00265bfca, outside the plan's tasks) added the symlink `.claude/skills/vitest`, and prettier exits 2 when a symlink is named explicitly. Rerunning prettier on that path alone reproduces exit 2. Rerunning it on the plan's own files gives exit 0. The other stages passed: `vitest related` unit (45 files, 2469 tests), integration (227 files, 9129 passed, 2 skipped), the named `node --test` and `bats` suites, oxlint and typecheck. The plan names neither the gate script nor the skill install, so closing the gap needs an owner choice (`Fixable: false`). The owner can let the gate script skip symlinks, drop `.claude/skills/vitest` from the branch, or accept the gap in a decision record. The pre-push `format:check` (`prettier --check .`) walks folders and does not name the symlink, so this gap is limited to `bkit tests changed`.
- Cross-task integration within the single group is consistent. The tip `ask` text in `.bkit/core/engine/checks/tips/catalogue.ts:210,250` and `dist/checks/tips/catalogue.js` matches, and both name the example files that `.bkit/core/.bkit/templates.md` § Contract lists. `bkit check` exits 0 with no drift. The dogfood test maps `lintstagedrc.example.json` and `prettierignore.example` to the root `.lintstagedrc.json` and `.prettierignore` through `copyAs`.

## Previously Attempted

- This is the first holistic attempt.
- Group 1 verification: `build-plan-verify-1-1.md` (CONCERNS, 4 gaps, all `Fixable: true`), closed by `build-plan-gaps-remediate-1-1-log.md`, then `build-plan-verify-1-2.md` (PASS, tasks 1, 2, 3).

## Notes

- Mode: Holistic over the one group. Judged against `tmp/bkit-diff-892-template-copies-bkit.md`. No `build-decision-*.md` records exist. No test-first audit report was supplied as input, so step 8 has no gaps to decide. `build-plan-verify-1-2.md` already closed the group audit's `delete-still-referenced` gap.
- Task 1: `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/prettierignore.example` exist, and the two dotfiles are gone (git records a 100% rename). `git diff origin/dev...HEAD -- .lintstagedrc.json .prettierignore` is empty. The three TEST FIRST tests, the updated dogfood, template-path-refs and templates-content tests, and `holds the renamed workflows, hooks, context blocks and the slop plugin` all ran inside the passing `vitest related` stages.
- Task 2: the DONE WHEN `rg` finds hits only under `docs/plans/**`. A `--hidden` search over `.bkit`, `docs`, `.claude`, `.cursor`, `.opencode`, `.codex`, `.agents` and `dist` finds no old sample path outside `docs/plans/**`. The tips tests pass.
- Task 3: the oxlint result (no rename) is recorded in the source `.bkit/core/.bkit/templates.md` § Oxlint and in its rendered mirror.
- Derived Test Matrix: all 3 rows sit in task 1's TEST FIRST and DONE WHEN, and all pass. The plan has no `Documentation Updates` section. The change adds no error path, so `docs/observability.md` does not apply.
- The plan file shows `[ ]` on task 1 and `[x]` on tasks 2 and 3 (uncommitted edit). This report judges all three satisfied in the codebase.
- Out-of-scope observation, not a gap: `.bkit/core/docs/templates/bkit-audit-adoption.md` Step 9 (b) says `diff .bkit/templates/<path> <path>`. That same-path wording no longer fits the two renamed samples, whose copies land at `.lintstagedrc.json` and `.prettierignore`. Step 8 already allows "the destination the Contract names", so an auditor can resolve it, but Step 9 (b) could say the same.
- The first gate run waited about 4 minutes for the machine-wide tests lock held by `feat/719-cloud-variants-add`, then ran to completion. No code was changed.

## Identified Gaps Log

Gaps: 1
INTEGRATION: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 (verdict FAIL) on its `format` stage only. `scripts/gate/bkit-gate-changed.mjs:96` passes every changed path to `prettier --check --ignore-unknown`, and the branch's workflow `install-skills` commit (00265bfca, not a plan task) added the symlink `.claude/skills/vitest`; prettier exits 2 on "Explicitly specified pattern ".claude/skills/vitest" is a symbolic link." Every file tasks 1-3 touched is prettier-clean, and every test stage passed. Closing it needs a choice the plan does not make: change the repo gate script to skip symlinks, drop the vitest skill symlink from the branch, or accept the gap — Fixable: false
