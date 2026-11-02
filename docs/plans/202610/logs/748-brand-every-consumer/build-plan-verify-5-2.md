Verdict: PASS
Failures: 0
Fixable: false
Tasks: 11, 12
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-5-1.md`: `CONCERNS`, 3 fixable gaps (the `deployments.md:445` "large pnpm graph" prose in `.bkit/shared/docs/deployments.md` and `docs/deployments.md`; the "(#748)" citation in `docs/testing.md:686` that failed `shipped-docs-refs.test.ts`).
- `build-plan-gaps-remediate-5-1-log.md`: `PASS`, all 3 fixed in `fe0cea9af`.

## Notes

- Mode `Group`: Tasks 11 and 12 judged against `build-diff-5-2.md` and the working tree at `fe0cea9af`. Both are satisfied.
- Round-1 gaps closed: the Renovate row in `.bkit/shared/docs/deployments.md:445` and `docs/deployments.md:445` now reads "a large pnpm dependency graph", so neither DONE WHEN grep hits it; the `branding.test.ts` row in `docs/testing.md` no longer cites an issue number.
- Task 11: the `Branding:` bullet is at `.agents/rules.md:185`. The DONE WHEN grep hits only the `slop-gate` `retired` list (`.bkit/instructions.md:1826-1828`) and `.bkit/core/.bkit/templates.md:227`, which names `accepted-advisories.json` on purpose as an example the `ci-scripts-old-names` advisory reports (same judgement as round 1). `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0.
- Task 12: `grep -rnE "pnpm (run )?(graph|lint:prose|slop:delta)" .bkit --exclude='*.test.ts'` has no hits. The `House` grep hits only `migrateValeHouseStyle` / `SHIPPED_HOUSE_RULE_HASHES` in `core.ts`, their integration tests, and `.bkit/issues.jsonl:2` (an append-only ledger row, not a template, tip or doc). The `scripts/ci/...` grep hits only `SHIPPED_CI_SCRIPT_HASHES` (`core.ts:949-976`, the table that does the job of the plan's `BKIT_TEMPLATE_FILE_RENAMES`), the migration and advisory tests, and the deliberate old-name check of the `dependency-audit` tip (`catalogue.ts:377`, `catalogue.test.ts:408`). The docs sweep hits only `docs/migrations.md` rows 34, 35 and 38. `CHANGELOG.md:13` holds the breaking-change entry.
- Gate runs (this round): `bkit check` reports `0 write(s) would occur`; `pnpm bkit:graph:check` passes ("docs/capabilities.md matches a rebuild at fe0cea9af"); `pnpm bkit:gate:static-unit` exits 0, with 166 test files passed and 6959 tests passed, 2 skipped (6961).
- The packed-tarball old-shape dogfood run was not repeated here, because this verifier does not install; `build-plan-tasks-5-log.md` records it as done with a clean second upgrade, and the migration integration tests that cover the same old shape pass inside the gate run.
- Test-first audit `build-tests-green-5-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; nothing to decide.
- `build-decision-1-1.md` covers group 3 (Tasks 7 and 8) and accepts nothing in group 5.
- Out-of-scope finding carried from round 1 (Task 7, group 3, not a gap here): `bkit check` warns falsely that `.husky/pre-push:363` and `.github/workflows/bkit-ci.yml:527` still run the old script name "graph", because those lines hold only `graph\.json` in a `sed` pattern and a comment. The warning comes from `core.ts:922`; propose a fix separately.

## Identified Gaps Log

None

