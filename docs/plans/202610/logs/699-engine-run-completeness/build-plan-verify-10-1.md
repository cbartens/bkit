Verdict: FAIL
Failures: 2
Fixable: false
Tasks: 21, 22

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 10`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-10-1.md`; plan-currency `Affected: 0`; no group 10 decision record (`build-decision-1-*` cover earlier groups) and no prior group 10 verify or remediate log.
- TASK 20: code meets `DONE WHEN` — `deriveContract` takes a `tracker` and renders via `substituteWorkflow`; `contractOf` (close row and start warning) and `bkit completeness check` pass `readIssueTracker` (`mainConfig` resolves the git common dir, so the status-file dir works; default tracker `none`). Both TEST FIRST tests exist and pass. Not satisfied: two `test-changed` audit gaps (both test replay filters changed after red); only the owner can excuse them.
- TASK 21: `resolveActiveRun` (`.bkit/core/engine/commands/lib.ts:409`) takes `--file` as the run only when its basename is `status.jsonl`, else falls through to `--fid` and the cwd scan. Both TEST FIRST tests pass; audit `Changed since red: no`.
- TASK 22: `check` skips visits whose rows all precede the first `engine-call` (no evidence hole; `exercised` pool untouched so no `unexercised`); zero calls keeps `preJournal: true`. TEST FIRST test passes; audit `outside the test only` → no gap.
- `dist/` rebuilt for all four engine files; `dist/render/trackers.js` present.
- Group test files: 4 files, 274 tests pass. Full `pnpm vitest run`: 8333 pass, 1 skipped, 1 timeout in `.bkit/core/engine/commands/workflow/runs.test.ts` `CI refuses a PR that is not open (7) ...` (5000ms under full-suite load); file untouched by group 10 and passes alone (161/161) → load flake, not a gap.
- No `Derived Test Matrix` row or `Documentation Updates` row maps to group 10 (challenge-round findings).

## Identified Gaps Log

- TASK 20: `.bkit/core/engine/checks/status-holes.test.ts` `a tracker-none run that journals every rendered call is CLEAN` — test-changed — the `noneRows` helper it runs changed its replay filter after red (`c.noun !== "workflows"` → `` `${c.noun} ${c.verb}` !== "workflows start" ``), so the journaled rows the test feeds `check` changed; inputs changed since red, owner-only exception — Fixable: false
- TASK 20: `.bkit/core/engine/commands/workflow/workflows.test.ts` `close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run` — test-changed — the test's own replay filter changed after red (`c.noun !== "workflows"` → `` `${c.noun} ${c.verb}` !== "workflows start" ``), so the rows it appends to `status.jsonl` changed; inputs rewritten since red, owner-only exception — Fixable: false
