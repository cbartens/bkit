Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the failure is localised to the test's own teardown (`tests-lock.integration.test.ts:153-156`), the writer is observed, and a concrete test-side fix exists; no real-boundary soak is needed.

## CI Run

NOT CHECKED: the failure came from the local gate `pnpm bkit:gate:static-unit-integration` (status row `"source":"local"`); `feat/930-build-tick-green` has no remote branch and `gh run list --branch feat/930-build-tick-green` returned `[]`.

## Prior Attempts Reviewed

None

## Prior Knowledge

- local-pnpm-test-full-parallelism-integration-timeouts-flake: spawn-heavy integration files flake under full-suite load and pass in isolation — applied as the isolation re-run (5 of 5 passed); its timeout mechanism does not match this ENOTEMPTY (Hypothesis 4).
- spawn-heavy-unit-suite-needs-its-own-budget-under-load: load-scaled budgets under-estimate contention — applied only as context for why the race window widens under the full gate; no budget change is indicated.

Reverted commits touching `tests-lock.integration.test.ts`, `bkit-machine-lock.sh` or `tasks.ts`: none found (`git log -i --grep=revert` on those paths returned nothing; the same grep without the path filter returns hits, so the read works).

## Related Issues

- #916 — Tests lock: waiting runs win at random, so one can wait out its limit (CLOSED); its commit `872abbdca` added the failing `bkit tests jump` cases.
- #481 — Flake triage (OPEN)

## Failures

One failure out of 2067 tests: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > bkit tests jump > tests jump refuses a run name two waiting runs share`, 660 ms. Every assertion in the test body passed. The error is thrown in `afterEach` at line 155, `fs.rmSync(tmp, { recursive: true, force: true })`: `Error: ENOTEMPTY, Directory not empty: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-ZaB5Be`. The other 17 cases in the file passed in the same run. No other failure in the gate is related.

## Root Cause

The failure is pre-existing test flakiness, not a defect in this feature. The test, the lock script and `tests.ts` are byte-identical to base `a2c8e2741`; this branch changes only `tasks.ts`, `tasks.test.ts`, `dist/commands/workflow/tasks.js` and `docs/deferrals.jsonl`.

- **Proximate cause:** `hold()` (`tests-lock.integration.test.ts:203-219`) runs `take_local_stack_lock "external holder" tests; exec sleep 30`. `take_local_stack_lock` starts a backgrounded `/usr/bin/perl` lock holder (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:198-414`). That perl process is a grandchild and is not in `children`, so `holder.child.kill("SIGTERM")` and afterEach's `SIGKILL` reach only the `sleep`. `await holder.done` resolves when `sleep` exits. The perl process then notices its parent is gone (it polls every 0.1 s), writes `tests.last.lock`, a `tests.last.XXXXXX` temp file and `tests.last`, and unlinks `tests.lock.holder`, all inside `tmp/cache/bkit/machine-lock`. The probe saw these entries appear 20-40 ms after the holder exited. When afterEach's `rmSync` is walking that folder at the same moment, the folder gains an entry after being emptied and its removal fails with ENOTEMPTY.
- **Correction to the hint:** the writer is not a killed child still writing; it is a grandchild that the kill never reaches.
- **Design fragility:** the test treats "the holder's `sleep` exited" as "the lock is released and its files are settled". The lock script finishes asynchronously in a separate process, and the teardown neither waits for it nor retries.
- **Contributing factors:** this case ends immediately after `await holder.done` with nothing that waits on the lock, so teardown starts inside the perl process's 0-100 ms poll window. The cases that wait on a queued run cannot hit it, because that run takes the lock only after the perl process exits. Cases that end with the holder still alive (lines 292, 310, 348, 408, 417, 447) carry the same latent race on afterEach's SIGKILL. Full-gate load (2067 tests, other worktrees queued for the lock) slows `rmSync` and the perl process, which widens the window. In isolation the file passed 5 of 5 times, and 138 scratch probe rounds did not reproduce ENOTEMPTY, so this mechanism is observed but its exact interleaving is not reproduced.

## Rot Signals

tests

- tests: `tests-lock.integration.test.ts:153-156` tears down with a single `rmSync` while an untracked perl grandchild from `hold()` can still write `tests.last*` into `tmp/cache/bkit/machine-lock`, so a passing case can fail in teardown.

## Recommended Remediation

No change is needed in the in-scope files (`.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/workflow/tasks.test.ts`). This failure says nothing about the feature.

