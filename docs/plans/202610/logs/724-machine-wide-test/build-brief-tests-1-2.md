# Brief: group 1 — Machine lock script — named locks (tests)

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

- Group 1: Machine lock script — named locks — this group
  - TASK 1: Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits — done
  - TASK 12: Correct the copied-repository test process working directories — open
- Group 2: Slots, lock order, no-TTY wait and template docs — next
  - TASK 2: Slots, `BKIT_TEST_WORKERS`, the enforced lock order on the `tests` lock and the no-TTY default wait — open
  - TASK 3: Point every template doc, rule and prompt at § Machine lock, with the consumer wiring step — open
- Group 3: `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate — later
  - TASK 4: `bkit tests run` gains `--lock-wait-s`, `lockHolder` and the lock-exit classification — open
  - TASK 5: `bkit tests run` passes the wait and its run name to a wrapped gate and maps its lock exits; single-file runs never wait — open
  - TASK 10: Lock waits reach `bkit tests changed` callers as exit 81 and leave no `test-run` row (owner answer A to Open Questions 11 and 12) — open
- Group 4: bkit's gates take the tests lock; workflows route exit 81 — later
  - TASK 6: bkit's root `package.json` wraps its test-running gates in the tests lock (`bkit:gate:changed` included, per the owner's answer A to Open Question 13) — open
  - TASK 7: Workflows route exit 81 from the test gates back to the turn loop — open
  - TASK 11: `bkit branches push` carries the lock wait to the pre-push hook and maps its give-up to exit 81 (owner answer A to Open Question 15) — open
- Group 5: bkit's own raw vitest runs queue too — later
  - TASK 8: Heavy / light and worker decisions for bkit's raw vitest runs — open
  - TASK 9: Vitest global setup takes the tests lock for heavy raw runs in bkit's repo — open

## The work

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Correct the copied-repository test process working directories
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: through the tests step, give the lock helpers an explicit caller working directory and run each copied-repository process in its respective checkout. Preserve the existing machine-wide exclusion and caller-checkout assertions. Add a regression that observes the subprocess working directory, first failing against the existing helper setup; do not undo production code to obtain a red result.
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes, including the machine-wide cross-repository test and the helper working-directory regression; holder messages still identify the caller checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `copied-repository lock helpers execute in the requested caller checkout` fails on the helper subprocess inheriting the build worktree instead of the requested temporary repository

<!-- bkit:task 12 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a named lock is machine-wide: checkouts of two different repos wait on the same named lock | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| copied-repository lock helpers execute in the requested caller checkout | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 12 |
| one process holds a named lock and the unnamed stack lock side by side | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a named-lock holder does not wait on that named lock | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run --lock` holds the named lock for the command and passes its exit status on | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 75 when the wait gives up, distinct from the command's own failure | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 73 naming the path when the lock dir cannot be written (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 73 naming /usr/bin/perl when perl is missing (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a killed tests-lock holder frees its slot within a second and the waiter starts (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking the tests lock while holding the stack lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking the tests lock while holding another named lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking a named lock while holding the stack lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a child of a stack-lock holder asking for the tests lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| the tests lock records its held time by checkout on release and the next waiting note names the holder's last run (plan-added, Open Question 14) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
