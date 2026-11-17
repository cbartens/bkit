Verdict: CONCERNS
Mode: NORMAL
Fingerprint: ea3c4b24c0fb8061c256ed17e4a73be3673353be5d0fb6882c8a36b42eb6a409
<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the failure is localised to one test that times out under machine load, with no assertion mismatch; it passes alone and passed in this branch's own group gate, so no iterative real-boundary loop is needed.

## CI Run

None — `gh run list --branch feat/915-min-push-ignores --limit 3` returned `[]`; the branch has no CI run, and this failure comes from the local gate `pnpm bkit:gate:static-unit-integration`.

## Prior Attempts Reviewed

None — `Strategy` is `STANDARD`.

## Prior Knowledge

spawn-heavy-unit-suite-needs-its-own-budget-under-load: a unit test file that spawns real child processes times out under load because `loadFactor()` (`loadAverage / cores`, floored at 1) under-scales the 5000ms base; remediation is a suite-level `tierTimeouts(true).testTimeout`, never a bare number — applied as the conditional P2 remediation and as the `config` rot signal.
local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-heavy suites time out non-deterministically under full-suite parallel load; re-run the file alone before treating it as a regression — applied as the isolated three-run probe (Hypothesis 2) and the P1 remediation.
reuse-stable-executable-for-shell-fixture-bodies: fresh fixture executables inflate startup cost into timeouts — checked: `land.test.ts` already uses the stable `useGateRunner()` dispatcher, so it does not apply here.
docs/failures.jsonl `.bkit/core/engine/commands/land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed` (OPEN, rows 222 and 253): the same test timed out at 9200ms and 7200ms on unchanged code and passed alone — applied as the confirmation that this failure predates the branch. Its remediation says "do not weaken the test timeout or assertions", which is why P2 is gated on the owner.
Scar tissue: `git log -i --grep=revert` over `land.ts`, `land.test.ts`, `vitest.timeout-budget.ts` and `vitest.setup.ts` returned nothing; the same grep without a path returned hits (`7c9b909ea`, `ca85faeab`), so the read works and no reverted attempt touches these files.

## Related Issues

None — `gh issue list --search 'land.test'` returned `[]`; `--search 'timed out load'` returned #921, #929 and #502, none of which is a prior incident of this test timing out. The prior incident lives in `docs/failures.jsonl` (see Prior Knowledge).

## Failures

One failure, in the unit stage of `pnpm bkit:gate:static-unit-integration` (`run-tests-1.md:1759-1774`):

- `.bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed` — `Error: Test timed out in 7350ms.` at `land.test.ts:440`; it ran 7628ms. No assertion failed.
- Totals: `Test Files  1 failed | 175 passed (176)`, `Tests  1 failed | 7601 passed | 2 skipped (7604)`. Because the unit stage failed, `bkit:test:bats`, `bkit:test:awake` and `pnpm test:integration` never ran (`sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && ...'` stops at the first failure). Their state is unknown, not green.
- The static stage passed: typecheck, lint, Prettier, tables, prose (`0 errors, 47 warnings`) and slop (`net findings 0`).
- The log is clamped (`kept 1847 of 3498 lines`); the dropped lines were not read. The JUnit summary line counts exactly one failed test, so no failure is hidden in the dropped part.

## Root Cause

- **Proximate cause:** the test runs three full landings with zero backoff (`LAND_ATTEMPTS: 3, LAND_BACKOFF_START_S: 0`, `land.test.ts:22-25`). Each landing is a fetch, a `git worktree add`, a build commit, a `git clone` plus push for the simulated race, a fake install and a `node gate.cjs` gate run, and then the push — roughly 2.5s of subprocess time per attempt (the two-attempt sibling test took 5257ms). Three attempts took 7628ms against a 7350ms limit.
- **Trigger:** machine load from parallel sessions. The gate first waited on another worktree's test run (`929-hung-test-never`, `run-tests-1.md:5`); the budget was read at load average 5.7 on 10 cores (x1.47), and load during this diagnosis reached `30.36`.
- **Design fragility:** the test's idle wall time is already close to the 5000ms unit base, and `loadFactor()` in `vitest.timeout-budget.ts:40` is `loadAverage / cores` floored at 1, which under-estimates how much slower subprocess-heavy tests run on a busy machine. So a small rise in load tips this test over.
- **Not caused by this branch:** the branch's change on this path (`land.ts:197`, `changedOutside` → `minPushOutside`) adds no subprocess for `row.txt`; the same code passed this test in 5185ms in `build-group-gate-1-2.md:432`; and `docs/failures.jsonl` already records this exact test timing out on unchanged code (OPEN).

## Rot Signals

tests, config