1. Re-run the gate `pnpm bkit:gate:static-unit-integration` for this build. The failing file passed 5 of 5 times in isolation on HEAD.
2. Do not modify `tests-lock.integration.test.ts` inside #930; it is not a work target of this plan (see Out-of-Scope Recommendations).

## Out-of-Scope Recommendations

- `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:203-219` and `:153-156`: make teardown wait for the perl lock holder, not only for `sleep`. In `hold()`, resolve `done` only after `path.join(cache, "bkit", "machine-lock", "tests.lock.holder")` is gone (the perl process unlinks it as its last file action), and make `afterEach` async so that, after the SIGKILL loop, it polls until no `*.lock.holder` remains under `cache/bkit/machine-lock` (bounded by `BUDGET.hookTimeout`) before `rmSync`. Rationale: this file appears only in the failure trace; the fix belongs to the #916 tests-lock suite, not to #930.
- Same file, line 155: optionally add `maxRetries: 3, retryDelay: 50` to the `rmSync` options as a backstop. Rationale: Node's `rmSync` retries ENOTEMPTY only when `maxRetries` is set (https://raw.githubusercontent.com/nodejs/node/v24.x/doc/api/fs.md: "`maxRetries` {integer} If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or `EPERM` error is encountered, Node.js will retry the operation with a linear"); on its own a retry hides the race rather than removing it, so pair it with the wait above.
- `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: check whether its holder helpers share the same teardown pattern. Rationale: it drives the same `bkit-machine-lock.sh` perl holder; not inspected in this pass.

## Blast Radius

Localised. The recommended in-scope action is a gate re-run with no code change. The out-of-scope fix touches only one test file's helper and teardown; no loader, schema, public contract or shared utility depends on it.

## Suggested Tests

- For the out-of-scope fix: in `tests-lock.integration.test.ts`, a case that calls `hold()`, kills the holder, awaits `holder.done`, and then asserts that `tests.lock.holder` is absent and that `tests.last` exists. This pins down that `done` means the lock files are settled.
- Stress check for the fix (not a committed test): run the file 20 times through `pnpm bkit:test:file` under the full gate's load and expect zero ENOTEMPTY.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green"
pnpm bkit:test:file .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
pnpm bkit:test:file .bkit/core/engine/commands/workflow/tasks.test.ts
pnpm bkit:gate:static-unit-integration
```

## Documentation Warnings

```jsonl
{"topic": "noise", "gap": "starter-only: docs/noise.md holds its header and rules but no entries", "recommendedPath": "docs/noise.md", "alternativeEvidence": "None available", "action": "None for this diagnosis; no signal was downgraded. Add entries when a signal is downgraded."}
```

## Hypotheses

### Hypothesis 1: The feature diff in tasks.ts causes the tests-jump failure

#### Reason

The only code this branch changes is `.bkit/core/engine/commands/workflow/tasks.ts` (plus its test and `dist/`), and the CLI registry imports it, so every `bkit tests jump` call loads it.

#### Act

`git diff --stat a2c8e2741..HEAD -- . ':!docs/plans'`; `git diff --quiet a2c8e2741 HEAD -- .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/templates/scripts/ci/bkit-machine-lock.sh .bkit/core/engine/commands/workflow/tests.ts`; read the failure block in `run-tests-1.md`.

#### Observe

```text
 .bkit/core/engine/commands/workflow/tasks.test.ts | 61 +++++++++++++++++++++++
 .bkit/core/engine/commands/workflow/tasks.ts      |  7 ++-
 dist/commands/workflow/tasks.js                   |  8 ++-
 docs/deferrals.jsonl                              |  2 +
test+lock+tests.ts identical to base
```

```text
Error: ENOTEMPTY, Directory not empty: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-ZaB5Be '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-ZaB5Be'
 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:155:6
```

#### Result

REFUTED — every assertion in the test body passed; the error is thrown by `fs.rmSync(tmp, ...)` in `afterEach`, which no `tasks.ts` code can write into, and the test, the lock script and `tests.ts` are byte-identical to base `a2c8e2741`.

### Hypothesis 2: An orphaned perl lock-holder process writes into the temp dir after the test's holder process has exited, racing afterEach's rmSync

#### Reason

`hold()` runs `take_local_stack_lock ... ; exec sleep 30`. `take_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh:198-414` starts a backgrounded `/usr/bin/perl` that holds the flock. That perl process is a grandchild that is not in the test's `children` list, so neither `holder.child.kill("SIGTERM")` nor afterEach's `SIGKILL` reaches it. After its parent dies, it polls `getppid()` every 0.1s, then writes `tests.last` held-time history (via `mktemp "$history.XXXXXX"` and `mv`) and unlinks `tests.lock.holder`, all under `$XDG_CACHE_HOME/bkit/machine-lock`, which is inside `tmp`. `await holder.done` waits only for the `sleep` process.

