## #928 — Tests lock: a hung run holds it forever, so every push waits (open)

### Narrative

The machine-wide `tests` lock limits how long a run **waits** for it (`LOCAL_STACK_LOCK_WAIT_S`), but not how long a run **holds** it. A holder keeps the lock for as long as its `run` wrapper is alive, and a hung test keeps that wrapper alive forever. Every other run on the machine, in every repo, then waits out its limit and is refused.

Observed on 2026-11-13: a `bkit:gate:changed` run in `.worktrees/787-show-authoring-rules` held the lock for 8h47m. The wrapper (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs …`) was waiting on Vitest, which was waiting on `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs`, which sat at 0.0% CPU for over 8 hours. That gate normally takes about 4 minutes. Another session's push waited its turn twice (60 s, then 10 min) and was refused both times. It could not skip the checks, because `--no-verify` is banned.

Stopping the wrapper does not help. The `run` wrapper deliberately ignores TERM, INT and HUP until its command finishes (`_lsl_run_cancel` traps), so `kill <wrapper pid>` leaves the lock held. The only way out today is to find and kill the hung test process by hand, and that process belongs to another session.

The fix: the `run` wrapper enforces its own hold limit. When its command is still running after `LOCAL_STACK_LOCK_HOLD_S` seconds, the wrapper stops the command's whole process group: TERM first, then KILL after a short grace period. It then releases the lock, says who held it, for how long and why it was stopped, and exits 124. The holder enforces the limit, not the waiter, because the OS will not hand a `flock` to a waiter while the holder is alive. A waiter could only take the lock by killing another session's processes.

`tests.last` shows typical holds of 6–11 minutes. The longest recorded hold is 1283 s (`.worktrees/922-pre-push-load`). A default of 3600 s leaves plenty of room above that.

`vitest.test-lock.ts` holds the lock through a stand-in command (`sh -c '… exec cat <&3 >/dev/null'`), not by running Vitest inside the wrapper. A hold limit that stopped only that `cat` would free the lock while Vitest kept running, so two runs would overlap. The global setup therefore has to end the Vitest run as soon as its holder exits early.

### Success Criteria

- A `run` whose command outlives `LOCAL_STACK_LOCK_HOLD_S` has that command and its process group stopped, frees the lock, and exits 124 with a `[machine-lock]` line that names the holder, the time held and the limit.
- A run waiting for the lock starts within a few seconds of the over-limit holder being stopped.
- With `LOCAL_STACK_LOCK_HOLD_S` unset, the limit is 3600 s; a value that is not a whole number >= 1 falls back to 3600 s with one note.
- A raw Vitest run whose lock holder exits before teardown fails at once with a message naming the lock, rather than carrying on unlocked.
- `scripts/ci/bkit-machine-lock.sh` and `.bkit/templates/scripts/ci/bkit-machine-lock.sh` stay byte-identical, and `.bkit/templates.md` § Machine lock documents the limit, the variable and exit 124.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Command ignores TERM | KILL follows after the grace period; the lock is freed and the wrapper exits 124. |
| Command spawned grandchildren in the same process group (Vitest workers, `node --test` children) | All of them are stopped with the command. |
| A grandchild that started its own process group (`detached: true` fixtures) | It may survive. It does not hold the lock, so the lock is still freed. |
| Wrapper was not its process group's leader (it runs inside the caller's group) | The command runs in a new process group of its own, so stopping it never signals the caller or the `bkit-test-awake.mjs` wrapper outside. |
| Nested `run` that reuses its live parent's lock (`bkit:gate:static-unit-integration` → `bkit:gate:static-unit`) | Only the run that took the lock enforces the limit; the inner run starts no timer of its own. |
| Command finishes just as the limit fires | Its own exit status wins when it exited first; no 124. |
| TERM/INT/HUP arrive during the grace period | The stop already in progress completes; the exit status stays 124. |
| `CI=true` / `CI=1` | No lock and no hold limit, as today. |
| Command reads from the terminal | It still gets the terminal: moving it into its own process group does not stop it on terminal input. |
| `take_local_stack_lock` from a sourced runner (no `run` wrapper) | No hold limit; see Out of Scope. |
| A healthy gate waits inside the lock: Gether's native E2E waits up to 150 min for its demo-tenant lease (`LEASE_WAIT_SECONDS` in `scripts/seed/demo-tenant.ts`) and up to 1800 s for its reset step (`LOCAL_E2E_READY_TIMEOUT_S`) | The limit counts that wait like any other time. A repo whose gate can legitimately run past 3600 s sets a longer `LOCAL_STACK_LOCK_HOLD_S` on that gate's script. |
| `LOCAL_STACK_LOCK_HOLD_S` set on one gate's `package.json` script, e.g. `"LOCAL_STACK_LOCK_HOLD_S=10800 node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- …"` | That gate gets 10800 s. Every other gate keeps the 3600 s default, and a nested `run` inside it starts no timer of its own. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `run` stops a command that outlives `LOCAL_STACK_LOCK_HOLD_S`, exits 124, and names the holder, time held and limit | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| a run waiting for the tests lock starts once the over-limit holder is stopped | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| a command that ignores TERM is killed after the grace period and the lock is freed | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| grandchildren in the command's process group are stopped with it, and the wrapper's own caller is not signalled | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| a nested `run` reusing its parent's lock starts no hold timer of its own | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| an unset or invalid `LOCAL_STACK_LOCK_HOLD_S` uses 3600 s, and an invalid value says so once | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| a command that finishes before the limit keeps its own exit status | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| the global setup fails the Vitest run at once when its lock holder exits before teardown | integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Hold limit for the machine lock

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Enforce `LOCAL_STACK_LOCK_HOLD_S` in the `run` wrapper
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: in the `run` entry point, run the command in its own process group with a hold timer (default 3600 s), only when this run took the lock; at the limit, TERM the group, KILL after a grace period, release the lock, print the holder, time held and limit, and exit 124; document the variable and exit 124 in the header comment
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the same change, byte-identical to the root copy
  - **READ:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the byte-identity check between the two copies
  - **DONE WHEN:** every `machine-lock.integration.test.ts` hold-limit test passes, and the two script copies are byte-identical
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run stops a command that outlives LOCAL_STACK_LOCK_HOLD_S, exits 124, and names the holder, time held and limit` fails on the command still running and the lock still held after the limit
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a run waiting for the tests lock starts once the over-limit holder is stopped` fails on the waiter giving up with exit 75
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a command that ignores TERM is killed after the grace period and the lock is freed` fails on the TERM-ignoring command surviving
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `grandchildren in the command's process group are stopped with it, and the wrapper's own caller is not signalled` fails on a surviving grandchild or a signalled caller
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a nested run reusing its parent's lock starts no hold timer of its own` fails on the inner command being stopped at its own limit
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `an unset or invalid LOCAL_STACK_LOCK_HOLD_S uses 3600 s, and an invalid value says so once` fails on no limit or no note
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a command that finishes before the limit keeps its own exit status` fails on a 124 or a lost status
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** End a raw Vitest run whose lock holder exits early
  - **UPDATE:** `vitest.test-lock.ts`: when the lock child exits before teardown, fail the Vitest run at once with a message naming the tests lock and the holder's exit, instead of only throwing at teardown
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the new `vitest-test-lock.integration.test.ts` test passes and the existing three still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup fails the Vitest run at once when its lock holder exits before teardown` fails on Vitest carrying on after its holder is gone
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the hold limit
  - **UPDATE:** `.bkit/templates.md` § Machine lock: the hold limit, `LOCAL_STACK_LOCK_HOLD_S` and its default, exit 124 beside 2 / 73 / 75, that only `run` enforces it, and how a repo gives one long gate a longer limit by prefixing that gate's `package.json` script with `LOCAL_STACK_LOCK_HOLD_S=<seconds>`, with an example
  - **UPDATE:** `.bkit/templates.md`: the Machine lock row in the tool table names the hold limit
  - **READ:** `docs/testing.md` § Stack: the wrapped-gate wording, updated only if it states that the lock is held unconditionally
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** § Machine lock names the variable, its default and exit 124
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumed: exit 124 matches GNU `timeout`, so a gate that dies at the hold limit reads as a timeout and not as a test failure.
- Assumed: a grace period of about 10 s between TERM and KILL. Vitest and `node --test` need a moment to print their results.
- Decided (owner, 2026-11-13): the default stays 3600 s, and a long gate sets its own limit on its `package.json` script. Checked against Gether (`app-gether-life`):
  - 3600 s covers every hold measured there. The longest recorded hold is 23m23s (lock waiting notes in its `docs/plans/**/logs`), beside 1283 s in bkit.
  - Gether's deepest gates are longer. `bkit:gate:static-unit-integration-e2e` runs `scripts/ci/local/local-gate.sh` (static, unit, integration, then web and native E2E, one after another), and `bkit:gate:static-unit-integration-e2e-live` adds `pnpm test:live`. `/bkit-debug` Step 3 runs the `-e2e-live` one. No timed full run of either gate is on record; adding up the parts (web E2E 4m33s measured, native E2E ~6 min estimated, a 10m56s Gradle build when the devbuild rebuilds) gives roughly 35–50 min with no waiting.
  - Those gates also wait inside the lock: up to 150 min for the demo-tenant lease and up to 1800 s for the reset step. A healthy run can therefore pass an hour.
  - A higher global default would cover Gether without configuration, but every hung quick gate would then block pushes for that long before it is stopped. The quick gates are the ones a push waits on.
  - Follow-up in Gether, after this ships and Gether copies the new script: set `LOCAL_STACK_LOCK_HOLD_S` on its two E2E gates.
- Open: whether consumers' adopted copies need a `docs/migrations.md` entry. Settle it the same way #916 does, because the script is copy-and-own.
- Not settled here: why `bkit-test-awake.test.mjs` hung. `docs/failures.jsonl` already has earlier hangs in that file (`awake-hard-timeout-fixture-repeated-group-kill`, `awake-readiness-json-publication-race`). The hold limit bounds the damage; it does not fix the hang.

### Breaking Changes & Naming

- New variable `LOCAL_STACK_LOCK_HOLD_S`, beside `LOCAL_STACK_LOCK_WAIT_S`.
- New `run` exit status 124. A gate that previously hung forever now fails after an hour by default, or after its own `LOCAL_STACK_LOCK_HOLD_S`.

### Out of Scope

- A hold limit for `take_local_stack_lock` callers that source the script and hold the lock until they exit. They have no wrapper to enforce it.
- Letting a waiter break or steal a live holder's lock.
- Detecting "idle" holders by CPU use.
- Fixing the `bkit-test-awake.test.mjs` hang itself.

### References

###### bkit:blocked-by start
- #916
###### bkit:blocked-by end

- #916 — Tests lock: waiting runs win at random, so one can wait out its limit (rewrites the same Perl helper and `run` wrapper; this issue builds on its version)
- #724 — Machine-wide test lock: one test run at a time across agents
- `.bkit/templates.md` § Machine lock
- `docs/testing.md` § Stack
- `docs/failures.jsonl` key `awake-hard-timeout-fixture-repeated-group-kill`
- `docs/failures.jsonl` key `awake-readiness-json-publication-race`

Checked the 3600 s default against Gether (`app-gether-life`) and updated the issue body.

**Outcome:** the default stays 3600 s. A gate that can legitimately run longer sets its own limit by prefixing its `package.json` script with `LOCAL_STACK_LOCK_HOLD_S=<seconds>`.

**Why:**
- 3600 s covers every hold actually measured: 23m23s at most in Gether, 1283 s in bkit.
- Gether's two deepest gates, `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` (the one `/bkit-debug` runs), add up to roughly 35–50 minutes with no waiting. No timed full run of either is on record.
- Their native E2E half also waits inside the lock: up to 150 min for the demo-tenant lease and up to 1800 s for the reset step. A healthy run can therefore pass an hour.
- Raising the default for everyone would let a hung quick gate block pushes for that long. The quick gates are the ones a push waits on.

**Changed in the body:**
- Two new edge cases: waiting inside the lock, and a per-gate override.
- Task 3 now documents the per-gate override, with an example.
- The open question about the default became a recorded decision, with the Gether evidence.
- The breaking-change note mentions the override.

**Follow-up (Gether, after this ships and Gether copies the new script):** set `LOCAL_STACK_LOCK_HOLD_S` on its two E2E gates.

No code changed and nothing committed.

**Related: #924 — Let every workflow land on local dev without pushing — https://github.com/cbartens/bkit/issues/924**

#924's new landing lock has the same risk: a wait limit does not free a lock whose holder hangs. It needs a limit on how long it can be held ([owner answer 7](https://github.com/cbartens/bkit/issues/924#issuecomment-6868621643)). That work is planned in #937 — Local landing target with design / plan local close — https://github.com/cbartens/bkit/issues/937.

Also related:
- #916 — Tests lock: waiting runs win at random, so one can wait out its limit — https://github.com/cbartens/bkit/issues/916
- #929 — Hung test never times out, so it holds the tests lock for hours — https://github.com/cbartens/bkit/issues/929

## #743 — Build group gate re-runs integration tests after every group (closed)

### Narrative

After every task group except the last, the build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) runs `bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`. The deepest declared gate wins, so in any repo that declares an integration gate, every group re-runs the whole integration suite. Step 12 then runs it once more. Build 701 ran 8 group gates at about 135s of integration tests each (`docs/plans/202610/logs/701-engine-work-build/build-group-gate-9-1.md`), so roughly 18 minutes went on integration before Step 12 even started.

