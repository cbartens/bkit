Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups: 1 Tasks 1-3, 2 Tasks 4-5, 3 Tasks 6-8, 13, 14, 4 Tasks 9-10, 5 Tasks 11-12).

## Integration Gaps

0 integration gaps. Checked across groups:

- Shared active-pair definition: `activeScriptRenames` in `.bkit/core/engine/install/modules/core.ts:743` is the one definition. `migrateBrandedScriptNames` (Task 4) and `migrateBrandedFileTokens` (Task 7) both call it on the same `BKIT_SCRIPT_RENAMES` table, so `package.json`, the hooks and the CI workflow agree on which pairs move.
- Call order in `runBkitDocs` (`core.ts:338-341`): `migrateBrandedTemplateFiles` (Task 8) returns the renames that `migrateBrandedFileTokens` (Task 7) takes, then `migrateBrandedCheckNames` (Task 9), then `migrateValeHouseStyle` (Task 10). On install, `runBkitDocs` (`core.ts:1691`) runs before `seedCorePackageJsonScripts` (`core.ts:1737`). Both orders give the same result, because the key rename and the path rewrite touch different parts of `package.json`, and a renamed pair stays active on the next run.
- Shared state: every brand-migration write on a copy-and-own file carries `unhashed: true`. The install hash loop (`core.ts:1758`) and the upgrade collector (`upgrade.ts:1029`) both skip it. `package.json` keeps its existing hash entry from the non-migration writes, as before this branch.
- Contracts: `CI_SCRIPT_UNITS` / `CI_SCRIPT_RENAMES` are exported from `.bkit/core/engine/checks/after/ci-yml.ts:666,681` and read by both the migration and the `ci-scripts-old-names` advisory. The `BRANDED_WORKFLOWS` / cloud rewrite targets (`bkit-renovate`, `bkit-trivy`, `bkit-cloud-{context,claude,opencode} (${{ github.event_name }})`) match the Task 5 templates line for line, and the old lines match the `v6.0.0` tag.
- Guard and rule agree: `branding.test.ts` (Tasks 3, 5, 6) checks the same surfaces that the `.agents/rules.md:185` branding bullet (Task 11) names.

## Previously Attempted

- None for the holistic scope. This is the first holistic attempt.
- Group verify reports read: `build-plan-verify-1-1.md` (CONCERNS), `1-2` (PASS), `1-3` (PASS, Tasks 1, 2, 3); `2-1` (CONCERNS), `2-2` (PASS, Tasks 4, 5); `3-1` (CONCERNS), `3-2` (PASS, Tasks 6, 7, 8, 13, 14); `4-1` (PASS, Tasks 9, 10); `5-1` (CONCERNS), `5-2` (PASS, Tasks 11, 12).
- Remediation logs read: `build-plan-gaps-remediate-1-1`, `1-2`, `2-1`, `3-1` (both gaps BLOCKED, then resolved by `build-decision-1-1.md` and Tasks 13 and 14), `5-1`.

## Notes

- Mode `Holistic`, judged against the working tree at `a1444a2bc` and `git diff origin/dev...HEAD`. The run diff `tmp/bkit-diff-748-brand-every-consumer.md` is partial diff coverage (11770 lines across 166 files). I read the omitted engine files directly in the worktree.
- The local `origin/dev` ref (`db424ac7a`) is behind the dev that was merged in at `566215af0`. So `origin/dev..HEAD` also lists dev commits (`4bdee4559`, `0baf2ac4d`, `7d2e83257`, `3249b0d14`), and the diff also shows the install-skills output (`.agents/skills/*`, `.claude/skills/*`). None of that is plan work, and I did not judge it.
- Tasks 1-14 are all satisfied. Every task's DONE WHEN was rechecked on the current tree:
  - Task 1: the `lint:prose` / `slop:delta` grep over non-test `.bkit/core/engine`, `.bkit/templates/.github`, `.bkit/templates/.husky` and `.bkit/core/.bkit/templates.md` hits only the Task 4 `BKIT_SCRIPT_RENAMES` table (`core.ts:727-728`). Root `package.json` has no old key. `detectValeMissing` reads `scripts["bkit:lint:prose"]` (`tools.ts:35`). The `tools.test.ts` old-name grep is empty.
  - Task 2: the `find` for unprefixed files and the `git grep` for the old launchd source paths are both empty.
  - Task 3: no `pnpm graph` without `bkit:` under `.bkit/templates`, `.bkit/core/.bkit`, `.bkit/core/engine/checks` or in `docs/templates/bkit-audit-duplication.md`. `bkit:generate` calls `pnpm bkit:graph:refresh`. `pnpm bkit:graph:check` reports "docs/capabilities.md matches a rebuild at a1444a2bc".
  - Task 5: `actionlint .github/workflows/*.yml` exits 0.
  - Task 6: the word-bounded `House` grep over `.bkit/templates`, `.bkit/core/.bkit` and `.bkit/core/engine` (non-test) hits only the Task 10 migration in `core.ts`.
  - Tasks 7, 8, 13, 14: as judged in `build-plan-verify-3-2.md`. Engine code has not changed since group 4 (`25c06ea5d`).
  - Task 12: every grep in its DONE WHEN hits only the allowed classes, which `build-plan-verify-5-2.md` also judged: the migration tables and their tests, the `slop-gate` `retired` list, `docs/migrations.md` rows, the deliberate old-name probe at `catalogue.ts:377`, the `ci-scripts-old-names` advisory tests in `ci-yml.test.ts`, and the append-only ledger row `.bkit/issues.jsonl:2`. `node dist/cli.js check` reports `0 write(s) would occur`. `CHANGELOG.md:13` holds the breaking-change entry. I did not repeat the packed-tarball dogfood, because this step does not install. `build-plan-tasks-5-log.md` records it as done, and the real-CLI old-shape upgrade tests in `upgrade.integration.test.ts` pass.