#### Act

Replayed `hold()` by hand against an isolated `XDG_CACHE_HOME` in the scratchpad, sent SIGTERM, waited for the holder to exit (the equivalent of `await holder.done`), then listed the lock folder every 10 ms.

#### Observe

```text
holder exited (= await holder.done)
t+00ms: tests.lock tests.lock.holder tests.queue 
t+10ms: tests.lock tests.lock.holder tests.queue 
t+20ms: tests.last.lock tests.lock tests.lock.holder tests.queue 
t+30ms: tests.last.lPPD1X tests.last.lock tests.lock tests.lock.holder tests.queue 
t+40ms: tests.last tests.last.lock tests.lock tests.queue 
```

#### Result

CONFIRMED — three new entries (`tests.last.lock`, `tests.last.XXXXXX`, `tests.last`) appear in `tmp/cache/bkit/machine-lock` 20-40 ms after the point where the test hands over to afterEach; a directory gaining entries while `rmSync` recurses is what ENOTEMPTY reports.

### Hypothesis 3: The race reproduces on demand when rmSync runs in the post-exit window

#### Reason

If Hypothesis 2 is the cause, running `rmSync` at a swept delay after the holder exits should hit ENOTEMPTY some of the time.

#### Act

Scratchpad probe `race.mjs`: real holder, SIGTERM, await exit, delay of 0-110 ms in 10 ms steps, then `fs.rmSync(tmp, { recursive: true, force: true })`; 48 rounds idle. Then `race2.mjs`: 0-58 ms in 2 ms steps, 90 rounds with 10 CPU-burning shells on a 10-core machine.

#### Observe

```text
{"ok":48}
{"ok":90}
```

#### Result

INCONCLUSIVE — 0 of 138 rounds hit ENOTEMPTY; the interleaving needs a new entry to land between `rmSync` emptying `machine-lock/` and removing it, a window of a few milliseconds that the probes did not hit. The mechanism is observed (Hypothesis 2), but the exact ENOTEMPTY has not been reproduced outside the full gate run.

### Hypothesis 4: The failure is a load-induced timeout flake (knowledge row local-pnpm-test-full-parallelism-integration-timeouts-flake)

#### Reason

The gate ran the whole suite under heavy parallel load (other worktrees were queued for the tests lock), and that row records spawn-heavy integration files flaking under load.

#### Act

Read the failure line and the test duration in `run-tests-1.md`; ran the file in isolation 5 times on HEAD with `pnpm -s bkit:test:file .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` (load averages 7.37 5.50 8.07 on 10 cores).

#### Observe

```text
     × tests jump refuses a run name two waiting runs share 660ms
run 1 exit=0
      Tests  18 passed (18)
run 2 exit=0
      Tests  18 passed (18)
run 3 exit=0
      Tests  18 passed (18)
run 4 exit=0
      Tests  18 passed (18)
run 5 exit=0
      Tests  18 passed (18)
```

#### Result

REFUTED as stated — the failure is ENOTEMPTY after 660 ms, not a timeout. Load still plausibly widens the Hypothesis 2 window (slower `rmSync`, later scheduling of the perl process), which fits the failure appearing only in the full gate and passing 5 of 5 times in isolation.

### Hypothesis 5: The failure reproduces on base commit a2c8e2741

#### Reason

The orchestrator asked whether the failure is pre-existing.

#### Act

Not run on `a2c8e2741`: that needs a separate checkout with its own install and build, which the mandate forbids. Compared the relevant files instead (Hypothesis 1 Act) and checked when the test arrived: `git log --oneline -5 -- .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/templates/scripts/ci/bkit-machine-lock.sh`, and `git merge-base --is-ancestor 872abbdca a2c8e2741`.

#### Observe

```text
872abbdca in base
test+lock+tests.ts identical to base
872abbdca 2026-11-13 16:31:27 +1000 feat(916-tests-lock-waiting): serve runs waiting for the tests lock in arrival order
```

#### Result

INCONCLUSIVE — not executed on base. The failing test came in with `872abbdca` (#916) earlier today and is part of the base; the code path it runs is byte-identical on base and HEAD, so the race is pre-existing by construction, but no base run proves it.