The group gate should run static checks and the unit tier only (`bkit:gate:static-unit`). Integration runs once at Step 12, then again at pre-push and in CI before anything merges. Unit tests import the same code and catch most breaks a later group would hit. The cost is that a break only an integration test catches surfaces at Step 12, against the whole build's changes rather than the group that caused it.

### Success Criteria

- Step 8's group gate and the gate command Step 9 hands `@bkit-build-plan-gaps-remediate` run `bkit:gate:static-unit` only.
- Step 12 still runs the deepest declared build gate, integration included.
- `.bkit/workflows.md` § Group gate and the gate tables say which tier each step runs, and why.
- Debug Step 3 and `.husky/pre-push` are unchanged.

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Rendered bkit-build workflow matches the snapshot | unit | `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Unit-only group gate
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group gate and its fix-round handoff run `bkit:gate:static-unit` only
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 Context gate command
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate, the local gate script table, the build/debug candidate table
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: group gate line
  - **UPDATE:** `BKIT_BUILD_GATES` in `.bkit/core/engine/install/manifest.ts`: doc comment
  - **DONE WHEN:** `pnpm bkit:gate:static-unit-integration` and `bkit check` exit 0 with regenerated mirrors and snapshot
  - **TEST FIRST:**
    - n/a — workflow text and docs only; covered by the render snapshot
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Out of Scope

- Choosing integration suites per group from the files it touched: no reliable file-to-suite map exists.
- Builds already in progress (699, 715): they keep the old gate until they rebase.

### References

- #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723
- `.bkit/workflows.md` § Group gate
- `docs/decisions.jsonl` key `build-group-gate-unit-tier-only`

Done on dev in 6c115b758 (not pushed yet).

**What changed**
- The build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) now runs `bkit tests run --gate=bkit:gate:static-unit`: static checks and unit tests only. When the gate fails, Step 9 gives the fix agent the same command.
- Step 12 still runs the deepest gate the repo declares, integration included. Pre-push and CI also still run integration, and debug Step 3 is unchanged.
- The group gate's gate list is now its own constant, `BKIT_GROUP_GATES` in `.bkit/core/engine/install/manifest.ts`. `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` checks each build call site against its own list, and fails if a new `tests run` call site appears without a check.
- `.bkit/workflows.md` § Group gate explains the new split and what it costs. The gate tables and `.bkit/pipeline.md` match it.
- The decision is recorded in `docs/decisions.jsonl` under the key `build-group-gate-unit-tier-only`.

**What we give up:** a break that only an integration test catches now shows up at Step 12, against the whole build's changes. Before, it showed up at the group that caused it. A failing test at Step 12 also asks the owner (`TESTS_LOOP`) before a fix round, unless `bkit.workflows.build.tests.ask` is false.

**Checks run**
- Full gate on the first version: everything passed except two tests, which this commit updates (the local gate audit and the instructions coverage check).
- After the fix: those two test files, the render snapshots and the ledger check passed (354 passed, 2 skipped), plus `typecheck`, `lint` on the changed files and `bkit check`.
- I didn't re-run the full gate after the fix. Pre-push runs it before anything is pushed.

Builds already in progress (699, 715) keep the old gate until they rebase.

## #744 — Build agents re-run the whole unit suite after every change (closed)

### Problem

The build's agents check their work by running a whole local gate. After each change they make, `@bkit-build-plan-gaps-remediate` and `@bkit-build-plan-verify` run `pnpm bkit:gate:static-unit`, which is every static check plus the whole unit suite. `@bkit-build-plan-execute` runs `bkit:gate:static`. `@bkit-debug-failure-remediate` does the same as gaps-remediate (`.bkit/workflows.md` § Local gate scripts). A fix that touches one file and its one test still pays for the whole suite, and pays again on every fix round. The orchestrator then re-runs the gate itself at the group gate (Step 8) and at Step 12, so an agent's whole-suite run duplicates a check that follows anyway.

bkit has no gate for "only what this change affects". The `bkit:gate:*` names are the contract consumers declare, and each one runs a fixed scope.

### Outcome

The build and debug agents check a change by running only the checks and tests the change affects. The full scope runs only where the orchestrator gates: the group gate, Step 12, debug Step 3, pre-push and CI.

### Success criteria

- An agent's own check after a change runs the tests that import the changed code, plus tests that name a changed file's path, and static checks on the changed files.
- Its run time scales with the change, not with the suite.
- Leaving the new gate undeclared keeps today's behaviour, so the change is opt-in.
- No orchestrator gate gets weaker: the group gate, Step 12 and pre-push keep their current scope.

### Constraints and non-goals

- Stack-agnostic: bkit cannot write one default for "which tests does this change affect" (vitest has `--changed`, other runners differ). Like `bkit:test:file`, it is a consumer-declared script name with an I/O contract, and bkit seeds no implementation.
- Tests that read files as text (workflow markdown, config) have to be found too. An import graph alone misses them.
- Another session's uncommitted edits in the same checkout widen the selection. That costs extra tests but never gives a wrong answer.

### Decisions already made

- The build group gate runs `bkit:gate:static-unit` only, and integration runs once at Step 12: #743 — Build group gate re-runs integration tests after every group — https://github.com/cbartens/bkit/issues/743
- `bkit:test:file` runs one runner per call and picks it by file type in bkit's own repo (`scripts/ci/bkit-test-file.mjs`): #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723

### Open questions

- Name and contract: a new gate name (for example `bkit:gate:changed`) that takes the changed files as arguments, or one that works them out itself from `git`?
- Which agents switch to it: execute, gaps-remediate, verify and debug-remediate, or only the fix-round agents?
- What counts as changed: the agent's own commits since the step started, or everything uncommitted?
- Whether `bkit install` / `bkit check` should advise on it the way `test-file-script-missing` advises on `bkit:test:file`.

### References

- `.bkit/workflows.md` § Local gate scripts (which agent runs which gate)
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` step 8, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-execute.md`
- `package.json` `bkit:test:file`, `bkit:lint:file`; `scripts/ci/bkit-test-file.mjs`
- `.agents/rules.md` § Project Rules `Verify before complete` (the repo's own commit-time check)

Fixed in 52bab3514 (`fix(99): build and plan friction from the 699 and 715 runs`). It is merged to local `dev` and not pushed yet.

**What changed**
- New verb `bkit tests changed` (`.bkit/core/engine/commands/workflow/tests-changed.ts`). It works out which files the current step changed and hands that list to the project's `bkit:gate:changed` script, as decided. Build agents now run the tests for what they touched instead of the whole unit suite after every change.
- This repo's own `bkit:gate:changed` script is `scripts/gate/bkit-gate-changed.mjs`, registered in `package.json`. Each consumer supplies its own script, so bkit stays stack-independent.
- Install now warns with `gate-changed-script-missing` when a project has no `bkit:gate:changed` script. The script name lives in `manifest.ts` as `BKIT_GATE_CHANGED_SCRIPT`.
- The build and remediate prompts (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`) tell agents to use it.

