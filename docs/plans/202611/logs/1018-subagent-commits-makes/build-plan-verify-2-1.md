Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 3fb8d7e895136e8fe8bf8b067d09c7b2771eef00225d77c72a76af108856abc6
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

- Group mode, judged against `build-diff-2-1.md` (changes since group 2 started). No decision records and no earlier group-2 verify or gaps-remediate logs exist.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`. No `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections, so nothing is loosened.
- TASK 4: both `scan-diff` calls in `.bkit/core/workflows/bkit-build.md` (lines 933 and 1046) carry `--since-step` and `--file="{STATUS}"`; `rg -n 'HEAD~1' .bkit/core/workflows/bkit-build.md` finds nothing; `workflow-shape.test.ts` (327 tests) and `workflow-fence-syntax.test.ts` (15 tests) pass. It is still held back by two gaps: an unrequested rewording that breaks the shared-instructions check, and the `.bkit/core/.bkit/workflows.md` Step 9 and Step 10 rows that still describe `--base=HEAD~1`.
- The Step 9 sub-step 5 rewording ("Exit 1 means the attempt changed no source file." becomes "Exit 1: no source file changed.") was not asked for either. It has no shared entry and breaks no check, so it is noted here, not logged.
- TASK 5: `docs/testing.md` rows at lines 572, 815 and 829 name the new behaviour; `.bkit/core/.bkit/cli.md:92` lists `--since-step` and `--file`; `dist/commands/workflow/branches.js` carries `--since-step`; `node dist/cli.js check` reports no drift. The full unit suite was not run here (`Local tests first`); the known failure in `instructions-coverage.test.ts` is enough to show that the DONE WHEN does not hold.
- Derived Test Matrix: the TASK 4 row is covered by its `TEST FIRST` test. Both `Documentation Updates` rows are done. `docs/observability.md`: no new error paths in this group.
- Brief `Deviations`: `publish=false` only; it changes no task.

## Identified Gaps Log

3 gaps.

TASK 4: `.bkit/core/workflows/bkit-build.md:1044` Step 10 sub-step 12 was reworded from "Check that the attempt changed source files, as Step 9 sub-step 5 does:" to "Check the attempt changed source files, ...", which the plan did not ask for; the shared entry in `.bkit/instructions.md` no longer matches, so `pnpm tsx .bkit/core/engine/tools/instructions.ts` exits 1 and `.bkit/core/engine/tools/instructions-coverage.test.ts` `the repo > has no coverage findings` fails. Restore the original sentence (the task changes only the command line) — Fixable: true
TASK 4: `.bkit/core/.bkit/workflows.md:975` (Step 9 row) and `:976` (Step 10 row) still describe the no-progress check as `bkit branches scan-diff --base=HEAD~1 --code`; the task's UPDATE field requires the index row to be edited when it describes the range. Point both rows at `--since-step=build-plan-gaps-remediate` / `--since-step=build-plan-gaps-remediate-holistic` with `--file`, then re-render `.bkit/workflows.md` with `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true
TASK 5: DONE WHEN "the full unit suite passes" does not hold: `.bkit/core/engine/tools/instructions-coverage.test.ts` fails on the Step 10 sub-step 12 wording; closes with the first TASK 4 fix, then re-run the suite — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 4: unrequested Step 10 sub-step 12 rewording breaks the shared-instructions coverage check
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:1044` · **Round:** 1
  - **DONE WHEN:** pnpm tsx .bkit/core/engine/tools/instructions.ts exits 0 and .bkit/core/engine/tools/instructions-coverage.test.ts passes
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-coverage.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 4: workflows.md Step 9 and Step 10 index rows still describe scan-diff --base=HEAD~1
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:975` · **Round:** 1
  - **DONE WHEN:** rg -n "HEAD~1" .bkit/core/.bkit/workflows.md .bkit/workflows.md finds nothing; the Step 9 and Step 10 rows name --since-step and --file
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 5: DONE WHEN full unit suite passes does not hold
  **Severity:** MEDIUM · **Fixable:** true · **Location:** `.bkit/core/engine/tools/instructions-coverage.test.ts:337` · **Round:** 1
  - **DONE WHEN:** the full unit suite passes
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-coverage.test.ts
<!-- bkit:task 3 end -->
