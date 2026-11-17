Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL — the failures are localised to two named tests timing out under measured machine load with no failed assertion, and the remediation (re-run on a quieter machine) is concrete; no instrument-fix-reverify loop is needed.

## CI Run

None — `gh run list --branch feat/901-challenge-merge-breaks --limit 5` returned `[]` (control: `gh run list --limit 2` returned 2 runs, so the read works). The failing gate is the local `build-run-tests` run (`source: "local"` in `status.jsonl`).

## Prior Attempts Reviewed

None — `Strategy` = `STANDARD`, first diagnose attempt for this build run.

## Prior Knowledge

local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-heavy integration suites (`bkit-upgrade` named) time out under full parallel load on a busy laptop and pass alone; not a code regression — applied as the primary classification of both timeouts and as the isolation re-run probe.
spawn-heavy-unit-suite-needs-its-own-budget-under-load: `loadFactor()` = `loadAverage / cores` floored at 1 under-estimates contention, so the scaled budget is inert when it is needed — applied as the design-fragility explanation of the 42000 ms limit.
docs/failures.jsonl `tracker-boundary-fault-matrix-concurrency-timeout` (status OPEN): the same tracker test `preserves substantive step results under every comment boundary fault` already exceeded its budget under concurrent load in run 826 — applied as a prior occurrence of failure 2.
docs/failures.jsonl `install-upgrade-integration-tests-flake-on-default-5s-timeout` (no status): `upgrade.integration.test.ts` named in the same load-timeout class — applied as a prior occurrence of the failure-1 file.
Decision record `build-decision-1-2.md` Q2: `Decision: Accept — Yes, accept both` — the owner already accepted the tracker test timeout under load as a load-related flake in this run; applied as binding for failure 2.

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN)
- #481 — Flake triage (OPEN)
- #921 — Machine wide test lock despite low CPU usage (OPEN)

## Failures

Gate `pnpm bkit:gate:static-unit-integration` exited 1 (`Test Files  2 failed | 54 passed (56)`, `Tests  2 failed | 1928 passed (1930)`). Static checks, unit coverage, bats and awake all passed; both failures are in the integration run.

1. `.bkit/core/engine/commands/install/upgrade.integration.test.ts:702` `#489 — managed-version marker on every file bkit writes > check flags an old marker; upgrade restamps every marker with no conflict; check is then clean` — `Error: Test timed out in 42000ms.` (reported 53543ms).
2. `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:653` `workflow comment lifecycle across real CLI processes > preserves substantive step results under every comment boundary fault` — `Error: Test timed out in 42000ms.` (reported 61623ms).

Relationship: same error, same limit (30000 ms integration base x1.40 sampled at file start, raw log line 3415), same run window, no assertion failure in either. Both test files ran about 2x slower end to end than in the 892 run (`upgrade.integration.test.ts` 438766ms vs 238518ms; `tracker.integration.test.ts` 208271ms vs 130852ms). Neither file is touched or imported by this branch. The committed artifact `run-tests-1.md` is clamped (kept 3094 of 20516 lines); the dropped part was read from the raw log `/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/901-challenge-merge-breaks/run-tests-1.log` only for the lines quoted here.

## Root Cause

**Failure 1 — `upgrade.integration.test.ts:702` restamp test timed out**

- Proximate cause: the test's wall time (53543ms) passed the 42000 ms limit. The limit is the 30000 ms integration base times x1.40, the factor sampled from a 5.0 load average when the file started (raw log line 3415). The machine got much busier during the run: `uptime` at 16:14, three minutes after the run ended, read `load averages: 39.63 22.84 19.61` on 10 cores. Every test in the file slowed by about the same ratio, passing ones included (`an install with every host and cloud lane ...` 16657ms in the 892 run vs 32688ms here).
- Design fragility: the test chains four full CLI subprocesses (`install`, `check`, `upgrade --auto-apply`, `check`) under one shared per-file limit. Its idle cost grows with every file bkit installs (6468ms → 17826ms → 28476ms across the 715, 719 and 892 runs), so it now needs most of the unscaled 30000 ms base on its own.
- Contributing factors: the limit is sampled once per file from the 1-minute load average (`vitest.setup.ts:98`), and this 438766ms file never sees a later load rise. Other agents' work outside the `tests` lock (app-gether-life worktrees `1100-scrapfly-serpapi-places`, `1337-bubble-filter-words`, `1181-mcp-alert-signals`) was active in the same window. Absent from the cause: this branch's diff changes no install, upgrade, render or marker code, only two-line wording in five prompts plus `tests.ts`.

