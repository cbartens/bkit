Verdict: CONCERNS
Mode: NORMAL
Fingerprint: 748674488a0c399769bdf248ed0c63c29d429829adb68357ebaf75ec066272ec
<!-- verdict:end -->

# Debug Failure Diagnosis

## Scope

Inputs: `docs/plans/202611/logs/887-review-doc-starters/run-tests-2.md`, `docs/plans/202611/887-review-doc-starters-plan.md`, `docs/plans/202611/logs/887-review-doc-starters/status.jsonl`, `docs/plans/202611/logs/887-review-doc-starters/build-decision-1-2.md` (highest `build-decision-1-*`). Strategy `PIVOT`. Prior attempt read: `build-failure-diagnose-1.md`, `build-failure-remediate-1-log.md`, `run-tests-1.md`, `build-decision-1-1.md`.

## Notes

The two test rounds failed on two different tests. Both are pre-existing OPEN load-timeout rows in `docs/failures.jsonl`, and neither file is touched by this branch. The tests loop reads "1 → 1" as `stuck`, but the count hides that the failing test changed. Step 12 passes only on a gate exit 0, so an owner acceptance from the holistic step cannot clear it. In both rounds the gate stopped inside `test:coverage:unit`, so `bkit:test:bats`, `bkit:test:awake` and the whole `test:integration` tier have not run in either round. Those tiers are unverified, not passing.

## Mode Reasoning

NORMAL: the stack trace pins the failure to the per-test deadline running out inside `dropLandTree` (`land.ts:90`), the timing across both rounds shows the test sits at its budget edge, and an ACTIVE knowledge row prescribes the concrete fix; no real-boundary soak is needed.

## CI Run

NOT CHECKED: the failing gate is the local `build-run-tests` step (`pnpm bkit:gate:static-unit-integration`, log `docs/plans/202611/logs/887-review-doc-starters/run-tests-2.md`). `gh run list --branch feat/887-review-doc-starters --limit 3` returned `[]`; the same read on `dev` returned run `43551122837` (`success`), so the read works and the branch has no CI run to compare.

## Prior Attempts Reviewed

- Attempt 1 (`build-failure-diagnose-1.md`, STANDARD, CONCERNS): diagnosed `locks.test.ts > publication ownership lock > serializes publication for one target and invocation` (`expected null not to be null`) as a known load flake outside the plan. It recommended no file change and a gate re-run.
- Remediation 1 (`build-failure-remediate-1-log.md`): "no edit made". Commit `7dbb8595c`.
- Run 2 (`run-tests-2.md`): `locks.test.ts` passed, and `land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed` failed instead. So the re-run did not fail for attempt 1's reason. It failed because a plain re-run of a suite with several tests at their budget edge only swaps which edge test loses.
- Why attempt 1 did not unstick the build: it treated the failure as one flaky test to wait out. The evidence across both rounds shows a class of spawn-heavy unit tests whose full-gate run time is about the same as their budget, so each re-run is a lottery.
- Does this re-apply a prior commit SHA or debug log? No. Attempt 1 proposed only a re-run (no commit to re-apply). This diagnosis proposes a test-budget change on a different file, which no earlier attempt made.
- New angle: measure the margin. In run 1 this test took 7456ms against an 8650ms budget (passed with 1.2s to spare). In run 2 it took 8160ms against 7900ms (failed by 0.26s). In isolation now, at load 21.7, it takes 3458ms. The full parallel unit run slows it about 2.3x, while the budget factor (1.58 in run 2) assumes much less.

## Prior Knowledge

