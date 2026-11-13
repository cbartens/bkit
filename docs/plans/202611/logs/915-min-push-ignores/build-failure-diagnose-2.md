Verdict: CONCERNS
Mode: NORMAL
Fingerprint: 758bde5ddce63029a0ceea4238dcb18d4ad4cd9468e6024d9bb7f77b6128d5f9
<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: all four failures are localised to named test lines with known, ledgered load-sensitivity, one mechanism is reproduced by a probe, and a concrete controlled re-run plus a stop rule exists, so no iterative instrument-fix-reverify loop is needed.

## CI Run

None — `gh run list --branch feat/915-min-push-ignores --limit 3 --json databaseId,status,conclusion,headSha` returned `[]`. The failure comes from the local gate `pnpm bkit:gate:static-unit-integration` (`run-tests-2.md`).

## Prior Attempts Reviewed

- **Attempt 1 diagnosis** (`build-failure-diagnose-1.md`, `CONCERNS`, `STANDARD`): one failure, `land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed`, timed out at 7350ms. It was judged a pre-existing load flake. P1 was "no code change, re-run the gate". P2 (a suite-level `tierTimeouts(true).testTimeout` budget) was to apply only if the same test timed out again, and only with owner approval.
- **Attempt 1 remediation** (`build-failure-remediate-1-log.md`, commit `dd6019e26`): it changed no code. It re-ran `land.test.ts` alone (`45 passed at load 11 on 10 cores`) and ran `bkit tests changed`, where an unrelated `tracker.integration.test.ts` case timed out `at 58500ms under load 20+`.
- **Why it failed:** run 2 tested the same tree. Outside `docs/plans`, `git diff 72005f370 dd6019e26` changed only `docs/deferrals.jsonl` (1 line) and `git diff dd6019e26 HEAD` only `.bkit/friction.jsonl` (1 line). The failure count still went from 1 to 4 (`build-decision-1-2.md:13` `Problems after each round: 1 → 4`, `Code changed: no`). The re-run had no precondition. It started right after `929-hung-test-never` released the `tests` lock (`run-tests-2.md:5-7`). Its budget was sampled at load 6.0 (`x1.50`, `run-tests-2.md:167`), while other sessions drove the load to 27.50-44.01 during this diagnosis (`uptime`). So the retry measured the machine, not the branch.
- **Does this re-apply a prior commit SHA or debug log?** Partly. The first step again changes no code and re-runs the gate. This is the new evidence that makes the plan different:
  - The failure count tracks load, not code (above).
  - All four failing tests have `docs/failures.jsonl` rows recorded before this branch, three of them `OPEN` (Prior Knowledge).
  - The decision's `Also red on base 263f04b7c…: 0 of 4 (local run)` comes from `bkit tests base`. That check ran each file alone with budgets of x2.37-x3.40 (`run-tests-2.log.base/0.log`-`3.log`), so it does not compare with a full-gate run. On base, the same `land.test.ts` case took `7856ms`, which is over the `7500ms` limit that failed this branch.
  - The `locks.test.ts` mechanism is reproduced by a probe (Hypothesis 2).
  - The round now has a precondition (a quiet machine) and a stop rule (if any of the four fails again, stop looping and take the fixes to the owner). It is not an unconditional retry.
- **Decision record** `build-decision-1-2.md`: `Decision: Try again — A) Try again`. This diagnosis follows it and recommends one more round, under the conditions above. The record's recommendation text, `the failures come from this branch, so a round can fix them`, is contradicted by the evidence (Hypothesis 4).

## Prior Knowledge

