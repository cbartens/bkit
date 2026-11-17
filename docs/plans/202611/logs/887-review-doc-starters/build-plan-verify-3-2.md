Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7, 8, 9
Loosened: none
Fingerprint: 30d01ea24d67e556e2502d93523e95d5de96a730dc4d860823e21e18354830c4
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: CONCERNS, 4 fixable gaps, Task 9 satisfied. Gaps 1-3: the bkit-practice rules-box line in `security.md`, `testing.md` and `deployments.md` left out the plan's "stay separate sections. Do not rename, merge or compress them" wording. Gap 4: stale Vercel lead-ins and a repeated schema sentence in the `deployments.md` rollback runbooks.
- `build-plan-gaps-remediate-3-1-log.md` (commit `c446cac3e`): PASS, 4 fixed.

## Notes

- Mode is Group. Tasks 6-9 were judged against `build-diff-3-2.md`, the full group diff including the remediation commit. The brief has no `Deviations` section, `build-plan-current.md` lists no affected tasks, and no decision record exists for this run.
- All 4 earlier gaps are closed:
  - `.bkit/templates/docs/security.md:46`, `.bkit/templates/docs/testing.md:53` and `.bkit/templates/docs/deployments.md:44` now carry the plan's line: "Sections marked **bkit practice** keep their heading text and stay separate sections. Do not rename, merge or compress them, because bkit's CI template, advisories and audits cite them by name."
  - `.bkit/templates/docs/deployments.md:95` no longer says the commands use Vercel.
  - Step 1 at line 104 ends "For example:" before the host-neutral placeholder.
  - Step 2 at line 155 has one schema sentence.
- These six test files pass, 802 tests in all: `.bkit/core/engine/install/project-docs.test.ts`, `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, `.bkit/core/engine/audits/templates/templates.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/checks/after/tools.test.ts` and `.bkit/core/engine/audits/templates/templates-content.test.ts`.
- These static DONE WHEN checks hold:
  - No starter in `.bkit/templates/docs/` has `## Project facts to record`.
  - "promote after the capstone" appears in none of `project-docs.ts`, `tools.ts` or their `dist/` builds.
  - `UNAUDITED_DOC_SECTIONS` holds no `Project facts to record` key.
  - `testing.md` has one `## Test first` (line 491), after `## What each tier must do` (line 422).
  - The remediation touched only Markdown starters, and `dist/` holds no template copies, so no rebuild was due. `dist/` is clean and was committed in `40b2b5432`.
- Test-first audit (`build-tests-green-3-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. All ten `TEST FIRST` tests went red, then green. The audit has no `Updated tests`, `Already landed` or `delete-still-referenced` section.
- Every Derived Test Matrix row for Tasks 6-9 is named in its task's DONE WHEN. No Documentation Updates row belongs to Group 3. `docs/observability.md` does not apply, because the group adds no runtime error path.
- Tasks 6, 7, 8 and 9 are satisfied.
- Out-of-scope finds, not gaps:
  - The remediation also added the same bkit-practice sentence to `.bkit/templates/docs/design.md:43` (Group 2, Task 4). The earlier verify had listed that file as an out-of-scope find. The edit matches the plan's Breaking Changes wording, and its tests pass.
  - `.bkit/templates/docs/deployments.md:139` still says "The commands use Supabase as the example." That stays true, because § Post-rollback verification (line 174) keeps one labelled Supabase `psql` example.
  - `.agents/docs.md` project rows still carry the old scopes. Task 14 (Group 4) owns that sync.

## Identified Gaps Log

None
