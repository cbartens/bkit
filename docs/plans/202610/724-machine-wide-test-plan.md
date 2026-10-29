<!-- bkit:anchor
baseSha: 5bb26e7c6ae15bc6bb8ae02054846025d5a45882
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Machine-wide tests lock Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

**Source:** change issue #724 (body + 2 comments; body wins where they differ). No design doc. Workstreams: `[]` → whole issue. Required workstream dependencies: none.

**Problem:** one vitest run sizes its worker pool to every core; many bkit tests spawn `git` / `tsx` / `bkit` children. Measured on a 10-core MacBook (4 performance + 6 efficiency, 32 GB) under parallel agents: `uptime` load average 78.01 over 5 minutes (~8 runnable processes per core). Contention crosses repos (bkit and consumer repos share one CPU). `vitest.timeout-budget.ts` only stretches time limits; runs still pile up.

**Goals:**

1. Rename + generalise the copy-and-own stack lock `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `bkit-machine-lock.sh`: optional `[name]` on every function (API taken from a consumer's adopted copy), named locks machine-wide (no repo prefix), `BKIT_TEST_SLOTS` slots + `BKIT_TEST_WORKERS` on the `tests` lock, `run --lock <name>`, distinct exit codes for lock outcomes, enforced lock order (tests → other named → stack). Unnamed stack lock keeps its file path, function and env names.
2. `bkit tests run` holds the `tests` lock for the whole gate; waits `--lock-wait-s` (default 60) then exits 81 naming the holder. `red` / `green` never lock.
3. `/bkit-build` and `/bkit-debug` route exit 81 from every `tests run` block to end-turn + re-run.
4. bkit's own heavy raw vitest runs (`pnpm test`, `test:integration`, `test:coverage:unit`) take the `tests` lock through a vitest global setup; single-file, watch, CI and nested runs never wait; with no TTY the wait is capped (Open Question 7).
5. Every full gate bkit ships outside a workflow block — the `.bkit/templates/.husky/pre-push` push gate and the subagent prompts that run `pnpm bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` — runs through `bkit tests run` (Open Question 6).

**Plan-input deviations (surfaced, not silent):**

- Consumer repo names in the input → written as "a consumer" (`.agents/rules.md` § Consumer names); the Narrative and Success Criteria carry none, so stay word for word.
- Derived Test Matrix `Type` → tier names as `docs/testing.md` writes them (`Integration`, `Unit`); descriptions kept word for word.
- Issue TASK 1 split into TASK 1 (named locks, `run`) + TASK 2 (slots, workers, lock order) to stay under the per-task test cap; every issue test kept. The dogfood copy + registry move into TASK 1, since deleting the old template breaks `dogfood-templates.test.ts` until they land.
- Issue TASK 2's docs split by what each documents: template docs → TASK 3 (stack lock, named locks, slots, lock order) and TASK 5 (light vs heavy runs, `bkit tests run` takes `tests` itself); `docs/testing.md` tests-lock section → TASKS 5 and 10 (with the code it describes).
- Issue TASK 2 `DONE WHEN` grep `'local-stack-lock\|Local stack lock'` narrowed to `-e bkit-local-stack-lock -e 'Local stack lock'` (TASK 3): the unnamed lock keeps its path `~/.cache/bkit/local-stack-lock/` (SC 5), so docs naming that path must stay and the issue's pattern can never pass; `docs/testing.md` stays in the grep scope (no hit today; TASKS 5 / 10 add none).
- Issue TASK 3 split into TASK 4 (lock-exit classification, `--lock-wait-s`, `lockHolder`, unit tier) + TASK 5 (gate wrapped in the lock script, integration tier) to stay under the per-task test cap; its `DONE WHEN` lives on across both, help check tightened to `--lock-wait-s` + `lockHolder` (exit 81 is a shared code every `--help` already lists).
- Issue TASK 3 tests `tests red runs its test file without waiting…` and `tests run under CI=true never waits…` pass on today's code (nothing locks yet), so each gains a contrast assertion — a plain `tests run --lock-wait-s=0` against the same held lock exits 81 — and records a red until TASK 5 lands; names unchanged.
- Issue TASK 4 → TASK 6. `TEST FIRST: n/a` tightened to a guard test in `local-gate-audit.test.ts` (every `tests run` call site routes exit 81).
- Issue TASK 5 split into TASK 9 (pure decision helpers, unit tier) + TASK 10 (global setup, config wiring, integration tier) to stay under the per-task test cap; its `DONE WHEN` lives on in TASK 10.
- Plan-added TASKS 7 / 8 (Open Question 6, default A): SC 1 covers every full gate, and the shipped pre-push hook and subagent prompts run gates outside `bkit tests run`.
- Plan-added tests: `run` exit 73 on lock error and on missing perl; lock-order refusals; a tests-lock holder's child still waits on the stack lock; a killed tests-lock holder frees its slot; `--lock-wait-s` validation and `=0`; lock-exit classification (nested lock give-up never 81); a gate's own exit 75 stays a FAIL; the gate env end to end; `CI=1`; watch-mode runs take no lock; no-TTY wait cap; exit-81 routing guards; the vitest global setup run against a real lock (wait, give-up, teardown).

**Related Issues:**

- `#724 — Machine-wide test lock: one test run at a time across agents (OPEN)`

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning).

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

### Process Sketch

- **WHEN** an agent's `bkit tests run` starts while no gate holds the `tests` lock **→ THEN** it takes the lock, exports `BKIT_TEST_WORKERS`, runs the gate, frees the lock on exit.
- **WHEN** a second full gate (any repo, any worktree) starts while the first holds it **→ THEN** it waits and prints the first one's holder line; it starts once the holder ends.
- **IF** the lock stays held past `--lock-wait-s` **→ THEN** `bkit tests run` exits 81 naming the holder; the workflow ends its turn and re-runs the block.
- **IF** the run is light (`tests red` / `green`, one existing test file), nested under a holder, in watch mode, or `CI` is set **→ THEN** no lock is taken and nothing waits.
- **IF** the holder is killed **→ THEN** the lock frees within a second and the waiter starts.
- **IF** the lock dir cannot be written **→ THEN** the gate refuses with the path and reason, exit 4, no test verdict.
- **WHEN** a push or a shipped subagent prompt runs the full gate **→ THEN** it goes through `bkit tests run` and queues on the `tests` lock the same way.

### Concrete Example

**Setup:** Agent A runs `/bkit-build` for FID `724-x` in worktree `bkit/.worktrees/724-x`; agent B runs `/bkit-debug` in a consumer checkout on the same 10-core laptop. Default `BKIT_TEST_SLOTS` (1).

**Steps:**

1. Agent B's Step 3 block runs `bkit tests run --gate=bkit:gate:static-unit-integration …` → engine takes the `tests` lock (`~/.cache/bkit/machine-lock/tests.lock`), exports `BKIT_TEST_WORKERS=10`, runs the gate.
2. Agent A's group-gate block runs `bkit tests run …` 20 s later → engine waits; the log gets `[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 724-x build-group-gate-1 is waiting for the tests lock: in use by bkit tests run … — /path/to/consumer (pid 4242, since 10:31:07)`.
3. 60 s pass with B's gate still running → A's call exits 81, printing B's holder line and `lockHolder` → A ends its turn and re-runs the block.
4. B's gate finishes → lock frees → A's re-run takes the lock and runs its gate.
5. Meanwhile A's TASK runner runs `bkit tests red --file=…` → runs at once; no lock line in its output.