**How it was checked**
- Static gate passed. Unit and integration tests (vitest): 8389 passed, 2 skipped. bats: 0 failures. The new `tests-changed.test.ts` and the install advisory test are among them.
- Tried it in a scratch repo: `tests changed` passed the right file list.

**Not done**
- Two of the guard tests were written after the code, not before it.
- Consumers have no `bkit:gate:changed` script until they add one. The install advisory says so, but no migration writes one for them.

## #607 — Test full-mode runs gate on every non-success final-check result (closed)

From the 2026-10 testing audit (#480): finding `testing-4`, HIGH. Report: `docs/audits/202610/testing.md`, audited at `5f5a097c`.

## What's wrong

`/bkit-ship` runs full-mode `runs gate` before it merges (`.bkit/core/workflows/bkit-ship.md:472`). The gate must refuse unless the final CI check (`bkit-tests-check`) ended in `success`. The code does this at `.bkit/core/engine/commands/workflow/runs.ts:879`. But the test fixtures in `tests/fixtures/gh/jobs/*.json` only ever give that check `success` or `failure`. `cancelled` and `in_progress` are tested, but only for `--capstone-only` mode (`runs.test.ts:571-594`). In the audit, changing the gate to refuse only `failure` still passed all 5624 tests. A cancelled or timed-out CI run would then let a merge through.

## Fix

Add an `it.each` in full mode over the GitHub conclusions `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale` and `startup_failure`, asserting that each one is refused. This is a test-only change.

## Done when

Changing `!== "success"` to `=== "failure"` at `runs.ts:879` makes the suite fail.

Logged in `docs/failures.jsonl` under key `audit-testing-runs-gate-non-success-conclusions-untested`.

Next step: `shortcut:build`.

## Plan

**Goal:** if anyone changes the ship gate so that it refuses only a `failure`, at least one test must fail.

### Where the gap is

- In full mode (no `--capstone-only`), `runs gate` first checks the whole run's conclusion (`.bkit/core/engine/commands/workflow/runs.ts:847-862`).
- Only after that does it check the final job, `bkit-tests-check` (`runs.ts:879`).
- So the gap opens when **the run reports `success` but the final job does not**. A realistic way to get there: the final job is `skipped` because its `if:` turned false, while the run still shows green.
- None of today's tests builds that combination. The non-success cases in `runs.test.ts:568-597` all live in the `--capstone-only` block.

### Steps

1. **Test first.** In `.bkit/core/engine/commands/workflow/runs.test.ts`, add a full-mode `it.each` that runs once per non-success conclusion GitHub can give a job: `cancelled`, `skipped`, `timed_out`, `neutral`, `action_required`, `stale`, `startup_failure`.
   - **Fixture:** a completed run with conclusion `success` whose `bkit-tests-check` job has that conclusion.
   - **Expect:** exit code `12` (`GATE.FAILED`, `runs.ts:460`), and stderr containing `concluded '<conclusion>' (not success)`.
   - **Helpers:** reuse `fixtureRun` / `capstone` from the `--capstone-only` block (`runs.test.ts:507-543`). If that needs them moved up to the enclosing `describe`, move them; don't copy them.
2. **Prove it can fail.** Temporarily change `runs.ts:879` from `capstone.conclusion !== "success"` to `capstone.conclusion === "failure"`. Run the file and watch the new cases fail. Then put the line back, and check `git diff runs.ts` is empty.
3. **Docs.** Update the `runs` row in `docs/testing.md` § Key test files, only if it lists the gate's covered cases.

### Done when

- The new cases pass, and they fail under the step-2 change.
- `pnpm bkit:gate:static-unit` and `bkit check` are green, apart from failures in files other agents are editing.
- One commit on `dev`, containing only the files this issue touched.

Ledger key to close: `audit-testing-runs-gate-non-success-conclusions-untested`.

Done in 8240a4e8, with the docs row in 61e35593 (on dev, not pushed).

- A new full-mode it.each in runs.test.ts covers a green run whose final job concluded cancelled, skipped, timed_out, neutral, action_required, stale or startup_failure. Each case expects exit 12.
- Changing runs.ts:879 to refuse only failure made all 7 cases fail.
- Re-checked by me: 144/144 pass. Ledger row closed.

## #931 — Gate logs lose pnpm's lines under pnpm -s, failing the pre-push gate (closed)

### Failing test or CI run

`.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` › Debug CI evidence sequence › "records the failed job count and reads an uncounted local round as unknown" fails at line 395: `expect(f.finishRound().code).toBe(0)` receives 7.

### What happened

Pushing `dev` failed the pre-push gate twice in a row on this one test (2066 of 2067 passed both times). The test drives a debug run through a local test round. After that round, `steps finish` exits 7, which means the round's result file (`context-tests-local-1.md`) is empty.

The cause is how the hook starts the gate. `.husky/pre-push:419` runs `pnpm -s bkit ci push-gate …`. `-s` means silent, and pnpm passes it down to every child process as the environment variable `npm_config_reporter=silent`. So every `pnpm` started underneath goes quiet as well, including the one `bkit tests run` uses to run a project's gate.

`tests run` writes everything the gate prints into a log and copies that log into the step's result file (`runToLog` in `.bkit/core/engine/commands/workflow/junit.ts`). In the test, the fixture's gate fails without printing anything on purpose. Normally the log still holds pnpm's own lines: the command it ran and "Command failed with exit code 1". With the silent setting those lines disappear too, the log is 0 bytes, and `steps finish` rightly refuses an empty result file.

It never failed when the test was run any other way (alone, six in parallel, under direnv, under the tests lock, or through plain `pnpm test:integration`), because none of those used `pnpm -s`.

The same applies outside the test: whenever bkit runs under `pnpm -s`, every gate, test file and lint file log that `runToLog` writes loses pnpm's own lines, including the exit code line an agent reads to see what failed.

### What should happen

A log written by `runToLog` holds pnpm's own lines (the command and any failure line) however bkit was started. A gate that fails without printing still leaves a non-empty result file, so the debug step that reads it carries on.

### Steps to reproduce

```bash
npm_config_reporter=silent npx vitest run .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts
```

It fails at line 395 with 7. Without the variable, all 8 tests pass.

Smaller check, in any empty folder holding a `package.json` with a script that exits 1 silently: `pnpm <script> > log 2>&1` writes 308 bytes, while the same command run from inside a `pnpm -s` script writes 0 bytes.

### How often

Every time the test runs with `npm_config_reporter=silent` set, so every full pre-push gate.

### Affected area

`runToLog` in `.bkit/core/engine/commands/workflow/junit.ts`, which all three of these log writers go through:

- the `tests run` local gate run (`.bkit/core/engine/commands/workflow/tests.ts:1778`);
- the lint step of `tests red` (`tests.ts:2033`);
- the one-file test runner (`junit.ts:137`).

### Where and when

Local `dev` at `22357e996`, 2026-11-13, pushed from macOS with the husky pre-push hook.

### Evidence

- Push log: the gate failed with "1 failed | 2066 passed (2067)", the failure at line 395 receiving 7.
- The difference between a script's environment with and without `pnpm -s` is exactly one variable: `npm_config_reporter=silent`.
- I first recorded this as a flaky test in `docs/failures.jsonl` key `debug-ci-evidence-local-round-artifact-missing-in-pre-push` (commit `22357e996`). That row is wrong about the cause and gets corrected by the fix.

### References

- #912 — the debug loop change that added this test
- `.husky/pre-push:419`, the gate start with `pnpm -s`
- `.bkit/core/engine/commands/workflow/steps.ts:358`, the empty-artifact check behind exit 7
- `docs/failures.jsonl` key `debug-ci-evidence-local-round-artifact-missing-in-pre-push`

Fixed on `dev` in commit 0bf7db750 and pushed (`d28117fa8..0bf7db750`).

**What changed**

- `.bkit/core/engine/commands/workflow/junit.ts`: a new `logEnv` builds the environment for the command `runToLog` runs. It removes `npm_config_reporter=silent` and keeps every other variable, and any other reporter value. So gate, lint-file and test-file logs keep pnpm's own lines (the script it ran and the failure exit code), however bkit was started.
- `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: the fixture now sets `npm_config_reporter=silent` itself. The test checks the same thing however the suite is started, and it is the regression test for the fix. Before the code change it failed at line 395 with exit 7 on every run; after it, all 8 pass.
- `.bkit/core/engine/commands/workflow/junit.test.ts`: a unit test for `logEnv`. The silent reporter is dropped, other reporters and variables are kept, and a silent reporter passed in by the caller is dropped too.
- `docs/failures.jsonl` key `debug-ci-evidence-local-round-artifact-missing-in-pre-push`: the row I first wrote as a flaky test with an unknown cause now holds the real cause and fix, with status CLOSED.
- `dist/commands/workflow/junit.js`, `DETAILS.md` and `docs/capabilities.md` are regenerated to match.

**Checks**

- The pre-commit hook passed, including the check that `dist/` matches the source.
- The full pre-push gate passed: 7663 unit tests (2 skipped) and 2067 of 2067 integration tests, where the two earlier pushes failed on this test.
- CI on the pushed commit is still running: [bkit-ci](https://github.com/cbartens/bkit/actions/runs/43427471613) and [bkit-trivy](https://github.com/cbartens/bkit/actions/runs/43427471605).

**Not done**

- `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` › "with N slots, N runs hold a named lock at once and run N+1 waits naming every holder" failed once, in a full integration run I started by hand while debugging this. It passed in the pre-push gate above. It's unrelated to this fix and hasn't been looked into.

CI failed on the push that carried 0bf7db750 (run https://github.com/cbartens/bkit/actions/runs/43427471613): 9 tests in the unit and integration jobs. The #931 change itself didn't cause any of them. They came from earlier commits that were all `[skip ci]`, so this was the first CI run to reach them.

Fixed on local `dev` in 10d2e0815, `fix(ci-shallow-history): read old shipped text from fixtures, give test clones a git identity`. It is committed but not pushed yet.

- **6 tests read old git history.** `checks/after/tools.test.ts` (4 tests) and `install/modules/core.integration.test.ts` (2 tests) used `git show <old revision>:…`. CI checks out a single commit with no history or tags, so those reads fail there. They only ever passed on full local clones. The old text now lives in `tests/fixtures/shipped-text/<revision>/`, and the tests read it from there. `install/project-docs.test.ts` had the same `git show` but silently skipped its check when history was missing. It now reads the same fixtures and always checks.
- **3 tests needed a global git identity.** In `ledgers/journal.integration.test.ts`, the CI handoff tests let the engine make a commit in a test clone that had no git identity of its own. They passed on any machine with a global `user.name`/`user.email` and failed in CI. The test clone now sets its own identity. Reproduced locally by pointing `HOME` at a folder whose `.gitconfig` sets `useConfigOnly = true`: 3 tests failed before the fix and all passed after it.
- `docs/testing.md` now says where frozen shipped text lives and why tests never read it from git history.

Checks: the three fixed files passed 227 of 227 tests with no global git identity. `project-docs.test.ts` passed 14 of 14. `tsc -p tsconfig.test.json` is clean. CI itself won't confirm this until dev is pushed.

## #920 — Build agents run folder-wide tests mid-step and block other worktrees (closed)

### Narrative

The build and debug prompts tell each agent which check to run at the end of its step (`bkit tests changed --fallback=...`), but nothing about how to run tests while it works, so the agent picks its own command. A narrow pick (named test files) is lock-free, because `vitest.test-lock.ts` `testLockDecision` skips the lock when every argument is an existing file. A wide pick (a folder, a pattern, the whole suite, a related-files mode, or a raw `bkit:gate:*` script) holds the machine-wide tests lock for as long as it runs, and every other worktree's tests and pushes wait behind it.

The one rule that narrows test runs, `Local pre-commit` (`.bkit/core/.agents/rules.md`, Universal Rules › Testing & Debugging), covers commits only and ends "`/bkit-*` steps run their own gates", which reads as an exemption for the workflow agents. The prompts only apply it (`.bkit/instructions.md` § `local-pre-commit`, relation `applies`); none carries the bullet in its `**Rules:**` block.

The fix: reword `Local pre-commit` so it also covers runs made while working, and have every build and debug prompt that runs tests carry the whole bullet. The step's own named command stays its only wide run.

Evidence from the #860 build (#860 — Move deterministic bookkeeping and safe recovery into the engine — https://github.com/cbartens/bkit/issues/860): its 69 subagents ran 126 test commands. About 80 named their files (no lock), about 25 were the required end-of-step `bkit tests changed` runs, and about 12 were wide runs that no prompt or brief asked for:

<!-- prettier-ignore -->
| Agent | Command it chose |
| --- | --- |
| tasks, group 1 | `vitest run .bkit/core/engine/commands .bkit/core/engine/ledgers` |
| verify, group 1 | `npx vitest run` (whole suite) |
| verify, group 2 | `pnpm bkit:gate:static-unit`, which the group gate (`.bkit/core/workflows/bkit-build.md` Step 8) runs again straight afterwards |
| tasks, group 5 | a `…/workflow/runs` pattern, then `pnpm bkit:gate:changed` on top of its required `tests changed` |
| verify, group 5 | `vitest related --run …` twice, and a run including the `.bkit/core/engine/render` folder |
| verify, group 6 | `pnpm exec vitest run` (whole suite) |
| tasks, group 7 | the `.bkit/core/engine/ledgers` folder twice, then `.bkit/core/engine/commands/workflow`; that last run held the lock while another worktree's push waited |

### Success Criteria

- `Local pre-commit` says that before a commit and while working, an agent runs only the tests the change affects, naming each test file, and never a folder, a pattern, the full suite or a `bkit:gate:*` script; a `/bkit-*` step's named command is its only wider run.
- `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-remediate` each carry the whole bullet in their `**Rules:**` block, and every host's rendered copy matches.
- The retired wording is recorded, so `pnpm instructions:sync` rewrites any copy still holding it.
- The wording names no test runner or stack.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A step's own named command (`bkit tests changed`, the group gate) is wide | Still runs; the rule names it as the step's only wider run |
| A test file outside the diff imports changed code | The agent names that file; it is a test the change affects |
| The change touches many files | The agent names each test file; a long list of files stays lock-free |
| A consumer uses another test runner (pytest, jest) | The wording still applies: it speaks of test files, not one runner |
| A prompt copy drifts from `rules.md` | The `.bkit/core/engine/tools/instructions.test.ts` corpus checks fail until sync rewrites it |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| every build and debug prompt that runs tests carries `local-pre-commit` | unit | `.bkit/core/engine/tools/instructions.test.ts` |
| `local-pre-commit` covers test runs made while working, not only before a commit | unit | `.bkit/core/engine/tools/instructions.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Narrow test runs while agents work
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it
  - **UPDATE:** `.bkit/core/.agents/rules.md`: reword the `Local pre-commit` bullet per Success Criteria 1
  - **UPDATE:** `.bkit/instructions.md`: in `### local-pre-commit`, the new text, the old text under `retired`, and a `- carry:` line naming the five prompts in Success Criteria 2
  - **READ:** `.bkit/instructions.md`: `## Format` (rule section lines, the `carry` relation)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **DONE WHEN:** the store entry and the `rules.md` bullet hold the same new text, and the five prompts are listed under `carry`
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every build and debug prompt that runs tests carries local-pre-commit` fails on a prompt that runs tests but is missing from the rule's `carry` list
    - `.bkit/core/engine/tools/instructions.test.ts` `local-pre-commit covers test runs made while working, not only before a commit` fails on rule text that limits itself to before a commit
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Copy the reworded rule into the prompts, mirrors and installed rules file
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-build-plan-tests.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md`: the `**Rules:**` block gains the bullet, written by `pnpm instructions:sync`, not by hand
  - **UPDATE:** `.agents/rules.md` and the host mirrors: rewritten by `pnpm bkit:generate`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/engine/tools/instructions.test.ts` `has no findings` and `sync has nothing left to rewrite` pass, and `bkit check` reports no mirror drift
  - **TEST FIRST:** n/a — generated copies, checked by the existing corpus tests named in DONE WHEN
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumed: the rule keeps its name and ID `local-pre-commit`. Renaming it would touch every tag that cites it (`.bkit/instructions.md` § Local Instructions) for no change in behaviour.
- Assumed: verify in group mode keeps running tests, but only by named file, to check each task's `DONE WHEN`. The rule covers this; no step text changes.
- Order per the store's rules: write the `## Rules` entry first, run `pnpm instructions:sync` without `--write` to check, then write.

### Breaking Changes & Naming

None. Consumers get the reworded bullet in their installed `.agents/rules.md` on `bkit upgrade`; nothing they declare changes.

### Out of Scope

- Enforcing the lock on raw runner commands with a host hook: #822 — Route raw test-runner commands through the tests lock per host — https://github.com/cbartens/bkit/issues/822
- Which waiting run gets the lock next: #916 — Tests lock: waiting runs win at random, so one can wait out its limit — https://github.com/cbartens/bkit/issues/916
- Changing what `bkit tests changed` or the group gate runs.

### References

- #744 — Build agents re-run the whole unit suite after every change — https://github.com/cbartens/bkit/issues/744 (made the end-of-step check narrow; this issue covers the runs between those checks)
- `.bkit/core/.agents/rules.md` § Testing & Debugging `Local pre-commit`
- `.bkit/instructions.md` § `local-pre-commit`, § `local-tests-first` (an existing `carry` example)
- `vitest.test-lock.ts` `testLockDecision`
- `.bkit/core/prompts/bkit-build-plan-tasks.md` steps 8 and 10; `bkit-build-plan-gaps-remediate.md` step 9; `bkit-build-plan-verify.md` steps 6 and 7; `bkit-build-plan-tests.md` step 6; `bkit-debug-failure-remediate.md` step 8
- `.bkit/core/workflows/bkit-build.md` Step 8 (group gate)

Rewrote the body from the idea shape into the change shape, and swapped `next:design` for `next:build`. The owner settled the three open questions: widen the shared `Local pre-commit` rule rather than adding a build-only one, keep verify's own test runs but only by named file, and include `bkit-debug-failure-remediate`. That last prompt has the same gap: its step 8 names only the end-of-step `bkit tests changed`.

The fix comes down to one rule reworded in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md` § `local-pre-commit`. The five prompts are then listed under `carry`, so `pnpm instructions:sync` copies the whole bullet into each one. The body now has two tasks in one group, plus two planned unit tests in `.bkit/core/engine/tools/instructions.test.ts`. No code or prompt has changed yet.

## Landed on local dev (not pushed yet)

The work for this issue is now one commit on local `dev`: `a2c12d244` — "feat(920-build-agents-run): build and debug agents run only named test files while working". It is the whole `feat/920-build-agents-run` branch squashed into a single commit. It sits on top of `d8cee96cf`, and **dev still needs a push** before CI runs on it.

What changed:

- `Local pre-commit` now also covers test runs agents make while they work. They name each test file the change affects, and never run a folder, a pattern, the full suite or a `bkit:gate:*` script. The only wider run is a command a `/bkit-*` step names. The six build and debug prompts that run tests carry the rule, and `Local tests first` no longer asks for the full local suite.
- Ship Step 2's fallback for when `gh` is unavailable now reads the PR's check runs instead of the combined commit status. It stops on a cancelled, action-required or stale check, and sends a failed, timed-out, startup-failure or error check to `/bkit-debug`.
- `docs/security.md` records the accepted risk that an audit report pushed under a `[skip ci]` head skips the CI secret scan.

The branch also got a docs sync like the one `/bkit-ship` does before the squash. It ran `bkit roadmap feature` (a SHIPPED row in `.bkit/issues.jsonl`, and a new render of `docs/roadmap.md`) and changed `docs/testing.md` in three places:
- `## Tests lock`: a new bullet saying agents' own test runs name each test file, so only a `/bkit-*` step's named commands wait for the lock.
- The `ship-invariants.test.ts` row now lists the Step 2 fallback checks.
- The `instructions.test.ts` row now lists the `local-pre-commit` and `local-tests-first` checks.

## Checks

- On the branch before landing: tests (39 files, 2246 passed), typecheck, oxlint, `bkit check` and `pnpm bkit:graph:check` all passed.
- Pre-commit hooks ran and passed on both commits.
- `git diff dev feat/920-build-agents-run` was empty, so dev holds exactly what the branch held.
- On dev: `pnpm build` passed and left `dist/` unchanged. `node dist/cli.js check` exited 0, with 14 advisories and no drift.
- `pnpm bkit:graph:check` run by hand in the main checkout reported drift in `docs/capabilities.md`. The drift was in symbol counts for files this change does not touch. The same tree passed `pnpm bkit:graph:check` in the feature worktree. It also passed the clean-checkout check the pre-push hook uses (`bash scripts/graphify/bkit-graphify.sh check-at HEAD`: "docs/capabilities.md matches a rebuild at a2c12d244"). So the by-hand drift comes from the main checkout's local graph cache, not from the commit.

## Still open: four LOW deferrals

- `920-build-agents-run-challenge-low-docs-security-md-25`: the accepted-risk text in `docs/security.md` says `dev` or `main`, but the owner accepted `dev` only. The pre-push hook allows the same for `main`.
- `920-build-agents-run-challenge-low-bkit-core-agents-rules-md-123`: if a stack's test runner runs tests by package or folder rather than by file (for example `go test ./internal/foo/`), `Local pre-commit` leaves no valid way to run tests.
- `920-build-agents-run-challenge-low-bkit-core-agents-rules-md-121`: `Local tests first` says the full suite runs only in the pre-push hook. That contradicts the full-suite runs some workflow steps name, and the rule for when no hook is installed.
- `920-build-agents-run-challenge-low-vitest-setup-ts-171`: a test hook with its own longer timeout, such as `beforeAll(fn, 120_000)`, still has child processes that set no timeout killed at the file's shorter hook timeout.

## Cleanup

- `bkit worktrees remove` would not remove the worktree (reason `not-landed`), because it checks for landed work against `origin/dev`, and dev is not pushed. Instead I removed the worktree's `.bkit/.env` link, then ran plain `git worktree remove` (no force) and `git worktree prune`.
- Deleted the local branch `feat/920-build-agents-run`, after confirming dev's tree matched it exactly.
- There was no remote branch to delete.

## #891 — Build: gate stuck on tests already red on dev, owner accept ignored (closed)

## Rescope: no accepting red tests. Give better advice at the pause instead.

This replaces everything above it. The marker sits on the line above this heading, so the workflows read this comment and nothing earlier.

### What happened

A consumer's `dev` had 3 red unit tests that the build's branch did not cause. A clean `dev` checkout shows the same 3 failures: `Tests 3 failed | 8 passed (11)`. They were the consumer's own: a dead-code registry missing two new files, and a suppression-count ceiling that wasn't raised. `/bkit-build` built and verified task group 1, then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept`, and the owner took it. The gate failed again on the same tests. The second pause offered only `Try again` (a round that can't change anything) or `Stop`. Groups 2-6 never started.

### The shape stays

A failure a fix round can fix → `Try again`. A failure no round can fix → say so plainly, recommend `Stop`, and have the owner fix the cause first (here, `dev`) and then resume. That is the workflow's shape today. This issue does **not** add a way to accept red tests and build past them.

That is why the earlier design is dropped: accepted-failure records, `$BKIT_ACCEPTED_TESTS` passed into every test runner, and the same list passed through the pre-push hook. It only gets the branch *built*. CI on the PR runs the same red tests, so `/bkit-ship` still can't merge until `dev` is fixed. A lot of machinery for a branch that can't merge anyway.

### What's actually wrong (found by reading the code, not reproduced)

1. **"Try again or not" never asks why a test fails.** The loop question recommends from a trend alone (`loopTrend` / `loopProgress`, `.bkit/core/engine/commands/workflow/counters.ts:257-334`). After the first round it always recommends `Try again`. After that it recommends `Try again` only when there are fewer problems than the first round and the source changed in between; otherwise `Stop` / `Decide`. A test that also fails on `dev` can't be fixed by any round on this branch, and nothing checks for that.
2. **The pause's numbers ignore the group gate.** The verify loop's progress block counts the verify agent's problems, not the gate's failing tests (`LOOPS.verify.check` = `build-plan-verify`, `.bkit/core/engine/commands/workflow/decisions.ts:179`). In this run verify passed both rounds, so the pause showed "Problems after each round: 0 → 0" while 3 tests were red. The reason it gave ("another round is unlikely to close the remaining items") says nothing useful.
3. **"Stop, fix `dev`, resume" can loop on the old pause.**
   - Picking up the fix works in worktree mode. On every resume, Step 2's `bkit worktrees setup` fetches `dev` and rebases the branch onto it (`.bkit/core/engine/commands/workflow/worktrees.ts:1010`). In adopt mode (`RUNTIME_WORKTREES=false`, the cloud default, working on the branch in place) there is no rebase, so the owner must merge `dev` into the branch by hand.
   - The resume then goes straight back to the open pause (`.bkit/core/workflows/bkit-build.md:43`). That pause still shows the gate result from before the fix, and with no items it offers only `Try again` or `Stop`.
   - `Try again` starts a fix round (Step 9). The gate is now green, so the fix agent changes nothing, and a round that changes nothing goes back to the Decision Pause (`.bkit/core/workflows/bkit-build.md:820`). No answer re-runs the gate on its own, so the build loops on that pause.
4. **The `Accept` the owner was offered isn't in the workflow.** The Decision Pause says a group-gate failure is never an item (`.bkit/core/workflows/bkit-build.md:140`; the same goes for Step 12's suites, `:147`). So either the orchestrator made the item up, or the verify agent logged the gate's failing tests as gaps. The run's logs weren't available, so which one is not known.

### Scope

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. No new options or owner answers.

1. **Check whether the failing tests also fail on the base commit.** At a pause after a red group gate (Step 8) or a red final run (Step 12), re-run only the failing test files on the commit the branch started from. If a CI run on that exact commit exists, use it instead. Then:
   - **all failures also red on base** → recommend `Stop`: "these N tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." In adopt mode, add: "merge `dev` into the branch before resuming."
   - **some** → say so: "a round can fix 2 of 5; the build will still stop on the 3 from `dev`." The owner chooses between `Try again` and stopping now.
   - **can't tell** (no JUnit report, no `bkit:test:file` script, no base run possible) → today's trend rule, and say the cause is unknown.
   - `Try again` stays offered in every case; only the recommendation and the wording change.
   - Never use "the last CI run on `dev`" as evidence. Most bkit commits are `[skip ci]`, so that run is often many commits old.
   - Cost: in bkit, a detached checkout of an older commit, an offline `pnpm install` and one test file took about 8 s (1 s + 2 s + 5 s). Installing dependencies is most of it and will be slower in heavier repos. It runs once per pause, not once per round.
   - `bkit tests run` doesn't record which file each failing test is in today. The check has to read that from the gate's JUnit report (`classname` / `file`).
2. **Count the gate's failing tests in the pause's progress numbers**, so the trend reflects the gate, not just verify.
3. **On a resume into a pause about a red gate, re-run the gate first.** That means Step 8 for a group gate, Step 12 for the final run. If it passes, carry on without asking. If it's still red, ask again with fresh numbers. Do not add a rebase or merge of `dev` for adopt mode: the pause text tells the owner to merge it instead.
4. **Never offer `Accept` for a group-gate or suite failure**, and make the verify agent's instructions say gate failures are not verify gaps.

Out of scope: `/bkit-debug`. It often runs to fix exactly such a failure, so a "came from `dev`, can't be fixed here" label would be wrong when that failure is the job. Also out of scope: `/bkit-ship`, which still needs green CI as today.

### The existing plan

`docs/plans/202611/891-build-gate-stuck-plan.md` on `dev` and the 4 decision rows and 5 deferral rows it added (`e452f6993`) assume the dropped accept design. A re-plan replaces the plan and corrects or closes those rows. Two exceptions:
- The deferral "Run a gate's failing cases on the base commit at the Decision Pause …" is now in scope as scope item 1, without the `Accept` part.
- The deferral "Document that a runner-less test file needs one JUnit case per planned test name" is unrelated and stays open.

Next step: `/bkit-plan #891`.

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

Follow-up: #903 — Build: owner's Fix now answer is lost after the Decision Pause (agents, summary).

It holds #899 and #900, both closed as not planned in favour of #903. They are the same kind of bug as this issue: the owner answers at the Decision Pause, and a later step ignores the answer. #903 is marked blocked by this issue and runs after it ships, so this build's scope stays as it is.

When this issue ships, add anything from its body that the build left undone to #903 (its Part 3).

## Merged into local `dev` as one commit (not pushed)

`1821a367f` squashes all 62 commits of `feat/891-build-gate-stuck` into a single commit on `dev`. Nothing is pushed yet. The branch is kept, so the step-by-step history is still there, and the run's logs came across under `docs/plans/202611/logs/891-build-gate-stuck/`.

### What changed

- **New `bkit tests base`.** When a gate fails, it re-runs the failing tests at the base commit in a throwaway checkout and labels each one `base-red` (already failing on `dev`) or `branch-red` (failing only on this branch). It gives an overall verdict: `all`, `some`, `none` or `unknown`.
- **The owner's Accept now carries through.** If every failure was already red on the base, the Decision Pause says so and the owner can accept those exact tests once. After that, the group gates and the final test run stop only on new failures. Any other failing test still fails the gate.
- **No more dead-end `Try again`.** When only accepted base failures remain, the pause stops offering another round, because no round can change them.
- Verify rounds now show how many tests the group gate had failing.

### Found while merging

Four conflicts, all resolved:
- `docs/testing.md`: kept the branch's two new `tests-base` rows and dev's newer `tests.test.ts` row.
- `.bkit/version`: took dev's copy. `bkit upgrade` then changed nothing.
- `DETAILS.md` and `docs/capabilities.md`: regenerated with `pnpm bkit:graph:refresh` from the merged files.

`pnpm build` left `dist/` as merged, so the compiled output matches the merged sources.

### Checks on the merged `dev`

- `tsc` passes.
- The 12 test files the branch changed, plus the render tests: 16 files, 1119 tests, all passed.
- `bkit check` passes, with no drift between sources and host copies.

### Left to do

- Push `dev`.
- Four LOW challenge findings in `tests-base.ts` stay deferred in `docs/deferrals.jsonl` (same-name test cases, a copy error that should read `unknown`, and no cap on how many files get re-run at the base).

## #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (closed)

### Failing test or CI run

none yet. Read from `.bkit/core/workflows/bkit-build.md` and seen on a real run (Evidence).

### What happened

`/bkit-build` checks each task group on its own (Step 8, Plan Verify), and then checks the whole feature once (Step 10, Plan Verify Holistic). The two checks are handled very differently when they find a problem:

- **Step 8 has a fix loop.** Fixable gaps go to Step 9 (`@bkit-build-plan-gaps-remediate`), the group is checked again, and gaps that can't be fixed go to the Decision Pause so the owner can decide (`bkit-build.md` Step 8 sub-step 11).
- **Step 10 has none.** Anything except PASS or CONCERNS goes straight to the Failure Path, and the run ends (`bkit-build.md` Step 10 sub-step 5).

Five defects follow from this:

1. **No fix step after the holistic check.** A problem that only shows up across groups, such as two groups that each pass alone but don't fit together, or docs one group made stale, aborts the build. Nothing tries to fix it.
2. **`Fixable` is written but never read.** The holistic report writes `Fixable:` in its header, but Step 10 only holds `fields.Tasks`. A report that says every gap is fixable ends the run the same way as one that says none is.
3. **An owner decision can't be asked.** A holistic gap only the owner can settle (one outside the plan's files, say) goes to the Failure Path, not the Decision Pause. The Decision Pause couldn't list it anyway. Its `VERIFY_GAPS` branch only reads per-group reports (`build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`), not `build-plan-verify-holistic.md`.
4. **Step 10 can't run twice.** `--attempt=1` is hard-coded, the artifact name has no attempt number, and sub-step 1 skips to Step 11 whenever a verdict already exists. So even with a fix step, the check could never run again to confirm the fix.
5. **Later fixes skip the whole-feature check.** For the same reason as 4, the fix groups Build Challenge adds (Step 11 → Step 7 → Step 8/9) go back through Step 10, find a verdict already recorded, and skip it. Nothing checks how those fixes fit with the rest of the feature.

