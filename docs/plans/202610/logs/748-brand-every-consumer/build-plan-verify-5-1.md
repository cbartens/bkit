Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: none
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

None

## Notes

- Mode `Group`: Tasks 11 and 12 judged against `build-diff-5-1.md` and the working tree at `84f7e9731`. Neither is satisfied; both stay off the `Tasks` line.
- Task 11, met parts: the `Branding:` bullet is at `.agents/rules.md:185` with its `### branding` entry in `.bkit/instructions.md`; clause `slop-gate` names `bkit:slop:delta` and the old wording is in its `retired` list (`.bkit/instructions.md:1826`); `.bkit/core/.agents/rules.md` is regenerated; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0; `.bkit/core/engine/tools/` tests pass (158). The listed `workflows.md` / `install.md` anchors already carry the new names.
- Task 11 grep, hits judged not gaps: `.bkit/core/.bkit/templates.md:227` names `accepted-advisories.json` on purpose, as an example of the old names the `ci-scripts-old-names` advisory reports. It is the same deliberate old-name class as the migration tables that Task 12's exceptions allow.
- Task 12, met parts: the `CHANGELOG.md` `## [Unreleased]` breaking-change entry is present; `bkit check` reports `0 write(s) would occur`; `pnpm bkit:graph:check` passes ("docs/capabilities.md matches a rebuild at 84f7e9731"); `.agents/docs.md` rows 72 and 75 are updated; `dist/` and the engine were last changed in the same commit (`25c06ea5d`), and group 5 changed no engine source. The migration integration tests (`upgrade.integration.test.ts`, `core.integration.test.ts`) pass (190). `branding.test.ts`, `dogfood-templates.test.ts` and `catalogue.test.ts` pass (124). The packed-tarball dogfood run was not repeated here, because this verifier does not install; the execution log claims it.
- Task 12 grep, hits judged not gaps:
  - `grep -rnw House .bkit` also hits `.bkit/issues.jsonl:2`, a historical append-only ledger row, which is not a template, tip or doc.
  - The `scripts/ci/...` grep hits `SHIPPED_CI_SCRIPT_HASHES` (`core.ts:949-976`), the table that does the job of the plan's `BKIT_TEMPLATE_FILE_RENAMES` (no constant has that name), and the migration and advisory tests.
  - It also hits the deliberate old-name check in the `dependency-audit` tip, with its test (`catalogue.ts:377`, `catalogue.test.ts:408`), which keeps the tip quiet for an unprefixed copy.
- Gate run: `pnpm bkit:gate:static-unit` passed its static half (typecheck, lint, format, tables, prose, slop delta). In the unit half, 1 of 6961 tests failed, the one logged against Task 12.
- Test-first audit `build-tests-green-5-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; nothing to decide.
- `build-decision-1-1.md` covers group 3 (Tasks 7 and 8) and accepts nothing in group 5.
- Out-of-scope finding (Task 7, group 3, not logged as a gap here): `bkit check` warns falsely, `core: .husky/pre-push:363 still runs the old script name "graph"` and `.github/workflows/bkit-ci.yml:527 ...`. Those lines hold only `graph\.json` in a `sed` pattern and the comment "rebuild the graph with graphify". The shipped template comment (`.bkit/templates/.github/workflows/bkit-ci.yml:266`) carries the same words, so a consumer with an unedited adopted copy and a `bkit:graph` script would see this warning on every check and upgrade. The warning comes from `core.ts:922`; propose a fix separately.

## Identified Gaps Log

3 gaps.

- TASK 11: `.bkit/shared/docs/deployments.md:445` — done-when-unmet: the DONE WHEN grep `pnpm (run )?graph` still hits the Renovate row's prose "on a large pnpm graph", outside every `retired` list; the task's own UPDATE line names this file and it was left unedited. Reword the prose so it no longer reads as a script call (e.g. "a large pnpm dependency graph"), then re-render `docs/deployments.md` with `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true
- TASK 12: `docs/testing.md:686` — test-broken: the new § Key test files row for `branding.test.ts` cites "(#748)", so `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` > `shipped docs carry no internal identifiers > docs/testing.md cites no tracker issue number` fails and `pnpm bkit:gate:static-unit` (bkit's pre-push gate) exits 1 (1 failed, 6958 passed); the DONE WHEN "bkit's own pre-push gate passes" is unmet. Drop the issue number from the row — Fixable: true
- TASK 12: `docs/deployments.md:445` — done-when-unmet: DONE WHEN greps `pnpm (run )?(graph|lint:prose|slop:delta)` over `.bkit` (hit in `.bkit/shared/docs/deployments.md:445`) and the `docs` sweep (hit in `docs/deployments.md:445`) both match the "large pnpm graph" prose, outside the listed exceptions; clears with the Task 11 fix plus the mirror re-render — Fixable: true
