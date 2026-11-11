Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL: the failure is pinned to one assertion (`tracker.test.ts:720`), and the cause (a fixed 200ms delivery budget against a real spawned `gh` stub at load 22.6) was reproduced by contrast across load levels, so no iterative work against the real boundary is needed.

## CI Run

None. `gh run list --repo cbartens/bkit --branch feat/864-move-project-docs --limit 5` returned `[]` (control: the same query on `dev` returned 1 run). The failing run is the local gate `pnpm bkit:gate:static-unit-integration` (`run-tests-1.md`, raw log `.git/bkit-outbox/864-move-project-docs/run-tests-1.log`, JUnit `.git/bkit-outbox/864-move-project-docs/run-tests-1.log.reports/vitest-40631.xml`).

## Prior Attempts Reviewed

None (`Strategy` = `STANDARD`; this is the first `build-run-tests` failure, attempt 1).

## Prior Knowledge

- spawn-heavy-unit-suite-needs-its-own-budget-under-load: a unit test that spawns real child processes slows about 9x under a full gate, and `loadFactor()` under-scales at load at or above core count — applied as the cause class: the failing case spawns the bash `gh` stub under a fixed 200ms delivery budget that does not scale at all.
- reuse-stable-executable-for-shell-fixture-bodies: fresh shell-fixture executables cost about 109ms median to start on this host even when idle — applied as the reason a 200ms budget leaves under 2x headroom for one `gh` spawn before any load.
- local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-spawning suites fail non-deterministically under full parallel load and pass in isolation — applied as the triage method (isolated re-run, then a contended re-run).
- `docs/failures.jsonl` key `tracker-new-comment-budget-shell-observation-flake` (OPEN, 5 updates): the same test's 200ms budget already expires before its shell stub is observed (`gh POST` received a 199ms timeout and returned ETIMEDOUT/SIGKILL around 202ms) — applied as direct precedent that this case is timing-sensitive against real spawns on this host.

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (open)
- #481 — Flake triage (open)
- #826 — Append routine workflow step updates to one comment per run (closed; introduced the failing test in `401363fa1`)

## Failures

One failure, in the unit tier. Static checks passed; the integration tier never ran.

- `.bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > reserves new comment opportunity within total delivery budget` failed at `tracker.test.ts:720` through `requireOutcomeUrl` (`:335`): `AssertionError: expected { Object (done, action, ...) } to match object { done: true }` with `-   "done": true,` / `+   "done": false,`. The case took 2637ms.
- Totals: `Test Files  1 failed | 173 passed (174)`, `Tests  1 failed | 7416 passed | 2 skipped (7419)`.
- Load at the time: `[test-timeout-budget] load average 22.6 on 10 cores: unit limits 15800ms per test, 31600ms per hook (x3.16)`. The machine was shared with another repo's e2e gate (`machine-lock` waited on `bkit:gate:static-unit-integration-e2e-live` in another checkout).
- Because the gate chains `pnpm bkit:gate:static-unit && pnpm test:integration`, the unit failure stopped the run before `pnpm test:integration`, so the integration tier is unverified for this branch.
- The log artifact is clamped (`kept 1996 of 3969 lines`); the failure summary at its end is intact.

## Root Cause

Proximate cause: the test's setup call at `tracker.test.ts:719-720` gives `postCommentOnce` a total delivery budget of `budgetMs: 200`. That call spawns the real bash `gh` stub (`tests/fixtures/gh/bin/gh`, which runs the `BKIT_FAKE_TOOL_SCRIPT` body) with a timeout taken from `timeLeft()` (`tracker.ts:71-77`, passed at `tracker.ts:225`). At load average 22.6 on 10 cores, starting bash plus the stub takes longer than 200ms, so `runGh` times out, `postCommentOnce` catches it at `tracker.ts:1859-1864`, and returns `{ done: false, ... }`. The setup assertion then fails before the behaviour under test (the slow second call) is reached.

