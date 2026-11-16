Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none
Fingerprint: 594e7676f81defdf7e1f0b3ee44b8867e7a949a55b61fb465d763cc3e8a0a97c
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 plan groups verified.

## Integration Gaps

2 integration gaps, both docs that Group 2 maintains and Group 3's changes made stale (see the gaps log):

- `docs/testing.md:821` (the `workflow-shape.test.ts` row) still says debug on dev carries `{BASE_FLAG}` on every `branches scan-diff` line. Since TASK 7 the no-leak scan line carries `{NOLEAK_BASE}`, and the test filters that line out of the `{BASE_FLAG}` check. The row also leaves out the two new shapes the test asserts (TASK 7's `--base=origin/dev` publishing-guard scans, TASK 9's ship `context diff` lines).
- The Diff per reader row (`.bkit/core/.bkit/workflows.md:259`, rendered `.bkit/workflows.md:259`) names only debug's `{BASE_FLAG}`. Since TASK 9, ship Step 5 and the ship Failure Path pass `--base=origin/dev`, which the test's `BASE_FLAG` table (`ship: " --base=origin/dev"`) already encodes.

Checked and consistent across groups:

- TASK 8's `featureBase` change (`feature-base.ts:21`, local `dev` meeting point equal to `HEAD` → `origin/dev` meeting point) feeds Group 1's `context diff`, `challenge gate`, `scan-diff` defaults and `cleanBase` through the same helper, so the holistic test base can no longer collapse to HEAD either.
- TASK 7 reverses TASK 4's "no `--base=origin/dev` in build" for the migration scan only. `local-gate-audit.test.ts` now allows exactly one `--base=origin/dev` line, the migration scan, and the verify prompt's `Test base` line still names the start commit. Decision record `build-decision-1-1.md` (Q1 `Fix now`, option a) directs this.
- Debug: `{BASE_FLAG}` (empty off dev) still drives every `context diff` and the non-marker `scan-diff` lines onto `featureBase`; `{NOLEAK_BASE}` gives the no-leak scan `--base={startSha}` in place on dev and `--base=origin/dev` off dev.
- The challenge size gate, the security challenge diff and the holistic test base stay on `featureBase`, as TASK 7's DONE WHEN requires; TASK 2's `scan-diff without --base ignores a match that only an unpushed local dev commit adds` is unchanged and green.
- `node dist/cli.js tests changed --base=54774f2c8b2230c67a5fd2817ce66ea40f71434b --fallback=bkit:gate:static-unit` exits 0, verdict PASS through `bkit:gate:changed`: related stage 68 files (3973 passed, 2 skipped), named stage 148 files (8313 passed, 2 skipped), every stage passed.
- `node dist/cli.js check` exits 0 (rendered host mirrors in step with the sources).

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 2 gaps, fixed by `build-plan-gaps-remediate-1-1-log.md`. `build-plan-verify-1-2.md`: PASS, `Tasks: 1, 2, 3`.
- `build-plan-verify-2-1.md`: CONCERNS, 3 gaps, fixed by `build-plan-gaps-remediate-2-1-log.md`. `build-plan-verify-2-2.md`: PASS, `Tasks: 4, 5, 6`.
- `build-plan-verify-holistic-1-1.md`: CONCERNS, 1 gap (`docs/testing.md:821` named the removed `{DIFF_BASE}`), fixed by `build-plan-gaps-remediate-holistic-1-1-log.md` in `54774f2c8`. `build-plan-verify-holistic-1-2.md`: PASS, `Tasks: 1, 2, 3, 4, 5, 6`.
- Challenge round 1 then added Group 3 (TASKS 7-9) through `build-decision-1-1.md`. `build-plan-verify-3-1.md`: CONCERNS, 1 gap (catalog source did not name the scan bases), fixed by `build-plan-gaps-remediate-3-1-log.md`. `build-plan-verify-3-2.md`: PASS, `Tasks: 7, 8, 9`.

## Notes

