Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 4
Loosened: none

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

- Judged against `build-diff-2-1.md` (commits `f0fdf5181` plan-tests and `39338684b` plan-execute). The brief `build-brief-2-1.md` has no `Deviations` section. No earlier group 2 verify report or remediation log exists. `build-decision-1-1.md` and `build-decision-1-2.md` cover group 1 only, so no decision record accepts a group 2 gap.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` sections. The 8 TASK 4 tests read `red-not-loaded`, because the module did not exist yet; all 22 planned tests pass.
- TASK 4 is satisfied. `caseFile` and `baseVerdict` are exported from `tests-base.ts`, the file has no import of `tests.ts`, `tests-base.test.ts` passes (8/8) and `pnpm bkit:check:dist` exits 0.
- TASK 5 is not satisfied. Everything else in its DONE WHEN holds: `base` is listed in `.bkit/core/.bkit/cli.md`, `cli-doc.test.ts` passes, `runs.ts` is reached only through `await import`, `tests-base.test.ts` imports `./tests-base` first, the integration suite passes (14/14), `git worktree list` shows no `bkit-base-*` entry, and the dist check is clean. The one miss is `pnpm test`, which also covers `*.integration.test.ts`: it fails 1 of 9296, and the failure comes from the new `readRows` in `tests-base.ts`. Every `useGateRunner` suite passes with the argument-forwarding `pnpm.cjs`.
- TASK 6 meets its DONE WHEN: no static `runs.ts` import, both test files pass, no leftover worktree, dist clean. It is still left off `Tasks`, because the planned `shipGate(…, gh, log)` call passes a no-op log, so CI refusals and gh errors go unlogged (mandatory observability check).
- The `conventions.test.ts` `HELPER_SOURCES` entry for `tests-base.ts` fixes a test the new module would otherwise break. It is within scope.
- Every group 2 row of the Derived Test Matrix (plan lines 146-165) maps to a TEST FIRST test in the DONE WHEN of task 4, 5 or 6.

## Identified Gaps Log

2 gaps.

TASK 6: `.bkit/core/engine/commands/workflow/tests-base.ts` `testsBaseVerb` passes `() => undefined` as the `shipGate` log sink instead of the planned `log` (`ctx.log`), so a gh API error, an unresolvable run or any other CI refusal at the base sha is dropped with no `[bkit-tests]` stderr line before the fallback to the local run; pass `ctx.log` per docs/observability.md § Log Format — Fixable: true
TASK 5: `pnpm test` fails 1 of 9296: `.bkit/core/engine/audits/repo/json-parse-owner.test.ts` `JSON.parse inside a try statement belongs to shared/json.ts > no engine source parses JSON inside its own try` reports `.bkit/core/engine/commands/workflow/tests-base.ts:116` (`readRows` calls `JSON.parse` in its own try); the DONE WHEN needs `pnpm test` green, so parse each status row through `parseJson` in `.bkit/core/engine/shared/json.ts` — Fixable: true
