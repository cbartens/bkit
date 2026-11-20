Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: CONCERNS, 1 gap (task 5, the result of the `bkit.workflows` write-back was never checked). `build-plan-gaps-remediate-3-1-log.md` closed it with `restoreKept` and `refuseWriteBack` and a new test. This attempt finds the fix incomplete in one sub-case (see the log).

## Notes

- Mode `Group`, judged against `build-diff-3-2.md` (`steps.ts`, `steps.test.ts`, `.bkit/core/.bkit/workflows.md` and its rendered `.bkit/workflows.md`, `.bkit/version`, `dist/commands/workflow/steps.js`, `docs/testing.md`, and the graph renders `DETAILS.md` and `docs/capabilities.md`). No prompt, workflow or install file changed. The brief's `Deviations` are the run rules; the diff keeps to the files they allow.
- `pnpm exec vitest run .bkit/core/engine/commands/workflow/steps.test.ts`: 198 passed. All seven `TEST FIRST` tests exist with the planned names, and each `Derived Test Matrix` row for tasks 5 and 6 is named in its task's `TEST FIRST` / `DONE WHEN`. The remediation adds one more test ("a bkit:generate that leaves package.json unparseable gets the step's original package.json back and exits 13"); it passes.
- Test-first audit `build-tests-green-3-2.md`: `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`. Already landed: task 5 "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json". The tests step's reason: it pins unchanged behaviour that the existing exit-13 path already satisfies, so no red is due. No gap.
- Task 6 stays satisfied: `recordGenerateFriction` keys its row `steps-finish-generate/<step>`, and the exit-11 writer keeps `steps-finish/<step>`, so `appendFrictionRow` no longer folds the two.
- Task 5: the set-aside, generate-from-HEAD and write-back flow, the `isBkitOwnRepo` guard, the shared-checkout guard (`recordedPath`), the failed-generate branch (write back, then exit 13 as the step's own edit) and the unchanged path outside bkit's own repo match the DONE WHEN, and the exit-13 help, both workflow docs, the `docs/testing.md` row and `dist/` are updated. The attempt-1 gap is closed for the cases a test reaches: a structured write-back, and the byte fallback when `bkit:generate` leaves `package.json` unparseable. One sub-case stays open: when neither write lands, the refusal message says the file was restored (see the log).
- Task 5's design comes from `build-decision-1-2.md` Q1 ("B, fix now"), which the orchestrator recorded as an assumption for the owner: assumed, not the owner's acceptance. The challenge finding's `Fixable: false` is answered by that decision and is not a gap.
- The plan has no `Documentation Updates` section; the docs the DONE WHEN names are updated. `docs/observability.md` exists; the gap cites its § Error tracking.

## Identified Gaps Log

TASK 5: `.bkit/core/engine/commands/workflow/steps.ts` `restoreKept` (line 1162) returns `false` both when its byte fallback lands and when that write throws (its catch drops the error), against its own doc comment "False only when neither write lands"; `refuseWriteBack` (line 1508) then always logs "its original package.json is restored", so when neither write lands finish exits 13 telling the agent its `package.json` is back while the file still holds HEAD's `bkit.workflows` or the output of `bkit:generate`, and the agent's own reading is lost without a word, against the DONE WHEN "writes the kept working reading back so nothing the agent wrote is lost" and `docs/observability.md` § Error tracking ("The command reports its failure to the caller"); fix by having `restoreKept` tell the two outcomes apart (structured write, bytes restored, nothing restored with the write error) and `refuseWriteBack` log the true one, with the error text, plus a `steps.test.ts` case where neither write lands — Fixable: true
