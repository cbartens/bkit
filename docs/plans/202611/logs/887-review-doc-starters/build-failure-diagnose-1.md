Verdict: CONCERNS
Mode: NORMAL
Fingerprint: 0839e278fa0991112a2745dc21a7f8083eb184c42f883d5852b7f97625c19090
<!-- verdict:end -->

# Debug Failure Diagnosis

## Scope

Inputs: `docs/plans/202611/logs/887-review-doc-starters/run-tests-1.md`, `docs/plans/202611/887-review-doc-starters-plan.md`, `docs/plans/202611/logs/887-review-doc-starters/status.jsonl`, `docs/plans/202611/logs/887-review-doc-starters/build-decision-1-1.md`. Strategy `STANDARD`.

## Notes

The single failure is a known load flake outside this plan; the gate stopped before `bkit:test:bats`, `bkit:test:awake` and `test:integration`, so those tiers are unverified.

## Mode Reasoning

NORMAL: the failing assertion pins the null to `locks.ts:162-165`, the mechanism matches an OPEN `docs/failures.jsonl` row, and the fix is concrete (out of scope); no real-boundary soak is needed.

## CI Run

NOT CHECKED: the failing gate is the local `build-run-tests` step (`pnpm bkit:gate:static-unit-integration`, log `docs/plans/202611/logs/887-review-doc-starters/run-tests-1.md`). `gh run list --branch feat/887-review-doc-starters --limit 3` returned `[]`; the same read on `dev` returned run `43551122837` (`success`), so the read works and the branch has no CI run to compare.

## Prior Attempts Reviewed

None

## Prior Knowledge

- publication-lock-test-fails-under-load-30ms-ps-budget (docs/failures.jsonl:341, OPEN): the sibling tests in the same `publication ownership lock` block got a null lock under load ~8-24 and passed in isolation; "The tests use timeoutMs 30; processStart gets a ps budget of max(50ms, remaining), so a slow ps spawn returns null." — applied as the leading mechanism, now seen on the first test of the block.
- locks-dead-process-identity-reclaim-flake (docs/failures.jsonl:342, OPEN): `reclaims only a proven dead matching process identity` fails intermittently under load — applied as evidence that the whole block is load-sensitive, not one test.
- spawn-heavy-unit-suite-needs-its-own-budget-under-load: the load-scaled budget's factor is `loadAverage / cores` floored at 1, which under-estimates spawn latency — applied as why the gate's `[test-timeout-budget]` scaling cannot rescue this test: the test's own `timeoutMs: 30` and the 50 ms `ps` floor are not scaled at all.
- publication-budget-reserves-standalone-transport-after-local-preparation: "Local git, cache and process-identity preparation can consume a 100–200ms caller network allowance before any transport starts." — applied as the same design fault inside `acquirePublicationLock`: the `end` deadline starts before `git rev-parse` and `ps`.
- local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-spawning suites time out under full parallel load — applied as context only.

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (open)
- #481 — Flake triage (open)
- #826 — Append routine workflow step updates to one comment per run (closed); its commit `401363fa1` is the last change to `locks.test.ts`.

## Failures

One failing test out of 7748; one failing file out of 178 (`Test Files  1 failed | 177 passed (178)`).

- `.bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > serializes publication for one target and invocation` → `AssertionError: expected null not to be null` at `locks.test.ts:89:20`, reached from `locks.test.ts:103:25`. Line 103 is the second acquire, with `invocation: "auto/run-2"`: the first acquire succeeded, then a lock for a different invocation (a different lock file) came back null.

Relationships and side effects:

- The failure is inside `pnpm test:coverage:unit`. The gate chains with `&&`, so `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and the whole `pnpm test:integration` tier never ran in this attempt. Those tiers are unverified, not passing.
- Everything before it passed: typecheck, lint, `format:check`, `format:tables:check`, `bkit:lint:prose` (0 errors, 47 warnings), `bkit:slop:delta` (net findings 0).
- The run started at load average 8.3 on 10 cores (`[test-timeout-budget] load average 8.3 on 10 cores`) after a 12-minute machine-lock queue behind three other worktrees' gates.
- The artifact is clamped (`kept 1865 of 3472 lines`); the dropped lines were passing-test lines per the clamp rule, and the vitest summary counts only one failure.

## Root Cause

**Issue 1: `serializes publication for one target and invocation` gets a null lock under machine load. It is a known load flake in code this branch never touches, not a regression from issue #887.**

- **Proximate cause:** `acquirePublicationLock` returns null at `.bkit/core/engine/commands/workflow/locks.ts:165` when `startTime` is null. Its deadline starts at line 162 from the test's `timeoutMs: 30` (`locks.test.ts:95`). The synchronous `git rev-parse` at line 163 then spends part or all of those 30 ms; measured here at load ~17, it took 15-48 ms per call. `processStart` at line 164 gets the remainder, which line 133 floors at 50 ms for `ps -p <pid> -o lstart=`. When `ps` takes longer than 50 ms, as it can during the full parallel unit run, `runTool` times out, `processStart` returns null and the acquire returns null. For the second acquire at `locks.test.ts:103`, a fresh lock file is the only path past line 165, so a null there can only come from the `git`/`ps` preparation (or a filesystem throw), never from lock contention.
- **Design fragility:** the deadline covers local preparation (git and process identity) as well as waiting for the lock, and the test passes a 30 ms deadline although only `bounds acquisition and preserves unverifiable owners` asserts a time bound. Neither number is scaled by the gate's load-based budget, which scales vitest's per-test timeout only.
- **Contributing factors:** the gate waited 12 minutes in the machine-lock queue behind three other worktrees' gates and started at load 8.3 on 10 cores; vitest runs files in parallel, all spawning git; the same flake is open in `docs/failures.jsonl` (rows 341 and 342) and issue #814 with no fix landed.
- **Evidence that it is not this branch:** `git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- '.bkit/core/engine/**'` lists 18 files, none of them `locks.ts`, `locks.test.ts`, `lib.ts` or `tracker.ts`; `package.json` and `pnpm-lock.yaml` are unchanged. The block's 4 tests passed 3 out of 3 isolated runs at load 16.9.
- **Uncertainty:** the failing run has no instrumentation, so it does not show whether `ps` timed out or `git` failed. Both are the same load-starved preparation step, and the remediation covers both.

## Rot Signals

tests, reliability, debt

- tests: `locks.test.ts:95` gives every publication-lock test a 30 ms acquisition deadline although only one test asserts a time bound, so ordinary load turns three logic tests into stopwatch tests.
- reliability: `locks.ts:162-165` starts the acquisition deadline before the local `git rev-parse` and `ps` calls, so a caller's short allowance can be spent before any lock attempt; the in-product caller is `tracker.ts:1745`.
- debt: the same flake is recorded OPEN at `docs/failures.jsonl:341` (`publication-lock-test-fails-under-load-30ms-ps-budget`) and `:342`, and in issue #814, and it now costs a debug round on an unrelated branch.

## Recommended Remediation

No in-scope file needs a change. The plan (`docs/plans/202611/887-review-doc-starters-plan.md`) names no lock, tracker or `lib.ts` file as a work target, and the failure is in none of the files this branch changed.

1. Do not edit any file of this plan to make this test pass.
2. Re-run the full gate, `pnpm bkit:gate:static-unit-integration`, preferably when `sysctl -n vm.loadavg` is lower. This attempt never ran `bkit:test:bats`, `bkit:test:awake` or `test:integration`, so a re-run is needed in any case to verify those tiers.
3. **If** `locks.test.ts > publication ownership lock` fails again with `expected null not to be null` and nothing else fails → bring it to the owner as a known load failure outside this plan, the same way `build-decision-1-1.md` Q1 and Q2 handled `land.test.ts` and `guardrails-cursor.integration.test.ts`. That decision does not name this test, so it does not cover it by itself.
4. **If** any other test fails → diagnose that failure on its own; it is not explained by this report.

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/workflow/locks.test.ts:95`: give the three tests that assert no time bound a generous `timeoutMs` (for example `5_000`), and keep the short deadline only in `bounds acquisition and preserves unverifiable owners`, where the time bound is the point. Track it under #814 and close `docs/failures.jsonl:341` and `:342` when it lands.
- `.bkit/core/engine/commands/workflow/locks.ts:162-164`: start `end` after the `git rev-parse` and `processStart(process.pid, ...)` preparation, or give `processStart` for the caller's own PID a fixed budget outside the wait deadline, as the knowledge row `publication-budget-reserves-standalone-transport-after-local-preparation` already prescribes for the network allowance. This makes the product caller at `tracker.ts:1745` fall back to standalone comments less often under load.

