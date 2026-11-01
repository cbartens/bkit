Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL: the failure is pinned to `instructions.test.ts:206` (a fixed 60s timeout on CPU-only work, measured at 9.5s idle, 24.6s with coverage and 82s under load 20.8), and the in-scope action is a concrete gate re-run.

## CI Run

None: `gh run list --branch feat/699-engine-run-completeness --limit 3` returned `[]` (no remote CI run for this branch). The failure is local only, from `docs/plans/202610/logs/699-engine-run-completeness/run-tests-1.md` (status row `build-run-tests`, attempt 1, verdict FAIL, failures 1). Latest `dev` runs are green (`41168576134` success at `98726574b`).

## Prior Attempts Reviewed

None: `Strategy` is `STANDARD`, and this is test attempt 1. `build-decision-1-16.md` records `Decision: Try again — yes, retry the full test gate`.

## Prior Knowledge

- instructions-corpus-store-timeout-under-full-gate (docs/failures.jsonl, OPEN): the same test (`the corpus matches the instructions store > has no findings`) timed out at 60s under the full gate during 705-build-plan-convert (case reported 70877ms) and passed in isolation; root cause recorded as a whole-corpus comparison that runs close to its 60s limit under a loaded full parallel gate. Applied as the matching prior incident: same test, same symptom, store and corpus unchanged, so not a regression.
- instructions-retired-clause-timeout-under-full-gate (docs/failures.jsonl, OPEN): another case in `instructions.test.ts` timed out under the full gate at load average 25.3 on 10 cores and passed on re-run. Applied as evidence that this file is load-sensitive across cases.
- spawn-heavy-unit-suite-needs-its-own-budget-under-load (docs/knowledge.jsonl, ACTIVE): `loadAverage / cores` under-estimates the real slowdown, so the load-scaled budget gives too little headroom on a saturated machine. Applied to explain why even a scaled budget is tight, and why a fixed 60s budget is tighter still.
- local-pnpm-test-full-parallelism-integration-timeouts-flake (docs/knowledge.jsonl, status absent so ACTIVE): full-parallelism local runs time out heavy suites without a code regression. Applied as background for the load-flake class.
- Reverted commits: `git log --grep='[Rr]evert'` over `instructions.test.ts`, `instructions.ts`, `vitest.timeout-budget.ts`, `vitest.setup.ts` returned nothing. No scar tissue.
- External signal: not consulted; the failure is an in-repo timeout budget question, not a third-party or version issue, so no `context-web-*.md` or web search was needed.

## Related Issues

