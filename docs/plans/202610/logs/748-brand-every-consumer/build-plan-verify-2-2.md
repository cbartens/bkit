Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5
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

- `build-plan-verify-2-1.md` (Verdict CONCERNS, 2 gaps, both `Fixable: true`): TASK 4 missing `docs/migrations.md` row "Branded script names"; TASK 5 left `workflow-templates.integration.test.ts` `T2.7 ... (c)` failing.
- `build-plan-gaps-remediate-2-1-log.md` (Verdict PASS, Fixed 2) addressed both; commit 0c0c60bd9 touches only `docs/migrations.md` and `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`.

## Notes

- Judged against `build-diff-2-2.md` (the group diff since the group started). No `Deviations` section in `build-brief-2-1.md`; no decision records (`build-decision-*.md` absent).
- `build-plan-current.md` (Verdict CONCERNS) lists Tasks 1, 2, 3, 7, 8, 11, 12 as `Reword` line-anchor drift; it does not affect Tasks 4 or 5.
- Test-first audit (`build-tests-green-2-2.md`): `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed: Task 5 `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-`; the tests step's reason: it runs on seeded text through the test-local pure function, so it passes before the templates change, and the sibling test carries the red.
- Gap 1 from attempt 1 is resolved: `docs/migrations.md` § Migrations now has the "Branded script names" row naming `migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, `seedCorePackageJsonScripts`, releases up to 6.0.x, and the tests in `core.integration.test.ts` and `upgrade.integration.test.ts`. The row says "the old key is deleted"; the code (`core.ts:831-843`) renames the key in place, which removes the old key, so the row is accurate.
- Gap 2 from attempt 1 is resolved: `workflow-templates.integration.test.ts:214` now expects `name: bkit-cloud-context`; the assertion is unchanged otherwise (a name update, not a loosening).
- TASK 4: `BKIT_SCRIPT_RENAMES`, `activeScriptRenames`, `renameScriptTokens`, `findOldScriptNames` and `migrateBrandedScriptNames` (`.bkit/core/engine/install/modules/core.ts:718-860`) are in place; `seedCorePackageJsonScripts` calls the migration at `core.ts:547`; `dist/install/modules/core.js` rebuilt. The engine grep for old quoted names outside tests hits only the rename table (`core.ts:720-721`) and the `graph` value guard (`core.ts:751`). The old-shape scratch-consumer upgrade and second-run no-write are proven through the real CLI by `upgrade.integration.test.ts` `branded script migration is idempotent and dry-run writes nothing`. Every Derived Test Matrix row for Task 4 has its test in the task's `TEST FIRST` / `DONE WHEN`.
- TASK 5: the templates and bkit's own copies of `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` carry `bkit-` workflow and job display names; job ids unchanged. No old check name (`context (`, `claude (`, `opencode (`, `name: Renovate`, `name: Trivy`) is left in `.bkit/core`, `.bkit/shared`, `.bkit/templates` or `.github`; the one hit in `upgrade.integration.test.ts:384` is a seeded copy-and-own fixture. `actionlint .github/workflows/*.yml` exits 0. Both Derived Test Matrix rows for Task 5 have their tests in the task.
- Full `pnpm exec vitest run`: 216 files passed, 8663 tests passed, 2 skipped, exit 0. This covers `core.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts`, `write.integration.test.ts`, `uninstall.integration.test.ts`, `branding.test.ts`, `dogfood-templates.test.ts` and `workflow-templates.integration.test.ts`.
- Errors and warnings in the new migration go through `console.warn` / `console.log` with `logPrefix`, as the sibling migrations do; `docs/observability.md` needs no change (plan § Documentation Updates).
- Documentation Updates rows for this group: the Task 4 `docs/migrations.md` row is done; the `.bkit/*.md` mirror updates in the diff are re-renders of group 1 renames. Other rows belong to later tasks.

## Identified Gaps Log

None
