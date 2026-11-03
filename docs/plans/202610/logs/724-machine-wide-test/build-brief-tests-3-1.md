# Brief: group 3 — `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate (tests)

Plan: Machine-wide tests lock Implementation Plan

## Why and what

### Context & Goals

**Source:** change issue #724 (body + 2 comments; body wins where they differ). No design doc. Workstreams: `[]` → whole issue. Required workstream dependencies: none.

**Problem:** one vitest run sizes its worker pool to every core; many bkit tests spawn `git` / `tsx` / `bkit` children. Measured on a 10-core MacBook (4 performance + 6 efficiency, 32 GB) under parallel agents: `uptime` load average 78.01 over 5 minutes (~8 runnable processes per core). Contention crosses repos (bkit and consumer repos share one CPU). `vitest.timeout-budget.ts` only stretches time limits; runs still pile up.

**Goals:**

1. Rename + generalise the copy-and-own stack lock `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `bkit-machine-lock.sh`: optional `[name]` on every function (API taken from a consumer's adopted copy), named locks machine-wide (no repo prefix), `BKIT_TEST_SLOTS` slots + `BKIT_TEST_WORKERS` on the `tests` lock, `run [<who>] --lock <name>` (`<who>` from `LOCAL_STACK_LOCK_WHO`, else the `package.json` script name), distinct exit codes for lock outcomes, enforced lock order (tests → other named → stack), 60 s default wait when stdin is not a TTY and no wait is passed (Open Question 7), each holder's `tests` run time recorded on release by checkout, the current holder's last one named in the waiting note (Open Question 14). Unnamed stack lock keeps its file path, function and env names.
2. Copy-and-own wiring (Open Question 1): a consumer copies the script to `scripts/ci/` and wraps its test-running `bkit:gate:*` scripts as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>`; bkit's root `package.json` does the same. The engine never executes the script. `bkit tests run` runs the gate as today, passes `--lock-wait-s` (default `BKIT_LOCK_WAIT_S`, else 60; Open Question 14) as `LOCAL_STACK_LOCK_WAIT_S` and its run name as `LOCAL_STACK_LOCK_WHO`, and maps a `tests`-lock give-up (75) of this run to exit 81 naming the holder and a `tests`-lock refusal (73) to exit 4. `red` / `green` never lock.
3. `/bkit-build` and `/bkit-debug` route exit 81 from every `tests run` block to end-turn + re-run; `bkit-build-plan-gaps-remediate.md` re-runs the `Group gate` command that `bkit-build.md` Step 9 hands it in `Context:` on exit 81 (TASK 7).
4. bkit's own heavy raw vitest runs (`pnpm test`, `test:integration`, `test:coverage:unit`) take the `tests` lock through a vitest global setup; single-file, watch, CI and nested runs (incl. vitest inside a wrapped gate) never wait; with no TTY the script's 60 s default applies (Open Question 7).
5. The shipped pre-push hook and the prompts that still run a gate raw (`pnpm bkit:gate:static-unit` in `bkit-debug-failure-soak.md`, `pnpm bkit:gate:install-static-unit-build` in `bkit-ship-conflict-resolve.md`) stay unchanged (Open Question 6): the wrapped gate carries the lock in a repo that wires it, and a raw caller that gives up waiting sees the gate exit 75 with the holder line. The four prompts that check their change through `bkit tests changed --fallback=bkit:gate:*` (`bkit-build-plan-tasks.md`, `bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md`) reach the gate through the engine, which today maps every gate failure, a lock give-up included, to exit 1. Per the owner's answer A to Open Question 11, `bkit tests changed` passes the wait and its run name like `tests run`, maps a `tests`-lock give-up to exit 81 naming the holder, and those four prompts re-run the command on 81 (TASK 10). `bkit branches push` passes the same wait and its run name to `git push`, so the shipped pre-push hook's wrapped gate waits the host's budget, and maps the hook's `tests`-lock give-up to exit 81 naming the holder; every workflow push block re-runs on 81 (Open Question 15, TASK 11).

