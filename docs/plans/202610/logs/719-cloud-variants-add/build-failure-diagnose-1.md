Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL` — the stack trace pins the failure to one hook (`.bkit/core/engine/audits/workflows/catalog-parity.test.ts:124`), the file passes alone, and the same-branch gate logs show the hook's time tracking machine load, so no instrument-fix-reverify loop is needed.

## CI Run

NOT CHECKED: the failure is the local gate `pnpm bkit:gate:static-unit-integration` in `build-run-tests` attempt 1 (`status.jsonl` `"verdict":"FAIL","attempt":1,"failures":1`); no remote CI run is part of this failure, and on CI `loadFactor()` is pinned to 1 with no competing load.

## Prior Attempts Reviewed

None

## Prior Knowledge

- catalog-contract-tests-share-immutable-render-matrix: the 120-variant render matrix was moved into one frozen `beforeAll` to stop per-case timeouts under coverage, "preserve each planned assertion and timeout" — applied as the origin of the hook that now times out; that fix kept the default hook budget.
- spawn-heavy-unit-suite-needs-its-own-budget-under-load: `loadFactor()` stays near 1 on a busy 10-core laptop while contention slows CPU-heavy tests several times over; fix is a suite-level `tierTimeouts(true)` budget, never a bare number — applied as the mechanism (factor 1.18 here) and as the shape of the out-of-scope fix.
- local-pnpm-test-full-parallelism-integration-timeouts-flake: before treating a full-gate timeout as a regression, re-run that file alone — applied: the file passes alone in 1.6-2.6s.
- docs/failures.jsonl `catalog-progress-authority-render-concurrency-timeout` (status `CLOSED`): the #826 fix's own full-coverage proof run took 7178ms for the whole file — applied as evidence that the hook already used about 60% of its budget when it landed.
- Reverted commits: `git log -i --grep=revert` on `catalog-parity.test.ts`, `vitest.timeout-budget.ts`, `vitest.setup.ts`, `vitest.config.ts` and `vitest.unit.config.ts` returned nothing (the same grep without a path returns hits, so the search works).

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN)
- #481 — Flake triage (OPEN)

## Failures

One failure, in the unit stage (`test:coverage:unit`) of `pnpm bkit:gate:static-unit-integration`:

```text
 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 11800ms.
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:124:3
 Test Files  1 failed | 172 passed (173)
      Tests  7337 passed | 6 skipped (7343)
```

The 4 skipped cases in that file are the dependants of the failed hook, not separate failures. Because the unit stage failed, `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and `pnpm test:integration` never ran (the raw log `.git/bkit-outbox/719-cloud-variants-add/run-tests-1.log` has no `> @cbartens/bkit@6.1.1` line for them), so those tiers are unverified for this commit. The static stage passed (typecheck, lint, format, prose with warnings only, slop delta). `run-tests-1.md` is truncated (1670 of 3203 lines); the raw log was read for the stage list and test totals.

## Root Cause

