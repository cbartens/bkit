Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8
Loosened: none
Fingerprint: 6652f5c034122044357966b04fbae46ecd842f63d304680fa279b9fbd513d566
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups).

## Integration Gaps

0. The groups fit together:

- Group 1 → Group 2: the engine's 12-step ship table (`step-table.ts`, `steps.ts`, `status-holes.ts`) matches the `bkit-ship.md` headings, which run Steps 1-12 (lines 127-879).
- Group 2 → Groups 4-5 contract: `failVerb` refuses a malformed `--next-step` with `EXIT_NEXT_STEP_REFUSED` = 6 (`.bkit/core/engine/commands/workflow/workflows.ts:400`, thrown at line 412 before `failState`). Since Task 8, the `next-step` FlagSpec carries `placeholderExit: EXIT_NEXT_STEP_REFUSED` (line 2252), and `refuseUnsubstituted` in `.bkit/core/engine/commands/lib.ts` throws `spec.placeholderExit ?? EXIT.USAGE`. An unsubstituted `{NEXT_STEP}` or `/bkit-debug {FID}` therefore also exits 6, before any write. The `bkit-ship.md` Failure Path step 1 (line 101) retries without `--next-step` only on exit 6. Every other flag's placeholder still exits 2 and falls to the `Lock removal failed` line, which is the pre-change behaviour.
- Argument order holds up: in the Failure Path fence, `--pr={PR_NUMBER}` comes before `--next-step` and `--session-dir` after it. If both `--next-step` and `--session-dir` carried placeholders, the first call exits 6, the retry drops `--next-step`, and the second call exits 2 on `--session-dir`, which is the same result as a run with no `NEXT_STEP`.
- Group 3 → Groups 4-5 docs: § Failure Path in `.bkit/core/.bkit/workflows.md:802`, its mirror `.bkit/workflows.md`, both `.bkit/instructions.md` entries, the `exitCodes` text and `dist/` all describe exit 6 as covering both the shape refusal and the placeholder case.
- Every `NEXT_STEP` that `bkit-ship.md` holds is `/bkit-debug {FID}`, and the Merge Question's `Try again` clears it and `Stop` names it, as holistic attempt 2 recorded. Group 5 changed only line 101 of `bkit-ship.md`.
- The changed-tests gate passed across the whole branch (see Notes).

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS for Tasks 1-6 across the 3 groups the plan had then.
- `build-plan-verify-holistic-2.md`: PASS for Tasks 1-7 across 4 groups (commit `7607e6439`). Challenge round 2 then added Group 5 (Task 8), so this attempt re-checks all 5 groups.
- Per-group reports: `build-plan-verify-1-1.md`, `build-plan-verify-1-2.md` (Tasks 1, 2), `build-plan-verify-2-1.md` (Tasks 3, 4), `build-plan-verify-3-1.md` (CONCERNS, fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (Tasks 5, 6), `build-plan-verify-4-1.md` (Task 7) and `build-plan-verify-5-1.md` (Task 8).

## Notes

- This attempt checked Tasks 1-8 again on the whole tree. It also read the changes since holistic attempt 2 (`git diff 7607e6439..HEAD`, excluding `docs/plans`). Those changes are 16 files: `placeholderExit` in `lib.ts`, the `next-step` spec and `exitCodes` text in `workflows.ts`, one new test in `workflows.test.ts`, the exit-6 wording in `bkit-ship.md:101`, § Failure Path, two `instructions.md` entries, the host mirrors, `bkit-ship.none.txt`, `.bkit/version` and `dist/`.
- DONE WHEN greps were run with `git grep`. The shell's `grep` is ugrep here, and on the backtick alternation in Task 6's pattern it reported a false hit at `.bkit/instructions.md:9596`. `git grep` exits 1 (no match) on the same pattern.
  - TASK 1: no `ship-failure` in `step-table.ts`, `steps.ts` or `status-holes.ts`, and no `Ship Step 13` in `branches.ts`.
  - TASK 2: no `ship-failure`, `Failure Diagnose` or `Failure Remediate` in `bkit-ship.md`. The headings run Steps 1-12. `git diff --exit-code` on the two shared debug prompts is clean.
  - TASK 3: the `fail` spec declares `next-step`, and `.bkit/core/.bkit/cli.md:396` lists it.
  - TASK 4: all six `bkit-ship.md — red CI names /bkit-debug` tests exist.
  - TASK 5: the grep's only hit is `.bkit/core/.bkit/workflows.md:1070`, the debug `6 — Failure Diagnose` row. The plan keeps that row (Success Criterion 5), and earlier reports judged the same hit. Every `Step 1[34]` hit names a build step. The README row reads `12`, and § Failure Path names `[--next-step=]`.
  - TASK 6: the grep prints nothing, and `docs/deployments.md` has no `Step 14`. The three `utility-pre-release-check` copies hold the same example line.
  - TASK 7: exit 6 is used only for the `--next-step` refusal. The Failure Path retries only on exit 6.
  - TASK 8: `placeholderExit` is set only on `next-step`. The `lib.test.ts` cases `refuses a literal workflow placeholder in %j (exit 2)` and `refuses a placeholder in a positional argument` still assert exit 2 for other flags.
- All 17 planned `TEST FIRST` tests across Tasks 1-8 exist under their planned names. Each was found by an exact-name `git grep` over the test files.
- Gates run by this verifier:
  - `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `bkit:gate:changed` over 1111 changed files: exit 0, verdict PASS.
  - `node dist/cli.js check` exited 0.
  - `pnpm tsx .bkit/core/engine/tools/instructions.ts` exited 0.
  - `pnpm bkit:graph:check` exited 0 (`docs/capabilities.md` matches a rebuild at `35b0e2868`).
- Test-first audits: `build-tests-green-5-1.md` is `Enforced: true` with 0 gaps and 0 unproven tests. It has no `Updated tests` or `Already landed` section. Groups 1-4 were decided in earlier reports.
- Plan-text drift (the caller asked whether it matters now): it is not a code gap, and this report does not log it. The plan's own wording is still out of date, and the owner may want to correct it before ship archives the plan:
  - The Process Sketch (line 78) and Edge Cases (lines 109 and 111) still say a bad `--next-step` exits 2. Tasks 7 and 8 changed that to exit 6, which now also covers an unsubstituted placeholder. The code, the shipped docs and the tests all say 6.
  - Manual Verification Step 3 (line 676) still expects `--next-step="git push"` to exit 2. An owner who runs that advisory check will see exit 6 and could read it as a regression. This is now the most practical effect of the drift.
  - The Derived Test Matrix rows for Task 7 (lines 138-139) are malformed. A test name sits in the Target file column, and the description column holds an error string. The Task 8 row (line 140) is well formed.
  - None of the three rows (lines 138-140) names its test in a `DONE WHEN`. The `DONE WHEN` of Tasks 7 and 8 state the behaviour those tests check, the tests are named in `TEST FIRST`, and each was proved red and now passes.
  - This report does not log these as gaps because the only fix is to edit the plan, which a verifier may not do and a code fix round cannot do.
- No `build-decision-*.md` records exist for this run.
- Observability: no task adds an error-logging path. The refusals reach stderr as a `CommandError`, like the verb's other refusals.
- Every `Documentation Updates` row was checked in holistic attempts 1 and 2. Groups 4-5 changed only § Failure Path and the `instructions.md` entries, and both describe exit 6.
- The advisory Verification Plan and Manual Verification boxes were not run. They block nothing.

## Identified Gaps Log

None