**Failure 2 — `tracker.integration.test.ts:653` comment boundary fault matrix timed out**

- Proximate cause: same 42000 ms limit from the same sample; the test took 61623ms against 35832ms (892) and 21459ms (719). Its sibling `keeps clean build progress and completion to two comments` went 10274ms → 32715ms in the same file.
- Design fragility: the matrix runs many real CLI processes in one test; recorded as OPEN `tracker-boundary-fault-matrix-concurrency-timeout` with an unresolved cause.
- Contributing factors: same per-file sampling and outside load as failure 1. The owner already accepted this exact test's load timeout in `build-decision-1-2.md` Q2.

Confidence cap: the per-second load during 16:04-16:11 was not recorded; the contention is inferred from the 15-minute average just after the run, the uniform slowdown and the concurrent outbox writes, not measured inside the window.

## Rot Signals

tests, reliability

- tests: `upgrade.integration.test.ts` `#489` restamp test chains four full CLI spawns (`install`, `check`, `upgrade --auto-apply`, `check`) in one test under the shared file budget; its duration climbed 6468ms (715) → 17826ms (719) → 28476ms (892) → 53543ms (this run) as the install grew, so it now sits near the 30000 ms integration base even before load scaling.
- reliability: `vitest.setup.ts:98` fixes each file's limit from one load sample at file start (`x1.40` here), while the 15-minute load average over the run window was 19.61 on 10 cores; a long file never sees a load rise, so the local gate fails red on a green tree (open issue #814).

## Recommended Remediation

1. No change to the in-scope files. The plan's work targets (`.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/tests.test.ts`, `.bkit/core/prompts/bkit-plan-generate.md`, `.bkit/core/prompts/bkit-build-plan-convert.md`, `.bkit/trackers.md`) are not on either failing path, and both failures are timeouts with no failed assertion.
2. Re-run the same gate once the machine is quieter: wait until `uptime` shows a 1-minute load average below the core count (10), then re-run `build-run-tests` through the workflow's own `bkit tests run --gate=bkit:gate:static-unit-integration` call. Do not raise either test's limit and do not skip either test in this branch.
3. Treat failure 2 as already accepted: the owner's `Decision: Accept — Yes, accept both` in `build-decision-1-2.md` Q2 covers this exact test timing out under load.
4. **If** the re-run fails again with an assertion (not `Test timed out`) in either file → re-open this diagnosis with that assertion as the anchor; it would refute Hypothesis 1.

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/install/upgrade.integration.test.ts:702` — give the four-spawn restamp test its own load-scaled limit (`it(..., { timeout: tierTimeouts(true).testTimeout * 2 }, ...)` or split the stale-check, upgrade and clean-check phases into separate tests); it is not a work target of this plan and appears only in the failure log.
- `vitest.setup.ts` / `vitest.timeout-budget.ts` — re-sample the load budget per test (for example in a `beforeEach` that calls `vi.setConfig(tierTimeouts(...))`) or read the 5-minute load average, so a long file sees a load rise; tracked by #814, shared test infrastructure outside this plan.
- `docs/failures.jsonl` — add a row for the `#489` restamp test timing out under load (key such as `upgrade-restamp-marker-test-timeout-under-load`), referencing #814; the tracker test already has `tracker-boundary-fault-matrix-concurrency-timeout`.

## Blast Radius

Localised — the recommended remediation changes no file; it is a re-run of the existing gate.

## Suggested Tests

None for this branch: no product behaviour is in question. For the out-of-scope fix under #814, a unit test in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` that a budget re-read after a load rise yields a larger limit than the file-start sample.

## Verification Commands