Evidence that this is load, not the branch:
- This branch does not change `tracker.ts` or `tracker.test.ts` (`git diff --stat da97be38..HEAD -- .bkit/core/engine` lists neither).
- The same test passed in every earlier gate of this run: `build-group-gate-1-3` (load 5.0, 523ms), `1-4` (load 9.6, 664ms), `1-5` (load 7.4, 679ms), `4-1` (load 9.0, 774ms). It failed only at load 22.6 (2637ms).
- Re-run alone three times at load 26.2, 33.8 and 39.3: `Tests  1 passed | 103 skipped (104)` each time.
- Re-run alongside four other heavy suites at load 61.7: the target test passed, but two other `tracker.test.ts` cases failed (`logs cache receipt lock and reconciliation problems with stable recurrence identity`, `seals an acknowledged segment after a postflight intervening comment`). Both use `publicationFixture`'s fixed `budgetMs = 1000` default (`tracker.test.ts:303`). Which case fails moves from run to run, which is the signature of a timing flake.

Design fragility: `budgetMs` is a product wall-clock budget, separate from the Vitest per-test timeout. `vitest.timeout-budget.ts` scales only the Vitest timeouts by `loadFactor()`; nothing scales the fixed `budgetMs` values the tracker tests hand to code that spawns real processes. So the tests are tuned to an idle laptop.

Contributing factors: the machine was shared with another checkout's e2e gate. `requireOutcomeUrl` asserts only `done`, so the `reason` field (which would say `network` / timeout) is hidden from the failure output ("2 matching properties omitted").

## Rot Signals

tests, observability

- tests: `tracker.test.ts:719` and `:732` use a fixed `budgetMs: 200`, and `:303` a fixed `1000`, against real spawned `gh` stubs; these do not scale with load, so the case fails at load 22.6 and passes at 5-9.6.
- observability: `requireOutcomeUrl` (`tracker.test.ts:334-338`) matches only `{ done: true }`, so a failed delivery's `reason` is left out of the assertion output, and a re-run was needed to tell timeout from logic error.

## Recommended Remediation

The plan's work targets (installer, project docs, summary warnings, advisory checks) do not include `tracker.ts` or `tracker.test.ts`, and the branch does not touch them. No code change is recommended in the in-scope files.