spawn-heavy-unit-suite-needs-its-own-budget-under-load: a spawn-heavy unit file times out because `loadFactor()` under-scales a busy machine; the fix is a suite-level `tierTimeouts(true).testTimeout`, never a bare number. Applied as the conditional `land.test.ts` remediation (P4) and the `config` rot signal.
local-pnpm-test-full-parallelism-integration-timeouts-flake: subprocess-heavy suites time out at random under full-suite parallel load; re-run alone or with reduced concurrency before calling it a regression. Applied as the isolated-file confirmation step (P2) and the reading of the base logs (Hypothesis 4).
catalog-contract-tests-share-immutable-render-matrix: build the 120-variant render matrix once in `beforeAll`. Applied as the explanation of why `catalog-parity.test.ts` now fails as a hook timeout at `:124`: the shared `beforeAll` is the step that is slow under load.
instructions-store-clause-text-and-local-entries-need-hand-edits: an edited standing line reds `has no findings` with a findings list. Checked and dismissed: run 2 shows `Error: Test timed out in 90000ms.` with no findings list, and the isolated base run passed it.
docs/failures.jsonl (folded, coverage `clean`): `publication-lock-test-fails-under-load-30ms-ps-budget` (OPEN) and `locks-dead-process-identity-reclaim-flake` (OPEN) match the `locks.test.ts` failure. `.bkit/core/engine/tools/instructions.test.ts has no findings` (OPEN) and `instructions-corpus-store-timeout-under-full-gate` (TRIAGED) match the corpus timeout. `.bkit/core/engine/commands/land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed` (OPEN, remediation "do not weaken the test timeout or assertions") matches the land timeout. `catalog-progress-authority-render-concurrency-timeout` (CLOSED) is the earlier per-case version of the catalog timeout. Applied as the proof that all four failures predate this branch.
Scar tissue: `git log --all -i --grep=revert` over `locks.ts`, `locks.test.ts`, `instructions.test.ts`, `catalog-parity.test.ts`, `land.test.ts`, `vitest.timeout-budget.ts` and `vitest.setup.ts` returned only `0ca1216ad chore(release): 5.5.0 (#648)`. Its body uses "reverted" for mutation proofs, which is unrelated. The same grep without a path returned `7c9b909ea`, `ca85faeab` and `0ca1216ad`, so the read works: no reverted attempt touches these files.

## Related Issues

- #481 — Flake triage (OPEN)
- #921 — Machine wide test lock despite low CPU usage (OPEN)
- #929 — Hung test never times out, so it holds the tests lock for hours (OPEN); its gate held the `tests` lock just before both runs (`run-tests-1.md:5`, `run-tests-2.md:5`).

## Failures

The unit stage of `pnpm bkit:gate:static-unit-integration` failed: `Test Files  4 failed | 172 passed (176)`, `Tests  3 failed | 7595 passed | 6 skipped (7604)` (`run-tests-2.md:1891-1892`). The static stage passed (prose `0 errors, 47 warnings`, slop `net findings 0`).

1. `.bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts`: `Error: Hook timed out in 26886ms.` at the `beforeAll` on `:124` (`run-tests-2.md:1836-1839`). The file ran `(8 tests | 4 skipped) 29777ms` (`run-tests-2.log:1242`); the same tree passed it in run 1 in `14709ms` (`run-tests-1.log:1098`).
2. `.bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed`: `Error: Test timed out in 7500ms.` at `:440`; it ran `10481ms` (`run-tests-2.md:508`, `:1852-1855`). This is the same test as attempt 1.
3. `.bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings`: `Error: Test timed out in 90000ms.` at `:214`; it ran `96503ms` and the file took `206421ms` (`run-tests-2.md:884-890`). In run 1 the whole file took `97332ms` (`run-tests-1.md:583`).
4. `.bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > reclaims only a proven dead matching process identity`: `TypeError: Cannot read properties of null (reading 'owner')` at `:152` (`run-tests-2.md:1878-1880`). The child process exited 0 but printed `null` for its lock.

How they relate: none is a functional assertion on #915's behaviour. Three are timeouts. The fourth is a lock acquire whose 30ms deadline runs out under the same machine load. They share one trigger, load from parallel sessions. Because the unit stage failed, `bkit:test:bats`, `bkit:test:awake` and `pnpm test:integration` never ran, so their state is unknown, not green. The artifact is clamped (`kept 1949 of 3933 lines`); for the catalog timing, the raw log `.git/bkit-outbox/915-min-push-ignores/run-tests-2.log` was read with `grep`. The JUnit totals count every failure, so none is hidden in the dropped lines.

## Root Cause