### What should happen

- A holistic FAIL with fixable gaps is fixed and checked again, the way Step 8/9 does for a group, within `build.verify.maxAttempts`.
- A holistic gap that can't be fixed, or one still open when the attempts run out, is asked at the Decision Pause, which lists the gaps from the holistic report. It is not an abort.
- Each holistic attempt writes its own report, so earlier reports stay readable.
- Fix groups added after the holistic check passed are checked as a whole feature again before the run goes on.

### Steps to reproduce

1. Run `/bkit-build` on a plan where every group passes Step 8, but the combined diff leaves something stale across groups. For example, docs one group should have updated after another group's change.
2. Step 10 writes `Verdict: FAIL`, `Fixable: true`.
3. The run calls `workflows fail` and stops at Step 10.

### How often

Every run whose holistic check finds any gap.

### Affected area

- `.bkit/core/workflows/bkit-build.md`: Step 10, the Decision Pause (`VERIFY_GAPS` items, the route back), and the Step 7 "no group left" exit.
- `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` (holistic mode) and `.bkit/core/prompts/bkit-build-plan-verify.md` (holistic attempts).
- `bkit-auto` gets the same behaviour, because it hands off to `/bkit-build`. No other workflow has a holistic check.

### Where and when

Local `/bkit-build` on 6.1.1, 2026-11-08.

