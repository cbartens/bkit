Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-2-1.md` (commits 7552317e9 plan-tests and 4f13166fc plan-execute). No `Deviations` section in `build-brief-2-1.md`; no decision records, no earlier group 2 verify reports, no remediation logs.
- `build-plan-current.md` (Verdict CONCERNS) lists Tasks 1, 2, 3, 7, 8, 11, 12 as `Reword` line-anchor drift; it does not affect Tasks 4 or 5.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed: Task 5 `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-` — the tests step's reason: it runs on seeded text through the test-local pure function, so it passes before the templates change; the sibling test carries the red.
- TASK 4: code satisfies the DONE WHEN. `BKIT_SCRIPT_RENAMES`, `activeScriptRenames` (the active-pair definition), `renameScriptTokens`, `findOldScriptNames` and `migrateBrandedScriptNames` are in `.bkit/core/engine/install/modules/core.ts:718-859`; `seedCorePackageJsonScripts` calls the migration before `ensurePackageJsonScripts`; `dist/` rebuilt. The planned deletion of `leaves a superseded bkit slop:delta value in place ...` landed, and `upgrade.integration.test.ts` asserts `bkit:slop:delta` undefined plus the new idempotency / dry-run test. The engine grep for `lint:prose` / `slop:delta` / `graph*` old names outside the rename table and migration tests hits only negative assertions and seeded branding-guard cases (`manifest.test.ts:431`, `dogfood-templates.test.ts:749,754`, `branding.test.ts:80,84`). `core.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts`, `write.integration.test.ts`, `uninstall.integration.test.ts` pass (8 files, 342 tests). Held off the `Tasks` line only because its `docs/migrations.md` UPDATE is missing (gap 1).
- TASK 4 edge: the unreachable-token warning fires only when the run also changes `package.json` (`if (!changed) return false` precedes the warn loop). This matches the plan's Assumption ("each surviving old name in a migrated file logs one warning"), so it is not logged as a gap.
- TASK 5: templates and bkit's own copies of `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` carry `bkit-` workflow and job display names; job ids unchanged; the "context job" / "claude job" / "opencode job" comments name job ids, which stay. `branding.test.ts` and `dogfood-templates.test.ts` pass; `actionlint .github/workflows/*.yml` exits 0. Held off the `Tasks` line because it broke `workflow-templates.integration.test.ts` and left it failing (gap 2).
- Full `pnpm exec vitest run`: 216 files, 1 failed / 8662 passed / 2 skipped; the one failure is gap 2.
- Errors and warnings in the new migration go through `console.warn` / `console.log` with `logPrefix`, as the sibling migrations in `core.ts` do.

## Identified Gaps Log

2 gaps.

- TASK 4: `docs/migrations.md` — missing-row: the task's UPDATE field asks for a § Migrations row "Branded script names" (`migrateBrandedScriptNames`, called by `seedCorePackageJsonScripts`; releases up to 6.0.x; tests `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`); no such row exists (`grep -n migrateBrandedScriptNames docs/migrations.md` has no hit), though `build-plan-tasks-2-log.md` claims it was added. `.agents/rules.md` § Migrations also requires the row — Fixable: true
- TASK 5: `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `T2.7 — two-tier CI gate positive assertions (GAP-3) > (c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need` — broken-test-not-fixed: line 214 asserts `/^ {2}context:\n {4}name: context[^\n]*\n {4}if: >-\n/m` against `.bkit/templates/.github/workflows/bkit-cloud.yml`, whose job is now `name: bkit-cloud-context (...)`; the task broke this test and left it failing (full `vitest run`: 1 failed, 8662 passed). Update the expected job name to `bkit-cloud-context` — Fixable: true