- **Common trigger.** Run 2 used the same tree as run 1, which failed only one test, and as the group gate, which passed. Machine load from parallel sessions is the only input that changed. The `tests` lock serialises bkit gates, not other agents' work. Load was 6.0 when the budget was sampled, and 27.50-44.01 during this diagnosis.
- **`locks.test.ts:146` (confirmed by probe).**
  - Proximate cause: the test spawns a child that calls `acquirePublicationLock(cwd, options)` with the suite's `options.timeoutMs: 30` (`locks.test.ts:95`). Inside it, `git rev-parse` runs first and then `processStart(process.pid, end - performance.now())`. `processStart` floors the `ps -p … -o lstart=` budget at 50ms (`locks.ts:133`). When spawns compete, `ps` misses 50ms, `startTime` is `null`, the function returns `null` (`locks.ts:165`), and the test reads `.owner` of `null`.
  - Probe result: 24 concurrent children at `timeoutMs: 30` gave `nulls=11/24`. The same 24 at `timeoutMs: 3000` gave `nulls=0/24`.
  - Design fragility: one short deadline sets both the time allowed to wait for a lock and the time allowed for the identity probe. The test only needs the child's acquire as setup, yet it inherits the 30ms deadline written for the bounding test.
- **`land.test.ts:440`.**
  - Proximate cause: three full landings with zero backoff, about 2.5s of subprocess work each, against a unit budget of `5000ms × factor` (`x1.50` = 7500ms).
  - Base comparison: on base 263f04b7c, alone, this case took `7856ms` (`run-tests-2.log.base/1.log`), which is already over 7500ms.
  - Design fragility: `vitest.timeout-budget.ts` sets the factor to the larger of `loadAverage / cores` and the planned figure `(load + workers) / cores`, sampled when the config loads (`vitest.config.ts:11`). Per file, `vitest.setup.ts:98` takes the larger of a fresh `loadAverage / cores` reading and that planned floor. Neither reading tracks what spawn-heavy cases suffer when outside load keeps rising.
- **`catalog-parity.test.ts:124`.** The shared `beforeAll` renders the full host × tracker matrix once (the knowledge-row fix). Under load it needed more than the per-file hook budget (`10000ms × 2.69` = 26886ms). In run 1 the whole file took 14709ms. Run alone on base at x2.37 it took 13593ms.
- **`instructions.test.ts:214`.** The corpus scan is CPU-bound. `CORPUS_CASE` is `60_000 × loadFactor()`, which was 90000ms at the time. Run alone on base it took 45832ms at x3.40; under the full gate it took 96503ms. The `OPEN` ledger row records the same timeout at 80400ms.
- **Contributing factors.**
  - The branch carries 140 local `dev` commits that are not on `origin/dev` (`git rev-list --count origin/dev..dev` = `140`; `7ae1a3e8b` (860), `1821a367f` (891) and the 901 merge are on the branch but not on `origin/dev`). For example, `.bkit/instructions.md` differs from `origin/dev` by `512 insertions(+), 126 deletions(-)` across the three instruction files. So base 263f04b7c is a smaller tree, and the "red on base" check compared the branch against code it does not contain.
  - None of the four failing paths is touched by a #915 commit: `git log --grep=915-min-push-ignores` over them returns only `aca48732e` (the `land.ts` import change refuted in attempt 1) and `bbb739df6` (new `land.test.ts` cases that pass).
- **Not caused by #915:** see Hypotheses 1 and 4.

## Rot Signals

tests, config, observability