- tests: `land.test.ts:440` runs three real-subprocess landings inside a unit-tier 5000ms base; it has timed out at 9200ms, 7200ms and now 7350ms limits (`docs/failures.jsonl` rows 222 and 253, `run-tests-1.md:1760`).
- config: `vitest.timeout-budget.ts:40` scales the budget by `loadAverage / cores` floored at 1, which the knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` records as under-scaling exactly when load is high.

## Recommended Remediation

1. **P1 — no code change; re-run the gate.** The branch did not cause this failure, so do not edit `land.ts`, `ci.ts` or the feature tests for it.
   - Confirm the file passes alone: `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts`.
   - Re-run the full gate through `bkit tests run` with the same scope (`pnpm bkit:gate:static-unit-integration`) once no other session's test run holds the machine.
   - Treat a pass as green: the bats, awake and integration stages have not run yet, so only a full re-run proves them.
2. **P2 — only if the same test times out again on the re-run, and only with the owner's approval** (`docs/failures.jsonl` row 253 says "do not weaken the test timeout or assertions", and this change is outside #915's feature).
   - In `.bkit/core/engine/commands/land.test.ts:202`, give the spawn-heavy suite its own load-scaled budget: `describe("pushToDev", { timeout: tierTimeouts(true).testTimeout }, () => {`.
   - Add `import { tierTimeouts } from "../../../../vitest.timeout-budget";` beside the existing `../../../../vitest.gate-fixture` import (line 7).
   - Keep every assertion and the mocked `LAND_ATTEMPTS: 3`. Do not use a bare number; the knowledge row records a fixed 30s also flaking.

## Out-of-Scope Recommendations

- `vitest.timeout-budget.ts`: raise `loadFactor()` above 1 once load average reaches the core count, which would fix every spawn-heavy unit file at once; it appears only in the failure trace, and it is a shared-config decision tracked by `docs/failures.jsonl` `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`.
- `docs/knowledge.jsonl` row `spawn-heavy-unit-suite-needs-its-own-budget-under-load`: its remediation names `.bkit/core/engine/audits/repo/resolve-push-base.test.ts` as the precedent, which no longer exists (`ls` returned `No such file or directory`); point it at a current file, such as `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:8`.
- `docs/failures.jsonl` row for `land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed`: append this recurrence (7350ms limit, load 5.7 on 10 cores, `915-min-push-ignores`) so the OPEN row keeps its evidence.

## Blast Radius

Localised. P1 changes no file. P2 changes only the `pushToDev` suite's timeout in one test file: no loader, schema, public contract or shared utility changes, and CI pins `loadFactor()` to 1 (`vitest.timeout-budget.ts:34`), so CI gets a 30000ms limit for this suite instead of 5000ms — compatible, but it means CI would no longer fail fast on a hang in these 31 tests.

## Suggested Tests

None new. The failing test already covers the "dev moved before every push" path; the gap is its time budget, not its coverage. If P2 lands, `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` already covers `tierTimeouts`.

## Verification Commands

- `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts`
- `uptime` (check the load before the full gate)
- `bkit tests run` with scope `pnpm bkit:gate:static-unit-integration` (the build step's own runner), or `pnpm bkit:gate:static-unit-integration` directly
- If P2 lands: `pnpm typecheck && pnpm lint && npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

## Documentation Warnings

```jsonl
{"topic":"noise","gap":"no entries: docs/noise.md holds only its header and rules, so no downgraded signal or known-flake trigger is registered","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl records the land.test.ts timeout as OPEN, and vitest.timeout-budget.ts documents the load trigger in its header comment.","action":"Leave as is unless a signal is downgraded; this diagnosis downgrades nothing."}
{"topic":"testing","gap":"docs/testing.md names no guidance for a unit test that times out under load (its only timeout guidance is 'Keep the existing test timeouts' in the sleep-prevention section)","recommendedPath":"docs/testing.md","alternativeEvidence":"Knowledge rows spawn-heavy-unit-suite-needs-its-own-budget-under-load and local-pnpm-test-full-parallelism-integration-timeouts-flake, and the vitest.setup.ts budget comment.","action":"Add a short rule for load-induced unit timeouts: re-run alone, then a suite-level tierTimeouts budget with owner approval."}
```

## Hypotheses

### Hypothesis 1: The branch's switch from `changedOutside` to `minPushOutside` in `checkLanding` made each landing slower, pushing the three-attempt test over its budget

#### Reason

The only branch change on the failing test's code path is `.bkit/core/engine/commands/land.ts:197`, which now calls `minPushOutside` (added in `.bkit/core/engine/commands/ci/ci.ts:640`). Each of the test's three landing attempts runs `checkLanding` once.

#### Act

Read `git diff 263f04b7 HEAD -- .bkit/core/engine/commands/land.ts` and `minPushOutside` (`ci.ts:640-662`). Compared the same test's time in this branch's earlier group gate (`build-group-gate-1-2.md`), which ran after the `land.ts` change landed in `aca48732e` (group 1 execute).

#### Observe

`minPushOutside` calls `changedOutside` and then only runs `git cat-file` for files that match `AUDIT_TEMPLATE_RE = /^docs\/templates\/bkit-audit-[^/]+\.md$/`; the test lands `row.txt`, so no extra git call runs.
`build-group-gate-1-2.md:432`: `✓ dev moved before every push: exhausted, nothing landed 5185ms`
`build-group-gate-1-2.md:1630`: `Tests  7602 passed | 2 skipped (7604)`

#### Result

REFUTED — the new classifier adds no subprocess for this test's files, and the same code passed this test in 5185ms in the group gate.

### Hypothesis 2: The branch's edit to the fake package runner `tests/fixtures/gates/pnpm.cjs` changed how the landing gate runs, so the test hangs or misbehaves

#### Reason

The branch changed `tests/fixtures/gates/pnpm.cjs` to forward extra arguments to the script (`spawnSync("/bin/sh", ["-c", script, "sh", ...process.argv.slice(3)], ...)`), and `land.test.ts` uses that runner through `useGateRunner()`.

#### Act

Ran the failing test alone three times: `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts -t 'dev moved before every push: exhausted, nothing landed'`.

#### Observe

```text
 ✓ .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed 7444ms
 ✓ .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed 6487ms
 ✓ .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed 6521ms
```

The failing run reported no assertion mismatch, only `Error: Test timed out in 7350ms.`

#### Result

REFUTED — the test reaches `{ kind: "exhausted", attempts: 3 }` and passes every assertion in isolation; the fixture change affects only argument forwarding.

### Hypothesis 3: The test genuinely hangs (the retry loop in `pushToDev` does not stop after `LAND_ATTEMPTS`)

#### Reason

A test that times out can mean an endless loop rather than a slow one.

#### Act

Read the retry loop in `.bkit/core/engine/commands/land.ts:224-276` and the test's mock of `TIMEOUTS` (`land.test.ts:22-25`), then used the isolated runs from Hypothesis 2.

#### Observe

`if (attempt >= TIMEOUTS.LAND_ATTEMPTS) return { kind: "exhausted", attempts: attempt };`
`return { TIMEOUTS: { ...actual.TIMEOUTS, LAND_ATTEMPTS: 3, LAND_BACKOFF_START_S: 0 } };`
Isolated runs finished in 6487ms to 7444ms with the test passing.

#### Result

REFUTED — the loop stops after three attempts with zero backoff; the test ends on its own, it is just slow.

### Hypothesis 4: A known, pre-existing timing flake: the test does three full landings with real subprocesses, its wall time sits at the edge of the 5000ms unit budget, and the load-scaled budget does not scale enough under machine contention

#### Reason

The failure is a pure timeout (no assertion mismatch) in a test this branch did not change. `docs/failures.jsonl` and the knowledge ledger both record this symptom class, and the gate waited on another worktree's test run before starting.

#### Act

Read `vitest.timeout-budget.ts`, the run log's budget line and lock wait, `docs/failures.jsonl` rows for this test key, and the knowledge rows matching `timed out|timeout|land.test|load average`. Timed the test alone (Hypothesis 2) and read `uptime` before and after.

#### Observe

`run-tests-1.md:5`: `[machine-lock] ⏳ ... is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 66455, since 14:44:10), last run took 11m44s`
`run-tests-1.md:166`: `[test-timeout-budget] load average 5.7 on 10 cores: unit limits 7350ms per test, 14700ms per hook (x1.47)`
`run-tests-1.md:461`: `× dev moved before every push: exhausted, nothing landed 7628ms`
`run-tests-1.md:460`: `✓ dev moved: rebuilds on the new dev and pushes again 5257ms` (two attempts, so about 2.6s per landing attempt)
`docs/failures.jsonl:253` (OPEN): `"The 6.1.1 audit full gate timed out this unchanged test at 7200ms with no assertion mismatch. ... The isolated land.test.ts run passed all 43 tests in 16.68s without code, timeout or assertion changes."`
`docs/failures.jsonl:222` (OPEN): `"Full unit coverage run timed out at 9200ms; no assertion mismatch."`
`uptime` during the probe: `load averages: 19.44 14.85 14.83`, then `load averages: 30.36 18.15 16.04`
`vitest.timeout-budget.ts:40`: `return Math.min(MAX_LOAD_FACTOR, Math.max(1, measured, Number.isFinite(planned) ? planned : 0));`

#### Result

CONFIRMED — same test, same symptom, on unchanged code, already OPEN in `docs/failures.jsonl`; it passes alone and passed in this branch's own group gate. The trigger is machine load from parallel sessions; the branch did not cause it.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** pushToDev > dev moved before every push: exhausted, nothing landed times out under machine load (pre-existing, not caused by this branch)
  **Severity:** MEDIUM · **Class:** tests · **Fixable:** true · **Location:** `.bkit/core/engine/commands/land.test.ts:440` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:gate:static-unit-integration passes in full (unit, bats, awake and integration stages) with land.test.ts green; if the same test times out again, the pushToDev suite gets a tierTimeouts(true).testTimeout budget only after owner approval, with every assertion unchanged
  - **TEST FIRST:**
    - .bkit/core/engine/commands/land.test.ts
<!-- bkit:task 1 end -->