None: `gh issue list -R cbartens/bkit --state all --search 'instructions.test timeout in:title,body'` returned `[]`; a second search (`timed out under load`) returned only unrelated issues (#482, #651, #502, #500, #671). The prior incidents live in `docs/failures.jsonl` rows above, not in tracker issues.

## Failures

One failure, in the unit tier of the gate `pnpm bkit:gate:static-unit-integration`:

- `FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings` / `Error: Test timed out in 60000ms.` at `.bkit/core/engine/tools/instructions.test.ts:206:3`. The case itself reports `× has no findings 82355ms`.
- Summary: `Test Files  1 failed | 162 passed (163)`, `Tests  1 failed | 6668 passed | 1 skipped (6670)`, `Duration  283.65s`.
- Machine state at start: `[test-timeout-budget] load average 20.8 on 10 cores: unit limits 10401ms per test, 20801ms per hook (x2.08)`.
- The sibling case `sync has nothing left to rewrite` passed but took `45756ms` of its own fixed 60s, so it was close to failing too.
- No assertion failed. The failure is a time limit, not a wrong result.
- Knock-on: the gate chain stopped at `test:coverage:unit` (three `ELIFECYCLE  Command failed with exit code 1.` lines), so `pnpm bkit:test:bats` and `pnpm test:integration` never ran in round 1. Their state is unknown, not green.
- The artifact was clamped (`kept 1882 of 3484 lines`); the dropped middle was not read, but the failure summary and the failing case are inside the kept text.

## Root Cause

Issue 1: `has no findings` timed out under a loaded, coverage-instrumented full gate. This is a known flaky test on `dev`, not a regression from this branch.

- Proximate cause: the case runs `checkClauses(CLAUSES, CORPUS)` (`.bkit/core/engine/tools/instructions.ts:726`). For every corpus file, every clause and every prose line, it runs a word-level Levenshtein near-copy check (`similarity`, `instructions.ts:537`). This is synchronous, CPU-only work on the test thread. Measured on the current tree (base `9e4a414aa`) at load average about 2.4 on 10 cores:
  - without coverage: `has no findings 9528ms`
  - with v8 coverage on `instructions.ts`, as the gate runs it: `has no findings 24605ms`, so coverage alone makes it about 2.6 times slower.
  - In the gate at load 20.8 on 10 cores, it took `82355ms`, about 3.3 times the coverage-on idle time. That is more than the fixed `{ timeout: 60_000 }`.
- Design fragility: the four corpus cases in `.bkit/core/engine/tools/instructions.test.ts` (lines 153, 206, 221, 226) set a fixed per-test `timeout: 60_000`. A per-test timeout replaces the load-scaled `testTimeout` that `vitest.timeout-budget.ts` / `vitest.setup.ts` work out, so this case gets no extra time on a busy machine. Every other unit test got its limit multiplied by 2.08 that run. With the same factor applied, 60s would have become about 125s, and the 82s run would have passed.
- Contributing factors: (1) v8 coverage instrumentation of the hot inner loop in `similarity` (the gate's `--coverage.include` lists `tools/instructions`). (2) Machine load from parallel agent sessions (20.8 on 10 cores). (3) The load factor itself under-estimates the slowdown on a saturated machine (knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load`). (4) The corpus grows with every prompt or workflow added, so the base cost keeps rising towards the fixed limit.
- Not caused by this branch: the branch's only corpus edits are `+13 / -2` lines in `.bkit/core/workflows/bkit-build.md` and `.bkit/instructions.md`, and the isolated run returns no findings. The same failure was recorded on 705-build-plan-convert before this branch existed (`instructions-corpus-store-timeout-under-full-gate`, OPEN).

## Rot Signals

tests, hotpath

- tests: `.bkit/core/engine/tools/instructions.test.ts:206` has a fixed `{ timeout: 60_000 }` that bypasses the repo's load-scaled budget. It has now failed under the full gate in two separate builds (705, 699) with the `docs/failures.jsonl` row still OPEN, so it is a known, unfixed flaky test.
- hotpath: `checkClauses` (`.bkit/core/engine/tools/instructions.ts:726`) runs a word-level Levenshtein (`similarity`, `:537`) for every file × clause × prose line. It takes 9.5s idle and 24.6s with coverage, and this cost grows with the corpus.

## Recommended Remediation

The plan names no file this failure touches, so no in-scope code change is needed. Do NOT edit plan files to "fix" this: the code under test returns zero findings.

1. Re-run the full gate unchanged (`pnpm bkit:gate:static-unit-integration`, via the workflow's `bkit tests run`) when the machine is less loaded. Check `uptime` first. Round 1 started at load 20.8 on 10 cores; at a load per core near 1, the case takes about 25s with coverage, well inside 60s.
2. Treat round 2 as the first real run of `pnpm bkit:test:bats` and `pnpm test:integration`. They never ran in round 1, so any failure there is new evidence, not a repeat of this one.
3. If round 2 fails only on the same `instructions.test.ts` corpus timeout again, classify it as the known OPEN flaky test `instructions-corpus-store-timeout-under-full-gate`, not a feature failure. Escalate the out-of-scope fix below to the owner rather than widening this plan.

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.test.ts:153,206,221,226`: scale the four fixed `{ timeout: 60_000 }` overrides by the load factor (for example `60_000 * loadFactor()` imported from `vitest.timeout-budget.ts`), or move the shared corpus check into one `beforeAll` with a scaled `hookTimeout`. Reason: a fixed per-test timeout replaces the load-scaled budget, and at the measured factor 2.08 the 82s run would have passed under a 125s limit. Not named by the plan.
- `.bkit/core/engine/tools/instructions.ts:537,726`: cut the cost of the near-copy scan, for example by skipping the Levenshtein when word counts differ by more than the similarity cut-off allows, or by caching each clause's compiled forms per line. Reason: this is the slow loop that coverage makes 2.6 times slower; the base cost grows with every prompt and workflow. Not named by the plan.
- `docs/failures.jsonl` row `instructions-corpus-store-timeout-under-full-gate`: add this re-observation (699 run-tests-1, `82355ms`, load 20.8 on 10 cores, isolated `9528ms` / coverage-on `24605ms`). Reason: the row is the tracking record for this flaky test; the caller owns ledger writes.

## Blast Radius

Localised. The recommended remediation is a gate re-run with no file change. The out-of-scope test-file change would only touch `instructions.test.ts` and read the existing `loadFactor` export from `vitest.timeout-budget.ts`, whose contract `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` already guards. Compatible.

## Suggested Tests

- None for this plan's code: the failing case already covers the behaviour, and it passes.
- Out of scope, alongside the test-file fix: extend `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` so that a unit test with a hard-coded `timeout:` literal of 30s or more fails unless the literal is multiplied by `loadFactor()`. This stops the next fixed long timeout from bypassing the budget.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness"
export BKIT_ENGINE_JOURNAL=off
uptime   # check the load per core before the full gate; 10 cores on this machine
pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/tools/instructions.test.ts   # expect 96 passed
pnpm bkit:gate:static-unit-integration   # the full gate, now including bats and integration
```

## Hypotheses

### Hypothesis 1: The branch's corpus edits introduced a real clause finding, and the timeout hides an assertion failure

#### Reason

The branch edits `.bkit/core/workflows/bkit-build.md` and `.bkit/instructions.md`, both part of the corpus that `has no findings` checks.

#### Act

`git diff 9e4a414aa..HEAD -- .bkit/instructions.md .bkit/core/workflows/bkit-build.md`, then ran the whole file on the current tree: `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/tools/instructions.test.ts`.

#### Observe

Diff: `2 files changed, 13 insertions(+), 2 deletions(-)` (Step 4 skip route plus matching store lines). Run: `Tests  96 passed (96)`, `Duration  16.67s`. The verbose corpus run printed `✓ ... has no findings 9528ms`. The gate failure text is `Error: Test timed out in 60000ms.`, with no assertion diff.

#### Result

REFUTED — the current tree returns zero findings, and the gate failure was a time limit, not an assertion.

### Hypothesis 2: The branch made the corpus check slower by growing the corpus

#### Reason

The check's cost scales with corpus size, so a large corpus addition could push it past 60s.

#### Act

`git diff --stat 9e4a414aa..HEAD` over the corpus roots (`.bkit/core/workflows .bkit/core/prompts .agents/rules.md .bkit/instructions.md .bkit/core/docs/templates docs/templates .bkit/shared .bkit/core/.agents`), and read `docs/failures.jsonl` for earlier runs of the same test.

#### Observe

Only `.bkit/core/workflows/bkit-build.md | 9 ++++++++-` and `.bkit/instructions.md | 6 +++++-` changed. Failures row `instructions-corpus-store-timeout-under-full-gate` (OPEN): "Observed 2026-10-27 in the build workflow for 705-build-plan-convert ... `Test timed out in 60000ms` at `.bkit/core/engine/tools/instructions.test.ts` (the case reported 70877ms)".

#### Result

REFUTED — the branch adds 13 lines; the same timeout happened on another branch before this one.

### Hypothesis 3: A fixed 60s per-test timeout plus heavy machine load starves the CPU-only corpus check

#### Reason

The gate log shows `load average 20.8 on 10 cores` (x2.08). The test is synchronous CPU work, and its `{ timeout: 60_000 }` is a hard-coded number.

#### Act

Read `vitest.timeout-budget.ts` and `instructions.test.ts:150-230`; ran the corpus `describe` block alone at load about 2.4 on 10 cores.

#### Observe

`instructions.test.ts:206`: `it("has no findings", { timeout: 60_000 }, () => {`. Budget log: `unit limits 10401ms per test, 20801ms per hook (x2.08)`. The scaled limit applies only through `testTimeout`, which a per-test option replaces. Gate: `× has no findings 82355ms`. Isolated: `✓ ... has no findings 9528ms`.

#### Result

CONFIRMED — the case takes about 9.5s idle but ran 82s under load 20.8. Its fixed 60s limit does not scale; 60s × 2.08 would have been about 125s.

### Hypothesis 4: v8 coverage instrumentation multiplies the corpus check's cost in the gate

#### Reason

The gate runs `test:coverage:unit` with `--coverage.include` listing `tools/instructions`, and the hot loop is a Levenshtein inside `similarity`.

#### Act

Re-ran the corpus block with `--coverage --coverage.include='.bkit/core/engine/tools/instructions.ts'` at a similar load (2.27 at start).

#### Observe

`✓ ... has no findings 24605ms` and `✓ ... sync has nothing left to rewrite 11943ms`, against `9528ms` / `6418ms` without coverage.

#### Result

CONFIRMED — coverage makes the case about 2.6 times slower, putting it at about 41% of its 60s limit on a quiet machine, so a 2.5x or greater load slowdown breaks it.

### Hypothesis 5: The branch's `vitest.setup.ts` change (`BKIT_ENGINE_JOURNAL = "off"`) slows or breaks the unit tier

#### Reason

It is the only change on the branch to test infrastructure.

#### Act

`git diff 9e4a414aa..HEAD -- vitest.setup.ts`; compared isolated timings on the current tree.

#### Observe

`+process.env.BKIT_ENGINE_JOURNAL = "off";` (5 lines, comment plus one assignment). Isolated file run: `Tests  96 passed (96)`, `Duration  16.67s`.

#### Result

REFUTED — setting one environment variable cannot add CPU to `checkClauses`, and the file is fast on the current tree.