### Evidence

- A run on 2026-11-08 passed all 9 groups, then the holistic report gave `Verdict: FAIL`, `Failures: 4`, `Fixable: true`. Three gaps were fixable doc and comment drift, and one needed an owner decision. The run went to the Failure Path at Step 10 sub-step 5.

### References

- #843 — Friction triage — https://github.com/cbartens/bkit/issues/843
- `.bkit/core/workflows/bkit-build.md` § Step 8 — Plan Verify, § Step 9 — Plan Gaps Remediate, § Step 10 — Plan Verify Holistic, § Decision Pause

Fixed in commit 68178c1f9 on `dev` (not pushed yet).

**What changed**

- Step 10 (holistic verify) no longer goes to the Failure Path on gaps. Fixable gaps go to a holistic fix round (`bkit-build-plan-gaps-remediate` in holistic mode), then the holistic check runs again — the same shape as Steps 8-9. No new plan tasks are created; the fix round works on the plan tasks the holistic report names.
- Gaps the fixer cannot close, a fix round that changes no source file, or a used-up limit go to the Decision Pause, which lists the holistic report's gaps as its questions (`From: holistic`).
- Each holistic round writes its own report (`build-plan-verify-holistic-{N}.md`) and fix log (`build-plan-gaps-remediate-holistic-{N}-log.md`).
- Step 10 always runs again after later groups, so Build Challenge's fix groups get checked too. Holistic rounds count against `build.verify.maxAttempts` only since the last holistic round that found no problems (new `--since-clean` flag on `counters route`, `grant` and `progress`), so a re-check after a fix group starts with a fresh allowance.
- The verify prompt now logs each integration gap and failing test as a gap line ending `Fixable: true|false`, so the fix round has gaps to work from.
- Resume works for a holistic pause, a "Try again" from it, and a stopped fix round.