## Blast Radius

Localised. The in-scope remediation is a gate re-run and changes no file.

The out-of-scope `locks.ts` change, if someone makes it later, reaches beyond its file:

- `.bkit/core/engine/commands/workflow/tracker.ts:1745` (the only product caller of `acquirePublicationLock`): compatible. A later deadline start only lets the acquire succeed in more cases; the null-means-standalone contract is unchanged.
- `locks.test.ts > bounds acquisition and preserves unverifiable owners` (asserts `< 1000` ms): compatible, if `processStart` keeps its own bound of at most 1000 ms; this needs a check when the change is made.

## Suggested Tests

- In `locks.test.ts`, a test that stubs `runTool` (or `processStart`) to take longer than the caller's `timeoutMs` for the caller's own PID, and asserts that a free lock is still acquired. It pins the fix that preparation time does not count against the wait deadline.
- Keep `bounds acquisition and preserves unverifiable owners` as the single time-bound test, so the 1000 ms ceiling stays covered.
- Not for this branch: both tests belong to the out-of-scope fix under #814.

## Verification Commands

```bash
sysctl -n vm.loadavg
pnpm bkit:gate:static-unit-integration
npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/locks.test.ts -t 'publication ownership lock'
git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- '.bkit/core/engine/commands/workflow/locks*' .bkit/core/engine/commands/lib.ts
```

The full gate must pass, or fail only on the known publication-lock flake (then follow step 3 of Recommended Remediation). The isolated run must report `Tests  4 passed | 19 skipped (23)`. The `git diff` must print nothing.

## Documentation Warnings

```jsonl
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl rows 341 and 342 record the known load flakes; the noise registry holds only its header and rules, with no entries.","action":"Record known load-sensitive tests, or state that test flakes are tracked in docs/failures.jsonl rather than docs/noise.md."}
{"topic":"testing","gap":"missing-guidance","recommendedPath":"docs/testing.md","alternativeEvidence":"docs/testing.md:139 (ci-strict-time-limits) covers load-scaled vitest limits only; knowledge row spawn-heavy-unit-suite-needs-its-own-budget-under-load covers suite budgets.","action":"State that deadlines passed into code under test (such as timeoutMs) are not load-scaled, and that only time-bound tests should pass short ones."}
```

## Hypotheses

### Hypothesis 1: A change on this branch broke the publication lock

#### Reason

Any red test during Build is first suspected to come from the branch's own changes.

#### Act

`git diff --name-only dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- '.bkit/core/engine/**' vitest.setup.ts 'vitest*.ts' scripts/ci`, with `template-copies.ts` as a known-hit control; `git log` on `locks.ts` and `locks.test.ts`.

#### Observe

The diff lists 18 engine files, among them `.bkit/core/engine/install/template-copies.ts` (control count `1`), and none of `locks.ts`, `locks.test.ts`, `lib.ts`, `tracker.ts`, `vitest*.ts` or `scripts/ci`. Last change to `locks.test.ts`: `401363fa1 2026-11-08 feat(826-append-routine-workflow): debug-remediated (#886)`.

#### Result

