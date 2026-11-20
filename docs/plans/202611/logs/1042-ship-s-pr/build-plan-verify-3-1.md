Verdict: PASS
Failures: 0
Fixable: false
Tasks: 9
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

None

## Notes

- TASK 9 satisfied. `gateMerged` in `.bkit/core/engine/commands/workflow/workflows.ts` runs after the leftover-tip merge commit and before the branch push in `closePr`, picking the gate the way `checkLanding` in `.bkit/core/engine/commands/land.ts:187` does (`minPushOutside` → `bkit:gate:min`, else `requiredPushGate`) and running it through `runPushGate`. A failing gate, an undeclared `bkit:gate:min` (`runPushGate` returns exit 2) or a missing full gate returns `{ failed }` before the push; the failing-gate reason names the branch and the gate, and the callers' existing PR-failure paths give exit 10 (flush) or 11 (close). `dir` is the `_land-{FID}` checkout `pushToDev` already prepared and gated, so no second `prepareLandInputs` is needed.
- The `.bkit/core/.bkit/workflows.md` § One landing routine for every dev write line 126 already says "Missing gates, failed checks and a changed landing tree stop the push"; both PR-fallback lines now add "gated by the landing gate before the branch push", and `.bkit/workflows.md` carries the same render. `docs/security.md` § Supply-Chain (GitHub Actions) gains the `[skip ci]` paragraph. `dist/commands/workflow/workflows.js` matches the source change.
- Derived Test Matrix row (plan line 98) maps to TASK 9's TEST FIRST test, which exists and passes: `pnpm exec vitest run .bkit/core/engine/commands/workflow/workflows.test.ts -t leftover` → 6 passed, 226 skipped.
- Test-first audit (`build-tests-green-3-1.md`): Enforced true, Gaps 0, Unproven 0. Changed by a code step: TASK 1 `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" — reason: the test never wrote the ship FAILED record, so the flush skipped with nothing to commit; the added lines only write the record row (setup), assertions unchanged → no gap; the owner answers it at the end of the build.
- `docs/security.md` is not on the brief's Deviations list of changeable files, but TASK 9's DONE WHEN names it, so the edit is in scope.
- Advisory, not a gap: unlike `checkLanding`, `gateMerged` does not re-check that the gate left HEAD and the tree unchanged, and it passes a no-op log so `runPushGate`'s "must declare a non-empty" line is dropped (the reason reads `failed (exit 2)`). Neither is in the DONE WHEN; the push sends the committed HEAD.
- No decision records or earlier verify / remediation reports for group 3 were supplied. `docs/observability.md` and `docs/testing.md` are present.

## Identified Gaps Log

None