**Outcome:** the two gates never overlap; A's log and its 81 hand-back both name B's run; A's single-file red never waited.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holder process killed mid-gate | Lock frees within a second (perl holder sees its parent change); the waiter starts |
| `BKIT_TEST_SLOTS=2`, three gates start | Two run, each with `BKIT_TEST_WORKERS` = cores / 2; the third waits naming both holders |
| `BKIT_TEST_SLOTS` not a whole number >= 1 | Falls back to 1 and says so once on stderr |
| Gate run inside `bkit tests run` reaches vitest's global setup | Sees `LOCAL_STACK_LOCK_OWNER_tests` alive, does not wait on its own parent |
| `vitest run integration.test` (a filter, not a file path) | Heavy run: takes the tests lock |
| `vitest run path/to/one.test.ts` (every filter is an existing file) | Light run: no lock |
| Run needs tests lock and the stack lock | Takes tests first, then stack; never the reverse |
| Consumer still on the old copy, bkit upgraded | Old copy keeps working; its unnamed stack lock and the new script's share one lock file |
| Lock dir `~/.cache/bkit/machine-lock/` not writable | Gate refuses with the path and the reason; exit 4 (could not run), not a test failure |
| Plan-added: a process already holding the stack lock or another named lock asks for the `tests` lock | Refused at once, naming the lock order; `run` exits 73; nothing waits |
| Plan-added: `--lock-wait-s` not a whole number >= 0 | Usage error, exit 2; no gate runs |
| Plan-added: `--lock-wait-s=0` | One try: held → exit 81 naming the holder at once |
| Plan-added: the gate itself exits 75 (no lock give-up line in the log) | Read as the gate's exit: verdict FAIL, exit 1, never 81 |
| Plan-added: `vitest` in watch mode (no `run`) | No lock: a watch session would hold it for hours |
| Plan-added: `/usr/bin/perl` missing | Refused like an unwritable lock dir: exit 4 naming the reason (Open Question 2) |
| Plan-added: `bkit tests run` with `CI` set | Gate runs directly; the lock script is not spawned |
| Plan-added: a gate's own nested lock gives up (exit 75, give-up line for a lock other than this run's `tests` lock) | Read as the gate's exit: verdict FAIL, exit 1, never 81 |
| Plan-added: a child of a `tests` holder needs the unnamed stack lock | Waits on the stack lock as usual, under this script and under an older copy |
| Plan-added: a push (pre-push hook) or a shipped subagent prompt starts the full gate while another gate holds the lock | Its `bkit tests run` waits `--lock-wait-s`, then exits 81 naming the holder: the push stops, the subagent re-runs (Open Question 6) |
| Plan-added: a heavy raw vitest run in bkit's repo with no TTY (agent tool call) finds the lock held | Waits at most 60 s, then fails naming the holder (Open Question 7) |
| Plan-added: a host sandbox denies writes to `~/.cache/bkit/` | Same as an unwritable lock dir: exit 4 naming the path (Open Question 8) |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`. All lock tests point `XDG_CACHE_HOME` at a per-test temp dir and clear `CI` / `LOCAL_STACK_LOCK_OWNER*`, so a real run on the machine is never touched or waited on. Subprocess lock tests use `tierTimeouts(true)` budgets (`vitest.timeout-budget.ts`) and poll for holder files, never fixed sleeps (`docs/knowledge.jsonl` `spawn-heavy-unit-suite-needs-its-own-budget-under-load`).

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a named lock is machine-wide: checkouts of two different repos wait on the same named lock | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| one process holds a named lock and the unnamed stack lock side by side | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a named-lock holder does not wait on that named lock | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run --lock` holds the named lock for the command and passes its exit status on | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 75 when the wait gives up, distinct from the command's own failure | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 73 naming the path when the lock dir cannot be written (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 73 naming /usr/bin/perl when perl is missing (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a killed tests-lock holder frees its slot within a second and the waiter starts (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking the tests lock while holding the stack lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking the tests lock while holding another named lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| taking a named lock while holding the stack lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a child of a stack-lock holder asking for the tests lock is refused, naming the lock order (plan-added) | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 2 |
| a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate (plan-added) | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
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
| every tests run call site routes exit 81 to a re-run of its block (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 6 |
| the push gate runs through bkit tests run with the deepest declared gate first (plan-added) | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| bkit tests run exiting 81 stops the push, naming the holder (plan-added) | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| every shipped prompt runs its test gate through bkit tests run and re-runs on exit 81 (plan-added) | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| a run whose every filter is an existing test file is light and takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| a run started under a live tests-lock owner takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| CI=true takes no lock | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| CI=1 takes no lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| BKIT_TEST_WORKERS sets maxWorkers when present | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| a watch-mode run takes no lock (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set (plan-added) | Unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 9 |
| the global setup waits for a held tests lock and takes it once the holder ends (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 10 |
| the global setup throws naming the holder when the wait gives up (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 10 |
| the global setup's teardown frees the tests lock (plan-added) | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 10 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking changes:**

- **Template renamed:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `.bkit/templates/scripts/ci/bkit-machine-lock.sh`. No migration: adopted copies are the consumer's (any path, any name) and keep working; `syncTemplateCopies` prunes the old name from the consumer's `.bkit/templates/` and the upgrade report prints `removed:`.
- **`bkit tests run` takes a machine-wide lock locally:** a second gate on the same machine now waits (≤ `--lock-wait-s`) and may exit 81; outside `CI` it needs `bash` and `/usr/bin/perl` (missing → exit 4).
- **Lock order refused in reverse** (Open Question 3): a caller holding the stack lock that asks for `tests` is refused (functions return 1, `run` exits 73).
- **`run` exit codes:** a lock wait that gives up exits 75 (was 1); a lock that cannot be taken exits 73 (was 1). Function return codes unchanged.
- **Doc section renamed:** `.bkit/templates.md` § Local stack lock → § Machine lock (rules / prompt references follow).
- **Push gate through `bkit tests run`** (Open Question 6): `.bkit/templates/.husky/pre-push` runs `pnpm bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log=…` in place of the raw gate; the push shows the log tail and stops on exit 81 naming the holder. A consumer's copied hook changes only when re-copied (`CHANGELOG.md` upgrade note).
- **Shipped prompts run their test gate through `bkit tests run`** (Open Question 6): `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`, `bkit-build-plan-verify`, `bkit-debug-failure-soak`, `bkit-ship-conflict-resolve`; exit 81 → the subagent re-runs the call.
- **bkit repo only, no TTY:** a heavy raw vitest run waits at most 60 s for the `tests` lock (Open Question 7), then fails naming the holder.

**Unchanged (compatibility):** functions `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; env `BKIT_LOCAL_STACK`, `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER`, `LOCAL_STACK_LOCK_PID`; the unnamed lock file `~/.cache/bkit/local-stack-lock/<stack>.lock`.

**New names:**

<!-- prettier-ignore -->
| Kind | Name |
| --- | --- |
| Template / dogfood file | `bkit-machine-lock.sh` (`.bkit/templates/scripts/ci/`, `scripts/ci/`) |
| Lock dir | `~/.cache/bkit/machine-lock/` (`$XDG_CACHE_HOME/bkit/` when set); `tests.lock`, `tests.<k>.lock` |
| Env | `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `LOCAL_STACK_LOCK_OWNER_<name>`, `LOCAL_STACK_LOCK_PID_<name>` |
| Lock name | `tests` |
| CLI | `bkit tests run --lock-wait-s`; exit 81; output field `lockHolder` |
| Script CLI | `run "<who>" [--lock <name>] -- <cmd>`; exits 73, 75 |
| Script log prefix | `[machine-lock]` (was `[local-stack-lock]`) |
| Engine export | `wholeNumber` in `.bkit/core/engine/commands/lib.ts`; `classifyLockExit` in `.bkit/core/engine/commands/workflow/tests.ts` |
| Repo files | `vitest.test-lock.ts`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`, `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` |
| Doc section | `.bkit/templates.md` § Machine lock; `docs/testing.md` § Tests lock |

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question 1:** which copy of the lock script `bkit tests run` executes (issue assumption: "no other engine verb executes a copy-and-own template") → human confirms.
  - **Options:** A) the packaged copy at `getTemplatesRoot()/scripts/ci/bkit-machine-lock.sh` — ships in `package.json` `files` (`.bkit/templates`), resolves under `dist/`, tsx and `node_modules` layouts, versioned with the engine, never the consumer's edited copy · B) the consumer's synced `.bkit/templates/` copy — same bytes, but absent until first install and a consumer may delete it · C) an engine-owned second copy under `.bkit/core/` — two files to keep byte-identical
  - **Recommended:** A) packaged copy — one source; `template-path-refs.test.ts` forbids only workflows / prompts naming template paths, not the engine.
  - **Default if unanswered:** A.
- **Open Question 2:** `/usr/bin/perl` missing when a gate needs the lock.
  - **Options:** A) refuse like an unwritable lock dir: `run` exits 73, `bkit tests run` exits 4 naming the reason — the stack lock already refuses without perl; perl ships with macOS, Debian / Ubuntu (`perl-base`) and git-bash · B) run the gate unlocked with one stderr line — Alpine-style hosts keep testing, but the machine-wide promise silently lapses there
  - **Recommended:** A) refuse — one rule for every "could not take the lock" case; `CI` already skips the lock.
  - **Default if unanswered:** A.
- **Open Question 3:** lock order (issue: "never the reverse") — enforced or documented.
  - **Options:** A) enforced: asking for `tests` while this shell or a live parent holds any other lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` exits 73) · B) script header + docs only — a reversed caller waits its full timeout against a peer holding the other lock, then 81-loops
  - **Recommended:** A) enforced — the order becomes an invariant a test pins (TASK 2).
  - **Default if unanswered:** A.
- **Open Question 4:** raw `pnpm test` in bkit's repo with `BKIT_TEST_SLOTS` > 1 — vitest reads `maxWorkers` when the config loads, before the global setup takes the lock.
  - **Options:** A) `maxWorkers` from `BKIT_TEST_WORKERS` only when present (issue row) — runs under `bkit tests run` get their share; raw runs with slots > 1 keep vitest's default width · B) also derive cores / slots in `vitest.test-lock.ts` when absent — second copy of the shell formula · C) take the lock at config load (top-level await) — every config load (IDE extension, `vitest list`, `vitest.unit.config.ts`) can queue
  - **Recommended:** A) — slots > 1 is opt-in and raw runs are bkit-repo only.
  - **Default if unanswered:** A.
- **Open Question 5:** `vitest` watch mode (plan-added; the issue does not mention it).
  - **Options:** A) watch / dev mode takes no lock — an open session would block every gate for hours · B) watch takes the lock like a heavy run — a watch session's re-runs never overlap a gate, but every gate on the machine waits (then exits 81) for as long as the session stays open
  - **Recommended:** A).
  - **Default if unanswered:** A.
- **Open Question 6:** full gates bkit ships outside a workflow block skip the lock in consumer repos — `.bkit/templates/.husky/pre-push` runs `pnpm bkit:gate:static-unit-integration` / `bkit:gate:static-unit` raw (fired by every `bkit branches push`), and `bkit-build-plan-gaps-remediate.md:92`, `bkit-debug-failure-remediate.md:72`, `bkit-build-plan-verify.md:66`, `bkit-debug-failure-soak.md:68`, `bkit-ship-conflict-resolve.md` run `pnpm bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` raw. SC 1 ("Two full test gates … never run at the same time") then fails for pushes and subagent gates — the load in `.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`.
  - **Options:** A) hook and prompts run their gate through `bkit tests run` (TASKS 7, 8) — SC 1 holds for every shipped gate; a push on a busy machine stops after `--lock-wait-s` with exit 81 and must be re-pushed; a consumer's copied hook changes only when re-copied · B) hook through `bkit tests run`, prompts stay raw — smaller prompt change; subagent gates in consumer repos keep overlapping; needs SC 1 narrowed by the human + a `Blocking` deferral · C) neither; the human narrows SC 1 to `bkit tests run` gates + a `Blocking` deferral for both — pushes keep overlapping gates (the friction row stays open)
  - **Recommended:** A) — the only option that meets SC 1 as written.
  - **Default if unanswered:** A.
- **Open Question 7:** a heavy raw vitest run in bkit's repo started by an agent with no TTY (ad-hoc `pnpm test`, any raw gate left after Open Question 6) waits the script's default 3600 s while another gate holds the lock — past the agent's ~10-minute tool timeout, so the agent sees a killed call, not a holder line.
  - **Options:** A) the global setup passes `LOCAL_STACK_LOCK_WAIT_S` = 60 to its holder when stdin is not a TTY and the variable is unset, then throws naming the holder — the agent sees the holder within a minute and re-runs; a terminal run keeps the 3600 s wait · B) always 60 s — a human's terminal run fails after a minute too · C) keep 3600 s, documented — agent calls time out silently
  - **Recommended:** A) — reuses the script's existing wait variable; no new env name.
  - **Default if unanswered:** A.