- `uptime` — confirm the 1-minute load average is below 10 before re-running.
- `pnpm bkit:gate:static-unit-integration` through the workflow's `bkit tests run` step — expect `Test Files  56 passed (56)`.
- Isolation probe used in this diagnosis, if the re-run fails again on either test: `UNIT_PLANNED_LOAD_PER_CORE=6 bash scripts/ci/bkit-machine-lock.sh run --lock tests -- npx vitest run .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/commands/workflow/tracker.integration.test.ts -t "restamps every marker|every comment boundary fault"` — expect both tests to pass, proving the assertions hold once the limit is not the constraint.

## Documentation Warnings

```jsonl
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl load-timeout rows and issue #814 record the known local-load test timeouts.","action":"Record intentional signal downgrades, if any, below the managed block; the registry currently holds no entries."}
```

## Hypotheses

### Hypothesis 1: Both failures are wall-clock timeouts caused by machine contention that grew after the per-file budget was sampled, not by this branch's code

#### Reason

Both failures are `Error: Test timed out in 42000ms.` with no assertion failure. 42000 ms is the 30000 ms integration base (`vitest.timeout-budget.ts` `INTEGRATION_TEST_TIMEOUT_MS`) times the x1.40 factor printed when the integration run started. Prior knowledge (`local-pnpm-test-full-parallelism-integration-timeouts-flake`, `spawn-heavy-unit-suite-needs-its-own-budget-under-load`, failures row `tracker-boundary-fault-matrix-concurrency-timeout`, issue #814) records this exact class.

#### Act

Read the budget line of the integration run in the raw log `/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/901-challenge-merge-breaks/run-tests-1.log`; compared the same tests and sibling tests across four earlier full-gate logs in `.git/bkit-outbox/` (715, 719, 892); read `uptime` right after the run ended; listed outbox files written in the run window.

#### Observe

Raw log line 3415: `[test-timeout-budget] load average 5.0 on 10 cores: unit limits 7000ms per test, 14000ms per hook (x1.40)`.
`uptime` at 16:14 (run ended 16:11:22): `load averages: 39.63 22.84 19.61`.
Same test across runs: 715 `✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 6468ms`; 719 `... 17826ms`; 892 `... 28476ms` (budget line `x2.23`); this run `× ... 53543ms`.
Sibling tests (no failure, same install path) slowed by the same ratio: 892 `✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 16657ms` vs this run `32688ms`; 892 `✓ every written file carries a marker at the installing version, and check derives the same set 5626ms` vs this run `12904ms`; 892 `✓ keeps clean build progress and completion to two comments 10274ms` vs this run `32715ms`.
Whole integration run: 892 `Duration  239.13s` vs this run `Duration  439.24s (tests 100%)`.
Tracker test: 892 `✓ preserves substantive step results under every comment boundary fault 35832ms`; 719 `21459ms`; this run `× ... 61623ms`.
Concurrent work in the window: `/Users/christian/Documents/GitHub/app-gether-life/.git/bkit-outbox/1100-scrapfly-serpapi-places/close-out.txt` 16:09:15, `.../1337-bubble-filter-words/stderr.log` 16:06:06, and `ps` showed app-gether-life `1181-mcp-alert-signals` node processes at 91% / 77.5% / 64% CPU outside the tests lock.

#### Result

CONFIRMED — every test in the run, passing ones included, ran about 2x to 3x slower than in the 892 run; the 15-minute load average covering the run window was 19.61 on 10 cores while the budget was sized from a 5.0 sample taken at file start.

### Hypothesis 2: This branch's change made the upgrade marker test slower or hang (it re-renders the five edited prompts)

#### Reason

`upgrade.integration.test.ts` `#489` runs a full `bkit install` / `check` / `upgrade` / `check` against a scratch consumer, which renders every prompt, and this branch edits `.bkit/core/prompts/bkit-plan-generate.md`, `bkit-build-plan-convert.md`, `bkit-plan-review-1.md`, `bkit-plan-scope-check.md` and `bkit-plan-update.md`.

#### Act

`git diff --stat f6914f3c9c88e68faa4b8806406c0d562d2d6c7c HEAD -- . ':!docs/plans'`; compared sibling tests in the same `#489` describe that run the same `installEverything()`; read the test body at `.bkit/core/engine/commands/install/upgrade.integration.test.ts:702-743`.

#### Observe

Diff stat: `.bkit/core/prompts/bkit-build-plan-convert.md |   2 +-`, `bkit-plan-generate.md |   2 +-`, `bkit-plan-review-1.md |   2 +-`, `bkit-plan-scope-check.md |   2 +-`, `bkit-plan-update.md |   2 +-`, `.bkit/core/engine/commands/workflow/tests.ts |  26 ++++-`, `dist/commands/workflow/tests.js |  23 +++-`. No install, upgrade, render or marker code changed.
The sibling test that runs the same `installEverything()` passed: `✓ every written file carries a marker at the installing version, and check derives the same set 12904ms`.
The failure is `Error: Test timed out in 42000ms.` at `upgrade.integration.test.ts:702:3`; no `expect` failed before the limit.

#### Result

REFUTED — the branch changes no install, upgrade or marker code, a sibling running the same install passed, and Hypothesis 4's isolation run passed both tests on this branch's tree in 17.61s combined.

### Hypothesis 3: The load-scaled budget is sampled once per file from the 1-minute load average, so a long integration file keeps a limit sized for a quieter moment

#### Reason

The budget printed 5.0 load at integration start, yet the 15-minute load average just after the run was 19.61. `upgrade.integration.test.ts` alone ran 438766ms, far longer than one sample window.

#### Act

Read `vitest.setup.ts:93-98` and `vitest.timeout-budget.ts` (`loadFactor`, `tierTimeouts`).

#### Observe

`vitest.setup.ts`: `// setupFiles run once per test FILE, so \`testPath\` here is that file, and the` / `// re-read lands as each file starts.` and `vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")));`.
`vitest.timeout-budget.ts`: `export const INTEGRATION_TEST_TIMEOUT_MS = 30_000;` and `return Math.min(MAX_LOAD_FACTOR, Math.max(1, measured, Number.isFinite(planned) ? planned : 0));`.
892 run (passed): `[test-timeout-budget] load average 13.3 on 10 cores: unit limits 11150ms per test, 22300ms per hook (x2.23)`, which gave the integration tests a 66900 ms limit; this run got x1.40, so 42000 ms.

#### Result

CONFIRMED — contributing factor, not a cause in this branch: the limit is fixed when each file starts, so a load rise during a 7-minute file is never seen; the same tests passed in the 892 run only because that run started under higher load and got a larger limit.

### Hypothesis 4: Both tests' assertions hold on this branch's tree once the limit is not the constraint

#### Reason

Hypotheses 1 and 2 rest on timing comparisons; a direct run of the two failing tests on this tree separates "slow under load" from "broken".

#### Act

Under the machine-wide `tests` lock (queued behind the `860-move-deterministic-bookkeeping` gate, so no other bkit test run overlapped): `LOCAL_STACK_LOCK_WAIT_S=1200 UNIT_PLANNED_LOAD_PER_CORE=6 bash scripts/ci/bkit-machine-lock.sh run "901 diagnose isolated probe" --lock tests -- sh -c 'uptime; npx vitest run .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/commands/workflow/tracker.integration.test.ts -t "restamps every marker|every comment boundary fault"; echo EXIT=$?; uptime'`. Output saved to `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/e51408ae-6b05-4f5a-8b4c-2427dde89b52/scratchpad/isolated-901-b.log`. A first attempt gave up on the lock after its 60s default wait (`[machine-lock] ❌ 901 diagnose isolated probe gave up after 60s waiting for tests`) and ran nothing.

#### Observe

`16:21  up 2 days,  8:24, 1 user, load averages: 8.33 17.76 19.19`
`[test-timeout-budget] load average 8.3 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)`
` Test Files  2 passed (2)`
`      Tests  2 passed | 84 skipped (86)`
`   Duration  17.61s (tests 99%)`
`EXIT=0`

#### Result

CONFIRMED — both tests pass on this branch's tree, and together they took 17.61s, well under the 42000 ms each was given in the failing run, so the failures were time spent waiting for the CPU, not wrong behaviour. The raised limit (x6.00) was not needed for this result.