**Checked:** typecheck clean; all 9,162 engine tests pass; `bkit check` and the capability-register check pass.

**Known limits, not changed here**

- The STANDARD → PIVOT → FINAL strategy ladder for the holistic fix round is not reset after a clean holistic round, so a later re-check starts higher up the ladder.
- The holistic progress line in the decision file shows the round count without "of max".

## #841 — Ship Step 4 merge push is blocked by the pre-push skip-ci guard (closed)

### Failing test or CI run

none yet. The fix adds a failing test first: `.bkit/core/engine/commands/workflow/branches.test.ts` asserts the `--merge` merge commit carries no skip token.

### What happened

When `dev` has moved since the PR's last push, `/bkit-ship` takes Path B. Step 4 runs `bkit branches sync --merge`, which merges `origin/dev` into the feature branch and then pushes it plain. Every commit that merge makes is marked `bkit [skip ci]`: `merge dev`, `rebuild … after merging dev` and `regenerate after merging dev`.

The pre-push hook blocks that push. Its CI-suppressor HEAD guard (`.husky/pre-push`, the block under "CI-suppressor HEAD guard") refuses a feature-branch push when all three hold:

- the newest commit carries a skip token;
- the branch has an open PR;
- the push changes more than bookkeeping files since the remote head.

The Step 4 push always has all three, because the merge brings `dev`'s code onto the branch. The push fails, so ship goes to its Failure Path at Step 4.