- Plan checkboxes: Tasks 2 and 3 are still `[ ]` in the plan, at HEAD and in the working tree, although `build-plan-verify-1-3.md` passed them. Both are on the `Tasks` line so the workflow ticks them.
- Every planned TEST FIRST title exists in its file. The four titles that are gone are the ones the plan removes: `leaves a superseded bkit slop:delta value in place` (Task 4) and the Task 7 and Task 8 upgrade tests that Tasks 13 and 14 replaced. Per the caller, those replacements are decided by owner decision `build-decision-1-1.md` (`Decision: Fix now`, an owner decision, not an assumed accept), so the stale Task 7 / Task 8 TEST FIRST titles are not gaps.
- Derived Test Matrix: every row maps to a test in its task's TEST FIRST or DONE WHEN. The Task 7 and Task 8 second-run / dry-run rows map to the Task 13 and Task 14 replacements.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `pnpm bkit:gate:changed`. Two full vitest runs passed: 216 files, 8682 passed, 2 skipped; and 214 files, 8651 passed, 2 skipped. The hook and graph sub-suites passed (6, 13, 13), and lint and typecheck passed. The gate still exited 1 on its `format` step. Prettier printed "All matched files use Prettier code style!", but errored because two explicit paths, `.claude/skills/github-actions` and `.claude/skills/vitest`, are symbolic links. These links come from the build's install-skills commit `cd37fe5ef`, not from a plan task, and `scripts/gate/bkit-gate-changed.mjs` passes them to prettier unfiltered. This is out of scope and not a plan gap. Propose separately: have the changed-file gate drop symlinks before calling prettier. Step 12 (Run Tests) will likely hit the same exit 1 if it runs this gate.
- Known and out of scope, per the caller: `bkit check` warns that `.husky/pre-push:363` and `.github/workflows/bkit-ci.yml:527` still run the old `graph` name. This is the bare-word match in `findOldScriptNames`.
- Observability: every new migration logs through `console.log` / `console.warn` with the caller's `logPrefix` (`[bkit-install]` / `[bkit-upgrade]`), as `docs/observability.md` requires. No new prefix.
- Documentation Updates: every row is done except `docs/knowledge.jsonl` (gap below). Rows checked: `docs/migrations.md` (five rows, 34-38, plus the updated `ci-scripts-old-names` row 49), `docs/testing.md:686` branding row, `docs/security.md`, `docs/setup.md`, `docs/technology.md`, `CONTRIBUTING.md:27`, `.agents/docs.md:72,75`, the `.agents/rules.md:185` branding bullet, `CHANGELOG.md`, and the `docs/decisions.jsonl` 748 rows. The docs-sweep grep over `docs`, `CONTRIBUTING.md`, `.agents/*.md` and `README.md` hits only `docs/migrations.md`.
- No test-first audit report was supplied for the holistic step, so step 8 had nothing to decide.

## Identified Gaps Log

1 gap.

- Documentation Updates (mandatory, no single task): `docs/knowledge.jsonl` — doc-row-not-done: the plan's `Documentation Updates` row asks for superseding same-key rows once the names land, and the branch adds none (`git diff origin/dev...HEAD -- docs/knowledge.jsonl` is empty). The newest row of each key is still ACTIVE with the old wording: `kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships` (names `lint:prose`, and says bkit never writes a consumer's `.vale.ini`, which `migrateValeHouseStyle` now does), `capability-register-drift-reached-dev-through-warn-only-pre-push` (fix: `pnpm graph:refresh`), `kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees` (`lint:prose`, `.vale/styles/House`), `kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba` (`pnpm slop:delta`). No later build step writes knowledge rows. Append one superseding row per key with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same key, new names — Fixable: true