- spawn-heavy-unit-suite-needs-its-own-budget-under-load: "the load-scaled budget's factor is `loadAverage / cores` floored at 1" and under-estimates spawn latency; remediation "give the spawn-heavy suite its own load-scaled budget rather than relying on the unit base: `describe("…", { timeout: tierTimeouts(true).testTimeout }, …)`" and "Do NOT hard-code a bare number" — applied as the concrete fix for the `pushToDev` block.
- local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-spawning suites time out under full parallel load and clear when concurrency drops — applied as the reason the test passes alone (3458ms) and fails in the full gate (8160ms).
- docs/failures.jsonl:253 (`.bkit/core/engine/commands/land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed`, OPEN): "The 6.1.1 audit full gate timed out this unchanged test at 7200ms with no assertion mismatch"; its remediation says "do not weaken the test timeout or assertions" — applied as a tension to resolve: the knowledge row's fix keeps the timeout load-scaled and keeps every assertion, so it changes the budget base for a test that asserts no time bound, not the test's checks.
- docs/failures.jsonl:220-226: seven `land.test.ts pushToDev` tests recorded OPEN as "Pre-push timeout", "Full unit coverage run timed out at 9200ms; no assertion mismatch" — applied as evidence that the whole `pushToDev` block, not one test, is at its budget edge.
- docs/decisions.jsonl `887-review-doc-starters-holistic-land-push-timeout` (ACTIVE): the owner accepted this test's failure at the holistic step with rationale "Step 12 reruns the suite" — applied as evidence that the acceptance assumed Step 12 would pass, which it did not, and that Step 12 has no route that honours it.

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN)
- #481 — Flake triage (OPEN)

## Failures

One failing test out of 7748; one failing file out of 178 (`Test Files  1 failed | 177 passed (178)`, `Tests  1 failed | 7745 passed | 2 skipped (7748)`).

- `.bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed` (8160ms) → `Error: git worktree unlock /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-land-main-SfBGEb/.worktrees/_land-x did not finish within 1 ms (the running test's remaining time)`, thrown from `vitest.child-deadline.ts:64:15` via `runGit` (`lib.ts:988:15`) → `dropLandTree` (`land.ts:90:3`) → `pushToDev` (`land.ts:272:7`) → `land.test.ts:442:17`; cause `Error: spawnSync git ETIMEDOUT`.

Relationships and side effects:

- The error is not a git hang. `vitest.child-deadline.ts` gives each synchronous child call the test's remaining time; after three full landing attempts the test had 1 ms left, so the cleanup `git worktree unlock` was killed at once. The real event is "the test body ran past its 7900ms limit".
- The gate started at `load average 6.8 on 10 cores: unit limits 7900ms per test, 15800ms per hook (x1.58)` after a 4-minute machine-lock queue.
- The failure is inside `pnpm test:coverage:unit`. The gate chains with `&&`, so `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and `pnpm test:integration` did not run, in this round or the previous one.
- Everything before it passed: typecheck, lint, `format:check`, `format:tables:check`, `bkit:lint:prose` (0 errors, 47 warnings), `bkit:slop:delta` (net findings 0).
- Round 1's failure (`locks.test.ts`) passed in round 2. The two failures share one mechanism class (load-starved spawn-heavy unit tests), not one test.
- The artifact is clamped (`kept 1882 of 3651 lines`); the dropped lines are passing-test lines, and the vitest summary counts only one failure.

## Root Cause

**Issue 1: the `pushToDev` tests in `land.test.ts` run at about their unit budget in the full gate, so one of them times out in some rounds. It is a known load timeout in a file this branch never touches, not a regression from issue #887.**

- **Proximate cause:** `dev moved before every push: exhausted, nothing landed` (`land.test.ts:440-454`) drives three full landing attempts (`LAND_ATTEMPTS: 3`, mocked at `land.test.ts:22-25`). Each attempt fetches, adds a throwaway worktree, runs the fixture gate, pushes and removes the worktree, all as real `git` and package-runner child processes. In the full parallel unit run it took 8160ms, against the 7900ms unit limit. `vitest.child-deadline.ts` then gave the last cleanup call (`dropLandTree`, `land.ts:90`) its remaining 1 ms.
- **Design fragility:** the file uses the unit-tier base (5000ms, scaled by load) for a block of tests that each spawn dozens of child processes and assert no time bound. The load factor (1.58 in round 2, from `UNIT_PLANNED_LOAD_PER_CORE`) under-estimates the slowdown the full parallel run causes for spawn-heavy tests: measured 3458ms alone vs 7456-8160ms in the gate, about 2.3x.
- **Contributing factors:** this machine runs several worktree gates and agent sessions at once (load 6.8 at gate start, 20-25 during this diagnosis); vitest runs nine workers in parallel, all spawning `git`; the same timeout is OPEN in `docs/failures.jsonl` (rows 220-226 and 253) and in issue #814 with no fix landed.
- **Why the build loop is stuck:** Step 12 (`.bkit/core/workflows/bkit-build.md`) passes only when the gate exits 0. The owner's acceptance of this test at the holistic step (`build-decision-1-1.md` Q1) assumed "Step 12 reruns the suite" would pass; no step-12 route honours an accepted test. So with no change to the test budget, round 3 is a re-roll of the same lottery: round 1 passed this test with 1.2s to spare, round 2 failed it by 0.26s.
- **Evidence that it is not this branch:** `git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD` over `land.ts`, `land.test.ts`, `lib.ts`, `vitest.child-deadline.ts`, `vitest.timeout-budget.ts`, `vitest.gate-fixture.ts`, `vitest.unit.config.ts`, `package.json` and `pnpm-lock.yaml` prints nothing. The plan names none of these files. The test passed 4 of 4 `dev moved` cases in isolation now (3458ms at load 21.7).
- **Next risk the owner should know about:** `test:integration` has not run in either round. `guardrails-cursor.integration.test.ts:700` `analyses dense script sources in linear time` asserts `expect(r.ms).toBeLessThan(1000)` with a fixed 1000 ms; it measured 2805 ms, 3048 ms and 1495 ms in the holistic runs (`build-plan-verify-holistic-1.md:24`, `-2.md:39`). The owner accepted it in `build-decision-1-1.md` Q2, but Step 12 cannot honour that either, so it may be the next round's failure once the unit tier passes.

## Rot Signals

tests, reliability, debt

- tests: `land.test.ts:202` `describe("pushToDev", …)` runs spawn-heavy, multi-attempt landing tests on the 5000ms unit base, although the ACTIVE knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` prescribes `tierTimeouts(true).testTimeout` for such suites.
- reliability: `vitest.timeout-budget.ts:27-40` `loadFactor` reads planned load as `(load + workers) / cores`, which put the factor at 1.58 while the full run slowed this test about 2.3x.
- debt: eight `land.test.ts pushToDev` timeouts are OPEN in `docs/failures.jsonl` (rows 220-226, 253) and in issue #814, and they have now cost two debug rounds on an unrelated branch.

## Recommended Remediation

No in-scope file needs a change. The plan (`docs/plans/202611/887-review-doc-starters-plan.md`) names no landing, test-budget or vitest file as a work target, and the failure is in none of the files this branch changed.