- **Open Question 8:** host sandboxes and the lock dir (`.agents/rules.md` § Provider parity). Every local `bkit tests run` writes `~/.cache/bkit/machine-lock/`; a host that limits writes to the workspace denies it. Hosts: Claude Code (sandbox off by default; when on, writes outside the workspace need its write allow-list), Codex (bkit agents run `workspace-write`, `.bkit/providers.md`; outside paths need `sandbox_workspace_write.writable_roots`), OpenCode, Cursor (agent terminal sandbox when enabled), Antigravity, cloud agents (fresh VM; no other gate on the machine) — write scope per host checked by Manual Verification Step 6.
  - **Options:** A) refuse with exit 4 naming the path and the host setting that grants it — matches the issue Edge Case "Lock dir … not writable → exit 4"; a sandboxed host gates nothing until its owner grants `~/.cache/bkit/` · B) run the gate unlocked with one stderr line when the lock dir is unwritable — sandboxed hosts keep gating; the machine-wide promise lapses there and the issue Edge Case changes · C) put the lock under a path every host can write (`$TMPDIR`, the checkout's git dir) — `$TMPDIR` differs per sandboxed session and the git dir is per repo, so locks stop meeting machine-wide
  - **Recommended:** A).
  - **Default if unanswered:** A.
- **Open Question 9:** exit-81 re-run ceiling. A holder that runs 30 minutes means ~30 end-turn / re-run cycles at the 60 s default; a hung holder never frees the lock.
  - **Options:** A) no ceiling, as the CI-dispatch poll (`.bkit/core/.bkit/workflows.md`); the holder line carries pid and start time, so the agent can report a stale holder — a hung holder loops until a human acts · B) cap re-runs (e.g. 10), then the Failure Path naming the holder — bounded, but needs a re-run counter kept across turns and fails real long gates
  - **Recommended:** A) — `.bkit/core/.bkit/workflows.md` states it (TASK 6).
  - **Default if unanswered:** A.
- **Open Question 10:** `BKIT_TEST_WORKERS` at 1 slot. The issue formula floor(cores / slots) gives 10 on the 10-core machine; vitest's own default is cores - 1, so a gate under `bkit tests run` gains one worker.
  - **Options:** A) issue formula floor(cores / slots) — one extra worker while only one gate runs · B) max(1, floor(cores / slots) - 1) — matches vitest's default at 1 slot; departs from the issue formula and the `Derived Test Matrix` row "cores divided by slots" · C) export only when slots > 1 — no change at the default; one more branch
  - **Recommended:** A) — issue text; one worker is noise once only one gate runs.
  - **Default if unanswered:** A.