**Plan-input deviations (surfaced, not silent):**

- Consumer repo names in the input → written as "a consumer" (`.agents/rules.md` § Consumer names); the Narrative and Success Criteria carry none, so stay word for word.
- Derived Test Matrix `Type` → tier names as `docs/testing.md` writes them (`Integration`, `Unit`); descriptions kept word for word.
- Issue TASK 1 split into TASK 1 (named locks, `run`) + TASK 2 (slots, workers, lock order) to stay under the per-task test cap; every issue test kept. The dogfood copy + registry move into TASK 1, since deleting the old template breaks `dogfood-templates.test.ts` until they land.
- Issue TASK 2's docs split by what each documents: template docs → TASK 3 (stack lock, named locks, slots, lock order, no-TTY wait, consumer wiring) and TASK 5 (`bkit tests run` passes the wait and its run name, maps 75 → 81); `docs/testing.md` tests-lock section → TASKS 5, 6 and 9 (with the code it describes).
- Issue TASK 2 `DONE WHEN` grep `'local-stack-lock\|Local stack lock'` narrowed to `-e bkit-local-stack-lock -e 'Local stack lock'` (TASK 3): the unnamed lock keeps its path `~/.cache/bkit/local-stack-lock/` (SC 5), so docs naming that path must stay and the issue's pattern can never pass; `docs/testing.md` stays in the grep scope (no hit today; TASKS 5 / 6 / 9 add none).
- Issue TASK 3 split into TASK 4 (lock-exit classification, `--lock-wait-s`, `lockHolder`, unit tier) + TASK 5 (wait + run name passed to a real wrapped gate, exit classification end to end, integration tier) to stay under the per-task test cap; its `DONE WHEN` lives on across both, help check tightened to `--lock-wait-s` + `lockHolder` (exit 81 is a shared code every `--help` already lists).
- Issue TASK 3 tests `tests red runs its test file without waiting…` and `tests run under CI=true never waits…` pass on today's code (nothing locks yet), so each gains a contrast assertion — a plain `tests run --lock-wait-s=0` against the same held lock exits 81 — and records a red until TASK 5 lands; names unchanged.
- Issue TASK 4 → TASK 7. `TEST FIRST: n/a` tightened to a guard test in `local-gate-audit.test.ts` (every `tests run` call site routes exit 81).
- Issue TASK 5 split into TASK 8 (pure decision helpers, unit tier) + TASK 9 (global setup, config wiring, integration tier) to stay under the per-task test cap; its `DONE WHEN` lives on in TASK 9.
- Owner answer Open Question 1: the engine never executes the lock script; consumers and bkit wrap their test-running `bkit:gate:*` scripts in it (copy-and-own, `.bkit/templates.md` § Machine lock). SC 1 holds for repos that wire the script into their gate scripts; a repo that does not wire it gets no lock.
- Owner answer Open Question 6 (option D): the shipped pre-push hook and subagent prompts keep calling `pnpm bkit:gate:*`, which carries the lock; no hook or prompt task. Plan-added TASK 6 wraps bkit's own gate scripts.
- Currency update after the plan was confirmed (code landed in 52bab3514, ade710750, 94915b0d4, d53fea47e):
  - Four of the prompts Open Question 6 names now call `bkit tests changed --fallback=bkit:gate:*` (`.bkit/core/engine/commands/workflow/tests-changed.ts`), which maps every non-zero gate exit to 1, so a lock give-up reaches those subagents as exit 1, not exit 75. Re-opened as Open Question 11, which the owner answered A: `bkit tests changed` maps a `tests`-lock give-up to exit 81. TASK 10 (group 3, numbered above the plan's highest so no task renumbers; split from TASK 5, which sits at the 10-test cap) lands it, including the exit-81 line those prompts gain.
  - `bkit tests run --file` now appends a `test-run` status row on every run. Owner answer Open Question 12 (option A): a lock-wait (exit 81) run writes no row; TASK 10 lands it.
  - `bkit:gate:changed` (`scripts/gate/bkit-gate-changed.mjs`) is a fourth test-running gate in bkit's `package.json`. Owner answer Open Question 13 (option A): it takes the `tests` lock; TASK 6 wraps it.
  - `bkit-build.md` Step 9 hands the gaps-remediate subagent a `tests run` command in `Context:`; TASK 7 adds that prompt's exit-81 line and a guard test for it.
  - `tests red` now takes `--group` / `--plan` (no `--task` / `--test`); the matching test and Concrete Example step 5 use them.
  - `.bkit/core/.bkit/cli.md` is generated from the command specs (`pnpm cli:sync`, drift pinned by `.bkit/core/engine/tools/cli-doc.test.ts`); TASKS 4, 5 and 10 regenerate it.
  - The task-writing prompt TASK 3 updates is now `.bkit/core/prompts/bkit-build-plan-tasks.md` (renamed in ade710750), and `.bkit/core/prompts/bkit-build-plan-tests.md` is a second carrier of the Shared local stack line; TASK 3 updates both.
  - The `docs/architecture.md` `scripts/ci/` and `scripts/gate/` tree lines exist (d53fea47e); TASK 1 checks them instead of adding one.
- Owner answer Open Question 7 (option A′): the 60 s no-TTY default wait lives in the lock script; the matrix row "a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set" moves from the vitest helper to the script (TASK 2); the vitest global setup hands the script vitest's own stdin and sets no wait.
- Owner answer Open Question 14: the lock wait is a host budget, not a constant. The engine defaults `--lock-wait-s` to `BKIT_LOCK_WAIT_S`, else 60; bkit ships `BKIT_LOCK_WAIT_S=1200` in the Claude Code settings `env` (that host moves a long call to the background and reports its exit, `.bkit/providers.md` § Long-running shell commands) and nothing for the other hosts, which loop on exit 81 in 60 s calls. The script records each `tests` run's held time by the holder's checkout and names the current holder's last run in the waiting note and the give-up line (TASK 2); the engine's 81 hand-back carries it in `lockHolder`.
- Owner answer Open Question 15: `bkit branches push` passes `LOCAL_STACK_LOCK_WAIT_S` (the same default) and `LOCAL_STACK_LOCK_WHO` to `git push`, reads the pre-push hook's output, and maps a `tests`-lock give-up of this run to exit 81 + `lockHolder`; every workflow push block routes 81 → end turn, re-run. Plan-added TASK 11 (group 4) lands it.
- Owner answer Open Question 10 revised to B: `BKIT_TEST_WORKERS` = max(1, floor(cores / slots) - 1); the matrix row reads "cores divided by slots, minus one".
- Script `run` `<who>` becomes optional (from `LOCAL_STACK_LOCK_WHO`, else `npm_lifecycle_event`, else `run`): the owner's wiring `run --lock tests -- <gate command>` names no run, and `bkit tests run` passes its run name via env.
- Plan-added tests: `run` exit 73 on lock error and on missing perl; `run` with no `<who>`; lock-order refusals; a tests-lock holder's child still waits on the stack lock; a killed tests-lock holder frees its slot; the no-TTY default wait; `--lock-wait-s` validation and `=0`; lock-exit classification (nested lock give-up never 81, another lock's refusal never 4); a gate's own exit 75 stays a FAIL; the gate env end to end; `CI=1`; a wrapped gate calling a wrapped gate never waits on itself; bkit's gate scripts wrapped; watch-mode runs take no lock; exit-81 routing guards; the vitest global setup run against a real lock (wait, give-up, teardown).