- **Proximate cause:** the `beforeAll` at `catalog-parity.test.ts:124` builds all 120 rendered workflow variants (6 workflows x 4 trackers x 5 hosts) under v8 coverage in one call. Its budget is `UNIT_HOOK_TIMEOUT_MS` (10s) x `loadFactor()`; the factor read 1.18, giving 11800ms. The machine was busier than in earlier gates (whole-suite JUnit time 760.6s against 603.4s in `build-group-gate-8-2`), and the hook ran past 11.8s (file time 13030ms).
- **Not caused by this branch:** no file on the render path, no workflow source and no vitest config changed between the merge base and `HEAD`, and the file passes alone in 1.6-2.6s.
- **Design fragility:** the hook arrived from dev in `401363fa1` (#826). That fix replaced three 5.7s per-case budgets with one 10s-base hook budget and kept the default timeout, so the whole matrix must finish inside a budget that does not scale with real contention. On this branch the same unchanged file took 1994, 7140, 7745, 4681, 2974 and then 13030ms across six gates.
- **Contributing factors:** `loadFactor()` in `vitest.timeout-budget.ts` divides load average by cores and floors at 1, so a busy 10-core laptop reads as about 1.2x while CPU-bound work slows far more (#814); other sessions were loading the machine (`vm.loadavg` `{ 2.92 7.29 8.54 }` during diagnosis).

## Rot Signals

tests, reliability, config

- tests: `catalog-parity.test.ts:124` puts 120 coverage-instrumented renders in one hook on the default unit budget, and a `CLOSED` failures row for the same file has recurred.
- reliability: the full local unit gate fails on machine load alone; #814 lists eight more tests failing the same way.
- config: `vitest.timeout-budget.ts:28-40` `loadFactor()` returns about 1.2 on a busy 10-core laptop, so the load-scaled budget barely scales.

## Recommended Remediation

1. No change to any in-scope file. The plan (`docs/plans/202610/719-cloud-variants-add-plan.md`) names no file on the failing path, and no branch change touches it.
2. Before re-running, check the machine is not running another worktree's gate: `sysctl -n vm.loadavg`; wait until the 1-minute figure is well below the core count (10).
3. Re-run `pnpm bkit:gate:static-unit-integration` in full, because the bats, awake and integration stages have not run yet for this commit.
4. **If** the same hook times out again → do not retry a third time; raise the out-of-scope fix below to the owner, because the build cannot make it on its own.

## Out-of-Scope Recommendations

- `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:124` — give the matrix hook its own load-scaled budget instead of the default: import `tierTimeouts` from `"../../../../../vitest.timeout-budget"` (the same import `audits/repo/vitest-test-lock.integration.test.ts:10` uses) and pass `tierTimeouts(true).hookTimeout` as `beforeAll`'s second argument; no bare number, per `spawn-heavy-unit-suite-needs-its-own-budget-under-load`. Optionally let the codex row reuse `resolved.output` rather than re-running `substituteWorkflow` inside `applyCodexSkill`, which renders each source twice per tracker. Out of scope because the plan does not name this dev-owned file.
- `vitest.timeout-budget.ts:28-40` — `loadFactor()` under-scales on a busy laptop; tracked by #814, a shared-infra decision.
- `docs/failures.jsonl` — the `CLOSED` row `catalog-progress-authority-render-concurrency-timeout` has recurred; a new row or a reopen belongs to the failures ledger owner.

## Blast Radius

Localised. The in-scope remediation is a re-run with no code change. The out-of-scope hook budget change would only affect `catalog-parity.test.ts`: `tierTimeouts` is already exported and used by other test files, CI keeps the factor at 1 (30s hook budget there), and no product code, loader or contract changes.

## Suggested Tests

- No new test for this branch. For the out-of-scope fix: run `catalog-parity.test.ts` under the full `test:coverage:unit` gate with a second gate running in another worktree, and confirm the hook passes; `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` already covers `tierTimeouts`.

## Verification Commands

- `sysctl -n vm.loadavg`
- `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/audits/workflows/catalog-parity.test.ts`
- `pnpm bkit:gate:static-unit-integration`
- `grep -n -E 'catalog-parity|Test Files|ELIFECYCLE' .git/bkit-outbox/719-cloud-variants-add/run-tests-2.log` (from the main checkout's `.git`, whatever attempt number the re-run writes)

## Hypotheses

### Hypothesis 1: This branch's code made the rendered-workflow matrix slower to build

#### Reason

The only failure is a `beforeAll` timeout in `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:124`, which calls `substituteWorkflow`, `applyT1` / `applyT2`, `applyCodexSkill`, `applyAntigravitySkill` and `applyOpencodeCommand`. If the branch changed any of those, or the workflow sources they render, it could have pushed the hook past its budget.

#### Act

`git diff --stat origin/dev...HEAD -- .bkit/core/engine/audits/workflows/ .bkit/core/engine/render/ .bkit/core/engine/install/modules/codex.ts .bkit/core/workflows/ vitest*.ts`; read `applyCodexSkill` (`.bkit/core/engine/install/modules/codex.ts:29-47`); read the branch diff of `.bkit/core/engine/install/cloud-env.ts` (imported by `codex.ts`); ran the file alone, with and without coverage.

#### Observe

The diff stat printed nothing for those paths. `applyCodexSkill` calls only `substituteWorkflow` and `parseFrontmatter`; the `cloud-env.ts` diff adds `ROUTER_ONLY_KEYS` and `routerOnlyDropped`, which the render path never calls. Isolated runs:

```text
 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  2.61s (tests 94%, transform 5%, import 1%, setup 1%)
```

```text
 Test Files  1 passed (1)
   Duration  1.62s (tests 96%, setup 1%, import 1%, transform 1%)
```

#### Result

REFUTED — no file on the hook's render path changed on this branch, and the file passes alone in 1.6-2.6s.

### Hypothesis 2: An assertion inside the hook failed or hung (the `expect(resolved.orphans)` check in `renderedReportingWorkflows`)

#### Reason

`renderedReportingWorkflows()` runs `expect(resolved.orphans, ...).toEqual([])` inside the hook, so a failing orphan check would also surface at `catalog-parity.test.ts:124`.

#### Act

Read the error text in `run-tests-1.md` and the isolated run's result.

#### Observe

```text
 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 11800ms.
```

The isolated run passed all 8 cases, including `reuses the complete immutable rendered workflow matrix`.

#### Result

REFUTED — the error is a timeout, not an `AssertionError`, and the same hook passes when run alone.

### Hypothesis 3: The hook's CPU-bound work exceeds its load-scaled budget when the full parallel unit gate runs on a busy laptop

#### Reason

The hook renders 6 workflows x 4 trackers x 5 hosts = 120 variants in one go, under v8 coverage (`render/trackers` and `render/hosts` are in the `test:coverage:unit` include list). Its budget is `UNIT_HOOK_TIMEOUT_MS` (10s) x `loadFactor()`, and the knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` records that this factor stays near 1 while contention slows CPU-bound work several times over.

#### Act

Compared the file's duration and the budget line across every same-branch gate log in `.git/bkit-outbox/719-cloud-variants-add/`, and compared JUnit suite times between the failing run and the last passing gate.

#### Observe

Budget lines: `build-group-gate-4-1.log` x1.15, `5-2` x1.20, `6-5` x1.15, `7-2` x1.15, `8-2` x1.19, `run-tests-1.log` `[test-timeout-budget] load average 2.8 on 10 cores: unit limits 5900ms per test, 11800ms per hook (x1.18)`.

File duration, same file, same coverage command, eight cases each since the dev merge:

```text
build-group-gate-4-1.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 1994ms
build-group-gate-5-2.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 7140ms
build-group-gate-6-5.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 7745ms
build-group-gate-7-2.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 4681ms
build-group-gate-8-2.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 2974ms
run-tests-1.log:  ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests | 4 skipped) 13030ms
```

Whole-suite JUnit time: `run-tests-1` `time="760.563371165"` against `build-group-gate-8-2` `time="603.413839334"`; `branches.test.ts` 134.2s against 111.9s and `workflows.test.ts` 86.7s against 67.7s, so the whole machine was about 20-25% slower in the failing run. `sysctl -n vm.loadavg` during this diagnosis read `{ 2.92 7.29 8.54 }`, so other work was loading the 10-core machine in the minutes before.

#### Result

CONFIRMED — the same unchanged hook ranged from about 2s to 7.7s on this branch and hit 13.0s once the machine was busier; the budget only scales to 11.8s because the load factor read 1.18.

### Hypothesis 4: The heavy single hook came from dev (#826), not from this branch, and it moved the earlier timeout instead of removing it

#### Reason

The `catalog-parity` file had 4 cases in `build-group-gate-2-1.log` and 8 cases from `build-group-gate-4-1.log` on, so the rendered matrix arrived with a dev merge.

#### Act

`git log --oneline -8 -- .bkit/core/engine/audits/workflows/catalog-parity.test.ts`; `git show 401363fa1 -- .bkit/core/engine/audits/workflows/catalog-parity.test.ts`; read the latest `docs/failures.jsonl` row for `catalog-progress-authority-render-concurrency-timeout`.

#### Observe

`401363fa1 feat(826-append-routine-workflow): debug-remediated (#886)` adds `+import { beforeAll, describe, expect, it } from "vitest";` and `+  beforeAll(() => {`. `build-group-gate-2-1.log:  ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (4 tests) 7ms`. The failures row (status `CLOSED`) says: "The corrected file prepares one immutable matrix in beforeAll and retains every variant, planned test block, assertion and timeout. All eight file cases passed both targeted and full-coverage runs; the latter completed the whole file in 7178ms." and its remediation says "No production cache or test configuration changes."

#### Result

CONFIRMED — the #826 fix replaced three 5.7s per-case budgets with one 10s-base hook budget and kept the default timeout; its own proof run already used 7.2s of that budget, so the timeout recurs under load.