- tests: `locks.test.ts:95` reuses one `timeoutMs: 30` for the bounding test and for the child setup acquire at `:146`, which fails `11/24` under concurrent spawns; `land.test.ts:440` sits at about 1.0-1.5x its unit budget even when run alone (`7856ms` on base).
- config: `vitest.timeout-budget.ts:40` `Math.max(1, measured, planned)` reads load once at config load and once per file; outside load that rises mid-run (6.0 to 44.01) is not tracked, which knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` records as under-scaling.
- observability: `decisions.ts:492` prints `the failures come from this branch, so a round can fix them` whenever `bkit tests base` finds `0` red. The base runs each file alone with a higher budget (`run-tests-2.log.base/*.log`: `x2.37`-`x3.40` against the gate's `x1.50`), so the message attributes load flakes to the branch.

## Recommended Remediation

1. **P1 — change no #915 feature file.** Leave `.bkit/core/engine/commands/land.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/commands/ci/push-gate.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts` and `.bkit/core/engine/install/managed-block.ts` as they are. No failure runs through their changed lines (Hypothesis 1).
2. **P2 — re-run under a controlled condition, not straight away.**
   - Before starting, run `uptime` and `sysctl -n hw.ncpu`, and wait until the 1-minute load average is below the core count (10). Record the `uptime` line in the remediation log.
   - Confirm the four files pass alone on this tree. Run `npx vitest run -c vitest.unit.config.ts` with these four files: `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/tools/instructions.test.ts`, `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` and `.bkit/core/engine/commands/land.test.ts`.
   - Re-run the full gate through `bkit tests run` with scope `pnpm bkit:gate:static-unit-integration`. Change no test, timeout or budget. If the run prints a `[machine-lock] ⏳` line, re-check `uptime` after the wait ends. A gate that starts at load at or above 10 does not count as the controlled run.
   - Treat only a full pass as green, because the bats, awake and integration stages have not run yet.
3. **P3 — stop rule.** If any of the four fails again in a run that started at load below 10, do not start another round. Hand the owner this evidence (pre-existing `OPEN` rows, the `7856ms` base timing, the `11/24` probe) and the choices in P4 and Out-of-Scope Recommendations. The owner's `Try again` covers this round only, not a test or budget change.
4. **P4 — `land.test.ts`, only with the owner's explicit approval** (the `OPEN` failures row says "do not weaken the test timeout or assertions"). In `.bkit/core/engine/commands/land.test.ts:202`, change the suite to `describe("pushToDev", { timeout: tierTimeouts(true).testTimeout }, () => {`. Add `import { tierTimeouts } from "../../../../vitest.timeout-budget";` beside the `../../../../vitest.gate-fixture` import at line 7. Keep `LAND_ATTEMPTS: 3` and every assertion.

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/workflow/locks.test.ts:146`: give the child's setup acquire its own options, `{ ...options, timeoutMs: 3000 }`, and keep `timeoutMs: 30` for the bounding test at `:115`. The child acquire only sets up a dead owner, and the probe showed `0/24` nulls at 3000ms against `11/24` at 30ms. It appears only in the failure trace; it is tracked by `docs/failures.jsonl` `publication-lock-test-fails-under-load-30ms-ps-budget`.
- `.bkit/core/engine/commands/workflow/locks.ts:133`: the alternative engine fix is to give `processStart` a `ps` budget that does not depend on the acquisition deadline. It changes production lock behaviour, so it needs its own issue.
- `.bkit/core/engine/tools/instructions.test.ts:57`: `CORPUS_CASE` times out under full-gate load. The `OPEN` row asks for CPU profiling before any timeout change.
- `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:124`: the shared `beforeAll` render goes over the unit hook budget under load. A suite-level `tierTimeouts(true).hookTimeout`, or a lighter matrix build, is a separate decision.
- `vitest.timeout-budget.ts:40`: raise the factor when load reaches the core count. That would cover every spawn-heavy unit file at once, and it is a shared-config decision.
- `.bkit/core/engine/commands/workflow/decisions.ts:492` with `.bkit/core/engine/commands/workflow/tests-base.ts`: either run base under the failing gate's budget, or word the `none` case as "not red on base when run alone". The current text tells the owner a load flake "comes from this branch".
- Branch hygiene: `dev` is 140 commits ahead of `origin/dev`, and this branch carries them. Landing `dev` first would make the base comparison and the challenge diff (`linesChanged 33101`, `filesChanged 529`) reflect #915 alone.
- `docs/failures.jsonl`: append these recurrences to the four matching rows, with the 30ms/3000ms probe result added to `publication-lock-test-fails-under-load-30ms-ps-budget`.

## Blast Radius

Localised. P1 to P3 change no file. P4 changes only the `pushToDev` suite's timeout in one test file, and no loader, schema, public contract or shared utility. CI pins `loadFactor()` to 1 (`vitest.timeout-budget.ts:34`), so in CI that suite's limit goes from 5000ms to 30000ms. That is compatible, but CI would catch a hang in those 31 tests later. The out-of-scope items are not part of this remediation.

## Suggested Tests

- None new for #915; the failing cases already cover their paths.
- If the out-of-scope `locks.test.ts` change is taken: run the file under concurrent spawn load (for example, 24 parallel child acquires as in Hypothesis 2) to show the setup acquire no longer returns `null`, while `bounds acquisition and preserves unverifiable owners` still asserts the `< 1000ms` bound.
- If P4 lands: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` already covers `tierTimeouts`.

## Verification Commands

- `uptime && sysctl -n hw.ncpu` (start only when the 1-minute load is below the core count)
- `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/locks.test.ts .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/audits/workflows/catalog-parity.test.ts .bkit/core/engine/commands/land.test.ts`
- `bkit tests run` with scope `pnpm bkit:gate:static-unit-integration` (the build step's own runner)
- If P4 lands: `pnpm typecheck && pnpm lint && npx vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/land.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

## Documentation Warnings

```jsonl
{"topic":"noise","gap":"no entries: docs/noise.md holds only its header and rules","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl records all four load-sensitive tests as OPEN, TRIAGED or CLOSED rows.","action":"Leave as is; this diagnosis downgrades no signal."}
{"topic":"testing","gap":"docs/testing.md gives no rule for a unit test that times out under machine load; its only timeout guidance is 'Keep the existing test timeouts' (line 27)","recommendedPath":"docs/testing.md","alternativeEvidence":"Knowledge rows spawn-heavy-unit-suite-needs-its-own-budget-under-load and local-pnpm-test-full-parallelism-integration-timeouts-flake, and the vitest.timeout-budget.ts header comment.","action":"Add a short rule: re-run alone, re-run the gate only below core-count load, then a suite-level tierTimeouts budget with owner approval."}
{"topic":"testing","gap":"no doc says that bkit tests base runs each failing file alone with a fresh load budget, so its red-on-base count does not compare with a full-gate failure","recommendedPath":".bkit/workflows.md","alternativeEvidence":"run-tests-2.log.base/0.log-3.log show bkit:test:file per file at x2.37-x3.40.","action":"State the isolation and budget difference next to the base check in the build tests-loop decision."}
```

## Hypotheses

### Hypothesis 1: A #915 change or the attempt-1 remediation caused the three new failures (`locks.test.ts`, `instructions.test.ts`, `catalog-parity.test.ts`)

#### Reason

Run 2 failed four tests where run 1 failed one, so a change between the runs, or a #915 change on these paths, is the first thing to rule out.

#### Act

Diffed the tree between the runs outside `docs/plans`, and listed the #915 commits that touch the four failing paths and their sources. Compared the same files' results in run 1 and in the group gate.

#### Observe

`git diff --stat 72005f370 dd6019e26 -- . ':!docs/plans'`: ` docs/deferrals.jsonl | 1 +`
`git diff --stat dd6019e26 HEAD -- . ':!docs/plans'`: ` .bkit/friction.jsonl | 1 +`
`git log --grep='915-min-push-ignores' 263f04b7c..HEAD -- <failing paths>`: `aca48732e chore(915-min-push-ignores): plan-execute group 1 attempt 1` (only `.bkit/core/engine/commands/land.ts | 5 ++---`) and `bbb739df6 chore(915-min-push-ignores): plan-tests group 1 attempt 1` (adds `land.test.ts` cases).
`run-tests-1.log:1098`: ` ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 14709ms`
`run-tests-1.md:583`: ` ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 97332ms`
`build-group-gate-1-2.md:716`: ` ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 4417ms`

#### Result

REFUTED — between the runs only two ledger lines changed, no #915 commit touches `locks`, `instructions` or `catalog-parity`, and the same tree passed all three before.

### Hypothesis 2: `locks.test.ts` fails because the child's 30ms acquisition deadline leaves `processStart` only its 50ms `ps` floor, which spawn contention misses

#### Reason

The child exited 0 but printed `null`. `acquirePublicationLock` returns `null` when `processStart` returns `null`, and the suite passes `timeoutMs: 30`. `docs/failures.jsonl` `publication-lock-test-fails-under-load-30ms-ps-budget` names this as "Probable … Not confirmed by instrumentation".

#### Act

Read `locks.ts:131-198` and `locks.test.ts:95-163`. Timed `ps -p $$ -o lstart=` serially at load 44. Ran the test's exact child acquire 12 times serially, then 24 concurrent children at `timeoutMs: 30`, then 24 concurrent children at `timeoutMs: 3000`, against a fresh scratch git repo.

#### Observe

`locks.ts:133`: `timeoutMs: Math.max(50, Math.min(1000, timeoutMs)),`
`locks.ts:165`: `if (!common || !startTime || !options.target || !options.invocation) return null;`
`locks.test.ts:95`: `const options = { target: "github/o/r/12", invocation: "build/run-2", timeoutMs: 30 };`
`uptime`: `load averages: 44.01 26.13 20.96`; serial `ps`: `21ms 27ms 23ms 23ms 22ms 27ms 27ms 20ms`
serial children: `nulls=0/12`
`nulls=11/24 (24 concurrent children)`
`nulls=0/24 (timeoutMs 3000)`

#### Result

CONFIRMED — under concurrent spawns the 30ms deadline yields `null` 11 of 24 times, and a 3000ms deadline yields none. The failure is load-sensitive test setup, not #915 behaviour.

### Hypothesis 3: The `catalog-parity.test.ts` hook timeout, the `instructions.test.ts` corpus timeout and the `land.test.ts` timeout are load-induced, not regressions

#### Reason

All three are pure timeouts with no assertion mismatch, on tests with `OPEN` or `CLOSED` load rows in `docs/failures.jsonl`, and run 2 started right after another worktree's gate while load kept rising.

#### Act

Read the budget lines and lock waits in both runs, the raw run-2 log for the catalog timing, the folded failures ledger rows for these keys, and `uptime` during this diagnosis.

#### Observe

`run-tests-2.md:5`: `[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (up to 1200s): in use by bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1`
`run-tests-2.md:167`: `[test-timeout-budget] load average 6.0 on 10 cores: unit limits 7500ms per test, 15000ms per hook (x1.50)`
`run-tests-2.log:1242`: ` ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests | 4 skipped) 29777ms`
`run-tests-2.md:1837`: `Error: Hook timed out in 26886ms.`
`run-tests-2.md:890`: `× has no findings 96503ms`
`run-tests-2.md:508`: `× dev moved before every push: exhausted, nothing landed 10481ms`
`docs/failures.jsonl` `.bkit/core/engine/tools/instructions.test.ts has no findings` (OPEN): `"The required full gate at 22d6b75f3 timed out on instructions.test.ts:213 has no findings at 80400ms"`
`uptime` during diagnosis: `load averages: 27.50 19.51 18.39`, then `44.01 26.13 20.96`

#### Result

CONFIRMED — the same tree passed these files in run 1, the ledger records the same timeouts on older code, and load rose well past the core count after the budget was sampled.

### Hypothesis 4: The decision's `Also red on base 263f04b7c…: 0 of 4 (local run)` proves the four failures come from this branch

#### Reason

`build-decision-1-2.md:18,22` reads `0 of 4` and recommends `the failures come from this branch, so a round can fix them`. If true, a #915 code fix is due, which contradicts Hypotheses 1-3.

#### Act

Read the base-check logs `.git/bkit-outbox/915-min-push-ignores/run-tests-2.log.base/0.log`-`3.log` and the text source `decisions.ts:491-492`. Checked what the base commit contains against the branch.

#### Observe

`0.log`: `node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/catalog-parity.test.ts` / `[test-timeout-budget] load average 14.7 on 10 cores: unit limits 11850ms per test, 23700ms per hook (x2.37)`
`1.log`: `[test-timeout-budget] load average 15.4 on 10 cores: unit limits 12200ms per test, 24400ms per hook (x2.44)` / `✓ dev moved before every push: exhausted, nothing landed 7856ms`
`2.log`: `(x3.39)` / `✓ reclaims only a proven dead matching process identity 756ms`
`3.log`: `(x3.40)` / `✓ has no findings 45832ms`
`decisions.ts:492`: `` reason = `the failures come from this branch, so a round can fix them. ${trendReason}`; ``
`git rev-list --count origin/dev..dev`: `140`; `git merge-base --is-ancestor 7ae1a3e8b origin/dev` → `860 NOT in origin/dev`

#### Result

REFUTED — the base check ran each file alone with budgets of x2.37-x3.40 against the gate's x1.50, and on base the land case took 7856ms, over the 7500ms limit that failed the branch. The base also lacks the 140 local `dev` commits the branch carries. `0 of 4` shows the tests pass alone, not that the branch broke them.

### Hypothesis 5: Attempt 1's remediation failed because it re-ran the gate without controlling load, not because its diagnosis was wrong

#### Reason

Strategy `PIVOT` asks why the earlier attempt failed. Attempt 1 said the `land.test.ts` timeout was a load flake and recommended an unconditional re-run. The re-run then failed four tests with no code change.

#### Act

Compared the attempt-1 artifacts with run 2's lock wait, budget line and failure set, and with the decision record's progress block.

#### Observe

`build-failure-remediate-1-log.md:11`: `retry ran and one unrelated test timed out at 58500ms under load 20+`
`build-decision-1-2.md:13-14`: `Problems after each round: 1 → 4` / `Code changed: no`
`run-tests-2.md:1891`: ` Test Files  4 failed | 172 passed (176)`

#### Result

CONFIRMED — attempt 1's root cause holds, and `land.test.ts` timed out again for the same reason. The re-run had no load precondition and no stop rule, so it gave a noisier result on the same tree. This attempt adds both and does not repeat the unconditional retry.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** pushToDev > dev moved before every push: exhausted, nothing landed times out again under machine load (pre-existing, OPEN in docs/failures.jsonl)
  **Severity:** MEDIUM · **Class:** tests · **Fixable:** true · **Location:** `.bkit/core/engine/commands/land.test.ts:440` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:gate:static-unit-integration passes in full (unit, bats, awake and integration) in a run started below core-count load, with no #915 feature file changed; if this test times out again in such a run, stop looping and apply the pushToDev suite tierTimeouts(true).testTimeout budget only after explicit owner approval, every assertion unchanged
  - **TEST FIRST:**
    - .bkit/core/engine/commands/land.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** reclaims only a proven dead matching process identity: the child setup acquire inherits timeoutMs 30 and returns null under spawn contention (probe 11/24 null at 30ms, 0/24 at 3000ms)
  **Severity:** MEDIUM · **Class:** tests · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/locks.test.ts:146` · **Round:** 1
  - **DONE WHEN:** the test passes in the controlled full-gate re-run; if it fails again, the owner is handed the out-of-scope fix (a separate { ...options, timeoutMs: 3000 } for the child acquire) instead of another round
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/locks.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** the corpus matches the instructions store > has no findings exceeds CORPUS_CASE (90000ms) under full-gate load (pre-existing, OPEN in docs/failures.jsonl)
  **Severity:** LOW · **Class:** tests · **Fixable:** true · **Location:** `.bkit/core/engine/tools/instructions.test.ts:214` · **Round:** 1
  - **DONE WHEN:** the test passes in the controlled full-gate re-run with its timeout unchanged; if it fails again, it goes to the owner with the OPEN ledger row, not to another round
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** rendered workflow comment contracts beforeAll render matrix exceeds the unit hook budget (26886ms) under load
  **Severity:** LOW · **Class:** tests · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:124` · **Round:** 1
  - **DONE WHEN:** the suite passes in the controlled full-gate re-run with its hook budget unchanged; if it fails again, it goes to the owner as an out-of-scope budget decision
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/catalog-parity.test.ts
<!-- bkit:task 4 end -->