- Mode: Holistic, attempt 3, against HEAD `19c554472`. Since the `Test base` the branch changed only Group 3's work and run logs: `feature-base.ts`, `dist/commands/workflow/feature-base.js`, three workflow sources and their host mirrors and snapshots, both `workflows.md` copies, `.bkit/instructions.md`, two tests files plus two new tests, and ledger rows (two LOW challenge deferrals, one friction row).
- TASKS 1-6: unchanged since `build-plan-verify-holistic-1-2.md` (PASS); their tests ran green again in the named stage (`context.test.ts`, `feature-base.test.ts`, `challenge.test.ts`, `branches.test.ts`, `status.test.ts`, `tasks.test.ts`, `local-gate-audit.test.ts`, `workflow-shape.test.ts`). TASK 5's `git grep -n "origin/dev\.\.\.HEAD" -- '.bkit/**/*.md'` still returns nothing.
- TASK 7 is satisfied: `bkit-build.md` Step 16 passes `--base=origin/dev` to the migration scan; `bkit-debug.md` Step 11's no-leak scan takes `{NOLEAK_BASE}` (defined in Step 2); both `workflows.md` copies name each scan's base.
- TASK 8 is satisfied: `featureBase` returns the `origin/dev` meeting point when the local `dev` meeting point equals `git rev-parse HEAD`; both named tests pass.
- TASK 9 is satisfied: both ship `context diff` lines (`abort-handover`, `ship-deferred-sweep`) pass `--base=origin/dev`; the named test passes.
- Decision record `build-decision-1-1.md`: Q1 and Q2 `Fix now` (the owner's answer, not assumed) send TASK 7 and TASK 9 into Group 3 and direct the change to TASK 4's audit test.
- Test-first audit `build-tests-green-3-2.md` (read for context, not supplied as an input): `Enforced: true`, `Verdict: PASS`, 0 gaps, nothing `Unproven`, `Updated tests` or `Already landed`.
- Derived Test Matrix: rows for TASKS 1-6 are covered by those tasks' `DONE WHEN`. The four challenge rows (TASKS 7, 8, 9) name their tests in `TEST FIRST`, not `DONE WHEN`; each `DONE WHEN` states exactly the behaviour its test asserts, the audit proved each test red then green, and each passes. Observation, not a gap. The plan has no `Documentation Updates` section.
- Observability: `docs/observability.md` and `docs/testing.md` are present and the `.agents/docs.md` index was loaded. TASK 8 adds no error path. As earlier rounds noted, `cleanBase` passes no log to `featureBase`, so its conflict-fallback line is dropped on the holistic path; the plan does not require it.
- Observation, not a gap: the `local-gate-audit.test.ts` test name "build workflow and verify prompt name no origin/dev diff or test base" no longer fully describes its body, which now allows one `--base=origin/dev` line.
- Observation, not a gap: debug Step 2 still holds `startSha` as `START_SHA` with no later `{START_SHA}` use.

## Identified Gaps Log

2 gaps.

INTEGRATION: TASK 7 (Group 3) moved debug's no-leak `branches scan-diff` line onto `{NOLEAK_BASE}`, but the `workflow-shape.test.ts` row in `docs/testing.md:821`, reworded for TASK 6 (Group 2), still says debug on dev has "`{BASE_FLAG}` on every `context diff` and `branches scan-diff` line"; the row also does not name the new build migration scan / debug off-dev no-leak `--base=origin/dev` shape (TASK 7) or the ship sweep `--base=origin/dev` shape (TASK 9) the test now asserts — Fixable: true
INTEGRATION: TASK 9 (Group 3) made ship's Step 5 and Failure Path `context diff` lines pass `--base=origin/dev`, but the Diff per reader row that TASK 5 / TASK 6 (Group 2) maintain (`.bkit/core/.bkit/workflows.md:259`, rendered `.bkit/workflows.md:259`) names only debug's `{BASE_FLAG}`, so it reads as if ship's diff uses the default feature base — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** workflow-shape.test.ts row in docs/testing.md still says {BASE_FLAG} is on every debug branches scan-diff line after TASK 7 moved the no-leak scan to {NOLEAK_BASE}
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/testing.md:821` · **Round:** 1
  - **DONE WHEN:** The workflow-shape.test.ts row in docs/testing.md says the debug no-leak scan takes {NOLEAK_BASE} (--base={startSha} in place on dev, else --base=origin/dev) while the other context diff and branches scan-diff lines take {BASE_FLAG}, and names the build migration scan and ship context diff lines passing --base=origin/dev
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Diff per reader row names only debug {BASE_FLAG}; ship Step 5 and Failure Path now pass --base=origin/dev (TASK 9)
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:259` · **Round:** 1
  - **DONE WHEN:** The Diff per reader row in .bkit/core/.bkit/workflows.md and .bkit/workflows.md says ship Step 5 and the ship Failure Path pass --base=origin/dev, and the two copies stay identical apart from the managed marker
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts
<!-- bkit:task 2 end -->
