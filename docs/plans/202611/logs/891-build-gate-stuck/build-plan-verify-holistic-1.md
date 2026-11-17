Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups; group 1 holds Tasks 1, 2, 3 and 14).

## Integration Gaps

0 integration gaps. Checked across groups:

- Group 1 → 2: `tests-base.ts` reads the gate's cases through `reportFailures` / `countReportFailures` in `junit.ts` (the same reader the gate's `test-run` row counts with), and uses `install(…, { preferOffline: true })`, `copyListed`, `withCleanup` and `latestRuntimeRow` as Task 2 exported them. `tests.ts` registers `base: testsBaseVerb`; `tests-base.ts` imports neither `tests.ts` nor `runs.ts` statically (`shipGate` comes through `await import("./runs.js")`).
- Group 1 → 3: `LOOPS.verify.gate = "build-group-gate"` feeds `loopProgress(…, gate)`, which reads `test-run` rows for step `build-group-gate-{group}` at the verify round's attempt, matching the row shape `tests run --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}` writes (status.jsonl rows 256, 287).
- Group 2 → 3: `decisions compose --base-check` validates exactly the fields `tests base` writes (`verdict`, `reason`, `base`, `source`, `failing`, `baseRed`, `adopt`); `decisions.ts` imports nothing from `tests-base.ts`.
- Group 3 → 4: the workflow's `GATE_LOG` (`{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`, `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`) matches the `--log` the Step 8 and Step 12 `tests run` calls write, and `{log}.reports` is the folder `freshReportDir` creates. `--header=Gate=FAIL` → `openDecision.gate` (`field("Gate")`) → the Resume bullet's `OPEN_GATE` → `decisions apply --by=rerun`, whose `^Gate:[ \t]*FAIL` check matches the composed header. Step 8 sub-step 11 and Step 12 sub-step 4 route a still-red re-run to the pause after the `counters route` block, so `PAUSE_MAX` is set on a fresh-session resume.
- Group 4 → 5: `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `.bkit/cli.md` and the host mirrors carry the new contract; `bkit check` exits 0 with no drift and `pnpm bkit:check:dist` exits 0.
- Full feature: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` → verdict PASS, exit 0 (affected unit tier 65 files / 3600 tests passed; `bkit:gate:changed` 230 files, 9284 passed, 2 skipped; bats 13 passed). No `bkit-base-*` worktree is left registered afterwards.

## Previously Attempted

None for the holistic scope (this is holistic attempt 1). Group reports read: `build-plan-verify-1-1.md` (CONCERNS), `-1-2.md` and `-1-3.md` (PASS, Tasks 1, 2, 3, 14), `-2-1.md` (CONCERNS), `-2-2.md` (PASS, Tasks 4-6), `-3-1.md` (CONCERNS), `-3-2.md` (PASS, Tasks 7-9), `-4-1.md` (PASS, Tasks 10-12), `-5-1.md` (PASS, Task 13).

## Notes

- All 14 tasks satisfy their `DONE WHEN` in the codebase: every `TEST FIRST` test name exists in its planned file, the moved JUnit definitions live only in `junit.ts` (`tests.ts` imports them and re-exports none), `parseJunit` returns `classname` and `file`, `installCommand` appends `--prefer-offline`, the four helpers are exported, `counters.test.ts` line types `{ gateFailures?: number | null }` (Task 14), `decisions apply --by=rerun` and `openDecision.gate` exist, the workflow and prompt hold the planned routes and rule, and the docs rows are done (`docs/testing.md` names both `tests-base` files, `.bkit/cli.md` lists `base`, the "Add an exception mechanism" sentence is gone, the `891-*` decision and deferral rows exist).
- Tasks 1, 3 and 14 are still `[ ]` in the plan although `build-plan-verify-1-2.md` and `-1-3.md` named them on `Tasks`; this report names them again so the workflow ticks them.
- Decision record `build-decision-1-1.md` Q2 (`Decision: Accept — Yes`, the owner's acceptance) accepted the Task 2 `pnpm typecheck` gap as closed by the Task 3 fix; Task 14 then closed it, and typecheck now passes in the gate.
- No test-first audit report was supplied, so step 8 had nothing to decide.
- Observations, not gaps: `tests/fixtures/gates/pnpm.cjs` passes the extra arguments as `sh -c` positional parameters (`"$1"`), not appended to the script text as `pnpm` does; the fixture scripts read them that way and every `useGateRunner` suite passes. `reportFailures` also returns null when reports exist but hold no failing case; `tests base` tells the two apart through `countReportFailures`, so a red gate with 0 cases still reads `gate red with no failing test case`.
- The supplied `tmp/bkit-diff-891-build-gate-stuck.md` is a partial diff coverage file (20 largest files); the engine, workflow and fixture changes were read from `git diff da97be38..HEAD` directly.

## Identified Gaps Log

None