**Related Issues:**

- `#724 — Machine-wide test lock: one test run at a time across agents (OPEN)`

---

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning).

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Host-level hook (Claude / OpenCode / Codex / Cursor / Antigravity) catching a raw `npx vitest` or any runner in consumer repos | No Success Criterion needs it: SC 1-5 cover wrapped gate scripts, `bkit tests run`, bkit's own raw runs and the script; issue § Out of Scope names it a separate follow-up | follow-up issue; `docs/deferrals.jsonl` `724-host-hook-catches-raw-test-runners` |
| Upstreaming a consumer's `load-gate.mjs` (one runner overlapping its own jobs by projected load + memory pressure) | Solves overlap inside one runner, not between agents; nothing here depends on it | future template; `docs/deferrals.jsonl` `724-upstream-consumer-load-gate` |
| Changing `vitest.timeout-budget.ts`; serialising anything on CI | Issue non-goal; CI runners have one job and the lock no-ops under `CI` | measurement after ship; `docs/deferrals.jsonl` `724-timeout-budget-and-ci-serialisation-unchanged` |
| Shipped gate-script templates (`.bkit/templates.md` § Gate tool scripts) passing `BKIT_TEST_WORKERS` to the consumer's runner (`--maxWorkers`) | No Success Criterion, scenario or matrix row needs it: at the default 1 slot it changes nothing; `.bkit/templates.md` § Machine lock documents the variable for consumers to wire | follow-up once slots > 1 is in use; `docs/deferrals.jsonl` `724-gate-templates-pass-test-workers` |