- **Assumption:** vitest 5.0.3 exposes the CLI filters to a global setup as `project.vitest.config.filters` (`ResolvedConfig.filters?: string[]` confirmed in `node_modules/vitest/dist/chunks/plugin.d.*.d.ts`; runtime read confirmed at TASK 10's red) → wrong: the light rule falls back to `bkit:test:file` exporting a skip variable (issue's fallback); TASK 10 changes `package.json` `bkit:test:file`.
- **Assumption:** vitest 5.0.3 exposes watch mode to a global setup as `project.vitest.config.watch` (runtime read confirmed at TASK 10's red) → wrong: every watch session reads as heavy, takes the lock and blocks gates for hours; TASK 10 then reads watch from `process.argv` (no `run` subcommand).
- **Assumption:** a gate exiting 75 by itself is rare; the engine reads 75 as a lock give-up only when the log's give-up line names the `tests` lock and this run's `<who>` (TASK 4 tests pin it, nested-lock case included) → wrong: none, the check is the guard.
- **Assumption:** consumers re-copy `.bkit/templates/.husky/pre-push` after upgrading (`CHANGELOG.md` upgrade note, TASK 7) → wrong: their pushes keep running the gate raw and overlap other gates until they do.
- **Assumption:** `bash` is on `PATH` wherever `bkit tests run` runs locally (bkit hooks already need it), and the script stays bash 3.2-compatible (stock macOS `/bin/bash`: no associative arrays, `mapfile`, `${var,,}`) → wrong: gates exit 4 "could not run" on that host.
- **Assumption:** `getconf _NPROCESSORS_ONLN` reports cores on macOS and Linux (fallback `nproc`, then `sysctl -n hw.ncpu`, then 1) → wrong: `BKIT_TEST_WORKERS` = 1 and gates run narrow but correct.
- **Assumption:** `vitest.setup.ts` points `XDG_CACHE_HOME` at a per-worker temp dir, so existing in-process `tests run` tests (`tests.test.ts`) only ever take a temp-dir lock → wrong: they queue behind real gates on a busy machine.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays under the agent's 10-minute tool-timeout ceiling → wrong: lower the default.
- **Assumption:** a consumer copy whose lock dir was customised (the copy the named-lock API comes from writes `~/.cache/local-stack-lock/`) shares no lock with the template; SC 5 covers copies that kept the template's path → wrong: that consumer re-adopts the template to share locks.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Verdict | Why |
| --- | --- | --- |
| Decide who runs from live load average / RAM (first issue comment) | Rejected | Load average lags (two agents checking at once both see a quiet machine), counts unrelated work, RAM reads differ per OS (issue decision 1) |
| Hardware-derived slot count (performance vs efficiency cores, RAM) | Rejected | Issue body overrides the comment: default 1 + `BKIT_TEST_SLOTS`; no formula to tune or explain |
| A second lock script beside the stack lock | Rejected | Two flock implementations to keep in step; issue decision 4 extends the existing one |
| Lock implemented in TypeScript inside the engine | Rejected | Node has no `flock`; a different mechanism cannot exclude the shell script's holders, and loses the perl holder's never-stale property |
| Engine runs the consumer's synced or an engine-owned copy of the script | Rejected (Open Question 1) | Absent before install / a second copy to keep identical |
| Lock order documented only | Rejected (Open Question 3) | A reversed caller deadlocks for its whole wait; enforcing makes it testable |
| Take bkit's raw-run lock at vitest config load | Rejected (Open Question 4) | Every config load (IDE, `vitest list`) could queue |

**Future phase:** time one full-width gate twice in a row vs two half-width gates at once on the 10-core machine before changing the slot default from 1 (first issue comment, "to measure").

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Host-level hook (Claude / OpenCode / Codex / Cursor / Antigravity) catching a raw `npx vitest` or any runner in consumer repos | No Success Criterion needs it: SC 1-5 cover full gates through `bkit tests run`, bkit's own raw runs and the script; issue § Out of Scope names it a separate follow-up | follow-up issue; `docs/deferrals.jsonl` `724-host-hook-catches-raw-test-runners` |
| Upstreaming a consumer's `load-gate.mjs` (one runner overlapping its own jobs by projected load + memory pressure) | Solves overlap inside one runner, not between agents; nothing here depends on it | future template; `docs/deferrals.jsonl` `724-upstream-consumer-load-gate` |
| Changing `vitest.timeout-budget.ts`; serialising anything on CI | Issue non-goal; CI runners have one job and the lock no-ops under `CI` | measurement after ship; `docs/deferrals.jsonl` `724-timeout-budget-and-ci-serialisation-unchanged` |
| Shipped gate-script templates (`.bkit/templates.md` § Gate tool scripts) passing `BKIT_TEST_WORKERS` to the consumer's runner (`--maxWorkers`) | No Success Criterion, scenario or matrix row needs it: at the default 1 slot it changes nothing; `.bkit/templates.md` § Machine lock documents the variable for consumers to wire | follow-up once slots > 1 is in use; `docs/deferrals.jsonl` `724-gate-templates-pass-test-workers` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Full-gate timeouts on single tests (`ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`, `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `runs-wait-cli-found-flaky-under-full-gate`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run`) | `docs/failures.jsonl` (OPEN) | the load the tests lock removes; `vitest.config.ts`; pre-push full gate under a concurrent session | keep separate; re-observe after ship — a recurrence with the lock held points at the test, not the machine |
| Pre-push gate flakes under concurrent load block workflow push | `.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push` (MEDIUM, bkit-repo) | the pre-push gate path TASK 7 routes through the tests lock | link from this plan; close after ship once re-observed |
| Flake triage tracker | `#481 — Flake triage (OPEN)` | same flake cluster (`docs/roadmap.md` item 10) | keep separate; link this plan from it once shipped |
| Pre-commit dist check blocks parallel agents | `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN) | parallel-agent contention on one machine, different resource (`dist/`) | keep separate; needs its own design decision |
| bkit-cloud cross-runner concurrency (global ship lock) | `#397 — bkit-cloud concurrency: global ship lock, FID arbitration (OPEN)`; `docs/deferrals.jsonl` `397-external-cross-runner-lock-primitive-ref-or-label-cas` | "lock" vocabulary only — across CI runners, not one machine | keep separate |

## Security & Privacy

- [ ] **New API Route** — n/a: no routes.
- [ ] **New DB Table/Column** — n/a: no database.
- [ ] **Role-Gated Mutation** — n/a.
- [x] **User Input** — `--lock-wait-s` validated in the `tests run` handler (`wholeNumber`, exit 2); `BKIT_TEST_SLOTS` validated in the script (whole number >= 1, else 1 + note); lock names sanitised to `A-Za-z0-9._-` before they reach a path (`A-Za-z0-9_` for env keys).
- [x] **Shell injection** (`docs/security.md` § Shell Injection) — the engine spawns `bash` with an argv array (`spawnSync`, no shell); `<who>`, gate name, fid and step pass as single arguments, never interpolated into a command string; the script passes `<who>` to perl as `@ARGV`.
- [x] **PII** — holder lines hold `<who>`, a local checkout path, pid and time, written only under `~/.cache/bkit/` and to the local log; no repo content.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [ ] **New Secret/Env Var** — n/a: new env names are non-secret settings (Breaking Changes & Naming Review).
- **Lock DoS:** any local process can hold the `tests` lock; worst case a gate waits `--lock-wait-s`, exits 81 and names the holder. Same trust boundary as the existing stack lock (one user's machine).

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no new packages; `package.json` + `pnpm-lock.yaml` untouched.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` → `vitest` / `@vitest/coverage-v8` 5.0.3 → 5.0.5 (patch), `oxlint` 1.87.0 → 1.89.0, `@types/node` 24 → 26, `vite` 6.4.4 → 8.3.5 (majors); none blocks this plan. Toolchain: node v24.16.0 (`engines` >= 24), pnpm 10.34.6 (= `packageManager`), bash 5.3.20 on `PATH` (script must also parse under stock macOS `/bin/bash` 3.2), `/usr/bin/perl` 5.34.1, `getconf _NPROCESSORS_ONLN` = 10.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [x] **User Context:** read access confirmed to every file the runbook names, and to the consumer's adopted copy the named-lock API comes from. No missing user information; human decisions are Open Questions 1-10.
- [x] **Project Context:** read `docs/knowledge.jsonl` `local-pnpm-test-full-parallelism-integration-timeouts-flake`, `spawn-heavy-unit-suite-needs-its-own-budget-under-load`; `docs/failures.jsonl` `subprocess-integration-tests-time-out-at-5000ms-under-high-load`, `install-upgrade-integration-tests-flake-on-default-5s-timeout` and the open `*-timeout-under-full-gate` rows; `docs/decisions.jsonl` (no prior `724-*` row; lock rows `467-*` are workflow locks, unrelated).
- [ ] **Provider parity (lock dir writes):** every host bkit supports must write `~/.cache/bkit/machine-lock/` or refuse with exit 4 naming the setting that grants it — hosts and behaviour in Open Question 8; per-host write scope confirmed by Manual Verification Step 6.
- [x] **Testing & Quality:** tiers per `docs/testing.md` § Which tier does a behaviour need? — lock and engine behaviour cross real bash / perl / flock / subprocess boundaries → Integration, no mocks at the boundary; pure decision helpers and shipped-text guards → Unit. Engine spawned via `requireTsx()` (§ Spawning `bkit` from tests).
- [x] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no secrets. New non-secret env names listed in Breaking Changes & Naming Review.
- [ ] **Schema State:** n/a — no database.
- [x] **Architecture & UI:** `docs/architecture.md` places neither root `vitest.*.ts` helpers nor `scripts/` dogfood copies → TASKS 1 and 10 add tree lines. No UI.
- [x] **Observability:** engine lines use `ctx.log` under the existing `[bkit-tests]` prefix (`logTag`) (`docs/observability.md` § Log Format: no new prefix without a new noun); script lines keep one script-owned prefix (`[machine-lock]`). No audit tables / traces.
- [ ] **Notifications:** n/a — no alerts or toasts.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** applicable rows verified, or `None` justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [ ] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

None — bkit has no database. The only state is lock + holder files under `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/` outside every checkout.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Machine-wide named locks with slots, `run --lock`, lock order | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rl -e 'local-stack-lock' -e 'Local stack lock' . --exclude-dir={node_modules,dist,.git}`; `ls .bkit/templates/scripts/ci`; read the consumer's adopted copy (`take_local_stack_lock "<who>" [name]`, `_lsl_vars`); Node `flock` built-in (none) | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — waits, names holder, never stale, CI no-op; missing named / machine-wide / slotted locks, lock order, distinct `run` exits | NEW | (c) the candidate is a `Supersession Inventory` `DELETE`: renamed and extended in place of it |
| Lock script tests | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -rl 'bkit-local-stack-lock' .bkit/core/engine` | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` — every stack-lock test | NEW | (c) candidate is a `Supersession Inventory` `DELETE`; its tests move here unchanged in intent |
| bkit's adopted copy of the lock | `scripts/ci/bkit-machine-lock.sh` | `ls scripts/ci`; `dogfood-templates.test.ts` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`) | None — bkit adopts no stack lock today | NEW | (a) no candidate; vitest's global setup runs this copy |
| Dogfood registry entry for the renamed template | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | `grep -n 'local-stack-lock' .bkit/core/engine/audits/repo/dogfood-templates.test.ts` | `ADOPTED` map, `identical` entry kind | EXTEND | entry renamed to `scripts/ci/bkit-machine-lock.sh`, `identical` |
| Frozen older copy for the SC 5 compatibility test | `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` | `ls tests/fixtures`; `grep -rl 'bkit-local-stack-lock' tests/` (none) | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — the bytes an adopted consumer copy holds | NEW | (c) the candidate is a `Supersession Inventory` `DELETE`; the fixture freezes its bytes (`git show HEAD:…`) so the compat test meets a real older copy, outside TASK 3's grep scope |
| Engine gate runs under the tests lock | `.bkit/core/engine/commands/workflow/tests.ts` | `find_symbol testsCommand`; `grep -n -e runToLog -e EXIT_COULD_NOT_RUN tests.ts`; `grep -rn '\b81\b' .bkit/core/engine/commands`; `find_symbol getTemplatesRoot` | `testsCommand.verbs.run` + `runToLog` — runs the gate, maps 126/127 to exit 4; `EXIT.AGENT_WAIT` (81, shared code in `lib.ts`) used as is; `getTemplatesRoot()` in `.bkit/core/engine/shared/package-roots.ts` (package `.bkit/templates` under dist / tsx / node_modules) read, unchanged | EXTEND | wrap the gate argv in the lock script's `run`; `classifyLockExit` maps 75 → 81 (give-up line naming `tests` and this run) and 73 → 4; `--lock-wait-s` flag; `lockHolder` output |
| `--lock-wait-s` whole-number parsing | `.bkit/core/engine/commands/lib.ts` | `grep -rn 'const wholeNumber' .bkit/core/engine`; `positiveInt` in `status.ts` (>= 1 only) | `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts` (module-local, `--budget-s`) | EXTEND | move `wholeNumber` to `lib.ts` as an export; `runs.ts` imports it |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — `Unit` tier, in-process `runCommand` (takes TASK 4's unit rows) | NEW | (b) the suffix is the tier contract (`.agents/rules.md` § Naming Conventions; `docs/testing.md` § Tiers: spawning `bkit` via `tsx` = Integration), and its caller `test:coverage:unit` counts `*.test.ts` toward the unit branch floor |
| Workflows route exit 81 from gate blocks | `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md` | `grep -rn 'tests run' .bkit/core/workflows .bkit/core/prompts`; `grep -n 'exit 81' .bkit/core/workflows/*.md` | 3 `tests run` blocks; `**If** exit 80 or 81 → …` route precedent (`bkit-build.md:946`) | EXTEND | add the route line to each block |
| Exit-81 routing guards | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | `ls .bkit/core/engine/audits/workflows`; `grep -ln 'tests run' …/audits/workflows/*.ts`; `grep -n GATE_CALLERS local-gate-audit.test.ts` | `testBlocks` / `callPosition` helpers find every `tests run` block; `GATE_CALLERS` pins every hook / prompt gate call | EXTEND | a route-capture helper (the list after each block's closing fence); one `it` per probe: the route holds `exit 81`; `GATE_CALLERS` entries become `bkit tests run --gate=…` calls |
| Push gate through the tests lock | `.bkit/templates/.husky/pre-push`, `.husky/pre-push` | `grep -n 'bkit:gate' .bkit/templates/.husky/pre-push`; `grep -n '.husky/pre-push' dogfood-templates.test.ts` (`adopted`, region edits) | the hook's gate `if / elif` block (deepest declared gate) | EXTEND | the block becomes one `pnpm bkit tests run --gate=… --gate=… --log=…` call, which picks the deepest declared gate itself |
| Shipped prompts' gate through the tests lock | `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md`, `bkit-debug-failure-soak.md`, `bkit-ship-conflict-resolve.md` | `grep -n 'pnpm bkit:gate' .bkit/core/prompts/*.md` | each prompt's gate step | EXTEND | step runs `bkit tests run --gate=<same gate> --log=…`; exit 81 → re-run |
| Run-wide tests lock for raw vitest runs + heavy / light decision | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` (none); `ls vitest*`; vitest `globalSetup` built-in (`plugin.d.*.d.ts`); Node `process.kill(pid, 0)` liveness probe; `process.stdin.isTTY` | `vitest.setup.ts` — a `setupFiles` entry run in every worker once per test file; `vitest.timeout-budget.ts` — pure timeout maths; `LOCAL_STACK_LOCK_WAIT_S` (script's wait variable, reused for the no-TTY cap) | NEW | (a) no global setup exists; (b) for `vitest.setup.ts`: its contract runs per file in every worker, so a run-wide lock there would be taken N times by its callers (each worker) |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl -e vitest.timeout-budget -e vitest.test-lock .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — asserts only `vitest.timeout-budget.ts` | NEW | (b) extending breaks its contract — one test file per root helper, named after the module it tests (`vitest-timeout-budget.test.ts` ↔ `vitest.timeout-budget.ts`) — and its callers: `docs/testing.md` § Key test files row and `bkit tests red --file` per task address it as the timeout module's test |
| Global setup against a real lock | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | same search | `vitest-test-lock.test.ts` (this plan, `Unit` tier) | NEW | (b) spawns real bash / perl holders → Integration suffix (`.agents/rules.md` § Naming Conventions); the unit file's caller `test:coverage:unit` counts only `*.test.ts` |
| Global setup registration + `maxWorkers` | `vitest.config.ts` | `Read vitest.config.ts`; `vitest.unit.config.ts` merges it | `vitest.config.ts` `test` block | EXTEND | `globalSetup`, `...testWorkers()` |
| Machine lock docs | `.bkit/core/.bkit/templates.md` | `grep -n 'Local stack lock' .bkit/core/.bkit/templates.md` | § Local stack lock + catalog rows (lines 17, 41, 73) | EXTEND | renamed § Machine lock, extended |

## Architecture & Component Changes

Areas: copy-and-own template script, bkit dogfood copy, engine (`bkit tests run`), workflows, pre-push hook template, shipped prompts, bkit's own vitest config, docs.

**Ledger rows:** `724-tests-lock-fixed-slots-not-live-load`, `724-tests-run-lock-wait-exit-81`, `724-light-runs-skip-tests-lock`, `724-machine-lock-script-named-locks-no-migration`, `724-lock-order-tests-named-stack-enforced`, `724-engine-runs-packaged-lock-template`, `724-lock-run-exit-codes-73-75`, `724-vitest-global-setup-holds-tests-lock`, `724-shipped-gate-calls-run-through-tests-run`, `724-host-hook-catches-raw-test-runners`, `724-upstream-consumer-load-gate`, `724-timeout-budget-and-ci-serialisation-unchanged`, `724-gate-templates-pass-test-workers`

### Database Migrations

None

### Template script

#### [NEW] `.bkit/templates/scripts/ci/bkit-machine-lock.sh`

- **Reuse Check:** `Reuse Inventory` row "Machine-wide named locks…" — reason (c), replaces `bkit-local-stack-lock.sh`.
- Body = the current script, kept bash 3.2-compatible, plus:
  - Optional `[name]` on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; per-lock state vars `LOCAL_STACK_LOCK_PID_<key>` / `LOCAL_STACK_LOCK_OWNER_<key>` (`<key>` = name, outside `A-Za-z0-9_` → `_`); no name → unsuffixed `LOCAL_STACK_LOCK_PID` / `LOCAL_STACK_LOCK_OWNER` (API as the consumer's adopted copy).
  - Unnamed stack lock unchanged: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/<stack>.lock`, stack from `BKIT_LOCAL_STACK` else main-checkout folder; holder line names the script's checkout.
  - Named lock: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock` (no repo prefix → machine-wide); holder line names the caller's checkout (`git -C "$PWD" rev-parse --show-toplevel`, else `$PWD`).
  - Slots, `tests` lock only: `BKIT_TEST_SLOTS` whole number >= 1, else 1 + one stderr note. Slot 1 = `tests.lock`, slot k > 1 = `tests.<k>.lock`, so runs with different slot settings still meet on slot 1. The perl holder tries each slot per second; the waiting note and `local_stack_lock_holder tests` list every holder.
  - Taking `tests` exports `BKIT_TEST_WORKERS` = max(1, floor(cores / slots)); cores from `getconf _NPROCESSORS_ONLN`, else `nproc`, else `sysctl -n hw.ncpu`, else 1.
  - Lock order enforced (Open Question 3): asking for `tests` while this shell or a live parent holds any other lock, or for a named lock while holding the stack lock → refused at once, message names the order; function returns 1.
  - Functions return 1 on every refusal (unchanged for `|| exit 1` / `if try_…` callers); `run` maps the refusal kind.
  - `run "<who>" [--lock <name>] -- <cmd> [args…]`: holds the lock for the command, exits with its status; 2 usage; 73 the lock could not be taken (lock dir not writable, no `/usr/bin/perl`, stack unnameable, lock order); 75 the wait gave up (`LOCAL_STACK_LOCK_WAIT_S`, default 3600).
  - Message prefix `[machine-lock]`; give-up line keeps `<who> gave up after <N>s waiting for <label>, in use by <holder>`.
  - `CI=true` / `CI=1` → no-op for every lock (unchanged).
  - Header: purpose, wiring, lock order, slots, exit codes; "a consumer's adopted copy keeps working".

#### [DELETE] `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`

- Renamed + generalised into `bkit-machine-lock.sh`. `syncTemplateCopies` prunes the consumer's `.bkit/templates/` copy on upgrade (`removed:` line); adopted copies elsewhere are the consumer's.

#### [NEW] `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Lock script tests" — reason (c).
- Every test of the old file pointed at the new script (`[local-stack-lock]` → `[machine-lock]` where a string asserts the prefix; none does today) + the TASK 1 / TASK 2 tests. `envFor` also clears `LOCAL_STACK_LOCK_OWNER_*` and `BKIT_TEST_SLOTS`. Older-copy tests run `tests/fixtures/machine-lock/stack-lock-6.0.0.sh`; the missing-perl test runs a temp copy with every `/usr/bin/perl` replaced (`replaceAll`) by a missing path; the stalled-holder helper patches with `replaceAll` too.

#### [NEW] `tests/fixtures/machine-lock/stack-lock-6.0.0.sh`

- **Reuse Check:** `Reuse Inventory` row "Frozen older copy" — reason (c).
- Byte-for-byte `git show HEAD:.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`, taken before TASK 1 deletes it; never edited.

#### [DELETE] `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`

- Its tests move to `machine-lock.integration.test.ts`.

### Dogfood (bkit repo)

#### [NEW] `scripts/ci/bkit-machine-lock.sh`

- **Reuse Check:** `Reuse Inventory` row "bkit's adopted copy" — reason (a).
- Byte-identical copy of the template; pinned `identical` in `dogfood-templates.test.ts`.

#### [MODIFY] `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`

- **Existence Check:** file exists (`ADOPTED` map, line 327 entry).
- `[DELETE]` entry `"scripts/ci/bkit-local-stack-lock.sh": { status: "not-adopted", … }`; `[NEW]` entry `"scripts/ci/bkit-machine-lock.sh": identical`.

### Engine — `bkit tests run`

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** `testsCommand` (line 1205), `runToLog` (line 97) exist.
- `run` verb: new flag `lock-wait-s` (whole number >= 0, default 60; `0` = one try); bad value → `CommandError(EXIT.USAGE)`.
- `CI` = `true` / `1` → gate argv unchanged (script not spawned). Else argv = `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "<who>" --lock tests -- <scriptCommand(gate)>`, env `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s`; `<who>` = `bkit tests run <gate>[ <fid>][ <step>]`. Gate env gains `BKIT_TEST_WORKERS` + `LOCAL_STACK_LOCK_OWNER_tests` from the script.
- Exported pure `classifyLockExit({ exitCode, log, who })` → `gate` | `lock-wait` | `could-not-run`: `lock-wait` only for exit 75 **and** a give-up line naming the `tests` lock **and** this run's `<who>`; `could-not-run` only for exit 73 **and** a `[machine-lock] ❌` line; else `gate`.
- `lock-wait` → no verdict, no artifact; prints the `[machine-lock]` lines; emits `lockHolder`; returns `EXIT.AGENT_WAIT` (81). A 75 with no such line (the gate's own 75, or a nested lock's give-up) → the gate's own exit (FAIL).
- `could-not-run` → exit 4 (`EXIT_COULD_NOT_RUN`), the line (path + reason) logged.
- Output gains `lockHolder` (holder line when the wait gave up, else null). 81 stays out of `exitCodes` (verb codes must sit in `OWN_EXIT_MIN`-`OWN_EXIT_MAX`, 3-79, `conventions.test.ts:74-79`; 81 is the shared `EXIT.AGENT_WAIT` every `--help` already lists); summary names `81 tests lock held`. `red` / `green` unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** PASS-case exact `toEqual` at line ~136.
- Expected output gains `lockHolder: null`; TASK 4's unit rows (`classifyLockExit`, `--lock-wait-s` validation).

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`

- **Existence Check:** `EXIT`, `FlagValue`, `CommandError` exist.
- Gains exported `wholeNumber(v, flag, fallback, min = 0)` moved from `runs.ts`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- **Existence Check:** module-local `wholeNumber` at line 1130.
- Imports `wholeNumber` from `../lib.js`.

#### [DELETE] `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts`

- Moved to `lib.ts`; no second copy.

#### [NEW] `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "`bkit tests run` lock tests" — reason (b).
- Temp consumer checkout with stub `bkit:gate:*` / `bkit:test:file` scripts (node one-liners writing start / end timestamps and their env); real lock holders via the template script; `bkit` spawned through `requireTsx()`; per-test `XDG_CACHE_HOME`; `CI` and `LOCAL_STACK_LOCK_OWNER*` cleared; `tierTimeouts(true)` budgets, holder-file polling.

#### [MODIFY] `dist/`

- Rebuilt with `pnpm build` in each engine-editing commit (`.agents/rules.md` § Engine builds).

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** Step 8 (Plan Verify) sub-step 8 group-gate `Route:` (line ~555) and Step 12 sub-step 2 `Decide` (line ~749) exist.
- Each gains `**If** exit 81 → end turn, re-run this block.` before `**Else**`.

#### [MODIFY] `.bkit/core/workflows/bkit-debug.md`

- **Existence Check:** Step 3 sub-step 1 `Decide` (line ~297).
- Same route line.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`

- **Existence Check:** both exist; `trackers.test.ts:376-380` compares the none render byte for byte.
- Regenerated after the diff is reviewed (`vitest -u`, per the test's comment).

### Shipped hook and prompts

#### [MODIFY] `.bkit/templates/.husky/pre-push`

- **Existence Check:** gate `if / elif` block at lines ~195-205.
- The full-gate branches become `pnpm bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log=<repo tmp>/pre-push-gate.log < /dev/null`; exit 81 → print the holder line and a re-push hint, exit non-zero. Min push (`bkit:gate:min`) and revert (`bkit:gate:static`) branches unchanged.

#### [MODIFY] `.husky/pre-push`

- **Existence Check:** bkit's adopted copy (`dogfood-templates.test.ts` `adopted`, region edits outside the gate block).
- Same gate block as the template.

#### [MODIFY] `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

- **Existence Check:** gate-choice tests `no integration gate declared → the unit gate runs` / `integration gate declared → it runs in place of the unit gate` (lines ~271-283).
- Gate-choice tests assert the `bkit tests run` call's `--gate` order; TASK 7 rows added.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md`, `bkit-debug-failure-soak.md`, `bkit-ship-conflict-resolve.md`

- **Existence Check:** raw gate steps at `:92`, `:72`, `:66`, `:68`, `:79` / `:81`.
- Each step runs `bkit tests run --gate=<same gate> --log=<run log dir>/<prompt>-gate.log`; **If** exit 81 → re-run it; PASS / FAIL read from the verdict.

#### [MODIFY] `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

- **Existence Check:** `GATE_CALLERS` (line ~102), `PROBES` / `testBlocks` (lines ~156-165).
- Route-capture helper (the `Route:` / `Decide` list after each block's closing fence; `testBlocks` returns only the fenced body); TASK 6 and TASK 8 rows; `GATE_CALLERS` pre-push and prompt entries become `bkit tests run --gate=…` calls.

### Vitest (bkit repo only)

#### [NEW] `vitest.test-lock.ts`

- **Reuse Check:** `Reuse Inventory` row "Run-wide tests lock for raw vitest runs" — reasons (a) / (b).
- Pure `testLockDecision({ filters, env, exists, alive, watch })` → `{ take, reason }`: no lock under `CI` (`true` / `1`), a `LOCAL_STACK_LOCK_OWNER_tests` pid that `alive(pid)` confirms (default probe `process.kill(pid, 0)`), watch mode, or when every filter (`:line` suffix stripped) is an existing file; else take.
- Pure `testWorkers(env)` → `{ maxWorkers: n }` when `BKIT_TEST_WORKERS` is a whole number >= 1, else `{}`.
- Pure `testLockWaitS({ env, isTTY })` → `60` when stdin is not a TTY and `LOCAL_STACK_LOCK_WAIT_S` is unset, else unchanged (Open Question 7).
- Default-export global `setup(project)`: reads `project.vitest.config.filters` / `.watch`; on take, spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c 'printf "locked %s\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat >/dev/null'` with `LOCAL_STACK_LOCK_WAIT_S` from `testLockWaitS`, piped stdin and inherited stderr (waiting notes reach the human); resolves on `locked`, sets `process.env.LOCAL_STACK_LOCK_OWNER_tests`; child exit before `locked` → throws naming its exit and the holder line from its stderr. Returned teardown closes stdin and awaits the child. vitest dying closes the pipe → holder exits → lock frees within a second.

#### [MODIFY] `vitest.config.ts`

- **Existence Check:** file exists; `vitest.unit.config.ts` merges it.
- `globalSetup: ["./vitest.test-lock.ts"]`; `...testWorkers()` in `test`.

#### [NEW] `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Heavy / light decision tests" — reason (a).
- Unit tests of `testLockDecision` / `testWorkers` with injected `env` / `exists`; wiring asserted on comment-stripped `vitest.config.ts` text, as `vitest-timeout-budget.test.ts` does.

#### [NEW] `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Global setup against a real lock" — reason (b).
- Calls the default-export `setup` with a plain `{ vitest: { config: { filters: [], watch: false } } }` input against a real holder of the dogfood script; `LOCAL_STACK_LOCK_OWNER_tests` stubbed empty so the outer run's owner does not short-circuit it; per-worker `XDG_CACHE_HOME` from `vitest.setup.ts`; `tierTimeouts(true)` budgets, holder-file polling.

### Docs

- `.bkit/core/.bkit/templates.md` § Local stack lock → § Machine lock (catalog rows 17 / 41 / 73 in TASK 1; section in TASKS 3 / 5) and § Git hooks — Husky push-gate line (TASK 7); `.bkit/core/.agents/rules.md` § Shared local stack, `bkit-build-plan-execute.md`, `bkit-build-plan-gaps-remediate.md` name § Machine lock; `.bkit/instructions.md` re-synced (`pnpm instructions:sync`); `.bkit/core/.bkit/workflows.md` tests-lock bullet; § Tests lock in `.bkit/shared/docs/testing.md` (consumer-facing, inside the shipped block) and the same text in the root `docs/testing.md` `bkit:start` / `bkit:end` block; bkit-only `docs/testing.md` lines (§ Stack, § Key test files) below `bkit:end`; `docs/architecture.md` tree lines; `CHANGELOG.md` `[Unreleased]`; mirrors via `bkit install`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | DELETE | Renamed and generalised; adopted consumer copies are theirs and keep working (TASK 1) |
| `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | DELETE | Tests move with the script (TASK 1) |
| `wholeNumber` (module-local) in `.bkit/core/engine/commands/workflow/runs.ts` | `wholeNumber` export in `.bkit/core/engine/commands/lib.ts` | DELETE | Moved, not copied (TASK 4) |
| `dogfood-templates.test.ts` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`) | entry `scripts/ci/bkit-machine-lock.sh` (`identical`) | DELETE | Template it named is gone (TASK 1) |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/templates.md` | catalog rows (lines 17, 41, 73) name `bkit-machine-lock.sh` (TASK 1); § Local stack lock → § Machine lock: stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` (gates pass it to their runner, e.g. vitest `--maxWorkers`), lock order, `run` exits 73 / 75, adopted copies keep working (TASK 3); light vs heavy runs, `bkit tests run` takes `tests` itself (TASK 5); § Git hooks — Husky: push gate runs through `bkit tests run`, exit 81 stops the push (TASK 7) |
| `.bkit/core/.agents/rules.md` | § Shared local stack names `.bkit/templates.md` § Machine lock (TASK 3) |
| `.bkit/core/prompts/bkit-build-plan-execute.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | Shared local stack line names § Machine lock (TASK 3) |
| `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `bkit-debug-failure-remediate.md`, `bkit-build-plan-verify.md`, `bkit-debug-failure-soak.md`, `bkit-ship-conflict-resolve.md` | gate step runs `bkit tests run`, exit 81 → re-run (TASK 8) |
| `.bkit/instructions.md` | `shared-local-stack` refs + text re-synced with `pnpm instructions:sync` (TASKS 3, 6, 8) |
| `.bkit/core/.bkit/workflows.md` | rationale bullet beside **CI-Dispatch poll**: `bkit tests run` exits 81 while the tests lock is held; every `tests run` block routes 81 → end turn, re-run, no ceiling (Open Question 9) (TASK 6) |
| `.bkit/shared/docs/testing.md` + root `docs/testing.md` `bkit:start` / `bkit:end` block | new § Tests lock (what takes it, what skips it, `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `--lock-wait-s`, exit 81; a raw `bkit:gate:*` chain takes and frees the lock per runner process, and static / bats lanes run unlocked) (TASK 5) |
| `docs/testing.md` below `bkit:end` | § Stack line for `vitest.test-lock.ts` + raw-run rule incl. the no-TTY 60 s cap (TASK 10); § Key test files rows for the new test files and fixture (TASKS 1, 5, 10) |
| `docs/architecture.md` | tree line `scripts/` (adopted template copies, pinned by `dogfood-templates.test.ts`) (TASK 1); `.bkit/templates/` note that `bkit tests run` executes the packaged lock script (TASK 5); tree line `vitest.*.ts` (root test-runner config + helpers) (TASK 10) |
| `CHANGELOG.md` | `[Unreleased]`: template rename + named locks (TASK 3); `bkit tests run` tests lock + exit 81 (TASK 5); pre-push hook template runs its gate through `bkit tests run` — upgrade note: re-copy `.bkit/templates/.husky/pre-push` (TASK 7); shipped prompts run gates through `bkit tests run` (TASK 8) |
| Mirrors (`.bkit/templates.md`, `.agents/rules.md`, `.claude/` / `.cursor/` / `.opencode/` / `.codex/` / `.agents/plugins/` agents and workflows) | regenerated by `bkit install` (TASKS 3, 5, 6, 7, 8) |
| `docs/capabilities.md` | regenerated by `pnpm graph:rollup` when the pre-push graph check asks (new modules) |
| `docs/decisions.jsonl` | 9 `724-*` rows written by this plan (Ledger rows line) |
| `docs/deferrals.jsonl` | 4 `724-*` `Exempt` rows (Out of Scope) |
| `docs/observability.md` | none — no new `[bkit-*]` prefix; engine lines stay under `[bkit-tests]` |
| `docs/data-schema.md`, `docs/design.md`, `docs/technology.md` | none — no schema, UI or new dependency |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | n/a | No database |
| **Code** | `git revert {COMMIT}` per task commit, newest first | Reverting TASKS 7 / 8 then TASK 5 restores unlocked gates; consumers' adopted copies are unaffected either way |
| **Risk window** | Between a release with TASK 1 and one with TASK 5 | The template rename is inert until `bkit tests run` uses it, and the docs saying `bkit tests run` takes the lock land with TASK 5; a consumer upgrading in between only sees `removed:` / `added:` template lines |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: script (Groups 1-2) → engine + workflows (Group 3) → shipped hook + prompts (Group 4) → bkit's own vitest (Group 5). Suggested integration shape (advice only): one PR; one commit per task. Every engine-editing commit carries `pnpm build` output (`dist/`).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Machine lock script — named locks

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide locks and distinct `run` exits
  - **CREATE:** `tests/fixtures/machine-lock/stack-lock-6.0.0.sh`: byte-for-byte `git show HEAD:.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`, written before the delete below; the older copy every compat test runs
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script (bash 3.2-compatible) plus optional `[name]` on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` / `local_stack_lock_file`; named lock at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock`, no repo prefix; `LOCAL_STACK_LOCK_PID_<key>` / `LOCAL_STACK_LOCK_OWNER_<key>` so children skip that named lock only (a named-lock holder never sets the unsuffixed `LOCAL_STACK_LOCK_OWNER`, so its children still wait on the stack lock); named-lock holder line names the caller's checkout; unnamed lock path, names and holder line unchanged; `run "<who>" [--lock <name>] -- <cmd>` exits with the command's status, 2 usage, 73 lock not takeable (unwritable lock dir, no `/usr/bin/perl`), 75 wait gave up; functions still return 1 on every refusal; prefix `[machine-lock]`; header documents API and exits
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test of `local-stack-lock.integration.test.ts` pointed at the new script, `envFor` also clearing `LOCAL_STACK_LOCK_OWNER_*` / `BKIT_TEST_SLOTS`, older-copy cases run the fixture above, missing-perl case runs a temp copy with every `/usr/bin/perl` replaced (`replaceAll`) by a missing path, `tierTimeouts(true)` budgets and holder-file polling, plus the tests below
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` entry `scripts/ci/bkit-local-stack-lock.sh` (`not-adopted`) → `scripts/ci/bkit-machine-lock.sh`: `identical`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: catalog rows at lines 17, 41, 73 name `bkit-machine-lock.sh`, so no row names a deleted file
  - **UPDATE:** `docs/architecture.md`: Package Boundaries tree gains `scripts/` (adopted template copies, pinned by `dogfood-templates.test.ts`)
  - **UPDATE:** `docs/testing.md`: § Key test files rows (below `bkit:end`) for `machine-lock.integration.test.ts` and the `tests/fixtures/machine-lock/` fixture
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates.test.ts` passes, including every carried-over stack-lock test unchanged in intent; `/bin/bash -n .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `cmp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/bkit-machine-lock.sh` exits 0; `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is gone; `git show "$(git merge-base HEAD main)":.bkit/templates/scripts/ci/bkit-local-stack-lock.sh | cmp - tests/fixtures/machine-lock/stack-lock-6.0.0.sh` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` fails on the second repo starting at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side` fails on the second take refusing
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock` fails on the child waiting on its parent
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other` fails on both copies holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on` fails on usage error for `--lock`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` fails on exit 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the path when the lock dir cannot be written` fails on exit 1 with no path
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming /usr/bin/perl when perl is missing` fails on exit 1 naming no reason
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy` fails on the child skipping the stack lock and both holding it at once

<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Slots, lock order and template docs

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Slots, `BKIT_TEST_WORKERS` and the enforced lock order on the `tests` lock
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: `BKIT_TEST_SLOTS` (whole number >= 1, else 1 + one stderr note) gives the `tests` lock slot files `tests.lock`, `tests.<k>.lock`; one perl holder entry point tries each slot per second; waiting note and `local_stack_lock_holder tests` name every holder; taking `tests` exports `BKIT_TEST_WORKERS` = max(1, floor(cores / slots)) (cores: `getconf _NPROCESSORS_ONLN`, `nproc`, `sysctl -n hw.ncpu`, else 1); asking for `tests` while this shell or a live parent holds another lock, or for a named lock while holding the stack lock, is refused at once naming the order (`run` → 73); header documents lock order and slots
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: same bytes as the template
  - **UPDATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: the tests below; the stalled-holder helper patches the perl body with `replaceAll`, so slot logic cannot leave a second perl body unpatched
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `/bin/bash -n` on the template exits 0; `cmp` template vs dogfood copy exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on no stderr note about the fallback
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots` fails on the variable being unset
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a killed tests-lock holder frees its slot within a second and the waiter starts` fails on the waiter still waiting after the holder is killed
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding the stack lock is refused, naming the lock order` fails on the tests lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding another named lock is refused, naming the lock order` fails on the tests lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking a named lock while holding the stack lock is refused, naming the lock order` fails on the named lock being taken
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a child of a stack-lock holder asking for the tests lock is refused, naming the lock order` fails on the child taking the tests lock

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Point every template doc, rule and prompt at § Machine lock
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock → § Machine lock (stack lock, named locks, `tests` lock, slots, `BKIT_TEST_WORKERS` passed to the runner, lock order, `run` exits 73 / 75, a consumer's adopted copy keeps working)
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-execute.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/instructions.md`: `shared-local-stack` refs and text re-synced (`pnpm instructions:show --file` before editing, `pnpm instructions:sync` after)
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — template renamed `bkit-machine-lock.sh`, named machine-wide locks, slots, lock order, `run` exits 73 / 75; adopted copies keep working
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -rln -e bkit-local-stack-lock -e 'Local stack lock' .bkit/core .bkit/templates.md .bkit/instructions.md .agents/rules.md docs/testing.md` finds nothing; `bkit install` regenerates the mirrors and `bkit check` reports no drift; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/tools/instructions.test.ts` passes
  - **TEST FIRST:** n/a — docs, rules and prompt text only; existing template / instructions tests cover the shapes

<!-- bkit:task 3 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: `bkit tests run` takes the tests lock

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `bkit tests run` gains `--lock-wait-s`, `lockHolder` and the lock-exit classification
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `run` verb gains `--lock-wait-s` (whole number >= 0, default 60; bad value → `CommandError(EXIT.USAGE)` with `--lock-wait-s takes a whole number >= 0`); `lockHolder` output field (null until TASK 5 wires the lock); verb summary names `81 tests lock held`; 81 stays out of `exitCodes` (shared `EXIT.AGENT_WAIT`, outside the 3-79 own-code range `conventions.test.ts:74-79` enforces); `red` / `green` unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: adds exported pure `classifyLockExit` `({ exitCode, log, who })` → `gate` | `lock-wait` | `could-not-run` — `lock-wait` only for exit 75 with a `[machine-lock]` give-up line naming the `tests` lock and this run's `<who>`; `could-not-run` only for exit 73 with a `[machine-lock] ❌` line (lock dir or perl); else `gate`
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: exports `wholeNumber` (moved from `runs.ts`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: imports `wholeNumber` from `../lib.js`
  - **DELETE:** `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts`: moved to `lib.ts`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: PASS-case expected output (exact `toEqual`, line ~136) gains `lockHolder: null`; the tests below
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `--budget-s` / exit 81 pattern to mirror
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/runs.test.ts .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/commands/conventions.test.ts` passes; `node dist/cli.js tests run --help` lists `--lock-wait-s`, the output key `lockHolder` and exit 81; `grep -c 'const wholeNumber' .bkit/core/engine/commands/workflow/runs.ts` prints 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run` fails on a tests-lock give-up read as the gate's own FAIL
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81` fails on a nested lock's give-up read as a tests-lock wait
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4` fails on the refusal read as a test FAIL
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate` fails on the generic unknown-flag error with no `--lock-wait-s takes a whole number >= 0` message

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Gate runs take the tests lock through the packaged script; single-file runs do not
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: outside `CI` (`true` / `1`) the gate argv becomes `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "bkit tests run <gate>[ <fid>][ <step>]" --lock tests -- <gate argv>` with `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s`; `classifyLockExit` → `lock-wait`: print the `[machine-lock]` lines, emit `lockHolder`, no artifact, return `EXIT.AGENT_WAIT`; → `could-not-run`: `EXIT_COULD_NOT_RUN` naming path + reason; `red` / `green` unchanged
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: where the packaged template lives in a consumer install
  - **READ:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: argv + env the gate runs with
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, against real lock holders of the template script and a stub gate (records its start / end and env) in a temp checkout, `bkit` spawned via `requireTsx()`, `tierTimeouts(true)` budgets, holder-file polling
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new § Tests lock (what takes it, what skips it, `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `--lock-wait-s`, exit 81; a raw `bkit:gate:*` chain takes and frees the lock per runner process; static and bats lanes run unlocked)
  - **UPDATE:** `docs/testing.md`: the same § Tests lock inside the `bkit:start` / `bkit:end` block (byte-identical to the shipped source); § Key test files row (below `bkit:end`) for `tests-lock.integration.test.ts`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock gains light vs heavy runs and "`bkit tests run` takes `tests` itself"
  - **UPDATE:** `docs/architecture.md`: `.bkit/templates/` tree note — `bkit tests run` executes the packaged `scripts/ci/bkit-machine-lock.sh`
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` entry — `bkit tests run` holds the machine-wide tests lock, `--lock-wait-s`, exit 81
  - **UPDATE:** `dist/cli.js`: `pnpm build` output (all of `dist/`)
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/runs.test.ts` passes; `node dist/cli.js tests run --help` lists `--lock-wait-s` and exit 81; `bkit install` then `bkit check` reports no drift (shipped `docs/testing.md` block in sync)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on the gate running at once instead of exit 81
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if red is wired to the lock, or on the contrast `tests run --lock-wait-s=0` against the same held lock not exiting 81 (the lock is not really held)
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost, or on the contrast run without `CI` not exiting 81 against the same held lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=1 never waits on a held tests lock` fails on `CI=1` read as unset and the call waiting
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with --lock-wait-s=0 exits 81 at once against a held lock` fails on the gate running at once with the lock held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `a gate that itself exits 75 is a FAIL verdict, not a lock wait` fails on exit 81 for the gate's own 75, or on the gate env lacking `LOCAL_STACK_LOCK_OWNER_tests` (the 75 did not pass through the lock script)
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait` fails on the gate env lacking both variables

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 (group gate) `Route:` and Step 12 sub-step 2 `Decide` gain `**If** exit 81 → end turn, re-run this block.` before `**Else**` (read `.bkit/authoring.md` § Prompts and Workflows + § Workflows Only first; `pnpm instructions:show --file bkit-build.md` before editing sentences)
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3 sub-step 1 `Decide` gains the same route (`pnpm instructions:show --file bkit-debug.md` first)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: rationale bullet beside **CI-Dispatch poll** — `bkit tests run` exits 81 while the machine-wide tests lock is held past `--lock-wait-s`; every `tests run` block routes 81 → end turn, re-run; no re-run ceiling (Open Question 9), the holder line's pid and start time let the agent report a stale holder
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: a helper capturing the `Route:` / `Decide` list after each `tests run` block's closing fence (`testBlocks` returns only the fenced body); the test below, per `PROBES` workflow
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated after reviewing the diff (`vitest -u`, per `trackers.test.ts`)
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: regenerated after reviewing the diff
  - **UPDATE:** `.bkit/instructions.md`: re-synced (`pnpm instructions:sync`) if the route line is a tracked clause
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/tools/instructions.test.ts` passes; `bkit install` regenerates the mirrors and `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every tests run call site routes exit 81 to a re-run of its block` fails on a block whose `Else` sends exit 81 to the Failure Path

<!-- bkit:task 6 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Shipped hook and prompts run gates through `bkit tests run`

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The pre-push hook runs its push gate through `bkit tests run` (Open Question 6)
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the full-gate `elif` / `else` branches become one `pnpm bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log=<repo tmp>/pre-push-gate.log < /dev/null`; exit 81 → print the holder line and a re-push hint, exit non-zero; min-push and revert branches unchanged
  - **UPDATE:** `.husky/pre-push`: the same gate block (bkit's adopted copy; `dogfood-templates.test.ts` region edits unchanged)
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the gate-choice tests (`no integration gate declared → the unit gate runs`, `integration gate declared → it runs in place of the unit gate`) assert the `bkit tests run` call's `--gate` order; the tests below, per hook
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: `GATE_CALLERS` pre-push entry `pnpm bkit:gate:static-unit` → the `bkit tests run --gate=bkit:gate:static-unit` call
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky: the push gate runs through `bkit tests run`; exit 81 stops the push naming the holder
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` — pre-push template runs its gate through `bkit tests run`; upgrade note: re-copy `.bkit/templates/.husky/pre-push`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/audits/templates/templates.test.ts` passes; `bkit install` then `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `the push gate runs through bkit tests run with the deepest declared gate first` fails on the gate called raw through `pnpm bkit:gate:*`
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `bkit tests run exiting 81 stops the push, naming the holder` fails on the push going on, or stopping with no holder line

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Shipped prompts run their test gate through `bkit tests run` (Open Question 6)
  - **READ:** `.bkit/authoring.md`: § Prompts and Workflows + § Prompts Only; then every hit of `grep -rl -e bkit:gate:static-unit -e bkit:gate:install-static-unit-build .bkit/core/workflows .bkit/core/prompts .bkit/core/docs/templates` in full (`.agents/rules.md` § Contract changes)
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: step 8 runs `bkit tests run --gate=bkit:gate:static-unit --log=<run log dir>/gaps-remediate-gate.log`; **If** exit 81 → re-run it; PASS / FAIL from the verdict (`pnpm instructions:show --file bkit-build-plan-gaps-remediate.md` first)
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: step 8, same shape
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: step 7 `Holistic` gate run, same shape
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-soak.md`: step 6 gate run, same shape
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-conflict-resolve.md`: step 9 and its `PASS` line, `--gate=bkit:gate:install-static-unit-build`, same shape
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: `GATE_CALLERS` prompt entries → their `bkit tests run --gate=…` calls; the test below
  - **UPDATE:** `.bkit/instructions.md`: re-synced (`pnpm instructions:sync`)
  - **UPDATE:** `CHANGELOG.md`: `[Unreleased]` — shipped prompts run their gate through `bkit tests run`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `grep -rl -e 'pnpm bkit:gate:static-unit' -e 'pnpm bkit:gate:install-static-unit-build' .bkit/core/prompts` lists only `bkit-utility-compress-markdown.md` (naming examples); `pnpm vitest run .bkit/core/engine/audits/workflows/local-gate-audit.test.ts .bkit/core/engine/tools/instructions.test.ts` passes; `bkit install` then `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every shipped prompt runs its test gate through bkit tests run and re-runs on exit 81` fails on a prompt calling `pnpm bkit:gate:static-unit` raw

<!-- bkit:task 8 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: bkit's own raw vitest runs queue too

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Heavy / light, worker and wait decisions for bkit's raw vitest runs
  - **CREATE:** `vitest.test-lock.ts`: pure `testLockDecision({ filters, env, exists, alive, watch })` (no lock under `CI` = `true` / `1`, a `LOCAL_STACK_LOCK_OWNER_tests` pid `alive(pid)` confirms, watch mode, or when every filter minus a `:line` suffix is an existing file); pure `testWorkers(env)` (`{ maxWorkers }` from a valid `BKIT_TEST_WORKERS`, else `{}`); pure `testLockWaitS({ env, isTTY })` (60 when not a TTY and `LOCAL_STACK_LOCK_WAIT_S` is unset, Open Question 7)
  - **READ:** `unitTimeouts` in `vitest.timeout-budget.ts`: sibling root-helper pattern (pure functions + one config spread)
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the unit tests below, beside `vitest-timeout-budget.test.ts`, with injected `env` / `exists` / `alive` / `isTTY`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run whose every filter is an existing test file is light and takes no lock` fails on a single-file run told to take the lock
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no filters, or a pattern filter, is heavy and takes the tests lock` fails on a full or pattern run told to skip the lock
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run started under a live tests-lock owner takes no lock` fails on a nested run told to take the lock, or a dead owner pid honoured
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=true takes no lock` fails on a CI run told to take the lock
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=1 takes no lock` fails on `CI=1` read as unset
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `BKIT_TEST_WORKERS sets maxWorkers when present` fails on maxWorkers left at vitest's default
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a watch-mode run takes no lock` fails on a watch run being told to take the lock
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set` fails on a no-TTY run left at the script's 3600 s default

<!-- bkit:task 9 end -->
<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **UPDATE:** `vitest.test-lock.ts`: default-export global `setup(project)` that reads `project.vitest.config.filters` / `.watch`, and for a heavy run spawns `bash scripts/ci/bkit-machine-lock.sh run "vitest <filters|all>" --lock tests -- sh -c '…; exec cat >/dev/null'` with `LOCAL_STACK_LOCK_WAIT_S` from `testLockWaitS`, on a piped stdin; resolves on its ready line, exports `LOCAL_STACK_LOCK_OWNER_tests`, throws naming the exit and the holder line if the child ends first, and returns a teardown that closes stdin and awaits the child
  - **UPDATE:** `vitest.config.ts`: `globalSetup: ["./vitest.test-lock.ts"]`; `...testWorkers()` in `test`
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`: the integration tests below, with `LOCAL_STACK_LOCK_OWNER_tests` stubbed empty, `tierTimeouts(true)` budgets, holder-file polling
  - **UPDATE:** `docs/testing.md`: § Stack (below `bkit:end`) names `vitest.test-lock.ts` (heavy raw runs queue, light / watch / CI / nested never wait, no-TTY runs wait at most 60 s); § Key test files rows for `vitest-test-lock.test.ts` and `vitest-test-lock.integration.test.ts`
  - **UPDATE:** `docs/architecture.md`: Package Boundaries tree gains `vitest.*.ts` (root test-runner config + helpers)
  - **DEPENDS ON:** 9
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line naming the first; `pnpm bkit:test:file <one file>` does not wait; `pnpm vitest run` (full suite) passes with the global setup in place
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup waits for a held tests lock and takes it once the holder ends` fails on setup resolving while the lock is held
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup throws naming the holder when the wait gives up` fails on setup hanging, or throwing with no holder line
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `the global setup's teardown frees the tests lock` fails on the lock staying held after teardown

<!-- bkit:task 10 end -->
<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** lock outcomes logged under `[machine-lock]` / `[bkit-tests]` per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** `.bkit/core/engine/commands/workflow/tests.test.ts` (in-process `tests run`, now through the lock script in a per-worker temp `XDG_CACHE_HOME`; PASS output with `lockHolder: null`), `.bkit/core/engine/commands/workflow/runs.test.ts` and `lib.test.ts` (`wholeNumber` move), `.bkit/core/engine/commands/conventions.test.ts` (no 81 in `exitCodes`), `.bkit/core/engine/render/trackers.test.ts` (none-render snapshots), `husky-pre-push.integration.test.ts` gate-choice tests and `local-gate-audit.test.ts` `GATE_CALLERS` green; no E2E suite in bkit.
- [ ] **Dogfood (`.agents/rules.md` § Verify before complete):** `pnpm build && pnpm pack`; install the tarball into a fresh scratch consumer with a `bkit:gate:static-unit` of `sleep 30`; two concurrent `node_modules/.bin/bkit tests run --gate=bkit:gate:static-unit --log=a.log` / `--log=b.log --lock-wait-s=5` → the second exits 81 printing the first's holder line; inspect the on-disk footprint (`~/.cache/bkit/machine-lock/` only).
- [ ] **Build Configuration:** `tsconfig.json` still excludes `**/*.test.ts`; `vitest.test-lock.ts` stays outside `dist/` (root helper, not an engine entry).
- [ ] **Integration (`machine-lock.integration.test.ts`):** its Derived Test Matrix rows + every carried-over stack-lock test; real bash / perl / flock, per-test `XDG_CACHE_HOME`.
- [ ] **Integration (`tests-lock.integration.test.ts`):** its matrix rows; real holders, `bkit` via `requireTsx()`.
- [ ] **Unit (`tests.test.ts`):** lock-exit classification and `--lock-wait-s` rows.
- [ ] **Unit (`local-gate-audit.test.ts`):** exit-81 routing guards (workflow blocks, shipped prompts).
- [ ] **Integration (`husky-pre-push.integration.test.ts`):** push gate through `bkit tests run`, exit 81 stops the push.
- [ ] **Unit + Integration (`vitest-test-lock*.test.ts`):** their matrix rows.
- [ ] **Run all tests:** `pnpm vitest run` (full, never scoped) and `pnpm bkit:test:bats` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Dogfood (`.agents/rules.md` § Verify before complete): `pnpm build && pnpm pack`; install the tarball into a fresh scratch consumer with a slow `bkit:gate:static-unit` (`sleep 30`); run `node_modules/.bin/bkit tests run --gate=bkit:gate:static-unit --log=a.log` in two terminals → the second waits, names the first, and with `--lock-wait-s=5` exits 81 printing the holder.
- [ ] **Step 2:** Cross-repo: start a gate in the scratch consumer and `pnpm test` in a bkit worktree → whichever starts second prints the other's holder line.
- [ ] **Step 3:** `bkit upgrade` an older scratch consumer that copied `bkit-local-stack-lock.sh` to `scripts/ci/` → report shows `removed: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh`; the adopted copy and the new script exclude each other on the unnamed stack lock.
- [ ] **Step 4:** `/bin/bash` 3.2 (stock macOS): `/bin/bash scripts/ci/bkit-machine-lock.sh run t --lock tests -- echo ok` prints `ok`.
- [ ] **Step 5:** `BKIT_TEST_SLOTS=2` with three gates → two run with `BKIT_TEST_WORKERS` = 5 on the 10-core machine, the third names both holders.
- [ ] **Step 6:** Provider parity (Open Question 8): run one `bkit tests run` gate from each host — Claude Code (sandbox on), OpenCode, Codex (`workspace-write`), Cursor, Antigravity — → each either takes the lock or exits 4 naming `~/.cache/bkit/machine-lock/` and the host setting that grants it; record the result per host.
- [ ] **Step 7:** Push from a workflow (`bkit branches push`) while another gate holds the lock → the push stops with exit 81 and the holder line; re-push after the holder ends goes through.
