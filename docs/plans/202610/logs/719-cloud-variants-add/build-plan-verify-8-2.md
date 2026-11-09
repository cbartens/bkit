Verdict: PASS
Failures: 0
Fixable: false
Tasks: 15, 16, 17
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202610/logs/719-cloud-variants-add/build-plan-verify-8-1.md`: CONCERNS, 2 gaps, both TASK 16: the `.bkit/core/.bkit/install.md` `requires tracker=github` sentence, and the `ANTHROPIC_API_KEY` secret name in `.bkit/core/.bkit/cloud.md` § Claude — workload identity federation.
- `docs/plans/202610/logs/719-cloud-variants-add/build-plan-gaps-remediate-8-1-log.md`: PASS, fixed both (commit `16b71a32f`), then ran `pnpm bkit:generate`.

## Notes

- Gap 1 from attempt 1 is resolved. `.bkit/core/.bkit/install.md` now reads "Every `--auto` variant works with GitHub, Linear or Jira as the tracker; only `tracker=none` refuses." The installed copy `.bkit/install.md` matches it.
- Gap 2 from attempt 1 is resolved. `.bkit/core/.bkit/cloud.md` § Claude — workload identity federation names `BKIT_ANTHROPIC_API_KEY` in the intro and in step 4 (`gh secret delete BKIT_ANTHROPIC_API_KEY`). `grep` finds no bare `ANTHROPIC_API_KEY` left in `.bkit/core/.bkit/install.md` or `.bkit/core/.bkit/cloud.md`.
- TASK 15 is satisfied. Both `TEST FIRST` tests in `.bkit/core/engine/checks/tips/catalogue.test.ts` exist and pass, and so do the existing cloud cases. Test-first audit `build-tests-green-8-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, so there is nothing to decide. TASK 15's Derived Test Matrix rows are covered by those two tests.
- TASK 16 is satisfied. I re-ran every DONE WHEN check against the current tree:
  - The forbidden-text `git grep` over `.bkit/core/.bkit` prints nothing (exit 1).
  - The support matrix header is `Agent | Ways to launch a cloud agent | not supported`, with no `Tracker` column. It has exactly one row each for Claude, Codex, Cursor and OpenCode.
  - `git grep -n 'not yet verified live'` prints `.bkit/core/.bkit/cloud.md:409-411`. Those lines name Linear and Jira router dispatch, the codex router job and the Cursor Jira guard.
- TASK 17 is satisfied, on the same reading of its DONE WHEN as attempt 1 (the caller asked me to keep it). The `git grep` matches substrings, so it still hits `.bkit/core/engine/install/modules/opencode.ts:233,288`. Those two lines are `OPENCODE_PROVIDER_KEY_SENTINEL` / `@@OPENCODE_PROVIDER_KEY@@`: a template placeholder that install replaces with the provider id. It is not a secret name. The `docs/security.md:22` hit from attempt 1 is gone, because `pnpm bkit:generate` regenerated the managed block (`bkit:end` at `:62`) from `.bkit/shared/docs/security.md`.
- `pnpm build` leaves `dist/` matching its sources. I checked this by compiling `tsc -p tsconfig.json` into a scratch directory. `dist/checks/tips/catalogue.js`, `dist/checks/tips/index.js` and `dist/install/modules/opencode.js` are byte-identical to the compiled output. The remediation commit touched no engine source.
- The caller asked for a test run because the fix step ran `pnpm bkit:generate` after its last gate run. Against the current tree, `npx vitest run .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/checks/tips/` gives 5 files and 665 tests, all passed.
- Every Documentation Updates row owned by group 8 is done: `docs/testing.md`, `docs/security.md`, `docs/deployments.md` and the five `.bkit/core/.bkit/*.md` rows.
- TASK 15 adds no error path, so `docs/observability.md` logging does not apply.
- Decision records `build-decision-1-1`, `1-2`, `1-3` (group 1) and `build-decision-2-1` (group 3) do not touch group 8.
- Out-of-scope find carried over from attempt 1 (not a gap; no task names it): `docs/deployments.md:528` still says `{{CLOUD_RUNNER}}` ships "in both jobs".

## Identified Gaps Log

None