## Where it fits

- Group 1: Machine lock script — named locks — done
  - TASK 1: Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits — done
  - TASK 12: Correct the copied-repository test process working directories — done
- Group 2: Slots, lock order, no-TTY wait and template docs — done
  - TASK 2: Slots, `BKIT_TEST_WORKERS`, the enforced lock order on the `tests` lock and the no-TTY default wait — done
  - TASK 3: Point every template doc, rule and prompt at § Machine lock, with the consumer wiring step — done
- Group 3: `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate — this group
  - TASK 4: `bkit tests run` gains `--lock-wait-s`, `lockHolder` and the lock-exit classification — open
  - TASK 5: `bkit tests run` passes the wait and its run name to a wrapped gate and maps its lock exits; single-file runs never wait — open
  - TASK 10: Lock waits reach `bkit tests changed` callers as exit 81 and leave no `test-run` row (owner answer A to Open Questions 11 and 12) — open
- Group 4: bkit's gates take the tests lock; workflows route exit 81 — next
  - TASK 6: bkit's root `package.json` wraps its test-running gates in the tests lock (`bkit:gate:changed` included, per the owner's answer A to Open Question 13) — open
  - TASK 7: Workflows route exit 81 from the test gates back to the turn loop — open
  - TASK 11: `bkit branches push` carries the lock wait to the pre-push hook and maps its give-up to exit 81 (owner answer A to Open Question 15) — open
- Group 5: bkit's own raw vitest runs queue too — later
  - TASK 8: Heavy / light and worker decisions for bkit's raw vitest runs — open
  - TASK 9: Vitest global setup takes the tests lock for heavy raw runs in bkit's repo — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `bkit tests run` gains `--lock-wait-s`, `lockHolder` and the lock-exit classification
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `run` verb gains `--lock-wait-s` (whole number >= 0, default `BKIT_LOCK_WAIT_S` else 60 (Open Question 14), a bad variable value → the same usage error naming the variable; bad value → `CommandError(EXIT.USAGE)` with `--lock-wait-s takes a whole number >= 0`); `lockHolder` output field (null until TASK 5 wires the lock); verb summary names `81 tests lock held`; 81 stays out of `exitCodes` (shared `EXIT.AGENT_WAIT`, outside the 3-79 own-code range `conventions.test.ts:74-79` enforces); `red` / `green` unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: adds exported pure `classifyLockExit` `({ exitCode, log, who })` → `gate` | `lock-wait` | `could-not-run` — `lock-wait` only for exit 75 with a `[machine-lock]` give-up line naming the `tests` lock and this run's `<who>`; `could-not-run` only for exit 73 with a `[machine-lock] ❌` refusal line naming the `tests` lock (lock dir, perl or lock order); else `gate`
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: exports `wholeNumber` (moved from `runs.ts`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: imports `wholeNumber` from `../lib.js`
  - **DELETE:** `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts`: moved to `lib.ts`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: PASS-case expected output (exact `toEqual` at line 135 in `it("PASS: runs the gate through the package runner, …")`, which already holds `row: null`) gains `lockHolder: null`; the tests below
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `--budget-s` / exit 81 pattern to mirror
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `tests` `run` row regenerated with `pnpm cli:sync` (new `--lock-wait-s` flag and summary); `.bkit/cli.md` mirrored by `bkit install`
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/runs.test.ts .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/commands/conventions.test.ts .bkit/core/engine/tools/cli-doc.test.ts` passes; `node dist/cli.js tests run --help` lists `--lock-wait-s`, the output key `lockHolder` and exit 81; `grep -c 'const wholeNumber' .bkit/core/engine/commands/workflow/runs.ts` prints 0; `grep -c 'lock-wait-s' .bkit/core/.bkit/cli.md` prints >= 1; `bkit install` then `bkit check` reports no drift (`.bkit/cli.md` mirror in sync)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run` fails on a tests-lock give-up read as the gate's own FAIL
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81` fails on a nested lock's give-up read as a tests-lock wait
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4` fails on the refusal read as a test FAIL
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate` fails on the generic unknown-flag error with no `--lock-wait-s takes a whole number >= 0` message
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2` fails on the gate env carrying `LOCAL_STACK_LOCK_WAIT_S=60` under `BKIT_LOCK_WAIT_S=1200`, or on a bad variable value running the gate
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4` fails on a nested lock's refusal read as could-not-run

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `bkit tests run` passes the wait and its run name to a wrapped gate and maps its lock exits; single-file runs never wait
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: gate argv unchanged (the engine never executes the lock script); gate env gains `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` and `LOCAL_STACK_LOCK_WHO` = `bkit tests run <gate>[ <fid>][ <step>]`; `classifyLockExit` → `lock-wait`: print the `[machine-lock]` lines, emit `lockHolder`, no artifact, return `EXIT.AGENT_WAIT`; → `could-not-run`: `EXIT_COULD_NOT_RUN` naming path + reason; `red` / `green` unchanged. The `--file` `test-run` row is written as today, so a lock-wait run still appends one until TASK 10 changes that with its own test (Open Question 12); `bkit tests changed` is TASK 10's too (Open Question 11)
  - **UPDATE:** `.bkit/shared/.claude/settings.json`: `env.BKIT_LOCK_WAIT_S` = `"1200"` (Open Question 14; `.bkit/providers.md` § Long-running shell commands gives the budget per host); `.claude/settings.json` mirrored by `bkit install`; the Claude install module's settings containment test covers the new key
  - **READ:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: argv + env the gate runs with
  - **READ:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `red` verb's required `--file` (an existing `status.jsonl`), `--workflow`, `--group`, `--plan`, `--log`; it runs each open task's TEST FIRST test of the group through `bkit:test:file`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, in a temp consumer git checkout with the template copied to `scripts/ci/bkit-machine-lock.sh`, a stub `bkit:gate:*` (records its start / end and env) wrapped as `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- …`, `bkit:test:file` unwrapped (writes a JUnit report holding one failing case for the planned test), a temp plan with one `<!-- bkit:group 1 start -->` group holding one open task block whose `**TEST FIRST:**` names that test file and test, an empty `status.jsonl`, real lock holders of the template script, `bkit` spawned via `requireTsx()`, `tierTimeouts(true)` budgets, holder-file polling
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new § Tests lock (wrapped `bkit:gate:*` scripts take it for the whole gate; light runs, nested wraps and `CI` skip it; `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `BKIT_LOCK_WAIT_S` per host (`.bkit/providers.md` § Long-running shell commands), `--lock-wait-s`, exit 81; raw callers see exit 75 + the holder line; no-TTY 60 s wait; an unwired repo takes no lock)
  - **UPDATE:** `docs/testing.md`: the same § Tests lock inside the `bkit:start` / `bkit:end` block (byte-identical to the shipped source); § Key test files row (below `bkit:end`) for `tests-lock.integration.test.ts`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock gains light vs heavy runs and "`bkit tests run` passes `--lock-wait-s` and its run name to a wrapped gate, maps 75 → 81 and 73 → 4"
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — `bkit tests run` passes `--lock-wait-s` and its run name to a wrapped gate, exit 81 when the gate gave up on the tests lock
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `tests` `run` row regenerated with `pnpm cli:sync` when this task changes the verb's summary or flag help (the `--lock-wait-s` help names the env it sets); `.bkit/cli.md` mirrored by `bkit install`
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/runs.test.ts .bkit/core/engine/tools/cli-doc.test.ts` passes; `node dist/cli.js tests run --help` lists `--lock-wait-s` and exit 81; `grep -c 'bkit-machine-lock.sh' .bkit/core/engine/commands/workflow/tests.ts` prints 0 (the engine never executes the script); `bkit install` then `bkit check` reports no drift (shipped `docs/testing.md` block and `.bkit/cli.md` mirror in sync)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on the gate running at once instead of exit 81
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if `tests red --file=<status.jsonl> --workflow=build --group=1 --plan=<temp plan> --log=<log>` waits on the held lock (it must finish with its planned test recorded `red` long before the holder ends), or on the contrast `tests run --lock-wait-s=0` against the same held lock not exiting 81 (the lock is not really held)
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost, or on the contrast run without `CI` not exiting 81 against the same held lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=1 never waits on a held tests lock` fails on `CI=1` read as unset and the call waiting
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with --lock-wait-s=0 exits 81 at once against a held lock` fails on the gate running at once with the lock held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `a gate that itself exits 75 is a FAIL verdict, not a lock wait` fails on exit 81 for the gate's own 75, or on the gate env lacking `LOCAL_STACK_LOCK_OWNER_tests` (the 75 did not pass through the lock script)
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait` fails on the gate env lacking both variables, or `LOCAL_STACK_LOCK_WAIT_S` / `LOCAL_STACK_LOCK_WHO` not matching `--lock-wait-s` and this run

<!-- bkit:task 5 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Lock waits reach `bkit tests changed` callers as exit 81 and leave no `test-run` row (owner answer A to Open Questions 11 and 12)
  - **UPDATE:** `testsChangedVerb` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: new flag `--lock-wait-s` (`wholeNumber` from `../lib.js`, default `BKIT_LOCK_WAIT_S` else 60; bad value → `CommandError(EXIT.USAGE)` with `--lock-wait-s takes a whole number >= 0`); `runLogged` runs the gate with env `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` and `LOCAL_STACK_LOCK_WHO` = `bkit tests changed <gate>`; the gate's exit and output go through `classifyLockExit` (TASK 4): `lock-wait` → emit `lockHolder`, return `EXIT.AGENT_WAIT` (81); `could-not-run` → exit 4 naming path + reason; else the current PASS / FAIL mapping; output gains `lockHolder` (null unless the wait gave up); summary names `81 tests lock held`
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb appends no `test-run` row under `--file` when `classifyLockExit` returns `lock-wait` (`row` null)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the integration tests below, with a stub `bkit:gate:changed` wrapped like the other stub gates
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-changed.test.ts`: the unit test below
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: the guard below, driven by the `GATE_CALLERS` entries whose call is `--fallback=bkit:gate:*`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: Process step 10, which runs `bkit tests changed --fallback=bkit:gate:static`, gains **If** it exits 81 → another run holds the machine-wide tests lock: run it again; a wait is not a failure and no reason to edit code (`pnpm instructions:show --file bkit-build-plan-tasks.md` first)
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Process step 9's `bkit tests changed --fallback=bkit:gate:static-unit` gains the same line
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: Process step 8's `bkit tests changed --fallback=bkit:gate:static-unit` gains the same line
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process step 7's `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` gains the same line
  - **UPDATE:** `.bkit/instructions.md`: re-synced (`pnpm instructions:sync`) when the exit-81 line is a shared clause
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `status.jsonl` — workflow state SoT, `test-run` row — a run that exits 81 on the tests lock writes no row
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock names `bkit tests changed` beside `bkit tests run` (passes the wait and its run name, maps 75 → 81 and 73 → 4)
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Tests lock names `bkit tests changed` and its exit 81
  - **UPDATE:** `docs/testing.md`: the same § Tests lock text inside the `bkit:start` / `bkit:end` block (byte-identical to the shipped source)
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — `bkit tests changed` gains `--lock-wait-s` and exit 81 when its gate gave up on the tests lock; a lock wait writes no `test-run` row
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: `tests` `changed` row regenerated with `pnpm cli:sync`; `.bkit/cli.md` mirrored by `bkit install`
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/tools/cli-doc.test.ts .bkit/core/engine/tools/instructions.test.ts` passes; `node dist/cli.js tests changed --help` lists `--lock-wait-s`, the output key `lockHolder` and exit 81; `grep -c 'bkit-machine-lock.sh' .bkit/core/engine/commands/workflow/tests-changed.ts` prints 0 (the engine never executes the script); `bkit install` then `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run --file appends no test-run row when it exits 81 on a held tests lock` fails on a `test-run` row appended for the wait
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock` fails on exit 1 with verdict FAIL and no `lockHolder`
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests changed with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate` fails on the generic unknown-flag error with no `--lock-wait-s takes a whole number >= 0` message
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every prompt that runs bkit tests changed routes exit 81 to a re-run of the command` fails on a `--fallback=bkit:gate:*` caller whose `bkit tests changed` step carries no exit-81 line

<!-- bkit:task 10 end -->

### Earlier tasks this group depends on

- TASK 2 (group 2, done): Slots, `BKIT_TEST_WORKERS`, the enforced lock order on the `tests` lock and the no-TTY default wait — `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 (plan-added, Open Question 14) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| tests run waits for a held tests lock and runs the gate once the holder finishes | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run exits 81 naming the holder when the lock stays held past --lock-wait-s | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run holds the tests lock for the whole gate, so a second tests run waits | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests red runs its test file without waiting for a held tests lock | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run under CI=true never waits on a held tests lock | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run under CI=1 never waits on a held tests lock (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run with an unwritable lock dir exits 4 naming the path | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run with --lock-wait-s=0 exits 81 at once against a held lock (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| a gate that itself exits 75 is a FAIL verdict, not a lock wait (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 5 |
| tests run --file appends no test-run row when it exits 81 on a held tests lock (plan-added, Open Question 12) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 10 |
| tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock (plan-added, Open Question 11) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 10 |
| tests changed with an unwritable lock dir exits 4 naming the path (plan-added, Open Question 11) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 10 |
| tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate (plan-added, Open Question 11) | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 10 |
| every prompt that runs bkit tests changed routes exit 81 to a re-run of the command (plan-added, Open Question 11) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 10 |
| a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself (plan-added) | Integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 6 |
| every tests run call site routes exit 81 to a re-run of its block (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| every branches push call site routes exit 81 to a re-run of its block (plan-added, Open Question 15) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 11 |

## Deviations

Continue bkit-build #724 from the handover. Ignore the one-hour workflow limit and keep going until the build is complete.