REFUTED — no file on the failing path changed on this branch.

### Hypothesis 2: The 30 ms test deadline plus the 50 ms `ps` floor return null under load

#### Reason

The failure is `expected null not to be null` on an acquire of a fresh lock file, the run started at load 8.3 on 10 cores, and `docs/failures.jsonl:341` records the same mechanism for the sibling tests.

#### Act

Read `locks.ts:131-165` and `locks.test.ts:88-112`; measured 20 rounds of `git rev-parse --path-format=absolute --git-common-dir` and `ps -p <pid> -o lstart=` from Node; ran the block 3 times in isolation.

#### Observe

`locks.test.ts:95`: `const options = { target: "github/o/r/12", invocation: "build/run-2", timeoutMs: 30 };`
`locks.ts:133`: `timeoutMs: Math.max(50, Math.min(1000, timeoutMs)),`
`locks.ts:165`: `if (!common || !startTime || !options.target || !options.invocation) return null;`
Measured at load `{ 16.93 15.46 15.58 }`: `git_ms,ps_ms: [["21","12"],["41","20"],["48","16"],["27","28"],...,["34","16"]]`.
Isolated runs: `Tests  4 passed | 19 skipped (23)` three times.

#### Result

CONFIRMED — `git` alone can spend the whole 30 ms deadline, which leaves `ps` its 50 ms floor; a slower `ps` under the full parallel run returns null. The failing run itself is not instrumented (see Hypothesis 3).

### Hypothesis 3: The null came specifically from `ps` timing out, not from `git rev-parse` failing

#### Reason

Line 165 returns null on either a null `common` or a null `startTime`; the remediation is the same, but the report should say which one it can prove.

#### Act

Searched the run log for any `ps`, `git` or `ENOBUFS` diagnostics around the failure; `acquirePublicationLock` swallows errors in its `catch` and logs nothing.

#### Observe

The only failure output is `AssertionError: expected null not to be null` at `ownedPublication .bkit/core/engine/commands/workflow/locks.test.ts:89:20`; no diagnostic line names `ps` or `git`.

#### Result

INCONCLUSIVE — the code returns null silently, so the log cannot tell a `ps` timeout from a `git` failure; both are the load-starved preparation step.

### Hypothesis 4: A dependency or toolchain version change caused the flake

#### Reason

The plan's pre-flight (line 316) mentions a Vitest 5.0.5 to 5.1.0 update, and the run reports `RUN  v5.1.0`.

#### Act

`npx vitest --version`, `node --version`, and `git diff dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 HEAD -- package.json pnpm-lock.yaml | grep -c '^[+-]'`.

#### Observe

`vitest/5.1.0 darwin-arm64 node-v24.16.0`, `v24.16.0`, diff line count `0`, `package.json:120`: `"vitest": "5.1.0",`.

#### Result

REFUTED — the branch changes no dependency; dev runs the same Vitest and Node.

### Hypothesis 5: Parallel test files collide on one shared publication lock file

#### Reason

The lock file lives under the git common dir, so two tests sharing one repo could block each other.

#### Act

Read `repo()` in `locks.test.ts:28-34` and the lock path in `locks.ts:166-169`.

#### Observe

`const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-locks-")));` followed by `git(cwd, "init", "-q", "-b", "dev");`; the lock is `path.join(common, "bkit-outbox", "publication-locks", `${digest}.lock`)`, and the failing acquire uses a different invocation, so a different digest.

#### Result

REFUTED — each test has its own temporary repo, and the failing acquire targets a lock file nobody holds.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Publication lock test gets a null lock under machine load (known flake, outside this plan)
  **Severity:** LOW · **Class:** tests · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/locks.test.ts:95` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:gate:static-unit-integration passes with every tier run, or the owner accepts locks.test.ts > publication ownership lock as a known load failure outside this plan; the locks.ts/locks.test.ts fix itself is tracked under #814 and docs/failures.jsonl:341
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/locks.test.ts
<!-- bkit:task 1 end -->
