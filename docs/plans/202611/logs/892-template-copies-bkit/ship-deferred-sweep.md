Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md` (last committed 2026-11-09T07:52:57Z). The plan has no `Acceptance Scenario` sections, so the intended deliverables are its `DONE WHEN` lines (tasks 1-7). The issue's "What should happen" (copies commit byte-for-byte, `bkit check` clean afterwards) is covered by task 1. Tests were re-run in this sweep: `pnpm exec vitest run` over `template-copies.integration.test.ts`, `upgrade.integration.test.ts`, `checks/tips/detect.test.ts`, `checks/tips/`, `dogfood-templates.test.ts`, `template-path-refs.test.ts`, `templates-content.test.ts` gave 8 files passed, 431 tests passed. No `.skip` / `.todo` / `.only` in the three new-test files.

- **Task 1: renamed samples exist, old dotfiles do not.** `Delivered`. Where: plan task 1 `DONE WHEN`. `.bkit/templates/lintstagedrc.example.json` and `.bkit/templates/prettierignore.example` exist. `.bkit/templates/.lintstagedrc.json` and `.bkit/templates/.prettierignore` are absent (`ls -la .bkit/templates/`).
- **Task 1: root `.lintstagedrc.json` and `.prettierignore` unchanged.** `Delivered`. `git diff --stat origin/dev...HEAD -- .lintstagedrc.json .prettierignore` is empty.
- **Task 1: the three new tests plus the updated dogfood, template-path-refs and templates-content tests pass.** `Delivered`. `.bkit/core/engine/install/template-copies.integration.test.ts:239` `leaves a staged template copy unchanged under plain lint-staged` (runs real `pnpm lint-staged`, asserts the staged bytes are unchanged, `:285-286`). `:224` `ships the sample configs under non-discoverable names`. `.bkit/core/engine/commands/install/upgrade.integration.test.ts:2371` `upgrade replaces the old sample config names` (asserts the old names are gone, the new names exist and `check` exits 0). All passed in this sweep's run. `node dist/cli.js check` in the worktree: exit 0, "0 write(s) would occur".
- **Task 2: no old sample path left outside generated mirrors; tips tests pass.** `Delivered`. `rg -n --hidden "templates/\.(lintstagedrc|prettierignore)" .bkit docs .claude .cursor .opencode .codex .agents dist --glob '!*.jsonl' --glob '!docs/plans/**'` returns nothing. New names: `.bkit/core/.bkit/templates.md:56-57`, `:340`, `:348`, mirror `.bkit/templates.md` same lines, `.bkit/core/engine/checks/tips/catalogue.ts:243` and `:283`, `docs/testing.md:787`. `checks/tips/` tests passed.
- **Task 3: oxlint check recorded, no rename needed.** `Delivered`. `.bkit/core/.bkit/templates.md:401` records that `oxlint -c .oxlintrc.json` from a consumer root reports nothing for a violating file under `.bkit/templates/`. The sample keeps its name (`.bkit/templates/.oxlintrc.json` exists).
- **Task 4: migration copies the lint-staged sample to the root.** `Exempt`, not judged as a deliverable: the plan itself marks it "superseded by task 5 (owner, `build-decision-1-3.md`)", and task 5's `DONE WHEN` requires removing it. See `Exempt Deferrals`.
- **Task 5: migration removed, one-line warning in its place.** `Delivered`. `rg --hidden "migrateLintStagedSample|OLD_LINT_STAGED_SAMPLE|upgrade copies the lint-staged sample"` outside `docs/plans/**` and `node_modules/` gives no hits. `git diff origin/dev...HEAD -- docs/migrations.md` is empty. `MISSING_LINT_STAGED_CONFIG_LINE` at `.bkit/core/engine/install/template-copies.ts:142-143` matches the `DONE WHEN` text exactly. Printed by `warnMissingLintStagedConfig` (`template-copies.ts:157-164`) from install pass 3b2 (`.bkit/core/engine/install/modules/core.ts:1900`, which also runs inside `runUpgradeAdvisories`) and on an upgrade dry run (`.bkit/core/engine/commands/install/upgrade.ts:1067`). It writes nothing. `dist/install/template-copies.js:125`, `dist/install/modules/core.js:1705` and `dist/commands/install/upgrade.js:798` carry the built code. `.bkit/core/.bkit/templates.md:348` names the line. `docs/decisions.jsonl:669` key `892-template-copies-bkit-lint-staged-missing-config-warning` references the superseded key `892-template-copies-bkit-lintstaged-root-migration`. Tests `upgrade.integration.test.ts:2451` and `:2460` passed.
- **Task 6: every lint-staged 17 config name is recognised.** `Delivered`. `LINT_STAGED_CONFIGS` (`.bkit/core/engine/checks/tips/detect.ts:129-146`) lists all 16 file names in `node_modules/lint-staged/lib/configFiles.js` `CONFIG_FILE_NAMES`. `hasLintStagedConfig` (`detect.ts:159-165`) also reads `package.yaml` / `package.yml` and the `package.json` key. Tests `detect.test.ts:132` and `upgrade.integration.test.ts:2482` passed.
- **Task 7: no warning when lint-staged is not a dependency, or when the gate passes `--config` / `-c`.** `Delivered`. `warnMissingLintStagedConfig` returns early on `readDependencyNames(cwd)` lacking `lint-staged` (`template-copies.ts:160`) and on a `--config` / `-c` flag (`formatGateRunsBareLintStaged`, `template-copies.ts:146-152`). Tests `upgrade.integration.test.ts:2494` and `:2504` passed.

## Blocking Deferrals

None

## Test Coverage Review

None. `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` exited 0 and returned a complete result: `found: false`, `paths: []`, `disabled: []`. Cross-check: `git diff origin/dev...HEAD -- '*.test.ts' '*.test.mjs' '*.bats'` has no removed `expect` / `assert` line. The task 4 migration tests were added and removed inside this branch, so they never reach the `origin/dev` diff; their removal is the owner's direction (`build-decision-1-3.md`, plan task 5 `DONE WHEN`).

## Exempt Deferrals

- **Plan task 4 and Derived Test Matrix rows 4-5 (migration that copies the lint-staged sample to the root).** Leaves uncovered: no root `.lintstagedrc.json` is written for a consumer whose only lint-staged config was the nested sample. Install and upgrade print the task 5 fix line instead. Where: `docs/plans/202611/892-template-copies-bkit-plan.md` task 4 heading, "superseded by task 5 (owner, `build-decision-1-3.md`)". When: owner answer 2026-11-09T06:49:10Z (`status.jsonl` `owner-answer`), decision step 2026-11-09T06:50:25Z. Why: the owner chose "drop the migration, warn instead" (`docs/decisions.jsonl:669`, key `892-template-copies-bkit-lint-staged-missing-config-warning`, superseding `892-template-copies-bkit-lintstaged-root-migration`). Reason: owner decision recorded in the plan; no deferral row.
- **`892-template-copies-bkit-challenge-low-bkit-core-engine-audits-templates-template-path-refs-test-ts-61`.** Leaves uncovered: the template-path guard no longer forbids a workflow or prompt from naming the destination paths `.prettierignore` / `.lintstagedrc.json`. Where: `docs/deferrals.jsonl:229`, written by `build-challenge` round 1 (2026-11-08). Reason: `low-severity`. Triage: `bucket: Exempt`, tests not applied.
- **`892-template-copies-bkit-challenge-low-bkit-core-hooks-gateguard-engine-js-18`.** Leaves uncovered: in bkit's own repo, editing `.bkit/templates/prettierignore.example` or `lintstagedrc.example.json` gets the generic GateGuard checklist instead of the gate-config advisory, because `GATE_CONFIG_PATTERNS` match only the old dotfile names. Where: `docs/deferrals.jsonl:230`, `build-challenge` round 1 (2026-11-08). Reason: `low-severity`. Triage: `bucket: Exempt`, tests not applied.
- **`892-template-copies-bkit-challenge-low-bkit-core-docs-templates-bkit-audit-adoption-md-116`.** Leaves uncovered: the adoption audit's Step 9 diffs each template against the same path at the root, so for the renamed samples it diffs against a root `prettierignore.example` / `lintstagedrc.example.json` that never exists, and an adopted `.prettierignore` reads as unreconciled. Where: `docs/deferrals.jsonl:231`, `build-challenge` round 1 (2026-11-08). Reason: `low-severity`. Triage: `bucket: Exempt`, tests not applied.
- **`892-template-copies-bkit-challenge-low-bkit-core-engine-install-template-copies-ts-165`.** Leaves uncovered: nothing in the shipped code. The finding was about the migration's write missing `unhashed: true`, and task 5 removed that migration (no `migrateLintStagedSample` remains). The row stays open in the ledger, so it can be closed as obsolete. Where: `docs/deferrals.jsonl:232`, `build-challenge` round 2 (2026-11-09). Reason: `low-severity`. Triage: `bucket: Exempt`, tests not applied.

Note, not a deferral row: the round 2 security challenge LOW finding (`build-challenge-2.md` task 1, dangling `.lintstagedrc.json` symlink written through by `migrateLintStagedSample`, `template-copies.ts:164`) has no ledger row. It targets the removed migration, so it no longer applies to the shipped code.

## Lazy Deferrals

None

## Handover Notes

None