1. Re-run `pnpm bkit:gate:static-unit-integration` unchanged once the machine is quieter (load average under the core count, 10; no other checkout's e2e gate running). Every earlier gate in this run passed the same test at load 5.0-9.6.
2. If the re-run is red again on a `tracker.test.ts` budget case only, record the run with the failures-ledger key `tracker-new-comment-budget-shell-observation-flake` and continue. Treat any failure in the files this branch changes as real.
3. Confirm the integration tier (`pnpm test:integration`) runs and passes: it has not run yet for this branch because the unit failure stopped the gate.

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/workflow/tracker.test.ts:719` — the setup call only needs to deliver the first comment, so give it a load-scaled budget (for example `tierTimeouts(false).testTimeout` from `vitest.timeout-budget.ts`, or the 60s default) instead of `200`. Keep `:732` at `200`. The second call must stay under 1000ms so it takes the short-allowance branch at `tracker.ts:1759`, so do not scale it past that. Confirm the setup budget's intent against the #826 plan before changing it.
- `.bkit/core/engine/commands/workflow/tracker.test.ts:303` — the `publicationFixture` default `budgetMs = 1000` also flakes at load 61.7 (two other cases). Scale it with `loadFactor()` only where a case does not depend on the `< 1000` branch.
- `.bkit/core/engine/commands/workflow/tracker.test.ts:334-338` — assert `{ done: true }` with the full result in the message (or `expect(result, JSON.stringify(result))`), so a failure shows `reason`.
- `vitest.timeout-budget.ts` — the `loadFactor()` under-scaling is tracked by #814. This failure adds a second class to it: product budgets passed into tests, which `loadFactor()` does not reach.

## Blast Radius

Localised. The in-scope remediation is a gate re-run with no file change. The out-of-scope test edits would touch only `tracker.test.ts`; the one coupling to check is the `budget.duration < 1000` branch at `tracker.ts:1759`, which the second call at `:732` must keep exercising.

## Suggested Tests

- Make the `tracker.test.ts` budget cases hold under load: run `tracker.test.ts` together with `steps.test.ts`, `prs.test.ts`, `tests.test.ts` and `ci.test.ts` at load average 2x or more the core count. Expect no failures in the `bounded nonfatal publication` or `best effort comment friction` blocks (out of scope for this build; belongs to #814).
- Add a regression assertion that the second call at `tracker.test.ts:732` still takes the short-allowance branch: no `recentComments` read before the POST, whatever the setup budget is.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs"
uptime   # load average should be under 10 (10 cores) before re-running
npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/tracker.test.ts
pnpm bkit:gate:static-unit-integration
```

## Hypotheses

### Hypothesis 1: This branch's changes broke tracker comment delivery

#### Reason

A unit test failed during this branch's build; the first question is whether the diff caused it.

#### Act

`git diff --stat da97be3876cf42450f57b335b7aac09629f33a59..HEAD -- .bkit/core/engine`; `git log --oneline -8 -- .bkit/core/engine/commands/workflow/tracker.test.ts`; isolated re-run x3 with `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/tracker.test.ts -t 'reserves new comment opportunity'`.

#### Observe

The diff stat lists 33 engine files and neither `tracker.ts` nor `tracker.test.ts`. The last commit touching the test is `8638b680a feat(719-cloud-variants-add)`, which is on dev, not on this branch. Isolated re-runs: `[test-timeout-budget] load average 26.2 on 10 cores` → `Tests  1 passed | 103 skipped (104)`; `load average 33.8` → `Tests  1 passed | 103 skipped (104)`; `load average 39.3` → `Tests  1 passed | 103 skipped (104)`.

#### Result

REFUTED — the branch does not touch the tracker code or test, and the test passes alone on the branch's code.

### Hypothesis 2: The fixed 200ms delivery budget expires while the real bash gh stub starts under heavy load

#### Reason

The failing assertion is `done: false` on a setup call with `budgetMs: 200` that spawns `tests/fixtures/gh/bin/gh`. The gate ran at load 22.6 on 10 cores. Knowledge rows `spawn-heavy-unit-suite-needs-its-own-budget-under-load` and `reuse-stable-executable-for-shell-fixture-bodies` describe exactly this cost, and the OPEN failure row `tracker-new-comment-budget-shell-observation-flake` describes it for the same test.

#### Act

Read `tracker.test.ts:692-746` and `tracker.ts:64-77`, `:225`, `:1684-1864`. Grepped the earlier group-gate logs for the case. Ran `tracker.test.ts` together with `steps.test.ts`, `prs.test.ts`, `tests.test.ts` and `ci.test.ts` to add contention.

#### Observe

`tracker.ts:75`: `if (remaining <= 0) throw new TrackerError("network", "publication timeout");` and `tracker.ts:225`: `runGh(t.cwd, args, input, ghEnv(), budget ? { timeoutMs: timeLeft(budget) } : {})`. Earlier gates: `build-group-gate-1-3.log: ✓ reserves new comment opportunity within total delivery budget 523ms` (`load average 5.0`), `1-4 ... 664ms` (`9.6`), `1-5 ... 679ms` (`7.4`), `4-1 ... 774ms` (`9.0`). Failing gate: `× reserves new comment opportunity within total delivery budget 2637ms` at `load average 22.6`. Contended re-run at `load average 61.7 on 10 cores`: `× logs cache receipt lock and reconciliation problems with stable recurrence identity 18465ms`, `× seals an acknowledged segment after a postflight intervening comment 4027ms`, `Tests  2 failed | 537 passed (539)`.

#### Result

CONFIRMED — the case passes at load 5-9.6 and fails at 22.6, and under more contention different budget-bound cases in the same file fail. The actual `reason` value was not captured, because the assertion hides it, so the timeout path is inferred from the code and timings, not read from the output.

### Hypothesis 3: The Vitest per-test time limit fired (the #814 timeout class)

#### Reason

#814 tracks unit tests that hit their Vitest time limit under the full gate on a loaded laptop.

#### Act

Compared the failure text and duration with the scaled limit in `run-tests-1.md`.

#### Observe

`unit limits 15800ms per test` versus `× reserves new comment opportunity within total delivery budget 2637ms`; the failure is `AssertionError: expected { Object (done, action, ...) } to match object { done: true }`, not `Test timed out`.

#### Result

REFUTED — the Vitest limit did not fire. The budget that ran out is the product's own `budgetMs`, which `loadFactor()` does not scale. It is a related but separate class from #814.

### Hypothesis 4: The integration tier also has failures this run did not show

#### Reason

The gate is `sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'`, so a unit failure stops it before the integration tests run, and the branch adds or changes six `*.integration.test.ts` files.

#### Act

Read the command line and the tail of `run-tests-1.md`.

#### Observe

`> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'`; the log ends with three `ELIFECYCLE  Command failed with exit code 1.` lines after the unit coverage summary and has no integration output.

#### Result

INCONCLUSIVE — the integration tier did not run, so it is unverified, not clean. The re-run must reach it.