1. Do not edit any file of this plan to make this test pass.
2. Do not run another plain re-run and call it a fix. Run 1 and run 2 show that a re-run only re-rolls which edge test times out; the Out-of-Scope fix below is what makes Step 12 pass reliably.
3. **If** the owner authorizes work outside this plan (the decision `Get this unstuck and finish the build` does not name a file, so this report does not treat it as that authorization) → apply Out-of-Scope item 1 first, then item 2, and run the Verification Commands.
4. **If** the owner does not authorize it → the next Step 12 round passes only by chance. Bring that fact to the owner with the margins from Root Cause (round 1: 7456ms vs 8650ms; round 2: 8160ms vs 7900ms).
5. **If** any other test fails in the next round → diagnose it on its own; it is not explained by this report. Expect `guardrails-cursor.integration.test.ts:700` as the most likely candidate once `test:integration` runs.

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/land.test.ts:202`: give the `pushToDev` block the spawn-heavy budget the knowledge row prescribes: `describe("pushToDev", { timeout: tierTimeouts(true).testTimeout }, () => { … })`, with `import { tierTimeouts } from "../../../../vitest.timeout-budget";` beside the existing `import { useGateRunner } from "../../../../vitest.gate-fixture";` at `land.test.ts:7`. Keep every assertion and the `LAND_ATTEMPTS: 3` mock. Do not hard-code a bare number. This addresses `docs/failures.jsonl` rows 220-226 and 253 and belongs under #814.
- `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704`: the fixed `toBeLessThan(1000)` stopwatch assertion is not load-scaled; scale it with `loadFactor()` (as `instructions.test.ts:57` scales its corpus case) or compare against an idle baseline measured in the same test. It is the next likely Step 12 failure.
- `vitest.timeout-budget.ts:27-40`: `loadFactor` under-estimates the slowdown of spawn-heavy tests in the full parallel run (about 2.3x measured vs 1.58 planned). A whole-config change is a shared-infrastructure decision for #814, not this branch.

## Blast Radius

Localised. The in-scope remediation changes no file.

The out-of-scope `land.test.ts` change, if the owner authorizes it, reaches beyond its file only through an import:

- `vitest.timeout-budget.ts` `tierTimeouts` (shared test utility): compatible. It is a pure function already imported by unit-tier setup (`vitest.setup.ts:20`) and by `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`, `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts`; a read-only call changes no other test's budget.
- `vitest.child-deadline.ts`: compatible. It reads the running test's timeout, so a larger `describe` timeout gives the cleanup `git` calls the same larger remaining time with no code change.
- `tsconfig.test.json` typecheck and `oxlint` on the test file: need a check after the edit (`pnpm typecheck`, `pnpm lint`); the import shape matches existing test files, so no break is expected.

## Suggested Tests

- No new test for this branch: the fix is a budget change to an existing test whose assertions stay as they are.
- For the out-of-scope fix: run `land.test.ts` inside the full unit gate (not alone), because the failure only appears under the full parallel run; isolated runs pass at any load seen so far.

## Verification Commands

```bash
sysctl -n vm.loadavg
git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- .bkit/core/engine/commands/land.ts .bkit/core/engine/commands/land.test.ts .bkit/core/engine/commands/lib.ts vitest.child-deadline.ts vitest.timeout-budget.ts
npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts --reporter=verbose
pnpm bkit:gate:static-unit-integration
```

The `git diff` must print only `land.test.ts`, and only if the owner authorized the out-of-scope fix; otherwise it must print nothing. The isolated run must report `Tests  45 passed (45)`. The full gate must exit 0, and its log must show `test:integration` ran.

## Documentation Warnings

```jsonl
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl rows 220-226 and 253 record the land.test.ts load timeouts; docs/noise.md holds only its header and rules, with no entries.","action":"Record known load-sensitive tests, or state that test flakes are tracked in docs/failures.jsonl rather than docs/noise.md."}
{"topic":"testing","gap":"missing-guidance","recommendedPath":"docs/testing.md","alternativeEvidence":"docs/testing.md:565 describes the per-test limits and the child-call deadline; the knowledge row spawn-heavy-unit-suite-needs-its-own-budget-under-load holds the rule for spawn-heavy unit suites.","action":"State in docs/testing.md that a unit-tier suite whose cases spawn many child processes uses tierTimeouts(true).testTimeout, not the unit base."}
{"topic":"testing","gap":"missing-guidance","recommendedPath":".bkit/core/workflows/bkit-build.md","alternativeEvidence":"build-decision-1-1.md Q1 and Q2 accepted two out-of-scope load failures at the holistic step; Step 12 passes only on gate exit 0.","action":"Say whether an owner acceptance of an out-of-scope test failure carries into Step 12, so the owner is not told the full-suite re-run will settle it."}
```

## Hypotheses

### Hypothesis 1: A change on this branch broke the landing path or its test

#### Reason

Round 2 failed in `land.ts` code (`dropLandTree`, `pushToDev`); a branch change to that path or its test fixtures would explain a new failure.

#### Act

`git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- .bkit/core/engine/commands/land.ts .bkit/core/engine/commands/land.test.ts .bkit/core/engine/commands/lib.ts vitest.child-deadline.ts vitest.timeout-budget.ts vitest.gate-fixture.ts package.json pnpm-lock.yaml vitest.unit.config.ts`; `git log --oneline -i --grep=revert` over the same files; grep of the plan for these paths.

#### Observe

The diff printed nothing. The revert search printed nothing. The plan names none of the files.

#### Result

REFUTED — no file on the failing path changed on this branch, and no reverted attempt touches it.

### Hypothesis 2: `git worktree unlock` hung on the throwaway checkout

#### Reason

The error names `git worktree unlock` and `spawnSync git ETIMEDOUT`, which reads like a stuck git call.

#### Act

Read the error text and `docs/testing.md:565` (child-call deadline rule), and the test body at `land.test.ts:440-454`.

#### Observe

`git worktree unlock ... did not finish within 1 ms (the running test's remaining time)`; `docs/testing.md:565`: "a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts". The test took `8160ms` against `unit limits 7900ms per test`.

#### Result

REFUTED — git got 1 ms because the test body had already used its whole budget; the cleanup call is where the overrun surfaced, not its cause.

### Hypothesis 3: The `pushToDev` block runs at its unit budget in the full gate, so a re-run only re-rolls which edge test fails

#### Reason

Round 1 failed on `locks.test.ts` and round 2 on `land.test.ts`, both OPEN load timeouts; knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` describes "a different child-process-spawning unit test each run, all green in isolation".

#### Act

Compared this test's time and budget in both rounds (`grep` of `run-tests-1.md` and `run-tests-2.md`), then ran it alone: `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts -t 'dev moved' --reporter=verbose`.

#### Observe

Round 1: `load average 8.3 on 10 cores: unit limits 8650ms per test` and `✓ dev moved before every push: exhausted, nothing landed 7456ms`. Round 2: `unit limits 7900ms per test` and `× dev moved before every push: exhausted, nothing landed 8160ms`. Alone: `load average 21.7 on 10 cores: unit limits 15350ms per test` and `✓ ... pushToDev > dev moved before every push: exhausted, nothing landed 3458ms`, `Tests  4 passed | 41 skipped (45)`.

#### Result

CONFIRMED — the test needs about 7.5-8.2s inside the full parallel run against a 7.9-8.7s budget, and 3.5s alone even at load 21.7, so each full-gate round is close to a coin flip on this test.

### Hypothesis 4: The owner's holistic-step acceptance of this test lets Step 12 pass without a fix

#### Reason

`build-decision-1-1.md` Q1 accepted this exact test (`Decision: Accept — A`), and decision row `887-review-doc-starters-holistic-land-push-timeout` records it.

#### Act

Read `.bkit/core/workflows/bkit-build.md` Step 12 routing and the decision row.

#### Observe

Step 12: "**If** exit 0 → `TEST_VERDICT` = PASS." / "**If** exit 1 → `TEST_VERDICT` = FAIL." with no route for accepted tests. Decision rationale: "accepted as a load-timing failure outside this plan's scope; Step 12 reruns the suite".

#### Result

REFUTED — Step 12 passes only on gate exit 0, so the acceptance cannot clear it; the acceptance assumed the Step 12 re-run would pass.

### Hypothesis 5: A dependency or toolchain version change caused the slowdown

#### Reason

A version-shaped cause would show as a change in `package.json`, `pnpm-lock.yaml` or the vitest configs.

#### Act

Same `git diff` as Hypothesis 1, which covers `package.json`, `pnpm-lock.yaml` and `vitest.unit.config.ts`; vitest version from the log header.

#### Observe

The diff printed nothing; both rounds print `RUN  v5.1.0`.

#### Result

REFUTED — no dependency or runner version changed on this branch or between the two rounds.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** pushToDev spawn-heavy tests run at their unit budget in the full gate
  **Severity:** MEDIUM · **Class:** tests · **Fixable:** false · **Location:** `.bkit/core/engine/commands/land.test.ts:202` · **Round:** 1
  - **DONE WHEN:** With owner authorization for work outside the plan, describe("pushToDev") uses { timeout: tierTimeouts(true).testTimeout } with every assertion kept, and pnpm bkit:gate:static-unit-integration exits 0 with test:integration run.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/land.test.ts
<!-- bkit:task 1 end -->
