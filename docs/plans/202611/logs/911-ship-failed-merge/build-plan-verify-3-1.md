Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: 75cda697d31105b6a969a59d88e5f1a0534de1e6281df5f4a273114551bbbe63
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 6 is satisfied. Its DONE WHEN grep across the nine files prints nothing; `docs/deployments.md` holds no `Step 14`; `docs/testing.md` says "canonical 12 step keys" and drops Failure Remediate from the pre-merge push list; both `pre-push` files and `docs/setup.md` say `— 12 steps`; `pnpm tsx .bkit/core/engine/cli.ts check` exits 0 with no drift; `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes (24/24).
- The `utility-pre-release-check` example: the agent wrote "debug remediate must read `debug-failure-remediate`, not bare `failure-remediate`" in `.bkit/instructions.md` and the three hand-authored copies, byte-identical in all four. It mirrors the old ship example one-for-one, names a real debug step key, and keeps the rule's point (the read-back must name the phase-prefixed step key). It meets the task's intent and DONE WHEN; the brief's suggested wording was not needed.
- TASK 5 is not satisfied: two ship-step sentences in `.bkit/core/.bkit/workflows.md` (lines 219 and 300) were missed. Everything else holds: the README row says 12; prompts.md and templates.md are fixed; § Failure Path at line 802 carries `[--next-step=]`, and so does the `failure-path` local entry in `.bkit/instructions.md` (line 9803); the `Ship merge loop` row, the resume bullet and the "do not enter CI diagnosis" sentence are gone; `ship.merge` Asks names only the used-up allowance; `pnpm tsx .bkit/core/engine/tools/instructions.ts` exits 0; the `.bkit/` mirrors match their sources except for the managed-marker line.
- The Task 5 DONE WHEN grep's `Failure Diagnose` term still hits `.bkit/core/.bkit/workflows.md:1070`, the debug `6 — Failure Diagnose` row. That is a legitimate debug step that this plan keeps (Success Criterion 5), so it is not a gap; the pattern is broader than the plan's intent.
- The `build-plan-current.md` concern (the `Ship merge loop` row cited at line 1673 had moved to 1675) is moot: the row is deleted, and `grep -n 'Ship merge loop'` prints nothing.
- Test-first audit `build-tests-green-3-1.md`: `Enforced: true`, 0 gaps, 0 unproven. Both tasks are `TEST FIRST: n/a` (docs only).
- No decision records exist for this run. The removal of the shared clauses `workflow-try-again-return` and `workflow-round-read-back` (commit b2b7b0ab5) had owner approval and is not a gap.

## Identified Gaps Log

2 gaps.

- TASK 5: `.bkit/core/.bkit/workflows.md:219` — the Branch placement paragraph still says ship's "post-merge rows land with the Step 14 close commit"; the ship close is now Step 12. The `Documentation Updates` row lists line 219 for renumbering, and the DONE WHEN check "every remaining hit of `grep -n 'Step 1[34]'` names a build or debug step" fails on this line. Fix: "Step 14 close commit" → "Step 12 close commit", then re-run `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `.bkit/workflows.md` follows. — Fixable: true
- TASK 5: `.bkit/core/.bkit/workflows.md:300` — the `owner-pause` row still describes the ship `merge` reason as "merge fix round". The `Documentation Updates` row requires the `merge` owner-pause reason to name only the used-up limit, because the fix round left with Steps 11-12 and the Merge Question now asks only when the merge attempts are used up. Fix: reword to e.g. "`assumed` / `merge` (ship Confirm Assumed Items, Merge Question on a used-up merge limit)", then re-run upgrade. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 5: ship Step 14 close-commit citation not renumbered
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:219` · **Round:** 1
  - **DONE WHEN:** grep -n "Step 1[34]" .bkit/core/.bkit/workflows.md names only build or debug steps (line 219 reads Step 12 close commit), and .bkit/workflows.md is re-rendered by upgrade
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 5: owner-pause merge reason still says merge fix round
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:300` · **Round:** 1
  - **DONE WHEN:** the owner-pause row names the ship merge reason as the Merge Question on a used-up merge limit, with no merge fix round wording, and .bkit/workflows.md is re-rendered by upgrade
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