Moving the merge into the Step 8 bookkeeping push does not avoid it. That push would carry the same code under a `[skip ci]` bookkeeping commit on top, which is the same blocked shape.

### What should happen

The Step 4 merge push goes through. CI starts on the merged head straight away, and Step 9 `bkit runs revalidate` finds that run instead of starting its own. The probe-then-dispatch logic in `.bkit/core/engine/commands/workflow/runs.ts` already does this.

### Steps to reproduce

1. Take a feature branch with an open PR into `dev`, while `dev` has new commits that touch code.
2. Run `/bkit-ship` on it, or run `bkit branches sync --merge --fid={FID} --file={STATUS} --sentinel=…` and then `bkit branches push --mode=plain`, from a checkout where the husky hooks are installed (`.husky/_` exists).
3. The hook prints `[pre-push] BLOCKED: HEAD on 'feat/…' carries a CI-suppressing token and PR #N is open — its checks would stay vacuously green.` and the push exits 1.

### How often

Every Path B ship run on a branch with an open PR, wherever the hooks are installed. No ship run has reached a Step 4 merge since #799 landed on 2026-11-01, so no real run has hit it yet.

### Affected area

- `mergeDev` and `regenerate` in `.bkit/core/engine/commands/workflow/branches.ts`: the `full` merge policy adds the `bkit [skip ci]` tag.
- `.bkit/core/workflows/bkit-ship.md` Step 4: "Each commit the block makes carries `bkit [skip ci]`".
- `.bkit/core/.bkit/workflows.md`: § ship skip-token placement and the commit-message table.
- `.bkit/instructions.md` § Clauses › `docs-commits`: the `kept` drift entry for `bkit-ship:395`.

### Where and when

Found on 2026-11-03 while preparing to ship #825 (PR #839). `dev` was 21 commits ahead and PR #839 was open.

### Evidence

A throwaway merge commit (no ref, nothing pushed) built with ship's exact message `chore(825-show-progress-bar): merge dev bkit [skip ci]`, with the PR head and `origin/dev` as parents, fails the hook's checks:

- `bkit ci skip-token --ref=<merge>` → exit 0, `token: [skip ci]`
- `bkit ci bookkeeping-push --from=<PR head> --to=<merge> --branch=feat/825-show-progress-bar` → exit 1, with code files outside the allow-list (e.g. `scripts/graphify/bkit-graphify.sh`)
- `gh pr list --head feat/825-show-progress-bar --state open` → `839`

The hook's own test pins this shape: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "[skip ci] head that also changes code, open PR → blocked before any gate".

### Fix

Drop the skip token from every commit the `full` merge policy makes, as the `docs` policy already does. The merge commit carries code, so `.agents/rules.md` § Docs commits says it must not carry the tag.

- The push then passes the guard, and the hook runs the full local gate as for any code push.
- GitHub CI starts at Step 4 and runs while Steps 5–7 work. Step 9 waits on that run instead of dispatching a new one after Step 8, so ship finishes no later than before.
- The `kept` drift entry under `docs-commits` reasoned that Step 9 starts CI itself, so a push trigger adds nothing. It is retired, because a merge commit carrying `[skip ci]` cannot be pushed past the guard at all.

### References

- #799 — ship Step 4 merges origin/dev locally (https://github.com/cbartens/bkit/issues/799)
- #825 — the ship run that found it (https://github.com/cbartens/bkit/issues/825)
- `docs/decisions.jsonl` key `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`
- `docs/knowledge.jsonl` key `kn-11-pr-statuscheckrollup-stays-empty-when-skip-ci-is-head`
- `.bkit/instructions.md` § Clauses › docs-commits

Fixed in ba4e3fb91 on `dev`. It is committed but not pushed yet.

**What changed**
- `bkit branches sync --merge` no longer adds `bkit [skip ci]` to any commit it makes: the carried work, the `dev` merge and the regenerated files all get plain `chore({FID}): …` subjects. The `skipCi` option on `regenerate` is gone.
- The pre-push hook therefore lets ship's Step 4 push through even when the PR is open and the merge brings `dev`'s code.
- The push starts CI at the merged head. Step 9's probe (`bkit runs revalidate`) polls for a run before it dispatches, so it finds that run and waits on it instead of starting a second one. I checked this in `waitFor` in `.bkit/core/engine/commands/workflow/runs.ts`.
- Docs updated to match: `bkit-ship.md` Step 4 sub-step 1, `.bkit/core/.bkit/workflows.md` (the marker section, the step table and the commit-message table), `.bkit/shared/docs/deployments.md`, and the `.bkit/instructions.md` local copy. The old "kept" drift note that defended the skip tag is removed.
- I appended an updated row to the decision record `799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase`. The installed mirrors, the ship render baseline and `dist/` are regenerated.

**Checks**
- Unit: 3690 passed (audits, render, instructions, branches).
- Integration: 77 passed (auto-route marker, ship verdict, workflow lock snippet).
- Typecheck, lint and `bkit check` are clean.
- Red-to-green on the branches tests: 7 failed before the fix, 245/245 passed after.

**Not done:** not pushed, and no live ship run has been done since the fix.

**Related: #924 — Let every workflow land on local dev without pushing — https://github.com/cbartens/bkit/issues/924**

