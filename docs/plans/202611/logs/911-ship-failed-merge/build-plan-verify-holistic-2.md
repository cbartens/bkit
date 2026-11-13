Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 208e51b1797fc8fa569121bc5ba6d38d462be6c418ada6e0d2677f5dddfc292b
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups).

## Integration Gaps

0. The groups fit together:

- Group 1 → Group 2: the engine's 12-step ship table (`step-table.ts`, `steps.ts`, `status-holes.ts`) matches the `bkit-ship.md` headings, which run Steps 1-12 (lines 127-879).
- Group 2 → Group 4 contract: `failVerb` refuses a bad `--next-step` with `EXIT_NEXT_STEP_REFUSED` = 6 (`.bkit/core/engine/commands/workflow/workflows.ts:400`, thrown at line 412 before `failState`). The `bkit-ship.md` Failure Path step 1 (line 101) re-runs without `--next-step` only on exit 6. Any other non-zero exit, exit 2 included, falls to the `Lock removal failed` line, so `NEXT_STEP` stays held and `failState` is not called a second time. `node dist/cli.js workflows fail --help` lists exit 6, and `dist/commands/workflow/workflows.js` carries the same constant.
- Group 3 → Group 4 docs: § Failure Path in `.bkit/core/.bkit/workflows.md:802`, its mirror `.bkit/workflows.md` and both `.bkit/instructions.md` entries (the `failure-path` local entry and the `bkit-ship.md` `- source:` block) name exit 6. No file outside `docs/plans/**` still holds the old `exit 2 **and** --next-step` wording.
- Every `NEXT_STEP` that `bkit-ship.md` holds is `/bkit-debug {FID}`: Step 2 lines 345 and 347, Step 10 lines 729, 753, 754 and 755, and Step 12 line 887. The Merge Question's `Try again` clears it (line 835), and `Stop` names it (line 840).
- The only live files that still name `ship-failure-*` are the four tests that check old status rows (`workflow-shape.test.ts`, `status-holes.test.ts`, `step-table.test.ts`, `workflows.test.ts`).

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS for Tasks 1-6 across the 3 groups the plan had then (commit `85bc656fc`). The challenge round then added Group 4 (Task 7), so this attempt re-checks all 4 groups.
- Per-group reports: `build-plan-verify-1-1.md` and `build-plan-verify-1-2.md` (Tasks 1, 2), `build-plan-verify-2-1.md` (Tasks 3, 4), `build-plan-verify-3-1.md` (CONCERNS, two Task 5 gaps, fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (Tasks 5, 6) and `build-plan-verify-4-1.md` (PASS, Task 7).

## Notes

- This attempt re-checked Tasks 1-6 on the whole tree and checked the Group 4 changes made since holistic attempt 1 (`git diff 85bc656fc HEAD`). Those changes are the `EXIT_NEXT_STEP_REFUSED` constant in `workflows.ts` and `dist/`, the exit-6 route in `bkit-ship.md` with its mirrors and `bkit-ship.none.txt`, § Failure Path in `workflows.md`, two `instructions.md` entries, two tests per test file, and two LOW challenge deferrals.
- TASK 1: the `ship-failure` grep on `step-table.ts`, `steps.ts` and `status-holes.ts` prints nothing, and so does the `Ship Step 13` grep on `branches.ts`. The named tests passed in this run's gate.
- TASK 2: `bkit-ship.md` has no `ship-failure`, `Failure Diagnose` or `Failure Remediate` text, and its headings run Steps 1-12. `git diff --exit-code` on the two shared debug prompts is clean. Their changes since `f6914f3c9` come from merged `dev` work (holistic attempt 1 checked this).
- TASK 3: the `fail` spec declares `next-step`, and `.bkit/core/.bkit/cli.md` lists it. `pnpm bkit:graph:check` reports that `docs/capabilities.md` matches a rebuild at `3081768e7`.
- TASK 4: the `bkit-ship.md — red CI names /bkit-debug` describe still holds six tests. Task 7 renamed one of them to "the Failure Path re-runs workflows fail without --next-step on the --next-step refusal exit", and it now matches `exit 6` instead of `exit 2`. The new contract required that change, and the test checks no less than before. It is not loosened.
- TASK 5: the DONE WHEN grep hits only `.bkit/core/.bkit/workflows.md:1070`, the debug `6 — Failure Diagnose` row. The plan keeps that row (Success Criterion 5), and `build-plan-verify-3-1.md` and `build-plan-verify-3-2.md` judged the same hit. The README row reads `12`.
- TASK 6: the DONE WHEN grep prints nothing, and `docs/deployments.md` has no `Step 14`.
- TASK 7: `failVerb` refuses a bad value with exit 6 before any write. The Failure Path retries only on exit 6, so any other exit 2 keeps `NEXT_STEP` and does not write a second `workflow-failed` row. Both TEST FIRST tests exist and passed.
- Gates run by this verifier: `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `bkit:gate:changed` and exited 0 with verdict PASS. `node dist/cli.js check` exited 0 (no mirror drift). `pnpm tsx .bkit/core/engine/tools/instructions.ts` exited 0. `pnpm bkit:graph:check` exited 0.
- Derived Test Matrix: every row from Tasks 1-4 is named in its task's `DONE WHEN`. The two Task 7 rows (plan lines 138-139) are malformed: the test name sits in the Target file column, and the description column holds an error string. Task 7's `DONE WHEN` states the behaviour both tests check but does not name them. Both tests exist and pass, so the codebase meets the row. This is a wording problem in the plan, not a code gap.
- Plan text the owner may want to correct: the Process Sketch (line 78) and Edge Cases (lines 109 and 111) still say a bad `--next-step` exits 2. Task 7 changed that to exit 6, and the shipped docs and code say 6. The deferral `911-ship-failed-merge-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-408` also says "exits 2"; it describes future hardening and is out of scope.
- Test-first audits: `build-tests-green-4-1.md` is `Enforced: true` with 0 gaps, 0 unproven tests and no `Updated tests` or `Already landed` sections. The audits for Groups 1-3 were decided in the per-group reports and in holistic attempt 1.
- No `build-decision-*.md` records exist for this run.
- Observability: Task 7 adds no logging. The refusal reaches stderr as a `CommandError`, like the verb's other refusals.
- Every `Documentation Updates` row was checked in holistic attempt 1. Group 4 changed only § Failure Path and the `instructions.md` entries, and both name exit 6.
- The advisory Verification Plan and Manual Verification boxes were not run; they block nothing.

## Identified Gaps Log

None
