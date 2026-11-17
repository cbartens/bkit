Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1 is satisfied. `junit.ts` imports only `node:*`, `../../install/manifest.js` and `../../shared/package-manager.js`. `tests.ts` keeps none of the moved definitions and re-exports none of them; it imports `REPORT_ENV`, `countReportFailures`, `runTestFile`, `runToLog` and `JunitCase` from `./junit.js`. `parseJunit` returns `classname` and `file`. `runTestFile` and `reportFailures` are exported. `tests.test.ts` and `test-file-script.integration.test.ts` pass.
- `reportFailures` returns null when a report has no failing cases, and `countReportFailures` still returns 0 for a clean report through the shared `failingCases` helper. That is the behaviour the planned test pins, so no gap.
- The execute step added `.bkit/core/engine/commands/workflow/junit.test.ts` (2 extra tests), which the plan does not list. It passes and is additive, so no gap. It is out of plan scope.
- Test-first audit (`build-tests-green-1-1.md`, `Enforced: true`, 7 gaps, all TASK 1 `delete-still-referenced` with `Fixable: null`): I read every hit. Each one is the moved definition in `junit.ts`, an importer that now takes the symbol from `./junit.js` (`tests.ts:67`, `tests.test.ts`, `junit.test.ts`, `test-file-script.integration.test.ts`), the generated `dist/commands/workflow/junit.js`, or the plan's decision row `docs/decisions.jsonl:685` (`891-junit-reader-and-file-runner-leaf-module`). None refers to a definition still in `tests.ts`, and `tsc --noEmit` passes, so all 7 are no gap. The audit has no `Unproven`, `Updated tests` or `Already landed` section. TASK 1's two tests show `red-not-loaded`, and the audit logs no gap for them.
- Updated existing tests (`tests.test.ts` `parseJunit` `toEqual<JunitCase[]>`, `test-file-script.integration.test.ts` imports) only add fields or move imports. They are additive.
- TASK 2's code is all there: `installCommand({ frozen: true, preferOffline: true })` gives `pnpm install --frozen-lockfile --prefer-offline`, and `install`, `copyListed`, `withCleanup` and `latestRuntimeRow` are exported. It is left off `Tasks` only because its DONE WHEN `pnpm typecheck` fails on the TASK 3 test (see the gaps log).
- TASK 3's logic and output match the plan, and all 5 TEST FIRST tests pass at runtime. The `BLOCKED` line in `build-plan-tasks-1-log.md` does not satisfy the task: `pnpm typecheck` still fails at `counters.test.ts:980` (TS2345), and the group gate `bkit:gate:static-unit` runs that type check.
- Evidence: `vitest run` on 9 files (tests, junit, test-file-script integration, package-manager, counters, decisions, runtime, worktrees, conventions) gave 394/394 passed. `tsc --outDir {scratch}` and `diff -rq` against `dist/` gave no differences, which is the same check `pnpm bkit:check:dist` makes without rebuilding the tree. `tsc --noEmit` is clean. `tsc -p tsconfig.test.json` fails with 1 error.
- Observability: the group adds no new error paths, and `install` keeps its existing failure logging.
- No decision records (`build-decision-*.md`) and no remediation logs were supplied.

## Identified Gaps Log

2 gaps.

TASK 3: `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > adds the group gate's failing tests to each verify round` — line 980 types the map callback as `(x: { gateFailures: number })`, but `LoopProgress.rounds[].gateFailures` is `number | null | undefined` as the task requires, so `pnpm typecheck` (`tsc -p tsconfig.test.json`) fails TS2345 and the group gate (`bkit:gate:static-unit` runs `pnpm typecheck`) cannot pass; the runtime assertion passes. Fix: widen the annotation to `{ gateFailures?: number | null }`, no expectation changed — Fixable: true
TASK 2: DONE WHEN `pnpm typecheck` passes is not met — it fails on the TASK 3 test annotation at `.bkit/core/engine/commands/workflow/counters.test.ts:980` (TS2345); TASK 2's own code type-checks (`tsc --noEmit` is clean), so the TASK 3 fix closes this too — Fixable: true