#924 adds another `[skip ci]` rule to the same pre-push hook: it refuses a batch push of `dev` that carries code and ends on a `[skip ci]` commit. It must apply only to pushes of `dev`, so that it cannot block bkit's own feature-branch pushes the way this issue's guard did. That work is planned in #939 — Batch push support — https://github.com/cbartens/bkit/issues/939. The skip-token rule for the local ship commit is in #938 — Ship and debug in local mode — https://github.com/cbartens/bkit/issues/938.

Also related: #842 — Ship fails when the local feature branch differs from GitHub's — https://github.com/cbartens/bkit/issues/842

## #852 — Use minimum gates for verified bookkeeping across push paths (closed)

### Problem

A bookkeeping-only follow-up push can rerun the full local pre-push gate even though its code has already been checked. The reported ship run for [#724 — Machine-wide test lock: one test run at a time across agents](https://github.com/cbartens/bkit/issues/724) spent approximately ten minutes on this extra gate. That duration is user-reported; this investigation traced source and existing tests, not the original timing log.

The hook makes two independent decisions:
- `bkit ci bookkeeping-push --from=<remote head>` examines the increment since the remote feature-branch head and can permit a CI-suppressing bookkeeping commit.
- `bkit ci min-push --ref=<pushed commit>` chooses the local gate using the entire branch difference from its integration base. Earlier code remains in that difference, so the hook selects the full gate again.

The bookkeeping result is not used in local gate selection. The behavior is intentional in the current implementation and documentation: [#645 — Pre-push: light gate for bookkeeping-only pushes](https://github.com/cbartens/bkit/issues/645) explicitly chose the branch-wide range. This issue extends that policy safely; it is not a claim that the earlier implementation diverged from its specification.

A separate inventory finding: `pushToDev` disables hooks in its temporary checkout. Its bookkeeping landings currently receive no hook gate, so changing the ordinary pre-push hook alone would not cover them.

### Outcome

Use the existing `bkit:gate:min` for proven bookkeeping-only outgoing changes and appropriate bookkeeping landings, with one shared classification contract. Preserve full validation whenever code is new, history or evidence is uncertain, or the operation validates implementation behavior.

Keep local gate selection separate from whether CI must run. A minimum local gate must not suppress the CI run required by a close or trigger push.

### Success criteria

- Ordinary feature pushes select `bkit:gate:min` for proven bookkeeping-only increments over an established checked baseline, independent of commit message, open-PR state, or workflow name; every outgoing ref is considered.
- New code, rewritten history without sufficient proof, new branches without a suitable baseline, unreadable ranges, and mixed-ref pushes containing code retain full validation. An empty trigger commit qualifies only with positive evidence of an unchanged checked code tree.
- Bookkeeping landings through temporary checkouts have explicit minimum validation; the same helper's debug-code replay path cannot inherit an unconditional minimum gate or bypass.
- Existing targeted checks remain available; files used by tests keep those checks, and the policy does not treat every Markdown file or `docs/**` path as harmless.
- Source hook, shipped template, regression tests, gate documentation, and affected workflow contracts agree; evidence states the actual selected gate and scope.

### Locations to cover

#### Ordinary pushes: central hook/classifier change

Implementation surfaces:
- `.husky/pre-push:185,205,388`: bookkeeping exception, independent minimum-push decision, gate dispatch.
- `.bkit/templates/.husky/pre-push:128,148,241`: corresponding shipped behavior.
- `.bkit/core/engine/commands/ci/ci.ts:573,633`: `minPush` and `bookkeepingPush`.
- Heavy extras already using `MIN_PUSH` must follow the same decision: source-repo dist/workflow checks and the template's graph check. Preserve the applicable fast checks and consumer-owned minimum gate.

<!-- prettier-ignore -->
| Workflow location | Qualification |
| --- | --- |
| `bkit-ship.md:554`, Step 8 bookkeeping push | Docs, logs, ledgers and permitted skill removals after code validation. |
| `bkit-build.md:1163`, Step 16 close push | Only close records after the earlier push; no newly merged code. The initial summary push at line 1078 can include the full implementation and must not be classified by its name. |
| `bkit-debug.md:660`, Step 10 summary | Remediation already pushed; only the summary changes. |
| `bkit-debug.md:730`, Step 11 feature close | Only close records; no newly merged code. |
| `bkit-debug.md:765`, create-PR trigger | Only trigger/status changes over checked code; CI still runs. |
| `commands/workflow/runs.ts:859`, CI dispatch re-trigger | Actually unchanged code tree; account for staged changes because an allow-empty commit can still commit staged content. |
| `bkit-design.md:512` and `bkit-plan.md:450`, summaries | All outgoing paths qualify; pure planning branches already receive the minimum gate today. |
| `commands/workflow/branches.ts:2686`, design/plan PR landing fallback | All outgoing paths qualify. |
| `commands/workflow/workflows.ts:892`, feature failure handover | Outgoing changes are bookkeeping only. This path stages other work too; the aborted/docs subject is not proof. |

Workflow paths above are under `.bkit/core/workflows/`; command paths are under `.bkit/core/engine/`. They should inherit central selection rather than each add an unconditional minimum-gate call.

#### Temporary-checkout landings: separate validation decision

`.bkit/core/engine/commands/land.ts:135` (`pushToDev`) explicitly runs with hooks disabled. Cover these bookkeeping callers:
- Design/plan direct close: `commands/workflow/branches.ts:2559` (`landDirect`).
- Build/debug roadmap mirror: `commands/workflow/roadmap.ts:494`.
- Ship close: `commands/workflow/workflows.ts:1486`.
- Failure-record landing and ship failure flush: `commands/workflow/workflows.ts:745` (`landFailedRecord`).

The helper also serves `pushOwnCommits`, which can replay debug code onto dev. Inspect the actual resulting commit, and define where validation runs with the required dependencies available. Do not simply label every temporary-checkout landing bookkeeping.

#### Optional local-check improvement to decide during design

`.bkit/core/engine/commands/workflow/tests-changed.ts:129` runs the full fallback gate when `bkit:gate:changed` is undeclared. Consider the minimum gate for a positively classified bookkeeping-only change. Preserve the targeted gate when declared, the caller's complete validation scope, and tests that read affected documents. This is a design candidate, not an approved blanket downgrade of build/debug gates.

### Constraints and non-goals

- Do not use `[skip ci]`, a docs commit subject, workflow step name, or existence of a remote head as proof that code was tested successfully.
- Classify the actual remote-old/pushed-new commit pair for every ref, including pushes not targeting the checked-out branch. Keep multi-ref aggregation conservative.
- Keep full validation for first code pushes, remediation, integration/conflict resolution, regenerated code, and build/debug implementation validation.
- Preserve delete-only and already-tested tag/release handling; do not replace a legitimate no-work skip with an unnecessary minimum gate.
- Do not change CI lane coverage or remove required checks to save time.
- Use existing gates and extend existing classification rather than add parallel workflow-specific bypasses.

### Decisions already made

- Reuse `bkit:gate:min`; gate contents remain consumer-owned.
- The reported redundant run is supported by source inspection. No new failing regression test or runtime reproduction was executed during this investigation.
- The existing test in `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:362` explicitly expects the full gate for a bookkeeping follow-up. Update the behavior contract and tests together.
- Existing minimum-push integration coverage starts around line 1045 of that file.
- Policy documentation includes `.bkit/core/.bkit/templates.md` (Git hooks), `.bkit/core/.bkit/workflows.md` (Local gate scripts), and the affected deployment/testing documentation. Regenerate managed mirrors from sources.

### Open questions

1. What durable evidence establishes the checked baseline: prior successful local gate, successful CI at an ancestor, or another existing receipt? Define invalidation and avoid trusting remote presence alone.
2. How should explicit empty-trigger pushes qualify without changing the conservative handling of unknown/no-evidence ranges?
3. Where should temporary-checkout minimum validation run, and how is the exact landing tree bound to its result?
4. Should the optional `tests changed` fallback optimization be included or left unchanged?

Required regression coverage: both hook copies; bookkeeping after code; code hidden under a docs head; multiple refs; non-HEAD pushes; missing/new/re-written bases; allow-empty commits with staged content; required-CI close/trigger pushes; bookkeeping temporary landings versus debug-code replay; and documents consumed by tests.

### References

- Parent requested by the owner: [#99 — Friction triage](https://github.com/cbartens/bkit/issues/99). It is currently closed and points to a successor; the explicit requested parent is retained.
- Origin: [#724 — Machine-wide test lock: one test run at a time across agents](https://github.com/cbartens/bkit/issues/724).
- Previous policy: [#645 — Pre-push: light gate for bookkeeping-only pushes](https://github.com/cbartens/bkit/issues/645).
- Source review performed on 2026-11-03; checkout HEAD was `6be3eb34242ec15b2d035e8aa5665fc1d1b5a813`. Some local documentation already had unrelated edits; line references describe the inspected checkout.
- No known blocking issue was identified. Parentage is organizational, not a dependency.

Triage: enhancement / next:design; Backlog; Low priority (tooling policy improvement under the ranking rules, with no observed in-progress/in-review sibling uplift); size M (one pattern sweep across hooks, engine landing paths, tests and docs); Future Releases.
